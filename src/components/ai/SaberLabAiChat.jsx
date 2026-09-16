import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
    Sparkles, Send, X, Trash2, Copy, Check, Box, Cpu, RotateCcw,
    Maximize2, Minimize2, Plus, History, MessageSquare, Clock, Zap,
    ExternalLink, Users, Shield, BookOpen
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/useAuth';
import '../../styles/SaberLabAiChat.css';

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

function getStoredSessions(userId = 'guest') {
    const storageKey = `saberlab_ai_sessions_${userId}_v3`;
    try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            return sanitizeSessions(JSON.parse(saved));
        }

        // Migración retrocompatible del formato v2 si existía
        const oldSaved = localStorage.getItem('saberlab_ai_sessions_v2');
        if (oldSaved) {
            return sanitizeSessions(JSON.parse(oldSaved));
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
    if (p.includes('modelado-y-animacion-3d') || p.includes('/ma/') || p.includes('ma-m') || p.includes('ma-') || p.includes('/courses/3') || p.includes('/my-courses/3')) {
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
            if (s === '3' || s === 'MA') {
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
    if (pAbbr === 'MA' || pAbbr === '3') {
        return { courseAbbr: 'MA', courseTitle: 'Modelado y Animación 3D', botId: 'tridibot', isSimi: false };
    }
    if (pAbbr === 'SIMI' || pAbbr === '6') {
        return { courseAbbr: 'SIMI', courseTitle: 'Semillero SIMI3D', botId: 'impribot', isSimi: true };
    }

    // 4. Fallback canónico predeterminado de SaberLab: Electricidad y Electrónica (EE)
    return { courseAbbr: 'EE', courseTitle: 'Electricidad y Electrónica', botId: 'electrobot', isSimi: false };
}

export default function SaberLabAiChat() {
    const location = useLocation();
    const { user, isStaff, isStaffUser, enrolledCourses } = useAuth();
    const userId = user?.id || 'guest';
    const isStaffOrAdmin = isStaff || isStaffUser;

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

    const { courseAbbr, courseTitle, botId: expectedBotId, isSimi: isSimiCourse } = resolveCourseContext(location.pathname, enrolledCourses);
    const isSingleBotCourse = !isSimiCourse;

    const [isOpen, setIsOpen] = useState(false);
    const [activeBot, setActiveBot] = useState(() => {
        if (!isSimiCourse) return expectedBotId;
        const saved = localStorage.getItem(`saberlab_active_bot_${userId}`);
        if (saved === 'tridibot' || saved === 'impribot') return saved;
        return 'impribot';
    });

    const [sessions, setSessions] = useState(() => getStoredSessions(userId));
    const [activeSessionId, setActiveSessionId] = useState(() => {
        const initialBot = !isSimiCourse ? expectedBotId : (localStorage.getItem(`saberlab_active_bot_${userId}`) || 'impribot');
        return localStorage.getItem(`saberlab_active_session_id_${userId}_${initialBot}`) || null;
    });
    const [isWide, setIsWide] = useState(() => {
        return localStorage.getItem('saberlab_chat_wide') === 'true';
    });
    const [isBriefMode, setIsBriefMode] = useState(() => {
        return localStorage.getItem('saberlab_ai_brief_mode') === 'true';
    });
    const [showHistory, setShowHistory] = useState(false);
    const [historyTab, setHistoryTab] = useState('mine'); // 'mine' | 'audit'
    const [auditSessions, setAuditSessions] = useState([]);
    const [isLoadingAudit, setIsLoadingAudit] = useState(false);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Sincronizar bot al navegar dentro de un curso o cambiar de curso activo
    useEffect(() => {
        if (!isSimiCourse) {
            if (activeBot !== expectedBotId) {
                setActiveBot(expectedBotId);
                const list = sessions[expectedBotId] || [];
                const savedSessionForBot = localStorage.getItem(`saberlab_active_session_id_${userId}_${expectedBotId}`);
                if (savedSessionForBot && list.some(s => s.id === savedSessionForBot)) {
                    setActiveSessionId(savedSessionForBot);
                } else if (list.length > 0) {
                    setActiveSessionId(list[0].id);
                } else {
                    setActiveSessionId(null);
                }
            }
        } else {
            // En SIMI sólo están permitidos tridibot e impribot
            if (activeBot !== 'tridibot' && activeBot !== 'impribot') {
                setActiveBot('impribot');
                const list = sessions.impribot || [];
                const savedSessionForBot = localStorage.getItem(`saberlab_active_session_id_${userId}_impribot`);
                if (savedSessionForBot && list.some(s => s.id === savedSessionForBot)) {
                    setActiveSessionId(savedSessionForBot);
                } else if (list.length > 0) {
                    setActiveSessionId(list[0].id);
                } else {
                    setActiveSessionId(null);
                }
            }
        }
    }, [expectedBotId, isSimiCourse, location.pathname, courseTick, activeBot, sessions, userId]);

    // Recargar sesiones si cambia el usuario autenticado
    useEffect(() => {
        setSessions(getStoredSessions(userId));
    }, [userId]);

    const currentBot = BOTS_CONFIG[activeBot] || BOTS_CONFIG.tridibot;
    const botSessions = sessions[activeBot] || [];
    const currentSession = botSessions.find(s => s.id === activeSessionId) || null;
    const messages = currentSession ? currentSession.messages : [];

    // Guardar en localStorage exclusivo del estudiante
    useEffect(() => {
        try {
            localStorage.setItem(`saberlab_ai_sessions_${userId}_v3`, JSON.stringify(sessions));
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
        if (isOpen && !showHistory) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading, isOpen, activeBot, showHistory]);

    // Enfocar textarea al abrir
    useEffect(() => {
        if (isOpen && !showHistory) {
            setTimeout(() => textareaRef.current?.focus(), 150);
        }
    }, [isOpen, activeBot, showHistory]);

    // Cargar sesiones de auditoría para docentes/admin
    const loadAuditSessions = async () => {
        setIsLoadingAudit(true);
        try {
            const res = await api('/ai/chat?mode=audit');
            if (res?.data?.success && Array.isArray(res.data.sessions)) {
                setAuditSessions(res.data.sessions);
            }
        } catch (err) {
            console.warn('[Audit Load Warning]', err);
        } finally {
            setIsLoadingAudit(false);
        }
    };

    const handleSwitchBot = (newBot) => {
        if (!isSimiCourse) return; // En cursos estándar el bot es único e inamovible
        if (newBot !== 'tridibot' && newBot !== 'impribot') return;
        setActiveBot(newBot);
        const otherSessions = sessions[newBot] || [];
        const savedSessionForBot = localStorage.getItem(`saberlab_active_session_id_${userId}_${newBot}`);
        if (savedSessionForBot && otherSessions.some(s => s.id === savedSessionForBot)) {
            setActiveSessionId(savedSessionForBot);
        } else if (otherSessions.length > 0) {
            setActiveSessionId(otherSessions[0].id);
        } else {
            setActiveSessionId(null);
        }
    };

    const handleNewChat = () => {
        setActiveSessionId(null);
        setShowHistory(false);
        setInputText('');
        setTimeout(() => textareaRef.current?.focus(), 150);
    };

    const handleSelectSession = (sessId) => {
        setActiveSessionId(sessId);
        setShowHistory(false);
        setTimeout(() => textareaRef.current?.focus(), 150);
    };

    const handleSelectAuditSession = async (auditSess) => {
        try {
            const res = await api(`/ai/chat?session_id=${auditSess.id}`);
            if (res?.data?.success && Array.isArray(res.data.messages)) {
                const targetBot = auditSess.bot_id || 'tridibot';
                setActiveBot(targetBot);
                const loadedSession = {
                    id: auditSess.id,
                    title: auditSess.title || 'Conversación Supervisada',
                    createdAt: auditSess.created_at,
                    messages: res.data.messages.map(m => ({
                        role: m.role,
                        content: m.content,
                        isOutOfScope: !!m.is_out_of_scope,
                        timestamp: m.created_at
                    }))
                };
                setSessions(prev => ({
                    ...prev,
                    [targetBot]: [loadedSession, ...(prev[targetBot] || []).filter(s => s.id !== auditSess.id)]
                }));
                setActiveSessionId(auditSess.id);
                setShowHistory(false);
            }
        } catch (err) {
            console.error('[Audit Session Load Error]', err);
        }
    };

    const handleDeleteSession = async (sessId, e) => {
        e?.stopPropagation();
        if (window.confirm('¿Deseas eliminar esta conversación de tu historial?')) {
            // Intentar eliminar de Cloudflare D1 si está sincronizada
            try {
                await api(`/ai/chat?session_id=${sessId}`, { method: 'DELETE' });
            } catch {}

            setSessions(prev => {
                const updatedList = (prev[activeBot] || []).filter(s => s.id !== sessId);
                return { ...prev, [activeBot]: updatedList };
            });
            if (activeSessionId === sessId) {
                setActiveSessionId(null);
            }
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
            const isLimitErr = err?.status === 429 || /rate|limit|429|quota/i.test(err?.message || '');

            const errorMsg = isLimitErr ? {
                role: 'assistant',
                content: `Me siento al límite de mi capacidad en este momento ${currentBot.icon}. He atendido muchísimas consultas y mis circuitos necesitan un breve respiro para recargar energía.\n\nLamento no poder ayudarte ahora mismo con esta respuesta. Para que no te quedes con la duda y sigas avanzando con tu aprendizaje, te sugiero consultarla directamente con Gemini o ChatGPT:`,
                timestamp: Date.now(),
                isRateLimited: true,
                userQuery: query
            } : { 
                role: 'assistant', 
                content: `⚠️ No fue posible conectar con ${currentBot.name} en este momento.`, 
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
                    className="saberlab-ai-fab"
                    onClick={() => setIsOpen(true)}
                    title={`Asistente Virtual SaberLab (${currentBot.name})`}
                    aria-label="Abrir Asistente IA"
                >
                    <img src={SABERLAB_LOGO} alt="SaberLab Logo" className="saberlab-ai-fab-logo" />
                </button>
            )}

            {/* VENTANA DE CHAT FLOTANTE */}
            {isOpen && (
                <div className={`saberlab-ai-window ${isWide ? 'wide' : ''}`} role="dialog" aria-modal="false">
                    {/* Header */}
                    <div className="saberlab-ai-header">
                        <div className="saberlab-ai-header-left">
                            <div className="saberlab-ai-avatar">
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
                                onClick={() => {
                                    setShowHistory(prev => !prev);
                                    if (!showHistory && historyTab === 'audit') loadAuditSessions();
                                }} 
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
                                onClick={() => setIsOpen(false)} 
                                title="Minimizar Chat"
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

                    {/* VISTA PRINCIPAL: CHAT vs HISTORIAL */}
                    {showHistory ? (
                        <div className="saberlab-ai-history-view">
                            {/* Pestañas de Historial (Estudiante vs Auditoría Docente) */}
                            {isStaffOrAdmin && (
                                <div className="saberlab-history-tabs">
                                    <button 
                                        className={`saberlab-history-tab ${historyTab === 'mine' ? 'active' : ''}`}
                                        onClick={() => setHistoryTab('mine')}
                                    >
                                        <MessageSquare size={13} />
                                        <span>Mis Conversaciones</span>
                                    </button>
                                    <button 
                                        className={`saberlab-history-tab ${historyTab === 'audit' ? 'active' : ''}`}
                                        onClick={() => {
                                            setHistoryTab('audit');
                                            loadAuditSessions();
                                        }}
                                    >
                                        <Shield size={13} />
                                        <span>Supervisión Alumnos</span>
                                        <span className="saberlab-audit-badge">Staff</span>
                                    </button>
                                </div>
                            )}

                            <div className="saberlab-history-header">
                                <div className="saberlab-history-title">
                                    <Clock size={16} color={currentBot.color} />
                                    <span>
                                        {historyTab === 'audit' ? 'Historial Global de Alumnos' : `Chats con ${currentBot.name}`}
                                    </span>
                                    <span className="saberlab-history-count-badge" style={{ background: `${currentBot.color}20`, color: currentBot.color }}>
                                        {historyTab === 'audit' ? auditSessions.length : botSessions.length}
                                    </span>
                                </div>
                                <button 
                                    className="saberlab-history-back-btn" 
                                    onClick={() => setShowHistory(false)} 
                                    title="Volver a la conversación activa"
                                >
                                    <X size={15} />
                                    <span>Volver</span>
                                </button>
                            </div>

                            <div className="saberlab-history-list">
                                {historyTab === 'audit' ? (
                                    isLoadingAudit ? (
                                        <div className="saberlab-history-empty">
                                            <p>Cargando registros de auditoría pedagógica...</p>
                                        </div>
                                    ) : auditSessions.length === 0 ? (
                                        <div className="saberlab-history-empty">
                                            <div className="saberlab-history-empty-icon">🛡️</div>
                                            <h5 className="saberlab-history-empty-title">Sin consultas registradas</h5>
                                            <p>Aún no hay preguntas de estudiantes registradas en Cloudflare D1.</p>
                                        </div>
                                    ) : (
                                        auditSessions.map(sess => (
                                            <div 
                                                key={sess.id} 
                                                className="saberlab-history-item"
                                                onClick={() => handleSelectAuditSession(sess)}
                                            >
                                                <div className="saberlab-history-icon-box" style={{ background: '#0284c715', color: '#0284c7' }}>
                                                    <Users size={16} />
                                                </div>
                                                <div className="saberlab-history-info">
                                                    <div className="saberlab-history-item-title">
                                                        <span>{sess.title || 'Conversación de Estudiante'}</span>
                                                    </div>
                                                    <div className="saberlab-history-item-meta">
                                                        <strong>{sess.user_name || sess.user_email || 'Estudiante'}</strong>
                                                        <span>•</span>
                                                        <span>{sess.course_abbr || 'Curso'}</span>
                                                        <span>•</span>
                                                        <span>{new Date(sess.updated_at || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )
                                ) : (
                                    botSessions.length === 0 ? (
                                        <div className="saberlab-history-empty">
                                            <div className="saberlab-history-empty-icon">💬</div>
                                            <h5 className="saberlab-history-empty-title">Sin conversaciones guardadas</h5>
                                            <p>No tienes chats previos con {currentBot.name}. ¡Inicia una nueva charla abajo!</p>
                                        </div>
                                    ) : (
                                        botSessions.map(sess => (
                                            <div 
                                                key={sess.id} 
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
                                                    title="Eliminar conversación del historial"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        ))
                                    )
                                )}
                            </div>

                            <div className="saberlab-history-footer">
                                <button 
                                    className="saberlab-history-new-btn"
                                    style={{ background: currentBot.color }}
                                    onClick={handleNewChat}
                                >
                                    <Plus size={16} />
                                    <span>Iniciar Nueva Conversación</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
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
                                    <div className={`saberlab-msg-avatar ${msg.role === 'user' ? 'user' : 'ai'}`}>
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
                                <div className="saberlab-msg-avatar ai">
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
                    </>
                    )}
                </div>
            )}
        </>
    );
}
