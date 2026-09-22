import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Buzzers Activos vs Pasivos: Frecuencias, Tonos y Melodías',
    content: `
        <div class="lesson-intro">
            <p>La retroalimentación acústica es fundamental para que un robot comunique su estado interno: confirmación de órdenes, advertencia de batería baja, alertas de colisión inminente o reproducción de melodías. En esta lección dominarás la diferencia física y operativa entre un <strong>Buzzer Activo</strong> y un <strong>Buzzer Pasivo</strong>, el principio piezoeléctrico, las funciones nativas <code>tone()</code> / <code>noTone()</code> y cómo programar partituras musicales en Arduino C++.</p>
        </div>

        <!-- 1. PRINCIPIO FÍSICO PIEZOELÉCTRICO -->
        <div class="theory-section">
            <h3 id="re-m3-2-1">1. ¿Qué es un Buzzer y el Efecto Piezoeléctrico Inverso?</h3>
            <p>Un <strong>buzzer</strong> (o zumbador) es un transductor electroacústico. En su interior contiene un disco bimetálico y una pastilla de material cerámico piezoeléctrico (como el Titanato de Circonio y Plomo - PZT).</p>

            <div style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0;">
                <h4 style="color: #38bdf8; margin-top: 0; margin-bottom: 0.4rem;">El Efecto Piezoeléctrico Inverso:</h4>
                <p style="color: #cbd5e1; font-size: 0.92rem; line-height: 1.7; margin: 0;">
                    Cuando se aplica un voltaje alterno variable a través del cristal piezoeléctrico, este se <strong>expande y contrae mecánicamente</strong> al ritmo de la señal eléctrica. Esta rápida vibración empuja el aire circundante, generando <strong>ondas de presión sonora</strong> que nuestros oídos perciben como un tono musical o zumbido.
                </p>
            </div>

            <!-- PLACEHOLDER IMAGEN 1: Efecto Piezoeléctrico y Diafragma del Buzzer -->
            <div style="background: rgba(15, 23, 42, 0.7); border: 1.5px dashed rgba(56, 189, 248, 0.35); border-radius: 16px; padding: 1.5rem; margin: 1.5rem 0; text-align: center;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; background: rgba(56, 189, 248, 0.12); color: #38bdf8; margin-bottom: 0.5rem;">
                    🔊
                </div>
                <h4 style="color: #38bdf8; margin: 0.25rem 0 0.4rem; font-size: 1.05rem;">Diagrama: Anatomía Interna de un Transductor Piezoeléctrico</h4>
                <p style="color: #94a3b8; font-size: 0.85rem; margin: 0; line-height: 1.5;">
                    [Espacio reservado para Ilustración Técnica: Disco cerámico piezoeléctrico, diafragma metálico y cavidad resonante]
                </p>
            </div>
        </div>

        <!-- 2. COMPARATIVA TÉCNICA: BUZZER ACTIVO VS PASIVO -->
        <div class="theory-section">
            <h3 id="re-m3-2-2">2. Gran Comparativa: Buzzer Activo vs Buzzer Pasivo</h3>
            <p>Aunque exteriormente lucen casi idénticos (cilindros negros con dos pines), su funcionamiento electrónico es completamente diferente:</p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin: 1.5rem 0;">
                <!-- Buzzer Activo -->
                <div style="background: rgba(15, 23, 42, 0.75); border: 1.5px solid rgba(245, 158, 11, 0.3); border-radius: 16px; padding: 1.25rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h4 style="color: #fbbf24; margin: 0; font-size: 1.1rem;">Buzzer Activo (Con Oscilador)</h4>
                        <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold;">Tono Fijo / Plug & Play</span>
                    </div>
                    <ul style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.7; margin: 0; padding-left: 1.2rem;">
                        <li><strong>Circuito interno:</strong> Incluye un oscilador integrado de frecuencia fija (aprox. 2.5 kHz).</li>
                        <li><strong>Forma de control:</strong> Solo requiere corriente continua (DC). Al enviar <code>digitalWrite(pin, HIGH)</code> suena automáticamente.</li>
                        <li><strong>Flexibilidad sonora:</strong> NULA. No puede cambiar de frecuencia ni tocar notas musicales. Solo suena en su frecuencia fija o se apaga.</li>
                        <li><strong>Identificación física:</strong> Suele venir con una pegatina protectora en el orificio superior y resina negra sellando la base.</li>
                    </ul>
                </div>

                <!-- Buzzer Pasivo -->
                <div style="background: rgba(15, 23, 42, 0.75); border: 1.5px solid rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 1.25rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h4 style="color: #34d399; margin: 0; font-size: 1.1rem;">Buzzer Pasivo (Altavoz Piezo)</h4>
                        <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold;">Multitono / Melodías</span>
                    </div>
                    <ul style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.7; margin: 0; padding-left: 1.2rem;">
                        <li><strong>Circuito interno:</strong> NO tiene oscilador interno (es un diafragma piezoeléctrico puro).</li>
                        <li><strong>Forma de control:</strong> Requiere una onda cuadrada AC. Si aplicas 5V continuo solo escucharás un "click" metálico sordo.</li>
                        <li><strong>Flexibilidad sonora:</strong> TOTAL. Puede reproducir cualquier frecuencia audible (de 31 Hz a 65535 Hz) usando <code>tone()</code>.</li>
                        <li><strong>Identificación física:</strong> Fondo con placa de circuito impreso (PCB verde) visible por debajo.</li>
                    </ul>
                </div>
            </div>

            <!-- Tabla Comparativa Rápida -->
            <div style="background: rgba(15, 23, 42, 0.7); padding: 1.25rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); margin: 1.25rem 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; color: #cbd5e1;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #38bdf8; text-align: left;">
                            <th style="padding: 0.6rem;">Característica</th>
                            <th style="padding: 0.6rem;">Buzzer Activo</th>
                            <th style="padding: 0.6rem;">Buzzer Pasivo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 0.6rem; font-weight: bold;">Oscilador Interno</td>
                            <td style="padding: 0.6rem; color: #34d399;">SÍ (Integrado)</td>
                            <td style="padding: 0.6rem; color: #ef4444;">NO (Requiere señal externa)</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 0.6rem; font-weight: bold;">Instrucción de Control</td>
                            <td style="padding: 0.6rem; font-family: monospace; color: #fbbf24;">digitalWrite(pin, HIGH);</td>
                            <td style="padding: 0.6rem; font-family: monospace; color: #34d399;">tone(pin, frecuencia);</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 0.6rem; font-weight: bold;">Capacidad de Melodías</td>
                            <td style="padding: 0.6rem; color: #ef4444;">No (Solo un tono fijo)</td>
                            <td style="padding: 0.6rem; color: #34d399;">Sí (Toda la escala musical)</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.6rem; font-weight: bold;">Consumo de CPU</td>
                            <td style="padding: 0.6rem;">0% (Autónomo)</td>
                            <td style="padding: 0.6rem;">Mínimo (Usa Timer de Hardware)</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- PLACEHOLDER IMAGEN 2: Comparativa visual inferior Activo vs Pasivo -->
            <div style="background: rgba(15, 23, 42, 0.7); border: 1.5px dashed rgba(245, 158, 11, 0.35); border-radius: 16px; padding: 1.5rem; margin: 1.5rem 0; text-align: center;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; background: rgba(245, 158, 11, 0.12); color: #fbbf24; margin-bottom: 0.5rem;">
                    🔍
                </div>
                <h4 style="color: #fbbf24; margin: 0.25rem 0 0.4rem; font-size: 1.05rem;">Diagrama: Cómo Diferenciar Visualmente un Buzzer Activo de uno Pasivo</h4>
                <p style="color: #94a3b8; font-size: 0.85rem; margin: 0; line-height: 1.5;">
                    [Espacio reservado para Fotografía Comparativa: Base sellada con resina negra vs Base abierta con circuito impreso PCB verde]
                </p>
            </div>
        </div>

        <!-- 3. FUNCIONES TONE() Y NOTONE() EN ARDUINO -->
        <div class="theory-section">
            <h3 id="re-m3-2-3">3. Las Funciones Nativas tone() y noTone()</h3>
            <p>Para controlar un buzzer pasivo, Arduino proporciona dos funciones nativas optimizadas que utilizan un temporizador interno (Timer 2) para generar ondas cuadradas con ciclo de trabajo exacto del 50% (50% HIGH y 50% LOW):</p>

            <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 16px; padding: 1.25rem; margin: 1.25rem 0;">
                <h4 style="color: #38bdf8; margin-top: 0; margin-bottom: 0.6rem;">Sintaxis de tone():</h4>
                <pre style="background: rgba(0, 0, 0, 0.4); padding: 0.9rem; border-radius: 10px; margin: 0 0 0.75rem 0;"><code style="color: #38bdf8; font-size: 0.95rem;">tone(pin, frecuencia);             // Tono continuo indefinido
tone(pin, frecuencia, duracion);   // Tono con duración en milisegundos (no bloqueante)</code></pre>
                <ul style="color: #cbd5e1; font-size: 0.86rem; line-height: 1.6; margin: 0; padding-left: 1.2rem;">
                    <li><strong>pin:</strong> El pin digital donde está conectado el polo positivo del buzzer (ej. Pin 8).</li>
                    <li><strong>frecuencia:</strong> La frecuencia del tono expresada en <strong>Hercios (Hz)</strong> (entero sin signo de 31 Hz a 65535 Hz).</li>
                    <li><strong>duracion (opcional):</strong> Tiempo de emisión en milisegundos. Si se omite, sonará hasta llamar a <code>noTone(pin);</code>.</li>
                </ul>
            </div>

            <div style="background: rgba(239, 68, 68, 0.08); border-left: 4px solid #ef4444; border-radius: 12px; padding: 1.1rem; margin: 1.25rem 0;">
                <h4 style="color: #f87171; margin-top: 0; margin-bottom: 0.4rem;">Sintaxis de noTone():</h4>
                <pre style="background: rgba(0, 0, 0, 0.4); padding: 0.7rem; border-radius: 8px; margin: 0.4rem 0;"><code style="color: #f87171; font-size: 0.92rem;">noTone(pin); // Detiene inmediatamente la oscilación acústica</code></pre>
                <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.5; margin: 0;">
                    <em>Importante:</em> Solo se puede generar un tono a la vez en una placa Arduino Uno estándar. Si llamas a <code>tone()</code> en otro pin sin haber llamado a <code>noTone()</code> en el anterior, la segunda llamada no tendrá efecto.
                </p>
            </div>
        </div>

        <!-- 4. FRECUENCIAS MUSICALES Y PROGRAMACIÓN DE MELODÍAS -->
        <div class="theory-section">
            <h3 id="re-m3-2-4">4. Frecuencias Musicales y Reproducción de Melodías</h3>
            <p>Cada nota de la escala musical temperada occidental corresponde a una frecuencia exacta en Hercios (Hz):</p>

            <!-- Tabla de Notas Musicales Clave (Octava 4) -->
            <div style="background: rgba(15, 23, 42, 0.7); padding: 1.25rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); margin: 1.25rem 0;">
                <h4 style="color: #fbbf24; margin-top: 0; margin-bottom: 0.6rem;">Frecuencias de la Octava Central (Escala 4):</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 0.5rem; text-align: center;">
                    <div style="background: rgba(255,255,255,0.03); padding: 0.6rem; border-radius: 8px; border: 1px solid rgba(56,189,248,0.2);">
                        <div style="font-weight: 800; color: #38bdf8;">DO (C4)</div>
                        <div style="font-family: monospace; color: #94a3b8; font-size: 0.85rem;">262 Hz</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 0.6rem; border-radius: 8px; border: 1px solid rgba(56,189,248,0.2);">
                        <div style="font-weight: 800; color: #38bdf8;">RE (D4)</div>
                        <div style="font-family: monospace; color: #94a3b8; font-size: 0.85rem;">294 Hz</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 0.6rem; border-radius: 8px; border: 1px solid rgba(56,189,248,0.2);">
                        <div style="font-weight: 800; color: #38bdf8;">MI (E4)</div>
                        <div style="font-family: monospace; color: #94a3b8; font-size: 0.85rem;">330 Hz</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 0.6rem; border-radius: 8px; border: 1px solid rgba(56,189,248,0.2);">
                        <div style="font-weight: 800; color: #38bdf8;">FA (F4)</div>
                        <div style="font-family: monospace; color: #94a3b8; font-size: 0.85rem;">349 Hz</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 0.6rem; border-radius: 8px; border: 1px solid rgba(56,189,248,0.2);">
                        <div style="font-weight: 800; color: #38bdf8;">SOL (G4)</div>
                        <div style="font-family: monospace; color: #94a3b8; font-size: 0.85rem;">392 Hz</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 0.6rem; border-radius: 8px; border: 1px solid rgba(56,189,248,0.2);">
                        <div style="font-weight: 800; color: #38bdf8;">LA (A4)</div>
                        <div style="font-family: monospace; color: #34d399;">440 Hz (Diapasón)</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 0.6rem; border-radius: 8px; border: 1px solid rgba(56,189,248,0.2);">
                        <div style="font-weight: 800; color: #38bdf8;">SI (B4)</div>
                        <div style="font-family: monospace; color: #94a3b8; font-size: 0.85rem;">494 Hz</div>
                    </div>
                </div>
            </div>

            <!-- Código Maestro: Melodía con Arrays y Cálculos de Duración -->
            <pre style="background: rgba(15, 23, 42, 0.85); padding: 1.25rem; border-radius: 16px; border: 1px solid rgba(56, 189, 248, 0.25); overflow-x: auto;"><code style="color: #e2e8f0;">// Código Maestro: Reproductor de Melodía con Buzzer Pasivo
const int BUZZER_PIN = 8;

// Definición de notas en Hercios (Hz)
#define NOTE_C4  262
#define NOTE_D4  294
#define NOTE_E4  330
#define NOTE_F4  349
#define NOTE_G4  392
#define NOTE_A4  440
#define NOTE_B4  494
#define NOTE_C5  523

// Partitura: Secuencia de Notas
int melodia[] = {
  NOTE_C4, NOTE_D4, NOTE_E4, NOTE_F4, NOTE_G4, NOTE_A4, NOTE_B4, NOTE_C5
};

// Duraciones relativas: 4 = Negra, 8 = Corchea, 2 = Blanca
int duraciones[] = {
  4, 4, 4, 4, 4, 4, 4, 2
};

void setup() {
  // Reproducimos la escala al encender
  int totalNotas = sizeof(melodia) / sizeof(melodia[0]);

  for (int i = 0; i &lt; totalNotas; i++) {
    // Calculamos duración en milisegundos (1000 ms / tipo de nota)
    int duracionNota = 1000 / duraciones[i];
    tone(BUZZER_PIN, melodia[i], duracionNota);

    // Pequeña pausa entre notas para distinguirlas acústicamente (+30%)
    int pausaEntreNotas = duracionNota * 1.30;
    delay(pausaEntreNotas);

    noTone(BUZZER_PIN); // Detenemos el tono antes de la siguiente nota
  }
}

void loop() {
  // El loop queda disponible para otras tareas del robot
}</code></pre>
        </div>

        <!-- 5. CONEXIÓN ELÉCTRICA Y RESISTENCIA DE PROTECCIÓN -->
        <div class="theory-section">
            <h3 id="re-m3-2-5">5. Conexión Eléctrica y Circuito de Protección</h3>
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1.25rem; margin: 1.25rem 0;">
                <h4 style="color: #38bdf8; margin-top: 0; margin-bottom: 0.5rem;">🔌 Buenas Prácticas de Conexión:</h4>
                <ul style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.7; margin: 0; padding-left: 1.25rem;">
                    <li><strong>Resistencia en Serie ($100\,\Omega - 220\,\Omega$):</strong> Aunque un buzzer piezoeléctrico consume poca corriente (~20 mA), colocar un resistor en serie protege el pin de Arduino y reduce el volumen acústico si resulta excesivamente estridente en laboratorio.</li>
                    <li><strong>Polaridad:</strong> La pata más larga o el símbolo <code>+</code> serigrafiado debe conectarse al pin digital de Arduino; la pata corta va directo a GND.</li>
                    <li><strong>Amplificación con Transistor NPN (2N2222 / BC547):</strong> Si necesitas un volumen de alarma de alta potencia (ej. sirena de 85-100 dB a 12V), utiliza un transistor como interruptor conectando la base al pin de Arduino y el colector al buzzer alimentado con fuente externa.</li>
                </ul>
            </div>

            <!-- PLACEHOLDER IMAGEN 3: Conexión Buzzer Pasivo con Resistencia y Arduino -->
            <div style="background: rgba(15, 23, 42, 0.7); border: 1.5px dashed rgba(56, 189, 248, 0.35); border-radius: 16px; padding: 1.5rem; margin: 1.5rem 0; text-align: center;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; background: rgba(56, 189, 248, 0.12); color: #38bdf8; margin-bottom: 0.5rem;">
                    🎛️
                </div>
                <h4 style="color: #38bdf8; margin: 0.25rem 0 0.4rem; font-size: 1.05rem;">Diagrama: Conexión de Buzzer a Pin Digital D8 con Resistor de 220 Ω</h4>
                <p style="color: #94a3b8; font-size: 0.85rem; margin: 0; line-height: 1.5;">
                    [Espacio reservado para Esquema Fritzing: Conexión de Pin 8 ➔ Resistencia 220 Ω ➔ Terminal (+) Buzzer y Terminal (-) a GND]
                </p>
            </div>
        </div>
    `,
    sections: [
        { id: 're-m3-2-1', title: '1. Principio Físico Piezoeléctrico' },
        { id: 're-m3-2-2', title: '2. Comparativa: Buzzer Activo vs Pasivo' },
        { id: 're-m3-2-3', title: '3. Funciones tone() y noTone() en C++' },
        { id: 're-m3-2-4', title: '4. Frecuencias Musicales y Melodías' },
        { id: 're-m3-2-5', title: '5. Conexión Eléctrica y Protección' }
    ],
    flashcards: [
        {
            id: 'f1',
            type: 'theory',
            q: '¿Qué fenómeno físico permite a un buzzer piezoeléctrico emitir sonido?',
            a: 'El Efecto Piezoeléctrico Inverso',
            sub: 'La aplicación de un voltaje alterno deforma mecánicamente el cristal, generando ondas acústicas en el aire.',
            sectionId: 're-m3-2-1'
        },
        {
            id: 'f2',
            type: 'hw',
            q: '¿Cuál es la diferencia fundamental entre un buzzer activo y uno pasivo?',
            a: 'El activo incluye un oscilador interno fijo; el pasivo requiere una señal externa',
            sub: 'El activo solo suena con 5V continuo en un tono fijo; el pasivo puede tocar cualquier nota con tone().',
            sectionId: 're-m3-2-2'
        },
        {
            id: 'f3',
            type: 'code',
            q: '¿Qué sucede si envías una instrucción digitalWrite(pin, HIGH) a un buzzer pasivo?',
            a: 'Solo emite un leve "click" metálico sordo y queda en silencio',
            sub: 'Un buzzer pasivo necesita una señal oscilante alterna (pulsos cuadrados) para vibrar continuamente.',
            sectionId: 're-m3-2-2'
        },
        {
            id: 'f4',
            type: 'code',
            q: '¿Cuáles son los parámetros de la función tone(pin, frecuencia, duracion)?',
            a: 'Pin de salida, frecuencia en Hercios (Hz) y duración en milisegundos',
            sub: 'Genera una onda cuadrada al 50% de ciclo de trabajo en el pin indicado.',
            sectionId: 're-m3-2-3'
        },
        {
            id: 'f5',
            type: 'code',
            q: '¿Qué hace la función noTone(pin)?',
            a: 'Detiene de inmediato la oscilación acústica en el pin especificado',
            sub: 'Apaga la señal generada por tone() liberando el temporizador.',
            sectionId: 're-m3-2-3'
        },
        {
            id: 'f6',
            type: 'theory',
            q: '¿Cuál es la frecuencia del tono estándar de afinación musical (Nota LA4)?',
            a: '440 Hz (Hercios)',
            sub: 'Es el estándar internacional de afinación de diapasones e instrumentos acústicos.',
            sectionId: 're-m3-2-4'
        },
        {
            id: 'f7',
            type: 'code',
            q: '¿Por qué se introduce un delay(pausa) al tocar notas consecutivas en un bucle for?',
            a: 'Para crear una pequeña separación acústica que permita distinguir cada nota',
            sub: 'Tocar notas sin pausa hace que se fusionen en un único zumbido continuo e ininteligible.',
            sectionId: 're-m3-2-4'
        },
        {
            id: 'f8',
            type: 'hw',
            q: '¿Cómo se reconoce visualmente un buzzer pasivo por su parte inferior?',
            a: 'Tiene la placa de circuito impreso (PCB verde) expuesta y visible',
            sub: 'Los buzzers activos suelen venir sellados completamente con resina negra en la base.',
            sectionId: 're-m3-2-2'
        },
        {
            id: 'f9',
            type: 'hw',
            q: '¿Por qué se recomienda colocar una resistencia de 100 Ω a 220 Ω en serie con el buzzer?',
            a: 'Para limitar la corriente del pin de Arduino y atenuar el volumen',
            sub: 'Protege el microcontrolador y evita un sonido excesivamente estridente en entornos cerrados.',
            sectionId: 're-m3-2-5'
        },
        {
            id: 'f10',
            type: 'hw',
            q: '¿Qué componente se debe añadir si se desea activar un buzzer de alta potencia (ej. 12V / 100dB)?',
            a: 'Un transistor BJT NPN (como el 2N2222 o BC547) en modo conmutador',
            sub: 'Permite controlar una carga acústica de alta potencia con una señal de 5V de Arduino de forma segura.',
            sectionId: 're-m3-2-5'
        }
    ],
    questions: [
        {
            id: 'q1',
            question: '¿Qué principio físico describe la deformación de un cristal cerámico al aplicarle una diferencia de potencial eléctrico?',
            options: [
                'Efecto Piezoeléctrico Inverso',
                'Efecto Fotoeléctrico',
                'Inducción Electromagnética de Faraday',
                'Efecto Seebeck'
            ],
            correct: 0,
            explanation: 'El efecto piezoeléctrico inverso convierte variaciones de voltaje en deformaciones mecánicas que generan ondas acústicas.'
        },
        {
            id: 'q2',
            question: '¿Cuál es la principal ventaja operativa de un Buzzer Pasivo frente a uno Activo?',
            options: [
                'Permite generar múltiples frecuencias y reproducir melodías completas con tone()',
                'Consume menos de 0.1 mA en cualquier condición',
                'No requiere ninguna conexión a tierra (GND)',
                'Funciona únicamente con señales analógicas de 0 a 1023'
            ],
            correct: 0,
            explanation: 'El buzzer pasivo carece de oscilador interno, por lo que responde a cualquier frecuencia generada por software, permitiendo tocar notas musicales.'
        },
        {
            id: 'q3',
            question: 'Si deseas hacer sonar un Buzzer Activo conectado al pin 7, ¿qué instrucción de código es suficiente?',
            options: [
                'digitalWrite(7, HIGH);',
                'tone(7, 440, 1000);',
                'analogWrite(7, 255);',
                'pulseIn(7, HIGH);'
            ],
            correct: 0,
            explanation: 'Como el buzzer activo contiene un oscilador integrado, basta con alimentarlo con nivel alto (HIGH / 5V) para que empiece a sonar en su tono fijo.'
        },
        {
            id: 'q4',
            question: '¿Qué ciclo de trabajo (Duty Cycle) genera internamente la función tone() de Arduino?',
            options: [
                '50% exacto (onda cuadrada perfecta)',
                '100% constante (corriente directa)',
                '25% variable según el volumen',
                '75% para frecuencias agudas'
            ],
            correct: 0,
            explanation: 'La función `tone()` genera una onda cuadrada periódica con 50% en nivel alto y 50% en nivel bajo para máxima eficiencia acústica del diafragma.'
        },
        {
            id: 'q5',
            question: '¿Qué nota musical y frecuencia estándar se utiliza universalmente como referencia de afinación?',
            options: [
                'Nota LA4 a 440 Hz',
                'Nota DO4 a 262 Hz',
                'Nota MI4 a 330 Hz',
                'Nota SOL4 a 1000 Hz'
            ],
            correct: 0,
            explanation: 'La nota LA4 a 440 Hz (A4) es el tono patrón internacional de afinación.'
        },
        {
            id: 'q6',
            question: '¿Cuál es la función del comando noTone(8); en un sketch de Arduino?',
            options: [
                'Detener la emisión de sonido y apagar el temporizador en el pin 8',
                'Bajar el volumen del buzzer al 50%',
                'Invertir la polaridad de la onda sonora',
                'Reiniciar la secuencia de notas desde el principio'
            ],
            correct: 0,
            explanation: '`noTone(pin)` apaga la generación de la onda cuadrada en el pin especificado.'
        },
        {
            id: 'q7',
            question: '¿Por qué se coloca un resistor de 220 Ω en serie con un buzzer piezoeléctrico?',
            options: [
                'Para limitar la corriente pico en el pin de Arduino y proteger la salida',
                'Para amplificar los tonos graves por resonancia',
                'Para convertir la señal AC en señal DC',
                'Porque sin él la librería Servo.h entra en conflicto'
            ],
            correct: 0,
            explanation: 'El resistor en serie protege el microcontrolador de sobrecorrientes y evita saturar los pines de salida.'
        },
        {
            id: 'q8',
            question: '¿Cuántos tonos independientes puede reproducir simultáneamente una placa Arduino Uno estándar?',
            options: [
                'Solo 1 tono a la vez',
                'Hasta 6 tonos simultáneos (uno por cada pin PWM)',
                'Tantos como pines digitales tenga la placa',
                '2 tonos polifónicos usando interrupciones'
            ],
            correct: 0,
            explanation: 'El temporizador de hardware asignado a la función `tone()` en el ATmega328P solo permite generar 1 tono monofónico a la vez.'
        },
        {
            id: 'q9',
            question: 'Visualmente, ¿qué característica delata comúnmente a un Buzzer Activo?',
            options: [
                'La base inferior viene sellada uniformemente con resina negra',
                'Tiene 3 pines de conexión en lugar de 2',
                'El cuerpo es completamente metálico en lugar de plástico',
                'Tiene un cono transparente en la parte superior'
            ],
            correct: 0,
            explanation: 'La base sellada con resina negra protege el oscilador interno del buzzer activo, mientras que el pasivo deja al descubierto su PCB.'
        },
        {
            id: 'q10',
            question: 'Si quieres controlar una sirena acústica de 12V y 200 mA con Arduino, ¿qué configuración es la correcta?',
            options: [
                'Transistor NPN (2N2222) con base conectada al pin de Arduino y colector a la sirena con fuente de 12V externa',
                'Conectar la sirena directamente al pin 5V de Arduino',
                'Usar dos buzzers pasivos en serie en el pin D8',
                'Utilizar la función tone() a 12000 Hz'
            ],
            correct: 0,
            explanation: 'Un transistor en modo conmutador permite conmutar voltajes y corrientes elevados (12V / 200mA) desde un pin de control de 5V sin dañar el Arduino.'
        }
    ]
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 're-m3-l2-content',
                content: lessonDefinition.content
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 're-m3-l2-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        prueba: [
            createQuizBlock({
                id: 're-m3-l2-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions
            })
        ]
    }
});
