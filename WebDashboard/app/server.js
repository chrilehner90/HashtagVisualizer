let express = require("express"),
    mongodb = require("mongodb").MongoClient,
    bodyParser = require("body-parser");

var app = express();

app.set("view engine", "jade");
app.set("views", __dirname + "/views");

// serve assets
app.use(express.static(__dirname + "/css"));
app.use(express.static(__dirname + "/client"));
app.use(express.static(__dirname + "/images"));
//app.use(bodyParser)

console.log(__dirname);

mongodb.connect("mongodb://localhost:27017/twitter-database", function(err, db) {
	if(err) throw err;

	console.log("Server listening to localhost:3000");

	app.get("/", function(req, res) {
		res.render("index");

	});

	app.get("/tweets", function(req, res) {

		var tweets = db.collection("filteredTweets").find().limit(1000).toArray();

		tweets.then(function(tweets) {
			res.json(tweets);
		});
	});


	app.listen(3000);
});
