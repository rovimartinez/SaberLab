import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

export const lessonData = defineLesson({
    title: 'Transistores y Control Electromecánico',
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m2-l9-content',
                content: `
                    <h3>Transistores como interruptores</h3>
                    <p>Los transistores permiten controlar corriente usando una señal de entrada más pequeña. Pueden actuar como amplificadores o interruptores en circuitos electrónicos.</p>
                    <h4>Relés</h4>
                    <p>Un relé usa un campo magnético para activar un interruptor mecánico, permitiendo controlar cargas de mayor potencia con una señal de baja potencia.</p>
                `
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ee-m2-l9-review',
                flashcards: [
                    { id: 'ee-m2-l9-f1', q: '¿Qué controla un transistor?', a: 'Corriente eléctrica', sub: 'Transistor', sectionId: 'ee-m2-l9' },
                    { id: 'ee-m2-l9-f2', q: '¿Qué utiliza un relé para cambiar de estado?', a: 'Campo magnético', sub: 'Relé', sectionId: 'ee-m2-l9' }
                ]
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m2-l9-quiz',
                title: 'Quiz: Transistores y Relés',
                questions: [
                    {
                        id: 'ee-m2-l9-q1',
                        objective: 'Identificar función de transistor',
                        concept: 'transistor',
                        difficulty: 'medium',
                        q: 'Un transistor puede usarse para:',
                        options: ['Conmutar corrientes', 'Medir resistencia', 'Generar voltaje', 'Almacenar energía'],
                        correct: 0
                    },
                    {
                        id: 'ee-m2-l9-q2',
                        objective: 'Entender relés',
                        concept: 'relé',
                        difficulty: 'easy',
                        q: 'Un relé permite controlar una carga más grande con:',
                        options: ['Una señal de baja potencia', 'Una batería grande', 'Un capacitor', 'Un motor'],
                        correct: 0
                    }
                ],
                quizConfig: { timePerQuestion: 45, requiredScorePercent: 70 }
            })
        ]
    }
});
