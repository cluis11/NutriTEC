namespace NutriTEC.API.Models
{
    public class Usuario
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
    }
}
