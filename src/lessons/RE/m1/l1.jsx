import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Mi primer parpadeo (Entorno y Salidas Digitales)',
    content: `
        <h3 id="re-1-1" style="color: #a855f7; margin: 1.5rem 0 1rem;">1.1 Introducción al Hardware Abierto</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">El <strong>hardware abierto</strong> se refiere a dispositivos cuyas especificaciones de diseño son públicas, permitiendo que cualquiera los estudie, modifique y construya. Arduino es el ejemplo más popular y exitoso de este movimiento a nivel mundial.</p>
        
        <h3 id="re-1-2" style="color: #a855f7; margin: 1.5rem 0 1rem;">1.2 ¿Qué es Arduino?</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">Arduino es una <strong>plataforma de desarrollo</strong> basada en hardware y software libre. Consiste en una placa con un microcontrolador que puede ser programada para interactuar con el mundo físico mediante una gran variedad de sensores y actuadores.</p>
        <p style="margin-bottom: 1rem; line-height: 1.8;">Fue creado en 2005 en Italia para que estudiantes pudieran crear proyectos interactivos de manera sencilla y económica. Hoy es la plataforma de hardware más popular del mundo.</p>
        <p style="margin-bottom: 1rem; line-height: 1.8;">El nombre "Arduino" proviene de un bar italiano llamado <strong>Bar di Arduino</strong>, donde se reunían los fundadores del proyecto. El fundador principal fue <strong>Massimo Banzi</strong>, quien quería crear una herramienta accesible para que personas sin experiencia en electrónica pudieran crear dispositivos digitales capaces de interactuar con su entorno.</p>
        <p style="margin-bottom: 1rem; line-height: 1.8;">A diferencia de una computadora tradicional, Arduino está diseñado para <strong>controlar elementos del mundo real</strong>: puede leer sensores de temperatura, detectar movimiento, controlar motores, encender luces LED, y mucho más. Esto lo convierte en la herramienta ideal para proyectos de <strong>Internet de las Cosas (IoT)</strong>, robótica, automatización del hogar y arte digital.</p>
        
        <style>
            .ds-container { background: rgba(15, 23, 42, 0.6); padding: 1.5rem; border-radius: 32px; border: 1px solid rgba(168,85,247,0.15); margin-bottom: 2rem; }
            .ds-main-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 2.5rem; align-items: center; }
            .ds-left-col { display: flex; flex-direction: column; gap: 1.5rem; }
            .ds-left-title { color: #a855f7; margin: 0; font-size: 1.4rem; font-weight: 800; }
            .ds-cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
            .ds-card { padding: 0.85rem; border-radius: 18px; border: 1px solid rgba(255,255,255,0.03); display: flex; flex-direction: column; gap: 0.25rem; }
            .ds-card-title { font-weight: 800; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; }
            .ds-card-main { color: white; font-size: 0.95rem; font-weight: 700; line-height: 1.2; }
            .ds-card-desc { color: #94a3b8; font-size: 0.75rem; margin: 0; line-height: 1.3; }
            
            @media (max-width: 1440px) {
                .ds-main-grid { gap: 1.5rem; }
                .ds-card-main { font-size: 0.82rem; }
                .ds-card-desc { font-size: 0.7rem; }
                .ds-card { padding: 0.7rem; }
            }
        </style>

        <div class="ds-container">
            <div class="ds-main-grid">
                
                <div class="ds-left-col">
                    <h4 class="ds-left-title">Componentes Principales</h4>
                    <div style="position: relative; display: flex; flex-direction: column; align-items: center; gap: 1.25rem;">
                        <img src="https://i.postimg.cc/CxSNt25F/Arduino-Uno.png" alt="Arduino Uno" style="width: 100%; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 15px 40px rgba(0,0,0,0.5);" />
                        <button class="ds-exp-btn" onclick="if (window.showArduinoParts) { window.showArduinoParts(); } return false;" style="background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid #a855f7; padding: 0.6rem 1.2rem; border-radius: 12px; font-size: 0.95rem; font-weight: bold; cursor: pointer; transition: all 0.3s; width: 100%;">
                            Explorar Partes Interactivas →
                        </button>
                    </div>
                </div>

                <div class="ds-cards-grid">
                    
                    <div class="ds-card" style="grid-column: span 2; background: rgba(168, 85, 247, 0.05); border-color: rgba(168, 85, 247, 0.15);">
                        <div class="ds-card-title" style="color: #a855f7;">Cerebro (Microcontrolador)</div>
                        <div class="ds-card-main">ATmega328P @ 16 MHz<br/><small style="font-size: 0.7rem; opacity: 0.8; font-weight: normal;">(16 millones de instrucciones por segundo)</small></div>
                        <p class="ds-card-desc">32 KB de Memoria Flash para tus sketches.</p>
                    </div>

                    <div class="ds-card" style="background: rgba(59, 130, 246, 0.05); border-color: rgba(59, 130, 246, 0.15);">
                        <div class="ds-card-title" style="color: #3b82f6;">Digital I/O</div>
                        <div class="ds-card-main">14 Pines</div>
                        <p class="ds-card-desc">Señales ON/OFF (0V - 5V).</p>
                    </div>

                    <div class="ds-card" style="background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.15);">
                        <div class="ds-card-title" style="color: #10b981;">Analógicas</div>
                        <div class="ds-card-main">6 Entradas</div>
                        <p class="ds-card-desc">Valores de 0 a 1023 (10 bits).</p>
                    </div>

                    <div class="ds-card" style="background: rgba(251, 191, 36, 0.05); border-color: rgba(251, 191, 36, 0.15);">
                        <div class="ds-card-title" style="color: #fbbf24;">Alimentación</div>
                        <div class="ds-card-main">5V / 7-12V</div>
                        <p class="ds-card-desc">USB o Jack externo.</p>
                    </div>

                    <div class="ds-card" style="background: rgba(249, 115, 22, 0.05); border-color: rgba(249, 115, 22, 0.15);">
                        <div class="ds-card-title" style="color: #f97316;">Interfaces</div>
                        <div class="ds-card-main">UART, SPI, I2C</div>
                        <p class="ds-card-desc">Comunicación serial.</p>
                    </div>

                    <div class="ds-card" style="background: rgba(14, 165, 233, 0.05); border-color: rgba(14, 165, 233, 0.15);">
                        <div class="ds-card-title" style="color: #0ea5e9;">Ecosistema</div>
                        <div class="ds-card-main">Open Hardware</div>
                        <p class="ds-card-desc">Diseños libres (Creative Commons).</p>
                    </div>

                    <div class="ds-card" style="background: rgba(236, 72, 153, 0.05); border-color: rgba(236, 72, 153, 0.15);">
                        <div class="ds-card-title" style="color: #ec4899;">Software</div>
                        <div class="ds-card-main">Arduino IDE</div>
                        <p class="ds-card-desc">Win / Mac / Linux.</p>
                    </div>
                </div>
            </div>
        </div>
        </div></div>
            </div>
        </div>

        <h3 id="re-1-3" style="color: #a855f7; margin: 2rem 0 1rem;">1.3 Herramientas de Desarrollo: IDE y Simulación</h3>
        <p style="color: #cbd5e1; line-height: 1.8; margin-bottom: 1rem;">
            Para dar vida a tus proyectos, necesitas un lugar donde escribir y probar tu código. Dependiendo de si tienes la placa física o prefieres practicar virtualmente, tienes dos opciones principales que puedes usar incluso al mismo tiempo.
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
            
            <div style="background: rgba(30, 41, 59, 0.4); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(59, 130, 246, 0.15); display: flex; flex-direction: column;">
                <div>
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
                        <div style="background: rgba(59, 130, 246, 0.1); padding: 8px; border-radius: 10px; color: #3b82f6;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="M12 18v4"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>
                        </div>
                        <h4 style="color: #3b82f6; margin: 0; font-size: 1.15rem;">Entorno Físico (IDE)</h4>
                    </div>
                    <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.5rem;">
                        Software profesional para instalar en tu PC. Es la herramienta definitiva para programar placas reales y proyectos de hardware físico.
                    </p>
                    <div style="background: rgba(59, 130, 246, 0.05); padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem;">
                        <ul style="color: #94a3b8; font-size: 0.8rem; padding-left: 1rem; margin: 0; line-height: 1.8;">
                            <li>• Descarga gratuita en <strong>arduino.cc</strong></li>
                            <li>• Compatible con <strong>Win, Mac y Linux</strong></li>
                            <li>• Necesario para subir código al <strong>hardware</strong></li>
                        </ul>
                    </div>
                </div>
                <a href="https://www.arduino.cc/en/software" target="_blank" style="display: block; text-align: center; background: rgba(59, 130, 246, 0.15); color: #60a5fa; padding: 10px; border-radius: 10px; font-size: 0.85rem; font-weight: bold; text-decoration: none; border: 1px solid rgba(59, 130, 246, 0.2); transition: all 0.3s; cursor: pointer; margin-top: auto;">Descargar IDE →</a>
            </div>

            <div style="background: rgba(30, 41, 59, 0.4); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(249, 115, 22, 0.15); display: flex; flex-direction: column;">
                <div>
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
                        <div style="background: rgba(249, 115, 22, 0.1); padding: 8px; border-radius: 10px; color: #f97316;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="M12 18v4"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>
                        </div>
                        <h4 style="color: #f97316; margin: 0; font-size: 1.15rem;">Entorno Cloud (Simulado)</h4>
                    </div>
                    <p style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.5rem;">
                        Laboratorio virtual potente y accesible. Ideal para aprender los fundamentos sin miedo a dañar componentes electrónicos reales.
                    </p>
                    <div style="background: rgba(249, 115, 22, 0.05); padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem;">
                        <ul style="color: #94a3b8; font-size: 0.8rem; padding-left: 1rem; margin: 0; line-height: 1.8;">
                            <li>• Acceso en la nube <strong>desde el navegador</strong></li>
                            <li>• Simulación <strong>sin hardware físico</strong></li>
                            <li>• Comparte tus proyectos <strong>con un enlace</strong></li>
                        </ul>
                    </div>
                </div>
                <a href="https://www.tinkercad.com" target="_blank" style="display: block; text-align: center; background: rgba(249, 115, 22, 0.15); color: #fbbf24; padding: 10px; border-radius: 10px; font-size: 0.85rem; font-weight: bold; text-decoration: none; border: 1px solid rgba(249, 115, 22, 0.2); transition: all 0.3s; cursor: pointer; margin-top: auto;">Ir a Tinkercad →</a>
            </div>

        </div>

        <h3 id="re-1-4" style="color: #a855f7; margin: 2rem 0 1rem;">1.4 El Circuito y Componentes</h3>
        <p style="color: #cbd5e1; line-height: 1.8; margin-bottom: 2rem;">
            En esta etapa vamos a preparar el hardware. Para que nuestro código tenga un efecto físico, necesitamos entender los componentes básicos que permitirán que la luz brille y que nuestro Arduino esté protegido.
        </p>

        <div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
            
            <div style="grid-column: span 7; background: rgba(30, 41, 59, 0.4); padding: 1.5rem; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column; gap: 1.5rem;">
                <div style="display: flex; gap: 1rem; align-items: flex-start; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div style="background: rgba(251,191,36,0.1); padding: 10px; border-radius: 12px; color: #fbbf24; flex-shrink: 0;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15 22H9"/><path d="M8 22v-4a6 6 0 1 1 8 0v4"/><path d="M2 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 19.07-1.41-1.41"/></svg>
                    </div>
                    <div>
                        <h4 style="color: #fbbf24; margin-bottom: 0.3rem; font-size: 1rem;">El LED (Diodo)</h4>
                        <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.5;">
                            Emite luz en un solo sentido.
                            <br/><br/>
                            • <strong style="color: #4ade80;">Ánodo (+):</strong> Pata larga (Energía).<br/>
                            • <strong style="color: #f87171;">Cátodo (-):</strong> Pata corta / borde plano (GND).
                        </p>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; align-items: flex-start; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div style="background: rgba(249,115,22,0.1); padding: 10px; border-radius: 12px; color: #f97316; flex-shrink: 0;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m20 7-3-3-4 4-3-3-4 4-3-3-3 3"/></svg>
                    </div>
                    <div>
                        <h4 style="color: #f97316; margin-bottom: 0.3rem; font-size: 1rem;">La Resistencia</h4>
                        <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.5;">
                            Actúa como freno para la corriente, evitando que el LED reciba demasiada energía y se queme. No tiene polaridad (funciona en cualquier sentido).
                        </p>
                        <button onclick="if (window.dispatchShowGuide) window.dispatchShowGuide(); return false;" style="background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2); color: #f97316; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: bold; margin-top: 8px;">Guía de Colores</button>
                    </div>
                </div>
                <div>
                    <h4 style="color: #a855f7; margin-bottom: 1rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
                        Esquema de Conexión
                    </h4>
                    <div style="background: rgba(0,0,0,0.3); padding: 1.25rem; border-radius: 16px; font-family: monospace; font-size: 0.8rem; border: 1px solid rgba(255,255,255,0.03);">
                        <div style="display: grid; grid-template-columns: 80px 100px 100px; gap: 0.4rem; align-items: center;">
                            <span style="color: #a855f7; font-weight: bold;">Pin 13</span>
                            <span style="color: #4ade80; text-align: center;">──────►</span>
                            <span style="color: #fbbf24; font-weight: bold;">Ánodo (+)</span>
                            <span style="color: #f87171; font-weight: bold;">GND</span>
                            <span style="color: #4ade80; text-align: center;">◄─ 220Ω ──</span>
                            <span style="color: #f87171; font-weight: bold;">Cátodo (-)</span>
                        </div>
                    </div>
                    <p style="color: #64748b; font-size: 0.75rem; margin-top: 0.75rem; font-style: italic;">Sigue este orden para evitar errores de conexión.</p>
                </div>
            </div>

            <div style="grid-column: span 5; background: rgba(15, 23, 42, 0.8); padding: 1.5rem; border-radius: 24px; border: 1px solid rgba(16, 185, 129, 0.15); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <h4 style="color: #10b981; margin-bottom: 1rem; font-size: 0.9rem;">Previsualizador del LED</h4>
                <div id="led-simulator-container" style="width: 100%; display: flex; justify-content: center;"></div>
                <p style="color: #64748b; font-size: 0.7rem; margin-top: 1rem; text-align: center;">Haz clic en el circuito para probar el encendido.</p>
            </div>
        </div>

        <h3 id="re-1-5" style="color: #a855f7; margin: 2rem 0 1rem;">1.5 Estructura del Código: La Vida del Programa</h3>
        <p style="margin-bottom: 1.5rem; line-height: 1.8; color: #cbd5e1;">Un programa de Arduino (llamado <strong>Sketch</strong>) es como una receta o un guion. Para que el robot sepa qué hacer, el código debe seguir un orden sagrado dividido en dos grandes bloques:</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
            <div style="background: rgba(59,130,246,0.05); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(59,130,246,0.2);">
                <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.75rem;">
                    <div style="background: #3b82f6; width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 10px #3b82f6;"></div>
                    <code style="color: #60a5fa; font-size: 1.1rem; font-weight: bold;">void setup()</code>
                </div>
                <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6;">
                    <strong>La Preparación:</strong> Ocurre una sola vez cuando conectas la batería o presionas el botón RESET. Es similar a cuando te despiertas y te pones los zapatos para salir.
                    <br/><br/>
                    • Configura si los pines son <strong>INPUT</strong> o <strong>OUTPUT</strong>.<br/>
                    • Inicia la comunicación con la PC.
                </p>
            </div>
            <div style="background: rgba(168,85,247,0.05); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(168,85,247,0.2);">
                <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.75rem;">
                    <div style="background: #a855f7; width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 10px #a855f7; animation: pulse 2s infinite;"></div>
                    <code style="color: #a855f7; font-size: 1.1rem; font-weight: bold;">void loop()</code>
                </div>
                <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6;">
                    <strong>La Acción:</strong> Se repite miles de veces por segundo en un ciclo infinito. Es como el latido de un corazón; mientras haya energía, el código no para.
                    <br/><br/>
                    • Lee sensores constantemente.<br/>
                    • Enciende luces o mueve motores.<br/>
                    • Toma decisiones lógicas.
                </p>
            </div>
        </div>

        <div style="background: rgba(15, 23, 42, 0.4); padding: 1.5rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 2rem;">
            <h4 style="color: #cbd5e1; margin-bottom: 1.25rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                Reglas de Oro del Código
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.03);">
                    <div style="color: #ecc94b; font-weight: bold; margin-bottom: 0.3rem;">Llaves { }</div>
                    <p style="color: #94a3b8; font-size: 0.75rem;">Indican dónde empieza y termina una función. ¡No dejes ninguna abierta!</p>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.03);">
                    <div style="color: #f687b3; font-weight: bold; margin-bottom: 0.3rem;">Punto y coma ;</div>
                    <p style="color: #94a3b8; font-size: 0.75rem;">Es el "punto final" de cada instrucción. Si falta uno, el código dará error.</p>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.03);">
                    <div style="color: #48bb78; font-weight: bold; margin-bottom: 0.3rem;">Comentarios //</div>
                    <p style="color: #94a3b8; font-size: 0.75rem;">Notas para humanos. El Arduino ignora todo lo que escribas después de //.</p>
                </div>
            </div>
        </div>

        <h3 id="re-1-6" style="color: #a855f7; margin: 2.5rem 0 1rem;">1.6 Código Base: Tu primer Blink</h3>
        <p style="margin-bottom: 2rem; line-height: 1.8; color: #cbd5e1;"> El código <strong>Blink</strong> es el "Hola Mundo" de los microcontroladores. Nos permite verificar que el software se comunica con el hardware correctamente.</p>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
            <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); border-left: 4px solid #4ade80;">
                <code style="color: #4ade80; font-weight: bold; font-size: 1rem;">pinMode(pin, modo)</code>
                <p style="color: #94a3b8; font-size: 0.8rem; margin-top: 0.4rem; line-height: 1.5;">Define si un pin es entrada (INPUT) o salida (OUTPUT). Solo en setup().</p>
            </div>

            <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); border-left: 4px solid #60a5fa;">
                <code style="color: #60a5fa; font-weight: bold; font-size: 1rem;">digitalWrite(pin, val)</code>
                <p style="color: #94a3b8; font-size: 0.8rem; margin-top: 0.4rem; line-height: 1.5;">Escribe HIGH (5V) o LOW (0V). Es el interruptor de energía.</p>
            </div>

            <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); border-left: 4px solid #fbbf24;">
                <code style="color: #fbbf24; font-weight: bold; font-size: 1rem;">delay(ms)</code>
                <p style="color: #94a3b8; font-size: 0.8rem; margin-top: 0.4rem; line-height: 1.5;">Pausa el programa en milisegundos (1000ms = 1 seg).</p>
            </div>

            <div style="background: rgba(59, 130, 246, 0.05); padding: 1rem; border-radius: 16px; border: 1px solid rgba(59, 130, 246, 0.1);">
                <h5 style="color: #60a5fa; margin: 0 0 0.5rem; font-size: 0.85rem; text-transform: uppercase; font-weight: 800;">Hardware Tip</h5>
                <p style="color: #cbd5e1; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    El <strong>Pin 13</strong> controla el LED integrado (L). No necesitas cables para este paso.
                </p>
            </div>
        </div>

        <div style="background: rgba(15, 23, 42, 0.4); padding: 1.5rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center;">
            <div id="arduino-simulator-container" style="width: 100%; display: flex; justify-content: center; align-items: center;"></div>
        </div>

        </div>
    `,
    flashcards: [
        { id: 'f1', type: 'hw', q: '¿Cómo se llama la pata más larga de un LED?', a: 'Ánodo (+)', sub: 'Conexión al pin Positivo', sectionId: 're-1-4' },
        { id: 'f2', type: 'hw', q: '¿Qué valor tiene la resistencia Rojo-Rojo-Marrón?', a: '220 Ω', sub: 'Protección LED estándar', sectionId: 're-1-4' },
        { id: 'f3', type: 'code', q: '¿Qué función se ejecuta solo una vez?', a: 'void setup()', sub: 'Configuración inicial', sectionId: 're-1-5' },
        { id: 'f4', type: 'code', q: '¿Qué función se repite infinitamente?', a: 'void loop()', sub: 'Lógica principal del programa', sectionId: 're-1-5' },
        { id: 'f5', type: 'code', q: '¿Qué hace digitalWrite(13, HIGH)?', a: 'Enciende el LED', sub: 'Pone 5V en el pin 13', sectionId: 're-1-6' },
        { id: 'f6', type: 'code', q: '¿Cuánto tiempo espera delay(500)?', a: '0.5 segundos', sub: '500 milisegundos = medio segundo', sectionId: 're-1-6' },
        { id: 'f7', type: 'hw', q: '¿Qué pata del LED es la más corta?', a: 'Cátodo (−)', sub: 'Se conecta a GND', sectionId: 're-1-4' },
        { id: 'f8', type: 'hw', q: '¿Cuántos pines digitales tiene el Arduino Uno?', a: '14 pines (0–13)', sub: 'Pueden ser INPUT u OUTPUT', sectionId: 're-1-2' },
        { id: 'f9', type: 'code', q: '¿Qué hace pinMode(13, OUTPUT)?', a: 'Define el pin 13 como salida', sub: 'Necesario antes de usar digitalWrite', sectionId: 're-1-5' },
        { id: 'f10', type: 'hw', q: '¿Qué voltaje suministra el pin 5V del Arduino?', a: '5 voltios', sub: 'Para alimentar componentes externos', sectionId: 're-1-2' },
        { id: 'f11', type: 'hw', q: '¿Cómo se llama el microcontrolador del Arduino Uno?', a: 'ATmega328P', sub: 'Corre a 16 MHz', sectionId: 're-1-2' },
        { id: 'f12', type: 'code', q: '¿Qué significa delay(1000)?', a: 'Esperar 1 segundo', sub: '1000 milisegundos', sectionId: 're-1-6' }
    ],
    hasSimulator: true,
    questions: [
        {
            q: "¿Qué es Arduino?",
            options: ["Un lenguaje de programación", "Una plataforma de hardware libre", "Un sistema operativo", "Una marca de celulares"],
            correct: 1
        },
        {
            q: "¿Cuál es el microcontrolador de Arduino Uno?",
            options: ["ATmega328P", "ESP32", "Arduino Nano", "STM32"],
            correct: 0
        },
        {
            q: "¿Cuántos pines digitales tiene el Arduino Uno?",
            options: ["10", "12", "14", "16"],
            correct: 2
        },
        {
            q: "¿Qué función se usa para configurar un pin como salida?",
            options: ["digitalWrite()", "pinMode()", "setup()", "loop()"],
            correct: 1
        },
        {
            q: "¿Cuál es el valor máximo que lee un pin analógico (10 bits)?",
            options: ["255", "512", "1023", "4096"],
            correct: 2
        },
        {
            q: "¿Qué comando pausa el programa por 1 segundo?",
            options: ["delay(100)", "delay(1000)", "wait(1000)", "sleep(1)"],
            correct: 1
        },
        {
            q: "¿Qué función enciende un LED en un pin?",
            options: ["digitalWrite(pin, ON)", "digitalWrite(pin, HIGH)", "digitalWrite(pin, 1)", "Ambas B y C"],
            correct: 3
        },
        {
            q: "¿Qué tipo de señal manejan los pines digitales de Arduino?",
            options: ["Analógica", "Digital (0V o 5V)", "Continua", "Alterna"],
            correct: 1
        },
        {
            q: "¿Para qué sirve el pin 5V?",
            options: ["Para leer sensores", "Para alimentar componentes", "Para conectar LEDs", "Para comunicación USB"],
            correct: 1
        },
        {
            q: "¿Qué significa LED_BUILTIN?",
            options: ["Un LED externo", "El LED integrado en la placa", "Una función de Arduino", "Un tipo de sensor"],
            correct: 1
        }
    ]
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 're-m1-l1-content',
                content: lessonDefinition.content,
                hasSimulator: lessonDefinition.hasSimulator
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 're-m1-l1-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        prueba: [
            createQuizBlock({
                id: 're-m1-l1-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions,
                quizConfig: lessonDefinition.quizConfig
            })
        ]
    }
});
