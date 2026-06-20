import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Main from './pages/main';
import Medida from './pages/insertMedida';
import Productos from './pages/Productos';
import Reporte from './pages/reporte';

function App() {
  return <Main />;
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/medida" element={<Medida />} />
      <Route path="/productos" element={<Productos />} />
      <Route path="/reporte" element={<Reporte />} />
    </Routes>
  );
}

export default App;