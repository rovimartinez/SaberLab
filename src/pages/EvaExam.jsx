import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { module1EvaluationData } from '../evaluations/RE/m1/module1Evaluation';
import './evanoti.css';

const EvaExam = () => {
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});

    const questions = module1EvaluationData.questions || [];
    const totalQuestions = questions.length;

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

    return (
        <div className="notifications-page">
            <div className="page-header">
                <div className="header-title">
                    <Bell size={28} color="#facc15" />
                    <h1>Examen</h1>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: '#f8fafc', marginTop: 0, marginBottom: '1rem', textAlign: 'center' }}>Preguntas ({totalQuestions})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                        {[0, 5, 10, 15, 20, 25].map(startIndex => (
                            <div key={startIndex} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                {questions.slice(startIndex, startIndex + 5).map((_, idx) => {
                                    const qIndex = startIndex + idx;
                                    const userAnswer = answers[qIndex];
                                    const correctAnswer = questions[qIndex]?.correct;
                                    const isAnswered = userAnswer !== undefined;
                                    const isCorrect = userAnswer === correctAnswer;
                                    const isCurrent = currentQuestion === qIndex;
                                    
                                    let borderColor = '#334155';
                                    let bgColor = '#1e293b';
                                    
                                    if (isCurrent) {
                                        borderColor = '#3b82f6';
                                        bgColor = '#3b82f6';
                                    } else if (isAnswered) {
                                        if (isCorrect) {
                                            borderColor = '#10b981';
                                            bgColor = 'rgba(16, 185, 129, 0.2)';
                                        } else {
                                            borderColor = '#ef4444';
                                            bgColor = 'rgba(239, 68, 68, 0.2)';
                                        }
                                    }
                                    
                                    return (
                                        <button
                                            key={qIndex}
                                            onClick={() => handleQuestionClick(qIndex)}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                border: `2px solid ${borderColor}`,
                                                borderRadius: '8px',
                                                background: bgColor,
                                                color: '#fff',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                            }}
                                        >
                                            {qIndex + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#94a3b8' }}>Pregunta {currentQuestion + 1} de {totalQuestions}</span>
                        <span style={{ color: '#94a3b8' }}>5s</span>
                    </div>

                    <h2 style={{ color: '#f8fafc', fontSize: '1.25rem', marginBottom: '1.5rem' }}>{currentQ?.q}</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {currentQ?.options.map((option, index) => {
                            const isSelected = answers[currentQuestion] === index;
                            const isCorrect = currentQ?.correct === index;
                            const showResult = isSelected;
                            
                            let borderColor = '#334155';
                            let bgColor = '#1e293b';
                            
                            if (isSelected) {
                                if (isCorrect) {
                                    borderColor = '#10b981';
                                    bgColor = 'rgba(16, 185, 129, 0.2)';
                                } else {
                                    borderColor = '#ef4444';
                                    bgColor = 'rgba(239, 68, 68, 0.2)';
                                }
                            }
                            
                            return (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                style={{
                                    padding: '1rem',
                                    border: `2px solid ${borderColor}`,
                                    borderRadius: '12px',
                                    background: bgColor,
                                    color: '#e2e8f0',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                {option}
                                {showResult && (
                                    <span style={{ 
                                        color: isCorrect ? '#10b981' : '#ef4444',
                                        fontWeight: 'bold'
                                    }}>
                                        {isCorrect ? '✓' : '✗'}
                                    </span>
                                )}
                            </button>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
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
