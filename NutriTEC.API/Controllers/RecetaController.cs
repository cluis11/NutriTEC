using Microsoft.AspNetCore.Mvc;
using NutriTEC.API.Models;
using NutriTEC.API.Services;

namespace NutriTEC.API.Controllers
{
    [ApiController]
    [Route("api/receta")]
    public class RecetaController : ControllerBase
    {
        private readonly RecetaService _recetaService;

        public RecetaController(RecetaService recetaService)
        {
            _recetaService = recetaService;
        }

        [HttpPost]
        public async Task<IActionResult> CrearReceta([FromBody] Receta receta)
        {
            try
            {
                var id = await _recetaService.CrearReceta(receta);

                return Ok(new
                {
                    mensaje = "Receta creada correctamente.",
                    id_receta = id
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error al crear receta.",
                    detalle = ex.Message
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerReceta(int id)
        {
            var receta = await _recetaService.ObtenerReceta(id);

            if (receta == null)
            {
                return NotFound(new
                {
                    mensaje = "Receta no encontrada."
                });
            }

            return Ok(receta);
        }

        

        [HttpGet("cliente/{id_cliente}")]
        public async Task<IActionResult> ObtenerRecetasPorCliente(int id_cliente)
        {
            var recetas = await _recetaService.ObtenerRecetasPorCliente(id_cliente);

            return Ok(recetas);
        }

        [HttpPost("{id}/producto")]
        public Task<IActionResult> AgregarProducto(int id, [FromBody] ProductoxReceta producto) => throw new NotImplementedException();

        [HttpDelete("{id}/producto/{id_producto}")]
        public Task<IActionResult> EliminarProductoDeReceta(int id, int id_producto) => throw new NotImplementedException();

        [HttpPut("{id}")]
        public Task<IActionResult> ActualizarNombreReceta(int id, [FromBody] object request) => throw new NotImplementedException();

        [HttpDelete("{id}")]
        public Task<IActionResult> EliminarReceta(int id) => throw new NotImplementedException();
    }
}
