import React from 'react';

const Spinner = (props) => {
    props = Object.assign({}, props);
    if (!props.style) {
        props.style = {};
    }
    if (!props.style.fontSize) {
        props.style.fontSize = '200%';
    }

    return (
        <i className="fa fa-spinner fa-spin" {...props}></i>
    );
};

export default Spinner;