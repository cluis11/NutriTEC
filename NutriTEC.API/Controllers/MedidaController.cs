using Microsoft.AspNetCore.Mvc;
using NutriTEC.API.DTOs;
using NutriTEC.API.Services;

namespace NutriTEC.API.Controllers
{
    [ApiController]
    [Route("api/medida")]
    public class MedidaController : ControllerBase
    {
        private readonly MedidaService _medidaService;

        public MedidaController(MedidaService medidaService)
        {
            _medidaService = medidaService;
        }

        // Registrar nueva medida
        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] RegistrarMedidaDTO dto)
        {
            var result = await _medidaService.RegistrarMedida(dto);

            return Ok(new
            {
                message = "Medida registrada correctamente",
                id = result
            });
        }

        // Obtener medidas por usuario
        [HttpGet("usuario/{idUsuario}")]
        public async Task<IActionResult> ObtenerPorUsuario(int idUsuario)
        {
            var result = await _medidaService.ObtenerPorUsuario(idUsuario);

            return Ok(result);
        }
    }
}