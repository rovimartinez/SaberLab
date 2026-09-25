# Project Memory & Context Continuity

## 1. Project Metadata

| Attribute | Value |
| :--- | :--- |
| **Last Updated** | 2026-09-24 |
| **Current Phase** | Fase 3 (Proyecto Integrador Ajedrez 3D en M2) & Fase 4 (SIMI3D / WhatsApp) |
| **Overall Progress** | ~78% del Roadmap Integral |
| **Project Status** | Active & Clean Build (0 errors en `npm run build`) |

---

## 2. Current Status
- **Curso 3D (`MA`):** M1 completado con L1 a L4 (Peón, Torre y Alfil en `ChessPieceLab.jsx`). En preparación para M2 (Rey, Reina, Caballo y Tablero).
- **Semillero SIMI3D (`SIMI`):** Hub interactivo con 8 rutas no lineales, sidebar propio, gestor de asistencia docente y modal flash de registro estudiantil por PIN y geocerca.
- **Motor de IA & Tutores:** Resuelto bug de modelos de razonamiento en Groq (`openai/gpt-oss-120b`, `20b`, `qwen3.8-27b`) con ajuste de `reasoning_effort: low` y `max_completion_tokens`. Respuestas 100% dinámicas y precisas para los 4 bots.
- **Plataforma y Seguridad:** Lobby de exámenes en vivo con strikes anti-fraude, liberación de notas por docente y tokens semánticos puros sin `!important`.
- **Compilación:** `npm run build` verificado con código de salida 0.

---

## 3. Completed Tasks (Hitos Recientes)

| # | Tarea | Completada | Notas |
| :--- | :--- | :--- | :--- |
| 1 | Lección 3 y 4 de 3D (`ma-m1-l3`, `ma-m1-l4`) | 2026-09-23 | Modelado Peón, Torre y Alfil con laboratorio WebGL `ChessPieceLab.jsx`. |
| 2 | Corrección TDZ en `EvaluationPlayer.jsx` | 2026-09-23 | Resuelto `ReferenceError` al renderizar resultados y exámenes con reintentos. |
| 3 | Bloqueo de módulos para estudiantes | 2026-09-23 | Recompensas, Widgets y Analítica restringidos a docentes/staff con `<AdminRoute>`. |
| 4 | Asistencia Flash y Geocercas SIMI3D | 2026-09-22 | Integración de PIN dinámico de 4 dígitos y verificación de radio geográfico. |
| 5 | Refactorización de tokens semánticos | 2026-09-21 | Limpieza de 25+ archivos CSS eliminando sobrescrituras manuales `!important`. |

---

## 4. In Progress Tasks

| # | Tarea | Iniciada | Objetivo / Notas |
| :--- | :--- | :--- | :--- |
| 3.6 | Lección 6 (`ma-m2-l6`): Rey y Reina 3D | 2026-09-24 | Modificadores Mirror, Subsurf y Array en `ChessPieceLab.jsx`. |
| 4.3 | Notificaciones WhatsApp (`notify.js`) | 2026-09-24 | Conexión serverless con UltraMsg / Evolution API para avisos grupales. |

---

## 5. Next Steps
1. **Construir `ma-m2-l6` (Rey y Reina 3D):**
   - Implementar la teoría de modificadores simétricos y subdivisiones en el viewport Three.js.
2. **Implementar Notificaciones WhatsApp:**
   - Crear endpoint `/functions/api/notify.js` con soporte para convocatorias de campo, nuevos proyectos e insignias.
3. **Auditoría de Rutas y Páginas Obsoletas:**
   - Depurar vistas legacy reemplazadas por modales en el Dashboard.
4. **Verificación Continua:**
   - Mantener siempre 0 errores en `npm run build` y consultar `.agents/skills/` antes de cada modificación.
