using NutriTEC.API.Data.Connection;
using NutriTEC.API.Models;

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
        public Task<int> CrearProducto(Producto producto) => throw new NotImplementedException();
        public Task ActualizarProducto(Producto producto) => throw new NotImplementedException();
        public Task EliminarProducto(int id) => throw new NotImplementedException();
        public Task<bool> EstaEnUso(int id) => throw new NotImplementedException();
        public Task AprobarProducto(int id) => throw new NotImplementedException();
    }
}
