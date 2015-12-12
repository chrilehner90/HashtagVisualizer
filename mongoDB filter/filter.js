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

			var place = null
			if(this.place) {
				place = {
					country_code: this.place.country_code,
					country: this.place.country,
					name: this.place.full_name
				}
			}
			emit(
				this._id,
				{
					_id: this._id,
					text: this.text,
					created_at: this.created_at,
					place: place,
					hashtags: tweetHashtags,
					coordinates: this.coordinates,
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
		geo: {
			$ne: null
		}
	},
	out: "filteredTweets"
});