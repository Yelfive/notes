/**
 * Created by felix on 11/3/16.
 */

var KeyFunction = {
    ShiftDown: function () {
        this.shiftDown = true;
    },
    ControlDown: function () {
        this.controlDown = true;
    },
    AltDown: function () {
        this.altDown = true;
    },
    MetaDown: function () {
        this.metaDown = true;
    },
    ShiftUp: function () {
        this.shiftDown = false;
    },
    ControlUp: function () {
        this.controlDown = false;
    },
    AltUp: function () {
        this.altDown = false;
    },
    MetaUp: function () {
        this.metaDown = false;
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
        if (!this.metaDown) return true;

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
    }
};