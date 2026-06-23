import React, { useState, useEffect } from 'react';
import '../../App.css'; 

const API_BASE_URL = process.env.REACT_APP_API_URL;

const ClientSearch = () => {
  const [pacientesAsociados, setPacientesAsociados] = useState([]);
  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  
  // Estados de control de UI
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarClientesDisponibles();
    cargarPacientesAsociados();
  }, []);

  const cargarClientesDisponibles = async () => {
    try {
      setCargando(true);
      const res = await fetch(`${API_BASE_URL}/api/nutricionista/disponibles`);
      if (!res.ok) throw new Error("No se pudieron obtener los clientes disponibles.");
      const datos = await res.json();
      setClientesDisponibles(datos);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setCargando(false);
    }
  };

  const cargarPacientesAsociados = async () => {
    try {
      const idNutri = JSON.parse(localStorage.getItem('usuario'))?.id_usuario || 0;
      const res = await fetch(`${API_BASE_URL}/api/nutricionista/${idNutri}/clientes`);
      if (!res.ok) throw new Error("No se pudieron obtener tus pacientes activos.");
      const datos = await res.json();
      setPacientesAsociados(datos);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    }
  };

  const handleAsignarCliente = async (idCliente, nombreCliente) => {
    try {
      setMensaje(null);
      const idNutri = JSON.parse(localStorage.getItem('usuario'))?.id_usuario || 0;
      const res = await fetch(`${API_BASE_URL}/api/nutricionista/${idNutri}/pacientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(idCliente)
      });

      if (!res.ok) throw new Error("Ocurrió un error en el servidor al intentar asociar al cliente.");

      setMensaje({ tipo: 'exito', texto: `¡Excelente! ${nombreCliente} ahora es tu paciente.` });
      
      // Refrescamos la lista para que desaparezca de "disponibles" y aparezca en "asociados"
      await cargarClientesDisponibles();
      await cargarPacientesAsociados();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    }
  };

  // LÓGICA DE FILTRADO DINÁMICO: Filtra en tiempo real sobre la lista cargada
  const clientesFiltrados = clientesDisponibles.filter(cliente => {
    const nombreCompleto = `${cliente.nombre} ${cliente.ap1} ${cliente.ap2}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase()) || cliente.correo.toLowerCase().includes(busqueda.toLowerCase());
  });

  return (
    <div className="container py-4" style={{ backgroundColor: "#f4f6f9", minHeight: "100vh" }}>
      
      {mensaje && (
        <div className={`alert text-center shadow-sm mb-4 ${mensaje.tipo === 'exito' ? 'alert-success' : 'alert-danger'}`} style={{ borderRadius: "10px" }}>
          {mensaje.texto}
        </div>
      )}

      <div className="row g-4">
        {/* PANEL IZQUIERDO: BUSCADOR Y ASIGNACIÓN */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "15px", backgroundColor: "#ffffff" }}>
            <h4 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>Vincular Nuevos Pacientes</h4>
            <p className="text-muted small mb-4">Selecciona clientes globales de NutriTEC para agregarlos a tu consulta privada.</p>

            {/* Input de búsqueda interactivo */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control bg-light border-0 py-2.5 px-3"
                style={{ borderRadius: "8px" }}
                placeholder="Buscar por nombre, apellido o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {cargando ? (
              <div className="text-center py-4 text-muted small">Buscando clientes disponibles en el servidor...</div>
            ) : (
              <div className="list-group" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {clientesFiltrados.length === 0 ? (
                  <div className="text-center py-4 text-muted small border border-dashed rounded-3 bg-light">
                    No se encontraron clientes disponibles con ese criterio.
                  </div>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <div 
                      key={cliente.id_usuario} 
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-0 mb-2 rounded-3 bg-light p-3"
                    >
                      <div className="text-truncate" style={{ maxWidth: "70%" }}>
                        <span className="fw-bold d-block text-dark">{cliente.nombre} {cliente.ap1} {cliente.ap2}</span>
                        <span className="text-muted small d-block text-truncate">{cliente.correo}</span>
                        <span className="badge bg-white text-secondary border extra-small mt-1">{cliente.pais}</span>
                      </div>
                      <button 
                        className="btn btn-sm text-white fw-semibold px-3" 
                        style={{ backgroundColor: "#1abc9c", borderRadius: "6px" }}
                        onClick={() => handleAsignarCliente(cliente.id_usuario, cliente.nombre)}
                      >
                        Asociar
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: VISTA DE PACIENTES ACTUALES */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "15px", backgroundColor: "#ffffff" }}>
            <h4 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>Mis Pacientes Activos</h4>
            
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr className="table-light small text-secondary">
                    <th>Paciente</th>
                    <th>Contacto</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "0.85rem" }}>
                  {pacientesAsociados.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-muted">
                        No tienes pacientes asociados todavía. Utiliza el panel izquierdo.
                      </td>
                    </tr>
                  ) : (
                    pacientesAsociados.map((paciente) => (
                      <tr key={paciente.id_usuario}>
                        <td>
                          <div className="fw-semibold text-dark">
                            {paciente.nombre} {paciente.ap1} {paciente.ap2}
                          </div>
                          <div className="text-muted extra-small" style={{ fontSize: "0.75rem" }}>
                            {paciente.pais}  {paciente.edad ? `• ${paciente.edad} años` : ""} 
                            </div>
                        </td>
                        <td>
                          <div>{paciente.correo}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default ClientSearch;