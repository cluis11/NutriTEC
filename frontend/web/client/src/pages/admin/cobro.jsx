import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

const Cobros = () => {
  const [reporte, setReporte] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarReporte = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${API_URL}/api/admin/reporte-cobro`);
      if (!response.ok) throw new Error("Error al obtener el reporte");
      const data = await response.json();
      setReporte(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarReporte(); }, []);

  const handleExportarPDF = () => window.print();

  const badgeColor = (tipo) => {
    if (tipo === 'semanal') return 'bg-primary';
    if (tipo === 'mensual') return 'bg-success';
    if (tipo === 'anual') return 'bg-warning text-dark';
    return 'bg-secondary';
  };

  return (
    <div>
      <header className="header-title mb-4">
        <h1>Reporte de Cobro</h1>
        <p>Cargos agrupados por tipo de pago con sus respectivos descuentos aplicados.</p>
      </header>

      <div className="bg-white rounded-3 shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ color: "#1e293b" }}>Nutricionistas activos</h5>
          <button className="btn btn-danger btn-sm px-3" onClick={handleExportarPDF}>
            🖨️ Exportar PDF
          </button>
        </div>

        {cargando ? (
          <p>Cargando reporte...</p>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : reporte.length === 0 ? (
          <p className="text-muted">No hay datos de cobro disponibles.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Tipo Pago</th>
                  <th>Nutricionista</th>
                  <th>Correo</th>
                  <th>Tarjeta</th>
                  <th>Pacientes</th>
                  <th>Monto Base</th>
                  <th>Descuento</th>
                  <th>Monto Final</th>
                </tr>
              </thead>
              <tbody>
                {reporte.map((r, index) => (
                  <tr key={index}>
                    <td>
                      <span className={`badge px-3 ${badgeColor(r.tipo_cobro)}`}>
                        {r.tipo_cobro?.charAt(0).toUpperCase() + r.tipo_cobro?.slice(1)}
                      </span>
                    </td>
                    <td>{r.nombre}</td>
                    <td>{r.correo}</td>
                    <td>**** {r.tarjeta?.slice(-4)}</td>
                    <td className="text-center">{r.cantidad_pacientes}</td>
                    <td>${r.monto_base?.toFixed(2)}</td>
                    <td className="text-danger">-${r.descuento?.toFixed(2)}</td>
                    <td className="fw-bold text-success">${r.monto_final?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <td colSpan="7" className="text-end fw-bold">Total a cobrar:</td>
                  <td className="fw-bold text-success">
                    ${reporte.reduce((sum, r) => sum + (r.monto_final || 0), 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cobros;