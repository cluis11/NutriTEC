using NutriTEC.API.Data.Connection;
using NutriTEC.API.Models;
using NutriTEC.API.DTOs;
using Microsoft.Data.SqlClient;
using System.Data;

namespace NutriTEC.API.Data.Repositories
{
    public class PlanRepository
    {
        private readonly DatabaseConnection _db;

        public PlanRepository(DatabaseConnection db)
        {
            _db = db;
        }

        public async Task<int> CrearPlan(PlanAlimentacion plan)
        {
            using var conn = _db.GetConnection();
            await conn.OpenAsync();

            using var cmd = new SqlCommand(
                        "INSERT INTO PlanAlimentacion (id_nutricionista, Nombre) " +
                        "OUTPUT INSERTED.id_plan " +
                        "VALUES (@id_nutricionista, @nombre)", conn);
                    cmd.Parameters.AddWithValue("id_nutricionista", plan.Id_nutricionista);
                    cmd.Parameters.AddWithValue("nombre", plan.Nombre);

            return (int)(await cmd.ExecuteScalarAsync())!;
        }
        
        public async Task<PlanAlimentacion> ObtenerPlan(int id)
        {
            using var conn = _db.GetConnection();
            await conn.OpenAsync();

            // 1. Obtener la cabecera del plan
            using var cmdPlan = new SqlCommand(
                        "SELECT id_plan, id_nutricionista, Nombre FROM PlanAlimentacion WHERE id_plan = @id_plan", conn);
            cmdPlan.Parameters.AddWithValue("@id_plan", id);

            using var readerPlan = await cmdPlan.ExecuteReaderAsync();
            if (!await readerPlan.ReadAsync())
            {
                throw new Exception("El plan de alimentación no existe.");
            }

            var plan = new PlanAlimentacion
            {
                Id_plan = readerPlan.GetInt32(0),
                Id_nutricionista = readerPlan.GetInt32(1),
                Nombre = readerPlan.GetString(2),
                Productos = new List<ProductoxPlan>()
            };
            await readerPlan.CloseAsync();

            // 2. Obtener los productos asociados al plan
            using var cmdProductos = new SqlCommand(
                        "SELECT pxp.id_producto, pxp.tiempo, pxp.Cantidad, p.Descripcion " +
                        "FROM ProductoxPlan pxp " +
                        "INNER JOIN Producto p ON pxp.id_producto = p.id_producto " +
                        "WHERE pxp.id_plan = @id_plan", conn);
            cmdProductos.Parameters.AddWithValue("@id_plan", id);

            using var readerProductos = await cmdProductos.ExecuteReaderAsync();
            while (await readerProductos.ReadAsync())
            {
                plan.Productos.Add(new ProductoxPlan
                {
                    Id_producto = readerProductos.GetInt32(0),
                    Tiempo = readerProductos.GetString(1),
                    Cantidad = readerProductos.GetDecimal(2),
                    Descripcion = readerProductos.IsDBNull(3) ? "" : readerProductos.GetString(3)
                });
            }
            return plan;
        }

        public async Task<List<PlanResumenDTO>> ObtenerPlanesPorNutricionista(int id_nutricionista)
        {
            using var conn = _db.GetConnection();
            await conn.OpenAsync();

            using var cmd = new SqlCommand(
                        "SELECT id_plan, Nombre, Total_Calorias " +
                        "FROM vw_PlanNutricionista " + 
                        "WHERE id_nutricionista = @id_nutricionista", conn);
            cmd.Parameters.AddWithValue("@id_nutricionista", id_nutricionista);

            var planes = new List<PlanResumenDTO>();
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                planes.Add(new PlanResumenDTO
                {
                    Id_plan = reader.GetInt32(0),
                    Nombre = reader.GetString(1),
                    Completo = true,
                    Total_Calorias = Convert.ToInt32(reader.GetDecimal(2))
                });
            }
            return planes;
        }

        public async Task AgregarProducto(int id_plan, List<ProductoxPlan> productos)
        {
            using var conn = _db.GetConnection();
            await conn.OpenAsync();
            using var cmd = new SqlCommand(
                        "INSERT INTO ProductoxPlan (id_plan, id_producto, tiempo, cantidad) " +
                        "VALUES (@id_plan, @id_producto, @tiempo, @cantidad)", conn);
                    cmd.Parameters.AddWithValue("@id_plan", id_plan);
                    cmd.Parameters.Add("@id_producto", SqlDbType.Int);
                    cmd.Parameters.Add("@tiempo", SqlDbType.NVarChar, 50);
                    cmd.Parameters.Add("@cantidad", 0.0m);

                    foreach (var producto in productos)
                    {
                        cmd.Parameters["@id_producto"].Value = producto.Id_producto;
                        cmd.Parameters["@tiempo"].Value = producto.Tiempo;
                        cmd.Parameters["@cantidad"].Value = producto.Cantidad;
                        await cmd.ExecuteNonQueryAsync();
                    }
        }

        public async Task ActualizarPlan(PlanAlimentacion plan)
        {
            using var conn = _db.GetConnection();
            await conn.OpenAsync();
            using var transaction = conn.BeginTransaction();

            try
            {
                //1. Actualizar el nombre del Plan (Padre)
                var queryUpdatePlan = "UPDATE PlanAlimentacion SET Nombre = @nombre WHERE id_plan = @id_plan";
                using (var cmd = new SqlCommand(queryUpdatePlan, conn, transaction))
                {
                    cmd.Parameters.AddWithValue("@Nombre", plan.Nombre);
                    cmd.Parameters.AddWithValue("@id_plan", plan.Id_plan);
                    await cmd.ExecuteNonQueryAsync();
                }

                //2. Limpiar/Borrar todos los productos actuales de ese plan (Hijos) 
                var querDeleteProductos = "DELETE FROM ProductoxPlan WHERE id_plan = @id_plan";
                using (var cmd = new SqlCommand(querDeleteProductos, conn, transaction))
                {
                    cmd.Parameters.AddWithValue("@id_plan", plan.Id_plan);
                    await cmd.ExecuteNonQueryAsync();
                }

                //3. Reinsertar la nueva lista de productos con sus porciones/cantidades actualizadas
                var queryInsertProducto = "INSERT INTO ProductoxPlan (id_plan, id_producto, tiempo, cantidad) " +
                        "VALUES (@id_plan, @id_producto, @tiempo, @cantidad)";

                foreach (var prod in plan.Productos)
                {
                    using (var cmd = new SqlCommand(queryInsertProducto, conn, transaction))
                    {
                        cmd.Parameters.AddWithValue("@id_plan", plan.Id_plan);
                        cmd.Parameters.AddWithValue("@id_producto", prod.Id_producto);
                        cmd.Parameters.AddWithValue("@tiempo", prod.Tiempo);
                        cmd.Parameters.AddWithValue("@cantidad", prod.Cantidad);
                        await cmd.ExecuteNonQueryAsync();
                    }
                }
                await transaction.CommitAsync();
            } 
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> TieneAsignacionesActivas(int id)
        {
            using var conn = _db.GetConnection();
            await conn.OpenAsync();

            using var cmd = new SqlCommand(
                        "SELECT COUNT(1) FROM PlanxCliente " +
                        "WHERE id_plan = @id_plan AND CAST(GETDATE() AS DATE) BETWEEN Inicio AND Fin", conn);
            cmd.Parameters.AddWithValue("@id_plan", id);

            int count = (int)await cmd.ExecuteScalarAsync();
            return count > 0;
        }

        public async Task EliminarPlan(int id_plan)
        {
            using var conn = _db.GetConnection();
            await conn.OpenAsync();
            using var transaction = conn.BeginTransaction();

            try
            {
                // 1. Borrar productos (Hijos)
                using (var cmd = new SqlCommand("DELETE FROM ProductoxPlan WHERE id_plan = @id_plan", conn, transaction))
                {
                    cmd.Parameters.AddWithValue("@id_plan", id_plan);
                    await cmd.ExecuteNonQueryAsync();
                }

                // 2. Borrar clientes (Hijo)
                using (var cmd = new SqlCommand("DELETE FROM PlanxCliente WHERE id_plan = @id_plan", conn, transaction))
                {
                    cmd.Parameters.AddWithValue("@id_plan", id_plan);
                    await cmd.ExecuteNonQueryAsync();
                }

                // 3. Borrar el plan (Padre)
                using (var cmd2 = new SqlCommand("DELETE FROM PlanAlimentacion WHERE id_plan = @id_plan", conn, transaction))
                {
                    cmd2.Parameters.AddWithValue("@id_plan", id_plan);
                    await cmd2.ExecuteNonQueryAsync();
                }

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        
        public async Task AsignarPlan(int id_plan, int id_cliente, DateTime inicio, DateTime fin)
        {
            using var conn = _db.GetConnection();
            await conn.OpenAsync();

            using var cmd = new SqlCommand(
                "INSERT INTO PlanxCliente (id_plan, id_cliente, Inicio, Fin) "+ 
                "VALUES (@id_plan, @id_cliente, @inicio, @fin)", conn);
            cmd.Parameters.AddWithValue("@id_plan", id_plan);
            cmd.Parameters.AddWithValue("@id_cliente", id_cliente);
            cmd.Parameters.AddWithValue("@inicio", inicio);
            cmd.Parameters.AddWithValue("@fin", fin);
            await cmd.ExecuteNonQueryAsync();
        }
    }
}