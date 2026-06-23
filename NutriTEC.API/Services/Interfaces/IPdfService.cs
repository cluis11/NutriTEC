using NutriTEC.API.DTOs;
using NutriTEC.API.Models;

namespace NutriTEC.API.Services.Interfaces
{
    public interface IPdfService
    {
        byte[] GenerarReporteCobro(List<ReporteCobroDTO> datos);
        byte[] GenerarReporteAvance(string nombreCliente, List<Medida> medidas, DateTime? fechaInicio, DateTime? fechaFin);
    }
}