var scale = chroma.scale('YlGnBu');
// De grootte bepalen van iedere groep
var groups = [0, 500000, 3000000, 10000000, 25000000, 250000000, 15000000000]

fillData = {}
populationData = {}
map = new Datamap({
  element: document.querySelector('#datamap'),
  geographyConfig: {
    popupTemplate: function(geography, data) {
      return "<div class='hoverinfo'>\
                <p><strong>" + geography.properties.name + "</strong></p>\
                <p>Population: " + populationData[geography.id] + ' ';
    }
  }
})
d3.json('https://restcountries.eu/rest/v1/all', function(err, data) {
  data.forEach(function(dp) {
    var population = dp.population;
    for(var i = 0; i < groups.length - 1; i++) {
      // kijken of de huidige populatie in de groepen zit
      if(groups[i] < population && groups[i + 1] > population) {
        // groepfractie bepalen voor chroma-scale
        var fraction = 1 / (6 - i);
        // de fill maken, en de uiteindelijke chroma-scale maken
        fillData[String(dp.alpha3Code)] = scale(fraction).hex()
        populationData[String(dp.alpha3Code)] = population
      }
    }
    map.updateChoropleth(fillData);
  });
});
