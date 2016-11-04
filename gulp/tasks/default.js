var gulp = require('gulp-help')(require('gulp'));

gulp.task('default', 'Build development bundle',
    [
        'dev-build'
    ],
    function(cb) { cb(); }
);
