import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Modo Edición y Topología Poligonal — Proyecto: El Peón',
    hasSimulator: true,
    content: `
        <!-- ── 3.0 El Proyecto Integrador: Ajedrez 3D ── -->
        <h3 id="ma-3-0" style="color: #ec4899; margin: 1.5rem 0 1rem; font-size: 1.4rem;">3.0 🏆 Proyecto Integrador: Nuestro Ajedrez 3D</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            A partir de esta lección, todo el curso de Modelado 3D se enfoca en la construcción de un <strong>set completo de ajedrez tridimensional</strong>. Entre el Módulo 1 y el Módulo 2 construiremos las 6 piezas clásicas más su tablero, aplicando cada una de las técnicas nuevas que vamos aprendiendo:
        </p>

        <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.92) 100%); border: 1.5px solid rgba(236, 72, 153, 0.35); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; font-size: 0.85rem;">
                <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 0.85rem; text-align: center;">
                    <div style="font-size: 1.6rem;">🧩</div>
                    <div style="color: #38bdf8; font-weight: 900; margin: 4px 0;">Peón · M1</div>
                    <div style="color: #94a3b8; font-size: 0.72rem;">Modo Edición (Girar perfil)</div>
                </div>
                <div style="background: rgba(167, 139, 250, 0.1); border: 1px solid rgba(167, 139, 250, 0.3); border-radius: 10px; padding: 0.85rem; text-align: center;">
                    <div style="font-size: 1.6rem;">🏰</div>
                    <div style="color: #a78bfa; font-weight: 900; margin: 4px 0;">Torre · M1</div>
                    <div style="color: #94a3b8; font-size: 0.72rem;">Loop Cut + Inset + Extrude</div>
                </div>
                <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 0.85rem; text-align: center;">
                    <div style="font-size: 1.6rem;">🛕</div>
                    <div style="color: #f59e0b; font-weight: 900; margin: 4px 0;">Alfil · M1</div>
                    <div style="color: #94a3b8; font-size: 0.72rem;">Bevel + Revolución</div>
                </div>
                <div style="background: rgba(236, 72, 153, 0.1); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 10px; padding: 0.85rem; text-align: center;">
                    <div style="font-size: 1.6rem;">👑</div>
                    <div style="color: #ec4899; font-weight: 900; margin: 4px 0;">Rey + Reina · M2</div>
                    <div style="color: #94a3b8; font-size: 0.72rem;">Mirror + Subdivisión</div>
                </div>
                <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 10px; padding: 0.85rem; text-align: center;">
                    <div style="font-size: 1.6rem;">🐴</div>
                    <div style="color: #4ade80; font-weight: 900; margin: 4px 0;">Caballo · M2</div>
                    <div style="color: #94a3b8; font-size: 0.72rem;">Hard-Surface + Orgánico</div>
                </div>
                <div style="background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px; padding: 0.85rem; text-align: center;">
                    <div style="font-size: 1.6rem;">▦</div>
                    <div style="color: #f8fafc; font-weight: 900; margin: 4px 0;">Tablero · M2</div>
                    <div style="color: #94a3b8; font-size: 0.72rem;">Materiales + Escaques ×64</div>
                </div>
            </div>
            <div style="background: rgba(255,255,255,0.04); border-left: 3px solid #f59e0b; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.82rem; color: #cbd5e1; line-height: 1.6; margin-top: 1rem;">
                💡 <strong>Retos extra del proyecto:</strong> Además de las piezas oficiales, cada lección incluirá objetos adicionales con las mismas técnicas: un <strong>trencito de juguete 🚂</strong>, <strong>jarrones decorativos 🏺</strong>, cuencos y más, para practicar sin límites. ¡Tu imaginación es el máximo límite!
            </div>
        </div>

        <!-- ── 3.1 Modo Objeto vs Modo Edición ── -->
        <h3 id="ma-3-1" style="color: #ec4899; margin: 2rem 0 1rem; font-size: 1.4rem;">3.1 Modo Objeto vs Modo Edición: El Corazón del Modelado</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            En la lección anterior manipulamos <strong>objetos enteros</strong> como bloques indivisibles (mediante G, R y S). Ese es el <strong>Modo Objeto</strong>: se mueve, rota y escala todo el cubo como una sola pieza. Pero para construir un <strong>Peón de ajedrez</strong> necesitamos transformar la propia malla: empujar un vértice, cortar una arista, extruir una cara. Eso ocurre en el <strong>Modo Edición (Edit Mode)</strong>, activado con la tecla <kbd>Tab</kbd>.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 2rem;">
            <!-- Modo Objeto -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(56, 189, 248, 0.4); border-radius: 14px; padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 1.05rem; font-weight: 900; color: #38bdf8;">🧊 Modo Objeto</span>
                    <span style="font-size: 0.7rem; color: #64748b;">Seleccionar objeto</span>
                </div>
                <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin: 0 0 8px;">
                    Trata la malla como un todo inseparable. Ideal para <strong>escalar la pieza entera, colocarla en el tablero y posicionar luces</strong>.
                </p>
                <div style="background: rgba(56, 189, 248, 0.1); border-radius: 6px; padding: 6px 10px; font-size: 0.78rem; color: #7dd3fc;">
                    ✅ Transformaciones de conjunto: mover, girar, duplicar, escalar la pieza completa.
                </div>
            </div>

            <!-- Modo Edición -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(236, 72, 153, 0.4); border-radius: 14px; padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 1.05rem; font-weight: 900; color: #ec4899;">✏️ Modo Edición</span>
                    <kbd style="background: #1e293b; border: 1px solid #475569; border-radius: 4px; padding: 2px 8px; font-size: 0.8rem; color: #ec4899; font-weight: 800;">Tab</kbd>
                </div>
                <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin: 0 0 8px;">
                    Accede a la malla interna del objeto: cada <strong>vértice, arista y cara</strong> se vuelve editable individualmente. Aquí nace la forma del peón.
                </p>
                <div style="background: rgba(236, 72, 153, 0.1); border-radius: 6px; padding: 6px 10px; font-size: 0.78rem; color: #f9a8d4;">
                    ✨ Deformación por componentes: extruir, biselar, cortar y moldear para esculpir la silueta.
                </div>
            </div>
        </div>

        <!-- ── 3.2 Los Tres Modos de Selección ── -->
        <h3 id="ma-3-2" style="color: #ec4899; margin: 2rem 0 1rem; font-size: 1.4rem;">3.2 Selección por Componentes: Vértices (1), Aristas (2) y Caras (3)</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Dentro del Modo Edición, la barra superior del viewport ofrece tres botones de selección (o las teclas númericas <strong>1, 2 y 3</strong> sin bloq num) que determinan el tipo de componente que manipularás:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 2rem;">
            <div style="background: rgba(56, 189, 248, 0.1); border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 12px; padding: 1rem; text-align: center;">
                <div style="font-size: 1.8rem;">🔵</div>
                <div style="color: #38bdf8; font-weight: 900; font-size: 1rem;">Vértice (Tecla 1)</div>
                <p style="color: #94a3b8; font-size: 0.78rem; margin: 6px 0 0;">Puntos individuales del espacio. Mover un vértice deforma las caras vecinas.</p>
            </div>
            <div style="background: rgba(34, 197, 94, 0.1); border: 1.5px solid rgba(34, 197, 94, 0.35); border-radius: 12px; padding: 1rem; text-align: center;">
                <div style="font-size: 1.8rem;">🟢</div>
                <div style="color: #4ade80; font-weight: 900; font-size: 1rem;">Arista (Tecla 2)</div>
                <p style="color: #94a3b8; font-size: 0.78rem; margin: 6px 0 0;">Líneas que conectan dos vértices. Arrastrar una arista mueve el borde de la malla.</p>
            </div>
            <div style="background: rgba(236, 72, 153, 0.1); border: 1.5px solid rgba(236, 72, 153, 0.35); border-radius: 12px; padding: 1rem; text-align: center;">
                <div style="font-size: 1.8rem;">🟣</div>
                <div style="color: #ec4899; font-weight: 900; font-size: 1rem;">Cara (Tecla 3)</div>
                <p style="color: #94a3b8; font-size: 0.78rem; margin: 6px 0 0;">Superficies planas. Seleccionar una cara es la puerta de entrada a la Extrusión.</p>
            </div>
        </div>

        <div style="background: rgba(15, 23, 42, 0.8); border-left: 4px solid #f59e0b; border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 2rem;">
            <h5 style="color: #f59e0b; margin: 0 0 6px; font-size: 0.95rem; font-weight: 800;">⚠️ Recuerda la Terna V-E-F</h5>
            <p style="color: #cbd5e1; font-size: 0.85rem; margin: 0; line-height: 1.6;">
                Toda malla poligonal está compuesta por <strong>Vértices</strong> (puntos), <strong>Aristas</strong> (segmentos que unen dos vértices) y <strong>Caras</strong> (superficies cerradas por aristas). El Modo Edición te da control total sobre estos tres componentes: la <em>topología</em> de tu pieza.
            </p>
        </div>

        <!-- ── 3.3 Revolución de Perfil: Técnica del Peón ── -->
        <h3 id="ma-3-3" style="color: #ec4899; margin: 2rem 0 1rem; font-size: 1.4rem;">3.3 La Técnica del Peón: Revolución de un Perfil 2D</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Las piezas de ajedrez son <strong>objetos de revolución</strong>: formas simétricas alrededor de un eje central vertical. La técnica profesional para crearlas consiste en modelar <strong>solo la silueta (perfil 2D)</strong> con vértices alineados sobre un borde, y luego girar verticalmente todo el contorno. En Blender lo logras con el modificador <strong>Screw (Tornillo)</strong> o dibujando el perfil con curvas y convirtiéndolo a malla.
        </p>

        <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.92) 100%); border: 1.5px solid rgba(236, 72, 153, 0.35); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 1rem;">
                <h4 style="color: #ec4899; margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
                    🏺 La Anatomía del Peón (de base a punta)
                </h4>
                <span style="background: rgba(236, 72, 153, 0.15); color: #ec4899; border: 1px solid #ec4899; padding: 2px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 800;">
                    Revolución
                </span>
            </div>

            <ol style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.9; margin: 0 0 1rem; padding-left: 1.25rem;">
                <li><strong style="color: #38bdf8;">Base cónica:</strong> El disco que se asienta sobre el tablero (radio mayor).</li>
                <li><strong style="color: #38bdf8;">Tallo / Astil:</strong> La columna central que se adelgaza hacia el medio.</li>
                <li><strong style="color: #38bdf8;">Collar:</strong> El anillo saliente que separa el tallo de la cabeza.</li>
                <li><strong style="color: #38bdf8;">Cabeza esférica:</strong> La esfera superior que caracteriza al peón.</li>
                <li><strong style="color: #38bdf8;">Punta:</strong> La pequeña nariz que corona la cabeza.</li>
            </ol>

            <div style="background: rgba(255,255,255,0.04); border-left: 3px solid #38bdf8; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.82rem; color: #cbd5e1; line-height: 1.6;">
                💡 <strong>Flujo de trabajo real:</strong> 1) Dibuja el perfil 2D con añadiendo vértices (<kbd>Ctrl + LMB</kbd>) → 2) Activa el modificador <strong>Screw</strong> → 3) Ajusta los segmentos (Steps) para la suavidad → 4) Aplica el modificador y entra al Modo Edición para pulir el collar. Cada segmento radial del giro equivale a una <strong>arista</strong> de tu malla.
            </div>
        </div>

        <!-- Visor Interactivo del Constructor de Piezas -->
        <div style="margin: 2.5rem 0;">
            <div id="chess-piece-lab-container"></div>
        </div>

        <!-- ── 3.4 Topología Limpia en el Peón ── -->
        <h3 id="ma-3-4" style="color: #ec4899; margin: 2rem 0 1rem; font-size: 1.4rem;">3.4 Topología Limpia: Las Reglas del Buen Modelado</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            El término <strong>topología</strong> describe cómo están dispuestos los vértices, aristas y caras sobre la superficie. Una <strong>topología limpia</strong> garantiza que la pieza se deforme bien, renderice sin artefactos y pueda imprimirse en 3D sin errores:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; margin-bottom: 2rem;">
            <div style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 1rem;">
                <div style="color: #4ade80; font-weight: 900; margin-bottom: 5px;">✅ Quads dominantes</div>
                <p style="color: #94a3b8; font-size: 0.8rem; margin: 0; line-height: 1.55;">Usa caras de 4 lados (quads) siempre que sea posible. Se subdividen, suavizan y animan mejor que los triángulos (tris) o polígonos (ngons).</p>
            </div>
            <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 1rem;">
                <div style="color: #fbbf24; font-weight: 900; margin-bottom: 5px;">⚠️ Evitar vertices con más de 5 aristas</div>
                <p style="color: #94a3b8; font-size: 0.8rem; margin: 0; line-height: 1.55;">Un vértice donde convergen muchas aristas (estrella) crea pinchazos al suavizar. Un buen vértice tiene 3 o 4 aristas.</p>
            </div>
            <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 1rem;">
                <div style="color: #38bdf8; font-weight: 900; margin-bottom: 5px;">🔁 Flujo de aristas balanceado</div>
                <p style="color: #94a3b8; font-size: 0.8rem; margin: 0; line-height: 1.55;">Las aristas deben fluir siguiendo la forma de la pieza (parallelas al collar, radiales en la base). Evita giros abruptos de la malla.</p>
            </div>
        </div>

        <div style="background: rgba(236, 72, 153, 0.08); border: 1px solid rgba(236, 72, 153, 0.25); border-radius: 12px; padding: 1.25rem; margin-bottom: 2rem;">
            <h4 style="color: #ec4899; margin: 0 0 10px; font-size: 1.05rem; font-weight: 800;">
                🛠️ Herramientas de la Barra Superior en Modo Edición
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; font-size: 0.82rem;">
                <div style="background: #1e293b; padding: 8px 12px; border-radius: 8px;">
                    <strong style="color: #f8fafc;">1 / 2 / 3:</strong> Seleccionar vértices / aristas / caras.
                </div>
                <div style="background: #1e293b; padding: 8px 12px; border-radius: 8px;">
                    <strong style="color: #f8fafc;">Ctrl + LMB:</strong> Añadir un nuevo vértice a la malla.
                </div>
                <div style="background: #1e293b; padding: 8px 12px; border-radius: 8px;">
                    <strong style="color: #f8fafc;">A:</strong> Seleccionar todo / deseleccionar todo (doble A).
                </div>
                <div style="background: #1e293b; padding: 8px 12px; border-radius: 8px;">
                    <strong style="color: #f8fafc;">B:</strong> Selección por caja (Box Select).
                </div>
                <div style="background: #1e293b; padding: 8px 12px; border-radius: 8px;">
                    <strong style="color: #f8fafc;">G → Z:</strong> Deslizar un vértice verticalmente (perfil del peón).
                </div>
                <div style="background: #1e293b; padding: 8px 12px; border-radius: 8px;">
                    <strong style="color: #f8fafc;">Shift + RMB:</strong> Sumar componentes a la selección actual.
                </div>
            </div>
        </div>
    `,
    flashcards: [
        {
            front: '¿Cuál es el proyecto integrador que construiremos entre el Módulo 1 y el Módulo 2 de Modelado 3D?',
            back: 'Un set completo de Ajedrez 3D: Peón, Torre y Alfil en M1; Rey, Reina, Tablero y Caballo en M2, más retos extra como un trencito de juguete y jarrones.'
        },
        {
            front: '¿Qué tecla activa el Modo Edición (Edit Mode) en Blender?',
            back: 'La tecla Tab. Permite manipular vértices, aristas y caras de la malla individualmente.'
        },
        {
            front: '¿Cuál es la diferencia principal entre el Modo Objeto y el Modo Edición?',
            back: 'El Modo Objeto transforma la malla como un todo (mover, rotar, escalar); el Modo Edición transforma componentes individuales (vértices, aristas, caras).'
        },
        {
            front: '¿Qué teclas seleccionan vértices, aristas y caras respectivamente?',
            back: 'La tecla 1 selecciona vértices, la tecla 2 selecciona aristas y la tecla 3 selecciona caras.'
        },
        {
            front: '¿Qué técnica se usa para modelar piezas de ajedrez de forma simétrica y eficiente?',
            back: 'La Revolución de un perfil 2D alrededor del eje vertical (modificador Screw), ideal para objetos torneados como las piezas de ajedrez.'
        },
        {
            front: '¿Qué partes anatómicas componen un Peón de ajedrez de abajo hacia arriba?',
            back: 'Base cónica, tallo (astil), collar, cabeza esférica y punta.'
        },
        {
            front: '¿Qué es la topología de una malla en modelado 3D?',
            back: 'La disposición de vértices, aristas y caras sobre la superficie del modelo. Una buena topología usa quads, flujo de aristas balanceado y evita estrellas.'
        },
        {
            front: '¿Por qué se prefieren las caras cuadrangulares (quads) en modelado profesional?',
            back: 'Porque se subdividen, suavizan y animan mejor que los triángulos (tris) o polígonos irregulares (ngons).'
        },
        {
            front: '¿Cómo se añade un nuevo vértice a una malla en Modo Edición?',
            back: 'Manteniendo presionada la tecla Ctrl y haciendo clic con el botón izquierdo del ratón (Ctrl + LMB).'
        },
        {
            front: '¿Qué consecuencias trae un vértice donde convergen 6 o más aristas (estrella)?',
            back: 'Al suavizar o subdividir la malla se generan "pinchazos" o artefactos visibles. Un buen vértice debe tener 3 o 4 aristas.'
        }
    ],
    questions: [
        {
            question: '¿Qué tecla de Blender activa el Modo Edición necesario para manipular la malla del Peón?',
            options: [
                'Tab',
                'Espacio',
                'F5',
                'Alt'
            ],
            correct: 0,
            explanation: 'La tecla Tab alterna entre el Modo Edición (componentes) y el Modo Objeto (conjunto).'
        },
        {
            question: '¿Cuál es el proyecto integrador que se construye entre los Módulos 1 y 2 del curso de Modelado 3D?',
            options: [
                'Un set completo de Ajedrez 3D',
                'Una maqueta de la ciudad',
                'Un personaje de videojuego',
                'Un automóvil deportivo'
            ],
            correct: 0,
            explanation: 'Entre M1 y M2 se modela el set de ajedrez: Peón, Torre y Alfil (M1); Rey, Reina, Tablero y Caballo (M2).'
        },
        {
            question: 'Dentro del Modo Edición, ¿qué tecla selecciona exclusivamente las aristas de la malla?',
            options: [
                'Tecla 2',
                'Tecla 1',
                'Tecla 3',
                'Tecla 9'
            ],
            correct: 0,
            explanation: 'La tecla 2 activa el modo de selección por aristas (edges).'
        },
        {
            question: '¿Qué partes componen la anatomía de un Peón de ajedrez?',
            options: [
                'Base, tallo, collar, cabeza esférica y punta',
                'Alas, cuerpo y pico',
                'Ruedas, chasis y cabina',
                'Plataforma y torretas'
            ],
            correct: 0,
            explanation: 'El peón se compone de base cónica, tallo/astil, collar, cabeza esférica y una pequeña punta.'
        },
        {
            question: '¿Qué técnica de modelado es la más eficiente para piezas cilíndricas simétricas como las de ajedrez?',
            options: [
                'La revolución de un perfil 2D alrededor del eje vertical (Screw)',
                'Esculpir vértice por vértice a mano alzada',
                'Usar exclusivamente texturas de mapa normal',
                'Pintar la silueta con el pincel de texturas'
            ],
            correct: 0,
            explanation: 'El modificador Screw gira un perfil 2D alrededor de un eje, creando objetos torneados perfectos como las piezas de ajedrez.'
        },
        {
            question: '¿Qué es la topología de una malla poligonal?',
            options: [
                'La disposición de vértices, aristas y caras sobre la superficie',
                'El color de los materiales asignados',
                'La resolución de la cámara de render',
                'La cantidad de luces de la escena'
            ],
            correct: 0,
            explanation: 'La topología describe la estructura de la malla: cómo se conectan sus componentes y cuán limpio fluyen sus aristas.'
        },
        {
            question: '¿Por qué se prefieren las caras cuadrangulares (quads) en la topología de un modelo?',
            options: [
                'Porque se subdividen y suavizan mejor que los tris y ngons',
                'Porque consumen menos memoria de video',
                'Porque son más fáciles de colorear',
                'Porque evitan el uso de materiales'
            ],
            correct: 0,
            explanation: 'Los quads mantienen un flujo uniforme de aristas y permiten subdivisión y deformación limpias.'
        },
        {
            question: '¿Qué se debe evitar para no generar "pinchazos" al suavizar una malla?',
            options: [
                'Vértices con más de 5 aristas convergentes (estrellas)',
                'El uso de sombreado suave',
                'Aplicar el material metálico',
                'Mover la cámara en órbita'
            ],
            correct: 0,
            explanation: 'Los vértices estrella (con 6 o más aristas) crean artefactos al aplicar subdivisiones o suavizado.'
        },
        {
            question: '¿Qué atajo permite añadir un vértice nuevo a una malla en Modo Edición?',
            options: [
                'Ctrl + Clic Izquierdo (Ctrl + LMB)',
                'Shift + A',
                'Ctrl + Shift + S',
                'Alt + Espacio'
            ],
            correct: 0,
            explanation: 'Ctrl + LMB añade un vértice nuevo donde haces clic, uniendo la malla en ese punto.'
        },
        {
            question: '¿Cuál es el primer paso del flujo de trabajo real para modelar un Peón?',
            options: [
                'Dibujar el perfil 2D y girarlo con el modificador Screw',
                'Aplicar el material de marfil',
                'Configurar la cámara de render',
                'Insertar un cubo y escalarlo'
            ],
            correct: 0,
            explanation: 'Primero se dibuja la silueta (perfil) de la pieza y luego se gira alrededor del eje vertical con el modificador Screw.'
        }
    ],
    quizConfig: { timePerQuestion: 20, requiredScorePercent: 80 }
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ma-m1-l3-content',
                content: lessonDefinition.content,
                hasSimulator: lessonDefinition.hasSimulator
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ma-m1-l3-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        simulador: [
            createContentBlock({
                id: 'ma-m1-l3-practice',
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
                id: 'ma-m1-l3-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions,
                quizConfig: lessonDefinition.quizConfig
            })
        ]
    }
});