using NutriTEC.API.Data.Repositories;
using NutriTEC.API.DTOs;

namespace NutriTEC.API.Services
{
    public class AuthService
    {
        private readonly AuthRepository _authRepository;

        public AuthService(AuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        public async Task<LoginResponseDTO?> Login(LoginRequestDTO request)
        {
            var usuario = await _authRepository.ObtenerUsuarioPorCorreo(request.Correo);

            if (usuario == null || usuario.Contrasena != request.Contrasena)
                return null;

            return new LoginResponseDTO
            {
                Token = "pendiente",
                Rol = "pendiente",
                Id_usuario = usuario.Id_usuario,
                Nombre = usuario.Nombre,
                Ap1 = usuario.Ap1
            };
        }
    }
}