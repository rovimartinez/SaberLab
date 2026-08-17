import { useState, useMemo } from 'react';
import { Plus, Minus } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

// ── SVG de circuito ──────────────────────────────────────────────────────────
function SeriesSVG({ resistors, voltage }) {
    const n = resistors.length;
    const spacing = n > 0 ? Math.min(120, 500 / n) : 120;
    const startX = 20;
    const topY = 20;
    const botY = 80;

    const segments = [];
    const rects = [];

    for (let i = 0; i < n; i++) {
        const cx = startX + 40 + i * spacing;
        rects.push({ cx, label: `R${i + 1}=${resistors[i]}Ω` });
    }

    const endX = startX + 40 + n * spacing;

    return (
        <svg viewBox={`0 0 ${endX + 20} 100`} width="100%" height="120" xmlns="http://www.w3.org/2000/svg">
            {/* Top wire */}
            <line x1={startX} y1={topY} x2={endX} y2={topY} stroke="#475569" strokeWidth="2" />
            {/* Bottom wire */}
            <line x1={startX} y1={botY} x2={endX} y2={botY} stroke="#475569" strokeWidth="2" />
            {/* Left vertical */}
            <line x1={startX} y1={topY} x2={startX} y2={botY} stroke="#475569" strokeWidth="2" />
            {/* Right vertical */}
            <line x1={endX} y1={topY} x2={endX} y2={botY} stroke="#475569" strokeWidth="2" />
            {/* Battery */}
            <rect x={startX - 5} y={topY + 15} width="10" height="30" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
            <text x={startX} y={topY + 10} textAnchor="middle" fill="#94a3b8" fontSize="9">{voltage}V</text>
            {/* Resistors in series */}
            {rects.map((r, i) => (
                <g key={i}>
                    <rect x={r.cx - 18} y={topY - 8} width="36" height="16" rx="4" fill="#d4b483" stroke="#a0947a" strokeWidth="1" />
                    <text x={r.cx} y={topY + 24} textAnchor="middle" fill="#94a3b8" fontSize="7">{r.label}</text>
                </g>
            ))}
        </svg>
    );
}

function ParallelSVG({ resistors, voltage }) {
    const n = resistors.length;
    const spacing = 22;
    const h = 20 + n * spacing;
    const leftX = 20;
    const rightX = 160;

    return (
        <svg viewBox={`0 0 200 ${h + 20}`} width="100%" height="120" xmlns="http://www.w3.org/2000/svg">
            {/* Vertical buses */}
            <line x1={leftX} y1="10" x2={leftX} y2={h} stroke="#475569" strokeWidth="2" />
            <line x1={rightX} y1="10" x2={rightX} y2={h} stroke="#475569" strokeWidth="2" />
            {/* Top / Bottom connectors */}
            <line x1={leftX} y1="10" x2={rightX} y2="10" stroke="#475569" strokeWidth="2" />
            <line x1={leftX} y1={h} x2={rightX} y2={h} stroke="#475569" strokeWidth="2" />
            {/* Battery */}
            <text x={leftX - 2} y="8" textAnchor="middle" fill="#94a3b8" fontSize="8">{voltage}V</text>
            {/* Resistors in parallel */}
            {resistors.map((r, i) => {
                const y = 20 + i * spacing;
                return (
                    <g key={i}>
                        <line x1={leftX} y1={y} x2={50} y2={y} stroke="#475569" strokeWidth="1.5" />
                        <rect x="50" y={y - 7} width="60" height="14" rx="4" fill="#d4b483" stroke="#a0947a" strokeWidth="1" />
                        <text x="80" y={y + 3} textAnchor="middle" fill="#1e293b" fontSize="7" fontWeight="bold">R{i + 1}={r}Ω</text>
                        <line x1="110" y1={y} x2={rightX} y2={y} stroke="#475569" strokeWidth="1.5" />
                    </g>
                );
            })}
        </svg>
    );
}

// ── Lógica de cálculo ─────────────────────────────────────────────────────────
function calcResults(type, voltage, resistors) {
    const R = resistors.filter(r => r > 0);
    if (R.length === 0) return null;

    let Req = 0;
    if (type === 'series') {
        Req = R.reduce((acc, r) => acc + r, 0);
    } else if (type === 'parallel') {
        Req = 1 / R.reduce((acc, r) => acc + 1 / r, 0);
    } else {
        // Mixto: primera mitad en serie, segunda en paralelo
        const half = Math.ceil(R.length / 2);
        const rSeries = R.slice(0, half).reduce((a, r) => a + r, 0);
        const rParallel = 1 / R.slice(half).reduce((a, r) => a + 1 / r, 0) || 0;
        Req = rSeries + rParallel;
    }

    const I = voltage / Req;
    const P = voltage * I;
    return { Req: Req.toFixed(2), I: I.toFixed(4), P: P.toFixed(2) };
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function CircuitSimulator() {
    const [circuitType, setCircuitType] = useState('series');
    const [voltage, setVoltage] = useState(12);
    const [resistors, setResistors] = useState([100, 200]);

    const results = useMemo(() => calcResults(circuitType, voltage, resistors), [circuitType, voltage, resistors]);

    const addR = () => resistors.length < 6 && setResistors(prev => [...prev, 100]);
    const removeR = (i) => resistors.length > 1 && setResistors(prev => prev.filter((_, idx) => idx !== i));
    const updateR = (i, val) => setResistors(prev => prev.map((r, idx) => idx === i ? (+val || 0) : r));

    const typeLabels = { series: 'Serie', parallel: 'Paralelo', mixed: 'Mixto' };

    return (
        <div className="sim-card">
            <div className="sim-card-header">
                <h3>🔌 Simulador de Circuitos</h3>
                <p>Calcula resistencia equivalente, corriente y potencia para circuitos en serie, paralelo y mixtos.</p>
            </div>
            <div className="sim-card-body">
                {/* Tabs */}
                <div className="circuit-sim-tabs">
                    {Object.entries(typeLabels).map(([key, label]) => (
                        <button key={key} className={`circuit-sim-tab ${circuitType === key ? 'active' : ''}`} onClick={() => setCircuitType(key)}>
                            {label}
                        </button>
                    ))}
                </div>

                <div className="sim-grid-2">
                    {/* SVG */}
                    <div className="sim-visual">
                        {circuitType === 'series' && <SeriesSVG resistors={resistors} voltage={voltage} />}
                        {circuitType === 'parallel' && <ParallelSVG resistors={resistors} voltage={voltage} />}
                        {circuitType === 'mixed' && (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
                                Primera mitad en serie<br />+ segunda mitad en paralelo
                            </div>
                        )}
                    </div>

                    {/* Controles */}
                    <div className="sim-controls">
                        {/* Voltaje */}
                        <div className="sim-control-group">
                            <div className="sim-label">
                                <span className="sim-label-text">Voltaje (V)</span>
                                <span className="sim-label-value">{voltage} V</span>
                            </div>
                            <input type="range" className="sim-slider" min="1" max="48" step="1" value={voltage} onChange={e => setVoltage(+e.target.value)} />
                        </div>

                        {/* Resistencias */}
                        <div>
                            <div className="sim-label" style={{ marginBottom: '0.5rem' }}>
                                <span className="sim-label-text">Resistencias (Ω)</span>
                                <div style={{ display: 'flex', gap: '0.35rem' }}>
                                    <button className="circuit-add-btn" onClick={addR} disabled={resistors.length >= 6}>
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="circuit-resistors">
                                {resistors.map((r, i) => (
                                    <div key={i} className="circuit-resistor-row">
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', width: '24px' }}>R{i + 1}</span>
                                        <input
                                            type="number" className="circuit-resistor-input"
                                            min="1" max="10000" value={r}
                                            onChange={e => updateR(i, e.target.value)}
                                        />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ω</span>
                                        <button className="circuit-remove-btn" onClick={() => removeR(i)} disabled={resistors.length <= 1}>
                                            <Minus size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resultados */}
                {results && (
                    <div className="circuit-results">
                        <div className="circuit-result-item">
                            <span className="circuit-result-label">R Equivalente</span>
                            <span className="circuit-result-value">{results.Req} Ω</span>
                        </div>
                        <div className="circuit-result-item">
                            <span className="circuit-result-label">Corriente Total</span>
                            <span className="circuit-result-value">{results.I} A</span>
                        </div>
                        <div className="circuit-result-item">
                            <span className="circuit-result-label">Potencia</span>
                            <span className="circuit-result-value">{results.P} W</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
