var gulp = require('gulp-help')(require('gulp'));
var del = require('del');

gulp.task('clean-dist', 'Cleaning distribution directories...', function(cb) {
    return del([
        'client/dist'
    ]);
});
