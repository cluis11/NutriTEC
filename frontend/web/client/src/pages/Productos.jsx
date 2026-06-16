import { useEffect, useState } from "react";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [idBusqueda, setIdBusqueda] = useState("");
  const [productoEncontrado, setProductoEncontrado] = useState(null);
  const [mensajeBusqueda, setMensajeBusqueda] = useState("");

  const [nuevoProducto, setNuevoProducto] = useState({
    id_usuario: 1,
    codigo: "",
    descripcion: "",
    tamano: "",
    porcion: "",
    energia: "",
    grasa: "",
    sodio: "",
    carbohidratos: "",
    proteina: "",
    calcio: "",
    hierro: ""
  });

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

      const response = await fetch(`http://localhost:5108/api/producto/${idBusqueda}`);

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

  const manejarCambioNuevoProducto = (e) => {
    const { name, value } = e.target;

    setNuevoProducto({
      ...nuevoProducto,
      [name]: value
    });
  };

  const crearProducto = async (e) => {
    e.preventDefault();

    try {
      const productoParaEnviar = {
        ...nuevoProducto,
        id_usuario: Number(nuevoProducto.id_usuario),
        tamano: Number(nuevoProducto.tamano),
        porcion: Number(nuevoProducto.porcion),
        energia: Number(nuevoProducto.energia),
        grasa: Number(nuevoProducto.grasa),
        sodio: Number(nuevoProducto.sodio),
        carbohidratos: Number(nuevoProducto.carbohidratos),
        proteina: Number(nuevoProducto.proteina),
        calcio: Number(nuevoProducto.calcio),
        hierro: Number(nuevoProducto.hierro)
      };

      const response = await fetch("http://localhost:5108/api/producto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productoParaEnviar)
      });

      if (!response.ok) {
        throw new Error("Error al crear producto.");
      }

      alert("Producto creado correctamente.");

      setNuevoProducto({
        id_usuario: 1,
        codigo: "",
        descripcion: "",
        tamano: "",
        porcion: "",
        energia: "",
        grasa: "",
        sodio: "",
        carbohidratos: "",
        proteina: "",
        calcio: "",
        hierro: ""
      });

      obtenerProductos();
    } catch (err) {
      alert(err.message);
    }
  };

  if (cargando) {
    return <p>Cargando productos...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="container-fluid py-4">
      <h1 className="mb-4">Gestión de Productos</h1>

      <div className="row g-4">
        {/* Menú / lista de productos */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm border-0 p-4">
            <h2 className="h4 mb-3">Productos registrados</h2>

            <form onSubmit={buscarProductoPorId} className="mb-4">
              <label className="form-label">Buscar producto por ID</label>

              <div className="d-flex gap-2">
                <input
                  type="number"
                  className="form-control"
                  value={idBusqueda}
                  onChange={(e) => setIdBusqueda(e.target.value)}
                  placeholder="Ej: 1"
                  min="1"
                />

                <button type="submit" className="btn btn-primary">
                  Buscar
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setIdBusqueda("");
                    setProductoEncontrado(null);
                    setMensajeBusqueda("");
                  }}
                >
                  Limpiar
                </button>
              </div>
            </form>

            {mensajeBusqueda && <p>{mensajeBusqueda}</p>}

            {productoEncontrado && (
              <div className="alert alert-success">
                <strong>Producto encontrado:</strong>{" "}
                {productoEncontrado.descripcion} ({productoEncontrado.codigo})
              </div>
            )}

            {productos.length === 0 ? (
              <p>No hay productos registrados.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Código</th>
                      <th>Descripción</th>
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
                        <td>{producto.energia}</td>
                        <td>{producto.proteina}</td>
                        <td>{producto.estado}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Formulario de creación */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0 p-4">
            <h2 className="h4 mb-3">Agregar nuevo producto</h2>

            <form onSubmit={crearProducto}>
              <h3 className="h6 text-secondary mt-3">Información general</h3>

              <div className="mb-3">
                <label className="form-label">Código del producto</label>
                <input
                  className="form-control"
                  name="codigo"
                  placeholder="Ej: PROT-001"
                  value={nuevoProducto.codigo}
                  onChange={manejarCambioNuevoProducto}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <input
                  className="form-control"
                  name="descripcion"
                  placeholder="Ej: Barra de proteína sabor chocolate"
                  value={nuevoProducto.descripcion}
                  onChange={manejarCambioNuevoProducto}
                  required
                />
              </div>

              <div className="row">
                <div className="col-6 mb-3">
                  <label className="form-label">Tamaño</label>
                  <input
                    type="number"
                    className="form-control"
                    name="tamano"
                    value={nuevoProducto.tamano}
                    onChange={manejarCambioNuevoProducto}
                    required
                  />
                </div>

                <div className="col-6 mb-3">
                  <label className="form-label">Porción</label>
                  <input
                    type="number"
                    className="form-control"
                    name="porcion"
                    value={nuevoProducto.porcion}
                    onChange={manejarCambioNuevoProducto}
                    required
                  />
                </div>
              </div>

              <h3 className="h6 text-secondary mt-3">Información nutricional</h3>

              <div className="row">
                <div className="col-6 mb-3">
                  <label className="form-label">Energía</label>
                  <input
                    type="number"
                    className="form-control"
                    name="energia"
                    value={nuevoProducto.energia}
                    onChange={manejarCambioNuevoProducto}
                    required
                  />
                </div>

                <div className="col-6 mb-3">
                  <label className="form-label">Grasa</label>
                  <input
                    type="number"
                    className="form-control"
                    name="grasa"
                    value={nuevoProducto.grasa}
                    onChange={manejarCambioNuevoProducto}
                    required
                  />
                </div>

                <div className="col-6 mb-3">
                  <label className="form-label">Sodio</label>
                  <input
                    type="number"
                    className="form-control"
                    name="sodio"
                    value={nuevoProducto.sodio}
                    onChange={manejarCambioNuevoProducto}
                    required
                  />
                </div>

                <div className="col-6 mb-3">
                  <label className="form-label">Carbohidratos</label>
                  <input
                    type="number"
                    className="form-control"
                    name="carbohidratos"
                    value={nuevoProducto.carbohidratos}
                    onChange={manejarCambioNuevoProducto}
                    required
                  />
                </div>

                <div className="col-6 mb-3">
                  <label className="form-label">Proteína</label>
                  <input
                    type="number"
                    className="form-control"
                    name="proteina"
                    value={nuevoProducto.proteina}
                    onChange={manejarCambioNuevoProducto}
                    required
                  />
                </div>

                <div className="col-6 mb-3">
                  <label className="form-label">Calcio</label>
                  <input
                    type="number"
                    className="form-control"
                    name="calcio"
                    value={nuevoProducto.calcio}
                    onChange={manejarCambioNuevoProducto}
                    required
                  />
                </div>

                <div className="col-6 mb-3">
                  <label className="form-label">Hierro</label>
                  <input
                    type="number"
                    className="form-control"
                    name="hierro"
                    value={nuevoProducto.hierro}
                    onChange={manejarCambioNuevoProducto}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-success w-100 mt-2">
                Guardar producto
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Productos;