import React, { useEffect } from "react";
import { useState } from "react";
import "./men.css";

import men1 from "../../../assets/men/men1.avif";
import men2 from "../../../assets/men/men2.avif";
import men3 from "../../../assets/men/men3.avif";
import men4 from "../../../assets/men/men4.avif";

function Men() {
  let [items, setItems] = useState([
    {
      id: 1,
      name: "Classic T-Shirt",
      price: 19.99,
      image: men1,
      description: "A comfortable cotton t-shirt for everyday wear.",
    },
    {
      id: 2,
      name: "Leather Bag",
      price: 49.99,
      image: men2,
      description: "Stylish leather bag for work or travel.",
    },
    {
      id: 3,
      name: "Running Shoes",
      price: 59.99,
      image: men3,
      description: "Lightweight running shoes for all terrains.",
    },
    {
      id: 4,
      name: "Denim Jacket",
      price: 39.99,
      image: men4,
      description: "Trendy denim jacket for casual outings.",
    },
  ]);

  return (
    <div className="main-item-container">
      <div className="item-container">
        <div className="items">
          {items.map((elem, i) => (
            <div className="items-column" key={elem.id}>
              <div className="item-elem-image">
                <img
                  src={elem.image}
                  alt={elem.name}
                  style={{ width: "100px" }}
                />
              </div>
              <div className="item-elem-spacer"></div>
              <div className="item-elem-description">
                <div>{elem.name}</div>
                <div>{elem.description}</div>
              </div>
              <div className="item-elem-price">{elem.price}</div>
              <div className="item-elem-quantity">
                <button> + Add</button>
                <button> - remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="side-container"></div>
    </div>
  );
}

export default Men;
