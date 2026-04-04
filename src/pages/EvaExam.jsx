import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { module1EvaluationData } from '../evaluations/RE/m1/module1Evaluation';
import QuestionNavigator from '../components/QuestionNavigator';
import QuestionPanel from '../components/QuestionPanel';
import './evanoti.css';

const EvaExam = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(1200);

    const questions = module1EvaluationData.questions || [];
    const totalQuestions = questions.length;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (timeLeft <= 0) {
            alert('Tiempo agotado');
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft]);

    const handleAnswer = (optionIndex) => {
        setAnswers({ ...answers, [currentQuestion]: optionIndex });
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

    const handleQuestionClick = (index) => {
        setCurrentQuestion(index);
    };

    const currentQ = questions[currentQuestion];
    const userAnswer = answers[currentQuestion];

    return (
        <div className="notifications-page">
            <div className="page-header">
                <div className="header-title">
                    <Bell size={28} color="#facc15" />
                    <h1>Módulo 1 - Robótica Educativa</h1>
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

export default EvaExam;
