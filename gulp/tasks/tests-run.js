var gulp = require('gulp-help')(require('gulp'));
var Server = require('karma').Server;
var path = require('path');

gulp.task('tests-runner', 'Running Karma Tests...', function(cb) {
    new Server({
        configFile: path.resolve(__dirname, '../../karma.conf.js'),
        singleRun: true
    }, cb).start();
});
