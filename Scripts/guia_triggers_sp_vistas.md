# NutriTEC — Guía de Implementación: Triggers, Stored Procedures y Vistas

Este documento describe qué debe implementar cada integrante, qué lógica debe tener cada objeto de base de datos y qué casos de prueba usar para validarlo. No incluye código SQL — es una guía de qué hacer y qué esperar.

---

## STORED PROCEDURES

---

### SP 1 — Reporte de Cobro por Tipo de Pago
**Responsable:** Luis Castro
**Obligatorio:** Sí

**¿De dónde sale?**
Explícito en el enunciado. El administrador necesita saber cuánto cobrarle a cada nutricionista según su tipo de pago y cantidad de pacientes.

**Tablas involucradas:**
- `Nutricionista` — tipo de cobro y tarjeta
- `Usuario` — nombre completo y correo
- `ClientexNutricionista` — para contar pacientes por nutricionista

**Lógica:**
1. Para cada nutricionista contar sus pacientes en `ClientexNutricionista`
2. Calcular monto base según tipo:
   - Semanal: `pacientes * $1.00`
   - Mensual: `pacientes * $4.00`
   - Anual: `pacientes * $52.00`
3. Aplicar descuento:
   - Semanal: sin descuento
   - Mensual: 5%
   - Anual: 10%
4. Calcular monto final: `monto_base - descuento`
5. Ordenar agrupado por tipo de cobro

**Resultado esperado con datos de prueba:**

| Tipo | Correo | Nombre | Tarjeta | Pacientes | Monto base | Descuento | Monto final |
|---|---|---|---|---|---|---|---|
| Anual | ana.solis@nutritec.com | Ana Solís | 4929420961105678 | 4 | $208.00 | $20.80 | $187.20 |
| Mensual | carlos.rojas@nutritec.com | Carlos Rojas | 4716158526571020 | 2 | $8.00 | $0.40 | $7.60 |
| Semanal | laura.mendez@nutritec.com | Laura Méndez | 4532015112830366 | 3 | $3.00 | $0.00 | $3.00 |

---

### SP 2 — Registrar Consumo desde Plan
**Responsable:** Sofia Xie

**¿De dónde sale?**
Al hacer registro diario, si el cliente tiene un plan activo puede registrar directamente los productos sugeridos para ese tiempo de comida.

**Parámetros:** `@id_cliente`, `@fecha`, `@tiempo`

**Tablas involucradas:**
- `PlanxCliente` — para obtener el plan activo del cliente
- `ProductoxPlan` — productos del plan para ese tiempo de comida
- `Registro_Diario` — donde se crea el registro
- `RegistroxProducto` — donde se insertan los productos

**Lógica:**
1. Buscar plan activo del cliente en `PlanxCliente` donde `@fecha BETWEEN Inicio AND Fin`
2. Obtener todos los productos de ese plan para el `@tiempo` indicado desde `ProductoxPlan`
3. Insertar registro en `Registro_Diario`
4. Insertar cada producto en `RegistroxProducto` con su cantidad del plan

**Casos de prueba:**

| Cliente | Fecha | Tiempo | Resultado esperado |
|---|---|---|---|
| Juan Pérez (id 7) | 2026-06-07 | desayuno | Inserta Pan integral + Leche del Plan Mantenimiento |
| Juan Pérez (id 7) | 2026-06-07 | almuerzo | Inserta Arroz + Pollo del Plan Mantenimiento |
| Lucía Gómez (id 8) | 2026-06-07 | desayuno | Error — no tiene plan activo |

---

### SP 3 — Registrar Consumo desde Receta
**Responsable:** Sofia Xie

**¿De dónde sale?**
Al hacer registro diario, el cliente puede seleccionar una receta propia y registrar todos sus productos de una vez.

**Parámetros:** `@id_cliente`, `@fecha`, `@tiempo`, `@id_receta`

**Tablas involucradas:**
- `ProductoxReceta` — productos que componen la receta
- `Registro_Diario` — donde se crea el registro
- `RegistroxProducto` — donde se insertan los productos

**Lógica:**
1. Obtener todos los productos de la receta desde `ProductoxReceta`
2. Insertar registro en `Registro_Diario`
3. Insertar cada producto en `RegistroxProducto` con su cantidad de la receta

**Casos de prueba:**

| Cliente | Fecha | Tiempo | Receta | Resultado esperado |
|---|---|---|---|---|
| Diego Vargas (id 4) | 2026-06-07 | desayuno | Gallo Pinto (id 1) | Inserta Arroz + Frijoles |
| María Castro (id 5) | 2026-06-07 | almuerzo | Pollo con Arroz (id 2) | Inserta Pollo + Arroz + Aceite |
| Andrés Jiménez (id 11) | 2026-06-07 | cena | Sandwich de Atún (id 3) | Inserta Atún + Pan integral |

---

### SP 4 — Reporte de Avance de Medidas
**Responsable:** Luis Castro

**¿De dónde sale?**
El enunciado dice que el sistema debe proveer un reporte de medidas en un período de tiempo dado con opción de exportar a PDF.

**Parámetros:** `@id_cliente`, `@fecha_inicio`, `@fecha_fin`

**Tablas involucradas:**
- `Medida`
- `Usuario` — para nombre del cliente

**Lógica:**
1. Filtrar registros de `Medida` por cliente y período
2. Usar `LAG()` para calcular la variación de cada medida respecto al registro anterior
3. Retornar ordenado por fecha con columnas de variación por cada medida

**Resultado esperado — Valeria Núñez (id 10), 2026-05-01 a 2026-06-07:**

| Fecha | Cintura | Var. Cintura | Cuello | Var. Cuello | Caderas | Var. Caderas | % Músculo | Var. Músculo | % Grasa | Var. Grasa |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-05-01 | 85.0 | — | 35.0 | — | 95.0 | — | 35.0 | — | 28.0 | — |
| 2026-05-08 | 84.0 | -1.0 | 34.8 | -0.2 | 94.5 | -0.5 | 35.5 | +0.5 | 27.5 | -0.5 |
| 2026-05-15 | 83.5 | -0.5 | 34.5 | -0.3 | 94.0 | -0.5 | 36.0 | +0.5 | 27.0 | -0.5 |
| 2026-05-22 | 82.0 | -1.5 | 34.2 | -0.3 | 93.0 | -1.0 | 36.5 | +0.5 | 26.5 | -0.5 |
| 2026-06-01 | 81.0 | -1.0 | 34.0 | -0.2 | 92.5 | -0.5 | 37.0 | +0.5 | 26.0 | -0.5 |

---

## TRIGGERS

---

### Trigger 1 — Validar Plan vs Consumo Máximo del Cliente
**Responsable:** Ariel Saborio

**¿De dónde sale?**
Al asignar un plan a un cliente, el sistema debe verificar que el total de calorías del plan no supere el consumo máximo diario del cliente.

**Evento:** `AFTER INSERT` en `PlanxCliente`

**Tablas involucradas:**
- `PlanxCliente` — donde se dispara (tabla `inserted`)
- `ProductoxPlan` — productos del plan
- `Producto` — para obtener `Energia`
- `Cliente` — para obtener `Consumo_maximo`

**Lógica:**
1. Obtener `id_plan` e `id_cliente` del registro recién insertado
2. Sumar `Energia * Cantidad` de todos los productos en `ProductoxPlan` para ese plan
3. Comparar contra `Consumo_maximo` del cliente
4. Si supera → ROLLBACK con mensaje de error
5. Si no supera → permitir la asignación

**Casos de prueba:**

| Cliente | Plan | Total calorías plan | Consumo máximo | Resultado esperado |
|---|---|---|---|---|
| Juan Pérez (id 7) | Plan Mantenimiento (id 2) | ~1450 kcal | 2500 kcal | Asignación permitida |
| Lucía Gómez (id 8) | Plan Pérdida de Peso (id 1) | ~1200 kcal | 1900 kcal | Asignación permitida |
| Insertar cliente con consumo_maximo bajo | Plan Ganancia Muscular (id 3) | ~2100 kcal | 1500 kcal | Error — asignación rechazada |

---

### Trigger 2 — Revertir Producto a Pendiente al Modificar
**Responsable:** Gabriel Soto

**¿De dónde sale?**
Si un producto aprobado es modificado, sus valores nutricionales cambian y debe ser reaprobado por el administrador. Además si está siendo usado en planes, recetas o registros no debe poder modificarse.

**Evento:** `AFTER UPDATE` en `Producto`

**Tablas involucradas:**
- `Producto` — donde se dispara (tablas `inserted` y `deleted`)
- `ProductoxPlan` — para verificar si está en uso
- `ProductoxReceta` — para verificar si está en uso
- `RegistroxProducto` — para verificar si está en uso

**Lógica:**
1. Verificar si el producto está referenciado en `ProductoxPlan`, `ProductoxReceta` o `RegistroxProducto`
2. Si está referenciado → ROLLBACK con mensaje de error
3. Si no está referenciado y estaba `aprobado` → cambiar `Estado` a `pendiente` automáticamente

**Casos de prueba:**

| Producto | Está en uso | Estado anterior | Resultado esperado |
|---|---|---|---|
| Arroz blanco (id 1) | Sí — en planes, recetas y registros | aprobado | Error — modificación rechazada |
| Suplemento XYZ (id 9) | No | pendiente | Modificación permitida, estado se mantiene pendiente |
| Producto nuevo aprobado sin uso | No | aprobado | Modificación permitida, estado cambia a pendiente |

---

## VISTAS

---

### Vista 1 — Clientes sin Nutricionista Asociado
**Responsable:** Ariel Saborio

**¿De dónde sale?**
El nutricionista necesita buscar clientes disponibles para asociarlos como pacientes.

**Tablas involucradas:**
- `Cliente`
- `Usuario`
- `ClientexNutricionista` — para excluir clientes ya asociados

**Lógica:**
Retornar clientes de `Cliente` + `Usuario` donde `id_usuario` NO existe en `ClientexNutricionista`.

**Resultado esperado con datos de prueba:**

| id | Nombre | Correo | País |
|---|---|---|---|
| 13 | Roberto Fallas | roberto.fallas@gmail.com | Costa Rica |

Todos los demás clientes ya tienen nutricionista asignado.

---

### Vista 2 — Registro Diario del Paciente
**Responsable:** Ariel Saborio

**¿De dónde sale?**
El nutricionista entra al perfil de su paciente y revisa su registro diario de consumo para dar retroalimentación.

**Tablas involucradas:**
- `Registro_Diario`
- `RegistroxProducto`
- `Producto`
- `Usuario` — para nombre del cliente

**Lógica:**
JOIN de todas las tablas mostrando por cliente, fecha y tiempo de comida los productos consumidos con sus calorías. Sin filtros — la API filtra por cliente.

**Resultado esperado con datos de prueba:**

| Cliente | Fecha | Tiempo | Producto | Cantidad | Calorías |
|---|---|---|---|---|---|
| Diego Vargas | 2026-06-05 | desayuno | Pan integral | 60g | ~48 kcal |
| Diego Vargas | 2026-06-05 | desayuno | Leche semidescremada | 240ml | ~110 kcal |
| Diego Vargas | 2026-06-05 | almuerzo | Arroz blanco | 100g | ~130 kcal |
| Diego Vargas | 2026-06-05 | almuerzo | Pechuga de pollo | 150g | ~248 kcal |
| María Castro | 2026-06-05 | desayuno | Pan integral | 60g | ~48 kcal |
| ... | ... | ... | ... | ... | ... |

---

### Vista 3 — Productos Aprobados
**Responsable:** Gabriel Soto

**¿De dónde sale?**
Tanto el nutricionista como el cliente buscan productos para agregar a planes, recetas y registros diarios. Solo deben ver productos aprobados.

**Tablas involucradas:**
- `Producto` — filtrado por `Estado = 'aprobado'`
- `VitaminasxProducto` — para incluir vitaminas

**Lógica:**
JOIN de `Producto` con `VitaminasxProducto` filtrando donde `Estado = 'aprobado'`. La API aplica filtros adicionales de búsqueda por nombre o código encima de esta vista.

**Resultado esperado con datos de prueba:**

| id | Código | Descripción | Energía | Estado |
|---|---|---|---|---|
| 1 | 7400001 | Arroz blanco cocido | 130 kcal | aprobado |
| 2 | 7400002 | Frijoles negros cocidos | 132 kcal | aprobado |
| 3 | 7400003 | Pechuga de pollo | 165 kcal | aprobado |
| 4 | 7400004 | Pan integral | 80 kcal | aprobado |
| 5 | 7400005 | Leche semidescremada | 110 kcal | aprobado |
| 6 | 7400006 | Plátano maduro | 122 kcal | aprobado |
| 7 | 7400007 | Atún en agua | 116 kcal | aprobado |
| 8 | 7400008 | Aceite de oliva | 88 kcal | aprobado |

Productos 9 y 10 (pendientes) NO deben aparecer.

---

## Distribución por integrante

| Integrante | SP | Trigger | Vista |
|---|---|---|---|
| Luis Castro | Reporte de cobro, Reporte de avance de medidas | — | — |
| Ariel Saborio | — | Validar plan vs consumo máximo | Clientes sin nutricionista, Registro diario del paciente |
| Gabriel Soto | — | Revertir producto a pendiente | Productos aprobados |
| Sofia Xie | Registrar consumo desde plan, Registrar consumo desde receta | — | — |

---

## Notas Generales

- La fecha de referencia para pruebas es `2026-06-07`
- Todos los objetos de BD deben estar en `nutritec_db`
- Los SPs deben recibir parámetros con prefijo `@`
- Los triggers usan `inserted` y `deleted` para acceder a valores nuevos y anteriores
- Ningún SP debe ser una sola sentencia SQL
