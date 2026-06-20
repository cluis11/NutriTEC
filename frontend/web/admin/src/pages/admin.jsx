import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "../App.css";

// Importar paginas
import Aprobacion from "./revision_produ";
import Cobros from "./cobro";

const Admin = () => {
  const [vistaActiva, setVistaActiva] = useState('dashboard');
  const navigate = useNavigate();
  
  const cerrarSesion = () => {
    navigate('/'); // REDIRIGIR AL LOGIN, FALTA IMPLEMENTAR, TAMBIEN SE DEBERIA DE AJUSTAR RUTA EN APP.JS
  };

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Nutri<strong>TEc</strong></h2>
          <small>ADMIN PANEL</small>
        </div>

        <nav className="nav-menu">
          <div 
            className={`nav-item ${vistaActiva === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setVistaActiva('dashboard')}
          >
            <span>Dashboard</span>
          </div>
          
          <div 
            className={`nav-item ${vistaActiva === 'aprobacion' ? 'active' : ''}`} 
            onClick={() => setVistaActiva('aprobacion')}
          >
            <span>Aprobación</span>
          </div>

          <div 
            className={`nav-item ${vistaActiva === 'cobros' ? 'active' : ''}`} 
            onClick={() => setVistaActiva('cobros')}
          >
            <span>Reporte Cobro</span>
          </div>
        </nav>

        <div className="nav-item logout" onClick={cerrarSesion}>
          Cerrar Sesión
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL*/}
      <main className="main-content">
        
        {vistaActiva === 'dashboard' && (
          <>
            <header className="header-title">
              <h1>¡Bienvenido!</h1>
              <p>¿Qué gestión deseas realizar hoy en NutriTEc?</p>
            </header>

            {/* Tarjetas */}
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

        {/* Renderizado de las sub-páginas independientes */}
        {vistaActiva === 'aprobacion' && <Aprobacion />}
        {vistaActiva === 'cobros' && <Cobros />}
        
      </main>
    </div>
  );
};

export default Admin;