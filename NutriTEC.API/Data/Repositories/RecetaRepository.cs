using NutriTEC.API.Data.Connection;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;

namespace NutriTEC.API.Data.Repositories
{
    public class RecetaRepository
    {
        private readonly DatabaseConnection _db;

        public RecetaRepository(DatabaseConnection db)
        {
            _db = db;
        }

        public Task<int> CrearReceta(Receta receta) => throw new NotImplementedException();
        public Task<Receta> ObtenerReceta(int id) => throw new NotImplementedException();
        public Task<List<RecetaResumenDTO>> ObtenerRecetasPorCliente(int id_cliente) => throw new NotImplementedException();
        public Task AgregarProducto(int id_receta, ProductoxReceta producto) => throw new NotImplementedException();
        public Task<bool> ProductoExisteEnReceta(int id_receta, int id_producto) => throw new NotImplementedException();
        public Task EliminarProductoDeReceta(int id_receta, int id_producto) => throw new NotImplementedException();
        public Task ActualizarNombreReceta(int id, string nombre) => throw new NotImplementedException();
        public Task EliminarReceta(int id) => throw new NotImplementedException();
    }
}
