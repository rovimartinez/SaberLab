export const lessonData = {
    title: 'Mi primer parpadeo (Entorno y Salidas Digitales)',
    content: `
        <h3 id="re-1-1" style="color: #a855f7; margin: 1.5rem 0 1rem;">1.1 Introducción al Hardware Abierto</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">El <strong>hardware abierto</strong> se refiere a dispositivos cuyas especificaciones de diseño son públicas, permitiendo que cualquiera los estudie, modifique y construya. Arduino es el ejemplo más popular y exitoso de este movimiento a nivel mundial.</p>
        
        <h3 id="re-1-2" style="color: #a855f7; margin: 1.5rem 0 1rem;">1.2 ¿Qué es Arduino?</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">Arduino es una <strong>plataforma de desarrollo</strong> basada en hardware y software libre. Consiste en una placa con un microcontrolador que puede ser programada para interactuar con el mundo físico mediante una gran variedad de sensores y actuadores.</p>
        <p style="margin-bottom: 1rem; line-height: 1.8;">Fue creado en 2005 en Italia para que estudiantes pudieran crear proyectos interactivos de manera sencilla y económica. Hoy es la plataforma de hardware más popular del mundo.</p>
        <p style="margin-bottom: 1rem; line-height: 1.8;">El nombre "Arduino" proviene de un bar italiano llamado <strong>Bar di Arduino</strong>, donde se reunían los fundadores del proyecto. El fundador principal fue <strong>Massimo Banzi</strong>, quien quería crear una herramienta accesible para que personas sin experiencia en electrónica pudieran crear dispositivos digitales capaces de interactuar con su entorno.</p>
        <p style="margin-bottom: 1rem; line-height: 1.8;">A diferencia de una computadora tradicional, Arduino está diseñado para <strong>controlar elementos del mundo real</strong>: puede leer sensores de temperatura, detectar movimiento, controlar motores, encender luces LED, y mucho más. Esto lo convierte en la herramienta ideal para proyectos de <strong>Internet de las Cosas (IoT)</strong>, robótica, automatización del hogar y arte digital.</p>
        
        <div style="background: rgba(15, 23, 42, 0.8); padding: 2rem; border-radius: 16px; border: 1px solid rgba(168,85,247,0.2); margin-bottom: 2rem;">
            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; align-items: center;">
                <div>
                    <h4 style="color: #a855f7; margin-bottom: 1rem;">Componentes Principales</h4>
                    <p style="margin-bottom: 1rem; line-height: 1.8;">La placa Arduino Uno es el modelo más versátil y popular. Sus componentes clave incluyen el microcontrolador ATmega328P, que es el "cerebro" que ejecuta tus programas, y una serie de pines que permiten conectar componentes externos.</p>
                    <p style="margin-bottom: 1rem; line-height: 1.8;">El <strong>microcontrolador</strong> es como una pequeña computadora integrada en un solo chip. Puede ejecutar instrucciones, tomar decisiones y controlar otros componentes electrónicos. En el Arduino Uno, trabaja a una frecuencia de 16 MHz, lo que significa que puede realizar 16 millones de operaciones por segundo.</p>
                    <p style="margin-bottom: 1rem; line-height: 1.8;">Los <strong>pines</strong> son los puntos de conexión donde puedes conectar cables y componentes. Los pines digitales (0-13) pueden enviar o recibir señales binarias (encendido/apagado), mientras que los pines analógicos (A0-A5) pueden leer valores variables como los de un potenciómetro o sensor de luz.</p>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <img src="https://i.postimg.cc/CxSNt25F/Arduino-Uno.png" alt="Arduino Uno" style="width: 100%; max-width: 500px; height: auto; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.4); margin-bottom: 1.5rem;" />
                    <a href="#" onclick="if (window.showArduinoParts) { window.showArduinoParts(); } return false;" style="background: rgba(255,255,255,0.1); color: #a855f7; border: 1px solid #a855f7; padding: 0.8rem 1.5rem; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.3s;">
                        Ver partes del Arduino
                    </a>
                </div>
            </div>
        </div>
        
        <div style="background: rgba(16, 185, 129, 0.1); padding: 1.5rem; border-radius: 10px; border-left: 4px solid #10b981; margin-bottom: 2rem;">
            <strong style="color: #10b981; font-size: 1.1rem;">Datos:</strong>
            <div style="color: #cbd5e1; margin-top: 0.5rem;">Arduino Uno es el modelo más popular y versátil para aprender.</div>
            <ul style="margin: 0.5rem 0 0 0; padding-left: 1.2rem; color: #cbd5e1; line-height: 1.8;">
                <li><strong style="color: #a855f7;">Microcontrolador:</strong> ATmega328P a 16 MHz.</li>
                <li><strong style="color: #3b82f6;">Memoria Flash (32 KB):</strong> Donde se almacena tu sketch (programa). Es permanente.</li>
                <li><strong style="color: #10b981;">Pines Digitales (0-13):</strong> 14 pines que pueden leer o escribir señales de 0V (LOW) o 5V (HIGH).</li>
                <li><strong style="color: #fbbf24;">Pines Analógicos (A0-A5):</strong> 6 entradas que leen valores de 0 a 5V (0-1023).</li>
                <li><strong style="color: #ec4899;">Alimentación:</strong> Vía USB (5V) o Jack DC (7-12V). Los pines 5V y 3.3V.</li>
                <li><strong style="color: #f97316;">Puerto USB:</strong> Conecta el Arduino a tu computadora para subir programas.</li>
            </ul>
        </div>
        </div>

        <h3 id="re-1-3" style="color: #a855f7; margin: 2rem 0 1rem;">1.3 El Entorno de Desarrollo (IDE)</h3>
        <div style="background: rgba(15, 23, 42, 0.8); padding: 2rem; border-radius: 16px; border: 1px solid rgba(168,85,247,0.2); margin-bottom: 2rem;">
            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; align-items: center;">
                <div>
                    <p style="color: #cbd5e1; line-height: 1.8; margin-bottom: 1rem;">Para programar Arduino necesitas el <strong>Arduino IDE</strong>, un entorno gratuito y multiplaforma (Windows, Mac, Linux).</p>
                    
                    <h4 style="color: #a855f7; margin: 1rem 0 0.75rem;">Pasos para instalar:</h4>
                    <ol style="color: #cbd5e1; line-height: 1.8; padding-left: 1.5rem;">
                        <li>Descarga el IDE desde <a href="https://www.arduino.cc/en/software" target="_blank" style="color: #60a5fa;">arduino.cc</a></li>
                        <li>Instala el driver (especialmente en Windows)</li>
                        <li>Conecta tu Arduino al USB</li>
                        <li>Selecciona tu placa en <code>Herramientas > Placa > Arduino Uno</code></li>
                        <li>Selecciona el puerto en <code>Herramientas > Puerto</code></li>
                    </ol>

                    <div style="background: rgba(16,185,129,0.1); padding: 0.75rem; border-radius: 8px; margin-top: 1rem; border-left: 3px solid #10b981;">
                        <strong style="color: #10b981;">Pro tip:</strong> También puedes usar <strong>Tinkercad</strong> para simular Arduino.
                    </div>
                </div>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <img src="https://i.postimg.cc/ZR7N3j1W/IDE-Arduino.png" alt="Arduino IDE" style="width: 100%; max-width: 400px; height: auto; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />
                </div>
            </div>
        </div>

        <h3 id="re-1-4" style="color: #a855f7; margin: 2rem 0 1rem;">1.4 Simular con Tinkercad</h3>
        
        <div style="background: rgba(15, 23, 42, 0.8); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(168,85,247,0.2); margin-bottom: 2rem;">
            <p style="color: #cbd5e1; line-height: 1.8;"><strong>Tinkercad</strong> es una herramienta gratuita de Autodesk que permite diseñar y simular circuitos electrónicos en el navegador, sin instalar nada.</p>
        </div>

        <div style="background: rgba(15, 23, 42, 0.8); padding: 2rem; border-radius: 16px; border: 1px solid rgba(168,85,247,0.2); margin-bottom: 2rem;">
            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; align-items: center;">
                <div>
                    <h4 style="color: #a855f7; margin: 1rem 0 0.75rem;">¿Por qué usar Tinkercad?</h4>
                    <ul style="color: #cbd5e1; line-height: 1.8; padding-left: 1.5rem;">
                        <li><strong>Sin instalación:</strong> Funciona en cualquier navegador web.</li>
                        <li><strong>Simulación real:</strong> Ve el comportamiento de LEDs, botones, sensores y más.</li>
                        <li><strong>Ideal para aprender:</strong> Si no tienes un Arduino físico, puedes practicar igual.</li>
                        <li><strong>Compartir proyectos:</strong> Puedes guardar tus circuitos y compartirlos con otros.</li>
                        <li><strong>Código automático:</strong> Tinkercad genera el código Arduino automáticamente basándose en tu circuito.</li>
                    </ul>
                </div>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <img src="https://i.postimg.cc/5ts44tYx/Tinkkercad.png" alt="Tinkercad" style="width: 100%; max-width: 400px; height: auto; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />
                </div>
            </div>
        </div>

        <div style="background: rgba(16,185,129,0.1); padding: 1.5rem; border-radius: 8px; border-left: 3px solid #10b981; margin-bottom: 2rem;">
            <strong style="color: #10b981;">¿Cómo empezar?</strong> Ve a <a href="https://www.tinkercad.com" target="_blank" style="color: #60a5fa;">tinkercad.com</a>, crea una cuenta gratis y entra en la sección <strong>"Circuitos"</strong>. Arrastra un Arduino Uno y empieza a experimentar.
        </div>

        <h3 id="re-1-5" style="color: #a855f7; margin: 2rem 0 1rem;">1.5 El Circuito</h3>
        <div style="background: rgba(15, 23, 42, 0.8); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(168,85,247,0.2); margin-bottom: 2rem;">
            <p style="color: #cbd5e1; line-height: 1.8; margin-bottom: 1rem;">Para hacer parpadear un LED externo, conecta los componentes así:</p>
            <div style="display: grid; grid-template-columns: 110px 180px 170px; gap: 0.5rem; font-family: monospace; font-size: 0.9rem; align-items: center; justify-items: start;">
                <div style="display: flex; justify-content: flex-start;">
                    <span style="background: rgba(168,85,247,0.2); padding: 4px 12px; border-radius: 6px; color: #a855f7; font-weight: bold; display: inline-block; width: 110px; text-align: center;">Pin 13</span>
                </div>
                <div style="display: flex; justify-content: flex-start; color: #4ade80;">
                    <span style="display: inline-block; width: 180px; text-align: center;">───────────────►</span>
                </div>
                <div style="display: flex; justify-content: flex-start;">
                    <span style="background: rgba(251,191,36,0.2); padding: 4px 12px; border-radius: 6px; color: #fbbf24; font-weight: bold; display: inline-block; width: 170px; text-align: center;">Ánodo LED (+)</span>
                </div>
                <div style="display: flex; justify-content: flex-start;">
                    <span style="background: rgba(248,113,113,0.2); padding: 4px 12px; border-radius: 6px; color: #f87171; font-weight: bold; display: inline-block; width: 110px; text-align: center;">GND</span>
                </div>
                <div style="display: flex; justify-content: flex-start; color: #4ade80;">
                    <span style="display: inline-block; width: 180px; text-align: center;">◄───── 220Ω ─────</span>
                </div>
                <div style="display: flex; justify-content: flex-start;">
                    <span style="background: rgba(248,113,113,0.2); padding: 4px 12px; border-radius: 6px; color: #f87171; font-weight: bold; display: inline-block; width: 170px; text-align: center;">Cátodo LED (−)</span>
            </div>
            </div>
            <div style="background: rgba(16,185,129,0.1); padding: 0.75rem; border-radius: 8px; margin-top: 1rem; border-left: 3px solid #10b981;">
                <strong style="color: #10b981;">Pro tip:</strong> El Arduino ya tiene un LED integrado conectado al <strong>Pin 13 (LED_BUILTIN)</strong> - puedes probarlo sin conectar nada extra.
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div>
                <h4 style="color: #fbbf24; margin-bottom: 0.5rem; font-size: 2rem;">¿Qué es un LED?</h4>
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); height: 100%;">
                <div style="flex: 1;">
                    <p style="line-height: 1.6; color: #cbd5e1; font-size: 1.5rem;">El LED (Diodo Emisor de Luz) es un componente electrónico que emite luz cuando la corriente fluye a través de él. Tiene dos patas:</p>
                    <ul style="margin-top: 0.5rem; padding-left: 1rem; color: #94a3b8; line-height: 1.6; font-size: 1rem;">
                        <li><strong style="color: #4ade80;">Ánodo (+):</strong> Pata larga → se conecta al pin positivo.</li>
                        <li><strong style="color: #f87171;">Cátodo (−):</strong> Pata corta → se conecta a GND (tierra).</li>
                    </ul>
                </div>
                </div>
            </div>
            <div>
                <h4 style="color: #f97316; margin-bottom: 0.5rem; font-size: 2rem;">¿Qué es una Resistencia?</h4>
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); height: 100%;">
                <div style="flex: 1;">
                    <p style="line-height: 1.6; color: #cbd5e1; font-size: 1.5rem;">La resistencia es un componente eléctrico que se opone al paso de la corriente. Su función es limitar el flujo de corriente para evitar que los componentes (como el LED) se quemen.</p>
                    <a href="#" onclick="if (window.dispatchShowGuide) window.dispatchShowGuide(); return false;" style="display: block; background: rgba(249,115,22,0.1); padding: 0.5rem; border-radius: 8px; margin-top: 0.5rem; border-left: 3px solid #f97316; text-align: center; font-size: 1.2rem; cursor: pointer; border: none; width: 100%; color: #fbbf24; font-weight: bold; text-decoration: none;">
                        Ver código de colores
                    </a>
                </div>
                </div>
            </div>
            <div>
                <h4 style="color: #10b981; margin-bottom: 0.5rem; font-size: 2rem;">Simulador del Circuito</h4>
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); min-height: 100%; display: flex; align-items: center; justify-content: center;">
                    <div id="led-simulator-container" style="width: 100%;"></div>
                </div>
            </div>
        </div>

        <h3 id="re-1-6" style="color: #a855f7; margin: 2rem 0 1rem;">1.6 Estructura del Código Arduino</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8; color: #cbd5e1;">Todo programa de Arduino tiene exactamente <strong>dos funciones obligatorias</strong>:</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
            <div style="background: rgba(59,130,246,0.1); padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(59,130,246,0.2);">
                <code style="color: #60a5fa; font-size: 1.05rem; font-weight: bold;">void setup()</code>
                <p style="color: #94a3b8; font-size: 0.9rem; margin-top: 0.5rem; line-height: 1.6;">Se ejecuta <strong style="color: white;">una sola vez</strong> al arrancar. Aquí configuras los pines y la comunicación serial.</p>
            </div>
            <div style="background: rgba(168,85,247,0.1); padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(168,85,247,0.2);">
                <code style="color: #a855f7; font-size: 1.05rem; font-weight: bold;">void loop()</code>
                <p style="color: #94a3b8; font-size: 0.9rem; margin-top: 0.5rem; line-height: 1.6;">Se repite <strong style="color: white;">infinitamente</strong> mientras el Arduino tenga energía. Aquí va la lógica principal.</p>
            </div>
        </div>

        <h3 id="re-1-7" style="color: #a855f7; margin: 1.5rem 0 1rem;">1.7 Código Base: Blink</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 0;">
            <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
                <code style="color: #4ade80;">pinMode(pin, modo)</code>
                <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 0.5rem;">Define si el pin es entrada (INPUT) o salida (OUTPUT). Se usa siempre en setup().</p>
            </div>
            <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
                <code style="color: #60a5fa;">digitalWrite(pin, valor)</code>
                <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 0.5rem;">Escribe HIGH (5V) o LOW (0V) en un pin digital de salida.</p>
            </div>
            <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
                <code style="color: #fbbf24;">delay(milisegundos)</code>
                <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 0.5rem;">Pausa la ejecución el tiempo indicado en ms. 1000ms = 1 segundo.</p>
            </div>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); margin-top: 1.5rem;">
            <div id="arduino-simulator-container"></div>
        </div>
    `,
    flashcards: [
        { id: 'f1', type: 'hw', q: '¿Cómo se llama la pata más larga de un LED?', a: 'Ánodo (+)', sub: 'Conexión al pin Positivo', sectionId: 're-1-5' },
        { id: 'f2', type: 'hw', q: '¿Qué valor tiene la resistencia Rojo-Rojo-Marrón?', a: '220 Ω', sub: 'Protección LED estándar', sectionId: 're-1-5' },
        { id: 'f3', type: 'code', q: '¿Qué función se ejecuta solo una vez?', a: 'void setup()', sub: 'Configuración inicial', sectionId: 're-1-6' },
        { id: 'f4', type: 'code', q: '¿Qué función se repite infinitamente?', a: 'void loop()', sub: 'Lógica principal del programa', sectionId: 're-1-6' },
        { id: 'f5', type: 'code', q: '¿Qué hace digitalWrite(13, HIGH)?', a: 'Enciende el LED', sub: 'Pone 5V en el pin 13', sectionId: 're-1-7' },
        { id: 'f6', type: 'code', q: '¿Cuánto tiempo espera delay(500)?', a: '0.5 segundos', sub: '500 milisegundos = medio segundo', sectionId: 're-1-7' },
        { id: 'f7', type: 'hw', q: '¿Qué pata del LED es la más corta?', a: 'Cátodo (−)', sub: 'Se conecta a GND', sectionId: 're-1-5' },
        { id: 'f8', type: 'hw', q: '¿Cuántos pines digitales tiene el Arduino Uno?', a: '14 pines (0–13)', sub: 'Pueden ser INPUT u OUTPUT', sectionId: 're-1-2' },
        { id: 'f9', type: 'code', q: '¿Qué hace pinMode(13, OUTPUT)?', a: 'Define el pin 13 como salida', sub: 'Necesario antes de usar digitalWrite', sectionId: 're-1-6' },
        { id: 'f10', type: 'hw', q: '¿Qué voltaje suministra el pin 5V del Arduino?', a: '5 voltios', sub: 'Para alimentar componentes externos', sectionId: 're-1-2' },
        { id: 'f11', type: 'hw', q: '¿Cómo se llama el microcontrolador del Arduino Uno?', a: 'ATmega328P', sub: 'Corre a 16 MHz', sectionId: 're-1-2' },
        { id: 'f12', type: 'code', q: '¿Qué significa delay(1000)?', a: 'Esperar 1 segundo', sub: '1000 milisegundos', sectionId: 're-1-7' }
    ],
    hasSimulator: true,
    questions: [
        {
            q: "Â¿QuÃ© es Arduino?",
            options: ["Un lenguaje de programaciÃ³n", "Una plataforma de hardware libre", "Un sistema operativo", "Una marca de celulares"],
            correct: 1
        },
        {
            q: "Â¿CuÃ¡l es el microcontrolador de Arduino Uno?",
            options: ["ATmega328P", "ESP32", "Arduino Nano", "STM32"],
            correct: 0
        },
        {
            q: "Â¿CuÃ¡ntos pines digitales tiene el Arduino Uno?",
            options: ["10", "12", "14", "16"],
            correct: 2
        },
        {
            q: "Â¿QuÃ© funciÃ³n se usa para configurar un pin como salida?",
            options: ["digitalWrite()", "pinMode()", "setup()", "loop()"],
            correct: 1
        },
        {
            q: "Â¿CuÃ¡l es el valor mÃ¡ximo que lee un pin analÃ³gico (10 bits)?",
            options: ["255", "512", "1023", "4096"],
            correct: 2
        },
        {
            q: "Â¿QuÃ© comando pausa el programa por 1 segundo?",
            options: ["delay(100)", "delay(1000)", "wait(1000)", "sleep(1)"],
            correct: 1
        },
        {
            q: "Â¿QuÃ© funciÃ³n enciende un LED en un pin?",
            options: ["digitalWrite(pin, ON)", "digitalWrite(pin, HIGH)", "digitalWrite(pin, 1)", "Ambas B y C"],
            correct: 3
        },
        {
            q: "Â¿QuÃ© tipo de seÃ±al manejan los pines digitales de Arduino?",
            options: ["AnalÃ³gica", "Digital (0V o 5V)", "Continua", "Alterna"],
            correct: 1
        },
        {
            q: "Â¿Para quÃ© sirve el pin 5V?",
            options: ["Para leer sensores", "Para alimentar componentes", "Para conectar LEDs", "Para comunicaciÃ³n USB"],
            correct: 1
        },
        {
            q: "Â¿QuÃ© significa LED_BUILTIN?",
            options: ["Un LED externos", "El LED integrado en la placa", "Una funciÃ³n de Arduino", "Un tipo de sensor"],
            correct: 1
        }
    ]
};
