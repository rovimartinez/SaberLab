import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Zap, Code, FlaskConical, Box, Bot, Brain, Play, BookOpen, Plus, Hash, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { supabase } from '../lib/supabase';
import { COURSES_DEFINITION } from '../data/coursesData.jsx';
import './Courses.css';

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

    const handleJoinCourse = async () => {
        if (!joinCode.trim()) return;
        if (!user) {
            alert('Debes iniciar sesión para unirte a un curso');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Buscar el código en la tabla group_codes (solo el código, sin joins)
            const { data: codeData, error: codeError } = await supabase
                .from('group_codes')
                .select('*')
                .eq('code', joinCode.trim().toUpperCase())
                .single();

            if (codeError || !codeData) {
                throw new Error('Código inválido');
            }

            if (new Date(codeData.expires_at) < new Date()) {
                throw new Error('El código ha expirado');
            }

            // Buscar el grupo
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .select('*')
                .eq('id', codeData.group_id)
                .single();

            if (groupError || !groupData) {
                throw new Error('Grupo no encontrado');
            }

            // Buscar el curso usando el course_id del grupo
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('*')
                .eq('id', groupData.course_id)
                .single();

            if (courseError || !courseData) {
                throw new Error('Curso no encontrado');
            }

            const group = groupData;
            const course = courseData;

            // Verificar si ya está inscrito
            const { data: existingEnrollment } = await supabase
                .from('enrollments')
                .select('*')
                .eq('user_id', user.id)
                .eq('course_id', course.id)
                .single();

            if (existingEnrollment) {
                throw new Error('Ya estás inscrito en este curso');
            }

            // Inscribir al usuario en el curso
            console.log('Insertando enrollment:', {
                user_id: user.id,
                course_id: course.id,
                group_id: group.id
            });

            const { error: enrollmentError } = await supabase
                .from('enrollments')
                .insert({
                    user_id: user.id,
                    course_id: course.id,
                    group_id: group.id,
                    progress: 0,
                    status: 'active'
                });

            if (enrollmentError) {
                console.error('Error enrollment:', enrollmentError);
                throw enrollmentError;
            }

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
                <div className="courses-grid">
                    {enrolledCourses.map((course) => {
                        const icon = getCourseIcon(course.abbr);
                        const color = getCourseColor(course.abbr);
                        const lessons = course.lessons || 0;
                        
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
                                        {course.progress}% completado
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

                        {error && <p style={{ color: '#f43f5e', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={handleJoinCourse} disabled={loading || !joinCode.trim()}>
                                {loading ? 'Uniéndose...' : 'Unirse'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowJoinModal(false)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="code-modal-overlay" onClick={() => setShowSuccessModal(false)}>
                    <div className="code-modal glass-panel" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                        <h2 style={{ color: '#10b981', marginBottom: '0.5rem' }}>¡Te has unido!</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Ahora eres parte de <strong>{joinedCourseName}</strong>
                        </p>
                        <button className="btn btn-primary" onClick={() => {
                            setShowSuccessModal(false);
                            navigate('/dashboard/my-courses');
                        }}>
                            Ver mis Cursos
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCourses;
