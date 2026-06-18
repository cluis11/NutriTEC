USE nutritec_db;
GO

CREATE OR ALTER TRIGGER trg_RevertirProductoAPendiente
ON Producto
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF TRIGGER_NESTLEVEL() > 1
        RETURN;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE EXISTS (
            SELECT 1
            FROM ProductoxPlan pp
            WHERE pp.id_producto = i.id_producto
        )
        OR EXISTS (
            SELECT 1
            FROM ProductoxReceta pr
            WHERE pr.id_producto = i.id_producto
        )
        OR EXISTS (
            SELECT 1
            FROM RegistroxProducto rp
            WHERE rp.id_producto = i.id_producto
        )
    )
    BEGIN
        RAISERROR('No se puede modificar el producto porque está siendo usado en planes, recetas o registros.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;

    UPDATE p
    SET Estado = 'pendiente'
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