using NutriTEC.API.Data.Repositories;
using NutriTEC.API.Models;

namespace NutriTEC.API.Services
{
    public class ProductoService
    {
        private readonly ProductoRepository _productoRepository;

        public ProductoService(ProductoRepository productoRepository)
        {
            _productoRepository = productoRepository;
        }

        public Task<int> CrearProducto(Producto producto) => throw new NotImplementedException();
        public Task<Producto> ObtenerProducto(int id) => throw new NotImplementedException();
        public Task<List<Producto>> ObtenerProductos() => throw new NotImplementedException();
        public Task<List<Producto>> ObtenerProductosAprobados() => throw new NotImplementedException();
        public Task ActualizarProducto(int id, Producto producto) => throw new NotImplementedException();
        public Task EliminarProducto(int id) => throw new NotImplementedException();
        public Task AprobarProducto(int id) => throw new NotImplementedException();
    }
}
