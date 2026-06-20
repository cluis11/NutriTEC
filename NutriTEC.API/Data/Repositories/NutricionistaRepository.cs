using Microsoft.EntityFrameworkCore;
using System.Data;
using NutriTEC.API.Data;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;
using Microsoft.Data.SqlClient;

namespace NutriTEC.API.Data.Repositories
{
    public class NutricionistaRepository
    {
        private readonly NutriTECContext _context;

        public NutricionistaRepository(NutriTECContext context)
        {
            _context = context;
        }

        public async Task<bool> CorreoExiste(string correo)
        {
            return await _context.Usuario
                .AnyAsync(u => u.Correo == correo);
        }

        public async Task<int> CrearNutricionista(Nutricionista nutricionista)
        {
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var command = connection.CreateCommand();
            command.CommandText = "SP_RegistrarNutricionista";
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.Add(new SqlParameter("@Correo", nutricionista.Correo));
            command.Parameters.Add(new SqlParameter("@Contrasena", nutricionista.Contrasena));
            command.Parameters.Add(new SqlParameter("@Nombre", nutricionista.Nombre));
            command.Parameters.Add(new SqlParameter("@Ap1", nutricionista.Ap1));
            command.Parameters.Add(new SqlParameter("@Ap2", (object?)nutricionista.Ap2 ?? DBNull.Value));
            command.Parameters.Add(new SqlParameter("@Fecha_nacimiento", nutricionista.Fecha_nacimiento));
            command.Parameters.Add(new SqlParameter("@Peso", nutricionista.Peso));
            command.Parameters.Add(new SqlParameter("@Altura", nutricionista.Altura));
            command.Parameters.Add(new SqlParameter("@Cedula", nutricionista.Cedula));
            command.Parameters.Add(new SqlParameter("@Codigo", nutricionista.Codigo));
            command.Parameters.Add(new SqlParameter("@Cobro", nutricionista.Cobro));
            command.Parameters.Add(new SqlParameter("@Tarjeta", nutricionista.Tarjeta));
            command.Parameters.Add(new SqlParameter("@Foto", (object?)nutricionista.Foto ?? DBNull.Value));
            command.Parameters.Add(new SqlParameter("@Direccion", nutricionista.Direccion));

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
            var usuario = await _context.Usuario
                .FirstOrDefaultAsync(u => u.Id_usuario == id);

            if (usuario == null) return null;

            var nutri = await _context.Nutricionista
                .FirstOrDefaultAsync(n => n.Id_usuario == id);

            if (nutri == null) return null;

            nutri.Correo = usuario.Correo;
            nutri.Nombre = usuario.Nombre;
            nutri.Ap1 = usuario.Ap1;
            nutri.Ap2 = usuario.Ap2;
            nutri.Fecha_nacimiento = usuario.Fecha_nacimiento;
            nutri.Peso = usuario.Peso;
            nutri.Altura = usuario.Altura;

            return nutri;
        }

        public async Task ActualizarNutricionista(Nutricionista nutricionista)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var usuario = await _context.Usuario
                    .FirstOrDefaultAsync(u => u.Id_usuario == nutricionista.Id_usuario);

                if (usuario != null)
                {
                    usuario.Correo = nutricionista.Correo;
                    usuario.Contrasena = nutricionista.Contrasena;
                    usuario.Peso = nutricionista.Peso;
                    usuario.Altura = nutricionista.Altura;
                }

                var nutri = await _context.Nutricionista
                    .FirstOrDefaultAsync(n => n.Id_usuario == nutricionista.Id_usuario);

                if (nutri != null)
                {
                    nutri.Cobro = nutricionista.Cobro;
                    nutri.Tarjeta = nutricionista.Tarjeta;
                    nutri.Direccion = nutricionista.Direccion;
                    nutri.Foto = nutricionista.Foto;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public Task<List<Cliente>> ObtenerPacientes(int id_nutricionista) => throw new NotImplementedException();
        public Task<List<ClienteDisponibleDTO>> ObtenerPacientesDisponibles() => throw new NotImplementedException();
        public Task AsociarPaciente(int id_nutricionista, int id_cliente) => throw new NotImplementedException();
        public Task<List<RegistroDiarioDTO>> ObtenerRegistroDiario(int id_cliente, DateTime fecha) => throw new NotImplementedException();
    }
}