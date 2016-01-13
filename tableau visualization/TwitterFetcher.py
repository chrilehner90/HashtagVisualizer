# -*- coding: utf8 -*-

import urllib
import json
import oauth2 as oauth
import sys

import config
import Database

class TwitterFetcher():
    def __init__(self):
        self.base_url = "https://api.twitter.com/1.1/search/tweets.json?q="

        consumer = oauth.Consumer(key=config.CONSUMER_KEY, secret=config.CONSUMER_SECRET)
        access_token = oauth.Token(key=config.ACCESS_TOKEN, secret=config.ACCESS_TOKEN_SECRET)
        self.client = oauth.Client(consumer, access_token)

    def build_query_url(self, hashtags, date):
        query_url = self.base_url
        for index, hashtag in enumerate(hashtags):
            if index < len(hashtags) - 1:
                query_url += urllib.quote(hashtag) + "+OR+"
            else:
                query_url += urllib.quote(hashtag)

        query_url += "&until=" + date
        return query_url

    def fetch_content(self, hashtags, date):
        query_url = self.build_query_url(hashtags, date)
        try:
            headers, response = self.client.request(query_url, method="GET", body="", headers=None)
            content = json.loads(response)
            return content

        except IOError as error:
            print "IOError occurred!"
            print error

if __name__ == "__main__":

    hashtags = [
                "#flu",
                "#grippe",
                "#husten",
                "#schnupfen",
                "#kopfschmerzen",
                "#headache",
                "#cough",
                "#sniff",
                "#krank",
                "#influenza",
                "#husten+AND+#schnupfen",
                "#advent",
                "#christmas",
                "#xmas",
                "#x-mas",
                "#christmas-tree",
                "#weihnachten",
                "#weihnachtsbaum",
                "#present",
                "#geschenke",
                "#presents",
                "#is",
                "#isis",
                "#refugees",
                "#refugee",
                "#zuckerberg",
                "#klimakonferenz",
                "#cop21",
                "#cop21paris",
                "#syria",
                "#syrien",
                "#climatechange"
    ]

    returned_tweets = 0
    inserted_tweets = 0
    twitter_fetcher = TwitterFetcher()
    db = Database.Database()


    for date in ["11-25","11-26","11-27","11-28","11-29","11-30","12-01","12-02","12-03"]:
        date = "2015-" + date

        print "Fetching tweets from: " + str(date),

        for index, hashtag in enumerate(hashtags):
            print "," + str(len(hashtags) - index),
            twitter_content = twitter_fetcher.fetch_content(hashtag, date)
            if "errors" in twitter_content:
                print "\n\nError: " + twitter_content["errors"][0]["message"]
                print "Returned tweets: " + str(returned_tweets)
                print "Inserted tweets: " + str(inserted_tweets)
                sys.exit(1)
            if "statuses" in twitter_content:
                returned_tweets += len(twitter_content["statuses"])
                inserted_tweets += db.save(twitter_content["statuses"])
        print " "

    
    print "Returned tweets: " + str(returned_tweets)
    print "Inserted tweets: " + str(inserted_tweets)