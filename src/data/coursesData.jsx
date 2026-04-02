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
    
    // Lecciones de relleno para completar la estructura (Pendientes de archivo .jsx)
    'ee-concepts': { id: 'ee-concepts', title: 'Conceptos básicos de electricidad', load: null },
    'ee-voltage': { id: 'ee-voltage', title: 'Tensión y corriente', load: null },
    'ee-resistance': { id: 'ee-resistance', title: 'Resistencia eléctrica', load: null },
    'ee-resistors': { id: 'ee-resistors', title: 'Resistores', load: null },
    
    'fp-program': { id: 'fp-program', title: '¿Qué es un programa?', load: null },
    'fp-variables': { id: 'fp-variables', title: 'Variables y tipos de datos', load: null },
    'fp-operators': { id: 'fp-operators', title: 'Operadores', load: null },
    
    'mq-atoms': { id: 'mq-atoms', title: 'Átomos y moléculas', load: null },
    'mq-table': { id: 'mq-table', title: 'Tabla periódica', load: null },
    'mq-bonds': { id: 'mq-bonds', title: 'Enlaces químicos', load: null },
    
    'ma-concepts': { id: 'ma-concepts', title: 'Conceptos básicos de modelado', load: null },
    'ma-tools': { id: 'ma-tools', title: 'Herramientas de transformación', load: null },
    'ma-textures': { id: 'ma-textures', title: 'Materiales y texturas', load: null },
    
    'td-ai': { id: 'td-ai', title: 'Inteligencia Artificial', load: null },
    'td-blockchain': { id: 'td-blockchain', title: 'Blockchain y NFTs', load: null },
    'td-iot': { id: 'td-iot', title: 'Internet de las Cosas', load: null }
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
                name: 'Módulo 1: Introducción a la Electricidad',
                lessons: [
                    { id: 'ee-concepts', visible: true },
                    { id: 'ee-voltage', visible: true },
                    { id: 'ee-resistance', visible: true }
                ]
            },
            {
                id: 'm2',
                name: 'Módulo 2: Componentes Electrónicos',
                lessons: [
                    { id: 'ee-resistors', visible: true }
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
                name: 'Módulo 1: Conceptos Iniciales',
                lessons: [
                    { id: 'fp-program', visible: true },
                    { id: 'fp-variables', visible: true },
                    { id: 'fp-operators', visible: true }
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
                    { id: 'ma-tools', visible: true },
                    { id: 'ma-textures', visible: true }
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
                    { id: 'l1', visible: true },
                    { id: 'l2', visible: true }
                ]
            }
        ],
        groups: [
            {
                id: 'g1', name: '2026-I Grupo 1', teacher: 'Ronny Martinez', students: [
                    { id: 8, name: 'Diego Fernández', progress: 100 },
                    { id: 9, name: 'Lucía Morales', progress: 75 },
                    { id: 10, name: 'Miguel Torres', progress: 60 }
                ]
            }
        ]
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
                name: 'Módulo 1: Futuro y Tecnología',
                lessons: [
                    { id: 'td-ai', visible: true },
                    { id: 'td-blockchain', visible: true },
                    { id: 'td-iot', visible: true }
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
