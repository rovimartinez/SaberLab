# Product Requirements Document (PRD)

| Metadata | Details |
| :--- | :--- |
| **Project** | SaberLab |
| **Version** | v2.4.0 (Live / Multi-Course & SIMI3D) |
| **Date** | 2026-09-24 |
| **Author** | Ing. Ronny Martinez Reyes & Lead Architecture Team |
| **Status** | Active / In Production |
| **Target Audience** | Universidades, Colegios Técnicos, Estudiantes STEAM y Docentes |

---

## 1. Product Overview
**SaberLab** es una plataforma educativa interactiva y gamificada orientada a la enseñanza y aprendizaje de electricidad, electrónica, física, robótica, modelado 3D y manufactura aditiva/impresión 3D. Integra simuladores virtuales en tiempo real (física SVG y WebGL Three.js), pedagogía activa modular (lecciones con reducción paso a paso y retos), evaluación supervisada anti-fraude y gestión integral de cursos, asistencia y semilleros de investigación.

---

## 2. Problem Statement
La enseñanza técnica tradicional presenta dificultades críticas:
- **Abstracción invisible:** Conceptos como flujo de corriente, campos magnéticos o transformaciones espaciales 3D son difíciles de visualizar sin instrumental costoso.
- **Riesgo y costo en laboratorios físicos:** Componentes quemados, limitaciones de licencias CAD y disponibilidad restringida de impresoras 3D.
- **Desarticulación pedagógica:** Desconexión entre la teoría en diapositivas, las evaluaciones memorísticas y la práctica real en el aula.

---

## 3. Goals
- **Product Goals:**
  - Proporcionar laboratorios virtuales accesibles desde el navegador sin instalación de software pesado.
  - Sincronización instantánea de progreso, retos prácticos y calificaciones en Cloudflare D1.
  - Centralizar 4 áreas temáticas oficiales: Electricidad (`EE`), Robótica (`RE`), Modelado 3D (`MA`) y el Semillero de Impresión 3D (`SIMI`).
- **User Experience & Educational Goals:**
  - Animación física en tiempo real de electrones, caídas de tensión y mallas en circuitos eléctricos.
  - Viewport WebGL interactivo en 3D emulando los controles de Blender 4.x (convención Z-Up).
  - Experiencia gamificada con desbloqueo de insignias tácticas, gadgets y reconocimientos.

---

## 4. Target Users
- **Estudiantes Universitarios y Técnicos:**
  - Asignaturas de Circuitos Eléctricos, Robótica Educativa y Diseño/Animación 3D (Universidad del Magdalena y colegios aliados).
- **Docentes e Instructores:**
  - Control de visibilidad de lecciones, monitoreo de exámenes en vivo con strikes anti-copia, control de asistencia flash por PIN y liberación de notas.
- **Miembros del Semillero SIMI3D:**
  - Registro de asistencia por código QR/PIN, bitácora de proyectos CAD, inventario de impresoras/filamentos y misiones de campo.

---

## 5. Core Modules & Features

### A. Cursos y Áreas Formativas
1. **Electricidad y Electrónica Básica (`EE`):**
   - Fundamentos, Ley de Ohm/Watt, Circuitos Serie, Paralelo y Mixtos con reductor paso a paso SVG interactivo.
2. **Robótica Educativa (`RE`):**
   - Lógica de microcontroladores Arduino C++, sensores y actuadores.
3. **Modelado y Animación 3D (`MA`):**
   - Espacio euclidiano cartesiano, Viewport Blender 4.x WebGL, Proyecto Integrador de Ajedrez 3D (Peón, Torre, Alfil, Rey, Reina, Caballo, Tablero PBR).
4. **Semillero SIMI3D (`SIMI`):**
   - Hub exclusivo con 8 rutas no lineales (Tinkercad, Blender, Fusion 360, Slicers, FDM y SLA), control de asistencia docente/estudiante con geocercas y bitácora de proyectos.

### B. Sistema de Evaluaciones y Proctoring
- Sala de espera en tiempo real (Lobby en vivo estilo Wayground/Kahoot).
- Protocolo estricto anti-fraude: detección de pantalla completa, cambio de pestañas, strikes progresivos y bloqueo.
- Marcado de preguntas (🚩), aleatorización de opciones y liberación condicional de notas por el docente.

### C. Plataforma y Administración
- Solicitudes de acceso previo y auto-inscripción controlada.
- Dock flotante de cambio de rol (Admin / Vista Estudiante).
- Sistema de diseño de tokens semánticos puros con tema claro/oscuro.
