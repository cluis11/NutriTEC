using NutriTEC.API.Data.Connection;
using Microsoft.Data.SqlClient;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;
using System.Data;
using MongoDB.Driver;

namespace NutriTEC.API.Data.Repositories
{
    public class ClienteRepository
    {
        private readonly DatabaseConnection _db;
        private readonly IMongoCollection<Retroalimentacion> _retroCollection;

        public ClienteRepository(DatabaseConnection db, MongoDatabaseConnection mongoConnection)
        {
            _db = db;
            _retroCollection = mongoConnection.GetDatabase().GetCollection<Retroalimentacion>("Retroalimentaciones");
        }

        public Task<Cliente> ObtenerCliente(int id) => throw new NotImplementedException();
        public Task<int> CrearCliente(Cliente cliente) => throw new NotImplementedException();
        public Task ActualizarCliente(Cliente cliente) => throw new NotImplementedException();
        public Task<bool> CorreoExiste(string correo) => throw new NotImplementedException();
        public Task RegistrarMedida(Medida medida) => throw new NotImplementedException();
        public Task<bool> MedidaExiste(int id_cliente, DateTime fecha) => throw new NotImplementedException();
        public Task<List<MedidaVariacionDTO>> ObtenerReporteAvance(int id_cliente, DateTime fecha_inicio, DateTime fecha_fin) => throw new NotImplementedException();
        public async Task<(bool Excedido, string MensajeAlerta)> ExcesoCalorico(int idCliente, DateTime fecha)
        {
            // Inicializar
            bool estaExcedido = false;
            string mensajeAlerta = string.Empty;

            // Llamar sp
            using var connection = _db.GetConnection();
            await connection.OpenAsync();
            using (var command = new SqlCommand("sp_ExcesoCalorico", connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@idCliente", idCliente);
                command.Parameters.AddWithValue("@fecha", fecha);

                using (var reader = await command.ExecuteReaderAsync())
                {
                    if (reader.HasRows && await reader.ReadAsync())
                    {
                        estaExcedido = true;
                        mensajeAlerta = reader.GetString(0);
                    }
                }
            }

            return (estaExcedido, mensajeAlerta);
        }
        public async Task<List<ComidaConsumidaDTO>> ObtenerConsumo(int idCliente, DateTime fecha)
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();

            //implementar la vista
            var query = @"
                SELECT Tiempo, Producto, Cantidad, Calorias 
                FROM Vista_RegistroDiario 
                WHERE id_cliente = @idCliente AND Fecha = @fecha";

            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@idCliente", idCliente);
            command.Parameters.AddWithValue("@fecha", fecha.Date);

            //leer BD y crear lista vacia
            using var reader = await command.ExecuteReaderAsync();
            var listaPlana = new List<ComidaConsumidaDTO>();

            //por cada fila crea un nuevo objeto DTO y lo agrega a la lista
            while (await reader.ReadAsync())
                {   
                    listaPlana.Add(new ComidaConsumidaDTO
                    {
                        Tiempo = reader.GetString(reader.GetOrdinal("Tiempo")),
                        Producto = reader.GetString(reader.GetOrdinal("Producto")),
                        Cantidad = reader.GetDecimal(reader.GetOrdinal("Cantidad")),
                        Calorias = reader.GetDecimal(reader.GetOrdinal("Calorias"))
                    });
                }
            return listaPlana;
        }
        public async Task RegistrarComida(RegistroComidaDTO consumo)
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();

            var query = @"
                DECLARE @idRegistro INT;

                -- 1. Buscar si ya existe un registro para ese cliente, fecha y tiempo
                SELECT @idRegistro = id_registro 
                FROM Registro_Diario 
                WHERE id_cliente = @idCliente AND Fecha = @fecha AND Tiempo = @tiempo;

                -- 2. Si no existe, la creamos
                IF (@idRegistro IS NULL)
                BEGIN
                    INSERT INTO Registro_Diario (id_cliente, Fecha, Tiempo)
                    VALUES (@idCliente, @fecha, @tiempo);
                    SET @idRegistro = SCOPE_IDENTITY();
                END

                -- 3. actualizar la cantidad del producto si ya existe en el registro
                UPDATE RegistroxProducto
                SET Cantidad = Cantidad + @cantidad
                WHERE id_registro = @idRegistro AND id_producto = @idProducto;

                -- 4. @@ROWCOUNT: filas se actualizadas. 
                -- Si es 0, significa que el producto NO estaba en la tabla, entonces lo insertamos.
                IF (@@ROWCOUNT = 0)
                BEGIN
                    INSERT INTO RegistroxProducto (id_registro, id_producto, Cantidad)
                    VALUES (@idRegistro, @idProducto, @cantidad);
                END";

            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@idCliente", consumo.Id_cliente);
            command.Parameters.AddWithValue("@fecha", consumo.Fecha.Date);
            command.Parameters.AddWithValue("@tiempo", consumo.Tiempo.Trim().ToLower());
            command.Parameters.AddWithValue("@idProducto", consumo.Id_producto);
            command.Parameters.AddWithValue("@cantidad", consumo.Cantidad);

            await command.ExecuteNonQueryAsync();
        }

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