import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Monitor serie y depuracion inicial',
    content: `
        <div class="lesson-intro">
            <p>Cuando un robot parece "no hacer nada", muchas veces si esta haciendo algo, pero nosotros no podemos verlo. El <strong>Monitor Serie</strong> funciona como una ventana de observacion: permite que Arduino nos envie mensajes para entender que esta leyendo, que esta pensando y por que actua de cierta manera.</p>
        </div>

        <div class="theory-section">
            <h3 id="re-4-1">4.1 Que es la comunicacion serial</h3>
            <p>La comunicacion serial consiste en enviar datos uno tras otro por un canal comun. En Arduino, ese canal suele conectarse al computador por USB para que podamos ver texto, numeros y estados internos del programa.</p>
            <div class="highlight-panel" style="background: rgba(14, 165, 233, 0.08); border-left: 4px solid #0ea5e9; padding: 1rem; border-radius: 12px; margin: 1rem 0;">
                <p><strong>Idea central:</strong> con el Monitor Serie no controlamos solo hardware; tambien observamos el proceso mental del programa.</p>
            </div>
        </div>

        <div class="theory-section">
            <h3 id="re-4-2">4.2 Serial.begin() y la velocidad en baudios</h3>
            <p>Antes de enviar mensajes debemos abrir el canal serial. Eso se hace normalmente en <code>setup()</code> con <code>Serial.begin(9600);</code>.</p>
            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; padding: 1.25rem;">
                <ul style="color: #cbd5e1; line-height: 1.8; padding-left: 1.2rem; margin: 0;">
                    <li><strong>Serial.begin(9600):</strong> inicia la comunicacion a 9600 bits por segundo.</li>
                    <li><strong>Baudios:</strong> es la velocidad a la que se envian los datos.</li>
                    <li><strong>Regla practica:</strong> la velocidad del codigo y la del monitor deben coincidir.</li>
                </ul>
            </div>
        </div>

        <div class="theory-section">
            <h3 id="re-4-3">4.3 Serial.print() y Serial.println()</h3>
            <p>Una vez abierta la comunicacion, podemos escribir mensajes. <code>Serial.print()</code> imprime sin salto de linea, mientras que <code>Serial.println()</code> imprime y luego baja a la siguiente linea.</p>
            <pre style="background: rgba(15, 23, 42, 0.72); padding: 1.25rem; border-radius: 18px; border: 1px solid rgba(255,255,255,0.06); overflow-x: auto;"><code style="color: #cbd5e1;">void setup() {
  Serial.begin(9600);
}

void loop() {
  int lectura = digitalRead(2);
  Serial.print("Estado del boton: ");
  Serial.println(lectura);
  delay(500);
}</code></pre>
            <p style="margin-top: 1rem;">Con este patron, el docente o estudiante puede ver la secuencia de estados sin depender solo del LED.</p>
        </div>

        <div class="theory-section">
            <h3 id="re-4-4">4.4 Depurar es pensar con evidencia</h3>
            <p>Depurar no significa "adivinar errores". Significa recolectar evidencia para responder preguntas concretas:</p>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;">
                <div style="background: rgba(168, 85, 247, 0.07); border-radius: 16px; padding: 1rem; border: 1px solid rgba(168, 85, 247, 0.16);">
                    <h4 style="color: #a855f7; margin-bottom: 0.4rem;">Que entra?</h4>
                    <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.5;">Que valor real esta leyendo el pin o sensor.</p>
                </div>
                <div style="background: rgba(59, 130, 246, 0.07); border-radius: 16px; padding: 1rem; border: 1px solid rgba(59, 130, 246, 0.16);">
                    <h4 style="color: #3b82f6; margin-bottom: 0.4rem;">Que decide?</h4>
                    <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.5;">Si la condicion que escribimos se cumple o no.</p>
                </div>
                <div style="background: rgba(16, 185, 129, 0.07); border-radius: 16px; padding: 1rem; border: 1px solid rgba(16, 185, 129, 0.16);">
                    <h4 style="color: #10b981; margin-bottom: 0.4rem;">Que sale?</h4>
                    <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.5;">Que accion realiza el sistema despues de decidir.</p>
                </div>
            </div>
        </div>

        <div class="theory-section">
            <h3 id="re-4-5">4.5 Buenas practicas al imprimir datos</h3>
            <p>Imprimir demasiado rapido puede saturar la lectura humana y hacer dificil el analisis. En proyectos educativos conviene mostrar datos claros, con etiquetas y una frecuencia razonable.</p>
            <div style="background: rgba(249, 115, 22, 0.08); border: 1px solid rgba(249, 115, 22, 0.16); border-radius: 18px; padding: 1.25rem;">
                <ul style="color: #cbd5e1; line-height: 1.8; padding-left: 1.2rem; margin: 0;">
                    <li>Imprime etiquetas como <code>"Estado:"</code> o <code>"Lectura:"</code>.</li>
                    <li>Usa <code>delay()</code> o condiciones para no inundar la consola.</li>
                    <li>Evita mensajes ambiguos como <code>"ok"</code> si no explican que se verifico.</li>
                    <li>Piensa en quien interpretara ese dato: estudiante, docente o sistema analitico.</li>
                </ul>
            </div>
        </div>

        <div class="theory-section">
            <h3 id="re-4-6">4.6 Del monitor serie a la analitica del aprendizaje</h3>
            <p>El mismo principio del Monitor Serie se puede llevar a plataformas educativas: registrar tiempos, respuestas, estados y errores para comprender mejor como aprende cada estudiante. En robotica educativa, observar el proceso importa tanto como el resultado final.</p>
            <p>Por eso, cuando una evaluacion guarda tiempos por pregunta, aciertos, errores y secuencias, no solo "califica": tambien construye evidencia para estudiar atencion, esfuerzo, persistencia y consolidacion conceptual.</p>
        </div>
    `,
    flashcards: [
        { id: 'l4-f1', type: 'code', q: 'Que funcion inicia la comunicacion serial?', a: 'Serial.begin()', sub: 'Se suele usar en setup()', sectionId: 're-4-2' },
        { id: 'l4-f2', type: 'code', q: 'Que significa 9600 en Serial.begin(9600)?', a: 'La velocidad en baudios', sub: 'Bits por segundo', sectionId: 're-4-2' },
        { id: 'l4-f3', type: 'code', q: 'Que diferencia hay entre Serial.print y Serial.println?', a: 'println agrega salto de linea', sub: 'print continua en la misma linea', sectionId: 're-4-3' },
        { id: 'l4-f4', type: 'code', q: 'Para que sirve el Monitor Serie?', a: 'Para observar datos internos del programa', sub: 'Ayuda a depurar', sectionId: 're-4-1' },
        { id: 'l4-f5', type: 'code', q: 'En que funcion se inicia normalmente el puerto serial?', a: 'setup()', sub: 'Se configura una vez al inicio', sectionId: 're-4-2' },
        { id: 'l4-f6', type: 'code', q: 'Que conviene imprimir junto al valor de un sensor?', a: 'Una etiqueta descriptiva', sub: 'Hace la lectura interpretable', sectionId: 're-4-5' },
        { id: 'l4-f7', type: 'code', q: 'Depurar es adivinar errores?', a: 'No, es analizar evidencia', sub: 'Leer datos para entender que ocurre', sectionId: 're-4-4' },
        { id: 'l4-f8', type: 'code', q: 'Que riesgo hay si imprimes demasiado rapido?', a: 'La salida se vuelve dificil de interpretar', sub: 'Puede inundar la consola', sectionId: 're-4-5' },
        { id: 'l4-f9', type: 'code', q: 'Que tres preguntas guia una buena depuracion?', a: 'Que entra, que decide y que sale', sub: 'Modelo simple de observacion', sectionId: 're-4-4' },
        { id: 'l4-f10', type: 'code', q: 'Que conecta el Monitor Serie con la analitica educativa?', a: 'Registrar evidencia del proceso', sub: 'No solo importa la nota final', sectionId: 're-4-6' }
    ],
    questions: [
        {
            id: 're-m1-l4-q1',
            q: 'Para que sirve el Monitor Serie en Arduino?',
            options: ['Para aumentar el voltaje del pin 13', 'Para observar mensajes y datos del programa', 'Para reemplazar el bootloader', 'Para convertir entradas digitales en analogicas'],
            correct: 1,
            objective: 'Comprender el proposito del monitor serie',
            concept: 'monitor-serie',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l4-q2',
            q: 'Que instruccion inicia la comunicacion serial?',
            options: ['Serial.start(9600);', 'begin.Serial(9600);', 'Serial.begin(9600);', 'Serial.println(9600);'],
            correct: 2,
            objective: 'Recordar la sintaxis de inicializacion serial',
            concept: 'serial-begin',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l4-q3',
            q: 'Que representan los baudios en una comunicacion serial?',
            options: ['La memoria disponible', 'La velocidad de transmision de datos', 'La cantidad de pines', 'El brillo del LED'],
            correct: 1,
            objective: 'Comprender la velocidad serial',
            concept: 'baudios',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l4-q4',
            q: 'Que diferencia principal hay entre Serial.print() y Serial.println()?',
            options: ['println agrega salto de linea', 'print convierte numeros en HIGH', 'println solo funciona en loop', 'No existe diferencia'],
            correct: 0,
            objective: 'Diferenciar funciones de impresion serial',
            concept: 'serial-print',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l4-q5',
            q: 'En que parte del programa se suele llamar a Serial.begin()?',
            options: ['Dentro de un if', 'En setup()', 'Solo al final de loop()', 'En una variable global'],
            correct: 1,
            objective: 'Ubicar la inicializacion serial',
            concept: 'setup',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l4-q6',
            q: 'Cual es una buena practica al imprimir lecturas de sensores?',
            options: ['Enviar solo numeros sin contexto', 'Imprimir etiquetas claras y controlar la frecuencia', 'Eliminar todos los delays del proyecto', 'Imprimir una vez cada microsegundo'],
            correct: 1,
            objective: 'Aplicar buenas practicas de depuracion',
            concept: 'buenas-practicas-serial',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l4-q7',
            q: 'Que pregunta ayuda a depurar una condicion?',
            options: ['Que entra?', 'Cuantos colores tiene el IDE?', 'Que marca tiene el cable USB?', 'Que musica escucha el robot?'],
            correct: 0,
            objective: 'Relacionar depuracion con observacion de datos',
            concept: 'depuracion',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l4-q8',
            q: 'Si el monitor serie muestra valores demasiado rapido, que efecto pedagogico puede ocurrir?',
            options: ['La informacion se vuelve menos interpretable', 'El pin cambia a PWM', 'La placa aumenta su frecuencia', 'El USB deja de alimentar'],
            correct: 0,
            objective: 'Entender limites de interpretacion humana',
            concept: 'carga-cognitiva',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l4-q9',
            q: 'Que valor agregado tiene registrar estados y tiempos en actividades educativas?',
            options: ['Solo decorar la interfaz', 'Construir evidencia sobre el proceso de aprendizaje', 'Reducir automaticamente la nota', 'Desactivar las flashcards'],
            correct: 1,
            objective: 'Conectar depuracion con analitica educativa',
            concept: 'analitica-aprendizaje',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l4-q10',
            q: 'Cuando la velocidad configurada en el codigo y en el monitor no coincide, normalmente ocurre que:',
            options: ['La lectura sale ilegible o incorrecta', 'El boton se convierte en sensor analogico', 'El programa deja de compilar siempre', 'El LED se enciende en color azul'],
            correct: 0,
            objective: 'Reconocer un fallo comun de comunicacion serial',
            concept: 'sincronia-serial',
            difficulty: 'medium'
        }
    ]
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 're-m1-l4-content',
                content: lessonDefinition.content,
                challenges: lessonDefinition.challenges,
                hasSimulator: lessonDefinition.hasSimulator
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 're-m1-l4-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        prueba: [
            createQuizBlock({
                id: 're-m1-l4-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions,
                quizConfig: lessonDefinition.quizConfig
            })
        ]
    }
});
