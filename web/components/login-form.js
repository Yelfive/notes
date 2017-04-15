/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

import React from 'react';
import Form from './form';
import CircularProgress from 'material-ui/CircularProgress';
import request from './request';

let LoginForm = React.createClass({
    loginSuccessfully: false,
    getInitialState() {
        return {username: '', password: '', errors: {}};
    },
    handleSubmit: function (e) {
        e.preventDefault();
        // focus at the form to blur the input
        this.loading();
        request(this.props.action, {dataType: 'json'})
            .then(data => {
                this.loginSuccessfully = true;
            })
            .catch(data => {
                console.log(data);
                let errors = data.errors || {password: data.message};
                this.setState({errors: errors});
            })
            .done(this.unLoading);
    },
    unLoading() {
        this.setState({loading: null})
    },
    componentDidUpdate() {
        if (!this.loginSuccessfully) return null;
        if (this.props.changePage instanceof Function)
            setTimeout(() => this.props.changePage(this.props.redirect), 1000);
    },
    loading() {
        const loadingStyle = {
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.5)'
        };
        this.setState({
            loading: (
                <div style={loadingStyle}>
                    <CircularProgress size={70}/>
                </div>
            )
        });
    },
    render() {
        const style = {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: 30,
            position: 'relative'
        };
        let containerStyle = {
            transformOrigin: '0 0',
            transform: `rotateZ(${this.loginSuccessfully ? 90 : 0}deg)`
        };
        return (
            <div className="container login flex center" style={containerStyle}>
                <Form onSubmit={this.handleSubmit} style={style}>
                    <Form.Input name="username"
                                placeholder="Username"
                                default={this.state.username}
                                error={this.state.errors.username}
                    />
                    <Form.Input name="password" type="password"
                                placeholder="Password"
                                default={this.state.password}
                                error={this.state.errors.password}
                    />
                    <Form.SubmitButton label="Login"/>
                    {this.state.loading}
                </Form>
            </div>
        )
    }
});

export default LoginForm;