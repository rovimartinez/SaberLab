import React, { useState } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, Trophy, Calendar, ArrowRight, Filter } from 'lucide-react';
import './Evaluations.css';

const Evaluations = () => {
    const [filter, setFilter] = useState('all');

    const evaluations = [
        {
            id: 1,
            title: 'Módulo 1 - Examen 1',
            subject: 'Electricidad y Electrónica Básica',
            type: 'Examen',
            date: '2026-03-11',
            dueDate: 'Marzo 11, 2026',
            points: 150,
            status: 'completed',
            grade: 85,
            color: '#3b82f6'
        },
        {
            id: 2,
            title: 'Cuestionario de Circuitos',
            subject: 'Electricidad y Electrónica Básica',
            type: 'Cuestionario',
            date: '2026-03-05',
            dueDate: 'Marzo 5, 2026',
            points: 50,
            status: 'completed',
            grade: 92,
            color: '#3b82f6'
        },
        {
            id: 3,
            title: 'Práctica de Soldadura',
            subject: 'Electricidad y Electrónica Básica',
            type: 'Práctica',
            date: '2026-03-18',
            dueDate: 'Marzo 18, 2026',
            points: 100,
            status: 'pending',
            grade: null,
            color: '#3b82f6'
        },
        {
            id: 4,
            title: 'Módulo 2 - Examen 2',
            subject: 'Electricidad y Electrónica Básica',
            type: 'Examen',
            date: '2026-04-22',
            dueDate: 'Abril 22, 2026',
            points: 125,
            status: 'pending',
            grade: null,
            color: '#3b82f6'
        },
        {
            id: 5,
            title: 'Proyecto de Robot Seguidor de Línea',
            subject: 'Robótica Educativa',
            type: 'Proyecto',
            date: '2026-04-10',
            dueDate: 'Abril 10, 2026',
            points: 200,
            status: 'in_progress',
            grade: null,
            color: '#a855f7'
        },
        {
            id: 6,
            title: 'Cuestionario de Motores',
            subject: 'Robótica Educativa',
            type: 'Cuestionario',
            date: '2026-03-20',
            dueDate: 'Marzo 20, 2026',
            points: 75,
            status: 'completed',
            grade: 78,
            color: '#a855f7'
        }
    ];

    const filteredEvaluations = evaluations.filter(e => {
        if (filter === 'all') return true;
        return e.status === filter;
    });

    const stats = {
        total: evaluations.length,
        completed: evaluations.filter(e => e.status === 'completed').length,
        pending: evaluations.filter(e => e.status === 'pending').length,
        inProgress: evaluations.filter(e => e.status === 'in_progress').length,
        averageGrade: Math.round(
            evaluations
                .filter(e => e.grade !== null)
                .reduce((sum, e) => sum + e.grade, 0) / 
            evaluations.filter(e => e.grade !== null).length
        )
    };

    const getStatusBadge = (status) => {
        const badges = {
            completed: { class: 'badge-success', icon: <CheckCircle size={14} />, text: 'Completado' },
            pending: { class: 'badge-warning', icon: <Clock size={14} />, text: 'Pendiente' },
            in_progress: { class: 'badge-info', icon: <Clock size={14} />, text: 'En Progreso' }
        };
        return badges[status] || badges.pending;
    };

    return (
        <div className="evaluations-page">
            <div className="page-header">
                <div className="header-title">
                    <FileText size={28} color="#60a5fa" />
                    <h1>Evaluaciones</h1>
                </div>
            </div>

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
                        return (
                            <div 
                                key={evaluation.id} 
                                className="evaluation-card glass-panel"
                            >
                                <div className="evaluation-header">
                                    <div className="evaluation-type-badge" style={{ backgroundColor: `${evaluation.color}20`, color: evaluation.color }}>
                                        {evaluation.type}
                                    </div>
                                    <span className={`status-badge ${badge.class}`}>
                                        {badge.icon}
                                        {badge.text}
                                    </span>
                                </div>
                                <h3 className="evaluation-title">{evaluation.title}</h3>
                                <p className="evaluation-subject">{evaluation.subject}</p>
                                <div className="evaluation-footer">
                                    <div className="evaluation-meta">
                                        <Calendar size={14} />
                                        <span>{evaluation.dueDate}</span>
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
        </div>
    );
};

export default Evaluations;
