/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

import React from 'react';
import AppBar from 'material-ui/AppBar';

let Welcome = React.createClass({
    render() {
        return (
            <div>
                <AppBar
                    title="Title"
                    iconClassNameRight="muidocs-icon-navigation-expand-more"
                />
                <a href="notes.html">My Notes</a>
            </div>
        )
    }
});

export default Welcome;