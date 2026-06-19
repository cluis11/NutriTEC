namespace NutriTEC.API.DTOs
{
    public class AsignarPlanDTO
    {
        public int Id_plan { get; set; }
        public int Id_cliente { get; set; }
        public DateTime Fecha_inicio { get; set; }
        public DateTime Fecha_fin { get; set; }
    }
}