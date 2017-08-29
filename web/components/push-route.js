/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

import React from 'react';

let historyRegistered = false;

var defaultPage = 'index';

class Route {
    static registerHistory(render) {
        if (historyRegistered) return true;
        window.onpopstate = function (e) {
            if (e.state && typeof e.state === 'object') render(e.state.page);
        };
        window.history.replaceState({page: this.currentPage()}, '', window.location.pathname);
        historyRegistered = true;
    }

    static toPage(page) {
        this.to(page + '.html');
    }

    static to(url) {
        let data = {page: this.getPageName(url)};
        let history = global.history;
        history.pushState(data, url, url);
    }

    static currentPage() {
        return this.getPageName(location.pathname);
    }

    static getPageName(url) {
        let match = url.match(/^\/([\w-]+)\.html/);
        return match ? match[1] : defaultPage;
    }
}

export default Route;