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
        
        public async Task<List<RecetaResumenDTO>> ObtenerRecetasPorCliente(int id_cliente)
        {
            return await _recetaRepository.ObtenerRecetasPorCliente(id_cliente);
        }


        public async Task AgregarProducto(int id_receta, ProductoxReceta producto)
        {
            if (id_receta <= 0)
                throw new ArgumentException("El id de la receta es inválido.");

            if (producto == null)
                throw new ArgumentException("El producto es obligatorio.");

            if (producto.Id_producto <= 0)
                throw new ArgumentException("El producto es inválido.");

            if (producto.Cantidad <= 0)
                throw new ArgumentException("La cantidad debe ser mayor a cero.");

            var receta = await _recetaRepository.ObtenerReceta(id_receta);

            if (receta == null)
                throw new KeyNotFoundException("Receta no encontrada.");

            var productoBase = await _productoRepository.ObtenerProducto(producto.Id_producto);

            if (productoBase == null)
                throw new ArgumentException("El producto no existe.");

            if (productoBase.Estado.ToLower() != "aprobado")
                throw new ArgumentException("Solo se pueden agregar productos aprobados.");

            await _recetaRepository.AgregarProducto(id_receta, producto);
        }
        public async Task EliminarProductoDeReceta(int id_receta, int id_producto)
        {
            if (id_receta <= 0 || id_producto <= 0)
                throw new ArgumentException("Datos inválidos.");

            var receta = await _recetaRepository.ObtenerReceta(id_receta);

            if (receta == null)
                throw new KeyNotFoundException("Receta no encontrada.");

            await _recetaRepository.EliminarProductoDeReceta(id_receta, id_producto);
        }
        public async Task ActualizarNombreReceta(int id, string nombre)
        {
            if (id <= 0)
                throw new ArgumentException("El id de la receta es inválido.");

            if (string.IsNullOrWhiteSpace(nombre))
                throw new ArgumentException("El nombre de la receta es obligatorio.");

            var receta = await _recetaRepository.ObtenerReceta(id);

            if (receta == null)
                throw new KeyNotFoundException("Receta no encontrada.");

            await _recetaRepository.ActualizarNombreReceta(id, nombre);
        }
        public async Task EliminarReceta(int id)
        {
            if (id <= 0)
                throw new ArgumentException("El id de la receta es inválido.");

            var receta = await _recetaRepository.ObtenerReceta(id);

            if (receta == null)
                throw new KeyNotFoundException("Receta no encontrada.");

            await _recetaRepository.EliminarReceta(id);
        }
    }
}
