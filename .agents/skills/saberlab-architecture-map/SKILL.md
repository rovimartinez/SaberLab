---
name: saberlab-architecture-map
description: Mapa táctico maestro de arquitectura, Cloudflare D1, contexto de autenticación, diseño de tokens y rutas globales de SaberLab.
---

# SaberLab Master Tactical Architecture Map

Guía de orientación técnica global de **SaberLab**. Consulta este mapa antes de buscar archivos dispersos en el proyecto para resolver tareas en menos de 100ms con mínimo consumo de tokens.

---

## 1. Stack Tecnológico & Arquitectura Central
- **Frontend:** React 19 + Vite + React Router 7 + Lucide Icons + Three.js (WebGL).
- **Backend Serverless:** Cloudflare Pages Functions (`functions/api/*`).
- **Base de Datos:** Cloudflare D1 (SQLite Serverless `env.DB`).
- **Autenticación:** JWT con `jose` + Google OAuth (`/api/auth/start`, `/api/auth/callback`, `/api/auth/me`).
- **Diseño & Estilos:** Tokens CSS semánticos puros en `:root` y `[data-theme='light']` (`src/styles/design-system.css`).

---

## 2. Directorio Maestro de Archivos Globales

| Función | Archivo | Responsabilidad Clave |
|---|---|---|
| **Entry Point & Tema** | `src/main.jsx` | Montaje React 19, inicialización del theme manager y estilos globales. |
| **Enrutador & Guards** | `src/App.jsx` | Definición de rutas, `ProtectedRoute`, `AdminRoute` y Suspense lazy loading. |
| **Contexto de Autenticación** | `src/context/AuthContext.jsx` | Sesión, roles (`admin`, `teacher`, `leader`, `student`), viewMode y permisos. |
| **Cliente API Frontend** | `src/lib/api.js` | Función `api(path, options)` con token JWT automático en cabecera `Authorization`. |
| **Catálogo de Cursos** | `src/data/coursesData.jsx` | `COURSES_DEFINITION` y `LESSONS_REGISTRY` (Ids, módulos, docentes, temas). |
| **Dashboard Principal** | `src/pages/PanelInicio.jsx` | Panel simétrico, selector de curso, modal de plan de estudios y launcher de apps. |
| **Evaluaciones & Exámenes** | `src/pages/PanelEvaluaciones.jsx` / `EvaluationPlayer.jsx` | Listado por curso/grupo y reproductor seguro anti-trampa con timer `Date.now()`. |
| **Lobby de Monitoreo en Vivo**| `src/components/admin/ExamLiveLobby.jsx` | Sala de espera y telemetría de examen estilo Kahoot/Wayground. |
| **Sistema de Diseño Tokens** | `src/styles/design-system.css` | Variables semánticas (`--surface-card`, `--text-heading`, `--brand-primary`, etc.). |

---

## 3. Catálogo de Cursos Oficiales

| ID | Abbr | Slug | Nombre | Color |
|---|---|---|---|---|
| **1** | `EE` | `electricidad-y-electronica` | Electricidad y Electrónica Básica | `#f59e0b` |
| **2** | `RE` | `robotica-educativa` | Robótica Educativa con Arduino | `#10b981` |
| **3** | `MA` | `modelado-animacion-3d` | Modelado y Animación 3D (Blender) | `#ec4899` |
| **6** | `SIMI`| `semillero-modelado-impresion-3d` | Semillero SIMI3D | `#06b6d4` |

---

## 4. Endpoints Backend Cloudflare D1 (`functions/api/`)

| Endpoint | Métodos | Descripción |
|---|---|---|
| `/api/auth/*` | GET | `start.js` (Google OAuth), `callback.js` (JWT exchange), `me.js` (perfil). |
| `/api/profile` | GET / POST | Datos del usuario, rol real, cursos inscritos y configuración. |
| `/api/courses` | GET | Listado y metadata de cursos activos. |
| `/api/groups` | GET / POST | Gestión de grupos de clase y vinculación con estudiantes. |
| `/api/practice` | GET / POST | Progreso y persistencia de retos y laboratorios prácticos. |
| `/api/attempts` | GET / POST | Registro de intentos de examen, puntajes y tiempos. |
| `/api/evaluations` | GET / POST | Visibilidad de exámenes, liberación de notas (`results_released`). |
| `/api/simi` | GET / POST | CRUD de eventos, asistencias (80/80), proyectos, recursos e insignias. |
