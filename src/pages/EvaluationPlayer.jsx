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
        
        const savedTime = localStorage.getItem('exam_time_left');
        const savedAnswers = localStorage.getItem('exam_answers');
        const started = localStorage.getItem('exam_started');
        
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
                const questionsData = data.questions || [];
                setQuestions(questionsData);
                if (data.time_limit && !examStarted) {
                    setTimeLeft(data.time_limit * 60);
                }
            }
            setLoading(false);
        };

        fetchEvaluation();
    }, [evaluationKey, examStarted]);

    const totalQuestions = questions.length;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (timeLeft <= 0) {
            alert('Tiempo agotado');
            localStorage.removeItem('exam_time_left');
            localStorage.removeItem('exam_started');
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft]);

    useEffect(() => {
        if (examStarted && timeLeft > 0) {
            localStorage.setItem('exam_time_left', timeLeft.toString());
        }
    }, [timeLeft, examStarted]);

    useEffect(() => {
        if (Object.keys(answers).length > 0) {
            localStorage.setItem('exam_answers', JSON.stringify(answers));
        }
    }, [answers]);

    const handleAnswer = (optionIndex) => {
        setAnswers({ ...answers, [currentQuestion]: optionIndex });
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
        return <div className="notifications-page"><div className="page-header"><h1>No hay preguntas en esta evaluación</h1></div></div>;
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

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                <QuestionNavigator 
                    questions={questions}
                    currentQuestion={currentQuestion}
                    answers={answers}
                    onQuestionClick={handleQuestionClick}
                />

                <div>
                    <QuestionPanel 
                        currentQuestion={currentQuestion}
                        totalQuestions={totalQuestions}
                        question={currentQ}
                        userAnswer={userAnswer}
                        onAnswer={handleAnswer}
                    />

                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
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
                            }}
                        >
                            Anterior
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentQuestion === totalQuestions - 1}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
                                color: '#fff',
                                cursor: currentQuestion === totalQuestions - 1 ? 'not-allowed' : 'pointer',
                                opacity: currentQuestion === totalQuestions - 1 ? 0.5 : 1,
                            }}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvaluationPlayer;
