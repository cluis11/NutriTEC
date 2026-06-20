import { useEffect, useState } from "react";

function Productos() {
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario")) || {};
  const idUsuario = usuarioLogueado.id_usuario || 1;

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [idBusqueda, setIdBusqueda] = useState("");
  const [nombreBusqueda, setNombreBusqueda] = useState("");
  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [productoEncontrado, setProductoEncontrado] = useState(null);
  const [productoEditando, setProductoEditando] = useState(null);
  const [mensajeBusqueda, setMensajeBusqueda] = useState("");
  const [nuevoProducto, setNuevoProducto] = useState({
    codigo: "", descripcion: "", tamano: "", porcion: "",
    energia: "", grasa: "", sodio: "", carbohidratos: "", proteina: "", calcio: "", hierro: ""
  });
  const [vitaminas, setVitaminas] = useState([{ nombre: "" }]);

  useEffect(() => { obtenerProductos(); }, []);

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Seguro que desea eliminar este producto?")) return;
    try {
      const response = await fetch(`http://localhost:5108/api/producto/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error((await response.json()).mensaje || "Error al eliminar producto");
      alert("Producto eliminado correctamente.");
      obtenerProductos();
    } catch (err) { alert(err.message); }
  };

  const obtenerProductos = async () => {
    try {
      setError(""); setCargando(true);
      const response = await fetch("http://localhost:5108/api/producto");
      if (!response.ok) throw new Error("Error al obtener productos");
      setProductos(await response.json());
    } catch (err) { setError(err.message); }
    finally { setCargando(false); }
  };

  const buscarProductoPorId = async (e) => {
    e.preventDefault();
    if (!idBusqueda.trim()) { setMensajeBusqueda("Debe ingresar un ID."); setProductoEncontrado(null); return; }
    try {
      setMensajeBusqueda(""); setProductoEncontrado(null);
      const response = await fetch(`http://localhost:5108/api/producto/${idBusqueda}`);
      if (response.status === 404) { setMensajeBusqueda("Producto no encontrado."); return; }
      if (!response.ok) throw new Error("Error al buscar producto.");
      setProductoEncontrado(await response.json());
    } catch (err) { setMensajeBusqueda(err.message); }
  };

  const crearProducto = async (e) => {
    e.preventDefault();
    try {
      const productoParaEnviar = {
        id_usuario: idUsuario,
        codigo: nuevoProducto.codigo,
        descripcion: nuevoProducto.descripcion,
        tamano: Number(nuevoProducto.tamano),
        porcion: Number(nuevoProducto.porcion),
        energia: Number(nuevoProducto.energia),
        grasa: Number(nuevoProducto.grasa),
        sodio: Number(nuevoProducto.sodio),
        carbohidratos: Number(nuevoProducto.carbohidratos),
        proteina: Number(nuevoProducto.proteina),
        calcio: Number(nuevoProducto.calcio),
        hierro: Number(nuevoProducto.hierro),
        estado: "pendiente",
        vitaminas: vitaminas.map(v => v.nombre).filter(v => v.trim() !== "")
      };
      const response = await fetch("http://localhost:5108/api/producto", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoParaEnviar)
      });
      if (!response.ok) throw new Error((await response.json()).detalle || "Error al crear producto.");
      alert("Producto creado correctamente.");
      setVitaminas([{ nombre: "" }]);
      setNuevoProducto({ codigo: "", descripcion: "", tamano: "", porcion: "", energia: "", grasa: "", sodio: "", carbohidratos: "", proteina: "", calcio: "", hierro: "" });
      obtenerProductos();
    } catch (err) { alert(err.message); }
  };

  const actualizarProducto = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5108/api/producto/${productoEditando.id_producto}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...productoEditando, tamano: Number(productoEditando.tamano), porcion: Number(productoEditando.porcion), energia: Number(productoEditando.energia), grasa: Number(productoEditando.grasa), sodio: Number(productoEditando.sodio), carbohidratos: Number(productoEditando.carbohidratos), proteina: Number(productoEditando.proteina), calcio: Number(productoEditando.calcio), hierro: Number(productoEditando.hierro) })
      });
      if (!response.ok) throw new Error((await response.json()).mensaje || "Error al actualizar producto.");
      alert("Producto actualizado correctamente.");
      setProductoEditando(null);
      obtenerProductos();
    } catch (err) { alert(err.message); }
  };

  if (cargando) return <p>Cargando productos...</p>;
  if (error) return <p>Error: {error}</p>;

  const productosFiltrados = productos.filter(p =>
    p.descripcion?.toLowerCase().includes(nombreBusqueda.toLowerCase()) &&
    p.codigo?.toLowerCase().includes(codigoBusqueda.toLowerCase())
  );

  return (
    <div className="container-fluid py-4" style={{ height: "100vh", overflowY: "auto" }}>
      <h1 className="mb-4">Gestión de Productos</h1>
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm border-0 p-4">
            <h2 className="h4 mb-3">Productos registrados</h2>
            <form onSubmit={buscarProductoPorId} className="mb-4">
              <label className="form-label">Buscar por ID</label>
              <div className="d-flex gap-2 mb-3">
                <input type="number" className="form-control" value={idBusqueda} onChange={e => setIdBusqueda(e.target.value)} placeholder="Ej: 1" min="1" />
                <button type="submit" className="btn btn-primary">Buscar</button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => { setIdBusqueda(""); setProductoEncontrado(null); setMensajeBusqueda(""); }}>Limpiar</button>
              </div>
              <label className="form-label">Buscar por nombre</label>
              <input type="text" className="form-control mb-3" value={nombreBusqueda} onChange={e => setNombreBusqueda(e.target.value)} placeholder="Ej: proteína" />
              <label className="form-label">Buscar por código de barras</label>
              <input type="text" className="form-control" value={codigoBusqueda} onChange={e => setCodigoBusqueda(e.target.value)} placeholder="Ej: 7441001234567" />
            </form>
            {mensajeBusqueda && <p>{mensajeBusqueda}</p>}
            {productoEncontrado && <div className="alert alert-success"><strong>Encontrado:</strong> {productoEncontrado.descripcion} ({productoEncontrado.codigo})</div>}
            <div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>
              <table className="table table-hover align-middle">
                <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr><th>ID</th><th>Código</th><th>Descripción</th><th>Energía</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {productosFiltrados.map(p => (
                    <tr key={p.id_producto}>
                      <td>{p.id_producto}</td><td>{p.codigo}</td><td>{p.descripcion}</td><td>{p.energia}</td><td>{p.estado}</td>
                      <td>
                        <button className="btn btn-warning btn-sm me-2" onClick={() => setProductoEditando({ ...p })}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => eliminarProducto(p.id_producto)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {productoEditando && (
            <div className="card shadow-sm border-0 p-4 mt-4">
              <h2 className="h4 mb-3">Editar producto</h2>
              <form onSubmit={actualizarProducto}>
                {[["codigo", "Código"], ["descripcion", "Descripción"]].map(([name, label]) => (
                  <div className="mb-3" key={name}>
                    <label className="form-label">{label}</label>
                    <input className="form-control" name={name} value={productoEditando[name]} onChange={e => setProductoEditando({ ...productoEditando, [e.target.name]: e.target.value })} required />
                  </div>
                ))}
                <div className="row">
                  {[["tamano", "Tamaño"], ["porcion", "Porción"], ["energia", "Energía"], ["grasa", "Grasa"], ["sodio", "Sodio"], ["carbohidratos", "Carbohidratos"], ["proteina", "Proteína"], ["calcio", "Calcio"], ["hierro", "Hierro"]].map(([name, label]) => (
                    <div className="col-6 mb-3" key={name}>
                      <label className="form-label">{label}</label>
                      <input type="number" className="form-control" name={name} value={productoEditando[name]} onChange={e => setProductoEditando({ ...productoEditando, [e.target.name]: e.target.value })} required />
                    </div>
                  ))}
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-success">Guardar cambios</button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setProductoEditando(null)}>Cancelar</button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0 p-4">
            <h2 className="h4 mb-3">Agregar producto</h2>
            <form onSubmit={crearProducto}>
              {[["codigo", "Código"], ["descripcion", "Descripción"]].map(([name, label]) => (
                <div className="mb-3" key={name}>
                  <label className="form-label">{label}</label>
                  <input className="form-control" name={name} value={nuevoProducto[name]} onChange={e => setNuevoProducto({ ...nuevoProducto, [e.target.name]: e.target.value })} required />
                </div>
              ))}
              <div className="row">
                {[["tamano", "Tamaño"], ["porcion", "Porción"], ["energia", "Energía"], ["grasa", "Grasa"], ["sodio", "Sodio"], ["carbohidratos", "Carbohidratos"], ["proteina", "Proteína"], ["calcio", "Calcio"], ["hierro", "Hierro"]].map(([name, label]) => (
                  <div className="col-6 mb-3" key={name}>
                    <label className="form-label">{label}</label>
                    <input type="number" className="form-control" name={name} value={nuevoProducto[name]} onChange={e => setNuevoProducto({ ...nuevoProducto, [e.target.name]: e.target.value })} required />
                  </div>
                ))}
              </div>
              <h3 className="h6 text-secondary mt-3">Vitaminas</h3>
              {vitaminas.map((vitamina, index) => (
                <div className="row mb-2" key={index}>
                  <div className="col-8">
                    <input className="form-control" name="nombre" placeholder="Ej: Vitamina C" value={vitamina.nombre} onChange={e => { const v = [...vitaminas]; v[index].nombre = e.target.value; setVitaminas(v); }} />
                  </div>
                  <div className="col-4">
                    <button type="button" className="btn btn-outline-danger w-100" onClick={() => setVitaminas(vitaminas.filter((_, i) => i !== index))}>X</button>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-outline-primary w-100 mb-3" onClick={() => setVitaminas([...vitaminas, { nombre: "" }])}>Agregar vitamina</button>
              <button type="submit" className="btn btn-success w-100">Guardar producto</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Productos;