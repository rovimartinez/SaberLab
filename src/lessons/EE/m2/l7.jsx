import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

export const lessonData = defineLesson({
    title: 'Capacitores y Almacenamiento de Energía',
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m2-l7-content',
                content: `
                    <h3>¿Qué es un capacitor?</h3>
                    <p>Un capacitor almacena energía en forma de campo eléctrico. Se utiliza para suavizar señales, almacenar carga y crear circuitos de temporización.</p>
                    <h4>Tipos comunes</h4>
                    <ul>
                        <li>Capacitores cerámicos</li>
                        <li>Capacitores electrolíticos</li>
                    </ul>
                `
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ee-m2-l7-review',
                flashcards: [
                    { id: 'ee-m2-l7-f1', q: '¿Qué almacena un capacitor?', a: 'Carga eléctrica', sub: 'Capacitor', sectionId: 'ee-m2-l7' },
                    { id: 'ee-m2-l7-f2', q: '¿Cuál es un capacitor común?', a: 'Cerámico', sub: 'Tipos', sectionId: 'ee-m2-l7' }
                ]
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m2-l7-quiz',
                title: 'Quiz: Capacitores',
                questions: [
                    {
                        id: 'ee-m2-l7-q1',
                        objective: 'Identificar capacitor',
                        concept: 'capacitancia',
                        difficulty: 'easy',
                        q: 'Un capacitor almacena energía en forma de:',
                        options: ['Campo eléctrico', 'Movimiento mecánico', 'Calor', 'Luz'],
                        correct: 0
                    },
                    {
                        id: 'ee-m2-l7-q2',
                        objective: 'Reconocer tipos',
                        concept: 'capacitores',
                        difficulty: 'easy',
                        q: 'Un capacitor electrolítico se caracteriza por:',
                        options: ['Polaridad', 'No tener polaridad', 'Ser de alta frecuencia', 'Ser magnético'],
                        correct: 0
                    }
                ],
                quizConfig: { timePerQuestion: 20, requiredScorePercent: 80 }
            })
        ]
    }
});
