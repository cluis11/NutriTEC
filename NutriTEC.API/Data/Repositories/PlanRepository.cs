using Microsoft.EntityFrameworkCore;
using System.Data;
using NutriTEC.API.Data;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;
using Microsoft.Data.SqlClient;

namespace NutriTEC.API.Data.Repositories
{
    public class PlanRepository
    {
        private readonly NutriTECContext _context;

        public PlanRepository(NutriTECContext context)
        {
            _context = context;
        }

        public async Task<int> CrearPlan(PlanAlimentacion plan)
        {
            var nuevoPlan = new PlanAlimentacion
            {
                Id_nutricionista = plan.Id_nutricionista,
                Nombre = plan.Nombre
            };

            _context.PlanAlimentacion.Add(nuevoPlan);
            await _context.SaveChangesAsync();
            return nuevoPlan.Id_plan;
        }

        public async Task<PlanAlimentacion> ObtenerPlan(int id)
        {
            var plan = await _context.PlanAlimentacion
                .FirstOrDefaultAsync(p => p.Id_plan == id);

            if (plan == null)
                throw new Exception("El plan de alimentación no existe.");

            plan.Productos = await _context.ProductoxPlan
                .Where(pp => pp.Id_plan == id)
                .Join(_context.Producto,
                    pp => pp.Id_producto,
                    p => p.Id_producto,
                    (pp, p) => new ProductoxPlan
                    {
                        Id_plan = pp.Id_plan,
                        Id_producto = pp.Id_producto,
                        Tiempo = pp.Tiempo,
                        Cantidad = pp.Cantidad,
                        Descripcion = p.Descripcion
                    })
                .ToListAsync();

            return plan;
        }

        public async Task<List<PlanResumenDTO>> ObtenerPlanesPorNutricionista(int id_nutricionista)
        {
            return await _context.PlanAlimentacion
                .Where(p => p.Id_nutricionista == id_nutricionista)
                .Select(p => new PlanResumenDTO
                {
                    Id_plan = p.Id_plan,
                    Nombre = p.Nombre,
                    Completo = true,
                    Total_Calorias = (int)_context.ProductoxPlan
                        .Where(pp => pp.Id_plan == p.Id_plan)
                        .Join(_context.Producto,
                            pp => pp.Id_producto,
                            prod => prod.Id_producto,
                            (pp, prod) => prod.Energia * (pp.Cantidad / prod.Porcion))
                        .Sum()
                })
                .ToListAsync();
        }

        public async Task AgregarProducto(int id_plan, List<ProductoxPlan> productos)
        {
            foreach (var producto in productos)
            {
                _context.ProductoxPlan.Add(new ProductoxPlan
                {
                    Id_plan = id_plan,
                    Id_producto = producto.Id_producto,
                    Tiempo = producto.Tiempo,
                    Cantidad = producto.Cantidad
                });
            }
            await _context.SaveChangesAsync();
        }

        public async Task ActualizarPlan(PlanAlimentacion plan)
        {
            var existing = await _context.PlanAlimentacion
                .FirstOrDefaultAsync(p => p.Id_plan == plan.Id_plan);

            if (existing != null)
                existing.Nombre = plan.Nombre;

            var productosExistentes = await _context.ProductoxPlan
                .Where(pp => pp.Id_plan == plan.Id_plan)
                .ToListAsync();

            _context.ProductoxPlan.RemoveRange(productosExistentes);

            foreach (var prod in plan.Productos)
            {
                _context.ProductoxPlan.Add(new ProductoxPlan
                {
                    Id_plan = plan.Id_plan,
                    Id_producto = prod.Id_producto,
                    Tiempo = prod.Tiempo,
                    Cantidad = prod.Cantidad
                });
            }

            await _context.SaveChangesAsync();
        }

        public async Task<bool> TieneAsignacionesActivas(int id)
        {
            var hoy = DateTime.Today;
            return await _context.PlanxCliente
                .AnyAsync(pc => pc.Id_plan == id && hoy >= pc.Inicio && hoy <= pc.Fin);
        }

        public async Task EliminarPlan(int id_plan)
        {
            var productos = await _context.ProductoxPlan
                .Where(pp => pp.Id_plan == id_plan)
                .ToListAsync();
            _context.ProductoxPlan.RemoveRange(productos);

            var asignaciones = await _context.PlanxCliente
                .Where(pc => pc.Id_plan == id_plan)
                .ToListAsync();
            _context.PlanxCliente.RemoveRange(asignaciones);

            var plan = await _context.PlanAlimentacion
                .FirstOrDefaultAsync(p => p.Id_plan == id_plan);
            if (plan != null)
                _context.PlanAlimentacion.Remove(plan);

            await _context.SaveChangesAsync();
        }

        public async Task<List<PacienteActivoDTO>> ObtenerPacientes(int id_nutricionista)
        {
            return await _context.ClientexNutricionista
                .Where(cn => cn.Id_nutricionista == id_nutricionista)
                .Join(_context.Usuario,
                    cn => cn.Id_cliente,
                    u => u.Id_usuario,
                    (cn, u) => new { cn, u })
                .Join(_context.Cliente,
                    x => x.cn.Id_cliente,
                    c => c.Id_usuario,
                    (x, c) => new PacienteActivoDTO
                    {
                        Id_usuario = x.u.Id_usuario,
                        Nombre = x.u.Nombre,
                        Ap1 = x.u.Ap1,
                        Ap2 = x.u.Ap2 ?? string.Empty,
                        Fecha_nacimiento = x.u.Fecha_nacimiento,
                        Correo = x.u.Correo,
                        Pais = c.Pais,
                        Consumo_maximo = (int)c.Consumo_maximo
                    })
                .ToListAsync();
        }

        public async Task<List<ClienteDisponibleDTO>> ObtenerClientes()
        {
            var clientesConNutri = await _context.ClientexNutricionista
                .Select(cn => cn.Id_cliente)
                .ToListAsync();

            return await _context.Cliente
                .Where(c => !clientesConNutri.Contains(c.Id_usuario))
                .Join(_context.Usuario,
                    c => c.Id_usuario,
                    u => u.Id_usuario,
                    (c, u) => new ClienteDisponibleDTO
                    {
                        Id_usuario = u.Id_usuario,
                        Nombre = u.Nombre,
                        Ap1 = u.Ap1,
                        Ap2 = u.Ap2 ?? string.Empty,
                        Fecha_nacimiento = u.Fecha_nacimiento,
                        Correo = u.Correo,
                        Pais = c.Pais
                    })
                .ToListAsync();
        }

        public async Task AsignarCliente(int id_nutricionista, int id_cliente)
        {
            _context.ClientexNutricionista.Add(new ClientexNutricionista
            {
                Id_nutricionista = id_nutricionista,
                Id_cliente = id_cliente
            });
            await _context.SaveChangesAsync();
        }

        public async Task<List<AsignarPlanDTO>> ObtenerAsignacionesCliente(int id_cliente)
        {
            return await _context.PlanxCliente
                .Where(pc => pc.Id_cliente == id_cliente)
                .Select(pc => new AsignarPlanDTO
                {
                    Id_plan = pc.Id_plan,
                    Id_cliente = pc.Id_cliente,
                    Fecha_inicio = pc.Inicio,
                    Fecha_fin = pc.Fin
                })
                .ToListAsync();
        }

        public async Task AsignarPlan(int id_plan, int id_cliente, DateTime inicio, DateTime fin)
        {
            _context.PlanxCliente.Add(new PlanxCliente
            {
                Id_plan = id_plan,
                Id_cliente = id_cliente,
                Inicio = inicio,
                Fin = fin
            });
            await _context.SaveChangesAsync();
        }
    }
}
