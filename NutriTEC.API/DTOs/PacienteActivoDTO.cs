namespace NutriTEC.API.DTOs
{
    public class PacienteActivoDTO
    {
        public int Id_usuario { get; set; }
        public string Nombre { get; set; }
        public string Ap1 { get; set; }
        public string Ap2 { get; set; }
        public DateTime Fecha_nacimiento { get; set; }
        public string Correo { get; set; }
        public string Pais { get; set; }
        public int Consumo_maximo { get; set; }

        public int Edad => DateTime.Today.Year - Fecha_nacimiento.Year - 
            (DateTime.Today.DayOfYear < Fecha_nacimiento.DayOfYear ? 1 : 0);
    }
}
