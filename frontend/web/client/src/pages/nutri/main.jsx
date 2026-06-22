import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../App.css';
import Navbar from '../../components/Navbar';

import Productos from './Productos';
import RegistrarCliente from './clientSearch';
import AsignarPlan from './assignPlan';
import GestionPlan from './GPlan';
import SeguimientoCliente from './seguimiento';

const NutricionistaDashboard = () => {
  const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
  const [vistaActiva, setVistaActiva] = useState('dashboard');
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.reload();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar onVerPerfil={() => setVistaActiva('cuenta')} onCerrarSesion={cerrarSesion} />

      <div className="admin-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Nutri<strong>TEC</strong></h2>
            <small style={{ color: '#94a3b8' }}>PANEL DE CONTROL</small>
          </div>

          <nav className="nav-menu">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'registrar-cliente', label: 'Registrar Cliente' },
              { id: 'gestion-plan', label: 'Gestionar Plan' },
              { id: 'planes', label: 'Asignar Plan' },
              { id: 'productos', label: 'Registrar Productos' },
              { id: 'seguimiento', label: 'Seguimiento de Cliente' },
              { id: 'cuenta', label: 'Mi Cuenta' }
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
                <h1>¡Bienvenido, {usuario.nombre}!</h1>
                <p>¿Qué gestión deseas realizar hoy en NutriTEC?</p>
              </header>
              <div className="admin-cards">
                <div className="card" onClick={() => setVistaActiva('registrar-cliente')}>
                  <h3>Registrar Cliente</h3>
                  <p>Añade nuevos pacientes al sistema.</p>
                </div>
                <div className="card" onClick={() => setVistaActiva('gestion-plan')}>
                  <h3>Gestionar Plan</h3>
                  <p>Visualiza y modifica los planes de alimentación existentes.</p>
                </div>
                <div className="card" onClick={() => setVistaActiva('planes')}>
                  <h3>Asignar Plan</h3>
                  <p>Estructura y asigna el calendario de comidas.</p>
                </div>
                <div className="card" onClick={() => setVistaActiva('productos')}>
                  <h3>Registrar Productos</h3>
                  <p>Gestiona los productos y sus valores nutricionales.</p>
                </div>
                <div className="card" onClick={() => setVistaActiva('seguimiento')}>
                  <h3>Seguimiento de Pacientes</h3>
                  <p>Revisa el progreso de los pacientes y añade observaciones.</p>
                </div>
                <div className="card" onClick={() => setVistaActiva('cuenta')}>
                  <h3>Mi Cuenta</h3>
                  <p>Administra tus datos personales.</p>
                </div>
              </div>
            </>
          )}

          {vistaActiva === 'registrar-cliente' && <RegistrarCliente />}
          {vistaActiva === 'gestion-plan' && <GestionPlan />}
          {vistaActiva === 'planes' && <AsignarPlan />}
          {vistaActiva === 'productos' && <Productos />}
          {vistaActiva === 'seguimiento' && <SeguimientoCliente />}

          {vistaActiva === 'cuenta' && (
            <div className="card border-0 shadow-sm p-4 bg-white rounded-3 mt-3">
              <h4 className="fw-bold mb-3" style={{ color: '#0f172a' }}>Mi Cuenta</h4>
              <p><strong>Nombre:</strong> {usuario.nombre} {usuario.ap1}</p>
              <p><strong>Rol:</strong> Nutricionista</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NutricionistaDashboard;