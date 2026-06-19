using NutriTEC.API.Data.Connection;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;
using Microsoft.Data.SqlClient;

namespace NutriTEC.API.Data.Repositories
{
    public class RecetaRepository
    {
        private readonly DatabaseConnection _db;

        public RecetaRepository(DatabaseConnection db)
        {
            _db = db;
        }

        public async Task<int> CrearReceta(Receta receta)
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();

            using var transaction = connection.BeginTransaction();

            try
            {
                var queryReceta = @"
                    INSERT INTO Receta (id_cliente, Nombre)
                    OUTPUT INSERTED.id_receta
                    VALUES (@id_cliente, @nombre)";

                using var commandReceta = new SqlCommand(queryReceta, connection, transaction);
                commandReceta.Parameters.AddWithValue("@id_cliente", receta.Id_cliente);
                commandReceta.Parameters.AddWithValue("@nombre", receta.Nombre);

                var idReceta = (int)await commandReceta.ExecuteScalarAsync();

                foreach (var producto in receta.Productos)
                {
                    var queryProducto = @"
                        INSERT INTO ProductoxReceta (id_receta, id_producto, Cantidad)
                        VALUES (@id_receta, @id_producto, @cantidad)";

                    using var commandProducto = new SqlCommand(queryProducto, connection, transaction);
                    commandProducto.Parameters.AddWithValue("@id_receta", idReceta);
                    commandProducto.Parameters.AddWithValue("@id_producto", producto.Id_producto);
                    commandProducto.Parameters.AddWithValue("@cantidad", producto.Cantidad);

                    await commandProducto.ExecuteNonQueryAsync();
                }

                transaction.Commit();
                return idReceta;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task<Receta?> ObtenerReceta(int id)
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();

            var queryReceta = @"
                SELECT id_receta, id_cliente, Nombre
                FROM Receta
                WHERE id_receta = @id_receta";

            using var commandReceta = new SqlCommand(queryReceta, connection);
            commandReceta.Parameters.AddWithValue("@id_receta", id);

            using var reader = await commandReceta.ExecuteReaderAsync();

            Receta? receta = null;

            if (await reader.ReadAsync())
            {
                receta = new Receta
                {
                    Id_receta = reader.GetInt32(reader.GetOrdinal("id_receta")),
                    Id_cliente = reader.GetInt32(reader.GetOrdinal("id_cliente")),
                    Nombre = reader.GetString(reader.GetOrdinal("Nombre")),
                    Productos = new List<ProductoxReceta>()
                };
            }

            await reader.CloseAsync();

            if (receta == null)
                return null;

            var queryProductos = @"
                SELECT 
                    pr.id_receta,
                    pr.id_producto,
                    pr.Cantidad,
                    p.Descripcion,
                    p.Porcion,
                    p.Energia,
                    p.Grasa,
                    p.Sodio,
                    p.Carbohidratos,
                    p.Proteina,
                    p.Calcio,
                    p.Hierro
                FROM ProductoxReceta pr
                INNER JOIN Producto p ON p.id_producto = pr.id_producto
                WHERE pr.id_receta = @id_receta";

            using var commandProductos = new SqlCommand(queryProductos, connection);
            commandProductos.Parameters.AddWithValue("@id_receta", id);

            using var readerProductos = await commandProductos.ExecuteReaderAsync();

            while (await readerProductos.ReadAsync())
            {
                receta.Productos.Add(new ProductoxReceta
                {
                    Id_receta = readerProductos.GetInt32(readerProductos.GetOrdinal("id_receta")),
                    Id_producto = readerProductos.GetInt32(readerProductos.GetOrdinal("id_producto")),
                    Cantidad = readerProductos.GetDecimal(readerProductos.GetOrdinal("Cantidad")),
                    Descripcion = readerProductos.GetString(readerProductos.GetOrdinal("Descripcion")),
                    Porcion = readerProductos.GetDecimal(readerProductos.GetOrdinal("Porcion")),
                    Energia = readerProductos.GetDecimal(readerProductos.GetOrdinal("Energia")),
                    Grasa = readerProductos.GetDecimal(readerProductos.GetOrdinal("Grasa")),
                    Sodio = readerProductos.GetDecimal(readerProductos.GetOrdinal("Sodio")),
                    Carbohidratos = readerProductos.GetDecimal(readerProductos.GetOrdinal("Carbohidratos")),
                    Proteina = readerProductos.GetDecimal(readerProductos.GetOrdinal("Proteina")),
                    Calcio = readerProductos.GetDecimal(readerProductos.GetOrdinal("Calcio")),
                    Hierro = readerProductos.GetDecimal(readerProductos.GetOrdinal("Hierro"))
                });
            }

            return receta;
        }


        public async Task<List<RecetaResumenDTO>> ObtenerRecetasPorCliente(int id_cliente)
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();

            var query = @"
                SELECT
                    id_receta,
                    Nombre
                FROM Receta
                WHERE id_cliente = @id_cliente
                ORDER BY id_receta ASC";

            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@id_cliente", id_cliente);

            using var reader = await command.ExecuteReaderAsync();

            var recetas = new List<RecetaResumenDTO>();

            while (await reader.ReadAsync())
            {
                recetas.Add(new RecetaResumenDTO
                {
                    Id_receta = reader.GetInt32(reader.GetOrdinal("id_receta")),
                    Nombre = reader.GetString(reader.GetOrdinal("Nombre"))
                });
            }

            return recetas;
        }

        public Task AgregarProducto(int id_receta, ProductoxReceta producto) => throw new NotImplementedException();
        public Task<bool> ProductoExisteEnReceta(int id_receta, int id_producto) => throw new NotImplementedException();
        public Task EliminarProductoDeReceta(int id_receta, int id_producto) => throw new NotImplementedException();
        public Task ActualizarNombreReceta(int id, string nombre) => throw new NotImplementedException();
        public Task EliminarReceta(int id) => throw new NotImplementedException();
    }
}
