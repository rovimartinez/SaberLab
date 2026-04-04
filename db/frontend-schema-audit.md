# Auditoria Frontend vs Supabase

Fecha de revision: 2026-04-03

## Resultado general

El frontend actual es consistente con la base definida en [supabase-setup.sql](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/db/supabase-setup.sql) y [supabase-learning-analytics.sql](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/db/supabase-learning-analytics.sql).

No se detectaron tablas faltantes ni columnas claramente incompatibles para los flujos operativos activos.

## Tablas operativas usadas por el frontend

### `profiles`

Usada desde:
- [AuthContext.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/context/AuthContext.jsx)
- [AccessRequests.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/pages/AccessRequests.jsx)

Columnas usadas:
- `id`
- `email`
- `full_name`
- `role`

Estado:
- Compatible con el SQL actual.

### `access_requests`

Usada desde:
- [AuthContext.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/context/AuthContext.jsx)
- [AccessRequests.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/pages/AccessRequests.jsx)
- [RequestAccess.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/pages/RequestAccess.jsx)

Columnas usadas:
- `id`
- `name`
- `email`
- `status`
- `created_at`

Estado:
- Compatible.
- Conviene indexar `status, created_at` para panel admin.

### `notifications`

Usada desde:
- [AuthContext.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/context/AuthContext.jsx)
- [Notifications.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/pages/Notifications.jsx)

Columnas usadas:
- `id`
- `user_id`
- `type`
- `title`
- `message`
- `read`
- `time`
- `created_at`

Estado:
- Compatible.
- El campo `time` sigue siendo texto libre y no una derivacion automatica.

### `courses`

Usada desde:
- [MyCourses.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/pages/MyCourses.jsx)
- [Evaluations.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/pages/Evaluations.jsx)

Columnas usadas:
- `id`
- `abbr`
- `slug`
- `name`
- `color`

Estado:
- Compatible.

### `groups`

Usada desde:
- [MyCourses.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/pages/MyCourses.jsx)
- [CourseDetail.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/pages/CourseDetail.jsx)

Columnas usadas:
- `id`
- `course_id`
- `name`
- `teacher`
- `created_at`

Estado:
- Compatible.
- No tiene `updated_at`; hoy no hace falta, pero podria ser util si luego se edita el grupo.

### `group_codes`

Usada desde:
- [MyCourses.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/pages/MyCourses.jsx)
- [CourseDetail.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/pages/CourseDetail.jsx)

Columnas usadas:
- `id`
- `group_id`
- `code`
- `expires_at`
- `created_at`

Estado:
- Compatible.
- Conviene indexar `group_id, expires_at`.

### `enrollments`

Usada desde:
- [AuthContext.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/context/AuthContext.jsx)
- [MyCourses.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/pages/MyCourses.jsx)

Columnas usadas:
- `id`
- `user_id`
- `course_id`
- `group_id`
- `progress`
- `status`
- `created_at`
- `updated_at`

Estado:
- Compatible.
- Conviene indexar `course_id`, `group_id` y combinaciones con `status`.

### `evaluations`

Usada desde:
- [Evaluations.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/pages/Evaluations.jsx)

Columnas usadas:
- `id`
- `course_id`
- `title`
- `type`
- `status`
- `due_date`
- `points`
- `grade`
- `created_at`

Estado:
- Compatible.

### `student_profiles`

Usada desde:
- [studentProgress.js](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/lib/studentProgress.js)

Columnas usadas:
- `id`
- `email`
- `full_name`
- `avatar_url`
- `provider`
- `last_login_at`
- `created_at`
- `updated_at`

Estado:
- Compatible.

### `student_lesson_progress`

Usada desde:
- [studentProgress.js](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/lib/studentProgress.js)

Columnas usadas:
- `id`
- `user_id`
- `lesson_id`
- `status`
- `progress`
- `score`
- `started_at`
- `completed_at`
- `last_opened_at`
- `created_at`
- `updated_at`

Estado:
- Compatible.

### `student_quiz_attempts`

Usada desde:
- [studentProgress.js](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/lib/studentProgress.js)
- [useLessonQuiz.js](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/hooks/useLessonQuiz.js)

Columnas usadas directamente:
- `id`
- `user_id`
- `lesson_id`
- `score`
- `answers`
- `created_at`

Columnas ya preparadas en analitica pero aun no cableadas:
- `session_id`
- `started_at`
- `finished_at`
- `duration_ms`
- `analytics_version`
- `attempt_number`
- `lesson_version`
- `metadata`

Estado:
- Compatible.
- La app guarda el intento agregado, pero no inserta aun eventos por pregunta.

### `student_mission_progress`

Usada desde:
- [studentProgress.js](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/lib/studentProgress.js)

Columnas usadas:
- `id`
- `user_id`
- `lesson_id`
- `mission_id`
- `status`
- `score`
- `completed_at`
- `created_at`
- `updated_at`

Estado:
- Compatible.

### `student_flashcards`

Usada desde:
- [LessonFlashcardsBlock.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/components/lesson/blocks/LessonFlashcardsBlock.jsx)

Columnas usadas:
- `id`
- `user_id`
- `lesson_id`
- `card_id`
- `status`
- `updated_at`

Estado:
- Compatible.

### `user_progress`

Usada desde:
- [Progress.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/pages/Progress.jsx)

Columnas usadas:
- `user_id`
- `overall_progress`
- `streak_days`
- `total_hours`
- `lessons_completed`
- `updated_at`

Estado:
- Compatible.

### `achievements`

Usada desde:
- [Progress.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/pages/Progress.jsx)

Columnas usadas:
- `id`
- `user_id`
- `name`
- `description`
- `icon`
- `unlocked`
- `unlocked_at`
- `created_at`

Estado:
- Compatible.

## Tablas analiticas definidas pero todavia no cableadas del todo

- `student_learning_sessions`
- `student_content_events`
- `student_quiz_question_events`
- `student_flashcard_events`
- `student_mission_attempts`
- `student_concept_mastery`

## Hallazgos importantes

- La consistencia operativa actual es buena.
- El mayor pendiente ya no es de esquema basico, sino de instrumentacion analitica desde el frontend.
- `updated_at` se actualiza manualmente en varios lugares del frontend; conviene delegarlo a triggers.
- Faltan algunos indices secundarios utiles para paneles, joins de cursos y progreso por estudiante.

## Recomendacion inmediata

Ejecutar [supabase-operational-hardening.sql](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/db/supabase-operational-hardening.sql) antes de conectar la telemetria analitica fina.
