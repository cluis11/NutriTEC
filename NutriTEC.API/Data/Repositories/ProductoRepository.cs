using NutriTEC.API.Data.Connection;
using NutriTEC.API.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace NutriTEC.API.Data.Repositories
{
    public class ProductoRepository
    {
        private readonly DatabaseConnection _db;

        public ProductoRepository(DatabaseConnection db)
        {
            _db = db;
        }

        public Task<List<Producto>> ObtenerProductosAprobados() => throw new NotImplementedException();
        public Task<bool> CodigoExiste(string codigo) => throw new NotImplementedException();
        public Task ActualizarProducto(Producto producto) => throw new NotImplementedException();
        public Task EliminarProducto(int id) => throw new NotImplementedException();
        public Task<bool> EstaEnUso(int id) => throw new NotImplementedException();
        
        public async Task AprobarProducto(int id)
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();

            using var command = new SqlCommand("sp_AprobarProducto", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@id_producto", id);

            await command.ExecuteNonQueryAsync();
        }

        public async Task<int> CrearProducto(Producto producto)
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();

            var query = @"
                INSERT INTO Producto
                (
                    id_usuario,
                    Codigo,
                    Descripcion,
                    Tamano,
                    Porcion,
                    Energia,
                    Grasa,
                    Sodio,
                    Carbohidratos,
                    Proteina,
                    Calcio,
                    Hierro,
                    Estado
                )
                OUTPUT INSERTED.id_producto
                VALUES
                (
                    @id_usuario,
                    @codigo,
                    @descripcion,
                    @tamano,
                    @porcion,
                    @energia,
                    @grasa,
                    @sodio,
                    @carbohidratos,
                    @proteina,
                    @calcio,
                    @hierro,
                    @estado
                )";

            using var command = new SqlCommand(query, connection);

            command.Parameters.AddWithValue("@id_usuario", producto.Id_usuario);
            command.Parameters.AddWithValue("@codigo", producto.Codigo);
            command.Parameters.AddWithValue("@descripcion", producto.Descripcion);
            command.Parameters.AddWithValue("@tamano", producto.Tamano);
            command.Parameters.AddWithValue("@porcion", producto.Porcion);
            command.Parameters.AddWithValue("@energia", producto.Energia);
            command.Parameters.AddWithValue("@grasa", producto.Grasa);
            command.Parameters.AddWithValue("@sodio", producto.Sodio);
            command.Parameters.AddWithValue("@carbohidratos", producto.Carbohidratos);
            command.Parameters.AddWithValue("@proteina", producto.Proteina);
            command.Parameters.AddWithValue("@calcio", producto.Calcio);
            command.Parameters.AddWithValue("@hierro", producto.Hierro);
            command.Parameters.AddWithValue("@estado", producto.Estado);

            var id = (int)await command.ExecuteScalarAsync();
            return id;
        }

        public async Task<Producto?> ObtenerProducto(int id)
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();

            var query = @"
                SELECT *
                FROM Producto
                WHERE id_producto = @id";

            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@id", id);

            using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return new Producto
                {
                    Id_producto = reader.GetInt32(reader.GetOrdinal("id_producto")),
                    Id_usuario = reader.GetInt32(reader.GetOrdinal("id_usuario")),
                    Codigo = reader.GetString(reader.GetOrdinal("Codigo")),
                    Descripcion = reader.GetString(reader.GetOrdinal("Descripcion")),
                    Tamano = reader.GetDecimal(reader.GetOrdinal("Tamano")),
                    Porcion = reader.GetDecimal(reader.GetOrdinal("Porcion")),
                    Energia = reader.GetDecimal(reader.GetOrdinal("Energia")),
                    Grasa = reader.GetDecimal(reader.GetOrdinal("Grasa")),
                    Sodio = reader.GetDecimal(reader.GetOrdinal("Sodio")),
                    Carbohidratos = reader.GetDecimal(reader.GetOrdinal("Carbohidratos")),
                    Proteina = reader.GetDecimal(reader.GetOrdinal("Proteina")),
                    Calcio = reader.GetDecimal(reader.GetOrdinal("Calcio")),
                    Hierro = reader.GetDecimal(reader.GetOrdinal("Hierro")),
                    Estado = reader.GetString(reader.GetOrdinal("Estado"))
                };
            }

            return null;
        }
        public async Task<List<Producto>> ObtenerProductos()
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();

            var query = @"
                SELECT *
                FROM Producto
                ORDER BY id_producto ASC";

            using var command = new SqlCommand(query, connection);
            using var reader = await command.ExecuteReaderAsync();

            var productos = new List<Producto>();

            while (await reader.ReadAsync())
            {
                productos.Add(new Producto
                {
                    Id_producto = reader.GetInt32(reader.GetOrdinal("id_producto")),
                    Id_usuario = reader.GetInt32(reader.GetOrdinal("id_usuario")),
                    Codigo = reader.GetString(reader.GetOrdinal("Codigo")),
                    Descripcion = reader.GetString(reader.GetOrdinal("Descripcion")),
                    Tamano = reader.GetDecimal(reader.GetOrdinal("Tamano")),
                    Porcion = reader.GetDecimal(reader.GetOrdinal("Porcion")),
                    Energia = reader.GetDecimal(reader.GetOrdinal("Energia")),
                    Grasa = reader.GetDecimal(reader.GetOrdinal("Grasa")),
                    Sodio = reader.GetDecimal(reader.GetOrdinal("Sodio")),
                    Carbohidratos = reader.GetDecimal(reader.GetOrdinal("Carbohidratos")),
                    Proteina = reader.GetDecimal(reader.GetOrdinal("Proteina")),
                    Calcio = reader.GetDecimal(reader.GetOrdinal("Calcio")),
                    Hierro = reader.GetDecimal(reader.GetOrdinal("Hierro")),
                    Estado = reader.GetString(reader.GetOrdinal("Estado"))
                });
            }

            return productos;
        }
    }
}
