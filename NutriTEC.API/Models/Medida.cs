namespace NutriTEC.API.Models
{
    public class Medida
    {
        public int Id_medida { get; set; }
        public int Id_usuario { get; set; }
        public DateTime Fecha { get; set; }
        public decimal Cintura { get; set; }
        public decimal Cuello { get; set; }
        public decimal Caderas { get; set; }
        public decimal P_musculo { get; set; }
        public decimal P_grasa { get; set; }
    }
}
