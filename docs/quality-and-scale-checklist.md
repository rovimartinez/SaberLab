# Quality And Scale Checklist

## Validacion del flujo completo

Estado revisado sobre el engine actual:

- contenido: conectado y con eventos en `student_content_events`
- repaso: conectado y con eventos en `student_flashcard_events`
- misiones: conectado y con intentos en `student_mission_attempts`
- quiz: conectado y con eventos en `student_quiz_question_events`
- mastery: actualizado en `student_concept_mastery`

## Comandos ejecutados

### Build

Comando:

```powershell
npm.cmd run build
```

Resultado:

- compilacion exitosa
- chunks de lecciones separados (`l1` a `l5`)
- advertencia de Vite por chunk principal grande

### Lint

Comando:

```powershell
npm.cmd run lint
```

Resultado:

- no pasa todavia
- aparecen errores previos y distribuidos fuera del bloque central del lesson engine

## Hallazgos de rendimiento

- La carga de lecciones ya esta preparada para escalar porque usa `import()` por archivo.
- El mayor riesgo actual no es cada leccion individual, sino el chunk principal de la aplicacion.
- El contenido HTML largo puede crecer sin romper arquitectura, pero conviene mantener bloques compactos y no meter widgets pesados dentro del HTML crudo.

## Recomendaciones de rendimiento

- Mantener un archivo por leccion.
- Mantener simuladores complejos como componentes aparte, no embebidos dentro del dato.
- Evaluar `manualChunks` en Vite para separar mejor panel, widgets y simuladores.
- Evitar que [Lesson.jsx](/c:/Users/Elizabeth/.gemini/antigravity/scratch/school-platform/src/pages/Lesson.jsx) recupere responsabilidades de render o persistencia.

## Estrategia para 100 cursos

- Una sola pagina de leccion.
- Un solo schema de datos.
- Un solo renderer por tipo de bloque.
- Registro declarativo por curso/modulo/leccion.
- Analitica unificada desde helpers compartidos.

## Deuda visible antes de endurecer gates

- errores de lint en widgets y paginas no relacionadas
- warning de tamaño de chunk principal
- coexistencia de dos registros de lecciones (`coursesData.jsx` y `src/lessons/index.js`)

## Siguiente paso de escalabilidad

- consolidar un registro unico
- definir `manualChunks`
- agregar smoke tests del flujo de leccion si luego el proyecto incorpora Vitest o Playwright
