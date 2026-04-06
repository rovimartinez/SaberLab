import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Layers, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CourseDetail from './CourseDetail';
import '../styles/PanelMisCursos.css';

const PanelMisCursos = ({ courses, showHeader = true, embedded = false, onCourseSelect }) => {
    const navigate = useNavigate();
    const [groupCounts, setGroupCounts] = useState({});
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        const loadGroupCounts = async () => {
            const { data } = await supabase.from('grupos').select('course_id');
            if (data) {
                const counts = {};
                data.forEach(g => {
                    counts[g.course_id] = (counts[g.course_id] || 0) + 1;
                });
                setGroupCounts(counts);
            }
        };
        loadGroupCounts();
    }, []);

    const handleCourseClick = (course) => {
        if (embedded && onCourseSelect) {
            onCourseSelect(course);
        } else if (embedded) {
            setSelectedCourse(course);
        } else {
            navigate(`/dashboard/course/${course.id}`);
        }
    };

    // Si está embebido y hay un curso seleccionado, mostrar CourseDetail
    if (embedded && selectedCourse) {
        return (
            <div>
                <button 
                    onClick={() => setSelectedCourse(null)} 
                    style={{ 
                        marginBottom: '1rem', 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'var(--accent-blue)', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    ← Volver a Cursos
                </button>
                <CourseDetail courses={courses} setCourses={() => {}} embeddedCourse={selectedCourse} showHeader={false} />
            </div>
        );
    }

    return (
        <div className="courses-page">
            {showHeader && (
            <div className="page-header purple">
                <div className="header-title">
                    <GraduationCap size={28} className="text-gradient" />
                    <h1>Gestión de Cursos</h1>
                </div>
            </div>
            )}

            <div className="courses-grid">
                {courses.map((course) => (
                    <div 
                        key={course.id} 
                        className="course-overview-card glass-panel"
                        style={{ 
                            background: `linear-gradient(135deg, ${course.color}40 0%, ${course.color}10 100%)`,
                            padding: '1rem',
                            minHeight: 'auto'
                        }}
                        onClick={() => handleCourseClick(course)}
                    >
                        <div className="course-bg-icon" style={{ color: course.color, opacity: 0.3 }}>
                            {React.cloneElement(course.icon, { size: 60 })}
                        </div>
                        <h3 className="course-overview-name" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{course.name}</h3>
                        <div className="course-overview-meta">
                            <span className="course-overview-groups" style={{ fontSize: '0.75rem' }}>
                                <Layers size={12} />
                                {groupCounts[course.id] || 0} grupos
                            </span>
                        </div>
                        <div className="course-overview-action" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            <span>Gestionar</span>
                            <ArrowRight size={14} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PanelMisCursos;
