namespace NutriTEC.API.Models
{
    public class RegistroDiario
    {
        public int Id_registro { get; set; }
        public int Id_cliente { get; set; }
        public DateTime Fecha { get; set; }
        public string Tiempo { get; set; }
        public List<Producto> Productos { get; set; }
    }
}
