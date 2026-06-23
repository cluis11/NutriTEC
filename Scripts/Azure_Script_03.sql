-- ============================================================
-- NutriTEC - Script 03: Datos de prueba
-- Datos para desarrollo y testing de cada módulo
-- Nota: Los usuarios base (id 1 y 2) vienen del Script 02
--       Los usuarios adicionales aquí empiezan desde id 3
-- ============================================================


-- ------------------------------------------------------------
-- USUARIOS ADICIONALES
-- ------------------------------------------------------------

-- Nutricionistas adicionales
INSERT INTO Usuario (Correo, Contrasena, Nombre, Ap1, Ap2, Fecha_nacimiento, Peso, Altura) VALUES
('carlos.rojas@nutritec.com', 'Nutri2026!', 'Carlos', 'Rojas',  'Mora',   '1979-07-24', 78.0, 1.77),
('ana.solis@nutritec.com',    'Nutri2026!', 'Ana',    'Solís',  'Vargas', '1990-11-05', 58.0, 1.65);

INSERT INTO Nutricionista (id_usuario, Cedula, Codigo, Cobro, Tarjeta, Foto, Direccion) VALUES
(3, '2-0345-0678', 'NUT-002', 'mensual', '4716158526571020', NULL, 'Cartago, Costa Rica'),
(4, '3-0456-0789', 'NUT-003', 'anual',   '4929420961105678', NULL, 'Heredia, Costa Rica');

-- Clientes adicionales
INSERT INTO Usuario (Correo, Contrasena, Nombre, Ap1, Ap2, Fecha_nacimiento, Peso, Altura) VALUES
('maria.castro@gmail.com',    'Cliente2026!', 'María',   'Castro',  'López',   '1998-06-20', 65.0, 1.64),
('sofia.mora@gmail.com',      'Cliente2026!', 'Sofía',   'Mora',    'Jiménez', '1993-09-08', 55.0, 1.63),
('juan.perez@gmail.com',      'Cliente2026!', 'Juan',    'Pérez',   'Alvarado','1988-04-30', 85.0, 1.80),
('lucia.gomez@gmail.com',     'Cliente2026!', 'Lucía',   'Gómez',   'Núñez',   '2000-12-01', 60.0, 1.65),
('pedro.alvarado@gmail.com',  'Cliente2026!', 'Pedro',   'Alvarado','Fallas',  '1992-08-17', 90.0, 1.81),
('valeria.nunez@gmail.com',   'Cliente2026!', 'Valeria', 'Núñez',   'Torres',  '1997-02-28', 68.0, 1.69),
('andres.jimenez@gmail.com',  'Cliente2026!', 'Andrés',  'Jiménez', 'Mora',    '1991-05-11', 80.0, 1.79),
('camila.torres@gmail.com',   'Cliente2026!', 'Camila',  'Torres',  'Rojas',   '1999-10-22', 57.0, 1.64),
('roberto.fallas@gmail.com',  'Cliente2026!', 'Roberto', 'Fallas',  'Soto',    '1986-07-03', 72.0, 1.75);

INSERT INTO Cliente (id_usuario, Pais, Consumo_maximo) VALUES
(5,  'Costa Rica', 1800.00),
(6,  'Costa Rica', 2200.00),
(7,  'Costa Rica', 2500.00),
(8,  'Costa Rica', 1900.00),
(9,  'Costa Rica', 2100.00),
(10, 'Costa Rica', 2300.00),
(11, 'Costa Rica', 1750.00),
(12, 'Costa Rica', 2000.00),
(13, 'Costa Rica', 1800.00);

-- ------------------------------------------------------------
-- ASOCIACIONES CLIENTE x NUTRICIONISTA
-- ------------------------------------------------------------

INSERT INTO ClientexNutricionista (id_cliente, id_nutricionista) VALUES
(2, 1), (5, 1), (6, 1),   -- Laura: Diego, María, Sofía
(7, 3), (8, 3),            -- Carlos: Juan, Lucía
(9, 4), (10, 4), (11, 4), (12, 4); -- Ana: Pedro, Valeria, Andrés, Camila

-- ------------------------------------------------------------
-- PRODUCTOS (IDs 11-20, distintos a los del Script 02)
-- ------------------------------------------------------------

INSERT INTO Producto (id_usuario, Codigo, Descripcion, Tamano, Porcion, Energia, Grasa, Sodio, Carbohidratos, Proteina, Calcio, Hierro, Estado) VALUES
(1, '7400001', 'Arroz blanco cocido',      100.0, 100.0, 130.0,  0.3,  1.0, 28.0,  2.7,  10.0, 0.2, 'aprobado'),
(1, '7400002', 'Frijoles negros cocidos',  100.0, 100.0, 132.0,  0.5,  1.0, 24.0,  8.9,  27.0, 2.1, 'aprobado'),
(1, '7400003', 'Pechuga de pollo',         100.0, 100.0, 165.0,  3.6, 74.0,  0.0, 31.0,   9.0, 0.7, 'aprobado'),
(1, '7400004', 'Pan integral',              30.0,  30.0,  80.0,  1.0,  0.0, 15.0,  3.0,  20.0, 1.0, 'aprobado'),
(3, '7400005', 'Leche semidescremada',     240.0, 240.0, 110.0,  2.5,  0.0, 13.0,  8.0, 300.0, 0.1, 'aprobado'),
(3, '7400006', 'Plátano maduro',           100.0, 100.0, 122.0,  0.4,  0.0, 31.0,  1.1,   5.0, 0.3, 'aprobado'),
(4, '7400007', 'Atún en agua',             100.0, 100.0, 116.0,  1.0,  0.0,  0.0, 25.0,  10.0, 1.0, 'aprobado'),
(4, '7400008', 'Aceite de oliva',           10.0,  10.0,  88.0, 10.0,  0.0,  0.0,  0.0,   0.0, 0.0, 'aprobado'),
(2, '7400009', 'Suplemento proteico XYZ',  30.0,  30.0, 120.0,  2.0, 50.0,  3.0, 25.0, 100.0, 2.0, 'pendiente'),
(5, '7400010', 'Barra energética ABC',      45.0,  45.0, 200.0,  7.0, 90.0, 28.0,  5.0,  50.0, 1.5, 'pendiente');

INSERT INTO VitaminasxProducto (id_producto, Vitamina) VALUES
(11,  'B1'), (11,  'B3'),
(12,  'B1'), (12,  'B6'), (12,  'C'),
(13,  'B3'), (13,  'B6'),
(14,  'B1'), (14,  'B2'), (14,  'E'),
(15,  'A'),  (15,  'D'),  (15,  'B12'),
(16,  'B6'), (16,  'C'),
(17,  'B3'), (17,  'B12'), (17,  'D'),
(18,  'E'),  (18,  'K'),
(19,  'B6'), (19,  'B12'),
(20,  'B1'), (20,  'B2'), (20,  'C');

-- ------------------------------------------------------------
-- RECETAS
-- ------------------------------------------------------------

INSERT INTO Receta (id_cliente, Nombre) VALUES
(2,  'Gallo Pinto'),
(5,  'Pollo con Arroz'),
(11, 'Sandwich de Atún');

INSERT INTO ProductoxReceta (id_receta, id_producto, Cantidad) VALUES
(1, 1, 100.0), (1, 2, 100.0),
(2, 3, 150.0), (2, 1, 100.0), (2, 8, 10.0),
(3, 7, 100.0), (3, 4, 60.0);

-- ------------------------------------------------------------
-- PLANES DE ALIMENTACION
-- ------------------------------------------------------------

INSERT INTO PlanAlimentacion (id_nutricionista, Nombre) VALUES
(1, 'Plan Pérdida de Peso'),
(3, 'Plan Mantenimiento'),
(4, 'Plan Ganancia Muscular');

INSERT INTO ProductoxPlan (id_plan, id_producto, Tiempo, Cantidad) VALUES
(1, 4, 'desayuno', 60.0), (1, 5, 'desayuno', 240.0),
(1, 6, 'merienda_manana', 100.0),
(1, 1, 'almuerzo', 100.0), (1, 3, 'almuerzo', 150.0),
(1, 6, 'merienda_tarde', 100.0),
(1, 2, 'cena', 100.0), (1, 4, 'cena', 30.0),
(2, 4, 'desayuno', 60.0), (2, 5, 'desayuno', 240.0),
(2, 7, 'merienda_manana', 100.0),
(2, 1, 'almuerzo', 150.0), (2, 3, 'almuerzo', 200.0),
(2, 6, 'merienda_tarde', 100.0),
(2, 1, 'cena', 100.0), (2, 2, 'cena', 100.0),
(3, 5, 'desayuno', 240.0), (3, 4, 'desayuno', 90.0),
(3, 7, 'merienda_manana', 150.0),
(3, 3, 'almuerzo', 250.0), (3, 1, 'almuerzo', 200.0),
(3, 6, 'merienda_tarde', 100.0),
(3, 3, 'cena', 200.0), (3, 2, 'cena', 150.0);

-- ------------------------------------------------------------
-- ASIGNACIONES PLAN x CLIENTE
-- ------------------------------------------------------------

INSERT INTO PlanxCliente (id_cliente, id_plan, Inicio, Fin) VALUES
(7,  2, '2026-05-01', '2026-07-01'),
(8,  1, '2026-03-01', '2026-05-01'),
(9,  3, '2026-07-01', '2026-09-01');

-- ------------------------------------------------------------
-- MEDIDAS CORPORALES
-- ------------------------------------------------------------

INSERT INTO Medida (id_usuario, Fecha, Cintura, Cuello, Caderas, P_musculo, P_grasa) VALUES
(10, '2026-05-01', 85.0, 35.0, 95.0, 35.0, 28.0),
(10, '2026-05-08', 84.0, 34.8, 94.5, 35.5, 27.5),
(10, '2026-05-15', 83.5, 34.5, 94.0, 36.0, 27.0),
(10, '2026-05-22', 82.0, 34.2, 93.0, 36.5, 26.5),
(10, '2026-06-01', 81.0, 34.0, 92.5, 37.0, 26.0),
(11, '2026-05-15', 90.0, 38.0, 98.0, 40.0, 22.0),
(11, '2026-06-01', 89.0, 37.5, 97.0, 40.5, 21.5);

-- ------------------------------------------------------------
-- REGISTRO DIARIO DE CONSUMO
-- ------------------------------------------------------------

INSERT INTO Registro_Diario (id_cliente, Fecha, Tiempo) VALUES
(2, '2026-06-05', 'desayuno'),
(2, '2026-06-05', 'almuerzo'),
(2, '2026-06-05', 'cena'),
(5, '2026-06-05', 'desayuno'),
(5, '2026-06-05', 'almuerzo'),
(5, '2026-06-05', 'merienda_tarde'),
(5, '2026-06-05', 'cena'),
(11, '2026-06-01', 'desayuno'),
(11, '2026-06-02', 'desayuno'),
(11, '2026-06-03', 'almuerzo');

INSERT INTO RegistroxProducto (id_registro, id_producto, Cantidad) VALUES
(1, 4, 60.0), (1, 5, 240.0),
(2, 1, 100.0), (2, 3, 150.0),
(3, 1, 100.0), (3, 2, 100.0),
(4, 4, 60.0), (4, 5, 240.0),
(5, 3, 200.0), (5, 1, 150.0),
(6, 6, 100.0),
(7, 7, 100.0), (7, 4, 60.0),
(8, 4, 60.0), (8, 5, 240.0),
(9, 1, 100.0), (9, 2, 100.0),
(10, 3, 150.0), (10, 1, 100.0);