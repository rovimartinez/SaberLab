import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Evaluación 1: Fundamentos y Lógica Digital',
    description: 'Evaluación Integradora de Robótica Educativa - Módulo 1 (20 preguntas, 150 pts)',
    instructions: 'Lee con atención cada una de las 20 preguntas y selecciona la opción correcta.\n\nTemas evaluados: Arduino, estructura de código (setup/loop), salidas digitales y LEDs, variables y semáforos, entradas digitales y pulsadores (pull-up/pull-down/rebote), comunicación y Monitor Serie, y entradas analógicas (ADC 10 bits, resolución y potenciómetros).\n\nTienes un límite de 60 minutos para responder. Al finalizar, presiona "Entregar Examen".',
    points: 150,
    time_limit: 60,
    passing_score: 70,
    hasSimulator: false,
    content: `
        <h3 id="re-1-6-1" style="color: #a855f7; margin: 1.5rem 0 1rem; font-size: 1.4rem;">Evaluación Integradora: Módulo 1 (Robótica Educativa)</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Bienvenido a la evaluación de cierre del <strong>Módulo 1 de Robótica Educativa</strong>. En esta prueba pondrás a prueba los fundamentos esenciales de hardware, electrónica digital y programación en microcontroladores Arduino.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #c084fc; margin: 0 0 0.5rem; font-size: 1rem;">1. Salidas Digitales y LEDs</h4>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    pinMode(pin, OUTPUT), digitalWrite(HIGH/LOW), delay(ms), ánodo/cátodo y resistencia limitadora de protección.
                </p>
            </div>
            <div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #60a5fa; margin: 0 0 0.5rem; font-size: 1rem;">2. Variables y Semáforos</h4>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Tipos de datos (int), legibilidad de código, máquinas de estados secuenciales y tiempos asimétricos.
                </p>
            </div>
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #10b981; margin: 0 0 0.5rem; font-size: 1rem;">3. Entradas y Pulsadores</h4>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    digitalRead(pin), INPUT_PULLUP, estado flotante (floating), resistencias pull-up/pull-down y rebote mecánico.
                </p>
            </div>
            <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #fbbf24; margin: 0 0 0.5rem; font-size: 1rem;">4. Monitor Serie y ADC</h4>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Serial.begin(9600), baudios, analogRead(A0-A5), ADC de 10 bits (0-1023), resolución de 4.88 mV y divisor resistivo.
                </p>
            </div>
        </div>
    `,
    flashcards: [
        { id: 're-1-6-f1', type: 'code', q: '¿Qué diferencia hay entre setup() y loop()?', a: 'setup() se ejecuta una sola vez al arrancar; loop() se repite continuamente en bucle infinito.', sub: 'Estructura Arduino', sectionId: 're-1-6-1' },
        { id: 're-1-6-f2', type: 'hw', q: '¿Por qué el LED necesita resistencia?', a: 'Para limitar la corriente que circula y evitar que el LED y el pin del microcontrolador se quemen.', sub: 'Protección de hardware', sectionId: 're-1-6-1' },
        { id: 're-1-6-f3', type: 'code', q: '¿Qué ventaja tiene INPUT_PULLUP?', a: 'Activa la resistencia interna de 5V del microcontrolador, evitando agregar una resistencia externa en la protoboard.', sub: 'Entradas digitales', sectionId: 're-1-6-1' },
        { id: 're-1-6-f4', type: 'code', q: '¿Qué rango devuelve analogRead() en Arduino Uno?', a: 'De 0 a 1023, correspondiente a los 1024 niveles discretos del ADC de 10 bits (0 a 5V).', sub: 'Entradas analógicas', sectionId: 're-1-6-1' },
        { id: 're-1-6-f5', type: 'code', q: '¿Qué ocurre si los baudios no coinciden en el Monitor Serie?', a: 'Se muestran caracteres incomprensibles o basura digital (mojibake) por desincronización.', sub: 'Comunicación serial', sectionId: 're-1-6-1' }
    ],
    questions: [
        {
            id: 're-1-6-q1',
            objective: 'Diferenciar las funciones principales setup y loop en Arduino',
            concept: 'estructura_arduino',
            difficulty: 'easy',
            q: 'En el entorno de programación de Arduino, ¿cuál es la diferencia de ejecución entre las funciones obligatorias void setup() y void loop()?',
            options: [
                'setup() se ejecuta indefinidamente en segundo plano, mientras que loop() solo se ejecuta cuando ocurre un error',
                'setup() se ejecuta una sola vez al encender o reiniciar la placa, mientras que loop() se repite continuamente en bucle infinito',
                'setup() se encarga de apagar los pines de alimentación, mientras que loop() compila el código en el microcontrolador',
                'Ambas funciones se ejecutan simultáneamente en hilos de procesamiento paralelo'
            ],
            correct: 1,
            explanation: 'setup() inicializa configuraciones que solo se requieren una vez (como pinMode o Serial.begin), mientras que loop() contiene la lógica principal del programa que se repite indefinidamente.'
        },
        {
            id: 're-1-6-q2',
            objective: 'Configurar un pin digital como salida',
            concept: 'pinMode_output',
            difficulty: 'easy',
            q: 'Si deseas configurar el pin digital 13 para enviar corriente hacia un actuador o LED, ¿qué instrucción debes colocar dentro de setup()?',
            options: [
                'digitalWrite(13, HIGH);',
                'pinMode(13, INPUT);',
                'pinMode(13, OUTPUT);',
                'analogRead(13, OUTPUT);'
            ],
            correct: 2,
            explanation: 'La función pinMode(pin, modo) configura el pin en baja impedancia de salida (OUTPUT) para que pueda suministrar o drenar corriente.'
        },
        {
            id: 're-1-6-q3',
            objective: 'Comprender el funcionamiento de delay en milisegundos',
            concept: 'temporizacion_delay',
            difficulty: 'easy',
            q: '¿Qué efecto produce ejecutar la instrucción delay(2500); en un microcontrolador Arduino Uno?',
            options: [
                'Incrementa la frecuencia de oscilación del reloj en 2.5 MHz',
                'Pausa la ejecución del programa durante 2.5 segundos (2500 milisegundos)',
                'Establece la corriente máxima del pin en 2.5 miliamperios',
                'Repite el ciclo loop() 2500 veces consecutivas a máxima velocidad'
            ],
            correct: 1,
            explanation: 'El parámetro de delay() se expresa en milisegundos (1000 ms = 1 s). Por tanto, 2500 ms = 2.5 s.'
        },
        {
            id: 're-1-6-q4',
            objective: 'Comprender la función del resistor limitador en un LED',
            concept: 'resistencia_limitadora_led',
            difficulty: 'medium',
            q: 'Al conectar un diodo LED a una salida digital de Arduino, ¿por qué es indispensable colocar un resistor limitador (ej: 220 Ω o 330 Ω) en serie con el componente?',
            options: [
                'Para aumentar el voltaje de salida del pin de 5V a 12V y lograr que el LED brille con mayor intensidad',
                'Para convertir la señal de corriente continua (DC) en corriente alterna (AC)',
                'Para limitar la corriente que atraviesa el LED, protegiéndolo de quemarse y evitando sobrecargar el pin del microcontrolador (máx. 40 mA)',
                'Para evitar que el LED consuma voltaje del pin de tierra (GND)'
            ],
            correct: 2,
            explanation: 'Un LED tiene una resistencia interna muy baja al conducir. Sin una resistencia limitadora, fluiría una corriente destructiva que fundiría el diodo y dañaría el pin del microcontrolador.'
        },
        {
            id: 're-1-6-q5',
            objective: 'Identificar las ventajas de usar variables en lugar de números mágicos',
            concept: 'variables_arduino',
            difficulty: 'easy',
            q: 'En lugar de usar números fijos dispersos por todo el código ("números mágicos"), ¿cuál es la ventaja principal de declarar una variable como int ledRojo = 9; al inicio del sketch?',
            options: [
                'Hace que el programa se ejecute 10 veces más rápido al reducir el consumo eléctrico de la placa',
                'Mejora la legibilidad del código y permite cambiar el pin físico asignado modificando una sola línea',
                'Permite que el pin 9 funcione simultáneamente como entrada analógica y salida de potencia',
                'Es un requisito estricto sin el cual el compilador de C++ no permite encender salidas digitales'
            ],
            correct: 1,
            explanation: 'El uso de variables descriptivas aporta claridad conceptual y permite modificar el conexionado de pines en un solo lugar sin alterar el resto del sketch.'
        },
        {
            id: 're-1-6-q6',
            objective: 'Aplicar coherencia de estados en secuencias lógicas de semáforo',
            concept: 'semaforo_logica_estados',
            difficulty: 'medium',
            q: 'En el diseño secuencial de un semáforo vehicular de tres luces (Verde, Amarillo, Rojo), ¿qué consideración de seguridad lógica debe respetarse al cambiar de estado?',
            options: [
                'Mantener encendidos los 3 bombillos al mismo tiempo durante 5 segundos para avisar el cambio',
                'Apagar la luz actual antes o en el mismo instante de activar la siguiente fase para no generar señales contradictorias',
                'Configurar la luz amarilla como INPUT para que absorba el exceso de voltaje',
                'Invertir la polaridad de los diodos conectándolos directamente al pin RESET'
            ],
            correct: 1,
            explanation: 'En un semáforo real, la coherencia de estados exige que no coexistan fases incompatibles (como verde y rojo encendidos simultáneamente).'
        },
        {
            id: 're-1-6-q7',
            objective: 'Entender la asimetría temporal en aplicaciones de control',
            concept: 'tiempos_asimetricos',
            difficulty: 'easy',
            q: '¿Por qué en un semáforo real la luz amarilla tiene un tiempo asignado sustancialmente menor que la luz verde o la roja?',
            options: [
                'Porque el LED amarillo no tolera más de 500 milisegundos de corriente continua sin quemarse',
                'Porque la función del amarillo es únicamente de transición y advertencia de despeje, no de flujo continuo ni de detención prolongada',
                'Porque el Arduino solo puede procesar números impares en la temporización del color amarillo',
                'Porque la luz amarilla consume el triple de energía que las luces verde y roja combinadas'
            ],
            correct: 1,
            explanation: 'Pedagógicamente se abordan los tiempos asimétricos: cada estado responde a una necesidad del sistema real (advertencia de paso frente a tránsito o detención).'
        },
        {
            id: 're-1-6-q8',
            objective: 'Comprender el efecto de retención de estado (latch) en salidas digitales',
            concept: 'latch_salida_digital',
            difficulty: 'medium',
            q: 'Si en el loop() enciendes el ledVerde por 3s, lo apagas y enciendes el ledAmarillo por 1s, pero nunca escribes digitalWrite(ledAmarillo, LOW), ¿qué ocurre al reiniciarse el bucle?',
            options: [
                'El microcontrolador se apaga por completo',
                'El LED amarillo se apaga automáticamente por hardware al terminar el delay',
                'El ciclo se reinicia, encendiendo el LED verde mientras el LED amarillo permanece encendido',
                'Los dos LEDs parpadean intermitentemente en señal de error'
            ],
            correct: 2,
            explanation: 'Los microcontroladores retienen el último estado ordenado (latch). Si nunca se ordenó apagar el LED amarillo, seguirá en HIGH al volver a ejecutar el inicio del loop.'
        },
        {
            id: 're-1-6-q9',
            objective: 'Identificar los valores de retorno de una entrada digital',
            concept: 'digitalRead_retorno',
            difficulty: 'easy',
            q: '¿Qué valores posibles puede devolver la función digitalRead(pin) cuando se ejecuta sobre un pin digital?',
            options: [
                'Cualquier número decimal continuo comprendido entre 0.0 y 5.0',
                'Exclusivamente HIGH (1 lógico, voltaje cercano a 5V) o LOW (0 lógico, voltaje cercano a 0V)',
                'Un número entero entre 0 y 1023 según la presión del dedo sobre el botón',
                'El valor en ohmios de la resistencia del cable'
            ],
            correct: 1,
            explanation: 'Una entrada digital es binaria y discreta: solo distingue dos estados lógicos de tensión (HIGH o LOW).'
        },
        {
            id: 're-1-6-q10',
            objective: 'Reconocer el fenómeno del estado flotante (floating pin)',
            concept: 'estado_flotante_ruido',
            difficulty: 'medium',
            q: 'Si configuras un pin como entrada con pinMode(pin, INPUT) y dejas el cable desconectado ("al aire") sin ninguna resistencia conectada, ¿qué fenómeno físico ocurre?',
            options: [
                'El pin queda fijado de manera segura y estable en 0V',
                'El pin entra en estado flotante (floating), captando ruido electromagnético ambiental y generando lecturas aleatorias e inestables entre HIGH y LOW',
                'El microcontrolador se bloquea automáticamente por cortocircuito',
                'El pin se convierte automáticamente en una salida de 5V para auto-calibrarse'
            ],
            correct: 1,
            explanation: 'La altísima impedancia de entrada de la compuerta digital la hace muy sensible al ruido electrostático si no existe una resistencia pull-up o pull-down que defina el nivel de voltaje en reposo.'
        },
        {
            id: 're-1-6-q11',
            objective: 'Conocer la ventaja del modo INPUT_PULLUP interno',
            concept: 'input_pullup_ventaja',
            difficulty: 'easy',
            q: '¿Qué ventaja fundamental ofrece utilizar la instrucción pinMode(pin, INPUT_PULLUP) en lugar de un INPUT ordinario?',
            options: [
                'Permite conectar voltajes de hasta 24V directamente al microcontrolador',
                'Activa una resistencia interna conectada a 5V dentro del propio microcontrolador, permitiendo conectar el pulsador a tierra (GND) sin necesidad de una resistencia externa en la protoboard',
                'Hace que el pulsador no sufra rebote mecánico bajo ninguna circunstancia',
                'Invierte automáticamente el sentido de giro de los motores del robot'
            ],
            correct: 1,
            explanation: 'INPUT_PULLUP habilita la resistencia interna de pull-up del microcontrolador ATmega328P (~20kΩ a 50kΩ), ahorrando componentes externos y facilitando el montaje.'
        },
        {
            id: 're-1-6-q12',
            objective: 'Comprender la causa física del rebote mecánico en contactos',
            concept: 'rebote_mecanico_pulsador',
            difficulty: 'medium',
            q: '¿A qué se refiere el término "rebote mecánico" (contact bounce) en los pulsadores de los proyectos de robótica?',
            options: [
                'A la fuerza elástica que expulsa el dedo del usuario al presionar el interruptor',
                'A las micro-vibraciones mecánicas de las láminas metálicas internas al chocar, las cuales generan múltiples transiciones eléctricas rápidas de HIGH/LOW en cuestión de milisegundos',
                'Al retraso térmico que sufre el silicio cuando se calienta la placa',
                'Al rebote de la corriente que regresa a la batería cuando el circuito se abre'
            ],
            correct: 1,
            explanation: 'Al cerrarse un contacto mecánico, las superficies rebotan microscópicamente durante varios milisegundos antes de asentarse, lo cual un microcontrolador puede interpretar erróneamente como múltiples pulsaciones.'
        },
        {
            id: 're-1-6-q13',
            objective: 'Identificar el propósito de Serial.begin y los baudios',
            concept: 'serial_begin_baudios',
            difficulty: 'easy',
            q: '¿Qué función cumple la instrucción Serial.begin(9600); dentro de setup()?',
            options: [
                'Establece un temporizador de 9600 microsegundos antes de encender el primer LED',
                'Inicializa el puerto de comunicación serie UART y fija la velocidad de transmisión en 9600 baudios (bits por segundo)',
                'Reserva 9600 bytes de memoria RAM para guardar las variables del sketch',
                'Calibra la entrada de voltaje a un rango de 9.6 voltios'
            ],
            correct: 1,
            explanation: 'Serial.begin(baudrate) configura el hardware de comunicación serial a la velocidad especificada en baudios (bits/segundo) para comunicarse con la computadora u otros dispositivos.'
        },
        {
            id: 're-1-6-q14',
            objective: 'Diferenciar entre Serial.print y Serial.println',
            concept: 'print_vs_println',
            difficulty: 'easy',
            q: '¿Cuál es la diferencia de comportamiento entre Serial.print("Dato"); y Serial.println("Dato");?',
            options: [
                'Serial.print envía caracteres en mayúsculas y Serial.println en minúsculas',
                'Serial.print muestra el texto y permanece en la misma línea; Serial.println agrega automáticamente un salto de línea al final',
                'Serial.println solo funciona con números decimales, mientras que Serial.print solo imprime letras',
                'Serial.println borra la pantalla del monitor serie antes de imprimir'
            ],
            correct: 1,
            explanation: 'println añade un retorno de carro y salto de línea (\\r\\n) al final del texto impreso, permitiendo que la siguiente impresión aparezca en una línea nueva.'
        },
        {
            id: 're-1-6-q15',
            objective: 'Diagnosticar problemas de desacople de baudrate en el Monitor Serie',
            concept: 'desacople_baudios_mojibake',
            difficulty: 'hard',
            q: 'Si en tu sketch configuraste Serial.begin(9600);, pero en la ventana del Monitor Serie de la computadora está seleccionado 115200 baudios, ¿qué observarás en la consola?',
            options: [
                'Los datos se leerán correctamente pero diez veces más rápido',
                'Aparecerán caracteres extraños, símbolos incomprensibles o basura digital (mojibake), ya que los tiempos de muestreo de bits no coinciden',
                'La computadora se reiniciará por desbordamiento de memoria',
                'El monitor serie cerrará la ventana automáticamente sin mostrar ningún mensaje'
            ],
            correct: 1,
            explanation: 'En la comunicación serial asíncrona, tanto el transmisor como el receptor deben operar a la misma tasa de baudios; de lo contrario, el receptor interpreta erróneamente los bits recibidos.'
        },
        {
            id: 're-1-6-q16',
            objective: 'Aplicar buenas prácticas en la depuración con telemetría serial',
            concept: 'buenas_practicas_telemetria',
            difficulty: 'medium',
            q: 'Durante el desarrollo de un proyecto de robótica, ¿cuál es la mejor práctica al enviar datos de sensores al Monitor Serie para depuración?',
            options: [
                'Enviar números sin parar a máxima velocidad dentro de loop() sin ningún delay()',
                'Imprimir una etiqueta descriptiva antes del valor (ej: Serial.print("Sensor: "); Serial.println(valor);) y añadir una pausa prudente para hacer la lectura comprensible',
                'Imprimir únicamente cuando la placa esté desconectada de la computadora',
                'Enviar el código fuente completo del programa en cada ciclo de loop()'
            ],
            correct: 1,
            explanation: 'Acompañar los valores con etiquetas descriptivas y pausas adecuadas evita saturar la consola y permite identificar con claridad qué dato corresponde a cada sensor o variable.'
        },
        {
            id: 're-1-6-q17',
            objective: 'Comprender la diferencia fundamental entre señales digitales y analógicas',
            concept: 'analogico_vs_digital',
            difficulty: 'easy',
            q: '¿Cuál es la diferencia física conceptual entre una señal digital y una señal analógica?',
            options: [
                'La señal digital solo puede tomar dos estados discretos (0V o 5V), mientras que la señal analógica puede variar de forma continua tomando infinitos valores dentro de un rango',
                'La señal digital solo funciona con baterías cuadradas de 9V y la analógica con puertos USB',
                'La señal analógica viaja más rápido que la velocidad de la luz y la digital no',
                'No existe ninguna diferencia; son dos nombres distintos para el mismo tipo de voltaje'
            ],
            correct: 0,
            explanation: 'Las señales analógicas varían de forma continua en el tiempo (como la luz o la temperatura), mientras que las señales digitales adoptan niveles discretos y bien delimitados (HIGH/LOW).'
        },
        {
            id: 're-1-6-q18',
            objective: 'Conocer el rango y resolución de cuantización del ADC de 10 bits',
            concept: 'rango_adc_10bits',
            difficulty: 'easy',
            q: 'El microcontrolador ATmega328P del Arduino Uno cuenta con un Convertidor Analógico a Digital (ADC) de 10 bits. ¿Cuál es el rango de valores enteros que devuelve la función analogRead(A0)?',
            options: [
                'De 0 a 100',
                'De 0 a 255',
                'De 0 a 1023 (1024 niveles discretos, 2 elevado a 10)',
                'De -512 a +512'
            ],
            correct: 2,
            explanation: 'Un convertidor de 10 bits genera 2^10 = 1024 valores posibles, que van del número 0 (para 0V) hasta 1023 (para el voltaje de referencia, normalmente 5V).'
        },
        {
            id: 're-1-6-q19',
            objective: 'Calcular la resolución de voltaje por paso del ADC de 10 bits',
            concept: 'calculo_resolucion_mv',
            difficulty: 'medium',
            q: 'Si el ADC del Arduino Uno mapea una señal de 0 a 5V en 1024 niveles (0 a 1023), ¿cuál es aproximadamente la resolución de voltaje por cada unidad de lectura?',
            options: [
                'Aproximadamente 4.88 mV (0.00488 V) por cada paso',
                'Exactamente 1.0 V por paso',
                '50 mV por paso',
                '250 mV por paso'
            ],
            correct: 0,
            explanation: 'Resolución = 5V / 1024 ≈ 0.0048828 V ≈ 4.88 mV por cada unidad devuelta por analogRead().'
        },
        {
            id: 're-1-6-q20',
            objective: 'Cablear correctamente un potenciómetro como divisor de tensión analógico',
            concept: 'cableado_potenciometro_divisor',
            difficulty: 'medium',
            q: 'En el laboratorio conectamos un potenciómetro como entrada analógica. ¿Cuál es la forma correcta de cablear sus 3 terminales para que funcione como divisor de tensión hacia el pin A0?',
            options: [
                'Los 3 terminales conectados juntos directamente al pin A0',
                'Un terminal extremo a 5V, el otro extremo a GND, y el terminal central (cursor móvil) al pin A0',
                'El terminal central a 5V y ambos extremos a GND sin pasar por ningún pin analógico',
                'Conectar únicamente dos terminales al pin RESET y a la salida de 3.3V'
            ],
            correct: 1,
            explanation: 'Al conectar los extremos a 5V y GND, la resistencia interna produce una caída de potencial continua, y el terminal central toma una fracción proporcional a la posición angular del eje.'
        }
    ],
    quizConfig: {
        timePerQuestion: 60,
        requiredScorePercent: 70,
        pointsPerQuestion: 7.5
    }
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 're-m1-l6-content',
                content: lessonDefinition.content,
                hasSimulator: lessonDefinition.hasSimulator
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 're-m1-l6-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        prueba: [
            createQuizBlock({
                id: 're-m1-l6-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions,
                quizConfig: lessonDefinition.quizConfig
            })
        ]
    }
});

export default lessonData;
