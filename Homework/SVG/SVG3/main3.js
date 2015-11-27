var loadPopulation = function() {
  // Alle landen laden. Dit moet, omdat landen of een <g> of een <path> kunnen zijn. Op het hoogste niveau is ieder element een land
  var countries = $('svg').children();
  // ColorBrewer-scale van Anna Schneider gebruikt voor sequentiele data.
  var scale = chroma.scale('YlGnBu');
  // De grootte bepalen van iedere groep
  groups = [0, 1000000, 5000000, 10000000, 50000000, 100000000, 200000000]
  countries.each(function() {
    var tagname = $(this).prop('tagName');
    var id = $(this).attr('id');
    // kijken of het daadwerkelijk g/path-elementen zijn (dus niet title of anderen)
    if(tagname === 'g' || tagname === 'path') {
      // population ophalen via REST-call
      $.ajax({
        url: 'https://restcountries.eu/rest/v1/alpha/' + id
      }).done(function(data) {
        var population = data.population;
        for(var i = 0; i < groups.length - 1; i++) {
          // kijken of de huidige populatie in de groepen zit
          if(groups[i] < population && groups[i + 1] > population) {
            // groepfractie bepalen voor chroma-scale
            var fraction = 1 / (6 - i);
            // de fill maken, en de uiteindelijke chroma-scale maken.
            $('.' + id).css('fill', scale(fraction));
          }
        }
      })
    }
  });
}

/* use this to test out your function */
window.onload = function() {
  loadPopulation();
}
