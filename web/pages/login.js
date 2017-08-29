/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */


import React, { Component } from 'react';
import Form from '../components/form';
import styles from '../css/login.css';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = { username: '', password: '', errors: {} };
    }

    handleSubmit(e) {
        e.preventDefault();

        // change page
        this.context.router.history.push('/index');
    }

    componentWillUnmount() {
    }

    render() {

        return (
            <div className="login">
                <Form onSubmit={this.handleSubmit.bind(this)}>
                    <Form.Input
                        name="username"
                        placeholder="Username"
                        default={this.state.username}
                        error={this.state.errors.username}
                    />
                    <Form.Input
                        name="password" type="password"
                        placeholder="Password"
                        default={this.state.password}
                        error={this.state.errors.password}
                    />
                    <Form.SubmitButton label="Login" />
                    {this.state.loading}
                </Form>
            </div>
        )
    }
}

Login.contextTypes = {
    router: React.PropTypes.object
}

export default Login;
