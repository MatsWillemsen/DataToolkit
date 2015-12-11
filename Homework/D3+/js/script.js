var colorCountries = function(countries) {
  choro = {};
  countries.forEach(function(d, i) {
    var scale = chroma.scale('YlGnBu');
    // groepen bepalen voor de totale export
    var groups = [0, 5000, 50000, 100000, 250000, 500000, 1000000, 2500000, 50000000];
    var trade = d.value;
    for(var i = 0; i < groups.length - 1; i++) {
      // kijken of de huidige populatie in de groepen zit
      if(groups[i] < trade && groups[i + 1] > trade) {
        // groepfractie bepalen voor chroma-scale
        var fraction = 1 / (8 - i);
        // de fill maken, en de uiteindelijke chroma-scale maken
        choro[d.key] = scale(fraction).hex()
      }
    }
  });
  return choro;
}

// dataset voor de middelpunten inladen
d3.json('https://restcountries.eu/rest/v1/all', function(error, data) {
  var countrypos = {}
  data.forEach(function(d, i) {
    // middelpunt van een specifieke landcode opslaan
    countrypos[d.alpha3Code] = d.latlng
  });
  // twee datasets voor OUD->NIEUW landcodes. Ook reverse lookup nodig.
  var countrycodes = {}
  var newcountrycodes = {}
  d3.csv('data/countrycode_data.csv', function(error, data) {
    data.forEach(function(d, i) {
      countrycodes[d.cowc] = d.iso3c
      newcountrycodes[d.iso3c] = d.cowc;
    })
  })
  // Het bestand is een space-seperated value. Dit moet gedefinieerd worden.
  var dsv = d3.dsv(' ', 'text/plain');
  var yearFormat = d3.time.format('%Y');
  dsv('data/expdata.asc', function(error, data) {
    // expab / impab zijn automatisch strings, soms beginnend met . Als dit zo is moet hier een 0 voor worden gezet.
    // ook worden ze hierna omgezet naar ints (voor berekeningen in crossfilter)
    data.forEach(function(d, i) {
      d.index = i;
      d.year = yearFormat.parse(d.year);
      if(d.expab[0] == '.') {
        d.expab = '0' + d.expab;
      }
      d.expab = parseInt(d.expab);
      if(d.impab[0] == '.') {
        d.impab = '0' + d.impab;
      }
      d.impab = parseInt(d.impab);
    });
    // de crossfilter wordt aangemaakt
    trades = crossfilter(data);

    // dit zijn de verschillende dimensies / groups.
    // dimensie voor bron-land
    var sourceCountry = trades.dimension(function(d) { return d.acra });
    // group op basis van bron-land
    var sourceCountryGroup = sourceCountry.group().reduceSum(function(d) { return d.expab });
    // group op basis van bron-land én doel-land (voor export en import)
    var sourceDestCountry = trades.dimension(function(d) { return d.acra + ':' + d.acrb});
    // total export van bron- en doelland
    var sourceDestCountryGroupExport = sourceDestCountry.group().reduceSum(function(d) { return d.expab });
    // total import van bron- en doelland
    var sourceDestCountryGroupImport = sourceDestCountry.group().reduceSum(function(d) { return d.impab });
    // jaar-dimensie
    var yearTrades = trades.dimension(function(d) { return d.year });
    // imports per jaar
    var importsPerYear = yearTrades.group().reduceSum(function(d) { return d.impab });
    // exports per jaar
    var exportsPerYear = yearTrades.group().reduceSum(function(d) { return d.expab });

    // kleine barChart om het filteren op basis van tijd mogelijk te maken
    var volumeGraph = dc.barChart('#yearChart')
                        .width(990) // vaste width
                        .height(80) // vaste height, alleen voor filtering, geen echte Y-as nodig
                        .margins({top: 0, right: 50, bottom: 20, left: 80}) // margins instellen
                        .dimension(yearTrades) // bron-dimensie is ruil per land
                        .group(exportsPerYear) // groeperen per land (automatisch wordt filter ingesteld)
                        .centerBar(true) // bars worden gefilterd op basis van hun x-waarde
                        .gap(1) // hoeveel pixels er tussen de bars moet worden gemaakt
                        .x(d3.time.scale().domain([new Date(1948,0,0), new Date(2001,0,0)])) // initiele x-schaal hardcoden (is sneller)
                        .xUnits(d3.time.years) // d3 time units gebruiken
                        .elasticY(true) // Y-as aanpassen als er een filter wordt gekozen

    var linegraph = dc.compositeChart('#stackedChart')
                      .width(990)
                      .height(200)
                      .transitionDuration(1000) // als er andere filters worden gemaakt, dan duurt de chart er een seconde over om dit te verwerken
                      .margins({top: 30, right:50, bottom: 25, left: 80}) // margins instellen
                      .dimension(yearTrades)
                      .mouseZoomable(false) // mouse-zoom werkt niet goed op Macbooks, of Windows-laptops met recentere trackpads (zoals op Microsoft Surface)
                      .rangeChart(volumeGraph) // koppelen aan de range-chart, om op basis van jaar te filteren
                      .x(d3.time.scale().domain([new Date(1948,0,0), new Date(2001,0,0)]))
                      .round(d3.time.year.round) // niet interpoleren tussen de data
                      .xUnits(d3.time.years)
                      .elasticY(true)
                      .renderHorizontalGridLines(true) // horizontale grid-lines tonen
                      .legend(dc.legend().x(700).y(10).itemHeight(13).gap(5)) // legend laten zien van de import- en exportlijnen
                      .brushOn(false)
    linegraph.compose([
                        dc.lineChart(linegraph) // eerste lijn toevoegen aan de grafiek (export-lijn)
                          .colors('red')
                          .group(exportsPerYear, 'Total yearly exports')
                          .valueAccessor(function(d) { return d.value }) // d.value is het resultaat van de MapReduce-functie,
                        dc.lineChart(linegraph)
                          .colors('blue')
                          .group(importsPerYear, 'Total yearly imports')
                          .valueAccessor(function(d) { return d.value })
                      ])
                      .yAxisLabel('Trade (in millions)')
    dc.renderAll() // initiele rendering
    var geo;
    var drawArcs = function() {
      map.svg.selectAll('path.datamaps-arc').remove() // alle voorgaande arcs verwijderen (als ze er zijn)
      var geography = geo; // dit maakt het mogelijk om later te filteren op de data
      sourceCountry.filterExact(newcountrycodes[geography.id]); // crossfilter-filter instellen op basis van huidig land
      $('.country').text(geography.properties.name); // titel van grafiek bijwerken
      dc.redrawAll() // grafieken opnieuw tekenen op basis van de filter
      var exportarcs = []
      var exporttop = sourceDestCountryGroupExport.top(15); // top-15 export pakken vanuit het land
      var importtop = sourceDestCountryGroupImport.top(15); // top-15 export import vanuit het land
      // functie om arcs te maken
      exporttop.forEach(function(d, i) {
        // key is bijvoorbeeld AUS:NLD (bron->doel). Omzetten naar nieuwe landcodes.
        var src = countrycodes[d.key.split(':')[0]]
        var dst = countrycodes[d.key.split(':')[1]]
        // middelpunt bepalen van het bronland
        var srcpos = countrypos[src];
        // middelpunt bepalen van het doelland
        var dstpos = countrypos[dst];
        if(srcpos && dstpos) {
          // arcs toevoegen
          exportarcs.push({
            origin: {
              latitude: countrypos[src][0],
              longitude: countrypos[src][1]
            },
            destination: {
              latitude: countrypos[dst][0],
              longitude: countrypos[dst][1]
            },
            options: {
              strokeWidth: 2,
              greatArc: true
            }
          });
        }
      });
      // zelfe doen voor import, maar de arcs laten beginnen vanuit het doel-land (om import visueel weer te geven)
      importtop.forEach(function(d, i) {
        var src = countrycodes[d.key.split(':')[1]]
        var dst = countrycodes[d.key.split(':')[0]]
        var srcpos = countrypos[src];
        var dstpos = countrypos[dst];
        if(srcpos && dstpos) {
          exportarcs.push({
            origin: {
              latitude: countrypos[src][0],
              longitude: countrypos[src][1]
            },
            destination: {
              latitude: countrypos[dst][0],
              longitude: countrypos[dst][1]
            },
            options: {
              strokeWidth: 2,
              greatArc: true,
              strokeColor: 'rgb(100, 10, 200)'
            }
          });
        }
      });
      // arcs daadwerkelijk tekenen
      map.arc(exportarcs, {
        animationSpeed: 5000
      });
    }
    // datamap later toevoegen (performance-winst)
    var map = new Datamap({
      element: document.querySelector('#map'),
      // dit zorgt er voor dat een resize() call de viewport gebruikt als basis voor een redraw van de map (ipv de inner width)
      responsive: true,
      done: function(datamap) {
        datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
          // de arcs laten zien
          geo = geography;
          drawArcs();
        });
        // pagina is klaar, spinner kan weg.
        $('.loading').hide();
      }
    });
    // kaart kleuren op basis van initiele export-data
    map.updateChoropleth(colorCountries(sourceCountryGroup.all()))
    // zorgen dat de kaart responsive is.
    $(window).on('resize', function() {
      map.resize();
    })
  });
})
