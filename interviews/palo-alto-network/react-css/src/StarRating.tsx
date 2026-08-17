import React from "react";

interface StarRatingProps {
  rating: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span key={i} className="star">
        {i < rating ? "★" : "☆"}
      </span>
    );
  }

  return <div className="star-rating">{stars}</div>;
};

export default StarRating;