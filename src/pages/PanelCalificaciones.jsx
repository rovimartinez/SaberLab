import React, { useState, useEffect } from 'react';
import { 
    Award, CheckCircle2, Clock, AlertCircle, Eye, Play,
    BookOpen, Calendar, TrendingUp, ShieldCheck, GraduationCap, Download, ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';
import { COURSES_DEFINITION } from '../data/coursesData.jsx';
import '../styles/PanelEvaluaciones.css';

const PanelCalificaciones = () => {
    const { user, profile, enrolledCourses } = useAuth();
    const navigate = useNavigate();
    
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    const userMetadata = user?.user_metadata || {};
    const fullName = profile?.full_name || userMetadata.full_name || 'Estudiante';

    useEffect(() => {
        const fetchAttempts = async () => {
            if (!user) return;
            try {
                const { data } = await api('/attempts');
                if (data && Array.isArray(data)) {
                    setAttempts(data);
                }
            } catch (err) {
                console.error('Error al cargar historial de calificaciones:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAttempts();
    }, [user]);

    // Mapeo de cursos con sus evaluaciones oficiales
    const coursesGrades = enrolledCourses.map(c => {
        const def = COURSES_DEFINITION.find(d => d.id === c.id || d.abbr === c.abbr || d.id === c.slug) || c;
        const modules = def.modules || [];

        // Extraer todas las evaluaciones de los módulos del curso
        const evaluations = modules.map((m, idx) => {
            const evalKey = idx === 0 ? 'ee-m1-l6' : `ee-m${idx + 1}-l${idx === 1 ? 10 : (idx === 2 ? 14 : 16)}`;
            const evalData = m.evaluation || {
                title: `Examen ${idx + 1}`,
                points: idx === 0 ? 150 : (idx === 3 ? 100 : 125),
                date: 'Pendiente'
            };

            // Buscar si el estudiante tiene un intento registrado en esta evaluación
            const attempt = attempts.find(a => 
                (a.evaluation_key && a.evaluation_key.toLowerCase() === evalKey.toLowerCase()) && 
                a.completed_at
            ) || (idx === 0 && localStorage.getItem('exam_completed_ee-m1-l6') ? JSON.parse(localStorage.getItem('exam_completed_ee-m1-l6')) : null);

            const isSubmitted = !!attempt;
            const pointsObtained = attempt ? (attempt.points_obtained ?? attempt.totalPts ?? attempt.score ?? 0) : null;
            const maxPoints = evalData.points || 150;
            const percentage = isSubmitted ? Math.round((pointsObtained / maxPoints) * 100) : 0;
            const passed = isSubmitted ? (percentage >= 60) : null;

            let antiCheat = null;
            if (attempt?.answers) {
                try {
                    const parsed = typeof attempt.answers === 'string' ? JSON.parse(attempt.answers) : attempt.answers;
                    antiCheat = parsed?.anti_cheat || null;
                } catch {}
            }

            const rawTitle = evalData.title || `Examen ${idx + 1}`;
            const cleanTitle = rawTitle
                .replace(/^Evaluaci[oó]n\s*\d*\s*:?\s*/i, '')
                .replace(/^Examen\s*\d*\s*:?\s*/i, '')
                .trim();
            const formattedTitle = `Evaluación Módulo ${idx + 1}: ${cleanTitle || m.name || rawTitle}`;

            return {
                id: evalKey,
                title: formattedTitle,
                moduleName: m.name,
                date: evalData.date,
                maxPoints,
                pointsObtained,
                percentage,
                isSubmitted,
                passed,
                antiCheat,
                submittedAt: attempt?.completed_at || attempt?.timestamp
            };
        });

        const totalMaxCoursePoints = evaluations.reduce((acc, e) => acc + e.maxPoints, 0);
        const totalPointsEarned = evaluations.reduce((acc, e) => acc + (e.pointsObtained || 0), 0);
        const coursePercentage = totalMaxCoursePoints > 0 ? Math.round((totalPointsEarned / totalMaxCoursePoints) * 100) : 0;

        return {
            ...c,
            ...def,
            evaluations,
            totalMaxCoursePoints,
            totalPointsEarned,
            coursePercentage
        };
    });

    // Puntos acumulados en total
    const totalEarnedAll = coursesGrades.reduce((acc, c) => acc + c.totalPointsEarned, 0);
    const totalMaxAll = coursesGrades.reduce((acc, c) => acc + c.totalMaxCoursePoints, 0);
    const overallGPA = totalMaxAll > 0 ? ((totalEarnedAll / totalMaxAll) * 5.0).toFixed(1) : '5.0';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
            
            {/* ── ENCABEZADO OFICIAL DE CALIFICACIONES ── */}
            <div className="glass-panel" style={{
                padding: '2.25rem',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                        <GraduationCap size={28} color="#38bdf8" />
                        <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.92rem', letterSpacing: '0.5px' }}>
                            REGISTRO ACADÉMICO OFICIAL • SABERLAB
                        </span>
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '2rem', margin: '0 0 0.4rem 0', fontWeight: 800 }}>
                        Libreta de Calificaciones
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
                        Estudiante: <strong style={{ color: '#fff' }}>{fullName}</strong> | Periodo Académico: <strong style={{ color: '#38bdf8' }}>2026-II</strong>
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        borderRadius: '16px',
                        padding: '0.9rem 1.4rem',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#38bdf8' }}>{totalEarnedAll} / {totalMaxAll}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Puntos Totales</div>
                    </div>
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '16px',
                        padding: '0.9rem 1.4rem',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>{overallGPA}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Nota Equivalente (0-5.0)</div>
                    </div>
                    {totalEarnedAll >= 450 && (
                        <div 
                            onClick={() => navigate('/dashboard/certificate/ee')}
                            style={{
                                background: 'rgba(16, 185, 129, 0.12)',
                                border: '1px solid rgba(16, 185, 129, 0.4)',
                                borderRadius: '16px',
                                padding: '0.9rem 1.4rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                            title="Haz clic para ver y descargar tu Certificado Oficial"
                        >
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Award size={20} /> Desbloqueado
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6ee7b7', fontWeight: 600 }}>Certificado Oficial (450+ pts) ↗</div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── LISTADO DE CURSOS Y TABLA DE NOTAS ── */}
            {coursesGrades.map(course => (
                <div key={course.id || course.slug} className="glass-panel" style={{
                    padding: '2rem',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                }}>
                    {/* Encabezado del Curso */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        paddingBottom: '1.25rem'
                    }}>
                        <div>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '8px',
                                background: `${course.color}20`,
                                color: course.color,
                                fontSize: '0.78rem',
                                fontWeight: 800
                            }}>
                                {course.abbr || 'CURSO'}
                            </span>
                            <h2 style={{ color: '#fff', fontSize: '1.4rem', margin: '0.4rem 0 0.2rem 0', fontWeight: 800 }}>
                                {course.name}
                            </h2>
                            <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                                Docente: <strong>{course.teacher || 'Ronny Martinez Reyes'}</strong>
                            </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: course.color }}>
                                {course.totalPointsEarned} / {course.totalMaxCoursePoints} pts ({course.coursePercentage}%)
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                Ponderación acumulada
                            </span>
                        </div>
                    </div>

                    {/* Tabla de Evaluaciones */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', fontSize: '0.85rem' }}>
                                    <th style={{ padding: '0.75rem 1rem' }}>EVALUACIÓN</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>FECHA OFICIAL</th>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>PESO</th>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>PUNTAJE</th>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>ESTADO</th>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>ACCIÓN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {course.evaluations.map((ev, idx) => (
                                    <tr key={ev.id || idx} style={{
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                        transition: 'background 0.2s'
                                    }}>
                                        <td style={{ padding: '1rem', color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
                                            {ev.title}
                                        </td>
                                        <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                            {ev.date}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', color: '#fbbf24', fontWeight: 800, fontSize: '0.9rem' }}>
                                            {ev.maxPoints} pts
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {ev.isSubmitted ? (
                                                <span style={{
                                                    color: ev.passed ? '#10b981' : '#f87171',
                                                    fontWeight: 900,
                                                    fontSize: '1.1rem'
                                                }}>
                                                    {ev.pointsObtained} pts
                                                </span>
                                            ) : (
                                                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>—</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {ev.isSubmitted ? (
                                                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        minWidth: '115px',
                                                        height: '32px',
                                                        boxSizing: 'border-box',
                                                        padding: '0 0.85rem',
                                                        borderRadius: '9px',
                                                        background: 'rgba(16, 185, 129, 0.15)',
                                                        color: '#10b981',
                                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 800,
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        <CheckCircle2 size={15} />
                                                        Realizado
                                                    </span>
                                                    {ev.antiCheat?.strikes > 0 ? (
                                                        <span style={{
                                                            fontSize: '0.66rem',
                                                            fontWeight: 800,
                                                            color: ev.antiCheat.strikes >= 3 ? '#ef4444' : '#f59e0b',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {ev.antiCheat.strikes >= 3 ? '⚠️ Infracción (3/3)' : `⚠️ ${ev.antiCheat.strikes} Advertencia(s)`}
                                                        </span>
                                                    ) : (
                                                        <span style={{
                                                            fontSize: '0.66rem',
                                                            fontWeight: 700,
                                                            color: '#10b981',
                                                            opacity: 0.8,
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            ✓ 100% Íntegro
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    minWidth: '115px',
                                                    height: '36px',
                                                    boxSizing: 'border-box',
                                                    padding: '0 0.85rem',
                                                    borderRadius: '9px',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    color: '#94a3b8',
                                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                                    fontSize: '0.82rem',
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    <Clock size={15} />
                                                    Pendiente
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {ev.isSubmitted ? (
                                                <button
                                                    onClick={() => navigate(`/dashboard/evaluations/${ev.id}/play?review=true`)}
                                                    style={{
                                                        minWidth: '125px',
                                                        height: '36px',
                                                        boxSizing: 'border-box',
                                                        padding: '0 1rem',
                                                        borderRadius: '9px',
                                                        background: 'rgba(56, 189, 248, 0.15)',
                                                        border: '1px solid rgba(56, 189, 248, 0.35)',
                                                        color: '#38bdf8',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 800,
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        whiteSpace: 'nowrap',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    <Eye size={15} />
                                                    Ver Examen
                                                </button>
                                            ) : (
                                                <span style={{ color: '#64748b', fontSize: '0.95rem' }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PanelCalificaciones;
