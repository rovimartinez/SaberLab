import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Zap, Sparkles, Scale, ArrowRightLeft } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

export default function ChargeInteraction() {
    // Valores interactivos de la Ley de Coulomb:
    // q1 en microCulombios [µC], q2 en microCulombios [µC], r en metros [m]
    const [q1, setQ1] = useState(2); // -5 a +5 µC
    const [q2, setQ2] = useState(-3); // -5 a +5 µC
    const [distMeters, setDistMeters] = useState(0.5); // 0.1 a 1.0 m

    // Estado para la animación física de movimiento
    const [animOffset, setAnimOffset] = useState(0); // desplazamiento en px
    const [isSimulating, setIsSimulating] = useState(false);
    const [hasCollided, setHasCollided] = useState(false);
    const animRef = useRef(null);

    // Constante electrostática k = 8.99 × 10^9 N·m²/C²
    const k = 8.99e9;

    // Cálculo exacto de la Fuerza en Newtons (N)
    // F = k * (|q1 * 10^-6| * |q2 * 10^-6|) / r^2
    const q1Coulombs = Math.abs(q1) * 1e-6;
    const q2Coulombs = Math.abs(q2) * 1e-6;
    const forceReal = (q1 === 0 || q2 === 0)
        ? 0
        : (k * (q1Coulombs * q2Coulombs)) / (distMeters * distMeters);

    // Tipo de interacción
    const isNeutral = q1 === 0 || q2 === 0;
    const isAttraction = (q1 * q2) < 0;
    const isRepulsion = (q1 * q2) > 0;

    // Posición gráfica en el SVG (centrado en X=170)
    // Escala: 0.1m = 35px separación, 1.0m = 120px separación
    const baseSeparationPx = 30 + (distMeters * 90);
    const currentSeparationPx = Math.max(22, baseSeparationPx + animOffset);

    const cx1 = 170 - currentSeparationPx;
    const cx2 = 170 + currentSeparationPx;

    // Longitud visual del vector flecha de fuerza (escalada)
    const arrowLength = isNeutral ? 0 : Math.min(45, Math.max(12, Math.round(Math.log10(Math.max(1, forceReal * 100)) * 14)));

    // Animación física de soltar cargas
    const startSimulation = () => {
        if (isNeutral) return;
        setIsSimulating(true);
        setHasCollided(false);

        let offset = 0;
        let vel = 0;

        const step = () => {
            if (isAttraction) {
                // Se aceleran hacia el centro (offset negativo)
                const currentDist = Math.max(0.08, distMeters * ((baseSeparationPx + offset) / baseSeparationPx));
                const acc = Math.min(2.5, 0.05 / (currentDist * currentDist));
                vel += acc;
                offset -= vel;

                if (baseSeparationPx + offset <= 24) {
                    setAnimOffset(24 - baseSeparationPx);
                    setHasCollided(true);
                    setIsSimulating(false);
                    return;
                }
            } else {
                // Se aceleran hacia los extremos (offset positivo)
                const currentDist = Math.max(0.1, distMeters * ((baseSeparationPx + offset) / baseSeparationPx));
                const acc = Math.min(2.0, 0.04 / (currentDist * currentDist));
                vel += acc;
                offset += vel;

                if (baseSeparationPx + offset >= 135) {
                    setAnimOffset(135 - baseSeparationPx);
                    setIsSimulating(false);
                    return;
                }
            }

            setAnimOffset(offset);
            animRef.current = requestAnimationFrame(step);
        };

        animRef.current = requestAnimationFrame(step);
    };

    const resetSimulation = () => {
        setIsSimulating(false);
        setHasCollided(false);
        setAnimOffset(0);
        if (animRef.current) cancelAnimationFrame(animRef.current);
    };

    useEffect(() => {
        resetSimulation();
    }, [q1, q2, distMeters]);

    useEffect(() => {
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, []);

    return (
        <div className="sim-card" style={{ maxWidth: '840px', margin: '0 auto' }}>
            <div className="sim-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⚡ Laboratorio Interactivo: Ley de Coulomb</span>
                    </h3>
                    <p style={{ margin: '4px 0 0' }}>
                        Experimenta en vivo variando el valor de las cargas (q₁, q₂) y la distancia (r)
                    </p>
                </div>

                <div style={{
                    background: isNeutral ? 'rgba(255,255,255,0.05)' : isAttraction ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1.5px solid ${isNeutral ? 'rgba(255,255,255,0.1)' : isAttraction ? '#10b981' : '#ef4444'}`,
                    padding: '4px 12px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    color: isNeutral ? '#94a3b8' : isAttraction ? '#34d399' : '#f87171'
                }}>
                    {isNeutral ? '⚪ Sin Fuerza (Carga Neutra)' : isAttraction ? '🧲 Fuerza de Atracción' : '💥 Fuerza de Repulsión'}
                </div>
            </div>

            <div className="sim-card-body" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.25fr) minmax(270px, 1fr)', gap: '1.25rem', alignItems: 'start' }}>

                    {/* ── VISOR FÍSICO SVG CON VECTORES DE FUERZA Y LÍNEAS DE CAMPO ── */}
                    <div style={{
                        background: 'linear-gradient(180deg, #090e1a 0%, #0f172a 100%)',
                        border: '1.5px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        padding: '0.75rem',
                        textAlign: 'center',
                        position: 'relative'
                    }}>
                        <svg viewBox="0 0 340 180" width="100%" height="200" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <radialGradient id="coulombPosGrad" cx="35%" cy="35%" r="65%">
                                    <stop offset="0%" stopColor="#f87171" />
                                    <stop offset="100%" stopColor="#dc2626" />
                                </radialGradient>
                                <radialGradient id="coulombNegGrad" cx="35%" cy="35%" r="65%">
                                    <stop offset="0%" stopColor="#60a5fa" />
                                    <stop offset="100%" stopColor="#2563eb" />
                                </radialGradient>
                                <radialGradient id="coulombNeutralGrad" cx="35%" cy="35%" r="65%">
                                    <stop offset="0%" stopColor="#94a3b8" />
                                    <stop offset="100%" stopColor="#475569" />
                                </radialGradient>
                                <filter id="coulombGlow" x="-30%" y="-30%" width="160%" height="160%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>

                            {/* Líneas de Contención */}
                            <line x1="20" y1="25" x2="20" y2="145" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="3 3" />
                            <line x1="320" y1="25" x2="320" y2="145" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="3 3" />

                            {/* Líneas de Campo Eléctrico */}
                            {isAttraction && (
                                <g opacity="0.4">
                                    <path d={`M ${cx1} 75 Q 170 30 ${cx2} 75`} fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 3" />
                                    <path d={`M ${cx1} 85 L ${cx2} 85`} fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 2" />
                                    <path d={`M ${cx1} 95 Q 170 140 ${cx2} 95`} fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 3" />
                                </g>
                            )}

                            {isRepulsion && (
                                <g opacity="0.35">
                                    <path d={`M ${cx1} 85 Q 170 50 170 15`} fill="none" stroke="#f87171" strokeWidth="1.5" strokeDasharray="4 3" />
                                    <path d={`M ${cx1} 85 Q 170 120 170 155`} fill="none" stroke="#f87171" strokeWidth="1.5" strokeDasharray="4 3" />
                                    <path d={`M ${cx2} 85 Q 170 50 170 15`} fill="none" stroke="#f87171" strokeWidth="1.5" strokeDasharray="4 3" />
                                    <path d={`M ${cx2} 85 Q 170 120 170 155`} fill="none" stroke="#f87171" strokeWidth="1.5" strokeDasharray="4 3" />
                                </g>
                            )}

                            {/* ── CARGA 1 (IZQUIERDA) ── */}
                            <g>
                                <circle
                                    cx={cx1}
                                    cy={85}
                                    r={16 + Math.min(8, Math.abs(q1) * 1.5)}
                                    fill={q1 > 0 ? "url(#coulombPosGrad)" : q1 < 0 ? "url(#coulombNegGrad)" : "url(#coulombNeutralGrad)"}
                                    filter="url(#coulombGlow)"
                                />
                                <text x={cx1} y={91} textAnchor="middle" fill="white" fontSize="16" fontWeight="900" fontFamily="monospace">
                                    {q1 > 0 ? `+${q1}` : q1 < 0 ? `${q1}` : '0'}
                                </text>
                                <text x={cx1} y={55} textAnchor="middle" fill={q1 > 0 ? '#fca5a5' : q1 < 0 ? '#93c5fd' : '#cbd5e1'} fontSize="10" fontWeight="bold">
                                    q₁ = {q1 > 0 ? `+${q1}` : q1} µC
                                </text>

                                {/* Vector Fuerza en Carga 1 */}
                                {!hasCollided && !isNeutral && (
                                    isAttraction ? (
                                        <g>
                                            <line x1={cx1 + 22} y1="85" x2={cx1 + 22 + arrowLength} y2="85" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
                                            <polygon points={`${cx1 + 22 + arrowLength},80 ${cx1 + 28 + arrowLength},85 ${cx1 + 22 + arrowLength},90`} fill="#34d399" />
                                            <text x={cx1 + 22 + arrowLength / 2} y={76} textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">F</text>
                                        </g>
                                    ) : (
                                        <g>
                                            <line x1={cx1 - 22} y1="85" x2={cx1 - 22 - arrowLength} y2="85" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                                            <polygon points={`${cx1 - 22 - arrowLength},80 ${cx1 - 28 - arrowLength},85 ${cx1 - 22 - arrowLength},90`} fill="#ef4444" />
                                            <text x={cx1 - 22 - arrowLength / 2} y={76} textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">F</text>
                                        </g>
                                    )
                                )}
                            </g>

                            {/* ── CARGA 2 (DERECHA) ── */}
                            <g>
                                <circle
                                    cx={cx2}
                                    cy={85}
                                    r={16 + Math.min(8, Math.abs(q2) * 1.5)}
                                    fill={q2 > 0 ? "url(#coulombPosGrad)" : q2 < 0 ? "url(#coulombNegGrad)" : "url(#coulombNeutralGrad)"}
                                    filter="url(#coulombGlow)"
                                />
                                <text x={cx2} y={91} textAnchor="middle" fill="white" fontSize="16" fontWeight="900" fontFamily="monospace">
                                    {q2 > 0 ? `+${q2}` : q2 < 0 ? `${q2}` : '0'}
                                </text>
                                <text x={cx2} y={55} textAnchor="middle" fill={q2 > 0 ? '#fca5a5' : q2 < 0 ? '#93c5fd' : '#cbd5e1'} fontSize="10" fontWeight="bold">
                                    q₂ = {q2 > 0 ? `+${q2}` : q2} µC
                                </text>

                                {/* Vector Fuerza en Carga 2 */}
                                {!hasCollided && !isNeutral && (
                                    isAttraction ? (
                                        <g>
                                            <line x1={cx2 - 22} y1="85" x2={cx2 - 22 - arrowLength} y2="85" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
                                            <polygon points={`${cx2 - 22 - arrowLength},80 ${cx2 - 28 - arrowLength},85 ${cx2 - 22 - arrowLength},90`} fill="#34d399" />
                                            <text x={cx2 - 22 - arrowLength / 2} y={76} textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">F</text>
                                        </g>
                                    ) : (
                                        <g>
                                            <line x1={cx2 + 22} y1="85" x2={cx2 + 22 + arrowLength} y2="85" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                                            <polygon points={`${cx2 + 22 + arrowLength},80 ${cx2 + 28 + arrowLength},85 ${cx2 + 22 + arrowLength},90`} fill="#ef4444" />
                                            <text x={cx2 + 22 + arrowLength / 2} y={76} textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">F</text>
                                        </g>
                                    )
                                )}
                            </g>

                            {/* Destello de choque si se unieron */}
                            {hasCollided && (
                                <g>
                                    <circle cx="170" cy="85" r="28" fill="#fbbf24" opacity="0.4" />
                                    <text x="170" y="45" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="900">
                                        ⚡ ¡COLISIÓN POR ATRACCIÓN!
                                    </text>
                                </g>
                            )}

                            {/* Regla / Cota de Distancia */}
                            <line x1={cx1} y1="150" x2={cx2} y2="150" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
                            <line x1={cx1} y1="145" x2={cx1} y2="155" stroke="#94a3b8" strokeWidth="2" />
                            <line x1={cx2} y1="145" x2={cx2} y2="155" stroke="#94a3b8" strokeWidth="2" />
                            <text x="170" y="165" fill="#fbbf24" fontSize="10" fontWeight="900" textAnchor="middle">
                                Distancia r = {distMeters.toFixed(2)} m
                            </text>
                        </svg>

                        {/* Botones de acción física */}
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '6px' }}>
                            <button
                                className="sim-btn sim-btn-primary"
                                style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 800 }}
                                onClick={startSimulation}
                                disabled={isSimulating || hasCollided || isNeutral}
                            >
                                <Play size={14} /> Soltar Cargas
                            </button>
                            <button
                                className="sim-btn sim-btn-secondary"
                                style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 800 }}
                                onClick={resetSimulation}
                            >
                                <RotateCcw size={14} /> Reiniciar
                            </button>
                        </div>
                    </div>

                    {/* ── PANEL DE CONTROL MATEMÁTICO EN TIEMPO REAL ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                        {/* Caja del Cálculo de Fuerza Resultante */}
                        <div style={{
                            background: isNeutral ? 'rgba(255,255,255,0.03)' : isAttraction ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            border: `1.5px solid ${isNeutral ? 'rgba(255,255,255,0.08)' : isAttraction ? '#10b981' : '#ef4444'}`,
                            borderRadius: '14px',
                            padding: '1rem',
                            textAlign: 'center'
                        }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                Magnitud de la Fuerza Eléctrica (F):
                            </div>
                            <div style={{
                                color: isNeutral ? '#94a3b8' : isAttraction ? '#34d399' : '#f87171',
                                fontSize: '1.75rem',
                                fontWeight: 900,
                                fontFamily: 'monospace',
                                margin: '4px 0'
                            }}>
                                {forceReal >= 1 ? forceReal.toFixed(2) : forceReal.toFixed(4)} N
                            </div>
                            <div style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>
                                {isNeutral
                                    ? 'Una de las cargas es neutra; no hay fuerza de interacción.'
                                    : isAttraction
                                        ? `Se atraen con una fuerza mutua de ${forceReal.toFixed(2)} Newtons.`
                                        : `Se repelen con una fuerza mutua de ${forceReal.toFixed(2)} Newtons.`}
                            </div>
                        </div>

                        {/* Sliders Interactivos de Variables */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '0.9rem' }}>

                            {/* Slider Carga 1 */}
                            <div style={{ marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, marginBottom: '4px' }}>
                                    <span style={{ color: q1 > 0 ? '#f87171' : q1 < 0 ? '#60a5fa' : '#94a3b8' }}>
                                        Carga 1 (q₁): {q1 > 0 ? `+${q1}` : q1} µC
                                    </span>
                                    <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>[−5 a +5 µC]</span>
                                </div>
                                <input
                                    type="range" min="-5" max="5" step="1"
                                    value={q1}
                                    onChange={e => setQ1(+e.target.value)}
                                    style={{ width: '100%', accentColor: q1 >= 0 ? '#ef4444' : '#3b82f6' }}
                                />
                            </div>

                            {/* Slider Carga 2 */}
                            <div style={{ marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, marginBottom: '4px' }}>
                                    <span style={{ color: q2 > 0 ? '#f87171' : q2 < 0 ? '#60a5fa' : '#94a3b8' }}>
                                        Carga 2 (q₂): {q2 > 0 ? `+${q2}` : q2} µC
                                    </span>
                                    <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>[−5 a +5 µC]</span>
                                </div>
                                <input
                                    type="range" min="-5" max="5" step="1"
                                    value={q2}
                                    onChange={e => setQ2(+e.target.value)}
                                    style={{ width: '100%', accentColor: q2 >= 0 ? '#ef4444' : '#3b82f6' }}
                                />
                            </div>

                            {/* Slider Distancia r */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, marginBottom: '4px' }}>
                                    <span style={{ color: '#fbbf24' }}>
                                        Distancia (r): {distMeters.toFixed(2)} m
                                    </span>
                                    <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>[0.10 a 1.00 m]</span>
                                </div>
                                <input
                                    type="range" min="0.1" max="1.0" step="0.05"
                                    value={distMeters}
                                    onChange={e => setDistMeters(+e.target.value)}
                                    style={{ width: '100%', accentColor: '#f59e0b' }}
                                />
                            </div>

                        </div>

                        {/* Desglose Matemático Paso a Paso */}
                        <div style={{
                            background: 'rgba(56, 189, 248, 0.06)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            borderRadius: '12px',
                            padding: '10px 14px',
                            fontSize: '0.78rem',
                            color: '#cbd5e1'
                        }}>
                            <div style={{ color: '#38bdf8', fontWeight: 800, marginBottom: '4px' }}>📐 Cálculo en Vivo:</div>
                            <code>F = (8.99×10⁹) · (|{q1}×10⁻⁶ · {q2}×10⁻⁶|) / ({distMeters.toFixed(2)})²</code>
                            <div style={{ marginTop: '4px' }}>
                                <strong>Fuerza calculada:</strong> <span style={{ color: '#38bdf8', fontWeight: 800 }}>{forceReal.toFixed(3)} Newtons</span>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
