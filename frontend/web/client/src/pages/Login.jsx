import React, { useState } from "react";

const API_URL = "http://localhost:5108";

// ─── REGISTRO ─────────────────────────────────────────────────────────────────
const RegistroForm = ({ onVolver }) => {
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
    setError("");
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/cliente/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          peso: parseFloat(form.peso),
          altura: parseFloat(form.altura),
          consumo_maximo: parseFloat(form.consumo_maximo)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error al registrarse");
      alert("Registro exitoso. Ahora podés iniciar sesión.");
      onVolver();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.logoArea}>
        <div style={styles.logoCircle}>🥗</div>
        <h2 style={styles.brand}>NutriTEC</h2>
        <p style={styles.subtitle}>Crear cuenta</p>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={styles.row}>
          <div style={styles.col}>
            <label style={styles.label}>Nombre</label>
            <input name="nombre" required style={styles.input} placeholder="Laura"
              value={form.nombre} onChange={handleChange} />
          </div>
          <div style={styles.col}>
            <label style={styles.label}>Primer apellido</label>
            <input name="ap1" required style={styles.input} placeholder="Méndez"
              value={form.ap1} onChange={handleChange} />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.col}>
            <label style={styles.label}>Segundo apellido</label>
            <input name="ap2" style={styles.input} placeholder="Solís"
              value={form.ap2} onChange={handleChange} />
          </div>
          <div style={styles.col}>
            <label style={styles.label}>Fecha de nacimiento</label>
            <input name="fecha_nacimiento" type="date" required style={styles.input}
              value={form.fecha_nacimiento} onChange={handleChange} />
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Correo electrónico</label>
          <input name="correo" type="email" required style={styles.input}
            placeholder="correo@ejemplo.com" value={form.correo} onChange={handleChange} />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Contraseña</label>
          <div style={styles.passWrap}>
            <input name="contrasena" type={mostrarPass ? "text" : "password"} required
              style={{ ...styles.input, paddingRight: "44px" }}
              placeholder="Mínimo 8 caracteres" value={form.contrasena} onChange={handleChange} />
            <button type="button" style={styles.eyeBtn} onClick={() => setMostrarPass(!mostrarPass)}>
              {mostrarPass ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.col}>
            <label style={styles.label}>Peso (kg)</label>
            <input name="peso" type="number" step="0.1" required style={styles.input}
              placeholder="70.0" value={form.peso} onChange={handleChange} />
          </div>
          <div style={styles.col}>
            <label style={styles.label}>Altura (m)</label>
            <input name="altura" type="number" step="0.01" required style={styles.input}
              placeholder="1.70" value={form.altura} onChange={handleChange} />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.col}>
            <label style={styles.label}>País de residencia</label>
            <input name="pais" required style={styles.input}
              placeholder="Costa Rica" value={form.pais} onChange={handleChange} />
          </div>
          <div style={styles.col}>
            <label style={styles.label}>Meta calórica diaria (kcal)</label>
            <input name="consumo_maximo" type="number" required style={styles.input}
              placeholder="2000" value={form.consumo_maximo} onChange={handleChange} />
          </div>
        </div>

        <button type="submit" style={styles.btnPrimary} disabled={cargando}>
          {cargando ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>

      <button style={styles.linkBtn} onClick={onVolver}>
        ← Volver al inicio de sesión
      </button>
    </div>
  );
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const LoginForm = ({ onLoginExitoso, onRegistro }) => {
  const [form, setForm] = useState({ correo: "", contrasena: "" });
  const [mostrarPass, setMostrarPass] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.correo || !form.contrasena) {
      setError("Completá todos los campos.");
      return;
    }
    setError("");
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Credenciales inválidas");
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data));
      onLoginExitoso(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
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
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Correo electrónico</label>
          <input name="correo" type="email" required style={styles.input}
            placeholder="correo@ejemplo.com" value={form.correo} onChange={handleChange} />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Contraseña</label>
          <div style={styles.passWrap}>
            <input name="contrasena" type={mostrarPass ? "text" : "password"} required
              style={{ ...styles.input, paddingRight: "44px" }}
              placeholder="Tu contraseña" value={form.contrasena} onChange={handleChange} />
            <button type="button" style={styles.eyeBtn} onClick={() => setMostrarPass(!mostrarPass)}>
              {mostrarPass ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <button type="submit" style={styles.btnPrimary} disabled={cargando}>
          {cargando ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>

      <div style={styles.divider}><span>¿No tenés cuenta?</span></div>

      <button style={styles.btnSecondary} onClick={onRegistro}>
        Crear cuenta
      </button>
    </div>
  );
};

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
const Login = ({ onLoginExitoso }) => {
  const [vista, setVista] = useState("login");

  return (
    <div style={styles.pageContainer}>
      {vista === "registro"
        ? <RegistroForm onVolver={() => setVista("login")} />
        : <LoginForm onLoginExitoso={onLoginExitoso} onRegistro={() => setVista("registro")} />
      }
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "'Segoe UI', Roboto, sans-serif"
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
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
    width: "100%", padding: "12px", background: "#f8fafc", color: "#1abc9c",
    border: "2px solid #1abc9c", borderRadius: "8px", fontSize: "15px",
    fontWeight: "600", cursor: "pointer"
  },
  divider: { textAlign: "center", color: "#94a3b8", fontSize: "13px", margin: "16px 0" },
  linkBtn: {
    width: "100%", background: "none", border: "none", color: "#1abc9c",
    cursor: "pointer", fontSize: "14px", marginTop: "16px", padding: "8px"
  }
};

export default Login;