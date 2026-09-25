# Design System

## 1. Design Principles
- **Aesthetics & Premium Polish:** Interfaz inmersiva, moderna y dinámica que motive al aprendizaje activo mediante glassmorphism, micro-animaciones y feedback interactivo.
- **Pure Semantic Tokens:** Sistema desacoplado basado en tokens semánticos CSS que conmutan automáticamente entre tema oscuro (por defecto) y tema claro institucional.
- **Simulators Dark Context:** Entorno oscuro técnico protegido (`.simulator-dark-context`) para simuladores SVG y WebGL Three.js, garantizando contraste físico y visual óptimo.
- **Accessible & Responsive:** Navegación por teclado, contraste AA en tipografía e interfaces adaptables a teléfonos, tablets y pantallas de proyección en clase.

---

## 2. Semantic Color Palette

| Token Semántico | Dark Theme (Default) | Light Theme (`data-theme='light'`) | Propósito |
| :--- | :--- | :--- | :--- |
| `--surface-canvas` | `#0b0f19` | `#f1f5f9` | Fondo principal de la ventana y aplicaciones. |
| `--surface-card` | `#111827` | `#ffffff` | Fondo de tarjetas, paneles y modales. |
| `--surface-subtle` | `#1f2937` | `#e2e8f0` | Contenedores secundarios e inputs de formulario. |
| `--border-default` | `#374151` | `#cbd5e1` | Bordes estándar, divisores y contornos de tarjetas. |
| `--border-subtle` | `#1e293b` | `#e2e8f0` | Líneas de división tenue y rieles inactivos. |
| `--text-heading` | `#f9fafb` | `#0f172a` | Títulos principales, encabezados y cifras destacadas. |
| `--text-body` | `#d1d5db` | `#334155` | Texto de lectura, párrafos y contenido descriptivo. |
| `--text-muted` | `#9ca3af` | `#64748b` | Subtítulos, metadatos y placeholders. |
| `--brand-primary` | `#0284c7` | `#0284c7` | Azul institucional SaberLab (acciones y botones). |
| `--status-success` | `#10b981` | `#059669` | Retos completados, badges superados y éxito. |
| `--status-warning` | `#f59e0b` | `#d97706` | Alertas de strikes, advertencias y marcas de revisión. |
| `--status-danger` | `#ef4444` | `#dc2626` | Bloqueos de seguridad, fallas y errores de validación. |
| `--course-ee` | `#38bdf8` | `#0284c7` | Identidad Curso Electricidad (Azul Eléctrico). |
| `--course-re` | `#a855f7` | `#7e22ce` | Identidad Curso Robótica (Púrpura Arduino). |
| `--course-ma` | `#f59e0b` | `#d97706` | Identidad Curso Modelado 3D (Ámbar Blender). |
| `--course-simi` | `#06b6d4` | `#0891b2` | Identidad Semillero SIMI3D (Cian Manufactura Aditiva). |

---

## 3. Typography & Badges
- **Fuente Principal:** System Font Stack optimizado (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif`).
- **Badges y Píldoras:**
  - `.badge-pill.ready`: Fondo azul translúcido con texto `--brand-primary` para estados disponibles.
  - `.badge-pill.done`: Fondo esmeralda translúcido con texto `--status-success` para lecciones superadas.
  - `.badge-pill.locked`: Fondo neutro translúcido con candado para módulos protegidos.

---

## 4. UI Components Guidelines

### Botones Principales (`.btn-primary`, `.btn-secondary`)
- Bordes redondeados de $8\text{px}$ a $12\text{px}$, transición de color suave ($0.2\text{s}$) y elevación sutil en hover.

### Floating Action Buttons (FAB) & Docks
- **Dock de Modo Admin/Estudiante (`.impersonate-floating-dock`):** Flotante inferior centrado, border-radius $16\text{px}$, glassmorphism (`backdrop-filter: blur(12px)`) y resplandor ámbar.
- **FAB Home en Lecciones (`.lesson-fab-home`):** Esquina inferior izquierda para retorno instantáneo al Dashboard en 1 clic.
