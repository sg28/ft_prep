import React, { useState } from "react";

export default function StarRating() {
  const [starRating, setStarRating] = useState(0);

  const clickStar = (index) => {
    setStarRating(index + 1); // Setting rating to 1-based index
  };

  return (
    <div>
      <h5>Star Rating</h5>
      <div className="star-rating">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            onClick={() => clickStar(i)}
            style={{
              cursor: "pointer",
              fontSize: "24px",
              color: i < starRating ? "gold" : "gray",
            }}
          >
            ★
          </span>
        ))}
      </div>
      <p>Rating: {starRating}</p>
    </div>
  );
}
