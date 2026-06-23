import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../../App.css';
import Navbar from '../../components/Navbar';

import Productos from './Productos';
import RegistrarCliente from './clientSearch';
import AsignarPlan from './assignPlan';
import GestionPlan from './GPlan';
import SeguimientoCliente from './seguimiento';

const API_URL = process.env.REACT_APP_API_URL;

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
          {vistaActiva === 'cuenta' && <MiCuenta />}
        </main>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// VISTA MI CUENTA — Editar perfil del nutricionista incluyendo foto
// ────────────────────────────────────────────────────────────────────────────
const MiCuenta = () => {
  const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
  const idUsuario = usuario.id_usuario;

  const [datos, setDatos] = useState(null);
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [fotoPreview, setFotoPreview] = useState(null);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        setCargando(true);
        const response = await fetch(`${API_URL}/api/nutricionista/${idUsuario}`);
        if (!response.ok) throw new Error("Error al cargar perfil");
        const data = await response.json();
        setDatos(data);
        setFotoPreview(data.foto || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargarPerfil();
  }, [idUsuario]);

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError("La foto no puede pesar más de 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setDatos({ ...datos, foto: reader.result });
      setFotoPreview(reader.result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      setError("");
      setMensaje("");
      const response = await fetch(`${API_URL}/api/nutricionista/${idUsuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || "Error al guardar");
      setMensaje("Perfil actualizado correctamente.");
      setEditando(false);

      // Actualizar usuario en localStorage con la foto nueva
      const usuarioActual = JSON.parse(localStorage.getItem('usuario')) || {};
      usuarioActual.foto = datos.foto;
      localStorage.setItem('usuario', JSON.stringify(usuarioActual));
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <p>Cargando perfil...</p>;
  if (!datos) return <div className="alert alert-danger">No se pudo cargar el perfil.</div>;

  return (
    <div>
      <header className="header-title mb-4">
        <h1>Mi Cuenta</h1>
        <p>Gestiona tus datos personales.</p>
      </header>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        <div className="col-12 col-md-4">
          <div className="bg-white rounded-3 shadow-sm p-4 text-center">
            <div style={{ width: "150px", height: "150px", margin: "0 auto", borderRadius: "50%", overflow: "hidden", border: "4px solid #1abc9c", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {fotoPreview ? (
                <img src={fotoPreview} alt="Foto perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "60px", color: "#94a3b8" }}>👤</span>
              )}
            </div>
            {editando && (
              <div className="mt-3">
                <label className="btn btn-outline-success btn-sm">
                  📷 Cambiar foto
                  <input type="file" accept="image/*" onChange={handleFotoChange} style={{ display: "none" }} />
                </label>
                <p className="text-muted small mt-2 mb-0">Máx 1 MB</p>
              </div>
            )}
            <h4 className="fw-bold mt-3 mb-1" style={{ color: "#1e293b" }}>{datos.nombre} {datos.ap1}</h4>
            <p className="text-muted small mb-0">Nutricionista</p>
          </div>
        </div>

        <div className="col-12 col-md-8">
          <div className="bg-white rounded-3 shadow-sm p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Información personal</h5>
              {!editando ? (
                <button className="btn btn-outline-success btn-sm" onClick={() => setEditando(true)}>
                  ✏️ Editar
                </button>
              ) : (
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => { setEditando(false); setError(""); }}>
                    Cancelar
                  </button>
                  <button className="btn btn-success btn-sm" onClick={handleGuardar} disabled={guardando}>
                    {guardando ? "Guardando..." : "💾 Guardar"}
                  </button>
                </div>
              )}
            </div>

            <div className="row g-3">
              <Campo label="Correo" name="correo" value={datos.correo} editando={editando} onChange={handleChange} />
              <Campo label="Cédula" name="cedula" value={datos.cedula} editando={editando} onChange={handleChange} />
              <Campo label="Código" name="codigo" value={datos.codigo} editando={editando} onChange={handleChange} />
              <Campo label="Tipo de cobro" name="cobro" value={datos.cobro} editando={editando} onChange={handleChange} tipo="select" />
              <Campo label="Tarjeta" name="tarjeta" value={datos.tarjeta} editando={editando} onChange={handleChange} />
              <Campo label="Dirección" name="direccion" value={datos.direccion} editando={editando} onChange={handleChange} />
              <Campo label="Peso (kg)" name="peso" value={datos.peso} editando={editando} onChange={handleChange} tipo="number" />
              <Campo label="Altura (m)" name="altura" value={datos.altura} editando={editando} onChange={handleChange} tipo="number" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Campo = ({ label, name, value, editando, onChange, tipo = "text" }) => (
  <div className="col-12 col-md-6">
    <label className="form-label small fw-semibold text-secondary mb-1">{label}</label>
    {editando ? (
      tipo === "select" ? (
        <select className="form-select form-select-sm" name={name} value={value || ""} onChange={onChange}>
          <option value="semanal">Semanal</option>
          <option value="mensual">Mensual</option>
          <option value="anual">Anual</option>
        </select>
      ) : (
        <input type={tipo} step={tipo === "number" ? "0.01" : undefined} className="form-control form-control-sm" name={name} value={value || ""} onChange={onChange} />
      )
    ) : (
      <p className="mb-0" style={{ color: "#1e293b" }}>{value || "—"}</p>
    )}
  </div>
);

export default NutricionistaDashboard;