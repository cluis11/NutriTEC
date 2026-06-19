import { useEffect, useState } from "react";

function GestionRecetas() {
  const [productosAprobados, setProductosAprobados] = useState([]);
  const [recetas, setRecetas] = useState([]);

  const [idCliente, setIdCliente] = useState(1);
  const [idClienteBusqueda, setIdClienteBusqueda] = useState("");

  const [nombreReceta, setNombreReceta] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [productosReceta, setProductosReceta] = useState([]);

  const [recetaEditando, setRecetaEditando] = useState(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [productoAgregar, setProductoAgregar] = useState("");
  const [cantidadAgregar, setCantidadAgregar] = useState(1);

  useEffect(() => {
    cargarProductosAprobados();
  }, []);

  const cargarProductosAprobados = async () => {
    try {
      const response = await fetch("http://localhost:5108/api/producto/aprobados");

      if (!response.ok) {
        throw new Error("Error al cargar productos aprobados.");
      }

      const data = await response.json();
      setProductosAprobados(data);
    } catch (error) {
      alert(error.message);
    }
  };

  const cargarRecetasPorCliente = async (e) => {
    if (e) e.preventDefault();

    if (!idClienteBusqueda.trim()) {
      alert("Ingrese el ID del cliente.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5108/api/receta/cliente/${idClienteBusqueda}`
      );

      if (!response.ok) {
        throw new Error("Error al cargar recetas.");
      }

      const data = await response.json();
      setRecetas(data);
      setRecetaEditando(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const cargarDetalleReceta = async (idReceta) => {
    try {
      const response = await fetch(`http://localhost:5108/api/receta/${idReceta}`);

      if (!response.ok) {
        throw new Error("Error al cargar detalle de la receta.");
      }

      const data = await response.json();

      setRecetaEditando(data);
      setNombreEditado(data.nombre);
      setProductoAgregar("");
      setCantidadAgregar(1);
    } catch (error) {
      alert(error.message);
    }
  };

  const agregarProductoAListaNueva = () => {
    if (!productoSeleccionado) {
      alert("Seleccione un producto.");
      return;
    }

    const producto = productosAprobados.find(
      (p) => p.id_producto === Number(productoSeleccionado)
    );

    if (!producto) return;

    const yaExiste = productosReceta.some(
      (p) => p.id_producto === producto.id_producto
    );

    if (yaExiste) {
      alert("Ese producto ya está en la receta.");
      return;
    }

    setProductosReceta([
      ...productosReceta,
      {
        ...producto,
        cantidad: Number(cantidad)
      }
    ]);

    setProductoSeleccionado("");
    setCantidad(1);
  };

  const eliminarProductoDeListaNueva = (idProducto) => {
    setProductosReceta(
      productosReceta.filter((p) => p.id_producto !== idProducto)
    );
  };

  const calcularTotales = (productos) => {
    return productos.reduce(
      (total, producto) => {
        total.energia += Number(producto.energia) * Number(producto.cantidad);
        total.proteina += Number(producto.proteina) * Number(producto.cantidad);
        total.carbohidratos += Number(producto.carbohidratos) * Number(producto.cantidad);
        total.grasa += Number(producto.grasa) * Number(producto.cantidad);
        return total;
      },
      {
        energia: 0,
        proteina: 0,
        carbohidratos: 0,
        grasa: 0
      }
    );
  };

  const crearReceta = async (e) => {
    e.preventDefault();

    if (!nombreReceta.trim()) {
      alert("Ingrese el nombre de la receta.");
      return;
    }

    if (productosReceta.length === 0) {
      alert("Agregue al menos un producto.");
      return;
    }

    const receta = {
      id_cliente: Number(idCliente),
      nombre: nombreReceta,
      productos: productosReceta.map((producto) => ({
        id_producto: producto.id_producto,
        cantidad: producto.cantidad
      }))
    };

    try {
      const response = await fetch("http://localhost:5108/api/receta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(receta)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || "Error al crear receta.");
      }

      alert("Receta creada correctamente.");

      setNombreReceta("");
      setProductosReceta([]);
      setProductoSeleccionado("");
      setCantidad(1);

      if (String(idCliente) === String(idClienteBusqueda)) {
        cargarRecetasPorCliente();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const actualizarNombreReceta = async () => {
    if (!recetaEditando) return;

    if (!nombreEditado.trim()) {
      alert("Ingrese el nuevo nombre.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5108/api/receta/${recetaEditando.id_receta}/nombre`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nombre: nombreEditado
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || "Error al actualizar nombre.");
      }

      alert("Nombre actualizado correctamente.");
      cargarDetalleReceta(recetaEditando.id_receta);
      cargarRecetasPorCliente();
    } catch (error) {
      alert(error.message);
    }
  };

  const agregarProductoARecetaExistente = async () => {
    if (!recetaEditando) return;

    if (!productoAgregar) {
      alert("Seleccione un producto.");
      return;
    }

    const yaExiste = recetaEditando.productos?.some(
      (p) => p.id_producto === Number(productoAgregar)
    );

    if (yaExiste) {
      alert("Ese producto ya está en la receta.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5108/api/receta/${recetaEditando.id_receta}/producto`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id_producto: Number(productoAgregar),
            cantidad: Number(cantidadAgregar)
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || "Error al agregar producto.");
      }

      alert("Producto agregado correctamente.");

      setProductoAgregar("");
      setCantidadAgregar(1);
      cargarDetalleReceta(recetaEditando.id_receta);
    } catch (error) {
      alert(error.message);
    }
  };

  const eliminarProductoDeRecetaExistente = async (idProducto) => {
    if (!recetaEditando) return;

    const confirmar = window.confirm("¿Desea quitar este producto de la receta?");
    if (!confirmar) return;

    try {
      const response = await fetch(
        `http://localhost:5108/api/receta/${recetaEditando.id_receta}/producto/${idProducto}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || "Error al quitar producto.");
      }

      alert("Producto eliminado de la receta.");
      cargarDetalleReceta(recetaEditando.id_receta);
    } catch (error) {
      alert(error.message);
    }
  };

  const eliminarReceta = async (idReceta) => {
    const confirmar = window.confirm("¿Desea eliminar esta receta?");
    if (!confirmar) return;

    try {
      const response = await fetch(`http://localhost:5108/api/receta/${idReceta}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || "Error al eliminar receta.");
      }

      alert("Receta eliminada correctamente.");

      setRecetaEditando(null);
      cargarRecetasPorCliente();
    } catch (error) {
      alert(error.message);
    }
  };

  const totalesNueva = calcularTotales(productosReceta);
  const totalesEditando = recetaEditando?.productos
    ? calcularTotales(recetaEditando.productos)
    : { energia: 0, proteina: 0, carbohidratos: 0, grasa: 0 };

  return (
    <div className="container-fluid py-4" style={{ height: "100vh", overflowY: "auto" }}>
      <h1 className="mb-4">Gestión de Recetas</h1>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm border-0 p-4">
            <h2 className="h4 mb-3">Crear receta</h2>

            <form onSubmit={crearReceta}>
              <div className="row">
                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label">ID del cliente</label>
                  <input
                    type="number"
                    className="form-control"
                    value={idCliente}
                    onChange={(e) => setIdCliente(e.target.value)}
                    min="1"
                    required
                  />
                </div>

                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label">Nombre de la receta</label>
                  <input
                    className="form-control"
                    placeholder="Ej: Desayuno alto en proteína"
                    value={nombreReceta}
                    onChange={(e) => setNombreReceta(e.target.value)}
                    required
                  />
                </div>
              </div>

              <h3 className="h6 text-secondary mt-3">Agregar productos aprobados</h3>

              <div className="row align-items-end">
                <div className="col-12 col-md-7 mb-3">
                  <label className="form-label">Producto</label>
                  <select
                    className="form-select"
                    value={productoSeleccionado}
                    onChange={(e) => setProductoSeleccionado(e.target.value)}
                  >
                    <option value="">Seleccione un producto</option>
                    {productosAprobados.map((producto) => (
                      <option key={producto.id_producto} value={producto.id_producto}>
                        {producto.descripcion} - {producto.energia} kcal
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-6 col-md-2 mb-3">
                  <label className="form-label">Cantidad</label>
                  <input
                    type="number"
                    className="form-control"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    min="1"
                  />
                </div>

                <div className="col-6 col-md-3 mb-3">
                  <button
                    type="button"
                    className="btn btn-success w-100"
                    onClick={agregarProductoAListaNueva}
                  >
                    Agregar
                  </button>
                </div>
              </div>

              <hr />

              <h3 className="h5 mb-3">Productos en la receta</h3>

              {productosReceta.length === 0 ? (
                <p>No hay productos agregados.</p>
              ) : (
                <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th>Cant.</th>
                        <th>Kcal</th>
                        <th>Proteína</th>
                        <th>Acción</th>
                      </tr>
                    </thead>

                    <tbody>
                      {productosReceta.map((producto) => (
                        <tr key={producto.id_producto}>
                          <td>{producto.descripcion}</td>
                          <td>{producto.cantidad}</td>
                          <td>{producto.energia * producto.cantidad}</td>
                          <td>{producto.proteina * producto.cantidad}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => eliminarProductoDeListaNueva(producto.id_producto)}
                            >
                              X
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="p-3 rounded-3 my-3" style={{ backgroundColor: "#e8f8f5" }}>
                <strong>Total nueva receta:</strong>
                <p className="mb-1">Calorías: {totalesNueva.energia} kcal</p>
                <p className="mb-1">Proteína: {totalesNueva.proteina} g</p>
                <p className="mb-1">Carbohidratos: {totalesNueva.carbohidratos} g</p>
                <p className="mb-0">Grasa: {totalesNueva.grasa} g</p>
              </div>

              <button type="submit" className="btn btn-success w-100 mt-2">
                Guardar receta
              </button>
            </form>
          </div>

          {recetaEditando && (
            <div className="card shadow-sm border-0 p-4 mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h4 mb-0">Editar receta #{recetaEditando.id_receta}</h2>

                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setRecetaEditando(null)}
                >
                  Cerrar
                </button>
              </div>

              <div className="mb-3">
                <label className="form-label">Nombre de la receta</label>
                <div className="input-group">
                  <input
                    className="form-control"
                    value={nombreEditado}
                    onChange={(e) => setNombreEditado(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={actualizarNombreReceta}
                  >
                    Guardar
                  </button>
                </div>
              </div>

              <h3 className="h6 text-secondary mt-4">Agregar producto</h3>

              <div className="row align-items-end">
                <div className="col-12 col-md-7 mb-3">
                  <label className="form-label">Producto</label>
                  <select
                    className="form-select"
                    value={productoAgregar}
                    onChange={(e) => setProductoAgregar(e.target.value)}
                  >
                    <option value="">Seleccione un producto</option>
                    {productosAprobados.map((producto) => (
                      <option key={producto.id_producto} value={producto.id_producto}>
                        {producto.descripcion} - {producto.energia} kcal
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-6 col-md-2 mb-3">
                  <label className="form-label">Cantidad</label>
                  <input
                    type="number"
                    className="form-control"
                    value={cantidadAgregar}
                    min="1"
                    onChange={(e) => setCantidadAgregar(e.target.value)}
                  />
                </div>

                <div className="col-6 col-md-3 mb-3">
                  <button
                    type="button"
                    className="btn btn-success w-100"
                    onClick={agregarProductoARecetaExistente}
                  >
                    Agregar
                  </button>
                </div>
              </div>

              <h3 className="h5 mb-3">Productos actuales</h3>

              {!recetaEditando.productos || recetaEditando.productos.length === 0 ? (
                <p>La receta no tiene productos.</p>
              ) : (
                <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th>Cant.</th>
                        <th>Kcal</th>
                        <th>Proteína</th>
                        <th>Quitar</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recetaEditando.productos.map((producto) => (
                        <tr key={producto.id_producto}>
                          <td>{producto.descripcion}</td>
                          <td>{producto.cantidad}</td>
                          <td>{producto.energia * producto.cantidad}</td>
                          <td>{producto.proteina * producto.cantidad}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() =>
                                eliminarProductoDeRecetaExistente(producto.id_producto)
                              }
                            >
                              X
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="p-3 rounded-3 my-3" style={{ backgroundColor: "#e8f8f5" }}>
                <strong>Total receta editada:</strong>
                <p className="mb-1">Calorías: {totalesEditando.energia} kcal</p>
                <p className="mb-1">Proteína: {totalesEditando.proteina} g</p>
                <p className="mb-1">Carbohidratos: {totalesEditando.carbohidratos} g</p>
                <p className="mb-0">Grasa: {totalesEditando.grasa} g</p>
              </div>

              <button
                type="button"
                className="btn btn-danger w-100"
                onClick={() => eliminarReceta(recetaEditando.id_receta)}
              >
                Eliminar receta
              </button>
            </div>
          )}
        </div>

        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0 p-4">
            <h2 className="h4 mb-3">Buscar recetas por cliente</h2>

            <form onSubmit={cargarRecetasPorCliente} className="mb-3">
              <label className="form-label">ID del cliente</label>

              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Ej: 1"
                  value={idClienteBusqueda}
                  onChange={(e) => setIdClienteBusqueda(e.target.value)}
                  min="1"
                />

                <button type="submit" className="btn btn-primary">
                  Buscar
                </button>
              </div>
            </form>

            <hr />

            <h5 className="mb-3">Recetas encontradas</h5>

            {recetas.length === 0 ? (
              <p>No hay recetas para mostrar.</p>
            ) : (
              <div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recetas.map((receta) => (
                      <tr key={receta.id_receta}>
                        <td>{receta.id_receta}</td>
                        <td>{receta.nombre}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              type="button"
                              className="btn btn-warning btn-sm"
                              title="Editar receta"
                              onClick={() => cargarDetalleReceta(receta.id_receta)}
                              style={{ width: "32px", height: "32px", padding: 0 }}
                            >
                              ✏️
                            </button>

                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              title="Eliminar receta"
                              onClick={() => eliminarReceta(receta.id_receta)}
                              style={{ width: "32px", height: "32px", padding: 0 }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GestionRecetas;