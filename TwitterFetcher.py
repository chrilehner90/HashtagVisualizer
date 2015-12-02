# -*- coding: utf8 -*-

import urllib
import json
import oauth2 as oauth

import config
import Database

class TwitterFetcher():
    def __init__(self, hashtags, lang="en"):
        print "Constructor"
        self.base_url = "https://api.twitter.com/1.1/search/tweets.json?q="
        self.hashtags = hashtags
        self.lang = lang

        consumer = oauth.Consumer(key = config.CONSUMER_KEY, secret = config.CONSUMER_SECRET)
        access_token = oauth.Token(key = config.ACCESS_TOKEN, secret = config.ACCESS_TOKEN_SECRET)
        self.client = oauth.Client(consumer, access_token)

    def build_query_url(self):
        query_url = self.base_url
        for index, hashtag in enumerate(self.hashtags):
            if index < len(self.hashtags) - 1:
                query_url += urllib.quote(hashtag) + "+OR+"
            else:
                query_url += urllib.quote(hashtag)
        query_url += "&lang=" + self.lang
        query_url += "&until=2015-11-29"
        return query_url

    def fetch_content(self):
        query_url = self.build_query_url()
        try:
            headers, response = self.client.request(query_url, method="GET", body="", headers=None)
            content = json.loads(response)
            return content

        except IOError as error:
            print "IOError occurred!"
            print error

        print query_url

if __name__ == "__main__":
    twitter_fetcher = TwitterFetcher([
        "#flu", 
        "#grippe",
        "#husten",
        "#schnupfen",
        "#kopfschmerzen",
        "#headache",
        "#cough",
        "#sniff",
        "#krank"
        ])
    twitter_content = twitter_fetcher.fetch_content()

    db = Database.Database()
    print "Returned tweets: " + str(len(twitter_content["statuses"]))
    db.save(twitter_content["statuses"])

    
