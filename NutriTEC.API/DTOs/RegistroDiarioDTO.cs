    using NutriTEC.API.Models;

    namespace NutriTEC.API.DTOs
    {
        public class ComidaConsumidaDTO
    {
        public string Tiempo { get; set; } = string.Empty;
        public string Producto { get; set; } = string.Empty;
        public decimal Cantidad { get; set; }
        public decimal Calorias { get; set; }
        }

        public class RegistroComidaDTO
        {
            public int Id_cliente { get; set; }
            public DateTime Fecha { get; set; }
            public string Tiempo { get; set; } = string.Empty;
            public int Id_producto { get; set; }
            public decimal Cantidad { get; set; }
        }

        public class RegistroDiarioDTO
        {
            public int Id_cliente { get; set; }
            public DateTime Fecha { get; set; }
            public decimal Total_dia { get; set; }
            public List<TiempoComidaDTO> Registros { get; set; }
        }

        public class TiempoComidaDTO
        {
            public string Tiempo { get; set; } = string.Empty;
            public List<Producto> Productos { get; set; } = new();
        }

        public class FechaConRegistroDTO
        {
            public DateTime Fecha { get; set; }
            public int Cantidad_tiempos { get; set; }
            public decimal Total_dia { get; set; }
        }
    }
