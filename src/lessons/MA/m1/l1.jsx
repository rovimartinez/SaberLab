import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Espacio 3D, Interfaz de Blender y Navegación Cartesiana',
    hasSimulator: true,
    content: `
        <!-- ── 1.0 Introducción al Espacio 3D y Computación Gráfica ── -->
        <h3 id="ma-1-0" style="color: #ec4899; margin: 1.5rem 0 1rem; font-size: 1.4rem;">1.0 El Salto al Espacio Tridimensional</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            En el diseño bidimensional tradicional trabajamos únicamente con dos dimensiones: ancho ($X$) y alto ($Y$). Sin embargo, en el <strong>Modelado y Animación 3D</strong> introducimos una tercera magnitud fundamental: la <strong>profundidad ($Z$)</strong>, permitiendo recrear volúmenes, luces, sombras, gravedad y dinamismo espacial idénticos al mundo real.
        </p>

        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            El software estándar en nuestro curso es <strong>Blender 4.x</strong>, una suite profesional de código abierto utilizada globalmente por estudios de videojuegos, cine de animación y efectos visuales (VFX). Para dominar Blender con destreza profesional, el primer paso indispensable es internalizar cómo se estructura el espacio tridimensional y dominar la navegación con soltura.
        </p>

        <!-- Tarjeta Conceptual del Espacio Cartesiano -->
        <div class="cartesian-card dark-lab-box" style="background: var(--surface-card); border: 1.5px solid rgba(236, 72, 153, 0.35); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: var(--shadow-card);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 1rem;">
                <h4 style="color: #ec4899; margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
                    🧭 El Espacio Cartesiano y la Regla de los Tres Colores
                </h4>
                <span style="background: rgba(236, 72, 153, 0.15); color: #ec4899; border: 1px solid #ec4899; padding: 2px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 800;">
                    Fundamento 3D
                </span>
            </div>

            <p style="color: var(--text-body); font-size: 0.9rem; line-height: 1.7; margin-bottom: 1rem;">
                Cada punto en el espacio 3D se localiza mediante una terna de coordenadas <strong>(X, Y, Z)</strong> respecto a un punto central llamado <strong>Origen del Mundo (0, 0, 0)</strong>. En computación gráfica y en Blender, los tres ejes se representan universalmente con los colores primarios aditivos <strong>RGB</strong>:
            </p>

            <!-- Desglose de Ejes RGB -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 0.85rem; margin-bottom: 1.25rem;">
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 0.85rem;">
                    <div style="color: #ef4444; font-weight: 900; font-size: 1.05rem; margin-bottom: 4px;">R = Red → Eje X</div>
                    <div style="color: var(--text-body);">Controla el <strong>Ancho</strong> (Horizontal: Izquierda / Derecha).</div>
                </div>
                <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 10px; padding: 0.85rem;">
                    <div style="color: #22c55e; font-weight: 900; font-size: 1.05rem; margin-bottom: 4px;">G = Green → Eje Y</div>
                    <div style="color: var(--text-body);">Controla la <strong>Profundidad</strong> (Adelante / Atrás).</div>
                </div>
                <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 10px; padding: 0.85rem;">
                    <div style="color: #3b82f6; font-weight: 900; font-size: 1.05rem; margin-bottom: 4px;">B = Blue → Eje Z</div>
                    <div style="color: var(--text-body);">Controla la <strong>Altura</strong> (Vertical: Arriba / Abajo, convención <em>Z-Up</em>).</div>
                </div>
            </div>

            <!-- Principio Mnemotécnico RGB -->
            <div style="background: var(--surface-card-subtle); border-left: 3px solid #ec4899; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.84rem; color: var(--text-body); line-height: 1.6; border: 1px solid var(--border-subtle); border-left: 3px solid #ec4899;">
                💡 <strong>Regla Nemotécnica Universal:</strong> Recuerda las siglas <strong style="color: var(--text-heading);">R-G-B</strong> en correspondencia con los ejes <strong style="color: var(--text-heading);">X-Y-Z</strong>:  
                <em>Rojo es X, Verde es Y, y Azul es Z</em>.
            </div>
        </div>

        <!-- Demostrador Interactivo del Espacio 3D -->
        <div style="margin: 2rem 0;">
            <div id="coordinate-space-demo-container"></div>
        </div>

        <!-- ── 1.1 Perspectiva vs Vista Ortográfica ── -->
        <h3 id="ma-1-1" style="color: #ec4899; margin: 2rem 0 1rem; font-size: 1.4rem;">1.1 Perspectiva vs Vista Ortográfica</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Uno de los conceptos más cruciales que todo artista 3D debe comprender es el modo en que el viewport proyecta el mundo tridimensional sobre tu pantalla plana:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <!-- Perspectiva -->
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px; padding: 1.25rem;">
                <h4 style="color: #38bdf8; margin: 0 0 0.5rem; font-size: 1.1rem;">👁️ Vista en Perspectiva</h4>
                <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; margin: 0 0 0.75rem;">
                    Imita la visión del ojo humano y de las cámaras reales. Los objetos lejanos parecen más pequeños que los cercanos debido a los <strong>puntos de fuga</strong>.
                </p>
                <div style="background: rgba(56, 189, 248, 0.1); border-radius: 6px; padding: 6px 10px; font-size: 0.8rem; color: #38bdf8;">
                    <strong>Uso ideal:</strong> Apreciar proporciones finales, iluminación, estética y renderizado.
                </div>
            </div>

            <!-- Ortográfica -->
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 14px; padding: 1.25rem;">
                <h4 style="color: #ec4899; margin: 0 0 0.5rem; font-size: 1.1rem;">📐 Vista Ortográfica (Tecla 5 / Numpad 5)</h4>
                <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; margin: 0 0 0.75rem;">
                    Proyección paralela matemática <strong>sin puntos de fuga</strong>. Dos líneas paralelas nunca convergen y la distancia a la cámara no altera el tamaño visual del objeto.
                </p>
                <div style="background: rgba(236, 72, 153, 0.1); border-radius: 6px; padding: 6px 10px; font-size: 0.8rem; color: #ec4899;">
                    <strong>Uso ideal:</strong> Modelado técnico de precisión, alineación de planos y ajuste de siluetas con imágenes de referencia (Blueprints).
                </div>
            </div>
        </div>

        <!-- ── 1.2 Navegación con Ratón y Teclado Numérico en Blender ── -->
        <h3 id="ma-1-2" style="color: #ec4899; margin: 2rem 0 1rem; font-size: 1.4rem;">1.2 El Trípode de Navegación en Blender</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Blender fue diseñado para operarse con la mano derecha sobre un ratón de 3 botones y la mano izquierda sobre el teclado. El control de la cámara se realiza mediante tres gestos universales:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 1.5rem;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem; text-align: center;">
                <div style="font-size: 1.8rem; margin-bottom: 4px;">🔄</div>
                <div style="color: #f8fafc; font-weight: 800; font-size: 0.95rem; margin-bottom: 2px;">Órbita (Rotar vista)</div>
                <code style="color: #ec4899; font-size: 0.85rem; font-weight: 800;">MMB (Click Central)</code>
                <p style="color: #94a3b8; font-size: 0.78rem; margin: 6px 0 0;">Gira el punto de vista 360° alrededor del objeto activo.</p>
            </div>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem; text-align: center;">
                <div style="font-size: 1.8rem; margin-bottom: 4px;">✋</div>
                <div style="color: #f8fafc; font-weight: 800; font-size: 0.95rem; margin-bottom: 2px;">Pan (Desplazar vista)</div>
                <code style="color: #38bdf8; font-size: 0.85rem; font-weight: 800;">Shift + MMB</code>
                <p style="color: #94a3b8; font-size: 0.78rem; margin: 6px 0 0;">Mueve el encuadre lateral o verticalmente sin rotar la cámara.</p>
            </div>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem; text-align: center;">
                <div style="font-size: 1.8rem; margin-bottom: 4px;">🔍</div>
                <div style="color: #f8fafc; font-weight: 800; font-size: 0.95rem; margin-bottom: 2px;">Zoom (Acercar / Alejar)</div>
                <code style="color: #34d399; font-size: 0.85rem; font-weight: 800;">Rueda del ratón / Ctrl + MMB</code>
                <p style="color: #94a3b8; font-size: 0.78rem; margin: 6px 0 0;">Ajusta la distancia focal hacia el centro de interés.</p>
            </div>
        </div>

        <!-- Tabla de Atajos del Teclado Numérico (Numpad) -->
        <div style="background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; overflow: hidden; margin-bottom: 2rem;">
            <div style="background: rgba(236, 72, 153, 0.15); padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: 800; font-size: 0.9rem; color: #ec4899;">
                ⌨️ Atajos Clásicos del Teclado Numérico (Numpad) en Blender
            </div>
            <div style="padding: 1rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 0.84rem;">
                <div style="color: #cbd5e1;"><strong style="color: #f8fafc;">Numpad 1:</strong> Vista Frontal (Plano XZ)</div>
                <div style="color: #cbd5e1;"><strong style="color: #f8fafc;">Numpad 3:</strong> Vista Lateral Derecha (Plano YZ)</div>
                <div style="color: #cbd5e1;"><strong style="color: #f8fafc;">Numpad 7:</strong> Vista Superior / Top (Plano XY)</div>
                <div style="color: #cbd5e1;"><strong style="color: #f8fafc;">Numpad 5:</strong> Alternar Perspectiva / Ortográfica</div>
                <div style="color: #cbd5e1;"><strong style="color: #f8fafc;">Numpad 0:</strong> Vista a través de la Cámara Activa</div>
                <div style="color: #cbd5e1;"><strong style="color: #f8fafc;">Numpad . (Punto):</strong> Enfocar / Centrar en Objeto Seleccionado</div>
            </div>
        </div>

        <!-- ── 1.3 La Tríada Fundamental de Transformación (G, R, S) ── -->
        <h3 id="ma-1-3" style="color: #ec4899; margin: 2rem 0 1rem; font-size: 1.4rem;">1.3 La Tríada de Transformación: G, R y S</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            A diferencia de otros programas donde debes arrastrar pequeños tiradores con el ratón, el flujo de trabajo ultra-rápido de Blender se basa en las tres teclas de transformación:
        </p>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 1.5rem;">
            <div style="background: rgba(239, 68, 68, 0.08); border: 1.5px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 1rem; text-align: center;">
                <div style="font-size: 2rem; font-weight: 900; color: #ef4444; font-family: monospace;">G</div>
                <div style="color: #f8fafc; font-weight: 800; font-size: 0.9rem;">Grab (Trasladar)</div>
                <p style="color: #94a3b8; font-size: 0.78rem; margin: 4px 0 0;">Mueve el objeto libremente por el plano de la vista.</p>
            </div>

            <div style="background: rgba(34, 197, 94, 0.08); border: 1.5px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 1rem; text-align: center;">
                <div style="font-size: 2rem; font-weight: 900; color: #22c55e; font-family: monospace;">R</div>
                <div style="color: #f8fafc; font-weight: 800; font-size: 0.9rem;">Rotate (Rotar)</div>
                <p style="color: #94a3b8; font-size: 0.78rem; margin: 4px 0 0;">Gira el objeto tomando el centro de pivote como eje.</p>
            </div>

            <div style="background: rgba(59, 130, 246, 0.08); border: 1.5px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 1rem; text-align: center;">
                <div style="font-size: 2rem; font-weight: 900; color: #3b82f6; font-family: monospace;">S</div>
                <div style="color: #f8fafc; font-weight: 800; font-size: 0.9rem;">Scale (Escalar)</div>
                <p style="color: #94a3b8; font-size: 0.78rem; margin: 4px 0 0;">Modifica el tamaño agrandando o encogiendo la geometría.</p>
            </div>
        </div>

        <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.25rem; margin-bottom: 2rem;">
            <h5 style="color: #f59e0b; margin: 0 0 0.5rem; font-size: 0.95rem; font-weight: 800;">
                ⚡ El Poder de la Combinación con Restricción de Ejes y Valores Numéricos
            </h5>
            <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; margin: 0;">
                En Blender puedes combinar comandos secuenciales de forma inmediata:  
                • <code style="color: #ec4899; background: #020617; padding: 2px 6px; border-radius: 4px;">G + X + 3 + Enter</code>: Traslada el objeto exactamente 3 unidades en el Eje X positivo.<br/>
                • <code style="color: #ec4899; background: #020617; padding: 2px 6px; border-radius: 4px;">R + Z + 45 + Enter</code>: Rota el objeto 45 grados sobre el eje vertical Z.<br/>
                • <code style="color: #ec4899; background: #020617; padding: 2px 6px; border-radius: 4px;">S + 2 + Enter</code>: Duplica el tamaño del objeto de forma proporcional al 200%.
            </p>
        </div>
    `,
    flashcards: [
        {
            front: '¿Qué significan las siglas RGB en relación con los ejes 3D de Blender?',
            back: 'Rojo representa el Eje X (ancho), Verde representa el Eje Y (profundidad) y Azul representa el Eje Z (altura).'
        },
        {
            front: '¿Cuál es la diferencia visual entre la vista en Perspectiva y la Ortográfica?',
            back: 'La Perspectiva tiene puntos de fuga donde los objetos lejanos se achican; la Ortográfica proyecta líneas paralelas sin distorsión, ideal para modelado técnico.'
        },
        {
            front: '¿Qué atajo de teclado en Blender permite alternar entre vista Perspectiva y Ortográfica?',
            back: 'La tecla Numpad 5 (o 5 en teclados con emulación).'
        },
        {
            front: '¿Cómo se orbita (rota) la cámara libremente en el Viewport 3D de Blender?',
            back: 'Manteniendo presionado el botón central del ratón (MMB - Middle Mouse Button) y arrastrando.'
        },
        {
            front: '¿Cómo se realiza un desplazamiento lateral (Pan) en la vista de Blender?',
            back: 'Manteniendo presionadas las teclas Shift + MMB (Click central del ratón).'
        },
        {
            front: '¿Cuáles son las vistas ortográficas de Numpad 1, Numpad 3 y Numpad 7?',
            back: 'Numpad 1 = Vista Frontal. Numpad 3 = Vista Lateral Derecha. Numpad 7 = Vista Superior (Top).'
        },
        {
            front: '¿Para qué sirve la tecla Numpad . (Punto) en Blender?',
            back: 'Enfoca y centra la cámara inmediatamente sobre el objeto o elemento seleccionado (Frame Selected).'
        },
        {
            front: '¿Cuáles son las 3 teclas fundamentales de transformación en Blender?',
            back: 'G para Grab/Mover (Traslación), R para Rotate (Rotación) y S para Scale (Escala).'
        },
        {
            front: '¿Cómo restrinjo una traslación únicamente al eje Z vertical?',
            back: 'Presionando la tecla G seguida de la tecla Z (G + Z).'
        },
        {
            front: '¿Qué menú desplegable circular (Pie Menu) se abre al presionar la tecla Z en Blender?',
            back: 'El menú de modos de sombreado del viewport: Wireframe, Solid, Material Preview y Rendered.'
        }
    ],
    questions: [
        {
            id: 'ma-1-1-q1',
            objective: 'Identificar la correspondencia entre colores y ejes cartesianos',
            concept: 'ejes_cartesianos',
            difficulty: 'easy',
            q: 'En Blender y en computación gráfica 3D, el eje vertical que define la altura (Z) se representa con el color:',
            options: [
                'Azul',
                'Rojo',
                'Verde',
                'Amarillo'
            ],
            correct: 0
        },
        {
            id: 'ma-1-1-q2',
            objective: 'Comprender la diferencia entre proyección perspectiva y ortográfica',
            concept: 'perspectiva_vs_ortografica',
            difficulty: 'medium',
            q: '¿Por qué la vista Ortográfica es preferida para alinear planos y modelar con precisión frente a la vista en Perspectiva?',
            options: [
                'Porque elimina los puntos de fuga y mantiene las líneas paralelas idénticas sin distorsión de distancia',
                'Porque renderiza más rápido con efectos de iluminación en tiempo real',
                'Porque añade sombras suaves que facilitan ver la profundidad',
                'Porque bloquea los objetos para que no puedan ser rotados por error'
            ],
            correct: 0
        },
        {
            id: 'ma-1-1-q3',
            objective: 'Dominar los atajos de teclado numérico de Blender',
            concept: 'atajos_numpad',
            difficulty: 'easy',
            q: 'Para situar la cámara inmediatamente en la Vista Frontal de la escena, la tecla de acceso rápido es:',
            options: [
                'Numpad 1',
                'Numpad 3',
                'Numpad 7',
                'Numpad 0'
            ],
            correct: 0
        },
        {
            id: 'ma-1-1-q4',
            objective: 'Dominar la navegación física con ratón',
            concept: 'navegacion_raton',
            difficulty: 'easy',
            q: 'Para desplazar la vista lateralmente (Pan) sin girar el ángulo de la cámara en Blender, debes presionar:',
            options: [
                'Shift + Botón Central del Ratón (MMB)',
                'Ctrl + Botón Izquierdo del Ratón',
                'Alt + Clic Derecho',
                'Espacio + Doble Clic'
            ],
            correct: 0
        },
        {
            id: 'ma-1-1-q5',
            objective: 'Aplicar la transformación de escala',
            concept: 'transformacion_escala',
            difficulty: 'easy',
            q: '¿Qué tecla activa la transformación de Escala (Scale) de un objeto seleccionado en Blender?',
            options: [
                'S',
                'E',
                'G',
                'R'
            ],
            correct: 0
        },
        {
            id: 'ma-1-1-q6',
            objective: 'Combinar transformaciones con restricción y valores numéricos',
            concept: 'transformacion_numerica',
            difficulty: 'medium',
            q: 'Si deseas rotar un objeto exactamente 90 grados sobre el eje vertical Z, la secuencia óptima de teclas es:',
            options: [
                'R seguido de Z, luego escribir 90 y presionar Enter',
                'G seguido de 90 y presionar Z',
                'S seguido de Z y arrastrar el ratón hacia arriba',
                'Shift + R + 90'
            ],
            correct: 0
        },
        {
            id: 'ma-1-1-q7',
            objective: 'Reconocer el atajo para centrar la vista en un objeto',
            concept: 'centrar_vista',
            difficulty: 'medium',
            q: 'Cuando un objeto se pierde de vista en una escena muy grande, ¿qué atajo centra la cámara directamente sobre él?',
            options: [
                'Numpad . (Punto del teclado numérico)',
                'Ctrl + Z',
                'F5',
                'Alt + Barra Espaciadora'
            ],
            correct: 0
        },
        {
            id: 'ma-1-1-q8',
            objective: 'Conocer las coordenadas del origen del mundo',
            concept: 'origen_mundo',
            difficulty: 'easy',
            q: 'El punto de intersección central de los ejes cartesianos donde X=0, Y=0 y Z=0 se conoce formalmente como:',
            options: [
                'El Origen del Mundo (World Origin)',
                'El Punto Ciego',
                'El Centro Focal de Cámara',
                'El Vértice Infinito'
            ],
            correct: 0
        },
        {
            id: 'ma-1-1-q9',
            objective: 'Diferenciar vistas de alambre y sólido',
            concept: 'modos_sombreado',
            difficulty: 'easy',
            q: 'El modo de visualización que muestra únicamente las líneas y aristas poligonales de los objetos sin caras opacas es:',
            options: [
                'Wireframe (Alambre)',
                'Solid (Sólido)',
                'Rendered (Renderizado)',
                'Material Preview'
            ],
            correct: 0
        },
        {
            id: 'ma-1-1-q10',
            objective: 'Restablecer transformaciones a sus valores predeterminados',
            concept: 'reset_transform',
            difficulty: 'hard',
            q: 'Si has movido un objeto por error y quieres que regrese exactamente a la posición original (0,0,0), el atajo para limpiar la traslación es:',
            options: [
                'Alt + G',
                'Ctrl + G',
                'Shift + G',
                'Alt + R'
            ],
            correct: 0
        }
    ],
    quizConfig: { timePerQuestion: 20, requiredScorePercent: 80 }
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ma-m1-l1-content',
                content: lessonDefinition.content,
                hasSimulator: lessonDefinition.hasSimulator
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ma-m1-l1-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        simulador: [
            createContentBlock({
                id: 'ma-m1-l1-practice',
                content: `
                    <div style="margin-bottom: 2rem;">
                        <div id="practical-lab-ma1-container"></div>
                    </div>
                `,
                hasSimulator: true
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ma-m1-l1-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions,
                quizConfig: lessonDefinition.quizConfig
            })
        ]
    }
});
