import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';  
import 'bootstrap/dist/css/bootstrap.min.css';

// ==========================================
// Importamos los módulos de cada seccion
// ==========================================
import Productos from './Productos';
import RegistroMedidas from './insertMedida';
// import GestionRecetas from './GestionRecetas';
import ReporteAvance from './reporte';

const ClientMain = () => {
  const navigate = useNavigate();
  const [vistaActiva, setVistaActiva] = useState('dashboard');
 const [comidasAsignadas, setComidasAsignadas] = useState([]);

  const [fechaComida, setFechaComida] = useState(new Date().toISOString().split('T')[0]);
  const [tiempoComida, setTiempoComida] = useState('Desayuno');
  const [porcionComida, setPorcionComida] = useState(1);
  const [caloriasTotales, setCaloriasTotales] = useState(0);

  // Estado para bucar comidas
  const [filtroAlimento, setFiltroAlimento] = useState('');
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState(null);

  const [listaAlimentos, setListaAlimentos] = useState([]);

  // Traer productos del bd
  // TODO: Agregar receta 
  useEffect(() => {
    const cargarProductosAPI = async () => {
        try {
          const response = await fetch('http://localhost:5108/api/producto');
          if (response.ok) {
            const datos = await response.json();
            setListaAlimentos(datos);
          } else {
            console.error("Error al obtener los productos desde la base de datos");
          }
        } catch (error) {
          console.error("No se pudo conectar con el servidor de NutriTEC:", error);
        }
      };

      cargarProductosAPI();
  }, []);

  // Calcular calorías totales por dia
  useEffect(() => {
    const caloriasDelDia = comidasAsignadas
      .filter(c => c.fecha === fechaComida)
      .reduce((sum, current) => sum + (current.calorias || 0), 0);
    setCaloriasTotales(caloriasDelDia);
  }, [fechaComida, comidasAsignadas]);

  // Busqueda por nombre o codigo de barras
  const sugerenciasAlimentos = filtroAlimento.trim() === '' ? [] : listaAlimentos.filter(alimento => {
    const termino = filtroAlimento.toLowerCase();
    const cumpleNombre = alimento.nombre?.toLowerCase().includes(termino) || alimento.descripcion?.toLowerCase().includes(termino);
    const cumpleCodigo = alimento.codigoBarras?.toString().includes(termino);
    return cumpleNombre || cumpleCodigo;
  });
  // Lógica para fechas en el calendario 
  const [fechaPivote, setFechaPivote] = useState(new Date(2026, 5, 1)); 

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

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

  // Logica de registro
  const handleRegistrarComida = (e) => {
    e.preventDefault();
    if (!alimentoSeleccionado) {
      alert("Por favor, busque una comida válida");
      return;
    }
        
  const nombreAlimentoElegido = alimentoSeleccionado.nombre || alimentoSeleccionado.descripcion || "Producto sin nombre";
  const caloriasBase = alimentoSeleccionado.calorias || alimentoSeleccionado.energia || 0;

    // Estructura del nuevo consumo diario
    const nuevoConsumo = {
      fecha: fechaComida,
      tiempo: tiempoComida,
      detalle: nombreAlimentoElegido,
      calorias: caloriasBase * porcionComida
    };
    setComidasAsignadas(prev => [...prev, nuevoConsumo]);

    alert(`¡Éxito! "${nombreAlimentoElegido}" asignado a tu ${tiempoComida}.`);
    
    // Limpieza de campos del buscador
    setFiltroAlimento('');
    setAlimentoSeleccionado(null);
    setPorcionComida(1);
  };

  return (
    <div className="container-fluid calendar-container py-2" style={{ minHeight: "100vh", overflowY: "auto" }}>
      <div className="row g-4 style-lg-height" style={{ height: "100%" }}>
        
        {/* Menu lateral */}
        <div className="col-10 col-sm-6 col-lg-2 mx-auto mx-lg-0">
          <div className="card border-0 shadow-sm p-3 p-lg-4 bg-white rounded-3 h-100">
            <h5 
              className="fw-bold mb-2 mb-lg-3 text-center text-lg-start" 
              style={{ color: "#2c3e50", fontSize: "1.1rem", cursor: "pointer" }}
              onClick={() => setVistaActiva('dashboard')}
            >
              Mi Perfil NutriTEC
            </h5>
            <hr className="text-muted opacity-25 my-2" />
            <div>
              <div className="list-group list-group-flush d-flex flex-row flex-lg-column flex-wrap justify-content-center justify-content-lg-start gap-1 gap-lg-0">
                
                <button 
                  className={`list-group-item list-group-item-action border-0 px-2 small py-2 text-start rounded-2 w-auto w-lg-100 ${vistaActiva === 'medida' ? 'active' : ''}`} 
                  onClick={() => setVistaActiva('medida')}
                >
                  <span>Registro de Medidas</span>
                </button>
                
                <button 
                  className={`list-group-item list-group-item-action border-0 px-2 small py-2 text-start rounded-2 w-auto w-lg-100 ${vistaActiva === 'recetas' ? 'active' : ''}`} 
                  onClick={() => setVistaActiva('recetas')}
                >
                  <span>Gestión de Recetas</span>
                </button>
                
                <button 
                  className={`list-group-item list-group-item-action border-0 px-2 small py-2 text-start rounded-2 w-auto w-lg-100 ${vistaActiva === 'productos' ? 'active' : ''}`} 
                  onClick={() => setVistaActiva('productos')}
                >
                  <span>Gestión de Productos</span>
                </button>
                
                <button 
                  className={`list-group-item list-group-item-action border-0 px-2 small py-2 text-start rounded-2 w-auto w-lg-100 ${vistaActiva === 'reporte' ? 'active' : ''}`} 
                  onClick={() => setVistaActiva('reporte')}
                >
                  <span>Reporte de Avance</span>
                </button>

              </div>
            </div>
          </div>
        </div>

        {/* Base del calendario */}
        {vistaActiva === 'dashboard' && (
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
        )}

        {/* Log diario */}
        {vistaActiva === 'dashboard' && (
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
                  <label className="form-label small fw-semibold text-secondary mb-1">Tiempo de comida:</label>
                  <select className="form-select form-select-sm" value={tiempoComida} onChange={(e) => setTiempoComida(e.target.value)}>
                    <option value="Desayuno">Desayuno</option>
                    <option value="Aperitivo">Aperitivo</option>
                    <option value="Almuerzo">Almuerzo</option>
                    <option value="Cena">Cena</option>
                  </select>
                </div>
                <div className="mb-2 position-relative">
                <label className="form-label small fw-semibold text-secondary mb-1">Producto o Receta:</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm"
                    value={filtroAlimento} 
                    placeholder="Buscar por descripción o código..."
                    onChange={(e) => {
                      setFiltroAlimento(e.target.value);
                      if (alimentoSeleccionado) setAlimentoSeleccionado(null);
                    }} 
                    autoComplete="off"
                    required 
                />

                  {/*Sugerencias de comidas */}
                  {sugerenciasAlimentos.length > 0 && (
                    <ul className="list-group position-absolute w-100 shadow-sm mt-1" style={{ zIndex: 1000, maxHeight: "180px", overflowY: "auto" }}>
                      {sugerenciasAlimentos.map((alimento) => {
                        const nombreOp = alimento.descripcion || alimento.nombre;
                        const codigoOp = alimento.codigo || alimento.codigoBarras;
                        return (
                          <button
                            key={alimento.id_producto || codigoOp || nombreOp}
                            type="button"
                            className="list-group-item list-group-item-action text-start small p-2"
                            onClick={() => {
                              setAlimentoSeleccionado(alimento);
                              setFiltroAlimento(nombreOp);
                            }}
                          >
                            <div className="fw-bold">{nombreOp}</div>
                          </button>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold text-secondary mb-1">Porción (g):</label>
                  <input type="number" className="form-control form-control-sm" value={porcionComida} onChange={(e) => setPorcionComida(e.target.value)} required />
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
        )}

        {vistaActiva !== 'dashboard' && (
          <div className="col-12 col-lg-10">
            <button 
              className="btn btn-outline-secondary btn-sm mb-3"
              onClick={() => setVistaActiva('dashboard')}
            >
               Volver al Panel Principal
            </button>

            {vistaActiva === 'medida' && <RegistroMedidas />}
            {vistaActiva === 'productos' && <Productos />}
            {vistaActiva === 'reporte' && <ReporteAvance />}
            {/* Marcadores provisionales para las vistas que quedan por hacer */}
            {vistaActiva === 'recetas' && <div className="card p-4"><h3>Gestión de Recetas</h3></div>}
          </div>
        )}

      </div>
    </div>
  );
};

export default ClientMain;