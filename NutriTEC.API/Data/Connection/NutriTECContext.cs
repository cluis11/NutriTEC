using Microsoft.EntityFrameworkCore;
using NutriTEC.API.Models;

namespace NutriTEC.API.Data
{
    public class NutriTECContext : DbContext
    {
        public NutriTECContext(DbContextOptions<NutriTECContext> options) : base(options) { }

        public DbSet<Usuario> Usuario { get; set; }
        public DbSet<Admin> Admin { get; set; }
        public DbSet<Nutricionista> Nutricionista { get; set; }
        public DbSet<Cliente> Cliente { get; set; }
        public DbSet<ClientexNutricionista> ClientexNutricionista { get; set; }
        public DbSet<Medida> Medida { get; set; }
        public DbSet<Producto> Producto { get; set; }
        public DbSet<VitaminaxProducto> VitaminasxProducto { get; set; }
        public DbSet<Receta> Receta { get; set; }
        public DbSet<ProductoxReceta> ProductoxReceta { get; set; }
        public DbSet<PlanAlimentacion> PlanAlimentacion { get; set; }
        public DbSet<ProductoxPlan> ProductoxPlan { get; set; }
        public DbSet<PlanxCliente> PlanxCliente { get; set; }
        public DbSet<RegistroDiario> Registro_Diario { get; set; }
        public DbSet<RegistroxProducto> RegistroxProducto { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ------------------------------------------------------------
            // Usuario
            // ------------------------------------------------------------
            modelBuilder.Entity<Usuario>().HasKey(u => u.Id_usuario);
            modelBuilder.Entity<Usuario>().HasIndex(u => u.Correo).IsUnique();
            modelBuilder.Entity<Usuario>().Property(u => u.Fecha_nacimiento).HasColumnType("date");
            modelBuilder.Entity<Usuario>().Property(u => u.Peso).HasPrecision(5, 2);
            modelBuilder.Entity<Usuario>().Property(u => u.Altura).HasPrecision(5, 2);

            // ------------------------------------------------------------
            // Admin
            // ------------------------------------------------------------
            modelBuilder.Entity<Admin>().HasKey(a => a.Id_admin);
            modelBuilder.Entity<Admin>().HasIndex(a => a.Correo).IsUnique();

            // ------------------------------------------------------------
            // Nutricionista
            // ------------------------------------------------------------
            modelBuilder.Entity<Nutricionista>().HasKey(n => n.Id_usuario);
            modelBuilder.Entity<Nutricionista>()
                .Ignore(n => n.Correo).Ignore(n => n.Contrasena).Ignore(n => n.Nombre)
                .Ignore(n => n.Ap1).Ignore(n => n.Ap2).Ignore(n => n.Fecha_nacimiento)
                .Ignore(n => n.Peso).Ignore(n => n.Altura);

            // ------------------------------------------------------------
            // Cliente
            // ------------------------------------------------------------
            modelBuilder.Entity<Cliente>().HasKey(c => c.Id_usuario);
            modelBuilder.Entity<Cliente>()
                .Ignore(c => c.Correo).Ignore(c => c.Contrasena).Ignore(c => c.Nombre)
                .Ignore(c => c.Ap1).Ignore(c => c.Ap2).Ignore(c => c.Fecha_nacimiento)
                .Ignore(c => c.Peso).Ignore(c => c.Altura);
            modelBuilder.Entity<Cliente>().Property(c => c.Consumo_maximo).HasPrecision(7, 2);

            // ------------------------------------------------------------
            // ClientexNutricionista
            // ------------------------------------------------------------
            modelBuilder.Entity<ClientexNutricionista>()
                .HasKey(cn => new { cn.Id_cliente, cn.Id_nutricionista });

            // ------------------------------------------------------------
            // Medida
            // ------------------------------------------------------------
            modelBuilder.Entity<Medida>().HasKey(m => m.Id_medida);
            modelBuilder.Entity<Medida>().Property(m => m.Fecha).HasColumnType("date");
            modelBuilder.Entity<Medida>().Property(m => m.Cintura).HasPrecision(5, 2);
            modelBuilder.Entity<Medida>().Property(m => m.Cuello).HasPrecision(5, 2);
            modelBuilder.Entity<Medida>().Property(m => m.Caderas).HasPrecision(5, 2);
            modelBuilder.Entity<Medida>().Property(m => m.P_musculo).HasPrecision(5, 2);
            modelBuilder.Entity<Medida>().Property(m => m.P_grasa).HasPrecision(5, 2);

            // ------------------------------------------------------------
            // Producto
            // ------------------------------------------------------------
            modelBuilder.Entity<Producto>().HasKey(p => p.Id_producto);
            modelBuilder.Entity<Producto>().ToTable(tb => tb.HasTrigger("trg_RevertirProductoAPendiente"));
            modelBuilder.Entity<Producto>().HasIndex(p => p.Codigo).IsUnique();
            modelBuilder.Entity<Producto>().Property(p => p.Estado).HasDefaultValue("pendiente");
            modelBuilder.Entity<Producto>().Ignore(p => p.Vitaminas);
            modelBuilder.Entity<Producto>().Property(p => p.Tamano).HasPrecision(7, 2);
            modelBuilder.Entity<Producto>().Property(p => p.Porcion).HasPrecision(7, 2);
            modelBuilder.Entity<Producto>().Property(p => p.Energia).HasPrecision(7, 2);
            modelBuilder.Entity<Producto>().Property(p => p.Grasa).HasPrecision(7, 2);
            modelBuilder.Entity<Producto>().Property(p => p.Sodio).HasPrecision(7, 2);
            modelBuilder.Entity<Producto>().Property(p => p.Carbohidratos).HasPrecision(7, 2);
            modelBuilder.Entity<Producto>().Property(p => p.Proteina).HasPrecision(7, 2);
            modelBuilder.Entity<Producto>().Property(p => p.Calcio).HasPrecision(7, 2);
            modelBuilder.Entity<Producto>().Property(p => p.Hierro).HasPrecision(7, 2);

            // ------------------------------------------------------------
            // VitaminaxProducto
            // ------------------------------------------------------------
            modelBuilder.Entity<VitaminaxProducto>()
                .HasKey(v => new { v.Id_producto, v.Vitamina });
            modelBuilder.Entity<VitaminaxProducto>().ToTable("VitaminasxProducto");

            // ------------------------------------------------------------
            // Receta
            // ------------------------------------------------------------
            modelBuilder.Entity<Receta>().HasKey(r => r.Id_receta);
            modelBuilder.Entity<Receta>().Ignore(r => r.Productos);

            // ------------------------------------------------------------
            // ProductoxReceta
            // ------------------------------------------------------------
            modelBuilder.Entity<ProductoxReceta>()
                .HasKey(pr => new { pr.Id_receta, pr.Id_producto });
            modelBuilder.Entity<ProductoxReceta>()
                .Ignore(pr => pr.Descripcion).Ignore(pr => pr.Porcion).Ignore(pr => pr.Energia)
                .Ignore(pr => pr.Grasa).Ignore(pr => pr.Sodio).Ignore(pr => pr.Carbohidratos)
                .Ignore(pr => pr.Proteina).Ignore(pr => pr.Calcio).Ignore(pr => pr.Hierro)
                .Ignore(pr => pr.Vitaminas);
            modelBuilder.Entity<ProductoxReceta>().Property(pr => pr.Cantidad).HasPrecision(7, 2);

            // ------------------------------------------------------------
            // PlanAlimentacion
            // ------------------------------------------------------------
            modelBuilder.Entity<PlanAlimentacion>().HasKey(p => p.Id_plan);
            modelBuilder.Entity<PlanAlimentacion>().Ignore(p => p.Productos);

            // ------------------------------------------------------------
            // ProductoxPlan
            // ------------------------------------------------------------
            modelBuilder.Entity<ProductoxPlan>()
                .HasKey(pp => new { pp.Id_plan, pp.Id_producto, pp.Tiempo });
            modelBuilder.Entity<ProductoxPlan>().Ignore(pp => pp.Descripcion);
            modelBuilder.Entity<ProductoxPlan>().Property(pp => pp.Cantidad).HasPrecision(7, 2);

            // ------------------------------------------------------------
            // PlanxCliente
            // ------------------------------------------------------------
            modelBuilder.Entity<PlanxCliente>()
                .HasKey(pc => new { pc.Id_cliente, pc.Id_plan, pc.Inicio });
            modelBuilder.Entity<PlanxCliente>().Property(pc => pc.Inicio).HasColumnType("date");
            modelBuilder.Entity<PlanxCliente>().Property(pc => pc.Fin).HasColumnType("date");

            // ------------------------------------------------------------
            // RegistroDiario
            // ------------------------------------------------------------
            modelBuilder.Entity<RegistroDiario>().HasKey(r => r.Id_registro);
            modelBuilder.Entity<RegistroDiario>().ToTable("Registro_Diario");
            modelBuilder.Entity<RegistroDiario>().Property(r => r.Fecha).HasColumnType("date");
            modelBuilder.Entity<RegistroDiario>().Ignore(r => r.Productos);

            // ------------------------------------------------------------
            // RegistroxProducto
            // ------------------------------------------------------------
            modelBuilder.Entity<RegistroxProducto>()
                .HasKey(rp => new { rp.Id_registro, rp.Id_producto });
            modelBuilder.Entity<RegistroxProducto>().Property(rp => rp.Cantidad).HasPrecision(7, 2);

            // ------------------------------------------------------------
            // Precision para decimales
            // ------------------------------------------------------------
            modelBuilder.Entity<Usuario>()
                .Property(u => u.Peso).HasPrecision(5, 2);
            modelBuilder.Entity<Usuario>()
                .Property(u => u.Altura).HasPrecision(5, 2);

            modelBuilder.Entity<Cliente>()
                .Property(c => c.Consumo_maximo).HasPrecision(7, 2);

            modelBuilder.Entity<Medida>()
                .Property(m => m.Cintura).HasPrecision(5, 2);
            modelBuilder.Entity<Medida>()
                .Property(m => m.Cuello).HasPrecision(5, 2);
            modelBuilder.Entity<Medida>()
                .Property(m => m.Caderas).HasPrecision(5, 2);
            modelBuilder.Entity<Medida>()
                .Property(m => m.P_musculo).HasPrecision(5, 2);
            modelBuilder.Entity<Medida>()
                .Property(m => m.P_grasa).HasPrecision(5, 2);

            modelBuilder.Entity<Producto>()
                .Property(p => p.Tamano).HasPrecision(7, 2);
            modelBuilder.Entity<Producto>()
                .Property(p => p.Porcion).HasPrecision(7, 2);
            modelBuilder.Entity<Producto>()
                .Property(p => p.Energia).HasPrecision(7, 2);
            modelBuilder.Entity<Producto>()
                .Property(p => p.Grasa).HasPrecision(7, 2);
            modelBuilder.Entity<Producto>()
                .Property(p => p.Sodio).HasPrecision(7, 2);
            modelBuilder.Entity<Producto>()
                .Property(p => p.Carbohidratos).HasPrecision(7, 2);
            modelBuilder.Entity<Producto>()
                .Property(p => p.Proteina).HasPrecision(7, 2);
            modelBuilder.Entity<Producto>()
                .Property(p => p.Calcio).HasPrecision(7, 2);
            modelBuilder.Entity<Producto>()
                .Property(p => p.Hierro).HasPrecision(7, 2);

            modelBuilder.Entity<ProductoxPlan>()
                .Property(pp => pp.Cantidad).HasPrecision(7, 2);

            modelBuilder.Entity<ProductoxReceta>()
                .Property(pr => pr.Cantidad).HasPrecision(7, 2);

            modelBuilder.Entity<RegistroxProducto>()
                .Property(rp => rp.Cantidad).HasPrecision(7, 2);
        }
    }
}