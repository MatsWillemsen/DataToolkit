// goede margins van mbostock (http://bl.ocks.org/mbostock/3019563)
var margin = {top: 50, right: 50, bottom: 50, left: 50},
    width = 1024 - margin.left - margin.right
    height = 400 - margin.top - margin.bottom

var svg = d3.select('.graph').append('svg')
                               .attr('width', width + margin.left + margin.right)
                               .attr('height', height + margin.top + margin.bottom)
                             .append('g')
                               .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var x = d3.time.scale()
        .range([0, width]);

var xaxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')

var y = d3.scale.linear()
        .range([height, 0]);

var yaxis = d3.svg.axis()
            .scale(y)
            .orient('left')

var dataline = d3.svg.line()
               .x(function(dp) {
                 return x(dp['date']);
               })
               .y(function(dp) {
                 return y(dp['temperature']);
               })
               .interpolate('linear');

d3.csv('data/data.csv', function(error, data) {
  data.forEach(function(dp) {
    dp['date'] = d3.time.format('%Y%m%d').parse(dp['date']);
    dp['temperature'] = parseInt(dp['temperature'].trim()) / 10;
  });
  var xdom = d3.extent(data, function(dp) {
    return dp['date'];
  })
  x.domain(xdom);
  var ydom = [0, d3.max(data, function(dp) {
    return dp['temperature'];
  })]
  y.domain(ydom);

  var crosshairs = svg.append('g')
                      .attr('class','crosshairs')
  var xcross = crosshairs.append('line')
                         .attr('class','crosshair')
  var ycross = crosshairs.append('line')
                         .attr('class','crosshair')

  svg.append('g')
     .attr('transform', 'translate(0,' + height + ')')
     .attr('class', 'axis')
     .call(xaxis)

  svg.append('text')
     .attr('text-anchor','middle')
     .attr('transform','translate(' + -30 +',' + height / 2 + ')rotate(-90)')
     .text('Temperatuur')

  svg.append('g')
     .attr('class', 'axis')
     .call(yaxis)

  svg.append('path')
     .attr('class','dataline')
     .attr('d', dataline(data))

  var rect = svg.append('rect')
     .attr('class', 'overlay')
     .attr('width', width)
     .attr('height', height)
     .on('mousemove', function() {
       var m = d3.mouse(this);
       var date = x.invert(m[0])
       var index = d3.bisector(function(dp) {
         return dp['date'];
       }).left(data, date);
       var dp = data[index];
       var xpos = x(dp['date'])
       var ypos = y(dp['temperature'])
       xcross.attr('x1',xpos)
             .attr('y1', y(ydom[0]))
             .attr('x2',xpos)
             .attr('y2', y(ydom[1]))
       ycross.attr('x1', x(xdom[0]))
             .attr('y1', ypos)
             .attr('x2', x(xdom[1]))
             .attr('y2', ypos)
       d3.select('.tooltip')
                .style('left',d3.event.pageX + 20 + 'px')
                .style('top', d3.event.pageY + 20 + 'px')
                .style('opacity','0')
                .transition().duration(1000)
                .style('opacity','0.9')
                .select('p')
                  .text('Temperatuur op '+ d3.time.format('%Y/%m/%d')(dp['date']) + ' was ' + dp['temperature'] + ' ℃')
        d3.select('.tooltip')
                .transition().delay(3000)
                .style('opacity','0')
     })
});
