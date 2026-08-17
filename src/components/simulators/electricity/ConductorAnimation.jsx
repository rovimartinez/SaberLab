import { useState } from 'react';
import '../../../styles/ElectricitySimulators.css';

// ── SVG de estructura de conductor/aislante con estándar de colores ───────────
function MaterialSVG({ material, voltageOn }) {
    const isConductor = material === 'conductor';

    // ── ESTÁNDAR VISUAL ──
    const ELECTRON_COLOR = '#38bdf8'; // Azul Cian
    const ORBIT_COLOR = 'rgba(245, 158, 11, 0.45)'; // Dorado suave

    // Cuadrícula de 5 átomos en red cristalina metálica
    const atoms = [
        { cx: 60,  cy: 55,  name: isConductor ? 'Cu' : 'Ne', row: 1 },
        { cx: 140, cy: 55,  name: isConductor ? 'Cu' : 'Ne', row: 1 },
        { cx: 220, cy: 55,  name: isConductor ? 'Cu' : 'Ne', row: 1 },
        { cx: 100, cy: 115, name: isConductor ? 'Cu' : 'Ne', row: 2 },
        { cx: 180, cy: 115, name: isConductor ? 'Cu' : 'Ne', row: 2 },
    ];

    const orbitRadius = 22; // Órbita circular uniforme

    // Trayectorias de salto de electrón en electrón a través de las órbitas doradas
    const pathTop = "M 10 55 L 38 55 A 22 22 0 0 1 82 55 L 118 55 A 22 22 0 0 1 162 55 L 198 55 A 22 22 0 0 1 242 55 L 270 55";
    const pathBot = "M 10 115 L 78 115 A 22 22 0 0 1 122 115 L 158 115 A 22 22 0 0 1 202 115 L 270 115";

    return (
        <svg viewBox="0 0 280 160" width="100%" height="175" xmlns="http://www.w3.org/2000/svg">
            <defs>
                {/* Gradiente Núcleo: Protones Rojos */}
                <radialGradient id="protonCoreGrad" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="100%" stopColor="#dc2626" />
                </radialGradient>
                {/* Gradiente Neutrones / Núcleo Gas Noble */}
                <radialGradient id="insulatorCoreGrad" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#64748b" />
                </radialGradient>
                {/* Resplandor azul para electrones */}
                <filter id="electronGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Etiqueta del material */}
            <text x="140" y="15" textAnchor="middle" fill={isConductor ? '#38bdf8' : '#cbd5e1'} fontSize="11" fontWeight="bold">
                {isConductor ? '⚡ CONDUCTOR: 1 Electrón Azul Libre saltando entre átomos' : '🛑 AISLANTE: 8 Electrones Azules fijos en su órbita dorada (Octeto)'}
            </text>

            {/* Átomos y sus órbitas */}
            {atoms.map((a, i) => (
                <g key={i}>
                    {/* Órbita Circular en Dorado Suave */}
                    <circle
                        cx={a.cx}
                        cy={a.cy}
                        r={orbitRadius}
                        fill="none"
                        stroke={ORBIT_COLOR}
                        strokeWidth="1.2"
                        strokeDasharray={isConductor ? "4,3" : "3,2"}
                    />

                    {/* Núcleo Atómico Compuesto (Rojo y Gris) */}
                    <circle
                        cx={a.cx}
                        cy={a.cy}
                        r="11"
                        fill={isConductor ? "url(#protonCoreGrad)" : "url(#insulatorCoreGrad)"}
                    />
                    <text x={a.cx} y={a.cy + 3.5} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
                        {a.name}
                    </text>

                    {/* Electrones Azules en reposo */}
                    {isConductor ? (
                        /* Conductor sin voltaje: 1 electrón azul girando en cada átomo */
                        !voltageOn && (
                            <g transform={`rotate(${i * 72} ${a.cx} ${a.cy})`}>
                                <circle cx={a.cx + orbitRadius} cy={a.cy} r="3.5" fill={ELECTRON_COLOR} filter="url(#electronGlow)">
                                    <animateTransform
                                        attributeName="transform"
                                        type="rotate"
                                        from={`0 ${a.cx} ${a.cy}`}
                                        to={`360 ${a.cx} ${a.cy}`}
                                        dur="4.5s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                            </g>
                        )
                    ) : (
                        /* Aislante: 8 electrones azules simétricos en cada átomo (octeto) */
                        [0, 45, 90, 135, 180, 225, 270, 315].map((angle, eIdx) => (
                            <g key={eIdx} transform={`rotate(${angle} ${a.cx} ${a.cy})`}>
                                <circle
                                    cx={a.cx + orbitRadius}
                                    cy={a.cy}
                                    r="2.8"
                                    fill={ELECTRON_COLOR}
                                    filter="url(#electronGlow)"
                                >
                                    <animateTransform
                                        attributeName="transform"
                                        type="rotate"
                                        from={`0 ${a.cx} ${a.cy}`}
                                        to={`360 ${a.cx} ${a.cy}`}
                                        dur="6s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                            </g>
                        ))
                    )}
                </g>
            ))}

            {/* ── Conductor con Voltaje: Flujo de electrones azules en cadena ── */}
            {isConductor && voltageOn && (
                <>
                    {/* Electrones Azules saltando en la Fila Superior (Átomos 1, 2 y 3) */}
                    {[0, 1, 2].map((idx) => (
                        <circle key={`top-${idx}`} r="4" fill={ELECTRON_COLOR} filter="url(#electronGlow)">
                            <animateMotion
                                dur="2.4s"
                                repeatCount="indefinite"
                                begin={`-${idx * 0.8}s`}
                                path={pathTop}
                            />
                        </circle>
                    ))}

                    {/* Electrones Azules saltando en la Fila Inferior (Átomos 4 y 5) */}
                    {[0, 1].map((idx) => (
                        <circle key={`bot-${idx}`} r="4" fill={ELECTRON_COLOR} filter="url(#electronGlow)">
                            <animateMotion
                                dur="2.0s"
                                repeatCount="indefinite"
                                begin={`-${idx * 1.0}s`}
                                path={pathBot}
                            />
                        </circle>
                    ))}

                    {/* Indicadores de campo eléctrico: Cátodo (-) Azul, Ánodo (+) Rojo */}
                    <rect x="2" y="40" width="14" height="85" rx="3" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" strokeWidth="1" />
                    <text x="9" y="85" fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">−</text>

                    <rect x="264" y="40" width="14" height="85" rx="3" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1" />
                    <text x="271" y="85" fill="#f87171" fontSize="13" fontWeight="bold" textAnchor="middle">+</text>
                </>
            )}

            {/* ── Aislante con voltaje: mensaje ── */}
            {!isConductor && voltageOn && (
                <g>
                    <rect x="25" y="140" width="230" height="18" rx="6" fill="rgba(15,23,42,0.85)" stroke="rgba(245,158,11,0.4)" strokeWidth="1" />
                    <text x="140" y="152" textAnchor="middle" fill="#fbbf24" fontSize="8.5" fontWeight="600">
                        🔒 Octeto completo: los 8 electrones azules están fuertemente retenidos
                    </text>
                </g>
            )}
        </svg>
    );
}

const MATERIALS = [
    {
        id: 'conductor',
        name: 'Conductor (Cobre)',
        desc: 'En los conductores, los átomos comparten un mar de electrones libres azules. Al aplicar voltaje, los electrones saltan secuencialmente de un átomo a otro a través de todo el material.',
        examples: ['Cobre (Cu)', 'Plata (Ag)', 'Aluminio (Al)', 'Oro (Au)']
    },
    {
        id: 'insulator',
        name: 'Aislante (Capa Completa)',
        desc: 'Los materiales aislantes tienen su capa de valencia completa con 8 electrones azules (regla del octeto) fuertemente ligados al núcleo. Ningún electrón queda libre.',
        examples: ['Plástico / PVC', 'Vidrio', 'Porcelana', 'Goma dieléctrica']
    },
];

export default function ConductorAnimation() {
    const [material, setMaterial] = useState('conductor');
    const [voltageOn, setVoltageOn] = useState(false);

    const selected = MATERIALS.find(m => m.id === material);

    return (
        <div className="sim-card">
            <div className="sim-card-header">
                <h3>⚛️ Conductores y Aislantes a Nivel Atómico</h3>
                <p>Visualiza cómo la cantidad de electrones de valencia define si un material conduce o aísla</p>
            </div>
            <div className="sim-card-body">
                {/* Selector de material */}
                <div className="circuit-sim-tabs" style={{ marginBottom: '1rem' }}>
                    {MATERIALS.map(m => (
                        <button
                            key={m.id}
                            className={`circuit-sim-tab ${material === m.id ? 'active' : ''}`}
                            onClick={() => { setMaterial(m.id); setVoltageOn(false); }}
                        >
                            {m.name}
                        </button>
                    ))}
                </div>

                {/* Visualización SVG */}
                <div className="conductor-svg-wrapper">
                    <MaterialSVG material={material} voltageOn={voltageOn} />
                </div>

                {/* Toggle de voltaje */}
                <div className="conductor-toggle-row" style={{ marginTop: '0.875rem' }}>
                    <span>Sin voltaje</span>
                    <button
                        className={`conductor-toggle ${voltageOn ? 'on' : ''}`}
                        onClick={() => setVoltageOn(prev => !prev)}
                        aria-label="Aplicar voltaje"
                    >
                        <span className="conductor-toggle-thumb" />
                    </button>
                    <span>Con voltaje aplicado</span>
                </div>

                {/* Descripción */}
                <div style={{ marginTop: '1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.875rem' }}>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem', lineHeight: 1.6 }}>{selected?.desc}</p>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {selected?.examples.map(ex => (
                            <span key={ex} style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '99px', color: '#38bdf8', fontWeight: 600 }}>
                                {ex}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
