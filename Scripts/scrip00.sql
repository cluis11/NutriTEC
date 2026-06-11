-- ============================================================
-- NutriTEC - Script 00: Crear base de datos y permisos
-- Ejecutar como sa o administrador del servidor
-- ============================================================

-- ------------------------------------------------------------
-- CREAR BASE DE DATOS
-- ------------------------------------------------------------

CREATE DATABASE nutritec_db;
GO

-- ------------------------------------------------------------
-- CREAR LOGIN A NIVEL DE SERVIDOR
-- ------------------------------------------------------------

CREATE LOGIN nutritec_app WITH PASSWORD = 'NutriTEC2026!';
GO

-- ------------------------------------------------------------
-- CREAR USUARIO DENTRO DE LA BASE DE DATOS
-- ------------------------------------------------------------

USE nutritec_db;
GO

CREATE USER nutritec_app FOR LOGIN nutritec_app;
GO

-- ------------------------------------------------------------
-- ASIGNAR PERMISOS
-- ------------------------------------------------------------

ALTER ROLE db_datareader ADD MEMBER nutritec_app;
ALTER ROLE db_datawriter ADD MEMBER nutritec_app;

-- Permisos para ejecutar stored procedures
GRANT EXECUTE TO nutritec_app;
GO