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

        public async Task<int> CrearProducto(Producto producto)
        {
            if (producto == null)
                throw new ArgumentException("El producto es obligatorio.");

            if (producto.Id_usuario <= 0)
                throw new ArgumentException("El usuario es obligatorio.");

            if (string.IsNullOrWhiteSpace(producto.Codigo))
                throw new ArgumentException("El código es obligatorio.");

            if (string.IsNullOrWhiteSpace(producto.Descripcion))
                throw new ArgumentException("La descripción es obligatoria.");

            if (producto.Tamano <= 0 || producto.Porcion <= 0)
                throw new ArgumentException("El tamaño y la porción deben ser mayores a cero.");

            producto.Estado = "pendiente";

            return await _productoRepository.CrearProducto(producto);
        }

        public async Task<Producto?> ObtenerProducto(int id)
        {
            return await _productoRepository.ObtenerProducto(id);
        }

        public async Task<List<Producto>> ObtenerProductos()
        {
            return await _productoRepository.ObtenerProductos();
        }
        
        public Task<List<Producto>> ObtenerProductosAprobados() => throw new NotImplementedException();
        public Task ActualizarProducto(int id, Producto producto) => throw new NotImplementedException();
        public Task EliminarProducto(int id) => throw new NotImplementedException();
        
        public async Task AprobarProducto(int id)
        {
            await _productoRepository.AprobarProducto(id);
        }
    }
    
}
