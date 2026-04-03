import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, BookOpen, Calculator, CheckCircle2, ChevronRight, Lightbulb, RefreshCw, Target, Trophy, X } from 'lucide-react';

const LeyDeOhm = () => {
    const [activeMode, setActiveMode] = useState('calculadora');
    const [target, setTarget] = useState('V');
    const [values, setValues] = useState({ V: '', I: '', R: '' });
    const [exercise, setExercise] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [score, setScore] = useState(0);
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        const saved = window.localStorage.getItem('ohms-widget-values');
        if (!saved) return;
        try {
            setValues(JSON.parse(saved));
        } catch {
            console.log('No saved Ohm values');
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem('ohms-widget-values', JSON.stringify(values));
    }, [values]);

    useEffect(() => {
        if (activeMode !== 'calculadora') return;

        const v = parseFloat(values.V);
        const i = parseFloat(values.I);
        const r = parseFloat(values.R);

        let calculatedV = values.V;
        let calculatedI = values.I;
        let calculatedR = values.R;

        if (target === 'V' && i > 0 && r > 0) {
            calculatedV = (i * r).toFixed(2);
        } else if (target === 'I' && v > 0 && r > 0) {
            calculatedI = (v / r).toFixed(4);
        } else if (target === 'R' && v > 0 && i > 0) {
            calculatedR = (v / i).toFixed(2);
        }

        setValues((prev) => ({
            ...prev,
            V: target === 'V' ? calculatedV : prev.V,
            I: target === 'I' ? calculatedI : prev.I,
            R: target === 'R' ? calculatedR : prev.R
        }));
    }, [values.V, values.I, values.R, target, activeMode]);

    const colors = {
        V: 'ohms-accent-v',
        I: 'ohms-accent-i',
        R: 'ohms-accent-r'
    };

    const generateExercise = useCallback(() => {
        const types = ['V', 'I', 'R'];
        const quest = types[Math.floor(Math.random() * types.length)];
        let val1;
        let val2;
        let unit1;
        let unit2;
        let correct;

        if (quest === 'V') {
            val1 = Math.floor(Math.random() * 10) + 1;
            val2 = Math.floor(Math.random() * 100) + 1;
            unit1 = 'A';
            unit2 = 'O';
            correct = val1 * val2;
        } else if (quest === 'I') {
            val2 = Math.floor(Math.random() * 50) + 1;
            correct = Math.floor(Math.random() * 10) + 1;
            val1 = correct * val2;
            unit1 = 'V';
            unit2 = 'O';
        } else {
            val2 = Math.floor(Math.random() * 5) + 1;
            correct = Math.floor(Math.random() * 100) + 1;
            val1 = correct * val2;
            unit1 = 'V';
            unit2 = 'A';
        }

        setExercise({ quest, val1, val2, unit1, unit2, correct });
        setUserAnswer('');
        setFeedback(null);
    }, []);

    const checkAnswer = () => {
        if (!exercise) return;
        const ans = parseFloat(userAnswer);
        if (Math.abs(ans - exercise.correct) < 0.1) {
            setFeedback({ status: 'success', message: 'Correcto. Excelente calculo.' });
            setScore((prev) => prev + 10);
            window.setTimeout(() => generateExercise(), 1600);
        } else {
            setFeedback({ status: 'error', message: `Incorrecto. El valor real era ${exercise.correct}.` });
            setScore((prev) => Math.max(0, prev - 5));
        }
    };

    return (
        <div className="ohms-pro-widget">
            {showInfo && (
                <div className="ohms-info-overlay">
                    <div className="ohms-info-modal">
                        <div className="ohms-info-header">
                            <div className="ohms-info-title">
                                <BookOpen size={17} />
                                <span>Guia teorica</span>
                            </div>
                            <button type="button" className="ohms-info-close" onClick={() => setShowInfo(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="ohms-info-body">
                            <section>
                                <h4>Que es la Ley de Ohm?</h4>
                                <p>
                                    Establece que la corriente que circula por un conductor es proporcional al
                                    voltaje aplicado e inversamente proporcional a la resistencia.
                                </p>
                            </section>
                            <div className="ohms-info-grid">
                                <div className="ohms-info-row">
                                    <div className="ohms-info-badge v">V</div>
                                    <div>
                                        <h5>Voltaje</h5>
                                        <p>Presion electrica que empuja electrones.</p>
                                    </div>
                                </div>
                                <div className="ohms-info-row">
                                    <div className="ohms-info-badge i">I</div>
                                    <div>
                                        <h5>Corriente</h5>
                                        <p>Flujo de electrones que pasa por el circuito.</p>
                                    </div>
                                </div>
                                <div className="ohms-info-row">
                                    <div className="ohms-info-badge r">R</div>
                                    <div>
                                        <h5>Resistencia</h5>
                                        <p>Oposicion al paso de la corriente.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="ohms-info-footer">Formula base: V = I x R</div>
                    </div>
                </div>
            )}

            <div className="ohms-pro-tabs">
                <button
                    type="button"
                    className={activeMode === 'calculadora' ? 'active' : ''}
                    onClick={() => setActiveMode('calculadora')}
                >
                    <Calculator size={14} />
                    <span>Calculadora</span>
                </button>
                <button type="button" className="ohms-tab-bulb" onClick={() => setShowInfo(true)}>
                    <Lightbulb size={15} />
                </button>
                <button
                    type="button"
                    className={activeMode === 'practica' ? 'active' : ''}
                    onClick={() => {
                        setActiveMode('practica');
                        generateExercise();
                    }}
                >
                    <Trophy size={14} />
                    <span>Practicar</span>
                </button>
            </div>

            <div className="ohms-pro-content">
                {activeMode === 'calculadora' && (
                    <>
                        <div className="ohms-triangle-card">
                            <div className="ohms-triangle-heading">
                                <span><Target size={10} /> Toca para seleccionar</span>
                                <h3>{target === 'V' ? 'V = I x R' : target === 'I' ? 'I = V / R' : 'R = V / I'}</h3>
                            </div>

                            <div className="ohms-visual-triangle">
                                <svg viewBox="0 0 100 80" className="ohms-triangle-svg">
                                    <path d="M50 5 L95 75 L5 75 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
                                    <line x1="25" y1="45" x2="75" y2="45" stroke="#334155" strokeWidth="1.5" />
                                    <line x1="50" y1="45" x2="50" y2="75" stroke="#334155" strokeWidth="1.5" />
                                </svg>

                                <button type="button" className={`ohms-triangle-node node-v ${target === 'V' ? 'active' : ''}`} onClick={() => { setTarget('V'); setValues((prev) => ({ ...prev, V: '' })); }}>V</button>
                                <button type="button" className={`ohms-triangle-node node-i ${target === 'I' ? 'active' : ''}`} onClick={() => { setTarget('I'); setValues((prev) => ({ ...prev, I: '' })); }}>I</button>
                                <button type="button" className={`ohms-triangle-node node-r ${target === 'R' ? 'active' : ''}`} onClick={() => { setTarget('R'); setValues((prev) => ({ ...prev, R: '' })); }}>R</button>
                            </div>
                        </div>

                        <div className="ohms-inputs-pro">
                            {[
                                { id: 'V', label: 'Voltaje', unit: 'V' },
                                { id: 'I', label: 'Corriente', unit: 'A' },
                                { id: 'R', label: 'Resistencia', unit: 'O' }
                            ].map((item) => (
                                <label key={item.id} className={`ohms-input-card ${target === item.id ? 'selected' : ''}`}>
                                    <div className="ohms-input-top">
                                        <span>{item.label}</span>
                                        <strong className={colors[item.id]}>{item.unit}</strong>
                                    </div>
                                    <input
                                        type="number"
                                        disabled={target === item.id}
                                        value={values[item.id]}
                                        onChange={(e) => setValues({ ...values, [item.id]: e.target.value })}
                                        placeholder="0.0"
                                        className={target === item.id ? colors[item.id] : ''}
                                    />
                                </label>
                            ))}
                        </div>

                        <button type="button" className="ohms-clear-btn" onClick={() => setValues({ V: '', I: '', R: '' })}>
                            <RefreshCw size={12} />
                            <span>Limpiar valores</span>
                        </button>
                    </>
                )}

                {activeMode === 'practica' && exercise && (
                    <div className="ohms-practice-card">
                        <div className="ohms-practice-head">
                            <div>
                                <span>Desafio</span>
                                <h4>Score: {score}</h4>
                            </div>
                            <button type="button" className="ohms-mini-refresh" onClick={generateExercise}>
                                <RefreshCw size={15} />
                            </button>
                        </div>

                        <p className="ohms-practice-text">
                            Un circuito con <strong>{exercise.val1}{exercise.unit1}</strong> y una carga de <strong>{exercise.val2}{exercise.unit2}</strong>.
                        </p>
                        <h3 className="ohms-practice-question">
                            Calcula el {exercise.quest === 'V' ? 'Voltaje' : exercise.quest === 'I' ? 'Amperaje' : 'Ohmiaje'}:
                        </h3>

                        <div className="ohms-answer-wrap">
                            <input
                                type="number"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Respuesta..."
                            />
                            <span>{exercise.quest === 'V' ? 'V' : exercise.quest === 'I' ? 'A' : 'O'}</span>
                        </div>

                        <div className="ohms-practice-actions">
                            <button type="button" className="ohms-validate-btn" onClick={checkAnswer}>
                                <span>Validar</span>
                                <ChevronRight size={14} />
                            </button>
                            <button type="button" className="ohms-mini-refresh" onClick={generateExercise}>
                                <RefreshCw size={15} />
                            </button>
                        </div>

                        {feedback && (
                            <div className={`ohms-feedback-box ${feedback.status}`}>
                                {feedback.status === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                                <span>{feedback.message}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeyDeOhm;

