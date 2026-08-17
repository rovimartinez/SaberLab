import { createContentBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

export const lessonData = defineLesson({
    title: 'Evaluación de Aplicaciones Avanzadas',
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m3-l14-content',
                content: `
                    <h3>Evaluación de Aplicaciones Avanzadas</h3>
                    <p>Esta prueba se centra en temporizadores, contadores y sistemas de visualización de datos usando circuitos integrados.</p>
                    <p>Debes demostrar que comprendes las aplicaciones prácticas de los CI 555, 74HC93 y CD4511.</p>
                `
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m3-l14-quiz',
                title: 'Examen: Aplicaciones Avanzadas',
                questions: [
                    {
                        id: 'ee-m3-l14-q1',
                        objective: 'Identificar uso del 555',
                        concept: 'temporizador',
                        difficulty: 'medium',
                        q: 'El CI 555 se utiliza principalmente para:',
                        options: ['Generar pulsos y temporizaciones', 'Medir corriente', 'Almacenar energía', 'Amplificar audio'],
                        correct: 0
                    },
                    {
                        id: 'ee-m3-l14-q2',
                        objective: 'Relacionar display con decodificador',
                        concept: 'visualización',
                        difficulty: 'medium',
                        q: 'El CD4511 convierte entradas BCD en:',
                        options: ['Señales para encender segmentos del display', 'Señales de audio', 'Valores de resistencia', 'Voltaje alterno'],
                        correct: 0
                    }
                ],
                quizConfig: { timePerQuestion: 60, requiredScorePercent: 70 }
            })
        ]
    }
});
