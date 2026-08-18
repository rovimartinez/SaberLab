import { useState, useMemo, useEffect, useRef } from 'react';
import { Play, RotateCcw, CheckCircle2, AlertCircle, Sparkles, Zap, Award, ArrowRight, Activity, Gauge, Flame, Lightbulb, Split, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../../lib/api';
import '../../../styles/ElectricitySimulators.css';

// ── BANCO DE 10 EJERCICIOS GUIADOS DE CIRCUITOS EN PARALELO Y LCK ───────────
const PARALLEL_EXERCISES = [
    {
        id: 1,
        title: 'Reto 1: Resistencia Equivalente con 2 Resistores Iguales',
        desc: 'Dos bombillos con resistencia R₁ = 100 Ω y R₂ = 100 Ω están conectados en paralelo a una fuente de 12 V. ¿Cuál es la resistencia equivalente total Req?',
        targetVar: 'Req',
        unit: 'Ω',
        V: 12,
        R1: 100,
        R2: 100,
        R3: 0,
        correct: 50,
        formula: 'Req = (R₁ × R₂) / (R₁ + R₂)',
        stepMath: 'Req = (100 × 100) / (100 + 100) = 10000 / 200 = 50 Ω',
        hint: 'Cuando dos resistencias en paralelo tienen el mismo valor, la Req es exactamente la mitad: R / 2.'
    },
    {
        id: 2,
        title: 'Reto 2: Resistencia Equivalente con 2 Resistores Desiguales',
        desc: 'Un circuito paralelo tiene dos ramas con R₁ = 20 Ω y R₂ = 30 Ω alimentadas a 24 V. Calcula la resistencia equivalente total.',
        targetVar: 'Req',
        unit: 'Ω',
        V: 24,
        R1: 20,
        R2: 30,
        R3: 0,
        correct: 12,
        formula: 'Req = (R₁ × R₂) / (R₁ + R₂)',
        stepMath: 'Req = (20 × 30) / (20 + 30) = 600 / 50 = 12 Ω',
        hint: 'Usa la fórmula del producto dividido entre la suma: (20 × 30) / (20 + 30).'
    },
    {
        id: 3,
        title: 'Reto 3: Corriente de Rama Individual',
        desc: 'Una fuente de 24 V alimenta dos ramas en paralelo: R₁ = 6 Ω y R₂ = 12 Ω. ¿Qué corriente I₁ circula exclusivamente por la rama de R₁?',
        targetVar: 'I1',
        unit: 'A',
        V: 24,
        R1: 6,
        R2: 12,
        R3: 0,
        correct: 4,
        formula: 'I₁ = V / R₁',
        stepMath: 'I₁ = 24 V / 6 Ω = 4 A',
        hint: 'En paralelo, el voltaje en cada rama es igual al de la fuente (24 V). Aplica Ley de Ohm: I₁ = 24 / 6.'
    },
    {
        id: 4,
        title: 'Reto 4: Corriente Total del Circuito (LCK)',
        desc: 'En un circuito de 12 V en paralelo, la rama 1 consume I₁ = 2 A y la rama 2 consume I₂ = 1 A. ¿Cuál es la corriente total IT suministrada por la fuente?',
        targetVar: 'IT',
        unit: 'A',
        V: 12,
        R1: 6,
        R2: 12,
        R3: 0,
        correct: 3,
        formula: 'IT = I₁ + I₂',
        stepMath: 'IT = 2 A + 1 A = 3 A',
        hint: 'Según la Ley de Corrientes de Kirchhoff (LCK), la corriente total es la suma de las corrientes de todas las ramas.'
    },
    {
        id: 5,
        title: 'Reto 5: Divisor de Corriente con 2 Ramas',
        desc: 'Una corriente total IT = 6 A entra al nodo de un circuito con R₁ = 10 Ω y R₂ = 20 Ω. ¿Qué corriente I₁ fluye a través de R₁?',
        targetVar: 'I1',
        unit: 'A',
        V: 40,
        R1: 10,
        R2: 20,
        R3: 0,
        correct: 4,
        formula: 'I₁ = IT × [R₂ / (R₁ + R₂)]',
        stepMath: 'I₁ = 6 A × [20 / (10 + 20)] = 6 × (20/30) = 4 A',
        hint: 'En el divisor de corriente, la rama con menor resistencia (10 Ω) recibe más corriente: IT × (R₂ / (R₁ + R₂)).'
    },
    {
        id: 6,
        title: 'Reto 6: Ley de Corrientes de Kirchhoff con 3 Ramas',
        desc: 'Un nodo principal recibe una corriente total IT = 15 A y se divide en 3 ramas. Si I₁ = 4 A e I₂ = 6 A, ¿cuál es la corriente I₃ en la tercera rama?',
        targetVar: 'I3',
        unit: 'A',
        V: 60,
        R1: 15,
        R2: 10,
        R3: 12,
        correct: 5,
        formula: 'I₃ = IT - I₁ - I₂',
        stepMath: 'I₃ = 15 A - 4 A - 6 A = 5 A',
        hint: 'La suma de corrientes salientes debe igualar a la entrante: 15 - 4 - 6 = I₃.'
    },
    {
        id: 7,
        title: 'Reto 7: Resistencia Equivalente con 3 Resistores',
        desc: 'Tres resistencias de R₁ = 60 Ω, R₂ = 30 Ω y R₃ = 20 Ω se conectan en paralelo. Calcula la resistencia equivalente total Req.',
        targetVar: 'Req',
        unit: 'Ω',
        V: 60,
        R1: 60,
        R2: 30,
        R3: 20,
        correct: 10,
        formula: '1/Req = 1/R₁ + 1/R₂ + 1/R₃',
        stepMath: '1/Req = 1/60 + 1/30 + 1/20 = 1/60 + 2/60 + 3/60 = 6/60 = 1/10 → Req = 10 Ω',
        hint: 'Suma los inversos (1/60 + 1/30 + 1/20) y luego invierte el resultado: 60 / 6 = 10 Ω.'
    },
    {
        id: 8,
        title: 'Reto 8: Potencia Total Disipada en Paralelo',
        desc: 'Una fuente de 12 V alimenta dos ramas en paralelo con R₁ = 6 Ω y R₂ = 12 Ω (Req = 4 Ω). Calcula la potencia total PT entregada por la fuente.',
        targetVar: 'PT',
        unit: 'W',
        V: 12,
        R1: 6,
        R2: 12,
        R3: 0,
        correct: 36,
        formula: 'PT = V² / Req = V × IT',
        stepMath: 'PT = (12 V)² / 4 Ω = 144 / 4 = 36 W (o 12V × 3A = 36 W)',
        hint: 'Calcula primero la corriente total IT = 3A o aplica PT = V² / Req.'
    },
    {
        id: 9,
        title: 'Reto 9: Diagnóstico de Falla (Rama Abierta)',
        desc: 'Dos lámparas R₁ = 40 Ω y R₂ = 40 Ω están en paralelo con 120 V (IT inicial = 6 A). Si la lámpara 2 se funde (circuito abierto), ¿cuál es la nueva corriente total IT?',
        targetVar: 'IT',
        unit: 'A',
        V: 120,
        R1: 40,
        R2: 999999, // Abierto
        R3: 0,
        correct: 3,
        formula: 'IT = I₁ = V / R₁',
        stepMath: 'IT = 120 V / 40 Ω = 3 A (la rama 1 sigue intacta a 120 V)',
        hint: 'Al abrirse una rama, las demás siguen funcionando con el mismo voltaje: IT pasa de 6 A a 3 A.'
    },
    {
        id: 10,
        title: 'Reto 10: Dimensionamiento de Resistor en Paralelo',
        desc: 'Tienes una resistencia R₁ = 20 Ω conectada a 20 V (I₁ = 1 A). Quieres conectar una segunda resistencia R₂ en paralelo para que la corriente total IT sea de 3 A. ¿Qué valor debe tener R₂?',
        targetVar: 'R2',
        unit: 'Ω',
        V: 20,
        R1: 20,
        R2: 10,
        R3: 0,
        correct: 10,
        formula: 'R₂ = V / I₂  donde  I₂ = IT - I₁',
        stepMath: 'I₂ = 3 A - 1 A = 2 A → R₂ = 20 V / 2 A = 10 Ω',
        hint: 'La rama 2 debe consumir los 2 Amperios restantes: R₂ = 20 V / 2 A = 10 Ω.'
    }
];

export default function PracticalLabL4() {
    const [activeTab, setActiveTab] = useState('challenges'); // 'challenges' | 'sandbox'
    const [currentExIndex, setCurrentExIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [currentInput, setCurrentInput] = useState('');
    const [feedback, setFeedback] = useState(null); // { isCorrect, message }
    const [completedSet, setCompletedSet] = useState(new Set());
    const [challengeStats, setChallengeStats] = useState({}); // { [id]: { attempts, failures } }

    // Estado del Sandbox Interactivo Libre (3 ramas paralelas)
    const [sandboxVoltage, setSandboxVoltage] = useState(12);
    const [sandboxR1, setSandboxR1] = useState(20);
    const [sandboxR2, setSandboxR2] = useState(30);
    const [sandboxR3, setSandboxR3] = useState(60);

    const currentEx = PARALLEL_EXERCISES[currentExIndex];

    // Cargar historial y estado guardado en D1
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const { data } = await api('/practice?lesson_id=ee-m1-l4');
                if (data?.challenges) {
                    const done = new Set();
                    const answers = {};
                    const stats = {};
                    data.challenges.forEach((ch) => {
                        const exId = parseInt(ch.exercise_id, 10);
                        if (ch.status === 'completed') {
                            done.add(exId);
                        }
                        if (ch.user_last_input) {
                            answers[exId] = ch.user_last_input;
                        }
                        stats[exId] = {
                            attempts: ch.attempts_count || 1,
                            failures: ch.failures_count || 0
                        };
                    });
                    setCompletedSet(done);
                    setUserAnswers(answers);
                    setChallengeStats(stats);
                }
            } catch (err) {
                console.error('Error cargando historial de retos L4:', err);
            }
        };
        loadHistory();
    }, []);

    // Cálculos del Sandbox Libre
    const invReq = (1 / sandboxR1) + (1 / sandboxR2) + (1 / sandboxR3);
    const sandboxReq = invReq > 0 ? (1 / invReq) : 0;
    const sandboxI1 = sandboxVoltage / sandboxR1;
    const sandboxI2 = sandboxVoltage / sandboxR2;
    const sandboxI3 = sandboxVoltage / sandboxR3;
    const sandboxITotal = sandboxI1 + sandboxI2 + sandboxI3;
    const sandboxPTotal = sandboxVoltage * sandboxITotal;

    // Registrar interacción en el sandbox libre
    const sandboxTrackTimeoutRef = useRef(null);
    const trackSandboxInteraction = () => {
        if (sandboxTrackTimeoutRef.current) clearTimeout(sandboxTrackTimeoutRef.current);
        sandboxTrackTimeoutRef.current = setTimeout(() => {
            try {
                api('/practice', {
                    method: 'POST',
                    body: {
                        type: 'simulator_interaction',
                        simulator_id: 'practical_lab_l4_sandbox',
                        lesson_id: 'ee-m1-l4',
                        duration_seconds: 5
                    }
                });
            } catch {}
        }, 1500);
    };

    const playSuccessSound = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) {}
    };

    const handleValidate = async (e) => {
        e?.preventDefault();
        const num = parseFloat(currentInput.replace(',', '.'));
        if (isNaN(num)) {
            setFeedback({ isCorrect: false, message: 'Por favor introduce un número válido.' });
            return;
        }

        const isOk = Math.abs(num - currentEx.correct) < 0.05;

        // Registrar intento en D1
        try {
            api('/practice', {
                method: 'POST',
                body: {
                    type: 'challenge_attempt',
                    lesson_id: 'ee-m1-l4',
                    exercise_id: currentEx.id,
                    exercise_title: currentEx.title,
                    concept: currentEx.targetVar || 'paralelo',
                    is_correct: isOk,
                    user_input: num
                }
            });
        } catch {}

        setChallengeStats((prev) => {
            const currentStat = prev[currentEx.id] || { attempts: 0, failures: 0 };
            return {
                ...prev,
                [currentEx.id]: {
                    attempts: currentStat.attempts + 1,
                    failures: currentStat.failures + (isOk ? 0 : 1)
                }
            };
        });

        if (isOk) {
            playSuccessSound();
            setFeedback({
                isCorrect: true,
                message: `¡Correcto! ${currentEx.stepMath}`
            });
            const nextSet = new Set(completedSet).add(currentEx.id);
            setCompletedSet(nextSet);
            setUserAnswers(prev => ({ ...prev, [currentEx.id]: num }));

            if (nextSet.size === PARALLEL_EXERCISES.length) {
                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.6 }
                });
            }
        } else {
            setFeedback({
                isCorrect: false,
                message: `Incorrecto. ${currentEx.hint}`
            });
        }
    };

    const handleSelectExercise = (idx) => {
        setCurrentExIndex(idx);
        setCurrentInput(userAnswers[PARALLEL_EXERCISES[idx].id]?.toString() || '');
        setFeedback(null);
    };

    return (
        <div className="sim-card" style={{ maxWidth: '960px', margin: '0 auto' }}>
            {/* Header del Laboratorio */}
            <div className="sim-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <Split size={22} color="#f59e0b" />
                        Laboratorio Práctico: Circuitos en Paralelo y LCK
                    </h3>
                    <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                        Entrena el cálculo de ramas independientes, divisor de corriente y aplica la Ley de Kirchhoff.
                    </p>
                </div>

                {/* Selector de Modos */}
                <div style={{ display: 'flex', gap: '6px', background: 'rgba(15,23,42,0.8)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <button
                        className={`sim-btn ${activeTab === 'challenges' ? 'sim-btn-primary' : 'sim-btn-secondary'}`}
                        style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 800 }}
                        onClick={() => setActiveTab('challenges')}
                    >
                        <Award size={14} />
                        10 Retos Guiados ({completedSet.size}/10)
                    </button>
                    <button
                        className={`sim-btn ${activeTab === 'sandbox' ? 'sim-btn-primary' : 'sim-btn-secondary'}`}
                        style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 800 }}
                        onClick={() => setActiveTab('sandbox')}
                    >
                        <Activity size={14} />
                        Simulador Libre
                    </button>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="sim-card-body" style={{ padding: '1.25rem' }}>

                {/* ══════════════ MODO 1: 10 RETOS GUIADOS ══════════════ */}
                {activeTab === 'challenges' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {/* Barra de Progreso de Retos */}
                        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                            {PARALLEL_EXERCISES.map((ex, idx) => {
                                const isDone = completedSet.has(ex.id);
                                const isCur = idx === currentExIndex;
                                return (
                                    <button
                                        key={ex.id}
                                        onClick={() => handleSelectExercise(idx)}
                                        style={{
                                            flex: '1 0 auto',
                                            minWidth: '40px',
                                            padding: '8px 10px',
                                            borderRadius: '8px',
                                            border: isCur ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                                            background: isDone ? 'rgba(16, 185, 129, 0.2)' : isCur ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15,23,42,0.6)',
                                            color: isDone ? '#34d399' : isCur ? '#fbbf24' : '#94a3b8',
                                            fontSize: '0.8rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <span>#{ex.id}</span>
                                        {isDone && <CheckCircle2 size={12} color="#10b981" />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Panel del Reto Actual */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>

                            {/* Esquema SVG del Circuito en Paralelo */}
                            <div style={{
                                background: 'linear-gradient(180deg, #090e1a 0%, #0f172a 100%)',
                                border: '1.5px solid rgba(255,255,255,0.08)',
                                borderRadius: '16px',
                                padding: '1rem',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {currentEx.title}
                                </div>

                                <svg viewBox="0 0 320 200" width="100%" height="200" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="batGradL4" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#0284c7" />
                                            <stop offset="100%" stopColor="#0369a1" />
                                        </linearGradient>
                                        <linearGradient id="resBodyL4" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#d4a373" />
                                            <stop offset="50%" stopColor="#e9c46a" />
                                            <stop offset="100%" stopColor="#bc6c25" />
                                        </linearGradient>
                                    </defs>

                                    {/* Rieles Horizontales Principales (Terminan exactamente en la última rama activa) */}
                                    <line x1="40" y1="30" x2={currentEx.R3 > 0 ? "280" : "220"} y2="30" stroke="#475569" strokeWidth="2.5" />
                                    <line x1="40" y1="170" x2={currentEx.R3 > 0 ? "280" : "220"} y2="170" stroke="#475569" strokeWidth="2.5" />

                                    {/* Batería a la izquierda (x = 40) */}
                                    <g transform="translate(25, 75)">
                                        <line x1="15" y1="-45" x2="15" y2="0" stroke="#475569" strokeWidth="2.5" />
                                        <line x1="15" y1="50" x2="15" y2="95" stroke="#475569" strokeWidth="2.5" />
                                        <rect x="0" y="0" width="30" height="50" rx="4" fill="url(#batGradL4)" stroke="#38bdf8" strokeWidth="1.5" />
                                        <rect x="9" y="-4" width="12" height="4" rx="1.5" fill="#ef4444" />
                                        <text x="15" y="18" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="900">+</text>
                                        <text x="15" y="42" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900">−</text>
                                        <text x="-12" y="28" textAnchor="middle" fill={currentEx.targetVar === 'VT' ? '#fbbf24' : '#38bdf8'} fontSize="10" fontWeight="900">
                                            {currentEx.targetVar === 'VT' ? '? V' : `${currentEx.V}V`}
                                        </text>
                                    </g>

                                    {/* Rama 1: Resistor R1 (x = 120 con 3 ramas, x = 130 con 2 ramas) */}
                                    <g transform={`translate(${currentEx.R3 > 0 ? 120 : 130}, 30)`}>
                                        <line x1="0" y1="0" x2="0" y2="50" stroke="#475569" strokeWidth="2" />
                                        <rect x="-10" y="50" width="20" height="40" rx="4" fill="url(#resBodyL4)" stroke="#78350f" strokeWidth="1.2" />
                                        <line x1="0" y1="90" x2="0" y2="140" stroke="#475569" strokeWidth="2" />
                                        <text x="18" y="73" fill={currentEx.targetVar === 'R1' ? '#fbbf24' : '#c084fc'} fontSize="9" fontWeight="900">
                                            R₁: {currentEx.R1 === 999999 ? '∞ (Abierto)' : `${currentEx.R1}Ω`}
                                        </text>
                                        {currentEx.targetVar === 'I1' ? (
                                            <text x="18" y="56" fill="#fbbf24" fontSize="8" fontWeight="800">I₁ = ? A</text>
                                        ) : currentEx.id === 3 ? (
                                            <text x="18" y="56" fill="#38bdf8" fontSize="8" fontWeight="800">I₁ = ? A</text>
                                        ) : null}
                                    </g>

                                    {/* Rama 2: Resistor R2 (x = 200 con 3 ramas [delta=80], x = 220 con 2 ramas [delta=90]) */}
                                    <g transform={`translate(${currentEx.R3 > 0 ? 200 : 220}, 30)`}>
                                        <line x1="0" y1="0" x2="0" y2="50" stroke="#475569" strokeWidth="2" />
                                        <rect x="-10" y="50" width="20" height="40" rx="4" fill="url(#resBodyL4)" stroke={currentEx.R2 === 999999 ? '#ef4444' : '#78350f'} strokeWidth={currentEx.R2 === 999999 ? 2 : 1.2} strokeDasharray={currentEx.R2 === 999999 ? '3 2' : 'none'} />
                                        <line x1="0" y1="90" x2="0" y2="140" stroke="#475569" strokeWidth="2" />
                                        <text x="18" y="73" fill={currentEx.targetVar === 'R2' ? '#fbbf24' : currentEx.R2 === 999999 ? '#ef4444' : '#c084fc'} fontSize="9" fontWeight="900">
                                            R₂: {currentEx.R2 === 999999 ? '∞ (Abierto)' : `${currentEx.R2}Ω`}
                                        </text>
                                    </g>

                                    {/* Rama 3: Resistor R3 (x = 280 [delta=80]) */}
                                    {currentEx.R3 > 0 && (
                                        <g transform="translate(280, 30)">
                                            <line x1="0" y1="0" x2="0" y2="50" stroke="#475569" strokeWidth="2" />
                                            <rect x="-10" y="50" width="20" height="40" rx="4" fill="url(#resBodyL4)" stroke="#78350f" strokeWidth="1.2" />
                                            <line x1="0" y1="90" x2="0" y2="140" stroke="#475569" strokeWidth="2" />
                                            <text x="18" y="73" fill={currentEx.targetVar === 'R3' ? '#fbbf24' : '#c084fc'} fontSize="9" fontWeight="900">
                                                R₃: {currentEx.R3}Ω
                                            </text>
                                            {currentEx.targetVar === 'I3' && (
                                                <text x="18" y="56" fill="#fbbf24" fontSize="8" fontWeight="800">I₃ = ? A</text>
                                            )}
                                        </g>
                                    )}

                                    {/* Indicador de Corriente Total IT */}
                                    {currentEx.targetVar === 'IT' && (
                                        <g transform={`translate(${currentEx.R3 > 0 ? 80 : 85}, 30)`}>
                                            <rect x="-24" y="-10" width="48" height="20" rx="5" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
                                            <text x="0" y="4" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="900">
                                                IT = ? A
                                            </text>
                                        </g>
                                    )}
                                </svg>
                            </div>

                            {/* Formulario de Respuesta y Resolución */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#cbd5e1', margin: 0 }}>
                                    {currentEx.desc}
                                </p>

                                <form onSubmit={handleValidate} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc' }}>
                                        Calcula la incógnita: <span style={{ color: '#fbbf24' }}>{currentEx.targetVar}</span> ({currentEx.unit})
                                    </label>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            value={currentInput}
                                            onChange={e => setCurrentInput(e.target.value)}
                                            placeholder={`Introduce valor en ${currentEx.unit}...`}
                                            style={{
                                                flex: 1,
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                background: 'rgba(15,23,42,0.8)',
                                                border: '1.5px solid rgba(255,255,255,0.15)',
                                                color: '#f8fafc',
                                                fontSize: '1rem',
                                                fontWeight: 800,
                                                outline: 'none'
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            className="sim-btn sim-btn-primary"
                                            style={{ padding: '0 20px', fontWeight: 800 }}
                                        >
                                            Validar
                                        </button>
                                    </div>
                                </form>

                                {/* Mensaje de Feedback */}
                                {feedback && (
                                    <div style={{
                                        padding: '10px 12px',
                                        borderRadius: '10px',
                                        fontSize: '0.82rem',
                                        lineHeight: 1.5,
                                        background: feedback.isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                        border: `1.5px solid ${feedback.isCorrect ? '#10b981' : '#ef4444'}`,
                                        color: feedback.isCorrect ? '#6ee7b7' : '#fca5a5'
                                    }}>
                                        {feedback.isCorrect ? '✓ ' : '✕ '}
                                        {feedback.message}
                                    </div>
                                )}

                                {/* Sugerencia de refuerzo automático basada en historial */}
                                {challengeStats[currentEx.id]?.failures >= 2 && !feedback?.isCorrect && (
                                    <div style={{
                                        background: 'rgba(234, 179, 8, 0.1)',
                                        border: '1px solid rgba(234, 179, 8, 0.3)',
                                        borderRadius: '10px',
                                        padding: '8px 12px',
                                        fontSize: '0.78rem',
                                        color: '#fde047',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <Lightbulb size={16} />
                                        <span>
                                            <strong>Sugerencia de refuerzo:</strong> Llevas {challengeStats[currentEx.id].failures} intentos en este reto. Te sugerimos revisar la fórmula: <em>{currentEx.formula}</em>.
                                        </span>
                                    </div>
                                )}

                                {/* Botón Siguiente Reto */}
                                {feedback?.isCorrect && currentExIndex < PARALLEL_EXERCISES.length - 1 && (
                                    <button
                                        className="sim-btn sim-btn-secondary"
                                        style={{ width: '100%', justifyContent: 'center', padding: '9px', fontWeight: 800, color: '#38bdf8' }}
                                        onClick={() => handleSelectExercise(currentExIndex + 1)}
                                    >
                                        <span>Siguiente Reto (#{currentExIndex + 2})</span>
                                        <ArrowRight size={15} />
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                )}

                {/* ══════════════ MODO 2: SIMULADOR LIBRE DE 3 RAMAS PARALELAS ══════════════ */}
                {activeTab === 'sandbox' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem', alignItems: 'start' }}>

                        {/* Circuito Interactivo en Tiempo Real */}
                        <div style={{
                            background: 'linear-gradient(180deg, #090e1a 0%, #0f172a 100%)',
                            border: '1.5px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px',
                            padding: '1rem',
                            textAlign: 'center'
                        }}>
                            <svg viewBox="0 0 340 210" width="100%" height="220" xmlns="http://www.w3.org/2000/svg">
                                {/* Rieles Superior e Inferior (Terminan exactamente a ras en R3 x = 280) */}
                                <line x1="40" y1="30" x2="280" y2="30" stroke="#475569" strokeWidth="2.5" />
                                <line x1="40" y1="175" x2="280" y2="175" stroke="#475569" strokeWidth="2.5" />

                                {/* Fuente VT a la izquierda (x = 40) */}
                                <g transform="translate(25, 75)">
                                    <line x1="15" y1="-45" x2="15" y2="0" stroke="#475569" strokeWidth="2.5" />
                                    <line x1="15" y1="50" x2="15" y2="100" stroke="#475569" strokeWidth="2.5" />
                                    <rect x="0" y="0" width="30" height="50" rx="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                                    <text x="15" y="20" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="900">+</text>
                                    <text x="15" y="42" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="900">−</text>
                                    <text x="-14" y="28" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="900">{sandboxVoltage}V</text>
                                </g>

                                {/* Rama 1: Resistor R1 (x = 120 [delta = 80px]) */}
                                <g transform="translate(120, 30)">
                                    <line x1="0" y1="0" x2="0" y2="50" stroke="#475569" strokeWidth="2" />
                                    <rect x="-10" y="50" width="20" height="45" rx="4" fill="#d4a373" stroke="#78350f" strokeWidth="1.2" />
                                    <line x1="0" y1="95" x2="0" y2="145" stroke="#475569" strokeWidth="2" />
                                    <text x="16" y="70" fill="#c084fc" fontSize="9" fontWeight="900">R₁: {sandboxR1}Ω</text>
                                    <text x="16" y="85" fill="#38bdf8" fontSize="8" fontWeight="800">I₁: {sandboxI1.toFixed(2)}A</text>
                                </g>

                                {/* Rama 2: Resistor R2 (x = 200 [delta = 80px]) */}
                                <g transform="translate(200, 30)">
                                    <line x1="0" y1="0" x2="0" y2="50" stroke="#475569" strokeWidth="2" />
                                    <rect x="-10" y="50" width="20" height="45" rx="4" fill="#d4a373" stroke="#78350f" strokeWidth="1.2" />
                                    <line x1="0" y1="95" x2="0" y2="145" stroke="#475569" strokeWidth="2" />
                                    <text x="16" y="70" fill="#c084fc" fontSize="9" fontWeight="900">R₂: {sandboxR2}Ω</text>
                                    <text x="16" y="85" fill="#38bdf8" fontSize="8" fontWeight="800">I₂: {sandboxI2.toFixed(2)}A</text>
                                </g>

                                {/* Rama 3: Resistor R3 (x = 280 [delta = 80px]) */}
                                <g transform="translate(280, 30)">
                                    <line x1="0" y1="0" x2="0" y2="50" stroke="#475569" strokeWidth="2" />
                                    <rect x="-10" y="50" width="20" height="45" rx="4" fill="#d4a373" stroke="#78350f" strokeWidth="1.2" />
                                    <line x1="0" y1="95" x2="0" y2="145" stroke="#475569" strokeWidth="2" />
                                    <text x="16" y="70" fill="#c084fc" fontSize="9" fontWeight="900">R₃: {sandboxR3}Ω</text>
                                    <text x="16" y="85" fill="#38bdf8" fontSize="8" fontWeight="800">I₃: {sandboxI3.toFixed(2)}A</text>
                                </g>

                                {/* Corriente total IT en riel superior (Centrada sin flecha) */}
                                <g transform="translate(80, 30)">
                                    <rect x="-37" y="-12" width="74" height="24" rx="12" fill="#090e1a" stroke="#34d399" strokeWidth="1.5" />
                                    <text x="0" y="4" textAnchor="middle" fill="#34d399" fontSize="9.5" fontWeight="900" fontFamily="monospace">
                                        IT = {sandboxITotal.toFixed(2)} A
                                    </text>
                                </g>
                            </svg>

                            {/* Resumen Kirchhoff LCK */}
                            <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 12px', fontSize: '0.78rem', color: '#cbd5e1', marginTop: '6px' }}>
                                ⚡ <strong>Comprobación LCK:</strong> I₁ ({sandboxI1.toFixed(2)}A) + I₂ ({sandboxI2.toFixed(2)}A) + I₃ ({sandboxI3.toFixed(2)}A) = <strong style={{ color: '#34d399' }}>{sandboxITotal.toFixed(2)} A</strong>
                            </div>
                        </div>

                        {/* Controles de Sliders */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Voltaje de Fuente */}
                            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
                                    <span>Voltaje Común de Fuente (V):</span>
                                    <span>{sandboxVoltage} V</span>
                                </div>
                                <input type="range" min="1" max="48" step="1" value={sandboxVoltage} onChange={e => { setSandboxVoltage(+e.target.value); trackSandboxInteraction(); }} style={{ width: '100%', accentColor: '#38bdf8' }} />
                            </div>

                            {/* Slider R1 */}
                            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, color: '#c084fc', marginBottom: '4px' }}>
                                    <span>Rama 1 (R₁):</span>
                                    <span>{sandboxR1} Ω (I₁ = {sandboxI1.toFixed(2)}A)</span>
                                </div>
                                <input type="range" min="5" max="120" step="5" value={sandboxR1} onChange={e => { setSandboxR1(+e.target.value); trackSandboxInteraction(); }} style={{ width: '100%', accentColor: '#c084fc' }} />
                            </div>

                            {/* Slider R2 */}
                            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, color: '#c084fc', marginBottom: '4px' }}>
                                    <span>Rama 2 (R₂):</span>
                                    <span>{sandboxR2} Ω (I₂ = {sandboxI2.toFixed(2)}A)</span>
                                </div>
                                <input type="range" min="5" max="120" step="5" value={sandboxR2} onChange={e => { setSandboxR2(+e.target.value); trackSandboxInteraction(); }} style={{ width: '100%', accentColor: '#c084fc' }} />
                            </div>

                            {/* Slider R3 */}
                            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, color: '#c084fc', marginBottom: '4px' }}>
                                    <span>Rama 3 (R₃):</span>
                                    <span>{sandboxR3} Ω (I₃ = {sandboxI3.toFixed(2)}A)</span>
                                </div>
                                <input type="range" min="5" max="120" step="5" value={sandboxR3} onChange={e => { setSandboxR3(+e.target.value); trackSandboxInteraction(); }} style={{ width: '100%', accentColor: '#c084fc' }} />
                            </div>

                            {/* Caja de Resultados Globales */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800 }}>Req Total</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fbbf24' }}>{sandboxReq.toFixed(2)} Ω</div>
                                </div>
                                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800 }}>Potencia Total</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#34d399' }}>{sandboxPTotal.toFixed(2)} W</div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}
