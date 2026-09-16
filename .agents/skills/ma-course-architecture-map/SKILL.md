---
name: ma-course-architecture-map
description: Mapa táctico del Curso de Modelado y Animación 3D (MA) en SaberLab (lecciones, motor Three.js WebGL, Viewport Blender 4.x, demostrador euclidiano y exámenes).
---

# Modelado y Animación 3D (MA) - Architecture & Codebase Map

Mapa técnico del curso **MA** (ID: `3`, Slug: `modelado-animacion-3d`, Color: `#ec4899`).

---

## 1. Estructura de Lecciones y Archivos Clave

| Módulo / Lección | Archivo | Contenido Clave |
|---|---|---|
| **M1-L1: Espacio 3D y Blender** | `src/lessons/MA/m1/l1.jsx` | Espacio cartesiano, interfaz Blender 4.x, navegación orbital y quiz. |
| **M1-L2: Primitivas y G/R/S** | `src/lessons/MA/m1/l2.jsx` | Transformaciones fundamentales de precisión, atajos Shift/Alt y laboratorio. |
| **M1-L3: Modo Edición** | `src/lessons/MA/m1/l3.jsx` | Topología poligonal (vértices, aristas, caras), extrusión y biselado. |
| **M1-L4: Herramientas Modelado**| `src/lessons/MA/m1/l4.jsx` | Inset (I), Bevel (Ctrl+B), Loop Cut (Ctrl+R) orientadas a proyecto. |
| **M1-L5: Examen M1** | `src/lessons/MA/m1/l5e.jsx` / `l5.jsx` | Evaluación teórico-práctica en plataforma (125 pts). |
| **Módulo M2 (Semanas 5 a 8)** | `src/lessons/MA/m2/*` | Modificadores Mirror, Subsurf, Solidify, Array, sombreado y materiales PBR. |
| **Módulo M3 (Semanas 9 a 12)** | `src/lessons/MA/m3/*` | Proporciones de personajes, modelado orgánico, edge flow y accesorios. |
| **Módulo M4 (Semanas 13 a 17)**| `src/lessons/MA/m4/*` | Animación con keyframes, Graph Editor, Rigging con Armatures y render final. |

---

## 2. Motor WebGL y Componentes Three.js

- **Ubicación de Componentes 3D:** `src/components/simulators/3d/`
- **Componentes Esenciales:**
  - `BlenderViewport.jsx`: Emulador de Viewport WebGL de Blender 4.x (convención Z-Up, zoom no invasivo, modos Wireframe/Solid/Rendered).
  - `CoordinateSpaceDemo.jsx`: Demostrador cartesiano euclidiano, regla RGB y Perspectiva vs Ortográfica.
  - `PracticalLabMA1.jsx`: Laboratorio interactivo con 5 retos de navegación 3D y Sandbox.
  - `PrimitivesTransformLab.jsx`: Laboratorio de transformación con primitivas y retos de traslación/rotación/escala.
