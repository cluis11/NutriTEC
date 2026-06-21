import React, { useEffect, useState, useCallback } from 'react';
import '../App.css';

// ============================================================
// CONFIGURACIÓN DE LA API Y CONSTANTES HARCODEADAS
// ============================================================
const API_URL = 'http://localhost:5108/api';
// Simulación del nutricionista logueado actualmente 
const ID_NUTRICIONISTA_ACTUAL = 1; 

function formatearFechaParaApi(fecha) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatearFechaLegible(fechaIso) {
  const f = new Date(fechaIso);
  return f.toLocaleDateString('es-CR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

const PASOS = {
  SELECCION_PACIENTE: 'seleccion_paciente',
  PERFIL: 'perfil',
  REGISTROS: 'registros',
  RETROALIMENTACION: 'retroalimentacion'
};

export default function SeguimientoCliente({ onVolver }) {
  const rolUsuario = 'Nutricionista';

  // -----------------------------------------------------------------
  // ESTADOS PRINCIPALES
  // -----------------------------------------------------------------
  const [pasoActual, setPasoActual] = useState(PASOS.SELECCION_PACIENTE);
  const [listaPacientes, setListaPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  // Control de carga y errores global/local
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState(null);

  // PASO 2: Perfil y Medidas Históricas
  const [datosPerfil, setDatosPerfil] = useState(null);

  // PASO 3: Bitácora de Consumo Diario (SQL Server)
  const [fechaConsumo, setFechaConsumo] = useState(new Date());
  const [registroDiario, setRegistroDiario] = useState(null);

  // PASO 4: Foros de Retroalimentación en Prosa (MongoDB Atlas)
  const [listaForos, setListaForos] = useState([]);
  const [foroSeleccionado, setForoSeleccionado] = useState(null);
  const [nuevaRetroTitulo, setNuevaRetroTitulo] = useState('');
  const [nuevaRetroMensaje, setNuevaRetroMensaje] = useState('');
  const [nuevaRespuestaTexto, setNuevaRespuestaTexto] = useState('');
  const [creandoForo, setCreandoForo] = useState(false);

  // -----------------------------------------------------------------
  // PASO 1: CARGAR PACIENTES ASOCIADOS 
  // -----------------------------------------------------------------
  const cargarPacientesAsociados = useCallback(async () => {
    try {
      setCargando(true);
      setMensajeError(null);

      const res = await fetch(`${API_URL}/nutricionista/${ID_NUTRICIONISTA_ACTUAL}/clientes`);
      if (!res.ok) throw new Error(`Error del servidor (${res.status}): No se pudo obtener la lista de pacientes.`);
      
      const datos = await res.json();
      setListaPacientes(datos);
    } catch (err) {
      setMensajeError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPacientesAsociados();
  }, [cargarPacientesAsociados]);

  // Al seleccionar un paciente de la lista, limpiamos estados anteriores
  const seleccionarPaciente = (paciente) => {
    setPacienteSeleccionado(paciente);
    setDatosPerfil(null);
    setRegistroDiario(null);
    setListaForos([]);
    setForoSeleccionado(null);
    setPasoActual(PASOS.PERFIL); // Ir al perfil por defecto
  };

  // -----------------------------------------------------------------
  // PASO 3: CARGAR BITÁCORA DIARIA (SQL SERVER)
  // -----------------------------------------------------------------
  const cargarRegistroDiario = useCallback(async () => {
    if (!pacienteSeleccionado) return;
    try {
      setCargando(true);
      setMensajeError(null);
      const fechaStr = formatearFechaParaApi(fechaConsumo);
      
      const res = await fetch(`${API_URL}/nutricionista/${ID_NUTRICIONISTA_ACTUAL}/pacientes/${pacienteSeleccionado.id_usuario}/registro?fecha=${fechaStr}`);
      if (!res.ok) throw new Error("No se encontraron registros de consumo para este día.");
      
      const datos = await res.json();
      setRegistroDiario(datos);
    } catch (err) {
      setRegistroDiario(null);
      setMensajeError(err.message);
    } finally {
      setCargando(false);
    }
  }, [pacienteSeleccionado, fechaConsumo]);

  useEffect(() => {
    if (pasoActual === PASOS.REGISTROS) {
      cargarRegistroDiario();
    }
  }, [pasoActual, fechaConsumo, cargarRegistroDiario]);

  // -----------------------------------------------------------------
  // PASO 4: LÓGICA DE FOROS EN PROSA (MONGODB ATLAS)
  // -----------------------------------------------------------------
  const cargarForosPaciente = useCallback(async () => {
    if (!pacienteSeleccionado) return;
    try {
      setCargando(true);
      setMensajeError(null);
      const res = await fetch(`${API_URL}/nutricionista/${ID_NUTRICIONISTA_ACTUAL}/paciente/${pacienteSeleccionado.id_usuario}/retroalimentacion`);
      if (!res.ok) throw new Error("Error al cargar los foros de seguimiento.");
      
      const datos = await res.json();
      setListaForos(datos);
    } catch (err) {
      setMensajeError(err.message);
    } finally {
      setCargando(false);
    }
  }, [pacienteSeleccionado]);

  useEffect(() => {
    if (pasoActual === PASOS.RETROALIMENTACION) {
      cargarForosPaciente();
    }
  }, [pasoActual, cargarForosPaciente]);

  const manejarCrearNuevoForo = async (e) => {
    e.preventDefault();
    if (!nuevaRetroTitulo.trim() || !nuevaRetroMensaje.trim()) return;

    try {
      setCreandoForo(true);
      const nuevoHilo = {
        idNutricionista: ID_NUTRICIONISTA_ACTUAL,
        idCliente: pacienteSeleccionado.id_usuario,
        asunto: nuevaRetroTitulo.trim(),
        respuestas: [
          {
            remitente: "Nutricionista",
            contenido: nuevaRetroMensaje.trim(),
            fecha: new Date().toISOString()
          }
        ]
      };

      const res = await fetch(`${API_URL}/nutricionista/retroalimentacion/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoHilo),
        signal: AbortSignal.timeout(10000)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.mensaje || "No se pudo iniciar el nuevo foro.");
      }

      setNuevaRetroTitulo('');
      setNuevaRetroMensaje('');
      await cargarForosPaciente();
    } catch (err) {
      alert(err.name === 'TimeoutError' ? "El servidor tardó demasiado en responder (posible problema de conexión con MongoDB Atlas)." : err.message);
    } finally {
      setCreandoForo(false);
    }
  };

  const manejarEnviarRespuestaForo = async (e) => {
    e.preventDefault();
    if (!foroSeleccionado || !nuevaRespuestaTexto.trim()) return;

    try {
      setCargando(true);
      const respuestaObj = {
        contenido: nuevaRespuestaTexto.trim()
      };

      const res = await fetch(`${API_URL}/nutricionista/${ID_NUTRICIONISTA_ACTUAL}/retroalimentacion/responder/${foroSeleccionado.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(respuestaObj)
      });

      if (!res.ok) throw new Error("Error al publicar tu respuesta.");

      setNuevaRespuestaTexto('');
      
      // Refrescar los foros
      const resForos = await fetch(`${API_URL}/nutricionista/${ID_NUTRICIONISTA_ACTUAL}/paciente/${pacienteSeleccionado.id_usuario}/retroalimentacion`);
      if (resForos.ok) {
        const forosActualizados = await resForos.json();
        setListaForos(forosActualizados);
        const foroActualizado = forosActualizados.find(f => f.id === foroSeleccionado.id);
        if (foroActualizado) setForoSeleccionado(foroActualizado);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Cambiar de fecha en bitácora
  const cambiarFechaEfecto = (dias) => {
    const nueva = new Date(fechaConsumo);
    nueva.setDate(nueva.getDate() + dias);
    setFechaConsumo(nueva);
  };

  return (
    <div className="container-fluid py-4" style={{ minHeight: '90vh', backgroundColor: '#f8f9fa' }}>
      
      {/* HEADER DE NAVEGACIÓN */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom bg-white p-3 rounded shadow-sm">
        <div>
          <h2 className="text-success mb-1 fw-bold">
            <i className="bi bi-shield-check me-2"></i>Módulo de Auditoría y Seguimiento
          </h2>
          <p className="text-muted small mb-0">
            {pacienteSeleccionado 
              ? `Auditando a: ${pacienteSeleccionado.nombre} ${pacienteSeleccionado.ap1} ${pacienteSeleccionado.ap2 || ''}` 
              : "Consulta y analiza de manera integral la información de tus pacientes activos."
            }
          </p>
        </div>
        {pacienteSeleccionado ? (
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => setPacienteSeleccionado(null)}>
            <i className="bi bi-arrow-left me-1"></i> Cambiar Paciente
          </button>
        ) : (
          onVolver && (
            <button className="btn btn-outline-success btn-sm rounded-pill px-3" onClick={onVolver}>
              <i className="bi bi-house-door me-1"></i> Volver al Dashboard
            </button>
          )
        )}
      </div>

      {mensajeError && (
        <div className="alert alert-danger alert-dismissible fade show shadow-sm mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {mensajeError}
          <button type="button" className="btn-close" onClick={() => setMensajeError(null)}></button>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* VISTA A: SELECCIÓN DE PACIENTE (PASO 1)                           */}
      {/* ----------------------------------------------------------------- */}
      {!pacienteSeleccionado ? (
        <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
          <div className="card-header bg-success text-white py-3">
            <h5 className="mb-0 fw-semibold">Seguimiento y Registro de Pacientes</h5>
            <small className="opacity-75">Selecciona uno de tus pacientes activos para auditar su información de perfil, consumos diarios y foros:</small>
          </div>
          <div className="card-body p-0">
            {cargando && listaPacientes.length === 0 ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
                <div className="text-muted mt-2 small">Cargando tus pacientes vinculados...</div>
              </div>
            ) : listaPacientes.length === 0 ? (
              <div className="text-center py-5 px-3 text-muted">
                <i className="bi bi-people fs-1 text-light d-block mb-2"></i>
                <h6>No tienes pacientes asociados todavía.</h6>
                <p className="small mb-0">Utiliza el módulo de asignación para vincular nuevos clientes a tu código profesional.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-secondary small">
                    <tr>
                      <th className="ps-4">Paciente</th>
                      <th>Contacto Correo</th>
                      <th className="text-end pe-4">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaPacientes.map((paciente) => (
                      <tr key={paciente.id_usuario}>
                        <td className="ps-4">
                          <div className="fw-semibold text-dark">
                            {paciente.nombre} {paciente.ap1} {paciente.ap2 || ''}
                          </div>
                          <div className="text-muted extra-small" style={{ fontSize: '0.78rem' }}>
                            Código de Usuario: #{paciente.id_usuario}
                          </div>
                        </td>
                        <td>
                          <span className="text-muted">{paciente.correo}</span>
                        </td>
                        <td className="text-end pe-4">
                          <button 
                            className="btn btn-success btn-sm rounded-pill px-3 shadow-sm"
                            onClick={() => seleccionarPaciente(paciente)}
                          >
                            Auditar <i className="bi bi-search ms-1"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ----------------------------------------------------------------- */
        /* VISTA B: PANELES DE AUDITORÍA DE PACIENTE SELECCIONADO            */
        /* ----------------------------------------------------------------- */
        <div className="row g-4">
          
          {/* MENÚ DE PASOS IZQUIERDO */}
          <div className="col-md-3">
            <div className="card shadow-sm border-0 sticky-top" style={{ top: '20px' }}>
              <div className="p-3 bg-dark text-white rounded-top">
                <div className="fw-bold text-truncate">{pacienteSeleccionado.nombre} {pacienteSeleccionado.ap1}</div>
                <small className="text-success extra-small">Paciente Activo</small>
              </div>
              <div className="list-group list-group-flush small">
                <button 
                  className={`list-group-item list-group-item-action py-3 d-flex align-items-center gap-2 border-0 ${pasoActual === PASOS.PERFIL ? 'active bg-success text-white' : ''}`}
                  onClick={() => setPasoActual(PASOS.PERFIL)}
                >
                  <i className="bi bi-person-vcard fs-5"></i>
                  <div>
                    <div className="fw-semibold">Perfil del Cliente</div>
                    <div className="extra-small opacity-75">Datos corporales básicos</div>
                  </div>
                </button>
                <button 
                  className={`list-group-item list-group-item-action py-3 d-flex align-items-center gap-2 border-0 ${pasoActual === PASOS.REGISTROS ? 'active bg-success text-white' : ''}`}
                  onClick={() => setPasoActual(PASOS.REGISTROS)}
                >
                  <i className="bi bi-calendar3 fs-5"></i>
                  <div>
                    <div className="fw-semibold">Consumo Diario</div>
                    <div className="extra-small opacity-75">Bitácora en base de datos</div>
                  </div>
                </button>
                <button 
                  className={`list-group-item list-group-item-action py-3 d-flex align-items-center gap-2 border-0 ${pasoActual === PASOS.RETROALIMENTACION ? 'active bg-success text-white' : ''}`}
                  onClick={() => setPasoActual(PASOS.RETROALIMENTACION)}
                >
                  <i className="bi bi-chat-square-text fs-5"></i>
                  <div>
                    <div className="fw-semibold">Seguimiento en Prosa</div>
                    <div className="extra-small opacity-75">Foros interactivos MongoDB</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* CONTENIDO DEL PASO SELECCIONADO */}
          <div className="col-md-9">
            
            {/* PASO 2: PERFIL */}
            {pasoActual === PASOS.PERFIL && (
              <div className="card shadow-sm border-0 p-4">
                <h4 className="text-dark border-bottom pb-2 mb-3 fw-bold"><i className="bi bi-person-circle text-success me-2"></i>Perfil General</h4>
                <div className="row g-3">
                  <div className="col-md-6 bg-light p-3 rounded border border-light">
                    <label className="text-secondary extra-small d-block text-uppercase fw-bold">Nombre Completo</label>
                    <span className="text-dark fw-semibold fs-5">{pacienteSeleccionado.nombre} {pacienteSeleccionado.ap1} {pacienteSeleccionado.ap2 || ''}</span>
                  </div>
                  <div className="col-md-6 bg-light p-3 rounded border border-light">
                    <label className="text-secondary extra-small d-block text-uppercase fw-bold">Identificación Interna</label>
                    <span className="text-dark fw-semibold fs-5">ID-{pacienteSeleccionado.id_usuario}</span>
                  </div>
                  <div className="col-md-12 bg-light p-3 rounded border border-light">
                    <label className="text-secondary extra-small d-block text-uppercase fw-bold">Correo Electrónico Registrado</label>
                    <span className="text-success fw-medium">{pacienteSeleccionado.correo}</span>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 3: CONSUMO DIARIO */}
            {pasoActual === PASOS.REGISTROS && (
              <div className="card shadow-sm border-0 p-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-3 mb-3 gap-2">
                  <h4 className="text-dark mb-0 fw-bold"><i className="bi bi-egg-fried text-success me-2"></i>Bitácora Nutricional Diaria</h4>
                  <div className="d-flex align-items-center gap-2 bg-light p-1 rounded border">
                    <button className="btn btn-white btn-sm shadow-sm border" onClick={() => cambiarFechaEfecto(-1)}><i className="bi bi-chevron-left"></i></button>
                    <span className="fw-semibold px-2 text-dark small" style={{ minWidth: '240px', textAlign: 'center' }}>
                      {formatearFechaLegible(fechaConsumo)}
                    </span>
                    <button className="btn btn-white btn-sm shadow-sm border" onClick={() => cambiarFechaEfecto(1)}><i className="bi bi-chevron-right"></i></button>
                  </div>
                </div>

                {cargando ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status"></div>
                  </div>
                ) : !registroDiario || !registroDiario.registros || registroDiario.registros.length === 0 ? (
                  <div className="text-center py-5 text-muted bg-light rounded border border-dashed">
                    <i className="bi bi-calendar-x fs-1 d-block mb-2 text-light"></i>
                    <p className="mb-0 small">El paciente no ha guardado ningún alimento en la base de datos para esta fecha específica.</p>
                  </div>
                ) : (
                  <div>
                    <div className="bg-success text-white p-3 rounded-3 mb-4 d-flex justify-content-between align-items-center shadow-sm">
                      <span className="small text-uppercase tracking-wider fw-bold">Total Calorías Consumidas:</span>
                      <span className="fs-4 fw-bold">{registroDiario.total_dia || 0} kcal</span>
                    </div>

                    <div className="row g-3">
                      {registroDiario.registros.map((item, idx) => (
                        <div key={idx} className="col-12">
                          <div className="card border-light bg-light shadow-2xs">
                            <div className="card-header bg-dark text-white py-2 small fw-bold text-uppercase tracking-wide">
                              <span><i className="bi bi-clock me-2 text-success"></i>{item.tiempo}</span>
                            </div>
                            <div className="card-body p-0">
                              <ul className="list-group list-group-flush small">
                                {item.productos && item.productos.map((prod, pIdx) => (
                                  <li key={pIdx} className="list-group-item d-flex justify-content-between align-items-center bg-transparent py-2.5">
                                    <div>
                                      <div className="fw-semibold text-dark">{prod.nombre || prod.descripcion || `Producto #${prod.id_producto}`}</div>
                                      <small className="text-muted">Porción/Cantidad: {prod.tamano || prod.cantidad || 0}g/ml</small>
                                    </div>
                                    <span className="badge bg-secondary rounded-pill">{prod.calorias || prod.energia || 0} kcal</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PASO 4: FOROS INTERACTIVOS (MONGODB) */}
            {pasoActual === PASOS.RETROALIMENTACION && (
              <div className="row g-4">
                {/* LISTA DE FOROS (IZQUIERDA DEL FORO) */}
                <div className="col-md-5">
                  <div className="card shadow-sm border-0 p-3" style={{ backgroundColor: '#fff' }}>
                    <h5 className="fw-bold mb-3 text-dark text-center pb-2 border-bottom">Hilos Abiertos</h5>
                    
                    {listaForos.length === 0 ? (
                      <div className="text-center py-4 text-muted small bg-light rounded border border-dashed mb-3">No hay hilos de discusión creados para este cliente.</div>
                    ) : (
                      <div className="list-group gap-2 mb-3 overflow-y-auto" style={{ maxHeight: '350px' }}>
                        {listaForos.map((foro) => (
                          <button
                            key={foro.id}
                            className={`list-group-item list-group-item-action border rounded p-2.5 text-start ${foroSeleccionado?.id === foro.id ? 'border-success bg-light' : ''}`}
                            onClick={() => setForoSeleccionado(foro)}
                          >
                            <div className="fw-bold text-truncate text-dark small">{foro.asunto}</div>
                            <div className="d-flex justify-content-between extra-small text-secondary mt-1" style={{ fontSize: '10px' }}>
                              <span><i className="bi bi-chat-dots me-1"></i>{foro.respuestas?.length || 0} rps</span>
                              <span>{foro.fechaCreacion ? new Date(foro.fechaCreacion).toLocaleDateString() : ''}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* FORMULARIO NUEVO HILO */}
                    <form onSubmit={manejarCrearNuevoForo} className="border-top pt-3">
                      <div className="mb-2">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Asunto del nuevo foro..."
                          value={nuevaRetroTitulo}
                          onChange={(e) => setNuevaRetroTitulo(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-2">
                        <textarea
                          className="form-control form-control-sm"
                          rows="2"
                          placeholder="Escribe la retroalimentación inicial en prosa..."
                          value={nuevaRetroMensaje}
                          onChange={(e) => setNuevaRetroMensaje(e.target.value)}
                          required
                        ></textarea>
                      </div>
                      <button type="submit" className="btn btn-success btn-sm w-100 rounded" disabled={creandoForo}>
                        <i className="bi bi-plus-circle me-1"></i> {creandoForo ? 'Enviando...' : 'Iniciar Hilo de Foro'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* VISUALIZACIÓN CHAT SELECCIONADO (DERECHA DEL FORO) */}
                <div className="col-md-7">
                  {foroSeleccionado ? (
                    <div className="card shadow-sm border-0 d-flex flex-column rounded-3 overflow-hidden" style={{ height: '520px', backgroundColor: '#efeae2' }}>
                      {/* HEADER CHAT */}
                      <div className="bg-white p-3 border-bottom">
                        <span className="extra-small text-success fw-bold text-uppercase tracking-wider d-block" style={{ fontSize: '10px' }}>Foro de Discusión en Prosa</span>
                        <h6 className="fw-bold text-dark mb-0 text-truncate">{foroSeleccionado.asunto}</h6>
                      </div>

                      {/* AREA CHAT SCROLL */}
                      <div className="flex-1 overflow-y-auto p-3 d-flex flex-column gap-2" style={{ backgroundColor: '#efeae2', overflowY: 'auto' }}>
                        {/* Mapeo de Respuestas e Historial */}
                        {foroSeleccionado.respuestas && foroSeleccionado.respuestas.map((resp, rIdx) => {
                          const esNutri = resp.remitente === 'Nutricionista';
                          return (
                            <div 
                              key={rIdx} 
                              className={`p-2.5 rounded-3 ${esNutri ? 'align-self-end text-end' : 'align-self-start text-start'}`}
                              style={{ 
                                maxWidth: '85%', 
                                backgroundColor: esNutri ? '#d9fdd3' : '#ffffff',
                                boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)'
                              }}
                            >
                              <span className="d-block fw-bold" style={{ fontSize: '10px', color: esNutri ? '#128c7e' : '#0d6efd' }}>
                                {esNutri ? 'Tú (Nutricionista)' : 'Paciente'}
                              </span>
                              <p className="mb-1 text-dark text-start small" style={{ whiteSpace: 'pre-wrap' }}>{resp.contenido}</p>
                              <span className="d-block text-end text-muted" style={{ fontSize: '9px' }}>
                                {resp.fecha ? new Date(resp.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* CONTROL RESPONDER CHAT */}
                      <div className="bg-white p-3 border-top">
                        <form onSubmit={manejarEnviarRespuestaForo} className="d-flex gap-2">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Escribe tu observación profesional..."
                            value={nuevaRespuestaTexto}
                            onChange={(e) => setNuevaRespuestaTexto(e.target.value)}
                            required
                            disabled={cargando}
                          />
                          <button type="submit" className="btn btn-success btn-sm px-3" disabled={cargando}>
                            <i className="bi bi-send-fill"></i>
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div className="card shadow-sm border-0 bg-light text-center py-5 text-muted d-flex justify-content-center align-items-center" style={{ minHeight: '520px' }}>
                      <div className="p-4">
                        <i className="bi bi-chat-left-quote fs-1 text-light d-block mb-3"></i>
                        <h6 className="fw-semibold text-secondary">Ningún foro interactivo desplegado</h6>
                        <p className="small mb-0 text-center">Selecciona un hilo de retroalimentación de la lista izquierda para cargar el historial almacenado en MongoDB Atlas.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}