import React, { useState } from 'react';
import Login from './pages/Login';
import MainCliente from './pages/client/main';
import MainNutri from './pages/nutri/main';
import MainAdmin from './pages/admin/admin';

function App() {
  const [usuario, setUsuario] = useState(() => {
    const stored = localStorage.getItem("usuario");
    return stored ? JSON.parse(stored) : null;
  });

  const handleLoginExitoso = (data) => setUsuario(data);

  if (!usuario) {
    return <Login onLoginExitoso={handleLoginExitoso} />;
  }

  if (usuario.rol === 'admin') return <MainAdmin />;
  if (usuario.rol === 'nutricionista') return <MainNutri />;
  return <MainCliente />;
}

export default App;