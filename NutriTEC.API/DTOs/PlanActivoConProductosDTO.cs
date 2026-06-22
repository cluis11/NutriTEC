namespace NutriTEC.API.DTOs
{
    public class PlanActivoConProductosDTO
    {
        public int Id_plan { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public DateTime Inicio { get; set; }
        public DateTime Fin { get; set; }
        public List<ProductoEnPlanDTO> Productos { get; set; } = new();
    }

    public class ProductoEnPlanDTO
    {
        public int Id_producto { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public string Tiempo { get; set; } = string.Empty;
        public decimal Cantidad { get; set; }
        public decimal Energia { get; set; }
        public decimal Proteina { get; set; }
        public decimal Carbohidratos { get; set; }
        public decimal Grasa { get; set; }
    }

    public class RegistrarDesdePlanDTO
    {
        public DateTime Fecha { get; set; }
        public string Tiempo { get; set; } = string.Empty;
    }

    public class RegistrarDesdeRecetaDTO
    {
        public DateTime Fecha { get; set; }
        public string Tiempo { get; set; } = string.Empty;
        public int Id_receta { get; set; }
    }
}
