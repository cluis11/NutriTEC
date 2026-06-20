using Microsoft.AspNetCore.Mvc;
using NutriTEC.API.Models;
using NutriTEC.API.Services;

namespace NutriTEC.API.Controllers
{
    [ApiController]
    [Route("api/nutricionista")]
    public class NutricionistaController : ControllerBase
    {
        private readonly NutricionistaService _nutricionistaService;

        public NutricionistaController(NutricionistaService nutricionistaService)
        {
            _nutricionistaService = nutricionistaService;
        }

        [HttpPost("registro")]
        public async Task<IActionResult> Registro([FromBody] Nutricionista nutricionista)
        {
            try
            {
                var id = await _nutricionistaService.Registro(nutricionista);
                return Ok(new { mensaje = "Registro exitoso", id_usuario = id });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch
            {
                return StatusCode(500, new { mensaje = "Error al registrar el nutricionista" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPerfil(int id)
        {
            try
            {
                var nutricionista = await _nutricionistaService.ObtenerPerfil(id);
                return Ok(nutricionista);
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
        public async Task<IActionResult> ActualizarPerfil(int id, [FromBody] Nutricionista nutricionista)
        {
            try
            {
                await _nutricionistaService.ActualizarPerfil(id, nutricionista);
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

        [HttpGet("{id}/pacientes")]
        public Task<IActionResult> ObtenerPacientes(int id) => throw new NotImplementedException();

        [HttpGet("{id}/pacientes-disponibles")]
        public Task<IActionResult> ObtenerPacientesDisponibles(int id) => throw new NotImplementedException();

        [HttpPost("{id}/pacientes")]
        public Task<IActionResult> AsociarPaciente(int id, [FromBody] int id_cliente) => throw new NotImplementedException();

        [HttpGet("{id}/pacientes/{id_cliente}/registro")]
        public Task<IActionResult> ObtenerRegistroDiario(int id, int id_cliente, [FromQuery] DateTime fecha) => throw new NotImplementedException();
    }
}