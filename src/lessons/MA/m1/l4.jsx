import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Herramientas de Modelado Esenciales — Proyecto: Torre y Alfil',
    hasSimulator: true,
    content: `
        <!-- ── 4.0 Continuación del Proyecto Ajedrez ── -->
        <h3 id="ma-4-0" style="color: #ec4899; margin: 1.5rem 0 1rem; font-size: 1.4rem;">4.0 🏆 Seguimos con el Ajedrez: Torre y Alfil</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Con el Peón ya modelado en la lección anterior, ahora dominaremos las <strong>cuatro herramientas de modelado esenciales</strong> de Blender: <strong>Extrusión (E)</strong>, <strong>Inset (I)</strong>, <strong>Bevel (Ctrl + B)</strong> y <strong>Loop Cut (Ctrl + R)</strong>. Con ellas construiremos dos piezas nuevas del proyecto: la <strong>Torre</strong> 🏰 (con sus almenas) y el <strong>Alfil</strong> 🛕 (con su collar y punta biselada).
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 2rem;">
            <div style="background: rgba(167, 139, 250, 0.1); border: 1.5px solid rgba(167, 139, 250, 0.35); border-radius: 14px; padding: 1rem; text-align: center;">
                <div style="font-size: 1.8rem;">🏰</div>
                <div style="color: #a78bfa; font-weight: 900; font-size: 1.05rem;">La Torre</div>
                <p style="color: #94a3b8; font-size: 0.78rem; margin: 6px 0 0;">Cuerpo cilíndrico + plataforma superior (Inset) + 8 almenas extruidas.</p>
            </div>
            <div style="background: rgba(245, 158, 11, 0.1); border: 1.5px solid rgba(245, 158, 11, 0.35); border-radius: 14px; padding: 1rem; text-align: center;">
                <div style="font-size: 1.8rem;">🛕</div>
                <div style="color: #f59e0b; font-weight: 900; font-size: 1.05rem;">El Alfil</div>
                <p style="color: #94a3b8; font-size: 0.78rem; margin: 6px 0 0;">Cuello fino + collar extruido + cabeza esférica con punta biselada (Bevel).</p>
            </div>
        </div>

        <!-- ── 4.1 Extrusión (E) ── -->
        <h3 id="ma-4-1" style="color: #ec4899; margin: 2rem 0 1rem; font-size: 1.4rem;">4.1 Extrusión (Tecla E): Estirar la Malla</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            La <strong>Extrusión</strong> es la herramienta más importante del modelado poligonal. Seleccionas una cara, una arista o un vértice, presionas <kbd>E</kbd> y la malla se <strong>estira creando nueva geometría</strong> conectada al original. Es como si "jalaras" una burbuja de plastilina: las caras se multiplican y se eleva el volumen.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 2rem;">
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(236, 72, 153, 0.4); border-radius: 14px; padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 1.05rem; font-weight: 900; color: #ec4899;">⬆️ Extruir cara</span>
                    <kbd style="background: #1e293b; border: 1px solid #475569; border-radius: 4px; padding: 2px 8px; font-size: 0.8rem; color: #ec4899; font-weight: 800;">E + Z</kbd>
                </div>
                <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin: 0;">
                    Selecciona la cara superior del cilindro (Tecla 3), pulsa <strong>E</strong> y arrastra hacia arriba. Así se alargan las almenas de la Torre: cada almena es una cara extruida que forma un prisma.
                </p>
            </div>

            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(34, 197, 94, 0.4); border-radius: 14px; padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 1.05rem; font-weight: 900; color: #22c55e;">↔️ Extruir con escala</span>
                    <kbd style="background: #1e293b; border: 1px solid #475569; border-radius: 4px; padding: 2px 8px; font-size: 0.8rem; color: #22c55e; font-weight: 800;">E + S</kbd>
                </div>
                <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin: 0;">
                    Después de extruir pulsa <strong>S</strong> para escalar la nueva cara. Así se ensancha la base del Peón o se estrecha el cuello del Alfil con un solo movimiento continuo.
                </p>
            </div>
        </div>

        <!-- ── 4.2 Inset (I) ── -->
        <h3 id="ma-4-2" style="color: #ec4899; margin: 2rem 0 1rem; font-size: 1.4rem;">4.2 Inset (Tecla I): El Rebaje Interior</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Con una cara seleccionada, la herramienta <strong>Inset</strong> (pulsando <kbd>I</kbd>) crea una <strong>nueva cara interior más pequeña</strong> dentro de la original, dejando un "marco" poligonal alrededor. Es la operación contraria a la escala: no reduce el objeto completo, solo encoge la cara activa creando un borde.
        </p>

        <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(56, 189, 248, 0.4); border-radius: 14px; padding: 1.25rem; margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 1.05rem; font-weight: 900; color: #38bdf8;">🔲 Inset en la Torre</span>
                <kbd style="background: #1e293b; border: 1px solid #475569; border-radius: 4px; padding: 2px 8px; font-size: 0.8rem; color: #38bdf8; font-weight: 800;">I</kbd>
            </div>
            <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; margin: 0 0 8px;">
                En la cara superior del cilindro de la Torre, pulsa <strong>I</strong> y reduce el tamaño: obtendrás un disco interior rodeado de un anillo. Luego extruye el disco <strong>hacia abajo</strong> para crear la cavidad o <strong>mantén el anillo</strong> como base de apoyo de las almenas. El Inset es también la base para hacer agujeros y hendiduras en cualquier objeto.
            </p>
            <div style="background: rgba(56, 189, 248, 0.1); border-radius: 6px; padding: 6px 10px; font-size: 0.78rem; color: #7dd3fc;">
                💡 Encadenar I + E (Inset + Extrude) permite construir la mayoría de formas industriales: bandejas, asientos, medallas y bases de piezas.
            </div>
        </div>

        <!-- ── 4.3 Bevel (Ctrl + B) ── -->
        <h3 id="ma-4-3" style="color: #ec4899; margin: 2rem 0 1rem; font-size: 1.4rem;">4.3 Bevel (Ctrl + B): Suavizar Aristas</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Las aristas <strong>vivas</strong> (perfectamente afiladas) se ven artificiales y frágiles. El <strong>Bevel</strong> (biselado) corta y redondea esas aristas, creando un <strong>chaflán</strong> que las suaviza de forma controlada con <kbd>Ctrl + B</kbd>. Es el toque final que da a las piezas su aspecto de marfil pulido.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 2rem;">
            <div style="background: rgba(245, 158, 11, 0.08); border: 1.5px solid rgba(245, 158, 11, 0.4); border-radius: 14px; padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 1.05rem; font-weight: 900; color: #f59e0b;">🛕 Biselar el Alfil</span>
                    <kbd style="background: #1e293b; border: 1px solid #475569; border-radius: 4px; padding: 2px 8px; font-size: 0.8rem; color: #f59e0b; font-weight: 800;">Ctrl + B</kbd>
                </div>
                <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin: 0;">
                    Selecciona las aristas del collar y de la base del Alfil y presiona <strong>Ctrl + B</strong>. Arrastrando el ratón controlas el grosor del chaflán y con la rueda aumentas los segmentos del redondeo.
                </p>
            </div>

            <div style="background: rgba(239, 68, 68, 0.08); border: 1.5px solid rgba(239, 68, 68, 0.4); border-radius: 14px; padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 1.05rem; font-weight: 900; color: #ef4444;">🎯 Bevel con segmentos</span>
                    <kbd style="background: #1e293b; border: 1px solid #475569; border-radius: 4px; padding: 2px 8px; font-size: 0.8rem; color: #ef4444; font-weight: 800;">Ctrl + B + Rueda</kbd>
                </div>
                <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin: 0;">
                    Gira la rueda del ratón durante el biselado para aumentar el número de <strong>segmentos del redondeo</strong>. Más segmentos = curva más suave. Un valor de 3 a 4 basta para piezas pequeñas.
                </p>
            </div>
        </div>

        <!-- ── 4.4 Loop Cut (Ctrl + R) ── -->
        <h3 id="ma-4-4" style="color: #ec4899; margin: 2rem 0 1rem; font-size: 1.4rem;">4.4 Loop Cut (Ctrl + R): Cortar Anillos de Aristas</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            El <strong>Loop Cut</strong> (corte por bucle) inserta un <strong>anillo completo de aristas nuevas</strong> que recorre toda la malla horizontalmente, dividiendo el objeto en dos bandas. Es la herramienta perfecta para crear "pestañas" de detalle donde luego extruiremos. Con la rueda del ratón puedes añadir <strong>varios cortes equidistantes</strong> a la vez.
        </p>

        <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.92) 100%); border: 1.5px solid rgba(236, 72, 153, 0.35); border-radius: 16px; padding: 1.25rem; margin-bottom: 2rem;">
            <h4 style="color: #ec4899; margin: 0 0 10px; font-size: 1.05rem; font-weight: 800;">⚔️ El Flujo Loop Cut → Extrude en la Torre</h4>
            <ol style="color: #cbd5e1; font-size: 0.86rem; line-height: 1.9; margin: 0; padding-left: 1.25rem;">
                <li><strong style="color: #38bdf8;">Corta:</strong> Pulsa <kbd>Ctrl + R</kbd> sobre el cilindro base y desplázate para situar el anillo de corte en la parte superior (o hazlo 2-3 veces: rueda + clic para multiplicar cortes).</li>
                <li><strong style="color: #38bdf8;">Selecciona:</strong> Con la tecla 2 (aristas) o 3 (caras), selecciona las caras del borde superior exterior.</li>
                <li><strong style="color: #38bdf8;">Extruye:</strong> Pulsa <kbd>E + Z</kbd> y eleva las caras para formar cada almena vertical.</li>
                <li><strong style="color: #38bdf8;">Repite en círculo:</strong> Corporiza las 8 almenas alrededor del borde. ¡Torre terminada! 🏰</li>
            </ol>
        </div>

        <!-- Visor Interactivo del Constructor de Piezas (Torre y Alfil) -->
        <div style="margin: 2.5rem 0;">
            <div id="chess-piece-lab-container"></div>
        </div>

        <!-- ── 4.5 Resumen de Herramientas ── -->
        <h3 id="ma-4-5" style="color: #ec4899; margin: 2rem 0 1rem; font-size: 1.4rem;">4.5 Tabla Maestra de Herramientas de Modelado</h3>
        <div style="background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; overflow: hidden; margin-bottom: 2rem;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.86rem; text-align: left;">
                <thead>
                    <tr style="background: rgba(236, 72, 153, 0.15); border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <th style="padding: 10px 14px; color: #ec4899; font-weight: 800;">Atajo</th>
                        <th style="padding: 10px 14px; color: #f8fafc; font-weight: 800;">Herramienta</th>
                        <th style="padding: 10px 14px; color: #94a3b8; font-weight: 800;">Uso en el Ajedrez</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px;"><kbd style="color: #ec4899; font-weight: 800;">E</kbd></td>
                        <td style="padding: 10px 14px; color: #cbd5e1;">Extruir (Extrude)</td>
                        <td style="padding: 10px 14px; color: #94a3b8;">Almenas de la Torre, cuello y base del Alfil</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px;"><kbd style="color: #ec4899; font-weight: 800;">I</kbd></td>
                        <td style="padding: 10px 14px; color: #cbd5e1;">Inset (Rebaje interior)</td>
                        <td style="padding: 10px 14px; color: #94a3b8;">Plataforma superior de la Torre y cavidades</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px;"><kbd style="color: #ec4899; font-weight: 800;">Ctrl + B</kbd></td>
                        <td style="padding: 10px 14px; color: #cbd5e1;">Bevel (Biselar)</td>
                        <td style="padding: 10px 14px; color: #94a3b8;">Redondear aristas del collar y la cabeza del Alfil</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px;"><kbd style="color: #ec4899; font-weight: 800;">Ctrl + R</kbd></td>
                        <td style="padding: 10px 14px; color: #cbd5e1;">Loop Cut (Corte por bucle)</td>
                        <td style="padding: 10px 14px; color: #94a3b8;">Ubicar anillos de detalle y separar secciones del cuerpo</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 14px;"><kbd style="color: #ec4899; font-weight: 800;">E + S</kbd></td>
                        <td style="padding: 10px 14px; color: #cbd5e1;">Extruir + Escalar</td>
                        <td style="padding: 10px 14px; color: #94a3b8;">Ensanchar la base o estrechar cuellos en un solo gesto</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- ── Retos extra ── -->
        <div style="background: rgba(56, 189, 248, 0.06); border: 1px dashed rgba(56, 189, 248, 0.35); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem;">
            <h4 style="color: #38bdf8; margin: 0 0 8px; font-size: 1rem; font-weight: 800;">🎁 Retos de sobre y práctica (proyecto personal)</h4>
            <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.7; margin: 0;">
                Con las mismas 4 herramientas puedes modelar el <strong>trencito de juguete 🚂</strong> (vagón con Loop Cut + Extrude, ruedas con cilindros extruidos) y los <strong>jarrones decorativos 🏺</strong> (perfil revolucionado + Inset en la boca + Bevel en el borde). Intenta también una <strong>taza</strong>, un <strong>cuenco de frutas</strong> o tu <strong>ficha personalizada</strong> para el tablero futuro.
            </p>
        </div>
    `,
    flashcards: [
        {
            front: '¿Cuál es el atajo de la herramienta Extrusión (Extrude) en Blender?',
            back: 'La tecla E. Estira la selección creando nueva geometría conectada, ideal para almenas, cuellos y bases.'
        },
        {
            front: '¿Para qué sirve la herramienta Inset (tecla I)?',
            back: 'Crea una cara interior más pequeña dentro de la cara seleccionada, dejando un marco poligonal. Es la base para huecos, plataformas y hendiduras.'
        },
        {
            front: '¿Qué herramienta suaviza las aristas vivas creando un chaflán controlado?',
            back: 'El Bevel (Ctrl + B). Corta y redondea las aristas; con la rueda del ratón se añaden segmentos para un redondeo más suave.'
        },
        {
            front: '¿Cómo se inserta un anillo completo de aristas nuevas que divide la malla?',
            back: 'Con Loop Cut (Ctrl + R). Crea cortes horizontales equidistantes, perfectos para detallar y luego extruir secciones.'
        },
        {
            front: '¿Qué dos piezas del ajedrez se modelan en la Lección 4?',
            back: 'La Torre 🏰 (cuerpo cilíndrico, plataforma Inset y 8 almenas extruidas) y el Alfil 🛕 (cuello, collar extruido y punta biselada).'
        },
        {
            front: '¿Qué secuencia de atajos permite crear almenas en la Torre?',
            back: 'Ctrl + R (Loop Cut) para ubicar el anillo superior, seleccionar las caras del borde con la tecla 3 y extruirlas con E + Z.'
        },
        {
            front: '¿Cómo se aumenta la suavidad del redondeo durante un Bevel?',
            back: 'Girando la rueda del ratón mientras se arrastra el biselado: cada click añade un segmento más a la curva.'
        },
        {
            front: '¿Qué combinación de teclas extruye y escala a la vez en un solo movimiento?',
            back: 'E seguida de S: primero se extruye y luego se escala la nueva cara para ensanchar o estrechar la forma.'
        },
        {
            front: '¿Qué herramientas se usan para modelar el trencito de juguete 🚂 del proyecto personal?',
            back: 'Loop Cut (Ctrl + R) para el vagón, Extrusión (E) para paredes y ruedas, y Bevel (Ctrl + B) en las esquinas para un acabado suave.'
        },
        {
            front: '¿Cómo se modelan los jarrones decorativos 🏺 del proyecto personal?',
            back: 'Por revolución del perfil (como el Peón), añadiendo Inset (I) en la boca para abrir el hueco y Bevel (Ctrl + B) en el borde para redondearlo.'
        }
    ],
    questions: [
        {
            question: '¿Qué tecla activa la herramienta de Extrusión en Blender?',
            options: [
                'E',
                'X',
                'G',
                'B'
            ],
            correct: 0,
            explanation: 'La tecla E (Extrude) estira la geometría seleccionada creando caras nuevas conectadas.'
        },
        {
            question: '¿Qué piezas del ajedrez se modelan en esta lección con las herramientas E, I, Ctrl+B y Ctrl+R?',
            options: [
                'La Torre y el Alfil',
                'El Rey y la Reina',
                'El Peón y el Caballo',
                'El Tablero y las fichas'
            ],
            correct: 0,
            explanation: 'La Lección 4 construye la Torre 🏰 (Inset + Extrude) y el Alfil 🛕 (Bevel + collar extruido).'
        },
        {
            question: '¿Para qué sirve la herramienta Inset (tecla I)?',
            options: [
                'Crea una cara interior más pequeña dentro de la cara seleccionada',
                'Rota la malla alrededor de su origen',
                'Duplica el objeto en el lugar',
                'Corta la malla por la mitad'
            ],
            correct: 0,
            explanation: 'El Inset encoge la cara activa generando un marco poligonal interior, base de plataformas y cavidades.'
        },
        {
            question: '¿Qué atajo corresponde al Bevel (biselado de aristas)?',
            options: [
                'Ctrl + B',
                'Ctrl + R',
                'Ctrl + L',
                'Alt + B'
            ],
            correct: 0,
            explanation: 'Ctrl + B bisela (redondea) las aristas seleccionadas, creando chaflanes controlados.'
        },
        {
            question: '¿Cómo se aumenta el número de segmentos de un redondeo Bevel?',
            options: [
                'Girando la rueda del ratón durante el biselado',
                'Presionando la tecla 9',
                'Haciendo doble clic derecho',
                'Activando el Modo Objeto'
            ],
            correct: 0,
            explanation: 'Cada paso de la rueda añade un segmento del redondeo; más segmentos producen curvas más suaves.'
        },
        {
            question: '¿Qué herramienta inserta un anillo completo de aristas nuevas alrededor del objeto?',
            options: [
                'Loop Cut (Ctrl + R)',
                'Bevel (Ctrl + B)',
                'Inset (I)',
                'Subdivide (Ctrl + E)'
            ],
            correct: 0,
            explanation: 'Loop Cut recorre la malla con un nuevo bucle de aristas, ideal para detallar secciones y apoyar extrusión.'
        },
        {
            question: '¿Cuál es la secuencia de atajos para extruir y escalar en un solo movimiento?',
            options: [
                'E seguido de S',
                'E seguido de R',
                'S seguido de E',
                'G seguido de S'
            ],
            correct: 0,
            explanation: 'Primero E extruye la nueva cara y luego S la escala, permitiendo ensanchar o estrechar la forma sin soltar el comando.'
        },
        {
            question: 'Para crear una almena de la Torre, ¿qué cara debe seleccionarse y extruirse?',
            options: [
                'La cara superior del borde del cilindro',
                'La cara inferior de la base',
                'Una cara lateral del interior',
                'Cualquier vértice del collar'
            ],
            correct: 0,
            explanation: 'Se seleccionan las caras del borde superior (tras un Loop Cut) y se extruyen hacia arriba con E + Z.'
        },
        {
            question: '¿Qué técnica combinan los jarrones decorativos 🏺 del proyecto personal?',
            options: [
                'Revolución de perfil + Inset en la boca + Bevel en el borde',
                'Exclusivamente box modeling con cubos',
                'Solo materiales con mapa de relieve',
                'Duplicación con Array sin edición'
            ],
            correct: 0,
            explanation: 'El jarrón se gira como el Peón, se abre el hueco con Inset y se redondea el borde con Bevel.'
        },
        {
            question: '¿Qué herramienta del Modo Edición "crea nueva geometría estirando la selección"?',
            options: [
                'Extrusión (E)',
                'Inset (I)',
                'Bevel (Ctrl + B)',
                'Scaling (S)'
            ],
            correct: 0,
            explanation: 'La extrusión estira caras, aristas o vértices generando malla nueva conectada — el corazón del modelado poligonal.'
        }
    ],
    quizConfig: { timePerQuestion: 20, requiredScorePercent: 80 }
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ma-m1-l4-content',
                content: lessonDefinition.content,
                hasSimulator: lessonDefinition.hasSimulator
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ma-m1-l4-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        simulador: [
            createContentBlock({
                id: 'ma-m1-l4-practice',
                content: `
                    <div style="margin-bottom: 2rem;">
                        <div id="chess-piece-lab-container"></div>
                    </div>
                `,
                hasSimulator: true
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ma-m1-l4-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions,
                quizConfig: lessonDefinition.quizConfig
            })
        ]
    }
});