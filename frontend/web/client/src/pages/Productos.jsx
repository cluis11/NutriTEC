import { useEffect, useState } from "react";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [idBusqueda, setIdBusqueda] = useState("");
  const [productoEncontrado, setProductoEncontrado] = useState(null);
  const [mensajeBusqueda, setMensajeBusqueda] = useState("");

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      setError("");
      setCargando(true);

      const response = await fetch("http://localhost:5108/api/producto");

      if (!response.ok) {
        throw new Error("Error al obtener productos");
      }

      const data = await response.json();
      setProductos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const buscarProductoPorId = async (e) => {
    e.preventDefault();

    if (!idBusqueda.trim()) {
      setMensajeBusqueda("Debe ingresar un ID.");
      setProductoEncontrado(null);
      return;
    }

    try {
      setMensajeBusqueda("");
      setProductoEncontrado(null);

      const response = await fetch(
        `http://localhost:5108/api/producto/${idBusqueda}`
      );

      if (response.status === 404) {
        setMensajeBusqueda("Producto no encontrado.");
        return;
      }

      if (!response.ok) {
        throw new Error("Error al buscar producto.");
      }

      const data = await response.json();
      setProductoEncontrado(data);
    } catch (err) {
      setMensajeBusqueda(err.message);
    }
  };

  if (cargando) {
    return <p>Cargando productos...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h1>Productos</h1>

      <form onSubmit={buscarProductoPorId} style={{ marginBottom: "20px" }}>
        <label>Buscar producto por ID: </label>

        <input
          type="number"
          value={idBusqueda}
          onChange={(e) => setIdBusqueda(e.target.value)}
          placeholder="Ej: 1"
          min="1"
          style={{ marginLeft: "8px", marginRight: "8px" }}
        />

        <button type="submit">Buscar</button>

        <button
          type="button"
          onClick={() => {
            setIdBusqueda("");
            setProductoEncontrado(null);
            setMensajeBusqueda("");
          }}
          style={{ marginLeft: "8px" }}
        >
          Limpiar
        </button>
      </form>

      {mensajeBusqueda && <p>{mensajeBusqueda}</p>}

      {productoEncontrado && (
        <div style={{ marginBottom: "20px" }}>
          <h2>Producto encontrado</h2>

          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Descripción</th>
                <th>Tamaño</th>
                <th>Porción</th>
                <th>Energía</th>
                <th>Proteína</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>{productoEncontrado.id_producto}</td>
                <td>{productoEncontrado.codigo}</td>
                <td>{productoEncontrado.descripcion}</td>
                <td>{productoEncontrado.tamano}</td>
                <td>{productoEncontrado.porcion}</td>
                <td>{productoEncontrado.energia}</td>
                <td>{productoEncontrado.proteina}</td>
                <td>{productoEncontrado.estado}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <h2>Lista de productos</h2>

      {productos.length === 0 ? (
        <p>No hay productos registrados.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Descripción</th>
              <th>Tamaño</th>
              <th>Porción</th>
              <th>Energía</th>
              <th>Proteína</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id_producto}>
                <td>{producto.id_producto}</td>
                <td>{producto.codigo}</td>
                <td>{producto.descripcion}</td>
                <td>{producto.tamano}</td>
                <td>{producto.porcion}</td>
                <td>{producto.energia}</td>
                <td>{producto.proteina}</td>
                <td>{producto.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Productos;