# REPO MAP — SaberLab (school-platform)

Mapa de repositorio. Antes de leer/editar código, consulta aquí para ubicar archivos. Mantener actualizado al crear/renombrar/eliminar símbolos o archivos.

## Stack
React 19 + Vite 7 + React Router 7 · Supabase (JS client) · Firebase · lucide-react · canvas-confetti · xlsx. Lint: `npm run lint` · Build: `npm run build`.

---

## Árbol de directorios (src/)

```
src/
├── main.jsx                  # Entry point (StrictMode + App)
├── App.jsx                   # Rutas y guards (Protected/Admin/Public)
├── data/coursesData.jsx      # Catálogo estático de cursos + LESSONS_REGISTRY
├── pages/                    # Páginas/paneles (ver índice abajo)
├── components/
│   ├── layout/               # Layout, Sidebar, Topbar, AdminAccessRequestsBubble
│   ├── course/               # CourseSidebar
│   ├── lesson/               # LessonRenderer + blocks (Content/Quiz/Flashcards/Missions) + modals + legacy
│   ├── simulators/RE/        # Simuladores Arduino (MisionLeccion, MisionRoadMap, ArduinoSimulatorV2, Blink, LedSimulator)
│   ├── widgets/              # Apps flotantes (PizarraMagica, ArduinoIDE.tsx, Calculadora, Reloj, etc.)
│   ├── CodeEditor.jsx        # Editor de código genérico
│   ├── QuestionPanel.jsx     # Panel de pregunta (evaluaciones)
│   └── QuestionNavigator.jsx # Navegador de preguntas
├── context/                  # AuthContext, AppsContext, WhiteboardContext + hooks useAuth/useApps/useWhiteboard
├── hooks/                    # useLessonQuiz, usePlatformSettings
├── lib/                      # supabase client, lessonSchema, learningAnalytics, studentProgress
├── lessons/                  # Contenido de lecciones (lazy). RE/m1: l1..l5 + l*.missions
├── evaluations/              # Evaluaciones por curso. RE/m1/module1Evaluation
└── styles/                   # CSS centralizado (un archivo por página/componente)
```

## Rutas de la App (src/App.jsx)

| Path | Elemento | Guard |
|------|----------|-------|
| `/` | Landing | PublicRoute |
| `/login` | Login | PublicRoute |
| `/request-access` | RequestAccess | — |
| `/dashboard` | Layout (anidado) | ProtectedRoute |
| `/dashboard` (index) | PanelInicio | — |
| `my-courses` | MyCourses | — |
| `courses` | PanelMisCursos | AdminRoute |
| `course/:id` | CourseDetail | — |
| `admin` | PanelPlataforma | AdminRoute |
| `admin-panel` | PanelGestion | AdminRoute |
| `requests` | AccessRequests | AdminRoute |
| `learn/*` | Redirección a my-courses | — |
| `my-courses/:id` | SubjectDetail | — |
| `my-courses/:courseId/:moduleId/:lessonId` | Lesson | — |
| `notifications` | PanelNotificaciones | — |
| `evaluations` | PanelEvaluaciones | — |
| `evaluations/:evaluationKey` | EvaluationInstruction | — |
| `evaluations/:evaluationKey/play` | EvaluationPlayer | — |
| `progress` | PanelProgreso | — |
| `resources` | PanelRecursos | — |
| `myapps` | PanelWidgets (→ redirige a /dashboard) | — |
| `settings` | SettingsPage | — |

## Contextos y hooks

- `src/context/AuthContext.jsx` — `AuthContext`, `AuthProvider({children})`. Provee user, userMetadata, role, signIn/Out, loading.
- `src/context/useAuth.js` — `useAuth()`
- `src/context/AppsContext.jsx` — `AppsContext`, `AppsProvider({children})`. Estado de gadgets/widgets.
- `src/context/useApps.js` — `useApps()`
- `src/context/WhiteboardContext.jsx` — `WhiteboardContext`, `WhiteboardProvider` (pizarra).
- `src/context/useWhiteboard.js` — `useWhiteboard()`
- `src/hooks/useLessonQuiz.js` — `useLessonQuiz({...})` lógica de quizzes de lección.
- `src/hooks/usePlatformSettings.js` — `usePlatformSettings()` ajustes de plataforma.

## Libs (src/lib/)

- `supabase.js` — `supabase` (cliente).
- `lessonSchema.js` — `createContentBlock`, `createFlashcardsBlock`, `createQuizBlock`, `createMissionsBlock`, `defineLesson`, `normalizeLessonData`.
- `learningAnalytics.js` — `createLearningSession`, `completeLearningSession`, `saveQuizQuestionEvents`, `saveEvaluationProctoringEvent`, `saveFlashcardEvent`, `saveContentEvent`, `createMissionAttempt`, `updateMissionAttempt`, `upsertConceptMasteryFromQuizResponses`.
- `studentProgress.js` — `ensureStudentProfile`, `fetchLessonProgress`, `upsertLessonProgress`, `saveQuizAttempt`, `fetchMissionProgress`, `upsertMissionProgress`.

## Datos de cursos y lecciones

- `src/data/coursesData.jsx` — `LESSONS_REGISTRY`, `COURSES_DEFINITION`, `getLessonInfo(id)`, `getFullLessonPath(fullId)`, `getLessonContent(id)`, `getCourseBySlug`, `getCourseByAbbr`, `getCourseById`, `getCourseByIdentifier`.
- `src/lessons/index.js` — `LESSONS_MAP` (curso→módulos→lecciones lazy), `getLessonData(courseAbbr, moduleId, lessonId)`. Solo RE/m1 tiene lecciones (l1..l5). Curso 5 = RE.
- `src/lessons/RE/m1/l{1..5}.jsx` — cada una exporta `lessonData = defineLesson({...})`.
- `src/lessons/RE/m1/l{1..4}.missions.jsx` — `l{n}Missions` arrays de misiones.
- `src/evaluations/index.js` — `EVALUATIONS_MAP`, `getEvaluationData(courseAbbr, moduleId, evaluationId)`.
- `src/evaluations/RE/m1/module1Evaluation.js` — `module1EvaluationData = defineLesson({...})`.

## Páginas (src/pages/)

| Archivo | Export default | Responsabilidad |
|---------|---------------|-----------------|
| Landing.jsx | Landing | Portada pública |
| Login.jsx | Login | Login Google + local |
| RequestAccess.jsx | RequestAccess | Solicitud de acceso |
| MyCourses.jsx | MyCourses | Lista de cursos del estudiante |
| SubjectDetail.jsx | SubjectDetail | Detalle de materia (módulos/lecciones) |
| Lesson.jsx | Lesson | Reproductor de lección (⚠️ completar solo hace console.log) |
| CourseDetail.jsx | CourseDetail({courses,setCourses,embeddedCourse,showHeader}) | Detalle de curso admin |
| PanelInicio.jsx | PanelInicio | Dashboard |
| PanelMisCursos.jsx | PanelMisCursos({courses,showHeader,embedded,onCourseSelect}) | Gestión de cursos |
| PanelPlataforma.jsx | PanelPlataforma({showHeader,showTabs,section}) | Admin general |
| PanelGestion.jsx | PanelGestion | Admin gestión |
| PanelNotificaciones.jsx | PanelNotificaciones | Notificaciones |
| PanelEvaluaciones.jsx | PanelEvaluaciones | Lista evaluaciones |
| PanelExamenes.jsx | PanelExamenes | Editor de exámenes (admin) |
| PanelProgreso.jsx | PanelProgreso | Progreso estudiante |
| PanelRecursos.jsx | PanelRecursos | Recursos |
| PanelWidgets.jsx | PanelWidgets (redirect) + `gadgetsCatalog`, `WidgetsOverlay` | Lanzador de apps |
| EvaluationInstruction.jsx | EvaluationInstruction | Instrucciones de examen |
| EvaluationPlayer.jsx | EvaluationPlayer | Presentación de examen (⚠️ bugs pendientes) |
| AccessRequests.jsx | AccessRequests | Aprobación solicitudes |
| Settings.jsx | SettingsPage | Configuración |

## Componentes clave (src/components/)

- `layout/Layout.jsx` → `Layout` (wrap del dashboard con Sidebar/Topbar).
- `layout/Sidebar.jsx` → `Sidebar({isOpen,closeSidebar,toggleSidebar})`.
- `layout/Topbar.jsx` → `Topbar`.
- `layout/AdminAccessRequestsBubble.jsx` → `AdminAccessRequestsBubble`.
- `course/CourseSidebar.jsx` → `CourseSidebar({subject,currentLessonId,isOpen,toggleSidebar,lessonVisibility})`.
- `lesson/LessonRenderer.jsx` → `LessonRenderer({blocks,renderers,context})`.
- `lesson/blocks/LessonContentBlock.jsx` → `LessonContentBlock` (+ `MiniChallengeSimulator`).
- `lesson/blocks/LessonQuizBlock.jsx` → `LessonQuizBlock({block,user,lessonKey,moduleId,lessonId,subject,onBackToContent})`.
- `lesson/blocks/LessonFlashcardsBlock.jsx` → `LessonFlashcardsBlock({block,user,lessonKey,subject})`.
- `lesson/blocks/LessonMissionsBlock.jsx` → `LessonMissionsBlock({block,lessonKey})`.
- `lesson/modals/GuideModal.jsx` → `GuideModal({open,onClose})`.
- `lesson/modals/ArduinoPartsModal.jsx` → `ArduinoPartsModal({open,onClose})`.
- `lesson/legacy/LessonLegacyBridge.jsx` → `LessonLegacyBridge({hasSimulator,onShowGuide,onShowArduinoParts})`.
- `simulators/RE/MisionLeccion.jsx` → `ArduinoExercisesSimulator({challengesData,initialChallengeId,lessonKey,onClose})`.
- `simulators/RE/MisionRoadMap.jsx` → `MisionRoadMap({missions,lessonKey})`.
- `simulators/RE/ArduinoSimulatorV2.jsx` → `ArduinoSimulatorV2`.
- `simulators/RE/Blink.jsx` → `App` (demo Blink).
- `simulators/RE/LedSimulator.jsx` → `LedSimulator`.
- `widgets/PizarraMagica.jsx` → `PizarraMagica({onClose})` + `RenderShapeSVG`.
- `widgets/ArduinoIDE.tsx` → `ArduinoIDE` (TS).
- `widgets/` otros: `Calculadora`, `Conversor`, `LeyDeOhm`, `Reloj`, `Ruleta`, `Semaforo`.
- `CodeEditor.jsx` → `CodeEditor({onRun,compact,initialCode,showOutput})`.
- `QuestionPanel.jsx` → `QuestionPanel` (render de una pregunta en examen).
- `QuestionNavigator.jsx` → `QuestionNavigator` (navegación entre preguntas).

## BD (db/)

Scripts SQL por lotes. Destacan:
- `supabase-setup.sql`, `supabase-evaluations-schema.sql` / `-seed.sql`, `supabase-learning-analytics.sql`, `supabase-lesson-visibility.sql`, `supabase-evaluation-proctoring.sql`, `supabase-operational-hardening.sql`, `supabase-analytics-views.sql`.
- Migraciones/renombres: `rename-tables-to-spanish.sql`, `migrate-courses.sql`, `migrate-modules-lessons.sql`, `visibilidad-json.sql`, `create-intentos-evaluacion.sql`.
- Fixes por tabla: `fix-evaluaciones-*.sql`, `fix-visibilidad*.sql`, `fix-perfiles-names.sql`, `fix-rls-solicitudes.sql`, `fix-progreso-unique.sql`, `fix-tables-progress.sql`.
- Tablas relevantes: `evaluaciones` (preguntas en JSON `questions`), `perfiles`, `inscripciones`, `grupos`, `student_lesson_progress`, `intentos_evaluacion`. Tabla `evaluacion_preguntas` ELIMINADA.

## Docs (docs/, *.md)

- `docs/lesson-engine-guide.md` — guía del motor de lecciones (bloques).
- `docs/quality-and-scale-checklist.md` — checklist calidad/escala.
- `db/frontend-schema-audit.md`, `db/analytics-notes.md`, `db/README.md` — auditoría esquema y analítica.
- `README_Desarrollo.md`, `continuacion.md`, `TAREAS.md` — notas de desarrollo y tareas.
