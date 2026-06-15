import React, { useState } from 'react';
import '../App.css';  
import 'bootstrap/dist/css/bootstrap.min.css';
import Productos from './Productos';


const ClientMain = () => {
  // DATOS SIMULADOS DE COMIDAS PARA DISPLAY EN CALENDARIO
  const [comidasAsignadas] = useState([
    { fecha: '2026-06-02', tiempo: ' Desayuno', detalle: 'Manzana' },
    { fecha: '2026-06-02', tiempo: ' Almuerzo', detalle: 'Pollo a la plancha con quinoa' },
    { fecha: '2026-06-02', tiempo: ' Cena', detalle: 'Salmón con espárragos' },
    { fecha: '2026-06-05', tiempo: ' Almuerzo', detalle: 'Filete de pescado con ensalada verde' },
    { fecha: '2026-07-01', tiempo: ' Desayuno', detalle: 'Pinto con huevo (Mes Siguiente)' }
  ]);

  const [fechaComida, setFechaComida] = useState(new Date().toISOString().split('T')[0]);
  const [alimentoNuevo, setAlimentoNuevo] = useState('');
  const [tiempoComida, setTiempoComida] = useState('Desayuno');
  const [caloriasTotales, setCaloriasTotales] = useState(0);
  const [vistaActual, setVistaActual] = useState("calendario");

  // Lógica para fechas en el calendario 
  const [fechaPivote, setFechaPivote] = useState(new Date(2026, 5, 1)); 

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Función para obtener los 7 días de la semana actual 
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

  const diasDeEstaSemana = obtenerDiasDeLaSemana(fechaPivote);

  const semanaAnterior = () => {
    const nuevaFecha = new Date(fechaPivote);
    nuevaFecha.setDate(nuevaFecha.getDate() - 7);
    setFechaPivote(nuevaFecha);
  };

  const semanaSiguiente = () => {
    const nuevaFecha = new Date(fechaPivote);
    nuevaFecha.setDate(nuevaFecha.getDate() + 7);
    setFechaPivote(nuevaFecha);
  };

  const mesEncabezado = nombresMeses[diasDeEstaSemana[0].getMonth()];
  const añoEncabezado = diasDeEstaSemana[0].getFullYear();

  if (vistaActual === "productos") {
  return (
    <div className="container-fluid py-4">
      <button 
        className="btn btn-outline-secondary mb-3"
        onClick={() => setVistaActual("calendario")}
      >
        Volver al calendario
      </button>

      <Productos />
    </div>
  );
}

  // IMPLEMENTAR LOGICA DE LOG COMIDA
  const handleRegistrarComida = (e) => {
    e.preventDefault();
    if (alimentoNuevo.trim()) {
      alert(`¡Éxito! "${alimentoNuevo}" añadido al historial para la fecha ${fechaComida}.`);
      setCaloriasTotales(prev => prev + 350); 
      setAlimentoNuevo('');
    }
  };

  return (
    <div className="container-fluid calendar-container py-2" style={{ minHeight: "100vh", overflowY: "auto" }}>
      <div className="row g-4 style-lg-height" style={{ height: "100%" }}>
        
        {/* Menu lateral */}
        <div className="col-10 col-sm-6 col-lg-2 mx-auto mx-lg-0">
          <div className="card border-0 shadow-sm p-3 p-lg-4 bg-white rounded-3 h-100">
            <h5 className="fw-bold mb-2 mb-lg-3 text-center text-lg-start" style={{ color: "#2c3e50", fontSize: "1.1rem" }}>Mi Perfil NutriTEC</h5>
            <hr className="text-muted opacity-25 my-2" />
            <div>
              <div className="list-group list-group-flush d-flex flex-row flex-lg-column flex-wrap justify-content-center justify-content-lg-start gap-1 gap-lg-0">
                <button className="list-group-item list-group-item-action border-0 px-2 small py-2 text-start rounded-2 w-auto w-lg-100" onClick={() => alert("Abriendo Formulario: Registrar Medidas...")}>
                  <span>Registro de Medidas</span>
                </button>
                <button className="list-group-item list-group-item-action border-0 px-2 small py-2 text-start rounded-2 w-auto w-lg-100" onClick={() => alert("Abriendo Catálogo: Gestión de Recetas...")}>
                  <span>Gestión de Recetas</span>
                </button>
                <button 
                  className="list-group-item list-group-item-action border-0 px-2 small py-2 text-start rounded-2 w-auto w-lg-100" 
                  onClick={() => setVistaActual("productos")}
                >
                  <span>Gestión de Productos</span>
                </button>
                <button className="list-group-item list-group-item-action border-0 px-2 small py-2 text-start rounded-2 w-auto w-lg-100" onClick={() => alert("Generando PDF de Avance...")}>
                  <span>Reporte de Avance</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Base del calendario */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm p-3 p-lg-4 bg-white rounded-3 d-flex flex-column" style={{ minHeight: "500px", height: "100%" }}>
            
            {/* Encabezado */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-4 flex-shrink-0 gap-2 text-center text-sm-start">
              <div>
                <h3 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>
                  {mesEncabezado} {añoEncabezado}
                </h3>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-outline-secondary btn-sm px-2.5 py-1" onClick={semanaAnterior}>
                  &lt; Ant
                </button>
                <button className="btn btn-outline-secondary btn-sm px-2.5 py-1" onClick={semanaSiguiente}>
                  Sig &gt;
                </button>
              </div>
            </div>

            {/* Columnas de fecha de semanas */}
            <div className="d-flex flex-row gap-2 align-items-stretch flex-grow-1" style={{ width: "100%", overflowX: "auto", pb: "10px" }}>
              {diasDeEstaSemana.map((objetoFecha, idx) => {
                const numDia = objetoFecha.getDate();
                const nombreDia = diasSemana[idx];
                
                const yyyy = objetoFecha.getFullYear();
                const mm = String(objetoFecha.getMonth() + 1).padStart(2, '0');
                const dd = String(numDia).padStart(2, '0');
                const fechaCelda = `${yyyy}-${mm}-${dd}`;

                const comidasDelDia = comidasAsignadas.filter(c => c.fecha === fechaCelda);

                return (
                  <div key={fechaCelda} style={{ minWidth: "120px", width: "14.28%", display: "flex" }} className="h-100">
                    <div 
                      className="card w-100 border rounded-3 p-2 bg-white d-flex flex-column h-100"
                      style={{ transition: "0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1abc9c'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#dee2e6'}
                    >
                      <div className="text-center border-bottom pb-2 mb-2 bg-light rounded-2 py-1 flex-shrink-0">
                        <span className="fw-bold text-uppercase text-secondary d-block" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>
                          {nombreDia.substring(0, 3)}
                        </span>
                        <span className="fw-bold h5 mb-0" style={{ color: "#2c3e50" }}>
                          {numDia}
                        </span>
                      </div>

                      {/* Espacio para comidas */}
                      <div className="flex-grow-1 d-flex flex-column gap-2" style={{ overflowY: "auto", maxHeight: "350px" }}>
                        {comidasDelDia.map((comida, index) => (
                          <div 
                            key={index} 
                            className="p-1.5 rounded border-start border-3 flex-shrink-0" 
                            style={{ 
                              backgroundColor: "#f8fafc", 
                              borderColor: "#1abc9c",
                              fontSize: "0.7rem" 
                            }}
                            title={`${comida.tiempo}: ${comida.detalle}`}
                          >
                            <strong className="text-secondary d-block" style={{ fontSize: "0.62rem" }}>
                              {comida.tiempo.trim()}
                            </strong>
                            <span className="text-dark text-wrap d-block">{comida.detalle}</span>
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

        {/* Log diario */}
        <div className="col-12 col-md-6 col-lg-3 mx-auto mx-lg-0">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-3 h-100">
            <div className="mb-3">
              <h4 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>Registro de alimentos consumidos</h4>
            </div>
            <form onSubmit={handleRegistrarComida}>
              <div className="mb-2">
                <label className="form-label small fw-semibold text-secondary mb-1">Fecha:</label>
                <input type="date" className="form-control form-control-sm" value={fechaComida} onChange={(e) => setFechaComida(e.target.value)} required />
              </div>
              <div className="mb-2">
                <label className="form-label small fw-semibold text-secondary mb-1">Producto o Receta:</label>
                <input type="text" className="form-control form-control-sm" placeholder="Ej: Manzana, Café..." value={alimentoNuevo} onChange={(e) => setAlimentoNuevo(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-1">Tiempo de comida:</label>
                <select className="form-select form-select-sm" value={tiempoComida} onChange={(e) => setTiempoComida(e.target.value)}>
                  <option value="Aperitivo">Aperitivo</option>
                  <option value="Desayuno">Desayuno</option>
                  <option value="Almuerzo">Almuerzo</option>
                  <option value="Cena">Cena</option>
                </select>
                
            {/* IMPLEMENTAR LOGICA DE LOG COMIDA Y CALORIAS*/}
              </div>
              <button type="submit" className="btn w-100 fw-semibold text-white shadow-sm py-2" style={{ backgroundColor: "#1abc9c", border: "none", fontSize: "0.9rem" }}>
                Añadir Comida
              </button>
            </form>
            <div className="mt-3 p-3 rounded-3 text-center border-0 shadow-sm" style={{ backgroundColor: "#e8f8f5" }}>
              <span className="fw-bold h5 d-block mb-1" style={{ color: "#16a085" }}>{caloriasTotales} / 2000 kcal</span>
              <div className="progress mb-1" style={{ height: "6px" }}>
                <div className="progress-bar" role="progressbar" style={{ width: `${(caloriasTotales / 2000) * 100}%`, backgroundColor: "#1abc9c" }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClientMain;