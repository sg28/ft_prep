import React, { useEffect, useState } from "react";

function ProgressBar() {
    const [count, setCount] = useState(0);
    const [color, setColor] = useState("blue");

    useEffect(() => {
        const comp_interval = setInterval(() => {
            setCount((prevCount) => {
                if (prevCount >= 10) {
                    resetProgress()
                    clearInterval(comp_interval);
                    return prevCount;
                }
                return prevCount + 1;
            });
        }, 1000);

        return () => {
            resetProgress()
            clearInterval(comp_interval);
        };
    }, []);

    useEffect(() => {
        if (count === 10) {
            setColor("red");
        } else if (count === 0) {
            setColor("blue");
        }
    }, [count]);

    const resetProgress = () => {
        setCount(0);
        setColor("blue");
    };

    return (
        <div style={{
            border: "1px solid lightblue",
            width: "50%",
            margin: "auto"
        }}
        >
            <div>Progress: {count}</div>
            <div
                style={{
                    width: `${count * 10}%`,
                    height: "20px",
                    background: color,
                    marginTop: "10px",
                    transition: "width 0.5s, background 0.5s", // Smooth transitions
                }}
            ></div> 
        </div>
    );
}

export default ProgressBar;
