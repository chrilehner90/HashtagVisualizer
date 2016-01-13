var gulp = require("gulp");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var livereload = require("gulp-livereload");
var del = require("del");
var nodemon = require("gulp-nodemon");

var jsSourceFiles = {
	client: {
		app: "app/client/**/*.js",
		plugins: [
			"node_modules/angular/angular.min.js"
		]
	},
	server: [
		"app/server.js"
	]
}

gulp.task("clean", function(){
	del(["build"]);
})

gulp.task("jade", function(){
	gulp.src("app/views/*.jade")
		.pipe(gulp.dest("build/views"))
		.pipe(livereload());
})

gulp.task("jsClient", function() {
  gulp.src(jsSourceFiles.client.app)
    .pipe(babel({
      presets: ["es2015"]
    }))
    .pipe(concat("app.js"))
    .pipe(gulp.dest("build/client"))
    .pipe(livereload());
});

gulp.task("jsPlugins", function() {
	gulp.src(jsSourceFiles.client.plugins)
		.pipe(concat("plugins.js"))
		.pipe(gulp.dest("build/client"))
})

gulp.task("jsServer", function() {
	gulp.src(jsSourceFiles.server)
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
		ext: 'js html',
		env: { 'NODE_ENV': 'development' }
	});
})


gulp.task("default", ["clean", "jsClient", "jsPlugins", "jsServer", "jade", "nodemon", "watch"]);