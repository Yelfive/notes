/**
 * Created by felix on 8/17/16.
 */

var Helper = {
    /**
     * Iterate array or json object
     * @param data
     * @param callback
     */
    each: function (data, callback) {
        if (!(callback instanceof Function)) {
            console.error('callback should be the instance of Function');
        }

        for (var i in data) {
            if (data.hasOwnProperty(i) && false === callback.apply(this, [i, data[i]])) {
                break;
            }
        }
    },
    is_array: function (data) {
        return data instanceof Array;
    }
};

var ArrayHelper = {
    get: function (haystack, needle) {
        if (haystack && haystack.length) {
            var offset = needle < 0 ? haystack.length + needle : needle;
            return haystack[offset] === undefined ? arguments[2] : haystack[offset];
        }

        return arguments[2];
    },
    /**
     * Check whether needle is in haystack
     * @param {String} needle
     * @param {String|Object} haystack
     * @returns {boolean}
     */
    in: function (needle, haystack) {
        var in_array = false;
        this.each(haystack, function (k, v) {
            in_array = needle == v;
        });
        return in_array;
    },
    merge: function () {
        if (arguments.length === 0) {
            return [];
        }

        var arr = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
            Helper.each(arguments[i], function (k, v) {
                arr.push(v);
            });
        }
    }
};

var HtmlHelper = {
    classPrefix: 'fk-md-',
    tag: function (tag, text, options) {
        return '<' + tag + this.combine(options) + '>' + text + '</' + tag + '>';
    },
    singleTag: function (tag, options) {
        return '<' + tag + this.combine(options) + '/>';
    },
    combine: function (data) {
        if (!(data instanceof Object)) {
            return '';
        }
        var arr = [];
        // Set tag class with prefix
        if (data.class && this.classPrefix && -1 == data.class.indexOf(this.classPrefix)) {
            data.class = this.classPrefix + data.class;
        }
        Helper.each(data, function (k, v) {
            arr.push(k + '="' + v + '"');
        });
        return ' ' + arr.join(' ');
    }
};