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
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-top: 1rem;">
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

        <div style="margin: 2rem 0;">
            <div id="circuit-simulator-container"></div>
        </div>

        <h3 id="ee-1-5-2" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">5.2 Ejemplo Resuelto Paso a Paso</h3>
        <div style="background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <p style="color: #f8fafc; font-weight: 700; font-size: 1rem; margin: 0 0 1rem;">
                Problema: Una fuente de <strong>24V</strong> alimenta un circuito donde <strong>R1 = 10Ω</strong> está en serie con un bloque paralelo formado por <strong>R2 = 30Ω</strong> y <strong>R3 = 60Ω</strong>.
            </p>

            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div style="background: rgba(16, 185, 129, 0.05); border-left: 4px solid #10b981; padding: 1rem; border-radius: 0 12px 12px 0;">
                    <strong style="color: #34d399;">Paso A: Resolver el bloque paralelo (R2 // R3)</strong>
                    <p style="color: #cbd5e1; font-family: monospace; font-size: 0.95rem; margin: 0.3rem 0 0;">
                        R<sub>p</sub> = (30 × 60) / (30 + 60) = 1800 / 90 = <strong>20 Ω</strong>
                    </p>
                </div>

                <div style="background: rgba(59, 130, 246, 0.05); border-left: 4px solid #3b82f6; padding: 1rem; border-radius: 0 12px 12px 0;">
                    <strong style="color: #60a5fa;">Paso B: Sumar la resistencia en serie (R1 + Rp)</strong>
                    <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 1rem; margin-top: 1rem; font-family: monospace;">
                        R<sub>eq total</sub> = R<sub>1</sub> + R<sub>p</sub> = 10 + 20 = <strong>30 Ω</strong>
                    </div>
                </div>

                <div style="background: rgba(168, 85, 247, 0.05); border-left: 4px solid #a855f7; padding: 1rem; border-radius: 0 12px 12px 0;">
                    <strong style="color: #c084fc;">Paso C: Calcular Corriente Total (Ley de Ohm)</strong>
                    <p style="color: #cbd5e1; font-family: monospace; font-size: 0.95rem; margin: 0.3rem 0 0;">
                        I<sub>total</sub> = V / R<sub>eq</sub> = 24V / 30Ω = <strong>0.8 A</strong>
                    </p>
                </div>

                <div style="background: rgba(245, 158, 11, 0.05); border-left: 4px solid #f59e0b; padding: 1rem; border-radius: 0 12px 12px 0;">
                    <strong style="color: #fbbf24;">Paso D: Desplegar voltajes y corrientes individuales</strong>
                    <ul style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.7; margin: 0.3rem 0 0; padding-left: 1.2rem;">
                        <li>Voltaje en R1: V1 = I_t × R1 = 0.8A × 10Ω = <strong>8 V</strong></li>
                        <li>Voltaje en bloque paralelo: Vp = V_total − V1 = 24V − 8V = <strong>16 V</strong></li>
                        <li>Corriente en R2: I2 = Vp / R2 = 16V / 30Ω = <strong>0.533 A</strong></li>
                        <li>Corriente en R3: I3 = Vp / R3 = 16V / 60Ω = <strong>0.267 A</strong></li>
                        <li><em>Verificación LCK:</em> I2 + I3 = 0.533A + 0.267A = 0.8A ✓</li>
                    </ul>
                </div>
            </div>
        </div>

        <h3 id="ee-1-5-3" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">5.3 Balance de Potencias</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            El principio de conservación de la energía exige que la potencia total suministrada por la fuente sea exactamente igual a la suma de las potencias disipadas por todas las resistencias individuales:
        </p>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.25rem; text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 1.4rem; font-weight: 800; color: #34d399; font-family: monospace;">
                P_{fuente} = P_{R1} + P_{R2} + P_{R3} + ... + P_{Rn}
            </div>
            <p style="color: #94a3b8; font-size: 0.82rem; margin: 0.5rem 0 0;">
                En nuestro ejemplo: P_fuente = 24V × 0.8A = <strong>19.2 W</strong>. Sumando cada resistencia da exactamente 19.2W.
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
            options: ['2 A', '450 A', '0.5 A', '15 A'],
            correct: 0
        },
        {
            id: 'ee-1-5-q4',
            objective: 'Calcular caída de voltaje en la resistencia serie de entrada',
            concept: 'caida_mixta',
            difficulty: 'hard',
            q: 'En el circuito anterior (I_total = 2A, R1 = 5Ω en serie con el paralelo), ¿cuál es el voltaje sobre R1?',
            options: ['10 V', '30 V', '20 V', '5 V'],
            correct: 0
        },
        {
            id: 'ee-1-5-q5',
            objective: 'Deducir el voltaje disponible para el bloque paralelo',
            concept: 'voltaje_paralelo_mixto',
            difficulty: 'hard',
            q: 'Siguiendo el caso anterior (Fuente 30V, V_R1 = 10V), ¿qué voltaje recibe el bloque paralelo?',
            options: ['20 V', '30 V', '10 V', '0 V'],
            correct: 0
        },
        {
            id: 'ee-1-5-q6',
            objective: 'Comprender el balance de potencias',
            concept: 'balance_potencias',
            difficulty: 'medium',
            q: 'En todo circuito eléctrico cerrado, la potencia suministrada por la fuente es:',
            options: ['Mayor que la suma de potencias disipadas', 'Igual a la suma de potencias disipadas en cada elemento', 'Menor que la potencia de un solo resistor', 'Siempre constante e independiente de la carga'],
            correct: 1
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
            options: ['Circuito mixto', 'Circuito puramente resistivo simple', 'Circuito magnético cerrado', 'Circuito digital binario'],
            correct: 0
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
