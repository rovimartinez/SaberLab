import { createContentBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

export const lessonData = defineLesson({
    title: 'Optimización de Prototipos',
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m4-l15-content',
                content: `
                    <h3>Optimización de prototipos</h3>
                    <p>En esta etapa se corrigen errores, se ajusta la lógica del circuito y se preparan los materiales para la presentación final.</p>
                    <h4>Aspectos clave</h4>
                    <ul>
                        <li>Verificar conexiones</li>
                        <li>Asegurar medidas de seguridad</li>
                        <li>Documentar cambios y resultados</li>
                    </ul>
                `
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m4-l15-quiz',
                title: 'Quiz: Optimización de Prototipos',
                questions: [
                    {
                        id: 'ee-m4-l15-q1',
                        objective: 'Revisar prototipos',
                        concept: 'prototipo',
                        difficulty: 'easy',
                        q: 'La documentación de un prototipo debe incluir:',
                        options: ['Cambios realizados y resultados', 'Solo el nombre del proyecto', 'Información de ventas', 'Precio de componentes'],
                        correct: 0
                    },
                    {
                        id: 'ee-m4-l15-q2',
                        objective: 'Seguridad en prototipos',
                        concept: 'seguridad',
                        difficulty: 'easy',
                        q: 'Antes de presentar un prototipo es importante verificar:',
                        options: ['Que no haya cortocircuitos', 'Que esté sucio', 'Que use baterías viejas', 'Que no funcione'],
                        correct: 0
                    }
                ],
                quizConfig: { timePerQuestion: 20, requiredScorePercent: 80 }
            })
        ]
    }
});
