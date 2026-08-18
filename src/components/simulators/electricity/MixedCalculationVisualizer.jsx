import { useState, useEffect } from 'react';
import { Zap, CheckCircle2, Play, RotateCcw, ChevronRight, Sparkles, Layers } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

export default function MixedCalculationVisualizer() {
    // currentStep: 1..5 = pasos revelados
    const [currentStep, setCurrentStep] = useState(1);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);

    // Pasos interactivos con fórmula, cálculo, resultado y explicación para circuito mixto
    const stepsData = [
        {
            num: 1,
            title: 'Paso 1 · Reducir Bloque Paralelo (R₂ // R₃)',
            hint: 'Rp = (R₂ · R₃) / (R₂ + R₃)',
            calc: 'Rp = (30 · 60) / (30 + 60) = 1800 / 90 =',
            result: '20 Ω',
            color: '#34d399',
            bg: 'rgba(52, 211, 153, 0.15)',
            border: 'rgba(52, 211, 153, 0.4)',
            stageName: 'Circuito Mixto Original (Identificar Paralelo)',
            explanation: 'Simplificamos de adentro hacia afuera: el bloque paralelo formado por R₂ (30Ω) y R₃ (60Ω) se reduce a una sola resistencia equivalente Rp = 20Ω.'
        },
        {
            num: 2,
            title: 'Paso 2 · Reducir a Circuito Serie (R₁ + Rp)',
            hint: 'Req = R₁ + Rp',
            calc: 'Req = 10 Ω + 20 Ω =',
            result: '30 Ω',
            color: '#60a5fa',
            bg: 'rgba(96, 165, 250, 0.15)',
            border: 'rgba(96, 165, 250, 0.4)',
            stageName: 'Etapa Reducida 1: Circuito Serie (R₁ + Rp)',
            explanation: 'El circuito se redibuja como un circuito en serie simple: R₁ (10Ω) en serie con Rp (20Ω). Sumamos directamente: Req total = 30Ω.'
        },
        {
            num: 3,
            title: 'Paso 3 · Circuito Equivalente Total (Ley de Ohm)',
            hint: 'IT = V / Req',
            calc: 'IT = 24 V / 30 Ω =',
            result: '0.80 A',
            color: '#facc15',
            bg: 'rgba(250, 204, 21, 0.15)',
            border: 'rgba(250, 204, 21, 0.4)',
            stageName: 'Etapa Reducida 2: Circuito Simple (Fuente + Req)',
            explanation: 'Todo el circuito queda reducido a una única resistencia Req = 30Ω conectada a la fuente de 24V. Calculamos la corriente total: IT = 0.80A.'
        },
        {
            num: 4,
            title: 'Paso 4 · Desplegar Voltajes (V₁ y Vp)',
            hint: 'V₁ = IT · R₁, Vp = V - V₁',
            calc: 'V₁ = 0.8·10 = 8V · Vp = 24 - 8 =',
            result: '16 V en paralelo',
            color: '#fbbf24',
            bg: 'rgba(251, 191, 36, 0.15)',
            border: 'rgba(251, 191, 36, 0.4)',
            stageName: 'Cálculo Inverso: Distribución de Voltajes (LVK)',
            explanation: 'Regresamos al circuito original: IT (0.80A) pasa por R₁ causando una caída de 8V. El voltaje restante (24V - 8V = 16V) alimenta el paralelo.'
        },
        {
            num: 5,
            title: 'Paso 5 · Corrientes de Rama y LCK',
            hint: 'I₂ = Vp / R₂, I₃ = Vp / R₃',
            calc: 'I₂ = 16/30 = 0.53A · I₃ = 16/60 = 0.27A →',
            result: '0.80 A ✅',
            color: '#c084fc',
            bg: 'rgba(192, 132, 252, 0.18)',
            border: 'rgba(192, 132, 252, 0.4)',
            stageName: 'Balance Final: Corrientes de Rama y Kirchhoff',
            explanation: 'Calculamos las corrientes: 16V / 30Ω = 0.533A e 16V / 60Ω = 0.267A. La suma (0.533A + 0.267A = 0.80A) comprueba la Ley de Kirchhoff.'
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
            }, 2000);
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

    const currentStage = stepsData[currentStep - 1];

    return (
        <div style={{
            maxWidth: '960px',
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
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fbbf24', fontWeight: 800 }}>
                            Animación Guiada: Reducción Progresiva de Circuitos Mixtos
                        </h4>
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                            Observa cómo el circuito se simplifica visualmente etapa por etapa hasta llegar a la resistencia total y calcular corrientes.
                        </p>
                    </div>
                </div>

                {/* Botones de Control */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                        onClick={handleNextStep}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: '#0f172a',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '8px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
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
                            background: isAutoPlaying ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                            color: isAutoPlaying ? '#34d399' : '#e2e8f0',
                            border: `1px solid ${isAutoPlaying ? '#34d399' : 'rgba(255, 255, 255, 0.15)'}`,
                            borderRadius: '10px',
                            padding: '8px 12px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: isAutoPlaying ? 'default' : 'pointer'
                        }}
                    >
                        <Play size={14} fill={isAutoPlaying ? '#34d399' : 'currentColor'} />
                        <span>{isAutoPlaying ? 'Animando...' : 'Animar Auto'}</span>
                    </button>

                    <button
                        onClick={handleReset}
                        style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: '#94a3b8',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '10px',
                            padding: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Restablecer"
                    >
                        <RotateCcw size={15} />
                    </button>
                </div>
            </div>

            {/* Layout de 2 Columnas Lado a Lado */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
                gap: '16px',
                alignItems: 'stretch'
            }}>
                {/* Columna Izquierda: Tarjetas de los 5 Pasos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {stepsData.map((s) => {
                        const isUnlocked = currentStep >= s.num;
                        const isCurrent = currentStep === s.num;

                        return (
                            <div
                                key={s.num}
                                onClick={() => { setIsAutoPlaying(false); setCurrentStep(s.num); }}
                                style={{
                                    background: isCurrent ? s.bg : isUnlocked ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0.25)',
                                    border: `1.5px solid ${isCurrent ? s.border : isUnlocked ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)'}`,
                                    borderRadius: '12px',
                                    padding: '10px 12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.25s ease',
                                    opacity: isUnlocked ? 1 : 0.45,
                                    transform: isCurrent ? 'scale(1.01)' : 'scale(1)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                             width: '20px',
                                             height: '20px',
                                             borderRadius: '50%',
                                             background: isCurrent ? s.color : isUnlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                                             color: isCurrent ? '#0f172a' : '#cbd5e1',
                                             display: 'flex',
                                             alignItems: 'center',
                                             justifyContent: 'center',
                                             fontSize: '0.72rem',
                                             fontWeight: 900
                                         }}>
                                             {s.num}
                                         </div>
                                         <span style={{ fontSize: '0.84rem', fontWeight: 800, color: isCurrent ? s.color : '#e2e8f0' }}>
                                             {s.title}
                                         </span>
                                     </div>
                                     {isUnlocked && <CheckCircle2 size={15} color={s.color} />}
                                 </div>
 
                                 {isUnlocked && (
                                     <>
                                         <div style={{
                                             display: 'flex',
                                             alignItems: 'center',
                                             justifyContent: 'space-between',
                                             fontFamily: 'monospace',
                                             fontSize: '0.8rem',
                                             background: 'rgba(0, 0, 0, 0.35)',
                                             padding: '5px 8px',
                                             borderRadius: '6px',
                                             margin: '4px 0'
                                         }}>
                                             <span style={{ color: '#cbd5e1' }}>{s.calc}</span>
                                             <strong style={{ color: s.color, fontSize: '0.88rem' }}>{s.result}</strong>
                                         </div>
                                         {isCurrent && (
                                             <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.35 }}>
                                                 💡 {s.explanation}
                                             </p>
                                         )}
                                     </>
                                 )}
                             </div>
                         );
                     })}
                 </div>
 
                 {/* Columna Derecha: Esquema Visual que se Reduce Progresivamente */}
                 <div style={{
                     background: 'radial-gradient(circle at center, #0f172a 0%, #090e1a 100%)',
                     border: '1.5px solid rgba(255, 255, 255, 0.08)',
                     borderRadius: '16px',
                     padding: '12px',
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'space-between',
                     position: 'relative'
                 }}>
                     <div style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                         <Layers size={14} color="#f59e0b" />
                         <span>{currentStage.stageName}</span>
                     </div>
 
                     {/* SVG Reactivo del Circuito Mixto Reduciéndose con Geometría Fija y Rieles al Ras */}
                     <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <svg viewBox="0 0 350 205" width="100%" height="200" xmlns="http://www.w3.org/2000/svg">
                             <defs>
                                 <linearGradient id="batGradMixedCalc" x1="0%" y1="0%" x2="100%" y2="0%">
                                     <stop offset="0%" stopColor="#0284c7" />
                                     <stop offset="100%" stopColor="#0369a1" />
                                 </linearGradient>
                                 <filter id="glowMixedCalc" x="-50%" y="-50%" width="200%" height="200%">
                                     <feGaussianBlur stdDeviation="2" result="blur" />
                                     <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                 </filter>
                             </defs>
 
                             {/* ═══════════════ CASO 1: ETAPA REDUCIDA 2 (PASO 3: MONOMALLA TOTAL Req = 30Ω) ═══════════════ */}
                             {currentStep === 3 ? (
                                 <g>
                                     {/* Rieles del circuito simple unificados en azul eléctrico */}
                                     <line x1="35" y1="40" x2="260" y2="40" stroke="#38bdf8" strokeWidth="2.5" />
                                     <line x1="35" y1="165" x2="260" y2="165" stroke="#38bdf8" strokeWidth="2.5" />
 
                                     {/* Batería / Fuente 24V (Fija en Y=77.5) */}
                                     <g transform="translate(20, 77.5)">
                                         <line x1="15" y1="-37.5" x2="15" y2="0" stroke="#38bdf8" strokeWidth="2.5" />
                                         <line x1="15" y1="50" x2="15" y2="87.5" stroke="#38bdf8" strokeWidth="2.5" />
                                         <rect x="0" y="0" width="30" height="50" rx="4" fill="url(#batGradMixedCalc)" stroke="#38bdf8" strokeWidth="1.5" />
                                         <rect x="9" y="-4" width="12" height="4" rx="1.5" fill="#ef4444" />
                                         <text x="15" y="18" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="900">+</text>
                                         <text x="15" y="42" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900">−</text>
                                         <text x="-12" y="28" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="900">24V</text>
                                     </g>
 
                                     {/* Resistencia Equivalente Total Req = 30Ω */}
                                     <g transform="translate(260, 40)">
                                         <line x1="0" y1="0" x2="0" y2="35" stroke="#38bdf8" strokeWidth="2.5" />
                                         <rect x="-14" y="35" width="28" height="55" rx="6" fill="#1e293b" stroke="#facc15" strokeWidth="2" />
                                         <line x1="0" y1="90" x2="0" y2="125" stroke="#38bdf8" strokeWidth="2.5" />
                                         <text x="22" y="58" fill="#facc15" fontSize="10" fontWeight="900">Req Total</text>
                                         <text x="22" y="76" fill="#f8fafc" fontSize="12" fontWeight="900">30 Ω</text>
                                     </g>
 
                                     {/* Medidor de Corriente Total IT = 0.80 A (En riel inferior despejado) */}
                                     <g transform="translate(135, 165)">
                                         <rect x="-44" y="-12" width="88" height="24" rx="12" fill="#090e1a" stroke="#facc15" strokeWidth="1.5" />
                                         <text x="0" y="4" textAnchor="middle" fill="#facc15" fontSize="9.5" fontWeight="900" fontFamily="monospace">
                                             IT = 0.80 A
                                         </text>
                                     </g>
 
                                     {/* Electrones en lazo simple */}
                                     <g filter="url(#glowMixedCalc)">
                                         <circle r="3.5" fill="#facc15">
                                             <animateMotion dur="2.4s" repeatCount="indefinite" path="M 35 40 L 260 40 L 260 165 L 35 165 L 35 40 Z" />
                                         </circle>
                                         <circle r="3.5" fill="#facc15">
                                             <animateMotion dur="2.4s" begin="-1.2s" repeatCount="indefinite" path="M 35 40 L 260 40 L 260 165 L 35 165 L 35 40 Z" />
                                         </circle>
                                     </g>
                                 </g>
                             ) : currentStep === 2 ? (
                                 /* ═══════════════ CASO 2: ETAPA REDUCIDA 1 (PASO 2: CIRCUITO SERIE R1 + Rp) ═══════════════ */
                                 <g>
                                     {/* Rieles del circuito serie unificados */}
                                     <line x1="35" y1="40" x2="260" y2="40" stroke="#38bdf8" strokeWidth="2.5" />
                                     <line x1="35" y1="165" x2="260" y2="165" stroke="#38bdf8" strokeWidth="2.5" />
 
                                     {/* Batería / Fuente (Fija en Y=77.5) */}
                                     <g transform="translate(20, 77.5)">
                                         <line x1="15" y1="-37.5" x2="15" y2="0" stroke="#38bdf8" strokeWidth="2.5" />
                                         <line x1="15" y1="50" x2="15" y2="87.5" stroke="#38bdf8" strokeWidth="2.5" />
                                         <rect x="0" y="0" width="30" height="50" rx="4" fill="url(#batGradMixedCalc)" stroke="#38bdf8" strokeWidth="1.5" />
                                         <rect x="9" y="-4" width="12" height="4" rx="1.5" fill="#ef4444" />
                                         <text x="15" y="18" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="900">+</text>
                                         <text x="15" y="42" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900">−</text>
                                         <text x="-12" y="28" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="900">24V</text>
                                     </g>
 
                                     {/* Resistor R1 en serie arriba */}
                                     <g transform="translate(130, 40)">
                                         <rect x="-26" y="-10" width="52" height="20" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                                         <text x="0" y="3.5" textAnchor="middle" fill="#f8fafc" fontSize="9.5" fontWeight="900">
                                             R₁: 10Ω
                                         </text>
                                     </g>
 
                                     {/* Resistor Equivalente del Paralelo Rp = 20Ω */}
                                     <g transform="translate(260, 40)">
                                         <line x1="0" y1="0" x2="0" y2="35" stroke="#38bdf8" strokeWidth="2.5" />
                                         <rect x="-14" y="35" width="28" height="55" rx="5" fill="#1e293b" stroke="#34d399" strokeWidth="2" />
                                         <line x1="0" y1="90" x2="0" y2="125" stroke="#38bdf8" strokeWidth="2.5" />
                                         <text x="22" y="58" fill="#34d399" fontSize="10" fontWeight="900">Rp</text>
                                         <text x="22" y="76" fill="#f8fafc" fontSize="12" fontWeight="900">20 Ω</text>
                                     </g>
 
                                     {/* Badge Superior Central: Suma Serie */}
                                     <g transform="translate(145, 102)">
                                         <rect x="-60" y="-12" width="120" height="24" rx="6" fill="#090e1a" stroke="#60a5fa" strokeWidth="1.5" />
                                         <text x="0" y="4" textAnchor="middle" fill="#60a5fa" fontSize="9.5" fontWeight="900">
                                             Req = 10Ω + 20Ω = 30Ω
                                         </text>
                                     </g>
                                 </g>
                             ) : (
                                 /* ═══════════════ CASO 3: CIRCUITO COMPLETO (PASOS 1, 4 Y 5) ═══════════════ */
                                 <g>
                                     {/* Rieles Superior e Inferior al ras en x=295 (Sin palitos sobrantes) */}
                                     <line x1="35" y1="40" x2="295" y2="40" stroke="#38bdf8" strokeWidth="2.5" />
                                     <line x1="35" y1="165" x2="295" y2="165" stroke="#38bdf8" strokeWidth="2.5" />
 
                                     {/* Batería / Fuente (Fija exactamente en Y=77.5) */}
                                     <g transform="translate(20, 77.5)">
                                         <line x1="15" y1="-37.5" x2="15" y2="0" stroke="#38bdf8" strokeWidth="2.5" />
                                         <line x1="15" y1="50" x2="15" y2="87.5" stroke="#38bdf8" strokeWidth="2.5" />
                                         <rect x="0" y="0" width="30" height="50" rx="4" fill="url(#batGradMixedCalc)" stroke="#38bdf8" strokeWidth="1.5" />
                                         <rect x="9" y="-4" width="12" height="4" rx="1.5" fill="#ef4444" />
                                         <text x="15" y="18" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="900">+</text>
                                         <text x="15" y="42" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900">−</text>
                                         <text x="-12" y="28" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="900">24V</text>
                                     </g>
 
                                     {/* Resistor R1 en Serie en el riel superior */}
                                     <g transform="translate(125, 40)">
                                         <rect x="-26" y="-10" width="52" height="20" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                                         <text x="0" y="3.5" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="900">
                                             R₁: 10Ω
                                         </text>
                                         {currentStep >= 4 && (
                                             <g transform="translate(0, -16)">
                                                <rect x="-24" y="-7" width="48" height="14" rx="4" fill="#090e1a" stroke="#fbbf24" strokeWidth="1.2" />
                                                <text x="0" y="3.5" textAnchor="middle" fill="#fbbf24" fontSize="7.5" fontWeight="900">V₁ = 8.0V</text>
                                             </g>
                                         )}
                                     </g>
 
                                     {/* Nodos Paralelos */}
                                     <circle cx="210" cy="40" r="3.5" fill="#38bdf8" />
                                     <circle cx="210" cy="165" r="3.5" fill="#38bdf8" />
                                     <circle cx="295" cy="40" r="3.5" fill="#38bdf8" />
                                     <circle cx="295" cy="165" r="3.5" fill="#38bdf8" />
 
                                     {/* ══ ENCERRADOR DISTINTIVO DEL BLOQUE PARALELO (PASO 1) ══ */}
                                     {currentStep === 1 && (
                                         <g>
                                             <rect x="194" y="20" width="118" height="162" rx="12" fill="rgba(16, 185, 129, 0.07)" stroke="#10b981" strokeWidth="1.8" strokeDasharray="5 4" />
                                             {/* Badge en la parte superior del encerrador */}
                                             <g transform="translate(252, 14)">
                                                 <rect x="-44" y="-9" width="88" height="18" rx="6" fill="#064e3b" stroke="#34d399" strokeWidth="1.2" />
                                                 <text x="0" y="3.5" textAnchor="middle" fill="#34d399" fontSize="8.5" fontWeight="900">
                                                     Bloque Rp = 20 Ω
                                                 </text>
                                             </g>
                                         </g>
                                     )}
 
                                     {/* Resistor R2 en Rama Paralela 1 (x = 210) */}
                                     <g transform="translate(210, 40)">
                                         <line x1="0" y1="0" x2="0" y2="35" stroke="#38bdf8" strokeWidth="2.5" />
                                         <rect x="-9" y="35" width="18" height="55" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                                         <line x1="0" y1="90" x2="0" y2="125" stroke="#38bdf8" strokeWidth="2.5" />
 
                                         {/* Etiquetas de R2 a la IZQUIERDA de la rama */}
                                         <text x="-14" y="58" textAnchor="end" fill="#f8fafc" fontSize="8.5" fontWeight="900">
                                             R₂: 30Ω
                                         </text>
                                         {currentStep >= 5 && (
                                             <text x="-14" y="74" textAnchor="end" fill="#c084fc" fontSize="8" fontWeight="800">
                                                 I₂ = 0.53A
                                             </text>
                                         )}
                                     </g>
 
                                     {/* Resistor R3 en Rama Paralela 2 (x = 295 - Sin palitos sobrantes) */}
                                     <g transform="translate(295, 40)">
                                         <line x1="0" y1="0" x2="0" y2="35" stroke="#38bdf8" strokeWidth="2.5" />
                                         <rect x="-9" y="35" width="18" height="55" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                                         <line x1="0" y1="90" x2="0" y2="125" stroke="#38bdf8" strokeWidth="2.5" />
 
                                         {/* Etiquetas de R3 a la DERECHA de la rama */}
                                         <text x="14" y="58" textAnchor="start" fill="#f8fafc" fontSize="8.5" fontWeight="900">
                                             R₃: 60Ω
                                         </text>
                                         {currentStep >= 5 && (
                                             <text x="14" y="74" textAnchor="start" fill="#c084fc" fontSize="8" fontWeight="800">
                                                 I₃ = 0.27A
                                             </text>
                                         )}
                                     </g>
 
                                     {/* Badge Superior: Voltaje Paralelo Vp = 16V (Pasos 4 y 5) */}
                                     {currentStep >= 4 && (
                                         <g transform="translate(252, 14)">
                                             <rect x="-38" y="-9" width="76" height="18" rx="5" fill="#090e1a" stroke="#34d399" strokeWidth="1.2" />
                                             <text x="0" y="3.5" textAnchor="middle" fill="#34d399" fontSize="8.5" fontWeight="900">
                                                 Vp = 16.0 V
                                             </text>
                                         </g>
                                     )}
 
                                     {/* Medidor de Corriente Total IT en el riel inferior despejado (Pasos 4 y 5) */}
                                     {currentStep >= 4 && (
                                         <g transform="translate(120, 165)">
                                             <rect x="-42" y="-11" width="84" height="22" rx="11" fill="#090e1a" stroke="#facc15" strokeWidth="1.5" />
                                             <text x="0" y="3.5" textAnchor="middle" fill="#facc15" fontSize="8.5" fontWeight="900" fontFamily="monospace">
                                                 IT = 0.80 A
                                             </text>
                                         </g>
                                     )}
 
                                     {/* Electrones Animados Bifurcándose (Paso 5) */}
                                     {currentStep === 5 && (
                                         <g filter="url(#glowMixedCalc)">
                                             <circle r="3" fill="#38bdf8">
                                                 <animateMotion dur="2.8s" repeatCount="indefinite" path="M 35 40 L 125 40 L 210 40 L 210 165 L 35 165 L 35 40 Z" />
                                             </circle>
                                             <circle r="3" fill="#c084fc">
                                                 <animateMotion dur="3.2s" repeatCount="indefinite" path="M 35 40 L 125 40 L 210 40 L 295 40 L 295 165 L 210 165 L 35 165 L 35 40 Z" />
                                             </circle>
                                         </g>
                                     )}
                                 </g>
                             )}
                         </svg>
                     </div>

                    {/* Resumen del Estado */}
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '6px 10px',
                        fontSize: '0.72rem',
                        color: '#cbd5e1',
                        textAlign: 'center'
                    }}>
                        {currentStep === 1 && <span>Etapa 1: Reducción del bloque <strong>R₂ // R₃ = 20 Ω</strong>.</span>}
                        {currentStep === 2 && <span>Etapa 2: Redibujado en serie <strong>R₁ (10Ω) + Rp (20Ω) = 30 Ω</strong>.</span>}
                        {currentStep === 3 && <span>Etapa 3: Circuito simple <strong>Req = 30Ω → IT = 24V / 30Ω = 0.80 A</strong>.</span>}
                        {currentStep === 4 && <span>Etapa 4: Caída <strong>V₁ = 8V</strong>, bloque paralelo recibe <strong>Vp = 16V</strong>.</span>}
                        {currentStep === 5 && <span>Etapa 5: <strong>I₂ (0.53A) + I₃ (0.27A) = 0.80A</strong> (LCK Cumplida ✅).</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
