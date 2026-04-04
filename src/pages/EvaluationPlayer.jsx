import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Clock3, FileQuestion, Flag, Loader2, ShieldAlert, X } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getEvaluationData } from '../evaluations';
import { useLessonQuiz } from '../hooks/useLessonQuiz';
import { saveEvaluationProctoringEvent } from '../lib/learningAnalytics';
import { supabase } from '../lib/supabase';
import './EvaluationPlayer.css';

const formatTime = (seconds) => {
    const safeSeconds = Math.max(0, seconds);
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const EvaluationPlayer = () => {
    const { evaluationKey } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [evaluationRecord, setEvaluationRecord] = useState(null);
    const [evaluationData, setEvaluationData] = useState(null);
    const [loadError, setLoadError] = useState('');
    const [warningCount, setWarningCount] = useState(0);
    const [proctoringAlert, setProctoringAlert] = useState('');
    const [isLocked, setIsLocked] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
    const [isEvaluationMode, setIsEvaluationMode] = useState(false);
    const warningCountRef = useRef(0);
    const proctoringInitializedRef = useRef(false);
    const examStartedAtRef = useRef(null);
    const hiddenStartedAtRef = useRef(null);
    const fullscreenExitTimerRef = useRef(null);

    useEffect(() => {
        const loadEvaluation = async () => {
            if (!evaluationKey) {
                setLoadError('No se encontro la evaluacion solicitada.');
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('evaluations')
                    .select('*, course:courses(*)')
                    .eq('evaluation_key', evaluationKey)
                    .maybeSingle();

                if (error) throw error;
                if (!data) {
                    setLoadError('La evaluacion no existe en la base de datos.');
                    setLoading(false);
                    return;
                }

                const [courseAbbr, moduleId, evaluationId] = evaluationKey.split('-');
                const content = await getEvaluationData(courseAbbr?.toUpperCase(), moduleId, evaluationId);

                if (!content) {
                    setLoadError('La definicion de esta evaluacion no existe en el frontend.');
                    setLoading(false);
                    return;
                }

                setEvaluationRecord(data);
                setEvaluationData(content);
            } catch (error) {
                console.error('Error cargando evaluacion:', error);
                setLoadError('No se pudo cargar la evaluacion.');
            } finally {
                setLoading(false);
            }
        };

        void loadEvaluation();
    }, [evaluationKey]);

    const totalEvaluationSeconds = useMemo(() => {
        const questions = evaluationData?.questions?.length ?? 0;
        const perQuestion = evaluationData?.quizConfig?.timePerQuestion ?? 45;
        return questions * perQuestion;
    }, [evaluationData]);

    const quiz = useLessonQuiz({
        user,
        lessonKey: evaluationKey,
        lessonTitle: evaluationData?.title,
        lessonQuestions: evaluationData?.questions ?? [],
        quizConfig: evaluationData?.quizConfig ?? {},
        moduleId: evaluationRecord?.module_id ?? evaluationData?.moduleId ?? null,
        lessonId: evaluationKey
    });

    const {
        currentQuestion,
        currentQ,
        handleQuizAnswer,
        quizMode,
        quizQuestions,
        quizScore,
        requiredScorePercent,
        resetQuiz,
        resultPercent,
        selectedAnswer,
        startQuiz,
        timeLeft,
        userAnswers
    } = quiz;

    const maxWarnings = evaluationData?.proctoringConfig?.maxWarnings ?? 3;
    const requireFullscreen = evaluationData?.proctoringConfig?.requireFullscreen ?? true;

    const answeredCount = currentQ + (quizMode === 'result' ? 1 : 0);
    const progressPercent = quizQuestions.length > 0
        ? Math.round(((quizMode === 'intro' ? 0 : answeredCount) / quizQuestions.length) * 100)
        : 0;
    const totalRemainingSeconds = Math.max(
        0,
        ((quizQuestions.length - currentQ - (quizMode === 'result' ? 0 : 1)) * (evaluationData?.quizConfig?.timePerQuestion ?? 45)) + timeLeft
    );

    const logEvent = useCallback(async (eventType, severity = 'info', payload = {}) => {
        if (!user?.id || !evaluationKey) return;
        try {
            await saveEvaluationProctoringEvent({
                sessionId: null,
                userId: user.id,
                evaluationKey,
                lessonId: evaluationKey,
                eventType,
                severity,
                warningCount: warningCountRef.current,
                payload
            });
        } catch (error) {
            console.error('Error guardando evento de supervision:', error);
        }
    }, [user?.id, evaluationKey]);

    const registerViolation = useCallback(async (eventType, message, payload = {}) => {
        if (isLocked) return;

        setWarningCount(prev => {
            const nextWarnings = prev + 1;
            const severity = nextWarnings >= maxWarnings ? 'critical' : 'warning';

            void logEvent(eventType, severity, {
                ...payload,
                warning_count_after: nextWarnings
            });

            if (nextWarnings >= maxWarnings) {
                setIsLocked(true);
                setProctoringAlert('La evaluación fue bloqueada por cambios repetidos de foco o salida del modo seguro.');
                void logEvent('exam_locked', 'critical', {
                    reason: eventType,
                    final_warning_count: nextWarnings,
                    payload
                });
            } else {
                setProctoringAlert(`${message} Advertencia ${nextWarnings} de ${maxWarnings}.`);
            }
            return nextWarnings;
        });
    }, [isLocked, maxWarnings, logEvent]);

    const restoreFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {
                console.warn("Restauración de pantalla completa bloqueada. Se requiere interacción del usuario.");
            });
        }
    }, []);

    useEffect(() => {
        warningCountRef.current = warningCount;
    }, [warningCount]);

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };

        document.addEventListener('fullscreenchange', onFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', onFullscreenChange);

            if (fullscreenExitTimerRef.current) {
                window.clearTimeout(fullscreenExitTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (quizMode !== 'question') return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Tab' || e.key === 'Meta' || e.key === 'OS') {
                e.preventDefault();
                setProctoringAlert(`Tecla ${e.key === 'Escape' ? 'Esc' : 'especial'} bloqueada. Registrando infraccion...`);

                // Intentar restaurar inmediatamente para aprovechar el contexto del evento keydown
                restoreFullscreen();

                // Registrar como violación
                void registerViolation('key_press_attempt', `Intento de usar tecla de sistema: ${e.key}`);

                setTimeout(restoreFullscreen, 100);
                setTimeout(restoreFullscreen, 300);
                setTimeout(restoreFullscreen, 500);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        const fullscreenCheck = setInterval(() => {
            if (quizMode === 'question' && !document.fullscreenElement) {
                setProctoringAlert('Saliste de pantalla completa. Volviendo...');
                restoreFullscreen();
            }
        }, 1000);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            clearInterval(fullscreenCheck);
        };
    }, [quizMode, restoreFullscreen, registerViolation]);

    useEffect(() => {
        if (quizMode !== 'question' || !evaluationKey || !user?.id || isLocked) {
            return undefined;
        }

        if (!proctoringInitializedRef.current) {
            proctoringInitializedRef.current = true;
            void logEvent('exam_started', 'info', {
                require_fullscreen: requireFullscreen,
                max_warnings: maxWarnings
            });
        }

        const handleFocus = () => logEvent('window_focus', 'info', { question_index: currentQ });

        const handleVisibility = () => {
            if (document.visibilityState === 'hidden') {
                hiddenStartedAtRef.current = Date.now();
                return;
            }
            const duration = hiddenStartedAtRef.current ? Date.now() - hiddenStartedAtRef.current : 0;
            hiddenStartedAtRef.current = null;

            if (examStartedAtRef.current && Date.now() - examStartedAtRef.current > 1000) {
                void registerViolation('visibility_hidden', 'Detectamos que ocultaste el examen o cambiaste de pestana.', {
                    question_index: currentQ,
                    hidden_duration_ms: duration
                });
            }
            void logEvent('visibility_visible', 'info', { question_index: currentQ });
        };

        const handleFS = () => {
            if (document.fullscreenElement) {
                if (fullscreenExitTimerRef.current) {
                    window.clearTimeout(fullscreenExitTimerRef.current);
                    fullscreenExitTimerRef.current = null;
                }
                void logEvent('fullscreen_enter', { question_index: currentQ });
                return;
            }
            if (!requireFullscreen) return;

            if (!document.fullscreenElement && examStartedAtRef.current && Date.now() - examStartedAtRef.current > 1000) {
                void registerViolation('fullscreen_exit', 'Saliste del modo pantalla completa.', { question_index: currentQ });
                // Intentar volver inmediatamente
                restoreFullscreen();
            }
        };

        const handleCopy = (e) => {
            e.preventDefault();
            void registerViolation('copy_attempt', 'Se intento copiar contenido.', { question_index: currentQ });
        };

        const handlePaste = (e) => {
            e.preventDefault();
            void registerViolation('paste_attempt', 'Se intento pegar contenido.', { question_index: currentQ });
        };

        const handleCtx = (e) => {
            e.preventDefault();
            void registerViolation('context_menu', 'Se intento abrir el menu contextual.', { question_index: currentQ });
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibility);
        document.addEventListener('fullscreenchange', handleFS);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('contextmenu', handleCtx);

        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibility);
            document.removeEventListener('fullscreenchange', handleFS);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('contextmenu', handleCtx);
            if (fullscreenExitTimerRef.current) window.clearTimeout(fullscreenExitTimerRef.current);
        };
    }, [quizMode, evaluationKey, user?.id, isLocked, currentQ, logEvent, registerViolation, requireFullscreen, maxWarnings]);

    useEffect(() => {
        if (quizMode === 'result' && evaluationKey && user?.id) {
            void saveEvaluationProctoringEvent({
                sessionId: null,
                userId: user.id,
                evaluationKey,
                lessonId: evaluationKey,
                eventType: 'submitted',
                severity: 'info',
                warningCount,
                payload: {
                    final_score_percent: resultPercent,
                    correct_answers: quizScore
                }
            });
        }
    }, [evaluationKey, quizMode, quizScore, resultPercent, user?.id, warningCount]);

    useEffect(() => {
        if (quizMode === 'result') {
            localStorage.setItem('evaluationStarted', 'false');
            setIsEvaluationMode(false);
        }
    }, [quizMode]);

    const handleStartEvaluation = async () => {
        setProctoringAlert('');
        setWarningCount(0);
        warningCountRef.current = 0; // Reset ref as well
        setIsLocked(false);
        proctoringInitializedRef.current = false; // Allow re-initialization of proctoring events
        examStartedAtRef.current = Date.now();
        hiddenStartedAtRef.current = null;

        localStorage.setItem('evaluationStarted', 'true');
        setIsEvaluationMode(true);

        if (requireFullscreen && !document.fullscreenElement) {
            try {
                await document.documentElement.requestFullscreen();
            } catch (error) {
                console.error('No se pudo activar pantalla completa:', error);
                // Optionally, inform the user that fullscreen failed and they might get warnings
                setProctoringAlert('No se pudo activar pantalla completa. Asegúrate de permitirlo en tu navegador.');
            }
        }

        startQuiz();
    };

    // Efecto para controlar la visibilidad de la barra lateral global
    useEffect(() => {
        const isQuizActive = quizMode === 'question' || isLocked;

        if (isQuizActive) {
            document.body.classList.add('evaluation-focus-mode');
        } else {
            document.body.classList.remove('evaluation-focus-mode');
        }

        return () => document.body.classList.remove('evaluation-focus-mode');
    }, [quizMode, isLocked]);

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (loading) {
        return (
            <div className="evaluation-player-page">
                <div className="evaluation-player-loading glass-panel">
                    <Loader2 size={28} className="spin" />
                    <p>Cargando evaluacion...</p>
                </div>
            </div>
        );
    }

    if (loadError || !evaluationRecord || !evaluationData) {
        return (
            <div className="evaluation-player-page">
                <div className="evaluation-player-error glass-panel">
                    <FileQuestion size={36} />
                    <h2>No se pudo abrir la evaluacion</h2>
                    <p>{loadError || 'Falta informacion para mostrar esta evaluacion.'}</p>
                    <Link to="/dashboard/evaluations" className="evaluation-ghost-btn">
                        Volver a evaluaciones
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`evaluation-player-page ${quizMode === 'question' || isLocked ? 'is-quiz-active' : 'is-intro-active'}`}>
            <div className="evaluation-player-shell">
                <header className="evaluation-player-header glass-panel">
                    <div className="evaluation-player-topline">
                        {quizMode !== 'question' && (
                            <button className="evaluation-back-btn" onClick={() => navigate('/dashboard/evaluations')}>
                                <ArrowLeft size={18} />
                                Volver
                            </button>
                        )}
                        <div className="evaluation-course-pill">
                            {evaluationRecord.course?.name || 'Curso'}
                        </div>
                    </div>

                    <div className="evaluation-player-heading">
                        <div>
                            <p className="evaluation-kicker">Evaluacion</p>
                            <h1>{evaluationData?.title || 'Evaluacion del modulo 1'}</h1>
                            <p className="evaluation-description">
                                Modulo {String(evaluationRecord.module_id || evaluationData.moduleId || '').replace('m', '') || 'General'} · {quizQuestions.length} preguntas · {evaluationRecord.points} puntos
                            </p>
                        </div>

                        <div className="evaluation-header-metrics">
                            <div className="evaluation-metric-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShieldAlert size={16} style={{ color: '#34d399' }} />
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Supervisión activa</span>
                                </div>
                                {warningCount > 0 && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.25rem 0.5rem',
                                        background: 'rgba(239, 68, 68, 0.15)',
                                        color: '#f87171',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '8px',
                                        fontSize: '0.7rem',
                                        fontWeight: '700'
                                    }}>
                                        <span>Infracciones: {warningCount}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {quizMode === 'intro' && (
                    <section className="evaluation-stage evaluation-intro-layout">
                        <div className="evaluation-intro-main glass-panel">
                            <div
                                className="evaluation-rich-content lesson-content-container"
                                dangerouslySetInnerHTML={{ __html: evaluationData.content }}
                            />
                        </div>

                        <aside className="evaluation-intro-side glass-panel">
                            <h2>Listo para comenzar</h2>
                            <p>La experiencia esta pensada para foco total: una pregunta por pantalla, progreso visible y transicion rapida entre respuestas.</p>
                            <div className="evaluation-intro-stats">
                                <div>
                                    <span>Preguntas</span>
                                    <strong>{quizQuestions.length}</strong>
                                </div>
                                <div>
                                    <span>Tiempo por pregunta</span>
                                    <strong>{evaluationData.quizConfig?.timePerQuestion ?? 45}s</strong>
                                </div>
                                <div>
                                    <span>Minimo requerido</span>
                                    <strong>{requiredScorePercent}%</strong>
                                </div>
                            </div>
                            <button className="evaluation-primary-btn" onClick={handleStartEvaluation}>
                                Comenzar evaluacion
                            </button>
                            <p className="evaluation-proctoring-note">
                                Esta evaluacion registra cambios de ventana, salidas de pantalla completa e intentos de copiar o pegar.
                            </p>
                        </aside>
                    </section>
                )}

                {quizMode === 'question' && currentQuestion && (
                    <section className="evaluation-stage evaluation-question-layout">
                        <aside className="evaluation-question-nav glass-panel">
                            <div className="evaluation-question-nav-head">
                                <h3>Preguntas</h3>
                                <span>{Math.min(currentQ + 1, quizQuestions.length)} / {quizQuestions.length}</span>
                            </div>
                            <div className="evaluation-question-grid">
                                {quizQuestions.map((question, index) => {
                                    const isCurrent = index === currentQ;
                                    
                                    // Si es la pregunta actual, usar selectedAnswer
                                    // Si es pregunta anterior, buscar en userAnswers
                                    let isAnswered = false;
                                    let isCorrect = false;
                                    
                                    if (isCurrent) {
                                        // Pregunta actual: tiene respuesta si selectedAnswer no es null
                                        if (selectedAnswer !== null) {
                                            isAnswered = true;
                                            isCorrect = question.correct === selectedAnswer;
                                        }
                                    } else if (index < currentQ) {
                                        // Preguntas anteriores: buscar en userAnswers por índice
                                        const answerData = userAnswers && userAnswers[index];
                                        if (answerData) {
                                            isAnswered = true;
                                            isCorrect = answerData.is_correct || answerData.isCorrect || answerData.correct;
                                        }
                                    }

                                    return (
                                        <button
                                            key={question.id || `${evaluationKey}-question-${index + 1}`}
                                            type="button"
                                            className={`evaluation-question-chip ${isCurrent && !isAnswered ? 'current' : ''} ${isAnswered ? (isCorrect ? 'answered' : 'wrong') : ''}`}
                                            disabled
                                        >
                                            {isAnswered ? (
                                                isCorrect ? <CheckCircle2 size={14} /> : <X size={14} />
                                            ) : (
                                                index + 1
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </aside>

                        <div className="evaluation-question-main glass-panel">
                            {(proctoringAlert || isLocked) && (
                                <div className="proctoring-modal-overlay">
                                    <div className={`proctoring-modal glass-panel ${isLocked ? 'critical' : 'warning'}`}>
                                        <button
                                            className="close-proctoring-modal"
                                            onClick={() => {
                                                if (!isLocked) {
                                                    setProctoringAlert('');
                                                    restoreFullscreen();
                                                }
                                            }}
                                        >
                                            {isLocked ? <X size={20} /> : <X size={20} />}
                                        </button>
                                        <div className="proctoring-modal-content">
                                            {isLocked ? <ShieldAlert size={48} /> : <AlertTriangle size={48} />}
                                            <h3>{isLocked ? 'Examen Bloqueado' : 'Advertencia de Supervisión'}</h3>
                                            <p>{proctoringAlert || 'El intento quedó bloqueado por eventos de supervisión repetidos. El docente puede revisar el historial y decidir si autoriza un nuevo intento.'}</p>

                                            {isLocked && (
                                                <div className="evaluation-result-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                                                    <button className="evaluation-ghost-btn" onClick={resetQuiz}>
                                                        Salir del intento
                                                    </button>
                                                    <button className="evaluation-primary-btn" onClick={() => navigate('/dashboard/evaluations')}>
                                                        Volver a evaluaciones
                                                    </button>
                                                </div>
                                            )}

                                            {!isLocked && (
                                                <div className="proctoring-progress-zone">
                                                    <div className="proctoring-progress-labels">
                                                        <span>Infracciones</span>
                                                        <span>{warningCount} / {maxWarnings}</span>
                                                    </div>
                                                    <div className="proctoring-progress-track">
                                                        <div
                                                            className="proctoring-progress-fill"
                                                            style={{ width: `${(warningCount / maxWarnings) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {!isLocked && (
                                                <button className="proctoring-continue-btn" onClick={() => {
                                                    setProctoringAlert('');
                                                    restoreFullscreen();
                                                }}>
                                                    Entendido, volver al examen
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isLocked && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                        <div className="evaluation-question-timer" style={{ 
                                            background: 'rgba(139, 92, 246, 0.15)', 
                                            border: '1px solid rgba(139, 92, 246, 0.3)',
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '12px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <Clock3 size={20} style={{ color: '#a78bfa' }} />
                                            <span style={{ color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                {formatTime(timeLeft)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="evaluation-question-body">
                                        <h2>{currentQuestion.q}</h2>
                                        <div className="evaluation-options-list">
                                            {currentQuestion.options.map((option, index) => {
                                                const isSelected = selectedAnswer === index;
                                                const isCorrectOption = currentQuestion.correct === index;
                                                const showCorrect = selectedAnswer !== null && isCorrectOption;

                                                return (
                                                    <button
                                                        key={`${currentQuestion.id || currentQ}-option-${index}`}
                                                        type="button"
                                                        className={`evaluation-option-card ${isSelected ? 'selected' : ''} ${selectedAnswer !== null && isSelected && isCorrectOption ? 'correct' : ''} ${selectedAnswer !== null && isSelected && !isCorrectOption ? 'wrong' : ''} ${selectedAnswer !== null && !isSelected && isCorrectOption ? 'revealed' : ''}`}
                                                        onClick={() => handleQuizAnswer(index)}
                                                        disabled={selectedAnswer !== null}
                                                    >
                                                        <span className="evaluation-option-letter">
                                                            {String.fromCharCode(65 + index)}
                                                        </span>
                                                        <span className="evaluation-option-text">{option}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="evaluation-question-footer">
                                        <button className="evaluation-ghost-btn" type="button" disabled>
                                            <ChevronLeft size={16} />
                                            Anterior
                                        </button>
                                        <button className="evaluation-ghost-btn" type="button" disabled>
                                            Siguiente
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>
                )}

                {quizMode === 'result' && (
                    <section className="evaluation-stage evaluation-result-layout">
                        <div className="evaluation-result-card glass-panel">
                            <div className="evaluation-result-badge">
                                <CheckCircle2 size={24} />
                                Evaluacion terminada
                            </div>
                            <h2>{resultPercent >= requiredScorePercent ? 'Buen trabajo' : 'Aun puedes mejorar'}</h2>
                            <p>
                                Obtuviste {quizScore} respuestas correctas de {quizQuestions.length}. El puntaje final fue de <strong>{resultPercent}%</strong>.
                            </p>

                            <div className="evaluation-result-stats">
                                <div>
                                    <span>Puntaje</span>
                                    <strong>{resultPercent}%</strong>
                                </div>
                                <div>
                                    <span>Aciertos</span>
                                    <strong>{quizScore}</strong>
                                </div>
                                <div>
                                    <span>Minimo</span>
                                    <strong>{requiredScorePercent}%</strong>
                                </div>
                            </div>

                            <div className="evaluation-result-actions">
                                <button className="evaluation-ghost-btn" onClick={resetQuiz}>
                                    Reintentar
                                </button>
                                <button className="evaluation-primary-btn" onClick={() => navigate('/dashboard/evaluations')}>
                                    Volver a evaluaciones
                                </button>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default EvaluationPlayer;
