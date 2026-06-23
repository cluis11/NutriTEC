using Microsoft.AspNetCore.Mvc;
using NutriTEC.API.DTOs;
using NutriTEC.API.Services;
using NutriTEC.API.Services.Interfaces;

namespace NutriTEC.API.Controllers
{
    [ApiController]
    [Route("api/medida")]
    public class MedidaController : ControllerBase
    {
        private readonly MedidaService _medidaService;
        private readonly IPdfService _pdfService;
        private readonly ClienteService _clienteService;

        public MedidaController(MedidaService medidaService, IPdfService pdfService, ClienteService clienteService)
        {
            _medidaService = medidaService;
            _pdfService = pdfService;
            _clienteService = clienteService;
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] RegistrarMedidaDTO dto)
        {
            var result = await _medidaService.RegistrarMedida(dto);
            return Ok(new { message = "Medida registrada correctamente", id = result });
        }

        [HttpGet("usuario/{idUsuario}")]
        public async Task<IActionResult> ObtenerPorUsuario(int idUsuario)
        {
            var result = await _medidaService.ObtenerPorUsuario(idUsuario);
            return Ok(result);
        }

        [HttpGet("usuario/{idUsuario}/reporte/pdf")]
        public async Task<IActionResult> DescargarReporteAvancePDF(int idUsuario, [FromQuery] DateTime? inicio, [FromQuery] DateTime? fin)
        {
            try
            {
                var todas = await _medidaService.ObtenerPorUsuario(idUsuario);

                var filtradas = todas.Where(m =>
                    (!inicio.HasValue || m.Fecha >= inicio.Value.Date) &&
                    (!fin.HasValue || m.Fecha <= fin.Value.Date)
                ).ToList();

                string nombreCliente = "Cliente";
                try
                {
                    var cliente = await _clienteService.ObtenerPerfil(idUsuario);
                    if (cliente != null)
                        nombreCliente = $"{cliente.Nombre} {cliente.Ap1}";
                }
                catch { }

                var pdfBytes = _pdfService.GenerarReporteAvance(nombreCliente, filtradas, inicio, fin);
                var nombreArchivo = $"reporte_avance_{idUsuario}_{DateTime.Now:yyyyMMdd_HHmm}.pdf";
                return File(pdfBytes, "application/pdf", nombreArchivo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = $"Error al generar PDF: {ex.Message}" });
            }
        }
    }
}