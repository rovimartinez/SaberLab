# SaberLab - Registro de Desarrollo

## ✅ Lo que hemos hecho

### 1. Admin Panel - Gestión de Cursos
- Creación de AdminPanel.jsx con 3 tarjetas (Gestión de Cursos, Plataforma, Exámenes)
- Cursos embebidos en AdminPanel (sin navegación)
- Conteo de grupos desde Supabase
- Conteo de estudiantes por grupo desde enrollments (no user_groups)
- Modal para ver estudiantes con foto de Google (avatar_url)

### 2. Student Registration & Profiles
- Solución de RLS en access_requests para permitir que usuarios lean sus propias solicitudes
- Solución de RLS en profiles para permitir lectura/update
- Guardado de avatar_url de Google al crear perfil
- Actualización de avatar si el perfil existe pero no tiene foto

### 3. MyCourses - Diseño Responsive
- PC: 3 columnas con diseño completo (nombre, lecciones, progreso, icono fondo, footer con "Continuar")
- Móvil: Tarjetas compactas, nombre grande, iconos grandes, footer con sombra pegado abajo

### 4. CourseDetail - Modal de Estudiantes
- Muestra estudiantes del grupo desde tabla enrollments
- Foto de Google si está disponible (avatar_url)
- Sin divisores en el modal

### 5. Visibilidad de Lecciones (JSON)
- Tabla `visibilidad_curso` con estructura JSON: una fila por curso con objeto de lecciones
- Ejemplo: `{"re-m1-l1": false, "re-m1-l2": true}`
- CourseDetail guarda/leer visibilidad con IDs normalizados (re-m1-l1)
- AuthContext carga visibilidad al iniciar sesión
- SubjectDetail filtra lecciones: muestra todas con ícono de candado si están ocultas
- Table old `visibilidad_leccion_curso` ya no se usa

### 6. Rename tablas a Español
- Todas las tablas principales renombradas a español
- Código actualizado para usar nombres en español
- Tablas: perfiles, solicitudes_acceso, notificaciones, cursos, grupos, codigos_grupo, inscripciones, evaluaciones, visibilidad_curso, grupos_usuario, progreso_usuario, logros, tarjetas_estudiante

### 7. Tabla cursos en BD
- Creada tabla `cursos` en BD para futura gestión (actualmente vacía/referencia)
- Los cursos siguen definidos en código (`coursesData.jsx`)
- Cuando haya 100+ cursos, migrar a BD para gestión desde admin

---

## 🔴 Pendiente / Para continuar

### 1. Migrar cursos a BD (futuro)
- Con 100+ cursos, conviene mover definición de cursos a BD
- Actualmente definidos en `coursesData.jsx`
- Crear tabla `cursos` con estructura completa (módulos, lecciones)

### 2. Completar lección
- Al presionar "Marcar como completada" en Lesson.jsx, solo hace console.log
- Necesita guardar en Supabase (tabla `progreso_usuario` o nueva tabla)

### 3. Revisar datos locales
- Revisar si hay otros datos que se guardan localmente y deberían persistir
- Verificar consistencia de datos entre admin y estudiante

---

## 📁 Archivos relevantes

- `src/pages/AdminPanel.jsx` - Panel de admin
- `src/pages/Courses.jsx` - Lista de cursos
- `src/pages/CourseDetail.jsx` - Detalle de curso (gestión de grupos y contenidos)
- `src/pages/MyCourses.jsx` - Cursos del estudiante
- `src/context/AuthContext.jsx` - Autenticación y carga de cursos
- `src/data/coursesData.jsx` - Definición local de cursos
- `src/pages/Courses.css` - Estilos responsive

---

## 🗄️ Tablas de Supabase usadas (ESPAÑOL)

- `perfiles` - Perfiles de usuarios (incluye avatar_url)
- `solicitudes_acceso` - Solicitudes de acceso
- `notificaciones` - Notificaciones
- `cursos` - Cursos (actualmente vacío, cursos definidos en código)
- `grupos` - Grupos de cursos
- `codigos_grupo` - Códigos para unirse a grupos
- `inscripciones` - Inscripciones de estudiantes
- `evaluaciones` - Evaluaciones
- `visibilidad_curso` - Configuración de visibilidad de lecciones (JSON por curso)
- `grupos_usuario` - Relación usuario-grupo
- `progreso_usuario` - Progreso del estudiante
- `logros` - Logros
- `tarjetas_estudiante` - Flashcards del estudiante

## 🗄️ Tablas pendientes (sin uso aún)

- `student_profiles`
- `student_lesson_progress`
- `student_quiz_attempts`
- `student_mission_progress`
- Tablas analíticas

---

## 🔧 Notas técnicas

- Los cursos están definidos localmente en `coursesData.jsx`, no en la BD (por ahora)
- Los estudiantes se asignan a grupos mediante `inscripciones` (no grupos_usuario)
- Los avatares de Google vienen de `user_metadata.avatar_url` en Supabase Auth
- Visibilidad de lecciones se guarda en JSON dentro de `visibilidad_curso`
- Tablas principales en español (perfiles, solicitudes_acceso, etc.)
- Políticas RLS activas en todas las tablas