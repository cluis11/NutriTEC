using NutriTEC.API.Models;

namespace NutriTEC.API.DTOs
{
    public class RegistroDiarioDTO
    {
        public int Id_cliente { get; set; }
        public string Nombre { get; set; }
        public DateTime Fecha { get; set; }
        public decimal Total_dia { get; set; }
        public decimal Consumo_maximo { get; set; }
        public List<TiempoComidaDTO> Registros { get; set; }
    }

    public class TiempoComidaDTO
    {
        public string Tiempo { get; set; }
        public decimal Total_tiempo { get; set; }
        public List<Producto> Productos { get; set; }
    }
}
