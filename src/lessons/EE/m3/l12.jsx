import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Contadores Binarios y Divisores de Frecuencia (CI 74LS93)',
    hasSimulator: true,
    content: `
        <!-- ── 12.1 Introducción a los Circuitos Secuenciales y Flip-Flops ── -->
        <h3 id="ee-3-12-1" style="color: #f59e0b; margin: 1.5rem 0 1rem; font-size: 1.4rem;">12.1 Circuitos Secuenciales: De la Lógica Combinacional a la Memoria Digital</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            En la electrónica digital existen dos grandes categorías de circuitos:
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 1.25rem;">
                <div style="color: #38bdf8; font-weight: 800; font-size: 1rem; margin-bottom: 0.5rem;">1. Lógica Combinacional</div>
                <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin: 0;">
                    La salida depende <strong>únicamente del estado actual de sus entradas</strong> en ese instante preciso (ej. compuertas AND, OR, NOT, multiplexores). No poseen memoria de eventos pasados.
                </p>
            </div>
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 1.25rem;">
                <div style="color: #10b981; font-weight: 800; font-size: 1rem; margin-bottom: 0.5rem;">2. Lógica Secuencial (Contadores y Registros)</div>
                <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin: 0;">
                    La salida depende del estado de las entradas <strong>Y de la historia previa (el estado anterior almacenado en memoria)</strong>. Su bloque elemental es el <strong>Flip-Flop</strong>, que almacena 1 bit de información ($0$ o $1$).
                </p>
            </div>
        </div>

        <!-- El Flip-Flop como Divisor por 2 -->
        <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 18px; padding: 1.35rem; margin-bottom: 2rem;">
            <div style="color: #fbbf24; font-weight: 800; font-size: 1.05rem; margin-bottom: 0.5rem;">⚡ El Flip-Flop tipo T / JK como Divisor de Frecuencia entre 2:</div>
            <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.7; margin: 0;">
                Cuando un Flip-Flop se configura en modo de alternancia (Toggle), cada pulso de reloj que entra por su pin CLOCK hace que su salida cambie de estado (de 0 a 1, o de 1 a 0) en el <strong>flanco de bajada (Negative Edge)</strong>. Por consiguiente, se necesitan <strong>dos pulsos de entrada para completar un ciclo completo de salida</strong>, logrando que la frecuencia de salida sea exactamente la mitad: <code>f_out = f_in / 2</code>.
            </p>
        </div>

        <!-- ── 12.2 Arquitectura y Pines del CI 74LS93 ── -->
        <h3 id="ee-3-12-2" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">12.2 Anatomía del Contador Asíncrono de 4 Bits: CI 74LS93 (Familia TTL)</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            El <strong>74LS93</strong> es un circuito integrado de lógica digital TTL (<em>Transistor-Transistor Logic</em>) encapsulado en formato <strong>DIP-14</strong> que contiene en su interior <strong>4 Flip-Flops tipo JK maestros-esclavos interconectados</strong>.
        </p>

        <!-- Distribución de Pines 74LS93 -->
        <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 18px; padding: 1.5rem; margin-bottom: 2rem;">
            <div style="color: #38bdf8; font-weight: 800; font-size: 1.1rem; margin-bottom: 1rem;">📌 Pines Clave del CI 74LS93 (DIP-14):</div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; font-size: 0.85rem; color: #cbd5e1;">
                <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 0.9rem;">
                    <strong style="color: #38bdf8;">Pin 14 (CKA / Clock A):</strong> Entrada de reloj para el 1er Flip-Flop (sección divisor por 2). Se activa en flanco de bajada.<br/>
                    <strong style="color: #38bdf8;">Pin 1 (CKB / Clock B):</strong> Entrada de reloj para los Flip-Flops 2, 3 y 4 (sección divisor por 8).<br/>
                    <strong style="color: #10b981;">Pin 12 (QA):</strong> Salida del Bit 0 (Menos significativo, peso = $2^0 = 1$).<br/>
                    <strong style="color: #10b981;">Pin 9 (QB):</strong> Salida del Bit 1 (Peso = $2^1 = 2$).
                </div>
                <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 0.9rem;">
                    <strong style="color: #10b981;">Pin 8 (QC):</strong> Salida del Bit 2 (Peso = $2^2 = 4$).<br/>
                    <strong style="color: #10b981;">Pin 11 (QD):</strong> Salida del Bit 3 (Más significativo, peso = $2^3 = 8$).<br/>
                    <strong style="color: #ef4444;">Pin 2 y Pin 3 (R0(1) y R0(2)):</strong> Entradas de Reset a Cero. Cuando ambas están en nivel ALTO (1 y 1), resetean instantáneamente las 4 salidas a 0000.<br/>
                    <strong style="color: #fbbf24;">Pin 5 (V_CC = +5V) y Pin 10 (GND / Tierra).</strong>
                </div>
            </div>
        </div>

        <!-- Placeholder Imagen: Diagrama Lógico Interno del 74LS93 -->
        <div style="background: #0f172a; border: 2px dashed rgba(56, 189, 248, 0.4); border-radius: 16px; padding: 1.5rem; text-align: center; margin: 1.5rem 0 2rem;">
            <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">🔢</div>
            <div style="color: #38bdf8; font-weight: 700; font-size: 0.95rem; margin-bottom: 0.25rem;">[ESQUEMA DIDÁCTICO: Diagrama Lógico Interno del CI 74LS93 y Flip-Flops en Cascada]</div>
            <div style="color: #94a3b8; font-size: 0.8rem;">Visualización de la sección Divisor por 2 (CKA -> QA), Divisor por 8 (CKB -> QB, QC, QD) y compuerta NAND de Reset R0</div>
        </div>

        <!-- ── 12.3 Modos de Conexión: Módulo 16 (0 a 15) vs Módulo 10 BCD (0 a 9) ── -->
        <h3 id="ee-3-12-3" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">12.3 Modos de Configuración: Contador Módulo 16 vs Contador Módulo 10 (BCD 0 a 9)</h3>

        <!-- Comparativa Módulo 16 vs Módulo 10 -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
            <!-- Módulo 16 -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 18px; padding: 1.35rem;">
                <div style="color: #38bdf8; font-weight: 800; font-size: 1.05rem; margin-bottom: 0.5rem;">🔹 Modo 1: Contador Binario Módulo 16 (0 al 15)</div>
                <p style="color: #cbd5e1; font-size: 0.83rem; line-height: 1.6; margin-bottom: 0.75rem;">
                    Para contar los 16 estados posibles ($0000_2$ a $1111_2$), conectamos la señal de reloj principal en el <strong>Pin 14 (CKA)</strong> y hacemos un <strong>puente externo entre la salida QA (Pin 12) y la entrada CKB (Pin 1)</strong>.
                </p>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.6rem; font-size: 0.78rem; color: #94a3b8;">
                    • <strong>Entradas de Reset (Pines 2 y 3):</strong> Conectadas permanentemente a <strong>GND</strong> para que nunca fuercen reinicio.<br/>
                    • <strong>Secuencia:</strong> 0, 1, 2, 3, ..., 14, 15 y vuelve a 0.
                </div>
            </div>

            <!-- Módulo 10 BCD -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(16, 185, 129, 0.35); border-radius: 18px; padding: 1.35rem;">
                <div style="color: #10b981; font-weight: 800; font-size: 1.05rem; margin-bottom: 0.5rem;">🟢 Modo 2: Contador Decimal / BCD Módulo 10 (0 al 9)</div>
                <p style="color: #cbd5e1; font-size: 0.83rem; line-height: 1.6; margin-bottom: 0.75rem;">
                    En sistemas de displays numéricos solo queremos contar del 0 al 9. El número que sigue al 9 ($1001_2$) es el <strong>10 en binario ($1010_2$)</strong>, donde los bits activos son <strong>QD (peso 8) y QB (peso 2)</strong> ($8 + 2 = 10$).
                </p>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.6rem; font-size: 0.78rem; color: #94a3b8;">
                    • <strong>El Truco del Reset Automático:</strong> Conectamos la salida <strong>QD (Pin 11) al Pin 2 (R0(1))</strong> y la salida <strong>QB (Pin 9) al Pin 3 (R0(2))</strong>.<br/>
                    • <strong>Resultado:</strong> En cuanto el contador intenta pasar a 10, la compuerta interna detecta dos 1s lógicos y resetea las salidas a <code>0000</code> en nanosegundos (imperceptible al ojo humano).
                </div>
            </div>
        </div>

        <!-- ── 12.4 Tabla de Estados Binarios (BCD) ── -->
        <h3 id="ee-3-12-4" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">12.4 Tabla de Conteo BCD (Binary Coded Decimal) 0 a 9</h3>
        <div style="overflow-x: auto; margin-bottom: 2rem;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #cbd5e1; background: rgba(15, 23, 42, 0.7); border-radius: 12px; overflow: hidden;">
                <thead>
                    <tr style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; text-align: center;">
                        <th style="padding: 10px 14px; text-align: left;">Dígito Decimal</th>
                        <th style="padding: 10px 14px;">QD (Pin 11 - Peso 8)</th>
                        <th style="padding: 10px 14px;">QC (Pin 8 - Peso 4)</th>
                        <th style="padding: 10px 14px;">QB (Pin 9 - Peso 2)</th>
                        <th style="padding: 10px 14px;">QA (Pin 12 - Peso 1)</th>
                        <th style="padding: 10px 14px;">Palabra Binaria (QD QC QB QA)</th>
                    </tr>
                </thead>
                <tbody style="text-align: center;">
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">0</td><td>0</td><td>0</td><td>0</td><td>0</td><td><code>0000</code></td></tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">1</td><td>0</td><td>0</td><td>0</td><td>1</td><td><code>0001</code></td></tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">2</td><td>0</td><td>0</td><td>1</td><td>0</td><td><code>0010</code></td></tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">3</td><td>0</td><td>0</td><td>1</td><td>1</td><td><code>0011</code></td></tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">4</td><td>0</td><td>1</td><td>0</td><td>0</td><td><code>0100</code></td></tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">5</td><td>0</td><td>1</td><td>0</td><td>1</td><td><code>0101</code></td></tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">6</td><td>0</td><td>1</td><td>1</td><td>0</td><td><code>0110</code></td></tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">7</td><td>0</td><td>1</td><td>1</td><td>1</td><td><code>0111</code></td></tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">8</td><td>1</td><td>0</td><td>0</td><td>0</td><td><code>1000</code></td></tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">9</td><td>1</td><td>0</td><td>0</td><td>1</td><td><code>1001</code></td></tr>
                    <tr style="background: rgba(239, 68, 68, 0.1); color: #ef4444;"><td style="padding: 8px 14px; text-align: left; font-weight: bold;">(10 - Reset)</td><td>1</td><td>0</td><td>1</td><td>0</td><td><code>1010 → Inmediato Reset a 0000</code></td></tr>
                </tbody>
            </table>
        </div>
    `
};

export const lessonData = defineLesson({
    title: lessonDefinition.title,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m3-l12-content',
                content: lessonDefinition.content
            })
        ],
        flashcards: [
            createFlashcardsBlock({
                id: 'ee-m3-l12-flashcards',
                title: 'Flashcards Nemotécnicas: Contador 74LS93',
                cards: [
                    {
                        id: 'ee-m3-l12-fc1',
                        front: '¿Cuál es la diferencia fundamental entre lógica combinacional y lógica secuencial?',
                        back: 'La combinacional solo depende de las entradas actuales; la secuencial posee memoria interna y depende del estado previo y una señal de reloj.'
                    },
                    {
                        id: 'ee-m3-l12-fc2',
                        front: '¿Cómo funciona un Flip-Flop como divisor de frecuencia por 2?',
                        back: 'Cada ciclo de reloj completo conmuta el Flip-Flop una vez, requiriendo 2 pulsos de entrada para generar un período completo en su salida (f_out = f_in / 2).'
                    },
                    {
                        id: 'ee-m3-l12-fc3',
                        front: '¿Cuántos Flip-Flops internos posee el circuito integrado 74LS93?',
                        back: 'Posee 4 Flip-Flops tipo JK configurados como contador binario asíncrono (Ripple Counter).'
                    },
                    {
                        id: 'ee-m3-l12-fc4',
                        front: '¿Por qué el 74LS93 se clasifica como contador "asíncrono" o "ondulado" (Ripple)?',
                        back: 'Porque la salida de un Flip-Flop sirve como señal de reloj para el siguiente, propagando la señal como una ola en lugar de recibir el reloj todos al mismo tiempo.'
                    },
                    {
                        id: 'ee-m3-l12-fc5',
                        front: '¿Cuáles son los pesos binarios de las salidas QA, QB, QC y QD del 74LS93?',
                        back: 'QA = 1 (2^0), QB = 2 (2^1), QC = 4 (2^2) y QD = 8 (2^3).'
                    },
                    {
                        id: 'ee-m3-l12-fc6',
                        front: '¿Qué puente externo es indispensable para configurar el 74LS93 como contador de 4 bits (Módulo 16)?',
                        back: 'Conectar un cable entre la salida QA (Pin 12) y la entrada de reloj CKB (Pin 1).'
                    },
                    {
                        id: 'ee-m3-l12-fc7',
                        front: '¿Qué condición deben cumplir las entradas R0(1) y R0(2) para reiniciar el contador a 0000?',
                        back: 'Ambas entradas deben estar simultáneamente en nivel ALTO (1 lógico / 5V).'
                    },
                    {
                        id: 'ee-m3-l12-fc8',
                        front: '¿Cómo se convierte el 74LS93 en un contador de décadas BCD (Módulo 10, del 0 al 9)?',
                        back: 'Conectando las salidas QD (Pin 11) y QB (Pin 9) a las entradas de reset R0(1) y R0(2), forzando el reinicio al alcanzar el número 10 (1010_2).'
                    },
                    {
                        id: 'ee-m3-l12-fc9',
                        front: '¿Qué voltaje de alimentación estándar requiere la familia TTL 74LS?',
                        back: 'Exactamente +5V DC regulados (tolerancia entre 4.75V y 5.25V).'
                    },
                    {
                        id: 'ee-m3-l12-fc10',
                        front: '¿En qué flanco de la señal de reloj conmuta el CI 74LS93?',
                        back: 'En el flanco de bajada (Negative-edge triggered), es decir, cuando la señal pasa de 5V (HIGH) a 0V (LOW).'
                    }
                ]
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m3-l12-quiz',
                title: 'Evaluación: Contador Binario CI 74LS93',
                questions: [
                    {
                        id: 'ee-m3-l12-q1',
                        objective: 'Identificar la función del CI 74LS93',
                        concept: 'funcion_74ls93',
                        difficulty: 'easy',
                        q: '¿Cuál es la función principal del circuito integrado 74LS93?',
                        options: [
                            'Contador binario asíncrono de 4 bits y divisor de frecuencia',
                            'Amplificador operacional de audio',
                            'Regulador de voltaje lineal conmutable',
                            'Decodificador de radiofrecuencia'
                        ],
                        correct: 0,
                        feedback: '¡Exacto! El 74LS93 es un contador binario de 4 bits capaz de contar pulsos y dividir frecuencias por 2, 4, 8 y 16.'
                    },
                    {
                        id: 'ee-m3-l12-q2',
                        objective: 'Comprender la división de frecuencia',
                        concept: 'division_frecuencia',
                        difficulty: 'medium',
                        q: 'Si inyectas una señal de reloj de 1000 Hz en la entrada CKA del 74LS93 configurado en módulo 16, ¿cuál será la frecuencia en la salida más significativa QD?',
                        options: [
                            '62.5 Hz (1000 Hz / 16)',
                            '500 Hz',
                            '250 Hz',
                            '125 Hz'
                        ],
                        correct: 0,
                        feedback: '¡Correcto! Cada salida sucesiva divide por 2: QA = 500 Hz (÷2), QB = 250 Hz (÷4), QC = 125 Hz (÷8) y QD = 62.5 Hz (÷16).'
                    },
                    {
                        id: 'ee-m3-l12-q3',
                        objective: 'Reconocer el puente en cascada',
                        concept: 'cascada_74ls93',
                        difficulty: 'medium',
                        q: 'Para unir las dos secciones internas del 74LS93 (divisor por 2 y divisor por 8) y formar un contador completo de 4 bits, ¿qué conexión debe realizarse?',
                        options: [
                            'Puentear el Pin 12 (QA) con el Pin 1 (CKB)',
                            'Puentear el Pin 14 (CKA) con GND',
                            'Puentear el Pin 11 (QD) con Pin 8 (QC)',
                            'Puentear Pin 2 con Pin 5 (Vcc)'
                        ],
                        correct: 0,
                        feedback: '¡Excelente! Al conectar la salida del primer divisor QA a la entrada del segundo bloque CKB, los 4 flip-flops quedan encadenados en cascada.'
                    },
                    {
                        id: 'ee-m3-l12-q4',
                        objective: 'Interpretar el peso binario',
                        concept: 'pesos_binarios',
                        difficulty: 'easy',
                        q: 'Si las salidas del 74LS93 muestran el estado binario QD=0, QC=1, QB=1, QA=0, ¿a qué número decimal equivale?',
                        options: [
                            '6 (0·8 + 1·4 + 1·2 + 0·1 = 6)',
                            '3',
                            '12',
                            '5'
                        ],
                        correct: 0,
                        feedback: '¡Correcto! En binario 0110 equivale en decimal a 4 + 2 = 6.'
                    },
                    {
                        id: 'ee-m3-l12-q5',
                        objective: 'Configuración de contador BCD Módulo 10',
                        concept: 'modulo_10_bcd',
                        difficulty: 'hard',
                        q: 'Para lograr que el contador 74LS93 solo cuente del 0 al 9 (Módulo 10), ¿a cuáles salidas debemos conectar las entradas de reset R0(1) y R0(2)?',
                        options: [
                            'A las salidas QD (peso 8) y QB (peso 2), correspondientes al valor 10 (1010 en binario)',
                            'A las salidas QA y QC',
                            'A las salidas QA y QD',
                            'A GND y VCC respectivamente'
                        ],
                        correct: 0,
                        feedback: '¡Muy bien! Al llegar a 10 (1010_2), QD y QB se ponen en nivel ALTO simultáneamente, activando el reset instantáneo a 0000.'
                    },
                    {
                        id: 'ee-m3-l12-q6',
                        objective: 'Manejo de entradas de reset en operación normal',
                        concept: 'reset_operacion_normal',
                        difficulty: 'medium',
                        q: 'Si deseas que el 74LS93 cuente libremente hasta 15 sin reiniciarse antes, ¿dónde debes conectar los pines R0(1) y R0(2)?',
                        options: [
                            'A tierra (GND / 0V)',
                            'A +5V (V_CC)',
                            'Al pin de salida QA',
                            'Dejarlos al aire sin conexión'
                        ],
                        correct: 0,
                        feedback: '¡Exacto! Al conectar las entradas de reset a GND garantizamos que nunca se activen y el contador recorra sus 16 estados naturales (0 a 15).'
                    },
                    {
                        id: 'ee-m3-l12-q7',
                        objective: 'Identificar tipo de disparo por flanco',
                        concept: 'flanco_disparo',
                        difficulty: 'medium',
                        q: 'El 74LS93 avanza su conteo en:',
                        options: [
                            'El flanco de bajada (transición de 5V a 0V) de la señal de reloj',
                            'El flanco de subida (transición de 0V a 5V)',
                            'El nivel constante de 5V',
                            'La desconexión de la fuente'
                        ],
                        correct: 0,
                        feedback: '¡Correcto! Los flip-flops del 74LS93 son activados por flanco negativo (Negative-Edge Triggered).'
                    },
                    {
                        id: 'ee-m3-l12-q8',
                        objective: 'Conocer la tensión de alimentación TTL',
                        concept: 'alimentacion_ttl',
                        difficulty: 'easy',
                        q: '¿Cuál es el rango de voltaje de alimentación seguro para los circuitos integrados de la familia TTL 74LS?',
                        options: [
                            '+4.75V a +5.25V (5V nominal)',
                            '+12V a +24V',
                            '-5V a +5V',
                            '+1.5V a +3.0V'
                        ],
                        correct: 0,
                        feedback: '¡Excelente! La familia lógica TTL estándar está estrictamente diseñada para trabajar a 5V DC regulados.'
                    },
                    {
                        id: 'ee-m3-l12-q9',
                        objective: 'Diferenciar contador síncrono vs asíncrono',
                        concept: 'retardo_propagacion',
                        difficulty: 'hard',
                        q: '¿Qué fenómeno ocurre en un contador asíncrono como el 74LS93 debido a la conexión en cadena de sus flip-flops?',
                        options: [
                            'Retardo de propagación acumulativo (pequeño retraso temporal entre la conmutación de cada bit sucesivo)',
                            'Consumo de corriente nulo',
                            'Aumento indefinido de la frecuencia de reloj',
                            'Inversión de los números pares a impares'
                        ],
                        correct: 0,
                        feedback: '¡Muy bien! Como cada flip-flop espera a que el anterior conmute para recibir su reloj, los retardos se suman (Ripple effect), lo que limita la velocidad máxima comparado con un contador síncrono.'
                    },
                    {
                        id: 'ee-m3-l12-q10',
                        objective: 'Interconexión en sistemas de visualización',
                        concept: 'interconexion_display',
                        difficulty: 'medium',
                        q: 'En un sistema de reloj digital, ¿a qué circuito integrado se conectan las salidas QA, QB, QC y QD del 74LS93?',
                        options: [
                            'A las entradas de un decodificador BCD a 7 segmentos como el CD4511 o 74LS47',
                            'Directamente a la toma de corriente alterna de 110V',
                            'A un transformador elevador de tensión',
                            'Al pin Trigger del temporizador 555'
                        ],
                        correct: 0,
                        feedback: '¡Exacto! El decodificador BCD toma las 4 líneas binarias del 74LS93 y las transforma en las señales necesarias para encender los 7 segmentos del display.'
                    }
                ],
                quizConfig: { timePerQuestion: 30, requiredScorePercent: 80 }
            })
        ]
    }
});
