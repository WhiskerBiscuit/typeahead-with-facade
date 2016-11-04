var gulp = require('gulp-help')(require('gulp'));
var runSequence = require('run-sequence');

gulp.task('dist', 'Building distribution bundle...', function(cb) {
    runSequence(
        'clean-dist',
        'frontend-dist',
        cb
    );
});
