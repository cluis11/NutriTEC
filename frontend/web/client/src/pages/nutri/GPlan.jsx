import React, { useState, useEffect } from "react";
import '../../App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const TIEMPOS_COMIDA = ['desayuno', 'merienda_manana', 'almuerzo', 'merienda_tarde', 'cena'];

const ETIQUETAS_TIEMPO = {
  desayuno: 'Desayuno',
  merienda_manana: 'Merienda (Mañana)',
  almuerzo: 'Almuerzo',
  merienda_tarde: 'Merienda (Tarde)',
  cena: 'Cena'
};

const GestionPlan = () => {
  // Datos del plan que se está construyendo
  const [nombrePlan, setNombrePlan] = useState('');
  const [productosPlan, setProductosPlan] = useState([]); // { id_producto, descripcion, codigo, porciones, Cantidad }
  const [tiempoPlan, setTiempoPlan] = useState('desayuno');
  const [idPlanEditando, setIdPlanEditando] = useState(null); // null = creando, id = editando

  // Catálogo de productos
  const [productosCatalogo, setProductosCatalogo] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  // Selección local por producto (formulario de añadir porciones)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [porciones, setPorciones] = useState('1');

  // Estados de control generales
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: 'exito'|'error', texto: string }

  // Estados para gestión e inspección independiente de planes
  const [planesExistentes, setPlanesExistentes] = useState([]);
  const [cargandoPlanes, setCargandoPlanes] = useState(false);
  const [planDetalle, setPlanDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // Cargar catálogo de productos y planes existentes al iniciar
  useEffect(() => {
    cargarProductos();
    cargarPlanesExistentes();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargandoProductos(true);
      const res = await fetch(`${API_BASE_URL}/api/producto/aprobados`);
      if (!res.ok) throw new Error("No se pudo cargar el catálogo de productos.");
      const datos = await res.json();
      setProductosCatalogo(datos);
    } catch (err) {
      setErrorCarga(err.message);
    } finally {
      setCargandoProductos(false);
    }
  };

  const cargarPlanesExistentes = async () => {
    try {
      setCargandoPlanes(true);
      const idNutri = JSON.parse(localStorage.getItem('usuario'))?.id_usuario || 0;
      const res = await fetch(`${API_BASE_URL}/api/plan/nutricionista/${idNutri}`);
      if (!res.ok) throw new Error("No se pudieron cargar tus planes.");
      const datos = await res.json();
      setPlanesExistentes(datos);
    } catch (err) {
      console.error("Error cargando planes:", err);
    } finally {
      setCargandoPlanes(false);
    }
  };

  const handleActivarEdicion = () => {
    if (!planDetalle) return;

    setIdPlanEditando(planDetalle.id_plan);
    setNombrePlan(planDetalle.nombre);
    
    const productosMapeados = planDetalle.productos.map(p => {
        const baseProd = productosCatalogo.find(c => c.id_producto === p.id_producto);
        const gramosTotales = parseFloat(p.cantidad) || 0;
        const gramosBasePorcion = baseProd ? parseFloat(baseProd.porcion) : 1;
        
        // Calculamos cuántas porciones representan esos gramos totales 
        const porcionesCalculadas = gramosBasePorcion > 0 ? (gramosTotales / gramosBasePorcion) : 1;

        return {
            id_producto: p.id_producto,
            descripcion: p.descripcion || baseProd?.descripcion || `Producto #${p.id_producto}`,
            codigo: p.codigo || baseProd?.codigo || 'N/A',
            tiempo: p.tiempo,
            porciones: porcionesCalculadas, 
            Cantidad: gramosTotales, 
            
            // Calculamos el impacto nutricional real multiplicando los macros base por las porciones calculadas
            energia: (baseProd ? parseFloat(baseProd.energia) : 0) * porcionesCalculadas,
            proteina: (baseProd ? parseFloat(baseProd.proteina) : 0) * porcionesCalculadas,
            carbohidratos: (baseProd ? parseFloat(baseProd.carbohidratos) : 0) * porcionesCalculadas,
            grasa: (baseProd ? parseFloat(baseProd.grasa) : 0) * porcionesCalculadas
        };
    });

    setProductosPlan(productosMapeados);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelarEdicion = () => {
    setNombrePlan('');
    setProductosPlan([]);
    setIdPlanEditando(null);
    setMensaje(null);
  };

  const handleVerDetallePlan = async (idPlan) => {
    try {
      setCargandoDetalle(true);
      const res = await fetch(`${API_BASE_URL}/api/plan/${idPlan}`);
      if (!res.ok) throw new Error("No se pudo cargar el desglose de este plan.");
      const datos = await res.json();
      setPlanDetalle(datos);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setCargandoDetalle(false);
    }
  };

  const handleAgregarProducto = () => {
    if (!productoSeleccionado) return;

    const numPorciones = parseFloat(porciones) || 1;
    const gramosBase = parseFloat(productoSeleccionado.porcion) || 0;
    const cantidadGramosTotales = gramosBase * numPorciones;

    // Calculamos los macros proporcionales a las porciones digitadas
    const calculos = {
      energia: productoSeleccionado.energia * numPorciones,
      proteina: productoSeleccionado.proteina * numPorciones,
      carbohidratos: productoSeleccionado.carbohidratos * numPorciones,
      grasa: productoSeleccionado.grasa * numPorciones
    };

    const nuevo = {
      id_producto: productoSeleccionado.id_producto,
      descripcion: productoSeleccionado.descripcion,
      codigo: productoSeleccionado.codigo,
      porciones: numPorciones,
      Cantidad: cantidadGramosTotales, // Se guardan gramos totales directos
      tiempo: tiempoPlan,
      ...calculos
    };

    setProductosPlan([...productosPlan, nuevo]);
    setProductoSeleccionado(null);
    setPorciones('1');
    setMensaje(null);
  };

  const handleRemoverProducto = (index) => {
    const copia = [...productosPlan];
    copia.splice(index, 1);
    setProductosPlan(copia);
  };

  const calcularTotales = () => {
    return productosPlan.reduce(
      (acc, curr) => {
        acc.energia += curr.energia;
        acc.proteina += curr.proteina;
        acc.carbohidratos += curr.carbohidratos;
        acc.grasa += curr.grasa;
        return acc;
      },
      { energia: 0, proteina: 0, carbohidratos: 0, grasa: 0 }
    );
  };

  const totales = calcularTotales();

  const handleCrearPlan = async () => {
    if (!nombrePlan.trim()) {
      setMensaje({ tipo: "error", texto: "Por favor, asigne un nombre representativo al plan." });
      return;
    }
    if (productosPlan.length === 0) {
      setMensaje({ tipo: "error", texto: "El plan debe contener al menos un producto alimenticio." });
      return;
    }

    try {
      setGuardando(true);
      setMensaje(null);

      const esEdicion = idPlanEditando !== null;

      const cuerpoPayload = {
        id_plan: idPlanEditando || 0,
        id_nutricionista: JSON.parse(localStorage.getItem('usuario'))?.id_usuario || 0,
        nombre: nombrePlan.trim(),
        productos: productosPlan.map(p => ({
          id_producto: p.id_producto,
          tiempo: p.tiempo,
          Cantidad: p.Cantidad // Enviamos la cantidad general en gramos exacta 
        }))
      };

      const url = esEdicion ? `${API_BASE_URL}/api/plan/${idPlanEditando}` : `${API_BASE_URL}/api/plan`;
      const metodo = esEdicion ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpoPayload)
      });

      let respuestaDatos = {};
      const textoRespuesta = await res.text();
      if (textoRespuesta) {
        respuestaDatos = JSON.parse(textoRespuesta);
      }

      if (!res.ok) {
        throw new Error(respuestaDatos.mensaje || "Fallo en el servidor al intentar guardar el plan.");
      }

      setMensaje({ 
        tipo: "exito", 
        texto: esEdicion 
          ? `El plan "${nombrePlan}" fue actualizado exitosamente.` 
          : `El plan "${nombrePlan}" fue guardado exitosamente.` 
      });

      setNombrePlan('');
      setProductosPlan([]);
      setTiempoPlan('desayuno');
      setIdPlanEditando(null);
      setPlanDetalle(null);
      
      await cargarPlanesExistentes();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarPlan = async (idPlan, nombre) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar permanentemente el plan "${nombre}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/plan/${idPlan}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo completar la eliminación en el servidor.");

      setMensaje({ tipo: "exito", texto: `El plan "${nombre}" fue eliminado correctamente.` });
      
      if (planDetalle?.id_plan === idPlan) {
        setPlanDetalle(null);
      }
      
      await cargarPlanesExistentes();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    }
  };

  const productosFiltrados = productosCatalogo.filter(p =>
    p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f4f6f9", minHeight: "100vh" }}>
      
      {mensaje && (
        <div className={`alert text-center shadow-sm mx-auto mb-4 ${mensaje.tipo === 'exito' ? 'alert-success' : 'alert-danger'}`} style={{ maxWidth: "800px", borderRadius: "10px" }}>
          {mensaje.texto}
        </div>
      )}

      <div className="row g-4">
        
        {/* COLUMNA IZQUIERDA: BORRADOR */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "15px", backgroundColor: "#ffffff" }}>
            <h4 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>Nuevo Plan de Alimentación</h4>
            
            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">Nombre descriptivo del Plan</label>
              <input
                type="text"
                className="form-control bg-light border-0 py-2.5 px-3"
                style={{ borderRadius: "8px" }}
                placeholder="Ej: Plan Hipertrofia Estricto"
                value={nombrePlan}
                onChange={(e) => setNombrePlan(e.target.value)}
              />
            </div>

            <div className="table-responsive flex-grow-1" style={{ minHeight: "200px" }}>
              <table className="table table-hover align-middle">
                <thead>
                  <tr className="table-light small text-secondary">
                    <th>Alimento</th>
                    <th>Tiempo</th>
                    <th className="text-center">Porciones</th>
                    <th className="text-end">Gramos/ml</th>
                    <th className="text-end">Calorías</th>
                    <th className="text-center">Acción</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "0.85rem" }}>
                  {productosPlan.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No has añadido productos a este borrador. Selecciona del catálogo a la derecha.
                      </td>
                    </tr>
                  ) : (
                    productosPlan.map((p, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="fw-semibold text-dark">{p.descripcion}</div>
                          <small className="text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>{p.codigo}</small>
                        </td>
                        <td className="text-capitalize">
                          <span className="badge bg-light text-dark border">{ETIQUETAS_TIEMPO[p.tiempo]}</span>
                        </td>
                        {/* Mostramos las porciones calculadas de forma limpia (.toFixed(1) por si es decimal como 1.5) */}
                        <td className="text-center fw-medium">
                          {Number(p.porciones) % 1 === 0 ? Number(p.porciones).toFixed(0) : Number(p.porciones).toFixed(1)}
                        </td>
                        {/* Mostramos el peso total en gramos almacenado en Cantidad */}
                        <td className="text-end">{p.Cantidad.toFixed(0)}g</td>
                        <td className="text-end fw-semibold text-primary">{p.energia.toFixed(0)} kcal</td>
                        <td className="text-center">
                          <button className="btn btn-sm text-danger p-1" onClick={() => handleRemoverProducto(idx)}>
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="card border-0 bg-light p-3 mb-3 mt-3" style={{ borderRadius: "10px" }}>
              <div className="row text-center g-2">
                <div className="col-6 col-sm-3">
                  <div className="p-2 rounded-3 bg-white shadow-xs">
                    <div className="fw-bold text-primary" style={{ fontSize: "1.1rem" }}>{totales.energia.toFixed(0)}</div>
                    <div className="text-muted" style={{ fontSize: "0.7rem" }}>Energía Total (kcal)</div>
                  </div>
                </div>
                <div className="col-sm-3 col-6">
                  <div className="p-2 rounded-3 bg-white shadow-xs">
                    <div className="fw-bold text-success">{totales.proteina.toFixed(1)}g</div>
                    <div className="text-muted" style={{ fontSize: "0.7rem" }}>Proteína</div>
                  </div>
                </div>
                <div className="col-sm-3 col-6">
                  <div className="p-2 rounded-3 bg-white shadow-xs">
                    <div className="fw-bold text-warning">{totales.carbohidratos.toFixed(1)}g</div>
                    <div className="text-muted" style={{ fontSize: "0.7rem" }}>Carbohidratos</div>
                  </div>
                </div>
                <div className="col-sm-3 col-6">
                  <div className="p-2 rounded-3 bg-white shadow-xs">
                    <div className="fw-bold text-danger">{totales.grasa.toFixed(1)}g</div>
                    <div className="text-muted" style={{ fontSize: "0.7rem" }}>Grasa</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button
                className="btn flex-grow-1 text-white shadow-sm py-2.5 fw-bold"
                style={{ backgroundColor: idPlanEditando ? "#f39c12" : "#1abc9c", border: "none", borderRadius: "8px" }}
                onClick={handleCrearPlan}
                disabled={guardando}
              >
                {guardando ? "Procesando..." : idPlanEditando ? "GUARDAR CAMBIOS ACTUALIZADOS" : "GUARDAR PLAN INTEGRAL"}
              </button>
              
              {idPlanEditando && (
                <button type="button" className="btn btn-outline-secondary px-3" onClick={handleCancelarEdicion}>
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: CATÁLOGO Y LISTADOS */}
        <div className="col-12 col-lg-5 d-flex flex-column gap-4">
          
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "15px", backgroundColor: "#ffffff" }}>
            <h5 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>Catálogo de Alimentos</h5>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary mb-1">Destinar al tiempo de comida:</label>
              <select 
                className="form-select bg-light border-0 small py-2" 
                style={{ borderRadius: "8px" }}
                value={tiempoPlan}
                onChange={(e) => setTiempoPlan(e.target.value)}
              >
                {TIEMPOS_COMIDA.map(t => (
                  <option key={t} value={t}>{ETIQUETAS_TIEMPO[t]}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-sm bg-light border-0 py-2"
                style={{ borderRadius: "8px" }}
                placeholder="Buscar alimento por nombre o código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {productoSeleccionado && (
              <div className="p-3 border rounded-3 mb-3 shadow-xs" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
                <div className="small fw-bold text-dark text-truncate mb-2">Ajustar: {productoSeleccionado.descripcion}</div>
                <div className="row g-2 align-items-center">
                  <div className="col-6">
                    <div className="input-group input-group-sm">
                      <input 
                        type="number" 
                        className="form-control" 
                        min="0.1" 
                        step="0.1" 
                        value={porciones} 
                        onChange={(e) => setPorciones(e.target.value)} 
                      />
                      <span className="input-group-text">Porc.</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <button className="btn btn-sm text-white w-100 fw-semibold" style={{ backgroundColor: "#2c3e50" }} onClick={handleAgregarProducto}>
                      Añadir
                    </button>
                  </div>
                </div>
              </div>
            )}

            {cargandoProductos ? (
              <div className="text-center text-muted small py-3">Cargando catálogo...</div>
            ) : errorCarga ? (
              <div className="text-center text-danger small py-3">{errorCarga}</div>
            ) : (
              <div className="list-group" style={{ maxHeight: "180px", overflowY: "auto" }}>
                {productosFiltrados.map(p => (
                  <button
                    key={p.id_producto}
                    type="button"
                    className={`list-group-item list-group-item-action border-0 mb-1 rounded-2 text-start p-2 d-flex justify-content-between align-items-center ${productoSeleccionado?.id_producto === p.id_producto ? 'bg-secondary text-white' : 'bg-light'}`}
                    onClick={() => {
                      setProductoSeleccionado(p);
                      setPorciones('1');
                    }}
                  >
                    <div className="text-truncate" style={{ maxWidth: "75%" }}>
                      <span className="fw-semibold d-block small">{p.descripcion}</span>
                      <span className="extra-small opacity-75" style={{ fontSize: "0.75rem" }}>Base: {p.porcion}g | {p.energia} kcal</span>
                    </div>
                    <span className="badge bg-white text-dark border text-uppercase" style={{ fontSize: "0.65rem" }}>{p.codigo}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "15px", backgroundColor: "#ffffff" }}>
            <h5 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>Mis Planes Diseñados</h5>
            <p className="text-muted extra-small mb-3" style={{ fontSize: "0.75rem" }}>Toca un plan de la lista para desglosarlo y gestionarlo abajo.</p>
            
            {cargandoPlanes ? (
              <div className="text-center py-3 text-muted small">Cargando planes...</div>
            ) : planesExistentes.length === 0 ? (
              <div className="text-center py-3 text-muted small border border-dashed rounded-3 bg-light">No tienes planes creados.</div>
            ) : (
              <div className="list-group" style={{ maxHeight: "140px", overflowY: "auto" }}>
                {planesExistentes.map((plan) => (
                  <div 
                    key={plan.id_plan} 
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center border-0 mb-2 rounded-3 py-2 px-3 ${planDetalle?.id_plan === plan.id_plan ? 'bg-primary-subtle border-start border-primary border-3' : 'bg-light'}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleVerDetallePlan(plan.id_plan)}
                  >
                    <span className="fw-semibold text-dark small">{plan.nombre}</span>
                    <button 
                      className="btn btn-sm text-danger p-0 fw-bold" 
                      style={{ fontSize: "0.9rem" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEliminarPlan(plan.id_plan, plan.nombre);
                      }}
                    >
                     Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* INSPECTOR INFERIOR */}
      {planDetalle && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "15px", backgroundColor: "#ffffff", borderLeft: "5px solid #3498db" }}>
              
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                <div>
                  <span className="badge bg-primary mb-1">Visualizador de Planes</span>
                  <h4 className="fw-bold text-dark m-0">{planDetalle.nombre}</h4>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-warning text-dark fw-semibold px-3" onClick={handleActivarEdicion}>
                    Configurar / Editar Plan
                  </button>
                  <button className="btn-close" onClick={() => setPlanDetalle(null)}></button>
                </div>
              </div>

              {cargandoDetalle ? (
                <div className="text-center py-4 text-muted">Consultando especificaciones del plan...</div>
              ) : (
                <div className="row row-cols-1 row-cols-md-5 g-3">
                  {TIEMPOS_COMIDA.map(tiempo => {
                    const alimentosDelTiempo = planDetalle.productos?.filter(p => p.tiempo === tiempo) || [];
                    
                    return (
                      <div className="col" key={tiempo}>
                        <div className="h-100 p-3 rounded-3" style={{ backgroundColor: alimentosDelTiempo.length > 0 ? "#f8fafc" : "#fafafa", border: "1px solid #e2e8f0" }}>
                          <h6 className="fw-bold text-capitalize border-bottom pb-1 mb-2" style={{ color: alimentosDelTiempo.length > 0 ? "#2c3e50" : "#95a5a6", fontSize: "0.9rem" }}>
                            {ETIQUETAS_TIEMPO[tiempo]}
                          </h6>
                          
                          {alimentosDelTiempo.length === 0 ? (
                            <span className="text-muted d-block font-italic" style={{ fontSize: "0.75rem" }}>Sin alimentos asignados</span>
                          ) : (
                            <ul className="list-unstyled mb-0" style={{ fontSize: "0.8rem" }}>
                              {alimentosDelTiempo.map((prod, idx) => {
                                const gramosTotales = parseFloat(prod.cantidad) || 0;

                                return (
                                  <li key={idx} className="mb-2 pb-1 border-bottom border-light">
                                    <div className="fw-semibold text-dark">{prod.descripcion || `Producto #${prod.id_producto}`}</div>
                                    <div className="text-muted small">
                                      {gramosTotales.toFixed(0)} g/ml
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPlan;