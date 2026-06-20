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

        public Task ActualizarPerfil(int id, Nutricionista nutricionista) => throw new NotImplementedException();

        public Task<List<PacienteActivoDTO>> ObtenerClientesActivos(int id_nutricionista)
        {
            return _nutricionistaRepository.ObtenerPacientes(id_nutricionista);
        }

        public Task<List<ClienteDisponibleDTO>> ObtenerClientesDisponibles()
        {
            return _nutricionistaRepository.ObtenerClientes();
        }

        public Task<List<AsignarPlanDTO>> ObtenerAsignacionesCliente(int id_cliente)
        {
            return _nutricionistaRepository.ObtenerAsignacionesCliente(id_cliente);
        }

        public async Task AsociarPaciente(int id_nutricionista, int id_cliente)
        {
            await _nutricionistaRepository.AsociarPaciente(id_nutricionista, id_cliente);
        }

        public async Task<List<FechaConRegistroDTO>> ObtenerFechasConRegistro(int id_nutricionista, int id_cliente)
        {
            var esPaciente = await _nutricionistaRepository.EsPacienteDelNutricionista(id_nutricionista, id_cliente);
            if (!esPaciente)
                throw new UnauthorizedAccessException("El cliente indicado no es paciente de este nutricionista.");

            return await _nutricionistaRepository.ObtenerFechasConRegistro(id_cliente);
        }

        public async Task<RegistroDiarioDTO> ObtenerRegistroDiario(int id_nutricionista, int id_cliente, DateTime fecha)
        {
            var esPaciente = await _nutricionistaRepository.EsPacienteDelNutricionista(id_nutricionista, id_cliente);
            if (!esPaciente)
                throw new UnauthorizedAccessException("El cliente indicado no es paciente de este nutricionista.");

            return await _nutricionistaRepository.ObtenerRegistroDiario(id_cliente, fecha);
        }

        // ============================================================
        // SERVICIOS MONGODB ATLAS (FORO)
        // ============================================================

        // Solo el nutricionista asignado al paciente puede ver su foro
        public async Task<List<Retroalimentacion>> ObtenerForoPaciente(int id_nutricionista, int idCliente)
        {
            var esPaciente = await _nutricionistaRepository.EsPacienteDelNutricionista(id_nutricionista, idCliente);
            if (!esPaciente)
                throw new UnauthorizedAccessException("El cliente indicado no es paciente de este nutricionista.");

            return await _nutricionistaRepository.ObtenerForosPorPaciente(idCliente);
        }

        // Solo se puede iniciar retroalimentacion sobre un paciente propio
        public async Task IniciarRetroalimentacion(Retroalimentacion retro)
        {
            var esPaciente = await _nutricionistaRepository.EsPacienteDelNutricionista(retro.IdNutricionista, retro.IdCliente);
            if (!esPaciente)
                throw new UnauthorizedAccessException("El cliente indicado no es paciente de este nutricionista.");

            if (string.IsNullOrWhiteSpace(retro.MensajeInicial) && retro.Respuestas != null && retro.Respuestas.Count > 0)
                retro.MensajeInicial = retro.Respuestas[0].Mensaje;

            retro.FechaCreacion = DateTime.UtcNow;
            await _nutricionistaRepository.CrearRetroalimentacionAsync(retro);
        }

        // Solo el nutricionista dueño del foro puede responder en este endpoint.
        public async Task ResponderForo(int id_nutricionista, string idForo, RespuestaForo respuesta)
        {
            var foro = await _nutricionistaRepository.ObtenerForoPorId(idForo);
            if (foro == null)
                throw new KeyNotFoundException("El foro indicado no existe.");

            if (foro.IdNutricionista != id_nutricionista)
                throw new UnauthorizedAccessException("Este foro no pertenece a este nutricionista.");

            respuesta.Fecha = DateTime.UtcNow;
            respuesta.Remitente = "Nutricionista";
            await _nutricionistaRepository.AgregarRespuestaForoAsync(idForo, respuesta);
        }
    }
}