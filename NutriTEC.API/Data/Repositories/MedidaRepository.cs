using Microsoft.EntityFrameworkCore;
using NutriTEC.API.Data;
using NutriTEC.API.Models;

namespace NutriTEC.API.Data.Repositories
{
    public class MedidaRepository
    {
        private readonly NutriTECContext _context;

        public MedidaRepository(NutriTECContext context)
        {
            _context = context;
        }

        public async Task<int> RegistrarMedida(Medida medida)
        {
            _context.Medida.Add(medida);
            await _context.SaveChangesAsync();
            return medida.Id_medida;
        }

        public async Task<List<Medida>> ObtenerPorUsuario(int idUsuario)
        {
            return await _context.Medida
                .Where(m => m.Id_usuario == idUsuario)
                .OrderBy(m => m.Fecha)
                .ToListAsync();
        }
    }
}
