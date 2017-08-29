
const reducer = (state = 0, action) => {
    switch (action.type) {
        case 'INCREASE':
            return ++state;
        case 'DECREASE':
            return --state;
        default:
            return state;
    }
} 

const {subscribe, dispatch, getState} = createStore(reducer);

const render = () => {
    document.body.innerText = getState();
}

render();
subscribe(render);

document.addEventListener('click', () => {
    dispatch({type: 'INCREASE'});
});