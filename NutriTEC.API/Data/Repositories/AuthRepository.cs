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


        public async Task<bool> EsNutricionista(int id_usuario)
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();

            var query = "SELECT COUNT(*) FROM Nutricionista WHERE id_usuario = @id_usuario";

            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@id_usuario", id_usuario);

            var count = (int)await command.ExecuteScalarAsync();
            return count > 0;
        }
        public async Task<bool> EsCliente(int id_usuario)
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();

            var query = "SELECT COUNT(*) FROM Cliente WHERE id_usuario = @id_usuario";

            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@id_usuario", id_usuario);

            var count = (int)await command.ExecuteScalarAsync();
            return count > 0;
        }

        public async Task<bool> EsAdmin(string correo)
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();

            var query = "SELECT COUNT(*) FROM Admin WHERE Correo = @correo";

            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@correo", correo);

            var count = (int)await command.ExecuteScalarAsync();
            return count > 0;
        }
        public async Task<PlanActivoDTO> ObtenerPlanActivo(int id_cliente)
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();

            var query = @"SELECT p.id_plan, p.Nombre 
              FROM PlanxCliente pc
              INNER JOIN PlanAlimentacion p ON pc.id_plan = p.id_plan
              WHERE pc.id_cliente = @id_cliente 
              AND GETDATE() BETWEEN pc.Inicio AND pc.Fin";

            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@id_cliente", id_cliente);

            using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return new PlanActivoDTO
                {
                    Id_plan = reader.GetInt32(0),
                    Nombre = reader.GetString(1)
                };
            }

            throw new InvalidOperationException("No se encontró un plan activo para el cliente especificado.");
        }
    }
}