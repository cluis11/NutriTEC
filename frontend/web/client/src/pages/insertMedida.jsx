import React, { useState, useEffect } from "react";

const MedidasPersonales = () => {
  // 0. Intentamos obtener el usuario logueado desde el localStorage
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuario")) || {};
  // 1. Estado inicial
  const [form, setForm] = useState({
    id_usuario: usuarioLogueado.id || 4, // ID de usuario o uno por default
    fecha: new Date().toISOString().split('T')[0], // Fecha de hoy por default
    cintura: "",
    cuello: "",
    caderas: "",
    p_musculo: "",
    p_grasa: ""
  });

  const [medidas, setMedidas] = useState([]);

  //Manejo de imputs
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  //Get medidas
  const cargarMedidas = async () => {
    try {
      const response = await fetch("http://localhost:5108/api/medida/usuario/1");
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

  //Post medida
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Convertimos la fecha en objeto DateTime 
      let fechaValida = form.fecha;
      if (fechaValida) {
        const fechaObj = new Date(fechaValida);
        if (!isNaN(fechaObj.getTime())) {
          fechaValida = fechaObj.toISOString(); 
        }
      }

      // 2. Si está vacío, envía 0
      const datosFormateados = {
        id_usuario: parseInt(form.id_usuario) || 1,
        fecha: fechaValida,
        cintura: parseFloat(form.cintura) || 0.0,
        cuello: parseFloat(form.cuello) || 0.0,
        caderas: parseFloat(form.caderas) || 0.0,
        p_musculo: parseFloat(form.p_musculo) || 0.0,
        p_grasa: parseFloat(form.p_grasa) || 0.0
      };
      
      const response = await fetch("http://localhost:5108/api/medida", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datosFormateados)
      });

      if (response.ok) {
        alert("Medida corporal registrada correctamente.");
        setForm({
          id_usuario: usuarioLogueado.id || 4,
          fecha: new Date().toISOString().split('T')[0],
          cintura: "",
          cuello: "",
          caderas: "",
          p_musculo: "",
          p_grasa: ""
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
          <div className="p-2.5 rounded-3 text-white me-3" style={{ backgroundColor: "#1abc9c" }}>
          </div>
          <div>
            <h4 className="fw-bold mb-0" style={{ color: "#0f172a" }}>Registro de Medidas Corporales</h4>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="small">
          <div className="row g-4">
            
            {/* SECCIÓN IZQUIERDA: CONTROL DE TIEMPO Y DIMENSIONES */}
            <div className="col-12 col-md-7 border-end border-light-subtle pe-md-4">
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary mb-1">Fecha del Control</label>
                <input 
                  type="date" 
                  name="fecha" 
                  className="form-control bg-light border-0 px-3 py-2" 
                  style={{ borderRadius: "8px" }}
                  value={form.fecha}
                  onChange={handleChange} 
                  required 
                />
              </div> 
              <div className="row g-3">
                <div className="col-12 col-sm-4">
                  <label className="form-label fw-semibold text-secondary mb-1">Cintura</label>
                  <div className="input-group">
                    <input 
                      type="number" step="0.1" name="cintura" placeholder="0.0"
                      className="form-control bg-light border-0 py-2 ps-3" 
                      style={{ borderRadius: "8px 0 0 8px" }}
                      value={form.cintura} onChange={handleChange} required
                    />
                    <span className="input-group-text bg-light border-0 text-muted px-2.5 fw-medium" style={{ borderRadius: "0 8px 8px 0", fontSize: "0.75rem" }}>cm</span>
                  </div>
                </div>

                <div className="col-12 col-sm-4">
                  <label className="form-label fw-semibold text-secondary mb-1">Cuello</label>
                  <div className="input-group">
                    <input 
                      type="number" step="0.1" name="cuello" placeholder="0.0"
                      className="form-control bg-light border-0 py-2 ps-3" 
                      style={{ borderRadius: "8px 0 0 8px" }}
                      value={form.cuello} onChange={handleChange} required
                    />
                    <span className="input-group-text bg-light border-0 text-muted px-2.5 fw-medium" style={{ borderRadius: "0 8px 8px 0", fontSize: "0.75rem" }}>cm</span>
                  </div>
                </div>

                <div className="col-12 col-sm-4">
                  <label className="form-label fw-semibold text-secondary mb-1">Caderas</label>
                  <div className="input-group">
                    <input 
                      type="number" step="0.1" name="caderas" placeholder="0.0"
                      className="form-control bg-light border-0 py-2 ps-3" 
                      style={{ borderRadius: "8px 0 0 8px" }}
                      value={form.caderas} onChange={handleChange} required
                    />
                    <span className="input-group-text bg-light border-0 text-muted px-2.5 fw-medium" style={{ borderRadius: "0 8px 8px 0", fontSize: "0.75rem" }}>cm</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-5 d-flex flex-column justify-content-between ps-md-4">
              <div>                
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label fw-semibold text-secondary mb-1">Músculo</label>
                    <div className="input-group">
                      <input 
                        type="number" step="0.1" name="p_musculo" placeholder="0.0"
                        className="form-control bg-light border-0 py-2 ps-3" 
                        style={{ borderRadius: "8px 0 0 8px" }}
                        value={form.p_musculo} onChange={handleChange} required
                      />
                      <span className="input-group-text bg-light border-0 text-muted px-2.5 fw-medium" style={{ borderRadius: "0 8px 8px 0", fontSize: "0.75rem" }}>%</span>
                    </div>
                  </div>

                  <div className="col-6">
                    <label className="form-label fw-semibold text-secondary mb-1">Grasa Corporal</label>
                    <div className="input-group">
                      <input 
                        type="number" step="0.1" name="p_grasa" placeholder="0.0"
                        className="form-control bg-light border-0 py-2 ps-3" 
                        style={{ borderRadius: "8px 0 0 8px" }}
                        value={form.p_grasa} onChange={handleChange} required
                      />
                      <span className="input-group-text bg-light border-0 text-muted px-2.5 fw-medium" style={{ borderRadius: "0 8px 8px 0", fontSize: "0.75rem" }}>%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 mt-md-0">
                <button 
                  type="submit" 
                  className="btn text-white w-100 py-2.5 fw-medium shadow-sm transition-all" 
                  style={{ backgroundColor: "#1abc9c", borderRadius: "8px", border: "none", fontSize: "0.85rem" }}
                >
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