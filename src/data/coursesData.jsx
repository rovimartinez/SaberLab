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
        title: 'Entradas analogicas y resolucion',
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
    'ee-m1-l1': { id: 'ee-m1-l1', title: 'Introducción a la Electricidad', load: () => import('../lessons/EE/m1/l1').then(m => m.lessonData) },
    'ee-m1-l2': { id: 'ee-m1-l2', title: 'Ley de Ohm y Herramientas de Medición', load: () => import('../lessons/EE/m1/l2').then(m => m.lessonData) },
    'ee-m1-l3': { id: 'ee-m1-l3', title: 'Análisis de Circuitos en Serie', load: () => import('../lessons/EE/m1/l3').then(m => m.lessonData) },
    'ee-m1-l4': { id: 'ee-m1-l4', title: 'Análisis de Circuitos en Paralelo', load: () => import('../lessons/EE/m1/l4').then(m => m.lessonData) },
    'ee-m1-l5': { id: 'ee-m1-l5', title: 'Análisis de Circuitos Mixtos', load: () => import('../lessons/EE/m1/l5').then(m => m.lessonData) },
    'ee-m1-l6': { id: 'ee-m1-l6', title: 'Evaluación de Fundamentos', load: () => import('../lessons/EE/m1/l6').then(m => m.lessonData) },
    'ee-m2-l7': { id: 'ee-m2-l7', title: 'Capacitores y Almacenamiento de Energía', load: () => import('../lessons/EE/m2/l7').then(m => m.lessonData) },
    'ee-m2-l8': { id: 'ee-m2-l8', title: 'Bobinas y Motores DC', load: () => import('../lessons/EE/m2/l8').then(m => m.lessonData) },
    'ee-m2-l9': { id: 'ee-m2-l9', title: 'Transistores y Control Electromecánico', load: () => import('../lessons/EE/m2/l9').then(m => m.lessonData) },
    'ee-m2-l10': { id: 'ee-m2-l10', title: 'Evaluación de Componentes', load: () => import('../lessons/EE/m2/l10').then(m => m.lessonData) },
    'ee-m3-l11': { id: 'ee-m3-l11', title: 'Circuitos Integrados - Temporización', load: () => import('../lessons/EE/m3/l11').then(m => m.lessonData) },
    'ee-m3-l12': { id: 'ee-m3-l12', title: 'Circuitos Integrados - Contadores', load: () => import('../lessons/EE/m3/l12').then(m => m.lessonData) },
    'ee-m3-l13': { id: 'ee-m3-l13', title: 'Visualización de Datos', load: () => import('../lessons/EE/m3/l13').then(m => m.lessonData) },
    'ee-m3-l14': { id: 'ee-m3-l14', title: 'Evaluación de Aplicaciones Avanzadas', load: () => import('../lessons/EE/m3/l14').then(m => m.lessonData) },
    'ee-m4-l15': { id: 'ee-m4-l15', title: 'Optimización de Prototipos', load: () => import('../lessons/EE/m4/l15').then(m => m.lessonData) },
    'ee-m4-l16': { id: 'ee-m4-l16', title: 'Presentación de Proyecto Final', load: () => import('../lessons/EE/m4/l16').then(m => m.lessonData) },


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
        duration: '17 semanas',
        modality: 'Presencial',
        description: 'Curso de fundamentos de electricidad y electrónica con enfoque STEAM, laboratorio práctico y proyecto final.',
        modules: [
            {
                id: 'm1',
                name: 'Módulo 1: Fundamentos de Electricidad y Circuitos Básicos',
                weeks: 'Semanas 1-6',
                learningOutcome: 'Analizar circuitos eléctricos básicos (serie, paralelo y mixtos) mediante la Ley de Ohm y el uso del multímetro.',
                topics: [
                    'Introducción a la electricidad',
                    'Ley de Ohm y uso del multímetro',
                    'Circuitos en serie, paralelo y mixtos',
                    'Potencia eléctrica y consumo'
                ],
                lessons: [
                    { id: 'ee-m1-l1', visible: true },
                    { id: 'ee-m1-l2', visible: true },
                    { id: 'ee-m1-l3', visible: true },
                    { id: 'ee-m1-l4', visible: true },
                    { id: 'ee-m1-l5', visible: true },
                    { id: 'ee-m1-l6', visible: true }
                ],
                evaluation: {
                    title: 'Examen 1 - Circuitos básicos',
                    date: '2 de septiembre de 2026',
                    points: 150
                }
            },
            {
                id: 'm2',
                name: 'Módulo 2: Componentes Electrónicos y Aplicaciones',
                weeks: 'Semanas 7-11',
                learningOutcome: 'Identificar y aplicar componentes electrónicos en circuitos funcionales.',
                topics: [
                    'Capacitores, relés, bobinas y motores DC',
                    'Transistores y aplicaciones básicas',
                    'Aplicaciones prácticas y control de circuitos'
                ],
                lessons: [
                    { id: 'ee-m2-l7', visible: true },
                    { id: 'ee-m2-l8', visible: true },
                    { id: 'ee-m2-l9', visible: true },
                    { id: 'ee-m2-l10', visible: true }
                ],
                evaluation: {
                    title: 'Examen 2 - Uso de componentes electrónicos',
                    date: '28 de septiembre de 2026',
                    points: 125
                }
            },
            {
                id: 'm3',
                name: 'Módulo 3: Aplicaciones Avanzadas y Diseño de Circuitos',
                weeks: 'Semanas 12-14',
                learningOutcome: 'Implementar circuitos integrados en contextos prácticos.',
                topics: [
                    'Circuitos integrados',
                    'Temporizador 555',
                    'Contadores binarios y displays de 7 segmentos'
                ],
                lessons: [
                    { id: 'ee-m3-l11', visible: true },
                    { id: 'ee-m3-l12', visible: true },
                    { id: 'ee-m3-l13', visible: true },
                    { id: 'ee-m3-l14', visible: true }
                ],
                evaluation: {
                    title: 'Examen 3 - Implementación de circuitos integrados',
                    date: '21 de octubre de 2026',
                    points: 125
                }
            },
            {
                id: 'm4',
                name: 'Módulo 4: Proyecto Final',
                weeks: 'Semanas 15-16',
                learningOutcome: 'Desarrollar, optimizar y presentar un prototipo funcional.',
                topics: [
                    'Diseño del prototipo',
                    'Optimización y presentación del proyecto'
                ],
                lessons: [
                    { id: 'ee-m4-l15', visible: true },
                    { id: 'ee-m4-l16', visible: true }
                ],
                evaluation: {
                    title: 'Proyecto Final',
                    date: '11 de noviembre de 2026',
                    points: 100
                }
            }
        ],
        groups: [],
        resources: {
            required: [
                'Protoboard 830',
                'Jumpers macho-macho',
                'Fuente 5 V o portapilas 4xAA',
                'Multímetro digital',
                'Resistencias ¼ W',
                'LEDs 5 mm',
                'Potenciómetro 10 kΩ (opcional)'
            ],
            module2: [
                'Capacitores 100 nF, 10 µF, 100 µF',
                'Transistor BJT NPN y PNP',
                'Diodos 1N4007',
                'Relé 5 V',
                'Motor DC pequeño',
                'Buzzer activo 5 V',
                'Pulsadores / switch'
            ],
            module3: [
                'CI 555',
                'CI 74LS93',
                'CI CD4511',
                'Display de 7 segmentos',
                'Resistencias de 220 Ω a 330 Ω',
                'Pulsadores o DIP switch de 4 posiciones'
            ],
            software: [
                'Software de simulación',
                'Manuales técnicos',
                'Guías de laboratorio',
                'Videos tutoriales'
            ]
        }
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
