import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    CheckCircle, 
    FileText, 
    PlayCircle, 
    BookOpen, 
    RefreshCw, 
    Wrench, 
    ClipboardList, 
    PenTool, 
    Monitor, 
    ChevronRight,
    Search,
    X,
    Clock,
    Trophy,
    AlertCircle,
    Check,
    Bot,
    Zap,
    Code,
    FlaskConical,
    Box,
    Brain,
    Layout,
    Award
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';
import './Lesson.css';
import ChallengeRoadmap from '../components/ChallengeRoadmap';
import CodeEditor from '../components/CodeEditor';
import ArduinoSimulatorV2 from '../components/ArduinoSimulatorV2';

const subjectData = {
    1: { name: 'Electricidad y Electrónica Básica', color: '#f59e0b', icon: <Zap size={32} /> },
    2: { name: 'Fundamentos de Programación', color: '#3b82f6', icon: <Code size={32} /> },
    3: { name: 'Mediaciones Tecnológicas en la Química', color: '#10b981', icon: <FlaskConical size={32} /> },
    4: { name: 'Modelado y Animación 3D', color: '#ec4899', icon: <Box size={32} /> },
    5: { name: 'Robótica Educativa', color: '#a855f7', icon: <Bot size={32} />, teacher: 'Ronny Martinez' },
    6: { name: 'Tendencias y Desarrollo en Tecnología', color: '#f97316', icon: <Brain size={32} /> }
};

const tabs = [
    { id: 'contenido', label: 'Contenido', icon: <BookOpen size={18} /> },
    { id: 'repaso', label: 'Repaso', icon: <RefreshCw size={18} /> },
    { id: 'simulador', label: 'Práctica', icon: <Monitor size={18} /> },
    { id: 'prueba', label: 'Prueba', icon: <ClipboardList size={18} /> }
];

const lessonsData = {
    5: {
        'm1-l1': {
            title: 'Mi primer parpadeo (Entorno y Salidas Digitales)',
            content: `
                <h3 style="color: #a855f7; margin: 1.5rem 0 1rem;">1.1 Introducción al Hardware Abierto</h3>
                <p style="margin-bottom: 1rem; line-height: 1.8;">El <strong>hardware abierto</strong> se refiere a dispositivos cuyas especificaciones de diseño son públicas, permitiendo que cualquiera los estudie, modifique y construya. Arduino es el ejemplo más popular y exitoso de este movimiento a nivel mundial.</p>
                
                <h3 style="color: #a855f7; margin: 2rem 0 1rem;">1.2 ¿Qué es Arduino?</h3>
                <div style="display: flex; gap: 2rem; margin-bottom: 2rem; flex-wrap: wrap; align-items: flex-start;">
                    <div style="flex: 1; min-width: 280px;">
                        <p style="margin-bottom: 1rem; line-height: 1.8;">Arduino es una <strong>plataforma de desarrollo</strong> basada en hardware y software libre. Consiste en una placa con un microcontrolador que puede ser programada para interactuar con el mundo físico mediante una gran variedad de sensores y actuadores.</p>
                        <p style="margin-bottom: 1rem; line-height: 1.8;">Fue creado en 2005 en Italia para que estudiantes pudieran crear proyectos interactivos de manera sencilla y económica. Hoy es la plataforma de hardware más popular del mundo, con una comunidad global inmensa que comparte miles de proyectos creativos cada día.</p>
                        <div style="background: rgba(16, 185, 129, 0.1); padding: 1rem; border-radius: 10px; border-left: 4px solid #10b981;">
                            <strong style="color: #10b981;">💡 Dato:</strong> Arduino Uno es el modelo más popular y versátil para aprender. Funciona con un microcontrolador ATmega328P a 16 MHz.
                        </div>
                    </div>
                    <div style="flex: 1; min-width: 260px; display: flex; justify-content: center;">
                        <img src="https://i.postimg.cc/CxSNt25F/Arduino-Uno.png" alt="Arduino Uno" style="width: 100%; max-width: 420px; height: auto; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.4);" />
                    </div>
                </div>
                
                <h4 style="color: #a855f7; margin: 1.5rem 0 1rem;">Componentes Principales del Arduino Uno</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                    <div style="background: rgba(168, 85, 247, 0.1); padding: 1rem; border-radius: 10px; border: 1px solid rgba(168,85,247,0.2);">
                        <strong style="color: #a855f7;">🧠 CPU (ATmega328P)</strong><br><small style="color: #94a3b8;">El cerebro de la placa. Corre a 16 MHz y ejecuta tu programa línea por línea.</small>
                    </div>
                    <div style="background: rgba(59, 130, 246, 0.1); padding: 1rem; border-radius: 10px; border: 1px solid rgba(59,130,246,0.2);">
                        <strong style="color: #3b82f6;">💾 Memoria Flash (32 KB)</strong><br><small style="color: #94a3b8;">Donde se almacena tu sketch (programa). Es permanente: no se borra al desconectar.</small>
                    </div>
                    <div style="background: rgba(16, 185, 129, 0.1); padding: 1rem; border-radius: 10px; border: 1px solid rgba(16,185,129,0.2);">
                        <strong style="color: #10b981;">📌 Pines Digitales (0–13)</strong><br><small style="color: #94a3b8;">14 pines que pueden leer o escribir señales de 0V (LOW) o 5V (HIGH).</small>
                    </div>
                    <div style="background: rgba(251, 191, 36, 0.1); padding: 1rem; border-radius: 10px; border: 1px solid rgba(251,191,36,0.2);">
                        <strong style="color: #fbbf24;">🔌 Pines Analógicos (A0–A5)</strong><br><small style="color: #94a3b8;">6 entradas que leen valores continuos entre 0 y 5V con resolución de 10 bits (0–1023).</small>
                    </div>
                    <div style="background: rgba(236, 72, 153, 0.1); padding: 1rem; border-radius: 10px; border: 1px solid rgba(236,72,153,0.2);">
                        <strong style="color: #ec4899;">🔋 Alimentación</strong><br><small style="color: #94a3b8;">Vía USB (5V) o Jack DC (7–12V). Los pines 5V y 3.3V pueden alimentar componentes externos.</small>
                    </div>
                    <div style="background: rgba(249, 115, 22, 0.1); padding: 1rem; border-radius: 10px; border: 1px solid rgba(249,115,22,0.2);">
                        <strong style="color: #f97316;">🖥️ Puerto USB</strong><br><small style="color: #94a3b8;">Conecta el Arduino a tu computadora para subir programas y monitorear datos en tiempo real.</small>
                    </div>
                </div>

                <h3 style="color: #a855f7; margin: 2rem 0 1rem;">1.3 El LED y la Resistencia</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                    <div style="background: rgba(255,255,255,0.03); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
                        <h4 style="color: #fbbf24; margin-bottom: 0.75rem;">💡 ¿Qué es un LED?</h4>
                        <p style="line-height: 1.8; color: #cbd5e1; font-size: 0.95rem;">El LED (<em>Light Emitting Diode</em>) es un componente semiconductor que emite luz cuando la corriente eléctrica fluye a través de él. Tiene dos patas:</p>
                        <ul style="margin-top: 0.75rem; padding-left: 1.2rem; color: #94a3b8; line-height: 1.8;">
                            <li><strong style="color: #4ade80;">Ánodo (+):</strong> Pata más <strong>larga</strong> → conecta al pin del Arduino.</li>
                            <li><strong style="color: #f87171;">Cátodo (−):</strong> Pata más <strong>corta</strong> → conecta a GND.</li>
                        </ul>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
                        <h4 style="color: #f97316; margin-bottom: 0.75rem;">🛡️ ¿Por qué la Resistencia?</h4>
                        <p style="line-height: 1.8; color: #cbd5e1; font-size: 0.95rem;">Un LED sin resistencia se quema en segundos. La resistencia limita la corriente a un nivel seguro (~20mA). Para el LED estándar con Arduino usamos:</p>
                        <div style="background: rgba(249,115,22,0.1); padding: 0.75rem; border-radius: 8px; margin-top: 0.75rem; border-left: 3px solid #f97316; text-align: center;">
                            <strong style="color: #fbbf24; font-size: 1.1rem;">220 Ω</strong><br>
                            <small style="color: #94a3b8;">Código de colores: Rojo - Rojo - Marrón</small>
                        </div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                    <div style="display: flex; justify-content: center;">
                        <img src="https://i.postimg.cc/6qxRZ7Gt/LEDs.png" alt="Anatomía del LED" style="width: 100%; height: auto; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.4);" />
                    </div>
                    <div style="display: flex; justify-content: center;">
                        <img src="https://i.postimg.cc/rm1svfKp/resistencia.png" alt="Guía de colores de resistencias" style="width: 100%; height: auto; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.4);" />
                    </div>
                </div>

                <h3 style="color: #a855f7; margin: 2rem 0 1rem;">1.4 El Circuito</h3>
                <div style="background: rgba(15, 23, 42, 0.8); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(168,85,247,0.2); margin-bottom: 2rem;">
                    <p style="color: #cbd5e1; line-height: 1.8; margin-bottom: 1rem;">Para hacer parpadear un LED externo, conecta los componentes así:</p>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem; font-family: monospace; font-size: 0.9rem;">
                        <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                            <span style="background: rgba(168,85,247,0.2); padding: 4px 12px; border-radius: 6px; color: #a855f7; font-weight: bold;">Pin 13</span>
                            <span style="color: #4ade80;">────────────►</span>
                            <span style="background: rgba(251,191,36,0.2); padding: 4px 12px; border-radius: 6px; color: #fbbf24; font-weight: bold;">Ánodo LED (+)</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-left: 2rem;">
                            <span style="background: rgba(248,113,113,0.2); padding: 4px 12px; border-radius: 6px; color: #f87171; font-weight: bold;">Cátodo LED (−)</span>
                            <span style="color: #4ade80;">──── 220Ω ────►</span>
                            <span style="background: rgba(248,113,113,0.2); padding: 4px 12px; border-radius: 6px; color: #f87171; font-weight: bold;">GND</span>
                        </div>
                    </div>
                    <div style="background: rgba(16,185,129,0.1); padding: 0.75rem; border-radius: 8px; margin-top: 1rem; border-left: 3px solid #10b981;">
                        <strong style="color: #10b981;">💡 Pro tip:</strong> El Arduino ya tiene un LED integrado conectado al <strong>Pin 13 (LED_BUILTIN)</strong> — ¡puedes probarlo sin conectar nada extra!
                    </div>
                </div>

                <h3 style="color: #a855f7; margin: 2rem 0 1rem;">1.5 Estructura del Código Arduino</h3>
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

                <h3 style="color: #a855f7; margin: 1.5rem 0 1rem;">Código Base: Blink</h3>
                <div style="display: flex; gap: 2rem; align-items: flex-start; flex-wrap: wrap; margin-bottom: 1.5rem;">
                    <pre style="flex: 1; min-width: 280px; background: rgba(15, 23, 42, 0.6); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto; margin: 0;"><code style="color: #60a5fa;">// Programa: Blink - Mi primer parpadeo
// Hace parpadear el LED del pin 13 cada 1 segundo

void setup() {
  // Configuramos el pin 13 como SALIDA (OUTPUT)
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);  // Encender LED → 5V en el pin
  delay(1000);              // Esperar 1 segundo (1000 ms)
  digitalWrite(13, LOW);   // Apagar LED → 0V en el pin
  delay(1000);              // Esperar 1 segundo
  // El loop se repite ∞ → ¡el LED parpadea!
}</code></pre>
                    <div style="flex: 0 0 auto; display: flex; justify-content: center; align-items: center;">
                        <ArduinoSimulator />
                    </div>
                </div>
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
            `,
            flashcards: [
                { id: 'f1', type: 'hw', q: '¿Cómo se llama la pata más larga de un LED?', a: 'Ánodo (+)', sub: 'Conexión al pin Positivo' },
                { id: 'f2', type: 'hw', q: '¿Qué valor tiene la resistencia Rojo-Rojo-Marrón?', a: '220 Ω', sub: 'Protección LED estándar' },
                { id: 'f3', type: 'code', q: '¿Qué función se ejecuta solo una vez?', a: 'void setup()', sub: 'Configuración inicial' },
                { id: 'f4', type: 'code', q: '¿Qué función se repite infinitamente?', a: 'void loop()', sub: 'Lógica principal del programa' },
                { id: 'f5', type: 'code', q: '¿Qué hace digitalWrite(13, HIGH)?', a: 'Enciende el LED', sub: 'Pone 5V en el pin 13' },
                { id: 'f6', type: 'code', q: '¿Cuánto tiempo espera delay(500)?', a: '0.5 segundos', sub: '500 milisegundos = medio segundo' },
                { id: 'f7', type: 'hw', q: '¿Qué pata del LED es la más corta?', a: 'Cátodo (−)', sub: 'Se conecta a GND' },
                { id: 'f8', type: 'hw', q: '¿Cuántos pines digitales tiene el Arduino Uno?', a: '14 pines (0–13)', sub: 'Pueden ser INPUT u OUTPUT' },
                { id: 'f9', type: 'code', q: '¿Qué hace pinMode(13, OUTPUT)?', a: 'Define el pin 13 como salida', sub: 'Necesario antes de usar digitalWrite' },
                { id: 'f10', type: 'hw', q: '¿Qué voltaje suministra el pin 5V del Arduino?', a: '5 voltios', sub: 'Para alimentar componentes externos' },
                { id: 'f11', type: 'code', q: '¿Qué valor representa HIGH en un pin digital?', a: '5 voltios (encendido)', sub: 'LOW representa 0 voltios (apagado)' },
                { id: 'f12', type: 'hw', q: '¿Por qué se usa una resistencia con el LED?', a: 'Para limitar la corriente', sub: 'Evita que el LED se queme' },
            ],
            questions: [
                {
                    q: "¿Qué componente limita la corriente para que un LED no se queme?",
                    options: ["Capacitor", "Resistencia", "Transistor", "Diodo"],
                    correct: 1
                },
                {
                    q: "¿En qué función de Arduino escribimos el código que se repite infinitamente?",
                    options: ["setup()", "start()", "loop()", "main()"],
                    correct: 2
                },
                {
                    q: "¿Qué valor de resistencia se recomienda para proteger un LED con Arduino?",
                    options: ["10 Ω", "1000 Ω", "220 Ω", "47 Ω"],
                    correct: 2
                },
                {
                    q: "¿Cuál es la pata más larga de un LED y cómo se llama?",
                    options: ["La corta, Cátodo", "La larga, Ánodo", "La corta, Ánodo", "La larga, Cátodo"],
                    correct: 1
                },
                {
                    q: "¿Qué hace la instrucción delay(2000)?",
                    options: ["Apaga el LED por 2ms", "Pausa el programa 2 segundos", "Repite el loop 2000 veces", "Reinicia el Arduino"],
                    correct: 1
                }
            ]
        },
        'm1-l2': {
            title: 'Variables y Comentarios',
            content: `
                <div class="lesson-intro">
                    <p>En esta lección, daremos el siguiente paso en nuestra lógica de programación aprendiendo sobre <strong>Variables y Comentarios</strong>. Estos son las herramientas que hacen que tu código sea profesional, escalable y, sobre todo, comprensible para otros humanos.</p>
                </div>

                <div class="theory-section">
                    <h3>1. El Poder de los Comentarios</h3>
                    <p>Los comentarios son notas que el Arduino ignora totalmente. Sirven para explicar qué hace tu código y hacerlo profesional.</p>
                    <div class="highlight-panel" style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                        <p><strong>// Comentario de una línea:</strong> Usa doble barra para notas cortas.</p>
                        <p><strong>/* Comentario multilínea */:</strong> Usa este formato para explicaciones largas o bloques enteros.</p>
                    </div>
                </div>

                <div class="theory-section">
                    <h3>2. ¿Qué es verdaderamente una Variable?</h3>
                    <p>En el mundo real, si quieres guardar tus juguetes para que no se pierdan, usas una <strong>caja</strong> y le pones una <strong>etiqueta</strong> ("Mis Juguetes"). En programación, una <strong>variable</strong> es exactamente eso: una caja en la memoria de la placa Arduino donde podemos guardar información para usarla más adelante.</p>
                    
                    <p>Como las computadoras son muy estrictas, no puedes meter cualquier cosa en cualquier caja. Necesitas avisar qué forma tiene. Imagina que es como pedir "Solo peluches" o "Solo piezas de Lego". Por lo tanto, para crear esa caja de manera perfecta, necesitas 3 elementos clave:</p>
                    
                    <div class="highlight-panel" style="background: rgba(96, 165, 250, 0.1); border-left: 4px solid #3b82f6; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
                        <h4 style="color: #60a5fa; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem;">
                            La anatomía perfecta de una variable:
                        </h4>
                        <code style="font-size: 1.2rem; display: block; background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px;">
                            <span style="color: #a855f7;">int</span> <span style="color: #38bdf8;">tiempoEspera</span> = <span style="color: #fbbf24;">1000</span>;
                        </code>
                        <ul style="margin-top: 1rem; color: #cbd5e1; font-size: 0.95rem; line-height: 1.6;">
                            <li><strong style="color: #a855f7;">El Tipo (int):</strong> Es la regla. Le dice al Arduino qué clase de información va a almacenar (en este caso, un número entero). Es como el "tamaño" o "forma" de tu caja en memoria.</li>
                            <li><strong style="color: #38bdf8;">El Nombre (tiempoEspera):</strong> Es la etiqueta única de la caja. Como buenas prácticas, debe ser descriptivo (¡evita nombres como <code>a</code> o <code>x</code>!) e ir pegado con mayúscula la segunda palabra (a esto se llama <em>camelCase</em>).</li>
                            <li><strong style="color: #fbbf24;">El Valor (1000):</strong> Es el contenido inicial, lo que pones adentro justo cuando la firmas.</li>
                        </ul>
                    </div>

                    <p>¿Por qué no usar simplemente el número 1000 suelto por todos lados? Si luego tu jefe te dice que tiene que durar el doble, tendrías que buscar en cientos de líneas de código y cambiar cada "1000" manualmente (¡una pesadilla!). Con la variable, solo cambias el valor inicial una vez y, mágicamente, todas las veces que uses <code>tiempoEspera</code> se actualizará solo. Ese es el verdadero poder que te vuelve profesional.</p>
                </div>

                <div class="theory-section">
                    <h3>3. El Catálogo de Tipos de Datos</h3>
                    <p>Arduino necesita saber qué "tipo" de información vas a guardar para reservar el espacio correcto en memoria:</p>
                    <div class="types-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                        <div class="type-card" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                            <strong style="color: #a855f7;">int</strong> (Integer)
                            <p style="font-size: 0.85rem; color: #94a3b8;">Números enteros (ej: 13, -5, 0). Es el más usado para pines.</p>
                        </div>
                        <div class="type-card" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                            <strong style="color: #3b82f6;">float</strong> (Floating Point)
                            <p style="font-size: 0.85rem; color: #94a3b8;">Números con decimales (ej: 3.14, 25.5). Útil para sensores.</p>
                        </div>
                        <div class="type-card" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                            <strong style="color: #10b981;">bool</strong> (Boolean)
                            <p style="font-size: 0.85rem; color: #94a3b8;">Solo dos valores: true (verdadero) o false (falso).</p>
                        </div>
                        <div class="type-card" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                            <strong style="color: #f59e0b;">char</strong> (Character)
                            <p style="font-size: 0.85rem; color: #94a3b8;">Un solo carácter (ej: 'A', 'z'). Se escriben con comilla simple.</p>
                        </div>
                        <div class="type-card" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                            <strong style="color: #f97316;">long</strong> (Long Integer)
                            <p style="font-size: 0.85rem; color: #94a3b8;">Igual que 'int' pero puede guardar números de hasta 2 mil billones. Imprescindible para el tiempo de ejecución (<code>millis()</code>).</p>
                        </div>
                        <div class="type-card" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                            <strong style="color: #ec4899;">String</strong> (Text Buffer)
                            <p style="font-size: 0.85rem; color: #94a3b8;">Permite guardar palabras completas y frases. Ideal para enviar mensajes a pantallas LCD o al monitor serial.</p>
                        </div>
                    </div>
                </div>
            `,
            challenges: [
                {
                    title: 'Variables Básicas',
                    content: `
                        <h4>Reto: Parpadeo Configurable</h4>
                        <p style="margin-bottom: 1rem;">Usa una variable para controlar el tiempo que el LED permanece encendido y apagado.</p>
                        <pre style="background: rgba(15, 23, 42, 0.6); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;"><code style="color: #60a5fa;">// Definimos el pin y el tiempo
int pinLed = 13;
int pausa = 200; // ¡Cámbialo aquí fácilmente!

void setup() {
  pinMode(pinLed, OUTPUT);
}

void loop() {
  digitalWrite(pinLed, HIGH);
  delay(pausa);
  digitalWrite(pinLed, LOW);
  delay(pausa);
}</code></pre>
                    `
                },
                {
                    title: 'SOS de Emergencia',
                    content: `
                        <h4>Reto: Código Morse</h4>
                        <p style="margin-bottom: 1rem;">Usa una variable para definir la unidad de tiempo básica y crea una señal de S.O.S.</p>
                        <pre style="background: rgba(15, 23, 42, 0.6); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;"><code style="color: #60a5fa;">int led = 13;
int punto = 200;
int raya = 600;

void setup() {
  pinMode(led, OUTPUT);
}

void loop() {
  // S (...)
  digitalWrite(led, HIGH); delay(punto); digitalWrite(led, LOW); delay(punto);
  digitalWrite(led, HIGH); delay(punto); digitalWrite(led, LOW); delay(punto);
  digitalWrite(led, HIGH); delay(punto); digitalWrite(led, LOW); delay(punto);

  delay(600); // Pausa entre letras

  // O (---)
  digitalWrite(led, HIGH); delay(raya); digitalWrite(led, LOW); delay(punto);
  digitalWrite(led, HIGH); delay(raya); digitalWrite(led, LOW); delay(punto);
  digitalWrite(led, HIGH); delay(raya); digitalWrite(led, LOW); delay(punto);

  delay(600); // Pausa entre letras

  // S (...)
  digitalWrite(led, HIGH); delay(punto); digitalWrite(led, LOW); delay(punto);
  digitalWrite(led, HIGH); delay(punto); digitalWrite(led, LOW); delay(punto);
  digitalWrite(led, HIGH); delay(punto); digitalWrite(led, LOW); delay(punto);

  delay(2000); // Pausa antes de repetir el mensaje
}</code></pre>
                    `
                },
                {
                    title: 'Sirena Policial',
                    content: `
                        <h4>Reto: Patrulla en Emergencia</h4>
                        <p style="margin-bottom: 1rem;">Usa variables para alternar dos luces a una velocidad de 300ms.</p>
                        <pre style="background: rgba(15, 23, 42, 0.6); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;"><code style="color: #60a5fa;">int azul = 13;
int rojo = 12;
int espera = 300;

void setup() {
  pinMode(azul, OUTPUT);
  pinMode(rojo, OUTPUT);
}

void loop() {
  digitalWrite(azul, HIGH); digitalWrite(rojo, LOW); delay(espera);
  digitalWrite(azul, LOW); digitalWrite(rojo, HIGH); delay(espera);
}</code></pre>
                    `
                },
                {
                    title: 'Secuenciador',
                    content: `
                        <div style="text-align: center; padding: 1rem;">
                            <h4 style="color: #60a5fa; margin-bottom: 1.5rem;">🔥 Desafío: El Auto Fantástico</h4>
                            <p style="margin-bottom: 1.5rem; color: #cbd5e1;">Crea un efecto de barrido horizontal usando 5 LEDs conectados de forma consecutiva.</p>
                            
                            <div style="background: rgba(168, 85, 247, 0.05); border: 1px dashed rgba(168, 85, 247, 0.2); padding: 1.5rem; border-radius: 20px; text-align: left; margin-bottom: 2rem;">
                                <h5 style="color: #a855f7; margin-bottom: 1rem;">Misión de Ingeniería:</h5>
                                <p style="font-size: 0.9rem; color: #94a3b8; line-height: 1.6;">
                                    Programar un sistema que encienda un LED tras otro y luego regrese, creando un efecto de ida y vuelta.
                                    <br><br>
                                    <strong>Requisitos Técnicos:</strong>
                                    <ul style="margin-top: 0.5rem; padding-left: 1.2rem; color: #cbd5e1;">
                                        <li>Pines: <code>p1 = 12, p2 = 11, p3 = 10, p4 = 9, p5 = 8</code>.</li>
                                        <li>Variable de tiempo: <code>int vel = 200;</code>.</li>
                                        <li>Pista: ¡Debes encender uno y apagar el anterior!</li>
                                    </ul>
                                </p>
                            </div>
                            
                            <a href="https://www.tinkercad.com/dashboard" target="_blank" style="background: #ef4444; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 800; display: inline-block;">
                                Abrir Tinkercad
                            </a>
                        </div>
                    `
                },
                {
                    title: 'Semáforo',
                    content: `
                        <div style="text-align: center; padding: 1rem;">
                            <h4 style="color: #60a5fa; margin-bottom: 1.5rem;">🚨 Desafío Maestro: El Cruce Maestro</h4>
                            <p style="margin-bottom: 1.5rem; color: #cbd5e1;">Crea un semáforo vehicular completo usando variables para cada color y tiempo.</p>
                            
                            <div style="background: rgba(255, 255, 255, 0.03); border: 1px dashed rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 20px; text-align: left; margin-bottom: 2rem;">
                                <h5 style="color: white; margin-bottom: 1rem;">Especificaciones del Sistema:</h5>
                                <p style="font-size: 0.9rem; color: #94a3b8; line-height: 1.6;">
                                    Debes programar la secuencia oficial de tráfico usando variables para optimizar tu código.
                                    <br><br>
                                    <strong>Plan de Trabajo:</strong>
                                    <ul style="margin-top: 0.5rem; padding-left: 1.2rem; color: #cbd5e1;">
                                        <li>Usa 3 variables <code>int</code> para los pines (12, 11, 10).</li>
                                        <li>Usa variables <code>long</code> para los tiempos de espera largos.</li>
                                        <li>Secuencia: Rojo -> Rojo+Amarillo -> Verde -> Amarillo.</li>
                                    </ul>
                                </p>
                            </div>
                            
                            <a href="https://www.tinkercad.com/dashboard" target="_blank" style="background: #ef4444; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 800; display: inline-block;">
                                Ir a Tinkercad
                            </a>
                        </div>
                    `
                }
            ],
            flashcards: [
                { id: 'l2-f1', type: 'code', q: '¿Qué tipo de dato usarías para un contador de 0 a 100?', a: 'int', sub: 'Para números enteros' },
                { id: 'l2-f2', type: 'code', q: '¿Qué tipo de dato usarías para el tiempo en milisegundos?', a: 'long', sub: 'Para valores de tiempo largos' },
                { id: 'l2-f3', type: 'code', q: '¿Cuál es el valor inicial de "espera" en la Patrulla?', a: '300', sub: 'Pausa de 300ms entre luces' },
                { id: 'l2-f4', type: 'code', q: '¿Cómo se llama el efecto del Reto 4?', a: 'Auto Fantástico', sub: 'Barrido secuencial de 5 LEDs' },
                { id: 'l2-f5', type: 'code', q: '¿Qué variable controla la velocidad del barrido?', a: 'int vel = 200;', sub: 'Define la pausa en el secuenciador' },
                { id: 'l2-f6', type: 'code', q: '¿Qué tipo de dato guarda una sola letra?', a: 'char', sub: 'Character' },
                { id: 'l2-f7', type: 'code', q: '¿Es "2_led" un nombre de variable válido?', a: 'No', sub: 'No pueden empezar con números' },
                { id: 'l2-f8', type: 'code', q: '¿Qué función configuramos en el setup?', a: 'pinMode()', sub: 'Define si es INPUT u OUTPUT' },
                { id: 'l2-f9', type: 'code', q: '¿Para qué sirve el punto y coma (;)?', a: 'Terminar línea', sub: 'Indica el fin de una instrucción' },
                { id: 'l2-f10', type: 'code', q: '¿Cómo comentas una sola línea de código?', a: '// Comentario', sub: 'Usa doble barra inclinada' },
                { id: 'l2-f11', type: 'code', q: '¿Qué tipo de dato es 24.5?', a: 'float', sub: 'Para números con decimales' },
                { id: 'l2-f12', type: 'code', q: '¿Cómo defines un pin como salida?', a: 'OUTPUT', sub: 'Modo de trabajo del pin' }
            ],
            questions: [
                {
                    q: "¿Qué tipo de dato elegirías para leer un sensor de humedad que da valores como 45.82%?",
                    options: ["int", "char", "float", "bool"],
                    correct: 2
                },
                {
                    q: "Si declaras 'int pin = 13;', ¿cómo invocas ese pin en pinMode?",
                    options: ["pinMode(13, OUTPUT)", "pinMode(pin, OUTPUT)", "Ambas son correctas", "No se puede usar variables en pinMode"],
                    correct: 2
                },
                {
                    q: "¿Qué tipo de dato ocupa menos memoria pero solo tiene dos estados?",
                    options: ["long", "String", "bool", "float"],
                    correct: 2
                },
                {
                    q: "¿Qué sucede si intentas guardar '3.14' en una variable de tipo 'int'?",
                    options: ["Da error de compilación", "Se guarda como 3 (se trunca)", "Se redondea a 4", "El Arduino explota"],
                    correct: 1
                },
                {
                    q: "¿Cuál es el beneficio principal de declarar los pines al inicio del código?",
                    options: ["Hace que el Arduino vaya más rápido", "Facilita cambiar las conexiones físicas después", "Es obligatorio por ley", "No tiene beneficio"],
                    correct: 1
                }
            ]
        }
    }
};

const ArduinoSimulator = () => {
    const [isOn, setIsOn] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsOn(prev => !prev);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const pcbStyles = {
        teal: '#008184',
        metal: 'linear-gradient(180deg, #e5e7eb 0%, #bdc3c7 50%, #95a5a6 100%)',
    };

    return (
        <div className="arduino-simulator-wrapper" style={{ flex: 1.2, minWidth: '320px', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="arduino-pcb-final" style={{
                backgroundColor: pcbStyles.teal, width: '310px', height: '230px', borderRadius: '4px', position: 'relative',
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                clipPath: 'polygon(0% 10px, 10px 0%, 98% 0%, 100% 2%, 100% 98%, 98% 100%, 2% 100%, 0% 98%, 0% 75%, 5px 72%, 5px 35%, 0% 32%)'
            }}>
                <div style={{ position: 'absolute', top: '10px', left: '10px', width: '24px', height: '24px', background: '#bdc3c7', borderRadius: '2px', display: 'flex', zIndex: 10 }}>
                    <div style={{ width: '14px', height: '14px', margin: 'auto', background: 'radial-gradient(circle, #e74c3c, #c0392b)', borderRadius: '50%' }}></div>
                </div>
                <div style={{ position: 'absolute', left: '0px', top: '40px', width: '50px', height: '45px', background: pcbStyles.metal, borderRadius: '1px', border: '1px solid #7f8c8d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '25px', height: '30px', background: '#1a1a1a', borderRadius: '1px' }}></div>
                </div>
                <div style={{ position: 'absolute', left: '0px', bottom: '25px', width: '55px', height: '40px', background: 'linear-gradient(180deg, #111 0%, #333 50%, #000 100%)', borderRadius: '2px' }}></div>
                <div style={{ position: 'absolute', top: '5px', right: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ background: '#1a1a1a', display: 'flex', padding: '1px', gap: '1px' }}>
                            {[...Array(10)].map((_, i) => <div key={i} style={{ width: '7px', height: '9px', background: '#000', border: '1px solid #333' }}></div>)}
                        </div>
                        <div style={{ background: '#1a1a1a', display: 'flex', padding: '1px', gap: '1px' }}>
                            {[...Array(8)].map((_, i) => <div key={i} style={{ width: '7px', height: '9px', background: '#000', border: '1px solid #333' }}></div>)}
                        </div>
                    </div>
                </div>
                <div style={{ position: 'absolute', bottom: '75px', right: '35px', width: '160px', height: '35px', background: '#1a1a1a', borderRadius: '1px', boxShadow: '0 10px 20px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6px', color: 'rgba(255,255,255,0.1)', fontFamily: 'monospace' }}>
                    ATMEGA328P-PU
                </div>
                <div style={{ position: 'absolute', top: '80px', right: '110px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '7px', height: '6px', background: isOn ? '#fbbf24' : '#333', boxShadow: isOn ? '0 0 12px #fbbf24' : 'none', transition: 'all 0.1s' }}></div>
                    <span style={{ fontSize: '6px', color: 'white', fontWeight: 900 }}>L</span>
                </div>
                <div style={{ position: 'absolute', top: '100px', right: '110px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '7px', height: '6px', background: '#2ecc71', boxShadow: '0 0 6px #2ecc71' }}></div>
                    <span style={{ fontSize: '6px', color: 'white', fontWeight: 900 }}>ON</span>
                </div>
            </div>
        </div>
    );
};

const ReviewSection = ({ user, lessonKey, flashcards = [] }) => {
    const [flipped, setFlipped] = useState({});
    const [mastered, setMastered] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && lessonKey) {
            loadProgress();
        }
    }, [user, lessonKey]);

    const loadProgress = async () => {
        try {
            setLoading(true);
            const { data } = await supabase
                .from('student_flashcards')
                .select('card_id, status')
                .eq('user_id', user.id)
                .eq('lesson_id', lessonKey);
            
            if (data) {
                const progress = {};
                data.forEach(item => {
                    progress[item.card_id] = item.status;
                });
                setMastered(progress);
            }
        } catch (err) {
            console.error("Error loading progress:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFlip = (id) => {
        setFlipped(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleMark = async (e, id, status) => {
        e.stopPropagation();
        setMastered(prev => ({ ...prev, [id]: status }));
        if (user && lessonKey) {
            try {
                await supabase.from('student_flashcards').upsert({
                    user_id: user.id,
                    lesson_id: lessonKey,
                    card_id: id,
                    status: status,
                    updated_at: new Date()
                }, { onConflict: 'user_id, lesson_id, card_id' });
            } catch (err) {
                console.error("Error saving progress:", err);
            }
        }
        setTimeout(() => setFlipped(prev => ({ ...prev, [id]: false })), 800);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: '#a855f7' }}><RefreshCw className="animate-spin" size={32} /></div>;

    return (
        <div className="review-section-interactive" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', padding: '1rem' }}>
                {flashcards.map(card => {
                    const status = mastered[card.id];
                    let accentColor = card.type === 'hw' ? '#a855f7' : '#60a5fa';
                    let cardBg = 'rgba(30, 41, 59, 0.6)';
                    let glow = 'none';
                    
                    if (status === 'known') {
                        accentColor = '#10b981';
                        cardBg = 'rgba(16, 185, 129, 0.15)';
                        glow = '0 0 20px rgba(16, 185, 129, 0.2)';
                    } else if (status === 'unknown') {
                        accentColor = '#ef4444';
                        cardBg = 'rgba(239, 68, 68, 0.15)';
                        glow = '0 0 20px rgba(239, 68, 68, 0.2)';
                    }

                    return (
                        <div 
                            key={card.id} 
                            className={`memory-card ${flipped[card.id] ? 'is-flipped' : ''}`} 
                            onClick={() => toggleFlip(card.id)}
                            style={{ height: '230px', perspective: '1000px', cursor: 'pointer' }}
                        >
                            <div className="card-inner" style={{ 
                                position: 'relative', 
                                width: '100%', 
                                height: '100%', 
                                transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)', 
                                transformStyle: 'preserve-3d'
                            }}>
                                <div className="card-front" style={{ 
                                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', 
                                    background: cardBg, border: `2px solid ${accentColor}`, borderRadius: '24px', 
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                                    padding: '2rem', textAlign: 'center', boxShadow: glow, backdropFilter: 'blur(10px)',
                                    transition: 'all 0.4s ease'
                                }}>
                                    <div style={{ 
                                        background: `${accentColor}15`, 
                                        padding: '14px', borderRadius: '18px', marginBottom: '16px',
                                        border: `1px solid ${accentColor}30`,
                                        transition: 'all 0.4s ease'
                                    }}>
                                        {card.type === 'hw' ? <PenTool size={26} color={accentColor} /> : <Code size={26} color={accentColor} />}
                                    </div>
                                    <span style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.4 }}>{card.q}</span>
                                    <div style={{ marginTop: '1.25rem', fontSize: '0.65rem', color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8 }}>Toca para ver respuesta</div>
                                </div>
                                <div className="card-back" style={{ 
                                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', 
                                    background: 'rgba(15, 23, 42, 0.98)', border: `3px solid ${accentColor}`, borderRadius: '24px', 
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                                    padding: '2rem', textAlign: 'center', transform: 'rotateY(180deg)', 
                                    boxShadow: `0 20px 40px rgba(0,0,0,0.5), ${glow}`, transition: 'all 0.4s ease'
                                }}>
                                    <span style={{ 
                                        color: accentColor, fontWeight: 900, fontSize: '1.5rem', marginBottom: '14px', 
                                        textShadow: `0 0 20px ${accentColor}60`, letterSpacing: '0.5px' 
                                    }}>{card.a}</span>
                                    <p style={{ color: '#cbd5e1', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.6, fontWeight: 500 }}>{card.sub}</p>
                                    <div style={{ display: 'flex', gap: '14px' }}>
                                        <button 
                                            onClick={(e) => handleMark(e, card.id, 'known')} 
                                            style={{ width: '44px', height: '44px', borderRadius: '14px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 5px 15px rgba(16, 185, 129, 0.3)' }} 
                                            onMouseOver={e => { e.currentTarget.style.transform='scale(1.1)'; e.currentTarget.style.filter='brightness(1.1)'; }} 
                                            onMouseOut={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.filter='brightness(1)'; }}
                                        ><Check size={22} strokeWidth={4} /></button>
                                        <button 
                                            onClick={(e) => handleMark(e, card.id, 'unknown')} 
                                            style={{ width: '44px', height: '44px', borderRadius: '14px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 5px 15px rgba(239, 68, 68, 0.3)' }} 
                                            onMouseOver={e => { e.currentTarget.style.transform='scale(1.1)'; e.currentTarget.style.filter='brightness(1.1)'; }} 
                                            onMouseOut={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.filter='brightness(1)'; }}
                                        ><X size={22} strokeWidth={4} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const MiniChallengeSimulator = ({ challengeIdx, onClose }) => {
    const [leds, setLeds] = useState({ 
        r: false, y: false, g: false, blue: false, 
        s1: false, s2: false, s3: false, s4: false, s5: false 
    });
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        let isActive = true;
        let currentTimeout;

        const wait = (ms) => new Promise(res => {
            currentTimeout = setTimeout(res, ms);
        });

        const waitWithCountdown = async (seconds) => {
            for (let i = seconds; i > 0; i--) {
                if (!isActive) return;
                setTimeLeft(i);
                await wait(1000);
            }
        };

        const runSequence = async () => {
            while (isActive) {
                if (challengeIdx === 0) {
                    setLeds({ r: true, y: false, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false });
                    await wait(200);
                    if (!isActive) break;
                    setLeds({ r: false, y: false, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false });
                    await wait(200);
                } else if (challengeIdx === 1) {
                    const deat = { r: false, y: false, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false };
                    const punto = 200, raya = 600;
                    for(let i=0; i<3; i++) {
                        setLeds({...deat, r: true}); await wait(punto); if(!isActive) break;
                        setLeds(deat); await wait(punto); if(!isActive) break;
                    }
                    if(!isActive) break;
                    await wait(600);
                    for(let i=0; i<3; i++) {
                        setLeds({...deat, r: true}); await wait(raya); if(!isActive) break;
                        setLeds(deat); await wait(punto); if(!isActive) break;
                    }
                    if(!isActive) break;
                    await wait(600);
                    for(let i=0; i<3; i++) {
                        setLeds({...deat, r: true}); await wait(punto); if(!isActive) break;
                        setLeds(deat); await wait(punto); if(!isActive) break;
                    }
                    if(!isActive) break;
                    await wait(2000);
                } else if (challengeIdx === 2) {
                    // Sirena Policial (Rojo / Azul) corregido
                    setLeds({ r: true, y: false, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false });
                    await wait(300);
                    if (!isActive) break;
                    setLeds({ r: false, y: false, g: false, blue: true, s1: false, s2: false, s3: false, s4: false, s5: false });
                    await wait(300);
                } else if (challengeIdx === 3) {
                    // Secuenciador (Barrido horizontal de 5 luces) a 200ms
                    const pins = ['s1', 's2', 's3', 's4', 's5'];
                    for (let p of pins) {
                        const state = { r: false, y: false, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false };
                        state[p] = true;
                        setLeds(state);
                        await wait(200);
                        if (!isActive) break;
                    }
                    for (let i = 3; i >= 1; i--) {
                        const state = { r: false, y: false, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false };
                        state[`s${i+1}`] = true;
                        setLeds(state);
                        await wait(200);
                        if (!isActive) break;
                    }
                } else if (challengeIdx === 4) {
                    // Semáforo de Tráfico
                    setLeds({ r: true, y: false, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false });
                    await wait(2000);
                    if (!isActive) break;
                    setLeds({ r: true, y: true, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false });
                    await wait(1000);
                    if (!isActive) break;
                    setLeds({ r: false, y: false, g: true, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false });
                    await wait(3000);
                    if (!isActive) break;
                    setLeds({ r: false, y: true, g: false, blue: false, s1: false, s2: false, s3: false, s4: false, s5: false });
                    await wait(1000);
                }
                if (!isActive) break;
            }
        };

        runSequence();
        return () => {
            isActive = false;
            clearTimeout(currentTimeout);
        };
    }, [challengeIdx]);

    const LedBulb = ({ color, isOn, glowColor }) => (
        <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            opacity: isOn ? 1 : 0.15,
            background: color,
            boxShadow: isOn ? `0 0 25px 8px ${glowColor}` : 'inset 0 0 10px rgba(0,0,0,0.5)',
            border: '2px solid rgba(255,255,255,0.1)',
            transition: 'all 0.1s ease-in-out',
            margin: '0 auto'
        }}></div>
    );

    return (
        <div 
            style={{
                position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={onClose}
        >
            <div style={{
                background: 'rgba(30, 41, 59, 0.98)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                padding: '2.5rem 2rem 2rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '90%',
                maxWidth: '380px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>
                
                <button 
                    onClick={onClose}
                    style={{ position: 'absolute', right: '1.2rem', top: '1.2rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <X size={18} />
                </button>

                <h4 style={{ color: '#cbd5e1', fontSize: '1rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>
                    Simulador del Reto
                </h4>
                
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    minHeight: challengeIdx === 4 ? '220px' : '150px'
                }}>
                    {challengeIdx === 2 ? (
                        <div style={{ 
                            background: 'linear-gradient(90deg, #111, #222)', 
                            padding: '24px 32px', 
                            borderRadius: '16px',
                            border: '3px solid #333',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.8), inset 0 0 15px rgba(0,0,0,0.9)',
                            display: 'flex', 
                            gap: '24px' 
                        }}>
                            <LedBulb color="#3b82f6" glowColor="#3b82f6" isOn={leds.blue} />
                            <LedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.r} />
                        </div>
                    ) : challengeIdx === 3 ? (
                        <div style={{ 
                            background: '#111', 
                            padding: '16px 24px', 
                            borderRadius: '16px',
                            border: '3px solid #333',
                            display: 'flex', 
                            gap: '12px' 
                        }}>
                            <LedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.s1} />
                            <LedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.s2} />
                            <LedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.s3} />
                            <LedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.s4} />
                            <LedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.s5} />
                        </div>
                    ) : challengeIdx === 4 ? (
                        <div style={{ 
                            background: 'linear-gradient(180deg, #111, #222)', 
                            padding: '24px', 
                            borderRadius: '24px',
                            border: '3px solid #333',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.8), inset 0 0 15px rgba(0,0,0,0.9)',
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '16px' 
                        }}>
                            <LedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.r} />
                            <LedBulb color="#facc15" glowColor="#facc15" isOn={leds.y} />
                            <LedBulb color="#10b981" glowColor="#10b981" isOn={leds.g} />
                        </div>
                    ) : (
                        <div style={{
                            background: '#0f172a',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.5)',
                        }}>
                            <LedBulb color="#ef4444" glowColor="#ef4444" isOn={leds.r} />
                        </div>
                    )}
                </div>
                
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '1.5rem', textAlign: 'center', fontWeight: 600 }}>
                    {challengeIdx === 0 && 'Parpadeo constante configurado a 200ms'}
                    {challengeIdx === 1 && 'Ciclo S.O.S reproduciendo (... --- ...)'}
                    {challengeIdx === 2 && 'Modo Persecución: Alternando Azul/Rojo'}
                    {challengeIdx === 3 && 'Modo Secuenciador: Barrido de 5 luces'}
                    {challengeIdx === 4 && 'Reto Maestro: Programación de Tráfico'}
                </p>
            </div>
        </div>
    );
};

const Lesson = () => {
    const { user } = useAuth();
    const { courseId, moduleId, lessonId } = useParams();
    const navigate = useNavigate();
    
    const numericCourseId = parseInt(courseId);
    const lessonKey = `${moduleId}-${lessonId}`;
    const lesson = lessonsData[numericCourseId]?.[lessonKey] || {
        title: 'Lección',
        content: '<p>Contenido de la lección...</p>',
        flashcards: [],
        questions: []
    };

    const [activeTab, setActiveTab] = useState('contenido');
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showGuide, setShowGuide] = useState(false);
    const [quizMode, setQuizMode] = useState('intro');
    const [currentQ, setCurrentQ] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [quizScore, setQuizScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [activeChallenge, setActiveChallenge] = useState(0);
    const [showSimulator, setShowSimulator] = useState(false);
    const timerRef = useRef(null);

    const quizQuestions = lesson.questions || [];
    const subject = subjectData[numericCourseId] || subjectData[5];

    const tabs = [
        { id: 'contenido', label: 'Contenido', icon: <FileText size={18} /> },
        { id: 'repaso', label: 'Repaso', icon: <PenTool size={18} /> },
        { id: 'simulador', label: 'Simulador', icon: <Layout size={18} /> },
        { id: 'prueba', label: 'Evaluación', icon: <Award size={18} /> }
    ];

    const startQuiz = () => {
        setQuizMode('question');
        setCurrentQ(0);
        setQuizScore(0);
        setTimeLeft(30);
        setSelectedAnswer(null);
    };

    const handleQuizAnswer = (optionIndex) => {
        if (selectedAnswer !== null) return;
        
        setSelectedAnswer(optionIndex);
        
        if (optionIndex !== -1 && optionIndex === quizQuestions[currentQ].correct) {
            setQuizScore(prev => prev + 1);
        }

        setTimeout(() => {
            if (currentQ < quizQuestions.length - 1) {
                setCurrentQ(prev => prev + 1);
                setTimeLeft(30);
                setSelectedAnswer(null);
            } else {
                setQuizMode('result');
            }
        }, 1500);
    };

    useEffect(() => {
        if (quizMode === 'question' && timeLeft > 0 && selectedAnswer === null) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (quizMode === 'question' && timeLeft === 0 && selectedAnswer === null) {
            setSelectedAnswer(-1);
            setTimeout(() => {
                if (currentQ < quizQuestions.length - 1) {
                    setCurrentQ(prev => prev + 1);
                    setTimeLeft(30);
                    setSelectedAnswer(null);
                } else {
                    setQuizMode('result');
                }
            }, 1500);
        }
        return () => clearTimeout(timerRef.current);
    }, [timeLeft, quizMode, currentQ, selectedAnswer]);

    const handleScroll = () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        window.dispatchShowGuide = () => setShowGuide(true);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            delete window.dispatchShowGuide;
        };
    }, []);


    const GuideModal = () => {
        if (!showGuide) return null;
        
        const colors = [
            { name: 'Negro', v12: 0, mult: 'x1 Ω', tol: '-', color: '#000000' },
            { name: 'Marrón', v12: 1, mult: 'x10 Ω', tol: '±1%', color: '#92400f' },
            { name: 'Rojo', v12: 2, mult: 'x100 Ω', tol: '±2%', color: '#ef4444' },
            { name: 'Naranja', v12: 3, mult: 'x1k Ω', tol: '-', color: '#f59e0b' },
            { name: 'Amarillo', v12: 4, mult: 'x10k Ω', tol: '-', color: '#facc15' },
            { name: 'Verde', v12: 5, mult: 'x100k Ω', tol: '±0.5%', color: '#22c55e' },
            { name: 'Azul', v12: 6, mult: 'x1M Ω', tol: '±0.25%', color: '#3b82f6' },
            { name: 'Violeta', v12: 7, mult: 'x10M Ω', tol: '±0.1%', color: '#a855f7' },
            { name: 'Gris', v12: 8, mult: '-', tol: '±0.05%', color: '#64748b' },
            { name: 'Blanco', v12: 9, mult: '-', tol: '-', color: '#ffffff' },
            { name: 'Oro', v12: '-', mult: 'x0.1 Ω', tol: '±5%', color: '#fbbf24' },
            { name: 'Plata', v12: '-', mult: 'x0.01 Ω', tol: '±10%', color: '#94a3b8' },
        ];

        return (
            <div 
                style={{
                    position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeIn 0.3s ease-out'
                }}
                onClick={() => setShowGuide(false)}
            >
                <div 
                    style={{
                        background: 'rgba(30, 41, 59, 0.98)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px', width: '90%', maxWidth: '520px', padding: '1.25rem', position: 'relative',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <button onClick={() => setShowGuide(false)} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}>
                        <X size={16} />
                    </button>
                    
                    <header style={{ marginBottom: '1rem' }}>
                        <h2 style={{ color: '#f97316', fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Search size={22} />
                            Guía de Colores (4 Bandas)
                        </h2>
                    </header>

                    <div style={{ overflowX: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px' }}>
                            <thead>
                                <tr style={{ color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    <th style={{ padding: '0.25rem 0.75rem', textAlign: 'left' }}>Color</th>
                                    <th style={{ padding: '0.25rem 0.75rem', textAlign: 'center' }}>B 1/2</th>
                                    <th style={{ padding: '0.25rem 0.75rem', textAlign: 'center' }}>Mult.</th>
                                    <th style={{ padding: '0.25rem 0.75rem', textAlign: 'right' }}>Tol.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {colors.map(c => (
                                    <tr key={c.name} style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <td style={{ padding: '0.4rem 0.75rem', borderRadius: '8px 0 0 8px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: c.color, border: '1px solid rgba(255,255,255,0.1)' }}></div>
                                            <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.8rem' }}>{c.name}</span>
                                        </td>
                                        <td style={{ padding: '0.4rem 0.75rem', textAlign: 'center', color: '#cbd5e1', fontWeight: 600, fontSize: '0.8rem' }}>{c.v12}</td>
                                        <td style={{ padding: '0.4rem 0.75rem', textAlign: 'center', color: '#f97316', fontWeight: 700, fontSize: '0.8rem' }}>{c.mult}</td>
                                        <td style={{ padding: '0.4rem 0.75rem', borderRadius: '0 8px 8px 0', textAlign: 'right', color: c.tol !== '-' ? '#10b981' : '#64748b', fontWeight: 800, fontSize: '0.8rem' }}>{c.tol}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="lesson-view-container animate-fade-in">
            <GuideModal />
            {/* Scroll Progress Bar */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: `${scrollProgress}%`,
                height: '3px',
                background: `linear-gradient(to right, ${subject.color}, #ffffff)`,
                zIndex: 2000,
                transition: 'width 0.1s ease-out',
                boxShadow: `0 0 10px ${subject.color}`
            }} />

            {/* Premium Lesson Header */}
            <header className="lesson-header-premium">
                <div className="lesson-header-bg-icon">
                    {subject.icon}
                </div>

                <div className="lesson-header-main">
                    <div className="lesson-header-info">
                        <div className="lesson-breadcrumb">
                            <span>{subject.name}</span>
                            <ChevronRight size={12} className="breadcrumb-sep" />
                            <span>Módulo 1</span>
                            <ChevronRight size={12} className="breadcrumb-sep" />
                            <span style={{ color: subject.color }}>Lección {lessonId.replace('l', '')}</span>
                        </div>
                        <h1>{lesson.title}</h1>
                    </div>

                    <Link to={`/dashboard/subject/${courseId}`} className="btn-back-course">
                        <ArrowLeft size={18} />
                        <span>Volver al curso</span>
                    </Link>
                </div>
            </header>

            {/* Premium Tabs System */}
            <nav className="lesson-tabs-wrapper">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`lesson-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                            <div className="active-tab-indicator" style={{ background: subject.color }} />
                        )}
                    </button>
                ))}
            </nav>

            {/* Content Area */}
            <main className="lesson-content-card glass-panel">
                <article className="content-body">
                    {activeTab === 'repaso' ? (
                        <ReviewSection user={user} lessonKey={lessonKey} flashcards={lesson.flashcards} />
                    ) : activeTab === 'prueba' ? (
                        <div className="quiz-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                            {quizMode === 'intro' && (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '2rem', 
                                    background: 'rgba(255,255,255,0.03)', 
                                    borderRadius: '24px', 
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Decorative Background Icon */}
                                    {subject?.icon && (
                                        <div style={{ 
                                            position: 'absolute', 
                                            right: '-2rem', 
                                            top: '50%', 
                                            transform: 'translateY(-50%) rotate(-15deg)',
                                            opacity: 0.05,
                                            color: subject.color,
                                            pointerEvents: 'none'
                                        }}>
                                            {React.isValidElement(subject.icon) ? React.cloneElement(subject.icon, { size: 220 }) : null}
                                        </div>
                                    )}

                                    <h3 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem', position: 'relative', zIndex: 1 }}>
                                        Prueba: Lección {lessonId.replace('l', '')}
                                    </h3>
                                    <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.5, marginBottom: '1.75rem', maxWidth: '550px', position: 'relative', zIndex: 1 }}>
                                        Demuestra lo que has aprendido en esta lección. Completa este reto para validar tus conocimientos y desbloquear el siguiente nivel.
                                    </p>
                                    <ul style={{ textAlign: 'left', color: '#cbd5e1', marginBottom: '2rem', display: 'inline-block', listStyle: 'none', padding: 0, position: 'relative', zIndex: 1 }}>
                                        <li style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                                            10 preguntas de opción múltiple
                                        </li>
                                        <li style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: subject.color }}></div>
                                            30 segundos por pregunta
                                        </li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
                                            Necesitas 100% de aciertos para avanzar
                                        </li>
                                    </ul>
                                    <button 
                                        onClick={startQuiz}
                                        className="nav-btn nav-btn-complete"
                                        style={{ background: subject.color, border: 'none', color: 'white', padding: '0.85rem 2.5rem', fontSize: '1.1rem', fontWeight: 700, boxShadow: `0 8px 15px ${subject.color}30`, margin: '0', position: 'relative', zIndex: 1 }}
                                    >
                                        Iniciar Evaluación
                                    </button>
                                </div>
                            )}

                            {quizMode === 'question' && (
                                <div style={{ 
                                    animation: 'fadeIn 0.5s ease-out',
                                    position: 'relative',
                                    padding: '1rem',
                                    borderRadius: '24px',
                                    overflow: 'hidden'
                                }}>
                                    {/* Time's Up Overlay */}
                                    {selectedAnswer === -1 && (
                                        <div className="animate-scale-in" style={{ 
                                            position: 'absolute', 
                                            inset: 0, 
                                            zIndex: 20, 
                                            background: 'rgba(15, 23, 42, 0.9)', 
                                            backdropFilter: 'blur(8px)', 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center', 
                                            justifyContent: 'center'
                                        }}>
                                            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                                                <X size={80} color="#ef4444" strokeWidth={3} />
                                            </div>
                                            <span style={{ color: 'white', fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>
                                                ¡Tiempo Agotado!
                                            </span>
                                        </div>
                                    )}

                                    {/* Decorative Background Icon */}
                                    {subject?.icon && (
                                        <div style={{ 
                                            position: 'absolute', 
                                            right: '-2rem', 
                                            top: '50%', 
                                            transform: 'translateY(-50%) rotate(-15deg)',
                                            opacity: 0.03,
                                            color: subject.color,
                                            pointerEvents: 'none'
                                        }}>
                                            {React.isValidElement(subject.icon) ? React.cloneElement(subject.icon, { size: 280 }) : null}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>
                                            Pregunta {currentQ + 1} de {quizQuestions.length}
                                        </span>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '8px', 
                                            color: timeLeft > 20 ? '#10b981' : timeLeft > 10 ? '#f59e0b' : '#ef4444', 
                                            fontWeight: 700, 
                                            fontSize: '1.2rem',
                                            position: 'relative',
                                            zIndex: 2,
                                            transition: 'color 0.3s ease'
                                        }}>
                                            <Clock size={22} />
                                            {timeLeft}s
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '3px', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
                                        {[...Array(30)].map((_, i) => (
                                            <div 
                                                key={i} 
                                                style={{ 
                                                    flex: 1, 
                                                    height: '8px',
                                                    background: i < timeLeft 
                                                        ? (timeLeft > 20 ? '#10b981' : timeLeft > 10 ? '#f59e0b' : '#ef4444') 
                                                        : 'rgba(255,255,255,0.1)',
                                                    borderRadius: '2px',
                                                    transition: 'all 0.3s ease'
                                                }} 
                                            />
                                        ))}
                                    </div>

                                    <h3 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 700, marginBottom: '2rem', lineHeight: 1.5 }}>
                                        {quizQuestions[currentQ].q}
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {quizQuestions[currentQ].options.map((option, optIdx) => {
                                            const isSelected = selectedAnswer === optIdx;
                                            const isCorrect = quizQuestions[currentQ].correct === optIdx;
                                            let bg = 'rgba(30, 41, 59, 0.4)';
                                            let border = '1px solid rgba(255,255,255,0.08)';
                                            
                                            if (selectedAnswer !== null && isSelected) {
                                                if (isCorrect) {
                                                    bg = 'rgba(16, 185, 129, 0.2)';
                                                    border = '2px solid #10b981';
                                                } else {
                                                    bg = 'rgba(239, 68, 68, 0.2)';
                                                    border = '2px solid #ef4444';
                                                }
                                            }

                                            return (
                                                <button
                                                    key={optIdx}
                                                    onClick={() => handleQuizAnswer(optIdx)}
                                                    disabled={selectedAnswer !== null}
                                                    style={{
                                                        padding: '1.25rem 1.5rem',
                                                        background: bg,
                                                        border: border,
                                                        borderRadius: '16px',
                                                        textAlign: 'left',
                                                        cursor: selectedAnswer !== null ? 'default' : 'pointer',
                                                        transition: 'all 0.3s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        color: 'white',
                                                        fontSize: '1.05rem',
                                                        fontWeight: 500,
                                                        position: 'relative',
                                                        zIndex: 2
                                                    }}
                                                >
                                                    <span>{option}</span>
                                                    {selectedAnswer !== null && isSelected && isCorrect && <Check size={20} color="#10b981" />}
                                                    {selectedAnswer !== null && isSelected && !isCorrect && <X size={20} color="#ef4444" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {quizMode === 'result' && (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '2rem', 
                                    background: 'rgba(255,255,255,0.03)', 
                                    borderRadius: '24px', 
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Decorative Background Icon */}
                                    {subject?.icon && (
                                        <div style={{ 
                                            position: 'absolute', 
                                            right: '-2rem', 
                                            top: '50%', 
                                            transform: 'translateY(-50%) rotate(-15deg)',
                                            opacity: 0.05,
                                            color: quizScore === quizQuestions.length ? '#10b981' : '#ef4444',
                                            pointerEvents: 'none'
                                        }}>
                                            {React.isValidElement(subject.icon) ? React.cloneElement(subject.icon, { size: 240 }) : null}
                                        </div>
                                    )}

                                    <div style={{ position: 'relative', zIndex: 1, marginBottom: '1.5rem' }}>
                                        {quizScore === quizQuestions.length ? <Trophy size={60} color="#10b981" /> : <AlertCircle size={60} color="#ef4444" />}
                                    </div>
                                    
                                    <h3 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', position: 'relative', zIndex: 1 }}>
                                        {quizScore === quizQuestions.length ? '¡Increíble! Dominio Total' : 'Sigue Practicando'}
                                    </h3>
                                    
                                    <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '2rem', maxWidth: '500px', position: 'relative', zIndex: 1 }}>
                                        {quizScore === quizQuestions.length 
                                            ? 'Has superado el reto con éxito. Has demostrado un dominio absoluto de los temas de esta lección.' 
                                            : `Has acertado ${quizScore} de ${quizQuestions.length}. Para avanzar a la siguiente lección debes obtener el 100% de aciertos.`}
                                    </p>

                                    <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                                        <button 
                                            onClick={() => setQuizMode('intro')}
                                            className="nav-btn nav-btn-prev"
                                            style={{ margin: 0, padding: '0.75rem 1.5rem' }}
                                        >
                                            Repetir Evaluación
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('contenido')}
                                            className="nav-btn nav-btn-complete"
                                            style={{ background: subject.color, border: 'none', color: 'white', margin: 0, padding: '0.75rem 1.5rem' }}
                                        >
                                            Volver al contenido
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'contenido' ? (
                        <div className="lesson-content-container">
                            <div className="theory-section-main" dangerouslySetInnerHTML={{ __html: lesson.content }} />
                            
                            {lesson.challenges && (
                                <div className="challenges-tabs-section" style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ background: subject.color, padding: '8px', borderRadius: '10px' }}>
                                            <Code size={20} color="white" />
                                        </div>
                                        <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Retos de Programación</h3>
                                    </div>
                                    
                                    <div className="challenges-nav" style={{ 
                                        display: 'flex', 
                                        gap: '4px', 
                                        alignItems: 'flex-end',
                                        marginBottom: '-1px',
                                        padding: '0 4px 0 24px', // 24px padding-left added
                                        position: 'relative',
                                        zIndex: 2
                                    }}>
                                        {lesson.challenges.map((c, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => setActiveChallenge(idx)}
                                                style={{
                                                    padding: '12px 24px',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    borderBottom: activeChallenge === idx ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                                    background: activeChallenge === idx ? 'rgba(30, 41, 59, 0.4)' : 'rgba(15, 23, 42, 0.4)',
                                                    color: activeChallenge === idx ? 'white' : '#64748b',
                                                    fontWeight: 700,
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '12px',
                                                    minWidth: '180px',
                                                    borderRadius: '12px 12px 0 0',
                                                    boxShadow: activeChallenge === idx ? '0 -10px 20px rgba(0,0,0,0.2)' : 'none',
                                                    position: 'relative'
                                                }}
                                            >
                                                <div style={{ 
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '6px',
                                                    background: activeChallenge === idx ? subject.color : 'rgba(255,255,255,0.05)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem',
                                                    color: activeChallenge === idx ? 'white' : '#94a3b8',
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    {idx + 1}
                                                </div>
                                                <span style={{ transition: 'all 0.3s ease' }}>{c.title}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div 
                                        className="challenge-display-area animate-fade-in" 
                                        key={activeChallenge}
                                        style={{
                                            background: 'rgba(30, 41, 59, 0.4)',
                                            borderRadius: '24px',
                                            padding: '2rem',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            minHeight: '200px',
                                            position: 'relative'
                                        }}
                                    >
                                        <button 
                                            onClick={() => setShowSimulator(true)}
                                            style={{
                                                position: 'absolute',
                                                top: '1.5rem',
                                                right: '1.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                background: subject.color,
                                                color: 'white',
                                                border: 'none',
                                                padding: '10px 18px',
                                                borderRadius: '12px',
                                                fontWeight: 800,
                                                fontSize: '0.9rem',
                                                cursor: 'pointer',
                                                boxShadow: `0 8px 20px ${subject.color}40`,
                                                transition: 'all 0.2s',
                                                zIndex: 10
                                            }}
                                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <PlayCircle size={18} /> Simular
                                        </button>

                                        <div dangerouslySetInnerHTML={{ __html: lesson.challenges[activeChallenge]?.content || '' }} />
                                    </div>

                                    {showSimulator && (
                                        <MiniChallengeSimulator 
                                            challengeIdx={activeChallenge} 
                                            onClose={() => setShowSimulator(false)} 
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'simulador' ? (
                        <ChallengeRoadmap />
                    ) : (
                        <div
                            dangerouslySetInnerHTML={{ __html: tabs.find(t => t.id === activeTab)?.content || '' }}
                        />
                    )}

                    {/* Final Navigation Buttons */}
                    <div className="lesson-nav-footer">
                        <button
                            className="nav-btn nav-btn-prev"
                            onClick={() => navigate(`/dashboard/subject/${courseId}`)}
                        >
                            <ArrowLeft size={20} />
                            <span>Módulos del curso</span>
                        </button>
                        <button
                            className="nav-btn nav-btn-complete"
                            style={{ background: subject.color, border: 'none' }}
                        >
                            <CheckCircle size={20} />
                            <span>Marcar como completada</span>
                        </button>
                    </div>
                </article>
            </main>
        </div>
    );
};

export default Lesson;
