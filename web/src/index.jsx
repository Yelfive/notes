/**
 * Created by felix on 4/1/17.
 */

// import React from 'react';
import ReactDOM from 'react-dom';

let Hello = React.createClass({
    render: function () {
        return (
            <div>Hello World</div>
        )
    }
});

ReactDOM.render(
    <Hello/>,
    document.getElementById('content')
);