import { useState } from 'react';
import { Power, Flame, RotateCcw, Lightbulb, Zap, Split } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

export default function ParallelCircuitDemo() {
    const [isSwitchClosed, setIsSwitchClosed] = useState(true);
    const [isBulb2Burned, setIsBulb2Burned] = useState(false);
    const [numBranches, setNumBranches] = useState(3); // 2 o 3 ramas
    const [batteryVoltage, setBatteryVoltage] = useState(12);

    // En paralelo, cada rama es independiente si el interruptor principal está cerrado
    const isBranch1Active = isSwitchClosed;
    const isBranch2Active = isSwitchClosed && !isBulb2Burned;
    const isBranch3Active = isSwitchClosed && numBranches === 3;

    // Conteo de ramas activas y corriente total
    const activeBranchesCount = (isBranch1Active ? 1 : 0) + (isBranch2Active ? 1 : 0) + (isBranch3Active ? 1 : 0);
    const currentPerBranch = 1.0; // 1A por bombillo a 12V
    const totalCurrent = isSwitchClosed ? activeBranchesCount * currentPerBranch : 0;

    // Partículas de electrones por cada rama independiente
    const branch1Electrons = 6;
    const branch2Electrons = 6;
    const branch3Electrons = 6;
    const electronDuration = 5.0;

    const b1Offsets = Array.from({ length: branch1Electrons }, (_, i) => (i * electronDuration / branch1Electrons));
    const b2Offsets = Array.from({ length: branch2Electrons }, (_, i) => (i * electronDuration / branch2Electrons));
    const b3Offsets = Array.from({ length: branch3Electrons }, (_, i) => (i * electronDuration / branch3Electrons));

    return (
        <div className="sim-card" style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div className="sim-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#f59e0b' }}>
                        <Split size={20} color="#f59e0b" />
                        <span>Simulación Interactiva: Ramas Independientes y Flujo de Electrones</span>
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                        La base de cada foco está montada directamente sobre el cable conductor. Si quemas el Foco 2, su filamento se rompe y cesa su flujo, pero las demás ramas siguen encendidas.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="sim-btn sim-btn-secondary"
                        onClick={() => {
                            setIsSwitchClosed(true);
                            setIsBulb2Burned(false);
                            setNumBranches(3);
                        }}
                        style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        <RotateCcw size={13} />
                        <span>Restablecer</span>
                    </button>
                </div>
            </div>

            <div className="sim-card-body" style={{ padding: '1.25rem' }}>
                {/* Panel Superior de Controles */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15,23,42,0.6)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                            className={`sim-btn ${isSwitchClosed ? 'sim-btn-primary' : 'sim-btn-secondary'}`}
                            onClick={() => setIsSwitchClosed(!isSwitchClosed)}
                            style={{ padding: '7px 14px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Power size={15} />
                            <span>Interruptor: {isSwitchClosed ? 'CERRADO (ON)' : 'ABIERTO (OFF)'}</span>
                        </button>

                        <button
                            className="sim-btn sim-btn-secondary"
                            onClick={() => setIsBulb2Burned(!isBulb2Burned)}
                            style={{
                                padding: '7px 14px',
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: isBulb2Burned ? '#34d399' : '#f87171',
                                border: isBulb2Burned ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                                background: isBulb2Burned ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                            }}
                        >
                            <Flame size={15} />
                            <span>{isBulb2Burned ? 'Reparar Foco 2' : '💥 Quemar Foco 2'}</span>
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.82rem', color: '#94a3b8' }}>
                        <span>Ramas activas:</span>
                        <button
                            className={`sim-btn ${numBranches === 2 ? 'sim-btn-primary' : 'sim-btn-secondary'}`}
                            onClick={() => setNumBranches(2)}
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                            2 Ramas
                        </button>
                        <button
                            className={`sim-btn ${numBranches === 3 ? 'sim-btn-primary' : 'sim-btn-secondary'}`}
                            onClick={() => setNumBranches(3)}
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                            3 Ramas
                        </button>
                    </div>
                </div>

                {/* Lienzo SVG del Circuito en Paralelo */}
                <div style={{
                    background: 'linear-gradient(180deg, #090e1a 0%, #0f172a 100%)',
                    borderRadius: '16px',
                    border: '1.5px solid rgba(255,255,255,0.08)',
                    padding: '1rem',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <svg viewBox="0 0 540 230" width="100%" height="240" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            {/* Brillo de bombillos encendidos */}
                            <radialGradient id="bulbGlowGradPar" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
                                <stop offset="50%" stopColor="#facc15" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                            </radialGradient>

                            {/* Batería */}
                            <linearGradient id="batGradPar" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#0284c7" />
                                <stop offset="100%" stopColor="#0369a1" />
                            </linearGradient>

                            {/* Resplandor de electrones */}
                            <filter id="electronGlowPar" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>

                            {/* Mancha negra de humo/quemado */}
                            <radialGradient id="smokeBurnGradPar" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#18181b" stopOpacity="0.85" />
                                <stop offset="50%" stopColor="#27272a" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#3f3f46" stopOpacity="0" />
                            </radialGradient>
                        </defs>

                        {/* Riel Superior Partido (Sin cable fantasma bajo el interruptor) */}
                        <line x1="40" y1="35" x2="85" y2="35" stroke={isSwitchClosed ? '#38bdf8' : '#334155'} strokeWidth="3" />
                        <line x1="115" y1="35" x2={numBranches === 3 ? "460" : "320"} y2="35" stroke={isSwitchClosed ? '#38bdf8' : '#334155'} strokeWidth="3" />

                        {/* Riel Inferior Principal */}
                        <line x1="40" y1="195" x2={numBranches === 3 ? "460" : "320"} y2="195" stroke={isSwitchClosed ? '#38bdf8' : '#334155'} strokeWidth="3" />

                        {/* Nodos Eléctricos en Rieles */}
                        <circle cx="180" cy="35" r="3.5" fill="#38bdf8" />
                        <circle cx="180" cy="195" r="3.5" fill="#38bdf8" />
                        <circle cx="320" cy="35" r="3.5" fill="#38bdf8" />
                        <circle cx="320" cy="195" r="3.5" fill="#38bdf8" />
                        {numBranches === 3 && (
                            <>
                                <circle cx="460" cy="35" r="3.5" fill="#38bdf8" />
                                <circle cx="460" cy="195" r="3.5" fill="#38bdf8" />
                            </>
                        )}

                        {/* BATERÍA / FUENTE (Izquierda, + arriba, - abajo) */}
                        <g transform="translate(20, 85)">
                            <line x1="20" y1="-50" x2="20" y2="0" stroke={isSwitchClosed ? '#38bdf8' : '#334155'} strokeWidth="3" />
                            <line x1="20" y1="55" x2="20" y2="110" stroke={isSwitchClosed ? '#38bdf8' : '#334155'} strokeWidth="3" />
                            <rect x="0" y="0" width="40" height="55" rx="5" fill="url(#batGradPar)" stroke="#38bdf8" strokeWidth="1.5" />
                            <rect x="13" y="-5" width="14" height="5" rx="2" fill="#ef4444" />
                            <text x="20" y="22" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="900">+</text>
                            <text x="20" y="47" textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="900">−</text>
                            <text x="-16" y="32" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="900">12V</text>
                        </g>

                        {/* INTERRUPTOR GENERAL */}
                        <g transform="translate(100, 35)">
                            <circle cx="-15" cy="0" r="4" fill="#94a3b8" />
                            <circle cx="15" cy="0" r="4" fill="#94a3b8" />
                            {isSwitchClosed ? (
                                <line x1="-15" y1="0" x2="15" y2="0" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
                            ) : (
                                <line x1="-15" y1="0" x2="10" y2="-16" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
                            )}
                            <text x="0" y="-12" textAnchor="middle" fill={isSwitchClosed ? '#34d399' : '#ef4444'} fontSize="8" fontWeight="800">
                                {isSwitchClosed ? 'ON' : 'OFF'}
                            </text>
                        </g>

                        {/* ══════════════ RAMA 1: FOCO 1 (Base en el cable, foco de costado) ══════════════ */}
                        <g transform="translate(180, 35)">
                            {/* Etiqueta superior */}
                            <text x="14" y="16" textAnchor="middle" fill="#fbbf24" fontSize="9.5" fontWeight="900">Foco 1</text>

                            {/* Cable superior entrando a la base */}
                            <line x1="0" y1="0" x2="0" y2="80" stroke={isBranch1Active ? '#38bdf8' : '#334155'} strokeWidth="2.5" />

                            {/* Base / Portalámparas montado sobre el cable */}
                            <rect x="-8" y="80" width="16" height="32" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
                            <line x1="-7" y1="88" x2="7" y2="88" stroke="#475569" strokeWidth="1" />
                            <line x1="-7" y1="96" x2="7" y2="96" stroke="#475569" strokeWidth="1" />
                            <line x1="-7" y1="104" x2="7" y2="104" stroke="#475569" strokeWidth="1" />
                            <circle cx="0" cy="80" r="2.5" fill="#38bdf8" />
                            <circle cx="0" cy="112" r="2.5" fill="#38bdf8" />

                            {/* Foco de Costado hacia la derecha */}
                            {isBranch1Active && (
                                <circle cx="28" cy="96" r="26" fill="url(#bulbGlowGradPar)" opacity="0.9" />
                            )}
                            <circle cx="28" cy="96" r="16" fill={isBranch1Active ? '#fef08a' : 'rgba(255,255,255,0.06)'} stroke={isBranch1Active ? '#facc15' : '#64748b'} strokeWidth="1.6" />
                            <path d="M 22 86 Q 28 82 34 84" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                            {/* Postes que salen de la base horizontalmente */}
                            <line x1="8" y1="91" x2="24" y2="91" stroke={isBranch1Active ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                            <line x1="8" y1="101" x2="24" y2="101" stroke={isBranch1Active ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                            {/* Filamento incandescente */}
                            <path d="M 24 91 Q 30 94 31 96 Q 30 98 24 101" stroke={isBranch1Active ? '#ffffff' : '#94a3b8'} strokeWidth="1.8" fill="none" />

                            {/* Cable inferior saliendo de la base */}
                            <line x1="0" y1="112" x2="0" y2="135" stroke={isBranch1Active ? '#38bdf8' : '#334155'} strokeWidth="2.5" />

                            {/* Cápsula de Medición */}
                            <g transform="translate(14, 145)">
                                <rect x="-36" y="-9" width="72" height="18" rx="9" fill="#090e1a" stroke="#38bdf8" strokeWidth="1.2" />
                                <text x="0" y="3.5" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="900" fontFamily="monospace">
                                    {isBranch1Active ? '12V · 1.0A' : '0V · 0A'}
                                </text>
                            </g>

                            {/* Cable hasta el riel */}
                            <line x1="0" y1="154" x2="0" y2="160" stroke={isBranch1Active ? '#38bdf8' : '#334155'} strokeWidth="2.5" />
                        </g>

                        {/* ══════════════ RAMA 2: FOCO 2 (QUEMABLE) ══════════════ */}
                        <g 
                            transform="translate(320, 35)"
                            onClick={() => setIsBulb2Burned(!isBulb2Burned)}
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Etiqueta superior */}
                            <text x="14" y="16" textAnchor="middle" fill={isBulb2Burned ? '#ef4444' : '#fbbf24'} fontSize="9.5" fontWeight="900">
                                {isBulb2Burned ? 'Foco 2 (QUEMADO)' : 'Foco 2'}
                            </text>

                            {/* Cable superior entrando a la base */}
                            <line x1="0" y1="0" x2="0" y2="80" stroke={isBranch2Active ? '#38bdf8' : '#334155'} strokeWidth="2.5" />

                            {/* Base / Portalámparas montado sobre el cable */}
                            <rect x="-8" y="80" width="16" height="32" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
                            <line x1="-7" y1="88" x2="7" y2="88" stroke="#475569" strokeWidth="1" />
                            <line x1="-7" y1="96" x2="7" y2="96" stroke="#475569" strokeWidth="1" />
                            <line x1="-7" y1="104" x2="7" y2="104" stroke="#475569" strokeWidth="1" />
                            <circle cx="0" cy="80" r="2.5" fill={isBulb2Burned ? '#ef4444' : '#38bdf8'} />
                            <circle cx="0" cy="112" r="2.5" fill={isBulb2Burned ? '#ef4444' : '#38bdf8'} />

                            {/* Foco de Costado */}
                            {!isBulb2Burned ? (
                                <>
                                    {isBranch2Active && (
                                        <circle cx="28" cy="96" r="26" fill="url(#bulbGlowGradPar)" opacity="0.9" />
                                    )}
                                    <circle cx="28" cy="96" r="16" fill={isBranch2Active ? '#fef08a' : 'rgba(255,255,255,0.06)'} stroke={isBranch2Active ? '#facc15' : '#64748b'} strokeWidth="1.6" />
                                    <path d="M 22 86 Q 28 82 34 84" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                                    <line x1="8" y1="91" x2="24" y2="91" stroke={isBranch2Active ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                                    <line x1="8" y1="101" x2="24" y2="101" stroke={isBranch2Active ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                                    <path d="M 24 91 Q 30 94 31 96 Q 30 98 24 101" stroke={isBranch2Active ? '#ffffff' : '#94a3b8'} strokeWidth="1.8" fill="none" />
                                </>
                            ) : (
                                <>
                                    <circle cx="28" cy="96" r="16" fill="rgba(15,23,42,0.85)" stroke="#ef4444" strokeWidth="1.6" strokeDasharray="3 2" />
                                    <circle cx="28" cy="96" r="10" fill="url(#smokeBurnGradPar)" />
                                    <line x1="8" y1="91" x2="24" y2="91" stroke="#475569" strokeWidth="1.4" />
                                    <line x1="8" y1="101" x2="24" y2="101" stroke="#475569" strokeWidth="1.4" />
                                    {/* Filamento roto */}
                                    <path d="M 24 91 Q 27 92 28 93" stroke="#71717a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                                    <circle cx="28" cy="93" r="1.5" fill="#18181b" stroke="#71717a" strokeWidth="0.8" />
                                    <path d="M 24 101 Q 27 100 28 99" stroke="#71717a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                                    <circle cx="28" cy="99" r="1.5" fill="#18181b" stroke="#71717a" strokeWidth="0.8" />
                                </>
                            )}

                            {/* Cable inferior saliendo de la base */}
                            <line x1="0" y1="112" x2="0" y2="135" stroke={isBranch2Active ? '#38bdf8' : '#334155'} strokeWidth="2.5" />

                            {/* Cápsula de Medición */}
                            <g transform="translate(14, 145)">
                                <rect x="-36" y="-9" width="72" height="18" rx="9" fill="#090e1a" stroke={isBulb2Burned ? '#ef4444' : '#38bdf8'} strokeWidth="1.2" />
                                <text x="0" y="3.5" textAnchor="middle" fill={isBulb2Burned ? '#ef4444' : '#38bdf8'} fontSize="8" fontWeight="900" fontFamily="monospace">
                                    {isBranch2Active ? '12V · 1.0A' : '0V · 0A'}
                                </text>
                            </g>

                            {/* Cable hasta el riel */}
                            <line x1="0" y1="154" x2="0" y2="160" stroke={isBranch2Active ? '#38bdf8' : '#334155'} strokeWidth="2.5" />
                        </g>

                        {/* ══════════════ RAMA 3: FOCO 3 (OPCIONAL) ══════════════ */}
                        {numBranches === 3 && (
                            <g transform="translate(460, 35)">
                                <text x="14" y="16" textAnchor="middle" fill="#fbbf24" fontSize="9.5" fontWeight="900">Foco 3</text>

                                <line x1="0" y1="0" x2="0" y2="80" stroke={isBranch3Active ? '#38bdf8' : '#334155'} strokeWidth="2.5" />

                                <rect x="-8" y="80" width="16" height="32" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
                                <line x1="-7" y1="88" x2="7" y2="88" stroke="#475569" strokeWidth="1" />
                                <line x1="-7" y1="96" x2="7" y2="96" stroke="#475569" strokeWidth="1" />
                                <line x1="-7" y1="104" x2="7" y2="104" stroke="#475569" strokeWidth="1" />
                                <circle cx="0" cy="80" r="2.5" fill="#38bdf8" />
                                <circle cx="0" cy="112" r="2.5" fill="#38bdf8" />

                                {isBranch3Active && (
                                    <circle cx="28" cy="96" r="26" fill="url(#bulbGlowGradPar)" opacity="0.9" />
                                )}
                                <circle cx="28" cy="96" r="16" fill={isBranch3Active ? '#fef08a' : 'rgba(255,255,255,0.06)'} stroke={isBranch3Active ? '#facc15' : '#64748b'} strokeWidth="1.6" />
                                <path d="M 22 86 Q 28 82 34 84" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                                <line x1="8" y1="91" x2="24" y2="91" stroke={isBranch3Active ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                                <line x1="8" y1="101" x2="24" y2="101" stroke={isBranch3Active ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                                <path d="M 24 91 Q 30 94 31 96 Q 30 98 24 101" stroke={isBranch3Active ? '#ffffff' : '#94a3b8'} strokeWidth="1.8" fill="none" />

                                <line x1="0" y1="112" x2="0" y2="135" stroke={isBranch3Active ? '#38bdf8' : '#334155'} strokeWidth="2.5" />

                                <g transform="translate(14, 145)">
                                    <rect x="-36" y="-9" width="72" height="18" rx="9" fill="#090e1a" stroke="#38bdf8" strokeWidth="1.2" />
                                    <text x="0" y="3.5" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="900" fontFamily="monospace">
                                        {isBranch3Active ? '12V · 1.0A' : '0V · 0A'}
                                    </text>
                                </g>

                                <line x1="0" y1="154" x2="0" y2="160" stroke={isBranch3Active ? '#38bdf8' : '#334155'} strokeWidth="2.5" />
                            </g>
                        )}

                        {/* ══════════════ MEDIDOR DE CORRIENTE TOTAL IT ══════════════ */}
                        <g transform="translate(100, 195)">
                            <rect x="-42" y="-13" width="84" height="26" rx="13" fill="#090e1a" stroke="#34d399" strokeWidth="1.5" />
                            <polygon points="-28,4 -20,0 -28,-4" fill="#34d399" />
                            <text x="-12" y="4" textAnchor="start" fill="#34d399" fontSize="10" fontWeight="900" fontFamily="monospace">
                                IT = {totalCurrent.toFixed(1)} A
                            </text>
                        </g>

                        {/* ══════════════ FLUJO DE ELECTRONES ANIMADOS POR CADA RAMA ══════════════ */}
                        {/* Electrones Rama 1 */}
                        {isBranch1Active && b1Offsets.map((offset, i) => (
                            <g key={`b1-${i}`} filter="url(#electronGlowPar)">
                                <circle r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1">
                                    <animateMotion
                                        dur={`${electronDuration}s`}
                                        repeatCount="indefinite"
                                        begin={`${-offset}s`}
                                        path="M 40 35 L 180 35 L 180 80 L 180 112 L 180 195 L 40 195 L 40 35 Z"
                                    />
                                </circle>
                                <text textAnchor="middle" fill="#0f172a" fontSize="6.5" fontWeight="900" dy="2.5">
                                    <animateMotion
                                        dur={`${electronDuration}s`}
                                        repeatCount="indefinite"
                                        begin={`${-offset}s`}
                                        path="M 40 35 L 180 35 L 180 80 L 180 112 L 180 195 L 40 195 L 40 35 Z"
                                    />
                                    −
                                </text>
                            </g>
                        ))}

                        {/* Electrones Rama 2 (Se detienen si Foco 2 está quemado o interruptor abierto) */}
                        {isBranch2Active && b2Offsets.map((offset, i) => (
                            <g key={`b2-${i}`} filter="url(#electronGlowPar)">
                                <circle r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1">
                                    <animateMotion
                                        dur={`${electronDuration * 1.1}s`}
                                        repeatCount="indefinite"
                                        begin={`${-offset}s`}
                                        path="M 40 35 L 320 35 L 320 80 L 320 112 L 320 195 L 40 195 L 40 35 Z"
                                    />
                                </circle>
                                <text textAnchor="middle" fill="#0f172a" fontSize="6.5" fontWeight="900" dy="2.5">
                                    <animateMotion
                                        dur={`${electronDuration * 1.1}s`}
                                        repeatCount="indefinite"
                                        begin={`${-offset}s`}
                                        path="M 40 35 L 320 35 L 320 80 L 320 112 L 320 195 L 40 195 L 40 35 Z"
                                    />
                                    −
                                </text>
                            </g>
                        ))}

                        {/* Electrones Rama 3 */}
                        {isBranch3Active && b3Offsets.map((offset, i) => (
                            <g key={`b3-${i}`} filter="url(#electronGlowPar)">
                                <circle r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1">
                                    <animateMotion
                                        dur={`${electronDuration * 1.2}s`}
                                        repeatCount="indefinite"
                                        begin={`${-offset}s`}
                                        path="M 40 35 L 460 35 L 460 80 L 460 112 L 460 195 L 40 195 L 40 35 Z"
                                    />
                                </circle>
                                <text textAnchor="middle" fill="#0f172a" fontSize="6.5" fontWeight="900" dy="2.5">
                                    <animateMotion
                                        dur={`${electronDuration * 1.2}s`}
                                        repeatCount="indefinite"
                                        begin={`${-offset}s`}
                                        path="M 40 35 L 460 35 L 460 80 L 460 112 L 460 195 L 40 195 L 40 35 Z"
                                    />
                                    −
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>

                {/* Caja de Conclusiones Pedagógicas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginTop: '1rem' }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '12px', padding: '10px' }}>
                        <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.82rem', marginBottom: '2px' }}>🔋 Voltaje en cada Foco:</div>
                        <div style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 900 }}>12.0 V (Constante)</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>Cada rama recibe la totalidad de la fuente.</div>
                    </div>

                    <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '12px', padding: '10px' }}>
                        <div style={{ color: '#34d399', fontWeight: 800, fontSize: '0.82rem', marginBottom: '2px' }}>⚡ Corriente Total Suministrada:</div>
                        <div style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 900 }}>{totalCurrent.toFixed(1)} A</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>Suma de corrientes según LCK: {activeBranchesCount} × 1.0 A.</div>
                    </div>

                    <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '10px' }}>
                        <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.82rem', marginBottom: '2px' }}>💡 Comportamiento de Falla:</div>
                        <div style={{ color: isBulb2Burned ? '#34d399' : '#cbd5e1', fontSize: '0.82rem', fontWeight: 800 }}>
                            {isBulb2Burned ? '¡Las demás ramas siguen encendidas!' : 'Todas las ramas funcionan'}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>Independencia garantizada.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
