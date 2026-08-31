# 🏆 Pregunta Rápida — "El Primero que Responde Gana"
> **Funcionalidad:** Sistema de preguntas en tiempo real donde el docente lanza una pregunta desde el monitor y el primer alumno que responde correctamente gana puntos extra en su perfil.  
> **Inspiración:** Kahoot!, Quizziz — integrado 100% en SaberLab sin dependencias externas.

---

## 🎯 Concepto General

```
DOCENTE                          ESTUDIANTES (conectados)
────────                         ──────────────────────────
1. Abre OnlineStudentsMonitor    
2. Crea una "Pregunta Rápida"    
3. Define opciones A/B/C/D       
4. Define puntos extra (5–50)    
5. Lanza la pregunta ──────────► Aparece popup con barra de tiempo
                                 ├── Estudiante 1 → responde A
                                 ├── Estudiante 2 → responde C  ← PRIMERO CORRECTO 🏆
                                 └── Estudiante 3 → responde C

6. Backend detecta 1er correcto  (timestamp del servidor, no del cliente)
7. Asigna puntos extra ─────────► 🎉 Celebración en pantalla del ganador
8. Muestra podio 🥇🥈🥉 en monitor
```

---

## 🗃️ Base de Datos — Nuevas Tablas D1

```sql
-- Pregunta lanzada por el docente
CREATE TABLE IF NOT EXISTS preguntas_rapidas (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  docente_id    TEXT NOT NULL,
  course_id     TEXT,                -- null = todos los cursos
  pregunta      TEXT NOT NULL,
  opciones      TEXT NOT NULL,       -- JSON: [{"letra":"A","texto":"..."},...]
  respuesta     TEXT NOT NULL,       -- "A", "B", "C" o "D"
  puntos        INTEGER DEFAULT 10,
  estado        TEXT DEFAULT 'activa', -- 'activa' | 'cerrada' | 'expirada'
  duracion_seg  INTEGER DEFAULT 30,
  created_at    TEXT DEFAULT (datetime('now')),
  cerrada_at    TEXT
);

-- Respuestas de los estudiantes
CREATE TABLE IF NOT EXISTS respuestas_rapidas (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  pregunta_id    INTEGER NOT NULL,
  user_id        TEXT NOT NULL,
  respuesta      TEXT NOT NULL,
  es_correcta    INTEGER DEFAULT 0,
  es_primero     INTEGER DEFAULT 0,  -- 1 = primer correcto = GANADOR
  puntos_ganados INTEGER DEFAULT 0,
  respondido_at  TEXT DEFAULT (datetime('now'))
);
```

---

## 🔌 Endpoints API

| Método | Ruta | Quién | Descripción |
|--------|------|-------|-------------|
| `POST` | `/api/quick-question` | Docente | Crea y lanza pregunta activa |
| `GET`  | `/api/quick-question/active` | Estudiante | Consulta si hay pregunta activa |
| `POST` | `/api/quick-question/answer` | Estudiante | Envía respuesta (timestamp servidor) |
| `GET`  | `/api/quick-question/[id]/results` | Docente | Resultados y podio |
| `POST` | `/api/quick-question/[id]/close` | Docente | Cierra pregunta manualmente |

---

## 🖥️ Componentes Frontend

### Para el Docente: `QuickQuestionLauncher.jsx`
- Botón "⚡ Pregunta Rápida" en `OnlineStudentsMonitor.jsx`
- Modal con: textarea pregunta, 4 opciones A-D, radio de correcta, slider pts, slider tiempo
- Vista de resultados en vivo con podio animado 🥇🥈🥉

### Para el Estudiante: `QuickQuestionPopup.jsx`
Activado via `useStudentPresence` con nueva propiedad `pendingQuestion` (latencia ≤ 6s).

**Fases:**
1. **Anuncio:** "⚡ ¡Pregunta Rápida en camino! 🏆 +15 pts al primero"
2. **Pregunta activa:** Barra de tiempo decreciente + 4 botones A/B/C/D
3. **Resultado:**
   - 🎉 ¡GANADOR! → confetti + sonido + puntos sumados
   - ✅ Correcto pero tarde → mensaje motivador
   - ❌ Incorrecto → muestra la respuesta correcta

---

## 🔄 Integración con el Sistema de Presencia (ya existente)

Modificar `GET /api/presence` (heartbeat) para incluir `active_question` en la respuesta:
```js
const activeQ = await env.DB.prepare(`
  SELECT id, pregunta, opciones, puntos, duracion_seg, created_at
  FROM preguntas_rapidas
  WHERE estado = 'activa'
    AND datetime(created_at, '+' || duracion_seg || ' seconds') > datetime('now')
  LIMIT 1
`).first();
// Agregar al response: active_question: activeQ || null
```

---

## 📁 Archivos a Crear / Modificar

### ✨ Nuevos
```
functions/api/quick-question.js
functions/api/quick-question/active.js
functions/api/quick-question/answer.js
functions/api/quick-question/[id]/results.js
functions/api/quick-question/[id]/close.js
src/components/admin/QuickQuestionLauncher.jsx
src/components/modals/QuickQuestionPopup.jsx
src/styles/QuickQuestion.css
```

### ✏️ Modificar
```
functions/api/presence.js                    ← incluir active_question
src/hooks/useStudentPresence.js              ← exponer pendingQuestion
src/App.jsx                                  ← montar <QuickQuestionPopup>
src/components/admin/OnlineStudentsMonitor.jsx ← botón lanzador
```

---

## ❓ Decisiones Pendientes (definir antes de implementar)

- [ ] ¿Solo el 1er lugar gana puntos o también 2do / 3er?
- [ ] ¿La pregunta va a todos los conectados o solo al curso seleccionado?
- [ ] ¿Se revela el nombre del ganador a toda la clase?
- [ ] ¿Los puntos van al puntaje del módulo o a un ranking global separado?
- [ ] ¿Se puede encadenar rondas (modo torneo)?

---

> **Estado:** 📋 PLANIFICADO  
> **Fecha:** 2026-08-30  
> **Tiempo estimado de implementación:** ~2.5 horas  
> **Orden:** APIs → Hook de presencia → Launcher → Popup → CSS → Pruebas
