# Development Rules for AI & Human Collaboration

## 1. Reglas Críticas Inquebrantables (Ground Rules)
1. 🛑 **PROHIBIDO HACER `git push` SIN AUTORIZACIÓN:** Nunca ejecutar `git push` de forma automática. Todo se prueba y compila en local; solo se sube al repositorio cuando el usuario dé la orden explícita.
2. 🔨 **VERIFICACIÓN OBLIGATORIA CON `npm run build`:** Cada cambio debe compilar con **0 errores** antes de dar por finalizada una tarea.
3. 🗺️ **CONSULTAR MAPAS TÁCTICOS (`.agents/skills/`):** Antes de buscar o leer múltiples archivos, consultar la skill correspondiente (`saberlab-architecture-map`, `database-architecture-map`, `simi-architecture-map`, etc.) para ahorrar tokens y tiempo.

---

## 2. Convenciones de Código y Estándares de Ingeniería

### React 19 & JavaScript Moderno
- **Hooks y Estado Reactivo:** Uso de React 19 nativo sin librerías de estado externas pesadas; comunicación mediante `AuthContext`, custom hooks y cliente `api.js`.
- **Desacoplamiento Estricto:** Separar la lógica matemática/física de los componentes visuales (ej. cálculo de $R_{eq}$, matrices de transformación 3D o telemetría en módulos o custom hooks).
- **Manejo de Errores Asíncronos:** Toda llamada a `api()` debe envolverse en bloques `try / catch / finally` gestionando estados de carga y feedback visual accesible.

### Simuladores 3D WebGL (Three.js) & Geometría SVG
- **Convención 3D Z-Up Obligatoria:** Todos los viewports 3D (Blender, piezas de ajedrez) deben seguir la convención de la industria **Z-Up** (Eje Z Azul hacia arriba, Eje Y Verde en profundidad horizontal y Eje X Rojo en ancho).
- **Event Listeners Pasivos:** En listeners de rueda del ratón (`wheel`) para zoom 3D, usar `{ passive: false }` con `e.preventDefault()` para evitar el scroll indeseado de la página.
- **Geometría de Circuitos SVG:**
  - Cables y rieles en azul eléctrico institucional (`#38bdf8`) con grosor uniforme de $2.5\text{px}$.
  - Cuerpo de resistencias con fondo `#1e293b`, borde `#38bdf8` y texto `#f8fafc`.
  - Rieles al ras de la última rama derecha para evitar colisiones visuales.

### Nomenclatura de Evaluaciones
- Los archivos de evaluaciones integradoras de fin de módulo deben nombrarse con el sufijo `e` (ejemplo: `l6e.jsx` en vez de `l6.jsx`).

---

## 3. Reglas de Estilos y Temas
- **Tokens Semánticos Puros:** Todos los estilos deben usar variables CSS de `src/styles/design-system.css` (`var(--surface-card)`, `var(--text-heading)`, `var(--border-default)`, etc.).
- **Prohibición de `!important` para Temas:** No sobrescribir temas con `:root[data-theme='light'] ... !important`. El sistema conmuta dinámicamente mediante variables semánticas puras.
- **Aislamiento Técnico para Simuladores:** Los contenedores de simulación física y WebGL 3D deben mantener la clase `.simulator-dark-context` para preservar la iluminación y el contraste visual independientemente del tema del sistema.

---

## 4. Motor de IA y Tutores (Troubleshooting & Mantención)
- **Consultar Manual:** Si un bot (ElectroBot, RoboBot, TridiBot, ImpriBot) responde repetitivamente con una tabla estática, consultar inmediatamente [`.agents/skills/saberlab-ai-engine/SKILL.md`](file:///c:/Users/Elizabeth/Desktop/SaberLab/.agents/skills/saberlab-ai-engine/SKILL.md).
- **Modelos de Razonamiento:** Al usar modelos `openai/gpt-oss-*`, enviar siempre `reasoning_effort: 'low'` y `max_completion_tokens: 1500` para evitar que el razonamiento agote el cupo de tokens y retorne respuestas vacías.
- **Ciclo de Compilación de Funciones:** Todo cambio en `functions/api/ai/` requiere ejecutar `npm run dev:build` y reiniciar el proceso local (`npm run dev`) para recargar `.dev.vars` y el bundle de Cloudflare.
