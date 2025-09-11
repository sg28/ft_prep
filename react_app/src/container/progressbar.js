import React, { useEffect, useState } from "react";

const styles = {
    container: {
        border: "1px solid lightblue",
        width: "50%",
        margin: "auto"
    },
    progressText: {
        fontSize: "16px",
        marginBottom: "5px"
    },
    progressBar: {
        height: "20px",
        marginTop: "10px",
        transition: "width 0.5s, background 0.5s"
    }
};

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
        <div style={styles.container}>
            <div style={styles.progressText}>Progress: {count}</div>
            <div
                style={{
                    ...styles.progressBar,
                    width: `${count * 10}%`,
                    background: color
                }}
            ></div> 
        </div>
    );
}

export default ProgressBar;
