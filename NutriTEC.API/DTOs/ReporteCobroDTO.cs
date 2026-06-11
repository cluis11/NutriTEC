namespace NutriTEC.API.DTOs
{
    public class ReporteCobroDTO
    {
        public string Tipo_cobro { get; set; }
        public string Correo { get; set; }
        public string Nombre { get; set; }
        public string Tarjeta { get; set; }
        public int Cantidad_pacientes { get; set; }
        public decimal Monto_base { get; set; }
        public decimal Descuento { get; set; }
        public decimal Monto_final { get; set; }
    }
}
