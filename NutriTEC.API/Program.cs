using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using NutriTEC.API.Data.Connection;
using NutriTEC.API.Data.Repositories;
using NutriTEC.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// SERVICIOS
// ============================================================

builder.Services.AddControllers();

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
// INYECCION DE DEPENDENCIAS
// ============================================================

// Connection
builder.Services.AddSingleton<DatabaseConnection>();

// Repositories
builder.Services.AddScoped<AuthRepository>();
builder.Services.AddScoped<NutricionistaRepository>();
builder.Services.AddScoped<ClienteRepository>();
builder.Services.AddScoped<ProductoRepository>();
builder.Services.AddScoped<PlanRepository>();
builder.Services.AddScoped<RecetaRepository>();
builder.Services.AddScoped<AdminRepository>();

// Services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<NutricionistaService>();
builder.Services.AddScoped<ClienteService>();
builder.Services.AddScoped<ProductoService>();
builder.Services.AddScoped<PlanService>();
builder.Services.AddScoped<RecetaService>();
builder.Services.AddScoped<AdminService>();

// ============================================================
// PIPELINE
// ============================================================

var app = builder.Build();

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();