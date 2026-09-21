import React from 'react';
import { AlertCircle, Check, Clock, Trophy, X } from 'lucide-react';
import { useLessonQuiz } from '../../../hooks/useLessonQuiz';

const LessonQuizBlock = ({ block, user, lessonKey, moduleId, lessonId, subject, onBackToContent }) => {
    const {
        currentQuestion,
        currentQ,
        handleQuizAnswer,
        questionTimeFill,
        questionTimeSegments,
        quizMode,
        quizQuestions,
        quizScore,
        quizTimeLimit,
        requiredScorePercent,
        resetQuiz,
        resultPercent,
        selectedAnswer,
        startQuiz,
        timeLeft
    } = useLessonQuiz({
        user,
        lessonKey,
        lessonTitle: block.title,
        lessonQuestions: block.questions || [],
        quizConfig: block.quizConfig || {},
        moduleId,
        lessonId
    });

    if (!quizQuestions.length) {
        return null;
    }

    return (
        <div className="quiz-container" style={{ maxWidth: '820px', margin: '0.5rem auto 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minHeight: 'auto' }}>
            {quizMode === 'intro' && (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem 2.5rem',
                    background: 'var(--surface-card, #ffffff)',
                    borderRadius: '28px',
                    border: '1.5px solid var(--border-subtle, #e2e8f0)',
                    boxShadow: '0 12px 36px -8px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {subject?.icon && (
                        <div style={{
                            position: 'absolute',
                            right: '-2rem',
                            top: '50%',
                            transform: 'translateY(-50%) rotate(-15deg)',
                            opacity: 0.05,
                            color: subject.color,
                            pointerEvents: 'none'
                        }}>
                            {React.isValidElement(subject.icon) ? React.cloneElement(subject.icon, { size: 240 }) : null}
                        </div>
                    )}

                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.35rem 0.95rem',
                        borderRadius: '20px',
                        background: `${subject.color}15`,
                        color: subject.color,
                        fontSize: '0.78rem',
                        fontWeight: 850,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        marginBottom: '1rem',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <span>🎯 Validación de Conocimientos</span>
                    </div>

                    <h3 style={{ color: 'var(--text-heading, #0f172a)', fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: '0.75rem', position: 'relative', zIndex: 1 }}>
                        {block.quizConfig?.title || block.title || 'Prueba de la Lección'}
                    </h3>
                    <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '1.02rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '560px', position: 'relative', zIndex: 1 }}>
                        Demuestra lo que has aprendido en esta lección. Supera este reto para validar tus conocimientos y desbloquear el siguiente nivel.
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '0.85rem',
                        width: '100%',
                        maxWidth: '640px',
                        marginBottom: '2.5rem',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <div style={{
                            background: 'var(--surface-card-subtle, #f8fafc)',
                            border: '1px solid var(--border-subtle, #e2e8f0)',
                            borderRadius: '16px',
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', flexShrink: 0, boxShadow: '0 0 8px #10b981' }} />
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase' }}>Reactivos</div>
                                <div style={{ fontSize: '0.92rem', fontWeight: 850, color: 'var(--text-heading, #0f172a)' }}>{quizQuestions.length} Preguntas</div>
                            </div>
                        </div>

                        <div style={{
                            background: 'var(--surface-card-subtle, #f8fafc)',
                            border: '1px solid var(--border-subtle, #e2e8f0)',
                            borderRadius: '16px',
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: subject.color, flexShrink: 0, boxShadow: `0 0 8px ${subject.color}` }} />
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase' }}>Tiempo Límite</div>
                                <div style={{ fontSize: '0.92rem', fontWeight: 850, color: 'var(--text-heading, #0f172a)' }}>{quizTimeLimit}s por pregunta</div>
                            </div>
                        </div>

                        <div style={{
                            background: 'var(--surface-card-subtle, #f8fafc)',
                            border: '1px solid var(--border-subtle, #e2e8f0)',
                            borderRadius: '16px',
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0, boxShadow: '0 0 8px #f59e0b' }} />
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase' }}>Para Aprobar</div>
                                <div style={{ fontSize: '0.92rem', fontWeight: 850, color: 'var(--text-heading, #0f172a)' }}>Mínimo {requiredScorePercent}%</div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={startQuiz}
                        className="nav-btn-start-quiz"
                        style={{
                            background: `linear-gradient(135deg, ${subject.color} 0%, ${subject.color}dd 100%)`,
                            border: 'none',
                            color: 'white',
                            padding: '0.95rem 3rem',
                            fontSize: '1.08rem',
                            fontWeight: 850,
                            borderRadius: '16px',
                            boxShadow: `0 8px 25px ${subject.color}45`,
                            cursor: 'pointer',
                            position: 'relative',
                            zIndex: 1,
                            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                    >
                        Iniciar Prueba
                    </button>
                </div>
            )}

            {quizMode === 'question' && currentQuestion && (
                <div style={{
                    animation: 'fadeIn 0.3s ease-out',
                    position: 'relative',
                    padding: '0.5rem 0',
                    borderRadius: '24px',
                    overflow: 'hidden'
                }}>
                    {selectedAnswer === -1 && (
                        <div className="animate-scale-in" style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 30,
                            background: 'var(--surface-panel-glass, rgba(15, 23, 42, 0.92))',
                            backdropFilter: 'blur(12px)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '24px',
                            border: '2px solid rgba(239, 68, 68, 0.45)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.35)'
                        }}>
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '2px solid rgba(239, 68, 68, 0.4)',
                                padding: '1.25rem',
                                borderRadius: '50%',
                                marginBottom: '1rem',
                                boxShadow: '0 0 25px rgba(239, 68, 68, 0.3)'
                            }}>
                                <Clock size={52} color="#ef4444" strokeWidth={2.5} />
                            </div>
                            <span style={{
                                color: 'var(--text-heading, #ffffff)',
                                fontSize: '1.65rem',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginBottom: '0.35rem'
                            }}>
                                ¡Tiempo Agotado!
                            </span>
                            <span style={{
                                color: 'var(--text-secondary, #94a3b8)',
                                fontSize: '0.92rem',
                                fontWeight: 600
                            }}>
                                Pasando a la siguiente pregunta...
                            </span>
                        </div>
                    )}

                    {subject?.icon && (
                        <div style={{
                            position: 'absolute',
                            right: '-2rem',
                            top: '50%',
                            transform: 'translateY(-50%) rotate(-15deg)',
                            opacity: 0.03,
                            color: subject.color,
                            pointerEvents: 'none'
                        }}>
                            {React.isValidElement(subject.icon) ? React.cloneElement(subject.icon, { size: 280 }) : null}
                        </div>
                    )}

                    {(() => {
                        const timePercent = quizTimeLimit > 0 ? (timeLeft / quizTimeLimit) * 100 : 0;
                        const timerColor = timePercent >= 50 ? '#10b981' : timePercent >= 30 ? '#f59e0b' : '#ef4444';
                        return (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', position: 'relative', zIndex: 1 }}>
                                    <span style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.92rem', fontWeight: 700 }}>
                                        Pregunta {currentQ + 1} de {quizQuestions.length}
                                    </span>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        color: timerColor,
                                        fontWeight: 850,
                                        fontSize: '1.15rem',
                                        background: 'var(--surface-card-subtle, rgba(255,255,255,0.05))',
                                        border: `1px solid ${timerColor}40`,
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        position: 'relative',
                                        zIndex: 2,
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <Clock size={18} />
                                        {timeLeft}s
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '4px', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
                                    {[...Array(questionTimeSegments)].map((_, index) => (
                                        <div
                                            key={`${block.id}-timer-${index}`}
                                            style={{
                                                flex: 1,
                                                height: '6px',
                                                background: index < questionTimeFill
                                                    ? timerColor
                                                    : 'var(--border-subtle, rgba(255,255,255,0.08))',
                                                borderRadius: '3px',
                                                transition: 'all 0.3s ease'
                                            }}
                                        />
                                    ))}
                                </div>
                            </>
                        );
                    })()}

                    <h3 style={{
                        color: 'var(--text-heading, #0f172a)',
                        fontSize: '1.3rem',
                        fontWeight: 800,
                        marginBottom: '1.5rem',
                        lineHeight: 1.4,
                        letterSpacing: '-0.01em'
                    }}>
                        {currentQuestion.question || currentQuestion.q}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {currentQuestion.options.map((option, optIdx) => {
                            const isSelected = selectedAnswer === optIdx;
                            const isCorrect = currentQuestion.correct === optIdx;
                            let bg = 'var(--bg-secondary)';
                            let border = '1px solid var(--glass-border)';
                            let textColor = 'var(--text-primary)';

                            if (selectedAnswer !== null && isSelected) {
                                if (isCorrect) {
                                    bg = 'rgba(16, 185, 129, 0.18)';
                                    border = '2px solid #10b981';
                                    textColor = '#10b981';
                                } else {
                                    bg = 'rgba(239, 68, 68, 0.18)';
                                    border = '2px solid #ef4444';
                                    textColor = '#ef4444';
                                }
                            }

                            return (
                                <button
                                    key={`${block.id}-option-${optIdx}`}
                                    onClick={() => handleQuizAnswer(optIdx)}
                                    disabled={selectedAnswer !== null}
                                    style={{
                                        padding: '1.25rem 1.5rem',
                                        background: bg,
                                        border,
                                        borderRadius: '16px',
                                        textAlign: 'left',
                                        cursor: selectedAnswer !== null ? 'default' : 'pointer',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        color: textColor,
                                        fontSize: '1.05rem',
                                        fontWeight: 600,
                                        position: 'relative',
                                        zIndex: 2
                                    }}
                                >
                                    <span>{option}</span>
                                    {selectedAnswer !== null && isSelected && isCorrect && <Check size={20} color="#10b981" />}
                                    {selectedAnswer !== null && isSelected && !isCorrect && <X size={20} color="#ef4444" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {quizMode === 'result' && (
                <div style={{
                    animation: 'fadeIn 0.5s ease-out',
                    position: 'relative',
                    padding: '3rem 1.5rem',
                    borderRadius: '24px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflow: 'hidden'
                }}>
                    {subject?.icon && (
                        <div style={{
                            position: 'absolute',
                            right: '-2rem',
                            top: '50%',
                            transform: 'translateY(-50%) rotate(-15deg)',
                            opacity: 0.05,
                            color: resultPercent >= requiredScorePercent ? '#10b981' : '#ef4444',
                            pointerEvents: 'none'
                        }}>
                            {React.isValidElement(subject.icon) ? React.cloneElement(subject.icon, { size: 240 }) : null}
                        </div>
                    )}

                    <div style={{ position: 'relative', zIndex: 1, marginBottom: '1rem' }}>
                        {resultPercent >= requiredScorePercent ? <Trophy size={60} color="#10b981" /> : <AlertCircle size={60} color="#ef4444" />}
                    </div>

                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', position: 'relative', zIndex: 1 }}>
                        {resultPercent >= requiredScorePercent ? '¡Dominio Alcanzado!' : 'Sigue Practicando'}
                    </h3>

                    {/* Tarjeta con métricas de evaluación: Correctas, Incorrectas y Porcentaje */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px',
                        width: '100%',
                        maxWidth: '460px',
                        margin: '1.25rem 0 1.5rem',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        {/* 1. Correctas */}
                        <div style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '16px',
                            padding: '12px',
                            textAlign: 'center'
                        }}>
                            <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 900 }}>
                                {quizScore}
                            </div>
                            <div style={{ color: '#6ee7b7', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                Correctas
                            </div>
                        </div>

                        {/* 2. Incorrectas */}
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '16px',
                            padding: '12px',
                            textAlign: 'center'
                        }}>
                            <div style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 900 }}>
                                {quizQuestions.length - quizScore}
                            </div>
                            <div style={{ color: '#fca5a5', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                Incorrectas
                            </div>
                        </div>

                        {/* 3. Porcentaje */}
                        <div style={{
                            background: resultPercent >= requiredScorePercent ? 'rgba(56, 189, 248, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            border: `1px solid ${resultPercent >= requiredScorePercent ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                            borderRadius: '16px',
                            padding: '12px',
                            textAlign: 'center'
                        }}>
                            <div style={{ color: resultPercent >= requiredScorePercent ? '#38bdf8' : '#fbbf24', fontSize: '1.5rem', fontWeight: 900 }}>
                                {Math.round(resultPercent)}%
                            </div>
                            <div style={{ color: resultPercent >= requiredScorePercent ? '#7dd3fc' : '#fde68a', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                Acierto
                            </div>
                        </div>
                    </div>

                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem', maxWidth: '520px', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                        {resultPercent >= requiredScorePercent
                            ? `¡Excelente trabajo! Has superado el reto con ${quizScore} de ${quizQuestions.length} respuestas correctas (${Math.round(resultPercent)}%). El progreso ha sido guardado exitosamente.`
                            : `Has acertado ${quizScore} de ${quizQuestions.length} (${Math.round(resultPercent)}%). Para avanzar necesitas al menos ${requiredScorePercent}% de aciertos. ¡Repasa el contenido e inténtalo de nuevo!`}
                    </p>

                    <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                        <button
                            onClick={resetQuiz}
                            className="nav-btn nav-btn-prev"
                            style={{ margin: 0, padding: '0.75rem 1.5rem' }}
                        >
                            Repetir Prueba
                        </button>
                        <button
                            onClick={onBackToContent}
                            className="nav-btn nav-btn-complete"
                            style={{ background: subject.color, border: 'none', color: 'white', margin: 0, padding: '0.75rem 1.5rem' }}
                        >
                            Volver al contenido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonQuizBlock;
