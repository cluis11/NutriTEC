import { useEffect, useState } from "react";

function GestionRecetas() {
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario")) || {};
  const idUsuarioLogueado = usuarioLogueado.id_usuario || 1;

  const [productosAprobados, setProductosAprobados] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [idCliente, setIdCliente] = useState(idUsuarioLogueado);
  const [idClienteBusqueda, setIdClienteBusqueda] = useState(String(idUsuarioLogueado));
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
    cargarRecetasPorCliente(null, idUsuarioLogueado);
  }, []);

  const cargarProductosAprobados = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/producto/aprobados`);
      if (!response.ok) throw new Error("Error al cargar productos aprobados.");
      setProductosAprobados(await response.json());
    } catch (error) { alert(error.message); }
  };

  const cargarRecetasPorCliente = async (e, idOverride) => {
    if (e) e.preventDefault();
    const idBuscar = idOverride || idClienteBusqueda;
    if (!String(idBuscar).trim()) { alert("Ingrese el ID del cliente."); return; }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/receta/cliente/${idBuscar}`);
      if (!response.ok) throw new Error("Error al cargar recetas.");
      setRecetas(await response.json());
      setRecetaEditando(null);
    } catch (error) { alert(error.message); }
  };

  const cargarDetalleReceta = async (idReceta) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/receta/${idReceta}`);
      if (!response.ok) throw new Error("Error al cargar detalle de la receta.");
      const data = await response.json();
      setRecetaEditando(data);
      setNombreEditado(data.nombre);
      setProductoAgregar(""); setCantidadAgregar(1);
    } catch (error) { alert(error.message); }
  };

  const agregarProductoAListaNueva = () => {
    if (!productoSeleccionado) { alert("Seleccione un producto."); return; }
    const producto = productosAprobados.find(p => p.id_producto === Number(productoSeleccionado));
    if (!producto) return;
    if (productosReceta.some(p => p.id_producto === producto.id_producto)) { alert("Ese producto ya está en la receta."); return; }
    setProductosReceta([...productosReceta, { ...producto, cantidad: Number(cantidad) }]);
    setProductoSeleccionado(""); setCantidad(1);
  };

  const calcularTotales = (productos) => productos.reduce((total, p) => ({
    energia: total.energia + Number(p.energia) * Number(p.cantidad),
    proteina: total.proteina + Number(p.proteina) * Number(p.cantidad),
    carbohidratos: total.carbohidratos + Number(p.carbohidratos) * Number(p.cantidad),
    grasa: total.grasa + Number(p.grasa) * Number(p.cantidad)
  }), { energia: 0, proteina: 0, carbohidratos: 0, grasa: 0 });

  const crearReceta = async (e) => {
    e.preventDefault();
    if (!nombreReceta.trim()) { alert("Ingrese el nombre de la receta."); return; }
    if (productosReceta.length === 0) { alert("Agregue al menos un producto."); return; }
    try {
      const response = await fetch("${process.env.REACT_APP_API_URL}/api/receta", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cliente: Number(idCliente), nombre: nombreReceta, productos: productosReceta.map(p => ({ id_producto: p.id_producto, cantidad: p.cantidad })) })
      });
      if (!response.ok) throw new Error((await response.json()).mensaje || "Error al crear receta.");
      alert("Receta creada correctamente.");
      setNombreReceta(""); setProductosReceta([]); setProductoSeleccionado(""); setCantidad(1);
      if (String(idCliente) === String(idClienteBusqueda)) cargarRecetasPorCliente();
    } catch (error) { alert(error.message); }
  };

  const actualizarNombreReceta = async () => {
    if (!recetaEditando || !nombreEditado.trim()) { alert("Ingrese el nuevo nombre."); return; }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/receta/${recetaEditando.id_receta}/nombre`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombreEditado })
      });
      if (!response.ok) throw new Error((await response.json()).mensaje || "Error al actualizar nombre.");
      alert("Nombre actualizado.");
      cargarDetalleReceta(recetaEditando.id_receta);
      cargarRecetasPorCliente();
    } catch (error) { alert(error.message); }
  };

  const agregarProductoARecetaExistente = async () => {
    if (!recetaEditando || !productoAgregar) { alert("Seleccione un producto."); return; }
    if (recetaEditando.productos?.some(p => p.id_producto === Number(productoAgregar))) { alert("Ese producto ya está en la receta."); return; }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/receta/${recetaEditando.id_receta}/producto`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_producto: Number(productoAgregar), cantidad: Number(cantidadAgregar) })
      });
      if (!response.ok) throw new Error((await response.json()).mensaje || "Error al agregar producto.");
      alert("Producto agregado."); setProductoAgregar(""); setCantidadAgregar(1);
      cargarDetalleReceta(recetaEditando.id_receta);
    } catch (error) { alert(error.message); }
  };

  const eliminarProductoDeRecetaExistente = async (idProducto) => {
    if (!recetaEditando || !window.confirm("¿Desea quitar este producto?")) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/receta/${recetaEditando.id_receta}/producto/${idProducto}`, { method: "DELETE" });
      if (!response.ok) throw new Error((await response.json()).mensaje || "Error al quitar producto.");
      alert("Producto eliminado."); cargarDetalleReceta(recetaEditando.id_receta);
    } catch (error) { alert(error.message); }
  };

  const eliminarReceta = async (idReceta) => {
    if (!window.confirm("¿Desea eliminar esta receta?")) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/receta/${idReceta}`, { method: "DELETE" });
      if (!response.ok) throw new Error((await response.json()).mensaje || "Error al eliminar receta.");
      alert("Receta eliminada."); setRecetaEditando(null); cargarRecetasPorCliente();
    } catch (error) { alert(error.message); }
  };

  const totalesNueva = calcularTotales(productosReceta);
  const totalesEditando = recetaEditando?.productos ? calcularTotales(recetaEditando.productos) : { energia: 0, proteina: 0, carbohidratos: 0, grasa: 0 };

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
                  <input type="number" className="form-control" value={idCliente} onChange={e => setIdCliente(e.target.value)} min="1" required />
                </div>
                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label">Nombre de la receta</label>
                  <input className="form-control" placeholder="Ej: Desayuno alto en proteína" value={nombreReceta} onChange={e => setNombreReceta(e.target.value)} required />
                </div>
              </div>
              <div className="row align-items-end">
                <div className="col-12 col-md-7 mb-3">
                  <label className="form-label">Producto</label>
                  <select className="form-select" value={productoSeleccionado} onChange={e => setProductoSeleccionado(e.target.value)}>
                    <option value="">Seleccione un producto</option>
                    {productosAprobados.map(p => <option key={p.id_producto} value={p.id_producto}>{p.descripcion} - {p.energia} kcal</option>)}
                  </select>
                </div>
                <div className="col-6 col-md-2 mb-3">
                  <label className="form-label">Cantidad</label>
                  <input type="number" className="form-control" value={cantidad} onChange={e => setCantidad(e.target.value)} min="1" />
                </div>
                <div className="col-6 col-md-3 mb-3">
                  <button type="button" className="btn btn-success w-100" onClick={agregarProductoAListaNueva}>Agregar</button>
                </div>
              </div>
              <hr />
              {productosReceta.length === 0 ? <p>No hay productos agregados.</p> : (
                <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <table className="table table-hover align-middle">
                    <thead className="table-light"><tr><th>Producto</th><th>Cant.</th><th>Kcal</th><th>Proteína</th><th></th></tr></thead>
                    <tbody>
                      {productosReceta.map(p => (
                        <tr key={p.id_producto}>
                          <td>{p.descripcion}</td><td>{p.cantidad}</td><td>{p.energia * p.cantidad}</td><td>{p.proteina * p.cantidad}</td>
                          <td><button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setProductosReceta(productosReceta.filter(x => x.id_producto !== p.id_producto))}>X</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="p-3 rounded-3 my-3" style={{ backgroundColor: "#e8f8f5" }}>
                <strong>Total:</strong>
                <p className="mb-1">Calorías: {totalesNueva.energia} kcal</p>
                <p className="mb-1">Proteína: {totalesNueva.proteina} g</p>
                <p className="mb-0">Carbohidratos: {totalesNueva.carbohidratos} g | Grasa: {totalesNueva.grasa} g</p>
              </div>
              <button type="submit" className="btn btn-success w-100">Guardar receta</button>
            </form>
          </div>

          {recetaEditando && (
            <div className="card shadow-sm border-0 p-4 mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h4 mb-0">Editar receta #{recetaEditando.id_receta}</h2>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setRecetaEditando(null)}>Cerrar</button>
              </div>
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <div className="input-group">
                  <input className="form-control" value={nombreEditado} onChange={e => setNombreEditado(e.target.value)} />
                  <button type="button" className="btn btn-primary" onClick={actualizarNombreReceta}>Guardar</button>
                </div>
              </div>
              <div className="row align-items-end">
                <div className="col-12 col-md-7 mb-3">
                  <label className="form-label">Agregar producto</label>
                  <select className="form-select" value={productoAgregar} onChange={e => setProductoAgregar(e.target.value)}>
                    <option value="">Seleccione un producto</option>
                    {productosAprobados.map(p => <option key={p.id_producto} value={p.id_producto}>{p.descripcion} - {p.energia} kcal</option>)}
                  </select>
                </div>
                <div className="col-6 col-md-2 mb-3">
                  <input type="number" className="form-control" value={cantidadAgregar} min="1" onChange={e => setCantidadAgregar(e.target.value)} />
                </div>
                <div className="col-6 col-md-3 mb-3">
                  <button type="button" className="btn btn-success w-100" onClick={agregarProductoARecetaExistente}>Agregar</button>
                </div>
              </div>
              {recetaEditando.productos?.length > 0 && (
                <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <table className="table table-hover align-middle">
                    <thead className="table-light"><tr><th>Producto</th><th>Cant.</th><th>Kcal</th><th>Proteína</th><th></th></tr></thead>
                    <tbody>
                      {recetaEditando.productos.map(p => (
                        <tr key={p.id_producto}>
                          <td>{p.descripcion}</td><td>{p.cantidad}</td><td>{p.energia * p.cantidad}</td><td>{p.proteina * p.cantidad}</td>
                          <td><button type="button" className="btn btn-outline-danger btn-sm" onClick={() => eliminarProductoDeRecetaExistente(p.id_producto)}>X</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="p-3 rounded-3 my-3" style={{ backgroundColor: "#e8f8f5" }}>
                <strong>Total:</strong>
                <p className="mb-0">Calorías: {totalesEditando.energia} kcal | Proteína: {totalesEditando.proteina} g</p>
              </div>
              <button type="button" className="btn btn-danger w-100" onClick={() => eliminarReceta(recetaEditando.id_receta)}>Eliminar receta</button>
            </div>
          )}
        </div>

        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0 p-4">
            <h2 className="h4 mb-3">Mis recetas</h2>
            <form onSubmit={cargarRecetasPorCliente} className="mb-3">
              <label className="form-label">ID del cliente</label>
              <div className="input-group">
                <input type="number" className="form-control" value={idClienteBusqueda} onChange={e => setIdClienteBusqueda(e.target.value)} min="1" />
                <button type="submit" className="btn btn-primary">Buscar</button>
              </div>
            </form>
            <hr />
            {recetas.length === 0 ? <p>No hay recetas para mostrar.</p> : (
              <div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>
                <table className="table table-hover align-middle">
                  <thead className="table-light"><tr><th>ID</th><th>Nombre</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {recetas.map(r => (
                      <tr key={r.id_receta}>
                        <td>{r.id_receta}</td><td>{r.nombre}</td>
                        <td>
                          <button className="btn btn-warning btn-sm me-1" onClick={() => cargarDetalleReceta(r.id_receta)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => eliminarReceta(r.id_receta)}>🗑️</button>
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