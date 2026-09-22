import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Proyecto Integrador: Sistema de Alarma y Radar Antirrobo Inteligente',
    content: `
        <div class="lesson-intro">
            <p>Es hora de integrar todo lo aprendido en una <strong>solución mecatrónica completa</strong>. En este proyecto integrador construirás un <strong>Radar de Vigilancia y Sistema de Alarma Inteligente</strong>: un servomotor realizará un barrido angular continuo de 180° transportando un sensor ultrasónico; cuando detecte un intruso dentro del perímetro de seguridad, el radar se detendrá, orientará el haz hacia el objetivo, activará una sirena modulada con el buzzer pasivo, encenderá luces estroboscópicas de advertencia y reportará la telemetría en tiempo real por el Monitor Serie.</p>
        </div>

        <!-- 1. ARQUITECTURA DEL SISTEMA INTEGRADOR -->
        <div class="theory-section">
            <h3 id="re-m3-4-1">1. Arquitectura del Sistema: Sensores, Lógica y Actuadores</h3>
            <p>El sistema combina cuatro subsistemas mecatrónicos interconectados mediante una Máquina de Estados Finitos y temporización no bloqueante:</p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
                <!-- 1. Percepción -->
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 14px; padding: 1.15rem;">
                    <div style="font-size: 1.4rem; margin-bottom: 0.35rem;">👁️</div>
                    <h4 style="color: #38bdf8; margin: 0 0 0.35rem; font-size: 1rem;">1. Percepción Espacial</h4>
                    <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.5; margin: 0;">
                        Sensor Ultrasónico <strong>HC-SR04</strong> montado sobre el brazo del servomotor para calcular distancia por ecolocalización.
                    </p>
                </div>

                <!-- 2. Movimiento -->
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 14px; padding: 1.15rem;">
                    <div style="font-size: 1.4rem; margin-bottom: 0.35rem;">🎯</div>
                    <h4 style="color: #fbbf24; margin: 0 0 0.35rem; font-size: 1rem;">2. Posicionamiento</h4>
                    <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.5; margin: 0;">
                        Micro Servomotor <strong>SG90</strong> que realiza el escaneo angular continuo de 0° a 180° en pasos controlados.
                    </p>
                </div>

                <!-- 3. Alarma Acústica -->
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 14px; padding: 1.15rem;">
                    <div style="font-size: 1.4rem; margin-bottom: 0.35rem;">🚨</div>
                    <h4 style="color: #34d399; margin: 0 0 0.35rem; font-size: 1rem;">3. Disuasión Acústica</h4>
                    <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.5; margin: 0;">
                        <strong>Buzzer Pasivo</strong> que modula una sirena de dos tonos con frecuencias alternas (800 Hz y 1200 Hz).
                    </p>
                </div>

                <!-- 4. Señalización Lumínica -->
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 14px; padding: 1.15rem;">
                    <div style="font-size: 1.4rem; margin-bottom: 0.35rem;">💡</div>
                    <h4 style="color: #f87171; margin: 0 0 0.35rem; font-size: 1rem;">4. Señalización Óptica</h4>
                    <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.5; margin: 0;">
                        <strong>LEDs Verde (Vigilancia) y Rojo (Alarma)</strong> que indican visualmente el nivel de amenaza en el sector.
                    </p>
                </div>
            </div>

            <!-- PLACEHOLDER IMAGEN 1: Esquema de Bloques y Montaje Físico del Radar -->
            <div style="background: rgba(15, 23, 42, 0.7); border: 1.5px dashed rgba(56, 189, 248, 0.35); border-radius: 16px; padding: 1.5rem; margin: 1.5rem 0; text-align: center;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; background: rgba(56, 189, 248, 0.12); color: #38bdf8; margin-bottom: 0.5rem;">
                    📡
                </div>
                <h4 style="color: #38bdf8; margin: 0.25rem 0 0.4rem; font-size: 1.05rem;">Diagrama: Arquitectura y Montaje del Radar Ultrasónico con Servo</h4>
                <p style="color: #94a3b8; font-size: 0.85rem; margin: 0; line-height: 1.5;">
                    [Espacio reservado para Ilustración 3D / Fotografía: Soporte impreso en 3D acoplando el HC-SR04 al rotor del servomotor SG90]
                </p>
            </div>
        </div>

        <!-- 2. DIAGRAMA DE CONEXIÓN Y TABLA DE PINES -->
        <div class="theory-section">
            <h3 id="re-m3-4-2">2. Diagrama de Conexión y Asignación de Pines</h3>
            <p>Asegúrate de conectar todos los componentes a los pines digitales designados:</p>

            <div style="background: rgba(15, 23, 42, 0.7); padding: 1.25rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); margin: 1.25rem 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; color: #cbd5e1;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #38bdf8; text-align: left;">
                            <th style="padding: 0.55rem;">Componente</th>
                            <th style="padding: 0.55rem;">Pin del Módulo</th>
                            <th style="padding: 0.55rem;">Pin Arduino</th>
                            <th style="padding: 0.55rem;">Tipo de Señal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 0.55rem; font-weight: bold; color: #38bdf8;">Servomotor SG90</td>
                            <td style="padding: 0.55rem;">Señal (Naranja/Amarillo)</td>
                            <td style="padding: 0.55rem; font-weight: bold; color: #fbbf24;">Pin D9</td>
                            <td style="padding: 0.55rem;">Salida PWM Servo (50 Hz)</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 0.55rem; font-weight: bold; color: #38bdf8;">Sensor HC-SR04</td>
                            <td style="padding: 0.55rem;">TRIG (Disparo)</td>
                            <td style="padding: 0.55rem; font-weight: bold; color: #fbbf24;">Pin D10</td>
                            <td style="padding: 0.55rem;">Salida Digital (Pulso 10 µs)</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 0.55rem; font-weight: bold; color: #38bdf8;">Sensor HC-SR04</td>
                            <td style="padding: 0.55rem;">ECHO (Receptor)</td>
                            <td style="padding: 0.55rem; font-weight: bold; color: #fbbf24;">Pin D11</td>
                            <td style="padding: 0.55rem;">Entrada Digital (pulseIn)</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 0.55rem; font-weight: bold; color: #34d399;">Buzzer Pasivo</td>
                            <td style="padding: 0.55rem;">Ánodo (+)</td>
                            <td style="padding: 0.55rem; font-weight: bold; color: #fbbf24;">Pin D8</td>
                            <td style="padding: 0.55rem;">Salida Tono (tone / noTone)</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 0.55rem; font-weight: bold; color: #34d399;">LED Verde (Seguro)</td>
                            <td style="padding: 0.55rem;">Ánodo (+ con resistor 220Ω)</td>
                            <td style="padding: 0.55rem; font-weight: bold; color: #fbbf24;">Pin D6</td>
                            <td style="padding: 0.55rem;">Salida Digital (HIGH/LOW)</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.55rem; font-weight: bold; color: #f87171;">LED Rojo (Alarma)</td>
                            <td style="padding: 0.55rem;">Ánodo (+ con resistor 220Ω)</td>
                            <td style="padding: 0.55rem; font-weight: bold; color: #fbbf24;">Pin D7</td>
                            <td style="padding: 0.55rem;">Salida Digital (HIGH/LOW)</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- PLACEHOLDER IMAGEN 2: Esquema Breadboard Completo Fritzing -->
            <div style="background: rgba(15, 23, 42, 0.7); border: 1.5px dashed rgba(245, 158, 11, 0.35); border-radius: 16px; padding: 1.5rem; margin: 1.5rem 0; text-align: center;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; background: rgba(245, 158, 11, 0.12); color: #fbbf24; margin-bottom: 0.5rem;">
                    🔌
                </div>
                <h4 style="color: #fbbf24; margin: 0.25rem 0 0.4rem; font-size: 1.05rem;">Diagrama: Circuito Breadboard Completo de Conexión con Arduino Uno</h4>
                <p style="color: #94a3b8; font-size: 0.85rem; margin: 0; line-height: 1.5;">
                    [Espacio reservado para Esquema Fritzing: Conexiones de Servo, HC-SR04, Buzzer con Resistencia y 2 LEDs a la Protoboard]
                </p>
            </div>
        </div>

        <!-- 3. MÁQUINA DE ESTADOS DEL PROYECTO -->
        <div class="theory-section">
            <h3 id="re-m3-4-3">3. Lógica de Control: Máquina de Estados del Radar</h3>
            <p>El comportamiento autónomo del radar se modela mediante dos estados principales:</p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin: 1.5rem 0;">
                <!-- Estado ESCANEANDO -->
                <div style="background: rgba(56, 189, 248, 0.08); border: 1.5px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 1.25rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h4 style="color: #38bdf8; margin: 0; font-size: 1.05rem;">Estado: ESCANEANDO</h4>
                        <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold;">Patrullaje Activo</span>
                    </div>
                    <ul style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.7; margin: 0; padding-left: 1.2rem;">
                        <li>El servomotor avanza paso a paso de 0° a 180° y de regreso.</li>
                        <li>El LED Verde permanece encendido y el Buzzer en silencio.</li>
                        <li>En cada ángulo se mide la distancia. Si la distancia es menor al umbral crítico (ej. $&lt; 20\,\text{cm}$ y $&gt; 0\,\text{cm}$), transita inmediatamente a <strong>ALARMA</strong>.</li>
                    </ul>
                </div>

                <!-- Estado ALARMA -->
                <div style="background: rgba(239, 68, 68, 0.08); border: 1.5px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 1.25rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h4 style="color: #f87171; margin: 0; font-size: 1.05rem;">Estado: ALARMA</h4>
                        <span style="background: rgba(239, 68, 68, 0.15); color: #f87171; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold;">Intruso Detectado</span>
                    </div>
                    <ul style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.7; margin: 0; padding-left: 1.2rem;">
                        <li>El servomotor detiene su barrido, bloqueando su ángulo hacia el intruso.</li>
                        <li>Se apaga el LED Verde y el LED Rojo destella en estroboscópico.</li>
                        <li>El Buzzer emite una sirena modulada alterna de alta frecuencia.</li>
                        <li>Si el intruso se retira durante 3 segundos continuos, el sistema se desarma y regresa a <strong>ESCANEANDO</strong>.</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- 4. CÓDIGO FUENTE MAESTRO COMPLETO -->
        <div class="theory-section">
            <h3 id="re-m3-4-4">4. Código Fuente Maestro en C++</h3>
            <p>A continuación se presenta el sketch modular completo con temporización basada en <code>millis()</code> y modularización por funciones:</p>

            <pre style="background: rgba(15, 23, 42, 0.9); padding: 1.25rem; border-radius: 16px; border: 1px solid rgba(56, 189, 248, 0.25); overflow-x: auto;"><code style="color: #e2e8f0;">// ============================================================================
// PROYECTO INTEGRADOR: RADAR DE VIGILANCIA Y ALARMA INTELIGENTE
// ============================================================================
#include &lt;Servo.h&gt;

// Definición de Pines de Hardware
const int SERVO_PIN   = 9;
const int TRIG_PIN    = 10;
const int ECHO_PIN    = 11;
const int BUZZER_PIN  = 8;
const int LED_VERDE   = 6;
const int LED_ROJO    = 7;

// Parámetros de Operación
const int UMBRAL_DISTANCIA = 20; // Distancia de disparo en cm
Servo radarServo;

// Variables de Control de Estado
enum EstadoSistema { ESCANEANDO, ALARMA };
EstadoSistema estadoActual = ESCANEANDO;

int anguloActual = 0;
int incrementoAngulo = 2; // Avance de 2° en cada paso

unsigned long tiempoPrevioServo = 0;
const unsigned long INTERVALO_SERVO = 30; // 30 ms por paso angular

unsigned long tiempoPrevioAlarma = 0;
bool tonoAlto = false;

// ----------------------------------------------------------------------------
// Función para medir distancia precisa en centímetros
// ----------------------------------------------------------------------------
long medirDistancia() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duracion = pulseIn(ECHO_PIN, HIGH, 25000); // Timeout de 25 ms (~4 metros)
  if (duracion == 0) return 999; // Sin eco en el rango
  return (duracion * 0.0343) / 2;
}

// ----------------------------------------------------------------------------
// Función para ejecutar la sirena de dos tonos de la alarma
// ----------------------------------------------------------------------------
void ejecutarSirena() {
  if (millis() - tiempoPrevioAlarma &gt;= 150) {
    tiempoPrevioAlarma = millis();
    tonoAlto = !tonoAlto;

    if (tonoAlto) {
      tone(BUZZER_PIN, 1200);
      digitalWrite(LED_ROJO, HIGH);
    } else {
      tone(BUZZER_PIN, 800);
      digitalWrite(LED_ROJO, LOW);
    }
  }
}

void setup() {
  radarServo.attach(SERVO_PIN);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);

  Serial.begin(9600);
  Serial.println("--- Sistema de Radar y Alarma Inicializado ---");
  radarServo.write(0);
}

void loop() {
  switch (estadoActual) {
    case ESCANEANDO:
      digitalWrite(LED_VERDE, HIGH);
      digitalWrite(LED_ROJO, LOW);
      noTone(BUZZER_PIN);

      // Barrido del servomotor no bloqueante
      if (millis() - tiempoPrevioServo &gt;= INTERVALO_SERVO) {
        tiempoPrevioServo = millis();

        anguloActual += incrementoAngulo;
        if (anguloActual &gt;= 180 || anguloActual &lt;= 0) {
          incrementoAngulo = -incrementoAngulo; // Invertir sentido de giro
        }
        radarServo.write(anguloActual);

        // Medir distancia en el ángulo actual
        long d = medirDistancia();
        Serial.print("Angulo: ");
        Serial.print(anguloActual);
        Serial.print("° | Distancia: ");
        Serial.print(d);
        Serial.println(" cm");

        // Evaluar condición de intrusión
        if (d &gt; 0 &amp;&amp; d &lt;= UMBRAL_DISTANCIA) {
          Serial.println("¡¡INTRUSO DETECTADO!! Activando Alarma...");
          estadoActual = ALARMA;
        }
      }
      break;

    case ALARMA:
      digitalWrite(LED_VERDE, LOW);
      ejecutarSirena();

      // Comprobar continuamente si el intruso se retiró
      long dActual = medirDistancia();
      if (dActual &gt; UMBRAL_DISTANCIA || dActual == 999) {
        Serial.println("Zona despejada. Restableciendo patrullaje...");
        noTone(BUZZER_PIN);
        estadoActual = ESCANEANDO;
      }
      break;
  }
}</code></pre>
        </div>
    `,
    sections: [
        { id: 're-m3-4-1', title: '1. Arquitectura del Sistema' },
        { id: 're-m3-4-2', title: '2. Diagrama y Tabla de Pines' },
        { id: 're-m3-4-3', title: '3. Máquina de Estados del Radar' },
        { id: 're-m3-4-4', title: '4. Código Fuente Maestro en C++' }
    ],
    flashcards: [
        {
            id: 'f1',
            type: 'theory',
            q: '¿Qué 4 subsistemas mecatrónicos interactúan en el proyecto integrador?',
            a: 'Percepción (HC-SR04), Posicionamiento (Servo), Acústica (Buzzer) y Óptica (LEDs)',
            sub: 'Todos coordinados por una Máquina de Estados Finitos en Arduino C++.',
            sectionId: 're-m3-4-1'
        },
        {
            id: 'f2',
            type: 'hw',
            q: '¿Por qué se monta el sensor ultrasónico sobre el brazo del servomotor?',
            a: 'Para ampliar el campo de visión del sensor y realizar un escaneo radial de 180°',
            sub: 'Convierte un sensor unidireccional en un radar de barrido angular completo.',
            sectionId: 're-m3-4-1'
        },
        {
            id: 'f3',
            type: 'code',
            q: '¿Por qué se utiliza pulseIn con un tercer parámetro de timeout (ej. 25000 µs)?',
            a: 'Para evitar que el código espere 1 segundo completo si no hay ningún obstáculo',
            sub: 'Limita la espera máxima a ~4 metros, manteniendo el escaneo fluido y veloz.',
            sectionId: 're-m3-4-4'
        },
        {
            id: 'f4',
            type: 'code',
            q: '¿Cómo se invierte el sentido de giro del servomotor al llegar a los extremos?',
            a: 'Invirtiendo el signo de la variable: incrementoAngulo = -incrementoAngulo;',
            sub: 'Al llegar a 180° empieza a restar, y al llegar a 0° vuelve a sumar.',
            sectionId: 're-m3-4-4'
        },
        {
            id: 'f5',
            type: 'theory',
            q: '¿Cuáles son los dos estados operativos del sistema en la FSM?',
            a: 'ESCANEANDO (Patrullaje normal) y ALARMA (Intruso fijado)',
            sub: 'Permite un comportamiento predictivo y desacoplado de la lógica.',
            sectionId: 're-m3-4-3'
        },
        {
            id: 'f6',
            type: 'code',
            q: '¿Cómo genera la función ejecutarSirena() el efecto de sirena de policía?',
            a: 'Alternando periódicamente entre 800 Hz y 1200 Hz usando millis()',
            sub: 'El cambio de frecuencia cada 150 ms crea el efecto acústico de alarma de emergencia.',
            sectionId: 're-m3-4-4'
        },
        {
            id: 'f7',
            type: 'hw',
            q: '¿Qué pines digitales utiliza el proyecto para el Servo, Trigger, Echo y Buzzer?',
            a: 'Servo en D9, Trigger en D10, Echo en D11 y Buzzer en D8',
            sub: 'Los LEDs Verde y Rojo se conectan a los pines D6 y D7 con sus resistores.',
            sectionId: 're-m3-4-2'
        },
        {
            id: 'f8',
            type: 'code',
            q: '¿Qué sucede con el servomotor cuando el sistema entra en estado de ALARMA?',
            a: 'Detiene su barrido y mantiene su ángulo apuntando directamente al intruso',
            sub: 'Fija el objetivo mientras la sirena y los LEDs estroboscópicos están activos.',
            sectionId: 're-m3-4-3'
        },
        {
            id: 'f9',
            type: 'theory',
            q: '¿Por qué es indispensable usar millis() en lugar de delay() en este proyecto?',
            a: 'Para mover el servo, medir distancia y sonar la sirena simultáneamente sin trabas',
            sub: 'Cualquier delay() congelaría la lectura del sensor y haría fallar la detección.',
            sectionId: 're-m3-4-1'
        },
        {
            id: 'f10',
            type: 'code',
            q: '¿Qué condición matemática dispara la transición al estado de ALARMA?',
            a: 'distancia > 0 && distancia <= UMBRAL_DISTANCIA (ej. <= 20 cm)',
            sub: 'Descarta lecturas erróneas de 0 cm y detecta cualquier objeto dentro del perímetro.',
            sectionId: 're-m3-4-4'
        }
    ],
    questions: [
        {
            id: 'q1',
            question: 'En el proyecto del radar, ¿cuál es el propósito de acoplar mecánicamente el sensor HC-SR04 al servomotor?',
            options: [
                'Lograr un escaneo angular panorámico de 180° que cubra toda el área frontal',
                'Aumentar la velocidad del sonido a 680 m/s',
                'Evitar el uso de cables hacia el microcontrolador',
                'Alimentar el sensor con la energía generada por el motor'
            ],
            correct: 0,
            explanation: 'Al girar el servo de 0° a 180°, el haz ultrasónico barre todo el sector angular convirtiéndose en un radar de proximidad.'
        },
        {
            id: 'q2',
            question: '¿Por qué se recomienda utilizar `pulseIn(ECHO_PIN, HIGH, 25000)` con timeout en el radar?',
            options: [
                'Para no esperar 1 segundo cuando no hay eco y mantener el barrido ágil y continuo',
                'Para calibrar la frecuencia del buzzer a 25 kHz',
                'Para aumentar el torque del servo SG90',
                'Porque es un requisito de la librería Servo.h'
            ],
            correct: 0,
            explanation: 'Por defecto, `pulseIn` espera hasta 1,000,000 µs (1 segundo). Añadir un timeout de 25,000 µs limita el alcance a ~4 metros y evita ralentizar el barrido.'
        },
        {
            id: 'q3',
            question: '¿Cómo se genera el efecto de sirena modulada en el buzzer pasivo sin usar la función delay()?',
            options: [
                'Alternando entre dos frecuencias (ej. 800 Hz y 1200 Hz) con un temporizador basado en millis()',
                'Cambiando el voltaje de 5V a 12V con un potenciómetro',
                'Usando un bucle while(true) infinito',
                'Apagando y prendiendo la placa de Arduino'
            ],
            correct: 0,
            explanation: 'Un temporizador no bloqueante con `millis()` conmuta los tonos cada 150 ms sin detener el resto del programa.'
        },
        {
            id: 'q4',
            question: 'En el estado de ALARMA, ¿qué comportamiento adopta el servomotor del radar?',
            options: [
                'Se detiene y mantiene la posición angular apuntando al intruso',
                'Gira a máxima velocidad en 360° continuos',
                'Regresa inmediatamente a 0°',
                'Se desconecta físicamente con detach()'
            ],
            correct: 0,
            explanation: 'El servo suspende el barrido angular y se queda fijo en la última posición donde detectó la presencia del objeto.'
        },
        {
            id: 'q5',
            question: '¿Cuál es la técnica utilizada para invertir el sentido de barrido al alcanzar 180° o 0°?',
            options: [
                '`incrementoAngulo = -incrementoAngulo;`',
                '`radarServo.write(-180);`',
                '`radarServo.reverse();`',
                '`digitalWrite(SERVO_PIN, LOW);`'
            ],
            correct: 0,
            explanation: 'Multiplicar el incremento por -1 invierte la dirección de la suma en cada iteración del bucle.'
        },
        {
            id: 'q6',
            question: 'Si se define `const int UMBRAL_DISTANCIA = 20;`, ¿cuándo se activará la alarma?',
            options: [
                'Cuando un objeto se encuentre a 20 cm o menos del sensor',
                'Solo cuando el objeto toque físicamente el sensor a 0 cm',
                'Cuando el objeto esté a más de 20 metros',
                'Exactamente a los 20 segundos de encendido'
            ],
            correct: 0,
            explanation: 'La condición `d > 0 && d <= UMBRAL_DISTANCIA` dispara la alarma ante cualquier presencia dentro del radio de 20 cm.'
        },
        {
            id: 'q7',
            question: '¿Por qué se conectan los LEDs Verde y Rojo con resistencias de 220 Ω en serie?',
            options: [
                'Para limitar la corriente directa y proteger tanto los LEDs como los pines de Arduino',
                'Para cambiar el color de la luz emitida',
                'Para sincronizar el parpadeo con el buzzer',
                'Para transformar la señal digital en PWM'
            ],
            correct: 0,
            explanation: 'La resistencia en serie limita la corriente a unos ~15 mA, impidiendo que el LED o el pin de salida se quemen por sobrecorriente.'
        },
        {
            id: 'q8',
            question: '¿Qué información envía el radar a través del Monitor Serie durante el patrullaje?',
            options: [
                'El ángulo actual en grados y la distancia medida en centímetros',
                'El consumo de corriente de la batería en miliamperios',
                'El código hexadecimal de la memoria RAM',
                'El estado de los temporizadores de hardware'
            ],
            correct: 0,
            explanation: 'La telemetría imprime en cada paso el ángulo del servo (0° a 180°) y la distancia del objeto detectado para monitoreo o graficación.'
        },
        {
            id: 'q9',
            question: '¿Qué condición devuelve al sistema desde el estado ALARMA al estado ESCANEANDO?',
            options: [
                'Que la distancia medida sea mayor al umbral de seguridad (zona despejada)',
                'Presionar el botón de reset de la placa',
                'Esperar 10 minutos exactos',
                'Desconectar el cable USB'
            ],
            correct: 0,
            explanation: 'Cuando el sensor detecta que el intruso se retiró (`dActual > UMBRAL_DISTANCIA`), apaga la sirena y reanuda el barrido de vigilancia.'
        },
        {
            id: 'q10',
            question: '¿Qué ventaja ofrece estructurar este proyecto con una Máquina de Estados Finitos (FSM)?',
            options: [
                'Hace que el código sea modular, predecible, fácil de depurar y expandible con nuevos estados',
                'Reduce a la mitad el tamaño del servomotor',
                'Elimina la necesidad de usar cables de tierra (GND)',
                'Permite que el Arduino funcione sin batería'
            ],
            correct: 0,
            explanation: 'Una FSM organiza el código en comportamientos lógicos claros (Escaneo vs Alarma) evitando bloques anidados confusos de condicionales `if-else`.'
        }
    ]
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 're-m3-l4-content',
                content: lessonDefinition.content
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 're-m3-l4-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        prueba: [
            createQuizBlock({
                id: 're-m3-l4-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions
            })
        ]
    }
});
