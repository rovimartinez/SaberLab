import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Variables y Comentarios',
    content: `
        <div class="lesson-intro">
            <p>En esta lecciÃ³n, daremos el siguiente paso en nuestra lÃ³gica de programaciÃ³n aprendiendo sobre <strong>Variables y Comentarios</strong>. Estos son las herramientas que hacen que tu cÃ³digo sea profesional, escalable y, sobre todo, comprensible para otros humanos.</p>
        </div>

        <div class="theory-section">
            <h3 id="re-2-1">2.1 El Poder de los Comentarios</h3>
            <p>Los comentarios son notas que el Arduino ignora totalmente. Sirven para explicar quÃ© hace tu cÃ³digo y hacerlo profesional.</p>
            <div class="highlight-panel" style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <p><strong>// Comentario de una lÃ­nea:</strong> Usa doble barra para notas cortas.</p>
                <p><strong>/* Comentario multilÃ­nea */:</strong> Usa este formato para explicaciones largas o bloques enteros.</p>
            </div>
        </div>

        <div class="theory-section">
            <h3 id="re-2-2">2.2 Â¿QuÃ© es verdaderamente una Variable?</h3>
            <p>En el mundo real, si quieres guardar tus juguetes para que no se pierdan, usas una <strong>caja</strong> y le pones una <strong>etiqueta</strong> ("Mis Juguetes"). En programaciÃ³n, una <strong>variable</strong> es exactamente eso: una caja en la memoria de la placa Arduino donde podemos guardar informaciÃ³n para usarla mÃ¡s adelante.</p>
            
            <p>Como las computadoras son muy estrictas, no puedes meter cualquier cosa en cualquier caja. Necesitas avisar quÃ© forma tiene. Imagina que es como pedir "Solo peluches" o "Solo piezas de Lego". Por lo tanto, para crear esa caja de manera perfecta, necesitas 3 elementos clave:</p>
            
            <div class="highlight-panel" style="background: rgba(96, 165, 250, 0.1); border-left: 4px solid #3b82f6; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
                <h4 style="color: #60a5fa; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem;">
                    La anatomÃ­a perfecta de una variable:
                </h4>
                <code style="font-size: 1.2rem; display: block; background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px;">
                    <span style="color: #a855f7;">int</span> <span style="color: #38bdf8;">tiempoEspera</span> = <span style="color: #fbbf24;">1000</span>;
                </code>
                <ul style="margin-top: 1rem; color: #cbd5e1; font-size: 0.95rem; line-height: 1.6;">
                    <li><strong style="color: #a855f7;">El Tipo (int):</strong> Es la regla. Le dice al Arduino quÃ© clase de informaciÃ³n va a almacenar (en este caso, un nÃºmero entero). Es como el "tamaÃ±o" o "forma" de tu caja en memoria.</li>
                    <li><strong style="color: #38bdf8;">El Nombre (tiempoEspera):</strong> Es la etiqueta Ãºnica de la caja. Como buenas prÃ¡cticas, debe ser descriptivo (Â¡evita nombres como <code>a</code> o <code>x</code>!) e ir pegado con mayÃºscula la segunda palabra (a esto se llama <em>camelCase</em>).</li>
                    <li><strong style="color: #fbbf24;">El Valor (1000):</strong> Es el contenido inicial, lo que pones adentro justo cuando la firmas.</li>
                </ul>
            </div>

            <p>Â¿Por quÃ© no usar simplemente el nÃºmero 1000 suelto por todos lados? Si luego tu jefe te dice que tiene que durar el doble, tendrÃ­as que buscar en cientos de lÃ­neas de cÃ³digo y cambiar cada "1000" manualmente (Â¡una pesadilla!). Con la variable, solo cambias el valor inicial una vez y, mÃ¡gicamente, todas las veces que uses <code>tiempoEspera</code> se actualizarÃ¡ solo. Ese es el verdadero poder que te vuelve profesional.</p>
        </div>

        <div class="theory-section">
            <h3 id="re-2-3">2.3 El CatÃ¡logo de Tipos de Datos</h3>
            <p>Arduino necesita saber quÃ© "tipo" de informaciÃ³n vas a guardar para reservar el espacio correcto en memoria:</p>
            <div class="types-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                <div class="type-card" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                    <strong style="color: #a855f7;">int</strong> (Integer)
                    <p style="font-size: 0.85rem; color: #94a3b8;">NÃºmeros enteros (ej: 13, -5, 0). Es el mÃ¡s usado para pines.</p>
                </div>
                <div class="type-card" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                    <strong style="color: #3b82f6;">float</strong> (Floating Point)
                    <p style="font-size: 0.85rem; color: #94a3b8;">NÃºmeros con decimales (ej: 3.14, 25.5). Ãštil para sensores.</p>
                </div>
                <div class="type-card" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                    <strong style="color: #10b981;">bool</strong> (Boolean)
                    <p style="font-size: 0.85rem; color: #94a3b8;">Solo dos valores: true (verdadero) o false (falso).</p>
                </div>
                <div class="type-card" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                    <strong style="color: #f59e0b;">char</strong> (Character)
                    <p style="font-size: 0.85rem; color: #94a3b8;">Un solo carÃ¡cter (ej: 'A', 'z'). Se escriben con comilla simple.</p>
                </div>
                <div class="type-card" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                    <strong style="color: #f97316;">long</strong> (Long Integer)
                    <p style="font-size: 0.85rem; color: #94a3b8;">Igual que 'int' pero puede guardar nÃºmeros de hasta 2 mil billones. Imprescindible para el tiempo de ejecuciÃ³n (<code>millis()</code>).</p>
                </div>
                <div class="type-card" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                    <strong style="color: #ec4899;">String</strong> (Text Buffer)
                    <p style="font-size: 0.85rem; color: #94a3b8;">Permite guardar palabras completas y frases. Ideal para enviar mensajes a pantallas LCD o al monitor serial.</p>
                </div>
            </div>
        </div>
    `,
    challenges: [
        {
            title: 'Variables BÃ¡sicas',
            content: `
                <h4>Reto: Parpadeo Configurable</h4>
                <p style="margin-bottom: 1rem;">Usa una variable para controlar el tiempo que el LED permanece encendido y apagado.</p>
                <pre style="background: rgba(15, 23, 42, 0.6); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;"><code style="color: #60a5fa;">// Definimos el pin y el tiempo
int pinLed = 13;
int pausa = 200; // Â¡CÃ¡mbialo aquÃ­ fÃ¡cilmente!

void setup() {
  pinMode(pinLed, OUTPUT);
}

void loop() {
  digitalWrite(pinLed, HIGH);
  delay(pausa);
  digitalWrite(pinLed, LOW);
  delay(pausa);
}</code></pre>
            `
        },
        {
            title: 'SOS de Emergencia',
            content: `
                <h4>Reto: CÃ³digo Morse</h4>
                <p style="margin-bottom: 1rem;">Usa una variable para definir la unidad de tiempo bÃ¡sica y crea una seÃ±al de S.O.S.</p>
                <pre style="background: rgba(15, 23, 42, 0.6); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;"><code style="color: #60a5fa;">int led = 13;
int punto = 200;
int raya = 600;

void setup() {
  pinMode(led, OUTPUT);
}

void loop() {
  // S (...)
  digitalWrite(led, HIGH); delay(punto); digitalWrite(led, LOW); delay(punto);
  digitalWrite(led, HIGH); delay(punto); digitalWrite(led, LOW); delay(punto);
  digitalWrite(led, HIGH); delay(punto); digitalWrite(led, LOW); delay(punto);

  delay(600); // Pausa entre letras

  // O (---)
  digitalWrite(led, HIGH); delay(raya); digitalWrite(led, LOW); delay(punto);
  digitalWrite(led, HIGH); delay(raya); digitalWrite(led, LOW); delay(punto);
  digitalWrite(led, HIGH); delay(raya); digitalWrite(led, LOW); delay(punto);

  delay(600); // Pausa entre letras

  // S (...)
  digitalWrite(led, HIGH); delay(punto); digitalWrite(led, LOW); delay(punto);
  digitalWrite(led, HIGH); delay(punto); digitalWrite(led, LOW); delay(punto);
  digitalWrite(led, HIGH); delay(punto); digitalWrite(led, LOW); delay(punto);

  delay(2000); // Pausa antes de repetir el mensaje
}</code></pre>
            `
        },
        {
            title: 'Sirena Policial',
            content: `
                <h4>Reto: Patrulla en Emergencia</h4>
                <p style="margin-bottom: 1rem;">Usa variables para alternar dos luces a una velocidad de 300ms.</p>
                <pre style="background: rgba(15, 23, 42, 0.6); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;"><code style="color: #60a5fa;">int azul = 13;
int rojo = 12;
int espera = 300;

void setup() {
  pinMode(azul, OUTPUT);
  pinMode(rojo, OUTPUT);
}

void loop() {
  digitalWrite(azul, HIGH); digitalWrite(rojo, LOW); delay(espera);
  digitalWrite(azul, LOW); digitalWrite(rojo, HIGH); delay(espera);
}</code></pre>
            `
        },
        {
            title: 'Secuenciador',
            content: `
                <div style="text-align: center; padding: 1rem;">
                    <h4 style="color: #60a5fa; margin-bottom: 1.5rem;">ðŸ”¥ DesafÃ­o: El Auto FantÃ¡stico</h4>
                    <p style="margin-bottom: 1.5rem; color: #cbd5e1;">Crea un efecto de barrido horizontal usando 5 LEDs conectados de forma consecutiva.</p>
                    
                    <div style="background: rgba(168, 85, 247, 0.05); border: 1px dashed rgba(168, 85, 247, 0.2); padding: 1.5rem; border-radius: 20px; text-align: left; margin-bottom: 2rem;">
                        <h5 style="color: #a855f7; margin-bottom: 1rem;">MisiÃ³n de IngenierÃ­a:</h5>
                        <p style="font-size: 0.9rem; color: #94a3b8; line-height: 1.6;">
                            Programar un sistema que encienda un LED tras otro y luego regrese, creando un efecto de ida y vuelta.
                            <br><br>
                            <strong>Requisitos TÃ©cnicos:</strong>
                            <ul style="margin-top: 0.5rem; padding-left: 1.2rem; color: #cbd5e1;">
                                <li>Pines: <code>p1 = 12, p2 = 11, p3 = 10, p4 = 9, p5 = 8</code>.</li>
                                <li>Variable de tiempo: <code>int vel = 200;</code>.</li>
                                <li>Pista: Â¡Debes encender uno y apagar el anterior!</li>
                            </ul>
                        </p>
                    </div>
                    
                    <a href="https://www.tinkercad.com/dashboard" target="_blank" style="background: #ef4444; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 800; display: inline-block;">
                        Abrir Tinkercad
                    </a>
                </div>
            `
        },
        {
            title: 'SemÃ¡foro',
            content: `
                <div style="text-align: center; padding: 1rem;">
                    <h4 style="color: #60a5fa; margin-bottom: 1.5rem;">ðŸš¨ DesafÃ­o Maestro: El Cruce Maestro</h4>
                    <p style="margin-bottom: 1.5rem; color: #cbd5e1;">Crea un semÃ¡foro vehicular completo usando variables para cada color y tiempo.</p>
                    
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px dashed rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 20px; text-align: left; margin-bottom: 2rem;">
                        <h5 style="color: white; margin-bottom: 1rem;">Especificaciones del Sistema:</h5>
                        <p style="font-size: 0.9rem; color: #94a3b8; line-height: 1.6;">
                            Debes programar la secuencia oficial de trÃ¡fico usando variables para optimizar tu cÃ³digo.
                            <br><br>
                            <strong>Plan de Trabajo:</strong>
                            <ul style="margin-top: 0.5rem; padding-left: 1.2rem; color: #cbd5e1;">
                                <li>Usa 3 variables <code>int</code> para los pines (12, 11, 10).</li>
                                <li>Usa variables <code>long</code> para los tiempos de espera largos.</li>
                                <li>Secuencia: Rojo -> Rojo+Amarillo -> Verde -> Amarillo.</li>
                            </ul>
                        </p>
                    </div>
                    
                    <a href="https://www.tinkercad.com/dashboard" target="_blank" style="background: #ef4444; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 800; display: inline-block;">
                        Ir a Tinkercad
                    </a>
                </div>
            `
        }
    ],
    flashcards: [
        { id: 'l2-f1', type: 'code', q: 'Â¿QuÃ© tipo de dato usarÃ­as para un contador de 0 a 100?', a: 'int', sub: 'Para nÃºmeros enteros', sectionId: 're-2-3' },
        { id: 'l2-f2', type: 'code', q: 'Â¿QuÃ© tipo de dato usarÃ­as para el tiempo en milisegundos?', a: 'long', sub: 'Para valores de tiempo largos', sectionId: 're-2-3' },
        { id: 'l2-f3', type: 'code', q: 'Â¿CuÃ¡l es el valor inicial de "espera" en la Patrulla?', a: '300', sub: 'Pausa de 300ms entre luces', sectionId: 're-2-2' },
        { id: 'l2-f4', type: 'code', q: 'Â¿CÃ³mo se llama el efecto del Reto 4?', a: 'Auto FantÃ¡stico', sub: 'Barrido secuencial de 5 LEDs', sectionId: 're-2-2' },
        { id: 'l2-f5', type: 'code', q: 'Â¿QuÃ© variable controla la velocidad del barrido?', a: 'int vel = 200;', sub: 'Define la pausa en el secuenciador', sectionId: 're-2-2' },
        { id: 'l2-f6', type: 'code', q: 'Â¿QuÃ© tipo de dato guarda una sola letra?', a: 'char', sub: 'Character', sectionId: 're-2-3' },
        { id: 'l2-f7', type: 'code', q: 'Â¿Es "2_led" un nombre de variable vÃ¡lido?', a: 'No', sub: 'No pueden empezar con nÃºmeros', sectionId: 're-2-2' },
        { id: 'l2-f8', type: 'code', q: 'Â¿QuÃ© funciÃ³n configuramos en el setup?', a: 'pinMode()', sub: 'Define si es INPUT u OUTPUT', sectionId: 're-2-2' },
        { id: 'l2-f9', type: 'code', q: 'Â¿Para quÃ© sirve el punto y coma (;)?', a: 'Terminar lÃ­nea', sub: 'Indica el fin de una instrucciÃ³n', sectionId: 're-2-1' },
        { id: 'l2-f10', type: 'code', q: 'Â¿CÃ³mo comentas una sola lÃ­nea de cÃ³digo?', a: '// Comentario', sub: 'Usa doble barra inclinada', sectionId: 're-2-1' },
        { id: 'l2-f11', type: 'code', q: 'Â¿QuÃ© tipo de dato es 24.5?', a: 'float', sub: 'Para nÃºmeros con decimales', sectionId: 're-2-3' },
        { id: 'l2-f12', type: 'code', q: 'Â¿CÃ³mo defines un pin como salida?', a: 'OUTPUT', sub: 'Modo de trabajo del pin', sectionId: 're-2-2' }
    ],
    questions: [
        {
            id: 're-m1-l2-q1',
            q: "Â¿Para quÃ© sirven los comentarios en un programa de Arduino?",
            options: ["Para acelerar el microcontrolador", "Para explicar el cÃ³digo a las personas", "Para convertir variables en constantes", "Para reemplazar pinMode()"],
            correct: 1,
            objective: 'Reconocer la funciÃ³n de los comentarios',
            concept: 'comentarios',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l2-q2',
            q: "Â¿QuÃ© sintaxis corresponde a un comentario de una sola lÃ­nea?",
            options: ["/* comentario */", "// comentario", "# comentario", "<!-- comentario -->"],
            correct: 1,
            objective: 'Identificar el formato de comentario de una lÃ­nea',
            concept: 'comentario-linea',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l2-q3',
            q: "En la analogÃ­a de la lecciÃ³n, una variable se parece a:",
            options: ["Un cable sin etiqueta", "Una caja con nombre para guardar datos", "Un botÃ³n que solo enciende LEDs", "Un sensor de temperatura"],
            correct: 1,
            objective: 'Comprender la idea de variable como contenedor',
            concept: 'variables',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l2-q4',
            q: "En la expresiÃ³n 'int tiempoEspera = 1000;', Â¿quÃ© representa 'tiempoEspera'?",
            options: ["El tipo de dato", "El nombre de la variable", "El valor inicial", "El comentario del programa"],
            correct: 1,
            objective: 'Distinguir las partes de una declaraciÃ³n',
            concept: 'nombre-variable',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l2-q5',
            q: "Â¿Por quÃ© es Ãºtil usar una variable como 'pausa' en vez de repetir el nÃºmero 200 muchas veces?",
            options: ["Porque evita escribir setup()", "Porque permite cambiar el tiempo en un solo lugar", "Porque elimina la necesidad de LEDs", "Porque convierte el dato en bool"],
            correct: 1,
            objective: 'Valorar el uso de variables para mantenimiento del cÃ³digo',
            concept: 'mantenibilidad',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l2-q6',
            q: "Â¿QuÃ© tipo de dato usarÃ­as para guardar un nÃºmero entero como el pin 13?",
            options: ["String", "float", "int", "bool"],
            correct: 2,
            objective: 'Seleccionar el tipo correcto para enteros',
            concept: 'tipos-int',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l2-q7',
            q: "Â¿QuÃ© tipo de dato conviene para un valor decimal como 25.5?",
            options: ["char", "float", "bool", "long"],
            correct: 1,
            objective: 'Seleccionar el tipo correcto para decimales',
            concept: 'tipos-float',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l2-q8',
            q: "Â¿QuÃ© tipo de dato solo puede almacenar true o false?",
            options: ["bool", "int", "String", "char"],
            correct: 0,
            objective: 'Reconocer el tipo booleano',
            concept: 'tipos-bool',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l2-q9',
            q: "Â¿CuÃ¡l de estos nombres sigue mejor la recomendaciÃ³n de ser descriptivo y usar camelCase?",
            options: ["x", "2led", "tiempoEspera", "PIN-LED"],
            correct: 2,
            objective: 'Aplicar buenas prÃ¡cticas de nombrado',
            concept: 'camelcase',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l2-q10',
            q: "SegÃºn la lecciÃ³n, Â¿para quÃ© se usa con frecuencia el tipo 'long'?",
            options: ["Guardar una sola letra", "Manejar tiempos largos como millis()", "Representar verdadero o falso", "Escribir comentarios multilÃ­nea"],
            correct: 1,
            objective: 'Relacionar tipos de datos con usos reales en Arduino',
            concept: 'tipos-long',
            difficulty: 'medium'
        }
    ]
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 're-m1-l2-content',
                content: lessonDefinition.content,
                challenges: lessonDefinition.challenges,
                hasSimulator: lessonDefinition.hasSimulator
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 're-m1-l2-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        prueba: [
            createQuizBlock({
                id: 're-m1-l2-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions,
                quizConfig: lessonDefinition.quizConfig
            })
        ]
    }
});
