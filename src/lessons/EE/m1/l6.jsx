import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Laboratorio Integrador y Evaluación de Fundamentos',
    hasSimulator: true,
    content: `
        <h3 id="ee-1-6-1" style="color: #f59e0b; margin: 1.5rem 0 1rem; font-size: 1.4rem;">6.1 Síntesis del Módulo 1: Fundamentos de Electricidad</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            ¡Felicitaciones por llegar al laboratorio integrador! En este módulo has adquirido las habilidades y fundamentos teóricos más importantes que todo profesional de la electrónica y la robótica debe dominar:
        </p>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #10b981; margin: 0 0 0.5rem; font-size: 1rem;">1. Ley de Ohm & Medición</h4>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    V = I × R, P = V × I. Medición de voltaje (paralelo), corriente (serie) y resistencia (apagado).
                </p>
            </div>
            <div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #60a5fa; margin: 0 0 0.5rem; font-size: 1rem;">2. Circuitos en Serie</h4>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Corriente constante (I_t = I_1 = I_2), suma de resistencias (Req = R1 + R2), divisor de voltaje.
                </p>
            </div>
            <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #c084fc; margin: 0 0 0.5rem; font-size: 1rem;">3. Circuitos en Paralelo</h4>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Voltaje constante (V_t = V_1 = V_2), suma de corrientes (LCK), reducción de resistencia total.
                </p>
            </div>
        </div>

        <h3 id="ee-1-6-2" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">6.2 Guía de Diagnóstico de Fallas (Troubleshooting)</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            En el laboratorio real, los circuitos fallan con frecuencia. Esta tabla de diagnóstico te permitirá identificar y solucionar las 3 fallas eléctricas más comunes:
        </p>

        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 1.25rem; margin-bottom: 2rem;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                <thead>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left; color: #fbbf24;">
                        <th style="padding: 0.75rem;">Falla</th>
                        <th style="padding: 0.75rem;">Síntoma en Multímetro</th>
                        <th style="padding: 0.75rem;">Causa Probable</th>
                        <th style="padding: 0.75rem;">Solución</th>
                    </tr>
                </thead>
                <tbody style="color: #cbd5e1;">
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.75rem; color: #f87171; font-weight: bold;">Cortocircuito (R = 0)</td>
                        <td style="padding: 0.75rem;">Corriente altísima, voltaje cae a 0V</td>
                        <td style="padding: 0.75rem;">Cables positivo y negativo tocándose directamente</td>
                        <td style="padding: 0.75rem;">Revisar aislamiento y cableado antes de energizar</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.75rem; color: #38bdf8; font-weight: bold;">Circuito Abierto (R = ∞)</td>
                        <td style="padding: 0.75rem;">Corriente = 0A, lectura 'OL' en Ohmios</td>
                        <td style="padding: 0.75rem;">Cable roto, pista quemada o falso contacto</td>
                        <td style="padding: 0.75rem;">Probar continuidad con el buzzer del multímetro</td>
                    </tr>
                    <tr>
                        <td style="padding: 0.75rem; color: #fbbf24; font-weight: bold;">Sobrecarga de Potencia</td>
                        <td style="padding: 0.75rem;">Resistencia caliente, olor a quemado</td>
                        <td style="padding: 0.75rem;">Potencia calculada supera los Watts del resistor (1/4W, 1/2W)</td>
                        <td style="padding: 0.75rem;">Calcular P = I²R y sustituir por resistor de mayor potencia</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div style="margin: 2rem 0;">
            <div id="circuit-simulator-container"></div>
        </div>

        <h3 id="ee-1-6-3" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">6.3 Reto del Módulo: Regulador de Iluminación LED</h3>
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <h4 style="color: #c084fc; margin: 0 0 0.5rem; font-size: 1.1rem;">💡 Proyecto Práctico</h4>
            <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.7; margin: 0 0 1rem;">
                Diseña un circuito que alimente un LED rojo (voltaje de caída V<sub>LED</sub> = 2V, corriente segura I = 20 mA = 0.02 A) desde una fuente de alimentación de <strong>12V DC</strong>:
            </p>
            <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 1rem; font-family: monospace; font-size: 0.9rem; color: #38bdf8;">
                1. Voltaje que debe absorber la resistencia: V_R = 12V − 2V = <strong>10 V</strong><br/>
                2. Resistencia requerida: R = V_R / I = 10V / 0.02A = <strong>500 Ω</strong> (comercial: 510 Ω)<br/>
                3. Potencia disipada por el resistor: P = V_R × I = 10V × 0.02A = <strong>0.20 W (200 mW)</strong><br/>
                <em>→ Se puede usar una resistencia estándar de 1/4W (250 mW) de forma totalmente segura.</em>
            </div>
        </div>
    `,
    flashcards: [
        { id: 'ee-1-6-f1', type: 'review', q: '¿Qué es un cortocircuito?', a: 'Conexión de resistencia casi nula entre polos opuestos', sub: 'Genera corriente excesiva y peligro de fuego', sectionId: 'ee-1-6-2' },
        { id: 'ee-1-6-f2', type: 'review', q: '¿Qué indica una lectura "OL" (Over Limit) en el multímetro?', a: 'Circuito abierto o resistencia mayor al rango seleccionado', sub: 'Resistencia infinita', sectionId: 'ee-1-6-2' },
        { id: 'ee-1-6-f3', type: 'review', q: '¿Qué potencia máxima soporta un resistor comercial estándar de 1/4 Watt?', a: '0.25 Vatios (250 milivatios)', sub: 'Límite de disipación térmica', sectionId: 'ee-1-6-3' },
        { id: 'ee-1-6-f4', type: 'formula', q: 'Fórmula para calcular la resistencia limitadora de un LED:', a: 'R = (V_fuente - V_LED) / I_LED', sub: 'Ley de Ohm aplicada', sectionId: 'ee-1-6-3' },
        { id: 'ee-1-6-f5', type: 'review', q: '¿Cuál es la función del modo Continuidad en el multímetro?', a: 'Verificar si dos puntos están eléctricamente unidos emitiendo un sonido', sub: 'Prueba con buzzer', sectionId: 'ee-1-6-2' },
        { id: 'ee-1-6-f6', type: 'review', q: 'En serie la corriente es constante; ¿qué magnitud es constante en paralelo?', a: 'El Voltaje (tensión)', sub: 'Regla fundamental de Kirchhoff', sectionId: 'ee-1-6-1' },
        { id: 'ee-1-6-f7', type: 'review', q: '¿Por qué se debe redibujar el circuito al simplificar un mixto?', a: 'Para tener claridad paso a paso y evitar errores en nodos', sub: 'Método de reducción', sectionId: 'ee-1-6-1' },
        { id: 'ee-1-6-f8', type: 'review', q: '¿Qué instrumento mide simultáneamente Voltaje, Corriente y Resistencia?', a: 'El Multímetro Digital', sub: 'Tester / Polímetro', sectionId: 'ee-1-6-1' },
        { id: 'ee-1-6-f9', type: 'calc', q: 'Para un LED de 2V con fuente de 5V e I=15mA, ¿cuál es la resistencia?', a: '200 Ω', sub: '(5 - 2) / 0.015 = 200 Ω', sectionId: 'ee-1-6-3' },
        { id: 'ee-1-6-f10', type: 'review', q: '¿Qué ley afirma que la energía no se crea ni se destruye en un circuito?', a: 'El Principio de Conservación de la Energía (Balance de Potencias)', sub: 'P_suministrada = sum(P_disipada)', sectionId: 'ee-1-6-1' },
        { id: 'ee-1-6-f11', type: 'review', q: '¿En qué sentido fluyen los electrones en un circuito DC?', a: 'Del polo negativo (−) al polo positivo (+)', sub: 'Flujo electrónico real', sectionId: 'ee-1-6-1' },
        { id: 'ee-1-6-f12', type: 'review', q: '¿Qué componente protege contra sobrecorrientes abriéndose?', a: 'El Fusible', sub: 'Elemento de sacrificio', sectionId: 'ee-1-6-2' }
    ],
    questions: [
        {
            id: 'ee-1-6-q1',
            objective: 'Diagnosticar un cortocircuito',
            concept: 'diagnostico',
            difficulty: 'easy',
            q: 'Al medir un circuito notas que la corriente se dispara al máximo y la fuente se calienta. El síntoma indica:',
            options: ['Un cortocircuito (resistencia cercana a 0Ω)', 'Un circuito abierto', 'Un capacitor cargado', 'Un multímetro sin batería'],
            correct: 0
        },
        {
            id: 'ee-1-6-q2',
            objective: 'Calcular resistencia limitadora para un LED',
            concept: 'calculo_led',
            difficulty: 'medium',
            q: 'Deseas conectar un LED (2V, 20mA) a una fuente de 12V. La resistencia limitadora adecuada es de:',
            options: ['500 Ω', '600 Ω', '100 Ω', '50 Ω'],
            correct: 0
        },
        {
            id: 'ee-1-6-q3',
            objective: 'Verificar la disipación de potencia en un resistor',
            concept: 'potencia_resistor',
            difficulty: 'hard',
            q: 'En el caso anterior (V_R = 10V, I = 0.02A), ¿cuál es la potencia disipada por la resistencia?',
            options: ['0.20 W (200 mW)', '2.4 W', '0.02 W', '10 W'],
            correct: 0
        },
        {
            id: 'ee-1-6-q4',
            objective: 'Interpretar la prueba de continuidad',
            concept: 'continuidad',
            difficulty: 'easy',
            q: 'En la función de continuidad con buzzer del multímetro, un pitido continuo significa:',
            options: ['Hay continuidad eléctrica (el cable está sano y conduce)', 'El circuito está roto', 'Hay alta tensión peligrosa', 'La resistencia es infinita'],
            correct: 0
        },
        {
            id: 'ee-1-6-q5',
            objective: 'Comparar leyes de Kirchhoff',
            concept: 'kirchhoff',
            difficulty: 'medium',
            q: 'La ley que establece que la suma de voltajes en una malla cerrada es cero corresponde a:',
            options: ['La Ley de Voltajes de Kirchhoff (LVK)', 'La Ley de Corrientes de Kirchhoff (LCK)', 'La Ley de Faraday', 'La Ley de Ampere'],
            correct: 0
        },
        {
            id: 'ee-1-6-q6',
            objective: 'Identificar propiedades de circuitos mixtos',
            concept: 'circuitos_mixtos',
            difficulty: 'medium',
            q: 'Al calcular la potencia total de cualquier circuito (serie, paralelo o mixto):',
            options: ['Se suman directamente las potencias disipadas en cada elemento', 'Solo se cuenta la resistencia más grande', 'Se restan las potencias de las ramas paralelas', 'Depende únicamente de los aislantes'],
            correct: 0
        },
        {
            id: 'ee-1-6-q7',
            objective: 'Identificar el comportamiento de la corriente en nodos',
            concept: 'lck',
            difficulty: 'easy',
            q: 'En un nodo donde entran 15A por un cable y salen por dos cables (uno con 9A), ¿cuánta corriente lleva el otro?',
            options: ['6 A', '24 A', '135 A', '15 A'],
            correct: 0
        },
        {
            id: 'ee-1-6-q8',
            objective: 'Comprender el efecto Joule',
            concept: 'efecto_joule',
            difficulty: 'medium',
            q: 'El calentamiento de un conductor o resistor por el paso de corriente eléctrica se conoce como:',
            options: ['Efecto Joule', 'Efecto Doppler', 'Efecto Fotoeléctrico', 'Efecto Hall'],
            correct: 0
        },
        {
            id: 'ee-1-6-q9',
            objective: 'Calcular resistencia equivalente en circuito mixto',
            concept: 'calculo_mixto',
            difficulty: 'hard',
            q: 'Dos resistencias de 40Ω en paralelo conectadas en serie con otra de 10Ω tienen una Req de:',
            options: ['30 Ω', '50 Ω', '90 Ω', '20 Ω'],
            correct: 0
        },
        {
            id: 'ee-1-6-q10',
            objective: 'Dominio de magnitudes y unidades del SI',
            concept: 'unidades_si',
            difficulty: 'easy',
            q: 'La terna correcta de magnitudes y unidades fundamentales es:',
            options: ['Voltaje (V) - Corriente (A) - Resistencia (Ω)', 'Voltaje (W) - Corriente (V) - Resistencia (A)', 'Voltaje (A) - Corriente (Ω) - Resistencia (V)', 'Voltaje (J) - Corriente (W) - Resistencia (Hz)'],
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
                id: 'ee-m1-l6-content',
                content: lessonDefinition.content,
                hasSimulator: lessonDefinition.hasSimulator
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ee-m1-l6-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m1-l6-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions,
                quizConfig: lessonDefinition.quizConfig
            })
        ]
    }
});
