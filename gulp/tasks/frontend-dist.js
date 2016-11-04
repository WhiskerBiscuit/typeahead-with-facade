var gulp = require('gulp-help')(require('gulp'));
var webpack = require('webpack');
var clientConfig = require('../../webpack.config.prod');

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

gulp.task('frontend-dist', 'Building frontend distribution bundle...', function(done) {
    webpack(clientConfig).run(onBuild(done));
});
