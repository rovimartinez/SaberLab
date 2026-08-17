import { createContentBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

export const lessonData = defineLesson({
    title: 'Evaluación de Componentes',
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m2-l10-content',
                content: `
                    <h3>Evaluación de Componentes Electrónicos</h3>
                    <p>Prueba tus conocimientos sobre capacitores, bobinas, motores, transistores y relés. Esta evaluación combina teoría y ejemplos prácticos de aplicación de componentes.</p>
                    <p>Lee con atención cada pregunta y revisa los conceptos vistos en las lecciones anteriores.</p>
                `
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m2-l10-quiz',
                title: 'Examen: Componentes Electrónicos',
                questions: [
                    {
                        id: 'ee-m2-l10-q1',
                        objective: 'Seleccionar componente adecuado',
                        concept: 'componentes',
                        difficulty: 'medium',
                        q: '¿Cuál componente almacena energía eléctrica en forma de campo?',
                        options: ['Capacitor', 'Resistor', 'Motor', 'Transistor'],
                        correct: 0
                    },
                    {
                        id: 'ee-m2-l10-q2',
                        objective: 'Entender relé',
                        concept: 'rele',
                        difficulty: 'medium',
                        q: 'Un relé se usa principalmente para:',
                        options: ['Conmutar cargas con una señal de control', 'Medir voltaje', 'Disipar energía', 'Almacenar datos'],
                        correct: 0
                    }
                ],
                quizConfig: { timePerQuestion: 60, requiredScorePercent: 70 }
            })
        ]
    }
});
