/**
 * Created by felix on 8/17/16.
 */

'use strict';
+(function () {
    var specitalChars = [
        '\\', '`', '*', '_', '{}', '[]', '()', '#', '+', '-', '.', '!'
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
     * - todo list
     *      [ ] unfinished
     *      [x] finished
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

    const EOL = '\n';

    var BaseType = function (config) {
        this.start;
        this.end;
    };

    var Type = {}
    Helper.each([], function (k, v) {
        Type[k] = function (id) {
            this.id = id;
        };
        Type[k].prototype = new BaseType(v);
    });

    /**
     *
     * @constructor
     * @return {String}
     */
    function Markup() {

        var _sourceLines;
        var _queue = [];

        /**
         * @param {String} Current line
         */
        var _current = '';
        /**
         *  [
         *      [type, pattern, callback/replacement]
         *  ]
         * @type {*[]}
         */
        var block = [];
        var placeholder = {
            link: [],
        };
        var inline = [
            // code(``), inside code no other format
            ['exec', /(`+)(.+?)\1/g, function (line, matches) {
                var chunks = [];
                var start = 0, end;
                var chunk;
                /**
                 * Slice line into chunk, with common string string, while code an array
                 * e.g.
                 *  All programmers know what the code `hello world` means.
                 *  ```
                 *  chunk = [
                 *      'All programmers know what the code',
                 *      ['<code>Hello word</code>'],
                 *      'means'
                 *  ]
                 *  ```
                 *  This is to ensure inside the code block, thing will be as-is,
                 *  not informed by other rules
                 */


                var code = '';
                Helper.each(matches, function (k, match) {
                    end = match.index;
                    if (chunk = line.substring(start, end)) {
                        chunks.push(chunk);
                    }

                    code = match[2].replace('&', '&amp;');
                    chunks.push([HtmlHelper.tag('code', code)]);
                    start = end + match[0].length;
                });
                // check if it's the end of the line
                start < line.length && chunks.push(line.substr(start));

                Helper.each(chunks, function (k, v) {
                    if (Helper.is_array(v)) {
                        chunks[k] = v[0];
                    } else {
                        chunks[k] = parseLine(v);
                    }
                });

                _checkRest = false;
                return chunks.join('');
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
            // todo: www.domain.com 'this is \'ticktock\''
            ['replace', /^\[([^\]]+)]:\s*(\S+)(?:\s+('|")(.*?)\3)?\s*$/, function (match, id, link, quote, title) {
            // ['replace', /^\[([^\]]+)]:\s*(\S+)(?:\s+('|")(.*?)\3)?\s*$/, function (match, id, link, quote, title) {
                placeholder.link.push({id: id, link: link, title: title ? title : ''});
                _checkRest = false;
                return '';
            }]
        ];

        window.placeholder = placeholder;

        var _checkRest;

        function parseLine(line) {
            _checkRest = true;
            Helper.each(inline, function (k, rule) {
                _current = line;
                line = translateRule(rule, line);
                return _checkRest;
            });
            return line;
        }

        function parse() {
            // Inline rules
            Helper.each(_sourceLines, function (k, line) {
                _queue.push(parseLine(line));
            });

            // Block rules
            // Helper.each(_sourceLines, function (k, line) {
            //     _checkRest = true;
            //     Helper.each(block, function (k, b) {
            //         return _checkRest;
            //     });
            // });
            // afterParsed();
        }

        function translateRule(rule, line) {
            return translate[rule[0]](rule, line);
        }

        // todo , replace the placeholder
        function afterParsed() {
            var rules = [
                ['replace', /!?[][id]/g, function () {
                    console.log(arguments);
                }]
            ]
            Helper.each(_queue, function (k, line) {
                Helper.each(rules, function (k, rule) {
                    _queue[k] = translateRule(rule, line);
                });
            });
        }

        var translate = {
            exec: function (rule, line) {
                var matches = [], match;
                // if (match = line.exec(rule[1])) {
                while (match = rule[1].exec(line)) {
                    // line = rule[2](line, match);
                    matches.push(match);
                }
                if (matches.length) {
                    line = rule[2](line, matches);
                }
                return line;
            },
            replace: function (rule, line) {
                return line.replace(rule[1], rule[2]);
            },
            test: function (rule, line) {
            }
        };

        this.render = function (source) {
            var st = (new Date()).getTime();
            _sourceLines = source.split(EOL);
            parse();
            var et = (new Date()).getTime();
            var result = _queue.join(EOL);
            console.info('Time elapsed:', et - st, 'ms');
            return result;
        }
    }

    window.Markup = Markup;
})();