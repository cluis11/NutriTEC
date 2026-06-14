using Microsoft.AspNetCore.Mvc;
using NutriTEC.API.Models;
using NutriTEC.API.Services;

namespace NutriTEC.API.Controllers
{
    [ApiController]
    [Route("api/producto")]
    public class ProductoController : ControllerBase
    {
        private readonly ProductoService _productoService;

        public ProductoController(ProductoService productoService)
        {
            _productoService = productoService;
        }

        [HttpPost]
        public async Task<IActionResult> CrearProducto([FromBody] Producto producto)
        {
            try
            {
                var id = await _productoService.CrearProducto(producto);
                return Ok(new { mensaje = "Producto creado correctamente.", id_producto = id });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al crear el producto.", detalle = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerProducto(int id)
        {
            var producto = await _productoService.ObtenerProducto(id);

            if (producto == null)
            {
                return NotFound(new
                {
                    mensaje = "Producto no encontrado."
                });
            }

            return Ok(producto);
        }

        [HttpGet]
        public Task<IActionResult> ObtenerProductos() => throw new NotImplementedException();

        [HttpGet("aprobados")]
        public Task<IActionResult> ObtenerProductosAprobados() => throw new NotImplementedException();

        [HttpPut("{id}")]
        public Task<IActionResult> ActualizarProducto(int id, [FromBody] Producto producto) => throw new NotImplementedException();

        [HttpDelete("{id}")]
        public Task<IActionResult> EliminarProducto(int id) => throw new NotImplementedException();
    }
}
