let express = require("express"),
    mongodb = require("mongodb").MongoClient,
    bodyParser = require("body-parser");

var app = express();

app.set("view engine", "jade");
app.set("views", __dirname + "/views");

// serve assets
app.use(express.static(__dirname + "/client"))
//app.use(bodyParser)

mongodb.connect("mongodb://localhost:27017/twitter-database", function(err, db) {
	if(err) throw err;

	console.log("Server listening to localhost:3000");

	app.get("/", function(req, res) {

		// var tweets = db.collection("tweets").find().toArray();

		res.render("index");

		// tweets.then(function(tweets) {
		// 	res.render("views/index", { tweets: tweets });
		// });
	})


	app.listen(3000);
});
