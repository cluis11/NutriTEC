namespace NutriTEC.API.DTOs
{
    public class LoginResponseDTO
    {
        public string Token { get; set; }
        public string Rol { get; set; }
        public int Id_usuario { get; set; }
        public string Nombre { get; set; }
        public string Ap1 { get; set; }
    }

    public class LoginClienteResponseDTO : LoginResponseDTO
    {
        public PlanActivoDTO Plan_activo { get; set; }
    }

    public class PlanActivoDTO
    {
        public int Id_plan { get; set; }
        public string Nombre { get; set; }
    }
}
