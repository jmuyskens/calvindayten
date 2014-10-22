d3.csv("religion.csv", function(error, data){

	data.sort(function(a, b) { return b["2014"] - a["2014"]; });

	var chart = majorChart()
		.maxEnrollment(1500)
		.titleSlot("religion");

	d3.select("body")
		.datum(data)
		.call(chart);
});


