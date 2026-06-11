using NutriTEC.API.Data.Connection;
using NutriTEC.API.DTOs;

namespace NutriTEC.API.Data.Repositories
{
    public class AdminRepository
    {
        private readonly DatabaseConnection _db;

        public AdminRepository(DatabaseConnection db)
        {
            _db = db;
        }

        public Task<List<ReporteCobroDTO>> ObtenerReporteCobro() => throw new NotImplementedException();
    }
}
