import { useState, useEffect } from 'react';
import { Zap, CheckCircle2, Play, RotateCcw, ChevronRight, Sparkles } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

export default function ParallelCalculationVisualizer() {
    // currentStep: 1..5 = pasos revelados
    const [currentStep, setCurrentStep] = useState(1);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);

    // Pasos interactivos con fórmula, cálculo, resultado y explicación para paralelo
    const stepsData = [
        {
            num: 1,
            title: 'Paso 1 · Resistencia Equivalente',
            hint: 'Req = (R₁·R₂)/(R₁+R₂)',
            calc: 'Req = (20·30)/(20+30) =',
            result: '12 Ω',
            color: '#facc15',
            bg: 'rgba(250, 204, 21, 0.15)',
            border: 'rgba(250, 204, 21, 0.4)',
            explanation: 'En paralelo de 2 ramas usamos el producto sobre la suma: (20×30)/(20+30) = 600/50 = 12Ω.'
        },
        {
            num: 2,
            title: 'Paso 2 · Voltaje en Cada Rama',
            hint: 'V₁ = V₂ = Vfuente',
            calc: 'V₁ = V₂ =',
            result: '12 V (Idéntico)',
            color: '#38bdf8',
            bg: 'rgba(56, 189, 248, 0.15)',
            border: 'rgba(56, 189, 248, 0.4)',
            explanation: 'En paralelo, todas las ramas están conectadas directamente a los 12V de la batería.'
        },
        {
            num: 3,
            title: 'Paso 3 · Corriente en Rama 1 (20 Ω)',
            hint: 'I₁ = V / R₁',
            calc: 'I₁ = 12 V / 20 Ω =',
            result: '0.6 A',
            color: '#34d399',
            bg: 'rgba(52, 211, 153, 0.15)',
            border: 'rgba(52, 211, 153, 0.4)',
            explanation: 'Ley de Ohm en Rama 1: 12V dividido entre 20Ω resulta en una corriente de 0.6 Amperios.'
        },
        {
            num: 4,
            title: 'Paso 4 · Corriente en Rama 2 (30 Ω)',
            hint: 'I₂ = V / R₂',
            calc: 'I₂ = 12 V / 30 Ω =',
            result: '0.4 A',
            color: '#34d399',
            bg: 'rgba(52, 211, 153, 0.15)',
            border: 'rgba(52, 211, 153, 0.4)',
            explanation: 'Mayor resistencia (30Ω) permite menor corriente: 12V / 30Ω = 0.4 Amperios.'
        },
        {
            num: 5,
            title: 'Paso 5 · Comprobación LCK (Regla 2)',
            hint: 'IT = I₁ + I₂',
            calc: 'IT = 0.6 A + 0.4 A =',
            result: '1.0 A ✅',
            color: '#c084fc',
            bg: 'rgba(192, 132, 252, 0.18)',
            border: 'rgba(192, 132, 252, 0.4)',
            explanation: 'La suma de corrientes de rama (0.6A + 0.4A) equivale a la corriente total IT = 1.0A.'
        }
    ];

    // Reproducción automática paso a paso con temporizador
    useEffect(() => {
        let interval = null;
        if (isAutoPlaying) {
            interval = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev >= 5) {
                        setIsAutoPlaying(false);
                        return 5;
                    }
                    return prev + 1;
                });
            }, 1800);
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const handleNextStep = () => {
        setIsAutoPlaying(false);
        setCurrentStep(prev => (prev < 5 ? prev + 1 : 1));
    };

    const handleReset = () => {
        setIsAutoPlaying(false);
        setCurrentStep(1);
    };

    const handleAutoPlay = () => {
        setCurrentStep(1);
        setIsAutoPlaying(true);
    };

    return (
        <div style={{
            maxWidth: '920px',
            margin: '0 auto',
            background: 'linear-gradient(145deg, #090e1a 0%, #0f172a 100%)',
            border: '1.5px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '20px',
            padding: '1.25rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
            color: '#f8fafc',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {/* Encabezado con Controles Interactivos */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', borderRadius: '10px', padding: '8px', display: 'flex' }}>
                        <Zap size={22} color="#f59e0b" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#fbbf24', fontWeight: 800 }}>
                            Animación Guiada: Cálculo Paso a Paso en Paralelo
                        </h4>
                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                            Haz clic en cada paso o presiona <strong>"Siguiente Paso"</strong> para ver el procedimiento
                        </p>
                    </div>
                </div>

                {/* Botones de Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        onClick={handleNextStep}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 12px rgba(2,132,199,0.35)'
                        }}
                    >
                        <span>{currentStep === 5 ? 'Reiniciar' : 'Siguiente Paso'}</span>
                        <ChevronRight size={16} />
                    </button>

                    <button
                        onClick={handleAutoPlay}
                        disabled={isAutoPlaying}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: isAutoPlaying ? 'rgba(52, 211, 153, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            border: '1px solid #10b981',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            cursor: isAutoPlaying ? 'default' : 'pointer',
                            opacity: isAutoPlaying ? 0.7 : 1
                        }}
                    >
                        <Play size={14} />
                        <span>{isAutoPlaying ? 'Animando...' : 'Animar Auto'}</span>
                    </button>

                    <button
                        onClick={handleReset}
                        title="Reiniciar al Paso 1"
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            color: '#cbd5e1',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '8px',
                            padding: '6px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <RotateCcw size={15} />
                    </button>
                </div>
            </div>

            {/* Layout en 2 Columnas Fijo Lado a Lado (Cálculos a la izquierda, Circuito a la derecha) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
                gap: '1.25rem',
                alignItems: 'start'
            }}>
                {/* ── COLUMNA IZQUIERDA: TARJETAS DE PASOS INTERACTIVAS ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {stepsData.map((step) => {
                        const isCurrent = currentStep === step.num;
                        const isRevealed = currentStep >= step.num;

                        return (
                            <div 
                                key={step.num}
                                onClick={() => { setIsAutoPlaying(false); setCurrentStep(step.num); }}
                                style={{
                                    background: isCurrent 
                                        ? step.bg 
                                        : isRevealed 
                                            ? 'rgba(15, 23, 42, 0.85)' 
                                            : 'rgba(15, 23, 42, 0.35)',
                                    border: `1.5px solid ${isCurrent ? step.color : isRevealed ? step.border : 'rgba(255,255,255,0.08)'}`,
                                    borderRadius: '12px',
                                    padding: '9px 12px',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    boxShadow: isCurrent ? `0 0 16px ${step.bg}` : 'none',
                                    opacity: isRevealed ? 1 : 0.45
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                                    <span style={{ color: isRevealed ? step.color : '#64748b', fontWeight: 800, fontSize: '0.81rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {isCurrent && <Sparkles size={13} color={step.color} />}
                                        {step.title}
                                    </span>
                                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontFamily: 'monospace', flexShrink: 0 }}>{step.hint}</span>
                                </div>

                                {isRevealed ? (
                                    <div style={{ 
                                        color: '#ffffff', 
                                        fontFamily: 'monospace', 
                                        fontSize: '0.88rem', 
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        animation: isCurrent ? 'fadeIn 0.3s ease-in' : 'none'
                                    }}>
                                        <span>{step.calc}</span>
                                        <span style={{ 
                                            color: step.color, 
                                            fontSize: '0.96rem', 
                                            fontWeight: 900,
                                            background: isCurrent ? 'rgba(0,0,0,0.4)' : 'transparent',
                                            padding: '1px 6px',
                                            borderRadius: '4px'
                                        }}>
                                            {step.result}
                                        </span>
                                    </div>
                                ) : (
                                    <div style={{ color: '#64748b', fontSize: '0.78rem', fontStyle: 'italic' }}>
                                        Haz clic para desbloquear este cálculo...
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Explicación Dinámica del Paso Activo */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        borderLeft: `4px solid ${stepsData[currentStep - 1]?.color || '#f59e0b'}`,
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '0.78rem',
                        color: '#cbd5e1',
                        lineHeight: 1.5,
                        marginTop: '4px'
                    }}>
                        💡 <strong>Explicación:</strong> {stepsData[currentStep - 1]?.explanation}
                    </div>
                </div>

                {/* ── COLUMNA DERECHA: DIAGRAMA ESQUEMÁTICO EN PARALELO ── */}
                <div style={{
                    background: 'radial-gradient(ellipse at center, #111c38 0%, #080c16 100%)',
                    border: `1.5px solid ${stepsData[currentStep - 1]?.color ? stepsData[currentStep - 1].color + '55' : 'rgba(255, 255, 255, 0.12)'}`,
                    borderRadius: '16px',
                    padding: '1.25rem 1rem',
                    textAlign: 'center',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
                    transition: 'border 0.3s ease'
                }}>
                    <svg viewBox="0 0 380 230" width="100%" height="220" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            {/* Gradiente Batería */}
                            <linearGradient id="pvisBatteryGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#0284c7" />
                                <stop offset="30%" stopColor="#0369a1" />
                                <stop offset="70%" stopColor="#075985" />
                                <stop offset="100%" stopColor="#0c4a6e" />
                            </linearGradient>

                            {/* Gradiente Resistencia */}
                            <linearGradient id="pvisResistorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#fef3c7" />
                                <stop offset="40%" stopColor="#fde68a" />
                                <stop offset="80%" stopColor="#fcd34d" />
                                <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>

                            {/* Resplandor para Electrones */}
                            <filter id="pvisParticleGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="2.5" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* Rieles Superior e Inferior */}
                        <path d="M 30 95 L 30 40 L 320 40" fill="none" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
                        <path d="M 30 95 L 30 40 L 320 40" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

                        <path d="M 30 155 L 30 185 L 320 185" fill="none" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
                        <path d="M 30 155 L 30 185 L 320 185" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

                        {/* Cables de Ramas Verticales */}
                        <line x1="180" y1="40" x2="180" y2="185" stroke="#38bdf8" strokeWidth="2.5" />
                        <line x1="320" y1="40" x2="320" y2="185" stroke="#38bdf8" strokeWidth="2.5" />

                        {/* Nodos Eléctricos */}
                        <circle cx="180" cy="40" r="4" fill="#38bdf8" />
                        <circle cx="180" cy="185" r="4" fill="#38bdf8" />
                        <circle cx="320" cy="40" r="4" fill="#38bdf8" />
                        <circle cx="320" cy="185" r="4" fill="#38bdf8" />

                        {/* ── ELECTRONES ANIMADOS EN CADA RAMA ── */}
                        {currentStep >= 3 && [0, 1.8, 3.6].map((offset, i) => (
                            <circle key={`e1-${i}`} r="3.5" fill="#67e8f9" stroke="#ffffff" strokeWidth="1" filter="url(#pvisParticleGlow)">
                                <animateMotion
                                    dur="5.4s"
                                    repeatCount="indefinite"
                                    begin={`-${offset}s`}
                                    path="M 30 40 L 180 40 L 180 185 L 30 185 Z"
                                />
                            </circle>
                        ))}

                        {currentStep >= 4 && [0.9, 2.7, 4.5].map((offset, i) => (
                            <circle key={`e2-${i}`} r="3.5" fill="#67e8f9" stroke="#ffffff" strokeWidth="1" filter="url(#pvisParticleGlow)">
                                <animateMotion
                                    dur="5.4s"
                                    repeatCount="indefinite"
                                    begin={`-${offset}s`}
                                    path="M 30 40 L 320 40 L 320 185 L 30 185 Z"
                                />
                            </circle>
                        ))}

                        {/* ── BATERÍA 12V ── */}
                        <g transform="translate(15, 100)" filter={currentStep === 2 || currentStep === 5 ? 'drop-shadow(0 0 8px #38bdf8)' : 'none'}>
                            <rect x="11" y="-6" width="8" height="6" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                            <rect x="0" y="0" width="30" height="52" rx="6" fill="url(#pvisBatteryGrad)" stroke="#38bdf8" strokeWidth="1.8" />
                            <rect x="0" y="0" width="30" height="14" rx="3" fill="#eab308" />
                            <text x="15" y="11" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="900">+</text>
                            <text x="15" y="46" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="900">−</text>
                        </g>

                        {/* Badge Batería */}
                        <g transform="translate(52, 115)">
                            <rect x="0" y="0" width="50" height="22" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                            <text x="25" y="15" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="900">12 V</text>
                        </g>

                        {/* Badge Corriente Total IT (Se ilumina en Paso 5) */}
                        <g transform="translate(50, 16)" opacity={currentStep >= 5 ? 1 : 0.4}>
                            <rect x="0" y="0" width="84" height="20" rx="6" fill="#0f172a" stroke={currentStep === 5 ? '#c084fc' : 'rgba(56,189,248,0.4)'} strokeWidth={currentStep === 5 ? 2 : 1} />
                            <text x="42" y="14" textAnchor="middle" fill={currentStep === 5 ? '#c084fc' : '#38bdf8'} fontSize="9.5" fontWeight="900">IT = 1.0 A ➔</text>
                        </g>

                        {/* ── RAMA 1: RESISTENCIA R1 (20 Ω) ── */}
                        <g transform="translate(168, 88)" filter={currentStep === 1 || currentStep === 3 ? 'drop-shadow(0 0 10px #facc15)' : 'none'}>
                            <rect x="0" y="0" width="24" height="48" rx="8" fill="url(#pvisResistorGrad)" stroke="#d97706" strokeWidth="1.5" />
                            {/* Bandas de Color: 20 Ω (Rojo, Negro, Negro, Dorado) */}
                            <rect x="0" y="8" width="24" height="4" fill="#ef4444" />
                            <rect x="0" y="16" width="24" height="4" fill="#18181b" />
                            <rect x="0" y="24" width="24" height="4" fill="#18181b" />
                            <rect x="0" y="36" width="24" height="3" fill="#b45309" />
                        </g>

                        {/* Badges Rama 1 */}
                        {/* Voltaje V1 = 12V (Paso 2) */}
                        <g transform="translate(155, 62)" opacity={currentStep >= 2 ? 1 : 0.25}>
                            <rect x="0" y="0" width="50" height="18" rx="5" fill="#064e3b" stroke="#34d399" strokeWidth={currentStep === 2 ? 2 : 1} />
                            <text x="25" y="13" textAnchor="middle" fill="#34d399" fontSize="9.5" fontWeight="900">V₁ = 12V</text>
                        </g>

                        {/* Resistencia R1 = 20 Ω */}
                        <g transform="translate(196, 102)">
                            <text x="0" y="14" fill="#fde047" fontSize="10" fontWeight="900">R₁=20Ω</text>
                        </g>

                        {/* Corriente I1 = 0.6A (Paso 3) */}
                        <g transform="translate(150, 144)" opacity={currentStep >= 3 ? 1 : 0.25}>
                            <rect x="0" y="0" width="60" height="18" rx="5" fill="#0f172a" stroke="#38bdf8" strokeWidth={currentStep === 3 ? 2 : 1} />
                            <text x="30" y="13" textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="900">I₁ = 0.6 A</text>
                        </g>

                        {/* ── RAMA 2: RESISTENCIA R2 (30 Ω) ── */}
                        <g transform="translate(308, 88)" filter={currentStep === 1 || currentStep === 4 ? 'drop-shadow(0 0 10px #facc15)' : 'none'}>
                            <rect x="0" y="0" width="24" height="48" rx="8" fill="url(#pvisResistorGrad)" stroke="#d97706" strokeWidth="1.5" />
                            {/* Bandas de Color: 30 Ω (Naranja, Negro, Negro, Dorado) */}
                            <rect x="0" y="8" width="24" height="4" fill="#f97316" />
                            <rect x="0" y="16" width="24" height="4" fill="#18181b" />
                            <rect x="0" y="24" width="24" height="4" fill="#18181b" />
                            <rect x="0" y="36" width="24" height="3" fill="#b45309" />
                        </g>

                        {/* Badges Rama 2 */}
                        {/* Voltaje V2 = 12V (Paso 2) */}
                        <g transform="translate(295, 62)" opacity={currentStep >= 2 ? 1 : 0.25}>
                            <rect x="0" y="0" width="50" height="18" rx="5" fill="#064e3b" stroke="#34d399" strokeWidth={currentStep === 2 ? 2 : 1} />
                            <text x="25" y="13" textAnchor="middle" fill="#34d399" fontSize="9.5" fontWeight="900">V₂ = 12V</text>
                        </g>

                        {/* Resistencia R2 = 30 Ω */}
                        <g transform="translate(336, 102)">
                            <text x="0" y="14" fill="#fde047" fontSize="10" fontWeight="900">R₂=30Ω</text>
                        </g>

                        {/* Corriente I2 = 0.4A (Paso 4) */}
                        <g transform="translate(290, 144)" opacity={currentStep >= 4 ? 1 : 0.25}>
                            <rect x="0" y="0" width="60" height="18" rx="5" fill="#0f172a" stroke="#38bdf8" strokeWidth={currentStep === 4 ? 2 : 1} />
                            <text x="30" y="13" textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="900">I₂ = 0.4 A</text>
                        </g>

                        {/* ── BARRA RESUMEN INFERIOR EN EL SVG (Paso 5) ── */}
                        <g transform="translate(190, 208)" opacity={currentStep === 5 ? 1 : 0.7}>
                            <rect 
                                x="-130" 
                                y="-12" 
                                width="260" 
                                height="24" 
                                rx="8" 
                                fill="rgba(15, 23, 42, 0.95)" 
                                stroke={currentStep === 5 ? '#c084fc' : 'rgba(255, 255, 255, 0.15)'} 
                                strokeWidth={currentStep === 5 ? 2 : 1} 
                            />
                            <text x="0" y="4" textAnchor="middle" fill="#cbd5e1" fontSize="10.5" fontWeight="800">
                                <tspan fill="#facc15">Req = 12 Ω</tspan>  |  <tspan fill={currentStep === 5 ? '#c084fc' : '#94a3b8'}>Itotal = 0.6A + 0.4A = 1.0A</tspan>
                            </text>
                        </g>
                    </svg>
                </div>
            </div>
        </div>
    );
}
