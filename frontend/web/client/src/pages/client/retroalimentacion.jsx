import React, { useEffect, useState, useCallback } from 'react';
import '../../App.css';

// ============================================================
// CONFIGURACIÓN DE LA API
// ============================================================
const API_URL = 'http://localhost:5108/api';

export default function Retroalimentacion() {
  const [idClienteLogueado] = useState(localStorage.getItem('idCliente') || 4);

  // -----------------------------------------------------------------
  // ESTADOS
  // -----------------------------------------------------------------
  const [listaForos, setListaForos] = useState([]);
  const [foroSeleccionado, setForoSeleccionado] = useState(null);
  const [nuevaRespuestaTexto, setNuevaRespuestaTexto] = useState('');

  const [cargandoForos, setCargandoForos] = useState(false);
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  const [mensajeError, setMensajeError] = useState(null);

  // -----------------------------------------------------------------
  // CARGAR FOROS DEL CLIENTE LOGUEADO
  // -----------------------------------------------------------------
  const cargarForosPropios = useCallback(async () => {
    try {
      setCargandoForos(true);
      setMensajeError(null);

      const res = await fetch(`${API_URL}/cliente/${idClienteLogueado}/retroalimentacion`, {
        signal: AbortSignal.timeout(10000)
      });
      if (!res.ok) throw new Error("Error al cargar tus foros de seguimiento.");

      const datos = await res.json();
      setListaForos(datos);

      // Si había un foro abierto, lo refrescamos con la data nueva
      if (foroSeleccionado) {
        const actualizado = datos.find(f => f.id === foroSeleccionado.id);
        if (actualizado) setForoSeleccionado(actualizado);
      }
    } catch (err) {
      setMensajeError(
        err.name === 'TimeoutError'
          ? "El servidor tardó demasiado en responder. Intenta de nuevo en un momento."
          : err.message
      );
    } finally {
      setCargandoForos(false);
    }
  }, [idClienteLogueado, foroSeleccionado]);

  useEffect(() => {
    cargarForosPropios();
  }, []);

  // -----------------------------------------------------------------
  // RESPONDER UN FORO EXISTENTE
  // -----------------------------------------------------------------
  const manejarEnviarRespuesta = async (e) => {
    e.preventDefault();
    if (!foroSeleccionado || !nuevaRespuestaTexto.trim()) return;

    try {
      setEnviandoRespuesta(true);

      const respuestaObj = {
        contenido: nuevaRespuestaTexto.trim()
      };

      const res = await fetch(
        `${API_URL}/cliente/${idClienteLogueado}/retroalimentacion/responder/${foroSeleccionado.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(respuestaObj),
          signal: AbortSignal.timeout(10000)
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.mensaje || "Error al publicar tu respuesta.");
      }

      setNuevaRespuestaTexto('');

      // Refrescar los foros para traer la respuesta recién guardada
      const resForos = await fetch(`${API_URL}/cliente/${idClienteLogueado}/retroalimentacion`);
      if (resForos.ok) {
        const forosActualizados = await resForos.json();
        setListaForos(forosActualizados);
        const actualizado = forosActualizados.find(f => f.id === foroSeleccionado.id);
        if (actualizado) setForoSeleccionado(actualizado);
      }
    } catch (err) {
      alert(
        err.name === 'TimeoutError'
          ? "El servidor tardó demasiado en responder (posible problema de conexión con MongoDB Atlas)."
          : err.message
      );
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ minHeight: '70vh' }}>

      {/* HEADER */}
      <div className="mb-4 pb-3 border-bottom">
        <h2 className="text-success mb-1 fw-bold">
          <i className="bi bi-chat-square-text me-2"></i>Seguimiento de mi Nutricionista
        </h2>
        <p className="text-muted small mb-0">
          Aquí puedes revisar la retroalimentación que tu nutricionista te ha dejado y responder directamente en cada hilo.
        </p>
      </div>

      {mensajeError && (
        <div className="alert alert-danger alert-dismissible fade show shadow-sm mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {mensajeError}
          <button type="button" className="btn-close" onClick={() => setMensajeError(null)}></button>
        </div>
      )}

      <div className="row g-4">
        {/* LISTA DE FOROS */}
        <div className="col-md-5">
          <div className="card shadow-sm border-0 p-3">
            <h5 className="fw-bold mb-3 text-dark text-center pb-2 border-bottom">Hilos de Seguimiento</h5>

            {cargandoForos ? (
              <div className="text-center py-4">
                <div className="spinner-border text-success" role="status"></div>
              </div>
            ) : listaForos.length === 0 ? (
              <div className="text-center py-4 text-muted small bg-light rounded border border-dashed">
                <i className="bi bi-chat-left-quote fs-2 text-light d-block mb-2"></i>
                Todavía no tienes retroalimentación de tu nutricionista.
              </div>
            ) : (
              <div className="list-group gap-2 overflow-y-auto" style={{ maxHeight: '450px' }}>
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
          </div>
        </div>

        {/* CHAT DEL FORO SELECCIONADO */}
        <div className="col-md-7">
          {foroSeleccionado ? (
            <div className="card shadow-sm border-0 d-flex flex-column rounded-3 overflow-hidden" style={{ height: '520px', backgroundColor: '#efeae2' }}>
              {/* HEADER CHAT */}
              <div className="bg-white p-3 border-bottom">
                <span className="extra-small text-success fw-bold text-uppercase tracking-wider d-block" style={{ fontSize: '10px' }}>Foro de Seguimiento</span>
                <h6 className="fw-bold text-dark mb-0 text-truncate">{foroSeleccionado.asunto}</h6>
              </div>

              {/* AREA CHAT */}
              <div className="flex-1 overflow-y-auto p-3 d-flex flex-column gap-2" style={{ backgroundColor: '#efeae2', overflowY: 'auto' }}>
                {foroSeleccionado.respuestas && foroSeleccionado.respuestas.map((resp, rIdx) => {
                  const esCliente = resp.remitente === 'Cliente';
                  return (
                    <div
                      key={rIdx}
                      className={`p-2.5 rounded-3 ${esCliente ? 'align-self-end text-end' : 'align-self-start text-start'}`}
                      style={{
                        maxWidth: '85%',
                        backgroundColor: esCliente ? '#d9fdd3' : '#ffffff',
                        boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)'
                      }}
                    >
                      <span className="d-block fw-bold" style={{ fontSize: '10px', color: esCliente ? '#128c7e' : '#0d6efd' }}>
                        {esCliente ? 'Tú (Paciente)' : 'Tu Nutricionista'}
                      </span>
                      <p className="mb-1 text-dark text-start small" style={{ whiteSpace: 'pre-wrap' }}>{resp.contenido}</p>
                      <span className="d-block text-end text-muted" style={{ fontSize: '9px' }}>
                        {resp.fecha ? new Date(resp.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* RESPONDER */}
              <div className="bg-white p-3 border-top">
                <form onSubmit={manejarEnviarRespuesta} className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Escribe tu respuesta..."
                    value={nuevaRespuestaTexto}
                    onChange={(e) => setNuevaRespuestaTexto(e.target.value)}
                    required
                    disabled={enviandoRespuesta}
                  />
                  <button type="submit" className="btn btn-success btn-sm px-3" disabled={enviandoRespuesta}>
                    <i className="bi bi-send-fill"></i>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm border-0 bg-light text-center py-5 text-muted d-flex justify-content-center align-items-center" style={{ minHeight: '520px' }}>
              <div className="p-4">
                <i className="bi bi-chat-left-quote fs-1 text-light d-block mb-3"></i>
                <h6 className="fw-semibold text-secondary">Ningún hilo seleccionado</h6>
                <p className="small mb-0 text-center">Selecciona un hilo de la lista izquierda para ver el historial y responder.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}