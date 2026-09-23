import React, { useState, useEffect } from 'react';
import { Radio, Activity, Cpu, Sliders, Volume2, Move, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function UltrasonicSensorSimulator() {
    // Distancia interactiva del obstáculo en centímetros (2 cm a 300 cm)
    const [distanceCm, setDistanceCm] = useState(25);
    const [isTriggering, setIsTriggering] = useState(false);

    // Velocidad del sonido: 343 m/s = 0.0343 cm/µs (1 cm = ~29.1 µs de viaje, ~58.2 µs ida y vuelta)
    // Tiempo en microsegundos = Distancia (cm) * 58.2
    const timeMicroseconds = Math.round(distanceCm * 58.2);

    // Estado del obstáculo (Zonas de seguridad)
    let safetyZone = 'safe'; // 'safe' | 'warning' | 'danger'
    if (distanceCm <= 10) {
        safetyZone = 'danger';
    } else if (distanceCm <= 30) {
        safetyZone = 'warning';
    }

    // Efecto de pulso Trigger simulado
    const handleTriggerPulse = () => {
        setIsTriggering(true);
        setTimeout(() => setIsTriggering(false), 600);
    };

    return (
        <div style={{
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
            borderRadius: '20px',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 25px rgba(56, 189, 248, 0.1)',
            padding: '1.5rem',
            margin: '1.5rem 0',
            color: '#f8fafc',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {/* Cabecera */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid #38bdf8',
                        borderRadius: '12px',
                        padding: '0.6rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Activity size={24} color="#38bdf8" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc' }}>
                            Simulador Interactivo de Radar Ultrasónico HC-SR04
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                            Mueve el obstáculo y visualiza el eco acústico a 40 kHz, el pulso <code>pulseIn()</code> y el cálculo matemático
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: safetyZone === 'danger' ? 'rgba(239, 68, 68, 0.2)' : safetyZone === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: safetyZone === 'danger' ? '#ef4444' : safetyZone === 'warning' ? '#f59e0b' : '#10b981',
                        border: `1px solid ${safetyZone === 'danger' ? 'rgba(239, 68, 68, 0.4)' : safetyZone === 'warning' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                    }}>
                        {safetyZone === 'danger' && <AlertTriangle size={15} />}
                        {safetyZone === 'warning' && <AlertTriangle size={15} />}
                        {safetyZone === 'safe' && <CheckCircle2 size={15} />}
                        {safetyZone === 'danger' ? 'CRÍTICO (< 10 cm)' : safetyZone === 'warning' ? 'PRECAUCIÓN (10-30 cm)' : 'DESPEJADO (> 30 cm)'}
                    </span>
                </div>
            </div>

            {/* Grid Principal */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {/* Panel Visual: Banco de Ultrasonido y Obstáculo */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '16px',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '650', color: '#38bdf8', marginBottom: '1rem', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>CAMPO ACÚSTICO DE PRUEBA</span>
                        <button
                            onClick={handleTriggerPulse}
                            style={{
                                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                                border: 'none',
                                color: '#ffffff',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                            }}
                        >
                            <Volume2 size={13} /> Disparar Ráfaga 10µs
                        </button>
                    </div>

                    {/* Gráfico SVG del Sensor HC-SR04 y las Ondas */}
                    <svg viewBox="0 0 360 210" style={{ width: '100%', maxWidth: '360px', height: 'auto', background: '#090d16', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {/* Líneas de Regla de Distancia */}
                        <line x1="85" y1="180" x2="330" y2="180" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                        <text x="85" y="195" textAnchor="middle" fill="#64748b" fontSize="8">0 cm</text>
                        <text x="200" y="195" textAnchor="middle" fill="#64748b" fontSize="8">50 cm</text>
                        <text x="325" y="195" textAnchor="middle" fill="#64748b" fontSize="8">100 cm</text>

                        {/* Módulo HC-SR04 PCB Azul */}
                        <rect x="15" y="55" width="70" height="95" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                        <text x="50" y="70" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">HC-SR04</text>

                        {/* Emisor Ultrasónico T (Arriba) */}
                        <circle cx="50" cy="85" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
                        <circle cx="50" cy="85" r="8" fill="#475569" />
                        <text x="50" y="88" textAnchor="middle" fill="#f8fafc" fontSize="8" fontWeight="900">T</text>

                        {/* Receptor Ultrasónico R (Abajo) */}
                        <circle cx="50" cy="125" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
                        <circle cx="50" cy="125" r="8" fill="#475569" />
                        <text x="50" y="128" textAnchor="middle" fill="#f8fafc" fontSize="8" fontWeight="900">R</text>

                        {/* Pines de Conexión */}
                        <rect x="5" y="82" width="10" height="4" fill="#e2e8f0" />
                        <rect x="5" y="94" width="10" height="4" fill="#e2e8f0" />
                        <rect x="5" y="106" width="10" height="4" fill="#e2e8f0" />
                        <rect x="5" y="118" width="10" height="4" fill="#e2e8f0" />

                        {/* Posición dinámica del obstáculo */}
                        {/* Mapeo: 2 cm -> x=105, 100 cm -> x=325 */}
                        {(() => {
                            const clampedDist = Math.min(distanceCm, 100);
                            const obstacleX = 105 + (clampedDist / 100) * 215;

                            return (
                                <g>
                                    {/* Ondas Sonoras de Ida (Emisor T -> Obstáculo) */}
                                    <path
                                        d={`M 70,85 Q ${(70 + obstacleX) / 2},${70} ${obstacleX},85`}
                                        fill="none"
                                        stroke={isTriggering ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)'}
                                        strokeWidth={isTriggering ? '3' : '1.5'}
                                        strokeDasharray="4 3"
                                    />
                                    {/* Ondas de Eco de Regreso (Obstáculo -> Receptor R) */}
                                    <path
                                        d={`M ${obstacleX},125 Q ${(70 + obstacleX) / 2},${140} 70,125`}
                                        fill="none"
                                        stroke={isTriggering ? '#10b981' : 'rgba(16, 185, 129, 0.4)'}
                                        strokeWidth={isTriggering ? '3' : '1.5'}
                                        strokeDasharray="4 3"
                                    />

                                    {/* Cota / Flecha de Distancia */}
                                    <line x1="75" y1="40" x2={obstacleX} y2="40" stroke="#f59e0b" strokeWidth="1.5" />
                                    <circle cx="75" cy="40" r="3" fill="#f59e0b" />
                                    <circle cx={obstacleX} cy="40" r="3" fill="#f59e0b" />
                                    <text x={(75 + obstacleX) / 2} y="33" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="700">
                                        d = {distanceCm} cm
                                    </text>

                                    {/* Obstáculo Físico */}
                                    <rect
                                        x={obstacleX - 6}
                                        y="50"
                                        width="16"
                                        height="105"
                                        rx="4"
                                        fill={safetyZone === 'danger' ? '#ef4444' : safetyZone === 'warning' ? '#f59e0b' : '#3b82f6'}
                                        stroke="#ffffff"
                                        strokeWidth="1.5"
                                    />
                                    <text
                                        x={obstacleX + 2}
                                        y="105"
                                        textAnchor="middle"
                                        fill="#ffffff"
                                        fontSize="8"
                                        fontWeight="700"
                                        transform={`rotate(-90 ${obstacleX + 2} 105)`}
                                    >
                                        OBSTÁCULO
                                    </text>
                                </g>
                            );
                        })()}
                    </svg>

                    {/* Deslizador Interactivo de Distancia */}
                    <div style={{ width: '100%', marginTop: '1rem', background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Move size={15} color="#38bdf8" /> Posición del Obstáculo:
                            </span>
                            <strong style={{ color: '#38bdf8', fontSize: '1.05rem' }}>{distanceCm} cm</strong>
                        </div>
                        <input
                            type="range"
                            min="2"
                            max="150"
                            value={distanceCm}
                            onChange={(e) => setDistanceCm(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
                            <span>Mín: 2 cm</span>
                            <span>50 cm</span>
                            <span>Máx: 150 cm</span>
                        </div>
                    </div>
                </div>

                {/* Panel de Matemáticas de la Física y Telemetría */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Caja de Desglose Matemático */}
                    <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Cpu size={16} color="#38bdf8" /> CÁLCULO DE FÍSICA EN TIEMPO REAL
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px', borderLeft: '4px solid #38bdf8' }}>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tiempo de Eco (pulseIn)</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#38bdf8' }}>
                                    {timeMicroseconds} µs
                                </div>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Distancia Calculada</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#10b981' }}>
                                    {distanceCm} cm
                                </div>
                            </div>
                        </div>

                        {/* Fórmula Paso a Paso */}
                        <div style={{ marginTop: '0.85rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.15)', fontSize: '0.82rem', lineHeight: '1.6' }}>
                            <div><strong>Fórmula:</strong> <code>Distancia = (Tiempo × 0.0343) / 2</code></div>
                            <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                                Operación en vivo: ({timeMicroseconds} µs × 0.0343 cm/µs) / 2 = <strong>{distanceCm} cm</strong>
                            </div>
                        </div>
                    </div>

                    {/* Monitor de Código C++ en Vivo */}
                    <div style={{ background: 'rgba(15, 23, 42, 0.85)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', marginBottom: '0.5rem' }}>
                            💻 CÓDIGO C++ CON PULSEIN() EJECUTÁNDOSE EN VIVO:
                        </div>
                        <pre style={{ margin: 0, padding: '0.75rem', background: '#020617', borderRadius: '10px', fontSize: '0.78rem', color: '#e2e8f0', overflowX: 'auto', lineHeight: '1.6' }}>
                            <code>
{`int TRIG_PIN = 9;
int ECHO_PIN = 10;

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.begin(9600);
}

void loop() {
  // 1. Enviar pulso de disparo de 10 microsegundos
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // 2. Medir duración del pulso Echo en microsegundos
  long duracion = pulseIn(ECHO_PIN, HIGH); // = ${timeMicroseconds} µs

  // 3. Calcular distancia en centímetros (Ida y vuelta)
  long distancia = (duracion * 0.0343) / 2; // = ${distanceCm} cm

  Serial.print("Distancia: ");
  Serial.print(distancia);
  Serial.println(" cm");
  delay(100);
}`}
                            </code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
