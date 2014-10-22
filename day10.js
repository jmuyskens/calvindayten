var years = [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014];

function majorChart() {
	var margin = {top: 20, right: 20, bottom: 20, left: 30},
		titleSlot = 'major',
		width = 750,
		height = 1000,
		enrollmentIndividualHeight = 25,
		enrollmentWidth = 200,
		maxEnrollment = 600,
		sparklineWidth = 150,
		currentYearIndex = 9,
		enrollmentScale = d3.scale.linear().domain([0, maxEnrollment]).range([0, enrollmentWidth]),
		enrollmentAxis = d3.svg.axis().scale(enrollmentScale).orient("bottom").tickSize(6, 0),
		sparkline = sparklineChart(),
		sublimeSegmentLength = 20,
		sortData = function(a, b){ return b.values[currentYearIndex].value - a.values[currentYearIndex].value; };


	function make_enrollment_axis() {
      return d3.svg.axis()
        .scale(enrollmentScale)
        .orient("bottom")
        .ticks(8);
    }

	function my(selection) {
		selection.each(function(data) {
			console.log(data);

			data.sort(sortData);

			var enrollmentHeight = enrollmentIndividualHeight * data.length;
			// we should update the scale here, but that's too complicated for now

			var svg = d3.select(this).append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				.on("mousemove", function(){
					var y = d3.mouse(this)[1];
					var i = Math.floor((y - margin.top + 24) / enrollmentIndividualHeight);
					var index = data[i].index;
					//console.log(y - margin.top - 10, i);
					d3.selectAll("g.subCharts").classed("hidden", true);
					d3.selectAll("g.subCharts.sub" + index).classed("hidden", false);
					d3.selectAll("g.major").classed("highlight", false);
					d3.selectAll("g.major.major" + index).classed("highlight", true);
				});

			var enrollmentArea = svg.append("g");

			enrollmentArea.append("rect")
				.attr("transform", "translate(" + sparklineWidth + ",0)" )
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", enrollmentWidth)
				.attr("height", enrollmentHeight)
				.attr("class", "enrollment-area");

			enrollmentArea.append("g")
				.attr("class", "enrollment axis")
				.attr('transform', 'translate(' + sparklineWidth + ',' + 0 + ')')
				.call(make_enrollment_axis().orient("top").ticks(5));

			enrollmentArea.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(" + sparklineWidth + "," + enrollmentHeight + ")")
		      .call(make_enrollment_axis().orient("bottom").ticks(5));

			enrollmentArea.append("g")
		      .attr("class", "grid")
		      .attr("transform", "translate(" + sparklineWidth + "," + enrollmentHeight + ")")
		      .call(make_enrollment_axis().tickSize(0-enrollmentHeight, 0, 0).tickFormat(""));

		   	var majorsHeading = enrollmentArea.append("g");

		   	majorsHeading.append("line")
		   		.attr("class", "separator")
			   	.attr("x1", -17)
			   	.attr("y1", -5)
			   	.attr("x2", 135)
			   	.attr("y2", -5);

			var firstYear = majorsHeading.append("text")
				.attr("x", -17)
				.attr("y", -9)
				.text("2005");

			var lastYear = majorsHeading.append("text")
				.attr("x", 135)
				.attr("y", -9)
				.attr("text-anchor","end")
				.text("2014");

			var majors = enrollmentArea.selectAll("g.major")
				.data(data, function(d){ return d.key; });

			majors
				.enter().append("g")
				.attr("class", function(d, i){ return "major major" + d.index; })
				.attr("transform", function(d, i) { return "translate(0," + (enrollmentIndividualHeight*i + 10) + ")";});

			var subCharts = majors.append("g");

			var subSpark = sublimeChart().sparkSegmentLength(sublimeSegmentLength);

			subCharts
				.attr("class", function(d) { return "subCharts sub" + d.index; })
				.classed("hidden", true)
				.datum(function(d){ return d.subs; })
				.attr("transform", "translate(400, 0)")
				.call(subSpark);

			/*majors.append("g")
				.attr("transform", "translate(" + 0 + ",0)")
				.call(sparkline);*/



			var sparklineArea = majors.append("g")
				.datum(function(d){ return d.values; })
				.call(sparkline);

			d3.selectAll('line.sortline.sort' + currentYearIndex).classed("hidden", false);

			var currentEnrollmentBars = majors.selectAll("rect")
				.data(function(d){ return [d]; });

			currentEnrollmentBars.enter().append("rect")
				.attr("x", 0)
				.attr("y", -9)
				.attr("height", 9)
				.attr("width", function(d, i) { return enrollmentScale(d.values[currentYearIndex].value);})
				.attr("transform", function(d, i) { return "translate(" + sparklineWidth + "," + (enrollmentIndividualHeight*i + 10) + ")";});

			var currentEnrollmentLabels = majors.selectAll("text.currentEnrollmentLabels")
				.data(function(d) { return [d]; });

			currentEnrollmentLabels.enter().append("text")
				.attr("class", "currentEnrollmentLabels highlightable")
				.attr("x", function(d) { return enrollmentScale(d.values[currentYearIndex].value) + 5;})
				.attr("y", 0)
				.text(function(d){ return formTitle[d.key]; })
				.attr("transform", function(d, i) { return "translate(" + sparklineWidth + "," + (enrollmentIndividualHeight*i + 10) + ")";});

			function resortMajors(i) {
				currentYearIndex = i;
				data.sort(sortData);
				majors.sort(sortData);
				d3.selectAll('line.sortline').classed("hidden", true);
				d3.selectAll('line.sortline.sort' + i).classed("hidden", false);

				majors.transition(majors)
		          .duration(750)
		          .delay(function(d, i){ return (i * 20);})
		          //.attr("class", function(d, i){ return "major major" + i; })
		          .attr("transform", function(d, i) { return "translate(0," + (enrollmentIndividualHeight*i + 10) + ")"; });
			}

			function changeYear(i) {
				currentYearIndex = i;
				currentEnrollmentBars.transition().duration(250)
					.attr("width", function(d, i) { return enrollmentScale(d.values[currentYearIndex].value);});
				currentEnrollmentLabels.transition().duration(250)
					.attr("x", function(d, i) { return enrollmentScale(d.values[currentYearIndex].value) + 5;});
			}

			enrollmentArea.selectAll("rect.yearSelect")
				.data(years)
				.enter().append("rect")
				.attr("class","yearSelect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", 10)
				.attr("height", enrollmentHeight)
				.attr("transform", function(d, i) { return "translate(" + (5 + i * 10) + ",0)"; })
				.on("mousedown", function(d, i){ resortMajors(i); })
				.on("mouseover", function(d, i){
					changeYear(i);
					d3.selectAll(".indexline.index" + i).classed("hidden", false);
					d3.selectAll("text.label.end").text(function(d) { return d[i].value; });
					d3.selectAll('.year.year' + i).classed("hidden", false);
					lastYear.text(years[i]);
					subSpark.index(i);
					subCharts.call(subSpark);
					/*
					d3.selectAll(".legendEntry text")
						.text(function(d){ return d.values[i].value + " - " +formTitle[d.key]; });
					d3.selectAll(".sublime circle")
						.attr("cx", currentYearIndex * sublimeSegmentLength)
						.attr("cy", function(d) { return verticalScale(d.values[currentYearIndex].value); });*/

				})
				.on("mouseout", function(d, i){
					d3.selectAll(".indexline.index" + i).classed("hidden", true);
					d3.selectAll('.year.year' + i).classed("hidden", true);
				});

		});

	}

	my.maxEnrollment = function(_) {
		if (!arguments.length) return maxEnrollment;
		maxEnrollment = _;
		enrollmentScale.domain([0, maxEnrollment]);
		return my;
	};

	my.titleSlot = function(_) {
		if (!arguments.length) return titleSlot;
		titleSlot = _;
		return my;
	};

	return my;
}

function sublimeChart() {
	var margin = {top: 5, right: 5, bottom: 5, left: 5},
		width = 180,
		height = 150,
		sparkSegmentLength = 20,
		index = 9,
		showArea = true,
		color = d3.scale.category10(),
		sortData = function(a, b){ return b.values[index].value - a.values[index].value; },
		verticalScale = d3.scale.linear().range([0, height]),
		line = d3.svg.line()
			.x(function(d, i){ return i * sparkSegmentLength; })
			.y(function(d){ return verticalScale(+d.value); }),
		area = d3.svg.area()
			.x(function(d, i){ return i * sparkSegmentLength; })
			.y0(height)
			.y1(function(d){ return verticalScale(+d.value); });

	function my(selection) {
		selection.each(function(data) {

			// data coming in will be an array of major-program objects

			if (data.length > 0) {

				verticalScale.domain([d3.max(data[0].values.map(function(d){return +d.value;})), 0]);

				data.sort(sortData);

				yAxis = d3.svg.axis()
					.scale(verticalScale)
					.orient("left")
					.ticks(5)
					.outerTickSize(0)
					.tickSubdivide(1)
					.tickSize(-width);

				var sparkline = d3.select(this);

				sparkline.selectAll("g.y.axis")
					.data([{}]).enter().append("g")
					.attr("class", "y axis")
					.call(yAxis);

				var year = sparkline.selectAll("text.year")
					.data(years).enter().append("text")
					.attr("class", function(d, i){ return "year year" + i; })
					.classed("hidden", true);

				year.text(function(d, i){ return d;})
					.attr("transform", function(d, i) { return "translate(" + (i * sparkSegmentLength - 10) + "," + (height + 20) + ")"; });

				var yearLine = sparkline.selectAll("line.year")
					.data(years).enter().append("line")
					.attr("class", function(d, i){ return "year year" + i; })
					.attr("x1", function(d, i){ return i * sparkSegmentLength; })
					.attr("x2", function(d, i){ return i * sparkSegmentLength; })
					.attr("y1", 0)
					.attr("y2", height)
					.classed("hidden", true);

				var theLines = sparkline.selectAll("path.line")
					.data(data);

				theLines.enter().append("path")
					.datum(function(d){ return d.values; }, function(d){ return d.key; })
					.attr("class", "line")
					.style("pointer-events", "none")
					.style("stroke", function(d, i){ return color(i); })
					.attr("d", line);

				var theCircles = theLines.selectAll("circle")
					.style("fill", function(d, i) { return color(i); })
					.data(function(d){return d.values;});

				theCircles.enter().append("circle");

				theCircles
					.attr("cx", function(d, i) {i* sparkSegmentLength; })
					.attr("cy", function(d) { return verticalScale(d.value); })
					.attr("r", 2);

				var legendEntries = sparkline.selectAll("text.legendEntry")
					.data(data, function(d){return d.key;});

				legendEntries.enter().append("text")
					.attr("transform", function(d, i) { return "translate(" + (width + 10) + "," + (i * 20 + 10) + ")"; })
					.style("fill", function(d, i){ return color(i); });

				legendEntries
					.attr("class", "legendEntry")

					.text(function(d){ return d.values[index].value + " - " + formTitle[d.key]; });

				legendEntries.transition()
					.duration(250).attr("transform", function(d, i) { return "translate(" + (width + 5) + "," + (i * 20 + 10) + ")"; });


				legendEntries.exit().remove();
			}

		});
	}

	my.height = function(_) {
		if (!arguments.length) return height;
		height = _;
		verticalScale.range([0, height]);
		return my;
	};

	my.index = function(_) {
		if (!arguments.length) return index;
		index = _;
		return my;
	};

	my.showArea = function(_) {
		if (!arguments.length) return showArea;
		showArea = _;
		return my;
	};

	my.sparkSegmentLength = function(_) {
		if (!arguments.length) return sparkSegmentLength;
		sparkSegmentLength = _;
		return my;
	}




	return my;
}

function sparklineChart() {
	var margin = {top: 5, right: 5, bottom: 5, left: 5},
		width = 50,
		height = 15,
		sparkSegmentLength = 11,
		index = 9,
		showArea = true,

		verticalScale = d3.scale.linear().range([0, height]),
		line = d3.svg.line()
			.x(function(d, i){ return i * sparkSegmentLength; })
			.y(function(d){ return verticalScale(+d.value); }),
		area = d3.svg.area()
			.x(function(d, i){ return i * sparkSegmentLength; })
			.y0(height)
			.y1(function(d){ return verticalScale(+d.value); });

	function my(selection) {
		selection.each(function(data) {

			verticalScale.domain([d3.max(data.map(function(d){return +d.value;})), 0]);

			var sparkline = d3.select(this).append("g")
				.attr("class", "sparkline");

			// begin label
			var textBeginLabel = sparkline.selectAll("text.begin.label").data([data[0]], function(d){return d;});

			textBeginLabel.enter().append("text");

			textBeginLabel
				.attr("class", "sparkline label begin")
				.attr("x", 5)
				.attr("y", 0)
				.attr("dy", "0.3em")
				.attr('text-anchor', 'end')
				.text(function(d){return d.value;});

			// end label
			var textEndLabel = sparkline.selectAll("text.end.label").data([data], function(d){"hi";});

			textEndLabel.enter().append("text");

			textEndLabel
				.attr("class", "sparkline label end highlightable")
				.attr("x", sparkSegmentLength * data.length + 4)
				.attr("y", 0)
				.attr("dy", "0.3em")
				.text(function(d) { return d[index].value; });

			if (showArea)
				sparkline.append("path")
					.datum(data)
					.attr("class", "area")
					.style("pointer-events", "none")
					.attr("transform", "translate(10, -8)")
					.attr("d", area);

			var sortLine = sparkline.selectAll("line.sortline").data(data);

			sortLine.enter().append("line");

			sortLine
				.attr("transform", "translate(" + 10 + ",-8)")
				.attr("class", function(d, i) { return "sortline " + "sort" + i; })
				.classed("hidden", "true")
				.attr("x1", function(d, i) { return i * sparkSegmentLength; })
				.attr("y1", function(d, i) { return verticalScale(+d.value); })
				.attr("x2", function(d, i) { return i * sparkSegmentLength; })
				.attr("y2", height);


			sparkline.append("path")
				.datum(data)
				.attr("class", "line")
				.style("pointer-events", "none")
				.attr("transform", "translate(10, -8)")
				.attr("d", line);

			var indexLine = sparkline.selectAll("circle.indexline").data(data);
			indexLine.enter().append("circle");
			indexLine
				.attr("transform", "translate(" + 10 + ",-8)")
				.attr("class", function(d, i) { return "indexline " + "index" + i; })
				.classed("hidden", "true")
				.attr("cx", function(d, i) { return i * sparkSegmentLength; })
				.attr("cy", function(d, i) { return verticalScale(+d.value); })
				.attr("r", 2);


		});
	}

	my.height = function(_) {
		if (!arguments.length) return height;
		height = _;
		verticalScale.range([0, height]);
		return my;
	};

	my.index = function(_) {
		if (!arguments.length) return index;
		index = _;
		return my;
	};

	my.showArea = function(_) {
		if (!arguments.length) return showArea;
		showArea = _;
		return my;
	}


	return my;
}

function lineChart() {
	var margin = {top: 5, right: 5, bottom: 5, left: 5},
		width = 50,
		height = 200,
		max = 3000,
		years = [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014],
		format = d3.format("10d"),
		sparkSegmentLength = 10,
		verticalScale = d3.scale.linear().range([0, height]);

		area = d3.svg.line()
			.x(function(d, i) {
				if (i == 0) {
					return 0;
				} else if (i == years.length + 1) {
					return (years.length - 1) * sparkSegmentLength;
				} else {
					return (i - 1) * sparkSegmentLength;
				}
			})
			.y(function(d){ return verticalScale(d); });

	function my(selection) {
		selection.each(function(data) {


			var line = d3.svg.line()
				.x(function(d, i){ return i * sparkSegmentLength; })
				.y(function(d){ return verticalScale(d); });

			data.data = years.map(function(year){return +data[year]});

			verticalScale.domain([max, 0]).range([0, height]);

			//verticalScale.domain([d3.max(data.data), d3.min(data.data)]);

			var sparkline = d3.select(this).append("g")
				.attr("class", "sparkline chart");

			// begin label
			sparkline.append("text")
				.attr("class", "sparkline label")
				.attr("x", 5)
				.attr("y", verticalScale(data.data[0]))
				.attr("dy", "-0.5em")
				.attr('text-anchor', 'end')
				.text(format(data.data[0]));

			// end label
			sparkline.append("text")
				.attr("class", "sparkline label")
				.attr("x", sparkSegmentLength * data.data.length + 4)
				.attr("y", verticalScale(data.data[data.data.length - 1]))
				//.attr("y", 0)
				.attr("dy", "-0.5em")
				.text(format(data.data[data.data.length - 1]));

			var sline = sparkline
				.append("g")
				.attr("transform", "translate(" + 10 + ",-8)");

			sline
				.append("path")
				.datum(data.data)
				.attr("class", "line")
				.attr("d", line);

			sline.append("path")
				.datum([0].concat(data.data).concat([0]))
				.attr("class", "area")
				.attr("d", area);


		});
	}

	my.height = function(_) {
		if (!arguments.length) return height;
		height = _;
		verticalScale.range([0, height]);
		return my;
	};

	my.max = function(_) {
		if (!arguments.length) return max;
		max = _;
		verticalScale.domain([0, max]);

		return my;
	};

	my.format = function(_) {
		if (!arguments.length) return format;
		format = _;
		return my;
	}

	my.years = function(_) {
		if (!arguments.length) return years;
		years = _;
		return my;
	};

	return my;
}

function percentageChart() {
	var categoryMajor = null;
	var categoryMinor = null;
	var margin = {top:50};
	var chartWidth = 100;
	var chartGap = 60;
	var height = 100;
	var years = [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014];
	var format = d3.format(".2p");

	function my(selection) {
		selection.each(function(data) {

			var width = chartGap + (chartWidth + chartGap) * data.length;
			//console.log("width", width, data.length);

			var myLineChart = lineChart()
				.max(1)
				.height(height)
				.format(format);

			var svg = d3.select(this).append("svg")
				.attr("width", width)
				.attr("height", height + margin.top)
				.append("g")
				.attr("transform","translate(0," + margin.top + ")");

			svg.append("rect")
				.attr("class", "percentageChartFrame")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", chartWidth)
				.attr("height", height);

			svg.selectAll("g.yieldCategory")
				.data(data)
				.enter().append("g")
				.attr("class","yieldCategory")
				.attr("transform", function(d, i) {
					return "translate(" + (chartGap + i * (chartWidth + chartGap)) + ",0)";
				})
				.call(myLineChart);
		});
	}

	my.years = function(_) {
		if (!arguments.length) return years;
		years = _;
		return my;
	};

	return my;
}


function yieldChart() {
	var categoryMajor = null;
	var categoryMinor = null;
	var chartWidth = 100;
	var chartGap = 60;
	var height = 500;

	function my(selection) {
		selection.each(function(data) {

			var width = chartGap + (chartWidth + chartGap) * data.length / 2;

			var myLineChart = lineChart();

			myLineChart.height(height);

			var svg = d3.select(this).append("svg")
				.attr("width", width)
				.attr("height", height);

			svg.selectAll("g.yieldCategory")
				.data(data)
				.enter().append("g")
				.attr("class","yieldCategory")
				.attr("transform", function(d, i) {

					return "translate(" + (chartGap + Math.floor(i/2) * (chartWidth + chartGap)) + ",0)";

				})
				.call(myLineChart);
		});
	}

	return my;
}

function partWholeChart() {
	var categories = [];
	var margins = {top: 5, right: 5, bottom: 5, left: 5};
	var width = 600;
	var height = 400;
	var years = ["2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014"];
	var myPercChart = percentageChart().years(years);

	function my(selection) {
		selection.each(function(data){
			var totals = data[0];
			//console.log(totals);
			var percentageData = [];
			data.forEach(function(d){
				percs = {};
				years.forEach(function(year){
					percs[year] = d[year] / totals[year];
				});
				percentageData.push(percs);
			});

			//console.log(percentageData);

			var svg = d3.select(this).append("svg")
				.attr("width", width)
				.attr("height", height);

			var parts = svg.selectAll("g.parts")
				.data(percentageData);

			parts.enter().append("g");

			parts
				.attr("class", "parts")
				.attr("transform", function(d, i) { return "translate(" + (i * 10) + ",0)";})
				.call(myPercChart);



		});
	}

	my.categories = function(_) {
		if (!arguments.length) return _;
		categories = _;
		return my;
	};

	return my;
}

formTitle = {"male":"Male","female":"Female","korea":"South Korea","us":"United States","can":"Canada","cother":"other","crc":"CRC",
				"rreform":"Other Reformed","pres":"Presbyterian","roprot":"Other Protestant","cath":"Roman Catholic",
				"rother":"Other","rnone":"None/Not specified","art":"Art and Art History","asian":"Asian Studies",
				"bio":"Biology","business":"Business","chem":"Chem. & Biochem.","classics":"Classical Languages",
				"cas":"Comm. Arts","cs":"Computer Science","econ":"Economics","edu":"Education",
				"engr":"Engineering","eng":"English","french":"French","geo":"Geo. & Environ.","ph":"Public Health",
				"germ":"Germanic and Asian Languages","history":"History","idis":"Interdisciplinary","intldev":"Int'l Development",
				"pe":"Kinesiology","math":"Math & Stats","music":"Music","nursing":"Nursing","phil":"Philosophy",
				"phys":"Physics","polisci":"Political Science","psych":"Psychology","ph":"Public Health","religion":"Religion","soc":"Soc. & Social Work",
				"spanish":"Spanish","undecided":"Undecided","stem":"S.T.E.M.","socsci":"Social Sciences",'eng_gen':'English',
				"humanities":"Humanities","lang":"Foreign Languages",
				"arts":"Fine Arts",
                "rnondenom":"Nondenom.",
                              "rbaptist":"Baptist",
                'art_gen': 'Art', 'art_history': 'Art History', 'graphic_design': 'Graphic Design', 'bio_gen': 'Biology', 'biotech': 'Biotechnology', 'occ_therapy': 'Occupational Therapy', 'accountancy': 'Accountancy', 'bus_gen': 'Business', 'grp_busmath': 'Business/Math Group', 'grp_buscas': 'Business/CAS Group', 'orgcomm': 'Organizational Communication', 'grpsocsci': 'Social Science Group', 'chem_gen': 'Chemistry', 'chem_bio': 'Biochemistry', 'classical_studies': 'Classical Studies', 'classical_languages': 'Classical Languages', 'greek': 'Greek', 'latin': 'Latin', 'cas_gen': 'Comm. Arts', 'speech_path': "Speech Path.", 'film_media': 'Film & Media', 'strat_comm': 'Strategic Communication', 'theatre': 'Theatre', 'cs_gen': 'Computer Science', 'is': 'Information Systems', 'digcomm': 'Digital Communcation Group', 'elementaryed': 'Elementary Education', 'specialed': 'Special Education', 'secondaryed': 'Secondary Education', 'graded': 'Graduate Education Programs', 'linguistics': 'Linguistics', 'lit':'Literature', 'writing':'Writing', 'env_geo':'Environmental Geology', 'env_sci':'Environmental Science', 'env_stud':'Environmental Studies', 'geo_gen':'Geology', 'geog':'Geography', 'germdutch':'German/Dutch', 'chinese':'Chinese', 'japanese':'Japanese', 'kin_gen':'Kinesiology', 'physed':'Physical Education', 'recreation':'Recreation', 'music_gen':"Music", 'music_ed':'Music Education', 'polisci_gen':'Political Science', 'ir':'International Relations', 'pa':'Public Administration', 'soc_gen':'Sociology', 'socwork':'Social Work',
                "engr_gen":"Engineering (Gen)", "engr_chem": "Chemical", "engr_civ": "Civil & Environmental", "engr_ee": "Electrical & Computer", "engr_me": "Mechanical",
                "pre-arch":"Architecture","pre-law":"Law","pre-med":"Medicine","pre-occ":"Occup. Therapy","pre-opt":"Optometry","pre-pharm":"Pharmacy","pre-phys":"Physical Therapy","pre-ass":"Physician's Ass't","pre-sem":"Seminary","pre-dent":"Dentistry","mblack":"African American","mhispanic":"Hispanic","masian":"Asian American","mnative":"Native American","mpacific":"Native Hawaiian/Pacific Islander","mtwoplus":"Two or more"};

