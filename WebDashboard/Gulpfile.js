var gulp = require("gulp");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var livereload = require("gulp-livereload");


gulp.task("js", function() {
  gulp.src("app/**/*.js")
    .pipe(babel({
      presets: ["es2015"]
    }))
    .pipe(concat("app.js"))
    .pipe(gulp.dest("build/js"))
    .pipe(livereload());

});

gulp.task("watch", function() {
  livereload.listen();
  gulp.watch("app/**/*.js", ["js"]);
});


gulp.task("default", ["js", "watch"]);