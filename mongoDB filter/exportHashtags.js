use twitter-database;

db.filteredTweets.aggregate([
	{ $unwind: "$value.hashtags" },
	{
		$project: {
			_id: 1,
			"value.hashtags": 1
		}
	},
	{
		$group: {
			_id: {
				id: "$_id",
				hashtag: "$value.hashtags"
			}
		}
	},
	{ $out: "hashtags" }
])