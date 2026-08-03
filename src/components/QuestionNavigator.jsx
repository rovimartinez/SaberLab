import React from 'react';

const QuestionNavigator = ({ 
    questions = [], 
    currentQuestion, 
    answers = {}, 
    onQuestionClick,
    showFeedback = false 
}) => {
    const totalQuestions = questions.length;

    const correctCount = questions.filter((q, idx) => 
        answers[idx] !== undefined && String(answers[idx]) === String(q.correct)
    ).length;
    
    const incorrectCount = questions.filter((q, idx) => 
        answers[idx] !== undefined && String(answers[idx]) !== String(q.correct)
    ).length;

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', minHeight: '300px' }}>
            <h3 style={{ color: '#f8fafc', marginTop: 0, marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.1rem' }}>
                Progreso ({Object.keys(answers).length}/{totalQuestions})
            </h3>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', 
                gap: '0.6rem',
                justifyItems: 'center'
            }}>
                {questions.map((_, qIndex) => {
                    const userAnswer = answers[qIndex];
                    const correctAnswer = questions[qIndex]?.correct;
                    const isAnswered = userAnswer !== undefined;
                    const isCorrect = String(userAnswer) === String(correctAnswer);
                    const isCurrent = currentQuestion === qIndex;
                    
                    let borderColor = 'rgba(255,255,255,0.1)';
                    let bgColor = 'rgba(255,255,255,0.05)';
                    let textColor = '#94a3b8';
                    
                    if (isCurrent) {
                        borderColor = '#3b82f6';
                        bgColor = 'rgba(59, 130, 246, 0.2)';
                        textColor = '#fff';
                    } else if (isAnswered) {
                        if (showFeedback) {
                            if (isCorrect) {
                                borderColor = '#10b981';
                                bgColor = 'rgba(16, 185, 129, 0.2)';
                                textColor = '#10b981';
                            } else {
                                borderColor = '#ef4444';
                                bgColor = 'rgba(239, 68, 68, 0.2)';
                                textColor = '#ef4444';
                            }
                        } else {
                            // Style for answered but no feedback yet
                            borderColor = '#facc15';
                            bgColor = 'rgba(250, 204, 21, 0.1)';
                            textColor = '#facc15';
                        }
                    }
                    
                    return (
                        <button
                            key={qIndex}
                            onClick={() => onQuestionClick(qIndex)}
                            style={{
                                width: '40px',
                                height: '40px',
                                border: `2px solid ${borderColor}`,
                                borderRadius: '8px',
                                background: bgColor,
                                color: textColor,
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {qIndex + 1}
                        </button>
                    );
                })}
            </div>

            {showFeedback && (
                <div style={{ 
                    marginTop: '1.5rem', 
                    paddingTop: '1rem', 
                    borderTop: '1px solid rgba(255,255,255,0.1)', 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '0.5rem',
                    fontSize: '0.9rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Correctas:</span>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>{correctCount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Incorrectas:</span>
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{incorrectCount}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionNavigator;
