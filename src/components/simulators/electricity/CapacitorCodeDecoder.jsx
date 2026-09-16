import { useState } from 'react';
import { Binary, Search, CheckCircle2, Cpu } from 'lucide-react';

export default function CapacitorCodeDecoder() {
    const [code, setCode] = useState('104');
    const [toleranceLetter, setToleranceLetter] = useState('K');

    const cleanDigits = code.replace(/\D/g, '').slice(0, 3);
    const d1 = cleanDigits[0] ? parseInt(cleanDigits[0], 10) : 0;
    const d2 = cleanDigits[1] ? parseInt(cleanDigits[1], 10) : 0;
    const multiplier = cleanDigits[2] ? parseInt(cleanDigits[2], 10) : 0;

    const baseVal = d1 * 10 + d2;
    const picofarads = baseVal * Math.pow(10, multiplier);
    const nanofarads = picofarads / 1000;
    const microfarads = picofarads / 1000000;

    const tolerances = {
        'J': '±5% (Precisión)',
        'K': '±10% (Estándar Cerámico)',
        'M': '±20% (Uso General)'
    };

    const popularCodes = [
        { code: '102', label: '1 nF (0.001 µF)', use: 'Filtro RF' },
        { code: '103', label: '10 nF (0.01 µF)', use: 'Bypass' },
        { code: '104', label: '100 nF (0.1 µF)', use: 'Desacople Universal' },
        { code: '473', label: '47 nF (0.047 µF)', use: 'Temporización' },
        { code: '224', label: '220 nF (0.22 µF)', use: 'Audio' }
    ];

    return (
        <div style={{
            background: 'linear-gradient(145deg, #0b1329 0%, #1e293b 100%)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '20px',
            padding: '1.25rem',
            color: '#f8fafc',
            maxWidth: '850px',
            margin: '1.5rem auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '12px', border: '1px solid #f59e0b' }}>
                        <Binary size={20} color="#f59e0b" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f59e0b' }}>
                            Decodificador Interactivo de Capacitores Cerámicos (Código EIA 3 Dígitos)
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            Convierte códigos estándar impresos en capacitores tipo lenteja a pF, nF y µF
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
                {/* Visualizador de Capacitor Cerámico */}
                <div style={{ background: '#070d1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1rem', textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 0.75rem' }}>
                        {/* Terminales metálicas */}
                        <div style={{ position: 'absolute', bottom: '-20px', left: '42px', width: '4px', height: '40px', background: '#94a3b8', borderRadius: '2px' }}></div>
                        <div style={{ position: 'absolute', bottom: '-20px', right: '42px', width: '4px', height: '40px', background: '#94a3b8', borderRadius: '2px' }}></div>
                        {/* Cuerpo cerámico en lenteja */}
                        <div style={{
                            width: '100%', height: '100%', borderRadius: '50%',
                            background: 'radial-gradient(circle at 35% 35%, #f97316 0%, #c2410c 70%, #7c2d12 100%)',
                            boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.4), 0 8px 20px rgba(0,0,0,0.5)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            border: '2px solid rgba(255,255,255,0.2)'
                        }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', letterSpacing: '1px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                {cleanDigits || '---'}{toleranceLetter}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: '#fed7aa', fontWeight: 700, marginTop: '2px' }}>
                                50V
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {popularCodes.map(item => (
                            <button
                                key={item.code}
                                onClick={() => setCode(item.code)}
                                style={{
                                    padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)',
                                    background: code === item.code ? '#f97316' : 'rgba(255,255,255,0.05)',
                                    color: code === item.code ? '#fff' : '#cbd5e1',
                                    fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer'
                                }}
                            >
                                {item.code} ({item.label.split(' ')[0]} {item.label.split(' ')[1]})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Formulario de Entrada y Conversor de Unidades */}
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                                Código EIA (3 Dígitos):
                            </label>
                            <input
                                type="text"
                                maxLength={3}
                                value={code}
                                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="104"
                                style={{
                                    width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f97316',
                                    background: '#070d1e', color: '#fff', fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                                Tolerancia:
                            </label>
                            <select
                                value={toleranceLetter}
                                onChange={e => setToleranceLetter(e.target.value)}
                                style={{
                                    width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)',
                                    background: '#070d1e', color: '#fff', fontSize: '0.9rem', fontWeight: 700
                                }}
                            >
                                <option value="J">J (±5%)</option>
                                <option value="K">K (±10%)</option>
                                <option value="M">M (±20%)</option>
                            </select>
                        </div>
                    </div>

                    {/* Desglose de Cálculo Paso a Paso */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.85rem', marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 800, marginBottom: '4px' }}>
                            📐 Fórmula de Decodificación:
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#cbd5e1' }}>
                            <span style={{ color: '#f97316', fontWeight: 800 }}>{d1}{d2}</span> × 10<sup>{multiplier}</sup> pF = <strong>{picofarads.toLocaleString()} pF</strong>
                        </div>
                    </div>

                    {/* Tabla de Equivalencias de Capacidad */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', textAlign: 'center' }}>
                        <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', padding: '6px 4px' }}>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Picofaradios (pF)</span>
                            <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.88rem' }}>{picofarads >= 1000 ? `${picofarads.toLocaleString()} pF` : `${picofarads} pF`}</div>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '6px 4px' }}>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Nanofaradios (nF)</span>
                            <div style={{ color: '#34d399', fontWeight: 800, fontSize: '0.88rem' }}>{nanofarads} nF</div>
                        </div>
                        <div style={{ background: 'rgba(253, 224, 71, 0.08)', border: '1px solid rgba(253, 224, 71, 0.25)', borderRadius: '8px', padding: '6px 4px' }}>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Microfaradios (µF)</span>
                            <div style={{ color: '#fde047', fontWeight: 800, fontSize: '0.88rem' }}>{microfarads} µF</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
