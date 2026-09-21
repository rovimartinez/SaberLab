import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Sensor Ultrasónico (HC-SR04): Medición de Distancia y Ecolocalización',
    content: `
        <div class="lesson-intro">
            <p>Para que un robot autónomo evite obstáculos y mida distancias milimétricas en el espacio físico sin contacto, uno de los métodos más robustos es la <strong>ecolocalización acústica</strong>. En esta lección aprenderás los fundamentos físicos del sonido, el funcionamiento interno del <strong>Sensor Ultrasónico HC-SR04</strong>, el cronograma de disparo y la programación en Arduino C++ utilizando la función <code>pulseIn()</code>.</p>
        </div>

        <!-- 1. PRINCIPIO FÍSICO DE ECOLOCALIZACIÓN -->
        <div class="theory-section">
            <h3 id="re-m2-4-1">1. ¿Qué es la Ecolocalización y cómo viaja el Ultrasonido?</h3>
            <p>La <strong>ecolocalización</strong> es una técnica inspirada en la naturaleza (como los murciélagos y delfines) y en los radares/sonares navales: consiste en emitir un tren de ondas sonoras de alta frecuencia y medir con precisión el tiempo que tarda el <strong>eco</strong> en rebotar contra un objeto y regresar al receptor.</p>
            
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1.25rem; margin: 1.25rem 0; text-align: center;">
                <img 
                    src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj13DBW7FWuNSzzbZaEk9_45z9q0b7k73TsGyO_wawF7t7woTTK4-t9EDfhm85I95pqj2EG86rrP4mj5-RT4FAmdHFoDJ7Nxk-kYdld4ZdSFikOwtsGYDAx_LgHb3oxGNPJ8EEBTTw-pYM/s1600/ecolocacion_murcielagos.jpg" 
                    alt="Principio de Ecolocalización en la Naturaleza" 
                    style="width: 100%; max-height: 240px; object-fit: contain; border-radius: 10px; background: #0f172a;"
                />
                <div style="font-size: 0.82rem; color: #94a3b8; margin-top: 0.6rem; font-weight: 600;">
                    Principio de Ecolocalización: Emisión de sonido de alta frecuencia $\rightarrow$ Choque $\rightarrow$ Detección del Eco de retorno
                </div>
            </div>

            <div style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0;">
                <h4 style="color: #38bdf8; margin-top: 0;">Física Clave: La Velocidad del Sonido en el Aire</h4>
                <p style="color: #cbd5e1; font-size: 0.92rem; line-height: 1.6; margin: 0;">
                    El sonido viaja por el aire a una velocidad constante aproximada de <strong>$343\,\text{m/s}$</strong> (a $20\,^\circ\text{C}$).<br>
                    Si convertimos esta velocidad a centímetros y microsegundos ($\mu\text{s}$):<br>
                    $$\text{Velocidad} = 343\,\text{m/s} = 0.0343\,\text{cm}/\mu\text{s} = \frac{1}{29.15}\,\text{cm}/\mu\text{s}$$
                    Esto significa que el sonido tarda exactamente <strong>$29.15\,\mu\text{s}$</strong> en recorrer $1\,\text{cm}$.
                </p>
            </div>
        </div>

        <!-- 2. ANATOMÍA Y PINES DEL MÓDULO HC-SR04 -->
        <div class="theory-section">
            <h3 id="re-m2-4-2">2. Anatomía y Pines del Módulo HC-SR04</h3>
            <p>El sensor HC-SR04 es un módulo compacto que opera a 5V y puede medir distancias entre <strong>$2\,\text{cm}$</strong> y <strong>$400\,\text{cm}$</strong> con una precisión de hasta $3\,\text{mm}$.</p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin: 1.5rem 0;">
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1rem; text-align: center;">
                    <img 
                        src="https://cdnx.jumpseller.com/electrosenaelectronica/image/37926828/resize/610/610?1690247213" 
                        alt="Módulo Sensor Ultrasónico HC-SR04" 
                        style="width: 100%; max-height: 220px; object-fit: contain; border-radius: 10px; background: #0f172a;"
                    />
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.6rem; font-weight: 600;">
                        Módulo HC-SR04 con Emisor (T) y Receptor (R)
                    </div>
                </div>

                <div style="background: rgba(15, 23, 42, 0.7); padding: 1.25rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; justify-content: center;">
                    <h4 style="color: #38bdf8; margin-top: 0; margin-bottom: 0.75rem;">Descripción de los 4 Pines:</h4>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.86rem; color: #cbd5e1;">
                        <tbody>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 0.45rem; font-weight: bold; color: #ef4444;">VCC</td>
                                <td style="padding: 0.45rem;">Alimentación +5V DC.</td>
                            </tr>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 0.45rem; font-weight: bold; color: #38bdf8;">TRIG (Trigger)</td>
                                <td style="padding: 0.45rem;">Entrada de disparo: Recibe un pulso de $10\,\mu\text{s}$ para iniciar la ráfaga.</td>
                            </tr>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 0.45rem; font-weight: bold; color: #10b981;">ECHO (Eco)</td>
                                <td style="padding: 0.45rem;">Salida de medición: Permanece en <code>HIGH</code> el tiempo que tarda en regresar el sonido.</td>
                            </tr>
                            <tr>
                                <td style="padding: 0.45rem; font-weight: bold; color: #92400e;">GND</td>
                                <td style="padding: 0.45rem;">Tierra de referencia (0V).</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 3. TIMING DIAGRAM Y CÁLCULO MATEMÁTICO -->
        <div class="theory-section">
            <h3 id="re-m2-4-3">3. Diagrama de Tiempos (Timing) y Fórmula de Cálculo</h3>
            <p>El proceso de medición sigue un protocolo estricto de microsegundos:</p>

            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1rem; margin: 1.25rem 0; text-align: center;">
                <img 
                    src="https://ikrorwxhjiilll5q.ldycdn.com/cloud/nmBpoKliRliSrorjonlpi/hc-sr04-ultrasonic-module.jpg" 
                    alt="Diagrama de Tiempos HC-SR04 Timing Diagram" 
                    style="width: 100%; max-height: 250px; object-fit: contain; border-radius: 10px; background: #0f172a;"
                />
                <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.6rem; font-weight: 600;">
                    Secuencia: Pulso Trigger $10\,\mu\text{s}$ $\rightarrow$ Ráfaga de 8 ciclos a 40 kHz $\rightarrow$ Pulso Echo proporcional al tiempo de vuelo
                </div>
            </div>

            <!-- Deducción de la Fórmula -->
            <div style="background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981; border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0;">
                <h4 style="color: #10b981; margin-top: 0;">¿Por qué dividimos entre 2 en la fórmula?</h4>
                <p style="color: #cbd5e1; font-size: 0.92rem; line-height: 1.6; margin: 0;">
                    El tiempo registrado por el pin <code>ECHO</code> corresponde al viaje de <strong>ida</strong> (desde el sensor hasta el obstáculo) más el viaje de <strong>vuelta</strong> (desde el obstáculo hasta el receptor).<br><br>
                    Para conocer la distancia real hasta el objeto, debemos calcular solo la mitad del trayecto:<br>
                    $$\text{Distancia (cm)} = \frac{\text{Tiempo de Echo } (\mu\text{s}) \times 0.0343}{2} = \frac{\text{Tiempo de Echo } (\mu\text{s})}{58.2}$$
                </p>
            </div>
        </div>

        <!-- 4. LABORATORIO INTERACTIVO -->
        <div class="theory-section">
            <h3 id="re-m2-4-4">4. Laboratorio Interactivo: Simulador de Radar Ultrasónico HC-SR04</h3>
            <p>Interactúa con el banco de pruebas arrastrando el obstáculo en tiempo real para observar la variación de la onda acústica, la lectura de <code>pulseIn()</code> y las zonas de proximidad:</p>
            <div id="ultrasonic-sensor-simulator-container"></div>
        </div>

        <!-- 5. CONEXIÓN Y PROGRAMACIÓN EN C++ -->
        <div class="theory-section">
            <h3 id="re-m2-4-5">5. Conexión y Programación en C++ con pulseIn()</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; align-items: center; margin: 1.25rem 0;">
                <div style="text-align: center; background: #0f172a; padding: 0.75rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
                    <img 
                        src="https://roboticoss.com/wp-content/uploads/2025/07/Tutorial-Sensor-Ultrasonico-Arduino-para-Robotica-1-1024x660.webp" 
                        alt="Conexión HC-SR04 con Arduino" 
                        style="width: 100%; max-height: 240px; object-fit: contain; border-radius: 8px;"
                    />
                    <div style="font-size: 0.78rem; color: #94a3b8; margin-top: 0.4rem;">
                        Montaje de Pines: TRIG en D9 y ECHO en D10
                    </div>
                </div>

                <div>
                    <p style="color: #cbd5e1; font-size: 0.92rem; line-height: 1.6; margin-top: 0;">
                        La función clave en C++ es <code>pulseIn(pin, HIGH)</code>: mide con resolución de microsegundos el tiempo que el pin <code>ECHO</code> permanece en nivel alto esperando el rebote del sonido.
                    </p>
                </div>
            </div>

            <pre style="background: rgba(15, 23, 42, 0.75); padding: 1.25rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); overflow-x: auto;"><code style="color: #e2e8f0;">// Código Maestro: Medidor de Distancia con HC-SR04
const int TRIG_PIN = 9;  // Disparador ultrasónico
const int ECHO_PIN = 10; // Receptor de eco

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.begin(9600);
}

void loop() {
  // 1. Limpiamos el pin Trigger y enviamos pulso de 10 microsegundos
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // 2. Medimos la duración del eco en microsegundos (µs)
  long duracion = pulseIn(ECHO_PIN, HIGH);

  // 3. Calculamos la distancia en centímetros
  long distancia = (duracion * 0.0343) / 2;

  // 4. Imprimimos el resultado en el Monitor Serie
  Serial.print("Distancia al obstaculo: ");
  Serial.print(distancia);
  Serial.println(" cm");

  // 5. Lógica de evasión para un robot móvil
  if (distancia < 15 && distancia > 0) {
    Serial.println("¡OBSTÁCULO CERCANO! Girando para evadir...");
  }

  delay(100); // Pequeña pausa entre mediciones
}</code></pre>
        </div>
    `,
    sections: [
        { id: 're-m2-4-1', title: '1. ¿Qué es la Ecolocalización y el Ultrasonido?' },
        { id: 're-m2-4-2', title: '2. Anatomía y Pines del Módulo HC-SR04' },
        { id: 're-m2-4-3', title: '3. Diagrama de Tiempos y Fórmula de Cálculo' },
        { id: 're-m2-4-4', title: '4. Lab. Interactivo: Simulador de Radar HC-SR04' },
        { id: 're-m2-4-5', title: '5. Conexión y Programación en C++ con pulseIn()' }
    ],
    flashcards: [
        {
            id: 'f1',
            type: 'theory',
            q: '¿A qué frecuencia emite las ondas acústicas el sensor ultrasónico HC-SR04?',
            a: 'A una frecuencia de 40 kHz (inaudible para el oído humano)',
            sub: 'El oído humano solo percibe hasta ~20 kHz; por encima de ese umbral se considera ultrasonido.',
            sectionId: 're-m2-4-1'
        },
        {
            id: 'f2',
            type: 'theory',
            q: '¿Cuál es la velocidad del sonido en el aire a temperatura ambiente estándar?',
            a: 'Aproximadamente 343 m/s (equivalente a 0.0343 cm/µs)',
            sub: 'Significa que el sonido recorre 1 centímetro cada 29.15 microsegundos aproximadamente.',
            sectionId: 're-m2-4-1'
        },
        {
            id: 'f3',
            type: 'hw',
            q: '¿Qué significan las letras T y R serigrafiadas en los cilindros del sensor HC-SR04?',
            a: 'T = Transmitter (Emisor ultrasónico) · R = Receiver (Receptor / Micrófono de eco)',
            sub: 'El transductor T genera la onda sonora y el transductor R detecta la onda rebotada.',
            sectionId: 're-m2-4-2'
        },
        {
            id: 'f4',
            type: 'code',
            q: '¿Qué duración mínima debe tener el pulso HIGH enviado al pin TRIG para iniciar una medición?',
            a: 'Un pulso de 10 microsegundos (10 µs)',
            sub: 'Al recibirlo, el circuito interno del módulo dispara automáticamente 8 ciclos de sonido a 40 kHz.',
            sectionId: 're-m2-4-3'
        },
        {
            id: 'f5',
            type: 'code',
            q: '¿Qué mide exactamente la función pulseIn(ECHO_PIN, HIGH) en Arduino?',
            a: 'El tiempo en microsegundos (µs) que el pin ECHO permanece en nivel HIGH',
            sub: 'Ese lapso de tiempo representa el viaje total de ida y vuelta de la onda sonora.',
            sectionId: 're-m2-4-5'
        },
        {
            id: 'f6',
            type: 'theory',
            q: '¿Por qué es indispensable dividir entre 2 al calcular la distancia con el HC-SR04?',
            a: 'Porque el tiempo medido incluye el viaje de ida y el de regreso (eco)',
            sub: 'Para conocer la distancia real hasta el obstáculo solo necesitamos la distancia recorrida en un sentido.',
            sectionId: 're-m2-4-3'
        },
        {
            id: 'f7',
            type: 'hw',
            q: '¿Cuál es el rango de distancia de medición efectivo del sensor HC-SR04?',
            a: 'De 2 cm a 400 cm (hasta 4 metros)',
            sub: 'Con una resolución de precisión física de aproximadamente 3 milímetros.',
            sectionId: 're-m2-4-2'
        },
        {
            id: 'f8',
            type: 'code',
            q: '¿Cómo se configuran los pines TRIG y ECHO en la función setup() de Arduino?',
            a: 'pinMode(TRIG, OUTPUT); y pinMode(ECHO, INPUT);',
            sub: 'TRIG es una salida que envía el comando de disparo y ECHO es una entrada que recibe la señal del eco.',
            sectionId: 're-m2-4-5'
        },
        {
            id: 'f9',
            type: 'theory',
            q: 'Si un pulso de eco tarda 1164 µs en regresar, ¿a qué distancia se encuentra el objeto?',
            a: 'A 20 cm de distancia',
            sub: 'Cálculo: (1164 µs × 0.0343 cm/µs) / 2 = 19.96 cm ≈ 20 cm.',
            sectionId: 're-m2-4-3'
        },
        {
            id: 'f10',
            type: 'theory',
            q: '¿Qué tipo de superficies pueden dificultar la lectura acústica de un sensor ultrasónico?',
            a: 'Superficies muy blandas (esponjas/telas) o inclinadas a más de 45°',
            sub: 'Las telas absorben la onda sonora y las superficies muy inclinadas desvían el eco fuera del receptor.',
            sectionId: 're-m2-4-1'
        }
    ],
    questions: [
        {
            id: 1,
            question: '¿Cuál es el principio físico fundamental por el cual el sensor HC-SR04 puede medir distancias en el aire?',
            options: [
                'Ecolocalización por ondas acústicas de ultrasonido a 40 kHz.',
                'Emisión de pulsos de luz láser visible de color verde.',
                'Medición de campos magnéticos terrestres con brújula.',
                'Recepción de señales de radiofrecuencia satelital GPS.'
            ],
            correct: 0,
            explanation: 'El sensor ultrasónico HC-SR04 utiliza ecolocalización emitiendo ráfagas de ondas de sonido inaudibles a 40 kHz y calculando el tiempo que tardan en rebotar en un objeto y volver.'
        },
        {
            id: 2,
            question: '¿Cuál es la función específica del pin TRIG (Trigger) en el módulo HC-SR04?',
            options: [
                'Recibir un pulso de disparo de 10 µs enviado desde Arduino para iniciar la ráfaga de ultrasonido.',
                'Alimentar el microcontrolador Arduino con 12 Voltios.',
                'Medir la temperatura del ambiente en tiempo real.',
                'Emitir un destello de luz LED blanca de alta potencia.'
            ],
            correct: 0,
            explanation: 'El pin TRIG es la entrada de control del sensor. Cuando Arduino le envía un pulso en nivel HIGH durante al menos 10 microsegundos, el módulo dispara automáticamente la ráfaga de 8 ciclos ultrasónicos.'
        },
        {
            id: 3,
            question: 'Al programar el sensor en Arduino C++, ¿qué mide exactamente la función `pulseIn(ECHO_PIN, HIGH)`?',
            options: [
                'El tiempo en microsegundos (µs) que el pin ECHO permanece en nivel HIGH esperando el eco.',
                'El voltaje analógico de la batería en milivoltios.',
                'El número de revoluciones por minuto del motor.',
                'La cantidad de bytes libres en la memoria RAM.'
            ],
            correct: 0,
            explanation: 'La función `pulseIn(pin, HIGH)` mide con extrema precisión la duración temporal en microsegundos que el pin ECHO se mantiene en estado alto, lo cual representa el tiempo de vuelo de la onda acústica.'
        },
        {
            id: 4,
            question: 'En la fórmula `distancia = (tiempo * 0.0343) / 2;`, ¿por qué es matemáticamente obligatorio dividir entre 2?',
            options: [
                'Porque el tiempo medido corresponde al viaje completo de IDA hasta el obstáculo y de VUELTA al receptor.',
                'Porque Arduino funciona con lógica binaria de base 2.',
                'Porque el sensor tiene 2 cilindros metálicos.',
                'Para compensar la pérdida de voltaje en el cable USB.'
            ],
            correct: 0,
            explanation: 'El sonido recorre el camino dos veces: viaja desde el emisor T hasta el obstáculo (ida) y luego rebota hacia el receptor R (vuelta). Para saber la distancia exacta al obstáculo, se divide el tiempo total entre 2.'
        },
        {
            id: 5,
            question: 'Si un sensor HC-SR04 mide un tiempo de eco de 582 microsegundos (µs), ¿a qué distancia se encuentra el obstáculo?',
            options: [
                '10 cm',
                '50 cm',
                '100 cm',
                '5.82 metros'
            ],
            correct: 0,
            explanation: 'Aplicando la fórmula: (582 µs × 0.0343 cm/µs) / 2 = 19.96 / 2 = 9.98 cm ≈ 10 cm (o 582 / 58.2 = 10 cm).'
        },
        {
            id: 6,
            question: '¿Cuál es el rango de distancia de medición recomendado y confiable del sensor HC-SR04?',
            options: [
                'De 2 cm a 400 cm (4 metros)',
                'De 0 mm a 50 mm',
                'De 10 metros a 500 metros',
                'De 1 kilómetro a 10 kilómetros'
            ],
            correct: 0,
            explanation: 'El HC-SR04 tiene un rango de operación estándar de 2 centímetros a 400 centímetros (4 metros), con una precisión óptima de hasta 3 mm en condiciones ambientales estables.'
        },
        {
            id: 7,
            question: '¿Cómo deben declararse los modos de los pines TRIG y ECHO en la función `setup()` de Arduino?',
            options: [
                'pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);',
                'pinMode(TRIG, INPUT); pinMode(ECHO, OUTPUT);',
                'pinMode(TRIG, INPUT_PULLUP); pinMode(ECHO, INPUT_PULLUP);',
                'analogReference(DEFAULT);'
            ],
            correct: 0,
            explanation: 'TRIG es una salida digital de Arduino (OUTPUT) porque Arduino le envía la orden de disparo, mientras que ECHO es una entrada (INPUT) porque Arduino escucha la señal de eco devuelta por el sensor.'
        },
        {
            id: 8,
            question: '¿Qué tipo de material u objeto representaría la mayor dificultad de detección para un sensor de ultrasonido?',
            options: [
                'Un cojín de espuma gruesa o tela afelpada muy absorbente.',
                'Una pared de concreto sólido lisa.',
                'Una puerta de madera barnizada.',
                'Una lámina de acrílico transparente.'
            ],
            correct: 0,
            explanation: 'Las espumas, telas gruesas y materiales porosos absorben la energía de la onda acústica en lugar de rebotarla, debilitando el eco y provocando lecturas erróneas o nulas.'
        },
        {
            id: 9,
            question: 'En un robot móvil con sensor HC-SR04 frontal, si `distancia < 15 cm`, ¿cuál es la acción robótica lógica recomendada?',
            options: [
                'Detenerse o retroceder y girar para evitar colisionar contra el obstáculo.',
                'Acelerar a máxima velocidad hacia el obstáculo.',
                'Apagar la batería del robot.',
                'Encender el sensor PIR para medir la temperatura.'
            ],
            correct: 0,
            explanation: 'Al detectar que un obstáculo está a menos de 15 cm (zona de peligro de colisión), el algoritmo de evasión debe ordenar frenar o realizar un viraje para continuar la navegación de forma segura.'
        },
        {
            id: 10,
            question: '¿Por qué el sensor HC-SR04 puede detectar obstáculos de vidrio o acrílico transparente donde un sensor Infrarrojo óptico (IR) fallaría?',
            options: [
                'Porque el ultrasonido utiliza ondas de presión mecánicas (sonido) que rebotan en cualquier superficie sólida, independientemente de su transparencia a la luz.',
                'Porque el vidrio absorbe el sonido convirtiéndolo en electricidad.',
                'Porque el vidrio es conductor de corriente continua.',
                'Porque el sensor ultrasónico rompe el vidrio con la vibración.'
            ],
            correct: 0,
            explanation: 'La luz infrarroja atraviesa los materiales transparentes como el vidrio sin rebotar. En cambio, las ondas de sonido acústicas rebotan eficazmente contra la superficie sólida del vidrio, permitiendo medir su distancia sin problemas.'
        }
    ]
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 're-m2-l4-content',
                content: lessonDefinition.content
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 're-m2-l4-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        prueba: [
            createQuizBlock({
                id: 're-m2-l4-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions
            })
        ]
    }
});
