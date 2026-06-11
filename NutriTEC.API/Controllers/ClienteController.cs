using Microsoft.AspNetCore.Mvc;
using NutriTEC.API.Models;
using NutriTEC.API.Services;

namespace NutriTEC.API.Controllers
{
    [ApiController]
    [Route("api/cliente")]
    public class ClienteController : ControllerBase
    {
        private readonly ClienteService _clienteService;

        public ClienteController(ClienteService clienteService)
        {
            _clienteService = clienteService;
        }

        [HttpPost("registro")]
        public Task<IActionResult> Registro([FromBody] Cliente cliente) => throw new NotImplementedException();

        [HttpGet("{id}")]
        public Task<IActionResult> ObtenerPerfil(int id) => throw new NotImplementedException();

        [HttpPut("{id}")]
        public Task<IActionResult> ActualizarPerfil(int id, [FromBody] Cliente cliente) => throw new NotImplementedException();

        [HttpPost("{id}/medidas")]
        public Task<IActionResult> RegistrarMedida(int id, [FromBody] Medida medida) => throw new NotImplementedException();

        [HttpGet("{id}/medidas/reporte")]
        public Task<IActionResult> ObtenerReporteAvance(int id, [FromQuery] DateTime fecha_inicio, [FromQuery] DateTime fecha_fin) => throw new NotImplementedException();

        [HttpGet("{id}/registro")]
        public Task<IActionResult> ObtenerRegistroDiario(int id, [FromQuery] DateTime fecha) => throw new NotImplementedException();

        [HttpPost("{id}/registro")]
        public Task<IActionResult> RegistrarProducto(int id, [FromBody] object request) => throw new NotImplementedException();

        [HttpPost("{id}/registro/plan")]
        public Task<IActionResult> RegistrarDesdePlan(int id, [FromBody] object request) => throw new NotImplementedException();

        [HttpPost("{id}/registro/receta")]
        public Task<IActionResult> RegistrarDesdeReceta(int id, [FromBody] object request) => throw new NotImplementedException();
    }
}
