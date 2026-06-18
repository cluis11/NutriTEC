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

        public async Task CrearPlan(PlanAlimentacion plan)
        {
            int id_plan = await _planRepository.CrearPlan(plan);
            await _planRepository.AgregarProducto(id_plan, plan.Productos);
        }

        public async Task ActualizarPlan(PlanAlimentacion plan)
        {
            if (string.IsNullOrWhiteSpace(plan.Nombre))
            {
                throw new Exception("El nombre del plan no puede estar vacío.");
            }
            if (plan.Productos == null || !plan.Productos.Any())
            {
                throw new Exception("El plan debe contener al menos un producto.");
            }

            bool Activo = await _planRepository.TieneAsignacionesActivas(plan.Id_plan);
            if (Activo)
            {
                throw new Exception("No se puede modificar el plan porque actualmente está asignado y activo para uno o más clientes.");
            }

            await _planRepository.ActualizarPlan(plan);
        }
        public Task<PlanAlimentacion> ObtenerPlan(int id)
        {
            return _planRepository.ObtenerPlan(id);
        }
        public Task<List<PlanResumenDTO>> ObtenerPlanesPorNutricionista(int id_nutricionista)
        {
            return _planRepository.ObtenerPlanesPorNutricionista(id_nutricionista);
        }
        //public Task AgregarProducto(int id_plan, ProductoxPlan producto) => throw new NotImplementedException();
        public Task EliminarProductoDePlan(int id_plan, int id_producto, string tiempo) => throw new NotImplementedException();
        public Task ActualizarNombrePlan(int id, string nombre) => throw new NotImplementedException();
        public async Task EliminarPlan(int id)
        {
            bool Activo = await _planRepository.TieneAsignacionesActivas(id);
            if (Activo)
            {
                throw new Exception("No se puede eliminar el plan porque actualmente está asignado y activo para uno o más clientes.");
            }

            await _planRepository.EliminarPlan(id);
        }
        public Task AsignarPlan(int id_plan, int id_cliente, int id_nutricionista, DateTime inicio, DateTime fin) => throw new NotImplementedException();
    }
}
