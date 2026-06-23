-- ============================================================
-- NutriTEC - Script 01: Estructura de la base de datos
-- ============================================================

-- ------------------------------------------------------------
-- TABLAS
-- ------------------------------------------------------------

CREATE TABLE Usuario (
    id_usuario      INT             IDENTITY(1,1) PRIMARY KEY,
    Correo          VARCHAR(100)    UNIQUE NOT NULL,
    Contrasena      VARCHAR(255)    NOT NULL,
    Nombre          NVARCHAR(50)    NOT NULL,
    Ap1             NVARCHAR(50)    NOT NULL,
    Ap2             NVARCHAR(50),
    Fecha_nacimiento DATE           NOT NULL,
    Peso            DECIMAL(5,2)    NOT NULL,
    Altura          DECIMAL(5,2)    NOT NULL
);
GO

CREATE TABLE Admin (
    id_admin        INT             IDENTITY(1,1) PRIMARY KEY,
    Correo          VARCHAR(100)    UNIQUE NOT NULL,
    Contrasena      VARCHAR(255)    NOT NULL
);
GO

CREATE TABLE Nutricionista (
    id_usuario      INT             PRIMARY KEY,
    Cedula          VARCHAR(20)     UNIQUE NOT NULL,
    Codigo          VARCHAR(20)     UNIQUE NOT NULL,
    Cobro           VARCHAR(10)     NOT NULL CHECK (Cobro IN ('semanal', 'mensual', 'anual')),
    Tarjeta         VARCHAR(20)     NOT NULL,
    Foto            VARCHAR(MAX),
    Direccion       NVARCHAR(200)   NOT NULL
);
GO

CREATE TABLE Cliente (
    id_usuario      INT             PRIMARY KEY,
    Pais            NVARCHAR(50)    NOT NULL,
    Consumo_maximo  DECIMAL(7,2)    NOT NULL
);
GO

CREATE TABLE ClientexNutricionista (
    id_cliente          INT     NOT NULL,
    id_nutricionista    INT     NOT NULL,
    PRIMARY KEY (id_cliente, id_nutricionista)
);
GO

CREATE TABLE Medida (
    id_medida       INT             IDENTITY(1,1) PRIMARY KEY,
    id_usuario      INT             NOT NULL,
    Fecha           DATE            NOT NULL,
    Cintura         DECIMAL(5,2)    NOT NULL,
    Cuello          DECIMAL(5,2)    NOT NULL,
    Caderas         DECIMAL(5,2)    NOT NULL,
    P_musculo       DECIMAL(5,2)    NOT NULL,
    P_grasa         DECIMAL(5,2)    NOT NULL
);
GO

CREATE TABLE Producto (
    id_producto     INT             IDENTITY(1,1) PRIMARY KEY,
    id_usuario      INT             NOT NULL,
    Codigo          VARCHAR(50)     UNIQUE NOT NULL,
    Descripcion     NVARCHAR(200)   NOT NULL,
    Tamano          DECIMAL(7,2)    NOT NULL,
    Porcion         DECIMAL(7,2)    NOT NULL,
    Energia         DECIMAL(7,2)    NOT NULL,
    Grasa           DECIMAL(7,2)    NOT NULL,
    Sodio           DECIMAL(7,2)    NOT NULL,
    Carbohidratos   DECIMAL(7,2)    NOT NULL,
    Proteina        DECIMAL(7,2)    NOT NULL,
    Calcio          DECIMAL(7,2)    NOT NULL,
    Hierro          DECIMAL(7,2)    NOT NULL,
    Estado          VARCHAR(10)     NOT NULL DEFAULT 'pendiente' CHECK (Estado IN ('pendiente', 'aprobado'))
);
GO

CREATE TABLE VitaminasxProducto (
    id_producto     INT             NOT NULL,
    Vitamina        NVARCHAR(50)    NOT NULL,
    PRIMARY KEY (id_producto, Vitamina)
);
GO

CREATE TABLE Receta (
    id_receta       INT             IDENTITY(1,1) PRIMARY KEY,
    id_cliente      INT             NOT NULL,
    Nombre          NVARCHAR(100)   NOT NULL
);
GO

CREATE TABLE ProductoxReceta (
    id_receta       INT             NOT NULL,
    id_producto     INT             NOT NULL,
    Cantidad        DECIMAL(7,2)    NOT NULL,
    PRIMARY KEY (id_receta, id_producto)
);
GO

CREATE TABLE PlanAlimentacion (
    id_plan             INT             IDENTITY(1,1) PRIMARY KEY,
    id_nutricionista    INT             NOT NULL,
    Nombre              NVARCHAR(100)   NOT NULL
);
GO

CREATE TABLE ProductoxPlan (
    id_plan         INT             NOT NULL,
    id_producto     INT             NOT NULL,
    Tiempo          VARCHAR(20)     NOT NULL CHECK (Tiempo IN ('desayuno', 'merienda_manana', 'almuerzo', 'merienda_tarde', 'cena')),
    Cantidad        DECIMAL(7,2)    NOT NULL,
    PRIMARY KEY (id_plan, id_producto, Tiempo)
);
GO

CREATE TABLE PlanxCliente (
    id_cliente      INT     NOT NULL,
    id_plan         INT     NOT NULL,
    Inicio          DATE    NOT NULL,
    Fin             DATE    NOT NULL,
    PRIMARY KEY (id_cliente, id_plan, Inicio),
    CONSTRAINT CHK_PlanFechas CHECK (Fin > Inicio)
);
GO

CREATE TABLE Registro_Diario (
    id_registro     INT             IDENTITY(1,1) PRIMARY KEY,
    id_cliente      INT             NOT NULL,
    Fecha           DATE            NOT NULL,
    Tiempo          VARCHAR(20)     NOT NULL CHECK (Tiempo IN ('desayuno', 'merienda_manana', 'almuerzo', 'merienda_tarde', 'cena'))
);
GO

CREATE TABLE RegistroxProducto (
    id_registro     INT             NOT NULL,
    id_producto     INT             NOT NULL,
    Cantidad        DECIMAL(7,2)    NOT NULL,
    PRIMARY KEY (id_registro, id_producto)
);
GO

-- ------------------------------------------------------------
-- FOREIGN KEYS
-- ------------------------------------------------------------

ALTER TABLE Nutricionista
    ADD CONSTRAINT FK_Nutricionista_Usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario);
GO

ALTER TABLE Cliente
    ADD CONSTRAINT FK_Cliente_Usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario);
GO

ALTER TABLE ClientexNutricionista
    ADD CONSTRAINT FK_CxN_Cliente FOREIGN KEY (id_cliente) REFERENCES Cliente(id_usuario);
ALTER TABLE ClientexNutricionista
    ADD CONSTRAINT FK_CxN_Nutricionista FOREIGN KEY (id_nutricionista) REFERENCES Nutricionista(id_usuario);
GO

ALTER TABLE Medida
    ADD CONSTRAINT FK_Medida_Cliente FOREIGN KEY (id_usuario) REFERENCES Cliente(id_usuario);
GO

ALTER TABLE Producto
    ADD CONSTRAINT FK_Producto_Usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario);
GO

ALTER TABLE VitaminasxProducto
    ADD CONSTRAINT FK_VxP_Producto FOREIGN KEY (id_producto) REFERENCES Producto(id_producto);
GO

ALTER TABLE Receta
    ADD CONSTRAINT FK_Receta_Cliente FOREIGN KEY (id_cliente) REFERENCES Cliente(id_usuario);
GO

ALTER TABLE ProductoxReceta
    ADD CONSTRAINT FK_PxR_Receta FOREIGN KEY (id_receta) REFERENCES Receta(id_receta);
ALTER TABLE ProductoxReceta
    ADD CONSTRAINT FK_PxR_Producto FOREIGN KEY (id_producto) REFERENCES Producto(id_producto);
GO

ALTER TABLE PlanAlimentacion
    ADD CONSTRAINT FK_Plan_Nutricionista FOREIGN KEY (id_nutricionista) REFERENCES Nutricionista(id_usuario);
GO

ALTER TABLE ProductoxPlan
    ADD CONSTRAINT FK_PxP_Plan FOREIGN KEY (id_plan) REFERENCES PlanAlimentacion(id_plan);
ALTER TABLE ProductoxPlan
    ADD CONSTRAINT FK_PxP_Producto FOREIGN KEY (id_producto) REFERENCES Producto(id_producto);
GO

ALTER TABLE PlanxCliente
    ADD CONSTRAINT FK_PxC_Cliente FOREIGN KEY (id_cliente) REFERENCES Cliente(id_usuario);
ALTER TABLE PlanxCliente
    ADD CONSTRAINT FK_PxC_Plan FOREIGN KEY (id_plan) REFERENCES PlanAlimentacion(id_plan);
GO

ALTER TABLE Registro_Diario
    ADD CONSTRAINT FK_Registro_Cliente FOREIGN KEY (id_cliente) REFERENCES Cliente(id_usuario);
GO

ALTER TABLE RegistroxProducto
    ADD CONSTRAINT FK_RxP_Registro FOREIGN KEY (id_registro) REFERENCES Registro_Diario(id_registro);
ALTER TABLE RegistroxProducto
    ADD CONSTRAINT FK_RxP_Producto FOREIGN KEY (id_producto) REFERENCES Producto(id_producto);
GO

-- ------------------------------------------------------------
-- STORED PROCEDURES
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
    @Foto               VARCHAR(MAX) = NULL,
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

CREATE PROCEDURE SP_ReporteCobro
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        n.Cobro AS tipo_cobro,
        u.Correo AS correo,
        CONCAT(u.Nombre, ' ', u.Ap1, ' ', ISNULL(u.Ap2, '')) AS nombre,
        n.Tarjeta AS tarjeta,
        COUNT(cn.id_cliente) AS cantidad_pacientes,
        CASE n.Cobro
            WHEN 'semanal' THEN COUNT(cn.id_cliente) * 1.00
            WHEN 'mensual' THEN COUNT(cn.id_cliente) * 4.00
            WHEN 'anual'   THEN COUNT(cn.id_cliente) * 52.00
        END AS monto_base,
        CASE n.Cobro
            WHEN 'semanal' THEN 0.00
            WHEN 'mensual' THEN COUNT(cn.id_cliente) * 4.00 * 0.05
            WHEN 'anual'   THEN COUNT(cn.id_cliente) * 52.00 * 0.10
        END AS descuento,
        CASE n.Cobro
            WHEN 'semanal' THEN COUNT(cn.id_cliente) * 1.00
            WHEN 'mensual' THEN COUNT(cn.id_cliente) * 4.00 * 0.95
            WHEN 'anual'   THEN COUNT(cn.id_cliente) * 52.00 * 0.90
        END AS monto_final
    FROM Nutricionista n
    INNER JOIN Usuario u ON n.id_usuario = u.id_usuario
    LEFT JOIN ClientexNutricionista cn ON n.id_usuario = cn.id_nutricionista
    GROUP BY n.id_usuario, n.Cobro, u.Correo, u.Nombre, u.Ap1, u.Ap2, n.Tarjeta
    ORDER BY n.Cobro;
END;
GO

CREATE PROCEDURE sp_AprobarProducto
    @id_producto INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Producto WHERE id_producto = @id_producto)
    BEGIN
        RAISERROR('Producto no encontrado.', 16, 1);
        RETURN;
    END
    UPDATE Producto SET Estado = 'aprobado' WHERE id_producto = @id_producto;
END;
GO

CREATE PROCEDURE sp_EliminarProducto
    @id_producto INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Producto WHERE id_producto = @id_producto)
    BEGIN
        RAISERROR('Producto no encontrado.', 16, 1);
        RETURN;
    END
    BEGIN TRANSACTION;
    BEGIN TRY
        DELETE FROM VitaminasxProducto WHERE id_producto = @id_producto;
        DELETE FROM Producto WHERE id_producto = @id_producto;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE PROCEDURE sp_ExcesoCalorico
    @idCliente INT,
    @fecha DATE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @caloriasConsumidas DECIMAL(7,2) = 0.00;
    DECLARE @consumoMaximo DECIMAL(7,2) = 2000.00;
    SELECT @caloriasConsumidas = SUM(rp.Cantidad * p.Energia)
    FROM Registro_Diario rd
    INNER JOIN RegistroxProducto rp ON rd.id_registro = rp.id_registro
    INNER JOIN Producto p ON rp.id_producto = p.id_producto
    WHERE rd.id_cliente = @idCliente AND rd.Fecha = @fecha;
    SELECT @consumoMaximo = Consumo_maximo FROM Cliente WHERE id_usuario = @idCliente;
    IF (@caloriasConsumidas > @consumoMaximo)
    BEGIN
        SELECT
            N'¡Alerta, Has superado tu límite permitido de Calorias!' AS MensajeAlerta,
            @caloriasConsumidas AS TotalConsumido,
            @consumoMaximo AS LimiteMaximo;
    END
END;
GO

-- ------------------------------------------------------------
-- TRIGGERS
-- ------------------------------------------------------------

CREATE TRIGGER trg_ValidarCaloriasPlan
ON PlanxCliente
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @id_plan INT, @id_cliente INT, @inicio_nuevo DATE, @fin_nuevo DATE;
    DECLARE @total_calorias_plan INT, @consumo_maximo_cliente INT;
    SELECT @id_plan = id_plan, @id_cliente = id_cliente, @inicio_nuevo = Inicio, @fin_nuevo = Fin FROM inserted;
    IF (SELECT COUNT(*) FROM PlanxCliente WHERE id_cliente = @id_cliente AND (@inicio_nuevo <= Fin AND @fin_nuevo >= Inicio)) > 1
    BEGIN
        RAISERROR('El paciente ya cuenta con un plan activo o asignado en ese rango de fechas.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
    SELECT @total_calorias_plan = ISNULL(SUM(p.Energia * (pxp.Cantidad / NULLIF(p.Porcion, 0))), 0)
    FROM ProductoxPlan pxp
    INNER JOIN Producto p ON pxp.id_producto = p.id_producto
    WHERE pxp.id_plan = @id_plan;
    SELECT @consumo_maximo_cliente = Consumo_maximo FROM Cliente WHERE id_usuario = @id_cliente;
    IF (@total_calorias_plan > @consumo_maximo_cliente)
    BEGIN
        DECLARE @ErrorMessage NVARCHAR(250);
        SET @ErrorMessage = FORMATMESSAGE('Asignación rechazada: El plan genera %d calorías, superando el máximo permitido de %d calorías.', @total_calorias_plan, @consumo_maximo_cliente);
        RAISERROR(@ErrorMessage, 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

CREATE TRIGGER trg_RevertirProductoAPendiente
ON Producto
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF TRIGGER_NESTLEVEL() > 1 RETURN;
    IF EXISTS (
        SELECT 1 FROM inserted i
        WHERE EXISTS (SELECT 1 FROM ProductoxPlan pp WHERE pp.id_producto = i.id_producto)
           OR EXISTS (SELECT 1 FROM ProductoxReceta pr WHERE pr.id_producto = i.id_producto)
           OR EXISTS (SELECT 1 FROM RegistroxProducto rp WHERE rp.id_producto = i.id_producto)
    )
    BEGIN
        RAISERROR('No se puede modificar el producto porque está siendo usado en planes, recetas o registros.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
    UPDATE p SET Estado = 'pendiente'
    FROM Producto p
    INNER JOIN inserted i ON p.id_producto = i.id_producto
    INNER JOIN deleted d ON d.id_producto = i.id_producto
    WHERE d.Estado = 'aprobado'
      AND (
            ISNULL(i.Codigo, '') <> ISNULL(d.Codigo, '')
         OR ISNULL(i.Descripcion, '') <> ISNULL(d.Descripcion, '')
         OR ISNULL(i.Tamano, 0) <> ISNULL(d.Tamano, 0)
         OR ISNULL(i.Porcion, 0) <> ISNULL(d.Porcion, 0)
         OR ISNULL(i.Energia, 0) <> ISNULL(d.Energia, 0)
         OR ISNULL(i.Grasa, 0) <> ISNULL(d.Grasa, 0)
         OR ISNULL(i.Sodio, 0) <> ISNULL(d.Sodio, 0)
         OR ISNULL(i.Carbohidratos, 0) <> ISNULL(d.Carbohidratos, 0)
         OR ISNULL(i.Proteina, 0) <> ISNULL(d.Proteina, 0)
         OR ISNULL(i.Calcio, 0) <> ISNULL(d.Calcio, 0)
         OR ISNULL(i.Hierro, 0) <> ISNULL(d.Hierro, 0)
      );
END;
GO

-- ------------------------------------------------------------
-- VISTAS
-- ------------------------------------------------------------

CREATE VIEW Vista_RegistroDiario AS
SELECT
    rd.id_cliente,
    rd.Fecha,
    rd.Tiempo,
    p.Descripcion AS Producto,
    rxp.Cantidad,
    (p.Energia * rxp.Cantidad) AS Calorias
FROM Registro_Diario rd
INNER JOIN RegistroxProducto rxp ON rd.id_registro = rxp.id_registro
INNER JOIN Producto p ON rxp.id_producto = p.id_producto;
GO

CREATE VIEW vw_ClientesSinNutricionista AS
SELECT
    c.id_usuario AS id, u.Nombre, u.Ap1, u.Ap2, u.Fecha_nacimiento, u.Correo, c.Pais
FROM Usuario u
INNER JOIN Cliente c ON u.id_usuario = c.id_usuario
LEFT JOIN ClientexNutricionista cxn ON c.id_usuario = cxn.id_cliente
WHERE cxn.id_nutricionista IS NULL;
GO

CREATE VIEW vw_PacientesActivos AS
SELECT
    cxn.id_nutricionista, u.id_usuario, u.Nombre, u.Ap1, u.Ap2, u.Fecha_nacimiento, u.Correo, c.Pais, c.Consumo_maximo
FROM Usuario u
INNER JOIN Cliente c ON u.id_usuario = c.id_usuario
INNER JOIN ClientexNutricionista cxn ON c.id_usuario = cxn.id_cliente;
GO

CREATE VIEW vw_PlanNutricionista AS
SELECT
    p.id_nutricionista,
    p.id_plan,
    p.Nombre,
    ISNULL(SUM(prod.Energia * (pxp.Cantidad / NULLIF(prod.Porcion, 0))), 0) AS Total_Calorias
FROM PlanAlimentacion p
LEFT JOIN ProductoxPlan pxp ON p.id_plan = pxp.id_plan
LEFT JOIN Producto prod ON pxp.id_producto = prod.id_producto
GROUP BY p.id_nutricionista, p.id_plan, p.Nombre;
GO
