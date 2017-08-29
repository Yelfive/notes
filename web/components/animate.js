
import { CSSTransitionGroup } from 'react-transition-group';
import React, { Component } from 'react';

export default class Animate extends Component {

    counter = 1;

    transitionDuration = 300;

    render() {
        return (
            <CSSTransitionGroup
                transitionName="pager"
                transitionEnterTimeout={this.transitionDuration}
                transitionLeaveTimeout={this.transitionDuration}
            >
                <div className="pages" key={this.counter++}>
                    {this.props.children}
                </div>
            </CSSTransitionGroup>
        )
    }
}