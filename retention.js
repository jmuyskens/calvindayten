d3.csv("yields.csv", function(error, data){

	var chart = yieldChart();
	var percChart = percentageChart();

	var newData = [];
	var years = ["2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014"];

	for(var i = 0; i < data.length; i += 2) {
		var stuff = {};
		stuff["category"] = data[i]["category"];
		years.forEach(function(year){
			stuff[year] = data[i + 1][year] / data[i][year];
		});
		newData.push(stuff);
	}

	console.log("newdata", newData);

	d3.select("body")
		.datum(data)
		.call(chart);

	d3.select("body")
		.datum(newData)
		.call(percChart);
});


