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
        public async Task<IActionResult> Registro([FromBody] Cliente cliente)
        {
            try
            {
                var id = await _clienteService.Registro(cliente);
                return Ok(new { mensaje = "Registro exitoso", id_usuario = id });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch
            {
                return StatusCode(500, new { mensaje = "Error al registrar el cliente" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPerfil(int id)
        {
            try
            {
                var cliente = await _clienteService.ObtenerPerfil(id);
                return Ok(cliente);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensaje = ex.Message });
            }
            catch
            {
                return StatusCode(500, new { mensaje = "Error al obtener el perfil" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarPerfil(int id, [FromBody] Cliente cliente)
        {
            try
            {
                await _clienteService.ActualizarPerfil(id, cliente);
                return Ok(new { mensaje = "Perfil actualizado correctamente" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensaje = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch
            {
                return StatusCode(500, new { mensaje = "Error al actualizar el perfil" });
            }
        }

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