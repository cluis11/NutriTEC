import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../../components/Navbar';

import Productos from './Productos';
import RegistroMedidas from './insertMedida';
import GestionRecetas from './GestionRecetas';
import ReporteAvance from './reporte';
import Retroalimentacion from './retroalimentacion';
import MiPlan from './MiPlan';

const ClientMain = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
  const [idClienteLogueado] = useState(usuario.id_usuario || 4);
  const consumoMaximo = usuario.consumo_maximo || 2000;

  const [vistaActiva, setVistaActiva] = useState('dashboard');
  const [comidasAsignadas, setComidasAsignadas] = useState([]);
  const [fechaPivote, setFechaPivote] = useState(new Date());

  const [tipoRegistro, setTipoRegistro] = useState('producto'); // producto | receta | plan
  const [fechaComida, setFechaComida] = useState(new Date().toISOString().split('T')[0]);
  const [tiempoComida, setTiempoComida] = useState('desayuno');
  const [porcionComida, setPorcionComida] = useState(1);
  const [caloriasTotales, setCaloriasTotales] = useState(0);

  const [filtroAlimento, setFiltroAlimento] = useState('');
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState(null);
  const [listaAlimentos, setListaAlimentos] = useState([]);

  const [recetas, setRecetas] = useState([]);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState('');

  useEffect(() => {
    const cargarProductosAPI = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/producto`);
        if (response.ok) {
          const datos = await response.json();
          setListaAlimentos(datos);
        }
      } catch (error) {
        console.error("No se pudo conectar con el servidor de NutriTEC:", error);
      }
    };
    cargarProductosAPI();
  }, []);

  useEffect(() => {
    const cargarRecetas = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/receta/cliente/${idClienteLogueado}`);
        if (response.ok) {
          const datos = await response.json();
          setRecetas(datos);
        }
      } catch (error) {
        console.error("Error al cargar recetas:", error);
      }
    };
    cargarRecetas();
  }, [idClienteLogueado]);

  useEffect(() => {
    cargarConsumoDiarioAPI();
  }, [fechaPivote, idClienteLogueado]);

  const cargarConsumoDiarioAPI = async () => {
    try {
      const diasSemanaActual = obtenerDiasDeLaSemana(fechaPivote);

      const formatearFechaISO = (objetoFecha) => {
        const yyyy = objetoFecha.getFullYear();
        const mm = String(objetoFecha.getMonth() + 1).padStart(2, '0');
        const dd = String(objetoFecha.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      const promesasSemanales = diasSemanaActual.map(dia =>
        fetch(`${process.env.REACT_APP_API_URL}/api/cliente/${idClienteLogueado}/registro?fecha=${formatearFechaISO(dia)}`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      );

      const resultadosSemanales = await Promise.all(promesasSemanales);
      const listaPlanaFormateada = [];
      let caloriasDiaSeleccionado = 0;

      resultadosSemanales.forEach((data, index) => {
        if (!data) return;
        const fechaCeldaLoop = formatearFechaISO(diasSemanaActual[index]);
        if (fechaCeldaLoop === fechaComida) {
          caloriasDiaSeleccionado = data.total_dia || 0;
        }
        if (data.registros) {
          data.registros.forEach(reg => {
            if (reg.productos) {
              reg.productos.forEach(prod => {
                const fechaRealRegistro = reg.fecha ? reg.fecha.split('T')[0] : fechaCeldaLoop;
                listaPlanaFormateada.push({
                  fecha: fechaRealRegistro.trim(),
                  tiempo: reg.tiempo ? reg.tiempo.toLowerCase().trim() : "desayuno",
                  detalle: prod.descripcion || prod.nombre,
                  calorias: prod.energia
                });
              });
            }
          });
        }
      });

      setComidasAsignadas([...listaPlanaFormateada]);
      setCaloriasTotales(caloriasDiaSeleccionado);
    } catch (error) {
      console.error("Error al conectar con el endpoint de consumo diario:", error);
    }
  };

  useEffect(() => {
    const comidasDelDia = comidasAsignadas.filter(c => c.fecha === fechaComida);
    const sumaCalorias = comidasDelDia.reduce((acc, curr) => acc + (curr.calorias || 0), 0);
    setCaloriasTotales(sumaCalorias);
  }, [fechaComida, comidasAsignadas]);

  useEffect(() => {
    cargarConsumoDiarioAPI();
  }, [fechaComida, idClienteLogueado]);

  const sugerenciasAlimentos = filtroAlimento.trim() === '' ? [] : listaAlimentos.filter(alimento => {
    const termino = filtroAlimento.toLowerCase();
    const cumpleNombre = alimento.nombre?.toLowerCase().includes(termino) || alimento.descripcion?.toLowerCase().includes(termino);
    const cumpleCodigo = alimento.codigo?.toString().includes(termino);
    return cumpleNombre || cumpleCodigo;
  });

  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
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

  const handleRegistrar = async (e) => {
    e.preventDefault();
    try {
      let url, body, msg;

      if (tipoRegistro === 'producto') {
        if (!alimentoSeleccionado) {
          alert("Seleccioná un alimento de la lista.");
          return;
        }
        url = `${process.env.REACT_APP_API_URL}/api/cliente/${idClienteLogueado}/registro`;
        body = {
          id_cliente: idClienteLogueado,
          fecha: fechaComida,
          tiempo: tiempoComida,
          id_producto: alimentoSeleccionado.id_producto,
          cantidad: parseFloat(porcionComida)
        };
        msg = "producto";
      } else if (tipoRegistro === 'receta') {
        if (!recetaSeleccionada) {
          alert("Seleccioná una receta.");
          return;
        }
        url = `${process.env.REACT_APP_API_URL}/api/cliente/${idClienteLogueado}/registro/receta`;
        body = {
          fecha: fechaComida,
          tiempo: tiempoComida,
          id_receta: parseInt(recetaSeleccionada)
        };
        msg = "receta";
      } else if (tipoRegistro === 'plan') {
        if (!usuario.plan_activo) {
          alert("No tenés un plan activo.");
          return;
        }
        url = `${process.env.REACT_APP_API_URL}/api/cliente/${idClienteLogueado}/registro/plan`;
        body = {
          fecha: fechaComida,
          tiempo: tiempoComida
        };
        msg = "plan";
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (response.ok) {
        if (data.excedido) {
          alert(data.mensaje);
        } else {
          alert(data.mensaje || `¡${msg} registrado con éxito!`);
        }
        setFiltroAlimento('');
        setAlimentoSeleccionado(null);
        setRecetaSeleccionada('');
        setPorcionComida(1);
        cargarConsumoDiarioAPI();
      } else {
        alert(data.mensaje || `Error al registrar ${msg}.`);
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      alert("Error de conexión.");
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.reload();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar onVerPerfil={() => setVistaActiva('perfil')} onCerrarSesion={handleCerrarSesion} />

      <div className="d-flex gap-2 px-4 pt-3 pb-2 flex-wrap" style={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
        {[
          { key: 'dashboard', label: '📅 Registro Diario' },
          { key: 'mi-plan', label: '📋 Mi Plan' },
          { key: 'medida', label: '📏 Medidas' },
          { key: 'productos', label: '🥦 Productos' },
          { key: 'recetas', label: '🍽️ Recetas' },
          { key: 'reporte', label: '📊 Reporte' },
          { key: 'retroalimentacion', label: '💬 Seguimiento Nutricionista' }
        ].map(({ key, label }) => (
          <button
            key={key}
            className="btn btn-sm"
            style={{
              background: vistaActiva === key ? '#1abc9c' : 'transparent',
              color: vistaActiva === key ? '#fff' : '#64748b',
              border: vistaActiva === key ? 'none' : '1px solid #e2e8f0',
              borderRadius: '8px',
              fontWeight: vistaActiva === key ? '600' : '400'
            }}
            onClick={() => setVistaActiva(key)}
          >
            {label}
          </button>
        ))}
        {usuario.plan_activo && (
          <span style={{
            background: '#e8f8f5',
            color: '#16a085',
            border: '1px solid #1abc9c',
            borderRadius: '8px',
            padding: '4px 12px',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            📋 Plan: {usuario.plan_activo.nombre}
          </span>
        )}
        <button
          className="btn btn-sm ms-auto"
          style={{ color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px' }}
          onClick={handleCerrarSesion}
        >
          Cerrar sesión
        </button>
      </div>

      <div className="container-fluid p-3">
        {vistaActiva === 'dashboard' && (
          <div className="row g-3">
            <div className="col-12 col-lg-9">
              <div className="card border-0 shadow-sm p-3 bg-white rounded-3 style-lg-height d-flex flex-column calendar-container">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>{mesEncabezado} {añoEncabezado}</h3>
                  <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-outline-secondary btn-sm" onClick={semanaAnterior}>&lt; Ant</button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={semanaSiguiente}>Sig &gt;</button>
                  </div>
                </div>
                <div className="d-flex flex-row gap-2 align-items-stretch flex-grow-1" style={{ width: "100%", overflowX: "auto" }}>
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
                            <span className="fw-bold text-uppercase text-secondary d-block" style={{ fontSize: "0.7rem" }}>{nombreDia.substring(0, 3)}</span>
                            <span className="fw-bold h5 mb-0" style={{ color: "#2c3e50" }}>{numDia}</span>
                          </div>
                          <div className="flex-grow-1 d-flex flex-column gap-2" style={{ overflowY: "auto", maxHeight: "350px" }}>
                            {comidasDelDia.map((comida, index) => (
                              <div key={index} className="p-1 rounded border-start border-3 flex-shrink-0"
                                style={{ backgroundColor: "#f8fafc", borderColor: "#1abc9c", fontSize: "0.7rem" }}>
                                <strong className="text-secondary d-block" style={{ fontSize: "0.62rem" }}>{comida.tiempo}</strong>
                                <span className="text-dark">{comida.detalle}</span>
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

            <div className="col-12 col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm p-4 bg-white rounded-3 h-100">
                <h4 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>Registrar</h4>
                <form onSubmit={handleRegistrar}>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-secondary mb-1">Tipo:</label>
                    <select className="form-select form-select-sm" value={tipoRegistro} onChange={(e) => setTipoRegistro(e.target.value)}>
                      <option value="producto">🥦 Producto</option>
                      <option value="receta">🍽️ Receta</option>
                      <option value="plan" disabled={!usuario.plan_activo}>📋 Plan {!usuario.plan_activo && "(sin plan)"}</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-secondary mb-1">Fecha:</label>
                    <input type="date" className="form-control form-control-sm" value={fechaComida} onChange={(e) => setFechaComida(e.target.value)} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-secondary mb-1">Tiempo de comida:</label>
                    <select className="form-select form-select-sm" value={tiempoComida} onChange={(e) => setTiempoComida(e.target.value)}>
                      <option value="desayuno">Desayuno</option>
                      <option value="merienda_manana">Merienda Mañana</option>
                      <option value="almuerzo">Almuerzo</option>
                      <option value="merienda_tarde">Merienda Tarde</option>
                      <option value="cena">Cena</option>
                    </select>
                  </div>

                  {tipoRegistro === 'producto' && (
                    <>
                      <div className="mb-2 position-relative">
                        <label className="form-label small fw-semibold text-secondary mb-1">Producto:</label>
                        <input
                          type="text" className="form-control form-control-sm"
                          value={filtroAlimento} placeholder="Buscar por nombre o código..."
                          onChange={(e) => { setFiltroAlimento(e.target.value); if (alimentoSeleccionado) setAlimentoSeleccionado(null); }}
                          autoComplete="off" required
                        />
                        {sugerenciasAlimentos.length > 0 && (
                          <ul className="list-group position-absolute w-100 shadow-sm mt-1" style={{ zIndex: 1000, maxHeight: "180px", overflowY: "auto" }}>
                            {sugerenciasAlimentos.map((alimento) => (
                              <button key={alimento.id_producto} type="button"
                                className="list-group-item list-group-item-action text-start small p-2"
                                onClick={() => { setAlimentoSeleccionado(alimento); setFiltroAlimento(alimento.descripcion); }}>
                                <div className="fw-bold">{alimento.descripcion}</div>
                              </button>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-semibold text-secondary mb-1">Porción (g):</label>
                        <input type="number" className="form-control form-control-sm" value={porcionComida} onChange={(e) => setPorcionComida(e.target.value)} required />
                      </div>
                    </>
                  )}

                  {tipoRegistro === 'receta' && (
                    <div className="mb-2">
                      <label className="form-label small fw-semibold text-secondary mb-1">Receta:</label>
                      <select className="form-select form-select-sm" value={recetaSeleccionada} onChange={(e) => setRecetaSeleccionada(e.target.value)} required>
                        <option value="">Seleccioná una receta</option>
                        {recetas.map(r => (
                          <option key={r.id_receta} value={r.id_receta}>{r.nombre}</option>
                        ))}
                      </select>
                      {recetas.length === 0 && (
                        <small className="text-muted">No tenés recetas. Creá una en "Recetas".</small>
                      )}
                    </div>
                  )}

                  {tipoRegistro === 'plan' && usuario.plan_activo && (
                    <div className="alert alert-info py-2 small mb-2">
                      Se registrarán los productos del plan <strong>{usuario.plan_activo.nombre}</strong> para el tiempo seleccionado.
                    </div>
                  )}

                  <button type="submit" className="btn w-100 fw-semibold text-white shadow-sm py-2" style={{ backgroundColor: "#1abc9c", border: "none" }}>
                    Añadir
                  </button>
                </form>
                <div className="mt-3 p-3 rounded-3 text-center" style={{ backgroundColor: "#e8f8f5" }}>
                  <span className="fw-bold h5 d-block mb-1" style={{ color: "#16a085" }}>{caloriasTotales} / {consumoMaximo} kcal</span>
                  <div className="progress mb-1" style={{ height: "6px" }}>
                    <div className="progress-bar" style={{ width: `${Math.min((caloriasTotales / consumoMaximo) * 100, 100)}%`, backgroundColor: "#1abc9c" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {vistaActiva !== 'dashboard' && (
          <div className="col-12">
            {vistaActiva === 'mi-plan' && <MiPlan />}
            {vistaActiva === 'medida' && <RegistroMedidas />}
            {vistaActiva === 'productos' && <Productos />}
            {vistaActiva === 'reporte' && <ReporteAvance />}
            {vistaActiva === 'recetas' && <GestionRecetas />}
            {vistaActiva === 'retroalimentacion' && <Retroalimentacion />}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientMain;