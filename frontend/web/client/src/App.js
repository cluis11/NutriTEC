import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Main from './pages/main';
import Medida from './pages/insertMedida';
import Productos from './pages/Productos';
import Reporte from './pages/reporte';

function App() {
  const [usuario, setUsuario] = useState(() => {
    const stored = localStorage.getItem("usuario");
    return stored ? JSON.parse(stored) : null;
  });

  const handleLoginExitoso = (data) => setUsuario(data);

  if (!usuario) {
    return <Login onLoginExitoso={handleLoginExitoso} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/medida" element={<Medida />} />
      <Route path="/productos" element={<Productos />} />
      <Route path="/reporte" element={<Reporte />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;