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
        public async Task<IActionResult> ObtenerRegistroDiario(int id, [FromQuery] DateTime fecha)
        {
            try
            {
                var resultado = await _clienteService.ObtenerRegistroDiario(id, fecha);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = ex.Message });
            }
        }

        [HttpPost("{id}/registro")]
        public async Task<IActionResult> RegistrarComida(int id, [FromBody] RegistroComidaDTO request)
        {
            try
            {
                var resultadoAlerta = await _clienteService.RegistrarComida(id, request);
                return Ok(new {
                    success = true,
                    excedido = resultadoAlerta.Excedido,
                    mensaje = resultadoAlerta.Excedido ? resultadoAlerta.MensajeAlerta : "¡Alimento registrado con éxito!"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = $"Error al registrar: {ex.Message}" });
            }
        }

        [HttpPost("{id}/registro/plan")]
        public async Task<IActionResult> RegistrarDesdePlan(int id, [FromBody] RegistrarDesdePlanDTO request)
        {
            try
            {
                var resultado = await _clienteService.RegistrarDesdePlan(id, request.Fecha, request.Tiempo);
                return Ok(new {
                    success = true,
                    excedido = resultado.Excedido,
                    mensaje = resultado.Excedido ? resultado.MensajeAlerta : "¡Plan registrado con éxito!"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = $"Error al registrar desde plan: {ex.Message}" });
            }
        }

        [HttpPost("{id}/registro/receta")]
        public async Task<IActionResult> RegistrarDesdeReceta(int id, [FromBody] RegistrarDesdeRecetaDTO request)
        {
            try
            {
                var resultado = await _clienteService.RegistrarDesdeReceta(id, request.Fecha, request.Tiempo, request.Id_receta);
                return Ok(new {
                    success = true,
                    excedido = resultado.Excedido,
                    mensaje = resultado.Excedido ? resultado.MensajeAlerta : "¡Receta registrada con éxito!"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = $"Error al registrar desde receta: {ex.Message}" });
            }
        }

        [HttpGet("{id}/plan-activo")]
        public async Task<IActionResult> ObtenerPlanActivo(int id)
        {
            try
            {
                var plan = await _clienteService.ObtenerPlanActivoConProductos(id);
                if (plan == null)
                    return NotFound(new { mensaje = "El cliente no tiene un plan activo." });
                return Ok(plan);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = ex.Message });
            }
        }

        // ============================================================
        // ENDPOINTS DE MONGO DB ATLAS (SEGUIMIENTO / FORO - LADO CLIENTE)
        // ============================================================

        [HttpGet("{id}/retroalimentacion")]
        public async Task<IActionResult> ObtenerForoPropio(int id)
        {
            try
            {
                var foros = await _clienteService.ObtenerForoPropio(id);
                return Ok(foros);
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
                await _clienteService.ResponderForo(id, idForo, nuevaRespuesta);
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