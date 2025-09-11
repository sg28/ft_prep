import React, { useState } from 'react';

const styles = {
    container: {
        padding: "20px",
        textAlign: "center",
    },
    title: {
        margin: "0 0 20px 0",
        color: "#333",
        fontSize: "18px",
    },
    button: {
        padding: "12px 24px",
        borderRadius: "4px",
        borderWidth: "2px",
        borderStyle: "solid",
        backgroundColor: "white",
        fontSize: "16px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        fontWeight: "500",
    },
};

export default function ButtonState() {
    let [btnBorderColor, setbtnBorderColor] = useState("lightgray");
    
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
        <div style={styles.container}>
            <h5 style={styles.title}>Button State Component</h5>
            <button 
                style={{
                    ...styles.button,
                    borderColor: btnBorderColor,
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