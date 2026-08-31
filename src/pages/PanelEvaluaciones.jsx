import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, Trophy, Calendar, ArrowRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';
import { getCourseById } from '../data/coursesData.jsx';
import '../styles/PanelEvaluaciones.css';

const PanelEvaluaciones = () => {
    const { user, enrolledCourses, profile, evaluations, refreshEvaluations } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [userAttempts, setUserAttempts] = useState({});

    const isAdmin = profile?.role === 'admin';

    useEffect(() => {
        const checkData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const { data: attempts } = await api('/attempts');
                if (Array.isArray(attempts)) {
                    const map = {};
                    attempts.forEach(att => {
                        const k = (att.evaluation_key || '').toLowerCase();
                        if (!map[k]) {
                            map[k] = att;
                        }
                        if (!map[att.evaluation_key]) {
                            map[att.evaluation_key] = att;
                        }
                    });
                    setUserAttempts(map);
                }
            } catch (err) {
                console.error('Error cargando intentos:', err);
            }

            if (!evaluations || evaluations.length === 0) {
                await refreshEvaluations();
            }
            setLoading(false);
        };

        checkData();
    }, [user, evaluations?.length, refreshEvaluations]);

    const defaultOfficialEvaluations = [
        {
            id: 'ee-m1-l6',
            evaluation_key: 'ee-m1-l6',
            course_id: 1,
            title: 'Examen 1 - Fundamentos de Electricidad y Circuitos Básicos',
            description: 'Evaluación Integral del Módulo 1 (Teoría: 60 pts + Práctica: 90 pts = 150 pts)',
            type: 'Examen',
            points: 150,
            time_limit: 60,
            passing_score: 70,
            due_date: '2026-09-02',
            date: '2 de septiembre de 2026',
            status: 'pending',
            grade: null
        },
        {
            id: 'ee-m2-l10',
            evaluation_key: 'ee-m2-l10',
            course_id: 1,
            title: 'Examen 2 - Uso de Componentes Electrónicos',
            description: 'Capacitores, transistores BJT, relés 5V y motores DC (125 pts)',
            type: 'Examen',
            points: 125,
            time_limit: 60,
            passing_score: 70,
            due_date: '2026-09-28',
            date: '28 de septiembre de 2026',
            status: 'pending',
            grade: null
        },
        {
            id: 'ee-m3-l14',
            evaluation_key: 'ee-m3-l14',
            course_id: 1,
            title: 'Examen 3 - Implementación de Circuitos Integrados',
            description: 'Temporizador NE555, contador binario 74LS93 y display 7 segmentos (125 pts)',
            type: 'Examen',
            points: 125,
            time_limit: 60,
            passing_score: 70,
            due_date: '2026-10-21',
            date: '21 de octubre de 2026',
            status: 'pending',
            grade: null
        },
        {
            id: 'ee-m4-l16',
            evaluation_key: 'ee-m4-l16',
            course_id: 1,
            title: 'Presentación del Proyecto Final',
            description: 'Sustentación de prototipo funcional STEAM / ABP (100 pts)',
            type: 'Proyecto',
            points: 100,
            time_limit: 90,
            passing_score: 70,
            due_date: '2026-11-11',
            date: '11 de noviembre de 2026',
            status: 'pending',
            grade: null
        },
        {
            id: 're-m1-eval',
            evaluation_key: 're-m1-eval',
            course_id: 2,
            title: 'Módulo 1 – Examen 1: Fundamentos y Lógica Digital',
            description: 'Evaluación Teórico-Práctica de Lógica Digital y Arduino (150 pts)',
            type: 'Examen',
            points: 150,
            time_limit: 60,
            passing_score: 70,
            due_date: '2026-09-04',
            date: '4 de septiembre de 2026',
            status: 'pending',
            grade: null
        },
        {
            id: 're-m2-eval',
            evaluation_key: 're-m2-eval',
            course_id: 2,
            title: 'Módulo 2 – Examen 2: Sensores y Mundo Físico',
            description: 'Lectura de sensores analógicos y digitales con Arduino (150 pts)',
            type: 'Examen',
            points: 150,
            time_limit: 60,
            passing_score: 70,
            due_date: '2026-09-25',
            date: '25 de septiembre de 2026',
            status: 'pending',
            grade: null
        },
        {
            id: 're-m3-eval',
            evaluation_key: 're-m3-eval',
            course_id: 2,
            title: 'Módulo 3 – Examen 3: Movimiento y Actuadores',
            description: 'Control de servomotores, motores DC y puentes H (150 pts)',
            type: 'Examen',
            points: 150,
            time_limit: 60,
            passing_score: 70,
            due_date: '2026-10-27',
            date: '27 de octubre de 2026',
            status: 'pending',
            grade: null
        },
        {
            id: 're-m4-eval',
            evaluation_key: 're-m4-eval',
            course_id: 2,
            title: 'Módulo 4 – Proyecto Final Integrador',
            description: 'Sustentación de prototipo robótico funcional STEAM / ABP (50 pts)',
            type: 'Proyecto',
            points: 50,
            time_limit: 90,
            passing_score: 70,
            due_date: '2026-11-13',
            date: '13 de noviembre de 2026',
            status: 'pending',
            grade: null
        }
    ];

    const isStaff = ['admin', 'teacher', 'docente', 'profesor'].includes(profile?.role);

    // Mapear cursos en los que el estudiante está realmente inscrito
    const enrolledCourseIds = (enrolledCourses || []).map(c => Number(c.id || c.course_id)).filter(Boolean);
    const enrolledCourseAbbrs = (enrolledCourses || []).map(c => (c.abbr || '').toLowerCase()).filter(Boolean);
    const enrolledCourseSlugs = (enrolledCourses || []).map(c => (c.slug || '').toLowerCase()).filter(Boolean);

    const baseEvaluations = (evaluations && evaluations.length > 0) ? evaluations : defaultOfficialEvaluations;

    // Si es estudiante, filtrar estrictamente solo las evaluaciones de sus cursos inscritos
    const relevantEvaluations = isStaff
        ? baseEvaluations
        : baseEvaluations.filter(evalItem => {
            const courseId = Number(evalItem.course_id);
            const evalKey = (evalItem.evaluation_key || evalItem.id || '').toLowerCase();
            const prefix = evalKey.split('-')[0]; // 'ee', 're', etc.

            return enrolledCourseIds.includes(courseId) ||
                   enrolledCourseAbbrs.includes(prefix) ||
                   enrolledCourseSlugs.some(slug => slug.startsWith(prefix));
        });

    const processedEvaluations = relevantEvaluations.map(evalItem => {
        const k = (evalItem.evaluation_key || evalItem.id || '').toLowerCase();
        
        let localCompleted = null;
        try {
            const saved = localStorage.getItem(`exam_completed_${k}`) || 
                          (evalItem.evaluation_key ? localStorage.getItem(`exam_completed_${evalItem.evaluation_key}`) : null) ||
                          (evalItem.id ? localStorage.getItem(`exam_completed_${evalItem.id}`) : null);
            if (saved) localCompleted = JSON.parse(saved);
        } catch {}

        const attempt = userAttempts[k] || 
                        (evalItem.evaluation_key ? userAttempts[evalItem.evaluation_key] : null) || 
                        (evalItem.id ? userAttempts[evalItem.id] : null) || 
                        localCompleted;
        
        let status = 'pending';
        let grade = null;
        let pointsObtained = null;

        if (attempt) {
            if (attempt.completed_at) {
                status = 'completed';
                grade = attempt.score ?? Math.round(((attempt.points_obtained || 0) / (evalItem.points || 150)) * 100);
                pointsObtained = attempt.points_obtained ?? Math.round(((attempt.score || 0) / 100) * (evalItem.points || 150));
            } else {
                status = 'in_progress';
            }
        }

        return {
            ...evalItem,
            status,
            grade,
            points_obtained: pointsObtained,
            type: evalItem.type || 'Examen',
            course: evalItem.course || getCourseById(evalItem.course_id)
        };
    });

    const filteredEvaluations = processedEvaluations.filter(e => {
        if (filter === 'all') return true;
        return e.status === filter;
    });

    const stats = {
        total: processedEvaluations.length,
        completed: processedEvaluations.filter(e => e.status === 'completed').length,
        pending: processedEvaluations.filter(e => e.status === 'pending').length,
        inProgress: processedEvaluations.filter(e => e.status === 'in_progress').length,
        averageGrade: processedEvaluations.filter(e => e.grade !== null).length > 0 
            ? Math.round(
                processedEvaluations
                    .filter(e => e.grade !== null)
                    .reduce((sum, e) => sum + e.grade, 0) / 
                processedEvaluations.filter(e => e.grade !== null).length
            )
            : 0
    };

    const getStatusBadge = (status) => {
        const badges = {
            completed: { class: 'badge-success', icon: <CheckCircle size={14} />, text: 'Completado' },
            pending: { class: 'badge-warning', icon: <Clock size={14} />, text: 'Pendiente' },
            in_progress: { class: 'badge-info', icon: <Clock size={14} />, text: 'En Progreso' }
        };
        return badges[status] || badges.pending;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        if (typeof dateStr === 'string' && dateStr.includes(' de ')) return dateStr;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="evaluations-page">
            <div className="page-header">
                <div className="header-title">
                    <FileText size={28} color="#60a5fa" />
                    <h1>Evaluaciones</h1>
                </div>
            </div>

            {loading ? (
                <div className="empty-state glass-panel"><p>Cargando...</p></div>
            ) : processedEvaluations.length === 0 ? (
                <div className="empty-state glass-panel">
                    <FileText size={48} color="#64748b" />
                    <h3>No hay evaluaciones</h3>
                    <p>No tienes evaluaciones asignadas en tus cursos.</p>
                </div>
            ) : (
            <>
            <div className="stats-grid">
                <div className="stat-card glass-panel">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.completed}</span>
                        <span className="stat-label">Completadas</span>
                    </div>
                </div>
                <div className="stat-card glass-panel">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <Clock size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.pending}</span>
                        <span className="stat-label">Pendientes</span>
                    </div>
                </div>
                <div className="stat-card glass-panel">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <AlertCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.inProgress}</span>
                        <span className="stat-label">En Progreso</span>
                    </div>
                </div>
                <div className="stat-card glass-panel">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                        <Trophy size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.averageGrade}%</span>
                        <span className="stat-label">Promedio</span>
                    </div>
                </div>
            </div>

            <div className="evaluations-list">
                {filteredEvaluations.length === 0 ? (
                    <div className="empty-state glass-panel">
                        <FileText size={48} color="#64748b" />
                        <h3>No hay evaluaciones</h3>
                        <p>No tienes evaluaciones {filter === 'pending' ? 'pendientes' : filter === 'completed' ? 'completadas' : ''}.</p>
                    </div>
                ) : (
                    filteredEvaluations.map(evaluation => {
                        const badge = getStatusBadge(evaluation.status);
                        const color = evaluation.course?.color || '#6366f1';
                        return (
                            <div 
                                key={evaluation.id} 
                                className="evaluation-card glass-panel"
                                onClick={() => {
                                    if (evaluation.evaluation_key) {
                                        navigate(`/dashboard/evaluations/${evaluation.evaluation_key}`);
                                    }
                                }}
                            >
                                <div className="evaluation-header">
                                    <div className="evaluation-type-badge" style={{ backgroundColor: `${color}20`, color: color }}>
                                        {evaluation.type}
                                    </div>
                                    <span className={`status-badge ${badge.class}`}>
                                        {badge.icon}
                                        {badge.text}
                                    </span>
                                </div>
                                <h3 className="evaluation-title">{evaluation.title}</h3>
                                <p className="evaluation-subject">{evaluation.course?.name}</p>
                                <div className="evaluation-footer">
                                    <div className="evaluation-meta">
                                        <Calendar size={14} />
                                        <span>{formatDate(evaluation.due_date)}</span>
                                    </div>
                                    <div className="evaluation-points">
                                        <span className="points-value">{evaluation.points}</span>
                                        <span className="points-label">pts</span>
                                    </div>
                                    {evaluation.grade !== null && (
                                        <div className="evaluation-grade">
                                            <span className="grade-value">{evaluation.grade}</span>
                                            <span className="grade-label">/100</span>
                                        </div>
                                    )}
                                </div>
                                <ArrowRight size={20} className="card-arrow" />
                            </div>
                        );
                    })
                )}
            </div>
            </>
            )}
        </div>
    );
};

export default PanelEvaluaciones;
