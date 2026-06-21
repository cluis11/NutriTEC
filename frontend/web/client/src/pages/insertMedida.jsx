import React, { useState, useEffect } from "react";

const MedidasPersonales = () => {
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario")) || {};
  const idUsuario = usuarioLogueado.id_usuario || 4;

  const [form, setForm] = useState({
    id_usuario: idUsuario,
    fecha: new Date().toISOString().split('T')[0],
    cintura: "",
    cuello: "",
    caderas: "",
    p_musculo: "",
    p_grasa: ""
  });

  const [medidas, setMedidas] = useState([]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const cargarMedidas = async () => {
    try {
      const response = await fetch(`http://localhost:5108/api/medida/usuario/${idUsuario}`);
      if (response.ok) {
        const data = await response.json();
        setMedidas(data);
      }
    } catch (error) {
      console.error("Error al cargar historial de medidas:", error);
    }
  };

  useEffect(() => {
    cargarMedidas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let fechaValida = form.fecha;
      if (fechaValida) {
        const fechaObj = new Date(fechaValida);
        if (!isNaN(fechaObj.getTime())) {
          fechaValida = fechaObj.toISOString();
        }
      }

      const datosFormateados = {
        id_usuario: idUsuario,
        fecha: fechaValida,
        cintura: parseFloat(form.cintura) || 0.0,
        cuello: parseFloat(form.cuello) || 0.0,
        caderas: parseFloat(form.caderas) || 0.0,
        p_musculo: parseFloat(form.p_musculo) || 0.0,
        p_grasa: parseFloat(form.p_grasa) || 0.0
      };

      const response = await fetch("http://localhost:5108/api/medida", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosFormateados)
      });

      if (response.ok) {
        alert("Medida corporal registrada correctamente.");
        setForm({
          id_usuario: idUsuario,
          fecha: new Date().toISOString().split('T')[0],
          cintura: "", cuello: "", caderas: "", p_musculo: "", p_grasa: ""
        });
        cargarMedidas();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Error en el servidor: ${response.status} - ${errorData.message || 'Error interno'}`);
      }
    } catch (error) {
      console.error("Error al enviar la medida:", error);
      alert("Error de red o conexión.");
    }
  };

  return (
    <div className="container-fluid p-3" style={{ fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <div className="card border-0 shadow-sm p-4 bg-white rounded-4">
        <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-light">
          <h4 className="fw-bold mb-0" style={{ color: "#0f172a" }}>Registro de Medidas Corporales</h4>
        </div>
        <form onSubmit={handleSubmit} className="small">
          <div className="row g-4">
            <div className="col-12 col-md-7 border-end border-light-subtle pe-md-4">
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary mb-1">Fecha del Control</label>
                <input type="date" name="fecha" className="form-control bg-light border-0 px-3 py-2"
                  style={{ borderRadius: "8px" }} value={form.fecha} onChange={handleChange} required />
              </div>
              <div className="row g-3">
                {[["cintura", "Cintura"], ["cuello", "Cuello"], ["caderas", "Caderas"]].map(([name, label]) => (
                  <div className="col-12 col-sm-4" key={name}>
                    <label className="form-label fw-semibold text-secondary mb-1">{label}</label>
                    <div className="input-group">
                      <input type="number" step="0.1" name={name} placeholder="0.0"
                        className="form-control bg-light border-0 py-2 ps-3"
                        style={{ borderRadius: "8px 0 0 8px" }}
                        value={form[name]} onChange={handleChange} required />
                      <span className="input-group-text bg-light border-0 text-muted fw-medium"
                        style={{ borderRadius: "0 8px 8px 0", fontSize: "0.75rem" }}>cm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-12 col-md-5 d-flex flex-column justify-content-between ps-md-4">
              <div className="row g-3">
                {[["p_musculo", "Músculo", "%"], ["p_grasa", "Grasa Corporal", "%"]].map(([name, label, unit]) => (
                  <div className="col-6" key={name}>
                    <label className="form-label fw-semibold text-secondary mb-1">{label}</label>
                    <div className="input-group">
                      <input type="number" step="0.1" name={name} placeholder="0.0"
                        className="form-control bg-light border-0 py-2 ps-3"
                        style={{ borderRadius: "8px 0 0 8px" }}
                        value={form[name]} onChange={handleChange} required />
                      <span className="input-group-text bg-light border-0 text-muted fw-medium"
                        style={{ borderRadius: "0 8px 8px 0", fontSize: "0.75rem" }}>{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 mt-md-0">
                <button type="submit" className="btn text-white w-100 fw-medium shadow-sm"
                  style={{ backgroundColor: "#1abc9c", borderRadius: "8px", border: "none", fontSize: "0.85rem" }}>
                  Guardar Medida
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedidasPersonales;