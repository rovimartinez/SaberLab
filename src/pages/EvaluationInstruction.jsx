import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ShieldCheck, Award, Zap, Eye, Lock, Layers, ArrowRight, Radio } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';
import { LESSONS_REGISTRY } from '../data/coursesData.jsx';
import '../styles/EvaluationInstruction.css';

const EvaluationInstruction = () => {
    const { evaluationKey } = useParams();
    const navigate = useNavigate();
    const { isStaff, lessonVisibility } = useAuth();
    const [evaluation, setEvaluation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isResuming, setIsResuming] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [attemptData, setAttemptData] = useState(null);

    useEffect(() => {
        const started = localStorage.getItem(`exam_started_${evaluationKey}`);
        const endTime = localStorage.getItem(`exam_end_time_${evaluationKey}`);
        
        if (started === 'true' && endTime) {
            const now = Math.floor(Date.now() / 1000);
            if (parseInt(endTime, 10) > now) {
                setIsResuming(true);
            }
        }
    }, [evaluationKey]);

    useEffect(() => {
        const fetchEvaluation = async () => {
            if (!evaluationKey) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await api(`/evaluations?key=${encodeURIComponent(evaluationKey)}`);

                if (data && data.questions) {
                    setEvaluation(data);
                } else if (LESSONS_REGISTRY[evaluationKey]) {
                    const lesson = await LESSONS_REGISTRY[evaluationKey].load?.();
                    if (lesson) {
                        setEvaluation({
                            id: evaluationKey,
                            evaluation_key: evaluationKey,
                            title: lesson.title || 'Evaluación de Módulo',
                            description: lesson.description || (evaluationKey.startsWith('ee-') ? 'Evaluación Integral del Módulo 1 (Teoría: 60 pts + Práctica: 90 pts = 150 pts)' : 'Evaluación del Módulo'),
                            instructions: lesson.instructions || (evaluationKey.startsWith('ee-') ? 'El examen oficial consta de 2 fases evaluativas:\n\n1. Fase Teórica (60 Puntos): 30 preguntas de opción múltiple conceptuales y contextuales (2 pts c/u) sin cálculos matemáticos.\n2. Fase Práctica (90 Puntos): Análisis y resolución interactiva de la red mixta de 8 resistores (Req, IT, PT, 8 voltajes y 6 corrientes de rama).\n\nPuedes alternar entre ambas partes con las pestañas superiores antes de pulsar el botón "Entregar Examen".' : 'Lee con atención cada pregunta y selecciona la respuesta correcta. Asegúrate de tener una conexión estable.'),
                            questions: lesson.questions || [],
                            points: lesson.points || 150,
                            time_limit: lesson.time_limit || 60,
                            passing_score: lesson.passing_score || 70
                        });
                    }
                }

                // 1. Consultar persistencia local inmediata
                const normKey = (evaluationKey || '').toLowerCase();
                const savedCompleted = localStorage.getItem(`exam_completed_${normKey}`) || 
                                       localStorage.getItem(`exam_completed_${evaluationKey}`);
                if (savedCompleted) {
                    try {
                        const parsed = JSON.parse(savedCompleted);
                        setIsCompleted(true);
                        setAttemptData(parsed);
                        setIsResuming(false);
                    } catch {}
                }

                // 2. Consultar intento completado en base de datos
                try {
                    const { data: attempts } = await api(`/attempts?evaluation_key=${encodeURIComponent(evaluationKey)}`);
                    if (Array.isArray(attempts) && attempts.length > 0) {
                        const att = attempts[0];
                        if (att.completed_at) {
                            setIsCompleted(true);
                            setAttemptData(att);
                            setIsResuming(false);
                        }
                    }
                } catch {}

            } catch (err) {
                console.error('Error cargando evaluación:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvaluation();
    }, [evaluationKey]);

    const handleStartExam = () => {
        if (evaluation) {
            const endTime = localStorage.getItem(`exam_end_time_${evaluationKey}`);
            const now = Math.floor(Date.now() / 1000);
            if (!endTime || parseInt(endTime, 10) <= now) {
                const limitSeconds = (evaluation.time_limit || 60) * 60;
                localStorage.setItem(`exam_end_time_${evaluationKey}`, (now + limitSeconds).toString());
                localStorage.setItem(`exam_started_${evaluationKey}`, 'true');
            }
            navigate(`/dashboard/evaluations/${evaluation.evaluation_key}/play`);
        }
    };

    const handleResetAndStartFresh = () => {
        if (window.confirm('¿Deseas reiniciar la evaluación desde cero? Se borrarán todas las respuestas guardadas anteriormente.')) {
            localStorage.removeItem(`exam_answers_${evaluationKey}`);
            localStorage.removeItem(`exam_current_q_${evaluationKey}`);
            localStorage.removeItem(`exam_started_${evaluationKey}`);
            localStorage.removeItem(`exam_end_time_${evaluationKey}`);
            localStorage.removeItem(`exam_shuffled_questions_${evaluationKey}`);
            setIsResuming(false);
            const now = Math.floor(Date.now() / 1000);
            const limitSeconds = (evaluation?.time_limit || 60) * 60;
            localStorage.setItem(`exam_end_time_${evaluationKey}`, (now + limitSeconds).toString());
            localStorage.setItem(`exam_started_${evaluationKey}`, 'true');
            navigate(`/dashboard/evaluations/${evaluation.evaluation_key}/play`);
        }
    };

    const handleResetAttempt = async () => {
        if (!window.confirm('¿Deseas restablecer este intento como Docente/Admin? Se eliminará el registro de finalización de la base de datos y de tu navegador para que puedas presentar o probar el examen de nuevo.')) return;
        try {
            await api(`/attempts?evaluation_key=${encodeURIComponent(evaluationKey)}`, { method: 'DELETE' });
        } catch (e) {
            console.error('Error eliminando intento:', e);
        }
        const normKey = (evaluationKey || '').toLowerCase();
        localStorage.removeItem(`exam_completed_${evaluationKey}`);
        localStorage.removeItem(`exam_completed_${normKey}`);
        localStorage.removeItem(`exam_answers_${evaluationKey}`);
        localStorage.removeItem(`exam_started_${evaluationKey}`);
        localStorage.removeItem(`exam_end_time_${evaluationKey}`);
        localStorage.removeItem(`exam_current_q_${evaluationKey}`);
        localStorage.removeItem(`exam_shuffled_questions_${evaluationKey}`);
        localStorage.removeItem(`exam_strikes_${evaluationKey}`);
        localStorage.removeItem(`exam_infractions_${evaluationKey}`);
        localStorage.removeItem(`practical_answers_${evaluationKey}`);
        localStorage.removeItem(`practical_answers_${normKey}`);
        setIsCompleted(false);
        setAttemptData(null);
        setIsResuming(false);
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="eval-instruction-page">
                <div className="page-header blue">
                    <div className="header-title">
                        <ShieldCheck size={28} color="#0284c7" />
                        <h1>Cargando...</h1>
                    </div>
                </div>
            </div>
        );
    }

    if (!evaluation) {
        return (
            <div className="eval-instruction-page">
                <div className="page-header blue">
                    <div className="header-title">
                        <ShieldCheck size={28} color="#0284c7" />
                        <h1>Evaluación no encontrada</h1>
                    </div>
                </div>
            </div>
        );
    }

    let questionsList = [];
    if (Array.isArray(evaluation.questions)) {
        questionsList = evaluation.questions;
    } else if (typeof evaluation.questions === 'string') {
        try {
            let p = JSON.parse(evaluation.questions);
            if (typeof p === 'string') p = JSON.parse(p);
            questionsList = Array.isArray(p) ? p : [];
        } catch {
            questionsList = [];
        }
    }
    const questionsCount = questionsList.length;

    if (isCompleted) {
        const isExamenL6 = evaluationKey === 'ee-m1-l6';
        const totalPts = attemptData?.points_obtained ?? attemptData?.score ?? 0;
        const maxExamPts = attemptData?.max_points || evaluation?.points || (isExamenL6 ? 150 : 100);
        const theoryPts = attemptData?.theory_points ?? attemptData?.theoryPts ?? (isExamenL6 ? Math.min(60, totalPts) : totalPts);
        const practicalPts = attemptData?.practical_score ?? attemptData?.practicalPts ?? (isExamenL6 ? Math.max(0, totalPts - theoryPts) : 0);
        const correctCount = attemptData?.correct_count ?? (isExamenL6 ? Math.round(theoryPts / 2) : Math.round((totalPts / (maxExamPts || 1)) * (questionsCount || 20)));

        const isResultsProtected = !isStaff && (evaluation?.results_released === false || evaluation?.results_released === 0 || attemptData?.resultsReleased === false);

        return (
            <div className="eval-instruction-page">
                <div className="page-header blue">
                    <div className="header-title">
                        <Award size={28} color="#10b981" />
                        <h1>{isResultsProtected ? 'Examen Enviado' : 'Examen Terminado'}</h1>
                    </div>
                </div>

                <div className="glass-panel eval-finished-card">
                    <div className="eval-finished-icon">
                        <Award size={44} />
                    </div>

                    <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 900 }}>
                        {isResultsProtected ? '¡Examen Enviado con Éxito!' : '¡Examen Finalizado!'}
                    </h2>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem' }}>
                        Has completado exitosamente <strong style={{ color: 'var(--text-primary)' }}>{evaluation.title}</strong>
                    </p>

                    {isResultsProtected ? (
                        <div style={{
                            background: 'var(--surface-card-subtle)',
                            border: '1.5px solid var(--border-default)',
                            borderRadius: '18px',
                            padding: '1.5rem',
                            marginBottom: '2rem',
                            textAlign: 'left',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem', color: 'var(--brand-primary)', fontWeight: 800 }}>
                                <Lock size={20} />
                                <span style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Calificaciones y Solucionario Protegidos</span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0, lineHeight: '1.6' }}>
                                El docente ha establecido que la retroalimentación detallada y el puntaje oficial se publicarán una vez culmine la sesión de evaluación para todo el grupo. Podrás consultar tu calificación y el solucionario ingresando nuevamente a este enlace cuando las notas sean liberadas.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desglose Teórico y Práctico */}
                            {isExamenL6 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.25rem' }}>
                                        <div style={{ color: '#0284c7', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>PARTE TEÓRICA</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>{theoryPts} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>/ 60 pts</span></div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{correctCount} de 30 preguntas</div>
                                    </div>
                                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.25rem' }}>
                                        <div style={{ color: '#d97706', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>PARTE PRÁCTICA</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>{practicalPts} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>/ 90 pts</span></div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Red Mixta 8 Resistores</div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.25rem' }}>
                                        <div style={{ color: '#0284c7', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>RESPUESTAS CORRECTAS</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>{correctCount} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>/ {questionsCount || 20}</span></div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Aciertos evaluados</div>
                                    </div>
                                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.25rem' }}>
                                        <div style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>EFECTIVIDAD</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>{Math.round((totalPts / (maxExamPts || 1)) * 100)}%</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Rendimiento final</div>
                                    </div>
                                </div>
                            )}

                            {/* Tarjeta de Puntaje Total */}
                            <div className="eval-finished-score-box">
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                    PUNTAJE TOTAL OBTENIDO
                                </div>
                                <div className="eval-score-num">
                                    {totalPts} <span style={{ fontSize: '1.4rem', color: 'var(--text-muted)', fontWeight: 700 }}>/ {maxExamPts} pts</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Botones de acción */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {!isResultsProtected && (
                            <button
                                onClick={() => navigate(`/dashboard/evaluations/${evaluation.evaluation_key}/play?review=true`)}
                                className="eval-btn-start"
                            >
                                <Eye size={20} />
                                <span>{isExamenL6 ? 'Revisar Examen (Teoría y Práctica)' : 'Revisar Examen'}</span>
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                background: 'var(--surface-card)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-default)',
                                padding: '0.85rem 2rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                boxShadow: 'var(--shadow-sm)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Volver al Inicio
                        </button>

                        {isStaff && (
                            <button
                                onClick={handleResetAttempt}
                                className="eval-btn-reset"
                                style={{ marginTop: '0.5rem' }}
                            >
                                🔄 Restablecer Intento (Modo Docente / Admin)
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Si el examen fue bloqueado por el docente, los estudiantes no pueden ingresar
    const normKey = (evaluationKey || '').toLowerCase();
    const isLocked = !isStaff && !isCompleted && (
        Object.values(lessonVisibility || {}).some(courseMap => courseMap && (courseMap[normKey] === false || courseMap[evaluationKey] === false))
    );

    if (isLocked) {
        return (
            <div className="eval-instruction-page" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <div style={{ maxWidth: '480px', margin: '2rem auto', background: 'var(--bg-elevated)', borderRadius: '24px', padding: '2.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(16px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', border: '2px solid rgba(239, 68, 68, 0.4)' }}>
                        <Lock size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginBottom: '0.75rem' }}>
                        Examen Bloqueado por el Docente
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                        Esta evaluación no se encuentra habilitada en este momento. Consulta con tu profesor para que active el acceso a tu clase.
                    </p>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="eval-btn-start"
                    >
                        ← Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="eval-instruction-page">
            <div className="page-header blue">
                <div className="header-title">
                    <ShieldCheck size={28} color="#0284c7" />
                    <h1>Examen</h1>
                </div>
            </div>

            {isStaff && (
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto 1.5rem',
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1.5px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '18px',
                    padding: '1.1rem 1.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <Radio size={22} color="#0284c7" className="live-pulse-dot" />
                        <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.98rem' }}>
                                Modo Docente / Administrador
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                Esta pantalla es la instrucción que ven los alumnos. Para supervisar en vivo y revisar notas, abre el Lobby.
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/dashboard/exam-lobby/${evaluationKey}`)}
                        style={{
                            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.65rem 1.3rem',
                            borderRadius: '10px',
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
                        }}
                    >
                        <span>🟢 Abrir Sala en Vivo (Lobby) ➔</span>
                    </button>
                </div>
            )}

            <div className="glass-panel eval-card-main">
                <h2 className="eval-title">{evaluation.title}</h2>
                <p className="eval-desc">{evaluation.description}</p>

                <div className="eval-instructions-box">
                    <div className="eval-instructions-header">
                        <Zap size={16} />
                        <span>Instrucciones</span>
                    </div>
                    <p className="eval-instructions-text">
                        {evaluation.instructions || 'Lee con atención cada pregunta y selecciona la respuesta correcta. Asegúrate de tener una conexión estable.'}
                    </p>
                </div>

                <div className="eval-meta-grid">
                    <div className="eval-meta-card">
                        <div className="eval-meta-icon blue">
                            <Layers size={20} />
                        </div>
                        <div>
                            <div className="eval-meta-label">Total de preguntas</div>
                            <div className="eval-meta-value">{questionsCount} preguntas</div>
                        </div>
                    </div>

                    <div className="eval-meta-card">
                        <div className="eval-meta-icon amber">
                            <Clock size={20} />
                        </div>
                        <div>
                            <div className="eval-meta-label">Tiempo límite</div>
                            <div className="eval-meta-value">{evaluation.time_limit} minutos</div>
                        </div>
                    </div>

                    <div className="eval-meta-card">
                        <div className="eval-meta-icon emerald">
                            <Award size={20} />
                        </div>
                        <div>
                            <div className="eval-meta-label">Puntaje total</div>
                            <div className="eval-meta-value">{evaluation.points || 150} pts</div>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleStartExam}
                    className={`eval-btn-start ${isResuming ? 'eval-btn-resume' : ''}`}
                >
                    {isResuming ? (
                        <>
                            <Clock size={20} />
                            <span>Continuar evaluación</span>
                        </>
                    ) : (
                        <>
                            <span>Comenzar evaluación</span>
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>

                {isStaff && isResuming && (
                    <button 
                        onClick={handleResetAndStartFresh}
                        className="eval-btn-reset"
                    >
                        🔄 Reiniciar y Empezar de Cero (Modo Docente)
                    </button>
                )}
            </div>
        </div>
    );
};

export default EvaluationInstruction;
