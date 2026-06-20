using NutriTEC.API.Data.Repositories;
using NutriTEC.API.DTOs;

namespace NutriTEC.API.Services
{
    public class AdminService
    {
        private readonly AdminRepository _adminRepository;
        private readonly ProductoService _productoService;

        public AdminService(AdminRepository adminRepository, ProductoService productoService)
        {
            _adminRepository = adminRepository;
            _productoService = productoService;
        }

        public async Task<List<ReporteCobroDTO>> ObtenerReporteCobro()
        {
            return await _adminRepository.ObtenerReporteCobro();
        }

        public async Task AprobarProducto(int id)
        {
            await _productoService.AprobarProducto(id);
        }
    }
}