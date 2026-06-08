# NutriTEC — Casos de Prueba para Script de Población

Este documento describe los datos precargados en el script de población (`Script_02_NutriTEC.sql`) y qué casos de prueba cubre para cada módulo. Cada integrante puede identificar qué datos usar durante el desarrollo de su módulo.

---

## Usuarios Base

### Admin
| id | Correo | Contraseña |
|---|---|---|
| 1 | admin@nutritec.com | (encriptado: Admin2026!) |

---

### Nutricionistas
| id_usuario | Nombre | Cobro | # Pacientes | Propósito |
|---|---|---|---|---|
| 2 | Laura Méndez | semanal | 3 | Caso cobro semanal — sin descuento |
| 3 | Carlos Rojas | mensual | 2 | Caso cobro mensual — 5% descuento |
| 4 | Ana Solís | anual | 4 | Caso cobro anual — 10% descuento |

---

### Clientes
| id_usuario | Nombre | Nutricionista | Consumo_maximo | Propósito |
|---|---|---|---|---|
| 5 | Diego Vargas | Laura (semanal) | 2000 kcal | Paciente con consumo dentro del límite |
| 6 | María Castro | Laura (semanal) | 1800 kcal | Paciente que supera su meta calórica (trigger Luis) |
| 7 | Sofía Mora | Laura (semanal) | 2200 kcal | Tercer paciente de nutricionista semanal |
| 8 | Juan Pérez | Carlos (mensual) | 2500 kcal | Paciente con plan activo hoy |
| 9 | Lucía Gómez | Carlos (mensual) | 1900 kcal | Paciente con plan vencido |
| 10 | Pedro Alvarado | Ana (anual) | 2100 kcal | Paciente con plan futuro |
| 11 | Valeria Núñez | Ana (anual) | 2300 kcal | Paciente con múltiples registros de medidas |
| 12 | Andrés Jiménez | Ana (anual) | 1750 kcal | Paciente con historial de consumo completo |
| 13 | Camila Torres | Ana (anual) | 2000 kcal | Cuarto paciente nutricionista anual |
| 14 | Roberto Fallas | — (independiente) | 1800 kcal | Cliente sin nutricionista, solo meta calórica |

---

## Módulo A — Luis Castro (Auth + Admin + Reportes)

### SP Cobro por Tipo de Pago
El SP debe producir el siguiente resultado esperado:

| Tipo | Nutricionista | Pacientes | Monto base | Descuento | Monto final |
|---|---|---|---|---|---|
| Semanal | Laura Méndez | 3 | $3/semana | 0% | $3.00 |
| Mensual | Carlos Rojas | 2 | $8.00 | 5% | $7.60 |
| Anual | Ana Solís | 4 | $208.00 | 10% | $187.20 |

### SP Avance de Medidas
- Usar cliente **Valeria Núñez (id 11)** — tiene medidas en 5 fechas distintas
- Rango sugerido para prueba: `2026-05-01` a `2026-06-07`

### Trigger Validar Consumo vs Meta
- **María Castro (id 6)** tiene consumo_maximo de 1800 kcal pero su registro diario del `2026-06-05` suma 2100 kcal → debe activar el trigger
- **Diego Vargas (id 5)** tiene consumo_maximo de 2000 kcal y su registro suma 1750 kcal → no activa el trigger

---

## Módulo B — Ariel Saborio (Planes + Seguimiento)

### Planes creados
| id_plan | Nutricionista | Nombre | Propósito |
|---|---|---|---|
| 1 | Laura Méndez | Plan Pérdida de Peso | Plan con productos en los 5 tiempos |
| 2 | Carlos Rojas | Plan Mantenimiento | Plan asignado activo hoy |
| 3 | Ana Solís | Plan Ganancia Muscular | Plan con asignación futura |

### Asignaciones (PlanxCliente)
| Cliente | Plan | Inicio | Fin | Estado |
|---|---|---|---|---|
| Juan Pérez (8) | Plan Mantenimiento (2) | 2026-05-01 | 2026-07-01 | **Activo hoy** |
| Lucía Gómez (9) | Plan Pérdida de Peso (1) | 2026-03-01 | 2026-05-01 | **Vencido** |
| Pedro Alvarado (10) | Plan Ganancia Muscular (3) | 2026-07-01 | 2026-09-01 | **Futuro** |

### SP Plan Activo por Paciente
- Consultar **Juan Pérez (id 8)** con fecha `2026-06-07` → debe retornar Plan Mantenimiento
- Consultar **Lucía Gómez (id 9)** con fecha `2026-06-07` → no debe retornar ningún plan
- Consultar **Pedro Alvarado (id 10)** con fecha `2026-06-07` → no debe retornar ningún plan

### Vista Plan Activo por Paciente
- Debe mostrar solo a **Juan Pérez** con su plan activo a la fecha de hoy

---

## Módulo C — Gabriel Soto (Productos + Recetas)

### Productos
| id | Código | Descripción | Estado | Propósito |
|---|---|---|---|---|
| 1 | 7400001 | Arroz blanco cocido | aprobado | Base para recetas |
| 2 | 7400002 | Frijoles negros cocidos | aprobado | Base para recetas |
| 3 | 7400003 | Pechuga de pollo | aprobado | Producto proteico |
| 4 | 7400004 | Pan integral | aprobado | Producto para desayuno |
| 5 | 7400005 | Leche semidescremada | aprobado | Producto para desayuno |
| 6 | 7400006 | Plátano maduro | aprobado | Producto para merienda |
| 7 | 7400007 | Atún en agua | aprobado | Producto proteico |
| 8 | 7400008 | Aceite de oliva | aprobado | Condimento |
| 9 | 7400009 | Suplemento proteico XYZ | pendiente | Pendiente de aprobación — trigger Gabriel |
| 10 | 7400010 | Barra energética ABC | pendiente | Pendiente de aprobación — trigger Gabriel |

### Trigger Aprobación de Producto
- Productos **9 y 10** están en estado `pendiente`
- Al hacer UPDATE a `aprobado` desde la vista admin → debe activar el trigger

### Recetas (creadas por clientes)
| id_receta | Cliente | Nombre | Productos que la componen |
|---|---|---|---|
| 1 | Diego Vargas (5) | Gallo Pinto | Arroz (1) + Frijoles (2) |
| 2 | María Castro (6) | Pollo con Arroz | Pollo (3) + Arroz (1) + Aceite (8) |
| 3 | Andrés Jiménez (12) | Sandwich de Atún | Atún (7) + Pan integral (4) |

### SP Búsqueda de Productos con Filtros
- Buscar por nombre: `"arroz"` → debe retornar Arroz blanco cocido
- Buscar por código: `"7400003"` → debe retornar Pechuga de pollo
- Buscar solo aprobados → debe retornar productos 1 al 8
- Buscar solo pendientes → debe retornar productos 9 y 10

---

## Módulo D — Sofia Xie (Registro + Medidas + App Móvil)

### Registros Diarios de Consumo
Todos los registros usan productos aprobados.

| Cliente | Fecha | Tiempo | Productos | Calorías aprox. | Propósito |
|---|---|---|---|---|---|
| Diego Vargas (5) | 2026-06-05 | desayuno | Pan(4) + Leche(5) | 350 kcal | Dentro del límite |
| Diego Vargas (5) | 2026-06-05 | almuerzo | Arroz(1) + Pollo(3) | 600 kcal | Dentro del límite |
| Diego Vargas (5) | 2026-06-05 | cena | Arroz(1) + Frijoles(2) | 500 kcal | Total: ~1450 kcal < 2000 |
| María Castro (6) | 2026-06-05 | desayuno | Pan(4) + Leche(5) | 350 kcal | Inicio registro que supera límite |
| María Castro (6) | 2026-06-05 | almuerzo | Pollo(3) + Arroz(1) | 800 kcal | — |
| María Castro (6) | 2026-06-05 | merienda_tarde | Plátano(6) + Barra(10) | 500 kcal | — |
| María Castro (6) | 2026-06-05 | cena | Atún(7) + Pan(4) | 450 kcal | Total: ~2100 kcal > 1800 → trigger |
| Andrés Jiménez (12) | 2026-06-01 | desayuno | Pan(4) + Leche(5) | 350 kcal | Historial multi-fecha |
| Andrés Jiménez (12) | 2026-06-02 | desayuno | Arroz(1) + Frijoles(2) | 400 kcal | Historial multi-fecha |
| Andrés Jiménez (12) | 2026-06-03 | almuerzo | Pollo(3) + Arroz(1) | 600 kcal | Historial multi-fecha |

### Registros de Medidas (Medida)
Cliente **Valeria Núñez (id 11)** — historial en 5 fechas para probar reporte de avance:

| Fecha | Cintura | Cuello | Caderas | % Músculo | % Grasa |
|---|---|---|---|---|---|
| 2026-05-01 | 85.0 | 35.0 | 95.0 | 35.0 | 28.0 |
| 2026-05-08 | 84.0 | 34.8 | 94.5 | 35.5 | 27.5 |
| 2026-05-15 | 83.5 | 34.5 | 94.0 | 36.0 | 27.0 |
| 2026-05-22 | 82.0 | 34.2 | 93.0 | 36.5 | 26.5 |
| 2026-06-01 | 81.0 | 34.0 | 92.5 | 37.0 | 26.0 |

Cliente **Andrés Jiménez (id 12)** — medidas básicas para la vista:

| Fecha | Cintura | Cuello | Caderas | % Músculo | % Grasa |
|---|---|---|---|---|---|
| 2026-05-15 | 90.0 | 38.0 | 98.0 | 40.0 | 22.0 |
| 2026-06-01 | 89.0 | 37.5 | 97.0 | 40.5 | 21.5 |

### SP Consumo Diario vs Meta
- **Diego Vargas (id 5)** fecha `2026-06-05` → dentro del límite (1450 < 2000)
- **María Castro (id 6)** fecha `2026-06-05` → supera límite (2100 > 1800)

### Vista Historial de Medidas
- Debe mostrar todas las medidas de **Valeria Núñez** ordenadas por fecha

### Vista Consumo Diario
- Debe mostrar el consumo del día agrupado por tiempo de comida para cualquier cliente

---

## Notas Generales

- Todos los passwords están encriptados con el mismo algoritmo que defina Luis en el módulo de Auth
- Los productos en los planes solo usan productos con estado `aprobado`
- El cliente independiente (Roberto Fallas, id 14) no tiene plan ni nutricionista asignado — sirve para probar el flujo independiente
- La fecha de referencia para "hoy" en las pruebas es `2026-06-07`
