using NutriTEC.API.Data.Repositories;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;

namespace NutriTEC.API.Services
{
    public class MedidaService
    {
        private readonly MedidaRepository _medidaRepository;

        public MedidaService(MedidaRepository medidaRepository)
        {
            _medidaRepository = medidaRepository;
        }

        public async Task<int> RegistrarMedida(RegistrarMedidaDTO dto)
        {
            var medida = new Medida
            {
                Id_usuario = dto.Id_usuario,
                Fecha = dto.Fecha,
                Cintura = dto.Cintura,
                Cuello = dto.Cuello,
                Caderas = dto.Caderas,
                P_musculo = dto.P_musculo,
                P_grasa = dto.P_grasa
            };

            return await _medidaRepository.RegistrarMedida(medida);
        }

        public async Task<List<Medida>> ObtenerPorUsuario(int idUsuario)
        {
            return await _medidaRepository.ObtenerPorUsuario(idUsuario);
        }
    }
}