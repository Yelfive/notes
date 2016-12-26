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
        // todo jQuery migrate into native js
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
            document.execCommand('insertText', false, tab.textContent);
        }
        // selection is not collapsed but its in the same line
        else if (!sel.isCollapsed && line.contains(sel.anchorNode) && line.contains(sel.focusNode)) {
            line.prepend(tab);
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
            if (!spaceNode.textContent) Caret.focusAt(spaceNode, 0)
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
            Caret.focusAt(newLine, length ? length : 0);
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

        /*
         * line does not exist
         * e.g. the line.parentNode is the container
         */
        if (!line) return true;

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
            'inTable',
            'codeBlock', 'tableBlock', 'autoIndent', 'separator'
            // 'tableCRLF'
        ]);
    },
    afterExtend: function () {
        /*
         * Check if the last line is empty line, otherwise, create new line
         * This makes sure there always is an empty line at the end of the note
         */
        Note.ensureLastLineEmpty();
    },
    /**
     *
     * @returns {boolean} Whether to go on default
     */
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

        return true;
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
        Caret.focusAt(space, 1);
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
        var node, offset = -1;
        switch (code) {
            case CODE.ARROW_LEFT:
            case CODE.ARROW_RIGHT:
                node = Note.findSiblingCell(cell, code);
                break;
            case  CODE.ARROW_UP:
            case CODE.ARROW_DOWN:
                node = Note.findVerticalCell(cell, code);
                break;
        }

        if (!node) {
            var currentLine = Note.getCurrentLineStrictly();
            if (!currentLine) return false;

            if (code == CODE.ARROW_LEFT || code == CODE.ARROW_UP) {
                node = currentLine.previousElementSibling;
            } else {
                node = currentLine.nextElementSibling;
            }
        } else {
            if (code == CODE.ARROW_DOWN) {
                node = node.firstChild;
                offset = -1;
            }
        }
        if (!node) {
            console.warn('Absolutely no dst node found');
            return false;
        }
        Caret.focusAt(node, offset);
    },
    /**
     *
     * @param event
     * @returns {boolean}
     * @constructor
     */
    Arrow: function (event) {
        var cell = Caret.inTableCell();

        var sel = window.getSelection();
        var focusNode = sel.focusNode;

        function toCellAbove() {
            // Check if there's HTLMElement(e.g. DIV ) before focusNode
            if (focusNode !== cell && cell.contains(focusNode)) {
                var node = focusNode;
                while (node.parentNode !== cell) {
                    node = node.parentNode;
                }
                while (node) {
                    node = node.previousElementSibling;
                    if (node instanceof HTMLDivElement) return false;
                }
            }

            var r = new Range();
            r.selectNode(cell);
            r.setEnd(sel.focusNode, sel.focusOffset);
            var fragment = r.cloneContents();
            var hasLF = fragment.textContent.indexOf('\n') === -1;
            var _toCellAbove = hasLF && code == CODE.ARROW_UP;
            r.detach();
            return _toCellAbove;
        }

        function toCellBelow() {
            if (focusNode !== cell && cell.contains(focusNode)) {
                var node = focusNode;
                while (node.parentNode !== cell) {
                    node = node.parentNode;
                }
                while (node) {
                    node = node.nextElementSibling;
                    if (node instanceof HTMLDivElement) return false;
                }
            }

            var r = new Range();
            r.selectNode(cell);
            r.setStart(sel.focusNode, sel.focusOffset);
            var fragment = r.cloneContents();
            var endingString = fragment.textContent;
            // The last \n is invisible
            // There should be at least two LFs to make LF visible
            // So the indexOf(\n) can be either the last character or does no exist
            // to be consider as valid ArrowDown
            var len = endingString.length;
            var index = endingString.indexOf('\n');
            var _toCellBellow = (index === -1 || index == len - 1) && code == CODE.ARROW_DOWN;
            r.detach();
            return _toCellBellow;
        }

        if (cell) {
            var code = event.keyCode;
            if (code != CODE.ARROW_UP && code != CODE.ARROW_DOWN) return true;
            if (toCellAbove() || toCellBelow()) return this.tableActions(event);
        }
        return true;
    }
};
