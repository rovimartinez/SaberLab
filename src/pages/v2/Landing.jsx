import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Zap, Bot, Box, Printer, GraduationCap, Sparkles, ArrowRight, 
    ShieldCheck, Key, LogIn, Play, Pause, CheckCircle2, Clock, 
    Layers, Cpu, Flame, Activity, Terminal, Sliders, Compass, 
    ExternalLink, Share2, HelpCircle, Trophy, Eye, Check, ChevronRight, Lock
} from 'lucide-react';
import '../styles/Landing.css';

export default function Landing() {
    const navigate = useNavigate();

    // ── ESTADO DEL SHOWCASE INTERACTIVO CENTRAL ──
    const [activeTab, setActiveTab] = useState('ee'); // 'ee' | 're' | 'ma' | 'simi'
    
    // Showcase 1: Electricidad (Interruptor y flujo físico)
    const [isSwitchClosed, setIsSwitchClosed] = useState(true);

    // Showcase 2: Robótica (Consola y simulación de firmware)
    const [isRunningArduino, setIsRunningArduino] = useState(true);
    const [arduinoLedState, setArduinoLedState] = useState(true);
    const [serialLogs, setSerialLogs] = useState([
        '[SYS] Microcontrolador inicializado a 16 MHz',
        '[PIN 13] Modo OUTPUT configurado',
        '[LOOP] LED_BUILTIN -> HIGH (3.3V)',
        '[LOOP] LED_BUILTIN -> LOW (0V)',
        '[LOOP] Ciclo 12 completado OK'
    ]);

    // Showcase 3: Modelado 3D (Rotación interactiva de objeto)
    const [rotAngle, setRotAngle] = useState(25);
    const [isAutoRotate, setIsAutoRotate] = useState(true);
    const [current3DMode, setCurrent3DMode] = useState('solid'); // 'wire' | 'solid'

    // Showcase 4: SIMI3D (Manufactura Aditiva y Material)
    const [selectedMaterial, setSelectedMaterial] = useState('PLA');
    const [nozzleTemp, setNozzleTemp] = useState(210);
    const [bedTemp, setBedTemp] = useState(60);
    const [printProgress, setPrintProgress] = useState(68);

    // Intervalo para el simulador de Robótica (parpadeo de LED y logs)
    useEffect(() => {
        if (!isRunningArduino) return;
        const interval = setInterval(() => {
            setArduinoLedState(prev => !prev);
            setSerialLogs(prev => {
                const newLog = `[PWM] Señal digital D13: ${!arduinoLedState ? 'HIGH' : 'LOW'} (${Math.floor(Math.random() * 20 + 80)}% duty)`;
                return [...prev.slice(-4), newLog];
            });
        }, 1200);
        return () => clearInterval(interval);
    }, [isRunningArduino, arduinoLedState]);

    // Intervalo para el simulador 3D (rotación suave)
    useEffect(() => {
        if (!isAutoRotate) return;
        const interval = setInterval(() => {
            setRotAngle(prev => (prev + 1) % 360);
        }, 50);
        return () => clearInterval(interval);
    }, [isAutoRotate]);

    // Cambio de material en SIMI3D
    const handleMaterialChange = (mat) => {
        setSelectedMaterial(mat);
        if (mat === 'PLA') {
            setNozzleTemp(210);
            setBedTemp(60);
        } else if (mat === 'PETG') {
            setNozzleTemp(240);
            setBedTemp(80);
        } else if (mat === 'TPU') {
            setNozzleTemp(225);
            setBedTemp(50);
        }
    };

    return (
        <div className="landing-v2-container">
            {/* Luces y auras de fondo */}
            <div className="landing-v2-glow glow-1"></div>
            <div className="landing-v2-glow glow-2"></div>
            <div className="landing-v2-glow glow-3"></div>
            <div className="landing-v2-grid-mesh"></div>

            {/* ── 1. HEADER INSTITUCIONAL ── */}
            <header className="landing-v2-header">
                <div className="landing-v2-header-inner">
                    <div className="landing-v2-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="landing-v2-logo-box">
                            <img src="https://i.postimg.cc/KY1FZC3G/Logo_Nuevo.png" alt="SaberLab" className="landing-v2-logo-img" />
                        </div>
                        <div className="landing-v2-brand-text">
                            <span className="brand-name">SaberLab</span>
                            <span className="brand-badge">Campus STEAM</span>
                        </div>
                    </div>

                    <nav className="landing-v2-nav-menu">
                        <a href="#laboratorios">Laboratorios Vivos</a>
                        <a href="#carreras">Cursos STEAM</a>
                        <a href="#tutores-ia">Tutores IA</a>
                        <a href="#evaluaciones">Evaluaciones</a>
                    </nav>

                    <div className="landing-v2-nav-actions">
                        <button 
                            type="button" 
                            className="landing-v2-btn-join-code"
                            onClick={() => navigate('/join')}
                            title="Ingresar con código de invitación de clase"
                        >
                            <Key size={15} />
                            <span>Tengo un Código</span>
                        </button>

                        <button 
                            type="button" 
                            className="landing-v2-btn-login"
                            onClick={() => navigate('/login')}
                        >
                            <span>Ingresar</span>
                            <ArrowRight size={15} />
                        </button>
                    </div>
                </div>
            </header>

            {/* ── 2. HERO PRINCIPAL ("THE LIVING STEAM CAMPUS") ── */}
            <section className="landing-v2-hero">
                <div className="landing-v2-hero-content">
                    <div className="landing-v2-pill-announcement">
                        <Sparkles size={14} className="sparkle-icon" />
                        <span>Plataforma Educativa Interactiva 2026</span>
                        <div className="live-status-dot"></div>
                    </div>

                    <h1 className="landing-v2-hero-title">
                        Revoluciona tu forma de aprender <br />
                        <span className="hero-gradient-text">creando y experimentando en vivo.</span>
                    </h1>

                    <p className="landing-v2-hero-subtitle">
                        El primer campus virtual con <strong>física de circuitos interactiva</strong>, motor <strong>WebGL 3D compatible con Blender 4.x</strong>, firmware de robótica y <strong>tutores de Inteligencia Artificial especializados</strong> para cada disciplina técnica.
                    </p>

                    <div className="landing-v2-hero-cta-group">
                        <button 
                            type="button" 
                            className="landing-v2-cta-primary"
                            onClick={() => navigate('/login')}
                        >
                            <span>Comenzar a Aprender Gratis</span>
                            <ArrowRight size={18} />
                        </button>

                        <button 
                            type="button" 
                            className="landing-v2-cta-secondary"
                            onClick={() => navigate('/join')}
                        >
                            <Key size={16} />
                            <span>Unirme a mi Grupo con Código</span>
                        </button>
                    </div>

                    {/* Telemetría rápida del campus */}
                    <div className="landing-v2-stats-strip">
                        <div className="stat-item">
                            <span className="stat-num">+4</span>
                            <span className="stat-label">Cursos STEAM Oficiales</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-num">100%</span>
                            <span className="stat-label">Simuladores Físicos en Vivo</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-num">4 Bots</span>
                            <span className="stat-label">Tutores IA 24/7 Contextuales</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-num">0 ms</span>
                            <span className="stat-label">Instalación (Todo en Navegador)</span>
                        </div>
                    </div>
                </div>

                {/* ── 3. EL LABORATORIO INTERACTIVO VIVO (SHOWCASE CENTRAL) ── */}
                <div id="laboratorios" className="landing-v2-showcase-wrapper">
                    <div className="landing-v2-showcase-card glass-panel">
                        {/* Selector superior de pestañas del laboratorio */}
                        <div className="showcase-tabs-bar">
                            <button 
                                type="button" 
                                className={`showcase-tab-btn ${activeTab === 'ee' ? 'active tab-ee' : ''}`}
                                onClick={() => setActiveTab('ee')}
                            >
                                <Zap size={16} />
                                <span>Electricidad SVG</span>
                            </button>

                            <button 
                                type="button" 
                                className={`showcase-tab-btn ${activeTab === 're' ? 'active tab-re' : ''}`}
                                onClick={() => setActiveTab('re')}
                            >
                                <Bot size={16} />
                                <span>Robótica C++</span>
                            </button>

                            <button 
                                type="button" 
                                className={`showcase-tab-btn ${activeTab === 'ma' ? 'active tab-ma' : ''}`}
                                onClick={() => setActiveTab('ma')}
                            >
                                <Box size={16} />
                                <span>Espacio 3D Blender</span>
                            </button>

                            <button 
                                type="button" 
                                className={`showcase-tab-btn ${activeTab === 'simi' ? 'active tab-simi' : ''}`}
                                onClick={() => setActiveTab('simi')}
                            >
                                <Printer size={16} />
                                <span>Semillero SIMI3D</span>
                            </button>
                        </div>

                        {/* Contenido dinámico del showcase según la pestaña activa */}
                        <div className="showcase-viewport">
                            {/* PESTAÑA 1: ELECTRICIDAD Y ELECTRÓNICA */}
                            {activeTab === 'ee' && (
                                <div className="showcase-content-ee animate-fade-in">
                                    <div className="showcase-sub-header">
                                        <div className="sub-header-title">
                                            <span className="badge-tech">Simulador Físico Reactivo</span>
                                            <h4>Circuito Mixto con Animación de Electrones</h4>
                                        </div>
                                        <button 
                                            type="button" 
                                            className="interactive-hint"
                                            style={{ cursor: 'pointer', background: isSwitchClosed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: `1px solid ${isSwitchClosed ? '#10b981' : '#ef4444'}` }}
                                            onClick={() => setIsSwitchClosed(prev => !prev)}
                                        >
                                            <Sparkles size={14} color={isSwitchClosed ? '#10b981' : '#ef4444'} />
                                            <span style={{ color: '#fff', fontWeight: 600 }}>Interruptor: <strong style={{ color: isSwitchClosed ? '#34d399' : '#f87171' }}>{isSwitchClosed ? 'CERRADO (ON)' : 'ABIERTO (OFF)'}</strong></span>
                                            <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>(Clic aquí o en el circuito)</span>
                                        </button>
                                    </div>

                                    {/* Gráfico SVG reactivo del circuito */}
                                    <div className="circuit-svg-container">
                                        <svg viewBox="0 0 540 220" className="circuit-svg">
                                            {/* Rieles y cables conductores */}
                                            <path d="M 60 110 L 60 40 L 480 40 L 480 180 L 60 180 L 60 110" 
                                                  stroke={isSwitchClosed ? '#38bdf8' : '#64748b'} 
                                                  strokeWidth="3" 
                                                  fill="none" 
                                                  strokeDasharray={isSwitchClosed ? '8 4' : 'none'}
                                                  className={isSwitchClosed ? 'cable-electrons-anim' : ''}
                                            />

                                            {/* Batería DC (Fuente 12V) */}
                                            <g transform="translate(60, 110)">
                                                <rect x="-24" y="-20" width="48" height="40" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                                                <text x="0" y="-4" fill="#38bdf8" fontSize="12" fontWeight="800" textAnchor="middle">12V DC</text>
                                                <text x="0" y="12" fill="#94a3b8" fontSize="9" textAnchor="middle">Fuente</text>
                                            </g>

                                            {/* Interruptor interactivo clicable */}
                                            <g transform="translate(180, 40)" 
                                               style={{ cursor: 'pointer' }}
                                               onClick={() => setIsSwitchClosed(prev => !prev)}
                                            >
                                                {/* Hitbox amplio y transparente */}
                                                <rect x="-35" y="-35" width="70" height="70" fill="transparent" />
                                                <circle cx="0" cy="0" r="18" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="1.5" />
                                                <circle cx="-14" cy="0" r="4" fill="#38bdf8" />
                                                <circle cx="14" cy="0" r="4" fill="#38bdf8" />
                                                {/* Brazo del interruptor */}
                                                <line 
                                                    x1="-14" y1="0" 
                                                    x2={isSwitchClosed ? "14" : "10"} 
                                                    y2={isSwitchClosed ? "0" : "-16"} 
                                                    stroke="#f59e0b" 
                                                    strokeWidth="3.5" 
                                                    strokeLinecap="round" 
                                                />
                                                <text x="0" y="-24" fill={isSwitchClosed ? "#10b981" : "#ef4444"} fontSize="10" fontWeight="700" textAnchor="middle">
                                                    {isSwitchClosed ? "Cerrado (ON)" : "Abierto (OFF)"}
                                                </text>
                                            </g>

                                            {/* Carga 1: Resistor R1 */}
                                            <g transform="translate(320, 40)">
                                                <rect x="-30" y="-14" width="60" height="28" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                                                <text x="0" y="4" fill="#fff" fontSize="11" fontWeight="700" textAnchor="middle">R1: 10 Ω</text>
                                            </g>

                                            {/* Carga 2: Bombilla con resplandor reactivo */}
                                            <g transform="translate(480, 110)">
                                                {/* Halo de luz dinámico */}
                                                {isSwitchClosed && (
                                                    <circle cx="0" cy="0" r="38" fill="radial-gradient(circle, rgba(251,191,36,0.5) 0%, rgba(251,191,36,0) 75%)" className="bulb-glow-halo" />
                                                )}
                                                <circle cx="0" cy="0" r="22" fill={isSwitchClosed ? '#fef08a' : '#334155'} stroke={isSwitchClosed ? '#f59e0b' : '#64748b'} strokeWidth="2.5" />
                                                {/* Filamento */}
                                                <path d="M -8 6 Q 0 -12 8 6" stroke={isSwitchClosed ? '#d97706' : '#64748b'} strokeWidth="2" fill="none" />
                                                <text x="0" y="38" fill={isSwitchClosed ? '#f59e0b' : '#94a3b8'} fontSize="11" fontWeight="700" textAnchor="middle">
                                                    Lámpara
                                                </text>
                                            </g>
                                        </svg>
                                    </div>

                                    {/* Barra de telemetría de instrumentos en vivo */}
                                    <div className="telemetry-bar">
                                        <div className="telemetry-box">
                                            <span className="telemetry-label">Voltaje Total (VT)</span>
                                            <span className="telemetry-val val-volt">12.00 V</span>
                                        </div>
                                        <div className="telemetry-box">
                                            <span className="telemetry-label">Corriente de Malla (IT)</span>
                                            <span className="telemetry-val val-amp">{isSwitchClosed ? '0.60 A' : '0.00 A'}</span>
                                        </div>
                                        <div className="telemetry-box">
                                            <span className="telemetry-label">Potencia Disipada (PT)</span>
                                            <span className="telemetry-val val-watt">{isSwitchClosed ? '7.20 W' : '0.00 W'}</span>
                                        </div>
                                        <div className="telemetry-box">
                                            <span className="telemetry-label">Estado del Sistema</span>
                                            <span className={`telemetry-val ${isSwitchClosed ? 'status-closed' : 'status-open'}`}>
                                                {isSwitchClosed ? 'Conducción Activa' : 'Circuito Abierto'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PESTAÑA 2: ROBÓTICA Y PROGRAMACIÓN */}
                            {activeTab === 're' && (
                                <div className="showcase-content-re animate-fade-in">
                                    <div className="showcase-sub-header">
                                        <div className="sub-header-title">
                                            <span className="badge-tech badge-green">Microcontrolador C++</span>
                                            <h4>Firmware de Control y Telemetría Serial</h4>
                                        </div>
                                        <button 
                                            type="button" 
                                            className="action-pill-btn"
                                            onClick={() => setIsRunningArduino(prev => !prev)}
                                        >
                                            {isRunningArduino ? <Pause size={14} /> : <Play size={14} />}
                                            <span>{isRunningArduino ? 'Pausar Ejecución' : 'Reanudar Firmware'}</span>
                                        </button>
                                    </div>

                                    <div className="arduino-split-view">
                                        {/* Editor simulado */}
                                        <div className="code-terminal-box">
                                            <div className="terminal-bar">
                                                <div className="mac-dots">
                                                    <span className="dot dot-red"></span>
                                                    <span className="dot dot-yellow"></span>
                                                    <span className="dot dot-green"></span>
                                                </div>
                                                <span className="terminal-title">control_motor.ino</span>
                                                <span className="lang-tag">Arduino C++</span>
                                            </div>
                                            <pre className="terminal-code">
<code>{`// SaberLab Robotics Core - Misión 1
void setup() {
  pinMode(13, OUTPUT);     // LED_BUILTIN
  pinMode(9, OUTPUT);      // PWM Motor Driver
  Serial.begin(115200);
}

void loop() {
  digitalWrite(13, HIGH);  // Pulso activo
  analogWrite(9, 204);     // 80% Duty Cycle
  delay(1000);
  digitalWrite(13, LOW);
  delay(500);
}`}</code>
                                            </pre>
                                        </div>

                                        {/* Placa y consola serial */}
                                        <div className="board-live-monitor">
                                            <div className="board-header">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Cpu size={18} color="#10b981" />
                                                    <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Placa Uno Rev3</span>
                                                </div>
                                                {/* LED simulado de placa */}
                                                <div className="led-indicator-group">
                                                    <span className="led-name">PIN 13:</span>
                                                    <div className={`led-lamp ${arduinoLedState && isRunningArduino ? 'led-on' : 'led-off'}`}></div>
                                                </div>
                                            </div>

                                            <div className="serial-console-box">
                                                <div className="console-title">
                                                    <Terminal size={13} />
                                                    <span>Monitor Serial (115200 baud)</span>
                                                </div>
                                                <div className="console-body">
                                                    {serialLogs.map((log, i) => (
                                                        <div key={i} className="log-row">
                                                            <span className="log-prompt">&gt;</span>
                                                            <span className="log-text">{log}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PESTAÑA 3: MODELADO Y ANIMACIÓN 3D */}
                            {activeTab === 'ma' && (
                                <div className="showcase-content-ma animate-fade-in">
                                    <div className="showcase-sub-header">
                                        <div className="sub-header-title">
                                            <span className="badge-tech badge-purple">Motor WebGL 3D</span>
                                            <h4>Espacio Cartesiano Euclídeo (Convención Blender 4.x Z-Up)</h4>
                                        </div>
                                        <div className="interactive-hint">
                                            <span className="key-badge">G</span>
                                            <span className="key-badge">R</span>
                                            <span className="key-badge">S</span>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Atajos de Precisión</span>
                                        </div>
                                    </div>

                                    <div className="viewport-3d-demo">
                                        {/* Canvas simulado SVG en 3D Isométrico */}
                                        <div className="canvas-3d-area">
                                            <svg viewBox="-150 -120 300 240" className="svg-3d-space">
                                                {/* Cuadrícula de piso / Grid XY */}
                                                <g stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none">
                                                    {[-80, -40, 0, 40, 80].map(val => (
                                                        <line key={`gx-${val}`} x1="-100" y1={val * 0.5} x2="100" y2={val * 0.5 + 40} />
                                                    ))}
                                                    {[-80, -40, 0, 40, 80].map(val => (
                                                        <line key={`gy-${val}`} x1={val} y1="-30" x2={val * 0.8} y2="60" />
                                                    ))}
                                                </g>

                                                {/* Ejes Cartesiano Blender: X Rojo, Y Verde, Z Azul hacia arriba */}
                                                <line x1="0" y1="20" x2="90" y2="40" stroke="#ef4444" strokeWidth="2.5" />
                                                <text x="96" y="44" fill="#ef4444" fontSize="11" fontWeight="800">X</text>

                                                <line x1="0" y1="20" x2="-80" y2="45" stroke="#22c55e" strokeWidth="2.5" />
                                                <text x="-95" y="50" fill="#22c55e" fontSize="11" fontWeight="800">Y</text>

                                                <line x1="0" y1="20" x2="0" y2="-90" stroke="#38bdf8" strokeWidth="2.5" />
                                                <text x="6" y="-88" fill="#38bdf8" fontSize="11" fontWeight="800">Z (Up)</text>

                                                {/* Cubo Primitivo 3D Isométrico con rotación reactiva */}
                                                <g transform={`rotate(${rotAngle * 0.15})`}>
                                                    {current3DMode === 'solid' ? (
                                                        <>
                                                            {/* Cara superior */}
                                                            <polygon points="0,-40 40,-60 0,-80 -40,-60" fill="rgba(99, 102, 241, 0.7)" stroke="#818cf8" strokeWidth="1.5" />
                                                            {/* Cara derecha */}
                                                            <polygon points="0,-40 40,-60 40,-20 0,0" fill="rgba(79, 70, 229, 0.85)" stroke="#818cf8" strokeWidth="1.5" />
                                                            {/* Cara izquierda */}
                                                            <polygon points="0,-40 -40,-60 -40,-20 0,0" fill="rgba(67, 56, 202, 0.95)" stroke="#818cf8" strokeWidth="1.5" />
                                                        </>
                                                    ) : (
                                                        /* Modo Wireframe */
                                                        <g stroke="#38bdf8" strokeWidth="1.5" fill="none">
                                                            <polygon points="0,-40 40,-60 0,-80 -40,-60" />
                                                            <polygon points="0,-40 40,-60 40,-20 0,0" />
                                                            <polygon points="0,-40 -40,-60 -40,-20 0,0" />
                                                            <line x1="0" y1="-80" x2="0" y2="-40" strokeDasharray="3 3" />
                                                        </g>
                                                    )}
                                                    {/* Punto de origen naranja de Blender */}
                                                    <circle cx="0" cy="-40" r="3" fill="#f97316" />
                                                </g>
                                            </svg>

                                            {/* Controles flotantes del viewport */}
                                            <div className="viewport-overlay-controls">
                                                <button 
                                                    type="button" 
                                                    className={`view-mode-pill ${current3DMode === 'solid' ? 'active' : ''}`}
                                                    onClick={() => setCurrent3DMode('solid')}
                                                >
                                                    Sólido
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className={`view-mode-pill ${current3DMode === 'wire' ? 'active' : ''}`}
                                                    onClick={() => setCurrent3DMode('wire')}
                                                >
                                                    Malla (Wireframe)
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="view-mode-pill"
                                                    onClick={() => setIsAutoRotate(prev => !prev)}
                                                >
                                                    {isAutoRotate ? 'Pausar Giro' : 'Auto-Giro'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PESTAÑA 4: SEMILLERO SIMI3D */}
                            {activeTab === 'simi' && (
                                <div className="showcase-content-simi animate-fade-in">
                                    <div className="showcase-sub-header">
                                        <div className="sub-header-title">
                                            <span className="badge-tech badge-cyan">Manufactura Aditiva FDM & SLA</span>
                                            <h4>Preparación en Slicer y Parámetros Térmicos</h4>
                                        </div>
                                        <div className="material-selector-strip">
                                            {['PLA', 'PETG', 'TPU'].map(mat => (
                                                <button
                                                    key={mat}
                                                    type="button"
                                                    className={`mat-btn ${selectedMaterial === mat ? 'active' : ''}`}
                                                    onClick={() => handleMaterialChange(mat)}
                                                >
                                                    {mat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="simi-showcase-grid">
                                        {/* Telemetría de Boquilla y Cama */}
                                        <div className="extrusion-telemetry-panel">
                                            <div className="printer-gauge">
                                                <div className="gauge-icon-box">
                                                    <Flame size={20} color="#f97316" />
                                                </div>
                                                <div>
                                                    <span className="gauge-title">Boquilla (Nozzle 0.4mm)</span>
                                                    <div className="gauge-value">{nozzleTemp} °C</div>
                                                </div>
                                            </div>

                                            <div className="printer-gauge">
                                                <div className="gauge-icon-box">
                                                    <Layers size={20} color="#06b6d4" />
                                                </div>
                                                <div>
                                                    <span className="gauge-title">Cama Caliente (Bed)</span>
                                                    <div className="gauge-value">{bedTemp} °C</div>
                                                </div>
                                            </div>

                                            <div className="printer-gauge">
                                                <div className="gauge-icon-box">
                                                    <Sliders size={20} color="#10b981" />
                                                </div>
                                                <div>
                                                    <span className="gauge-title">Altura de Capa</span>
                                                    <div className="gauge-value">0.20 mm (Standard)</div>
                                                </div>
                                            </div>

                                            {/* Barra de progreso de impresión */}
                                            <div className="print-progress-box">
                                                <div className="progress-labels">
                                                    <span>Progreso de Impresión:</span>
                                                    <span className="progress-percent">{printProgress}%</span>
                                                </div>
                                                <div className="progress-track">
                                                    <div className="progress-fill" style={{ width: `${printProgress}%` }}></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Vista de modelo en rebanador (Slicer Layer View) */}
                                        <div className="slicer-preview-card">
                                            <div className="slicer-canvas-mock">
                                                <div className="nozzle-head-animated">
                                                    <div className="nozzle-tip"></div>
                                                    <div className="nozzle-glow"></div>
                                                </div>
                                                <div className="layer-lines-visual">
                                                    <div className="layer-line line-1"></div>
                                                    <div className="layer-line line-2"></div>
                                                    <div className="layer-line line-3"></div>
                                                    <div className="layer-line line-4"></div>
                                                </div>
                                                <span className="slicer-status-tag">Capa 142 de 210</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 4. SECCIÓN: LAS 4 CARRERAS Y ESPECIALIDADES STEAM ── */}
            <section id="carreras" className="landing-v2-section">
                <div className="section-header-center">
                    <span className="section-eyebrow">Formación Tecnológica Integral</span>
                    <h2 className="section-main-title">Cuatro Rutas de Aprendizaje Práctico</h2>
                    <p className="section-subtitle">
                        Diseñadas bajo el modelo pedagógico <strong>Aprender Haciendo</strong>, con retos basados en problemas reales y persistencia en la nube.
                    </p>
                </div>

                <div className="courses-grid-cards">
                    {/* Curso 1: Electricidad y Electrónica */}
                    <div className="course-hub-card card-ee">
                        <div className="card-top-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                            <Zap size={28} />
                        </div>
                        <span className="course-code-badge badge-ee">EE-M1 a M4</span>
                        <h3 className="course-card-title">Electricidad y Electrónica Básica</h3>
                        <p className="course-card-desc">
                            Domina la teoría atómica, leyes de Ohm y Watt, mallas mixtas serie-paralelo, caída de tensión y potencia con calculadoras reductoras paso a paso.
                        </p>
                        <ul className="course-card-features">
                            <li><Check size={14} color="#38bdf8" /> 16 Lecciones con laboratorios interactivos</li>
                            <li><Check size={14} color="#38bdf8" /> Multímetro y código de colores integrado</li>
                            <li><Check size={14} color="#38bdf8" /> Retos esquemáticos de detección de fallas</li>
                        </ul>
                        <button type="button" className="course-btn-explore" onClick={() => navigate('/login')}>
                            <span>Ver Temario del Curso</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Curso 2: Robótica Educativa */}
                    <div className="course-hub-card card-re">
                        <div className="card-top-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                            <Bot size={28} />
                        </div>
                        <span className="course-code-badge badge-re">RE-2026</span>
                        <h3 className="course-card-title">Robótica Educativa & Microcontroladores</h3>
                        <p className="course-card-desc">
                            Programa microcontroladores en C++, manipula sensores analógicos y digitales, servomotores y protocolos de comunicación serial interactivos.
                        </p>
                        <ul className="course-card-features">
                            <li><Check size={14} color="#10b981" /> IDE virtual integrado en el navegador</li>
                            <li><Check size={14} color="#10b981" /> Depuración en tiempo real de firmware</li>
                            <li><Check size={14} color="#10b981" /> Misiones lógicas guiadas paso a paso</li>
                        </ul>
                        <button type="button" className="course-btn-explore" onClick={() => navigate('/login')}>
                            <span>Ver Temario del Curso</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Curso 3: Modelado 3D */}
                    <div className="course-hub-card card-ma">
                        <div className="card-top-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                            <Box size={28} />
                        </div>
                        <span className="course-code-badge badge-ma">MA-M1 a M4</span>
                        <h3 className="course-card-title">Modelado y Animación 3D (Blender)</h3>
                        <p className="course-card-desc">
                            Aprende la convención espacial Z-Up de la industria, primitivas geométricas, transformaciones de precisión (G, R, S) y topología poligonal limpia.
                        </p>
                        <ul className="course-card-features">
                            <li><Check size={14} color="#818cf8" /> Viewport 3D WebGL idéntico a Blender 4.x</li>
                            <li><Check size={14} color="#818cf8" /> Espacio cartesiano euclidiano interactivo</li>
                            <li><Check size={14} color="#818cf8" /> Evaluaciones con proyectos renderizados</li>
                        </ul>
                        <button type="button" className="course-btn-explore" onClick={() => navigate('/login')}>
                            <span>Ver Temario del Curso</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Curso 4: Semillero SIMI3D */}
                    <div className="course-hub-card card-simi">
                        <div className="card-top-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                            <Printer size={28} />
                        </div>
                        <span className="course-code-badge badge-simi">SIMI3D Hub</span>
                        <h3 className="course-card-title">Semillero de Investigación en 3D</h3>
                        <p className="course-card-desc">
                            Manufactura aditiva avanzada: calibración de impresoras FDM y SLA, optimización en Cura y OrcaSlicer, visitas a colegios y banco de proyectos CAD.
                        </p>
                        <ul className="course-card-features">
                            <li><Check size={14} color="#06b6d4" /> 8 Rutas formativas no lineales</li>
                            <li><Check size={14} color="#06b6d4" /> Banco de Proyectos con IDs SIMI####</li>
                            <li><Check size={14} color="#06b6d4" /> Rol exclusivo "Líder de Semillero"</li>
                        </ul>
                        <button type="button" className="course-btn-explore" onClick={() => navigate('/login')}>
                            <span>Explorar Espacio SIMI</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ── 5. SECCIÓN: SUITE DE LOS 4 TUTORES IA ESPECIALIZADOS ── */}
            <section id="tutores-ia" className="landing-v2-section bg-alt-section">
                <div className="section-header-center">
                    <span className="section-eyebrow eyebrow-purple">Inteligencia Artificial Pedagógica</span>
                    <h2 className="section-main-title">Conoce a tus 4 Asistentes Especializados</h2>
                    <p className="section-subtitle">
                        Nuestros tutores no hacen la tarea por ti: emplean el <strong>método socrático</strong> para orientarte con fórmulas limpias en UTF-8 y acompañar tu proceso de aprendizaje paso a paso.
                    </p>
                </div>

                <div className="ai-tutors-grid">
                    {/* Bot 1: ElectroBot */}
                    <div className="ai-tutor-card">
                        <div className="ai-avatar-box bot-ee">
                            <Zap size={32} />
                            <span className="pulse-ai-glow"></span>
                        </div>
                        <h4 className="ai-name">ElectroBot ⚡</h4>
                        <span className="ai-role-tag">Tutor de Circuitos & Física</span>
                        <p className="ai-desc">
                            Te ayuda a despejar la Ley de Ohm, calcular resistencias equivalentes y comprender el flujo de corriente sin darte la solución directa.
                        </p>
                        <div className="ai-sample-badge">"¿Qué sucede con la corriente si duplicamos la resistencia manteniendo el voltaje constante?"</div>
                    </div>

                    {/* Bot 2: RoboBot */}
                    <div className="ai-tutor-card">
                        <div className="ai-avatar-box bot-re">
                            <Bot size={32} />
                            <span className="pulse-ai-glow"></span>
                        </div>
                        <h4 className="ai-name">RoboBot 🤖</h4>
                        <span className="ai-role-tag">Tutor de Robótica & C++</span>
                        <p className="ai-desc">
                            Detecta errores de sintaxis en tus sketches de Arduino, te explica cómo modular una señal PWM y cómo conectar sensores analógicos.
                        </p>
                        <div className="ai-sample-badge">"Recuerda que analogRead() devuelve valores de 0 a 1023. ¿Cómo escalarías eso a 0-255?"</div>
                    </div>

                    {/* Bot 3: TridiBot */}
                    <div className="ai-tutor-card">
                        <div className="ai-avatar-box bot-ma">
                            <Box size={32} />
                            <span className="pulse-ai-glow"></span>
                        </div>
                        <h4 className="ai-name">TridiBot 🧊</h4>
                        <span className="ai-role-tag">Tutor de Modelado 3D</span>
                        <p className="ai-desc">
                            Domina los atajos de teclado de Blender 4.x, normaliza caras invertidas y optimiza la topología de tus personajes poligonales.
                        </p>
                        <div className="ai-sample-badge">"Para bloquear la escala al plano del piso en Blender, presiona S y luego Shift+Z."</div>
                    </div>

                    {/* Bot 4: ImpriBot */}
                    <div className="ai-tutor-card">
                        <div className="ai-avatar-box bot-simi">
                            <Printer size={32} />
                            <span className="pulse-ai-glow"></span>
                        </div>
                        <h4 className="ai-name">ImpriBot 🖨️</h4>
                        <span className="ai-role-tag">Tutor de Manufactura Aditiva</span>
                        <p className="ai-desc">
                            Recomienda temperaturas de boquilla, velocidades de retracción y soluciona problemas de warping, stringing o patas de elefante.
                        </p>
                        <div className="ai-sample-badge">"Para evitar hilos con filamento PETG, baja la temperatura a 235°C y activa z-hop."</div>
                    </div>
                </div>
            </section>

            {/* ── 6. SECCIÓN: EVALUACIONES SEGURAS & MONITOREO EN VIVO ── */}
            <section id="evaluaciones" className="landing-v2-section">
                <div className="proctoring-banner glass-panel">
                    <div className="proctoring-content">
                        <div className="pill-secure">
                            <ShieldCheck size={16} color="#10b981" />
                            <span>Protocolo Anti-Copia & Proctoring</span>
                        </div>
                        <h3 className="proctoring-title">
                            Exámenes Oficiales con Monitoreo Docente en Vivo
                        </h3>
                        <p className="proctoring-desc">
                            Evaluaciones seguras con pantalla completa obligatoria, aleatorización completa de preguntas, detección de cambio de pestañas con sistema de strikes y sala de espera interactiva <strong>(Live Lobby)</strong> para el docente.
                        </p>
                        <div className="proctoring-features-list">
                            <div className="feat-chip"><CheckCircle2 size={15} color="#10b981" /> Persistencia de temporizador en D1</div>
                            <div className="feat-chip"><CheckCircle2 size={15} color="#10b981" /> Protección de solucionario hasta entrega</div>
                            <div className="feat-chip"><CheckCircle2 size={15} color="#10b981" /> Marcado de reactivos dudosos 🚩</div>
                        </div>
                    </div>
                    <div className="proctoring-visual">
                        <div className="lobby-preview-box">
                            <div className="lobby-header-bar">
                                <span className="lobby-dot"></span>
                                <span className="lobby-text">SALA EN VIVO — RE-2026II</span>
                                <span className="lobby-count">21 Alumnos</span>
                            </div>
                            <div className="lobby-students-mini">
                                <div className="student-pill"><span className="st-dot"></span> Pedro Vergara</div>
                                <div className="student-pill"><span className="st-dot"></span> Ana Camacho</div>
                                <div className="student-pill"><span className="st-dot"></span> Carlos Martinez</div>
                                <div className="student-pill"><span className="st-dot"></span> Daniel Barros</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 7. BANNER FINAL DE LLAMADO A LA ACCIÓN ── */}
            <section className="landing-v2-final-cta">
                <div className="final-cta-card glass-panel">
                    <div className="cta-icon-glow">
                        <GraduationCap size={44} color="#fff" />
                    </div>
                    <h2 className="final-cta-title">¿Listo para unirte a la nueva era STEAM?</h2>
                    <p className="final-cta-subtitle">
                        Si tu docente te compartió un enlace o código de invitación, puedes ingresar inmediatamente. O accede con tu cuenta institucional para explorar el campus.
                    </p>
                    <div className="final-cta-buttons">
                        <button type="button" className="btn-final-primary" onClick={() => navigate('/login')}>
                            <span>Ingresar con Google</span>
                            <ArrowRight size={18} />
                        </button>
                        <button type="button" className="btn-final-secondary" onClick={() => navigate('/join')}>
                            <Key size={18} />
                            <span>Canjear Código de Grupo</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* ── 8. FOOTER INSTITUCIONAL COMPLETO ── */}
            <footer className="landing-v2-footer">
                <div className="footer-top-grid">
                    <div className="footer-col-brand">
                        <div className="landing-v2-brand">
                            <img src="https://i.postimg.cc/KY1FZC3G/Logo_Nuevo.png" alt="SaberLab" className="landing-v2-logo-img" />
                            <span className="brand-name">SaberLab</span>
                        </div>
                        <p className="footer-tagline">
                            Plataforma educativa interactiva y gamificada orientada a la enseñanza de electricidad, electrónica, robótica, modelado 3D y programación.
                        </p>
                        <div className="footer-social-links">
                            <a href="https://instagram.com/semillero_simi3d" target="_blank" rel="noopener noreferrer" className="social-pill">
                                <span>📸 @semillero_simi3d</span>
                            </a>
                        </div>
                    </div>

                    <div className="footer-col-nav">
                        <h5>Cursos STEAM</h5>
                        <a href="#carreras" onClick={() => navigate('/login')}>Electricidad y Electrónica</a>
                        <a href="#carreras" onClick={() => navigate('/login')}>Robótica Educativa</a>
                        <a href="#carreras" onClick={() => navigate('/login')}>Modelado y Animación 3D</a>
                        <a href="#carreras" onClick={() => navigate('/login')}>Semillero SIMI3D</a>
                    </div>

                    <div className="footer-col-nav">
                        <h5>Plataforma</h5>
                        <a href="#laboratorios">Laboratorios Físicos</a>
                        <a href="#tutores-ia">Tutores Inteligentes</a>
                        <a href="#evaluaciones">Exámenes Supervisados</a>
                        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/join')}>Unirse con Código</span>
                    </div>

                    <div className="footer-col-nav">
                        <h5>Institucional</h5>
                        <a href="#contacto" onClick={() => window.open('https://api.whatsapp.com/send?text=Hola%20SaberLab', '_blank')}>Contacto Docente</a>
                        <span>Universidad del Magdalena</span>
                        <span>Santa Marta, Colombia</span>
                    </div>
                </div>

                <div className="footer-bottom-bar">
                    <p>© {new Date().getFullYear()} SaberLab Edu. Diseñado para los líderes tecnológicos del mañana.</p>
                    <div className="footer-legal-links">
                        <span onClick={() => navigate('/login')}>Acceso Docente</span>
                        <span>•</span>
                        <span onClick={() => navigate('/join')}>Acceso Estudiante</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

