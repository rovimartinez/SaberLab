/**
 * gadgetsData.js — Catálogo de Recompensas e Instrumentos con iconos vectoriales técnicos
 */

export const gadgets = [
    // ── LECCIÓN 1: Fundamentos, Átomo y Cargas ──
    {
        id: 'conductores',
        name: 'Conductores y Átomo',
        description: 'Modelo atómico de Bohr y flujo de electrones libres en materiales conductores.',
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        lessonSource: 'Lección 1',
        unlocksWithLesson: 'l1',
        iconName: 'Atom',
        color: '#38bdf8',
        route: '/dashboard/rewards?tool=conductores',
    },
    {
        id: 'coulomb',
        name: 'Ley de Coulomb',
        description: 'Laboratorio de atracción y repulsión de cargas con cálculo de fuerza en Newtons.',
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        lessonSource: 'Lección 1',
        unlocksWithLesson: 'l1',
        iconName: 'ArrowLeftRight',
        color: '#ec4899',
        route: '/dashboard/rewards?tool=coulomb',
    },

    // ── LECCIÓN 2: Ley de Ohm, Ley de Watt y Resistencias ──
    {
        id: 'ley-ohm',
        name: 'Ley de Ohm y Watt',
        description: 'Simulador dinámico con cálculo en vivo de Voltaje (V), Corriente (I), Resistencia (R) y Potencia (W).',
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        lessonSource: 'Lección 2',
        unlocksWithLesson: 'l2',
        iconName: 'Zap',
        color: '#10b981',
        route: '/dashboard/rewards?tool=ley-ohm',
    },
    {
        id: 'calculadora-resistencias',
        name: 'Código de Resistencias',
        description: 'Decodificador interactivo de 4 bandas de colores y valores comerciales estándar.',
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        lessonSource: 'Lección 2',
        unlocksWithLesson: 'l2',
        iconName: 'SlidersHorizontal',
        color: '#f59e0b',
        route: '/dashboard/rewards?tool=calculadora-resistencias',
    },

    // ── LECCIÓN 3: Medición y Multímetro Digital ──
    {
        id: 'multimetro',
        name: 'Multímetro Digital',
        description: 'Instrumento de medición virtual para voltímetro en paralelo y amperímetro en serie.',
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        lessonSource: 'Lección 3',
        unlocksWithLesson: 'l3',
        iconName: 'Gauge',
        color: '#a855f7',
        route: '/dashboard/rewards?tool=multimetro',
    },

    // ── LECCIÓN 4: Redes de Circuitos Serie y Paralelo ──
    {
        id: 'simulador-circuitos',
        name: 'Simulador Serie y Paralelo',
        description: 'Análisis de circuitos multirama en serie, paralelo y cálculo de resistencia equivalente.',
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        lessonSource: 'Lección 4',
        unlocksWithLesson: 'l4',
        iconName: 'GitBranch',
        color: '#3b82f6',
        route: '/dashboard/rewards?tool=simulador-circuitos',
    },
];

export function getUnlockedGadgets(completedLessons = new Set()) {
    return gadgets.map(g => ({
        ...g,
        isLocked: false,
    }));
}

export function getGadgetUnlockedByLesson(lessonId) {
    return gadgets.find(g => g.unlocksWithLesson === lessonId) || null;
}
