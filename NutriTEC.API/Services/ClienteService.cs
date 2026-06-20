using NutriTEC.API.Data.Repositories;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;

namespace NutriTEC.API.Services
{
    public class ClienteService
    {
        private readonly ClienteRepository _clienteRepository;

        public ClienteService(ClienteRepository clienteRepository)
        {
            _clienteRepository = clienteRepository;
        }

        public Task<int> Registro(Cliente cliente) => throw new NotImplementedException();
        public Task<Cliente> ObtenerPerfil(int id) => throw new NotImplementedException();
        public Task ActualizarPerfil(int id, Cliente cliente) => throw new NotImplementedException();
        public Task RegistrarMedida(int id_cliente, Medida medida) => throw new NotImplementedException();
        public Task<ReporteAvanceDTO> ObtenerReporteAvance(int id_cliente, DateTime fecha_inicio, DateTime fecha_fin) => throw new NotImplementedException();
        public async Task<RegistroDiarioDTO> ObtenerRegistroDiario(int id_cliente, DateTime fecha)
        {
        // Implementar repo con los imputs
        List<ComidaConsumidaDTO> filasClean = await _clienteRepository.ObtenerConsumo(id_cliente, fecha.Date);

        // Lista de comida aconodada por tiempo de comida
        List<TiempoComidaDTO> registrosAcomodados = new List<TiempoComidaDTO>();
        decimal totalDia = 0;

        // Acomodar fila
        foreach (var fila in filasClean)
        {
            // Obtener el tiempo de la comida
            TiempoComidaDTO tiempoExistente = null;
            foreach (var t in registrosAcomodados)
            {
                if (t.Tiempo == fila.Tiempo)
                {
                    tiempoExistente = t;
                    break;
                }
            }

            if (tiempoExistente == null)
            {
                tiempoExistente = new TiempoComidaDTO
                {
                    Tiempo = fila.Tiempo,
                    Productos = new List<Producto>()
                };
                registrosAcomodados.Add(tiempoExistente);
            }

            Producto nuevoProducto = new Producto
            {
                Descripcion = fila.Producto,
                Energia = fila.Calorias,
                Tamano = fila.Cantidad
            };

            tiempoExistente.Productos.Add(nuevoProducto);
            totalDia += fila.Calorias;
            }

            // retorna el 'RegistroDiarioDTO' 
            return new RegistroDiarioDTO
            {
                Id_cliente = id_cliente,
                Fecha = fecha,
                Total_dia = totalDia,
                Registros = registrosAcomodados
            };
        }
        public async Task<(bool Excedido, string MensajeAlerta)> RegistrarComida(int idCliente, RegistroComidaDTO request)
        {
            // 1. Guardar la comida en la base de datos delegando al repositorio
            await _clienteRepository.RegistrarComida(request);

            // 2. Invocar la validación del SP mediante el repositorio para mantener desacoplada la infraestructura
            var (excedido, mensajeAlerta) = await _clienteRepository.ExcesoCalorico(idCliente, request.Fecha);

            return (excedido, mensajeAlerta);
        }
        public Task RegistrarProducto(int id_cliente, DateTime fecha, string tiempo, int id_producto, decimal cantidad) => throw new NotImplementedException();
        public Task RegistrarDesdePlan(int id_cliente, DateTime fecha, string tiempo) => throw new NotImplementedException();
        public Task RegistrarDesdeReceta(int id_cliente, DateTime fecha, string tiempo, int id_receta) => throw new NotImplementedException();

        // ============================================================
        // SERVICIOS MONGODB ATLAS (FORO - LADO CLIENTE)
        // ============================================================

        // El cliente solo puede ver los foros que le pertenecen a el mismo
        public async Task<List<Retroalimentacion>> ObtenerForoPropio(int id_cliente)
        {
            return await _clienteRepository.ObtenerForosPorPaciente(id_cliente);
        }

        public async Task ResponderForo(int id_cliente, string idForo, RespuestaForo respuesta)
        {
            var foro = await _clienteRepository.ObtenerForoPorId(idForo);
            if (foro == null)
                throw new KeyNotFoundException("El foro indicado no existe.");

            if (foro.IdCliente != id_cliente)
                throw new UnauthorizedAccessException("Este foro no pertenece a este cliente.");

            respuesta.Fecha = DateTime.UtcNow;
            respuesta.Remitente = "Cliente";
            await _clienteRepository.AgregarRespuestaForoAsync(idForo, respuesta);
        }
    }
}