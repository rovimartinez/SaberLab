# System Architecture

## 1. High-Level Architecture
**SaberLab** está construido sobre una arquitectura moderna serverless de ultra-baja latencia alojada en el Edge de Cloudflare (Cloudflare Pages + D1 SQLite Serverless + Pages Functions).

```mermaid
flowchart TD
    User([Navegador del Estudiante / Docente])
    
    subgraph Frontend [SPA React 19 + Vite]
        Router[React Router 7]
        AuthContext[AuthContext - JWT & Roles]
        ThemeManager[ThemeManager - Light/Dark Tokens]
        Simulators[Simuladores SVG & WebGL Three.js]
        ApiClient[Cliente API /src/lib/api.js]
    end
    
    subgraph Backend [Cloudflare Pages Functions /functions/api/*]
        AuthHandler[/api/auth/* Google OAuth & jose JWT]
        PracticeHandler[/api/practice/* Progreso & Retos]
        EvaluationsHandler[/api/evaluations/* Exámenes & Lobby]
        SimiHandler[/api/simi/* Asistencia, Proyectos & Recursos]
        NotifyHandler[/api/notify/* WhatsApp UltraMsg/Evolution]
    end
    
    subgraph Database [Cloudflare D1 SQLite Serverless]
        D1[(env.DB - 20+ Tablas Maestras & Relacionales)]
    end
    
    User <-->|HTTPS / DOM Events| Frontend
    Router --> AuthContext
    ApiClient <-->|JSON + Bearer JWT Token| Backend
    Backend <-->|SQL Queries directas en Edge| D1
```

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Core** | React 19 + Vite 6 | Renderizado reactivo rápido, bundle optimizado y compatibilidad WebGL. |
| **Routing** | React Router 7 | Enrutamiento SPA cliente con layouts anidados, `ProtectedRoute` y `AdminRoute`. |
| **3D Engine** | Three.js (`three`) | Renderizado 3D WebGL para Viewport de Blender, coordenadas Z-Up y Ajedrez CAD. |
| **Vector Graphics** | React Dynamic SVG | Simuladores físicos de electrónica, flujo animado de electrones y reductor serie/paralelo. |
| **Styling** | Vanilla CSS + Design Tokens | Sistema de tokens semánticos puros en `:root` y `[data-theme='light']` (`design-system.css`). |
| **Icons** | Lucide React | Iconografía vectorial uniforme para herramientas, estados y módulos. |
| **Serverless Backend** | Cloudflare Pages Functions | Endpoints en Edge JavaScript sin servidores tradicionales (`functions/api/*`). |
| **Database** | Cloudflare D1 (SQLite) | Base de datos relacional serverless globalmente distribuida con persistencia ACID. |
| **Auth & Security** | Google OAuth 2.0 + `jose` JWT | Autenticación federada de Google, tokens JWT y autorización de acceso previo. |
| **Hosting & CDN** | Cloudflare Pages | Despliegue global instantáneo con protección SSL y Edge Caching. |

---

## 3. Directory Structure

```text
SaberLab/
├── docs/                      # Documentación y memoria persistente del proyecto
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── RULES.md
│   ├── DESIGN.md
│   ├── TASKS.md
│   └── MEMORY.md
├── functions/                 # Backend Serverless en Cloudflare Pages Functions
│   └── api/                   # Handlers de API (/api/auth, /api/simi, /api/practice, etc.)
├── migrations/                # Esquemas y migraciones D1 SQLite (0001_initial_schema.sql)
├── public/                    # Assets estáticos, texturas 3D e ilustraciones
├── src/
│   ├── components/            # Componentes reutilizables
│   │   ├── admin/             # Paneles de gestión, Lobby de exámenes en vivo y asistencia
│   │   ├── lesson/            # Visor de lecciones, flashcards y reproductores
│   │   ├── simi/              # Modales y widgets del semillero SIMI3D
│   │   └── simulators/        # Simuladores interactivos (EE SVG, 3D WebGL, RE)
│   ├── context/               # AuthContext y estados globales
│   ├── data/                  # Registros estáticos de lecciones y cursos (coursesData.jsx)
│   ├── lessons/               # Contenido formativo por curso (EE, RE, MA, SIMI)
│   ├── lib/                   # Cliente API (api.js), Theme Manager y helpers de audio
│   ├── pages/                 # Vistas principales (PanelInicio, PanelSimiHub, Player, etc.)
│   └── styles/                # CSS desacoplado y design-system.css
├── .agents/skills/            # Skills tácticas de IA (database, courses, simi, tutors)
├── AGENTS.md                  # Reglas maestras de trabajo e historial de avances
└── REPO_MAP.md                # Mapa topológico del repositorio
```
