import React from 'react';

const Cobros = () => {
  return (
    <div className="card-custom p-4 border-0 shadow-sm bg-white text-dark">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0 fw-bold" style={{ color: "#1e293b" }}>Reporte de Cobro</h3>
        <button className="btn btn-danger btn-sm px-3 shadow-sm">Exportar PDF</button>
      </div>
      <p className="text-muted small mb-4">Cargos agrupados por tipo de pago (Semanal, Mensual, Anual) con sus respectivos descuentos aplicados.</p>
      
      <div className="table-responsive">
        <table className="table table-bordered align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Tipo Pago</th>
              <th>Nutricionista</th>
              <th>Correo Electrónico</th>
              <th>Monto Base</th>
              <th>Descuento</th>
              <th>Monto Final</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="badge bg-success px-3">Mensual</span></td>
              <td>Dr. Luis Acuña</td>
              <td>luis@nutritec.com</td>
              <td>$16.00</td>
              <td>5%</td>
              <td className="fw-bold text-success">$15.20</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Cobros;