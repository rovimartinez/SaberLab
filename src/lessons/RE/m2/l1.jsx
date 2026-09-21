import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Funciones Personalizadas en C++',
    content: `
        <div class="lesson-intro">
            <p>Conforme tus proyectos de robótica crecen, escribir todo el código dentro de <code>loop()</code> genera programas difíciles de leer, depurar y mantener. La solución profesional en C++ es la <strong>modularización mediante funciones personalizadas</strong>.</p>
        </div>

        <div class="theory-section">
            <h3 id="re-m2-1-1">1. ¿Qué es una Función en C++?</h3>
            <p>Una función es un bloque de código reutilizable diseñado para ejecutar una tarea específica. Al llamar a una función por su nombre, el programa salta a su ejecución y luego regresa al punto donde fue convocada.</p>
            <div class="highlight-panel" style="background: rgba(168, 85, 247, 0.08); border-left: 4px solid #a855f7; padding: 1rem; border-radius: 12px; margin: 1rem 0;">
                <p><strong>Ventajas clave de las funciones:</strong></p>
                <ul style="margin: 0; padding-left: 1.2rem; color: #cbd5e1; line-height: 1.6;">
                    <li><strong>Reutilización:</strong> Escribes el código una vez y lo ejecutas cuantas veces quieras.</li>
                    <li><strong>Legibilidad:</strong> Tu función <code>loop()</code> se convierte en una lista clara de acciones como <code>avanzar();</code> o <code>frenar();</code>.</li>
                    <li><strong>Facilidad de Depuración:</strong> Si un motor falla, corriges solo la función del motor sin alterar el resto del programa.</li>
                </ul>
            </div>
        </div>

        <div class="theory-section">
            <h3 id="re-m2-1-2">2. Estructura y Sintaxis de una Función</h3>
            <p>En Arduino C++, la estructura básica de una función de acción se define con la palabra clave <code>void</code>:</p>
            <pre style="background: rgba(15, 23, 42, 0.72); padding: 1.25rem; border-radius: 18px; border: 1px solid rgba(255,255,255,0.06); overflow-x: auto;"><code style="color: #cbd5e1;">void nombreDeFuncion() {
    // Código a ejecutar (Cuerpo de la función)
}</code></pre>
            <div style="background: rgba(59, 130, 246, 0.06); border: 1px solid rgba(59, 130, 246, 0.15); border-radius: 16px; padding: 1rem; margin-top: 1rem;">
                <h4 style="color: #60a5fa; margin-bottom: 0.5rem;">Funciones de Acción (<code>void</code>)</h4>
                <p style="color: #cbd5e1; font-size: 0.92rem; line-height: 1.6;">La palabra <code>void</code> indica que la función realiza una tarea directa (como encender un LED o activar un motor) y finaliza al terminar la última línea de su bloque.</p>
            </div>
        </div>

        <div class="theory-section">
            <h3 id="re-m2-1-3">3. Ejemplo Práctico: Funciones de Control de Actuadores</h3>
            <p>Observa cómo simplifica el código definir funciones para controlar un indicador lumínico:</p>
            <div id="function-control-simulator-container"></div>
        </div>

    `,
    sections: [
        { id: 're-m2-1-1', title: '1. ¿Qué es una Función en C++?' },
        { id: 're-m2-1-2', title: '2. Estructura y Sintaxis de una Función' },
        { id: 're-m2-1-3', title: '3. Ejemplo Práctico: Control de Actuadores' }
    ],
    flashcards: [
        {
            id: 'f1',
            type: 'theory',
            q: '¿Qué es una función personalizada en C++?',
            a: 'Bloque reutilizable de código',
            sub: 'Ejecuta una tarea específica al convocarse por su nombre y regresa al llamador.',
            sectionId: 're-m2-1-1'
        },
        {
            id: 'f2',
            type: 'code',
            q: '¿Qué significa la palabra clave void antes de una función?',
            a: 'Función de Acción directa',
            sub: 'Indica que ejecuta tareas sin devolver ningún resultado o valor numérico.',
            sectionId: 're-m2-1-2'
        },
        {
            id: 'f3',
            type: 'sw',
            q: '¿Cuál es la principal ventaja de modularizar con funciones?',
            a: 'Reutilización y Legibilidad',
            sub: 'Evita duplicar código, facilita encontrar fallos y hace el loop() comprensible.',
            sectionId: 're-m2-1-1'
        },
        {
            id: 'f4',
            type: 'code',
            q: '¿Cómo se convoca la función encenderAlerta en loop()?',
            a: 'encenderAlerta();',
            sub: 'Se escribe su nombre seguido de paréntesis y punto y coma.',
            sectionId: 're-m2-1-3'
        },
        {
            id: 'f5',
            type: 'sw',
            q: '¿Dónde se definen habitualmente las funciones en Arduino?',
            a: 'Fuera de setup() y loop()',
            sub: 'Se declaran en el ámbito global, comúnmente al final del sketch.',
            sectionId: 're-m2-1-2'
        },
        {
            id: 'f6',
            type: 'theory',
            q: '¿Qué ocurre con el flujo de ejecución al invocar una función?',
            a: 'Salto y Retorno inmediato',
            sub: 'El procesador ejecuta las líneas de la función y reanuda la siguiente línea del loop().',
            sectionId: 're-m2-1-1'
        },
        {
            id: 'f7',
            type: 'sw',
            q: '¿Puede una función llamar a otra función en C++?',
            a: 'Sí, mediante anidamiento',
            sub: 'Las funciones pueden convocarse mutuamente para resolver tareas complejas.',
            sectionId: 're-m2-1-1'
        },
        {
            id: 'f8',
            type: 'hw',
            q: 'En el demostrador, ¿qué función activa 5V en el Pin 13?',
            a: 'encenderAlerta()',
            sub: 'Ejecuta digitalWrite(13, HIGH) encendiendo el actuador lumínico.',
            sectionId: 're-m2-1-3'
        },
        {
            id: 'f9',
            type: 'sw',
            q: '¿Qué estándar de nomenclatura se recomienda para funciones?',
            a: 'camelCase descriptivo',
            sub: 'Nombres auto-explicativos como apagarAlerta() o avanzarRobot().',
            sectionId: 're-m2-1-2'
        },
        {
            id: 'f10',
            type: 'code',
            q: '¿Qué delimitadores encierran las instrucciones de una función?',
            a: 'Llaves { ... }',
            sub: 'Todo el código de la función debe quedar contenido entre la llave de apertura y cierre.',
            sectionId: 're-m2-1-2'
        }
    ],
    questions: [
        {
            id: 1,
            question: '¿Cuál es la sintaxis correcta para declarar una función de acción llamada "detenerMotores" en Arduino C++?',
            options: [
                'void detenerMotores() { }',
                'int detenerMotores(void) = null;',
                'function detenerMotores() { }',
                'detenerMotores() -> void { }'
            ],
            correct: 0,
            explanation: 'En C++, las funciones de acción se declaran con la palabra clave `void`, su nombre, paréntesis `()` y el bloque `{ }`.'
        },
        {
            id: 2,
            question: '¿Qué indica la palabra clave `void` al declarar una función?',
            options: [
                'Borra la memoria del microcontrolador.',
                'Indica que la función realiza acciones directamente sin retornar ningún valor.',
                'Desactiva los pines digitales.',
                'Obliga a reiniciar el bucle `loop()`.'
            ],
            correct: 1,
            explanation: '`void` especifica que la función ejecuta una serie de tareas y finaliza sin devolver un resultado numérico.'
        },
        {
            id: 3,
            question: '¿Cómo se convoca la ejecución de una función llamada `encenderAlerta` dentro de `loop()`?',
            options: [
                'call encenderAlerta;',
                'void encenderAlerta();',
                'encenderAlerta();',
                'run encenderAlerta;'
            ],
            correct: 2,
            explanation: 'Para llamar a una función se escribe su nombre seguido de paréntesis y punto y coma: `encenderAlerta();`.'
        },
        {
            id: 4,
            question: '¿Cuál es la principal ventaja pedagógica y técnica de dividir el código en funciones?',
            options: [
                'Hacer que el Arduino consuma el doble de corriente.',
                'Modularización: mejora la legibilidad, evita duplicar código y facilita la depuración.',
                'Limitar el programa a un máximo de 10 líneas.',
                'Desactivar los temporizadores internos de la placa.'
            ],
            correct: 1,
            explanation: 'La modularización permite reutilizar código y mantener un programa estructurado y fácil de mantener.'
        },
        {
            id: 5,
            question: '¿Dónde deben ubicarse las declaraciones de las funciones personalizadas en el sketch de Arduino?',
            options: [
                'Dentro de la función `delay()` únicamente.',
                'Fuera de `setup()` y `loop()`, usualmente al final del archivo de código.',
                'Obligatoriamente dentro del archivo `pins_arduino.h`.',
                'En la memoria EEPROM antes de encender la placa.'
            ],
            correct: 1,
            explanation: 'Las funciones se declaran a nivel de archivo (ámbito global), fuera de los bloques de `setup()` y `loop()`.'
        },
        {
            id: 6,
            question: '¿Qué sucede con el flujo de ejecución cuando el programa encuentra una llamada a una función?',
            options: [
                'El procesador salta al cuerpo de la función, ejecuta sus líneas y luego regresa al punto donde fue llamada.',
                'El microcontrolador se reinicia automáticamente.',
                'Se apagan todos los LEDs de la placa.',
                'Se borra la memoria flash del sketch.'
            ],
            correct: 0,
            explanation: 'El flujo salta a la función invocada y, tras terminar la última instrucción, reanuda la siguiente línea del llamador.'
        },
        {
            id: 7,
            question: 'En el demostrador práctico, ¿qué función se encarga de enviar 5V (HIGH) al Pin 13?',
            options: [
                'apagarAlerta()',
                'encenderAlerta()',
                'delay(1000)',
                'pinMode()'
            ],
            correct: 1,
            explanation: '`encenderAlerta()` contiene la instrucción `digitalWrite(13, HIGH)`, activando el estado lumínico del actuador.'
        },
        {
            id: 8,
            question: '¿Qué delimitadores encierran el bloque de código (cuerpo) de una función?',
            options: [
                'Paréntesis ( )',
                'Corchetes [ ]',
                'Llaves { }',
                'Comillas " "'
            ],
            correct: 2,
            explanation: 'En C y C++, los bloques de instrucciones de funciones se delimitan mediante llaves `{ }`.'
        },
        {
            id: 9,
            question: '¿Puede una función personalizada convocar a otra función dentro de su propio cuerpo?',
            options: [
                'No, está estrictamente prohibido en C++.',
                'Sí, las funciones pueden anidarse y convocarse mutuamente.',
                'Solo si la placa tiene conexión WiFi.',
                'Solo si se ejecuta dentro de un microcontrolador de 64 bits.'
            ],
            correct: 1,
            explanation: 'Las funciones pueden llamar a otras funciones para construir algoritmos más avanzados de forma modular.'
        },
        {
            id: 10,
            question: '¿Cuál de los siguientes nombres sigue las mejores prácticas de nomenclatura (`camelCase` descriptivo)?',
            options: [
                'f1()',
                'hacerCosa()',
                'activarAlarmaIncendio()',
                'x_123_temp()'
            ],
            correct: 2,
            explanation: '`activarAlarmaIncendio()` es auto-descriptivo, legible y sigue el estándar `camelCase` propio de Arduino y C++.'
        }
    ]
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 're-m2-l1-content',
                content: lessonDefinition.content
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 're-m2-l1-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        prueba: [
            createQuizBlock({
                id: 're-m2-l1-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions
            })
        ]
    }
});
