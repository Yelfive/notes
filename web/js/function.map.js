/**
 * Created by felix on 11/9/16.
 */

'use strict';

/**
 *
 * @type {{save: FunctionMap.save, tab: FunctionMap.tab, undo: FunctionMap.undo, redo: FunctionMap.redo, tabReduce: FunctionMap.tabReduce, createNewLineBelow: FunctionMap.createNewLineBelow, createNewLineBelow2Go: FunctionMap.createNewLineBelow2Go, toUpper: FunctionMap.toUpper, toLower: FunctionMap.toLower, extend: FunctionMap.extend, afterExtend: FunctionMap.afterExtend, Backspace: FunctionMap.Backspace, BackQuote: FunctionMap.BackQuote, tableActions: FunctionMap.tableActions}}
 * @return
 *  - empty to prevent default event
 *  - non-empty to go on default event
 */
var FunctionMap = {
    save: function () {
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
        // todo jQuery
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
            },
            complete: function (ajax) {
                var fb = JSON.parse(ajax.responseText);
                $('#message').html(fb.message);
                setTimeout(function () {
                    $('#message').html('');
                }, 3000);
            }
        });
    },
    tab: function () {
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Range
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Selection
         */
        var sel = window.getSelection();
        var line = Note.getCurrentLine();

        /* tab object to remember the tab being performed */
        var tab = Note.createTabNode();
        if (sel.isCollapsed) {
            // UndoManager.transact({
            //     redo: function () {
                    document.execCommand('insertText', false, tab.textContent);
            UndoManager.transact();
            //     }
            // });
        }
        // selection is not collapsed but its in the same line
        else if (!sel.isCollapsed && line.contains(sel.anchorNode) && line.contains(sel.focusNode)) {
            /**
             * TODO
             * it cannot remember the tabNode
             * if undo is performed, the tabNode inserted won't get undone
             * however, the modification before the inserting will get undone
             * It will not remember the tabNode at all, as if it didn't happen
             // line.prepend(tabNode);
             */
            // UndoManager.transact({
            //     redo: function () {
                    // if (!tab.textContent) tab = Note.createTabNode();
                    line.prepend(tab);
            UndoManager.transact();
                // },
                // undo: function () {
                //     var r = new Range();
                //     r.setStart(tab, 0);
                //     r.setEnd(tab, tab.textContent.length);
                //     r.deleteContents();
                //     r.detach();
                // }
            // });
        }
    },
    undo: function () {
        // document.execCommand('undo');
        window.UndoManager.undo();
    },
    redo: function () {
        window.UndoManager.redo();
    },
    tabReduce: function () {
        var line = Note.getCurrentLine();
        var html = line.getHTML();
        var reg = new RegExp('^(' + Note.tabString() + '){1,}');
        if (!reg.test(html)) return false;

        /**
         * 1. collapsed
         * 2. not-collapsed, one line
         * 3. not-collapsed, multiple lines
         */
        var sel = window.getSelection();
        var isCollapsed = sel.isCollapsed;
        if (
            isCollapsed
            // when the selection is not collapsed and in the same line
            || !isCollapsed && line.contains(sel.anchorNode) && line.contains(sel.focusNode)
        ) {
            /*
             * Clean up all the text nodes under this element
             * (merge adjacent, remove empty)
             */
            line.normalize();
            var spaceNode = line instanceof Text ? line : line.firstChild;
            var range = new Range();
            range.setStart(spaceNode, 0);
            range.setEnd(spaceNode, 4);
            range.deleteContents();
            /*
             * The caret will be automatically set, unless
             * - the spaceNode contains noting(empty string)
             */
            if (!spaceNode.textContent) Note.setCaret(spaceNode, 0)
        } else {
            // todo: anchor and focus is not in the same line
        }
    },
    /**
     * @param-internal {boolean} $return Whether to return the created line
     * @returns {Array|Boolean}
     */
    createNewLineBelow: function () {
        var currentLine = Note.getCurrentLine();
        if (!currentLine) return true;

        var newLine = Note.createEmptyLine(currentLine.nodeName);
        var length = Extend.isAutoIndent.apply(currentLine);
        if (length) {
            var text = Note.tabString().repeat(length);
            var spaces = document.createTextNode(text);
            newLine.prepend(spaces);
        }
        currentLine.after(newLine);
        if (arguments[0] === true) return [newLine, length * Note.tabLength];
    },
    createNewLineBelow2Go: function (line) {
        var data = line instanceof Node ? line : this.createNewLineBelow(true);
        var newLine = data[0];
        var length = data[1];
        if (newLine) {
            Note.setCaret(newLine, length ? length : 0);
        } else {
            return true;
        }
    },
    toUpper: function () {
        return Note.changeCase(false);
    },
    toLower: function () {
        return Note.changeCase(true);
    },
    extend: function () {
        // In case not only "Enter" is pressed
        if (Note.invokedKeys.length !== 1 || Note.invokedKeys[0] !== CODE.ENTER) {
            return true;
        }

        var line = Note.getCurrentLine();

        // line does not exist
        // return false;
        // if (!line) return true;

        /*
         * When current line is empty,
         * duplicate current line below,
         * thus prevent arbitrary generation of line.
         */
        if (line.isEmpty()) return this.createNewLineBelow2Go();
        /*
         * Whether the line is extensible,
         * valid enough to create `code`, `table` block.
         * Such as,
         * caret in the end, and its content is bare text
         */
        if (!line.isExtensible()) return true;

        // Register and invoke the matched extending
        return Note.extend(line, [
            'codeBlock', 'tableBlock', 'autoIndent', 'separator'
            // TODO: add extend check, table cell, enter in table cell multiple times
        ]);
    },
    afterExtend: function () {
        /*
         * Check if the last line is empty line, otherwise, create new line
         * This makes sure there always is an empty line at the end of the note
         * TODO: maybe, a afterExtend function is needed
         */
        Note.ensureLastLineEmpty();
    },
    Backspace: function () {
        /**
         * Step 1: Command + A
         * Step 2: Backspace -> delete
         * Step 3: ```
         * Step 4: Enter
         * Step 5: Backspace, to delete the code block
         *
         * ====
         *
         * delete the Elements like the inline or block code
         */
    },
    /**
     * Only valid for text node selected
     * @return {boolean|null}
     */
    BackQuote: function () {
        var sel = window.getSelection();
        var node = sel.focusNode;
        var caretAt = sel.focusOffset;
        var content;

        content = node.getText();
        if (!content) {
            if (node === Note._container) return true;
            console.error('content is not even a {{Node}}:', node);
        }

        // CAUTION: ` is not yet in the node
        var match = content.substring(0, caretAt).match(/(.*?)`[^`]+$/);
        var startAt, endAt;
        // find first ` before current one, backward
        if (match) {
            startAt = match[1].length;
            endAt = caretAt;
        }
        // If no found before, try after
        else {
            match = content.substring(caretAt).match(/^[^`]+`(.*)$/);
            if (!match) return true;
            startAt = caretAt;
            endAt = content.length - match[1].length;
        }

        var range = new Range();
        range.setStart(node, startAt);
        range.setEnd(node, endAt);
        var code = document.createElement('code');
        code.className = 'fc fc-inline';
        range.surroundContents(code);
        var codeHTML = code.innerHTML;
        // Condition `endAt == caretAt` means: former(this first typed-in) ` is in the font
        code.innerHTML = ''.substring.apply(codeHTML, endAt == caretAt ? [1] : [0, codeHTML.length - 1]);
        var space = document.createTextNode(' ');
        code.after(space);
        Note.setCaret(space, 1);
    },
    /**
     * 1. check if in table cell
     * 2. check if at the end of the cell
     * 3. check if the last cell of the row
     */
    tableActions: function (event) {
        var cell = Caret.inTableCell();
        if (false == cell) return true;

        var code = event.keyCode;
        var node, offset = 0; // [node, offset]
        switch (code) {
            case CODE.ARROW_LEFT:
                node = Note.findSiblingCell(cell, 'prev');
                break;
            case  CODE.ARROW_UP:
                break;
            case CODE.ARROW_RIGHT:
                node = Note.findSiblingCell(cell, 'next');
                break;
        }
        if (!node) {
            console.error('no dst caret node', cell);
            return false;
        }
        Note.setCaret(node, offset);
    }
};

// todo: keyup to disable common keys but functional keys like (control shift)
// todo: e.g. control+enter(multi-enters)

// todo: arrow up/down/left/right