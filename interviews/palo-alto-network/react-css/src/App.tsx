import React from "react";
import ProfileCard from "./ProfileCard";
import "./App.css";

const App: React.FC = () => {
  const dog = "/dog.png";

  return (
    <ProfileCard
      name="Lucky Lab"
      role="Puppy Master"
      rating={3}
      posts={5896}
      followers={8952}
      likes={6545}
    >
      <img src={dog} alt="Lucky Lab" />
    </ProfileCard>
  );
};

export default App;