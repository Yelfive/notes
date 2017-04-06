/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */
import React from 'react';
import TextField from 'material-ui/TextField';

let Form = React.createClass({
    render(){
        return (
            <form onSubmit={this.props.onSubmit}>
                {this.props.children}
            </form>
        )
    }
});

Form.Input = React.createClass({
    getInitialState() {
        return {value: this.props.default};
    },
    handleChange (e) {
        this.setState({value: e.target.value});
    },
    render() {
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
                    errorText={this.props.error}
                />
            </div>

        )
    }
});

Form.SubmitButton = React.createClass({
    render() {
        return (
            <div>
                <input type="submit" value={this.props.value || 'Submit'} name={this.props.name || 'submit'}/>
            </div>
        );
    }
});

export default Form;