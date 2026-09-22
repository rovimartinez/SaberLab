import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Programación Avanzada: Bucles, Máquinas de Estado y millis() vs delay()',
    content: `
        <div class="lesson-intro">
            <p>En proyectos de robótica básica, la instrucción <code>delay()</code> parece inofensiva. Sin embargo, en robots autónomos y sistemas de seguridad industrial, <code>delay()</code> es el enemigo número uno: <strong>congela por completo el procesador</strong> e ignora sensores, botones y órdenes durante la pausa. En esta lección aprenderás a dominar la temporización no bloqueante con <code>millis()</code>, el control iterativo con bucles avanzados (<code>for</code>, <code>while</code>, <code>do-while</code>) y el diseño de <strong>Máquinas de Estados Finitos (FSM)</strong> profesionales.</p>
        </div>

        <!-- 1. EL PROBLEMA DE DELAY() Y LA SOLUCIÓN MILLIS() -->
        <div class="theory-section">
            <h3 id="re-m3-3-1">1. ¿Por qué delay() Bloquea tu Robot y cómo funciona millis()?</h3>
            <p>Cuando ejecutas <code>delay(2000)</code>, el microcontrolador entra en un bucle vacío donde no hace absolutamente nada durante 2 segundos: no puede leer sensores ultrasónicos, no detecta si presionaste un botón de parada de emergencia ni puede actualizar la pantalla.</p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin: 1.5rem 0;">
                <!-- delay bloqueante -->
                <div style="background: rgba(239, 68, 68, 0.08); border: 1.5px solid rgba(239, 68, 68, 0.35); border-radius: 16px; padding: 1.25rem;">
                    <h4 style="color: #ef4444; margin-top: 0; margin-bottom: 0.5rem;">🛑 delay() — Código Bloqueante</h4>
                    <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; margin: 0;">
                        • Detiene la ejecución del código en esa línea.<br>
                        • El robot queda "ciego" y "sordo" durante el tiempo de espera.<br>
                        • Imposible realizar dos tareas al mismo tiempo (como titilar un LED y mover un motor simultáneamente).
                    </p>
                </div>

                <!-- millis no bloqueante -->
                <div style="background: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.35); border-radius: 16px; padding: 1.25rem;">
                    <h4 style="color: #34d399; margin-top: 0; margin-bottom: 0.5rem;">⏱️ millis() — Código Concurrente (No Bloqueante)</h4>
                    <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; margin: 0;">
                        • Devuelve el número de <strong>milisegundos transcurridos</strong> desde que Arduino encendió.<br>
                        • Funciona como un "cronómetro de muñeca": puedes consultarlo periódicamente sin detener el flujo.<br>
                        • Permite multitarea aparente (concurrencia cooperativa).
                    </p>
                </div>
            </div>

            <!-- Parámetros de millis -->
            <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1.25rem; margin: 1.25rem 0;">
                <h4 style="color: #38bdf8; margin-top: 0; margin-bottom: 0.5rem;">Tipo de Dato: unsigned long</h4>
                <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.7; margin: 0;">
                    Como el contador de <code>millis()</code> crece constantemente, debe guardarse en variables de tipo <code>unsigned long</code> (entero sin signo de 32 bits). Este tipo de dato puede contar hasta $4,294,967,295\,\text{ms}$, lo que equivale a aproximadamente <strong>49.7 días continuos</strong> antes de desbordarse (rollover a 0).
                </p>
            </div>

            <!-- PLACEHOLDER IMAGEN 1: Analogía del Cronómetro vs delay() -->
            <div style="background: rgba(15, 23, 42, 0.7); border: 1.5px dashed rgba(56, 189, 248, 0.35); border-radius: 16px; padding: 1.5rem; margin: 1.5rem 0; text-align: center;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; background: rgba(56, 189, 248, 0.12); color: #38bdf8; margin-bottom: 0.5rem;">
                    ⏱️
                </div>
                <h4 style="color: #38bdf8; margin: 0.25rem 0 0.4rem; font-size: 1.05rem;">Diagrama: Comparativa de Flujo de Ejecución (delay vs millis)</h4>
                <p style="color: #94a3b8; font-size: 0.85rem; margin: 0; line-height: 1.5;">
                    [Espacio reservado para Diagrama de Línea Temporal: Bloqueo de CPU vs Bucle Continuo con Comprobación de Timestamp]
                </p>
            </div>
        </div>

        <!-- 2. PATRÓN TEMPORIZADOR NO BLOQUEANTE (BLINK WITHOUT DELAY) -->
        <div class="theory-section">
            <h3 id="re-m3-3-2">2. El Patrón Universal de Temporización con millis()</h3>
            <p>La fórmula matemática fundamental para temporizar cualquier evento sin bloquear el procesador es:</p>

            <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 14px; padding: 1rem; text-align: center; margin: 1.25rem 0; font-family: monospace; font-size: 1.15rem; color: #38bdf8; font-weight: 700;">
                if (millisActual - tiempoAnterior &gt;= intervalo)
            </div>

            <!-- Código Maestro: Titilar LED mientras se lee un Sensor sin Bloqueo -->
            <pre style="background: rgba(15, 23, 42, 0.85); padding: 1.25rem; border-radius: 16px; border: 1px solid rgba(56, 189, 248, 0.25); overflow-x: auto;"><code style="color: #e2e8f0;">// Código Maestro: Parpadeo de LED y Lectura de Botón Simultánea
const int LED_PIN = 13;
const int BOTON_PIN = 2;

unsigned long tiempoPrevio = 0;   // Guarda el último cambio de estado
const unsigned long INTERVALO = 1000; // Intervalo de 1 segundo (1000 ms)
int estadoLed = LOW;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BOTON_PIN, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  unsigned long tiempoActual = millis(); // 1. Leemos el cronómetro actual

  // 2. Comprobamos si ya transcurrió el intervalo programado
  if (tiempoActual - tiempoPrevio &gt;= INTERVALO) {
    tiempoPrevio = tiempoActual; // Actualizamos la marca de tiempo

    // Invertimos el estado del LED (HIGH &lt;-&gt; LOW)
    estadoLed = (estadoLed == LOW) ? HIGH : LOW;
    digitalWrite(LED_PIN, estadoLed);
  }

  // 3. El procesador responde a sensores al instante (¡CERO RETARDO!)
  if (digitalRead(BOTON_PIN) == LOW) {
    Serial.println("¡Botón presionado al instante sin lag!");
  }
}</code></pre>
        </div>

        <!-- 3. BUCLES AVANZADOS EN C++ (FOR, WHILE, DO-WHILE) -->
        <div class="theory-section">
            <h3 id="re-m3-3-3">3. Estructuras de Repetición Avanzadas: for, while y do-while</h3>
            <p>Los bucles permiten repetir fragmentos de código mientras se cumpla una condición lógica. Cada estructura tiene un propósito específico en robótica:</p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
                <!-- FOR -->
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 14px; padding: 1.15rem;">
                    <h4 style="color: #38bdf8; margin: 0 0 0.4rem; font-size: 1rem;">1. Bucle FOR (Conteo Determinado)</h4>
                    <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.5; margin-bottom: 0.6rem;">
                        Se utiliza cuando <strong>conoces de antemano cuántas veces</strong> debe repetirse la acción (ej. mover un servo 180 pasos o promediar 10 lecturas).
                    </p>
                    <pre style="background: rgba(0,0,0,0.3); padding: 0.6rem; border-radius: 8px; font-size: 0.8rem; margin: 0;"><code style="color: #38bdf8;">for (int i=0; i&lt;10; i++) {
  // Acción repetitiva
}</code></pre>
                </div>

                <!-- WHILE -->
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 14px; padding: 1.15rem;">
                    <h4 style="color: #fbbf24; margin: 0 0 0.4rem; font-size: 1rem;">2. Bucle WHILE (Condicional Previo)</h4>
                    <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.5; margin-bottom: 0.6rem;">
                        Evalúa la condición <strong>antes de entrar</strong>. Si es falsa desde el inicio, el código interno nunca se ejecutará.
                    </p>
                    <pre style="background: rgba(0,0,0,0.3); padding: 0.6rem; border-radius: 8px; font-size: 0.8rem; margin: 0;"><code style="color: #fbbf24;">while (distancia &gt; 15) {
  avanzar();
}</code></pre>
                </div>

                <!-- DO-WHILE -->
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 14px; padding: 1.15rem;">
                    <h4 style="color: #34d399; margin: 0 0 0.4rem; font-size: 1rem;">3. Bucle DO-WHILE (Post-Condicional)</h4>
                    <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.5; margin-bottom: 0.6rem;">
                        Garantiza que el código se ejecute <strong>al menos una vez</strong> antes de verificar si la condición continúa siendo verdadera.
                    </p>
                    <pre style="background: rgba(0,0,0,0.3); padding: 0.6rem; border-radius: 8px; font-size: 0.8rem; margin: 0;"><code style="color: #34d399;">do {
  calibrarSensor();
} while (calibrado == false);</code></pre>
                </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1.15rem; margin: 1.25rem 0;">
                <h4 style="color: #c084fc; margin-top: 0; margin-bottom: 0.4rem;">Sentencias de Control de Flujo:</h4>
                <ul style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.7; margin: 0; padding-left: 1.25rem;">
                    <li><code>break;</code> Rompe y finaliza inmediatamente la ejecución del bucle actual, saliendo al exterior.</li>
                    <li><code>continue;</code> Salta el resto de la iteración actual y pasa de inmediato a la siguiente repetición del bucle.</li>
                </ul>
            </div>
        </div>

        <!-- 4. MÁQUINAS DE ESTADOS FINITOS (FSM) -->
        <div class="theory-section">
            <h3 id="re-m3-3-4">4. Máquinas de Estados Finitos (FSM) con enum y switch-case</h3>
            <p>Una <strong>Máquina de Estados Finitos (FSM)</strong> es un patrón de diseño fundamental en robótica: divide el comportamiento del robot en un número determinado de <strong>estados discretos</strong> (ej. <em>REPOSO</em>, <em>PATRULLA</em>, <em>ALERTA</em>, <em>ALARMA</em>), ejecutando acciones específicas y transitando entre ellos según eventos del entorno.</p>

            <!-- PLACEHOLDER IMAGEN 2: Diagrama de Transición de Estados FSM -->
            <div style="background: rgba(15, 23, 42, 0.7); border: 1.5px dashed rgba(168, 85, 247, 0.35); border-radius: 16px; padding: 1.5rem; margin: 1.5rem 0; text-align: center;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; background: rgba(168, 85, 247, 0.12); color: #c084fc; margin-bottom: 0.5rem;">
                    🔄
                </div>
                <h4 style="color: #c084fc; margin: 0.25rem 0 0.4rem; font-size: 1.05rem;">Diagrama: Transición de Estados FSM para un Sistema Robótico</h4>
                <p style="color: #94a3b8; font-size: 0.85rem; margin: 0; line-height: 1.5;">
                    [Espacio reservado para Diagrama de Bloques: Nodos circulares de Estado con flechas de Transición basadas en Sensores]
                </p>
            </div>

            <!-- Código Maestro FSM en C++ -->
            <pre style="background: rgba(15, 23, 42, 0.85); padding: 1.25rem; border-radius: 16px; border: 1px solid rgba(168, 85, 247, 0.25); overflow-x: auto;"><code style="color: #e2e8f0;">// Código Maestro: Máquina de Estados de un Robot Centinela
enum EstadoRobot {
  REPOSO,
  EXPLORANDO,
  OBSTACULO_DETECTADO
};

EstadoRobot estadoActual = REPOSO;

void setup() {
  Serial.begin(9600);
}

void loop() {
  switch (estadoActual) {
    case REPOSO:
      // Acciones en Reposo
      if (sensorActivo()) {
        estadoActual = EXPLORANDO; // Transición de estado
      }
      break;

    case EXPLORANDO:
      // Acciones de patrullaje
      if (hayObstaculo()) {
        estadoActual = OBSTACULO_DETECTADO;
      }
      break;

    case OBSTACULO_DETECTADO:
      // Acciones de giro evasivo
      girarRobot();
      estadoActual = EXPLORANDO;
      break;
  }
}</code></pre>
        </div>
    `,
    sections: [
        { id: 're-m3-3-1', title: '1. El Problema de delay() y millis()' },
        { id: 're-m3-3-2', title: '2. Patrón Temporizador No Bloqueante' },
        { id: 're-m3-3-3', title: '3. Bucles Avanzados: for, while y do-while' },
        { id: 're-m3-3-4', title: '4. Máquinas de Estados Finitos (FSM)' }
    ],
    flashcards: [
        {
            id: 'f1',
            type: 'theory',
            q: '¿Por qué la función delay() se considera "bloqueante"?',
            a: 'Detiene por completo la CPU ignorando sensores e interrupciones',
            sub: 'Impide que el robot lea el entorno o responda a botones durante el tiempo de retardo.',
            sectionId: 're-m3-3-1'
        },
        {
            id: 'f2',
            type: 'code',
            q: '¿Qué valor exacto devuelve la función millis() en Arduino?',
            a: 'El número de milisegundos transcurridos desde que encendió la placa',
            sub: 'Funciona como un reloj continuo de hardware que nunca detiene su conteo.',
            sectionId: 're-m3-3-1'
        },
        {
            id: 'f3',
            type: 'code',
            q: '¿Qué tipo de dato de C++ es obligatorio para guardar valores de millis()?',
            a: 'unsigned long (entero sin signo de 32 bits)',
            sub: 'Permite contar hasta 4,294,967,295 ms (~49.7 días continuos) sin errores de desbordamiento.',
            sectionId: 're-m3-3-1'
        },
        {
            id: 'f4',
            type: 'code',
            q: '¿Cuál es la fórmula básica de temporización no bloqueante con millis()?',
            a: 'if (tiempoActual - tiempoPrevio >= intervalo)',
            sub: 'Calcula la diferencia de tiempo transcurrido sin congelar la ejecución del loop().',
            sectionId: 're-m3-3-2'
        },
        {
            id: 'f5',
            type: 'code',
            q: '¿En qué caso se debe preferir un bucle for sobre un while?',
            a: 'Cuando se conoce de antemano la cantidad exacta de repeticiones',
            sub: 'El for integra inicialización, condición de parada e incremento en una sola línea compacta.',
            sectionId: 're-m3-3-3'
        },
        {
            id: 'f6',
            type: 'code',
            q: '¿Qué diferencia clave tiene un bucle do-while frente a un bucle while?',
            a: 'El do-while garantiza ejecutar el bloque de código al menos una vez',
            sub: 'Porque evalúa la condición al final de la iteración en lugar de al principio.',
            sectionId: 're-m3-3-3'
        },
        {
            id: 'f7',
            type: 'code',
            q: '¿Qué efecto produce la instrucción break dentro de un bucle for o while?',
            a: 'Termina el bucle de inmediato y transfiere el control a la siguiente línea externa',
            sub: 'Se utiliza para salir anticipadamente cuando se detecta una condición crítica o de parada.',
            sectionId: 're-m3-3-3'
        },
        {
            id: 'f8',
            type: 'code',
            q: '¿Qué hace la sentencia continue en una estructura repetitiva?',
            a: 'Salta el resto de la iteración actual y avanza a la siguiente repetición',
            sub: 'No cancela el bucle completo, solo omite las instrucciones restantes de ese ciclo específico.',
            sectionId: 're-m3-3-3'
        },
        {
            id: 'f9',
            type: 'theory',
            q: '¿Qué es una Máquina de Estados Finitos (FSM)?',
            a: 'Modelo de diseño que divide el comportamiento del robot en estados discretos',
            sub: 'El robot solo puede estar en un estado a la vez y transita según eventos o lecturas de sensores.',
            sectionId: 're-m3-3-4'
        },
        {
            id: 'f10',
            type: 'code',
            q: '¿Qué combinación de estructuras de C++ es ideal para implementar una FSM limpia?',
            a: 'enum (para nombrar los estados) + switch-case (para evaluar las acciones)',
            sub: 'Garantiza un código estructurado, altamente legible y fácil de expandir.',
            sectionId: 're-m3-3-4'
        }
    ],
    questions: [
        {
            id: 'q1',
            question: '¿Cuál es el principal inconveniente de utilizar delay(1000) en el control de un robot móvil?',
            options: [
                'Congela la CPU durante 1 segundo, impidiendo leer sensores de colisión o botones',
                'Aumenta el consumo de corriente del microcontrolador al 100%',
                'Borra la memoria EEPROM de Arduino',
                'Invalida la configuración de los pines pinMode()'
            ],
            correct: 0,
            explanation: '`delay()` es bloqueante: el microcontrolador no ejecuta ninguna otra línea de código durante ese lapso, provocando choques si surge un obstáculo imprevisto.'
        },
        {
            id: 'q2',
            question: '¿Qué tipo de dato de C++ DEBE emplearse para almacenar variables de tiempo con millis()?',
            options: [
                'unsigned long',
                'int',
                'float',
                'byte'
            ],
            correct: 0,
            explanation: '`unsigned long` tiene 32 bits sin signo, lo que permite almacenar conteos de hasta ~49.7 días sin desbordamiento negativo.'
        },
        {
            id: 'q3',
            question: 'Si millis() marca 5000 y tiempoPrevio es 3500, ¿cuánto tiempo ha transcurrido?',
            options: [
                '1500 ms (1.5 segundos)',
                '8500 ms',
                '3500 ms',
                '5000 ms'
            ],
            correct: 0,
            explanation: 'La resta `5000 - 3500 = 1500 ms` indica el tiempo exacto transcurrido desde la última actualización.'
        },
        {
            id: 'q4',
            question: '¿Qué estructura de bucle evalúa la condición AL FINAL y asegura al menos una ejecución obligatoria?',
            options: [
                'do-while',
                'while',
                'for',
                'switch-case'
            ],
            correct: 0,
            explanation: 'En `do { ... } while (condicion);` el bloque de código se ejecuta primero y la comprobación lógica ocurre al final.'
        },
        {
            id: 'q5',
            question: 'En un bucle `for (int i = 0; i < 5; i++)`, ¿cuántas veces se ejecuta el bloque interno?',
            options: [
                '5 veces (para i = 0, 1, 2, 3, 4)',
                '4 veces',
                '6 veces',
                'Infinitas veces'
            ],
            correct: 0,
            explanation: 'Inicia en i=0 y se ejecuta mientras i < 5 (valores 0, 1, 2, 3 y 4), totalizando 5 iteraciones.'
        },
        {
            id: 'q6',
            question: '¿Qué instrucción se usa para abortar y salir inmediatamente de un bucle infinito `while(true)`?',
            options: [
                'break;',
                'continue;',
                'return 0;',
                'exit();'
            ],
            correct: 0,
            explanation: '`break;` fuerza la salida inmediata del bucle más interno en el que se encuentre.'
        },
        {
            id: 'q7',
            question: '¿Cuál es la diferencia entre `break` y `continue` dentro de una estructura iterativa?',
            options: [
                '`break` rompe y sale del bucle; `continue` salta solo la iteración actual y sigue con la siguiente',
                '`break` pausa 1 segundo; `continue` reinicia el microcontrolador',
                'Son exactamente equivalentes y se usan indistintamente',
                '`continue` solo funciona dentro de funciones void'
            ],
            correct: 0,
            explanation: '`break` finaliza el ciclo por completo, mientras que `continue` omite el resto del bloque de esa pasada y pasa a la siguiente repetición.'
        },
        {
            id: 'q8',
            question: '¿Por qué es ventajoso usar `enum` para definir los estados de una Máquina de Estados Finitos (FSM)?',
            options: [
                'Asigna nombres legibles y auto-descriptivos a los estados en lugar de números mágicos',
                'Acelera la velocidad del procesador en un 50%',
                'Permite usar números decimales flotantes en los pines digitales',
                'Elimina la necesidad de usar setup()'
            ],
            correct: 0,
            explanation: '`enum` crea tipos de datos con nombres claros (ej. `PATRULLA`, `ALARMA`) que evitan confusiones con códigos numéricos difíciles de recordar.'
        },
        {
            id: 'q9',
            question: '¿Aproximadamente cuántos días continuos de funcionamiento transcurren antes de que el contador de `millis()` vuelva a 0 (rollover)?',
            options: [
                'Aproximadamente 49.7 días',
                'Exactamente 24 horas',
                '365 días',
                '10 horas'
            ],
            correct: 0,
            explanation: '$2^{32} - 1 = 4,294,967,295\,\text{ms} \approx 49.71\,\text{días}$.'
        },
        {
            id: 'q10',
            question: 'En un sistema de radar robótico que mueve un servo y mide distancia simultáneamente, ¿qué técnica de programación es indispensable?',
            options: [
                'Temporización no bloqueante con millis() para alternar tareas concurrentes',
                'Usar delays largos de 2 segundos en cada paso del servo',
                'Apagar la placa de Arduino entre lecturas',
                'Utilizar variables globales de tipo char'
            ],
            correct: 0,
            explanation: 'La temporización no bloqueante con `millis()` permite al robot avanzar el servo grado a grado y a la vez leer el sensor ultrasónico en tiempo real sin pausas artificiales.'
        }
    ]
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 're-m3-l3-content',
                content: lessonDefinition.content
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 're-m3-l3-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        prueba: [
            createQuizBlock({
                id: 're-m3-l3-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions
            })
        ]
    }
});
