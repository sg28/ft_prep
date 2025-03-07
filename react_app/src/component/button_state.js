import React, { useState } from 'react';


export default function ButtonState() {

    let [btnBorderColor, setbtnBorderColor] = useState("");
    let [btnStyles, setbtnStyles] = useState(
        {
            borderColor: btnBorderColor,
            padding: "1%",
            borderRadius: "4px",
        }
    )
    
    let buttonClicked = () => {
        setbtnBorderColor("green");
    }

    let buttonHover = () => {
        setbtnBorderColor("blue");
    }

    let buttonLeave = () => {
        setbtnBorderColor("lightgray");
    }

    return (
        <div>
            <h5>Button State Component</h5>
            <button style={{
                borderColor: btnBorderColor,
                padding: "1%",
                borderRadius: "4px",
            }}
                onClick={buttonClicked}
                onMouseEnter={buttonHover}
                onMouseLeave={buttonLeave}
            >
                Button Me
            </button>
        </div>
    )
}