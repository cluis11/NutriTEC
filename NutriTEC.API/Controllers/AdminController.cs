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
        public Task<IActionResult> ObtenerReporteCobro() => throw new NotImplementedException();

        [HttpPut("producto/{id}/aprobar")]
        public Task<IActionResult> AprobarProducto(int id) => throw new NotImplementedException();
    }
}
