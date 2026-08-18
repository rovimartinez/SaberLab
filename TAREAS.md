# SaberLab - Lista de Tareas y Backlog

## 🟢 COMPLETADO RECIENTEMENTE (Módulo 1 EE)
- [x] **Lección 1 (`ee-m1-l1`):** Átomos, conductores/aislantes, modelo atómico y retos prácticos.
- [x] **Lección 2 (`ee-m1-l2`):** Ley de Ohm/Watt, analogía hidráulica, simulador AC/DC y retos.
- [x] **Lección 3 (`ee-m1-l3`):** Circuitos Serie, simulador con interruptores, reductor visual y retos.
- [x] **Lección 4 (`ee-m1-l4`):** Circuitos Paralelo, simulador multirama, reductor visual y retos.
- [x] **Lección 5 (`ee-m1-l5`):** Circuitos Mixtos Serie-Paralelo completos con simulador y retos.
- [x] **Lección 6 / Examen 1 (`ee-m1-l6` - 150 pts totales):**
  - [x] **Parte Teórica (60 pts):** 30 preguntas de opción múltiple conceptuales y contextuales sin cálculos (2 pts c/u).
  - [x] **Parte Práctica (90 pts):** Laboratorio interactivo [`PracticalLabL6.jsx`](file:///c:/Users/Elizabeth/Desktop/SaberLab/src/components/simulators/electricity/PracticalLabL6.jsx) con circuito mixto de 8 resistencias ($24\text{V}$, $R_1$-$R_8$), cálculo de $R_T$, $I_T$, $P_T$, 8 voltajes, 6 corrientes de rama, paso reductor intermedio y guía de reducción paso a paso con persistencia en D1.
- [x] **Simulador de Recompensas (`CircuitSimulator.jsx`):**
  - [x] 4 topologías seleccionables (Serie, Paralelo, Mixto A, Mixto B).
  - [x] Selector de cargas (Bombillas incandescentes con brillo vs. Resistores cerámicos con código de colores).
  - [x] Switches individuales por rama y telemetría de $R_{eq}, I_T, P_T$.

---

## 🔴 PRIORIDAD INMEDIATA (Próximos Pasos)
- [ ] **Módulo 2 (`EE-M2` - Examen 2: 28 de sep 2026, 125 pts):**
  - [ ] Lección 7 (`ee-m2-l7`): Capacitores y Almacenamiento de Energía ($100\,\text{nF}, 10\,\mu\text{F}, 100\,\mu\text{F}$).
  - [ ] Lección 8 (`ee-m2-l8`): Bobinas, Diodos 1N4007, Relé 5V y Motores DC.
  - [ ] Lección 9 (`ee-m2-l9`): Transistores BJT NPN (2N2222/BC547) y PNP (BC557) en corte y saturación.
  - [ ] Lección 10 (`ee-m2-l10`): Evaluación de Componentes y Circuitos de Control.
  - [ ] Lecciones y simuladores: Capacitores (100nF, 10µF, 100µF), Transistores BJT NPN (2N2222/BC547) y PNP (BC557), Diodos 1N4007, Relé 5V, Motores DC y Buzzer.
- [ ] **Módulo 3 (`EE-M3` - Examen 3: 21 de oct 2026, 125 pts):**
  - [ ] Lecciones y simuladores: CI NE555 astable, CI 74LS93 contador binario 4 bits, CI CD4511 decodificador BCD y Display 7 segmentos cátodo común.
- [ ] **Módulo 4 (`EE-M4` - Proyecto Final: 11 de nov 2026, 100 pts):**
  - [ ] Prototipo funcional STEAM / ABP y rúbrica de sustentación.
- [ ] **Push al repositorio remoto:** Ejecutar únicamente cuando el usuario lo autorice.

---

## 🟡 CRONOGRAMA OFICIAL 2026-2 (CampusVirtual UNIMAG)
- **Periodo:** 3 de agosto – 27 de noviembre de 2026 (17 semanas, 4 créditos).
- **Docente:** Ronny Martinez Reyes.
- **Horarios:** Lunes 4-6 PM (EIE-Electricidad y Magnetismo) · Miércoles 6-8 PM (Sierra Nevada Sur Salón 201).
- **Examen 1 (M1):** 2 de septiembre de 2026 (150 pts).
- **Examen 2 (M2):** 28 de septiembre de 2026 (125 pts).
- **Examen 3 (M3):** 21 de octubre de 2026 (125 pts).
- **Proyecto Final (M4):** 11 de noviembre de 2026 (100 pts).
- **Nivelación:** 18 de noviembre de 2026.
- **Reclamaciones:** 23 de noviembre de 2026.
- **Publicación de Notas Finales:** 25 de noviembre de 2026.

---

## 🔵 REGLAS DE DESARROLLO
- Todo cambio debe verificarse con `npm run build` (0 errores garantizados).
- Mantener los estándares visuales de SVG y colores institucionales (`#38bdf8`, `#1e293b`, `#facc15`, `#34d399`).
