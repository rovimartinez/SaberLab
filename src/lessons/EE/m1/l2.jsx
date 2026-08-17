import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Circuitos Eléctricos, Ley de Ohm y Medición',
    hasSimulator: true,
    content: `
        <!-- ── 2.1 ¿Qué es un Circuito Eléctrico y sus Partes Indispensables? ── -->
        <h3 id="ee-2-1" style="color: #f59e0b; margin: 1.5rem 0 1rem; font-size: 1.4rem;">2.1 ¿Qué es un Circuito Eléctrico y sus Partes Fundamentales?</h3>
        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            Un <strong>circuito eléctrico</strong> es un camino o lazo cerrado formado por conductores y componentes por donde pueden circular los electrones. Para que un circuito funcione de forma útil y segura, debe contar con <strong>5 elementos indispensables</strong>:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <!-- 1. Fuente -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 1.25rem;">
                <div style="color: #38bdf8; font-size: 1.5rem; margin-bottom: 0.35rem;">🔋</div>
                <h4 style="color: #38bdf8; margin: 0 0 0.4rem; font-size: 1.05rem;">1. Fuente / Generador</h4>
                <p style="color: #cbd5e1; font-size: 0.8rem; line-height: 1.6; margin: 0;">
                    Suministra el <strong>voltaje (diferencia de potencial)</strong> que empuja a los electrones. <em>Ejemplos: Baterías, pilas, paneles solares, fuentes de alimentación.</em>
                </p>
            </div>

            <!-- 2. Conductores -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; padding: 1.25rem;">
                <div style="color: #fbbf24; font-size: 1.5rem; margin-bottom: 0.35rem;">🧶</div>
                <h4 style="color: #fbbf24; margin: 0 0 0.4rem; font-size: 1.05rem;">2. Conductores</h4>
                <p style="color: #cbd5e1; font-size: 0.8rem; line-height: 1.6; margin: 0;">
                    Cables de cobre que ofrecen una resistencia casi nula para transportar el flujo de electrones a lo largo del circuito.
                </p>
            </div>

            <!-- 3. Carga -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 16px; padding: 1.25rem;">
                <div style="color: #c084fc; font-size: 1.5rem; margin-bottom: 0.35rem;">💡</div>
                <h4 style="color: #c084fc; margin: 0 0 0.4rem; font-size: 1.05rem;">3. Carga / Receptor</h4>
                <p style="color: #cbd5e1; font-size: 0.8rem; line-height: 1.6; margin: 0;">
                    Transforma la energía eléctrica en otra forma útil: luz (bombilla/LED), movimiento (motor) o calor (resistencia térmica).
                </p>
            </div>

            <!-- 4. Control -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 1.25rem;">
                <div style="color: #34d399; font-size: 1.5rem; margin-bottom: 0.35rem;">🔘</div>
                <h4 style="color: #34d399; margin: 0 0 0.4rem; font-size: 1.05rem;">4. Elemento de Control</h4>
                <p style="color: #cbd5e1; font-size: 0.8rem; line-height: 1.6; margin: 0;">
                    Permite abrir, cerrar o desviar el flujo de electrones a voluntad. <em>Ejemplos: Interruptores, pulsadores, conmutadores, relés.</em>
                </p>
            </div>

            <!-- 5. Protección -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 1.25rem;">
                <div style="color: #f87171; font-size: 1.5rem; margin-bottom: 0.35rem;">🛡️</div>
                <h4 style="color: #f87171; margin: 0 0 0.4rem; font-size: 1.05rem;">5. Elemento de Protección</h4>
                <p style="color: #cbd5e1; font-size: 0.8rem; line-height: 1.6; margin: 0;">
                    Interrumpe el circuito automáticamente ante sobrecorrientes peligrosas. <em>Ejemplos: Fusibles, disyuntores térmicos.</em>
                </p>
            </div>
        </div>

        <!-- ── 2.2 Los 4 Estados Fundamentales del Circuito ── -->
        <h3 id="ee-2-2" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">2.2 Los 4 Estados Fundamentales de un Circuito</h3>
        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            Dependiendo de la posición de sus elementos de maniobra y del estado de sus conductores, un circuito puede encontrarse en uno de estos 4 estados:
        </p>

        <!-- Simulador interactivo de los Estados del Circuito -->
        <div style="margin: 1.5rem 0 2rem;">
            <div id="circuit-states-simulator-container"></div>
        </div>

        <!-- ── 2.3 La Ley de Ohm Matemática ── -->
        <h3 id="ee-2-3" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">2.3 La Ley de Ohm y el Triángulo Matemático</h3>
        
        <!-- Tarjeta Histórica: Georg Simon Ohm -->
        <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.75) 100%); border: 1px solid rgba(245, 158, 11, 0.35); border-left: 5px solid #f59e0b; border-radius: 18px; padding: 1.25rem 1.5rem; margin-bottom: 1.75rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.4rem;">📜</span>
                    <h4 style="color: #fbbf24; margin: 0; font-size: 1.1rem; font-weight: 800;">
                        Historia y Origen: Georg Simon Ohm (1789 – 1854)
                    </h4>
                </div>
                <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 800;">
                    Alemania, 1827
                </span>
            </div>
            <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.7; margin: 0 0 0.75rem;">
                A principios del siglo XIX, la electricidad era vista como un fenómeno caótico e impredecible. <strong>Georg Simon Ohm</strong>, un humilde profesor de física en Colonia sin acceso a laboratorios costosos, se propuso encontrar las leyes exactas que gobernaban los circuitos.
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; font-size: 0.82rem;">
                <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 0.75rem;">
                    <strong style="color: #38bdf8;">🔬 La genialidad experimental:</strong> Como las pilas químicas de la época fluctuaban, Ohm inventó un <em>termopar</em> (cobre-bismuto) calentado con agua hirviendo y hielo para generar un voltaje perfectamente constante, fabricando sus propios alambres de distintos metales y grosores.
                </div>
                <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 0.75rem;">
                    <strong style="color: #34d399;">💡 El gran legado:</strong> En 1827 publicó su famosa obra <em>"El circuito galvánico investigado matemáticamente"</em>, demostrando que la corriente es proporcional a la tensión e inversamente proporcional a la resistencia: la piedra angular de toda la tecnología moderna.
                </div>
            </div>
        </div>

        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            La <strong>Ley de Ohm</strong> establece la relación matemática fundamental e inmutable entre el Voltaje, la Corriente y la Resistencia:
        </p>

        <!-- Triángulo de Ohm Gráfico y Didáctico -->
        <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <div style="display: grid; grid-template-columns: 260px 1fr; gap: 1.5rem; align-items: center;">
                <!-- SVG Triángulo de Ohm -->
                <div style="background: rgba(0,0,0,0.3); border-radius: 16px; padding: 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 240 210" width="100%" height="190" style="max-width: 230px;">
                        <!-- Triángulo Base -->
                        <polygon points="120,15 20,195 220,195" fill="#0f172a" stroke="#f59e0b" stroke-width="3" stroke-linejoin="round" />
                        
                        <!-- Región Superior (Voltaje V) -->
                        <polygon points="120,15 70,105 170,105" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="2" />
                        
                        <!-- Línea Divisoria Horizontal (División) -->
                        <line x1="70" y1="105" x2="170" y2="105" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round" />
                        
                        <!-- Línea Divisoria Vertical Inferior (Multiplicación) -->
                        <line x1="120" y1="105" x2="120" y2="195" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round" />
                        
                        <!-- Región Inferior Izquierda (Corriente I) -->
                        <polygon points="70,105 20,195 120,195 120,105" fill="rgba(52, 211, 153, 0.15)" stroke="#34d399" stroke-width="1.5" />
                        
                        <!-- Región Inferior Derecha (Resistencia R) -->
                        <polygon points="170,105 120,105 120,195 220,195" fill="rgba(192, 132, 252, 0.15)" stroke="#c084fc" stroke-width="1.5" />

                        <!-- Letra V -->
                        <text x="120" y="78" text-anchor="middle" fill="#38bdf8" font-size="34" font-weight="900" font-family="system-ui, sans-serif">V</text>
                        <text x="120" y="96" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="bold">VOLTIOS</text>

                        <!-- Letra I -->
                        <text x="82" y="156" text-anchor="middle" fill="#34d399" font-size="34" font-weight="900" font-family="system-ui, sans-serif">I</text>
                        <text x="82" y="174" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="bold">AMPERIOS</text>

                        <!-- Letra R -->
                        <text x="158" y="156" text-anchor="middle" fill="#c084fc" font-size="34" font-weight="900" font-family="system-ui, sans-serif">R</text>
                        <text x="158" y="174" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="bold">OHMIOS</text>
                    </svg>
                    <div style="color: #fbbf24; font-size: 0.78rem; font-weight: 800; text-transform: uppercase; margin-top: 6px;">
                        🔺 El Triángulo de Ohm
                    </div>
                </div>

                <!-- 3 Fórmulas Derivadas (Regla Nemotécnica del Dedo) -->
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); padding: 0.9rem 1.25rem; border-radius: 14px; display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="color: #38bdf8; font-size: 0.8rem; font-weight: 800; text-transform: uppercase;">1. Para Calcular Voltaje (Tapas la V)</div>
                            <div style="color: #cbd5e1; font-size: 0.8rem; margin-top: 2px;">Quedan juntas la Corriente y la Resistencia abajo:</div>
                        </div>
                        <div style="color: #38bdf8; font-size: 1.45rem; font-weight: 800; font-family: monospace; background: rgba(56, 189, 248, 0.15); padding: 4px 12px; border-radius: 8px;">
                            V = I · R
                        </div>
                    </div>

                    <div style="background: rgba(52, 211, 153, 0.08); border: 1px solid rgba(52, 211, 153, 0.25); padding: 0.9rem 1.25rem; border-radius: 14px; display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="color: #34d399; font-size: 0.8rem; font-weight: 800; text-transform: uppercase;">2. Para Calcular Corriente (Tapas la I)</div>
                            <div style="color: #cbd5e1; font-size: 0.8rem; margin-top: 2px;">Queda el Voltaje arriba dividido entre la Resistencia:</div>
                        </div>
                        <div style="color: #34d399; font-size: 1.45rem; font-weight: 800; font-family: monospace; background: rgba(52, 211, 153, 0.15); padding: 4px 12px; border-radius: 8px;">
                            I = V / R
                        </div>
                    </div>

                    <div style="background: rgba(192, 132, 252, 0.08); border: 1px solid rgba(192, 132, 252, 0.25); padding: 0.9rem 1.25rem; border-radius: 14px; display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="color: #c084fc; font-size: 0.8rem; font-weight: 800; text-transform: uppercase;">3. Para Calcular Resistencia (Tapas la R)</div>
                            <div style="color: #cbd5e1; font-size: 0.8rem; margin-top: 2px;">Queda el Voltaje arriba dividido entre la Corriente:</div>
                        </div>
                        <div style="color: #c084fc; font-size: 1.45rem; font-weight: 800; font-family: monospace; background: rgba(192, 132, 252, 0.15); padding: 4px 12px; border-radius: 8px;">
                            R = V / I
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Ejemplo Resuelto Paso a Paso con Incógnita -->
        <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 20px; padding: 1.5rem; margin: 1.75rem 0 2rem;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 0.75rem;">
                <span style="background: #38bdf8; color: #0f172a; padding: 4px 10px; border-radius: 20px; font-weight: 900; font-size: 0.8rem;">
                    📝 EJEMPLO RESUELTO
                </span>
                <h4 style="color: white; margin: 0; font-size: 1.15rem; font-weight: 800;">
                    Cómo Resolver un Problema de Ley de Ohm Paso a Paso
                </h4>
            </div>

            <!-- Enunciado del Problema -->
            <div style="background: rgba(0,0,0,0.3); border-left: 4px solid #f59e0b; border-radius: 10px; padding: 0.9rem 1.1rem; margin-bottom: 1.25rem;">
                <strong style="color: #fbbf24; font-size: 0.88rem;">📌 Enunciado:</strong>
                <p style="color: #e2e8f0; font-size: 0.9rem; margin: 0.3rem 0 0; line-height: 1.6;">
                    Se conecta una bombilla automotriz de <strong>4 Ω</strong> de resistencia a una batería de automóvil de <strong>12 V</strong>. <em>¿Cuál es la intensidad de corriente eléctrica (I) que circulará a través del circuito?</em>
                </p>
            </div>

            <!-- Los 4 Pasos Metódicos de Solución -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px;">
                <!-- Paso 1 -->
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="color: #38bdf8; font-weight: 800; font-size: 0.82rem; text-transform: uppercase; margin-bottom: 6px;">
                            1. Datos e Incógnita
                        </div>
                        <ul style="color: #cbd5e1; font-size: 0.82rem; margin: 0; padding-left: 1.1rem; line-height: 1.5;">
                            <li><strong>V:</strong> <code>12 V</code></li>
                            <li><strong>R:</strong> <code>4 Ω</code></li>
                            <li><strong>I:</strong> <span style="color: #fbbf24; font-weight: 900;">¿ ? A</span></li>
                        </ul>
                    </div>
                    <div style="margin-top: 10px; padding: 6px; border-radius: 8px; background: rgba(56,189,248,0.1); color: #38bdf8; font-size: 0.8rem; font-weight: 700; text-align: center;">
                        Incógnita: Corriente (I)
                    </div>
                </div>

                <!-- Paso 2 -->
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="color: #34d399; font-weight: 800; font-size: 0.82rem; text-transform: uppercase; margin-bottom: 6px;">
                            2. Despejar Fórmula
                        </div>
                        <p style="color: #cbd5e1; font-size: 0.82rem; margin: 0; line-height: 1.4;">
                            Tapas la letra <strong>I</strong> en el triángulo:
                        </p>
                    </div>
                    <div style="margin-top: 10px; color: #34d399; font-size: 1.15rem; font-weight: 900; font-family: monospace; text-align: center; background: rgba(52,211,153,0.1); padding: 6px; border-radius: 8px;">
                        I = V / R
                    </div>
                </div>

                <!-- Paso 3 -->
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="color: #c084fc; font-weight: 800; font-size: 0.82rem; text-transform: uppercase; margin-bottom: 6px;">
                            3. Sustituir Valores
                        </div>
                        <p style="color: #cbd5e1; font-size: 0.82rem; margin: 0; line-height: 1.4;">
                            Reemplazas las magnitudes:
                        </p>
                    </div>
                    <div style="margin-top: 10px; color: #c084fc; font-size: 1.15rem; font-weight: 900; font-family: monospace; text-align: center; background: rgba(192,132,252,0.1); padding: 6px; border-radius: 8px;">
                        I = 12 V / 4 Ω
                    </div>
                </div>

                <!-- Paso 4 -->
                <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.3); border-radius: 14px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="color: #10b981; font-weight: 800; font-size: 0.82rem; text-transform: uppercase; margin-bottom: 6px;">
                            4. Resultado Final
                        </div>
                        <p style="color: #cbd5e1; font-size: 0.82rem; margin: 0; line-height: 1.4;">
                            Efectúas la división:
                        </p>
                    </div>
                    <div style="margin-top: 10px; color: #10b981; font-size: 1.15rem; font-weight: 900; font-family: monospace; text-align: center; background: rgba(16,185,129,0.15); padding: 6px; border-radius: 8px;">
                        I = 3 A
                    </div>
                </div>
            </div>
        </div>

        <!-- Simulador interactivo de Ley de Ohm -->
        <div style="margin: 2rem 0;">
            <div id="ohm-law-simulator-container"></div>
        </div>

        <!-- ── 2.4 Potencia Eléctrica y Ley de Watt ── -->
        <h3 id="ee-2-4" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">2.4 Potencia Eléctrica y Ley de Watt</h3>
        
        <!-- Tarjeta Histórica: James Watt -->
        <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.75) 100%); border: 1px solid rgba(59, 130, 246, 0.35); border-left: 5px solid #38bdf8; border-radius: 18px; padding: 1.25rem 1.5rem; margin-bottom: 1.75rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.4rem;">⚙️</span>
                    <h4 style="color: #38bdf8; margin: 0; font-size: 1.1rem; font-weight: 800;">
                        Historia y Origen: James Watt (1736 – 1819)
                    </h4>
                </div>
                <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 800;">
                    Escocia / Revolución Industrial
                </span>
            </div>
            <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.7; margin: 0 0 0.75rem;">
                <strong>James Watt</strong>, célebre matemático e ingeniero escocés, perfeccionó la máquina de vapor revolucionando la industria. Pero se enfrentó a un dilema comercial: <em>¿Cómo convencer a los dueños de minas de que su máquina era mejor que los caballos de tiro que usaban para bombear agua?</em>
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; font-size: 0.82rem;">
                <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 0.75rem;">
                    <strong style="color: #fbbf24;">🐎 La invención del Horsepower (HP):</strong> Watt calculó la fuerza que ejercía un caballo de tiro en un molino cervecero y definió el <em>Caballo de Fuerza</em> (1 HP ≈ 746 Watts) para comparar mecánicamente el trabajo de sus motores.
                </div>
                <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 0.75rem;">
                    <strong style="color: #34d399;">⚡ El salto a la electricidad:</strong> En 1889, la comunidad científica bautizó al <strong>Vatio o Watt [W]</strong> en su honor como la unidad internacional de potencia: el ritmo al que la energía se convierte en luz, movimiento o calor (1 W = 1 Voltio × 1 Amperio).
                </div>
            </div>
        </div>

        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            La <strong>potencia eléctrica (P)</strong> es la velocidad con la que se consume o transforma energía eléctrica en un circuito. Se mide en <strong>Vatios o Watts [W]</strong>:
        </p>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 16px; padding: 1.25rem; text-align: center;">
                <div style="color: #60a5fa; font-size: 1.4rem; font-weight: 800; font-family: monospace;">P = V · I</div>
                <p style="color: #94a3b8; font-size: 0.8rem; margin: 0.4rem 0 0;">Fórmula fundamental de Watt (Voltios × Amperios).</p>
            </div>
            <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 16px; padding: 1.25rem; text-align: center;">
                <div style="color: #c084fc; font-size: 1.4rem; font-weight: 800; font-family: monospace;">P = I² · R</div>
                <p style="color: #94a3b8; font-size: 0.8rem; margin: 0.4rem 0 0;">Efecto Joule: potencia disipada en forma de calor.</p>
            </div>
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 16px; padding: 1.25rem; text-align: center;">
                <div style="color: #34d399; font-size: 1.4rem; font-weight: 800; font-family: monospace;">P = V² / R</div>
                <p style="color: #94a3b8; font-size: 0.8rem; margin: 0.4rem 0 0;">Potencia en función del voltaje y la resistencia.</p>
            </div>
        </div>

        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1rem; margin-bottom: 1.5rem;">
            💡 <strong>Equivalencia Mecánica:</strong> En motores y maquinaria pesada, la potencia suele expresarse en <strong>Caballos de Fuerza (Horsepower - HP)</strong>: <code>1 HP = 745.7 Watts (W) ≈ 746 W</code>.
        </div>

        <!-- Simulador interactivo de Horsepower y Potencia Eléctrica -->
        <div style="margin: 2rem 0;">
            <div id="horsepower-simulator-container"></div>
        </div>

        <!-- ── 2.5 La Rueda de las 12 Fórmulas de la Electrónica (Círculo Ohm-Watt) ── -->
        <h3 id="ee-2-5" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">2.5 La Rueda de las 12 Fórmulas de la Electrónica</h3>
        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            Combinando la Ley de Ohm con la Ley de Watt, se obtienen <strong>12 fórmulas maestras</strong> para calcular cualquier variable a partir de dos conocidas:
        </p>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; text-align: center;">
                <!-- Voltaje V -->
                <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 14px; padding: 1rem;">
                    <div style="color: #38bdf8; font-weight: 800; font-size: 1.1rem; margin-bottom: 0.5rem;">⚡ Voltaje (V)</div>
                    <div style="color: #cbd5e1; font-family: monospace; font-size: 0.95rem; line-height: 1.8;">
                        • V = I · R<br />
                        • V = P / I<br />
                        • V = √(P · R)
                    </div>
                </div>

                <!-- Corriente I -->
                <div style="background: rgba(52, 211, 153, 0.08); border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 14px; padding: 1rem;">
                    <div style="color: #34d399; font-weight: 800; font-size: 1.1rem; margin-bottom: 0.5rem;">🌊 Corriente (I)</div>
                    <div style="color: #cbd5e1; font-family: monospace; font-size: 0.95rem; line-height: 1.8;">
                        • I = V / R<br />
                        • I = P / V<br />
                        • I = √(P / R)
                    </div>
                </div>

                <!-- Resistencia R -->
                <div style="background: rgba(192, 132, 252, 0.08); border: 1px solid rgba(192, 132, 252, 0.3); border-radius: 14px; padding: 1rem;">
                    <div style="color: #c084fc; font-weight: 800; font-size: 1.1rem; margin-bottom: 0.5rem;">🛑 Resistencia (R)</div>
                    <div style="color: #cbd5e1; font-family: monospace; font-size: 0.95rem; line-height: 1.8;">
                        • R = V / I<br />
                        • R = V² / P<br />
                        • R = P / I²
                    </div>
                </div>

                <!-- Potencia P -->
                <div style="background: rgba(251, 191, 36, 0.08); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 14px; padding: 1rem;">
                    <div style="color: #fbbf24; font-weight: 800; font-size: 1.1rem; margin-bottom: 0.5rem;">🔥 Potencia (P)</div>
                    <div style="color: #cbd5e1; font-family: monospace; font-size: 0.95rem; line-height: 1.8;">
                        • P = V · I<br />
                        • P = I² · R<br />
                        • P = V² / R
                    </div>
                </div>
            </div>
        </div>

        <!-- ── 2.6 Código de Colores de Resistencias (4 Bandas) ── -->
        <h3 id="ee-2-6" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">2.6 Código de Colores de Resistencias (4 Bandas)</h3>
        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            Las resistencias de carbón son componentes diminutos (de apenas unos milímetros de longitud). Imprimir números en ellas sería ilegible y se borraría con el calor o quedaría oculto si el resistor se suelda boca abajo. Por ello, la norma internacional <strong>IEC 60062</strong> definió el <strong>Código de Colores de 4 Bandas</strong>, permitiendo leer su valor desde cualquier ángulo de 360°.
        </p>

        <!-- Cómo se lee un resistor -->
        <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 18px; padding: 1.25rem 1.5rem; margin-bottom: 1.75rem;">
            <h4 style="color: #fbbf24; margin: 0 0 0.75rem; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                🔍 ¿Cómo Saber por Dónde Empezar a Leer la Resistencia?
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; font-size: 0.85rem; line-height: 1.6; color: #cbd5e1;">
                <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 0.9rem;">
                    <strong style="color: #38bdf8;">1. Busca la banda aislada (Tolerancia):</strong> La banda de <strong>Oro (±5%)</strong> o <strong>Plata (±10%)</strong> casi siempre está más separada de las demás. <em>¡Coloca siempre esta banda a tu mano DERECHA!</em>
                </div>
                <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 0.9rem;">
                    <strong style="color: #34d399;">2. Lee de Izquierda a Derecha:</strong> Las dos primeras bandas representan los dígitos numéricos directos; la tercera banda es la cantidad de ceros (multiplicador $\times 10^n$).
                </div>
            </div>
        </div>

        <!-- Tabla Maestra de Colores -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 1.25rem; margin-bottom: 2rem; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; min-width: 460px;">
                <thead>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.12); text-align: left; color: #fbbf24;">
                        <th style="padding: 0.6rem;">Color</th>
                        <th style="padding: 0.6rem;">1ª y 2ª Banda (Dígito)</th>
                        <th style="padding: 0.6rem;">3ª Banda (Multiplicador)</th>
                        <th style="padding: 0.6rem;">4ª Banda (Tolerancia)</th>
                    </tr>
                </thead>
                <tbody style="color: #cbd5e1;">
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.5rem; font-weight: bold; color: #cbd5e1;"><span style="display: inline-block; width: 12px; height: 12px; background: #111827; border: 1px solid #4b5563; border-radius: 3px; margin-right: 6px;"></span>Negro</td>
                        <td style="padding: 0.5rem; font-weight: bold; color: #cbd5e1;">0</td>
                        <td style="padding: 0.5rem;">× 1 (sin ceros)</td>
                        <td style="padding: 0.5rem;">—</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.5rem; font-weight: bold; color: #b45309;"><span style="display: inline-block; width: 12px; height: 12px; background: #6b3318; border-radius: 3px; margin-right: 6px;"></span>Marrón / Café</td>
                        <td style="padding: 0.5rem; font-weight: bold; color: #fbbf24;">1</td>
                        <td style="padding: 0.5rem;">× 10 (1 cero)</td>
                        <td style="padding: 0.5rem; color: #34d399;">±1%</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.5rem; font-weight: bold; color: #ef4444;"><span style="display: inline-block; width: 12px; height: 12px; background: #dc2626; border-radius: 3px; margin-right: 6px;"></span>Rojo</td>
                        <td style="padding: 0.5rem; font-weight: bold; color: #fbbf24;">2</td>
                        <td style="padding: 0.5rem;">× 100 (2 ceros)</td>
                        <td style="padding: 0.5rem; color: #34d399;">±2%</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.5rem; font-weight: bold; color: #f97316;"><span style="display: inline-block; width: 12px; height: 12px; background: #ea580c; border-radius: 3px; margin-right: 6px;"></span>Naranja</td>
                        <td style="padding: 0.5rem; font-weight: bold; color: #fbbf24;">3</td>
                        <td style="padding: 0.5rem;">× 1.000 (1k)</td>
                        <td style="padding: 0.5rem;">—</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.5rem; font-weight: bold; color: #facc15;"><span style="display: inline-block; width: 12px; height: 12px; background: #facc15; border-radius: 3px; margin-right: 6px;"></span>Amarillo</td>
                        <td style="padding: 0.5rem; font-weight: bold; color: #fbbf24;">4</td>
                        <td style="padding: 0.5rem;">× 10.000 (10k)</td>
                        <td style="padding: 0.5rem;">—</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.5rem; font-weight: bold; color: #22c55e;"><span style="display: inline-block; width: 12px; height: 12px; background: #16a34a; border-radius: 3px; margin-right: 6px;"></span>Verde</td>
                        <td style="padding: 0.5rem; font-weight: bold; color: #fbbf24;">5</td>
                        <td style="padding: 0.5rem;">× 100.000 (100k)</td>
                        <td style="padding: 0.5rem; color: #34d399;">±0.5%</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.5rem; font-weight: bold; color: #38bdf8;"><span style="display: inline-block; width: 12px; height: 12px; background: #2563eb; border-radius: 3px; margin-right: 6px;"></span>Azul</td>
                        <td style="padding: 0.5rem; font-weight: bold; color: #fbbf24;">6</td>
                        <td style="padding: 0.5rem;">× 1.000.000 (1M)</td>
                        <td style="padding: 0.5rem; color: #34d399;">±0.25%</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.5rem; font-weight: bold; color: #c084fc;"><span style="display: inline-block; width: 12px; height: 12px; background: #9333ea; border-radius: 3px; margin-right: 6px;"></span>Violeta</td>
                        <td style="padding: 0.5rem; font-weight: bold; color: #fbbf24;">7</td>
                        <td style="padding: 0.5rem;">× 10.000.000</td>
                        <td style="padding: 0.5rem; color: #34d399;">±0.1%</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.5rem; font-weight: bold; color: #94a3b8;"><span style="display: inline-block; width: 12px; height: 12px; background: #64748b; border-radius: 3px; margin-right: 6px;"></span>Gris</td>
                        <td style="padding: 0.5rem; font-weight: bold; color: #fbbf24;">8</td>
                        <td style="padding: 0.5rem;">—</td>
                        <td style="padding: 0.5rem; color: #34d399;">±0.05%</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.5rem; font-weight: bold; color: #f8fafc;"><span style="display: inline-block; width: 12px; height: 12px; background: #f8fafc; border: 1px solid #94a3b8; border-radius: 3px; margin-right: 6px;"></span>Blanco</td>
                        <td style="padding: 0.5rem; font-weight: bold; color: #fbbf24;">9</td>
                        <td style="padding: 0.5rem;">—</td>
                        <td style="padding: 0.5rem;">—</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); background: rgba(207, 151, 21, 0.1);">
                        <td style="padding: 0.5rem; font-weight: bold; color: #cf9715;"><span style="display: inline-block; width: 12px; height: 12px; background: #cf9715; border: 1px solid #a16207; border-radius: 3px; margin-right: 6px;"></span>Dorado / Oro</td>
                        <td style="padding: 0.5rem;">—</td>
                        <td style="padding: 0.5rem;">× 0.1</td>
                        <td style="padding: 0.5rem; font-weight: bold; color: #cf9715;">±5% (Típica)</td>
                    </tr>
                    <tr>
                        <td style="padding: 0.5rem; font-weight: bold; color: #cbd5e1;"><span style="display: inline-block; width: 12px; height: 12px; background: #94a3b8; border-radius: 3px; margin-right: 6px;"></span>Plateado / Plata</td>
                        <td style="padding: 0.5rem;">—</td>
                        <td style="padding: 0.5rem;">× 0.01</td>
                        <td style="padding: 0.5rem; font-weight: bold; color: #cbd5e1;">±10%</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Decodificador Interactivo del Código de Colores -->
        <div style="margin: 2rem 0;">
            <div id="resistor-calculator-container"></div>
        </div>

        <!-- ── 2.7 Prefijos Métricos del Sistema Internacional (SI) ── -->
        <h3 id="ee-2-7" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">2.7 Prefijos Métricos del Sistema Internacional en Electrónica</h3>
        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            Como acabamos de ver en las resistencias (donde pasamos fácilmente de Ohmios a $k\Omega$ o $M\Omega$), en electrónica trabajamos con valores extremadamente grandes y diminutos. Dominar la notación de ingeniería es obligatorio para interpretar cualquier circuito o plano técnico:
        </p>

        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 1.25rem; margin-bottom: 2rem; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 500px;">
                <thead>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left; color: #fbbf24;">
                        <th style="padding: 0.75rem;">Prefijo</th>
                        <th style="padding: 0.75rem;">Símbolo</th>
                        <th style="padding: 0.75rem;">Factor Científico</th>
                        <th style="padding: 0.75rem;">Valor Numérico</th>
                        <th style="padding: 0.75rem;">Ejemplo Real</th>
                    </tr>
                </thead>
                <tbody style="color: #cbd5e1;">
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.75rem; color: #38bdf8; font-weight: bold;">Mega</td>
                        <td style="padding: 0.75rem; font-weight: bold;">M</td>
                        <td style="padding: 0.75rem;">10⁶</td>
                        <td style="padding: 0.75rem;">1.000.000</td>
                        <td style="padding: 0.75rem;">1 MΩ = 1.000.000 Ω</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.75rem; color: #38bdf8; font-weight: bold;">kilo</td>
                        <td style="padding: 0.75rem; font-weight: bold;">k</td>
                        <td style="padding: 0.75rem;">10³</td>
                        <td style="padding: 0.75rem;">1.000</td>
                        <td style="padding: 0.75rem;">10 kΩ = 10.000 Ω</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.02);">
                        <td style="padding: 0.75rem; color: #fbbf24; font-weight: bold;">Unidad Base</td>
                        <td style="padding: 0.75rem; font-weight: bold;">—</td>
                        <td style="padding: 0.75rem;">10⁰</td>
                        <td style="padding: 0.75rem;">1</td>
                        <td style="padding: 0.75rem;">Voltio (V), Amperio (A), Ohmio (Ω)</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.75rem; color: #34d399; font-weight: bold;">mili</td>
                        <td style="padding: 0.75rem; font-weight: bold;">m</td>
                        <td style="padding: 0.75rem;">10⁻³</td>
                        <td style="padding: 0.75rem;">0.001 (milésima)</td>
                        <td style="padding: 0.75rem;">20 mA = 0.02 A (LED)</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.75rem; color: #34d399; font-weight: bold;">micro</td>
                        <td style="padding: 0.75rem; font-weight: bold;">µ</td>
                        <td style="padding: 0.75rem;">10⁻⁶</td>
                        <td style="padding: 0.75rem;">0.000001 (millonésima)</td>
                        <td style="padding: 0.75rem;">100 µF (Condensador)</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.75rem; color: #c084fc; font-weight: bold;">nano</td>
                        <td style="padding: 0.75rem; font-weight: bold;">n</td>
                        <td style="padding: 0.75rem;">10⁻⁹</td>
                        <td style="padding: 0.75rem;">0.000000001</td>
                        <td style="padding: 0.75rem;">10 nF (Filtro cerámico)</td>
                    </tr>
                    <tr>
                        <td style="padding: 0.75rem; color: #c084fc; font-weight: bold;">pico</td>
                        <td style="padding: 0.75rem; font-weight: bold;">p</td>
                        <td style="padding: 0.75rem;">10⁻¹²</td>
                        <td style="padding: 0.75rem;">0.000000000001</td>
                        <td style="padding: 0.75rem;">22 pF (Cristal oscilador)</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
    flashcards: [
        { id: 'ee-1-2-f1', type: 'theory', q: '¿Cuáles son los 5 elementos fundamentales de un circuito eléctrico?', a: '1. Fuente, 2. Conductores, 3. Carga, 4. Control (interruptor) y 5. Protección (fusible)', sub: 'Estructura indispensable de cualquier circuito', sectionId: 'ee-2-1' },
        { id: 'ee-1-2-f2', type: 'theory', q: '¿Qué ocurre en un Circuito Abierto (OFF)?', a: 'El camino conductor está interrumpido y la corriente es exactamente cero (I = 0 A)', sub: 'Al cortarse el lazo conductor, la carga deja de recibir energía', sectionId: 'ee-2-2' },
        { id: 'ee-1-2-f3', type: 'theory', q: '¿Qué es un Cortocircuito (Short Circuit) y por qué es tan peligroso?', a: 'Unión directa (+) con (−) sin resistencia (R ≈ 0). La corriente tiende a infinito disparando calor e incendios', sub: 'Requiere fusibles o disyuntores de protección', sectionId: 'ee-2-2' },
        { id: 'ee-1-2-f4', type: 'theory', q: '¿Qué función cumple un circuito conmutado (SPDT)?', a: 'Desvía el flujo de corriente hacia dos o más caminos alternativos (ej. interruptor de escalera)', sub: 'Single Pole Double Throw', sectionId: 'ee-2-2' },
        { id: 'ee-1-2-f5', type: 'math', q: '¿Cuál es la fórmula de la Ley de Ohm para calcular Corriente?', a: 'I = V / R (Amperios = Voltios / Ohmios)', sub: 'La corriente es directamente proporcional al voltaje', sectionId: 'ee-2-3' },
        { id: 'ee-1-2-f6', type: 'math', q: 'Si conectamos una resistencia de 240 Ω a un voltaje de 120 V, ¿cuánta corriente fluye?', a: 'I = 120V / 240Ω = 0.5 Amperios (500 mA)', sub: 'Cálculo directo con Ley de Ohm', sectionId: 'ee-2-3' },
        { id: 'ee-1-2-f7', type: 'math', q: '¿Qué tres fórmulas definen la Potencia Eléctrica (Ley de Watt)?', a: '1) P = V · I    2) P = I² · R    3) P = V² / R', sub: 'Unidad: Vatios o Watts [W]', sectionId: 'ee-2-4' },
        { id: 'ee-1-2-f8', type: 'math', q: '¿A cuántos Watts equivale 1 Caballo de Fuerza (1 HP)?', a: '1 HP = 745.7 Watts (aproximadamente 746 W)', sub: 'Equivalencia de potencia mecánica y eléctrica', sectionId: 'ee-2-4' },
        { id: 'ee-1-2-f9', type: 'math', q: '¿Cómo se calcula el Voltaje a partir de la Potencia y la Resistencia?', a: 'V = √(P · R)', sub: 'Fórmula de la rueda Ohm-Watt', sectionId: 'ee-2-5' },
        { id: 'ee-1-2-f10', type: 'si', q: '¿A cuántos Ohmios equivale una resistencia de 4.7 kΩ?', a: '4.700 Ohmios (4.7 × 10³ Ω)', sub: 'Prefijo kilo (k = 1.000)', sectionId: 'ee-2-7' },
        { id: 'ee-1-2-f11', type: 'si', q: '¿A cuántos Amperios equivalen 25 miliamperios (25 mA)?', a: '0.025 Amperios (25 × 10⁻³ A)', sub: 'Prefijo mili (m = 0.001)', sectionId: 'ee-2-7' },
        { id: 'ee-1-2-f15', type: 'color_code', q: 'En un resistor de 4 bandas, ¿qué representa cada banda de izquierda a derecha?', a: '1ª y 2ª banda: dígitos significativos; 3ª banda: multiplicador decimal (×10ⁿ); 4ª banda: tolerancia (±%)', sub: 'Norma internacional IEC 60062', sectionId: 'ee-2-6' },
        { id: 'ee-1-2-f16', type: 'color_code', q: '¿Cuál es el valor de un resistor con bandas: Rojo - Rojo - Marrón - Oro?', a: '220 Ω con ±5% de tolerancia (2 - 2 × 10¹ Ω = 220 Ω)', sub: 'Resistencia típica de protección para LEDs', sectionId: 'ee-2-6' },
        { id: 'ee-1-2-f17', type: 'color_code', q: '¿Cuál es el valor de un resistor con bandas: Marrón - Negro - Naranja - Oro?', a: '10.000 Ω = 10 kΩ con ±5% de tolerancia (1 - 0 × 10³ Ω = 10 kΩ)', sub: 'Resistencia clásica de Pull-up / Pull-down', sectionId: 'ee-2-6' }
    ],
    questions: [
        {
            id: 'ee-1-2-q1',
            objective: 'Reconocer los 5 componentes esenciales de un circuito',
            concept: 'partes_circuito',
            difficulty: 'easy',
            q: '¿Cuál de los siguientes elementos tiene la función de transformar la energía eléctrica en luz, calor o movimiento?',
            options: ['La Fuente de poder', 'El Conductor', 'La Carga o Receptor', 'El Interruptor'],
            correct: 2
        },
        {
            id: 'ee-1-2-q2',
            objective: 'Identificar el comportamiento en circuito abierto',
            concept: 'circuito_abierto',
            difficulty: 'easy',
            q: 'Cuando un interruptor está en posición OFF (circuito abierto), ¿qué sucede con la corriente eléctrica?',
            options: [
                'La corriente se multiplica para saltar el espacio abierto',
                'La corriente es exactamente cero (I = 0 A) porque el camino conductor está interrumpido',
                'La corriente sigue fluyendo pero solo por el cable negativo',
                'La corriente se transforma en magnetismo dentro del interruptor'
            ],
            correct: 1
        },
        {
            id: 'ee-1-2-q3',
            objective: 'Comprender el peligro de un cortocircuito',
            concept: 'cortocircuito',
            difficulty: 'medium',
            q: '¿Por qué un cortocircuito hace que la corriente se dispare a niveles destructivos instantáneamente?',
            options: [
                'Porque la batería multiplica su voltaje',
                'Porque la resistencia del camino cae a casi cero ohmios (I = V / 0 ≈ ∞)',
                'Porque los cables cambian de polaridad',
                'Porque el aire dentro del cable se enfría'
            ],
            correct: 1
        },
        {
            id: 'ee-1-2-q4',
            objective: 'Aplicar la Ley de Ohm para calcular corriente',
            concept: 'calculo_corriente',
            difficulty: 'medium',
            q: 'Un foco incandescente de 24 Ω se conecta a una batería de 12V. ¿Qué corriente consume?',
            options: ['2 Amperios', '0.5 Amperios (500 mA)', '288 Amperios', '12 Amperios'],
            correct: 1
        },
        {
            id: 'ee-1-2-q5',
            objective: 'Aplicar la Ley de Ohm para calcular resistencia',
            concept: 'calculo_resistencia',
            difficulty: 'medium',
            q: 'Si un circuito de 120V registra un paso de corriente de 4 Amperios, la resistencia total es:',
            options: ['480 Ω', '30 Ω', '0.033 Ω', '124 Ω'],
            correct: 1
        },
        {
            id: 'ee-1-2-q6',
            objective: 'Calcular potencia eléctrica con la Ley de Watt',
            concept: 'ley_watt',
            difficulty: 'medium',
            q: 'Un cautín de soldadura opera a 120V y consume una corriente de 0.5A. ¿Cuál es su potencia eléctrica?',
            options: ['60 Watts', '240 Watts', '120.5 Watts', '30 Watts'],
            correct: 0
        },
        {
            id: 'ee-1-2-q7',
            objective: 'Convertir unidades con prefijos métricos del SI',
            concept: 'prefijos_si',
            difficulty: 'easy',
            q: '¿Cuál es la forma correcta de expresar 0.015 Amperios usando prefijos métricos?',
            options: ['15 µA', '15 mA', '1.5 kA', '150 nA'],
            correct: 1
        },
        {
            id: 'ee-1-2-q8',
            objective: 'Convertir kiloohmios a ohmios base',
            concept: 'prefijos_resistencia',
            difficulty: 'easy',
            q: 'Una resistencia marcada como 2.2 kΩ tiene un valor real en ohmios de:',
            options: ['22 Ω', '220 Ω', '2.200 Ω', '22.000 Ω'],
            correct: 2
        },
        {
            id: 'ee-1-2-q9',
            objective: 'Dominar la medición de corriente con multímetro',
            concept: 'medicion_amperimetro',
            difficulty: 'hard',
            q: 'Para medir la corriente eléctrica que fluye hacia un motor DC con un multímetro digital, debes:',
            options: [
                'Tocar los dos bornes de la batería en paralelo con el circuito encendido',
                'Abrir el circuito y colocar las puntas del multímetro en SERIE en el camino de corriente',
                'Apagar el circuito y medir los cables en modo ohmios',
                'Colocar ambas puntas en el mismo cable sin cortarlo'
            ],
            correct: 1
        },
        {
            id: 'ee-1-2-q10',
            objective: 'Dominar la medición de resistencia con multímetro',
            concept: 'medicion_ohmimetro',
            difficulty: 'medium',
            q: '¿Qué precaución crítica se debe tomar SIEMPRE antes de medir el valor en Ohmios de un resistor en una placa?',
            options: [
                'Encender la fuente al máximo voltaje para calibrar',
                'Desconectar la alimentación eléctrica del circuito y aislar el resistor',
                'Poner el multímetro en escala de 10 Amperios',
                'Humedecer las puntas de prueba'
            ],
            correct: 1
        },
        {
            id: 'ee-1-2-q11',
            objective: 'Decodificar el valor de un resistor con el código de 4 bandas',
            concept: 'codigo_colores_resistencia',
            difficulty: 'medium',
            q: 'Un resistor de 4 bandas tiene la secuencia de colores: Rojo (2) - Rojo (2) - Marrón (×10) - Dorado (±5%). ¿Cuál es su valor nominal?',
            options: [
                '22 Ω ± 5%',
                '220 Ω ± 5%',
                '2.200 Ω ± 5%',
                '44 Ω ± 10%'
            ],
            correct: 1
        },
        {
            id: 'ee-1-2-q12',
            objective: 'Interpretar la banda de tolerancia en resistores',
            concept: 'tolerancia_resistencia',
            difficulty: 'easy',
            q: '¿Qué indica una cuarta banda de color DORADO en un resistor de carbón?',
            options: [
                'Que la resistencia soporta hasta 1.000 Watts',
                'Que el valor real medido puede variar hasta un ±5% respecto al nominal',
                'Que el resistor es de oro puro',
                'Que solo funciona con corriente alterna (AC)'
            ],
            correct: 1
        }
    ],
    quizConfig: { timePerQuestion: 20, requiredScorePercent: 80 }
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m1-l2-content',
                content: lessonDefinition.content,
                hasSimulator: lessonDefinition.hasSimulator
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ee-m1-l2-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        simulador: [
            createContentBlock({
                id: 'ee-m1-l2-practice',
                content: `
                    <div style="margin-bottom: 2rem;">
                        <div id="practical-lab-l2-container"></div>
                    </div>
                `,
                hasSimulator: true
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m1-l2-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions,
                quizConfig: lessonDefinition.quizConfig
            })
        ]
    }
});
