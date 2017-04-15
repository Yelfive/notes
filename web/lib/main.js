/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Route from '../components/push-route';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Index from '../components/page-index';
import LoginForm from '../components/login-form';
//noinspection JSUnresolvedVariable
//
injectTapEventPlugin();

let action = 'http://notes.fk.com/api/index.php?r=test';
/**
 * @var {Object} A map of components class
 *  - key: string
 *      The page name, e.g. /index.html => key = index
 *  - value: array
 *      - first
 *          Component class
 *      - ...rest
 *          Default props for the the component
 */
let Components = {
    index: [Index],
    login: [LoginForm, {action: action, redirect: 'index'}]
};

let App = React.createClass({
    componentDidMount() {
        Route.registerHistory(this.renderPage);
    },
    getInitialState() {
        return {
            page: Route.currentPage()
        }
    },
    changePage(page) {
        Route.toPage(page);
        this.renderPage(page);
    },
    renderPage(page) {
        this.setState({page: page});
    },
    render() {
        let [Page, props] = Components[this.state.page];
        if (!Page) {
            Route.to('index.html');
            console.warn('Page is not found, should redirect page to index');
            return null;
        }
        return (
            <MuiThemeProvider>
                <Page {...props} changePage={this.changePage}/>
            </MuiThemeProvider>
        )
    }
});

ReactDOM.render(
    <App/>,
    document.getElementById('content')
);
