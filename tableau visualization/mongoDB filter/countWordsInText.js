use twitter-database;

function map() {
	var regex = new RegExp("[#@'-.:()?!]",'g');
	var text = this.text.replace(regex, '').toLowerCase();

	var strings = text.split(" ");

	for(index in strings) {
		emit(strings[index], 1);
	}
}

function reduce(key, values) {
	return Array.sum(values)
}

// count words to get words to filter with second MapReduce function
db.tweets.mapReduce(map, reduce, {
	query: {
		$or: [
			{ lang: "en" },
			{ lang: "de"}
		],
		geo: {
			$ne: null
		}
	},
	out: "countWords"
})