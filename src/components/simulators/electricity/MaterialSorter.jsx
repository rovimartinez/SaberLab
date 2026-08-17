import { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Trophy, Sparkles } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

const MATERIALS = [
    {
        id: 'copper',
        name: 'Hilo de Cobre',
        type: 'conductor',
        emoji: '🧶',
        hint: '1 electrón libre en su capa de valencia. Estándar de cables eléctricos.',
    },
    {
        id: 'glass',
        name: 'Vaso de Vidrio',
        type: 'aislante',
        emoji: '🥛',
        hint: 'Enlaces covalentes extremadamente fuertes. No permite paso de electrones.',
    },
    {
        id: 'graphite',
        name: 'Mina de Lápiz (Grafito)',
        type: 'conductor',
        emoji: '✏️',
        hint: 'Forma de carbono con electrones deslocalizados en planos hexagonales.',
    },
    {
        id: 'rubber',
        name: 'Guante de Goma / Látex',
        type: 'aislante',
        emoji: '🧤',
        hint: 'Material polimérico usado como equipo de protección dieléctrica personal.',
    },
    {
        id: 'aluminum',
        name: 'Papel de Aluminio',
        type: 'conductor',
        emoji: '🥫',
        hint: 'Metal ligero de 3 electrones de valencia. Conduce eficazmente la electricidad.',
    },
    {
        id: 'ceramic',
        name: 'Porcelana',
        type: 'aislante',
        emoji: '🏺',
        hint: 'Material cerámico usado en torres de alta tensión para aislar cables vivos de los postes.',
    },
];

export default function MaterialSorter() {
    const [answers, setAnswers] = useState({}); // { [materialId]: 'conductor' | 'aislante' }
    const [activeIdx, setActiveIdx] = useState(0);

    const currentItem = MATERIALS[activeIdx];
    const answeredCount = Object.keys(answers).length;
    const isCompleted = answeredCount === MATERIALS.length;

    const score = Object.entries(answers).filter(
        ([id, ans]) => MATERIALS.find(m => m.id === id)?.type === ans
    ).length;

    const handleAnswer = (choice) => {
        if (!currentItem) return;
        setAnswers(prev => ({ ...prev, [currentItem.id]: choice }));
        if (activeIdx < MATERIALS.length - 1) {
            setActiveIdx(prev => prev + 1);
        }
    };

    const handleReset = () => {
        setAnswers({});
        setActiveIdx(0);
    };

    return (
        <div className="sim-card">
            <div className="sim-card-header">
                <h3>🧩 Mini-Reto: Clasificador de Materiales</h3>
                <p>Pon a prueba tus conocimientos clasificando cada material como Conductor o Aislante</p>
            </div>

            <div className="sim-card-body">
                {!isCompleted ? (
                    <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
                        {/* Indicador de progreso */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            <span>Material {activeIdx + 1} de {MATERIALS.length}</span>
                            <span>Aciertos: {score}</span>
                        </div>

                        {/* Tarjeta del material activo */}
                        <div style={{
                            background: 'rgba(15,23,42,0.7)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            marginBottom: '1.25rem',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                        }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>{currentItem.emoji}</div>
                            <h4 style={{ color: 'white', fontSize: '1.25rem', margin: '0 0 0.5rem' }}>{currentItem.name}</h4>
                            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
                                💡 {currentItem.hint}
                            </p>
                        </div>

                        {/* Botones de selección */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <button
                                className="sim-btn sim-btn-primary"
                                style={{ justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem', background: '#0284c7', borderColor: '#0369a1' }}
                                onClick={() => handleAnswer('conductor')}
                            >
                                ⚡ Conductor
                            </button>
                            <button
                                className="sim-btn sim-btn-secondary"
                                style={{ justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem', background: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.4)', color: '#fbbf24' }}
                                onClick={() => handleAnswer('aislante')}
                            >
                                🛡️ Aislante
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Pantalla final con resultados */
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', marginBottom: '0.75rem' }}>
                            <Trophy size={48} color="#10b981" />
                        </div>
                        <h4 style={{ color: 'white', fontSize: '1.3rem', margin: '0 0 0.5rem' }}>
                            ¡Reto Completado! Resultado: {score} / {MATERIALS.length}
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            {score === MATERIALS.length ? '🌟 ¡Perfecto! Dominas la diferencia entre conductores y dieléctricos.' : '¡Buen intento! Revisa los resultados a continuación:'}
                        </p>

                        {/* Lista de revisión */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                            {MATERIALS.map(m => {
                                const isCorrect = answers[m.id] === m.type;
                                return (
                                    <div
                                        key={m.id}
                                        style={{
                                            background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                                            border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                            borderRadius: '12px',
                                            padding: '0.75rem',
                                            fontSize: '0.8rem',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                            <span style={{ fontWeight: 600, color: '#f8fafc' }}>{m.emoji} {m.name}</span>
                                            {isCorrect ? (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                    <CheckCircle2 size={15} color="#34d399" /> ¡Correcto!
                                                </span>
                                            ) : (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                    <XCircle size={15} color="#ef4444" /> Incorrecto
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                            Tu respuesta: <strong style={{ color: isCorrect ? '#34d399' : '#ef4444' }}>{answers[m.id]?.toUpperCase()}</strong>
                                            {!isCorrect && <span> (Correcto: <strong style={{ color: '#34d399' }}>{m.type.toUpperCase()}</strong>)</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button className="sim-btn sim-btn-primary" onClick={handleReset} style={{ margin: '0 auto' }}>
                            <RefreshCw size={16} /> Intentar de nuevo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
