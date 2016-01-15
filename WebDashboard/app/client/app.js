let app = angular.module("HashtagVisualizer", ["ngResource"]);

class APIFactory {
  constructor($resource, $q) {
    this.$resource = $resource;
    this.$q = $q;
  }

  getTweets() {
    console.log("resource", this.$resource)
    console.log("resource", this.$q)

    let deferred = this.$q.defer();

    let TweetResource = this.$resource("/tweets");
    TweetResource.query(function(tweets) {
      deferred.resolve(tweets);
    });

    return deferred.promise;
  }

  static createClass($resource, $q) {
    return new APIFactory($resource, $q)
  }
}

class MapController {
  constructor(APIFactory) {
    this.APIFactory = APIFactory;
    this.map = L.map('map').fitWorld();

    L.Icon.Default.imagePath = "./";

    L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.getTweets();

  }

  getTweets() {
    let promise = this.APIFactory.getTweets();

    let map = this.map;
    promise.then(function(tweets) {
      for(let tweet of tweets) {
        L.marker([tweet.value.latitude, tweet.value.longitude]).addTo(map);
      }
    });


  }
}

APIFactory.createClass.$inject = ["$resource", "$q"];

app.factory("APIFactory", APIFactory.createClass);
app.controller("MapController", ["APIFactory", MapController]);