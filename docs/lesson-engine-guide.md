# Lesson Engine Guide

## Objetivo

El `lesson engine` debe permitir crear nuevas lecciones sin tocar la logica central de [Lesson.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/pages/Lesson.jsx), manteniendo bloques declarativos, analitica consistente y carga escalable por archivo.

## Estado actual

### Flujo principal

- [Lesson.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/pages/Lesson.jsx) carga la leccion desde el registro, resuelve contexto del curso y delega el render al engine.
- [normalizeLessonData](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/lib/lessonSchema.js) transforma el dato de leccion al contrato final por bloques.
- [LessonRenderer.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/components/lesson/LessonRenderer.jsx) recibe `blocks` y `context`, y despacha a bloques concretos.
- Los bloques actuales son:
  - [LessonContentBlock.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/components/lesson/blocks/LessonContentBlock.jsx)
  - [LessonFlashcardsBlock.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/components/lesson/blocks/LessonFlashcardsBlock.jsx)
  - [LessonMissionsBlock.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/components/lesson/blocks/LessonMissionsBlock.jsx)
  - [LessonQuizBlock.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/components/lesson/blocks/LessonQuizBlock.jsx)

### Carga y escalado

- El registro de lecciones en [coursesData.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/data/coursesData.jsx) ya usa `import()` por archivo.
- Eso permite que cada leccion se convierta en un chunk separado.
- El `build` actual confirma que `l1` a `l5` salen como chunks independientes.

## Contrato de una leccion nueva

Una leccion nueva debe:

1. Exportar `lessonData` con `defineLesson(...)`.
2. Declarar `blocksByTab`.
3. Usar ids estables por bloque.
4. Incluir metadatos analiticos en quiz: `id`, `concept`, `objective`, `difficulty`.
5. Mantener flashcards con `id` y `sectionId`.

Referencia base:

- [README.md](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/lessons/README.md)
- [lessonSchema.js](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/lib/lessonSchema.js)

## Regla de crecimiento

Para crecer a 100 cursos sin duplicar componentes:

- Nunca crear una pagina nueva por tipo de leccion.
- Nunca meter logica de negocio en el archivo de datos de la leccion.
- Mantener la variacion en `blocksByTab`, no en `Lesson.jsx`.
- Si aparece un nuevo tipo de experiencia, crear un bloque nuevo y registrarlo en [LessonRenderer.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/components/lesson/LessonRenderer.jsx).
- Si una experiencia requiere compatibilidad temporal, resolverla en adaptadores tipo schema/legacy bridge, no en la pagina principal.

## Puntos de extension recomendados

### Nuevo bloque

Crear un nuevo renderer cuando una experiencia:

- tenga UI propia reutilizable
- necesite persistencia o analitica propia
- aparezca en mas de una leccion

### Nueva analitica

Agregarla primero a:

- [learningAnalytics.js](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/lib/learningAnalytics.js)

Y luego consumirla desde el bloque responsable. Evitar llamadas directas a Supabase dentro de [Lesson.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/pages/Lesson.jsx).

## Checklist de calidad antes de agregar una leccion

- El archivo carga por `import()` desde el registro.
- La leccion usa `defineLesson(...)`.
- Cada tab usa bloques declarativos.
- El quiz incluye metadatos de concepto.
- No se agregan hooks globales a `window`.
- No se agrega `createRoot` manual.
- La leccion compila con `npm run build`.

## Validacion realizada

### Flujo funcional cubierto en repo

- contenido
- repaso
- misiones
- quiz
- sesiones de aprendizaje
- eventos por bloque
- mastery por concepto desde quiz

### Verificacion tecnica

- `npm.cmd run build`: OK
- `npm.cmd run lint`: con errores previos en areas ajenas al engine principal

## Riesgos actuales

- El bundle principal sigue grande (`index` supera el warning de Vite).
- Hay deuda de lint general en el repo que dificulta usar ESLint como gate estricto.
- El registro de cursos y el registro legacy de lecciones conviven en paralelo; a futuro conviene consolidarlos en una sola fuente.

## Siguiente etapa recomendada

1. Consolidar un solo registro de lecciones y cursos.
2. Extraer reportes/consultas analiticas al panel admin o docente.
3. Reducir el chunk principal con `manualChunks` o rutas/librerias lazy donde aplique.
4. Limpiar deuda de lint para convertir `lint + build` en puerta obligatoria de cambios.
