use twitter-database;

db.filteredTweets.aggregate([
	{ $unwind: "$value.hashtags" },
	{
		$project: {
			_id: 0,
			"value.hashtags": 1
		}
	},
	{
		$group: {
			_id: "$value.hashtags",
			sum: {
				$sum: 1
			}
		}
	},
	{ $out: "hashtags" }
])