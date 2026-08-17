import { useState } from 'react';
import { Calculator, Zap, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

export default function ParallelCalculationVisualizer() {
    const [voltage, setVoltage] = useState(12);
    const [r1, setR1] = useState(20);
    const [r2, setR2] = useState(30);
    const [hasR3, setHasR3] = useState(false);
    const [r3, setR3] = useState(60);

    // Cálculos
    const invReq = (1 / r1) + (1 / r2) + (hasR3 ? (1 / r3) : 0);
    const req = invReq > 0 ? (1 / invReq) : 0;
    const i1 = voltage / r1;
    const i2 = voltage / r2;
    const i3 = hasR3 ? (voltage / r3) : 0;
    const iTotal = i1 + i2 + i3;
    const pTotal = voltage * iTotal;

    return (
        <div className="sim-card" style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div className="sim-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#fbbf24' }}>
                        <Calculator size={20} color="#fbbf24" />
                        <span>Calculadora Visual Paso a Paso: Circuito en Paralelo</span>
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                        Modifica los valores de las resistencias y voltaje para observar cómo se calculan la Req, las corrientes de cada rama y la potencia en tiempo real.
                    </p>
                </div>

                <button
                    className="sim-btn sim-btn-secondary"
                    onClick={() => {
                        setVoltage(12);
                        setR1(20);
                        setR2(30);
                        setHasR3(false);
                        setR3(60);
                    }}
                    style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    <RotateCcw size={13} />
                    <span>Valores Ejemplo</span>
                </button>
            </div>

            <div className="sim-card-body" style={{ padding: '1.25rem' }}>
                {/* Controles interactivos */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '1.25rem' }}>
                    <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', display: 'block', marginBottom: '4px' }}>
                            Voltaje (V): {voltage} V
                        </label>
                        <input type="range" min="3" max="36" step="1" value={voltage} onChange={e => setVoltage(+e.target.value)} style={{ width: '100%', accentColor: '#38bdf8' }} />
                    </div>

                    <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c084fc', display: 'block', marginBottom: '4px' }}>
                            Resistencia R₁: {r1} Ω
                        </label>
                        <input type="range" min="5" max="100" step="5" value={r1} onChange={e => setR1(+e.target.value)} style={{ width: '100%', accentColor: '#c084fc' }} />
                    </div>

                    <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c084fc', display: 'block', marginBottom: '4px' }}>
                            Resistencia R₂: {r2} Ω
                        </label>
                        <input type="range" min="5" max="100" step="5" value={r2} onChange={e => setR2(+e.target.value)} style={{ width: '100%', accentColor: '#c084fc' }} />
                    </div>

                    <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <button
                            className={`sim-btn ${hasR3 ? 'sim-btn-primary' : 'sim-btn-secondary'}`}
                            onClick={() => setHasR3(!hasR3)}
                            style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 800 }}
                        >
                            {hasR3 ? '✓ Rama 3 Activada (60Ω)' : '+ Añadir Rama 3'}
                        </button>
                    </div>
                </div>

                {/* Pasos de Resolución Matemática */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                    {/* Paso 1: Resistencia Equivalente */}
                    <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', padding: '12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24', marginBottom: '4px' }}>
                            PASO 1: Resistencia Equivalente (Req)
                        </div>
                        {!hasR3 ? (
                            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                                <div>Req = (R₁ × R₂) / (R₁ + R₂)</div>
                                <div style={{ color: '#f8fafc', fontWeight: 800 }}>Req = ({r1} × {r2}) / ({r1} + {r2})</div>
                                <div style={{ color: '#fbbf24', fontSize: '1.05rem', fontWeight: 900, marginTop: '4px' }}>
                                    Req = {req.toFixed(2)} Ω
                                </div>
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                                <div>1/Req = 1/{r1} + 1/{r2} + 1/{r3}</div>
                                <div style={{ color: '#fbbf24', fontSize: '1.05rem', fontWeight: 900, marginTop: '4px' }}>
                                    Req = {req.toFixed(2)} Ω
                                </div>
                            </div>
                        )}
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                            ✓ Menor que la más pequeña ({Math.min(r1, r2, hasR3 ? r3 : 999)} Ω)
                        </div>
                    </div>

                    {/* Paso 2: Corrientes de Rama */}
                    <div style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '12px', padding: '12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
                            PASO 2: Corrientes de Rama (I = V / R)
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                            <div>I₁ = {voltage}V / {r1}Ω = <strong style={{ color: '#38bdf8' }}>{i1.toFixed(2)} A</strong></div>
                            <div>I₂ = {voltage}V / {r2}Ω = <strong style={{ color: '#38bdf8' }}>{i2.toFixed(2)} A</strong></div>
                            {hasR3 && (
                                <div>I₃ = {voltage}V / {r3}Ω = <strong style={{ color: '#38bdf8' }}>{i3.toFixed(2)} A</strong></div>
                            )}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                            Voltaje común de {voltage}V en cada rama.
                        </div>
                    </div>

                    {/* Paso 3: Corriente Total (LCK) */}
                    <div style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: '12px', padding: '12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', marginBottom: '4px' }}>
                            PASO 3: Corriente Total IT (LCK)
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                            <div>IT = I₁ + I₂ {hasR3 ? '+ I₃' : ''}</div>
                            <div style={{ color: '#f8fafc', fontWeight: 800 }}>IT = {i1.toFixed(2)} + {i2.toFixed(2)} {hasR3 ? `+ ${i3.toFixed(2)}` : ''}</div>
                            <div style={{ color: '#34d399', fontSize: '1.05rem', fontWeight: 900, marginTop: '4px' }}>
                                IT = {iTotal.toFixed(2)} A
                            </div>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                            Potencia Total: {pTotal.toFixed(2)} W
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
