import { useEffect, useState } from "react";

function GestionRecetas() {
  const [productosAprobados, setProductosAprobados] = useState([]);
  const [nombreReceta, setNombreReceta] = useState("");
  const [idCliente, setIdCliente] = useState(1);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [productosReceta, setProductosReceta] = useState([]);

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

  const agregarProductoAReceta = () => {
    if (!productoSeleccionado) {
      alert("Seleccione un producto.");
      return;
    }

    const producto = productosAprobados.find(
      (p) => p.id_producto === Number(productoSeleccionado)
    );

    if (!producto) return;

    const productoConCantidad = {
      ...producto,
      cantidad: Number(cantidad)
    };

    setProductosReceta([...productosReceta, productoConCantidad]);
    setProductoSeleccionado("");
    setCantidad(1);
  };

  const eliminarProducto = (idProducto) => {
    setProductosReceta(
      productosReceta.filter((p) => p.id_producto !== idProducto)
    );
  };

  const calcularTotales = () => {
    return productosReceta.reduce(
      (total, producto) => {
        total.energia += producto.energia * producto.cantidad;
        total.grasa += producto.grasa * producto.cantidad;
        total.carbohidratos += producto.carbohidratos * producto.cantidad;
        total.proteina += producto.proteina * producto.cantidad;
        return total;
      },
      {
        energia: 0,
        grasa: 0,
        carbohidratos: 0,
        proteina: 0
      }
    );
  };

  const crearReceta = async (e) => {
    e.preventDefault();

    if (!nombreReceta.trim()) {
      alert("Debe ingresar un nombre para la receta.");
      return;
    }

    if (productosReceta.length === 0) {
      alert("Debe agregar al menos un producto.");
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
            <h2 className="h4 mb-3">Productos aprobados</h2>

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
                    <option
                      key={producto.id_producto}
                      value={producto.id_producto}
                    >
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
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
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

            <h2 className="h5 mb-3">Productos en la receta</h2>

            {productosReceta.length === 0 ? (
              <p>No hay productos agregados.</p>
            ) : (
              <div
                className="table-responsive"
                style={{
                  maxHeight: "400px",
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
                            onClick={() => eliminarProducto(producto.id_producto)}
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
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0 p-4">
            <h2 className="h4 mb-3">Crear receta</h2>

            <form onSubmit={crearReceta}>
              <div className="mb-3">
                <label className="form-label">ID del cliente</label>
                <input
                  type="number"
                  className="form-control"
                  value={idCliente}
                  onChange={(e) => setIdCliente(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Nombre de la receta</label>
                <input
                  className="form-control"
                  placeholder="Ej: Desayuno alto en proteína"
                  value={nombreReceta}
                  onChange={(e) => setNombreReceta(e.target.value)}
                  required
                />
              </div>

              <h3 className="h6 text-secondary mt-4">
                Totalización automática
              </h3>

              <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: "#e8f8f5" }}>
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

              <button type="submit" className="btn btn-success w-100">
                Guardar receta
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GestionRecetas;