/**
 * Created by felix on 11/3/16.
 */

$(function () {
    $('#content-box').keydown(function (e) {
        // $('#content-box').keydown(function (e) {
        var key, callback, code = e.keyCode;
        key = CodeKey[code];
        callback = KeyFunction[key + 'Down'];
        if (key && callback instanceof Function) {
            /*
             * callback should return bool to suggest whether event runs default action
             * - true: runs default
             * - false: prevent default
             */
            callback(e) || e.preventDefault();
        } else {
            console.log(e.keyCode, e.key);
        }
    }).keyup(function (e) {
        var key, callback, code = e.keyCode;
        key = CodeKey[code];
        callback = KeyFunction[key + 'Up'];
        if (key && callback instanceof Function) {
            callback(e) || e.preventDefault();
        }
    });

});