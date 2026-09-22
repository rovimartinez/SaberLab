import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Temporizador CI NE555 (Modo Astable y Monoestable)',
    hasSimulator: true,
    content: `
        <!-- ── 11.1 Introducción al Circuito Integrado NE555 ── -->
        <h3 id="ee-3-11-1" style="color: #f59e0b; margin: 1.5rem 0 1rem; font-size: 1.4rem;">11.1 ¿Qué es el CI NE555 y por qué es el Integrado más Famoso del Mundo?</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Diseñado en 1971 por Hans Camenzind para la compañía <em>Signetics</em>, el <strong>NE555</strong> (o simplemente "el 555") es el circuito integrado más producido y utilizado en la historia de la electrónica, con miles de millones de unidades fabricadas cada año.
        </p>
        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            El 555 es un <strong>temporizador analógico-digital de precisión</strong> capaz de generar oscilaciones periódicas (trenes de pulsos de reloj), retardos temporizados de microsegundos a horas, modulación de ancho de pulso (PWM) y alarmas audibles con una estabilidad térmica excepcional.
        </p>

        <!-- Anatomía de Pines en DIP-8 -->
        <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 18px; padding: 1.5rem; margin-bottom: 2rem;">
            <div style="color: #38bdf8; font-weight: 800; font-size: 1.1rem; margin-bottom: 1rem;">📌 Distribución y Función de los 8 Pines del Encapsulado DIP-8:</div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem;">
                <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 0.9rem;">
                    <strong style="color: #ef4444;">Pin 1 (GND):</strong> Tierra / Negativo de la fuente.<br/>
                    <strong style="color: #38bdf8;">Pin 2 (TRIGGER / Disparo):</strong> Si cae por debajo de <strong>1/3 V_CC</strong>, dispara el temporizador poniendo la salida (Pin 3) en ALTO.<br/>
                    <strong style="color: #10b981;">Pin 3 (OUTPUT / Salida):</strong> Suministra o absorbe hasta <strong>200 mA</strong> (capaz de mover directamente LEDs, buzzers y pequeños relés).<br/>
                    <strong style="color: #fbbf24;">Pin 4 (RESET):</strong> Reinicia el CI si se conecta a GND. En operación normal se conecta directamente a <strong>V_CC</strong>.
                </div>
                <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 0.9rem;">
                    <strong style="color: #a855f7;">Pin 5 (CONTROL):</strong> Permite modular los umbrales internamente. Si no se usa, se conecta a GND con un capacitor cerámico de <strong>10 nF (0.01 µF)</strong> para desacoplar ruido.<br/>
                    <strong style="color: #38bdf8;">Pin 6 (THRESHOLD / Umbral):</strong> Si supera los <strong>2/3 V_CC</strong>, apaga la salida (Pin 3 pasa a BAJO).<br/>
                    <strong style="color: #f59e0b;">Pin 7 (DISCHARGE / Descarga):</strong> Transistor interno NPN que conecta a GND para descargar el capacitor externo.<br/>
                    <strong style="color: #ef4444;">Pin 8 (V_CC):</strong> Alimentación positiva (+4.5V a +15V DC).
                </div>
            </div>
        </div>

        <!-- Placeholder Imagen: Diagrama de Bloques Interno del 555 -->
        <div style="background: #0f172a; border: 2px dashed rgba(56, 189, 248, 0.4); border-radius: 16px; padding: 1.5rem; text-align: center; margin: 1.5rem 0 2rem;">
            <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">🔬</div>
            <div style="color: #38bdf8; font-weight: 700; font-size: 0.95rem; margin-bottom: 0.25rem;">[ESQUEMA DIDÁCTICO: Arquitectura Interna del CI NE555]</div>
            <div style="color: #94a3b8; font-size: 0.8rem;">Visualización del divisor resistivo de 3 resistores de 5 kΩ (origen del nombre '555'), los 2 comparadores de voltaje, el Flip-Flop RS interno y el transistor de descarga</div>
        </div>

        <!-- ── 11.2 El Modo Astable (Generador de Pulsos / Oscilador de Reloj) ── -->
        <h3 id="ee-3-11-2" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">11.2 El Modo Astable: Generador de Reloj y Ondas Cuadradas</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            En la configuración <strong>Astable</strong>, el circuito no posee ningún estado estable: oscila de forma continua y autónoma entre nivel ALTO (V_CC) y nivel BAJO (0V). Es el generador de reloj por excelencia para circuitos secuenciales, contadores binarios, luces intermitentes y sintetizadores de tono.
        </p>

        <!-- Funcionamiento Astable -->
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 16px; padding: 1.25rem; margin-bottom: 1.5rem;">
            <h4 style="color: #38bdf8; margin: 0 0 0.5rem; font-size: 1.05rem;">🔄 Dinámica de Carga y Descarga del Capacitor (C):</h4>
            <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.7; margin-bottom: 0.5rem;">
                • <strong>Fase de Carga (Salida en ALTO):</strong> El capacitor externo <code>C</code> se carga desde V_CC a través de <code>R_A + R_B</code>. Cuando el voltaje en el Pin 6 (Threshold) alcanza <strong>2/3 V_CC</strong>, el comparador interno conmuta el Flip-Flop, la salida (Pin 3) pasa a nivel BAJO y el transistor de descarga (Pin 7) se satura.<br/>
                • <strong>Fase de Descarga (Salida en BAJO):</strong> El capacitor <code>C</code> se descarga hacia tierra únicamente a través de <code>R_B</code> hacia el Pin 7. Cuando la tensión cae a <strong>1/3 V_CC</strong>, el comparador del Pin 2 (Trigger) restablece el Flip-Flop, la salida vuelve a nivel ALTO, el Pin 7 se apaga y el ciclo se repite indefinidamente.
            </p>
        </div>

        <!-- Fórmulas Matemáticas Astable -->
        <div style="background: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.35); border-radius: 18px; padding: 1.35rem; margin-bottom: 2rem;">
            <div style="color: #10b981; font-weight: 800; font-size: 1.05rem; margin-bottom: 0.75rem;">📐 Fórmulas Matemáticas del Modo Astable:</div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; color: #cbd5e1; font-size: 0.85rem;">
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.8rem;">
                    <strong style="color: #38bdf8;">Tiempo en Alto (t_1):</strong><br/>
                    <code>t_1 = 0.693 · (R_A + R_B) · C</code>
                </div>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.8rem;">
                    <strong style="color: #fbbf24;">Tiempo en Bajo (t_2):</strong><br/>
                    <code>t_2 = 0.693 · R_B · C</code>
                </div>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.8rem;">
                    <strong style="color: #10b981;">Período Total (T):</strong><br/>
                    <code>T = t_1 + t_2 = 0.693 · (R_A + 2·R_B) · C</code>
                </div>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.8rem;">
                    <strong style="color: #f59e0b;">Frecuencia de Oscilación (f):</strong><br/>
                    <code>f = 1 / T = 1.44 / ((R_A + 2·R_B) · C)</code>
                </div>
            </div>

            <div style="margin-top: 1rem; background: rgba(0,0,0,0.25); border-radius: 10px; padding: 0.75rem; font-size: 0.83rem; color: #94a3b8;">
                <strong>Ciclo de Trabajo (Duty Cycle %):</strong> Relación porcentual del tiempo que la señal permanece en ALTO respecto al período total:<br/>
                <code>Duty Cycle = [ (R_A + R_B) / (R_A + 2·R_B) ] · 100%</code> (Siempre resulta estrictamente mayor al 50% en la topología estándar).
            </div>
        </div>

        <!-- ── 11.3 Ejemplo de Cálculo Práctico: Generador de Pulsos de 1 Hz (1 Pulso por Segundo) ── -->
        <h3 id="ee-3-11-3" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">11.3 Caso Práctico de Diseño: Generador de Reloj de 1 Hz para Reloj Digital</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Para controlar un contador de segundos o avanzar un display digital cada segundo, necesitamos una frecuencia exacta de <strong>f = 1 Hz</strong> (Período T = 1 segundo).
        </p>

        <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 16px; padding: 1.35rem; margin-bottom: 2rem;">
            <div style="color: #38bdf8; font-weight: 800; font-size: 0.95rem; margin-bottom: 0.5rem;">🛠️ Selección de Valores Comerciales Estándar:</div>
            <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.7; margin: 0;">
                1. Seleccionamos un capacitor electrolítico comercial: <strong>C = 10 µF = 0.000010 F</strong>.<br/>
                2. De la fórmula: <code>(R_A + 2·R_B) = 1.44 / (f · C) = 1.44 / (1 · 10·10^-6) = 144,000 Ω = 144 kΩ</code>.<br/>
                3. Si elegimos una resistencia <strong>R_B = 68 kΩ</strong>:<br/>
                <code>R_A = 144 kΩ - 2·(68 kΩ) = 144 kΩ - 136 kΩ = 8 kΩ</code> (Usamos comercial estándar <strong>R_A = 8.2 kΩ o 10 kΩ</strong> o un potenciómetro de ajuste fino).<br/>
                4. Con estos valores, el LED conectado en la salida (Pin 3 con resistor de 330Ω) destellará exactamente una vez cada segundo.
            </p>
        </div>

        <!-- ── 11.4 El Modo Monoestable (Temporizador de Disparo Único) ── -->
        <h3 id="ee-3-11-4" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">11.4 El Modo Monoestable (One-Shot Timer)</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            En la configuración <strong>Monoestable</strong>, el circuito tiene un único estado estable (Salida en nivel BAJO). Cuando recibe un pulso de disparo negativo momentáneo en el <strong>Pin 2 (Trigger &lt; 1/3 V_CC)</strong>, la salida pasa inmediatamente a nivel ALTO durante un tiempo determinado <strong>T</strong> y luego regresa automáticamente a reposo.
        </p>

        <div style="background: rgba(245, 158, 11, 0.08); border: 1.5px solid rgba(245, 158, 11, 0.35); border-radius: 16px; padding: 1.25rem; margin-bottom: 2rem;">
            <div style="color: #fbbf24; font-weight: 800; font-size: 1rem; margin-bottom: 0.4rem;">⏱️ Ecuación del Tiempo Monoestable:</div>
            <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.6; margin-bottom: 0.5rem;">
                <code style="color: #f59e0b; font-size: 1.05rem; font-weight: bold;">T = 1.1 · R · C</code>
            </p>
            <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.6; margin: 0;">
                <strong>Aplicaciones Típicas:</strong> Luces de escalera con auto-apagado, temporizadores de lavado, eliminadores de rebote mecánico para pulsadores (<em>Debounce</em>) y retardos de encendido de seguridad para fuentes de poder.
            </p>
        </div>

        <!-- Placeholder Imagen: Esquema Práctico del 555 Astable en Protoboard -->
        <div style="background: #0f172a; border: 2px dashed rgba(16, 185, 129, 0.4); border-radius: 16px; padding: 1.5rem; text-align: center; margin: 1.5rem 0 2rem;">
            <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">🔌</div>
            <div style="color: #10b981; font-weight: 700; font-size: 0.95rem; margin-bottom: 0.25rem;">[ESQUEMA DIDÁCTICO: Conexión del 555 Astable en Protoboard con LED Testigo y Puente 2-6]</div>
            <div style="color: #94a3b8; font-size: 0.8rem;">Diagrama de cableado con puente entre pines 2 y 6, R_A entre pin 8 y 7, R_B entre pin 7 y 6, y C entre pin 2 y GND</div>
        </div>
    `
};

export const lessonData = defineLesson({
    title: lessonDefinition.title,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m3-l11-content',
                content: lessonDefinition.content
            })
        ],
        flashcards: [
            createFlashcardsBlock({
                id: 'ee-m3-l11-flashcards',
                title: 'Flashcards Nemotécnicas: Temporizador NE555',
                cards: [
                    {
                        id: 'ee-m3-l11-fc1',
                        front: '¿De dónde proviene el nombre "555" del célebre circuito integrado?',
                        back: 'De los tres resistores internos de 5 kΩ conectados en serie que forman un divisor de voltaje de precisión a 1/3 Vcc y 2/3 Vcc.'
                    },
                    {
                        id: 'ee-m3-l11-fc2',
                        front: '¿Cuál es la función del Pin 2 (Trigger / Disparo) del 555?',
                        back: 'Detectar cuándo el voltaje cae por debajo de 1/3 Vcc para encender la salida (Pin 3 a nivel ALTO).'
                    },
                    {
                        id: 'ee-m3-l11-fc3',
                        front: '¿Cuál es la función del Pin 6 (Threshold / Umbral) del 555?',
                        back: 'Detectar cuándo el voltaje supera los 2/3 Vcc para apagar la salida (Pin 3 a nivel BAJO).'
                    },
                    {
                        id: 'ee-m3-l11-fc4',
                        front: '¿Qué función cumple el Pin 7 (Discharge / Descarga)?',
                        back: 'Es la conexión a colector de un transistor interno NPN que se activa para derivar a tierra y descargar el capacitor externo.'
                    },
                    {
                        id: 'ee-m3-l11-fc5',
                        front: '¿A qué voltaje debe conectarse el Pin 4 (Reset) para operación normal?',
                        back: 'Directamente a V_CC (positivo) para evitar reinicios involuntarios por ruido electromagnético.'
                    },
                    {
                        id: 'ee-m3-l11-fc6',
                        front: '¿Qué diferencia hay entre el modo Astable y el Monoestable?',
                        back: 'El modo Astable oscila continuamente generando un tren de pulsos; el Monoestable genera un único pulso temporizado tras recibir un disparo externo.'
                    },
                    {
                        id: 'ee-m3-l11-fc7',
                        front: '¿Cuál es la fórmula para calcular la frecuencia de oscilación en modo Astable?',
                        back: 'f = 1.44 / [ (R_A + 2·R_B) · C ] en Hertz (Hz).'
                    },
                    {
                        id: 'ee-m3-l11-fc8',
                        front: '¿Cuál es la fórmula del tiempo de temporización en modo Monoestable?',
                        back: 'T = 1.1 · R · C en segundos.'
                    },
                    {
                        id: 'ee-m3-l11-fc9',
                        front: '¿Cuánta corriente máxima puede suministrar o absorber la salida (Pin 3) del NE555?',
                        back: 'Hasta 200 mA, suficiente para manejar LEDs, transistores, relevadores pequeños y zumbadores sin amplificador.'
                    },
                    {
                        id: 'ee-m3-l11-fc10',
                        front: '¿Por qué se coloca un capacitor de 10 nF (0.01 µF) en el Pin 5 (Control Voltage)?',
                        back: 'Para desacoplar y filtrar cualquier ruido de alta frecuencia en el divisor resistivo interno, estabilizando el umbral de 2/3 Vcc.'
                    }
                ]
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m3-l11-quiz',
                title: 'Evaluación: Temporizador CI NE555',
                questions: [
                    {
                        id: 'ee-m3-l11-q1',
                        objective: 'Identificar componentes internos clave del 555',
                        concept: 'estructura_interna_555',
                        difficulty: 'easy',
                        q: '¿Qué elementos conforman la referencia de voltaje interna que da nombre al temporizador NE555?',
                        options: [
                            'Tres resistores de 5 kΩ en serie que establecen los umbrales de 1/3 Vcc y 2/3 Vcc',
                            'Cinco transistores y cinco bobinas de 5 mH',
                            'Un oscilador de cristal de cuarzo de 555 kHz',
                            'Un regulador Zener de 5.55 Voltios'
                        ],
                        correct: 0,
                        feedback: '¡Exacto! El nombre 555 proviene del divisor de tres resistores idénticos de 5 kΩ que fijan los puntos de conmutación de los comparadores analógicos.'
                    },
                    {
                        id: 'ee-m3-l11-q2',
                        objective: 'Reconocer pines de control y umbrales',
                        concept: 'pines_555',
                        difficulty: 'medium',
                        q: 'En el NE555, ¿qué condición eléctrica hace que la salida (Pin 3) pase a nivel ALTO?',
                        options: [
                            'Que el voltaje en el Pin 2 (Trigger) caiga por debajo de 1/3 Vcc',
                            'Que el Pin 6 (Threshold) supere 2/3 Vcc',
                            'Que el Pin 4 (Reset) se conecte a GND',
                            'Que el Pin 7 se desconecte'
                        ],
                        correct: 0,
                        feedback: '¡Correcto! Cuando la tensión en el Pin 2 (Trigger) desciende por debajo de 1/3 Vcc, el comparador inferior activa el Flip-Flop y eleva la salida a nivel ALTO.'
                    },
                    {
                        id: 'ee-m3-l11-q3',
                        objective: 'Comprender la configuración astable',
                        concept: 'modo_astable',
                        difficulty: 'medium',
                        q: 'En la configuración Astable estándar del 555, ¿cuáles pines deben unirse eléctricamente entre sí?',
                        options: [
                            'Pin 2 (Trigger) con Pin 6 (Threshold)',
                            'Pin 1 (GND) con Pin 8 (Vcc)',
                            'Pin 3 (Output) con Pin 7 (Discharge)',
                            'Pin 4 (Reset) con Pin 5 (Control)'
                        ],
                        correct: 0,
                        feedback: '¡Excelente! Al puentear los pines 2 y 6, ambos monitorean simultáneamente el voltaje del mismo capacitor para conmutar continuamente entre 1/3 Vcc y 2/3 Vcc.'
                    },
                    {
                        id: 'ee-m3-l11-q4',
                        objective: 'Calcular tiempo monoestable',
                        concept: 'calculo_monoestable',
                        difficulty: 'medium',
                        q: 'Si armas un temporizador monoestable con R = 100 kΩ y C = 100 µF, ¿cuánto tiempo durará el pulso de salida tras presionar el pulsador de disparo?',
                        options: [
                            '11 segundos',
                            '1.1 segundos',
                            '110 segundos',
                            '0.11 segundos'
                        ],
                        correct: 0,
                        feedback: '¡Correcto! T = 1.1 · R · C = 1.1 · (100,000 Ω) · (0.000100 F) = 11 segundos.'
                    },
                    {
                        id: 'ee-m3-l11-q5',
                        objective: 'Calcular frecuencia astable',
                        concept: 'calculo_frecuencia_astable',
                        difficulty: 'hard',
                        q: 'En un 555 Astable con R_A = 10 kΩ, R_B = 10 kΩ y C = 4.7 µF, ¿cuál es la frecuencia aproximada de oscilación?',
                        options: [
                            '10.2 Hz',
                            '1.44 Hz',
                            '102 Hz',
                            '0.47 Hz'
                        ],
                        correct: 0,
                        feedback: '¡Muy bien! f = 1.44 / [ (R_A + 2·R_B) · C ] = 1.44 / [ (10k + 20k) · 4.7µF ] = 1.44 / [ 30,000 · 0.0000047 ] = 1.44 / 0.141 = 10.21 Hz.'
                    },
                    {
                        id: 'ee-m3-l11-q6',
                        objective: 'Comprender el ciclo de trabajo',
                        concept: 'duty_cycle',
                        difficulty: 'medium',
                        q: '¿Por qué en la configuración Astable clásica del 555 el ciclo de trabajo (Duty Cycle) es siempre estrictamente mayor al 50%?',
                        options: [
                            'Porque el capacitor se carga a través de (R_A + R_B) pero solo se descarga a través de R_B, tardando más en cargarse que en descargarse',
                            'Porque el voltaje de alimentación es constante',
                            'Porque el Pin 3 consume más energía que el Pin 7',
                            'Porque los comparadores internos tienen diferente ganancia'
                        ],
                        correct: 0,
                        feedback: '¡Exacto! Como el tiempo en alto t1 = 0.693(RA+RB)C involucra a ambas resistencias y el tiempo en bajo t2 = 0.693(RB)C solo a una, t1 siempre es mayor que t2.'
                    },
                    {
                        id: 'ee-m3-l11-q7',
                        objective: 'Manejo del pin Reset',
                        concept: 'pin_reset',
                        difficulty: 'easy',
                        q: 'Si dejas el Pin 4 (Reset) desconectado al aire en una protoboard, ¿qué problema puede ocurrir?',
                        options: [
                            'El circuito puede resetearse aleatoriamente debido al ruido electromagnético ambiental',
                            'El circuito integrado explotará por sobrevoltaje',
                            'La salida duplicará su frecuencia',
                            'El capacitor se descargará instantáneamente'
                        ],
                        correct: 0,
                        feedback: '¡Correcto! Las entradas digitales o de control dejadas flotando actúan como antenas receptoras de ruido. Siempre debe conectarse a V_CC si no se utiliza.'
                    },
                    {
                        id: 'ee-m3-l11-q8',
                        objective: 'Capacidad de corriente de salida',
                        concept: 'corriente_salida_555',
                        difficulty: 'medium',
                        q: 'La etapa de salida del NE555 estándar (Pin 3) puede manejar directamente una corriente de hasta:',
                        options: [
                            '200 mA (suficiente para LEDs, buzzers y relés pequeños)',
                            '5 Amperios',
                            '20 µA únicamente',
                            '10 Amperios con disipador'
                        ],
                        correct: 0,
                        feedback: '¡Excelente! Con 200 mA de capacidad de corriente de salida (en modo sourcing o sinking), el 555 es mucho más robusto que las compuertas lógicas estándar.'
                    },
                    {
                        id: 'ee-m3-l11-q9',
                        objective: 'Rol del pin 5 de control',
                        concept: 'pin_control_5',
                        difficulty: 'medium',
                        q: '¿Qué función cumple colocar un capacitor de 10 nF entre el Pin 5 y tierra (GND)?',
                        options: [
                            'Inmunizar al circuito contra ruido eléctrico estabilizando el voltaje de referencia interno',
                            'Aumentar el volumen del buzzer de salida',
                            'Descargar el pin 7',
                            'Duplicar el voltaje de alimentación'
                        ],
                        correct: 0,
                        feedback: '¡Correcto! El capacitor de desacoplo en el pin 5 filtra ruidos de alta frecuencia y rizado de la fuente evitando falsas conmutaciones del comparador de umbral.'
                    },
                    {
                        id: 'ee-m3-l11-q10',
                        objective: 'Aplicación del 555 como base de tiempo',
                        concept: 'aplicacion_reloj',
                        difficulty: 'easy',
                        q: 'Al construir un reloj digital con contadores binarios, ¿cuál es el rol principal del NE555 en modo astable?',
                        options: [
                            'Actuar como generador de reloj maestro (Clock), enviando pulsos rítmicos periódicos para avanzar la cuenta',
                            'Convertir números binarios a decimales',
                            'Almacenar los datos de la memoria',
                            'Encender los segmentos del display'
                        ],
                        correct: 0,
                        feedback: '¡Excelente! El NE555 en modo astable es el corazón del sistema cronométrico, suministrando la señal de reloj periódica (ej. 1 Hz) que sincroniza los contadores secuenciales.'
                    }
                ],
                quizConfig: { timePerQuestion: 30, requiredScorePercent: 80 }
            })
        ]
    }
});
