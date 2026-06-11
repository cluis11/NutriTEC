using NutriTEC.API.Data.Repositories;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;

namespace NutriTEC.API.Services
{
    public class PlanService
    {
        private readonly PlanRepository _planRepository;
        private readonly ProductoRepository _productoRepository;

        public PlanService(PlanRepository planRepository, ProductoRepository productoRepository)
        {
            _planRepository = planRepository;
            _productoRepository = productoRepository;
        }

        public Task<int> CrearPlan(PlanAlimentacion plan) => throw new NotImplementedException();
        public Task<PlanAlimentacion> ObtenerPlan(int id) => throw new NotImplementedException();
        public Task<List<PlanResumenDTO>> ObtenerPlanesPorNutricionista(int id_nutricionista) => throw new NotImplementedException();
        public Task AgregarProducto(int id_plan, ProductoxPlan producto) => throw new NotImplementedException();
        public Task EliminarProductoDePlan(int id_plan, int id_producto, string tiempo) => throw new NotImplementedException();
        public Task ActualizarNombrePlan(int id, string nombre) => throw new NotImplementedException();
        public Task EliminarPlan(int id) => throw new NotImplementedException();
        public Task AsignarPlan(int id_plan, int id_cliente, int id_nutricionista, DateTime inicio, DateTime fin) => throw new NotImplementedException();
    }
}
