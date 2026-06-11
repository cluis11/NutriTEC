using NutriTEC.API.Data.Connection;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;

namespace NutriTEC.API.Data.Repositories
{
    public class ClienteRepository
    {
        private readonly DatabaseConnection _db;

        public ClienteRepository(DatabaseConnection db)
        {
            _db = db;
        }

        public Task<Cliente> ObtenerCliente(int id) => throw new NotImplementedException();
        public Task<int> CrearCliente(Cliente cliente) => throw new NotImplementedException();
        public Task ActualizarCliente(Cliente cliente) => throw new NotImplementedException();
        public Task<bool> CorreoExiste(string correo) => throw new NotImplementedException();
        public Task RegistrarMedida(Medida medida) => throw new NotImplementedException();
        public Task<bool> MedidaExiste(int id_cliente, DateTime fecha) => throw new NotImplementedException();
        public Task<List<MedidaVariacionDTO>> ObtenerReporteAvance(int id_cliente, DateTime fecha_inicio, DateTime fecha_fin) => throw new NotImplementedException();
    }
}
