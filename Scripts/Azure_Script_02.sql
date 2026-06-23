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

-- ------------------------------------------------------------
-- PRODUCTOS BASE (10 productos aprobados por defecto)
-- Registrados por el nutricionista base (id_usuario = 1)
-- Distintos a los del script de datos de prueba
-- ------------------------------------------------------------

INSERT INTO Producto (id_usuario, Codigo, Descripcion, Tamano, Porcion, Energia, Grasa, Sodio, Carbohidratos, Proteina, Calcio, Hierro, Estado) VALUES
(1, '8800001', 'Huevo entero cocido',        50.0,  50.0,  78.0,  5.3,  62.0,  0.6,  6.3,  25.0, 0.9, 'aprobado'),
(1, '8800002', 'Avena en hojuelas',          40.0,  40.0, 148.0,  2.5,   2.0, 25.0,  5.4,  16.0, 1.7, 'aprobado'),
(1, '8800003', 'Yogur natural descremado',  150.0, 150.0,  83.0,  0.4,  65.0, 11.5,  8.5, 300.0, 0.1, 'aprobado'),
(1, '8800004', 'Pechuga de pavo',           100.0, 100.0, 135.0,  1.0,  63.0,   0.0, 30.0,  12.0, 1.4, 'aprobado'),
(1, '8800005', 'Espinacas frescas',          80.0,  80.0,  18.0,  0.3,  65.0,   2.9,  2.3,  99.0, 2.7, 'aprobado'),
(1, '8800006', 'Batata cocida',             130.0, 130.0, 112.0,  0.1,  73.0,  26.1,  2.1,  38.0, 0.7, 'aprobado'),
(1, '8800007', 'Salmón al horno',           100.0, 100.0, 206.0, 13.0,  59.0,   0.0, 20.0,   9.0, 0.3, 'aprobado'),
(1, '8800008', 'Almendras',                  28.0,  28.0, 164.0, 14.0,   0.0,   6.1,  6.0,  76.0, 1.0, 'aprobado'),
(1, '8800009', 'Manzana con cáscara',       150.0, 150.0,  78.0,  0.2,   1.0,  20.7,  0.4,   8.0, 0.2, 'aprobado'),
(1, '8800010', 'Lentejas cocidas',          100.0, 100.0, 116.0,  0.4,   2.0,  20.0,  9.0,  19.0, 3.3, 'aprobado');

INSERT INTO VitaminasxProducto (id_producto, Vitamina) VALUES
(1, 'B12'), (1, 'D'),
(2, 'B1'), (2, 'B5'),
(3, 'B12'), (3, 'B2'),
(4, 'B3'), (4, 'B6'),
(5, 'A'), (5, 'C'), (5, 'K'),
(6, 'A'), (6, 'B6'), (6, 'C'),
(7, 'B12'), (7, 'D'),
(8, 'E'), (8, 'B2'),
(9, 'C'), (9, 'K'),
(10, 'B1'), (10, 'B9');