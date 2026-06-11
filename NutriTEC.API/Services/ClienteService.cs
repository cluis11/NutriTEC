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
        public Task<RegistroDiarioDTO> ObtenerRegistroDiario(int id_cliente, DateTime fecha) => throw new NotImplementedException();
        public Task RegistrarProducto(int id_cliente, DateTime fecha, string tiempo, int id_producto, decimal cantidad) => throw new NotImplementedException();
        public Task RegistrarDesdePlan(int id_cliente, DateTime fecha, string tiempo) => throw new NotImplementedException();
        public Task RegistrarDesdeReceta(int id_cliente, DateTime fecha, string tiempo, int id_receta) => throw new NotImplementedException();
    }
}
