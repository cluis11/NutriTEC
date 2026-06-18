import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../App.css'; 

// ==========================================
// Importamos los módulos de cada seccion
// ==========================================
import RegistrarCliente from './clientSearch';
import AsignarPlan from './createPlan';
import GestionPlan from './nuevoPlan';
// Descomentacuando cuando se crea los archivos
// import RegistrarCuenta from './RegistrarCuenta';
// import CatalogoProductos from './CatalogoProductos';
// import SeguimientoCliente from './SeguimientoCliente';

const NutricionistaDashboard = () => {
  const [vistaActiva, setVistaActiva] = useState('dashboard');
  const navigate = useNavigate();

  const cerrarSesion = () => {
    navigate('/'); 
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Nutri<b>TEC</b></h2>
          <small>PANEL DE CONTROL</small>
        </div>

        <nav className="nav-menu">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'registrar-cliente', label: 'Registrar Cliente' },
            { id: 'gestion-plan', label: 'Gestionar Plan' },
            { id: 'planes', label: ' Asignar Plan' },
            { id: 'productos', label: 'Registrar Productos' },
            { id: 'seguimiento', label: 'Seguimiento de Cliente' },
            { id: 'medidas', label: 'Medidas Personales' }
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
        
        {/* vista por defecto */}
        {vistaActiva === 'dashboard' && (
          <>
            <header className="header-title">
              <h1>¡Bienvenido Nutricionista!</h1>
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

              <div className="card" onClick={() => setVistaActiva('medidas')}>
                <h3>Administrar Cuenta</h3>
                <p>Registra sus datos personales.</p>
              </div>
            </div>
          </>
        )}

        {/* ==========================================
            Renderizamos cada componente según la vista activa
           ========================================== */}
        {vistaActiva === 'registrar-cliente' && <RegistrarCliente />}

        {vistaActiva === 'gestion-plan' && <GestionPlan />}

        {vistaActiva === 'planes' && <AsignarPlan />}
        {/* Cuando se cree los archivos, primero se importa arriba, 
          se rederiza aca
          
          {vistaActiva === 'registro' && <RegistrarCuenta />}
          {vistaActiva === 'productos' && <CatalogoProductos />}
          {vistaActiva === 'seguimiento' && <SeguimientoCliente />}
        */}
        
      </main>
    </div>
  );
};

export default NutricionistaDashboard;