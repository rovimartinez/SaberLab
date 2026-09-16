import React from 'react';
import { Flag } from 'lucide-react';

const QuestionPanel = ({ 
    currentQuestion, 
    totalQuestions, 
    question, 
    userAnswer, 
    onAnswer,
    showFeedback = false,
    isFlagged = false,
    onToggleFlag
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
        <div className="glass-panel evaluation-content-unselectable" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.85rem', 
                    background: 'var(--glass-bg)', 
                    border: '1px solid var(--glass-border)',
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '20px',
                    letterSpacing: '0.5px',
                    fontWeight: 600
                }}>
                    Pregunta {currentQuestion + 1} de {totalQuestions}
                </span>

                {!showFeedback && onToggleFlag && (
                    <button
                        type="button"
                        onClick={() => onToggleFlag(currentQuestion)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            background: isFlagged ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${isFlagged ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)'}`,
                            color: isFlagged ? '#fbbf24' : 'var(--text-secondary)',
                            padding: '0.38rem 0.85rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            transition: 'all 0.2s ease',
                            boxShadow: isFlagged ? '0 0 12px rgba(245, 158, 11, 0.25)' : 'none'
                        }}
                        title={isFlagged ? 'Desmarcar pregunta dudosa' : 'Marcar pregunta para revisarla antes de entregar'}
                    >
                        <Flag size={14} fill={isFlagged ? '#f59e0b' : 'none'} color={isFlagged ? '#f59e0b' : 'currentColor'} />
                        <span>{isFlagged ? 'Marcada para revisión' : 'Marcar para revisión'}</span>
                    </button>
                )}
            </div>

            <h2 style={{ 
                color: 'var(--text-primary)', 
                fontSize: '1.35rem', 
                lineHeight: '1.6', 
                marginBottom: '2rem',
                fontWeight: '700'
            }}>
                {question?.question || question?.q || question?.question_text || question?.text || 'Pregunta sin enunciado'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {rawOptions.map((option, index) => {
                    const optionValue = getOptionValue(option);
                    const isSelected = String(userAnswer) === String(optionValue);
                    const isCorrect = String(question?.correct) === String(optionValue);
                    
                    let border = '1px solid var(--border-default)';
                    let background = 'var(--surface-card)';
                    let color = 'var(--text-primary)';
                    let boxShadow = 'var(--shadow-sm)';
                    let badgeBg = 'var(--bg-muted)';
                    let badgeColor = 'var(--text-secondary)';
                    let transform = 'translateY(0)';
                    let fontWeight = '500';
                    let opacity = 1;
                    
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
                            border = '1px solid var(--border-subtle)';
                            background = 'var(--surface-card-subtle)';
                            color = 'var(--text-primary)';
                            badgeBg = 'var(--bg-muted)';
                            badgeColor = 'var(--text-secondary)';
                            opacity = 0.95;
                        }
                    } else if (isSelected) {
                        border = 'none';
                        background = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
                        color = '#ffffff';
                        fontWeight = '800';
                        boxShadow = '0 4px 16px rgba(2, 132, 199, 0.45)';
                        badgeBg = 'rgba(255, 255, 255, 0.25)';
                        badgeColor = '#ffffff';
                    }
                    
                    const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
                    
                    return (
                        <button
                            key={index}
                            onClick={() => onAnswer(optionValue)}
                            disabled={showFeedback}
                            style={{
                                padding: '1rem 1.25rem',
                                border,
                                borderRadius: '12px',
                                background,
                                color,
                                opacity,
                                textAlign: 'left',
                                cursor: showFeedback ? 'default' : 'pointer',
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
