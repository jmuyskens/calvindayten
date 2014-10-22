d3.csv("enrollment.csv", function(error, data){

	data.sort(function(a, b) { return b["2014"] - a["2014"]; });

	var chart = partWholeChart();

	d3.select("body")
		.datum(data)
		.call(chart);
});


