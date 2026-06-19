using Microsoft.Data.SqlClient;
using System.Data;
using NutriTEC.API.Data.Connection;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;

namespace NutriTEC.API.Data.Repositories
{
    public class NutricionistaRepository
    {
        private readonly DatabaseConnection _db;

        public NutricionistaRepository(DatabaseConnection db)
        {
            _db = db;
        }

        public async Task<bool> CorreoExiste(string correo)
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();

            var query = "SELECT COUNT(*) FROM Usuario WHERE Correo = @correo";

            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@correo", correo);

            var count = (int)await command.ExecuteScalarAsync();
            return count > 0;
        }

        public async Task<int> CrearNutricionista(Nutricionista nutricionista)
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();

            using var command = new SqlCommand("SP_RegistrarNutricionista", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@Correo", nutricionista.Correo);
            command.Parameters.AddWithValue("@Contrasena", nutricionista.Contrasena);
            command.Parameters.AddWithValue("@Nombre", nutricionista.Nombre);
            command.Parameters.AddWithValue("@Ap1", nutricionista.Ap1);
            command.Parameters.AddWithValue("@Ap2", (object?)nutricionista.Ap2 ?? DBNull.Value);
            command.Parameters.AddWithValue("@Fecha_nacimiento", nutricionista.Fecha_nacimiento);
            command.Parameters.AddWithValue("@Peso", nutricionista.Peso);
            command.Parameters.AddWithValue("@Altura", nutricionista.Altura);
            command.Parameters.AddWithValue("@Cedula", nutricionista.Cedula);
            command.Parameters.AddWithValue("@Codigo", nutricionista.Codigo);
            command.Parameters.AddWithValue("@Cobro", nutricionista.Cobro);
            command.Parameters.AddWithValue("@Tarjeta", nutricionista.Tarjeta);
            command.Parameters.AddWithValue("@Foto", (object?)nutricionista.Foto ?? DBNull.Value);
            command.Parameters.AddWithValue("@Direccion", nutricionista.Direccion);

            var outputParam = new SqlParameter("@id_usuario", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(outputParam);

            await command.ExecuteNonQueryAsync();

            return (int)outputParam.Value;
        }

        public async Task<Nutricionista?> ObtenerNutricionista(int id)
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();

            var query = @"SELECT u.id_usuario, u.Correo, u.Nombre, u.Ap1, u.Ap2, u.Fecha_nacimiento, u.Peso, u.Altura,
                                 n.Cedula, n.Codigo, n.Cobro, n.Tarjeta, n.Foto, n.Direccion
                          FROM Usuario u
                          INNER JOIN Nutricionista n ON u.id_usuario = n.id_usuario
                          WHERE u.id_usuario = @id";

            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@id", id);

            using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return new Nutricionista
                {
                    Id_usuario = reader.GetInt32(0),
                    Correo = reader.GetString(1),
                    Nombre = reader.GetString(2),
                    Ap1 = reader.GetString(3),
                    Ap2 = reader.IsDBNull(4) ? null : reader.GetString(4),
                    Fecha_nacimiento = reader.GetDateTime(5),
                    Peso = reader.GetDecimal(6),
                    Altura = reader.GetDecimal(7),
                    Cedula = reader.GetString(8),
                    Codigo = reader.GetString(9),
                    Cobro = reader.GetString(10),
                    Tarjeta = reader.GetString(11),
                    Foto = reader.IsDBNull(12) ? null : reader.GetString(12),
                    Direccion = reader.GetString(13)
                };
            }

            return null;
        }
        public Task ActualizarNutricionista(Nutricionista nutricionista) => throw new NotImplementedException();
        public Task<List<Cliente>> ObtenerPacientes(int id_nutricionista) => throw new NotImplementedException();
        public Task<List<ClienteDisponibleDTO>> ObtenerPacientesDisponibles() => throw new NotImplementedException();
        public Task AsociarPaciente(int id_nutricionista, int id_cliente) => throw new NotImplementedException();
        public Task<List<RegistroDiarioDTO>> ObtenerRegistroDiario(int id_cliente, DateTime fecha) => throw new NotImplementedException();
    }
}