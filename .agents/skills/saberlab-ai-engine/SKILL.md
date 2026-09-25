---
name: saberlab-ai-engine
description: Arquitectura, pool de modelos Groq/Cloudflare AI, endpoints, guía de reparación y guardrails pedagógicos de los 4 tutores de SaberLab.
---

# SaberLab AI Engine & Tutors Architecture

Guía táctica, memoria técnica y **manual de diagnóstico y reparación** para los tutores inteligentes de **SaberLab** (ElectroBot, RoboBot, TridiBot e ImpriBot).

---

## 🚨 Guía de Reparación y Diagnóstico Rápido (Troubleshooting Runbook)

### Síntoma: "El bot siempre responde lo mismo o devuelve la misma tabla fija sin importar la pregunta"
Si un bot responde repetitivamente con la misma plantilla estática (por ejemplo, la tabla de temperaturas en ImpriBot o la Ley de Ohm en ElectroBot), significa que **la llamada a la IA falló silenciosamente y cayó en el modo de contingencia offline**.

Sigue estos 4 pasos para repararlo en menos de 2 minutos:

#### 1. Verificar la API Key de Groq en `.dev.vars` y en el Backend
- Abrir [`.dev.vars`](file:///c:/Users/Elizabeth/Desktop/SaberLab/.dev.vars) y revisar la línea:
  ```env
  GROQ_API_KEY=gsk_...
  ```
- Comprobar que la clave no esté revocada o caducada. Si se renueva la clave en la consola de Groq, actualizarla tanto en `.dev.vars` como en la constante `GROQ_DEFAULT_KEY` en [`functions/api/ai/chat.js`](file:///c:/Users/Elizabeth/Desktop/SaberLab/functions/api/ai/chat.js).

#### 2. Modelos Soportados y el Parámetro Crítico `reasoning_effort`
- Los modelos primarios en Groq son:
  - `openai/gpt-oss-120b` (Razonamiento profundo)
  - `openai/gpt-oss-20b` (Ultra veloz)
  - `qwen/qwen3.8-27b` (Pedagógico en español)
- ⚠️ **CRÍTICO PARA MODELOS `gpt-oss`:** Son modelos de razonamiento (como OpenAI o1). Si no se les envía `reasoning_effort: 'low'`, consumen todo el cupo de tokens pensando (`reasoning_tokens`) y devuelven `content: ""` vacío.
- **Configuración requerida en el payload:**
  ```javascript
  {
    model: 'openai/gpt-oss-120b',
    messages: fullMessages,
    reasoning_effort: 'low',       // OBLIGATORIO: Evita que agote los tokens en razonamiento interno
    max_completion_tokens: 1500,  // OBLIGATORIO: Espacio suficiente para pensamiento + respuesta
    max_tokens: 1500
  }
  ```

#### 3. Recompilar el Backend Serverless (`dev:build`)
- Cloudflare Pages Functions se empaqueta en `.wrangler/dist/index.js`. Si se edita `functions/api/ai/chat.js`, **es obligatorio reconstruir el dist**:
  ```bash
  npm run dev:build
  ```

#### 4. Reiniciar el Servidor de Desarrollo (`npm run dev`)
- `scripts/dev-runner.js` y `wrangler dev` cargan `.dev.vars` y el bundle en memoria **al momento de iniciar**. Si se cambia la clave o el código con el servidor encendido, no tomará los cambios en caliente.
- **Solución:** Presionar `Ctrl + C` en la terminal y ejecutar nuevamente:
  ```bash
  npm run dev
  ```

---

## 1. Pool de Modelos en Groq API & Cloudflare

El endpoint [`functions/api/ai/chat.js`](file:///c:/Users/Elizabeth/Desktop/SaberLab/functions/api/ai/chat.js) implementa un bucle resiliente multi-clave y multi-modelo:

| Orden | Modelo | Proveedor | Parámetros Especiales | Rol Pedagógico |
| :--- | :--- | :--- | :--- | :--- |
| **1. Primario** | `openai/gpt-oss-120b` | Groq | `reasoning_effort: 'low'`, max 1500 tokens | Máxima capacidad técnica y resolución paso a paso. |
| **2. Secundario** | `openai/gpt-oss-20b` | Groq | `reasoning_effort: 'low'`, max 1500 tokens | Respuesta instantánea (< 0.5s) para preguntas directas. |
| **3. Terciario** | `qwen/qwen3.8-27b` | Groq | max 1500 tokens | Excelente redacción en español y explicaciones conceptuales. |
| **4. Respaldo Edge** | `@cf/meta/llama-3.1-8b-instruct` | Cloudflare Workers AI | Nativo Cloudflare | Respaldo si la API de Groq no estuviese disponible. |
| **5. Contingencia** | `Offline Heuristic Engine` | SaberLab Local | Respuestas locales por tema | Respuestas temáticas cuando no hay internet. |

---

## 2. Los 4 Tutores Inteligentes por Curso

| Bot ID | Nombre | Curso / Entorno | Prompt y Dominio |
| :--- | :--- | :--- | :--- |
| `electrobot` | **ElectroBot** | Electricidad (`EE`) | Ley de Ohm/Watt, circuitos serie/paralelo/mixtos, componentes y multímetro. |
| `robobot` | **RoboBot** | Robótica (`RE`) | Arduino C++, pines digitales/PWM, sensores (HC-SR04, LDR) y servomotores. |
| `tridibot` | **TridiBot** | Modelado 3D (`MA` / `SIMI`) | Blender 4.x (atajos G/R/S, Z-Up), topología manifold, Fusion 360 y CAD. |
| `impribot` | **ImpriBot** | Semillero (`SIMI3D`) | Parámetros FDM/SLA, slicers (OrcaSlicer, Cura), filamentos (PLA, PETG) y calibración. |

---

## 3. Parámetros de Inferencia y Formato
- **Primera Línea Obligatoria:** `[TITULO: Nombre Sintético del Tema]` para generación automática del historial en la barra lateral.
- **Guardrail de Delimitación:** Etiqueta `[FUERA_DE_CONTEXTO]` si el estudiante pregunta sobre temas no académicos.
- **Prohibición de LaTeX Crudo:** Conversión automática de `$`, `$$`, `\frac`, `\Omega` a texto plano legible con caracteres UTF-8 (`Ω`, `·`, `/`, `²`).
- **Persistencia en D1:** Tablas `ai_chat_sessions` y `ai_chat_messages` para historial de estudiante y auditoría docente.
