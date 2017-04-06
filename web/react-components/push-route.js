/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

class Route {
    static to(url) {
        global.history.pushState({}, '', url);
        // fetch(url)
        //     .then(response => response.text())
        //     .then(function (text) {
        //         //
        //     });
    }
}

export default Route;