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

        public Task<int> CrearReceta(Receta receta) => throw new NotImplementedException();
        public Task<Receta> ObtenerReceta(int id) => throw new NotImplementedException();
        public Task<List<RecetaResumenDTO>> ObtenerRecetasPorCliente(int id_cliente) => throw new NotImplementedException();
        public Task AgregarProducto(int id_receta, ProductoxReceta producto) => throw new NotImplementedException();
        public Task EliminarProductoDeReceta(int id_receta, int id_producto) => throw new NotImplementedException();
        public Task ActualizarNombreReceta(int id, string nombre) => throw new NotImplementedException();
        public Task EliminarReceta(int id) => throw new NotImplementedException();
    }
}
