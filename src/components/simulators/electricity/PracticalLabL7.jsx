import { useState } from 'react';
import { Target, CheckCircle2, HelpCircle } from 'lucide-react';

const CHALLENGES = [
    {
        id: 1,
        title: 'Reto 1: Carga Almacenada (Q = C × V)',
        desc: 'Un capacitor electrolítico de 220 µF se conecta a una fuente de 12V. ¿Cuánta carga eléctrica Q en microculombios (µC) acumula en sus placas?',
        formula: 'Q = C × V',
        inputs: [
            { id: 'q_ans', label: 'Carga Q (µC):', target: 2640, tolerance: 10 }
        ],
        hint: 'Q = 220 µF × 12V = 2640 µC'
    },
    {
        id: 2,
        title: 'Reto 2: Corriente Pico Inicial (I_max en t = 0)',
        desc: 'Al conectar un capacitor totalmente descargado a una fuente de 12V con una resistencia R = 240 Ω, ¿cuál es la corriente inicial instantánea I_max en miliamperios (mA) en t = 0?',
        formula: 'I_max = Vin / R',
        inputs: [
            { id: 'imax_ans', label: 'Corriente Inicial (mA):', target: 50, tolerance: 1 }
        ],
        hint: 'En t=0 el capacitor se comporta como un cortocircuito: I_max = 12V / 240 Ω = 0.05 A = 50 mA'
    },
    {
        id: 3,
        title: 'Reto 3: Constante de Tiempo RC (τ = R × C)',
        desc: 'En un circuito con R = 10 kΩ (10,000 Ω) y C = 47 µF (0.000047 F), calcula la constante de tiempo τ en segundos.',
        formula: 'τ = R × C',
        inputs: [
            { id: 'tau_ans', label: 'Constante τ (segundos):', target: 0.47, tolerance: 0.01 }
        ],
        hint: 'τ = 10000 Ω × 0.000047 F = 0.47 s'
    },
    {
        id: 4,
        title: 'Reto 4: Tiempo de Carga Completa (5τ)',
        desc: 'Si la constante de tiempo de un circuito RC es τ = 0.47 s, ¿cuántos segundos tarda aproximadamente en cargarse al 99.3% (5τ)?',
        formula: 't_total = 5 × τ',
        inputs: [
            { id: 't5_ans', label: 'Tiempo 5τ (segundos):', target: 2.35, tolerance: 0.05 }
        ],
        hint: 't = 5 × 0.47 s = 2.35 segundos'
    },
    {
        id: 5,
        title: 'Reto 5: Energía Almacenada (E = ½ C V²)',
        desc: 'Calcula la energía acumulada en Joules (J) por un capacitor de 1000 µF cargado a 20V.',
        formula: 'E = 0.5 × C × V²',
        inputs: [
            { id: 'e_ans', label: 'Energía E (Joules):', target: 0.2, tolerance: 0.01 }
        ],
        hint: 'E = 0.5 × 0.001 F × (20)² = 0.5 × 0.001 × 400 = 0.2 J'
    },
    {
        id: 6,
        title: 'Reto 6: Decodificación EIA de Capacitor Cerámico',
        desc: 'Un capacitor cerámico tiene impreso el código 473K. ¿Cuál es su capacitancia expresada en nanofaradios (nF)?',
        formula: '47 × 10³ pF = nF',
        inputs: [
            { id: 'eia_ans', label: 'Capacitancia (nF):', target: 47, tolerance: 0.5 }
        ],
        hint: '473 = 47 × 1000 pF = 47,000 pF = 47 nF'
    },
    {
        id: 7,
        title: 'Reto 7: Capacitancia Equivalente en Paralelo',
        desc: 'Dos capacitores C1 = 100 µF y C2 = 470 µF se conectan en paralelo. ¿Cuál es la capacitancia equivalente total C_eq en µF?',
        formula: 'C_eq = C1 + C2',
        inputs: [
            { id: 'cp_ans', label: 'C_eq Paralelo (µF):', target: 570, tolerance: 1 }
        ],
        hint: 'En paralelo las capacitancias se suman: 100 + 470 = 570 µF'
    },
    {
        id: 8,
        title: 'Reto 8: Capacitancia Equivalente en Serie',
        desc: 'Dos capacitores iguales C1 = 100 µF y C2 = 100 µF se conectan en serie. ¿Cuál es la C_eq resultante en µF?',
        formula: 'C_eq = (C1 × C2) / (C1 + C2)',
        inputs: [
            { id: 'cs_ans', label: 'C_eq Serie (µF):', target: 50, tolerance: 1 }
        ],
        hint: 'En serie dos capacitores iguales reducen la capacitancia a la mitad: 100 / 2 = 50 µF'
    }
];

export default function PracticalLabL7() {
    const [activeChallengeIdx, setActiveChallengeIdx] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [showHint, setShowHint] = useState(false);
    const [completedChallenges, setCompletedChallenges] = useState(new Set());

    const challenge = CHALLENGES[activeChallengeIdx];

    const handleCheckAnswer = () => {
        let allCorrect = true;
        challenge.inputs.forEach(inp => {
            const val = parseFloat(userAnswers[inp.id]);
            if (isNaN(val) || Math.abs(val - inp.target) > inp.tolerance) {
                allCorrect = false;
            }
        });

        if (allCorrect) {
            setCompletedChallenges(prev => new Set(prev).add(challenge.id));
        } else {
            alert('❌ Respuesta incorrecta. Revisa los datos o usa la pista.');
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '20px',
            padding: '1.5rem',
            color: '#f8fafc',
            maxWidth: '850px',
            margin: '0 auto',
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)'
        }}>
            {/* Header del Laboratorio */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '8px', borderRadius: '12px', border: '1px solid #38bdf8' }}>
                        <Target size={22} color="#38bdf8" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>
                            Laboratorio Práctico: Retos de Capacitores y Circuito RC
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            8 Retos sobre carga, corriente pico inicial, constantes τ, energía y combinaciones
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {CHALLENGES.map((ch, idx) => {
                        const isDone = completedChallenges.has(ch.id);
                        const isActive = idx === activeChallengeIdx;
                        return (
                            <button
                                key={ch.id}
                                onClick={() => { setActiveChallengeIdx(idx); setShowHint(false); }}
                                style={{
                                    width: '30px', height: '30px', borderRadius: '8px', border: 'none',
                                    fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer',
                                    background: isDone ? '#10b981' : isActive ? '#38bdf8' : 'rgba(255,255,255,0.1)',
                                    color: isDone || isActive ? '#fff' : '#94a3b8'
                                }}
                            >
                                {isDone ? '✓' : idx + 1}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Contenido del Reto Actual */}
            <div style={{ background: '#0b1329', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
                    <h5 style={{ margin: 0, fontSize: '1.05rem', color: '#f59e0b', fontWeight: 800 }}>
                        {challenge.title}
                    </h5>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '6px', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                        Fórmula: {challenge.formula}
                    </span>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {challenge.desc}
                </p>

                {/* Formulario de Respuestas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    {challenge.inputs.map(inp => (
                        <div key={inp.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                                {inp.label}
                            </label>
                            <input
                                type="number"
                                step="any"
                                placeholder="Ingresa tu respuesta..."
                                value={userAnswers[inp.id] || ''}
                                onChange={e => setUserAnswers({ ...userAnswers, [inp.id]: e.target.value })}
                                style={{
                                    width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #38bdf8',
                                    background: '#0f172a', color: '#fff', fontSize: '0.9rem', fontWeight: 800, outline: 'none'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Acciones del Reto */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <button
                        onClick={() => setShowHint(!showHint)}
                        style={{
                            background: 'none', border: 'none', color: '#fbbf24', fontSize: '0.82rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700
                        }}
                    >
                        <HelpCircle size={15} /> {showHint ? 'Ocultar Pista' : 'Ver Pista Explicativa'}
                    </button>

                    <button
                        onClick={handleCheckAnswer}
                        style={{
                            background: '#10b981', color: '#fff', border: 'none', padding: '8px 20px',
                            borderRadius: '10px', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        <CheckCircle2 size={16} /> Validar Respuesta
                    </button>
                </div>

                {/* Pista despliegue */}
                {showHint && (
                    <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '10px', fontSize: '0.82rem', color: '#fde047' }}>
                        💡 <strong>Pista de Cálculo:</strong> {challenge.hint}
                    </div>
                )}
            </div>
        </div>
    );
}
