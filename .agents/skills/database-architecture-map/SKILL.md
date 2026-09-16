---
name: database-architecture-map
description: Mapa táctico integral de la base de datos Cloudflare D1 (SQLite Serverless) de SaberLab, tablas maestras, relaciones, llaves foráneas y endpoints API asociados.
---

# SaberLab Database Tactical Map (Cloudflare D1 / SQLite)

Mapa condensado de la base de datos en producción de **SaberLab**. Proporciona el esquema exacto de las **15 tablas D1**, tipos de datos, relaciones e índices para que la IA diseñe queries SQL y endpoints sin necesidad de buscar en migraciones ni backend.

---

## 1. Tablas Núcleo de la Plataforma (`migrations/0001_init.sql`)

### `perfiles`
> Usuarios del sistema (sincronizados desde Google OAuth).
- `id TEXT PRIMARY KEY` — ID único del usuario (UUID o email).
- `email TEXT NOT NULL UNIQUE` — Correo electrónico de Google.
- `full_name TEXT` — Nombre completo del estudiante/docente.
- `avatar_url TEXT` — Foto de perfil de Google.
- `role TEXT NOT NULL DEFAULT 'student'` — Rol de plataforma: `'admin'`, `'teacher'`, `'docente'`, `'leader'`, `'lider'`, `'student'`.
- `created_at TEXT DEFAULT (datetime('now'))`.

### `cursos`
> Catálogo de cursos académicos y semilleros.
- `id INTEGER PRIMARY KEY AUTOINCREMENT` — (1: EE, 2: RE, 3: MA, 6: SIMI).
- `name TEXT NOT NULL` — Nombre oficial del curso.
- `abbr TEXT` — Abreviatura (`'EE'`, `'RE'`, `'MA'`, `'SIMI'`).
- `slug TEXT UNIQUE` — Ruta amigable URL.

### `grupos`
> Salones de clase o grupos de trabajo vinculados a cursos.
- `id INTEGER PRIMARY KEY AUTOINCREMENT`.
- `course_id INTEGER REFERENCES cursos(id)`.
- `name TEXT NOT NULL` — Ej: `'Grupo 1 (Lunes 4-6)'`, `'SIMI 2026II'`.
- `teacher TEXT` — Docente o líder a cargo.

### `grupos_usuario`
> Vinculación muchos a muchos de alumnos con sus grupos.
- `user_id TEXT` — ID o email del usuario.
- `group_id INTEGER REFERENCES grupos(id)`.
- `PRIMARY KEY (user_id, group_id)`.

### `inscripciones`
> Matrícula formal de estudiantes en cursos.
- `user_id TEXT REFERENCES perfiles(id)`.
- `course_id INTEGER REFERENCES cursos(id)`.
- `group_id INTEGER REFERENCES grupos(id)`.
- `PRIMARY KEY (user_id, course_id)`.

---

## 2. Tablas Pedagógicas, Exámenes & Control Docente

### `evaluaciones`
> Exámenes y evaluaciones oficiales por módulo.
- `id INTEGER PRIMARY KEY AUTOINCREMENT`.
- `course_id INTEGER REFERENCES cursos(id)`.
- `title TEXT NOT NULL`, `description TEXT`, `instructions TEXT`.
- `questions TEXT` — JSON con el banco de reactivos/preguntas.
- `time_limit INTEGER` — Tiempo límite en minutos.
- `due_date TEXT` — Fecha límite de entrega.
- `is_published INTEGER NOT NULL DEFAULT 0` — 1: Visible, 0: Oculto.
- `created_at TEXT DEFAULT (datetime('now'))`.

### `intentos_evaluacion`
> Intentos realizados y notas obtenidas por estudiantes.
- `id INTEGER PRIMARY KEY AUTOINCREMENT`.
- `evaluacion_id INTEGER REFERENCES evaluaciones(id)`.
- `user_id TEXT REFERENCES perfiles(id)`.
- `respuestas TEXT` — JSON con las respuestas enviadas por el alumno.
- `score REAL` — Calificación obtenida.
- `created_at TEXT DEFAULT (datetime('now'))`.

### `visibilidad_curso`
> Candado docente que abre/cierra lecciones dinámicamente.
- `course_id INTEGER PRIMARY KEY REFERENCES cursos(id)`.
- `lecciones TEXT` — JSON con el mapa `{ "ee-m1-l1": true, "ee-m1-l2": false, ... }`.

### `progreso_usuario`
> Progreso y estado general de completitud por estudiante.
- `user_id TEXT PRIMARY KEY REFERENCES perfiles(id)`.
- `data TEXT` — JSON con estadísticas globales (`lessons_completed`, `streak_days`, etc.).

### `solicitudes_acceso`
> Candado de pre-aprobación institucional de nuevos usuarios.
- `id INTEGER PRIMARY KEY AUTOINCREMENT`.
- `email TEXT NOT NULL UNIQUE`, `name TEXT`.
- `status TEXT NOT NULL DEFAULT 'pending'` — `'pending'`, `'approved'`, `'rejected'`.
- `created_at TEXT DEFAULT (datetime('now'))`.

### `notificaciones`
> Notificaciones del sistema para usuarios.
- `id INTEGER PRIMARY KEY AUTOINCREMENT`.
- `user_id TEXT REFERENCES perfiles(id)`, `title TEXT`, `message TEXT`.
- `read INTEGER NOT NULL DEFAULT 0`, `created_at TEXT DEFAULT (datetime('now'))`.

---

## 3. Tablas Especiales de SIMI3D (`functions/api/simi.js`)

### `simi_eventos`
- `id TEXT PRIMARY KEY`, `event_type TEXT` (`'visita_escolar'` / `'capacitacion_tecnica'`).
- `school_name TEXT`, `date TEXT`, `time TEXT`, `location TEXT`, `status TEXT`, `leader TEXT`.
- `objective TEXT`, `equipment TEXT` (JSON), `badge_tier TEXT`, `students_count INTEGER`.
- `created_at TEXT`, `updated_at TEXT`.

### `simi_asistencias`
- `id TEXT PRIMARY KEY` (`${event_id}_${user_id}`).
- `event_id TEXT REFERENCES simi_eventos(id)`, `user_id TEXT`, `user_name TEXT`.
- `status TEXT DEFAULT 'Asistiré'`, `attended INTEGER DEFAULT 0` (Convalidación docente 1/0).
- `created_at TEXT`, `updated_at TEXT`.

### `simi_proyectos`
- `id TEXT PRIMARY KEY`, `title TEXT`, `author TEXT`, `status TEXT`, `cad_tool TEXT`, `material TEXT`, `print_time TEXT`, `weight_grams REAL`, `description TEXT`, `created_at TEXT`, `updated_at TEXT`.

### `simi_recursos`
- `id TEXT PRIMARY KEY`, `name TEXT`, `category TEXT`, `status TEXT`, `quantity INTEGER`, `specs TEXT`, `location TEXT`, `image_url TEXT`, `created_at TEXT`, `updated_at TEXT`.

### `simi_insignias`
- `id TEXT PRIMARY KEY` (`${user_id}_${pin_id}`).
- `user_id TEXT`, `pin_id TEXT`, `tier TEXT` (`'I'`, `'II'`, `'III'`, `'IV'`, `'V'`), `exp_earned INTEGER` (100 a 500).
- `unlocked_at TEXT`, `updated_at TEXT`.

### `simi_web_recursos`
- `id TEXT PRIMARY KEY`, `name TEXT`, `url TEXT`, `host TEXT`, `logo_url TEXT`, `category TEXT`, `tag TEXT`, `badge TEXT`, `color TEXT`, `icon TEXT`, `featured INTEGER`, `description TEXT`, `created_at TEXT`, `updated_at TEXT`.

---

## 4. Índices Principales D1
- `idx_notif_user` en `notificaciones(user_id)`
- `idx_insc_user` en `inscripciones(user_id)`
- `idx_intentos_ev` en `intentos_evaluacion(evaluacion_id)`
