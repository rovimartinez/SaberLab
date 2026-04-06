# SaberLab - Estado del Proyecto

## ✅ ÚLTIMO: HOY (05-abr-2026)
- Sistema de evaluaciones migrado a JSON en tabla `evaluaciones`
- Nuevo Editor Visual para preguntas
- Importación con validación y previsualización
- Tabla `evaluacion_preguntas` eliminada (ya no se usa)
- **CSS centralizado** - Todos los archivos movidos a `src/styles/`
- **Nombres de componentes corregidos** - exports ahora coinciden con nombres de funciones
- **Sidebar mostrando Display Name** - Usa `userMetadata.name` (nombre de Google)
- **Corregido error "Cargando" al cambiar pestañas** - Error en BD: columna `first_name` no existía

---

## 🔴 PENDIENTES (Prioridad)

### Alta
1. **Completar lección** - Lesson.jsx solo hace console.log, necesita guardar en BD
2. **Verificar que visibilidad funcione** - Test completo admin → estudiante

### Media  
3. Migrar cursos a BD cuando sean 100+
4. Probar sistema de evaluaciones completo (estudiante presenta examen)

### Baja
5. Tablas pendientes sin uso (student_lesson_progress, etc.)

---

## 📋 HISTORIAL RECIENTE

### Hoy - CSS centralizado y corrección de errores
- Todos los archivos CSS movidos a `src/styles/`:
  - CourseDetail.css, SubjectDetail.css, Login.css, Landing.css, Lesson.css, Settings.css, Layout.css, CourseSidebar.css, PizarraMagica.css, ArduinoIDE.css
- Imports actualizados en todos los archivos JSX
- Build verificado ✅

### Hoy - Nombres de componentes corregidos
- `Dashboard` → `PanelInicio` (función y export)
- `Courses` → `PanelMisCursos`
- `Notifications` → `PanelNotificaciones`
- `Evaluations` → `PanelEvaluaciones`
- `Progress` → `PanelProgreso`
- `Resources` → `PanelRecursos`
- `Admin` → `PanelPlataforma`
- `EvaluationAdmin` → `PanelExamenes`
- `EvaNoti` → `EvaluationInstruction`
- `EvaExam` → `EvaluationPlayer`

### Hoy - Sidebar，显示正确的用户名
- Ahora usa `userMetadata.name` (Display Name de Google)
- Fallback a `userMetadata.full_name`
- Muestra `first_name` + `last_name` desde tabla `perfiles` si están disponibles

### Ayer - Renombrar archivos del panel (Panel-*)
- Dashboard.jsx → PanelInicio.jsx
- Courses.jsx → PanelMisCursos.jsx
- Notifications.jsx → PanelNotificaciones.jsx
- Evaluations.jsx → PanelEvaluaciones.jsx
- Progress.jsx → PanelProgreso.jsx
- Resources.jsx → PanelRecursos.jsx
- Widgets.jsx → PanelWidgets.jsx
- PanelEvaluation.jsx → PanelGestion.jsx
- Admin.jsx → PanelPlataforma.jsx
- EvaluationAdmin.jsx → PanelExamenes.jsx

### Ayer
- Evaluaciones: preguntas ahora en JSON (`evaluaciones.questions`)
- Editor Visual para editar todas las preguntas
- Importación con validación (enunciado, respuesta, V/F correcto)
- Previsualización antes de importar
- Botones "Importar" y "Cancelar" del mismo tamaño

---

## 🔧 ESTADO ACTUAL

| Componente | Estado |
|------------|--------|
| Admin | ✅ Funcionando |
| Cursos (definición) | 📝 En código |
| Visibilidad lecciones | ✅ JSON en BD |
| Insripciones | ✅ BD |
| Grupos | ✅ BD |
| Evaluaciones | ✅ JSON en BD |
| Progreso estudiante | ⚠️ Solo console.log |

---

## 📝 NOTAS

- Preguntas guardadas en `evaluaciones.questions` (JSON array)
- Tabla `evaluacion_preguntas` ya no se usa
- Tipos de pregunta: opcion_multiple, verdadero_falso, emparejar, ordenar, escribir
- Import valida: enunciado, respuesta correcta, opciones V/F, mínimo 2 opciones
- Los tipos de preguntas se normalizan a letras (A, B, C) o texto (Verdadero/Falso)
- Archivos renombrados con prefijo "Panel" para identificar secciones del menú
- CSS centralizado en `src/styles/`
- Sidebar muestra `userMetadata.name` (Display Name de Google)