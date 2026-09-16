import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Primitivas 3D y Transformaciones Fundamentales',
    hasSimulator: true,
    content: `
        <!-- ── 2.0 Anatomía de una Primitiva 3D y Malla Poligonal ── -->
        <h3 id="ma-2-0" style="color: #ec4899; margin: 1.5rem 0 1rem; font-size: 1.4rem;">2.0 Anatomía de una Primitiva 3D: La Materia Prima del Modelado</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            En computación gráfica, casi ningún modelo tridimensional nace desde cero como una forma compleja. Todo proceso de modelado profesional —desde un prop para un videojuego hasta un personaje animado estilizado— inicia a partir de una <strong>Primitiva 3D</strong> básica.
        </p>

        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            Una primitiva es una malla poligonal elemental (<em>Mesh</em>) definida matemáticamente en el espacio. Toda malla tridimensional se compone de tres elementos estructurales inmutables (la terna <strong>V-E-F</strong>):
        </p>

        <!-- Desglose V-E-F -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 2rem;">
            <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 1.25rem;">
                <div style="color: #38bdf8; font-weight: 900; font-size: 1.1rem; margin-bottom: 6px;">📍 Vértice (Vertex)</div>
                <p style="color: #cbd5e1; font-size: 0.85rem; margin: 0; line-height: 1.6;">
                    Un punto infinitesimal en el espacio con coordenadas exactas <strong>(X, Y, Z)</strong>. No tiene volumen ni superficie por sí mismo.
                </p>
            </div>
            <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 1.25rem;">
                <div style="color: #22c55e; font-weight: 900; font-size: 1.1rem; margin-bottom: 6px;">📏 Arista (Edge)</div>
                <p style="color: #cbd5e1; font-size: 0.85rem; margin: 0; line-height: 1.6;">
                    El segmento lineal recto que une exactamente dos vértices. Define el contorno y la estructura de alambre (<em>Wireframe</em>).
                </p>
            </div>
            <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 12px; padding: 1.25rem;">
                <div style="color: #ec4899; font-weight: 900; font-size: 1.1rem; margin-bottom: 6px;">🔷 Cara (Face / Polygon)</div>
                <p style="color: #cbd5e1; font-size: 0.85rem; margin: 0; line-height: 1.6;">
                    La superficie plana delimitada por tres o más aristas. Es la superficie que refleja luz y recibe materiales y texturas.
                </p>
            </div>
        </div>

        <!-- Catálogo de Primitivas Estándar en Blender -->
        <div class="cartesian-card dark-lab-box" style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.92) 100%); border: 1.5px solid rgba(236, 72, 153, 0.35); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 1rem;">
                <h4 style="color: #ec4899; margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
                    📦 Menú Añadir Primitivas: <kbd style="background: #1e293b; border: 1px solid #475569; border-radius: 6px; padding: 2px 8px; font-size: 0.85rem; color: #f8fafc;">Shift + A</kbd>
                </h4>
                <span style="background: rgba(236, 72, 153, 0.15); color: #ec4899; border: 1px solid #ec4899; padding: 2px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 800;">
                    Atajo Esencial
                </span>
            </div>

            <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.7; margin-bottom: 1.25rem;">
                Al presionar <strong style="color: #f8fafc;">Shift + A</strong> en el Viewport 3D de Blender (Menú <em>Add &rarr; Mesh</em>), puedes insertar cualquiera de las primitivas estándar según la morfología inicial de tu modelo:
            </p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px; font-size: 0.84rem;">
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.75rem;">
                    <strong style="color: #38bdf8;">Cubo (Cube):</strong> Casas, muebles, cajas, vehículos y base de modelado <em>Box Modeling</em>.
                </div>
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.75rem;">
                    <strong style="color: #38bdf8;">Esfera UV (UV Sphere):</strong> Ojos, planetas, frutas y objetos esféricos con polos.
                </div>
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.75rem;">
                    <strong style="color: #38bdf8;">Ico-esfera (Icosphere):</strong> Geodésicas uniformes triangulares para cristales y meteoritos.
                </div>
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.75rem;">
                    <strong style="color: #38bdf8;">Cilindro (Cylinder):</strong> Columnas, tubos, armas de fuego, ruedas y extremidades.
                </div>
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.75rem;">
                    <strong style="color: #38bdf8;">Cono (Cone):</strong> Picos, árboles de navidad, sombreros y remates cónicos.
                </div>
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.75rem;">
                    <strong style="color: #38bdf8;">Toroide (Torus):</strong> Donas, anillos, cadenas, llantas y salvavidas.
                </div>
            </div>
        </div>

        <!-- Visor Interactivo de Primitivas y Transformaciones -->
        <div style="margin: 2.5rem 0;">
            <div id="primitives-transform-lab-container"></div>
        </div>

        <!-- ── 2.1 El Trío de Transformaciones: G, R, S ── -->
        <h3 id="ma-2-1" style="color: #ec4899; margin: 2rem 0 1rem; font-size: 1.4rem;">2.1 El Trío de Transformaciones Fundamentales: G, R y S</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Cualquier alteración espacial en Blender se realiza mediante tres operaciones matemáticas vectoriales conocidas como <strong>Transformaciones de Objeto</strong>:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-bottom: 2rem;">
            <!-- Grab / Mover -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(239, 68, 68, 0.4); border-radius: 14px; padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 1.2rem; font-weight: 900; color: #ef4444;">G &rarr; Grab (Trasladar)</span>
                    <kbd style="background: #1e293b; border: 1px solid #475569; border-radius: 4px; padding: 2px 8px; font-size: 0.85rem; color: #ef4444; font-weight: 800;">Tecla G</kbd>
                </div>
                <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin: 0 0 10px;">
                    Mueve el objeto en el espacio tridimensional. Por defecto se traslada paralelamente al plano de la cámara activa.
                </p>
                <div style="background: rgba(239, 68, 68, 0.1); border-radius: 6px; padding: 6px 10px; font-size: 0.78rem; color: #fca5a5;">
                    💡 Para cancelar la traslación y devolver el objeto a su sitio: pulsa <strong>Click Derecho</strong> o <strong>Esc</strong>.
                </div>
            </div>

            <!-- Rotate / Rotar -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(34, 197, 94, 0.4); border-radius: 14px; padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 1.2rem; font-weight: 900; color: #22c55e;">R &rarr; Rotate (Rotar)</span>
                    <kbd style="background: #1e293b; border: 1px solid #475569; border-radius: 4px; padding: 2px 8px; font-size: 0.85rem; color: #22c55e; font-weight: 800;">Tecla R</kbd>
                </div>
                <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin: 0 0 10px;">
                    Gira el objeto alrededor de su punto pivote (<em>Object Origin</em>). Por defecto gira respecto al eje de visión de la cámara.
                </p>
                <div style="background: rgba(34, 197, 94, 0.1); border-radius: 6px; padding: 6px 10px; font-size: 0.78rem; color: #86efac;">
                    💡 Si presionas <strong>R dos veces</strong> seguidas (<kbd>R + R</kbd>), activas la <em>Rotación Trackball libre</em>.
                </div>
            </div>

            <!-- Scale / Escalar -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(59, 130, 246, 0.4); border-radius: 14px; padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 1.2rem; font-weight: 900; color: #3b82f6;">S &rarr; Scale (Escalar)</span>
                    <kbd style="background: #1e293b; border: 1px solid #475569; border-radius: 4px; padding: 2px 8px; font-size: 0.85rem; color: #3b82f6; font-weight: 800;">Tecla S</kbd>
                </div>
                <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin: 0 0 10px;">
                    Multiplica las dimensiones geométricas del objeto aumentando o reduciendo su volumen relativo desde el centro.
                </p>
                <div style="background: rgba(59, 130, 246, 0.1); border-radius: 6px; padding: 6px 10px; font-size: 0.78rem; color: #93c5fd;">
                    💡 Un valor de <strong>1.0</strong> representa el 100% de la escala original (tamaño nativo).
                </div>
            </div>
        </div>

        <!-- ── 2.2 Restricción de Ejes y Transformación de Precisión ── -->
        <h3 id="ma-2-2" style="color: #ec4899; margin: 2rem 0 1rem; font-size: 1.4rem;">2.2 Restricción de Ejes y Entrada Numérica de Precisión</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Modelar a mano alzada conduce a objetos desalineados. En la industria profesional, las transformaciones se ejecutan siempre con <strong>restricción de ejes</strong> y <strong>valores numéricos exactos</strong>:
        </p>

        <!-- Tabla de Combinaciones de Precisión -->
        <div style="background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; overflow: hidden; margin-bottom: 2rem;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.86rem; text-align: left;">
                <thead>
                    <tr style="background: rgba(236, 72, 153, 0.15); border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <th style="padding: 10px 14px; color: #ec4899; font-weight: 800;">Fórmula de Atajo</th>
                        <th style="padding: 10px 14px; color: #f8fafc; font-weight: 800;">Operación Resultante</th>
                        <th style="padding: 10px 14px; color: #94a3b8; font-weight: 800;">Uso Práctico</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px;"><kbd style="color: #ec4899; font-weight: 800;">G + X</kbd></td>
                        <td style="padding: 10px 14px; color: #cbd5e1;">Mover únicamente en el Eje Horizontal (Rojo)</td>
                        <td style="padding: 10px 14px; color: #94a3b8;">Alinear muros o piezas laterales</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px;"><kbd style="color: #ec4899; font-weight: 800;">G + Z</kbd></td>
                        <td style="padding: 10px 14px; color: #cbd5e1;">Mover únicamente en Altura Vertical (Azul)</td>
                        <td style="padding: 10px 14px; color: #94a3b8;">Apilar pisos, colocar objetos sobre mesas</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px;"><kbd style="color: #ec4899; font-weight: 800;">R + Z + 90 + Enter</kbd></td>
                        <td style="padding: 10px 14px; color: #cbd5e1;">Girar exactamente 90° sobre el eje vertical</td>
                        <td style="padding: 10px 14px; color: #94a3b8;">Girar una puerta o rueda en escuadra perfecta</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px;"><kbd style="color: #ec4899; font-weight: 800;">S + 2 + Enter</kbd></td>
                        <td style="padding: 10px 14px; color: #cbd5e1;">Duplicar el tamaño exacto al 200%</td>
                        <td style="padding: 10px 14px; color: #94a3b8;">Escalar a proporciones modulares</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 14px;"><kbd style="color: #ec4899; font-weight: 800;">G + Shift + Z</kbd></td>
                        <td style="padding: 10px 14px; color: #cbd5e1;">Mover en el plano del piso (X e Y), <strong>excluyendo Z</strong></td>
                        <td style="padding: 10px 14px; color: #94a3b8;">Deslizar muebles sin que floten ni se entierren</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- ── 2.3 Origen del Objeto y Reset de Transformaciones ── -->
        <h3 id="ma-2-3" style="color: #ec4899; margin: 2rem 0 1rem; font-size: 1.4rem;">2.3 El Origen del Objeto (Object Origin) y el Limpiador Alt</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Al seleccionar cualquier malla en Blender, notarás un <strong>pequeño punto naranja brillante</strong> en su centro: es el <strong>Punto de Origen (Origin)</strong> del objeto.
        </p>

        <div style="background: rgba(15, 23, 42, 0.8); border-left: 4px solid #f59e0b; border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.5rem;">
            <h5 style="color: #f59e0b; margin: 0 0 6px; font-size: 0.95rem; font-weight: 800;">⚠️ Regla de Oro del Punto Pivote</h5>
            <p style="color: #cbd5e1; font-size: 0.85rem; margin: 0; line-height: 1.6;">
                Toda rotación y todo escalado toman como referencia de anclaje el Punto de Origen. Si el origen está en el centro de una esfera, esta gira sobre su propio eje. Si el origen está en la esquina o fuera de la geometría, el objeto girará describiendo una órbita amplia alrededor de ese punto.
            </p>
        </div>

        <!-- Limpieza de Transformaciones con Alt -->
        <div style="background: rgba(236, 72, 153, 0.08); border: 1px solid rgba(236, 72, 153, 0.25); border-radius: 12px; padding: 1.25rem; margin-bottom: 2rem;">
            <h4 style="color: #ec4899; margin: 0 0 10px; font-size: 1.05rem; font-weight: 800;">
                🧹 La Tecla Alt: Los Restauradores de Transformación
            </h4>
            <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; margin: 0 0 12px;">
                Si has movido, rotado o deformado un objeto y necesitas devolverlo instantáneamente a su estado neutral original, utiliza la tecla <kbd>Alt</kbd> combinada con la inicial de la transformación:
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; font-size: 0.82rem;">
                <div style="background: #1e293b; padding: 8px 12px; border-radius: 8px;">
                    <strong style="color: #f8fafc;">Alt + G:</strong> Limpia posición (devuelve a X:0, Y:0, Z:0).
                </div>
                <div style="background: #1e293b; padding: 8px 12px; border-radius: 8px;">
                    <strong style="color: #f8fafc;">Alt + R:</strong> Limpia rotación (devuelve a 0° en todos los ejes).
                </div>
                <div style="background: #1e293b; padding: 8px 12px; border-radius: 8px;">
                    <strong style="color: #f8fafc;">Alt + S:</strong> Limpia escala (devuelve al tamaño nativo 1.0×).
                </div>
            </div>
        </div>
    `,
    flashcards: [
        {
            front: '¿Cuál es el atajo universal para abrir el menú de Añadir Primitivas (Add) en Blender?',
            back: 'Shift + A. Despliega la lista de mallas (Cubo, Esfera UV, Cilindro, etc.), curvas, luces y cámaras.'
        },
        {
            front: '¿Cuáles son los tres componentes elementales de toda malla poligonal (V-E-F)?',
            back: 'Vértices (puntos 3D), Aristas (líneas que unen 2 vértices) y Caras (superficies cerradas por aristas).'
        },
        {
            front: '¿Qué tecla activa la transformación de Traslación / Desplazamiento (Grab)?',
            back: 'La tecla G (Grab/Mover).'
        },
        {
            front: '¿Qué tecla activa la transformación de Rotación (Rotate)?',
            back: 'La tecla R (Rotate).'
        },
        {
            front: '¿Qué tecla activa la transformación de Escalamiento / Dimensión (Scale)?',
            back: 'La tecla S (Scale).'
        },
        {
            front: '¿Cómo se cancela una transformación en curso para evitar mover el objeto por error?',
            back: 'Haciendo Click Derecho con el ratón o presionando la tecla Escape (Esc).'
        },
        {
            front: '¿Cómo restringir una traslación únicamente al plano del piso (X e Y) sin alterar la altura?',
            back: 'Presionando G + Shift + Z. La combinación Shift + Eje excluye ese eje de la transformación.'
        },
        {
            front: '¿Cómo rotar un objeto exactamente 90 grados sobre el eje vertical Z usando el teclado?',
            back: 'Escribiendo la secuencia: R -> Z -> 90 -> Enter.'
        },
        {
            front: '¿Qué representa el pequeño punto naranja brillante en el centro de un objeto seleccionado?',
            back: 'El Punto de Origen (Object Origin), que define el pivote sobre el cual rota y se escala la malla.'
        },
        {
            front: '¿Qué combinaciones de teclas devuelven la posición, rotación y escala a sus valores iniciales neutros?',
            back: 'Alt + G (posición a 0,0,0), Alt + R (rotación a 0°) y Alt + S (escala a 1.0×).'
        }
    ],
    questions: [
        {
            question: '¿Qué combinación de teclas abre el menú de inserción de nuevas primitivas 3D (Add Mesh) en Blender?',
            options: [
                'Shift + A',
                'Ctrl + N',
                'Alt + P',
                'Tab + M'
            ],
            correct: 0,
            explanation: 'En Blender, Shift + A es el atajo universal para desplegar el menú contextual "Add" en cualquier editor.'
        },
        {
            question: 'Si necesitas modelar un tronco de árbol o una tubería, ¿cuál es la primitiva 3D de partida más idónea?',
            options: [
                'Cilindro (Cylinder)',
                'Toroide (Torus)',
                'Ico-esfera (Icosphere)',
                'Plano (Plane)'
            ],
            correct: 0,
            explanation: 'El Cilindro posee una base circular y un desarrollo tubular recto ideal para cañerías, troncos, ruedas y pilares.'
        },
        {
            question: 'Para elevar un objeto seleccionado hacia arriba a lo largo de la altura vertical de Blender, ¿qué secuencia de teclas debes pulsar?',
            options: [
                'G seguido de Z',
                'R seguido de Y',
                'S seguido de X',
                'Shift + Z'
            ],
            correct: 0,
            explanation: 'G activa Grab (traslación) y Z restringe el movimiento al eje vertical Z (convención Z-Up de Blender).'
        },
        {
            question: '¿Cómo cancelas una rotación accidental mientras estás moviendo el ratón sin confirmar los cambios?',
            options: [
                'Haciendo Click Derecho con el ratón o presionando Esc',
                'Presionando la tecla Enter',
                'Haciendo Click Izquierdo con el ratón',
                'Presionando la Barra Espaciadora'
            ],
            correct: 0,
            explanation: 'El botón derecho del ratón o la tecla Esc descartan inmediatamente la transformación y restauran el objeto a su estado previo.'
        },
        {
            question: '¿Qué ocurre al presionar R dos veces seguidas (R + R)?',
            options: [
                'Se activa el modo de Rotación Trackball libre en todos los ángulos esféricos',
                'Se cancela la rotación automáticamente',
                'Se resetea la rotación a 0 grados',
                'Se restringe la rotación al eje X'
            ],
            correct: 0,
            explanation: 'Presionar R dos veces desbloquea la rotación Trackball tipo esfera virtual, permitiendo orientar en cualquier dirección.'
        },
        {
            question: 'Si deseas mover un mueble por el suelo de una habitación sin que flote ni penetre el piso, ¿qué atajo debes usar?',
            options: [
                'G + Shift + Z',
                'G + Z',
                'S + Shift + X',
                'R + Shift + Y'
            ],
            correct: 0,
            explanation: 'Shift + Eje excluye dicho eje: G + Shift + Z permite mover libremente en el plano horizontal (X e Y) fijando la altura en Z.'
        },
        {
            question: '¿Qué comando numérico permite reducir un objeto al 50% de su tamaño de manera exacta?',
            options: [
                'S + 0.5 + Enter',
                'G + 0.5 + Enter',
                'R + 50 + Enter',
                'Alt + S + 50'
            ],
            correct: 0,
            explanation: 'S activa el escalado y 0.5 define la mitad de la escala nominal (1.0).'
        },
        {
            question: '¿Qué es el "Object Origin" (Punto de Origen) de una malla en Blender?',
            options: [
                'El punto de anclaje de coordenadas y pivote sobre el cual se calculan la rotación y la escala',
                'El primer vértice creado por el usuario en el modelo',
                'El centro de masa calculado por la física del motor',
                'La posición donde se renderizará la cámara final'
            ],
            correct: 0,
            explanation: 'El punto de origen (punto naranja) determina el centro local del objeto y el punto focal de todas las transformaciones.'
        },
        {
            question: '¿Cuál es el atajo para restaurar la rotación de un objeto a 0° neutros después de haberlo girado?',
            options: [
                'Alt + R',
                'Alt + G',
                'Alt + S',
                'Ctrl + Z'
            ],
            correct: 0,
            explanation: 'Alt + R (Clear Rotation) restablece todos los ángulos de Euler del objeto a cero.'
        },
        {
            question: '¿Qué forma geométrica tiene la primitiva 3D denominada "Torus" (Toroide)?',
            options: [
                'Una forma toroidal con agujero central, semejante a una dona o salvavidas',
                'Una pirámide de base cuadrangular',
                'Una esfera geodésica formada por triángulos equiláteros',
                'Un cubo con esquinas biseladas'
            ],
            correct: 0,
            explanation: 'El Toroide es la figura geométrica generada al rotar una circunferencia alrededor de un eje coplanar, dando origen a formas de rosquilla o neumático.'
        }
    ],
    quizConfig: { timePerQuestion: 20, requiredScorePercent: 80 }
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ma-m1-l2-content',
                content: lessonDefinition.content,
                hasSimulator: lessonDefinition.hasSimulator
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ma-m1-l2-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        simulador: [
            createContentBlock({
                id: 'ma-m1-l2-practice',
                content: `
                    <div style="margin-bottom: 2rem;">
                        <div id="primitives-transform-lab-container"></div>
                    </div>
                `,
                hasSimulator: true
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ma-m1-l2-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions,
                quizConfig: lessonDefinition.quizConfig
            })
        ]
    }
});
