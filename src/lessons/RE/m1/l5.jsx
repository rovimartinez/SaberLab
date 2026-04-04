import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Entradas analogicas y resolucion',
    content: `
        <div class="lesson-intro">
            <p>Hasta ahora has trabajado con entradas que solo distinguen dos estados: <strong>HIGH</strong> o <strong>LOW</strong>. En esta leccion Arduino da un paso mas fino: aprendera a leer valores intermedios usando <strong>entradas analogicas</strong>, especialmente con el ejemplo clasico del <strong>potenciometro</strong>.</p>
        </div>

        <div class="theory-section">
            <h3 id="re-5-1">5.1 Que es una entrada analogica</h3>
            <p>Una entrada analogica no se limita a dos estados. Permite medir una variacion continua de voltaje dentro de un rango, normalmente entre <code>0V</code> y <code>5V</code> en Arduino Uno.</p>
            <div class="highlight-panel" style="background: rgba(59, 130, 246, 0.08); border-left: 4px solid #3b82f6; padding: 1rem; border-radius: 12px; margin: 1rem 0;">
                <p><strong>Idea clave:</strong> la realidad fisica muchas veces cambia poco a poco, no solo en dos estados extremos.</p>
                <p style="margin-bottom: 0;"><strong>Ejemplos:</strong> posicion de una perilla, intensidad de luz, nivel de humedad o temperatura variable.</p>
            </div>
        </div>

        <div class="theory-section">
            <h3 id="re-5-2">5.2 El potenciometro como divisor de voltaje</h3>
            <p>Un potenciometro es una resistencia variable con una perilla. Al girarlo, cambia la proporcion del voltaje disponible en su terminal central. Por eso es ideal para producir una senal analogica controlable.</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 16px; padding: 1rem;">
                    <h4 style="color: #10b981; margin-bottom: 0.5rem;">Conexion tipica</h4>
                    <p style="color: #cbd5e1; font-size: 0.92rem; line-height: 1.6;">Un extremo a <code>5V</code>, el otro a <code>GND</code> y el pin central a una entrada analogica como <code>A0</code>.</p>
                </div>
                <div style="background: rgba(249, 115, 22, 0.06); border: 1px solid rgba(249, 115, 22, 0.15); border-radius: 16px; padding: 1rem;">
                    <h4 style="color: #fb923c; margin-bottom: 0.5rem;">Comportamiento</h4>
                    <p style="color: #cbd5e1; font-size: 0.92rem; line-height: 1.6;">Al girar la perilla, el voltaje del terminal central sube o baja de manera progresiva.</p>
                </div>
            </div>
        </div>

        <div class="theory-section">
            <h3 id="re-5-3">5.3 Que hace analogRead()</h3>
            <p>Arduino no guarda el voltaje como un decimal exacto en voltios. Lo convierte a un numero entero usando un convertidor analogico-digital. Esa lectura se obtiene con <code>analogRead(pin)</code>.</p>
            <pre style="background: rgba(15, 23, 42, 0.72); padding: 1.25rem; border-radius: 18px; border: 1px solid rgba(255,255,255,0.06); overflow-x: auto;"><code style="color: #cbd5e1;">int lectura = analogRead(A0);</code></pre>
            <p style="margin-top: 1rem;">En Arduino Uno, la lectura suele ir desde <code>0</code> hasta <code>1023</code>.</p>
        </div>

        <div class="theory-section">
            <h3 id="re-5-4">5.4 Resolucion de 10 bits</h3>
            <p>El ADC de Arduino Uno tiene una resolucion de <strong>10 bits</strong>. Eso significa que puede dividir el rango de entrada en <strong>1024 niveles posibles</strong>, desde 0 hasta 1023.</p>
            <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.18); border-radius: 18px; padding: 1.25rem; margin-top: 1rem;">
                <ul style="color: #cbd5e1; line-height: 1.8; padding-left: 1.2rem; margin: 0;">
                    <li><strong>0:</strong> voltaje muy cercano a 0V.</li>
                    <li><strong>1023:</strong> voltaje muy cercano a 5V.</li>
                    <li><strong>Valores intermedios:</strong> representan posiciones o niveles parciales.</li>
                </ul>
            </div>
            <p style="margin-top: 1rem;">La resolucion define cuan fino puede distinguir el microcontrolador entre un nivel y otro.</p>
        </div>

        <div class="theory-section">
            <h3 id="re-5-5">5.5 Del dato a la interpretacion</h3>
            <p>Leer un valor no basta; hay que interpretarlo. Por ejemplo, un potenciometro puede controlar brillo, velocidad, angulo o nivel de referencia en un proyecto.</p>
            <pre style="background: rgba(15, 23, 42, 0.72); padding: 1.25rem; border-radius: 18px; border: 1px solid rgba(255,255,255,0.06); overflow-x: auto;"><code style="color: #cbd5e1;">void setup() {
  Serial.begin(9600);
}

void loop() {
  int lectura = analogRead(A0);
  Serial.println(lectura);
  delay(200);
}</code></pre>
            <p style="margin-top: 1rem;">Con el Monitor Serie puedes observar como la lectura cambia suavemente al mover la perilla.</p>
        </div>

        <div class="theory-section">
            <h3 id="re-5-6">5.6 Aplicaciones reales</h3>
            <div style="background: rgba(255,255,255,0.04); border-radius: 18px; padding: 1.25rem; border: 1px solid rgba(255,255,255,0.06);">
                <ul style="color: #cbd5e1; line-height: 1.8; padding-left: 1.2rem; margin: 0;">
                    <li>Control manual de velocidad en un robot.</li>
                    <li>Ajuste de brillo de un LED.</li>
                    <li>Perillas de calibracion o sensibilidad.</li>
                    <li>Lectura base para sensores analogicos como LDR o temperatura.</li>
                </ul>
            </div>
        </div>
    `,
    flashcards: [
        { id: 'l5-f1', type: 'code', q: 'Que rango suele leer analogRead() en Arduino Uno?', a: 'De 0 a 1023', sub: 'Son 1024 niveles posibles', sectionId: 're-5-4' },
        { id: 'l5-f2', type: 'hw', q: 'Que componente usamos como ejemplo de entrada analogica?', a: 'Potenciometro', sub: 'Produce un voltaje variable', sectionId: 're-5-2' },
        { id: 'l5-f3', type: 'code', q: 'Que funcion se usa para leer A0?', a: 'analogRead(A0)', sub: 'Lee una entrada analogica', sectionId: 're-5-3' },
        { id: 'l5-f4', type: 'hw', q: 'A que corresponde una lectura cercana a 0?', a: 'A un voltaje cercano a 0V', sub: 'Extremo bajo del rango', sectionId: 're-5-4' },
        { id: 'l5-f5', type: 'hw', q: 'A que corresponde una lectura cercana a 1023?', a: 'A un voltaje cercano a 5V', sub: 'Extremo alto del rango', sectionId: 're-5-4' },
        { id: 'l5-f6', type: 'code', q: 'Que resolucion tiene el ADC del Arduino Uno?', a: '10 bits', sub: 'Divide el rango en 1024 niveles', sectionId: 're-5-4' },
        { id: 'l5-f7', type: 'hw', q: 'Como se conecta tipicamente un potenciometro?', a: 'A 5V, GND y A0 en el terminal central', sub: 'Funciona como divisor de voltaje', sectionId: 're-5-2' },
        { id: 'l5-f8', type: 'code', q: 'Para que sirve el Monitor Serie aqui?', a: 'Para observar como cambia la lectura', sub: 'Ayuda a interpretar la senal', sectionId: 're-5-5' },
        { id: 'l5-f9', type: 'hw', q: 'Una entrada analogica solo distingue HIGH y LOW?', a: 'No', sub: 'Puede medir niveles intermedios', sectionId: 're-5-1' },
        { id: 'l5-f10', type: 'code', q: 'Que significa resolucion en este contexto?', a: 'Que tan fino distingue entre niveles', sub: 'Mas niveles, mas detalle', sectionId: 're-5-4' }
    ],
    questions: [
        {
            id: 're-m1-l5-q1',
            q: 'Que diferencia principal tiene una entrada analogica frente a una digital?',
            options: ['La analogica solo detecta HIGH y LOW', 'La analogica mide variaciones continuas de voltaje', 'La digital usa mas memoria RAM', 'No hay diferencia real'],
            correct: 1,
            objective: 'Distinguir entradas analogicas y digitales',
            concept: 'entrada-analogica',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q2',
            q: 'Que funcion se usa para leer una entrada como A0?',
            options: ['digitalRead(A0)', 'analogWrite(A0)', 'analogRead(A0)', 'pinMode(A0)'],
            correct: 2,
            objective: 'Recordar la funcion de lectura analogica',
            concept: 'analogread',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q3',
            q: 'En Arduino Uno, una lectura analogica normal va de:',
            options: ['0 a 255', '0 a 1023', '1 a 100', '-5 a 5'],
            correct: 1,
            objective: 'Reconocer el rango del ADC de Arduino Uno',
            concept: 'rango-analogico',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q4',
            q: 'Que componente se usa en esta leccion como ejemplo de entrada analogica?',
            options: ['Servo motor', 'Potenciometro', 'Buzzer', 'Pulsador'],
            correct: 1,
            objective: 'Identificar el componente central de la leccion',
            concept: 'potenciometro',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q5',
            q: 'Que significa que el ADC tenga 10 bits de resolucion?',
            options: ['Que solo puede medir 10 voltios', 'Que puede dividir la entrada en 1024 niveles', 'Que funciona 10 veces por segundo', 'Que solo sirve con 10 sensores'],
            correct: 1,
            objective: 'Comprender la resolucion del convertidor analogico-digital',
            concept: 'resolucion-10-bits',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l5-q6',
            q: 'Una lectura cercana a 1023 suele indicar:',
            options: ['Un voltaje cercano a 5V', 'Un error de compilacion', 'Que el pin esta apagado', 'Que la entrada es digital'],
            correct: 0,
            objective: 'Relacionar el valor alto con el voltaje de entrada',
            concept: 'voltaje-maximo',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q7',
            q: 'Cual es la conexion tipica de un potenciometro en Arduino?',
            options: ['Dos terminales a pines digitales y uno a RX', 'Un extremo a 5V, otro a GND y el central a A0', 'Todos los terminales a GND', 'Solo al pin 13'],
            correct: 1,
            objective: 'Reconocer el cableado basico del potenciometro',
            concept: 'conexion-potenciometro',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l5-q8',
            q: 'Para que puede servir un potenciometro en un proyecto de robotica?',
            options: ['Solo para encender el puerto USB', 'Para ajustar velocidad, brillo o sensibilidad', 'Para reemplazar el microcontrolador', 'Para convertir salidas en entradas digitales'],
            correct: 1,
            objective: 'Transferir el concepto a usos practicos',
            concept: 'aplicaciones-analogicas',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q9',
            q: 'Que ayuda a observar como cambia la lectura del potenciometro en tiempo real?',
            options: ['El bootloader', 'El Monitor Serie', 'Solo el LED integrado', 'La memoria flash'],
            correct: 1,
            objective: 'Relacionar lectura analogica y observacion serial',
            concept: 'monitor-serie',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q10',
            q: 'En este contexto, que expresa mejor la palabra resolucion?',
            options: ['La velocidad del procesador', 'La capacidad de distinguir pequenos cambios entre niveles', 'El tamano fisico del Arduino', 'La cantidad de cables del circuito'],
            correct: 1,
            objective: 'Entender el sentido de resolucion en medicion analogica',
            concept: 'resolucion',
            difficulty: 'medium'
        }
    ]
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 're-m1-l5-content',
                content: lessonDefinition.content,
                challenges: lessonDefinition.challenges,
                hasSimulator: lessonDefinition.hasSimulator
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 're-m1-l5-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        prueba: [
            createQuizBlock({
                id: 're-m1-l5-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions,
                quizConfig: lessonDefinition.quizConfig
            })
        ]
    }
});
