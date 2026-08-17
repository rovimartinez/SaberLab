import { useState } from 'react';
import { Zap, Layers, Sparkles } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

export default function AtomModel() {
    const [viewMode, setViewMode] = useState('full'); // 'full' (4 Capas / 29 e⁻) | 'valence' (Solo Capa de Valencia / 1 e⁻)
    const [isElectricFieldActive, setIsElectricFieldActive] = useState(false);

    // ── ESTÁNDAR VISUAL DE PARTÍCULAS ──
    // Protones: Rojo (#ef4444)
    // Neutrones: Gris/Blanco (#cbd5e1)
    // Electrones: Azul Cian (#38bdf8)
    // Órbitas: Dorado suave (rgba(245, 158, 11, 0.45))
    const ELECTRON_COLOR = '#38bdf8';
    const ORBIT_COLOR = 'rgba(245, 158, 11, 0.45)';

    // Radios de las 4 capas electrónicas del Cobre (Cu 29)
    const shells = [
        { name: 'K (2 e⁻)', count: 2, radius: 24, baseDur: 10 },
        { name: 'L (8 e⁻)', count: 8, radius: 42, baseDur: 15 },
        { name: 'M (18 e⁻)', count: 18, radius: 62, baseDur: 20 },
        { name: 'N (1 e⁻ Valencia)', count: 1, radius: 82, baseDur: 16, isValence: true },
    ];

    // Duración de la trayectoria
    const conductionDuration = '3.2';
    const restingDuration = '8.0';

    // Trayectoria directa de media vuelta:
    // Entra por (−) en (-115, 0) -> se acopla a la órbita en (-82, 0) -> recorre el arco superior -> sale por (+) en (+115, 0)
    const conductionPath = "M -115 0 L -82 0 A 82 82 0 0 1 82 0 L 115 0";
    const restingPath = "M 82 0 A 82 82 0 1 1 -82 0 A 82 82 0 1 1 82 0";

    const isValenceOnly = viewMode === 'valence';

    return (
        <div className="sim-card">
            <div className="sim-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                    <h3>🔬 Modelo Atómico del Cobre (Cu 29)</h3>
                    <p>Alterna entre la estructura atómica completa y el modelo simplificado de valencia</p>
                </div>

                {/* Selector de Modo de Visualización */}
                <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <button
                        onClick={() => setViewMode('full')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: viewMode === 'full' ? '#38bdf8' : 'transparent',
                            color: viewMode === 'full' ? '#0f172a' : '#94a3b8',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '5px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                        }}
                    >
                        <Layers size={13} />
                        Átomo Completo (29 e⁻)
                    </button>
                    <button
                        onClick={() => setViewMode('valence')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: viewMode === 'valence' ? '#fbbf24' : 'transparent',
                            color: viewMode === 'valence' ? '#0f172a' : '#94a3b8',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '5px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                        }}
                    >
                        <Sparkles size={13} />
                        Solo Capa de Valencia (1 e⁻)
                    </button>
                </div>
            </div>

            <div className="sim-card-body">
                <div className="sim-grid-2">
                    {/* Visualización del Átomo */}
                    <div className="sim-visual" style={{ minHeight: '240px', padding: '0.5rem', position: 'relative' }}>
                        {/* 🏷️ Badge flotante del Cobre limpio y compacto */}
                        <div style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            background: 'rgba(15, 23, 42, 0.92)',
                            border: `1px solid ${isValenceOnly ? 'rgba(251, 191, 36, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                            borderRadius: '8px',
                            padding: '4px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 10
                        }}>
                            <span style={{ fontSize: '0.95rem', color: isValenceOnly ? '#fbbf24' : '#f87171', fontWeight: 900 }}>
                                29 Cu
                            </span>
                            <span style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '8px', fontSize: '0.74rem', color: '#e2e8f0', fontWeight: 700 }}>
                                {isValenceOnly ? '1 e⁻ Valencia' : '29 e⁻ (4 Capas)'}
                            </span>
                        </div>

                        {/* SVG del Átomo */}
                        <svg viewBox="0 0 260 210" width="100%" height="210" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                {/* Núcleo: Protones Rojos y Neutrones Grises */}
                                <radialGradient id="protonGrad" cx="35%" cy="35%" r="65%">
                                    <stop offset="0%" stopColor="#f87171" />
                                    <stop offset="100%" stopColor="#dc2626" />
                                </radialGradient>
                                <radialGradient id="neutronGrad" cx="35%" cy="35%" r="65%">
                                    <stop offset="0%" stopColor="#f8fafc" />
                                    <stop offset="100%" stopColor="#94a3b8" />
                                </radialGradient>
                                {/* Kernel / Carozo atómico simplificado */}
                                <radialGradient id="kernelGrad" cx="35%" cy="35%" r="65%">
                                    <stop offset="0%" stopColor="#fbbf24" />
                                    <stop offset="60%" stopColor="#d97706" />
                                    <stop offset="100%" stopColor="#78350f" />
                                </radialGradient>
                                {/* Resplandor azul para electrones */}
                                <filter id="blueElectronGlow" x="-40%" y="-40%" width="180%" height="180%">
                                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                <linearGradient id="streamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                                    <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.35" />
                                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {/* Campo eléctrico / Polos cuando está activo */}
                            {isElectricFieldActive && (
                                <g>
                                    <rect x="5" y="5" width="250" height="200" rx="12" fill="rgba(56,189,248,0.02)" stroke="rgba(56,189,248,0.18)" strokeDasharray="4 4" />
                                    <rect x="8" y="80" width="16" height="50" rx="4" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" strokeWidth="1" />
                                    <text x="16" y="110" fill="#38bdf8" fontSize="14" fontWeight="900" textAnchor="middle">−</text>
                                    <text x="16" y="72" fill="#38bdf8" fontSize="7" fontWeight="bold" textAnchor="middle">Cátodo (−)</text>

                                    <rect x="236" y="80" width="16" height="50" rx="4" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1" />
                                    <text x="244" y="110" fill="#f87171" fontSize="14" fontWeight="900" textAnchor="middle">+</text>
                                    <text x="244" y="72" fill="#f87171" fontSize="7" fontWeight="bold" textAnchor="middle">Ánodo (+)</text>

                                    <line x1="24" y1="105" x2="236" y2="105" stroke="url(#streamGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
                                </g>
                            )}

                            {/* Centro: Núcleo y Órbitas */}
                            <g transform="translate(130, 105)">

                                {/* ── MODO COMPLETO: MUESTRA TODAS LAS 4 CAPAS ── */}
                                {!isValenceOnly && (
                                    <>
                                        {/* Órbitas concéntricas K, L, M, N */}
                                        {shells.map((s) => (
                                            <circle
                                                key={s.name}
                                                r={s.radius}
                                                fill="none"
                                                stroke={s.isValence ? (isElectricFieldActive ? '#38bdf8' : ORBIT_COLOR) : ORBIT_COLOR}
                                                strokeWidth={s.isValence ? '1.5' : '1'}
                                                strokeDasharray={s.isValence ? '4 3' : '3 2'}
                                            />
                                        ))}

                                        {/* Núcleo Anatómico con Protones y Neutrones */}
                                        <g id="nucleus-group">
                                            <circle cx="-5" cy="-4" r="5.5" fill="url(#neutronGrad)" />
                                            <circle cx="5"  cy="-3" r="5.5" fill="url(#protonGrad)" />
                                            <circle cx="-4" cy="5"  r="5.5" fill="url(#protonGrad)" />
                                            <circle cx="4"  cy="4"  r="5.5" fill="url(#neutronGrad)" />
                                            <circle cx="0"  cy="-6" r="5.5" fill="url(#protonGrad)" />
                                            <circle cx="0"  cy="0"  r="6.5" fill="url(#protonGrad)" />
                                        </g>

                                        {/* Electrones de Capas Internas (K=2, L=8, M=18) */}
                                        {shells.filter(s => !s.isValence).map((s) => {
                                            const dur = `${s.baseDur}s`;
                                            return Array.from({ length: s.count }).map((_, eIdx) => {
                                                const angle = (eIdx / s.count) * 360;
                                                return (
                                                    <g key={`${s.name}-${eIdx}`}>
                                                        <circle
                                                            cx={s.radius}
                                                            cy="0"
                                                            r="2.8"
                                                            fill={ELECTRON_COLOR}
                                                            filter="url(#blueElectronGlow)"
                                                        >
                                                            <animateTransform
                                                                attributeName="transform"
                                                                type="rotate"
                                                                from={`${angle} 0 0`}
                                                                to={`${angle + 360} 0 0`}
                                                                dur={dur}
                                                                repeatCount="indefinite"
                                                            />
                                                        </circle>
                                                    </g>
                                                );
                                            });
                                        })}
                                    </>
                                )}

                                {/* ── MODO SOLO VALENCIA: KERNEL CENTRAL + CAPA DE VALENCIA N ── */}
                                {isValenceOnly && (
                                    <>
                                        {/* Solo Órbita Externa de Valencia (Radio 82) */}
                                        <circle
                                            r="82"
                                            fill="none"
                                            stroke={isElectricFieldActive ? '#38bdf8' : '#fbbf24'}
                                            strokeWidth="2"
                                            strokeDasharray="5 3"
                                        />

                                        {/* Carozo Atómico / Kernel Central (Núcleo + 28 e⁻ internos = Carga Neta +1) */}
                                        <g id="kernel-group">
                                            <circle cx="0" cy="0" r="24" fill="url(#kernelGrad)" stroke="#fbbf24" strokeWidth="2" />
                                            <text x="0" y="5" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900" fontFamily="sans-serif">
                                                Cu⁺¹
                                            </text>
                                        </g>
                                    </>
                                )}

                                {/* ── ELECTRÓN DE VALENCIA N (SIEMPRE ACTIVO Y ANIMADO) ── */}
                                {!isElectricFieldActive ? (
                                    /* Modo Reposo: 1 electrón azul orbitando armónicamente */
                                    <circle r={isValenceOnly ? "5.5" : "4.5"} fill={ELECTRON_COLOR} filter="url(#blueElectronGlow)">
                                        <animateMotion
                                            dur={`${restingDuration}s`}
                                            repeatCount="indefinite"
                                            path={restingPath}
                                        />
                                    </circle>
                                ) : (
                                    /* Modo Conducción: Entra por (−), recorre media vuelta y sale por (+) */
                                    <circle r={isValenceOnly ? "5.5" : "4.5"} fill={ELECTRON_COLOR} filter="url(#blueElectronGlow)">
                                        <animateMotion
                                            dur={`${conductionDuration}s`}
                                            repeatCount="indefinite"
                                            path={conductionPath}
                                        />
                                        <animate
                                            attributeName="opacity"
                                            values="0; 1; 1; 1; 0"
                                            keyTimes="0; 0.12; 0.5; 0.88; 1"
                                            dur={`${conductionDuration}s`}
                                            repeatCount="indefinite"
                                        />
                                    </circle>
                                )}
                            </g>
                        </svg>
                    </div>

                    {/* Explicación y Controles */}
                    <div className="sim-controls">
                        {/* Selector de modo explicativo */}
                        <div style={{
                            background: isValenceOnly ? 'rgba(245, 158, 11, 0.1)' : 'rgba(56, 189, 248, 0.08)',
                            border: `1px solid ${isValenceOnly ? 'rgba(245, 158, 11, 0.3)' : 'rgba(56, 189, 248, 0.25)'}`,
                            borderRadius: '10px',
                            padding: '0.65rem 0.85rem'
                        }}>
                            <div style={{ color: isValenceOnly ? '#fbbf24' : '#38bdf8', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {isValenceOnly ? '🎯 Modelo Simplificado de Valencia (Kernel)' : '⚛️ Modelo Atómico Completo'}
                            </div>
                            <p style={{ color: '#cbd5e1', fontSize: '0.75rem', lineHeight: '1.5', margin: '4px 0 0' }}>
                                {isValenceOnly
                                    ? 'Se ocultan las 3 capas internas llenas (K:2, L:8, M:18 = 28 e⁻) que forman el carozo atómico "Cu⁺¹", dejando visible únicamente el electrón de la capa N, que es el que produce la corriente eléctrica.'
                                    : 'Muestra los 29 electrones del Cobre distribuidos en sus 4 niveles energéticos según el principio de Bohr.'}
                            </p>
                        </div>

                        {/* Botón de interactividad de voltaje */}
                        <button
                            className={`sim-btn ${isElectricFieldActive ? 'sim-btn-primary' : 'sim-btn-secondary'}`}
                            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.88rem' }}
                            onClick={() => setIsElectricFieldActive(prev => !prev)}
                        >
                            <Zap size={16} color={isElectricFieldActive ? '#38bdf8' : undefined} />
                            {isElectricFieldActive ? '⚡ Campo Activo (Cátodo − → Ánodo +)' : '⚡ Aplicar Voltaje / Campo Eléctrico'}
                        </button>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                            {isElectricFieldActive ? (
                                <span style={{ color: '#34d399', fontWeight: 600 }}>
                                    ✓ <strong>Salto del Electrón Libre:</strong> El electrón libre de valencia es impulsado por la diferencia de potencial (voltaje) y viaja de átomo en átomo.
                                </span>
                            ) : (
                                <span>
                                    💡 Haz clic en <strong>Aplicar Voltaje</strong> para ver el desprendimiento y tránsito del electrón de valencia.
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
