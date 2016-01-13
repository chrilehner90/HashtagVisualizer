use twitter-database;

function map() {
	var tags = [
		"flu",
		"grippe",
		"husten",
		"schnupfen",
		"kopfschmerzen",
		"headache",
		"cough",
		"sniff",
		"krank",
		"advent",
		"christmas",
		"xmas",
		"x-mas",
		"christmas-tree",
		"weihnachten",
		"weihnachtsbaum",
		"present",
		"geschenke",
		"presents",
		"isis",
		"refugees",
		"refugee",
		"flüchtlinge",
		"zuckerberg",
		"syria",
		"syrien",
		"climatechange",
		"love",
		"school",
		"university",
		"people",
		"2015"
	];

	for(searchIndex in tags) {
		if(this.text.indexOf(tags[searchIndex]) > -1) {
			tweetHashtags = [];
			for(objectIndex in this.entities.hashtags) {
				tweetHashtags.push(this.entities.hashtags[objectIndex].text)
			}

			var lng = 0;
			var lat = 0;

			// this.coordinates is longitude first, then latitude
			// this.geo (deprecated) seems to be vice versa
			if(this.coordinates) {
				lng = this.coordinates.coordinates[0];
				lat = this.coordinates.coordinates[1];
			}
			else if(this.geo) {
				lng = this.geo.coordinates[1];
				lat = this.geo.coordinates[0];	
			}

			emit(
				this._id,
				{
					_id: this._id,
					text: this.text,
					created_at: new Date(this.created_at),
					hashtags: tweetHashtags,
					longitude: lng,
					latitude: lat,
					lang: this.lang
				}
			)
		}
	}
}

function reduce(key, values) {
	return values[0];
}

db.tweets.mapReduce(map, reduce, {
	query: {
		$or: [
			{ lang: "en" },
			{ lang: "de"}
		],
		$or: [
			{ 
				geo: {
					$ne: null
				}
			},
			{
				coordinates: {
					$ne: null
				}
			}
		]
	},
	out: "filteredTweets",
	verbose: true
});