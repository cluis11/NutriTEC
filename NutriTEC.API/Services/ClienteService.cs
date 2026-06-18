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
        public async Task RegistrarComida(RegistroComidaDTO request)
        {
            // Enviamos el objeto con los datos
            await _clienteRepository.RegistrarComida(request);
        }        public Task RegistrarProducto(int id_cliente, DateTime fecha, string tiempo, int id_producto, decimal cantidad) => throw new NotImplementedException();
        public Task RegistrarDesdePlan(int id_cliente, DateTime fecha, string tiempo) => throw new NotImplementedException();
        public Task RegistrarDesdeReceta(int id_cliente, DateTime fecha, string tiempo, int id_receta) => throw new NotImplementedException();
    }
}
