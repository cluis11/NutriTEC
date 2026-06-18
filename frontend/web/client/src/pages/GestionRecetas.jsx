import { useEffect, useState } from "react";

function GestionRecetas() {
  const [productosAprobados, setProductosAprobados] = useState([]);
  const [recetas, setRecetas] = useState([]);

  const [idCliente, setIdCliente] = useState(1);
  const [nombreReceta, setNombreReceta] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [productosReceta, setProductosReceta] = useState([]);

  useEffect(() => {
    cargarProductosAprobados();
    cargarRecetasPorCliente();
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

  const cargarRecetasPorCliente = async () => {
    try {
      const response = await fetch(`http://localhost:5108/api/receta/cliente/${idCliente}`);

      if (!response.ok) {
        throw new Error("Error al cargar recetas.");
      }

      const data = await response.json();
      setRecetas(data);
    } catch (error) {
      alert(error.message);
    }
  };

  const agregarProductoAReceta = () => {
    if (!productoSeleccionado) {
      alert("Seleccione un producto.");
      return;
    }

    const producto = productosAprobados.find(
      (p) => p.id_producto === Number(productoSeleccionado)
    );

    if (!producto) return;

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

  const eliminarProductoDeLista = (idProducto) => {
    setProductosReceta(
      productosReceta.filter((p) => p.id_producto !== idProducto)
    );
  };

  const calcularTotales = () => {
    return productosReceta.reduce(
      (total, producto) => {
        total.energia += producto.energia * producto.cantidad;
        total.proteina += producto.proteina * producto.cantidad;
        total.carbohidratos += producto.carbohidratos * producto.cantidad;
        total.grasa += producto.grasa * producto.cantidad;
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
      cargarRecetasPorCliente();
    } catch (error) {
      alert(error.message);
    }
  };

  const totales = calcularTotales();

  return (
    <div
      className="container-fluid py-4"
      style={{
        height: "100vh",
        overflowY: "auto"
      }}
    >
      <h1 className="mb-4">Gestión de Recetas</h1>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm border-0 p-4">
            <h2 className="h4 mb-3">Crear receta</h2>

            <div className="row">
              <div className="col-12 col-md-6 mb-3">
                <label className="form-label">ID del cliente</label>
                <input
                  type="number"
                  className="form-control"
                  value={idCliente}
                  onChange={(e) => setIdCliente(e.target.value)}
                  onBlur={cargarRecetasPorCliente}
                  min="1"
                />
              </div>

              <div className="col-12 col-md-6 mb-3">
                <label className="form-label">Nombre de la receta</label>
                <input
                  className="form-control"
                  placeholder="Ej: Desayuno alto en proteína"
                  value={nombreReceta}
                  onChange={(e) => setNombreReceta(e.target.value)}
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
                  onClick={agregarProductoAReceta}
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
              <div
                className="table-responsive"
                style={{
                  maxHeight: "300px",
                  overflowY: "auto"
                }}
              >
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
                            onClick={() => eliminarProductoDeLista(producto.id_producto)}
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

            <button
              type="button"
              className="btn btn-success w-100 mt-3"
              onClick={crearReceta}
            >
              Guardar receta
            </button>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0 p-4 mb-4">
            <h2 className="h4 mb-3">Totalización automática</h2>

            <div className="p-3 rounded-3" style={{ backgroundColor: "#e8f8f5" }}>
              <p className="mb-1">
                <strong>Calorías:</strong> {totales.energia} kcal
              </p>
              <p className="mb-1">
                <strong>Proteína:</strong> {totales.proteina} g
              </p>
              <p className="mb-1">
                <strong>Carbohidratos:</strong> {totales.carbohidratos} g
              </p>
              <p className="mb-0">
                <strong>Grasa:</strong> {totales.grasa} g
              </p>
            </div>
          </div>

          <div className="card shadow-sm border-0 p-4">
            <h2 className="h4 mb-3">Mis recetas</h2>

            {recetas.length === 0 ? (
              <p>No hay recetas registradas para este cliente.</p>
            ) : (
              <div
                className="table-responsive"
                style={{
                  maxHeight: "350px",
                  overflowY: "auto"
                }}
              >
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recetas.map((receta) => (
                      <tr key={receta.id_receta}>
                        <td>{receta.id_receta}</td>
                        <td>{receta.nombre}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button
              type="button"
              className="btn btn-outline-primary w-100 mt-3"
              onClick={cargarRecetasPorCliente}
            >
              Actualizar lista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GestionRecetas;