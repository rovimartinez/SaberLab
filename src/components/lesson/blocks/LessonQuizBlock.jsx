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
        <div className="quiz-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {quizMode === 'intro' && (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)',
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
                            {React.isValidElement(subject.icon) ? React.cloneElement(subject.icon, { size: 220 }) : null}
                        </div>
                    )}

                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem', position: 'relative', zIndex: 1 }}>
                        {block.quizConfig?.title || block.title || 'Prueba'}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5, marginBottom: '1.75rem', maxWidth: '550px', position: 'relative', zIndex: 1 }}>
                        Demuestra lo que has aprendido en esta leccion. Completa este reto para validar tus conocimientos y desbloquear el siguiente nivel.
                    </p>
                    <ul style={{ textAlign: 'left', color: 'var(--text-primary)', marginBottom: '2rem', display: 'inline-block', listStyle: 'none', padding: 0, position: 'relative', zIndex: 1 }}>
                        <li style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                            {quizQuestions.length} preguntas de opcion multiple
                        </li>
                        <li style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: subject.color }}></div>
                            {quizTimeLimit} segundos por pregunta
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
                            Necesitas {requiredScorePercent}% de aciertos para avanzar
                        </li>
                    </ul>
                    <button
                        onClick={startQuiz}
                        className="nav-btn nav-btn-complete"
                        style={{ background: subject.color, border: 'none', color: 'white', padding: '0.85rem 2.5rem', fontSize: '1.1rem', fontWeight: 700, boxShadow: `0 8px 15px ${subject.color}30`, margin: '0', position: 'relative', zIndex: 1 }}
                    >
                        Iniciar Prueba
                    </button>
                </div>
            )}

            {quizMode === 'question' && currentQuestion && (
                <div style={{
                    animation: 'fadeIn 0.5s ease-out',
                    position: 'relative',
                    padding: '1rem',
                    borderRadius: '24px',
                    overflow: 'hidden'
                }}>
                    {selectedAnswer === -1 && (
                        <div className="animate-scale-in" style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 20,
                            background: 'rgba(15, 23, 42, 0.9)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                                <X size={80} color="#ef4444" strokeWidth={3} />
                            </div>
                            <span style={{ color: 'white', fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>
                                Tiempo agotado
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

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>
                            Pregunta {currentQ + 1} de {quizQuestions.length}
                        </span>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: timeLeft > 20 ? '#10b981' : timeLeft > 10 ? '#f59e0b' : '#ef4444',
                            fontWeight: 700,
                            fontSize: '1.2rem',
                            position: 'relative',
                            zIndex: 2,
                            transition: 'color 0.3s ease'
                        }}>
                            <Clock size={22} />
                            {timeLeft}s
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '3px', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
                        {[...Array(questionTimeSegments)].map((_, index) => (
                            <div
                                key={`${block.id}-timer-${index}`}
                                style={{
                                    flex: 1,
                                    height: '8px',
                                    background: index < questionTimeFill
                                        ? (timeLeft > 20 ? '#10b981' : timeLeft > 10 ? '#f59e0b' : '#ef4444')
                                        : 'rgba(255,255,255,0.1)',
                                    borderRadius: '2px',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        ))}
                    </div>

                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '2rem', lineHeight: 1.5 }}>
                        {currentQuestion.q}
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
