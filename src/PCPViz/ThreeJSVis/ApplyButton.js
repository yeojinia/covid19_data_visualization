import React from "react";
import {Button} from "react-bootstrap";

export default function ApplyButton() {
    const buttonStyle = {
        fontSize: '12px',
        color: "#fff",
        backgroundColor: "#5a6268",
        borderColor: "#6c757d",
        width: "100px",
        height: "30px",

    };

    const handleClick = () => {};

    return(<>
            <Button
                onClick = {handleClick}
                style={buttonStyle}>
                {'Apply'}
            </Button>
        </>
    );
}