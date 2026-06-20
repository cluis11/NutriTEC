using Microsoft.EntityFrameworkCore;
using NutriTEC.API.Data;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;

namespace NutriTEC.API.Data.Repositories
{
    public class RecetaRepository
    {
        private readonly NutriTECContext _context;

        public RecetaRepository(NutriTECContext context)
        {
            _context = context;
        }

        public async Task<int> CrearReceta(Receta receta)
        {
            var nuevaReceta = new Receta
            {
                Id_cliente = receta.Id_cliente,
                Nombre = receta.Nombre
            };

            _context.Receta.Add(nuevaReceta);
            await _context.SaveChangesAsync();

            foreach (var producto in receta.Productos)
            {
                _context.ProductoxReceta.Add(new ProductoxReceta
                {
                    Id_receta = nuevaReceta.Id_receta,
                    Id_producto = producto.Id_producto,
                    Cantidad = producto.Cantidad
                });
            }

            await _context.SaveChangesAsync();
            return nuevaReceta.Id_receta;
        }

        public async Task<Receta?> ObtenerReceta(int id)
        {
            var receta = await _context.Receta
                .FirstOrDefaultAsync(r => r.Id_receta == id);

            if (receta == null) return null;

            receta.Productos = await _context.ProductoxReceta
                .Where(pr => pr.Id_receta == id)
                .Join(_context.Producto,
                    pr => pr.Id_producto,
                    p => p.Id_producto,
                    (pr, p) => new ProductoxReceta
                    {
                        Id_receta = pr.Id_receta,
                        Id_producto = pr.Id_producto,
                        Cantidad = pr.Cantidad,
                        Descripcion = p.Descripcion,
                        Porcion = p.Porcion,
                        Energia = p.Energia,
                        Grasa = p.Grasa,
                        Sodio = p.Sodio,
                        Carbohidratos = p.Carbohidratos,
                        Proteina = p.Proteina,
                        Calcio = p.Calcio,
                        Hierro = p.Hierro
                    })
                .ToListAsync();

            return receta;
        }

        public async Task<List<RecetaResumenDTO>> ObtenerRecetasPorCliente(int id_cliente)
        {
            return await _context.Receta
                .Where(r => r.Id_cliente == id_cliente)
                .OrderBy(r => r.Id_receta)
                .Select(r => new RecetaResumenDTO
                {
                    Id_receta = r.Id_receta,
                    Nombre = r.Nombre
                })
                .ToListAsync();
        }

        public async Task AgregarProducto(int id_receta, ProductoxReceta producto)
        {
            _context.ProductoxReceta.Add(new ProductoxReceta
            {
                Id_receta = id_receta,
                Id_producto = producto.Id_producto,
                Cantidad = producto.Cantidad
            });
            await _context.SaveChangesAsync();
        }

        public async Task EliminarProductoDeReceta(int id_receta, int id_producto)
        {
            var item = await _context.ProductoxReceta
                .FirstOrDefaultAsync(pr => pr.Id_receta == id_receta && pr.Id_producto == id_producto);

            if (item != null)
            {
                _context.ProductoxReceta.Remove(item);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ProductoExisteEnReceta(int id_receta, int id_producto)
        {
            return await _context.ProductoxReceta
                .AnyAsync(pr => pr.Id_receta == id_receta && pr.Id_producto == id_producto);
        }

        public async Task ActualizarNombreReceta(int id, string nombre)
        {
            var receta = await _context.Receta
                .FirstOrDefaultAsync(r => r.Id_receta == id);

            if (receta != null)
            {
                receta.Nombre = nombre;
                await _context.SaveChangesAsync();
            }
        }

        public async Task EliminarReceta(int id)
        {
            var productos = await _context.ProductoxReceta
                .Where(pr => pr.Id_receta == id)
                .ToListAsync();

            _context.ProductoxReceta.RemoveRange(productos);

            var receta = await _context.Receta
                .FirstOrDefaultAsync(r => r.Id_receta == id);

            if (receta != null)
                _context.Receta.Remove(receta);

            await _context.SaveChangesAsync();
        }
    }
}
