import React, { useState } from 'react';
import '../App.css'; 

const ClientSearch = () => {
  // DATOS PRUEBA: Pacientes ya asociados al nutricionista
  const [pacientesAsociados, setPacientesAsociados] = useState([
    { id: 2, nombre: 'Gabriel Soto', edad: 23, correo: 'gabriel@mail.com', telefono: '8888-2222', planActivo: 'Déficit Calórico', ultimaConsulta: '2026-06-01', cedula: '2-2222-2222' },
    { id: 3, nombre: 'Ariel Saborío', edad: 22, correo: 'ariel@mail.com', telefono: '8888-3333', planActivo: 'Mantenimiento', ultimaConsulta: '2026-06-04', cedula: '3-3333-3333' }
  ]);

  // DATOS PRUEBA: Clientes de NutriTEC (no asociados aún)
  const [clientesGlobales, setClientesGlobales] = useState([
    { id: 101, nombre: 'Luis Eladio Carrion', edad: 21, correo: 'luis@mail.com', telefono: '8765-4321', planActivo: 'Ninguno', ultimaConsulta: 'Sin consultas', cedula: '1-1892-0345' },
    ]);

  const [busqueda, setBusqueda] = useState('');

  // Filtrar los clientes globales que coincidan con la barra de búsqueda 
  // e ignorar los que ya están asociados para evitar duplicados
  const clientesFiltrados = clientesGlobales.filter(cliente => {
    const coincideFiltro = cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          cliente.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
                          cliente.cedula.includes(busqueda);
    const yaAsociado = pacientesAsociados.some(p => p.cedula === cliente.cedula);
    return coincideFiltro && !yaAsociado;
  });

  //  Vincula un cliente al nutricionista
  const handleAsociarCliente = (cliente) => {
    const fechaHoy = new Date().toISOString().split('T')[0];
    const nuevoPaciente = {
      ...cliente,
      ultimaConsulta: fechaHoy
    };

    // Agregar a mis pacientes y remover de la lista de búsqueda disponible
    setPacientesAsociados([...pacientesAsociados, nuevoPaciente]);
    setClientesGlobales(clientesGlobales.filter(c => c.id !== cliente.id));
    
    alert(`¡${cliente.nombre} ha sido asociado exitosamente a tu lista de pacientes!`);
  };

  return (
    <div className="container-fluid py-3" style={{ minHeight: "100vh" }}>
      <div className="row g-4">
        
        <div className="col-12 col-md-5">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-3">
            <h4 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>Asociar Clientes</h4>
            <p className="text-muted small mb-3">Busca usuarios registrados en NutriTEC para agregarlos a tu consulta.</p>
            
            <div className="mb-3">
              <input 
                type="text"
                className="form-control form-control-sm border-2" 
                placeholder="🔍 Cédula, nombre o correo..." 
                value={busqueda} 
                onChange={(e) => setBusqueda(e.target.value)} 
              />
            </div>

            <div style={{ maxHeight: "350px", overflowY: "auto" }}>
              {busqueda.trim() === '' ? (
                <div className="text-center text-muted py-4 small">
                  Escribe en el buscador para localizar clientes en el sistema general.
                </div>
              ) : clientesFiltrados.length === 0 ? (
                <div className="text-center text-muted py-4 small">
                  No se encontraron clientes disponibles o ya se encuentran asociados.
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {clientesFiltrados.map(cliente => (
                    <div key={cliente.id} className="list-group-item px-0 py-2.5 d-flex justify-content-between align-items-center">
                      <div>
                        <strong className="d-block text-dark">{cliente.nombre}</strong>
                        <small className="text-muted d-block">{cliente.cedula} • {cliente.correo}</small>
                      </div>
                      <button 
                        className="btn btn-sm text-white fw-medium px-2.5 py-1"
                        style={{ backgroundColor: "#1abc9c", borderRadius: "6px", fontSize: "0.75rem" }}
                        onClick={() => handleAsociarCliente(cliente)}
                      >
                        + Asociar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-12 col-md-7">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-3 h-100">
            <h4 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>Mis Pacientes Activos</h4>
            
            <div className="table-responsive" style={{ maxHeight: "420px", overflowY: "auto" }}>
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light position-sticky top-0" style={{ zIndex: 1 }}>
                  <tr style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#7f8c8d" }}>
                    <th>Paciente</th>
                    <th>Contacto</th>
                    <th>Plan</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "0.85rem" }}>
                  {pacientesAsociados.map((paciente) => (
                    <tr key={paciente.id}>
                      <td>
                        <div className="fw-bold" style={{ color: "#2c3e50" }}>{paciente.nombre}</div>
                        <div className="text-muted small">Cédula: {paciente.cedula}</div>
                      </td>
                      <td>
                        <div>{paciente.correo}</div>
                        <div className="text-muted small">{paciente.telefono}</div>
                      </td>
                      <td>
                        <span className="badge px-2 py-1.5 rounded-pill" style={{ backgroundColor: paciente.planActivo === 'Ninguno' ? '#e2e8f0' : '#e8f8f5', color: paciente.planActivo === 'Ninguno' ? '#64748b' : '#16a085' }}>
                          {paciente.planActivo}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center">
                          <button 
                            className="btn btn-xs btn-outline-secondary py-1 px-2" 
                            style={{ fontSize: "0.7rem", borderRadius: "5px" }} 
                            onClick={() => alert(`Estas  seguro de eliminar el paciente: ${paciente.nombre}`)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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