import { createContentBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const evaluationDefinition = {
    id: 're-m1-e1',
    title: 'Evaluacion del modulo 1',
    courseId: 5,
    moduleId: 'm1',
    points: 60,
    lessonSourceIds: ['re-m1-l1', 're-m1-l2', 're-m1-l3', 're-m1-l4', 're-m1-l5'],
    proctoringConfig: {
        requireFullscreen: true,
        maxWarnings: 3
    },
    quizConfig: {
        title: 'Evaluacion del modulo 1',
        timePerQuestion: 45,
        requiredScorePercent: 80
    },
    content: `
        <div class="lesson-intro">
            <p>Esta es la <strong>evaluacion del modulo 1 de Robotica Educativa</strong>. Integra los contenidos de hardware abierto, salidas digitales, variables, entradas digitales, monitor serie y entradas analogicas.</p>
        </div>

        <div class="theory-section">
            <h3 id="re-e1-1">Cobertura de la evaluacion</h3>
            <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.18); border-radius: 18px; padding: 1.25rem;">
                <ul style="color: #cbd5e1; line-height: 1.8; padding-left: 1.2rem; margin: 0;">
                    <li>Leccion 1: Arduino, hardware abierto, setup, loop y salidas digitales.</li>
                    <li>Leccion 2: comentarios, variables y tipos de datos.</li>
                    <li>Leccion 3: entradas digitales, pulsadores y resistencias pull-up o pull-down.</li>
                    <li>Leccion 4: monitor serie, baudios y depuracion inicial.</li>
                    <li>Leccion 5: entradas analogicas, potenciometros y resolucion de 10 bits.</li>
                </ul>
            </div>
        </div>

        <div class="theory-section">
            <h3 id="re-e1-2">Indicaciones</h3>
            <p>Lee con calma cada enunciado, relaciona las preguntas con el comportamiento del hardware y evita responder por memoria mecanica cuando puedas razonar desde el contenido del modulo.</p>
        </div>
    `,
    questions: [
        {
            id: 're-m1-e1-q1',
            q: 'Arduino se describe mejor como:',
            options: ['Un sistema operativo para robots', 'Una plataforma de hardware y software libre', 'Una aplicacion exclusiva para celulares', 'Un lenguaje orientado a videojuegos'],
            correct: 1,
            objective: 'Reconocer la naturaleza de Arduino',
            concept: 'arduino-plataforma',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q2',
            q: 'Cual es la funcion principal de setup() en un sketch de Arduino?',
            options: ['Repetirse de forma infinita', 'Configurar lo inicial una sola vez', 'Guardar notas del docente', 'Aumentar la memoria disponible'],
            correct: 1,
            objective: 'Diferenciar setup y loop',
            concept: 'setup',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q3',
            q: 'Que bloque del programa se ejecuta una y otra vez mientras la placa tiene energia?',
            options: ['setup()', 'loop()', 'pinMode()', 'Serial.begin()'],
            correct: 1,
            objective: 'Diferenciar setup y loop',
            concept: 'loop',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q4',
            q: 'Para que se usa pinMode(13, OUTPUT)?',
            options: ['Para leer un sensor analogico', 'Para declarar el pin 13 como salida', 'Para iniciar el monitor serie', 'Para apagar el puerto USB'],
            correct: 1,
            objective: 'Aplicar configuracion de pines',
            concept: 'pinmode',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q5',
            q: 'Que sucede cuando se ejecuta digitalWrite(13, HIGH)?',
            options: ['El pin entrega una senal alta', 'El pin cambia a entrada', 'El programa termina', 'La memoria se borra'],
            correct: 0,
            objective: 'Comprender el efecto de una salida digital',
            concept: 'digitalwrite',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q6',
            q: 'Para que sirve el pin 5V en Arduino Uno?',
            options: ['Para alimentar componentes', 'Para medir resistencia', 'Para reemplazar GND', 'Para programar el bootloader'],
            correct: 0,
            objective: 'Reconocer funciones basicas de la placa',
            concept: 'alimentacion-5v',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q7',
            q: 'Para que sirven los comentarios en un programa de Arduino?',
            options: ['Para acelerar el microcontrolador', 'Para explicar el codigo a las personas', 'Para cambiar un int a float', 'Para reemplazar setup()'],
            correct: 1,
            objective: 'Reconocer la funcion de los comentarios',
            concept: 'comentarios',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q8',
            q: 'Que sintaxis corresponde a un comentario de una sola linea?',
            options: ['/* comentario */', '// comentario', '# comentario', '<!-- comentario -->'],
            correct: 1,
            objective: 'Identificar la sintaxis correcta de comentarios',
            concept: 'comentario-linea',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q9',
            q: 'En la analogia de la leccion, una variable se parece a:',
            options: ['Una caja con etiqueta para guardar datos', 'Una resistencia de proteccion', 'Un pin quemado', 'Un puerto serial'],
            correct: 0,
            objective: 'Comprender la idea de variable como contenedor',
            concept: 'variables',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q10',
            q: "En 'int tiempoEspera = 1000;', que parte representa el nombre de la variable?",
            options: ['int', 'tiempoEspera', '1000', ';'],
            correct: 1,
            objective: 'Distinguir las partes de una declaracion',
            concept: 'nombre-variable',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q11',
            q: 'Que tipo de dato es adecuado para guardar un numero entero como un pin?',
            options: ['bool', 'int', 'String', 'char'],
            correct: 1,
            objective: 'Seleccionar tipos de datos basicos',
            concept: 'tipos-int',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q12',
            q: 'Que tipo de dato conviene para un valor decimal como 25.5?',
            options: ['char', 'float', 'bool', 'long'],
            correct: 1,
            objective: 'Seleccionar tipos de datos para decimales',
            concept: 'tipos-float',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q13',
            q: 'Segun la leccion, para que se usa con frecuencia el tipo long?',
            options: ['Para guardar una sola letra', 'Para tiempos largos como millis()', 'Para notas del programa', 'Para valores true o false'],
            correct: 1,
            objective: 'Relacionar tipos de datos con usos reales',
            concept: 'tipos-long',
            difficulty: 'medium'
        },
        {
            id: 're-m1-e1-q14',
            q: 'Cual es la funcion principal de una entrada digital en Arduino?',
            options: ['Detectar uno de dos estados logicos', 'Emitir senal PWM siempre', 'Medir decimales exactos', 'Aumentar la RAM'],
            correct: 0,
            objective: 'Comprender entradas digitales',
            concept: 'entradas-digitales',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q15',
            q: 'Que hace un pulsador en un circuito?',
            options: ['Convierte una senal digital en analogica', 'Abre o cierra un camino electrico', 'Aumenta el voltaje del pin', 'Hace mas rapido el reloj'],
            correct: 1,
            objective: 'Identificar el funcionamiento del pulsador',
            concept: 'pulsador',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q16',
            q: 'Que problema aparece cuando un pin de entrada queda sin referencia electrica clara?',
            options: ['Se vuelve analogo', 'Queda flotante y puede leer ruido', 'Se bloquea para siempre', 'Imprime texto automaticamente'],
            correct: 1,
            objective: 'Reconocer el estado flotante',
            concept: 'pin-flotante',
            difficulty: 'medium'
        },
        {
            id: 're-m1-e1-q17',
            q: 'Que funcion se usa para consultar el estado de un boton?',
            options: ['digitalRead()', 'digitalWrite()', 'analogWrite()', 'Serial.print()'],
            correct: 0,
            objective: 'Recordar la funcion de lectura digital',
            concept: 'digitalread',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q18',
            q: 'Con INPUT_PULLUP, que lectura suele aparecer cuando el boton NO esta presionado?',
            options: ['LOW', 'HIGH', '1023', 'Depende del LED'],
            correct: 1,
            objective: 'Aplicar la logica de INPUT_PULLUP',
            concept: 'input-pullup-logica',
            difficulty: 'medium'
        },
        {
            id: 're-m1-e1-q19',
            q: 'Que describe mejor el rebote mecanico de un boton?',
            options: ['Un aumento permanente de corriente', 'Una serie de cambios rapidos antes de estabilizarse', 'Una funcion del Monitor Serie', 'Una propiedad del pin 13'],
            correct: 1,
            objective: 'Identificar el fenomeno de rebote',
            concept: 'debouncing',
            difficulty: 'medium'
        },
        {
            id: 're-m1-e1-q20',
            q: 'En un sistema interactivo, despues de leer una entrada, que paso sigue?',
            options: ['Tomar una decision y actuar', 'Borrar el programa', 'Cambiar el tipo de dato', 'Reiniciar el USB'],
            correct: 0,
            objective: 'Relacionar lectura, decision y accion',
            concept: 'leer-decidir-actuar',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q21',
            q: 'Para que sirve el Monitor Serie en Arduino?',
            options: ['Para observar mensajes y datos del programa', 'Para cambiar un pin a analogico', 'Para duplicar la memoria', 'Para reemplazar la protoboard'],
            correct: 0,
            objective: 'Comprender el proposito del monitor serie',
            concept: 'monitor-serie',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q22',
            q: 'Que instruccion inicia la comunicacion serial?',
            options: ['Serial.start(9600)', 'Serial.begin(9600)', 'Serial.println(9600)', 'begin.Serial(9600)'],
            correct: 1,
            objective: 'Recordar la sintaxis de inicializacion serial',
            concept: 'serial-begin',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q23',
            q: 'Que representan los baudios en una comunicacion serial?',
            options: ['La velocidad de transmision de datos', 'La cantidad de pines', 'El brillo de un LED', 'La memoria restante'],
            correct: 0,
            objective: 'Comprender la velocidad serial',
            concept: 'baudios',
            difficulty: 'medium'
        },
        {
            id: 're-m1-e1-q24',
            q: 'Que diferencia principal hay entre Serial.print() y Serial.println()?',
            options: ['println agrega salto de linea', 'print solo funciona en setup()', 'println cambia el pin a salida', 'No existe diferencia'],
            correct: 0,
            objective: 'Diferenciar funciones de impresion serial',
            concept: 'serial-print',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q25',
            q: 'Cuando la velocidad configurada en el codigo y en el monitor no coincide, normalmente ocurre que:',
            options: ['La lectura sale ilegible o incorrecta', 'El boton se vuelve analogico', 'El LED cambia de color', 'La variable se convierte en float'],
            correct: 0,
            objective: 'Reconocer un fallo comun de comunicacion serial',
            concept: 'sincronia-serial',
            difficulty: 'medium'
        },
        {
            id: 're-m1-e1-q26',
            q: 'Que diferencia principal tiene una entrada analogica frente a una digital?',
            options: ['La analogica mide variaciones continuas de voltaje', 'La analogica solo detecta HIGH y LOW', 'La digital siempre usa A0', 'No hay diferencia'],
            correct: 0,
            objective: 'Distinguir entradas analogicas y digitales',
            concept: 'entrada-analogica',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q27',
            q: 'Que funcion se usa para leer una entrada como A0?',
            options: ['digitalRead(A0)', 'analogWrite(A0)', 'analogRead(A0)', 'pinMode(A0)'],
            correct: 2,
            objective: 'Recordar la funcion de lectura analogica',
            concept: 'analogread',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q28',
            q: 'En Arduino Uno, una lectura analogica normal va de:',
            options: ['0 a 255', '0 a 1023', '1 a 100', '-5 a 5'],
            correct: 1,
            objective: 'Reconocer el rango del ADC de Arduino Uno',
            concept: 'rango-analogico',
            difficulty: 'easy'
        },
        {
            id: 're-m1-e1-q29',
            q: 'Que significa que el ADC tenga 10 bits de resolucion?',
            options: ['Que puede dividir la entrada en 1024 niveles', 'Que mide hasta 10V', 'Que lee 10 sensores a la vez', 'Que imprime 10 lineas por segundo'],
            correct: 0,
            objective: 'Comprender la resolucion del ADC',
            concept: 'resolucion-10-bits',
            difficulty: 'medium'
        },
        {
            id: 're-m1-e1-q30',
            q: 'Cual es la conexion tipica de un potenciometro en Arduino?',
            options: ['Un extremo a 5V, otro a GND y el central a A0', 'Todos los terminales a GND', 'Solo al pin 13', 'Dos terminales a pines digitales y uno a RX'],
            correct: 0,
            objective: 'Reconocer el cableado basico del potenciometro',
            concept: 'conexion-potenciometro',
            difficulty: 'medium'
        }
    ]
};

export const module1EvaluationData = defineLesson({
    ...evaluationDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 're-m1-e1-content',
                content: evaluationDefinition.content
            })
        ],
        prueba: [
            createQuizBlock({
                id: 're-m1-e1-quiz',
                title: evaluationDefinition.title,
                questions: evaluationDefinition.questions,
                quizConfig: evaluationDefinition.quizConfig
            })
        ]
    }
});
