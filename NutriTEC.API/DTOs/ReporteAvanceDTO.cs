namespace NutriTEC.API.DTOs
{
    public class ReporteAvanceDTO
    {
        public int Id_cliente { get; set; }
        public string Nombre { get; set; }
        public string Ap1 { get; set; }
        public DateTime Fecha_inicio { get; set; }
        public DateTime Fecha_fin { get; set; }
        public List<MedidaVariacionDTO> Medidas { get; set; }
    }

    public class MedidaVariacionDTO
    {
        public DateTime Fecha { get; set; }
        public decimal Cintura { get; set; }
        public decimal? Var_cintura { get; set; }
        public decimal Cuello { get; set; }
        public decimal? Var_cuello { get; set; }
        public decimal Caderas { get; set; }
        public decimal? Var_caderas { get; set; }
        public decimal P_musculo { get; set; }
        public decimal? Var_musculo { get; set; }
        public decimal P_grasa { get; set; }
        public decimal? Var_grasa { get; set; }
    }
}
