using BCrypt.Net;
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

        public async Task<int> Registro(Cliente cliente)
        {
            if (await _clienteRepository.CorreoExiste(cliente.Correo))
                throw new InvalidOperationException("El correo ya está registrado");

            cliente.Contrasena = BCrypt.Net.BCrypt.HashPassword(cliente.Contrasena);

            return await _clienteRepository.CrearCliente(cliente);
        }

        public async Task<Cliente> ObtenerPerfil(int id)
        {
            var cliente = await _clienteRepository.ObtenerCliente(id);
            if (cliente == null)
                throw new KeyNotFoundException("Cliente no encontrado");
            return cliente;
        }

        public async Task ActualizarPerfil(int id, Cliente cliente)
        {
            var existing = await _clienteRepository.ObtenerCliente(id);
            if (existing == null)
                throw new KeyNotFoundException("Cliente no encontrado");

            if (cliente.Correo != existing.Correo)
                if (await _clienteRepository.CorreoExiste(cliente.Correo))
                    throw new InvalidOperationException("El correo ya está registrado");

            if (!string.IsNullOrWhiteSpace(cliente.Contrasena))
                cliente.Contrasena = BCrypt.Net.BCrypt.HashPassword(cliente.Contrasena);
            else
                cliente.Contrasena = await _clienteRepository.ObtenerContrasena(id);

            cliente.Id_usuario = id;

            await _clienteRepository.ActualizarCliente(cliente);
        }

        public async Task<RegistroDiarioDTO> ObtenerRegistroDiario(int id_cliente, DateTime fecha)
        {
            List<ComidaConsumidaDTO> filasClean = await _clienteRepository.ObtenerConsumo(id_cliente, fecha.Date);

            List<TiempoComidaDTO> registrosAcomodados = new List<TiempoComidaDTO>();
            decimal totalDia = 0;

            foreach (var fila in filasClean)
            {
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
            await _clienteRepository.RegistrarComida(request);
            var (excedido, mensajeAlerta) = await _clienteRepository.ExcesoCalorico(idCliente, request.Fecha);
            return (excedido, mensajeAlerta);
        }

        // ============================================================
        // REGISTRO DESDE PLAN Y RECETA (nuevos)
        // ============================================================

        public async Task<(bool Excedido, string MensajeAlerta)> RegistrarDesdePlan(int idCliente, DateTime fecha, string tiempo)
        {
            await _clienteRepository.RegistrarDesdePlan(idCliente, fecha, tiempo);
            return await _clienteRepository.ExcesoCalorico(idCliente, fecha);
        }

        public async Task<(bool Excedido, string MensajeAlerta)> RegistrarDesdeReceta(int idCliente, DateTime fecha, string tiempo, int idReceta)
        {
            await _clienteRepository.RegistrarDesdeReceta(idCliente, fecha, tiempo, idReceta);
            return await _clienteRepository.ExcesoCalorico(idCliente, fecha);
        }

        public async Task<PlanActivoConProductosDTO?> ObtenerPlanActivoConProductos(int idCliente)
        {
            return await _clienteRepository.ObtenerPlanActivoConProductos(idCliente);
        }

        // ============================================================
        // SERVICIOS MONGODB ATLAS (FORO - LADO CLIENTE)
        // ============================================================

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