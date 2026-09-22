import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';
import BJTSimulator from '../../../components/simulators/electricity/BJTSimulator';

const lessonDefinition = {
    title: 'Transistores BJT como Interruptor y Amplificador',
    hasSimulator: true,
    content: `
        <!-- ── 10.1 Introducción al Transistor de Unión Bipolar (BJT) ── -->
        <h3 id="ee-2-10-1" style="color: #f59e0b; margin: 1.5rem 0 1rem; font-size: 1.4rem;">10.1 ¿Qué es un Transistor BJT y cuál es su Principio Físico?</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            El <strong>Transistor de Unión Bipolar</strong> (conocido por sus siglas en inglés como <strong>BJT</strong> - <em>Bipolar Junction Transistor</em>) es el componente más revolucionario en la historia de la electrónica moderna. Inventado en 1947 por John Bardeen, Walter Brattain y William Shockley en los laboratorios Bell, permitió reemplazar las voluminosas y frágiles válvulas de vacío por un dispositivo de estado sólido en miniatura.
        </p>
        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            A diferencia de un resistor que se opone pasivamente al paso de electrones, o de un diodo que solo conduce en un único sentido, el transistor es un <strong>dispositivo activo de tres terminales</strong> capaz de <strong>controlar una gran corriente eléctrica entre dos terminales principales mediante una corriente minúscula inyectada en su tercer terminal</strong>.
        </p>

        <!-- Cuadro NPN vs PNP -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
            <!-- NPN -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 18px; padding: 1.35rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                    <div style="color: #38bdf8; font-weight: 800; font-size: 1.05rem;">🔵 Transistor NPN (Más Común)</div>
                    <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 800;">Lógica Positiva (High)</span>
                </div>
                <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin-bottom: 0.75rem;">
                    Formado por un cristal Tipo P emparedado entre dos cristales Tipo N. La corriente principal fluye del <strong>Colector (C) hacia el Emisor (E)</strong> cuando se inyecta una pequeña corriente positiva en la <strong>Base (B)</strong>.
                </p>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.6rem; font-size: 0.78rem; color: #94a3b8;">
                    <strong>Modelos Típicos:</strong> 2N2222, BC547, 2N3904, BD139.<br/>
                    <strong>Nemotecnia de la flecha:</strong> La flecha en el emisor <em>"No Pone Nada"</em> (apunta hacia afuera).
                </div>
            </div>

            <!-- PNP -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(245, 158, 11, 0.35); border-radius: 18px; padding: 1.35rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                    <div style="color: #fbbf24; font-weight: 800; font-size: 1.05rem;">🟡 Transistor PNP (Complementario)</div>
                    <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 800;">Lógica Negativa (Low)</span>
                </div>
                <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin-bottom: 0.75rem;">
                    Formado por un cristal Tipo N emparedado entre dos cristales Tipo P. La corriente fluye del <strong>Emisor (E) hacia el Colector (C)</strong> cuando la Base (B) es polarizada con un potencial más bajo (hacia tierra).
                </p>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.6rem; font-size: 0.78rem; color: #94a3b8;">
                    <strong>Modelos Típicos:</strong> 2N3906, BC557, BD140.<br/>
                    <strong>Nemotecnia de la flecha:</strong> La flecha en el emisor <em>"Punta Pa'dentro"</em> (apunta hacia la base).
                </div>
            </div>
        </div>

        <!-- Placeholder Imagen: Estructura Interna y Símbolos NPN/PNP -->
        <div style="background: #0f172a; border: 2px dashed rgba(56, 189, 248, 0.4); border-radius: 16px; padding: 1.5rem; text-align: center; margin: 1.5rem 0 2rem;">
            <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">📐</div>
            <div style="color: #38bdf8; font-weight: 700; font-size: 0.95rem; margin-bottom: 0.25rem;">[ESQUEMA DIDÁCTICO: Símbolos Esquemáticos y Estructura NPN vs PNP]</div>
            <div style="color: #94a3b8; font-size: 0.8rem;">Diagrama comparativo de terminales Colector (C), Base (B), Emisor (E) y sentidos de corriente I_C, I_B, I_E</div>
        </div>

        <!-- ── 10.2 Las Tres Zonas de Operación ── -->
        <h3 id="ee-2-10-2" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">10.2 Las Tres Zonas de Operación del Transistor BJT</h3>
        <p style="margin-bottom: 1.25rem; line-height: 1.8;">
            Dependiendo de los voltajes aplicados a sus uniones Base-Emisor y Base-Colector, el transistor puede trabajar en tres regiones completamente diferenciadas:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <!-- 1. Corte -->
            <div style="background: rgba(239, 68, 68, 0.08); border: 1.5px solid rgba(239, 68, 68, 0.35); border-radius: 16px; padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div style="color: #ef4444; font-weight: 800; font-size: 1rem;">1. Región de Corte</div>
                    <span style="background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 800;">OFF (Abierto)</span>
                </div>
                <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin-bottom: 0.6rem;">
                    <strong>Condición:</strong> Voltaje Base-Emisor menor a 0.6V (no hay inyección de corriente en base, I_B = 0).
                </p>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.6rem; font-size: 0.78rem; color: #94a3b8;">
                    • <strong>Corriente de Colector:</strong> I_C ≈ 0 A.<br/>
                    • <strong>Voltaje Colector-Emisor:</strong> V_CE ≈ V_CC (toda la tensión cae en el transistor).<br/>
                    • <strong>Comportamiento:</strong> Interruptor completamente <strong>ABIERTO</strong>.
                </div>
            </div>

            <!-- 2. Zona Activa -->
            <div style="background: rgba(56, 189, 248, 0.08); border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 16px; padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div style="color: #38bdf8; font-weight: 800; font-size: 1rem;">2. Región Activa (Lineal)</div>
                    <span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 800;">AMPLIFICADOR</span>
                </div>
                <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin-bottom: 0.6rem;">
                    <strong>Condición:</strong> Unión Base-Emisor en directa (V_BE ≈ 0.7V) y Base-Colector en inversa.
                </p>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.6rem; font-size: 0.78rem; color: #94a3b8;">
                    • <strong>Ecuación Fundamental:</strong> I_C = β · I_B = h_FE · I_B.<br/>
                    • <strong>Ganancia de Corriente (β):</strong> Típicamente entre 100 y 300.<br/>
                    • <strong>Comportamiento:</strong> Amplificación de audio, ondas de radio y sensores.
                </div>
            </div>

            <!-- 3. Saturación -->
            <div style="background: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.35); border-radius: 16px; padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div style="color: #10b981; font-weight: 800; font-size: 1rem;">3. Región de Saturación</div>
                    <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 800;">ON (Cerrado)</span>
                </div>
                <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin-bottom: 0.6rem;">
                    <strong>Condición:</strong> Corriente de base abundante (I_B &gt;&gt; I_C / β), ambas uniones quedan en directa.
                </p>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.6rem; font-size: 0.78rem; color: #94a3b8;">
                    • <strong>Corriente de Colector:</strong> I_C = I_C(max) = V_CC / R_L.<br/>
                    • <strong>Voltaje Colector-Emisor:</strong> V_CE(sat) ≈ 0.1V a 0.2V.<br/>
                    • <strong>Comportamiento:</strong> Interruptor completamente <strong>CERRADO</strong>.
                </div>
            </div>
        </div>

        <!-- ── 10.3 El Transistor como Interruptor Digital y Cálculo de RB ── -->
        <h3 id="ee-2-10-3" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">10.3 El BJT como Interruptor Digital (Switching) y Cálculo de la Resistencia de Base</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            En robótica y circuitos embebidos (como Arduino o microcontroladores), los pines de salida digital solo pueden suministrar un máximo de <strong>20 mA</strong> a 5V. Si deseamos encender una carga de mayor consumo (un motor DC de 300 mA, una tira LED o una bobina de relé de 100 mA), <strong>nunca debemos conectarla directamente al microcontrolador</strong> porque se quemaría el circuito integrado.
        </p>
        <p style="margin-bottom: 1.25rem; line-height: 1.8;">
            Para esto se utiliza el transistor NPN en modo conmutación (Corte y Saturación). El procedimiento de cálculo exacto es el siguiente:
        </p>

        <!-- Receta de Cálculo RB -->
        <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <div style="color: #38bdf8; font-weight: 800; font-size: 1.05rem; margin-bottom: 0.75rem;">🧮 Metodología de Cálculo Paso a Paso para Resistencia de Base (R_B):</div>
            <ol style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.8; margin-left: 1.25rem; padding: 0;">
                <li><strong>Determinar la corriente de la carga en colector (I_C):</strong><br/>
                    <code style="color: #38bdf8;">I_C = V_CC / R_Carga</code> o la corriente nominal especificada por el fabricante (ej. motor = 200 mA).</li>
                <li><strong>Calcular la corriente de base mínima teórica (I_B_min):</strong><br/>
                    Consultar el valor mínimo de ganancia en el datasheet (<code style="color: #fbbf24;">h_FE(min)</code>, típicamente 100 para un 2N2222):<br/>
                    <code style="color: #38bdf8;">I_B_min = I_C / h_FE(min)</code></li>
                <li><strong>Aplicar el Factor de Sobremarcha (Overdrive Factor k_od):</strong><br/>
                    Para garantizar una <strong>saturación dura y rápida</strong> que minimice la disipación de calor, se multiplica I_B_min por un factor de <strong>2 a 5</strong> (o se asume una relación estándar de saturación comercial de <code>I_C / I_B = 10</code>):<br/>
                    <code style="color: #10b981;">I_B(sat) = I_B_min · 3</code></li>
                <li><strong>Aplicar la Ley de Ohm en la malla de base:</strong><br/>
                    Teniendo en cuenta que la unión Base-Emisor de silicio consume 0.7V:<br/>
                    <code style="color: #f59e0b; font-size: 1rem; font-weight: bold;">R_B = (V_IN - V_BE) / I_B(sat) = (V_IN - 0.7V) / I_B(sat)</code></li>
            </ol>
        </div>

        <!-- Ejemplo Numérico Resuelto -->
        <div style="background: rgba(16, 185, 129, 0.05); border: 1.5px solid rgba(16, 185, 129, 0.35); border-radius: 18px; padding: 1.35rem; margin-bottom: 2rem;">
            <div style="color: #10b981; font-weight: 800; font-size: 1rem; margin-bottom: 0.5rem;">📝 Ejemplo Práctico de Diseño: Encendido de un Relé de 5V (I_C = 80 mA) con Arduino (5V)</div>
            <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.7; margin-bottom: 0.5rem;">
                • Corriente requerida por la bobina del relé: <strong>I_C = 80 mA = 0.08 A</strong>.<br/>
                • Usamos un transistor NPN <strong>2N2222</strong> con ganancia mínima garantizada <strong>h_FE = 100</strong>.<br/>
                • Corriente de base mínima teórica: <code>I_B_min = 80 mA / 100 = 0.8 mA</code>.<br/>
                • Aplicamos un factor de sobremarcha de 3: <code>I_B(sat) = 0.8 mA · 3 = 2.4 mA = 0.0024 A</code>.<br/>
                • Voltaje en la resistencia de base: <code>V_RB = 5V - 0.7V = 4.3V</code>.<br/>
                • Resistencia de base teórica: <code>R_B = 4.3V / 0.0024 A = 1791 Ω</code>.<br/>
                • <strong>Valor comercial estándar recomendado:</strong> <strong>1 kΩ</strong> o <strong>1.5 kΩ</strong> a 1/4W.
            </p>
        </div>

        <!-- ── 10.4 Conmutación de Cargas Inductivas y el Diodo Flyback ── -->
        <h3 id="ee-2-10-4" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">10.4 Conmutación de Cargas Inductivas (Motores y Relés): El Diodo Flyback</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Cuando el transistor se utiliza para conmutar cargas inductivas (bobinas de relés, electroimanes, solenoides o motores DC), entra en juego un fenómeno físico peligroso llamado <strong>fuerza contraelectromotriz (Back-EMF)</strong> regido por la Ley de Lenz:
        </p>
        <div style="background: rgba(0,0,0,0.4); border-left: 4px solid #ef4444; border-radius: 0 12px 12px 0; padding: 1rem; margin-bottom: 1.25rem;">
            <div style="color: #ef4444; font-weight: 800; font-size: 0.9rem; margin-bottom: 4px;">⚠️ El Fenómeno del Pico Inductivo:</div>
            <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; margin: 0;">
                Cuando el transistor pasa abruptamente de saturación a corte, la corriente a través de la bobina intenta caer a cero instantáneamente (<code>di/dt</code> es sumamente alto y negativo). La bobina colapsa su campo magnético y genera un pico de tensión inverso de <strong>cientos de voltios</strong> (V = -L · di/dt) que perfora la unión Colector-Emisor del transistor, destruyéndolo en microsegundos.
            </p>
        </div>
        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            <strong>La Solución Universal:</strong> Conectar siempre un <strong>Diodo de Protección (Diodo Flyback / Rueda Libre)</strong> como el <strong>1N4007</strong> en <strong>antiparalelo</strong> directamente en bornes de la bobina (Cátodo franjeado hacia el positivo VCC y Ánodo hacia el colector del transistor). En régimen normal el diodo está en inversa y no estorba; al cortar la corriente, el diodo entra en directa y recircula la energía magnética de forma segura hasta disiparla en calor.
        </p>

        <!-- Placeholder Imagen: Circuito de Control de Potencia con Diodo Flyback -->
        <div style="background: #0f172a; border: 2px dashed rgba(245, 158, 11, 0.4); border-radius: 16px; padding: 1.5rem; text-align: center; margin: 1.5rem 0 2rem;">
            <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">⚡</div>
            <div style="color: #fbbf24; font-weight: 700; font-size: 0.95rem; margin-bottom: 0.25rem;">[ESQUEMA DIDÁCTICO: Conexión de Carga Inductiva con Transistor NPN y Diodo Flyback 1N4007]</div>
            <div style="color: #94a3b8; font-size: 0.8rem;">Visualización de la señal de disparo de 5V en Base a través de R_B, carga en Colector, Diodo en antiparalelo y Emisor conectado a GND común</div>
        </div>

        <!-- ── 10.5 Tabla Comparativa de Transistores Comerciales ── -->
        <h3 id="ee-2-10-5" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">10.5 Guía Rápida de Transistores Comerciales Más Populares</h3>
        <div style="overflow-x: auto; margin-bottom: 2rem;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #cbd5e1; background: rgba(15, 23, 42, 0.7); border-radius: 12px; overflow: hidden;">
                <thead>
                    <tr style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; text-align: left;">
                        <th style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.1);">Modelo</th>
                        <th style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.1);">Tipo</th>
                        <th style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.1);">V_CEO (Máx)</th>
                        <th style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.1);">I_C (Máx)</th>
                        <th style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.1);">Ganancia β (h_FE)</th>
                        <th style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.1);">Aplicación Típica</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px; font-weight: bold; color: #38bdf8;">2N2222A</td>
                        <td style="padding: 10px 14px;">NPN</td>
                        <td style="padding: 10px 14px;">40V</td>
                        <td style="padding: 10px 14px; color: #10b981; font-weight: bold;">800 mA</td>
                        <td style="padding: 10px 14px;">100 – 300</td>
                        <td style="padding: 10px 14px;">Conmutación rápida, relés, motores pequeños</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px; font-weight: bold; color: #38bdf8;">BC547</td>
                        <td style="padding: 10px 14px;">NPN</td>
                        <td style="padding: 10px 14px;">45V</td>
                        <td style="padding: 10px 14px;">100 mA</td>
                        <td style="padding: 10px 14px;">110 – 800</td>
                        <td style="padding: 10px 14px;">Preamplificación de audio, sensores analógicos</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px; font-weight: bold; color: #fbbf24;">BC557</td>
                        <td style="padding: 10px 14px;">PNP</td>
                        <td style="padding: 10px 14px;">-45V</td>
                        <td style="padding: 10px 14px;">-100 mA</td>
                        <td style="padding: 10px 14px;">125 – 800</td>
                        <td style="padding: 10px 14px;">Conmutación por nivel bajo (Active-Low)</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px; font-weight: bold; color: #38bdf8;">BD139</td>
                        <td style="padding: 10px 14px;">NPN</td>
                        <td style="padding: 10px 14px;">80V</td>
                        <td style="padding: 10px 14px; color: #10b981; font-weight: bold;">1.5 A</td>
                        <td style="padding: 10px 14px;">40 – 250</td>
                        <td style="padding: 10px 14px;">Mediana potencia, drivers de audio y motores</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 14px; font-weight: bold; color: #f59e0b;">TIP120</td>
                        <td style="padding: 10px 14px;">NPN Darlington</td>
                        <td style="padding: 10px 14px;">60V</td>
                        <td style="padding: 10px 14px; color: #10b981; font-weight: bold;">5.0 A</td>
                        <td style="padding: 10px 14px; color: #fbbf24; font-weight: bold;">1000+</td>
                        <td style="padding: 10px 14px;">Cargas de alta potencia, actuadores y solenoides</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
};

export const lessonData = defineLesson({
    title: lessonDefinition.title,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m2-l10-content',
                content: lessonDefinition.content
            })
        ],
        flashcards: [
            createFlashcardsBlock({
                id: 'ee-m2-l10-flashcards',
                title: 'Flashcards Nemotécnicas: Transistores BJT',
                cards: [
                    {
                        id: 'ee-m2-l10-fc1',
                        front: '¿Cuáles son los tres terminales de un transistor BJT?',
                        back: 'Base (B), Colector (C) y Emisor (E).'
                    },
                    {
                        id: 'ee-m2-l10-fc2',
                        front: '¿Qué relación fundamental existe entre las tres corrientes del BJT?',
                        back: 'I_E = I_B + I_C (La corriente de emisor es la suma exacta de la corriente de base más la de colector).'
                    },
                    {
                        id: 'ee-m2-l10-fc3',
                        front: '¿Qué representa el parámetro β (o h_FE) en un transistor bipolar?',
                        back: 'Es la ganancia de corriente en emisor común en región activa, definida como la relación β = I_C / I_B.'
                    },
                    {
                        id: 'ee-m2-l10-fc4',
                        front: '¿Qué ocurre con el transistor en la región de corte?',
                        back: 'La corriente de base es cero (I_B = 0), por lo que no circula corriente por el colector (I_C ≈ 0) y actúa como un interruptor ABIERTO.'
                    },
                    {
                        id: 'ee-m2-l10-fc5',
                        front: '¿Qué ocurre con el transistor en la región de saturación?',
                        back: 'Se inyecta abundante corriente en base, el voltaje V_CE cae a su mínimo (0.1V - 0.2V) y actúa como un interruptor CERRADO.'
                    },
                    {
                        id: 'ee-m2-l10-fc6',
                        front: '¿Cuál es el voltaje típico de umbral de la unión Base-Emisor (V_BE) en silicio?',
                        back: 'Aproximadamente 0.7V (0.6V a 0.7V) al estar polarizada en sentido directo.'
                    },
                    {
                        id: 'ee-m2-l10-fc7',
                        front: '¿Por qué se necesita una resistencia en serie con la base (R_B)?',
                        back: 'Porque sin R_B, la unión Base-Emisor se comportaría como un diodo en directa conectado a la fuente, absorbiendo corriente destructiva hasta quemarse.'
                    },
                    {
                        id: 'ee-m2-l10-fc8',
                        front: '¿Cuál es la función del diodo Flyback en paralelo con una bobina de relé o motor?',
                        back: 'Proteger al transistor absorbiendo y disipando el destructivo pico de alto voltaje generado por la autoinducción al cortar la corriente (Ley de Lenz).'
                    },
                    {
                        id: 'ee-m2-l10-fc9',
                        front: '¿Cómo se diferencia un transistor NPN de un PNP según la flecha en su símbolo esquemático?',
                        back: 'En el NPN la flecha en el emisor apunta hacia afuera (No Pone Nada), mientras que en el PNP apunta hacia adentro (Punta Pa\'dentro).'
                    },
                    {
                        id: 'ee-m2-l10-fc10',
                        front: '¿Qué es un par Darlington (como el TIP120)?',
                        back: 'Es la combinación interna de dos transistores en cascada que multiplica sus ganancias individuales, logrando ganancias β superiores a 1000.'
                    }
                ]
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m2-l10-quiz',
                title: 'Evaluación: Transistores BJT y Conmutación',
                questions: [
                    {
                        id: 'ee-m2-l10-q1',
                        objective: 'Identificar terminales y tipo de transistor',
                        concept: 'anatomia_bjt',
                        difficulty: 'easy',
                        q: '¿Cuál de los siguientes es el terminal que controla el paso de corriente entre los otros dos en un transistor BJT?',
                        options: [
                            'La Base (B)',
                            'El Colector (C)',
                            'El Emisor (E)',
                            'El Cátodo (K)'
                        ],
                        correct: 0,
                        feedback: '¡Exacto! La Base es el terminal de control por donde se inyecta la pequeña corriente que modula la corriente principal entre Colector y Emisor.'
                    },
                    {
                        id: 'ee-m2-l10-q2',
                        objective: 'Reconocer zonas de trabajo del BJT',
                        concept: 'zonas_operacion',
                        difficulty: 'medium',
                        q: 'Para usar un transistor como un interruptor completamente encendido (ON / cerrado), ¿en qué región debe operar?',
                        options: [
                            'En región de Saturación',
                            'En región de Corte',
                            'En región Activa o Lineal',
                            'En región de Ruptura Zener'
                        ],
                        correct: 0,
                        feedback: '¡Correcto! En saturación, la unión Colector-Emisor presenta una caída mínima de voltaje (V_CE ≈ 0.2V), conduciendo la máxima corriente permitida por la carga.'
                    },
                    {
                        id: 'ee-m2-l10-q3',
                        objective: 'Comprender la ganancia de corriente beta',
                        concept: 'ganancia_beta',
                        difficulty: 'medium',
                        q: 'Si un transistor en región activa tiene un h_FE = 150 y se le inyecta una corriente de base I_B = 2 mA, ¿cuál será la corriente de colector I_C?',
                        options: [
                            '300 mA (0.3 A)',
                            '75 mA',
                            '152 mA',
                            '3 mA'
                        ],
                        correct: 0,
                        feedback: '¡Excelente! En región activa I_C = β · I_B = 150 · 2 mA = 300 mA.'
                    },
                    {
                        id: 'ee-m2-l10-q4',
                        objective: 'Calcular resistencia de base',
                        concept: 'calculo_rb',
                        difficulty: 'hard',
                        q: 'Deseas saturar un transistor NPN con una señal de 5V. Si requieres una corriente de base de I_B = 5 mA y consideras V_BE = 0.7V, ¿cuál es el valor de R_B?',
                        options: [
                            '860 Ω (se puede usar comercial de 820 Ω o 1 kΩ)',
                            '1000 Ω exactos',
                            '140 Ω',
                            '4300 Ω'
                        ],
                        correct: 0,
                        feedback: '¡Correcto! R_B = (V_IN - V_BE) / I_B = (5V - 0.7V) / 0.005 A = 4.3V / 0.005 A = 860 Ω.'
                    },
                    {
                        id: 'ee-m2-l10-q5',
                        objective: 'Conocer la función del diodo flyback',
                        concept: 'diodo_flyback',
                        difficulty: 'medium',
                        q: '¿Por qué es indispensable colocar un diodo 1N4007 en antiparalelo con la bobina de un relé comandado por un transistor?',
                        options: [
                            'Para absorber el pico inductivo destructivo (fuerza contraelectromotriz) al apagar la bobina',
                            'Para aumentar la velocidad de giro del relé',
                            'Para reducir la resistencia de base',
                            'Para convertir la corriente alterna en continua'
                        ],
                        correct: 0,
                        feedback: '¡Muy bien! Las bobinas generan picos inductivos de alto voltaje según la Ley de Lenz cuando se corta la corriente. El diodo flyback recircula esta energía protegiendo al transistor.'
                    },
                    {
                        id: 'ee-m2-l10-q6',
                        objective: 'Diferenciar NPN de PNP',
                        concept: 'npn_vs_pnp',
                        difficulty: 'medium',
                        q: '¿Cuál es la diferencia principal en la activación de un transistor NPN frente a uno PNP?',
                        options: [
                            'El NPN se satura inyectando voltaje positivo (nivel alto) en la base, mientras que el PNP se satura llevando su base a un nivel bajo (GND)',
                            'El NPN solo sirve para corriente alterna y el PNP para continua',
                            'El PNP no tiene terminal de colector',
                            'El NPN no requiere resistencia de base'
                        ],
                        correct: 0,
                        feedback: '¡Exacto! El NPN activa su carga cuando la Base es ~0.7V más positiva que el Emisor, mientras que el PNP activa cuando la Base es ~0.7V más negativa que el Emisor.'
                    },
                    {
                        id: 'ee-m2-l10-q7',
                        objective: 'Comprender la región de corte',
                        concept: 'corte_bjt',
                        difficulty: 'easy',
                        q: 'Cuando un transistor BJT NPN está en corte, el voltaje medido entre Colector y Emisor (V_CE) es aproximadamente igual a:',
                        options: [
                            'El voltaje total de la fuente de alimentación (V_CC)',
                            '0.2 Voltios',
                            '0.7 Voltios',
                            '0 Voltios exactos'
                        ],
                        correct: 0,
                        feedback: '¡Correcto! Al estar en corte no circula corriente por la carga, por lo que no hay caída en ella y todo el voltaje de la fuente V_CC se mide en los extremos Colector-Emisor.'
                    },
                    {
                        id: 'ee-m2-l10-q8',
                        objective: 'Identificar el transistor Darlington',
                        concept: 'darlington',
                        difficulty: 'medium',
                        q: '¿Cuál es la principal ventaja de un transistor Darlington como el TIP120 frente a un transistor estándar como el 2N2222?',
                        options: [
                            'Posee una ganancia de corriente ultra-alta (β > 1000) permitiendo conmutar varios amperios con corrientes de base ínfimas',
                            'No genera calor bajo ninguna circunstancia',
                            'No necesita conexión a tierra (GND)',
                            'Tiene un voltaje V_BE de 0 Voltios'
                        ],
                        correct: 0,
                        feedback: '¡Excelente! El arreglo Darlington integra dos transistores en cascada multiplicando sus ganancias (β_total = β1 · β2), ideal para cargas pesadas como grandes motores y solenoides.'
                    },
                    {
                        id: 'ee-m2-l10-q9',
                        objective: 'Verificar especificaciones máximas de datasheet',
                        concept: 'datasheet_bjt',
                        difficulty: 'hard',
                        q: 'Si un motor DC consume 1.2 Amperios de corriente continua, ¿cuál de los siguientes transistores es el MÁS adecuado para controlarlo de forma segura?',
                        options: [
                            'BD139 (I_C máx = 1.5 A) o TIP120 (I_C máx = 5 A)',
                            'BC547 (I_C máx = 100 mA)',
                            '2N3904 (I_C máx = 200 mA)',
                            'Diodo Zener 5.1V'
                        ],
                        correct: 0,
                        feedback: '¡Correcto! El BC547 o 2N3904 se destruirían de inmediato al tener una corriente máxima admisible inferior a 200 mA. Se requiere un transistor de potencia o mediana potencia como el BD139 o TIP120.'
                    },
                    {
                        id: 'ee-m2-l10-q10',
                        objective: 'Seguridad en circuitos con microcontroladores',
                        concept: 'acoplamiento_mcu',
                        difficulty: 'medium',
                        q: '¿Por qué nunca se debe conectar un motor DC de 5V directamente a un pin de salida digital de Arduino sin transistor intermedio?',
                        options: [
                            'Porque el motor demanda más corriente de la que el pin de Arduino puede suministrar (máx 20 mA), arriesgando quemar el microcontrolador',
                            'Porque Arduino solo genera voltajes negativos',
                            'Porque los motores solo funcionan con corriente alterna',
                            'Porque el motor no encenderá si la señal es digital'
                        ],
                        correct: 0,
                        feedback: '¡Excelente! Los pines de un microcontrolador son líneas de señal lógica de baja potencia. Para mover actuadores de potencia siempre debe emplearse una etapa de conmutación como un transistor o relé.'
                    }
                ],
                quizConfig: { timePerQuestion: 30, requiredScorePercent: 80 }
            })
        ],
        simulador: [
            {
                id: 'ee-m2-l10-bjt-sim',
                type: 'custom',
                component: BJTSimulator,
                title: 'Simulador BJT — Conecta el Transistor'
            }
        ]
    }
});
