import React from 'react';

const QuestionNavigator = ({ 
    questions = [], 
    currentQuestion, 
    answers = {}, 
    onQuestionClick,
    showFeedback = false 
}) => {
    const totalQuestions = questions.length;

    const answeredCount = Object.values(answers).filter(v => v !== undefined && v !== null && v !== '').length;

    const correctCount = questions.filter((q, idx) => {
        const userAns = answers[idx];
        if (userAns === undefined || userAns === null || userAns === '') return false;
        if (q?.correct === undefined || q?.correct === null || q?.correct === '') return false;
        return String(userAns).trim().toLowerCase() === String(q.correct).trim().toLowerCase();
    }).length;
    
    const incorrectCount = questions.filter((q, idx) => {
        const userAns = answers[idx];
        if (userAns === undefined || userAns === null || userAns === '') return false;
        if (q?.correct === undefined || q?.correct === null || q?.correct === '') return true;
        return String(userAns).trim().toLowerCase() !== String(q.correct).trim().toLowerCase();
    }).length;

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', minHeight: '300px' }}>
            <h3 style={{ color: '#f8fafc', marginTop: 0, marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.1rem' }}>
                Progreso ({answeredCount}/{totalQuestions})
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
                    const isAnswered = userAnswer !== undefined && userAnswer !== null && userAnswer !== '';
                    const isCorrect = isAnswered && correctAnswer !== undefined && correctAnswer !== null && String(userAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
                    const isCurrent = currentQuestion === qIndex;
                    
                    let border = '1px solid rgba(255, 255, 255, 0.1)';
                    let background = '#1e293b';
                    let color = '#94a3b8';
                    let boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                    let transform = 'scale(1)';
                    let fontWeight = '700';
                    let outline = 'none';
                    
                    if (showFeedback) {
                        if (isCorrect) {
                            border = 'none';
                            background = '#10b981';
                            color = '#ffffff';
                            boxShadow = isCurrent ? '0 0 0 3px #38bdf8, 0 4px 14px rgba(16, 185, 129, 0.6)' : '0 2px 8px rgba(16, 185, 129, 0.35)';
                        } else {
                            border = 'none';
                            background = '#ef4444';
                            color = '#ffffff';
                            boxShadow = isCurrent ? '0 0 0 3px #38bdf8, 0 4px 14px rgba(239, 68, 68, 0.6)' : '0 2px 8px rgba(239, 68, 68, 0.35)';
                        }
                        if (isCurrent) {
                            transform = 'scale(1.1)';
                            fontWeight = '900';
                        }
                    } else if (isCurrent) {
                        border = 'none';
                        background = 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)';
                        color = '#0f172a';
                        boxShadow = '0 4px 14px rgba(56, 189, 248, 0.5)';
                        transform = 'scale(1.08)';
                        fontWeight = '900';
                    } else if (isAnswered) {
                        border = 'none';
                        background = '#2563eb';
                        color = '#ffffff';
                        boxShadow = '0 2px 8px rgba(37, 99, 235, 0.4)';
                    }
                    
                    return (
                        <button
                            key={qIndex}
                            onClick={() => onQuestionClick(qIndex)}
                            style={{
                                width: '42px',
                                height: '42px',
                                border,
                                borderRadius: '10px',
                                background,
                                color,
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight,
                                boxShadow,
                                transform,
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
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

            {/* Leyenda de colores */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
                marginTop: '1.5rem',
                fontSize: '0.8rem',
                color: '#94a3b8'
            }}>
                {showFeedback ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10b981', display: 'inline-block' }} />
                            <span style={{ color: '#10b981', fontWeight: 700 }}>Correcta ({correctCount})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#ef4444', display: 'inline-block' }} />
                            <span style={{ color: '#ef4444', fontWeight: 700 }}>Incorrecta ({incorrectCount})</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#38bdf8', display: 'inline-block' }} />
                            <span style={{ color: '#38bdf8', fontWeight: 700 }}>Actual</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#2563eb', display: 'inline-block' }} />
                            <span>Respondida</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', display: 'inline-block' }} />
                            <span>Pendiente</span>
                        </div>
                    </>
                )}
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
