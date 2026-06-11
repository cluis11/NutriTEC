using Microsoft.AspNetCore.Mvc;
using NutriTEC.API.DTOs;
using NutriTEC.API.Services;

namespace NutriTEC.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO request)
        {
            var response = await _authService.Login(request);

            if (response == null)
                return Unauthorized(new { mensaje = "Credenciales inválidas" });

            return Ok(response);
        }
    }
}