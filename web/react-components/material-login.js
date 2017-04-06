/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

import TextField from 'material-ui/TextField';
// import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

let LoginForm = React.createClass({
    render() {
        return (
            <div>
                <TextField hintText="Username"/>
                <TextField hintText="Password" type="password" floatingLabelText="Password"/>
            </div>
        )
    }
});

export default LoginForm;