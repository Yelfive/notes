/**
 * Created by felix on 12/16/16.
 */

(function () {

    var CaretBase = function () {

    };

    CaretBase.prototype = {
        /**
         * @returns {Boolean|HTMLTableCellElement} Cell the caret in
         */
        inTableCell: function () {
            var sel = window.getSelection();
            var node = sel.focusNode;
            var container = Note._container || document.body;
            while (container.contains(node)) {
                if (node instanceof HTMLTableCellElement) return node;
                node = node.parentNode;
            }
            return false;
        },
        inTheEnd: function (node) {
            if (!node) node = Note.getCurrentLine();

            var sel = window.getSelection();
            var range = new Range();
            // Set the range contains the whole line
            range.selectNodeContents(node);
            // Set the start position for the range, to minimize the range
            // This range starts from selected anchor and offset, ends at the end of the line
            range.setStart(sel.anchorNode, sel.anchorOffset);
            // Check if the range contains anything
            return range.cloneContents().textContent.length === 0;
        },
        inTheBeginning: function (node) {
            if (!node) node = Note.getCurrentLine();
            var sel = window.getSelection();
            var range = new Range();
            range.selectNodeContents(node);
            range.setEnd(sel.focusNode, sel.focusOffset);
            console.log('"' + range.cloneContents().textContent + '"');
            return range.cloneContents().textContent.length === 0;
        },
        findLastChildNode: function (node) {
            if (node instanceof Text) return node;

            var child = node.lastChild;
            return child ? this.findLastChildNode(child) : node;
        },
        /**
         * - node is Text
         *      Set caret at the Text's given offset
         * - node is Element
         *      Set caret at the first Text child's given offset
         * @param {Node} node
         * @param {int} offset The offset of the Text Node
         */
        focusAt: function (node, offset) {
            // To merge adjacent, remove empty
            // In case the text nodes is malformed
            node.normalize();
            var selection = window.getSelection();
            var range = new Range();
            var start;
            if (offset < 0) { // place the caret at the end of the node
                start = this.findLastChildNode(node);
                offset = start.textContent.length;
            } else {
                start = node.firstChild ? node.firstChild : node;
            }
            // set the caret
            selection.removeAllRanges();
            range.setStart(start, offset);
            selection.addRange(range);
        },
        setSelected: function (begin, beginOffset, end, endOffset) {
            var sel = getSelection();
            var range = new window.Range();
            if (arguments.length === 1) {
                range.selectNode(begin);
            } else {
                range.setStart(begin, beginOffset);
                range.setEnd(end, endOffset);
                /*
                 * 1: `begin` is the same as `end`, but beginOffset > endOffset
                 * 2: `end` is ahead of `begin`
                 */
                if (range.collapsed) {
                    range.setStart(end, endOffset);
                    range.setEnd(begin, beginOffset);
                }
            }
            sel.removeAllRanges();
            sel.addRange(range);
            range.detach();
        }
    };

    window.Caret = new CaretBase;
})();
