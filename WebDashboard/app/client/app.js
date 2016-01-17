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
      console.log("TWEETS", tweets);
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
    console.log("i'm here!");
    let promise = this.APIFactory.getTimeline();

    let self = this;
    promise.then(function(tweets) {
      console.log(tweets);
      
      let hours = [];
      let tweetCount = [];

      hours.push('x');
      tweetCount.push('Time');

      for(let time of tweets) {
        console.log(time);
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

//class WordcloudController {
//  constructor(APIFactory) {
//    this.cloud = d3.layout.cloud();
//    this.APIFactory = APIFactory;
//
//    this.getStateFrequencies();
//  }
//
//  draw(words) {
//    d3.select("wordcloud").append("svg")
//      .attr("width", 850)
//      .attr("height", 350)
//      .attr("class", "wordcloud")
//      .append("g")
//      // without the transform, words words would get cutoff to the left and top, they would
//      // appear outside of the SVG area
//      .attr("transform", "translate(320,200)")
//      .selectAll("text")
//      .data(words)
//      .enter().append("text")
//      .style("font-size", function(d) { return d.size + "px"; })
//      //c.style("fill", function(d, i) { return color(i); })
//      .attr("transform", function(d) {
//        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
//      })
//      .text(function(d) { return d.text; });
//  }
//
//  getStateFrequencies() {
//    let promise = this.APIFactory.getStateFrequencies();
//    let self = this;
//    promise.then(function(tweets) {
//      //var frequency_list = [{"text":"study","size":40},{"text":"motion","size":15},{"text":"forces","size":10}];
//​
//      d3.layout.cloud().size([800, 300])
//        .words(frequency_list)
//        .rotate(0)
//        .fontSize(function(d) { return d.size; })
//        .on("end", draw)
//        .start();
//
//        function draw(words) {
//          d3.select("#wordcloud").append("svg")
//            .attr("width", 750)
//            .attr("height", 350)
//            .attr("class", "wordcloud")
//            .append("g")
//            // without the transform, words words would get cutoff to the left and top, they would
//            // appear outside of the SVG area
//            .attr("transform", "translate(320,200)")
//            .selectAll("text")
//            .data(words)
//            .enter().append("text")
//            .style("font-size", function(d) { return d.size + "px"; })
//            // .style("fill", function(d, i) { return color(i); })
//            .attr("transform", function(d) {
//              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
//            })
//            .text(function(d) { return d.text; });
//​        }
//    });
//  }
//}

class WordcloudController {
  constructor(APIFactory) {
    this.APIFactory = APIFactory;

    this.getCountries();
  }

  getCountries() {
    let self = this;

    let promise = this.APIFactory.getStateFrequencies();
    promise.then(function (tweets) {
      d3.layout.cloud().size([900, 350])
        .words(tweets)
        .rotate(0)
        .text(function(d) { return d._id; })
        .fontSize(function (d) {
          return d.size;
        })
        .on("end", draw)
        .start();

      function draw(words) {
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
          .style("font-family", "Impact")
          //.style("fill", function(d, i) { return fill(i); })
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate()";
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