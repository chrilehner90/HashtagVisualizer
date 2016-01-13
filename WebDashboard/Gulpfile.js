var gulp = require("gulp");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var livereload = require("gulp-livereload");
var del = require("del");
var nodemon = require("gulp-nodemon");

gulp.task("clean", function(){
	del(["build"]);
})

gulp.task("jade", function(){
	gulp.src("app/views/*.jade")
		.pipe(gulp.dest("build/views"))
		.pipe(livereload());
})

gulp.task("js", function() {
  gulp.src("app/**/*.js")
    .pipe(babel({
      presets: ["es2015"]
    }))
    .pipe(concat("server.js"))
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


gulp.task("default", ["clean", "js", "jade", "nodemon", "watch"]);