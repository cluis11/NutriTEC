CREATE OR ALTER PROCEDURE sp_EliminarProducto
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

    BEGIN TRANSACTION;

    BEGIN TRY
        DELETE FROM VitaminasxProducto
        WHERE id_producto = @id_producto;

        DELETE FROM Producto
        WHERE id_producto = @id_producto;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;