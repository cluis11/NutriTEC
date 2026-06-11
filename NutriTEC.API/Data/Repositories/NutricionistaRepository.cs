using NutriTEC.API.Data.Connection;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;

namespace NutriTEC.API.Data.Repositories
{
    public class NutricionistaRepository
    {
        private readonly DatabaseConnection _db;

        public NutricionistaRepository(DatabaseConnection db)
        {
            _db = db;
        }

        public Task<Nutricionista> ObtenerNutricionista(int id) => throw new NotImplementedException();
        public Task<int> CrearNutricionista(Nutricionista nutricionista) => throw new NotImplementedException();
        public Task ActualizarNutricionista(Nutricionista nutricionista) => throw new NotImplementedException();
        public Task<bool> CorreoExiste(string correo) => throw new NotImplementedException();
        public Task<List<Cliente>> ObtenerPacientes(int id_nutricionista) => throw new NotImplementedException();
        public Task<List<ClienteDisponibleDTO>> ObtenerPacientesDisponibles() => throw new NotImplementedException();
        public Task AsociarPaciente(int id_nutricionista, int id_cliente) => throw new NotImplementedException();
        public Task<List<RegistroDiarioDTO>> ObtenerRegistroDiario(int id_cliente, DateTime fecha) => throw new NotImplementedException();
    }
}
