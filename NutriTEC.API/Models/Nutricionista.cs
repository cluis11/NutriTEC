namespace NutriTEC.API.Models
{
    public class Nutricionista
    {
        public int Id_usuario { get; set; }
        public string Correo { get; set; }
        public string Contrasena { get; set; }
        public string Nombre { get; set; }
        public string Ap1 { get; set; }
        public string Ap2 { get; set; }
        public DateTime Fecha_nacimiento { get; set; }
        public decimal Peso { get; set; }
        public decimal Altura { get; set; }
        public string Cedula { get; set; }
        public string Codigo { get; set; }
        public string Cobro { get; set; }
        public string Tarjeta { get; set; }
        public string Foto { get; set; }
        public string Direccion { get; set; }
    }
}
