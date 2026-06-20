using Microsoft.AspNetCore.Mvc;
using NutriTEC.API.Services;

namespace NutriTEC.API.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly AdminService _adminService;

        public AdminController(AdminService adminService)
        {
            _adminService = adminService;
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