using BCrypt.Net;
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

        public async Task<int> Registro(Nutricionista nutricionista)
        {
            if (await _nutricionistaRepository.CorreoExiste(nutricionista.Correo))
                throw new InvalidOperationException("El correo ya está registrado");

            nutricionista.Contrasena = BCrypt.Net.BCrypt.HashPassword(nutricionista.Contrasena);
            nutricionista.Foto = null;

            return await _nutricionistaRepository.CrearNutricionista(nutricionista);
        }

        public async Task<Nutricionista> ObtenerPerfil(int id)
        {
            var nutricionista = await _nutricionistaRepository.ObtenerNutricionista(id);

            if (nutricionista == null)
                throw new KeyNotFoundException("Nutricionista no encontrado");

            return nutricionista;
        }

        public async Task ActualizarPerfil(int id, Nutricionista nutricionista)
        {
            var existing = await _nutricionistaRepository.ObtenerNutricionista(id);
            if (existing == null)
                throw new KeyNotFoundException("Nutricionista no encontrado");

            if (nutricionista.Correo != existing.Correo)
                if (await _nutricionistaRepository.CorreoExiste(nutricionista.Correo))
                    throw new InvalidOperationException("El correo ya está registrado");

            nutricionista.Contrasena = BCrypt.Net.BCrypt.HashPassword(nutricionista.Contrasena);
            nutricionista.Id_usuario = id;

            await _nutricionistaRepository.ActualizarNutricionista(nutricionista);
        }

        public Task<List<Cliente>> ObtenerPacientes(int id_nutricionista) => throw new NotImplementedException();
        public Task<List<ClienteDisponibleDTO>> ObtenerPacientesDisponibles() => throw new NotImplementedException();
        public Task AsociarPaciente(int id_nutricionista, int id_cliente) => throw new NotImplementedException();
        public Task<RegistroDiarioDTO> ObtenerRegistroDiario(int id_cliente, DateTime fecha) => throw new NotImplementedException();
    }
}