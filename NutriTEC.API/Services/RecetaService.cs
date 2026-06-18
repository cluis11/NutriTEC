using NutriTEC.API.Data.Repositories;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;

namespace NutriTEC.API.Services
{
    public class RecetaService
    {
        private readonly RecetaRepository _recetaRepository;
        private readonly ProductoRepository _productoRepository;

        public RecetaService(RecetaRepository recetaRepository, ProductoRepository productoRepository)
        {
            _recetaRepository = recetaRepository;
            _productoRepository = productoRepository;
        }

        public async Task<int> CrearReceta(Receta receta)
        {
            if (receta == null)
                throw new ArgumentException("La receta es obligatoria.");

            if (receta.Id_cliente <= 0)
                throw new ArgumentException("El cliente es obligatorio.");

            if (string.IsNullOrWhiteSpace(receta.Nombre))
                throw new ArgumentException("El nombre de la receta es obligatorio.");

            if (receta.Productos == null || receta.Productos.Count == 0)
                throw new ArgumentException("La receta debe tener al menos un producto.");

            foreach (var item in receta.Productos)
            {
                if (item.Id_producto <= 0)
                    throw new ArgumentException("Hay un producto inválido.");

                if (item.Cantidad <= 0)
                    throw new ArgumentException("La cantidad debe ser mayor a cero.");

                var producto = await _productoRepository.ObtenerProducto(item.Id_producto);

                if (producto == null)
                    throw new ArgumentException($"El producto con ID {item.Id_producto} no existe.");

                if (producto.Estado.ToLower() != "aprobado")
                    throw new ArgumentException($"El producto '{producto.Descripcion}' no está aprobado.");
            }

            return await _recetaRepository.CrearReceta(receta);
        }

        public async Task<Receta?> ObtenerReceta(int id)
        {
            return await _recetaRepository.ObtenerReceta(id);
        }
        
        public Task<List<RecetaResumenDTO>> ObtenerRecetasPorCliente(int id_cliente) => throw new NotImplementedException();
        public Task AgregarProducto(int id_receta, ProductoxReceta producto) => throw new NotImplementedException();
        public Task EliminarProductoDeReceta(int id_receta, int id_producto) => throw new NotImplementedException();
        public Task ActualizarNombreReceta(int id, string nombre) => throw new NotImplementedException();
        public Task EliminarReceta(int id) => throw new NotImplementedException();
    }
}
