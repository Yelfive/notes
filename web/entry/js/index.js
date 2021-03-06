/**
 * Created by felix on 11/3/16.
 */

/**
 * Code-Key: 9 => Tab
 * Key-Function: Control + Shift + S => save
 * function: save => function () {perform the save}
 */
$(function () {
    Note.init({container: '#content-box', keyMap: Key2Function})
        .registerEvents();

    var nodes = Note._container.querySelectorAll('th,td');
    ObjectHelper.each(nodes, function (k, v) {
        v.innerHTML = '<div>' + k + '</div>'
    });

    window.refreshList = function () {
        $.get('http://' + document.domain + '/api/index.php?r=note', function (fb) {
            if (fb.code == 200) {
                var html = '';
                for (var p in fb.list) {
                    html += '<li data-key="' + fb.list[p].id + '"><span class="title">' + fb.list[p].title + '</span><span class="time">' + toDatetime(fb.list[p].created_at) + '</span></li>'
                }
                $('#list').html(html);
            }
        });
    };
    window.refreshList();

    function toDatetime(stamp) {
        var d = new Date(stamp * 1000);
        return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes();
    }

    $('#list').on('click', 'li', function () {
        $.get('http://' + document.domain + '/api/index.php?r=note', {id: $(this).data('key')}, function (fb) {
            if (fb.code == 200) {
                $('#title').val(fb.data.title);
                $('#note-id').val(fb.data.id);
                $('#content-box').html(fb.data.content);
            } else {
                alert(fb.message);
            }
        });
    });

});