import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Admin from './pages/admin';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Admin />} />
    </Routes>
  );
}

export default App;