import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Clock3, FileQuestion, Flag, Loader2, ShieldAlert } from 'lucide-react';
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
        timeLeft
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
        if (quizMode !== 'question' || !evaluationKey || !user?.id || isLocked) {
            return undefined;
        }

        let cancelled = false;

        const logEvent = async (eventType, severity = 'info', payload = {}) => {
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
        };

        const registerViolation = async (eventType, message, payload = {}) => {
            if (cancelled) return;

            setWarningCount((prev) => {
                const nextWarnings = prev + 1;
                const severity = nextWarnings >= maxWarnings ? 'critical' : 'warning';

                void saveEvaluationProctoringEvent({
                    sessionId: null,
                    userId: user.id,
                    evaluationKey,
                    lessonId: evaluationKey,
                    eventType,
                    severity,
                    warningCount: nextWarnings,
                    payload
                });

                if (nextWarnings >= maxWarnings) {
                    setIsLocked(true);
                    setProctoringAlert('La evaluacion fue bloqueada por cambios repetidos de foco o salida del modo seguro.');
                    void saveEvaluationProctoringEvent({
                        sessionId: null,
                        userId: user.id,
                        evaluationKey,
                        lessonId: evaluationKey,
                        eventType: 'locked',
                        severity: 'critical',
                        warningCount: nextWarnings,
                        payload: {
                            reason: eventType
                        }
                    });
                } else {
                    setProctoringAlert(`${message} Advertencia ${nextWarnings} de ${maxWarnings}.`);
                }

                return nextWarnings;
            });
        };

        if (!proctoringInitializedRef.current) {
            proctoringInitializedRef.current = true;
            void logEvent('exam_started', 'info', {
                require_fullscreen: requireFullscreen,
                max_warnings: maxWarnings
            });
        }

        const handleWindowFocus = () => {
            void logEvent('window_focus', 'info', {
                question_index: currentQ
            });
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                hiddenStartedAtRef.current = Date.now();
                return;
            }

            const hiddenDurationMs = hiddenStartedAtRef.current ? Date.now() - hiddenStartedAtRef.current : 0;
            hiddenStartedAtRef.current = null;

            if (
                examStartedAtRef.current &&
                Date.now() - examStartedAtRef.current > 2500 &&
                hiddenDurationMs >= 1500
            ) {
                void registerViolation('visibility_hidden', 'Detectamos que ocultaste el examen o cambiaste de pestana.', {
                    question_index: currentQ,
                    hidden_duration_ms: hiddenDurationMs
                });
            }

            void logEvent('visibility_visible', 'info', {
                question_index: currentQ
            });
        };

        const handleFullscreenChange = () => {
            if (document.fullscreenElement) {
                if (fullscreenExitTimerRef.current) {
                    window.clearTimeout(fullscreenExitTimerRef.current);
                    fullscreenExitTimerRef.current = null;
                }

                void logEvent('fullscreen_enter', 'info', {
                    question_index: currentQ
                });
                return;
            }

            if (!requireFullscreen) return;

            if (fullscreenExitTimerRef.current) {
                window.clearTimeout(fullscreenExitTimerRef.current);
            }

            fullscreenExitTimerRef.current = window.setTimeout(() => {
                if (
                    !document.fullscreenElement &&
                    examStartedAtRef.current &&
                    Date.now() - examStartedAtRef.current > 2500
                ) {
                    void registerViolation('fullscreen_exit', 'Saliste del modo pantalla completa.', {
                        question_index: currentQ
                    });
                }
            }, 1500);
        };

        const handleCopy = (event) => {
            event.preventDefault();
            void registerViolation('copy_attempt', 'Se intento copiar contenido durante la evaluacion.', {
                question_index: currentQ
            });
        };

        const handlePaste = (event) => {
            event.preventDefault();
            void registerViolation('paste_attempt', 'Se intento pegar contenido durante la evaluacion.', {
                question_index: currentQ
            });
        };

        const handleContextMenu = (event) => {
            event.preventDefault();
            void registerViolation('context_menu', 'Se intento abrir el menu contextual durante la evaluacion.', {
                question_index: currentQ
            });
        };

        window.addEventListener('focus', handleWindowFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            cancelled = true;
            window.removeEventListener('focus', handleWindowFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [currentQ, evaluationKey, isLocked, maxWarnings, quizMode, requireFullscreen, user?.id]);

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

    const handleStartEvaluation = async () => {
        setProctoringAlert('');
        setWarningCount(0);
        warningCountRef.current = 0;
        setIsLocked(false);
        proctoringInitializedRef.current = false;
        examStartedAtRef.current = Date.now();
        hiddenStartedAtRef.current = null;

        if (requireFullscreen && !document.fullscreenElement) {
            try {
                await document.documentElement.requestFullscreen();
            } catch (error) {
                console.error('No se pudo activar pantalla completa:', error);
                setProctoringAlert('Necesitas permitir pantalla completa para iniciar esta evaluacion.');
                return;
            }
        }

        if (fullscreenExitTimerRef.current) {
            window.clearTimeout(fullscreenExitTimerRef.current);
            fullscreenExitTimerRef.current = null;
        }

        startQuiz();
    };

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
        <div className="evaluation-player-page">
            <div className="evaluation-player-shell">
                <header className="evaluation-player-header glass-panel">
                    <div className="evaluation-player-topline">
                        <button className="evaluation-back-btn" onClick={() => navigate('/dashboard/evaluations')}>
                            <ArrowLeft size={18} />
                            Volver
                        </button>
                        <div className="evaluation-course-pill">
                            {evaluationRecord.course?.name || 'Curso'}
                        </div>
                    </div>

                    <div className="evaluation-player-heading">
                        <div>
                            <p className="evaluation-kicker">Evaluacion Formal</p>
                            <h1>{evaluationRecord.title}</h1>
                            <p className="evaluation-description">
                                Modulo {String(evaluationRecord.module_id || evaluationData.moduleId || '').replace('m', '') || 'General'} · {quizQuestions.length} preguntas · {evaluationRecord.points} puntos
                            </p>
                        </div>

                        <div className="evaluation-header-metrics">
                            <div className="evaluation-metric-card">
                                <Clock3 size={18} />
                                <div>
                                    <span>Tiempo restante</span>
                                    <strong>{formatTime(quizMode === 'intro' ? totalEvaluationSeconds : totalRemainingSeconds)}</strong>
                                </div>
                            </div>
                            <div className="evaluation-metric-card">
                                <Flag size={18} />
                                <div>
                                    <span>Progreso</span>
                                    <strong>{quizMode === 'intro' ? '0' : Math.min(currentQ + 1, quizQuestions.length)} / {quizQuestions.length}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="evaluation-progress-block">
                        <div className="evaluation-progress-meta">
                            <span>{progressPercent}% completado</span>
                            <span>Pregunta {quizMode === 'intro' ? 0 : Math.min(currentQ + 1, quizQuestions.length)} de {quizQuestions.length}</span>
                        </div>
                        <div className="evaluation-progress-track">
                            <div className="evaluation-progress-fill" style={{ width: `${progressPercent}%` }} />
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
                                    const isAnswered = index < currentQ;

                                    return (
                                        <button
                                            key={question.id || `${evaluationKey}-question-${index + 1}`}
                                            type="button"
                                            className={`evaluation-question-chip ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}`}
                                            disabled
                                        >
                                            {isAnswered ? <CheckCircle2 size={14} /> : index + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </aside>

                        <div className="evaluation-question-main glass-panel">
                            {(proctoringAlert || requireFullscreen) && (
                                <div className={`evaluation-proctoring-banner ${isLocked ? 'critical' : 'warning'}`}>
                                    {isLocked ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
                                    <div>
                                        {proctoringAlert ? (
                                            <strong>{proctoringAlert}</strong>
                                        ) : (
                                            <strong>Modo supervision activo. Permanece en esta ventana y en pantalla completa.</strong>
                                        )}
                                        <span>Advertencias: {warningCount} / {maxWarnings}{requireFullscreen ? ` · Pantalla completa: ${isFullscreen ? 'activa' : 'inactiva'}` : ''}</span>
                                    </div>
                                </div>
                            )}

                            {isLocked ? (
                                <div className="evaluation-lock-screen">
                                    <ShieldAlert size={42} />
                                    <h2>Evaluacion bloqueada</h2>
                                    <p>El intento quedo bloqueado por eventos de supervision repetidos. El docente puede revisar el historial y decidir si autoriza un nuevo intento.</p>
                                    <div className="evaluation-result-actions">
                                        <button className="evaluation-ghost-btn" onClick={resetQuiz}>
                                            Salir del intento
                                        </button>
                                        <button className="evaluation-primary-btn" onClick={() => navigate('/dashboard/evaluations')}>
                                            Volver a evaluaciones
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="evaluation-question-topbar">
                                        <div className="evaluation-question-counter">
                                            <span>Pregunta</span>
                                            <strong>{currentQ + 1}</strong>
                                        </div>
                                        <div className="evaluation-question-timer">
                                            <Clock3 size={16} />
                                            <span>{formatTime(timeLeft)}</span>
                                        </div>
                                    </div>

                                    <div className="evaluation-question-body">
                                        <h2>{currentQuestion.q}</h2>
                                        <div className="evaluation-options-list">
                                            {currentQuestion.options.map((option, index) => {
                                                const isSelected = selectedAnswer === index;
                                                const isCorrect = selectedAnswer !== null && currentQuestion.correct === index;
                                                const isWrongSelection = selectedAnswer === index && currentQuestion.correct !== index;

                                                return (
                                                    <button
                                                        key={`${currentQuestion.id || currentQ}-option-${index}`}
                                                        type="button"
                                                        className={`evaluation-option-card ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrongSelection ? 'wrong' : ''}`}
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
