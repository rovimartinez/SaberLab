import React from 'react';
import { Zap, Code, FlaskConical, Box, Bot, Brain } from 'lucide-react';

/**
 * 1. REGISTRO DE LECCIONES (El "Banco" de contenido)
 * Cada lección es una entidad independiente con su título y cargador de contenido.
 */
export const LESSONS_REGISTRY = {
    // Robótica Educativa
    're-m1-l1': {
        id: 're-m1-l1',
        title: 'Mi primer parpadeo',
        load: () => import('../lessons/RE/m1/l1').then(m => m.lessonData)
    },
    're-m1-l2': {
        id: 're-m1-l2',
        title: 'Semáforos y Variables',
        load: () => import('../lessons/RE/m1/l2').then(m => m.lessonData)
    },
    're-m1-l3': {
        id: 're-m1-l3',
        title: 'Entradas digitales y pulsadores',
        load: () => import('../lessons/RE/m1/l3').then(m => m.lessonData)
    },
    're-m1-l4': {
        id: 're-m1-l4',
        title: 'Monitor serie y depuracion inicial',
        load: () => import('../lessons/RE/m1/l4').then(m => m.lessonData)
    },
    're-m1-l5': {
        id: 're-m1-l5',
        title: 'Evaluacion teorica del modulo 1',
        load: () => import('../lessons/RE/m1/l5').then(m => m.lessonData)
    },
    're-m2-l1': { id: 're-m2-l1', title: 'Sensores de Distancia', load: null },
    're-m2-l2': { id: 're-m2-l2', title: 'Sensores de Luz (LDR)', load: null },
    're-m2-l3': { id: 're-m2-l3', title: 'Sensores de Temperatura', load: null },
    're-m2-l4': { id: 're-m2-l4', title: 'Sensor de Humedad y Suelo', load: null },
    're-m3-l1': { id: 're-m3-l1', title: 'Servomotores', load: null },
    're-m3-l2': { id: 're-m3-l2', title: 'Motores DC (L298N)', load: null },
    're-m3-l3': { id: 're-m3-l3', title: 'Pantallas LCD', load: null },
    're-m3-l4': { id: 're-m3-l4', title: 'Joystick y Control', load: null },
    're-m4-l1': { id: 're-m4-l1', title: 'Robot seguidor de línea', load: null },
    're-m4-l2': { id: 're-m4-l2', title: 'Sistema domótico básico', load: null },
    're-m4-l3': { id: 're-m4-l3', title: 'Brazo Robótico Pro', load: null },
    're-m4-l4': { id: 're-m4-l4', title: 'Proyecto Integrador Final', load: null },
    
    // --- ELECTRICIDAD (EE) ---
    'ee-concepts': { id: 'ee-concepts', title: 'Conceptos básicos de electricidad', load: null },
    'ee-voltage': { id: 'ee-voltage', title: 'Tensión, Corriente y Resistencia', load: null },
    'ee-ohm': { id: 'ee-ohm', title: 'Ley de Ohm y Potencia', load: null },
    'ee-resistors': { id: 'ee-resistors', title: 'Resistores y Código de Colores', load: null },
    'ee-capacitors': { id: 'ee-capacitors', title: 'Capacitores y Almacenamiento', load: null },
    'ee-diodes': { id: 'ee-diodes', title: 'Diodos y Rectificación', load: null },
    'ee-series': { id: 'ee-series', title: 'Circuitos en Serie', load: null },
    'ee-parallel': { id: 'ee-parallel', title: 'Circuitos en Paralelo', load: null },
    'ee-breadboard': { id: 'ee-breadboard', title: 'Uso de la Protoboard', load: null },

    // --- PROGRAMACIÓN (FP) ---
    'fp-program': { id: 'fp-program', title: '¿Qué es la Programación?', load: null },
    'fp-variables': { id: 'fp-variables', title: 'Variables y Tipos de Datos', load: null },
    'fp-operators': { id: 'fp-operators', title: 'Operadores Matemáticos y Lógicos', load: null },
    'fp-conditionals': { id: 'fp-conditionals', title: 'Condicionales (If-Else)', load: null },
    'fp-loops-for': { id: 'fp-loops-for', title: 'Bucles y Ciclos (For)', load: null },
    'fp-loops-while': { id: 'fp-loops-while', title: 'Ciclos Condicionales (While)', load: null },
    'fp-functions': { id: 'fp-functions', title: 'Funciones y Modularidad', load: null },
    'fp-arrays': { id: 'fp-arrays', title: 'Arreglos y Listas', load: null },

    // --- QUIMICA (MQ) ---
    'mq-atoms': { id: 'mq-atoms', title: 'Átomos, Protones y Neutrones', load: null },
    'mq-table': { id: 'mq-table', title: 'La Tabla Periódica Interactiva', load: null },
    'mq-bonds': { id: 'mq-bonds', title: 'Enlaces Iónicos y Covalentes', load: null },
    'mq-reactions': { id: 'mq-reactions', title: 'Reacciones Químicas Básicas', load: null },
    'mq-states': { id: 'mq-states', title: 'Estados de la Materia', load: null },
    'mq-lab-virtual': { id: 'mq-lab-virtual', title: 'Simulación de Laboratorio', load: null },

    // --- MODELADO 3D (MA) ---
    'ma-concepts': { id: 'ma-concepts', title: 'Introducción al Espacio 3D', load: null },
    'ma-tools': { id: 'ma-tools', title: 'Extrusión y Modelado Básico', load: null },
    'ma-textures': { id: 'ma-textures', title: 'Mapeado UV y Texturizado', load: null },
    'ma-lighting': { id: 'ma-lighting', title: 'Iluminación y Cámaras', load: null },
    'ma-animation': { id: 'ma-animation', title: 'Keyframes y Animación', load: null },
    'ma-rendering': { id: 'ma-rendering', title: 'Motores de Renderizado', load: null },

    // --- TENDENCIAS (TD) ---
    'td-ai': { id: 'td-ai', title: 'Inteligencia Artificial y Redes Neuronales', load: null },
    'td-blockchain': { id: 'td-blockchain', title: 'Blockchain y Criptoactivos', load: null },
    'td-iot': { id: 'td-iot', title: 'IoT: El Internet de las Cosas', load: null },
    'td-cyber': { id: 'td-cyber', title: 'Ciberseguridad y Ética Digital', load: null },
    'td-metaverse': { id: 'td-metaverse', title: 'Realidad Virtual y Metaverso', load: null },
    'td-green': { id: 'td-green', title: 'Tecnologías Verdes y Sostenibles', load: null }
};

/**
 * 2. DEFINICIÓN DE CURSOS
 * Estructura que organiza qué lecciones (por ID) pertenecen a qué curso.
 */
export const COURSES_DEFINITION = [
    {
        id: 1,
        abbr: 'EE',
        slug: 'electricidad-y-electronica',
        name: 'Electricidad y Electrónica Básica',
        icon: <Zap size={28} />,
        color: '#f59e0b',
        modules: [
            {
                id: 'm1',
                name: 'Módulo 1: Fundamentos Eléctricos',
                lessons: [
                    { id: 'ee-concepts', visible: true },
                    { id: 'ee-voltage', visible: true },
                    { id: 'ee-ohm', visible: true }
                ]
            },
            {
                id: 'm2',
                name: 'Módulo 2: Componentes Pasivos',
                lessons: [
                    { id: 'ee-resistors', visible: true },
                    { id: 'ee-capacitors', visible: true },
                    { id: 'ee-diodes', visible: true }
                ]
            },
            {
                id: 'm3',
                name: 'Módulo 3: Circuitos y Prototipado',
                lessons: [
                    { id: 'ee-series', visible: true },
                    { id: 'ee-parallel', visible: true },
                    { id: 'ee-breadboard', visible: true }
                ]
            }
        ],
        groups: []
    },
    {
        id: 2,
        abbr: 'FP',
        slug: 'fundamentos-de-programacion',
        name: 'Fundamentos de Programación',
        icon: <Code size={28} />,
        color: '#3b82f6',
        modules: [
            {
                id: 'm1',
                name: 'Módulo 1: Lógica y Algoritmos',
                lessons: [
                    { id: 'fp-program', visible: true },
                    { id: 'fp-variables', visible: true },
                    { id: 'fp-operators', visible: true }
                ]
            },
            {
                id: 'm2',
                name: 'Módulo 2: Estructuras de Control',
                lessons: [
                    { id: 'fp-conditionals', visible: true },
                    { id: 'fp-loops-for', visible: true },
                    { id: 'fp-loops-while', visible: true }
                ]
            },
            {
                id: 'm3',
                name: 'Módulo 3: Funciones y Datos',
                lessons: [
                    { id: 'fp-functions', visible: true },
                    { id: 'fp-arrays', visible: true }
                ]
            }
        ],
        groups: []
    },
    {
        id: 3,
        abbr: 'MQ',
        slug: 'quimica-tecnologica',
        name: 'Mediaciones Tecnológicas en la Química',
        icon: <FlaskConical size={28} />,
        color: '#10b981',
        modules: [
            {
                id: 'm1',
                name: 'Módulo 1: Estructura de la Materia',
                lessons: [
                    { id: 'mq-atoms', visible: true },
                    { id: 'mq-table', visible: true },
                    { id: 'mq-bonds', visible: true }
                ]
            },
            {
                id: 'm2',
                name: 'Módulo 2: Reacciones y Estados',
                lessons: [
                    { id: 'mq-reactions', visible: true },
                    { id: 'mq-states', visible: true },
                    { id: 'mq-lab-virtual', visible: true }
                ]
            }
        ],
        groups: []
    },
    {
        id: 4,
        abbr: 'MA',
        slug: 'modelado-y-animacion-3d',
        name: 'Modelado y Animación 3D',
        icon: <Box size={28} />,
        color: '#ec4899',
        modules: [
            {
                id: 'm1',
                name: 'Módulo 1: Fundamentos 3D',
                lessons: [
                    { id: 'ma-concepts', visible: true },
                    { id: 'ma-tools', visible: true }
                ]
            },
            {
                id: 'm2',
                name: 'Módulo 2: Apariencia y Realismo',
                lessons: [
                    { id: 'ma-textures', visible: true },
                    { id: 'ma-lighting', visible: true }
                ]
            },
            {
                id: 'm3',
                name: 'Módulo 3: Movimiento y Entrega',
                lessons: [
                    { id: 'ma-animation', visible: true },
                    { id: 'ma-rendering', visible: true }
                ]
            }
        ],
        groups: []
    },
    {
        id: 5,
        abbr: 'RE',
        slug: 'robotica-educativa',
        name: 'Robótica Educativa',
        icon: <Bot size={28} />,
        color: '#a855f7',
        modules: [
            {
                id: 'm1',
                name: 'Módulo 1: Fundamentos y Lógica Digital',
                lessons: [
                    { id: 're-m1-l1', visible: true },
                    { id: 're-m1-l2', visible: true },
                    { id: 're-m1-l3', visible: true },
                    { id: 're-m1-l4', visible: true },
                    { id: 're-m1-l5', visible: true }
                ]
            },
            {
                id: 'm2',
                name: 'Módulo 2: El Mundo Físico (Sensores)',
                lessons: [
                    { id: 're-m2-l1', visible: true },
                    { id: 're-m2-l2', visible: true },
                    { id: 're-m2-l3', visible: true },
                    { id: 're-m2-l4', visible: true }
                ]
            },
            {
                id: 'm3',
                name: 'Módulo 3: Movimiento y Actuadores',
                lessons: [
                    { id: 're-m3-l1', visible: true },
                    { id: 're-m3-l2', visible: true },
                    { id: 're-m3-l3', visible: true },
                    { id: 're-m3-l4', visible: true }
                ]
            },
            {
                id: 'm4',
                name: 'Módulo 4: Integración y Proyectos',
                lessons: [
                    { id: 're-m4-l1', visible: true },
                    { id: 're-m4-l2', visible: true },
                    { id: 're-m4-l3', visible: true },
                    { id: 're-m4-l4', visible: true }
                ]
            }
        ],
        groups: []
    },
    {
        id: 6,
        abbr: 'TD',
        slug: 'tendencias-tecnologicas',
        name: 'Tendencias y Desarrollo en Tecnología',
        icon: <Brain size={28} />,
        color: '#f97316',
        modules: [
            {
                id: 'm1',
                name: 'Módulo 1: Inteligencia y Futuro',
                lessons: [
                    { id: 'td-ai', visible: true },
                    { id: 'td-blockchain', visible: true }
                ]
            },
            {
                id: 'm2',
                name: 'Módulo 2: Conectividad y Redes',
                lessons: [
                    { id: 'td-iot', visible: true },
                    { id: 'td-cyber', visible: true }
                ]
            },
            {
                id: 'm3',
                name: 'Módulo 3: Nuevos Mundos',
                lessons: [
                    { id: 'td-metaverse', visible: true },
                    { id: 'td-green', visible: true }
                ]
            }
        ],
        groups: []
    }
];

/**
 * UTILIDADES para manejar la independencia
 */

// Obtiene la metadata básica de una lección (título, etc)
export const getLessonInfo = (id) => LESSONS_REGISTRY[id] || { title: 'Lección desconocida' };

// Obtiene la metadata completa de la lección, incluyendo curso y módulo al que pertenece
export const getFullLessonPath = (fullId) => {
    // Si el ID viene en formato re-m1-l1, intentamos desglosarlo
    const parts = fullId.split('-');
    const lessonIdOnly = parts.length > 0 ? parts[parts.length - 1] : fullId;

    for (const course of COURSES_DEFINITION) {
        // Solo buscamos en el curso que coincida si el prefijo está presente (Abbr o Slug)
        const isMatch = parts.length > 0 && (
            course.abbr.toLowerCase() === parts[0].toLowerCase() || 
            course.slug.toLowerCase() === parts[0].toLowerCase()
        );
        if (parts.length > 0 && !isMatch) continue;

        for (const module of course.modules) {
            // Solo buscamos en el módulo que coincida si el prefijo está presente
            if (parts.length > 1 && module.id.toLowerCase() !== parts[1].toLowerCase()) continue;

            const lessonMatch = module.lessons.find(l => l.id === lessonIdOnly || l.id === fullId);
            if (lessonMatch) {
                return { course, module, lesson: LESSONS_REGISTRY[fullId] || { title: lessonMatch.title || 'Lección' } };
            }
        }
    }
    
    // Fallback genérico si no se encuentra
    return { 
        course: COURSES_DEFINITION.find(c => c.abbr === 'RE'), 
        module: { name: 'Módulo 1' }, 
        lesson: LESSONS_REGISTRY[fullId] || { title: 'Lección' } 
    };
};

// Obtiene los datos completos (teoría, flashcards) cargando el archivo .jsx
export const getLessonContent = async (id) => {
    const lesson = LESSONS_REGISTRY[id];
    if (!lesson || !lesson.load) return null;
    return await lesson.load();
};

export const getCourseBySlug = (slug) => COURSES_DEFINITION.find(c => c.slug === slug);
export const getCourseByAbbr = (abbr) => COURSES_DEFINITION.find(c => c.abbr === abbr);
export const getCourseById = (id) => COURSES_DEFINITION.find(c => c.id === parseInt(id));

// Helper versátil que busca por cualquier identificador (Slug o Abbr)
export const getCourseByIdentifier = (id) => {
    if (!id) return null;
    const normalized = id.toLowerCase();
    return COURSES_DEFINITION.find(c => 
        c.abbr.toLowerCase() === normalized || 
        c.slug.toLowerCase() === normalized
    );
};
