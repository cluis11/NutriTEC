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
