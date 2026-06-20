namespace NutriTEC.API.DTOs
{
    public class PlanResumenDTO
    {
        public int Id_plan { get; set; }
        public string Nombre { get; set; }
        public bool Completo { get; set; }
        public int Total_Calorias { get; set; }
    }
}
