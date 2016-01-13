var gulp = require("gulp")
var babel = require("gulp-babel")
var concat = require("gulp-concat")


gulp.task("default", function() {
  gulp.src("app/**/*.js")
    .pipe(babel({
      presets: ["es2015"]
    }))
    .pipe(concat("app.js"))
    .pipe(gulp.dest("build/js"))
});