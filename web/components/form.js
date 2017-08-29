/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

import React from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

let Form = React.createClass({
    render(){
        return (
            <form onSubmit={this.props.onSubmit} className={this.props.className} style={this.props.style}>
                {this.props.children}
            </form>
        )
    }
});

Form.Input = React.createClass({
    getInitialState() {
        return {value: this.props.default, error: this.props.error};
    },
    handleChange (e) {
        this.setState({
            value: e.target.value,
            error: ''
        });
    },
    componentWillReceiveProps() {
        if (this.props.error) this.setState({error: this.props.error})
    },
    render() {
        const errorStyle = {
            transition: 'none',
            position: 'absolute',
            bottom: -6
        };
        const style = {
            bottom: 20,
            width: '100%'
        };
        return (
            <div>
                <TextField
                    type={this.props.type || 'text'}
                    name={this.props.name}
                    value={this.state.value}
                    className={this.props.className || ''}
                    onChange={this.handleChange}
                    hintText={this.props.placeholder}
                    floatingLabelText={this.props.placeholder}
                    errorText={this.state.error}
                    autoComplete="Off"
                    errorStyle={errorStyle}
                    style={style}
                />
            </div>
        )
    }
});

Form.SubmitButton = React.createClass({
    render() {
        return (
            <div>
                <RaisedButton  type="submit"
                               label={this.props.label}
                               primary={true}
                               fullWidth={true}
                />
            </div>
        );
    }
});

export default Form;