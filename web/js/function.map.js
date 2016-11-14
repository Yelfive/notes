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
        var tabString = '    ';
        var range = new Range();
        var selection = window.getSelection();
        var tabNode = document.createTextNode(tabString);
        // set the selection
        range.setStart(selection.focusNode, selection.anchorOffset);
        range.insertNode(tabNode);

        Note.setCaret(tabNode, tabString.length);
    },
    createNewLine: function () {
        var currentLine = Note.firstBlockParent();
        if (!currentLine) return true;

        var newLine = Note.createEmptyLine(currentLine.nodeName);
        currentLine.after(newLine);
        if (arguments[0] === true) return newLine;
    },
    createNewLine2Go: function () {
        var newLine = this.createNewLine(true);
        Note.setCaret(newLine, 0);
    },
    toUpper: function () {
        return Note.changeCase(false);
    },
    toLower: function () {
        return Note.changeCase(true);
    },
    extend: function () {
        var line = Note.getCurrentLine();

        if (line && Note.invokedKeys.length !== 1 && Note.invokedKeys[0] !== 'enter') {
            return true;
        }

        if (line.innerHTML === '```') {
            // todo: try using ul   li  instead
            line.innerHTML = '<code><div><br></div></code>';
            line.after(this.createNewLine(true));
            Note.setCaret(line.firstChild, 0);
        } else if (line.childNodes.length === 1 && line.firstChild.nodeName === 'CODE') { // code
            // var sel = Note.selectionCollapse();
            // var node = Note.firstParentsNode(sel.anchorNode, 'li');
            // if (node) {
            //     var newLine = document.createElement('li');
            //     newLine.innerHTML = '<br>';
            //     node.after(newLine);
            //     Note.setCaret(newLine, 0);
            // }
        // } else {
        }
        return true;
    }
};
