let express = require("express"),
    mongodb = require("mongodb").MongoClient,
    bodyParser = require("body-parser")

var app = express()

app.set("view-engine", "jade");
app.set("views", __dirname + "/views");
//app.use(bodyParser)

MongoClient.connect("mongodb://localhost:27017/twitter-database", function(err, db) {

})