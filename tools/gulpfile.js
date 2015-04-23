var gulp = require('gulp'),
    $ = require('gulp-load-plugins')();

var bower = require('main-bower-files');
gulp.task('bower', function() {
    return gulp.src(bower(), {
            base: './bower_components'
        })
        .pipe(gulp.dest('../main/libs'));
});

gulp.task('watch', function() {
    gulp.watch('./bower_components/*', ['bower']);
});

gulp.task('default', ['bower']);