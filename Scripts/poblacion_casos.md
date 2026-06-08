# NutriTEC — Casos de Prueba para Script de Población

Este documento describe los datos precargados en el script de población (`Script_02_NutriTEC.sql`) y qué casos de prueba cubre para cada módulo.

---

## Usuarios Base

### Admin
| id | Correo | Contraseña |
|---|---|---|
| 1 | admin@nutritec.com | Admin2026! |

### Nutricionistas
| id_usuario | Nombre | Cobro | # Pacientes | Propósito |
|---|---|---|---|---|
| 1 | Laura Méndez | semanal | 3 | Caso cobro semanal — sin descuento |
| 2 | Carlos Rojas | mensual | 2 | Caso cobro mensual — 5% descuento |
| 3 | Ana Solís | anual | 4 | Caso cobro anual — 10% descuento |

### Clientes
| id_usuario | Nombre | Nutricionista | Consumo_maximo | Propósito |
|---|---|---|---|---|
| 4 | Diego Vargas | Laura (semanal) | 2000 kcal | Registro diario dentro del límite |
| 5 | María Castro | Laura (semanal) | 1800 kcal | Registro diario con receta |
| 6 | Sofía Mora | Laura (semanal) | 2200 kcal | Tercer paciente nutricionista semanal |
| 7 | Juan Pérez | Carlos (mensual) | 2500 kcal | Paciente con plan activo hoy |
| 8 | Lucía Gómez | Carlos (mensual) | 1900 kcal | Paciente con plan vencido |
| 9 | Pedro Alvarado | Ana (anual) | 2100 kcal | Paciente con plan futuro |
| 10 | Valeria Núñez | Ana (anual) | 2300 kcal | Historial de medidas — 5 fechas |
| 11 | Andrés Jiménez | Ana (anual) | 1750 kcal | Historial de consumo multi-fecha |
| 12 | Camila Torres | Ana (anual) | 2000 kcal | Cuarto paciente nutricionista anual |
| 13 | Roberto Fallas | — (independiente) | 1800 kcal | Cliente sin nutricionista — aparece en vista |

---

## Módulo A — Luis Castro

### SP Reporte de Cobro
Resultado esperado:

| Tipo | Nutricionista | Pacientes | Monto base | Descuento | Monto final |
|---|---|---|---|---|---|
| Anual | Ana Solís | 4 | $208.00 | $20.80 | $187.20 |
| Mensual | Carlos Rojas | 2 | $8.00 | $0.40 | $7.60 |
| Semanal | Laura Méndez | 3 | $3.00 | $0.00 | $3.00 |

### SP Reporte de Avance de Medidas
- Usar **Valeria Núñez (id 10)** — 5 fechas con tendencia de mejora
- Rango: `2026-05-01` a `2026-06-07`
- Debe mostrar variación entre fechas consecutivas con `LAG()`

---

## Módulo B — Ariel Saborio

### Trigger Validar Plan vs Consumo Máximo
- Al insertar en `PlanxCliente`, el trigger suma calorías del plan y compara contra `Consumo_maximo` del cliente
- Datos de prueba ya insertados tienen planes dentro del límite de sus clientes
- Para probar el rechazo: intentar asignar Plan Ganancia Muscular (~2100 kcal) a un cliente con consumo_maximo bajo

### Vista Clientes sin Nutricionista
- Solo **Roberto Fallas (id 13)** debe aparecer
- Todos los demás clientes tienen nutricionista asignado

### Vista Registro Diario del Paciente
- **Diego Vargas (id 4)** — 3 tiempos de comida el 2026-06-05
- **María Castro (id 5)** — 4 tiempos de comida el 2026-06-05
- **Andrés Jiménez (id 11)** — registros en 3 fechas distintas

---

## Módulo C — Gabriel Soto

### Trigger Revertir Producto a Pendiente
- **Arroz blanco (id 1)** — está en planes, recetas y registros → UPDATE debe ser rechazado
- **Suplemento XYZ (id 9)** — no está en uso, estado pendiente → UPDATE permitido
- Producto aprobado sin uso → UPDATE permitido, estado cambia a pendiente automáticamente

### Vista Productos Aprobados
- Productos 1 al 8 deben aparecer
- Productos 9 y 10 (pendientes) NO deben aparecer
- La API aplica búsqueda por nombre o código encima de esta vista

---

## Módulo D — Sofia Xie

### SP Registrar Consumo desde Plan
- **Juan Pérez (id 7)** tiene Plan Mantenimiento activo hoy (2026-05-01 a 2026-07-01)
- Llamar SP con `@id_cliente=7`, `@fecha='2026-06-07'`, `@tiempo='desayuno'`
- Debe insertar Pan integral + Leche en Registro_Diario y RegistroxProducto
- **Lucía Gómez (id 8)** no tiene plan activo → debe retornar error

### SP Registrar Consumo desde Receta
- **Diego Vargas (id 4)** — Gallo Pinto (id 1): inserta Arroz + Frijoles
- **María Castro (id 5)** — Pollo con Arroz (id 2): inserta Pollo + Arroz + Aceite
- **Andrés Jiménez (id 11)** — Sandwich de Atún (id 3): inserta Atún + Pan integral

---

## Productos

| id | Código | Descripción | Estado | Vitaminas |
|---|---|---|---|---|
| 1 | 7400001 | Arroz blanco cocido | aprobado | B1, B3 |
| 2 | 7400002 | Frijoles negros cocidos | aprobado | B1, B6, C |
| 3 | 7400003 | Pechuga de pollo | aprobado | B3, B6 |
| 4 | 7400004 | Pan integral | aprobado | B1, B2, E |
| 5 | 7400005 | Leche semidescremada | aprobado | A, D, B12 |
| 6 | 7400006 | Plátano maduro | aprobado | B6, C |
| 7 | 7400007 | Atún en agua | aprobado | B3, B12, D |
| 8 | 7400008 | Aceite de oliva | aprobado | E, K |
| 9 | 7400009 | Suplemento proteico XYZ | pendiente | B6, B12 |
| 10 | 7400010 | Barra energética ABC | pendiente | B1, B2, C |

---

## Notas Generales

- Passwords en texto plano solo para desarrollo local — en producción el cifrado ocurre en la API
- Fecha de referencia para pruebas: `2026-06-07`
- Roberto Fallas (id 13) es el único cliente independiente sin nutricionista
