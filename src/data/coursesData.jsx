import React from 'react';
import { Zap, Code, FlaskConical, Box, Bot, Brain, Layers } from 'lucide-react';

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
    're-m1-l6': {
        id: 're-m1-l6',
        title: 'Evaluación 1: Fundamentos y Lógica Digital',
        load: () => import('../lessons/RE/m1/l6e').then(m => m.lessonData)
    },
    're-m1-eval': {
        id: 're-m1-eval',
        title: 'Evaluación 1: Fundamentos y Lógica Digital',
        load: () => import('../lessons/RE/m1/l6e').then(m => m.lessonData)
    },
    're-m2-l1': { id: 're-m2-l1', title: 'Funciones Personalizadas en C++', load: () => import('../lessons/RE/m2/l1').then(m => m.lessonData) },
    're-m2-l2': { id: 're-m2-l2', title: 'Motores DC y Puente H (L298N)', load: () => import('../lessons/RE/m2/l2').then(m => m.lessonData) },
    're-m2-l3': { id: 're-m2-l3', title: 'Sensores Infrarrojos (IR) y PIR', load: () => import('../lessons/RE/m2/l3').then(m => m.lessonData) },
    're-m2-l4': { id: 're-m2-l4', title: 'Sensor Ultrasónico (HC-SR04)', load: () => import('../lessons/RE/m2/l4').then(m => m.lessonData) },
    're-m2-eval': { id: 're-m2-eval', title: 'Evaluación M2: Control, Actuadores y Sensores', load: null },
    're-m3-l1': { id: 're-m3-l1', title: 'Servomotores', load: null },
    're-m3-l2': { id: 're-m3-l2', title: 'Buzzers', load: null },
    're-m3-l3': { id: 're-m3-l3', title: 'Programación Avanzada con Ciclos', load: null },
    're-m3-l4': { id: 're-m3-l4', title: 'Sistemas de Alarma con Sensores y Actuadores', load: null },
    're-m4-l1': { id: 're-m4-l1', title: 'Robot seguidor de línea', load: null },
    're-m4-l2': { id: 're-m4-l2', title: 'Sistema domótico básico', load: null },
    're-m4-l3': { id: 're-m4-l3', title: 'Brazo Robótico Pro', load: null },
    're-m4-l4': { id: 're-m4-l4', title: 'Proyecto Integrador Final', load: null },
    
    // --- ELECTRICIDAD (EE) ---
    'ee-m1-l1': { id: 'ee-m1-l1', title: 'Fundamentos de Electricidad, Historia y Magnitudes Físicas', load: () => import('../lessons/EE/m1/l1').then(m => m.lessonData) },
    'ee-m1-l2': { id: 'ee-m1-l2', title: 'Circuitos Eléctricos, Ley de Ohm y Medición', load: () => import('../lessons/EE/m1/l2').then(m => m.lessonData) },
    'ee-m1-l3': { id: 'ee-m1-l3', title: 'Circuitos en Serie, Leyes de Kirchhoff y Medición', load: () => import('../lessons/EE/m1/l3').then(m => m.lessonData) },
    'ee-m1-l4': { id: 'ee-m1-l4', title: 'Análisis de Circuitos en Paralelo, Ley de Corrientes (LCK) y Divisor de Corriente', load: () => import('../lessons/EE/m1/l4').then(m => m.lessonData) },
    'ee-m1-l5': { id: 'ee-m1-l5', title: 'Análisis de Circuitos Mixtos Serie-Paralelo', load: () => import('../lessons/EE/m1/l5').then(m => m.lessonData) },
    'ee-m1-l6': { id: 'ee-m1-l6', title: 'Evaluación 1 - Fundamentos Eléctricos', load: () => import('../lessons/EE/m1/l6e').then(m => m.lessonData) },
    'ee-m2-l7': { id: 'ee-m2-l7', title: 'Capacitores y Almacenamiento de Energía', load: () => import('../lessons/EE/m2/l7').then(m => m.lessonData) },
    'ee-m2-l8': { id: 'ee-m2-l8', title: 'Bobinas e Inducción Electromagnética / Motores DC', load: () => import('../lessons/EE/m2/l8').then(m => m.lessonData) },
    'ee-m2-l9': { id: 'ee-m2-l9', title: 'Diodos Semiconductores y Rectificación', load: () => import('../lessons/EE/m2/l9').then(m => m.lessonData) },
    'ee-m2-l10': { id: 'ee-m2-l10', title: 'Transistores BJT como Interruptor y Amplificador', load: () => import('../lessons/EE/m2/l10').then(m => m.lessonData) },
    'ee-m2-eval': { id: 'ee-m2-eval', title: 'Examen 2 - Uso de Componentes Electrónicos', load: null },
    'ee-m3-l11': { id: 'ee-m3-l11', title: 'Temporizador CI NE555 (Modo Astable y Monoestable)', load: () => import('../lessons/EE/m3/l11').then(m => m.lessonData) },
    'ee-m3-l12': { id: 'ee-m3-l12', title: 'Contadores Binarios y Divisores de Frecuencia (CI 74LS93)', load: () => import('../lessons/EE/m3/l12').then(m => m.lessonData) },
    'ee-m3-l13': { id: 'ee-m3-l13', title: 'Decodificadores BCD y Visualización en Displays de 7 Segmentos (CD4511)', load: () => import('../lessons/EE/m3/l13').then(m => m.lessonData) },
    'ee-m3-l14': { id: 'ee-m3-l14', title: 'Evaluación 3 - Aplicaciones Avanzadas y Circuitos Integrados', load: () => import('../lessons/EE/m3/l14').then(m => m.lessonData) },
    'ee-m4-l15': { id: 'ee-m4-l15', title: 'Lectura de Planos Esquemáticos, Ensamble y Optimización de Prototipos', load: () => import('../lessons/EE/m4/l15').then(m => m.lessonData) },
    'ee-m4-l16': { id: 'ee-m4-l16', title: 'Evaluación 4 - Sustentación y Presentación del Proyecto Final', load: () => import('../lessons/EE/m4/l16').then(m => m.lessonData) },


    // --- QUIMICA (MQ) ---
    'mq-atoms': { id: 'mq-atoms', title: 'Átomos, Protones y Neutrones', load: null },
    'mq-table': { id: 'mq-table', title: 'La Tabla Periódica Interactiva', load: null },
    'mq-bonds': { id: 'mq-bonds', title: 'Enlaces Iónicos y Covalentes', load: null },
    'mq-reactions': { id: 'mq-reactions', title: 'Reacciones Químicas Básicas', load: null },
    'mq-states': { id: 'mq-states', title: 'Estados de la Materia', load: null },
    'mq-lab-virtual': { id: 'mq-lab-virtual', title: 'Simulación de Laboratorio', load: null },

    // --- MODELADO Y ANIMACIÓN 3D (MA) ---
    // Módulo 1: Introducción y Modelado Básico
    'ma-m1-l1': { id: 'ma-m1-l1', title: 'Espacio 3D, Interfaz de Blender y Navegación', load: () => import('../lessons/MA/m1/l1').then(m => m.lessonData) },
    'ma-m1-l2': { id: 'ma-m1-l2', title: 'Primitivas 3D y Transformaciones Fundamentales', load: () => import('../lessons/MA/m1/l2').then(m => m.lessonData) },
    'ma-m1-l3': { id: 'ma-m1-l3', title: 'Modo Edición y Topología Poligonal', load: null },
    'ma-m1-l4': { id: 'ma-m1-l4', title: 'Herramientas de Modelado Esenciales', load: null },
    'ma-m1-l5': { id: 'ma-m1-l5', title: 'Examen 1 - Fundamentos de Modelado 3D', load: null },
    // Módulo 2: Continuación Modelado Básico y Hard-Surface
    'ma-m2-l6': { id: 'ma-m2-l6', title: 'Modificadores No Destructivos Clave', load: null },
    'ma-m2-l7': { id: 'ma-m2-l7', title: 'Modelado Hard-Surface Orientado a Proyecto', load: null },
    'ma-m2-l8': { id: 'ma-m2-l8', title: 'Sombreado, Normales y Materiales PBR', load: null },
    'ma-m2-l9': { id: 'ma-m2-l9', title: 'Examen 2 - Entrega de Proyecto: Modelado de Objetos 3D', load: null },
    // Módulo 3: Creación de Personajes y Modelado Orgánico
    'ma-m3-l10': { id: 'ma-m3-l10', title: 'Proporciones y Blocking de Personajes', load: null },
    'ma-m3-l11': { id: 'ma-m3-l11', title: 'Modelado y Flujo de Malla (Edge Flow)', load: null },
    'ma-m3-l12': { id: 'ma-m3-l12', title: 'Ropa, Accesorios y Limpieza de Malla', load: null },
    'ma-m3-l13': { id: 'ma-m3-l13', title: 'Examen 3 - Entrega de Proyecto: Creación de Personaje 3D', load: null },
    // Módulo 4: Animación 3D, Movimiento y la Vida
    'ma-m4-l14': { id: 'ma-m4-l14', title: 'Fundamentos de Animación, Keyframes y Timeline', load: null },
    'ma-m4-l15': { id: 'ma-m4-l15', title: 'Dope Sheet, Graph Editor y Curvas de Interpolación', load: null },
    'ma-m4-l16': { id: 'ma-m4-l16', title: 'Rigging Básico de Personajes (Armatures)', load: null },
    'ma-m4-l17': { id: 'ma-m4-l17', title: 'Animando Personajes, Iluminación, Cámara y Render', load: null },
    'ma-m4-l18': { id: 'ma-m4-l18', title: 'Examen 4 - Entrega de Proyecto Final: Animación 3D Integral', load: null },

    // --- SEMILLERO DE INVESTIGACIÓN EN MODELADO E IMPRESIÓN 3D (SIMI) ---
    // Fase 1: Fundamentación y Mallas para Manufactura
    'simi-m1-l1': { id: 'simi-m1-l1', title: 'Introducción a la Fabricación Digital y Tolerancias', load: null },
    'simi-m1-l2': { id: 'simi-m1-l2', title: 'Modelado Paramétrico y Geometrías Manifold', load: null },
    'simi-m1-l3': { id: 'simi-m1-l3', title: 'Análisis de Mallas y Formatos de Fabricación (.STL, .STEP, .3MF)', load: null },
    'simi-m1-eval': { id: 'simi-m1-eval', title: 'Hito 1 - Validación de Mallas y Diseño Paramétrico', load: null },
    // Fase 2: Tecnologías FDM/SLA y Slicing Avanzado
    'simi-m2-l1': { id: 'simi-m2-l1', title: 'Ciencia de Polímeros y Resinas Fotopoliméricas', load: null },
    'simi-m2-l2': { id: 'simi-m2-l2', title: 'Estrategias de Laminado (Slicing) y Patrones de Relleno', load: null },
    'simi-m2-l3': { id: 'simi-m2-l3', title: 'Diagnóstico de Fallos y Calibración de Máquinas', load: null },
    'simi-m2-eval': { id: 'simi-m2-eval', title: 'Hito 2 - Calibración y Optimización de Slicing', load: null },
    // Fase 3: Post-Procesado e Ingeniería Inversa
    'simi-m3-l1': { id: 'simi-m3-l1', title: 'Acabados Superficiales, Curado UV e Inserciones Roscadas', load: null },
    'simi-m3-l2': { id: 'simi-m3-l2', title: 'Digitalización 3D por Escáner y Fotogrametría', load: null },
    'simi-m3-l3': { id: 'simi-m3-l3', title: 'Ensayos Mecánicos de Tracción, Flexión e Impacto', load: null },
    'simi-m3-eval': { id: 'simi-m3-eval', title: 'Hito 3 - Informe Técnico de Post-Procesado y Ensayos', load: null },
    // Fase 4: Semillero de Proyectos I+D+i
    'simi-m4-l1': { id: 'simi-m4-l1', title: 'Metodología de Investigación y Redacción Científica (IEEE/MinCiencias)', load: null },
    'simi-m4-l2': { id: 'simi-m4-l2', title: 'Desarrollo de Prototipos Funcionales STEAM', load: null },
    'simi-m4-l3': { id: 'simi-m4-l3', title: 'Sustentación de Proyectos y Producción de Pósters', load: null },
    'simi-m4-eval': { id: 'simi-m4-eval', title: 'Hito Final - Sustentación de Proyecto de Investigación SIMI', load: null }
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
                    { id: 'ee-m1-l5', visible: true }
                ],
                evaluation: {
                    id: 'ee-m1-l6e',
                    title: 'Examen 1 - Fundamentos Eléctricos',
                    date: '2 Sep 2026',
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
                    id: 'ee-m2-eval',
                    title: 'Examen 2 - Uso de Componentes Electrónicos',
                    date: '28 Sep 2026',
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
                    id: 'ee-m3-l14',
                    title: 'Examen 3 - Implementación de Circuitos Integrados',
                    date: '21 Oct 2026',
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
                    id: 'ee-m4-l16',
                    title: 'Presentación del Proyecto Final',
                    date: '11 Nov 2026',
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
        duration: '17 semanas (3 de agosto – 27 de noviembre de 2026)',
        period: '2026-2',
        credits: 3,
        modality: 'Presencial',
        teacher: 'Ronny Martinez Reyes',
        institution: 'CampusVirtual UNIMAG',
        schedule: [
            { day: 'Lunes', time: '6:00 PM – 9:00 PM', location: 'Bloque 8 Sala Informática Fac Educación' }
        ],
        complementaryDates: [
            { event: 'Nivelación y publicación de notas finales', date: '23 de noviembre de 2026' }
        ],
        description: 'Curso integral de modelado y animación 3D con Blender: desde primitivas y topología poligonal hasta creación de personajes estilizados, rigging esquelético, iluminación, renderizado y animación orientada a proyectos.',
        modules: [
            {
                id: 'm1',
                name: 'Módulo 1: Introducción al Modelado 3D y Modelado Básico',
                weeks: 'Semanas 1 a 4',
                learningOutcome: 'Comprender el espacio tridimensional cartesiano, dominar la navegación y los atajos esenciales de Blender, y modelar objetos básicos mediante primitivas y herramientas poligonales.',
                topics: [
                    'Introducción al espacio 3D, interfaz de Blender y navegación cartesiana',
                    'Uso de primitivas 3D y transformaciones de precisión (G, R, S)',
                    'Modo Edición y topología poligonal (vértices, aristas y caras)',
                    'Herramientas esenciales: Extrusión, Inset, Bevel y Loop Cut orientados a proyecto'
                ],
                lessons: [
                    { id: 'ma-m1-l1', visible: true },
                    { id: 'ma-m1-l2', visible: true },
                    { id: 'ma-m1-l3', visible: true },
                    { id: 'ma-m1-l4', visible: true },
                    { id: 'ma-m1-l5', visible: true }
                ],
                evaluation: {
                    id: 'ma-m1-l5',
                    title: 'Examen 1 - Fundamentos de Modelado 3D (Teórico-Práctico)',
                    date: '31 de agosto de 2026',
                    points: 125
                }
            },
            {
                id: 'm2',
                name: 'Módulo 2: Continuación Modelado Básico y Hard-Surface',
                weeks: 'Semanas 5 a 8',
                learningOutcome: 'Diseñar objetos 3D complejos y props hard-surface orientados a proyecto mediante modificadores no destructivos, simetría y aplicación de materiales.',
                topics: [
                    'Modificadores clave: Mirror, Subdivision Surface, Solidify y Array',
                    'Modelado Hard-Surface y ensamblaje de objetos orientados a proyecto',
                    'Sombreado suave vs plano (Smooth/Flat) y corrección de normales',
                    'Materiales y color con shader Principled BSDF'
                ],
                lessons: [
                    { id: 'ma-m2-l6', visible: true },
                    { id: 'ma-m2-l7', visible: true },
                    { id: 'ma-m2-l8', visible: true },
                    { id: 'ma-m2-l9', visible: true }
                ],
                evaluation: {
                    id: 'ma-m2-l9',
                    title: 'Examen 2 - Entrega de Proyecto: Modelado de Objetos 3D',
                    date: '28 de septiembre de 2026',
                    points: 125
                }
            },
            {
                id: 'm3',
                name: 'Módulo 3: Creación de Personajes y Modelado Orgánico',
                weeks: 'Semanas 9 a 12',
                learningOutcome: 'Construir un personaje 3D estilizado respetando proporciones anatómicas, flujo de bucles (edge flow), vestimenta, accesorios y limpieza de malla.',
                topics: [
                    'Blocking y proporciones de personajes a partir de referencias',
                    'Modelado de cabeza, rostro, extremidades y bucles de articulación',
                    'Modelado de prendas, accesorios y unificación de elementos',
                    'Limpieza de malla: eliminación de dobles y orientación de normales'
                ],
                lessons: [
                    { id: 'ma-m3-l10', visible: true },
                    { id: 'ma-m3-l11', visible: true },
                    { id: 'ma-m3-l12', visible: true },
                    { id: 'ma-m3-l13', visible: true }
                ],
                evaluation: {
                    id: 'ma-m3-l13',
                    title: 'Examen 3 - Entrega de Proyecto: Creación de Personaje 3D',
                    date: '19 de octubre de 2026',
                    points: 125
                }
            },
            {
                id: 'm4',
                name: 'Módulo 4: Animación 3D, Movimiento y la Vida',
                weeks: 'Semanas 13 a 17',
                learningOutcome: 'Dar vida a objetos y personajes aplicando principios de animación, keyframes, interpolación de curvas, emparentado esquelético (rigging) y render final.',
                topics: [
                    'Principios de animación, keyframes en Timeline y Dope Sheet (animando objetos)',
                    'Graph Editor, curvas Bézier, aceleración y física de rebote',
                    'Rigging básico con Armatures, modo pose y pesos automáticos',
                    'Animación de personajes, iluminación escénica, cámara y render final'
                ],
                lessons: [
                    { id: 'ma-m4-l14', visible: true },
                    { id: 'ma-m4-l15', visible: true },
                    { id: 'ma-m4-l16', visible: true },
                    { id: 'ma-m4-l17', visible: true },
                    { id: 'ma-m4-l18', visible: true }
                ],
                evaluation: {
                    id: 'ma-m4-l18',
                    title: 'Examen 4 - Entrega de Proyecto Final: Animación 3D Integral',
                    date: '9 de noviembre de 2026',
                    points: 125
                }
            }
        ],
        groups: [],
        resources: {
            software: [
                'Blender 3D (Software Libre y de Código Abierto - blender.org)',
                'CampusVirtual UNIMAG'
            ],
            fuentes: [
                { title: 'Blender Oficial (Descargas y Documentación)', url: 'https://www.blender.org/' },
                { title: 'Blender Manual Oficial en Español', url: 'https://docs.blender.org/manual/es/latest/' }
            ]
        }
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
                    { id: 're-m1-l5', visible: true },
                    { id: 're-m1-l6', visible: true }
                ],
                evaluation: {
                    id: 're-m1-eval',
                    title: 'Evaluación 1: Fundamentos y Lógica Digital',
                    date: '4 Sep 2026',
                    points: 150
                }
            },
            {
                id: 'm2',
                name: 'Módulo 2: Funciones, Actuadores y Sensores Avanzados',
                weeks: 'Semanas 5 a 8',
                learningOutcome: 'Crear funciones modulares en C++, controlar motores DC mediante Puente H (L298N) y procesar lecturas de sensores IR, PIR y Ultrasónico.',
                topics: [
                    'Funciones personalizadas en C++ (parámetros, retorno y modularización de código)',
                    'Motores DC y driver Puente H (L298N) con cambio de sentido y velocidad PWM',
                    'Sensores Infrarrojos (IR TCRT5000) y detección de presencia/movimiento PIR',
                    'Sensor Ultrasónico (HC-SR04) para cálculo de distancia por tiempo de pulso (pulseIn)'
                ],
                lessons: [
                    { id: 're-m2-l1', visible: true },
                    { id: 're-m2-l2', visible: true },
                    { id: 're-m2-l3', visible: true },
                    { id: 're-m2-l4', visible: true }
                ],
                evaluation: {
                    id: 're-m2-eval',
                    title: 'Evaluación Módulo 2: Funciones, Actuadores y Sensores',
                    date: '25 Sep 2026',
                    points: 150
                }
            },
            {
                id: 'm3',
                name: 'Módulo 3: Servomotores, Buzzers y Sistemas de Alarma',
                topics: [
                    'Servomotores',
                    'Buzzers',
                    'Programación avanzada con ciclos',
                    'Sistemas de alarma con sensores y actuadores'
                ],
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
                ],
                evaluation: {
                    id: 're-m4-eval',
                    title: 'Proyecto Final Integrador',
                    date: '13 Nov 2026',
                    points: 50
                }
            }
        ],
        groups: [],
        resources: {
            software: [
                'Autodesk Tinkercad (https://www.tinkercad.com/)',
                'Simulador Virtual Arduino SaberLab',
                'Videos oficiales de C++ para Arduino - Prof. Ronny Martinez'
            ],
            fuentes: [
                { title: 'Autodesk Tinkercad: Laboratorio y Simulación Virtual', url: 'https://www.tinkercad.com/' },
                { title: '01   Control de un LED con C++', url: 'https://www.youtube.com/watch?v=vQbSGJRJoJ8' },
                { title: '02   Variable int', url: 'https://www.youtube.com/watch?v=_SoRsNnhs9s' },
                { title: '03   Monitor en serie', url: 'https://www.youtube.com/watch?v=Aq6lEjhf0CQ' },
                { title: '04   Control dos LED con C++', url: 'https://www.youtube.com/watch?v=Ll6Z0f0AN44' }
            ]
        }
    },
    {
        id: 6,
        abbr: 'SIMI',
        slug: 'semillero-modelado-impresion-3d',
        name: 'Semillero de Investigación en Modelado e Impresión 3D',
        icon: <Layers size={28} />,
        color: '#06b6d4',
        duration: 'Semillero Permanente I+D+i (2026-2)',
        period: '2026-2',
        credits: 3,
        modality: 'Presencial / Híbrida',
        teacher: 'Ronny Martinez Reyes',
        institution: 'CampusVirtual UNIMAG',
        schedule: [
            { day: 'Viernes', time: '4:00 PM – 7:00 PM', location: 'Laboratorio de Prototipado y Fabricación Digital' }
        ],
        complementaryDates: [
            { event: 'Presentación de Avances de Semillero', date: '15 de octubre de 2026' },
            { event: 'Sustentación de Prototipos Finales', date: '20 de noviembre de 2026' }
        ],
        description: 'Semillero de investigación dedicado al diseño paramétrico, optimización topológica, ciencia de materiales para manufactura aditiva (FDM/SLA), post-procesado, ingeniería inversa y formulación de proyectos científicos.',
        modules: [
            {
                id: 'm1',
                name: 'Fase 1: Fundamentación, Diseño Paramétrico y Mallas Manifold',
                weeks: 'Semanas 1 a 4',
                learningOutcome: 'Dominar la geometría tridimensional orientada a manufactura aditiva, verificando tolerancias, espesores de pared y estanqueidad de mallas manifold.',
                topics: [
                    'Metodologías de investigación en fabricación digital',
                    'Modelado paramétrico de precisión para tolerancias mecánicas',
                    'Análisis de mallas manifold, no manifold y formatos de exportación (.STL, .STEP, .3MF)'
                ],
                lessons: [
                    { id: 'simi-m1-l1', visible: true },
                    { id: 'simi-m1-l2', visible: true },
                    { id: 'simi-m1-l3', visible: true }
                ],
                evaluation: {
                    id: 'simi-m1-eval',
                    title: 'Hito 1 - Validación de Mallas y Diseño Paramétrico',
                    date: '28 de agosto de 2026',
                    points: 125
                }
            },
            {
                id: 'm2',
                name: 'Fase 2: Tecnologías de Impresión 3D y Slicing Avanzado',
                weeks: 'Semanas 5 a 8',
                learningOutcome: 'Comprender el comportamiento reológico y térmico de polímeros/resinas y optimizar parámetros de laminado (slicing) para maximizar la calidad mecánica y estética.',
                topics: [
                    'Ciencia de polímeros (PLA, PETG, ABS, TPU) y resinas fotopoliméricas',
                    'Estrategias de laminado: altura de capa adaptativa, rellenos giroidales y soportes orgánicos',
                    'Calibración de flujo, retracción, temperatura y resolución de fallos'
                ],
                lessons: [
                    { id: 'simi-m2-l1', visible: true },
                    { id: 'simi-m2-l2', visible: true },
                    { id: 'simi-m2-l3', visible: true }
                ],
                evaluation: {
                    id: 'simi-m2-eval',
                    title: 'Hito 2 - Calibración y Optimización de Slicing',
                    date: '25 de septiembre de 2026',
                    points: 125
                }
            },
            {
                id: 'm3',
                name: 'Fase 3: Post-Procesado, Ensayos Mecánicos e Ingeniería Inversa',
                weeks: 'Semanas 9 a 12',
                learningOutcome: 'Aplicar técnicas de acabado superficial, inserciones mecánicas, escaneo 3D y ensayos destructivos/no destructivos para validar la resistencia de piezas.',
                topics: [
                    'Técnicas de acabado superficial, curado UV, lijado e inserciones roscadas por calor',
                    'Digitalización tridimensional por fotogrametría y escáner de luz estructurada',
                    'Ensayos mecánicos de tracción, flexión y análisis de anisotropía de capa'
                ],
                lessons: [
                    { id: 'simi-m3-l1', visible: true },
                    { id: 'simi-m3-l2', visible: true },
                    { id: 'simi-m3-l3', visible: true }
                ],
                evaluation: {
                    id: 'simi-m3-eval',
                    title: 'Hito 3 - Informe Técnico de Post-Procesado y Ensayos',
                    date: '23 de octubre de 2026',
                    points: 125
                }
            },
            {
                id: 'm4',
                name: 'Fase 4: Semillero de Proyectos I+D+i y Producción Científica',
                weeks: 'Semanas 13 a 17',
                learningOutcome: 'Formular, ejecutar y sustentar un proyecto funcional de investigación aplicada con rigor metodológico y documentación técnica apta para divulgación.',
                topics: [
                    'Estructuración de artículos científicos (formato IEEE / MinCiencias) y bitácoras de diseño',
                    'Desarrollo y ensamble de prototipos funcionales STEAM / Robótica',
                    'Producción de pósters de investigación y sustentación ante pares evaluadores'
                ],
                lessons: [
                    { id: 'simi-m4-l1', visible: true },
                    { id: 'simi-m4-l2', visible: true },
                    { id: 'simi-m4-l3', visible: true }
                ],
                evaluation: {
                    id: 'simi-m4-eval',
                    title: 'Hito Final - Sustentación de Proyecto de Investigación SIMI',
                    date: '20 de noviembre de 2026',
                    points: 125
                }
            }
        ],
        groups: [],
        resources: {
            software: [
                'OrcaSlicer / Ultimaker Cura / PrusaSlicer (Laminadores de código abierto)',
                'Blender 3D & Fusion 360 (CAD paramétrico)',
                'MeshMixer / 3D Builder (Reparación de mallas)',
                'CampusVirtual UNIMAG'
            ],
            fuentes: [
                { title: 'Repositorio Oficial de Investigación SIMI', url: 'https://saberlab.pages.dev/' },
                { title: 'OrcaSlicer Manual & Calibration Guide', url: 'https://github.com/SoftFever/OrcaSlicer' },
                { title: 'Prusa 3D Printing Handbook & Material Guide', url: 'https://help.prusa3d.com/' }
            ]
        }
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

// Obtiene la lección previa dentro del mismo curso
export const getPreviousLesson = (currentFullId) => {
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
    if (currentIndex > 0) {
        return allLessons[currentIndex - 1];
    }
    return null;
};

// Obtiene el color temático de un curso (con soporte para personalización del Admin)
export const getCourseColor = (abbr, defaultFallback = '#38bdf8') => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('saberlab-course-colors');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed[abbr]) return parsed[abbr];
            }
        } catch {
            // fallback
        }
    }
    const def = COURSES_DEFINITION.find(c => c.abbr === abbr);
    return def?.color || defaultFallback;
};


