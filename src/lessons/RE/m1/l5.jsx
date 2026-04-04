import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Evaluacion teorica del modulo 1',
    quizConfig: {
        title: 'Evaluacion teorica del modulo 1',
        timePerQuestion: 45,
        requiredScorePercent: 80
    },
    content: `
        <div class="lesson-intro">
            <p>Esta evaluacion integra los conceptos del modulo 1 de Robotica Educativa: hardware abierto, salidas digitales, variables, entradas digitales y monitor serie. No busca solo medir memoria; busca revelar <strong>patrones de comprension, duda y tiempo de respuesta</strong> para construir evidencia de aprendizaje.</p>
        </div>

        <div class="theory-section">
            <h3 id="re-5-1">5.1 Como interpretar esta evaluacion</h3>
            <p>Cada pregunta guarda informacion importante para el analisis pedagogico:</p>
            <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.18); border-radius: 18px; padding: 1.25rem;">
                <ul style="color: #cbd5e1; line-height: 1.8; padding-left: 1.2rem; margin: 0;">
                    <li>Tiempo invertido por pregunta.</li>
                    <li>Respuesta seleccionada y respuesta correcta.</li>
                    <li>Objetivo cognitivo asociado a la pregunta.</li>
                    <li>Concepto evaluado y nivel de dificultad.</li>
                </ul>
            </div>
            <p style="margin-top: 1rem;">Esa informacion sirve para detectar conceptos dominados, zonas de confusion, impulsividad, vacilacion y esfuerzo sostenido.</p>
        </div>

        <div class="theory-section">
            <h3 id="re-5-2">5.2 Competencias evaluadas</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div style="background: rgba(59, 130, 246, 0.07); border-radius: 16px; padding: 1rem; border: 1px solid rgba(59, 130, 246, 0.16);">
                    <h4 style="color: #60a5fa; margin-bottom: 0.4rem;">Comprension conceptual</h4>
                    <p style="color: #cbd5e1; line-height: 1.6; font-size: 0.92rem;">Arduino, estructura del sketch, variables, entradas y salida serial.</p>
                </div>
                <div style="background: rgba(16, 185, 129, 0.07); border-radius: 16px; padding: 1rem; border: 1px solid rgba(16, 185, 129, 0.16);">
                    <h4 style="color: #34d399; margin-bottom: 0.4rem;">Aplicacion logica</h4>
                    <p style="color: #cbd5e1; line-height: 1.6; font-size: 0.92rem;">Relacionar lectura, decision y accion dentro de un sistema interactivo.</p>
                </div>
                <div style="background: rgba(249, 115, 22, 0.07); border-radius: 16px; padding: 1rem; border: 1px solid rgba(249, 115, 22, 0.16);">
                    <h4 style="color: #fb923c; margin-bottom: 0.4rem;">Diagnostico de errores</h4>
                    <p style="color: #cbd5e1; line-height: 1.6; font-size: 0.92rem;">Identificar fallas comunes de cableado, sintaxis y monitoreo.</p>
                </div>
                <div style="background: rgba(244, 63, 94, 0.07); border-radius: 16px; padding: 1rem; border: 1px solid rgba(244, 63, 94, 0.16);">
                    <h4 style="color: #fb7185; margin-bottom: 0.4rem;">Evidencia analitica</h4>
                    <p style="color: #cbd5e1; line-height: 1.6; font-size: 0.92rem;">No solo importa acertar; tambien importa como responde el estudiante y cuanto tarda.</p>
                </div>
            </div>
        </div>

        <div class="theory-section">
            <h3 id="re-5-3">5.3 Recomendaciones antes de iniciar</h3>
            <ul style="color: #cbd5e1; line-height: 1.8; padding-left: 1.2rem;">
                <li>Lee cada pregunta completa antes de mirar las opciones.</li>
                <li>Relaciona la teoria con el comportamiento del hardware real o simulado.</li>
                <li>Si dudas, piensa en el flujo: configurar, leer, decidir, actuar, observar.</li>
                <li>Trabaja con calma: el sistema registrara tu tiempo por pregunta.</li>
            </ul>
        </div>
    `,
    flashcards: [
        { id: 'l5-f1', type: 'code', q: 'Que porcentaje minimo exige esta evaluacion para aprobar?', a: '80%', sub: 'Configurado como umbral del modulo', sectionId: 're-5-1' },
        { id: 'l5-f2', type: 'code', q: 'Cuanto tiempo tiene cada pregunta?', a: '45 segundos', sub: 'Tiempo individual por item', sectionId: 're-5-1' },
        { id: 'l5-f3', type: 'code', q: 'Que variable analitica se registra por pregunta?', a: 'Tiempo, acierto, opcion elegida y contexto cognitivo', sub: 'Base para analisis posterior', sectionId: 're-5-1' },
        { id: 'l5-f4', type: 'hw', q: 'Que flujo general resume el modulo 1?', a: 'Configurar, leer, decidir, actuar y observar', sub: 'Integra hardware y pensamiento logico', sectionId: 're-5-2' },
        { id: 'l5-f5', type: 'code', q: 'La evaluacion solo mide memoria?', a: 'No, tambien evidencia comprension y patrones de respuesta', sub: 'La nota final no cuenta toda la historia', sectionId: 're-5-2' }
    ],
    questions: [
        {
            id: 're-m1-l5-q1',
            q: 'Arduino se describe mejor como:',
            options: ['Un sistema operativo para robots', 'Una plataforma de hardware y software libre', 'Una aplicacion exclusiva para celulares', 'Un lenguaje de programacion orientado a videojuegos'],
            correct: 1,
            objective: 'Reconocer la naturaleza de Arduino',
            concept: 'arduino-plataforma',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q2',
            q: 'Cual es la funcion principal del bloque setup()?',
            options: ['Repetirse infinitamente', 'Configurar lo que debe ocurrir una sola vez al inicio', 'Mostrar el puntaje final', 'Guardar datos en la nube'],
            correct: 1,
            objective: 'Diferenciar setup y loop',
            concept: 'setup',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q3',
            q: 'Que bloque se ejecuta una y otra vez mientras la placa tiene energia?',
            options: ['setup()', 'pinMode()', 'loop()', 'delay()'],
            correct: 2,
            objective: 'Diferenciar setup y loop',
            concept: 'loop',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q4',
            q: 'Para que se usa pinMode(13, OUTPUT)?',
            options: ['Para leer un sensor analogico', 'Para declarar que el pin 13 trabajara como salida', 'Para iniciar el monitor serie', 'Para aumentar la corriente del puerto USB'],
            correct: 1,
            objective: 'Aplicar configuracion de pines',
            concept: 'pinmode',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q5',
            q: 'Que ocurre cuando se ejecuta digitalWrite(13, HIGH)?',
            options: ['El pin 13 entrega una senal alta', 'El pin 13 se vuelve analogo', 'El programa termina', 'Se borra la memoria del Arduino'],
            correct: 0,
            objective: 'Comprender salida digital',
            concept: 'digitalwrite',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q6',
            q: 'Que expresa delay(1000)?',
            options: ['Esperar 1000 segundos', 'Esperar un segundo', 'Encender el LED 1000 veces', 'Leer el pin 1000'],
            correct: 1,
            objective: 'Interpretar tiempos en milisegundos',
            concept: 'delay',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q7',
            q: 'Cual es una buena razon para usar variables en lugar de repetir numeros literales?',
            options: ['Porque las variables eliminan setup()', 'Porque facilitan cambios y hacen el codigo mas legible', 'Porque impiden usar comentarios', 'Porque solo asi funciona digitalRead()'],
            correct: 1,
            objective: 'Comprender valor pedagogico de las variables',
            concept: 'variables',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q8',
            q: 'Que tipo de dato es mas apropiado para guardar un numero entero como un pin?',
            options: ['String', 'bool', 'int', 'char'],
            correct: 2,
            objective: 'Seleccionar tipos de datos basicos',
            concept: 'tipos-int',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q9',
            q: 'Que tipo de dato se usa para verdadero o falso?',
            options: ['bool', 'float', 'long', 'String'],
            correct: 0,
            objective: 'Seleccionar tipos de datos basicos',
            concept: 'tipos-bool',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q10',
            q: 'Que ventaja ofrece comentar el codigo?',
            options: ['Hace que el microcontrolador trabaje al doble de velocidad', 'Ayuda a humanos a entender la intencion del programa', 'Reemplaza las llaves del programa', 'Convierte un error en acierto'],
            correct: 1,
            objective: 'Valorar comentarios como apoyo cognitivo',
            concept: 'comentarios',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q11',
            q: 'Una entrada digital sirve para:',
            options: ['Emitir solo luz', 'Detectar un estado logico alto o bajo', 'Medir siempre temperatura', 'Aumentar el almacenamiento'],
            correct: 1,
            objective: 'Comprender entradas digitales',
            concept: 'entrada-digital',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q12',
            q: 'Que funcion se usa para leer el estado de un pulsador?',
            options: ['analogWrite()', 'digitalRead()', 'Serial.begin()', 'pinMode()'],
            correct: 1,
            objective: 'Recordar lectura digital',
            concept: 'digitalread',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q13',
            q: 'Que riesgo existe si una entrada queda flotante?',
            options: ['Lee valores inestables por ruido', 'Se convierte en memoria flash', 'Arduino deja de tener GND', 'Se rompe el puerto serial'],
            correct: 0,
            objective: 'Reconocer el estado flotante',
            concept: 'pin-flotante',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l5-q14',
            q: 'Que ventaja practica tiene INPUT_PULLUP?',
            options: ['Agrega una resistencia interna de referencia', 'Convierte salidas en entradas analogicas', 'Evita escribir codigo', 'Aumenta la frecuencia del reloj'],
            correct: 0,
            objective: 'Comprender INPUT_PULLUP',
            concept: 'input-pullup',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l5-q15',
            q: 'Con INPUT_PULLUP, que lectura suele aparecer cuando el boton NO esta presionado?',
            options: ['LOW', 'HIGH', '1023', 'Depende del delay'],
            correct: 1,
            objective: 'Aplicar logica invertida',
            concept: 'input-pullup-logica',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l5-q16',
            q: 'El rebote mecanico de un pulsador puede provocar:',
            options: ['Multiples cambios rapidos de lectura', 'Mas memoria RAM', 'Desaparicion del GND', 'Un salto automatico a loop()'],
            correct: 0,
            objective: 'Comprender el debouncing',
            concept: 'rebote',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l5-q17',
            q: 'Cual describe mejor el patron de robotica interactiva visto en el modulo?',
            options: ['Leer, decidir y actuar', 'Borrar, instalar y reiniciar', 'Pintar, exportar y renderizar', 'Compilar, soldar y formatear'],
            correct: 0,
            objective: 'Integrar flujo de control',
            concept: 'leer-decidir-actuar',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q18',
            q: 'Para que se usa Serial.begin(9600)?',
            options: ['Para iniciar la comunicacion serial a cierta velocidad', 'Para apagar el puerto USB', 'Para leer entradas analogicas', 'Para declarar una variable'],
            correct: 0,
            objective: 'Comprender inicializacion serial',
            concept: 'serial-begin',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q19',
            q: 'Que representan los 9600 baudios?',
            options: ['La cantidad de preguntas del examen', 'La velocidad de transmision de datos', 'La memoria libre del IDE', 'La resistencia del pulsador'],
            correct: 1,
            objective: 'Comprender baudios',
            concept: 'baudios',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l5-q20',
            q: 'Que instruccion imprime texto y luego pasa a una nueva linea?',
            options: ['Serial.begin()', 'Serial.println()', 'digitalWrite()', 'pinMode()'],
            correct: 1,
            objective: 'Diferenciar metodos de salida serial',
            concept: 'serial-println',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q21',
            q: 'Que utilidad pedagogica tiene el Monitor Serie?',
            options: ['Permite ver el proceso interno del programa', 'Solo sirve para decorar la pantalla', 'Hace innecesario el uso de sensores', 'Reemplaza a las variables'],
            correct: 0,
            objective: 'Relacionar monitor serie con observacion cognitiva',
            concept: 'monitor-serie',
            difficulty: 'easy'
        },
        {
            id: 're-m1-l5-q22',
            q: 'Una buena practica al imprimir datos es:',
            options: ['Enviar miles de mensajes por segundo sin etiqueta', 'Usar etiquetas y una frecuencia manejable', 'Imprimir solo cuando hay errores fatales', 'Quitar todos los delays del proyecto por costumbre'],
            correct: 1,
            objective: 'Aplicar buenas practicas de impresion',
            concept: 'buenas-practicas-serial',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l5-q23',
            q: 'Si la velocidad del codigo y la del Monitor Serie no coinciden, que suele pasar?',
            options: ['La salida aparece ilegible', 'El LED cambia de color', 'Se activa INPUT_PULLUP automaticamente', 'Las variables se vuelven float'],
            correct: 0,
            objective: 'Diagnosticar un fallo serial comun',
            concept: 'sincronia-serial',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l5-q24',
            q: 'Que tipo de informacion conviene guardar por pregunta en una evaluacion analitica?',
            options: ['Solo el nombre del curso', 'Tiempo, respuesta elegida y si fue correcta', 'Solo la nota final del modulo', 'Unicamente la fecha de nacimiento'],
            correct: 1,
            objective: 'Comprender telemetria educativa basica',
            concept: 'telemetria',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l5-q25',
            q: 'Por que registrar tiempo por pregunta puede ser valioso?',
            options: ['Porque muestra patrones de duda, automatizacion o impulsividad', 'Porque reemplaza toda la teoria', 'Porque evita usar preguntas nuevas', 'Porque sube la nota automaticamente'],
            correct: 0,
            objective: 'Relacionar tiempo de respuesta con aprendizaje',
            concept: 'tiempo-respuesta',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l5-q26',
            q: 'Si un estudiante falla una pregunta rapidamente, que tipo de inferencia podria explorarse luego?',
            options: ['Posible respuesta impulsiva o conocimiento fragil', 'Que el computador se apago', 'Que la placa fisica estaba rota', 'Que la pregunta no existio'],
            correct: 0,
            objective: 'Introducir interpretacion analitica',
            concept: 'impulsividad',
            difficulty: 'hard'
        },
        {
            id: 're-m1-l5-q27',
            q: 'Si un estudiante tarda mucho y luego acierta, que patron podria sugerir?',
            options: ['Procesamiento deliberado o recuperacion esforzada', 'Error de conexion USB', 'Que uso demasiados LEDs', 'Que no leyo la pregunta'],
            correct: 0,
            objective: 'Introducir interpretacion analitica',
            concept: 'esfuerzo-cognitivo',
            difficulty: 'hard'
        },
        {
            id: 're-m1-l5-q28',
            q: 'Que aporta asociar cada pregunta con un concepto como "input-pullup" o "serial-begin"?',
            options: ['Permite detectar vacios por tema especifico', 'Obliga a usar solo preguntas faciles', 'Elimina la necesidad de docentes', 'Hace innecesaria la retroalimentacion'],
            correct: 0,
            objective: 'Comprender etiquetado conceptual',
            concept: 'mapa-conceptual',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l5-q29',
            q: 'En una plataforma orientada al aprendizaje, por que no basta con guardar solo el puntaje final?',
            options: ['Porque se pierde informacion del proceso y de los errores', 'Porque el puntaje nunca importa', 'Porque las preguntas no tienen opciones', 'Porque setup() deja de funcionar'],
            correct: 0,
            objective: 'Valorar datos de proceso sobre resultado unico',
            concept: 'proceso-vs-resultado',
            difficulty: 'medium'
        },
        {
            id: 're-m1-l5-q30',
            q: 'Cual de estas afirmaciones resume mejor el objetivo de esta evaluacion del modulo 1?',
            options: ['Calificar memoria aislada sin contexto', 'Medir comprension y generar evidencia para mejorar el aprendizaje', 'Probar solo la velocidad del navegador', 'Sustituir todas las actividades practicas'],
            correct: 1,
            objective: 'Integrar sentido pedagogico de la evaluacion',
            concept: 'evaluacion-analitica',
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
