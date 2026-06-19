-- ============================================================
-- NutriTEC - Script 03: Stored Procedures
-- Ejecutar como sa conectado a nutritec_db
-- ============================================================

USE nutritec_db;
GO

-- ------------------------------------------------------------
-- SP: Registrar Nutricionista
-- ------------------------------------------------------------

CREATE PROCEDURE SP_RegistrarNutricionista
    @Correo             VARCHAR(100),
    @Contrasena         VARCHAR(255),
    @Nombre             NVARCHAR(50),
    @Ap1                NVARCHAR(50),
    @Ap2                NVARCHAR(50) = NULL,
    @Fecha_nacimiento   DATE,
    @Peso               DECIMAL(5,2),
    @Altura             DECIMAL(5,2),
    @Cedula             VARCHAR(20),
    @Codigo             VARCHAR(20),
    @Cobro              VARCHAR(10),
    @Tarjeta            VARCHAR(20),
    @Foto               VARCHAR(500) = NULL,
    @Direccion          NVARCHAR(200),
    @id_usuario         INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRANSACTION;

    BEGIN TRY
        INSERT INTO Usuario (Correo, Contrasena, Nombre, Ap1, Ap2, Fecha_nacimiento, Peso, Altura)
        VALUES (@Correo, @Contrasena, @Nombre, @Ap1, @Ap2, @Fecha_nacimiento, @Peso, @Altura);

        SET @id_usuario = SCOPE_IDENTITY();

        INSERT INTO Nutricionista (id_usuario, Cedula, Codigo, Cobro, Tarjeta, Foto, Direccion)
        VALUES (@id_usuario, @Cedula, @Codigo, @Cobro, @Tarjeta, @Foto, @Direccion);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ------------------------------------------------------------
-- SP: Registrar Cliente
-- ------------------------------------------------------------

CREATE PROCEDURE SP_RegistrarCliente
    @Correo             VARCHAR(100),
    @Contrasena         VARCHAR(255),
    @Nombre             NVARCHAR(50),
    @Ap1                NVARCHAR(50),
    @Ap2                NVARCHAR(50) = NULL,
    @Fecha_nacimiento   DATE,
    @Peso               DECIMAL(5,2),
    @Altura             DECIMAL(5,2),
    @Pais               NVARCHAR(50),
    @Consumo_maximo     DECIMAL(7,2),
    @id_usuario         INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRANSACTION;

    BEGIN TRY
        INSERT INTO Usuario (Correo, Contrasena, Nombre, Ap1, Ap2, Fecha_nacimiento, Peso, Altura)
        VALUES (@Correo, @Contrasena, @Nombre, @Ap1, @Ap2, @Fecha_nacimiento, @Peso, @Altura);

        SET @id_usuario = SCOPE_IDENTITY();

        INSERT INTO Cliente (id_usuario, Pais, Consumo_maximo)
        VALUES (@id_usuario, @Pais, @Consumo_maximo);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
