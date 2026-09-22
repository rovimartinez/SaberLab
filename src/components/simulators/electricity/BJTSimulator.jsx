import { useState, useEffect, useCallback } from 'react';
import { Zap, RotateCcw, CheckCircle, XCircle, ChevronRight, Info } from 'lucide-react';

// ─── Constantes ─────────────────────────────────────────────────────────────
const VCC = 5.0;       // Voltios
const VBE = 0.7;       // Umbral Base-Emisor silicio
const VCE_SAT = 0.2;   // Voltaje saturación Colector-Emisor

// Presets de transistores comerciales
const TRANSISTORS = {
    '2N2222 (NPN)': { type: 'NPN', beta: 150, ic_max: 0.8, vce_max: 40, package: 'TO-92' },
    'BC547 (NPN)':  { type: 'NPN', beta: 220, ic_max: 0.1, vce_max: 45, package: 'TO-92' },
    'BD139 (NPN)':  { type: 'NPN', beta: 100, ic_max: 1.5, vce_max: 80, package: 'TO-126' },
    'BC557 (PNP)':  { type: 'PNP', beta: 200, ic_max: 0.1, vce_max: 45, package: 'TO-92' },
    '2N3906 (PNP)': { type: 'PNP', beta: 100, ic_max: 0.2, vce_max: 40, package: 'TO-92' },
};

// ─── Retos guiados ───────────────────────────────────────────────────────────
const CHALLENGES = [
    {
        id: 'c1',
        title: 'Reto 1: Transistor NPN como Interruptor ON',
        description: 'Configura el transistor 2N2222 (NPN) para encender completamente el LED de la carga. Ajusta la resistencia de base (R_B) para saturarlo y que V_CE quede por debajo de 0.3V.',
        transistor: '2N2222 (NPN)',
        rl: 220,
        target: { region: 'Saturación', vce_max: 0.3 },
        hint: 'Baja R_B hasta que I_B supere I_C / (β / 3). Recuerda: R_B = (V_IN − 0.7V) / I_B',
    },
    {
        id: 'c2',
        title: 'Reto 2: Transistor NPN en Corte (OFF)',
        description: 'Deja el transistor 2N2222 completamente apagado (Corte). El LED debe quedar apagado y V_CE debe ser igual a V_CC.',
        transistor: '2N2222 (NPN)',
        rl: 220,
        target: { region: 'Corte', vce_min: VCC - 0.2 },
        hint: 'Para entrar en corte, la señal de entrada debe ser 0V (nivel BAJO). No fluye corriente por la Base.',
    },
    {
        id: 'c3',
        title: 'Reto 3: Control de Brillo (Zona Activa Lineal)',
        description: 'Ajusta R_B para que el transistor BC547 trabaje en región activa con una corriente de colector de exactamente 45 mA (50% del máximo de la carga).',
        transistor: 'BC547 (NPN)',
        rl: 100,
        target: { region: 'Activa', ic_target_mA: 45, ic_margin: 5 },
        hint: 'En región activa: I_C = β × I_B. Ajusta suavemente R_B hasta que el amperímetro del colector muestre cerca de 45 mA.',
    },
    {
        id: 'c4',
        title: 'Reto 4: Transistor PNP como Interruptor ON',
        description: 'Ahora usa el BC557 (PNP). Recuerda que en un PNP la carga va entre V_CC y el Colector, y la Base se activa llevándola a nivel BAJO (GND).',
        transistor: 'BC557 (PNP)',
        rl: 220,
        target: { region: 'Saturación', vce_max: 0.3 },
        hint: 'En PNP: la corriente fluye del Emisor al Colector cuando V_BE < -0.7V. La señal de entrada BAJA activa el transistor.',
    },
    {
        id: 'c5',
        title: 'Reto 5: Protección con Diodo Flyback',
        description: 'Cambia la carga a una bobina (Inductor). Activa el flyback y observa cómo el pico inductivo queda absorbido. Luego desactívalo y nota la diferencia en el V_CE pico.',
        transistor: '2N2222 (NPN)',
        rl: 100,
        target: { flyback: true },
        hint: 'El diodo flyback protege al transistor de la fuerza contraelectromotriz (Back-EMF) de cargas inductivas.',
    },
];

// ─── Componente SVG del Transistor BJT ──────────────────────────────────────
function TransistorSymbol({ type, active, region, x = 0, y = 0 }) {
    const color = region === 'Saturación' ? '#10b981' : region === 'Activa' ? '#38bdf8' : '#ef4444';
    const glow = active ? `drop-shadow(0 0 6px ${color})` : 'none';

    if (type === 'NPN') {
        return (
            <g transform={`translate(${x},${y})`} style={{ filter: glow }}>
                {/* Cuerpo vertical del transistor */}
                <line x1="0" y1="-30" x2="0" y2="30" stroke={color} strokeWidth="3" />
                {/* Colector */}
                <line x1="0" y1="-18" x2="28" y2="-36" stroke={color} strokeWidth="2.5" />
                {/* Emisor con flecha */}
                <line x1="0" y1="18" x2="28" y2="36" stroke={color} strokeWidth="2.5" />
                {/* Flecha del emisor (NPN apunta hacia afuera) */}
                <polygon points="20,28 28,36 18,38" fill={color} />
                {/* Base */}
                <line x1="-30" y1="0" x2="0" y2="0" stroke={color} strokeWidth="2.5" />
                {/* Etiquetas */}
                <text x="34" y="-33" fill={color} fontSize="10" fontWeight="bold">C</text>
                <text x="-44" y="4" fill={color} fontSize="10" fontWeight="bold">B</text>
                <text x="34" y="42" fill={color} fontSize="10" fontWeight="bold">E</text>
                {/* Círculo del encapsulado */}
                <circle cx="0" cy="0" r="34" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="none" opacity="0.5" />
            </g>
        );
    }
    // PNP
    return (
        <g transform={`translate(${x},${y})`} style={{ filter: glow }}>
            <line x1="0" y1="-30" x2="0" y2="30" stroke={color} strokeWidth="3" />
            <line x1="0" y1="-18" x2="28" y2="-36" stroke={color} strokeWidth="2.5" />
            <line x1="0" y1="18" x2="28" y2="36" stroke={color} strokeWidth="2.5" />
            {/* Flecha del emisor PNP apunta hacia adentro (hacia la base) */}
            <polygon points="8,13 0,18 10,23" fill={color} />
            <line x1="-30" y1="0" x2="0" y2="0" stroke={color} strokeWidth="2.5" />
            <text x="34" y="-33" fill={color} fontSize="10" fontWeight="bold">C</text>
            <text x="-44" y="4" fill={color} fontSize="10" fontWeight="bold">B</text>
            <text x="34" y="42" fill={color} fontSize="10" fontWeight="bold">E</text>
            <circle cx="0" cy="0" r="34" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
        </g>
    );
}

// ─── Partícula de electrón animada ──────────────────────────────────────────
function ElectronParticle({ path, progress, color = '#38bdf8' }) {
    if (!path || path.length < 2) return null;
    const idx = Math.floor(progress * (path.length - 1));
    const pt = path[idx] || path[path.length - 1];
    return (
        <circle cx={pt[0]} cy={pt[1]} r={4} fill={color} opacity={0.9}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    );
}

// ─── Simulador Principal ─────────────────────────────────────────────────────
export default function BJTSimulator() {
    const [selectedTransistor, setSelectedTransistor] = useState('2N2222 (NPN)');
    const [rl, setRl] = useState(220);             // Resistencia de carga (Ω)
    const [rb, setRb] = useState(4700);            // Resistencia de base (Ω)
    const [inputHigh, setInputHigh] = useState(false); // Señal de entrada (5V o 0V)
    const [vcc] = useState(VCC);
    const [showFlyback, setShowFlyback] = useState(false);
    const [isInductive, setIsInductive] = useState(false);
    const [animTick, setAnimTick] = useState(0);
    const [challengeIdx, setChallengeIdx] = useState(null);
    const [challengeResult, setChallengeResult] = useState(null);
    const [activeTab, setActiveTab] = useState('manual');

    const transistor = TRANSISTORS[selectedTransistor];
    const isNPN = transistor.type === 'NPN';

    // ── Cálculos del circuito ────────────────────────────────────────────────
    const vin = inputHigh ? (isNPN ? vcc : 0) : (isNPN ? 0 : vcc);

    // NPN: Base se activa con señal ALTA. PNP: Base se activa con señal BAJA.
    const vbeEffective = isNPN
        ? (inputHigh ? VBE : 0)
        : (!inputHigh ? VBE : 0);

    const ibRaw = rb > 0 ? (vcc - vbeEffective) / rb : 0;
    const ib = vbeEffective > 0 ? Math.max(0, ibRaw) : 0;  // A
    const ib_mA = ib * 1000;

    const icActive = transistor.beta * ib;             // Corriente en zona activa
    const icMax = rl > 0 ? (vcc - VCE_SAT) / rl : 0; // Corriente máxima (saturación)
    const ic = Math.min(icActive, icMax);              // A real
    const ic_mA = ic * 1000;

    const vce = ib > 0
        ? (ic < icMax * 0.99 ? vcc - ic * rl : VCE_SAT)
        : vcc;

    const pd_mW = ic * vce * 1000; // Potencia disipada en el transistor

    // Región de trabajo
    const region = ib <= 0 ? 'Corte'
        : ic >= icMax * 0.98 ? 'Saturación'
        : 'Activa';

    const regionColor = region === 'Saturación' ? '#10b981' : region === 'Activa' ? '#38bdf8' : '#ef4444';

    // Brillo del LED según corriente (normalizado)
    const ledBrightness = Math.min(1, ic / (rl > 0 ? (vcc / rl) : 1));
    const ledColor = ledBrightness > 0.05 ? `rgba(251,191,36,${0.3 + ledBrightness * 0.7})` : 'rgba(255,255,255,0.08)';

    // ── Animación de electrones ──────────────────────────────────────────────
    useEffect(() => {
        if (ic < 0.001) return;
        const interval = setInterval(() => {
            setAnimTick(t => (t + 0.04) % 1);
        }, 40);
        return () => clearInterval(interval);
    }, [ic]);

    // Trayectorias de electrones (NPN): VCC → Carga → Colector → Emisor → GND
    const pathCollector = [
        [220, 40], [220, 120], [195, 148]  // VCC → carga → colector
    ];
    const pathEmitter = [
        [233, 192], [233, 280], [80, 280], [80, 40]  // Emisor → GND → VCC
    ];
    const pathBase = [
        [60, 185], [100, 185], [160, 185]  // Señal → RB → Base
    ];

    // ── Validación de reto ───────────────────────────────────────────────────
    const validateChallenge = useCallback(() => {
        if (challengeIdx === null) return;
        const ch = CHALLENGES[challengeIdx];
        const t = ch.target;
        let passed = false;

        if (t.region === 'Saturación' && region === 'Saturación' && vce <= (t.vce_max ?? 0.4)) passed = true;
        if (t.region === 'Corte' && region === 'Corte') passed = true;
        if (t.region === 'Activa' && region === 'Activa' && t.ic_target_mA) {
            passed = Math.abs(ic_mA - t.ic_target_mA) <= (t.ic_margin ?? 5);
        }
        if (t.flyback !== undefined) passed = showFlyback === t.flyback;

        setChallengeResult(passed ? 'pass' : 'fail');
    }, [challengeIdx, region, vce, ic_mA, showFlyback]);

    // ── Cargar configuración del reto ────────────────────────────────────────
    const loadChallenge = (idx) => {
        const ch = CHALLENGES[idx];
        setChallengeIdx(idx);
        setChallengeResult(null);
        setSelectedTransistor(ch.transistor);
        setRl(ch.rl);
        setRb(10000);
        setInputHigh(false);
        setShowFlyback(false);
        setIsInductive(ch.id === 'c5');
        setActiveTab('reto');
    };

    // ── Layout SVG del circuito ──────────────────────────────────────────────
    const svgW = 420, svgH = 340;
    // Posiciones clave
    const tx = 215, ty = 168;   // Centro del transistor
    const vccY = 40, gndY = 295;
    const loadTop = 55, loadBot = 130;

    return (
        <div className="simulator-dark-context" style={{
            background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1829 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(56,189,248,0.2)',
            padding: '1.5rem',
            fontFamily: "'Inter', sans-serif",
        }}>
            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h3 style={{ color: '#38bdf8', margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                        ⚡ Simulador BJT — Transistor como Interruptor
                    </h3>
                    <p style={{ color: '#64748b', margin: '2px 0 0', fontSize: '0.78rem' }}>
                        Aprende a conectar transistores NPN y PNP interactivamente
                    </p>
                </div>
                <span style={{
                    background: `rgba(${region === 'Saturación' ? '16,185,129' : region === 'Activa' ? '56,189,248' : '239,68,68'}, 0.15)`,
                    color: regionColor,
                    border: `1px solid ${regionColor}`,
                    borderRadius: '20px', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 800
                }}>
                    {region}
                </span>
            </div>

            {/* ── Tabs ── */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
                {[{ id: 'manual', label: '🔧 Modo Libre' }, { id: 'reto', label: '🏆 Retos' }].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        background: activeTab === tab.id ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.05)',
                        border: activeTab === tab.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                        color: activeTab === tab.id ? '#38bdf8' : '#64748b',
                        borderRadius: '8px', padding: '6px 14px', cursor: 'pointer',
                        fontSize: '0.82rem', fontWeight: 700, transition: 'all 0.2s',
                    }}>{tab.label}</button>
                ))}
            </div>

            {/* ── Panel de Retos ── */}
            {activeTab === 'reto' && (
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'grid', gap: '8px', marginBottom: '1rem' }}>
                        {CHALLENGES.map((ch, i) => (
                            <button key={ch.id} onClick={() => loadChallenge(i)} style={{
                                background: challengeIdx === i ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.03)',
                                border: challengeIdx === i ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '10px', padding: '10px 14px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left',
                                transition: 'all 0.2s',
                            }}>
                                <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1rem', minWidth: 24 }}>{i + 1}</span>
                                <div>
                                    <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 700 }}>{ch.title}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 2 }}>{ch.description}</div>
                                </div>
                                <ChevronRight size={16} color="#38bdf8" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                            </button>
                        ))}
                    </div>

                    {challengeIdx !== null && (
                        <div style={{
                            background: 'rgba(245,158,11,0.08)',
                            border: '1px solid rgba(245,158,11,0.3)',
                            borderRadius: '12px', padding: '12px 14px', marginBottom: '1rem',
                        }}>
                            <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem', marginBottom: 4, display: 'flex', gap: 6 }}>
                                <Info size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                                💡 Pista: {CHALLENGES[challengeIdx].hint}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button onClick={validateChallenge} style={{
                                    background: 'rgba(56,189,248,0.2)', border: '1px solid #38bdf8',
                                    borderRadius: '8px', padding: '8px 16px', color: '#38bdf8',
                                    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
                                }}>
                                    ✅ Verificar Solución
                                </button>
                                {challengeResult === 'pass' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                                        <CheckCircle size={18} /> ¡Reto Superado!
                                    </div>
                                )}
                                {challengeResult === 'fail' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>
                                        <XCircle size={18} /> Aún no. Ajusta los controles.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Layout principal: SVG + Controles ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>

                {/* ── SVG del circuito ── */}
                <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: '16px', padding: '0.5rem', border: '1px solid rgba(56,189,248,0.15)' }}>
                    <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: 'auto' }}>
                        {/* ─── V_CC ─── */}
                        <text x="205" y="24" fill="#ef4444" fontSize="13" fontWeight="bold" textAnchor="middle">+{vcc}V (V_CC)</text>
                        <line x1="215" y1="28" x2="215" y2="40" stroke="#ef4444" strokeWidth="2" />
                        <line x1="185" y1="40" x2="245" y2="40" stroke="#ef4444" strokeWidth="2.5" />

                        {/* ─── GND ─── */}
                        <line x1="215" y1={gndY - 5} x2="215" y2={gndY + 10} stroke="#64748b" strokeWidth="2" />
                        <line x1="200" y1={gndY + 10} x2="230" y2={gndY + 10} stroke="#64748b" strokeWidth="2.5" />
                        <line x1="206" y1={gndY + 16} x2="224" y2={gndY + 16} stroke="#64748b" strokeWidth="2" />
                        <line x1="211" y1={gndY + 22} x2="219" y2={gndY + 22} stroke="#64748b" strokeWidth="1.5" />
                        <text x="215" y={gndY + 36} fill="#64748b" fontSize="11" textAnchor="middle">GND</text>

                        {/* ─── Carga (LED / Resistor / Bobina) ─── */}
                        <line x1="215" y1="40" x2="215" y2="58" stroke="#38bdf8" strokeWidth="2.5" />
                        {/* LED o Resistor */}
                        <rect x="196" y="58" width="38" height="56" rx="8"
                            fill={isInductive ? 'rgba(168,85,247,0.15)' : ledColor}
                            stroke={isInductive ? '#a855f7' : (ledBrightness > 0.05 ? '#fbbf24' : '#334155')}
                            strokeWidth="2" />
                        <text x="215" y="82" fill={isInductive ? '#a855f7' : '#f59e0b'} fontSize="9" fontWeight="bold" textAnchor="middle">
                            {isInductive ? 'L' : 'LED'}
                        </text>
                        <text x="215" y="96" fill="#94a3b8" fontSize="9" textAnchor="middle">{rl} Ω</text>
                        {/* Resplandor LED */}
                        {ledBrightness > 0.1 && !isInductive && (
                            <circle cx="215" cy="86" r={8 + ledBrightness * 16} fill="#fbbf24"
                                opacity={ledBrightness * 0.35}
                                style={{ filter: 'blur(6px)' }} />
                        )}
                        <line x1="215" y1="114" x2="215" y2={loadBot} stroke="#38bdf8" strokeWidth="2.5" />

                        {/* ─── Transistor ─── */}
                        <TransistorSymbol type={transistor.type} active={ic > 0.001} region={region} x={tx} y={ty} />

                        {/* Línea Colector */}
                        <line x1="215" y1={loadBot} x2="215" y2={ty - 18}
                            stroke={region !== 'Corte' ? regionColor : '#334155'} strokeWidth="2.5" />

                        {/* Línea Emisor → GND */}
                        <line x1="243" y1={ty + 36} x2="243" y2={gndY - 5}
                            stroke={region !== 'Corte' ? regionColor : '#334155'} strokeWidth="2.5" />
                        <line x1="215" y1={gndY - 5} x2="243" y2={gndY - 5}
                            stroke={region !== 'Corte' ? regionColor : '#334155'} strokeWidth="2.5" />

                        {/* ─── Circuito de Base ─── */}
                        {/* Señal de entrada */}
                        <rect x="20" y="160" width="48" height="46" rx="10"
                            fill={inputHigh ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.1)'}
                            stroke={inputHigh ? '#10b981' : '#ef4444'} strokeWidth="2" />
                        <text x="44" y="179" fill={inputHigh ? '#10b981' : '#ef4444'} fontSize="10" fontWeight="bold" textAnchor="middle">V_IN</text>
                        <text x="44" y="196" fill={inputHigh ? '#10b981' : '#ef4444'} fontSize="12" fontWeight="800" textAnchor="middle">
                            {isNPN ? (inputHigh ? '5V' : '0V') : (inputHigh ? '5V' : '0V')}
                        </text>

                        {/* R_B */}
                        <line x1="68" y1="183" x2="88" y2="183" stroke="#38bdf8" strokeWidth="2" />
                        <rect x="88" y="172" width="52" height="22" rx="6"
                            fill="rgba(15,23,42,0.8)" stroke="#38bdf8" strokeWidth="2" />
                        <text x="114" y="181" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">R_B</text>
                        <text x="114" y="191" fill="#94a3b8" fontSize="8" textAnchor="middle">{rb >= 1000 ? (rb / 1000).toFixed(1) + 'k' : rb} Ω</text>
                        <line x1="140" y1="183" x2={tx - 34} y2="183" stroke="#38bdf8" strokeWidth="2" />

                        {/* ─── Diodo Flyback ─── */}
                        {showFlyback && (
                            <g>
                                <line x1="260" y1="58" x2="260" y2={loadBot} stroke="#a855f7" strokeWidth="1.5" strokeDasharray="5,3" />
                                <polygon points="260,110 255,96 265,96" fill="#a855f7" />
                                <text x="272" y="90" fill="#a855f7" fontSize="9" fontWeight="bold">Flyback</text>
                                <text x="272" y="100" fill="#a855f7" fontSize="9">1N4007</text>
                            </g>
                        )}

                        {/* ─── Electrones animados ─── */}
                        {ic > 0.001 && (
                            <>
                                <ElectronParticle path={pathCollector} progress={animTick} color={regionColor} />
                                <ElectronParticle path={pathCollector} progress={(animTick + 0.5) % 1} color={regionColor} />
                                <ElectronParticle path={pathEmitter} progress={(animTick + 0.25) % 1} color={regionColor} />
                                <ElectronParticle path={pathEmitter} progress={(animTick + 0.75) % 1} color={regionColor} />
                            </>
                        )}
                        {ib > 0.0001 && (
                            <ElectronParticle path={pathBase} progress={animTick} color="#fbbf24" />
                        )}

                        {/* ─── Medidores en el circuito ─── */}
                        {/* V_CE label */}
                        <text x="258" y={ty + 5} fill="#94a3b8" fontSize="9">V_CE</text>
                        <text x="258" y={ty + 17} fill={regionColor} fontSize="10" fontWeight="bold">
                            {vce.toFixed(2)}V
                        </text>

                        {/* I_C label */}
                        <text x="165" y={ty - 30} fill="#94a3b8" fontSize="9">I_C</text>
                        <text x="165" y={ty - 18} fill={regionColor} fontSize="10" fontWeight="bold">
                            {ic_mA.toFixed(1)}mA
                        </text>

                        {/* I_B label */}
                        <text x="100" y="155" fill="#94a3b8" fontSize="9">I_B</text>
                        <text x="100" y="165" fill="#fbbf24" fontSize="9" fontWeight="bold">
                            {ib_mA.toFixed(2)}mA
                        </text>
                    </svg>

                    {/* Botón de señal de entrada */}
                    <div style={{ textAlign: 'center', marginTop: '4px' }}>
                        <button
                            onClick={() => setInputHigh(v => !v)}
                            style={{
                                background: inputHigh ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.15)',
                                border: `2px solid ${inputHigh ? '#10b981' : '#ef4444'}`,
                                borderRadius: '10px', padding: '10px 28px',
                                color: inputHigh ? '#10b981' : '#ef4444',
                                cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem',
                                transition: 'all 0.25s', letterSpacing: '0.5px',
                            }}>
                            {inputHigh
                                ? (isNPN ? '🟢 Señal ALTA (5V) — Transistor Activo' : '🟢 Señal ALTA (5V) — PNP OFF')
                                : (isNPN ? '🔴 Señal BAJA (0V) — Transistor Apagado' : '🔴 Señal BAJA (0V) — PNP Activo')}
                        </button>
                    </div>
                </div>

                {/* ── Panel de Controles ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>

                    {/* Selector de Transistor */}
                    <div style={{ background: 'rgba(15,23,42,0.7)', borderRadius: '14px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: '8px', fontWeight: 700 }}>🔌 TRANSISTOR</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {Object.keys(TRANSISTORS).map(name => {
                                const t = TRANSISTORS[name];
                                return (
                                    <button key={name} onClick={() => setSelectedTransistor(name)} style={{
                                        background: selectedTransistor === name
                                            ? `rgba(${t.type === 'NPN' ? '56,189,248' : '245,158,11'}, 0.15)`
                                            : 'rgba(255,255,255,0.03)',
                                        border: selectedTransistor === name
                                            ? `1px solid ${t.type === 'NPN' ? '#38bdf8' : '#f59e0b'}`
                                            : '1px solid rgba(255,255,255,0.07)',
                                        borderRadius: '8px', padding: '8px 10px',
                                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                    }}>
                                        <span style={{
                                            color: t.type === 'NPN' ? '#38bdf8' : '#fbbf24',
                                            fontWeight: 800, fontSize: '0.82rem'
                                        }}>{name}</span>
                                        <span style={{ color: '#64748b', fontSize: '0.72rem', marginLeft: 8 }}>
                                            β={t.beta} · IC={t.ic_max * 1000}mA · {t.package}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sliders */}
                    <div style={{ background: 'rgba(15,23,42,0.7)', borderRadius: '14px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: '10px', fontWeight: 700 }}>🎛️ AJUSTAR RESISTENCIAS</div>

                        {/* R_B */}
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <label style={{ color: '#38bdf8', fontSize: '0.82rem', fontWeight: 700 }}>R_B (Base)</label>
                                <span style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 800 }}>
                                    {rb >= 1000 ? (rb / 1000).toFixed(1) + ' kΩ' : rb + ' Ω'}
                                </span>
                            </div>
                            <input type="range" min="100" max="100000" step="100" value={rb}
                                onChange={e => setRb(Number(e.target.value))}
                                style={{ width: '100%', accentColor: '#38bdf8' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '0.7rem' }}>
                                <span>100 Ω (máx I_B)</span><span>100 kΩ (Corte)</span>
                            </div>
                        </div>

                        {/* R_L (Carga) */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <label style={{ color: '#fbbf24', fontSize: '0.82rem', fontWeight: 700 }}>R_L (Carga)</label>
                                <span style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 800 }}>{rl} Ω</span>
                            </div>
                            <input type="range" min="47" max="2200" step="47" value={rl}
                                onChange={e => setRl(Number(e.target.value))}
                                style={{ width: '100%', accentColor: '#fbbf24' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '0.7rem' }}>
                                <span>47 Ω</span><span>2.2 kΩ</span>
                            </div>
                        </div>
                    </div>

                    {/* Opciones de carga */}
                    <div style={{ background: 'rgba(15,23,42,0.7)', borderRadius: '14px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700, marginBottom: 2 }}>⚙️ OPCIONES AVANZADAS</div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={isInductive} onChange={e => setIsInductive(e.target.checked)}
                                style={{ accentColor: '#a855f7', width: 16, height: 16 }} />
                            <span style={{ color: '#cbd5e1', fontSize: '0.83rem' }}>Carga Inductiva (Motor / Relé)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={showFlyback} onChange={e => setShowFlyback(e.target.checked)}
                                style={{ accentColor: '#a855f7', width: 16, height: 16 }} />
                            <span style={{ color: '#cbd5e1', fontSize: '0.83rem' }}>🛡️ Activar Diodo Flyback 1N4007</span>
                        </label>
                    </div>

                    {/* Telemetría en vivo */}
                    <div style={{ background: 'rgba(15,23,42,0.9)', borderRadius: '14px', padding: '1rem', border: `1px solid ${regionColor}55` }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700, marginBottom: '10px' }}>📊 TELEMETRÍA EN VIVO</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {[
                                { label: 'I_B (Base)', value: `${ib_mA.toFixed(3)} mA`, color: '#fbbf24' },
                                { label: 'I_C (Colector)', value: `${ic_mA.toFixed(2)} mA`, color: regionColor },
                                { label: 'V_CE', value: `${vce.toFixed(3)} V`, color: regionColor },
                                { label: 'P_CE (Calor)', value: `${pd_mW.toFixed(1)} mW`, color: pd_mW > 500 ? '#ef4444' : '#94a3b8' },
                                { label: 'β efectivo', value: ib > 0 ? `${(ic / ib).toFixed(0)}` : '—', color: '#38bdf8' },
                                { label: 'Región', value: region, color: regionColor },
                            ].map(m => (
                                <div key={m.label} style={{
                                    background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '7px 10px',
                                    borderLeft: `3px solid ${m.color}44`
                                }}>
                                    <div style={{ color: '#64748b', fontSize: '0.7rem' }}>{m.label}</div>
                                    <div style={{ color: m.color, fontWeight: 800, fontSize: '0.88rem' }}>{m.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Advertencia de sobrecorriente */}
                        {ic > transistor.ic_max * 0.9 && (
                            <div style={{
                                marginTop: '8px', background: 'rgba(239,68,68,0.15)',
                                border: '1px solid #ef4444', borderRadius: '8px',
                                padding: '6px 10px', color: '#ef4444', fontSize: '0.78rem', fontWeight: 700,
                            }}>
                                ⚠️ ¡ADVERTENCIA! I_C ({ic_mA.toFixed(0)} mA) supera el límite del transistor ({transistor.ic_max * 1000} mA). ¡Se destruiría en la realidad!
                            </div>
                        )}
                    </div>

                    {/* Reset */}
                    <button onClick={() => { setRb(4700); setRl(220); setInputHigh(false); setShowFlyback(false); setIsInductive(false); setChallengeResult(null); }} style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px', padding: '8px', color: '#64748b',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        fontSize: '0.8rem', transition: 'all 0.2s',
                    }}>
                        <RotateCcw size={14} /> Restablecer valores por defecto
                    </button>
                </div>
            </div>

            {/* ── Fórmulas de referencia rápida ── */}
            <div style={{
                marginTop: '1rem', background: 'rgba(0,0,0,0.25)',
                borderRadius: '12px', padding: '10px 14px',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px',
            }}>
                {[
                    { label: 'I_B = (V_IN − V_BE) / R_B', val: `= (${vcc} − 0.7) / ${rb >= 1000 ? (rb / 1000).toFixed(1) + 'k' : rb} = ${ib_mA.toFixed(3)} mA` },
                    { label: 'I_C = β × I_B (Zona Activa)', val: `= ${transistor.beta} × ${ib_mA.toFixed(3)}mA = ${(transistor.beta * ib * 1000).toFixed(1)} mA` },
                    { label: 'V_CE = V_CC − I_C × R_L', val: `= ${vcc} − ${ic_mA.toFixed(1)}mA × ${rl}Ω = ${vce.toFixed(2)} V` },
                ].map(f => (
                    <div key={f.label} style={{ background: 'rgba(15,23,42,0.6)', borderRadius: '8px', padding: '8px 10px' }}>
                        <div style={{ color: '#38bdf8', fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 700 }}>{f.label}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace', marginTop: '2px' }}>{f.val}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
