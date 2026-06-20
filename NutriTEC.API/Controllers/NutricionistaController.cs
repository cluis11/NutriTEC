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
        public Task<IActionResult> Registro([FromBody] Nutricionista nutricionista) => throw new NotImplementedException();

        [HttpGet("{id}")]
        public Task<IActionResult> ObtenerPerfil(int id) => throw new NotImplementedException();

        [HttpPut("{id}")]
        public Task<IActionResult> ActualizarPerfil(int id, [FromBody] Nutricionista nutricionista) => throw new NotImplementedException();

        [HttpGet("{id}/clientes")]
        public async Task<IActionResult> ObtenerClientesActivos(int id)
        {
            var clientes = await _nutricionistaService.ObtenerClientesActivos(id);
            return Ok(clientes);
        }

        [HttpGet("disponibles")]
        public async Task<IActionResult> ObtenerClientesDisponibles()
        {
            var clientes = await _nutricionistaService.ObtenerClientesDisponibles();
            return Ok(clientes);
        }

        [HttpGet("cliente/{id_cliente}/asignaciones")]
        public async Task<IActionResult> ObtenerAsignacionesCliente(int id_cliente)
        {
            try
            {
                var asignaciones = await _nutricionistaService.ObtenerAsignacionesCliente(id_cliente);
                return Ok(asignaciones); 
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpPost("{id}/pacientes")]
        public async Task<IActionResult> AsociarPaciente(int id, [FromBody] int id_cliente)
        {
            try
            {
                await _nutricionistaService.AsociarPaciente(id, id_cliente);
                return Ok(new { mensaje = "Paciente asociado correctamente al nutricionista." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpGet("{id}/pacientes/{id_cliente}/registro/fechas")]
        public async Task<IActionResult> ObtenerFechasConRegistro(int id, int id_cliente)
        {
            try
            {
                var fechas = await _nutricionistaService.ObtenerFechasConRegistro(id, id_cliente);
                return Ok(fechas);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpGet("{id}/pacientes/{id_cliente}/registro")]
        public async Task<IActionResult> ObtenerRegistroDiario(int id, int id_cliente, [FromQuery] DateTime fecha)
        {
            try
            {
                var registro = await _nutricionistaService.ObtenerRegistroDiario(id, id_cliente, fecha);
                return Ok(registro);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }


        // ============================================================
        // ENDPOINTS DE MONGO DB ATLAS (SEGUIMIENTO / FORO PACIENTE)
        // ============================================================

        [HttpGet("{id}/paciente/{id_cliente}/retroalimentacion")]
        public async Task<IActionResult> GetForoPaciente(int id, int id_cliente)
        {
            try
            {
                var foros = await _nutricionistaService.ObtenerForoPaciente(id, id_cliente);
                return Ok(foros);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpPost("retroalimentacion/crear")]
        public async Task<IActionResult> CrearForo([FromBody] Retroalimentacion nuevaRetro)
        {
            try
            {
                await _nutricionistaService.IniciarRetroalimentacion(nuevaRetro);
                return Ok(new { mensaje = "Foro de retroalimentación en prosa creado con éxito." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpPost("{id}/retroalimentacion/responder/{idForo}")]
        public async Task<IActionResult> ResponderForo(int id, string idForo, [FromBody] RespuestaForo nuevaRespuesta)
        {
            try
            {
                await _nutricionistaService.ResponderForo(id, idForo, nuevaRespuesta);
                return Ok(new { mensaje = "Respuesta añadida al foro correctamente." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { mensaje = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

    }
}