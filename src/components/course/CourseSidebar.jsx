import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, BookOpen, Layers, CheckCircle2, FileText, X, Lock, PlayCircle, Circle } from 'lucide-react';
import { LESSONS_REGISTRY } from '../../data/coursesData';
import './CourseSidebar.css';

const CourseSidebar = ({ subject, currentLessonId, isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const [expandedModules, setExpandedModules] = useState({});

    // Automatically expand the current module when the sidebar opens or the lesson changes
    useEffect(() => {
        if (subject && subject.modules) {
            const currentModule = subject.modules.find(mod => 
                mod.lessons.some(l => l.id === currentLessonId)
            );
            if (currentModule) {
                setExpandedModules(prev => ({
                    ...prev,
                    [currentModule.id]: true
                }));
            }
        }
    }, [subject, currentLessonId]);

    if (!subject || !subject.modules) return null;

    const toggleModule = (moduleId) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    const handleLessonClick = (lessonId, isLocked) => {
        if (isLocked) return; // Don't navigate if locked

        const targetModule = subject.modules.find(mod => mod.lessons.some(l => l.id === lessonId));
        if (!targetModule) return;

        const lessonShortId = lessonId.split('-').pop(); // 're-m1-l1' -> 'l1'
        navigate(`/dashboard/my-courses/${subject.slug}/${targetModule.id}/${lessonShortId}`);
        
        if (window.innerWidth < 1024) {
            toggleSidebar();
        }
    };

    // Mock progress logic for demonstration
    // In a real app, this would come from the database (user_progress table)
    const getLessonStatus = (lessonId) => {
        // Find flat list of all lessons to determine order
        const allLessons = subject.modules.flatMap(m => m.lessons.map(l => l.id));
        const currentIdx = allLessons.indexOf(currentLessonId);
        const thisIdx = allLessons.indexOf(lessonId);

        if (thisIdx < currentIdx) return 'completed';
        if (thisIdx === currentIdx) return 'active';
        if (thisIdx === currentIdx + 1) return 'available';
        return 'locked';
    };

    return (
        <>
            <div className={`course-sidebar ${isOpen ? 'open' : ''}`}>
                <button 
                    className="course-sidebar-handle"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleSidebar();
                    }}
                >
                    <div className="handle-arrow">
                        {isOpen ? <X size={20} /> : <FileText size={20} />}
                    </div>
                </button>

                <div className="course-sidebar-wrapper">
                    <div className="cs-header">
                        <div className="cs-icon-box" style={{ background: `${subject.color}20`, color: subject.color }}>
                            <Layers size={20} />
                        </div>
                        <div className="cs-header-info">
                            <h3>Mapa del Curso</h3>
                            <p>{subject.name}</p>
                        </div>
                    </div>

                    <div className="cs-content">
                        {subject.modules.map((module, mIdx) => {
                            const isExpanded = expandedModules[module.id];
                            const containsActive = module.lessons.some(l => l.id === currentLessonId);
                            
                            return (
                                <div key={module.id} className={`cs-module-group ${isExpanded ? 'is-expanded' : ''}`}>
                                    <button 
                                        className={`cs-module-header ${containsActive ? 'has-active' : ''}`}
                                        onClick={() => toggleModule(module.id)}
                                    >
                                        <div className="cs-module-title-box">
                                            <span className="cs-module-title">{module.name}</span>
                                        </div>
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>

                                    <div className="cs-lessons-list">
                                        {module.lessons.map((lessonRef) => {
                                            const lessonInfo = LESSONS_REGISTRY[lessonRef.id];
                                            const status = getLessonStatus(lessonRef.id);
                                            const isActive = status === 'active';
                                            const isLocked = status === 'locked';
                                            const isCompleted = status === 'completed';
                                            
                                            return (
                                                <button 
                                                    key={lessonRef.id}
                                                    className={`cs-lesson-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                                    onClick={() => handleLessonClick(lessonRef.id, isLocked)}
                                                    style={{ '--accent': subject.color }}
                                                    disabled={isLocked}
                                                >
                                                    <div className="cs-lesson-status">
                                                        {isLocked ? (
                                                            <Lock size={14} className="status-icon-locked" />
                                                        ) : (
                                                            <div className={`status-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`} />
                                                        )}
                                                    </div>
                                                    <div className="cs-lesson-text">
                                                        <span className="cs-lesson-title">
                                                            {lessonInfo?.title || 'Lección'}
                                                        </span>
                                                    </div>
                                                    {isActive && <div className="cs-lesson-indicator" style={{ background: subject.color }} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {isOpen && <div className="course-sidebar-overlay" onClick={toggleSidebar}></div>}
        </>
    );
};

export default CourseSidebar;
