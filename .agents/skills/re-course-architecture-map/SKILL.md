---
name: re-course-architecture-map
description: Mapa táctico del Curso de Robótica Educativa (RE) en SaberLab (lecciones Arduino C++, simuladores virtuales, retos lógicos y exámenes).
---

# Robótica Educativa (RE) - Architecture & Codebase Map

Mapa técnico del curso **RE** (ID: `2`, Slug: `robotica-educativa`, Color: `#10b981`).

---

## 1. Estructura de Lecciones y Archivos Clave

| Módulo / Lección | Archivo | Contenido Clave |
|---|---|---|
| **M1-L1: Mi Primer Parpadeo** | `src/lessons/RE/m1/l1.jsx` | Control de LED con C++, función `digitalWrite`, `delay` y circuito virtual. |
| **M1-L2: Semáforos y Variables**| `src/lessons/RE/m1/l2.jsx` | Tipos de datos `int`, temporización secuencial y control de 3 LEDs. |
| **M1-L3: Entradas Digitales** | `src/lessons/RE/m1/l3.jsx` | Pulsadores, resistencia pull-down/pull-up y condicionales `if/else`. |
| **M1-L4: Monitor Serie** | `src/lessons/RE/m1/l4.jsx` | `Serial.begin(9600)`, `Serial.println`, telemetría y depuración en consola. |
| **M1-L5: Entradas Analógicas** | `src/lessons/RE/m1/l5.jsx` | Potenciómetros, `analogRead` (resolución 10 bits 0-1023) y modulación PWM. |
| **M1-L6: Examen M1** | `src/lessons/RE/m1/l6e.jsx` | Evaluación integradora con 20 reactivos interactivos (`re-m1-eval`). |
| **Módulos M2, M3, M4** | `src/lessons/RE/m2/*`, `m3/*`, `m4/*` | Sensores ultrasónicos, LDR, servomotores, driver L298N y robot seguidor. |

---

## 2. Simuladores Virtuales de Robótica

- **Ubicación de Componentes:** `src/components/simulators/RE/`
- **Simuladores Clave:**
  - `ArduinoSimulatorV2.jsx`: Microcontrolador Arduino Uno virtual con ejecución de código C++ y animación de puertos.
  - `MisionLeccion.jsx` / `MisionRoadMap.jsx`: Entorno de retos guiados por niveles de programación.
  - `Blink.jsx` y `LedSimulator.jsx`: Simuladores específicos de parpadeo y estados lógicos de LEDs.
  - `widgets/ArduinoIDE.tsx`: Editor y compilador web de sketches Arduino.
