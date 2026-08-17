# SaberLab - Estado del Proyecto

## 🔎 Reglas de trabajo
- Antes de buscar o modificar código, leer primero [REPO_MAP.md](REPO_MAP.md) para localizar la ruta relevante.
- Si el cambio afecta el estado del proyecto, revisar también [ESTADO_PROYECTO.md](ESTADO_PROYECTO.md) y [TAREAS.md](TAREAS.md).

## ✅ ÚLTIMO: HOY (17-ago-2026)
- **Progreso de Lecciones en BD** - `Lesson.jsx` y `SubjectDetail.jsx` sincronizados con Cloudflare D1 en tiempo real.
- **Control de Visibilidad Blindado** - Docente oculta lecciones y se sincroniza en D1 (`visibilidad_curso`), bloqueando en `SubjectDetail.jsx`, `CourseSidebar.jsx` y ruta protegida en `Lesson.jsx`.
- **Evaluación y Examen Reparados Integralmente**:
  - Preguntas renderizan limpiamente desde JSON de D1 (`safeParseQuestions`, normalización de opciones y enunciados).
  - Contador de correctas e incorrectas corregido en `QuestionNavigator.jsx` y `EvaluationPlayer.jsx` (ya no marca máximo sin responder).
  - Temporizador persistente real basado en reloj de pared (`Date.now()`) inmune a throttling en cambio de pestañas o minimizado.
  - Edición completa de Nombre, Descripción, Instrucciones, Tiempo y Puntaje en `PanelExamenes.jsx`.
  - Auto-generación de `evaluation_key` única para cada evaluación creada.

---

## 🔴 PENDIENTES (Prioridad)

### Media
1. Migrar cursos a BD cuando sean 100+
2. Probar sistema de evaluaciones completo en vivo (estudiante presentando examen con varios tipos de preguntas)

### Baja
3. Tablas pendientes sin uso (student_lesson_progress, etc.)

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

### Hoy - Sidebar 显示正确的用户名
- Ahora usa `userMetadata.name` (Display Name de Google)
- Fallback a `userMetadata.full_name`
- Muestra `first_name` + `last_name` desde tabla `perfiles` si están disponibles

### Hoy - "Cargando" al cambiar pestañas
- Optimizado AuthContext para no mostrar loading en cada refresh de token
- Corregido error de columna inexistente en BD (`first_name`)

### Hoy - Examen (EvaluationPlayer)
- Intentado persistir tiempo en localStorage
- No funciona correctamente aún

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
| Evaluaciones | ⚠️ Con bugs (ver arriba) |
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
- Evaluación (examen) tiene bugs: preguntas no aparecen, contador incorrecto, tiempo no persiste