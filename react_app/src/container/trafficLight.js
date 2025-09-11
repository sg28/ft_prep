import React, { useState, useEffect } from "react";

const styles = {
  lightsContainer: {
    width: "25%",
    margin: "auto",
    padding: "5px",
    marginTop: "5px",
    borderRadius: "5px",
    border: "1px solid lightblue",
  },
  lightBulb: {
    border: "1px solid",
    borderRadius: "4px",
    margin: "2px",
    color: "#fff",
  }
};

export default function TrafficLight() {
  const [lights] = useState(["red", "orange", "green"]);
  const [lightIndex, setLightIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLightIndex((prevIndex) => {
        const nextIndex = prevIndex + 1 === lights.length ? 0 : prevIndex + 1;
        return nextIndex;
      });
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [lights]);

  return (
    <div className="main_component">
      <div> Traffic Light</div>
      <div
        className="lights"
        style={styles.lightsContainer}
      >
        {lights.map((light, index) => {
          return (
            <div
              key={index}
              className={light}
              style={{
                ...styles.lightBulb,
                backgroundColor: index === lightIndex ? light : "#fff",
                borderColor: light,
              }}
            >
              {light}{" "}
            </div>
          );
        })}
      </div>
    </div>
  );
}
