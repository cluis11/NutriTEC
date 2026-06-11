namespace NutriTEC.API.Models
{
    public class PlanAlimentacion
    {
        public int Id_plan { get; set; }
        public int Id_nutricionista { get; set; }
        public string Nombre { get; set; }
        public List<ProductoxPlan> Productos { get; set; }
    }

    public class ProductoxPlan
    {
        public int Id_plan { get; set; }
        public int Id_producto { get; set; }
        public string Descripcion { get; set; }
        public decimal Porcion { get; set; }
        public string Tiempo { get; set; }
        public decimal Cantidad { get; set; }
        public decimal Energia { get; set; }
        public decimal Grasa { get; set; }
        public decimal Sodio { get; set; }
        public decimal Carbohidratos { get; set; }
        public decimal Proteina { get; set; }
        public decimal Calcio { get; set; }
        public decimal Hierro { get; set; }
        public List<string> Vitaminas { get; set; }
    }
}
