import React, { useState, useEffect } from "react";

export default function TrafficLight() {
  const [light, setLight] = useState("red");
  const [lights] = useState(["red", "orange", "green"]);
  const [lightIndex, setLightIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLightIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % lights.length;
        setLight(lights[nextIndex]);
        return nextIndex;
      });
    }, 2000);

    return () => {
      clearInterval(interval);
      setLight("red");
    };
  }, [lights]);

  return (
    <>
      <style>{`
        .main-component {
          text-align: center;
        }

        .title {
          font-weight: bold;
          margin-bottom: 10px;
        }

        .lights-container {
          width: 25%;
          margin: auto;
          padding: 5px;
          margin-top: 5px;
          border-radius: 5px;
          border: 1px solid lightblue;
        }

        .light-box {
          border-radius: 4px;
          margin: 2px;
          border: 1px solid transparent;
          color: #fff;
          padding: 10px;
          text-transform: capitalize;
        }

        .light-box.red {
          border-color: red;
        }

        .light-box.orange {
          border-color: orange;
        }

        .light-box.green {
          border-color: green;
        }

        .light-box.active.red {
          background-color: red;
        }

        .light-box.active.orange {
          background-color: orange;
        }

        .light-box.active.green {
          background-color: green;
        }
      `}</style>

      <div className="main-component">
        <div className="title">Traffic Light</div>
        <div className="lights-container">
          {lights.map((lightColor, index) => (
            <div
              key={index}
              className={`light-box ${lightColor} ${
                index === lightIndex ? "active" : ""
              }`}
            >
              {lightColor}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
