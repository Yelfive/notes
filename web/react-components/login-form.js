/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

// import Route from './push-route';
// class LoginForm extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {username: '', password: ''};
//         this.handleInput = this.handleInput.bind(this);
//         this.handleSubmit = this.handleSubmit.bind(this);
//     }
//
//     handleInput(e) {
//         let obj = {};
//         obj[e.target.name] = e.target.value;
//         this.setState(obj);
//     }
//
//     handleSubmit(e) {
//         e.preventDefault();
//         let api = this.props.action;
//         if (!api) return false;
//         console.log(api);
//         fetch(api, {})
//             .then(response => response.json())
//             .then(function (data) {
//                 if (data.code == 200) {
//                     Route.to('/abc.html');
//                 }
//             }.bind(this));
//     }
//
//     render() {
//         return (
//             <div>
//                 <form onSubmit={this.handleSubmit}>
//                     <input type="text" name="username" placeholder="Username"
//                            value={this.state.username}
//                            onChange={this.handleInput}
//                     />
//                     <span>{this.state.errors.username}</span>
//                     <input type="password" name="password" placeholder="Password"
//                            value={this.state.password}
//                            onChange={this.handleInput}
//                     />
//                     <span>{this.state.errors.password}</span>
//                     <input type="submit" name="submit"/>
//                 </form>
//             </div>
//         );
//     }
// }
import React from 'react';
import Form from 'components/form';

let LoginForm = React.createClass({
    getInitialState() {
        return {username: '', password: '', errors: {}};
    },
    handleSubmit: function (e) {
        e.preventDefault();
        this.setState({errors: {password: 'Invalid password'}});
    },
    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                <Form.Input name="username"
                            default={this.state.username}
                            error={this.state.errors.username}
                            placeholder="Username"
                />
                <Form.Input name="password" type="password"
                            default={this.state.password}
                            error={this.state.errors.password}
                            placeholder="Password"
                />
                <Form.SubmitButton/>
            </Form>
        )
    }
});

export default LoginForm;