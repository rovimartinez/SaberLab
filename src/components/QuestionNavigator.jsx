import React from 'react';

const QuestionNavigator = ({ 
    questions, 
    currentQuestion, 
    answers, 
    onQuestionClick 
}) => {
    const totalQuestions = questions.length;

    const correctCount = questions.filter((q, idx) => 
        answers[idx] !== undefined && answers[idx] === q.correct
    ).length;
    const incorrectCount = Object.keys(answers).filter(idx => 
        answers[idx] !== undefined && answers[idx] !== questions[idx]?.correct
    ).length;

    return (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: '#f8fafc', marginTop: 0, marginBottom: '1rem', textAlign: 'center' }}>
                Preguntas ({totalQuestions})
            </h3>
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
                                    onClick={() => onQuestionClick(qIndex)}
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

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>Correctas: {correctCount}</span>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Incorrectas: {incorrectCount}</span>
            </div>
        </div>
    );
};

export default QuestionNavigator;
