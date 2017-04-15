/**
 * Created by felix on 3/27/17.
 */

var gulp = require('gulp');
var browserify = require('./gulps/browserify');
var getConfig = require('./gulps/read-config').bind(null, 'gulps/config.json');
var log = require('./gulps/log');

gulp.task('default', function () {
    let config = getConfig();

    let underProcess = {};

    function watchHandler(event) {
        let config = getConfig();
        let pages = config.pages instanceof Array ? config.pages : [config.pages];
        if (pages[0] === undefined) pages = ['index'];
        for (let page of pages) {
            if (underProcess[page]) return;
            underProcess[page] = true;
            browserify(config.srcDirectory + '/' + page + '.js', {state: event.type})
                .then(function () {
                    underProcess[page] = false;
                })
                .catch(function () {
                    underProcess[page] = false;
                });
        }
        if (event.path.includes('config.json')) {
            bundleVendor();
        }
    }

    let watchFor = config.watchFor;
    if (false == watchFor instanceof Array) watchFor = [watchFor];
    if (!watchFor) watchFor = [];
    for (let file of watchFor) {
        gulp.watch(file, watchHandler);
    }
});

function bundleVendor() {
    var config = getConfig();
    var files = config.externalFiles;

    var only = {
        minify: config.minify,
        env: config.env,
        babelify: {compact: false},
        browserify: {
            require: files
        },
        bundleDirectory: config.bundleDirectory,
        bundleAs: 'vendor'
    };

    browserify({only: only})
        .catch(function (...args) {
            console.log(args)
        });
}
gulp.task('bundle-vendor', bundleVendor);


let originBrowserify = require('browserify');
let source = require('vinyl-source-stream');
let uglify = require('gulp-uglify');
let buffer = require('vinyl-buffer');
gulp.task('test', () => {
    let b = originBrowserify('lib/main.js')
        .transform('babelify', {presets: ['react', 'es2015', 'stage-2']});
    b.bundle()
        .pipe(source('bundle_test.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('./'))
});