# Lesson Schema V2

Las lecciones nuevas deben exportar `lessonData` usando `defineLesson(...)` desde [lessonSchema.js](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/lib/lessonSchema.js).

## Estructura base

```js
import {
  createContentBlock,
  createFlashcardsBlock,
  createMissionsBlock,
  createQuizBlock,
  defineLesson
} from '../lib/lessonSchema';

export const lessonData = defineLesson({
  title: 'Titulo de la leccion',
  blocksByTab: {
    contenido: [
      createContentBlock({
        id: 'curso-modulo-leccion-content',
        content: '<h3>Contenido HTML</h3>',
        challenges: []
      })
    ],
    repaso: [
      createFlashcardsBlock({
        id: 'curso-modulo-leccion-review',
        flashcards: []
      })
    ],
    simulador: [
      createMissionsBlock({
        id: 'curso-modulo-leccion-missions',
        missions: []
      })
    ],
    prueba: [
      createQuizBlock({
        id: 'curso-modulo-leccion-quiz',
        title: 'Quiz final',
        questions: [],
        quizConfig: {
          timePerQuestion: 45,
          requiredScorePercent: 80
        }
      })
    ]
  }
});
```

## Convenciones

- `contenido` usa un bloque `content`.
- `repaso` usa un bloque `flashcards`.
- `simulador` usa un bloque `missions`.
- `prueba` usa un bloque `quiz`.
- Cada pregunta de quiz nueva debe incluir `id`, `objective`, `concept` y `difficulty` cuando aplique.
- Las flashcards deben incluir `id`, `q`, `a`, `sub` y `sectionId`.
- Los retos manuales van dentro del bloque de contenido en `challenges`.

## Compatibilidad

- `defineLesson` sigue exponiendo campos legacy (`content`, `flashcards`, `questions`, `quizConfig`, `challenges`) para no romper componentes viejos.
- `Lesson.jsx` y `normalizeLessonData(...)` priorizan `blocksByTab` cuando existe.
- Las misiones legacy externas todavia pueden inyectarse desde el engine mientras se migra el resto del curso.

## Guias relacionadas

- Guia tecnica del engine: [lesson-engine-guide.md](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/docs/lesson-engine-guide.md)
- Checklist de calidad y escalabilidad: [quality-and-scale-checklist.md](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/docs/quality-and-scale-checklist.md)
