import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Motores DC y Puente H (L298N)',
    content: `
        <div class="lesson-intro">
            <p>Los microcontroladores como Arduino operan con señales lógicas de baja corriente (máximo 20 mA a 40 mA por pin). Un <strong>Motor de Corriente Continua (DC)</strong> puede requerir cientos de miliamperios o amperios para girar y mover un robot. En esta lección aprenderás a gobernar potencia, sentido de giro y velocidad utilizando el <strong>Driver Puente H L298N</strong>.</p>
        </div>

        <div class="theory-section">
            <h3 id="re-m2-2-1">1. ¿Qué es un Motor DC y por qué requiere un Driver?</h3>
            <p>Un motor DC es un actuador electromecánico que transforma energía eléctrica en rotación mecánica. Si intentas conectar un motor directamente a un pin de Arduino, ocurrirá un exceso de demanda de corriente que puede dañar permanentemente la placa.</p>
            
            <div class="highlight-panel" style="background: rgba(239, 68, 68, 0.08); border-left: 4px solid #ef4444; padding: 1rem; border-radius: 12px; margin: 1rem 0;">
                <p><strong>Regla de Oro en Robótica:</strong></p>
                <p style="margin-bottom: 0; color: #f8fafc; line-height: 1.6;"><strong>Arduino piensa, el Driver alimenta.</strong> Arduino envía señales de control lógicas (5V/0V), mientras que una fuente de alimentación externa (baterías de 7.4V a 12V) suministra la potencia a través del driver.</p>
            </div>

            <!-- Comparativa Visual: Motor DC Simple vs Motorreductor TT Amarillo vs Vista Interna Engranajes -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin: 1.25rem 0;">
                <!-- Motor DC Universal sin Reductor -->
                <div style="background: rgba(15, 23, 42, 0.7); border: 1.5px solid rgba(148, 163, 184, 0.25); border-radius: 18px; padding: 1.25rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <div style="font-size: 0.78rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.75rem;">
                        ⚙️ Motor DC Directo (Sin Reductor)
                    </div>
                    <div style="width: 100%; height: 190px; border-radius: 12px; overflow: hidden; background: #ffffff; border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
                        <img 
                            src="https://orellanaelec.com/wp-content/uploads/2023/03/MOT007-Motor-DC-Estudiante-3V-12V-Universal.jpg" 
                            alt="Motor DC Estudiante 3V-12V Universal sin Reductor" 
                            style="max-width: 100%; max-height: 100%; object-fit: contain; padding: 8px;"
                            loading="lazy"
                        />
                    </div>
                    <p style="font-size: 0.78rem; color: #cbd5e1; margin: 0.75rem 0 0; line-height: 1.4;">
                        <strong>Alta velocidad (~10.000 RPM)</strong> y <strong>muy bajo torque</strong>. Si se conecta una rueda directo al eje, se frena de inmediato por el peso.
                    </p>
                </div>

                <!-- Motorreductor TT Amarillo con Caja de Engranajes -->
                <div style="background: rgba(15, 23, 42, 0.7); border: 1.5px solid rgba(234, 179, 8, 0.35); border-radius: 18px; padding: 1.25rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <div style="font-size: 0.78rem; font-weight: 800; color: #facc15; text-transform: uppercase; margin-bottom: 0.75rem;">
                        🏎️ Motorreductor TT Amarillo
                    </div>
                    <div style="width: 100%; height: 190px; border-radius: 12px; overflow: hidden; background: #ffffff; border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
                        <img 
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdl0cTkp6RUijoEuGOZmAqibxU5ieBVV6yMnkEZLveWhu1FUz-yf_xgPSO&s=10" 
                            alt="Motorreductor TT Amarillo con caja de engranajes y rueda" 
                            style="max-width: 100%; max-height: 100%; object-fit: contain; padding: 8px;"
                            loading="lazy"
                        />
                    </div>
                    <p style="font-size: 0.78rem; color: #cbd5e1; margin: 0.75rem 0 0; line-height: 1.4;">
                        Formato estándar de robótica educativa móvil. Eje plástico con doble muesca para fijar ruedas de tracción y discos encoder.
                    </p>
                </div>

                <!-- Vista Interna: Caja Reductora Desarmada -->
                <div style="background: rgba(15, 23, 42, 0.7); border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 18px; padding: 1.25rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 0.75rem;">
                        🔍 Interior: Tren de Engranajes (1:48)
                    </div>
                    <div style="width: 100%; height: 190px; border-radius: 12px; overflow: hidden; background: #ffffff; border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
                        <img 
                            src="https://complubot.com/wp-content/uploads/2024/06/reductora.webp" 
                            alt="Interior del motorreductor TT con tren de piñones y engranajes reductores" 
                            style="max-width: 100%; max-height: 100%; object-fit: contain; padding: 8px;"
                            loading="lazy"
                        />
                    </div>
                    <p style="font-size: 0.78rem; color: #cbd5e1; margin: 0.75rem 0 0; line-height: 1.4;">
                        El piñón metálico del motor hace girar una cascada de engranajes reductores que <strong>multiplican el torque 48 veces</strong> y bajan la velocidad a ~200 RPM.
                    </p>
                </div>
            </div>
        </div>

        <div class="theory-section">
            <h3 id="re-m2-2-2">2. El Principio del Puente H</h3>
            <p>Un <strong>Puente H</strong> es un arreglo topológico de 4 interruptores electrónicos (transistores o MOSFETs) que permite invertir la polaridad de voltaje aplicada a los bornes del motor, logrando que gire en <strong>sentido horario</strong> o <strong>antihorario</strong> sin desconectar cables.</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin: 1.25rem 0;">
                <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 1rem;">
                    <h4 style="color: #34d399; margin-bottom: 0.5rem;">Giro Horario (Avance)</h4>
                    <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.5; margin: 0;">
                        <code>IN1 = HIGH</code> y <code>IN2 = LOW</code>.<br/>
                        La corriente fluye de izquierda a derecha.
                    </p>
                </div>
                <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 16px; padding: 1rem;">
                    <h4 style="color: #f87171; margin-bottom: 0.5rem;">Giro Antihorario (Retroceso)</h4>
                    <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.5; margin: 0;">
                        <code>IN1 = LOW</code> y <code>IN2 = HIGH</code>.<br/>
                        La corriente fluye de derecha a izquierda.
                    </p>
                </div>
                <div style="background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 16px; padding: 1rem;">
                    <h4 style="color: #fbbf24; margin-bottom: 0.5rem;">Frenado Activo vs Libre</h4>
                    <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.5; margin: 0;">
                        <code>HIGH, HIGH</code>: Frena en seco.<br/>
                        <code>LOW, LOW</code>: Queda en punto muerto (rueda libre).
                    </p>
                </div>
            </div>
        </div>

        <div class="theory-section">
            <h3 id="re-m2-2-3">3. Pines del Módulo Driver L298N y Diagrama de Conexión</h3>
            <p>El módulo comercial <strong>L298N (Rojo con Disipador de Aluminio)</strong> integra un Doble Puente H capaz de controlar <strong>2 motores DC independientes</strong> (Motor A y Motor B) o 1 motor paso a paso de hasta 2 Amperios por canal:</p>
            
            <!-- Tarjetas de Imagen Didáctica: Módulo L298N, 1 Motor con Jumper y 2 Motores -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; margin: 1.25rem 0;">
                <div style="background: rgba(15, 23, 42, 0.7); border: 1.5px solid rgba(56, 189, 248, 0.25); border-radius: 18px; padding: 1.25rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 0.75rem;">
                        📍 Distribución de Pines (Pinout L298N)
                    </div>
                    <div style="width: 100%; height: 210px; border-radius: 12px; overflow: hidden; background: #ffffff; border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
                        <img 
                            src="https://cdn.shopify.com/s/files/1/0069/0028/5529/files/Conexiones-L298N_large.png?v=1565798280" 
                            alt="Módulo L298N Pinout y Bornes" 
                            style="max-width: 100%; max-height: 100%; object-fit: contain; padding: 6px;"
                            loading="lazy"
                        />
                    </div>
                    <p style="font-size: 0.78rem; color: #94a3b8; margin: 0.75rem 0 0; line-height: 1.4;">
                        Borneras de potencia (+12V, GND, +5V), salidas Motor A/B (OUT1 a OUT4) y jumpers ENA/ENB.
                    </p>
                </div>

                <div style="background: rgba(15, 23, 42, 0.7); border: 1.5px solid rgba(245, 158, 11, 0.25); border-radius: 18px; padding: 1.25rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <div style="font-size: 0.78rem; font-weight: 800; color: #fbbf24; text-transform: uppercase; margin-bottom: 0.75rem;">
                        🔌 Conexión 1 Motor con Jumper (Vel. Fija 100%)
                    </div>
                    <div style="width: 100%; height: 210px; border-radius: 12px; overflow: hidden; background: #ffffff; border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
                        <img 
                            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEitiFLrr-K1gOIKfVX0BdDk1Z9rWvs17H22YzarjJrTSH0IVC0UonRMEXUC29LA5bIpTREMOE4VSwdGz3P0bmhgCxuFv0sISo_l6-ASKVWEXd3964QCPsV8zjZ0MRLbfoartuySn6jXRas/s1600/Puente+H+%25286%2529.jpg" 
                            alt="Conexión L298N 1 Motor con Jumper y Arduino" 
                            style="max-width: 100%; max-height: 100%; object-fit: contain; padding: 6px;"
                            loading="lazy"
                        />
                    </div>
                    <p style="font-size: 0.78rem; color: #94a3b8; margin: 0.75rem 0 0; line-height: 1.4;">
                        Con el <strong>jumper negro colocado en ENA</strong>, el pin queda fijado a +5V permanente (velocidad máxima). Solo controlas sentido con IN1/IN2.
                    </p>
                </div>

                <div style="background: rgba(15, 23, 42, 0.7); border: 1.5px solid rgba(16, 185, 129, 0.25); border-radius: 18px; padding: 1.25rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <div style="font-size: 0.78rem; font-weight: 800; color: #34d399; text-transform: uppercase; margin-bottom: 0.75rem;">
                        🤖 Conexión Robótica Dual (2 Motores + Arduino)
                    </div>
                    <div style="width: 100%; height: 210px; border-radius: 12px; overflow: hidden; background: #ffffff; border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
                        <img 
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3zGMg-BN54VfWkcC4_DXCYNF0FN97Oi52LoGmYOwoZxkR3kp23F3CYys&s=10" 
                            alt="Conexión L298N con Arduino y 2 Motores DC" 
                            style="max-width: 100%; max-height: 100%; object-fit: contain; padding: 6px;"
                            loading="lazy"
                        />
                    </div>
                    <p style="font-size: 0.78rem; color: #94a3b8; margin: 0.75rem 0 0; line-height: 1.4;">
                        Esquema típico de robot móvil diferencial con batería externa y GND compartido con Arduino.
                    </p>
                </div>
            </div>

            <div style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; padding: 1rem; border-radius: 12px; margin: 1rem 0;">
                <h4 style="color: #38bdf8; margin: 0 0 0.5rem; font-size: 0.95rem;">💡 ¿Cuándo usar el Jumper y cuándo quitarlo?</h4>
                <ul style="color: #cbd5e1; line-height: 1.7; padding-left: 1.2rem; margin: 0; font-size: 0.9rem;">
                    <li><strong>Con Jumper Puesto:</strong> El pin ENA se puentea internamente a <code>+5V (HIGH permanente)</code>. El motor siempre gira al <strong>100% de potencia</strong> y ahorras un pin en Arduino (solo usas IN1 e IN2 para giro horario/antihorario).</li>
                    <li><strong>Sin Jumper (Control PWM):</strong> Retiras el capuchón negro y conectas el pin macho ENA a un pin digital PWM de Arduino (como el Pin 9). Esto permite regular la velocidad suavemente con <code>analogWrite(9, valor)</code> entre 0 y 255.</li>
                </ul>
            </div>

            <!-- Sección Comparativa: Familia de Drivers en Robótica Educativa -->
            <div style="margin-top: 1.75rem; background: rgba(168, 85, 247, 0.06); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 18px; padding: 1.25rem;">
                <h4 style="color: #c084fc; margin-top: 0; margin-bottom: 0.75rem; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                    🔬 Comparativa Técnica: L298N vs L293D vs L9110
                </h4>
                <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.5;">
                    En proyectos de robótica te encontrarás con otras alternativas muy populares según el tamaño del robot y la corriente:
                </p>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-top: 1rem;">
                    <!-- Tarjeta L293D -->
                    <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
                        <span style="font-size: 0.8rem; font-weight: 800; color: #fbbf24; margin-bottom: 0.5rem;">CI L293D (Formato DIP-16)</span>
                        <div style="width: 100%; height: 140px; border-radius: 8px; overflow: hidden; background: #ffffff; border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
                            <img 
                                src="https://dinastiatecnologica.com/wp-content/uploads/2023/10/l293d_pines_large.webp" 
                                alt="Circuito Integrado L293D Pines" 
                                style="max-width: 100%; max-height: 100%; object-fit: contain; padding: 4px;"
                                loading="lazy"
                            />
                        </div>
                        <p style="font-size: 0.75rem; color: #94a3b8; margin: 0.5rem 0 0; line-height: 1.4;">
                            Chip compacto ideal para protoboard. Soporta hasta <strong>600 mA</strong> por canal con diodos internos de protección flyback.
                        </p>
                    </div>

                    <!-- Tarjeta L9110 -->
                    <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
                        <span style="font-size: 0.8rem; font-weight: 800; color: #38bdf8; margin-bottom: 0.5rem;">Módulo Mini L9110 / HG7881</span>
                        <div style="width: 100%; height: 140px; border-radius: 8px; overflow: hidden; background: #ffffff; border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
                            <img 
                                src="https://www.dynamoelectronics.com/wp-content/uploads/2023/02/pines-de-control.webp" 
                                alt="Driver L9110 Pines de Control" 
                                style="max-width: 100%; max-height: 100%; object-fit: contain; padding: 4px;"
                                loading="lazy"
                            />
                        </div>
                        <p style="font-size: 0.75rem; color: #94a3b8; margin: 0.5rem 0 0; line-height: 1.4;">
                            Ultra compacto para mini robots. Controla 2 motores con solo 4 pines (A-IA, A-IB, B-IA, B-IB) hasta <strong>800 mA</strong> continuos.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="theory-section">
            <h3 id="re-m2-2-4">4. Laboratorio Básico: Solo Sentido de Giro (Jumper Fijo)</h3>
            <p>Antes de aprender a controlar la velocidad, practica únicamente el sentido de giro. Con el <strong>jumper negro colocado en ENA</strong>, el motor siempre recibe potencia completa y tú solo decides la dirección con <code>IN1</code> e <code>IN2</code>:</p>
            <div id="l298n-fixed-simulator-container"></div>
        </div>

        <div class="theory-section">
            <h3 id="re-m2-2-5">5. Control de Velocidad: ¿Qué es <code>analogWrite</code> y el PWM?</h3>
            <p>Para variar la velocidad del motor necesitas <strong>quitar el jumper</strong> y conectar el pin ENA a un pin digital PWM de Arduino (como el <strong>Pin 9, marcado con ~</strong>). Esto te permite usar la función <code>analogWrite()</code>.</p>

            <div style="background: rgba(56, 189, 248, 0.07); border-left: 4px solid #38bdf8; padding: 1.1rem 1.25rem; border-radius: 14px; margin: 1.25rem 0;">
                <h4 style="color: #38bdf8; margin: 0 0 0.5rem; font-size: 1rem;">&#x26A1; ¿Qué es PWM (Pulse Width Modulation)?</h4>
                <p style="color: #cbd5e1; line-height: 1.65; margin: 0; font-size: 0.9rem;">
                    Arduino no puede entregar voltajes variables entre 0V y 5V. En cambio, <strong>enciende y apaga el pin muy rápidamente</strong> (miles de veces por segundo). Si está encendido el 50% del tiempo, el motor percibe aproximadamente la mitad de la potencia. A esto se le llama <strong>Modulación por Ancho de Pulso (PWM)</strong>.
                </p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin: 1.25rem 0;">
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 1rem; text-align: center;">
                    <div style="font-size: 0.75rem; font-weight: 800; color: #f87171; text-transform: uppercase; margin-bottom: 0.5rem;">analogWrite(ENA, 0)</div>
                    <div style="background: #0f172a; border-radius: 8px; padding: 0.5rem; font-family: monospace; font-size: 0.8rem; color: #64748b; letter-spacing: 2px;">&#x2581;&#x2581;&#x2581;&#x2581;&#x2581;&#x2581;&#x2581;&#x2581;&#x2581;&#x2581;&#x2581;&#x2581;</div>
                    <p style="font-size: 0.78rem; color: #94a3b8; margin: 0.5rem 0 0;">0% de potencia — Motor detenido</p>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(250, 204, 21, 0.3); border-radius: 16px; padding: 1rem; text-align: center;">
                    <div style="font-size: 0.75rem; font-weight: 800; color: #facc15; text-transform: uppercase; margin-bottom: 0.5rem;">analogWrite(ENA, 128)</div>
                    <div style="background: #0f172a; border-radius: 8px; padding: 0.5rem; font-family: monospace; font-size: 0.8rem; color: #facc15; letter-spacing: 2px;">&#x2588;&#x2581;&#x2588;&#x2581;&#x2588;&#x2581;&#x2588;&#x2581;&#x2588;&#x2581;&#x2588;&#x2581;</div>
                    <p style="font-size: 0.78rem; color: #94a3b8; margin: 0.5rem 0 0;">50% de potencia — Velocidad media</p>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 1rem; text-align: center;">
                    <div style="font-size: 0.75rem; font-weight: 800; color: #34d399; text-transform: uppercase; margin-bottom: 0.5rem;">analogWrite(ENA, 255)</div>
                    <div style="background: #0f172a; border-radius: 8px; padding: 0.5rem; font-family: monospace; font-size: 0.8rem; color: #34d399; letter-spacing: 2px;">&#x2588;&#x2588;&#x2588;&#x2588;&#x2588;&#x2588;&#x2588;&#x2588;&#x2588;&#x2588;&#x2588;&#x2588;</div>
                    <p style="font-size: 0.78rem; color: #94a3b8; margin: 0.5rem 0 0;">100% de potencia — Velocidad máxima</p>
                </div>
            </div>

            <div style="background: rgba(16, 185, 129, 0.07); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 1.1rem 1.25rem; margin: 1.25rem 0;">
                <h4 style="color: #34d399; margin: 0 0 0.75rem; font-size: 0.95rem;">&#x1F4CB; La función <code>analogWrite(pin, valor)</code></h4>
                <ul style="color: #cbd5e1; line-height: 1.75; padding-left: 1.2rem; margin: 0; font-size: 0.9rem;">
                    <li><strong>pin:</strong> Debe ser un pin PWM de Arduino (marcados con <code>~</code>: 3, 5, 6, 9, 10, 11). Usamos el <strong>Pin 9 → ENA</strong>.</li>
                    <li><strong>valor:</strong> Un entero entre <code>0</code> (0% — motor parado) y <code>255</code> (100% — velocidad máxima).</li>
                    <li>No requiere <code>pinMode(ENA, OUTPUT)</code> separado para funcionar, pero es buena práctica declararlo en <code>setup()</code>.</li>
                    <li>Al quitar el jumper puedes hacer <strong>aceleración gradual</strong>, control de torque y frenado suave.</li>
                </ul>
            </div>

            <pre style="background: rgba(15, 23, 42, 0.72); padding: 1.25rem; border-radius: 18px; border: 1px solid rgba(255,255,255,0.06); overflow-x: auto;"><code style="color: #cbd5e1;">// Jumper QUITADO → Pin 9 conectado a ENA
int ENA = 9;  // Pin PWM (~9)
int IN1 = 8;
int IN2 = 7;

void setup() {
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
}

void loop() {
  // Velocidad baja
  analogWrite(ENA, 80);
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  delay(1500);

  // Velocidad media
  analogWrite(ENA, 150);
  delay(1500);

  // Velocidad maxima
  analogWrite(ENA, 255);
  delay(1500);

  // Detener
  analogWrite(ENA, 0);
  delay(1000);
}</code></pre>
        </div>

        <div class="theory-section">
            <h3 id="re-m2-2-6">6. Laboratorio Completo: Control de Velocidad PWM (Jumper Quitado)</h3>
            <p>Ahora que conoces <code>analogWrite()</code>, usa el simulador completo para experimentar con el control de velocidad y la dirección de forma combinada. Mueve el potenciómetro PWM y observa cómo cambia la señal en el osciloscopio en tiempo real:</p>
            <div id="l298n-motor-simulator-container"></div>
        </div>

    `,
    sections: [
        { id: 're-m2-2-1', title: '1. Motor DC y Necesidad del Driver' },
        { id: 're-m2-2-2', title: '2. Principio del Puente H' },
        { id: 're-m2-2-3', title: '3. Pines del Módulo L298N' },
        { id: 're-m2-2-4', title: '4. Lab. Básico: Solo Sentido de Giro' },
        { id: 're-m2-2-5', title: '5. Control de Velocidad: analogWrite y PWM' },
        { id: 're-m2-2-6', title: '6. Lab. Completo: Control de Velocidad PWM' }
    ],
    flashcards: [
        {
            id: 'f1',
            type: 'theory',
            q: '¿Por qué NO se puede conectar un motor DC directamente a un pin de Arduino?',
            a: 'El pin solo entrega ~40 mA y el motor exige cientos de mA',
            sub: 'Un Arduino Uno puede destruir su microcontrolador si un motor le extrae más de 40 mA. El driver L298N actúa como intermediario de potencia.',
            sectionId: 're-m2-2-1'
        },
        {
            id: 'f2',
            type: 'hw',
            q: '¿Qué es un Puente H y para qué sirve en el control de motores?',
            a: 'Arreglo de 4 transistores que invierte la polaridad del motor',
            sub: 'Al cerrar pares opuestos de transistores, la corriente fluye en un sentido u otro por las bobinas del motor, cambiando su dirección de giro.',
            sectionId: 're-m2-2-2'
        },
        {
            id: 'f3',
            type: 'code',
            q: '¿Qué combinación de IN1 e IN2 hace girar el motor hacia ADELANTE?',
            a: 'IN1 = HIGH · IN2 = LOW',
            sub: 'Polariza M+ positivo y M- a tierra. Es la condición que produce giro horario (avance) en el Motor A del L298N.',
            sectionId: 're-m2-2-2'
        },
        {
            id: 'f4',
            type: 'code',
            q: '¿Qué combinación de IN1 e IN2 hace girar el motor hacia ATRÁS (retroceso)?',
            a: 'IN1 = LOW · IN2 = HIGH',
            sub: 'Invierte la polaridad: M- queda positivo y M+ a tierra, forzando giro antihorario (retroceso).',
            sectionId: 're-m2-2-2'
        },
        {
            id: 'f5',
            type: 'hw',
            q: '¿Qué diferencia hay entre usar el L298N con Jumper en ENA vs sin Jumper?',
            a: 'Con Jumper: velocidad fija 100%. Sin Jumper: velocidad variable con analogWrite()',
            sub: 'El Jumper cortocircuita ENA a VCC forzando potencia completa. Al retirarlo, conectas ENA a un pin PWM (~9) para modular la velocidad.',
            sectionId: 're-m2-2-4'
        },
        {
            id: 'f6',
            type: 'theory',
            q: '¿Qué es PWM (Pulse Width Modulation) y por qué lo necesita el motor?',
            a: 'Encendido y apagado rápido del pin para simular un voltaje variable',
            sub: 'Arduino no puede variar el voltaje entre 0V y 5V. Con PWM activa el pin miles de veces por segundo; al 50% el motor percibe la mitad de la potencia.',
            sectionId: 're-m2-2-5'
        },
        {
            id: 'f7',
            type: 'code',
            q: '¿Cuál es el rango de valores de analogWrite() y qué representa cada extremo?',
            a: '0 = motor detenido (0%) · 255 = velocidad máxima (100%)',
            sub: 'analogWrite() usa resolución de 8 bits (0–255). Un valor de 128 corresponde aproximadamente al 50% de la potencia entregada al motor.',
            sectionId: 're-m2-2-5'
        },
        {
            id: 'f8',
            type: 'theory',
            q: '¿Qué ocurre cuando IN1 = HIGH e IN2 = HIGH al mismo tiempo?',
            a: 'Freno activo: las bobinas se cortocircuitan frenando el eje en seco',
            sub: 'Ambos bornes del motor quedan al mismo potencial, generando un freno electromagnético inmediato. Distinto al punto muerto donde el eje rueda libre.',
            sectionId: 're-m2-2-2'
        },
        {
            id: 'f9',
            type: 'hw',
            q: '¿Por qué es obligatorio unir el GND de Arduino con el GND de la batería externa del motor?',
            a: 'Tierra común: sin ella las señales lógicas de 5V no tienen referencia válida',
            sub: 'Si los GND están separados, el nivel de 0V de Arduino y el de la batería difieren, haciendo que los pines IN1/IN2 no sean reconocidos correctamente por el driver.',
            sectionId: 're-m2-2-3'
        },
        {
            id: 'f10',
            type: 'hw',
            q: '¿A qué tipo de pin de Arduino DEBE conectarse el pin ENA para controlar velocidad?',
            a: 'Pin digital PWM, marcado con ~ (tilde): 3, 5, 6, 9, 10 u 11',
            sub: 'Solo los pines con ~ soportan analogWrite(). El Pin 9 (~9) es el más usado para ENA en proyectos con L298N.',
            sectionId: 're-m2-2-5'
        }
    ],
    questions: [
        {
            id: 1,
            question: '¿Cuál es la razón principal por la que un motor DC NO puede conectarse directamente a un pin digital de Arduino?',
            options: [
                'Los pines de Arduino solo entregan ~40 mA, pero los motores demandan cientos de mA, lo que destruiría el microcontrolador.',
                'Porque Arduino trabaja en corriente alterna y los motores son de corriente continua.',
                'Porque los motores necesitan señales de radio frecuencia para funcionar.',
                'Porque los pines de Arduino solo emiten señales de audio.'
            ],
            correct: 0,
            explanation: 'Un pin de Arduino Uno suministra como máximo 40 mA. Un motor DC típico consume entre 200 mA y varios amperios. Conectarlos directamente quemaría el chip ATmega328P irreversiblemente.'
        },
        {
            id: 2,
            question: '¿Qué combinación de los pines IN1 e IN2 hace que el Motor A del L298N gire en sentido HORARIO (avance)?',
            options: [
                'IN1 = HIGH, IN2 = LOW',
                'IN1 = LOW, IN2 = LOW',
                'IN1 = HIGH, IN2 = HIGH',
                'IN1 = LOW, IN2 = HIGH'
            ],
            correct: 0,
            explanation: 'IN1 = HIGH e IN2 = LOW polariza el borne M+ positivo y M- a tierra, haciendo fluir la corriente en la dirección que produce giro horario (avance).'
        },
        {
            id: 3,
            question: 'Un estudiante coloca el Jumper negro en el pin ENA del módulo L298N. ¿Qué efecto tiene esto sobre la velocidad del motor?',
            options: [
                'El motor siempre gira a máxima velocidad (100%) sin posibilidad de variarla con código.',
                'El motor se detiene completamente hasta que se retire el jumper.',
                'El motor oscila entre 0% y 100% de velocidad automáticamente.',
                'El motor solo responde a comandos Bluetooth.'
            ],
            correct: 0,
            explanation: 'El Jumper cortocircuita ENA directamente a VCC (+5V), equivalente a analogWrite(ENA, 255). El motor recibe potencia completa y la velocidad no se puede modular desde código.'
        },
        {
            id: 4,
            question: '¿Qué significa que un pin de Arduino trabaje con PWM (Pulse Width Modulation)?',
            options: [
                'El pin enciende y apaga su salida miles de veces por segundo, simulando un voltaje proporcional al ciclo de trabajo.',
                'El pin puede entregar voltajes variables entre 0V y 12V de forma analógica.',
                'El pin transmite datos en protocolo WiFi.',
                'El pin mide la resistencia del motor en tiempo real.'
            ],
            correct: 0,
            explanation: 'Arduino no puede variar el voltaje de 0 a 5V de forma analógica. Con PWM, alterna rápidamente entre HIGH y LOW; un ciclo de trabajo del 50% hace que el motor perciba aproximadamente la mitad de la potencia.'
        },
        {
            id: 5,
            question: '¿Cuál es el rango de valores del segundo parámetro de la función analogWrite(pin, valor)?',
            options: [
                'De 0 a 255 (resolución de 8 bits).',
                'De 0 a 1023 (resolución de 10 bits).',
                'De -255 a +255.',
                'De 0 a 5000 mV.'
            ],
            correct: 0,
            explanation: 'Las salidas PWM de Arduino Uno tienen resolución de 8 bits. analogWrite(ENA, 0) detiene el motor y analogWrite(ENA, 255) lo lleva a velocidad máxima.'
        },
        {
            id: 6,
            question: 'En el Simulador Básico (Jumper Fijo), un estudiante presiona el botón "retroceder()". ¿Qué valores de pines se activan?',
            options: [
                'IN1 = LOW, IN2 = HIGH → el motor gira en sentido antihorario.',
                'IN1 = HIGH, IN2 = HIGH → freno activo.',
                'IN1 = HIGH, IN2 = LOW → avance.',
                'IN1 = LOW, IN2 = LOW → punto muerto.'
            ],
            correct: 0,
            explanation: 'Para retroceso: IN1 = LOW e IN2 = HIGH. Esto invierte la polaridad en los bornes M+ y M- del motor, produciendo giro antihorario. El indicador de RPM mostraría −150 RPM.'
        },
        {
            id: 7,
            question: '¿Qué sucede eléctricamente cuando se establece IN1 = HIGH e IN2 = HIGH simultáneamente?',
            options: [
                'Freno activo: ambos bornes del motor quedan al mismo potencial, deteniendo el eje bruscamente.',
                'El motor gira al doble de velocidad.',
                'El driver L298N se reinicia.',
                'Se produce un punto muerto idéntico a IN1 = LOW, IN2 = LOW.'
            ],
            correct: 0,
            explanation: 'Con ambas entradas en HIGH, los dos bornes del motor quedan conectados al mismo nivel de potencial. Esto genera un frenado electromagnético activo, mucho más brusco que el punto muerto (LOW, LOW) donde el eje rueda libre.'
        },
        {
            id: 8,
            question: 'En el Simulador Completo (Jumper Quitado), ¿qué representa la señal que se visualiza en el osciloscopio cuando analogWrite(ENA, 128)?',
            options: [
                'Una onda cuadrada con ciclo de trabajo del ~50%: el pin está activo la mitad del tiempo.',
                'Una onda sinusoidal de 50 Hz como la corriente domiciliaria.',
                'Una señal plana de 2.5V analógicos constantes.',
                'Una onda triangular de alta frecuencia.'
            ],
            correct: 0,
            explanation: 'El valor 128 de 255 equivale al 50% del ciclo de trabajo PWM. En el osciloscopio se aprecia una onda cuadrada donde el pin está en HIGH el mismo tiempo que en LOW, haciendo que el motor reciba aproximadamente la mitad de la potencia.'
        },
        {
            id: 9,
            question: '¿A qué tipo de pin de Arduino DEBES conectar el pin ENA del L298N si quieres controlar la velocidad con analogWrite()?',
            options: [
                'A un pin digital PWM, identificado con el símbolo ~ (tilde): por ejemplo el Pin 9 (~9).',
                'A cualquier pin digital, incluidos los pines 0 y 1 (TX/RX).',
                'Al pin A0 (entrada analógica) del Arduino.',
                'Al pin AREF del Arduino.'
            ],
            correct: 0,
            explanation: 'Solo los pines marcados con ~ (como 3, 5, 6, 9, 10, 11 en Arduino Uno) soportan analogWrite(). El Pin 9 (~9) es ideal para ENA sin interferir con la comunicación Serial.'
        },
        {
            id: 10,
            question: '¿Por qué es OBLIGATORIO conectar el GND de Arduino con el GND de la batería externa que alimenta el motor?',
            options: [
                'Para establecer una referencia de 0V común; sin ella, las señales HIGH de 5V no serían reconocidas correctamente por el driver.',
                'Porque si no se unen los GND, la batería se descarga el doble de rápido.',
                'Para que la batería cargue el condensador interno del Arduino.',
                'Porque el driver L298N necesita dos tierras independientes para funcionar.'
            ],
            correct: 0,
            explanation: 'El voltaje es siempre relativo. Si Arduino y la batería no comparten tierra (GND), el nivel de 5V que Arduino envía a IN1/IN2 no tiene una referencia de 0V válida para el driver, causando comportamiento impredecible en el motor.'
        }
    ]
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 're-m2-l2-content',
                content: lessonDefinition.content
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 're-m2-l2-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        prueba: [
            createQuizBlock({
                id: 're-m2-l2-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions
            })
        ]
    }
});
