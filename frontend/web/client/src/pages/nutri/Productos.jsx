import { useEffect, useState } from "react";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [idBusqueda, setIdBusqueda] = useState("");
  const [nombreBusqueda, setNombreBusqueda] = useState("");
  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [productoEncontrado, setProductoEncontrado] = useState(null);
  const [productoEditando, setProductoEditando] = useState(null);
  const [mensajeBusqueda, setMensajeBusqueda] = useState("");

  const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
  const idUsuario = usuario.id_usuario || 1;
  const [nuevoProducto, setNuevoProducto] = useState({
    id_usuario: idUsuario,
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

  const [vitaminas, setVitaminas] = useState([
    { nombre: "" }
  ]);

  useEffect(() => {
    obtenerProductos();
  }, []);

  const eliminarProducto = async (id) => {
    const confirmar = window.confirm("¿Seguro que desea eliminar este producto?");

    if (!confirmar) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/producto/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || "Error al eliminar producto");
      }

      alert("Producto eliminado correctamente.");
      obtenerProductos();
    } catch (err) {
      alert(err.message);
    }
  };

  const obtenerProductos = async () => {
    try {
      setError("");
      setCargando(true);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/producto`);

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

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/producto/${idBusqueda}`);

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

  const manejarCambioEdicion = (e) => {
    const { name, value } = e.target;

    setProductoEditando({
      ...productoEditando,
      [name]: value
    });
  };

  const iniciarEdicion = (producto) => {
    setProductoEditando({
      ...producto
    });
  };

  const manejarCambioVitamina = (index, e) => {
    const { name, value } = e.target;
    const nuevasVitaminas = [...vitaminas];

    nuevasVitaminas[index][name] = value;
    setVitaminas(nuevasVitaminas);
  };

  const agregarVitamina = () => {
    setVitaminas([...vitaminas, { nombre: "", cantidad: "" }]);
  };

  const eliminarVitaminaFormulario = (index) => {
    const nuevasVitaminas = vitaminas.filter((_, i) => i !== index);
    setVitaminas(nuevasVitaminas);
  };


  const crearProducto = async (e) => {
    e.preventDefault();

    try {
      const productoParaEnviar = {
        Id_usuario: Number(nuevoProducto.id_usuario),
        Codigo: nuevoProducto.codigo,
        Descripcion: nuevoProducto.descripcion,
        Tamano: Number(nuevoProducto.tamano),
        Porcion: Number(nuevoProducto.porcion),
        Energia: Number(nuevoProducto.energia),
        Grasa: Number(nuevoProducto.grasa),
        Sodio: Number(nuevoProducto.sodio),
        Carbohidratos: Number(nuevoProducto.carbohidratos),
        Proteina: Number(nuevoProducto.proteina),
        Calcio: Number(nuevoProducto.calcio),
        Hierro: Number(nuevoProducto.hierro),
        Estado: "pendiente",
        Vitaminas: vitaminas
          .map((vitamina) => vitamina.nombre)
          .filter((vitamina) => vitamina.trim() !== "")
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/producto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productoParaEnviar)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detalle || errorData.mensaje || "Error al crear producto.");
      }

      alert("Producto creado correctamente.");

      setVitaminas([{ nombre: "" }]);

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

  const actualizarProducto = async (e) => {
    e.preventDefault();

    try {
      const productoParaEnviar = {
        ...productoEditando,
        id_usuario: Number(productoEditando.id_usuario),
        tamano: Number(productoEditando.tamano),
        porcion: Number(productoEditando.porcion),
        energia: Number(productoEditando.energia),
        grasa: Number(productoEditando.grasa),
        sodio: Number(productoEditando.sodio),
        carbohidratos: Number(productoEditando.carbohidratos),
        proteina: Number(productoEditando.proteina),
        calcio: Number(productoEditando.calcio),
        hierro: Number(productoEditando.hierro)
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/producto/${productoEditando.id_producto}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(productoParaEnviar)
        }
      );

      if (!response.ok) {
        let mensaje = "Error al actualizar producto.";

        try {
          const errorData = await response.json();
          mensaje = errorData.mensaje || errorData.detalle || mensaje;
        } catch {
          // Si no viene JSON, deja el mensaje general.
        }

        throw new Error(mensaje);
      }

      alert("Producto actualizado correctamente.");

      setProductoEditando(null);
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

  const productosFiltrados = productos.filter((producto) => {
    const coincideNombre = producto.descripcion
      ?.toLowerCase()
      .includes(nombreBusqueda.toLowerCase());

    const coincideCodigo = producto.codigo
      ?.toLowerCase()
      .includes(codigoBusqueda.toLowerCase());

    return coincideNombre && coincideCodigo;
  });

  return (
    <div
      className="container-fluid py-4"
      style={{
        height: "100vh",
        overflowY: "auto"
      }}
    >
      <h1 className="mb-4">Gestión de Productos</h1>

      <div className="row g-4">
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

              <div className="mb-4">
                <label className="form-label">Buscar producto por nombre</label>

                <input
                  type="text"
                  className="form-control"
                  value={nombreBusqueda}
                  onChange={(e) => setNombreBusqueda(e.target.value)}
                  placeholder="Ej: proteína"
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Buscar producto por código de barras</label>

                <input
                  type="text"
                  className="form-control"
                  value={codigoBusqueda}
                  onChange={(e) => setCodigoBusqueda(e.target.value)}
                  placeholder="Ej: 7441001234567"
                />
              </div>
            </form>

            {mensajeBusqueda && <p>{mensajeBusqueda}</p>}

            {productoEncontrado && (
              <div className="alert alert-success">
                <strong>Producto encontrado:</strong>{" "}
                {productoEncontrado.descripcion} ({productoEncontrado.codigo})
              </div>
            )}

            {productosFiltrados.length === 0 ? (
              <p>No hay productos registrados.</p>
            ) : (
              <div
                className="table-responsive"
                style={{
                  maxHeight: "500px",
                  overflowY: "auto"
                }}
              >
                <table className="table table-hover align-middle">
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
                      <th>Energía</th>
                      <th>Proteína</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {productosFiltrados.map((producto) => (
                      <tr key={producto.id_producto}>
                        <td>{producto.id_producto}</td>
                        <td>{producto.codigo}</td>
                        <td>{producto.descripcion}</td>
                        <td>{producto.energia}</td>
                        <td>{producto.proteina}</td>
                        <td>{producto.estado}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-warning btn-sm me-2"
                            title="Editar producto"
                            onClick={() => iniciarEdicion(producto)}
                          >
                            ✏️
                          </button>

                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            title="Eliminar producto"
                            onClick={() => eliminarProducto(producto.id_producto)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {productoEditando && (
            <div className="card shadow-sm border-0 p-4 mt-4">
              <h2 className="h4 mb-3">Editar producto</h2>

              <form onSubmit={actualizarProducto}>
                <h3 className="h6 text-secondary mt-3">Información general</h3>

                <div className="mb-3">
                  <label className="form-label">Código del producto</label>
                  <input
                    className="form-control"
                    name="codigo"
                    value={productoEditando.codigo}
                    onChange={manejarCambioEdicion}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Descripción</label>
                  <input
                    className="form-control"
                    name="descripcion"
                    value={productoEditando.descripcion}
                    onChange={manejarCambioEdicion}
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
                      value={productoEditando.tamano}
                      onChange={manejarCambioEdicion}
                      required
                    />
                  </div>

                  <div className="col-6 mb-3">
                    <label className="form-label">Porción</label>
                    <input
                      type="number"
                      className="form-control"
                      name="porcion"
                      value={productoEditando.porcion}
                      onChange={manejarCambioEdicion}
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
                      value={productoEditando.energia}
                      onChange={manejarCambioEdicion}
                      required
                    />
                  </div>

                  <div className="col-6 mb-3">
                    <label className="form-label">Grasa</label>
                    <input
                      type="number"
                      className="form-control"
                      name="grasa"
                      value={productoEditando.grasa}
                      onChange={manejarCambioEdicion}
                      required
                    />
                  </div>

                  <div className="col-6 mb-3">
                    <label className="form-label">Sodio</label>
                    <input
                      type="number"
                      className="form-control"
                      name="sodio"
                      value={productoEditando.sodio}
                      onChange={manejarCambioEdicion}
                      required
                    />
                  </div>

                  <div className="col-6 mb-3">
                    <label className="form-label">Carbohidratos</label>
                    <input
                      type="number"
                      className="form-control"
                      name="carbohidratos"
                      value={productoEditando.carbohidratos}
                      onChange={manejarCambioEdicion}
                      required
                    />
                  </div>

                  <div className="col-6 mb-3">
                    <label className="form-label">Proteína</label>
                    <input
                      type="number"
                      className="form-control"
                      name="proteina"
                      value={productoEditando.proteina}
                      onChange={manejarCambioEdicion}
                      required
                    />
                  </div>

                  <div className="col-6 mb-3">
                    <label className="form-label">Calcio</label>
                    <input
                      type="number"
                      className="form-control"
                      name="calcio"
                      value={productoEditando.calcio}
                      onChange={manejarCambioEdicion}
                      required
                    />
                  </div>

                  <div className="col-6 mb-3">
                    <label className="form-label">Hierro</label>
                    <input
                      type="number"
                      className="form-control"
                      name="hierro"
                      value={productoEditando.hierro}
                      onChange={manejarCambioEdicion}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-success">
                    Guardar cambios
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setProductoEditando(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

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
                {[
                  ["energia", "Energía"],
                  ["grasa", "Grasa"],
                  ["sodio", "Sodio"],
                  ["carbohidratos", "Carbohidratos"],
                  ["proteina", "Proteína"],
                  ["calcio", "Calcio"],
                  ["hierro", "Hierro"]
                ].map(([name, label]) => (
                  <div className="col-6 mb-3" key={name}>
                    <label className="form-label">{label}</label>
                    <input
                      type="number"
                      className="form-control"
                      name={name}
                      value={nuevoProducto[name]}
                      onChange={manejarCambioNuevoProducto}
                      required
                    />
                  </div>
                ))}
              </div>

              <h3 className="h6 text-secondary mt-3">Vitaminas</h3>

              {vitaminas.map((vitamina, index) => (
                <div className="row mb-2" key={index}>
                  <div className="col-5">
                    <input
                      className="form-control"
                      name="nombre"
                      placeholder="Ej: Vitamina C"
                      value={vitamina.nombre}
                      onChange={(e) => manejarCambioVitamina(index, e)}
                      required
                    />
                  </div>

                  <div className="col-2">
                    <button
                      type="button"
                      className="btn btn-outline-danger w-100"
                      onClick={() => eliminarVitaminaFormulario(index)}
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline-primary w-100 mb-3"
                onClick={agregarVitamina}
              >
                Agregar vitamina
              </button>

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