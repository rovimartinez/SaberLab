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
5. 📝 **CONVENCIÓN DE NOMENCLATURA PARA EVALUACIONES:** Los archivos de evaluaciones integradoras por módulo deben nombrarse con el sufijo `e` (ejemplo: `l6e.jsx` en vez de `l6.jsx`), diferenciando inequívocamente los exámenes de las lecciones temáticas estándar.
6. 🗺️ **MAPAS TÁCTICOS DE ARQUITECTURA (Ahorro de Tokens):** Antes de buscar o leer múltiples archivos, consultar la skill correspondiente para ubicar rutas, esquemas D1, estados y componentes al instante:
   - 🏛️ **General SaberLab:** [`saberlab-architecture-map`](.agents/skills/saberlab-architecture-map/SKILL.md)
   - 🗄️ **Base de Datos Cloudflare D1:** [`database-architecture-map`](.agents/skills/database-architecture-map/SKILL.md)
   - ⚡ **Electricidad (EE):** [`ee-course-architecture-map`](.agents/skills/ee-course-architecture-map/SKILL.md)
   - 🤖 **Robótica (RE):** [`re-course-architecture-map`](.agents/skills/re-course-architecture-map/SKILL.md)
   - 🎨 **Modelado 3D (MA):** [`ma-course-architecture-map`](.agents/skills/ma-course-architecture-map/SKILL.md)
   - 🖨️ **Semillero SIMI3D (SIMI):** [`simi-architecture-map`](.agents/skills/simi-architecture-map/SKILL.md)

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

### 4. Módulo 1 de Modelado y Animación 3D (`MA-M1` - Fundamentos e Introducción 3D)
- **Definición Curricular Oficial UNIMAG 2026-2:** Docente Ronny Martinez Reyes, 3 créditos, 17 semanas, horario Lunes 6-9 PM, 4 módulos con 4 evaluaciones de 125 pts (Total: 500 pts).
  - M1 (31 Ago, 125 pts): Examen Teórico-Práctico en plataforma.
  - M2 (28 Sep, 125 pts): Entrega de Proyecto Terminado (Modelado de Objetos 3D).
  - M3 (19 Oct, 125 pts): Entrega de Proyecto Terminado (Creación de Personaje 3D).
  - M4 (9 Nov, 125 pts): Entrega de Proyecto Final Terminado (Animación 3D Integral).
- **Motor WebGL 3D Integrado:** Dependencia `three` instalada y optimizada para React 19.
- **Componentes 3D Construidos:**
  - [`BlenderViewport.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/simulators/3d/BlenderViewport.jsx): Viewport WebGL interactivo emulando Blender 4.x con soporte de atajos (`G`, `R`, `S`, `X/Y/Z`), navegación orbital, selección de primitivas, vistas ortográficas y modos Wireframe/Solid/Rendered. Ajustado estrictamente a la convención industrial **Z-Up** (Z Azul hacia arriba con cono y badge, Y Verde en profundidad sobre el piso, X Rojo en ancho horizontal) y zoom por rueda de ratón con listener nativo `{ passive: false }` que evita el desplazamiento involuntario de la página web.
  - [`CoordinateSpaceDemo.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/simulators/3d/CoordinateSpaceDemo.jsx): Demostrador interactivo del espacio cartesiano euclidiano, regla RGB de los ejes y comparativa Perspectiva vs Ortográfica.
  - [`PracticalLabMA1.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/simulators/3d/PracticalLabMA1.jsx): Laboratorio interactivo con 5 retos guiados de navegación 3D y modo Sandbox libre.
  - [`PrimitivesTransformLab.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/simulators/3d/PrimitivesTransformLab.jsx): Laboratorio interactivo para la Lección 2 con 5 retos de selección de primitivas (Cubo, Cilindro, Toroide) y transformaciones de precisión (G, R, S).
- **Lección 1 (`ma-m1-l1`):** Espacio 3D, Interfaz de Blender y Navegación Cartesiana (teoría, 10 flashcards, simulador y quiz).
- **Lección 2 (`ma-m1-l2`):** Primitivas 3D y Transformaciones Fundamentales (teoría V-E-F, G/R/S, atajos de precisión con ejes y planos Shift+Z, origen del objeto y tecla Alt, 10 flashcards, laboratorio interactivo y quiz de 10 preguntas).
- **Modo Enfoque de Estudio (Layout UX):** Al ingresar a un curso o lección, el sidebar izquierdo se compacta automáticamente a modo solo iconos (`78px`) con tooltips y botón de alternancia, mientras que el panel derecho (`CourseSidebar`) se despliega automáticamente en pantallas de escritorio con la navegación de módulos y lecciones sin bloquear el contenido central.

---

## 📍 ¿Por dónde quedamos? (Punto de Parada Actual)
### 5. Plataforma de Evaluaciones Segura y Supervisada (Anti-Cheat & Proctoring)
- **Bloqueo y Seguridad Anti-Copia:** Texto no seleccionable (`user-select: none`), inhabilitación de inspección y atajos de teclado, pantalla completa con detección estricta de salida y cambio de pestañas con sistema de strikes progresivos y auto-bloqueo.
- **Aleatorización Completa:** Barajado aleatorio de preguntas y opciones por sesión de estudiante manteniendo consistencia de respuesta mediante valor de opción y persistencia en `localStorage`.
- **Sistema de Marcado de Preguntas (🚩 Flagging):** Botón para marcar reactivos dudosos con resaltado ámbar en el navegador de preguntas (`QuestionNavigator`) y contador en tiempo real.
- **Modal de Confirmación Previo a la Entrega Definitiva:** Sustitución de `window.confirm` por un modal con desglose completo de preguntas respondidas, pendientes, marcadas para revisión y tiempo restante, advirtiendo sobre reactivos en blanco.
- **Control Docente de Liberación de Calificaciones (`results_released`):** Las notas y el solucionario detallado quedan protegidos contra inspección de red hasta que el docente libere las calificaciones desde el panel (`PanelExamenes` o `PanelEvaluaciones`).
- **Detección de Conexión en Vivo:** Indicador en cabecera de estado en línea / fuera de línea (`navigator.onLine`) con protección de respuestas en almacenamiento local y reintento de sincronización al restablecerse la red.

### 6. Sala de Espera y Monitoreo en Vivo de Exámenes (Lobby estilo Wayground / Kahoot)
- **Componente Dedicado [`ExamLiveLobby.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/admin/ExamLiveLobby.jsx):**
  - Panel exclusivo para supervisión y seguimiento de exámenes oficiales (`/dashboard/exam-lobby/:evaluationKey`).
  - Tarjetas de estudiantes en tiempo real con foto de Google, nombre, estado dinámico y avatar con pulso de conexión.
  - Píldoras de telemetría: *En Sala de Espera*, *Rindiendo Examen*, *Alertas (Strikes)* y *Entregados*.
  - Acciones rápidas: *Aviso flash a toda la sala*, *Mensaje directo al alumno* y *Restablecer intento*.
- **Acceso Directo Docente:** Botón `🟢 Sala en Vivo (Lobby)` en cada tarjeta de examen en [`PanelExamenes.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/pages/PanelExamenes.jsx).
- **Navegación Simplificada en 1 Clic para Estudiantes:**
  - **Sidebar Principal:** Opción `Evaluaciones` en `PRINCIPAL` con badge numérico de exámenes publicados.
  - **Panel de Inicio (`/dashboard`):** Banner destacado de *Examen Oficial Pendiente* con botón directo `Presentar Examen ➔`.
  - **Árbol de Lecciones (`CourseSidebar.jsx`):** Exámenes resaltados con estilo dorado, icono de trofeo 🏆 y redirección directa en 1 clic.

### 7. Barra de Filtros Pro-Proyección Docente y Resolución de Cursos ([`PanelEvaluaciones.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/pages/PanelEvaluaciones.jsx))
- **Barra de Píldoras Rápidas (1 Clic):** Filtro interactivo por cursos (`Todos`, `Electricidad`, `Robótica`, `Modelado 3D`) con paletas de color institucionales y contadores sincronizados.
- **Selector de Grupo Activo (`Grupo Activo: [ 👥 Todos los Grupos ▾ ]`):** Conectado con `/api/groups`, permitiendo proyectar en pantalla en salón de clase únicamente los datos y evaluaciones del grupo presente.
- **Buscador y Tabs de Estado:** Pestañas de estado (`Todas`, `Pendientes`, `Completadas`) y caja de búsqueda en tiempo real.
- **Resolución Completa de Cursos:** Corregido el mapeo de `course_id` de Robótica (`5` vs `2`) y añadido fallback inteligente multi-criterio contra `COURSES_DEFINITION`. Ya ninguna tarjeta presenta subtítulos o cursos vacíos.
- **Acceso Directo al Lobby:** Botón `🟢 Sala en Vivo` en cada tarjeta para iniciar o supervisar la sesión en tiempo real.

### 8. Arquitectura 100% Pura de Tokens Semánticos y Desacople de Temas
- **Sistema Central de Tokens (`design-system.css`):** Definición canónica de tokens semánticos en `:root` (tema oscuro por defecto) y `[data-theme='light']` (tema claro institucional).
- **Controlador Reactivo de Tema (`src/lib/themeManager.js`):** Sincronización en tiempo real entre estado, `localStorage` y atributos de documento en `src/main.jsx`.
- **Eliminación Total de Sobrescrituras Manuales (`:root[data-theme='light'] ... !important`):** Refactorizados más de 25 archivos CSS (`PanelMisCursos.css`, `PanelInicio.css`, `PanelEvaluaciones.css`, `ExamLiveLobby.css`, `PanelPerfil.css`, `PanelProgreso.css`, `PanelCalificaciones.css`, `PanelAnalitica.css`, `PanelRecursos.css`, `PanelRecompensas.css`, `PanelGadgets.css`, `CourseDetail.css`, `Certificate.css`, `EvaluationInstruction.css`, `ElectricitySimulators.css`, `PizarraMagica.css`, `PanelWidgets.css`, `SubjectDetail.css`, `Welcome.css`, etc.). Todos los componentes consumen variables semánticas puras (`var(--surface-card)`, `var(--text-heading)`, `var(--border-default)`, `var(--brand-primary)`, etc.).
- **Aislamiento Técnico para Simuladores:** Preservación estricta del entorno oscuro técnico (`.simulator-dark-context`, WebGL 3D y circuitos electrónicos) para mantener la física visual intacta en cualquier tema del sistema.
- **Compilación Limpia:** 0 errores y 0 advertencias de sintaxis con `npm run build`.

### 9. Modal "Mi Curso / Plan de Estudios" (Dashboard)
- **Modal Integrado para "Mi Curso":** Al hacer clic en la tarjeta "Mi Curso" en `PanelInicio`, se abre el modal interactivo de **Plan de Estudios** (`📖 Plan de Estudios`), siguiendo la lógica unificada de las apps del dashboard.
- **Estructura por Módulos (Acordeón):** Módulos desplegables con su número identificador, conteo dinámico de lecciones (`X/Y lecciones`), estado interactivo (`✓ Superada`, `Disponible`, `🔒 Bloqueada`) y acceso directo a cada lección.
- **Enfoque Pedagógico Puro:** Barra superior de pestañas eliminada para mantener el foco en el curso activo, y evaluaciones removidas del modal de lecciones ya que se administran y presentan de forma centralizada en el módulo de **Exámenes** (`/dashboard/evaluations`).
- **Paleta y Badges:** Estilos semánticos con badges limpios (`.badge-pill.ready` en azul institucional, `.badge-pill.done` en verde esmeralda).
- **Dock Flotante Inferior de Vista Estudiante:** Se reemplazó el banner superior naranja invasivo por un dock flotante inferior (`.impersonate-floating-dock`) con bordes redondeados (`16px`), efecto glassmorphism, resplandor ámbar sutil y botón de acción directa "Volver a Modo Admin".
- **Botón Flotante (FAB) en Lecciones:** Se removió el botón "Volver al curso" de la cabecera de la lección y se reemplazó por un Floating Action Button (`.lesson-fab-home`) en la esquina inferior izquierda con icono de inicio (`Home`) para regresar directamente a `/dashboard`.

### 10. Bloqueo de Módulos para Estudiantes (Recompensas, Widgets y Analítica)
- **Bloqueo en Dashboard ([`PanelInicio.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/pages/PanelInicio.jsx)):**
  - **Recompensas:** Bloqueado (`isLocked: !isStaff`), badge `Bloqueado` para alumnos / `${gadgets.length} gadgets` para docentes, icono con candado, paleta neutral deshabilitada y desactivación de clic.
  - **Widgets:** Bloqueado (`isLocked: !isStaff`), badge `Bloqueado` para alumnos / `8 Herramientas` para docentes.
  - **Analítica:** Bloqueado (`isLocked: !isStaff`), badge `Bloqueado` para alumnos / `Docente` para profesores, redirección protegida a `/dashboard/analytics`.
  - **Estilos Semánticos ([`PanelInicio.css`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/styles/PanelInicio.css)):** Clase `.app-hub-tile-locked` con cursor `not-allowed`, `opacity: 0.52`, filtro en escala de grises y anulación de efectos hover/transformaciones.
  - **Protección de Rutas ([`App.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/App.jsx)):** Rutas directas (`/dashboard/rewards`, `/dashboard/gadgets`, `/dashboard/my-courses/:courseId/rewards`) blindadas con `<AdminRoute>`, redirigiendo a los estudiantes automáticamente a `/dashboard`.

### 11. Corrección de Alcance en Reproductor de Exámenes ([`EvaluationPlayer.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/pages/EvaluationPlayer.jsx))
- **Diagnóstico:** Al abrir exámenes como `re-m1-eval/play` habiendo un intento previo o al mostrar resultados, la pantalla quedaba en blanco por un `ReferenceError: Cannot access 'isExamenL6' before initialization` (TDZ), ya que la constante estaba declarada más abajo en la función (línea 1209) tras los bloques de retorno anticipado (`if (showResults)`).
- **Solución:** Se movió la definición canónica de `normKey` e `isExamenL6` al encabezado del componente (`EvaluationPlayer`), permitiendo que el estado de resultados, la pantalla de revisión y el protocolo de seguridad se rendericen sin fallos en cualquier examen del sistema.
- **Verificación en Vivo:** Probado con el subagente de navegador verificando montaje exitoso, navegador de 20 preguntas de Robótica, feedback de opciones y consola limpia (0 errores).

---

## 📍 ¿Por dónde quedamos? (Punto de Parada Actual)
* **Estado:** **Proyecto Integrador de Ajedrez 3D en curso (L3 y L4 de MA-M1 construidas): `ma-m1-l3` (Modo Edición → Peón) y `ma-m1-l4` (Herramientas E/I/Bevel/Loop Cut → Torre y Alfil) con el laboratorio `ChessPieceLab.jsx`. Compilación limpia con `npm run build` (0 errores)**.
* **Siguiente Paso Inmediato (Pendientes Prioritarios):**
  - 🔧 **Continuar el Proyecto Ajedrez en M2:** Construir `ma-m2-l6` (Rey + Reina con Mirror/Subsurf/Array), `ma-m2-l7` (Caballo Hard-Surface), `ma-m2-l8` (Tablero con materiales PBR) y `ma-m2-l9` (examen 2 - entrega del set completo), según el roadmap aprobado por el usuario.
  - 📲 **Integración de Notificaciones a Grupos de WhatsApp:** Implementar backend serverless (`/functions/api/notify.js`) con proveedor UltraMsg / Evolution API (soporte para `INSTANCE_ID`, `API_TOKEN` y `GROUP_ID`), formateo automático de plantillas para convocatorias a salidas pedagógicas, nuevos proyectos CAD e insignias, switch interactivo en formularios y fallback de 1 clic vía WhatsApp Web.
  - 🔍 **Auditoría de páginas obsoletas:** Buscar y depurar páginas/rutas que ya no deberían existir por haber sido reemplazadas por modales en el Dashboard (ej. `PanelMisCursos`, `PanelEvaluaciones`, vistas legacy, etc.).
  - 🧭 **Revisión y actualización de rutas de navegación:** Revisar integralmente las rutas de navegación de cada curso (`EE`, `RE`, `MA`, `SIMI`), asegurando consistencia entre sidebar, mapa de temas, botones de retorno y modales.
  - **Subir cambios a GitHub (`git push`):** Solo cuando el usuario lo autorice explícitamente.

---

## 📁 Arquitectura y Rutas de Referencia Rápida
- **Lección 1 3D:** [`src/lessons/MA/m1/l1.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/lessons/MA/m1/l1.jsx)
- **Lección 3 3D (Peón):** [`src/lessons/MA/m1/l3.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/lessons/MA/m1/l3.jsx)
- **Lección 4 3D (Torre y Alfil):** [`src/lessons/MA/m1/l4.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/lessons/MA/m1/l4.jsx)
- **Laboratorio Ajedrez 3D:** [`src/components/simulators/3d/ChessPieceLab.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/components/simulators/3d/ChessPieceLab.jsx)
- **Viewport 3D Blender:** [`src/components/simulators/3d/BlenderViewport.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/components/simulators/3d/BlenderViewport.jsx)
- **Demostrador Coordenadas:** [`src/components/simulators/3d/CoordinateSpaceDemo.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/components/simulators/3d/CoordinateSpaceDemo.jsx)
- **Laboratorio Práctico 3D:** [`src/components/simulators/3d/PracticalLabMA1.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/components/simulators/3d/PracticalLabMA1.jsx)
- **Lección 5 Mixtos EE:** [`src/lessons/EE/m1/l5.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/lessons/EE/m1/l5.jsx)
- **Puente de Montaje Legacy:** [`src/components/lesson/legacy/LessonLegacyBridge.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/components/lesson/legacy/LessonLegacyBridge.jsx)
- **Estilos de Simuladores:** [`src/styles/ElectricitySimulators.css`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/styles/ElectricitySimulators.css)

### 12. Creación del Curso SIMI3D y Rol "Líder de Semillero"
- **Espacio Semillero SIMI3D (`SIMI` - Semillero de Investigación en Modelado e Impresión 3D):**
  - **ID:** `6`, **Abreviatura:** `SIMI`, **Color:** `#06b6d4` (Cian Manufactura Aditiva), **Director:** *Ing. Ronny Martinez Reyes*.
  - **Hub Independiente Exclusivo (`/dashboard/simi` - `PanelSimiHub.jsx`):** Entorno temático desacoplado tipo suite con **Panel Lateral Izquierdo (Sidebar Nav)** (`.simi-workspace-layout`) en lugar de barra de pestañas superior:
    - **Panel Lateral Izquierdo Dedicado:** 4 secciones de acceso directo con iconos vectoriales en cajetines cian neón, títulos y subtítulos (Rutas de Modelado, Visitas a Colegios, Banco de Proyectos, Nuestros Recursos) y tarjeta resumen táctica al fondo.
    - **8 Rutas No Lineales & Visor Interactivo de Lecciones:** Tinkercad, Blender 3D, Fusion 360, Cura, OrcaSlicer, PrusaSlicer, Impresión FDM y Resina SLA. Al pulsar **`Ingresar ➔`**, se despliega el visor interactivo con módulos formativos, tablas técnicas de termoplásticos, callouts y autoevaluación (quizzes con feedback inmediato y EXP).
    - **Insignias Tácticas (Grados I al V - 100 a 500 EXP):** Accesibles desde el botón superior derecho de cada card con modal flotante de ascensos automáticos.
    - **Banco de Proyectos & Calendario:** Módulos interactivos para registrar, editar y eliminar proyectos CAD e itinerarios STEAM con diseño estilizado de inputs y botones `Edit3` / `Trash2`.
    - **Nuestros Recursos & Inventario:** Gestión de impresoras 3D, filamentos, resinas y herramientas con persistencia local y control por roles (`leader` / `admin`).
    - **FAB Flotante de Red Social:** Acceso directo a `@semillero_simi3d` en esquina inferior derecha.
- **Rol de Plataforma "Líder de Semillero" (`leader` / `lider`):**
  - Permisos intermedios entre Docente y Estudiante: acceso completo a herramientas, widgets y analítica del grupo sin privilegios destructivos de administración ni gestión global de la base de datos.
  - Badges dedicados en Sidebar, Perfil y Panel de Plataforma con estilo cian neón.

### 13. Persistencia Cloudflare D1 en SIMI3D y Regla de Permanencia (80/80)
- **Endpoint Backend Centralizado ([`functions/api/simi.js`](file:///c:/Users/Elizabeth/Desktop/SaberLab/functions/api/simi.js)):**
  - Auto-aprovisionamiento de 5 tablas D1: `simi_eventos`, `simi_asistencias`, `simi_proyectos`, `simi_recursos`, `simi_insignias`.
  - Soporte completo para CRUD multi-usuario con fallback a datos semilla locales.
- **Separación de Asistencias (Regla del 80 / 80):**
  - Medición diferenciada de **Capacitaciones Técnicas** vs. **Visitas Pedagógicas Escolares**.
  - Validación y convalidación individual de presencia de estudiantes por parte del Líder/Docente con badge de *Presente Convalidado*.
- **Directorio de Miembros Activos ([`SimiMembersTab.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/simi/SimiMembersTab.jsx)):**
  - Listado de semilleristas y líderes con foto de Google, rol institucional, barras dobles de progreso y condecoración de *Requisito 80/80 Cumplido*.
  - Sincronización canónica en Cloudflare D1: curso `id = 6` (`abbr = 'SIMI'`) y grupo oficial `id = 6` vinculados en base de datos.

### 14. Asistentes Inteligentes SaberLab (TridiBot & ImpriBot)
- **Componente de Chat Global ([`SaberLabAiChat.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/ai/SaberLabAiChat.jsx)):**
  - Dos asistentes especializados con selector dinámico: **TridiBot** (Especialista en Modelado 3D, Blender, CAD, geometría euclidiana, mallas manifold y WebGL) e **ImpriBot** (Especialista en Impresión 3D, manufactura aditiva FDM/SLA, parámetros de filamentos y Slicers).
  - Historial independiente por bot en `localStorage`, con auto-scroll suave, renderizado de Markdown con bloques de código, tablas técnicas y botón de copiado en 1 clic.

### 15. Estabilización de IAs y Continuidad Conversacional Fluida
- **Diagnóstico:** Los bots presentaban inestabilidad y respuestas enlatadas/repetitivas debido a agotamiento de cuota de tokens (HTTP 429 Rate Limit) en Groq (`openai/gpt-oss-120b`), saldo agotado en DeepSeek (HTTP 402) y caída forzada a un script offline de respuestas fijas por regex.
- **Arquitectura de Resiliencia en Cascada ([`functions/api/ai/chat.js`](file:///c:/Users/Elizabeth/Desktop/SaberLab/functions/api/ai/chat.js)):**
  - **Pool Multi-Modelo Dinámico en Groq:** `qwen/qwen3.8-27b` (<1s latencia y alta fluidez en español) ➔ `openai/gpt-oss-20b` (bajo consumo) ➔ `openai/gpt-oss-120b` ➔ `qwen/qwen3.6-27b`. Si un modelo recibe un 429 por ráfagas, el backend salta instantáneamente al siguiente modelo en milisegundos sin interrumpir la charla.
  - **Compactación de Contexto (Context Window Optimization):** Respuestas extensas previas se resumen a 300 caracteres en el payload de entrada, reduciendo el peso del prompt a <600 tokens y evitando sobrepasar la cuota móvil de 8,000 TPM.
  - **Vías de Respaldo:** Cloudflare Workers AI nativo (`@cf/meta/llama-3.1-8b-instruct`) y motor heurístico offline local. (DeepSeek retirado por completo del stack tecnológico).
  - **System Prompts de Continuidad:** Instrucciones estrictas para no presentarse de nuevo ni reiniciar la conversación ante preguntas de seguimiento breves (*"¿seguro?"*, *"¿y si lo apago?"*, *"¿por qué?"*).
- **Experiencia de Usuario en Frontend ([`SaberLabAiChat.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/ai/SaberLabAiChat.jsx)):**
  - **Renderizador de Tablas Markdown:** Detección de tablas Markdown convirtiéndolas en elementos `<table>` HTML estilizados con cabeceras en degradé, filas alternas y scroll horizontal responsivo.
  - **Gestor de Sesiones e Historial con Títulos Decididos por la IA:** Botón `+` para iniciar conversaciones limpias desde cero sin ver mensajes viejos acumulados, y panel dedicado `Historial` para consultar, retomar o borrar conversaciones pasadas. La IA dicta y fija canónicamente el título temático técnico de cada charla en la PRIMERA LÍNEA de su respuesta (`[TITULO: ...]`), analizando la pregunta y la respuesta técnica brindada (ej: *"Significado del Código 67 en 3D"*, *"Composición del Filamento PLA"*, *"Atajos Esenciales de Blender"*). Se eliminaron las stopwords y el fallback literal de palabras crudas ("Que Es El 67"), y se implementó saneamiento retroactivo automático de títulos en `localStorage`.
  - **Modo Ancho Doble (880px):** Botón `Maximize2` / `Minimize2` en la cabecera para duplicar el ancho del chat al instante, permitiendo leer tablas anchas de múltiples columnas y código de manera panorámica.
  - **Modo Respuestas Rápidas y Breves (`⚡ Modo Breve`):** Botón en cabecera y chip interactivo sobre la barra de entrada para alternar entre modo detallado y respuestas ultra cortas (máximo 2 a 3 oraciones o viñetas al grano, sin saludos ni rodeos), reduciendo el tiempo de respuesta y consumo de tokens (`max_tokens: 350`).

### 16. Asignación Contextual de Tutores por Curso y Retiro Definitivo de DeepSeek
- **Desconexión Total de DeepSeek:** Retirado 100% de la arquitectura backend (`functions/api/ai/chat.js`), frontend (`Layout.jsx`, `SaberLabAiChat.css`) y configuraciones. Toda la inferencia corre sobre el pool balanceado de **Groq API** como primario, **Cloudflare Workers AI** como secundario y el motor heurístico local de contingencia.
- **Un Solo Bot por Curso (Sin Selector de 4 Pestañas):**
  - Se eliminó por completo el renderizado global de los 4 bots simultáneos.
  - **Curso EE (Electricidad y Electrónica):** Muestra **únicamente a ElectroBot ⚡** en la cabecera y cuerpo de mensajes, sin pestañas distractoras.
  - **Curso RE (Robótica Educativa):** Muestra **únicamente a RoboBot 🤖**.
  - **Curso MA (Modelado y Animación 3D):** Muestra **únicamente a TridiBot 🧊**.
  - **Semillero SIMI3D:** Despliega el **selector dual exclusivo de especialidades de SIMI**: *TridiBot (Modelado 3D)* e *ImpriBot (Impresión 3D)*.
- **Sincronización Reactiva:** Detección unificada por ruta activa (`location.pathname`), curso seleccionado en la plataforma (`saberlab_active_course`) y curso matriculado. Emisión y escucha reactiva del evento `saberlab_course_changed` para que al cambiar de curso en el dashboard, el chat se sincronice de inmediato al tutor correspondiente.

### 17. Erradicación Integral de Signos LaTeX y Notación Matemática Limpia en Todos los Bots
- **Diagnóstico:** Los modelos de lenguaje emitían fórmulas cuantitativas con sintaxis LaTeX cruda (`$...$`, `$$...$$`, `\frac{...}{...}`, `\cdot`, `\Omega`, `\text{}`), produciendo signos distractores y fórmulas fragmentadas sin formato visual legible en el chat. Asimismo, las skills en `.agents/skills/` contenían expresiones matemáticas con delimitadores `$`, induciendo al modelo a imitar esa sintaxis.
- **Saneamiento Total de Skills (`.agents/skills/`):** Se eliminaron al 100% todos los signos `$` y comandos LaTeX de `electrobot-tutor/SKILL.md`, `robobot-tutor/SKILL.md`, `impribot-tutor/SKILL.md` y `simibot-conversational-memory/SKILL.md`, reemplazándolos por notación técnica directa UTF-8 (`V = I · R`, `f = 1.44 / ((R1 + 2·R2) · C1)`, `Req`, `40 mA`, `Tg`).
- **Instrucción Estricta en Prompts de Sistema (4 Bots):** Prohibición taxativa de sintaxis LaTeX y signos de dólar en los 4 prompts (`SYSTEM_ELECTROBOT_PROMPT`, `SYSTEM_ROBOBOT_PROMPT`, `SYSTEM_TRIDIBOT_PROMPT`, `SYSTEM_IMPRIBOT_PROMPT`). Obligación de usar caracteres UTF-8 nativos: `Ω`, `kΩ`, `·`, `/`, `10⁻⁶`, `°C`, `mm/s`.
- **Motor Sanitizador y Conversor Automático de Alta Resiliencia (`cleanLatexMathString`):** Implementado y sincronizado de forma idéntica en backend (`functions/api/ai/chat.js`) y frontend (`SaberLabAiChat.jsx`):
  - **Algoritmo de balanceo de llaves:** Parsea fracciones complejas anidadas `\frac{V_{cc} - V_{led}}{I_{led}}` o `\frac{\frac{A}{B}}{C}` sin truncamientos (`(A) / (B)`).
  - Soporta bloques `\[ ... \]` y `$$ ... $$` convirtiéndolos en tarjetas callout destacadas (`> 📐 **Fórmula:** ...`).
  - Soporta delimitadores elásticos `\left(`, `\right)`, raíces `\sqrt{x}` (`√(x)`), exponentes `10^{-6}` (`10⁻⁶`) y subíndices `R_{eq}` (`Req`).
  - Comandos `\text{...}`, `\mathrm{...}` y símbolos `\Omega`, `\cdot`, `\times`, `\approx`, `\mu` se convierten a símbolos directos (`Ω`, `·`, `×`, `≈`, `µ`).
  - **Barrido de seguridad infalible:** Se eliminan forzosamente todos los signos de dólar (`$`) y barras residuales (`\`), garantizando que **ningún signo extraño** se filtre al usuario.
  - Sanitización retroactiva de mensajes previamente guardados en `localStorage` o base de datos D1.
- **Verificación en Vivo Multi-Asistente:** Probado en tiempo real con preguntas cuantitativas complejas en los 4 bots (NE555 astable en EE, resistencia LED en RE, aspecto 16:9 en MA y caudal de PETG en SIMI), confirmando **0 signos $** y **0 comandos LaTeX**.
- **Compilación:** Verificado con `npm run build` (0 errores en 6.34s). Cumplida regla de no ejecutar `git push` sin orden explícita.

### 18. Protocolo Empático ante Límite de Cuota o Saturación de APIs (Anti-Error 429)
- **Diagnóstico y Requerimiento:** Si las APIs de inferencia (Groq o Workers AI) se saturan o alcanzan su límite temporal de tokens (HTTP 429 Rate Limit / Quota Exceeded), mostrar mensajes técnicos de error rompía la experiencia pedagógica del estudiante.
- **Detección Activa de Límite:** El backend (`functions/api/ai/chat.js`) rastrea los errores HTTP 429 y tokens por minuto en todo el pool de modelos.
- **Mensaje Empático del Asistente:** En caso de saturación, el bot responde con un tono empático y humano:
  > *"Me siento al límite de mi capacidad en este momento ⚡🤖. He atendido muchísimas consultas de estudiantes y mis circuitos necesitan un breve momento para recargar energía. Lamento no poder ayudarte ahora mismo con esta respuesta..."*
- **Tarjeta Adaptativa con Botones Directos (`.saberlab-out-of-scope-card.rate-limited`):**
  - Cabecera ámbar con icono `Zap`: `⚡ LÍMITE DE CAPACIDAD ALCANZADO`.
  - Explicación amable para el estudiante: *"El asistente se encuentra temporalmente al tope de su cuota de uso. Para no detener tu aprendizaje, puedes resolver tu duda ahora mismo en:"*.
  - Botones estilizados con acceso directo:
    - **Consultar en Gemini:** Enlace directo a Google Gemini.
    - **Consultar en ChatGPT:** Enlace directo con la pregunta original del usuario pre-cargada en la barra de consulta (`?q=...`).
- **Resiliencia en Frontend (`SaberLabAiChat.jsx`):** Si una petición falla por red o retorna 429, el frontend atrapa el estado y despliega inmediatamente la tarjeta empática sin mostrar alertas crudas ni mensajes rotos.
- **Compilación:** Verificado con `npm run build` (0 errores en 10.10s).

### 19. Modo Flash (Respuestas Rápidas) con Estética Visual Amarillo-Rojo Eléctrico
- **Optimización de Espacio y Altura de Escritura:**
  - Se eliminó el botón duplicado de `⚡` junto al textarea para recuperar ancho horizontal completo, dejando el control de activación centralizado en el encabezado (`saberlab-ai-header-actions`) con resplandor animado `brief-active`.
  - Altura del textarea incrementada (`min-height: 52px`, `padding: 12px 16px`, `line-height: 1.5`, `max-height: 160px`) con auto-expansión dinámica en tiempo real según el contenido escrito y restablecimiento automático al enviar.
  - Placeholder simplificado y sin desbordamientos: `⚡ Pregunta rápida a [Bot]...`.
- **Estética Flash en el Input (`.saberlab-ai-textarea.flash-input`):**
  - **Paleta de Colores:** Transición viva entre amarillo ámbar (`#f59e0b`, `#fde68a`) y rojo vibrante (`#ef4444`).
  - **Aura y Resplandor Animado (`@keyframes flashInputPulse`):** Pulso dinámico de sombras y bordes entre dorado y rojo fuego.
  - **Botón de Envío Flash (`.saberlab-ai-send-btn.flash-send`):** Gradiente `linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)` con tamaño proporcional (`44px`).
  - **Soporte de Tema Oscuro:** Fondo carbón cálido `#1c1917` con borde amarillo dorado y resplandor rojo fuego.
- **Compilación:** Verificado con `npm run build` (0 errores en 9.49s). Cumplida regla de no ejecutar `git push` sin orden explícita.

### 20. Hub de Fuentes, Herramientas Web & IA 3D en Semillero SIMI3D
- **Catálogo Integrado (`SIMI_WEB_RESOURCES` en `simiData.js`):** 9 herramientas y plataformas clave curadas para el semillero:
  - **Repositorios & Modelos 3D:** MakerWorld (Bambu Lab) y Banco de Tests de Calibración MakerWorld.
  - **Calibración & Afinación de Máquinas:** Test de Flujo Volumétrico (15-30 mm³/s) y Teaching Tech 3D Calibration Suite (guía interactiva de E-steps, retracción, temperatura y PID).
  - **MakerLab Paramétrico:** MakerLab Image to 3D, MakerLab Image to Keychain (llaveros rápidos para colegios) y Suite MakerLab de herramientas paramétricas.
  - **Inteligencia Artificial 3D:** Meshy.ai (generador con texturas PBR completas) y Tripo3D (generación ultrarrápida en < 10s).
- **Sub-Pestañas en Nuestros Recursos (`SimiResourcesTab.jsx`):**
  - **Inventario Físico & Taller:** Control de impresoras FDM/SLA, filamentos, resinas e insumos con métricas en tiempo real.
  - **Fuentes & Herramientas Web:** Buscador reactivo en vivo, filtro dinámico por 4 categorías, tarjetas interactivas con badges, tags, dominio y botón de apertura segura en nueva pestaña (`_blank`).
- **Acceso Rápido en Inicio de SIMI (`PanelSimiHub.jsx`):**
  - Card destacada en el inicio con píldoras de acceso directo a las herramientas recomendadas y enlace con cambio automático de sub-pestaña a `web`.
- **Estilos Semánticos (`SimiResources.css` & `SimiHome.css`):** 100% compatibles con tema claro y tema oscuro mediante variables semánticas puras.
- **Compilación:** Verificado con `npm run build` (0 errores en 14.90s). Cumplida regla de no ejecutar `git push` sin orden explícita.

### 21. Blindaje Integral de Invitaciones y Asignación Estricta de Cursos
- **Diagnóstico y Causa Raíz:**
  - Enlaces de invitación compartidos días atrás expiraban (`expires_at`), pero la página `/join?code=XYZ` mostraba el botón de Google habilitado sin verificar la vigencia del código.
  - Al autenticar con Google, el callback (`functions/api/auth/callback.js`) insertaba al estudiante en `perfiles` y en `solicitudes_acceso` como `pending`. Al aprobarlo el docente, el alumno quedaba en la base de datos sin grupo ni matrícula.
  - En `PanelInicio.jsx`, la ausencia de cursos matriculados activaba un fallback forzado a `COURSES_DEFINITION[0]` (Electricidad y Electrónica Básica), haciendo creer al estudiante huérfano que pertenecía a esa materia.
- **Validación Previa Pública (`functions/api/enrollments/code.js`):**
  - Implementado `onRequestGet({ request, env })` público (habilitado en `functions/api/_middleware.js`).
  - Valida el código contra `codigos_grupo`, coteja contra `expires_at` y devuelve si está vigente o expirado con los datos del curso y grupo.
- **Guardia Anti-Huérfanos en Backend (`functions/api/auth/callback.js`):**
  - Si un usuario nuevo intenta registrarse con Google y no tiene un código de invitación verificado y vigente: **NO se crea perfil y NO se crea solicitud en `solicitudes_acceso`**, redirigiendo inmediatamente a `/join?error=expired&code=...`.
  - Si el código es válido y vigente, se crea el perfil, se inscribe atómicamente en `grupos_usuario` e `inscripciones`, y se auto-aprueba de inmediato en `solicitudes_acceso`.
- **Bloqueo y Feedback en Frontend (`JoinCourse.jsx`):**
  - Al ingresar con un enlace o escribir un código, se valida en tiempo real.
  - Si el código expiró o no existe: se muestra la advertencia `⛔ Enlace de Invitación Expirado` y **el botón de Google queda 100% bloqueado/oculto**, impidiendo cualquier registro inválido.
  - Se detallan instrucciones para que el docente renueve el enlace con "Dar más tiempo" desde el panel.
  - Si el código es válido, se muestra el nombre del curso y grupo oficial, y se habilita el inicio de sesión.
- **Eliminación de Cursos por Defecto (`PanelInicio.jsx`):**
  - Eliminado el fallback a Electricidad para estudiantes sin cursos matriculados.
  - Si un estudiante no tiene cursos, el Dashboard muestra una tarjeta limpia de bienvenida con un campo para ingresar su código de clase y unirse directamente.
- **Asignación Rápida de Huérfanos (`CourseInviteManager.jsx`):**
  - Selector `[ ➕ Asignar a Grupo... ▾ ]` en el panel docente de "Grupos y Enlaces" para matricular con 1 solo clic a estudiantes no asignados (`pedroangel199909@gmail.com`, `carlosmmartinezo17@gmail.com`, etc.) a su grupo oficial (`EE-2026II`, `RE-2026II`, `SIMI 2026II`).
- **Verificación:** Probado exhaustivamente con el subagente de navegador (`browser_subagent`) validando el bloqueo de Google ante enlaces expirados, y compilación limpia con `npm run build` (0 errores). Prohibido `git push` sin autorización previa.

---

### 22. Nueva Portada Principal V2 ("The Living STEAM Campus") y Respaldo V1
- **Respaldo Íntegro de la Versión 1 (`src/pages/v1/`):**
  - Componente respaldado: [`src/pages/v1/Landing.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/pages/v1/Landing.jsx).
  - Hoja de estilos respaldada y desacoplada: [`src/pages/v1/Landing.css`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/pages/v1/Landing.css).
  - Componente 100% autocontenido e independiente para consulta o restablecimiento futuro.
- **Arquitectura de la Nueva Portada V2 ([`src/pages/Landing.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/pages/Landing.jsx) & [`src/styles/Landing.css`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/styles/Landing.css)):**
  - **Header Institucional:** Logo con glow, branding *Campus STEAM*, navegación a secciones clave y botones directos `Tengo un Código 🔑` (a `/join`) e `Ingresar ➔` (a `/login`).
  - **Hero Section:** Titular en degradé cyber-elegante (*"Revoluciona tu forma de aprender creando y experimentando en vivo"*), subtítulo de alto impacto, CTAs dobles y barra de estadísticas flotante (+4 Cursos, 100% Simuladores en vivo, 4 Bots IA, 0 ms Instalación).
  - **Showcase Interactivo Central ("El Laboratorio Vivo"):**
    - **⚡ Electricidad:** Circuito SVG reactivo con animación de electrones, halo dinámico en lámpara y botón/hitbox interactivo para abrir/cerrar el lazo con telemetría en vivo ($V_T$, $I_T$, $P_T$, estado de conducción).
    - **🤖 Robótica:** Consola de firmware Arduino C++ con simulación en tiempo real de salidas PWM/digitales en PIN 13, parpadeo de LED y monitor serial.
    - **🧊 Modelado 3D:** Espacio cartesiano euclídeo Z-Up de Blender 4.x con cubo 3D isométrico rotando, cuadrícula de piso, toggles sólido/wireframe y badges de atajos `G`, `R`, `S`.
    - **🖨️ Semillero SIMI3D:** Selector dinámico de materiales (PLA 210°C, PETG 240°C, TPU 225°C), telemetría de boquilla y cama caliente, y visor de rebanador con capas de impresión aditiva animadas.
  - **Grid Bento de Carreras STEAM:** Tarjetas detalladas para Electricidad (`EE`), Robótica (`RE`), Modelado 3D (`MA`) y Semillero SIMI3D (`SIMI`).
  - **Suite de 4 Tutores IA:** Presentación visual socrática de ElectroBot, RoboBot, TridiBot e ImpriBot.
  - **Evaluaciones Seguras & Live Lobby:** Muestra gráfica del protocolo anti-copia y sala de supervisión docente en tiempo real.
  - **Banner Final de Llamado a la Acción & Footer Institucional:** Enlaces directos a Google Auth, canje de códigos y pie de página completo con redes sociales.
- **Verificación:** Probado y validado en navegador con `browser_subagent` y compilación limpia con `npm run build` (0 errores). Prohibido `git push` sin autorización previa.

### 23. Catálogo de Servicios, Portafolio STEAM y Cotizador en SIMI3D
- **3 Ejes de Servicios Implementados ([`SimiServicesTab.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/simi/SimiServicesTab.jsx) & [`simiData.js`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/data/simiData.js)):**
  - **🎓 Capacitaciones STEAM por Edades:**
    - *Semillero Junior (Primaria · 7 a 11 años):* Tinkercad 3D, figuras didácticas y geometría espacial.
    - *Creativos STEAM (Secundaria · 12 a 17 años):* Blender 3D, laminadores Cura/Orca y prototipado FDM.
    - *Formación Técnica & Universitaria (Pregrado / Egresados):* Fusion 360 paramétrico, ensambles mecánicos y tolerancias DFAM.
    - *Formación Docente (Train the Trainers):* Integración curricular STEAM y gestión de Aula Maker.
  - **🖨️ Fabricación Digital & Prototipado:**
    - *Impresión FDM:* Termoplásticos PLA+, PETG, ABS, TPU y Fibra de Carbono.
    - *Impresión SLA Resina UV:* Ultra precisión 4K/8K para miniaturas, joyería y odontología.
    - *Ingeniería Inversa & Escaneo 3D:* Digitalización y reconstrucción de piezas CAD (configurado en estado `hidden` / oculto por defecto).
  - **🔧 Servicio Técnico & Mantenimiento:**
    - *Mantenimiento Preventivo:* Calibración de cama, lubricación de guías lineales y ajuste térmico PID.
    - *Mantenimiento Correctivo & Reparación:* Desatascos, cambio de termistores, boquillas y extrusores.
    - *Actualizaciones & Optimización (Upgrades):* Firmware Klipper/Marlin, extrusión directa y bases PEI (configurado en estado `hidden` / oculto por defecto).
- **Control de Visibilidad en Vivo (Docente / Líder):**
  - Botones de 1 clic en cada tarjeta para alternar entre: `Visible` (`active`), `Ocultar` (`hidden`) y `Bloquear` (`locked` con candado y badge "Próximamente").
  - Los servicios ocultos no son visibles para estudiantes ni en vista previa de estudiante.
- **Cotizador Orientativo de Impresión 3D:**
  - Calculadora interactiva con selección de tecnología/material (PLA+, PETG, TPU, Resina SLA), control deslizante de peso (10g a 500g) e infill (15% a 100%).
  - Botón directo que genera una solicitud preformateada en WhatsApp con el presupuesto estimado y opción para enviar el archivo `.STL`/`.STEP`.
- **Persistencia Cloudflare D1 ([`functions/api/simi.js`](file:///c:/Users/Elizabeth/Desktop/SaberLab/functions/api/simi.js)):**
  - Tabla `simi_servicios` auto-creada con soporte para campos de audiencia, especificaciones JSON, estados y precios.
  - Endpoints CRUD (`save-service`, `toggle-service-status`, `delete-service`, `sync-all-services`).
- **Compilación:** Verificado con `npm run build` (0 errores en 9.22s). Cumplida regla de no ejecutar `git push` sin orden explícita.

### 24. Proyecto Integrador de Ajedrez 3D (Módulos 1 y 2 del Curso MA)
- **Roadmap Aprobado por el Usuario (sin eliminar lo existente):**
  - **M1:** `ma-m1-l3` → **El Peón** (Modo Edición, terna V-E-F, topología, revolución de perfil) · `ma-m1-l4` → **La Torre 🏰 y el Alfil 🛕** (Extrude E, Inset I, Bevel Ctrl+B, Loop Cut Ctrl+R). M1·l5 = Examen 1.
  - **M2:** `ma-m2-l6` → **Rey + Reina** (Mirror, Subdivision Surface, Array) · `ma-m2-l7` → **Caballo** (Hard-Surface) · `ma-m2-l8` → **Tablero** (escaques ×64 con materiales PBR) · `ma-m2-l9` = Examen 2 (entrega del set completo).
  - **Retos extra por lección:** trencito de juguete 🚂, jarrones 🏺, cuencos y fichas personalizadas con las mismas técnicas.
- **Lección 3 (`ma-m1-l3` - [`src/lessons/MA/m1/l3.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/lessons/MA/m1/l3.jsx)):** "Modo Edición y Topología Poligonal — Proyecto: El Peón". Contenido 3.0 Proyecto Integrador, 3.1 Modo Objeto vs Modo Edición (Tab), 3.2 Selección por componentes (1/2/3), 3.3 Revolución de perfil (modificador Screw), 3.4 Topología limpia (quads, evitando estrellas, flujo de aristas). 10 flashcards y quiz de 10 preguntas (`timePerQuestion: 20`, `requiredScorePercent: 80`).
- **Lección 4 (`ma-m1-l4` - [`src/lessons/MA/m1/l4.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/lessons/MA/m1/l4.jsx)):** "Herramientas de Modelado Esenciales — Proyecto: Torre y Alfil". Extrusión (E + Z, E + S), Inset (I), Bevel (Ctrl + B + rueda), Loop Cut (Ctrl + R), flujo Loop Cut → Extrude para almenas y tabla maestra de atajos. 10 flashcards y quiz de 10 preguntas.
- **Laboratorio Nuevo ([`ChessPieceLab.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/components/simulators/3d/ChessPieceLab.jsx)):** Constructor didáctico 3D sobre Three.js (react 0.185):
  - **Revolución real de perfiles** con `LatheGeometry` (convención Z-Up tras `rotateX`), selector de pieza (Peón/Torre/Alfil), slider de segmentos radiales (Loop Cut 8–48), toggles de Sombreado Suave (Bevel), detalle extra por pieza y Almenas para la Torre.
  - **Telemetría V-E-F en vivo** (vértices, aristas y caras exactos calculados del index buffer, con fallback para mallas no indexadas).
  - **15 retos guiados** (5 por pieza) con auto-validación, confetti, persistencia en `localStorage` (`practical_progress_ma-m1-l3`) y **pestaña Sandbox Libre** con panel de exploración propio y acceso directo a la hoja de ruta.
  - Registrado en [`LessonLegacyBridge.jsx`](file:///C:/Users/Elizabeth/Desktop/SaberLab/src/components/lesson/legacy/LessonLegacyBridge.jsx) bajo el contenedor `chess-piece-lab-container` (compartido por l3 y l4).
- **Metadatos:** `coursesData.jsx` conectó `load` de `ma-m1-l3` y `ma-m1-l4` a sus archivos, y actualizó los `topics` del Módulo 1 con referencias aditivas al proyecto (sin eliminar los temas existentes).
- **Compilación:** Verificado con `npm run build` (0 errores en ~9–12s). Cumplida regla de no ejecutar `git push` sin orden explícita.

### 25. Separación Canónica de Canales: Aprobaciones de Acceso, Notificaciones Académicas y Avisos SIMI3D
- **Diagnóstico y Requerimiento:**
  - El sistema mezclaba en una sola bandeja las **Solicitudes de Acceso pendientes** de nuevos alumnos, las **Notificaciones Académicas** (exámenes, avisos docentes, logros) y las **Misiones/Proyectos de SIMI3D**.
  - En la barra lateral (`Sidebar.jsx`) y el inicio (`PanelInicio.jsx`), la insignia de *Notificaciones* mostraba `pendingAccessRequestsCount`, haciendo que la campana académica reflejara solicitudes de seguridad en vez de avisos para el usuario.
  - En `functions/api/simi.js`, la acción de borrado masivo eliminaba todas las notificaciones del usuario de forma indiscriminada (incluyendo recordatorios de exámenes).
- **Arquitectura de 3 Canales Desacoplados:**
  1. **Canal 1: Aprobaciones y Accesos (Security & Admissions):**
     - Desacoplado 100% de la tabla `notificaciones`. `functions/api/_lib/access-notifications.js` dejó de insertar registros de correo/alerta para administradores, evitando spam en su bandeja de entrada.
     - Gestión centralizada en [`AdminAccessRequestsBubble.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/layout/AdminAccessRequestsBubble.jsx), montado de forma global en [`Layout.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/layout/Layout.jsx) para administradores (burbuja flotante púrpura con contador y aprobación inmediata en 1 clic).
     - Acceso dedicado en [`Sidebar.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/layout/Sidebar.jsx) bajo el menú DOCENTE/ADMIN: `Solicitudes` con icono `UserCheck` y badge de solicitudes pendientes.
     - Tarjeta propia en [`PanelInicio.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/pages/PanelInicio.jsx) (`Solicitudes` con degradé púrpura/índigo) independiente de la campana.
     - Removido el banner de solicitudes de [`PanelNotificaciones.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/pages/PanelNotificaciones.jsx).
  2. **Canal 2: Notificaciones Académicas SaberLab (Cursos EE, RE, MA):**
     - [`functions/api/notifications.js`](file:///c:/Users/Elizabeth/Desktop/SaberLab/functions/api/notifications.js) soporta filtrado por canal (`?channel=academic`). Excluye de forma estricta proyectos CAD, eventos y misiones de SIMI, así como textos administrativos de solicitudes.
     - El generador automático de exámenes (10, 5, 2 y 0 días) se ejecuta exclusivamente en el canal académico.
     - Marcar como leídas y borrado (soft-delete `is_dismissed = 1`) opera exclusivamente sobre los avisos académicos del usuario.
     - [`AuthContext.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/context/AuthContext.jsx) consulta `channel=academic`, alimentando `unreadNotificationsCount` con telemetría pura del aula.
  3. **Canal 3: Centro de Misiones & Operaciones SIMI3D:**
     - En [`functions/api/simi.js`](file:///c:/Users/Elizabeth/Desktop/SaberLab/functions/api/simi.js), las asignaciones de proyectos CAD e insignias ahora se guardan con `channel = 'simi'`.
     - El borrado de notificaciones en `simi.js` ahora es un soft-delete aislado a `channel = 'simi'`, blindando los recordatorios de examen de los estudiantes.
     - En [`PanelSimiHub.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/pages/PanelSimiHub.jsx), se integró el botón **`Avisos & Misiones`** en el sidebar lateral cian y en el menú móvil con su propio contador de insignias no leídas (`simiUnreadCount`).
     - [`SimiNotificationsModal.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/simi/SimiNotificationsModal.jsx) se conecta directamente a `/notifications?channel=simi` para una gestión autónoma dentro del Semillero.
     - **Depuración UX:** Se retiró el botón secundario *"Cotizador Orientativo (Impresión 3D & Talleres)"* del panel lateral y del menú móvil de SIMI Hub a petición del usuario, dejando el espacio lateral limpio y enfocado exclusivamente en las misiones, estatutos y gestión del semillero.
- **Compilación:** Verificado con `npm run build` (0 errores en 9.49s). Prohibido `git push` sin autorización explícita.

### 26. Limpieza y Descongestión de FABs Flotantes en Esquina Inferior Derecha
- **Diagnóstico:**
  - La esquina inferior derecha acumulaba hasta 5 botones flotantes simultáneos (Burbuja flotante de Solicitudes de Acceso, WhatsApp SIMI, Instagram SIMI, FAB Lápiz de Modo Gestión, FAB Ojo de Ver como Alumno y el Tutor IA de SaberLab), generando colisiones visuales y solapamientos sobre el asistente de IA.
- **Acciones Realizadas:**
  - **Retiro de FAB Solicitudes de Acceso:** Se eliminó la burbuja flotante púrpura (`AdminAccessRequestsBubble.jsx`), centralizando la gestión de admisiones en la tarjeta dedicada de [`PanelInicio.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/pages/PanelInicio.jsx) y el elemento del menú en [`Sidebar.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/layout/Sidebar.jsx).
  - **Retiro de Botones Sociales Flotantes:** Se eliminaron los FABs flotantes de **WhatsApp** (`.simi-whatsapp-fab`) e **Instagram** (`.simi-instagram-fab`) de [`PanelSimiHub.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/pages/PanelSimiHub.jsx) y su CSS asociado en [`PanelSimiHub.css`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/styles/PanelSimiHub.css).
  - **Retiro de FAB Lápiz (Modo Gestión):** Se eliminó el botón flotante global `.global-managemode-fab` (`<Edit3 />`) de [`Layout.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/layout/Layout.jsx) y [`Layout.css`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/styles/Layout.css), manteniendo la activación del modo gestión en sus cabeceras contextuales específicas.
  - **Resultado:** La interfaz queda limpia con solo el Tutor IA de SaberLab y el toggle de vista de estudiante (`global-viewmode-fab`) sin obstrucciones ni solapamientos.
- **Compilación:** Verificado con `npm run build` (0 errores en 5.39s). Prohibido `git push` sin autorización explícita.

### 27. Integración del Logo Oficial SIMI 3D (`/badges/Logo_SIMI.webp`)
- **Diagnóstico y Requerimiento:**
  - La identidad gráfica del Semillero SIMI3D utilizaba una imagen externa de hosting (`https://i.postimg.cc/6794HFnS/simi3d.jpg`) susceptible a latencia o caídas de servidor externo.
  - Se solicitó emplear el activo local institucional ubicado en `public/badges/Logo_SIMI.webp`.
- **Acciones Realizadas:**
  - **Panel Lateral SIMI Hub ([`PanelSimiHub.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/pages/PanelSimiHub.jsx)):** Se actualizó el encabezado de marca `.simi-sidebar-brand-img` para consumir `/badges/Logo_SIMI.webp` con `object-fit: contain` y padding optimizado en [`PanelSimiHub.css`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/styles/PanelSimiHub.css).
  - **Modal de Reglas y Estatutos:** Se integró el logo oficial en el encabezado del modal de estatutos SIMI3D.
  - **Menú Móvil Desplegable:** Se incorporó el isotipo institucional en la cabecera del sheet de opciones móviles de SIMI Hub.
  - **Definición Canónica de Cursos ([`coursesData.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/data/coursesData.jsx)):** Se asoció la propiedad `logo: '/badges/Logo_SIMI.webp'` y `badgeImageUrl` al curso ID 6 (SIMI).
- **Compilación:** Verificado con `npm run build` (0 errores en 14.66s). Prohibido `git push` sin autorización explícita.

### 28. Corrección de Pantalla en Blanco al Generar Enlaces de Invitación (`CourseInviteManager.jsx`)
- **Diagnóstico:**
  - Al generar un código o enlace temporal de auto-inscripción (`handleCreateLinkSubmit`), el sistema generaba el código, lo copiaba al portapapeles con `handleCopy`, y ejecutaba `setActiveTab('links')`.
  - Al cambiar la pestaña a `'links'`, el componente intentaba renderizar la lista de códigos consultando `filteredCodes.length` y mapeando `filteredCodes.map(...)`.
  - Sin embargo, `filteredCodes` nunca había sido declarado en el componente, provocando un error en tiempo de ejecución: `ReferenceError: filteredCodes is not defined`.
  - React, al no tener un ErrorBoundary local en el modal, desmontaba completamente el componente, haciendo que el modal se cerrara y toda la interfaz quedara en blanco.
  - Adicionalmente, el botón de proyección QR en la vista de tarjetas invocaba `openProjectorModal`, el cual tampoco estaba definido.
- **Acciones Realizadas:**
  - **Definición de `filteredCodes` ([`CourseInviteManager.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/admin/CourseInviteManager.jsx)):** Implementado con `useMemo` filtrando por curso (`selectedCourseFilter`), estado activo/expirado (`statusFilter`) y búsqueda de texto (`searchQuery` por código, grupo o nombre de curso).
  - **Definición de `openProjectorModal`:** Función conectada a `setProjectorCode` con resolución segura de metadatos de curso y grupo para el proyector de videobeam.
  - **Blindaje con ErrorBoundary ([`InviteLinksModalContent.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/dashboard/modals/InviteLinksModalContent.jsx)):** Se envolvió `CourseInviteManager` en un `InviteErrorBoundary` para capturar cualquier fallo de renderizado y mostrar un estado de recuperación amigable con botón "Reintentar" en lugar de pantalla en blanco.
- **Compilación:** Verificado con `npm run build` (0 errores en 5.81s). Prohibido `git push` sin autorización explícita.

### 29. Persistencia en Cloudflare D1 de Visibilidad de Apps del Dashboard y Corrección de Bloqueos para Estudiantes
- **Diagnóstico:**
  - Al comparar la pantalla del docente en *Modo Vista de Estudiante* frente a la de un estudiante real en su dispositivo móvil (*"I.E.D MOSQUITO"*), el estudiante veía **todos los módulos desbloqueados y visibles** (incluyendo *Exámenes*, *Calificaciones*, *Componentes*, *Recompensas* y la tarjeta de *Analítica Docente*), mientras que en la pantalla del docente aparecían bloqueados con candado u ocultos.
  - **Causa Raíz:**
    1. **Falta de persistencia en base de datos:** El estado de los botones de 3 estados (*Visible*, *Bloqueado*, *Oculto*) operaba únicamente sobre `localStorage.setItem('saberlab_app_visibility_map')` en el navegador del docente. El dispositivo del estudiante tenía su propio `localStorage` vacío (`{}`), provocando que todas las apps adoptaran el estado por defecto abierto (`'unlocked'`).
    2. **Fuga de permisos en Analítica:** La tarjeta `Analítica` (*"Cohorte docente, estadísticas y rendimiento"*) figuraba incondicionalmente en `herramientasApps` de [`PanelInicio.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/pages/PanelInicio.jsx), expuesta a estudiantes aunque la ruta subyacente `/dashboard/analytics` estuviese protegida por `<AdminRoute>`.
    3. **Limitación de API:** En [`functions/api/visibility.js`](file:///c:/Users/Elizabeth/Desktop/SaberLab/functions/api/visibility.js), la validación `if (!course_id)` rechazaba el ID `0` (usado para la configuración global de apps del dashboard) y limitaba las modificaciones exclusivamente a usuarios con rol `admin` estricto en vez de todo el personal docente (`isStaff`).
- **Acciones Realizadas:**
  - **Ampliación de API D1 ([`functions/api/visibility.js`](file:///c:/Users/Elizabeth/Desktop/SaberLab/functions/api/visibility.js)):**
    - Se permitió el acceso a todo el cuerpo docente (`isStaff`: `admin`, `teacher`, `docente`, `profesor`, `leader`, `semillero_leader`).
    - Se adaptó la comprobación `if (course_id === undefined || course_id === null)` permitiendo registrar `course_id: 0` en la tabla `visibilidad_curso` de Cloudflare D1 para albergar la visibilidad global de las apps del Dashboard.
  - **Sincronización Bidireccional en Vivo ([`PanelInicio.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/pages/PanelInicio.jsx)):**
    - `appVisibilityMap` ahora inicializa desde la caché y el payload de D1 (`lessonVisibility[0]`), con fallback a `localStorage` y valores por defecto seguros (*Exámenes*, *Calificaciones* y *Componentes* bloqueados; *Recompensas* oculta).
    - `useEffect` sincroniza reactivamente cualquier cambio del servidor en tiempo real. Si la base de datos está vacía, migra automáticamente la configuración del docente a D1.
    - `cycleAppVisibility` actualiza de forma instantánea la UI (optimistic UI) y envía `POST /api/visibility` con `course_id: 0` para que el cambio aplique inmediatamente a todos los alumnos conectados.
  - **Blindaje de Analítica Docente:**
    - Se condicionó la presencia de la app `analytics` con `...(isStaff ? [{ id: 'analytics', ... }] : [])`, garantizando que ningún estudiante pueda visualizar la tarjeta de analítica docente en su panel de inicio.
- **Compilación:** Verificado con `npm run build` (0 errores en 11.31s). Prohibido `git push` sin autorización explícita.