import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, SkipForward, RotateCcw, Sparkles, Maximize2, Minimize2, X, Gauge, ShieldAlert, Activity, Zap, Cpu, Settings2, Copy, Check } from 'lucide-react';

export default function L298NMotorSimulator() {
    const [hasJumper, setHasJumper] = useState(false); // true: Jumper puesto (5V permanente 100%), false: PWM controlado desde D9
    const [pwmValue, setPwmValue] = useState(180);      // Valor de analogWrite (0 - 255)
    const [in1, setIn1] = useState(true);              // HIGH / LOW
    const [in2, setIn2] = useState(false);             // HIGH / LOW
    const [mechanicalLoad, setMechanicalLoad] = useState('free'); // 'free' (vacío ~120mA), 'friction' (carga ~450mA), 'stall' (frenado con mano ~1.2A)
    const [rotationAngle, setRotationAngle] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);

    const animationFrameRef = useRef(null);

    // Si tiene jumper, la velocidad efectiva es 255 (100% permanente)
    const effectiveSpeed = hasJumper ? 255 : pwmValue;

    // Determinar dirección y estado del motor
    const isMovingForward = in1 && !in2 && effectiveSpeed > 0;
    const isMovingBackward = !in1 && in2 && effectiveSpeed > 0;
    const isBraking = in1 && in2;
    const isFloating = (!in1 && !in2) || effectiveSpeed === 0;

    // RPM física calculada según velocidad PWM y carga mecánica
    const loadFactor = mechanicalLoad === 'free' ? 1.0 : mechanicalLoad === 'friction' ? 0.75 : 0.05;
    const currentRpm = (isMovingForward || isMovingBackward) 
        ? Math.round((effectiveSpeed / 255) * 200 * loadFactor) 
        : 0;

    // Consumo de corriente en miliamperios (mA)
    const currentMilliAmps = isBraking
        ? 850
        : (isMovingForward || isMovingBackward)
            ? Math.round((mechanicalLoad === 'free' ? 110 + (effectiveSpeed / 255) * 60 : mechanicalLoad === 'friction' ? 320 + (effectiveSpeed / 255) * 220 : 1200 + (effectiveSpeed / 255) * 400))
            : 15; // Corriente de reposo del módulo

    // Loop de animación física con inercia
    useEffect(() => {
        let lastTime = performance.now();

        const loop = (currentTime) => {
            const dt = (currentTime - lastTime) / 1000;
            lastTime = currentTime;

            if (isPlaying) {
                if (isMovingForward) {
                    const speedDegPerSec = (currentRpm / 60) * 360;
                    setRotationAngle(prev => (prev + speedDegPerSec * dt) % 360);
                } else if (isMovingBackward) {
                    const speedDegPerSec = (currentRpm / 60) * 360;
                    setRotationAngle(prev => (prev - speedDegPerSec * dt + 360) % 360);
                }
            }

            animationFrameRef.current = requestAnimationFrame(loop);
        };

        animationFrameRef.current = requestAnimationFrame(loop);

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isPlaying, isMovingForward, isMovingBackward, currentRpm]);

    const setForward = () => {
        setIn1(true);
        setIn2(false);
    };

    const setBackward = () => {
        setIn1(false);
        setIn2(true);
    };

    const setStop = () => {
        setIn1(false);
        setIn2(false);
    };

    const setBrake = () => {
        setIn1(true);
        setIn2(true);
    };

    const copyCode = () => {
        const code = `// Pines de Control Puente H
int ENA = 9;  // Pin PWM (~9)
int IN1 = 8;  // Dirección
int IN2 = 7;  // Dirección

void setup() {
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
}

void loop() {
  ${isMovingForward ? `avanzar(${effectiveSpeed});` : isMovingBackward ? `retroceder(${effectiveSpeed});` : isBraking ? 'frenar();' : 'detener();'}
}

void avanzar(int vel) {
  analogWrite(ENA, vel);
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
}

void retroceder(int vel) {
  analogWrite(ENA, vel);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
}

void frenar() {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, HIGH);
}

void detener() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
}`;
        navigator.clipboard.writeText(code).then(() => {
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        });
    };

    // Componente del Osciloscopio PWM en tiempo real
    const renderPwmOscilloscope = () => {
        const dutyPercent = Math.round((effectiveSpeed / 255) * 100);
        const periodWidth = 80;
        const highWidth = Math.max(2, Math.min(periodWidth - 2, (effectiveSpeed / 255) * periodWidth));
        const lowWidth = periodWidth - highWidth;

        // Generar 3 ciclos completos de onda cuadrada
        let pathData = "M 0 35 ";
        for (let i = 0; i < 3; i++) {
            const startX = i * periodWidth;
            if (effectiveSpeed === 0) {
                pathData += `L ${startX + periodWidth} 35 `;
            } else if (effectiveSpeed === 255) {
                pathData += `L ${startX} 8 L ${startX + periodWidth} 8 `;
            } else {
                pathData += `L ${startX} 35 L ${startX} 8 L ${startX + highWidth} 8 L ${startX + highWidth} 35 L ${startX + periodWidth} 35 `;
            }
        }

        return (
            <div style={{
                background: '#040711',
                borderRadius: '14px',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '0.85rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Cuadrícula de osciloscopio */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(to right, rgba(56, 189, 248, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.07) 1px, transparent 1px)',
                    backgroundSize: '16px 16px'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2, marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 800, color: '#38bdf8' }}>
                        <Activity size={14} /> OSCILOSCOPIO PWM (Pin 9 Arduino)
                    </div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#facc15', background: 'rgba(250, 204, 21, 0.12)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(250, 204, 21, 0.25)' }}>
                        Duty Cycle: {dutyPercent}% ({hasJumper ? '5V Constante' : `${(5 * (effectiveSpeed / 255)).toFixed(2)}V Prom.`})
                    </div>
                </div>

                <div style={{ position: 'relative', height: '44px', width: '100%', display: 'flex', alignItems: 'center' }}>
                    <svg width="100%" height="44" viewBox="0 0 240 44" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                        {/* Líneas guía de 5V y 0V */}
                        <line x1="0" y1="8" x2="240" y2="8" stroke="rgba(255,255,255,0.15)" strokeDasharray="2,2" />
                        <text x="235" y="12" fill="#94a3b8" fontSize="8" textAnchor="end">5V</text>
                        <line x1="0" y1="35" x2="240" y2="35" stroke="rgba(255,255,255,0.15)" strokeDasharray="2,2" />
                        <text x="235" y="33" fill="#94a3b8" fontSize="8" textAnchor="end">0V</text>

                        {/* Trazo Neón de Onda Cuadrada */}
                        <path
                            d={pathData}
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="drop-shadow(0 0 6px #38bdf8)"
                        />
                    </svg>
                </div>
            </div>
        );
    };

    const renderSimulatorBody = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', height: '100%', justifyContent: 'space-between' }}>
            {/* 1. Banco de Pruebas Físico: Rueda Robótica TT + Telemetría */}
            <div style={{
                background: '#090d16',
                borderRadius: '20px',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '1.25rem 1.5rem',
                display: 'grid',
                gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.3fr)',
                gap: '1.5rem',
                alignItems: 'center',
                boxShadow: 'inset 0 0 35px rgba(0,0,0,0.85)'
            }}>
                {/* 1A: Rueda de Robot TT Amarilla con Neumático de Goma */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <div style={{
                        position: 'absolute',
                        top: '-6px',
                        left: '0px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#facc15',
                        background: 'rgba(250, 204, 21, 0.12)',
                        border: '1px solid rgba(250, 204, 21, 0.3)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}>
                        🏎️ RUEDA ROBÓTICA TT (1:48)
                    </div>

                    <svg width="230" height="230" viewBox="0 0 230 230">
                        <defs>
                            <radialGradient id="tireGrad" cx="50%" cy="50%" r="50%">
                                <stop offset="70%" stopColor="#1e293b" />
                                <stop offset="92%" stopColor="#0f172a" />
                                <stop offset="100%" stopColor="#020617" />
                            </radialGradient>
                            <radialGradient id="rimYellowGrad" cx="40%" cy="40%" r="60%">
                                <stop offset="0%" stopColor="#fef08a" />
                                <stop offset="60%" stopColor="#eab308" />
                                <stop offset="100%" stopColor="#ca8a04" />
                            </radialGradient>

                        </defs>

                        {/* Bornes M+ y M- en el lateral */}
                        <g>
                            <rect x="10" y="70" width="18" height="22" rx="4" fill={isMovingForward ? '#10b981' : isBraking ? '#f59e0b' : '#334155'} stroke="#38bdf8" strokeWidth="1.5" />
                            <text x="19" y="85" fill="white" fontSize="10" fontWeight="900" textAnchor="middle">M+</text>
                            
                            <rect x="10" y="138" width="18" height="22" rx="4" fill={isMovingBackward ? '#ef4444' : isBraking ? '#f59e0b' : '#334155'} stroke="#38bdf8" strokeWidth="1.5" />
                            <text x="19" y="153" fill="white" fontSize="10" fontWeight="900" textAnchor="middle">M-</text>
                        </g>

                        {/* Conjunto Rueda Giratoria TT (Neumático + Rin Amarillo + Aspas de Tracción) */}
                        <g transform={`rotate(${rotationAngle} 125 115)`}>
                            {/* Neumático exterior de goma */}
                            <circle cx="125" cy="115" r="82" fill="url(#tireGrad)" stroke="#0f172a" strokeWidth="4" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.8))" />
                            
                            {/* Huellas y estrías del neumático (Dibujo de tracción) */}
                            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => (
                                <line
                                    key={angle}
                                    x1={125 + 72 * Math.cos((angle * Math.PI) / 180)}
                                    y1={115 + 72 * Math.sin((angle * Math.PI) / 180)}
                                    x2={125 + 82 * Math.cos((angle * Math.PI) / 180)}
                                    y2={115 + 82 * Math.sin((angle * Math.PI) / 180)}
                                    stroke="#475569"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                />
                            ))}

                            {/* Rin interior amarillo robótico */}
                            <circle cx="125" cy="115" r="62" fill="url(#rimYellowGrad)" stroke="#a16207" strokeWidth="3" />

                            {/* Ventanas / radios del rin estilo aficionado */}
                            {[0, 72, 144, 216, 288].map(angle => {
                                const rad = (angle * Math.PI) / 180;
                                const cx = 125 + 34 * Math.cos(rad);
                                const cy = 115 + 34 * Math.sin(rad);
                                return (
                                    <circle key={angle} cx={cx} cy={cy} r="11" fill="#0f172a" stroke="#ca8a04" strokeWidth="2" />
                                );
                            })}

                            {/* Eje central blanco con doble plano de sujeción */}
                            <circle cx="125" cy="115" r="18" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                            <rect x="117" y="102" width="16" height="26" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                            <circle cx="125" cy="115" r="4.5" fill="#0f172a" />
                        </g>


                    </svg>

                    {/* Tacómetro y Amperímetro Integrados */}
                    <div style={{ display: 'flex', gap: '0.6rem', width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            padding: '6px 12px',
                            borderRadius: '12px'
                        }}>
                            <Gauge size={16} color="#38bdf8" />
                            <span style={{ color: '#f8fafc', fontWeight: 900, fontSize: '0.9rem' }}>
                                {currentRpm} <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600 }}>RPM</span>
                            </span>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(15, 23, 42, 0.9)',
                            border: `1px solid ${currentMilliAmps > 800 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(250, 204, 21, 0.25)'}`,
                            padding: '6px 12px',
                            borderRadius: '12px'
                        }}>
                            <Zap size={16} color={currentMilliAmps > 800 ? '#ef4444' : '#facc15'} />
                            <span style={{ color: currentMilliAmps > 800 ? '#f87171' : '#f8fafc', fontWeight: 900, fontSize: '0.9rem' }}>
                                {currentMilliAmps} <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600 }}>mA</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* 1B: Panel de Control del Driver L298N + Selector de Jumper Interactivo */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: '18px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {/* Encabezado con Interruptor de Jumper ENA */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            🔴 PUENTE H L298N (CANAL A)
                        </span>

                        {/* Interruptor Interactivo Jumper ENA */}
                        <button
                            onClick={() => setHasJumper(prev => !prev)}
                            style={{
                                background: hasJumper ? 'rgba(250, 204, 21, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                                border: `1.5px solid ${hasJumper ? '#facc15' : '#38bdf8'}`,
                                color: hasJumper ? '#facc15' : '#38bdf8',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                            }}
                            title="Haz clic para poner o quitar el jumper de hardware ENA"
                        >
                            <span>{hasJumper ? '🔒 Jumper ENA: PUESTO (100%)' : '🎛️ Jumper ENA: QUITADO (PWM Pin 9)'}</span>
                        </button>
                    </div>

                    {/* Estado de Pines Lógicos L298N */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        <div style={{
                            background: effectiveSpeed > 0 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${effectiveSpeed > 0 ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '10px',
                            padding: '6px 8px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>ENA ({hasJumper ? '+5V Fijo' : 'PWM D9'})</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: effectiveSpeed > 0 ? '#38bdf8' : '#64748b' }}>
                                {effectiveSpeed}
                            </div>
                        </div>

                        <div style={{
                            background: in1 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${in1 ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '10px',
                            padding: '6px 8px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>IN1 (Pin D8)</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: in1 ? '#34d399' : '#64748b' }}>
                                {in1 ? 'HIGH (5V)' : 'LOW (0V)'}
                            </div>
                        </div>

                        <div style={{
                            background: in2 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${in2 ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '10px',
                            padding: '6px 8px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>IN2 (Pin D7)</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: in2 ? '#f87171' : '#64748b' }}>
                                {in2 ? 'HIGH (5V)' : 'LOW (0V)'}
                            </div>
                        </div>
                    </div>

                    {/* Control Deslizante de Velocidad PWM (Habilitado solo si NO tiene jumper) */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700 }}>
                                Potenciómetro PWM (analogWrite D9):
                            </span>
                            <span style={{ fontSize: '0.82rem', color: hasJumper ? '#facc15' : '#38bdf8', fontWeight: 800 }}>
                                {hasJumper ? '255 / 255 (Fijo por Jumper)' : `${pwmValue} / 255 (${Math.round((pwmValue/255)*100)}%)`}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="255"
                            disabled={hasJumper}
                            value={hasJumper ? 255 : pwmValue}
                            onChange={(e) => setPwmValue(parseInt(e.target.value, 10))}
                            style={{
                                width: '100%',
                                accentColor: hasJumper ? '#facc15' : '#38bdf8',
                                cursor: hasJumper ? 'not-allowed' : 'pointer',
                                opacity: hasJumper ? 0.6 : 1
                            }}
                        />
                        {hasJumper && (
                            <div style={{ fontSize: '0.7rem', color: '#facc15', marginTop: '3px' }}>
                                💡 El jumper negro puentea ENA a +5V. Para modular velocidad con PWM, quita el jumper.
                            </div>
                        )}
                    </div>

                    {/* Osciloscopio en Vivo */}
                    {renderPwmOscilloscope()}
                </div>
            </div>

            {/* 2. Acciones Rápidas del Driver — fila horizontal completa */}
            <div style={{
                background: '#090d16',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0.9rem 1.1rem'
            }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.6rem', letterSpacing: '0.06em' }}>
                    🎮 Acciones Rápidas del Driver
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.55rem' }}>
                    <button onClick={setForward} style={{
                        background: isMovingForward ? '#10b981' : 'rgba(16, 185, 129, 0.12)',
                        color: isMovingForward ? '#ffffff' : '#34d399',
                        border: `1.5px solid ${isMovingForward ? '#10b981' : 'rgba(16, 185, 129, 0.35)'}`,
                        padding: '9px 8px', borderRadius: '10px', fontWeight: 800,
                        fontSize: '0.8rem', cursor: 'pointer', display: 'flex',
                        flexDirection: 'column', alignItems: 'center', gap: '3px',
                        transition: 'all 0.18s ease'
                    }}>
                        <span style={{ fontSize: '1.1rem' }}>↻</span>
                        <span>avanzar({effectiveSpeed})</span>
                    </button>

                    <button onClick={setBackward} style={{
                        background: isMovingBackward ? '#ef4444' : 'rgba(239, 68, 68, 0.12)',
                        color: isMovingBackward ? '#ffffff' : '#f87171',
                        border: `1.5px solid ${isMovingBackward ? '#ef4444' : 'rgba(239, 68, 68, 0.35)'}`,
                        padding: '9px 8px', borderRadius: '10px', fontWeight: 800,
                        fontSize: '0.8rem', cursor: 'pointer', display: 'flex',
                        flexDirection: 'column', alignItems: 'center', gap: '3px',
                        transition: 'all 0.18s ease'
                    }}>
                        <span style={{ fontSize: '1.1rem' }}>↺</span>
                        <span>retroceder({effectiveSpeed})</span>
                    </button>

                    <button onClick={setBrake} style={{
                        background: isBraking ? '#f59e0b' : 'rgba(245, 158, 11, 0.12)',
                        color: isBraking ? '#ffffff' : '#fbbf24',
                        border: `1.5px solid ${isBraking ? '#f59e0b' : 'rgba(245, 158, 11, 0.35)'}`,
                        padding: '9px 8px', borderRadius: '10px', fontWeight: 800,
                        fontSize: '0.8rem', cursor: 'pointer', display: 'flex',
                        flexDirection: 'column', alignItems: 'center', gap: '3px',
                        transition: 'all 0.18s ease'
                    }}>
                        <span style={{ fontSize: '1.1rem' }}>🛑</span>
                        <span>frenar()</span>
                    </button>

                    <button onClick={setStop} style={{
                        background: isFloating ? 'rgba(148, 163, 184, 0.2)' : 'rgba(255,255,255,0.04)',
                        color: isFloating ? '#ffffff' : '#94a3b8',
                        border: `1.5px solid ${isFloating ? 'rgba(148,163,184,0.6)' : 'rgba(148,163,184,0.2)'}`,
                        padding: '9px 8px', borderRadius: '10px', fontWeight: 800,
                        fontSize: '0.8rem', cursor: 'pointer', display: 'flex',
                        flexDirection: 'column', alignItems: 'center', gap: '3px',
                        transition: 'all 0.18s ease'
                    }}>
                        <span style={{ fontSize: '1.1rem' }}>⚪</span>
                        <span>detener()</span>
                    </button>
                </div>
            </div>

            {/* 3. Código C++ Interactivo con botón de copiar */}
            <div style={{
                background: '#090d16',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0.9rem 1.1rem'
            }}>
                {/* Cabecera del bloque de código */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        💻 Código de Control en C++ (Arduino)
                    </div>
                    <button
                        onClick={copyCode}
                        title="Copiar código"
                        style={{
                            background: codeCopied ? 'rgba(16, 185, 129, 0.18)' : 'rgba(56, 189, 248, 0.1)',
                            border: `1px solid ${codeCopied ? 'rgba(16, 185, 129, 0.5)' : 'rgba(56, 189, 248, 0.3)'}`,
                            color: codeCopied ? '#34d399' : '#38bdf8',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            cursor: 'pointer',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {codeCopied ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
                    </button>
                </div>
                <pre style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    fontSize: '0.78rem',
                    lineHeight: 1.5,
                    margin: 0,
                    overflowX: 'auto',
                    color: '#cbd5e1',
                    fontFamily: 'Consolas, Monaco, monospace'
                }}>
                    <code>{`// Pines de Control Puente H
int ENA = 9;  // Pin PWM (~9)
int IN1 = 8;  // Dirección
int IN2 = 7;  // Dirección

void setup() {
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
}

void loop() {
  ${isMovingForward ? `avanzar(${effectiveSpeed});` : isMovingBackward ? `retroceder(${effectiveSpeed});` : isBraking ? 'frenar();' : 'detener();'}
}

void avanzar(int vel) {
  analogWrite(ENA, vel); // ${effectiveSpeed} / 255
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
}

void retroceder(int vel) {
  analogWrite(ENA, vel);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
}

void frenar() {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, HIGH); // Freno activo inmediato
}

void detener() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);  // Punto muerto (rueda libre)
}`}</code>
                </pre>
            </div>
        </div>
    );

    return (
        <div className="function-control-simulator" style={{ width: '100%', margin: '1.5rem 0' }}>
            {/* Tarjeta de Lanzamiento / Preview */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)',
                border: '1.5px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '20px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 15px rgba(56, 189, 248, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Gauge size={24} color="#38bdf8" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 850, color: 'var(--text-heading, #f8fafc)', letterSpacing: '-0.01em' }}>
                            Laboratorio Interactivo: Motores DC y Puente H (L298N)
                        </h4>
                        <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary, #94a3b8)' }}>
                            Simulación en tiempo real de sentido de giro (IN1/IN2) y modulación de velocidad PWM (ENA).
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsExpanded(true)}
                    style={{
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.65rem 1.25rem',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                    <Maximize2 size={16} />
                    Abrir Simulador
                </button>
            </div>

            {/* Modal Pantalla Completa mediante Portal */}
            {isExpanded && typeof document !== 'undefined' && createPortal(
                <div
                    className="simulator-modal-backdrop"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(11, 17, 32, 0.88)',
                        backdropFilter: 'blur(12px)',
                        zIndex: 999999999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.5rem',
                        boxSizing: 'border-box'
                    }}
                    onClick={() => setIsExpanded(false)}
                >
                    <div
                        className="simulator-modal-card"
                        style={{
                            background: '#0b1120',
                            border: '1.5px solid rgba(56, 189, 248, 0.35)',
                            borderRadius: '24px',
                            width: '100%',
                            maxWidth: '960px',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.2)',
                            overflow: 'hidden'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Cabecera del Modal */}
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'rgba(15, 23, 42, 0.8)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: 'rgba(56, 189, 248, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Gauge size={18} color="#38bdf8" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 850, color: '#f8fafc' }}>
                                        Simulador L298N: Control de Motores DC
                                    </h3>
                                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                        Laboratorio Oficial SaberLab - Robótica Educativa
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsExpanded(false)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#cbd5e1',
                                    borderRadius: '10px',
                                    padding: '6px 12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <X size={16} /> Cerrar
                            </button>
                        </div>

                        {/* Cuerpo del Modal con Scroll */}
                        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                            {renderSimulatorBody()}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
