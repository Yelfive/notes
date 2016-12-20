/**
 * Created by felix on 12/16/16.
 */


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
    inTheMiddle: function () {
        var sel = window.getSelection();
        var range = new Range();
        // Set the range contains the whole line
        range.selectNodeContents(Note.getCurrentLine());
        // Set the start position for the range, to minimize the range
        // This range starts from selected anchor and offset, ends at the end of the line
        range.setStart(sel.anchorNode, sel.anchorOffset);
        // Check if the range contains anything
        return range.cloneContents().textContent.length !== 0;
    }
};

var Caret = new CaretBase;