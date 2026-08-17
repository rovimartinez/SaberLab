import { useState } from 'react';
import { Power, Flame, RotateCcw, Lightbulb, Zap } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

export default function SeriesCircuitDemo() {
    const [isSwitchClosed, setIsSwitchClosed] = useState(true);
    const [isBulb2Burned, setIsBulb2Burned] = useState(false);
    const [numBulbs, setNumBulbs] = useState(3); // 2 o 3 bombillos
    const [batteryVoltage, setBatteryVoltage] = useState(12);

    // El circuito solo está completo si el interruptor está cerrado Y el foco 2 no está quemado
    const isCircuitComplete = isSwitchClosed && !isBulb2Burned;

    // Brillo y caída de voltaje por bombillo
    const voltagePerBulb = isCircuitComplete ? (batteryVoltage / numBulbs).toFixed(1) : 0;
    const bulbBrightness = isCircuitComplete ? (1 / numBulbs) * 1.2 : 0;

    // 16 electrones distribuidos homogéneamente en la trayectoria
    const numElectrons = 16;
    const electronDuration = 9.0;
    const electronOffsets = Array.from({ length: numElectrons }, (_, i) => (i * electronDuration / numElectrons));

    return (
        <div className="sim-card" style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div className="sim-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#38bdf8' }}>
                        <Zap size={20} color="#38bdf8" />
                        <span>Simulación Interactiva: Camino Único y Diagnóstico de Foco Quemado</span>
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                        Observa cómo la corriente viaja a través del filamento interno de cada bombillo. Si un filamento se quema y se rompe, toda la serie se apaga.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="sim-btn sim-btn-secondary"
                        onClick={() => {
                            setIsSwitchClosed(true);
                            setIsBulb2Burned(false);
                            setNumBulbs(3);
                        }}
                        style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        <RotateCcw size={13} />
                        <span>Restablecer</span>
                    </button>
                </div>
            </div>

            <div className="sim-card-body" style={{ padding: '1.25rem' }}>
                
                {/* ── DIAGRAMA ESQUEMÁTICO SVG INTERACTIVO ── */}
                <div style={{
                    background: 'linear-gradient(180deg, #090e1a 0%, #0f172a 100%)',
                    border: '1.5px solid rgba(255,255,255,0.08)',
                    borderRadius: '18px',
                    padding: '1.25rem 1rem',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <svg viewBox="0 0 540 220" width="100%" height="230" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            {/* Brillo de los Bombillos encendidos */}
                            <radialGradient id="bulbGlowGrad" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#fef08a" stopOpacity={bulbBrightness} />
                                <stop offset="50%" stopColor="#facc15" stopOpacity={bulbBrightness * 0.6} />
                                <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                            </radialGradient>
                            
                            {/* Batería */}
                            <linearGradient id="batteryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#0284c7" />
                                <stop offset="100%" stopColor="#0369a1" />
                            </linearGradient>

                            {/* Resplandor de electrones */}
                            <filter id="electronGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>

                            {/* Mancha de humo/quemado interno */}
                            <radialGradient id="smokeBurnGrad" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#18181b" stopOpacity="0.85" />
                                <stop offset="50%" stopColor="#27272a" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#3f3f46" stopOpacity="0" />
                            </radialGradient>
                        </defs>

                        {/* ── CABLES CONDUCTORES EXTERIORES (Llegan DIRECTO a los bornes) ── */}
                        
                        {/* Tramo 1: De Batería (+) a Foco 1 borne izquierdo (135, 48) */}
                        <path d="M 50 80 L 50 48 L 135 48" fill="none" stroke={isCircuitComplete ? '#38bdf8' : '#334155'} strokeWidth="3" strokeLinecap="round" />
                        
                        {/* Tramo 2: De Foco 1 borne derecho (165, 48) a Foco 2 borne izquierdo (265, 48) */}
                        <path d="M 165 48 L 265 48" fill="none" stroke={isCircuitComplete ? '#38bdf8' : '#334155'} strokeWidth="3" strokeLinecap="round" />

                        {/* Tramo 3: De Foco 2 borne derecho (295, 48) a Foco 3 (o a la esquina) */}
                        {numBulbs === 3 ? (
                            <>
                                <path d="M 295 48 L 395 48" fill="none" stroke={isCircuitComplete ? '#38bdf8' : '#334155'} strokeWidth="3" strokeLinecap="round" />
                                <path d="M 425 48 L 490 48 L 490 185 L 50 185 L 50 140" fill="none" stroke={isCircuitComplete ? '#38bdf8' : '#334155'} strokeWidth="3" strokeLinecap="round" />
                            </>
                        ) : (
                            <path d="M 295 48 L 490 48 L 490 185 L 50 185 L 50 140" fill="none" stroke={isCircuitComplete ? '#38bdf8' : '#334155'} strokeWidth="3" strokeLinecap="round" />
                        )}

                        {/* ── BATERÍA / FUENTE (Lado Izquierdo, Polo + arriba, Polo - abajo) ── */}
                        <g transform="translate(30, 80)">
                            <rect x="0" y="0" width="40" height="60" rx="5" fill="url(#batteryGrad)" stroke="#38bdf8" strokeWidth="1.5" />
                            <rect x="13" y="-5" width="14" height="5" rx="2" fill="#ef4444" />
                            <text x="20" y="24" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="900">+</text>
                            <text x="20" y="50" textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="900">−</text>
                            <text x="-16" y="34" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="900">{batteryVoltage}V</text>
                        </g>

                        {/* ── INTERRUPTOR INTERACTIVO (Riel Inferior, X=220..300, Y=185) ── */}
                        <g 
                            transform="translate(220, 170)" 
                            onClick={() => setIsSwitchClosed(!isSwitchClosed)} 
                            style={{ cursor: 'pointer' }}
                        >
                            <rect x="-10" y="0" width="100" height="30" rx="6" fill="rgba(15,23,42,0.9)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                            <circle cx="10" cy="15" r="4" fill="#94a3b8" />
                            <circle cx="70" cy="15" r="4" fill="#94a3b8" />
                            
                            {isSwitchClosed ? (
                                <line x1="10" y1="15" x2="70" y2="15" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
                            ) : (
                                <line x1="10" y1="15" x2="55" y2="-5" stroke="#f87171" strokeWidth="4" strokeLinecap="round" />
                            )}
                            <text x="40" y="27" textAnchor="middle" fill={isSwitchClosed ? '#34d399' : '#f87171'} fontSize="8" fontWeight="800">
                                {isSwitchClosed ? 'CERRADO (ON)' : 'ABIERTO (OFF)'}
                            </text>
                        </g>

                        {/* ── BOMBILLO 1 (X=130..170) ── */}
                        <g transform="translate(130, 5)">
                            {isCircuitComplete && <circle cx="20" cy="24" r="28" fill="url(#bulbGlowGrad)" />}
                            {/* Cristal de la bombilla */}
                            <circle cx="20" cy="24" r="16" fill={isCircuitComplete ? '#fef08a' : 'rgba(255,255,255,0.06)'} stroke={isCircuitComplete ? '#facc15' : '#64748b'} strokeWidth="1.6" />
                            {/* Reflejo de cristal */}
                            <path d="M 10 18 Q 12 13 18 11" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                            {/* Postes de soporte de filamento */}
                            <line x1="13" y1="41" x2="15" y2="24" stroke={isCircuitComplete ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                            <line x1="27" y1="41" x2="25" y2="24" stroke={isCircuitComplete ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                            {/* Filamento de tungsteno intacto */}
                            <path d="M 15 24 Q 17 18 20 19 Q 23 18 25 24" stroke={isCircuitComplete ? '#ffffff' : '#94a3b8'} strokeWidth="1.8" fill="none" />
                            {/* Casquillo / Portalámparas */}
                            <rect x="7" y="39" width="26" height="9" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />
                            <circle cx="5" cy="43" r="3" fill="#38bdf8" />
                            <circle cx="35" cy="43" r="3" fill="#38bdf8" />
                            <text x="20" y="62" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="800">Foco 1 ({voltagePerBulb}V)</text>
                        </g>

                        {/* ── BOMBILLO 2 (X=260..300) (INTERACTIVO: SE PUEDE QUEMAR / REPARAR) ── */}
                        <g 
                            transform="translate(260, 5)" 
                            onClick={() => setIsBulb2Burned(!isBulb2Burned)} 
                            style={{ cursor: 'pointer' }}
                            title={isBulb2Burned ? "Haz clic para reparar o reemplazar el foco quemado" : "Haz clic para quemar / fundir el foco"}
                        >
                            {!isBulb2Burned ? (
                                <>
                                    {isCircuitComplete && <circle cx="20" cy="24" r="28" fill="url(#bulbGlowGrad)" />}
                                    {/* Cristal de la bombilla */}
                                    <circle cx="20" cy="24" r="16" fill={isCircuitComplete ? '#fef08a' : 'rgba(255,255,255,0.06)'} stroke={isCircuitComplete ? '#facc15' : '#64748b'} strokeWidth="1.6" />
                                    {/* Reflejo de cristal */}
                                    <path d="M 10 18 Q 12 13 18 11" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                                    {/* Postes de soporte de filamento */}
                                    <line x1="13" y1="41" x2="15" y2="24" stroke={isCircuitComplete ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                                    <line x1="27" y1="41" x2="25" y2="24" stroke={isCircuitComplete ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                                    {/* Filamento intacto */}
                                    <path d="M 15 24 Q 17 18 20 19 Q 23 18 25 24" stroke={isCircuitComplete ? '#ffffff' : '#94a3b8'} strokeWidth="1.8" fill="none" />
                                    {/* Casquillo / Portalámparas */}
                                    <rect x="7" y="39" width="26" height="9" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />
                                    <circle cx="5" cy="43" r="3" fill="#38bdf8" />
                                    <circle cx="35" cy="43" r="3" fill="#38bdf8" />
                                    <text x="20" y="62" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="800">Foco 2 ({voltagePerBulb}V)</text>
                                </>
                            ) : (
                                <>
                                    {/* Cristal de la bombilla con tono apagado */}
                                    <circle cx="20" cy="24" r="16" fill="rgba(15,23,42,0.85)" stroke="#64748b" strokeWidth="1.6" />
                                    
                                    {/* Mancha negra de humo / quemadura en el interior del vidrio */}
                                    <circle cx="20" cy="20" r="10" fill="url(#smokeBurnGrad)" />
                                    
                                    {/* Reflejo de cristal tenue */}
                                    <path d="M 10 18 Q 12 13 18 11" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                                    
                                    {/* Postes de soporte oscurecidos */}
                                    <line x1="13" y1="41" x2="15" y2="24" stroke="#475569" strokeWidth="1.4" />
                                    <line x1="27" y1="41" x2="25" y2="24" stroke="#475569" strokeWidth="1.4" />
                                    
                                    {/* ── FILAMENTO ROTO / FUNDIDO (Puntas quemadas separadas) ── */}
                                    {/* Extremo izquierdo roto */}
                                    <path d="M 15 24 Q 16 20 17 22" stroke="#71717a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                                    <circle cx="17" cy="22" r="1.6" fill="#18181b" stroke="#71717a" strokeWidth="0.8" />
                                    
                                    {/* Extremo derecho roto */}
                                    <path d="M 25 24 Q 24 20 23 22" stroke="#71717a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                                    <circle cx="23" cy="22" r="1.6" fill="#18181b" stroke="#71717a" strokeWidth="0.8" />
                                    
                                    {/* Casquillo / Portalámparas */}
                                    <rect x="7" y="39" width="26" height="9" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />
                                    <circle cx="5" cy="43" r="3" fill="#64748b" />
                                    <circle cx="35" cy="43" r="3" fill="#64748b" />
                                    <text x="20" y="62" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="900">Foco 2 (QUEMADO)</text>
                                </>
                            )}
                        </g>

                        {/* ── BOMBILLO 3 (X=390..430) ── */}
                        {numBulbs === 3 && (
                            <g transform="translate(390, 5)">
                                {isCircuitComplete && <circle cx="20" cy="24" r="28" fill="url(#bulbGlowGrad)" />}
                                <circle cx="20" cy="24" r="16" fill={isCircuitComplete ? '#fef08a' : 'rgba(255,255,255,0.06)'} stroke={isCircuitComplete ? '#facc15' : '#64748b'} strokeWidth="1.6" />
                                <path d="M 10 18 Q 12 13 18 11" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                                <line x1="13" y1="41" x2="15" y2="24" stroke={isCircuitComplete ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                                <line x1="27" y1="41" x2="25" y2="24" stroke={isCircuitComplete ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                                <path d="M 15 24 Q 17 18 20 19 Q 23 18 25 24" stroke={isCircuitComplete ? '#ffffff' : '#94a3b8'} strokeWidth="1.8" fill="none" />
                                <rect x="7" y="39" width="26" height="9" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />
                                <circle cx="5" cy="43" r="3" fill="#38bdf8" />
                                <circle cx="35" cy="43" r="3" fill="#38bdf8" />
                                <text x="20" y="62" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="800">Foco 3 ({voltagePerBulb}V)</text>
                            </g>
                        )}

                        {/* ── PARTÍCULAS EN MOVIMIENTO (FLUJO DE + A - A TRAVÉS DE CADA FILAMENTO) ── */}
                        {isCircuitComplete && electronOffsets.map((offset, i) => (
                            <g key={i} filter="url(#electronGlow)">
                                <circle r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1">
                                    <animateMotion
                                        dur={`${electronDuration}s`}
                                        repeatCount="indefinite"
                                        begin={`${-offset}s`}
                                        path={numBulbs === 3 
                                            ? "M 50 48 L 135 48 L 150 24 L 165 48 L 265 48 L 280 24 L 295 48 L 395 48 L 410 24 L 425 48 L 490 48 L 490 185 L 50 185 Z"
                                            : "M 50 48 L 135 48 L 150 24 L 165 48 L 265 48 L 280 24 L 295 48 L 490 48 L 490 185 L 50 185 Z"
                                        }
                                    />
                                </circle>
                                <text textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="900" dy="2.5">
                                    <animateMotion
                                        dur={`${electronDuration}s`}
                                        repeatCount="indefinite"
                                        begin={`${-offset}s`}
                                        path={numBulbs === 3 
                                            ? "M 50 48 L 135 48 L 150 24 L 165 48 L 265 48 L 280 24 L 295 48 L 395 48 L 410 24 L 425 48 L 490 48 L 490 185 L 50 185 Z"
                                            : "M 50 48 L 135 48 L 150 24 L 165 48 L 265 48 L 280 24 L 295 48 L 490 48 L 490 185 L 50 185 Z"
                                        }
                                    />
                                    −
                                </text>
                            </g>
                        ))}
                    </svg>

                    {/* Barra de Estado Inferior */}
                    <div style={{
                        marginTop: '0.5rem',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        background: isCircuitComplete ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        border: `1px solid ${isCircuitComplete ? '#10b981' : '#ef4444'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '1rem' }}>{isCircuitComplete ? '⚡' : '⛔'}</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isCircuitComplete ? '#34d399' : '#f87171' }}>
                                {isCircuitComplete 
                                    ? 'Circuito Serie Cerrado: La corriente fluye de (+) a (−) pasando por el filamento de cada foco.' 
                                    : !isSwitchClosed 
                                        ? 'Circuito Abierto (Interruptor OFF): El paso de corriente está cortado en el interruptor.'
                                        : 'Falla en Serie (Foco 2 Quemado): El filamento interno se fundió y se partió; al abrirse el lazo, NINGÚN foco enciende.'}
                            </span>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700 }}>
                            Voltaje por foco: <strong style={{ color: '#facc15' }}>{voltagePerBulb} V</strong>
                        </div>
                    </div>
                </div>

                {/* ── CONTROLES INTERACTIVOS ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '1rem' }}>
                    
                    {/* Botón Interruptor */}
                    <button
                        onClick={() => setIsSwitchClosed(!isSwitchClosed)}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '12px',
                            background: isSwitchClosed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            border: `1.5px solid ${isSwitchClosed ? '#ef4444' : '#10b981'}`,
                            color: isSwitchClosed ? '#fca5a5' : '#6ee7b7',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                    >
                        <Power size={15} />
                        <span>{isSwitchClosed ? 'Abrir Interruptor (OFF)' : 'Cerrar Interruptor (ON)'}</span>
                    </button>

                    {/* Botón Quemar / Reparar Foco */}
                    <button
                        onClick={() => setIsBulb2Burned(!isBulb2Burned)}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '12px',
                            background: isBulb2Burned ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            border: `1.5px solid ${isBulb2Burned ? '#38bdf8' : '#ef4444'}`,
                            color: isBulb2Burned ? '#7dd3fc' : '#fca5a5',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                    >
                        {isBulb2Burned ? <Lightbulb size={15} color="#38bdf8" /> : <Flame size={15} color="#ef4444" />}
                        <span>{isBulb2Burned ? 'Reemplazar / Reparar Foco 2' : 'Simular Foco 2 Quemado'}</span>
                    </button>

                    {/* Selector de Cantidad de Focos */}
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '6px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 800 }}>Focos en Serie:</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                                onClick={() => setNumBulbs(2)}
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    background: numBulbs === 2 ? '#38bdf8' : 'rgba(255,255,255,0.06)',
                                    color: numBulbs === 2 ? '#0f172a' : '#cbd5e1',
                                    border: 'none',
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    cursor: 'pointer'
                                }}
                            >
                                2 Focos
                            </button>
                            <button
                                onClick={() => setNumBulbs(3)}
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    background: numBulbs === 3 ? '#38bdf8' : 'rgba(255,255,255,0.06)',
                                    color: numBulbs === 3 ? '#0f172a' : '#cbd5e1',
                                    border: 'none',
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    cursor: 'pointer'
                                }}
                            >
                                3 Focos
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
