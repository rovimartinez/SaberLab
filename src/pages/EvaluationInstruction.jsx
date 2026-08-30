import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bell, Clock, ShieldCheck, Award, Zap, CheckCircle, Eye, Lock } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';
import { getLessonInfo, LESSONS_REGISTRY } from '../data/coursesData.jsx';
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
        const normKey = (evaluationKey || '').toLowerCase();
        const savedCompleted = localStorage.getItem(`exam_completed_${normKey}`) || 
                               localStorage.getItem(`exam_completed_${evaluationKey}`);
        if (savedCompleted) {
            try {
                const parsed = JSON.parse(savedCompleted);
                setIsCompleted(true);
                setAttemptData(parsed);
                setIsResuming(false);
                return;
            } catch {}
        }

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
                            title: lesson.title || 'Examen 1 - Fundamentos de Electricidad y Circuitos Básicos',
                            description: 'Evaluación Integral del Módulo 1 (Teoría: 60 pts + Práctica: 90 pts = 150 pts)',
                            instructions: 'El examen oficial consta de 2 fases evaluativas:\n\n1. Fase Teórica (60 Puntos): 30 preguntas de opción múltiple conceptuales y contextuales (2 pts c/u) sin cálculos matemáticos.\n2. Fase Práctica (90 Puntos): Análisis y resolución interactiva de la red mixta de 8 resistores (Req, IT, PT, 8 voltajes y 6 corrientes de rama).\n\nPuedes alternar entre ambas partes con las pestañas superiores antes de pulsar el botón "Entregar Examen".',
                            questions: lesson.questions || [],
                            points: 150,
                            time_limit: 60,
                            passing_score: 70
                        });
                    }
                }

                // Consultar intento completado en base de datos
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

    if (loading) {
        return (
            <div className="notifications-page">
                <div className="page-header">
                    <div className="header-title">
                        <Bell size={28} color="#facc15" />
                        <h1>Cargando...</h1>
                    </div>
                </div>
            </div>
        );
    }

    if (!evaluation) {
        return (
            <div className="notifications-page">
                <div className="page-header">
                    <div className="header-title">
                        <Bell size={28} color="#facc15" />
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
        const totalPts = attemptData?.points_obtained ?? attemptData?.score ?? 0;
        const maxExamPts = attemptData?.max_points || evaluation?.points || 150;
        const theoryPts = attemptData?.theory_points ?? attemptData?.theoryPts ?? Math.min(60, totalPts);
        const practicalPts = attemptData?.practical_score ?? attemptData?.practicalPts ?? Math.max(0, totalPts - theoryPts);
        const correctCount = attemptData?.correct_count ?? Math.round(theoryPts / 2);

        return (
            <div className="notifications-page">
                <div className="page-header">
                    <div className="header-title">
                        <Award size={28} color="#10b981" />
                        <h1>Examen Terminado</h1>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '650px', margin: '1rem auto', borderRadius: '24px', border: '1.5px solid rgba(56, 189, 248, 0.3)' }}>
                    <div style={{
                        width: '76px',
                        height: '76px',
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.25rem',
                        border: '2px solid #10b981'
                    }}>
                        <Award size={42} color="#10b981" />
                    </div>

                    <h2 style={{ fontSize: '2.2rem', color: '#f8fafc', marginBottom: '0.5rem', fontWeight: 900 }}>
                        ¡Examen Terminado!
                    </h2>

                    <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '2rem' }}>
                        Has completado exitosamente <strong style={{ color: '#f8fafc' }}>{evaluation.title}</strong>
                    </p>

                    {/* Desglose Teórico y Práctico */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '16px', padding: '1.25rem' }}>
                            <div style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>PARTE TEÓRICA</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>{theoryPts} <span style={{ fontSize: '0.95rem', color: '#94a3b8' }}>/ 60 pts</span></div>
                            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.25rem' }}>{correctCount} de 30 preguntas</div>
                        </div>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '16px', padding: '1.25rem' }}>
                            <div style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>PARTE PRÁCTICA</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>{practicalPts} <span style={{ fontSize: '0.95rem', color: '#94a3b8' }}>/ 90 pts</span></div>
                            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.25rem' }}>Red Mixta 8 Resistores</div>
                        </div>
                    </div>

                    {/* Tarjeta de Puntaje Total */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        border: '1.5px solid #38bdf8',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                            PUNTAJE TOTAL OBTENIDO
                        </div>
                        <div style={{ fontSize: '3.2rem', fontWeight: 900, color: '#38bdf8' }}>
                            {totalPts} <span style={{ fontSize: '1.4rem', color: '#94a3b8', fontWeight: 700 }}>/ {maxExamPts} pts</span>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <button
                            onClick={() => navigate(`/dashboard/evaluations/${evaluation.evaluation_key}/play?review=true`)}
                            style={{
                                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                                color: 'white',
                                border: '1px solid #38bdf8',
                                padding: '1rem 2rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '1.05rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                            onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                        >
                            <Eye size={20} />
                            Revisar Examen (Teoría y Práctica)
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/evaluations')}
                            style={{
                                background: 'transparent',
                                color: '#94a3b8',
                                border: '1px solid #334155',
                                padding: '0.85rem 2rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                        >
                            Salir a Evaluaciones
                        </button>
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
            <div className="eval-instruction-container animate-fade-in" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <div style={{ maxWidth: '480px', margin: '2rem auto', background: 'rgba(30, 41, 59, 0.8)', borderRadius: '24px', padding: '2.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(16px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', border: '2px solid rgba(239, 68, 68, 0.4)' }}>
                        <Lock size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f87171', marginBottom: '0.75rem' }}>
                        Examen Bloqueado por el Docente
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                        Esta evaluación no se encuentra habilitada en este momento. Consulta con tu profesor para que active el acceso a tu clase.
                    </p>
                    <button 
                        onClick={() => navigate('/dashboard/my-courses')}
                        style={{
                            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                            border: 'none',
                            color: '#fff',
                            fontWeight: 700,
                            padding: '0.85rem 1.75rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
                        }}
                    >
                        ← Volver a Mis Cursos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="notifications-page">
            <div className="page-header">
                <div className="header-title">
                    <Bell size={28} color="#facc15" />
                    <h1>Examen</h1>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h2 style={{ color: '#f8fafc', marginTop: 0 }}>{evaluation.title}</h2>
                <p style={{ color: '#cbd5e1', marginBottom: '1rem', fontStyle: 'italic' }}>{evaluation.description}</p>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <h3 style={{ color: '#facc15', fontSize: '0.9rem', marginTop: 0, textTransform: 'uppercase' }}>Instrucciones</h3>
                    <p style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{evaluation.instructions || 'Lee con atención cada pregunta y selecciona la respuesta correcta. Asegúrate de tener una conexión estable.'}</p>
                </div>
                <ul style={{ color: '#cbd5e1', lineHeight: '1.8', paddingLeft: '1.2rem', marginBottom: '1.5rem' }}>
                    <li><strong style={{ color: 'white' }}>Total de preguntas:</strong> {questionsCount} preguntas</li>
                    <li><strong style={{ color: 'white' }}>Tiempo límite:</strong> {evaluation.time_limit} minutos</li>
                </ul>
                <button 
                    onClick={handleStartExam}
                    style={{
                        background: isResuming 
                            ? 'linear-gradient(135deg, #3b82f6, #3b82f6)' 
                            : 'linear-gradient(135deg, #f43f5e, #fb7185)',
                        color: 'white',
                        border: 'none',
                        padding: '1.2rem 2rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        marginTop: '1rem',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        transition: 'transform 0.2s ease, filter 0.2s ease',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                >
                    {isResuming ? (
                        <>
                            <Clock size={20} />
                            Continuar evaluación
                        </>
                    ) : (
                        'Comenzar evaluación'
                    )}
                </button>
            </div>
        </div>
    );
};

export default EvaluationInstruction;
