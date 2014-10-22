d3.csv("data.csv", function(error, data) {

	data = d3.nest()
		.key(function(d) { return d.major; })
		.entries(data);

	subs = {
		'art': ['art_gen', 'art_history', 'graphic_design'],
		'bio': ['bio_gen', 'biotech', 'occ_therapy'],
		'business': ['accountancy', 'business_gen', 'grp_busmath', 'grp_buscas', 'orgcomm', 'grpsocsci'],
		'chem': ['chem_bio', 'chem_gen'],
		'classics': ['classical_studies', 'classical_languages', 'greek', 'latin'],
		'cas': ['speech_path', 'cas_gen', 'film_media', 'strat_comm', 'orgcomm', 'theatre', 'digcomm', 'grp_buscas'],
		'cs': ['cs_gen', 'is', 'digcomm'],
		'edu': ['elementaryed', 'specialed', 'secondaryed', 'graded'],
		'engr': ['engr_gen', 'engr_chem', 'engr_civ', 'engr_ee', 'engr_me'],
		'eng': ['eng_gen', 'linguistics', 'lit', 'writing'],
		'geo': ['env_stud', 'env_geo', 'env_sci', 'geo_gen', 'geog'],
		'germ': ['chinese', 'germdutch', 'japanese'],
		'pe': ['kin_gen', 'physed', 'recreation'],
		'music': ['music_gen', 'music_ed'],
		'polisci': ['polisci_gen', 'ir', 'pa'],
		'soc': ['socwork', 'soc_gen']
	};

	filter = ['art_gen', 'art_history', 'bio_gen', 'biotech', 'occ_therapy', 'accountancy', 'business_gen', 'grp_busmath',
	'grp_buscas', 'orgcomm', 'grpsocsci', 'chem_gen', 'chem_bio', 'classical_studies', 'classical_languages', 'greek', 'latin',
	'cas_gen', 'speech_path', 'film_media', 'strat_comm', 'orgcomm', 'theatre', 'digcomm', 'grp_buscas',
	'cs_gen', 'is', 'elementaryed', 'specialed', 'secondaryed', 'graded', 'engr_gen', 'engr_chem', 'engr_civ', 'engr_ee', 'engr_me',
	'eng_gen', 'linguistics', 'lit', 'writing', 'env_stud', 'env_sci', 'env_geo', 'geo_gen', 'geog', 'germdutch', 'chinese', 'japanese',
	'kin_gen', 'physed', 'recreation', 'music_gen', 'music_ed', 'polisci_gen', 'ir', 'pa', 'soc_gen', 'socwork', 'graphic_design', 'classical_languages'];

	var bisect = d3.bisector(function(d) { return d.key; }).right;

	data.forEach(function(d, i){
		d.index = i;
		var valMap = d3.map(d.values[0]);
		valMap.remove("major");
		d.values = valMap.entries();
	});

	data.forEach(function(d, i){
		if (subs[d.key]) {
			d.subs = subs[d.key].map(function(subProgram){
				for (var j = 0; j < data.length; j++) {
					//console.log(data[i].key, subProgram, data[i].key === subProgram);
					if (data[j].key === subProgram) {
						data[j].index = i;
						//console.log(data[j]);
						return data[j];
					}
				}
			});

			//console.log(d.subs);

		} else {
			d.subs = [];
		}
	});

	data = data.filter(function(d){ return !~filter.indexOf(d.key); });

	var chart = majorChart();

	d3.select("body")
		.datum(data)
		.call(chart);
});


