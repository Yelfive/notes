/**
 * Created by felix on 11/3/16.
 */

"use strict";
var KeyFunctionBase = function () {
};
// KeyFunctionBase.ucfirst = function (value) {
//     return value.replace(/^[a-z]/, function (v) {
//         return v.toUpperCase();
//     })
// };
// KeyFunctionBase.lcfirst = function (value) {
//     return value.replace(/^[A-Z]/, function (v) {
//         return v.toLowerCase();
//     })
// };

String.prototype.lcfirst = function () {
    return this.replace(/^[A-Z]/, function (v) {
        return v.toLowerCase();
    });
};

KeyFunctionBase.prototype = {
    _statusKey: function (key) {
        return '_' + key.lcfirst() + 'Down';
    },
    keyDown: function (key) {
        this[this._statusKey(key)] = true;
    },
    keyUp: function (key) {
        this[this._statusKey(key)] = false;
    },
    isKeyDown: function (key) {
        return this[this._statusKey(key)];
    },
    TabDown: function () {
        if (this.shiftDown) {
            return true;
        }
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Range
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Selection
         */
        var tabString = '    ';
        var range = new Range();
        var selection = window.getSelection();
        var tabNode = document.createTextNode(tabString);
        // set the selection
        range.setStart(selection.focusNode, selection.anchorOffset);
        range.insertNode(tabNode);
        // set the caret
        selection.removeAllRanges();
        range.setStart(tabNode, tabString.length);
        // range.setEnd(tabNode, tabString.length); // this will select from current to new range end point(tabNode content)
        selection.addRange(range);
    },
    SDown: function () {
        if (!this.isKeyDown('meta')) return true;

        var $id = $('#note-id');
        var url = 'http://' + document.domain + '/api/index.php?r=note';
        var data = {
            'title': $('#title').val(),
            'content': $('#content-box').html()
        };
        var id, action;
        if (id = $id.val()) {
            data.id = id;
            action = 'PUT';
        } else {
            action = 'POST';
        }
        $.ajax({
            url: url,
            type: action,
            dataType: 'json',
            data: data,
            success: function (fb) {
                if (fb.code == 200) {
                    $id.val(fb.id);
                    window.refreshList();
                }
            }
        });
    },
    UDown: function () {
        if (!(this.isKeyDown('control') && this.isKeyDown('shift'))) return true;

        var toLowerCase = this.isKeyDown('l');
        var sel = window.getSelection();

        /** @param  {bool} $forward Whether the selection is forward (or otherwise, backward) */
        var forward;

        /* Make sure the natural order of the selection: begin from left and end in right */
        var begin, end, beginOffset, endOffset;
        // console.log(sel.anchorNode, sel.anchorNode.nextSibling)
        if (sel.anchorNode == sel.focusNode
            || sel.containsNode(nextNode(sel.anchorNode), true)
        ) {
            begin = sel.anchorNode;
            end = sel.focusNode;
            beginOffset = sel.anchorOffset;
            endOffset = sel.focusOffset;
            if (begin == end && beginOffset > endOffset) { // exchange offsets
                beginOffset += endOffset;
                endOffset = beginOffset - endOffset;
                beginOffset = beginOffset - endOffset;
            }
        } else {
            begin = sel.focusNode;
            end = sel.anchorNode;
            beginOffset = sel.focusOffset;
            endOffset = sel.anchorOffset;
        }

        /**
         *
         * @param {Node} node
         * @param-internal {int} start Position of
         * @param-internal {int} end
         */
        function changeCase(node) {
            var text = node.textContent;
            var start = arguments[1];
            var end = arguments[2];
            if (start === undefined) start = 0;
            if (end === undefined) end = text.length;

            var prepend = text.substring(0, start);
            var append = text.substring(end, text.length);
            var body = text.substring(start, end);
            // body = toLowerCase ? body.toLowerCase() : body.toUpperCase();
            body = toLowerCase ? body.toLowerCase() : body.toUpperCase();
            node.textContent = prepend + body + append;
        }

        /**
         *
         * @param {Node} node
         */
        function nextNode(node) {
            var next = node.nextSibling;

            return next ? next : nextNode(node.parentNode);
        }

        // Case 0: collapsed
        // Case 1: begin=end
        if (begin == end) {
            var anchorOffset = sel.anchorOffset;
            var focusOffset = sel.focusOffset;
            var startPos = Math.min(anchorOffset, focusOffset);
            var endPos = anchorOffset + focusOffset - startPos;
            changeCase(begin, startPos, endPos);
        }
        // Case 2: begin < end
        else {
            changeCase(begin, beginOffset);
            var current = nextNode(begin);
            while (current && !current.contains(end)) {
                changeCase(current);
                current = current.nextSibling;
            }
            changeCase(end, 0, endOffset);
        }
        this.setSelected(begin, beginOffset, end, endOffset);
    },
    LDown: function () {
        if (!(this.isKeyDown('control') && this.isKeyDown('shift'))) return true;

        this.UDown();
    },
    setSelected: function (begin, beginOffset, end, endOffset) {
        var sel = getSelection();
        sel.removeAllRanges();
        var range = new window.Range();
        range.setStart(begin, beginOffset);
        range.setEnd(end, endOffset);
        sel.addRange(range);
    }
};

var KeyFunction = new KeyFunctionBase();