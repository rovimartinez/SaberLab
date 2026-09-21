import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Diodos Semiconductores y Rectificación',
    hasSimulator: true,
    content: `
        <!-- ── 9.1 Introducción a los Semiconductores y la Unión P-N ── -->
        <h3 id="ee-2-9-1" style="color: #f59e0b; margin: 1.5rem 0 1rem; font-size: 1.4rem;">9.1 ¿Qué es un Semiconductor y la Unión P-N?</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            En la naturaleza, los materiales se dividen entre <strong>conductores</strong> (como el cobre o la plata, que ceden electrones con facilidad) y <strong>aislantes</strong> (como el vidrio o la cerámica, que retienen sus electrones fuertemente). Los <strong>semiconductores</strong> (principalmente el <strong>Silicio (Si)</strong> y el <strong>Germanio (Ge)</strong>) son elementos del Grupo IV de la tabla periódica cuya conductividad eléctrica puede modificarse y controlarse con extrema precisión mediante un proceso químico llamado <strong>dopaje</strong>.
        </p>

        <!-- Cuadro Tipo P vs Tipo N -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 1.25rem;">
                <div style="color: #38bdf8; font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">🔵 Semiconductor Tipo P (Positivo)</div>
                <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin: 0;">
                    Silicio dopado con elementos trivalentes (como <strong>Boro</strong> o <strong>Galio</strong>). Posee una deficiencia de electrones, creando abundantes <strong>huecos o lagunas positivas</strong> como portadores mayoritarios.
                </p>
            </div>
            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; padding: 1.25rem;">
                <div style="color: #fbbf24; font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">🟡 Semiconductor Tipo N (Negativo)</div>
                <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin: 0;">
                    Silicio dopado con elementos pentavalentes (como <strong>Fósforo</strong> o <strong>Arsénico</strong>). Posee un exceso de electrones libres en su red cristalina como portadores mayoritarios.
                </p>
            </div>
        </div>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <h4 style="color: #38bdf8; margin: 0 0 0.5rem; font-size: 1.1rem;">⚡ La Unión P-N y la Zona de Deplexión</h4>
            <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.7; margin: 0;">
                Al unir físicamente un cristal Tipo P con uno Tipo N, los electrones libres de la zona N se difunden hacia la zona P para llenar los huecos vecinos. Esto crea una delgada franja neutra desprovista de portadores libres llamada <strong>zona de deplexión (o barrera de potencial)</strong>, la cual genera un campo eléctrico interno que impide que más electrones sigan cruzando a menos que se aplique un voltaje externo suficiente.
            </p>
        </div>

        <!-- ── 9.2 El Diodo Semiconductor: Ánodo, Cátodo y Polarización ── -->
        <h3 id="ee-2-9-2" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">9.2 Anatomía del Diodo: Ánodo, Cátodo y Estados de Polarización</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            El <strong>diodo semiconductor</strong> es una válvula de una sola vía para los electrones. Consta de dos terminales: el <strong>Ánodo ($A$)</strong> conectado al cristal P y el <strong>Cátodo ($K$)</strong> conectado al cristal N (identificado físicamente en el encapsulado por una <strong>franja plateada o negra</strong>).
        </p>

        <!-- Comparativa de Polarización -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <!-- Polarización Directa -->
            <div style="background: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.35); border-radius: 18px; padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="color: #10b981; margin: 0; font-size: 1.05rem;">🟢 Polarización Directa</h4>
                    <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 800;">CONDUCE</span>
                </div>
                <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin-bottom: 0.75rem;">
                    Se conecta el polo <strong>Positivo ($+$) al Ánodo</strong> y el <strong>Negativo ($-$) al Cátodo</strong>. Cuando el voltaje supera el umbral de barrera ($V_F$), la zona de deplexión colapsa y la corriente fluye libremente.
                </p>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.6rem; font-size: 0.78rem; color: #94a3b8;">
                    <strong>Caída de Voltaje Típica ($V_F$):</strong><br/>
                    • Silicio: <strong>~0.7V</strong> (Estándar 1N4007)<br/>
                    • Germanio: <strong>~0.3V</strong> (Detectores RF)<br/>
                    • Schottky: <strong>~0.2V a 0.4V</strong> (Alta velocidad)<br/>
                    • LED Rojo: <strong>~1.8V a 2.0V</strong> | LED Azul: <strong>~3.0V a 3.3V</strong>
                </div>
            </div>

            <!-- Polarización Inversa -->
            <div style="background: rgba(239, 68, 68, 0.08); border: 1.5px solid rgba(239, 68, 68, 0.35); border-radius: 18px; padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="color: #ef4444; margin: 0; font-size: 1.05rem;">🔴 Polarización Inversa</h4>
                    <span style="background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 800;">BLOQUEA</span>
                </div>
                <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin-bottom: 0.75rem;">
                    Se conecta el polo <strong>Negativo ($-$) al Ánodo</strong> y el <strong>Positivo ($+$) al Cátodo</strong>. La zona de deplexión se ensancha atrayendo a los portadores, impidiendo el paso de corriente (se comporta como un circuito abierto).
                </p>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.6rem; font-size: 0.78rem; color: #94a3b8;">
                    <strong>Parámetros Críticos de Ruptura:</strong><br/>
                    • <strong>Corriente de Fuga ($I_S$):</strong> Mínima fuga residual en nanoamperios ($nA$).<br/>
                    • <strong>Voltaje Inverso Pico ($V_{RRM}$ / $PIV$):</strong> Tensión máxima que soporta antes de entrar en ruptura destructiva (ej. 1N4007 soporta hasta <strong>1000V</strong>).
                </div>
            </div>
        </div>

        <!-- ── 9.3 Familias y Tipos Especiales de Diodos ── -->
        <h3 id="ee-2-9-3" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">9.3 Familias de Diodos en la Electrónica Práctica</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 1.15rem;">
                <div style="color: #38bdf8; font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">1. Diodo Rectificador (1N4001 - 1N4007)</div>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Optimizado para soportar altas corrientes continuas ($1\text{A}$ a $10\text{A}$) a frecuencias de red ($50/60\text{Hz}$). Ideal para fuentes de alimentación y protección contra polaridad invertida.
                </p>
            </div>
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; padding: 1.15rem;">
                <div style="color: #fbbf24; font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">2. Diodo Zener (Regulación de Tensión)</div>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Diseñado para operar intencionalmente en <strong>polarización inversa en la zona de ruptura Zener</strong>. Mantiene un voltaje estable constante entre sus bornes (ej. 5.1V, 9.1V, 12V), usado como referencia de voltaje.
                </p>
            </div>
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 1.15rem;">
                <div style="color: #10b981; font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">3. Diodo Emisor de Luz (LED)</div>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Fabricado con compuestos como Arseniuro de Galio (GaAs). Al polarizarse en directa, la recombinación de electrones y huecos libera fotones visibles o infrarrojos (electroluminiscencia).
                </p>
            </div>
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 1.15rem;">
                <div style="color: #ef4444; font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">4. Diodo Schottky (1N5819)</div>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Unión metal-semiconductor sin tiempo de almacenamiento de portadores. Conmuta a ultra alta velocidad ($< 10\text{ns}$) con caída directa ultrabaja ($\approx 0.3\text{V}$), estándar en fuentes conmutadas (SMPS).
                </p>
            </div>
        </div>

        <!-- ── 9.4 Rectificación: Convirtiendo AC en DC ── -->
        <h3 id="ee-2-9-4" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">9.4 Circuitos de Rectificación: De Corriente Alterna a Directa</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            La red eléctrica domiciliaria entrega <strong>Corriente Alterna (AC)</strong> senoidal ($110\text{V}/220\text{V}$ a $60\text{Hz}$ o $50\text{Hz}$), mientras que los circuitos digitales y microcontroladores requieren <strong>Corriente Directa (DC)</strong> pura y constante. La <strong>rectificación</strong> es la primera etapa fundamental de toda fuente de poder:
        </p>

        <!-- Topologías de Rectificación -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <!-- Media Onda -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 18px; padding: 1.25rem;">
                <h4 style="color: #cbd5e1; margin: 0 0 0.5rem; font-size: 1.05rem;">1. Rectificador de Media Onda (1 Diodo)</h4>
                <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.6; margin-bottom: 0.75rem;">
                    Conduce únicamente durante el semiciclo positivo de la onda AC y bloquea el semiciclo negativo.
                </p>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.6rem; font-size: 0.78rem; color: #cbd5e1;">
                    • <strong>Frecuencia de rizado:</strong> $f_{out} = f_{in}$ ($60\text{Hz}$)<br/>
                    • <strong>Voltaje Promedio DC:</strong> $V_{dc} = \frac{V_p - 0.7}{\pi} \approx 0.318 \cdot V_p$<br/>
                    • <strong>Eficiencia:</strong> Baja ($\approx 40.6\%$), desperdicia la mitad de la energía.
                </div>
            </div>

            <!-- Onda Completa Puente de Graetz -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 18px; padding: 1.25rem;">
                <h4 style="color: #38bdf8; margin: 0 0 0.5rem; font-size: 1.05rem;">2. Puente Rectificador de Onda Completa (Puente de Graetz - 4 Diodos)</h4>
                <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin-bottom: 0.75rem;">
                    Utiliza 4 diodos conectados en puente para redirigir ambos semiciclos (positivo y negativo) en la misma dirección a través de la carga (conducen 2 diodos a la vez en cada semiciclo).
                </p>
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 0.6rem; font-size: 0.78rem; color: #cbd5e1;">
                    • <strong>Frecuencia de rizado:</strong> $f_{out} = 2 \cdot f_{in}$ ($120\text{Hz}$)<br/>
                    • <strong>Voltaje Pico de Salida:</strong> $V_{out(pico)} = V_p - 2 \cdot V_F = V_p - 1.4\text{V}$<br/>
                    • <strong>Voltaje Promedio DC:</strong> $V_{dc} = \frac{2(V_p - 1.4)}{\pi} \approx 0.636 \cdot V_p$<br/>
                    • <strong>Eficiencia:</strong> Alta ($\approx 81.2\%$), aprovecha el 100% de los semiciclos.
                </div>
            </div>
        </div>

        <!-- ── 9.5 El Filtrado Capacitivo y Reducción de Rizado ── -->
        <h3 id="ee-2-9-5" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">9.5 El Filtrado Capacitivo y el Voltaje de Rizado ($V_r$)</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            La salida de un puente rectificador no es una línea recta continua, sino una serie de pulsos positivos llamada <strong>DC pulsante</strong>. Para alisar esta tensión y transformarla en una línea recta apta para electrónica sensible, se conecta en paralelo con la carga un <strong>capacitor electrolítico de filtro</strong> ($1000\mu\text{F}$ a $4700\mu\text{F}$).
        </p>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 18px; padding: 1.5rem; margin-bottom: 2rem;">
            <h4 style="color: #10b981; margin: 0 0 0.75rem; font-size: 1.1rem;">🌊 Dinámica del Filtro Capacitivo</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.85rem; margin-bottom: 1rem;">
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 0.85rem; border-left: 3px solid #38bdf8;">
                    <div style="color: #38bdf8; font-weight: 800; font-size: 0.82rem;">1. CARGA RÁPIDA</div>
                    <p style="color: #94a3b8; font-size: 0.78rem; margin: 0.25rem 0 0; line-height: 1.4;">
                        Durante la subida del pulso AC, el capacitor se carga casi instantáneamente hasta el valor pico $V_{pico}$.
                    </p>
                </div>
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 0.85rem; border-left: 3px solid #f59e0b;">
                    <div style="color: #f59e0b; font-weight: 800; font-size: 0.82rem;">2. DESCARGA LENTA</div>
                    <p style="color: #94a3b8; font-size: 0.78rem; margin: 0.25rem 0 0; line-height: 1.4;">
                        Cuando la onda AC cae hacia cero, los diodos se apagan y el capacitor suministra la corriente a la carga sosteniendo el voltaje.
                    </p>
                </div>
            </div>
            <div style="background: rgba(0,0,0,0.35); border-radius: 12px; padding: 0.85rem; text-align: center; font-family: monospace; font-size: 1.1rem; color: #fde047;">
                V_{rizado(pico-pico)} ≈ I_{load} / (2 · f · C)
            </div>
            <p style="color: #94a3b8; font-size: 0.78rem; text-align: center; margin: 0.5rem 0 0;">
                A mayor capacitancia ($C$), menor será la oscilación residual (voltaje de rizado) y más pura será la corriente continua resultante.
            </p>
        </div>
    `,
    flashcards: [
        {
            id: 'ee-2-9-f1',
            q: '¿Qué diferencia a un semiconductor Tipo P de uno Tipo N?',
            a: 'El Tipo P tiene exceso de huecos positivos (dopado con Boro), y el Tipo N exceso de electrones libres (dopado con Fósforo).',
            sub: 'Semiconductores',
            sectionId: 'ee-2-9-1'
        },
        {
            id: 'ee-2-9-f2',
            q: '¿Qué es la zona de deplexión en un diodo?',
            a: 'La barrera interna de potencial sin portadores libres formada en la unión P-N.',
            sub: 'Unión P-N',
            sectionId: 'ee-2-9-1'
        },
        {
            id: 'ee-2-9-f3',
            q: '¿Cuál es la caída de tensión típica (V_F) de un diodo rectificador de silicio estándar en directa?',
            a: 'Aproximadamente 0.7 Voltios (0.6V a 0.7V).',
            sub: 'Voltaje Directo',
            sectionId: 'ee-2-9-2'
        },
        {
            id: 'ee-2-9-f4',
            q: '¿Cómo se identifica físicamente el terminal Cátodo en un diodo cilíndrico?',
            a: 'Por la franja plateada o negra pintada en un extremo del encapsulado.',
            sub: 'Anatomía Diodo',
            sectionId: 'ee-2-9-2'
        },
        {
            id: 'ee-2-9-f5',
            q: '¿Cómo se comporta un diodo polarizado en inversa?',
            a: 'Como un circuito abierto, bloqueando el paso de corriente (salvo una ínfima fuga en nA).',
            sub: 'Polarización Inversa',
            sectionId: 'ee-2-9-2'
        },
        {
            id: 'ee-2-9-f6',
            q: '¿En qué región de trabajo opera intencionalmente un Diodo Zener?',
            a: 'En polarización inversa dentro de su zona de ruptura Zener para mantener un voltaje regulado fijo.',
            sub: 'Diodo Zener',
            sectionId: 'ee-2-9-3'
        },
        {
            id: 'ee-2-9-f7',
            q: '¿Qué ventajas ofrece un Diodo Schottky frente a un diodo de silicio convencional?',
            a: 'Menor caída de voltaje directa (0.3V) y tiempo de conmutación ultrarrápido para alta frecuencia.',
            sub: 'Diodo Schottky',
            sectionId: 'ee-2-9-3'
        },
        {
            id: 'ee-2-9-f8',
            q: '¿Cuántos diodos se requieren para construir un puente rectificador de onda completa?',
            a: '4 diodos conectados en puente de Graetz (conducen 2 por cada semiciclo).',
            sub: 'Puente Rectificador',
            sectionId: 'ee-2-9-4'
        },
        {
            id: 'ee-2-9-f9',
            q: 'Si la frecuencia de entrada AC es 60 Hz, ¿cuál es la frecuencia de salida tras un puente de onda completa?',
            a: '120 Hz (el doble de la frecuencia de entrada, f_out = 2 · f_in).',
            sub: 'Frecuencia Rizado',
            sectionId: 'ee-2-9-4'
        },
        {
            id: 'ee-2-9-f10',
            q: '¿Cuál es la función del capacitor electrolítico de filtro a la salida de un rectificador?',
            a: 'Almacenar carga en los picos y descargarla en los valles para alisar la DC pulsante y reducir el rizado.',
            sub: 'Filtro Capacitivo',
            sectionId: 'ee-2-9-5'
        }
    ],
    questions: [
        {
            id: 'ee-2-9-q1',
            objective: 'Comprender el dopaje de semiconductores',
            concept: 'semiconductor_dopaje',
            difficulty: 'easy',
            q: 'Un semiconductor de Silicio Tipo N se obtiene dopando el cristal puro con átomos que aportan:',
            options: [
                'Un exceso de electrones libres en la red cristalina',
                'Un exceso de huecos positivos (lagunas)',
                'Cargas magnéticas neutras',
                'Aislación térmica total'
            ],
            correct: 0
        },
        {
            id: 'ee-2-9-q2',
            objective: 'Reconocer la caída de tensión en polarización directa',
            concept: 'caida_tension_silicio',
            difficulty: 'easy',
            q: 'Para que un diodo rectificador de silicio estándar (como el 1N4007) comience a conducir apreciablemente en polarización directa, el voltaje entre Ánodo y Cátodo debe superar:',
            options: [
                'Aproximadamente 0.7 V',
                'Aproximadamente 5.0 V',
                'Aproximadamente 0.0 V',
                'Aproximadamente 12.0 V'
            ],
            correct: 0
        },
        {
            id: 'ee-2-9-q3',
            objective: 'Identificar el comportamiento en polarización inversa',
            concept: 'polarizacion_inversa',
            difficulty: 'medium',
            q: 'Si se aplica un voltaje positivo al Cátodo y negativo al Ánodo de un diodo rectificador por debajo de su tensión de ruptura, el diodo se encuentra en:',
            options: [
                'Polarización inversa y actúa como un circuito abierto bloqueando la corriente',
                'Polarización directa y conduce la corriente máxima',
                'Cortocircuito permanente disipando calor',
                'Oscilación armónica de alta frecuencia'
            ],
            correct: 0
        },
        {
            id: 'ee-2-9-q4',
            objective: 'Aplicación del diodo Zener',
            concept: 'diodo_zener_regulacion',
            difficulty: 'medium',
            q: '¿Por qué se utiliza un diodo Zener en circuitos reguladores de voltaje?',
            options: [
                'Porque al polarizarse en inversa mantiene un voltaje casi constante e independiente de las variaciones de corriente',
                'Porque amplifica la corriente como un transistor de potencia',
                'Porque bloquea totalmente la corriente en ambos sentidos',
                'Porque emite luz brillante para indicar encendido'
            ],
            correct: 0
        },
        {
            id: 'ee-2-9-q5',
            objective: 'Calcular voltaje de salida en rectificador de media onda',
            concept: 'calculo_media_onda',
            difficulty: 'medium',
            q: 'Si se alimenta un rectificador de media onda con una señal senoidal de 12 V pico (V_p = 12V), el voltaje pico real entregado a la carga considerando la caída del diodo de silicio es:',
            options: [
                '11.3 V (12V - 0.7V)',
                '12.0 V',
                '10.6 V (12V - 1.4V)',
                '6.0 V'
            ],
            correct: 0
        },
        {
            id: 'ee-2-9-q6',
            objective: 'Calcular voltaje de salida en puente rectificador de onda completa',
            concept: 'calculo_puente_graetz',
            difficulty: 'hard',
            q: 'En un puente rectificador de onda completa con 4 diodos de silicio alimentado con 15 V pico, ¿cuál es el voltaje pico máximo que llega a la carga?',
            options: [
                '13.6 V (15V - 2 × 0.7V, ya que conducen 2 diodos en serie por semiciclo)',
                '14.3 V (15V - 0.7V)',
                '15.0 V',
                '7.5 V'
            ],
            correct: 0
        },
        {
            id: 'ee-2-9-q7',
            objective: 'Comparar rectificación de media onda vs onda completa',
            concept: 'frecuencia_rizado',
            difficulty: 'medium',
            q: 'Al conectar una fuente de 60 Hz a un rectificador de onda completa tipo puente, la frecuencia de la señal pulsante a la salida es:',
            options: [
                '120 Hz, porque se aprovechan ambos semiciclos de la onda',
                '60 Hz, igual que la entrada',
                '30 Hz, porque se divide a la mitad',
                '0 Hz de corriente continua pura sin rizado'
            ],
            correct: 0
        },
        {
            id: 'ee-2-9-q8',
            objective: 'Comprender el efecto del capacitor de filtro',
            concept: 'filtro_capacitivo_rizado',
            difficulty: 'hard',
            q: '¿Qué sucede con el voltaje de rizado (oscilación residual) si aumentamos el valor del capacitor de filtro de 470 µF a 4700 µF en una fuente rectificada?',
            options: [
                'El voltaje de rizado disminuye considerablemente, obteniendo una corriente continua mucho más plana y estable',
                'El voltaje de rizado aumenta quemando los diodos',
                'El voltaje de salida cae a cero voltios',
                'La frecuencia de la red se reduce a la décima parte'
            ],
            correct: 0
        },
        {
            id: 'ee-2-9-q9',
            objective: 'Identificar características del Diodo Schottky',
            concept: 'diodo_schottky',
            difficulty: 'medium',
            q: 'El diodo Schottky es ampliamente utilizado en fuentes conmutadas modernas principalmente por:',
            options: [
                'Su conmutación a ultra alta velocidad y muy baja caída de tensión directa (≈ 0.3V)',
                'Soportar voltajes de más de 50.000 V',
                'Emitir luz infrarroja para controles remotos',
                'Reemplazar a los transformadores mecánicos'
            ],
            correct: 0
        },
        {
            id: 'ee-2-9-q10',
            objective: 'Protección contra inversión de polaridad',
            concept: 'proteccion_polaridad',
            difficulty: 'easy',
            q: 'En una placa electrónica alimentada por batería, ¿cómo se conecta un diodo para protegerla si el usuario conecta por error los cables al revés?',
            options: [
                'En serie con la línea positiva (Ánodo a la batería, Cátodo al circuito), de modo que si se invierte la batería el diodo queda en inversa y no conduce',
                'En paralelo directo sin fusible para provocar un cortocircuito',
                'Conectado entre tierra y el chasis metálico',
                'En serie con el polo negativo con el cátodo hacia la batería'
            ],
            correct: 0
        }
    ]
};

export const lessonData = defineLesson({
    title: lessonDefinition.title,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-2-9-content',
                content: lessonDefinition.content
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ee-2-9-review',
                flashcards: lessonDefinition.flashcards
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-2-9-quiz',
                title: 'Evaluación: Diodos Semiconductores y Rectificación',
                questions: lessonDefinition.questions,
                quizConfig: {
                    timePerQuestion: 30,
                    requiredScorePercent: 80
                }
            })
        ]
    }
});
