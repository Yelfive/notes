/**
 * Created by felix on 8/17/16.
 */

'use strict';
+(function () {
    // var specitalChars = [
    //     '\\', '`', '*', '_', '{}', '[]', '()', '#', '+', '-', '.', '!'
    // ];

    const EOL = '\n';

    /**
     *
     * @constructor
     * @return {String}
     */
    function Markup() {

        var _sourceLines;
        var _queue = [];
        /**
         *  [
         *      [type, pattern, callback/replacement]
         *  ]
         * @type {*[]}
         */

        /**
         * Inline elements
         * - * or _, one each side, em
         * - * or _, two each side, strong
         * - `, any amount around, code, inside can be no other format
         * - [display words](url), link
         * - [display words][flag], link
         * - [flag]: url title, link definition
         * - ![alt words](src), image
         */
        var inline = [
            /**
             * code(``), inside code no other format
             * @param {Line} line
             * @param {RegMatch[]} match
             */
            ['replace', /(`+)(.+?)\1/g, function (match, sign, code) {
                return placeholder.code.push(HtmlHelper.tag('code', code));
            }],
            // strong(**word**), em(*word*)
            ['replace', /([_*]{1,2})(.+?)\1/g, function (match, token, word) {
                switch (token.length) {
                    case 1:
                        return HtmlHelper.tag('em', word);
                    case 2:
                        return HtmlHelper.tag('strong', word);
                    default:
                        return match;
                }
            }],
            // img, ![]()
            ['replace', /!\[(.*?)]\((.*?)\)/g, function (match, words, link) {
                return HtmlHelper.singleTag('img', {src: link, alt: words});
            }],
            // a, []()
            ['replace', /\[(.*?)]\((.*?)\)/g, function (match, words, link) {
                return HtmlHelper.tag('a', words, {href: link, target: '_blank'})
            }],
            // Placeholders for links(src & href)
            ['replace', /^ {0,3}\[([^\]]+?)]:\s*(\S+)(?:\s+(?:(?:'([^']*)')|(?:"([^"]*)")))?\s*$/, function (match, id, link, title1, title2) {
                _checkRest = false;
                var data = {link: link};
                if (title1) {
                    data.title = title1;
                } else if (title2) {
                    data.title = title2;
                }

                if (data.title) {
                    data.title = Line.unescape(data.title).replace('"', '&quot;')
                }
                placeholder.link.push(id, data);
                return '';
            }]
        ];

        /**
         * Block elements
         * - pre
         *      Inside pre, there cannot be any other block elements, present as-is
         * - ul/ol
         *      Inside list, there can be other block elements
         * - blockquote
         *      Inside, there can be other block elements
         * - title
         *      = or -, any amount, without any other char, except blanks
         *      = h1
         *      - h2
         * - separator
         *      * or _ or -, hr, >=3
         * - to-do list
         *      [ ] unfinished
         *      [x] finished
         * - table
         */
        var block = [
            ['test', /^\s*$/, function (line) {

            }]
        ];
        var placeholder = {
            escape: {}
        };

        // TODO: remove
        window.placeholder = placeholder;

        var border = ['<!--', '-->'];

        function wrap(flag, id) {
            return border[0] + flag.toUpperCase() + ':' + id + border[1];
        }

        ObjectHelper.each(['link', 'code', 'escape'], function (index, key) {
            var id = -1;
            if (!placeholder[key]) {
                placeholder[key] = {};
            }
            ObjectHelper.merge(placeholder[key], {
                push: function (data) {
                    if (arguments.length === 1) {
                        this['map'][++id] = data;
                        return wrap(key, id);
                    } else if (arguments.length === 2) {
                        this['map'][arguments[0]] = arguments[1];
                    }
                },
                unescape: function (line) {
                    ObjectHelper.each(this.map, function (id, html) {
                        if (typeof html === 'string') {
                            line.html = line.html.replace(wrap(key, id), html);
                        }
                    });
                    var clearMap = arguments[1];
                    if (clearMap) {
                        this.map = {};
                    }
                }
            });
            placeholder[key]['map'] = {};
        });
        ObjectHelper.each(['\\', ']', '}', '"', "'"], function (k, v) {
            placeholder.escape.push(v);
        });

        var _checkRest;

        function parseLine(line) {
            _checkRest = true;
            var rules = arguments[1] ? arguments[1] : inline;
            ObjectHelper.each(rules, function (k, rule) {
                translateSingleRule(rule, line);
                return _checkRest;
            });
            // unescape code
            placeholder.code.unescape(line, true);
        }

        function parse() {
            // TODO
            // Block rules

            // Inline rules
            var line;
            ObjectHelper.each(_sourceLines, function (k, text) {
                line = new Line(text);
                line.isEmpty() || parseLine(line);
                if (_queue.length) {
                    _queue[k - 1].next = line;
                    line.previous = _queue[k - 1];
                }
                _queue.push(line);
            });

            var block = window.block;
            // todo block rules
            var stack = window.stack;
            window._queue = _queue;
            window.Line = Line;
            window._checkRest = _checkRest;

            ObjectHelper.each(_queue, function (lineNumber, line) {
                _checkRest = true; // default not to check other rules
                ObjectHelper.each(block, function (k, rule) {
                    translateSingleRule(rule, line);
                    return _checkRest;
                });
                line && stack.push(line);
            });
            _queue = stack;
            console.log(_queue);
            afterParsed();
        }

        /**
         * Translate one single rule
         * @param {[Array]} rule
         * @param {string} line
         * @returns {*}
         */
        function translateSingleRule(rule, line) {
            rule.length && translate[rule[0]](rule, line);
        }

        /**
         * Represents the block type of the line
         * @param {string} name
         * @constructor
         */
        function BaseType(name) {
            this.name = name;
        }

        var Type = {
            Raw: function () {
            },
            Title: function () {
            },
            Separator: function () {
            },
            Quote: function () {

            },
            List: function (indentLength, state, start, end) {
                this.indentLength = Type.SUB_INDENT_LENGTH;
                this.start = start;
                this.state = state;
                this.end = end;
            },
            Code: function (indentLength, state, start, end) {
                this.indentLength = indentLength;
                this.state = state;
                this.start = start;
                this.end = end;
                // this.toHtml = function () {
                //
                // }
            }
        };

        /**
         * Declare parent class for types, using prototype
         */
        ObjectHelper.each(Type, function (k) {
            Type[k].prototype = new BaseType(k);
        });

        Type.STATE_START = 'start';
        Type.STATE_BODY = 'body';
        Type.STATE_END = 'end';
        Type.SUB_INDENT_LENGTH = 4;

        // function Types() {
        //     return [].apply(this, );
        // }
        //
        // Types.

        window.Type = Type;

        /**
         *
         * @param line
         * @method escape
         * @constructor
         */
        function Line(line) {
            this.origin = line;
            this.html = this.escape(line);
            this.blockType = new Type.Raw();
            this.previous = null;
            this.next = null;
        }

        /**
         * Declare static function of Line
         */
        ObjectHelper.merge(Line, {
            unescape: function (string) {
                var line = new Line(string);
                placeholder.escape.unescape(line);
                return line.html;
            }
        });

        /**
         * Declare no-static function of Line
         */
        ObjectHelper.merge(Line.prototype, {
            escape: function (string) {
                ObjectHelper.each(placeholder.escape.map, function (k, v) {
                    string = string.replace('\\' + v, wrap('escape', k));
                });
                return string;
            },
            unescape: function () {
                return Line.unescape(this.html);
            },
            isEmpty: function () {
                return /^\s*$/.test(this.html);
            }
        });

        function afterParsed() {
            var rules = [
                // img, ![alt][src]
                ['replace', /!\[(.+?)]\[(.+?)]/g, function (match, alt, id) {
                    var data = ObjectHelper.get(placeholder.link.map, id, false);
                    return data ? HtmlHelper.singleTag('img', {
                        src: data.link,
                        alt: Line.unescape(alt),
                        title: data.title
                    }) : match;
                }],
                // a,[text][href]
                ['replace', /\[(.+?)]\[(.+?)]/g, function (match, text, id) {
                    var data = ObjectHelper.get(placeholder.link.map, id, false);
                    return data ? HtmlHelper.tag('a', text, {
                        href: data.link,
                        title: data.title,
                        target: '_blank'
                    }) : match;
                }]
            ];
            ObjectHelper.each(_queue, function (k, line) {
                line.isEmpty() || parseLine(line, rules);
            });
        }

        var translate = {
            /**
             * @param {Array} rule
             * - ['exec', RegExp, callback]
             *
             * @param {Line} line
             */
            exec: function (rule, line) {
                var matches = [], match;
                var reg = new RegExp(rule[1], 'g');
                while (match = reg.exec(line.html)) {
                    matches.push(match);
                }
                if (matches.length) {
                    rule[2](line, matches);
                }
            },
            /**
             *
             * @param {Array} rule
             * - ['replace', RegExp, replacement]
             * - ['replace', RegExp, replacement, afterReplaced]
             *
             * @param {Line} line
             */
            replace: function (rule, line) {
                var replaced = line.html.replace(rule[1], rule[2]);
                if (rule[3] && replaced !== line.html) {
                    line.html = replaced;
                    rule[3](line);
                }
            },
            /**
             * @param {Array }rule
             * - ['test', RegExp, callback]
             *
             * @param {Line} line
             */
            test: function (rule, line) {
                if (rule[1].test(line.html)) {
                    rule[2](line);
                }
            }
        };

        function join() {
            var result = '';
            ObjectHelper.each(_queue, function (k, line) {
                /**
                 * @type {Line} v
                 */
                result += line.unescape() + EOL;
            });
            return result;
        }

        this.render = function (source) {
            _queue = [];
            var st = (new Date()).getTime();
            _sourceLines = source.split(EOL);
            parse();
            var et = (new Date()).getTime();
            var result = join();
            console.info('Time elapsed:', et - st, 'ms');
            return result;
        }
    }

    window.Markup = Markup;
})();
