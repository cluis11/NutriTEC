import React, { useState, useEffect } from "react";

const ReporteMedidas = () => {
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario")) || {};
  const idUsuario = usuarioLogueado.id_usuario || 4;

  const [medidas, setMedidas] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const cargarHistorial = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/medida/usuario/${idUsuario}`);
      if (response.ok) {
        const data = await response.json();
        setMedidas(data);
      }
    } catch (error) {
      console.error("Error al cargar historial para el reporte:", error);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  const medidasFiltradas = medidas.filter((m) => {
    if (!m.fecha) return false;
    const fechaMedida = m.fecha.split("T")[0];
    if (fechaInicio && fechaMedida < fechaInicio) return false;
    if (fechaFin && fechaMedida > fechaFin) return false;
    return true;
  });

  const handleImprimir = () => window.print();

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const [year, month, day] = fechaStr.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="container-fluid p-3" style={{ fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #area-imprimible-reporte, #area-imprimible-reporte * { visibility: visible; }
          #area-imprimible-reporte { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; }
        }
      `}</style>

      <div className="card border-0 shadow-sm p-4 bg-white rounded-3 mb-4 d-print-none">
        <h5 className="fw-bold mb-3" style={{ color: "#0f172a" }}>Rango del Reporte</h5>
        <div className="row g-3 align-items-end small">
          <div className="col-12 col-sm-4">
            <label className="form-label fw-semibold text-secondary mb-1">Fecha de Inicio</label>
            <input type="date" className="form-control bg-light border-0 py-2 px-3"
              style={{ borderRadius: "8px" }} value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
          <div className="col-12 col-sm-4">
            <label className="form-label fw-semibold text-secondary mb-1">Fecha Final</label>
            <input type="date" className="form-control bg-light border-0 py-2 px-3"
              style={{ borderRadius: "8px" }} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </div>
          <div className="col-12 col-sm-4">
            <button onClick={handleImprimir} className="btn text-white w-100 py-2 fw-medium shadow-sm"
              style={{ backgroundColor: "#2ecc71", borderRadius: "8px", border: "none" }}
              disabled={medidasFiltradas.length === 0}>
              🖨️ Descargar Reporte
            </button>
          </div>
        </div>
      </div>

      <div id="area-imprimible-reporte" className="card border-0 shadow-sm p-4 bg-white rounded-3">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-light">
          <h4 className="fw-bold mb-1" style={{ color: "#0f172a" }}>NutriTEC - Reporte de Avance</h4>
          <div className="text-end small font-monospace text-secondary">
            {fechaInicio || fechaFin
              ? <span>Periodo: {fechaInicio || "Inicio"} al {fechaFin || "Actualidad"}</span>
              : <span>Historial Completo</span>}
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-sm small align-middle mb-0">
            <thead>
              <tr className="text-secondary border-bottom font-monospace" style={{ fontSize: "0.75rem" }}>
                <th className="py-2 fw-semibold">Fecha</th>
                <th className="py-2 fw-semibold text-center">Cintura</th>
                <th className="py-2 fw-semibold text-center">Cuello</th>
                <th className="py-2 fw-semibold text-center">Caderas</th>
                <th className="py-2 fw-semibold text-center">% Músculo</th>
                <th className="py-2 fw-semibold text-center">% Grasa</th>
              </tr>
            </thead>
            <tbody className="text-dark" style={{ opacity: 0.9 }}>
              {medidasFiltradas.length === 0 ? (
                <tr><td colSpan="6" className="text-muted text-center py-5 font-monospace">No se registran medidas en el periodo seleccionado.</td></tr>
              ) : (
                medidasFiltradas.map((m, index) => (
                  <tr key={index} className="border-bottom" style={{ borderColor: "#f1f5f9" }}>
                    <td className="py-2 fw-medium font-monospace" style={{ color: "#0f172a" }}>{formatearFecha(m.fecha)}</td>
                    <td className="py-2 text-center font-monospace text-secondary">{m.cintura} cm</td>
                    <td className="py-2 text-center font-monospace text-secondary">{m.cuello} cm</td>
                    <td className="py-2 text-center font-monospace text-secondary">{m.caderas} cm</td>
                    <td className="py-2 text-center font-monospace fw-semibold text-success">{m.p_musculo}%</td>
                    <td className="py-2 text-center font-monospace fw-semibold text-danger">{m.p_grasa}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReporteMedidas;