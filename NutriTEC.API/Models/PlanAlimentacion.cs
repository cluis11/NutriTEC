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
        public string Tiempo { get; set; }
        public decimal Cantidad { get; set; }
    }
}
