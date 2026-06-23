import React, { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

// ─── REGISTRO CLIENTE ─────────────────────────────────────────────────────────
const RegistroClienteForm = ({ onVolver }) => {
  const [form, setForm] = useState({
    correo: "", contrasena: "", nombre: "", ap1: "", ap2: "",
    fecha_nacimiento: "", peso: "", altura: "", pais: "", consumo_maximo: ""
  });
  const [mostrarPass, setMostrarPass] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/cliente/registro`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, peso: parseFloat(form.peso), altura: parseFloat(form.altura), consumo_maximo: parseFloat(form.consumo_maximo) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error al registrarse");
      alert("Registro exitoso. Ahora podés iniciar sesión.");
      onVolver();
    } catch (err) { setError(err.message); }
    finally { setCargando(false); }
  };

  return (
    <div style={styles.card}>
      <div style={styles.logoArea}>
        <div style={styles.logoCircle}>🥗</div>
        <h2 style={styles.brand}>NutriTEC</h2>
        <p style={styles.subtitle}>Crear cuenta — Cliente</p>
      </div>
      {error && <div style={styles.errorBanner}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={styles.row}>
          <div style={styles.col}><label style={styles.label}>Nombre</label>
            <input name="nombre" required style={styles.input} placeholder="Laura" value={form.nombre} onChange={handleChange} /></div>
          <div style={styles.col}><label style={styles.label}>Primer apellido</label>
            <input name="ap1" required style={styles.input} placeholder="Méndez" value={form.ap1} onChange={handleChange} /></div>
        </div>
        <div style={styles.row}>
          <div style={styles.col}><label style={styles.label}>Segundo apellido</label>
            <input name="ap2" style={styles.input} placeholder="Solís" value={form.ap2} onChange={handleChange} /></div>
          <div style={styles.col}><label style={styles.label}>Fecha de nacimiento</label>
            <input name="fecha_nacimiento" type="date" required style={styles.input} value={form.fecha_nacimiento} onChange={handleChange} /></div>
        </div>
        <div style={styles.fieldGroup}><label style={styles.label}>Correo electrónico</label>
          <input name="correo" type="email" required style={styles.input} placeholder="correo@ejemplo.com" value={form.correo} onChange={handleChange} /></div>
        <div style={styles.fieldGroup}><label style={styles.label}>Contraseña</label>
          <div style={styles.passWrap}>
            <input name="contrasena" type={mostrarPass ? "text" : "password"} required style={{ ...styles.input, paddingRight: "44px" }} placeholder="Mínimo 8 caracteres" value={form.contrasena} onChange={handleChange} />
            <button type="button" style={styles.eyeBtn} onClick={() => setMostrarPass(!mostrarPass)}>{mostrarPass ? "🙈" : "👁️"}</button>
          </div>
        </div>
        <div style={styles.row}>
          <div style={styles.col}><label style={styles.label}>Peso (kg)</label>
            <input name="peso" type="number" step="0.1" required style={styles.input} placeholder="70.0" value={form.peso} onChange={handleChange} /></div>
          <div style={styles.col}><label style={styles.label}>Altura (m)</label>
            <input name="altura" type="number" step="0.01" required style={styles.input} placeholder="1.70" value={form.altura} onChange={handleChange} /></div>
        </div>
        <div style={styles.row}>
          <div style={styles.col}><label style={styles.label}>País de residencia</label>
            <input name="pais" required style={styles.input} placeholder="Costa Rica" value={form.pais} onChange={handleChange} /></div>
          <div style={styles.col}><label style={styles.label}>Meta calórica diaria (kcal)</label>
            <input name="consumo_maximo" type="number" required style={styles.input} placeholder="2000" value={form.consumo_maximo} onChange={handleChange} /></div>
        </div>
        <button type="submit" style={styles.btnPrimary} disabled={cargando}>{cargando ? "Registrando..." : "Crear cuenta"}</button>
      </form>
      <button style={styles.linkBtn} onClick={onVolver}>← Volver al inicio de sesión</button>
    </div>
  );
};

// ─── REGISTRO NUTRICIONISTA ───────────────────────────────────────────────────
const RegistroNutriForm = ({ onVolver }) => {
  const [form, setForm] = useState({
    correo: "", contrasena: "", nombre: "", ap1: "", ap2: "",
    fecha_nacimiento: "", peso: "", altura: "",
    cedula: "", codigo: "", cobro: "mensual", tarjeta: "", direccion: "", foto: ""
  });
  const [mostrarPass, setMostrarPass] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError("La foto no puede pesar más de 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, foto: reader.result });
      setFotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/nutricionista/registro`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, peso: parseFloat(form.peso), altura: parseFloat(form.altura) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error al registrarse");
      alert("Registro exitoso. Ahora podés iniciar sesión.");
      onVolver();
    } catch (err) { setError(err.message); }
    finally { setCargando(false); }
  };

  return (
    <div style={styles.card}>
      <div style={styles.logoArea}>
        <div style={styles.logoCircle}>🥗</div>
        <h2 style={styles.brand}>NutriTEC</h2>
        <p style={styles.subtitle}>Crear cuenta — Nutricionista</p>
      </div>
      {error && <div style={styles.errorBanner}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={styles.row}>
          <div style={styles.col}><label style={styles.label}>Nombre</label>
            <input name="nombre" required style={styles.input} placeholder="Carlos" value={form.nombre} onChange={handleChange} /></div>
          <div style={styles.col}><label style={styles.label}>Primer apellido</label>
            <input name="ap1" required style={styles.input} placeholder="Rojas" value={form.ap1} onChange={handleChange} /></div>
        </div>
        <div style={styles.row}>
          <div style={styles.col}><label style={styles.label}>Segundo apellido</label>
            <input name="ap2" style={styles.input} placeholder="Mora" value={form.ap2} onChange={handleChange} /></div>
          <div style={styles.col}><label style={styles.label}>Fecha de nacimiento</label>
            <input name="fecha_nacimiento" type="date" required style={styles.input} value={form.fecha_nacimiento} onChange={handleChange} /></div>
        </div>
        <div style={styles.fieldGroup}><label style={styles.label}>Correo electrónico</label>
          <input name="correo" type="email" required style={styles.input} placeholder="correo@ejemplo.com" value={form.correo} onChange={handleChange} /></div>
        <div style={styles.fieldGroup}><label style={styles.label}>Contraseña</label>
          <div style={styles.passWrap}>
            <input name="contrasena" type={mostrarPass ? "text" : "password"} required style={{ ...styles.input, paddingRight: "44px" }} placeholder="Mínimo 8 caracteres" value={form.contrasena} onChange={handleChange} />
            <button type="button" style={styles.eyeBtn} onClick={() => setMostrarPass(!mostrarPass)}>{mostrarPass ? "🙈" : "👁️"}</button>
          </div>
        </div>
        <div style={styles.row}>
          <div style={styles.col}><label style={styles.label}>Peso (kg)</label>
            <input name="peso" type="number" step="0.1" required style={styles.input} placeholder="70.0" value={form.peso} onChange={handleChange} /></div>
          <div style={styles.col}><label style={styles.label}>Altura (m)</label>
            <input name="altura" type="number" step="0.01" required style={styles.input} placeholder="1.70" value={form.altura} onChange={handleChange} /></div>
        </div>
        <div style={styles.row}>
          <div style={styles.col}><label style={styles.label}>Cédula</label>
            <input name="cedula" required style={styles.input} placeholder="1-0234-0567" value={form.cedula} onChange={handleChange} /></div>
          <div style={styles.col}><label style={styles.label}>Código</label>
            <input name="codigo" required style={styles.input} placeholder="NUT-001" value={form.codigo} onChange={handleChange} /></div>
        </div>
        <div style={styles.row}>
          <div style={styles.col}><label style={styles.label}>Tipo de cobro</label>
            <select name="cobro" required style={styles.input} value={form.cobro} onChange={handleChange}>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>
          </div>
          <div style={styles.col}><label style={styles.label}>Tarjeta</label>
            <input name="tarjeta" required style={styles.input} placeholder="4532015112830366" value={form.tarjeta} onChange={handleChange} /></div>
        </div>
        <div style={styles.fieldGroup}><label style={styles.label}>Dirección</label>
          <input name="direccion" required style={styles.input} placeholder="San José, Costa Rica" value={form.direccion} onChange={handleChange} /></div>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Foto de perfil (opcional, máx 1 MB)</label>
          <input type="file" accept="image/*" onChange={handleFotoChange} style={{ ...styles.input, padding: "8px" }} />
          {fotoPreview && (
            <div style={{ marginTop: "10px", textAlign: "center" }}>
              <img src={fotoPreview} alt="Preview" style={{ maxWidth: "100px", maxHeight: "100px", borderRadius: "50%", border: "2px solid #1abc9c" }} />
            </div>
          )}
        </div>
        <button type="submit" style={styles.btnPrimary} disabled={cargando}>{cargando ? "Registrando..." : "Crear cuenta"}</button>
      </form>
      <button style={styles.linkBtn} onClick={onVolver}>← Volver al inicio de sesión</button>
    </div>
  );
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const LoginForm = ({ onLoginExitoso, onRegistroCliente, onRegistroNutri }) => {
  const [form, setForm] = useState({ correo: "", contrasena: "" });
  const [mostrarPass, setMostrarPass] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.correo || !form.contrasena) { setError("Completá todos los campos."); return; }
    setError(""); setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Credenciales inválidas");
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data));
      onLoginExitoso(data);
    } catch (err) { setError(err.message); }
    finally { setCargando(false); }
  };

  return (
    <div style={styles.card}>
      <div style={styles.logoArea}>
        <div style={styles.logoCircle}>🥗</div>
        <h2 style={styles.brand}>NutriTEC</h2>
        <p style={styles.subtitle}>Tu compañero de nutrición</p>
      </div>
      {error && <div style={styles.errorBanner}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={styles.fieldGroup}><label style={styles.label}>Correo electrónico</label>
          <input name="correo" type="email" required style={styles.input} placeholder="correo@ejemplo.com" value={form.correo} onChange={handleChange} /></div>
        <div style={styles.fieldGroup}><label style={styles.label}>Contraseña</label>
          <div style={styles.passWrap}>
            <input name="contrasena" type={mostrarPass ? "text" : "password"} required style={{ ...styles.input, paddingRight: "44px" }} placeholder="Tu contraseña" value={form.contrasena} onChange={handleChange} />
            <button type="button" style={styles.eyeBtn} onClick={() => setMostrarPass(!mostrarPass)}>{mostrarPass ? "🙈" : "👁️"}</button>
          </div>
        </div>
        <button type="submit" style={styles.btnPrimary} disabled={cargando}>{cargando ? "Ingresando..." : "Iniciar sesión"}</button>
      </form>
      <div style={styles.divider}><span>¿No tenés cuenta?</span></div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button style={{ ...styles.btnSecondary, flex: 1 }} onClick={onRegistroCliente}>Soy Cliente</button>
        <button style={{ ...styles.btnSecondary, flex: 1 }} onClick={onRegistroNutri}>Soy Nutricionista</button>
      </div>
    </div>
  );
};

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
const Login = ({ onLoginExitoso }) => {
  const [vista, setVista] = useState("login");

  return (
    <div style={styles.pageContainer}>
      {vista === "registro-cliente" && <RegistroClienteForm onVolver={() => setVista("login")} />}
      {vista === "registro-nutri" && <RegistroNutriForm onVolver={() => setVista("login")} />}
      {vista === "login" && (
        <LoginForm
          onLoginExitoso={onLoginExitoso}
          onRegistroCliente={() => setVista("registro-cliente")}
          onRegistroNutri={() => setVista("registro-nutri")}
        />
      )}
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "24px 16px", fontFamily: "'Segoe UI', Roboto, sans-serif"
  },
  card: {
    background: "#fff", borderRadius: "16px", padding: "40px 36px",
    width: "100%", maxWidth: "480px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
  },
  logoArea: { textAlign: "center", marginBottom: "28px" },
  logoCircle: { fontSize: "40px", marginBottom: "8px" },
  brand: { fontSize: "26px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0" },
  subtitle: { color: "#64748b", fontSize: "14px", margin: 0 },
  errorBanner: {
    background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626",
    borderRadius: "8px", padding: "10px 14px", fontSize: "13px", marginBottom: "16px"
  },
  fieldGroup: { marginBottom: "16px" },
  row: { display: "flex", gap: "12px", marginBottom: "16px" },
  col: { flex: 1 },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
  input: {
    width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0",
    borderRadius: "8px", fontSize: "14px", color: "#0f172a",
    background: "#f8fafc", outline: "none", boxSizing: "border-box"
  },
  passWrap: { position: "relative" },
  eyeBtn: {
    position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", fontSize: "16px", padding: "4px"
  },
  btnPrimary: {
    width: "100%", padding: "12px", background: "#1abc9c", color: "#fff",
    border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600",
    cursor: "pointer", marginTop: "8px"
  },
  btnSecondary: {
    padding: "12px", background: "#f8fafc", color: "#1abc9c",
    border: "2px solid #1abc9c", borderRadius: "8px", fontSize: "14px",
    fontWeight: "600", cursor: "pointer"
  },
  divider: { textAlign: "center", color: "#94a3b8", fontSize: "13px", margin: "16px 0" },
  linkBtn: {
    width: "100%", background: "none", border: "none", color: "#1abc9c",
    cursor: "pointer", fontSize: "14px", marginTop: "16px", padding: "8px"
  }
};

export default Login;