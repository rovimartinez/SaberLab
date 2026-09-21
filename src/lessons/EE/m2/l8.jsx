import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Bobinas, Inducción Electromagnética, Relés y Motores DC',
    hasSimulator: true,
    content: `
        <!-- ── 8.1 Introducción y la Gran Conexión: Electricidad y Magnetismo ── -->
        <h3 id="ee-2-8-1" style="color: #f59e0b; margin: 1.5rem 0 1rem; font-size: 1.4rem;">8.1 La Gran Conexión: Del Experimento de Oersted al Electromagnetismo</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Durante siglos, la electricidad (cargas en reposo o movimiento) y el magnetismo (imanes naturales como la magnetita) se consideraban dos fenómenos de la naturaleza completamente separados e independientes. Todo cambió en <strong>1820</strong>, cuando el físico danés <strong>Hans Christian Oersted</strong> descubrió accidentalmente durante una clase que al hacer circular corriente eléctrica por un conductor, la aguja de una brújula magnética cercana se desviaba perpendicularmente.
        </p>

        <!-- Píldora Histórica -->
        <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; padding: 1.25rem; margin-bottom: 1.5rem;">
            <h4 style="color: #fde047; margin: 0 0 0.5rem; font-size: 1.05rem;">📜 El Nacimiento del Electromagnetismo (Oersted, Ampère y Henry)</h4>
            <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.7; margin: 0;">
                El hallazgo de Oersted demostró que <strong>toda corriente eléctrica en movimiento genera a su alrededor un campo magnético ($B$)</strong>. Poco después, <strong>André-Marie Ampère</strong> formuló la ley matemática de la fuerza magnética entre cables conductores, y <strong>Joseph Henry</strong> junto a <strong>Michael Faraday</strong> descubrieron que el efecto inverso también era posible: un campo magnético variable en el tiempo es capaz de inducir una corriente eléctrica en un circuito.
            </p>
        </div>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <h4 style="color: #38bdf8; margin: 0 0 0.5rem; font-size: 1.1rem;">✋ La Regla de la Mano Derecha para Conductores</h4>
            <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.7; margin-bottom: 0.75rem;">
                Para determinar el sentido de las líneas de campo magnético concéntricas que envuelven a un cable recto:
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.85rem;">
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 0.85rem; border-left: 3px solid #38bdf8;">
                    <div style="color: #38bdf8; font-weight: 800; font-size: 0.82rem;">1. PULGAR DERECHO</div>
                    <p style="color: #94a3b8; font-size: 0.78rem; margin: 0.25rem 0 0; line-height: 1.4;">
                        Apunta en la dirección del flujo de la corriente convencional ($+$ a $-$).
                    </p>
                </div>
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 0.85rem; border-left: 3px solid #10b981;">
                    <div style="color: #10b981; font-weight: 800; font-size: 0.82rem;">2. CUATRO DEDOS RESTANTES</div>
                    <p style="color: #94a3b8; font-size: 0.78rem; margin: 0.25rem 0 0; line-height: 1.4;">
                        Abrazan o envuelven el conductor indicando el giro de las líneas del campo magnético concéntrico.
                    </p>
                </div>
            </div>
        </div>

        <!-- ── 8.2 ¿Qué es una Bobina o Inductor? ── -->
        <h3 id="ee-2-8-2" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">8.2 La Bobina (Inductor): Estructura, Inductancia y Núcleos</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Un cable recto genera un campo magnético débil y disperso. Sin embargo, si enrollamos ese cable de cobre esmaltado en espiral formando un <strong>solenoide</strong> o <strong>bobina</strong>, los campos magnéticos de cada vuelta individual se suman constructivamente en el centro, creando un <strong>electroimán potente y concentrado</strong> con un polo Norte ($N$) y un polo Sur ($S$).
        </p>

        <!-- Cuadro Componente Inductor -->
        <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(56, 189, 248, 0.3); border-radius: 20px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 1rem;">
                <h4 style="color: #38bdf8; margin: 0; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
                    🌀 Parámetros Físicos de la Inductancia ($L$)
                </h4>
                <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid #38bdf8; padding: 2px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 800;">
                    Unidad: Henrio (H)
                </span>
            </div>
            <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.7; margin-bottom: 1rem;">
                La <strong>Inductancia ($L$)</strong> es la propiedad intrínseca de una bobina que mide su capacidad para almacenar energía en forma de un <strong>campo magnético</strong> y oponerse a los cambios en la corriente que circula por ella. Se mide en <strong>Henrios (H)</strong> (o comúnmente en milihenrios $\text{mH}$ y microhenrios $\mu\text{H}$).
            </p>
            <div style="background: rgba(0,0,0,0.35); border-radius: 14px; padding: 1rem; text-align: center; margin-bottom: 1rem; font-family: monospace; font-size: 1.25rem; color: #fde047;">
                L = (μ · N² · A) / l
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem;">
                <div style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 0.75rem;">
                    <div style="color: #fbbf24; font-weight: 700; font-size: 0.8rem;">μ: Permeabilidad del Núcleo</div>
                    <div style="color: #94a3b8; font-size: 0.75rem; margin-top: 3px;">Capacidad del material central para concentrar el flujo magnético (Hierro / Ferrita $\gg$ Aire).</div>
                </div>
                <div style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 0.75rem;">
                    <div style="color: #38bdf8; font-weight: 700; font-size: 0.8rem;">N: Número de Espiras (Vueltas)</div>
                    <div style="color: #94a3b8; font-size: 0.75rem; margin-top: 3px;">Aumenta al cuadrado ($N^2$); el doble de vueltas genera 4 veces más inductancia.</div>
                </div>
                <div style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 0.75rem;">
                    <div style="color: #10b981; font-weight: 700; font-size: 0.8rem;">A: Área de la Sección</div>
                    <div style="color: #94a3b8; font-size: 0.75rem; margin-top: 3px;">Mayor diámetro interior permite mayor flujo magnético total.</div>
                </div>
                <div style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 0.75rem;">
                    <div style="color: #f43f5e; font-weight: 700; font-size: 0.8rem;">l: Longitud del Solenoide</div>
                    <div style="color: #94a3b8; font-size: 0.75rem; margin-top: 3px;">Espaciamiento de las espiras a lo largo del eje central.</div>
                </div>
            </div>
        </div>

        <!-- Tipos de Núcleos -->
        <h4 style="color: #38bdf8; margin: 1.5rem 0 0.75rem; font-size: 1.1rem;">🧲 Tipos de Núcleos en Bobinas</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.15rem;">
                <div style="color: #cbd5e1; font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">1. Núcleo de Aire</div>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Bobinadas sobre tubos plásticos, cerámicos o sin soporte. No sufren saturación magnética y se usan en <strong>circuitos de radiofrecuencia (RF) y alta frecuencia</strong> (baja inductancia, pocos $\mu\text{H}$).
                </p>
            </div>
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 1.15rem;">
                <div style="color: #38bdf8; font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">2. Núcleo de Hierro Laminado</div>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Láminas de acero al silicio aisladas entre sí para reducir las corrientes parásitas de Foucault. Empleado en <strong>transformadores de potencia de 50/60Hz, relés y motores eléctricos</strong>.
                </p>
            </div>
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; padding: 1.15rem;">
                <div style="color: #fbbf24; font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">3. Núcleo de Ferrita (Toroides / Varillas)</div>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Material cerámico ferromagnético no conductor. Combina altísima permeabilidad con nula conductividad eléctrica. Estándar en <strong>fuentes conmutadas (SMPS), filtros EMI y choques inductivos</strong>.
                </p>
            </div>
        </div>

        <!-- ── 8.3 Ley de Faraday y Ley de Lenz ── -->
        <h3 id="ee-2-8-3" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">8.3 Ley de Faraday, Ley de Lenz y la Fuerza Contraelectromotriz (FCEM)</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            El principio de la <strong>Inducción Electromagnética</strong> establece que cuando el flujo magnético ($\Phi_B$) que atraviesa un circuito cambia con el tiempo, se genera una tensión inducida (voltaje inducido) en sus terminales:
        </p>

        <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 18px; padding: 1.25rem; text-align: center; margin-bottom: 1.5rem;">
            <div style="font-size: 1.35rem; font-weight: 800; color: #ef4444; font-family: monospace;">
                v_L(t) = L · (di / dt)
            </div>
            <p style="color: #94a3b8; font-size: 0.82rem; margin: 0.5rem 0 0;">
                El voltaje en bornes de una bobina es proporcional a la <strong>velocidad con la que cambia la corriente</strong> ($di/dt$), no al valor absoluto de la corriente misma.
            </p>
        </div>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 18px; padding: 1.5rem; margin-bottom: 2rem;">
            <h4 style="color: #f43f5e; margin: 0 0 0.5rem; font-size: 1.05rem;">🛑 Ley de Lenz: La Inercia Eléctrica</h4>
            <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.7; margin: 0;">
                La <strong>Ley de Lenz</strong> (representada por el signo negativo en la física fundamental) establece que <em>la polaridad de cualquier voltaje inducido es tal que genera una corriente cuyo campo magnético se opone diametralmente al cambio de corriente original que lo produjo</em>. Por eso, las bobinas actúan como la <strong>inercia mecánica</strong> en los circuitos eléctricos: se resisten a que la corriente arranque de golpe y se resisten con violencia a que se corte de golpe.
            </p>
        </div>

        <!-- ── 8.4 El Peligro del Pico Inductivo y el Diodo Flyback ── -->
        <h3 id="ee-2-8-4" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">8.4 El Pico Inductivo (Flyback) y el Diodo de Protección</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            ¿Qué sucede cuando apagamos un interruptor o un transistor que alimentaba una bobina o motor? La corriente intenta caer a $0\text{ A}$ en picada ($dt \to 0$), lo que provoca un valor $di/dt$ extremadamente negativo. La bobina reacciona liberando toda su energía magnética acumulada colapsando el campo y generando un <strong>pico inverso de voltaje de cientos o miles de voltios (Fuerza Contraelectromotriz o Back-EMF)</strong>.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div style="background: rgba(239, 68, 68, 0.08); border: 1.5px solid rgba(239, 68, 68, 0.35); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #ef4444; margin: 0 0 0.5rem; font-size: 1rem;">💥 Sin Diodo de Protección</h4>
                <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin: 0;">
                    El pico de alto voltaje crea un arco eléctrico en los contactos mecánicos o <strong>destruye instantáneamente por avalancha los transistores, microcontroladores y circuitos integrados</strong> que controlaban la carga.
                </p>
            </div>
            <div style="background: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.35); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #10b981; margin: 0 0 0.5rem; font-size: 1rem;">🛡️ Con Diodo Flyback (1N4007 / 1N4148)</h4>
                <p style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.6; margin: 0;">
                    Se conecta un diodo rectificador en <strong>polarización inversa en paralelo con la bobina</strong>. En funcionamiento normal no conduce; al apagar la bobina, el pico inverso queda confinado en un lazo cerrado seguro donde la energía se disipa térmicamente.
                </p>
            </div>
        </div>

        <!-- ── 8.5 El Relé Electromecánico ── -->
        <h3 id="ee-2-8-5" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">8.5 El Relé Electromecánico: Aislamiento Galvánico y Control de Potencia</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Un <strong>relé</strong> (o relay) es un interruptor electromecánico accionado por una bobina interna. Su función principal es permitir que un circuito de control de muy bajo voltaje y corriente (como un Arduino de $5\text{V}$ o $3.3\text{V}$) pueda encender o apagar de forma 100% segura cargas de gran potencia como bombillos de $110\text{V}/220\text{V AC}$, bombas hidráulicas o motores industriales, proporcionando un <strong>aislamiento galvánico total</strong> (sin conexión eléctrica directa entre control y potencia).
        </p>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <h4 style="color: #38bdf8; margin: 0 0 0.75rem; font-size: 1.1rem;">🔌 Anatomía y Terminales de un Relé Típico (5 Pines)</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.85rem;">
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 0.85rem; border-left: 3px solid #f59e0b;">
                    <div style="color: #f59e0b; font-weight: 800; font-size: 0.82rem;">COIL 1 & COIL 2 (Bobina)</div>
                    <p style="color: #94a3b8; font-size: 0.78rem; margin: 0.25rem 0 0; line-height: 1.4;">
                        Terminales de la bobina electromagnética interna (ej. 5V, 12V o 24V DC).
                    </p>
                </div>
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 0.85rem; border-left: 3px solid #38bdf8;">
                    <div style="color: #38bdf8; font-weight: 800; font-size: 0.82rem;">COM (Común)</div>
                    <p style="color: #94a3b8; font-size: 0.78rem; margin: 0.25rem 0 0; line-height: 1.4;">
                        Borne móvil central donde se conecta la fase o la alimentación principal de la carga.
                    </p>
                </div>
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 0.85rem; border-left: 3px solid #10b981;">
                    <div style="color: #10b981; font-weight: 800; font-size: 0.82rem;">NO (Normalmente Abierto)</div>
                    <p style="color: #94a3b8; font-size: 0.78rem; margin: 0.25rem 0 0; line-height: 1.4;">
                        El circuito permanece abierto; se cierra únicamente cuando la bobina se energiza.
                    </p>
                </div>
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 0.85rem; border-left: 3px solid #ef4444;">
                    <div style="color: #ef4444; font-weight: 800; font-size: 0.82rem;">NC (Normalmente Cerrado)</div>
                    <p style="color: #94a3b8; font-size: 0.78rem; margin: 0.25rem 0 0; line-height: 1.4;">
                        El contacto conduce por defecto en reposo; se abre cuando la bobina se activa.
                    </p>
                </div>
            </div>
        </div>

        <!-- ── 8.6 El Motor de Corriente Continua (Motor DC) ── -->
        <h3 id="ee-2-8-6" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">8.6 El Motor Eléctrico DC: Fuerza de Lorentz y Rotación Continua</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            El <strong>Motor de Corriente Directa (DC)</strong> es un transductor electromecánico que convierte energía eléctrica en movimiento rotacional continuo basado en la <strong>Fuerza de Lorentz ($F = I \cdot L \times B$)</strong>: cuando un conductor que transporta corriente se encuentra sumergido en un campo magnético perpendicular, experimenta una fuerza mecánica que lo empuja lateralmente.
        </p>

        <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(245, 158, 11, 0.3); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <h4 style="color: #fbbf24; margin: 0 0 1rem; font-size: 1.15rem;">⚙️ Partes Fundamentales de un Motor DC con Escobillas</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 1rem; border-top: 3px solid #38bdf8;">
                    <div style="color: #38bdf8; font-weight: 800; font-size: 0.9rem;">1. Estator (Campo Fijo)</div>
                    <p style="color: #94a3b8; font-size: 0.8rem; margin: 0.35rem 0 0; line-height: 1.5;">
                        Carcasa exterior que aloja los imanes permanentes con polos magnéticos fijos Norte ($N$) y Sur ($S$).
                    </p>
                </div>
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 1rem; border-top: 3px solid #f59e0b;">
                    <div style="color: #f59e0b; font-weight: 800; font-size: 0.9rem;">2. Rotor o Armadura (Móvil)</div>
                    <p style="color: #94a3b8; font-size: 0.8rem; margin: 0.35rem 0 0; line-height: 1.5;">
                        Eje central giratorio compuesto por un núcleo de hierro ranurado con múltiples bobinados de cobre.
                    </p>
                </div>
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 1rem; border-top: 3px solid #10b981;">
                    <div style="color: #10b981; font-weight: 800; font-size: 0.9rem;">3. Conmutador y Escobillas</div>
                    <p style="color: #94a3b8; font-size: 0.8rem; margin: 0.35rem 0 0; line-height: 1.5;">
                        Anillo dividido en delgas que invierte la dirección de la corriente en las espiras cada 180° de giro para mantener el torque en un único sentido constante.
                    </p>
                </div>
            </div>
        </div>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 1.25rem; margin-bottom: 2rem;">
            <h4 style="color: #38bdf8; margin: 0 0 0.5rem; font-size: 1.05rem;">🔄 Control de Velocidad y Sentido de Giro en Motores DC</h4>
            <ul style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.7; margin: 0; padding-left: 1.2rem;">
                <li><strong>Sentido de Giro:</strong> Se invierte simplemente invirtiendo la polaridad de la fuente de alimentación DC ($+ \leftrightarrow -$).</li>
                <li><strong>Velocidad de Rotación:</strong> Es directamente proporcional al voltaje promedio aplicado. En electrónica moderna se regula mediante modulación por ancho de pulsos (<strong>PWM</strong>).</li>
                <li><strong>Puente H (ej. L298N o L293D):</strong> Circuito de 4 transistores/MOSFETs que permite control bidireccional de giro y frenado electrónico.</li>
            </ul>
        </div>
    `,
    flashcards: [
        {
            id: 'ee-2-8-f1',
            q: '¿Qué descubrió Hans Christian Oersted en 1820?',
            a: 'Que toda corriente eléctrica genera a su alrededor un campo magnético que desvía brújulas.',
            sub: 'Electromagnetismo',
            sectionId: 'ee-2-8-1'
        },
        {
            id: 'ee-2-8-f2',
            q: '¿En qué unidad del Sistema Internacional se mide la Inductancia (L)?',
            a: 'En Henrios (H) en honor al físico estadounidense Joseph Henry.',
            sub: 'Inductancia',
            sectionId: 'ee-2-8-2'
        },
        {
            id: 'ee-2-8-f3',
            q: '¿Cómo afecta el número de espiras (N) a la inductancia de una bobina?',
            a: 'Aumenta con el cuadrado de las vueltas (N²); el doble de espiras multiplica por 4 la inductancia.',
            sub: 'Geometría Bobina',
            sectionId: 'ee-2-8-2'
        },
        {
            id: 'ee-2-8-f4',
            q: '¿Qué establece la Ley de Lenz?',
            a: 'Que el voltaje inducido siempre se opone al cambio de corriente o flujo magnético que lo origina.',
            sub: 'Ley de Lenz',
            sectionId: 'ee-2-8-3'
        },
        {
            id: 'ee-2-8-f5',
            q: '¿Qué fórmula describe el voltaje en bornes de una bobina ideal?',
            a: 'v(t) = L · (di/dt), proporcional a la velocidad de cambio de la corriente.',
            sub: 'Fórmula Inductor',
            sectionId: 'ee-2-8-3'
        },
        {
            id: 'ee-2-8-f6',
            q: '¿Por qué se produce el pico de sobrevoltaje inductivo (Flyback) al apagar una bobina?',
            a: 'Porque el campo magnético colapsa bruscamente forzando a la corriente a continuar su camino.',
            sub: 'Pico Inductivo',
            sectionId: 'ee-2-8-4'
        },
        {
            id: 'ee-2-8-f7',
            q: '¿Para qué se conecta un Diodo Flyback en paralelo con un relé o motor?',
            a: 'Para absorber el pico inverso de alto voltaje y proteger los transistores y microcontroladores.',
            sub: 'Diodo Flyback',
            sectionId: 'ee-2-8-4'
        },
        {
            id: 'ee-2-8-f8',
            q: '¿Qué ventaja principal ofrece un relé electromecánico?',
            a: 'Aislamiento galvánico total entre el circuito de control de baja potencia y la carga de alta potencia.',
            sub: 'Relé',
            sectionId: 'ee-2-8-5'
        },
        {
            id: 'ee-2-8-f9',
            q: '¿Qué función cumple el conmutador y las escobillas en un motor DC?',
            a: 'Invertir la corriente en las espiras del rotor cada 180° para mantener el giro en un solo sentido.',
            sub: 'Motor DC',
            sectionId: 'ee-2-8-6'
        },
        {
            id: 'ee-2-8-f10',
            q: '¿Cómo se invierte el sentido de giro de un motor DC clásico de imán permanente?',
            a: 'Invirtiendo la polaridad de la tensión de alimentación aplicada en sus dos bornes.',
            sub: 'Control Motor',
            sectionId: 'ee-2-8-6'
        }
    ],
    questions: [
        {
            id: 'ee-2-8-q1',
            objective: 'Reconocer el principio del electromagnetismo',
            concept: 'oersted_electromagnetismo',
            difficulty: 'easy',
            q: 'El experimento de Oersted en 1820 demostró de forma concluyente que:',
            options: [
                'Una corriente eléctrica genera un campo magnético a su alrededor',
                'El magnetismo no tiene ninguna relación con la electricidad',
                'Los resistores almacenan energía en forma de campo magnético',
                'La corriente sólo fluye a través de imanes permanentes'
            ],
            correct: 0
        },
        {
            id: 'ee-2-8-q2',
            objective: 'Identificar la unidad de la inductancia',
            concept: 'unidad_inductancia',
            difficulty: 'easy',
            q: 'La inductancia (L) de una bobina se mide en el Sistema Internacional en:',
            options: [
                'Henrios (H)',
                'Faradios (F)',
                'Ohmios (Ω)',
                'Teslas (T)'
            ],
            correct: 0
        },
        {
            id: 'ee-2-8-q3',
            objective: 'Comprender el efecto del núcleo en una bobina',
            concept: 'nucleo_permeabilidad',
            difficulty: 'medium',
            q: 'Si a una bobina con núcleo de aire se le introduce un núcleo de hierro de alta permeabilidad magnética (μ), su inductancia:',
            options: [
                'Aumenta significativamente porque el hierro concentra el flujo magnético',
                'Disminuye a cero porque el hierro cancela el campo',
                'Permanece idéntica ya que sólo dependen las vueltas',
                'Se convierte en resistencia pura disipando calor'
            ],
            correct: 0
        },
        {
            id: 'ee-2-8-q4',
            objective: 'Analizar el comportamiento en DC en estado estable',
            concept: 'inductor_dc_estado_estable',
            difficulty: 'medium',
            q: 'En un circuito de corriente directa (DC), después de un largo tiempo de estar conectado (estado estacionario, di/dt = 0), una bobina ideal se comporta como:',
            options: [
                'Un cortocircuito (cable de resistencia nula)',
                'Un circuito abierto que bloquea la corriente',
                'Un capacitor cargado a voltaje máximo',
                'Una fuente de voltaje oscilante'
            ],
            correct: 0
        },
        {
            id: 'ee-2-8-q5',
            objective: 'Aplicar la Ley de Lenz',
            concept: 'ley_de_lenz',
            difficulty: 'medium',
            q: 'Según la Ley de Lenz, cuando la corriente que atraviesa una bobina intenta aumentar bruscamente, la bobina genera una fuerza contraelectromotriz que:',
            options: [
                'Se opone al incremento de corriente creando un voltaje inverso',
                'Acelera la corriente para que llegue al valor final instantáneamente',
                'Invierte la dirección de los polos magnéticos del planeta',
                'Descarga chispas térmicas de alta energía'
            ],
            correct: 0
        },
        {
            id: 'ee-2-8-q6',
            objective: 'Comprender la función del diodo flyback',
            concept: 'diodo_flyback',
            difficulty: 'hard',
            q: '¿Cuál es la función principal de conectar un diodo rectificador en polarización inversa en paralelo con la bobina de un relé (Diodo Flyback)?',
            options: [
                'Proporcionar un camino seguro para disipar el pico de alto voltaje inductivo al desconectar la bobina, protegiendo al transistor de control',
                'Aumentar la fuerza de atracción mecánica del contacto del relé',
                'Convertir la corriente directa en corriente alterna de 60 Hz',
                'Evitar que la corriente fluya hacia la carga de alta potencia'
            ],
            correct: 0
        },
        {
            id: 'ee-2-8-q7',
            objective: 'Identificar los contactos de un relé',
            concept: 'contactos_rele',
            difficulty: 'easy',
            q: 'En un relé electromecánico de 5 pines, el contacto que permanece abierto cuando la bobina NO tiene energía se denomina:',
            options: [
                'Normalmente Abierto (NO / NA)',
                'Normalmente Cerrado (NC)',
                'Común (COM)',
                'Terminal de Bobina (COIL)'
            ],
            correct: 0
        },
        {
            id: 'ee-2-8-q8',
            objective: 'Principio de funcionamiento del motor DC',
            concept: 'motor_fuerza_lorentz',
            difficulty: 'medium',
            q: 'Un motor eléctrico de corriente continua basa su giro en la Fuerza de Lorentz, la cual establece que:',
            options: [
                'Un conductor con corriente inmerso en un campo magnético experimenta una fuerza mecánica perpendicular',
                'Dos cargas del mismo signo siempre se atraen entre sí',
                'El voltaje es inversamente proporcional a la resistencia del devanado',
                'La temperatura ambiente incrementa la velocidad de rotación'
            ],
            correct: 0
        },
        {
            id: 'ee-2-8-q9',
            objective: 'Función del conmutador en un motor',
            concept: 'conmutador_motor',
            difficulty: 'hard',
            q: '¿Por qué es indispensable el conmutador de delgas en un motor DC con escobillas?',
            options: [
                'Porque invierte la dirección de la corriente en las espiras cada medio giro, asegurando que el torque mecánico siempre apunte en el mismo sentido',
                'Porque lubrica los cojinetes mecánicos durante el arranque',
                'Porque filtra el ruido eléctrico de alta frecuencia',
                'Porque convierte el motor en un generador solar'
            ],
            correct: 0
        },
        {
            id: 'ee-2-8-q10',
            objective: 'Control de sentido y velocidad en motores DC',
            concept: 'control_motor_dc',
            difficulty: 'medium',
            q: 'Para controlar electrónicamente tanto el sentido de giro como la velocidad de un motor DC desde un microcontrolador, la mejor solución es utilizar:',
            options: [
                'Un circuito Puente H (como el L298N) combinado con señales de modulación por ancho de pulsos (PWM)',
                'Un resistor variable (potenciómetro) de 100 kΩ conectado en serie',
                'Un transformador de corriente alterna de 110V',
                'Un capacitor de tantalio de 1 µF'
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
                id: 'ee-2-8-content',
                content: lessonDefinition.content
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ee-2-8-review',
                flashcards: lessonDefinition.flashcards
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-2-8-quiz',
                title: 'Evaluación: Bobinas, Inducción Electromagnética, Relés y Motores DC',
                questions: lessonDefinition.questions,
                quizConfig: {
                    timePerQuestion: 30,
                    requiredScorePercent: 80
                }
            })
        ]
    }
});
