import React, { useEffect } from "react";
import { useState, useMemo } from "react";
import "./header.css";

function Header(props) {
  let [title, setTitle] = useState("Out-Street");
  let [location, setLocation] = useState({
    streetName: "Divon Street",
    state: "California",
    zip: "94086",
  });
  let [navs, setNavs] = useState(["search", "store", "signin", "brands"]);

  useEffect(() => {
    console.log(" onload ");
  }, []);

  useEffect(() => {
    return () => {};
  }, []);

  return (
    <div className="header-container">
      <div className="location">{location.streetName}</div>
      <div className="title">{title}</div>
      <div className="navs">
        {navs.map((elem, i) => {
          return (
            <div className="navs-element" key={i}>
              <span className="nav-elements-text">{elem}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Header;
