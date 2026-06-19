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
        public async Task<IActionResult> ObtenerProductos()
        {
            var productos = await _productoService.ObtenerProductos();
            return Ok(productos);
        }

        [HttpGet("aprobados")]
        public async Task<IActionResult> ObtenerProductosAprobados()
        {
            var productos = await _productoService.ObtenerProductosAprobados();
            return Ok(productos);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarProducto(int id, [FromBody] Producto producto)
        {
            try
            {
                await _productoService.ActualizarProducto(id, producto);

                return Ok(new
                {
                    mensaje = "Producto actualizado correctamente."
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
                    mensaje = "Error al actualizar producto.",
                    detalle = ex.Message
                });
            }
        }

        [HttpDelete("{id}")]
        public IActionResult EliminarProducto(int id)
        {
            try
            {
                var eliminado = _productoService.EliminarProducto(id);

                if (!eliminado)
                    return NotFound(new { mensaje = "Producto no encontrado" });

                return Ok(new { mensaje = "Producto eliminado correctamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpPut("{id}/aprobar")]
        public async Task<IActionResult> AprobarProducto(int id)
        {
            try
            {
                await _productoService.AprobarProducto(id);

                return Ok(new
                {
                    mensaje = "Producto aprobado correctamente."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error al aprobar producto.",
                    detalle = ex.Message
                });
            }
        }
    }
}
