/**
 * Created by felix on 3/27/17.
 */

var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var plumber = require('gulp-plumber');
var log = require('./gulps/log');
var config = require('./gulpconfig');
var fs = require('fs');

gulp.task('default', function () {
    // gulp.watch('react-*/*.js', function (event) {
    var event = {path: './react-dom/index.js', type: 'changed'}
        event.path = './react-dom/index.js';
        log(event.type, log.FG_PURPLE);
        var match = event.path.match(/([-\w]+)\.js$/);
        if (!match) log('Oops! File should match *.js: ' + event.path, log.FG_RED);
        var filename = match[1];
        fs.readdir('react-components', function (err, files) {
            var b = browserify(event.path);

            // Aliases for components
            files.forEach(file => b.require('./react-components/' + file, {
                    expose: 'components/' + file.substr(0, file.lastIndexOf('.'))
                })
            );
            b.external(['react', 'react-dom']);

            b.transform('babelify', {
                presets: ['es2015', 'react', 'stage-2']
                ,compact: true
                ,babelrc: false
                , generatorOpts: {minified: true, comments: false}
            });
            b.bundle(function (error) {
                    if (!error) return;

                    log(error.message, log.FG_RED);
                    if (error.codeFrame) log(error.codeFrame);
                })
                .pipe(fs.createWriteStream(`./entry/lib/${filename}-bundle.js`))
                .on('finish', function () {
                    log('done', log.FG_GREEN);
                })
        });
    // });
});
