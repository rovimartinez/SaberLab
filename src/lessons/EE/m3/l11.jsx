import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

export const lessonData = defineLesson({
    title: 'Circuitos Integrados - Temporización',
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m3-l11-content',
                content: `
                    <h3>Temporizador 555</h3>
                    <p>El CI 555 es un temporizador muy versátil. Sirve para generar pulsos, astables y temporizaciones precisas en circuitos electrónicos.</p>
                    <h4>Aplicaciones comunes</h4>
                    <ul>
                        <li>Osciladores astables</li>
                        <li>Generadores de pulsos</li>
                        <li>Temporizadores de retardo</li>
                    </ul>
                `
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ee-m3-l11-review',
                flashcards: [
                    { id: 'ee-m3-l11-f1', q: '¿Para qué se usa el 555?', a: 'Generar pulsos y temporizaciones', sub: 'CI 555', sectionId: 'ee-m3-l11' },
                    { id: 'ee-m3-l11-f2', q: '¿Qué modo produce oscilaciones continuas?', a: 'Astable', sub: 'Temporizador', sectionId: 'ee-m3-l11' }
                ]
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m3-l11-quiz',
                title: 'Quiz: Temporizador 555',
                questions: [
                    {
                        id: 'ee-m3-l11-q1',
                        objective: 'Reconocer modo astable',
                        concept: '555',
                        difficulty: 'easy',
                        q: 'El modo astable del 555 genera:',
                        options: ['Oscilaciones continuas', 'Un único pulso', 'Un voltaje fijo', 'Una señal analógica'],
                        correct: 0
                    },
                    {
                        id: 'ee-m3-l11-q2',
                        objective: 'Usos del 555',
                        concept: 'temporización',
                        difficulty: 'medium',
                        q: 'El 555 se usa para temporizadores porque:',
                        options: ['Puede controlar el tiempo de encendido y apagado', 'Consume muy poca corriente', 'Almacena energía', 'Es resistente al calor'],
                        correct: 0
                    }
                ],
                quizConfig: { timePerQuestion: 45, requiredScorePercent: 70 }
            })
        ]
    }
});
