import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

export const lessonData = defineLesson({
    title: 'Visualización de Datos',
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m3-l13-content',
                content: `
                    <h3>Displays de 7 segmentos</h3>
                    <p>Los displays de 7 segmentos muestran números mediante siete LEDs organizados en forma de 8. Se usan decodificadores para convertir señales binarias en segmentos.</p>
                    <h4>Decodificador CD4511</h4>
                    <p>El chip CD4511 convierte una entrada BCD a las señales necesarias para encender los segmentos correctos del display.</p>
                `
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ee-m3-l13-review',
                flashcards: [
                    { id: 'ee-m3-l13-f1', q: '¿Cuántos segmentos tiene el display?', a: '7 segmentos', sub: 'Display 7 segmentos', sectionId: 'ee-m3-l13' },
                    { id: 'ee-m3-l13-f2', q: '¿Qué convierte el CD4511?', a: 'BCD a segmentos', sub: 'Decodificador', sectionId: 'ee-m3-l13' }
                ]
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m3-l13-quiz',
                title: 'Quiz: Displays y Decodificadores',
                questions: [
                    {
                        id: 'ee-m3-l13-q1',
                        objective: 'Entender displays',
                        concept: '7 segmentos',
                        difficulty: 'easy',
                        q: 'Un display de 7 segmentos se usa para mostrar:',
                        options: ['Números y algunos caracteres', 'Imágenes complejas', 'Señales de audio', 'Textos largos'],
                        correct: 0
                    },
                    {
                        id: 'ee-m3-l13-q2',
                        objective: 'Función del CD4511',
                        concept: 'decodificador',
                        difficulty: 'medium',
                        q: 'El CD4511 recibe señales BCD y entrega:',
                        options: ['Señales para segmentos del display', 'Señales de audio', 'Voltaje constante', 'Frecuencia variable'],
                        correct: 0
                    }
                ],
                quizConfig: { timePerQuestion: 20, requiredScorePercent: 80 }
            })
        ]
    }
});
