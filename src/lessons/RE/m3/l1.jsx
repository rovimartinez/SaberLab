import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Servomotores SG90 y MG995: Control Angular y PWM de Precisión',
    content: `
        <div class="lesson-intro">
            <p>A diferencia de los motores DC convencionales que giran indefinidamente a alta velocidad, un <strong>servomotor</strong> está diseñado para girar y mantener una <strong>posición angular exacta</strong> (típicamente entre 0° y 180°). En esta lección aprenderás su arquitectura interna, el protocolo de modulación por ancho de pulsos (PWM), la librería oficial <code>&lt;Servo.h&gt;</code> de Arduino y técnicas de barrido suave sin sobrecalentamiento ni tirones mecánicos.</p>
        </div>

        <!-- 1. ANATOMÍA Y PRINCIPIO DE FUNCIONAMIENTO -->
        <div class="theory-section">
            <h3 id="re-m3-1-1">1. Anatomía y Lazo Cerrado de un Servomotor</h3>
            <p>Un servomotor es un <strong>sistema electromecánico de lazo cerrado (servomecanismo)</strong> compuesto internamente por 4 elementos esenciales:</p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
                <!-- Elemento 1 -->
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 14px; padding: 1.15rem;">
                    <div style="font-size: 1.5rem; margin-bottom: 0.35rem;">⚡</div>
                    <h4 style="color: #38bdf8; margin: 0 0 0.35rem; font-size: 1rem;">1. Micro-Motor DC</h4>
                    <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.5; margin: 0;">
                        Proporciona la potencia motriz a alta velocidad de giro.
                    </p>
                </div>

                <!-- Elemento 2 -->
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 14px; padding: 1.15rem;">
                    <div style="font-size: 1.5rem; margin-bottom: 0.35rem;">⚙️</div>
                    <h4 style="color: #fbbf24; margin: 0 0 0.35rem; font-size: 1rem;">2. Caja Reductora</h4>
                    <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.5; margin: 0;">
                        Tren de engranajes (plásticos en SG90 o metálicos en MG995) que reduce la velocidad y multiplica drásticamente el torque (fuerza de torsión).
                    </p>
                </div>

                <!-- Elemento 3 -->
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 14px; padding: 1.15rem;">
                    <div style="font-size: 1.5rem; margin-bottom: 0.35rem;">🎛️</div>
                    <h4 style="color: #34d399; margin: 0 0 0.35rem; font-size: 1rem;">3. Potenciómetro</h4>
                    <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.5; margin: 0;">
                        Sensor de posición angular acoplado al eje de salida. Mide continuamente el ángulo real del brazo en voltios.
                    </p>
                </div>

                <!-- Elemento 4 -->
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 14px; padding: 1.15rem;">
                    <div style="font-size: 1.5rem; margin-bottom: 0.35rem;">🧠</div>
                    <h4 style="color: #c084fc; margin: 0 0 0.35rem; font-size: 1rem;">4. Circuito de Control</h4>
                    <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.5; margin: 0;">
                        Compara la señal enviada por Arduino con el voltaje del potenciómetro interno y corrige el giro hasta que el error sea cero.
                    </p>
                </div>
            </div>

            <!-- PLACEHOLDER IMAGEN 1: Anatomía interna del Servomotor -->
            <div style="background: rgba(15, 23, 42, 0.7); border: 1.5px dashed rgba(56, 189, 248, 0.35); border-radius: 16px; padding: 1.5rem; margin: 1.5rem 0; text-align: center;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; background: rgba(56, 189, 248, 0.12); color: #38bdf8; margin-bottom: 0.5rem;">
                    ⚙️
                </div>
                <h4 style="color: #38bdf8; margin: 0.25rem 0 0.4rem; font-size: 1.05rem;">Diagrama: Estructura Interna y Lazo Cerrado del Servomotor</h4>
                <p style="color: #94a3b8; font-size: 0.85rem; margin: 0; line-height: 1.5;">
                    [Espacio reservado para Ilustración Técnica: Motor DC + Engranajes Reductores + Potenciómetro de Feedback + Placa Controladora]
                </p>
            </div>
        </div>

        <!-- 2. PROTOCOLO PWM Y ANCHO DE PULSO -->
        <div class="theory-section">
            <h3 id="re-m3-1-2">2. Señal de Control: El Estándar PWM de 50 Hz (20 ms)</h3>
            <p>Los servomotores no se controlan variando el voltaje de alimentación (que se mantiene constante a 5V o 6V), sino mediante una señal de pulsos repetitiva a una frecuencia estándar de <strong>50 Hz</strong> (período total $T = 20\,\text{ms}$).</p>

            <div style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0;">
                <h4 style="color: #38bdf8; margin-top: 0; margin-bottom: 0.5rem;">Relación Fundamental: Ancho de Pulso en Nivel Alto (Ton) vs Ángulo</h4>
                <ul style="color: #cbd5e1; font-size: 0.92rem; line-height: 1.8; margin: 0; padding-left: 1.25rem;">
                    <li><strong>Pulso de 1.0 ms (1000 µs):</strong> El servomotor gira y se posiciona en el extremo izquierdo: <strong style="color: #38bdf8;">0°</strong>.</li>
                    <li><strong>Pulso de 1.5 ms (1500 µs):</strong> El servomotor se posiciona en el centro geométrico: <strong style="color: #34d399;">90°</strong>.</li>
                    <li><strong>Pulso de 2.0 ms (2000 µs):</strong> El servomotor gira hacia el extremo derecho: <strong style="color: #f59e0b;">180°</strong>.</li>
                </ul>
            </div>

            <!-- Tabla Resumen de Tiempos PWM -->
            <div style="background: rgba(15, 23, 42, 0.7); padding: 1.25rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); margin: 1.25rem 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; color: #cbd5e1;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #38bdf8; text-align: left;">
                            <th style="padding: 0.6rem;">Ángulo Deseado</th>
                            <th style="padding: 0.6rem;">Ancho del Pulso ($T_{on}$)</th>
                            <th style="padding: 0.6rem;">Período Total</th>
                            <th style="padding: 0.6rem;">Frecuencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 0.6rem; font-weight: bold; color: #38bdf8;">0° (Mínimo)</td>
                            <td style="padding: 0.6rem; font-family: monospace; color: #38bdf8;">1.0 ms (1000 µs)</td>
                            <td style="padding: 0.6rem;">20 ms</td>
                            <td style="padding: 0.6rem;">50 Hz</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 0.6rem; font-weight: bold; color: #34d399;">90° (Centro)</td>
                            <td style="padding: 0.6rem; font-family: monospace; color: #34d399;">1.5 ms (1500 µs)</td>
                            <td style="padding: 0.6rem;">20 ms</td>
                            <td style="padding: 0.6rem;">50 Hz</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.6rem; font-weight: bold; color: #fbbf24;">180° (Máximo)</td>
                            <td style="padding: 0.6rem; font-family: monospace; color: #fbbf24;">2.0 ms (2000 µs)</td>
                            <td style="padding: 0.6rem;">20 ms</td>
                            <td style="padding: 0.6rem;">50 Hz</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- PLACEHOLDER IMAGEN 2: Ondas PWM de 1ms, 1.5ms y 2ms -->
            <div style="background: rgba(15, 23, 42, 0.7); border: 1.5px dashed rgba(16, 185, 129, 0.35); border-radius: 16px; padding: 1.5rem; margin: 1.5rem 0; text-align: center;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; background: rgba(16, 185, 129, 0.12); color: #34d399; margin-bottom: 0.5rem;">
                    📈
                </div>
                <h4 style="color: #34d399; margin: 0.25rem 0 0.4rem; font-size: 1.05rem;">Diagrama: Cronograma y Anchos de Pulso PWM (1.0ms, 1.5ms y 2.0ms)</h4>
                <p style="color: #94a3b8; font-size: 0.85rem; margin: 0; line-height: 1.5;">
                    [Espacio reservado para Gráfica de Ondas Cuadradas PWM a 50Hz comparando los 3 ángulos principales]
                </p>
            </div>
        </div>

        <!-- 3. COMPARATIVA HARDWARE: SG90 VS MG995 -->
        <div class="theory-section">
            <h3 id="re-m3-1-3">3. Comparativa de Modelos Populares: Micro Servo SG90 vs Servo de Alto Torque MG995</h3>
            <p>En proyectos de robótica estudiantil e industrial encontrarás principalmente dos familias de servomotores:</p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin: 1.5rem 0;">
                <!-- SG90 Card -->
                <div style="background: rgba(15, 23, 42, 0.75); border: 1.5px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 1.25rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h4 style="color: #38bdf8; margin: 0; font-size: 1.1rem;">Micro Servo SG90 (9g)</h4>
                        <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold;">Plástico / Prototipos</span>
                    </div>
                    <ul style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.7; margin: 0; padding-left: 1.2rem;">
                        <li><strong>Peso:</strong> 9 gramos (ultraligero).</li>
                        <li><strong>Torque:</strong> 1.8 kg·cm (a 4.8V).</li>
                        <li><strong>Engranajes:</strong> Nylon/Plástico (delicados ante atascos).</li>
                        <li><strong>Consumo:</strong> ~100 mA en movimiento, pico de 500 mA en bloqueo.</li>
                        <li><strong>Usos:</strong> Pinzas ligeras, giro de sensores ultrasónicos, maquetas.</li>
                    </ul>
                </div>

                <!-- MG995 Card -->
                <div style="background: rgba(15, 23, 42, 0.75); border: 1.5px solid rgba(245, 158, 11, 0.3); border-radius: 16px; padding: 1.25rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h4 style="color: #fbbf24; margin: 0; font-size: 1.1rem;">Servo Estándar MG995 / MG996R</h4>
                        <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold;">Metálico / Potencia</span>
                    </div>
                    <ul style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.7; margin: 0; padding-left: 1.2rem;">
                        <li><strong>Peso:</strong> 55 gramos (robusto).</li>
                        <li><strong>Torque:</strong> 10.0 a 13.0 kg·cm (a 6.0V).</li>
                        <li><strong>Engranajes:</strong> Metálicos de alta resistencia.</li>
                        <li><strong>Consumo:</strong> ~500 mA en movimiento, pico de hasta 2.5 A en bloqueo.</li>
                        <li><strong>Usos:</strong> Brazos robóticos articulados, dirección de robots bípedos o cuadrúpedos.</li>
                    </ul>
                </div>
            </div>

            <!-- Código de Colores de los 3 Cables -->
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1.25rem; margin: 1.25rem 0;">
                <h4 style="color: #f8fafc; margin-top: 0; margin-bottom: 0.75rem;">Código de Colores de los 3 Cables:</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.86rem; color: #cbd5e1;">
                    <tbody>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 0.5rem; font-weight: bold; color: #f59e0b;">Naranja o Amarillo</td>
                            <td style="padding: 0.5rem; font-weight: bold; color: #38bdf8;">SEÑAL (PWM)</td>
                            <td style="padding: 0.5rem;">Se conecta a cualquier pin digital con o sin PWM en Arduino (ej. Pin D9).</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 0.5rem; font-weight: bold; color: #ef4444;">Rojo</td>
                            <td style="padding: 0.5rem; font-weight: bold; color: #ef4444;">VCC (+5V / +6V)</td>
                            <td style="padding: 0.5rem;">Alimentación positiva (se recomienda fuente externa para evitar reinicios de Arduino).</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.5rem; font-weight: bold; color: #94a3b8;">Marrón o Negro</td>
                            <td style="padding: 0.5rem; font-weight: bold; color: #64748b;">GND (Tierra)</td>
                            <td style="padding: 0.5rem;">Referencia 0V común (¡Siempre unir con el GND de Arduino!).</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- PLACEHOLDER IMAGEN 3: Conexión Servomotor a Arduino con Fuente Externa -->
            <div style="background: rgba(15, 23, 42, 0.7); border: 1.5px dashed rgba(245, 158, 11, 0.35); border-radius: 16px; padding: 1.5rem; margin: 1.5rem 0; text-align: center;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; background: rgba(245, 158, 11, 0.12); color: #fbbf24; margin-bottom: 0.5rem;">
                    🔌
                </div>
                <h4 style="color: #fbbf24; margin: 0.25rem 0 0.4rem; font-size: 1.05rem;">Diagrama: Conexión Servomotor SG90 con Arduino Uno y Alimentación Externa</h4>
                <p style="color: #94a3b8; font-size: 0.85rem; margin: 0; line-height: 1.5;">
                    [Espacio reservado para Esquema Breadboard Fritzing mostrando la conexión de Señal D9 y GND compartido]
                </p>
            </div>
        </div>

        <!-- 4. PROGRAMACIÓN EN ARDUINO C++: LIBRERÍA SERVO.H -->
        <div class="theory-section">
            <h3 id="re-m3-1-4">4. Programación en C++ con la Librería &lt;Servo.h&gt;</h3>
            <p>Arduino incluye de forma nativa la librería <code>&lt;Servo.h&gt;</code>, la cual utiliza temporizadores por interrupciones de hardware para generar los pulsos exactos de 50 Hz sin bloquear la CPU.</p>

            <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1.25rem; margin-bottom: 1.5rem;">
                <h4 style="color: #38bdf8; margin-top: 0; margin-bottom: 0.75rem;">Métodos Principales del Objeto Servo:</h4>
                <ul style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.7; margin: 0; padding-left: 1.25rem;">
                    <li><code>miServo.attach(pin);</code> Vincula el servomotor al pin digital especificado.</li>
                    <li><code>miServo.write(grados);</code> Envía el ángulo deseado en grados enteros (de 0 a 180).</li>
                    <li><code>miServo.read();</code> Devuelve la última posición angular escrita en el servomotor.</li>
                    <li><code>miServo.writeMicroseconds(us);</code> Control de precisión enviando directamente el ancho de pulso en microsegundos (ej. 1500 para 90°).</li>
                    <li><code>miServo.detach();</code> Desvincula el servo y detiene el tren de pulsos (ahorro de energía).</li>
                </ul>
            </div>

            <!-- Código Maestro: Barrido Suave con Bucle FOR -->
            <pre style="background: rgba(15, 23, 42, 0.85); padding: 1.25rem; border-radius: 16px; border: 1px solid rgba(56, 189, 248, 0.25); overflow-x: auto;"><code style="color: #e2e8f0;">// Código Maestro: Barrido Suave de Servomotor (0° a 180° y retorno)
#include &lt;Servo.h&gt;

Servo miServo; // Instanciamos el objeto Servo
const int SERVO_PIN = 9;

void setup() {
  miServo.attach(SERVO_PIN); // Conectamos el pin de señal
  miServo.write(0);          // Posición inicial en 0 grados
  delay(1000);               // Esperamos 1 segundo a que alcance la posición
}

void loop() {
  // 1. Barrido progresivo de 0 a 180 grados
  for (int angulo = 0; angulo &lt;= 180; angulo += 1) {
    miServo.write(angulo);
    delay(15); // Pequeña pausa para movimiento fluido y sin tirones
  }

  delay(500); // Pausa en el extremo de 180°

  // 2. Retorno progresivo de 180 a 0 grados
  for (int angulo = 180; angulo &gt;= 0; angulo -= 1) {
    miServo.write(angulo);
    delay(15);
  }

  delay(500); // Pausa en el extremo de 0°
}</code></pre>
        </div>

        <!-- 5. REGLAS DE ORO Y PREVENCIÓN DE DAÑOS -->
        <div class="theory-section">
            <h3 id="re-m3-1-5">5. Reglas de Oro en el Uso de Servomotores</h3>
            <div style="background: rgba(239, 68, 68, 0.08); border-left: 4px solid #ef4444; border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0;">
                <h4 style="color: #f87171; margin-top: 0; margin-bottom: 0.5rem;">⚠️ Precauciones Críticas de Laboratorio:</h4>
                <ul style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.7; margin: 0; padding-left: 1.25rem;">
                    <li><strong>Nunca fuerces el brazo con la mano mientras esté energizado:</strong> Puedes romper los piñones de plástico internos o desgastar la pista del potenciómetro.</li>
                    <li><strong>Evita alimentar más de 1 servo directamente desde el pin 5V de Arduino:</strong> Los servomotores generan picos de corriente que provocan caídas de tensión (brownout) y reinician el microcontrolador. Utiliza una fuente de 5V externa conectando todos los GNDs juntos.</li>
                    <li><strong>No intentes superar los límites de 0° o 180°:</strong> Forzar valores como <code>write(220)</code> mantiene el motor forzando contra el tope mecánico, provocando sobrecalentamiento y quemando la placa integrada.</li>
                </ul>
            </div>
        </div>
    `,
    sections: [
        { id: 're-m3-1-1', title: '1. Anatomía y Lazo Cerrado del Servomotor' },
        { id: 're-m3-1-2', title: '2. Señal de Control: Estándar PWM de 50 Hz' },
        { id: 're-m3-1-3', title: '3. Comparativa Hardware: SG90 vs MG995' },
        { id: 're-m3-1-4', title: '4. Programación en C++ con <Servo.h>' },
        { id: 're-m3-1-5', title: '5. Reglas de Oro y Prevención de Daños' }
    ],
    flashcards: [
        {
            id: 'f1',
            type: 'theory',
            q: '¿Qué tipo de sistema de control electromecánico es un servomotor?',
            a: 'Sistema de Lazo Cerrado (Servomecanismo)',
            sub: 'Usa un potenciómetro interno como sensor de feedback para comparar y corregir la posición real.',
            sectionId: 're-m3-1-1'
        },
        {
            id: 'f2',
            type: 'hw',
            q: '¿Cuáles son las 4 partes internas fundamentales de un servomotor estándar?',
            a: 'Motor DC, Caja reductora de engranajes, Potenciómetro y Circuito de control',
            sub: 'La caja reductora reduce la velocidad y multiplica el torque para mover cargas con precisión.',
            sectionId: 're-m3-1-1'
        },
        {
            id: 'f3',
            type: 'theory',
            q: '¿A qué frecuencia y período opera la señal PWM de control de un servo?',
            a: 'Frecuencia de 50 Hz (Período total de 20 ms)',
            sub: 'Se envía un pulso cada 20 milisegundos para refrescar la posición del rotor.',
            sectionId: 're-m3-1-2'
        },
        {
            id: 'f4',
            type: 'theory',
            q: '¿Qué ancho de pulso en nivel alto (Ton) corresponde a la posición de 90° (centro)?',
            a: 'Un pulso de 1.5 ms (1500 microsegundos)',
            sub: '0° corresponde a 1.0 ms, 90° a 1.5 ms y 180° a 2.0 ms aproximadamente.',
            sectionId: 're-m3-1-2'
        },
        {
            id: 'f5',
            type: 'hw',
            q: '¿Qué diferencia principal existe entre los engranajes del SG90 y del MG995?',
            a: 'El SG90 usa engranajes de nylon (plástico) y el MG995 engranajes metálicos',
            sub: 'Los metálicos soportan mucho mayor torque (hasta 13 kg·cm) y resisten golpes mecánicos.',
            sectionId: 're-m3-1-3'
        },
        {
            id: 'f6',
            type: 'hw',
            q: '¿Cuál es la función del cable marrón/negro, rojo y naranja/amarillo en un servo?',
            a: 'Marrón/Negro = GND · Rojo = VCC (+5V) · Naranja/Amarillo = Señal PWM',
            sub: 'El cable de señal transporta el tren de pulsos codificados desde el microcontrolador.',
            sectionId: 're-m3-1-3'
        },
        {
            id: 'f7',
            type: 'code',
            q: '¿Qué instrucción de la librería <Servo.h> se utiliza para enviar una posición angular?',
            a: 'miServo.write(angulo);',
            sub: 'Recibe un valor entero entre 0 y 180 grados.',
            sectionId: 're-m3-1-4'
        },
        {
            id: 'f8',
            type: 'code',
            q: '¿Por qué se usa un bucle for con pequeños retardos (delay) para mover un servomotor?',
            a: 'Para lograr un barrido suave y evitar sacudidas mecánicas bruscas',
            sub: 'Un salto instantáneo de 0° a 180° genera un alto pico de corriente y desgaste de piñones.',
            sectionId: 're-m3-1-4'
        },
        {
            id: 'f9',
            type: 'hw',
            q: '¿Por qué se recomienda alimentar servomotores con una fuente de poder externa independiente?',
            a: 'Para evitar caídas de tensión (brownouts) que reinicien el Arduino',
            sub: 'Los servomotores pueden consumir más de 1A en picos de arranque o atascos.',
            sectionId: 're-m3-1-5'
        },
        {
            id: 'f10',
            type: 'theory',
            q: '¿Qué sucede si envías una instrucción write(220) a un servomotor estándar de 180°?',
            a: 'Choca contra el tope mecánico y sobrecalienta el circuito',
            sub: 'Nunca debes sobrepasar el rango físico de rotación del servomotor.',
            sectionId: 're-m3-1-5'
        }
    ],
    questions: [
        {
            id: 'q1',
            question: '¿Cuál es la función del potenciómetro interno en un servomotor?',
            options: [
                'Medir la posición angular real del eje para cerrar el lazo de control',
                'Regular la velocidad máxima del motor DC',
                'Aumentar la resistencia eléctrica para proteger el microcontrolador',
                'Transformar la corriente directa en corriente alterna'
            ],
            correct: 0,
            explanation: 'El potenciómetro mide el ángulo físico en tiempo real; la placa interna compara este valor con la señal PWM recibida y corrige el motor hasta alcanzar la posición exacta.'
        },
        {
            id: 'q2',
            question: '¿Qué período total y frecuencia tiene la señal de control PWM estándar para servomotores?',
            options: [
                'Período de 20 ms y frecuencia de 50 Hz',
                'Período de 1 ms y frecuencia de 1000 Hz',
                'Período de 50 ms y frecuencia de 20 Hz',
                'Período de 2 ms y frecuencia de 500 Hz'
            ],
            correct: 0,
            explanation: 'El estándar universal de servomotores RC establece un ciclo repetitivo cada 20 ms (50 Hz).'
        },
        {
            id: 'q3',
            question: 'Si un pulso en nivel alto dura 1.5 milisegundos (1500 µs), ¿en qué posición angular se situará el servomotor?',
            options: [
                'En el centro: 90°',
                'En el extremo mínimo: 0°',
                'En el extremo máximo: 180°',
                'En giro continuo indefinido'
            ],
            correct: 0,
            explanation: 'Un pulso de 1.0 ms sitúa el servo en 0°, 1.5 ms en 90° (posición neutra central) y 2.0 ms en 180°.'
        },
        {
            id: 'q4',
            question: '¿Cuál de los siguientes servomotores cuenta con engranajes metálicos y alto torque (hasta 13 kg·cm)?',
            options: [
                'MG995 / MG996R',
                'SG90',
                '2N2222',
                'L298N'
            ],
            correct: 0,
            explanation: 'El MG995/MG996R es un servomotor de alto torque con tren de engranajes metálicos, ideal para brazos robóticos y articulaciones de fuerza.'
        },
        {
            id: 'q5',
            question: 'Al conectar un servomotor, ¿a qué terminal corresponde el cable de color Rojo?',
            options: [
                'Alimentación positiva (+5V / +6V)',
                'Tierra común (GND)',
                'Señal de control digital PWM',
                'Salida analógica de retroalimentación'
            ],
            correct: 0,
            explanation: 'El código estándar es: Rojo para VCC (+5V/+6V), Marrón/Negro para GND y Naranja/Amarillo para Señal PWM.'
        },
        {
            id: 'q6',
            question: '¿Qué método de la librería <Servo.h> se utiliza para asociar el servomotor al pin físico de Arduino en setup()?',
            options: [
                'miServo.attach(pin);',
                'miServo.connect(pin);',
                'miServo.pinMode(pin, OUTPUT);',
                'miServo.bind(pin);'
            ],
            correct: 0,
            explanation: '`attach(pin)` es el método oficial de la librería Servo para vincular el temporizador de hardware al pin seleccionado.'
        },
        {
            id: 'q7',
            question: '¿Por qué no se debe alimentar un servomotor de gran potencia directamente del pin 5V de Arduino?',
            options: [
                'Porque los picos de corriente del servo pueden causar caídas de tensión (brownout) y reiniciar el Arduino',
                'Porque el voltaje de Arduino es demasiado elevado y quema el servo',
                'Porque la librería Servo.h bloquea la salida de 5V',
                'Porque el servomotor solo funciona con corriente alterna (AC)'
            ],
            correct: 0,
            explanation: 'Los motores generan picos de corriente inductiva que el regulador integrado de Arduino no puede suministrar de forma estable, reiniciando la placa.'
        },
        {
            id: 'q8',
            question: '¿Cuál es la forma correcta de mover un servo de 0° a 180° con un movimiento suave y controlado?',
            options: [
                'Usando un bucle for que incremente el ángulo grado a grado con un pequeño delay entre pasos',
                'Escribiendo `miServo.write(180);` sin ningún retardo',
                'Apagando y encendiendo el pin VCC con digitalWrite()',
                'Cambiando el valor analógico con analogWrite(9, 255)'
            ],
            correct: 0,
            explanation: 'Incrementar el ángulo paso a paso en un bucle `for` con una pausa de 10-20 ms permite una aceleración suave sin sacudidas mecánicas.'
        },
        {
            id: 'q9',
            question: '¿Qué condición eléctrica es OBLIGATORIA al usar una fuente externa para alimentar un servomotor?',
            options: [
                'Unir la tierra (GND) de la fuente externa con la tierra (GND) de Arduino',
                'Unir el polo positivo (+5V) de la fuente externa con el pin 5V de Arduino',
                'Colocar una resistencia de 10k en serie con el cable de alimentación',
                'Conectar el cable de señal a un pin analógico A0'
            ],
            correct: 0,
            explanation: 'Todas las fuentes de un circuito deben compartir una referencia de 0V común (GND común) para que la señal lógica de control sea interpretada correctamente.'
        },
        {
            id: 'q10',
            question: '¿Qué método de la librería Servo permite controlar el posicionamiento con máxima resolución enviando microsegundos exactos?',
            options: [
                'miServo.writeMicroseconds(us);',
                'miServo.setPulse(us);',
                'miServo.analogWrite(us);',
                'miServo.pwm(us);'
            ],
            correct: 0,
            explanation: '`writeMicroseconds(us)` permite un control de altísima precisión enviando directamente el ancho de pulso en microsegundos (ej. 1000 a 2000 µs).'
        }
    ]
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 're-m3-l1-content',
                content: lessonDefinition.content
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 're-m3-l1-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        prueba: [
            createQuizBlock({
                id: 're-m3-l1-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions
            })
        ]
    }
});
