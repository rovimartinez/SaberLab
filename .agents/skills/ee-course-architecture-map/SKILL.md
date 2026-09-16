---
name: ee-course-architecture-map
description: Mapa táctico del Curso de Electricidad y Electrónica Básica (EE) en SaberLab (lecciones, simuladores SVG físicos, reductor serie/paralelo y exámenes).
---

# Electricidad y Electrónica Básica (EE) - Architecture & Codebase Map

Mapa técnico del curso **EE** (ID: `1`, Slug: `electricidad-y-electronica`, Color: `#f59e0b`).

---

## 1. Estructura de Lecciones y Archivos Clave

| Módulo / Lección | Archivo | Contenido Clave |
|---|---|---|
| **M1-L1: Carga y Átomo** | `src/lessons/EE/m1/l1.jsx` | Modelo de Bohr SVG animado, conductores vs aislantes, clasificador y quiz. |
| **M1-L2: Ley de Ohm y Watt** | `src/lessons/EE/m1/l2.jsx` | Triángulo interactivo $V-I-R$, simulador AC vs DC, analogía hidráulica. |
| **M1-L3: Circuitos en Serie** | `src/lessons/EE/m1/l3.jsx` | 3 bombillos en serie, reductor paso a paso, retos de caída de tensión. |
| **M1-L4: Circuitos en Paralelo** | `src/lessons/EE/m1/l4.jsx` | 3 ramas con switches independientes, divisor de corriente y reducción. |
| **M1-L5: Circuitos Mixtos** | `src/lessons/EE/m1/l5.jsx` | Simulador de 3 bombillos a ras ($Y=52$), reductor en 5 etapas y sandbox. |
| **M1-L6: Examen M1** | `src/lessons/EE/m1/l6e.jsx` | Examen integrador con 10 preguntas y persistencia en D1 (`ee-m1-l6`). |
| **Módulos M2, M3, M4** | `src/lessons/EE/m2/*`, `m3/*`, `m4/*` | Transistores BJT, CI NE555 astable, CI 74LS93 y proyectos funcionales. |

---

## 2. Simuladores y Estándares Geométricos SVG

- **Ubicación de Simuladores:** `src/components/simulators/electricity/`
- **Simulador de Laboratorio / Recompensas:** `src/components/simulators/electricity/CircuitSimulator.jsx` (Topologías Serie, Paralelo, Mixto A y Mixto B con bombillos o resistores de 4 bandas).
- **Estándares SVG Obligatorios (`AGENTS.md`):**
  - Cables y rieles: Azul institucional `#38bdf8`, grosor $2.5\text{px}$.
  - Cuerpos de resistor: `#1e293b`, borde `#38bdf8`, texto blanco `#f8fafc`.
  - Batería fija en todas las etapas para evitar saltos visuales.
  - Badges con separación mínima de $6\text{px}$ a $8\text{px}$ de los componentes.
