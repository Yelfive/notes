/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

import React from 'react';
import ReactDOM from 'react-dom';
import LoginForm from 'components/login-form';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

let action = 'http://notes.fk.com/api/index.php?r=test';
let App = React.createClass({
    render() {
        return (
            <MuiThemeProvider>
                <LoginForm action={action}/>
            </MuiThemeProvider>
        )
    }
});

ReactDOM.render(
    <App />,
    document.getElementById('content')
);
