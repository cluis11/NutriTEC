using Microsoft.EntityFrameworkCore;
using System.Data;
using NutriTEC.API.Data;
using NutriTEC.API.Data.Connection;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;
using MongoDB.Driver;
using Microsoft.Data.SqlClient;

namespace NutriTEC.API.Data.Repositories
{
    public class ClienteRepository
    {
        private readonly NutriTECContext _context;
        private readonly IMongoCollection<Retroalimentacion> _retroCollection;

        public ClienteRepository(NutriTECContext context, MongoDatabaseConnection mongoConnection)
        {
            _context = context;
            _retroCollection = mongoConnection.GetDatabase().GetCollection<Retroalimentacion>("Retroalimentaciones");
        }

        public async Task<bool> CorreoExiste(string correo)
        {
            return await _context.Usuario
                .AnyAsync(u => u.Correo == correo);
        }

        public async Task<int> CrearCliente(Cliente cliente)
        {
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var command = connection.CreateCommand();
            command.CommandText = "SP_RegistrarCliente";
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.Add(new SqlParameter("@Correo", cliente.Correo));
            command.Parameters.Add(new SqlParameter("@Contrasena", cliente.Contrasena));
            command.Parameters.Add(new SqlParameter("@Nombre", cliente.Nombre));
            command.Parameters.Add(new SqlParameter("@Ap1", cliente.Ap1));
            command.Parameters.Add(new SqlParameter("@Ap2", (object?)cliente.Ap2 ?? DBNull.Value));
            command.Parameters.Add(new SqlParameter("@Fecha_nacimiento", cliente.Fecha_nacimiento));
            command.Parameters.Add(new SqlParameter("@Peso", cliente.Peso));
            command.Parameters.Add(new SqlParameter("@Altura", cliente.Altura));
            command.Parameters.Add(new SqlParameter("@Pais", cliente.Pais));
            command.Parameters.Add(new SqlParameter("@Consumo_maximo", cliente.Consumo_maximo));

            var outputParam = new SqlParameter("@id_usuario", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(outputParam);

            await command.ExecuteNonQueryAsync();

            return (int)outputParam.Value;
        }

        public async Task<Cliente?> ObtenerCliente(int id)
        {
            var usuario = await _context.Usuario
                .FirstOrDefaultAsync(u => u.Id_usuario == id);

            if (usuario == null) return null;

            var cliente = await _context.Cliente
                .FirstOrDefaultAsync(c => c.Id_usuario == id);

            if (cliente == null) return null;

            cliente.Correo = usuario.Correo;
            cliente.Nombre = usuario.Nombre;
            cliente.Ap1 = usuario.Ap1;
            cliente.Ap2 = usuario.Ap2;
            cliente.Fecha_nacimiento = usuario.Fecha_nacimiento;
            cliente.Peso = usuario.Peso;
            cliente.Altura = usuario.Altura;

            return cliente;
        }

        public Task ActualizarCliente(Cliente cliente) => throw new NotImplementedException();

        public async Task<List<ComidaConsumidaDTO>> ObtenerConsumo(int idCliente, DateTime fecha)
        {
            return await _context.Registro_Diario
                .Where(rd => rd.Id_cliente == idCliente && rd.Fecha == fecha.Date)
                .Join(_context.RegistroxProducto,
                    rd => rd.Id_registro,
                    rp => rp.Id_registro,
                    (rd, rp) => new { rd, rp })
                .Join(_context.Producto,
                    x => x.rp.Id_producto,
                    p => p.Id_producto,
                    (x, p) => new ComidaConsumidaDTO
                    {
                        Tiempo = x.rd.Tiempo,
                        Producto = p.Descripcion,
                        Cantidad = x.rp.Cantidad,
                        Calorias = p.Energia * x.rp.Cantidad
                    })
                .ToListAsync();
        }

        public async Task RegistrarComida(RegistroComidaDTO consumo)
        {
            var fecha = consumo.Fecha.Date;
            var tiempo = consumo.Tiempo.Trim().ToLower();

            var registro = await _context.Registro_Diario
                .FirstOrDefaultAsync(rd =>
                    rd.Id_cliente == consumo.Id_cliente &&
                    rd.Fecha == fecha &&
                    rd.Tiempo == tiempo);

            if (registro == null)
            {
                registro = new RegistroDiario
                {
                    Id_cliente = consumo.Id_cliente,
                    Fecha = fecha,
                    Tiempo = tiempo
                };
                _context.Registro_Diario.Add(registro);
                await _context.SaveChangesAsync();
            }

            var registroxProducto = await _context.RegistroxProducto
                .FirstOrDefaultAsync(rp =>
                    rp.Id_registro == registro.Id_registro &&
                    rp.Id_producto == consumo.Id_producto);

            if (registroxProducto != null)
            {
                registroxProducto.Cantidad += consumo.Cantidad;
            }
            else
            {
                _context.RegistroxProducto.Add(new RegistroxProducto
                {
                    Id_registro = registro.Id_registro,
                    Id_producto = consumo.Id_producto,
                    Cantidad = consumo.Cantidad
                });
            }

            await _context.SaveChangesAsync();
        }

        public async Task<(bool Excedido, string MensajeAlerta)> ExcesoCalorico(int idCliente, DateTime fecha)
        {
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var command = connection.CreateCommand();
            command.CommandText = "sp_ExcesoCalorico";
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new SqlParameter("@idCliente", idCliente));
            command.Parameters.Add(new SqlParameter("@fecha", fecha.Date));

            using var reader = await command.ExecuteReaderAsync();

            if (reader.HasRows && await reader.ReadAsync())
                return (true, reader.GetString(0));

            return (false, string.Empty);
        }

        public Task<bool> MedidaExiste(int id_cliente, DateTime fecha) => throw new NotImplementedException();
        public Task<List<MedidaVariacionDTO>> ObtenerReporteAvance(int id_cliente, DateTime fecha_inicio, DateTime fecha_fin) => throw new NotImplementedException();

        // ============================================================
        // METODOS DE MONGODB ATLAS (SEGUIMIENTO / FORO - LADO CLIENTE)
        // ============================================================

        // 1. Obtener todos los hilos de foro de un paciente especifico (el mismo cliente logueado)
        public async Task<List<Retroalimentacion>> ObtenerForosPorPaciente(int idCliente)
        {
            return await _retroCollection.Find(r => r.IdCliente == idCliente)
                                         .SortByDescending(r => r.FechaCreacion)
                                         .ToListAsync();
        }

        // 2. Obtener un solo hilo de foro por su Id (util para validar dueño antes de responder)
        public async Task<Retroalimentacion> ObtenerForoPorId(string idForo)
        {
            return await _retroCollection.Find(r => r.Id == idForo).FirstOrDefaultAsync();
        }

        // 3. Agregar una respuesta de prosa del cliente a un foro existente
        public async Task AgregarRespuestaForoAsync(string idForo, RespuestaForo respuesta)
        {
            var filter = Builders<Retroalimentacion>.Filter.Eq(r => r.Id, idForo);
            var update = Builders<Retroalimentacion>.Update.Push(r => r.Respuestas, respuesta);

            await _retroCollection.UpdateOneAsync(filter, update);
        }
    }
}