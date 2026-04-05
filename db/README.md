# Base de datos Supabase

Este proyecto espera una base de datos en Supabase con autenticacion, solicitudes de acceso, cursos, grupos, codigos de ingreso, inscripciones, notificaciones y progreso academico.

## Orden recomendado

1. Crea un proyecto en Supabase.
2. Ve a `SQL Editor`.
3. Ejecuta [`supabase-setup.sql`](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/db/supabase-setup.sql).
4. Ejecuta [`supabase-learning-analytics.sql`](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/db/supabase-learning-analytics.sql).
5. Si tu proyecto ya existia antes de escalar evaluaciones, ejecuta [`supabase-evaluations-schema.sql`](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/db/supabase-evaluations-schema.sql).
6. Ejecuta [`supabase-evaluations-seed.sql`](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/db/supabase-evaluations-seed.sql) para sembrar evaluaciones formales iniciales.
7. Ejecuta opcionalmente [`supabase-analytics-views.sql`](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/db/supabase-analytics-views.sql) para vistas agregadas de aprendizaje.
8. Ejecuta opcionalmente [`supabase-operational-hardening.sql`](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/db/supabase-operational-hardening.sql) para triggers `updated_at` e indices adicionales.
9. Activa Google en `Authentication > Providers` si vas a usar login con Google.
10. Copia `Project URL` y `anon/public key` a tu archivo `.env`.
11. Crea un primer admin en `public.profiles` usando el `id` del usuario real que aparece en `Authentication > Users`.

## Variables de entorno

Tu `.env` debe tener:

```env
VITE_SUPABASE_URL=tu_project_url
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## Tablas usadas actualmente (ESPAÑOL)

- `perfiles` - Perfiles de usuarios
- `solicitudes_acceso` - Solicitudes de acceso
- `notificaciones` - Notificaciones
- `cursos` - Cursos
- `grupos` - Grupos de cursos
- `codigos_grupo` - Códigos para unirse a grupos
- `inscripciones` - Inscripciones de estudiantes
- `evaluaciones` - Evaluaciones
- `grupos_usuario` - Relación usuario-grupo
- `progreso_usuario` - Progreso del estudiante
- `logros` - Logros/Logros
- `tarjetas_estudiante` - Flashcards del estudiante
- `visibilidad_leccion_curso` - Configuración de visibilidad de lecciones

## Tablas pendientes (sin uso aún)

- `student_profiles` - Perfiles de estudiante
- `student_lesson_progress` - Progreso de lecciones
- `student_quiz_attempts` - Intentos de quiz
- `student_mission_progress` - Progreso de misiones

## Nota importante

La tabla `evaluations` ya esta preparada para escalar a muchos cursos y muchas evaluaciones por curso usando:

- `course_id`
- `module_id`
- `evaluation_key`

Eso permite listar una ficha operativa en base de datos y enlazarla luego con una definicion completa en codigo sin depender del titulo visible.

El SQL incluye politicas RLS basicas para que:

- cada estudiante vea y edite sus propios datos
- el admin pueda gestionar solicitudes, cursos, grupos y evaluaciones
- los cursos puedan leerse por usuarios autenticados

Si luego quieres, el siguiente paso puede ser afinar esto con triggers automáticos para:

- crear `profiles` al registrarse
- crear `notifications.time` de forma consistente
- sincronizar `user_progress` desde `student_lesson_progress`

Tambien puedes revisar [`analytics-notes.md`](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/db/analytics-notes.md) para la separacion entre capa operativa y capa analitica.

Si quieres consultas listas para paneles, usa [`analytics-dashboard-queries.sql`](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/db/analytics-dashboard-queries.sql).

Si quieres revisar la consistencia entre frontend y esquema actual, consulta [`frontend-schema-audit.md`](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/db/frontend-schema-audit.md).
