import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL;

const Aprobacion = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${API_URL}/api/producto`);
      if (response.ok) {
        const data = await response.json();
        setProductos(data.filter(p => p.estado === "pendiente"));
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarProductos(); }, []);

  const aprobarProducto = async (idProducto) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/producto/${idProducto}/aprobar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
        setMensaje("Producto aprobado correctamente.");
        cargarProductos();
        setTimeout(() => setMensaje(""), 3000);
      } else {
        setMensaje("Error al aprobar el producto.");
      }
    } catch (error) {
      console.error("Error al aprobar producto:", error);
      setMensaje("Error de conexión.");
    }
  };

  return (
    <div>
      <header className="header-title mb-4">
        <h1>Aprobación de Productos</h1>
        <p>Productos pendientes de aprobación enviados por usuarios.</p>
      </header>

      {mensaje && (
        <div className="alert alert-success alert-dismissible" role="alert">
          {mensaje}
        </div>
      )}

      {cargando ? (
        <p>Cargando productos...</p>
      ) : productos.length === 0 ? (
        <div className="card p-4 text-center">
          <p className="text-muted mb-0">No hay productos pendientes de aprobación.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered align-middle bg-white">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Descripción</th>
                <th>Energía</th>
                <th>Proteína</th>
                <th>Carbohidratos</th>
                <th>Grasa</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id_producto}>
                  <td>{p.id_producto}</td>
                  <td>{p.codigo}</td>
                  <td>{p.descripcion}</td>
                  <td>{p.energia} kcal</td>
                  <td>{p.proteina} g</td>
                  <td>{p.carbohidratos} g</td>
                  <td>{p.grasa} g</td>
                  <td><span className="badge bg-warning text-dark">Pendiente</span></td>
                  <td>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => aprobarProducto(p.id_producto)}
                    >
                      ✓ Aprobar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Aprobacion;