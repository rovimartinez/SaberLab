// Mapa de lecciones por curso
// Formato: RE = Robótica Educativa, EE = Electricidad y Electrónica, etc.

export const LESSONS_MAP = {
    'RE': { // Robótica Educativa (Curso 5)
        name: 'Robótica Educativa',
        color: '#a855f7',
        icon: 'Bot',
        courseId: 5,
        modules: {
            'm1': {
                name: 'Fundamentos y Lógica Digital',
                lessons: {
                    'l1': () => import('./RE/m1/l1').then(m => m.lessonData),
                    'l2': () => import('./RE/m1/l2').then(m => m.lessonData),
                    'l3': () => import('./RE/m1/l3').then(m => m.lessonData),
                    'l4': () => import('./RE/m1/l4').then(m => m.lessonData),
                    'l5': () => import('./RE/m1/l5').then(m => m.lessonData),
                }
            }
        }
    },
    'EE': { // Electricidad y Electrónica (Curso 1)
        name: 'Electricidad y Electrónica Básica',
        color: '#f59e0b',
        icon: 'Zap',
        courseId: 1,
        modules: {}
    },
    'MQ': { // Mediaciones en Química (Curso 3)
        name: 'Mediaciones Tecnológicas en la Química',
        color: '#10b981',
        icon: 'FlaskConical',
        courseId: 3,
        modules: {}
    },
    'MA': { // Modelado y Animación 3D (Curso 4)
        name: 'Modelado y Animación 3D',
        color: '#ec4899',
        icon: 'Box',
        courseId: 4,
        modules: {}
    }
};

// Función para obtener datos de una lección
export const getLessonData = async (courseAbbr, moduleId, lessonId) => {
    const course = LESSONS_MAP[courseAbbr];
    if (!course || !course.modules[moduleId] || !course.modules[moduleId].lessons[lessonId]) {
        return null;
    }
    const module = await course.modules[moduleId].lessons[lessonId]();
    return module;
};
