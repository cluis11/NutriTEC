import React, { useEffect, useState } from "react";

const Aprobacion = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      setError("");

      const response = await fetch("http://localhost:5108/api/producto");

      if (!response.ok) {
        throw new Error("Error al cargar productos.");
      }

      const data = await response.json();

      // Solo muestra los pendientes
      const pendientes = data.filter(
        (producto) => producto.estado?.toLowerCase() === "pendiente"
      );

      setProductos(pendientes);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const aprobarProducto = async (idProducto) => {
    try {
      const response = await fetch(
        `http://localhost:5108/api/producto/${idProducto}/aprobar`,
        {
          method: "PUT"
        }
      );

      if (!response.ok) {
        throw new Error("Error al aprobar producto.");
      }

      alert("Producto aprobado correctamente.");
      cargarProductos();
    } catch (err) {
      alert(err.message);
    }
  };

  if (cargando) {
    return <p>Cargando productos pendientes...</p>;
  }

  if (error) {
    return <p className="text-danger">Error: {error}</p>;
  }

  return (
    <div className="card-custom p-4 border-0 shadow-sm bg-white text-dark">
      <h3 className="mb-3 fw-bold" style={{ color: "#1e293b" }}>
        Aprobación de Productos
      </h3>

      <p className="text-muted small mb-4">
        Verificación manual de productos añadidos por clientes o nutricionistas.
      </p>

      {productos.length === 0 ? (
        <div className="alert alert-info">
          No hay productos pendientes de aprobación.
        </div>
      ) : (
        <div
          className="table-responsive"
          style={{
            maxHeight: "500px",
            overflowY: "auto"
          }}
        >
          <table className="table table-striped table-hover align-middle mb-0">
            <thead
              className="table-light"
              style={{
                position: "sticky",
                top: 0,
                zIndex: 1
              }}
            >
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Descripción</th>
                <th>Porción</th>
                <th>Energía</th>
                <th>Grasa</th>
                <th>Proteína</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id_producto}>
                  <td>{producto.id_producto}</td>
                  <td>
                    <code>{producto.codigo}</code>
                  </td>
                  <td>{producto.descripcion}</td>
                  <td>{producto.porcion}</td>
                  <td>{producto.energia}</td>
                  <td>{producto.grasa}</td>
                  <td>{producto.proteina}</td>
                  <td>
                    <span className="badge bg-warning text-dark">
                      {producto.estado}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-success btn-sm me-2 px-3 shadow-sm"
                      onClick={() => aprobarProducto(producto.id_producto)}
                    >
                      Aprobar
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