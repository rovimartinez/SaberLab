/**
 * ranksData.js — Sistema de rangos de estudiantes
 *
 * El rango se calcula por el número de lecciones completadas
 */

export const ranks = [
    {
        name: 'Explorador',
        minLessons: 0,
        color: '#64748b',
        gradient: 'linear-gradient(135deg, #64748b, #94a3b8)',
        description: 'Estás empezando tu camino',
        emoji: '🔍',
    },
    {
        name: 'Aprendiz',
        minLessons: 3,
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
        description: 'Ya dominás los fundamentos',
        emoji: '📚',
    },
    {
        name: 'Estudiante',
        minLessons: 8,
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981, #34d399)',
        description: 'Tu conocimiento crece cada día',
        emoji: '🎓',
    },
    {
        name: 'Avanzado',
        minLessons: 15,
        color: '#a855f7',
        gradient: 'linear-gradient(135deg, #a855f7, #c084fc)',
        description: 'Dominas conceptos complejos',
        emoji: '⚡',
    },
    {
        name: 'Experto',
        minLessons: 30,
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
        description: 'Eres un referente en la plataforma',
        emoji: '🏆',
    },
    {
        name: 'Maestro',
        minLessons: 60,
        color: '#ef4444',
        gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
        description: 'Has alcanzado el nivel más alto',
        emoji: '👑',
    },
];

/**
 * Devuelve el rango actual según el número de lecciones completadas
 */
export function getRankByLessons(lessonsCompleted = 0) {
    let currentRank = ranks[0];
    for (const rank of ranks) {
        if (lessonsCompleted >= rank.minLessons) {
            currentRank = rank;
        }
    }
    return currentRank;
}

/**
 * Devuelve el siguiente rango (o null si es el máximo)
 */
export function getNextRank(lessonsCompleted = 0) {
    const current = getRankByLessons(lessonsCompleted);
    const idx = ranks.indexOf(current);
    return ranks[idx + 1] || null;
}

/**
 * Porcentaje de progreso hacia el siguiente rango (0-100)
 */
export function getRankProgress(lessonsCompleted = 0) {
    const current = getRankByLessons(lessonsCompleted);
    const next = getNextRank(lessonsCompleted);
    if (!next) return 100;
    const range = next.minLessons - current.minLessons;
    const done = lessonsCompleted - current.minLessons;
    return Math.round((done / range) * 100);
}
