import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Análisis de Circuitos Mixtos',
    hasSimulator: true,
    content: `
        <h3 id="ee-1-5-1" style="color: #f59e0b; margin: 1.5rem 0 1rem; font-size: 1.4rem;">5.1 ¿Qué es un Circuito Mixto?</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Un <strong>circuito mixto</strong> (o circuito serie-paralelo) es una combinación de elementos conectados tanto en serie como en paralelo en una misma red eléctrica. Prácticamente todos los dispositivos electrónicos reales (placas madre, fuentes de poder, amplificadores de audio) están diseñados como circuitos mixtos.
        </p>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <h4 style="color: #fbbf24; margin: 0 0 0.5rem; font-size: 1.1rem;">🎯 El Método de Reducción Paso a Paso</h4>
            <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.7; margin: 0;">
                Para resolver cualquier circuito mixto, se aplica una técnica sistemática de <strong>adentro hacia afuera</strong>:
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) ; gap: 0.75rem; margin-top: 1rem;">
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 0.85rem;">
                    <div style="color: #38bdf8; font-weight: 800; font-size: 0.8rem;">PASO 1</div>
                    <p style="color: #94a3b8; font-size: 0.75rem; margin: 0.25rem 0 0; line-height: 1.4;">Identificar bloques más internos puramente serie o paralelo.</p>
                </div>
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 0.85rem;">
                    <div style="color: #38bdf8; font-weight: 800; font-size: 0.8rem;">PASO 2</div>
                    <p style="color: #94a3b8; font-size: 0.75rem; margin: 0.25rem 0 0; line-height: 1.4;">Reemplazar cada bloque por su resistencia equivalente (Req1, Req2...).</p>
                </div>
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 0.85rem;">
                    <div style="color: #38bdf8; font-weight: 800; font-size: 0.8rem;">PASO 3</div>
                    <p style="color: #94a3b8; font-size: 0.75rem; margin: 0.25rem 0 0; line-height: 1.4;">Redibujar el circuito simplificado hasta llegar a una sola Req total.</p>
                </div>
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 0.85rem;">
                    <div style="color: #38bdf8; font-weight: 800; font-size: 0.8rem;">PASO 4</div>
                    <p style="color: #94a3b8; font-size: 0.75rem; margin: 0.25rem 0 0; line-height: 1.4;">Hacer el cálculo inverso: calcular I_total y desplegar voltajes y corrientes.</p>
                </div>
            </div>
        </div>

        <!-- DEMO INTERACTIVA DEL CIRCUITO MIXTO -->
        <div style="margin: 2rem 0;">
            <div id="mixed-circuit-demo-container"></div>
        </div>

        <h3 id="ee-1-5-2" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">5.2 Ejemplo Resuelto y Reducción Visual Paso a Paso</h3>
        <p style="margin-bottom: 1.25rem; line-height: 1.8;">
            Vamos a resolver el siguiente circuito mixto: una fuente de <strong>24V</strong> alimenta una resistencia <strong>R₁ = 10Ω</strong> conectada en serie con un bloque paralelo formado por <strong>R₂ = 30Ω</strong> y <strong>R₃ = 60Ω</strong>.
        </p>
        <p style="color: #94a3b8; font-size: 0.88rem; margin-bottom: 1.5rem;">
            Utiliza el botón <strong>"Siguiente Paso"</strong> o <strong>"Animar Auto"</strong> para ver cómo se calculan las variables y cómo el circuito de la derecha se simplifica gráficamente etapa por etapa:
        </p>

        <!-- CALCULADORA VISUAL Y REDUCTOR PASO A PASO -->
        <div style="margin: 1.5rem 0 2.5rem;">
            <div id="mixed-calculation-visualizer-container"></div>
        </div>

        <h3 id="ee-1-5-3" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">5.3 Balance de Potencias</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            El principio de conservación de la energía exige que la potencia total suministrada por la fuente sea exactamente igual a la suma de las potencias disipadas por todas las resistencias individuales:
        </p>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.25rem; text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 1.4rem; font-weight: 800; color: #34d399; font-family: monospace;">
                P<sub>fuente</sub> = P<sub>R1</sub> + P<sub>R2</sub> + P<sub>R3</sub> + ... + P<sub>Rn</sub>
            </div>
            <p style="color: #94a3b8; font-size: 0.82rem; margin: 0.5rem 0 0;">
                En nuestro ejemplo: P_fuente = 24V × 0.80A = <strong>19.2 W</strong>. Sumando cada resistencia da exactamente 19.2W.
            </p>
        </div>
    `,
    flashcards: [
        { id: 'ee-1-5-f1', type: 'mixed', q: '¿Qué es un circuito mixto?', a: 'Un circuito que combina conexiones en serie y en paralelo', sub: 'Estructura serie-paralelo', sectionId: 'ee-1-5-1' },
        { id: 'ee-1-5-f2', type: 'method', q: '¿Cuál es la regla fundamental para resolver un circuito mixto?', a: 'Reducir de adentro hacia afuera paso a paso', sub: 'Simplificación progresiva', sectionId: 'ee-1-5-1' },
        { id: 'ee-1-5-f3', type: 'calc', q: 'Si R2=30Ω y R3=60Ω están en paralelo, ¿cuánto vale su Req?', a: '20 Ω', sub: '(30 × 60) / (30 + 60) = 20 Ω', sectionId: 'ee-1-5-2' },
        { id: 'ee-1-5-f4', type: 'calc', q: 'Si a los 20Ω anteriores le sumamos R1=10Ω en serie, ¿cuál es la Req total?', a: '30 Ω', sub: '10 + 20 = 30 Ω', sectionId: 'ee-1-5-2' },
        { id: 'ee-1-5-f5', type: 'theory', q: '¿Qué es el balance de potencias?', a: 'La potencia entregada por la fuente es igual a la suma de potencias disipadas', sub: 'P_fuente = sum(P_resistencias)', sectionId: 'ee-1-5-3' },
        { id: 'ee-1-5-f6', type: 'method', q: 'Al redibujar el circuito simplificado, ¿qué se logra?', a: 'Evitar confusiones visuales y errores en los cálculos', sub: 'Buenas prácticas de ingeniería', sectionId: 'ee-1-5-1' },
        { id: 'ee-1-5-f7', type: 'calc', q: 'Si V=24V y Req=30Ω, ¿cuánto vale la corriente total I_total?', a: '0.8 Amperios', sub: '24 / 30 = 0.8 A', sectionId: 'ee-1-5-2' },
        { id: 'ee-1-5-f8', type: 'theory', q: '¿Por qué las placas electrónicas reales son circuitos mixtos?', a: 'Porque combinan funciones de protección (serie) con alimentación independiente (paralelo)', sub: 'Diseño electrónico moderno', sectionId: 'ee-1-5-1' },
        { id: 'ee-1-5-f9', type: 'mixed', q: '¿Cómo se calcula el voltaje en una rama paralela dentro de un mixto?', a: 'Voltaje total menos las caídas de las resistencias en serie previas', sub: 'V_rama = V_total - V_serie', sectionId: 'ee-1-5-2' },
        { id: 'ee-1-5-f10', type: 'theory', q: '¿Se cumple la Ley de Kirchhoff en los circuitos mixtos?', a: 'Sí, tanto LVK como LCK se cumplen rigurosamente en cada nodo y malla', sub: 'Leyes universales', sectionId: 'ee-1-5-3' }
    ],
    questions: [
        {
            id: 'ee-1-5-q1',
            objective: 'Calcular resistencia equivalente en un circuito mixto básico',
            concept: 'reduccion_mixta',
            difficulty: 'medium',
            q: 'Una resistencia R1 = 5Ω está en serie con un bloque paralelo de dos resistencias R2 = 20Ω y R3 = 20Ω. La Req total es:',
            options: ['15 Ω', '45 Ω', '25 Ω', '10 Ω'],
            correct: 0
        },
        {
            id: 'ee-1-5-q2',
            objective: 'Identificar la metodología de análisis de circuitos mixtos',
            concept: 'metodo_analisis',
            difficulty: 'easy',
            q: 'El primer paso para simplificar un circuito mixto complejo es:',
            options: ['Sumar todas las resistencias directamente sin mirar el diagrama', 'Identificar los grupos más internos puramente en serie o en paralelo y calcular sus equivalencias', 'Medir con un multímetro en la pantalla', 'Cambiar el voltaje de la fuente a 12V'],
            correct: 1
        },
        {
            id: 'ee-1-5-q3',
            objective: 'Calcular corriente total en circuito mixto',
            concept: 'corriente_mixta',
            difficulty: 'medium',
            q: 'Si un circuito mixto tiene una Req total de 15Ω y se alimenta con 30V, la corriente total entregada por la fuente es:',
            options: ['0.5 A', '15 A', '2 A', '450 A'],
            correct: 2
        },
        {
            id: 'ee-1-5-q4',
            objective: 'Calcular caída de voltaje en la resistencia serie de entrada',
            concept: 'caida_mixta',
            difficulty: 'hard',
            q: 'En un circuito mixto con I_total = 2A y una resistencia R1 = 5Ω en serie a la salida de la fuente, ¿cuál es el voltaje sobre R1?',
            options: ['5 V', '10 V', '20 V', '30 V'],
            correct: 1
        },
        {
            id: 'ee-1-5-q5',
            objective: 'Deducir el voltaje disponible para el bloque paralelo',
            concept: 'voltaje_paralelo_mixto',
            difficulty: 'hard',
            q: 'Siguiendo el caso anterior (Fuente 30V, V_R1 = 10V), ¿qué voltaje recibe el bloque paralelo?',
            options: ['0 V', '10 V', '30 V', '20 V'],
            correct: 3
        },
        {
            id: 'ee-1-5-q6',
            objective: 'Comprender el balance de potencias',
            concept: 'balance_potencias',
            difficulty: 'medium',
            q: 'En todo circuito eléctrico cerrado, la potencia suministrada por la fuente es:',
            options: ['Igual a la suma de potencias disipadas en cada elemento', 'Mayor que la suma de potencias disipadas', 'Menor que la potencia de un solo resistor', 'Siempre constante e independiente de la carga'],
            correct: 0
        },
        {
            id: 'ee-1-5-q7',
            objective: 'Analizar fallas en circuitos mixtos',
            concept: 'fallas_mixtas',
            difficulty: 'hard',
            q: 'Si en un circuito mixto se abre la resistencia R1 que está en serie a la salida directa de la fuente:',
            options: ['Solo se apaga R1 y el bloque paralelo sigue funcionando', 'Todo el circuito deja de recibir corriente y se apaga por completo', 'El bloque paralelo duplica su corriente', 'Se genera un cortocircuito'],
            correct: 1
        },
        {
            id: 'ee-1-5-q8',
            objective: 'Interpretar combinaciones serie-paralelo',
            concept: 'conceptos_mixtos',
            difficulty: 'easy',
            q: '¿Qué tipo de circuito combina mallas en serie y ramas en paralelo en una misma red?',
            options: ['Circuito puramente resistivo simple', 'Circuito magnético cerrado', 'Circuito mixto', 'Circuito digital binario'],
            correct: 2
        },
        {
            id: 'ee-1-5-q9',
            objective: 'Calcular potencia total disipada en circuito mixto',
            concept: 'potencia_mixta',
            difficulty: 'medium',
            q: 'Una fuente de 20V alimenta un circuito mixto con Req = 10Ω. La potencia total entregada por la fuente es:',
            options: ['40 W', '200 W', '2 W', '100 W'],
            correct: 0
        },
        {
            id: 'ee-1-5-q10',
            objective: 'Calcular corriente de rama en bloque paralelo dentro de un mixto',
            concept: 'corriente_rama_mixto',
            difficulty: 'hard',
            q: 'Si el bloque paralelo de un circuito mixto recibe 12V y contiene una rama con R = 6Ω, la corriente que pasa por esa rama es:',
            options: ['72 A', '0.5 A', '6 A', '2 A'],
            correct: 3
        }
    ],
    quizConfig: { timePerQuestion: 20, requiredScorePercent: 80 }
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m1-l5-content',
                content: lessonDefinition.content,
                hasSimulator: lessonDefinition.hasSimulator
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ee-m1-l5-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        simulador: [
            createContentBlock({
                id: 'ee-m1-l5-practical-lab',
                content: `<div id="practical-lab-l5-container"></div>`,
                hasSimulator: true
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m1-l5-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions,
                quizConfig: lessonDefinition.quizConfig
            })
        ]
    }
});
