using Microsoft.EntityFrameworkCore;
using System.Data;
using NutriTEC.API.Data;
using NutriTEC.API.Models;
using Microsoft.Data.SqlClient;

namespace NutriTEC.API.Data.Repositories
{
    public class ProductoRepository
    {
        private readonly NutriTECContext _context;

        public ProductoRepository(NutriTECContext context)
        {
            _context = context;
        }

        public async Task<bool> CodigoExiste(string codigo)
        {
            return await _context.Producto
                .AnyAsync(p => p.Codigo == codigo);
        }

        public async Task<int> CrearProducto(Producto producto)
        {
            _context.Producto.Add(producto);
            await _context.SaveChangesAsync();

            if (producto.Vitaminas != null)
            {
                foreach (var vitamina in producto.Vitaminas)
                {
                    _context.VitaminasxProducto.Add(new VitaminaxProducto
                    {
                        Id_producto = producto.Id_producto,
                        Vitamina = vitamina
                    });
                }
                await _context.SaveChangesAsync();
            }

            return producto.Id_producto;
        }

        public async Task<Producto?> ObtenerProducto(int id)
        {
            var producto = await _context.Producto
                .FirstOrDefaultAsync(p => p.Id_producto == id);

            if (producto == null) return null;

            producto.Vitaminas = await _context.VitaminasxProducto
                .Where(v => v.Id_producto == id)
                .Select(v => v.Vitamina)
                .ToListAsync();

            return producto;
        }

        public async Task<List<Producto>> ObtenerProductos()
        {
            return await _context.Producto
                .OrderBy(p => p.Id_producto)
                .ToListAsync();
        }

        public async Task<List<Producto>> ObtenerProductosAprobados()
        {
            return await _context.Producto
                .Where(p => p.Estado == "aprobado")
                .OrderBy(p => p.Descripcion)
                .ToListAsync();
        }

        public async Task ActualizarProducto(int id, Producto producto)
        {
            var existing = await _context.Producto
                .FirstOrDefaultAsync(p => p.Id_producto == id);

            if (existing == null) return;

            existing.Codigo = producto.Codigo;
            existing.Descripcion = producto.Descripcion;
            existing.Tamano = producto.Tamano;
            existing.Porcion = producto.Porcion;
            existing.Energia = producto.Energia;
            existing.Grasa = producto.Grasa;
            existing.Sodio = producto.Sodio;
            existing.Carbohidratos = producto.Carbohidratos;
            existing.Proteina = producto.Proteina;
            existing.Calcio = producto.Calcio;
            existing.Hierro = producto.Hierro;

            await _context.SaveChangesAsync();
        }

        public bool EliminarProducto(int id)
        {
            var connection = _context.Database.GetDbConnection();
            connection.Open();

            using var command = connection.CreateCommand();
            command.CommandText = "sp_EliminarProducto";
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new SqlParameter("@id_producto", id));
            command.ExecuteNonQuery();

            return true;
        }

        public async Task AprobarProducto(int id)
        {
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var command = connection.CreateCommand();
            command.CommandText = "sp_AprobarProducto";
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new SqlParameter("@id_producto", id));

            await command.ExecuteNonQueryAsync();
        }

        public bool ProductoEstaEnUso(int idProducto)
        {
            return _context.ProductoxReceta.Any(pr => pr.Id_producto == idProducto) ||
                   _context.ProductoxPlan.Any(pp => pp.Id_producto == idProducto) ||
                   _context.RegistroxProducto.Any(rp => rp.Id_producto == idProducto);
        }
    }
}