import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, Trophy, Calendar, ArrowRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getCourseById } from '../data/coursesData.jsx';
import '../styles/PanelEvaluaciones.css';

const PanelEvaluaciones = () => {
    const { user, enrolledCourses, profile, evaluations, refreshEvaluations } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(!evaluations || evaluations.length === 0);
    const [filter, setFilter] = useState('all');

    const isAdmin = profile?.role === 'admin';

    useEffect(() => {
        const checkData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            // Si no hay evaluaciones, intentar cargar
            if (evaluations.length === 0) {
                await refreshEvaluations();
            }
            setLoading(false);
        };

        checkData();
    }, [user, evaluations.length, refreshEvaluations]);

    const processedEvaluations = evaluations.map(evalItem => ({
        ...evalItem,
        course: evalItem.course || getCourseById(evalItem.course_id)
    }));

    const filteredEvaluations = processedEvaluations.filter(e => {
        if (filter === 'all') return true;
        return e.status === filter;
    });

    const stats = {
        total: evaluations.length,
        completed: evaluations.filter(e => e.status === 'completed').length,
        pending: evaluations.filter(e => e.status === 'pending').length,
        inProgress: evaluations.filter(e => e.status === 'in_progress').length,
        averageGrade: evaluations.filter(e => e.grade !== null).length > 0 
            ? Math.round(
                evaluations
                    .filter(e => e.grade !== null)
                    .reduce((sum, e) => sum + e.grade, 0) / 
                evaluations.filter(e => e.grade !== null).length
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
        const date = new Date(dateStr);
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
            ) : evaluations.length === 0 ? (
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

            <div className="filter-tabs glass-panel">
                <button 
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Todas ({stats.total})
                </button>
                <button 
                    className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    Pendientes ({stats.pending})
                </button>
                <button 
                    className={`filter-tab ${filter === 'in_progress' ? 'active' : ''}`}
                    onClick={() => setFilter('in_progress')}
                >
                    En Progreso ({stats.inProgress})
                </button>
                <button 
                    className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Completadas ({stats.completed})
                </button>
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
