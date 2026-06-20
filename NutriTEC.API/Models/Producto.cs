namespace NutriTEC.API.Models
{
    public class Producto
    {
        public int Id_producto { get; set; }
        public int Id_usuario { get; set; }
        public string Codigo { get; set; }
        public string Descripcion { get; set; }
        public decimal Tamano { get; set; }
        public decimal Porcion { get; set; }
        public decimal Energia { get; set; }
        public decimal Grasa { get; set; }
        public decimal Sodio { get; set; }
        public decimal Carbohidratos { get; set; }
        public decimal Proteina { get; set; }
        public decimal Calcio { get; set; }
        public decimal Hierro { get; set; }
        public string Estado { get; set; }
        public List<string> Vitaminas { get; set; } = new List<string>();
    }
}
