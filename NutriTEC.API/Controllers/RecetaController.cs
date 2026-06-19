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

        [HttpPost("{id_receta}/producto")]
        public async Task<IActionResult> AgregarProducto(int id_receta, [FromBody] ProductoxReceta producto)
        {
            try
            {
                await _recetaService.AgregarProducto(id_receta, producto);

                return Ok(new
                {
                    mensaje = "Producto agregado a la receta correctamente."
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensaje = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error al agregar producto a receta.",
                    detalle = ex.Message
                });
            }
        }

        [HttpDelete("{id_receta}/producto/{id_producto}")]
        public async Task<IActionResult> EliminarProductoDeReceta(int id_receta, int id_producto)
        {
            try
            {
                await _recetaService.EliminarProductoDeReceta(id_receta, id_producto);

                return Ok(new
                {
                    mensaje = "Producto eliminado de la receta correctamente."
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensaje = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error al eliminar producto de receta.",
                    detalle = ex.Message
                });
            }
        }

        [HttpPut("{id}/nombre")]
        public async Task<IActionResult> ActualizarNombreReceta(int id, [FromBody] Receta receta)
        {
            try
            {
                await _recetaService.ActualizarNombreReceta(id, receta.Nombre);

                return Ok(new
                {
                    mensaje = "Nombre de receta actualizado correctamente."
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensaje = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error al actualizar receta.",
                    detalle = ex.Message
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarReceta(int id)
        {
            try
            {
                await _recetaService.EliminarReceta(id);

                return Ok(new
                {
                    mensaje = "Receta eliminada correctamente."
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensaje = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error al eliminar receta.",
                    detalle = ex.Message
                });
            }
        }
    }
}
