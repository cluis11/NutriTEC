import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../App.css'; 

const NOMBRES_MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const obtenerDiasDeLaSemana = (fechaBase) => {
  const copia = new Date(fechaBase);
  const diaSemanaIdx = copia.getDay();
  const distanciaAlLunes = diaSemanaIdx === 0 ? -6 : 1 - diaSemanaIdx;
  const lunesDeEstaSemana = new Date(copia.setDate(copia.getDate() + distanciaAlLunes));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunesDeEstaSemana);
    d.setDate(lunesDeEstaSemana.getDate() + i);
    return d;
  });
};

const NutricionistaDashboard = () => {
  const navigate = useNavigate();
 
  // PRUEBA DE PACIENTES DISPONIBLES
  const [pacientes] = useState([
    { id: "1", nombre: "Gabriel Soto Agreste", cedula: "1-0943-0821" },
    { id: "2", nombre: "Ariel Saborio", cedula: "2-0754-0192" }
  ]);
  
  const [pacienteActivoId, setPacienteActivoId] = useState("1");
  const pacienteActivo = pacientes.find(p => p.id === pacienteActivoId);

  // Estados iniciales de calendario
  const [fechaPivote, setFechaPivote] = useState(new Date(2026, 5, 1)); 
  const [fechaComida, setFechaComida] = useState(new Date().toISOString().split('T')[0]);
  const [alimentoNuevo, setAlimentoNuevo] = useState('');
  const [tiempoComida, setTiempoComida] = useState('Desayuno');

  // DATOS PRUEBA
  const [planesPorPaciente, setPlanesPorPaciente] = useState({
    "1": [
      { fecha: '2026-06-02', tiempo: 'Desayuno', detalle: 'Manzana' },
      { fecha: '2026-06-02', tiempo: 'Almuerzo', detalle: 'Pollo a la plancha' }
    ],
    "2": [
      { fecha: '2026-06-03', tiempo: 'Almuerzo', detalle: 'Pescado' }
    ]
  });

  // Lógica de fechas
  const diasDeEstaSemana = obtenerDiasDeLaSemana(fechaPivote);
  const semanaAnterior = () => { const n = new Date(fechaPivote); n.setDate(n.getDate() - 7); setFechaPivote(n); };
  const semanaSiguiente = () => { const n = new Date(fechaPivote); n.setDate(n.getDate() + 7); setFechaPivote(n); };
  const mesEncabezado = NOMBRES_MESES[diasDeEstaSemana[0].getMonth()];
  const añoEncabezado = diasDeEstaSemana[0].getFullYear();

  // Comidas asignadas al paciente actual
  const comidasAsignadasActual = planesPorPaciente[pacienteActivoId] || [];

  // Asignar comida
  const handleRegistrarComida = (e) => {
    e.preventDefault();
    if (alimentoNuevo.trim()) {
      const nuevaComida = { fecha: fechaComida, tiempo: tiempoComida, detalle: alimentoNuevo.trim() };
      
      setPlanesPorPaciente({
        ...planesPorPaciente,
        [pacienteActivoId]: [...comidasAsignadasActual, nuevaComida]
      });

      setAlimentoNuevo('');
      alert(`¡Comida asignada al plan de ${pacienteActivo.nombre}!`);
    }
  };

  return (
    <div className="admin-layout" style={{ fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <main className="main-content" style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "2rem" }}>
       
        <div className="card border-0 shadow-sm p-4 bg-white rounded-3 mb-4">
          <div className="row align-items-center">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-uppercase text-muted font-monospace mb-1" style={{ letterSpacing: "0.5px" }}>
                Seleccionar Paciente 
              </label>
              <select 
                className="form-select fw-semibold" 
                style={{ borderRadius: "8px", borderColor: "#cbd5e1", color: "#0f172a" }}
                value={pacienteActivoId}
                onChange={(e) => setPacienteActivoId(e.target.value)}
              >
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.cedula})</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6 text-md-end mt-3 mt-md-0">
              <span className="text-secondary small">Viendo el plan de:</span>
              <h5 className="fw-bold mb-0" style={{ color: "#1abc9c" }}>{pacienteActivo.nombre}</h5>
            </div>
          </div>
        </div>

        <div className="row g-4">
          
          {/* Calendario Semanal */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm p-4 bg-white rounded-3 d-flex flex-column" style={{ minHeight: "530px" }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0" style={{ color: "#0f172a" }}>{mesEncabezado} {añoEncabezado}</h4>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-light border text-secondary bg-white shadow-sm px-2.5" onClick={semanaAnterior}>&lt; Ant</button>
                  <button className="btn btn-sm btn-outline-light border text-secondary bg-white shadow-sm px-2.5" onClick={semanaSiguiente}>Sig &gt;</button>
                </div>
              </div>
              
              <div className="d-flex flex-row gap-2" style={{ overflowX: "auto", paddingBottom: "10px" }}>
                {diasDeEstaSemana.map((objetoFecha, idx) => {
                  const numDia = objetoFecha.getDate();
                  const yyyy = objetoFecha.getFullYear();
                  const mm = String(objetoFecha.getMonth() + 1).padStart(2, '0');
                  const dd = String(numDia).padStart(2, '0');
                  const fechaCelda = `${yyyy}-${mm}-${dd}`;
                  
                  const comidasDelDia = comidasAsignadasActual.filter(c => c.fecha === fechaCelda);

                  return (
                    <div key={fechaCelda} style={{ minWidth: "125px", width: "14.28%" }}>
                      <div className="card h-100 border-0 bg-white" style={{ borderRadius: "8px", outline: "1px solid #e2e8f0" }}>
                        <div className="text-center border-bottom pb-2 mb-2 pt-2 bg-light rounded-top-2">
                          <span className="fw-bold text-uppercase text-muted d-block font-monospace" style={{ fontSize: "0.65rem" }}>{DIAS_SEMANA[idx].substring(0, 3)}</span>
                          <span className="fw-bold h5 mb-0" style={{ color: "#0f172a" }}>{numDia}</span>
                        </div>
                        <div className="d-flex flex-column gap-2 px-2 pb-2" style={{ maxHeight: "350px", overflowY: "auto" }}>
                        {comidasDelDia.map((comida, index) => (
                            <div key={index} className="p-2 rounded border-start border-3 shadow-sm" style={{ backgroundColor: "#f8fafc", borderColor: "#1abc9c", fontSize: "0.7rem" }}>
                            <strong className="text-dark d-block mb-0.5" style={{ opacity: 0.8 }}>{comida.tiempo}</strong>
                            <span className="text-secondary" style={{ lineHeight: "1.2" }}>{comida.detalle}</span>
                            </div>
                        ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Formulario para agregar comida */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm p-4 bg-white rounded-3">
              <h5 className="fw-bold mb-3" style={{ color: "#0f172a" }}>Estructurar Plan</h5>
              <form onSubmit={handleRegistrarComida}>
                <div className="mb-2.5">
                  <label className="form-label small fw-semibold text-secondary mb-1">Fecha del Plan</label>
                  <input type="date" className="form-control form-control-sm bg-light border-0 px-2.5 py-1.5" style={{ borderRadius: "6px" }} value={fechaComida} onChange={(e) => setFechaComida(e.target.value)} required />
                </div>
                <div className="mb-2.5">
                  <label className="form-label small fw-semibold text-secondary mb-1">Producto</label>
                  <input type="text" className="form-control form-control-sm bg-light border-0 px-2.5 py-1.5" style={{ borderRadius: "6px" }} placeholder="Ej: Licuado verde + 2 huevos..." value={alimentoNuevo} onChange={(e) => setAlimentoNuevo(e.target.value)} required />
                </div>
                <div className="mb-3.5">
                  <label className="form-label small fw-semibold text-secondary mb-1">Tiempo de Comida</label>
                  <select className="form-select form-select-sm bg-light border-0 px-2.5 py-1.5" style={{ borderRadius: "6px" }} value={tiempoComida} onChange={(e) => setTiempoComida(e.target.value)}>
                    <option value="Desayuno">Desayuno</option>
                    <option value="Aperitivo">Aperitivo</option>
                    <option value="Almuerzo">Almuerzo</option>
                    <option value="Cena">Cena</option>
                  </select>
                </div>
                <button type="submit" className="btn w-100 text-white shadow-sm py-2 fw-medium" style={{ backgroundColor: "#1abc9c", border: "none", borderRadius: "8px", fontSize: "0.9rem" }}>
                  Asignar
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default NutricionistaDashboard;