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

        public Task<List<ReporteCobroDTO>> ObtenerReporteCobro() => throw new NotImplementedException();
        public Task AprobarProducto(int id) => throw new NotImplementedException();
    }
}
