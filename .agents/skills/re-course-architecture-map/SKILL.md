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
| **M2-L1: Funciones C++** | `src/lessons/RE/m2/l1.jsx` | Funciones personalizadas, parámetros, valores de retorno y código modular. |
| **M2-L2: Motores DC y Puente H**| `src/lessons/RE/m2/l2.jsx` | Driver L298N, control de sentido de giro e inversión de polaridad con PWM. |
| **M2-L3: Sensores IR y PIR** | `src/lessons/RE/m2/l3.jsx` | Fotorreceptores Infrarrojos TCRT5000 (seguidor) y detección de movimiento PIR. |
| **M2-L4: Sensor Ultrasónico** | `src/lessons/RE/m2/l4.jsx` | Sensor HC-SR04, pulso Trigger/Echo, función `pulseIn()` y cálculo de distancia. |
| **M2-EVAL: Examen M2** | `src/lessons/RE/m2/l5e.jsx` | Evaluación integradora Módulo 2 (`re-m2-eval`). |

---

## 2. Simuladores Virtuales de Robótica

- **Ubicación de Componentes:** `src/components/simulators/RE/`
- **Simuladores Clave:**
  - `ArduinoSimulatorV2.jsx`: Microcontrolador Arduino Uno virtual con ejecución de código C++ y animación de puertos.
  - `MisionLeccion.jsx` / `MisionRoadMap.jsx`: Entorno de retos guiados por niveles de programación.
  - `Blink.jsx` y `LedSimulator.jsx`: Simuladores específicos de parpadeo y estados lógicos de LEDs.
  - `widgets/ArduinoIDE.tsx`: Editor y compilador web de sketches Arduino.
