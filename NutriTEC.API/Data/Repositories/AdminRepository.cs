using Microsoft.EntityFrameworkCore;
using System.Data;
using NutriTEC.API.Data;
using NutriTEC.API.DTOs;
using Microsoft.Data.SqlClient;

namespace NutriTEC.API.Data.Repositories
{
    public class AdminRepository
    {
        private readonly NutriTECContext _context;

        public AdminRepository(NutriTECContext context)
        {
            _context = context;
        }

        public async Task<List<ReporteCobroDTO>> ObtenerReporteCobro()
        {
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var command = connection.CreateCommand();
            command.CommandText = "SP_ReporteCobro";
            command.CommandType = CommandType.StoredProcedure;

            using var reader = await command.ExecuteReaderAsync();
            var resultado = new List<ReporteCobroDTO>();

            while (await reader.ReadAsync())
            {
                resultado.Add(new ReporteCobroDTO
                {
                    Tipo_cobro = reader.GetString(0),
                    Correo = reader.GetString(1),
                    Nombre = reader.GetString(2),
                    Tarjeta = reader.GetString(3),
                    Cantidad_pacientes = reader.GetInt32(4),
                    Monto_base = reader.GetDecimal(5),
                    Descuento = reader.GetDecimal(6),
                    Monto_final = reader.GetDecimal(7)
                });
            }

            return resultado;
        }
    }
}
