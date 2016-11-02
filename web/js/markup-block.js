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
             * @param {Line} prev
             */
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
            _checkRest = false;
        }],
        /**
         * # title
         */
        ['replace', /^(#{1,6})\s*(.+)$/, function (match, sharp, title) {
            return HtmlHelper.tag('h' + sharp.length, title);
        }, function (line) {
            line.blockType = new Type.Title();
            _checkRest = false;
        }],
        /**
         * Table
         */
        [],
        /**
         * Code
         * - with indent
         * - with back-ticks
         * @param {Line} line
         */
        ['test', /^ {4,}/, function (line) {
            var prev = line.previous;
            // if (prev.blockType.indentLength) { // If it within the previous line
            var match;
            if (match = line.html.match(/^( +)\S/)) {
                var indentLength = parseInt(prev.blockType.indentLength);
                if (!indentLength) indentLength = 0;
                indentLength += Type.SUB_INDENT_LENGTH;
                if (match[1].length >= indentLength) {
                    line.html = line.html.substr(indentLength);
                    // var state = line.previous.blockType instanceof Type.Code && line .previous.blockType.
                    var state;
                    if (line.previous.blockType instanceof Type.Code) {
                        line.previous.blockType.state = Type.STATE_BODY;
                        state = Type.STATE_END;
                    } else {
                        state = Type.STATE_START;
                    }
                    line.blockType = new Type.Code(indentLength, state, line, null);
                }
            }
            // }
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
         * To-do list
         */
        [],
        /**
         * Paragraph,
         * maybe not here,
         * it should be added to those not wrapped
         */
        []
    ];
}();

function Type() {

}
Type.prototype.push = function (data) {
    // this.length = 0;
    [].push.apply(this, data);
    return this;
};

Type.prototype.has = function (type) {
    var doesHave = false;
    ObjectHelper.each(this, function (k, v) {
        if (v instanceof type) {
            doesHave = true;
            return false;
        }
    });
    return doesHave;
};

Type.prototype.unshift = function () {

};