import { useState, useEffect } from 'react';
import { Play, RotateCcw, Zap, Sliders, Activity, BarChart2 } from 'lucide-react';

export default function CapacitorChargeSimulator() {
    const [voltage, setVoltage] = useState(12); // V
    const [resistance, setResistance] = useState(1000); // Ohms (1k)
    const [capacitance, setCapacitance] = useState(100); // uF
    const [switchPos, setSwitchPos] = useState('off'); // 'charge', 'discharge', 'off'
    const [time, setTime] = useState(0); // ms
    const [isRunning, setIsRunning] = useState(false);
    const [history, setHistory] = useState([]); // [{t, v, i}]

    // Valores calculados
    const C_farads = capacitance * 1e-6;
    const tau_ms = resistance * C_farads * 1000; // Constante de tiempo en ms
    const maxT = tau_ms * 5;

    const currentVoltage = switchPos === 'charge'
        ? voltage * (1 - Math.exp(-time / tau_ms))
        : switchPos === 'discharge'
            ? voltage * Math.exp(-time / tau_ms)
            : 0;

    const current_mA = switchPos === 'charge'
        ? ((voltage - currentVoltage) / resistance) * 1000
        : switchPos === 'discharge'
            ? (currentVoltage / resistance) * 1000
            : 0;

    const charge_uC = currentVoltage * capacitance;
    const energy_mJ = 0.5 * C_farads * Math.pow(currentVoltage, 2) * 1000;

    // Timer loop
    useEffect(() => {
        let interval = null;
        if (isRunning && switchPos !== 'off') {
            interval = setInterval(() => {
                setTime(prev => {
                    const step = Math.max(10, tau_ms / 60);
                    const nextTime = prev + step;
                    if (nextTime >= maxT) {
                        setIsRunning(false);
                        return maxT;
                    }
                    return nextTime;
                });
            }, 50);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isRunning, switchPos, tau_ms, maxT]);

    // Registro de historial para la gráfica en tiempo real
    useEffect(() => {
        if (switchPos !== 'off') {
            setHistory(prev => {
                const newPoint = { t: time, v: currentVoltage, i: current_mA };
                return [...prev, newPoint];
            });
        }
    }, [time, switchPos, currentVoltage, current_mA]);

    const handleSwitch = (pos) => {
        setSwitchPos(pos);
        setTime(0);
        setHistory([{ t: 0, v: pos === 'charge' ? 0 : voltage, i: (voltage / resistance) * 1000 }]);
        setIsRunning(true);
    };

    const handleReset = () => {
        setSwitchPos('off');
        setTime(0);
        setHistory([]);
        setIsRunning(false);
    };

    // Densidad de carga acumulada (0 a 8 cargas dibujadas)
    const chargeDensity = Math.round((currentVoltage / (voltage || 1)) * 8);

    // Renderizado de curva SVG en Osciloscopio
    const plotWidth = 320;
    const plotHeight = 110;
    const padding = 20;

    const pointsV = history.map(pt => {
        const x = padding + (pt.t / (maxT || 1)) * (plotWidth - padding * 2);
        const y = (plotHeight - padding) - (pt.v / (voltage || 1)) * (plotHeight - padding * 2);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div style={{
            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '20px',
            padding: '1.5rem',
            color: '#f8fafc',
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
            maxWidth: '850px',
            margin: '0 auto'
        }}>
            {/* Header del Simulador */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '8px', borderRadius: '12px', border: '1px solid #38bdf8' }}>
                        <Zap size={22} color="#38bdf8" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>
                            Simulador Interactivo: Circuito RC y Osciloscopio Exponencial
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            Carga, descarga, acumulación de cargas y curva temporal en tiempo real
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => handleSwitch('charge')}
                        style={{
                            padding: '6px 14px', borderRadius: '8px', border: 'none', fontWeight: 800, cursor: 'pointer',
                            background: switchPos === 'charge' ? '#10b981' : 'rgba(16, 185, 129, 0.2)',
                            color: switchPos === 'charge' ? '#fff' : '#10b981',
                            transition: 'all 0.2s'
                        }}
                    >
                        ⚡ Cargar
                    </button>
                    <button
                        onClick={() => handleSwitch('discharge')}
                        style={{
                            padding: '6px 14px', borderRadius: '8px', border: 'none', fontWeight: 800, cursor: 'pointer',
                            background: switchPos === 'discharge' ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)',
                            color: switchPos === 'discharge' ? '#fff' : '#f59e0b',
                            transition: 'all 0.2s'
                        }}
                    >
                        🔄 Descargar
                    </button>
                    <button
                        onClick={handleReset}
                        style={{
                            padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
                            background: 'transparent', color: '#cbd5e1', cursor: 'pointer'
                        }}
                        title="Reiniciar"
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>
            </div>

            {/* Layout Principal: Diagrama Esquematizado SVG y Osciloscopio */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
                
                {/* Canvas SVG del Circuito */}
                <div style={{ background: '#0b1329', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1rem', position: 'relative' }}>
                    <svg viewBox="0 0 400 230" style={{ width: '100%', height: 'auto', display: 'block' }}>
                        {/* Rieles del circuito (Azul institucional #38bdf8) */}
                        <path d="M 50 115 L 50 40 L 160 40" stroke="#38bdf8" strokeWidth="2.5" fill="none" />
                        <path d="M 220 40 L 350 40 L 350 115" stroke="#38bdf8" strokeWidth="2.5" fill="none" />
                        <path d="M 350 165 L 350 200 L 50 200 L 50 165" stroke="#38bdf8" strokeWidth="2.5" fill="none" />

                        {/* Fuente de Voltaje Batería V_in */}
                        <g transform="translate(50, 140)">
                            <line x1="0" y1="-20" x2="0" y2="20" stroke="#38bdf8" strokeWidth="2.5" />
                            <line x1="-15" y1="-8" x2="15" y2="-8" stroke="#ef4444" strokeWidth="3" />
                            <line x1="-8" y1="8" x2="8" y2="8" stroke="#38bdf8" strokeWidth="3" />
                            <text x="-25" y="-5" fill="#ef4444" fontSize="12" fontWeight="bold">+</text>
                            <text x="-25" y="12" fill="#38bdf8" fontSize="12" fontWeight="bold">-</text>
                            <text x="-42" y="4" fill="#f8fafc" fontSize="11" fontWeight="bold">{voltage}V</text>
                        </g>

                        {/* Resistencia R */}
                        <g transform="translate(190, 40)">
                            <rect x="-25" y="-12" width="50" height="24" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" rx="4" />
                            <text x="0" y="4" fill="#f8fafc" fontSize="11" textAnchor="middle" fontWeight="bold">{resistance}Ω</text>
                        </g>

                        {/* Capacitor (Placas paralelas con dieléctrico) */}
                        <g transform="translate(350, 140)">
                            {/* Placa Superior */}
                            <line x1="-24" y1="-10" x2="24" y2="-10" stroke="#38bdf8" strokeWidth="4" />
                            {/* Placa Inferior */}
                            <line x1="-24" y1="10" x2="24" y2="10" stroke="#38bdf8" strokeWidth="4" />
                            {/* Dieléctrico */}
                            <rect x="-22" y="-8" width="44" height="16" fill="rgba(56, 189, 248, 0.15)" stroke="none" />
                            
                            {/* Campo Eléctrico E (Líneas flechadas si está cargado) */}
                            {currentVoltage > 0.5 && (
                                <g opacity={Math.min(1, currentVoltage / (voltage || 1))}>
                                    <line x1="-12" y1="-6" x2="-12" y2="6" stroke="#fde047" strokeWidth="1.5" strokeDasharray="2,2" />
                                    <line x1="0" y1="-6" x2="0" y2="6" stroke="#fde047" strokeWidth="1.5" strokeDasharray="2,2" />
                                    <line x1="12" y1="-6" x2="12" y2="6" stroke="#fde047" strokeWidth="1.5" strokeDasharray="2,2" />
                                </g>
                            )}

                            {/* Cargas en Placas */}
                            {Array.from({ length: chargeDensity }).map((_, i) => {
                                const posX = -18 + i * 5;
                                return (
                                    <g key={i}>
                                        <text x={posX} y="-14" fill="#ef4444" fontSize="9" fontWeight="bold">+</text>
                                        <text x={posX} y="22" fill="#38bdf8" fontSize="9" fontWeight="bold">-</text>
                                    </g>
                                );
                            })}

                            <text x="35" y="4" fill="#38bdf8" fontSize="11" fontWeight="bold">{capacitance}µF</text>
                        </g>

                        {/* Switch Interactivo */}
                        <g transform="translate(140, 40)">
                            <circle cx="0" cy="0" r="4" fill="#38bdf8" />
                            <line
                                x1="0" y1="0"
                                x2="20" y2={switchPos === 'off' ? -15 : 0}
                                stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round"
                            />
                            <circle cx="24" cy="0" r="4" fill="#38bdf8" />
                        </g>

                        {/* Medidor Digital Flotante */}
                        <rect x="250" y="65" width="130" height="38" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" strokeWidth="1" rx="8" />
                        <text x="315" y="80" fill="#34d399" fontSize="11" textAnchor="middle" fontWeight="bold">
                            V_C: {currentVoltage.toFixed(2)} V
                        </text>
                        <text x="315" y="95" fill="#38bdf8" fontSize="10" textAnchor="middle">
                            I: {current_mA.toFixed(2)} mA
                        </text>
                    </svg>

                    <div style={{
                        position: 'absolute', bottom: '10px', left: '12px',
                        background: 'rgba(15, 23, 42, 0.9)', padding: '4px 10px', borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.72rem'
                    }}>
                        Estado: <strong style={{ color: switchPos === 'charge' ? '#10b981' : switchPos === 'discharge' ? '#f59e0b' : '#94a3b8' }}>
                            {switchPos === 'charge' ? '⚡ Cargando' : switchPos === 'discharge' ? '🔄 Descargando' : '⏸️ Reposo'}
                        </strong>
                    </div>
                </div>

                {/* Pantalla de Osciloscopio Digital V(t) */}
                <div style={{ background: '#070d1e', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.82rem', fontWeight: 800 }}>
                            <BarChart2 size={16} /> Curva de Voltaje en el Tiempo V_C(t)
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            t: {time.toFixed(0)} ms / {maxT.toFixed(0)} ms
                        </span>
                    </div>

                    <div style={{ background: '#020617', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', padding: '6px' }}>
                        <svg viewBox={`0 0 ${plotWidth} ${plotHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
                            {/* Cuadrícula de Osciloscopio */}
                            <line x1={padding} y1={padding} x2={padding} y2={plotHeight - padding} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                            <line x1={padding} y1={plotHeight - padding} x2={plotWidth - padding} y2={plotHeight - padding} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                            
                            {/* Líneas de guía de 1τ y 5τ */}
                            <line x1={padding + (plotWidth - padding * 2) * 0.2} y1={padding} x2={padding + (plotWidth - padding * 2) * 0.2} y2={plotHeight - padding} stroke="rgba(56, 189, 248, 0.25)" strokeDasharray="3,3" />
                            <text x={padding + (plotWidth - padding * 2) * 0.2} y={plotHeight - 6} fill="#38bdf8" fontSize="8" textAnchor="middle">1τ (63%)</text>
                            
                            <line x1={plotWidth - padding} y1={padding} x2={plotWidth - padding} y2={plotHeight - padding} stroke="rgba(245, 158, 11, 0.25)" strokeDasharray="3,3" />
                            <text x={plotWidth - padding} y={plotHeight - 6} fill="#f59e0b" fontSize="8" textAnchor="end">5τ (99%)</text>

                            {/* Nivel máximo Vin */}
                            <line x1={padding} y1={padding} x2={plotWidth - padding} y2={padding} stroke="rgba(239, 68, 68, 0.3)" strokeDasharray="2,2" />
                            <text x={padding + 4} y={padding + 9} fill="#ef4444" fontSize="8">Vin = {voltage}V</text>

                            {/* Trazado de la curva */}
                            {pointsV && (
                                <polyline
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="2.5"
                                    points={pointsV}
                                />
                            )}
                        </svg>
                    </div>

                    {/* Telemetría Compacta */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px', marginTop: '0.75rem', textAlign: 'center' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '6px' }}>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>τ (RC)</span>
                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8' }}>{tau_ms.toFixed(0)} ms</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '6px' }}>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>5τ (Lleno)</span>
                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f59e0b' }}>{(tau_ms * 5).toFixed(0)} ms</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '6px' }}>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Carga Q</span>
                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#34d399' }}>{charge_uC.toFixed(0)} µC</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '6px' }}>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Energía E</span>
                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fde047' }}>{energy_mJ.toFixed(2)} mJ</div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Controles de Parámetros */}
            <div style={{ marginTop: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '2px' }}>
                            <span>Voltaje Fuente (Vin):</span>
                            <strong style={{ color: '#38bdf8' }}>{voltage} V</strong>
                        </div>
                        <input
                            type="range" min="1" max="24" value={voltage}
                            onChange={e => setVoltage(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                        />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '2px' }}>
                            <span>Resistencia (R):</span>
                            <strong style={{ color: '#38bdf8' }}>{resistance} Ω</strong>
                        </div>
                        <input
                            type="range" min="100" max="5000" step="100" value={resistance}
                            onChange={e => setResistance(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                        />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '2px' }}>
                            <span>Capacitancia (C):</span>
                            <strong style={{ color: '#38bdf8' }}>{capacitance} µF</strong>
                        </div>
                        <input
                            type="range" min="10" max="1000" step="10" value={capacitance}
                            onChange={e => setCapacitance(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
