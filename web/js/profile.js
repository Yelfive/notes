/**
 * Created by felix on 1/4/17.
 */

(function () {
    var data = {};

    function time() {
        return (new Date).getTime();
    }

    var recurseCount = 0;
    var recurseMax = 100;

    var Profile = {
        start: function () {
            data.st = time();
        },
        end: function () {
            data.et = time();
        },
        show: function () {
            console.log('Time elapsed: %c' + (data.et - data.st), 'color: red', 'ms');
        },
        recurse: function (count) {
            recurseCount++;
            count = count || recurseMax;
            if (recurseCount > count) {
                recurseCount = 0;
                throw new Error('Maximum recurse count exceeded, allowed: ' + count);
            }
        }
    };
    window.Profile = Profile;
})();