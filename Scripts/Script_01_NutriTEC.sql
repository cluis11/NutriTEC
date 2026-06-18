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

-- ============================================================
-- VISTA DE REGISTRO
-- ============================================================
CREATE VIEW Vista_RegistroDiario AS
SELECT 
    rd.id_cliente,
    rd.Fecha,
    rd.Tiempo,
    p.Descripcion AS Producto,
    rxp.Cantidad,
    (p.Energia * rxp.Cantidad) AS Calorias 
FROM Registro_Diario rd
INNER JOIN RegistroxProducto rxp 
ON rd.id_registro = rxp.id_registro
INNER JOIN Producto p 
ON rxp.id_producto = p.id_producto;