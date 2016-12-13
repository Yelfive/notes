/**
 * Created by felix on 11/9/16.
 */

'use strict';

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
        var tabString = Note.tabString();
        var range = new Range();
        var selection = window.getSelection();
        var tabNode = document.createTextNode(tabString);

        if (selection.isCollapsed) {
            // set the selection
            range.setStart(selection.focusNode, selection.anchorOffset);
            range.insertNode(tabNode);

            Note.setCaret(tabNode, tabString.length);
        }
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
        if (sel.isCollapsed) {
            // todo: type some letters "abc"
            // todo: type tab in the very front "    abc"
            // todo: type shift + tab to reduce tab
            /*
             * Clean up all the text nodes under this element
             * (merge adjacent, remove empty)
             */
            line.normalize();
            var caretNode = sel.anchorNode;
            var caretOffset = sel.anchorOffset;
            var spaceNode = line.firstChild;
            var range = new Range();
            range.setStart(spaceNode, 0);
            range.setEnd(spaceNode, 4);
            range.deleteContents();
            Note.setCaret(caretNode, caretOffset > 4 ? caretOffset - 4 : 0);
        }
    },
    /**
     * @param-internal {boolean} $return Whether to return the created line
     * @returns {*}
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
            console.log(data)
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
        if (Note.invokedKeys.length !== 1 || Note.invokedKeys[0] !== 'enter') {
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
            if (node == Note._container) {
                return true;
            }
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
    ArrowLeft: function () {
    },
    ArrowRight: function () {
    }
};

// todo: keyup to disable common keys but functional keys like (control shift)
// todo: e.g. control+enter(multi-enters)

// todo: arrow up/down/left/right