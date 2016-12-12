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
        var sp = ' ';
        var tabString = sp.repeat(Note.tabLength);
        var range = new Range();
        var selection = window.getSelection();
        var tabNode = document.createTextNode(tabString);

        // set the selection
        range.setStart(selection.focusNode, selection.anchorOffset);
        range.insertNode(tabNode);

        Note.setCaret(tabNode, tabString.length);
    },
    /**
     * @param-internal {boolean} $return Whether to return the created line
     * @returns {*}
     */
    createNewLineBelow: function () {
        var currentLine = Note.getCurrentLine();
        if (!currentLine) return true;

        var newLine = Note.createEmptyLine(currentLine.nodeName);
        currentLine.after(newLine);
        if (arguments[0] === true) return newLine;
    },
    createNewLineBelow2Go: function () {
        var newLine = this.createNewLineBelow(true);
        if (newLine) {
            Note.setCaret(newLine, 0);
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
        var info;

        // line does not exist
        // TODO: what to do to disable deletion for empty contain, don't delete the last <div></div>
        // TODO: or how to wrap every line, when they come from clipboard
        // if (!line) line = Note.surroundTextNodes();
        // return false;
        // if (!line) return true;

        // empty line
        if (line.isEmpty()) return this.createNewLineBelow2Go();
        // caret in the end, and its content is bare text
        if (!line.isExtensible()) return true;

        // code block
        if (info = line.isCodeBlock()) {
            // todo: info[1] , "php" to highlight semantically
            console.log('spaces', info[0].length, ';', 'language', info[1]);
            var indent = parseInt(info[0].length / Note.tabLength * 2);
            var cls = Note.codeClass(info[1]);
            if (line instanceof Text) line = Note.surround(line);
            line.innerHTML = '<code' + (indent ? ' style="margin-left:' + indent + 'rem"' : '') + ' class="' + cls + '"><ul><li><br></li></ul></code>';
            // console.log(line);
            // line.after(this.createNewLineBelow(true));
            Note.setCaret(line.firstChild, 0);
            return false;
        }
        // table block
        if (info = line.isTableBlock()) {
            var tag = function () {
                return HtmlHelper.tag.apply(HtmlHelper, arguments);
            };

            var head = '';
            var body = '';
            for (var i = 0; i < info.length; i++) {
                head += tag('th', info[i]);
                body += tag('td', '<br>');
            }
            line.innerHTML = tag('table', tag('thead', tag('tr', head)) + tag('tbody', tag('tr', body)));
            var firstTd = line.querySelector('tbody').querySelector('td');
            setTimeout(function () {
                Note.setCaret(firstTd, 0);
                firstTd.innerHTML = '<br>';
            }, 0);
        }
        return true;
    },
    afterExtend: function () {
        /*
         * Check if the last line is empty line, otherwise, create new line
         * This makes sure there always is an empty line at the end of the note
         * TODO: maybe, a afterExtend function is needed
         */
        Note.ensureLastLineEmpty();
    }
};

// todo: keyup to disable common keys but functional keys like (control shift)
// todo: e.g. control+enter(multi-enters)

// todo: arrow up/down/left/right