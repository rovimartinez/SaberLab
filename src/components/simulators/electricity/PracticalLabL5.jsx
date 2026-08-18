import React, { useState, useEffect } from 'react';
import { 
    GitFork, Award, CheckCircle2, XCircle, RotateCcw, 
    ArrowRight, Lightbulb, Zap, HelpCircle, Layers, Sliders
} from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

const CHALLENGES_L5 = [
    {
        id: 1,
        title: "Reto 1: Identificación del Bloque Interno",
        description: "En una red con R1=10Ω en serie y un bloque de R2=40Ω // R3=40Ω en paralelo, ¿cuál es la resistencia equivalente Rp del bloque paralelo?",
        correctValue: 20,
        unit: "Ω",
        tolerance: 0.1,
        hint: "Para dos resistores iguales en paralelo: Rp = R / 2 = 40 / 2 = 20 Ω."
    },
    {
        id: 2,
        title: "Reto 2: Resistencia Total Equivalente",
        description: "Tomando R1 = 10Ω en serie y el bloque paralelo Rp = 20Ω del reto anterior, ¿cuál es la resistencia equivalente total (Req) de todo el circuito mixto?",
        correctValue: 30,
        unit: "Ω",
        tolerance: 0.1,
        hint: "Al estar en serie: Req = R1 + Rp = 10 + 20 = 30 Ω."
    },
    {
        id: 3,
        title: "Reto 3: Corriente Total de la Fuente",
        description: "Si el circuito anterior (Req = 30Ω) se alimenta con una fuente de 60V, ¿cuánta corriente total (I_T) suministra la fuente?",
        correctValue: 2.0,
        unit: "A",
        tolerance: 0.05,
        hint: "Aplica Ley de Ohm: I_T = V / Req = 60V / 30Ω = 2.0 A."
    },
    {
        id: 4,
        title: "Reto 4: Caída de Tensión en el Resistor Serie",
        description: "Con I_T = 2.0A circulando por el resistor en serie R1 = 10Ω, ¿cuántos voltios caen exclusivamente sobre R1?",
        correctValue: 20,
        unit: "V",
        tolerance: 0.1,
        hint: "V_R1 = I_T × R1 = 2.0A × 10Ω = 20 V."
    },
    {
        id: 5,
        title: "Reto 5: Voltaje en el Bloque Paralelo",
        description: "Si la fuente es de 60V y R1 absorbe 20V, ¿cuántos voltios le quedan disponibles al bloque en paralelo (V_paralelo)?",
        correctValue: 40,
        unit: "V",
        tolerance: 0.1,
        hint: "Por LVK: V_paralelo = V_fuente - V_R1 = 60V - 20V = 40 V."
    },
    {
        id: 6,
        title: "Reto 6: Corriente de Rama en R2",
        description: "Con 40V aplicados al bloque paralelo donde R2 = 40Ω, ¿cuál es la corriente I2 que fluye por la rama de R2?",
        correctValue: 1.0,
        unit: "A",
        tolerance: 0.05,
        hint: "I2 = V_paralelo / R2 = 40V / 40Ω = 1.0 A."
    },
    {
        id: 7,
        title: "Reto 7: Potencia Disipada en R1",
        description: "Calcula la potencia disipada por el resistor serie R1 (10Ω) cuando circula una corriente de 2.0A.",
        correctValue: 40,
        unit: "W",
        tolerance: 0.5,
        hint: "P = I² × R = (2.0)² × 10 = 4 × 10 = 40 W."
    },
    {
        id: 8,
        title: "Reto 8: Potencia Total del Circuito",
        description: "Calcula la potencia total entregada por la fuente de 60V con una corriente de 2.0A.",
        correctValue: 120,
        unit: "W",
        tolerance: 0.5,
        hint: "P_total = V × I = 60V × 2.0A = 120 W."
    },
    {
        id: 9,
        title: "Reto 9: Reducción Asimétrica",
        description: "En un circuito mixto con R1=15Ω en serie con un paralelo de R2=20Ω y R3=30Ω, ¿cuánto vale la Req total?",
        correctValue: 27,
        unit: "Ω",
        tolerance: 0.2,
        hint: "Rp = (20 × 30) / (20 + 30) = 600 / 50 = 12Ω. Luego Req = 15 + 12 = 27 Ω."
    },
    {
        id: 10,
        title: "Reto 10: Reto de Diagnóstico de Falla",
        description: "En el circuito de 60V con R1=10Ω, R2=40Ω y R3=40Ω, si la resistencia R2 se QUEMA (se abre), ¿cuál es la nueva corriente total I_T?",
        correctValue: 1.2,
        unit: "A",
        tolerance: 0.05,
        hint: "Al abrirse R2, el circuito queda en serie pura: Req = R1 + R3 = 10 + 40 = 50Ω. I_T = 60 / 50 = 1.2 A."
    }
];

export default function PracticalLabL5() {
    const lessonId = 'ee-m1-l5';
    const [activeTab, setActiveTab] = useState('retos');
    const [currentChallengeIdx, setCurrentChallengeIdx] = useState(0);
    const [userInputValue, setUserInputValue] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [completedChallenges, setCompletedChallenges] = useState([]);
    const [failedAttempts, setFailedAttempts] = useState({});

    // Estado del Sandbox Libre
    const [sbVoltage, setSbVoltage] = useState(24);
    const [sbR1, setSbR1] = useState(10);
    const [sbR2, setSbR2] = useState(30);
    const [sbR3, setSbR3] = useState(60);

    // Cargar progreso desde D1
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await fetch(`/api/practice?lessonId=${lessonId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.completed) {
                        setCompletedChallenges(data.completed);
                    }
                    if (data && data.failedAttempts) {
                        setFailedAttempts(data.failedAttempts);
                    }
                }
            } catch (err) {
                console.error("Error fetching practice progress:", err);
            }
        };
        fetchProgress();
    }, [lessonId]);

    const currentChallenge = CHALLENGES_L5[currentChallengeIdx];
    const isCurrentCompleted = completedChallenges.includes(currentChallenge.id);
    const currentFails = failedAttempts[currentChallenge.id] || 0;

    const handleVerify = async () => {
        const numVal = parseFloat(userInputValue);
        if (isNaN(numVal)) {
            setFeedback({ type: 'error', text: 'Por favor, ingresa un número válido.' });
            return;
        }

        const isCorrect = Math.abs(numVal - currentChallenge.correctValue) <= currentChallenge.tolerance;

        if (isCorrect) {
            setFeedback({ type: 'success', text: '¡Excelente! Respuesta correcta.' });
            if (!completedChallenges.includes(currentChallenge.id)) {
                const newCompleted = [...completedChallenges, currentChallenge.id];
                setCompletedChallenges(newCompleted);
                try {
                    await fetch('/api/practice', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            lessonId,
                            challengeId: currentChallenge.id,
                            completed: true,
                            totalCompleted: newCompleted.length
                        })
                    });
                } catch (e) {
                    console.error("Error saving progress:", e);
                }
            }
        } else {
            const newFails = currentFails + 1;
            setFailedAttempts(prev => ({ ...prev, [currentChallenge.id]: newFails }));
            setFeedback({
                type: 'error',
                text: `Incorrecto (${numVal} ${currentChallenge.unit}). Revisa los cálculos e inténtalo de nuevo.`
            });
            try {
                await fetch('/api/practice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lessonId,
                        challengeId: currentChallenge.id,
                        failedAttempt: true,
                        attempts: newFails
                    })
                });
            } catch (e) {
                console.error("Error logging failed attempt:", e);
            }
        }
    };

    // Cálculos Sandbox
    const sbRp = (sbR2 * sbR3) / (sbR2 + sbR3);
    const sbReq = sbR1 + sbRp;
    const sbIt = sbVoltage / sbReq;
    const sbV1 = sbIt * sbR1;
    const sbVp = sbVoltage - sbV1;
    const sbI2 = sbVp / sbR2;
    const sbI3 = sbVp / sbR3;

    // Renderizador de Circuitos Esquemáticos Estáticos según el Reto
    const renderChallengeCircuit = (id) => {
        return (
            <div style={{
                background: 'radial-gradient(circle at center, #0f172a 0%, #090e1a 100%)',
                border: '1.5px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
            }}>
                <svg viewBox="0 0 350 180" width="100%" height="170" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="batGradLab5" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#0284c7" />
                            <stop offset="100%" stopColor="#0369a1" />
                        </linearGradient>
                    </defs>

                    {/* ── RETO 2: CIRCUITO SERIE EQUIVALENTE R1 + Rp ── */}
                    {id === 2 ? (
                        <g>
                            <line x1="35" y1="35" x2="260" y2="35" stroke="#38bdf8" strokeWidth="2.5" />
                            <line x1="35" y1="145" x2="260" y2="145" stroke="#38bdf8" strokeWidth="2.5" />

                            {/* Batería */}
                            <g transform="translate(20, 65)">
                                <line x1="15" y1="-30" x2="15" y2="0" stroke="#38bdf8" strokeWidth="2.5" />
                                <line x1="15" y1="50" x2="15" y2="80" stroke="#38bdf8" strokeWidth="2.5" />
                                <rect x="0" y="0" width="30" height="50" rx="4" fill="url(#batGradLab5)" stroke="#38bdf8" strokeWidth="1.5" />
                                <rect x="9" y="-4" width="12" height="4" rx="1.5" fill="#ef4444" />
                                <text x="15" y="18" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="900">+</text>
                                <text x="15" y="42" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900">−</text>
                                <text x="-12" y="28" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="900">60V</text>
                            </g>

                            {/* R1 */}
                            <g transform="translate(130, 35)">
                                <rect x="-24" y="-10" width="48" height="20" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                                <text x="0" y="3.5" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="900">R₁: 10Ω</text>
                            </g>

                            {/* Rp */}
                            <g transform="translate(260, 35)">
                                <line x1="0" y1="0" x2="0" y2="30" stroke="#38bdf8" strokeWidth="2.5" />
                                <rect x="-14" y="30" width="28" height="50" rx="5" fill="#1e293b" stroke="#34d399" strokeWidth="1.8" />
                                <line x1="0" y1="80" x2="0" y2="110" stroke="#38bdf8" strokeWidth="2.5" />
                                <text x="22" y="52" fill="#34d399" fontSize="9.5" fontWeight="900">Rp</text>
                                <text x="22" y="68" fill="#f8fafc" fontSize="11" fontWeight="900">20 Ω</text>
                            </g>

                            {/* Badge Interrogante */}
                            <g transform="translate(145, 90)">
                                <rect x="-56" y="-11" width="112" height="22" rx="6" fill="#090e1a" stroke="#fbbf24" strokeWidth="1.5" />
                                <text x="0" y="3.5" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="900">Req Total = ? Ω</text>
                            </g>
                        </g>
                    ) : id === 3 ? (
                        /* ── RETO 3: CIRCUITO CON Req = 30Ω PIDIENDO IT ── */
                        <g>
                            <line x1="35" y1="35" x2="260" y2="35" stroke="#38bdf8" strokeWidth="2.5" />
                            <line x1="35" y1="145" x2="260" y2="145" stroke="#38bdf8" strokeWidth="2.5" />

                            {/* Batería 60V */}
                            <g transform="translate(20, 65)">
                                <line x1="15" y1="-30" x2="15" y2="0" stroke="#38bdf8" strokeWidth="2.5" />
                                <line x1="15" y1="50" x2="15" y2="80" stroke="#38bdf8" strokeWidth="2.5" />
                                <rect x="0" y="0" width="30" height="50" rx="4" fill="url(#batGradLab5)" stroke="#38bdf8" strokeWidth="1.5" />
                                <rect x="9" y="-4" width="12" height="4" rx="1.5" fill="#ef4444" />
                                <text x="15" y="18" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="900">+</text>
                                <text x="15" y="42" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900">−</text>
                                <text x="-12" y="28" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="900">60V</text>
                            </g>

                            {/* Req Total = 30Ω */}
                            <g transform="translate(260, 35)">
                                <line x1="0" y1="0" x2="0" y2="30" stroke="#38bdf8" strokeWidth="2.5" />
                                <rect x="-14" y="30" width="28" height="50" rx="6" fill="#1e293b" stroke="#facc15" strokeWidth="2" />
                                <line x1="0" y1="80" x2="0" y2="110" stroke="#38bdf8" strokeWidth="2.5" />
                                <text x="22" y="52" fill="#facc15" fontSize="9.5" fontWeight="900">Req</text>
                                <text x="22" y="68" fill="#f8fafc" fontSize="11" fontWeight="900">30 Ω</text>
                            </g>

                            {/* Medidor IT = ? A en el riel inferior */}
                            <g transform="translate(135, 145)">
                                <rect x="-42" y="-11" width="84" height="22" rx="11" fill="#090e1a" stroke="#fbbf24" strokeWidth="1.8" />
                                <text x="0" y="3.5" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="900" fontFamily="monospace">IT = ? A</text>
                            </g>
                        </g>
                    ) : (
                        /* ── RETOS 1, 4, 5, 6, 7, 8, 9, 10: CIRCUITO MIXTO COMPLETO ── */
                        <g>
                            {/* Rieles al ras en x=295 */}
                            <line x1="35" y1="35" x2="295" y2="35" stroke="#38bdf8" strokeWidth="2.5" />
                            <line x1="35" y1="145" x2="295" y2="145" stroke="#38bdf8" strokeWidth="2.5" />

                            {/* Batería / Fuente */}
                            <g transform="translate(20, 65)">
                                <line x1="15" y1="-30" x2="15" y2="0" stroke="#38bdf8" strokeWidth="2.5" />
                                <line x1="15" y1="50" x2="15" y2="80" stroke="#38bdf8" strokeWidth="2.5" />
                                <rect x="0" y="0" width="30" height="50" rx="4" fill="url(#batGradLab5)" stroke="#38bdf8" strokeWidth="1.5" />
                                <rect x="9" y="-4" width="12" height="4" rx="1.5" fill="#ef4444" />
                                <text x="15" y="18" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="900">+</text>
                                <text x="15" y="42" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900">−</text>
                                <text x="-12" y="28" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="900">
                                    {id === 9 ? '24V' : '60V'}
                                </text>
                                {id === 8 && (
                                    <g transform="translate(15, 68)">
                                        <rect x="-38" y="-8" width="76" height="16" rx="4" fill="#090e1a" stroke="#fbbf24" strokeWidth="1.2" />
                                        <text x="0" y="3" textAnchor="middle" fill="#fbbf24" fontSize="7.5" fontWeight="900">P_total = ? W</text>
                                    </g>
                                )}
                            </g>

                            {/* Resistor R1 en serie en el riel superior */}
                            <g transform="translate(125, 35)">
                                <rect x="-24" y="-10" width="48" height="20" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                                <text x="0" y="3.5" textAnchor="middle" fill="#f8fafc" fontSize="8.5" fontWeight="900">
                                    {id === 9 ? 'R₁: 15Ω' : 'R₁: 10Ω'}
                                </text>
                                {id === 4 && (
                                    <g transform="translate(0, -20)">
                                        <rect x="-25" y="-8" width="50" height="16" rx="5" fill="#090e1a" stroke="#fbbf24" strokeWidth="1.2" />
                                        <text x="0" y="3.5" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="900">V₁ = ? V</text>
                                    </g>
                                )}
                                {id === 7 && (
                                    <g transform="translate(0, -20)">
                                        <rect x="-25" y="-8" width="50" height="16" rx="5" fill="#090e1a" stroke="#fbbf24" strokeWidth="1.2" />
                                        <text x="0" y="3.5" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="900">P₁ = ? W</text>
                                    </g>
                                )}
                            </g>

                            {/* Nodos de Bifurcación */}
                            <circle cx="210" cy="35" r="3.5" fill="#38bdf8" />
                            <circle cx="210" cy="145" r="3.5" fill="#38bdf8" />
                            <circle cx="295" cy="35" r="3.5" fill="#38bdf8" />
                            <circle cx="295" cy="145" r="3.5" fill="#38bdf8" />

                            {/* Encerrador en Reto 1 */}
                            {id === 1 && (
                                <g>
                                    <rect x="194" y="16" width="118" height="148" rx="10" fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" strokeWidth="1.8" strokeDasharray="5 4" />
                                    <g transform="translate(252, 12)">
                                        <rect x="-38" y="-8" width="76" height="16" rx="5" fill="#064e3b" stroke="#34d399" strokeWidth="1.2" />
                                        <text x="0" y="3" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="900">Rp = ? Ω</text>
                                    </g>
                                </g>
                            )}

                            {/* Resistor R2 (Rama 1 en x=210) */}
                            <g transform="translate(210, 35)">
                                <line x1="0" y1="0" x2="0" y2="30" stroke="#38bdf8" strokeWidth="2.5" />
                                {id === 10 ? (
                                    /* R2 QUEMADA/ABIERTA */
                                    <g>
                                        <rect x="-8" y="30" width="16" height="50" rx="3" fill="#3f1212" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
                                        <line x1="-6" y1="36" x2="6" y2="74" stroke="#ef4444" strokeWidth="2" />
                                        <line x1="6" y1="36" x2="-6" y2="74" stroke="#ef4444" strokeWidth="2" />
                                        <text x="-12" y="52" textAnchor="end" fill="#f87171" fontSize="8" fontWeight="900">R₂: ABIERTA</text>
                                    </g>
                                ) : (
                                    <g>
                                        <rect x="-8" y="30" width="16" height="50" rx="3" fill="#1e293b" stroke={id === 6 ? '#c084fc' : '#38bdf8'} strokeWidth="1.5" />
                                        <text x="-12" y="52" textAnchor="end" fill="#f8fafc" fontSize="8" fontWeight="900">
                                            {id === 9 ? 'R₂: 20Ω' : 'R₂: 40Ω'}
                                        </text>
                                        {id === 6 && (
                                            <text x="-12" y="66" textAnchor="end" fill="#c084fc" fontSize="7.5" fontWeight="900">I₂ = ? A</text>
                                        )}
                                    </g>
                                )}
                                <line x1="0" y1="80" x2="0" y2="110" stroke="#38bdf8" strokeWidth="2.5" />
                            </g>

                            {/* Resistor R3 (Rama 2 en x=295) */}
                            <g transform="translate(295, 35)">
                                <line x1="0" y1="0" x2="0" y2="30" stroke="#38bdf8" strokeWidth="2.5" />
                                <rect x="-8" y="30" width="16" height="50" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                                <line x1="0" y1="80" x2="0" y2="110" stroke="#38bdf8" strokeWidth="2.5" />
                                <text x="12" y="52" textAnchor="start" fill="#f8fafc" fontSize="8" fontWeight="900">
                                    {id === 9 ? 'R₃: 30Ω' : 'R₃: 40Ω'}
                                </text>
                            </g>

                            {/* Badge Voltaje Paralelo Vp (Reto 5) */}
                            {id === 5 && (
                                <g transform="translate(252, 12)">
                                    <rect x="-38" y="-8" width="76" height="16" rx="5" fill="#090e1a" stroke="#34d399" strokeWidth="1.2" />
                                    <text x="0" y="3" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="900">Vp = ? V</text>
                                </g>
                            )}

                            {/* Medidor IT en riel inferior (Retos 4, 7, 8, 10) */}
                            <g transform="translate(120, 145)">
                                <rect x="-40" y="-10" width="80" height="20" rx="10" fill="#090e1a" stroke={id === 10 ? '#fbbf24' : '#38bdf8'} strokeWidth="1.5" />
                                <text x="0" y="3" textAnchor="middle" fill={id === 10 ? '#fbbf24' : '#38bdf8'} fontSize="8" fontWeight="900" fontFamily="monospace">
                                    {id === 10 ? 'IT = ? A' : (id === 9 ? 'Req = ? Ω' : 'IT = 2.0 A')}
                                </text>
                            </g>
                        </g>
                    )}
                </svg>
            </div>
        );
    };

    return (
        <div className="sim-card" style={{ maxWidth: '880px', margin: '0 auto' }}>
            <div className="sim-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#f59e0b' }}>
                        <GitFork size={20} color="#f59e0b" />
                        <span>Laboratorio Práctico: Circuitos Mixtos y Reducción</span>
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                        Domina el análisis de circuitos serie-paralelo mediante 10 retos interactivos y experimentación libre.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className={`sim-btn ${activeTab === 'retos' ? 'sim-btn-primary' : 'sim-btn-secondary'}`}
                        onClick={() => setActiveTab('retos')}
                        style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        <Award size={14} />
                        <span>10 Retos ({completedChallenges.length}/10)</span>
                    </button>
                    <button
                        className={`sim-btn ${activeTab === 'sandbox' ? 'sim-btn-primary' : 'sim-btn-secondary'}`}
                        onClick={() => setActiveTab('sandbox')}
                        style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        <Sliders size={14} />
                        <span>Simulador Libre</span>
                    </button>
                </div>
            </div>

            <div className="sim-card-body" style={{ padding: '1.25rem' }}>
                {activeTab === 'retos' ? (
                    <div>
                        {/* Selector de Retos 1-10 */}
                        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '1.25rem' }}>
                            {CHALLENGES_L5.map((c, i) => {
                                const done = completedChallenges.includes(c.id);
                                const isCurrent = currentChallengeIdx === i;
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => {
                                            setCurrentChallengeIdx(i);
                                            setUserInputValue('');
                                            setFeedback(null);
                                        }}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            fontSize: '0.78rem',
                                            fontWeight: 800,
                                            border: isCurrent ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                                            background: done ? 'rgba(52, 211, 153, 0.15)' : (isCurrent ? 'rgba(245, 158, 11, 0.15)' : 'rgba(15,23,42,0.6)'),
                                            color: done ? '#34d399' : (isCurrent ? '#fbbf24' : '#94a3b8'),
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {done && <CheckCircle2 size={12} />}
                                        <span>R{c.id}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tarjeta del Reto */}
                        <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <h5 style={{ color: '#fbbf24', margin: 0, fontSize: '1rem' }}>{currentChallenge.title}</h5>
                                {isCurrentCompleted && (
                                    <span style={{ color: '#34d399', fontSize: '0.78rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <CheckCircle2 size={14} /> Completado
                                    </span>
                                )}
                            </div>

                            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 1rem' }}>
                                {currentChallenge.description}
                            </p>

                            {/* DIAGRAMA ESQUEMÁTICO ESTÁTICO DEL CIRCUITO PARA EL RETO ACTUAL */}
                            {renderChallengeCircuit(currentChallenge.id)}

                            {/* Formulario de Respuesta */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', padding: '0 8px' }}>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="Tu valor..."
                                        value={userInputValue}
                                        onChange={(e) => setUserInputValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                                        style={{ background: 'transparent', border: 'none', color: '#f8fafc', padding: '8px', fontSize: '0.9rem', outline: 'none', width: '120px' }}
                                    />
                                    <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 800 }}>{currentChallenge.unit}</span>
                                </div>

                                <button
                                    className="sim-btn sim-btn-primary"
                                    onClick={handleVerify}
                                    style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 800 }}
                                >
                                    Verificar
                                </button>

                                {currentChallengeIdx < CHALLENGES_L5.length - 1 && (
                                    <button
                                        className="sim-btn sim-btn-secondary"
                                        onClick={() => {
                                            setCurrentChallengeIdx(prev => prev + 1);
                                            setUserInputValue('');
                                            setFeedback(null);
                                        }}
                                        style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}
                                    >
                                        <span>Siguiente Reto</span>
                                        <ArrowRight size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Feedback */}
                            {feedback && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    background: feedback.type === 'success' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    border: `1px solid ${feedback.type === 'success' ? '#34d399' : '#ef4444'}`,
                                    color: feedback.type === 'success' ? '#34d399' : '#f87171',
                                    fontSize: '0.84rem',
                                    fontWeight: 700
                                }}>
                                    {feedback.text}
                                </div>
                            )}

                            {/* Pista Pedagógica si hay >= 2 fallos */}
                            {currentFails >= 2 && (
                                <div style={{ marginTop: '1rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                    <Lightbulb size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                                        <strong style={{ color: '#fbbf24' }}>Pista Pedagógica: </strong>
                                        {currentChallenge.hint}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* SIMULADOR LIBRE (SANDBOX) */
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', background: 'rgba(15,23,42,0.6)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.25rem' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#38bdf8', fontWeight: 800 }}>
                                    <span>Voltaje (V):</span>
                                    <span>{sbVoltage} V</span>
                                </div>
                                <input type="range" min="6" max="60" step="6" value={sbVoltage} onChange={(e) => setSbVoltage(Number(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8' }} />
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#fbbf24', fontWeight: 800 }}>
                                    <span>R1 Serie:</span>
                                    <span>{sbR1} Ω</span>
                                </div>
                                <input type="range" min="2" max="50" step="2" value={sbR1} onChange={(e) => setSbR1(Number(e.target.value))} style={{ width: '100%', accentColor: '#fbbf24' }} />
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#34d399', fontWeight: 800 }}>
                                    <span>R2 Paralelo:</span>
                                    <span>{sbR2} Ω</span>
                                </div>
                                <input type="range" min="10" max="100" step="5" value={sbR2} onChange={(e) => setSbR2(Number(e.target.value))} style={{ width: '100%', accentColor: '#34d399' }} />
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#a78bfa', fontWeight: 800 }}>
                                    <span>R3 Paralelo:</span>
                                    <span>{sbR3} Ω</span>
                                </div>
                                <input type="range" min="10" max="100" step="5" value={sbR3} onChange={(e) => setSbR3(Number(e.target.value))} style={{ width: '100%', accentColor: '#a78bfa' }} />
                            </div>
                        </div>

                        {/* Circuito Mixto Reactivo en Vivo para el Sandbox */}
                        <div style={{
                            background: 'radial-gradient(circle at center, #0f172a 0%, #090e1a 100%)',
                            border: '1.5px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '14px',
                            padding: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.25rem'
                        }}>
                            <svg viewBox="0 0 350 180" width="100%" height="175" xmlns="http://www.w3.org/2000/svg">
                                <line x1="35" y1="35" x2="295" y2="35" stroke="#38bdf8" strokeWidth="2.5" />
                                <line x1="35" y1="145" x2="295" y2="145" stroke="#38bdf8" strokeWidth="2.5" />

                                {/* Batería Sandbox */}
                                <g transform="translate(20, 65)">
                                    <line x1="15" y1="-30" x2="15" y2="0" stroke="#38bdf8" strokeWidth="2.5" />
                                    <line x1="15" y1="50" x2="15" y2="80" stroke="#38bdf8" strokeWidth="2.5" />
                                    <rect x="0" y="0" width="30" height="50" rx="4" fill="url(#batGradLab5)" stroke="#38bdf8" strokeWidth="1.5" />
                                    <rect x="9" y="-4" width="12" height="4" rx="1.5" fill="#ef4444" />
                                    <text x="15" y="18" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="900">+</text>
                                    <text x="15" y="42" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900">−</text>
                                    <text x="-12" y="28" textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="900">{sbVoltage}V</text>
                                </g>

                                {/* Resistor R1 */}
                                <g transform="translate(125, 35)">
                                    <rect x="-24" y="-10" width="48" height="20" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                                    <text x="0" y="3.5" textAnchor="middle" fill="#f8fafc" fontSize="8.5" fontWeight="900">R₁: {sbR1}Ω</text>
                                    <g transform="translate(0, -20)">
                                        <rect x="-25" y="-8" width="50" height="16" rx="5" fill="#090e1a" stroke="#fbbf24" strokeWidth="1.2" />
                                        <text x="0" y="3.5" textAnchor="middle" fill="#fbbf24" fontSize="7.5" fontWeight="900">V₁: {sbV1.toFixed(1)}V</text>
                                    </g>
                                </g>

                                {/* Nodos */}
                                <circle cx="210" cy="35" r="3.5" fill="#38bdf8" />
                                <circle cx="210" cy="145" r="3.5" fill="#38bdf8" />
                                <circle cx="295" cy="35" r="3.5" fill="#38bdf8" />
                                <circle cx="295" cy="145" r="3.5" fill="#38bdf8" />

                                {/* Resistor R2 */}
                                <g transform="translate(210, 35)">
                                    <line x1="0" y1="0" x2="0" y2="30" stroke="#38bdf8" strokeWidth="2.5" />
                                    <rect x="-8" y="30" width="16" height="50" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                                    <line x1="0" y1="80" x2="0" y2="110" stroke="#38bdf8" strokeWidth="2.5" />
                                    <text x="-12" y="52" textAnchor="end" fill="#f8fafc" fontSize="8" fontWeight="900">R₂: {sbR2}Ω</text>
                                    <text x="-12" y="66" textAnchor="end" fill="#c084fc" fontSize="7.5" fontWeight="900">I₂: {sbI2.toFixed(2)}A</text>
                                </g>

                                {/* Resistor R3 */}
                                <g transform="translate(295, 35)">
                                    <line x1="0" y1="0" x2="0" y2="30" stroke="#38bdf8" strokeWidth="2.5" />
                                    <rect x="-8" y="30" width="16" height="50" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                                    <line x1="0" y1="80" x2="0" y2="110" stroke="#38bdf8" strokeWidth="2.5" />
                                    <text x="12" y="52" textAnchor="start" fill="#f8fafc" fontSize="8" fontWeight="900">R₃: {sbR3}Ω</text>
                                    <text x="12" y="66" textAnchor="start" fill="#c084fc" fontSize="7.5" fontWeight="900">I₃: {sbI3.toFixed(2)}A</text>
                                </g>

                                {/* Badge Vp */}
                                <g transform="translate(252, 12)">
                                    <rect x="-38" y="-8" width="76" height="16" rx="5" fill="#090e1a" stroke="#34d399" strokeWidth="1.2" />
                                    <text x="0" y="3" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="900">Vp = {sbVp.toFixed(1)} V</text>
                                </g>

                                {/* Medidor IT Sandbox */}
                                <g transform="translate(120, 145)">
                                    <rect x="-42" y="-10" width="84" height="20" rx="10" fill="#090e1a" stroke="#facc15" strokeWidth="1.5" />
                                    <text x="0" y="3" textAnchor="middle" fill="#facc15" fontSize="8" fontWeight="900" fontFamily="monospace">
                                        IT = {sbIt.toFixed(2)} A
                                    </text>
                                </g>
                            </svg>
                        </div>

                        {/* Resultados en tiempo real */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                            <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '10px', padding: '10px' }}>
                                <div style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 800 }}>Req Total:</div>
                                <div style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 900 }}>{sbReq.toFixed(2)} Ω</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Rp = {sbRp.toFixed(2)} Ω</div>
                            </div>

                            <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '10px', padding: '10px' }}>
                                <div style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 800 }}>Corriente Total I_T:</div>
                                <div style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 900 }}>{sbIt.toFixed(3)} A</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>I2 = {sbI2.toFixed(3)}A | I3 = {sbI3.toFixed(3)}A</div>
                            </div>

                            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', padding: '10px' }}>
                                <div style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 800 }}>Voltajes por Bloque:</div>
                                <div style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: 900 }}>V1: {sbV1.toFixed(2)}V | Vp: {sbVp.toFixed(2)}V</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Suma = {sbVoltage} V</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
