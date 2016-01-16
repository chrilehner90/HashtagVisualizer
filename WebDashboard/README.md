Create Index on Tweet Messages
'''
db.filteredTweets.createIndex({"value.text": "text"})
'''