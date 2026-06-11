using Microsoft.Data.SqlClient;
using NutriTEC.API.Data.Connection;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;

namespace NutriTEC.API.Data.Repositories
{
    public class AuthRepository
    {
        private readonly DatabaseConnection _db;

        public AuthRepository(DatabaseConnection db)
        {
            _db = db;
        }

        public async Task<Usuario?> ObtenerUsuarioPorCorreo(string correo)
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();

            var query = "SELECT id_usuario, Correo, Contrasena, Nombre, Ap1, Ap2, Fecha_nacimiento, Peso, Altura FROM Usuario WHERE Correo = @correo";

            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@correo", correo);

            using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return new Usuario
                {
                    Id_usuario = reader.GetInt32(0),
                    Correo = reader.GetString(1),
                    Contrasena = reader.GetString(2),
                    Nombre = reader.GetString(3),
                    Ap1 = reader.GetString(4),
                    Ap2 = reader.IsDBNull(5) ? null : reader.GetString(5),
                    Fecha_nacimiento = reader.GetDateTime(6),
                    Peso = reader.GetDecimal(7),
                    Altura = reader.GetDecimal(8)
                };
            }

            return null;
        }

        public Task<bool> EsNutricionista(int id_usuario) => throw new NotImplementedException();
        public Task<bool> EsCliente(int id_usuario) => throw new NotImplementedException();
        public Task<bool> EsAdmin(string correo) => throw new NotImplementedException();
        public Task<PlanActivoDTO> ObtenerPlanActivo(int id_cliente) => throw new NotImplementedException();
    }
}