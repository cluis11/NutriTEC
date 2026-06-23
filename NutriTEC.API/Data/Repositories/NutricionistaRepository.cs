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
    public class NutricionistaRepository
    {
        private readonly NutriTECContext _context;
        private readonly IMongoCollection<Retroalimentacion> _retroCollection;

        public NutricionistaRepository(NutriTECContext context, MongoDatabaseConnection mongoConnection)
        {
            _context = context;
            _retroCollection = mongoConnection.GetDatabase().GetCollection<Retroalimentacion>("Retroalimentaciones");
        }

        public async Task<string> ObtenerContrasena(int id)
        {
            var usuario = await _context.Usuario
                .FirstOrDefaultAsync(u => u.Id_usuario == id);
            return usuario?.Contrasena ?? string.Empty;
        }

        public async Task<string?> ObtenerFoto(int id)
        {
            var nutri = await _context.Nutricionista
                .FirstOrDefaultAsync(n => n.Id_usuario == id);
            return nutri?.Foto;
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

        public async Task<List<PacienteActivoDTO>> ObtenerPacientes(int id_nutricionista)
        {
            return await _context.ClientexNutricionista
                .Where(cn => cn.Id_nutricionista == id_nutricionista)
                .Join(_context.Usuario,
                    cn => cn.Id_cliente,
                    u => u.Id_usuario,
                    (cn, u) => new { cn, u })
                .Join(_context.Cliente,
                    x => x.cn.Id_cliente,
                    c => c.Id_usuario,
                    (x, c) => new PacienteActivoDTO
                    {
                        Id_usuario = x.u.Id_usuario,
                        Nombre = x.u.Nombre,
                        Ap1 = x.u.Ap1,
                        Ap2 = x.u.Ap2 ?? string.Empty,
                        Fecha_nacimiento = x.u.Fecha_nacimiento,
                        Correo = x.u.Correo,
                        Pais = c.Pais,
                        Consumo_maximo = (int)c.Consumo_maximo
                    })
                .ToListAsync();
        }

        public async Task<List<ClienteDisponibleDTO>> ObtenerClientes()
        {
            var clientesConNutri = await _context.ClientexNutricionista
                .Select(cn => cn.Id_cliente)
                .ToListAsync();

            return await _context.Cliente
                .Where(c => !clientesConNutri.Contains(c.Id_usuario))
                .Join(_context.Usuario,
                    c => c.Id_usuario,
                    u => u.Id_usuario,
                    (c, u) => new ClienteDisponibleDTO
                    {
                        Id_usuario = u.Id_usuario,
                        Nombre = u.Nombre,
                        Ap1 = u.Ap1,
                        Ap2 = u.Ap2 ?? string.Empty,
                        Fecha_nacimiento = u.Fecha_nacimiento,
                        Correo = u.Correo,
                        Pais = c.Pais
                    })
                .ToListAsync();
        }

        public async Task<List<AsignarPlanDTO>> ObtenerAsignacionesCliente(int id_cliente)
        {
            return await _context.PlanxCliente
                .Where(pc => pc.Id_cliente == id_cliente)
                .Select(pc => new AsignarPlanDTO
                {
                    Id_plan = pc.Id_plan,
                    Id_cliente = pc.Id_cliente,
                    Fecha_inicio = pc.Inicio,
                    Fecha_fin = pc.Fin
                })
                .ToListAsync();
        }

        public async Task AsociarPaciente(int id_nutricionista, int id_cliente)
        {
            _context.ClientexNutricionista.Add(new ClientexNutricionista
            {
                Id_nutricionista = id_nutricionista,
                Id_cliente = id_cliente
            });
            await _context.SaveChangesAsync();
        }

        // ============================================================
        // VALIDACION DE RELACION NUTRICIONISTA <-> PACIENTE
        // ============================================================
        public async Task<bool> EsPacienteDelNutricionista(int id_nutricionista, int id_cliente)
        {
            return await _context.ClientexNutricionista
                .AnyAsync(cn => cn.Id_nutricionista == id_nutricionista && cn.Id_cliente == id_cliente);
        }

        public async Task<List<FechaConRegistroDTO>> ObtenerFechasConRegistro(int id_cliente)
        {
            var registros = await _context.Registro_Diario
                .Where(rd => rd.Id_cliente == id_cliente)
                .GroupJoin(_context.RegistroxProducto,
                    rd => rd.Id_registro,
                    rp => rp.Id_registro,
                    (rd, rps) => new { rd, rps })
                .SelectMany(
                    x => x.rps.DefaultIfEmpty(),
                    (x, rp) => new { x.rd, rp })
                .GroupJoin(_context.Producto,
                    x => x.rp != null ? x.rp.Id_producto : 0,
                    p => p.Id_producto,
                    (x, ps) => new { x.rd, x.rp, ps })
                .SelectMany(
                    x => x.ps.DefaultIfEmpty(),
                    (x, p) => new { x.rd, x.rp, p })
                .GroupBy(x => x.rd.Fecha)
                .Select(g => new FechaConRegistroDTO
                {
                    Fecha = g.Key,
                    Cantidad_tiempos = g.Select(x => x.rd.Id_registro).Distinct().Count(),
                    Total_dia = g.Sum(x => x.rp != null && x.p != null && x.p.Porcion != 0
                        ? x.p.Energia * (x.rp.Cantidad / x.p.Porcion)
                        : 0)
                })
                .OrderByDescending(f => f.Fecha)
                .ToListAsync();

            return registros;
        }

        public async Task<List<ComidaConsumidaDTO>> ObtenerConsumoPaciente(int id_cliente, DateTime fecha)
        {
            return await _context.Registro_Diario
                .Where(rd => rd.Id_cliente == id_cliente && rd.Fecha == fecha.Date)
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

        // 1. Obtener todos los hilos de foro/retroalimentacion de un paciente especifico
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