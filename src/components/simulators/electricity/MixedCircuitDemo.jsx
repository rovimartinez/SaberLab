import { useState } from 'react';
import { Power, Flame, RotateCcw, Zap, GitFork, Activity } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

export default function MixedCircuitDemo() {
    const [isSwitchClosed, setIsSwitchClosed] = useState(true);
    const [isBulb1Burned, setIsBulb1Burned] = useState(false);
    const [isBulb2Burned, setIsBulb2Burned] = useState(false);
    const [batteryVoltage, setBatteryVoltage] = useState(24);

    // Resistencia de cada foco (en Ohmios)
    const R1 = 10; // Foco 1 en serie
    const R2 = 30; // Foco 2 en paralelo
    const R3 = 60; // Foco 3 en paralelo

    // Estado del circuito
    // Si el interruptor está abierto o Foco 1 se quema, todo el circuito se apaga
    const isCircuitOpen = !isSwitchClosed || isBulb1Burned;

    // Resistencia del bloque paralelo (R2 // R3)
    let Rp = 0;
    if (!isCircuitOpen) {
        if (!isBulb2Burned && true) { // Ambos funcionando (Foco 2 y Foco 3)
            Rp = (R2 * R3) / (R2 + R3); // 20 Ohm
        } else if (isBulb2Burned) { // Solo Foco 3 en paralelo
            Rp = R3; // 60 Ohm
        }
    }

    // Resistencia total equivalente
    const Req = isCircuitOpen ? Infinity : R1 + Rp;

    // Corrientes y voltajes
    const Itotal = isCircuitOpen ? 0 : batteryVoltage / Req;
    const V1 = isCircuitOpen ? 0 : Itotal * R1;
    const Vp = isCircuitOpen ? 0 : batteryVoltage - V1;

    const I2 = isCircuitOpen || isBulb2Burned ? 0 : Vp / R2;
    const I3 = isCircuitOpen ? 0 : Vp / R3;

    // Animación de partículas de electrones
    const numElectrons = 6;
    const electronDuration = 5.0;
    const b2Offsets = Array.from({ length: numElectrons }, (_, i) => (i * electronDuration / numElectrons));
    const b3Offsets = Array.from({ length: numElectrons }, (_, i) => (i * electronDuration / numElectrons));

    return (
        <div className="sim-card" style={{ maxWidth: '840px', margin: '0 auto' }}>
            <div className="sim-card-header">
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#f59e0b' }}>
                    <GitFork size={20} color="#f59e0b" />
                    <span>Simulación Interactiva: Circuito Mixto (Serie + Paralelo)</span>
                </h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                    El Foco 1 está en <strong>serie</strong> con el bloque paralelo (Focos 2 y 3). Observa cómo reacciona el sistema ante fallas en diferentes posiciones.
                </p>
            </div>

            <div className="sim-card-body" style={{ padding: '1.25rem' }}>
                {/* Controles interactivos */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15,23,42,0.6)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                            className={`sim-btn ${isSwitchClosed ? 'sim-btn-primary' : 'sim-btn-secondary'}`}
                            onClick={() => setIsSwitchClosed(!isSwitchClosed)}
                            style={{ padding: '7px 14px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Power size={15} />
                            <span>Interruptor: {isSwitchClosed ? 'ON' : 'OFF'}</span>
                        </button>

                        <button
                            className="sim-btn sim-btn-secondary"
                            onClick={() => setIsBulb1Burned(!isBulb1Burned)}
                            style={{
                                padding: '7px 12px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                color: isBulb1Burned ? '#34d399' : '#f87171',
                                border: isBulb1Burned ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                                background: isBulb1Burned ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                            }}
                        >
                            <Flame size={14} />
                            <span>{isBulb1Burned ? 'Reparar Foco 1 (Serie)' : '💥 Quemar Foco 1 (Serie)'}</span>
                        </button>

                        <button
                            className="sim-btn sim-btn-secondary"
                            onClick={() => setIsBulb2Burned(!isBulb2Burned)}
                            style={{
                                padding: '7px 12px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                color: isBulb2Burned ? '#34d399' : '#f87171',
                                border: isBulb2Burned ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                                background: isBulb2Burned ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                            }}
                        >
                            <Flame size={14} />
                            <span>{isBulb2Burned ? 'Reparar Foco 2 (Paralelo)' : '💥 Quemar Foco 2 (Paralelo)'}</span>
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.82rem', color: '#94a3b8' }}>
                        <span>Fuente:</span>
                        <button
                            className={`sim-btn ${batteryVoltage === 24 ? 'sim-btn-primary' : 'sim-btn-secondary'}`}
                            onClick={() => setBatteryVoltage(24)}
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                            24V
                        </button>
                        <button
                            className={`sim-btn ${batteryVoltage === 48 ? 'sim-btn-primary' : 'sim-btn-secondary'}`}
                            onClick={() => setBatteryVoltage(48)}
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                            48V
                        </button>
                    </div>
                </div>

                {/* Lienzo SVG del Circuito Mixto */}
                <div style={{
                    background: 'linear-gradient(180deg, #090e1a 0%, #0f172a 100%)',
                    borderRadius: '16px',
                    border: '1.5px solid rgba(255,255,255,0.08)',
                    padding: '1rem',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <svg viewBox="0 0 600 240" width="100%" height="250" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <radialGradient id="bulbGlowGradMix" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
                                <stop offset="50%" stopColor="#facc15" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                            </radialGradient>

                            <linearGradient id="batGradMix" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#0284c7" />
                                <stop offset="100%" stopColor="#0369a1" />
                            </linearGradient>

                            <filter id="electronGlowMix" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>

                            <radialGradient id="smokeBurnGradMix" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#18181b" stopOpacity="0.85" />
                                <stop offset="50%" stopColor="#27272a" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#3f3f46" stopOpacity="0" />
                            </radialGradient>
                        </defs>

                        {/* Rieles y Conductores */}
                        {/* Riel superior: Batería a Interruptor (Y = 52) */}
                        <line x1="40" y1="52" x2="85" y2="52" stroke={!isCircuitOpen ? '#38bdf8' : '#334155'} strokeWidth="3" />
                        {/* Interruptor a Foco 1 */}
                        <line x1="115" y1="52" x2="185" y2="52" stroke={!isCircuitOpen ? '#38bdf8' : '#334155'} strokeWidth="3" />

                        {/* Riel superior después de Foco 1 (x=235) hasta el bloque paralelo (x=380 y x=520) */}
                        <line x1="235" y1="52" x2="520" y2="52" stroke={!isCircuitOpen ? '#38bdf8' : '#334155'} strokeWidth="3" />

                        {/* Riel inferior completo (Y = 210) */}
                        <line x1="40" y1="210" x2="520" y2="210" stroke={!isCircuitOpen ? '#38bdf8' : '#334155'} strokeWidth="3" />

                        {/* Nodos Eléctricos del Bloque Paralelo */}
                        <circle cx="380" cy="52" r="4" fill="#38bdf8" />
                        <circle cx="380" cy="210" r="4" fill="#38bdf8" />
                        <circle cx="520" cy="52" r="4" fill="#38bdf8" />
                        <circle cx="520" cy="210" r="4" fill="#38bdf8" />

                        {/* BATERÍA / FUENTE (Izquierda) */}
                        <g transform="translate(20, 100)">
                            <line x1="20" y1="-48" x2="20" y2="0" stroke={!isCircuitOpen ? '#38bdf8' : '#334155'} strokeWidth="3" />
                            <line x1="20" y1="60" x2="20" y2="110" stroke={!isCircuitOpen ? '#38bdf8' : '#334155'} strokeWidth="3" />
                            <rect x="0" y="0" width="40" height="60" rx="5" fill="url(#batGradMix)" stroke="#38bdf8" strokeWidth="1.5" />
                            <rect x="13" y="-5" width="14" height="5" rx="2" fill="#ef4444" />
                            <text x="20" y="24" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="900">+</text>
                            <text x="20" y="50" textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="900">−</text>
                            <text x="-16" y="34" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="900">{batteryVoltage}V</text>
                        </g>

                        {/* INTERRUPTOR PRINCIPAL (Y = 52) */}
                        <g transform="translate(100, 52)">
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

                        {/* ══════════════ FOCO 1 (EN SERIE - CONECTADO AL RAS Y ETIQUETA A LA DERECHA) ══════════════ */}
                        <g 
                            transform="translate(185, 52)"
                            onClick={() => setIsBulb1Burned(!isBulb1Burned)}
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Casquillo / Portalámparas que conecta directamente de x=0 a x=50 */}
                            <rect x="0" y="-6" width="50" height="12" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
                            <circle cx="4" cy="0" r="3" fill={!isCircuitOpen ? '#38bdf8' : '#64748b'} />
                            <circle cx="46" cy="0" r="3" fill={!isCircuitOpen ? '#38bdf8' : '#64748b'} />

                            {!isBulb1Burned ? (
                                <>
                                    {!isCircuitOpen && (
                                        <circle cx="25" cy="-24" r="28" fill="url(#bulbGlowGradMix)" opacity="0.95" />
                                    )}
                                    <circle cx="25" cy="-24" r="16" fill={!isCircuitOpen ? '#fef08a' : 'rgba(255,255,255,0.06)'} stroke={!isCircuitOpen ? '#facc15' : '#64748b'} strokeWidth="1.6" />
                                    <path d="M 15 -30 Q 17 -35 23 -37" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                                    {/* Postes de soporte */}
                                    <line x1="18" y1="-6" x2="20" y2="-24" stroke={!isCircuitOpen ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                                    <line x1="32" y1="-6" x2="30" y2="-24" stroke={!isCircuitOpen ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                                    {/* Filamento incandescente */}
                                    <path d="M 20 -24 Q 22 -30 25 -29 Q 28 -30 30 -24" stroke={!isCircuitOpen ? '#ffffff' : '#94a3b8'} strokeWidth="1.8" fill="none" />
                                </>
                            ) : (
                                <>
                                    <circle cx="25" cy="-24" r="16" fill="rgba(15,23,42,0.85)" stroke="#ef4444" strokeWidth="1.6" strokeDasharray="3 2" />
                                    <circle cx="25" cy="-24" r="10" fill="url(#smokeBurnGradMix)" />
                                    <line x1="18" y1="-6" x2="20" y2="-24" stroke="#475569" strokeWidth="1.4" />
                                    <line x1="32" y1="-6" x2="30" y2="-24" stroke="#475569" strokeWidth="1.4" />
                                    {/* Filamento fundido */}
                                    <path d="M 20 -24 Q 21 -27 22 -26" stroke="#71717a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                                    <circle cx="22" cy="-26" r="1.5" fill="#18181b" stroke="#71717a" strokeWidth="0.8" />
                                    <path d="M 30 -24 Q 29 -27 28 -26" stroke="#71717a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                                    <circle cx="28" cy="-26" r="1.5" fill="#18181b" stroke="#71717a" strokeWidth="0.8" />
                                </>
                            )}

                            {/* Medición de Foco 1 */}
                            <g transform="translate(25, 20)">
                                <rect x="-38" y="-9" width="76" height="18" rx="9" fill="#090e1a" stroke={!isCircuitOpen ? '#38bdf8' : '#64748b'} strokeWidth="1.2" />
                                <text x="0" y="3.5" textAnchor="middle" fill={!isCircuitOpen ? '#38bdf8' : '#64748b'} fontSize="8" fontWeight="900" fontFamily="monospace">
                                    {V1.toFixed(1)}V · {Itotal.toFixed(2)}A
                                </text>
                            </g>

                            {/* Etiqueta situada a la DERECHA del foco */}
                            <text x="56" y="-20" textAnchor="start" fill={isBulb1Burned ? '#ef4444' : '#fbbf24'} fontSize="9.5" fontWeight="900">
                                {isBulb1Burned ? 'Foco 1 (QUEMADO)' : 'Foco 1 (SERIE)'}
                            </text>
                        </g>

                        {/* ══════════════ BLOQUE PARALELO (RAMA 2: FOCO 2) ══════════════ */}
                        <g 
                            transform="translate(380, 52)"
                            onClick={() => setIsBulb2Burned(!isBulb2Burned)}
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Etiqueta situada a la derecha del cable vertical */}
                            <text x="14" y="18" textAnchor="start" fill={isBulb2Burned ? '#ef4444' : '#fbbf24'} fontSize="9" fontWeight="900">
                                {isBulb2Burned ? 'Foco 2 (QUEMADO)' : 'Foco 2 (Paralelo)'}
                            </text>

                            {/* Cable superior */}
                            <line x1="0" y1="0" x2="0" y2="56" stroke={I2 > 0 ? '#38bdf8' : '#334155'} strokeWidth="2.5" />

                            {/* Base */}
                            <rect x="-8" y="56" width="16" height="32" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
                            <line x1="-7" y1="64" x2="7" y2="64" stroke="#475569" strokeWidth="1" />
                            <line x1="-7" y1="72" x2="7" y2="72" stroke="#475569" strokeWidth="1" />
                            <line x1="-7" y1="80" x2="7" y2="80" stroke="#475569" strokeWidth="1" />
                            <circle cx="0" cy="56" r="2.5" fill={I2 > 0 ? '#38bdf8' : '#64748b'} />
                            <circle cx="0" cy="88" r="2.5" fill={I2 > 0 ? '#38bdf8' : '#64748b'} />

                            {/* Foco de Costado con Resplandor Vibrante */}
                            {!isBulb2Burned ? (
                                <>
                                    {I2 > 0 && (
                                        <circle cx="28" cy="72" r="28" fill="url(#bulbGlowGradMix)" opacity="0.95" />
                                    )}
                                    <circle cx="28" cy="72" r="16" fill={I2 > 0 ? '#fef08a' : 'rgba(255,255,255,0.06)'} stroke={I2 > 0 ? '#facc15' : '#64748b'} strokeWidth="1.6" />
                                    <path d="M 22 64 Q 27 60 32 62" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                                    <line x1="8" y1="67" x2="24" y2="67" stroke={I2 > 0 ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                                    <line x1="8" y1="77" x2="24" y2="77" stroke={I2 > 0 ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                                    <path d="M 24 67 Q 29 70 30 72 Q 29 74 24 77" stroke={I2 > 0 ? '#ffffff' : '#94a3b8'} strokeWidth="1.8" fill="none" />
                                </>
                            ) : (
                                <>
                                    <circle cx="28" cy="72" r="16" fill="rgba(15,23,42,0.85)" stroke="#ef4444" strokeWidth="1.6" strokeDasharray="3 2" />
                                    <circle cx="28" cy="72" r="10" fill="url(#smokeBurnGradMix)" />
                                    <line x1="8" y1="67" x2="24" y2="67" stroke="#475569" strokeWidth="1.4" />
                                    <line x1="8" y1="77" x2="24" y2="77" stroke="#475569" strokeWidth="1.4" />
                                    <path d="M 24 67 Q 27 68 28 69" stroke="#71717a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                                    <circle cx="28" cy="69" r="1.5" fill="#18181b" stroke="#71717a" strokeWidth="0.8" />
                                    <path d="M 24 77 Q 27 76 28 75" stroke="#71717a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                                    <circle cx="28" cy="75" r="1.5" fill="#18181b" stroke="#71717a" strokeWidth="0.8" />
                                </>
                            )}

                            {/* Cable inferior */}
                            <line x1="0" y1="88" x2="0" y2="115" stroke={I2 > 0 ? '#38bdf8' : '#334155'} strokeWidth="2.5" />

                            {/* Medición */}
                            <g transform="translate(14, 126)">
                                <rect x="-38" y="-9" width="76" height="18" rx="9" fill="#090e1a" stroke={I2 > 0 ? '#38bdf8' : '#64748b'} strokeWidth="1.2" />
                                <text x="0" y="3.5" textAnchor="middle" fill={I2 > 0 ? '#38bdf8' : '#64748b'} fontSize="8" fontWeight="900" fontFamily="monospace">
                                    {Vp.toFixed(1)}V · {I2.toFixed(2)}A
                                </text>
                            </g>

                            {/* Cable al riel inferior */}
                            <line x1="0" y1="135" x2="0" y2="158" stroke={I2 > 0 ? '#38bdf8' : '#334155'} strokeWidth="2.5" />
                        </g>

                        {/* ══════════════ BLOQUE PARALELO (RAMA 3: FOCO 3) ══════════════ */}
                        <g transform="translate(520, 52)">
                            {/* Etiqueta situada a la derecha del cable vertical */}
                            <text x="14" y="18" textAnchor="start" fill="#fbbf24" fontSize="9" fontWeight="900">
                                Foco 3 (Paralelo)
                            </text>

                            {/* Cable superior */}
                            <line x1="0" y1="0" x2="0" y2="56" stroke={I3 > 0 ? '#38bdf8' : '#334155'} strokeWidth="2.5" />

                            {/* Base */}
                            <rect x="-8" y="56" width="16" height="32" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
                            <line x1="-7" y1="64" x2="7" y2="64" stroke="#475569" strokeWidth="1" />
                            <line x1="-7" y1="72" x2="7" y2="72" stroke="#475569" strokeWidth="1" />
                            <line x1="-7" y1="80" x2="7" y2="80" stroke="#475569" strokeWidth="1" />
                            <circle cx="0" cy="56" r="2.5" fill={I3 > 0 ? '#38bdf8' : '#64748b'} />
                            <circle cx="0" cy="88" r="2.5" fill={I3 > 0 ? '#38bdf8' : '#64748b'} />

                            {/* Foco de Costado con Resplandor Vibrante */}
                            {I3 > 0 && (
                                <circle cx="28" cy="72" r="28" fill="url(#bulbGlowGradMix)" opacity="0.95" />
                            )}
                            <circle cx="28" cy="72" r="16" fill={I3 > 0 ? '#fef08a' : 'rgba(255,255,255,0.06)'} stroke={I3 > 0 ? '#facc15' : '#64748b'} strokeWidth="1.6" />
                            <path d="M 22 64 Q 27 60 32 62" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                            <line x1="8" y1="67" x2="24" y2="67" stroke={I3 > 0 ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                            <line x1="8" y1="77" x2="24" y2="77" stroke={I3 > 0 ? '#f59e0b' : '#64748b'} strokeWidth="1.4" />
                            <path d="M 24 67 Q 29 70 30 72 Q 29 74 24 77" stroke={I3 > 0 ? '#ffffff' : '#94a3b8'} strokeWidth="1.8" fill="none" />

                            {/* Cable inferior */}
                            <line x1="0" y1="88" x2="0" y2="115" stroke={I3 > 0 ? '#38bdf8' : '#334155'} strokeWidth="2.5" />

                            {/* Medición */}
                            <g transform="translate(14, 126)">
                                <rect x="-38" y="-9" width="76" height="18" rx="9" fill="#090e1a" stroke={I3 > 0 ? '#38bdf8' : '#64748b'} strokeWidth="1.2" />
                                <text x="0" y="3.5" textAnchor="middle" fill={I3 > 0 ? '#38bdf8' : '#64748b'} fontSize="8" fontWeight="900" fontFamily="monospace">
                                    {Vp.toFixed(1)}V · {I3.toFixed(2)}A
                                </text>
                            </g>

                            {/* Cable al riel inferior */}
                            <line x1="0" y1="135" x2="0" y2="158" stroke={I3 > 0 ? '#38bdf8' : '#334155'} strokeWidth="2.5" />
                        </g>

                        {/* ══════════════ MEDIDOR DE CORRIENTE TOTAL IT (Y = 210) ══════════════ */}
                        <g transform="translate(100, 210)">
                            <rect x="-52" y="-13" width="104" height="26" rx="13" fill="#090e1a" stroke="#34d399" strokeWidth="1.5" />
                            <text x="0" y="4" textAnchor="middle" fill="#34d399" fontSize="9.5" fontWeight="900" fontFamily="monospace">
                                IT = {Itotal.toFixed(2)} A
                            </text>
                        </g>

                        {/* ══════════════ FLUJO DE ELECTRONES ANIMADOS (PASAN POR CADA FILAMENTO) ══════════════ */}
                        {/* Electrones Rama 2: Pasan por filamento de Foco 1 (210,30) y filamento de Foco 2 (410,124) */}
                        {I2 > 0 && b2Offsets.map((offset, i) => (
                            <g key={`m2-${i}`} filter="url(#electronGlowMix)">
                                <circle r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1">
                                    <animateMotion
                                        dur={`${electronDuration}s`}
                                        repeatCount="indefinite"
                                        begin={`${-offset}s`}
                                        path="M 40 52 L 85 52 L 115 52 L 185 52 L 210 30 L 235 52 L 380 52 L 380 119 L 404 119 L 410 124 L 404 129 L 380 140 L 380 210 L 40 210 L 40 52 Z"
                                    />
                                </circle>
                                <text textAnchor="middle" fill="#0f172a" fontSize="6.5" fontWeight="900" dy="2.5">
                                    <animateMotion
                                        dur={`${electronDuration}s`}
                                        repeatCount="indefinite"
                                        begin={`${-offset}s`}
                                        path="M 40 52 L 85 52 L 115 52 L 185 52 L 210 30 L 235 52 L 380 52 L 380 119 L 404 119 L 410 124 L 404 129 L 380 140 L 380 210 L 40 210 L 40 52 Z"
                                    />
                                    −
                                </text>
                            </g>
                        ))}

                        {/* Electrones Rama 3: Pasan por filamento de Foco 1 (210,30) y filamento de Foco 3 (550,124) */}
                        {I3 > 0 && b3Offsets.map((offset, i) => (
                            <g key={`m3-${i}`} filter="url(#electronGlowMix)">
                                <circle r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1">
                                    <animateMotion
                                        dur={`${electronDuration * 1.1}s`}
                                        repeatCount="indefinite"
                                        begin={`${-offset}s`}
                                        path="M 40 52 L 85 52 L 115 52 L 185 52 L 210 30 L 235 52 L 380 52 L 520 52 L 520 119 L 544 119 L 550 124 L 544 129 L 520 140 L 520 210 L 40 210 L 40 52 Z"
                                    />
                                </circle>
                                <text textAnchor="middle" fill="#0f172a" fontSize="6.5" fontWeight="900" dy="2.5">
                                    <animateMotion
                                        dur={`${electronDuration * 1.1}s`}
                                        repeatCount="indefinite"
                                        begin={`${-offset}s`}
                                        path="M 40 52 L 85 52 L 115 52 L 185 52 L 210 30 L 235 52 L 380 52 L 520 52 L 520 119 L 544 119 L 550 124 L 544 129 L 520 140 L 520 210 L 40 210 L 40 52 Z"
                                    />
                                    −
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>

                {/* Resumen analítico del circuito mixto */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '1rem' }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '12px', padding: '10px' }}>
                        <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.8rem', marginBottom: '2px' }}>📊 Resistencia Equivalente:</div>
                        <div style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 900 }}>
                            {isCircuitOpen ? '∞ (Abierto)' : `${Req.toFixed(1)} Ω`}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.73rem', marginTop: '2px' }}>
                            R1 (10Ω) + Rp ({Rp.toFixed(1)}Ω)
                        </div>
                    </div>

                    <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '12px', padding: '10px' }}>
                        <div style={{ color: '#34d399', fontWeight: 800, fontSize: '0.8rem', marginBottom: '2px' }}>⚡ Corriente Total (I_T):</div>
                        <div style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 900 }}>{Itotal.toFixed(2)} A</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.73rem', marginTop: '2px' }}>I_T = I2 ({I2.toFixed(2)}A) + I3 ({I3.toFixed(2)}A)</div>
                    </div>

                    <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '10px' }}>
                        <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.8rem', marginBottom: '2px' }}>📉 Caídas de Voltaje:</div>
                        <div style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: 900 }}>
                            V_serie: {V1.toFixed(1)}V | V_paralelo: {Vp.toFixed(1)}V
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.73rem', marginTop: '2px' }}>Suma LVK: {V1.toFixed(1)}V + {Vp.toFixed(1)}V = {batteryVoltage}V</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
