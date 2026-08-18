import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Análisis de Circuitos en Paralelo, Ley de Corrientes (LCK) y Divisor de Corriente',
    hasSimulator: true,
    content: `
        <!-- ── 4.1 ¿Qué es un Circuito en Paralelo? ── -->
        <h3 id="ee-4-1" style="color: #f59e0b; margin: 1.5rem 0 1rem; font-size: 1.4rem;">4.1 ¿Qué es un Circuito en Paralelo?</h3>
        <p style="margin-bottom: 1.25rem; line-height: 1.8;">
            Un <strong>circuito en paralelo</strong> es una configuración eléctrica en la que todos los componentes comparten exactamente los mismos dos puntos de conexión comunes llamados <strong>nodos</strong>. Como resultado, cada componente forma una <strong>rama independiente</strong> para el paso de la corriente eléctrica.
        </p>
        <p style="margin-bottom: 1.5rem; line-height: 1.8; color: #cbd5e1;">
            A diferencia de la conexión en serie (donde había un solo camino obligatorio), en el circuito paralelo los electrones tienen <strong>múltiples caminos alternativos</strong> para viajar desde el polo positivo hacia el polo negativo de la fuente. Si una rama se desconecta o se quema, <strong>las demás ramas continúan funcionando sin ninguna interrupción</strong>.
        </p>

        <!-- Simulador Interactivo de Ramas Independientes y Prueba de Foco Quemado -->
        <div style="margin: 1.5rem 0 2.5rem;">
            <div id="parallel-circuit-demo-container"></div>
        </div>

        <!-- ── 4.2 Las 3 Reglas de Oro del Circuito en Paralelo ── -->
        <h3 id="ee-4-2" style="color: #facc15; margin: 2.5rem 0 1rem; font-size: 1.4rem;">4.2 Las 3 Reglas de Oro del Circuito en Paralelo</h3>
        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            Para analizar y resolver cualquier circuito en paralelo con total precisión, rigen estas tres leyes fundamentales:
        </p>

        <!-- Tarjetas de las 3 Reglas de Oro -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
            <!-- Regla 1: Voltaje Idéntico -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="font-size: 1.8rem; margin-bottom: 0.35rem;">🔋</div>
                    <h4 style="color: #38bdf8; margin: 0 0 0.5rem; font-size: 1.05rem;">Regla 1: El Voltaje es el MISMO</h4>
                    <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin: 0 0 0.75rem;">
                        Como los terminales de cada rama están conectados directamente a los mismos dos nodos de la fuente, todas reciben exactamente la misma tensión:
                    </p>
                </div>
                <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 10px; padding: 10px; text-align: center; font-size: 1.1rem; font-weight: 800; color: #38bdf8; font-family: monospace;">
                    V<sub>total</sub> = V<sub>1</sub> = V<sub>2</sub> = V<sub>3</sub>
                </div>
            </div>

            <!-- Regla 2: Suma de Corrientes -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 16px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="font-size: 1.8rem; margin-bottom: 0.35rem;">🌊</div>
                    <h4 style="color: #c084fc; margin: 0 0 0.5rem; font-size: 1.05rem;">Regla 2: La Corriente se REPARTE</h4>
                    <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin: 0 0 0.75rem;">
                        La corriente total (I<sub>total</sub>) que sale de la fuente se divide entre cada una de las ramas según la Ley de Kirchhoff (LCK):
                    </p>
                </div>
                <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 10px; padding: 10px; text-align: center; font-size: 1.1rem; font-weight: 800; color: #c084fc; font-family: monospace;">
                    I<sub>total</sub> = I<sub>1</sub> + I<sub>2</sub> + I<sub>3</sub>
                </div>
            </div>

            <!-- Regla 3: Resistencia Equivalente Disminuye -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 16px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="font-size: 1.8rem; margin-bottom: 0.35rem;">🧱</div>
                    <h4 style="color: #fbbf24; margin: 0 0 0.5rem; font-size: 1.05rem;">Regla 3: La Resistencia DISMINUYE</h4>
                    <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin: 0 0 0.75rem;">
                        Al añadir más caminos en paralelo, la corriente fluye con mayor facilidad. Por ello, la resistencia equivalente total (R<sub>eq</sub>) siempre <strong>es menor que la resistencia individual más pequeña</strong>:
                    </p>
                </div>
                <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 10px; padding: 10px; text-align: center; font-size: 0.95rem; font-weight: 800; color: #fbbf24; font-family: monospace;">
                    1/R<sub>eq</sub> = 1/R<sub>1</sub> + 1/R<sub>2</sub> + 1/R<sub>3</sub>
                </div>
            </div>
        </div>

        <!-- Fórmulas Clave de Resistencia Equivalente -->
        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <h4 style="color: #fbbf24; margin: 0 0 1rem; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                <span>📐 Fórmulas Prácticas para Calcular R<sub>eq</sub> en Paralelo</span>
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
                    <strong style="color: #38bdf8; display: block; margin-bottom: 0.5rem;">1. Caso Rápido: Dos Resistores</strong>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; font-family: monospace; font-size: 1.15rem; color: #f8fafc; font-weight: 800; margin: 0.75rem 0;">
                        <span>R<sub>eq</sub> =</span>
                        <div style="display: inline-flex; flex-direction: column; align-items: center; text-align: center;">
                            <span style="border-bottom: 2px solid #38bdf8; padding: 0 6px 2px; color: #38bdf8;">R<sub>1</sub> × R<sub>2</sub></span>
                            <span style="padding: 2px 6px 0; color: #f8fafc;">R<sub>1</sub> + R<sub>2</sub></span>
                        </div>
                    </div>
                    <span style="color: #94a3b8; font-size: 0.78rem; display: block; text-align: center;"><em>"Producto dividido entre la suma"</em>. Útil y muy rápido para calcular dos ramas.</span>
                </div>

                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
                    <strong style="color: #34d399; display: block; margin-bottom: 0.5rem;">2. Caso Especial: 'N' Resistores Iguales</strong>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; font-family: monospace; font-size: 1.15rem; color: #f8fafc; font-weight: 800; margin: 0.75rem 0;">
                        <span>R<sub>eq</sub> =</span>
                        <div style="display: inline-flex; flex-direction: column; align-items: center; text-align: center;">
                            <span style="border-bottom: 2px solid #34d399; padding: 0 8px 2px; color: #34d399;">R</span>
                            <span style="padding: 2px 8px 0; color: #f8fafc;">N</span>
                        </div>
                    </div>
                    <span style="color: #94a3b8; font-size: 0.78rem; display: block; text-align: center;">Ejemplo: 3 resistencias de 60 Ω en paralelo tienen R<sub>eq</sub> = 60 / 3 = 20 Ω.</span>
                </div>
            </div>
        </div>

        <!-- Calculadora Visual Paso a Paso -->
        <div style="margin: 1.5rem 0 2.5rem;">
            <div id="parallel-calculation-visualizer-container"></div>
        </div>

        <!-- ── 4.3 La Ley de Corrientes de Kirchhoff (LCK) ── -->
        <h3 id="ee-4-3" style="color: #a855f7; margin: 2.5rem 0 1rem; font-size: 1.4rem;">4.3 La Ley de Corrientes de Kirchhoff (LCK)</h3>
        <p style="margin-bottom: 1.25rem; line-height: 1.8; color: #cbd5e1;">
            La <strong>Ley de Corrientes de Kirchhoff (LCK)</strong>, enunciada por Gustav Kirchhoff en 1845, se fundamenta en el <strong>principio de conservación de la carga eléctrica</strong>: la carga no puede crearse ni destruirse en un punto del circuito.
        </p>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(168, 85, 247, 0.35); border-left: 4px solid #a855f7; border-radius: 16px; padding: 1.35rem; margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="font-size: 1.1rem; font-weight: 800; color: #c084fc;">⚡ Enunciado Fundamental de la LCK:</span>
                <span style="background: rgba(168, 85, 247, 0.15); color: #c084fc; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 800;">Conservación de la Carga</span>
            </div>
            <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.7; margin: 0 0 0.75rem;">
                <em>"La suma algebraica de todas las corrientes que entran a un nodo eléctrico es exactamente igual a la suma de las corrientes que salen de él."</em>
            </p>
            <div style="background: rgba(0,0,0,0.4); border-radius: 10px; padding: 10px; text-align: center; font-family: monospace; font-size: 1.2rem; font-weight: 900; color: #34d399;">
                ∑ I<sub>entrantes</sub> = ∑ I<sub>salientes</sub>
            </div>
        </div>

        <!-- ── 4.4 El Divisor de Corriente ── -->
        <h3 id="ee-4-4" style="color: #38bdf8; margin: 2.5rem 0 1rem; font-size: 1.4rem;">4.4 El Divisor de Corriente</h3>
        <p style="margin-bottom: 1.25rem; line-height: 1.8;">
            Cuando una corriente total entra a un nodo con varias ramas en paralelo, <strong>se divide de forma inversamente proporcional a la resistencia de cada rama</strong>:
        </p>
        <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 18px; padding: 1.5rem; margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 1.35rem; font-weight: 900; color: #38bdf8; font-family: monospace; text-align: center; margin: 0.5rem 0 0.75rem;">
                <span>I<sub>1</sub> = I<sub>total</sub> ×</span>
                <div style="display: inline-flex; align-items: center; font-size: 1.8rem; color: #94a3b8; font-weight: 300; line-height: 1;">[</div>
                <div style="display: inline-flex; flex-direction: column; align-items: center; text-align: center; margin: 0 4px;">
                    <span style="border-bottom: 2px solid #38bdf8; padding: 0 8px 3px; color: #38bdf8; font-size: 1.25rem;">R<sub>2</sub></span>
                    <span style="padding: 3px 8px 0; color: #f8fafc; font-size: 1.25rem;">R<sub>1</sub> + R<sub>2</sub></span>
                </div>
                <div style="display: inline-flex; align-items: center; font-size: 1.8rem; color: #94a3b8; font-weight: 300; line-height: 1;">]</div>
            </div>
            <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; margin: 0; text-align: center;">
                💡 <em>¡Ojo con el numerador!:</em> Para hallar la corriente por la rama 1 (I<sub>1</sub>), colocas en el numerador la resistencia de la <strong>otra rama (R<sub>2</sub>)</strong>. Por tanto, la rama con menor resistencia siempre atrae la mayor porción de corriente.
            </p>
        </div>

        <!-- ── 4.5 Diagnóstico de Fallas en Paralelo ── -->
        <h3 id="ee-4-5" style="color: #ef4444; margin: 2.5rem 0 1rem; font-size: 1.4rem;">4.5 Diagnóstico de Fallas en Circuitos Paralelo</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
            <!-- Falla 1: Rama Abierta -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #fde047; margin: 0 0 0.5rem; font-size: 1.05rem;">🟡 Falla por Rama Abierta</h4>
                <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin: 0 0 0.5rem;">
                    Si un foco se quema o un cable se corta en una rama, esa rama queda desconectada (I = 0A). Sin embargo:
                </p>
                <ul style="color: #94a3b8; font-size: 0.8rem; margin: 0; padding-left: 1.2rem; line-height: 1.6;">
                    <li>Las demás ramas continúan recibiendo el voltaje total y funcionando con normalidad.</li>
                    <li>La corriente total suministrada por la fuente disminuye.</li>
                </ul>
            </div>

            <!-- Falla 2: Cortocircuito -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #f87171; margin: 0 0 0.5rem; font-size: 1.05rem;">🔴 Falla por Cortocircuito</h4>
                <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin: 0 0 0.5rem;">
                    Si ocurre un contacto directo entre fase y neutro (o positivo y negativo) en cualquier rama:
                </p>
                <ul style="color: #94a3b8; font-size: 0.8rem; margin: 0; padding-left: 1.2rem; line-height: 1.6;">
                    <li>La resistencia equivalente total de todo el circuito cae instantáneamente a <strong>0 Ω</strong>.</li>
                    <li>La corriente se dispara al infinito y quema el fusible o dispara el breaker termomagnético.</li>
                </ul>
            </div>
        </div>

        <!-- ── 4.6 Aplicaciones Reales en el Hogar y la Industria ── -->
        <h3 id="ee-4-6" style="color: #10b981; margin: 2.5rem 0 1rem; font-size: 1.4rem;">4.6 Aplicaciones Reales en el Hogar y la Industria</h3>
        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.8; margin: 0 0 1rem;">
                Todas las instalaciones eléctricas de hogares, escuelas, hospitales e industrias están conectadas en <strong>paralelo</strong> debido a tres ventajas insustituibles:
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px;">
                    <strong style="color: #38bdf8; display: block; margin-bottom: 0.25rem;">1. Voltaje Constante</strong>
                    <span style="color: #94a3b8; font-size: 0.8rem;">Cada tomacorriente entrega exactamente 120 V (o 220 V), permitiendo que cualquier electrodoméstico trabaje a su voltaje nominal.</span>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px;">
                    <strong style="color: #34d399; display: block; margin-bottom: 0.25rem;">2. Control Independiente</strong>
                    <span style="color: #94a3b8; font-size: 0.8rem;">Puedes encender o apagar la luz de una habitación sin afectar el televisor o la nevera.</span>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px;">
                    <strong style="color: #fbbf24; display: block; margin-bottom: 0.25rem;">3. Escalabilidad Fácil</strong>
                    <span style="color: #94a3b8; font-size: 0.8rem;">Añadir un nuevo foco o enchufe a la red eléctrica no reduce el brillo ni altera el funcionamiento de los existentes.</span>
                </div>
            </div>
        </div>
    `,
    flashcards: [
        { id: 'ee-1-4-f1', type: 'parallel', q: '¿Cómo se comporta el voltaje en un circuito en paralelo?', a: 'Es exactamente el mismo en todas las ramas', sub: 'V_total = V_1 = V_2 = ...', sectionId: 'ee-4-2' },
        { id: 'ee-1-4-f2', type: 'parallel', q: '¿Cómo se comporta la corriente total en un circuito en paralelo?', a: 'Es la suma de las corrientes de cada rama', sub: 'Ley de Corrientes de Kirchhoff (LCK)', sectionId: 'ee-4-2' },
        { id: 'ee-1-4-f3', type: 'calc', q: '¿Cuál es la Req de dos resistencias de 100Ω en paralelo?', a: '50 Ω', sub: '(100 × 100) / (100 + 100) = 50 Ω (o 100 / 2)', sectionId: 'ee-4-2' },
        { id: 'ee-1-4-f4', type: 'theory', q: 'Al agregar más resistencias en paralelo, ¿la Req sube o baja?', a: 'Baja (disminuye)', sub: 'Se abren más caminos simultáneos para los electrones', sectionId: 'ee-4-2' },
        { id: 'ee-1-4-f5', type: 'calc', q: 'Si V=12V y tenemos dos ramas con R1=6Ω y R2=12Ω, ¿cuánto vale I_total?', a: '3 Amperios', sub: 'I1 = 2A, I2 = 1A → 2 + 1 = 3A', sectionId: 'ee-4-2' },
        { id: 'ee-1-4-f6', type: 'theory', q: '¿Qué sucede si un foco se quema en un circuito en paralelo?', a: 'Los demás focos siguen encendidos con el mismo brillo', sub: 'Cada rama es totalmente independiente', sectionId: 'ee-4-5' },
        { id: 'ee-1-4-f7', type: 'formula', q: 'Fórmula rápida para calcular 2 resistencias en paralelo:', a: 'Req = (R1 × R2) / (R1 + R2)', sub: 'Producto dividido entre la suma', sectionId: 'ee-4-2' },
        { id: 'ee-1-4-f8', type: 'theory', q: '¿Qué rama recibe mayor corriente en un divisor de corriente?', a: 'La rama con menor valor de resistencia', sub: 'El camino de menor oposición atrae más electrones', sectionId: 'ee-4-4' },
        { id: 'ee-1-4-f9', type: 'theory', q: '¿Por qué las instalaciones residenciales usan conexión en paralelo?', a: 'Para garantizar 120V/220V constante e independencia en cada aparato', sub: 'Estándar eléctrico universal', sectionId: 'ee-4-6' },
        { id: 'ee-1-4-f10', type: 'lck', q: '¿Qué principio físico fundamental sustenta la Ley de Corrientes de Kirchhoff?', a: 'El principio de conservación de la carga eléctrica', sub: '∑ I_entrantes = ∑ I_salientes', sectionId: 'ee-4-3' }
    ],
    questions: [
        {
            id: 'ee-1-4-q1',
            objective: 'Identificar características del voltaje en paralelo',
            concept: 'voltaje_paralelo',
            difficulty: 'easy',
            q: 'Si una batería de 12V alimenta tres bombillos conectados en paralelo, ¿qué voltaje recibe cada bombillo?',
            options: [
                '12 V exactamente en cada bombillo',
                '4 V en cada bombillo (12V / 3)',
                '36 V como suma total',
                '0 V en los bombillos extremos'
            ],
            correct: 0 // A
        },
        {
            id: 'ee-1-4-q2',
            objective: 'Calcular resistencia equivalente de valores iguales',
            concept: 'resistencia_paralelo',
            difficulty: 'easy',
            q: 'Dos resistencias de 60 Ω se conectan en paralelo. ¿Cuál es su resistencia equivalente total?',
            options: [
                '120 Ω',
                '30 Ω',
                '60 Ω',
                '15 Ω'
            ],
            correct: 1 // B
        },
        {
            id: 'ee-1-4-q3',
            objective: 'Aplicar la Ley de Corrientes de Kirchhoff (LCK)',
            concept: 'lck',
            difficulty: 'medium',
            q: 'A un nodo principal entran 10 A de corriente total y se bifurca en tres ramas con I₁ = 3 A e I₂ = 5 A. ¿Cuál es la corriente I₃ en la tercera rama?',
            options: [
                '8 A',
                '18 A',
                '2 A',
                '15 A'
            ],
            correct: 2 // C
        },
        {
            id: 'ee-1-4-q4',
            objective: 'Calcular resistencia equivalente de valores desiguales',
            concept: 'resistencia_paralelo',
            difficulty: 'medium',
            q: 'Se conectan en paralelo una resistencia R₁ = 20 Ω y otra R₂ = 30 Ω. La resistencia equivalente Req es:',
            options: [
                '50 Ω',
                '25 Ω',
                '600 Ω',
                '12 Ω'
            ],
            correct: 3 // D
        },
        {
            id: 'ee-1-4-q5',
            objective: 'Comprender el efecto de agregar ramas en paralelo',
            concept: 'comportamiento_paralelo',
            difficulty: 'hard',
            q: 'Si en un circuito paralelo encendido se añade una resistencia adicional en una nueva rama independiente:',
            options: [
                'La corriente total suministrada por la fuente aumenta',
                'La resistencia equivalente total del circuito aumenta',
                'El voltaje de las demás ramas cae a la mitad',
                'Los demás componentes se apagan por sobrecarga'
            ],
            correct: 0 // A
        },
        {
            id: 'ee-1-4-q6',
            objective: 'Analizar el principio del divisor de corriente',
            concept: 'divisor_corriente',
            difficulty: 'medium',
            q: 'En un circuito con dos resistencias en paralelo donde R₁ = 10 Ω y R₂ = 100 Ω:',
            options: [
                'Pasa exactamente la misma corriente por ambas ramas',
                'Por R₁ pasa mucha más corriente que por R₂',
                'Por R₂ pasa más corriente porque tiene mayor valor',
                'La corriente no puede circular por ninguna rama'
            ],
            correct: 1 // B
        },
        {
            id: 'ee-1-4-q7',
            objective: 'Identificar ventajas de la instalación en paralelo',
            concept: 'aplicaciones_paralelo',
            difficulty: 'easy',
            q: '¿Cuál es la razón principal por la que los electrodomésticos en una casa se conectan en paralelo y no en serie?',
            options: [
                'Para ahorrar la mitad del cableado de cobre',
                'Para que todos los aparatos se apaguen al desconectar uno solo',
                'Para que cada aparato reciba 120V/220V constante y funcione de manera independiente',
                'Para eliminar por completo el consumo de potencia eléctrica'
            ],
            correct: 2 // C
        },
        {
            id: 'ee-1-4-q8',
            objective: 'Diferenciar las propiedades de la Resistencia Equivalente',
            concept: 'comparacion_req',
            difficulty: 'medium',
            q: 'A diferencia de la conexión serie, en cualquier circuito en paralelo la Resistencia Equivalente siempre es:',
            options: [
                'Mayor que la resistencia más grande del grupo',
                'Igual a la suma aritmética de todas las resistencias',
                'Cero en todos los casos prácticos',
                'Menor que la resistencia individual más pequeña del circuito'
            ],
            correct: 3 // D
        },
        {
            id: 'ee-1-4-q9',
            objective: 'Diagnosticar falla por foco quemado en paralelo',
            concept: 'diagnostico_fallas',
            difficulty: 'medium',
            q: 'Tres bombillos idénticos están encendidos en paralelo a 120 V. Si el bombillo del medio se quema y rompe su filamento:',
            options: [
                'Los otros dos bombillos continúan encendidos con su brillo y voltaje normal',
                'Todos los bombillos se apagan de inmediato',
                'El voltaje de la fuente se reduce a cero',
                'La corriente total suministrada por la fuente se duplica'
            ],
            correct: 0 // A
        },
        {
            id: 'ee-1-4-q10',
            objective: 'Calcular potencia total disipada en paralelo',
            concept: 'potencia_paralelo',
            difficulty: 'hard',
            q: 'Una fuente de 20 V alimenta dos resistencias en paralelo con R₁ = 10 Ω y R₂ = 20 Ω (Req = 6.67 Ω). Si I₁ = 2 A e I₂ = 1 A (IT = 3 A), ¿cuál es la potencia total disipada?',
            options: [
                '20 W',
                '60 W',
                '120 W',
                '200 W'
            ],
            correct: 1 // B (PT = 20V * 3A = 60W)
        }
    ],
    quizConfig: { timePerQuestion: 20, requiredScorePercent: 80 }
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m1-l4-content',
                content: lessonDefinition.content,
                hasSimulator: lessonDefinition.hasSimulator
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ee-m1-l4-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        simulador: [
            createContentBlock({
                id: 'ee-m1-l4-practice',
                content: `
                    <div style="margin-bottom: 2rem;">
                        <div id="practical-lab-l4-container"></div>
                    </div>
                `,
                hasSimulator: true
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m1-l4-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions,
                quizConfig: lessonDefinition.quizConfig
            })
        ]
    }
});
