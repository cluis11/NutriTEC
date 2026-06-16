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
                        "OUTPUT INSERTED.id " +
                        "VALUES (@id_nutricionista, @nombre)", conn);
                    cmd.Parameters.AddWithValue("id_nutricionista", plan.Id_nutricionista);
                    cmd.Parameters.AddWithValue("nombre", plan.Nombre);

            return (int)(await cmd.ExecuteScalarAsync())!;
        }
        public Task<PlanAlimentacion> ObtenerPlan(int id) => throw new NotImplementedException();
        public Task<List<PlanResumenDTO>> ObtenerPlanesPorNutricionista(int id_nutricionista) => throw new NotImplementedException();
        public async Task AgregarProducto(int id_plan, List<ProductoxPlan> productos)
        {
            using var conn = _db.GetConnection();
            await conn.OpenAsync();
            using var cmd = new SqlCommand(
                        "INSERT INTO ProductoPlan (id_plan, id_producto, tiempo, cantidad) " +
                        "VALUES (@id_plan, @id_producto, @tiempo, @cantidad)", conn);
                    cmd.Parameters.AddWithValue("id_plan", id_plan);
                    cmd.Parameters.Add("id_producto", SqlDbType.Int);
                    cmd.Parameters.Add("tiempo", SqlDbType.NVarChar, 50);
                    cmd.Parameters.Add("cantidad", SqlDbType.Decimal);

                    foreach (var producto in productos)
                    {
                        cmd.Parameters["id_producto"].Value = producto.Id_producto;
                        cmd.Parameters["tiempo"].Value = producto.Tiempo;
                        cmd.Parameters["cantidad"].Value = producto.Cantidad;
                        await cmd.ExecuteNonQueryAsync();
                    }
        }
        public Task<bool> ProductoExisteEnTiempo(int id_plan, int id_producto, string tiempo) => throw new NotImplementedException();
        public Task EliminarProductoDePlan(int id_plan, int id_producto, string tiempo) => throw new NotImplementedException();
        public Task ActualizarNombrePlan(int id, string nombre) => throw new NotImplementedException();
        public Task<bool> TieneAsignacionesActivas(int id_plan) => throw new NotImplementedException();
        public Task EliminarPlan(int id_plan) => throw new NotImplementedException();
        public Task<bool> ClienteEsPaciente(int id_nutricionista, int id_cliente) => throw new NotImplementedException();
        public Task<bool> ClienteTienePlanActivo(int id_cliente, DateTime inicio, DateTime fin) => throw new NotImplementedException();
        public Task AsignarPlan(int id_plan, int id_cliente, DateTime inicio, DateTime fin) => throw new NotImplementedException();
    }
}
