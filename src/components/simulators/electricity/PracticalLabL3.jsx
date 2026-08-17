import { useState, useMemo, useEffect, useRef } from 'react';
import { Play, RotateCcw, CheckCircle2, AlertCircle, Sparkles, Zap, Award, ArrowRight, Activity, Gauge, Flame, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../../lib/api';
import '../../../styles/ElectricitySimulators.css';

// ── BANCO DE 10 EJERCICIOS GUIADOS DE CIRCUITOS EN SERIE Y LVK ──────────────
const SERIES_EXERCISES = [
    {
        id: 1,
        title: 'Reto 1: Resistencia Equivalente con 2 Resistores',
        desc: 'Dos resistencias R₁ = 100 Ω y R₂ = 220 Ω están conectadas en serie a una fuente de 12 V. ¿Cuál es la resistencia total equivalente Req?',
        targetVar: 'Req',
        unit: 'Ω',
        V: 12,
        R1: 100,
        R2: 220,
        R3: 0,
        correct: 320,
        formula: 'Req = R₁ + R₂',
        stepMath: 'Req = 100 Ω + 220 Ω = 320 Ω',
        hint: 'En un circuito serie, las resistencias se suman directamente: Req = R₁ + R₂.'
    },
    {
        id: 2,
        title: 'Reto 2: Resistencia Equivalente con 3 Resistores',
        desc: 'Un circuito serie cuenta con tres resistencias de protección: R₁ = 150 Ω, R₂ = 350 Ω y R₃ = 500 Ω. Calcula la resistencia equivalente total.',
        targetVar: 'Req',
        unit: 'Ω',
        V: 24,
        R1: 150,
        R2: 350,
        R3: 500,
        correct: 1000,
        formula: 'Req = R₁ + R₂ + R₃',
        stepMath: 'Req = 150 + 350 + 500 = 1000 Ω (1 kΩ)',
        hint: 'Suma los tres resistores en cadena: 150 + 350 + 500.'
    },
    {
        id: 3,
        title: 'Reto 3: Corriente Total en Circuito Serie',
        desc: 'Una batería de 24 V alimenta dos resistencias en serie: R₁ = 30 Ω y R₂ = 90 Ω (Req = 120 Ω). ¿Qué corriente (en Amperios) circula por el circuito?',
        targetVar: 'I',
        unit: 'A',
        V: 24,
        R1: 30,
        R2: 90,
        R3: 0,
        correct: 0.2,
        formula: 'I = V / Req',
        stepMath: 'Req = 30 + 90 = 120 Ω  →  I = 24 V / 120 Ω = 0.2 A (200 mA)',
        hint: 'Primero calcula la Req total (30 + 90 = 120 Ω) y luego aplica la Ley de Ohm: I = V / Req.'
    },
    {
        id: 4,
        title: 'Reto 4: Caída de Voltaje V₁ (Ley de Ohm)',
        desc: 'Por un circuito serie circula una corriente I = 2 A. Si R₁ = 15 Ω y R₂ = 35 Ω, ¿cuál es la caída de tensión V₁ en el primer resistor?',
        targetVar: 'V1',
        unit: 'V',
        V: 100,
        R1: 15,
        R2: 35,
        R3: 0,
        correct: 30,
        formula: 'V₁ = I × R₁',
        stepMath: 'V₁ = 2 A × 15 Ω = 30 V',
        hint: 'La corriente es igual en todo el circuito serie. Multiplica I por R₁.'
    },
    {
        id: 5,
        title: 'Reto 5: Caída de Voltaje V₂ (Ley de Ohm)',
        desc: 'En el mismo circuito con I = 2 A y R₂ = 35 Ω, calcula la caída de voltaje V₂ sobre la segunda resistencia.',
        targetVar: 'V2',
        unit: 'V',
        V: 100,
        R1: 15,
        R2: 35,
        R3: 0,
        correct: 70,
        formula: 'V₂ = I × R₂',
        stepMath: 'V₂ = 2 A × 35 Ω = 70 V',
        hint: 'Multiplica la corriente común (2 A) por el valor de R₂ (35 Ω).'
    },
    {
        id: 6,
        title: 'Reto 6: Ley de Voltajes de Kirchhoff (LVK)',
        desc: 'Un voltímetro mide caídas de V₁ = 8 V en R₁, V₂ = 14 V en R₂ y V₃ = 18 V en R₃. ¿Cuál es el voltaje total VT suministrado por la fuente?',
        targetVar: 'VT',
        unit: 'V',
        V: 40,
        R1: 40,
        R2: 70,
        R3: 90,
        correct: 40,
        formula: 'VT = V₁ + V₂ + V₃',
        stepMath: 'VT = 8 V + 14 V + 18 V = 40 V',
        hint: 'Según la LVK, el voltaje total entregado por la fuente es igual a la suma de todas las caídas de tensión.'
    },
    {
        id: 7,
        title: 'Reto 7: Regla del Divisor de Voltaje',
        desc: 'Se conecta una fuente de 30 V a dos resistencias en serie: R₁ = 20 Ω y R₂ = 80 Ω (Req = 100 Ω). Aplica la fórmula del divisor de voltaje para hallar V₂.',
        targetVar: 'V2',
        unit: 'V',
        V: 30,
        R1: 20,
        R2: 80,
        R3: 0,
        correct: 24,
        formula: 'V₂ = VT × (R₂ / Req)',
        stepMath: 'V₂ = 30 V × (80 Ω / 100 Ω) = 30 × 0.8 = 24 V',
        hint: 'Usa la fórmula del divisor: V₂ = 30 × (80 / 100).'
    },
    {
        id: 8,
        title: 'Reto 8: Divisor Simétrico al 50%',
        desc: 'Se conectan dos resistencias idénticas de R₁ = 4.7 kΩ y R₂ = 4.7 kΩ a una fuente de 10 V. ¿Cuál es el voltaje en el nodo central (V₂)?',
        targetVar: 'V2',
        unit: 'V',
        V: 10,
        R1: 4700,
        R2: 4700,
        R3: 0,
        correct: 5,
        formula: 'V₂ = VT / 2',
        stepMath: 'Al ser resistencias idénticas, el voltaje se divide exactamente en dos: 10 V / 2 = 5 V',
        hint: 'Cuando dos resistencias en serie son del mismo valor, cada una recibe exactamente la mitad del voltaje total.'
    },
    {
        id: 9,
        title: 'Reto 9: Potencia Disipada en Serie',
        desc: 'Por un resistor R₁ = 50 Ω en un circuito serie fluye una corriente de I = 0.4 A. ¿Cuánta potencia P₁ (en Watts) disipa?',
        targetVar: 'P1',
        unit: 'W',
        V: 40,
        R1: 50,
        R2: 50,
        R3: 0,
        correct: 8,
        formula: 'P₁ = I² × R₁',
        stepMath: 'P₁ = (0.4)² × 50 = 0.16 × 50 = 8 W',
        hint: 'Aplica la fórmula de potencia combinada con Ohm: P = I² × R.'
    },
    {
        id: 10,
        title: 'Reto 10: Diagnóstico de Falla (Resistor Abierto)',
        desc: 'En un circuito serie con VT = 120 V, el resistor R₂ se ha quemado y quedado en circuito abierto (resistencia infinita). ¿Qué voltaje medirá un voltímetro conectado en los extremos de R₂?',
        targetVar: 'V2',
        unit: 'V',
        V: 120,
        R1: 100,
        R2: 999999,
        R3: 0,
        correct: 120,
        formula: 'V_abierto = VT',
        stepMath: 'Al abrirse R₂, la corriente se hace cero (I = 0), por lo que no hay caída en R₁ (V₁ = 0 V) y todo el voltaje de la fuente (120 V) aparece en los terminales abiertos de R₂.',
        hint: 'En un componente abierto, la corriente es 0 A y el voltímetro mide la totalidad del voltaje de la fuente.'
    }
];

export default function PracticalLabL3() {
    const [activeTab, setActiveTab] = useState('challenges'); // 'challenges' | 'sandbox'
    const [currentExIndex, setCurrentExIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [currentInput, setCurrentInput] = useState('');
    const [feedback, setFeedback] = useState(null); // { isCorrect, message }
    const [completedSet, setCompletedSet] = useState(new Set());
    const [challengeStats, setChallengeStats] = useState({}); // { [id]: { attempts, failures } }

    // Estado del Sandbox Interactivo Libre
    const [sandboxVoltage, setSandboxVoltage] = useState(12);
    const [sandboxR1, setSandboxR1] = useState(10);
    const [sandboxR2, setSandboxR2] = useState(20);
    const [sandboxR3, setSandboxR3] = useState(30);

    const currentEx = SERIES_EXERCISES[currentExIndex];

    // Cargar historial y estado guardado en D1
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const { data } = await api('/practice?lesson_id=ee-m1-l3');
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
                console.error('Error cargando historial de retos:', err);
            }
        };
        loadHistory();
    }, []);

    // Cálculos del Sandbox
    const sandboxReq = sandboxR1 + sandboxR2 + sandboxR3;
    const sandboxCurrent = sandboxReq > 0 ? (sandboxVoltage / sandboxReq) : 0;
    const sandboxV1 = sandboxCurrent * sandboxR1;
    const sandboxV2 = sandboxCurrent * sandboxR2;
    const sandboxV3 = sandboxCurrent * sandboxR3;
    const sandboxPTotal = sandboxVoltage * sandboxCurrent;

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
                        simulator_id: 'practical_lab_l3_sandbox',
                        lesson_id: 'ee-m1-l3',
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
        } catch (e) {
            // Ignorar si audio no está disponible
        }
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
                    lesson_id: 'ee-m1-l3',
                    exercise_id: currentEx.id,
                    exercise_title: currentEx.title,
                    concept: currentEx.targetVar || 'serie',
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

            if (nextSet.size === SERIES_EXERCISES.length) {
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
        setCurrentInput(userAnswers[SERIES_EXERCISES[idx].id]?.toString() || '');
        setFeedback(null);
    };

    return (
        <div className="sim-card" style={{ maxWidth: '960px', margin: '0 auto' }}>
            {/* Header del Laboratorio */}
            <div className="sim-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <span>⚡ Laboratorio Práctico: Circuitos en Serie y Leyes de Kirchhoff</span>
                    </h3>
                    <p style={{ margin: '4px 0 0' }}>
                        Entrena el cálculo de Resistencia Equivalente (Req), caídas de tensión (V₁, V₂) y divisores de voltaje
                    </p>
                </div>

                {/* Tabs de Navegación del Laboratorio */}
                <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.35)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <button
                        onClick={() => setActiveTab('challenges')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: activeTab === 'challenges' ? '#38bdf8' : 'transparent',
                            color: activeTab === 'challenges' ? '#0f172a' : '#94a3b8',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                        }}
                    >
                        <Award size={14} />
                        10 Retos de Serie ({completedSet.size}/10)
                    </button>
                    <button
                        onClick={() => setActiveTab('sandbox')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: activeTab === 'sandbox' ? '#fbbf24' : 'transparent',
                            color: activeTab === 'sandbox' ? '#0f172a' : '#94a3b8',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                        }}
                    >
                        <Activity size={14} />
                        Simulador Libre de 3 Mallas
                    </button>
                </div>
            </div>

            <div className="sim-card-body" style={{ padding: '1.25rem' }}>

                {/* ══════════════ MODO 1: 10 RETOS GUIADOS DE SERIE ══════════════ */}
                {activeTab === 'challenges' && (
                    <div>
                        {/* Selector de Píldoras 1..10 */}
                        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '1rem' }}>
                            {SERIES_EXERCISES.map((ex, idx) => {
                                const isDone = completedSet.has(ex.id);
                                const isCurrent = idx === currentExIndex;
                                return (
                                    <button
                                        key={ex.id}
                                        onClick={() => handleSelectExercise(idx)}
                                        style={{
                                            flex: '1 0 auto',
                                            minWidth: '42px',
                                            padding: '7px 10px',
                                            borderRadius: '10px',
                                            border: isCurrent ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                                            background: isCurrent ? 'rgba(56, 189, 248, 0.2)' : isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15,23,42,0.6)',
                                            color: isCurrent ? '#38bdf8' : isDone ? '#34d399' : '#94a3b8',
                                            fontSize: '0.8rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px',
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        <span>#{ex.id}</span>
                                        {isDone && <CheckCircle2 size={13} color="#34d399" />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Contenedor del Reto Actual */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(280px, 1fr)', gap: '1.25rem', alignItems: 'start' }}>

                            {/* ── ESQUEMÁTICO SVG DE CIRCUITO EN SERIE ── */}
                            <div style={{
                                background: 'linear-gradient(180deg, #090e1a 0%, #0f172a 100%)',
                                border: '1.5px solid rgba(255,255,255,0.08)',
                                borderRadius: '16px',
                                padding: '0.75rem',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', marginBottom: '6px', textAlign: 'left' }}>
                                    {currentEx.title}
                                </div>
                                <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5, textAlign: 'left', margin: '0 0 10px' }}>
                                    {currentEx.desc}
                                </p>

                                <svg viewBox="0 0 320 180" width="100%" height="190" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <radialGradient id="batGradL3" cx="35%" cy="35%" r="65%">
                                            <stop offset="0%" stopColor="#38bdf8" />
                                            <stop offset="100%" stopColor="#0284c7" />
                                        </radialGradient>
                                        <linearGradient id="resBodyL3" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#d4a373" />
                                            <stop offset="100%" stopColor="#bc6c25" />
                                        </linearGradient>
                                    </defs>

                                    {/* Malla del Circuito Serie (Rectángulo Cerrado) */}
                                    <rect x="40" y="30" width="240" height="120" rx="10" fill="none" stroke="#475569" strokeWidth="2.5" />

                                    {/* Batería / Fuente a la izquierda (X=40, Y=70..110) */}
                                    <g transform="translate(25, 65)">
                                        <rect x="0" y="0" width="30" height="50" rx="4" fill="url(#batGradL3)" stroke="#38bdf8" strokeWidth="1.5" />
                                        <rect x="9" y="-4" width="12" height="4" rx="1.5" fill="#ef4444" />
                                        <text x="15" y="18" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="900">+</text>
                                        <text x="15" y="42" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900">−</text>
                                        <text x="-12" y="28" textAnchor="middle" fill={currentEx.targetVar === 'VT' ? '#fbbf24' : '#38bdf8'} fontSize="10" fontWeight="900">
                                            {currentEx.targetVar === 'VT' ? '? V' : `${currentEx.V}V`}
                                        </text>
                                    </g>

                                    {/* Caso 1: Retos con 3 Resistencias (R3 > 0) */}
                                    {currentEx.R3 > 0 ? (
                                        <>
                                            {/* Resistencia 1 */}
                                            <g transform="translate(60, 20)">
                                                <rect x="0" y="0" width="42" height="20" rx="4" fill="url(#resBodyL3)" stroke="#78350f" strokeWidth="1.2" />
                                                <text x="21" y="34" textAnchor="middle" fill={currentEx.targetVar === 'V1' ? '#fbbf24' : '#c084fc'} fontSize="8.5" fontWeight="900">
                                                    R₁: {currentEx.R1}Ω
                                                </text>
                                                {currentEx.id === 6 && (
                                                    <text x="21" y="-5" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="800">V₁: 8V</text>
                                                )}
                                            </g>

                                            {/* Resistencia 2 */}
                                            <g transform="translate(138, 20)">
                                                <rect x="0" y="0" width="42" height="20" rx="4" fill="url(#resBodyL3)" stroke="#78350f" strokeWidth="1.2" />
                                                <text x="21" y="34" textAnchor="middle" fill={currentEx.targetVar === 'V2' ? '#fbbf24' : '#c084fc'} fontSize="8.5" fontWeight="900">
                                                    R₂: {currentEx.R2}Ω
                                                </text>
                                                {currentEx.id === 6 && (
                                                    <text x="21" y="-5" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="800">V₂: 14V</text>
                                                )}
                                            </g>

                                            {/* Resistencia 3 */}
                                            <g transform="translate(216, 20)">
                                                <rect x="0" y="0" width="42" height="20" rx="4" fill="url(#resBodyL3)" stroke="#78350f" strokeWidth="1.2" />
                                                <text x="21" y="34" textAnchor="middle" fill={currentEx.targetVar === 'V3' ? '#fbbf24' : '#c084fc'} fontSize="8.5" fontWeight="900">
                                                    R₃: {currentEx.R3}Ω
                                                </text>
                                                {currentEx.id === 6 && (
                                                    <text x="21" y="-5" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="800">V₃: 18V</text>
                                                )}
                                            </g>
                                        </>
                                    ) : (
                                        /* Caso 2: Retos con 2 Resistencias (R3 === 0) */
                                        <>
                                            {/* Resistencia 1 */}
                                            <g transform="translate(85, 20)">
                                                <rect x="0" y="0" width="45" height="20" rx="5" fill="url(#resBodyL3)" stroke="#78350f" strokeWidth="1.2" />
                                                <text x="22" y="34" textAnchor="middle" fill={currentEx.targetVar === 'V1' ? '#fbbf24' : '#c084fc'} fontSize="9" fontWeight="900">
                                                    R₁: {currentEx.R1 === 999999 ? 'ABIERTO (∞)' : `${currentEx.R1}Ω`}
                                                </text>
                                            </g>

                                            {/* Resistencia 2 */}
                                            <g transform="translate(195, 20)">
                                                <rect x="0" y="0" width="45" height="20" rx="5" fill="url(#resBodyL3)" stroke={currentEx.R2 === 999999 ? '#ef4444' : '#78350f'} strokeWidth={currentEx.R2 === 999999 ? 2 : 1.2} strokeDasharray={currentEx.R2 === 999999 ? '3 2' : 'none'} />
                                                <text x="22" y="34" textAnchor="middle" fill={currentEx.targetVar === 'V2' ? '#fbbf24' : currentEx.R2 === 999999 ? '#ef4444' : '#c084fc'} fontSize="9" fontWeight="900">
                                                    R₂: {currentEx.R2 === 999999 ? 'ABIERTO (∞)' : `${currentEx.R2}Ω`}
                                                </text>
                                            </g>
                                        </>
                                    )}

                                    {/* Indicador de Incógnita de Corriente (solo si el reto pregunta por I) */}
                                    {currentEx.targetVar === 'I' && (
                                        <g transform="translate(160, 150)">
                                            <rect x="-30" y="-10" width="60" height="20" rx="6" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
                                            <text x="0" y="4" textAnchor="middle" fill="#fbbf24" fontSize="10.5" fontWeight="900">
                                                I = ? A
                                            </text>
                                        </g>
                                    )}
                                </svg>
                            </div>

                            {/* ── FORMULARIO DE RESPUESTA Y RESOLUCIÓN ── */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                                {/* Formulario de Entrada */}
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
                                {feedback?.isCorrect && currentExIndex < SERIES_EXERCISES.length - 1 && (
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

                {/* ══════════════ MODO 2: SIMULADOR LIBRE DE 3 RESISTENCIAS ══════════════ */}
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
                            <svg viewBox="0 0 340 200" width="100%" height="220" xmlns="http://www.w3.org/2000/svg">
                                <rect x="30" y="30" width="280" height="140" rx="12" fill="none" stroke="#475569" strokeWidth="2.5" />

                                {/* Fuente VT */}
                                <g transform="translate(15, 75)">
                                    <rect x="0" y="0" width="30" height="50" rx="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                                    <text x="15" y="20" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="900">+</text>
                                    <text x="15" y="42" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="900">−</text>
                                    <text x="-14" y="28" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="900">{sandboxVoltage}V</text>
                                </g>

                                {/* Resistor R1 */}
                                <g transform="translate(65, 20)">
                                    <rect x="0" y="0" width="45" height="20" rx="4" fill="#d4a373" stroke="#78350f" strokeWidth="1.2" />
                                    <text x="22" y="35" textAnchor="middle" fill="#c084fc" fontSize="9" fontWeight="900">R₁: {sandboxR1}Ω</text>
                                    <text x="22" y="-5" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="800">V₁: {sandboxV1.toFixed(2)}V</text>
                                </g>

                                {/* Resistor R2 */}
                                <g transform="translate(145, 20)">
                                    <rect x="0" y="0" width="45" height="20" rx="4" fill="#d4a373" stroke="#78350f" strokeWidth="1.2" />
                                    <text x="22" y="35" textAnchor="middle" fill="#c084fc" fontSize="9" fontWeight="900">R₂: {sandboxR2}Ω</text>
                                    <text x="22" y="-5" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="800">V₂: {sandboxV2.toFixed(2)}V</text>
                                </g>

                                {/* Resistor R3 */}
                                <g transform="translate(225, 20)">
                                    <rect x="0" y="0" width="45" height="20" rx="4" fill="#d4a373" stroke="#78350f" strokeWidth="1.2" />
                                    <text x="22" y="35" textAnchor="middle" fill="#c084fc" fontSize="9" fontWeight="900">R₃: {sandboxR3}Ω</text>
                                    <text x="22" y="-5" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="800">V₃: {sandboxV3.toFixed(2)}V</text>
                                </g>

                                {/* Corriente común I (Cápsula elegante sin solapamiento) */}
                                <g transform="translate(170, 170)">
                                    <rect x="-65" y="-12" width="130" height="24" rx="12" fill="#090e1a" stroke="#34d399" strokeWidth="1.5" />
                                    <polygon points="-50,4 -42,0 -50,-4" fill="#34d399" />
                                    <text x="-34" y="4" textAnchor="start" fill="#34d399" fontSize="10.5" fontWeight="900" fontFamily="monospace">
                                        I = {sandboxCurrent.toFixed(3)} A
                                    </text>
                                </g>
                            </svg>

                            {/* Resumen Kirchhoff */}
                            <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 12px', fontSize: '0.78rem', color: '#cbd5e1', marginTop: '6px' }}>
                                📐 <strong>Comprobación LVK:</strong> V₁ ({sandboxV1.toFixed(1)}V) + V₂ ({sandboxV2.toFixed(1)}V) + V₃ ({sandboxV3.toFixed(1)}V) = <strong style={{ color: '#38bdf8' }}>{sandboxVoltage} V</strong>
                            </div>
                        </div>

                        {/* Controles de Sliders */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Voltaje de Fuente */}
                            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
                                    <span>Voltaje de Fuente (VT):</span>
                                    <span>{sandboxVoltage} V</span>
                                </div>
                                <input type="range" min="1" max="48" step="1" value={sandboxVoltage} onChange={e => { setSandboxVoltage(+e.target.value); trackSandboxInteraction(); }} style={{ width: '100%', accentColor: '#38bdf8' }} />
                            </div>

                            {/* Slider R1 */}
                            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, color: '#c084fc', marginBottom: '4px' }}>
                                    <span>Resistencia R₁:</span>
                                    <span>{sandboxR1} Ω</span>
                                </div>
                                <input type="range" min="5" max="100" step="5" value={sandboxR1} onChange={e => { setSandboxR1(+e.target.value); trackSandboxInteraction(); }} style={{ width: '100%', accentColor: '#c084fc' }} />
                            </div>

                            {/* Slider R2 */}
                            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, color: '#c084fc', marginBottom: '4px' }}>
                                    <span>Resistencia R₂:</span>
                                    <span>{sandboxR2} Ω</span>
                                </div>
                                <input type="range" min="5" max="100" step="5" value={sandboxR2} onChange={e => { setSandboxR2(+e.target.value); trackSandboxInteraction(); }} style={{ width: '100%', accentColor: '#c084fc' }} />
                            </div>

                            {/* Slider R3 */}
                            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, color: '#c084fc', marginBottom: '4px' }}>
                                    <span>Resistencia R₃:</span>
                                    <span>{sandboxR3} Ω</span>
                                </div>
                                <input type="range" min="5" max="100" step="5" value={sandboxR3} onChange={e => { setSandboxR3(+e.target.value); trackSandboxInteraction(); }} style={{ width: '100%', accentColor: '#c084fc' }} />
                            </div>

                            {/* Caja de Resultados Globales */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800 }}>Req Total</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#38bdf8' }}>{sandboxReq} Ω</div>
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
