var gulp = require('gulp-help')(require('gulp'));
var webpack = require('webpack');
var clientConfig = require('../../webpack.config.dev');

function onBuild(done) {
    return function(err, stats) {
        if(err) {
            console.log('Error', err);
        }
        else {
            console.log(stats.toString());
        }

        if(done) {
            done();
        }
    }
}

gulp.task('frontend-build', 'Building frontend development bundle...', function(done) {
    webpack(clientConfig).run(onBuild(done));
});
