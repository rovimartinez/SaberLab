import { createContentBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

export const lessonData = defineLesson({
    title: 'Presentación de Proyecto Final',
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m4-l16-content',
                content: `
                    <h3>Presentación del proyecto final</h3>
                    <p>Esta lección guía la estructura de la sustentación: hardware, lógica del circuito y justificación técnica.</p>
                    <h4>Puntos a evaluar</h4>
                    <ul>
                        <li>Funcionamiento del prototipo</li>
                        <li>Claridad en la explicación técnica</li>
                        <li>Justificación del diseño</li>
                    </ul>
                `
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m4-l16-quiz',
                title: 'Quiz: Presentación de Proyecto Final',
                questions: [
                    {
                        id: 'ee-m4-l16-q1',
                        objective: 'Preparar la presentación',
                        concept: 'presentación',
                        difficulty: 'easy',
                        q: 'La justificación técnica debe incluir:',
                        options: ['Por qué se eligieron los componentes', 'El precio total', 'El nombre del docente', 'La marca del fabricante'],
                        correct: 0
                    },
                    {
                        id: 'ee-m4-l16-q2',
                        objective: 'Evaluar prototipo',
                        concept: 'proyecto final',
                        difficulty: 'easy',
                        q: 'En la presentación final se debe mostrar:',
                        options: ['El prototipo funcionando', 'Sólo el esquema en papel', 'Una foto del proyecto', 'Ninguna prueba'],
                        correct: 0
                    }
                ],
                quizConfig: { timePerQuestion: 45, requiredScorePercent: 70 }
            })
        ]
    }
});
