import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Zap, Code, FlaskConical, Box, Bot, Brain, Play, BookOpen, Plus, Hash, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';
import { COURSES_DEFINITION } from '../data/coursesData.jsx';
import '../styles/PanelMisCursos.css';

const getCourseIcon = (abbr) => {
    const def = COURSES_DEFINITION.find(c => c.abbr === abbr);
    if (def?.icon) return def.icon;
    if (abbr === 'RE') return <Bot size={28} />;
    if (abbr === 'EE') return <Zap size={28} />;
    return <GraduationCap size={28} />;
};

const getCourseColor = (abbr) => {
    const def = COURSES_DEFINITION.find(c => c.abbr === abbr);
    return def?.color || '#6366f1';
};

const MyCourses = () => {
    const navigate = useNavigate();
    const { user, enrolledCourses, refreshEnrolledCourses } = useAuth();
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [joinedCourseName, setJoinedCourseName] = useState('');
    const [completedLessonsMap, setCompletedLessonsMap] = useState({});

    // Cargar progreso de lecciones en tiempo real desde Cloudflare D1
    React.useEffect(() => {
        const loadLiveProgress = async () => {
            if (!user?.id) return;
            try {
                const { data } = await api('/lesson-progress');
                if (Array.isArray(data)) {
                    const map = {};
                    data.forEach(item => {
                        if (item.status === 'completed' || item.progress === 100) {
                            map[item.lesson_id] = true;
                        }
                    });
                    setCompletedLessonsMap(map);
                }
            } catch (err) {
                console.error('Error cargando progreso en MyCourses:', err);
            }
        };
        loadLiveProgress();
    }, [user?.id]);

    const calculateCourseProgress = (course) => {
        if (!course.modules || course.modules.length === 0) return course.progress || 0;
        const allLessons = course.modules.flatMap(m => (m.lessons || []).map(l => {
            const normalizedId = l.id.includes('-') ? l.id : `${course.abbr?.toLowerCase()}-${m.id}-${l.id}`;
            return { rawId: l.id, normalizedId };
        }));
        const total = allLessons.length;
        if (total === 0) return 0;
        const completed = allLessons.filter(l => completedLessonsMap[l.normalizedId] || completedLessonsMap[l.rawId]).length;
        if (completed > 0) {
            return Math.min(100, Math.round((completed / total) * 100));
        }
        return course.progress || 0;
    };

    const handleJoinCourse = async () => {
        if (!joinCode.trim()) return;
        if (!user) {
            alert('Debes iniciar sesión para unirte a un curso');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error } = await api('/enrollments/code', {
                method: 'POST',
                body: { code: joinCode.trim() }
            });

            if (error || !data?.curso) {
                throw new Error(error?.message || 'Código inválido');
            }

            const course = data.curso;
            const group = data.grupo;

            setJoinedCourseName(course.name);
            setShowSuccessModal(true);
            setJoinCode('');
            setShowJoinModal(false);
            await refreshEnrolledCourses();

        } catch (err) {
            console.error('Error unirse:', err);
            setError(err.message || 'Error al unirse al curso');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="courses-page">
            <div className="page-header purple">
                <div className="header-title">
                    <GraduationCap size={28} className="text-gradient" />
                    <h1>Mis Cursos</h1>
                </div>
                <button className="btn btn-primary" onClick={() => setShowJoinModal(true)}>
                    <Plus size={18} />
                    Unirse con Código
                </button>
            </div>

            {enrolledCourses.length > 0 ? (
                <div className="courses-grid my-courses-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {enrolledCourses.map((course) => {
                        const icon = getCourseIcon(course.abbr);
                        const color = getCourseColor(course.abbr);
                        const lessons = course.modules ? course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) : 0;
                        
                        return (
                        <div 
                            key={course.id} 
                            className="course-card-classic"
                            style={{ 
                                background: `linear-gradient(90deg, ${color}50 0%, #161d2b 100%)`,
                                border: `1px solid ${color}40`,
                                boxShadow: `0 4px 20px ${color}15`
                            }}
                            onClick={() => navigate(`/dashboard/learn/${course.slug}`)}
                        >
                            <div className="card-classic-main">
                                <h3 className="card-classic-title">{course.name}</h3>
                                <div className="card-classic-meta-row">
                                    <div className="card-classic-meta">
                                        <BookOpen size={16} />
                                        <span>{lessons} lecciones</span>
                                    </div>
                                    <div className="card-classic-progress" style={{ color: 'white', fontWeight: '800' }}>
                                        {calculateCourseProgress(course)}% completado
                                    </div>
                                </div>
                                <div className="card-classic-bg-icon" style={{ opacity: 0.4, color: color }}>
                                    {React.cloneElement(icon, { size: 110 })}
                                </div>
                            </div>
                            
                            <div className="card-classic-footer">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div className="card-classic-dot" style={{ backgroundColor: color }}></div>
                                    <span>Continuar Aprendizaje</span>
                                </div>
                                <ArrowRight size={18} />
                            </div>
                        </div>
                    )})}
                </div>
            ) : (
                <div className="empty-courses glass-panel">
                    <GraduationCap size={64} color="rgba(255,255,255,0.2)" />
                    <h2>No tienes cursos inscritos</h2>
                    <p>Únete a un curso usando el código que te proporcionó tu docente</p>
                    <button className="btn btn-primary" onClick={() => setShowJoinModal(true)}>
                        <Hash size={18} />
                        Unirse con Código
                    </button>
                </div>
            )}

            {/* Join with Code Modal */}
            {showJoinModal && (
                <div className="join-modal-overlay" onClick={() => setShowJoinModal(false)}>
                    <div className="join-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <span className="modal-label" style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>
                                Unirse a un curso
                            </span>
                            <h2 className="modal-course-name" style={{ color: 'white', fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>
                                Ingresa el código
                            </h2>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                            <input
                                type="text"
                                placeholder="Código del curso"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '0.85rem 1rem',
                                    borderRadius: '12px',
                                    background: 'rgba(15, 23, 42, 0.8)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    textTransform: 'uppercase',
                                    letterSpacing: '4px',
                                    fontSize: '1.2rem',
                                    textAlign: 'center',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        {error && <p style={{ color: '#f43f5e', textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

                        <div className="modal-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleJoinCourse} 
                                disabled={loading || !joinCode.trim()}
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                {loading ? 'Uniéndose...' : 'Unirse'}
                            </button>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => setShowJoinModal(false)}
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="join-modal-overlay" onClick={() => setShowSuccessModal(false)}>
                    <div className="join-modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
                        <h2 style={{ color: '#10b981', marginBottom: '0.5rem', fontSize: '1.6rem', fontWeight: 800 }}>¡Te has unido!</h2>
                        <p style={{ color: '#cbd5e1', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
                            Ahora eres parte de <strong style={{ color: '#38bdf8' }}>{joinedCourseName}</strong>
                        </p>
                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                            onClick={async () => {
                                setShowSuccessModal(false);
                                await refreshEnrolledCourses();
                            }}
                        >
                            Ver mis Cursos
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCourses;
