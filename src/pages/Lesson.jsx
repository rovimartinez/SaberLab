import { useState, useEffect } from 'react';
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
    X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';
import './Lesson.css';
import ChallengeRoadmap from '../components/ChallengeRoadmap';
import CodeEditor from '../components/CodeEditor';
import ArduinoSimulatorV2 from '../components/ArduinoSimulatorV2';

const subjectData = {
    5: { name: 'Robótica Educativa', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', icon: <PlayCircle size={32} />, teacher: 'Ronny Martinez' }
};

const tabs = [
    {
        id: 'contenido', label: 'Contenido', icon: <BookOpen size={18} />, content: `
        <h3 style="color: #a855f7; margin-bottom: 1rem;">1.1 Introducción al Hardware Abierto</h3>
        <p style="margin-bottom: 1rem;">El <strong>hardware abierto</strong> se refiere a dispositivos cuya especificaciones de diseño son públicas, permitiendo que cualquiera los estudie, modifique y construya. Arduino es el ejemplo más popular.</p>
        
        <h3 style="color: #a855f7; margin: 1.5rem 0 1rem;">1.2 ¿Qué es Arduino?</h3>
        <div style="display: flex; gap: 2rem; margin-bottom: 2rem; alignItems: center; flexWrap: wrap;">
            <div style="flex: 1; minWidth: '300px';">
                <p style="margin-bottom: 1rem; line-height: 1.8;">Arduino es una <strong>plataforma de desarrollo</strong> basada en hardware y software libre. Consiste en una placa con un microcontrolador que puede ser programada para interactuar con el mundo físico mediante una gran variedad de sensores y actuadores.</p>
                <p style="margin-bottom: 1rem; line-height: 1.8;">Fue creado en 2005 en Italia para que estudiantes pudieran crear proyectos interactivos de manera sencilla y económica. Hoy es la plataforma de hardware más popular del mundo, con una comunidad global inmensa que comparte miles de proyectos creativos cada día.</p>
                <div style="background: rgba(16, 185, 129, 0.1); padding: 1rem; border-radius: 10px; border-left: 4px solid #10b981;">
                    <strong style="color: #10b981;">💡 Dato:</strong> Arduino Uno es el modelo más popular y versátil para aprender.
                </div>
            </div>
            <div style="flex: 0.9; min-width: 320px; text-align: center;">
                <img src="https://i.postimg.cc/CxSNt25F/Arduino-Uno.png" alt="Arduino Uno" style="width: 100%; max-width: 450px; height: auto; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.4);" />
                <p style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.8rem;">Arduino Uno - Placa de desarrollo</p>
            </div>
        </div>
        
        <h4 style="color: #a855f7; margin: 1.5rem 0 1rem;">Componentes Principales</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
            <div style="background: rgba(168, 85, 247, 0.1); padding: 1rem; border-radius: 10px;">
                <strong style="color: #a855f7;">CPU</strong><br>
                <small>ATmega328P - 16MHz</small>
            </div>
            <div style="background: rgba(168, 85, 247, 0.1); padding: 1rem; border-radius: 10px;">
                <strong style="color: #a855f7;">Entradas Digitales</strong><br>
                <small>Pines 0-13</small>
            </div>
            <div style="background: rgba(168, 85, 247, 0.1); padding: 1rem; border-radius: 10px;">
                <strong style="color: #a855f7;">Entradas Analógicas</strong><br>
                <small>Pines A0-A5</small>
            </div>
            <div style="background: rgba(168, 85, 247, 0.1); padding: 1rem; border-radius: 10px;">
                <strong style="color: #a855f7;">Alimentación</strong><br>
                <small>USB o jack 9V</small>
            </div>
        </div>
        
        <h3 style="color: #a855f7; margin: 1.5rem 0 1rem;">1.3 El LED</h3>
        <p style="margin-bottom: 2rem; line-height: 1.8; color: #cbd5e1;">El LED (Light Emitting Diode o Diodo Emisor de Luz) es un componente semiconductor que emite luz cuando la corriente eléctrica fluye a través de él en una dirección específica.</p>

        <div style="display: flex; gap: 2.5rem; alignItems: center; flexWrap: wrap; margin-bottom: 2rem;">
            <div style="flex: 1.2; min-width: 300px;">
                <div style="background: rgba(239, 68, 68, 0.05); padding: 1.25rem; border-radius: 15px; border: 1px solid rgba(239, 68, 68, 0.2); margin-bottom: 1.25rem; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
                    <strong style="color: #ef4444; font-size: 1.2rem; display: block; margin-bottom: 0.5rem;">Ánodo (+)</strong>
                    <p style="font-size: 1rem; color: #94a3b8;">Es la pata más larga del LED. Debe conectarse siempre al <strong>positivo</strong> de la fuente o a un pin digital de Arduino.</p>
                </div>
                
                <div style="background: rgba(59, 130, 246, 0.05); padding: 1.25rem; border-radius: 15px; border: 1px solid rgba(59, 130, 246, 0.2); box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
                    <strong style="color: #3b82f6; font-size: 1.2rem; display: block; margin-bottom: 0.5rem;">Cátodo (-)</strong>
                    <p style="font-size: 1rem; color: #94a3b8;">Es la pata más corta y se conecta al <strong>negativo (GND)</strong>. Tiene un pequeño recorte plano en el borde del LED.</p>
                </div>
            </div>
            <div style="flex: 0.8; min-width: 320px; text-align: center;">
                <img src="https://i.postimg.cc/6qxRZ7Gt/LEDs.png" alt="Anatomía del LED" style="width: 100%; height: auto; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.4);" />
                <p style="font-size: 0.85rem; color: #64748b; margin-top: 1rem; font-style: italic;">Identificación de polaridad en un LED estándar</p>
            </div>
        </div>
        
        <h3 style="color: #a855f7; margin: 2rem 0 1rem;">1.4 La Resistencia</h3>
        <p style="margin-bottom: 1.5rem; line-height: 1.8;">Los LEDs requieren una resistencia para <strong>limitar la corriente</strong> y evitar que se quemen. El Arduino proporciona 5V, pero un LED típicamente necesita solo 2V-3V a 20mA. La resistencia absorbe el exceso de voltaje.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div style="background: rgba(245, 158, 11, 0.05); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(245, 158, 11, 0.2); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -10px; right: -10px; font-size: 4rem; opacity: 0.1; color: #f59e0b;">⚠️</div>
                <strong style="color: #f59e0b; font-size: 1.1rem; display: block; margin-bottom: 0.75rem;">¡Cuidado!</strong>
                <p style="font-size: 0.95rem; color: #cbd5e1; line-height: 1.6;">Sin resistencia, el LED recibirá demasiada energía y se quemará instantáneamente. Es como intentar beber agua de una manguera de bomberos.</p>
            </div>
            
            <div style="background: rgba(16, 185, 129, 0.05); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.2); position: relative; overflow: hidden;">
                <div style="position: absolute; top: -10px; right: -10px; font-size: 4rem; opacity: 0.1; color: #10b981;">💡</div>
                <strong style="color: #10b981; font-size: 1.1rem; display: block; margin-bottom: 0.75rem;">La Ley de Ohm</strong>
                <p style="font-size: 0.95rem; color: #cbd5e1; line-height: 1.6;">Se calcula con <strong>V = I × R</strong>. Para un LED rojo en 5V, usamos usualmente una de <strong>220Ω</strong> (Rojo, Rojo, Marrón).</p>
            </div>
        </div>

        <div style="display: flex; gap: 2rem; alignItems: center; flexWrap: wrap; margin-bottom: 2rem;">
            <div style="flex: 0.9; min-width: 300px; text-align: center;">
                <img src="https://i.postimg.cc/rm1svfKp/resistencia.png" alt="Guía de colores de resistencias" style="width: 100%; height: auto; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.4);" />
                <p style="font-size: 0.85rem; color: #64748b; margin-top: 1rem; font-style: italic;">Referencia visual del código de colores</p>
            </div>

            <div style="flex: 1.1; min-width: 320px;">
                <div style="background: rgba(30, 41, 59, 0.6); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 15px 40px rgba(0,0,0,0.3);">
                    <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                        <h4 style="color: #f97316; margin: 0; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.5px;">Códigos más Comunes</h4>
                        <button 
                            onClick="window.dispatchShowGuide()"
                            style="cursor: pointer; border: none; font-size: 0.7rem; background: rgba(249, 115, 22, 0.15); color: #f97316; padding: 5px 12px; border-radius: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease;"
                            onMouseOver="this.style.background='rgba(249, 115, 22, 0.25)'"
                            onMouseOut="this.style.background='rgba(249, 115, 22, 0.15)'"
                        >
                            Ver Guía Rápida
                        </button>
                    </header>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.25); padding: 0.9rem 1.2rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05);">
                            <div style="flex: 1; display: flex; justify-content: flex-start;">
                                <div style="width: 65px; height: 14px; background: #d1d5db; border-radius: 10px; position: relative; display: flex; justify-content: space-around; padding: 0 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">
                                    <div style="width: 5px; height: 100%; background: #ef4444;"></div>
                                    <div style="width: 5px; height: 100%; background: #ef4444;"></div>
                                    <div style="width: 5px; height: 100%; background: #92400e;"></div>
                                </div>
                            </div>
                            <div style="flex: 2; text-align: center; color: #94a3b8; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                Rojo - Rojo - Marrón
                            </div>
                            <div style="flex: 1; text-align: right; font-weight: 800; font-size: 1.15rem; color: #f8fafc; letter-spacing: -0.5px;">
                                220 Ω
                            </div>
                        </div>
                        
                        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.25); padding: 0.9rem 1.2rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05);">
                            <div style="flex: 1; display: flex; justify-content: flex-start;">
                                <div style="width: 65px; height: 14px; background: #d1d5db; border-radius: 10px; position: relative; display: flex; justify-content: space-around; padding: 0 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">
                                    <div style="width: 5px; height: 100%; background: #f59e0b;"></div>
                                    <div style="width: 5px; height: 100%; background: #f59e0b;"></div>
                                    <div style="width: 5px; height: 100%; background: #92400e;"></div>
                                </div>
                            </div>
                            <div style="flex: 2; text-align: center; color: #94a3b8; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                Naranja - Naranja - Marrón
                            </div>
                            <div style="flex: 1; text-align: right; font-weight: 800; font-size: 1.15rem; color: #f8fafc; letter-spacing: -0.5px;">
                                330 Ω
                            </div>
                        </div>
                        
                        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.25); padding: 0.9rem 1.2rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05);">
                            <div style="flex: 1; display: flex; justify-content: flex-start;">
                                <div style="width: 65px; height: 14px; background: #d1d5db; border-radius: 10px; position: relative; display: flex; justify-content: space-around; padding: 0 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">
                                    <div style="width: 5px; height: 100%; background: #92400e;"></div>
                                    <div style="width: 5px; height: 100%; background: #020617;"></div>
                                    <div style="width: 5px; height: 100%; background: #ef4444;"></div>
                                </div>
                            </div>
                            <div style="flex: 2; text-align: center; color: #94a3b8; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                Marrón - Negro - Rojo
                            </div>
                            <div style="flex: 1; text-align: right; font-weight: 800; font-size: 1.15rem; color: #f8fafc; letter-spacing: -0.5px;">
                                1 kΩ
                            </div>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 1.25rem; padding: 1rem; background: rgba(96, 165, 250, 0.08); border-radius: 15px; border-left: 4px solid #60a5fa; display: flex; align-items: flex-start; gap: 0.8rem;">
                    <p style="margin: 0; font-size: 0.88rem; color: #cbd5e1; line-height: 1.5;"><strong>Pro-Tip:</strong> El <strong>Pin 13</strong> de Arduino ya incluye una resistencia interna de protección de aproximadamente <strong>1kΩ</strong>; esto te permite conectar un LED directo allí para pruebas rápidas sin que se queme.</p>
                </div>
            </div>
        </div>
        
        <h3 style="color: #a855f7; margin: 2rem 0 1rem;">1.5 Fundamentos de Programación</h3>
        <p style="margin-bottom: 2rem; color: #94a3b8;">Antes de ver el código final, memoriza estos tres pilares de la programación en Arduino:</p>
        
        <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2.5rem;">
            <!-- 1. Código Secuencial -->
            <div style="background: rgba(30, 41, 59, 0.6); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.05); display: flex; align-items: center; gap: 1.5rem;">
                <div style="background: rgba(168, 85, 247, 0.15); color: #a855f7; width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 900;">1</div>
                <div>
                    <h4 style="margin: 0 0 0.4rem; color: #f8fafc; font-size: 1.1rem;">Código Secuencial</h4>
                    <p style="margin: 0; color: #94a3b8; font-size: 0.95rem;">Las instrucciones se ejecutan de <strong>arriba hacia abajo</strong>, una por una. El procesador nunca salta pasos.</p>
                </div>
            </div>

            <!-- 2. Punto y Coma -->
            <div style="background: rgba(30, 41, 59, 0.6); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.05);">
                <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.25rem;">
                    <div style="background: rgba(168, 85, 247, 0.15); color: #a855f7; width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 900;">2</div>
                    <div>
                        <h4 style="margin: 0 0 0.4rem; color: #f8fafc; font-size: 1.1rem;">Punto y Coma (;)</h4>
                        <p style="margin: 0; color: #94a3b8; font-size: 0.95rem;">Toda instrucción debe terminar en (;). ¡Olvidarlo es el error más común!</p>
                    </div>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); padding: 1rem; border-radius: 12px; font-family: monospace; font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="color: #10b981; margin-bottom: 0.4rem;">digitalWrite(13, HIGH); <span style="margin-left: 1rem; opacity: 0.6;">// ✓ Correcto</span></div>
                    <div style="color: #ef4444;">digitalWrite(13, HIGH) <span style="margin-left: 1.4rem; opacity: 0.6;">// ✗ Error</span></div>
                </div>
            </div>

            <!-- 3. Llaves -->
            <div style="background: rgba(30, 41, 59, 0.6); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.05);">
                <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.25rem;">
                    <div style="background: rgba(168, 85, 247, 0.15); color: #a855f7; width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 900;">3</div>
                    <div>
                        <h4 style="margin: 0 0 0.4rem; color: #f8fafc; font-size: 1.1rem;">Llaves {"{ }"}</h4>
                        <p style="margin: 0; color: #94a3b8; font-size: 0.95rem;">Las llaves definen grupos de código (como los límites de una habitación).</p>
                    </div>
                </div>
                <div style="background: rgba(15, 23, 42, 0.8); padding: 1rem; border-radius: 12px; font-family: monospace; font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="color: #60a5fa;">void loop() {"{"}</div>
                    <div style="color: #94a3b8; padding-left: 1rem;">// Todo dentro de llaves pertenece a loop()</div>
                    <div style="color: #60a5fa;">{"}"}</div>
                </div>
            </div>
        </div>

        <h3 style="color: #a855f7; margin: 1.5rem 0 1rem;">1.6 Funciones Obligatorias</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div style="background: rgba(30, 41, 59, 0.6); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <code style="color: #60a5fa; font-size: 1.1rem; font-weight: 700; display: block; margin-bottom: 0.75rem;">void setup()</code>
                <p style="font-size: 0.95rem; line-height: 1.6; color: #cbd5e1;">Este bloque se ejecuta <strong>una sola vez</strong>. Aquí configuramos qué pines serán entradas o salidas.</p>
            </div>
            
            <div style="background: rgba(30, 41, 59, 0.6); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <code style="color: #60a5fa; font-size: 1.1rem; font-weight: 700; display: block; margin-bottom: 0.75rem;">void loop()</code>
                <p style="font-size: 0.95rem; line-height: 1.6; color: #cbd5e1;">Se ejecuta <strong>repetidamente</strong> en bucle infinito. ¡Es el motor del programa!</p>
            </div>
        </div>
        
        <h3 style="color: #a855f7; margin: 1.5rem 0 1rem;">1.6 Funciones Base para Nuestro Primer Parpadeo</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">Para hacer parpadear un LED, solo necesitamos tres funciones esenciales:</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div style="background: rgba(168, 85, 247, 0.1); padding: 1rem 1.25rem; border-radius: 12px; border-left: 3px solid #a855f7;">
                <code style="color: #f97316; font-weight: 700;">pinMode(pin, MODO)</code>
                <p style="margin-top: 0.5rem; font-size: 0.88rem;">Configura un pin como ENTRADA (<code>INPUT</code>) o SALIDA (<code>OUTPUT</code>).</p>
            </div>
            
            <div style="background: rgba(168, 85, 247, 0.1); padding: 1rem 1.25rem; border-radius: 12px; border-left: 3px solid #a855f7;">
                <code style="color: #f97316; font-weight: 700;">digitalWrite(pin, VALOR)</code>
                <p style="margin-top: 0.5rem; font-size: 0.88rem;">Escribe <code>HIGH</code> (5V) o <code>LOW</code> (0V) en un pin especifico.</p>
            </div>
            
            <div style="background: rgba(168, 85, 247, 0.1); padding: 1rem 1.25rem; border-radius: 12px; border-left: 3px solid #a855f7;">
                <code style="color: #f97316; font-weight: 700;">delay(milisegundos)</code>
                <p style="margin-top: 0.5rem; font-size: 0.88rem;">Pausa el programa por un tiempo en milisegundos.</p>
            </div>
        </div>

        <h4 style="color: #a855f7; margin-bottom: 1rem;">Ejemplo: El Código Final</h4>
        <pre style="background: rgba(15, 23, 42, 0.6); padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);"><code style="font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; line-height: 1.5;">void setup() {
  // Se ejecuta UNA vez al iniciar
  pinMode(13, OUTPUT);
}

void loop() {
  // Se ejecuta REPETIDAMENTE
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}</code></pre>

        <div style="background: rgba(16, 185, 129, 0.08); padding: 1rem 1.25rem; border-radius: 15px; border-left: 4px solid #10b981; margin-top: 1.5rem;">
            <strong style="color: #10b981;">💡 Nota:</strong>
            <span style="margin-left: 0.5rem; font-size: 0.95rem;">Visita <a href="https://www.arduino.cc/reference" target="_blank" style="color: #10b981; text-decoration: underline;">arduino.cc/reference</a> para ver todas las funciones.</span>
        </div>
    `},
    {
        id: 'repaso', label: 'Repaso', icon: <RefreshCw size={18} />, content: 'repaso-interactivo'
    },
    {
        id: 'practica', label: 'Práctica', icon: <Wrench size={18} />, content: `
        <h3 style="color: #a855f7; margin-bottom: 1.5rem;">Práctica: Mi Primer Parpadeo</h3>
        
        <div style="display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 2rem;">
            <div style="flex: 1; min-width: 300px;">
                <h4 style="color: #60a5fa; margin: 0 0 1rem;">Paso 1: Montar el Circuito</h4>
                <div style="background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05);">
                    <ul style="line-height: 2.2; padding-left: 1.2rem; color: #cbd5e1;">
                        <li>Abre <strong>Tinkercad Circuits</strong> y crea un nuevo proyecto.</li>
                        <li>Arrastra un <strong>Arduino Uno R3</strong> al espacio de trabajo.</li>
                        <li>Busca un <strong>LED</strong> y colócalo en el protoboard (o conéctalo directo).</li>
                        <li>Conecta el <strong>Ánodo (+)</strong> al <strong>Pin 13</strong> de tu Arduino.</li>
                        <li>Conecta el <strong>Cátodo (-)</strong> a una <strong>Resistencia 220Ω</strong>.</li>
                        <li>Conecta el otro extremo de la resistencia a <strong>GND</strong>.</li>
                    </ul>
                </div>
            </div>
            
            <div style="flex: 0.8; min-width: 280px;">
                <div style="background: rgba(168, 85, 247, 0.05); padding: 1.5rem; border-radius: 20px; border: 1px dashed rgba(168, 85, 247, 0.3); text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚡</div>
                    <strong style="color: #a855f7; display: block; margin-bottom: 0.5rem;">Diagrama de Conexión</strong>
                    <p style="font-size: 0.9rem; color: #94a3b8; line-height: 1.5;">Arduino Pin 13 ➜ Ánodo LED<br>Cátodo LED ➜ Resistencia ➜ Arduino GND</p>
                    <div style="margin-top: 1rem; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 10px; font-family: monospace; font-size: 0.8rem; color: #10b981;">
                        PIN 13 [---(LED)---[RES]---] GND
                    </div>
                </div>
            </div>
        </div>
        
        <h4 style="color: #60a5fa; margin: 1.5rem 0 1rem;">Paso 2: Programar</h4>
        <pre style="background: rgba(15, 23, 42, 0.9); padding: 1.5rem; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); overflow-x: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);"><code style="color: #e2e8f0;"><span style="color: #a855f7;">void</span> <span style="color: #60a5fa;">setup</span>() {
  <span style="color: #10b981;">pinMode</span>(13, <span style="color: #f59e0b;">OUTPUT</span>); <span style="color: #64748b;">// Pin 13 como salida</span>
}

<span style="color: #a855f7;">void</span> <span style="color: #60a5fa;">loop</span>() {
  <span style="color: #10b981;">digitalWrite</span>(13, <span style="color: #f59e0b;">HIGH</span>); <span style="color: #64748b;">// Encender LED</span>
  <span style="color: #10b981;">delay</span>(1000);            <span style="color: #64748b;">// Esperar 1 seg</span>
  <span style="color: #10b981;">digitalWrite</span>(13, <span style="color: #f59e0b;">LOW</span>);  <span style="color: #64748b;">// Apagar LED</span>
  <span style="color: #10b981;">delay</span>(1000);            <span style="color: #64748b;">// Esperar 1 seg</span>
}</code></pre>
        
        <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(16, 185, 129, 0.1); border-radius: 15px; border-left: 4px solid #10b981;">
            <strong style="color: #10b981;">✅ Resultado Esperado:</strong>
            <p style="margin-top: 0.5rem; color: #cbd5e1;">Si todo está bien conectado, verás que el LED parpadea rítmicamente cada segundo. ¡Has creado tu primer sistema de control automático!</p>
        </div>
    `},
    {
        id: 'simulador', label: 'Simulador', icon: <Monitor size={18} />, content: `
        <h3 style="color: #a855f7; margin-bottom: 1rem;">Simulador Integrado</h3>
        
        <div style="text-align: center; padding: 3rem; background: rgba(168, 85, 247, 0.1); border-radius: 20px; margin-bottom: 1rem;">
            <p style="font-size: 4rem; margin-bottom: 1rem;">🔌</p>
            <h4 style="color: #a855f7; margin-bottom: 0.5rem;">Simulador en Desarrollo</h4>
            <p style="color: var(--text-secondary);">Próximamente podrás programar y simular directamente aquí.</p>
        </div>
        
        <h4 style="color: #60a5fa; margin-bottom: 1rem;">Mientras tanto...</h4>
        <p>Usa <strong>Tinkercad Circuits</strong> para realizar las prácticas:</p>
        <ul style="line-height: 2;">
            <li>🔗 <a href="https://www.tinkercad.com/" target="_blank" style="color: #a855f7;">Ir a Tinkercad</a></li>
            <li>📚 <a href="https://www.tinkercad.com/learn/circuits" target="_blank" style="color: #a855f7;">Tutoriales de Tinkercad</a></li>
        </ul>
    `},
    {
        id: 'prueba', label: 'Prueba', icon: <ClipboardList size={18} />, content: 'quiz'
    }
];

const lessonsData = {
    5: {
        'm1-l1': {
            title: 'Mi primer parpadeo (Entorno y Salidas Digitales)',
            content: `
                <h2>Introducción a Arduino</h2>
                <p>Arduino es una plataforma de electrónica abierta que permite crear proyectos interactivos. En esta lección aprenderemos los conceptos básicos del entorno de desarrollo.</p>
                
                <h3>El LED</h3>
                <p>El LED (Light Emitting Diode) es un componente electrónico que emite luz cuando la corriente eléctrica pasa a través de él. Tiene polaridad, lo que significa que importa cómo lo conectes.</p>
                
                <ul>
                    <li><strong>Ánodo:</strong> La pata larga, se conecta a positivo</li>
                    <li><strong>Cátodo:</strong> La pata corta, se conecta a negativo</li>
                </ul>
                
                <h3>Código Básico</h3>
                <pre><code>void setup() {
  pinMode(13, OUTPUT); // Configuramos el pin 13 como salida
}

void loop() {
  digitalWrite(13, HIGH); // Encendemos el LED
  delay(1000); // Esperamos 1 segundo
  digitalWrite(13, LOW); // Apagamos el LED
  delay(1000); // Esperamos 1 segundo
}</code></pre>
                
                <h3>Ejercicio</h3>
                <p>Conecta un LED al pin 13 de tu placa Arduino y ejecuta el código anterior. Observa cómo el LED parpadea cada segundo.</p>
            `
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
                {/* 1. RESET BUTTON (TOP LEFT CORNER) */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', width: '24px', height: '24px', background: '#bdc3c7', borderRadius: '2px', display: 'flex', zIndex: 10 }}>
                    <div style={{ width: '14px', height: '14px', margin: 'auto', background: 'radial-gradient(circle, #e74c3c, #c0392b)', borderRadius: '50%' }}></div>
                </div>

                {/* 2. USB PORT (BELOW RESET) */}
                <div style={{ position: 'absolute', left: '0px', top: '40px', width: '50px', height: '45px', background: pcbStyles.metal, borderRadius: '1px', border: '1px solid #7f8c8d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '25px', height: '30px', background: '#1a1a1a', borderRadius: '1px' }}></div>
                </div>

                {/* 3. POWER JACK (BOTTOM LEFT) */}
                <div style={{ position: 'absolute', left: '0px', bottom: '25px', width: '55px', height: '40px', background: 'linear-gradient(180deg, #111 0%, #333 50%, #000 100%)', borderRadius: '2px' }}></div>

                {/* 4. DIGITAL HEADERS (TOP RIGHT) */}
                <div style={{ position: 'absolute', top: '5px', right: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ background: '#1a1a1a', display: 'flex', padding: '1px', gap: '1px' }}>
                            {[...Array(10)].map((_, i) => <div key={i} style={{ width: '7px', height: '9px', background: '#000', border: '1px solid #333' }}></div>)}
                        </div>
                        <div style={{ background: '#1a1a1a', display: 'flex', padding: '1px', gap: '1px' }}>
                            {[...Array(8)].map((_, i) => <div key={i} style={{ width: '7px', height: '9px', background: '#000', border: '1px solid #333' }}></div>)}
                        </div>
                    </div>
                    <span style={{ fontSize: '6px', color: 'rgba(255,255,255,0.7)', fontWeight: 900, display: 'block', textAlign: 'right', marginTop: '2px', textTransform: 'uppercase' }}>Digital (PWM ~)</span>
                </div>

                {/* 5. POWER & ANALOG HEADERS (BOTTOM) */}
                <div style={{ position: 'absolute', bottom: '5px', left: '90px', display: 'flex', gap: '20px' }}>
                    {/* Power Section */}
                    <div>
                        <span style={{ fontSize: '6px', color: 'rgba(255,255,255,0.7)', fontWeight: 900, display: 'block', marginBottom: '2px', textTransform: 'uppercase' }}>Power</span>
                        <div style={{ background: '#1a1a1a', display: 'flex', padding: '1px', gap: '1px' }}>
                            {[...Array(8)].map((_, i) => <div key={i} style={{ width: '7px', height: '9px', background: '#000', border: '1px solid #333' }}></div>)}
                        </div>
                    </div>
                    {/* Analog In Section */}
                    <div>
                        <span style={{ fontSize: '6px', color: 'rgba(255,255,255,0.7)', fontWeight: 900, display: 'block', marginBottom: '2px', textTransform: 'uppercase' }}>Analog In</span>
                        <div style={{ background: '#1a1a1a', display: 'flex', padding: '1px', gap: '1px' }}>
                            {[...Array(6)].map((_, i) => <div key={i} style={{ width: '7px', height: '9px', background: '#000', border: '1px solid #333' }}></div>)}
                        </div>
                    </div>
                </div>

                {/* 6. CHIP / ATMega */}
                <div style={{ position: 'absolute', bottom: '75px', right: '35px', width: '160px', height: '35px', background: '#1a1a1a', borderRadius: '1px', boxShadow: '0 10px 20px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6px', color: 'rgba(255,255,255,0.1)', fontFamily: 'monospace', letterSpacing: '1.5px' }}>
                    ATMEGA328P-PU
                </div>

                {/* 7. BLINK LED "L" */}
                <div style={{ position: 'absolute', top: '80px', right: '110px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '7px', height: '6px', background: isOn ? '#fbbf24' : '#333', boxShadow: isOn ? '0 0 12px #fbbf24' : 'none', transition: 'all 0.1s' }}></div>
                    <span style={{ fontSize: '6px', color: 'white', fontWeight: 900 }}>L</span>
                </div>
                <div style={{ position: 'absolute', top: '100px', right: '110px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '7px', height: '6px', background: '#2ecc71', boxShadow: '0 0 6px #2ecc71' }}></div>
                    <span style={{ fontSize: '6px', color: 'white', fontWeight: 900 }}>ON</span>
                </div>

                {/* Branding */}
                <div style={{ position: 'absolute', top: '110px', left: '110px', opacity: 0.08, color: 'white', userSelect: 'none' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, fontStyle: 'italic' }}>ARDUINO</div>
                    <div style={{ fontSize: '11px', fontWeight: 800, marginLeft: '35px', letterSpacing: '3px' }}>UNO</div>
                </div>
            </div>
        </div>
    );
};

const ReviewSection = ({ user, lessonKey }) => {
    const [flipped, setFlipped] = useState({});
    const [mastered, setMastered] = useState({}); // { id: 'known' | 'unknown' }
    const [loading, setLoading] = useState(true);

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
            console.error("Error loading flashcard progress:", err);
        } finally {
            setLoading(false);
        }
    };

    const flashcards = [
        // HARDWARE & COLORS
        { id: 'c1', type: 'hw', q: '¿Cuál es el valor de la resistencia Rojo - Rojo - Marrón?', a: '220 Ω', sub: 'Protección LED estándar' },
        { id: 'c2', type: 'hw', q: '¿Cuál es el valor de la resistencia Naranja - Naranja - Marrón?', a: '330 Ω', sub: 'Muy común en robótica' },
        { id: 'c3', type: 'hw', q: '¿Cuánto vale una resistencia Marrón - Negro - Rojo?', a: '1 KΩ', sub: 'Equivale a 1000 Ohmios' },
        { id: 'c11', type: 'hw', q: '¿Qué valor tiene la resistencia Amarillo - Violeta - Marrón?', a: '470 Ω', sub: 'Protección con menor brillo' },
        { id: 'c4', type: 'hw', q: '¿Cómo se llama la pata más larga de un LED?', a: 'Ánodo (+)', sub: 'Conexión al pin Positivo' },
        { id: 'c5', type: 'hw', q: '¿Qué tiene de especial el Pin 13 de tu Arduino?', a: 'Resistencia Interna', sub: 'Tiene ~1kΩ integrada en placa' },
        { id: 'c12', type: 'hw', q: '¿Qué unidad eléctrica representa el símbolo Ω?', a: 'Ohmio', sub: 'Unidad de la Resistencia' },
        
        // CODE & LOGIC
        { id: 'c6', type: 'code', q: '¿Qué función se ejecuta solo una vez al iniciar?', a: 'void setup()', sub: 'Configura pines y sensores' },
        { id: 'c7', type: 'code', q: '¿Cómo se llama el bucle que no tiene fin?', a: 'void loop()', sub: 'Ejecuta la lógica principal' },
        { id: 'c8', type: 'code', q: '¿Qué signo es obligatorio al final de cada orden?', a: 'Punto y Coma ( ; )', sub: 'Evita errores de compilación' },
        { id: 'c9', type: 'code', q: '¿Qué caracteres encierran un bloque de código?', a: 'Llaves { }', sub: 'Definen el inicio y el final' },
        { id: 'c10', type: 'code', q: '¿Qué significa que sea "Hardware Abierto"?', a: 'Diseño Libre', sub: 'Planos públicos para todos' }
    ];

    const toggleFlip = (id) => {
        setFlipped(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleMark = async (e, id, status) => {
        e.stopPropagation(); // Evitar que la card se voltee al pulsar botones
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
                console.error("Error saving flashcard progress:", err);
            }
        }

        // Voltear automáticamente después de un segundo para mostrar el resultado en el frente
        setTimeout(() => {
            setFlipped(prev => ({ ...prev, [id]: false }));
        }, 800);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#a855f7' }}>
                <RefreshCw className="animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="review-section-interactive" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', padding: '1rem' }}>
                {flashcards.map(card => {
                    const status = mastered[card.id];
                    let backBg = 'rgba(30, 41, 59, 0.95)';
                    let borderColor = card.type === 'hw' ? '#a855f7' : '#60a5fa';
                    
                    if (status === 'known') {
                        backBg = 'rgba(16, 185, 129, 0.15)';
                        borderColor = '#10b981';
                    } else if (status === 'unknown') {
                        backBg = 'rgba(239, 68, 68, 0.15)';
                        borderColor = '#ef4444';
                    }

                    return (
                        <div 
                            key={card.id} 
                            className={`memory-card ${flipped[card.id] ? 'is-flipped' : ''}`}
                            onClick={() => toggleFlip(card.id)}
                            style={{ 
                                height: '180px', perspective: '1000px', cursor: 'pointer'
                            }}
                        >
                            <div className="card-inner" style={{ 
                                position: 'relative', width: '100%', height: '100%', transition: 'transform 0.6s', transformStyle: 'preserve-3d'
                            }}>
                                {/* FRONT FACE */}
                                <div className="card-front" style={{ 
                                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', 
                                    background: status ? backBg : 'rgba(30, 41, 59, 0.4)', 
                                    borderRadius: '24px', border: `1px solid ${status ? borderColor : 'rgba(255,255,255,0.08)'}`,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{ 
                                        background: card.type === 'hw' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(96, 165, 250, 0.1)',
                                        color: card.type === 'hw' ? '#a855f7' : '#60a5fa', padding: '4px 12px', borderRadius: '20px', 
                                        fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem'
                                    }}>
                                        {card.type === 'hw' ? 'Hardware' : 'Software'}
                                    </div>
                                    <p style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: 1.4, textAlign: 'center' }}>{card.q}</p>
                                    
                                    {status && (
                                        <div style={{ 
                                            position: 'absolute', top: '10px', right: '10px', 
                                            background: borderColor, color: 'white', 
                                            width: '20px', height: '20px', borderRadius: '50%', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                        }}>
                                            {status === 'known' ? <CheckCircle size={12} /> : <X size={12} />}
                                        </div>
                                    )}
                                </div>

                                {/* BACK FACE */}
                                <div className="card-back" style={{ 
                                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', 
                                    background: backBg, borderRadius: '24px', border: `2px solid ${borderColor}`,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    transform: 'rotateY(180deg)', padding: '1.5rem', transition: 'all 0.3s ease'
                                }}>
                                    <h4 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 900, margin: 0, textAlign: 'center' }}>{card.a}</h4>
                                    <p style={{ color: status === 'known' ? '#10b981' : status === 'unknown' ? '#ef4444' : (card.type === 'hw' ? '#a855f7' : '#60a5fa'), fontSize: '0.8rem', fontWeight: 700, marginTop: '0.5rem', textAlign: 'center' }}>{card.sub}</p>
                                    
                                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.25rem' }}>
                                        <button 
                                            onClick={(e) => handleMark(e, card.id, 'known')}
                                            style={{ background: status === 'known' ? '#10b981' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(16, 185, 129, 0.3)', color: status === 'known' ? 'white' : '#10b981', padding: '8px 12px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 800 }}
                                        >
                                            <CheckCircle size={14} /> <span>¡Lo sé!</span>
                                        </button>
                                        <button 
                                            onClick={(e) => handleMark(e, card.id, 'unknown')}
                                            style={{ background: status === 'unknown' ? '#ef4444' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', color: status === 'unknown' ? 'white' : '#ef4444', padding: '8px 12px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 800 }}
                                        >
                                            <X size={14} /> <span>Repasar</span>
                                        </button>
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

const Lesson = () => {
    const { user } = useAuth();
    const { courseId, moduleId, lessonId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('contenido');
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showGuide, setShowGuide] = useState(false);

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


    const quizQuestions = [
        {
            id: 'q1',
            question: '¿Qué función se usa para configurar un pin como salida?',
            options: ['digitalWrite()', 'pinMode()', 'delay()'],
            correct: 1
        },
        {
            id: 'q2',
            question: '¿Qué función pausa el programa por un tiempo determinado?',
            options: ['pinMode()', 'digitalWrite()', 'delay()'],
            correct: 2
        },
        {
            id: 'q3',
            question: '¿Por qué necesitamos una resistencia conectada al LED?',
            options: ['Para que brille con más fuerza', 'Para evitar que se queme por exceso de corriente', 'Para que el color sea más intenso'],
            correct: 1
        }
    ];

    const handleAnswerChange = (qId, optionIndex) => {
        setAnswers(prev => ({ ...prev, [qId]: optionIndex }));
    };

    const calculateScore = () => {
        let score = 0;
        quizQuestions.forEach(q => {
            if (answers[q.id] === q.correct) score++;
        });
        return score;
    };

    const numericCourseId = parseInt(courseId);
    const subject = subjectData[numericCourseId] || subjectData[5];

    const lessonKey = `${moduleId}-${lessonId}`;
    const lesson = lessonsData[numericCourseId]?.[lessonKey] || {
        title: 'Lección',
        content: '<p>Contenido de la lección...</p>'
    };

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
                            <span style={{ color: subject.color }}>Lección 1</span>
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
                        <ReviewSection user={user} lessonKey={lessonKey} />
                    ) : activeTab === 'prueba' ? (
                        <div className="quiz-container">
                            <h3 style={{ color: subject.color, fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>
                                Test de Evaluación
                            </h3>
                            {!showResults ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    {quizQuestions.map((q, idx) => (
                                        <div key={q.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <p style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.2rem', color: 'white' }}>
                                                {idx + 1}. {q.question}
                                            </p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {q.options.map((option, optIdx) => {
                                                    const isSelected = answers[q.id] === optIdx;
                                                    return (
                                                        <label
                                                            key={optIdx}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '1rem',
                                                                padding: '1.2rem 1.5rem',
                                                                background: isSelected ? `${subject.color}10` : 'rgba(0,0,0,0.2)',
                                                                borderRadius: '16px',
                                                                cursor: 'pointer',
                                                                border: isSelected ? `2px solid ${subject.color}` : '2px solid transparent',
                                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                                                            }}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={q.id}
                                                                checked={isSelected}
                                                                onChange={() => handleAnswerChange(q.id, optIdx)}
                                                                style={{ accentColor: subject.color, width: '18px', height: '18px' }}
                                                            />
                                                            <span style={{ fontSize: '1rem', fontWeight: 500, color: isSelected ? 'white' : 'var(--text-secondary)' }}>
                                                                {option}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setShowResults(true)}
                                        disabled={Object.keys(answers).length < quizQuestions.length}
                                        className="nav-btn nav-btn-complete"
                                        style={{ background: subject.color, width: '100%', border: 'none', color: 'white', marginTop: '1rem', opacity: Object.keys(answers).length < quizQuestions.length ? 0.5 : 1 }}
                                    >
                                        Finalizar y Revisar Test
                                    </button>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                    <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>
                                        {calculateScore() === quizQuestions.length ? '🏆' : '🔥'}
                                    </div>
                                    <h4 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                                        ¡Test Completado!
                                    </h4>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                                        Has acertado <strong>{calculateScore()} de {quizQuestions.length}</strong> preguntas correctamente.
                                    </p>
                                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => { setShowResults(false); setAnswers({}); }}
                                            className="nav-btn nav-btn-prev"
                                            style={{ minWidth: '200px' }}
                                        >
                                            Reintentar Test
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('repaso')}
                                            className="nav-btn nav-btn-complete"
                                            style={{ background: subject.color, minWidth: '200px', border: 'none', color: 'white' }}
                                        >
                                            Repasar Contenido
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'contenido' ? (
                        <>
                            <div dangerouslySetInnerHTML={{ __html: tabs.find(t => t.id === 'contenido').content.split('<h4 style="color: #a855f7; margin-bottom: 1rem;">Ejemplo: El Código Final</h4>')[0] }} />
                            
                            <h4 style={{ color: '#a855f7', marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 800 }}>Ejemplo: El Código Final</h4>
                            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'stretch', marginBottom: '2rem' }}>
                                <div style={{ flex: 1.4, minWidth: '320px' }}>
                                    <pre style={{ 
                                        background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', borderRadius: '20px', 
                                        border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto', 
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)', margin: 0, height: '100%',
                                        display: 'flex', alignItems: 'center'
                                    }}>
                                        <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', lineHeight: 1.5, color: '#e2e8f0' }}>
                                            <span style={{ color: '#a855f7' }}>void</span> <span style={{ color: '#60a5fa' }}>setup</span>() {"{"}<br/>
                                            &nbsp;&nbsp;<span style={{ color: '#64748b' }}>// Se ejecuta UNA vez al iniciar</span><br/>
                                            &nbsp;&nbsp;<span style={{ color: '#10b981' }}>pinMode</span>(13, <span style={{ color: '#f59e0b' }}>OUTPUT</span>);<br/>
                                            {"}"}<br/><br/>
                                            <span style={{ color: '#a855f7' }}>void</span> <span style={{ color: '#60a5fa' }}>loop</span>() {"{"}<br/>
                                            &nbsp;&nbsp;<span style={{ color: '#64748b' }}>// Se ejecuta REPETIDAMENTE</span><br/>
                                            &nbsp;&nbsp;<span style={{ color: '#10b981' }}>digitalWrite</span>(13, <span style={{ color: '#f59e0b' }}>HIGH</span>);<br/>
                                            &nbsp;&nbsp;<span style={{ color: '#10b981' }}>delay</span>(1000);<br/>
                                            &nbsp;&nbsp;<span style={{ color: '#10b981' }}>digitalWrite</span>(13, <span style={{ color: '#f59e0b' }}>LOW</span>);<br/>
                                            &nbsp;&nbsp;<span style={{ color: '#10b981' }}>delay</span>(1000);<br/>
                                            {"}"}
                                        </code>
                                    </pre>
                                </div>
                                <ArduinoSimulator />
                            </div>

                            <div dangerouslySetInnerHTML={{ __html: tabs.find(t => t.id === 'contenido').content.split('</code></pre>')[1] }} />
                        </>
                    ) : activeTab === 'practica' ? (
                        <ChallengeRoadmap />
                    ) : activeTab === 'simulador' ? (
                        <ArduinoSimulatorV2 />
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
