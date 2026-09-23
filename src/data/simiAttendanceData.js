// ── BANCO DE PALABRAS Y REGLAS DE ASISTENCIA PARA SIMI3D ──────────────────────

export const SIMI_ATTENDANCE_STATES = {
    ASISTIO: {
        id: 'asistio',
        label: 'Asistió',
        shortLabel: 'Presente',
        weight: 1.0,
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.12)',
        borderColor: 'rgba(16, 185, 129, 0.4)',
        icon: 'Check'
    },
    INCOMPLETO: {
        id: 'incompleto',
        label: 'Incompleto',
        shortLabel: 'Parcial',
        weight: 0.5,
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.12)',
        borderColor: 'rgba(245, 158, 11, 0.4)',
        icon: 'Clock'
    },
    NO_VINO: {
        id: 'no_vino',
        label: 'No vino',
        shortLabel: 'Ausente',
        weight: 0.0,
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.12)',
        borderColor: 'rgba(239, 68, 68, 0.4)',
        icon: 'X'
    }
};

export const SIMI_WORD_FAMILIES = {
    filamentos: {
        id: 'filamentos',
        title: 'Materiales',
        description: 'Polímeros termoplásticos y resinas fotopolímeras',
        icon: 'Flame',
        color: '#06b6d4',
        words: ['PLA', 'ABS', 'PETG', 'TPU', 'RESINA', 'NYLON', 'ASA']
    },
    anatomia_3d: {
        id: 'anatomia_3d',
        title: 'Anatomía',
        description: 'Componentes mecánicos, electrónicos y térmicos',
        icon: 'Cpu',
        color: '#3b82f6',
        words: ['NOZZLE', 'HOTEND', 'CAMA', 'EXTRUSOR', 'HUSILLO', 'TEFLON', 'CORREA']
    },
    slicer: {
        id: 'slicer',
        title: 'Slicer',
        description: 'Ajustes de laminado y trayectoria de código G',
        icon: 'Layers',
        color: '#8b5cf6',
        words: ['INFILL', 'CAPA', 'BRIM', 'SKIRT', 'SOPORTE', 'RAFT', 'DENSIDAD']
    },
    software: {
        id: 'software',
        title: 'Software',
        description: 'Herramientas de diseño CAD, modelado y laminación',
        icon: 'Box',
        color: '#ec4899',
        words: ['BLENDER', 'CURA', 'ORCA', 'PRUSA', 'FUSION', 'TINKER']
    },
    geometria: {
        id: 'geometria',
        title: 'Modelado',
        description: 'Topología, vértices, aristas y modificadores',
        icon: 'Sparkles',
        color: '#10b981',
        words: ['VERTICE', 'ARISTA', 'CARA', 'MALLA', 'EXTRUDE', 'BEVEL', 'BOOLEAN']
    },
    defectos: {
        id: 'defectos',
        title: 'Defectos',
        description: 'Fallos comunes de calibración y extrusión',
        icon: 'AlertTriangle',
        color: '#f59e0b',
        words: ['WARPING', 'STRINGING', 'CLOG', 'ELEFANTE', 'UNDER']
    },
    steam: {
        id: 'steam',
        title: 'STEAM',
        description: 'Cultura Maker y pedagogía en visitas a colegios',
        icon: 'School',
        color: '#14b8a6',
        words: ['STEAM', 'MAKER', 'SIMI', 'DISENO', 'ROBOT', 'TALLER']
    }
};

export const FLASH_DURATION_OPTIONS = [5, 6, 7, 8, 9, 10];

/**
 * Baraja aleatoriamente un array (Fisher-Yates)
 */
export function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Genera un reto de asistencia relámpago a partir de una familia técnica
 * Retorna: { familyKey, familyTitle, targetWord, options: string[] (barajadas) }
 */
export function generateFlashChallenge(familyKey = null) {
    const familyKeys = Object.keys(SIMI_WORD_FAMILIES);
    const chosenFamilyKey = (familyKey && SIMI_WORD_FAMILIES[familyKey]) 
        ? familyKey 
        : familyKeys[Math.floor(Math.random() * familyKeys.length)];

    const family = SIMI_WORD_FAMILIES[chosenFamilyKey];
    const availableWords = [...family.words];

    // Elegir palabra objetivo
    const targetIdx = Math.floor(Math.random() * availableWords.length);
    const targetWord = availableWords[targetIdx];

    // Remover objetivo de los disponibles para sacar 3 distractores
    availableWords.splice(targetIdx, 1);
    const shuffledDistractors = shuffleArray(availableWords);
    const distractors = shuffledDistractors.slice(0, 3);

    // Unir objetivo + 3 distractores y barajar
    const options = shuffleArray([targetWord, ...distractors]);

    return {
        familyKey: chosenFamilyKey,
        familyTitle: family.title,
        familyColor: family.color,
        targetWord,
        options
    };
}
