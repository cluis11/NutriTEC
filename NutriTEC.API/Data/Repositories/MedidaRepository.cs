using Microsoft.Data.SqlClient;
using NutriTEC.API.Data.Connection;
using NutriTEC.API.Models;

namespace NutriTEC.API.Data.Repositories
{
    public class MedidaRepository
    {
        private readonly DatabaseConnection _db;
        public MedidaRepository(DatabaseConnection db)
        {
            _db = db;
        }

        // Registra una nueva medida corporal en la base de datos
        public async Task<int> RegistrarMedida(Medida medida)
        {
            using var conn = _db.GetConnection();
            await conn.OpenAsync();

            // Consulta para insertar una medida y retornar su id
            using var cmd = new SqlCommand(
                @"INSERT INTO medida
                (id_usuario, fecha, cintura, cuello, caderas, p_musculo, p_grasa)
                OUTPUT INSERTED.id_medida
                VALUES (@id_usuario, @fecha, @cintura, @cuello, @caderas, @p_musculo, @p_grasa)", conn);
            // Asigna los valores de la medida a los parámetros de la consulta
            cmd.Parameters.AddWithValue("@id_usuario", medida.Id_usuario);
            cmd.Parameters.AddWithValue("@fecha", medida.Fecha);
            cmd.Parameters.AddWithValue("@cintura", medida.Cintura);
            cmd.Parameters.AddWithValue("@cuello", medida.Cuello);
            cmd.Parameters.AddWithValue("@caderas", medida.Caderas);
            cmd.Parameters.AddWithValue("@p_musculo", medida.P_musculo);
            cmd.Parameters.AddWithValue("@p_grasa", medida.P_grasa);

            return (int)await cmd.ExecuteScalarAsync();
        }

        // Obtiene todas las medidas registradas por un usuario
        public async Task<List<Medida>> ObtenerPorUsuario(int idUsuario)
        {
            var lista = new List<Medida>();

            using var conn = _db.GetConnection();
            await conn.OpenAsync();

            using var cmd = new SqlCommand(
                "SELECT * FROM medida WHERE id_usuario = @id", conn);
            // Filtrar por usuario
            cmd.Parameters.AddWithValue("id", idUsuario);

            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                // Convierte cada registro en un objeto Medida
                while (await reader.ReadAsync())
                {
                    lista.Add(new Medida
                    {
                        Id_medida = Convert.ToInt32(reader["id_medida"]),
                        Id_usuario = Convert.ToInt32(reader["id_usuario"]),
                        Fecha = Convert.ToDateTime(reader["fecha"]),
                        Cintura = Convert.ToDecimal(reader["cintura"]),
                        Cuello = Convert.ToDecimal(reader["cuello"]),
                        Caderas = Convert.ToDecimal(reader["caderas"]),
                        P_musculo = Convert.ToDecimal(reader["p_musculo"]),
                        P_grasa = Convert.ToDecimal(reader["p_grasa"])
                    });
                }
            }

            return lista;
        }
    }
}