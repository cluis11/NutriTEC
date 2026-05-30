# NutriTEC - Plataforma de Nutrición y Estilo de Vida Saludable

Proyecto #2 · Instituto Tecnológico de Costa Rica · Escuela de Ingeniería en Computadores · Curso: Bases de Datos (CE3101) · II Semestre 2026

---

## 📌 Descripción del Proyecto

NutriTEC es una plataforma integral para el seguimiento nutricional y el manejo de planes de alimentación personalizados.

El sistema permite administrar:

- Registro y seguimiento de consumo diario de calorías y macronutrientes
- Planes de alimentación personalizados creados por nutricionistas
- Gestión de productos, platillos y recetas
- Seguimiento de medidas corporales
- Retroalimentación nutricionista–paciente
- Reportes de cobro y avance exportables en PDF
- Aplicación móvil para registro diario en cualquier lugar

---

## 🎯 Objetivo General

Desarrollar una aplicación distribuida que permita gestionar la operación completa de la plataforma NutriTEC, integrando múltiples bases de datos, servicios API, aplicación web y aplicación móvil desplegados en la nube.

---

## 🧩 Arquitectura del Sistema

El sistema está compuesto por las siguientes capas:

- **Base de Datos Relacional:** SQL Server → Azure SQL
- **Base de Datos No Relacional:** MongoDB Atlas (foro de retroalimentación)
- **Backend / API SQL:** C# (.NET) con Entity Framework, desplegado en Azure App Service
- **Backend / API MongoDB:** C# (.NET), desplegado en Azure App Service
- **Aplicación Web:** React + Bootstrap + HTML5 + CSS, desplegada en Azure
- **Aplicación Móvil:** React Native
- **Despliegue:** Azure (Azure for Students)

---

## 🥗 Funcionalidades Principales

- Gestión de usuarios: administrador, nutricionista y cliente/paciente
- Registro diario de consumo por tiempo de comida
- Gestión de productos con flujo de aprobación
- Creación de recetas con totalización automática de macros
- Planes de alimentación con 5 tiempos de comida
- Asignación de planes a pacientes por período
- Foro de retroalimentación nutricionista–paciente (MongoDB)
- Reporte de cobro por tipo de pago con exportación PDF
- Reporte de avance de medidas corporales con exportación PDF
- App Móvil: login, registro diario y gestión de recetas

---

## 🧱 Tecnologías Utilizadas

**Backend**
- C# (.NET) con Entity Framework
- ASP.NET Web API
- Azure App Service (despliegue)

**Base de Datos**
- SQL Server (desarrollo local) → Azure SQL (producción)
- MongoDB Atlas (retroalimentación)
- Stored Procedures, Triggers y Vistas en SQL Server

**Frontend Web**
- React
- Bootstrap
- HTML5 / CSS3

**App Móvil**
- React Native

---

## 👥 Equipo y Módulos

| Integrante | Módulo | Responsabilidad |
|---|---|---|
| Luis Eladio Castro | A — Auth + Admin | Login unificado, registro usuarios, vista administrador, reportes PDF |
| Ariel Saborio Alvarez | B — Planes + Seguimiento + MongoDB | Planes de alimentación, asignación pacientes, foro MongoDB |
| Gabriel Soto López | C — Productos + Recetas | CRUD productos, flujo aprobación, recetas, búsqueda |
| Sofia Xie Xie | D — Registro + Medidas + App Móvil | Registro diario, medidas corporales, App Móvil completa |

**Objetos de base de datos por módulo:**

| Integrante | Stored Procedures | Triggers | Vistas |
|---|---|---|---|
| Luis | SP cobro, SP avance medidas | Trigger consumo vs meta | — |
| Ariel | SP plan activo por paciente | — | Vista plan activo por paciente |
| Gabriel | SP búsqueda productos | Trigger aprobación producto | — |
| Sofia | SP consumo vs meta | — | Vista historial medidas, Vista consumo diario |

---

## 📦 Entregables

- 📘 Manual de usuario
- 📄 Documentación técnica (ER, modelo relacional, arquitectura, SPs, triggers, vistas)
- 🛠️ Script DDL de base de datos
- 🧪 Script de datos iniciales
- 🌐 Aplicación Web funcional
- 📱 Aplicación Móvil funcional
- ⚙️ Web APIs (SQL Server y MongoDB)
- 📦 Documento de instalación (despliegue en Azure)
- 📊 Plan de proyecto
- 📝 Minutas y bitácoras

---

## 🗃️ Estructura del Proyecto

```
NutriTEC/
├── backend-sql/        # API C# para SQL Server
├── backend-mongo/      # API C# para MongoDB
├── database/           # Scripts SQL Server (DDL + población)
├── web/                # Aplicación React
├── mobile/             # Aplicación React Native
├── docs/               # Documentación técnica y manuales
├── .gitignore
└── README.md
```

---

## 📅 Cronograma de Entrega

- 📌 Plan de proyecto: 2 Junio 2026
- 📌 Avance 1: 9 Junio 2026
- 📌 Avance 2: 16 Junio 2026
- 📌 Entrega final: 23 Junio 2026