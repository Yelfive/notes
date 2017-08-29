/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

import React from 'react';
import AppBar from 'material-ui/AppBar';
import Avatar from 'material-ui/Avatar';

let PageIndex = React.createClass({
    render() {
        let avatarStyle = {
            marginTop: 4
        };
        return (
            <div>
                <AppBar
                    title="Title"
                    iconElementRight={<Avatar src="" style={avatarStyle}/>}
                />
            </div>
        )
    }
});

export default PageIndex;