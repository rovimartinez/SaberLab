import { useState } from 'react';
import '../../../styles/ElectricitySimulators.css';

export default function HydraulicAnalogy() {
    const [voltage, setVoltage] = useState(6); // Voltaje: 1 V a 10 V
    const [resistance, setResistance] = useState(2); // Resistencia: 1 Ω a 10 Ω

    // Corriente calculada según Ley de Ohm: I = V / R
    const current = (voltage / resistance).toFixed(2);
    const currentNum = parseFloat(current);

    // ── CANTIDAD DE BOLITAS ALINEADA 1 A 1 CON LOS AMPERIOS (1 a 10 máx) ──
    // Velocidad constante para evitar confusión
    const CONST_SPEED = 2.4;
    // Cada amperio entero se corresponde con exactamente 1 bolita (mínimo 1, máximo 10)
    const particleCount = Math.max(1, Math.min(10, Math.round(currentNum)));

    // Altura del agua en el tanque (proporcional al voltaje: 1 a 10 V -> hasta 55px)
    const waterHeight = Math.round((voltage / 10) * 55);
    const waterY = 76 - waterHeight;

    // Constricción del tubo por la válvula (1 Ω = muy abierto, 10 Ω = muy cerrado)
    const valveGap = Math.max(3, Math.round(16 - (resistance - 1) * 1.4));
    const valveTopY = 84 - valveGap / 2;
    const valveBotY = 84 + valveGap / 2;

    // Trayectoria continua del agua desde el fondo del tanque hasta la salida
    const waterPath = "M 32 84 L 168 84 L 168 110";

    return (
        <div className="sim-card">
            <div className="sim-card-header">
                <h3>💧 Simulador de la Analogía Hidráulica</h3>
                <p>Comprende cómo interactúan el Voltaje (presión), la Resistencia (válvula) y la Corriente (caudal)</p>
            </div>

            <div className="sim-card-body">
                <div className="sim-grid-2">
                    {/* SVG Hidráulico Conectado */}
                    <div className="sim-visual" style={{ minHeight: '210px', flexDirection: 'column' }}>
                        <svg viewBox="0 0 210 120" width="100%" height="180" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#38bdf8" />
                                    <stop offset="100%" stopColor="#0284c7" />
                                </linearGradient>
                                <linearGradient id="pipeWaterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#0284c7" />
                                    <stop offset="100%" stopColor="#38bdf8" />
                                </linearGradient>
                                <filter id="waterGlow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="2" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>

                            {/* ── AGUA DENTRO DE LA TUBERÍA (Conexión Continua) ── */}
                            <path
                                d="M 18 76 L 174 76 L 174 105 L 162 105 L 162 92 L 18 92 Z"
                                fill="url(#pipeWaterGrad)"
                                opacity="0.4"
                            />

                            {/* ── AGUA DENTRO DEL TANQUE (Nivel Variable 1V - 10V) ── */}
                            <rect
                                x="19"
                                y={waterY}
                                width="29"
                                height={91 - waterY}
                                fill="url(#waterGrad)"
                                opacity="0.85"
                            />

                            {/* ── ESTRUCTURA METÁLICA DEL TANQUE Y TUBERÍA ── */}
                            {/* Pared izquierda y fondo continuo (Tanque -> Tubo) */}
                            <path
                                d="M 18 20 L 18 92 L 162 92 L 162 110"
                                fill="none"
                                stroke="#475569"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Pared derecha del tanque y parte superior del tubo */}
                            <path
                                d="M 48 20 L 48 76 L 174 76 L 174 110"
                                fill="none"
                                stroke="#475569"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Boca superior del tanque */}
                            <line x1="15" y1="20" x2="51" y2="20" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />

                            {/* Etiqueta de Presión / Voltaje */}
                            <text x="33" y="14" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold">
                                {voltage} V (Presión)
                            </text>

                            {/* ── VÁLVULA / ESTRANGULAMIENTO (Resistencia 1Ω - 10Ω) ── */}
                            <g id="valve">
                                {/* Émbolo superior */}
                                <rect x="110" y="68" width="10" height={Math.max(2, valveTopY - 68)} fill="#f59e0b" stroke="#d97706" strokeWidth="1" rx="1" />
                                {/* Émbolo inferior */}
                                <rect x="110" y={valveBotY} width="10" height={Math.max(2, 92 - valveBotY)} fill="#f59e0b" stroke="#d97706" strokeWidth="1" rx="1" />
                                {/* Vástago y Manija */}
                                <line x1="115" y1="56" x2="115" y2="68" stroke="#f59e0b" strokeWidth="2.5" />
                                <ellipse cx="115" cy="56" rx="8" ry="3.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                                <text x="115" y="47" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="bold">
                                    {resistance} Ω (Válvula)
                                </text>
                            </g>

                            {/* ── GOTAS DE AGUA EN FLUJO (Velocidad Constante, 1 a 10 Bolitas = Amperios) ── */}
                            {currentNum > 0 && Array.from({ length: particleCount }).map((_, i) => (
                                <circle key={i} r="3" fill="#38bdf8" filter="url(#waterGlow)">
                                    <animateMotion
                                        dur={`${CONST_SPEED}s`}
                                        repeatCount="indefinite"
                                        begin={`-${(i / particleCount) * CONST_SPEED}s`}
                                        path={waterPath}
                                    />
                                </circle>
                            ))}

                            {/* ── CAUDAL DE SALIDA (Amperios) ── */}
                            <text x="168" y="118" textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="bold">
                                {current} A
                            </text>
                        </svg>
                    </div>

                    {/* Controles interactivos (Rangos 1 a 10) */}
                    <div className="sim-controls">
                        {/* Control 1: Altura del tanque (Voltaje: 1 V a 10 V) */}
                        <div className="sim-control-group">
                            <div className="sim-label">
                                <span className="sim-label-text">💧 Altura del Tanque (Voltaje)</span>
                                <span className="sim-label-value" style={{ color: '#38bdf8' }}>{voltage} V</span>
                            </div>
                            <input
                                type="range" className="sim-slider"
                                min="1" max="10" step="1"
                                value={voltage}
                                onChange={e => setVoltage(+e.target.value)}
                            />
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                Rango: 1 V a 10 V (determina la presión del agua).
                            </span>
                        </div>

                        {/* Control 2: Válvula (Resistencia: 1 Ω a 10 Ω) */}
                        <div className="sim-control-group">
                            <div className="sim-label">
                                <span className="sim-label-text">🚰 Válvula / Oposición (Resistencia)</span>
                                <span className="sim-label-value" style={{ color: '#fbbf24' }}>{resistance} Ω</span>
                            </div>
                            <input
                                type="range" className="sim-slider"
                                min="1" max="10" step="1"
                                value={resistance}
                                onChange={e => setResistance(+e.target.value)}
                            />
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                Rango: 1 Ω (muy abierta) a 10 Ω (muy cerrada).
                            </span>
                        </div>

                        {/* Resultado de Caudal (Corriente) */}
                        <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CAUDAL RESULTANTE (CORRIENTE)</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>I = V / R = {voltage} V / {resistance} Ω</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', fontVariantNumeric: 'tabular-nums' }}>
                                    {current} A
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 'bold' }}>
                                    {particleCount} {particleCount === 1 ? 'gota' : 'gotas'} de caudal
                                </div>
                            </div>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.45, background: 'rgba(15,23,42,0.6)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            💡 <strong>Correspondencia directa:</strong> Cada <strong>1 Amperio</strong> equivale exactamente a <strong>1 partícula de agua</strong> circulando por el tubo a velocidad constante.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
