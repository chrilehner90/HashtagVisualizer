use twitter-database;

function map() {

	var lat = 0;
	var lng = 0;
	var country = null;

	if (this.place) {
		country = this.place.country;
	}

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
			hashtags: this.entities.hashtags,
			longitude: lng,
			latitude: lat,
			lang: this.lang,
			country: country
		}
	);
}

function reduce(key, values) {
	return values[0];
}

db.tweets.mapReduce(map, reduce, {
	query: {
		"$text": {
			"$search": "charliehebdo jesuischarlie"
		}, 
		$or: [ 
			{  
				geo: { 
					$ne: null 
				} 
			}, { 
				coordinates: { 
					$ne: null
				}
			}
		]
	},
	out: "filteredTweets",
	verbose: true
});