
function createTransform(domain, range){
	// domain is a two-element array of the domain's bounds
	// range is a two-element array of the range's bounds
	// implement the actual calculation here

	var alpha =  (range[1] - range[0]) / (domain[1] - domain[0])
	var beta = range[0] - (alpha * domain[0])

	return function(x){
		return alpha * x + beta;
	};
}


function drawData() {
	// setting some constants
	var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
	var tempscale = [-5,0,5,10,15,20,25,30]
	var padding = 5;
	var textpos = 20;
	var vpadding = 20;
	var hpadding = 50
	// grabbing the data and the canvas
  canvas = document.querySelector('#canvas');
  context = canvas.getContext("2d");
  data = document.querySelector("#rawdata");
	temperatures = [];
	maxtemp = 0;
	mintemp = 255;
	// parsing the data in the textarea, also setting the min/max temperature
	data.innerHTML.split('\n').forEach(function(e, i, a) {
		// split the data correctly
		var date = e.replace(/\s+\d{3},(\d{4})(\d{2})(\d{2}),\s+([\w-]+)/, '$1/$2/$3,$4')
		// grab the temperature
		var temperature = parseInt(date.split(',')[1]) / 10;
		temperatures.push(temperature);
		if(temperature > maxtemp) {
			maxtemp = temperature;
		}
		if(temperature < mintemp) {
			mintemp = temperature;
			console.log(temperature);
		}
	});
	// setting canvas width and height manually
	canvas.width = 600;
	canvas.height = 500;
	// making the transformations (with the necessary paddings)
	xtransform = createTransform([0,temperatures.length],[hpadding,canvas.width - hpadding]);
	// grabbing the min and max temperature
	ytransform = createTransform([mintemp,maxtemp],[hpadding,canvas.height]);
	context.beginPath();
	context.font = "12px arial"
	context.textAlign = "left"
	// add the months text (and add the necessary padding. Make sure that the text is left-aligned)
	for(var i = 0; i < months.length; i++) {
		var x = (temperatures.length / (months.length - 1)) * i
		context.strokeText(months[i], xtransform(x),canvas.height - padding);
		context.moveTo(xtransform(x), canvas.height - (padding * 3));
		context.lineTo(xtransform(x), canvas.height - (padding * 4));
	}
	context.textAlign = "right"
	// add the temperature scale
	tempscale.forEach(function(e, i, a) {
		context.strokeText(e, textpos, canvas.height - ytransform(e));
		context.moveTo(textpos, canvas.height - ytransform(e) - padding);
		context.lineTo(textpos + (2 * padding), canvas.height - ytransform(e) - padding);
	});

	// add the vertical line
	context.lineTo(textpos + (2 * padding), canvas.height - ytransform(0) - padding);
	context.moveTo(xtransform(0), canvas.height - vpadding);
	// add the horizontal line
	context.lineTo(xtransform(temperatures.length), canvas.height - vpadding);
	// actually draw the graph itself
	temperatures.forEach(function(e, i, a) {
		// make sure to start at the begin point first (to prevent weird lines)
		if(i == 0) {
			context.moveTo(xtransform(i), canvas.height - ytransform(e))
		}
		context.lineTo(xtransform(i),canvas.height - ytransform(e));
	});
	// stroke the lines that are queued
	context.stroke();
}

drawData();
