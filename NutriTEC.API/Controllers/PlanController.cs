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
        public async Task<IActionResult> CrearPlan([FromBody] PlanAlimentacion plan)
        {
            try
            {
                await _planService.CrearPlan(plan);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarPlan(int id, [FromBody] PlanAlimentacion plan)
        {
            if (id != plan.Id_plan)
            {
                return BadRequest("El ID del plan no coincide con el enviado en el cuerpo.");
            }

            try
            {
                await _planService.ActualizarPlan(plan);
                return Ok(new { mensaje = "Plan actualizado correctamente." });
            }
            catch (InvalidOperationException ex) // Atrapa la restricción del cliente activo
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPlan(int id)
        {
            var plan = await _planService.ObtenerPlan(id);
            return Ok(plan);
        }

        [HttpGet("nutricionista/{id}")]
        public async Task<IActionResult> ObtenerPlanesPorNutricionista(int id)
        {
            var planes = await _planService.ObtenerPlanesPorNutricionista(id);
            return Ok(planes);
        }

        [HttpPost("{id}/producto")]
        public Task<IActionResult> AgregarProducto(int id, [FromBody] ProductoxPlan producto) => throw new NotImplementedException();

        //[HttpDelete("{id}/producto/{id_producto}/{tiempo}")]
        //public Task<IActionResult> EliminarProductoDePlan(int id, int id_producto, string tiempo) => throw new NotImplementedException();

        //[HttpPut("{id}")]
        //public Task<IActionResult> ActualizarNombrePlan(int id, [FromBody] object request) => throw new NotImplementedException();

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarPlan(int id)
        {
            try
            {
                await _planService.EliminarPlan(id);
                return Ok();
            } catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("nutricionista/{id}/clientes")]
        public async Task<IActionResult> ObtenerClientesActivos(int id)
        {
            var clientes = await _planService.ObtenerClientesActivos(id);
            return Ok(clientes);
        }

        [HttpGet("disponibles")]
        public async Task<IActionResult> ObtenerClientesDisponibles()
        {
            var clientes = await _planService.ObtenerClientesDisponibles();
            return Ok(clientes);
        }

        [HttpPost("{id_nutricionista}/cliente/{id_cliente}/asignar")]
        public async Task<IActionResult> AsignarCliente(int id_nutricionista, int id_cliente)
        {
           try
            {
                await _planService.AsignarCliente(id_nutricionista, id_cliente);
                return Ok(new { mensaje = "Cliente asignado correctamente." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        

        [HttpPost("{id}/asignar")]
        public Task<IActionResult> AsignarPlan(int id, [FromBody] object request) => throw new NotImplementedException();
    }
}
