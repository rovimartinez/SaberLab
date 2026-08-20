# SaberLab - Estado y Guía de Continuación del Proyecto

## 🌟 ¿Qué es SaberLab?
**SaberLab** es una plataforma educativa interactiva y gamificada orientada a la enseñanza de electricidad, electrónica, física y programación para colegios e instituciones técnicas. Está construida sobre **React 19 + Vite + Cloudflare D1 (SQLite serverless) + Cloudflare Pages Functions**, e integra:
- **Laboratorios y Simuladores Virtuales:** Gráficos SVG reactivos con animación física en tiempo real de electrones, caídas de potencial, corrientes de malla y potencia disipada.
- **Pedagogía Activa Modular:** Estructura por lecciones con teoría interactiva, calculadoras reductoras paso a paso, flashcards nemotécnicas, laboratorios prácticos con retos esquemáticos y evaluaciones con persistencia.
- **Gamificación & Recompensas:** Desbloqueo de herramientas electrónicas, multímetro digital, código de colores, laboratorio de topologías y logros.
- **Panel Docente & Administrativo:** Gestión de cursos, grupos, visibilidad en vivo de lecciones y diseñador visual de exámenes.

---

## 🔎 Reglas de Trabajo Críticas (Instrucciones para el Agente)
1. 🛑 **PROHIBIDO HACER `git push` SIN AUTORIZACIÓN:** Nunca ejecutar `git push` de forma automática. Todo se prueba y compila en local con `npm run build`; solo se sube al repositorio cuando el usuario dé la orden explícita.
2. 🔨 **VERIFICACIÓN OBLIGATORIA CON `npm run build`:** Cada cambio debe compilar con **0 errores** antes de dar por finalizada una tarea.
3. 🗺️ **CONSULTAR [REPO_MAP.md](REPO_MAP.md):** Revisar las rutas clave antes de modificar o crear nuevos componentes.
4. 🎨 **ESTÁNDARES VISUALES Y GEOMETRÍA SVG:**
   - **Cables y rieles:** Azul eléctrico institucional (`#38bdf8`) con grosor uniforme de $2.5\text{px}$.
   - **Cuerpo de Resistencias:** Fondo oscuro `#1e293b`, borde `#38bdf8` y texto blanco `#f8fafc`.
   - **Rieles al Ras:** Los rieles superior e inferior no deben sobresalir más allá del centro de la última rama derecha.
   - **Batería fija:** Mantener las coordenadas de la batería idénticas en todas las etapas para evitar saltos visuales al cambiar de paso.
   - **Badges y Medidores:** Mantener separación mínima de $6\text{px}$ a $8\text{px}$ respecto a los componentes para evitar solapamientos.

---

## ✅ ¿Qué hemos hecho? (Resumen de Trabajo Realizado)

### 1. Módulo 1 de Electricidad (`EE-M1` - Fundamentos Eléctricos)
- **Lección 1 (`ee-m1-l1` - Carga Eléctrica y Estructura Atómica):**
  - Modelo de Bohr animado, animación de conductores vs aislantes, clasificador de materiales y 10 retos prácticos.
- **Lección 2 (`ee-m1-l2` - Ley de Ohm y Ley de Watt):**
  - Triángulo interactivo $V-I-R$, simulador AC vs DC, analogía hidráulica interactiva y retos de cálculo.
- **Lección 3 (`ee-m1-l3` - Circuitos en Serie):**
  - Simulador interactivo de 3 bombillos en serie con interruptores, calculador reductor paso a paso y retos.
- **Lección 4 (`ee-m1-l4` - Circuitos en Paralelo):**
  - Simulador de 3 ramas independientes con interruptores por rama, visualizador de reducción paralelo y retos de corriente.
- **Lección 5 (`ee-m1-l5` - Circuitos Mixtos Serie-Paralelo):**
  - **Simulador Interactivo:** 3 bombillos con filamentos y electrones animados atravesando casquillos a ras ($Y=52$), halo de resplandor unificado ($r=28$).
  - **Reductor Paso a Paso:** 5 etapas interactivas con caja delimitadora esmeralda punteada (`#10b981`), badge superior `Bloque Rp = 20 Ω`, medidor inferior $I_T = 0.80\,\text{A}$ y etiquetas flanqueadas a los costados sin colisiones.
  - **Laboratorio Práctico (`PracticalLabL5.jsx`):** 10 retos con **circuitos esquemáticos estáticos SVG dedicados** (identificación de bloque interno, suma serie, corrientes de rama, voltajes parciales, potencias y componente abierto por falla), más un **Sandbox interactivo libre**.
  - **Flashcards y Evaluación:** 10 tarjetas nemotécnicas y cuestionario de 10 preguntas con retroalimentación inmediata.

### 2. Laboratorio de Recompensas (`CircuitSimulator.jsx`)
- Completamente renovado como simulador profesional multimodelo:
  - **4 Topologías:** Serie Pura, Paralelo Puro, Mixto A ($R_1 + (R_2 \parallel R_3)$) y Mixto B ($(R_1 \parallel R_2) + (R_3 \parallel R_4)$).
  - **Selector de Apariencia de Cargas:** Alterna en vivo entre **Bombillas incandescentes** (resplandor dinámico según potencia $P$) y **Resistores cerámicos** (código de colores de 4 bandas).
  - **Interruptores Dinámicos:** Switches interactivos por rama que abren/cierran lazos y redistribuyen la corriente y potencia en tiempo real.
  - **Telemetría en Vivo:** Medición continua de $R_{eq}$, $I_T$, $P_T$, caídas de tensión y corrientes de rama.

### 3. Plataforma, Base de Datos y Exámenes
- **Candado de Autorización Previa:** Conexión estricta de `solicitudes_acceso` en D1. Todo usuario que inicie con Google queda en estado `pending` y es redirigido a `/request-access` hasta que el administrador lo apruebe en `/dashboard/requests`. Al aprobarse, se auto-inscribe en los cursos y se le concede acceso inmediato con sincronización en tiempo real.
- **Persistencia en Cloudflare D1:** Progreso de lecciones y retos prácticos sincronizados en tiempo real mediante API (`/api/practice`).
- **Control de Visibilidad Docente:** `visibilidad_curso` sincronizado en D1, bloqueando acceso en menú, sidebar y rutas protegidas.
- **Sistema de Evaluaciones y Exámenes:** Persistencia real del temporizador mediante `Date.now()`, generador de `evaluation_key` única y renderizado limpio desde JSON.
- **Refactorización:** CSS centralizado en `src/styles/` y nombres estandarizados con prefijo `Panel*`.

---

## 📍 ¿Por dónde quedamos? (Punto de Parada Actual)
* **Estado:** **Módulo 1 de Electricidad (`EE-M1` - Fundamentos Eléctricos) COMPLETADO AL 100% (Lecciones 1 a 6)** con **0 errores** de compilación (`npm run build`).
  - **Lección 6 / Examen 1 (`ee-m1-l6` - 150 pts):**
    - **Teoría (60 pts):** 30 preguntas de opción múltiple conceptuales y contextuales sin cálculos matemáticos (2 pts c/u).
    - **Práctica (90 pts):** Laboratorio interactivo [`PracticalLabL6.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/simulators/electricity/PracticalLabL6.jsx) con esquema SVG de la red mixta de 8 resistores ($24\text{V}$, $R_1$-$R_8$), validación de $R_T, I_T, P_T$, 8 voltajes, 6 corrientes de rama, paso reductor intermedio y guía de reducción paso a paso con persistencia en Cloudflare D1.
* **Siguiente Paso Inmediato:**
  - **Iniciar Módulo 2 (`EE-M2` - Componentes Electrónicos y Aplicaciones - Examen 2: 28 de sep 2026, 125 pts):**
    - `ee-m2-l7`: Capacitores y Almacenamiento de Energía ($100\,\text{nF}, 10\,\mu\text{F}, 100\,\mu\text{F}$).
    - `ee-m2-l8`: Bobinas, Diodos 1N4007, Relé 5V, Motores DC y Buzzer.
    - `ee-m2-l9`: Transistores BJT NPN (2N2222/BC547) y PNP (BC557) en corte y saturación.
    - `ee-m2-l10`: Evaluación de Componentes y Circuitos de Control.
  - **Subir cambios a GitHub (`git push`):** Solo cuando el usuario lo autorice explícitamente.

---

## 📁 Arquitectura y Rutas de Referencia Rápida
- **Lección 5 Mixtos:** [`src/lessons/EE/m1/l5.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/lessons/EE/m1/l5.jsx)
- **Simulador Mixto:** [`src/components/simulators/electricity/MixedCircuitDemo.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/components/simulators/electricity/MixedCircuitDemo.jsx)
- **Reductor Mixto:** [`src/components/simulators/electricity/MixedCalculationVisualizer.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/components/simulators/electricity/MixedCalculationVisualizer.jsx)
- **Retos Prácticos Mixtos:** [`src/components/simulators/electricity/PracticalLabL5.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/components/simulators/electricity/PracticalLabL5.jsx)
- **Simulador Recompensas:** [`src/components/simulators/electricity/CircuitSimulator.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/components/simulators/electricity/CircuitSimulator.jsx)
- **Puente de Montaje Legacy:** [`src/components/lesson/legacy/LessonLegacyBridge.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/components/lesson/legacy/LessonLegacyBridge.jsx)
- **Estilos de Simuladores:** [`src/styles/ElectricitySimulators.css`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/styles/ElectricitySimulators.css)