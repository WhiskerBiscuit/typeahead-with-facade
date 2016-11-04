var gulp = require('gulp-help')(require('gulp'));
var Server = require('karma').Server;
var path = require('path');

gulp.task('tests-watch', 'Watching Karma Tests...', function(cb) {
    new Server({
        configFile: path.resolve(__dirname, '../../karma.conf.js'),
        singleRun: false,
        autoWatch: true
    }, cb).start();
});
