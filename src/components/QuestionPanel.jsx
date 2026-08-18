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
                {question?.question || question?.q || question?.question_text || question?.text || 'Pregunta sin enunciado'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {rawOptions.map((option, index) => {
                    const optionValue = getOptionValue(option);
                    const isSelected = String(userAnswer) === String(optionValue);
                    const isCorrect = String(question?.correct) === String(optionValue);
                    
                    let border = '1px solid rgba(255, 255, 255, 0.08)';
                    let background = 'rgba(30, 41, 59, 0.85)';
                    let color = '#e2e8f0';
                    let boxShadow = '0 2px 6px rgba(0, 0, 0, 0.2)';
                    let badgeBg = 'rgba(255, 255, 255, 0.08)';
                    let badgeColor = '#94a3b8';
                    let transform = 'translateY(0)';
                    let fontWeight = '500';
                    
                    if (showFeedback) {
                        if (isCorrect) {
                            border = 'none';
                            background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                            color = '#ffffff';
                            fontWeight = '800';
                            boxShadow = '0 4px 16px rgba(16, 185, 129, 0.45)';
                            badgeBg = 'rgba(255, 255, 255, 0.3)';
                            badgeColor = '#ffffff';
                        } else if (isSelected) {
                            border = 'none';
                            background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                            color = '#ffffff';
                            fontWeight = '800';
                            boxShadow = '0 4px 16px rgba(239, 68, 68, 0.45)';
                            badgeBg = 'rgba(255, 255, 255, 0.3)';
                            badgeColor = '#ffffff';
                        } else {
                            border = '1px solid rgba(255, 255, 255, 0.05)';
                            background = 'rgba(15, 23, 42, 0.5)';
                            color = '#64748b';
                            badgeBg = 'rgba(255, 255, 255, 0.05)';
                            badgeColor = '#64748b';
                        }
                    } else if (isSelected) {
                        border = 'none';
                        background = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
                        color = '#ffffff';
                        fontWeight = '800';
                        boxShadow = '0 4px 16px rgba(2, 132, 199, 0.45)';
                        badgeBg = '#38bdf8';
                        badgeColor = '#0f172a';
                    }
                    
                    const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
                    
                    return (
                        <button
                            key={index}
                            onClick={() => onAnswer(optionValue)}
                            disabled={isAnswered && showFeedback}
                            style={{
                                padding: '1rem 1.25rem',
                                border,
                                borderRadius: '12px',
                                background,
                                color,
                                textAlign: 'left',
                                cursor: (isAnswered && showFeedback) ? 'default' : 'pointer',
                                fontSize: '1rem',
                                fontWeight,
                                transform,
                                boxShadow,
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                <span style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '8px',
                                    background: badgeBg,
                                    color: badgeColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 900,
                                    fontSize: '0.88rem',
                                    flexShrink: 0,
                                    transition: 'all 0.2s ease'
                                }}>
                                    {optionLetter}
                                </span>
                                <span style={{ lineHeight: '1.4' }}>{optionValue}</span>
                            </div>
                            
                            {showFeedback && isCorrect && (
                                <span style={{ fontWeight: 900, fontSize: '1.3rem', flexShrink: 0, color: '#ffffff' }}>✓</span>
                            )}
                            {showFeedback && isSelected && !isCorrect && (
                                <span style={{ fontWeight: 900, fontSize: '1.3rem', flexShrink: 0, color: '#ffffff' }}>✗</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionPanel;
