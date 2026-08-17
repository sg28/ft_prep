import React, { ReactNode } from "react";
import StarRating from "./StarRating"; // Import the StarRating component

interface ProfileCardProps {
  name: string;
  role: string;
  rating: number;
  posts: number;
  followers: number;
  likes: number;
  children: ReactNode;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  role,
  rating,
  posts,
  followers,
  likes,
  children,
}) => (
  <div className="profile-card">
    <div className="profile-picture">{children}</div>
    <h1>{name}</h1>
    <p className="profile-role">{role}</p>
    <StarRating rating={rating} />
    <p className="profile-tag">
      The Golden Retriever is a dog breed of retriever dog of medium size.
    </p>
    <div className="social-stats">
      <div className="stat-wrapper">
        <p className="state-value">{posts}</p>
        <p className="state-title">Post</p>
      </div>
      <div className="stat-wrapper">
        <p className="state-value">{followers}</p>
        <p className="state-title">Followers</p>
      </div>
      <div className="stat-wrapper">
        <p className="state-value">{likes}</p>
        <p className="state-title">Likes</p>
      </div>
    </div>
  </div>
);

export default ProfileCard;