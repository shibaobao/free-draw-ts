const { src, dest } = require('gulp');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

function minify () {
  return src('build/**/*.js')
    .pipe(uglify())
    .pipe(concat('free-draw.min.js'))
    .pipe(dest('dist/'));
}

exports.minify = minify;