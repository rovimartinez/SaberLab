import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Layers, ArrowRight } from 'lucide-react';
import './Courses.css';

const Courses = ({ courses }) => {
    const navigate = useNavigate();

    return (
        <div className="courses-page">
            <div className="page-header purple">
                <div className="header-title">
                    <GraduationCap size={28} className="text-gradient" />
                    <h1>Gestión de Cursos</h1>
                </div>
            </div>

            <div className="courses-grid">
                {courses.map((course) => (
                    <div 
                        key={course.id} 
                        className="course-overview-card glass-panel"
                        style={{ background: `linear-gradient(135deg, ${course.color}40 0%, ${course.color}10 100%)` }}
                        onClick={() => navigate(`/dashboard/learn/${course.abbr}`)}
                    >
                        <div className="course-bg-icon" style={{ color: course.color }}>
                            {React.cloneElement(course.icon, { size: 120 })}
                        </div>
                        <h3 className="course-overview-name">{course.name}</h3>
                        <div className="course-overview-meta">
                            <span className="course-overview-groups">
                                <Layers size={14} />
                                {course.groups.length} grupo{course.groups.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="course-overview-action">
                            <span>Gestionar</span>
                            <ArrowRight size={18} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Courses;
