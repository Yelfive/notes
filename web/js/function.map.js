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
        var tabString = sp.repeat(4);
        console.log(tabString)
        var range = new Range();
        var selection = window.getSelection();
        var tabNode = document.createTextNode(tabString);

        // set the selection
        range.setStart(selection.focusNode, selection.anchorOffset);
        range.insertNode(tabNode);

        Note.setCaret(tabNode, tabString.length);
    },
    createNewLineBelow: function () {
        var currentLine = Note.firstBlockParent();
        if (!currentLine) return true;

        var newLine = Note.createEmptyLine(currentLine.nodeName);
        currentLine.after(newLine);
        if (arguments[0] === true) return newLine;
    },
    createNewLineBelow2Go: function () {
        var newLine = this.createNewLineBelow(true);
        Note.setCaret(newLine, 0);
    },
    toUpper: function () {
        return Note.changeCase(false);
    },
    toLower: function () {
        return Note.changeCase(true);
    },
    extend: function () {
        // var line = Note.getCurrentLine();

        // In case not only "Enter" is pressed
        if (Note.invokedKeys.length !== 1 || Note.invokedKeys[0] !== 'enter') {
            return true;
        }

        var line = Note.getCurrentLine();
        // line does not exist
        if (!line || !(line instanceof Note.PARAGRAPH_TYPE)) {
            return true;
        }
        // empty line
        else if (Note.isEmptyLine(line)) { // <li></li>
            return this.createNewLineBelow2Go();
        }
        // code block
        else if (line.innerHTML === '```') {
            line.innerHTML = '<code><ul><li><br></li></ul></code>';
            line.after(this.createNewLineBelow(true));
            Note.setCaret(line.firstChild, 0);
        } else {
            return true;
        }
    }
};

// todo: keyup to disable common keys but functional keys like (control shift)
