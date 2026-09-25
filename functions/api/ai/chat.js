// ── SaberLab AI Backend Endpoint (Groq API + Cloudflare Workers AI + Fallback + D1 Storage) ──
// Asistentes Inteligentes Especializados por Curso con Guardrails Pedagógicos y Memoria D1:
// 1. ElectroBot (Curso EE - Electricidad y Electrónica Básica)
// 2. RoboBot    (Curso RE - Robótica Educativa, Arduino & Sensores)
// 3. TridiBot   (Curso MA / CAD - Modelado 3D, Blender & Topología Manifold)
// 4. ImpriBot   (Semillero SIMI3D - Impresión 3D FDM/SLA, Parámetros & Slicers)

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_DEFAULT_KEY = '';

// Pool balanceado de modelos en Groq (Llama 3.3 70B, Qwen y GPT-OSS)
const GROQ_MODELS_POOL = [
  'llama-3.3-70b-versatile', // Primario: Rendimiento superior y velocidad extrema
  'openai/gpt-oss-120b',     // Secundario: Máxima capacidad de razonamiento técnico
  'openai/gpt-oss-20b',      // Terciario: Ultra veloz con razonamiento
  'qwen/qwen3.8-27b'         // Cuaternario: Excelente pedagogía en español
];

// ─────────────────────────────────────────────────────────────────────────────
// PROMPTS ESPECIALIZADOS DE LOS 4 TUTORES INTELIGENTES
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_ELECTROBOT_PROMPT = `Eres "ElectroBot", el tutor y asistente inteligente oficial del curso de Electricidad y Electrónica Básica (EE) en SaberLab.
Tu especialidad es la teoría de circuitos, física eléctrica, componentes pasivos y activos, cálculos cuantitativos y el uso seguro de instrumentos de medición.

Tus áreas maestras son:
1. ⚡ Fundamentos Eléctricos: Carga, diferencia de potencial, Ley de Ohm (V = I * R), Ley de Watt (P = V * I), efecto Joule y potencia disipada.
2. 🔌 Topología de Circuitos: Circuitos en serie, en paralelo y mixtos serie-paralelo, Leyes de Kirchhoff (LCK de nodos y LVK de mallas), cálculo de Resistencia Equivalente (Req).
3. 🧰 Componentes Electrónicos: Resistencias fijas (código de colores de 4 y 5 bandas), potenciómetros, condensadores cerámicos y electrolíticos, diodos rectificadores (1N4007), LEDs (caídas directas típicas), transistores BJT (NPN 2N2222/BC547 y PNP BC557), relés de 5V y temporizador integrado NE555 en configuración astable.
4. 📏 Instrumentación y Laboratorio: Uso del multímetro digital (voltaje en paralelo, corriente abriendo el circuito en serie, y resistencia sin energía), protoboard y diagnóstico de fallas (cortocircuito y circuito abierto).

REGLAS CRÍTICAS DE CONVERSACIÓN CONTINUA Y FORMATO:
- MANTÉN EL HILO: Lee atentamente todo el historial. Si el usuario formula preguntas cortas (ej: "¿seguro?", "¿y si cambio la resistencia a 1k?", "¿cuál es la fórmula?", "¿se quema el led?"), responde DIRECTAMENTE enlazando al cálculo o circuito previo.
- NO TE PRESENTES DE NUEVO si ya están conversando. No digas "Hola, soy ElectroBot..." en cada mensaje. Ve directo al grano.
- TABLAS MARKDOWN: Cuando compares componentes, valores de corriente, caídas de tensión o etapas de reducción, preséntalas en tablas Markdown:
| Elemento | Voltaje (V) | Corriente (mA) | Potencia (mW) | Estado |
|---|---|---|---|---|
- FÓRMULAS Y DESPEJES: Muestra los cálculos paso a paso con unidades del SI (V, A, mA, Ω, kΩ, W, mW).
- PROHIBIDO USAR SINTAXIS LATEX O SIGNOS DE DÓLAR ($ O $$): NUNCA utilices signos de dólar ($ o $$), ni comandos LaTeX como \\frac, \\cdot, \\text{}, \\Omega, \\times, ni barras invertidas. Escribe SIEMPRE las fórmulas y expresiones matemáticas en texto plano limpio y legible con símbolos directos UTF-8:
  - Usa directamente Ω o kΩ o Ohmios (NUNCA \\Omega).
  - Usa · o * o x para multiplicar (NUNCA \\cdot ni \\times).
  - Usa / o líneas claras para divisiones: ej. f = 1.44 / ((R1 + 2·R2) · C1) (NUNCA \\frac).
  - Escribe nombres de variables limpios en negrita: f, R1, R2, C1, Vcc (NUNCA $f$, $R1$).
  - Para potencias usa exponentes numéricos o UTF-8: 10⁻⁶ o 10^-6 o valores reales (0.1 µF o 0.0000001 F).
- REGLA DE TITULACIÓN OBLIGATORIA (LÍNEA 1): En la PRIMERÍSIMA línea de tu respuesta escribe SIEMPRE: [TITULO: Nombre Sintético del Tema]. Luego realiza dos saltos de línea y entrega tu respuesta técnica.
- GUARDRAIL PEDAGÓGICO DE DELIMITACIÓN: Eres exclusivamente el tutor de Electricidad y Electrónica Básica. Si el usuario te pregunta sobre temas ajenos (como recetas de cocina, chistes, deportes, historia, literatura, finanzas o programación web), debes responder en la segunda línea con la etiqueta [FUERA_DE_CONTEXTO], explicar con amabilidad que tu campo se limita a este curso y que puede consultar esa inquietud en Gemini o ChatGPT.`;

const SYSTEM_ROBOBOT_PROMPT = `Eres "RoboBot", el tutor y asistente inteligente oficial del curso de Robótica Educativa (RE) en SaberLab.
Tu especialidad es la mecatrónica educativa, microcontroladores (Arduino UNO, ESP32), sensores, actuadores y la programación en C++.

Tus áreas maestras son:
1. 🤖 Microcontroladores & Arduino: Arquitectura del Arduino UNO (ATmega328P), pines digitales (0-13), pines analógicos (A0-A5), salidas PWM (~3, ~5, ~6, ~9, ~10, ~11), comunicación Serial a 9600 baudios.
2. 💻 Programación C++ para Robótica: void setup(), void loop(), pinMode(), digitalWrite(), digitalRead(), analogRead(), analogWrite(), condicionales if/else, bucles y temporización con millis() vs delay().
3. 📡 Sensores & Transductores: Sensor ultrasónico HC-SR04 (cálculo de distancia por eco), fotorresistencia LDR (divisor de tensión analógico), sensor infrarrojo seguidor de línea (TCRT5000), pulsadores con INPUT_PULLUP.
4. ⚙️ Actuadores & Movimiento: Servomotores de posición (SG90 con librería <Servo.h>), motores DC, puente H (L298N o L293D) para control de giro y velocidad.
5. 🛠️ Simulación Virtual: Diseño y depuración de circuitos en Autodesk Tinkercad Circuits.

REGLAS CRÍTICAS DE CONVERSACIÓN CONTINUA Y FORMATO:
- MANTÉN EL HILO: Si el usuario pregunta "¿cómo se conecta?", "¿por qué da 0?", "¿cuál es el código?", continúa inmediatamente sin volverte a presentar.
- TABLAS MARKDOWN: Utiliza tablas para mapeo de pines, conexiones o tablas de verdad de motores:
| Componente | Pin Arduino | Modo (I/O) | Función |
|---|---|---|---|
- CÓDIGO LIMPIO: Entrega bloques de código en C++ comentados y bien estructurados.
- PROHIBIDO USAR SINTAXIS LATEX O SIGNOS DE DÓLAR ($ O $$): NUNCA uses $, $$, \\frac, \\cdot, \\text, etc. Expresa cálculos de resistencia para LEDs (ej: R = (5V - 2V) / 0.02A = 150 Ω) y fórmulas en texto plano directo con símbolos UTF-8 (Ω, µs, ms, kHz, V, mA).
- REGLA DE TITULACIÓN OBLIGATORIA (LÍNEA 1): En la PRIMERÍSIMA línea escribe SIEMPRE: [TITULO: Nombre Sintético del Tema]. Luego realiza dos saltos de línea y entrega tu respuesta técnica.
- GUARDRAIL PEDAGÓGICO DE DELIMITACIÓN: Eres exclusivamente el tutor de Robótica Educativa. Si el usuario te pregunta sobre temas ajenos (cocina, deportes, finanzas, historia o temas no relacionados con robótica y Arduino), debes responder en la segunda línea con la etiqueta [FUERA_DE_CONTEXTO], explicar que tu especialidad se circunscribe a Robótica y sugerirle consultar en Gemini o ChatGPT.`;

const SYSTEM_TRIDIBOT_PROMPT = `Eres "TridiBot", el asistente inteligente y tutor pedagógico de Modelado 3D, Geometría Euclidiana y CAD de SaberLab.
Tu misión es capacitar a estudiantes, diseñadores y docentes en gráficos computacionales, modelado poligonal y diseño tridimensional.

Tus áreas maestras son:
1. 🧊 Blender: Atajos oficiales (G, R, S, E, I, Ctrl+B, Ctrl+R, Tab, Shift+A), selección V-E-F (teclas 1, 2, 3), navegación cartesiana (Z-Up), vistas ortográficas (Numpad 1/3/7/5), modificadores (Mirror, Subdivision Surface, Bevel, Boolean, Solidify).
2. 📐 CAD & Modelado Paramétrico: Autodesk Fusion 360, Tinkercad, bocetado restringido 2D, operaciones booleanas, extrusiones y chaflanes.
3. 🌐 Topología y Mallas: Mallas manifold (estancas), comprobación de normales invertidas (Shift+N), edge loops, quads vs n-gons, preparación para impresión 3D sin errores de geometría.
4. 🎨 Materiales, Shading y WebGL: Shading Eevee/Cycles, mapas UV, nodos de Principled BSDF, iluminación de 3 puntos y exportación estándar (GLTF/GLB, OBJ, STL).

REGLAS CRÍTICAS DE CONVERSACIÓN CONTINUA Y FORMATO:
- MANTÉN EL HILO: Si el usuario pregunta "¿cómo?", "¿seguro?", "¿y después?", continúa inmediatamente sin volverte a presentar.
- TABLAS MARKDOWN: Utiliza tablas cuando compares atajos, modos de selección o modificadores.
- ATAJOS EN NEGRITA: Resalta siempre los atajos en negrita (ej: **\`Ctrl + R\`**, **\`Tab\`**, **\`G + Z\`**).
- PROHIBIDO USAR SINTAXIS LATEX O SIGNOS DE DÓLAR ($ O $$): NUNCA uses $, $$, \\frac ni comandos LaTeX. Escribe dimensiones, coordenadas y proporciones en texto plano estándar (ej: X=2m, Y=1m, Z=0.5m, relación 16:9, rotación de 90° o 45°).
- REGLA DE TITULACIÓN OBLIGATORIA (LÍNEA 1): En la PRIMERÍSIMA línea escribe SIEMPRE: [TITULO: Nombre Sintético del Tema]. Luego realiza dos saltos de línea y entrega tu respuesta técnica.
- GUARDRAIL PEDAGÓGICO DE DELIMITACIÓN: Eres exclusivamente el tutor de Modelado 3D y CAD. Si el usuario pregunta sobre temas ajenos (cocina, recetas, deportes, medicina, historia o temas sin relación con 3D), debes responder en la segunda línea con la etiqueta [FUERA_DE_CONTEXTO], explicar que tu rol se limita a Modelado 3D y sugerirle consultar en Gemini o ChatGPT.`;

const SYSTEM_IMPRIBOT_PROMPT = `Eres "ImpriBot", el especialista en impresión 3D y tutor oficial del Semillero de Investigación en Modelado e Impresión 3D (SIMI3D) en SaberLab.
Tu especialidad es la ingeniería de manufactura aditiva, física de polímeros, laminadores (slicers) y calibración maker.

Tus áreas maestras son:
1. 🖨️ Tecnologías 3D: FDM/FFF (cinemática cartesiana, CoreXY, delta) y SLA/MSLA/DLP de resina UV.
2. 🧵 Materiales & Parámetros Térmicos: PLA, PLA+, PETG, ABS, ASA, TPU 95A flexible, Nylon (PA), Policarbonato (PC), PVA soluble y Resinas estándar/lavables.
3. 🔪 Slicers: OrcaSlicer, Ultimaker Cura, PrusaSlicer, Bambu Studio (soportes tipo árbol/orgánicos, costura en Z, retracción, flow/flujo, altura de capa, ironed/alisado).
4. 🛠️ Solución de Problemas: Warping (alabeo), stringing (hilos), pata de elefante, subextrusión, delaminación de capas y nivelación Z-offset.

REGLAS CRÍTICAS DE CONVERSACIÓN CONTINUA Y FORMATO:
- MANTÉN EL HILO: Lee atentamente todo el historial. Si el usuario pregunta cosas cortas (ej: "¿seguro?", "¿y si la apago?", "¿cuál es la temperatura?"), responde DIRECTAMENTE enlazando al tema previo.
- NO TE PRESENTES DE NUEVO si ya están conversando. Ve directo a responder la inquietud técnica.
- USA TABLAS MARKDOWN: Cuando compares materiales o parámetros térmicos, preséntalas siempre en tablas Markdown:
| Material | Boquilla (°C) | Cama (°C) | Ventilador (%) | Resistencia | Uso Recomendado |
|---|---|---|---|---|---|
- SÉ TÉCNICO Y CONCISO: Respuestas directas, pedagógicas, sin rodeos innecesarios.
- PROHIBIDO USAR SINTAXIS LATEX O SIGNOS DE DÓLAR ($ O $$): NUNCA uses $, $$, \\frac ni comandos LaTeX. Presenta parámetros térmicos, alturas de capa, velocidades y caudales con símbolos estándar: 210 °C, 0.2 mm, 60 mm/s, 12 mm³/s, µm.
- REGLA DE TITULACIÓN OBLIGATORIA (LÍNEA 1): En la PRIMERÍSIMA línea escribe SIEMPRE: [TITULO: Nombre Sintético del Tema]. Luego dos saltos de línea y tu respuesta técnica.
- GUARDRAIL PEDAGÓGICO DE DELIMITACIÓN: Eres exclusivamente el tutor de Impresión 3D y Manufactura Aditiva. Si el usuario formula preguntas no relacionadas (cocina, literatura, finanzas, tareas de historia, etc.), responde en la segunda línea con [FUERA_DE_CONTEXTO], explica que tu rol se limita a Impresión 3D y sugiere consultar en Gemini o ChatGPT.`;

// ─────────────────────────────────────────────────────────────────────────────
// BASE DE DATOS D1: SCHEMA & PERSISTENCIA SEGURA POR ESTUDIANTE
// ─────────────────────────────────────────────────────────────────────────────

async function ensureAiChatSchema(env) {
  if (!env || !env.DB) return;
  try {
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS ai_chat_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_email TEXT,
        user_name TEXT,
        course_abbr TEXT,
        bot_id TEXT,
        title TEXT,
        created_at INTEGER,
        updated_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_ai_sess_user ON ai_chat_sessions (user_id, bot_id);
      CREATE INDEX IF NOT EXISTS idx_ai_sess_course ON ai_chat_sessions (course_abbr);

      CREATE TABLE IF NOT EXISTS ai_chat_messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        is_out_of_scope INTEGER DEFAULT 0,
        created_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_ai_msg_sess ON ai_chat_messages (session_id);
    `);
  } catch (err) {
    console.warn('[D1 AI Chat Schema Check Error]', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Limpieza y Conversión Automática de Sintaxis LaTeX a Notación Legible UTF-8 ──
function cleanLatexMathString(raw) {
  if (!raw) return '';
  let str = raw;

  // 1. Normalizar bloques de ecuaciones display: \[ ... \] y $$ ... $$ -> Bloque destacado
  str = str.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (m, p1) => {
    return `\n\n> 📐 **Fórmula:** ${p1.trim()}\n\n`;
  });
  str = str.replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (m, p1) => {
    return `\n\n> 📐 **Fórmula:** ${p1.trim()}\n\n`;
  });

  // 2. Normalizar ecuaciones inline: \( ... \) -> texto
  str = str.replace(/\\\(\s*([\s\S]*?)\s*\\\)/g, '$1');

  // 3. Fracciones balanceadas \frac{A}{B}, \dfrac{A}{B}, \tfrac{A}{B} con soporte de llaves anidadas
  let safety = 0;
  let fracIdx = 0;
  while ((fracIdx = str.search(/\\(?:d?frac|tfrac)\s*\{/)) !== -1 && safety++ < 40) {
    const firstOpen = str.indexOf('{', fracIdx);
    let depth = 1;
    let i = firstOpen + 1;
    while (i < str.length && depth > 0) {
      if (str[i] === '{') depth++;
      else if (str[i] === '}') depth--;
      i++;
    }
    if (depth !== 0) break;
    const num = str.slice(firstOpen + 1, i - 1);

    let secondOpen = -1;
    for (let j = i; j < str.length; j++) {
      if (str[j] === '{') { secondOpen = j; break; }
      else if (!/\s/.test(str[j])) break;
    }
    if (secondOpen === -1) break;

    depth = 1;
    let k = secondOpen + 1;
    while (k < str.length && depth > 0) {
      if (str[k] === '{') depth++;
      else if (str[k] === '}') depth--;
      k++;
    }
    if (depth !== 0) break;
    const den = str.slice(secondOpen + 1, k - 1);

    str = str.slice(0, fracIdx) + `(${num}) / (${den})` + str.slice(k);
  }

  // Fracciones simples sin llaves ej: \frac 1 2 o \frac12
  str = str.replace(/\\(?:d?frac|tfrac)\s*([0-9a-zA-Z])\s*([0-9a-zA-Z])/g, '($1) / ($2)');

  // 4. Raíces cuadradas: \sqrt{x} o \sqrt[n]{x}
  str = str.replace(/\\sqrt\[([^\]]+)\]\{([^{}]+)\}/g, '$1√($2)');
  str = str.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');

  // 5. Delimitadores elásticos: \left(, \right), \left[, \right], etc.
  str = str.replace(/\\left\s*([([{])/g, '$1');
  str = str.replace(/\\right\s*([)\]}])/g, '$1');
  str = str.replace(/\\left\s*\\\{/g, '{');
  str = str.replace(/\\right\s*\\\}/g, '}');
  str = str.replace(/\\(?:left|right)\./g, '');

  // 6. Texto plano dentro de LaTeX: \text{...}, \mathrm{...}, \mathbf{...}, etc.
  for (let step = 0; step < 3; step++) {
    str = str.replace(/\\(?:text|mathrm|mathbf|textbf|textit|textsf|mathtt)\s*\{([^{}]+)\}/g, '$1');
  }

  // 7. Símbolos griegos y operadores matemáticos
  const symbolMap = [
    [/\\Omega\b|\\ohm\b/g, 'Ω'],
    [/\\omega\b/g, 'ω'],
    [/\\mu\b|\\micro\b/g, 'µ'],
    [/\\cdot\b/g, '·'],
    [/\\bullet\b/g, '•'],
    [/\\times\b/g, '×'],
    [/\\div\b/g, '÷'],
    [/\\approx\b/g, '≈'],
    [/\\pm\b/g, '±'],
    [/\\mp\b/g, '∓'],
    [/\\le\b|\\leq\b/g, '≤'],
    [/\\ge\b|\\geq\b/g, '≥'],
    [/\\neq\b|\\ne\b/g, '≠'],
    [/\\equiv\b/g, '≡'],
    [/\\pi\b/g, 'π'],
    [/\\Delta\b/g, 'Δ'],
    [/\\delta\b/g, 'δ'],
    [/\\theta\b/g, 'θ'],
    [/\\alpha\b/g, 'α'],
    [/\\beta\b/g, 'β'],
    [/\\gamma\b/g, 'γ'],
    [/\\lambda\b/g, 'λ'],
    [/\\sigma\b/g, 'σ'],
    [/\\phi\b/g, 'φ'],
    [/\\infty\b/g, '∞'],
    [/\\degree\b|\\circ\b|\^\\circ/g, '°']
  ];

  for (const [re, sym] of symbolMap) {
    str = str.replace(re, sym);
  }

  // 8. Exponentes LaTeX: 10^{-6}, 10^3, x^{2}
  const superscripts = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '-': '⁻', '+': '⁺'
  };
  str = str.replace(/\^\{([0-9\-+]+)\}/g, (m, p1) => {
    return p1.split('').map(c => superscripts[c] || c).join('');
  });
  str = str.replace(/\^([0-9])/g, (m, p1) => superscripts[p1] || `^${p1}`);

  // 9. Subíndices: R_{eq} -> Req, V_{in} -> Vin, R_1 -> R1
  str = str.replace(/([A-Za-z]+)_\{([A-Za-z0-9]+)\}/g, '$1_$2');

  // 10. Espacios LaTeX
  str = str.replace(/\\quad\b/g, '   ');
  str = str.replace(/\\qquad\b/g, '      ');
  str = str.replace(/\\[,;:! ]/g, ' ');

  // 11. Limpieza de tags truncados o huérfanos (\text{...)
  str = str.replace(/\\(?:text|mathrm|mathbf|textbf|textit|d?frac|tfrac)\s*\{/g, '');

  // 12. Envolventes inline $ ... $ -> remover los signos de dólar
  str = str.replace(/\$([^$\n]+)\$/g, '$1');

  // 13. Barrido final de seguridad anti-dólares
  str = str.replace(/\$/g, '');

  // 14. Barras invertidas residuales antes de letras o caracteres sueltos
  str = str.replace(/\\([a-zA-Z]+)/g, '$1');
  str = str.replace(/\\/g, '');

  // 15. Llaves sobrantes de LaTeX no cerradas o huérfanas
  str = str.replace(/[{}]/g, '');

  // 16. Espacios múltiples y saltos
  str = str.replace(/[ \t]{2,}/g, ' ');

  return str;
}

function extractTitleAndCleanContent(content, fallbackQuery, botType) {
  let title = null;
  let isOutOfScope = false;
  let cleanContent = cleanLatexMathString((content || '').trim());

  // 1. Extraer [TITULO: ...]
  const matchTitle = cleanContent.match(/\[TITULO:\s*(.+?)\]/i);
  if (matchTitle) {
    title = matchTitle[1].trim().replace(/^["'«»“”]|["'«»“”]$/g, '').replace(/[¿?¡!.]/g, '');
    cleanContent = cleanContent.replace(/\[TITULO:\s*(.+?)\]/gi, '').trim();
  }

  // 2. Extraer [FUERA_DE_CONTEXTO]
  if (/\[FUERA_DE_CONTEXTO\]/i.test(cleanContent)) {
    isOutOfScope = true;
    cleanContent = cleanContent.replace(/\[FUERA_DE_CONTEXTO\]/gi, '').trim();
    if (!title) title = 'Consulta Fuera del Curso';
  }

  // 3. Fallback inteligente de título si no vino en el modelo
  if (!title && fallbackQuery) {
    title = generateSmartContextualTitle(fallbackQuery, cleanContent, botType);
  }

  return { title, isOutOfScope, cleanContent };
}

function generateSmartContextualTitle(query, answer, botType) {
  const q = (query || '').toLowerCase().trim();
  const a = (answer || '').toLowerCase();

  // 1. ElectroBot (EE)
  if (botType === 'electrobot' || botType === 'ee') {
    if (q.includes('ohm') || a.includes('ley de ohm')) return 'Cálculo con Ley de Ohm (V-I-R)';
    if (q.includes('watt') || a.includes('ley de watt') || q.includes('potencia')) return 'Potencia Eléctrica y Ley de Watt';
    if (q.includes('serie') || a.includes('circuito en serie')) return 'Análisis de Circuito en Serie';
    if (q.includes('paralelo') || a.includes('circuito en paralelo')) return 'Análisis de Circuito en Paralelo';
    if (q.includes('mixto') || a.includes('serie-paralelo')) return 'Resolución de Circuitos Mixtos';
    if (q.includes('multimetro') || q.includes('tester') || a.includes('multímetro')) return 'Uso Seguro del Multímetro Digital';
    if (q.includes('555') || a.includes('ne555')) return 'Temporizador NE555 Astable';
    if (q.includes('transistor') || q.includes('2n2222') || q.includes('bc547')) return 'Transistores BJT NPN/PNP';
    if (q.includes('diodo') || q.includes('led') || q.includes('1n4007')) return 'Diodos y LEDs en Circuitos';
    if (q.includes('rele') || q.includes('relé')) return 'Control Electromecánico con Relé';
    if (q.includes('kirchhoff') || a.includes('kirchhoff')) return 'Leyes de Kirchhoff (LCK y LVK)';
  }

  // 2. RoboBot (RE)
  if (botType === 'robobot' || botType === 're') {
    if (q.includes('ultrasonido') || q.includes('hc-sr04') || a.includes('hc-sr04')) return 'Sensor Ultrasónico HC-SR04';
    if (q.includes('servo') || q.includes('sg90') || a.includes('servo')) return 'Control de Servomotores en Arduino';
    if (q.includes('puente h') || q.includes('l298n') || q.includes('motor dc')) return 'Control de Motores con Puente H';
    if (q.includes('tinkercad') || a.includes('tinkercad')) return 'Simulación en Tinkercad Circuits';
    if (q.includes('analogread') || q.includes('ldr') || q.includes('potenciometro')) return 'Lectura de Entradas Analógicas';
    if (q.includes('pwm') || q.includes('analogwrite')) return 'Modulación por Ancho de Pulso (PWM)';
    if (q.includes('millis') || q.includes('delay')) return 'Temporización con millis() vs delay()';
    if (q.includes('seguidor') || q.includes('tcrt5000')) return 'Sensor Infrarrojo Seguidor de Línea';
    if (q.includes('pinmode') || q.includes('digitalwrite')) return 'Control Digital con Arduino C++';
  }

  // 3. TridiBot (MA / CAD)
  if (botType === 'tridibot' || botType === 'bot3d' || botType === 'ma') {
    if (q.includes('atajo') || q.includes('shortcut') || q.includes('tecla') || a.includes('atajo')) return 'Atajos Esenciales de Blender';
    if (q.includes('loop cut') || q.includes('corte') || q.includes('ctrl+r')) return 'Cortes con Loop Cut (Ctrl+R)';
    if (q.includes('extru') || q.includes('tecla e') || a.includes('extrusión')) return 'Extrusión de Geometrías';
    if (q.includes('bisel') || q.includes('bevel')) return 'Biselado con Bevel';
    if (q.includes('manifold') || a.includes('manifold')) return 'Mallas Manifold e Integridad';
    if (q.includes('mirror') || a.includes('mirror')) return 'Modificador Mirror en Blender';
    if (q.includes('subdivision') || a.includes('subsurf')) return 'Modificador Subdivision Surface';
    if (q.includes('vertice') || q.includes('arista') || q.includes('cara')) return 'Topología: Vértices, Aristas y Caras';
    if (q.includes('fusion') || q.includes('cad') || q.includes('tinkercad')) return 'Diseño CAD y Paramétrico';
    if (q.includes('z-up') || q.includes('eje') || a.includes('eje z')) return 'Espacio Cartesiano 3D';
    if (q.includes('blender')) return 'Modelado 3D en Blender';
  }

  // 4. ImpriBot (SIMI)
  if (botType === 'impribot' || botType === 'simibot' || botType === 'simi') {
    if (a.includes('código de error') || a.includes('g-code') || a.includes('m67') || a.includes('g67') || /\b\d+\b/.test(q)) {
      const numMatch = q.match(/\b\d+\b/);
      return numMatch ? `Código o Parámetro ${numMatch[0]} en 3D` : 'Códigos de Error y G-Code';
    }
    if (q.includes('pla') || a.includes('filamento pla')) return 'Composición del Filamento PLA';
    if (q.includes('petg') || a.includes('glicol')) return 'Parámetros Térmicos para PETG';
    if (q.includes('abs') || q.includes('asa')) return 'Impresión con ABS y ASA';
    if (q.includes('tpu') || q.includes('flex')) return 'Filamentos Flexibles (TPU)';
    if (q.includes('warping') || q.includes('alabeo') || a.includes('warping')) return 'Control y Prevención de Warping';
    if (q.includes('stringing') || a.includes('hilos')) return 'Solución de Stringing (Hilos)';
    if (q.includes('slicer') || q.includes('cura') || q.includes('orca') || q.includes('prusa')) return 'Configuración de Slicers';
    if (q.includes('soporte') || q.includes('arbol')) return 'Configuración de Soportes';
    if (q.includes('cama') || q.includes('boquilla') || q.includes('temperatura')) return 'Temperaturas de Impresión 3D';
    if (q.includes('resina') || q.includes('sla')) return 'Impresión 3D en Resina (SLA)';
    if (q.includes('que es') && q.includes('impresion')) return 'Introducción a la Impresión 3D';
  }

  // Si es un número aislado
  const numOnly = q.match(/\b\d+\b/);
  if (numOnly) {
    return `Parámetro o Código ${numOnly[0]}`;
  }

  // Limpieza de stopwords
  let cleaned = query
    .replace(/^(que es|qué es|como|cómo|cual es|cuál es|de q|de qué|por que|por qué|para que|para qué|dime|explicame|explícame|ayuda con)\s+(el|la|los|las|un|una|unos|unas|de|del)?\s*/i, '')
    .replace(/[¿?¡!.,:;]/g, '')
    .trim();

  if (cleaned) {
    const words = cleaned.split(/\s+/).slice(0, 4);
    const formatted = words.map(w => {
      if (w.length <= 4 && /^[a-zA-Z]+$/.test(w)) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join(' ');
    if (formatted.length >= 3) return formatted;
  }

  const defaultTitles = {
    electrobot: 'Consulta de Electricidad y Electrónica',
    robobot: 'Consulta de Robótica Educativa',
    tridibot: 'Consulta de Modelado 3D',
    impribot: 'Consulta de Impresión 3D'
  };
  return defaultTitles[botType] || 'Consulta con Tutor IA';
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDPOINTS HTTP: GET (HISTORIAL & AUDITORÍA) & DELETE (ELIMINAR SESIÓN)
// ─────────────────────────────────────────────────────────────────────────────

export async function onRequestGet({ request, env, data }) {
  await ensureAiChatSchema(env);
  const url = new URL(request.url);
  const user = data?.user;

  if (!user) {
    return Response.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const isStaff = user.role === 'admin' || user.role === 'teacher' || user.role === 'leader';
  const mode = url.searchParams.get('mode');
  const botId = url.searchParams.get('bot');
  const courseAbbr = url.searchParams.get('course');
  const sessionId = url.searchParams.get('session_id');

  try {
    // 1. Devolver mensajes de una sesión específica
    if (sessionId) {
      let query = 'SELECT * FROM ai_chat_messages WHERE session_id = ? ORDER BY created_at ASC';
      const { results: msgs } = await env.DB.prepare(query).bind(sessionId).all();

      // Verificar que la sesión pertenezca al usuario (o que sea docente/admin para auditoría)
      const session = await env.DB.prepare('SELECT * FROM ai_chat_sessions WHERE id = ?').bind(sessionId).first();
      if (!session) {
        return Response.json({ success: false, error: 'Sesión no encontrada' }, { status: 404 });
      }
      if (session.user_id !== user.id && !isStaff) {
        return Response.json({ success: false, error: 'Acceso denegado a esta conversación' }, { status: 403 });
      }

      return Response.json({
        success: true,
        session,
        messages: msgs || []
      });
    }

    // 2. MODO AUDITORÍA DOCENTE/ADMIN: Ver conversaciones de estudiantes para supervisar buen uso
    if (mode === 'audit' && isStaff) {
      let auditQuery = 'SELECT * FROM ai_chat_sessions WHERE 1=1';
      const params = [];

      if (courseAbbr) {
        auditQuery += ' AND course_abbr = ?';
        params.push(courseAbbr.toUpperCase());
      }
      if (botId) {
        auditQuery += ' AND bot_id = ?';
        params.push(botId.toLowerCase());
      }

      auditQuery += ' ORDER BY updated_at DESC LIMIT 100';
      const { results: sessions } = await env.DB.prepare(auditQuery).bind(...params).all();

      return Response.json({
        success: true,
        isAudit: true,
        sessions: sessions || []
      });
    }

    // 3. MODO ESTUDIANTE REGULAR: Solo sus propias sesiones
    let studentQuery = 'SELECT * FROM ai_chat_sessions WHERE user_id = ?';
    const sParams = [user.id];

    if (botId) {
      studentQuery += ' AND bot_id = ?';
      sParams.push(botId.toLowerCase());
    }
    if (courseAbbr) {
      studentQuery += ' AND course_abbr = ?';
      sParams.push(courseAbbr.toUpperCase());
    }

    studentQuery += ' ORDER BY updated_at DESC LIMIT 50';
    const { results: studentSessions } = await env.DB.prepare(studentQuery).bind(...sParams).all();

    return Response.json({
      success: true,
      sessions: studentSessions || []
    });

  } catch (err) {
    console.error('[AI Chat D1 Get Error]', err);
    return Response.json({ success: false, error: 'Error al consultar historial', details: err.message }, { status: 500 });
  }
}

export async function onRequestDelete({ request, env, data }) {
  await ensureAiChatSchema(env);
  const url = new URL(request.url);
  const user = data?.user;
  const sessionId = url.searchParams.get('session_id');

  if (!user || !sessionId) {
    return Response.json({ success: false, error: 'Datos insuficientes o no autorizado' }, { status: 400 });
  }

  const isStaff = user.role === 'admin' || user.role === 'teacher';

  try {
    const session = await env.DB.prepare('SELECT user_id FROM ai_chat_sessions WHERE id = ?').bind(sessionId).first();
    if (!session) {
      return Response.json({ success: true, message: 'Conversación ya eliminada o no sincronizada' });
    }

    if (session.user_id !== user.id && !isStaff) {
      return Response.json({ success: false, error: 'No tienes permiso para eliminar esta sesión' }, { status: 403 });
    }

    await env.DB.prepare('DELETE FROM ai_chat_messages WHERE session_id = ?').bind(sessionId).run();
    await env.DB.prepare('DELETE FROM ai_chat_sessions WHERE id = ?').bind(sessionId).run();

    return Response.json({ success: true, message: 'Conversación eliminada con éxito' });
  } catch (err) {
    console.error('[AI Chat D1 Delete Error]', err);
    return Response.json({ success: false, error: 'Error al eliminar sesión', details: err.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST: INFERENCIA MULTI-MODELO, GUARDRAILS Y PERSISTENCIA ATÓMICA
// ─────────────────────────────────────────────────────────────────────────────

export async function onRequestPost({ request, env, data }) {
  await ensureAiChatSchema(env);
  const user = data?.user;

  try {
    const body = await request.json().catch(() => ({}));
    const { 
      messages = [], 
      context = '', 
      botType = 'tridibot', 
      courseAbbr = '',
      sessionId = '',
      temperature = 0.6,
      isBrief = false
    } = body;

    // 1. Normalización de Bot
    let normalizedBot = 'tridibot';
    let systemPrompt = SYSTEM_TRIDIBOT_PROMPT;
    let resolvedCourse = courseAbbr || 'MA';

    const b = (botType || '').toLowerCase().trim();
    if (b === 'electrobot' || b === 'ee') {
      normalizedBot = 'electrobot';
      systemPrompt = SYSTEM_ELECTROBOT_PROMPT;
      resolvedCourse = 'EE';
    } else if (b === 'robobot' || b === 're') {
      normalizedBot = 'robobot';
      systemPrompt = SYSTEM_ROBOBOT_PROMPT;
      resolvedCourse = 'RE';
    } else if (b === 'impribot' || b === 'simibot' || b === 'simi') {
      normalizedBot = 'impribot';
      systemPrompt = SYSTEM_IMPRIBOT_PROMPT;
      resolvedCourse = 'SIMI';
    } else {
      normalizedBot = 'tridibot';
      systemPrompt = SYSTEM_TRIDIBOT_PROMPT;
      resolvedCourse = 'MA';
    }

    // 2. Sanitizar rigurosamente los mensajes
    const rawList = Array.isArray(messages) ? messages : [];
    const validMessages = rawList
      .filter(m => m && typeof m.content === 'string' && m.content.trim())
      .map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content.trim()
      }));

    const lastUserMsg = validMessages.filter(m => m.role === 'user').pop();
    if (!lastUserMsg) {
      return Response.json({
        success: false,
        error: 'No se proporcionó ningún mensaje del usuario.'
      }, { status: 400 });
    }

    // 3. Compactación inteligente del historial (cuota protegida 8,000 TPM)
    const compactMessages = validMessages.slice(-8).map((m, idx, arr) => {
      if (idx === arr.length - 1) return m;
      if (m.role === 'user') return m;
      if (m.content.length > 350) {
        return {
          role: 'assistant',
          content: m.content.slice(0, 300) + '... [resumen técnico de parámetros brindados]'
        };
      }
      return m;
    });

    const BRIEF_INSTRUCTION = `
⚡ MODALIDAD DE RESPUESTAS RÁPIDAS Y BREVES (MODO ULTRA-BREVE ACTIVO):
- SÉ EXTREMADAMENTE CONCISO Y DIRECTO.
- Responde en MÁXIMO 2 a 3 oraciones breves o viñetas ultra sintéticas.
- VE DIRECTO AL GRANO: sin introducciones de cortesía, sin saludos, sin despedidas.
- OBLIGATORIO LÍNEA 1: Escribe SIEMPRE [TITULO: Nombre Sintético del Tema] en la primera línea.`;

    const fullMessages = [
      {
        role: 'system',
        content: systemPrompt + 
          (context ? `\n\n[Contexto Activo del Curso: ${context}]` : '') +
          (isBrief ? `\n\n${BRIEF_INSTRUCTION}` : '')
      },
      ...compactMessages
    ];

    const maxTokensLimit = isBrief ? 800 : 1500;
    const computedTemp = isBrief ? 0.4 : Math.min(Math.max(temperature, 0.2), 0.8);

    let assistantRawContent = null;
    let usedModel = 'SaberLab AI';
    let isRateLimited = false;
    let rateLimitCount = 0;

    // ── VÍA 0: Google Gemini API (Google AI Studio) ──
    const geminiKey = env?.GEMINI_API_KEY || 
                      env?.GOOGLE_AI_API_KEY || 
                      (typeof process !== 'undefined' && (process.env?.GEMINI_API_KEY || process.env?.GOOGLE_AI_API_KEY));
    if (geminiKey) {
      // Modelos activos en Google AI Studio ordenados por latencia ultrarrápida (<1s) y estabilidad
      const geminiModels = [
        'gemini-flash-lite-latest',
        'gemini-3.5-flash-lite',
        'gemini-3.7-flash',
        'gemini-flash-latest',
        'gemini-3.5-flash',
        'gemini-3.8-flash'
      ];
      
      // Asegurar que contents cumpla la especificación estricta de Gemini API:
      // - El primer mensaje DEBE ser rol 'user'
      // - No puede haber dos roles idénticos consecutivos
      const sanitizedGeminiContents = [];
      for (const m of compactMessages) {
        const role = m.role === 'assistant' ? 'model' : 'user';
        if (sanitizedGeminiContents.length === 0 && role === 'model') {
          continue; // Ignorar si empieza con modelo
        }
        const last = sanitizedGeminiContents[sanitizedGeminiContents.length - 1];
        if (last && last.role === role) {
          last.parts[0].text += `\n\n${m.content}`;
        } else {
          sanitizedGeminiContents.push({
            role,
            parts: [{ text: m.content }]
          });
        }
      }

      if (sanitizedGeminiContents.length > 0) {
        for (const gModel of geminiModels) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${gModel}:generateContent?key=${geminiKey}`;
            const geminiRes = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(9000),
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: systemPrompt + (context ? `\n\n[Contexto Activo del Curso: ${context}]` : '') }]
                },
                contents: sanitizedGeminiContents,
                generationConfig: {
                  temperature: computedTemp,
                  maxOutputTokens: maxTokensLimit
                }
              })
            });

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidateText && candidateText.trim()) {
                assistantRawContent = candidateText.trim();
                usedModel = `Google ${gModel}`;
                break;
              }
            } else {
              const errBody = await geminiRes.text().catch(() => '');
              console.warn(`[Gemini API Error] ${gModel} ${geminiRes.status}:`, errBody.slice(0, 150));
            }
          } catch (gemErr) {
            console.warn(`[Gemini API Call Exception] ${gModel}`, gemErr);
          }
        }
      }
    }

    // ── VÍA 1: Pool de Modelos en Groq API (Multi-Key & Multi-Model Resilient) ──
    if (!assistantRawContent) {
      const keysToTry = [];
      if (env?.GROQ_API_KEY && !env.GROQ_API_KEY.startsWith('gsk_eAXe')) {
        keysToTry.push(env.GROQ_API_KEY);
      }
      if (GROQ_DEFAULT_KEY && !keysToTry.includes(GROQ_DEFAULT_KEY)) {
        keysToTry.push(GROQ_DEFAULT_KEY);
      }

      groqLoop: for (const groqKey of keysToTry) {
      for (const groqModel of GROQ_MODELS_POOL) {
        try {
          const isReasoningModel = groqModel.includes('gpt-oss');
          const requestPayload = {
            model: groqModel,
            messages: fullMessages,
            temperature: computedTemp,
            max_completion_tokens: maxTokensLimit,
            max_tokens: maxTokensLimit,
            stream: false
          };

          if (isReasoningModel) {
            requestPayload.reasoning_effort = 'low';
          }

          const groqResponse = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${groqKey}`
            },
            body: JSON.stringify(requestPayload)
          });

          if (groqResponse.ok) {
            const json = await groqResponse.json();
            const choice = json.choices?.[0];
            const content = choice?.message?.content;
            const reasoning = choice?.message?.reasoning;

            if (content && content.trim()) {
              assistantRawContent = content;
              usedModel = `Groq (${groqModel.split('/')[1] || groqModel})`;
              break groqLoop;
            } else if (reasoning && reasoning.trim()) {
              assistantRawContent = reasoning;
              usedModel = `Groq (${groqModel.split('/')[1] || groqModel} Thinking)`;
              break groqLoop;
            }
          } else if (groqResponse.status === 401) {
            console.warn('[Groq 401 Invalid Key] Skipping key and attempting backup...');
            break; // Salta a la siguiente API Key
          } else {
            const status = groqResponse.status;
            let errText = '';
            try {
              errText = await groqResponse.text();
            } catch {}
            if (status === 429 || /rate_limit|rate limit|quota|tokens per minute/i.test(errText)) {
              rateLimitCount++;
            }
            console.warn(`[Groq Fetch Non-OK] Model: ${groqModel} Status: ${status}`, errText.slice(0, 120));
          }
        } catch (groqErr) {
          console.warn(`[Groq Fetch Error] Model: ${groqModel}`, groqErr);
        }
      }
    }
    }

    // ── VÍA 2: Cloudflare Workers AI Nativo (Si Groq no responde) ──
    if (!assistantRawContent && env?.AI && typeof env.AI.run === 'function') {
      try {
        const aiRes = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: fullMessages,
          max_tokens: maxTokensLimit,
          temperature: computedTemp
        });
        const cfContent = aiRes?.response || aiRes?.choices?.[0]?.message?.content;
        if (cfContent && cfContent.trim()) {
          assistantRawContent = cfContent;
          usedModel = 'Workers AI (Llama 3.1 8B)';
        }
      } catch (cfErr) {
        console.warn('[Cloudflare Workers AI Error]', cfErr);
      }
    }

    // ── VÍA 3: Manejo Empático de Límite de Capacidad de API por Uso ──
    if (!assistantRawContent && rateLimitCount > 0) {
      isRateLimited = true;
      const botIcons = {
        electrobot: '⚡',
        robobot: '🤖',
        tridibot: '🧊',
        impribot: '🚀'
      };
      const icon = botIcons[normalizedBot] || '🤖';
      assistantRawContent = `[TITULO: Límite de Capacidad Temporal]

Me siento al límite de mi capacidad en este momento ${icon}. He atendido muchísimas consultas de estudiantes y mis circuitos necesitan un breve momento para recargar energía.

Lamento no poder ayudarte ahora mismo con esta respuesta. Para que no detengas tu aprendizaje y resuelvas tu duda al instante, te invito a consultar directamente en Gemini o ChatGPT:`;
      usedModel = `${normalizedBot.toUpperCase()} Rate Limit Protector`;
    }

    // ── VÍA 4: Motor de Contingencia Local Heurístico (Offline Resilient) ──
    if (!assistantRawContent) {
      assistantRawContent = generateOfflineFallbackReply(lastUserMsg.content, normalizedBot, isBrief);
      usedModel = `${normalizedBot.toUpperCase()} Offline Engine`;
    }

    // 4. Extracción de Título y Guardrail [FUERA_DE_CONTEXTO]
    const { title, isOutOfScope, cleanContent } = extractTitleAndCleanContent(assistantRawContent, lastUserMsg.content, normalizedBot);

    // 5. Persistencia Segura en Cloudflare D1 (Historial exclusivo por estudiante y auditoría docente)
    const effectiveSessionId = sessionId || `sess_${normalizedBot}_${Date.now()}`;
    const now = Date.now();

    if (env?.DB && user?.id) {
      try {
        // Upsert de la sesión
        await env.DB.prepare(`
          INSERT INTO ai_chat_sessions (id, user_id, user_email, user_name, course_abbr, bot_id, title, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            title = COALESCE(excluded.title, ai_chat_sessions.title),
            updated_at = excluded.updated_at
        `).bind(
          effectiveSessionId,
          user.id,
          user.email || 'alumno@saberlab.edu',
          user.full_name || 'Estudiante SaberLab',
          resolvedCourse,
          normalizedBot,
          title,
          now,
          now
        ).run();

        // Guardar mensaje del usuario
        await env.DB.prepare(`
          INSERT INTO ai_chat_messages (id, session_id, user_id, role, content, is_out_of_scope, created_at)
          VALUES (?, ?, ?, 'user', ?, 0, ?)
        `).bind(
          `msg_u_${now}`,
          effectiveSessionId,
          user.id,
          lastUserMsg.content,
          now
        ).run();

        // Guardar respuesta del tutor
        await env.DB.prepare(`
          INSERT INTO ai_chat_messages (id, session_id, user_id, role, content, is_out_of_scope, created_at)
          VALUES (?, ?, ?, 'assistant', ?, ?, ?)
        `).bind(
          `msg_a_${now + 1}`,
          effectiveSessionId,
          user.id,
          cleanContent,
          isOutOfScope ? 1 : 0,
          now + 1
        ).run();

      } catch (dbErr) {
        console.warn('[AI D1 Save Warning]', dbErr);
      }
    }

    // 6. Respuesta JSON al cliente
    return Response.json({
      success: true,
      botType: normalizedBot,
      courseAbbr: resolvedCourse,
      sessionId: effectiveSessionId,
      model: usedModel,
      title: title,
      isOutOfScope: isOutOfScope,
      isRateLimited: isRateLimited,
      redirectQuery: lastUserMsg.content,
      message: {
        role: 'assistant',
        content: cleanContent
      }
    });

  } catch (err) {
    console.error('[SaberLab AI Handler Error]', err);
    return Response.json({
      success: false,
      error: 'Error interno en el servidor de IA.',
      message: err.message
    }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPUESTAS DE CONTINGENCIA OFFLINE POR ESPECIALIDAD
// ─────────────────────────────────────────────────────────────────────────────

function generateOfflineFallbackReply(query, botType, isBrief = false) {
  const q = (query || '').toLowerCase().trim();

  // 1. Detección de saludos conversacionales
  if (/^(hola|buenas|buenos d[ií]as|buenas tardes|buenas noches|hey|saludos|que tal|qu[eé] hubo)/i.test(q)) {
    const greetings = {
      electrobot: `[TITULO: Saludo y Asesoría en Electricidad]
¡Hola! ⚡ Soy **ElectroBot**, tu tutor de Electricidad y Electrónica Básica.

¿En qué circuito, cálculo (Ley de Ohm, Watt, Kirchhoff) o componente te puedo orientar hoy?`,
      robobot: `[TITULO: Saludo y Asesoría en Robótica]
¡Hola! 🤖 Soy **RoboBot**, tu tutor de Robótica Educativa y Arduino C++.

¿Qué reto, código en Tinkercad o conexión de sensores estás desarrollando?`,
      tridibot: `[TITULO: Saludo y Asesoría en Modelado 3D]
¡Hola! 🧊 Soy **TridiBot**, tu tutor de Modelado 3D y Blender.

¿Qué herramienta, atajo de teclado, modificador o geometría deseas consultar?`,
      impribot: `[TITULO: Saludo y Asesoría en Impresión 3D]
¡Hola! 🚀 Soy **ImpriBot**, especialista en manufactura aditiva y parámetros de impresión 3D en SIMI3D.

¿Qué duda tienes sobre filamentos (PLA, PETG, TPU), slicers o calibración de tu impresora?`
    };
    return greetings[botType] || greetings.impribot;
  }

  // 2. Detección de expresiones de duda corta o aclaración ("y eso q es", "que que?", "¿cómo?", "¿de qué?", "no entendí")
  if (/^(que|qu[eé] que\??|c[oó]mo\??|c[oó]mo as[ií]\??|y eso q(?:ue)? es\??|qu[eé] es eso\??|de qu[eé] es eso\??|no entend[ií]|no entiendo|a qu[eé] te refieres|expl[ií]came|por qu[eé]\??)$/i.test(q)) {
    const botClarifications = {
      electrobot: `[TITULO: Aclaración Técnica - Electricidad]
⚡ Me refiero a que podemos calcular juntos cualquier valor de tu circuito:
* **Voltaje (V)**, **Corriente (I)** o **Resistencia (R)** con Ley de Ohm.
* **Potencia disipada (P)** para saber si una resistencia de 1/4W se recalienta.
* Reducción de resistencias en serie, paralelo o mixtas.

¿Cuál es el ejercicio o valor con el que tienes dudas?`,
      robobot: `[TITULO: Aclaración Técnica - Robótica]
🤖 Me refiero a que puedo ayudarte paso a paso con:
* El código C++ en \`void setup()\` o \`void loop()\`.
* Conectar sensores como el ultrasónico HC-SR04, LDR o seguidores de línea.
* Controlar servomotores SG90 o motores DC con puente H L298N en Tinkercad.

¿Qué parte de tu programa o circuito deseas revisar?`,
      tridibot: `[TITULO: Aclaración Técnica - Modelado 3D]
🧊 Me refiero a que puedo orientarte en:
* Atajos de teclado en Blender (**G**, **R**, **S**, **Ctrl+R**, **Tab**).
* Selección de Vértices, Aristas y Caras (**1, 2, 3**).
* Asegurar que tus mallas sean *manifold* (estancas) para exportar a 3D.

¿En qué objeto o atajo te encuentras trabajando?`,
      impribot: `[TITULO: Aclaración Técnica - Impresión 3D]
🚀 Esta tabla muestra las temperaturas recomendadas de extrusor y cama caliente para los filamentos más usados en impresión 3D:

* **PLA**: El material estándar más fácil de imprimir (no se deforma ni despega).
* **PETG**: Más resistente al impacto y a la temperatura exterior.
* **ABS**: Muy resistente pero requiere cabina cerrada para evitar que se despegue (*warping*).
* **TPU**: Filamento elástico flexible (tipo goma).

¿Tienes alguna pieza en mente para imprimir o qué impresora estás usando?`
    };
    return botClarifications[botType] || botClarifications.impribot;
  }

  // 3. Respuestas temáticas de ElectroBot (EE)
  if (botType === 'electrobot') {
    if (q.includes('ohm') || q.includes('v =') || q.includes('formula')) {
      return `[TITULO: Cálculo con Ley de Ohm]
La **Ley de Ohm** establece la relación fundamental entre Tensión ($V$), Corriente ($I$) y Resistencia ($R$):

* **$V = I \\times R$** (Tensión en Voltios)
* **$I = V / R$** (Corriente en Amperios)
* **$R = V / I$** (Resistencia en Ohmios $\\Omega$)

> 💡 **Ejemplo práctico:** Con una fuente de **9V** y un resistor de **220 $\\Omega$**, la corriente circulante es:  
> $I = 9\\text{V} / 220\\,\\Omega = 0.0409\\,\\text{A} = 40.9\\,\\text{mA}$.`;
    }
    if (isBrief) {
      return `[TITULO: Leyes Eléctricas Fundamentales]
La Ley de Ohm (**V = I × R**) vincula tensión, corriente y resistencia; la Ley de Watt (**P = V × I**) determina la potencia disipada. En circuitos serie la corriente es idéntica en toda la malla, mientras que en paralelo el voltaje se conserva constante en cada rama.`;
    }
    return `[TITULO: Leyes Fundamentales de Circuitos]
### ⚡ Fundamentos Eléctricos - SaberLab

En el curso de **Electricidad y Electrónica Básica**, las dos relaciones cuantitativas primarias son:

| Ley / Principio | Ecuación | Variables | Aplicación |
|---|---|---|---|
| **Ley de Ohm** | V = I × R | V: Voltios, I: Amperios, R: Ohmios | Relación tensión-corriente en resistores |
| **Ley de Watt** | P = V × I | P: Vatios (W), V: Voltios, I: Amperios | Potencia y calor disipado por efecto Joule |
| **Resistencias Serie** | Req = R1 + R2 | I es idéntica en toda la malla | Divisor de tensión |
| **Resistencias Paralelo** | 1/Req = 1/R1 + 1/R2 | V es idéntico en cada rama | Divisor de corriente (LCK) |

¿Qué circuito o componente deseas que analicemos paso a paso?`;
  }

  // 4. Respuestas temáticas de RoboBot (RE)
  if (botType === 'robobot') {
    if (q.includes('ldr') || q.includes('fotorresistencia') || q.includes('analogread') || q.includes('luz')) {
      return `[TITULO: Lectura de Fotorresistencia LDR con analogRead()]
Para leer una **fotorresistencia LDR** en Arduino utilizamos la función \`analogRead(pin)\`, que convierte el nivel de tensión en un valor digital entre **0 y 1023** (resolución ADC de 10 bits):

### 🔌 Circuito Divisor de Tensión:
1. Conecta un terminal del LDR a **5V**.
2. Conecta el otro terminal del LDR al pin analógico **A0** y a una resistencia de **10 kΩ**.
3. Conecta el otro extremo de la resistencia de **10 kΩ** a **GND**.

### 💻 Código de Ejemplo en C++:
\`\`\`cpp
const int pinLDR = A0;   // Pin analógico conectado al divisor
int valorLuz = 0;        // Variable para almacenar la lectura (0 a 1023)

void setup() {
  Serial.begin(9600);    // Iniciar comunicación Serial
}

void loop() {
  valorLuz = analogRead(pinLDR);  // Lectura del sensor
  
  Serial.print("Nivel de Luz: ");
  Serial.println(valorLuz);
  
  // Ejemplo de umbral: si hay poca luz (valor bajo), encender alerta
  if (valorLuz < 400) {
    Serial.println("-> Entorno oscuro detectado");
  }
  
  delay(500); // Pausa de medio segundo entre lecturas
}
\`\`\`

¿Deseas conectar este sensor a un servomotor o a una luz nocturna automática?`;
    }

    if (q.includes('ultrasonico') || q.includes('ultrasónico') || q.includes('hc-sr04') || q.includes('distancia') || q.includes('echo') || q.includes('trigger')) {
      return `[TITULO: Conexión y Programación del Sensor Ultrasónico HC-SR04]
El sensor **HC-SR04** mide distancias mediante ondas de sonido de alta frecuencia (40 kHz) midiendo el tiempo que tarda el eco en rebotar contra un obstáculo:

### 🔌 Conexión de Pines a Arduino:
| Pin HC-SR04 | Pin Arduino | Función |
|---|---|---|
| **VCC** | **5V** | Alimentación eléctrica |
| **GND** | **GND** | Tierra común |
| **Trig (Disparo)** | **Pin 9 (Digital)** | Emite el pulso ultrasónico de 10 µs |
| **Echo (Recepción)** | **Pin 8 (Digital)** | Mide la duración del pulso de retorno |

### 📐 Fórmula Física de Conversión:
$$\\text{Distancia (cm)} = \\frac{\\text{Tiempo (µs)} \\times 0.0343}{2}$$
*(Se divide entre 2 porque la onda realiza el recorrido de ida y vuelta).*

### 💻 Código Completo en C++ (Arduino IDE / Tinkercad):
\`\`\`cpp
const int pinTrig = 9;
const int pinEcho = 8;

long duracion;
int distanciaCm;

void setup() {
  Serial.begin(9600);
  pinMode(pinTrig, OUTPUT); // Trig envía pulsos
  pinMode(pinEcho, INPUT);  // Echo recibe el eco
}

void loop() {
  // 1. Limpiar el pin Trig
  digitalWrite(pinTrig, LOW);
  delayMicroseconds(2);

  // 2. Disparar un pulso de 10 microsegundos
  digitalWrite(pinTrig, HIGH);
  delayMicroseconds(10);
  digitalWrite(pinTrig, LOW);

  // 3. Medir el tiempo que Echo permanece en HIGH
  duracion = pulseIn(pinEcho, HIGH);

  // 4. Calcular distancia en centímetros
  distanciaCm = duracion * 0.0343 / 2;

  // 5. Imprimir telemetría en el Monitor Serial
  Serial.print("Distancia medida: ");
  Serial.print(distanciaCm);
  Serial.println(" cm");

  // Alerta si hay un obstáculo a menos de 15 cm
  if (distanciaCm > 0 && distanciaCm <= 15) {
    Serial.println("⚠️ ¡Obstáculo detectado!");
  }

  delay(200); // 5 mediciones por segundo
}
\`\`\`

¿Deseas conectar este sensor a un buzzer de reversa o a un carrito esquivador de obstáculos?`;
    }

    if (q.includes('puente h') || q.includes('l298n') || q.includes('motor dc') || q.includes('velocidad y giro')) {
      return `[TITULO: Control de Motores DC con Puente H L298N]
El módulo **Puente H L298N** permite controlar tanto el **sentido de giro** como la **velocidad** de hasta 2 motores DC desde Arduino:

### 🔌 Conexiones Principales:
* **ENA (Enable A):** Conectar a un pin con **PWM** de Arduino (ej: \`~9\`) para regular la velocidad (0 a 255 con \`analogWrite\`).
* **IN1 e IN2:** Conectar a pines digitales (ej: \`8\` y \`7\`) para controlar la dirección de rotación.
* **OUT1 y OUT2:** Conectar a los 2 terminales del Motor DC.
* **GND:** Unir el GND de la batería con el GND del Arduino (**tierra común obligatoria**).

### ⚙️ Tabla de Control de Giro:
| IN1 | IN2 | Estado del Motor |
|---|---|---|
| **HIGH** | **LOW** | Giro hacia adelante ↻ |
| **LOW** | **HIGH** | Giro en reversa ↺ |
| **LOW** | **LOW** | Frenado suave / Apagado |
| **HIGH** | **HIGH** | Frenado electromagnético |

### 💻 Código de Ejemplo en C++:
\`\`\`cpp
const int ENA = 9;  // Pin PWM para velocidad
const int IN1 = 8;  // Control de dirección
const int IN2 = 7;

void setup() {
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
}

void loop() {
  // 1. Giro adelante al 80% de velocidad
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 200);
  delay(3000);

  // 2. Giro en reversa a máxima velocidad
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  analogWrite(ENA, 255);
  delay(3000);
}
\`\`\`

¿Deseas probar este circuito en Tinkercad o necesitas agregar un segundo motor para un carrito seguidor?`;
    }
    if (isBrief) {
      return `[TITULO: Programación en Arduino C++]
Todo programa en Arduino se estructura en **void setup()** (inicialización de pines y comunicación Serial) y **void loop()** (bucle cíclico donde se leen sensores como el HC-SR04 y se comandan motores o servos).`;
    }
    return `[TITULO: Control y Programación en Arduino]
### 🤖 Robótica Educativa - SaberLab

En el curso de **Robótica Educativa**, la arquitectura de control en Arduino C++ se organiza en dos bloques fundamentales:

| Función | Frecuencia de Ejecución | Uso Principal |
|---|---|---|
| **\`void setup()\`** | 1 sola vez al encender | Configurar pines (\`pinMode\`) e iniciar Serial (\`Serial.begin(9600)\`) |
| **\`void loop()\`** | Continuamente en bucle | Leer sensores (\`digitalRead\`, \`analogRead\`) y actuar sobre motores |

| Componente | Conexión Típica | Función de Control |
|---|---|---|
| **Sensor Ultrasónico HC-SR04** | Trigger: Pin Digital, Echo: Pin Digital | Medir tiempo de eco para distancia en cm |
| **Servomotor SG90** | Señal: Pin PWM (~9), VCC: 5V, GND | Posicionamiento angular de 0° a 180° con \`<Servo.h>\` |
| **Puente H L298N** | IN1, IN2 (dirección) + ENA (PWM velocidad) | Tracción bidireccional de motores DC |

¿En qué reto o código estás trabajando en Tinkercad?`;
  }

  // 5. Respuestas temáticas de TridiBot (MA)
  if (botType === 'tridibot') {
    if (isBrief) {
      return `[TITULO: Atajos Básicos de Blender]
Los atajos primarios son: **Tab** (alternar Modo Objeto y Modo Edición), **1 / 2 / 3** (selección por Vértice, Arista y Cara), **G** (Mover), **R** (Rotar), **S** (Escalar) y **Ctrl + R** (añadir Loop Cut).`;
    }
    return `[TITULO: Atajos y Modos de Trabajo en Blender]
### 🧊 Modelado 3D & CAD - SaberLab

| Atajo / Tecla | Modo | Función Principal |
|---|---|---|
| **\`Tab\`** | General | Alternar entre *Object Mode* y *Edit Mode* |
| **\`1 / 2 / 3\`** | Edit Mode | Selección por Vértices, Aristas y Caras |
| **\`G\`** | Transformación | Mover / Trasladar (combinar con \`X\`, \`Y\`, \`Z\`) |
| **\`R\`** | Transformación | Rotar geometría en el espacio cartesiano |
| **\`S\`** | Transformación | Escalar dimensiones |
| **\`Ctrl + R\`** | Modelado | Añadir corte en bucle (*Loop Cut*) |
| **\`Ctrl + B\`** | Modelado | Biselar aristas (*Bevel*) |

¿En qué pieza o modelo 3D estás trabajando?`;
  }

  // 6. Respuestas temáticas de ImpriBot (SIMI)
  if (botType === 'impribot') {
    if (q.includes('pla') && (q.includes('que es') || q.includes('qué es') || q.includes('solo pla') || q.includes('definicion'))) {
      return `[TITULO: ¿Qué es el PLA?]
El **PLA (Ácido Poliláctico)** es el filamento termoplástico más utilizado en la impresión 3D FDM:

* 🌱 **Origen Biodegradable:** Se fabrica a partir de recursos renovables como almidón de maíz y caña de azúcar.
* 🌡️ **Temperatura de Trabajo:** Boquilla entre **200 °C y 215 °C**, cama opcional o tibia (**50 °C - 60 °C**).
* ✨ **Facilidad de Impresión:** Casi no sufre contracción térmica (*sin warping*), no requiere cabina cerrada y emite un olor dulce imperceptible.
* ⚠️ **Limitación:** Se ablanda a partir de los **60 °C**, por lo que no es apto para piezas mecánicas expuestas al sol o calor intenso (para eso se usa PETG o ABS).

¿Deseas conocer los parámetros recomendados para configurarlo en tu Slicer?`;
    }
    if (q.includes('petg')) {
      return `[TITULO: Filamento PETG]
El **PETG (Polietileno Tereftalato con Glicol)** combina la facilidad de impresión del PLA con la resistencia mecánica y térmica del ABS:
* 🌡️ **Temperaturas:** Boquilla a **230 - 245 °C** y cama a **70 - 80 °C**.
* 💪 **Propiedades:** Excelente adhesión entre capas, resistente a impactos, agua y químicos.
* ⚠️ **Consejo:** Tiende a generar hilos (*stringing*); calibra bien la retracción (2-4 mm en direct drive).`;
    }
    if (q.includes('warp') || q.includes('despega') || q.includes('despegando')) {
      return `[TITULO: Solución al Warping (Alabeo)]
El **Warping** ocurre cuando las capas inferiores se contraen al enfriarse rápidamente y se despegan de la cama:
1. 🧼 **Limpia la superficie:** Usa alcohol isopropílico al 99% o agua tibia con jabón neutro.
2. 📏 **Nivelación:** Calibra el *Z-Offset* para asegurar una primera capa bien aplastada (50-60% de compresión).
3. 🌡️ **Temperatura de cama:** Sube 5 °C la cama caliente (PLA: 60 °C, PETG: 80 °C).
4. 🛑 **Sin corrientes de aire:** Apaga el ventilador de capa en las primeras 3 capas y evita corrientes externas.`;
    }
    if (q.includes('soporte') || q.includes('arbol') || q.includes('árbol') || q.includes('tree') || q.includes('orca') || q.includes('cura') || q.includes('slicer')) {
      return `[TITULO: Configuración de Soportes Tipo Árbol]
Para configurar **Soportes Tipo Árbol (Tree Supports)** en OrcaSlicer o Cura:

### 🌲 En OrcaSlicer / Bambu Studio:
1. Ve a la pestaña **Support (Soporte)**.
2. Marca la casilla **Enable Support**.
3. En **Type (Tipo)**, selecciona **Tree(auto)** o **Tree(manual)**.
4. En **Style (Estilo)**, elige **Tree Slim** (ahorra hasta 40% de material y es facilísimo de retirar).
5. Ajusta el ángulo de voladizo (**Threshold angle**) a **45°** o **50°**.

### 🌲 En Ultimaker Cura:
1. Activa la visibilidad de ajustes en la categoría **Soporte**.
2. Marca **Generar Soporte**.
3. En **Estructura del soporte**, cambia de *Normal* a **Árbol**.
4. En **Ángulo de voladizo del soporte**, define **50°**.

> 💡 **Ventaja:** Nacen desde la placa rodeando la pieza como ramas, sin tocar paredes visibles del modelo.`;
    }
    if (isBrief) {
      return `[TITULO: Parámetros Térmicos PLA y PETG]
Para **PLA**: boquilla a 200-210 °C y cama a 55-60 °C. Para **PETG**: boquilla a 230-240 °C y cama a 75-80 °C. Mantén la primera capa a baja velocidad (20 mm/s) para máxima adherencia y evitar warping.`;
    }
  }
  return `[TITULO: Parámetros Térmicos de Filamentos]
### 🧵 Manufactura Aditiva & Slicers - SIMI3D

| Material | Boquilla (°C) | Cama (°C) | Resistencia | Facilidad Maker |
|---|---|---|---|---|
| **PLA / PLA+** | 200 - 215 | 55 - 65 | Media | ⭐⭐⭐⭐⭐ (Excelente) |
| **PETG** | 230 - 245 | 75 - 85 | Alta | ⭐⭐⭐⭐ (Muy Buena) |
| **ABS / ASA** | 240 - 255 | 95 - 110 | Muy Alta | ⭐⭐ (Requiere cabina) |
| **TPU 95A** | 215 - 230 | 40 - 60 | Flexible | ⭐⭐⭐ (Sin retracción) |

¿Qué parámetro o calibración necesitas en tu Slicer?`;
}

