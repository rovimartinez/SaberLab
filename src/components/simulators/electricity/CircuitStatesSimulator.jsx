import { useState } from 'react';
import { ToggleLeft, ToggleRight, AlertTriangle, CheckCircle2, XCircle, Shuffle, ShieldAlert, Sparkles } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

export default function CircuitStatesSimulator() {
    // Estados: 'closed' | 'open' | 'switched_a' | 'switched_b' | 'short'
    const [circuitState, setCircuitState] = useState('closed');

    // Trayectorias SVG
    // Cerrado estándar: Sale de (-) en (50, 95) -> va a (20, 95) -> sube a (20, 25) -> pasa por interruptor cerrado (80 a 110) -> pasa por bombilla (170, 25) -> baja por (240, 25) a (240, 95) -> entra a (+) en (210, 95)
    const closedPath = "M 50 95 L 20 95 L 20 25 L 240 25 L 240 95 L 210 95";
    
    // Conmutado A (Camino superior - Bombilla Verde en y=20)
    const switchedPathA = "M 50 95 L 20 95 L 20 20 L 240 20 L 240 95 L 210 95";
    // Conmutado B (Camino inferior - Bombilla Naranja en y=45)
    const switchedPathB = "M 50 95 L 20 95 L 20 50 L 240 50 L 240 95 L 210 95";

    // Cortocircuito: camino de escape directo sin pasar por la bombilla
    const shortLoopPath = "M 50 95 L 20 95 L 20 65 L 240 65 L 240 95 L 210 95";

    return (
        <div className="sim-card">
            <div className="sim-card-header">
                <h3>🎮 Simulador de los 4 Estados Fundamentales de un Circuito</h3>
                <p>Experimenta con interruptores, conmutadores y cortocircuitos en tiempo real</p>
            </div>

            <div className="sim-card-body">
                {/* Selector de Estado */}
                <div className="circuit-sim-tabs" style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                    <button
                        className={`circuit-sim-tab ${circuitState === 'closed' ? 'active' : ''}`}
                        onClick={() => setCircuitState('closed')}
                    >
                        🟢 Cerrado (ON)
                    </button>
                    <button
                        className={`circuit-sim-tab ${circuitState === 'open' ? 'active' : ''}`}
                        onClick={() => setCircuitState('open')}
                    >
                        🔴 Abierto (OFF)
                    </button>
                    <button
                        className={`circuit-sim-tab ${circuitState.startsWith('switched') ? 'active' : ''}`}
                        onClick={() => setCircuitState(circuitState === 'switched_b' ? 'switched_a' : 'switched_a')}
                    >
                        🔄 Conmutado
                    </button>
                    <button
                        className={`circuit-sim-tab ${circuitState === 'short' ? 'active' : ''}`}
                        style={{ borderColor: circuitState === 'short' ? '#ef4444' : undefined, color: circuitState === 'short' ? '#f87171' : undefined }}
                        onClick={() => setCircuitState('short')}
                    >
                        ⚠️ Cortocircuito
                    </button>
                </div>

                <div className="sim-grid-2" style={{ alignItems: 'stretch' }}>
                    {/* Visualización Gráfica SVG */}
                    <div className="sim-visual" style={{ minHeight: '260px', padding: '0.75rem', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                        <svg viewBox="0 0 260 130" width="100%" height="180" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <filter id="glowBlue" x="-40%" y="-40%" width="180%" height="180%">
                                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                <radialGradient id="bulbOnGlow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#fef08a" />
                                    <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                                </radialGradient>
                                <radialGradient id="bulbGreenGlow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#a7f3d0" />
                                    <stop offset="60%" stopColor="#34d399" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                                </radialGradient>
                                <radialGradient id="bulbOrangeGlow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#fed7aa" />
                                    <stop offset="60%" stopColor="#fb923c" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
                                </radialGradient>
                            </defs>

                            {/* ── 1. ESTADO: CERRADO (ON) O ABIERTO (OFF) ── */}
                            {(circuitState === 'closed' || circuitState === 'open') && (
                                <>
                                    {/* Cable Base */}
                                    <path
                                        d="M 50 95 L 20 95 L 20 25 L 75 25"
                                        fill="none"
                                        stroke="#475569"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M 105 25 L 240 25 L 240 95 L 210 95"
                                        fill="none"
                                        stroke="#475569"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                    />

                                    {/* Terminales del interruptor */}
                                    <circle cx="75" cy="25" r="4" fill="#fbbf24" />
                                    <circle cx="105" cy="25" r="4" fill="#fbbf24" />

                                    {/* Cuchilla / Lámina del interruptor */}
                                    {circuitState === 'closed' ? (
                                        <line x1="75" y1="25" x2="105" y2="25" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
                                    ) : (
                                        <line x1="75" y1="25" x2="98" y2="10" stroke="#f87171" strokeWidth="4" strokeLinecap="round" />
                                    )}

                                    {/* Carga / Bombilla */}
                                    <g transform="translate(170, 25)">
                                        {circuitState === 'closed' && <circle cx="0" cy="0" r="18" fill="url(#bulbOnGlow)" />}
                                        <circle cx="0" cy="0" r="10" fill={circuitState === 'closed' ? 'rgba(254, 240, 138, 0.4)' : 'rgba(30, 41, 59, 0.6)'} stroke="#fbbf24" strokeWidth="1.5" />
                                        <path d="M -3 4 L -1 -2 L 0 2 L 1 -2 L 3 4" fill="none" stroke={circuitState === 'closed' ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                                        <text x="0" y="-14" fill="#fbbf24" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                                            {circuitState === 'closed' ? '💡 Encendida' : '⚪ Apagada'}
                                        </text>
                                    </g>

                                    {/* Electrones en movimiento si está cerrado */}
                                    {circuitState === 'closed' && [0, 1, 2, 3, 4, 5, 6].map(i => (
                                        <circle key={`cl-${i}`} r="3.8" fill="#38bdf8" filter="url(#glowBlue)">
                                            <animateMotion
                                                dur="2.4s"
                                                repeatCount="indefinite"
                                                begin={`-${i * (2.4 / 7)}s`}
                                                path={closedPath}
                                            />
                                        </circle>
                                    ))}
                                </>
                            )}

                            {/* ── 2. ESTADO: CONMUTADO (SPDT / 2 Caminos) ── */}
                            {circuitState.startsWith('switched') && (
                                <>
                                    {/* Cable de entrada a terminal común */}
                                    <path d="M 50 95 L 20 95 L 20 32 L 65 32" fill="none" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
                                    {/* Camino A (Superior) */}
                                    <path d="M 95 18 L 240 18 L 240 95 L 210 95" fill="none" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
                                    {/* Camino B (Inferior) */}
                                    <path d="M 95 46 L 225 46 L 225 95" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />

                                    {/* Terminales conmutador */}
                                    <circle cx="65" cy="32" r="3.5" fill="#38bdf8" />
                                    <circle cx="95" cy="18" r="3.5" fill="#34d399" />
                                    <circle cx="95" cy="46" r="3.5" fill="#fb923c" />

                                    {/* Cuchilla Conmutada */}
                                    {circuitState === 'switched_a' ? (
                                        <line x1="65" y1="32" x2="95" y2="18" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
                                    ) : (
                                        <line x1="65" y1="32" x2="95" y2="46" stroke="#fb923c" strokeWidth="3.5" strokeLinecap="round" />
                                    )}

                                    {/* Bombilla A (Verde - Superior) */}
                                    <g transform="translate(165, 18)">
                                        {circuitState === 'switched_a' && <circle cx="0" cy="0" r="16" fill="url(#bulbGreenGlow)" />}
                                        <circle cx="0" cy="0" r="9" fill={circuitState === 'switched_a' ? 'rgba(167,243,208,0.4)' : 'rgba(30,41,59,0.6)'} stroke="#34d399" strokeWidth="1.2" />
                                        <text x="0" y="-12" fill="#34d399" fontSize="7" fontWeight="bold" textAnchor="middle">Lámpara A</text>
                                    </g>

                                    {/* Bombilla B (Naranja - Inferior) */}
                                    <g transform="translate(165, 46)">
                                        {circuitState === 'switched_b' && <circle cx="0" cy="0" r="16" fill="url(#bulbOrangeGlow)" />}
                                        <circle cx="0" cy="0" r="9" fill={circuitState === 'switched_b' ? 'rgba(254,215,170,0.4)' : 'rgba(30,41,59,0.6)'} stroke="#fb923c" strokeWidth="1.2" />
                                        <text x="0" y="18" fill="#fb923c" fontSize="7" fontWeight="bold" textAnchor="middle">Lámpara B</text>
                                    </g>

                                    {/* Electrones fluyendo por el camino activo */}
                                    {[0, 1, 2, 3, 4, 5].map(i => (
                                        <circle key={`sw-${i}`} r="3.5" fill="#38bdf8" filter="url(#glowBlue)">
                                            <animateMotion
                                                dur="2.2s"
                                                repeatCount="indefinite"
                                                begin={`-${i * (2.2 / 6)}s`}
                                                path={circuitState === 'switched_a' ? switchedPathA : switchedPathB}
                                            />
                                        </circle>
                                    ))}
                                </>
                            )}

                            {/* ── 3. ESTADO: CORTOCIRCUITO (Short Circuit) ── */}
                            {circuitState === 'short' && (
                                <>
                                    {/* Cable con puente directo que salta la bombilla */}
                                    <path
                                        d="M 50 95 L 20 95 L 20 60 L 240 60 L 240 95 L 210 95"
                                        fill="none"
                                        stroke="#ef4444"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        filter="drop-shadow(0 0 6px rgba(239,68,68,0.8))"
                                    />
                                    {/* Cable hacia la bombilla (sin corriente) */}
                                    <path d="M 20 60 L 20 25 L 240 25 L 240 60" fill="none" stroke="#334155" strokeWidth="2.5" strokeDasharray="3 3" />

                                    {/* Bombilla apagada */}
                                    <g transform="translate(130, 25)">
                                        <circle cx="0" cy="0" r="9" fill="rgba(30,41,59,0.5)" stroke="#64748b" strokeWidth="1" />
                                        <text x="0" y="-12" fill="#94a3b8" fontSize="7" textAnchor="middle">0V (Sin corriente)</text>
                                    </g>

                                    {/* Chispas y Destellos de Cortocircuito */}
                                    <g transform="translate(130, 60)">
                                        <circle cx="0" cy="0" r="14" fill="rgba(239,68,68,0.25)">
                                            <animate attributeName="r" values="8; 18; 8" dur="0.3s" repeatCount="indefinite" />
                                        </circle>
                                        <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#fef08a">
                                            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.5s" repeatCount="indefinite" />
                                        </polygon>
                                        <text x="0" y="24" fill="#f87171" fontSize="8" fontWeight="900" textAnchor="middle">⚡ R ≈ 0 Ω → I = ∞</text>
                                    </g>

                                    {/* Flujo ultra-rápido de electrones en cortocircuito */}
                                    {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                                        <circle key={`sh-${i}`} r="4" fill="#f87171" filter="drop-shadow(0 0 5px #ef4444)">
                                            <animateMotion
                                                dur="0.6s"
                                                repeatCount="indefinite"
                                                begin={`-${i * (0.6 / 8)}s`}
                                                path={shortLoopPath}
                                            />
                                        </circle>
                                    ))}
                                </>
                            )}

                            {/* ── FUENTE / BATERÍA (Común en todos los estados) ── */}
                            <g id="battery" transform="translate(50, 81)">
                                <rect x="0" y="0" width="160" height="28" rx="5" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />
                                {/* Borne Negativo Cátodo Izquierda Azul */}
                                <rect x="-4" y="6" width="6" height="16" rx="1.5" fill="#38bdf8" />
                                <text x="16" y="19" fill="#38bdf8" fontSize="13" fontWeight="900" textAnchor="middle">−</text>
                                <text x="16" y="38" fill="#38bdf8" fontSize="7.5" fontWeight="bold" textAnchor="middle">Polo (−)</text>

                                {/* Borne Positivo Ánodo Derecha Rojo */}
                                <rect x="158" y="6" width="6" height="16" rx="1.5" fill="#ef4444" />
                                <rect x="163" y="9" width="3" height="10" rx="1" fill="#f87171" />
                                <text x="144" y="19" fill="#f87171" fontSize="13" fontWeight="900" textAnchor="middle">+</text>
                                <text x="144" y="38" fill="#f87171" fontSize="7.5" fontWeight="bold" textAnchor="middle">Polo (+)</text>

                                <text x="80" y="18" fill="#fbbf24" fontSize="8.5" fontWeight="bold" textAnchor="middle">BATERÍA 12V</text>
                            </g>
                        </svg>
                    </div>

                    {/* Ficha Explicativa y Acciones */}
                    <div className="sim-controls" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {/* Estado: CERRADO */}
                        {circuitState === 'closed' && (
                            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '0.85rem' }}>
                                <div style={{ color: '#34d399', fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <CheckCircle2 size={18} /> 🟢 Circuito Cerrado (Closed Circuit / ON)
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 0.5rem' }}>
                                    Existe un <strong>camino continuo e ininterrumpido</strong> desde el polo negativo hasta el positivo pasando a través de la carga.
                                </p>
                                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '8px' }}>
                                    • <strong>Resistencia:</strong> Normal (la de la bombilla, ej. 24 Ω)<br />
                                    • <strong>Corriente:</strong> Fluye con normalidad: <code>I = 12V / 24Ω = 0.5 A</code><br />
                                    • <strong>Resultado:</strong> La carga recibe energía y funciona.
                                </div>
                            </div>
                        )}

                        {/* Estado: ABIERTO */}
                        {circuitState === 'open' && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '0.85rem' }}>
                                <div style={{ color: '#f87171', fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <XCircle size={18} /> 🔴 Circuito Abierto (Open Circuit / OFF)
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 0.5rem' }}>
                                    El camino está <strong>interrumpido o cortado</strong> (interruptor apagado, cable roto o fusible abierto).
                                </p>
                                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '8px' }}>
                                    • <strong>Resistencia:</strong> Infinita (R = ∞ Ω, el aire no conduce)<br />
                                    • <strong>Corriente:</strong> Nula: <code>I = 12V / ∞ = 0.00 A</code><br />
                                    • <strong>Resultado:</strong> Los electrones no pueden circular; la carga permanece apagada.
                                </div>
                            </div>
                        )}

                        {/* Estado: CONMUTADO */}
                        {circuitState.startsWith('switched') && (
                            <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '0.85rem' }}>
                                <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Shuffle size={18} /> 🔄 Circuito Conmutado (SPDT / Desviador)
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 0.5rem' }}>
                                    No solo abre o cierra; <strong>redirige el flujo de electrones hacia dos o más caminos alternativos</strong>.
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <button
                                        className={`sim-btn ${circuitState === 'switched_a' ? 'sim-btn-primary' : 'sim-btn-secondary'}`}
                                        style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.4rem' }}
                                        onClick={() => setCircuitState('switched_a')}
                                    >
                                        🌿 Lámpara A (Verde)
                                    </button>
                                    <button
                                        className={`sim-btn ${circuitState === 'switched_b' ? 'sim-btn-primary' : 'sim-btn-secondary'}`}
                                        style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '0.4rem' }}
                                        onClick={() => setCircuitState('switched_b')}
                                    >
                                        🔥 Lámpara B (Naranja)
                                    </button>
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                                    💡 <em>Uso típico:</em> Interruptores de escalera/pasillo (conmutadores) y selectores de modo en multímetros.
                                </div>
                            </div>
                        )}

                        {/* Estado: CORTOCIRCUITO */}
                        {circuitState === 'short' && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', padding: '0.85rem' }}>
                                <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <ShieldAlert size={18} /> ⚠️ Cortocircuito (Short Circuit / Peligro)
                                </div>
                                <p style={{ color: '#fca5a5', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 0.5rem' }}>
                                    Unión directa entre el polo (+) y el polo (−) <strong>sin ninguna carga o resistencia en medio</strong>.
                                </p>
                                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.4)', padding: '0.5rem', borderRadius: '8px' }}>
                                    • <strong>Resistencia:</strong> Casi cero (R ≈ 0.001 Ω)<br />
                                    • <strong>Corriente:</strong> Tiende a infinito: <code>I = 12V / 0.001Ω = 12.000 A</code><br />
                                    • <strong>Consecuencias:</strong> Incendios, explosión de baterías y fusión de cables si no hay un <strong>fusible</strong> que actúe.
                                </div>
                            </div>
                        )}

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.45, background: 'rgba(15,23,42,0.6)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            💡 <strong>Regla de oro:</strong> Todo circuito útil necesita una <strong>resistencia/carga</strong> para limitar y aprovechar la corriente de forma segura.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
