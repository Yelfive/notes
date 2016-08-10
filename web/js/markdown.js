/**
 * Created by felix on 16/8/4.
 */

'use strict';

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
var Html = {
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


function MarkupTypes() {
    this.start = [];
    this.end = [];
    this.setStart = function (tag) {
        this.start.push('<' + tag + Html.combine(arguments[1]) + '>');
    };
    this.setEnd = function (tag) {
        this.end.unshift('</' + tag + '>');
    };
}


var Types = {};

Helper.each({
    'codeBlock': [['pre', {class: Html.classPrefix + 'pre'}], ['code', {'class': Html.classPrefix + 'code block'}], 'ol'],
    'list': [['ul', {class: Html.classPrefix + 'ul'}]]
}, function (k, v) {
    var mt = new MarkupTypes();
    Helper.each(v, function (kk, vv) {
        if (vv instanceof Array) {
            mt.setStart(vv[0], vv[1]);
            mt.setEnd(vv[0]);
        } else {
            mt.setStart(vv);
            mt.setEnd(vv);
        }
        // todo: why the following code result in exception
        // mt.setStart.apply(MarkupTypes, vv);
        // mt.setEnd(vv instanceof Array ? vv[0] : vv);
    });

    Types[k] = function () {
    };
    Types[k].prototype = mt;
});

var is = {
    list: function (string) {
        return /^\+|\- /.test(string);
    }
};

function Markup() {

    const EOL = '\n';

    /**
     *
     * Two ways:
     * 1. RegExp.test -> callback -> to replace or to match
     * 2. replace directly
     * [replace, pattern, replacement],
     *
     * ====> [pattern, replacement, callback], default to be replace, and if the first element is string, then take as test
     *
     * [test, pattern, callback],
     *
     * @type {Array} Private
     */
    var rules = [
        [/^(-{3,}|={3,})$/, function () {
            runRestRules = false; // stop running rest of the rules

            if (queue.length > 0) {
                var lastLine = queue.pop();
                var line = Html.tag(queue.length === 0 ? 'h1' : 'h2', lastLine, {'class': 'fk-md-title'});
                queue.push(line);
            }
            return Html.singleTag('hr', {'class': 'line'});
        }],
        [/\*\*([^\*]+)\*\*/, Html.tag('b', '$1')],
        [/`([^`]+)`/g, Html.tag('code', '$1', {'class': 'code'})],
        ['test', /^(?:\t| {4})+/, function () {
            var tail = ArrayHelper.get(stack, -1);

            if (!(tail instanceof Types.codeBlock)) {
                if (tail instanceof MarkupTypes) {
                    console.log(arguments)
return 'hahaha';
                } else {
                    _mark('codeBlock');
                }
            }
        }],
        ['test', is.list, function () {
            runRestRules = false;
            if (!(ArrayHelper.get(stack, -1) instanceof Types.list)) {
                _mark('list');
            }
        }],
        ['test', /(^\S)|(^$)/, _stackPop]
    ];

    var _source = '';

    /**
     * Stack of Html, each element represents one line
     * @type {Array}
     */
    var queue = [];

    /**
     * Stack of operators
     * @type {Array}
     */
    var stack = [];

    /**
     * Whether to run rest of the rules,
     * this is the property changed within replace callbacks
     * @type {Boolean}
     */
    var runRestRules;

    /**
     * Notice that the current line is inserted after the call,
     * so the last member of the queue should be the line before current line
     * @param currentLine
     * @private
     */
    function _stackPop(currentLine) {
        var tail = ArrayHelper.get(stack, -1);
        if (!(tail instanceof MarkupTypes)) {
            return;
        }

        var wrapContent = [], elem;

        if (tail instanceof Types.codeBlock) {
            while (queue.length) {
                elem = queue.pop();
                if (elem instanceof MarkupTypes) {
                    break;
                }
                wrapContent.unshift(Html.tag('li', Html.tag('span', elem, {'class': 'line-wrapper'})));
            }

        } else if (tail instanceof Types.list) {
            while (queue.length) {
                elem = queue.pop();
                if (elem instanceof MarkupTypes) {
                    break;
                }

                /**
                 * + the following is within the same <li>
                 * + abc
                 *   def
                 *   ghi
                 */
                if (!is.list(elem)) {
                    var group = [elem], e;
                    var isList = false;
                    while (queue.length) {
                        e = queue.pop();
                        isList = is.list(e);
                        group.unshift(isList ? e.replace(/^\+|\- +/, '') : e);
                        if (isList) {
                            break;
                        }
                    }
                    if (group.length > 1) {
                        elem = Html.tag('pre', group.join(EOL), {class: 'pre'});
                    }
                } else {
                    elem = elem.replace(/^\+|\- +/, '');
                }

                var line = Html.tag('li', elem);

                wrapContent.unshift(line);
            }
        }

        stack.pop();

        ArrayHelper.merge(queue, elem.start, wrapContent, elem.end);
    }

    function _mark(typeName) {
        var typeClass = Types[typeName];
        if (typeClass) {
            var type = new typeClass();
            stack.push(type);
            queue.push(type);
        } else {
            throw new Error('The type to be marked should be instance of MarkupTypes');
        }
    }

    function _tagWrapped(string) {
        if (typeof  string !== 'string') {
            throw new Error('Param must be string');
        }
        // Strip all EOL, cause multi-line match result in unexpected
        string = string.replace(EOL, '');
        var noWrap = /^<.*>$/;

        return noWrap.test(string);
    }

    function parse() {
        var array = _source.split(EOL);

        // array = array.splice(0, 19); // splice 20 for test

        Helper.each(array, function (i, line) {
            runRestRules = true;
            Helper.each(rules, function (j, rule) {
                switch (rule[0]) {
                    case 'test':
                        var matched;
                        if (rule[1] instanceof RegExp) {
                            matched = rule[1].test(line);
                        } else if (rule[1] instanceof Function) {
                            matched = rule[1](line);
                        } else {
                            throw new Error('Invalid configure for rules, offset 1 of type "test" should be instance of RegExp or Function');
                        }
                        if (matched) {
                            var _fd = rule[2](line);
                            // if the result is not undefined, set it as the value of `line`
                            _fd === undefined || (line = _fd);
                        }
                        break;
                    default :
                        line = line.replace(new RegExp(rule[0]), rule[1]);
                }
                return runRestRules;
            });
            queue.push(line);
        });
    }

    function translate() {
        try {
            parse();
            if (stack.length) {
                while (stack.length) {
                    _stackPop(ArrayHelper.get(queue, -1));
                }
            }
            Helper.each(queue, function (k, line) {
                if (!_tagWrapped(line)) {
                    queue[k] = Html.tag('p', line);
                }
            });

            return queue.join(EOL);
        } catch (e) {
            console.group('Queue before translate');
            Helper.each(queue, function (k, line) {
                console.log(line)
            });
            console.groupEnd();
            throw e;
        }

    }

    this.render = function (source) {
        var t1 = (new Date).getTime();
        _source = source;
        var html = translate();
        var t2 = (new Date).getTime();
        console.info('Time elapsed:', t2 - t1, 'ms');
        return html;
    }
}
