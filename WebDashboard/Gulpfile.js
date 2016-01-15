var gulp = require("gulp");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var livereload = require("gulp-livereload");
var del = require("del");
var nodemon = require("gulp-nodemon");

var sourceFiles = {
	client: {
		app: "app/client/**/*.js",
		plugins: [
			"node_modules/angular/angular.min.js",
			"node_modules/d3/d3.min.js",
			"node_modules/c3/c3.min.js"
		],
		css: [
			"node_modules/c3/c3.min.css"
		]
	},
	server: [
		"app/server.js"
	]
}

gulp.task("clean", function(cb){
	del(["build"], cb);
})

gulp.task("jade", function(){
	gulp.src("app/views/*.jade")
		.pipe(gulp.dest("build/views"))
		.pipe(livereload());
})

gulp.task("css", function(){
	gulp.src(sourceFiles.client.css)
		.pipe(concat("style.css"))
		.pipe(gulp.dest("build/css"))
})

gulp.task("jsClient", function() {
  gulp.src(sourceFiles.client.app)
    .pipe(babel({
      presets: ["es2015"]
    }))
    .pipe(concat("app.js"))
    .pipe(gulp.dest("build/client"))
    .pipe(livereload());
});

gulp.task("jsPlugins", function() {
	gulp.src(sourceFiles.client.plugins)
		.pipe(concat("plugins.js"))
		.pipe(gulp.dest("build/client"))
})

gulp.task("jsServer", function() {
	gulp.src(sourceFiles.server)
		.pipe(babel({
			presets: ["es2015"]
		}))
		.pipe(gulp.dest("build"))
		.pipe(livereload());
});

gulp.task("watch", function() {
  livereload.listen();
  gulp.watch("app/**/*.js", ["js"]);
  gulp.watch("app/**/*.jade", ["jade"]);
});

gulp.task("nodemon", function(){
	nodemon({
		script: 'build/server.js',
		ext: 'js jade',
		env: { 'NODE_ENV': 'development' }
	});
})

gulp.task("js", ["jsClient", "jsPlugins", "jsServer"]);
gulp.task("default", ["clean", "js", "jade", "css", "nodemon", "watch"]);