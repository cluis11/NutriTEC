import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Main from './pages/main';
import Paciente from './pages/clientSearch';
import Plan from './pages/createPlan';
// 1. Importar Archivos

// 2. Definir Rutas
function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/pacientes" element={<Paciente />} />
      <Route path="/planes" element={<Plan />} />
    </Routes>
  );
}

export default App;