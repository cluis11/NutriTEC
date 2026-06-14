using NutriTEC.API.Data.Connection;
using NutriTEC.API.Models;
using Microsoft.Data.SqlClient;

namespace NutriTEC.API.Data.Repositories
{
    public class ProductoRepository
    {
        private readonly DatabaseConnection _db;

        public ProductoRepository(DatabaseConnection db)
        {
            _db = db;
        }

        public Task<Producto> ObtenerProducto(int id) => throw new NotImplementedException();
        public Task<List<Producto>> ObtenerProductos() => throw new NotImplementedException();
        public Task<List<Producto>> ObtenerProductosAprobados() => throw new NotImplementedException();
        public Task<bool> CodigoExiste(string codigo) => throw new NotImplementedException();
        public Task ActualizarProducto(Producto producto) => throw new NotImplementedException();
        public Task EliminarProducto(int id) => throw new NotImplementedException();
        public Task<bool> EstaEnUso(int id) => throw new NotImplementedException();
        public Task AprobarProducto(int id) => throw new NotImplementedException();

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
    }
}
