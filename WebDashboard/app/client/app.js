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

  getStateFrequencies() {
    let deferred = this.$q.defer();

    let TweetResource = this.$resource("/state-frequencies");
    TweetResource.query(function(tweets) {
      deferred.resolve(tweets);
    });

    return deferred.promise;
  }

  static createInstance($resource, $q) {
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

    this.getTweets();

  }

  getTweets() {
    let promise = this.APIFactory.getTweets();

    let self = this;
    promise.then(function(tweets) {
      for(let tweet of tweets) {
        if (tweet.value.text.toLowerCase().search("charliehebdo") > 0) {
          if (tweet.value.text.toLowerCase().search("jesuischarlie") > 0) {
            L.marker([tweet.value.latitude, tweet.value.longitude], {icon: self.cssIconPurple}).addTo(self.map).bindPopup('<b>Message: </b>' + tweet.value.text + '<br><b>Timestamp: </b>' + tweet.value.created_at);
          }
          else {
            L.marker([tweet.value.latitude, tweet.value.longitude], {icon: self.cssIconBlue}).addTo(self.map).bindPopup('<b>Message: </b>' + tweet.value.text + '<br><b>Timestamp: </b>' + tweet.value.created_at);
          }
        }
        else if (tweet.value.text.toLowerCase().search("jesuischarlie") > 0) {
          L.marker([tweet.value.latitude, tweet.value.longitude], {icon: self.cssIconYellow}).addTo(self.map).bindPopup('<b>Message: </b>' + tweet.value.text + '<br><b>Timestamp: </b>' + tweet.value.created_at);
        }
      }      
    });


  }
}

class TimelineController{
  constructor(APIFactory){
    this.APIFactory = APIFactory;
    this.chart = c3.generate(
    {
      bindto: '#timeline',
      data: {
        x: 'x',
        columns: [
          ['x']
        ]
      }//,
      // axis: {
      //   x: {
      //       type: 'timeseries',
      //       tick: {
      //           format: '%Y-%m-%d'
      //       }
      //   }
      // }
    });

    this.getTimeline();
  }

  getTimeline() {
    let promise = this.APIFactory.getTimeline();

    let self = this;
    promise.then(function(tweets) {
      let hours = [];
      let tweetCount = [];

      hours.push('x');
      tweetCount.push('Time');

      for(let time of tweets) {
        hours.push(time._id.hour);
        tweetCount.push(time.total);
      }

      console.log(hours);
      console.log(tweetCount);
      self.chart.load(
        {
          columns: [
            hours,
            tweetCount
          ]
        });
    });
  }

}

class WordcloudController {
  constructor(APIFactory) {
    this.APIFactory = APIFactory;

    this.getCountries();
  }

  getCountries() {
    let self = this;

    let promise = this.APIFactory.getStateFrequencies();
    promise.then(function (tweets) {
      console.log("my tweets", tweets);
      console.log("1", tweets[0]);
      let maxSize = tweets[0].size;
      d3.layout.cloud().size([900, 350])
        .words(tweets)
        .rotate(0)
        .padding(1)
        .rotate(function(d) { return 0; })
        .text(function(d) { return d._id; })
        .fontSize(function (d) {return Math.max((d.size / maxSize) * 200, 10) ;})
        .on("end", draw)
        .start();

      function draw(words) {
        console.log("words", words);
        d3.select("#wordcloud").append("svg")
          .attr("width", 900)
          .attr("height", 350)
          .attr("class", "wordcloud")
          .append("g")
          // without the transform, words words would get cutoff to the left and top, they would
          // appear outside of the SVG area
          .attr("transform", "translate(" + 900 / 2 + "," + 350 / 2 + ")")
          .selectAll("text")
          .data(words)
          .enter().append("text")
          .style("font-size", function(d) { return d.size + "px"; })
          .attr("class", "wordcloud-text")
          // .style("font-family", "Impact")
          //.style("fill", function(d, i) { return fill(i); })
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")";
          })
          .text(function(d) { return d._id; });
      }
    });
  }
}

APIFactory.createInstance.$inject = ["$resource", "$q"];

app.factory("APIFactory", APIFactory.createInstance);
app.controller("MapController", ["APIFactory", MapController]);
app.controller("TimelineController", ["APIFactory", TimelineController]);
app.controller("WordcloudController", ["APIFactory", WordcloudController]);