import React, { useState, useEffect, useMemo } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, Trophy, Calendar, ArrowRight, Filter, Users, Radio, BookOpen, Layers, Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';
import { getCourseById, getCourseByIdentifier, COURSES_DEFINITION } from '../data/coursesData.jsx';
import '../styles/PanelEvaluaciones.css';

const PanelEvaluaciones = () => {
    const { user, enrolledCourses, profile, evaluations, refreshEvaluations } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [courseFilter, setCourseFilter] = useState(() => {
        const saved = localStorage.getItem('saberlab_active_course');
        return saved || 'all';
    });
    const [groupFilter, setGroupFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [groupsList, setGroupsList] = useState([]);
    const [userAttempts, setUserAttempts] = useState({});

    const isAdmin = profile?.role === 'admin';
    const isStaff = ['admin', 'teacher', 'docente', 'profesor'].includes(profile?.role);

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

            try {
                const { data: groupsData } = await api('/groups');
                if (Array.isArray(groupsData)) {
                    setGroupsList(groupsData);
                }
            } catch (err) {
                console.error('Error cargando grupos:', err);
            }

            if (!evaluations || evaluations.length === 0) {
                try {
                    await refreshEvaluations();
                } catch {}
            }
            setLoading(false);
        };

        checkData();
    }, [user, evaluations?.length, refreshEvaluations]);

    const handleToggleRelease = async (e, evalItem) => {
        e.stopPropagation();
        if (!evalItem.id) return;
        const currentVal = evalItem.results_released === 1 || evalItem.results_released === true || evalItem.results_released === undefined;
        const nextVal = !currentVal;
        await api('/evaluations', {
            method: 'POST',
            body: { id: evalItem.id, results_released: nextVal ? 1 : 0 }
        });
        if (refreshEvaluations) await refreshEvaluations();
    };

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
            course_id: 5,
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
            course_id: 5,
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
            course_id: 5,
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
            course_id: 5,
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

        const evalKey = (evalItem.evaluation_key || evalItem.id || '').toLowerCase();
        const prefix = evalKey.split('-')[0]; // 'ee', 're', 'ma', etc.
        const resolvedCourse = evalItem.course || 
                               getCourseById(evalItem.course_id) || 
                               getCourseByIdentifier(evalItem.course_id) || 
                               getCourseByIdentifier(prefix) || 
                               COURSES_DEFINITION.find(c => c.abbr.toLowerCase() === prefix);

        return {
            ...evalItem,
            status,
            grade,
            points_obtained: pointsObtained,
            type: evalItem.type || 'Examen',
            course: resolvedCourse
        };
    });

    // Extraer lista única de cursos disponibles en las evaluaciones
    const availableCourses = useMemo(() => {
        const map = new Map();
        processedEvaluations.forEach(ev => {
            if (ev.course && ev.course.id) {
                map.set(String(ev.course.id), ev.course);
            }
        });
        return Array.from(map.values());
    }, [processedEvaluations]);

    // Conteo de evaluaciones por curso
    const countsByCourse = useMemo(() => {
        const counts = { all: processedEvaluations.length };
        processedEvaluations.forEach(ev => {
            const cId = String(ev.course?.id || ev.course_id);
            counts[cId] = (counts[cId] || 0) + 1;
        });
        return counts;
    }, [processedEvaluations]);

    // Filtrar grupos relevantes según el curso seleccionado
    const relevantGroups = useMemo(() => {
        if (courseFilter === 'all') return groupsList;
        return groupsList.filter(g => String(g.course_id) === String(courseFilter));
    }, [groupsList, courseFilter]);

    // Evaluaciones filtradas por curso, grupo y búsqueda (base para filtros de estado)
    const courseFilteredEvaluations = useMemo(() => {
        return processedEvaluations.filter(e => {
            // 1. Filtro de Curso
            if (courseFilter !== 'all') {
                const cId = String(e.course?.id || e.course_id || '');
                const cAbbr = (e.course?.abbr || '').toLowerCase();
                const cSlug = (e.course?.slug || '').toLowerCase();
                const target = String(courseFilter).toLowerCase();

                const matchesCourse = cId === target || cAbbr === target || cSlug === target;
                if (!matchesCourse) return false;
            }

            // 2. Filtro de Grupo Activo (si la evaluación tiene asignado grupo específico)
            if (groupFilter !== 'all' && e.group_id) {
                if (String(e.group_id) !== String(groupFilter)) return false;
            }

            // 3. Búsqueda por texto (título, curso, descripción)
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchTitle = (e.title || '').toLowerCase().includes(q);
                const matchCourse = (e.course?.name || '').toLowerCase().includes(q);
                const matchDesc = (e.description || '').toLowerCase().includes(q);
                if (!matchTitle && !matchCourse && !matchDesc) return false;
            }

            return true;
        });
    }, [processedEvaluations, courseFilter, groupFilter, searchQuery]);

    // Conteo por estado dentro del curso / grupo activo actual
    const statusCounts = useMemo(() => {
        return {
            all: courseFilteredEvaluations.length,
            pending: courseFilteredEvaluations.filter(e => e.status === 'pending').length,
            completed: courseFilteredEvaluations.filter(e => e.status === 'completed').length,
            inProgress: courseFilteredEvaluations.filter(e => e.status === 'in_progress').length,
        };
    }, [courseFilteredEvaluations]);

    // Evaluaciones finalmente mostradas según el tab de estado
    const filteredEvaluations = useMemo(() => {
        if (filter === 'all') return courseFilteredEvaluations;
        return courseFilteredEvaluations.filter(e => e.status === filter);
    }, [courseFilteredEvaluations, filter]);

    const stats = {
        total: courseFilteredEvaluations.length,
        completed: courseFilteredEvaluations.filter(e => e.status === 'completed').length,
        pending: courseFilteredEvaluations.filter(e => e.status === 'pending').length,
        inProgress: courseFilteredEvaluations.filter(e => e.status === 'in_progress').length,
        averageGrade: courseFilteredEvaluations.filter(e => e.grade !== null).length > 0 
            ? Math.round(
                courseFilteredEvaluations
                    .filter(e => e.grade !== null)
                    .reduce((sum, e) => sum + e.grade, 0) / 
                courseFilteredEvaluations.filter(e => e.grade !== null).length
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
                    <div>
                        <h1>Evaluaciones y Exámenes</h1>
                        <p className="header-subtitle">
                            {isStaff ? 'Panel docente para proyección y gestión de evaluaciones' : 'Tus exámenes oficiales y pruebas integradoras'}
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="empty-state glass-panel"><p>Cargando evaluaciones...</p></div>
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

            {/* BARRA DE CONTROLES Y FILTRO PARA PROYECCIÓN DOCENTE */}
            <div className="evaluations-controls-container glass-panel">
                <div className="evaluations-top-controls">
                    {/* Selector de Cursos en Píldoras Rápidas (1 Clic) */}
                    <div className="course-pill-filters">
                        <button
                            type="button"
                            className={`course-pill-btn ${courseFilter === 'all' ? 'active' : ''}`}
                            onClick={() => {
                                setCourseFilter('all');
                                setGroupFilter('all');
                            }}
                        >
                            <Layers size={15} />
                            <span>Todos los Cursos</span>
                            <span className="pill-count">{processedEvaluations.length}</span>
                        </button>
                        {availableCourses.map(c => {
                            const cTarget = String(courseFilter).toLowerCase();
                            const isActive = String(c.id).toLowerCase() === cTarget || (c.abbr || '').toLowerCase() === cTarget || (c.slug || '').toLowerCase() === cTarget;
                            const count = countsByCourse[String(c.id)] || 0;
                            const cColor = c.color || '#3b82f6';
                            return (
                                <button
                                    key={c.id}
                                    type="button"
                                    className={`course-pill-btn ${isActive ? 'active' : ''}`}
                                    style={{
                                        '--course-accent': cColor,
                                        borderColor: isActive ? cColor : undefined,
                                        boxShadow: isActive ? `0 0 12px ${cColor}33` : undefined
                                    }}
                                    onClick={() => {
                                        setCourseFilter(String(c.id));
                                        setGroupFilter('all');
                                    }}
                                >
                                    <span className="course-dot" style={{ backgroundColor: cColor }} />
                                    <span>{c.abbr ? `${c.abbr} • ` : ''}{c.name}</span>
                                    <span className="pill-count">{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Selector de Grupo Activo (para proyección en salón) */}
                    {isStaff && (
                        <div className="active-group-filter">
                            <label className="group-filter-label" htmlFor="group-select">
                                <Users size={15} />
                                <span>Grupo Activo:</span>
                            </label>
                            <select
                                id="group-select"
                                className="group-filter-select"
                                value={groupFilter}
                                onChange={(e) => setGroupFilter(e.target.value)}
                            >
                                <option value="all">👥 Todos los Grupos</option>
                                {relevantGroups.map(g => (
                                    <option key={g.id} value={g.id}>
                                        {g.name} {g.code ? `(${g.code})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Fila Secundaria: Tabs de Estado + Buscador */}
                <div className="evaluations-secondary-controls">
                    <div className="filter-tabs">
                        <button
                            type="button"
                            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Todas ({statusCounts.all})
                        </button>
                        <button
                            type="button"
                            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                            onClick={() => setFilter('pending')}
                        >
                            Pendientes ({statusCounts.pending})
                        </button>
                        <button
                            type="button"
                            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                            onClick={() => setFilter('completed')}
                        >
                            Completadas ({statusCounts.completed})
                        </button>
                    </div>

                    <div className="search-filter-box">
                        <Search size={15} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar evaluación o tema..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-filter-input"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="clear-search-btn"
                                onClick={() => setSearchQuery('')}
                                title="Limpiar búsqueda"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="evaluations-list">
                {filteredEvaluations.length === 0 ? (
                    <div className="empty-state glass-panel">
                        <FileText size={48} color="#64748b" />
                        <h3>No se encontraron evaluaciones</h3>
                        <p>No hay evaluaciones que coincidan con los filtros seleccionados.</p>
                        {(courseFilter !== 'all' || groupFilter !== 'all' || filter !== 'all' || searchQuery) && (
                            <button
                                type="button"
                                className="btn-reset-filters"
                                onClick={() => {
                                    setCourseFilter('all');
                                    setGroupFilter('all');
                                    setFilter('all');
                                    setSearchQuery('');
                                }}
                            >
                                Restablecer todos los filtros
                            </button>
                        )}
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
                                        if (isStaff) {
                                            navigate(`/dashboard/exam-lobby/${evaluation.evaluation_key}`);
                                        } else {
                                            navigate(`/dashboard/evaluations/${evaluation.evaluation_key}`);
                                        }
                                    }
                                }}
                            >
                                <div className="evaluation-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                                        {/* Chip del Curso con Color Distintivo */}
                                        <div 
                                            className="course-badge-chip"
                                            style={{
                                                backgroundColor: `${color}18`,
                                                color: color,
                                                borderColor: `${color}40`
                                            }}
                                            title={evaluation.course?.name}
                                        >
                                            <span className="course-dot-mini" style={{ backgroundColor: color }} />
                                            <span>{evaluation.course?.abbr || 'CURSO'}</span>
                                        </div>

                                        <div className="evaluation-type-badge" style={{ backgroundColor: `${color}20`, color: color }}>
                                            {evaluation.type}
                                        </div>

                                        {(evaluation.results_released === 0 || evaluation.results_released === false) && (
                                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                                🔒 Notas Ocultas
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                        {/* Acceso Rápido al Lobby Wayground para el Docente */}
                                        {isStaff && evaluation.evaluation_key && (
                                            <button
                                                type="button"
                                                className="card-quick-lobby-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/dashboard/exam-lobby/${evaluation.evaluation_key}`);
                                                }}
                                                title="Abrir Sala de Espera en Vivo (Wayground)"
                                            >
                                                <Radio size={13} className="live-pulse-dot" />
                                                <span>Sala en Vivo</span>
                                            </button>
                                        )}

                                        {isAdmin && evaluation.id && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleToggleRelease(e, evaluation)}
                                                title={(evaluation.results_released === 0 || evaluation.results_released === false) ? "Clic para liberar notas a los estudiantes" : "Clic para ocultar notas a los estudiantes"}
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid rgba(255,255,255,0.15)',
                                                    borderRadius: '6px',
                                                    color: (evaluation.results_released === 0 || evaluation.results_released === false) ? '#f87171' : '#34d399',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    padding: '2px 8px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {(evaluation.results_released === 0 || evaluation.results_released === false) ? 'Liberar' : 'Ocultar'}
                                            </button>
                                        )}
                                        <span className={`status-badge ${badge.class}`}>
                                            {badge.icon}
                                            {badge.text}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="evaluation-title">{evaluation.title}</h3>
                                <p className="evaluation-subject" style={{ color: color }}>
                                    {evaluation.course?.name || 'Curso Asignado'}
                                </p>
                                {evaluation.description && (
                                    <p className="evaluation-desc-text">
                                        {evaluation.description}
                                    </p>
                                )}

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
