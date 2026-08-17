import { useState } from 'react';
import { RefreshCw, Zap } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

export default function CurrentDirectionSimulator() {
    // Modo: 'real' (de - a +) | 'conventional' (de + a -)
    const [mode, setMode] = useState('real');
    const [speed, setSpeed] = useState(2.2); // Duración de ciclo en segundos

    // Trayectoria en sentido Real (del polo negativo izquierdo al positivo derecho a través del circuito superior)
    const realPath = "M 70 95 L 25 95 L 25 25 L 235 25 L 235 95 L 190 95";

    // Trayectoria en sentido Convencional (del polo positivo derecho al negativo izquierdo)
    const convPath = "M 190 95 L 235 95 L 235 25 L 25 25 L 25 95 L 70 95";

    return (
        <div className="sim-card">
            <div className="sim-card-header">
                <h3>🔄 Corriente Real vs. Corriente Convencional</h3>
                <p>Observa el sentido del flujo según cada modelo</p>
            </div>

            <div className="sim-card-body">
                {/* Selector de Modo */}
                <div className="circuit-sim-tabs" style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button
                        className={`circuit-sim-tab ${mode === 'real' ? 'active' : ''}`}
                        style={{ justifyContent: 'center' }}
                        onClick={() => setMode('real')}
                    >
                        🔵 Corriente Real
                    </button>
                    <button
                        className={`circuit-sim-tab ${mode === 'conventional' ? 'active' : ''}`}
                        style={{ justifyContent: 'center' }}
                        onClick={() => setMode('conventional')}
                    >
                        🔴 Corriente Convencional
                    </button>
                </div>

                <div className="sim-grid-2">
                    {/* Visualización SVG del Circuito */}
                    <div className="sim-visual" style={{ minHeight: '230px', padding: '0.5rem', position: 'relative' }}>
                        <svg viewBox="0 0 260 140" width="100%" height="190" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                {/* Gradientes */}
                                <radialGradient id="batteryPilaGrad" cx="30%" cy="30%" r="70%">
                                    <stop offset="0%" stopColor="#334155" />
                                    <stop offset="100%" stopColor="#0f172a" />
                                </radialGradient>
                                <radialGradient id="bulbGlow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#fef08a" />
                                    <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                                </radialGradient>
                                <filter id="blueParticleGlow" x="-40%" y="-40%" width="180%" height="180%">
                                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                <filter id="redParticleGlow" x="-40%" y="-40%" width="180%" height="180%">
                                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>

                            {/* ── Cables del Circuito ── */}
                            <path
                                d="M 70 95 L 25 95 L 25 25 L 235 25 L 235 95 L 190 95"
                                fill="none"
                                stroke="#475569"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* ── BATERÍA (Parte Inferior) ── */}
                            <g id="battery">
                                {/* Cuerpo de la batería */}
                                <rect x="70" y="81" width="120" height="28" rx="4" fill="url(#batteryPilaGrad)" stroke="#64748b" strokeWidth="1" />
                                {/* Bornes Metálicos */}
                                {/* Borne Negativo Cátodo (Izquierda - Azul) */}
                                <rect x="66" y="86" width="5" height="18" rx="1.5" fill="#38bdf8" />
                                <text x="82" y="99" fill="#38bdf8" fontSize="13" fontWeight="900" textAnchor="middle">−</text>
                                <text x="82" y="122" fill="#38bdf8" fontSize="7.5" fontWeight="bold" textAnchor="middle">Polo (−)</text>

                                {/* Borne Positivo Ánodo (Derecha - Rojo con resalte saliente) */}
                                <rect x="189" y="86" width="6" height="18" rx="2" fill="#ef4444" />
                                <rect x="194" y="90" width="3" height="10" rx="1" fill="#f87171" />
                                <text x="178" y="99" fill="#f87171" fontSize="13" fontWeight="900" textAnchor="middle">+</text>
                                <text x="178" y="122" fill="#f87171" fontSize="7.5" fontWeight="bold" textAnchor="middle">Polo (+)</text>

                                {/* Etiqueta Batería */}
                                <text x="130" y="98" fill="#fbbf24" fontSize="9" fontWeight="bold" textAnchor="middle">BATERÍA 9V</text>
                            </g>

                            {/* ── CARGA / BOMBILLA ILUMINADA (Parte Superior Central) ── */}
                            <g id="lightbulb" transform="translate(130, 25)">
                                {/* Resplandor */}
                                <circle cx="0" cy="0" r="22" fill="url(#bulbGlow)" />
                                {/* Cristal */}
                                <circle cx="0" cy="0" r="12" fill="rgba(254, 240, 138, 0.3)" stroke="#fbbf24" strokeWidth="1.5" />
                                {/* Filamento incandescente */}
                                <path d="M -4 5 L -2 -3 L 0 3 L 2 -3 L 4 5" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                                <text x="0" y="-16" fill="#fbbf24" fontSize="8" fontWeight="bold" textAnchor="middle">💡 Carga (Bombilla)</text>
                            </g>

                            {/* ── 🔵 FLUJO REAL (Electrones Azules: de − a +) ── */}
                            {mode === 'real' && (
                                <>
                                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                                        <g key={`real-${idx}`}>
                                            <circle r="4" fill="#38bdf8" filter="url(#blueParticleGlow)">
                                                <animateMotion
                                                    dur={`${speed}s`}
                                                    repeatCount="indefinite"
                                                    begin={`-${idx * (speed / 6)}s`}
                                                    path={realPath}
                                                />
                                            </circle>
                                        </g>
                                    ))}
                                    {/* Indicador de sentido Real */}
                                    <text x="130" y="47" textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="bold">
                                        ◀ Flujo Real de Electrones (de − a +)
                                    </text>
                                </>
                            )}

                            {/* ── 🔴 FLUJO CONVENCIONAL (Cargas Rojas: de + a −) ── */}
                            {mode === 'conventional' && (
                                <>
                                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                                        <g key={`conv-${idx}`}>
                                            <circle r="4" fill="#ef4444" filter="url(#redParticleGlow)">
                                                <animateMotion
                                                    dur={`${speed}s`}
                                                    repeatCount="indefinite"
                                                    begin={`-${idx * (speed / 6)}s`}
                                                    path={convPath}
                                                />
                                            </circle>
                                        </g>
                                    ))}
                                    {/* Indicador de sentido Convencional */}
                                    <text x="130" y="47" textAnchor="middle" fill="#f87171" fontSize="8.5" fontWeight="bold">
                                        ▶ Corriente Convencional (de + a −)
                                    </text>
                                </>
                            )}
                        </svg>
                    </div>

                    {/* Explicación y Controles Didácticos */}
                    <div className="sim-controls">
                        {/* Tarjeta explicativa según el modo */}
                        {mode === 'real' ? (
                            <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '0.85rem' }}>
                                <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                                    🔵 Corriente Real
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
                                    Los <strong>electrones libres tienen carga negativa (−)</strong>. Son impulsados por el polo negativo (cátodo) y viajan hacia el polo positivo (ánodo).
                                </p>
                            </div>
                        ) : (
                            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '0.85rem' }}>
                                <div style={{ color: '#f87171', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                                    🔴 Corriente Convencional
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
                                    Propuesta por Benjamin Franklin. Asume que la corriente fluye de <strong>(+) a (−)</strong>. Es el estándar utilizado en diagramas y fórmulas.
                                </p>
                            </div>
                        )}

                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.45, background: 'rgba(15,23,42,0.6)', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            💡 <strong>En resumen:</strong><br />
                            • <strong>Corriente Real:</strong> de <strong>(−) a (+)</strong>.<br />
                            • <strong>Corriente Convencional:</strong> de <strong>(+) a (−)</strong>.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
