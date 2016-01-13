import json
import psycopg2
import psycopg2.extras
import sys
import os

import config
import ijson

reload(sys)
sys.setdefaultencoding('utf8')

TWITTER_DATA_PATH = "/media/fabio/DATA/Studium_Master/Visual Analytics/Twitter Data/"


def setup_database(con, cursor):

	cursor.execute("DROP TABLE IF EXISTS Tweets CASCADE")
	cursor.execute("DROP TABLE IF EXISTS Hashtags CASCADE")
	cursor.execute("DROP TABLE IF EXISTS Tweets_Hashtags")

	cursor.execute("CREATE TABLE Tweets(\
				id BIGINT PRIMARY KEY,\
				message TEXT,\
				created_at VARCHAR(127),\
				place VARCHAR(255),\
				geo VARCHAR(255),\
				lat FLOAT(12),\
				long FLOAT(12)\
	           )")

	cursor.execute("CREATE TABLE Hashtags(\
				id SERIAL PRIMARY KEY,\
				hashtag VARCHAR(127)\
	           )")

	cursor.execute("CREATE TABLE Tweets_Hashtags(\
				tweet_id INT,\
	            FOREIGN KEY (tweet_id) REFERENCES Tweets(id) ON DELETE CASCADE,\
	            hashtag_id INT,\
	            FOREIGN KEY (hashtag_id) REFERENCES Hashtags(id) ON DELETE CASCADE\
	           )")

	con.commit()

def write_tweets(con, cursor):

	counter = 1;
	file_count = len(os.listdir(TWITTER_DATA_PATH))
	tweet_coordinates = {}

	for file_name in os.listdir(TWITTER_DATA_PATH):
		
		print "Inserting file " + str(counter) + " of " + str(file_count) + " files..."
		counter += 1

		print "Reading " + str(file_name) + "..."
		with open(TWITTER_DATA_PATH + str(file_name)) as data_file:

			# objects = ijson.items(data_file, "items")

			# for o_i, o in enumerate(objects):
			# 	print o
			# 	if o_i > 10:
			# 		exit()

			# ret = {'builders': {}}
			# xxx = 0

			# for prefix, event, value in parser:
			#     print prefix
			#     print event
			#     print value
			#     xxx += 1
			#     if xxx > 10:
			#     	exit()

			data_array = []

			for line_index, line in enumerate(data_file):
				# if line_index > 1:
				# 	print data_array
				# 	exit()
				if line_index % 10000 == 0:
					print line_index
				data_array.append(json.loads(line))

			# data_string = data_file.read()
			# data_string

			# data = json.load(data_file)

			print str(len(data_array))
			exit()

			for index, tweet in enumerate(data_array):

				# check missing values
				# for attrubute in ["message", "place", "geo", "coordinates"]:
				# 	if not attrubute in tweet:
				# 		tweet[attrubute] = ""

				# check missing coordinates
				if "coordinates" in tweet["geo"]:
					tweet_coordinates["lat"] = tweet_coordinates["geo"]["coordinates"][0]
					tweet_coordinates["long"] = tweet_coordinates["geo"]["coordinates"][1]
				else:
					tweet_coordinates["lat"] = ""
					tweet_coordinates["long"] = ""

                # Update tweets
				cursor.execute("INSERT INTO tweets(\
					id,\
					message,\
					created_at,\
					place,\
					geo,\
					lat,\
					long\
					) SELECT %s,%s,%s,%s,%s,%s \
					WHERE NOT EXISTS(SELECT id FROM tweets WHERE id = %s)",(
						tweet["id"],
						tweet["message"],
						tweet["created_at"],
						tweet["place"],
						tweet["geo"],
						tweet_coordinates["lat"],
						tweet_coordinates["long"]
						))

				# Update hashtags and tweets_hashtags
				for hashtag in tweet["entities"]["hashtags"]:
					cursor.execute("INSERT INTO Tweets(hashtag) SELECT %s WHERE NOT EXISTS (SELECT hashtag FROM Tweets WHERE hashtag=%s) RETURNING id", (hashtag["text"], hashtag["text"]))
					hashtag_id = cursor.fetchone()[0]
					cursor.execute("INSERT INTO Tweets_Hashtags(tweet_id, hashtag_id) VALUES(%s, %s)", (tweet["id"], hashtag_id))

				con.commit()


if __name__ == "__main__":

	# print os.path.exists(TWITTER_DATA_PATH)
	# exit()

	con = False

	try:
		con = psycopg2.connect(database=config.DB, user=config.USER, password=config.PASSWORD, host=config.HOST)
		cursor = con.cursor()

		setup_database(con, cursor)
		write_tweets(con, cursor)

	except psycopg2.DatabaseError, e:

		print 'Error %s' % e
		sys.exit(1)

	finally:
		if con:
			con.close()