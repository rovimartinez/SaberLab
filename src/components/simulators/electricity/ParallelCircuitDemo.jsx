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

    return (
        <div className="sim-card" style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div className="sim-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#f59e0b' }}>
                        <Split size={20} color="#f59e0b" />
                        <span>Simulación Interactiva: Ramas Independientes y Prueba de Foco Quemado</span>
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                        A diferencia del circuito serie, si un bombillo se quema en paralelo, las demás ramas siguen recibiendo 12V y permanecen encendidas con brillo total.
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
                            <span>Interruptor General: {isSwitchClosed ? 'CERRADO (ON)' : 'ABIERTO (OFF)'}</span>
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
                    textAlign: 'center'
                }}>
                    <svg viewBox="0 0 540 230" width="100%" height="240" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <radialGradient id="bulbGlowParH" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
                                <stop offset="50%" stopColor="#eab308" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
                            </radialGradient>
                            <linearGradient id="batGradPar" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#0284c7" />
                                <stop offset="100%" stopColor="#0369a1" />
                            </linearGradient>
                        </defs>

                        {/* Riel Superior Partido (Pasa por el interruptor sin cable fantasma debajo) */}
                        <line x1="40" y1="35" x2="85" y2="35" stroke="#475569" strokeWidth="3" />
                        <line x1="115" y1="35" x2={numBranches === 3 ? "460" : "320"} y2="35" stroke="#475569" strokeWidth="3" />

                        {/* Riel Inferior Principal */}
                        <line x1="40" y1="195" x2={numBranches === 3 ? "460" : "320"} y2="195" stroke="#475569" strokeWidth="3" />

                        {/* Nodos de Conexión en Riel Superior e Inferior */}
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

                        {/* Batería / Fuente a la izquierda */}
                        <g transform="translate(25, 85)">
                            <line x1="15" y1="-50" x2="15" y2="0" stroke="#475569" strokeWidth="3" />
                            <line x1="15" y1="55" x2="15" y2="110" stroke="#475569" strokeWidth="3" />
                            <rect x="0" y="0" width="30" height="55" rx="5" fill="url(#batGradPar)" stroke="#38bdf8" strokeWidth="1.5" />
                            <rect x="9" y="-5" width="12" height="5" rx="1.5" fill="#ef4444" />
                            <text x="15" y="20" textAnchor="middle" fill="#ef4444" fontSize="13" fontWeight="900">+</text>
                            <text x="15" y="46" textAnchor="middle" fill="#0f172a" fontSize="15" fontWeight="900">−</text>
                            <text x="-15" y="32" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="900">12V</text>
                        </g>

                        {/* Interruptor en Riel Superior */}
                        <g transform="translate(100, 35)">
                            <circle cx="-15" cy="0" r="4" fill="#38bdf8" />
                            <circle cx="15" cy="0" r="4" fill="#38bdf8" />
                            {isSwitchClosed ? (
                                <line x1="-15" y1="0" x2="15" y2="0" stroke="#34d399" strokeWidth="3.5" />
                            ) : (
                                <line x1="-15" y1="0" x2="10" y2="-16" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
                            )}
                            <text x="0" y="-12" textAnchor="middle" fill={isSwitchClosed ? '#34d399' : '#ef4444'} fontSize="8" fontWeight="800">
                                {isSwitchClosed ? 'ON' : 'OFF'}
                            </text>
                        </g>

                        {/* Rama 1: Bombillo 1 (Horizontal con etiquetas centradas) */}
                        <g transform="translate(180, 35)">
                            {/* Etiqueta superior centrada */}
                            <text x="0" y="20" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="900">
                                Foco 1
                            </text>

                            {/* Cable superior */}
                            <line x1="0" y1="0" x2="0" y2="80" stroke="#475569" strokeWidth="2.5" />

                            {/* Brillo horizontal */}
                            {isBranch1Active && (
                                <ellipse cx="2" cy="95" rx="32" ry="24" fill="url(#bulbGlowParH)" opacity="0.85" />
                            )}

                            {/* Foco Horizontal */}
                            <g transform="translate(0, 95)">
                                {/* Casquillo izquierdo */}
                                <rect x="-20" y="-7" width="10" height="14" rx="2" fill="#94a3b8" />
                                {/* Cristal horizontal */}
                                <ellipse cx="4" cy="0" rx="18" ry="14" fill={isBranch1Active ? '#fef08a' : '#1e293b'} stroke="#cbd5e1" strokeWidth="1.5" />
                                {/* Filamento horizontal */}
                                <path d="M -8 0 L -2 -4 L 4 4 L 10 0" fill="none" stroke={isBranch1Active ? '#ea580c' : '#64748b'} strokeWidth="1.5" />
                            </g>

                            {/* Cable inferior hacia la cápsula */}
                            <line x1="0" y1="110" x2="0" y2="130" stroke="#475569" strokeWidth="2.5" />

                            {/* Cápsula de Voltaje / Corriente centrada */}
                            <g transform="translate(0, 140)">
                                <rect x="-38" y="-10" width="76" height="20" rx="10" fill="#090e1a" stroke="#38bdf8" strokeWidth="1.2" />
                                <text x="0" y="4" textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="900" fontFamily="monospace">
                                    {isBranch1Active ? '12V · 1.0A' : '0V · 0A'}
                                </text>
                            </g>

                            {/* Cable inferior hasta el riel */}
                            <line x1="0" y1="150" x2="0" y2="160" stroke="#475569" strokeWidth="2.5" />
                        </g>

                        {/* Rama 2: Bombillo 2 (Con opción de quemarse) */}
                        <g transform="translate(320, 35)">
                            {/* Etiqueta superior centrada */}
                            <text x="0" y="20" textAnchor="middle" fill={isBulb2Burned ? '#ef4444' : '#fbbf24'} fontSize="10" fontWeight="900">
                                {isBulb2Burned ? 'Foco 2 (QUEMADO)' : 'Foco 2'}
                            </text>

                            {/* Cable superior */}
                            <line x1="0" y1="0" x2="0" y2="80" stroke="#475569" strokeWidth="2.5" />

                            {/* Brillo horizontal */}
                            {isBranch2Active && (
                                <ellipse cx="2" cy="95" rx="32" ry="24" fill="url(#bulbGlowParH)" opacity="0.85" />
                            )}

                            {/* Foco Horizontal */}
                            <g transform="translate(0, 95)">
                                {/* Casquillo izquierdo */}
                                <rect x="-20" y="-7" width="10" height="14" rx="2" fill="#94a3b8" />
                                {/* Cristal horizontal */}
                                <ellipse cx="4" cy="0" rx="18" ry="14" fill={isBranch2Active ? '#fef08a' : '#1e293b'} stroke={isBulb2Burned ? '#ef4444' : '#cbd5e1'} strokeWidth="1.5" strokeDasharray={isBulb2Burned ? '3 2' : 'none'} />
                                {/* Filamento roto si está quemado */}
                                {isBulb2Burned ? (
                                    <g stroke="#ef4444" strokeWidth="1.5">
                                        <line x1="-6" y1="-2" x2="-1" y2="-5" />
                                        <line x1="4" y1="3" x2="8" y2="0" />
                                        <circle cx="1" cy="-1" r="2" fill="#ef4444" />
                                    </g>
                                ) : (
                                    <path d="M -8 0 L -2 -4 L 4 4 L 10 0" fill="none" stroke={isBranch2Active ? '#ea580c' : '#64748b'} strokeWidth="1.5" />
                                )}
                            </g>

                            {/* Cable inferior hacia la cápsula */}
                            <line x1="0" y1="110" x2="0" y2="130" stroke="#475569" strokeWidth="2.5" />

                            {/* Cápsula de Voltaje / Corriente centrada */}
                            <g transform="translate(0, 140)">
                                <rect x="-38" y="-10" width="76" height="20" rx="10" fill="#090e1a" stroke={isBulb2Burned ? '#ef4444' : '#38bdf8'} strokeWidth="1.2" />
                                <text x="0" y="4" textAnchor="middle" fill={isBulb2Burned ? '#ef4444' : '#38bdf8'} fontSize="8.5" fontWeight="900" fontFamily="monospace">
                                    {isBranch2Active ? '12V · 1.0A' : '0V · 0A'}
                                </text>
                            </g>

                            {/* Cable inferior hasta el riel */}
                            <line x1="0" y1="150" x2="0" y2="160" stroke="#475569" strokeWidth="2.5" />
                        </g>

                        {/* Rama 3: Bombillo 3 (Opcional) */}
                        {numBranches === 3 && (
                            <g transform="translate(460, 35)">
                                {/* Etiqueta superior centrada */}
                                <text x="0" y="20" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="900">
                                    Foco 3
                                </text>

                                {/* Cable superior */}
                                <line x1="0" y1="0" x2="0" y2="80" stroke="#475569" strokeWidth="2.5" />

                                {/* Brillo horizontal */}
                                {isBranch3Active && (
                                    <ellipse cx="2" cy="95" rx="32" ry="24" fill="url(#bulbGlowParH)" opacity="0.85" />
                                )}

                                {/* Foco Horizontal */}
                                <g transform="translate(0, 95)">
                                    {/* Casquillo izquierdo */}
                                    <rect x="-20" y="-7" width="10" height="14" rx="2" fill="#94a3b8" />
                                    {/* Cristal horizontal */}
                                    <ellipse cx="4" cy="0" rx="18" ry="14" fill={isBranch3Active ? '#fef08a' : '#1e293b'} stroke="#cbd5e1" strokeWidth="1.5" />
                                    {/* Filamento horizontal */}
                                    <path d="M -8 0 L -2 -4 L 4 4 L 10 0" fill="none" stroke={isBranch3Active ? '#ea580c' : '#64748b'} strokeWidth="1.5" />
                                </g>

                                {/* Cable inferior hacia la cápsula */}
                                <line x1="0" y1="110" x2="0" y2="130" stroke="#475569" strokeWidth="2.5" />

                                {/* Cápsula de Voltaje / Corriente centrada */}
                                <g transform="translate(0, 140)">
                                    <rect x="-38" y="-10" width="76" height="20" rx="10" fill="#090e1a" stroke="#38bdf8" strokeWidth="1.2" />
                                    <text x="0" y="4" textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="900" fontFamily="monospace">
                                        {isBranch3Active ? '12V · 1.0A' : '0V · 0A'}
                                    </text>
                                </g>

                                {/* Cable inferior hasta el riel */}
                                <line x1="0" y1="150" x2="0" y2="160" stroke="#475569" strokeWidth="2.5" />
                            </g>
                        )}

                        {/* Medidor de Corriente Total IT (Ubicado en el espacio libre entre la batería y el nodo 1) */}
                        <g transform="translate(100, 195)">
                            <rect x="-42" y="-13" width="84" height="26" rx="13" fill="#090e1a" stroke="#34d399" strokeWidth="1.5" />
                            <polygon points="-28,4 -20,0 -28,-4" fill="#34d399" />
                            <text x="-12" y="4" textAnchor="start" fill="#34d399" fontSize="10" fontWeight="900" fontFamily="monospace">
                                IT = {totalCurrent.toFixed(1)} A
                            </text>
                        </g>
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
