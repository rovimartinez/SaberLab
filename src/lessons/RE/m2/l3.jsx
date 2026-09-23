import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Sensores Infrarrojos (IR) y Detector de Movimiento PIR',
    content: `
        <div class="lesson-intro">
            <p>Para que un robot interactúe de forma autónoma e inteligente con el mundo real, necesita <strong>sensores</strong>. En esta lección aprenderás a conectar, calibrar y programar dos de los sensores ópticos y térmicos más utilizados en robótica y automatización: el <strong>Sensor Infrarrojo Óptico (TCRT5000 / Seguidor de Línea)</strong> y el <strong>Sensor de Movimiento Piroeléctrico PIR (HC-SR501)</strong>.</p>
        </div>

        <!-- 1. INTRODUCCIÓN A LOS SENSORES DIGITALES -->
        <div class="theory-section">
            <h3 id="re-m2-3-1">1. ¿Cómo percibe un Robot su Entorno?</h3>
            <p>Los sensores convierten variables físicas del entorno (como luz reflejada, distancia, sonido o calor) en <strong>señales eléctricas</strong> que el microcontrolador Arduino puede interpretar.</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin: 1.25rem 0;">
                <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 14px; padding: 1.25rem;">
                    <h4 style="color: #38bdf8; margin-top: 0; display: flex; alignItems: center; gap: 0.5rem;">
                        <span>📡</span> Sensores Digitales
                    </h4>
                    <p style="color: #cbd5e1; font-size: 0.92rem; line-height: 1.6; margin-bottom: 0;">
                        Entregan únicamente dos estados discretos: <strong>HIGH (5V)</strong> o <strong>LOW (0V)</strong>. Indican presencia/ausencia de un obstáculo, cruce de línea negra o detección de movimiento. Se leen con la instrucción <code>digitalRead(pin)</code>.
                    </p>
                </div>

                <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 14px; padding: 1.25rem;">
                    <h4 style="color: #c084fc; margin-top: 0; display: flex; alignItems: center; gap: 0.5rem;">
                        <span>📊</span> Sensores Analógicos
                    </h4>
                    <p style="color: #cbd5e1; font-size: 0.92rem; line-height: 1.6; margin-bottom: 0;">
                        Entregan un rango continuo de voltajes entre 0V y 5V que Arduino cuantifica de 0 a 1023 (10 bits). Se leen con <code>analogRead(pin)</code>.
                    </p>
                </div>
            </div>
        </div>

        <!-- 2. SENSOR INFRARROJO (IR TCRT5000) -->
        <div class="theory-section">
            <h3 id="re-m2-3-2">2. Sensor Infrarrojo (TCRT5000): Principio Óptico y Reflexión</h3>
            <p>El módulo infrarrojo está compuesto por dos componentes ópticos montados en paralelo:</p>
            <ul style="color: #cbd5e1; line-height: 1.7; padding-left: 1.25rem;">
                <li><strong>LED Emisor Infrarrojo (Diodo Transparente):</strong> Emite constantemente un haz de luz en el espectro infrarrojo invisible para el ojo humano (~950 nm).</li>
                <li><strong>Fototransistor Receptor (Diodo Negro):</strong> Detecta la cantidad de luz infrarroja que <em>rebota</em> contra las superficies cercanas.</li>
            </ul>

            <!-- Imagen del Módulo IR y Partes -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin: 1.5rem 0;">
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1rem; text-align: center;">
                    <img 
                        src="https://www.arcaelectronica.com/cdn/shop/files/High-Quality-New-TCRT5000-font-b-Infrared-b-font-font-b-Reflectance-b-font-font-b_1024x1024_c823b280-49e8-4a55-9bb9-802b617540e3_2048x.webp?v=1730927797" 
                        alt="Módulo Sensor Infrarrojo TCRT5000" 
                        style="width: 100%; max-height: 220px; object-fit: contain; border-radius: 10px; background: #0f172a;"
                    />
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.6rem; font-weight: 600;">
                        Módulo Infrarrojo TCRT5000 con Trimmer de Ajuste
                    </div>
                </div>

                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1rem; text-align: center;">
                    <img 
                        src="https://controllerstech.com/wp-content/uploads/2025/11/arduino_IR_2.webp" 
                        alt="Partes y Anatomía del Módulo IR" 
                        style="width: 100%; max-height: 220px; object-fit: contain; border-radius: 10px; background: #0f172a;"
                    />
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.6rem; font-weight: 600;">
                        Anatomía: Emisor, Receptor, LM393 y Pines de Conexión
                    </div>
                </div>
            </div>

            <!-- Principio de Absorción y Reflexión de Color -->
            <div style="background: rgba(15, 23, 42, 0.65); border-left: 4px solid #38bdf8; border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0;">
                <h4 style="color: #38bdf8; margin-top: 0;">Principio Físico: Superficie Blanca vs Línea Negra</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; align-items: center; margin-top: 0.75rem;">
                    <div>
                        <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">
                            • <strong>Superficie Blanca / Objeto Claro:</strong> La superficie <strong>refleja</strong> la mayor parte de la luz infrarroja hacia el receptor. El circuito integrado comparador <strong>LM393</strong> detecta el voltaje y conmuta la salida digital <code>D0</code> a <strong>LOW (0V)</strong>, encendiendo el LED indicador.<br><br>
                            • <strong>Línea Negra / Vacío:</strong> El color negro <strong>absorbe</strong> el espectro infrarrojo. No hay rebote hacia el receptor; por lo tanto, la salida digital <code>D0</code> permanece en <strong>HIGH (5V)</strong> y el LED del sensor se apaga.
                        </p>
                    </div>
                    <div style="text-align: center;">
                        <img 
                            src="https://thumbs.dreamstime.com/b/luz-de-color-absorci%C3%B3n-y-reflexi%C3%B3n-un-objeto-rojo-refleja-el-absorbe-otros-colores-visible-blanco-las-olas-todos-los-negro-la-172202981.jpg" 
                            alt="Absorción y Reflexión de la Luz" 
                            style="width: 100%; max-height: 180px; object-fit: contain; border-radius: 8px;"
                        />
                    </div>
                </div>
            </div>

            <!-- Conexión del Módulo IR con Arduino -->
            <div style="margin: 1.5rem 0;">
                <h4 style="color: #f8fafc; font-size: 1.05rem;">Diagrama de Conexión a Arduino Uno (Módulo IR)</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; align-items: center; margin-top: 0.75rem;">
                    <div style="text-align: center; background: #0f172a; padding: 0.75rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
                        <img 
                            src="https://electrovigyan.com/wp-content/uploads/2021/01/IR-n.jpg" 
                            alt="Conexión Sensor IR a Arduino" 
                            style="width: 100%; max-height: 240px; object-fit: contain; border-radius: 8px;"
                        />
                    </div>
                    <div style="background: rgba(15, 23, 42, 0.7); padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; color: #cbd5e1;">
                            <thead>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #38bdf8; text-align: left;">
                                    <th style="padding: 0.5rem;">Pin del Sensor IR</th>
                                    <th style="padding: 0.5rem;">Conexión Arduino</th>
                                    <th style="padding: 0.5rem;">Función</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <td style="padding: 0.5rem; font-weight: bold; color: #ef4444;">VCC</td>
                                    <td style="padding: 0.5rem;">Pin 5V</td>
                                    <td style="padding: 0.5rem;">Alimentación positiva</td>
                                </tr>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <td style="padding: 0.5rem; font-weight: bold; color: #92400e;">GND</td>
                                    <td style="padding: 0.5rem;">Pin GND</td>
                                    <td style="padding: 0.5rem;">Tierra de referencia (0V)</td>
                                </tr>
                                <tr>
                                    <td style="padding: 0.5rem; font-weight: bold; color: #38bdf8;">OUT / D0</td>
                                    <td style="padding: 0.5rem;">Pin Digital 2</td>
                                    <td style="padding: 0.5rem;">Señal de detección digital</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- 3. SENSOR PIR (HC-SR501) -->
        <div class="theory-section">
            <h3 id="re-m2-3-3">3. Sensor PIR (HC-SR501): Detección de Movimiento Piroeléctrico</h3>
            <p>El sensor <strong>PIR (Passive Infrared)</strong> detecta la <strong>radiación infrarroja térmica</strong> emitida de forma natural por el cuerpo humano y los animales. A diferencia del sensor IR activo, el sensor PIR <em>no emite luz</em>: es un receptor pasivo ultrasensible a las fluctuaciones de calor.</p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin: 1.5rem 0;">
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1rem; text-align: center;">
                    <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPRq85Ujux8oTY9BSgjzDgIm1KPGzHBKGR1ORR9Fw6APTq9K9SGX9lUDY&s=10" 
                        alt="Sensor PIR HC-SR501 con Lente de Fresnel" 
                        style="width: 100%; max-height: 200px; object-fit: contain; border-radius: 10px; background: #0f172a;"
                    />
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.6rem; font-weight: 600;">
                        Sensor PIR HC-SR501: Domo Fresnel y Trimmers de Retardo/Sensibilidad
                    </div>
                </div>

                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1rem; text-align: center;">
                    <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCSQO_5RPoTgwQP6HLOA3Ect_S7BmUYZJ0j1gVzakOXJUxTOONnJWmbRA&s=10" 
                        alt="Conexión de Sensor PIR a Arduino" 
                        style="width: 100%; max-height: 200px; object-fit: contain; border-radius: 10px; background: #0f172a;"
                    />
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.6rem; font-weight: 600;">
                        Conexión Típica PIR a Arduino: VCC (5V), OUT (D3) y GND
                    </div>
                </div>
            </div>

            <!-- Elementos clave del PIR -->
            <div style="background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981; border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0;">
                <h4 style="color: #10b981; margin-top: 0;">Elementos Clave del Módulo PIR HC-SR501:</h4>
                <ul style="color: #cbd5e1; line-height: 1.7; margin: 0; padding-left: 1.25rem; font-size: 0.92rem;">
                    <li><strong>Lente de Fresnel (Cúpula blanca):</strong> Divide el campo visual en múltiples facetas cónicas, concentrando la radiación infrarroja hacia el elemento piroeléctrico interno.</li>
                    <li><strong>Ajuste de Sensibilidad (Sx):</strong> Potenciómetro para regular el rango de alcance (de 3 a 7 metros).</li>
                    <li><strong>Ajuste de Tiempo de Retardo (Tx):</strong> Potenciómetro que determina cuántos segundos permanece la salida en <code>HIGH (5V)</code> tras detectar movimiento (de 3 a 300 segundos).</li>
                </ul>
            </div>
        </div>

        <!-- 4. LABORATORIO INTERACTIVO (SIMULADOR DUAL) -->
        <div class="theory-section">
            <h3 id="re-m2-3-4">4. Laboratorio Interactivo: Simulador Dual de Sensores IR y PIR</h3>
            <p>Utiliza el simulador para probar cómo reaccionan las señales digitales de Arduino ante superficies reflectantes, líneas negras y movimiento corporal en tiempo real:</p>
            <div id="ir-pir-sensor-simulator-container"></div>
        </div>

            <div style="background: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b; border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0;">
                <h4 style="color: #f59e0b; margin-top: 0;">💡 Resumen Lógico Clave para el Examen:</h4>
                <p style="color: #cbd5e1; font-size: 0.92rem; line-height: 1.8; margin: 0;">
                    • <strong>Sensor IR (TCRT5000 / FC-51):</strong> Superficie blanca / Obstáculo ➔ <code>LOW (0V)</code> | Línea negra / Sin obstáculo ➔ <code>HIGH (5V)</code>.<br>
                    • <strong>Sensor PIR (HC-SR501 / Parallax):</strong> Presencia en movimiento detectada ➔ <code>HIGH (5V)</code> | Área en reposo ➔ <code>LOW (0V)</code>.
                </p>
            </div>
        </div>

        <!-- 5. RETO PRÁCTICO ASINCRÓNICO (TINKERCAD CIRCUITS) -->
        <div class="theory-section">
            <h3 id="re-m2-3-5">5. Reto Práctico Asincrónico: Sistema de Detección Bicolor en Tinkercad</h3>
            <p>
                Como ejercicio práctico asincrónico para consolidar lo aprendido, deberás implementar y simular en <a href="https://www.tinkercad.com/circuits" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; text-decoration: underline; font-weight: 800;">Tinkercad Circuits</a> un <strong>Sistema de Señalización Bicolor Inteligente</strong> utilizando un microcontrolador <strong>Arduino Uno</strong> y un sensor digital de detección (PIR / IR).
            </p>

            <div style="background: rgba(15, 23, 42, 0.75); border: 1.5px solid rgba(56, 189, 248, 0.25); border-radius: 16px; padding: 1.35rem; margin: 1.25rem 0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.65rem;">
                        <span style="background: #0284c7; color: #ffffff; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-family: monospace; font-weight: 900;">RETO ASINCRÓNICO</span>
                        <h4 style="margin: 0; color: #f8fafc; font-size: 1.05rem; font-weight: 850;">Consigna: Baliza de Seguridad Bicolor</h4>
                    </div>
                    <span style="color: #94a3b8; font-size: 0.8rem; font-family: monospace; background: rgba(255,255,255,0.05); padding: 0.25rem 0.6rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">Plataforma: Tinkercad</span>
                </div>

                <h5 style="color: #38bdf8; margin: 0 0 0.5rem; font-size: 0.92rem; font-weight: 800;">🎯 Requerimientos Técnicos del Circuito:</h5>
                <ul style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.7; margin: 0 0 1rem 0; padding-left: 1.25rem;">
                    <li><strong>Sensor de Entrada:</strong> Sensor PIR Parallax o Sensor IR conectado al <strong>Pin Digital 2</strong>.</li>
                    <li><strong>LED Verde (Detección Activa):</strong> Conectado al <strong>Pin Digital 8</strong> con resistencia limitadora de <strong>220 Ω</strong> o <strong>330 Ω</strong>. Debe <strong>encenderse</strong> cuando el sensor detecte presencia/obstáculo.</li>
                    <li><strong>LED Rojo (Área en Reposo):</strong> Conectado al <strong>Pin Digital 7</strong> con resistencia limitadora de <strong>220 Ω</strong> o <strong>330 Ω</strong>. Debe <strong>encenderse</strong> cuando no haya detección y apagarse cuando el verde esté activo.</li>
                    <li><strong>Telemetría por Monitor Serial (9600 baud):</strong> Imprimir en vivo el estado (<code>"¡OBJETO DETECTADO! - Paso Autorizado"</code> vs <code>"Área Despejada / En Reposo"</code>).</li>
                </ul>


                <div style="margin-top: 1rem; padding: 1rem 1.1rem; background: rgba(56, 189, 248, 0.08); border-radius: 10px; border: 1px solid rgba(56, 189, 248, 0.2); font-size: 0.85rem; color: #cbd5e1; line-height: 1.7;">
                    <strong style="color: #38bdf8; font-size: 0.9rem;">📋 Formato de Entrega — PDF con los siguientes elementos:</strong>
                    <ol style="margin: 0.6rem 0 0 0; padding-left: 1.3rem; color: #cbd5e1;">
                        <li><strong style="color: #f8fafc;">Nombre completo del estudiante</strong> en la parte superior del documento.</li>
                        <li><strong style="color: #f8fafc;">Pantallazo del circuito en Tinkercad</strong> mostrando claramente el conexionado de la protoboard, el Arduino, el sensor y los dos LEDs con sus resistencias.</li>
                        <li><strong style="color: #f8fafc;">Pantallazo del código</strong> (Editor de código de Tinkercad o IDE de Arduino) con la lógica de detección implementada.</li>
                        <li><strong style="color: #f8fafc;">Enlace público del proyecto</strong> en Tinkercad (clic en <em>Compartir → Copiar enlace</em>) pegado como texto en el PDF.</li>
                    </ol>
                    <p style="margin: 0.65rem 0 0; color: #94a3b8; font-size: 0.8rem;">💡 Nombra el archivo PDF como: <code style="background: rgba(255,255,255,0.06); padding: 0.1rem 0.4rem; border-radius: 4px; color: #38bdf8;">Apellido-Nombre.pdf</code> y entrégalo a través del medio indicado por el docente.</p>
                </div>
            </div>
        </div>
    `,
    sections: [
        { id: 're-m2-3-1', title: '1. ¿Cómo percibe un Robot su Entorno?' },
        { id: 're-m2-3-2', title: '2. Sensor Infrarrojo (TCRT5000) y Reflexión' },
        { id: 're-m2-3-3', title: '3. Sensor PIR (HC-SR501) y Detección Térmica' },
        { id: 're-m2-3-4', title: '4. Lab. Interactivo: Simulador Dual IR + PIR' },
        { id: 're-m2-3-5', title: '5. Reto Asincrónico: Baliza Bicolor en Tinkercad' }
    ],
    flashcards: [
        {
            id: 'f1',
            type: 'theory',
            q: '¿Qué tipo de señal entregan los sensores digitales como el TCRT5000 y el HC-SR501?',
            a: 'Señales binarias discretas: HIGH (5V) o LOW (0V)',
            sub: 'Indican exclusivamente dos estados posibles (detección o no detección) y se leen con digitalRead().',
            sectionId: 're-m2-3-1'
        },
        {
            id: 'f2',
            type: 'hw',
            q: '¿Cuáles son los dos componentes ópticos principales de un sensor infrarrojo TCRT5000?',
            a: 'Un LED emisor infrarrojo y un fototransistor receptor',
            sub: 'El emisor proyecta luz infrarroja invisible y el fototransistor capta la luz que rebota de las superficies.',
            sectionId: 're-m2-3-2'
        },
        {
            id: 'f3',
            type: 'theory',
            q: '¿Por qué un sensor infrarrojo detecta una línea negra sobre fondo blanco?',
            a: 'El color negro absorbe la luz infrarroja y el blanco la refleja',
            sub: 'En el blanco la luz rebota hacia el receptor (LOW); en la línea negra la luz es absorbida y no rebota (HIGH).',
            sectionId: 're-m2-3-2'
        },
        {
            id: 'f4',
            type: 'code',
            q: 'En un módulo IR con comparador LM393, ¿qué valor entrega el pin OUT al detectar superficie blanca?',
            a: 'Nivel lógico LOW (0 Voltios)',
            sub: 'Al recibir la luz rebotada, el comparador conmuta su salida a tierra (LOW) y enciende el LED testigo del módulo.',
            sectionId: 're-m2-3-2'
        },
        {
            id: 'f5',
            type: 'hw',
            q: '¿Para qué sirve el potenciómetro trimmer azul ubicado en el módulo sensor IR?',
            a: 'Calibrar la sensibilidad y el umbral de distancia de detección',
            sub: 'Ajusta el voltaje de referencia en el comparador LM393 para discriminar correctamente el color o la proximidad.',
            sectionId: 're-m2-3-2'
        },
        {
            id: 'f6',
            type: 'theory',
            q: '¿Qué significa la sigla PIR en el sensor HC-SR501?',
            a: 'Passive Infrared (Infrarrojo Pasivo)',
            sub: 'Es pasivo porque no emite radiación: únicamente detecta el calor infrarrojo emitido por cuerpos en movimiento.',
            sectionId: 're-m2-3-3'
        },
        {
            id: 'f7',
            type: 'hw',
            q: '¿Cuál es la función de la cúpula blanca (Lente de Fresnel) en el sensor PIR?',
            a: 'Dividir el campo visual y concentrar la radiación térmica en el sensor',
            sub: 'Segmenta el área en múltiples conos para que el movimiento entre zonas genere una variación de calor detectable.',
            sectionId: 're-m2-3-3'
        },
        {
            id: 'f8',
            type: 'code',
            q: '¿Qué valor entrega el sensor PIR en su pin OUT cuando una persona cruza su campo visual?',
            a: 'Nivel lógico HIGH (5 Voltios)',
            sub: 'Al detectar el cambio térmico de un cuerpo en movimiento, la salida se activa en HIGH durante el tiempo fijado por el trimmer.',
            sectionId: 're-m2-3-3'
        },
        {
            id: 'f9',
            type: 'code',
            q: '¿Qué instrucción de Arduino C++ se utiliza para consultar el estado de un sensor conectado al Pin 2?',
            a: 'digitalRead(2);',
            sub: 'Retorna el valor entero HIGH (1) o LOW (0) según la tensión presente en el pin digital.',
            sectionId: 're-m2-3-5'
        },
        {
            id: 'f10',
            type: 'hw',
            q: '¿Qué potenciómetros de ajuste posee el módulo PIR HC-SR501 en su placa?',
            a: 'Sensibilidad (Alcance de 3-7 m) y Tiempo de Retardo (Delay 3-300 s)',
            sub: 'Permiten adaptar el sensor para no saturarse y mantener la alarma encendida el tiempo requerido.',
            sectionId: 're-m2-3-3'
        }
    ],
    questions: [
        {
            id: 1,
            question: '¿Cuál es la diferencia fundamental entre el funcionamiento de un sensor Infrarrojo (TCRT5000) y un sensor PIR (HC-SR501)?',
            options: [
                'El sensor IR es activo (emite y recibe luz infrarroja), mientras que el PIR es pasivo (solo recibe radiación térmica de los cuerpos).',
                'El sensor IR funciona con ultrasonido y el PIR con rayos láser.',
                'El sensor PIR solo funciona bajo el agua y el IR en el vacío.',
                'El sensor IR requiere 220V de corriente alterna y el PIR baterías solares.'
            ],
            correct: 0,
            explanation: 'El módulo TCRT5000 proyecta activamente luz infrarroja con su LED emisor para evaluar el rebote. El PIR no emite nada; simplemente mide los cambios de radiación infrarroja térmica que emiten los seres vivos.'
        },
        {
            id: 2,
            question: 'Un robot seguidor de línea avanza sobre una pista de fondo blanco con una línea negra central. ¿Qué ocurre ópticamente cuando el sensor IR queda posicionado sobre la línea negra?',
            options: [
                'La línea negra absorbe la luz infrarroja, impidiendo que rebote hacia el fototransistor receptor.',
                'La línea negra emite chispas eléctricas detectadas por la antena del robot.',
                'La línea negra multiplica la luz infrarroja reflejando el doble de energía.',
                'La línea negra apaga el microcontrolador Arduino de inmediato.'
            ],
            correct: 0,
            explanation: 'Los cuerpos de color negro absorben la práctica totalidad de la radiación lumínica e infrarroja. Al no haber reflexión hacia el fototransistor receptor, la salida digital del módulo pasa a nivel alto HIGH (5V).'
        },
        {
            id: 3,
            question: 'En un módulo sensor infrarrojo estándar con comparador LM393, ¿qué valor digital se obtiene en `digitalRead(pinIR)` al colocar una hoja blanca frente al sensor?',
            options: [
                'LOW (0 Voltios), con el LED testigo del módulo encendido.',
                'HIGH (5 Voltios), con el LED testigo del módulo apagado.',
                'Un valor analógico de 1023.',
                '-1 Voltio de tensión negativa.'
            ],
            correct: 0,
            explanation: 'Al rebotar la luz en el blanco, el fototransistor conduce y el comparador LM393 conmuta la salida digital a nivel bajo LOW (0V), activando además el LED testigo D0 del circuito.'
        },
        {
            id: 4,
            question: '¿Qué componente del sensor PIR HC-SR501 es el responsable de dividir el ángulo de visión en múltiples zonas cónicas para detectar el paso de un cuerpo caliente?',
            options: [
                'La Lente de Fresnel (cúpula blanca exterior).',
                'El cristal de cuarzo oscilador.',
                'El conector USB hembra.',
                'El diodo láser rojo.'
            ],
            correct: 0,
            explanation: 'La Lente de Fresnel es una cubierta óptica facetada que divide el campo visual en sectores. Cuando una persona camina, pasa de una zona focal a otra, generando los cambios bruscos de temperatura que activan el sensor piroeléctrico.'
        },
        {
            id: 5,
            question: 'Para calibrar un sensor infrarrojo y evitar que confunda un piso gris claro con una línea negra, ¿qué elemento físico del módulo se debe ajustar?',
            options: [
                'El potenciómetro trimmer azul ubicado en la placa.',
                'El cable de alimentación GND.',
                'El código fuente borrando la función loop().',
                'La resistencia interna del microcontrolador.'
            ],
            correct: 0,
            explanation: 'Girando el tornillo del potenciómetro trimmer azul se varía la tensión de referencia del comparador LM393, ajustando la sensibilidad exacta para distinguir entre el fondo y la línea.'
        },
        {
            id: 6,
            question: 'En un sistema de alarma con sensor PIR conectado al Pin Digital 3 de Arduino, ¿qué condición lógica `if` en C++ indica que se ha detectado a un intruso?',
            options: [
                'if (digitalRead(3) == HIGH)',
                'if (digitalRead(3) == LOW)',
                'if (analogRead(3) == 0)',
                'if (pinMode(3, OUTPUT))'
            ],
            correct: 0,
            explanation: 'El sensor PIR entrega un nivel lógico HIGH (5V) en su pin OUT tan pronto detecta movimiento en su zona de cobertura. Por tanto, `digitalRead(3) == HIGH` valida la presencia del intruso.'
        },
        {
            id: 7,
            question: '¿Cuál es la función del potenciómetro "Time Delay" (Tx) presente en la placa del sensor PIR HC-SR501?',
            options: [
                'Definir cuántos segundos permanece la salida en HIGH tras ocurrir la detección de movimiento.',
                'Ajustar la velocidad del procesador ATmega328P de Arduino.',
                'Cambiar la frecuencia de la señal WiFi del sensor.',
                'Aumentar el volumen del zumbador interno.'
            ],
            correct: 0,
            explanation: 'El trimmer Tx ajusta el tiempo de retardo de salida (típicamente entre 3 y 300 segundos). Permite que la señal de alarma permanezca activa el tiempo deseado antes de volver a LOW.'
        },
        {
            id: 8,
            question: '¿A qué tipo de pin de Arduino DEBE conectarse el pin de salida digital (OUT / D0) de estos sensores para su lectura directa?',
            options: [
                'A cualquier pin digital (D0 a D13) configurado previamente como pinMode(pin, INPUT).',
                'Exclusivamente a los pines de alimentación 5V y GND.',
                'A los terminales del cristal de 16 MHz.',
                'Al pin RESET de la placa Arduino.'
            ],
            correct: 0,
            explanation: 'Tanto el sensor IR como el PIR entregan señales binarias (0V o 5V) que deben ingresar por un pin digital de Arduino configurado en modo entrada con `pinMode(pin, INPUT)`.'
        },
        {
            id: 9,
            question: 'Si un sensor PIR está colocado en una habitación vacía y totalmente a oscuras (sin luz visible), ¿puede detectar a una persona que entra caminando?',
            options: [
                'Sí, porque el sensor PIR detecta la radiación infrarroja térmica del cuerpo, no la luz visible.',
                'No, porque los sensores solo funcionan en presencia de luz solar directa.',
                'No, porque la oscuridad destruye las señales electrónicas.',
                'Solo si la persona lleva una linterna encendida.'
            ],
            correct: 0,
            explanation: 'Los cuerpos emiten radiación infrarroja en función de su temperatura (~37 °C en humanos). El sensor PIR es ciego a la luz visible pero extraordinariamente sensible a la emisión térmica, por lo que opera con total eficacia en completa oscuridad.'
        },
        {
            id: 10,
            question: 'En un robot diferencial con 2 sensores IR frontales (Sensor Izquierdo y Sensor Derecho), ¿qué acción deben realizar los motores si el Sensor Izquierdo detecta línea negra y el Derecho superficie blanca?',
            options: [
                'Girar hacia la izquierda para volver a centrar el robot sobre la línea negra.',
                'Avanzar a toda velocidad en línea recta sin girar.',
                'Frenar y apagar los motores indefinidamente.',
                'Elevar los sensores mediante un pistón neumático.'
            ],
            correct: 0,
            explanation: 'Si el sensor izquierdo entra a la línea negra, significa que el robot se está desviando hacia la derecha. Para corregir la trayectoria, el algoritmo debe mandar a girar a la izquierda (reduciendo la velocidad del motor izquierdo o frenándolo).'
        }
    ]
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 're-m2-l3-content',
                content: lessonDefinition.content
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 're-m2-l3-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        prueba: [
            createQuizBlock({
                id: 're-m2-l3-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions
            })
        ]
    }
});
