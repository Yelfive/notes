/**
 * Created by felix on 3/27/17.
 */

var gulp = require('gulp');
var browserify = require('./gulps/browserify');
var config = require('./gulps/read-config')('gulps/config.json');
var log = require('./gulps/log');

gulp.task('default', function () {
    gulp.watch(config.watchFor, function (event) {
        browserify('react-dom/index.js', {state: event.type})
            .then(function () {
            })
            .catch(function () {
            });
    });
});

gulp.task('browserify-react', function () {
    config = {
        babelify: {compact: false},
        browserify: {
            // standalone: 'react',
            require: 'react'
        },
        bundleDirectory: config.bundleDirectory
    };
    browserify({only: config})
        .then(function () {
            // config.browserify.standalone = 'react-dom';
            config.browserify.require = 'react-dom';
            return browserify({only: config})
        })
        .then(function () {
            log('All Done', log.FG_GREEN)
        })
        .catch(function (...args) {
            console.log(args)
        });
});

