import React, { useState } from "react";
import '../../App.css';
import Navbar from '../../components/Navbar';

import Aprobacion from "./revision_produ";
import Cobros from "./cobro";

const Admin = () => {
  const [vistaActiva, setVistaActiva] = useState('dashboard');

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.reload();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar onVerPerfil={() => {}} onCerrarSesion={cerrarSesion} />

      <div className="admin-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Nutri<strong>TEC</strong></h2>
            <small style={{ color: '#94a3b8' }}>ADMIN PANEL</small>
          </div>

          <nav className="nav-menu">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'aprobacion', label: 'Aprobación' },
              { id: 'cobros', label: 'Reporte Cobro' }
            ].map((item) => (
              <div
                key={item.id}
                className={`nav-item ${vistaActiva === item.id ? 'active' : ''}`}
                onClick={() => setVistaActiva(item.id)}
              >
                <span>{item.label}</span>
              </div>
            ))}
          </nav>

          <div className="nav-item logout" onClick={cerrarSesion}>
            <span>Cerrar Sesión</span>
          </div>
        </aside>

        <main className="main-content">
          {vistaActiva === 'dashboard' && (
            <>
              <header className="header-title">
                <h1>¡Bienvenido, Admin!</h1>
                <p>¿Qué gestión deseas realizar hoy en NutriTEC?</p>
              </header>
              <div className="admin-cards">
                <div className="card" onClick={() => setVistaActiva('aprobacion')}>
                  <h3>Aprobación Productos</h3>
                  <p>Verifica y aprueba los alimentos sugeridos por los usuarios.</p>
                </div>
                <div className="card" onClick={() => setVistaActiva('cobros')}>
                  <h3>Reporte de Cobro</h3>
                  <p>Verifica las tarifas y cobros calculados para los nutricionistas activos.</p>
                </div>
              </div>
            </>
          )}
          {vistaActiva === 'aprobacion' && <Aprobacion />}
          {vistaActiva === 'cobros' && <Cobros />}
        </main>
      </div>
    </div>
  );
};

export default Admin;