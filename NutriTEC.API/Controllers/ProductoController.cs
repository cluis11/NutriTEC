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
        public Task<IActionResult> CrearProducto([FromBody] Producto producto) => throw new NotImplementedException();

        [HttpGet("{id}")]
        public Task<IActionResult> ObtenerProducto(int id) => throw new NotImplementedException();

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
