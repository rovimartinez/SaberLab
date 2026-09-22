import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Proyecto Integrador: Reloj / Contador Digital 0 a 9',
    hasSimulator: true,
    content: `
        <!-- ── 14.1 Visión General de la Arquitectura del Sistema ── -->
        <h3 id="ee-3-14-1" style="color: #f59e0b; margin: 1.5rem 0 1rem; font-size: 1.4rem;">14.1 Arquitectura por Bloques del Contador Digital 0 a 9</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            En este proyecto integrador del Módulo 3, combinamos los tres grandes pilares estudiados a lo largo de las lecciones anteriores para construir un <strong>sistema digital secuencial completo</strong>: un contador decimal de 0 a 9 con avance automático por segundo, base de todo reloj digital, cronómetro o velocímetro.
        </p>

        <!-- Diagrama de Flujo de Bloques Funcionales -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <!-- Bloque 1 -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(56, 189, 248, 0.4); border-radius: 16px; padding: 1.25rem;">
                <div style="color: #38bdf8; font-weight: 800; font-size: 0.95rem; margin-bottom: 0.4rem;">1. Bloque Base de Tiempo (Clock)</div>
                <div style="color: #fbbf24; font-weight: bold; font-size: 0.85rem; margin-bottom: 0.5rem;">CI NE555 (Astable a 1 Hz)</div>
                <p style="color: #cbd5e1; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Genera un tren continuo de ondas cuadradas a exactamente <strong>1 pulso por segundo (1 Hz)</strong> para gobernar el ritmo del sistema.
                </p>
            </div>

            <!-- Bloque 2 -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(16, 185, 129, 0.4); border-radius: 16px; padding: 1.25rem;">
                <div style="color: #10b981; font-weight: 800; font-size: 0.95rem; margin-bottom: 0.4rem;">2. Bloque de Conteo (Secuencial)</div>
                <div style="color: #fbbf24; font-weight: bold; font-size: 0.85rem; margin-bottom: 0.5rem;">CI 74LS93 (Módulo 10 BCD)</div>
                <p style="color: #cbd5e1; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Recibe los pulsos de reloj y genera en sus 4 salidas (QA, QB, QC, QD) el conteo binario cíclico del <strong>0000_2 (0) al 1001_2 (9)</strong>.
                </p>
            </div>

            <!-- Bloque 3 -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(245, 158, 11, 0.4); border-radius: 16px; padding: 1.25rem;">
                <div style="color: #fbbf24; font-weight: 800; font-size: 0.95rem; margin-bottom: 0.4rem;">3. Bloque Decodificador</div>
                <div style="color: #fbbf24; font-weight: bold; font-size: 0.85rem; margin-bottom: 0.5rem;">CI CD4511 (Driver CMOS)</div>
                <p style="color: #cbd5e1; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Convierte los 4 bits BCD en las 7 señales lógicas independientes de potencia positiva (+5V) para excitar los segmentos <strong>a hasta g</strong>.
                </p>
            </div>

            <!-- Bloque 4 -->
            <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(239, 68, 68, 0.4); border-radius: 16px; padding: 1.25rem;">
                <div style="color: #ef4444; font-weight: 800; font-size: 0.95rem; margin-bottom: 0.4rem;">4. Bloque de Visualización</div>
                <div style="color: #fbbf24; font-weight: bold; font-size: 0.85rem; margin-bottom: 0.5rem;">Display 7 Seg (Cátodo Común)</div>
                <p style="color: #cbd5e1; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Presenta el número legible para el usuario a través de 7 resistencias limitadoras individuales de <strong>220 Ω / 330 Ω</strong>.
                </p>
            </div>
        </div>

        <!-- Placeholder Imagen: Diagrama Esquemático Completo del Sistema -->
        <div style="background: #0f172a; border: 2px dashed rgba(56, 189, 248, 0.4); border-radius: 16px; padding: 1.5rem; text-align: center; margin: 1.5rem 0 2rem;">
            <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">📐</div>
            <div style="color: #38bdf8; font-weight: 700; font-size: 0.95rem; margin-bottom: 0.25rem;">[ESQUEMA DIDÁCTICO INTEGRAL: Interconexión Completa NE555 + 74LS93 + CD4511 + Display]</div>
            <div style="color: #94a3b8; font-size: 0.8rem;">Plano esquemático con buses de interconexión, líneas de alimentación de 5V, capacitores de filtrado y mapeo de pines</div>
        </div>

        <!-- ── 14.2 Mapeo de Interconexión Pin a Pin ── -->
        <h3 id="ee-3-14-2" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">14.2 Guía de Cableado e Interconexión Pin a Pin</h3>
        
        <div style="overflow-x: auto; margin-bottom: 2rem;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #cbd5e1; background: rgba(15, 23, 42, 0.7); border-radius: 12px; overflow: hidden;">
                <thead>
                    <tr style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; text-align: left;">
                        <th style="padding: 10px 14px;">Módulo Origen</th>
                        <th style="padding: 10px 14px;">Pin Origen</th>
                        <th style="padding: 10px 14px;">Módulo Destino</th>
                        <th style="padding: 10px 14px;">Pin Destino</th>
                        <th style="padding: 10px 14px;">Función / Señal</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px; font-weight: bold; color: #38bdf8;">NE555 (Clock)</td>
                        <td style="padding: 10px 14px;">Pin 3 (Output)</td>
                        <td style="padding: 10px 14px; font-weight: bold; color: #10b981;">74LS93 (Contador)</td>
                        <td style="padding: 10px 14px;">Pin 14 (CKA)</td>
                        <td style="padding: 10px 14px;">Señal de reloj periódica (1 Hz)</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px; font-weight: bold; color: #10b981;">74LS93</td>
                        <td style="padding: 10px 14px;">Pin 12 (QA)</td>
                        <td style="padding: 10px 14px; font-weight: bold; color: #10b981;">74LS93</td>
                        <td style="padding: 10px 14px;">Pin 1 (CKB)</td>
                        <td style="padding: 10px 14px;">Puente en cascada de 4 bits</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px; font-weight: bold; color: #10b981;">74LS93</td>
                        <td style="padding: 10px 14px;">Pin 11 (QD) & Pin 9 (QB)</td>
                        <td style="padding: 10px 14px; font-weight: bold; color: #10b981;">74LS93</td>
                        <td style="padding: 10px 14px;">Pin 2 (R0_1) & Pin 3 (R0_2)</td>
                        <td style="padding: 10px 14px; color: #fbbf24;">Reset a cero al alcanzar el 10 (BCD)</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px; font-weight: bold; color: #10b981;">74LS93</td>
                        <td style="padding: 10px 14px;">Pines 12, 9, 8, 11 (QA-QD)</td>
                        <td style="padding: 10px 14px; font-weight: bold; color: #f59e0b;">CD4511</td>
                        <td style="padding: 10px 14px;">Pines 7, 1, 2, 6 (A, B, C, D)</td>
                        <td style="padding: 10px 14px;">Bus de datos binarios (BCD)</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px; font-weight: bold; color: #f59e0b;">CD4511</td>
                        <td style="padding: 10px 14px;">Pines 3 (LT) & 4 (BL)</td>
                        <td style="padding: 10px 14px; font-weight: bold; color: #ef4444;">Fuente +5V</td>
                        <td style="padding: 10px 14px;">Riel Positivo V_CC</td>
                        <td style="padding: 10px 14px;">Habilitación de decodificación normal</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px; font-weight: bold; color: #f59e0b;">CD4511</td>
                        <td style="padding: 10px 14px;">Pin 5 (LE)</td>
                        <td style="padding: 10px 14px; font-weight: bold; color: #ef4444;">Tierra GND</td>
                        <td style="padding: 10px 14px;">Riel Negativo (0V)</td>
                        <td style="padding: 10px 14px;">Modo transparente continuo</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 14px; font-weight: bold; color: #f59e0b;">CD4511</td>
                        <td style="padding: 10px 14px;">Pines 13, 12, 11, 10, 9, 15, 14</td>
                        <td style="padding: 10px 14px; font-weight: bold; color: #38bdf8;">Display 7 Seg CC</td>
                        <td style="padding: 10px 14px;">Pines a, b, c, d, e, f, g</td>
                        <td style="padding: 10px 14px; color: #10b981;">A través de 7 resistores de 330 Ω</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- ── 14.3 Desacoplo de Ruido y Estabilidad en Circuitos TTL/CMOS ── -->
        <h3 id="ee-3-14-3" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">14.3 Desacoplo de Ruido y Buenas Prácticas de Ensamble</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            Uno de los problemas más frustrantes al armar circuitos digitales en protoboard son los <strong>falsos conteos o saltos erráticos de números</strong> (por ejemplo, pasar del 2 al 6 de un solo salto). Esto ocurre por ruido de conmutación electromagnética (glitches) en las líneas de alimentación cuando varios integrados cambian de estado a la vez.
        </p>

        <div style="background: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.35); border-radius: 18px; padding: 1.35rem; margin-bottom: 2rem;">
            <div style="color: #10b981; font-weight: 800; font-size: 1.05rem; margin-bottom: 0.5rem;">🛡️ Las Tres Reglas de Blindaje Contra Ruido en Protoboard:</div>
            <ol style="color: #cbd5e1; font-size: 0.85rem; line-height: 1.7; margin-left: 1.25rem; padding: 0; margin: 0;">
                <li><strong>Capacitor de Desacoplo por Integrado:</strong> Colocar un capacitor cerámico de <strong>100 nF (código 104)</strong> lo más cerca posible entre el pin V_CC y GND de cada uno de los 3 chips (555, 74LS93 y CD4511).</li>
                <li><strong>Capacitor de Tanque / Filtro en los Rieles:</strong> Conectar un capacitor electrolítico de <strong>10 µF a 100 µF (16V)</strong> directamente en los extremos del riel de alimentación de la protoboard.</li>
                <li><strong>Tierra Común Firme:</strong> Asegurar que todos los terminales de tierra (Pin 1 del 555, Pin 10 del 74LS93, Pin 8 del CD4511 y los cátodos comunes del display) compartan el mismo riel continuo de GND.</li>
            </ol>
        </div>

        <!-- ── 14.4 Guía de Diagnóstico y Resolución de Fallas (Troubleshooting) ── -->
        <h3 id="ee-3-14-4" style="color: #f59e0b; margin: 2rem 0 1rem; font-size: 1.4rem;">14.4 Matriz de Diagnóstico y Resolución de Problemas en el Laboratorio</h3>
        
        <div style="overflow-x: auto; margin-bottom: 2rem;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #cbd5e1; background: rgba(15, 23, 42, 0.7); border-radius: 12px; overflow: hidden;">
                <thead>
                    <tr style="background: rgba(239, 68, 68, 0.15); color: #ef4444; text-align: left;">
                        <th style="padding: 10px 14px;">Síntoma / Fallo</th>
                        <th style="padding: 10px 14px;">Causa Raíz Más Probable</th>
                        <th style="padding: 10px 14px;">Solución Inmediata</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px; font-weight: bold; color: #fbbf24;">El display está completamente apagado</td>
                        <td style="padding: 10px 14px;">Pin 4 (BL) del CD4511 conectado a GND o sin conexión a +5V.</td>
                        <td style="padding: 10px 14px; color: #10b981;">Conectar firmemente el Pin 4 (BL) a +5V.</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px; font-weight: bold; color: #fbbf24;">El display muestra un "8" fijo y no avanza</td>
                        <td style="padding: 10px 14px;">Pin 3 (LT - Lamp Test) puesto a tierra (GND).</td>
                        <td style="padding: 10px 14px; color: #10b981;">Mover el Pin 3 a la línea positiva de +5V.</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px; font-weight: bold; color: #fbbf24;">El display muestra siempre "0" y no cambia</td>
                        <td style="padding: 10px 14px;">Pin 5 (LE) en HIGH (+5V) o el 555 no está oscilando.</td>
                        <td style="padding: 10px 14px; color: #10b981;">Poner Pin 5 (LE) a GND y verificar que el LED del 555 destelle.</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 10px 14px; font-weight: bold; color: #fbbf24;">Cuenta hasta 15 en vez de reiniciar en 9</td>
                        <td style="padding: 10px 14px;">Falta conectar los pines de reset R0(1) y R0(2) a QD y QB.</td>
                        <td style="padding: 10px 14px; color: #10b981;">Unir Pin 11 con Pin 2 y Pin 9 con Pin 3 en el 74LS93.</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 14px; font-weight: bold; color: #fbbf24;">El conteo salta números aleatoriamente</td>
                        <td style="padding: 10px 14px;">Ruido en la fuente por falta de capacitores de desacoplo.</td>
                        <td style="padding: 10px 14px; color: #10b981;">Instalar capacitores cerámicos de 100 nF entre VCC y GND de cada integrado.</td>
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
                id: 'ee-m3-l14-content',
                content: lessonDefinition.content
            })
        ],
        flashcards: [
            createFlashcardsBlock({
                id: 'ee-m3-l14-flashcards',
                title: 'Flashcards Nemotécnicas: Proyecto Integrador',
                cards: [
                    {
                        id: 'ee-m3-l14-fc1',
                        front: '¿Cuáles son los 4 bloques principales del reloj / contador digital 0-9?',
                        back: '1) Base de Tiempo (NE555), 2) Contador BCD (74LS93), 3) Decodificador (CD4511) y 4) Visualización (Display 7 Seg Cátodo Común).'
                    },
                    {
                        id: 'ee-m3-l14-fc2',
                        front: '¿A qué frecuencia debe ajustarse el NE555 para contar segundos reales?',
                        back: 'Exactamente a 1 Hz (1 ciclo u oscilación por segundo, período T = 1 s).'
                    },
                    {
                        id: 'ee-m3-l14-fc3',
                        front: '¿Dónde se inyecta la señal de reloj del 555 en el contador 74LS93?',
                        back: 'En el Pin 14 (CKA), entrada de reloj del primer Flip-Flop.'
                    },
                    {
                        id: 'ee-m3-l14-fc4',
                        front: '¿Cómo se conectan los 4 bits de datos entre el 74LS93 y el CD4511?',
                        back: 'QA (Pin 12) a Entrada A (Pin 7), QB (Pin 9) a Entrada B (Pin 1), QC (Pin 8) a Entrada C (Pin 2) y QD (Pin 11) a Entrada D (Pin 6).'
                    },
                    {
                        id: 'ee-m3-l14-fc5',
                        front: '¿Cómo se evita que el contador avance del 9 al 15 y vuelva a 0?',
                        back: 'Conectando QD (peso 8) a R0(1) y QB (peso 2) a R0(2). Al intentar pasar a 10 (1010_2) se resetea instantáneamente a 0.'
                    },
                    {
                        id: 'ee-m3-l14-fc6',
                        front: '¿A dónde deben conectarse los pines LT y BL del CD4511 para funcionamiento normal?',
                        back: 'Ambos deben conectarse permanentemente al riel positivo de +5V (V_CC).'
                    },
                    {
                        id: 'ee-m3-l14-fc7',
                        front: '¿A dónde debe conectarse el pin LE (Latch Enable) del CD4511 para visualización en vivo?',
                        back: 'A Tierra (GND / 0V), permitiendo el modo transparente de actualización continua.'
                    },
                    {
                        id: 'ee-m3-l14-fc8',
                        front: '¿Por qué se colocan capacitores cerámicos de 100 nF en cada chip?',
                        back: 'Para desacoplar el ruido de alta frecuencia en la alimentación y evitar falsos disparos o saltos de números en el contador.'
                    },
                    {
                        id: 'ee-m3-l14-fc9',
                        front: '¿Por qué cada segmento del display lleva su propia resistencia de 220 Ω / 330 Ω?',
                        back: 'Para garantizar un brillo uniforme e independiente sin importar cuántos segmentos estén encendidos simultáneamente.'
                    },
                    {
                        id: 'ee-m3-l14-fc10',
                        front: '¿Cómo se expande este proyecto a un reloj de dos dígitos (00 a 99)?',
                        back: 'Tomando la señal del pulso de reset del primer 74LS93 (unidades) como entrada de reloj para un segundo 74LS93 (decenas).'
                    }
                ]
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m3-l14-quiz',
                title: 'Evaluación: Integración del Sistema de Reloj Digital',
                questions: [
                    {
                        id: 'ee-m3-l14-q1',
                        objective: 'Identificar el flujo de señal en el sistema',
                        concept: 'flujo_senales',
                        difficulty: 'easy',
                        q: '¿Cuál es la secuencia correcta del flujo de información en el contador digital 0 a 9?',
                        options: [
                            'NE555 (Pulsos) -> 74LS93 (Conteo Binario) -> CD4511 (Decodificación) -> Display 7 Segmentos (Visual)',
                            'Display -> CD4511 -> 74LS93 -> NE555',
                            '74LS93 -> NE555 -> CD4511 -> Display',
                            'NE555 -> Display -> CD4511 -> 74LS93'
                        ],
                        correct: 0,
                        feedback: '¡Exacto! El reloj 555 genera el tiempo, el 74LS93 cuenta los ciclos en binario, el CD4511 traduce a 7 segmentos y el display muestra el número legible.'
                    },
                    {
                        id: 'ee-m3-l14-q2',
                        objective: 'Identificar conexión de reloj',
                        concept: 'acople_reloj',
                        difficulty: 'medium',
                        q: '¿A qué pin del 74LS93 se conecta directamente la salida (Pin 3) del temporizador 555?',
                        options: [
                            'Al Pin 14 (CKA - Entrada de Reloj A)',
                            'Al Pin 1 (CKB)',
                            'Al Pin 10 (GND)',
                            'Al Pin 2 (R0_1)'
                        ],
                        correct: 0,
                        feedback: '¡Correcto! CKA es la entrada de reloj principal del primer flip-flop del 74LS93.'
                    },
                    {
                        id: 'ee-m3-l14-q3',
                        objective: 'Resolver problemas de conteo incompleto o errático',
                        concept: 'troubleshooting_display_apagado',
                        difficulty: 'medium',
                        q: 'Si armas todo el circuito y el display de 7 segmentos permanece completamente oscuro a pesar de que el LED del 555 destella, ¿cuál es el primer punto de control?',
                        options: [
                            'Verificar que el Pin 4 (BL - Blanking) del CD4511 esté conectado a +5V y no a GND',
                            'Cambiar inmediatamente el transformador de la casa',
                            'Poner el pin 1 del 555 a +5V',
                            'Desconectar el display'
                        ],
                        correct: 0,
                        feedback: '¡Excelente! Si el pin Blanking (BL) queda conectado a GND o flotando, el CD4511 fuerza el apagado total de todos los segmentos.'
                    },
                    {
                        id: 'ee-m3-l14-q4',
                        objective: 'Comprender la función del reset a 10',
                        concept: 'reset_bcd_funcion',
                        difficulty: 'hard',
                        q: 'Si desconectas los cables que van de QD y QB a los pines R0(1) y R0(2) del 74LS93 y los mandas a GND, ¿qué comportamiento observará el usuario?',
                        options: [
                            'El contador contará del 0 al 9, luego el display se apagará del 10 al 15, y volverá a encender en 0 (conteo hexadecimal)',
                            'El circuito dejará de oscilar permanentemente',
                            'El display explotará por exceso de corriente',
                            'El 555 aumentará su velocidad al doble'
                        ],
                        correct: 0,
                        feedback: '¡Muy bien! Sin el reset en 10, el 74LS93 contará libremente en módulo 16 (0 a 15). Del 10 al 15 el CD4511 apagará los segmentos por ser códigos no BCD y reiniciará en 0.'
                    },
                    {
                        id: 'ee-m3-l14-q5',
                        objective: 'Aplicar técnicas de desacoplo de ruido',
                        concept: 'desacoplo_ruido',
                        difficulty: 'medium',
                        q: 'Al probar el contador en la protoboard, notas que ocasionalmente salta del número 3 al 7 sin pasar por el 4. ¿Cómo resuelves este fallo?',
                        options: [
                            'Instalando capacitores cerámicos de 100 nF entre VCC y GND pegados a cada circuito integrado para eliminar picos de ruido',
                            'Aumentando el voltaje de alimentación a 12V',
                            'Quitando las resistencias del display',
                            'Invirtiendo la polaridad de la batería'
                        ],
                        correct: 0,
                        feedback: '¡Exacto! Los saltos erráticos se deben a rebotes o ruidos de conmutación en la línea de 5V. Los capacitores de desacoplo filtran estos transitorios.'
                    },
                    {
                        id: 'ee-m3-l14-q6',
                        objective: 'Conexión de las 7 resistencias limitadoras',
                        concept: 'resistencias_segmento',
                        difficulty: 'easy',
                        q: '¿Cuántas resistencias limitadoras de 220 Ω / 330 Ω se requieren para interconectar el CD4511 con el display de 7 segmentos?',
                        options: [
                            '7 resistencias (una por cada línea de segmento a, b, c, d, e, f, g)',
                            '1 sola resistencia en el pin 8',
                            'Ninguna, el CD4511 ya tiene resistencias de 10 kΩ',
                            '14 resistencias'
                        ],
                        correct: 0,
                        feedback: '¡Correcto! Se requieren exactamente 7 resistencias independientes para asegurar la corriente individual de cada LED.'
                    },
                    {
                        id: 'ee-m3-l14-q7',
                        objective: 'Configuración del Pin Latch Enable',
                        concept: 'congelamiento_le',
                        difficulty: 'medium',
                        q: 'Deseas agregar un botón de "PAUSA / FREEZE" al cronómetro. ¿A qué pin del CD4511 debes conectar este pulsador?',
                        options: [
                            'Al Pin 5 (LE - Latch Enable), para alternar entre GND (conteo en vivo) y +5V (congelar lectura)',
                            'Al Pin 3 (LT)',
                            'Al Pin 16 (V_DD)',
                            'Al cátodo común del display'
                        ],
                        correct: 0,
                        feedback: '¡Excelente! Al enviar nivel ALTO al Pin 5 (LE), el decodificador memoriza el valor en pantalla permitiendo pausar visualmente el cronómetro mientras el contador interno sigue corriendo.'
                    },
                    {
                        id: 'ee-m3-l14-q8',
                        objective: 'Dimensionamiento de la fuente de poder',
                        concept: 'consumo_corriente',
                        difficulty: 'hard',
                        q: 'Si el display muestra el número "8" (7 segmentos encendidos a 12 mA cada uno) y los 3 circuitos integrados consumen 40 mA en total, ¿cuánta corriente mínima debe entregar la fuente de 5V?',
                        options: [
                            'Al menos 124 mA (84 mA del display + 40 mA de los circuitos)',
                            '20 mA únicamente',
                            '10 Amperios',
                            '2.5 mA'
                        ],
                        correct: 0,
                        feedback: '¡Correcto! 7 segmentos · 12 mA = 84 mA. Sumado a los 40 mA del 555, 74LS93 y CD4511 da 124 mA, lo que requiere una fuente capaz de suministrar al menos 200-500 mA.'
                    },
                    {
                        id: 'ee-m3-l14-q9',
                        objective: 'Conocimiento de cascada multi-dígito',
                        concept: 'cascada_decadas',
                        difficulty: 'medium',
                        q: 'Para crear un reloj de minutos y segundos (00 a 59), ¿de dónde se toma el pulso de reloj para el contador de decenas de segundos?',
                        options: [
                            'Del pulso de reset a cero del contador de unidades (cada vez que las unidades pasan de 9 a 0)',
                            'De la red eléctrica de 220V',
                            'Directamente de la salida del Pin 3 del 555',
                            'Del pin Lamp Test'
                        ],
                        correct: 0,
                        feedback: '¡Muy bien! El pulso de desbordamiento (Carry) generado al pasar de 9 a 0 en las unidades sirve de reloj para el siguiente bloque de decenas.'
                    },
                    {
                        id: 'ee-m3-l14-q10',
                        objective: 'Importancia del proyecto integrador',
                        concept: 'sintesis_m3',
                        difficulty: 'easy',
                        q: '¿Qué habilidad técnica fundamental consolida este proyecto integrador del Módulo 3?',
                        options: [
                            'La capacidad de articular osciladores analógicos, lógica secuencial TTL y controladores de visualización CMOS en un sistema digital funcional',
                            'La memorización de fórmulas químicas',
                            'El bobinado manual de transformadores de alta tensión',
                            'El uso de motores de combustión interna'
                        ],
                        correct: 0,
                        feedback: '¡Felicitaciones! Este proyecto sintetiza la transición completa desde la electrónica analógica y temporización hasta la lógica digital y la optoelectrónica aplicada.'
                    }
                ],
                quizConfig: { timePerQuestion: 30, requiredScorePercent: 80 }
            })
        ]
    }
});
