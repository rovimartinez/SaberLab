# Base de datos Supabase

Este proyecto espera una base de datos en Supabase con autenticacion, solicitudes de acceso, cursos, grupos, codigos de ingreso, inscripciones, notificaciones y progreso academico.

## Orden recomendado

1. Crea un proyecto en Supabase.
2. Ve a `SQL Editor`.
3. Ejecuta [`supabase-setup.sql`](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/db/supabase-setup.sql).
4. Activa Google en `Authentication > Providers` si vas a usar login con Google.
5. Copia `Project URL` y `anon/public key` a tu archivo `.env`.
6. Crea un primer admin en `public.profiles` usando el `id` del usuario real que aparece en `Authentication > Users`.

## Variables de entorno

Tu `.env` debe tener:

```env
VITE_SUPABASE_URL=tu_project_url
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## Tablas esperadas por el frontend

- `profiles`
- `access_requests`
- `notifications`
- `courses`
- `groups`
- `group_codes`
- `enrollments`
- `evaluations`
- `student_profiles`
- `student_lesson_progress`
- `student_quiz_attempts`
- `student_mission_progress`
- `student_flashcards`
- `user_progress`
- `achievements`

## Nota importante

El SQL incluye politicas RLS basicas para que:

- cada estudiante vea y edite sus propios datos
- el admin pueda gestionar solicitudes, cursos, grupos y evaluaciones
- los cursos puedan leerse por usuarios autenticados

Si luego quieres, el siguiente paso puede ser afinar esto con triggers automáticos para:

- crear `profiles` al registrarse
- crear `notifications.time` de forma consistente
- sincronizar `user_progress` desde `student_lesson_progress`
