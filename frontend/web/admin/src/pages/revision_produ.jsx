import React from 'react';

const Aprobacion = () => {
  return (
    <div className="card-custom p-4 border-0 shadow-sm bg-white text-dark">
      <h3 className="mb-3 fw-bold" style={{ color: "#1e293b" }}>Aprobación de Productos</h3>
      <p className="text-muted small mb-4">Verificación manual de productos añadidos por clientes o nutricionistas.</p>
      
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Código de Barras</th>
              <th>Descripción</th>
              <th>Porción (g/ml)</th>
              <th>Calorías (Kcal)</th>
              <th>Grasa (g)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>7441001122</code></td>
              <td>Pinto Casero con Especias</td>
              <td>200 g</td>
              <td>280 Kcal</td>
              <td>4 g</td>
              <td>
                <button className="btn btn-success btn-sm me-2 px-3 shadow-sm">Aprobar</button>
                <button className="btn btn-outline-danger btn-sm px-3">Rechazar</button>
              </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Aprobacion;