import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import QuestionNavigator from '../components/QuestionNavigator';
import QuestionPanel from '../components/QuestionPanel';
import '../styles/EvaluationInstruction.css';

const EvaluationPlayer = () => {
    const { evaluationKey } = useParams();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(1200);
    const [evaluation, setEvaluation] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [examStarted, setExamStarted] = useState(false);

    useEffect(() => {
        if (!evaluationKey) return;
        
        const savedTime = localStorage.getItem(`exam_time_left_${evaluationKey}`);
        const savedAnswers = localStorage.getItem(`exam_answers_${evaluationKey}`);
        const started = localStorage.getItem(`exam_started_${evaluationKey}`);
        
        if (started && savedTime) {
            setTimeLeft(parseInt(savedTime, 10));
            setExamStarted(true);
        }
        if (savedAnswers) {
            try {
                setAnswers(JSON.parse(savedAnswers));
            } catch (e) {
                console.error('Error parsing saved answers:', e);
            }
        }
    }, [evaluationKey]);

    useEffect(() => {
        const fetchEvaluation = async () => {
            if (!evaluationKey) return;
            
            const { data, error } = await supabase
                .from('evaluaciones')
                .select('*')
                .eq('evaluation_key', evaluationKey)
                .single();

            if (data) {
                setEvaluation(data);
                
                // Normalizar preguntas: manejar diferentes formatos de correct_answer
                const questionsData = (data.questions || []).map(q => {
                    const normalized = {
                        ...q,
                        q: q.question_text || q.q || '',
                        options: q.options || [],
                        correct: q.correct_answer || q.correct
                    };

                    // Convertir letra (A, B, C...) a índice numérico si es necesario
                    if (typeof normalized.correct === 'string' && normalized.correct.length === 1) {
                        const charCode = normalized.correct.toUpperCase().charCodeAt(0);
                        if (charCode >= 65 && charCode <= 70) { // A-F
                            normalized.correct = charCode - 65;
                        }
                    } 
                    // Si el correct_answer es el texto de la opción
                    else if (typeof normalized.correct === 'string' && normalized.options.includes(normalized.correct)) {
                        normalized.correct = normalized.options.indexOf(normalized.correct);
                    }
                    // Manejar Verdadero/Falso si están como texto
                    else if (normalized.question_type === 'verdadero_falso') {
                        if (normalized.correct === 'Verdadero') normalized.correct = 0;
                        else if (normalized.correct === 'Falso') normalized.correct = 1;
                    }

                    return normalized;
                });

                setQuestions(questionsData);

                // Solo establecer el tiempo inicial si no hay un examen ya empezado y guardado
                const savedStarted = localStorage.getItem(`exam_started_${evaluationKey}`);
                if (data.time_limit && !savedStarted) {
                    setTimeLeft(data.time_limit * 60);
                }
            }
            setLoading(false);
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
        if (timeLeft <= 0) {
            alert('Tiempo agotado');
            localStorage.removeItem(`exam_time_left_${evaluationKey}`);
            localStorage.removeItem(`exam_started_${evaluationKey}`);
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft]);

    useEffect(() => {
        if (examStarted && timeLeft > 0) {
            localStorage.setItem(`exam_time_left_${evaluationKey}`, timeLeft.toString());
            localStorage.setItem(`exam_started_${evaluationKey}`, 'true');
        }
    }, [timeLeft, examStarted, evaluationKey]);

    const handleAnswer = (optionIndex) => {
        const newAnswers = { ...answers, [currentQuestion]: optionIndex };
        setAnswers(newAnswers);
        setExamStarted(true);
        localStorage.setItem(`exam_answers_${evaluationKey}`, JSON.stringify(newAnswers));
        localStorage.setItem(`exam_started_${evaluationKey}`, 'true');
    };

    useEffect(() => {
        localStorage.setItem(`exam_answers_${evaluationKey}`, JSON.stringify(answers));
    }, [answers, evaluationKey]);

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

    const handleFinishExam = async () => {
        const confirmed = window.confirm('¿Deseas finalizar la evaluación? No podrás cambiar tus respuestas.');
        if (!confirmed) return;

        let correctCount = 0;
        questions.forEach((q, idx) => {
            if (answers[idx] !== undefined && answers[idx] === q.correct) {
                correctCount++;
            }
        });

        const score = Math.round((correctCount / totalQuestions) * 100);
        const passed = score >= (evaluation.passing_score || 70);

        try {
            const { error } = await supabase
                .from('intentos_evaluacion')
                .insert({
                    user_id: user.id,
                    evaluation_key: evaluationKey,
                    answers: answers,
                    score: score,
                    passed: passed,
                    completed_at: new Date().toISOString()
                });

            if (error) throw error;

            setResult({ score, correctCount, totalQuestions, passed });
            setShowResults(true);
            
            // Limpiar almacenamiento
            localStorage.removeItem(`exam_time_left_${evaluationKey}`);
            localStorage.removeItem(`exam_answers_${evaluationKey}`);
            localStorage.removeItem(`exam_started_${evaluationKey}`);
            
        } catch (error) {
            console.error('Error saving exam attempt:', error);
            alert('Error al guardar tus resultados. Re intenta.');
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
            <div className="page-header">
                <div className="header-title">
                    <Bell size={28} color="#facc15" />
                    <h1>{evaluation.title}</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                        color: timeLeft <= 60 ? '#ef4444' : '#f8fafc',
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                    }}>
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 0.5fr) 1fr', gap: '1.5rem', alignItems: 'start' }}>
                <QuestionNavigator 
                    questions={questions}
                    currentQuestion={currentQuestion}
                    answers={answers}
                    onQuestionClick={handleQuestionClick}
                />

                <div style={{ width: '100%' }}>
                    <QuestionPanel 
                        currentQuestion={currentQuestion}
                        totalQuestions={totalQuestions}
                        question={currentQ}
                        userAnswer={userAnswer}
                        onAnswer={handleAnswer}
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
