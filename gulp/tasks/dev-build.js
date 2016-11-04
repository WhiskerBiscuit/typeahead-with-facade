var gulp = require('gulp-help')(require('gulp'));
var runSequence = require('run-sequence');

gulp.task('dev-build', 'Building development bundle...', function(cb) {
    runSequence(
        'clean-dev',
        'frontend-build',
        cb
    );
});
