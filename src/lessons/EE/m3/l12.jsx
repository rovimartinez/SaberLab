import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

export const lessonData = defineLesson({
    title: 'Circuitos Integrados - Contadores',
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m3-l12-content',
                content: `
                    <h3>Contadores binarios</h3>
                    <p>El CI 74HC93 es un contador binario de 4 bits. Cuenta pulsos y transforma entradas de reloj en salidas binarias.</p>
                    <h4>Salidas binarias</h4>
                    <p>Cada salida representa un bit del conteo: Q0, Q1, Q2 y Q3.</p>
                `
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ee-m3-l12-review',
                flashcards: [
                    { id: 'ee-m3-l12-f1', q: '¿Qué hace un contador binario?', a: 'Cuenta pulsos en formato binario', sub: '74HC93', sectionId: 'ee-m3-l12' },
                    { id: 'ee-m3-l12-f2', q: '¿Cuántos bits tiene el 74HC93?', a: '4 bits', sub: 'Contador', sectionId: 'ee-m3-l12' }
                ]
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m3-l12-quiz',
                title: 'Quiz: Contador 74HC93',
                questions: [
                    {
                        id: 'ee-m3-l12-q1',
                        objective: 'Identificar bits',
                        concept: 'contador',
                        difficulty: 'easy',
                        q: 'El 74HC93 es un contador de:',
                        options: ['4 bits', '8 bits', '2 bits', '16 bits'],
                        correct: 0
                    },
                    {
                        id: 'ee-m3-l12-q2',
                        objective: 'Reconocer salida binaria',
                        concept: 'binario',
                        difficulty: 'medium',
                        q: 'Una salida Q representa:',
                        options: ['Un bit del conteo', 'Un valor analógico', 'Un nivel de voltaje fijo', 'Una frecuencia'],
                        correct: 0
                    }
                ],
                quizConfig: { timePerQuestion: 20, requiredScorePercent: 80 }
            })
        ]
    }
});
