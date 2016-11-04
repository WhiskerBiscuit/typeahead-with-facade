var gulp = require('gulp-help')(require('gulp'));
var del = require('del');

gulp.task('clean-dev', 'Cleaning development directories...', function(cb) {
    return del([
        'client/build'
    ]);
});
