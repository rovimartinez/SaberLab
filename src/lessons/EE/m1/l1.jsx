import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Fundamentos de Electricidad, Historia y Magnitudes Físicas',
    hasSimulator: true,
    content: `
        <!-- ── 1.0 Historia y Ley Fundamental de Cargas ── -->
        <h3 id="ee-1-0" style="color: #f59e0b; margin: 1.5rem 0 1rem; font-size: 1.4rem;">1.0 De la Antigüedad al Descubrimiento de la Carga</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            El viaje de la electricidad comenzó hace más de 2,600 años cuando el filósofo griego <strong>Tales de Mileto (600 a.C.)</strong> descubrió que al frotar un trozo de ámbar (resina fósil vegetal) con una piel de animal, este adquiría la misteriosa propiedad de atraer objetos ligeros como plumas y hojas secas. La palabra <em>"electricidad"</em> proviene directamente del vocablo griego <strong>elektron (ήλεκτρον)</strong>, que significa precisamente <strong>ámbar</strong>.
        </p>

        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            Siglos más tarde, <strong>Benjamin Franklin</strong> demostró que la electricidad era un fluido universal y bautizó los dos tipos de comportamiento eléctrico como <strong>Carga Positiva (+)</strong> y <strong>Carga Negativa (−)</strong>.
        </p>

        <!-- Ley de Coulomb Formal -->
        <div style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(15, 23, 42, 0.85) 100%); border: 1.5px solid rgba(56, 189, 248, 0.3); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; alignItems: center; flex-wrap: wrap; gap: 8px; margin-bottom: 1rem;">
                <h4 style="color: #38bdf8; margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
                    ⚡ Ley de Coulomb (1785) — La Fuerza entre Cargas Eléctricas
                </h4>
                <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid #38bdf8; padding: 2px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 800;">
                    Física Fundamental
                </span>
            </div>

            <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.7; margin-bottom: 1rem;">
                El físico francés <strong>Charles-Augustin de Coulomb</strong> cuantificó por primera vez la magnitud exacta de la fuerza electrostática con la que dos cuerpos cargados se atraen o repelen:
            </p>

            <!-- Fórmula Destacada -->
            <div style="background: rgba(0,0,0,0.4); border: 1.5px solid #38bdf8; border-radius: 14px; padding: 1.25rem; text-align: center; margin-bottom: 1.25rem;">
                <div style="color: #94a3b8; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px;">Ecuación de la Ley de Coulomb:</div>
                <div style="color: white; font-size: 1.8rem; font-weight: 900; font-family: monospace; letter-spacing: 0.05em;">
                    F = k · <span style="color: #38bdf8;">(|q₁ · q₂|)</span> / <span style="color: #fbbf24;">r²</span>
                </div>
            </div>

            <!-- Desglose de Variables -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 0.82rem; margin-bottom: 1rem;">
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 0.75rem;">
                    <strong style="color: #38bdf8;">F:</strong> Fuerza eléctrica en Newtons <strong>[N]</strong>
                </div>
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 0.75rem;">
                    <strong style="color: #38bdf8;">q₁, q₂:</strong> Cargas eléctricas en Culombios <strong>[C]</strong>
                </div>
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 0.75rem;">
                    <strong style="color: #fbbf24;">r:</strong> Distancia entre cargas en metros <strong>[m]</strong>
                </div>
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 0.75rem;">
                    <strong style="color: #34d399;">k:</strong> Constante electrostática <code style="color: #34d399;">8.99 × 10⁹ N·m²/C²</code>
                </div>
            </div>

            <!-- Principios Clave -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; font-size: 0.84rem; line-height: 1.6; color: #cbd5e1;">
                <div style="background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; border-radius: 8px; padding: 0.75rem;">
                    <strong>1. Regla de Signos:</strong> Cargas del mismo signo se <strong>repelen</strong> (+ con + ó − con −); cargas de signos opuestos se <strong>atraen</strong> (+ con −).
                </div>
                <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; border-radius: 8px; padding: 0.75rem;">
                    <strong>2. Ley del Inverso al Cuadrado:</strong> Si la distancia entre las cargas se <em>duplica (2×)</em>, la fuerza se reduce a la <strong>cuarta parte (¼)</strong>. Si la distancia se reduce a la <em>mitad (½)</em>, la fuerza se <strong>cuadruplica (4×)</strong>.
                </div>
            </div>

            <!-- Ejemplo Práctico Paso a Paso -->
            <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 12px; padding: 1.25rem; margin-top: 1rem;">
                <div style="color: #38bdf8; font-weight: 800; font-size: 0.9rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 6px;">
                    💡 Ejemplo Práctico: ¿Con cuánta fuerza se atraen dos cargas?
                </div>
                <p style="color: #e2e8f0; font-size: 0.86rem; line-height: 1.6; margin-bottom: 0.75rem;">
                    Supongamos una carga positiva <strong>q₁ = +2 µC</strong> (+2 × 10⁻⁶ C) y una carga negativa <strong>q₂ = −3 µC</strong> (−3 × 10⁻⁶ C) separadas a una distancia de <strong>r = 0.5 metros</strong>:
                </p>
                <div style="background: rgba(15, 23, 42, 0.8); border-left: 3px solid #38bdf8; border-radius: 6px; padding: 0.75rem 1rem; font-family: monospace; font-size: 0.85rem; color: #cbd5e1; line-height: 1.7; margin-bottom: 0.75rem;">
                    1. Reemplazamos: F = (8.99 × 10⁹) · |(+2×10⁻⁶) · (−3×10⁻⁶)| / (0.5)²<br/>
                    2. Operamos cargas: F = (8.99 × 10⁹) · (6 × 10⁻¹²) / 0.25<br/>
                    3. Resultado: <strong style="color: #34d399;">F = 0.216 Newtons [N] (Fuerza de Atracción)</strong>
                </div>
                <p style="color: #94a3b8; font-size: 0.8rem; margin: 0; line-height: 1.5;">
                    📌 <em>Prueba el simulador interactivo que está justo debajo:</em> ajusta q₁ a +2 µC, q₂ a −3 µC y la distancia r a 0.50 m para comprobar este cálculo exacto y ver cómo se mueven las partículas.
                </p>
            </div>
        </div>

        <div style="margin: 2rem 0;">
            <div id="charge-interaction-container"></div>
        </div>

        <!-- ── 1.1 Estructura del Átomo ── -->
        <h3 id="ee-1-1" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">1.1 ¿Qué es la Electricidad? Estructura del Átomo</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Toda la materia está formada por <strong>átomos</strong>, compuestos por tres partículas fundamentales:
        </p>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 16px; padding: 1.25rem;">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔴 Protones</div>
                <p style="color: #fca5a5; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.25rem;">Carga Positiva (+)</p>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">Ubicados en el núcleo atómico con masa fija. No se desplazan por los circuitos.</p>
            </div>
            <div style="background: rgba(100, 116, 139, 0.08); border: 1px solid rgba(100, 116, 139, 0.25); border-radius: 16px; padding: 1.25rem;">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⚪ Neutrones</div>
                <p style="color: #cbd5e1; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.25rem;">Carga Neutra (0)</p>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">Ubicados en el núcleo junto a los protones, estabilizan la cohesión nuclear.</p>
            </div>
            <div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 16px; padding: 1.25rem;">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔵 Electrones</div>
                <p style="color: #93c5fd; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.25rem;">Carga Negativa (−)</p>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">Orbitan en capas concéntricas alrededor del núcleo. Son los <strong>portadores del flujo eléctrico</strong>.</p>
            </div>
        </div>

        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            En metales conductores como el <strong>Cobre (Cu 29)</strong>, la capa exterior (Capa N) posee <strong>1 solo electrón de valencia</strong> débilmente retenido, el cual puede desprenderse fácilmente al aplicar una diferencia de potencial eléctrico (voltaje).
        </p>

        <!-- Simulador interactivo del átomo de Cobre -->
        <div style="margin: 2rem 0;">
            <div id="atom-model-container"></div>
        </div>

        <!-- ── 1.2 Medios de Transporte: Conductores, Aislantes y Semiconductores ── -->
        <h3 id="ee-1-2" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">1.2 Medios de Transporte de la Electricidad</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Para que exista corriente eléctrica, debe haber un medio que permita el movimiento ordenado de portadores de carga. Existen tres categorías fundamentales:
        </p>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
            <!-- Conductores Metálicos -->
            <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #10b981; margin: 0 0 0.5rem; font-size: 1.05rem;">⚡ Metales (Cobre, Aluminio, Plata)</h4>
                <p style="color: #cbd5e1; font-size: 0.8rem; line-height: 1.6; margin-bottom: 0.5rem;">
                    La corriente se transporta mediante un <strong>mar de electrones libres</strong> que saltan entre átomos metálicos con mínima oposición.
                </p>
                <span style="font-size: 0.72rem; color: #34d399; font-weight: bold;">Portador: Electrones libres</span>
            </div>

            <!-- Soluciones Iónicas -->
            <div style="background: rgba(56, 189, 248, 0.06); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #38bdf8; margin: 0 0 0.5rem; font-size: 1.05rem;">🧪 Soluciones Iónicas (Electrolitos)</h4>
                <p style="color: #cbd5e1; font-size: 0.8rem; line-height: 1.6; margin-bottom: 0.5rem;">
                    En agua con sal (NaCl) o ácidos de baterías, la corriente se transporta mediante <strong>iones positivos (cationes) e iones negativos (aniones)</strong> en movimiento.
                </p>
                <span style="font-size: 0.72rem; color: #38bdf8; font-weight: bold;">Portador: Iones en disolución</span>
            </div>

            <!-- Semiconductores -->
            <div style="background: rgba(168, 85, 247, 0.06); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #c084fc; margin: 0 0 0.5rem; font-size: 1.05rem;">💎 Semiconductores (Silicio, Germanio)</h4>
                <p style="color: #cbd5e1; font-size: 0.8rem; line-height: 1.6; margin-bottom: 0.5rem;">
                    Materiales base de diodos, transistores y microchips. Conducen solo bajo condiciones específicas de voltaje, luz o temperatura.
                </p>
                <span style="font-size: 0.72rem; color: #c084fc; font-weight: bold;">Portador: Electrones y Huecos</span>
            </div>
        </div>

        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Por el contrario, los <strong>Materiales Aislantes (Dieléctricos)</strong> como el plástico PVC, el vidrio, la porcelana y la goma poseen su capa de valencia completa (8 electrones / octeto) fuertemente ligados al núcleo, impidiendo el paso de corriente.
        </p>

        <!-- Simulador interactivo de conductores y aislantes -->
        <div style="margin: 2rem 0;">
            <div id="conductor-animation-container"></div>
        </div>

        <!-- ── 1.3 Las 3 Magnitudes Físicas Fundamentales ── -->
        <h3 id="ee-1-3" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">1.3 Las 3 Magnitudes Físicas Fundamentales</h3>
        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            Cualquier circuito eléctrico en el mundo se rige por la interacción de tres magnitudes físicas fundamentales:
        </p>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 2rem;">
            <!-- Voltaje -->
            <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 20px; padding: 1.5rem; display: flex; flex-direction: column;">
                <div style="color: #c084fc; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Tensión / Fuerza</div>
                <h4 style="color: white; font-size: 1.3rem; margin: 0.3rem 0 0.5rem;">Voltaje (V)</h4>
                <div style="background: rgba(168, 85, 247, 0.2); color: #e9d5ff; font-weight: 800; padding: 4px 10px; border-radius: 8px; width: fit-content; font-size: 0.85rem; margin-bottom: 0.75rem;">
                    Unidad: Voltio [V]
                </div>
                <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.6; margin: 0 0 1rem;">
                    Es la <strong>diferencia de potencial eléctrico</strong> entre dos puntos. Representa el "empuje" o presión que obliga a los electrones a moverse.
                </p>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.75rem; font-size: 0.75rem; color: #cbd5e1; margin-top: auto;">
                    💧 <em>Analogía:</em> La presión o altura del agua en un tanque.
                </div>
            </div>

            <!-- Corriente -->
            <div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 20px; padding: 1.5rem; display: flex; flex-direction: column;">
                <div style="color: #60a5fa; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Flujo / Caudal</div>
                <h4 style="color: white; font-size: 1.3rem; margin: 0.3rem 0 0.5rem;">Corriente (I)</h4>
                <div style="background: rgba(59, 130, 246, 0.2); color: #bfdbfe; font-weight: 800; padding: 4px 10px; border-radius: 8px; width: fit-content; font-size: 0.85rem; margin-bottom: 0.75rem;">
                    Unidad: Amperio [A]
                </div>
                <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.6; margin: 0 0 1rem;">
                    Es la <strong>cantidad de carga eléctrica</strong> (electrones) que atraviesa la sección de un conductor por unidad de tiempo (1 A = 1 C/s = 6.242 × 10<sup>18</sup> electrones/s).
                </p>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.75rem; font-size: 0.75rem; color: #cbd5e1; margin-top: auto;">
                    💧 <em>Analogía:</em> El caudal de agua (litros/segundo) fluyendo por el tubo.
                </div>
            </div>

            <!-- Resistencia -->
            <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 20px; padding: 1.5rem; display: flex; flex-direction: column;">
                <div style="color: #fbbf24; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Oposición</div>
                <h4 style="color: white; font-size: 1.3rem; margin: 0.3rem 0 0.5rem;">Resistencia (R)</h4>
                <div style="background: rgba(245, 158, 11, 0.2); color: #fef08a; font-weight: 800; padding: 4px 10px; border-radius: 8px; width: fit-content; font-size: 0.85rem; margin-bottom: 0.75rem;">
                    Unidad: Ohmio [Ω]
                </div>
                <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.6; margin: 0 0 1rem;">
                    Es la <strong>dificultad u oposición física</strong> que ofrece un material al paso de los electrones.
                </p>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.75rem; font-size: 0.75rem; color: #cbd5e1; margin-top: auto;">
                    💧 <em>Analogía:</em> La estrechez o válvula que frena el agua.
                </div>
            </div>
        </div>

        <!-- Corriente Real vs Convencional -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 1.5rem; margin-bottom: 2rem;">
            <h4 style="color: #38bdf8; margin: 0 0 0.75rem; font-size: 1.15rem;">🔄 Corriente Convencional vs. Corriente Real</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div style="background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 12px; padding: 1rem;">
                    <div style="color: #fbbf24; font-weight: bold; font-size: 0.88rem; margin-bottom: 0.25rem;">Corriente Convencional (De + a −)</div>
                    <p style="color: #94a3b8; font-size: 0.8rem; margin: 0; line-height: 1.5;">
                        Establecida históricamente por Benjamin Franklin antes de descubrir el electrón. Asume que las cargas positivas se mueven del polo positivo al negativo. <strong>Es el estándar universal usado en esquemas y análisis de ingeniería.</strong>
                    </p>
                </div>
                <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 1rem;">
                    <div style="color: #34d399; font-weight: bold; font-size: 0.88rem; margin-bottom: 0.25rem;">Corriente Real o Electrónica (De − a +)</div>
                    <p style="color: #94a3b8; font-size: 0.8rem; margin: 0; line-height: 1.5;">
                        Es lo que ocurre físicamente en el átomo: los electrones tienen carga negativa y viajan desde el polo negativo (−) atraídos hacia el polo positivo (+).
                    </p>
                </div>
            </div>
        </div>

        <!-- Simulador interactivo de Corriente Real vs Convencional -->
        <div style="margin: 2rem 0;">
            <div id="current-direction-container"></div>
        </div>

        <!-- Factores Físicos de la Resistencia (Ley de Pouillet) -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 1.5rem; margin-bottom: 2rem;">
            <h4 style="color: #fbbf24; margin: 0 0 0.5rem; font-size: 1.15rem;">📐 Factores Físicos que Determinan la Resistencia de un Cable (Ley de Pouillet)</h4>
            <div style="text-align: center; margin: 1rem 0; font-size: 1.25rem; font-weight: 800; color: #fbbf24; font-family: monospace; background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: 10px;">
                R = ρ · ( L / A )
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; font-size: 0.8rem;">
                <div style="background: rgba(255,255,255,0.03); padding: 0.75rem; border-radius: 10px;">
                    <strong style="color: #e2e8f0; display: block; margin-bottom: 0.25rem;">📏 Longitud (L):</strong>
                    <span style="color: #94a3b8;">A mayor longitud, <strong>mayor resistencia</strong> (el camino es más largo).</span>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 0.75rem; border-radius: 10px;">
                    <strong style="color: #e2e8f0; display: block; margin-bottom: 0.25rem;">⭕ Sección / Grosor (A):</strong>
                    <span style="color: #94a3b8;">A mayor grosor (calibre), <strong>menor resistencia</strong> (más carriles de paso).</span>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 0.75rem; border-radius: 10px;">
                    <strong style="color: #e2e8f0; display: block; margin-bottom: 0.25rem;">🧪 Material (ρ):</strong>
                    <span style="color: #94a3b8;">La <strong>resistividad (ρ)</strong> intrínseca del material (el Cobre tiene ρ muy baja).</span>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 0.75rem; border-radius: 10px;">
                    <strong style="color: #e2e8f0; display: block; margin-bottom: 0.25rem;">🌡️ Temperatura (T):</strong>
                    <span style="color: #94a3b8;">En metales, a mayor temperatura, los átomos vibran más y <strong>aumenta la resistencia</strong>.</span>
                </div>
            </div>
        </div>

        <!-- Simulador de la Analogía Hidráulica -->
        <div style="margin: 2rem 0;">
            <div id="hydraulic-analogy-container"></div>
        </div>

        <!-- ── 1.4 Seguridad Eléctrica y Efectos Fisiológicos en el Cuerpo Humano (IEC 60479) ── -->
        <h3 id="ee-1-4" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">1.4 Seguridad Eléctrica: Normativa Internacional IEC 60479</h3>
        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            La base científica e internacional para evaluar el riesgo eléctrico es la <strong>norma IEC 60479</strong> (<em>Efectos de la corriente sobre los seres humanos y el ganado</em>), desarrollada por la <strong>Comisión Electrotécnica Internacional</strong>. Sus apartados <strong>IEC 60479-1</strong> (aspectos generales) y <strong>IEC 60479-2</strong> (efectos especiales, incluyendo corriente continua) establecen con rigor cómo el cuerpo humano responde a distintas intensidades de corriente según el tipo de señal.
        </p>

        <!-- Dos Pilares Fundamentales -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem;">
            <!-- Pilar 1 -->
            <div style="background: rgba(56, 189, 248, 0.06); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 18px; padding: 1.5rem;">
                <div style="color: #38bdf8; font-weight: 800; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem;">1. La Fuerza Impulsora</div>
                <h4 style="color: white; font-size: 1.2rem; margin: 0 0 0.75rem;">💧 "El Voltaje Empuja"</h4>
                <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.7; margin: 0;">
                    El voltaje (o tensión) es la <strong>diferencia de potencial eléctrico</strong>. Funciona de manera análoga a la presión del agua en una tubería: por sí solo no causa el daño físico directo, pero <strong>ejerce la fuerza necesaria para empujar a los electrones</strong> a través de la resistencia de la piel y los tejidos internos del cuerpo humano.
                </p>
            </div>

            <!-- Pilar 2 -->
            <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 18px; padding: 1.5rem;">
                <div style="color: #f87171; font-weight: 800; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem;">2. El Flujo Destructivo</div>
                <h4 style="color: white; font-size: 1.2rem; margin: 0 0 0.75rem;">⚡ "La Corriente Destruye"</h4>
                <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.7; margin: 0;">
                    La corriente eléctrica (medida en miliamperios, mA) es el <strong>flujo real de trillones de electrones circulando por el organismo</strong>. Es este flujo el que interfiere con las señales bioeléctricas del sistema nervioso y del corazón, genera calor quemando tejidos internos y produce paros cardíacos.
                </p>
            </div>
        </div>

        <!-- ── TABLA 1: CORRIENTE ALTERNA (AC) - IEC 60479-1 ── -->
        <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 18px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.5rem;">
                <span style="font-size: 1.3rem;">⚡</span>
                <h4 style="color: #38bdf8; margin: 0; font-size: 1.2rem; font-weight: 800;">1. Corriente Alterna (AC) — IEC 60479-1</h4>
            </div>
            <p style="color: #94a3b8; font-size: 0.84rem; margin: 0 0 1rem; line-height: 1.6;">
                <strong>Frecuencia habitual:</strong> 50 o 60 Hz (la de los enchufes domésticos e industriales).<br/>
                <strong>¿Por qué es más peligrosa a menor intensidad?</strong> Al oscilar y cambiar de polaridad decenas de veces por segundo, su frecuencia interrumpe y desincroniza directamente los impulsos bioeléctricos del nódulo sinusal del corazón, provocando que las fibras cardíacas entren en un estado caótico (<strong>fibrilación ventricular</strong>) con muy pocos miliamperios.
            </p>

            <table style="width: 100%; border-collapse: collapse; font-size: 0.83rem;">
                <thead>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.12); text-align: left; color: #38bdf8;">
                        <th style="padding: 0.6rem 0.75rem; width: 160px;">Cantidad de Corriente</th>
                        <th style="padding: 0.6rem 0.75rem;">Efecto Fisiológico en el Organismo</th>
                        <th style="padding: 0.6rem 0.75rem; text-align: right; width: 140px;">Nivel de Riesgo</th>
                    </tr>
                </thead>
                <tbody style="color: #cbd5e1;">
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.6rem 0.75rem; color: #34d399; font-weight: bold;">1 a 10 mA</td>
                        <td style="padding: 0.6rem 0.75rem;">Sensación de hormigueo o cosquilleo leve; generalmente inofensivo.</td>
                        <td style="padding: 0.6rem 0.75rem; text-align: right;"><span style="background: rgba(52,211,153,0.15); color: #34d399; padding: 2px 8px; borderRadius: 6px; font-weight: 700;">Inofensivo</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.6rem 0.75rem; color: #fbbf24; font-weight: bold;">10 a 25 mA</td>
                        <td style="padding: 0.6rem 0.75rem;">Comienzan los espasmos musculares y la pérdida de control motriz (<strong>"no poder soltar"</strong> la fuente de energía).</td>
                        <td style="padding: 0.6rem 0.75rem; text-align: right;"><span style="background: rgba(251,191,36,0.15); color: #fbbf24; padding: 2px 8px; borderRadius: 6px; font-weight: 700;">Moderado</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.6rem 0.75rem; color: #fb923c; font-weight: bold;">25 a 50 mA</td>
                        <td style="padding: 0.6rem 0.75rem;">Contracciones musculares violentas, problemas respiratorios severos y fatiga intensa.</td>
                        <td style="padding: 0.6rem 0.75rem; text-align: right;"><span style="background: rgba(251,146,60,0.15); color: #fb923c; padding: 2px 8px; borderRadius: 6px; font-weight: 700;">Peligro Alto</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.6rem 0.75rem; color: #ef4444; font-weight: bold;">50 a 100 mA</td>
                        <td style="padding: 0.6rem 0.75rem;">Puede provocar <strong>fibrilación ventricular</strong> en el corazón (latido anárquico e inútil para bombear sangre), potencialmente mortal.</td>
                        <td style="padding: 0.6rem 0.75rem; text-align: right;"><span style="background: rgba(239,68,68,0.2); color: #ef4444; padding: 2px 8px; borderRadius: 6px; font-weight: 700;">Grave / Mortal</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.6rem 0.75rem; color: #dc2626; font-weight: bold;">100 a 300 mA</td>
                        <td style="padding: 0.6rem 0.75rem;">Fibrilación ventricular asegurada, daño muscular grave y posible fractura de huesos por contracciones extremas.</td>
                        <td style="padding: 0.6rem 0.75rem; text-align: right;"><span style="background: #dc2626; color: white; padding: 2px 8px; borderRadius: 6px; font-weight: 700;">Crítico / Fatal</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.6rem 0.75rem; color: #b91c1c; font-weight: bold;">300 a 1000 mA</td>
                        <td style="padding: 0.6rem 0.75rem;">Paro cardíaco completo, quemaduras internas graves y destrucción profunda de tejidos.</td>
                        <td style="padding: 0.6rem 0.75rem; text-align: right;"><span style="background: #b91c1c; color: white; padding: 2px 8px; borderRadius: 6px; font-weight: 700;">Letal</span></td>
                    </tr>
                    <tr>
                        <td style="padding: 0.6rem 0.75rem; color: #991b1b; font-weight: bold;">Más de 1000 mA (1 A)</td>
                        <td style="padding: 0.6rem 0.75rem;">Causa paros cardíacos inmediatos, quemaduras internas severas y destrucción masiva de tejidos.</td>
                        <td style="padding: 0.6rem 0.75rem; text-align: right;"><span style="background: #991b1b; color: white; padding: 2px 8px; borderRadius: 6px; font-weight: 700;">Letal Inmediato</span></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- ── TABLA 2: CORRIENTE CONTINUA (DC) - IEC 60479-2 ── -->
        <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 18px; padding: 1.5rem; margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.5rem;">
                <span style="font-size: 1.3rem;">🔋</span>
                <h4 style="color: #fbbf24; margin: 0; font-size: 1.2rem; font-weight: 800;">2. Corriente Continua (DC) — IEC 60479-2</h4>
            </div>
            <p style="color: #94a3b8; font-size: 0.84rem; margin: 0 0 1rem; line-height: 1.6;">
                <strong>Fuentes habituales:</strong> Paneles solares, baterías, centros de datos y sistemas fotovoltaicos.<br/>
                <strong>¿Por qué se comporta diferente?</strong> Al fluir en una sola dirección constante y sin oscilar, el corazón no entra en fibrilación con la misma facilidad que con la AC (requiere umbrales de intensidad mucho más altos). Sin embargo, al ser un flujo continuo, provoca un <strong>intenso efecto térmico y electrólisis en los fluidos corporales</strong>, lo que destruye tejidos y genera quemaduras internas profundas.
            </p>

            <table style="width: 100%; border-collapse: collapse; font-size: 0.83rem;">
                <thead>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.12); text-align: left; color: #fbbf24;">
                        <th style="padding: 0.6rem 0.75rem; width: 180px;">Cantidad de Corriente (DC)</th>
                        <th style="padding: 0.6rem 0.75rem;">Efecto Fisiológico en el Organismo</th>
                        <th style="padding: 0.6rem 0.75rem; text-align: right; width: 140px;">Nivel de Riesgo</th>
                    </tr>
                </thead>
                <tbody style="color: #cbd5e1;">
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.6rem 0.75rem; color: #34d399; font-weight: bold;">2 a 10 mA</td>
                        <td style="padding: 0.6rem 0.75rem;">Ligero hormigueo o sensación de calor localizado en el punto de contacto.</td>
                        <td style="padding: 0.6rem 0.75rem; text-align: right;"><span style="background: rgba(52,211,153,0.15); color: #34d399; padding: 2px 8px; borderRadius: 6px; font-weight: 700;">Inofensivo</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.6rem 0.75rem; color: #fb923c; font-weight: bold;">50 a 80 mA</td>
                        <td style="padding: 0.6rem 0.75rem;">Umbral de "no soltar" (inicio de espasmos musculares severos).</td>
                        <td style="padding: 0.6rem 0.75rem; text-align: right;"><span style="background: rgba(251,146,60,0.15); color: #fb923c; padding: 2px 8px; borderRadius: 6px; font-weight: 700;">Moderado / Peligro</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.6rem 0.75rem; color: #ef4444; font-weight: bold;">300 a 500 mA</td>
                        <td style="padding: 0.6rem 0.75rem;">Riesgo de paro respiratorio y quemaduras internas graves por efecto térmico y electrolítico.</td>
                        <td style="padding: 0.6rem 0.75rem; text-align: right;"><span style="background: rgba(239,68,68,0.2); color: #ef4444; padding: 2px 8px; borderRadius: 6px; font-weight: 700;">Grave</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.6rem 0.75rem; color: #dc2626; font-weight: bold;">500 a 3000 mA (0.5 a 3 A)</td>
                        <td style="padding: 0.6rem 0.75rem;">Fibrilación ventricular severa y daños letales debido a las altas intensidades sostenidas en DC.</td>
                        <td style="padding: 0.6rem 0.75rem; text-align: right;"><span style="background: #dc2626; color: white; padding: 2px 8px; borderRadius: 6px; font-weight: 700;">Crítico / Fatal</span></td>
                    </tr>
                    <tr>
                        <td style="padding: 0.6rem 0.75rem; color: #991b1b; font-weight: bold;">Más de 3000 mA (3 A)</td>
                        <td style="padding: 0.6rem 0.75rem;">Paro cardíaco fatal, quemaduras catastróficas y destrucción profunda de los tejidos corporales.</td>
                        <td style="padding: 0.6rem 0.75rem; text-align: right;"><span style="background: #991b1b; color: white; padding: 2px 8px; borderRadius: 6px; font-weight: 700;">Letal Inmediato</span></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- La Trampa y el Peligro Real: ¿Por qué el Voltaje Importa? -->
        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 18px; padding: 1.5rem; margin-bottom: 2rem;">
            <h4 style="color: #fbbf24; margin: 0 0 0.75rem; font-size: 1.15rem;">⚠️ ¿Cómo se Conecta el Enchufe de 110V / 220V con la Norma IEC 60479?</h4>
            <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.7; margin-bottom: 1rem;">
                La tabla de la norma IEC 60479 nos dice qué le ocurre a tus órganos vitales según <strong>cuántos miliamperios (mA) los atraviesan</strong>: por ejemplo, si te atraviesan de <strong>50 a 100 mA</strong>, el corazón entra en fibrilación ventricular mortal.<br/><br/>
                El enchufe de <strong>110V o 220V</strong> es simplemente la fuente de <em>presión eléctrica</em> (el voltaje). Para saber si ese enchufe logrará inyectar esos miliamperios letales en tu corazón, depende enteramente de la <strong>resistencia de tu cuerpo y de si estás descalzo en ese instante</strong>:
            </p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                <div style="background: rgba(56, 189, 248, 0.05); border-radius: 12px; padding: 1rem; border: 1px solid rgba(56, 189, 248, 0.2);">
                    <strong style="color: #38bdf8; display: block; margin-bottom: 0.35rem;">🌵 Si estás seco y con calzado (Alta resistencia: ≈ 50.000 Ω):</strong>
                    <p style="color: #cbd5e1; font-size: 0.82rem; margin: 0; line-height: 1.6;">
                        Tu piel y el calzado ofrecen mucha resistencia: <code>I = 110V / 50.000Ω ≈ 2.2 mA</code>. Al mirar la tabla, 2.2 mA es solo un hormigueo inofensivo. Por eso mucha gente dice: <em>"A mí me dio un corrientazo de 110V y no me pasó nada"</em>.
                    </p>
                </div>
                <div style="background: rgba(239, 68, 68, 0.08); border-radius: 12px; padding: 1rem; border: 1px solid rgba(239, 68, 68, 0.25);">
                    <strong style="color: #f87171; display: block; margin-bottom: 0.35rem;">🦶 Si estás sudado, mojado o DESCALZO en el suelo (Baja resistencia: ≈ 1.000 Ω):</strong>
                    <p style="color: #cbd5e1; font-size: 0.82rem; margin: 0; line-height: 1.6;">
                        Tu resistencia corporal colapsa a tierra: <code>I = 110V / 1.000Ω = 110 mA</code>. Al mirar la tabla, <strong>110 mA entra de lleno en la zona de fibrilación ventricular y muerte</strong>.
                    </p>
                </div>
            </div>

            <!-- Tabla Comparativa Completa de Enchufe vs Condición Corporal -->
            <div style="background: rgba(0,0,0,0.3); border-radius: 14px; padding: 1rem; margin-bottom: 1rem;">
                <div style="color: #fbbf24; font-weight: 800; font-size: 0.85rem; margin-bottom: 0.5rem; text-transform: uppercase;">
                    📋 Lectura Correcta: Voltaje Externo + Ley de Ohm ($I = V/R$) + IEC 60479
                </div>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; text-align: left;">
                        <thead>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.12); color: #94a3b8;">
                                <th style="padding: 6px 10px;">Voltaje del Enchufe</th>
                                <th style="padding: 6px 10px;">Condición de tu Piel / Calzado</th>
                                <th style="padding: 6px 10px;">Corriente Real al Cuerpo ($I$)</th>
                                <th style="padding: 6px 10px;">Efecto Fisiológico Directo (IEC 60479)</th>
                            </tr>
                        </thead>
                        <tbody style="color: #cbd5e1;">
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 8px 10px; font-weight: bold; color: #38bdf8;">110V / 120V</td>
                                <td style="padding: 8px 10px;">Seca y con Calzado ($\approx 50.000\,\Omega$)</td>
                                <td style="padding: 8px 10px; color: #34d399; font-weight: bold;">$\approx 2.2\text{ mA}$</td>
                                <td style="padding: 8px 10px;">Hormigueo leve, molesto pero inofensivo.</td>
                            </tr>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 8px 10px; font-weight: bold; color: #38bdf8;">110V / 120V</td>
                                <td style="padding: 8px 10px;">Ligeramente húmeda / sudor ($\approx 10.000\,\Omega$)</td>
                                <td style="padding: 8px 10px; color: #fbbf24; font-weight: bold;">$\approx 11\text{ mA}$</td>
                                <td style="padding: 8px 10px;">Espasmos musculares y principio de "no poder soltar".</td>
                            </tr>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(239,68,68,0.1);">
                                <td style="padding: 8px 10px; font-weight: bold; color: #f87171;">110V / 120V</td>
                                <td style="padding: 8px 10px; color: #fca5a5; font-weight: bold;">Mojada o con pies DESCALZOS ($\approx 1.000\,\Omega$)</td>
                                <td style="padding: 8px 10px; color: #ef4444; font-weight: bold;">$\approx 110\text{ mA}$</td>
                                <td style="padding: 8px 10px; color: #fca5a5;"><strong>Fibrilación ventricular (Potencialmente mortal).</strong></td>
                            </tr>
                            <tr style="background: rgba(220,38,38,0.15);">
                                <td style="padding: 8px 10px; font-weight: bold; color: #dc2626;">220V / 230V</td>
                                <td style="padding: 8px 10px; color: #fca5a5; font-weight: bold;">Mojada o Descalzo ($\approx 1.000\,\Omega$)</td>
                                <td style="padding: 8px 10px; color: #dc2626; font-weight: bold;">$\approx 220\text{ mA}$</td>
                                <td style="padding: 8px 10px; color: #fca5a5;"><strong>Fibrilación ventricular asegurada y quemaduras graves.</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Conclusión Clave -->
            <div style="background: rgba(0,0,0,0.35); border-radius: 12px; padding: 0.9rem; border-left: 4px solid #f87171;">
                <strong style="color: #f87171; font-size: 0.9rem;">📌 Conclusión Fundamental:</strong>
                <p style="color: #cbd5e1; font-size: 0.83rem; line-height: 1.6; margin: 0.35rem 0 0;">
                    La norma internacional no dice <em>"a los 110V pasa esto"</em>, sino <strong>"a los 100 miliamperios pasando por tu corazón ocurre fibrilación ventricular"</strong>. El peligro de un tomacorriente de 110V es que, si estás descalzo, mojado o sudado, tiene la capacidad de inyectar de inmediato esos 100 mA letales en tu organismo.
                </p>
            </div>
        </div>

        <!-- ── 1.5 Corriente Continua (DC) vs Corriente Alterna (AC) ── -->
        <h3 id="ee-1-5" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">1.5 Corriente Continua (DC) vs. Corriente Alterna (AC)</h3>
        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            Toda la energía eléctrica que utilizamos en el planeta se clasifica en dos formas según cómo se desplazan los electrones en el tiempo:
        </p>

        <!-- Módulo interactivo de Corriente Continua vs Alterna -->
        <div style="margin: 1.5rem 0 2rem;">
            <div id="ac-dc-simulator-container"></div>
        </div>

        <!-- ── 1.6 Medición de Magnitudes con el Multímetro Digital (Tester) ── -->
        <h3 id="ee-1-6" style="color: #38bdf8; margin: 2.5rem 0 1rem; font-size: 1.4rem;">1.6 Medición de Magnitudes con el Multímetro Digital (Tester)</h3>
        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            El <strong>multímetro digital (tester)</strong> es el instrumento de laboratorio fundamental para medir las tres magnitudes eléctricas aprendidas en esta lección: <strong>Voltaje (V)</strong>, <strong>Corriente (A)</strong> y <strong>Resistencia (Ω)</strong>. La forma de conexión varía de manera crítica según la magnitud a medir:
        </p>

        <!-- Cuadro de Modos de Medición -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <!-- Modo Voltímetro -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 1.1rem;">
                <div style="color: #38bdf8; font-weight: 800; font-size: 1rem; margin-bottom: 0.25rem;">🔴 Modo Voltímetro (V)</div>
                <div style="color: #34d399; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem;">Conexión en PARALELO</div>
                <p style="color: #cbd5e1; font-size: 0.8rem; line-height: 1.6; margin: 0;">
                    Se colocan las puntas directamente sobre los extremos del componente. <strong>No es necesario interrumpir ni abrir el circuito</strong>.
                </p>
            </div>

            <!-- Modo Amperímetro -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 1.1rem;">
                <div style="color: #f87171; font-weight: 800; font-size: 1rem; margin-bottom: 0.25rem;">⚡ Modo Amperímetro (A)</div>
                <div style="color: #fbbf24; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem;">Conexión en SERIE</div>
                <p style="color: #cbd5e1; font-size: 0.8rem; line-height: 1.6; margin: 0;">
                    <strong>Se debe abrir físicamente el circuito</strong> para intercalar las puntas del tester y hacer que la corriente fluya por dentro de él.
                </p>
            </div>

            <!-- Modo Óhmetro -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 16px; padding: 1.1rem;">
                <div style="color: #c084fc; font-weight: 800; font-size: 1rem; margin-bottom: 0.25rem;">📏 Modo Óhmetro (Ω)</div>
                <div style="color: #f87171; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.5rem;">CIRCUITO APAGADO</div>
                <p style="color: #cbd5e1; font-size: 0.8rem; line-height: 1.6; margin: 0;">
                    Mide el valor de la resistencia. El circuito debe estar <strong>completamente desenergizado (sin corriente)</strong> para no dañar el equipo.
                </p>
            </div>
        </div>

        <!-- Multímetro Virtual Interactivo -->
        <div style="margin: 2rem 0;">
            <div id="multimeter-explorer-container"></div>
        </div>
    `,
    flashcards: [
        { id: 'ee-1-1-f1', type: 'history', q: '¿De qué vocablo proviene la palabra "Electricidad" y qué significa?', a: 'Proviene del griego "Elektron" (ήλεκτρον), que significa "Ámbar"', sub: 'Descubierto por Tales de Mileto (600 a.C.) al frotar ámbar con piel', sectionId: 'ee-1-0' },
        { id: 'ee-1-1-f2', type: 'theory', q: '¿Qué establece la Ley Fundamental de Interacción de Cargas?', a: 'Cargas de igual signo (+ y + o − y −) se repelen; cargas de signo opuesto (+ y −) se atraen', sub: 'La fuerza electrostática varía inversamente al cuadrado de la distancia (F ∝ 1/r²)', sectionId: 'ee-1-0' },
        { id: 'ee-1-1-f3', type: 'atomic', q: '¿Cuáles son las 3 partículas fundamentales del átomo y sus cargas?', a: 'Protón (+, rojo), Neutrón (0, blanco/gris) y Electrón (−, azul cian)', sub: 'Estándar visual: los electrones orbitan y forman la corriente', sectionId: 'ee-1-1' },
        { id: 'ee-1-1-f4', type: 'atomic', q: '¿Por qué el Cobre (Cu 29) es un excelente conductor eléctrico?', a: 'Posee un solo electrón en su capa exterior de valencia (N), muy débilmente ligado al núcleo', sub: 'Configuración: 2-8-18-1; basta un mínimo voltaje para liberarlo', sectionId: 'ee-1-1' },
        { id: 'ee-1-1-f5', type: 'materials', q: '¿Qué diferencia atómica existe entre un Conductor y un Aislante (Dieléctrico)?', a: 'Los conductores tienen 1 a 3 electrones libres de valencia; los aislantes tienen su octeto completo (8 electrones) fuertemente retenidos', sub: 'Plástico, vidrio y goma impiden el paso de corriente', sectionId: 'ee-1-2' },
        { id: 'ee-1-1-f6', type: 'materials', q: '¿Qué portadores transportan la corriente en una solución con agua y sal (electrolito)?', a: 'Iones positivos (cationes) e iones negativos (aniones) en movimiento', sub: 'En metales son electrones; en electrolitos son iones disueltos', sectionId: 'ee-1-2' },
        { id: 'ee-1-1-f7', type: 'theory', q: '¿En qué dirección fluye la Corriente Real versus la Corriente Convencional?', a: 'Corriente Real: de (−) a (+). Corriente Convencional: de (+) a (−)', sub: 'La convención (+) a (−) de Benjamin Franklin es el estándar usado en ingeniería', sectionId: 'ee-1-3' },
        { id: 'ee-1-1-f8', type: 'theory', q: '¿Qué es el Voltaje (V) y cuál es su unidad de medida?', a: 'Es la diferencia de potencial eléctrico (la presión/fuerza que empuja electrones). Se mide en Voltios [V]', sub: 'Equivale a Joules por Coulomb (1 V = 1 J/C)', sectionId: 'ee-1-3' },
        { id: 'ee-1-1-f9', type: 'theory', q: '¿Qué es la Corriente (I) y cuántos electrones pasan en 1 Amperio?', a: 'Es el flujo de carga eléctrica por segundo. 1 A = 1 C/s = 6.242 × 10¹⁸ electrones/s', sub: 'Se mide en Amperios [A] con un amperímetro en serie', sectionId: 'ee-1-3' },
        { id: 'ee-1-1-f10', type: 'theory', q: '¿Qué es la Resistencia (R) y qué factores físicos la determinan (Ley de Pouillet)?', a: 'Oposición al flujo eléctrico (Ohmios [Ω]). Depende de: Longitud (L), Sección/Grosor (A), Material (ρ) y Temperatura (T)', sub: 'Fórmula de Pouillet: R = ρ · (L / A)', sectionId: 'ee-1-3' },
        { id: 'ee-1-1-f11', type: 'safety', q: '¿Por qué se dice que "el voltaje empuja, pero la corriente es la que destruye"?', a: 'El voltaje provee la fuerza motriz, pero los electrones circulando (corriente) son los que queman tejidos y alteran el corazón', sub: 'El daño fisiológico depende de la cantidad de miliamperios (mA) que atraviesan el cuerpo', sectionId: 'ee-1-4' },
        { id: 'ee-1-1-f12', type: 'safety', q: '¿Cuáles son los efectos de la corriente en el cuerpo según su intensidad?', a: '1-10 mA: Hormigueo; 10-25 mA: Espasmos musculares ("no soltar"); 50-100 mA: Fibrilación ventricular mortal; >1000 mA: Paro cardíaco y quemaduras letales', sub: 'Umbrales fisiológicos de seguridad eléctrica', sectionId: 'ee-1-4' },
        { id: 'ee-1-1-f13', type: 'safety', q: '¿Por qué un Taser de 50.000V no es letal pero un tomacorriente de 120V sí lo es?', a: 'El Taser tiene corriente limitada a 2-3 mA; el tomacorriente tiene corriente ilimitada y la piel mojada (1.000 Ω) deja pasar más de 120 mA letales', sub: 'Ley de Ohm en el cuerpo: I = V / R', sectionId: 'ee-1-4' },
        { id: 'ee-1-1-f14', type: 'theory', q: '¿Qué diferencia a la Corriente Continua (DC) de la Corriente Alterna (AC)?', a: 'DC: electrones viajan en un solo sentido constante (0 Hz, línea plana). AC: electrones oscilan en vaivén (50/60 Hz, onda senoidal)', sub: 'DC en baterías y electrónica digital; AC en la red domiciliaria y distribución', sectionId: 'ee-1-5' },
        { id: 'ee-1-1-f15', type: 'meter', q: '¿Cómo se debe conectar el voltímetro para medir tensión con el multímetro?', a: 'En PARALELO directamente sobre los extremos del componente', sub: 'No hace falta abrir físicamente el circuito', sectionId: 'ee-1-6' },
        { id: 'ee-1-1-f16', type: 'meter', q: '¿Cómo se debe conectar el amperímetro para medir corriente con el multímetro?', a: 'En SERIE, abriendo físicamente el circuito', sub: 'La corriente debe fluir a través del instrumento', sectionId: 'ee-1-6' }
    ],
    questions: [
        {
            id: 'ee-1-1-q1',
            objective: 'Conocer el origen histórico y la ley de cargas',
            concept: 'ley_cargas',
            difficulty: 'easy',
            q: 'De acuerdo con la ley fundamental de cargas eléctricas, ¿qué sucede entre dos cargas de signo opuesto (+ y −)?',
            options: ['Se repelen y se alejan', 'Se atraen mutuamente', 'Se destruyen de inmediato', 'No experimentan ninguna fuerza'],
            correct: 1
        },
        {
            id: 'ee-1-1-q2',
            objective: 'Comprender la naturaleza física de la corriente en metales',
            concept: 'electricidad_portadores',
            difficulty: 'easy',
            q: '¿Qué partículas subatómicas se desplazan a través de un alambre de cobre para formar la corriente eléctrica?',
            options: ['Los protones del núcleo', 'Los electrones libres de valencia', 'Los neutrones', 'Los átomos enteros'],
            correct: 1
        },
        {
            id: 'ee-1-1-q3',
            objective: 'Diferenciar los medios de transporte de la electricidad',
            concept: 'soluciones_ionicas',
            difficulty: 'medium',
            q: 'En una solución electrolítica (como agua con sal o ácido de batería), ¿qué transporta la corriente eléctrica?',
            options: ['Electrones libres únicamente', 'Iones positivos y negativos en movimiento', 'Burbujas de aire', 'Fotones de luz'],
            correct: 1
        },
        {
            id: 'ee-1-1-q4',
            objective: 'Diferenciar el flujo de corriente real del convencional',
            concept: 'corriente_real_convencional',
            difficulty: 'medium',
            q: '¿Hacia dónde fluyen los electrones en la corriente eléctrica REAL?',
            options: ['Del polo positivo (+) al polo negativo (−)', 'Del polo negativo (−) al polo positivo (+)', 'No tienen dirección fija', 'En círculos cerrados sin salir de la batería'],
            correct: 1
        },
        {
            id: 'ee-1-1-q5',
            objective: 'Analizar la geometría del conductor y la ley de Pouillet',
            concept: 'factores_resistencia',
            difficulty: 'medium',
            q: 'Si un cable conductor se hace el doble de largo pero mantiene el mismo grosor, su resistencia eléctrica:',
            options: ['Se reduce a la mitad', 'Se duplica', 'Permanece exactamente igual', 'Cae a cero ohmios'],
            correct: 1
        },
        {
            id: 'ee-1-1-q6',
            objective: 'Comprender la influencia del calibre o grosor en la resistencia',
            concept: 'seccion_cable',
            difficulty: 'medium',
            q: '¿Por qué los cables gruesos se usan para alimentar equipos de alto consumo como calentadores y estufas?',
            options: ['Porque al tener mayor sección transversal ofrecen menor resistencia y no se calientan', 'Porque pesan más y conducen más rápido', 'Porque almacenan más electrones dentro', 'Porque bloquean el voltaje'],
            correct: 0
        },
        {
            id: 'ee-1-1-q7',
            objective: 'Conocer las unidades fundamentales del SI',
            concept: 'magnitudes_unidades',
            difficulty: 'easy',
            q: 'La diferencia de potencial (empuje eléctrico) y la intensidad de corriente se miden respectivamente en:',
            options: ['Amperios [A] y Ohmios [Ω]', 'Voltios [V] y Amperios [A]', 'Vatios [W] y Julios [J]', 'Ohmios [Ω] y Voltios [V]'],
            correct: 1
        },
        {
            id: 'ee-1-1-q8',
            objective: 'Concientizar sobre seguridad eléctrica humana',
            concept: 'seguridad_electrica',
            difficulty: 'hard',
            q: '¿Qué nivel de corriente a través del tórax humano puede provocar fibrilación ventricular mortal?',
            options: ['1 Amperio mínimo', '50 a 100 miliamperios (0.05 a 0.1 A)', '10 microamperios', 'Cualquier voltaje superior a 5V'],
            correct: 1
        },
        {
            id: 'ee-1-1-q9',
            objective: 'Identificar fuentes de energía eléctrica continua y alterna',
            concept: 'fuentes_dc_ac',
            difficulty: 'easy',
            q: '¿Cuál de los siguientes pares contiene una fuente de Corriente Continua (DC) y una de Corriente Alterna (AC) respectivamente?',
            options: ['Batería de 9V y Tomacorriente de pared residencial', 'Tomacorriente de pared y Motor trifásico', 'Pila AA y Panel Solar', 'Alternador de planta hidroeléctrica y Dinamo'],
            correct: 0
        },
        {
            id: 'ee-1-1-q10',
            objective: 'Comprender la analogía hidráulica del circuito',
            concept: 'analogia_hidraulica',
            difficulty: 'medium',
            q: 'En la analogía hidráulica, la válvula que se abre o cierra frenando el paso del agua representa:',
            options: ['El Voltaje', 'La Resistencia', 'La Corriente', 'La Batería'],
            correct: 1
        },
        {
            id: 'ee-1-1-q11',
            objective: 'Dominar la medición de corriente con multímetro',
            concept: 'medicion_amperimetro',
            difficulty: 'medium',
            q: 'Para medir la corriente eléctrica con un multímetro digital, este debe conectarse:',
            options: [
                'En serie, abriendo físicamente el circuito para intercalar las puntas de prueba',
                'En paralelo directamente sobre los extremos de la batería',
                'Con el circuito completamente apagado y sin energía',
                'Tocando con la punta roja cualquier cable metálico'
            ],
            correct: 0
        },
        {
            id: 'ee-1-1-q12',
            objective: 'Dominar la medición segura de resistencia con multímetro',
            concept: 'medicion_ohmetro',
            difficulty: 'easy',
            q: 'Para medir la resistencia eléctrica de un componente con el multímetro en modo Óhmetro (Ω), la regla de oro es:',
            options: [
                'El circuito debe estar completamente desenergizado (apagado)',
                'El circuito debe estar conectado a su voltaje máximo',
                'Colocar el selector en la escala de 10 Amperios',
                'Usar guantes de goma sin puntas de prueba'
            ],
            correct: 0
        }
    ],
    quizConfig: { timePerQuestion: 25, requiredScorePercent: 75 }
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m1-l1-content',
                content: lessonDefinition.content,
                hasSimulator: lessonDefinition.hasSimulator
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ee-m1-l1-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        simulador: [
            createContentBlock({
                id: 'ee-m1-l1-practice',
                content: `
                    <div style="margin-bottom: 2rem;">
                        <div id="practical-lab-l1-container"></div>
                    </div>
                `,
                hasSimulator: true
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m1-l1-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions,
                quizConfig: lessonDefinition.quizConfig
            })
        ]
    }
});
