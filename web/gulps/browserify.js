/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

let browserify = require('browserify');
let fs = require('fs');
let readConfig = require('./read-config');
let log = require('./log');

const getRealPath = function (relativePath) {
    let arr = (0 === relativePath.indexOf('/') ? relativePath : __dirname + '/' + relativePath).split('/');
    let realArr = [];
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] === '..') {
            i -= 2;
        } else if (arr[i] === '.') {
            i -= 1;
        }

        if (arr[i] != '') realArr.unshift(arr[i]);
    }
    // Ensure realArr prepended with '',
    // so that realpath will be prefixed with /
    if (realArr[0] !== '') realArr.unshift('');
    return realArr.join('/');
};

/**
 *
 * @param {browserify} b
 * @param {Object} aliases
 */
const parseAliases = function (b, aliases) {
    for (let src in aliases) {
        if (aliases.hasOwnProperty(src)) {
            parseAlias(getRealPath(src), aliases[src])
                .forEach(([file, alias]) => b.require(file, {expose: alias}));
        }
    }
};

const isDir = function (path) {
    let stat = fs.lstatSync(path);
    return stat.isDirectory();
};

const readDir = function (dir, depth = 0, files = []) {
    if (depth < 0) return files;
    dir = dir.replace(/\/$/, '');
    let items = fs.readdirSync(dir);
    let path;
    for (let v of items) {
        path = `${dir}/${v}`;
        if (isDir(path)) {
            readDir(path, depth - 1, files);
        } else {
            files.push(path);
        }
    }
    return files;
};

/**
 * @param {string} src
 * @param {string} dst
 * @return {Array}
 *  [dir, alias]
 */
const parseAlias = function (src, dst) {
    let stat = fs.lstatSync(src);
    let files;
    if (stat.isFile()) {
        return [[src, dst]];
    } else if (stat.isDirectory(src)) {
        files = readDir(src);
        let reg = new RegExp(`^${src}`);
        return files.map(file => {
            let alias = file.replace(reg, dst);
            alias = alias.substr(0, alias.length - 3);
            return [file, alias];
        });
    } else {
        return [];
    }
};

const merge = function (first, ...args) {
    args.forEach(function (arg) {
        for (let p in arg) {
            if (arg.hasOwnProperty(p)) {
                first[p] = typeof arg[p] === 'object' && first[p] ? merge(first[p], arg[p]) : arg[p];
            }
        }
    });
    return first;
};

let validateConfig = function (config) {
    if (!config.bundleDirectory) throw new Error('config.bundleDirectory must not be empty.');
};

let gulpBrowserify = function (path, opts) {
    let config = readConfig(__dirname + '/config.json');

    if (typeof path === 'object') {
        opts = path;
        path = null;
    }

    if (typeof opts === 'object') {
        if (typeof opts.only === 'object') {
            config = opts.only;
        } else if (opts.overwrite === 'object') {
            config = merge(config, opts.overwrite);
        }
        if (opts.state) log(opts.state, log.FG_PURPLE);
    }

    validateConfig(config);

    let b, filename;
    if (path) {
        let match = path.match(/([-\w]+)\.js$/);
        if (!match) log('Oops! File should match *.js: ' + path, log.FG_RED);
        filename = match[1];
        b = browserify(path);
        if (config.externalFiles) b.external(config.externalFiles);
    } else {
        b = browserify(config.browserify);
        filename = config.browserify.require;
    }

    if (config.requireAliases) parseAliases(b, config.requireAliases);

    let bundleDir = getRealPath(config.bundleDirectory);

    // todo: log(writing file of size xxx kb)
    console.log(`${bundleDir}/${filename}-bundle.js`);
    return new Promise(function (resolve, reject) {
        b.transform('babelify', config.babelify)
            .bundle(function (error) {
                if (!error) return;

                log(error.message, log.FG_RED);
                if (error.codeFrame) log(error.codeFrame);
                reject(error);
            })
            .pipe(fs.createWriteStream(`${bundleDir}/${filename}-bundle.js`))
            .on('finish', function () {
                log('done', log.FG_GREEN);
                resolve();
            });
    });
};

module.exports = gulpBrowserify;