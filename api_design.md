# NutriTEC — Diseño de API (SQL Server)

Este documento describe el diseño completo de la API REST para NutriTEC, incluyendo models, DTOs, repositories, services y controllers.

---

## Consideraciones Generales

- Passwords viajan en texto plano por HTTPS — el cifrado ocurre en la API con BCrypt
- El `id_usuario` del usuario autenticado se obtiene del token JWT
- Todos los queries se ejecutan con SQL explícito usando `FromSqlRaw` o `ExecuteSqlRawAsync` — no LINQ
- Los models son objetos de negocio formados a partir de múltiples tablas, no mapeos 1 a 1
- Los DTOs se usan para vistas reducidas, reportes y cuando se calculan campos que no existen en BD

---

## AuthController

### Models
No aplica — el login no retorna un model, retorna un DTO.

### DTOs

```csharp
// Request
public class LoginRequestDTO
{
    public string Correo { get; set; }
    public string Contrasena { get; set; }
}

// Response base
public class LoginResponseDTO
{
    public string Token { get; set; }
    public string Rol { get; set; }
    public int Id_usuario { get; set; }
    public string Nombre { get; set; }
    public string Ap1 { get; set; }
}

// Response cliente — extiende LoginResponseDTO
public class LoginClienteResponseDTO : LoginResponseDTO
{
    public PlanActivoDTO Plan_activo { get; set; }
}

public class PlanActivoDTO
{
    public int Id_plan { get; set; }
    public string Nombre { get; set; }
}
```

### Repository — AuthRepository
```
ObtenerUsuarioPorCorreo(string correo)
    Query: SELECT en Usuario por correo
    Retorna: Usuario o null

EsNutricionista(int id_usuario)
    Query: SELECT en Nutricionista por id_usuario
    Retorna: bool

EsCliente(int id_usuario)
    Query: SELECT en Cliente por id_usuario
    Retorna: bool

EsAdmin(string correo)
    Query: SELECT en Admin por correo
    Retorna: bool

ObtenerPlanActivo(int id_cliente)
    Query: SELECT en PlanxCliente + PlanAlimentacion donde GETDATE() BETWEEN Inicio AND Fin
    Retorna: PlanActivoDTO o null
```

### Service — AuthService
```
Login(LoginRequestDTO request)
    1. ObtenerUsuarioPorCorreo — si no existe retornar error
    2. Verificar password con BCrypt
    3. Determinar rol — EsNutricionista, EsCliente, EsAdmin
    4. Si es cliente — ObtenerPlanActivo
    5. Generar JWT con id y rol
    6. Retornar LoginResponseDTO o LoginClienteResponseDTO según rol
```

### Controller — AuthController
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Login unificado |

**POST `/api/auth/login`**

Request:
```json
{
  "correo": "laura.mendez@nutritec.com",
  "contrasena": "Nutri2026!"
}
```

Response exitoso — Nutricionista/Admin:
```json
{
  "token": "eyJ...",
  "rol": "nutricionista",
  "id_usuario": 1,
  "nombre": "Laura",
  "ap1": "Méndez"
}
```

Response exitoso — Cliente con plan:
```json
{
  "token": "eyJ...",
  "rol": "cliente",
  "id_usuario": 4,
  "nombre": "Diego",
  "ap1": "Vargas",
  "plan_activo": {
    "id_plan": 2,
    "nombre": "Plan Mantenimiento"
  }
}
```

Response exitoso — Cliente sin plan:
```json
{
  "token": "eyJ...",
  "rol": "cliente",
  "id_usuario": 4,
  "nombre": "Diego",
  "ap1": "Vargas",
  "plan_activo": null
}
```

Response fallido:
```json
{
  "mensaje": "Credenciales inválidas"
}
```

---

## NutricionistaController

### Models

```csharp
public class Nutricionista
{
    public int Id_usuario { get; set; }
    public string Correo { get; set; }
    public string Nombre { get; set; }
    public string Ap1 { get; set; }
    public string Ap2 { get; set; }
    public DateTime Fecha_nacimiento { get; set; }
    public decimal Peso { get; set; }
    public decimal Altura { get; set; }
    public string Cedula { get; set; }
    public string Codigo { get; set; }
    public string Cobro { get; set; }
    public string Tarjeta { get; set; }
    public string Foto { get; set; }
    public string Direccion { get; set; }
}

public class Cliente
{
    public int Id_usuario { get; set; }
    public string Correo { get; set; }
    public string Nombre { get; set; }
    public string Ap1 { get; set; }
    public string Ap2 { get; set; }
    public DateTime Fecha_nacimiento { get; set; }
    public decimal Peso { get; set; }
    public decimal Imc { get; set; }
    public string Pais { get; set; }
    public decimal Consumo_maximo { get; set; }
}
```

### DTOs

```csharp
// Listado resumido de pacientes disponibles
public class ClienteDisponibleDTO
{
    public int Id_usuario { get; set; }
    public string Nombre { get; set; }
    public string Ap1 { get; set; }
    public string Ap2 { get; set; }
    public DateTime Fecha_nacimiento { get; set; }
    public string Correo { get; set; }
    public string Pais { get; set; }
}

// Registro diario del paciente con totales calculados
public class RegistroDiarioDTO
{
    public int Id_cliente { get; set; }
    public string Nombre { get; set; }
    public DateTime Fecha { get; set; }
    public decimal Total_dia { get; set; }
    public decimal Consumo_maximo { get; set; }
    public List<TiempoComidaDTO> Registros { get; set; }
}

public class TiempoComidaDTO
{
    public string Tiempo { get; set; }
    public decimal Total_tiempo { get; set; }
    public List<Producto> Productos { get; set; }
}
```

### Repository — NutricionistaRepository
```
ObtenerNutricionista(int id)
    Query: SELECT JOIN Usuario + Nutricionista por id_usuario
    Retorna: Nutricionista o null

CrearNutricionista(Nutricionista nutricionista)
    Query: INSERT en Usuario, luego INSERT en Nutricionista con id generado
    Retorna: id_usuario generado

ActualizarNutricionista(Nutricionista nutricionista)
    Query: UPDATE en Usuario y Nutricionista por id_usuario
    Retorna: void

ObtenerNutricionista — IMC se calcula en el service: peso / (altura * altura)

CorreoExiste(string correo)
    Query: SELECT en Usuario por correo
    Retorna: bool

ObtenerPacientes(int id_nutricionista)
    Query: SELECT JOIN ClientexNutricionista + Usuario + Cliente por id_nutricionista
    Retorna: List<Cliente>

ObtenerPacientesDisponibles()
    Query: SELECT desde vista ClientesSinNutricionista
    Retorna: List<ClienteDisponibleDTO>

AsociarPaciente(int id_nutricionista, int id_cliente)
    Query: INSERT en ClientexNutricionista
    Retorna: void

ObtenerRegistroDiario(int id_cliente, DateTime fecha)
    Query: SELECT desde vista RegistroDiarioPaciente filtrando por id_cliente y fecha
    Retorna: List<RegistroDiarioDTO>
```

### Service — NutricionistaService
```
Registro(Nutricionista nutricionista, string foto_base64)
    1. CorreoExiste — si existe retornar error
    2. Encriptar password con BCrypt
    3. Guardar foto en servidor, obtener ruta
    4. CrearNutricionista

ObtenerPerfil(int id)
    1. ObtenerNutricionista — si null retornar error
    2. Calcular IMC = peso / (altura * altura)
    3. Retornar Nutricionista con IMC calculado

ActualizarPerfil(int id, Nutricionista nutricionista, string foto_base64)
    1. ObtenerNutricionista — si null retornar error
    2. Si viene correo nuevo — CorreoExiste — si existe retornar error
    3. Si viene password nuevo — encriptar
    4. Si viene foto — guardar en servidor, obtener ruta
    5. ActualizarNutricionista

ObtenerPacientes(int id_nutricionista)
    1. ObtenerPacientes desde repository
    2. Retornar lista

ObtenerPacientesDisponibles()
    1. ObtenerPacientesDisponibles desde repository
    2. Retornar lista

AsociarPaciente(int id_nutricionista, int id_cliente)
    1. Verificar que cliente existe
    2. AsociarPaciente en repository

ObtenerRegistroDiario(int id_cliente, DateTime fecha)
    1. ObtenerRegistroDiario desde repository
    2. Agrupar por tiempo de comida
    3. Calcular total_tiempo por cada tiempo
    4. Calcular total_dia
    5. Construir y retornar RegistroDiarioDTO
```

### Controller — NutricionistaController
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/nutricionista/registro` | Registro |
| GET | `/api/nutricionista/{id}` | Perfil |
| PUT | `/api/nutricionista/{id}` | Actualizar perfil |
| GET | `/api/nutricionista/{id}/pacientes` | Listar pacientes |
| GET | `/api/nutricionista/{id}/pacientes-disponibles` | Clientes sin nutricionista |
| POST | `/api/nutricionista/{id}/pacientes` | Asociar paciente |
| GET | `/api/nutricionista/{id}/pacientes/{id_cliente}/registro` | Registro diario paciente |

**POST `/api/nutricionista/registro`**

Request:
```json
{
  "correo": "laura.mendez@nutritec.com",
  "contrasena": "Nutri2026!",
  "nombre": "Laura",
  "ap1": "Méndez",
  "ap2": "Solís",
  "fecha_nacimiento": "1985-03-12",
  "peso": 62.0,
  "altura": 1.65,
  "imc": 22.8,
  "cedula": "1-0234-0567",
  "codigo": "NUT-001",
  "cobro": "semanal",
  "tarjeta": "4532015112830366",
  "direccion": "San José, Costa Rica",
  "foto": "base64..."
}
```

Response exitoso:
```json
{ "mensaje": "Registro exitoso", "id_usuario": 1 }
```

Response fallido:
```json
{ "mensaje": "El correo ya está registrado" }
```

**GET `/api/nutricionista/{id}`**

Response exitoso:
```json
{
  "id_usuario": 1,
  "correo": "laura.mendez@nutritec.com",
  "nombre": "Laura",
  "ap1": "Méndez",
  "ap2": "Solís",
  "fecha_nacimiento": "1985-03-12",
  "peso": 62.0,
  "altura": 1.65,
  "imc": 22.8,
  "cedula": "1-0234-0567",
  "codigo": "NUT-001",
  "cobro": "semanal",
  "tarjeta": "4532015112830366",
  "direccion": "San José, Costa Rica",
  "foto": "/uploads/nutricionistas/1.jpg"
}
```

Response fallido:
```json
{ "mensaje": "Nutricionista no encontrado" }
```

**PUT `/api/nutricionista/{id}`**

Request:
```json
{
  "correo": "laura.mendez@nutritec.com",
  "contrasena": "NuevoPass2026!",
  "peso": 63.0,
  "altura": 1.65,
  "cobro": "mensual",
  "tarjeta": "4532015112830366",
  "direccion": "Cartago, Costa Rica",
  "foto": "base64..."
}
```

Response exitoso:
```json
{ "mensaje": "Perfil actualizado correctamente" }
```

Response fallido:
```json
{ "mensaje": "El correo ya está registrado" }
```

**GET `/api/nutricionista/{id}/pacientes`**

Response exitoso:
```json
[
  {
    "id_usuario": 4,
    "nombre": "Diego",
    "ap1": "Vargas",
    "ap2": "Castro",
    "correo": "diego.vargas@gmail.com",
    "pais": "Costa Rica",
    "consumo_maximo": 2000.00
  }
]
```

**GET `/api/nutricionista/{id}/pacientes-disponibles`**

Usa vista `ClientesSinNutricionista`.

Response exitoso:
```json
[
  {
    "id_usuario": 13,
    "nombre": "Roberto",
    "ap1": "Fallas",
    "ap2": "Soto",
    "fecha_nacimiento": "1986-07-03",
    "correo": "roberto.fallas@gmail.com",
    "pais": "Costa Rica"
  }
]
```

**POST `/api/nutricionista/{id}/pacientes`**

Request:
```json
{ "id_cliente": 13 }
```

Response exitoso:
```json
{ "mensaje": "Cliente asociado correctamente" }
```

Response fallido:
```json
{ "mensaje": "Cliente no encontrado" }
```

**GET `/api/nutricionista/{id}/pacientes/{id_cliente}/registro?fecha=2026-06-05`**

Usa vista `RegistroDiarioPaciente`.

Response exitoso:
```json
{
  "id_cliente": 4,
  "nombre": "Diego",
  "fecha": "2026-06-05",
  "total_dia": 1450.0,
  "consumo_maximo": 2000.0,
  "registros": [
    {
      "tiempo": "desayuno",
      "total_tiempo": 350.0,
      "productos": [
        {
          "id_producto": 4,
          "descripcion": "Pan integral",
          "porcion": 30.0,
          "cantidad": 2.0,
          "energia": 80.0,
          "grasa": 1.0,
          "sodio": 0.0,
          "carbohidratos": 15.0,
          "proteina": 3.0,
          "calcio": 20.0,
          "hierro": 1.0,
          "vitaminas": ["B1", "B2", "E"]
        }
      ]
    }
  ]
}
```

Response fallido:
```json
{ "mensaje": "No hay registro para esa fecha" }
```

---

## ProductoController

### Models

```csharp
public class Producto
{
    public int Id_producto { get; set; }
    public int Id_usuario { get; set; }
    public string Codigo { get; set; }
    public string Descripcion { get; set; }
    public decimal Tamano { get; set; }
    public decimal Porcion { get; set; }
    public decimal Energia { get; set; }
    public decimal Grasa { get; set; }
    public decimal Sodio { get; set; }
    public decimal Carbohidratos { get; set; }
    public decimal Proteina { get; set; }
    public decimal Calcio { get; set; }
    public decimal Hierro { get; set; }
    public string Estado { get; set; }
    public List<string> Vitaminas { get; set; }
}
```

### DTOs
No aplican — el model ya tiene toda la info necesaria para todos los endpoints.

### Repository — ProductoRepository
```
ObtenerProducto(int id)
    Query: SELECT JOIN Producto + VitaminasxProducto por id_producto
    Retorna: Producto o null

ObtenerProductos()
    Query: SELECT JOIN Producto + VitaminasxProducto — todos
    Retorna: List<Producto>

ObtenerProductosAprobados()
    Query: SELECT desde vista ProductosAprobados + VitaminasxProducto
    Retorna: List<Producto>

CodigoExiste(string codigo)
    Query: SELECT en Producto por Codigo
    Retorna: bool

CrearProducto(Producto producto)
    Query: INSERT en Producto, luego INSERT en VitaminasxProducto por cada vitamina
    Retorna: id_producto generado

ActualizarProducto(Producto producto)
    Query: UPDATE en Producto, DELETE + INSERT en VitaminasxProducto
    Retorna: void

EliminarProducto(int id)
    Query: DELETE en VitaminasxProducto, luego DELETE en Producto
    Retorna: void

EstaEnUso(int id)
    Query: SELECT en ProductoxPlan, ProductoxReceta, RegistroxProducto por id_producto
    Retorna: bool

AprobarProducto(int id)
    Query: UPDATE Estado = 'aprobado' en Producto por id_producto
    Retorna: void
```

### Service — ProductoService
```
CrearProducto(Producto producto)
    1. CodigoExiste — si existe retornar error
    2. CrearProducto en repository

ObtenerProducto(int id)
    1. ObtenerProducto — si null retornar error
    2. Retornar Producto

ObtenerProductos()
    1. ObtenerProductos desde repository
    2. Retornar lista

ObtenerProductosAprobados()
    1. ObtenerProductosAprobados desde repository
    2. Retornar lista

ActualizarProducto(int id, Producto producto)
    1. ObtenerProducto — si null retornar error
    2. EstaEnUso — si true retornar error
    3. ActualizarProducto en repository
    4. Trigger cambia estado a pendiente automáticamente

EliminarProducto(int id)
    1. ObtenerProducto — si null retornar error
    2. EstaEnUso — si true retornar error
    3. EliminarProducto en repository

AprobarProducto(int id)
    1. ObtenerProducto — si null retornar error
    2. AprobarProducto en repository
```

### Controller — ProductoController
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/producto` | Crear producto |
| GET | `/api/producto/{id}` | Obtener producto |
| GET | `/api/producto` | Listar todos — Admin |
| GET | `/api/producto/aprobados` | Listar aprobados — Nutri y Cliente |
| PUT | `/api/producto/{id}` | Actualizar producto |
| DELETE | `/api/producto/{id}` | Eliminar producto |
| PUT | `/api/producto/{id}/aprobar` | Aprobar producto — Admin |

**POST `/api/producto`**

Request:
```json
{
  "id_usuario": 1,
  "codigo": "7400009",
  "descripcion": "Suplemento proteico XYZ",
  "tamano": 30.0,
  "porcion": 30.0,
  "energia": 120.0,
  "grasa": 2.0,
  "sodio": 50.0,
  "carbohidratos": 3.0,
  "proteina": 25.0,
  "calcio": 100.0,
  "hierro": 2.0,
  "vitaminas": ["B6", "B12"]
}
```

Response exitoso:
```json
{ "mensaje": "Producto creado, pendiente de aprobación", "id_producto": 9 }
```

Response fallido:
```json
{ "mensaje": "El código de barras ya existe" }
```

**GET `/api/producto/{id}`**

Response exitoso:
```json
{
  "id_producto": 1,
  "id_usuario": 1,
  "codigo": "7400001",
  "descripcion": "Arroz blanco cocido",
  "tamano": 100.0,
  "porcion": 100.0,
  "energia": 130.0,
  "grasa": 0.3,
  "sodio": 1.0,
  "carbohidratos": 28.0,
  "proteina": 2.7,
  "calcio": 10.0,
  "hierro": 0.2,
  "estado": "aprobado",
  "vitaminas": ["B1", "B3"]
}
```

Response fallido:
```json
{ "mensaje": "Producto no encontrado" }
```

**GET `/api/producto`**

Response exitoso: lista completa con todos los campos incluyendo estado.

**GET `/api/producto/aprobados`**

Usa vista `ProductosAprobados`. Response sin campo estado.

**PUT `/api/producto/{id}`**

Request: mismos campos que POST excepto codigo e id_usuario.

Response exitoso:
```json
{ "mensaje": "Producto actualizado, pendiente de reaprobación" }
```

Response fallido — en uso:
```json
{ "mensaje": "El producto está en uso y no puede modificarse" }
```

**DELETE `/api/producto/{id}`**

Response exitoso:
```json
{ "mensaje": "Producto eliminado correctamente" }
```

Response fallido — en uso:
```json
{ "mensaje": "El producto está en uso y no puede eliminarse" }
```

**PUT `/api/producto/{id}/aprobar`**

Response exitoso:
```json
{ "mensaje": "Producto aprobado correctamente" }
```

---

## PlanController

### Models

```csharp
public class PlanAlimentacion
{
    public int Id_plan { get; set; }
    public int Id_nutricionista { get; set; }
    public string Nombre { get; set; }
    public List<ProductoxPlan> Productos { get; set; }
}

public class ProductoxPlan
{
    public int Id_plan { get; set; }
    public int Id_producto { get; set; }
    public string Descripcion { get; set; }
    public decimal Porcion { get; set; }
    public string Tiempo { get; set; }
    public decimal Cantidad { get; set; }
}
```

### DTOs

```csharp
// Listado resumido de planes del nutricionista
public class PlanResumenDTO
{
    public int Id_plan { get; set; }
    public string Nombre { get; set; }
    public bool Completo { get; set; }
}
```

### Repository — PlanRepository
```
CrearPlan(PlanAlimentacion plan)
    Query: INSERT en PlanAlimentacion
    Retorna: id_plan generado

ObtenerPlan(int id)
    Query: SELECT JOIN PlanAlimentacion + ProductoxPlan + Producto por id_plan
    Retorna: PlanAlimentacion o null

ObtenerPlanesPorNutricionista(int id_nutricionista)
    Query: SELECT PlanAlimentacion por id_nutricionista
           + verificar si tiene productos en los 5 tiempos en ProductoxPlan
    Retorna: List<PlanResumenDTO>

AgregarProducto(int id_plan, ProductoxPlan producto)
    Query: INSERT en ProductoxPlan
    Retorna: void

ProductoExisteEnTiempo(int id_plan, int id_producto, string tiempo)
    Query: SELECT en ProductoxPlan por id_plan, id_producto y tiempo
    Retorna: bool

EliminarProductoDePlan(int id_plan, int id_producto, string tiempo)
    Query: DELETE en ProductoxPlan por id_plan, id_producto y tiempo
    Retorna: void

ActualizarNombrePlan(int id, string nombre)
    Query: UPDATE Nombre en PlanAlimentacion por id_plan
    Retorna: void

TieneAsignacionesActivas(int id_plan)
    Query: SELECT en PlanxCliente donde id_plan y GETDATE() BETWEEN Inicio AND Fin
    Retorna: bool

EliminarPlan(int id_plan)
    Query: DELETE en ProductoxPlan, DELETE en PlanxCliente, DELETE en PlanAlimentacion
    Retorna: void

ClienteEsPaciente(int id_nutricionista, int id_cliente)
    Query: SELECT en ClientexNutricionista por id_nutricionista e id_cliente
    Retorna: bool

ClienteTienePlanActivo(int id_cliente, DateTime inicio, DateTime fin)
    Query: SELECT en PlanxCliente donde fechas se solapan
    Retorna: bool

AsignarPlan(int id_plan, int id_cliente, DateTime inicio, DateTime fin)
    Query: INSERT en PlanxCliente
    Retorna: void
```

### Service — PlanService
```
CrearPlan(PlanAlimentacion plan)
    1. CrearPlan en repository
    2. Retornar id_plan

ObtenerPlan(int id)
    1. ObtenerPlan — si null retornar error
    2. Retornar PlanAlimentacion

ObtenerPlanesPorNutricionista(int id_nutricionista)
    1. ObtenerPlanesPorNutricionista desde repository
    2. Retornar lista

AgregarProducto(int id_plan, ProductoxPlan producto)
    1. Verificar plan existe
    2. Verificar producto existe en vista ProductosAprobados
    3. ProductoExisteEnTiempo — si existe retornar error
    4. AgregarProducto en repository

EliminarProductoDePlan(int id_plan, int id_producto, string tiempo)
    1. ProductoExisteEnTiempo — si no existe retornar error
    2. EliminarProductoDePlan en repository

ActualizarNombrePlan(int id, string nombre)
    1. ObtenerPlan — si null retornar error
    2. ActualizarNombrePlan en repository

EliminarPlan(int id)
    1. ObtenerPlan — si null retornar error
    2. TieneAsignacionesActivas — si true retornar error
    3. EliminarPlan en repository

AsignarPlan(int id_plan, int id_cliente, int id_nutricionista, DateTime inicio, DateTime fin)
    1. ObtenerPlan — si null retornar error
    2. ClienteEsPaciente — si false retornar error
    3. ClienteTienePlanActivo — si true retornar error
    4. AsignarPlan en repository — trigger valida calorías automáticamente
```

### Controller — PlanController
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/plan` | Crear plan |
| GET | `/api/plan/{id}` | Obtener plan completo |
| GET | `/api/plan/nutricionista/{id}` | Listar planes del nutricionista |
| POST | `/api/plan/{id}/producto` | Agregar producto al plan |
| DELETE | `/api/plan/{id}/producto/{id_producto}/{tiempo}` | Quitar producto del plan |
| PUT | `/api/plan/{id}` | Actualizar nombre del plan |
| DELETE | `/api/plan/{id}` | Eliminar plan |
| POST | `/api/plan/{id}/asignar` | Asignar plan a paciente |

**POST `/api/plan`**

Request:
```json
{ "id_nutricionista": 1, "nombre": "Plan Pérdida de Peso" }
```

Response exitoso:
```json
{ "mensaje": "Plan creado correctamente", "id_plan": 1 }
```

**GET `/api/plan/{id}`**

Response exitoso:
```json
{
  "id_plan": 1,
  "id_nutricionista": 1,
  "nombre": "Plan Pérdida de Peso",
  "productos": [
    {
      "id_producto": 4,
      "descripcion": "Pan integral",
      "porcion": 30.0,
      "tiempo": "desayuno",
      "cantidad": 2.0
    }
  ]
}
```

Response fallido:
```json
{ "mensaje": "Plan no encontrado" }
```

**GET `/api/plan/nutricionista/{id}`**

Response exitoso:
```json
[
  { "id_plan": 1, "nombre": "Plan Pérdida de Peso", "completo": true },
  { "id_plan": 2, "nombre": "Plan Mantenimiento", "completo": false }
]
```

**POST `/api/plan/{id}/producto`**

Request:
```json
{ "id_producto": 4, "tiempo": "desayuno", "cantidad": 2.0 }
```

Response exitoso:
```json
{ "mensaje": "Producto agregado correctamente" }
```

Response fallido:
```json
{ "mensaje": "Producto no encontrado" }
```

```json
{ "mensaje": "El producto ya está en ese tiempo de comida" }
```

**DELETE `/api/plan/{id}/producto/{id_producto}/{tiempo}`**

Response exitoso:
```json
{ "mensaje": "Producto eliminado del plan correctamente" }
```

Response fallido:
```json
{ "mensaje": "Producto no encontrado en ese tiempo de comida" }
```

**PUT `/api/plan/{id}`**

Request:
```json
{ "nombre": "Plan Pérdida de Peso Avanzado" }
```

Response exitoso:
```json
{ "mensaje": "Plan actualizado correctamente" }
```

**DELETE `/api/plan/{id}`**

Response exitoso:
```json
{ "mensaje": "Plan eliminado correctamente" }
```

Response fallido:
```json
{ "mensaje": "El plan tiene asignaciones activas y no puede eliminarse" }
```

**POST `/api/plan/{id}/asignar`**

Request:
```json
{
  "id_cliente": 7,
  "inicio": "2026-06-07",
  "fin": "2026-08-07"
}
```

Response exitoso:
```json
{ "mensaje": "Plan asignado correctamente" }
```

Response fallido:
```json
{ "mensaje": "El cliente no es paciente de este nutricionista" }
```

```json
{ "mensaje": "El cliente ya tiene un plan activo en ese período" }
```

```json
{ "mensaje": "El plan supera el consumo máximo del cliente" }
```

---

## ClienteController

### Models

```csharp
public class Cliente
{
    public int Id_usuario { get; set; }
    public string Correo { get; set; }
    public string Nombre { get; set; }
    public string Ap1 { get; set; }
    public string Ap2 { get; set; }
    public DateTime Fecha_nacimiento { get; set; }
    public decimal Peso { get; set; }
    public decimal Altura { get; set; }
    public string Pais { get; set; }
    public decimal Consumo_maximo { get; set; }
}

public class Medida
{
    public int Id_medida { get; set; }
    public int Id_usuario { get; set; }
    public DateTime Fecha { get; set; }
    public decimal Cintura { get; set; }
    public decimal Cuello { get; set; }
    public decimal Caderas { get; set; }
    public decimal P_musculo { get; set; }
    public decimal P_grasa { get; set; }
}
```

### DTOs

```csharp
// Reporte de avance de medidas con variaciones calculadas por LAG()
public class ReporteAvanceDTO
{
    public int Id_cliente { get; set; }
    public string Nombre { get; set; }
    public string Ap1 { get; set; }
    public DateTime Fecha_inicio { get; set; }
    public DateTime Fecha_fin { get; set; }
    public List<MedidaVariacionDTO> Medidas { get; set; }
}

public class MedidaVariacionDTO
{
    public DateTime Fecha { get; set; }
    public decimal Cintura { get; set; }
    public decimal? Var_cintura { get; set; }
    public decimal Cuello { get; set; }
    public decimal? Var_cuello { get; set; }
    public decimal Caderas { get; set; }
    public decimal? Var_caderas { get; set; }
    public decimal P_musculo { get; set; }
    public decimal? Var_musculo { get; set; }
    public decimal P_grasa { get; set; }
    public decimal? Var_grasa { get; set; }
}
```

### Repository — ClienteRepository
```
ObtenerCliente(int id)
    Query: SELECT JOIN Usuario + Cliente por id_usuario
    Retorna: Cliente o null

CrearCliente(Cliente cliente)
    Query: INSERT en Usuario, luego INSERT en Cliente con id generado
    Retorna: id_usuario generado

ActualizarCliente(Cliente cliente)
    Query: UPDATE en Usuario y Cliente por id_usuario
    Retorna: void

CorreoExiste(string correo)
    Query: SELECT en Usuario por correo
    Retorna: bool

RegistrarMedida(Medida medida)
    Query: INSERT en Medida
    Retorna: void

MedidaExiste(int id_cliente, DateTime fecha)
    Query: SELECT en Medida por id_usuario y Fecha
    Retorna: bool

ObtenerReporteAvance(int id_cliente, DateTime fecha_inicio, DateTime fecha_fin)
    Query: EXEC SP ReporteAvanceMedidas con @id_cliente, @fecha_inicio, @fecha_fin
    Retorna: List<MedidaVariacionDTO>
```

### Service — ClienteService
```
Registro(Cliente cliente)
    1. CorreoExiste — si existe retornar error
    2. Encriptar password con BCrypt
    3. Calcular IMC = peso / (altura * altura)
    4. CrearCliente en repository

ObtenerPerfil(int id)
    1. ObtenerCliente — si null retornar error
    2. Calcular IMC = peso / (altura * altura)
    3. Retornar Cliente con IMC calculado

ActualizarPerfil(int id, Cliente cliente)
    1. ObtenerCliente — si null retornar error
    2. Si viene correo nuevo — CorreoExiste — si existe retornar error
    3. Si viene password nuevo — encriptar
    4. ActualizarCliente en repository

RegistrarMedida(int id_cliente, Medida medida)
    1. MedidaExiste — si existe retornar error
    2. RegistrarMedida en repository

ObtenerReporteAvance(int id_cliente, DateTime fecha_inicio, DateTime fecha_fin)
    1. ObtenerReporteAvance desde repository
    2. Retornar ReporteAvanceDTO
```

### Controller — ClienteController
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/cliente/registro` | Registro |
| GET | `/api/cliente/{id}` | Perfil |
| PUT | `/api/cliente/{id}` | Actualizar perfil |
| POST | `/api/cliente/{id}/medidas` | Registrar medidas |
| GET | `/api/cliente/{id}/medidas/reporte` | Reporte avance con variaciones |
| GET | `/api/cliente/{id}/registro` | Ver registro diario |
| POST | `/api/cliente/{id}/registro` | Agregar producto suelto |
| POST | `/api/cliente/{id}/registro/plan` | Registrar desde plan — SP |
| POST | `/api/cliente/{id}/registro/receta` | Registrar desde receta — SP |

**POST `/api/cliente/registro`**

Request:
```json
{
  "correo": "diego.vargas@gmail.com",
  "contrasena": "Cliente2026!",
  "nombre": "Diego",
  "ap1": "Vargas",
  "ap2": "Castro",
  "fecha_nacimiento": "1995-01-15",
  "peso": 75.0,
  "altura": 1.80,
  "pais": "Costa Rica",
  "consumo_maximo": 2000.00
}
```

Response exitoso:
```json
{ "mensaje": "Registro exitoso", "id_usuario": 4 }
```

Response fallido:
```json
{ "mensaje": "El correo ya está registrado" }
```

**GET `/api/cliente/{id}`**

Response exitoso:
```json
{
  "id_usuario": 4,
  "correo": "diego.vargas@gmail.com",
  "nombre": "Diego",
  "ap1": "Vargas",
  "ap2": "Castro",
  "fecha_nacimiento": "1995-01-15",
  "peso": 75.0,
  "altura": 1.80,
  "imc": 23.1,
  "pais": "Costa Rica",
  "consumo_maximo": 2000.00
}
```

Response fallido:
```json
{ "mensaje": "Cliente no encontrado" }
```

**PUT `/api/cliente/{id}`**

Request:
```json
{
  "correo": "diego.vargas@gmail.com",
  "contrasena": "NuevoPass2026!",
  "peso": 73.0,
  "altura": 1.80,
  "pais": "Costa Rica",
  "consumo_maximo": 1900.00
}
```

Response exitoso:
```json
{ "mensaje": "Perfil actualizado correctamente" }
```

Response fallido:
```json
{ "mensaje": "El correo ya está registrado" }
```

**POST `/api/cliente/{id}/medidas`**

Request:
```json
{
  "fecha": "2026-06-07",
  "cintura": 85.0,
  "cuello": 35.0,
  "caderas": 95.0,
  "p_musculo": 35.0,
  "p_grasa": 28.0
}
```

Response exitoso:
```json
{ "mensaje": "Medidas registradas correctamente" }
```

Response fallido:
```json
{ "mensaje": "Ya existe un registro de medidas para esa fecha" }
```

**GET `/api/cliente/{id}/medidas/reporte?fecha_inicio=2026-05-01&fecha_fin=2026-06-07`**

Usa SP `ReporteAvanceMedidas`.

Response exitoso:
```json
{
  "id_cliente": 10,
  "nombre": "Valeria",
  "ap1": "Núñez",
  "fecha_inicio": "2026-05-01",
  "fecha_fin": "2026-06-07",
  "medidas": [
    {
      "fecha": "2026-05-01",
      "cintura": 85.0, "var_cintura": null,
      "cuello": 35.0, "var_cuello": null,
      "caderas": 95.0, "var_caderas": null,
      "p_musculo": 35.0, "var_musculo": null,
      "p_grasa": 28.0, "var_grasa": null
    },
    {
      "fecha": "2026-05-08",
      "cintura": 84.0, "var_cintura": -1.0,
      "cuello": 34.8, "var_cuello": -0.2,
      "caderas": 94.5, "var_caderas": -0.5,
      "p_musculo": 35.5, "var_musculo": 0.5,
      "p_grasa": 27.5, "var_grasa": -0.5
    }
  ]
}
```

Response fallido:
```json
{ "mensaje": "No hay registros en ese período" }
```

**GET `/api/cliente/{id}/registro?fecha=2026-06-05`**

Usa vista `RegistroDiarioPaciente` — mismo response que nutricionista.

**POST `/api/cliente/{id}/registro`**

Request:
```json
{
  "fecha": "2026-06-07",
  "tiempo": "desayuno",
  "id_producto": 4,
  "cantidad": 2.0
}
```

Response exitoso:
```json
{ "mensaje": "Producto registrado correctamente" }
```

Response fallido:
```json
{ "mensaje": "Producto no encontrado" }
```

Lógica del service:
1. Verificar producto en vista `ProductosAprobados`
2. Verificar si existe registro en `Registro_Diario` para ese cliente, fecha y tiempo — si no existe crear uno
3. INSERT en `RegistroxProducto`

**POST `/api/cliente/{id}/registro/plan`**

Request:
```json
{
  "fecha": "2026-06-07",
  "tiempo": "desayuno"
}
```

Response exitoso:
```json
{ "mensaje": "Registro cargado desde plan correctamente" }
```

Response fallido:
```json
{ "mensaje": "No tiene un plan activo" }
```

Lógica del service:
1. Ejecutar SP `RegistrarConsumoDesdePlan` con `@id_cliente`, `@fecha`, `@tiempo`

**POST `/api/cliente/{id}/registro/receta`**

Request:
```json
{
  "fecha": "2026-06-07",
  "tiempo": "desayuno",
  "id_receta": 1
}
```

Response exitoso:
```json
{ "mensaje": "Registro cargado desde receta correctamente" }
```

Response fallido:
```json
{ "mensaje": "Receta no encontrada" }
```

Lógica del service:
1. Ejecutar SP `RegistrarConsumoDesdeReceta` con `@id_cliente`, `@fecha`, `@tiempo`, `@id_receta`

---

## RecetaController

### Models

```csharp
public class Receta
{
    public int Id_receta { get; set; }
    public int Id_cliente { get; set; }
    public string Nombre { get; set; }
    public List<ProductoxReceta> Productos { get; set; }
}

public class ProductoxReceta
{
    public int Id_receta { get; set; }
    public int Id_producto { get; set; }
    public string Descripcion { get; set; }
    public decimal Porcion { get; set; }
    public decimal Cantidad { get; set; }
}
```

### DTOs

```csharp
// Listado resumido de recetas del cliente
public class RecetaResumenDTO
{
    public int Id_receta { get; set; }
    public string Nombre { get; set; }
}
```

### Repository — RecetaRepository
```
CrearReceta(Receta receta)
    Query: INSERT en Receta, luego INSERT en ProductoxReceta por cada producto
    Retorna: id_receta generado

ObtenerReceta(int id)
    Query: SELECT JOIN Receta + ProductoxReceta + Producto por id_receta
    Retorna: Receta o null

ObtenerRecetasPorCliente(int id_cliente)
    Query: SELECT Receta por id_cliente
    Retorna: List<RecetaResumenDTO>

AgregarProducto(int id_receta, ProductoxReceta producto)
    Query: INSERT en ProductoxReceta
    Retorna: void

ProductoExisteEnReceta(int id_receta, int id_producto)
    Query: SELECT en ProductoxReceta por id_receta e id_producto
    Retorna: bool

EliminarProductoDeReceta(int id_receta, int id_producto)
    Query: DELETE en ProductoxReceta por id_receta e id_producto
    Retorna: void

ActualizarNombreReceta(int id, string nombre)
    Query: UPDATE Nombre en Receta por id_receta
    Retorna: void

EliminarReceta(int id)
    Query: DELETE en ProductoxReceta, luego DELETE en Receta
    Retorna: void
```

### Service — RecetaService
```
CrearReceta(Receta receta)
    1. Verificar que todos los productos existen en vista ProductosAprobados
    2. CrearReceta en repository

ObtenerReceta(int id)
    1. ObtenerReceta — si null retornar error
    2. Retornar Receta

ObtenerRecetasPorCliente(int id_cliente)
    1. ObtenerRecetasPorCliente desde repository
    2. Retornar lista

AgregarProducto(int id_receta, ProductoxReceta producto)
    1. Verificar receta existe
    2. Verificar producto existe en vista ProductosAprobados
    3. ProductoExisteEnReceta — si existe retornar error
    4. AgregarProducto en repository

EliminarProductoDeReceta(int id_receta, int id_producto)
    1. ProductoExisteEnReceta — si no existe retornar error
    2. EliminarProductoDeReceta en repository

ActualizarNombreReceta(int id, string nombre)
    1. ObtenerReceta — si null retornar error
    2. ActualizarNombreReceta en repository

EliminarReceta(int id)
    1. ObtenerReceta — si null retornar error
    2. EliminarReceta en repository
```

### Controller — RecetaController
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/receta` | Crear receta con productos |
| GET | `/api/receta/{id}` | Obtener receta completa |
| GET | `/api/receta/cliente/{id}` | Listar recetas del cliente |
| POST | `/api/receta/{id}/producto` | Agregar producto |
| DELETE | `/api/receta/{id}/producto/{id_producto}` | Quitar producto |
| PUT | `/api/receta/{id}` | Actualizar nombre |
| DELETE | `/api/receta/{id}` | Eliminar receta |

**POST `/api/receta`**

Request:
```json
{
  "id_cliente": 4,
  "nombre": "Gallo Pinto",
  "productos": [
    { "id_producto": 1, "cantidad": 2.0 },
    { "id_producto": 2, "cantidad": 2.0 }
  ]
}
```

Response exitoso:
```json
{ "mensaje": "Receta creada correctamente", "id_receta": 1 }
```

Response fallido:
```json
{ "mensaje": "Producto no encontrado" }
```

**GET `/api/receta/{id}`**

Response exitoso:
```json
{
  "id_receta": 1,
  "id_cliente": 4,
  "nombre": "Gallo Pinto",
  "productos": [
    {
      "id_producto": 1,
      "descripcion": "Arroz blanco cocido",
      "porcion": 100.0,
      "cantidad": 2.0,
      "energia": 130.0,
      "grasa": 0.3,
      "sodio": 1.0,
      "carbohidratos": 28.0,
      "proteina": 2.7,
      "calcio": 10.0,
      "hierro": 0.2,
      "vitaminas": ["B1", "B3"]
    }
  ]
}
```

Response fallido:
```json
{ "mensaje": "Receta no encontrada" }
```

**GET `/api/receta/cliente/{id}`**

Response exitoso:
```json
[
  { "id_receta": 1, "nombre": "Gallo Pinto" },
  { "id_receta": 2, "nombre": "Pollo con Arroz" }
]
```

**POST `/api/receta/{id}/producto`**

Request:
```json
{ "id_producto": 3, "cantidad": 2.0 }
```

Response exitoso:
```json
{ "mensaje": "Producto agregado correctamente" }
```

Response fallido:
```json
{ "mensaje": "Producto no encontrado" }
```

```json
{ "mensaje": "El producto ya está en la receta" }
```

**DELETE `/api/receta/{id}/producto/{id_producto}`**

Response exitoso:
```json
{ "mensaje": "Producto eliminado de la receta correctamente" }
```

Response fallido:
```json
{ "mensaje": "Producto no encontrado en la receta" }
```

**PUT `/api/receta/{id}`**

Request:
```json
{ "nombre": "Gallo Pinto Especial" }
```

Response exitoso:
```json
{ "mensaje": "Receta actualizada correctamente" }
```

**DELETE `/api/receta/{id}`**

Response exitoso:
```json
{ "mensaje": "Receta eliminada correctamente" }
```

---

## AdminController

### Models
No aplica — Admin solo usa DTOs y servicios de otros módulos.

### DTOs

```csharp
public class ReporteCobroDTO
{
    public string Tipo_cobro { get; set; }
    public string Correo { get; set; }
    public string Nombre { get; set; }
    public string Tarjeta { get; set; }
    public int Cantidad_pacientes { get; set; }
    public decimal Monto_base { get; set; }
    public decimal Descuento { get; set; }
    public decimal Monto_final { get; set; }
}
```

### Repository — AdminRepository
```
ObtenerReporteCobro()
    Query: EXEC SP ReporteCobro
    Retorna: List<ReporteCobroDTO>
```

### Service — AdminService
```
ObtenerReporteCobro()
    1. ObtenerReporteCobro desde repository
    2. Retornar lista

AprobarProducto(int id)
    1. Llama a ProductoService.AprobarProducto
```

### Controller — AdminController
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/admin/reporte-cobro` | Reporte cobro nutricionistas — SP |
| PUT | `/api/admin/producto/{id}/aprobar` | Aprobar producto |

**GET `/api/admin/reporte-cobro`**

Usa SP `ReporteCobro`.

Response exitoso:
```json
{
  "reporte": [
    {
      "tipo_cobro": "anual",
      "correo": "ana.solis@nutritec.com",
      "nombre": "Ana Solís",
      "tarjeta": "4929420961105678",
      "cantidad_pacientes": 4,
      "monto_base": 208.00,
      "descuento": 20.80,
      "monto_final": 187.20
    },
    {
      "tipo_cobro": "mensual",
      "correo": "carlos.rojas@nutritec.com",
      "nombre": "Carlos Rojas",
      "tarjeta": "4716158526571020",
      "cantidad_pacientes": 2,
      "monto_base": 8.00,
      "descuento": 0.40,
      "monto_final": 7.60
    },
    {
      "tipo_cobro": "semanal",
      "correo": "laura.mendez@nutritec.com",
      "nombre": "Laura Méndez",
      "tarjeta": "4532015112830366",
      "cantidad_pacientes": 3,
      "monto_base": 3.00,
      "descuento": 0.00,
      "monto_final": 3.00
    }
  ]
}
```

**PUT `/api/admin/producto/{id}/aprobar`**

Llama a `ProductoService.AprobarProducto`.

Response exitoso:
```json
{ "mensaje": "Producto aprobado correctamente" }
```

Response fallido:
```json
{ "mensaje": "Producto no encontrado" }
```
