/**
 * Created by felix on 4/1/17.
 */
;(function () {
    var match;
    if (match = window.location.pathname.match(/^\/([\w-]+)\.html$/)) {
        var src = match[1];
        document.write('<script src="/lib/' + src + '-bundle.js"></script>');
    } else {
        console.error('Page of path ' + window.location.pathname + ' not found');
        return false;
    }
    
})();