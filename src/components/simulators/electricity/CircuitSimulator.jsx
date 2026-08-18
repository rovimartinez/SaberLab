import React, { useState, useMemo } from 'react';
import { 
    Zap, Lightbulb, Activity, Play, RotateCcw, Power, 
    Layers, Cpu, Gauge, Sliders, ToggleLeft, ToggleRight,
    Plus, Minus, ArrowRight, Eye, ShieldCheck, Check
} from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

export default function CircuitSimulator() {
    // ── ESTADOS PRINCIPALES ──────────────────────────────────────────────────
    // Tipo de Circuito: 'series' | 'parallel' | 'mixed_a' | 'mixed_b'
    const [circuitType, setCircuitType] = useState('series');
    
    // Forma / Estilo de Componente: 'bulbs' (Bombillas incandescentes con luz) | 'resistors' (Resistores cerámicos)
    const [componentStyle, setComponentStyle] = useState('bulbs');
    
    // Parámetros Eléctricos
    const [voltage, setVoltage] = useState(24); // Voltios
    
    // Valores de Resistencia individuales (Ω)
    const [rValues, setRValues] = useState({
        r1: 10,
        r2: 20,
        r3: 30,
        r4: 20
    });

    // Estados de los Interruptores (true = CERRADO / ON, false = ABIERTO / OFF)
    const [switches, setSwitches] = useState({
        main: true,
        sw1: true,
        sw2: true,
        sw3: true,
        sw4: true
    });

    // Activar / Desactivar animación de electrones
    const [showElectrons, setShowElectrons] = useState(true);

    // ── HELPERS DE CONTROL ───────────────────────────────────────────────────
    const toggleSwitch = (key) => {
        setSwitches(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const updateR = (key, val) => {
        const num = Math.max(1, Math.min(300, Number(val) || 1));
        setRValues(prev => ({ ...prev, [key]: num }));
    };

    const resetDefaults = () => {
        setVoltage(24);
        setRValues({ r1: 10, r2: 20, r3: 30, r4: 20 });
        setSwitches({ main: true, sw1: true, sw2: true, sw3: true, sw4: true });
    };

    // ── CÁLCULOS FÍSICOS EN TIEMPO REAL ──────────────────────────────────────
    const physics = useMemo(() => {
        if (!switches.main || voltage <= 0) {
            return {
                req: Infinity,
                iTotal: 0,
                pTotal: 0,
                branches: {
                    b1: { active: false, r: rValues.r1, v: 0, i: 0, p: 0 },
                    b2: { active: false, r: rValues.r2, v: 0, i: 0, p: 0 },
                    b3: { active: false, r: rValues.r3, v: 0, i: 0, p: 0 },
                    b4: { active: false, r: rValues.r4, v: 0, i: 0, p: 0 },
                }
            };
        }

        if (circuitType === 'series') {
            // Serie: R1 + R2 + R3 (si están encendidos)
            // Si algún interruptor de serie está abierto, el lazo completo se abre
            const allClosed = switches.sw1 && switches.sw2 && switches.sw3;
            if (!allClosed) {
                return {
                    req: Infinity,
                    iTotal: 0,
                    pTotal: 0,
                    branches: {
                        b1: { active: false, r: rValues.r1, v: 0, i: 0, p: 0 },
                        b2: { active: false, r: rValues.r2, v: 0, i: 0, p: 0 },
                        b3: { active: false, r: rValues.r3, v: 0, i: 0, p: 0 },
                        b4: { active: false, r: rValues.r4, v: 0, i: 0, p: 0 },
                    }
                };
            }

            const req = rValues.r1 + rValues.r2 + rValues.r3;
            const iTotal = voltage / req;
            const v1 = iTotal * rValues.r1;
            const v2 = iTotal * rValues.r2;
            const v3 = iTotal * rValues.r3;
            const p1 = v1 * iTotal;
            const p2 = v2 * iTotal;
            const p3 = v3 * iTotal;
            const pTotal = voltage * iTotal;

            return {
                req,
                iTotal,
                pTotal,
                branches: {
                    b1: { active: true, r: rValues.r1, v: v1, i: iTotal, p: p1 },
                    b2: { active: true, r: rValues.r2, v: v2, i: iTotal, p: p2 },
                    b3: { active: true, r: rValues.r3, v: v3, i: iTotal, p: p3 },
                    b4: { active: false, r: rValues.r4, v: 0, i: 0, p: 0 },
                }
            };
        } else if (circuitType === 'parallel') {
            // Paralelo: Cada rama recibe el voltaje total si su switch está ON
            const active1 = switches.sw1;
            const active2 = switches.sw2;
            const active3 = switches.sw3;

            let invReq = 0;
            if (active1) invReq += 1 / rValues.r1;
            if (active2) invReq += 1 / rValues.r2;
            if (active3) invReq += 1 / rValues.r3;

            const req = invReq > 0 ? 1 / invReq : Infinity;
            const i1 = active1 ? voltage / rValues.r1 : 0;
            const i2 = active2 ? voltage / rValues.r2 : 0;
            const i3 = active3 ? voltage / rValues.r3 : 0;
            const iTotal = i1 + i2 + i3;

            const p1 = active1 ? voltage * i1 : 0;
            const p2 = active2 ? voltage * i2 : 0;
            const p3 = active3 ? voltage * i3 : 0;
            const pTotal = p1 + p2 + p3;

            return {
                req,
                iTotal,
                pTotal,
                branches: {
                    b1: { active: active1, r: rValues.r1, v: active1 ? voltage : 0, i: i1, p: p1 },
                    b2: { active: active2, r: rValues.r2, v: active2 ? voltage : 0, i: i2, p: p2 },
                    b3: { active: active3, r: rValues.r3, v: active3 ? voltage : 0, i: i3, p: p3 },
                    b4: { active: false, r: rValues.r4, v: 0, i: 0, p: 0 },
                }
            };
        } else if (circuitType === 'mixed_a') {
            // Mixto A: R1 en serie con el bloque paralelo (R2 // R3)
            const active1 = switches.sw1;
            const active2 = switches.sw2;
            const active3 = switches.sw3;

            if (!active1) {
                // Si R1 se abre, todo el circuito se apaga
                return {
                    req: Infinity,
                    iTotal: 0,
                    pTotal: 0,
                    branches: {
                        b1: { active: false, r: rValues.r1, v: 0, i: 0, p: 0 },
                        b2: { active: false, r: rValues.r2, v: 0, i: 0, p: 0 },
                        b3: { active: false, r: rValues.r3, v: 0, i: 0, p: 0 },
                        b4: { active: false, r: rValues.r4, v: 0, i: 0, p: 0 },
                    }
                };
            }

            let invRp = 0;
            if (active2) invRp += 1 / rValues.r2;
            if (active3) invRp += 1 / rValues.r3;

            let rp = 0;
            let req = 0;

            if (invRp === 0) {
                // Ambas ramas en paralelo abiertas -> circuito abierto
                return {
                    req: Infinity,
                    iTotal: 0,
                    pTotal: 0,
                    branches: {
                        b1: { active: false, r: rValues.r1, v: 0, i: 0, p: 0 },
                        b2: { active: false, r: rValues.r2, v: 0, i: 0, p: 0 },
                        b3: { active: false, r: rValues.r3, v: 0, i: 0, p: 0 },
                        b4: { active: false, r: rValues.r4, v: 0, i: 0, p: 0 },
                    }
                };
            }

            rp = 1 / invRp;
            req = rValues.r1 + rp;
            const iTotal = voltage / req;
            const v1 = iTotal * rValues.r1;
            const vp = voltage - v1;

            const i2 = active2 ? vp / rValues.r2 : 0;
            const i3 = active3 ? vp / rValues.r3 : 0;

            const p1 = v1 * iTotal;
            const p2 = vp * i2;
            const p3 = vp * i3;
            const pTotal = p1 + p2 + p3;

            return {
                req,
                iTotal,
                pTotal,
                branches: {
                    b1: { active: true, r: rValues.r1, v: v1, i: iTotal, p: p1 },
                    b2: { active: active2, r: rValues.r2, v: active2 ? vp : 0, i: i2, p: p2 },
                    b3: { active: active3, r: rValues.r3, v: active3 ? vp : 0, i: i3, p: p3 },
                    b4: { active: false, r: rValues.r4, v: 0, i: 0, p: 0 },
                }
            };
        } else {
            // Mixto B: (R1 // R2) en serie con (R3 // R4)
            const active1 = switches.sw1;
            const active2 = switches.sw2;
            const active3 = switches.sw3;
            const active4 = switches.sw4;

            let invRp1 = 0;
            if (active1) invRp1 += 1 / rValues.r1;
            if (active2) invRp1 += 1 / rValues.r2;

            let invRp2 = 0;
            if (active3) invRp2 += 1 / rValues.r3;
            if (active4) invRp2 += 1 / rValues.r4;

            if (invRp1 === 0 || invRp2 === 0) {
                // Al menos un bloque está completamente abierto
                return {
                    req: Infinity,
                    iTotal: 0,
                    pTotal: 0,
                    branches: {
                        b1: { active: false, r: rValues.r1, v: 0, i: 0, p: 0 },
                        b2: { active: false, r: rValues.r2, v: 0, i: 0, p: 0 },
                        b3: { active: false, r: rValues.r3, v: 0, i: 0, p: 0 },
                        b4: { active: false, r: rValues.r4, v: 0, i: 0, p: 0 },
                    }
                };
            }

            const rp1 = 1 / invRp1;
            const rp2 = 1 / invRp2;
            const req = rp1 + rp2;
            const iTotal = voltage / req;

            const vp1 = iTotal * rp1;
            const vp2 = iTotal * rp2;

            const i1 = active1 ? vp1 / rValues.r1 : 0;
            const i2 = active2 ? vp1 / rValues.r2 : 0;
            const i3 = active3 ? vp2 / rValues.r3 : 0;
            const i4 = active4 ? vp2 / rValues.r4 : 0;

            const p1 = vp1 * i1;
            const p2 = vp1 * i2;
            const p3 = vp2 * i3;
            const p4 = vp2 * i4;
            const pTotal = p1 + p2 + p3 + p4;

            return {
                req,
                iTotal,
                pTotal,
                branches: {
                    b1: { active: active1, r: rValues.r1, v: active1 ? vp1 : 0, i: i1, p: p1 },
                    b2: { active: active2, r: rValues.r2, v: active2 ? vp1 : 0, i: i2, p: p2 },
                    b3: { active: active3, r: rValues.r3, v: active3 ? vp2 : 0, i: i3, p: p3 },
                    b4: { active: active4, r: rValues.r4, v: active4 ? vp2 : 0, i: i4, p: p4 },
                }
            };
        }
    }, [circuitType, voltage, rValues, switches]);

    // ── RENDERIZADOR DEL COMPONENTE GRÁFICO (BOMBILLA O RESISTOR) ───────────
    const renderComponent = (branchData, label, isHorizontal = false) => {
        const { active, r, v, i, p } = branchData;
        const brightness = active && p > 0 ? Math.min(1, Math.max(0.2, p / 30)) : 0;

        if (componentStyle === 'bulbs') {
            // 💡 Bombilla Incandescente
            return (
                <g>
                    {/* Halo de Resplandor Dinámico */}
                    {active && brightness > 0 && (
                        <circle
                            cx="0"
                            cy="0"
                            r={18 + brightness * 16}
                            fill="url(#bulbSimGlow)"
                            opacity={0.35 + brightness * 0.55}
                            filter="url(#glowSimFilter)"
                        />
                    )}

                    {/* Bulbo de Vidrio */}
                    <circle
                        cx="0"
                        cy="0"
                        r="14"
                        fill={active ? '#fef08a' : '#1e293b'}
                        stroke={active ? '#fbbf24' : '#64748b'}
                        strokeWidth="1.5"
                    />

                    {/* Filamento */}
                    <path
                        d="M -5 6 L -3 -3 L 0 3 L 3 -3 L 5 6"
                        fill="none"
                        stroke={active ? '#ef4444' : '#475569'}
                        strokeWidth="1.5"
                    />

                    {/* Casquillo metálico */}
                    <rect x="-6" y="12" width="12" height="6" rx="1.5" fill="#94a3b8" stroke="#64748b" strokeWidth="0.8" />

                    {/* Etiqueta */}
                    <text x="0" y="-18" textAnchor="middle" fill="#f8fafc" fontSize="8" fontWeight="900">
                        {label}: {r}Ω
                    </text>
                    {active && (
                        <text x="0" y="27" textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="800">
                            {v.toFixed(1)}V | {i.toFixed(2)}A
                        </text>
                    )}
                </g>
            );
        } else {
            // 🔲 Resistor Cerámico de Potencia
            return (
                <g>
                    <rect
                        x={isHorizontal ? -22 : -10}
                        y={isHorizontal ? -10 : -22}
                        width={isHorizontal ? 44 : 20}
                        height={isHorizontal ? 20 : 44}
                        rx="4"
                        fill="#1e293b"
                        stroke={active ? '#38bdf8' : '#64748b'}
                        strokeWidth="1.8"
                    />

                    {/* Bandas de color ilustrativas */}
                    {isHorizontal ? (
                        <>
                            <line x1="-12" y1="-8" x2="-12" y2="8" stroke="#ef4444" strokeWidth="2.5" />
                            <line x1="-4" y1="-8" x2="-4" y2="8" stroke="#3b82f6" strokeWidth="2.5" />
                            <line x1="4" y1="-8" x2="4" y2="8" stroke="#f59e0b" strokeWidth="2.5" />
                            <line x1="12" y1="-8" x2="12" y2="8" stroke="#d4a373" strokeWidth="2" />
                        </>
                    ) : (
                        <>
                            <line x1="-8" y1="-12" x2="8" y2="-12" stroke="#ef4444" strokeWidth="2.5" />
                            <line x1="-8" y1="-4" x2="8" y2="-4" stroke="#3b82f6" strokeWidth="2.5" />
                            <line x1="-8" y1="4" x2="8" y2="4" stroke="#f59e0b" strokeWidth="2.5" />
                            <line x1="-8" y1="12" x2="8" y2="12" stroke="#d4a373" strokeWidth="2" />
                        </>
                    )}

                    {/* Textos */}
                    <text x={isHorizontal ? 0 : -16} y={isHorizontal ? -14 : 3} textAnchor={isHorizontal ? 'middle' : 'end'} fill="#f8fafc" fontSize="8" fontWeight="900">
                        {label}: {r}Ω
                    </text>
                    {active && (
                        <text x={isHorizontal ? 0 : 16} y={isHorizontal ? 22 : 3} textAnchor={isHorizontal ? 'middle' : 'start'} fill="#38bdf8" fontSize="7.5" fontWeight="800">
                            {v.toFixed(1)}V | {i.toFixed(2)}A
                        </text>
                    )}
                </g>
            );
        }
    };

    // ── RENDERIZADOR DE INTERRUPTOR INTERACTIVO (SWITCH) ────────────────────
    const renderSwitch = (swKey, label, isHorizontal = true) => {
        const isClosed = switches[swKey];

        return (
            <g
                style={{ cursor: 'pointer' }}
                onClick={() => toggleSwitch(swKey)}
            >
                {/* Terminales del Switch */}
                <circle cx={isHorizontal ? -12 : 0} cy={isHorizontal ? 0 : -12} r="3" fill="#38bdf8" />
                <circle cx={isHorizontal ? 12 : 0} cy={isHorizontal ? 0 : 12} r="3" fill="#38bdf8" />

                {/* Cuchilla / Palanca */}
                {isClosed ? (
                    <line
                        x1={isHorizontal ? -12 : 0}
                        y1={isHorizontal ? 0 : -12}
                        x2={isHorizontal ? 12 : 0}
                        y2={isHorizontal ? 0 : 12}
                        stroke="#34d399"
                        strokeWidth="2.5"
                    />
                ) : (
                    <line
                        x1={isHorizontal ? -12 : 0}
                        y1={isHorizontal ? 0 : -12}
                        x2={isHorizontal ? 8 : -8}
                        y2={isHorizontal ? -12 : 8}
                        stroke="#ef4444"
                        strokeWidth="2.5"
                    />
                )}

                {/* Badge Estado */}
                <rect
                    x={isHorizontal ? -14 : 8}
                    y={isHorizontal ? -16 : -7}
                    width="28"
                    height="12"
                    rx="3"
                    fill="#090e1a"
                    stroke={isClosed ? '#34d399' : '#ef4444'}
                    strokeWidth="1"
                />
                <text
                    x={isHorizontal ? 0 : 22}
                    y={isHorizontal ? -8 : 1.5}
                    textAnchor="middle"
                    fill={isClosed ? '#34d399' : '#ef4444'}
                    fontSize="6.5"
                    fontWeight="900"
                >
                    {isClosed ? 'ON' : 'OFF'}
                </text>
            </g>
        );
    };

    return (
        <div style={{
            maxWidth: '960px',
            margin: '0 auto',
            background: 'linear-gradient(145deg, #090e1a 0%, #0f172a 100%)',
            border: '1.5px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '20px',
            padding: '1.25rem',
            boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
            color: '#f8fafc',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {/* ── ENCABEZADO Y SELECTORES DE CONFIGURACIÓN ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', borderRadius: '10px', padding: '8px', display: 'flex' }}>
                        <Cpu size={22} color="#38bdf8" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#38bdf8', fontWeight: 800 }}>
                            Laboratorio Avanzado de Topologías y Cargas
                        </h4>
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                            Configura circuitos en serie, paralelo y combinaciones mixtas con bombillas reales o resistores de precisión.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Selector de Forma (Bombillas vs Resistores) */}
                    <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <button
                            onClick={() => setComponentStyle('bulbs')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: componentStyle === 'bulbs' ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
                                color: componentStyle === 'bulbs' ? '#fbbf24' : '#94a3b8',
                                border: componentStyle === 'bulbs' ? '1px solid #fbbf24' : 'none',
                                borderRadius: '8px',
                                padding: '5px 10px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                            }}
                        >
                            <Lightbulb size={13} />
                            <span>Bombillos</span>
                        </button>
                        <button
                            onClick={() => setComponentStyle('resistors')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: componentStyle === 'resistors' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                                color: componentStyle === 'resistors' ? '#38bdf8' : '#94a3b8',
                                border: componentStyle === 'resistors' ? '1px solid #38bdf8' : 'none',
                                borderRadius: '8px',
                                padding: '5px 10px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                            }}
                        >
                            <Activity size={13} />
                            <span>Resistores</span>
                        </button>
                    </div>

                    <button
                        onClick={resetDefaults}
                        style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: '#94a3b8',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '10px',
                            padding: '7px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <RotateCcw size={13} />
                        <span>Restablecer</span>
                    </button>
                </div>
            </div>

            {/* ── SELECTOR DE TOPOLOGÍA (SERIE, PARALELO, MIXTO A, MIXTO B) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px', marginBottom: '1.25rem' }}>
                <button
                    onClick={() => setCircuitType('series')}
                    style={{
                        background: circuitType === 'series' ? 'rgba(56, 189, 248, 0.18)' : 'rgba(15, 23, 42, 0.6)',
                        border: `1.5px solid ${circuitType === 'series' ? '#38bdf8' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '12px',
                        padding: '8px 10px',
                        color: circuitType === 'series' ? '#38bdf8' : '#94a3b8',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <span>1. Serie Pura (3 Cargas)</span>
                    {circuitType === 'series' && <Check size={14} />}
                </button>

                <button
                    onClick={() => setCircuitType('parallel')}
                    style={{
                        background: circuitType === 'parallel' ? 'rgba(52, 211, 153, 0.18)' : 'rgba(15, 23, 42, 0.6)',
                        border: `1.5px solid ${circuitType === 'parallel' ? '#34d399' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '12px',
                        padding: '8px 10px',
                        color: circuitType === 'parallel' ? '#34d399' : '#94a3b8',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <span>2. Paralelo Puro (3 Ramas)</span>
                    {circuitType === 'parallel' && <Check size={14} />}
                </button>

                <button
                    onClick={() => setCircuitType('mixed_a')}
                    style={{
                        background: circuitType === 'mixed_a' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(15, 23, 42, 0.6)',
                        border: `1.5px solid ${circuitType === 'mixed_a' ? '#fbbf24' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '12px',
                        padding: '8px 10px',
                        color: circuitType === 'mixed_a' ? '#fbbf24' : '#94a3b8',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <span>3. Mixto: R₁ + (R₂ ∥ R₃)</span>
                    {circuitType === 'mixed_a' && <Check size={14} />}
                </button>

                <button
                    onClick={() => setCircuitType('mixed_b')}
                    style={{
                        background: circuitType === 'mixed_b' ? 'rgba(192, 132, 252, 0.18)' : 'rgba(15, 23, 42, 0.6)',
                        border: `1.5px solid ${circuitType === 'mixed_b' ? '#c084fc' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '12px',
                        padding: '8px 10px',
                        color: circuitType === 'mixed_b' ? '#c084fc' : '#94a3b8',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <span>4. Mixto: (R₁ ∥ R₂) + (R₃ ∥ R₄)</span>
                    {circuitType === 'mixed_b' && <Check size={14} />}
                </button>
            </div>

            {/* ── CUERPO PRINCIPAL: ESQUEMA SVG Y CONTROLES LATERALES ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 0.85fr)',
                gap: '16px',
                alignItems: 'stretch'
            }}>
                {/* ── COLUMNA IZQUIERDA: ESQUEMA INTERACTIVO SVG ── */}
                <div style={{
                    background: 'radial-gradient(circle at center, #0f172a 0%, #090e1a 100%)',
                    border: '1.5px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '260px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Activity size={14} color="#38bdf8" />
                            <span>Esquema Vivo de Circuito & Flujo Electrónico</span>
                        </div>

                        {/* Switch General de la Fuente */}
                        <button
                            onClick={() => toggleSwitch('main')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: switches.main ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: switches.main ? '#34d399' : '#f87171',
                                border: `1px solid ${switches.main ? '#34d399' : '#ef4444'}`,
                                borderRadius: '8px',
                                padding: '4px 10px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                            }}
                        >
                            <Power size={12} />
                            <span>Fuente: {switches.main ? 'ENERGIZADA' : 'APAGADA'}</span>
                        </button>
                    </div>

                    {/* SVG REACTIVO SEGÚN LA TOPOLOGÍA */}
                    <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 380 200" width="100%" height="220" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="batGradSim" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#0284c7" />
                                    <stop offset="100%" stopColor="#0369a1" />
                                </linearGradient>
                                <radialGradient id="bulbSimGlow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#fef08a" />
                                    <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.85" />
                                    <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                                </radialGradient>
                                <filter id="glowSimFilter" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>

                            {/* Batería / Fuente Universal Fija en X=20, Y=75 */}
                            <g transform="translate(20, 75)">
                                <line x1="15" y1="-37" x2="15" y2="0" stroke="#38bdf8" strokeWidth="2.5" />
                                <line x1="15" y1="50" x2="15" y2="87" stroke="#38bdf8" strokeWidth="2.5" />
                                <rect x="0" y="0" width="30" height="50" rx="4" fill="url(#batGradSim)" stroke="#38bdf8" strokeWidth="1.5" />
                                <rect x="9" y="-4" width="12" height="4" rx="1.5" fill="#ef4444" />
                                <text x="15" y="18" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="900">+</text>
                                <text x="15" y="42" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900">−</text>
                                <text x="-12" y="28" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="900">{voltage}V</text>
                            </g>

                            {/* ═══════════════ CASO 1: SERIE PURA (3 CARGAS) ═══════════════ */}
                            {circuitType === 'series' && (
                                <g>
                                    {/* Rieles */}
                                    <line x1="35" y1="38" x2="335" y2="38" stroke="#38bdf8" strokeWidth="2.5" />
                                    <line x1="35" y1="162" x2="335" y2="162" stroke="#38bdf8" strokeWidth="2.5" />
                                    <line x1="335" y1="38" x2="335" y2="162" stroke="#38bdf8" strokeWidth="2.5" />

                                    {/* Switch General Serie */}
                                    <g transform="translate(70, 38)">
                                        {renderSwitch('sw1', 'SW1', true)}
                                    </g>

                                    {/* Carga 1 */}
                                    <g transform="translate(145, 38)">
                                        {renderComponent(physics.branches.b1, 'R₁', true)}
                                    </g>

                                    {/* Carga 2 */}
                                    <g transform="translate(235, 38)">
                                        {renderComponent(physics.branches.b2, 'R₂', true)}
                                    </g>

                                    {/* Carga 3 en el riel derecho */}
                                    <g transform="translate(335, 100)">
                                        {renderComponent(physics.branches.b3, 'R₃', false)}
                                    </g>

                                    {/* Medidor Corriente IT */}
                                    <g transform="translate(180, 162)">
                                        <rect x="-44" y="-11" width="88" height="22" rx="11" fill="#090e1a" stroke="#38bdf8" strokeWidth="1.5" />
                                        <text x="0" y="3.5" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="900" fontFamily="monospace">
                                            IT = {physics.iTotal.toFixed(3)} A
                                        </text>
                                    </g>

                                    {/* Electrones Animados */}
                                    {showElectrons && physics.iTotal > 0 && (
                                        <g filter="url(#glowSimFilter)">
                                            <circle r="3.5" fill="#38bdf8">
                                                <animateMotion dur={`${Math.max(1.2, 5 / physics.iTotal)}s`} repeatCount="indefinite" path="M 35 38 L 335 38 L 335 162 L 35 162 L 35 38 Z" />
                                            </circle>
                                            <circle r="3.5" fill="#38bdf8">
                                                <animateMotion dur={`${Math.max(1.2, 5 / physics.iTotal)}s`} begin="-1.5s" repeatCount="indefinite" path="M 35 38 L 335 38 L 335 162 L 35 162 L 35 38 Z" />
                                            </circle>
                                        </g>
                                    )}
                                </g>
                            )}

                            {/* ═══════════════ CASO 2: PARALELO PURO (3 RAMAS) ═══════════════ */}
                            {circuitType === 'parallel' && (
                                <g>
                                    {/* Rieles superior e inferior al ras en x=320 */}
                                    <line x1="35" y1="38" x2="320" y2="38" stroke="#38bdf8" strokeWidth="2.5" />
                                    <line x1="35" y1="162" x2="320" y2="162" stroke="#38bdf8" strokeWidth="2.5" />

                                    {/* Nodos */}
                                    <circle cx="120" cy="38" r="3.5" fill="#38bdf8" />
                                    <circle cx="120" cy="162" r="3.5" fill="#38bdf8" />
                                    <circle cx="220" cy="38" r="3.5" fill="#38bdf8" />
                                    <circle cx="220" cy="162" r="3.5" fill="#38bdf8" />
                                    <circle cx="320" cy="38" r="3.5" fill="#38bdf8" />
                                    <circle cx="320" cy="162" r="3.5" fill="#38bdf8" />

                                    {/* Rama 1 */}
                                    <g transform="translate(120, 38)">
                                        <line x1="0" y1="0" x2="0" y2="22" stroke="#38bdf8" strokeWidth="2.5" />
                                        <g transform="translate(0, 22)">{renderSwitch('sw1', 'SW1', false)}</g>
                                        <line x1="0" y1="34" x2="0" y2="60" stroke="#38bdf8" strokeWidth="2.5" />
                                        <g transform="translate(0, 62)">{renderComponent(physics.branches.b1, 'R₁', false)}</g>
                                        <line x1="0" y1="84" x2="0" y2="124" stroke="#38bdf8" strokeWidth="2.5" />
                                    </g>

                                    {/* Rama 2 */}
                                    <g transform="translate(220, 38)">
                                        <line x1="0" y1="0" x2="0" y2="22" stroke="#38bdf8" strokeWidth="2.5" />
                                        <g transform="translate(0, 22)">{renderSwitch('sw2', 'SW2', false)}</g>
                                        <line x1="0" y1="34" x2="0" y2="60" stroke="#38bdf8" strokeWidth="2.5" />
                                        <g transform="translate(0, 62)">{renderComponent(physics.branches.b2, 'R₂', false)}</g>
                                        <line x1="0" y1="84" x2="0" y2="124" stroke="#38bdf8" strokeWidth="2.5" />
                                    </g>

                                    {/* Rama 3 */}
                                    <g transform="translate(320, 38)">
                                        <line x1="0" y1="0" x2="0" y2="22" stroke="#38bdf8" strokeWidth="2.5" />
                                        <g transform="translate(0, 22)">{renderSwitch('sw3', 'SW3', false)}</g>
                                        <line x1="0" y1="34" x2="0" y2="60" stroke="#38bdf8" strokeWidth="2.5" />
                                        <g transform="translate(0, 62)">{renderComponent(physics.branches.b3, 'R₃', false)}</g>
                                        <line x1="0" y1="84" x2="0" y2="124" stroke="#38bdf8" strokeWidth="2.5" />
                                    </g>

                                    {/* Medidor IT */}
                                    <g transform="translate(75, 162)">
                                        <rect x="-38" y="-10" width="76" height="20" rx="10" fill="#090e1a" stroke="#34d399" strokeWidth="1.5" />
                                        <text x="0" y="3.5" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="900" fontFamily="monospace">
                                            IT = {physics.iTotal.toFixed(2)} A
                                        </text>
                                    </g>

                                    {/* Electrones Animados en Ramas */}
                                    {showElectrons && physics.branches.b1.active && (
                                        <circle r="3" fill="#38bdf8" filter="url(#glowSimFilter)">
                                            <animateMotion dur="2.4s" repeatCount="indefinite" path="M 35 38 L 120 38 L 120 162 L 35 162 L 35 38 Z" />
                                        </circle>
                                    )}
                                    {showElectrons && physics.branches.b2.active && (
                                        <circle r="3" fill="#34d399" filter="url(#glowSimFilter)">
                                            <animateMotion dur="2.8s" repeatCount="indefinite" path="M 35 38 L 220 38 L 220 162 L 35 162 L 35 38 Z" />
                                        </circle>
                                    )}
                                    {showElectrons && physics.branches.b3.active && (
                                        <circle r="3" fill="#fbbf24" filter="url(#glowSimFilter)">
                                            <animateMotion dur="3.2s" repeatCount="indefinite" path="M 35 38 L 320 38 L 320 162 L 35 162 L 35 38 Z" />
                                        </circle>
                                    )}
                                </g>
                            )}

                            {/* ═══════════════ CASO 3: MIXTO A: R1 + (R2 // R3) ═══════════════ */}
                            {circuitType === 'mixed_a' && (
                                <g>
                                    <line x1="35" y1="38" x2="310" y2="38" stroke="#38bdf8" strokeWidth="2.5" />
                                    <line x1="35" y1="162" x2="310" y2="162" stroke="#38bdf8" strokeWidth="2.5" />

                                    {/* Switch R1 Serie */}
                                    <g transform="translate(68, 38)">
                                        {renderSwitch('sw1', 'SW1', true)}
                                    </g>

                                    {/* Carga R1 */}
                                    <g transform="translate(130, 38)">
                                        {renderComponent(physics.branches.b1, 'R₁', true)}
                                    </g>

                                    {/* Nodos Paralelos */}
                                    <circle cx="210" cy="38" r="3.5" fill="#38bdf8" />
                                    <circle cx="210" cy="162" r="3.5" fill="#38bdf8" />
                                    <circle cx="310" cy="38" r="3.5" fill="#38bdf8" />
                                    <circle cx="310" cy="162" r="3.5" fill="#38bdf8" />

                                    {/* Rama R2 */}
                                    <g transform="translate(210, 38)">
                                        <line x1="0" y1="0" x2="0" y2="20" stroke="#38bdf8" strokeWidth="2.5" />
                                        <g transform="translate(0, 20)">{renderSwitch('sw2', 'SW2', false)}</g>
                                        <line x1="0" y1="32" x2="0" y2="60" stroke="#38bdf8" strokeWidth="2.5" />
                                        <g transform="translate(0, 62)">{renderComponent(physics.branches.b2, 'R₂', false)}</g>
                                        <line x1="0" y1="84" x2="0" y2="124" stroke="#38bdf8" strokeWidth="2.5" />
                                    </g>

                                    {/* Rama R3 */}
                                    <g transform="translate(310, 38)">
                                        <line x1="0" y1="0" x2="0" y2="20" stroke="#38bdf8" strokeWidth="2.5" />
                                        <g transform="translate(0, 20)">{renderSwitch('sw3', 'SW3', false)}</g>
                                        <line x1="0" y1="32" x2="0" y2="60" stroke="#38bdf8" strokeWidth="2.5" />
                                        <g transform="translate(0, 62)">{renderComponent(physics.branches.b3, 'R₃', false)}</g>
                                        <line x1="0" y1="84" x2="0" y2="124" stroke="#38bdf8" strokeWidth="2.5" />
                                    </g>

                                    {/* Medidor IT */}
                                    <g transform="translate(120, 162)">
                                        <rect x="-40" y="-10" width="80" height="20" rx="10" fill="#090e1a" stroke="#fbbf24" strokeWidth="1.5" />
                                        <text x="0" y="3.5" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="900" fontFamily="monospace">
                                            IT = {physics.iTotal.toFixed(2)} A
                                        </text>
                                    </g>

                                    {/* Electrones */}
                                    {showElectrons && physics.branches.b2.active && (
                                        <circle r="3" fill="#38bdf8" filter="url(#glowSimFilter)">
                                            <animateMotion dur="2.6s" repeatCount="indefinite" path="M 35 38 L 130 38 L 210 38 L 210 162 L 35 162 L 35 38 Z" />
                                        </circle>
                                    )}
                                    {showElectrons && physics.branches.b3.active && (
                                        <circle r="3" fill="#c084fc" filter="url(#glowSimFilter)">
                                            <animateMotion dur="3.0s" repeatCount="indefinite" path="M 35 38 L 130 38 L 210 38 L 310 38 L 310 162 L 210 162 L 35 162 L 35 38 Z" />
                                        </circle>
                                    )}
                                </g>
                            )}

                            {/* ═══════════════ CASO 4: MIXTO B: (R1 // R2) + (R3 // R4) ═══════════════ */}
                            {circuitType === 'mixed_b' && (
                                <g>
                                    <line x1="35" y1="38" x2="350" y2="38" stroke="#38bdf8" strokeWidth="2.5" />
                                    <line x1="35" y1="162" x2="350" y2="162" stroke="#38bdf8" strokeWidth="2.5" />

                                    {/* Bloque 1 (R1 // R2) */}
                                    <circle cx="100" cy="38" r="3.5" fill="#38bdf8" />
                                    <circle cx="100" cy="162" r="3.5" fill="#38bdf8" />
                                    <circle cx="180" cy="38" r="3.5" fill="#38bdf8" />
                                    <circle cx="180" cy="162" r="3.5" fill="#38bdf8" />

                                    {/* R1 */}
                                    <g transform="translate(100, 38)">
                                        <line x1="0" y1="0" x2="0" y2="62" stroke="#38bdf8" strokeWidth="2.5" />
                                        <g transform="translate(0, 62)">{renderComponent(physics.branches.b1, 'R₁', false)}</g>
                                        <line x1="0" y1="84" x2="0" y2="124" stroke="#38bdf8" strokeWidth="2.5" />
                                    </g>

                                    {/* R2 */}
                                    <g transform="translate(180, 38)">
                                        <line x1="0" y1="0" x2="0" y2="62" stroke="#38bdf8" strokeWidth="2.5" />
                                        <g transform="translate(0, 62)">{renderComponent(physics.branches.b2, 'R₂', false)}</g>
                                        <line x1="0" y1="84" x2="0" y2="124" stroke="#38bdf8" strokeWidth="2.5" />
                                    </g>

                                    {/* Conector Intermedio */}
                                    <line x1="180" y1="38" x2="270" y2="38" stroke="#38bdf8" strokeWidth="2.5" />
                                    <line x1="180" y1="162" x2="270" y2="162" stroke="#38bdf8" strokeWidth="2.5" />

                                    {/* Bloque 2 (R3 // R4) */}
                                    <circle cx="270" cy="38" r="3.5" fill="#38bdf8" />
                                    <circle cx="270" cy="162" r="3.5" fill="#38bdf8" />
                                    <circle cx="350" cy="38" r="3.5" fill="#38bdf8" />
                                    <circle cx="350" cy="162" r="3.5" fill="#38bdf8" />

                                    {/* R3 */}
                                    <g transform="translate(270, 38)">
                                        <line x1="0" y1="0" x2="0" y2="62" stroke="#38bdf8" strokeWidth="2.5" />
                                        <g transform="translate(0, 62)">{renderComponent(physics.branches.b3, 'R₃', false)}</g>
                                        <line x1="0" y1="84" x2="0" y2="124" stroke="#38bdf8" strokeWidth="2.5" />
                                    </g>

                                    {/* R4 */}
                                    <g transform="translate(350, 38)">
                                        <line x1="0" y1="0" x2="0" y2="62" stroke="#38bdf8" strokeWidth="2.5" />
                                        <g transform="translate(0, 62)">{renderComponent(physics.branches.b4, 'R₄', false)}</g>
                                        <line x1="0" y1="84" x2="0" y2="124" stroke="#38bdf8" strokeWidth="2.5" />
                                    </g>
                                </g>
                            )}
                        </svg>
                    </div>
                </div>

                {/* ── COLUMNA DERECHA: PANEL DE CONTROL DE PARÁMETROS Y MEDICIÓN ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Control de Voltaje de Fuente */}
                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 800 }}>Fuente de Voltaje (V):</span>
                            <span style={{ fontSize: '0.88rem', color: '#f8fafc', fontWeight: 900, fontFamily: 'monospace' }}>{voltage} V</span>
                        </div>
                        <input
                            type="range"
                            min="2"
                            max="60"
                            step="2"
                            value={voltage}
                            onChange={(e) => setVoltage(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#38bdf8' }}
                        />
                    </div>

                    {/* Controles de Resistencia */}
                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '10px 12px' }}>
                        <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 800, marginBottom: '8px' }}>
                            Valores de Cargas (Ω):
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '2px' }}>
                                    <span>R₁ ({rValues.r1}Ω)</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="150"
                                    step="5"
                                    value={rValues.r1}
                                    onChange={(e) => updateR('r1', e.target.value)}
                                    style={{ width: '100%', accentColor: '#fbbf24' }}
                                />
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '2px' }}>
                                    <span>R₂ ({rValues.r2}Ω)</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="150"
                                    step="5"
                                    value={rValues.r2}
                                    onChange={(e) => updateR('r2', e.target.value)}
                                    style={{ width: '100%', accentColor: '#34d399' }}
                                />
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '2px' }}>
                                    <span>R₃ ({rValues.r3}Ω)</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="150"
                                    step="5"
                                    value={rValues.r3}
                                    onChange={(e) => updateR('r3', e.target.value)}
                                    style={{ width: '100%', accentColor: '#c084fc' }}
                                />
                            </div>

                            {circuitType === 'mixed_b' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '2px' }}>
                                        <span>R₄ ({rValues.r4}Ω)</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="5"
                                        max="150"
                                        step="5"
                                        value={rValues.r4}
                                        onChange={(e) => updateR('r4', e.target.value)}
                                        style={{ width: '100%', accentColor: '#f43f5e' }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dashboard de Métricas Físicas Globales */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                        <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                            <div style={{ color: '#38bdf8', fontSize: '0.68rem', fontWeight: 800 }}>Req Total</div>
                            <div style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: 900, fontFamily: 'monospace' }}>
                                {physics.req === Infinity ? '∞' : `${physics.req.toFixed(2)} Ω`}
                            </div>
                        </div>

                        <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                            <div style={{ color: '#34d399', fontSize: '0.68rem', fontWeight: 800 }}>Corriente IT</div>
                            <div style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: 900, fontFamily: 'monospace' }}>
                                {physics.iTotal.toFixed(3)} A
                            </div>
                        </div>

                        <div style={{ background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.25)', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                            <div style={{ color: '#fbbf24', fontSize: '0.68rem', fontWeight: 800 }}>Potencia Total</div>
                            <div style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: 900, fontFamily: 'monospace' }}>
                                {physics.pTotal.toFixed(2)} W
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
