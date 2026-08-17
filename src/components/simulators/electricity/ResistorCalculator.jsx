import { useState, useMemo, useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

// ── Colores Oficiales Nítidos y Contrastados (IEC 60062) ──────────────────────
// Colores sólidos mate/satinados de alta visibilidad sin reflejos que los laven
const DIGIT_COLORS = [
    { name: 'Negro',    digit: 0, hex: '#111827', border: '#4b5563', text: '0' },
    { name: 'Marrón',   digit: 1, hex: '#6b3318', border: '#8b4513', text: '1' },
    { name: 'Rojo',     digit: 2, hex: '#dc2626', border: '#991b1b', text: '2' },
    { name: 'Naranja',  digit: 3, hex: '#ea580c', border: '#c2410c', text: '3' },
    { name: 'Amarillo', digit: 4, hex: '#facc15', border: '#ca8a04', text: '4' },
    { name: 'Verde',    digit: 5, hex: '#16a34a', border: '#15803d', text: '5' },
    { name: 'Azul',     digit: 6, hex: '#2563eb', border: '#1d4ed8', text: '6' },
    { name: 'Violeta',  digit: 7, hex: '#9333ea', border: '#7e22ce', text: '7' },
    { name: 'Gris',     digit: 8, hex: '#64748b', border: '#475569', text: '8' },
    { name: 'Blanco',   digit: 9, hex: '#f8fafc', border: '#94a3b8', text: '9' },
];

const MULTIPLIER_COLORS = [
    { name: 'Negro',    mul: 1,        label: '× 1 Ω',       hex: '#111827', border: '#4b5563' },
    { name: 'Marrón',   mul: 10,       label: '× 10 Ω',      hex: '#6b3318', border: '#8b4513' },
    { name: 'Rojo',     mul: 100,      label: '× 100 Ω',     hex: '#dc2626', border: '#991b1b' },
    { name: 'Naranja',  mul: 1000,     label: '× 1 kΩ',      hex: '#ea580c', border: '#c2410c' },
    { name: 'Amarillo', mul: 10000,    label: '× 10 kΩ',     hex: '#facc15', border: '#ca8a04' },
    { name: 'Verde',    mul: 100000,   label: '× 100 kΩ',    hex: '#16a34a', border: '#15803d' },
    { name: 'Azul',     mul: 1000000,  label: '× 1 MΩ',      hex: '#2563eb', border: '#1d4ed8' },
    { name: 'Violeta',  mul: 10000000, label: '× 10 MΩ',     hex: '#9333ea', border: '#7e22ce' },
    { name: 'Oro',      mul: 0.1,      label: '× 0.1 Ω',     hex: '#cf9715', border: '#a16207' },
    { name: 'Plata',    mul: 0.01,     label: '× 0.01 Ω',    hex: '#94a3b8', border: '#64748b' },
];

const TOLERANCE_COLORS = [
    { name: 'Marrón',   tol: 1,   label: '±1%',          hex: '#6b3318', border: '#8b4513' },
    { name: 'Rojo',     tol: 2,   label: '±2%',          hex: '#dc2626', border: '#991b1b' },
    { name: 'Verde',    tol: 0.5, label: '±0.5%',        hex: '#16a34a', border: '#15803d' },
    { name: 'Azul',     tol: 0.25,label: '±0.25%',       hex: '#2563eb', border: '#1d4ed8' },
    { name: 'Oro',      tol: 5,   label: '±5% (Dorado)', hex: '#cf9715', border: '#a16207' },
    { name: 'Plata',    tol: 10,  label: '±10%',         hex: '#94a3b8', border: '#64748b' },
];

const PRESETS = [
    { label: '220 Ω',  b1: 'Rojo',     b2: 'Rojo',    mul: 'Marrón',   tol: 'Oro' },
    { label: '330 Ω',  b1: 'Naranja',  b2: 'Naranja', mul: 'Marrón',   tol: 'Oro' },
    { label: '1 kΩ',   b1: 'Marrón',   b2: 'Negro',   mul: 'Rojo',     tol: 'Oro' },
    { label: '4.7 kΩ', b1: 'Amarillo', b2: 'Violeta', mul: 'Rojo',     tol: 'Oro' },
    { label: '10 kΩ',  b1: 'Marrón',   b2: 'Negro',   mul: 'Naranja',  tol: 'Oro' },
    { label: '100 kΩ', b1: 'Marrón',   b2: 'Negro',   mul: 'Amarillo', tol: 'Oro' },
];

function formatOhms(ohms) {
    if (ohms >= 1_000_000) {
        const val = ohms / 1_000_000;
        return `${Number.isInteger(val) ? val : val.toFixed(2)} MΩ`;
    }
    if (ohms >= 1_000) {
        const val = ohms / 1_000;
        return `${Number.isInteger(val) ? val : val.toFixed(2)} kΩ`;
    }
    return `${Number.isInteger(ohms) ? ohms : ohms.toFixed(1)} Ω`;
}

export default function ResistorCalculator() {
    // 4 Bandas
    const [b1, setB1] = useState('Rojo');
    const [b2, setB2] = useState('Rojo');
    const [bMul, setBMul] = useState('Marrón');
    const [bTol, setBTol] = useState('Oro');

    // Ventana flotante (popover): null | 'b1' | 'b2' | 'mul' | 'tol'
    const [openPopover, setOpenPopover] = useState(null);
    const popoverRef = useRef(null);

    // Cerrar popover al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                if (!e.target.closest('.interactive-resistor-band')) {
                    setOpenPopover(null);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cálculos
    const { value, tolStr, minVal, maxVal, formulaStr, c1Obj, c2Obj, mulObj, tolObj } = useMemo(() => {
        const c1 = DIGIT_COLORS.find(c => c.name === b1) || DIGIT_COLORS[2];
        const c2 = DIGIT_COLORS.find(c => c.name === b2) || DIGIT_COLORS[2];
        const mul = MULTIPLIER_COLORS.find(c => c.name === bMul) || MULTIPLIER_COLORS[1];
        const tol = TOLERANCE_COLORS.find(c => c.name === bTol) || TOLERANCE_COLORS[4];

        const digits = c1.digit * 10 + c2.digit;
        const rawVal = digits * mul.mul;
        const delta = rawVal * (tol.tol / 100);

        return {
            value: rawVal,
            tolStr: `±${tol.tol}%`,
            minVal: rawVal - delta,
            maxVal: rawVal + delta,
            formulaStr: `(${c1.digit}${c2.digit}) × ${mul.mul} Ω`,
            c1Obj: c1,
            c2Obj: c2,
            mulObj: mul,
            tolObj: tol
        };
    }, [b1, b2, bMul, bTol]);

    // Información de la ventana abierta (selección individual e independiente)
    const popoverInfo = useMemo(() => {
        switch (openPopover) {
            case 'b1':
                return {
                    title: '1ª Banda (1er Dígito)',
                    current: b1,
                    options: DIGIT_COLORS,
                    onSelect: (name) => { setB1(name); setOpenPopover(null); }
                };
            case 'b2':
                return {
                    title: '2ª Banda (2º Dígito)',
                    current: b2,
                    options: DIGIT_COLORS,
                    onSelect: (name) => { setB2(name); setOpenPopover(null); }
                };
            case 'mul':
                return {
                    title: '3ª Banda (Multiplicador)',
                    current: bMul,
                    options: MULTIPLIER_COLORS,
                    onSelect: (name) => { setBMul(name); setOpenPopover(null); }
                };
            case 'tol':
                return {
                    title: '4ª Banda (Tolerancia)',
                    current: bTol,
                    options: TOLERANCE_COLORS,
                    onSelect: (name) => { setBTol(name); setOpenPopover(null); }
                };
            default:
                return null;
        }
    }, [openPopover, b1, b2, bMul, bTol]);

    return (
        <div className="sim-card" style={{ maxWidth: '880px', margin: '0 auto' }}>
            {/* Encabezado */}
            <div className="sim-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        🎨 Decodificador de Resistencias (4 Bandas)
                    </h3>
                    <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                        👉 <strong>Toca cualquier banda</strong> para abrir la ventana de selección de color
                    </p>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', color: '#fbbf24', padding: '4px 12px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 800 }}>
                    Norma Internacional IEC 60062
                </div>
            </div>

            <div className="sim-card-body" style={{ padding: '1.25rem' }}>
                {/* ── VISUALIZADOR ANATÓMICO CON COLORES SÓLIDOS Y NÍTITOS ── */}
                <div style={{ background: 'linear-gradient(180deg, #090e1a 0%, #0f172a 100%)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.25rem 1rem', marginBottom: '1.25rem', textAlign: 'center', position: 'relative' }}>

                    <svg viewBox="0 0 460 120" width="100%" height="110" style={{ maxWidth: '500px', overflow: 'visible' }}>
                        <defs>
                            {/* Gradiente cerámico beige natural */}
                            <linearGradient id="resistorBody" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#eedec8" />
                                <stop offset="30%" stopColor="#e5d0b5" />
                                <stop offset="70%" stopColor="#ceb28f" />
                                <stop offset="100%" stopColor="#a7865c" />
                            </linearGradient>

                            {/* Terminales metálicas */}
                            <linearGradient id="leadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#94a3b8" />
                                <stop offset="40%" stopColor="#e2e8f0" />
                                <stop offset="80%" stopColor="#64748b" />
                                <stop offset="100%" stopColor="#334155" />
                            </linearGradient>

                            {/* Sombra sutil cilíndrica (sin destello blanco para no lavar los colores) */}
                            <linearGradient id="bandLighting" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                                <stop offset="25%" stopColor="rgba(255,255,255,0.06)" />
                                <stop offset="75%" stopColor="rgba(0,0,0,0.0)" />
                                <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
                            </linearGradient>

                            <filter id="resistorShadow" x="-10%" y="-10%" width="120%" height="130%">
                                <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.5" />
                            </filter>
                        </defs>

                        {/* Sombra de apoyo en el suelo */}
                        <ellipse cx="230" cy="112" rx="120" ry="8" fill="rgba(0,0,0,0.5)" />

                        {/* ── TERMINALES METÁLICAS AXIALES ── */}
                        <rect x="30" y="61" width="115" height="8" fill="url(#leadGrad)" rx="2.5" />
                        <rect x="315" y="61" width="115" height="8" fill="url(#leadGrad)" rx="2.5" />

                        {/* ── CUERPO CERÁMICO DEL RESISTOR ── */}
                        <g filter="url(#resistorShadow)">
                            <path
                                d="
                                    M 140 65
                                    C 140 38, 154 32, 170 36
                                    C 180 38, 188 38, 202 38
                                    L 258 38
                                    C 272 38, 280 38, 290 36
                                    C 306 32, 320 38, 320 65
                                    C 320 92, 306 98, 290 94
                                    C 280 92, 272 92, 258 92
                                    L 202 92
                                    C 188 92, 180 92, 170 94
                                    C 154 98, 140 92, 140 65
                                    Z
                                "
                                fill="url(#resistorBody)"
                                stroke="#784e2d"
                                strokeWidth="1.5"
                            />
                        </g>

                        {/* ── BANDA 1: PRIMER DÍGITO (Color sólido + sombra sutil) ── */}
                        <g className="interactive-resistor-band" onClick={() => setOpenPopover('b1')} style={{ cursor: 'pointer' }}>
                            {openPopover === 'b1' && (
                                <rect x="158" y="28" width="28" height="74" rx="6" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 2" />
                            )}
                            <path
                                d="M 162 35 C 166 36, 172 37, 182 38 L 182 92 C 172 93, 166 94, 162 95 Z"
                                fill={c1Obj.hex}
                            />
                            <path
                                d="M 162 35 C 166 36, 172 37, 182 38 L 182 92 C 172 93, 166 94, 162 95 Z"
                                fill="url(#bandLighting)"
                            />
                        </g>

                        {/* ── BANDA 2: SEGUNDO DÍGITO ── */}
                        <g className="interactive-resistor-band" onClick={() => setOpenPopover('b2')} style={{ cursor: 'pointer' }}>
                            {openPopover === 'b2' && (
                                <rect x="192" y="32" width="26" height="66" rx="6" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 2" />
                            )}
                            <rect x="196" y="38" width="18" height="54" fill={c2Obj.hex} />
                            <rect x="196" y="38" width="18" height="54" fill="url(#bandLighting)" />
                        </g>

                        {/* ── BANDA 3: MULTIPLICADOR ── */}
                        <g className="interactive-resistor-band" onClick={() => setOpenPopover('mul')} style={{ cursor: 'pointer' }}>
                            {openPopover === 'mul' && (
                                <rect x="228" y="32" width="26" height="66" rx="6" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 2" />
                            )}
                            <rect x="232" y="38" width="18" height="54" fill={mulObj.hex} />
                            <rect x="232" y="38" width="18" height="54" fill="url(#bandLighting)" />
                        </g>

                        {/* ── BANDA 4: TOLERANCIA ── */}
                        <g className="interactive-resistor-band" onClick={() => setOpenPopover('tol')} style={{ cursor: 'pointer' }}>
                            {openPopover === 'tol' && (
                                <rect x="274" y="28" width="28" height="74" rx="6" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 2" />
                            )}
                            <path
                                d="M 278 38 C 288 37, 294 36, 298 35 L 298 95 C 294 94, 288 93, 278 92 Z"
                                fill={tolObj.hex}
                            />
                            <path
                                d="M 278 38 C 288 37, 294 36, 298 35 L 298 95 C 294 94, 288 93, 278 92 Z"
                                fill="url(#bandLighting)"
                            />
                        </g>

                        {/* Flechas indicadoras cuando la ventana está abierta */}
                        {openPopover === 'b1' && (
                            <g transform="translate(172, 16)">
                                <polygon points="0,5 -5,-4 5,-4" fill="#38bdf8" />
                            </g>
                        )}
                        {openPopover === 'b2' && (
                            <g transform="translate(205, 20)">
                                <polygon points="0,5 -5,-4 5,-4" fill="#38bdf8" />
                            </g>
                        )}
                        {openPopover === 'mul' && (
                            <g transform="translate(241, 20)">
                                <polygon points="0,5 -5,-4 5,-4" fill="#38bdf8" />
                            </g>
                        )}
                        {openPopover === 'tol' && (
                            <g transform="translate(288, 16)">
                                <polygon points="0,5 -5,-4 5,-4" fill="#38bdf8" />
                            </g>
                        )}
                    </svg>

                    {/* Botones guía interactivos bajo cada banda */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxWidth: '500px', margin: '0.4rem auto 0' }}>
                        <button
                            className="interactive-resistor-band"
                            onClick={() => setOpenPopover('b1')}
                            style={{
                                background: openPopover === 'b1' ? '#38bdf8' : 'rgba(255,255,255,0.05)',
                                color: openPopover === 'b1' ? '#0f172a' : '#cbd5e1',
                                border: `1.5px solid ${openPopover === 'b1' ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '10px',
                                padding: '6px 4px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            1ª: {b1} ({c1Obj.digit})
                        </button>
                        <button
                            className="interactive-resistor-band"
                            onClick={() => setOpenPopover('b2')}
                            style={{
                                background: openPopover === 'b2' ? '#38bdf8' : 'rgba(255,255,255,0.05)',
                                color: openPopover === 'b2' ? '#0f172a' : '#cbd5e1',
                                border: `1.5px solid ${openPopover === 'b2' ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '10px',
                                padding: '6px 4px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            2ª: {b2} ({c2Obj.digit})
                        </button>
                        <button
                            className="interactive-resistor-band"
                            onClick={() => setOpenPopover('mul')}
                            style={{
                                background: openPopover === 'mul' ? '#38bdf8' : 'rgba(255,255,255,0.05)',
                                color: openPopover === 'mul' ? '#0f172a' : '#cbd5e1',
                                border: `1.5px solid ${openPopover === 'mul' ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '10px',
                                padding: '6px 4px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            Mult: {bMul}
                        </button>
                        <button
                            className="interactive-resistor-band"
                            onClick={() => setOpenPopover('tol')}
                            style={{
                                background: openPopover === 'tol' ? '#38bdf8' : 'rgba(255,255,255,0.05)',
                                color: openPopover === 'tol' ? '#0f172a' : '#cbd5e1',
                                border: `1.5px solid ${openPopover === 'tol' ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '10px',
                                padding: '6px 4px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            Tol: {tolStr}
                        </button>
                    </div>

                    {/* ── VENTANITA FLOTANTE (POPOVER ELEVADO Y CENTRADO) ── */}
                    {openPopover && popoverInfo && (
                        <div
                            ref={popoverRef}
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '15px',
                                transform: 'translateX(-50%)',
                                width: '90%',
                                maxWidth: '320px',
                                background: '#0b1329',
                                border: '2px solid #38bdf8',
                                borderRadius: '18px',
                                boxShadow: '0 25px 50px rgba(0,0,0,0.9), 0 0 30px rgba(56, 189, 248, 0.3)',
                                padding: '0.85rem',
                                zIndex: 100,
                                animation: 'fadeIn 0.18s ease-out'
                            }}
                        >
                            {/* Cabecera de la ventanita */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '1rem' }}>🎨</span>
                                    <strong style={{ color: '#38bdf8', fontSize: '0.86rem' }}>
                                        {popoverInfo.title}
                                    </strong>
                                </div>
                                <button
                                    onClick={() => setOpenPopover(null)}
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#cbd5e1',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Opciones de colores en UNA SOLA COLUMNA compacta sin scroll */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                {popoverInfo.options.map(c => {
                                    const isSelected = popoverInfo.current === c.name;
                                    return (
                                        <button
                                            key={c.name}
                                            onClick={() => popoverInfo.onSelect(c.name)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                background: isSelected ? 'rgba(56, 189, 248, 0.22)' : 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${isSelected ? '#38bdf8' : 'rgba(255,255,255,0.06)'}`,
                                                borderRadius: '7px',
                                                padding: '4px 10px',
                                                cursor: 'pointer',
                                                color: 'white',
                                                fontSize: '0.76rem',
                                                fontWeight: 700,
                                                transition: 'all 0.12s',
                                                textAlign: 'left'
                                            }}
                                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ width: '15px', height: '15px', borderRadius: '50%', background: c.hex, border: `1.5px solid ${c.border}`, display: 'inline-block', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}></span>
                                                <span style={{ color: isSelected ? '#38bdf8' : '#f1f5f9', fontWeight: isSelected ? 800 : 600 }}>
                                                    {c.name} {c.digit !== undefined && `(${c.digit})`} {c.label && `(${c.label})`}
                                                </span>
                                            </div>
                                            {isSelected && <Check size={14} color="#38bdf8" strokeWidth={3} />}
                                        </button>
                                    );
                                })}
                            </div>

                            <div style={{ marginTop: '6px', textAlign: 'center', color: '#94a3b8', fontSize: '0.68rem' }}>
                                💡 Haz clic en el color deseado para asignarlo a esta banda.
                            </div>
                        </div>
                    )}
                </div>

                {/* ── PANEL DE RESULTADOS Y RANGO ACEPTABLE ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    {/* Valor Nominal Grande */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.85) 100%)', border: '1.5px solid #f59e0b', borderRadius: '16px', padding: '1.25rem' }}>
                        <div style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                            🛑 Valor Nominal Decodificado
                        </div>
                        <div style={{ color: 'white', fontSize: '2.1rem', fontWeight: 900, fontFamily: 'monospace' }}>
                            {formatOhms(value)} <span style={{ fontSize: '1.1rem', color: '#fbbf24' }}>{tolStr}</span>
                        </div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.82rem', marginTop: '6px' }}>
                            Fórmula: <code style={{ color: '#38bdf8', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>{formulaStr} = {value.toLocaleString('en-US')} Ω</code>
                        </div>
                    </div>

                    {/* Rango de Multímetro */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)', border: '1.5px solid #38bdf8', borderRadius: '16px', padding: '1.25rem' }}>
                        <div style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                            📏 Lectura Aceptable con Multímetro ({tolStr})
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                            <div>
                                <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>VALOR MÍNIMO</div>
                                <div style={{ color: '#f87171', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'monospace' }}>
                                    {formatOhms(minVal)}
                                </div>
                            </div>
                            <div style={{ color: '#64748b', fontSize: '1.4rem' }}>⟷</div>
                            <div>
                                <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>VALOR MÁXIMO</div>
                                <div style={{ color: '#34d399', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'monospace' }}>
                                    {formatOhms(maxVal)}
                                </div>
                            </div>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '8px' }}>
                            Cualquier valor en este intervalo medido con el multímetro indica que el resistor está en perfecto estado.
                        </div>
                    </div>
                </div>

                {/* ── BOTONES DE PREAJUSTES COMUNES DE LABORATORIO ── */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.9rem' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                        ⚡ Valores Comerciales Más Usados en Protoboards:
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {PRESETS.map(preset => (
                            <button
                                key={preset.label}
                                onClick={() => {
                                    setB1(preset.b1);
                                    setB2(preset.b2);
                                    setBMul(preset.mul);
                                    setBTol(preset.tol);
                                    setOpenPopover(null);
                                }}
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#cbd5e1',
                                    borderRadius: '8px',
                                    padding: '5px 12px',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#fbbf24'; e.currentTarget.style.color = '#fbbf24'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#cbd5e1'; }}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
