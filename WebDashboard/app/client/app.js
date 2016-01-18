let app = angular.module("HashtagVisualizer", ["ngResource"]);

class APIFactory {
  constructor($resource, $q) {
    this.$resource = $resource;
    this.$q = $q;
  }

  getTweets() {
    let deferred = this.$q.defer();

    let TweetResource = this.$resource("/tweets");
    TweetResource.query(function(tweets) {
      deferred.resolve(tweets);
    });

    return deferred.promise;
  }

  getTimeline() {
    let deferred = this.$q.defer();

    let TweetResource = this.$resource("/timeline");
    TweetResource.query(function(tweets) {
      deferred.resolve(tweets);
    });

    return deferred.promise;
  }

  getTime(hour) {
    let deferred = this.$q.defer();

    let TweetResource = this.$resource("/time/" + hour);
    TweetResource.query(function(tweets) {
      deferred.resolve(tweets);
    });

    return deferred.promise;
  }

  getStateFrequencies() {
    let deferred = this.$q.defer();

    let TweetResource = this.$resource("/state-frequencies");
    TweetResource.query(function(tweets) {
      deferred.resolve(tweets);
    });

    return deferred.promise;
  }

  getCountry(country) {
    let deferred = this.$q.defer();

    let TweetResource = this.$resource("/country/" + country);
    TweetResource.query(function(tweets) {
      deferred.resolve(tweets);
    });

    return deferred.promise;
  }

  getCountryTimeline(country) {
    let deferred = this.$q.defer();

    let TweetResource = this.$resource("/country-timeline/" + country);
    TweetResource.query(function(tweets) {
      deferred.resolve(tweets);
    });

    return deferred.promise;
  }

  getCountryAndTime(country, hour) {
    let deferred = this.$q.defer()

    let TweetResource = this.$resource("/country/" + country + "/time/" + hour);
    TweetResource.query(function(tweets) {
      deferred.resolve(tweets);
    });

    return deferred.promise;
  }

  static createInstance($resource, $q) {
    return new APIFactory($resource, $q);
  }
}

class MapController {
  constructor(APIFactory, TweetService, $scope) {
    this.APIFactory = APIFactory;
    this.TweetService = TweetService;
    this.map = L.map('map').fitWorld();
    this.markersLayer = undefined;

    L.Icon.Default.imagePath = "./";

    L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.cssIconBlue = L.divIcon({
      className: 'css-icon-blue',
      iconSize: [10, 10]
    });

    this.cssIconYellow = L.divIcon({
      className: 'css-icon-yellow',
      iconSize: [10, 10]
    });

    this.cssIconPurple = L.divIcon({
      className: 'css-icon-purple',
      iconSize: [10, 10]
    });


    this.$scope = $scope;

    let self = this;

    this.$scope.$watch(function() {
      return self.TweetService.tweets;
    }, 
    function(oldValue, newValue){
      self.addMarkers();
    });

    this.getTweets();
  }

  addMarkers(){
    let tweets = this.TweetService.getTweets();
    if (tweets)
    {
    // let tweets = this.$scope.tweets;
      if (this.markersLayer){
        this.map.removeLayer(this.markersLayer);
      }

      let markers = new L.featureGroup();
      let marker;

      for(let tweet of tweets) {
        
        let popupMessage = '<b>Message: </b>' + tweet.value.text + '<br><b>Timestamp: </b>' + tweet.value.created_at + '<br><b>Country: </b>' + tweet.value.country;

        if (tweet.value.text.toLowerCase().search("charliehebdo") > 0) {
          if (tweet.value.text.toLowerCase().search("jesuischarlie") > 0) {
            marker = L.marker([tweet.value.latitude, tweet.value.longitude], {icon: this.cssIconPurple}).bindPopup(popupMessage);
          }
          else {
            marker = L.marker([tweet.value.latitude, tweet.value.longitude], {icon: this.cssIconBlue}).bindPopup(popupMessage);
          }
        }
        else if (tweet.value.text.toLowerCase().search("jesuischarlie") > 0) {
          marker = L.marker([tweet.value.latitude, tweet.value.longitude], {icon: this.cssIconYellow}).bindPopup(popupMessage);
        }
        markers.addLayer(marker);
      }

      this.map.addLayer(markers); 
      this.markersLayer =  markers; 
    }
  }

  getTweets() {
    let promise = this.APIFactory.getTweets();

    let self = this;
    promise.then(function(tweets) {
      self.TweetService.setTweets(tweets);
      self.addMarkers();
    });
  }
}

class TimelineController{
  constructor(APIFactory, TweetService, $q, $scope){
    this.APIFactory = APIFactory;
    this.TweetService = TweetService;
    this.$q = $q;

    let self = this;
    this.chart = c3.generate(
    {
      bindto: '#timeline',
      data: {
        x: 'x',
        columns: [
          ['x']
        ],
        colors: {'Time': "#000000"},
        onclick: function(e){
          self.setTime(e.x);
          console.log(e);
          d3.selectAll(".c3-circle").classed("inactive", true);
          d3.selectAll(".c3-line").classed("inactive", true);
          d3.selectAll(".c3-circle").classed("active", false);
          d3.select(".c3-circle-" + e.index).classed("inactive", false);
          d3.select(".c3-circle-" + e.index).classed("active", true);
        }
      }
    });

    this.$scope = $scope;

    this.$scope.$watch(function() {
      return self.TweetService.country;
    }, 
    function(oldValue, newValue){
      self.getTimeline();
    });

    this.getTimeline();
  }

  updateTimeline(tweets){
    let hours = [];
    let tweetCount = [];

    hours.push('x');
    tweetCount.push('Time');

    for(let time of tweets) {
      hours.push(time._id.hour);
      tweetCount.push(time.total);
    }

    this.chart.load(
      {
        columns: [
          hours,
          tweetCount
        ]
      });
  }

  getTimeline() {
    let promise = undefined;
    if(this.TweetService.getCountry()) {
      promise = this.APIFactory.getCountryTimeline(this.TweetService.getCountry());
    }
    else {
      promise = this.APIFactory.getTimeline();
    }

    let self = this;
    promise.then(function(tweets) {
      self.updateTimeline(tweets);
    });
  }

  setTime(hour){
    let promise = undefined;
    if(this.TweetService.getCountry()) {
      promise = this.APIFactory.getCountryAndTime(this.TweetService.getCountry(), hour);
    }
    else {
      promise = this.APIFactory.getTime(hour);
    }

    let self = this;
    promise.then(function(tweets) {
      self.TweetService.setTime(hour);
      self.TweetService.setTweets(tweets);
    });
  }

   resetTime() {
     let timelinePromise = this.APIFactory.getTimeline();
     let promise = undefined;

     if(this.TweetService.getCountry()) {
       promise = this.APIFactory.getCountry(this.TweetService.getCountry());
     }
     else {
       promise = this.APIFactory.getTweets();
     }

     let self = this;
     this.$q.all([timelinePromise, promise]).then(function(tweets) {
       self.TweetService.setTime(undefined);
       self.TweetService.setTweets(tweets[1]);
     });
   }

}

class WordcloudController {
  constructor(APIFactory, TweetService) {
    this.APIFactory = APIFactory;
    this.TweetService = TweetService;

    this.getCountries();
  }

  getCountries() {
    let self = this;
    let maxFontSize = 150;

    let promise = this.APIFactory.getStateFrequencies();
    promise.then(function (tweets) {
      let maxTweetCount = tweets[0].size;
      d3.layout.cloud().size([600, 350])
        .words(tweets)
        .rotate(0)
        .padding(1)
        .rotate(function(d) { return 0; })
        .text(function(d) { return d._id; })
        .fontSize(function (d) {return Math.max((d.size / maxTweetCount) * maxFontSize, 10) ;})
        .on("end", draw)
        .start();

      function draw(words) {
        d3.select("#wordcloud").append("svg")
          .attr("width", 600)
          .attr("height", 350)
          .attr("class", "wordcloud")
          .append("g")
          // without the transform, words words would get cutoff to the left and top, they would
          // appear outside of the SVG area
          .attr("transform", "translate(" + 600 / 2 + "," + 350 / 2 + ")")
          .selectAll("text")
          .data(words)
          .enter().append("text")
          .style("font-size", function(d) { return d.size + "px"; })
          .attr("class", "wordcloud-text")
          // .style("font-family", "Impact")
          //.style("fill", function(d, i) { return fill(i); })
          .attr("text-anchor", "middle")
          .on("click", function(d) {
            console.log(d);
            self.setCountry(d._id);
            d3.selectAll(".wordcloud-text").classed("inactive", true);
            d3.selectAll(".wordcloud-text").classed("active", false);
            d3.select(this).classed("inactive", false);
            d3.select(this).classed("active", true);
          })
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")";
          })
          .text(function(d) { return d._id; });
      }
    });
  }

  setCountry(country) {
    let promise = undefined;

    if(this.TweetService.getTime()) {
      promise = this.APIFactory.getCountryAndTime(country, this.TweetService.getTime());
    }
    else {
      promise = this.APIFactory.getCountry(country);
    }

    let self = this;
    promise.then(function(tweets) {
      self.TweetService.setCountry(country);
      self.TweetService.setTweets(tweets);
    });
  }

  resetCountries() {
    let promise = undefined;
    if(this.TweetService.getTime()) {
      promise = this.APIFactory.getTime(this.TweetService.getTime());
    }
    else {
      promise = this.APIFactory.getTweets();
    }

    let self = this;
    promise.then(function(tweets) {
      self.TweetService.setCountry(undefined);
      self.TweetService.setTweets(tweets);

      d3.selectAll(".wordcloud-text").classed("inactive", false);
      d3.selectAll(".wordcloud-text").classed("active", false);
    });
  }
}

class TweetService{
  constructor(){
    this.tweets = undefined;
    this.country = undefined;
    this.time = undefined;
  }

  setTweets(tweets){
    this.tweets = tweets;
  }

  getTweets(){
    return this.tweets;
  }

  setCountry(country) {
    this.country = country;
  }

  getCountry() {
    return this.country;
  }

  setTime(time) {
    this.time = time;
  }

  getTime() {
    return this.time;
  }

  static createInstance() {
    return new TweetService();
  }

}

APIFactory.createInstance.$inject = ["$resource", "$q"];
WordcloudController.$inject = ["APIFactory", "TweetService"];
TimelineController.$inject = ["APIFactory", "TweetService", "$q", "$scope"];
MapController.$inject = ["APIFactory", "TweetService", "$scope"];
// TweetService.createInstance.$inject = ["$scope"];

app.factory("APIFactory", APIFactory.createInstance);
app.controller("MapController", MapController);
app.controller("TimelineController", TimelineController);
app.controller("WordcloudController", WordcloudController);
app.service("TweetService", TweetService.createInstance);