/**
 * Created by felix on 11/9/16.
 */

'use strict';

(function () {
    function insertText(text) {
        document.execCommand('insertText', false, text);
    }

    var Helper = {
        insertPunctuation: function (text) {
            var sel = window.getSelection();
            if (sel.isCollapsed) {
                insertText(text);
                var node = sel.focusNode;
                var offset = sel.focusOffset;
                if (node instanceof Text) {
                    Caret.focusAt(node, offset - 1);
                }
            } else {
                var range = sel.getRangeAt(0);

                var startPunctuation = document.createTextNode(text.substr(0, 1));
                var endPunctuation = document.createTextNode(text.substr(1, 1));
                range.insertNode(startPunctuation);

                range.setStart(range.endContainer, range.endOffset);
                range.insertNode(endPunctuation);

                Caret.setSelected(startPunctuation.nextSibling, 0, endPunctuation, 0);
            }
            return false;
        }
    };

    /**
     *
     * @type {{save: FunctionMap.save, tab: FunctionMap.tab, undo: FunctionMap.undo, redo: FunctionMap.redo, tabReduce: FunctionMap.tabReduce, createNewLineBelow: FunctionMap.createNewLineBelow, createNewLineBelow2Go: FunctionMap.createNewLineBelow2Go, toUpper: FunctionMap.toUpper, toLower: FunctionMap.toLower, extend: FunctionMap.extend, afterExtend: FunctionMap.afterExtend, Backspace: FunctionMap.Backspace, BackQuote: FunctionMap.BackQuote, tableActions: FunctionMap.tableActions}}
     * @return
     *  - empty to prevent default event
     *  - non-empty to go on default event
     */
    window.FunctionMap = {
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
            else if (line.contains(sel.anchorNode) && line.contains(sel.focusNode)) {
                line.prepend(tab);
            }
            // selection endpoints are not in the same line
            else {
                Note.eachRangeLines(sel.getRangeAt(0), function (line) {
                    line.prepend(Note.createTabNode());
                });
            }
        },
        tabReduce: function () {
            var match, offset, firstChild, range;

            Note.eachRangeLines(window.getSelection().getRangeAt(0), function (line) {
                line.normalize();
                firstChild = line.firstChild;
                if (firstChild instanceof Text === false) return;
                match = firstChild ? firstChild.getHTML().match(/^ {1,4}/) : null;
                if (!match) return;

                offset = match[0].length;
                range = new Range();
                range.setStart(firstChild, 0);
                range.setEnd(firstChild, offset);
                range.deleteContents();
                range.detach();
            });
        },
        undo: function () {
            // document.execCommand('undo');
            window.UndoManager.undo();
        },
        redo: function () {
            window.UndoManager.redo();
        },
        /**
         * @param {Boolean} [setFocus = false] Whether to focus at the end of the line
         * @returns {Array|Boolean}
         */
        createNewLineBelow: function (setFocus) {
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

            if (setFocus === true) {
                length ? Caret.focusAt(spaces, text.length) : Caret.focusAt(newLine, 0);
            }
        },
        createNewLineBelow2Go: function (line) {
            this.createNewLineBelow(true);
            return;
            var data = line instanceof Node ? line : this.createNewLineBelow(true);
            var newLine = data[0];
            var length = data[1];
            if (newLine) {
                Caret.focusAt(newLine.firstChild, length ? length : 0);
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

            // Wrap lines without wrapper
            Note.normalize(Note._container);

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
                // 'inTable',
                'codeBlock', 'tableBlock', 'autoIndent', 'separator',
                'beforeUnEditable'
            ]);
            // return false;
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
            return Delete.run();
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

            // Translate
            if (content[caretAt - 1] === '\\') {
                node.textContent = content.substr(0, caretAt - 1);
                var translation = Note.createElement('span');
                translation.innerText = '`';
                node.after(translation);
                translation.asWrapper().asEditable(false, true);
                Caret.focusAt(translation.nextSibling, 0);
                return false;
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
            var code = Note.createElement('code');
            code.className = 'fc fc-inline';
            code.asEditable(true);
            range.surroundContents(code);

            var codeWrapper = Note.createElement('span');
            codeWrapper.asEditable(false, true);
            codeWrapper.asWrapper();
            range.surroundContents(codeWrapper);

            var codeHTML = code.innerHTML;
            // Condition `endAt == caretAt` means: former(this first typed-in) ` is in the font
            code.innerHTML = ''.substring.apply(codeHTML, endAt == caretAt ? [1] : [0, codeHTML.length - 1]);
            var space = document.createTextNode(' ');
            // code.after(space);
            // Caret.focusAt(space, 1);
            codeWrapper.after(space);
            codeWrapper.before(space.cloneNode(false));
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
            } else {
                // Caret.focusAt(Note._container.lastChild.firstChild, 5);
                // console.log(sel.focusNode);
                // return false;

            }
            return true;
        },
        deleteLines: function () {
            var sel = getSelection();
            var r = sel.getRangeAt(0);
            if (r.startContainer === Note._container) return false;
            var offset = sel.focusOffset;
            var startLine = Note.getCurrentLine(r.startContainer);
            var endLine = Note.getCurrentLine(r.endContainer);
            var node = endLine.nextElementSibling || startLine.previousElementSibling;

            r.setStartBefore(startLine);
            r.setEndAfter(endLine);
            r.deleteContents();
            r.detach();

            if (!node || node === Note._container) {
                node = Note._container.firstElementChild;
                if (!node) {
                    node = Note.createEmptyLine(startLine.nodeName);
                    Note._container.append(node);
                }
                offset = 0;
            }
            Caret.focusAtText(node, offset);
        },
        SelectAll: function () {
            window.getSelection().selectAllChildren(Note._container);
        },
        BracketLeft: function () {
            Helper.insertPunctuation('[]');
        },
        Quote: function () {
            var text = Note.isKeyDown(CODE.SHIFT) ? '""' : "''";
            Helper.insertPunctuation(text);
        },
        BraceLeft: function () {
            Helper.insertPunctuation('{}');
        },
        ParenthesisLeft: function () {
            Helper.insertPunctuation('()');
        },
        AngleBracketLeft: function () {
            Helper.insertPunctuation('<>');
        }
    };
})();