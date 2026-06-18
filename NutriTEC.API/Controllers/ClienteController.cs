using Microsoft.AspNetCore.Mvc;
using NutriTEC.API.DTOs;
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
        public async Task<IActionResult> ObtenerRegistroDiario(int id, [FromQuery] DateTime fecha)
        {
            try
            {
                var resultado =
                    await _clienteService.ObtenerRegistroDiario(id, fecha);

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = ex.Message
                });
            }
        }
        [HttpPost("{id}/registro")]
        public async Task<IActionResult> RegistrarComida(int id, [FromBody] RegistroComidaDTO request)
        {
            try
            {
                await _clienteService.RegistrarComida(request);
                return Ok(new { mensaje = "¡Alimento registrado con éxito!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = $"Error al registrar: {ex.Message}" });
            }
        }
        
        public Task<IActionResult> RegistrarDesdePlan(int id, [FromBody] object request) => throw new NotImplementedException();

        [HttpPost("{id}/registro/receta")]
        public Task<IActionResult> RegistrarDesdeReceta(int id, [FromBody] object request) => throw new NotImplementedException();
    }
}
