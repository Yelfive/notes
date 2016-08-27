/**
 * Created by felix on 8/17/16.
 */

var ObjectHelper = {
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
    },
    /**
     * Get value from given haystack, which can be {} or array
     * @param {Array|Object}haystack
     * @param {String|int} needle
     * @optional-param {*} defaultValue
     * @returns {*}
     */
    get: function (haystack, needle) {
        if (this.is_array(haystack)) {
            return ArrayHelper.get.apply(ArrayHelper, arguments);
        } else if (haystack instanceof Object) {
            return haystack[needle] === undefined ? arguments[2] : haystack[needle];
        }
        return arguments[2];
    },
    /**
     *  Merge json object into the first param
     *  ```javascript
     *  json1 = {a: 1, b: 2};
     *  json2 = {b: 3, c: 4};
     *
     *  static::merge(json1, json2);
     *  ```
     *
     *  result will be
     *
     *  ```javascript
     *  {a: 1, b: 3, c: 4};
     *  ```
     */
    merge: function (object) {
        if (!object) {
            throw new Error('Param 1 for merge must be an object');
        }

        if (arguments.length === 1) {
            return true;
        }
        for (var i = 1; i < arguments.length; i++) {
            this.each(arguments[i], function (k, v) {
                object[k] = v;
            });
        }

    },
    instanceOf: function (object, className) {
        return object instanceof className;
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

        var arr = arguments[0] ? arguments[0] : [];
        for (var i = 1; i < arguments.length; i++) {
            ObjectHelper.each(arguments[i], function (k, v) {
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
        ObjectHelper.each(data, function (k, v) {
            arr.push(k + '="' + v + '"');
        });
        return ' ' + arr.join(' ');
    }
};
