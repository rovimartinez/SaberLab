import { useState, useEffect } from 'react';
import { Zap, CheckCircle2, Play, RotateCcw, ChevronRight, Sparkles } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

export default function SeriesCalculationVisualizer() {
    // currentStep: 0 = inicial (oculto/listo), 1..5 = pasos revelados
    const [currentStep, setCurrentStep] = useState(1);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);

    // Pasos interactivos con fórmula, resultado y explicación pedagógica
    const stepsData = [
        {
            num: 1,
            title: 'Paso 1 · Sumar Resistencias (Regla 3)',
            hint: 'Req = R₁ + R₂',
            calc: 'Req = 40 Ω + 80 Ω =',
            result: '120 Ω',
            color: '#facc15',
            bg: 'rgba(250, 204, 21, 0.15)',
            border: 'rgba(250, 204, 21, 0.4)',
            explanation: 'En un circuito serie, las resistencias se suman directamente para hallar la Resistencia Equivalente (Req).'
        },
        {
            num: 2,
            title: 'Paso 2 · Calcular Corriente Total (Regla 1)',
            hint: 'I = V / Req',
            calc: 'I = 24 V / 120 Ω =',
            result: '0.2 A (200 mA)',
            color: '#38bdf8',
            bg: 'rgba(56, 189, 248, 0.15)',
            border: 'rgba(56, 189, 248, 0.4)',
            explanation: 'Aplicamos la Ley de Ohm con el voltaje de la fuente y la Req. Esta corriente de 0.2 A es idéntica en todo el lazo.'
        },
        {
            num: 3,
            title: 'Paso 3 · Caída de Voltaje en R₁ (40 Ω)',
            hint: 'V₁ = I × R₁',
            calc: 'V₁ = 0.2 A × 40 Ω =',
            result: '8 V',
            color: '#34d399',
            bg: 'rgba(52, 211, 153, 0.15)',
            border: 'rgba(52, 211, 153, 0.4)',
            explanation: 'Multiplicamos la corriente que atraviesa R₁ por su valor en Ohms. R₁ consume 8 Volts.'
        },
        {
            num: 4,
            title: 'Paso 4 · Caída de Voltaje en R₂ (80 Ω)',
            hint: 'V₂ = I × R₂',
            calc: 'V₂ = 0.2 A × 80 Ω =',
            result: '16 V',
            color: '#34d399',
            bg: 'rgba(52, 211, 153, 0.15)',
            border: 'rgba(52, 211, 153, 0.4)',
            explanation: 'Multiplicamos la misma corriente por R₂ (80 Ω). Al tener el doble de resistencia, consume el doble: 16 Volts.'
        },
        {
            num: 5,
            title: 'Paso 5 · Comprobación de Kirchhoff (Regla 2)',
            hint: 'Vfuente = V₁ + V₂',
            calc: '8 V + 16 V =',
            result: '24 V ✅ (Igual a la fuente)',
            color: '#c084fc',
            bg: 'rgba(192, 132, 252, 0.18)',
            border: 'rgba(192, 132, 252, 0.4)',
            explanation: 'La suma de las caídas de voltaje (8V + 16V) devuelve exactamente los 24V suministrados por la batería.'
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
            background: 'linear-gradient(145deg, #090e1a 0%, #0f172a 100%)',
            border: '1.5px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
            color: '#f8fafc'
        }}>
            {/* Encabezado con Controles Interactivos */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', borderRadius: '10px', padding: '8px', display: 'flex' }}>
                        <Zap size={22} color="#38bdf8" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#38bdf8', fontWeight: 800 }}>
                            Animación Guiada: Cálculo Paso a Paso
                        </h4>
                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                            Haz clic en cada paso o presiona <strong>"Siguiente Paso"</strong> para ver el procedimiento
                        </p>
                    </div>
                </div>

                {/* Botones de Control de la Animación */}
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

            {/* Layout Principal en 2 Columnas */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
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
                                    padding: '10px 14px',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    boxShadow: isCurrent ? `0 0 16px ${step.bg}` : 'none',
                                    opacity: isRevealed ? 1 : 0.45
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                                    <span style={{ color: isRevealed ? step.color : '#64748b', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {isCurrent && <Sparkles size={14} color={step.color} />}
                                        {step.title}
                                    </span>
                                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace' }}>{step.hint}</span>
                                </div>

                                {isRevealed ? (
                                    <div style={{ 
                                        color: '#ffffff', 
                                        fontFamily: 'monospace', 
                                        fontSize: '0.95rem', 
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        animation: isCurrent ? 'fadeIn 0.3s ease-in' : 'none'
                                    }}>
                                        <span>{step.calc}</span>
                                        <span style={{ 
                                            color: step.color, 
                                            fontSize: '1.05rem', 
                                            fontWeight: 900,
                                            background: isCurrent ? 'rgba(0,0,0,0.4)' : 'transparent',
                                            padding: '1px 6px',
                                            borderRadius: '4px'
                                        }}>
                                            {step.result}
                                        </span>
                                    </div>
                                ) : (
                                    <div style={{ color: '#64748b', fontSize: '0.82rem', fontStyle: 'italic' }}>
                                        Haz clic para desbloquear este cálculo...
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Explicación Dinámica del Paso Activo */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        borderLeft: `4px solid ${stepsData[currentStep - 1]?.color || '#38bdf8'}`,
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

                {/* ── COLUMNA DERECHA: DIAGRAMA REACTIVO SIN CABLES SOBRANTES ── */}
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
                            {/* Gradiente de Batería */}
                            <linearGradient id="visBatteryGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#0284c7" />
                                <stop offset="30%" stopColor="#0369a1" />
                                <stop offset="70%" stopColor="#075985" />
                                <stop offset="100%" stopColor="#0c4a6e" />
                            </linearGradient>

                            {/* Gradiente de Cerámica de Resistencia */}
                            <linearGradient id="visResistorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#fef3c7" />
                                <stop offset="40%" stopColor="#fde68a" />
                                <stop offset="80%" stopColor="#fcd34d" />
                                <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>

                            {/* Resplandor para Electrones */}
                            <filter id="visParticleGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="2.5" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* ── CABLE CONDUCTOR AZUL BRILLANTE (Conexión vertical directa a bornes) ── */}
                        <path 
                            d="M 30 99 L 30 45 L 350 45 L 350 185 L 30 185 L 30 157" 
                            fill="none" 
                            stroke="#0284c7" 
                            strokeWidth="5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                        />
                        <path 
                            d="M 30 99 L 30 45 L 350 45 L 350 185 L 30 185 L 30 157" 
                            fill="none" 
                            stroke="#38bdf8" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                        />
                        {/* Cable intermedio entre R1 y R2 */}
                        <line x1="195" y1="45" x2="255" y2="45" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

                        {/* ── ELECTRÓN ANIMADO (Flujo activo) ── */}
                        {currentStep >= 2 && [0, 1.3, 2.6, 3.9, 5.2, 6.5].map((offset, i) => (
                            <circle key={i} r="4" fill="#67e8f9" stroke="#ffffff" strokeWidth="1" filter="url(#visParticleGlow)">
                                <animateMotion
                                    dur="7.8s"
                                    repeatCount="indefinite"
                                    begin={`-${offset}s`}
                                    path="M 30 45 L 350 45 L 350 185 L 30 185 Z"
                                />
                            </circle>
                        ))}

                        {/* ── BATERÍA 24V (Lado Izquierdo) ── */}
                        <g transform="translate(15, 105)" filter={currentStep === 2 || currentStep === 5 ? 'drop-shadow(0 0 8px #38bdf8)' : 'none'}>
                            {/* Borne positivo superior metálico */}
                            <rect x="11" y="-6" width="8" height="6" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                            {/* Cuerpo cilíndrico */}
                            <rect x="0" y="0" width="30" height="52" rx="6" fill="url(#visBatteryGrad)" stroke="#38bdf8" strokeWidth="1.8" />
                            {/* Corona dorada superior */}
                            <rect x="0" y="0" width="30" height="14" rx="3" fill="#eab308" />
                            <text x="15" y="11" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="900">+</text>
                            <text x="15" y="46" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="900">−</text>
                        </g>

                        {/* Badge de la Batería 24V */}
                        <g transform="translate(52, 120)">
                            <rect x="0" y="0" width="50" height="22" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                            <text x="25" y="15" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="900">24 V</text>
                        </g>

                        {/* Badge de Corriente I = 0.2A (Se ilumina en Paso 2) */}
                        <g transform="translate(48, 20)" opacity={currentStep >= 2 ? 1 : 0.35}>
                            <rect x="0" y="0" width="76" height="20" rx="6" fill="#0f172a" stroke={currentStep === 2 ? '#38bdf8' : 'rgba(56,189,248,0.4)'} strokeWidth={currentStep === 2 ? 2 : 1} />
                            <text x="38" y="14" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="900">I = 0.2 A ➔</text>
                        </g>

                        {/* ── RESISTENCIA 1 (R1 = 40 Ω | V1 = 8 V) ── */}
                        <g transform="translate(135, 33)" filter={currentStep === 1 || currentStep === 3 ? 'drop-shadow(0 0 10px #facc15)' : 'none'}>
                            {/* Terminales axiales */}
                            <line x1="-15" y1="12" x2="0" y2="12" stroke="#cbd5e1" strokeWidth="2.5" />
                            <line x1="60" y1="12" x2="75" y2="12" stroke="#cbd5e1" strokeWidth="2.5" />
                            {/* Cuerpo Cerámico Beige/Ámbar */}
                            <rect x="0" y="0" width="60" height="24" rx="8" fill="url(#visResistorGrad)" stroke="#d97706" strokeWidth="1.5" />
                            {/* Bandas de Color: 40 Ω (Amarillo, Negro, Negro, Dorado) */}
                            <rect x="10" y="0" width="5" height="24" fill="#eab308" />
                            <rect x="20" y="0" width="5" height="24" fill="#18181b" />
                            <rect x="30" y="0" width="5" height="24" fill="#18181b" />
                            <rect x="44" y="0" width="4" height="24" fill="#b45309" />
                        </g>

                        {/* Badge de Caída V1 = 8V (Se ilumina en Paso 3) */}
                        <g transform="translate(142, 6)" opacity={currentStep >= 3 ? 1 : 0.25}>
                            <rect x="0" y="0" width="46" height="18" rx="5" fill="#064e3b" stroke="#34d399" strokeWidth={currentStep === 3 ? 2 : 1} />
                            <text x="23" y="13" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="900">V₁ = 8V</text>
                        </g>

                        {/* Badge de Resistencia R1 = 40 Ω */}
                        <g transform="translate(138, 62)">
                            <rect x="0" y="0" width="54" height="18" rx="5" fill="#451a03" stroke="#facc15" strokeWidth={currentStep === 1 ? 2 : 1} />
                            <text x="27" y="13" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="800">R₁ = 40Ω</text>
                        </g>

                        {/* ── RESISTENCIA 2 (R2 = 80 Ω | V2 = 16 V) ── */}
                        <g transform="translate(255, 33)" filter={currentStep === 1 || currentStep === 4 ? 'drop-shadow(0 0 10px #facc15)' : 'none'}>
                            {/* Terminales axiales */}
                            <line x1="-15" y1="12" x2="0" y2="12" stroke="#cbd5e1" strokeWidth="2.5" />
                            <line x1="60" y1="12" x2="75" y2="12" stroke="#cbd5e1" strokeWidth="2.5" />
                            {/* Cuerpo Cerámico */}
                            <rect x="0" y="0" width="60" height="24" rx="8" fill="url(#visResistorGrad)" stroke="#d97706" strokeWidth="1.5" />
                            {/* Bandas de Color: 80 Ω (Gris, Negro, Negro, Dorado) */}
                            <rect x="10" y="0" width="5" height="24" fill="#64748b" />
                            <rect x="20" y="0" width="5" height="24" fill="#18181b" />
                            <rect x="30" y="0" width="5" height="24" fill="#18181b" />
                            <rect x="44" y="0" width="4" height="24" fill="#b45309" />
                        </g>

                        {/* Badge de Caída V2 = 16V (Se ilumina en Paso 4) */}
                        <g transform="translate(260, 6)" opacity={currentStep >= 4 ? 1 : 0.25}>
                            <rect x="0" y="0" width="50" height="18" rx="5" fill="#064e3b" stroke="#34d399" strokeWidth={currentStep === 4 ? 2 : 1} />
                            <text x="25" y="13" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="900">V₂ = 16V</text>
                        </g>

                        {/* Badge de Resistencia R2 = 80 Ω */}
                        <g transform="translate(258, 62)">
                            <rect x="0" y="0" width="54" height="18" rx="5" fill="#451a03" stroke="#facc15" strokeWidth={currentStep === 1 ? 2 : 1} />
                            <text x="27" y="13" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="800">R₂ = 80Ω</text>
                        </g>

                        {/* ── BARRA RESUMEN INFERIOR EN EL SVG (Se ilumina en Paso 5) ── */}
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
                                <tspan fill="#facc15">Req = 120 Ω</tspan>  |  <tspan fill={currentStep === 5 ? '#c084fc' : '#94a3b8'}>Vtotal = 8V + 16V = 24V</tspan>
                            </text>
                        </g>
                    </svg>
                </div>

            </div>
        </div>
    );
}
