using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using NutriTEC.API.Data;
using NutriTEC.API.Data.Repositories;
using NutriTEC.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// SERVICIOS
// ============================================================

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.DefaultIgnoreCondition =
            System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.Converters.Add(new NutriTEC.API.DateTimeJsonConverter());
    });

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

// ============================================================
// ENTITY FRAMEWORK
// ============================================================

builder.Services.AddDbContext<NutriTECContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Mongo
builder.Services.AddSingleton<MongoDatabaseConnection>();

// ============================================================
// INYECCION DE DEPENDENCIAS
// ============================================================


// Repositories
builder.Services.AddScoped<AuthRepository>();
builder.Services.AddScoped<NutricionistaRepository>();
builder.Services.AddScoped<ClienteRepository>();
builder.Services.AddScoped<ProductoRepository>();
builder.Services.AddScoped<PlanRepository>();
builder.Services.AddScoped<RecetaRepository>();
builder.Services.AddScoped<AdminRepository>();
builder.Services.AddScoped<MedidaRepository>();

// Services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<NutricionistaService>();
builder.Services.AddScoped<ClienteService>();
builder.Services.AddScoped<ProductoService>();
builder.Services.AddScoped<PlanService>();
builder.Services.AddScoped<RecetaService>();
builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<MedidaService>();

// ============================================================
// PIPELINE
// ============================================================

var app = builder.Build();

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();