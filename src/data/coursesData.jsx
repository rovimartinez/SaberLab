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
        duration: '17 semanas (3 de agosto – 27 de noviembre de 2026)',
        period: '2026-2',
        credits: 4,
        modality: 'Presencial',
        teacher: 'Ronny Martinez Reyes',
        institution: 'CampusVirtual UNIMAG',
        schedule: [
            { day: 'Lunes', time: '4:00 PM – 6:00 PM', location: 'EIE-Electricidad y Magnetismo' },
            { day: 'Miércoles', time: '6:00 PM – 8:00 PM', location: 'Sierra Nevada Sur Salón 201' }
        ],
        complementaryDates: [
            { event: 'Nivelación', date: '18 de noviembre de 2026' },
            { event: 'Reclamaciones de notas', date: '23 de noviembre de 2026' },
            { event: 'Publicación de notas finales', date: '25 de noviembre de 2026' }
        ],
        description: 'Curso de fundamentos de electricidad y electrónica con enfoque STEAM y metodología ABP (Aprendizaje Basado en Proyectos), laboratorios prácticos y proyecto final.',
        modules: [
            {
                id: 'm1',
                name: 'Módulo 1: Fundamentos de Electricidad y Circuitos Básicos',
                weeks: 'Semanas 1 a 6',
                learningOutcome: 'RA1: Analizar circuitos eléctricos básicos (serie, paralelo y mixtos) mediante la aplicación de principios fundamentales como la Ley de Ohm y el uso del multímetro.',
                topics: [
                    'Introducción a la electricidad y estructura atómica',
                    'Ley de Ohm, Ley de Watt y uso del multímetro digital',
                    'Circuitos en serie, en paralelo y mixtos serie-paralelo',
                    'Diagnóstico de fallas (cortocircuito y circuito abierto)'
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
                    title: 'Examen 1 - Circuitos Básicos',
                    date: '2 de septiembre de 2026',
                    points: 150
                }
            },
            {
                id: 'm2',
                name: 'Módulo 2: Componentes Electrónicos y Aplicaciones',
                weeks: 'Semanas 7 a 11',
                learningOutcome: 'RA2: Identificar y aplicar los principales componentes electrónicos en circuitos funcionales, comprendiendo su comportamiento y aplicaciones.',
                topics: [
                    'Capacitores, relés de 5V, bobinas y motores DC',
                    'Transistores BJT NPN (2N2222/BC547) y PNP (BC557)',
                    'Diodos rectificadores 1N4007 y buzzer activo 5V',
                    'Aplicaciones prácticas y control electromecánico'
                ],
                lessons: [
                    { id: 'ee-m2-l7', visible: true },
                    { id: 'ee-m2-l8', visible: true },
                    { id: 'ee-m2-l9', visible: true },
                    { id: 'ee-m2-l10', visible: true }
                ],
                evaluation: {
                    title: 'Examen 2 - Uso de Componentes Electrónicos',
                    date: '28 de septiembre de 2026',
                    points: 125
                }
            },
            {
                id: 'm3',
                name: 'Módulo 3: Aplicaciones Avanzadas y Diseño de Circuitos',
                weeks: 'Semanas 12 a 14',
                learningOutcome: 'RA3: Implementar circuitos integrados en contextos prácticos.',
                topics: [
                    'Temporizador CI NE555 en configuración astable',
                    'Contador binario de 4 bits CI 74LS93',
                    'Decodificador BCD a 7 segmentos CI CD4511 y Display Cátodo Común'
                ],
                lessons: [
                    { id: 'ee-m3-l11', visible: true },
                    { id: 'ee-m3-l12', visible: true },
                    { id: 'ee-m3-l13', visible: true },
                    { id: 'ee-m3-l14', visible: true }
                ],
                evaluation: {
                    title: 'Examen 3 - Implementación de Circuitos Integrados',
                    date: '21 de octubre de 2026',
                    points: 125
                }
            },
            {
                id: 'm4',
                name: 'Módulo 4: Proyecto Final',
                weeks: 'Semanas 15 a 16',
                learningOutcome: 'Desarrollo, optimización y presentación de prototipo funcional con justificación técnica.',
                topics: [
                    'Diseño y ensamblaje del prototipo funcional',
                    'Optimización, documentación técnica y sustentación'
                ],
                lessons: [
                    { id: 'ee-m4-l15', visible: true },
                    { id: 'ee-m4-l16', visible: true }
                ],
                evaluation: {
                    title: 'Presentación del Proyecto Final',
                    date: '11 de noviembre de 2026',
                    points: 100
                }
            }
        ],
        groups: [],
        resources: {
            module1: {
                adquirir: [
                    'Protoboard 830 puntos',
                    'Jumpers macho-macho',
                    'Fuente 5 V (USB) o portapilas 4×AA (≤9 V)',
                    'Multímetro digital con puntas de prueba',
                    'Resistencias ¼ W (220 Ω, 330 Ω, 1 kΩ, 2.2 kΩ, 4.7 kΩ, 10 kΩ)',
                    'LEDs 5 mm (rojo y verde)',
                    'Potenciómetro 10 kΩ (opcional)'
                ]
            },
            module2: {
                reutilizar: [
                    'Protoboard 830, Jumpers, Fuente 5V / portapilas, Multímetro digital, Resistencias ¼ W y LEDs 5 mm'
                ],
                adquirir: [
                    'Capacitores electrolíticos (100 nF, 10 µF, 100 µF)',
                    'Transistores BJT NPN (2N2222 o BC547) y PNP (BC557) — 2–3 de c/u',
                    'Diodos rectificadores 1N4007',
                    'Relé 5 V',
                    'Motor DC pequeño + rueda o hélice',
                    'Buzzer activo 5 V',
                    'Pulsadores / switch'
                ]
            },
            module3: {
                reutilizar: [
                    'Protoboard 830, Jumpers, Fuente 5V, Multímetro, Resistencias (220Ω, 330Ω, 1kΩ, 10kΩ), LEDs, Pulsadores y Condensador 10 µF'
                ],
                adquirir: [
                    '1× CI NE555 (Temporizador astable) + 1× R 6.8 kΩ + 1× Potenciómetro 100 kΩ',
                    '1× CI 74LS93 (Contador binario de 4 bits)',
                    '1× CI CD4511 (Decodificador BCD a 7 segmentos)',
                    '1× Display de 7 segmentos cátodo común',
                    '7× Resistencias de 220 Ω a 330 Ω (¼ W)',
                    '4× Pulsadores o 1 DIP switch de 4 posiciones'
                ]
            },
            module4: {
                reutilizar: [
                    'Protoboard, jumpers, fuente, multímetro, componentes de M2 y CIs de M3'
                ],
                adquirir: [
                    'Materiales extra según el proyecto autorizado por el docente'
                ]
            },
            software: [
                'Software de simulación SaberLab',
                'Manuales técnicos y guías de laboratorio',
                'Videos tutoriales y materiales multimedia complementarios'
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

// Helper versátil que busca por cualquier identificador (Slug, Abbr o ID numérico)
export const getCourseByIdentifier = (id) => {
    if (!id) return null;
    const normalized = String(id).toLowerCase();
    return COURSES_DEFINITION.find(c => 
        c.abbr.toLowerCase() === normalized || 
        c.slug.toLowerCase() === normalized ||
        String(c.id) === normalized
    );
};

// Obtiene la siguiente lección dentro del mismo curso
export const getNextLesson = (currentFullId) => {
    if (!currentFullId) return null;
    const lessonPath = getFullLessonPath(currentFullId);
    if (!lessonPath || !lessonPath.course) return null;

    const course = lessonPath.course;
    const allLessons = [];

    (course.modules || []).forEach(m => {
        (m.lessons || []).forEach(l => {
            const rawId = l.id;
            const fullId = rawId.includes('-') ? rawId : `${course.abbr.toLowerCase()}-${m.id}-${rawId}`;
            const shortId = rawId.includes('-') ? rawId.split('-').pop() : rawId;
            const info = LESSONS_REGISTRY[fullId] || { title: l.title || 'Lección' };
            allLessons.push({
                fullId,
                shortId,
                moduleId: m.id,
                title: info.title || 'Lección',
                courseSlug: course.slug
            });
        });
    });

    const currentIndex = allLessons.findIndex(l => l.fullId === currentFullId);
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
        return allLessons[currentIndex + 1];
    }
    return null;
};
