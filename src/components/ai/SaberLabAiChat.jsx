import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
    Sparkles, Send, X, Trash2, Copy, Check, Box, Cpu, RotateCcw,
    Maximize2, Minimize2, Plus, History, MessageSquare, Clock, Zap,
    ExternalLink, BookOpen
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/useAuth';
import '../../styles/SaberLabAiChat.css';
import { runThanosSnap, runThanosWindowDust, runThanosWindowClose } from './thanosSnap';

const SABERLAB_LOGO = 'https://i.postimg.cc/KY1FZC3G/Logo_Nuevo.png';

export const BOTS_CONFIG = {
    electrobot: {
        id: 'electrobot',
        name: 'ElectroBot',
        courseId: 'EE',
        badge: 'Tutor de Electricidad & Electrónica',
        icon: '⚡',
        color: '#f59e0b',
        desc: 'Tutor oficial de Electricidad y Electrónica Básica. Especialista en Ley de Ohm, Ley de Watt, circuitos serie, paralelo, mixtos, multímetro y semiconductores.',
        placeholder: 'Pregúntale a ElectroBot sobre Ley de Ohm, circuitos mixtos, multímetro, NE555...',
        suggestions: [
            '¿Cómo calcular la resistencia equivalente en un circuito mixto?',
            '¿Cuál es la diferencia entre medir voltaje y corriente con el tester?',
            '¿Cómo saber si una resistencia de 1/4W soportará la potencia disipada?',
            '¿Cómo funciona el temporizador NE555 en modo astable?'
        ]
    },
    robobot: {
        id: 'robobot',
        name: 'RoboBot',
        courseId: 'RE',
        badge: 'Tutor de Robótica Educativa',
        icon: '🤖',
        color: '#a855f7',
        desc: 'Tutor oficial de Robótica Educativa. Especialista en Arduino UNO, C++, Tinkercad Circuits, sensores (HC-SR04, LDR, seguidor de línea), servos y motores.',
        placeholder: 'Pregúntale a RoboBot sobre Arduino, sensores, servos, Tinkercad, puente H...',
        suggestions: [
            '¿Cómo conectar y programar el sensor ultrasónico HC-SR04?',
            '¿Cuál es la diferencia entre millis() y delay() en Arduino?',
            '¿Cómo controlar la velocidad y giro de un motor DC con puente H L298N?',
            '¿Cómo usar analogRead() con una fotorresistencia LDR?'
        ]
    },
    tridibot: {
        id: 'tridibot',
        name: 'TridiBot',
        courseId: 'MA',
        badge: 'Tutor de Modelado 3D & CAD',
        icon: '🧊',
        color: '#8b5cf6',
        desc: 'Tutor oficial de Modelado 3D y CAD. Especialista en Blender, navegación cartesiana Z-Up, topología poligonal, atajos de precisión y mallas manifold.',
        placeholder: 'Pregúntale a TridiBot sobre atajos de Blender, modificadores, Fusion 360...',
        suggestions: [
            '¿Cuáles son los atajos esenciales para modelar en Blender?',
            '¿Cómo crear una malla manifold y evitar geometrías no válidas?',
            '¿Cómo hacer un Loop Cut (Ctrl+R) y biselar aristas en Blender?',
            '¿Cómo aplicar los modificadores Mirror y Subdivision Surface?'
        ]
    },
    impribot: {
        id: 'impribot',
        name: 'ImpriBot',
        courseId: 'SIMI',
        badge: 'Especialista en Impresión 3D',
        icon: '🚀',
        color: '#06b6d4',
        desc: 'Especialista en impresión 3D (FDM/SLA), parámetros de filamentos, resinas y calibración en Slicers (Cura, Orca, Prusa).',
        placeholder: 'Pregúntale a ImpriBot sobre temperaturas de filamento, Cura, OrcaSlicer, warping...',
        suggestions: [
            '¿Qué temperatura de cama y boquilla debo usar para filamento PETG?',
            '¿Cómo solucionar el warping y mejorar la adherencia a la cama?',
            '¿Cómo configurar soportes tipo árbol en OrcaSlicer o Cura?',
            '¿Cuáles son los parámetros óptimos para filamento TPU flexible?'
        ]
    }
};

// Aliases retrocompatibles
BOTS_CONFIG.bot3d = BOTS_CONFIG.tridibot;
BOTS_CONFIG.simibot = BOTS_CONFIG.impribot;
BOTS_CONFIG.ee = BOTS_CONFIG.electrobot;
BOTS_CONFIG.re = BOTS_CONFIG.robobot;
BOTS_CONFIG.ma = BOTS_CONFIG.tridibot;

// ── Generador Inteligente de Títulos Temáticos para Todos los Cursos ──
export function formatSmartTitle(query, botKey, responseText = '') {
    const q = (query || '').toLowerCase().trim();
    const a = (responseText || '').toLowerCase();
    const bot = (botKey || '').toLowerCase();

    // 1. ElectroBot (EE)
    if (bot === 'electrobot' || bot === 'ee') {
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
        return 'Consulta de Electricidad y Electrónica';
    }

    // 2. RoboBot (RE)
    if (bot === 'robobot' || bot === 're') {
        if (q.includes('ultrasonido') || q.includes('hc-sr04') || a.includes('hc-sr04')) return 'Sensor Ultrasónico HC-SR04';
        if (q.includes('servo') || q.includes('sg90') || a.includes('servo')) return 'Control de Servomotores en Arduino';
        if (q.includes('puente h') || q.includes('l298n') || q.includes('motor dc')) return 'Control de Motores con Puente H';
        if (q.includes('tinkercad') || a.includes('tinkercad')) return 'Simulación en Tinkercad Circuits';
        if (q.includes('analogread') || q.includes('ldr') || q.includes('potenciometro')) return 'Lectura de Entradas Analógicas';
        if (q.includes('pwm') || q.includes('analogwrite')) return 'Modulación por Ancho de Pulso (PWM)';
        if (q.includes('millis') || q.includes('delay')) return 'Temporización con millis() vs delay()';
        if (q.includes('seguidor') || q.includes('tcrt5000')) return 'Sensor Infrarrojo Seguidor de Línea';
        if (q.includes('pinmode') || q.includes('digitalwrite')) return 'Control Digital con Arduino C++';
        return 'Consulta de Robótica Educativa';
    }

    // 3. TridiBot (MA / CAD)
    if (bot === 'tridibot' || bot === 'bot3d' || bot === 'ma') {
        if (q.includes('atajo') || q.includes('shortcut') || q.includes('tecla') || a.includes('atajo')) return 'Atajos Esenciales de Blender';
        if (q.includes('loop cut') || q.includes('corte') || q.includes('ctrl+r') || q.includes('ctrl + r')) return 'Cortes con Loop Cut';
        if (q.includes('extru') || q.includes('tecla e') || a.includes('extrusión')) return 'Extrusión de Geometrías';
        if (q.includes('bisel') || q.includes('bevel') || q.includes('ctrl+b') || q.includes('ctrl + b')) return 'Biselado con Bevel';
        if (q.includes('manifold') || q.includes('estanc') || q.includes('normal') || a.includes('manifold')) return 'Mallas Manifold e Integridad';
        if (q.includes('mirror') || q.includes('espejo') || a.includes('mirror')) return 'Modificador Mirror en Blender';
        if (q.includes('subdivision') || q.includes('subsurf') || a.includes('subsurf')) return 'Modificador Subdivision Surface';
        if (q.includes('vertice') || q.includes('arista') || q.includes('cara') || a.includes('vértice')) return 'Topología: Vértices, Aristas y Caras';
        if (q.includes('fusion') || q.includes('cad') || q.includes('tinkercad')) return 'Diseño CAD y Paramétrico';
        if (q.includes('z-up') || q.includes('eje') || q.includes('coordenad')) return 'Espacio Cartesiano 3D';
        if (q.includes('blender')) return 'Modelado 3D en Blender';
        return 'Consulta de Modelado 3D';
    }

    // 4. ImpriBot (SIMI)
    if (bot === 'impribot' || bot === 'simibot' || bot === 'simi') {
        if (a.includes('código') || a.includes('codigo') || a.includes('g-code') || a.includes('m67') || a.includes('g67') || /\b\d+\b/.test(q)) {
            const numMatch = q.match(/\b\d+\b/);
            if (numMatch) return `Significado del Código ${numMatch[0]} en 3D`;
        }
        if (q.includes('pla') || a.includes('ácido poliláctico') || a.includes('filamento pla')) return 'Composición del Filamento PLA';
        if (q.includes('petg') || a.includes('glicol')) return 'Parámetros Térmicos para PETG';
        if (q.includes('abs') || q.includes('asa')) return 'Impresión con ABS y ASA';
        if (q.includes('tpu') || q.includes('flex') || a.includes('poliuretano')) return 'Filamentos Flexibles (TPU)';
        if (q.includes('warping') || q.includes('alabeo') || q.includes('despeg') || a.includes('warping')) return 'Control y Prevención de Warping';
        if (q.includes('stringing') || q.includes('hilo') || a.includes('stringing')) return 'Solución de Stringing (Hilos)';
        if (q.includes('slicer') || q.includes('cura') || q.includes('orca') || q.includes('prusa')) return 'Configuración de Slicers';
        if (q.includes('soporte') || q.includes('arbol') || q.includes('tree') || a.includes('soporte')) return 'Configuración de Soportes';
        if (q.includes('cama') || q.includes('boquilla') || q.includes('temperatura')) return 'Temperaturas de Impresión 3D';
        if (q.includes('resina') || q.includes('sla') || q.includes('msla')) return 'Impresión 3D en Resina (SLA)';
        if (q.includes('que es') && (q.includes('impresion') || q.includes('impresión'))) return 'Introducción a la Impresión 3D';
        return 'Consulta de Impresión 3D';
    }

    // Limpieza de stopwords interrogativas
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

    return 'Consulta con Tutor IA';
}

// ── Limpieza y Conversión Automática de Fórmulas LaTeX a Notación Legible UTF-8 ──
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

// ── Recuperación y Respuesta de Contingencia Local Inmediata en Cliente ──
function generateClientOfflineReply(query, botType, isBrief = false) {
    const q = (query || '').toLowerCase().trim();

    if (botType === 'robobot') {
        if (q.includes('puente h') || q.includes('l298n') || q.includes('motor dc') || q.includes('velocidad y giro') || q.includes('giro')) {
            return `El módulo **Puente H L298N** permite controlar tanto el sentido de giro como la velocidad de hasta 2 motores DC desde Arduino:

### 🔌 Conexiones Principales:
* **ENA (Enable A):** Conectar a un pin con **PWM** de Arduino (ej: \`~9\`) para regular la velocidad (0 a 255 con \`analogWrite\`).
* **IN1 e IN2:** Conectar a pines digitales (ej: \`8\` y \`7\`) para controlar la dirección de rotación.
* **OUT1 y OUT2:** Conectar a los 2 terminales del Motor DC.
* **GND:** Unir el GND de la fuente externa con el GND de Arduino (**tierra común obligatoria**).

### ⚙️ Tabla de Control de Giro:
| IN1 | IN2 | Estado del Motor |
|---|---|---|
| **HIGH** | **LOW** | Giro hacia adelante ↻ |
| **LOW** | **HIGH** | Giro en reversa ↺ |
| **LOW** | **LOW** | Parada suave |

### 💻 Código de Ejemplo en C++:
\`\`\`cpp
const int ENA = 9;  // Pin PWM para velocidad
const int IN1 = 8;  // Dirección
const int IN2 = 7;

void setup() {
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
}

void loop() {
  // Giro adelante al 80% de velocidad (200 de 255)
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 200);
  delay(3000);

  // Giro en reversa al 100% de velocidad
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  analogWrite(ENA, 255);
  delay(3000);
}
\`\`\`

¿Deseas conectar un segundo motor o integrar un potenciómetro para variar la velocidad?`;
        }

        if (q.includes('ldr') || q.includes('fotorresistencia') || q.includes('analogread')) {
            return `Para leer una **fotorresistencia LDR** en Arduino usamos \`analogRead(pin)\`, que convierte el voltaje en un valor entre **0 y 1023**:

### 🔌 Conexión con Divisor de Tensión:
1. Conecta un terminal del LDR a **5V**.
2. Conecta el otro terminal a **A0** y a una resistencia de **10 kΩ**.
3. El otro extremo de la resistencia de **10 kΩ** va a **GND**.

### 💻 Código en C++:
\`\`\`cpp
const int pinLDR = A0;
int valorLuz = 0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  valorLuz = analogRead(pinLDR);
  Serial.print("Luz: ");
  Serial.println(valorLuz);
  delay(500);
}
\`\`\``;
        }

        if (q.includes('ultrasonico') || q.includes('ultrasónico') || q.includes('hc-sr04') || q.includes('distancia') || q.includes('echo') || q.includes('trigger')) {
            return `El sensor **HC-SR04** mide distancias mediante ondas de sonido de 40 kHz midiendo el tiempo de rebote del eco:

### 🔌 Conexiones a Arduino:
* **VCC:** Conectar a **5V**.
* **GND:** Conectar a **GND**.
* **Trig (Disparo):** Conectar al **Pin 9** (salida digital que emite el pulso de 10 µs).
* **Echo (Recepción):** Conectar al **Pin 8** (entrada digital que mide la duración del eco).

### 📐 Cálculo de Distancia:
$$\\text{Distancia (cm)} = \\frac{\\text{Tiempo (µs)} \\times 0.0343}{2}$$

### 💻 Código en C++:
\`\`\`cpp
const int pinTrig = 9;
const int pinEcho = 8;
long duracion;
int distanciaCm;

void setup() {
  Serial.begin(9600);
  pinMode(pinTrig, OUTPUT);
  pinMode(pinEcho, INPUT);
}

void loop() {
  digitalWrite(pinTrig, LOW);
  delayMicroseconds(2);
  digitalWrite(pinTrig, HIGH);
  delayMicroseconds(10);
  digitalWrite(pinTrig, LOW);

  duracion = pulseIn(pinEcho, HIGH);
  distanciaCm = duracion * 0.0343 / 2;

  Serial.print("Distancia: ");
  Serial.print(distanciaCm);
  Serial.println(" cm");
  delay(250);
}
\`\`\`

¿Deseas activar un buzzer de alarma cuando un objeto esté a menos de 10 cm?`;
        }

        return `Todo programa en Arduino se estructura en **void setup()** (inicialización de pines y comunicación Serial) y **void loop()** (bucle cíclico continuo para leer sensores y actuar sobre motores). ¿Qué parte de tu circuito deseas revisar?`;
    }

    if (botType === 'electrobot') {
        return `La **Ley de Ohm** (**V = I × R**) y la **Ley de Watt** (**P = V × I**) son las bases del análisis de circuitos. En serie la corriente es idéntica en toda la malla; en paralelo el voltaje se mantiene constante en cada rama.`;
    }

    if (botType === 'tridibot') {
        return `Los atajos fundamentales en Blender 4.x son: **G** (Mover/Grab), **R** (Rotar), **S** (Escalar), **Tab** (alternar Modo Objeto y Modo Edición) y **Ctrl + R** (Loop Cut).`;
    }

    if (botType === 'impribot') {
        if (q.includes('soporte') || q.includes('arbol') || q.includes('árbol') || q.includes('tree') || q.includes('orca') || q.includes('cura')) {
            return `Para configurar **Soportes Tipo Árbol (Tree Supports)** en OrcaSlicer o Cura:

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

> 💡 **Ventaja de los soportes árbol:** Nacen desde la placa de construcción rodeando la pieza como ramas, sin tocar superficies visibles del modelo, reduciendo marcas y tiempos de postprocesado.`;
        }

        return `El filamento **PETG** se imprime típicamente con boquilla a **230 °C - 245 °C** y cama caliente a **75 °C - 85 °C**, ofreciendo excelente resistencia mecánica y térmica sin warping.`;
    }
}

function sanitizeSessions(parsed) {
    if (!parsed) return { electrobot: [], robobot: [], tridibot: [], impribot: [] };
    const cleaned = {
        electrobot: [],
        robobot: [],
        tridibot: [],
        impribot: []
    };

    ['electrobot', 'robobot', 'tridibot', 'impribot'].forEach(botKey => {
        // Soporte retrocompatible con keys antiguas
        let rawList = [];
        if (Array.isArray(parsed[botKey])) {
            rawList = parsed[botKey];
        } else if (botKey === 'tridibot' && Array.isArray(parsed.bot3d)) {
            rawList = parsed.bot3d;
        } else if (botKey === 'impribot' && Array.isArray(parsed.simibot)) {
            rawList = parsed.simibot;
        }

        cleaned[botKey] = rawList
            .filter(sess => {
                if (!sess || !Array.isArray(sess.messages) || sess.messages.length === 0) return false;
                // Eliminar sesiones cruzadas en electrobot o robobot que contengan texto de SIMIBot o SIMI3D
                if (botKey === 'electrobot' || botKey === 'robobot') {
                    const isContaminated = sess.messages?.some(m => 
                        /SIMIBot|SIMI3D|impresi[óo]n 3D|filamento|slicer|OrcaSlicer/i.test(m.content || '')
                    );
                    if (isContaminated) return false;
                }
                return true;
            })
            .map(sess => ({
                ...sess,
                messages: (sess.messages || []).map(m => ({
                    ...m,
                    content: cleanLatexMathString((m.content || '').replace(/\bSIMIBot\b/g, 'ImpriBot'))
                }))
            }));
    });

    return cleaned;
}

export function getEffectiveUserId(user) {
    if (user?.id) return String(user.id);
    try {
        const cached = localStorage.getItem('saberlab_cached_user');
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed?.id) return String(parsed.id);
        }
    } catch {}
    return 'guest';
}

function getStoredSessions(userId = 'guest') {
    const storageKey = `saberlab_ai_sessions_${userId}_v3`;
    try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            return sanitizeSessions(JSON.parse(saved));
        }

        // Migración retrocompatible única del formato v2 si existía
        const oldSaved = localStorage.getItem('saberlab_ai_sessions_v2');
        if (oldSaved) {
            const migrated = sanitizeSessions(JSON.parse(oldSaved));
            localStorage.setItem(storageKey, JSON.stringify(migrated));
            // ELIMINAR v2 de inmediato para que nunca vuelva a resucitar sesiones borradas
            localStorage.removeItem('saberlab_ai_sessions_v2');
            return migrated;
        }
    } catch {}
    return { electrobot: [], robobot: [], tridibot: [], impribot: [] };
}

// ── Detección Centralizada del Curso Activo y su Tutor Asignado ──
function resolveCourseContext(pathname, enrolledCourses) {
    const p = (pathname || '').toLowerCase();

    // 1. Detección por ruta activa (Lecciones, Módulos, Laboratorios o vistas específicas)
    if (p.includes('electricidad-y-electronica') || p.includes('/ee/') || p.includes('ee-m') || p.includes('ee-') || p.includes('/courses/1') || p.includes('/my-courses/1')) {
        return { courseAbbr: 'EE', courseTitle: 'Electricidad y Electrónica', botId: 'electrobot', isSimi: false };
    }
    if (p.includes('robotica-educativa') || p.includes('/re/') || p.includes('re-m') || p.includes('re-') || p.includes('/courses/2') || p.includes('/my-courses/2') || p.includes('/courses/5') || p.includes('/my-courses/5')) {
        return { courseAbbr: 'RE', courseTitle: 'Robótica Educativa', botId: 'robobot', isSimi: false };
    }
    if (p.includes('modelado-y-animacion-3d') || p.includes('/ma/') || p.includes('ma-m') || p.includes('ma-') || p.includes('/courses/3') || p.includes('/my-courses/3') || p.includes('/courses/4') || p.includes('/my-courses/4')) {
        return { courseAbbr: 'MA', courseTitle: 'Modelado y Animación 3D', botId: 'tridibot', isSimi: false };
    }
    if (p.includes('/simi') || p.includes('simi-m') || p.includes('/courses/6') || p.includes('/my-courses/6')) {
        return { courseAbbr: 'SIMI', courseTitle: 'Semillero SIMI3D', botId: 'impribot', isSimi: true };
    }

    // 2. Detección por curso seleccionado en la plataforma (Dashboard, Calificaciones, Exámenes, etc.)
    try {
        const activeStored = (localStorage.getItem('saberlab_active_course') || '').trim();
        if (activeStored && activeStored !== 'all') {
            const s = activeStored.toUpperCase();
            if (s === '1' || s === 'EE') {
                return { courseAbbr: 'EE', courseTitle: 'Electricidad y Electrónica', botId: 'electrobot', isSimi: false };
            }
            if (s === '2' || s === '5' || s === 'RE') {
                return { courseAbbr: 'RE', courseTitle: 'Robótica Educativa', botId: 'robobot', isSimi: false };
            }
            if (s === '3' || s === '4' || s === 'MA') {
                return { courseAbbr: 'MA', courseTitle: 'Modelado y Animación 3D', botId: 'tridibot', isSimi: false };
            }
            if (s === '6' || s === 'SIMI') {
                return { courseAbbr: 'SIMI', courseTitle: 'Semillero SIMI3D', botId: 'impribot', isSimi: true };
            }
        }
    } catch {}

    // 3. Detección por matrícula del estudiante
    const primaryCourse = (enrolledCourses && enrolledCourses.length > 0)
        ? (enrolledCourses.find(c => c.is_primary || c.primary) || enrolledCourses[0])
        : null;
    const pAbbr = (primaryCourse?.abbr || primaryCourse?.id || '').toString().toUpperCase();

    if (pAbbr === 'RE' || pAbbr === '2' || pAbbr === '5') {
        return { courseAbbr: 'RE', courseTitle: 'Robótica Educativa', botId: 'robobot', isSimi: false };
    }
    if (pAbbr === 'MA' || pAbbr === '3' || pAbbr === '4') {
        return { courseAbbr: 'MA', courseTitle: 'Modelado y Animación 3D', botId: 'tridibot', isSimi: false };
    }
    if (pAbbr === 'SIMI' || pAbbr === '6') {
        return { courseAbbr: 'SIMI', courseTitle: 'Semillero SIMI3D', botId: 'impribot', isSimi: true };
    }

    // 4. Fallback canónico predeterminado de SaberLab: Electricidad y Electrónica (EE)
    return { courseAbbr: 'EE', courseTitle: 'Electricidad y Electrónica', botId: 'electrobot', isSimi: false };
}


export default function SaberLabAiChat({ forceBot = null }) {
    const location = useLocation();
    const { user, enrolledCourses } = useAuth();
    const userId = getEffectiveUserId(user);

    const [courseTick, setCourseTick] = useState(0);

    // Escuchar cambios de curso en la plataforma en tiempo real
    useEffect(() => {
        const handleCourseChange = () => setCourseTick(t => t + 1);
        window.addEventListener('saberlab_course_changed', handleCourseChange);
        window.addEventListener('storage', handleCourseChange);
        return () => {
            window.removeEventListener('saberlab_course_changed', handleCourseChange);
            window.removeEventListener('storage', handleCourseChange);
        };
    }, []);

    const resolvedContext = resolveCourseContext(location.pathname, enrolledCourses);
    const expectedBotId = forceBot || resolvedContext.botId;
    const courseAbbr = resolvedContext.courseAbbr || 'RE';
    const isSimiCourse = forceBot ? false : resolvedContext.isSimi;
    const isSingleBotCourse = !isSimiCourse;

    const [isOpen, setIsOpen] = useState(false);
    const [isChatWindowVisible, setIsChatWindowVisible] = useState(false);
    const [activeBot, setActiveBot] = useState(() => {
        if (forceBot) return forceBot;
        if (!isSimiCourse) return expectedBotId;
        const saved = localStorage.getItem(`saberlab_active_bot_${userId}`);
        if (saved === 'tridibot' || saved === 'impribot') return saved;
        return 'impribot';
    });

    const isRoboBotActive = activeBot === 'robobot' || activeBot === 're';

    const triggerOpenSequence = (botToUse = null) => {
        const currentTargetBot = botToUse || activeBot;
        const isRobot = currentTargetBot === 'robobot' || currentTargetBot === 're';
        setActiveSessionId(null);
        setShowHistory(false);
        setIsOpen(true);
        if (isRobot) {
            setIsChatWindowVisible(false);
            setTimeout(() => {
                setIsChatWindowVisible(true);
            }, 280);
        } else {
            setIsChatWindowVisible(true);
        }
    };

    const handleCloseChat = () => {
        if (windowRef.current) {
            runThanosWindowClose(windowRef.current, currentBot.color || '#0284c7', () => {
                setIsChatWindowVisible(false);
                setIsOpen(false);
                setShowHistory(false);
            });
        } else {
            setIsChatWindowVisible(false);
            setIsOpen(false);
            setShowHistory(false);
        }
    };

    // Permitir apertura remota desde botones o callouts (ej. Landing Page u otros componentes)
    useEffect(() => {
        const handleOpenAiChat = (e) => {
            const requestedBot = e.detail?.bot || activeBot;
            if (e.detail?.bot) {
                setActiveBot(e.detail.bot);
            }
            triggerOpenSequence(requestedBot);
        };
        window.addEventListener('saberlab_open_ai_chat', handleOpenAiChat);
        return () => window.removeEventListener('saberlab_open_ai_chat', handleOpenAiChat);
    }, [activeBot]);

    // Notificar visibilidad del chat para sincronizar fondos u otros elementos de la página
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('saberlab_ai_chat_visibility', { 
            detail: { isOpen, activeBot, isRoboBotActive } 
        }));
    }, [isOpen, activeBot, isRoboBotActive]);

    const [sessions, setSessions] = useState(() => getStoredSessions(userId));
    // Siempre arranca en nueva conversación limpia; solo se selecciona una previa si el usuario va al Historial
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [isWide, setIsWide] = useState(() => {
        return localStorage.getItem('saberlab_chat_wide') === 'true';
    });
    const [isBriefMode, setIsBriefMode] = useState(() => {
        return localStorage.getItem('saberlab_ai_brief_mode') === 'true';
    });
    const [showHistory, setShowHistory] = useState(false);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const windowRef = useRef(null);

    // Sincronizar bot al navegar dentro de un curso o cambiar de curso activo
    useEffect(() => {
        if (forceBot) {
            if (activeBot !== forceBot) {
                setActiveBot(forceBot);
                setActiveSessionId(null);
            }
            return;
        }
        if (!isSimiCourse) {
            if (activeBot !== expectedBotId) {
                setActiveBot(expectedBotId);
                setActiveSessionId(null);
            }
        } else {
            // En SIMI sólo están permitidos tridibot e impribot
            if (activeBot !== 'tridibot' && activeBot !== 'impribot') {
                setActiveBot('impribot');
                setActiveSessionId(null);
            }
        }
    }, [forceBot, expectedBotId, isSimiCourse, location.pathname, courseTick, activeBot, sessions, userId]);

    // Recargar sesiones si cambia el usuario autenticado
    useEffect(() => {
        setSessions(getStoredSessions(userId));
    }, [userId]);

    const currentBot = BOTS_CONFIG[activeBot] || BOTS_CONFIG.tridibot;
    const botSessions = sessions[activeBot] || [];
    const currentSession = botSessions.find(s => s.id === activeSessionId) || null;
    const messages = currentSession ? currentSession.messages : [];

    // Guardar en localStorage exclusivo del estudiante (solo sesiones con al menos 1 mensaje)
    useEffect(() => {
        try {
            const cleanedSessions = {};
            for (const botKey of Object.keys(sessions)) {
                cleanedSessions[botKey] = (sessions[botKey] || []).filter(
                    s => Array.isArray(s.messages) && s.messages.length > 0
                );
            }
            localStorage.setItem(`saberlab_ai_sessions_${userId}_v3`, JSON.stringify(cleanedSessions));
            localStorage.setItem(`saberlab_active_bot_${userId}`, activeBot);
            if (activeSessionId) {
                localStorage.setItem(`saberlab_active_session_id_${userId}_${activeBot}`, activeSessionId);
            } else {
                localStorage.removeItem(`saberlab_active_session_id_${userId}_${activeBot}`);
            }
            localStorage.setItem('saberlab_chat_wide', String(isWide));
            localStorage.setItem('saberlab_ai_brief_mode', String(isBriefMode));
        } catch {}
    }, [sessions, activeBot, activeSessionId, isWide, isBriefMode, userId]);

    // Auto-scroll al final cuando llegan mensajes
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading, isOpen, activeBot]);

    // Enfocar textarea y ejecutar efecto de polvo cósmico al abrir
    useEffect(() => {
        if (isOpen && isChatWindowVisible) {
            setTimeout(() => {
                textareaRef.current?.focus();
                if (windowRef.current) {
                    runThanosWindowDust(windowRef.current, currentBot.color || '#0284c7');
                }
            }, 80);
        }
    }, [isOpen, isChatWindowVisible, activeBot, currentBot.color]);

    const handleSwitchBot = (newBot) => {
        if (!isSimiCourse) return; // En cursos estándar el bot es único e inamovible
        if (newBot !== 'tridibot' && newBot !== 'impribot') return;
        setActiveBot(newBot);
        setActiveSessionId(null); // Al cambiar de bot, iniciar en conversación nueva y limpia
    };

    const handleNewChat = () => {
        setActiveSessionId(null);
        setInputText('');
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setShowHistory(false);
        }
        setTimeout(() => textareaRef.current?.focus(), 150);
    };

    const handleSelectSession = (sessId) => {
        setActiveSessionId(sessId);
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setShowHistory(false);
        }
        setTimeout(() => textareaRef.current?.focus(), 150);
    };

    const [deletingSessionIds, setDeletingSessionIds] = useState(() => new Set());

    const handleDeleteSession = async (sessId, e) => {
        e?.stopPropagation();
        if (deletingSessionIds.has(sessId)) return;

        // Localizar el elemento HTML de la fila en el historial
        const targetEl = e?.currentTarget?.closest('.saberlab-history-item') || document.getElementById(`saberlab-sess-item-${sessId}`);

        setDeletingSessionIds(prev => new Set(prev).add(sessId));

        // 1. PURGADO SÍNCRONO E INMEDIATO EN LOCALSTORAGE
        // Se ejecuta en el milisegundo 0 para que si el usuario recarga la página, el chat ya no exista jamás.
        try {
            const currentUid = getEffectiveUserId(user);
            const storageKey = `saberlab_ai_sessions_${currentUid}_v3`;

            const purgeFromKey = (k) => {
                try {
                    const raw = localStorage.getItem(k);
                    if (!raw) return;
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === 'object') {
                        let changed = false;
                        for (const b of Object.keys(parsed)) {
                            if (Array.isArray(parsed[b])) {
                                const initialLen = parsed[b].length;
                                parsed[b] = parsed[b].filter(s => s.id !== sessId);
                                if (parsed[b].length !== initialLen) changed = true;
                            }
                        }
                        if (changed) {
                            localStorage.setItem(k, JSON.stringify(parsed));
                        }
                    }
                } catch {}
            };

            purgeFromKey(storageKey);
            purgeFromKey('saberlab_ai_sessions_guest_v3');
            // Eliminar de raíz cualquier respaldo zombie v2
            localStorage.removeItem('saberlab_ai_sessions_v2');
        } catch (storageErr) {
            console.warn('[Storage Purge Error]', storageErr);
        }

        // 2. DISPARAR LA ELIMINACIÓN EN CLOUDFLARE D1 EN SEGUNDO PLANO
        api(`/ai/chat?session_id=${sessId}`, { method: 'DELETE' }).catch(err => {
            console.warn('[AI Chat D1 Delete Warning]', err);
        });

        // 3. ACTUALIZACIÓN INMEDIATA DEL ESTADO DE REACT
        setSessions(prev => {
            const currentList = prev[activeBot] || [];
            const updatedList = currentList.filter(s => s.id !== sessId);
            return { ...prev, [activeBot]: updatedList };
        });

        if (activeSessionId === sessId) {
            setActiveSessionId(null);
        }

        // 4. ANIMACIÓN VISUAL DE CHASQUIDO DE THANOS EN PARALELO
        const releaseLock = () => {
            setDeletingSessionIds(prev => {
                const next = new Set(prev);
                next.delete(sessId);
                return next;
            });
        };

        if (targetEl) {
            runThanosSnap(targetEl, releaseLock);
        } else {
            releaseLock();
        }
    };

    const handleSendMessage = async (textToSend = inputText) => {
        const query = (textToSend || '').trim();
        if (!query || isLoading) return;

        let sessId = activeSessionId;
        let currentMessages = messages;

        // Si no hay sesión activa, creamos una nueva con título inicial
        if (!sessId || !currentSession) {
            sessId = 'sess_' + Date.now();
            const smartTitle = formatSmartTitle(query, activeBot);
            const newSession = {
                id: sessId,
                title: smartTitle,
                createdAt: Date.now(),
                messages: []
            };
            setSessions(prev => ({
                ...prev,
                [activeBot]: [newSession, ...(prev[activeBot] || [])]
            }));
            setActiveSessionId(sessId);
            currentMessages = [];
        }

        const userMsg = { 
            role: 'user', 
            content: query, 
            timestamp: Date.now() 
        };
        const updatedMessages = [...currentMessages, userMsg];

        setSessions(prev => {
            const list = prev[activeBot] || [];
            const idx = list.findIndex(s => s.id === sessId);
            if (idx >= 0) {
                const copy = [...list];
                copy[idx] = { ...copy[idx], messages: updatedMessages };
                return { ...prev, [activeBot]: copy };
            }
            return prev;
        });

        setInputText('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        setIsLoading(true);

        const payloadMessages = updatedMessages
            .filter(m => !m.isError && m.content)
            .slice(-14)
            .map(m => ({ role: m.role, content: m.content }));

        try {
            const res = await api('/ai/chat', {
                method: 'POST',
                body: {
                    botType: activeBot,
                    courseAbbr: courseAbbr,
                    sessionId: sessId,
                    messages: payloadMessages,
                    context: currentBot.desc,
                    isBrief: isBriefMode
                }
            });

            if (res?.data?.success && res.data.message) {
                const isOutOfScope = !!res.data.isOutOfScope;
                const isRateLimited = !!res.data.isRateLimited;
                const rawContent = res.data.message.content || '';
                const cleanText = cleanLatexMathString(rawContent.replace(/\[FUERA_DE_CONTEXTO\]/gi, '').trim());

                const aiMsg = { 
                    role: 'assistant', 
                    content: cleanText, 
                    timestamp: Date.now(),
                    isOutOfScope: isOutOfScope,
                    isRateLimited: isRateLimited,
                    userQuery: query
                };
                const aiDecidedTitle = res.data.title;

                setSessions(prev => {
                    const list = prev[activeBot] || [];
                    const idx = list.findIndex(s => s.id === sessId);
                    if (idx >= 0) {
                        const copy = [...list];
                        const sess = copy[idx];

                        const isCurrentTitleGeneric = !sess.title || 
                            /^(que es|qué es|como|de q|cual es|por que|para que|consulta)/i.test(sess.title) ||
                            sess.title.toLowerCase().startsWith('que es el');

                        const finalTitle = (aiDecidedTitle && (!sess.hasAiTitle || isCurrentTitleGeneric || sess.messages.length <= 2))
                            ? aiDecidedTitle
                            : (sess.title || formatSmartTitle(query, activeBot, aiMsg.content));

                        copy[idx] = { 
                            ...sess, 
                            title: finalTitle,
                            hasAiTitle: !!(aiDecidedTitle || sess.hasAiTitle),
                            messages: [...sess.messages, aiMsg] 
                        };
                        return { ...prev, [activeBot]: copy };
                    }
                    return prev;
                });
            } else {
                const isLimitErr = res?.status === 429 || 
                    /rate|limit|cuota|429|quota/i.test(res?.error?.message || res?.data?.error || '');

                const errorMsg = isLimitErr ? {
                    role: 'assistant',
                    content: `Me siento al límite de mi capacidad en este momento ${currentBot.icon}. He atendido muchísimas consultas y mis circuitos necesitan un breve respiro para recargar energía.\n\nLamento no poder ayudarte ahora mismo con esta respuesta. Para que no te quedes con la duda y sigas avanzando con tu aprendizaje, te sugiero consultarla directamente con Gemini o ChatGPT:`,
                    timestamp: Date.now(),
                    isRateLimited: true,
                    userQuery: query
                } : { 
                    role: 'assistant', 
                    content: `⚠️ Hubo una interrupción con ${currentBot.name}: ${res?.error?.message || res?.data?.error || 'Por favor reintenta.'}`, 
                    timestamp: Date.now(),
                    isError: true,
                    retryQuery: query
                };

                setSessions(prev => {
                    const list = prev[activeBot] || [];
                    const idx = list.findIndex(s => s.id === sessId);
                    if (idx >= 0) {
                        const copy = [...list];
                        copy[idx] = { ...copy[idx], messages: [...copy[idx].messages, errorMsg] };
                        return { ...prev, [activeBot]: copy };
                    }
                    return prev;
                });
            }
        } catch (err) {
            console.warn('[AI Fetch Error, activating immediate offline recovery]', err);
            
            // Si la llamada remota falla o se interrumpe la red, recuperar respuesta del tutor de inmediato
            const fallbackReply = generateClientOfflineReply(query, activeBot, isBriefMode);
            const cleanText = cleanLatexMathString(fallbackReply);

            const aiMsg = { 
                role: 'assistant', 
                content: cleanText, 
                timestamp: Date.now(),
                isOutOfScope: false,
                isRateLimited: false,
                userQuery: query
            };

            setSessions(prev => {
                const list = prev[activeBot] || [];
                const idx = list.findIndex(s => s.id === sessId);
                if (idx >= 0) {
                    const copy = [...list];
                    copy[idx] = { 
                        ...copy[idx], 
                        messages: [...copy[idx].messages, aiMsg] 
                    };
                    return { ...prev, [activeBot]: copy };
                }
                return prev;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleCopyCode = (codeText, idx) => {
        navigator.clipboard.writeText(codeText);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    // Renderizado de fragmentos inline (**negrita**, `codigo`, *cursiva*, <br>)
    const renderInlineFormatted = (text) => {
        if (!text) return null;
        const cleanText = text.replace(/\$([^$\n]+)\$/g, '$1').replace(/\$/g, '');
        const subLines = cleanText.split(/<br\s*\/?>/gi);

        return subLines.map((lineText, lIdx) => {
            const segments = lineText.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
            return (
                <span key={lIdx}>
                    {lIdx > 0 && <br />}
                    {segments.map((seg, sIdx) => {
                        if (seg.startsWith('**') && seg.endsWith('**')) {
                            return <strong key={sIdx} className="saberlab-bold">{seg.slice(2, -2)}</strong>;
                        }
                        if (seg.startsWith('`') && seg.endsWith('`')) {
                            return <code key={sIdx} className="saberlab-code-inline">{seg.slice(1, -1)}</code>;
                        }
                        if (seg.startsWith('*') && seg.endsWith('*') && seg.length > 2) {
                            return <em key={sIdx} className="saberlab-italic">{seg.slice(1, -1)}</em>;
                        }
                        return seg;
                    })}
                </span>
            );
        });
    };

    // Renderizador integral de Markdown enriquecido (Tablas, Bloques de Código, Listas, Títulos)
    const renderFormattedMessage = (content, msgIndex) => {
        if (!content) return null;
        const sanitizedContent = cleanLatexMathString(content.replace(/\[FUERA_DE_CONTEXTO\]/gi, '').trim());

        // 1. Separar bloques de código ```language ... ```
        const parts = sanitizedContent.split(/(```[\s\S]*?```)/g);

        return parts.map((part, pIdx) => {
            if (part.startsWith('```') && part.endsWith('```')) {
                const lines = part.slice(3, -3).trim().split('\n');
                let lang = 'código';
                let codeBody = part.slice(3, -3);

                if (lines.length > 1 && /^[a-zA-Z0-9_-]+$/.test(lines[0].trim())) {
                    lang = lines[0].trim();
                    codeBody = lines.slice(1).join('\n');
                }

                const codeKey = `${msgIndex}-${pIdx}`;

                return (
                    <div key={pIdx} style={{ margin: '8px 0' }}>
                        <div className="saberlab-code-header">
                            <span>💻 {lang.toUpperCase()}</span>
                            <button 
                                className="saberlab-copy-btn"
                                onClick={() => handleCopyCode(codeBody, codeKey)}
                            >
                                {copiedIndex === codeKey ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                                <span>{copiedIndex === codeKey ? 'Copiado' : 'Copiar'}</span>
                            </button>
                        </div>
                        <pre>
                            <code>{codeBody}</code>
                        </pre>
                    </div>
                );
            }

            // 2. Parsear bloques de texto (Tablas, Títulos, Listas, Párrafos)
            const lines = part.split('\n');
            const elements = [];
            let i = 0;

            while (i < lines.length) {
                const line = lines[i];
                const trimmed = line.trim();

                // A) DETECCIÓN DE TABLAS MARKDOWN
                if (trimmed.includes('|') && i + 1 < lines.length) {
                    const nextTrimmed = lines[i + 1].trim();
                    const isSeparator = /^\|?(\s*:?-+:?\s*\|?)+$/.test(nextTrimmed) && nextTrimmed.includes('-');
                    
                    if (isSeparator) {
                        const rawHeader = trimmed.replace(/^\|/, '').replace(/\|$/, '');
                        const headers = rawHeader.split('|').map(c => c.trim());
                        i += 2;

                        const rows = [];
                        while (i < lines.length) {
                            const curLine = lines[i].trim();
                            if (!curLine || !curLine.includes('|')) break;
                            const cleanRow = curLine.replace(/^\|/, '').replace(/\|$/, '');
                            const cells = cleanRow.split('|').map(c => c.trim());
                            rows.push(cells);
                            i++;
                        }

                        elements.push(
                            <div key={`tbl-${i}`} className="saberlab-ai-table-wrap">
                                <table className="saberlab-ai-table">
                                    <thead>
                                        <tr>
                                            {headers.map((h, hIdx) => (
                                                <th key={hIdx}>{renderInlineFormatted(h)}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, rIdx) => (
                                            <tr key={rIdx}>
                                                {row.map((cell, cIdx) => (
                                                    <td key={cIdx}>{renderInlineFormatted(cell)}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                        continue;
                    }
                }

                // B) ENCABEZADOS (###, ##, #)
                if (/^#{1,4}\s+/.test(trimmed)) {
                    const level = trimmed.match(/^#+/)[0].length;
                    const headingText = trimmed.replace(/^#+\s+/, '');
                    if (level === 1) {
                        elements.push(<h3 key={`h-${i}`} className="saberlab-ai-h3">{renderInlineFormatted(headingText)}</h3>);
                    } else if (level === 2) {
                        elements.push(<h4 key={`h-${i}`} className="saberlab-ai-h4">{renderInlineFormatted(headingText)}</h4>);
                    } else {
                        elements.push(<h5 key={`h-${i}`} className="saberlab-ai-h5">{renderInlineFormatted(headingText)}</h5>);
                    }
                    i++;
                    continue;
                }

                // C) LISTAS CON VIÑETAS (* o -)
                if (/^(\*|-)\s+/.test(trimmed)) {
                    const listText = trimmed.replace(/^(\*|-)\s+/, '');
                    elements.push(
                        <div key={`li-${i}`} className="saberlab-ai-list-item">
                            <span className="saberlab-bullet">•</span>
                            <span>{renderInlineFormatted(listText)}</span>
                        </div>
                    );
                    i++;
                    continue;
                }

                // D) LISTAS NUMERADAS (1. , 2. )
                if (/^\d+\.\s+/.test(trimmed)) {
                    const numMatch = trimmed.match(/^\d+\./)[0];
                    const numText = trimmed.replace(/^\d+\.\s+/, '');
                    elements.push(
                        <div key={`num-${i}`} className="saberlab-ai-list-item">
                            <span className="saberlab-num">{numMatch}</span>
                            <span>{renderInlineFormatted(numText)}</span>
                        </div>
                    );
                    i++;
                    continue;
                }

                // E) CITAS Y FÓRMULAS DESTACADAS (> ...)
                if (trimmed.startsWith('>')) {
                    const quoteText = trimmed.replace(/^>\s*/, '');
                    elements.push(
                        <div key={`quote-${i}`} className="saberlab-ai-formula-callout">
                            {renderInlineFormatted(quoteText)}
                        </div>
                    );
                    i++;
                    continue;
                }

                // F) LÍNEA DE TEXTO NORMAL O PÁRRAFO
                if (line === '') {
                    elements.push(<div key={`sp-${i}`} style={{ height: '6px' }} />);
                } else {
                    elements.push(
                        <span key={`p-${i}`} style={{ display: 'block', minHeight: '1.2em' }}>
                            {renderInlineFormatted(line)}
                        </span>
                    );
                }
                i++;
            }

            return <span key={pIdx}>{elements}</span>;
        });
    };

    return (
        <>
            {/* BOTÓN FLOTANTE DISPARADOR */}
            {!isOpen && (
                <button 
                    className={`saberlab-ai-fab ${isRoboBotActive ? 'is-robobot' : ''}`}
                    onClick={() => triggerOpenSequence()}
                    title={`Asistente Virtual SaberLab (${currentBot.name})`}
                    aria-label="Abrir Asistente IA"
                >
                    <img src={SABERLAB_LOGO} alt="SaberLab Logo" className="saberlab-ai-fab-logo" />
                </button>
            )}

            {/* CONTENEDOR FLOTANTE CON VENTANA PRINCIPAL Y PANEL LATERAL (ESTILO ASISTENCIA DUAL) */}
            {(isOpen || isRoboBotActive) && (
                <div className={`saberlab-ai-layout ${!isOpen ? 'is-layout-hidden' : ''}`} role="dialog" aria-modal="false">
                    {/* 1. CARD / PANEL LATERAL: HISTORIAL (A LA IZQUIERDA) */}
                    {isOpen && isChatWindowVisible && showHistory && (
                        <aside className="saberlab-ai-side-panel" aria-label="Historial de Conversaciones">
                            <div className="saberlab-history-header">
                                <div className="saberlab-history-title">
                                    <History size={16} color={currentBot.color} />
                                    <span>Historial</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="saberlab-history-count-badge" style={{ background: `${currentBot.color}20`, color: currentBot.color }}>
                                        {botSessions.length}
                                    </span>
                                    <button 
                                        className="saberlab-history-back-btn" 
                                        onClick={() => setShowHistory(false)} 
                                        title="Cerrar panel de historial"
                                        aria-label="Cerrar historial"
                                    >
                                        <X size={15} />
                                    </button>
                                </div>
                            </div>

                            <div className="saberlab-history-list">
                                {botSessions.length === 0 ? (
                                    <div className="saberlab-history-empty">
                                        <div className="saberlab-history-empty-icon">💬</div>
                                        <h5 className="saberlab-history-empty-title">Sin conversaciones guardadas</h5>
                                        <p>No tienes chats previos con {currentBot.name}. ¡Inicia una nueva charla!</p>
                                    </div>
                                ) : (
                                    botSessions.map(sess => (
                                        <div 
                                            key={sess.id} 
                                            id={`saberlab-sess-item-${sess.id}`}
                                            className={`saberlab-history-item ${activeSessionId === sess.id ? 'active' : ''}`}
                                            onClick={() => handleSelectSession(sess.id)}
                                        >
                                            <div className="saberlab-history-icon-box" style={{ background: `${currentBot.color}15`, color: currentBot.color }}>
                                                <MessageSquare size={16} />
                                            </div>
                                            <div className="saberlab-history-info">
                                                <div className="saberlab-history-item-title">
                                                    <span>{sess.title || 'Conversación sin título'}</span>
                                                    {activeSessionId === sess.id && (
                                                        <span className="saberlab-history-active-tag">Activa</span>
                                                    )}
                                                </div>
                                                <div className="saberlab-history-item-meta">
                                                    <span>{new Date(sess.createdAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    <span>•</span>
                                                    <span>{sess.messages?.length || 0} mensajes</span>
                                                </div>
                                            </div>
                                            <button 
                                                className="saberlab-history-del-btn"
                                                onClick={(e) => handleDeleteSession(sess.id, e)}
                                                title="Chasquido de Thanos 🫰 (Eliminar conversación)"
                                                aria-label="Eliminar con chasquido de dedos"
                                                disabled={deletingSessionIds.has(sess.id)}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </aside>
                    )}

                    {/* 2. VENTANA PRINCIPAL DE CHAT (A LA DERECHA) */}
                    {isOpen && isChatWindowVisible && (
                    <div ref={windowRef} className={`saberlab-ai-window ${isWide ? 'wide' : ''} ${showHistory ? 'has-side-panel' : ''}`}>
                    {/* Header */}
                    <div className="saberlab-ai-header">
                        <div className="saberlab-ai-header-left">
                            <div className={`saberlab-ai-avatar ${isRoboBotActive ? 'is-robobot' : ''}`}>
                                <img src={SABERLAB_LOGO} alt="Logo" className="saberlab-ai-avatar-img" />
                            </div>
                            <div className="saberlab-ai-title-wrap">
                                <h4>
                                    {currentBot.name} <Sparkles size={14} color={currentBot.color} />
                                </h4>
                                <div className="saberlab-ai-status-pill">
                                    <span className="saberlab-ai-status-dot" style={{ background: currentBot.color }} />
                                    <span>{currentBot.badge}</span>
                                </div>
                            </div>
                        </div>

                        <div className="saberlab-ai-header-actions">
                            <button 
                                className={`saberlab-ai-btn-icon ${isBriefMode ? 'active brief-active' : ''}`} 
                                onClick={() => setIsBriefMode(prev => !prev)} 
                                title={isBriefMode ? "⚡ Modo Flash ACTIVO: Respuestas cortas y directas al grano. Clic para desactivar" : "⚡ Activar Modo Flash: Respuestas rápidas y directas al grano"}
                            >
                                <Zap size={16} fill={isBriefMode ? "#f59e0b" : "none"} color={isBriefMode ? "#fef08a" : "currentColor"} />
                            </button>
                            <button 
                                className="saberlab-ai-btn-icon" 
                                onClick={handleNewChat} 
                                title="Nueva Conversación"
                            >
                                <Plus size={16} />
                            </button>
                            <button 
                                className={`saberlab-ai-btn-icon ${showHistory ? 'active' : ''}`} 
                                onClick={() => setShowHistory(prev => !prev)} 
                                title="Historial de Conversaciones"
                            >
                                <History size={15} />
                            </button>
                            <button 
                                className="saberlab-ai-btn-icon" 
                                onClick={() => setIsWide(prev => !prev)} 
                                title={isWide ? "Restaurar ancho normal (440px)" : "Duplicar ancho de la ventana (880px)"}
                            >
                                {isWide ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                            </button>
                            <button 
                                className="saberlab-ai-btn-icon" 
                                onClick={handleCloseChat} 
                                title="Cerrar Asistente IA"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    </div>

                    {/* SELECTOR DE BOTS:
                        - En EE, RE y MA -> Tutor único exclusivo asignado al curso (sin pestañas distractoras)
                        - En SIMI3D -> Selector dual de especialidades: TridiBot (Modelado 3D) e ImpriBot (Impresión 3D)
                    */}
                    {isSimiCourse && (
                        <div className="saberlab-ai-bot-selector" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <button
                                className={`saberlab-bot-tab ${activeBot === 'tridibot' ? 'active tridibot' : ''}`}
                                onClick={() => handleSwitchBot('tridibot')}
                            >
                                <Box size={14} />
                                <span>TridiBot (Modelado)</span>
                            </button>
                            <button
                                className={`saberlab-bot-tab ${activeBot === 'impribot' ? 'active impribot' : ''}`}
                                onClick={() => handleSwitchBot('impribot')}
                            >
                                <Cpu size={14} />
                                <span>ImpriBot (Impresión)</span>
                            </button>
                        </div>
                    )}

                        {/* Cuerpo de Mensajes */}
                        <div className="saberlab-ai-body">
                        {messages.length === 0 ? (
                            <div className="saberlab-ai-welcome-box">
                                <div className="saberlab-ai-welcome-logo-wrap" style={{ borderColor: currentBot.color }}>
                                    <span style={{ fontSize: '2rem' }}>{currentBot.icon}</span>
                                </div>
                                <h5 className="saberlab-ai-welcome-title">
                                    ¡Hola! Soy {currentBot.name}
                                </h5>
                                <p className="saberlab-ai-welcome-desc">
                                    {currentBot.desc}
                                </p>

                                <div className="saberlab-ai-quick-prompts">
                                    {currentBot.suggestions.map((sugText, sIdx) => (
                                        <button 
                                            key={sIdx}
                                            className="saberlab-ai-quick-btn"
                                            onClick={() => handleSendMessage(sugText)}
                                        >
                                            <span>💡</span>
                                            <span>{sugText}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={idx} className={`saberlab-msg-row ${msg.role === 'user' ? 'user' : 'ai'}`}>
                                    <div className={`saberlab-msg-avatar ${msg.role === 'user' ? 'user' : `ai ${isRoboBotActive ? 'is-robobot' : ''}`}`}>
                                        {msg.role === 'user' ? (
                                            'Tú'
                                        ) : (
                                            <img src={SABERLAB_LOGO} alt="Bot Avatar" className="saberlab-msg-avatar-img" />
                                        )}
                                    </div>
                                    <div className={`saberlab-msg-bubble ${msg.role === 'user' ? 'user' : 'ai'} ${msg.isError ? 'error' : ''}`}>
                                        {renderFormattedMessage(msg.content, idx)}

                                        {/* Guardrail Fuera de Contexto o Límite de Capacidad: Botones directos a Gemini y ChatGPT */}
                                        {msg.role === 'assistant' && (msg.isOutOfScope || msg.isRateLimited || msg.content?.includes('[FUERA_DE_CONTEXTO]')) && (
                                            <div className={`saberlab-out-of-scope-card ${msg.isRateLimited ? 'rate-limited' : ''}`}>
                                                <div className="saberlab-out-of-scope-header">
                                                    {msg.isRateLimited ? <Zap size={14} color="#f59e0b" /> : <ExternalLink size={13} />}
                                                    <span>{msg.isRateLimited ? 'LÍMITE DE CAPACIDAD ALCANZADO' : 'CONSULTA FUERA DE LA MATERIA'}</span>
                                                </div>
                                                <p className="saberlab-out-of-scope-desc">
                                                    {msg.isRateLimited 
                                                        ? 'El asistente se encuentra temporalmente al tope de su cuota de uso. Para no detener tu aprendizaje, puedes resolver tu duda ahora mismo en:'
                                                        : `Este tema no corresponde a ${currentBot.badge}. Puedes consultar directamente en:`}
                                                </p>
                                                <div className="saberlab-redirect-btns">
                                                    <a 
                                                        href="https://gemini.google.com/app" 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="saberlab-redirect-btn gemini"
                                                    >
                                                        <Sparkles size={13} />
                                                        <span>Consultar en Gemini</span>
                                                    </a>
                                                    <a 
                                                        href={`https://chatgpt.com/?q=${encodeURIComponent(msg.userQuery || '')}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="saberlab-redirect-btn chatgpt"
                                                    >
                                                        <span>🟢</span>
                                                        <span>Consultar en ChatGPT</span>
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {msg.role === 'assistant' && msg.isError && msg.retryQuery && (
                                            <div className="saberlab-msg-meta">
                                                <button 
                                                    className="saberlab-msg-retry-btn"
                                                    onClick={() => handleSendMessage(msg.retryQuery)}
                                                    title="Reintentar respuesta"
                                                >
                                                    <RotateCcw size={11} /> Reintentar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Typing Loader */}
                        {isLoading && (
                            <div className="saberlab-msg-row ai">
                                <div className={`saberlab-msg-avatar ai ${isRoboBotActive ? 'is-robobot' : ''}`}>
                                    <img src={SABERLAB_LOGO} alt="Bot Avatar" className="saberlab-msg-avatar-img" />
                                </div>
                                <div className="saberlab-ai-typing">
                                    <span className="saberlab-typing-dot" style={{ background: currentBot.color }} />
                                    <span className="saberlab-typing-dot" style={{ background: currentBot.color }} />
                                    <span className="saberlab-typing-dot" style={{ background: currentBot.color }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Barra de Entrada con Estilo Flash */}
                    <div className="saberlab-ai-input-container">
                        <div className={`saberlab-ai-input-bar ${isBriefMode ? 'flash-active' : ''}`}>
                            <textarea
                                ref={textareaRef}
                                value={inputText}
                                onChange={e => {
                                    setInputText(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={isBriefMode ? `⚡ Pregunta rápida a ${currentBot.name}...` : currentBot.placeholder}
                                rows={1}
                                className={`saberlab-ai-textarea ${isBriefMode ? 'flash-input' : ''}`}
                            />
                            <button
                                className={`saberlab-ai-send-btn ${isBriefMode ? 'flash-send' : ''}`}
                                style={{ background: isBriefMode ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' : currentBot.color }}
                                onClick={() => handleSendMessage()}
                                disabled={!inputText.trim() || isLoading}
                                title={`Enviar mensaje a ${currentBot.name} (Enter)`}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                    {/* Fin de .saberlab-ai-input-container */}
                    </div>
                    )}
                    {/* Fin de .saberlab-ai-window */}

                    {/* 3. COMPAÑERO 3D EXCLUSIVO DE ROBOBOT (SOLO EL ROBOT SIN CONTENEDOR, ANCLADO A LA DERECHA) */}
                    {isRoboBotActive && (
                        <aside 
                            className={`saberlab-ai-robobot-companion standalone-robot ${isOpen ? 'is-active' : 'is-inactive'}`} 
                            aria-label="RoboBot 3D Interactivo"
                        >
                            <div className="saberlab-robobot-iframe-wrapper">
                                <iframe 
                                    src="https://my.spline.design/genkubgreetingrobot-KpUVWUhqRjQeYHGSNgH8UlNa/" 
                                    frameBorder="0" 
                                    width="100%" 
                                    height="100%" 
                                    className="saberlab-robobot-spline-iframe"
                                    title="RoboBot 3D Companion"
                                    loading="eager"
                                />
                            </div>
                        </aside>
                    )}
                </div>
            )}
        </>
    );
}
