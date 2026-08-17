import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Circuitos en Serie, Leyes de Kirchhoff y Medición',
    hasSimulator: true,
    content: `
        <!-- ── 3.1 ¿Qué es un Circuito en Serie? ── -->
        <h3 id="ee-3-1" style="color: #38bdf8; margin: 1.5rem 0 1rem; font-size: 1.4rem;">3.1 ¿Qué es un Circuito en Serie?</h3>
        <p style="margin-bottom: 1.25rem; line-height: 1.8;">
            Un <strong>circuito en serie</strong> es una conexión en cadena donde los componentes se conectan uno a continuación del otro (extremo con extremo), formando <strong>un único camino cerrado</strong> para el flujo de electrones.
        </p>
        <p style="margin-bottom: 1.5rem; line-height: 1.8; color: #cbd5e1;">
            En este tipo de conexión, todos los electrones que salen del polo positivo de la batería están obligados a atravesar cada uno de los elementos en orden antes de retornar al polo negativo. Si en algún punto la cadena se interrumpe, <strong>todo el circuito deja de funcionar</strong>.
        </p>

        <!-- Simulador Interactivo del Circuito en Serie (Camino Único) -->
        <div style="margin: 1.5rem 0 2.5rem;">
            <div id="series-circuit-demo-container"></div>
        </div>

        <!-- ── 3.2 Las 3 Reglas de Oro del Circuito en Serie ── -->
        <h3 id="ee-3-2" style="color: #facc15; margin: 2.5rem 0 1rem; font-size: 1.4rem;">3.2 Las 3 Reglas de Oro del Circuito en Serie</h3>
        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            Para analizar y resolver cualquier circuito en serie, solo necesitas recordar estas tres leyes fundamentales:
        </p>

        <!-- Tarjetas de las 3 Reglas de Oro -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
            <!-- Regla 1: Corriente Constante -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="font-size: 1.8rem; margin-bottom: 0.35rem;">🌊</div>
                    <h4 style="color: #38bdf8; margin: 0 0 0.5rem; font-size: 1.05rem;">Regla 1: La Corriente es la MISMA</h4>
                    <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin: 0 0 0.75rem;">
                        Como no existen desvíos ni bifurcaciones, el valor de corriente (Amperios) que circula por cada componente es exactamente idéntico:
                    </p>
                </div>
                <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 10px; padding: 10px; text-align: center; font-size: 1.1rem; font-weight: 800; color: #38bdf8; font-family: monospace;">
                    I<sub>total</sub> = I<sub>1</sub> = I<sub>2</sub> = I<sub>3</sub>
                </div>
            </div>

            <!-- Regla 2: Suma de Voltajes -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 16px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="font-size: 1.8rem; margin-bottom: 0.35rem;">🔋</div>
                    <h4 style="color: #c084fc; margin: 0 0 0.5rem; font-size: 1.05rem;">Regla 2: El Voltaje se REPARTE</h4>
                    <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin: 0 0 0.75rem;">
                        El voltaje total entregado por la fuente se distribuye entre las resistencias del circuito en forma de caídas de tensión:
                    </p>
                </div>
                <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 10px; padding: 10px; text-align: center; font-size: 1.1rem; font-weight: 800; color: #c084fc; font-family: monospace;">
                    V<sub>total</sub> = V<sub>1</sub> + V<sub>2</sub> + V<sub>3</sub>
                </div>
            </div>

            <!-- Regla 3: Resistencia Equivalente -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 16px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="font-size: 1.8rem; margin-bottom: 0.35rem;">🧱</div>
                    <h4 style="color: #fbbf24; margin: 0 0 0.5rem; font-size: 1.05rem;">Regla 3: Las Resistencias se SUMAN</h4>
                    <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin: 0 0 0.75rem;">
                        Para simplificar los cálculos, la resistencia total equivalente (R<sub>eq</sub>) se obtiene sumando directamente cada resistencia individual:
                    </p>
                </div>
                <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 10px; padding: 10px; text-align: center; font-size: 1.1rem; font-weight: 800; color: #fbbf24; font-family: monospace;">
                    R<sub>eq</sub> = R<sub>1</sub> + R<sub>2</sub> + R<sub>3</sub>
                </div>
            </div>
        </div>

        <!-- Ejemplo Práctico Interactivo con Batería Realista, Resistencias Cerámicas y Animación -->
        <div style="margin: 1.5rem 0 2.5rem;">
            <div id="series-calculation-visualizer-container"></div>
        </div>

        <!-- ── 3.3 Las Leyes de Kirchhoff (Nodos y Mallas) ── -->
        <h3 id="ee-3-3" style="color: #a855f7; margin: 2.5rem 0 1rem; font-size: 1.4rem;">3.3 Las Leyes de Kirchhoff</h3>
        <p style="margin-bottom: 1.25rem; line-height: 1.8; color: #cbd5e1;">
            Las <strong>leyes de Kirchhoff</strong> son dos principios fundamentales en la física y la ingeniería eléctrica que permiten analizar y calcular las corrientes y los voltajes en cualquier circuito eléctrico cerrado. Fueron formuladas por el físico alemán <strong>Gustav Kirchhoff en 1845</strong>.
        </p>

        <!-- Tarjetas Paralelas: Primera y Segunda Ley -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
            
            <!-- 1. Primera Ley: Ley de Corrientes (Nodos) -->
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.35); border-left: 4px solid #38bdf8; border-radius: 16px; padding: 1.35rem; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="font-size: 1.3rem;">⚡ 1. Primera Ley</span>
                        <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 800;">LCK · Nodos</span>
                    </div>
                    <h4 style="color: #38bdf8; margin: 0 0 0.5rem; font-size: 1.05rem;">Ley de Corrientes de Kirchhoff</h4>
                    
                    <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin: 0 0 0.75rem;">
                        <strong>Enunciado:</strong> La suma algebraica de todas las corrientes que entran a un nodo (o unión) en un circuito debe ser igual a cero. En términos más sencillos: <em>la corriente total que entra a un nodo es igual a la corriente total que sale de él</em>.
                    </p>

                    <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 8px 12px; margin-bottom: 0.75rem;">
                        <p style="color: #94a3b8; font-size: 0.78rem; line-height: 1.5; margin: 0;">
                            ⚛️ <strong>Fundamento:</strong> Se basa en el <strong>principio de conservación de la carga eléctrica</strong>; la carga no se crea, no se destruye ni se acumula en un nodo.
                        </p>
                    </div>
                </div>

                <div style="background: rgba(0,0,0,0.5); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 10px; padding: 10px; text-align: center; font-size: 1.15rem; font-weight: 900; color: #38bdf8; font-family: monospace;">
                    Σ I<sub>entrantes</sub> = Σ I<sub>salientes</sub>
                </div>
            </div>

            <!-- 2. Segunda Ley: Ley de Voltajes (Mallas) -->
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(168, 85, 247, 0.35); border-left: 4px solid #c084fc; border-radius: 16px; padding: 1.35rem; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="font-size: 1.3rem;">🔋 2. Segunda Ley</span>
                        <span style="background: rgba(168, 85, 247, 0.15); color: #c084fc; padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 800;">LVK · Mallas</span>
                    </div>
                    <h4 style="color: #c084fc; margin: 0 0 0.5rem; font-size: 1.05rem;">Ley de Voltajes de Kirchhoff</h4>
                    
                    <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin: 0 0 0.75rem;">
                        <strong>Enunciado:</strong> En cualquier trayectoria cerrada (malla) de un circuito, la suma de todas las caídas de tensión es igual al voltaje suministrado por las fuentes: <em>la suma total de las diferencias de potencial en cualquier lazo cerrado es cero</em>.
                    </p>

                    <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 8px 12px; margin-bottom: 0.75rem;">
                        <p style="color: #94a3b8; font-size: 0.78rem; line-height: 1.5; margin: 0;">
                            ⚡ <strong>Fundamento:</strong> Se basa en el <strong>principio de conservación de la energía</strong>; una carga que recorre una malla cerrada regresa al mismo potencial eléctrico inicial.
                        </p>
                    </div>
                </div>

                <div style="background: rgba(0,0,0,0.5); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 10px; padding: 10px; text-align: center; font-size: 1.15rem; font-weight: 900; color: #c084fc; font-family: monospace;">
                    Σ V = 0 &nbsp;&nbsp;(V<sub>fuente</sub> = V₁ + V₂ + ...)
                </div>
            </div>

        </div>

        <!-- ── 3.4 El Divisor de Voltaje ── -->
        <h3 id="ee-3-4" style="color: #10b981; margin: 2.5rem 0 1rem; font-size: 1.4rem;">3.4 El Divisor de Voltaje</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            El <strong>Divisor de Voltaje</strong> es una de las herramientas más útiles de la electrónica. Permite obtener una fracción exacta del voltaje total en un punto intermedio entre dos resistencias:
        </p>

        <div style="background: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 1.35rem; margin-bottom: 1.5rem; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; font-family: monospace; font-size: 1.6rem; font-weight: 900; color: #34d399;">
                <span>V<sub>Rx</sub> = V<sub>total</sub> ·</span>
                <span style="font-size: 2.8rem; font-weight: 300; line-height: 1; color: #6ee7b7;">(</span>
                <div style="display: inline-flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.1; margin: 0 2px;">
                    <span style="border-bottom: 2.5px solid #34d399; padding: 0 10px 4px; font-size: 1.35rem; width: 100%; text-align: center;">R<sub>x</sub></span>
                    <span style="padding: 4px 10px 0; font-size: 1.35rem; width: 100%; text-align: center;">R<sub>eq</sub></span>
                </div>
                <span style="font-size: 2.8rem; font-weight: 300; line-height: 1; color: #6ee7b7;">)</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.82rem; margin: 0.75rem 0 0;">
                El voltaje se reparte de forma proporcional: el resistor con mayor valor en Ohms se queda con la mayor caída de voltaje.
            </p>
        </div>

        <!-- Aplicaciones Prácticas del Divisor -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1rem;">
                <h5 style="color: #38bdf8; margin: 0 0 0.4rem; font-size: 0.95rem;">🎛️ Potenciómetros</h5>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Divisores de voltaje ajustables mediante perilla para regular volumen, brillo o velocidad.
                </p>
            </div>
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1rem;">
                <h5 style="color: #facc15; margin: 0 0 0.4rem; font-size: 0.95rem;">☀️ Sensores de Luz (LDR)</h5>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Convierten cambios de iluminación en variaciones de voltaje para encender luces automáticamente.
                </p>
            </div>
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1rem;">
                <h5 style="color: #a855f7; margin: 0 0 0.4rem; font-size: 0.95rem;">🤖 Entradas de Arduino</h5>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Permiten reducir voltajes de 12V o 24V a niveles seguros de 5V para que los lea el microcontrolador.
                </p>
            </div>
        </div>

        <!-- ── 3.5 Diagnóstico de Fallas en Circuitos Serie ── -->
        <h3 id="ee-3-5" style="color: #ef4444; margin: 2.5rem 0 1rem; font-size: 1.4rem;">3.5 Diagnóstico de Fallas en Circuitos Serie</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
            <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #ef4444; margin: 0 0 0.5rem; font-size: 1rem;">💥 Componente Abierto (Falla Clásica)</h4>
                <ul style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.7; margin: 0; padding-left: 1.2rem;">
                    <li>Si un foco se quema o un cable se suelta, la corriente cae inmediatamente a <strong>0 Amperios</strong>.</li>
                    <li>Todos los demás componentes se apagan al instante.</li>
                    <li>Un voltímetro conectado sobre el componente abierto medirá <strong>todo el voltaje de la fuente</strong>.</li>
                </ul>
            </div>

            <div style="background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #f59e0b; margin: 0 0 0.5rem; font-size: 1rem;">⚡ Resistor en Cortocircuito</h4>
                <ul style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.7; margin: 0; padding-left: 1.2rem;">
                    <li>La resistencia de ese componente pasa a ser 0 Ω.</li>
                    <li>La Req total disminuye y la corriente total del circuito <strong>aumenta</strong>.</li>
                    <li>Los demás componentes de la serie reciben más voltaje y pueden sobrecalentarse.</li>
                </ul>
            </div>
        </div>
    `,
    flashcards: [
        { id: 'ee-1-3-f1', type: 'series', q: '¿Cómo se comporta la corriente en un circuito en serie?', a: 'Es exactamente la misma en todos los componentes', sub: 'I_total = I_1 = I_2 = I_3 (Regla 1)', sectionId: 'ee-3-2' },
        { id: 'ee-1-3-f2', type: 'series', q: '¿Cómo se calcula la Resistencia Equivalente (Req) en serie?', a: 'Sumando todas las resistencias directamente', sub: 'Req = R1 + R2 + R3 + ... (Regla 3)', sectionId: 'ee-3-2' },
        { id: 'ee-1-3-f3', type: 'kirchhoff', q: '¿Qué establece la Ley de Voltajes de Kirchhoff (LVK)?', a: 'La suma de las caídas de voltaje es igual al voltaje de la fuente', sub: 'V_fuente = V1 + V2 + V3', sectionId: 'ee-3-3' },
        { id: 'ee-1-3-f4', type: 'calc', q: 'Si conectamos R1=100Ω y R2=220Ω en serie, ¿cuánto vale Req?', a: '320 Ω', sub: '100 + 220 = 320 Ω', sectionId: 'ee-3-2' },
        { id: 'ee-1-3-f5', type: 'calc', q: 'Con VT=24V y Req=120Ω, ¿cuál es la corriente total?', a: '0.2 A (200 mA)', sub: 'I = 24V / 120Ω = 0.2 A', sectionId: 'ee-3-2' },
        { id: 'ee-1-3-f6', type: 'kirchhoff', q: '¿Cuál es el fundamento físico de la Ley de Corrientes (LCK)?', a: 'El principio de conservación de la carga eléctrica', sub: 'La carga no se acumula en ningún nodo', sectionId: 'ee-3-3' },
        { id: 'ee-1-3-f7', type: 'kirchhoff', q: '¿Cuál es el fundamento físico de la Ley de Voltajes (LVK)?', a: 'El principio de conservación de la energía', sub: 'En un lazo cerrado la suma de potenciales es cero', sectionId: 'ee-3-3' },
        { id: 'ee-1-3-f8', type: 'divider', q: '¿Cuál es la fórmula del Divisor de Voltaje para R2?', a: 'V2 = VT × (R2 / Req)', sub: 'Proporción de resistencia sobre el total', sectionId: 'ee-3-4' },
        { id: 'ee-1-3-f9', type: 'theory', q: 'Si un foco en serie se quema y queda abierto, ¿qué ocurre?', a: 'Todo el circuito se apaga y la corriente cae a 0 A', sub: 'Se interrumpe el único camino cerrado', sectionId: 'ee-3-5' },
        { id: 'ee-1-3-f10', type: 'calc', q: 'Dos resistencias iguales de 1kΩ están en serie con 10V. ¿Cuánto cae en cada una?', a: '5 Voltios exactamente en cada una', sub: '10V / 2 = 5V', sectionId: 'ee-3-4' }
    ],
    questions: [
        {
            id: 'ee-1-3-q1',
            objective: 'Calcular resistencia equivalente en serie',
            concept: 'resistencia_serie',
            difficulty: 'easy',
            q: 'Tres resistencias de 20Ω, 30Ω y 50Ω se conectan en serie. La resistencia equivalente total es:',
            options: ['100 Ω', '10 Ω', '33.3 Ω', '300 Ω'],
            correct: 0
        },
        {
            id: 'ee-1-3-q2',
            objective: 'Identificar el comportamiento de la corriente en serie',
            concept: 'corriente_serie',
            difficulty: 'easy',
            q: 'En un circuito serie formado por una batería de 9V y tres bombillos:',
            options: [
                'La corriente que pasa por cada bombillo es exactamente idéntica',
                'Cada bombillo recibe una corriente diferente según su tamaño',
                'El último bombillo de la serie recibe menos corriente',
                'La corriente depende del color del bombillo'
            ],
            correct: 0
        },
        {
            id: 'ee-1-3-q3',
            objective: 'Calcular caídas de tensión con la Ley de Ohm',
            concept: 'caida_tension',
            difficulty: 'medium',
            q: 'Una fuente de 12V alimenta en serie una resistencia R1=4Ω y otra R2=8Ω (Req=12Ω). La caída de voltaje en R2 es:',
            options: ['8 V', '4 V', '12 V', '6 V'],
            correct: 0
        },
        {
            id: 'ee-1-3-q4',
            objective: 'Comprender el principio de la LVK',
            concept: 'lvk',
            difficulty: 'medium',
            q: 'La Ley de Voltajes de Kirchhoff (LVK) establece que en cualquier malla cerrada:',
            options: [
                'La suma de todas las caídas de voltaje es igual al voltaje suministrado por la fuente',
                'El voltaje total siempre debe ser exactamente 12V',
                'La corriente se duplica en cada resistencia del recorrido',
                'La resistencia equivalente siempre es cero'
            ],
            correct: 0
        },
        {
            id: 'ee-1-3-q5',
            objective: 'Aplicar la fórmula del divisor de voltaje',
            concept: 'divisor_voltaje',
            difficulty: 'hard',
            q: 'En un divisor de voltaje con VT = 20V, R1 = 3kΩ y R2 = 1kΩ (Req = 4kΩ), ¿cuál es el voltaje sobre R2?',
            options: ['5 V', '15 V', '10 V', '20 V'],
            correct: 0
        },
        {
            id: 'ee-1-3-q6',
            objective: 'Comprender el principio físico de la LCK',
            concept: 'lck',
            difficulty: 'medium',
            q: 'La Primera Ley de Kirchhoff (Ley de Corrientes en Nodos) se fundamenta en:',
            options: [
                'El principio de conservación de la carga eléctrica',
                'El principio de inducción electromagnética de Faraday',
                'El efecto Joule de disipación de calor',
                'La teoría de la relatividad especial'
            ],
            correct: 0
        },
        {
            id: 'ee-1-3-q7',
            objective: 'Diagnosticar fallas por componente abierto',
            concept: 'fallas_serie',
            difficulty: 'hard',
            q: 'Si un resistor se quema y queda en circuito abierto dentro de una serie de 120V, ¿qué voltaje medirá un voltímetro conectado en sus extremos?',
            options: ['120 V (la totalidad de la fuente)', '0 V', '60 V', 'Infinito Voltios'],
            correct: 0
        },
        {
            id: 'ee-1-3-q8',
            objective: 'Identificar el uso correcto de elementos de protección',
            concept: 'aplicaciones_serie',
            difficulty: 'easy',
            q: '¿Por qué los interruptores y fusibles de protección se conectan siempre en serie con la carga?',
            options: [
                'Porque al abrirse o fundirse interrumpen toda la corriente de la línea',
                'Para aumentar la potencia total entregada por la fuente',
                'Para cambiar el circuito de corriente continua a alterna',
                'Para reducir a la mitad el voltaje de la instalación'
            ],
            correct: 0
        }
    ],
    quizConfig: { timePerQuestion: 45, requiredScorePercent: 75 }
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m1-l3-content',
                content: lessonDefinition.content,
                hasSimulator: lessonDefinition.hasSimulator
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ee-m1-l3-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        simulador: [
            createContentBlock({
                id: 'ee-m1-l3-practice',
                content: `
                    <div style="margin-bottom: 2rem;">
                        <div id="practical-lab-l3-container"></div>
                    </div>
                `,
                hasSimulator: true
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m1-l3-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions,
                quizConfig: lessonDefinition.quizConfig
            })
        ]
    }
});
