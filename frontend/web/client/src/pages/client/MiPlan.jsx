import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL;

const MiPlan = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
  const idCliente = usuario.id_usuario;

  const [plan, setPlan] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarPlan = async () => {
      try {
        setCargando(true);
        const response = await fetch(`${API_URL}/api/cliente/${idCliente}/plan-activo`);
        if (response.status === 404) {
          setPlan(null);
          return;
        }
        if (!response.ok) throw new Error("Error al cargar el plan");
        const data = await response.json();
        setPlan(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargarPlan();
  }, [idCliente]);

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const [year, month, day] = fechaStr.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const tiemposComida = ['desayuno', 'merienda_manana', 'almuerzo', 'merienda_tarde', 'cena'];
  const labelsTiempos = {
    desayuno: "🌅 Desayuno",
    merienda_manana: "☕ Merienda Mañana",
    almuerzo: "🍽️ Almuerzo",
    merienda_tarde: "🍵 Merienda Tarde",
    cena: "🌙 Cena"
  };

  if (cargando) {
    return <div className="container-fluid p-3"><p>Cargando plan...</p></div>;
  }

  if (error) {
    return <div className="container-fluid p-3"><div className="alert alert-danger">{error}</div></div>;
  }

  if (!plan) {
    return (
      <div className="container-fluid p-3">
        <div className="card border-0 shadow-sm p-5 bg-white rounded-3 text-center">
          <h4 className="fw-bold mb-3" style={{ color: "#0f172a" }}>No tenés un plan activo</h4>
          <p className="text-muted mb-0">Comunicate con tu nutricionista para que te asigne un plan de alimentación.</p>
        </div>
      </div>
    );
  }

  const productosAgrupados = tiemposComida.reduce((acc, t) => {
    acc[t] = plan.productos?.filter(p => p.tiempo?.toLowerCase().trim() === t) || [];
    return acc;
  }, {});

  const totalCalorias = plan.productos?.reduce((sum, p) => sum + (p.energia * p.cantidad), 0) || 0;

  return (
    <div className="container-fluid p-3" style={{ fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <div className="card border-0 shadow-sm p-4 bg-white rounded-3 mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: "#0f172a" }}>📋 {plan.nombre}</h3>
            <p className="text-muted mb-0 small">
              Vigencia: {formatearFecha(plan.inicio)} al {formatearFecha(plan.fin)}
            </p>
          </div>
          <div className="text-end">
            <div className="badge p-2 px-3" style={{ backgroundColor: "#e8f8f5", color: "#16a085", fontSize: "0.95rem" }}>
              {totalCalorias.toFixed(0)} kcal totales
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {tiemposComida.map(tiempo => {
          const productos = productosAgrupados[tiempo];
          const caloriasTiempo = productos.reduce((sum, p) => sum + (p.energia * p.cantidad), 0);

          return (
            <div key={tiempo} className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100 bg-white rounded-3">
                <div className="card-header bg-white border-bottom py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0" style={{ color: "#0f172a" }}>{labelsTiempos[tiempo]}</h6>
                    <small className="text-muted">{caloriasTiempo.toFixed(0)} kcal</small>
                  </div>
                </div>
                <div className="card-body">
                  {productos.length === 0 ? (
                    <p className="text-muted small mb-0 text-center py-3">Sin alimentos asignados</p>
                  ) : (
                    <ul className="list-unstyled mb-0">
                      {productos.map((p, idx) => (
                        <li key={idx} className="py-2 border-bottom" style={{ borderColor: "#f1f5f9" }}>
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <div className="fw-semibold small" style={{ color: "#0f172a" }}>{p.descripcion}</div>
                              <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                Cant: {p.cantidad} · {(p.energia * p.cantidad).toFixed(0)} kcal
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiPlan;