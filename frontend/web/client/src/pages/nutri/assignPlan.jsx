import React, { useState, useEffect } from "react";
import '../../App.css'; 

const API_BASE_URL = process.env.REACT_APP_API_URL;
const ID_NUTRICIONISTA_ACTUAL = JSON.parse(localStorage.getItem('usuario'))?.id_usuario || 0;

const NOMBRES_MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const obtenerDiasDeLaSemana = (fechaBase) => {
  const copia = new Date(fechaBase);
  const diaSemanaIdx = copia.getDay();
  // Ajuste para que empiece en Lunes de forma segura
  const distanciaAlLunes = diaSemanaIdx === 0 ? -6 : 1 - diaSemanaIdx;
  const lunesDeEstaSemana = new Date(copia.setDate(copia.getDate() + distanciaAlLunes));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunesDeEstaSemana);
    d.setDate(lunesDeEstaSemana.getDate() + i);
    return d;
  });
};

const NutricionistaDashboard = () => {
  const [fechaBase, setFechaBase] = useState(new Date());
  
  // Listas de catálogos
  const [pacientes, setPacientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  
  // Estado para guardar las asignaciones reales que vienen del Backend
  const [asignacionesBackend, setAsignacionesBackend] = useState([]);

  // Variables del formulario
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState("");
  const [planSeleccionado, setPlanSeleccionado] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  
  const [cargando, setCargando] = useState(false);

  // Encontrar objetos seleccionados para cálculos reactivos
  const infoPacienteElegido = pacientes.find(p => (p.idUsuario || p.id_usuario) === parseInt(pacienteSeleccionado, 10));
  const infoPlanElegido = planes.find(p => (p.idPlan || p.id_plan) === parseInt(planSeleccionado, 10));

  // 1. Carga Inicial de Pacientes y Catálogo de Planes
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setCargando(true);
        // Cargar Pacientes Asociados
        const resPacientes = await fetch(`${API_BASE_URL}/nutricionista/${ID_NUTRICIONISTA_ACTUAL}/clientes`);
        if (resPacientes.ok) setPacientes(await resPacientes.json());

        // Cargar Planes del Nutricionista
        const resPlanes = await fetch(`${API_BASE_URL}/plan/nutricionista/${ID_NUTRICIONISTA_ACTUAL}`);
        if (resPlanes.ok) setPlanes(await resPlanes.json());
      } catch (err) {
        console.error("Error cargando catálogos principales:", err);
      } finally {
        setCargando(false);
      }
    };
    cargarDatosIniciales();
  }, []);

  // 2. Cada vez que se elija un Paciente, jalar su Agenda de la BD
  useEffect(() => {
    const cargarAgendaPaciente = async () => {
      if (!pacienteSeleccionado) {
        setAsignacionesBackend([]);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/nutricionista/cliente/${pacienteSeleccionado}/asignaciones`);
        if (res.ok) {
          const datosAsignaciones = await res.json();
          setAsignacionesBackend(datosAsignaciones);
        }
      } catch (error) {
        console.error("Error al refrescar la agenda desde el backend:", error);
      }
    };
    cargarAgendaPaciente();
  }, [pacienteSeleccionado]);

  // 3. Manejo del Submit (Asignación)
  const handleAsignarPlan = async (e) => {
    e.preventDefault();
    if (!pacienteSeleccionado || !planSeleccionado || !fechaInicio || !fechaFin) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }

    setCargando(true);

    const payload = {
      Id_plan: parseInt(planSeleccionado, 10),
      Id_cliente: parseInt(pacienteSeleccionado, 10),
      Fecha_inicio: fechaInicio,
      Fecha_fin: fechaFin
    };

    try {
      const res = await fetch(`${API_BASE_URL}/plan/asignar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const respuestaTexto = await res.text();

      if (res.ok) {
        alert("¡Plan asignado con éxito!");
        setFechaInicio("");
        setFechaFin("");
        setPlanSeleccionado("");

        // Refrescar la agenda con la nueva ruta limpia
        const resAgenda = await fetch(`${API_BASE_URL}/nutricionista/cliente/${pacienteSeleccionado}/asignaciones`);
        if (resAgenda.ok) setAsignacionesBackend(await resAgenda.json());

      } else {
        // Mensaje del Trigger de Validación o Error del Servidor
        try {
          const errJson = JSON.parse(respuestaTexto);
          alert(`Control de Seguridad: ${errJson.mensaje || "Error en validación"}`);
        } catch {
          alert(`Aviso de Sistema: ${respuestaTexto}`);
        }
      }
    } catch (error) {
      alert("Fallo de red al intentar asignar.");
    } finally {
      setCargando(false);
    }
  };

  const diasSemanaFechas = obtenerDiasDeLaSemana(fechaBase);
  const mesActualStr = NOMBRES_MESES[fechaBase.getMonth()];
  const anioActualStr = fechaBase.getFullYear();

  const limitePaciente = infoPacienteElegido ? (infoPacienteElegido.consumo_Maximo ?? infoPacienteElegido.consumo_maximo ?? 0) : 0;
  const caloriasDelPlan = infoPlanElegido ? (infoPlanElegido.total_Calorias ?? infoPlanElegido.total_calorias ?? 0) : 0;

  return (
    <div className="container-fluid min-vh-100 p-4" style={{ backgroundColor: "#f8fafc", fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      
      {/* HEADER ESTILIZADO */}
      <div className="mb-4 bg-white p-4 shadow-sm border-0" style={{ borderRadius: "16px" }}>
        <h4 className="fw-bold text-dark mb-1">Panel de Control y Agenda Nutricional</h4>
        <p className="text-muted small mb-0">Asignación inteligente con blindaje contra sobrecarga calórica y colisión de fechas.</p>
      </div>

      <div className="row g-4">
        {/* FORMULARIO */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-4 h-100 bg-white" style={{ borderRadius: "20px" }}>
            <div className="d-flex align-items-center gap-2 mb-4">
              <span className="fs-5"></span>
              <h5 className="fw-bold text-dark mb-0">Nueva Planificación</h5>
            </div>
            
            <form onSubmit={handleAsignarPlan} className="d-flex flex-column gap-3">
              
              {/* PACIENTE */}
              <div>
                <label className="form-label small fw-bold text-secondary mb-1">Paciente Asignado *</label>
                <select 
                  className="form-select bg-light border-0 py-2.5 px-3" 
                  style={{ borderRadius: "10px", fontSize: "0.9rem" }}
                  value={pacienteSeleccionado} 
                  onChange={(e) => setPacienteSeleccionado(e.target.value)} 
                  required
                >
                  <option value="">Seleccione un paciente...</option>
                  {pacientes.map((p) => {
                    const id = p.idUsuario || p.id_usuario;
                    return <option key={id} value={id}>{p.nombre || p.Nombre} {p.ap1 || p.Ap1}</option>;
                  })}
                </select>
              </div>

              {/* PLAN */}
              <div>
                <label className="form-label small fw-bold text-secondary mb-1">Plan Alimenticio *</label>
                <select 
                  className="form-select bg-light border-0 py-2.5 px-3" 
                  style={{ borderRadius: "10px", fontSize: "0.9rem" }}
                  value={planSeleccionado} 
                  onChange={(e) => setPlanSeleccionado(e.target.value)} 
                  required
                >
                  <option value="">Seleccione un plan...</option>
                  {planes.map((pl) => {
                    const id = pl.idPlan || pl.id_plan;
                    return <option key={id} value={id}>{pl.nombre || pl.Nombre}</option>;
                  })}
                </select>
              </div>

              {/* COMPARATIVA DE CALORÍAS */}
              {infoPacienteElegido && infoPlanElegido && (
                <div className={`p-3 rounded-3 small fw-semibold border-0 ${caloriasDelPlan > limitePaciente ? 'bg-danger bg-opacity-10 text-danger' : 'bg-success bg-opacity-10 text-success'}`} style={{ borderRadius: "12px" }}>
                  <div className="d-flex justify-content-between"><span>Límite Diario:</span> <strong>{limitePaciente} kcal</strong></div>
                  <div className="d-flex justify-content-between mt-1"><span>Peso del Plan:</span> <strong>{caloriasDelPlan} kcal</strong></div>
                  <div className="mt-2 pt-2 border-top border-2 border-white text-center" style={{ fontSize: '0.75rem' }}>
                    {caloriasDelPlan > limitePaciente 
                      ? "❌ Rechazo automático: Supera el límite diario." 
                      : "✔ Plan apto para ser calendarizado."}
                  </div>
                </div>
              )}

              {/* FECHAS */}
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small fw-bold text-secondary mb-1">Fecha Inicio *</label>
                  <input type="date" className="form-control bg-light border-0 py-2" style={{ borderRadius: "8px" }} value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-secondary mb-1">Fecha Fin *</label>
                  <input type="date" className="form-control bg-light border-0 py-2" style={{ borderRadius: "8px" }} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="btn w-100 text-white shadow-sm py-2.5 fw-bold mt-2" style={{ backgroundColor: "#1abc9c", border: "none", borderRadius: "12px", transition: "all 0.2s" }} disabled={cargando}>
                {cargando ? "Validando Reglas..." : "Confirmar Calendario"}
              </button>
            </form>
          </div>
        </div>

        {/* AGENDA SEMANAL VISUAL MEJORADA */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm p-4 h-100 bg-white" style={{ borderRadius: "20px" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-2">
                <span className="fs-5"></span>
                <h5 className="fw-bold text-dark mb-0">Línea de Tiempo ({mesActualStr} {anioActualStr})</h5>
              </div>
              <div className="btn-group shadow-sm bg-light" style={{ borderRadius: "10px", padding: "2px" }}>
                <button className="btn btn-sm btn-light border-0 px-3 fw-bold" onClick={() => { const d = new Date(fechaBase); d.setDate(d.getDate() - 7); setFechaBase(d); }}>◀</button>
                <button className="btn btn-sm btn-light border-0 px-3 text-primary fw-medium small" onClick={() => setFechaBase(new Date())}>Hoy</button>
                <button className="btn btn-sm btn-light border-0 px-3 fw-bold" onClick={() => { const d = new Date(fechaBase); d.setDate(d.getDate() + 7); setFechaBase(d); }}>▶</button>
              </div>
            </div>

            {/* GRID DEL CALENDARIO */}
            <div className="row row-cols-1 row-cols-md-7 g-2 text-center flex-grow-1">
              {diasSemanaFechas.map((date, idx) => {
                const esHoy = date.toDateString() === new Date().toDateString();
                
                // Normalizar la fecha del día del calendario a formato YYYY-MM-DD local
                const anio = date.getFullYear();
                const mes = String(date.getMonth() + 1).padStart(2, '0');
                const dia = String(date.getDate()).padStart(2, '0');
                const fechaCeldaStr = `${anio}-${mes}-${dia}`;

                // Verificar si este día cae dentro de alguna asignación
                const planesAsignadosHoy = asignacionesBackend.filter(asig => {
                  // Limpiar los strings de fecha que vienen del JSON 
                  const inicioFormateado = asig.fecha_inicio?.split('T')[0] || asig.id_plan.toString(); // Fallback seguro
                  const finFormateado = asig.fecha_fin?.split('T')[0] || "";
                  
                  return fechaCeldaStr >= inicioFormateado && fechaCeldaStr <= finFormateado;
                });

                return (
                  <div key={idx} className="col d-flex flex-column">
                    <div 
                      className="p-2 w-100 rounded-4 d-flex flex-column h-100 transition-all shadow-2xs" 
                      style={{ 
                        backgroundColor: esHoy ? "#f0fdf4" : "#f8fafc", 
                        border: esHoy ? "2px solid #22c55e" : "1px solid #e2e8f0",
                        minHeight: "180px"
                      }}
                    >
                      <span className="text-uppercase fw-bold text-muted mb-1" style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}>
                        {DIAS_SEMANA[idx]}
                      </span>
                      <span 
                        className={`fw-bold d-inline-block mx-auto mb-2 ${esHoy ? 'bg-success text-white' : 'text-dark'}`} 
                        style={{ width: "26px", height: "26px", lineHeight: "26px", borderRadius: "50%", fontSize: "0.85rem" }}
                      >
                        {date.getDate()}
                      </span>
                      
                      {/* CONTENEDOR DE EVENTOS INTERNO */}
                      <div className="flex-grow-1 d-flex flex-column justify-content-start gap-1 p-1 rounded-3 bg-white border border-light">
                        {planesAsignadosHoy.length === 0 ? (
                          <div className="my-auto text-muted small" style={{ fontSize: "0.7rem", fontStyle: "italic" }}>Libre</div>
                        ) : (
                          planesAsignadosHoy.map((asig, i) => {
                            // Buscar el nombre estético del plan usando el id
                            const pNombre = planes.find(p => (p.idPlan || p.id_plan) === asig.id_plan)?.nombre || `Plan #${asig.id_plan}`;
                            return (
                              <div 
                                key={i} 
                                className="p-1.5 text-start border-start border-3 border-primary rounded-1 text-truncate"
                                style={{ backgroundColor: "#eff6ff", color: "#1e40af", fontSize: "0.7rem", lineHeight: "1.1" }}
                                title={pNombre}
                              >
                                <strong className="d-block text-truncate">{pNombre}</strong>
                              </div>
                            );
                          })
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NutricionistaDashboard;