using Microsoft.AspNetCore.Mvc;
using NutriTEC.API.Services;
using NutriTEC.API.Services.Interfaces;

namespace NutriTEC.API.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly AdminService _adminService;
        private readonly IPdfService _pdfService;

        public AdminController(AdminService adminService, IPdfService pdfService)
        {
            _adminService = adminService;
            _pdfService = pdfService;
        }

        [HttpGet("reporte-cobro")]
        public async Task<IActionResult> ObtenerReporteCobro()
        {
            try
            {
                var reporte = await _adminService.ObtenerReporteCobro();
                return Ok(reporte);
            }
            catch
            {
                return StatusCode(500, new { mensaje = "Error al obtener el reporte de cobro" });
            }
        }

        [HttpGet("reporte-cobro/pdf")]
        public async Task<IActionResult> DescargarReporteCobroPDF()
        {
            try
            {
                var reporte = await _adminService.ObtenerReporteCobro();
                var pdfBytes = _pdfService.GenerarReporteCobro(reporte);
                var nombreArchivo = $"reporte_cobro_{DateTime.Now:yyyyMMdd_HHmm}.pdf";
                return File(pdfBytes, "application/pdf", nombreArchivo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = $"Error al generar PDF: {ex.Message}" });
            }
        }

        [HttpPut("producto/{id}/aprobar")]
        public async Task<IActionResult> AprobarProducto(int id)
        {
            try
            {
                await _adminService.AprobarProducto(id);
                return Ok(new { mensaje = "Producto aprobado correctamente" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensaje = ex.Message });
            }
            catch
            {
                return StatusCode(500, new { mensaje = "Error al aprobar el producto" });
            }
        }
    }
}