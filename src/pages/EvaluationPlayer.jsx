import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bell, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/useAuth';
import QuestionNavigator from '../components/QuestionNavigator';
import QuestionPanel from '../components/QuestionPanel';
import '../styles/EvaluationInstruction.css';

const getQuestionText = (question) => question.question_text || question.q || question.text || '';
const getOptionValue = (option) => {
    if (option && typeof option === 'object') {
        return option.value ?? option.text ?? option.label ?? '';
    }
    return option;
};
const normalizeCorrectAnswer = (question, options) => {
    const rawCorrect = question.correct_answer !== undefined ? question.correct_answer : question.correct;
    if (typeof rawCorrect === 'number') return getOptionValue(options[rawCorrect]);
    const correctText = String(rawCorrect ?? '').trim();
    if (/^[A-F]$/i.test(correctText)) {
        const index = correctText.toUpperCase().charCodeAt(0) - 65;
        return getOptionValue(options[index]) ?? correctText;
    }
    return rawCorrect;
};
const normalizeSavedAnswers = (savedAnswers, normalizedQuestions) => {
    const nextAnswers = {};
    Object.entries(savedAnswers || {}).forEach(([questionIndex, answer]) => {
        const options = normalizedQuestions[Number(questionIndex)]?.options || [];
        if (typeof answer === 'number') {
            nextAnswers[questionIndex] = getOptionValue(options[answer]);
            return;
        }
        if (/^\d+$/.test(String(answer)) && options[Number(answer)] !== undefined) {
            nextAnswers[questionIndex] = getOptionValue(options[Number(answer)]);
            return;
        }
        nextAnswers[questionIndex] = answer;
    });
    return nextAnswers;
};

const EvaluationPlayer = () => {
    const { evaluationKey } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Inicialización inmediata para evitar pérdida de datos al montar el componente
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState(() => {
        try {
            const saved = localStorage.getItem(`exam_answers_${evaluationKey}`);
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });
    
    const [timeLeft, setTimeLeft] = useState(0);
    const [evaluation, setEvaluation] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [examStarted, setExamStarted] = useState(() => {
        return localStorage.getItem(`exam_started_${evaluationKey}`) === 'true';
    });
    const [finalizing, setFinalizing] = useState(false);
    const [syncStatus, setSyncStatus] = useState('saved'); // 'saving', 'saved', 'error'

    useEffect(() => {
        const fetchEvaluation = async () => {
            if (!evaluationKey) return;
            
            try {
                const { data, error } = await api(`/evaluations?key=${encodeURIComponent(evaluationKey)}`);

                if (error) throw error;
                if (data) {
                    setEvaluation(data);
                    
                    // Normalizar preguntas (manejar JSON guardado)
                    const questionsData = (data.questions || []).map(q => {
                        const options = Array.isArray(q.options) ? q.options.map(getOptionValue) : [];
                        return {
                            ...q,
                            q: getQuestionText(q),
                            options,
                            correct: normalizeCorrectAnswer(q, options)
                        };
                    });

                    setQuestions(questionsData);
                    setAnswers(prevAnswers => {
                        const normalizedAnswers = normalizeSavedAnswers(prevAnswers, questionsData);
                        localStorage.setItem(`exam_answers_${evaluationKey}`, JSON.stringify(normalizedAnswers));
                        return normalizedAnswers;
                    });

                    // --- RESTABLECER TIEMPO ORIGINAL ---
                    const savedEndTime = localStorage.getItem(`exam_end_time_${evaluationKey}`);
                    const now = Math.floor(Date.now() / 1000);
                    
                    if (savedEndTime) {
                        const remaining = parseInt(savedEndTime, 10) - now;
                        if (remaining > 0) {
                            setTimeLeft(remaining);
                            setExamStarted(true);
                        } else {
                            setTimeLeft(0);
                            handleAutoFinish();
                        }
                    } else if (data.time_limit) {
                        const limitSeconds = data.time_limit * 60;
                        setTimeLeft(limitSeconds);
                        const endTime = now + limitSeconds;
                        localStorage.setItem(`exam_end_time_${evaluationKey}`, endTime.toString());
                        localStorage.setItem(`exam_started_${evaluationKey}`, 'true');
                        setExamStarted(true);
                    }
                }
            } catch (err) {
                console.error('Error cargando evaluación:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvaluation();
    }, [evaluationKey]);

    const totalQuestions = questions.length;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        // No iniciar si no ha empezado el examen o el tiempo se agotó
        if (!examStarted || timeLeft <= 0) return;

        const timer = setTimeout(() => {
            setTimeLeft(prev => {
                const updated = prev - 1;
                if (updated <= 0) {
                    handleAutoFinish();
                    return 0;
                }
                return updated;
            });
        }, 1000);

        return () => clearTimeout(timer);
    }, [examStarted, timeLeft, evaluationKey]);

    const handleAutoFinish = () => {
        if (!finalizing) {
            setFinalizing(true);
            setTimeout(() => {
                handleFinishExam(true);
            }, 1000);
        }
    };

    const saveAttemptToCloud = async (currentAnswers) => {
        if (!user || !user.id) return;
        setSyncStatus('saving');
        
        try {
            // Calculamos puntaje parcial
            let correctCount = 0;
            questions.forEach((q, idx) => {
                if (currentAnswers[idx] !== undefined && String(currentAnswers[idx]) === String(q.correct)) {
                    correctCount++;
                }
            });
            const partialScore = Math.round((correctCount / (questions.length || 1)) * 100);

            // El backend hace el "upsert" automático (busca intento incompleto o crea uno)
            await api('/attempts', {
                method: 'POST',
                body: {
                    evaluation_key: evaluationKey,
                    answers: currentAnswers,
                    score: partialScore,
                    passed: partialScore >= (evaluation?.passing_score || 70),
                    completed_at: null
                }
            });

            setSyncStatus('saved');
        } catch (err) {
            console.error('Error auto-guardado:', err);
            setSyncStatus('error');
        }
    };

    const handleAnswer = (answerValue) => {
        const newAnswers = { ...answers, [currentQuestion]: answerValue };
        setAnswers(newAnswers);
        setExamStarted(true);
        localStorage.setItem(`exam_answers_${evaluationKey}`, JSON.stringify(newAnswers));
        
        // Guardado instantáneo en la nube
        saveAttemptToCloud(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < totalQuestions - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const [showResults, setShowResults] = useState(false);
    const [result, setResult] = useState(null);

    const handleQuestionClick = (index) => {
        setCurrentQuestion(index);
    };

    const currentQ = questions[currentQuestion];
    const userAnswer = answers[currentQuestion];

    if (loading) {
        return <div className="notifications-page"><div className="page-header"><h1>Cargando...</h1></div></div>;
    }

    if (!evaluation) {
        return <div className="notifications-page"><div className="page-header"><h1>Evaluación no encontrada</h1></div></div>;
    }

    if (questions.length === 0) {
        return <div className="notifications-page"><div className="page-header"><h1>No hay preguntas cargadas en esta evaluación</h1></div></div>;
    }

    const handleFinishExam = async (isAuto = false) => {
        if (!isAuto) {
            const confirmed = window.confirm('¿Deseas finalizar la evaluación? No podrás cambiar tus respuestas.');
            if (!confirmed) return;
        }

        let correctCount = 0;
        questions.forEach((q, idx) => {
            if (answers[idx] !== undefined && String(answers[idx]) === String(q.correct)) {
                correctCount++;
            }
        });

        const score = Math.round((correctCount / totalQuestions) * 100);
        const passed = score >= (evaluation.passing_score || 70);

        try {
            await api('/attempts', {
                method: 'POST',
                body: {
                    evaluation_key: evaluationKey,
                    answers: answers,
                    score: score,
                    passed: passed,
                    completed_at: new Date().toISOString()
                }
            });

            setResult({ score, correctCount, totalQuestions, passed });
            setShowResults(true);
            
            // Limpieza TOTAL
            localStorage.removeItem(`exam_end_time_${evaluationKey}`);
            localStorage.removeItem(`exam_answers_${evaluationKey}`);
            localStorage.removeItem(`exam_started_${evaluationKey}`);
            
        } catch (error) {
            console.error('Error guardando intento:', error);
            setFinalizing(false); // Liberar el bloqueo si falla
            if (!isAuto) alert('Hubo un error al guardar tus resultados. Por favor, intenta de nuevo.');
        }
    };

    if (showResults) {
        return (
            <div className="notifications-page">
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: result.passed ? '#10b981' : '#ef4444' }}>
                        {result.passed ? '¡Felicidades!' : 'Sigue practicando'}
                    </h1>
                    <div style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '2rem' }}>
                        Has completado la evaluación con un puntaje de:
                    </div>
                    <div style={{
                        fontSize: '4rem',
                        fontWeight: 'bold',
                        color: result.passed ? '#10b981' : '#ef4444',
                        marginBottom: '1rem'
                    }}>
                        {result.score}%
                    </div>
                    <div style={{ marginBottom: '2rem', color: '#94a3b8' }}>
                        Acertaste {result.correctCount} de {result.totalQuestions} preguntas.
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/evaluations')}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)',
                            padding: '1rem 2rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Volver a evaluaciones
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="notifications-page">
            {finalizing && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    backdropFilter: 'blur(10px)'
                }}>
                    <div className="loading-spinner-large" style={{ marginBottom: '1.5rem' }}></div>
                    <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Finalizando Evaluación</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Estamos guardando tus respuestas y generando tu resumen...</p>
                    <button 
                        onClick={() => setFinalizing(false)}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancelar y volver
                    </button>
                </div>
            )}
            
            <div className="page-header">
                <div className="header-title">
                    <Bell size={28} color="#facc15" />
                    <h1>{evaluation.title}</h1>
                </div>

                <div className="glass-panel" style={{ 
                    padding: '0.75rem 1.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.03)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: timeLeft < 60 ? '#ef4444' : '#facc15' }}>
                        <Clock size={20} className={timeLeft < 60 ? 'pulse' : ''} />
                        <span style={{ fontWeight: '700', fontSize: '1.2rem', fontFamily: 'monospace' }}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {syncStatus === 'saving' ? (
                            <>
                                <div className="loading-spinner-tiny"></div>
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Guardando...</span>
                            </>
                        ) : syncStatus === 'error' ? (
                            <>
                                <AlertTriangle size={16} color="#ef4444" />
                                <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>Error de red</span>
                            </>
                        ) : (
                            <>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Progreso seguro</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 0.5fr) 1fr', gap: '1.5rem', alignItems: 'start' }}>
                <QuestionNavigator
                    questions={questions}
                    currentQuestion={currentQuestion}
                    answers={answers}
                    onQuestionClick={handleQuestionClick}
                    showFeedback={false}
                />

                <div style={{ width: '100%' }}>
                    <QuestionPanel
                        currentQuestion={currentQuestion}
                        totalQuestions={totalQuestions}
                        question={currentQ}
                        userAnswer={userAnswer}
                        onAnswer={handleAnswer}
                        showFeedback={false}
                    />

                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                        <button
                            onClick={handlePrev}
                            disabled={currentQuestion === 0}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                background: '#1e293b',
                                color: '#fff',
                                cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                                opacity: currentQuestion === 0 ? 0.5 : 1,
                                flex: 1
                            }}
                        >
                            Anterior
                        </button>

                        {currentQuestion === totalQuestions - 1 ? (
                            <button
                                onClick={handleFinishExam}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    flex: 1,
                                    fontWeight: 'bold'
                                }}
                            >
                                Finalizar Evaluación
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    flex: 1
                                }}
                            >
                                Siguiente
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvaluationPlayer;
