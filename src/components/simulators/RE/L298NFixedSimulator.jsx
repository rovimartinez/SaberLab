import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Cpu, Maximize2, X } from 'lucide-react';

/* ─── Rueda SVG ─── */
const WheelSVG = ({ rotationAngle, isForward, isBackward, isBraking }) => (
    <svg width="200" height="200" viewBox="0 0 200 200">
        <defs>
            <radialGradient id="fs-tire" cx="50%" cy="50%" r="50%">
                <stop offset="70%"  stopColor="#1e293b" />
                <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            <radialGradient id="fs-rim" cx="40%" cy="40%" r="60%">
                <stop offset="0%"   stopColor="#fef08a" />
                <stop offset="60%"  stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
            </radialGradient>
        </defs>
        {/* Bornes M+ / M- */}
        <rect x="8" y="62" width="16" height="18" rx="3"
            fill={isForward ? '#10b981' : isBraking ? '#f59e0b' : '#334155'}
            stroke="#38bdf8" strokeWidth="1.5" />
        <text x="16" y="75" fill="white" fontSize="9" fontWeight="900" textAnchor="middle">M+</text>
        <rect x="8" y="120" width="16" height="18" rx="3"
            fill={isBackward ? '#ef4444' : isBraking ? '#f59e0b' : '#334155'}
            stroke="#38bdf8" strokeWidth="1.5" />
        <text x="16" y="133" fill="white" fontSize="9" fontWeight="900" textAnchor="middle">M-</text>
        {/* Rueda */}
        <g transform={`rotate(${rotationAngle} 110 100)`}>
            <circle cx="110" cy="100" r="72" fill="url(#fs-tire)" stroke="#0f172a" strokeWidth="4" />
            {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => (
                <line key={a}
                    x1={110 + 63*Math.cos(a*Math.PI/180)} y1={100 + 63*Math.sin(a*Math.PI/180)}
                    x2={110 + 72*Math.cos(a*Math.PI/180)} y2={100 + 72*Math.sin(a*Math.PI/180)}
                    stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            ))}
            <circle cx="110" cy="100" r="54" fill="url(#fs-rim)" stroke="#a16207" strokeWidth="2.5" />
            {[0,72,144,216,288].map(a => {
                const rad = a * Math.PI / 180;
                return <circle key={a} cx={110+30*Math.cos(rad)} cy={100+30*Math.sin(rad)}
                    r="10" fill="#0f172a" stroke="#ca8a04" strokeWidth="2" />;
            })}
            <circle cx="110" cy="100" r="16" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
            <rect x="103" y="89" width="14" height="22" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="110" cy="100" r="4" fill="#0f172a" />
        </g>
    </svg>
);

/* ─── Componente principal ─── */
export default function L298NFixedSimulator() {
    const [in1, setIn1] = useState(true);
    const [in2, setIn2] = useState(false);
    const [rotationAngle, setRotationAngle] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const animationRef = useRef(null);
    const stateRef    = useRef({ in1: true, in2: false });

    // Sync ref so the RAF loop always reads the latest state
    useEffect(() => { stateRef.current = { in1, in2 }; }, [in1, in2]);

    // Single long-lived animation loop — never recreated
    useEffect(() => {
        let last = performance.now();
        const loop = (now) => {
            const dt = (now - last) / 1000;
            last = now;
            const { in1: i1, in2: i2 } = stateRef.current;
            const fwd = i1 && !i2;
            const bwd = !i1 && i2;
            if (fwd)      setRotationAngle(p => (p + 1200 * dt) % 360);
            else if (bwd) setRotationAngle(p => (p - 1200 * dt + 360) % 360);
            animationRef.current = requestAnimationFrame(loop);
        };
        animationRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationRef.current);
    }, []); // ← runs ONCE, reads state via ref

    const isForward  = in1 && !in2;
    const isBackward = !in1 && in2;
    const isBraking  = in1 && in2;
    const isFloating = !in1 && !in2;

    const rpm = isForward ? 150 : isBackward ? -150 : 0;

    const stateLabel = isForward  ? { text: '↻ AVANCE (Horario)',       color: '#10b981' }
                     : isBackward ? { text: '↺ RETROCESO (Antihorario)', color: '#ef4444' }
                     : isBraking  ? { text: '🛑 FRENO ACTIVO',           color: '#f59e0b' }
                     :              { text: '⚪ PUNTO MUERTO',            color: '#94a3b8' };

    const actions = [
        { label: '↻  avanzar()',    fn: () => { setIn1(true);  setIn2(false); }, active: isForward,  color: '#10b981' },
        { label: '↺  retroceder()', fn: () => { setIn1(false); setIn2(true);  }, active: isBackward, color: '#ef4444' },
        { label: '🛑 frenar()',      fn: () => { setIn1(true);  setIn2(true);  }, active: isBraking,  color: '#f59e0b' },
        { label: '⚪ detener()',     fn: () => { setIn1(false); setIn2(false); }, active: isFloating, color: '#94a3b8' },
    ];

    const bodyContent = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Jumper badge */}
            <div style={{
                background: 'rgba(250,204,21,0.1)', border: '1.5px solid rgba(250,204,21,0.35)',
                borderRadius: '12px', padding: '0.7rem 1rem',
                display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'
            }}>
                <span style={{ fontSize: '1.3rem' }}>🔒</span>
                <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#facc15' }}>
                        Jumper ENA colocado → +5V fijo (100% velocidad)
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                        ENA está puenteado a VCC. Solo controlas el <strong style={{ color: '#e2e8f0' }}>sentido de giro</strong> con IN1 e IN2.
                    </div>
                </div>
            </div>

            {/* Rueda + controles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>

                {/* Columna izquierda: rueda + RPM */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <WheelSVG
                        rotationAngle={rotationAngle}
                        isForward={isForward}
                        isBackward={isBackward}
                        isBraking={isBraking}
                    />

                    {/* Badge de estado */}
                    <div style={{
                        fontSize: '0.82rem', fontWeight: 800, color: stateLabel.color,
                        background: `${stateLabel.color}1a`,
                        border: `1px solid ${stateLabel.color}55`,
                        borderRadius: '8px', padding: '5px 14px', textAlign: 'center', width: '100%', boxSizing: 'border-box'
                    }}>
                        {stateLabel.text}
                    </div>

                    {/* Indicador de RPM */}
                    <div style={{
                        width: '100%', background: 'rgba(15,23,42,0.9)',
                        border: `1px solid ${rpm === 0 ? 'rgba(255,255,255,0.08)' : rpm > 0 ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`,
                        borderRadius: '12px', padding: '0.65rem 1rem',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                        boxSizing: 'border-box'
                    }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Velocidad del Motor
                        </div>
                        <div style={{
                            fontSize: '1.9rem', fontWeight: 900, lineHeight: 1,
                            color: rpm === 0 ? '#475569' : rpm > 0 ? '#10b981' : '#ef4444',
                            fontFamily: 'Consolas, monospace',
                            transition: 'color 0.2s ease'
                        }}>
                            {rpm > 0 ? '+' : ''}{rpm}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>RPM</div>

                        {/* Mini barra de velocidad */}
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', position: 'relative', marginTop: '2px' }}>
                            {/* Centro */}
                            <div style={{ position: 'absolute', left: '50%', top: 0, width: '1px', height: '100%', background: 'rgba(255,255,255,0.15)' }} />
                            {rpm !== 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0, height: '100%',
                                    width: '50%',
                                    left: rpm > 0 ? '50%' : '0%',
                                    background: rpm > 0 ? '#10b981' : '#ef4444',
                                    borderRadius: '4px',
                                    transition: 'background 0.2s ease'
                                }} />
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.6rem', color: '#475569' }}>
                            <span>← Retroceso</span>
                            <span>Avance →</span>
                        </div>
                    </div>
                </div>

                {/* Columna derecha: pines + botones + código */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {/* Estado de pines */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {[
                            { label: 'IN1 (Pin D8)', val: in1 },
                            { label: 'IN2 (Pin D7)', val: in2 }
                        ].map(pin => {
                            const highColor = '#ef4444';   // rojo
                            const lowColor  = '#92400e';   // marrón/café
                            const color = pin.val ? highColor : lowColor;
                            return (
                                <div key={pin.label} style={{
                                    background: `${color}20`,
                                    border: `1px solid ${color}66`,
                                    borderRadius: '10px', padding: '8px', textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '0.63rem', color: '#94a3b8', fontWeight: 700 }}>{pin.label}</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: color }}>
                                        {pin.val ? 'HIGH (5V)' : 'LOW (0V)'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Acciones */}
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        🎮 Acciones rápidas
                    </div>
                    {actions.map(btn => (
                        <button
                            key={btn.label}
                            onClick={btn.fn}
                            style={{
                                background: btn.active ? `${btn.color}22` : 'rgba(255,255,255,0.03)',
                                color: btn.active ? btn.color : '#64748b',
                                border: `1.5px solid ${btn.active ? btn.color : 'rgba(255,255,255,0.08)'}`,
                                padding: '8px 10px', borderRadius: '9px', fontWeight: 800,
                                fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left',
                                transition: 'all 0.15s ease', width: '100%'
                            }}
                        >
                            {btn.label}
                        </button>
                    ))}

                    {/* Código dinámico */}
                    <pre style={{
                        background: 'rgba(15,23,42,0.85)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '10px', padding: '0.7rem',
                        fontSize: '0.74rem', lineHeight: 1.55, margin: 0,
                        color: '#cbd5e1', fontFamily: 'Consolas, Monaco, monospace',
                        overflowX: 'auto'
                    }}>
                        <code>{`// ✅ ENA con Jumper → sin analogWrite\ndigitalWrite(IN1, ${in1 ? 'HIGH' : 'LOW '});\ndigitalWrite(IN2, ${in2 ? 'HIGH' : 'LOW '});\n// Solo 2 líneas controlan el sentido`}</code>
                    </pre>
                </div>
            </div>
        </div>
    );

    return (
        <div className="function-control-simulator" style={{ width: '100%', margin: '1.5rem 0' }}>
            {/* Preview card */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.85) 100%)',
                border: '1.5px solid rgba(250,204,21,0.3)',
                borderRadius: '20px', padding: '1.1rem 1.4rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '1rem',
                boxShadow: '0 8px 20px -5px rgba(0,0,0,0.3), 0 0 12px rgba(250,204,21,0.08)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Cpu size={22} color="#facc15" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 850, color: 'var(--text-heading, #f8fafc)' }}>
                            Simulador Básico: Control de Sentido (Jumper Fijo)
                        </h4>
                        <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)' }}>
                            Velocidad fija al 100% · Solo controlas IN1 e IN2 · Sin <code>analogWrite</code>
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsExpanded(true)}
                    style={{
                        background: 'linear-gradient(135deg, #a16207 0%, #854d0e 100%)',
                        color: '#ffffff', border: 'none', borderRadius: '12px',
                        padding: '0.6rem 1.2rem', fontWeight: 800, fontSize: '0.86rem',
                        display: 'flex', alignItems: 'center', gap: '7px',
                        cursor: 'pointer', boxShadow: '0 4px 12px rgba(161,98,7,0.35)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Maximize2 size={15} /> Abrir Simulador
                </button>
            </div>

            {/* Modal */}
            {isExpanded && typeof document !== 'undefined' && createPortal(
                <div
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(11,17,32,0.88)',
                        backdropFilter: 'blur(12px)', zIndex: 999999999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '1.5rem', boxSizing: 'border-box'
                    }}
                    onClick={() => setIsExpanded(false)}
                >
                    <div
                        style={{
                            background: '#0b1120', border: '1.5px solid rgba(250,204,21,0.3)',
                            borderRadius: '24px', width: '100%', maxWidth: '820px',
                            maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8)',
                            overflow: 'hidden'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: 'rgba(15,23,42,0.8)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Cpu size={18} color="#facc15" />
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 850, color: '#f8fafc' }}>
                                        Simulador: L298N con Jumper Fijo
                                    </h3>
                                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                        Velocidad 100% constante — control de sentido únicamente
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#cbd5e1', borderRadius: '10px', padding: '6px 12px',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    gap: '6px', fontSize: '0.82rem', fontWeight: 700
                                }}
                            >
                                <X size={16} /> Cerrar
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                            {bodyContent}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
