USE nutritec_db;
GO

CREATE OR ALTER PROCEDURE sp_AprobarProducto
    @id_producto INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1
        FROM Producto
        WHERE id_producto = @id_producto
    )
    BEGIN
        RAISERROR('Producto no encontrado.', 16, 1);
        RETURN;
    END

    UPDATE Producto
    SET Estado = 'aprobado'
    WHERE id_producto = @id_producto;
END;
GO