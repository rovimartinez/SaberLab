import React from 'react';

const QuestionPanel = ({ 
    currentQuestion, 
    totalQuestions, 
    question, 
    userAnswer, 
    onAnswer,
    showFeedback = false
}) => {
    const isAnswered = userAnswer !== undefined && userAnswer !== null && userAnswer !== '';
    const getOptionValue = (option) => {
        if (option && typeof option === 'object') {
            return option.value ?? option.text ?? option.label ?? '';
        }
        return option;
    };

    let rawOptions = [];
    if (Array.isArray(question?.options)) {
        rawOptions = question.options;
    } else if (typeof question?.options === 'string') {
        try {
            rawOptions = JSON.parse(question.options);
        } catch {
            rawOptions = [];
        }
    }
    
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
                fontSize: '1.35rem', 
                lineHeight: '1.6', 
                marginBottom: '2rem',
                fontWeight: '600'
            }}>
                {question?.q || question?.question_text || question?.text || 'Pregunta sin enunciado'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {rawOptions.map((option, index) => {
                    const optionValue = getOptionValue(option);
                    const isSelected = String(userAnswer) === String(optionValue);
                    const isCorrect = String(question?.correct) === String(optionValue);
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
                            onClick={() => onAnswer(optionValue)}
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
                            <span>{optionValue}</span>
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
