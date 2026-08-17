import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

export const lessonData = defineLesson({
    title: 'Bobinas y Motores DC',
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m2-l8-content',
                content: `
                    <h3>Bobinas e inducción magnética</h3>
                    <p>Una bobina genera un campo magnético cuando pasa corriente eléctrica. Este campo puede usarse para crear movimiento en motores y relés.</p>
                    <h4>Motores DC</h4>
                    <p>Los motores DC convierten energía eléctrica en movimiento rotatorio mediante el principio de interacción entre corriente y campo magnético.</p>
                `
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ee-m2-l8-review',
                flashcards: [
                    { id: 'ee-m2-l8-f1', q: '¿Qué crea una bobina al recibir corriente?', a: 'Campo magnético', sub: 'Bobina', sectionId: 'ee-m2-l8' },
                    { id: 'ee-m2-l8-f2', q: '¿Qué convierte un motor DC?', a: 'Energía eléctrica en movimiento', sub: 'Motor DC', sectionId: 'ee-m2-l8' }
                ]
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m2-l8-quiz',
                title: 'Quiz: Bobinas y Motores DC',
                questions: [
                    {
                        id: 'ee-m2-l8-q1',
                        objective: 'Identificar movimiento eléctrico',
                        concept: 'motor',
                        difficulty: 'easy',
                        q: 'Un motor DC produce:',
                        options: ['Movimiento rotatorio', 'Calor', 'Luz', 'Sonido'],
                        correct: 0
                    },
                    {
                        id: 'ee-m2-l8-q2',
                        objective: 'Reconocer inducción',
                        concept: 'bobina',
                        difficulty: 'easy',
                        q: 'La bobina genera un campo magnético cuando:',
                        options: ['Circula corriente por ella', 'Está desconectada', 'Se calienta', 'Se enfría'],
                        correct: 0
                    }
                ],
                quizConfig: { timePerQuestion: 45, requiredScorePercent: 70 }
            })
        ]
    }
});
