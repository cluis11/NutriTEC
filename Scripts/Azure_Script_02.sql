-- ============================================================
-- NutriTEC - Script 02: Población inicial
-- Solo datos mínimos requeridos para el funcionamiento
-- ============================================================

-- ------------------------------------------------------------
-- ADMIN
-- ------------------------------------------------------------

INSERT INTO Admin (Correo, Contrasena) VALUES
('admin@nutritec.com', 'Admin2026!');

-- ------------------------------------------------------------
-- NUTRICIONISTA BASE
-- ------------------------------------------------------------

INSERT INTO Usuario (Correo, Contrasena, Nombre, Ap1, Ap2, Fecha_nacimiento, Peso, Altura) VALUES
('laura.mendez@nutritec.com', 'Nutri2026!', 'Laura', 'Méndez', 'Solís', '1985-03-12', 62.0, 1.65);

INSERT INTO Nutricionista (id_usuario, Cedula, Codigo, Cobro, Tarjeta, Foto, Direccion) VALUES
(1, '1-0234-0567', 'NUT-001', 'mensual', '4532015112830366', NULL, 'San José, Costa Rica');

-- ------------------------------------------------------------
-- CLIENTE BASE
-- ------------------------------------------------------------

INSERT INTO Usuario (Correo, Contrasena, Nombre, Ap1, Ap2, Fecha_nacimiento, Peso, Altura) VALUES
('diego.vargas@gmail.com', 'Cliente2026!', 'Diego', 'Vargas', 'Castro', '1995-01-15', 75.0, 1.80);

INSERT INTO Cliente (id_usuario, Pais, Consumo_maximo) VALUES
(2, 'Costa Rica', 2000.00);
