import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Capacitores y Almacenamiento de Energía',
    hasSimulator: true,
    content: `
        <h3 id="ee-2-7-1" style="color: #f59e0b; margin: 1.5rem 0 1rem; font-size: 1.4rem;">7.1 Historia y ¿Qué es un Capacitor?</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Un <strong>capacitor</strong> (o condensador) es un componente pasivo fundamental diseñado para almacenar energía eléctrica en forma de un <strong>campo electrostático interno</strong>. A diferencia de las baterías (que acumulan energía a través de lentas reacciones electroquímicas), los capacitores acumulan carga directamente en sus placas conductoras y pueden entregarla o absorberla en cuestión de milisegundos.
        </p>

        <!-- Píldora Histórica -->
        <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; padding: 1.25rem; margin-bottom: 1.5rem;">
            <h4 style="color: #fde047; margin: 0 0 0.5rem; font-size: 1.05rem;">📜 La Botella de Leyden (1745) y Michael Faraday</h4>
            <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.7; margin: 0;">
                El primer capacitor de la historia fue la <strong>Botella de Leyden</strong>, creada en 1745 por Pieter van Musschenbroek y Ewald von Kleist al almacenar cargas electrostáticas en un frasco con agua y una varilla metálica. Años después, el célebre físico <strong>Michael Faraday</strong> formalizó los principios del campo eléctrico y el efecto del dieléctrico, razón por la cual la unidad de capacitancia lleva su nombre: el <strong>Faradio (F)</strong>.
            </p>
        </div>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <h4 style="color: #38bdf8; margin: 0 0 0.5rem; font-size: 1.1rem;">⚡ Estructura Física y Almacenamiento de Carga</h4>
            <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.7; margin: 0;">
                Todo capacitor consta de dos partes clave:
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.85rem; margin-top: 1rem;">
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 0.85rem; border-left: 3px solid #ef4444;">
                    <div style="color: #ef4444; font-weight: 800; font-size: 0.82rem;">1. PLACAS CONDUCTORAS</div>
                    <p style="color: #94a3b8; font-size: 0.78rem; margin: 0.25rem 0 0; line-height: 1.4;">
                        Dos láminas metálicas paralelas. Una acumula carga positiva ($+Q$) y la otra carga negativa ($-Q$).
                    </p>
                </div>
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 0.85rem; border-left: 3px solid #38bdf8;">
                    <div style="color: #38bdf8; font-weight: 800; font-size: 0.82rem;">2. DIELÉCTRICO (AISLANTE)</div>
                    <p style="color: #94a3b8; font-size: 0.78rem; margin: 0.25rem 0 0; line-height: 1.4;">
                        Material aislante (cerámica, aire, mylar, mica u óxido) que impide el salto directo de electrones reteniendo el campo eléctrico.
                    </p>
                </div>
            </div>
        </div>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.25rem; text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 1.4rem; font-weight: 800; color: #38bdf8; font-family: monospace;">
                C = Q / V
            </div>
            <p style="color: #94a3b8; font-size: 0.82rem; margin: 0.5rem 0 0;">
                La <strong>Capacitancia ($C$)</strong> relaciona la carga acumulada ($Q$ en Culombios) con el voltaje aplicado ($V$ en Voltios).
            </p>
        </div>

        <h3 id="ee-2-7-2" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">7.2 Comportamiento Eléctrico: Antes, Durante y Después de Cargar</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            El comportamiento de un capacitor en corriente directa ($\text{DC}$) cambia drásticamente en tres etapas temporales:
        </p>

        <!-- Cuadro Comparativo de Etapas de Carga -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 14px; padding: 1rem;">
                <div style="color: #ef4444; font-weight: 800; font-size: 0.88rem; margin-bottom: 4px;">1. EN EL INSTANTE INICIAL (t = 0)</div>
                <div style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.5;">
                    El capacitor está descargado ($V_C = 0\text{V}$). Se comporta como un <strong>CORTOCIRCUITO (cable directo)</strong>, permitiendo el paso de la corriente máxima pico:
                    <div style="color: #ef4444; font-family: monospace; font-weight: 800; margin-top: 4px;">I_max = Vin / R</div>
                </div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 14px; padding: 1rem;">
                <div style="color: #f59e0b; font-weight: 800; font-size: 0.88rem; margin-bottom: 4px;">2. EN RÉGIMEN TRANSITORIO (0 < t < 5τ)</div>
                <div style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.5;">
                    El voltaje sube exponencialmente mientras la corriente desciende de forma exponencial:
                    <div style="color: #f59e0b; font-family: monospace; font-weight: 800; margin-top: 4px;">τ = R × C (1τ = 63.2% de carga)</div>
                </div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 1rem;">
                <div style="color: #34d399; font-weight: 800; font-size: 0.88rem; margin-bottom: 4px;">3. EN ESTADO ESTACIONARIO (t ≥ 5τ)</div>
                <div style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.5;">
                    El capacitor alcanza el voltaje total ($V_C = V_{in}$). La corriente se detiene ($I = 0\text{A}$), comportándose como un <strong>CIRCUITO ABIERTO (cable desconectado)</strong>.
                </div>
            </div>
        </div>

        <p style="color: #94a3b8; font-size: 0.88rem; margin-bottom: 1.5rem;">
            Experimenta en vivo en el siguiente simulador interactivo con <strong>osciloscopio digital en tiempo real</strong>:
        </p>

        <!-- SIMULADOR INTERACTIVO SVG DE CARGA/DESCARGA RC CON OSCILOSCOPIO -->
        <div style="margin: 2rem 0;">
            <div id="capacitor-charge-simulator-container"></div>
        </div>

        <h3 id="ee-2-7-3" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">7.3 Cálculo de la Energía Almacenada</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            La energía $E$ almacenada en un capacitor depende directamente del cuadrado del voltaje al que está cargado:
        </p>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(253, 224, 71, 0.3); border-radius: 16px; padding: 1.25rem; text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 1.4rem; font-weight: 800; color: #fde047; font-family: monospace;">
                E = ½ × C × V²
            </div>
            <p style="color: #94a3b8; font-size: 0.82rem; margin: 0.5rem 0 0;">
                Donde $E$ es la energía en <strong>Joules (J)</strong>, $C$ es la capacitancia en Faradios (F) y $V$ es el voltaje en Voltios (V).
            </p>
        </div>

        <h3 id="ee-2-7-4" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">7.4 Tecnologías de Almacenamiento: Capacitores vs. Supercapacitores vs. Baterías</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            En la ingeniería electrónica existen diferentes tecnologías para almacenar energía eléctrica. Cada una tiene fortalezas únicas:
        </p>

        <!-- Comparativa de Tecnologías de Almacenamiento -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 14px; padding: 1rem;">
                <h4 style="color: #38bdf8; margin: 0 0 0.4rem; font-size: 0.95rem;">⚡ Capacitores Estándar</h4>
                <div style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.5;">
                    • <strong>Mecanismo:</strong> Campo electrostático en placas.<br/>
                    • <strong>Velocidad:</strong> Milisegundos (potencia instantánea).<br/>
                    • <strong>Ciclos de vida:</strong> Ilimitados (> 10,000,000).<br/>
                    • <strong>Uso:</strong> Filtrado de fuentes, desacople y audio.
                </div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 14px; padding: 1rem;">
                <h4 style="color: #f59e0b; margin: 0 0 0.4rem; font-size: 0.95rem;">🚀 Supercapacitores (EDLC)</h4>
                <div style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.5;">
                    • <strong>Mecanismo:</strong> Doble capa electroquímica ($1\text{F}$ a $3000\text{F}$).<br/>
                    • <strong>Velocidad:</strong> Segundos (carga ultra rápida).<br/>
                    • <strong>Ciclos de vida:</strong> > 1,000,000 de ciclos.<br/>
                    • <strong>Uso:</strong> Frenado regenerativo (KERS) y UPS de respaldo.
                </div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 1rem;">
                <h4 style="color: #34d399; margin: 0 0 0.4rem; font-size: 0.95rem;">🔋 Baterías Electroquímicas (Li-Ion / NiMH)</h4>
                <div style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.5;">
                    • <strong>Mecanismo:</strong> Reacción química redox.<br/>
                    • <strong>Velocidad:</strong> Lenta (minutos u horas).<br/>
                    • <strong>Ciclos de vida:</strong> 500 a 2,000 ciclos.<br/>
                    • <strong>Uso:</strong> Autonomía prolongada (smartphones, drones, autos).
                </div>
            </div>
        </div>

        <h3 id="ee-2-7-5" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">7.5 Familias de Capacitores y Decodificación de Código (EIA)</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Según su construcción física y polaridad, los capacitores comerciales se dividen en:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1rem;">
                <h4 style="color: #f97316; margin: 0 0 0.4rem; font-size: 0.95rem;">🟠 Cerámicos y de Película (No Polarizados)</h4>
                <p style="color: #94a3b8; font-size: 0.8rem; margin: 0; line-height: 1.5;">
                    Valores de picofaradios ($pF$) a nanofaradios ($nF$). Se conectan en cualquier sentido. Se identifican mediante el <strong>código numérico EIA de 3 dígitos</strong> (ej. 104 = 100 nF).
                </p>
            </div>
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 14px; padding: 1rem;">
                <h4 style="color: #ef4444; margin: 0 0 0.4rem; font-size: 0.95rem;">🚨 Electrolíticos de Aluminio (Polarizados)</h4>
                <p style="color: #94a3b8; font-size: 0.8rem; margin: 0; line-height: 1.5;">
                    Altas capacidades ($\mu F$ a $mF$). Poseen polaridad estricta ($+$ y $-$). <strong>¡Si se conectan al revés pueden explotar o perforarse!</strong>
                </p>
            </div>
        </div>

        <!-- DECODIFICADOR INTERACTIVO DE CÓDIGOS CERÁMICOS -->
        <div style="margin: 2rem 0;">
            <div id="capacitor-code-decoder-container"></div>
        </div>

        <h3 id="ee-2-7-6" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">7.6 Combinaciones en Serie y Paralelo</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Las reglas de equivalencia de capacitores son exactamente <strong>inversas a las de los resistores</strong>:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 14px; padding: 1rem;">
                <h4 style="color: #34d399; margin: 0 0 0.4rem; font-size: 0.95rem;">🔋 Capacitores en Paralelo</h4>
                <div style="font-family: monospace; font-size: 1.1rem; color: #34d399; font-weight: 800; margin-bottom: 0.3rem;">C_eq = C1 + C2 + ... + Cn</div>
                <p style="color: #94a3b8; font-size: 0.78rem; margin: 0;">Las áreas de las placas se suman, aumentando la capacitancia total.</p>
            </div>
            <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 14px; padding: 1rem;">
                <h4 style="color: #38bdf8; margin: 0 0 0.4rem; font-size: 0.95rem;">⚡ Capacitores en Serie</h4>
                <div style="font-family: monospace; font-size: 1.1rem; color: #38bdf8; font-weight: 800; margin-bottom: 0.3rem;">1/C_eq = 1/C1 + 1/C2 + ...</div>
                <p style="color: #94a3b8; font-size: 0.78rem; margin: 0;">La distancia equivalente entre placas aumenta, reduciendo la capacitancia total.</p>
            </div>
        </div>

        <h3 id="ee-2-7-7" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">7.7 Laboratorio Práctico de Retos Guiados</h3>
        <p style="color: #94a3b8; font-size: 0.88rem; margin-bottom: 1.5rem;">
            Resuelve los 8 retos interactivos para afianzar tus habilidades sobre capacitores, circuito RC y almacenamiento de energía:
        </p>

        <!-- LABORATORIO PRÁCTICO L7 -->
        <div style="margin: 2rem 0;">
            <div id="practical-lab-l7-container"></div>
        </div>
    `,
    flashcards: [
        { id: 'ee-2-7-f1', type: 'theory', q: '¿En qué forma almacena energía un capacitor?', a: 'En forma de campo electrostático entre sus placas', sub: 'Campo Eléctrico', sectionId: 'ee-2-7-1' },
        { id: 'ee-2-7-f2', type: 'calc', q: '¿Cuál es la unidad fundamental de la capacitancia?', a: 'Faradio (F), en honor a Michael Faraday', sub: '1 F = 1 Culombio / 1 Voltio', sectionId: 'ee-2-7-1' },
        { id: 'ee-2-7-f3', type: 'theory', q: '¿Cómo se comporta un capacitor descargado en el instante t=0?', a: 'Como un cortocircuito (cable directo), permitiendo corriente máxima', sub: 'Comportamiento en t=0', sectionId: 'ee-2-7-2' },
        { id: 'ee-2-7-f4', type: 'theory', q: '¿Cómo se comporta un capacitor totalmente cargado en corriente continua (DC)?', a: 'Como un circuito abierto (cable cortado), corriente I = 0 A', sub: 'Estado Estacionario', sectionId: 'ee-2-7-2' },
        { id: 'ee-2-7-f5', type: 'formula', q: '¿Cuál es la fórmula de la constante de tiempo RC?', a: 'τ = R × C (1τ = 63.2% de carga)', sub: 'Constante Tau', sectionId: 'ee-2-7-2' },
        { id: 'ee-2-7-f6', type: 'theory', q: '¿Qué ventaja clave tiene un supercapacitor frente a una batería de litio?', a: 'Se carga en segundos y soporta más de un millón de ciclos de vida', sub: 'Supercapacitores', sectionId: 'ee-2-7-4' },
        { id: 'ee-2-7-f7', type: 'calc', q: '¿Qué valor en nanofaradios (nF) representa el código cerámico 104?', a: '100 nF (0.1 µF)', sub: 'Código EIA', sectionId: 'ee-2-7-5' },
        { id: 'ee-2-7-f8', type: 'calc', q: '¿Cómo se combinan capacitores en paralelo?', a: 'Se suman directamente: C_eq = C1 + C2', sub: 'Combinación Paralela', sectionId: 'ee-2-7-6' },
        { id: 'ee-2-7-f9', type: 'calc', q: '¿Cómo se combinan capacitores iguales en serie?', a: 'La capacitancia equivalente se reduce a la mitad', sub: 'Combinación Serie', sectionId: 'ee-2-7-6' },
        { id: 'ee-2-7-f10', type: 'formula', q: '¿Cuál es la fórmula de energía almacenada en un capacitor?', a: 'E = ½ × C × V²', sub: 'Energía en Joules', sectionId: 'ee-2-7-3' }
    ],
    questions: [
        {
            id: 'ee-2-7-q1',
            objective: 'Identificar la forma de almacenamiento de energía de un capacitor',
            concept: 'capacitancia',
            difficulty: 'easy',
            q: 'Un capacitor almacena energía eléctrica principalmente en forma de:',
            options: ['Campo electrostático entre sus placas', 'Campo magnético en un núcleo', 'Reacción química ácida', 'Calor térmico disipado'],
            correct: 0
        },
        {
            id: 'ee-2-7-q2',
            objective: 'Comportamiento en el instante inicial t = 0',
            concept: 'comportamiento_t0',
            difficulty: 'medium',
            q: 'En el instante exacto en que conectas un capacitor descargado a una fuente de DC (t = 0), este se comporta como:',
            options: ['Un cortocircuito (resistencia nula y corriente máxima)', 'Un circuito abierto (corriente cero)', 'Una resistencia infinita', 'Una fuente de voltaje inverso'],
            correct: 0
        },
        {
            id: 'ee-2-7-q3',
            objective: 'Comportamiento en estado estacionario',
            concept: 'estado_estacionario',
            difficulty: 'medium',
            q: 'Cuando un capacitor en un circuito de corriente directa (DC) se encuentra completamente cargado (t ≥ 5τ), se comporta como:',
            options: ['Un circuito abierto (bloquea el paso de corriente DC)', 'Un cortocircuito continuo', 'Un diodo emisor de luz', 'Un generador de corriente alterna'],
            correct: 0
        },
        {
            id: 'ee-2-7-q4',
            objective: 'Comparativa entre supercapacitores y baterías',
            concept: 'supercapacitores_baterias',
            difficulty: 'easy',
            q: 'Una ventaja principal de los supercapacitores frente a las baterías químicas convencionales es que:',
            options: ['Se cargan en cuestión de segundos y toleran más de 1,000,000 de ciclos', 'Son mucho más pesados y tóxicos', 'Solo funcionan con corriente alterna de alta tensión', 'No almacenan energía eléctrica'],
            correct: 0
        },
        {
            id: 'ee-2-7-q5',
            objective: 'Decodificar código de capacitor cerámico EIA',
            concept: 'codigo_eia',
            difficulty: 'easy',
            q: 'Un capacitor cerámico de lenteja con la inscripción 104 corresponde a un valor de:',
            options: ['100 nF (0.1 µF)', '10 nF', '104 pF', '1 µF'],
            correct: 0
        },
        {
            id: 'ee-2-7-q6',
            objective: 'Calcular energía acumulada en un capacitor',
            concept: 'energia_capacitor',
            difficulty: 'medium',
            q: '¿Cuánta energía en Joules acumula un capacitor de 200 µF cargado a 10V?',
            options: ['0.01 Joules (10 mJ)', '0.1 Joules', '1.0 Joule', '0.005 Joules'],
            correct: 0
        },
        {
            id: 'ee-2-7-q7',
            objective: 'Determinar capacitancia equivalente en paralelo',
            concept: 'capacitores_paralelo',
            difficulty: 'easy',
            q: 'Si conectamos tres capacitores de 10 µF, 20 µF y 30 µF en paralelo, la C_eq total es:',
            options: ['60 µF', '10 µF', '5.45 µF', '100 µF'],
            correct: 0
        },
        {
            id: 'ee-2-7-q8',
            objective: 'Identificar características de capacitores electrolíticos',
            concept: 'polaridad_capacitores',
            difficulty: 'easy',
            q: 'Una regla crítica al trabajar con capacitores electrolíticos es:',
            options: ['Respetar la polaridad positiva y negativa marcada en su cuerpo', 'Conectarlos únicamente a corriente alterna', 'Calentarlos antes de soldar', 'Usar siempre voltajes superiores a 500V'],
            correct: 0
        },
        {
            id: 'ee-2-7-q9',
            objective: 'Tiempo de carga completa',
            concept: 'tiempo_carga_completa',
            difficulty: 'medium',
            q: 'Un capacitor se considera prácticamente cargado al 99.3% transcurrido un tiempo de:',
            options: ['5 constantes de tiempo (5τ)', '1 constante de tiempo (1τ)', '10 segundos fijos', '0.5 constantes de tiempo'],
            correct: 0
        },
        {
            id: 'ee-2-7-q10',
            objective: 'Determinar capacitancia equivalente en serie',
            concept: 'capacitores_serie',
            difficulty: 'medium',
            q: 'Dos capacitores idénticos de 220 µF conectados en serie dan una capacitancia equivalente de:',
            options: ['110 µF', '440 µF', '220 µF', '55 µF'],
            correct: 0
        }
    ]
};

export const lessonData = defineLesson({
    title: lessonDefinition.title,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-2-7-content',
                content: lessonDefinition.content
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ee-2-7-review',
                flashcards: lessonDefinition.flashcards
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-2-7-quiz',
                title: 'Evaluación: Capacitores y Almacenamiento de Energía',
                questions: lessonDefinition.questions,
                quizConfig: {
                    timePerQuestion: 30,
                    requiredScorePercent: 80
                }
            })
        ]
    }
});
