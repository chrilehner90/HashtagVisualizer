from pymongo import MongoClient
import config

class Database():
    def __init__(self):
        client = MongoClient(config.HOST, config.PORT)
        self.db = client['twitter-database']
        self.tweets = self.db['tweets']

    def save(self, tweets):
        count = 0
        for tweet in tweets:
            query = {"id": tweet["id"]}
            result = self.tweets.update(query, tweet, True)
            if not result["updatedExisting"]:
                count += 1

        print "Inserted tweets: " + str(count)
