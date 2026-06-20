using Microsoft.EntityFrameworkCore;
using NutriTEC.API.Data;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;

namespace NutriTEC.API.Data.Repositories
{
    public class AuthRepository
    {
        private readonly NutriTECContext _context;

        public AuthRepository(NutriTECContext context)
        {
            _context = context;
        }

        public async Task<Usuario?> ObtenerUsuarioPorCorreo(string correo)
        {
            return await _context.Usuario
                .FirstOrDefaultAsync(u => u.Correo == correo);
        }

        public async Task<bool> EsNutricionista(int id_usuario)
        {
            return await _context.Nutricionista
                .AnyAsync(n => n.Id_usuario == id_usuario);
        }

        public async Task<bool> EsCliente(int id_usuario)
        {
            return await _context.Cliente
                .AnyAsync(c => c.Id_usuario == id_usuario);
        }

        public async Task<string?> ObtenerPasswordAdmin(string correo)
        {
            var admin = await _context.Admin
                .FirstOrDefaultAsync(a => a.Correo == correo);
            return admin?.Contrasena;
        }

        public async Task<PlanActivoDTO?> ObtenerPlanActivo(int id_cliente)
        {
            var hoy = DateTime.Today;

            return await _context.PlanxCliente
                .Where(pc => pc.Id_cliente == id_cliente && hoy >= pc.Inicio && hoy <= pc.Fin)
                .Join(_context.PlanAlimentacion,
                    pc => pc.Id_plan,
                    p => p.Id_plan,
                    (pc, p) => new PlanActivoDTO
                    {
                        Id_plan = p.Id_plan,
                        Nombre = p.Nombre
                    })
                .FirstOrDefaultAsync();
        }
    }
}