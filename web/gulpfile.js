/**
 * Created by felix on 3/27/17.
 */

var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var plumber = require('gulp-plumber');
var log = require('./gulps/log');
var config = require('./gulpconfig');

gulp.task('default', function () {
    gulp.watch('src/*.js', function (event) {
        log(event.type, log.FG_PURPLE);
        var match = event.path.match(/([-\w]+)\.js$/);
        if (!match) log('Oops! File should match *.js: ' + event.path, log.FG_RED);
        var filename = match[1];
        // var filename = 'index';
        browserify('src/' + filename + '.js')
            .transform('babelify', {
                presets: ['es2015', 'react'], generatorOpts: config
            })
            .bundle(function (error) {
                if (!error) return;

                log(error.message, log.FG_RED);
                if (error.codeFrame) log(error.codeFrame);
            })
            .pipe(source(filename + '-bundle.js'))
            .pipe(gulp.dest('./entry/lib'));
        log('done', log.FG_GREEN);
    });
});
