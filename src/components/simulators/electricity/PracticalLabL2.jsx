import React, { useState, useCallback, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Target, Trophy, RefreshCw, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles, Zap, ArrowRight, BookOpen, Check, Layers, ChevronRight, ChevronLeft } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

// ── Efectos de Audio y Confeti de Celebración ────────────────────────────────
const playCelebrationSound = () => {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        // Acorde Mayor triunfal ascendente: C5, E5, G5, C6
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

            gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + i * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.38);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime + i * 0.08);
            osc.stop(ctx.currentTime + i * 0.08 + 0.42);
        });
    } catch {
        // Fallback silencioso
    }
};

const triggerConfettiFromElement = (element) => {
    try {
        let x = 0.5;
        let y = 0.5;

        if (element) {
            const rect = element.getBoundingClientRect();
            x = (rect.left + rect.width / 2) / window.innerWidth;
            y = (rect.top + rect.height / 3) / window.innerHeight;
        }

        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: Math.max(0.15, x - 0.08), y: Math.max(0.1, y) },
            colors: ['#38bdf8', '#34d399', '#f59e0b', '#c084fc', '#ec4899']
        });
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: Math.min(0.85, x + 0.08), y: Math.max(0.1, y) },
            colors: ['#38bdf8', '#34d399', '#f59e0b', '#c084fc', '#ec4899']
        });
    } catch {
        // Fallback silencioso
    }
};

// ── BANCO DE 8 EJERCICIOS GUIADOS CON CIRCUITO ESQUEMÁTICO ───────────────────
const CIRCUIT_EXERCISES = [
    {
        id: 1,
        title: 'Ejercicio 1: Cálculo de Corriente en Linterna',
        desc: 'Una batería de 9 V alimenta una resistencia de carga de 3 Ω en un circuito simple.',
        targetVar: 'I',
        unit: 'A',
        V: 9,
        I: 3,
        R: 3,
        correct: 3,
        formula: 'I = V / R',
        stepMath: 'I = 9 V / 3 Ω = 3 A',
        hint: 'Para calcular la corriente (I), divide el voltaje entre la resistencia.'
    },
    {
        id: 2,
        title: 'Ejercicio 2: Voltaje de Batería de Motocicleta',
        desc: 'Por el circuito fluye una corriente de 2 A a través de un foco con resistencia de 6 Ω.',
        targetVar: 'V',
        unit: 'V',
        V: 12,
        I: 2,
        R: 6,
        correct: 12,
        formula: 'V = I × R',
        stepMath: 'V = 2 A × 6 Ω = 12 V',
        hint: 'Para calcular el voltaje (V), multiplica la corriente por la resistencia.'
    },
    {
        id: 3,
        title: 'Ejercicio 3: Resistencia de Bobina en Motor DC',
        desc: 'Una fuente de 24 V genera una corriente de 4 A cuando el circuito está en marcha.',
        targetVar: 'R',
        unit: 'Ω',
        V: 24,
        I: 4,
        R: 6,
        correct: 6,
        formula: 'R = V / I',
        stepMath: 'R = 24 V / 4 A = 6 Ω',
        hint: 'Para calcular la resistencia (R), divide el voltaje entre la corriente.'
    },
    {
        id: 4,
        title: 'Ejercicio 4: Corriente en Fuente de Laboratorio',
        desc: 'Una fuente regulada a 20 V se conecta a un resistor cerámico de 5 Ω.',
        targetVar: 'I',
        unit: 'A',
        V: 20,
        I: 4,
        R: 5,
        correct: 4,
        formula: 'I = V / R',
        stepMath: 'I = 20 V / 5 Ω = 4 A',
        hint: 'Aplica la fórmula del triángulo para corriente: I = V / R.'
    },
    {
        id: 5,
        title: 'Ejercicio 5: Voltaje en Banco de Baterías',
        desc: 'Se registra una corriente de 5 A atravesando un resistor de potencia de 12 Ω.',
        targetVar: 'V',
        unit: 'V',
        V: 60,
        I: 5,
        R: 12,
        correct: 60,
        formula: 'V = I × R',
        stepMath: 'V = 5 A × 12 Ω = 60 V',
        hint: 'El voltaje es el producto directo de la corriente por la resistencia.'
    },
    {
        id: 6,
        title: 'Ejercicio 6: Resistencia en Controlador Eléctrico',
        desc: 'Un sistema alimentado con 48 V consume exactamente una corriente de 6 A.',
        targetVar: 'R',
        unit: 'Ω',
        V: 48,
        I: 6,
        R: 8,
        correct: 8,
        formula: 'R = V / I',
        stepMath: 'R = 48 V / 6 A = 8 Ω',
        hint: 'Despeja R del triángulo: R = V / I.'
    },
    {
        id: 7,
        title: 'Ejercicio 7: Corriente en Calefactor Eléctrico',
        desc: 'Un elemento calefactor con resistencia de 24 Ω se conecta a una red de 120 V.',
        targetVar: 'I',
        unit: 'A',
        V: 120,
        I: 5,
        R: 24,
        correct: 5,
        formula: 'I = V / R',
        stepMath: 'I = 120 V / 24 Ω = 5 A',
        hint: 'Divide el voltaje total entre la resistencia del calefactor.'
    },
    {
        id: 8,
        title: 'Ejercicio 8: Resistencia en Horno Industrial',
        desc: 'Un horno térmico conectado a 220 V demanda una corriente continua de 10 A.',
        targetVar: 'R',
        unit: 'Ω',
        V: 220,
        I: 10,
        R: 22,
        correct: 22,
        formula: 'R = V / I',
        stepMath: 'R = 220 V / 10 A = 22 Ω',
        hint: 'Calcula la resistencia dividiendo 220 V entre 10 A.'
    },
    {
        id: 9,
        title: 'Ejercicio 9: Potencia en Faro de Coche (Ley de Watt)',
        desc: 'Un faro halógeno conectado a una batería de 12 V consume una corriente de 4 A.',
        targetVar: 'P',
        unit: 'W',
        V: 12,
        I: 4,
        R: 3,
        P: 48,
        correct: 48,
        formula: 'P = V × I',
        stepMath: 'P = 12 V × 4 A = 48 W',
        hint: 'Aplica la Ley de Watt: Potencia (P) = Voltaje (V) × Corriente (I).'
    },
    {
        id: 10,
        title: 'Ejercicio 10: Resistencia desde Potencia y Voltaje (Ohm y Watt)',
        desc: 'Un calefactor disipa una potencia de 600 W al conectarse a una red de 120 V. ¿Cuál es su resistencia R?',
        targetVar: 'R',
        unit: 'Ω',
        V: 120,
        I: 5,
        R: 24,
        P: 600,
        correct: 24,
        formula: 'R = V² / P  (o  I = P / V  →  R = V / I)',
        stepMath: '1) I = 600 W / 120 V = 5 A  →  2) R = 120 V / 5 A = 24 Ω  (o R = 120² / 600 = 24 Ω)',
        hint: 'Halla primero la corriente con I = P / V (600 / 120 = 5 A) y luego la resistencia con R = V / I (120 / 5 = 24 Ω).'
    }
];

// ── BANCO DE ESCENARIOS PARA EL CENTRO DE ENTRENAMIENTO ALEATORIO ────────────
const REAL_CONTEXTS = {
    V: [
        { name: 'Faro Automotriz', desc: 'Un foco halógeno para automóvil opera con una corriente de {I} A y su filamento tiene una resistencia de {R} Ω.' },
        { name: 'Tira LED de Iluminación', desc: 'Una sección de tira LED consume {I} A y presenta una resistencia interna de {R} Ω.' },
        { name: 'Ventilador de Refrigeración', desc: 'El motor de un ventilador de gabinete consume {I} A con una resistencia de bobinado de {R} Ω.' },
        { name: 'Cargador Rápido', desc: 'Un módulo de carga rápida inyecta {I} A a una batería con resistencia de carga de {R} Ω.' },
    ],
    I: [
        { name: 'Batería de Carro y Bombilla', desc: 'Se conecta una bombilla de {R} Ω a una batería de {V} V de corriente continua.' },
        { name: 'Enchufe y Cautín de Soldar', desc: 'Un cautín eléctrico con resistencia de {R} Ω se enchufa a una red eléctrica de {V} V.' },
        { name: 'Fuente de Laboratorio', desc: 'Una fuente regulada entrega {V} V a través de una resistencia de prueba de {R} Ω.' },
        { name: 'Panel Solar y Carga', desc: 'Un panel solar proporciona {V} V directos a una resistencia de {R} Ω.' },
    ],
    R: [
        { name: 'Calefactor Eléctrico', desc: 'Un calefactor conectado a {V} V consume una corriente constante de {I} A.' },
        { name: 'Electrodoméstico de Taller', desc: 'Una herramienta eléctrica conectada a {V} V registra una corriente de {I} A en su amperímetro.' },
        { name: 'Resistencia Limitadora', desc: 'Al aplicar una tensión de {V} V, fluye una corriente medida de {I} A.' },
        { name: 'Sensor Industrial', desc: 'Un sensor alimentado a {V} V registra un paso de corriente de {I} A.' },
    ],
    P: [
        { name: 'Faro Halógeno Automotriz', desc: 'Un foco halógeno de automóvil opera con {V} V y consume {I} A. Calcula su potencia en Watts.' },
        { name: 'Cautín de Soldadura', desc: 'Un cautín eléctrico conectado a {V} V consume {I} A de corriente. Calcula la potencia térmica en Watts.' },
        { name: 'Motor de Taladro', desc: 'Un taladro portátil alimentado con {V} V demanda {I} A bajo carga media. Calcula la potencia en Watts.' },
        { name: 'Calentador de Inmersión', desc: 'Una resistencia de calefacción opera a {V} V con una corriente de {I} A. Determina su potencia en Watts.' }
    ]
};

export default function PracticalLabL2() {
    // Pestaña activa principal: 'circuit' (10 Ejercicios con Circuito) | 'endless' (Centro de Entrenamiento)
    const [activeTab, setActiveTab] = useState('circuit');

    // ── ESTADOS DE LA PESTAÑA: 10 EJERCICIOS CON CIRCUITO ────────────────────
    const [exerciseIndex, setExerciseIndex] = useState(0);
    const [circuitUserAnswer, setCircuitUserAnswer] = useState('');
    const [circuitFeedback, setCircuitFeedback] = useState(null); // null | 'correct' | 'wrong'
    const [solvedExercises, setSolvedExercises] = useState({}); // { [id]: true }
    const currentEx = CIRCUIT_EXERCISES[exerciseIndex];
    const circuitModalRef = useRef(null);

    // ── ESTADOS DEL CENTRO DE ENTRENAMIENTO ALEATORIO ─────────────────────────
    const [practiceTarget, setPracticeTarget] = useState('all');
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [showSolution, setShowSolution] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const endlessModalRef = useRef(null);

    // Generador aleatorio
    const generateProblem = useCallback((forcedTarget = null) => {
        const mode = forcedTarget || practiceTarget;
        const targetVar = mode === 'all'
            ? ['V', 'I', 'R', 'P'][Math.floor(Math.random() * 4)]
            : mode;

        const I = Math.floor(Math.random() * 9) + 2;
        const R = Math.floor(Math.random() * 19) + 2;
        const V = I * R;
        const P = V * I;

        const contexts = REAL_CONTEXTS[targetVar];
        const ctx = contexts[Math.floor(Math.random() * contexts.length)];
        const story = ctx.desc
            .replace('{V}', V)
            .replace('{I}', I)
            .replace('{R}', R);

        let correct = 0;
        let unit = '';
        let formula = '';
        let stepMath = '';

        if (targetVar === 'V') {
            correct = V;
            unit = 'V';
            formula = 'V = I × R';
            stepMath = `V = ${I} A × ${R} Ω = ${V} V`;
        } else if (targetVar === 'I') {
            correct = I;
            unit = 'A';
            formula = 'I = V / R';
            stepMath = `I = ${V} V / ${R} Ω = ${I} A`;
        } else if (targetVar === 'R') {
            correct = R;
            unit = 'Ω';
            formula = 'R = V / I';
            stepMath = `R = ${V} V / ${I} A = ${R} Ω`;
        } else {
            correct = P;
            unit = 'W';
            formula = 'P = V × I';
            stepMath = `P = ${V} V × ${I} A = ${P} W`;
        }

        return {
            targetVar,
            title: ctx.name,
            story,
            V,
            I,
            R,
            P,
            correct,
            unit,
            formula,
            stepMath
        };
    }, [practiceTarget]);

    const [currentProblem, setCurrentProblem] = useState(() => generateProblem('all'));

    // Handlers para 10 Ejercicios con Circuito
    const handleCheckCircuit = () => {
        if (!circuitUserAnswer || isNaN(circuitUserAnswer)) return;
        const val = parseFloat(circuitUserAnswer);

        if (Math.round(val) === currentEx.correct) {
            setCircuitFeedback('correct');
            setSolvedExercises(prev => ({ ...prev, [currentEx.id]: true }));
            playCelebrationSound();
            if (circuitModalRef.current) {
                triggerConfettiFromElement(circuitModalRef.current);
            }
        } else {
            setCircuitFeedback('wrong');
        }
    };

    const handleSelectExercise = (idx) => {
        setExerciseIndex(idx);
        setCircuitUserAnswer('');
        setCircuitFeedback(null);
    };

    const handleNextCircuit = () => {
        if (exerciseIndex < CIRCUIT_EXERCISES.length - 1) {
            handleSelectExercise(exerciseIndex + 1);
        }
    };

    const handlePrevCircuit = () => {
        if (exerciseIndex > 0) {
            handleSelectExercise(exerciseIndex - 1);
        }
    };

    // Handlers para Centro de Entrenamiento
    const handleSelectTarget = (target) => {
        setPracticeTarget(target);
        setShowSolution(false);
        setShowCelebration(false);
        setUserAnswer('');
        setFeedback(null);
        setCurrentProblem(generateProblem(target));
    };

    const handleCheckEndless = () => {
        if (!userAnswer || isNaN(userAnswer)) return;
        const val = parseFloat(userAnswer);

        if (Math.round(val) === currentProblem.correct) {
            setFeedback(null);
            setShowCelebration(true);
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > bestStreak) setBestStreak(newStreak);
            playCelebrationSound();
            if (endlessModalRef.current) {
                triggerConfettiFromElement(endlessModalRef.current);
            }
        } else {
            setFeedback('wrong');
            setStreak(0);
        }
    };

    const handleNextEndless = () => {
        setShowSolution(false);
        setShowCelebration(false);
        setUserAnswer('');
        setFeedback(null);
        setCurrentProblem(generateProblem());
    };

    return (
        <div className="sim-card" style={{ maxWidth: '920px', margin: '0 auto', position: 'relative' }}>
            {/* ── BARRA SUPERIOR DE PESTAÑAS PRINCIPALES ── */}
            <div style={{
                display: 'flex',
                background: '#090e1a',
                borderBottom: '1.5px solid rgba(255,255,255,0.08)',
                padding: '8px 12px',
                gap: '8px',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={() => setActiveTab('circuit')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        border: 'none',
                        background: activeTab === 'circuit' ? '#38bdf8' : 'rgba(255,255,255,0.04)',
                        color: activeTab === 'circuit' ? '#0f172a' : '#94a3b8',
                        fontWeight: 900,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        transition: 'all 0.18s'
                    }}
                >
                    <span>🔌 10 Retos de Ohm y Watt</span>
                    <span style={{
                        background: activeTab === 'circuit' ? '#0f172a' : 'rgba(56, 189, 248, 0.2)',
                        color: activeTab === 'circuit' ? '#38bdf8' : '#38bdf8',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 800
                    }}>
                        {Object.keys(solvedExercises).length}/10 Resueltos
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('endless')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        border: 'none',
                        background: activeTab === 'endless' ? '#f59e0b' : 'rgba(255,255,255,0.04)',
                        color: activeTab === 'endless' ? '#0f172a' : '#94a3b8',
                        fontWeight: 900,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        transition: 'all 0.18s'
                    }}
                >
                    <span>🎯 Centro de Entrenamiento (Infinito)</span>
                    <span style={{
                        background: activeTab === 'endless' ? '#0f172a' : 'rgba(245, 158, 11, 0.2)',
                        color: activeTab === 'endless' ? '#fbbf24' : '#fbbf24',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 800
                    }}>
                        🔥 Racha: {streak}
                    </span>
                </button>
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* PESTAÑA 1: 8 EJERCICIOS CON CIRCUITO REAL (BATERÍA + RESISTOR)   */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'circuit' && (
                <div>
                    {/* Selector de Píldoras de Ejercicios 1 a 8 */}
                    <div style={{
                        padding: '0.85rem 1.25rem',
                        background: 'rgba(15, 23, 42, 0.65)',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px'
                    }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>
                            Selecciona un Reto:
                        </span>

                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {CIRCUIT_EXERCISES.map((ex, idx) => {
                                const isCurrent = idx === exerciseIndex;
                                const isSolved = !!solvedExercises[ex.id];

                                return (
                                    <button
                                        key={ex.id}
                                        onClick={() => handleSelectExercise(idx)}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            border: `1.5px solid ${isCurrent ? '#38bdf8' : isSolved ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                                            background: isCurrent ? '#38bdf8' : isSolved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                                            color: isCurrent ? '#0f172a' : isSolved ? '#34d399' : '#cbd5e1',
                                            fontWeight: 900,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        {isSolved && !isCurrent ? <Check size={16} strokeWidth={3} /> : ex.id}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="sim-card-body" ref={circuitModalRef} style={{ padding: '1.25rem' }}>
                        {/* Cabecera del Ejercicio */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                                <h4 style={{ color: '#38bdf8', margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>⚡ {currentEx.title}</span>
                                    {solvedExercises[currentEx.id] && (
                                        <span style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                                            ✓ Resuelto
                                        </span>
                                    )}
                                </h4>
                                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: '4px 0 0' }}>
                                    {currentEx.desc}
                                </p>
                            </div>

                            <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid #38bdf8', padding: '4px 12px', borderRadius: '8px', color: '#38bdf8', fontSize: '0.78rem', fontWeight: 800 }}>
                                Incógnita: {currentEx.targetVar} ({currentEx.unit})
                            </div>
                        </div>

                        {/* Contenedor Principal: Esquema del Circuito + Panel de Cálculo */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(280px, 1fr)', gap: '1.25rem', alignItems: 'start' }}>

                            {/* ── ESQUEMA DEL CIRCUITO ELECTRÓNICO CON BATERÍA Y RESISTOR ── */}
                            <div style={{
                                background: 'linear-gradient(180deg, #090e1a 0%, #0f172a 100%)',
                                border: '1.5px solid rgba(255,255,255,0.08)',
                                borderRadius: '18px',
                                padding: '1rem',
                                textAlign: 'center'
                            }}>
                                <div style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                                    📐 Diagrama del Circuito:
                                </div>

                                <svg viewBox="0 0 400 200" width="100%" height="190" style={{ maxWidth: '400px' }}>
                                    <defs>
                                        <linearGradient id="batteryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#1e293b" />
                                            <stop offset="50%" stopColor="#334155" />
                                            <stop offset="100%" stopColor="#0f172a" />
                                        </linearGradient>

                                        <linearGradient id="resistorBodyMini" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#eedec8" />
                                            <stop offset="40%" stopColor="#d8be9b" />
                                            <stop offset="100%" stopColor="#a7865c" />
                                        </linearGradient>
                                    </defs>

                                    {/* ── LAZO DE CONDUCTORES (CABLES) ── */}
                                    <rect x="90" y="30" width="220" height="140" fill="none" stroke="#64748b" strokeWidth="4" rx="12" />

                                    {/* Flechas de sentido de la corriente I en el cable superior */}
                                    <g transform="translate(200, 24)">
                                        <polygon points="0,5 9,0 0,-5" fill="#34d399" />
                                        <text x="-4" y="-8" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold">
                                            Corriente (I) →
                                        </text>
                                    </g>

                                    {/* ── ETIQUETA DE VOLTAJE (UBICADA AL LADO IZQUIERDO DE LA BATERÍA) ── */}
                                    <g transform="translate(6, 89)">
                                        <rect x="0" y="0" width="64" height="24" rx="6" fill="#0f172a" stroke={currentEx.targetVar === 'V' ? '#f59e0b' : '#38bdf8'} strokeWidth="1.5" />
                                        <text x="32" y="16" textAnchor="middle" fill={currentEx.targetVar === 'V' ? '#fbbf24' : '#38bdf8'} fontSize="11" fontWeight="900" fontFamily="monospace">
                                            {currentEx.targetVar === 'V' ? '? V' : `${currentEx.V} V`}
                                        </text>
                                    </g>

                                    {/* ── BATERÍA / FUENTE (Lado Izquierdo, X=75..105, Y=70..130) ── */}
                                    <g transform="translate(75, 70)">
                                        <rect x="0" y="0" width="30" height="60" rx="4" fill="url(#batteryGrad)" stroke="#38bdf8" strokeWidth="1.5" />
                                        <rect x="9" y="-5" width="12" height="5" rx="1.5" fill="#ef4444" />
                                        <text x="15" y="20" textAnchor="middle" fill="#ef4444" fontSize="13" fontWeight="900">+</text>
                                        <text x="15" y="48" textAnchor="middle" fill="#38bdf8" fontSize="15" fontWeight="900">−</text>
                                    </g>

                                    {/* ── RESISTENCIA / CARGA (Lado Derecho SIN BANDAS, X=295..325, Y=76..124) ── */}
                                    <g transform="translate(295, 76)">
                                        <rect x="0" y="0" width="30" height="48" rx="8" fill="url(#resistorBodyMini)" stroke="#784e2d" strokeWidth="1.5" />
                                    </g>

                                    {/* ── ETIQUETA DE RESISTENCIA (UBICADA AL LADO DERECHO DEL RESISTOR) ── */}
                                    <g transform="translate(330, 89)">
                                        <rect x="0" y="0" width="64" height="24" rx="6" fill="#0f172a" stroke={currentEx.targetVar === 'R' ? '#f59e0b' : '#c084fc'} strokeWidth="1.5" />
                                        <text x="32" y="16" textAnchor="middle" fill={currentEx.targetVar === 'R' ? '#fbbf24' : '#c084fc'} fontSize="11" fontWeight="900" fontFamily="monospace">
                                            {currentEx.targetVar === 'R' ? '? Ω' : `${currentEx.R} Ω`}
                                        </text>
                                    </g>

                                    {/* ── ETIQUETA DE POTENCIA (SI EL EJERCICIO INCLUYE WATTS) ── */}
                                    {currentEx.P && (
                                        <g transform="translate(272, 42)">
                                            <rect x="0" y="0" width="76" height="22" rx="6" fill="#0f172a" stroke={currentEx.targetVar === 'P' ? '#f59e0b' : '#34d399'} strokeWidth="1.5" />
                                            <text x="38" y="15" textAnchor="middle" fill={currentEx.targetVar === 'P' ? '#fbbf24' : '#34d399'} fontSize="11" fontWeight="900" fontFamily="monospace">
                                                {currentEx.targetVar === 'P' ? 'P = ? W' : `P = ${currentEx.P} W`}
                                            </text>
                                        </g>
                                    )}

                                    {/* ── ETIQUETA DE CORRIENTE (Centro del cable inferior) ── */}
                                    <g transform="translate(200, 170)">
                                        <rect x="-42" y="-12" width="84" height="24" rx="6" fill="#0f172a" stroke={currentEx.targetVar === 'I' ? '#f59e0b' : '#34d399'} strokeWidth="1.5" />
                                        <text x="0" y="4" textAnchor="middle" fill={currentEx.targetVar === 'I' ? '#fbbf24' : '#34d399'} fontSize="11" fontWeight="900" fontFamily="monospace">
                                            I = {currentEx.targetVar === 'I' ? '? A' : `${currentEx.I} A`}
                                        </text>
                                    </g>
                                </svg>

                                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '6px' }}>
                                    💡 Los valores conocidos se indican en el circuito; el signo <strong>?</strong> señala la incógnita a calcular.
                                </div>
                            </div>

                            {/* ── PANEL DE RESOLUCIÓN Y VALIDACIÓN ── */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                                {/* Datos Resumidos */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                    <div style={{
                                        background: currentEx.targetVar === 'V' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)',
                                        border: `1.5px solid ${currentEx.targetVar === 'V' ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                                        borderRadius: '10px',
                                        padding: '8px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ color: '#38bdf8', fontSize: '0.7rem', fontWeight: 800 }}>Voltaje (V)</div>
                                        <div style={{ color: currentEx.targetVar === 'V' ? '#fbbf24' : 'white', fontSize: '1.1rem', fontWeight: 900 }}>
                                            {currentEx.targetVar === 'V' ? '?' : `${currentEx.V} V`}
                                        </div>
                                    </div>

                                    <div style={{
                                        background: currentEx.targetVar === 'I' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)',
                                        border: `1.5px solid ${currentEx.targetVar === 'I' ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                                        borderRadius: '10px',
                                        padding: '8px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ color: currentEx.id === 10 ? '#34d399' : '#34d399', fontSize: '0.7rem', fontWeight: 800 }}>
                                            {currentEx.id === 10 ? 'Potencia (P)' : 'Corriente (I)'}
                                        </div>
                                        <div style={{ color: currentEx.targetVar === 'I' ? '#fbbf24' : 'white', fontSize: '1.1rem', fontWeight: 900 }}>
                                            {currentEx.id === 10 ? `${currentEx.P} W` : currentEx.targetVar === 'I' ? '?' : `${currentEx.I} A`}
                                        </div>
                                    </div>

                                    <div style={{
                                        background: (currentEx.targetVar === 'R' || currentEx.targetVar === 'P') ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)',
                                        border: `1.5px solid ${(currentEx.targetVar === 'R' || currentEx.targetVar === 'P') ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                                        borderRadius: '10px',
                                        padding: '8px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ color: currentEx.targetVar === 'P' ? '#fbbf24' : '#c084fc', fontSize: '0.7rem', fontWeight: 800 }}>
                                            {currentEx.targetVar === 'P' ? 'Potencia (P)' : 'Resistencia (R)'}
                                        </div>
                                        <div style={{ color: (currentEx.targetVar === 'R' || currentEx.targetVar === 'P') ? '#fbbf24' : 'white', fontSize: '1.1rem', fontWeight: 900 }}>
                                            {currentEx.targetVar === 'P' ? '? W' : currentEx.targetVar === 'R' ? '?' : `${currentEx.R} Ω`}
                                        </div>
                                    </div>
                                </div>

                                {/* Formulario de Respuesta */}
                                <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.1rem' }}>
                                    <label style={{ display: 'block', color: '#fbbf24', fontSize: '0.82rem', fontWeight: 800, marginBottom: '8px' }}>
                                        🎯 Ingresa el valor calculado para {currentEx.targetVar} ({currentEx.unit}):
                                    </label>

                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <input
                                                type="number"
                                                value={circuitUserAnswer}
                                                onChange={e => { setCircuitUserAnswer(e.target.value); setCircuitFeedback(null); }}
                                                placeholder={`Ingresa el valor numérico...`}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 40px 10px 12px',
                                                    background: 'rgba(0,0,0,0.3)',
                                                    border: '1.5px solid rgba(255,255,255,0.15)',
                                                    borderRadius: '10px',
                                                    color: 'white',
                                                    fontSize: '1rem',
                                                    fontWeight: 700,
                                                    outline: 'none'
                                                }}
                                                onKeyDown={e => e.key === 'Enter' && handleCheckCircuit()}
                                            />
                                            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 800 }}>
                                                {currentEx.unit}
                                            </span>
                                        </div>

                                        <button
                                            onClick={handleCheckCircuit}
                                            disabled={!circuitUserAnswer}
                                            style={{
                                                background: '#38bdf8',
                                                color: '#0f172a',
                                                border: 'none',
                                                borderRadius: '10px',
                                                padding: '10px 20px',
                                                fontWeight: 900,
                                                fontSize: '0.9rem',
                                                cursor: circuitUserAnswer ? 'pointer' : 'not-allowed',
                                                opacity: circuitUserAnswer ? 1 : 0.6,
                                                transition: 'all 0.15s'
                                            }}
                                        >
                                            Validar
                                        </button>
                                    </div>

                                    {/* Feedback de resultado */}
                                    {circuitFeedback === 'correct' && (
                                        <div style={{ marginTop: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1.5px solid #10b981', borderRadius: '10px', padding: '10px', color: '#34d399', fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <CheckCircle2 size={18} />
                                            <span>¡Correcto! {currentEx.targetVar} = {currentEx.correct} {currentEx.unit}</span>
                                        </div>
                                    )}

                                    {circuitFeedback === 'wrong' && (
                                        <div style={{ marginTop: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1.5px solid #ef4444', borderRadius: '10px', padding: '10px', color: '#f87171', fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <AlertCircle size={18} />
                                            <span>Respuesta incorrecta. Revisa el despeje de la fórmula y vuelve a intentar.</span>
                                        </div>
                                    )}
                                </div>

                                {/* Navegación Anterior / Siguiente Ejercicio */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                    <button
                                        onClick={handlePrevCircuit}
                                        disabled={exerciseIndex === 0}
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: exerciseIndex === 0 ? '#475569' : '#cbd5e1',
                                            borderRadius: '8px',
                                            padding: '8px 14px',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            cursor: exerciseIndex === 0 ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <ChevronLeft size={16} /> Anterior
                                    </button>

                                    <button
                                        onClick={handleNextCircuit}
                                        disabled={exerciseIndex === CIRCUIT_EXERCISES.length - 1}
                                        style={{
                                            background: 'rgba(56, 189, 248, 0.15)',
                                            border: '1px solid #38bdf8',
                                            color: exerciseIndex === CIRCUIT_EXERCISES.length - 1 ? '#475569' : '#38bdf8',
                                            borderRadius: '8px',
                                            padding: '8px 16px',
                                            fontSize: '0.8rem',
                                            fontWeight: 800,
                                            cursor: exerciseIndex === CIRCUIT_EXERCISES.length - 1 ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        Siguiente <ChevronRight size={16} />
                                    </button>
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* PESTAÑA 2: CENTRO DE ENTRENAMIENTO INFINITO (ALEATORIO CON RACHA)  */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'endless' && (
                <div>
                    {/* Modal de Celebración al Acertar en Entrenamiento */}
                    {showCelebration && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(15, 23, 42, 0.88)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 50,
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem',
                            animation: 'fadeIn 0.3s ease-out'
                        }}>
                            <div
                                ref={endlessModalRef}
                                style={{
                                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                    border: '2px solid #10b981',
                                    boxShadow: '0 20px 50px rgba(16, 185, 129, 0.3)',
                                    borderRadius: '24px',
                                    padding: '2rem 2.5rem',
                                    textAlign: 'center',
                                    maxWidth: '420px',
                                    width: '100%'
                                }}
                            >
                                <div style={{ fontSize: '3.5rem', marginBottom: '8px', animation: 'bounce 1s infinite' }}>
                                    🎉
                                </div>
                                <h3 style={{ color: '#34d399', fontSize: '1.6rem', fontWeight: 900, margin: '0 0 8px' }}>
                                    ¡Excelente Cálculo!
                                </h3>
                                <div style={{
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    padding: '10px 16px',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    fontWeight: 800,
                                    fontFamily: 'monospace',
                                    margin: '12px 0'
                                }}>
                                    {currentProblem.targetVar} = {currentProblem.correct} {currentProblem.unit}
                                </div>
                                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
                                    🔥 Racha de aciertos: <strong>{streak} seguidas</strong>
                                </p>
                                <button
                                    onClick={handleNextEndless}
                                    autoFocus
                                    style={{
                                        background: '#10b981',
                                        color: '#0f172a',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '12px 28px',
                                        fontWeight: 900,
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span>Siguiente Reto</span>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Cabecera Principal de Entrenamiento */}
                    <div className="sim-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h3>🎯 Centro de Entrenamiento: Ley de Ohm y Watt</h3>
                            <p>Pon a prueba tus habilidades de cálculo con el triángulo matemático y escenarios reales ilimitados</p>
                        </div>

                        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '12px', padding: '6px 16px', textAlign: 'center' }}>
                            <div style={{ color: '#34d399', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>Racha de Aciertos</div>
                            <div style={{ color: 'white', fontSize: '1.15rem', fontWeight: 900 }}>🔥 {streak}</div>
                        </div>
                    </div>

                    {/* Selector de Modos de Práctica */}
                    <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                            ¿Qué variable deseas entrenar?
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => handleSelectTarget('all')}
                                style={{
                                    background: practiceTarget === 'all' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.04)',
                                    border: `1.5px solid ${practiceTarget === 'all' ? '#38bdf8' : 'rgba(255,255,255,0.08)'}`,
                                    color: practiceTarget === 'all' ? '#38bdf8' : '#cbd5e1',
                                    fontWeight: 800,
                                    fontSize: '0.78rem',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                🎲 Mixto (Todos)
                            </button>
                            <button
                                onClick={() => handleSelectTarget('V')}
                                style={{
                                    background: practiceTarget === 'V' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.04)',
                                    border: `1.5px solid ${practiceTarget === 'V' ? '#38bdf8' : 'rgba(255,255,255,0.08)'}`,
                                    color: practiceTarget === 'V' ? '#38bdf8' : '#cbd5e1',
                                    fontWeight: 800,
                                    fontSize: '0.78rem',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                ⚡ Voltaje (V)
                            </button>
                            <button
                                onClick={() => handleSelectTarget('I')}
                                style={{
                                    background: practiceTarget === 'I' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255,255,255,0.04)',
                                    border: `1.5px solid ${practiceTarget === 'I' ? '#34d399' : 'rgba(255,255,255,0.08)'}`,
                                    color: practiceTarget === 'I' ? '#34d399' : '#cbd5e1',
                                    fontWeight: 800,
                                    fontSize: '0.78rem',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                🌊 Corriente (I)
                            </button>
                            <button
                                onClick={() => handleSelectTarget('R')}
                                style={{
                                    background: practiceTarget === 'R' ? 'rgba(192, 132, 252, 0.2)' : 'rgba(255,255,255,0.04)',
                                    border: `1.5px solid ${practiceTarget === 'R' ? '#c084fc' : 'rgba(255,255,255,0.08)'}`,
                                    color: practiceTarget === 'R' ? '#c084fc' : '#cbd5e1',
                                    fontWeight: 800,
                                    fontSize: '0.78rem',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                🛑 Resistencia (R)
                            </button>
                            <button
                                onClick={() => handleSelectTarget('P')}
                                style={{
                                    background: practiceTarget === 'P' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.04)',
                                    border: `1.5px solid ${practiceTarget === 'P' ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                                    color: practiceTarget === 'P' ? '#fbbf24' : '#cbd5e1',
                                    fontWeight: 800,
                                    fontSize: '0.78rem',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                💡 Potencia (P)
                            </button>
                        </div>
                    </div>

                    <div className="sim-card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '1.75rem', alignItems: 'start' }}>

                            {/* Triángulo Visual Dinámico */}
                            <div style={{
                                background: 'rgba(15, 23, 42, 0.7)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '20px',
                                padding: '1.5rem 1.25rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}>
                                <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
                                    🔺 Despeje de la Incógnita:
                                </div>

                                <svg viewBox="0 0 240 210" width="100%" height="180" style={{ maxWidth: '240px' }}>
                                    <polygon points="120,15 20,195 220,195" fill="#0f172a" stroke="#f59e0b" strokeWidth="3" strokeLinejoin="round" />
                                    <polygon
                                        points="120,15 70,105 170,105"
                                        fill={currentProblem.targetVar === 'V' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(56, 189, 248, 0.08)'}
                                        stroke="#38bdf8"
                                        strokeWidth={currentProblem.targetVar === 'V' ? '3' : '1'}
                                    />
                                    <line x1="70" y1="105" x2="170" y2="105" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
                                    <line x1="120" y1="105" x2="120" y2="195" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
                                    <polygon
                                        points="70,105 20,195 120,195 120,105"
                                        fill={currentProblem.targetVar === 'I' ? 'rgba(52, 211, 153, 0.35)' : 'rgba(52, 211, 153, 0.08)'}
                                        stroke="#34d399"
                                        strokeWidth={currentProblem.targetVar === 'I' ? '3' : '1'}
                                    />
                                    <polygon
                                        points="170,105 120,105 120,195 220,195"
                                        fill={currentProblem.targetVar === 'R' ? 'rgba(192, 132, 252, 0.35)' : 'rgba(192, 132, 252, 0.08)'}
                                        stroke="#c084fc"
                                        strokeWidth={currentProblem.targetVar === 'R' ? '3' : '1'}
                                    />
                                    <text x="120" y="70" textAnchor="middle" fill="#38bdf8" fontSize="30" fontWeight="900" fontFamily="system-ui, sans-serif">
                                        {currentProblem.targetVar === 'V' ? '?' : 'V'}
                                    </text>
                                    <text x="120" y="90" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                                        {currentProblem.targetVar === 'V' ? 'INCÓGNITA' : `${currentProblem.V} V`}
                                    </text>
                                    <text x="75" y="150" textAnchor="middle" fill="#34d399" fontSize="28" fontWeight="900" fontFamily="system-ui, sans-serif">
                                        {currentProblem.targetVar === 'I' ? '?' : 'I'}
                                    </text>
                                    <text x="75" y="172" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                                        {currentProblem.targetVar === 'I' ? 'INCÓGNITA' : `${currentProblem.I} A`}
                                    </text>
                                    <text x="165" y="150" textAnchor="middle" fill="#c084fc" fontSize="28" fontWeight="900" fontFamily="system-ui, sans-serif">
                                        {currentProblem.targetVar === 'R' ? '?' : 'R'}
                                    </text>
                                    <text x="165" y="172" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                                        {currentProblem.targetVar === 'R' ? 'INCÓGNITA' : `${currentProblem.R} Ω`}
                                    </text>
                                </svg>

                                <div style={{
                                    marginTop: '12px',
                                    padding: '8px 14px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    textAlign: 'center',
                                    width: '100%'
                                }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Fórmula a Utilizar</div>
                                    <div style={{
                                        color: currentProblem.targetVar === 'V' ? '#38bdf8' : currentProblem.targetVar === 'I' ? '#34d399' : '#c084fc',
                                        fontSize: '1.3rem',
                                        fontWeight: 900,
                                        fontFamily: 'monospace',
                                        marginTop: '2px'
                                    }}>
                                        {currentProblem.formula}
                                    </div>
                                </div>
                            </div>

                            {/* Enunciado y Resolución */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{
                                    background: 'rgba(15, 23, 42, 0.7)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderLeft: '4px solid #f59e0b',
                                    borderRadius: '16px',
                                    padding: '1.25rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                            📌 Caso Práctico: {currentProblem.title}
                                        </span>
                                        <span style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                                            Incógnita: {currentProblem.targetVar} ({currentProblem.unit})
                                        </span>
                                    </div>
                                    <p style={{ color: '#e2e8f0', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                                        {currentProblem.story}
                                    </p>
                                </div>

                                {/* Datos Conocidos */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                    <div style={{
                                        background: currentProblem.targetVar === 'V' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.03)',
                                        border: `1.5px solid ${currentProblem.targetVar === 'V' ? '#38bdf8' : 'rgba(255,255,255,0.06)'}`,
                                        borderRadius: '12px',
                                        padding: '10px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ color: '#38bdf8', fontSize: '0.72rem', fontWeight: 800 }}>Voltaje (V)</div>
                                        <div style={{ color: currentProblem.targetVar === 'V' ? '#38bdf8' : 'white', fontSize: '1.25rem', fontWeight: 900 }}>
                                            {currentProblem.targetVar === 'V' ? '?' : `${currentProblem.V} V`}
                                        </div>
                                    </div>

                                    <div style={{
                                        background: currentProblem.targetVar === 'I' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.03)',
                                        border: `1.5px solid ${currentProblem.targetVar === 'I' ? '#34d399' : 'rgba(255,255,255,0.06)'}`,
                                        borderRadius: '12px',
                                        padding: '10px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ color: '#34d399', fontSize: '0.72rem', fontWeight: 800 }}>Corriente (I)</div>
                                        <div style={{ color: currentProblem.targetVar === 'I' ? '#34d399' : 'white', fontSize: '1.25rem', fontWeight: 900 }}>
                                            {currentProblem.targetVar === 'I' ? '?' : `${currentProblem.I} A`}
                                        </div>
                                    </div>

                                    <div style={{
                                        background: currentProblem.targetVar === 'R' ? 'rgba(192, 132, 252, 0.15)' : 'rgba(255,255,255,0.03)',
                                        border: `1.5px solid ${currentProblem.targetVar === 'R' ? '#c084fc' : 'rgba(255,255,255,0.06)'}`,
                                        borderRadius: '12px',
                                        padding: '10px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ color: '#c084fc', fontSize: '0.72rem', fontWeight: 800 }}>Resistencia (R)</div>
                                        <div style={{ color: currentProblem.targetVar === 'R' ? '#c084fc' : 'white', fontSize: '1.25rem', fontWeight: 900 }}>
                                            {currentProblem.targetVar === 'R' ? '?' : `${currentProblem.R} Ω`}
                                        </div>
                                    </div>
                                </div>

                                {/* Entrada y Validación */}
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                                    <button
                                        onClick={() => setShowSolution(prev => !prev)}
                                        title={showSolution ? 'Ocultar Solución' : 'Ver Solución'}
                                        style={{
                                            background: showSolution ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                                            color: showSolution ? '#38bdf8' : '#94a3b8',
                                            border: `1.5px solid ${showSolution ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                                            borderRadius: '12px',
                                            padding: '12px 14px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {showSolution ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>

                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <input
                                            type="number"
                                            value={userAnswer}
                                            onChange={e => { setUserAnswer(e.target.value); setFeedback(null); }}
                                            placeholder={`Ingresa el valor de ${currentProblem.targetVar}...`}
                                            style={{
                                                width: '100%',
                                                padding: '12px 42px 12px 14px',
                                                background: 'rgba(0,0,0,0.3)',
                                                border: '1.5px solid rgba(255,255,255,0.15)',
                                                borderRadius: '12px',
                                                color: 'white',
                                                fontSize: '1rem',
                                                fontWeight: 700,
                                                outline: 'none'
                                            }}
                                            onKeyDown={e => e.key === 'Enter' && handleCheckEndless()}
                                        />
                                        <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 800 }}>
                                            {currentProblem.unit}
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleCheckEndless}
                                        disabled={!userAnswer}
                                        style={{
                                            background: '#38bdf8',
                                            color: '#0f172a',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '12px 20px',
                                            fontWeight: 900,
                                            fontSize: '0.9rem',
                                            cursor: userAnswer ? 'pointer' : 'not-allowed',
                                            opacity: userAnswer ? 1 : 0.6,
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Validar
                                    </button>

                                    <button
                                        onClick={handleNextEndless}
                                        style={{
                                            background: 'rgba(245,158,11,0.15)',
                                            color: '#fbbf24',
                                            border: '1px solid #f59e0b',
                                            borderRadius: '12px',
                                            padding: '12px 16px',
                                            fontWeight: 800,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0
                                        }}
                                    >
                                        <RefreshCw size={15} /> Siguiente
                                    </button>
                                </div>

                                {feedback === 'wrong' && (
                                    <div style={{
                                        background: 'rgba(239, 68, 68, 0.15)',
                                        border: '1.5px solid #ef4444',
                                        borderRadius: '12px',
                                        padding: '12px 16px',
                                        color: '#f87171',
                                        fontWeight: 800,
                                        fontSize: '0.92rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <AlertCircle size={18} />
                                        Respuesta incorrecta. Vuelve a calcular o abre "Ver Solución".
                                    </div>
                                )}

                                {showSolution && (
                                    <div style={{
                                        background: 'rgba(56, 189, 248, 0.08)',
                                        border: '1px solid rgba(56, 189, 248, 0.3)',
                                        borderRadius: '14px',
                                        padding: '14px 18px',
                                        color: '#cbd5e1',
                                        fontSize: '0.88rem'
                                    }}>
                                        <strong style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                            💡 Despeje y Solución Paso a Paso:
                                        </strong>
                                        <div style={{ lineHeight: '1.6' }}>
                                            1. Aplicamos la fórmula del triángulo: <code>{currentProblem.formula}</code><br />
                                            2. Reemplazamos los valores: <code>{currentProblem.stepMath}</code><br />
                                            3. Resultado: <strong style={{ color: 'white' }}>{currentProblem.correct} {currentProblem.unit}</strong>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
