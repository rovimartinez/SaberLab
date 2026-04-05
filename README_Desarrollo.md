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

### 5. Misc
- Favicon con logo de SaberLab
- Badge de solicitudes pendientes en "Notificaciones" del sidebar
- Arreglado inicio de sesión para que abra "Gestión de Cursos" por defecto
- Creada columna updated_at en access_requests y profiles

---

## 🔴 Pendiente / Para continuar

### 1. VISIBILIDAD DE LECCIONES (PRIORIDAD)
**Problema actual:** En CourseDetail (admin), se puede configurar si una lección es visible o no, pero estos cambios solo se guardan en el estado local (React). Cuando un estudiante entra al curso, carga la definición original que no tiene esos cambios.

**Solución requerida:**
- Crear tabla en Supabase para guardar la configuración de visibilidad por curso
- Guardar cambios cuando se toggla visibilidad en CourseDetail
- Cargar configuración al inicio del curso en el componente del estudiante
- Aplicar filtros para mostrar/ocultar lecciones según configuración

### 2. Mejoras pendientes
- revisar si hay otros datos que se guardan localmente y deberían persistir
- verificar consistencia de datos entre admin y estudiante

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

## 🗄️ Tablas de Supabase usadas

- `profiles` - Perfiles de usuarios (incluye avatar_url)
- `access_requests` - Solicitudes de acceso
- `groups` - Grupos de cursos
- `enrollments` - Inscripciones de estudiantes
- `group_codes` - Códigos para unirse a grupos
- `courses` - Cursos (definidos localmente, no en BD)

---

## 🔧 Notas técnicas

- Los cursos están definidos localmente en `coursesData.jsx`, no en la BD
- Los estudiantes se asignan a grupos mediante enrollments (no user_groups)
- Los avatares de Google vienen de `user_metadata.avatar_url` en Supabase Auth
- RLS policies importantes: access_requests, profiles