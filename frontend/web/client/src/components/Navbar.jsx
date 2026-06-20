import React from "react";

const Navbar = ({ onVerPerfil }) => {
  const usuario = JSON.parse(localStorage.getItem("usuario")) || {};

  return (
    <nav style={styles.navbar}>
      <div style={styles.navBrand}>
        <span style={styles.navLogo}>🥗</span>
        <span style={styles.navTitle}>NutriTEC</span>
      </div>
      <div style={styles.navRight}>
        <button style={styles.navUserBtn} onClick={onVerPerfil}>
          <div style={styles.navAvatar}>
            {usuario.nombre?.[0]?.toUpperCase() || "U"}
          </div>
          <span style={styles.navNombre}>{usuario.nombre} {usuario.ap1}</span>
          <span style={{ color: "#94a3b8", fontSize: "12px" }}>▼</span>
        </button>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    background: "#fff",
    borderBottom: "1px solid #f1f5f9",
    padding: "0 24px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    fontFamily: "'Segoe UI', Roboto, sans-serif"
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  navLogo: {
    fontSize: "24px"
  },
  navTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a"
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  navUserBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    padding: "6px 14px 6px 6px",
    cursor: "pointer"
  },
  navAvatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "#1abc9c",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700"
  },
  navNombre: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a"
  }
};

export default Navbar;