-- ============================================================
-- NutriTEC - Script 01: Estructura de la base de datos
-- Ejecutar como sa
-- Motor: SQL Server
-- ============================================================

USE nutritec_db;
GO

-- ------------------------------------------------------------
-- USUARIOS
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

CREATE TABLE Admin (
    id_admin        INT             IDENTITY(1,1) PRIMARY KEY,
    Correo          VARCHAR(100)    UNIQUE NOT NULL,
    Contrasena      VARCHAR(255)    NOT NULL
);

CREATE TABLE Nutricionista (
    id_usuario      INT             PRIMARY KEY,
    Cedula          VARCHAR(20)     UNIQUE NOT NULL,
    Codigo          VARCHAR(20)     UNIQUE NOT NULL,
    Cobro           VARCHAR(10)     NOT NULL
                        CHECK (Cobro IN ('semanal', 'mensual', 'anual')),
    Tarjeta         VARCHAR(20)     NOT NULL,
    Foto            VARCHAR(500),
    Direccion       NVARCHAR(200)   NOT NULL,
    CONSTRAINT FK_Nutricionista_Usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Cliente (
    id_usuario      INT             PRIMARY KEY,
    Pais            NVARCHAR(50)    NOT NULL,
    Consumo_maximo  DECIMAL(7,2)    NOT NULL,
    CONSTRAINT FK_Cliente_Usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE ClientexNutricionista (
    id_cliente          INT     NOT NULL,
    id_nutricionista    INT     NOT NULL,
    PRIMARY KEY (id_cliente, id_nutricionista),
    CONSTRAINT FK_CxN_Cliente
        FOREIGN KEY (id_cliente) REFERENCES Cliente(id_usuario),
    CONSTRAINT FK_CxN_Nutricionista
        FOREIGN KEY (id_nutricionista) REFERENCES Nutricionista(id_usuario)
);

-- ------------------------------------------------------------
-- MEDIDAS
-- ------------------------------------------------------------

CREATE TABLE Medida (
    id_medida       INT             IDENTITY(1,1) PRIMARY KEY,
    id_usuario      INT             NOT NULL,
    Fecha           DATE            NOT NULL,
    Cintura         DECIMAL(5,2)    NOT NULL,
    Cuello          DECIMAL(5,2)    NOT NULL,
    Caderas         DECIMAL(5,2)    NOT NULL,
    P_musculo       DECIMAL(5,2)    NOT NULL,
    P_grasa         DECIMAL(5,2)    NOT NULL,
    CONSTRAINT FK_Medida_Cliente
        FOREIGN KEY (id_usuario) REFERENCES Cliente(id_usuario)
);

-- ------------------------------------------------------------
-- PRODUCTOS
-- ------------------------------------------------------------

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
    Estado          VARCHAR(10)     NOT NULL DEFAULT 'pendiente'
                        CHECK (Estado IN ('pendiente', 'aprobado')),
    CONSTRAINT FK_Producto_Usuario
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE VitaminasxProducto (
    id_producto     INT             NOT NULL,
    Vitamina        NVARCHAR(50)    NOT NULL,
    PRIMARY KEY (id_producto, Vitamina),
    CONSTRAINT FK_VxP_Producto
        FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

-- ------------------------------------------------------------
-- RECETAS
-- ------------------------------------------------------------

CREATE TABLE Receta (
    id_receta       INT             IDENTITY(1,1) PRIMARY KEY,
    id_cliente      INT             NOT NULL,
    Nombre          NVARCHAR(100)   NOT NULL,
    CONSTRAINT FK_Receta_Cliente
        FOREIGN KEY (id_cliente) REFERENCES Cliente(id_usuario)
);

CREATE TABLE ProductoxReceta (
    id_receta       INT             NOT NULL,
    id_producto     INT             NOT NULL,
    Cantidad        DECIMAL(7,2)    NOT NULL,
    PRIMARY KEY (id_receta, id_producto),
    CONSTRAINT FK_PxR_Receta
        FOREIGN KEY (id_receta) REFERENCES Receta(id_receta),
    CONSTRAINT FK_PxR_Producto
        FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

-- ------------------------------------------------------------
-- PLANES DE ALIMENTACION
-- ------------------------------------------------------------

CREATE TABLE PlanAlimentacion (
    id_plan             INT             IDENTITY(1,1) PRIMARY KEY,
    id_nutricionista    INT             NOT NULL,
    Nombre              NVARCHAR(100)   NOT NULL,
    CONSTRAINT FK_Plan_Nutricionista
        FOREIGN KEY (id_nutricionista) REFERENCES Nutricionista(id_usuario)
);

CREATE TABLE ProductoxPlan (
    id_plan         INT             NOT NULL,
    id_producto     INT             NOT NULL,
    Tiempo          VARCHAR(20)     NOT NULL
                        CHECK (Tiempo IN ('desayuno', 'merienda_manana',
                                          'almuerzo', 'merienda_tarde', 'cena')),
    Cantidad        DECIMAL(7,2)    NOT NULL,
    PRIMARY KEY (id_plan, id_producto, Tiempo),
    CONSTRAINT FK_PxP_Plan
        FOREIGN KEY (id_plan) REFERENCES PlanAlimentacion(id_plan),
    CONSTRAINT FK_PxP_Producto
        FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

CREATE TABLE PlanxCliente (
    id_cliente      INT     NOT NULL,
    id_plan         INT     NOT NULL,
    Inicio          DATE    NOT NULL,
    Fin             DATE    NOT NULL,
    PRIMARY KEY (id_cliente, id_plan, Inicio),
    CONSTRAINT FK_PxC_Cliente
        FOREIGN KEY (id_cliente) REFERENCES Cliente(id_usuario),
    CONSTRAINT FK_PxC_Plan
        FOREIGN KEY (id_plan) REFERENCES PlanAlimentacion(id_plan),
    CONSTRAINT CHK_PlanFechas
        CHECK (Fin > Inicio)
);

-- ------------------------------------------------------------
-- REGISTRO DIARIO
-- ------------------------------------------------------------

CREATE TABLE Registro_Diario (
    id_registro     INT             IDENTITY(1,1) PRIMARY KEY,
    id_cliente      INT             NOT NULL,
    Fecha           DATE            NOT NULL,
    Tiempo          VARCHAR(20)     NOT NULL
                        CHECK (Tiempo IN ('desayuno', 'merienda_manana',
                                          'almuerzo', 'merienda_tarde', 'cena')),
    CONSTRAINT FK_Registro_Cliente
        FOREIGN KEY (id_cliente) REFERENCES Cliente(id_usuario)
);

CREATE TABLE RegistroxProducto (
    id_registro     INT             NOT NULL,
    id_producto     INT             NOT NULL,
    Cantidad        DECIMAL(7,2)    NOT NULL,
    PRIMARY KEY (id_registro, id_producto),
    CONSTRAINT FK_RxP_Registro
        FOREIGN KEY (id_registro) REFERENCES Registro_Diario(id_registro),
    CONSTRAINT FK_RxP_Producto
        FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);


-- ------------------------------------------------------------
-- Vista 1 — Pacientes sin Nutricionista
-- ------------------------------------------------------------
GO
IF OBJECT_ID('dbo.vw_ClientesSinNutricionista', 'V') IS NOT NULL
    DROP VIEW dbo.vw_ClientesSinNutricionista;
GO

CREATE VIEW dbo.vw_ClientesSinNutricionista AS
SELECT 
    c.id_usuario AS id, u.Nombre, u.Ap1, u.Ap2, u.Fecha_nacimiento, u.Correo, c.Pais 
FROM Usuario u
INNER JOIN Cliente c ON u.id_usuario = c.id_usuario
LEFT JOIN ClientexNutricionista cxn ON c.id_usuario = cxn.id_cliente
WHERE cxn.id_nutricionista IS NULL;
GO

-- ------------------------------------------------------------
-- Vista 2 — Pacientes Activos por Nutricionista
-- ------------------------------------------------------------
GO
IF OBJECT_ID('dbo.vw_PacientesActivos', 'V') IS NOT NULL
    DROP VIEW dbo.vw_PacientesActivos;
GO

CREATE VIEW dbo.vw_PacientesActivos AS
SELECT 
    cxn.id_nutricionista, u.id_usuario, u.Nombre, u.Ap1, u.Ap2, u.Fecha_nacimiento, u.Correo, c.Pais, c.Consumo_maximo
FROM Usuario u
INNER JOIN Cliente c ON u.id_usuario = c.id_usuario
INNER JOIN ClientexNutricionista cxn ON c.id_usuario = cxn.id_cliente;
GO

-- -------------------------------------------------------------- 
-- Vista 3 — Planes del Nutricionista (Calorías Reales)
-- --------------------------------------------------------------
GO
IF OBJECT_ID('dbo.vw_PlanNutricionista', 'V') IS NOT NULL
    DROP VIEW dbo.vw_PlanNutricionista;
GO

CREATE VIEW dbo.vw_PlanNutricionista AS
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
 
-- Verificacion rapida: deberia mostrar 1295 para el Plan Mantenimiento (id_plan = 2)
SELECT * FROM dbo.vw_PlanNutricionista ORDER BY id_plan;
GO

-- ------------------------------------------------------------
-- Trigger 1 — Validacion de calorías al asignar un plan
-- ------------------------------------------------------------
GO
IF OBJECT_ID('dbo.trg_ValidarCaloriasPlan', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_ValidarCaloriasPlan;
GO

CREATE TRIGGER dbo.trg_ValidarCaloriasPlan
ON PlanxCliente  
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_plan INT;
    DECLARE @id_cliente INT;
    DECLARE @inicio_nuevo DATE;
    DECLARE @fin_nuevo DATE;
    DECLARE @total_calorias_plan INT;
    DECLARE @consumo_maximo_cliente INT;

    -- 1. Obtener los datos del registro recién insertado
    SELECT @id_plan = id_plan, @id_cliente = id_cliente, @inicio_nuevo = Inicio, @fin_nuevo = Fin FROM inserted;

    -- 2. Validacion de fechas
    IF (
        SELECT COUNT(*) 
        FROM PlanxCliente
        WHERE id_cliente = @id_cliente 
          AND ( @inicio_nuevo <= Fin AND @fin_nuevo >= Inicio )
    ) > 1
    BEGIN
        RAISERROR('El paciente ya cuenta con un plan de alimentación activo o asignado en el rango de fechas seleccionado.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;

    -- 3. Calcular el total de calorías sumando (Energia * Cantidad) del plan
    SELECT @total_calorias_plan = ISNULL(SUM(p.Energia * (pxp.Cantidad / NULLIF(p.Porcion, 0)) ), 0)
    FROM ProductoxPlan pxp
    INNER JOIN Producto p ON pxp.id_producto = p.id_producto
    WHERE pxp.id_plan = @id_plan;

    -- 4. Obtener el consumo máximo diario permitido para el cliente
    SELECT @consumo_maximo_cliente = Consumo_maximo
    FROM Cliente
    WHERE id_usuario = @id_cliente;

    -- 5. Validar la restricción de calorías
    IF (@total_calorias_plan > @consumo_maximo_cliente)
    BEGIN
        DECLARE @ErrorMessage NVARCHAR(250);
        SET @ErrorMessage = FORMATMESSAGE(
            'Asignación rechazada: El plan "%d" genera un total de %d calorías, lo cual supera el consumo máximo permitido para este cliente (%d calorías).', 
            @id_plan, @total_calorias_plan, @consumo_maximo_cliente
        );
        RAISERROR(@ErrorMessage, 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;
END;
GO