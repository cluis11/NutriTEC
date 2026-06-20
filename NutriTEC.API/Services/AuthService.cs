using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using NutriTEC.API.Data.Repositories;
using NutriTEC.API.DTOs;

namespace NutriTEC.API.Services
{
    public class AuthService
    {
        private readonly AuthRepository _authRepository;
        private readonly IConfiguration _configuration;

        public AuthService(AuthRepository authRepository, IConfiguration configuration)
        {
            _authRepository = authRepository;
            _configuration = configuration;
        }

        public async Task<LoginResponseDTO?> Login(LoginRequestDTO request)
        {
            // 1. Buscar en Usuario por correo
            var usuario = await _authRepository.ObtenerUsuarioPorCorreo(request.Correo);

            if (usuario != null)
            {
                // 2. Verificar password
                if (usuario.Contrasena != request.Contrasena)
                    return null;

                // 3. Determinar rol
                if (await _authRepository.EsNutricionista(usuario.Id_usuario))
                {
                    return new LoginResponseDTO
                    {
                        Token = GenerarToken(usuario.Id_usuario, "nutricionista"),
                        Rol = "nutricionista",
                        Id_usuario = usuario.Id_usuario,
                        Nombre = usuario.Nombre,
                        Ap1 = usuario.Ap1
                    };
                }

                if (await _authRepository.EsCliente(usuario.Id_usuario))
                {
                    var planActivo = await _authRepository.ObtenerPlanActivo(usuario.Id_usuario);

                    return new LoginClienteResponseDTO
                    {
                        Token = GenerarToken(usuario.Id_usuario, "cliente"),
                        Rol = "cliente",
                        Id_usuario = usuario.Id_usuario,
                        Nombre = usuario.Nombre,
                        Ap1 = usuario.Ap1,
                        Plan_activo = planActivo
                    };
                }
            }

            // 4. Buscar en Admin por correo
            if (await _authRepository.EsAdmin(request.Correo, request.Contrasena))
            {
                // TODO: verificar password del admin cuando se implemente tabla Admin con password
                return new LoginResponseDTO
                {
                    Token = GenerarToken(0, "admin"),
                    Rol = "admin",
                    Id_usuario = 0,
                    Nombre = "Administrador",
                    Ap1 = ""
                };
            }

            return null;
        }

        private string GenerarToken(int id_usuario, string rol)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim("id_usuario", id_usuario.ToString()),
                new Claim("rol", rol)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}