using NutriTEC.API.Data.Connection;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;

namespace NutriTEC.API.Data.Repositories
{
    public class PlanRepository
    {
        private readonly DatabaseConnection _db;

        public PlanRepository(DatabaseConnection db)
        {
            _db = db;
        }

        public Task<int> CrearPlan(PlanAlimentacion plan) => throw new NotImplementedException();
        public Task<PlanAlimentacion> ObtenerPlan(int id) => throw new NotImplementedException();
        public Task<List<PlanResumenDTO>> ObtenerPlanesPorNutricionista(int id_nutricionista) => throw new NotImplementedException();
        public Task AgregarProducto(int id_plan, ProductoxPlan producto) => throw new NotImplementedException();
        public Task<bool> ProductoExisteEnTiempo(int id_plan, int id_producto, string tiempo) => throw new NotImplementedException();
        public Task EliminarProductoDePlan(int id_plan, int id_producto, string tiempo) => throw new NotImplementedException();
        public Task ActualizarNombrePlan(int id, string nombre) => throw new NotImplementedException();
        public Task<bool> TieneAsignacionesActivas(int id_plan) => throw new NotImplementedException();
        public Task EliminarPlan(int id_plan) => throw new NotImplementedException();
        public Task<bool> ClienteEsPaciente(int id_nutricionista, int id_cliente) => throw new NotImplementedException();
        public Task<bool> ClienteTienePlanActivo(int id_cliente, DateTime inicio, DateTime fin) => throw new NotImplementedException();
        public Task AsignarPlan(int id_plan, int id_cliente, DateTime inicio, DateTime fin) => throw new NotImplementedException();
    }
}
