using NutriTEC.API.Data.Connection;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;
using MongoDB.Driver;
using Microsoft.Data.SqlClient;
using System.Data;

namespace NutriTEC.API.Data.Repositories
{
    public class NutricionistaRepository
    {
        private readonly DatabaseConnection _db;
        private readonly IMongoCollection<Retroalimentacion> _retroCollection;

        public NutricionistaRepository(DatabaseConnection db, MongoDatabaseConnection mongoConnection)
        {
            _db = db;
            _retroCollection = mongoConnection.GetDatabase().GetCollection<Retroalimentacion>("Retroalimentaciones");
        }

        public Task<Nutricionista> ObtenerNutricionista(int id) => throw new NotImplementedException();
        public Task<int> CrearNutricionista(Nutricionista nutricionista) => throw new NotImplementedException();
        public Task ActualizarNutricionista(Nutricionista nutricionista) => throw new NotImplementedException();
        public Task<bool> CorreoExiste(string correo) => throw new NotImplementedException();
        public async Task<List<PacienteActivoDTO>> ObtenerPacientes(int id_nutricionista)
        {
            using var conn = _db.GetConnection();
            await conn.OpenAsync();

            using var cmd = new SqlCommand(
                "SELECT  * FROM dbo.vw_PacientesActivos " +
                "WHERE id_nutricionista = @id_nutricionista", conn);
            cmd.Parameters.AddWithValue("@id_nutricionista", id_nutricionista);
            
            using var reader = await cmd.ExecuteReaderAsync();
            var pacientes = new List<PacienteActivoDTO>();
            while (await reader.ReadAsync())
            {
                pacientes.Add(new PacienteActivoDTO
                {
                    Id_usuario = reader.GetInt32(1),
                    Nombre = reader.GetString(2),
                    Ap1 = reader.GetString(3),
                    Ap2 = reader.IsDBNull(4) ? string.Empty : reader.GetString(4),
                    Fecha_nacimiento = reader.GetDateTime(5),
                    Correo = reader.GetString(6),
                    Pais = reader.GetString(7),
                    Consumo_maximo = Convert.ToInt32(reader.GetDecimal(8))
                });
            }
            return pacientes;
        }
        public async Task<List<ClienteDisponibleDTO>> ObtenerClientes()
        {
            using var conn = _db.GetConnection();
            await conn.OpenAsync();

            using var cmd = new SqlCommand(
                "SELECT * FROM dbo.vw_ClientesSinNutricionista;", conn);
                
            var clientes = new List<ClienteDisponibleDTO>();
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                clientes.Add(new ClienteDisponibleDTO
                {
                    Id_usuario = reader.GetInt32(0),
                    Nombre = reader.GetString(1),
                    Ap1 = reader.GetString(2),
                    Ap2 = reader.IsDBNull(3) ? string.Empty : reader.GetString(3),
                    Fecha_nacimiento = reader.GetDateTime(4),
                    Correo = reader.GetString(5),
                    Pais = reader.GetString(6)
                });
            }
            return clientes;
        }

        public async Task<List<AsignarPlanDTO>> ObtenerAsignacionesCliente(int id_cliente)
        {
            using var conn = _db.GetConnection();
            await conn.OpenAsync();

            using var cmd = new SqlCommand("SELECT id_plan, id_cliente, Inicio, Fin " +
                "FROM PlanxCliente " +
                "WHERE id_cliente = @id_cliente", conn);
            cmd.Parameters.AddWithValue("@id_cliente", id_cliente);

            var asignaciones = new List<AsignarPlanDTO>();
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                asignaciones.Add(new AsignarPlanDTO
                {
                    Id_plan = reader.GetInt32(0),
                    Id_cliente = reader.GetInt32(1),
                    Fecha_inicio = reader.GetDateTime(2),
                    Fecha_fin = reader.GetDateTime(3)
                });
            }
            return asignaciones;
        }
        
        public async Task AsociarPaciente(int id_nutricionista, int id_cliente)
        {
            using var conn = _db.GetConnection();
            await conn.OpenAsync();

            using var cmd = new SqlCommand(
                "INSERT INTO ClientexNutricionista (id_nutricionista, id_cliente) " + 
                "VALUES (@id_nutricionista, @id_cliente)", conn);
            cmd.Parameters.AddWithValue("@id_nutricionista", id_nutricionista);
            cmd.Parameters.AddWithValue("@id_cliente", id_cliente);

            await cmd.ExecuteNonQueryAsync();
        }

        // ============================================================
        // VALIDACION DE RELACION NUTRICIONISTA <-> PACIENTE
        // ============================================================
        public async Task<bool> EsPacienteDelNutricionista(int id_nutricionista, int id_cliente)
        {
            using var conn = _db.GetConnection();
            await conn.OpenAsync();

            using var cmd = new SqlCommand(
                "SELECT COUNT(1) FROM dbo.ClientexNutricionista " +
                "WHERE id_nutricionista = @id_nutricionista AND id_cliente = @id_cliente", conn);
            cmd.Parameters.AddWithValue("@id_nutricionista", id_nutricionista);
            cmd.Parameters.AddWithValue("@id_cliente", id_cliente);

            var count = (int)await cmd.ExecuteScalarAsync();
            return count > 0;
        }

        public async Task<List<FechaConRegistroDTO>> ObtenerFechasConRegistro(int id_cliente)
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();

            string query = @"
                SELECT 
                    rd.Fecha AS Fecha,
                    COUNT(DISTINCT rd.id_registro) AS Cantidad_tiempos,
                    ISNULL(SUM(p.Energia * (rp.Cantidad / NULLIF(p.Porcion, 0))), 0) AS Total_dia
                FROM Registro_Diario rd
                LEFT JOIN RegistroxProducto rp ON rd.id_registro = rp.id_registro
                LEFT JOIN Producto p ON rp.id_producto = p.id_producto
                WHERE rd.id_cliente = @idCliente
                GROUP BY rd.Fecha
                ORDER BY rd.Fecha DESC";

            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@idCliente", id_cliente);

            var fechas = new List<FechaConRegistroDTO>();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                fechas.Add(new FechaConRegistroDTO
                {
                    Fecha = reader.GetDateTime(0),
                    Cantidad_tiempos = reader.GetInt32(1),
                    Total_dia = reader.GetDecimal(2)
                });
            }

            return fechas;
        }

        public async Task<List<ComidaConsumidaDTO>> ObtenerConsumoPaciente(int id_cliente, DateTime fecha)
        {
            using var connection = _db.GetConnection();
            await connection.OpenAsync();
            string query = @"
                SELECT 
                    rd.Tiempo AS Tiempo,
                    p.Descripcion AS Producto,
                    rp.Cantidad AS Cantidad,
                    (p.Energia * rp.Cantidad) AS Calorias
                FROM Registro_Diario rd
                INNER JOIN RegistroxProducto rp ON rd.id_registro = rp.id_registro
                INNER JOIN Producto p ON rp.id_producto = p.id_producto
                WHERE rd.id_cliente = @idCliente 
                AND rd.Fecha = @fecha";

            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@idCliente", id_cliente);
            command.Parameters.AddWithValue("@fecha", fecha.Date);

            var listaFilas = new List<ComidaConsumidaDTO>();

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                listaFilas.Add(new ComidaConsumidaDTO
                {
                    Tiempo = reader.GetString(0),
                    Producto = reader.GetString(1),
                    Cantidad = reader.GetDecimal(2),
                    Calorias = reader.GetDecimal(3)
                });
            }

            return listaFilas;
        }

        public async Task<RegistroDiarioDTO> ObtenerRegistroDiario(int id_cliente, DateTime fecha)
        {
            List<ComidaConsumidaDTO> filasClean = await ObtenerConsumoPaciente(id_cliente, fecha.Date);
            List<TiempoComidaDTO> registrosAcomodados = new List<TiempoComidaDTO>();
            decimal totalDia = 0;

            foreach (var fila in filasClean)
            {
                var tiempoExistente = registrosAcomodados.FirstOrDefault(t => t.Tiempo.Equals(fila.Tiempo, StringComparison.OrdinalIgnoreCase));

                if (tiempoExistente == null)
                {
                    tiempoExistente = new TiempoComidaDTO
                    {
                        Tiempo = fila.Tiempo,
                        Productos = new List<Producto>()
                    };
                    registrosAcomodados.Add(tiempoExistente);
                }

                var nuevoProducto = new Producto
                {
                    Descripcion = fila.Producto,
                    Energia = fila.Calorias, 
                    Tamano = fila.Cantidad 
                };

                tiempoExistente.Productos.Add(nuevoProducto);
                totalDia += fila.Calorias;
            }

            return new RegistroDiarioDTO
            {
                Id_cliente = id_cliente,
                Fecha = fecha,
                Total_dia = totalDia,
                Registros = registrosAcomodados
            };
        }

        // ============================================================
        // METODOS DE MONGODB ATLAS (SEGUIMIENTO / FORO)
        // ============================================================

        // 1. Obtener todos los hilos de foro/retoalimentacion de un paciente especifico
        public async Task<List<Retroalimentacion>> ObtenerForosPorPaciente(int idCliente)
        {
            return await _retroCollection.Find(r => r.IdCliente == idCliente)
                                         .SortByDescending(r => r.FechaCreacion)
                                         .ToListAsync();
        }

        // 2. Crear una nueva retroalimentación en prosa (Iniciar un hilo de foro)
        public async Task CrearRetroalimentacionAsync(Retroalimentacion retro)
        {
            await _retroCollection.InsertOneAsync(retro);
        }

        // 3. Agregar una respuesta de prosa a un foro existente de forma ilimitada
        public async Task AgregarRespuestaForoAsync(string idForo, RespuestaForo respuesta)
        {
            var filter = Builders<Retroalimentacion>.Filter.Eq(r => r.Id, idForo);
            var update = Builders<Retroalimentacion>.Update.Push(r => r.Respuestas, respuesta);

            await _retroCollection.UpdateOneAsync(filter, update);
        }

        // 4. Obtener un solo hilo de foro por su Id (util para validar dueño antes de responder)
        public async Task<Retroalimentacion> ObtenerForoPorId(string idForo)
        {
            return await _retroCollection.Find(r => r.Id == idForo).FirstOrDefaultAsync();
        }
    }
}