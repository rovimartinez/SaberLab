import React from 'react';

const QuestionPanel = ({ 
    currentQuestion, 
    totalQuestions, 
    question, 
    userAnswer, 
    onAnswer
}) => {
    const isAnswered = userAnswer !== undefined;
    
    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8' }}>Pregunta {currentQuestion + 1} de {totalQuestions}</span>
            </div>

            <h2 style={{ color: '#f8fafc', fontSize: '1.25rem', marginBottom: '1.5rem' }}>{question?.q}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {question?.options.map((option, index) => {
                    const isSelected = userAnswer === index;
                    const isCorrect = question?.correct === index;
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
                        onClick={() => onAnswer(index)}
                        disabled={isAnswered}
                        style={{
                            padding: '1rem',
                            border: `2px solid ${borderColor}`,
                            borderRadius: '12px',
                            background: bgColor,
                            color: '#e2e8f0',
                            textAlign: 'left',
                            cursor: isAnswered ? 'default' : 'pointer',
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
        </div>
    );
};

export default QuestionPanel;
