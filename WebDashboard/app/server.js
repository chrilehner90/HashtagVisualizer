let express = require("express"),
    mongodb = require("mongodb").MongoClient,
    bodyParser = require("body-parser");

let app = express();

app.set("view engine", "jade");
app.set("views", __dirname + "/views");

// serve assets
app.use(express.static(__dirname + "/css"));
app.use(express.static(__dirname + "/client"));
app.use(express.static(__dirname + "/images"));
//app.use(bodyParser)

mongodb.connect("mongodb://localhost:27017/twitter-database", function(err, db) {
	if(err) throw err;

	console.log("Server listening to localhost:3000");

	app.get("/", function(req, res) {
		res.render("index");

	});

	app.get("/tweets", function(req, res) {

		let tweets = db.collection("filteredTweets").find().limit(100).toArray();

		tweets.then(function(tweets) {
			res.json(tweets);
		});
	});

	app.get("/timeline", function(req, res) {

		let tweets = db.collection("filteredTweets").aggregate(
			[
				{
					$project: 
					{
						year: { $year: "$value.created_at" },
						month: {$month: "$value.created_at"},
						day: {$dayOfMonth: "$value.created_at"},
						hour: {$hour: "$value.created_at"}
					}
				},
				{
					$group: 
					{
						_id: {"hour": "$hour"},
						total: { $sum: 1 }
					}
				},
				{ 
					$sort: { "_id.hour": 1 } 
				}
			]
		).limit(1000).toArray();

		tweets.then(function(tweets) {
			res.json(tweets);
		});
	});

	app.get("/state-frequencies", function(req, res) {
		let stateFrequencies = db.collection("filteredTweets").aggregate(
			[
				{
					$project: {
						country: "$value.country"
					}
				},
				{
					$group: {
						_id: "$country",
						size: {
							$sum: 1
						}
					}
				},
				{
					$sort: {
						size: -1
					}
				},
				{
					$limit: 1000
				}
			]).toArray();

		stateFrequencies.then(function(stateFrequencies) {
			res.json(stateFrequencies);
		}, function(error) {
			console.error(error);
		});
	})

	app.listen(3000);
});
