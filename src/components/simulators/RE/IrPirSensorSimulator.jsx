import React, { useState, useEffect } from 'react';
import { Radio, Eye, Activity, ShieldCheck, Sun, Moon, Cpu, Sliders, Volume2, Sparkles } from 'lucide-react';

export default function IrPirSensorSimulator() {
    // Modo de sensor activo: 'ir' o 'pir'
    const [activeTab, setActiveTab] = useState('ir');

    // Estado Sensor IR
    const [surfaceType, setSurfaceType] = useState('white'); // 'white' | 'black' | 'obstacle'
    const [irSensitivity, setIrSensitivity] = useState(60); // 0 - 100%
    const [irThresholdMet, setIrThresholdMet] = useState(true);

    // Estado Sensor PIR
    const [pirMotion, setPirMotion] = useState(false);
    const [pirDelay, setPirDelay] = useState(3); // segundos de retardo
    const [pirCountdown, setPirCountdown] = useState(0);
    const [pirSensitivity, setPirSensitivity] = useState(75);

    // Lógica IR
    useEffect(() => {
        // En superficie blanca u obstáculo cercano, hay rebote infrarrojo
        // En línea negra o vacío, no hay rebote
        if (surfaceType === 'white' || surfaceType === 'obstacle') {
            setIrThresholdMet(irSensitivity >= 25);
        } else {
            // Superficie negra absorbe la luz
            setIrThresholdMet(false);
        }
    }, [surfaceType, irSensitivity]);

    // Lógica PIR (Temporizador de detección)
    useEffect(() => {
        if (pirMotion) {
            setPirCountdown(pirDelay);
        }
    }, [pirMotion, pirDelay]);

    useEffect(() => {
        let interval;
        if (pirCountdown > 0) {
            interval = setInterval(() => {
                setPirCountdown(prev => {
                    if (prev <= 1) {
                        setPirMotion(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [pirCountdown]);

    // Cálculos de señal digital Arduino:
    // Módulo IR típico (con comparador LM393):
    // - Detecta rebote (blanco/objeto) -> Salida OUT = LOW (0V), LED del sensor ENCENDIDO
    // - NO detecta rebote (negro/lejos) -> Salida OUT = HIGH (5V), LED del sensor APAGADO
    const irDigitalOut = irThresholdMet ? 'LOW (0V)' : 'HIGH (5V)';
    const irLedActive = irThresholdMet;

    // Módulo PIR (HC-SR501):
    // - Detecta movimiento térmico -> Salida OUT = HIGH (3.3V / 5V)
    // - Sin movimiento -> Salida OUT = LOW (0V)
    const pirDigitalOut = pirCountdown > 0 ? 'HIGH (5V)' : 'LOW (0V)';

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
            {/* Cabecera y Selector de Pestañas */}
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
                            Simulador Interactivo de Sensores Digitales
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                            Experimenta con el sensor Infrarrojo (TCRT5000) y el Detector de Presencia PIR (HC-SR501)
                        </p>
                    </div>
                </div>

                {/* Switch de Modo */}
                <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '0.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={() => setActiveTab('ir')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '10px',
                            border: 'none',
                            background: activeTab === 'ir' ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'transparent',
                            color: activeTab === 'ir' ? '#ffffff' : '#94a3b8',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Radio size={16} /> Sensor Infrarrojo (IR)
                    </button>
                    <button
                        onClick={() => setActiveTab('pir')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '10px',
                            border: 'none',
                            background: activeTab === 'pir' ? 'linear-gradient(135deg, #10b981, #047857)' : 'transparent',
                            color: activeTab === 'pir' ? '#ffffff' : '#94a3b8',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Eye size={16} /> Detector PIR (Movimiento)
                    </button>
                </div>
            </div>

            {/* CUERPO DEL SIMULADOR: SENSOR IR */}
            {activeTab === 'ir' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {/* Panel Visual del Sensor IR y Entorno */}
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        borderRadius: '16px',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative'
                    }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '650', color: '#38bdf8', marginBottom: '1rem', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>BANCO DE PRUEBA ÓPTICO</span>
                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '6px', background: irThresholdMet ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: irThresholdMet ? '#10b981' : '#ef4444' }}>
                                {irThresholdMet ? '● LUZ REFLEJADA' : '○ SIN REFLEXIÓN'}
                            </span>
                        </div>

                        {/* Gráfico SVG del Sensor IR y la Superficie */}
                        <svg viewBox="0 0 340 220" style={{ width: '100%', maxWidth: '340px', height: 'auto', background: '#090d16', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {/* Placa PCB del Sensor IR */}
                            <rect x="100" y="20" width="140" height="85" rx="6" fill="#0f172a" stroke="#0284c7" strokeWidth="2" />
                            <text x="170" y="40" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="700">MÓDULO IR TCRT5000</text>
                            
                            {/* Comparador LM393 */}
                            <rect x="150" y="50" width="40" height="25" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                            <text x="170" y="66" textAnchor="middle" fill="#64748b" fontSize="8">LM393</text>

                            {/* Potenciómetro Trimmer Azul */}
                            <rect x="110" y="50" width="26" height="26" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                            <circle cx="123" cy="63" r="8" fill="#e2e8f0" />
                            <line x1="123" y1="57" x2="123" y2="69" stroke="#0f172a" strokeWidth="2" />

                            {/* LEDs indicadores en el módulo */}
                            {/* LED Power (Verde) */}
                            <circle cx="210" cy="55" r="4" fill="#10b981" />
                            <text x="210" y="47" textAnchor="middle" fill="#64748b" fontSize="7">PWR</text>

                            {/* LED D0 Out (Rojo/Verde) */}
                            <circle cx="210" cy="72" r="4" fill={irLedActive ? '#10b981' : '#334155'} stroke={irLedActive ? '#34d399' : '#475569'} strokeWidth="1" />
                            <text x="210" y="84" textAnchor="middle" fill={irLedActive ? '#34d399' : '#64748b'} fontSize="7">D0-LED</text>

                            {/* Diodo Emisor IR (Transparente / Emite haz lila/cian) */}
                            <rect x="135" y="105" width="16" height="20" rx="3" fill="#38bdf8" opacity="0.8" />
                            <circle cx="143" cy="125" r="7" fill="#7dd3fc" />
                            <text x="143" y="138" textAnchor="middle" fill="#94a3b8" fontSize="7">EMISOR</text>

                            {/* Fototransistor Receptor IR (Negro) */}
                            <rect x="185" y="105" width="16" height="20" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                            <circle cx="193" cy="125" r="7" fill="#18181b" stroke="#64748b" strokeWidth="1" />
                            <text x="193" y="138" textAnchor="middle" fill="#94a3b8" fontSize="7">RECEPTOR</text>

                            {/* Rayos Infrarrojos */}
                            <line x1="143" y1="125" x2="160" y2="180" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="4 3" opacity="0.85" />
                            
                            {(surfaceType === 'white' || surfaceType === 'obstacle') && (
                                <line x1="160" y1="180" x2="193" y2="125" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4 3" opacity={irThresholdMet ? 0.9 : 0.4} />
                            )}

                            {/* Superficie de Prueba */}
                            {surfaceType === 'white' && (
                                <g>
                                    <rect x="40" y="180" width="260" height="28" rx="4" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
                                    <text x="170" y="198" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="700">SUPERFICIE BLANCA (REFLECTANTE)</text>
                                </g>
                            )}

                            {surfaceType === 'black' && (
                                <g>
                                    <rect x="40" y="180" width="260" height="28" rx="4" fill="#09090b" stroke="#3f3f46" strokeWidth="1.5" />
                                    <text x="170" y="198" textAnchor="middle" fill="#f43f5e" fontSize="11" fontWeight="700">LÍNEA NEGRA (ABSORBE LA LUZ IR)</text>
                                </g>
                            )}

                            {surfaceType === 'obstacle' && (
                                <g>
                                    <rect x="80" y="170" width="180" height="38" rx="6" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2" />
                                    <text x="170" y="194" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="700">OBSTÁCULO CERCANO DETECTADO</text>
                                </g>
                            )}
                        </svg>

                        {/* Controles del Entorno IR */}
                        <div style={{ width: '100%', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>
                                Selecciona el Material / Entorno del Sensor:
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setSurfaceType('white')}
                                    style={{
                                        padding: '0.6rem 0.4rem',
                                        borderRadius: '8px',
                                        border: surfaceType === 'white' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                                        background: surfaceType === 'white' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.03)',
                                        color: '#ffffff',
                                        fontSize: '0.78rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ⚪ Blanco (Pista)
                                </button>
                                <button
                                    onClick={() => setSurfaceType('black')}
                                    style={{
                                        padding: '0.6rem 0.4rem',
                                        borderRadius: '8px',
                                        border: surfaceType === 'black' ? '2px solid #f43f5e' : '1px solid rgba(255,255,255,0.1)',
                                        background: surfaceType === 'black' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.03)',
                                        color: '#ffffff',
                                        fontSize: '0.78rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ⚫ Línea Negra
                                </button>
                                <button
                                    onClick={() => setSurfaceType('obstacle')}
                                    style={{
                                        padding: '0.6rem 0.4rem',
                                        borderRadius: '8px',
                                        border: surfaceType === 'obstacle' ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                                        background: surfaceType === 'obstacle' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.03)',
                                        color: '#ffffff',
                                        fontSize: '0.78rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📦 Obstáculo
                                </button>
                            </div>

                            {/* Deslizador del Trimmer de Calibración */}
                            <div style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                                    <span>Trimmer Sensibilidad:</span>
                                    <strong style={{ color: '#38bdf8' }}>{irSensitivity}%</strong>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={irSensitivity}
                                    onChange={(e) => setIrSensitivity(Number(e.target.value))}
                                    style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Panel de Telemetría Arduino y Código C++ */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Estado de Pines Digitales */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Cpu size={16} color="#38bdf8" /> TELEMETRÍA EN ARDUINO (PIN DIGITAL D2)
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px', borderLeft: '4px solid #38bdf8' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lectura digitalRead(2)</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: irThresholdMet ? '#92400e' : '#ef4444' }}>
                                        {irDigitalOut}
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Estado del LED Sensor</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: irLedActive ? '#10b981' : '#64748b' }}>
                                        {irLedActive ? '🟢 ENCENDIDO' : '⚪ APAGADO'}
                                    </div>
                                </div>
                            </div>

                            {/* Explicación en vivo del estado */}
                            <div style={{ marginTop: '0.85rem', padding: '0.75rem', borderRadius: '8px', background: irThresholdMet ? 'rgba(56, 189, 248, 0.1)' : 'rgba(244, 63, 94, 0.1)', border: irThresholdMet ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid rgba(244, 63, 94, 0.2)', fontSize: '0.8rem', lineHeight: '1.5' }}>
                                {irThresholdMet ? (
                                    <span>
                                        ✅ <strong>Rebote Infrarrojo Confirmado:</strong> El fototransistor recibe la luz emitida → el comparador LM393 conmuta la salida a nivel bajo <code>LOW (0V)</code>.
                                    </span>
                                ) : (
                                    <span>
                                        ⚠️ <strong>Sin Rebote (Absorción / Lejos):</strong> La luz no regresa al receptor → la resistencia pull-up interna mantiene el pin en <code>HIGH (5V)</code>.
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Monitor C++ en tiempo real */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.85)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                💻 CÓDIGO C++ EJECUTÁNDOSE EN VIVO:
                            </div>
                            <pre style={{ margin: 0, padding: '0.75rem', background: '#020617', borderRadius: '10px', fontSize: '0.78rem', color: '#e2e8f0', overflowX: 'auto', lineHeight: '1.6' }}>
                                <code>
{`int pinIR = 2;

void setup() {
  pinMode(pinIR, INPUT);
  Serial.begin(9600);
}

void loop() {
  int valor = digitalRead(pinIR);
  if (valor == LOW) {
    // Detecta blanco u obstaculo (${irDigitalOut})
    Serial.println("Superficie Blanca / Obstaculo Detectado");
  } else {
    // Detecta linea negra o vacio (${irDigitalOut})
    Serial.println("Linea Negra / Libre");
  }
  delay(100);
}`}
                                </code>
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {/* CUERPO DEL SIMULADOR: SENSOR PIR */}
            {activeTab === 'pir' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {/* Panel Visual del Sensor PIR */}
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        borderRadius: '16px',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative'
                    }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '650', color: '#10b981', marginBottom: '1rem', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>CAMPO DE DETECCIÓN TÉRMICA PIR</span>
                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '6px', background: pirCountdown > 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(148, 163, 184, 0.2)', color: pirCountdown > 0 ? '#10b981' : '#94a3b8' }}>
                                {pirCountdown > 0 ? `🚨 ALERTA: ${pirCountdown}s RESTANTES` : '🛡️ EN REPOSO'}
                            </span>
                        </div>

                        {/* Gráfico SVG del Sensor PIR */}
                        <svg viewBox="0 0 340 220" style={{ width: '100%', maxWidth: '340px', height: 'auto', background: '#090d16', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {/* Cono de Cobertura Infrarroja Piroeléctrica */}
                            <polygon points="170,50 40,210 300,210" fill={pirCountdown > 0 ? 'rgba(16, 185, 129, 0.18)' : 'rgba(56, 189, 248, 0.05)'} stroke={pirCountdown > 0 ? '#10b981' : 'rgba(56, 189, 248, 0.2)'} strokeDasharray="3 3" />

                            {/* PCB del Sensor PIR */}
                            <rect x="120" y="10" width="100" height="50" rx="6" fill="#047857" stroke="#10b981" strokeWidth="1.5" />
                            <text x="170" y="25" textAnchor="middle" fill="#d1fae5" fontSize="8" fontWeight="700">PIR HC-SR501</text>

                            {/* Lente de Fresnel (Cúpula Blanca) */}
                            <circle cx="170" cy="50" r="22" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                            {/* Relieve de facetas de la lente */}
                            <circle cx="170" cy="50" r="14" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                            <circle cx="170" cy="50" r="7" fill="#e2e8f0" />

                            {/* Persona / Objeto en Movimiento */}
                            {pirMotion ? (
                                <g transform="translate(145, 120)">
                                    <circle cx="25" cy="15" r="12" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                                    <path d="M 25,27 L 25,60 M 10,40 L 40,40 M 25,60 L 12,85 M 25,60 L 38,85" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                                    <circle cx="25" cy="40" r="28" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" strokeDasharray="4 2" />
                                    <text x="25" y="100" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="700">PERSONA EN MOVIMIENTO</text>
                                </g>
                            ) : (
                                <g transform="translate(170, 150)">
                                    <text x="0" y="0" textAnchor="middle" fill="#64748b" fontSize="10">Zona de detección tranquila</text>
                                    <text x="0" y="18" textAnchor="middle" fill="#475569" fontSize="8.5">(Presiona el botón para simular intruso)</text>
                                </g>
                            )}
                        </svg>

                        {/* Botón de Interacción: Simular Movimiento */}
                        <div style={{ width: '100%', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button
                                onClick={() => setPirMotion(true)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: pirCountdown > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                    color: '#ffffff',
                                    fontWeight: '700',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Sparkles size={18} /> Simular Persona Cruzando la Habitación
                            </button>

                            {/* Controles de Trimmers del PIR */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '10px' }}>
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>
                                        Retardo de Salida (Delay): <strong style={{ color: '#10b981' }}>{pirDelay}s</strong>
                                    </div>
                                    <input
                                        type="range"
                                        min="2"
                                        max="10"
                                        value={pirDelay}
                                        onChange={(e) => setPirDelay(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                                    />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>
                                        Sensibilidad (Alcance): <strong style={{ color: '#10b981' }}>{pirSensitivity}%</strong>
                                    </div>
                                    <input
                                        type="range"
                                        min="20"
                                        max="100"
                                        value={pirSensitivity}
                                        onChange={(e) => setPirSensitivity(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Telemetría PIR y Código C++ */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Estado de Pines Digitales */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ShieldCheck size={16} color="#10b981" /> LECTURA DIGITAL PIR (PIN D3)
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>digitalRead(pinPIR)</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: pirCountdown > 0 ? '#ef4444' : '#92400e' }}>
                                        {pirDigitalOut}
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px', borderLeft: '4px solid #f59e0b' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tiempo Activo</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f59e0b' }}>
                                        {pirCountdown > 0 ? `${pirCountdown} seg` : '0 seg (Reposo)'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '0.85rem', padding: '0.75rem', borderRadius: '8px', background: pirCountdown > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: pirCountdown > 0 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.8rem', lineHeight: '1.5' }}>
                                {pirCountdown > 0 ? (
                                    <span>
                                        🚨 <strong>Movimiento Detectado:</strong> El sensor piroeléctrico captó un cambio brusco de radiación infrarroja térmica y mantiene la salida en <code>HIGH (5V)</code>.
                                    </span>
                                ) : (
                                    <span>
                                        🛡️ <strong>Área Segura:</strong> No hay variaciones de calor en el ambiente. El pin de salida permanece en <code>LOW (0V)</code>.
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Monitor C++ en tiempo real */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.85)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                💻 CÓDIGO C++ DEL SISTEMA DE ALARMA PIR:
                            </div>
                            <pre style={{ margin: 0, padding: '0.75rem', background: '#020617', borderRadius: '10px', fontSize: '0.78rem', color: '#e2e8f0', overflowX: 'auto', lineHeight: '1.6' }}>
                                <code>
{`int pinPIR = 3;
int pinBuzzer = 8;

void setup() {
  pinMode(pinPIR, INPUT);
  pinMode(pinBuzzer, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int estadoPIR = digitalRead(pinPIR);
  if (estadoPIR == HIGH) {
    // Alerta de movimiento (${pirDigitalOut})
    digitalWrite(pinBuzzer, HIGH);
    Serial.println("¡INTRUSO DETECTADO!");
  } else {
    digitalWrite(pinBuzzer, LOW);
    Serial.println("Zona segura.");
  }
  delay(200);
}`}
                                </code>
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
