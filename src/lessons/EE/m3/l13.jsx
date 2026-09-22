import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Decodificadores BCD y Visualización en Displays de 7 Segmentos (CD4511)',
    hasSimulator: true,
    content: `
        <!-- ── 13.1 Anatomía del Display de 7 Segmentos ── -->
        <h3 id="ee-3-13-1" style="color: #f59e0b; margin: 1.5rem 0 1rem; font-size: 1.4rem;">13.1 Anatomía y Funcionamiento del Display de 7 Segmentos</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            El <strong>display de 7 segmentos</strong> es el dispositivo optoelectrónico estándar utilizado para representar visualmente dígitos numéricos del <strong>0 al 9</strong> (y algunas letras del sistema hexadecimal de la A a la F).
        </p>
        <p style="margin-bottom: 1.5rem; line-height: 1.8;">
            Internamente está compuesto por <strong>8 diodos LED independientes</strong>: siete de ellos dispuestos en forma de ocho rectangular identificados convencionalmente con las letras minúsculas <strong>a, b, c, d, e, f, g</strong> en sentido horario, más un octavo LED para el punto decimal (<strong>DP</strong> - <em>Decimal Point</em>).
        </p>

        <!-- Cuadro Cátodo Común vs Ánodo Común -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
            <!-- Cátodo Común -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(16, 185, 129, 0.35); border-radius: 18px; padding: 1.35rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                    <div style="color: #10b981; font-weight: 800; font-size: 1.05rem;">🟢 Display de Cátodo Común (CC)</div>
                    <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 800;">Activo con HIGH (+5V)</span>
                </div>
                <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin-bottom: 0.75rem;">
                    Todos los terminales negativos (cátodos) de los 8 LEDs internos están físicamente unidos a un único pin común que se conecta a <strong>Tierra (GND / 0V)</strong>.
                </p>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.6rem; font-size: 0.78rem; color: #94a3b8;">
                    • <strong>Encendido:</strong> Para encender un segmento se aplica un <strong>1 lógico (+5V)</strong> en su pin correspondiente.<br/>
                    • <strong>Driver Compatible:</strong> <strong>CD4511</strong> / 74LS48.
                </div>
            </div>

            <!-- Ánodo Común -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(245, 158, 11, 0.35); border-radius: 18px; padding: 1.35rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                    <div style="color: #fbbf24; font-weight: 800; font-size: 1.05rem;">🟡 Display de Ánodo Común (CA)</div>
                    <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 800;">Activo con LOW (0V)</span>
                </div>
                <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin-bottom: 0.75rem;">
                    Todos los terminales positivos (ánodos) de los 8 LEDs están unidos al pin común conectado a <strong>+5V (V_CC)</strong>.
                </p>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.6rem; font-size: 0.78rem; color: #94a3b8;">
                    • <strong>Encendido:</strong> Para encender un segmento se aplica un <strong>0 lógico (GND)</strong> en su pin correspondiente.<br/>
                    • <strong>Driver Compatible:</strong> <strong>74LS47</strong>.
                </div>
            </div>
        </div>

        <!-- Placeholder Imagen: Disposición de Segmentos a-g y Pinout -->
        <div style="background: #0f172a; border: 2px dashed rgba(56, 189, 248, 0.4); border-radius: 16px; padding: 1.5rem; text-align: center; margin: 1.5rem 0 2rem;">
            <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">📟</div>
            <div style="color: #38bdf8; font-weight: 700; font-size: 0.95rem; margin-bottom: 0.25rem;">[ESQUEMA DIDÁCTICO: Nomenclatura de Segmentos a, b, c, d, e, f, g y Cátodo Común]</div>
            <div style="color: #94a3b8; font-size: 0.8rem;">Diagrama de identificación de terminales en encapsulado estándar de 10 pines (Pines 3 y 8 como Cátodo Común)</div>
        </div>

        <!-- ── 13.2 El Decodificador/Driver BCD a 7 Segmentos: CI CD4511 ── -->
        <h3 id="ee-3-13-2" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">13.2 El Circuito Integrado CD4511 (Tecnología CMOS)</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            El <strong>CD4511</strong> es un circuito integrado de la familia CMOS que integra tres funciones en un solo chip de 16 pines (DIP-16):
        </p>
        <ol style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.8; margin-left: 1.25rem; padding: 0; margin-bottom: 1.5rem;">
            <li><strong>Latch (Registro de Almacenamiento):</strong> Permite congelar o almacenar temporalmente el dígito binario de entrada.</li>
            <li><strong>Decodificador Lógico BCD:</strong> Traduce la combinación de 4 bits (0 a 9) a los patrones correspondientes de los segmentos a-g.</li>
            <li><strong>Driver de Salida con Transistores NPN:</strong> Entrega hasta <strong>25 mA por segmento</strong> en nivel ALTO (+5V), ideal para excitar directamente displays de cátodo común.</li>
        </ol>

        <!-- Distribución de Pines CD4511 -->
        <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 18px; padding: 1.5rem; margin-bottom: 2rem;">
            <div style="color: #38bdf8; font-weight: 800; font-size: 1.1rem; margin-bottom: 1rem;">📌 Pines Principales del CI CD4511 (DIP-16):</div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; font-size: 0.85rem; color: #cbd5e1;">
                <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 0.9rem;">
                    <strong style="color: #38bdf8;">Entradas de Datos BCD (4 bits):</strong><br/>
                    • Pin 7: <strong>Entrada A</strong> (Bit menos significativo, peso 1)<br/>
                    • Pin 1: <strong>Entrada B</strong> (Bit con peso 2)<br/>
                    • Pin 2: <strong>Entrada C</strong> (Bit con peso 4)<br/>
                    • Pin 6: <strong>Entrada D</strong> (Bit más significativo, peso 8)<br/>
                    <strong style="color: #fbbf24;">Alimentación:</strong><br/>
                    • Pin 16: <strong>V_DD (+5V a +15V)</strong> | Pin 8: <strong>V_SS (GND)</strong>
                </div>
                <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 0.9rem;">
                    <strong style="color: #10b981;">Salidas a los Segmentos (a – g):</strong><br/>
                    • Pin 13: <strong>a</strong> | Pin 12: <strong>b</strong> | Pin 11: <strong>c</strong><br/>
                    • Pin 10: <strong>d</strong> | Pin 9: <strong>e</strong> | Pin 15: <strong>f</strong> | Pin 14: <strong>g</strong><br/>
                    <strong style="color: #ef4444;">Pines de Control Especiales (Activos en BAJO):</strong><br/>
                    • Pin 3: <strong>LT (Lamp Test)</strong><br/>
                    • Pin 4: <strong>BL (Blanking / Apagado)</strong><br/>
                    • Pin 5: <strong>LE / Strobe (Latch Enable)</strong>
                </div>
            </div>
        </div>

        <!-- ── 13.3 Pines de Control Especiales del CD4511 ── -->
        <h3 id="ee-3-13-3" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">13.3 Los Tres Pines de Control Especiales: LT, BL y LE</h3>
        <p style="margin-bottom: 1.25rem; line-height: 1.8;">
            Para que el CD4511 opere en modo de decodificación normal, sus tres pines de control deben configurarse adecuadamente:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <!-- LT -->
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 16px; padding: 1.25rem;">
                <div style="color: #38bdf8; font-weight: 800; font-size: 1rem; margin-bottom: 0.4rem;">💡 Pin 3: Lamp Test (LT)</div>
                <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin: 0;">
                    • <strong>Conectado a GND (0V):</strong> Enciende <strong>TODOS</strong> los segmentos simultáneamente (muestra un "8" a plena luz) para probar que ningún LED esté quemado.<br/>
                    • <strong>En Operación Normal:</strong> Debe conectarse firmemente a <strong>+5V (V_CC)</strong>.
                </p>
            </div>

            <!-- BL -->
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 16px; padding: 1.25rem;">
                <div style="color: #fbbf24; font-weight: 800; font-size: 1rem; margin-bottom: 0.4rem;">🌑 Pin 4: Blanking (BL)</div>
                <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin: 0;">
                    • <strong>Conectado a GND (0V):</strong> Apaga completamente todos los segmentos (incluso si hay datos en la entrada). Útil para modulación de brillo con PWM o supresión de ceros a la izquierda.<br/>
                    • <strong>En Operación Normal:</strong> Debe conectarse a <strong>+5V (V_CC)</strong>.
                </p>
            </div>

            <!-- LE -->
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 16px; padding: 1.25rem;">
                <div style="color: #10b981; font-weight: 800; font-size: 1rem; margin-bottom: 0.4rem;">🔒 Pin 5: Latch Enable (LE)</div>
                <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin: 0;">
                    • <strong>Nivel BAJO (0V / GND):</strong> Modo transparente. El display actualiza en vivo cualquier cambio en las entradas BCD.<br/>
                    • <strong>Nivel ALTO (+5V):</strong> Modo retención / congelamiento. El display almacena y mantiene fijo el último número mostrado sin importar cambios posteriores.
                </p>
            </div>
        </div>

        <!-- ── 13.4 Cálculo de las Resistencias Limitadoras de Segmento ── -->
        <h3 id="ee-3-13-4" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">13.4 Dimensionamiento de las Resistencias Limitadoras de Segmento</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            <strong>¡Regla de Oro Crítica:</strong> Nunca se debe conectar un display de 7 segmentos directamente a las salidas del decodificador sin resistencias limitadoras. Cada uno de los 7 segmentos (a, b, c, d, e, f, g) <strong>debe tener su propia resistencia individual en serie</strong>. Si se coloca una sola resistencia en el cátodo común, el brillo del display variará drásticamente según la cantidad de segmentos encendidos (el número "1" brillará el cuádruple que el número "8").
        </p>

        <div style="background: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.35); border-radius: 18px; padding: 1.35rem; margin-bottom: 2rem;">
            <div style="color: #10b981; font-weight: 800; font-size: 1.05rem; margin-bottom: 0.5rem;">🧮 Fórmula de Cálculo de Resistencia por Segmento:</div>
            <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.7; margin-bottom: 0.5rem;">
                <code style="color: #f59e0b; font-size: 1.05rem; font-weight: bold;">R_seg = (V_CC - V_sat - V_F) / I_F</code>
            </p>
            <p style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin: 0;">
                • Voltaje de alimentación: <strong>V_CC = 5.0 V</strong>.<br/>
                • Caída interna en transistores del CD4511: <strong>V_sat ≈ 0.4 V</strong>.<br/>
                • Voltaje directo del LED rojo del display: <strong>V_F ≈ 2.0 V</strong>.<br/>
                • Corriente deseada por segmento para brillo óptimo: <strong>I_F = 10 mA = 0.010 A</strong>.<br/>
                • <code>R_seg = (5.0V - 0.4V - 2.0V) / 0.010 A = 2.6V / 0.010 A = 260 Ω</code>.<br/>
                • <strong>Valores comerciales recomendados:</strong> <strong>220 Ω, 270 Ω o 330 Ω</strong> a 1/4W (7 unidades).
            </p>
        </div>

        <!-- ── 13.5 Tabla de Verdad BCD a 7 Segmentos ── -->
        <h3 id="ee-3-13-5" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">13.5 Tabla de Decodificación BCD a Segmentos a-g</h3>
        <div style="overflow-x: auto; margin-bottom: 2rem;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #cbd5e1; background: rgba(15, 23, 42, 0.7); border-radius: 12px; overflow: hidden;">
                <thead>
                    <tr style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; text-align: center;">
                        <th style="padding: 10px 14px; text-align: left;">Dígito</th>
                        <th style="padding: 10px 14px;">Entrada BCD (D C B A)</th>
                        <th style="padding: 10px 14px;">a</th>
                        <th style="padding: 10px 14px;">b</th>
                        <th style="padding: 10px 14px;">c</th>
                        <th style="padding: 10px 14px;">d</th>
                        <th style="padding: 10px 14px;">e</th>
                        <th style="padding: 10px 14px;">f</th>
                        <th style="padding: 10px 14px;">g</th>
                        <th style="padding: 10px 14px; text-align: right;">Visual en Display</th>
                    </tr>
                </thead>
                <tbody style="text-align: center;">
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">0</td><td>0 0 0 0</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>0</td><td style="text-align: right; font-weight: bold; color: #10b981;">[ 0 ]</td></tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">1</td><td>0 0 0 1</td><td>0</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td style="text-align: right; font-weight: bold; color: #10b981;">[ 1 ]</td></tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">2</td><td>0 0 1 0</td><td>1</td><td>1</td><td>0</td><td>1</td><td>1</td><td>0</td><td>1</td><td style="text-align: right; font-weight: bold; color: #10b981;">[ 2 ]</td></tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">3</td><td>0 0 1 1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td><td>1</td><td style="text-align: right; font-weight: bold; color: #10b981;">[ 3 ]</td></tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">4</td><td>0 1 0 0</td><td>0</td><td>1</td><td>1</td><td>0</td><td>0</td><td>1</td><td>1</td><td style="text-align: right; font-weight: bold; color: #10b981;">[ 4 ]</td></tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">5</td><td>0 1 0 1</td><td>1</td><td>0</td><td>1</td><td>1</td><td>0</td><td>1</td><td>1</td><td style="text-align: right; font-weight: bold; color: #10b981;">[ 5 ]</td></tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">6</td><td>0 1 1 0</td><td>1</td><td>0</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td style="text-align: right; font-weight: bold; color: #10b981;">[ 6 ]</td></tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">7</td><td>0 1 1 1</td><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td style="text-align: right; font-weight: bold; color: #10b981;">[ 7 ]</td></tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">8</td><td>1 0 0 0</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td style="text-align: right; font-weight: bold; color: #10b981;">[ 8 ]</td></tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding: 8px 14px; text-align: left; font-weight: bold; color: #38bdf8;">9</td><td>1 0 0 1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>0</td><td>1</td><td>1</td><td style="text-align: right; font-weight: bold; color: #10b981;">[ 9 ]</td></tr>
                    <tr style="color: #94a3b8;"><td style="padding: 8px 14px; text-align: left;">10 – 15</td><td>Entradas no BCD</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td style="text-align: right;">[ Apagado ]</td></tr>
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
                id: 'ee-m3-l13-content',
                content: lessonDefinition.content
            })
        ],
        flashcards: [
            createFlashcardsBlock({
                id: 'ee-m3-l13-flashcards',
                title: 'Flashcards Nemotécnicas: Decodificador CD4511',
                cards: [
                    {
                        id: 'ee-m3-l13-fc1',
                        front: '¿Cuál es la diferencia fundamental entre un display de Cátodo Común y uno de Ánodo Común?',
                        back: 'En Cátodo Común todos los cátodos se unen a GND (se enciende con nivel ALTO / +5V); en Ánodo Común todos los ánodos se unen a VCC (se enciende con nivel BAJO / 0V).'
                    },
                    {
                        id: 'ee-m3-l13-fc2',
                        front: '¿Para qué tipo de display está diseñado específicamente el CI CD4511?',
                        back: 'Para displays de CÁTODO COMÚN, ya que sus salidas entregan nivel ALTO (+5V) a través de transistores NPN.'
                    },
                    {
                        id: 'ee-m3-l13-fc3',
                        front: '¿Cuáles son las 4 entradas de datos del CD4511 y sus respectivos pesos binarios?',
                        back: 'Entrada A (peso 1), Entrada B (peso 2), Entrada C (peso 4) y Entrada D (peso 8).'
                    },
                    {
                        id: 'ee-m3-l13-fc4',
                        front: '¿Qué función cumple el Pin 3 (Lamp Test - LT) en el CD4511?',
                        back: 'Al conectarse a GND enciende todos los segmentos para comprobar que ningún LED del display esté quemado. En uso normal se conecta a +5V.'
                    },
                    {
                        id: 'ee-m3-l13-fc5',
                        front: '¿Qué función cumple el Pin 4 (Blanking - BL) en el CD4511?',
                        back: 'Al conectarse a GND apaga completamente el display. Permite modular el brillo con PWM o apagar ceros no significativos.'
                    },
                    {
                        id: 'ee-m3-l13-fc6',
                        front: '¿Qué función cumple el Pin 5 (Latch Enable - LE) en el CD4511?',
                        back: 'En nivel ALTO congela o memoriza el número actual en pantalla; en nivel BAJO (GND) actualiza en vivo según las entradas.'
                    },
                    {
                        id: 'ee-m3-l13-fc7',
                        front: '¿Por qué es un error grave colocar una sola resistencia en el pin común en vez de 7 resistencias individuales?',
                        back: 'Porque la corriente total variaría según el número mostrado, haciendo que el dígito 1 brille intensamente y el dígito 8 se vea extremadamente tenue.'
                    },
                    {
                        id: 'ee-m3-l13-fc8',
                        front: '¿Qué valor comercial de resistencia se recomienda típicamente para cada segmento a 5V?',
                        back: 'Entre 220 Ω y 330 Ω (1/4 W), limitando la corriente a un rango seguro y brillante de 10 a 15 mA por segmento.'
                    },
                    {
                        id: 'ee-m3-l13-fc9',
                        front: '¿Qué muestra el CD4511 cuando recibe una combinación binaria inválida (del 10 al 15 decimal)?',
                        back: 'Apaga completamente todos los segmentos (Display en blanco), protegiendo la legibilidad del sistema decimal.'
                    },
                    {
                        id: 'ee-m3-l13-fc10',
                        front: '¿Qué segmentos deben encenderse para representar el dígito número "7"?',
                        back: 'Únicamente los segmentos a, b y c.'
                    }
                ]
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m3-l13-quiz',
                title: 'Evaluación: Decodificadores y Displays 7 Segmentos',
                questions: [
                    {
                        id: 'ee-m3-l13-q1',
                        objective: 'Identificar tipo de display para CD4511',
                        concept: 'tipo_display_cd4511',
                        difficulty: 'easy',
                        q: 'El circuito integrado CD4511 está especialmente diseñado para controlar displays de:',
                        options: [
                            'Cátodo Común (con el pin común conectado a GND)',
                            'Ánodo Común (con el pin común a +12V)',
                            'Cristal líquido pasivo sin polarizar',
                            'Matriz de puntos RGB'
                        ],
                        correct: 0,
                        feedback: '¡Exacto! El CD4511 suministra voltaje positivo (+5V) en sus salidas activas, por lo que requiere un display donde los cátodos compartan la conexión a tierra (GND).'
                    },
                    {
                        id: 'ee-m3-l13-q2',
                        objective: 'Identificar entradas BCD y pesos',
                        concept: 'entradas_bcd',
                        difficulty: 'medium',
                        q: 'Para mostrar el dígito "5" en el display conectado al CD4511, ¿qué combinación de niveles lógicos debe aplicarse en las entradas (D, C, B, A)?',
                        options: [
                            'D=0, C=1, B=0, A=1 (0101 en binario = 4 + 1 = 5)',
                            'D=1, C=0, B=1, A=0',
                            'D=0, C=0, B=1, A=1',
                            'D=1, C=1, B=1, A=1'
                        ],
                        correct: 0,
                        feedback: '¡Correcto! El número decimal 5 se codifica en binario BCD como 0101 (C=1 con peso 4 y A=1 con peso 1).'
                    },
                    {
                        id: 'ee-m3-l13-q3',
                        objective: 'Configuración de pines de control en uso normal',
                        concept: 'pines_control_normal',
                        difficulty: 'hard',
                        q: 'Para que el CD4511 funcione en modo normal (decodificando en vivo sin congelar ni apagar la pantalla), ¿cómo deben conectarse los pines LT (Pin 3), BL (Pin 4) y LE (Pin 5)?',
                        options: [
                            'LT a +5V, BL a +5V, y LE a GND (0V)',
                            'Los tres pines a GND',
                            'Los tres pines a +5V',
                            'LT a GND, BL a +5V, y LE a +5V'
                        ],
                        correct: 0,
                        feedback: '¡Excelente! LT y BL son activos en BAJO (por lo que van a +5V para no forzar prueba ni apagado) y LE va a GND para permitir el paso continuo de datos.'
                    },
                    {
                        id: 'ee-m3-l13-q4',
                        objective: 'Comprender el pin Lamp Test',
                        concept: 'lamp_test',
                        difficulty: 'easy',
                        q: '¿Qué sucede si conectas accidentalmente el Pin 3 (LT - Lamp Test) a GND en un circuito con CD4511?',
                        options: [
                            'El display encenderá todos sus segmentos formando el número "8", ignorando las entradas BCD',
                            'El circuito integrado se quemará de inmediato',
                            'El display se apagará por completo',
                            'El contador comenzará a contar hacia atrás'
                        ],
                        correct: 0,
                        feedback: '¡Correcto! La función Lamp Test fuerza el encendido de los 7 segmentos simultáneamente para verificar el estado de los LEDs.'
                    },
                    {
                        id: 'ee-m3-l13-q5',
                        objective: 'Comprender el pin Latch Enable',
                        concept: 'latch_enable',
                        difficulty: 'medium',
                        q: 'En un instrumento digital de medición, ¿para qué sirve poner el Pin 5 (LE) del CD4511 en nivel ALTO (+5V)?',
                        options: [
                            'Para congelar y mantener fija la lectura en pantalla mientras el contador interno sigue midiendo',
                            'Para resetear el sistema a cero',
                            'Para aumentar la velocidad de parpadeo',
                            'Para apagar los LEDs y ahorrar batería'
                        ],
                        correct: 0,
                        feedback: '¡Muy bien! El Latch interno almacena el estado de las entradas en el momento de la transición a HIGH, manteniendo la lectura estable para el usuario.'
                    },
                    {
                        id: 'ee-m3-l13-q6',
                        objective: 'Conocer segmentos activos por dígito',
                        concept: 'segmentos_digito_cero',
                        difficulty: 'easy',
                        q: 'Para representar el dígito "0" en un display de 7 segmentos, ¿cuál es el único segmento que debe permanecer APAGADO?',
                        options: [
                            'El segmento central "g"',
                            'El segmento superior "a"',
                            'El segmento inferior "d"',
                            'El segmento vertical "b"'
                        ],
                        correct: 0,
                        feedback: '¡Exacto! El dígito cero enciende el contorno exterior completo (a, b, c, d, e, f) y mantiene apagada la barra horizontal central (g).'
                    },
                    {
                        id: 'ee-m3-l13-q7',
                        objective: 'Calcular resistencia limitadora',
                        concept: 'calculo_resistencia_segmento',
                        difficulty: 'hard',
                        q: 'Deseas alimentar los segmentos rojos de un display (V_F = 1.8V) desde un CD4511 alimentado a 5V (caída interna V_sat = 0.4V). Si buscas una corriente de 10 mA por segmento, ¿qué resistencia debes colocar?',
                        options: [
                            '280 Ω (usar comercial de 270 Ω o 330 Ω)',
                            '1000 Ω',
                            '47 Ω',
                            '10 kΩ'
                        ],
                        correct: 0,
                        feedback: '¡Correcto! R = (5V - 0.4V - 1.8V) / 0.010 A = 2.8V / 0.010 A = 280 Ω.'
                    },
                    {
                        id: 'ee-m3-l13-q8',
                        objective: 'Explicar por qué no usar una sola resistencia en común',
                        concept: 'resistencia_individual_vs_comun',
                        difficulty: 'medium',
                        q: '¿Por qué no es recomendable colocar una única resistencia en el pin común del display en vez de 7 resistencias individuales?',
                        options: [
                            'Porque la corriente se repartiría entre los segmentos encendidos, alterando el brillo según el número mostrado',
                            'Porque el display se invertiría mostrando letras',
                            'Porque el CD4511 no soporta corriente alterna',
                            'Porque el pin común es una entrada de datos'
                        ],
                        correct: 0,
                        feedback: '¡Excelente! Al usar una sola resistencia, al mostrar el "1" (2 segmentos) cada uno recibe la mitad de la corriente, pero al mostrar el "8" (7 segmentos) la corriente se divide entre 7, quedando muy tenue.'
                    },
                    {
                        id: 'ee-m3-l13-q9',
                        objective: 'Comportamiento del CD4511 con códigos no BCD',
                        concept: 'codigos_no_bcd',
                        difficulty: 'medium',
                        q: 'Si se aplican las entradas D=1, C=1, B=1, A=0 (decimal 14) al CD4511, ¿qué visualizará el display?',
                        options: [
                            'El display permanecerá completamente apagado (en blanco)',
                            'La letra "E"',
                            'Un número "4" parpadeante',
                            'Un mensaje de error'
                        ],
                        correct: 0,
                        feedback: '¡Muy bien! A diferencia de otros decodificadores que muestran caracteres extraños, el CD4511 apaga automáticamente todas las salidas ante números superiores a 9 (códigos no BCD).'
                    },
                    {
                        id: 'ee-m3-l13-q10',
                        objective: 'Cadena de conexión completa en sistemas secuenciales',
                        concept: 'cadena_completa',
                        difficulty: 'easy',
                        q: 'En la cadena electrónica: [Generador 555] -> [Contador 74LS93] -> [Decodificador CD4511] -> [Display 7 Segmentos], ¿qué función cumple el CD4511?',
                        options: [
                            'Traducir el código binario de 4 bits del contador en las 7 señales de potencia para encender el dígito legible',
                            'Generar la señal de oscilación de reloj',
                            'Contar los pulsos de entrada',
                            'Regular el voltaje de la fuente de alimentación'
                        ],
                        correct: 0,
                        feedback: '¡Exacto! El CD4511 es el puente de interfaz entre la lógica binaria digital del contador y la presentación visual comprensible para el ser humano.'
                    }
                ],
                quizConfig: { timePerQuestion: 30, requiredScorePercent: 80 }
            })
        ]
    }
});
