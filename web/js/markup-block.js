/**
 * Created by felix on 8/27/16.
 */

+function () {
    window.stack = [];
    window.block = [
        /**
         * Title or separator
         */
        ['test', /(^-{3,}$)|(^={3,}$)/, function (line) {
            /**
             * @param {Line} former
             */
            // console.log(line);
            var prev = line.previous;
            // Title
            if (prev && ObjectHelper.instanceOf(prev.blockType, Type.Raw)) {
                prev.blockType = new Type.Title();
                var tag = line.html.indexOf('=') === 0 ? 'h1' : 'h2';
                prev.html = HtmlHelper.tag(tag, prev.html);
            }
            // Separator
            line.html = HtmlHelper.singleTag('hr');
            line.blockType = new Type.Separator();
        }],
        /**
         * # title
         */
        ['replace', /^(#{1,6})\s*(.+)$/, function (match, sharp, title) {
            return HtmlHelper.tag('h' + sharp.length, title);
        }, function (line) {
            line.blockType = new Type.Title();
        }],
        /**
         * List
         */
        [],
        /**
         * Block quote
         */
        [],
        /**
         * Table
         */
        [],
        /**
         * To-do list
         */
        []
        /**
         * Code
         * - with indent
         * - with back-ticks
         */
        // ['test', /^ {4,}/, function (line) {
        //     if (line.) {
        //
        //     }
        // }]
    ];
}();
