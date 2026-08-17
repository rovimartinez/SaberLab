import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Análisis de Circuitos en Paralelo',
    hasSimulator: true,
    content: `
        <h3 id="ee-1-4-1" style="color: #f59e0b; margin: 1.5rem 0 1rem; font-size: 1.4rem;">4.1 Fundamentos del Circuito en Paralelo</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Un <strong>circuito en paralelo</strong> es una configuración en la que todos los componentes están conectados a los mismos dos puntos comunes (nodos), de modo que cada componente forma una <strong>rama independiente</strong> para el paso de la corriente.
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem;">
            <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 18px; padding: 1.25rem;">
                <h4 style="color: #c084fc; margin: 0 0 0.5rem; font-size: 1.05rem;">🔋 Regla 1: Voltaje Idéntico</h4>
                <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; margin: 0;">
                    Todas las ramas están conectadas directamente a los polos de la fuente de alimentación:
                </p>
                <div style="font-size: 1.2rem; font-weight: 800; color: #e9d5ff; font-family: monospace; margin-top: 0.5rem;">
                    V_total = V_1 = V_2 = V_3 = ...
                </div>
            </div>

            <div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 18px; padding: 1.25rem;">
                <h4 style="color: #60a5fa; margin: 0 0 0.5rem; font-size: 1.05rem;">⚡ Regla 2: Suma de Corrientes (LCK)</h4>
                <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; margin: 0;">
                    La corriente total que sale de la fuente se divide entre cada una de las ramas del circuito:
                </p>
                <div style="font-size: 1.2rem; font-weight: 800; color: #93c5fd; font-family: monospace; margin-top: 0.5rem;">
                    I_total = I_1 + I_2 + I_3 + ...
                </div>
            </div>
        </div>

        <h3 id="ee-1-4-2" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">4.2 Resistencia Equivalente en Paralelo (Req)</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            A diferencia del circuito en serie, al colocar resistencias en paralelo se abren más caminos para la corriente, por lo que <strong>la resistencia equivalente total DISMINUYE</strong>:
        </p>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem; text-align: center;">
            <div style="font-size: 1.8rem; font-weight: 800; color: #fbbf24; font-family: monospace; margin-bottom: 0.75rem;">
                1 / R_{eq} = (1 / R_1) + (1 / R_2) + ... + (1 / R_n)
            </div>
            <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 0.75rem; display: inline-block;">
                <span style="color: #38bdf8; font-weight: bold;">Caso especial de 2 resistencias:</span>
                <span style="color: #f8fafc; font-family: monospace; font-size: 1.1rem; margin-left: 0.5rem;">R_{eq} = (R_1 × R_2) / (R_1 + R_2)</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.82rem; margin: 0.75rem 0 0;">
                💡 <em>Propiedad de oro:</em> La resistencia equivalente en paralelo siempre es <strong>MENOR que la resistencia más pequeña</strong> del conjunto.
            </p>
        </div>

        <div style="margin: 2rem 0;">
            <div id="circuit-simulator-container"></div>
        </div>

        <h3 id="ee-1-4-3" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">4.3 Divisor de Corriente</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            La corriente que entra a un nodo se divide inversamente proporcional a la resistencia de cada rama: <strong>la rama con menor resistencia recibirá mayor corriente</strong>.
        </p>

        <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 18px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <div style="font-size: 1.3rem; font-weight: 800; color: #34d399; font-family: monospace; text-align: center; margin-bottom: 0.5rem;">
                I_{R1} = I_{total} × ( R_2 / (R_1 + R_2) )
            </div>
            <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; margin: 0; text-align: center;">
                <em>Nota cómo en el numerador va la resistencia de la otra rama (R2) para calcular la corriente en R1.</em>
            </p>
        </div>

        <h3 id="ee-1-4-4" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">4.4 ¿Por qué las casas usan circuitos en paralelo?</h3>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.8; margin: 0 0 1rem;">
                Todas las instalaciones eléctricas de hogares, escuelas e industrias están conectadas en <strong>paralelo</strong> por dos razones fundamentales:
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px;">
                    <strong style="color: #38bdf8; display: block; margin-bottom: 0.25rem;">1. Independencia Total</strong>
                    <span style="color: #94a3b8; font-size: 0.8rem;">Puedes apagar la luz de tu habitación sin que se apague el refrigerador o la computadora.</span>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px;">
                    <strong style="color: #38bdf8; display: block; margin-bottom: 0.25rem;">2. Voltaje Constante</strong>
                    <span style="color: #94a3b8; font-size: 0.8rem;">Cada tomacorriente entrega exactamente 120V (o 220V), sin importar cuántos aparatos conectes.</span>
                </div>
            </div>
        </div>
    `,
    flashcards: [
        { id: 'ee-1-4-f1', type: 'parallel', q: '¿Cómo se comporta el voltaje en un circuito en paralelo?', a: 'Es exactamente el mismo en todas las ramas', sub: 'V_total = V_1 = V_2 = ...', sectionId: 'ee-1-4-1' },
        { id: 'ee-1-4-f2', type: 'parallel', q: '¿Cómo se comporta la corriente total en un circuito en paralelo?', a: 'Es la suma de las corrientes de cada rama', sub: 'Ley de Corrientes de Kirchhoff (LCK)', sectionId: 'ee-1-4-1' },
        { id: 'ee-1-4-f3', type: 'calc', q: '¿Cuál es la Req de dos resistencias de 100Ω en paralelo?', a: '50 Ω', sub: '(100 × 100) / (100 + 100) = 50 Ω', sectionId: 'ee-1-4-2' },
        { id: 'ee-1-4-f4', type: 'theory', q: 'Al agregar más resistencias en paralelo, ¿la Req sube o baja?', a: 'Baja (disminuye)', sub: 'Hay más caminos para la corriente', sectionId: 'ee-1-4-2' },
        { id: 'ee-1-4-f5', type: 'calc', q: 'Si V=12V y tenemos dos ramas con R1=6Ω y R2=12Ω, ¿cuánto vale I_total?', a: '3 Amperios', sub: 'I1 = 2A, I2 = 1A → 2 + 1 = 3A', sectionId: 'ee-1-4-1' },
        { id: 'ee-1-4-f6', type: 'theory', q: '¿Qué sucede si un foco se quema en un circuito en paralelo?', a: 'Los demás focos siguen encendidos con el mismo brillo', sub: 'Ramas independientes', sectionId: 'ee-1-4-4' },
        { id: 'ee-1-4-f7', type: 'formula', q: 'Fórmula rápida para dos resistencias en paralelo:', a: 'Req = (R1 × R2) / (R1 + R2)', sub: 'Producto dividido suma', sectionId: 'ee-1-4-2' },
        { id: 'ee-1-4-f8', type: 'theory', q: '¿Qué rama recibe mayor corriente en un circuito en paralelo?', a: 'La rama con menor valor de resistencia', sub: 'El camino de menor oposición', sectionId: 'ee-1-4-3' },
        { id: 'ee-1-4-f9', type: 'theory', q: '¿Por qué las casas usan conexión en paralelo?', a: 'Para mantener 120V/220V constante e independencia', sub: 'Estándar residencial universal', sectionId: 'ee-1-4-4' },
        { id: 'ee-1-4-f10', type: 'lck', q: '¿Qué afirma la Ley de Corrientes de Kirchhoff (LCK)?', a: 'La suma de corrientes entrantes a un nodo es igual a las salientes', sub: 'Conservación de la carga', sectionId: 'ee-1-4-1' }
    ],
    questions: [
        {
            id: 'ee-1-4-q1',
            objective: 'Calcular resistencia equivalente en paralelo',
            concept: 'resistencia_paralelo',
            difficulty: 'easy',
            q: 'Dos resistencias de 60Ω se conectan en paralelo. La resistencia equivalente es:',
            options: ['120 Ω', '30 Ω', '60 Ω', '15 Ω'],
            correct: 1
        },
        {
            id: 'ee-1-4-q2',
            objective: 'Identificar características del voltaje en paralelo',
            concept: 'voltaje_paralelo',
            difficulty: 'easy',
            q: 'Si una batería de 12V alimenta tres focos conectados en paralelo, el voltaje en cada foco es:',
            options: ['4 V', '12 V', '36 V', '0 V'],
            correct: 1
        },
        {
            id: 'ee-1-4-q3',
            objective: 'Aplicar la Ley de Corrientes de Kirchhoff (LCK)',
            concept: 'lck',
            difficulty: 'medium',
            q: 'Un nodo recibe una corriente total de 10A y se divide en tres ramas con I1=3A e I2=5A. ¿Cuánto vale I3?',
            options: ['2 A', '8 A', '18 A', '15 A'],
            correct: 0
        },
        {
            id: 'ee-1-4-q4',
            objective: 'Calcular resistencia en paralelo de valores desiguales',
            concept: 'resistencia_paralelo',
            difficulty: 'medium',
            q: 'Se conectan en paralelo una resistencia de 20Ω y otra de 30Ω. La resistencia equivalente es:',
            options: ['50 Ω', '12 Ω', '25 Ω', '600 Ω'],
            correct: 1
        },
        {
            id: 'ee-1-4-q5',
            objective: 'Comprender el efecto de añadir ramas en paralelo',
            concept: 'comportamiento_paralelo',
            difficulty: 'hard',
            q: 'Si a un circuito paralelo se le añade una resistencia adicional en una nueva rama:',
            options: ['La corriente total suministrada por la fuente aumenta', 'La resistencia equivalente total aumenta', 'El voltaje de las demás ramas disminuye a la mitad', 'Los demás componentes se apagan'],
            correct: 0
        },
        {
            id: 'ee-1-4-q6',
            objective: 'Analizar distribución de corriente',
            concept: 'divisor_corriente',
            difficulty: 'medium',
            q: 'En un circuito con dos resistencias en paralelo (R1 = 10Ω y R2 = 100Ω):',
            options: ['Por R1 pasa mucha más corriente que por R2', 'Por R2 pasa más corriente que por R1', 'Pasa la misma corriente por ambas', 'No pasa corriente por ninguna'],
            correct: 0
        },
        {
            id: 'ee-1-4-q7',
            objective: 'Identificar ventajas de la instalación en paralelo',
            concept: 'aplicaciones_paralelo',
            difficulty: 'easy',
            q: 'En una casa, ¿por qué los electrodomésticos están en paralelo?',
            options: ['Para que todos dependan del interruptor principal únicamente', 'Para que todos reciban el mismo voltaje y funcionen independientemente', 'Para reducir el consumo eléctrico a cero', 'Para evitar usar cables de cobre'],
            correct: 1
        },
        {
            id: 'ee-1-4-q8',
            objective: 'Diferenciar serie de paralelo',
            concept: 'comparacion',
            difficulty: 'medium',
            q: 'A diferencia de la conexión serie, en un circuito en paralelo la Resistencia Equivalente siempre es:',
            options: ['Mayor que la resistencia más grande', 'Menor que la resistencia individual más pequeña', 'Igual a la suma de todas las resistencias', 'Cero'],
            correct: 1
        }
    ],
    quizConfig: { timePerQuestion: 45, requiredScorePercent: 75 }
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m1-l4-content',
                content: lessonDefinition.content,
                hasSimulator: lessonDefinition.hasSimulator
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ee-m1-l4-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m1-l4-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions,
                quizConfig: lessonDefinition.quizConfig
            })
        ]
    }
});
