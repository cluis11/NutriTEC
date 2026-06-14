using Microsoft.AspNetCore.Mvc;
using NutriTEC.API.Models;
using NutriTEC.API.Services;

namespace NutriTEC.API.Controllers
{
    [ApiController]
    [Route("api/plan")]
    public class PlanController : ControllerBase
    {
        private readonly PlanService _planService;

        public PlanController(PlanService planService)
        {
            _planService = planService;
        }

        [HttpPost]
        public Task<IActionResult> CrearPlan([FromBody] PlanAlimentacion plan) => throw new NotImplementedException();

        [HttpGet("{id}")]
        public Task<IActionResult> ObtenerPlan(int id) => throw new NotImplementedException();

        [HttpGet("nutricionista/{id}")]
        public Task<IActionResult> ObtenerPlanesPorNutricionista(int id) => throw new NotImplementedException();

        [HttpPost("{id}/producto")]
        public Task<IActionResult> AgregarProducto(int id, [FromBody] ProductoxPlan producto) => throw new NotImplementedException();

        [HttpDelete("{id}/producto/{id_producto}/{tiempo}")]
        public Task<IActionResult> EliminarProductoDePlan(int id, int id_producto, string tiempo) => throw new NotImplementedException();

        [HttpPut("{id}")]
        public Task<IActionResult> ActualizarNombrePlan(int id, [FromBody] object request) => throw new NotImplementedException();

        [HttpDelete("{id}")]
        public Task<IActionResult> EliminarPlan(int id) => throw new NotImplementedException();

        [HttpPost("{id}/asignar")]
        public Task<IActionResult> AsignarPlan(int id, [FromBody] object request) => throw new NotImplementedException();
    }
}
