import React from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from './pages/MainLayout';
import MemberProfile from './pages/MemberProfile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />} />
      <Route path="/member/:id" element={<MemberProfile />} />
    </Routes>
  );
}

export default App;