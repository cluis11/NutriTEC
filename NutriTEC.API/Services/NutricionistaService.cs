using NutriTEC.API.Data.Repositories;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;

namespace NutriTEC.API.Services
{
    public class NutricionistaService
    {
        private readonly NutricionistaRepository _nutricionistaRepository;

        public NutricionistaService(NutricionistaRepository nutricionistaRepository)
        {
            _nutricionistaRepository = nutricionistaRepository;
        }

        public Task<int> Registro(Nutricionista nutricionista, string foto_base64) => throw new NotImplementedException();
        public Task<Nutricionista> ObtenerPerfil(int id) => throw new NotImplementedException();
        public Task ActualizarPerfil(int id, Nutricionista nutricionista, string foto_base64) => throw new NotImplementedException();
        public Task<List<Cliente>> ObtenerPacientes(int id_nutricionista) => throw new NotImplementedException();
        public Task<List<ClienteDisponibleDTO>> ObtenerPacientesDisponibles() => throw new NotImplementedException();
        public Task AsociarPaciente(int id_nutricionista, int id_cliente) => throw new NotImplementedException();
        public Task<RegistroDiarioDTO> ObtenerRegistroDiario(int id_cliente, DateTime fecha) => throw new NotImplementedException();
    }
}
