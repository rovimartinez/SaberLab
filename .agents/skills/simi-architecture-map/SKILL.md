---
name: simi-architecture-map
description: Mapa táctico de arquitectura, esquemas Cloudflare D1, rutas, estado y componentes de SIMI3D en SaberLab para consulta directa de la IA con mínimo consumo de tokens.
---

# SIMI3D Tactical Architecture & Codebase Map

Este mapa resume la arquitectura integral del **Semillero de Investigación en Modelado e Impresión 3D (SIMI3D)** en SaberLab. Consulta este archivo directamente para ubicar componentes, esquemas de BD, rutas y estado sin necesidad de buscar o leer archivos grandes.

---

## 1. Localización Rápida de Archivos y Componentes

| Módulo / Funcionalidad | Archivo / Ruta | Descripción Clave |
|---|---|---|
| **Hub Principal SIMI** | `src/pages/PanelSimiHub.jsx` | Layout de workspace con sidebar, vitrina de insignias, visor de lecciones y tabs. |
| **Pestaña Eventos / Visitas** | `src/components/simi/SimiEventsTab.jsx` | Cronograma de visitas colegiales y capacitaciones técnicas (asistencias RSVP). |
| **Pestaña Proyectos** | `src/components/simi/SimiProjectsTab.jsx` | Banco de proyectos CAD/3D, prototipos, galería y modales de edición. |
| **Pestaña Recursos** | `src/components/simi/SimiResourcesTab.jsx` | Inventario de impresoras 3D, filamentos, resinas y herramientas web. |
| **Pestaña Servicios & Portafolio** | `src/components/simi/SimiServicesTab.jsx` | Catálogo de Capacitaciones STEAM, Fabricación Aditiva (FDM/SLA) y Mantenimiento Técnico con cotizador. |
| **Pestaña Miembros (80/80)** | `src/components/simi/SimiMembersTab.jsx` | Directorio de miembros, cálculo de permanencia (80/80) y condecoración de insignias. |
| **Catálogo Estático & Datos** | `src/data/simiData.js` | `SIMI_PINS_CATALOG`, `SIMI_TRACKS`, `SIMI_SERVICES_CATALOG`, eventos semilla y recursos. |
| **Contenido de Rutas / Lecciones** | `src/data/simiTracksLessonsData.js` | Temarios, unidades, callouts y autoevaluaciones (quizzes) de las 8 rutas 3D. |
| **Estilos CSS SIMI** | `src/styles/PanelSimiHub.css` | Diseño cian/morado neón (`#06b6d4`, `#B541FA`), sidebar nav y responsive. |
| **Estilos Componentes Hijos** | `src/styles/SimiEvents.css`, `SimiProjects.css`, `SimiResources.css`, `SimiMembers.css`, `SimiServices.css` | Estilos modulares para cada pestaña del semillero. |
| **Backend & Base de Datos D1** | `functions/api/simi.js` | Endpoints GET/POST con auto-aprovisionamiento y operaciones CRUD. |

---

## 2. Esquema de Base de Datos (Cloudflare D1 / SQLite)

Tablas gestionadas en `functions/api/simi.js`:

1. **`simi_eventos`**:
   - `id TEXT PRIMARY KEY`, `event_type TEXT`, `school_name TEXT`, `date TEXT`, `time TEXT`, `location TEXT`, `status TEXT`, `leader TEXT`, `objective TEXT`, `equipment TEXT` (JSON), `badge_tier TEXT`, `students_count INTEGER`, `updated_at TEXT`.
2. **`simi_asistencias`**:
   - `id TEXT PRIMARY KEY` (`${event_id}_${user_id}`), `event_id TEXT`, `user_id TEXT`, `user_name TEXT`, `status TEXT`, `attended INTEGER` (0 o 1 para validación docente), `updated_at TEXT`.
3. **`simi_proyectos`**:
   - `id TEXT PRIMARY KEY`, `title TEXT`, `category TEXT`, `author TEXT`, `software TEXT`, `status TEXT`, `description TEXT`, `specs TEXT`, `image_url TEXT`, `likes INTEGER`, `created_at TEXT`, `updated_at TEXT`.
4. **`simi_recursos`**:
   - `id TEXT PRIMARY KEY`, `name TEXT`, `category TEXT`, `status TEXT`, `quantity INTEGER`, `specs TEXT`, `location TEXT`, `image_url TEXT`, `updated_at TEXT`.
5. **`simi_insignias`**:
   - `id TEXT PRIMARY KEY` (`${user_id}_${pin_id}`), `user_id TEXT`, `pin_id TEXT`, `tier TEXT` (`I` a `V`), `exp_earned INTEGER` (100 a 500), `unlocked_at TEXT`, `updated_at TEXT`.
6. **`simi_servicios`**:
   - `id TEXT PRIMARY KEY`, `category TEXT`, `category_label TEXT`, `title TEXT`, `target_audience TEXT`, `description TEXT`, `features TEXT` (JSON), `pricing_info TEXT`, `status TEXT` (`'active'`, `'hidden'`, `'locked'`), `is_locked INTEGER`, `is_hidden INTEGER`, `icon_key TEXT`, `color TEXT`, `badge TEXT`, `image_url TEXT`, `updated_at TEXT`.

---

## 3. Acciones Backend API (`POST /api/simi`)

| `action` | Parámetros Requeridos | Autorización |
|---|---|---|
| `'rsvp'` | `eventId`, `status` | Cualquier usuario autenticado |
| `'verify-attendance'` | `eventId`, `targetUserId`, `attended` (bool) | Líder / Docente / Admin |
| `'save-event'` | `id` (opcional), datos del evento | Líder / Docente / Admin |
| `'delete-event'` | `id` | Líder / Docente / Admin |
| `'save-project'` | `id` (opcional), datos del proyecto CAD | Líder / Docente / Admin |
| `'delete-project'` | `id` | Líder / Docente / Admin |
| `'save-resource'` | `id` (opcional), datos de equipo/filamento | Líder / Docente / Admin |
| `'delete-resource'` | `id` | Líder / Docente / Admin |
| `'save-service'` | `id` (opcional), datos de capacitación/servicio | Líder / Docente / Admin |
| `'toggle-service-status'` | `id`, `nextStatus` (`'active'`, `'hidden'`, `'locked'`) | Líder / Docente / Admin |
| `'delete-service'` | `id` | Líder / Docente / Admin |
| `'sync-all-services'` | `items` (array) | Líder / Docente / Admin |
| `'save-badge'` | `targetUserId`, `pinId`, `tier` (`'none'`, `'I'..'V'`), `exp` | Auto: Todos / Otros: Líder/Docente |
| `'save-web-resource'` | `id` (opcional), `name`, `url`, `logoUrl`, etc. | Líder / Docente / Admin |
| `'delete-web-resource'`| `id` | Líder / Docente / Admin |

---

## 4. Reglas de Negocio Clave en SIMI3D

1. **Regla del 80 / 80 (Permanencia & Condecoración)**:
   - Medición independiente de:
     - 80% Asistencia a **Capacitaciones Técnicas & Software 3D** (`event_type === 'capacitacion_tecnica'`).
     - 80% Asistencia a **Visitas Pedagógicas Escolares** (`event_type !== 'capacitacion_tecnica'`).
2. **Sistema de Insignias & Escalafón (Grados I al V)**:
   - 6 Especialidades canónicas: Tinkercad, Blender, Fusion 360, Slicers, Impresión FDM, Impresión SLA.
   - Cada grado otorga $Grado \times 100\text{ EXP}$ (Grado I = 100 EXP, Grado V = 500 EXP).
3. **Modo Vista Estudiante**:
   - Estado local `isSimiStudentView` en `PanelSimiHub.jsx` que permite a docentes/líderes simular la interfaz de alumno sin abandonar el Hub de SIMI3D.
