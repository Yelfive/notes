/**
 * Created by felix on 11/3/16.
 */

$(function () {
    $('#content-box').keydown(function (e) {
        var key, callback, code = e.keyCode;
        key = CodeKey[code];
        callback = KeyFunction[key + 'Down'];
        if (key) KeyFunction.keyDown(key);
        if (key && callback instanceof Function) {
            /*
             * callback should return bool to suggest whether event runs default action
             * - true: perform the default
             * - false: prevent the default
             */
            callback.apply(KeyFunction, [e]) || e.preventDefault();
        } else {
            console.log('"' + e.keyCode + '":', '"' + e.key.replace(/^[a-z]/, function (v) {
                    return v.toUpperCase()
                }) + '"');
        }

    }).keyup(function (e) {
        var key, callback, code = e.keyCode;
        key = CodeKey[code];
        callback = KeyFunction[key + 'Up'];
        // todo: optimism lDown = true stuff
        if (key) KeyFunction.keyUp(key);
        if (key && callback instanceof Function) {
            callback.apply(KeyFunction, [e]) || e.preventDefault();
        }
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

    window.onbeforeunload = function () {
        return false;
    }

});