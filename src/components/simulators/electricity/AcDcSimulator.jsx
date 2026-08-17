import { useState, useEffect } from 'react';
import { Battery, Zap, Activity, Compass, Cpu, Plug } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

export default function AcDcSimulator() {
    const [mode, setMode] = useState('dc');
    const [scopePhase, setScopePhase] = useState(0);

    // Animación continua del osciloscopio
    useEffect(() => {
        let frameId;
        const animate = () => {
            setScopePhase(prev => (prev + 0.08) % (Math.PI * 2));
            frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, []);

    // Trayectoria del circuito DC completa
    // Sale del polo negativo (−) en (55, 80) -> va a (20, 80) -> sube a (20, 25) -> pasa por bombilla (130, 25) -> baja por (240, 25) a (240, 80) -> entra al polo positivo (+) en (205, 80)
    const dcLoopPath = "M 55 80 L 20 80 L 20 25 L 240 25 L 240 80 L 205 80";

    // Generador de puntos de la onda senoidal para el osciloscopio AC
    const generateAcWave = () => {
        let d = "M 15 22";
        for (let x = 15; x <= 245; x += 4) {
            const y = 22 + Math.sin((x * 0.08) - scopePhase * 2) * 15;
            d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        return d;
    };

    return (
        <div className="sim-card">
            <div className="sim-card-header">
                <h3>⚡ Comparativa Interactiva: DC vs. AC</h3>
                <p>Alterna entre ambos tipos para observar el movimiento real de los electrones y su forma de onda</p>
            </div>

            <div className="sim-card-body">
                {/* Selector de Modo */}
                <div className="circuit-sim-tabs" style={{ marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <button
                        className={`circuit-sim-tab ${mode === 'dc' ? 'active' : ''}`}
                        style={{ justifyContent: 'center', padding: '0.65rem 1rem', fontSize: '0.88rem' }}
                        onClick={() => setMode('dc')}
                    >
                        🔋 Corriente Continua (DC)
                    </button>
                    <button
                        className={`circuit-sim-tab ${mode === 'ac' ? 'active' : ''}`}
                        style={{ justifyContent: 'center', padding: '0.65rem 1rem', fontSize: '0.88rem' }}
                        onClick={() => setMode('ac')}
                    >
                        ⚡ Corriente Alterna (AC)
                    </button>
                </div>

                <div className="sim-grid-2" style={{ alignItems: 'stretch' }}>
                    {/* Visualización Izquierda: Circuito + Osciloscopio */}
                    <div className="sim-visual" style={{ minHeight: '280px', padding: '0.75rem', flexDirection: 'column', gap: '0.75rem', justifyContent: 'space-between' }}>
                        {/* 1. Circuito en movimiento */}
                        <svg viewBox="0 0 260 115" width="100%" height="135" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <filter id="acdcGlow" x="-40%" y="-40%" width="180%" height="180%">
                                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                <radialGradient id="bulbGlowAcDc" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#fef08a" />
                                    <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                                </radialGradient>
                                <linearGradient id="dcBatGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#0f172a" />
                                    <stop offset="50%" stopColor="#1e293b" />
                                    <stop offset="100%" stopColor="#0f172a" />
                                </linearGradient>
                            </defs>

                            {/* ── CABLES PRINCIPALES (100% Conectados a los Bornes) ── */}
                            {mode === 'dc' ? (
                                /* Cable DC: desde los bornes de la batería */
                                <path
                                    d={dcLoopPath}
                                    fill="none"
                                    stroke="#475569"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            ) : (
                                /* Cables AC: desde las conexiones del generador (110,80) y (150,80) */
                                <>
                                    <path
                                        d="M 110 80 L 20 80 L 20 25 L 240 25 L 240 80 L 150 80"
                                        fill="none"
                                        stroke="#475569"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </>
                            )}

                            {/* ── FUENTE DE ENERGÍA ── */}
                            {mode === 'dc' ? (
                                /* BATERÍA DC (Perfectamente conectada de x=55 a x=205) */
                                <g id="dc-source">
                                    {/* Cuerpo de la Batería */}
                                    <rect x="55" y="66" width="150" height="28" rx="5" fill="url(#dcBatGrad)" stroke="#475569" strokeWidth="1.2" />
                                    
                                    {/* Borne Negativo Cátodo (Izquierda - Azul) */}
                                    <rect x="51" y="72" width="6" height="16" rx="1.5" fill="#38bdf8" />
                                    <text x="70" y="84" fill="#38bdf8" fontSize="13" fontWeight="900" textAnchor="middle">−</text>
                                    <text x="70" y="104" fill="#38bdf8" fontSize="7.5" fontWeight="bold" textAnchor="middle">Cátodo (−)</text>

                                    {/* Borne Positivo Ánodo (Derecha - Rojo con relieve) */}
                                    <rect x="203" y="72" width="6" height="16" rx="1.5" fill="#ef4444" />
                                    <rect x="208" y="75" width="3" height="10" rx="1" fill="#f87171" />
                                    <text x="190" y="84" fill="#f87171" fontSize="13" fontWeight="900" textAnchor="middle">+</text>
                                    <text x="190" y="104" fill="#f87171" fontSize="7.5" fontWeight="bold" textAnchor="middle">Ánodo (+)</text>

                                    {/* Etiqueta central */}
                                    <text x="130" y="83" fill="#fbbf24" fontSize="8.5" fontWeight="bold" textAnchor="middle">BATERÍA DC (Constante)</text>
                                </g>
                            ) : (
                                /* GENERADOR AC (Conectado en x=110 y x=150 a y=80) */
                                <g id="ac-source">
                                    {/* Carcasa del generador */}
                                    <circle cx="130" cy="80" r="20" fill="#0f172a" stroke="#fbbf24" strokeWidth="2" />
                                    {/* Terminales de conexión laterales */}
                                    <circle cx="110" cy="80" r="3.5" fill="#fbbf24" />
                                    <circle cx="150" cy="80" r="3.5" fill="#fbbf24" />
                                    {/* Símbolo senoidal ~ */}
                                    <path d="M 120 80 Q 125 72 130 80 T 140 80" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
                                    <text x="130" y="107" fill="#fbbf24" fontSize="8" fontWeight="bold" textAnchor="middle">GENERADOR AC (50/60 Hz)</text>
                                </g>
                            )}

                            {/* ── CARGA / BOMBILLA ILUMINADA ── */}
                            <g id="bulb" transform="translate(130, 25)">
                                <circle cx="0" cy="0" r="20" fill="url(#bulbGlowAcDc)" />
                                <circle cx="0" cy="0" r="11" fill="rgba(254, 240, 138, 0.35)" stroke="#fbbf24" strokeWidth="1.5" />
                                <path d="M -4 4 L -2 -3 L 0 3 L 2 -3 L 4 4" fill="none" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" />
                                <text x="0" y="-15" fill="#fbbf24" fontSize="7.5" fontWeight="bold" textAnchor="middle">💡 Carga (Bombilla)</text>
                            </g>

                            {/* ── MOVIMIENTO DE ELECTRONES DC (Flujo Continuo de − a +) ── */}
                            {mode === 'dc' && (
                                <>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <circle key={`dc-${i}`} r="3.8" fill="#38bdf8" filter="url(#acdcGlow)">
                                            <animateMotion
                                                dur="2.4s"
                                                repeatCount="indefinite"
                                                begin={`-${i * (2.4 / 9)}s`}
                                                path={dcLoopPath}
                                            />
                                        </circle>
                                    ))}
                                    <text x="130" y="46" textAnchor="middle" fill="#38bdf8" fontSize="7.5" fontWeight="bold">
                                        ◀ Flujo Continuo: electrones viajan siempre de (−) a (+)
                                    </text>
                                </>
                            )}

                            {/* ── MOVIMIENTO DE ELECTRONES AC (Oscilación Armónica en Vaivén) ── */}
                            {mode === 'ac' && (
                                <>
                                    {/* Cable Superior Horizontal (10 Electrones: 5 a la izquierda y 5 a la derecha de la bombilla) */}
                                    {[30, 50, 70, 90, 110, 150, 170, 190, 210, 230].map((baseX, idx) => (
                                        <circle
                                            key={`ac-top-${idx}`}
                                            cx={baseX + Math.sin(scopePhase * 2) * 10}
                                            cy={25}
                                            r="3.8"
                                            fill="#38bdf8"
                                            filter="url(#acdcGlow)"
                                        />
                                    ))}

                                    {/* Cable Izquierdo Vertical (Oscilación en Y coherente con el circuito) */}
                                    {[45, 65].map((baseY, idx) => (
                                        <circle
                                            key={`ac-left-${idx}`}
                                            cx={20}
                                            cy={baseY - Math.sin(scopePhase * 2) * 10}
                                            r="3.8"
                                            fill="#38bdf8"
                                            filter="url(#acdcGlow)"
                                        />
                                    ))}

                                    {/* Cable Derecho Vertical (Oscilación en Y coherente con el circuito) */}
                                    {[45, 65].map((baseY, idx) => (
                                        <circle
                                            key={`ac-right-${idx}`}
                                            cx={240}
                                            cy={baseY + Math.sin(scopePhase * 2) * 10}
                                            r="3.8"
                                            fill="#38bdf8"
                                            filter="url(#acdcGlow)"
                                        />
                                    ))}

                                    {/* Cable Inferior Horizontal (8 Electrones: 4 a la izquierda y 4 a la derecha del generador) */}
                                    {[30, 50, 70, 90, 170, 190, 210, 230].map((baseX, idx) => (
                                        <circle
                                            key={`ac-bot-${idx}`}
                                            cx={baseX - Math.sin(scopePhase * 2) * 10}
                                            cy={80}
                                            r="3.8"
                                            fill="#38bdf8"
                                            filter="url(#acdcGlow)"
                                        />
                                    ))}

                                    <text x="130" y="46" textAnchor="middle" fill="#fbbf24" fontSize="7.5" fontWeight="bold">
                                        ↔ Los electrones vibran adelante y atrás sin avanzar en neto
                                    </text>
                                </>
                            )}
                        </svg>

                        {/* 2. Osciloscopio Digital en Tiempo Real */}
                        <div style={{ width: '100%', background: '#090d16', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '0.5rem 0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                                    <Activity size={14} color={mode === 'dc' ? '#38bdf8' : '#fbbf24'} />
                                    Osciloscopio Digital: Voltaje en el Tiempo V(t)
                                </span>
                                <span style={{ fontSize: '0.68rem', color: mode === 'dc' ? '#38bdf8' : '#fbbf24', fontWeight: 800, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '6px' }}>
                                    {mode === 'dc' ? '0 Hz (Constante)' : '50 / 60 Hz (Onda Senoidal)'}
                                </span>
                            </div>

                            <svg viewBox="0 0 260 45" width="100%" height="45" xmlns="http://www.w3.org/2000/svg">
                                {/* Cuadrícula del osciloscopio */}
                                <line x1="0" y1="22" x2="260" y2="22" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                                <line x1="0" y1="8" x2="260" y2="8" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                                <line x1="0" y1="36" x2="260" y2="36" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                                <text x="5" y="8" fill="#64748b" fontSize="6.5">+V</text>
                                <text x="5" y="21" fill="#64748b" fontSize="6.5">0V</text>
                                <text x="5" y="43" fill="#64748b" fontSize="6.5">-V</text>

                                {/* Trazo animado en tiempo real */}
                                {mode === 'dc' ? (
                                    <g>
                                        <line x1="18" y1="9" x2="255" y2="9" stroke="#38bdf8" strokeWidth="2.5" filter="drop-shadow(0 0 5px #38bdf8)" />
                                        <circle cx={(scopePhase / (Math.PI * 2)) * 230 + 20} cy="9" r="3.5" fill="#f8fafc" filter="drop-shadow(0 0 6px #38bdf8)" />
                                    </g>
                                ) : (
                                    <path
                                        d={generateAcWave()}
                                        fill="none"
                                        stroke="#fbbf24"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        filter="drop-shadow(0 0 5px #fbbf24)"
                                    />
                                )}
                            </svg>
                        </div>
                    </div>

                    {/* Explicación y Ficha Técnica a la Derecha */}
                    <div className="sim-controls" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {/* Cabecera del Modo */}
                        <div style={{
                            background: mode === 'dc' ? 'rgba(56, 189, 248, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                            border: `1px solid ${mode === 'dc' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                            borderRadius: '12px',
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {mode === 'dc' ? <Battery size={20} color="#38bdf8" /> : <Zap size={20} color="#fbbf24" />}
                                <strong style={{ color: mode === 'dc' ? '#38bdf8' : '#fbbf24', fontSize: '0.95rem' }}>
                                    {mode === 'dc' ? 'Corriente Continua (DC)' : 'Corriente Alterna (AC)'}
                                </strong>
                            </div>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: '6px' }}>
                                {mode === 'dc' ? 'Línea Plana' : 'Onda Senoidal'}
                            </span>
                        </div>

                        {/* Puntos Clave */}
                        <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.8rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.6rem 0.8rem', display: 'flex', gap: '0.6rem' }}>
                                <Compass size={16} color={mode === 'dc' ? '#38bdf8' : '#fbbf24'} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <strong style={{ color: '#e2e8f0', display: 'block', marginBottom: '2px' }}>Flujo de Electrones:</strong>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        {mode === 'dc'
                                            ? 'Unidireccional y continuo. Siempre viajan en la misma dirección de polo (−) a polo (+).'
                                            : 'Oscilatorio en vaivén. Los electrones no avanzan en neto, vibran transmitiendo energía por ondas.'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.6rem 0.8rem', display: 'flex', gap: '0.6rem' }}>
                                <Plug size={16} color={mode === 'dc' ? '#38bdf8' : '#fbbf24'} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <strong style={{ color: '#e2e8f0', display: 'block', marginBottom: '2px' }}>Fuentes de Alimentación:</strong>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        {mode === 'dc'
                                            ? 'Pilas AA/AAA, baterías de 9V/12V, paneles solares y puertos USB (5V).'
                                            : 'Red eléctrica pública residencial (120V / 230V) generada en hidroeléctricas y termoeléctricas.'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.6rem 0.8rem', display: 'flex', gap: '0.6rem' }}>
                                <Cpu size={16} color={mode === 'dc' ? '#38bdf8' : '#fbbf24'} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <strong style={{ color: '#e2e8f0', display: 'block', marginBottom: '2px' }}>Aplicación Principal:</strong>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        {mode === 'dc'
                                            ? 'Microcontroladores (Arduino, ESP32), teléfonos, computadoras y sensores.'
                                            : 'Transporte de energía a largas distancias (miles de km) y grandes motores industriales.'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
