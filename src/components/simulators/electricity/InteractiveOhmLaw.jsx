import { useState, useCallback } from 'react';
import { RefreshCw, Zap, AlertTriangle } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

// ── SVG de circuito con partículas animadas ──────────────────────────────────
function CircuitSVG({ voltage, resistance, current, isShortCircuit }) {
    const speed = isShortCircuit ? '0.3s' : resistance < 10 ? '0.6s' : resistance < 50 ? '1.2s' : '2.5s';
    const particleCount = isShortCircuit ? 6 : Math.max(1, Math.round(current * 2));

    const circuitLoop = "M 96 85 L 135 85 L 180 85 L 195 85 L 195 25 L 25 25 L 25 85 L 56 85";

    return (
        <svg viewBox="0 0 220 125" width="100%" height="165" xmlns="http://www.w3.org/2000/svg">
            <defs>
                {/* Gradiente realista de batería */}
                <linearGradient id="batteryBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="30%" stopColor="#1e293b" />
                    <stop offset="70%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="batteryCapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="50%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
                {/* Gradiente de cuerpo cerámico de resistencia */}
                <linearGradient id="resistorBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f3e5c8" />
                    <stop offset="35%" stopColor="#e2ca9c" />
                    <stop offset="80%" stopColor="#cfb280" />
                    <stop offset="100%" stopColor="#bfa67a" />
                </linearGradient>
                {/* Brillo de cables */}
                <linearGradient id="wireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#64748b" />
                    <stop offset="50%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
            </defs>

            {/* ── Cables del circuito (Trazado Continuo y Robusto) ── */}
            <path
                d="M 56 85 L 25 85 L 25 25 L 195 25 L 195 85 L 180 85"
                fill="none"
                stroke="#64748b"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Cable intermedio entre batería y resistencia */}
            <line x1="96" y1="85" x2="135" y2="85" stroke="#64748b" strokeWidth="3.5" strokeLinecap="round" />

            {/* ── BATERÍA REALISTA (Izquierda) ── */}
            <g id="battery-group">
                {/* Cuerpo de la pila (base plana en el negativo) */}
                <rect x="56" y="73" width="36" height="24" rx="3" fill="url(#batteryBodyGrad)" stroke="#64748b" strokeWidth="1" />
                {/* Banda decorativa dorada */}
                <rect x="78" y="73" width="14" height="24" rx="0" fill="#d97706" opacity="0.85" />
                {/* Terminal positivo (+) saliente derecho */}
                <rect x="92" y="79" width="4" height="12" rx="2" fill="url(#batteryCapGrad)" stroke="#64748b" strokeWidth="0.5" />

                {/* Símbolos de polaridad */}
                <text x="63" y="89" fill="#f87171" fontSize="10" fontWeight="900" fontFamily="monospace">−</text>
                <text x="85" y="89" fill="#38bdf8" fontSize="10" fontWeight="900" fontFamily="monospace">+</text>

                {/* Valor de voltaje */}
                <text x="74" y="112" textAnchor="middle" fill="#fbbf24" fontSize="9.5" fontWeight="bold" fontFamily="'Courier New', monospace">
                    {voltage} V
                </text>
            </g>

            {/* ── RESISTENCIA ALARGADA Y ESBELTA (Derecha) ── */}
            <g id="resistor-group">
                {/* Terminales de alambre de la resistencia */}
                <line x1="126" y1="85" x2="135" y2="85" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                <line x1="180" y1="85" x2="189" y2="85" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

                {/* Cuerpo cerámico cilíndrico alargado (45px largo × 16px alto) */}
                <rect x="135" y="77" width="45" height="16" rx="6" fill="url(#resistorBodyGrad)" stroke="#bfa67a" strokeWidth="1" />

                {/* Bandas de colores */}
                <rect x="142" y="77" width="4" height="16" fill="#dc2626" rx="1" />
                <rect x="150" y="77" width="4" height="16" fill="#f97316" rx="1" />
                <rect x="158" y="77" width="4" height="16" fill="#16a34a" rx="1" />
                <rect x="170" y="77" width="3.5" height="16" fill="#d97706" opacity="0.9" rx="1" />

                {/* Valor de resistencia */}
                <text x="157" y="112" textAnchor="middle" fill="#c084fc" fontSize="9.5" fontWeight="bold" fontFamily="'Courier New', monospace">
                    {resistance} Ω
                </text>
            </g>

            {/* ── Partículas / Electrones en movimiento (Azul Cian) ── */}
            {!isShortCircuit && current > 0 && Array.from({ length: Math.min(particleCount, 6) }).map((_, i) => (
                <circle key={i} r="3.5" fill="#38bdf8" opacity="0.95" filter="drop-shadow(0 0 4px #38bdf8)">
                    <animateMotion
                        dur={speed}
                        repeatCount="indefinite"
                        begin={`-${(i / particleCount) * parseFloat(speed)}s`}
                        path={`${circuitLoop} L 96 85`}
                    />
                </circle>
            ))}

            {/* ── Flecha e indicador de Corriente ── */}
            {!isShortCircuit && current > 0 && (
                <g>
                    <rect x="80" y="8" width="60" height="18" rx="6" fill="rgba(15,23,42,0.85)" stroke="rgba(56,189,248,0.4)" strokeWidth="1" />
                    <text x="110" y="21" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="800" fontFamily="'Courier New', monospace">
                        → {current.toFixed(3)} A
                    </text>
                </g>
            )}
        </svg>
    );
}

// ── Modo Ejercicio con Números Enteros y Respuesta Revelable ─────────────
function ExerciseMode({ onExit }) {
    const generateProblem = useCallback(() => {
        // Generar combinaciones enteras exactas:
        // I: 2 a 10 A, R: 2 a 20 Ω -> V = I * R siempre entero exacto
        const I = Math.floor(Math.random() * 9) + 2; // 2 a 10
        const R = Math.floor(Math.random() * 19) + 2; // 2 a 20
        const V = I * R; // Entero exacto
        const hideIndex = Math.floor(Math.random() * 3); // 0=V, 1=R, 2=I
        return { V, R, I, hideIndex };
    }, []);

    const [problem, setProblem] = useState(generateProblem);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
    const [showAnswer, setShowAnswer] = useState(false);

    const labels = [
        { key: 'V', label: 'Voltaje (V)', unit: 'V' },
        { key: 'R', label: 'Resistencia (R)', unit: 'Ω' },
        { key: 'I', label: 'Corriente (I)', unit: 'A' },
    ];

    const correctAnswer = problem[labels[problem.hideIndex].key];

    const check = () => {
        const userVal = parseFloat(answer);
        if (Math.round(userVal) === correctAnswer) {
            setFeedback('correct');
        } else {
            setFeedback('wrong');
        }
    };

    const next = () => {
        setProblem(generateProblem());
        setAnswer('');
        setFeedback(null);
        setShowAnswer(false);
    };

    return (
        <div className="sim-exercise-card" style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1.5rem' }}>
            <div style={{ fontWeight: 800, color: 'white', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.05rem' }}>🧠 Desafío de Cálculo (Valores Enteros)</span>
                <button className="sim-btn sim-btn-secondary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }} onClick={onExit}>
                    Volver al Circuito
                </button>
            </div>

            <div className="sim-data-boxes" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1.25rem' }}>
                {labels.map((l, i) => {
                    const isHidden = i === problem.hideIndex;
                    return (
                        <div
                            key={l.key}
                            style={{
                                background: isHidden ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)',
                                border: `1.5px solid ${isHidden ? '#f59e0b' : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: '14px',
                                padding: '12px',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                                {l.label}
                            </div>
                            <div style={{ color: isHidden ? '#fbbf24' : 'white', fontSize: '1.5rem', fontWeight: 900 }}>
                                {isHidden ? '?' : problem[l.key]}
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginLeft: '4px' }}>{l.unit}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Formulario de Respuesta y Acciones */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input
                    type="number"
                    step="1"
                    value={answer}
                    onChange={e => { setAnswer(e.target.value); setFeedback(null); }}
                    placeholder={`Ingresa el valor de ${labels[problem.hideIndex].label}...`}
                    className="circuit-resistor-input"
                    style={{ flex: 1, minWidth: '220px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
                    onKeyDown={e => e.key === 'Enter' && check()}
                />
                <button
                    className="sim-btn sim-btn-primary"
                    onClick={check}
                    disabled={!answer}
                    style={{ padding: '10px 16px', fontWeight: 800 }}
                >
                    Verificar
                </button>
                <button
                    className="sim-btn sim-btn-secondary"
                    onClick={() => setShowAnswer(prev => !prev)}
                    style={{ padding: '10px 14px', fontWeight: 700 }}
                >
                    {showAnswer ? '🙈 Ocultar Respuesta' : '👁️ Ver Respuesta'}
                </button>
                <button
                    className="sim-btn sim-btn-secondary"
                    onClick={next}
                    style={{ padding: '10px 14px', fontWeight: 700 }}
                >
                    <RefreshCw size={14} /> Nueva Pregunta
                </button>
            </div>

            {/* Feedback de Respuesta */}
            {feedback === 'correct' && (
                <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#34d399', fontWeight: 800, fontSize: '0.92rem', padding: '10px 14px', borderRadius: '10px', marginBottom: '0.75rem' }}>
                    ✅ ¡Correcto! {labels[problem.hideIndex].label} = {correctAnswer} {labels[problem.hideIndex].unit}
                </div>
            )}
            {feedback === 'wrong' && (
                <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#f87171', fontWeight: 800, fontSize: '0.92rem', padding: '10px 14px', borderRadius: '10px', marginBottom: '0.75rem' }}>
                    ❌ Respuesta incorrecta. Inténtalo de nuevo o haz clic en "Ver Respuesta".
                </div>
            )}

            {/* Solución Oculta / Desplegable */}
            {showAnswer && (
                <div style={{
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: '#cbd5e1',
                    fontSize: '0.88rem'
                }}>
                    <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '4px' }}>
                        💡 Solución y Despeje Paso a Paso:
                    </strong>
                    {problem.hideIndex === 0 && (
                        <div>
                            Para calcular <strong>Voltaje (V)</strong>: <code>V = I × R = {problem.I} A × {problem.R} Ω = <span style={{ color: '#38bdf8', fontWeight: 900 }}>{problem.V} V</span></code>
                        </div>
                    )}
                    {problem.hideIndex === 1 && (
                        <div>
                            Para calcular <strong>Resistencia (R)</strong>: <code>R = V / I = {problem.V} V / {problem.I} A = <span style={{ color: '#c084fc', fontWeight: 900 }}>{problem.R} Ω</span></code>
                        </div>
                    )}
                    {problem.hideIndex === 2 && (
                        <div>
                            Para calcular <strong>Corriente (I)</strong>: <code>I = V / R = {problem.V} V / {problem.R} Ω = <span style={{ color: '#34d399', fontWeight: 900 }}>{problem.I} A</span></code>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function InteractiveOhmLaw({ compact = false }) {
    const [voltage, setVoltage] = useState(12);
    const [resistance, setResistance] = useState(40);
    const [activeTab, setActiveTab] = useState('circuit'); // 'circuit' | 'exercise'

    const isShortCircuit = resistance === 0;
    const current = isShortCircuit ? Infinity : voltage / resistance;
    const power = isShortCircuit ? Infinity : voltage * current;

    const maxCurrent = 12; // Escala del gauge

    return (
        <div className="sim-card">
            <div className="sim-card-header">
                <h3>⚡ Laboratorio de la Ley de Ohm (V = I × R)</h3>
                <p>Experimenta con el flujo de electrones en el circuito o resuelve los retos matemáticos</p>
            </div>

            {/* Pestañas Superiores del Simulador */}
            <div style={{ display: 'flex', gap: '8px', padding: '0.75rem 1.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                    onClick={() => setActiveTab('circuit')}
                    style={{
                        background: activeTab === 'circuit' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                        border: 'none',
                        borderBottom: `2px solid ${activeTab === 'circuit' ? '#38bdf8' : 'transparent'}`,
                        color: activeTab === 'circuit' ? '#38bdf8' : '#94a3b8',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                    }}
                >
                    <span>🔌</span> Simulador de Circuito
                </button>

                <button
                    onClick={() => setActiveTab('exercise')}
                    style={{
                        background: activeTab === 'exercise' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                        border: 'none',
                        borderBottom: `2px solid ${activeTab === 'exercise' ? '#fbbf24' : 'transparent'}`,
                        color: activeTab === 'exercise' ? '#fbbf24' : '#94a3b8',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                    }}
                >
                    <span>🧠</span> Desafíos de Cálculo
                </button>
            </div>

            <div className="sim-card-body">
                {/* 1. Vista de Circuito */}
                {activeTab === 'circuit' && (
                    <div className="sim-grid-2">
                        {/* Circuito SVG */}
                        <div className="sim-visual" style={{ position: 'relative' }}>
                            <CircuitSVG
                                voltage={voltage}
                                resistance={resistance}
                                current={isShortCircuit ? 0 : current}
                                isShortCircuit={isShortCircuit}
                            />
                            {isShortCircuit && (
                                <div className="sim-short-circuit-overlay">
                                    <span className="sim-short-circuit-icon">⚠️</span>
                                    <span className="sim-short-circuit-title">CORTOCIRCUITO</span>
                                    <span className="sim-short-circuit-sub">R = 0 → I = ∞</span>
                                </div>
                            )}
                        </div>

                        {/* Controles */}
                        <div className="sim-controls">
                            {/* Voltaje */}
                            <div className="sim-control-group">
                                <div className="sim-label">
                                    <span className="sim-label-text">Voltaje (V)</span>
                                    <span className="sim-label-value">{voltage} V</span>
                                </div>
                                <input
                                    type="range" className="sim-slider"
                                    min="0" max="24" step="0.5"
                                    value={voltage}
                                    onChange={e => setVoltage(+e.target.value)}
                                />
                            </div>

                            {/* Resistencia */}
                            <div className="sim-control-group">
                                <div className="sim-label">
                                    <span className="sim-label-text">Resistencia (Ω)</span>
                                    <span className="sim-label-value">{resistance} Ω</span>
                                </div>
                                <input
                                    type="range" className="sim-slider"
                                    min="0" max="200" step="1"
                                    value={resistance}
                                    onChange={e => setResistance(+e.target.value)}
                                />
                            </div>

                            {/* Gauge de corriente */}
                            <div className="sim-gauge">
                                <div className="sim-label">
                                    <span className="sim-label-text">Corriente (I = V/R)</span>
                                    <span className="sim-label-value" style={{ color: isShortCircuit ? '#ef4444' : undefined }}>
                                        {isShortCircuit ? '∞' : current.toFixed(3)} A
                                    </span>
                                </div>
                                <div className="sim-gauge-bar-bg">
                                    <div
                                        className={`sim-gauge-bar-fill ${isShortCircuit ? 'danger' : ''}`}
                                        style={{ width: `${isShortCircuit ? 100 : Math.min((current / maxCurrent) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Potencia */}
                            <div className="sim-label" style={{ marginTop: '0.25rem', padding: '0.625rem', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                <span className="sim-label-text">Potencia (P = V×I)</span>
                                <span className="sim-label-value" style={{ fontSize: '0.95rem' }}>
                                    {isShortCircuit ? '∞' : power.toFixed(2)} W
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Vista de Modo Desafío */}
                {activeTab === 'exercise' && (
                    <ExerciseMode onExit={() => setActiveTab('circuit')} />
                )}
            </div>
        </div>
    );
}
