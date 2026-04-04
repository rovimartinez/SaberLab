import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Entradas digitales y pulsadores',
    content: `
        <div class="lesson-intro">
            <p>Hasta ahora Arduino solo ha obedecido ordenes. En esta leccion cambia el papel del sistema: ahora la placa debe <strong>escuchar</strong> lo que pasa afuera. Un pulsador convierte una accion humana en una senal digital que el microcontrolador puede leer, analizar y usar para tomar decisiones.</p>
        </div>

        <div class="theory-section">
            <h3 id="re-3-1">3.1 Que es una entrada digital</h3>
            <p>Una <strong>entrada digital</strong> es un pin configurado para detectar solo dos estados posibles: presencia de voltaje o ausencia de voltaje. En Arduino eso suele representarse como <code>HIGH</code> y <code>LOW</code>.</p>
            <div class="highlight-panel" style="background: rgba(59, 130, 246, 0.08); border-left: 4px solid #3b82f6; padding: 1rem; border-radius: 12px; margin: 1rem 0;">
                <p><strong>HIGH:</strong> el pin detecta una senal alta, normalmente cerca de 5V.</p>
                <p><strong>LOW:</strong> el pin detecta una senal baja, normalmente cerca de 0V.</p>
                <p style="margin-bottom: 0;"><strong>Idea clave:</strong> el pin no "adivina"; necesita una conexion estable para no quedar flotando.</p>
            </div>
        </div>

        <div class="theory-section">
            <h3 id="re-3-2">3.2 El pulsador como sensor binario</h3>
            <p>Un pulsador es uno de los sensores mas simples del mundo: cuando lo presionas, cierra un circuito; cuando lo sueltas, lo abre. Por eso se comporta como un interruptor momentaneo.</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 16px; padding: 1rem;">
                    <h4 style="color: #10b981; margin-bottom: 0.5rem;">Boton presionado</h4>
                    <p style="color: #cbd5e1; font-size: 0.92rem; line-height: 1.6;">El circuito se cierra, la corriente encuentra camino y el pin puede leer un estado definido.</p>
                </div>
                <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 16px; padding: 1rem;">
                    <h4 style="color: #ef4444; margin-bottom: 0.5rem;">Boton suelto</h4>
                    <p style="color: #cbd5e1; font-size: 0.92rem; line-height: 1.6;">El circuito se abre. Si no hay resistencia pull-up o pull-down, el pin puede quedar inestable y leer ruido.</p>
                </div>
            </div>
        </div>

        <div class="theory-section">
            <h3 id="re-3-3">3.3 Pull-up, pull-down y el problema del pin flotante</h3>
            <p>Un error muy comun es pensar que un pin "sin tocar" vale cero. En realidad, cuando el pin queda sin una referencia electrica clara puede oscilar entre HIGH y LOW por ruido electrico. A esto se le llama <strong>estado flotante</strong>.</p>
            <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.18); border-radius: 18px; padding: 1.25rem; margin-top: 1rem;">
                <h4 style="color: #a855f7; margin-bottom: 0.6rem;">Dos estrategias para fijar el estado</h4>
                <ul style="color: #cbd5e1; line-height: 1.8; padding-left: 1.2rem; margin: 0;">
                    <li><strong>Pull-down:</strong> una resistencia conecta el pin a GND para que, si nadie pulsa, lea LOW.</li>
                    <li><strong>Pull-up:</strong> una resistencia conecta el pin a 5V para que, si nadie pulsa, lea HIGH.</li>
                    <li><strong>INPUT_PULLUP:</strong> Arduino trae una resistencia interna que simplifica el montaje.</li>
                </ul>
            </div>
            <p style="margin-top: 1rem;">Cuando usas <code>INPUT_PULLUP</code>, la logica se invierte: sin pulsar el boton se lee <code>HIGH</code>, y al pulsarlo normalmente se lee <code>LOW</code>.</p>
        </div>

        <div class="theory-section">
            <h3 id="re-3-4">3.4 Lectura con digitalRead()</h3>
            <p>La funcion <code>digitalRead(pin)</code> consulta el estado actual de una entrada digital. Es como preguntarle al Arduino: "en este instante, que estas detectando en este pin?"</p>
            <pre style="background: rgba(15, 23, 42, 0.72); padding: 1.25rem; border-radius: 18px; border: 1px solid rgba(255,255,255,0.06); overflow-x: auto;"><code style="color: #cbd5e1;">int boton = 2;
int led = 13;

void setup() {
  pinMode(boton, INPUT_PULLUP);
  pinMode(led, OUTPUT);
}

void loop() {
  int estadoBoton = digitalRead(boton);

  if (estadoBoton == LOW) {
    digitalWrite(led, HIGH);
  } else {
    digitalWrite(led, LOW);
  }
}</code></pre>
            <p style="margin-top: 1rem;">Este patron es uno de los mas importantes en robotica educativa: <strong>leer, decidir, actuar</strong>.</p>
        </div>

        <div class="theory-section">
            <h3 id="re-3-5">3.5 Rebotado mecanico y lectura confiable</h3>
            <p>Cuando un boton se presiona, sus contactos metalicos no cambian de estado de forma perfecta. Rebotan por unos milisegundos. Para un humano eso no se nota, pero para un microcontrolador que ejecuta miles de ciclos por segundo si.</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                <div style="background: rgba(244, 63, 94, 0.06); border-radius: 16px; padding: 1rem; border: 1px solid rgba(244, 63, 94, 0.16);">
                    <h4 style="color: #f43f5e; margin-bottom: 0.5rem;">Sin control</h4>
                    <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">Una sola pulsacion puede verse como muchos cambios rapidos de HIGH y LOW.</p>
                </div>
                <div style="background: rgba(14, 165, 233, 0.06); border-radius: 16px; padding: 1rem; border: 1px solid rgba(14, 165, 233, 0.16);">
                    <h4 style="color: #0ea5e9; margin-bottom: 0.5rem;">Con debouncing</h4>
                    <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">Se espera unos milisegundos o se valida el cambio para registrar una sola pulsacion real.</p>
                </div>
            </div>
            <p style="margin-top: 1rem;">En proyectos serios, controlar el rebote mejora la calidad del dato y evita falsas decisiones del sistema.</p>
        </div>

        <div class="theory-section">
            <h3 id="re-3-6">3.6 Aplicaciones reales</h3>
            <p>Los pulsadores no son solo "botones escolares". Son la base de paneles de control, ascensores, robots didacticos, cerraduras electronicas, juegos interactivos y dispositivos de asistencia.</p>
            <div style="background: rgba(255,255,255,0.04); border-radius: 18px; padding: 1.25rem; border: 1px solid rgba(255,255,255,0.06);">
                <ul style="color: #cbd5e1; line-height: 1.8; padding-left: 1.2rem; margin: 0;">
                    <li>Boton de arranque o parada de emergencia.</li>
                    <li>Selecciones de menu en una interfaz robotica.</li>
                    <li>Activacion de rutinas de seguridad.</li>
                    <li>Registro de respuesta del usuario en experiencias de aprendizaje.</li>
                </ul>
            </div>
        </div>
    `,
    flashcards: [
        { id: 'l3-f1', type: 'code', q: 'Que dos estados maneja una entrada digital?', a: 'HIGH y LOW', sub: 'Solo detecta dos niveles logicos', sectionId: 're-3-1' },
        { id: 'l3-f2', type: 'hw', q: 'Que hace un pulsador cuando se presiona?', a: 'Cierra el circuito', sub: 'Permite el paso de corriente', sectionId: 're-3-2' },
        { id: 'l3-f3', type: 'hw', q: 'Que problema aparece si el pin queda sin referencia?', a: 'Estado flotante', sub: 'Puede leer ruido aleatorio', sectionId: 're-3-3' },
        { id: 'l3-f4', type: 'code', q: 'Que funcion lee una entrada digital?', a: 'digitalRead(pin)', sub: 'Devuelve HIGH o LOW', sectionId: 're-3-4' },
        { id: 'l3-f5', type: 'code', q: 'Que ventaja ofrece INPUT_PULLUP?', a: 'Usa una resistencia interna y simplifica el montaje', sub: 'Evita agregar una resistencia externa en muchos casos', sectionId: 're-3-3' },
        { id: 'l3-f6', type: 'code', q: 'Con INPUT_PULLUP, que se lee al pulsar normalmente?', a: 'LOW', sub: 'La logica queda invertida', sectionId: 're-3-3' },
        { id: 'l3-f7', type: 'hw', q: 'Como se llama el ruido mecanico de un pulsador?', a: 'Rebote o bouncing', sub: 'Genera multiples cambios rapidos', sectionId: 're-3-5' },
        { id: 'l3-f8', type: 'code', q: 'Cual es la secuencia base de un sistema interactivo?', a: 'Leer, decidir, actuar', sub: 'Patron central en robotica', sectionId: 're-3-4' },
        { id: 'l3-f9', type: 'hw', q: 'Que resistencia fija el pin en HIGH por defecto?', a: 'Pull-up', sub: 'Conecta a voltaje positivo', sectionId: 're-3-3' },
        { id: 'l3-f10', type: 'hw', q: 'Que resistencia fija el pin en LOW por defecto?', a: 'Pull-down', sub: 'Conecta a tierra', sectionId: 're-3-3' }
    ],
    questions: [
        {
            id: 're-m1-l3-q1',
            q: 'Cual es la funcion principal de una entrada digital en Arduino?',
            options: ['Generar energia para el circuito', 'Detectar uno de dos estados logicos', 'Medir voltajes continuos con detalle decimal', 'Aumentar la memoria del programa'],
            correct: 1,
            objective: 'Comprender el concepto de entrada digital',
            concept: 'entradas-digitales',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l3-q2',
            q: 'Que hace un pulsador en un circuito?',
            options: ['Convierte una senal digital en analogica', 'Abre o cierra un camino electrico', 'Amplifica la corriente', 'Regula el voltaje a 3.3V'],
            correct: 1,
            objective: 'Identificar el funcionamiento del pulsador',
            concept: 'pulsador',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l3-q3',
            q: 'Que problema se presenta cuando un pin de entrada queda sin pull-up o pull-down?',
            options: ['Se quema automaticamente', 'Queda flotante y puede leer ruido', 'Se convierte en pin analogico', 'Arduino se apaga'],
            correct: 1,
            objective: 'Reconocer el estado flotante',
            concept: 'pin-flotante',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l3-q4',
            q: 'Que funcion se usa para consultar el estado de un boton?',
            options: ['digitalRead()', 'digitalWrite()', 'analogWrite()', 'pinMode()'],
            correct: 0,
            objective: 'Recordar la funcion de lectura digital',
            concept: 'digitalread',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l3-q5',
            q: 'Que valor suele leerse cuando un boton configurado con INPUT_PULLUP es presionado?',
            options: ['HIGH', 'LOW', '1023', 'Depende del LED'],
            correct: 1,
            objective: 'Comprender la logica invertida de INPUT_PULLUP',
            concept: 'input-pullup',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l3-q6',
            q: 'Por que se usa INPUT_PULLUP con frecuencia en practicas escolares?',
            options: ['Porque hace mas rapido el procesador', 'Porque evita usar una resistencia externa en muchos montajes', 'Porque cambia el pin a salida automaticamente', 'Porque permite leer valores analogicos'],
            correct: 1,
            objective: 'Comprender ventajas practicas de INPUT_PULLUP',
            concept: 'input-pullup',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l3-q7',
            q: 'Que describe mejor el rebote mecanico de un boton?',
            options: ['Una sobrecarga permanente del circuito', 'Una serie de cambios rapidos antes de estabilizarse', 'Un error de compilacion', 'Una propiedad del LED integrado'],
            correct: 1,
            objective: 'Identificar el fenomeno de rebote',
            concept: 'debouncing',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l3-q8',
            q: 'En un sistema interactivo, despues de leer una entrada, que paso sigue?',
            options: ['Borrar el programa', 'Tomar una decision y actuar', 'Desconectar el GND', 'Activar el bootloader'],
            correct: 1,
            objective: 'Relacionar lectura y decision',
            concept: 'leer-decidir-actuar',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l3-q9',
            q: 'Una resistencia pull-down fija el estado por defecto del pin en:',
            options: ['HIGH', 'LOW', 'PWM', 'Serial'],
            correct: 1,
            objective: 'Diferenciar pull-down y pull-up',
            concept: 'pull-down',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l3-q10',
            q: 'Cual es un uso realista de un pulsador en robotica?',
            options: ['Aumentar la RAM del microcontrolador', 'Iniciar o detener una rutina del sistema', 'Convertir un pin digital en analogico', 'Reemplazar el puerto USB'],
            correct: 1,
            objective: 'Transferir el concepto a aplicaciones reales',
            concept: 'aplicaciones-pulsador',
            difficulty: 'easy'
        }
    ]
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 're-m1-l3-content',
                content: lessonDefinition.content,
                challenges: lessonDefinition.challenges,
                hasSimulator: lessonDefinition.hasSimulator
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 're-m1-l3-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        prueba: [
            createQuizBlock({
                id: 're-m1-l3-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions,
                quizConfig: lessonDefinition.quizConfig
            })
        ]
    }
});
