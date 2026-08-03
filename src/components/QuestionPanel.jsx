import React from 'react';

const QuestionPanel = ({ 
    currentQuestion, 
    totalQuestions, 
    question, 
    userAnswer, 
    onAnswer,
    showFeedback = false
}) => {
    const isAnswered = userAnswer !== undefined;
    
    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                    color: '#94a3b8', 
                    fontSize: '0.85rem', 
                    background: 'rgba(255,255,255,0.05)', 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '20px',
                    letterSpacing: '0.5px'
                }}>
                    Pregunta {currentQuestion + 1} de {totalQuestions}
                </span>
            </div>

            <h2 style={{ 
                color: '#f8fafc', 
                fontSize: '1.4rem', 
                lineHeight: '1.5',
                marginBottom: '2rem',
                fontWeight: '500'
            }}>
                {question?.q}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {question?.options.map((option, index) => {
                    const isSelected = userAnswer === index;
                    const isCorrect = String(question?.correct) === String(index);
                    
                    let borderColor = 'rgba(255,255,255,0.1)';
                    let bgColor = 'rgba(255,255,255,0.03)';
                    let textColor = '#cbd5e1';
                    
                    if (isSelected) {
                        if (showFeedback) {
                            if (isCorrect) {
                                borderColor = '#10b981';
                                bgColor = 'rgba(16, 185, 129, 0.15)';
                                textColor = '#34d399';
                            } else {
                                borderColor = '#ef4444';
                                bgColor = 'rgba(239, 68, 68, 0.15)';
                                textColor = '#f87171';
                            }
                        } else {
                            borderColor = '#3b82f6';
                            bgColor = 'rgba(59, 130, 246, 0.15)';
                            textColor = '#3b82f6';
                        }
                    } else if (isAnswered && showFeedback && isCorrect) {
                        borderColor = 'rgba(16, 185, 129, 0.3)';
                    }
                    
                    return (
                        <button
                            key={index}
                            onClick={() => onAnswer(index)}
                            disabled={isAnswered && showFeedback}
                            style={{
                                padding: '1.2rem',
                                border: `2px solid ${borderColor}`,
                                borderRadius: '12px',
                                background: bgColor,
                                color: textColor,
                                textAlign: 'left',
                                cursor: (isAnswered && showFeedback) ? 'default' : 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <span>{option}</span>
                            {showFeedback && isSelected && (
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                                    {isCorrect ? '✓' : '✗'}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionPanel;
