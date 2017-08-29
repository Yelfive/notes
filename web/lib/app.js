/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import { CSSTransitionGroup } from 'react-transition-group';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';

//
injectTapEventPlugin();

// let action = 'http://notes.fk.com/api/index.php?r=test';

import Animate from '../components/animate';

// Custom page
import Login from '../pages/login';
import Index from '../pages/index';

// CSS
import '../css/app.css';
// import '../css/app.less';
import '../css/login.css';

class Main extends React.Component {

    render() {

        return (
            <MuiThemeProvider>
                <Router>
                    <Route render={({ location }) =>
                        <Animate>
                            <Route location={location} exact path="/login" component={Login} />
                            <Route location={location} exact path="/index" component={Index} />
                        </Animate>
                    } />
                </Router>
            </MuiThemeProvider>
        )
    }
}

ReactDOM.render(
    <Main />,
    document.getElementById('playground')
);
