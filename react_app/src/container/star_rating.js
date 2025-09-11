import React, { useState } from "react";

const styles = {
  container: {
    padding: "20px",
  },
  title: {
    marginBottom: "15px",
    color: "#333",
  },
  starContainer: {
    marginBottom: "10px",
  },
  star: {
    cursor: "pointer",
    fontSize: "24px",
    marginRight: "5px",
    transition: "color 0.2s ease",
  },
  rating: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#555",
  },
};

export default function StarRating() {
  const [starRating, setStarRating] = useState(0);

  const clickStar = (index) => {
    setStarRating(index + 1);
  };

  return (
    <div style={styles.container}>
      <h5 style={styles.title}>Star Rating</h5>
      <div className="star-rating" style={styles.starContainer}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            onClick={() => clickStar(i)}
            style={{
              ...styles.star,
              color: i < starRating ? "gold" : "gray",
            }}
          >
            ★
          </span>
        ))}
      </div>
      <p style={styles.rating}>Rating: {starRating}</p>
    </div>
  );
}
