/**
 * Created by felix on 4/1/17.
 */

/**
 * @var {React} React
 */
let Hello = React.createClass({
    render: function () {
        return (
            <div>Hello World</div>
        )
    }
});

/**
 * @var {ReactDOM} ReactDOM
 */
ReactDOM.render(
    <Hello/>,
    document.getElementById('content')
);