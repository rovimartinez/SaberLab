import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Zap, Code, FlaskConical, Box, Bot, Brain, Play, BookOpen, Plus, Hash, ArrowRight } from 'lucide-react';
import './Courses.css';

const ENROLLED_COURSES = [
    { id: 5, abbr: 'RE', name: 'Robótica Educativa', icon: <Bot size={28} />, color: '#a855f7', lessons: 16, progress: 0 }
];

const MyCourses = () => {
    const navigate = useNavigate();
    const [enrolledCourses] = useState(ENROLLED_COURSES);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState('');

    const handleJoinCourse = () => {
        if (joinCode.trim()) {
            alert(`Código ${joinCode} enviado para verificación`);
            setJoinCode('');
            setShowJoinModal(false);
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
                <div className="courses-grid">
                    {enrolledCourses.map((course) => (
                        <div 
                            key={course.id} 
                            className="course-card-classic"
                            style={{ 
                                background: `linear-gradient(90deg, ${course.color}50 0%, #161d2b 100%)`,
                                border: `1px solid ${course.color}40`,
                                boxShadow: `0 4px 20px ${course.color}15`
                            }}
                            onClick={() => navigate(`/dashboard/learn/${course.abbr}`)}
                        >
                            <div className="card-classic-main">
                                <h3 className="card-classic-title">{course.name}</h3>
                                <div className="card-classic-meta-row">
                                    <div className="card-classic-meta">
                                        <BookOpen size={16} />
                                        <span>{course.lessons} lecciones</span>
                                    </div>
                                    <div className="card-classic-progress" style={{ color: 'white', fontWeight: '800' }}>
                                        {course.progress}% completado
                                    </div>
                                </div>
                                <div className="card-classic-bg-icon" style={{ opacity: 0.4, color: course.color }}>
                                    {React.cloneElement(course.icon, { size: 110 })}
                                </div>
                            </div>
                            
                            <div className="card-classic-footer">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div className="card-classic-dot" style={{ backgroundColor: course.color }}></div>
                                    <span>Continuar Aprendizaje</span>
                                </div>
                                <ArrowRight size={18} />
                            </div>
                        </div>
                    ))}
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
                <div className="code-modal-overlay" onClick={() => setShowJoinModal(false)}>
                    <div className="code-modal glass-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-label">Unirse a un curso</span>
                            <h2 className="modal-course-name">Ingresa el código</h2>
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Código del curso"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                autoFocus
                                style={{ textTransform: 'uppercase', letterSpacing: '4px', fontSize: '1.2rem', textAlign: 'center' }}
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={handleJoinCourse}>
                                Unirse
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowJoinModal(false)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCourses;
