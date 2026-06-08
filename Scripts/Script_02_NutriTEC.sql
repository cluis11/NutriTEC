-- ============================================================
-- NutriTEC - Script 02: Población de la base de datos
-- Ejecutar conectado a la BD "nutritec_db" como sa
-- NOTA: Passwords en texto plano solo para desarrollo local.
--       En producción el cifrado ocurre en la API.
-- ============================================================
USE nutritec_db;
GO
-- ------------------------------------------------------------
-- ADMIN
-- ------------------------------------------------------------

INSERT INTO Admin (Correo, Contrasena) VALUES
('admin@nutritec.com', 'Admin2026!');

-- ------------------------------------------------------------
-- USUARIOS BASE
-- ------------------------------------------------------------

-- Nutricionistas (id 1, 2, 3)
INSERT INTO Usuario (Correo, Contrasena, Nombre, Ap1, Ap2, Fecha_nacimiento, Peso, IMC) VALUES
('laura.mendez@nutritec.com', 'Nutri2026!', 'Laura',   'Méndez',  'Solís',   '1985-03-12', 62.0, 22.5),
('carlos.rojas@nutritec.com', 'Nutri2026!', 'Carlos',  'Rojas',   'Mora',    '1979-07-24', 78.0, 24.8),
('ana.solis@nutritec.com',    'Nutri2026!', 'Ana',     'Solís',   'Vargas',  '1990-11-05', 58.0, 21.3);

-- Clientes (id 4 al 13)
INSERT INTO Usuario (Correo, Contrasena, Nombre, Ap1, Ap2, Fecha_nacimiento, Peso, IMC) VALUES
('diego.vargas@gmail.com',    'Cliente2026!', 'Diego',   'Vargas',  'Castro',  '1995-01-15', 75.0, 23.1),
('maria.castro@gmail.com',    'Cliente2026!', 'María',   'Castro',  'López',   '1998-06-20', 65.0, 24.0),
('sofia.mora@gmail.com',      'Cliente2026!', 'Sofía',   'Mora',    'Jiménez', '1993-09-08', 55.0, 20.8),
('juan.perez@gmail.com',      'Cliente2026!', 'Juan',    'Pérez',   'Alvarado','1988-04-30', 85.0, 26.3),
('lucia.gomez@gmail.com',     'Cliente2026!', 'Lucía',   'Gómez',   'Núñez',   '2000-12-01', 60.0, 22.1),
('pedro.alvarado@gmail.com',  'Cliente2026!', 'Pedro',   'Alvarado','Fallas',  '1992-08-17', 90.0, 27.5),
('valeria.nunez@gmail.com',   'Cliente2026!', 'Valeria', 'Núñez',   'Torres',  '1997-02-28', 68.0, 23.8),
('andres.jimenez@gmail.com',  'Cliente2026!', 'Andrés',  'Jiménez', 'Mora',    '1991-05-11', 80.0, 25.0),
('camila.torres@gmail.com',   'Cliente2026!', 'Camila',  'Torres',  'Rojas',   '1999-10-22', 57.0, 21.0),
('roberto.fallas@gmail.com',  'Cliente2026!', 'Roberto', 'Fallas',  'Soto',    '1986-07-03', 72.0, 23.5);

-- ------------------------------------------------------------
-- NUTRICIONISTAS
-- ------------------------------------------------------------

INSERT INTO Nutricionista (id_usuario, Cedula, Codigo, Cobro, Tarjeta, Foto, Direccion) VALUES
(1, '1-0234-0567', 'NUT-001', 'semanal', '4532015112830366', NULL, 'San José, Costa Rica'),
(2, '2-0345-0678', 'NUT-002', 'mensual', '4716158526571020', NULL, 'Cartago, Costa Rica'),
(3, '3-0456-0789', 'NUT-003', 'anual',   '4929420961105678', NULL, 'Heredia, Costa Rica');

-- ------------------------------------------------------------
-- CLIENTES
-- ------------------------------------------------------------

INSERT INTO Cliente (id_usuario, Pais, Consumo_maximo) VALUES
(4,  'Costa Rica', 2000.00),   -- Diego Vargas    — dentro del límite
(5,  'Costa Rica', 1800.00),   -- María Castro    — supera meta (trigger Luis)
(6,  'Costa Rica', 2200.00),   -- Sofía Mora      — tercer paciente Laura
(7,  'Costa Rica', 2500.00),   -- Juan Pérez      — plan activo hoy
(8,  'Costa Rica', 1900.00),   -- Lucía Gómez     — plan vencido
(9,  'Costa Rica', 2100.00),   -- Pedro Alvarado  — plan futuro
(10, 'Costa Rica', 2300.00),   -- Valeria Núñez   — historial de medidas
(11, 'Costa Rica', 1750.00),   -- Andrés Jiménez  — historial de consumo
(12, 'Costa Rica', 2000.00),   -- Camila Torres   — cuarto paciente Ana
(13, 'Costa Rica', 1800.00);   -- Roberto Fallas  — cliente independiente

-- ------------------------------------------------------------
-- ASOCIACIONES CLIENTE x NUTRICIONISTA
-- ------------------------------------------------------------

-- Laura Méndez (id 1) — cobro semanal — 3 pacientes
INSERT INTO ClientexNutricionista (id_cliente, id_nutricionista) VALUES
(4, 1),   -- Diego Vargas
(5, 1),   -- María Castro
(6, 1);   -- Sofía Mora

-- Carlos Rojas (id 2) — cobro mensual — 2 pacientes
INSERT INTO ClientexNutricionista (id_cliente, id_nutricionista) VALUES
(7, 2),   -- Juan Pérez
(8, 2);   -- Lucía Gómez

-- Ana Solís (id 3) — cobro anual — 4 pacientes
INSERT INTO ClientexNutricionista (id_cliente, id_nutricionista) VALUES
(9,  3),  -- Pedro Alvarado
(10, 3),  -- Valeria Núñez
(11, 3),  -- Andrés Jiménez
(12, 3);  -- Camila Torres

-- Roberto Fallas (id 13) no tiene nutricionista — cliente independiente

-- ------------------------------------------------------------
-- PRODUCTOS
-- ------------------------------------------------------------

INSERT INTO Producto (Codigo, Descripcion, Tamano, Porcion, Energia, Grasa, Sodio, Carbohidratos, Proteina, Vitaminas, Calcio, Hierro, Estado) VALUES
('7400001', 'Arroz blanco cocido',      100.0, 100.0, 130.0,  0.3,  1.0, 28.0,  2.7, 'B1, B3',       10.0, 0.2, 'aprobado'),
('7400002', 'Frijoles negros cocidos',  100.0, 100.0, 132.0,  0.5,  1.0, 24.0,  8.9, 'B1, B6, C',    27.0, 2.1, 'aprobado'),
('7400003', 'Pechuga de pollo',         100.0, 100.0, 165.0,  3.6, 74.0,  0.0, 31.0, 'B3, B6',        9.0, 0.7, 'aprobado'),
('7400004', 'Pan integral',              30.0,  30.0,  80.0,  1.0,  0.0, 15.0,  3.0, 'B1, B2, E',    20.0, 1.0, 'aprobado'),
('7400005', 'Leche semidescremada',     240.0, 240.0, 110.0,  2.5,  0.0, 13.0,  8.0, 'A, D, B12',   300.0, 0.1, 'aprobado'),
('7400006', 'Plátano maduro',           100.0, 100.0, 122.0,  0.4,  0.0, 31.0,  1.1, 'B6, C',         5.0, 0.3, 'aprobado'),
('7400007', 'Atún en agua',             100.0, 100.0, 116.0,  1.0,  0.0,  0.0, 25.0, 'B3, B12, D',   10.0, 1.0, 'aprobado'),
('7400008', 'Aceite de oliva',           10.0,  10.0,  88.0, 10.0,  0.0,  0.0,  0.0, 'E, K',          0.0, 0.0, 'aprobado'),
('7400009', 'Suplemento proteico XYZ',  30.0,  30.0, 120.0,  2.0, 50.0,  3.0, 25.0, 'B6, B12',      100.0, 2.0, 'pendiente'),
('7400010', 'Barra energética ABC',      45.0,  45.0, 200.0,  7.0, 90.0, 28.0,  5.0, 'B1, B2, C',    50.0, 1.5, 'pendiente');

-- ------------------------------------------------------------
-- RECETAS
-- ------------------------------------------------------------

INSERT INTO Receta (id_cliente, Nombre) VALUES
(4,  'Gallo Pinto'),          -- id_receta 1 — Diego Vargas
(5,  'Pollo con Arroz'),      -- id_receta 2 — María Castro
(11, 'Sandwich de Atún');     -- id_receta 3 — Andrés Jiménez

INSERT INTO ProductoxReceta (id_receta, id_producto, Cantidad) VALUES
(1, 1, 100.0),   -- Gallo Pinto: Arroz
(1, 2, 100.0),   -- Gallo Pinto: Frijoles
(2, 3, 150.0),   -- Pollo con Arroz: Pollo
(2, 1, 100.0),   -- Pollo con Arroz: Arroz
(2, 8,  10.0),   -- Pollo con Arroz: Aceite de oliva
(3, 7, 100.0),   -- Sandwich de Atún: Atún
(3, 4,  60.0);   -- Sandwich de Atún: Pan integral (2 rebanadas)

-- ------------------------------------------------------------
-- PLANES DE ALIMENTACION
-- ------------------------------------------------------------

INSERT INTO PlanAlimentacion (id_nutricionista, Nombre) VALUES
(1, 'Plan Pérdida de Peso'),      -- id_plan 1 — Laura Méndez
(2, 'Plan Mantenimiento'),        -- id_plan 2 — Carlos Rojas
(3, 'Plan Ganancia Muscular');    -- id_plan 3 — Ana Solís

INSERT INTO ProductoxPlan (id_plan, id_producto, Tiempo, Cantidad) VALUES
-- Plan 1 — Pérdida de Peso (Laura)
(1, 4, 'desayuno',        60.0),   -- Pan integral
(1, 5, 'desayuno',       240.0),   -- Leche semidescremada
(1, 6, 'merienda_manana', 100.0),  -- Plátano maduro
(1, 1, 'almuerzo',        100.0),  -- Arroz
(1, 3, 'almuerzo',        150.0),  -- Pollo
(1, 6, 'merienda_tarde',  100.0),  -- Plátano maduro
(1, 2, 'cena',            100.0),  -- Frijoles
(1, 4, 'cena',             30.0),  -- Pan integral

-- Plan 2 — Mantenimiento (Carlos)
(2, 4, 'desayuno',         60.0),  -- Pan integral
(2, 5, 'desayuno',        240.0),  -- Leche
(2, 7, 'merienda_manana', 100.0),  -- Atún
(2, 1, 'almuerzo',        150.0),  -- Arroz
(2, 3, 'almuerzo',        200.0),  -- Pollo
(2, 6, 'merienda_tarde',  100.0),  -- Plátano
(2, 1, 'cena',            100.0),  -- Arroz
(2, 2, 'cena',            100.0),  -- Frijoles

-- Plan 3 — Ganancia Muscular (Ana)
(3, 5, 'desayuno',        240.0),  -- Leche
(3, 4, 'desayuno',         90.0),  -- Pan integral
(3, 7, 'merienda_manana', 150.0),  -- Atún
(3, 3, 'almuerzo',        250.0),  -- Pollo
(3, 1, 'almuerzo',        200.0),  -- Arroz
(3, 6, 'merienda_tarde',  100.0),  -- Plátano
(3, 3, 'cena',            200.0),  -- Pollo
(3, 2, 'cena',            150.0);  -- Frijoles

-- ------------------------------------------------------------
-- ASIGNACIONES PLAN x CLIENTE
-- ------------------------------------------------------------

INSERT INTO PlanxCliente (id_cliente, id_plan, Inicio, Fin) VALUES
(7,  2, '2026-05-01', '2026-07-01'),  -- Juan Pérez     — Plan Mantenimiento   ACTIVO HOY
(8,  1, '2026-03-01', '2026-05-01'),  -- Lucía Gómez    — Plan Pérdida de Peso VENCIDO
(9,  3, '2026-07-01', '2026-09-01');  -- Pedro Alvarado — Plan Ganancia Musc.  FUTURO

-- ------------------------------------------------------------
-- MEDIDAS CORPORALES
-- ------------------------------------------------------------

-- Valeria Núñez (id 10) — 5 fechas para reporte de avance
INSERT INTO Medida (id_usuario, Fecha, Cintura, Cuello, Caderas, P_musculo, P_grasa) VALUES
(10, '2026-05-01', 85.0, 35.0, 95.0, 35.0, 28.0),
(10, '2026-05-08', 84.0, 34.8, 94.5, 35.5, 27.5),
(10, '2026-05-15', 83.5, 34.5, 94.0, 36.0, 27.0),
(10, '2026-05-22', 82.0, 34.2, 93.0, 36.5, 26.5),
(10, '2026-06-01', 81.0, 34.0, 92.5, 37.0, 26.0);

-- Andrés Jiménez (id 11) — 2 fechas básicas
INSERT INTO Medida (id_usuario, Fecha, Cintura, Cuello, Caderas, P_musculo, P_grasa) VALUES
(11, '2026-05-15', 90.0, 38.0, 98.0, 40.0, 22.0),
(11, '2026-06-01', 89.0, 37.5, 97.0, 40.5, 21.5);

-- ------------------------------------------------------------
-- REGISTRO DIARIO DE CONSUMO
-- ------------------------------------------------------------

-- Diego Vargas (id 4) — 2026-06-05 — dentro del límite (1450 kcal < 2000)
INSERT INTO Registro_Diario (id_cliente, Fecha, Tiempo) VALUES
(4, '2026-06-05', 'desayuno'),       -- id_registro 1
(4, '2026-06-05', 'almuerzo'),       -- id_registro 2
(4, '2026-06-05', 'cena');           -- id_registro 3

INSERT INTO RegistroxProducto (id_registro, id_producto, Cantidad) VALUES
(1, 4, 60.0),    -- desayuno: Pan integral
(1, 5, 240.0),   -- desayuno: Leche
(2, 1, 100.0),   -- almuerzo: Arroz
(2, 3, 150.0),   -- almuerzo: Pollo
(3, 1, 100.0),   -- cena: Arroz
(3, 2, 100.0);   -- cena: Frijoles

-- María Castro (id 5) — 2026-06-05 — supera límite (2100 kcal > 1800) → activa trigger Luis
INSERT INTO Registro_Diario (id_cliente, Fecha, Tiempo) VALUES
(5, '2026-06-05', 'desayuno'),       -- id_registro 4
(5, '2026-06-05', 'almuerzo'),       -- id_registro 5
(5, '2026-06-05', 'merienda_tarde'), -- id_registro 6
(5, '2026-06-05', 'cena');           -- id_registro 7

INSERT INTO RegistroxProducto (id_registro, id_producto, Cantidad) VALUES
(4, 4,  60.0),   -- desayuno: Pan integral
(4, 5, 240.0),   -- desayuno: Leche
(5, 3, 200.0),   -- almuerzo: Pollo
(5, 1, 150.0),   -- almuerzo: Arroz
(6, 6, 100.0),   -- merienda_tarde: Plátano
(7, 7, 100.0),   -- cena: Atún
(7, 4,  60.0);   -- cena: Pan integral

-- Andrés Jiménez (id 11) — historial multi-fecha
INSERT INTO Registro_Diario (id_cliente, Fecha, Tiempo) VALUES
(11, '2026-06-01', 'desayuno'),      -- id_registro 8
(11, '2026-06-02', 'desayuno'),      -- id_registro 9
(11, '2026-06-03', 'almuerzo');      -- id_registro 10

INSERT INTO RegistroxProducto (id_registro, id_producto, Cantidad) VALUES
(8,  4,  60.0),  -- 2026-06-01 desayuno: Pan integral
(8,  5, 240.0),  -- 2026-06-01 desayuno: Leche
(9,  1, 100.0),  -- 2026-06-02 desayuno: Arroz
(9,  2, 100.0),  -- 2026-06-02 desayuno: Frijoles
(10, 3, 150.0),  -- 2026-06-03 almuerzo: Pollo
(10, 1, 100.0);  -- 2026-06-03 almuerzo: Arroz
