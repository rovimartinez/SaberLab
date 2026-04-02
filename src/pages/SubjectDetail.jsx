import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, FileText, CheckCircle, Lock, Zap, Bot, BookOpen, Code, FlaskConical, Box, Brain } from 'lucide-react';
import { getCourseByIdentifier } from '../data/coursesData.jsx';
import './SubjectDetail.css';

const subjectData = {
    'EE': { name: 'Electricidad y Electrónica Básica', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: <Zap size={32} />, teacher: 'Ronny Martinez', abbr: 'EE' },
    'RE': { name: 'Robótica Educativa', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', icon: <Bot size={32} />, teacher: 'Ronny Martinez', abbr: 'RE' },
    'FP': { name: 'Fundamentos de Programación', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: <Code size={32} />, teacher: 'Ronny Martinez', abbr: 'FP' },
    'MQ': { name: 'Mediaciones Tecnológicas en la Química', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: <FlaskConical size={32} />, teacher: 'Ronny Martinez', abbr: 'MQ' },
    'MA': { name: 'Modelado y Animación 3D', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)', icon: <Box size={32} />, teacher: 'Ronny Martinez', abbr: 'MA' },
    'TD': { name: 'Tendencias y Desarrollo en Tecnología', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', icon: <Brain size={32} />, teacher: 'Ronny Martinez', abbr: 'TD' }
};

const agendaItems = [
    { date: 'Marzo 11, 2026', type: 'EVALUACIÓN', title: 'Módulo 1 - 1', points: 150 },
    { date: 'Abril 22, 2026', type: 'EVALUACIÓN', title: 'Módulo 2 - 2', points: 125 },
    { date: 'Mayo 13, 2026', type: 'EVALUACIÓN', title: 'Módulo 3 - 3', points: 125 },
    { date: 'Mayo 27, 2026', type: 'PROYECTO', title: 'Módulo 4 - FINAL', points: 100 }
];

const getIcon = (type, status) => {
    if (status === 'locked') return <Lock size={20} />;
    if (type === 'content') return <FileText size={20} />;
    if (type === 'video') return <PlayCircle size={20} />;
    if (type === 'reading') return <FileText size={20} />;
    return <CheckCircle size={20} />;
};

const SubjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const realCourse = getCourseByIdentifier(id) || getCourseByIdentifier('RE');
    const abbr = realCourse.abbr;
    const subject = {
        ...realCourse,
        bg: `${realCourse.color}15`,
        teacher: 'Ronny Martinez' // TODO: Get from course info
    };

    // Redirigir automáticamente al slug descriptivo si se entra por la abreviatura
    useEffect(() => {
        if (id && realCourse && id !== realCourse.slug) {
            navigate(`/dashboard/my-courses/${realCourse.slug}`, { replace: true });
        }
    }, [id, realCourse, navigate]);

    const modules = abbr === 'RE' ? [
        { 
            id: 'm1', 
            name: 'Módulo 1: Fundamentos y Lógica Digital', 
            lessons: [
                { id: 'l1', title: 'Mi primer parpadeo (Entorno y Salidas Digitales)', type: 'content', duration: '15 min', status: 'completed' },
                { id: 'l2', title: 'Semáforos y Variables', type: 'content', duration: '20 min', status: 'current' },
                { id: 'l3', title: 'El Robot decide (Condicionales y Botones)', type: 'content', duration: '25 min', status: 'locked' },
                { id: 'l4', title: 'Monitor Serial y el Bucle while', type: 'content', duration: '18 min', status: 'locked' },
                { id: 'l5', title: 'Entradas Analógicas y Resolución', type: 'quiz', duration: '20 min', status: 'locked' }
            ]
        },
        { 
            id: 'm2', 
            name: 'Módulo 2: Potencia, Movimiento y Ciclos', 
            lessons: [
                { id: 'l6', title: 'Modulación PWM y el Bucle for', type: 'content', duration: '20 min', status: 'locked' },
                { id: 'l7', title: 'Servomotores y Abstracción con Librerías', type: 'content', duration: '25 min', status: 'locked' },
                { id: 'l8', title: 'Motores DC y el Puente H', type: 'content', duration: '20 min', status: 'locked' },
                { id: 'l9', title: 'Gestión de Energía y Seguridad Eléctrica', type: 'content', duration: '15 min', status: 'locked' },
                { id: 'l10', title: 'Programación Modular (Funciones)', type: 'quiz', duration: '30 min', status: 'locked' }
            ]
        },
        { 
            id: 'm3', 
            name: 'Módulo 3: Percepción y Algoritmos Autónomos', 
            lessons: [
                { id: 'l11', title: 'Sensor Ultrasonido (HC-SR04)', type: 'content', duration: '20 min', status: 'locked' },
                { id: 'l12', title: 'Infrarrojos y Operadores Lógicos', type: 'content', duration: '18 min', status: 'locked' },
                { id: 'l13', title: 'Sensores de Entorno', type: 'content', duration: '15 min', status: 'locked' }
            ]
        },
        { 
            id: 'm4', 
            name: 'Módulo 4: Construcción y Didáctica', 
            lessons: [
                { id: 'l14', title: 'Diseño Mecánico y Ensamblaje', type: 'content', duration: '25 min', status: 'locked' },
                { id: 'l15', title: 'Proyecto Integrador: El Robot Autónomo', type: 'quiz', duration: '60 min', status: 'locked' },
                { id: 'l16', title: 'Documentación Técnica y Pedagógica', type: 'content', duration: '20 min', status: 'locked' }
            ]
        }
    ] : [
        { 
            id: 'm1', 
            name: 'Módulo 1: Fundamentos', 
            lessons: [
                { id: 'l1', title: 'Introducción a Conceptos', type: 'content', duration: '12 min', status: 'completed' },
                { id: 'l2', title: 'Principios Básicos', type: 'content', duration: '8 min', status: 'completed' },
                { id: 'l3', title: 'Ejercicios Prácticos', type: 'quiz', duration: '15 min', status: 'current' },
                { id: 'l4', title: 'Aplicaciones Avanzadas', type: 'content', duration: '20 min', status: 'locked' },
                { id: 'l5', title: 'Evaluación Final', type: 'quiz', duration: '30 min', status: 'locked' }
            ]
        }
    ];

    const [expandedModules, setExpandedModules] = useState(() => {
        const initialState = { m1: true };
        modules.forEach(m => {
            if (m.lessons.some(l => l.status === 'current')) {
                initialState[m.id] = true;
            }
        });
        return initialState;
    });

    return (
        <div className="subject-detail-container animate-fade-in" style={{ padding: '0 1rem' }}>
            <div className="detail-header-classic" style={{ 
                background: `linear-gradient(90deg, ${subject.color}50 0%, #161d2b 100%)`, 
                padding: '1.5rem 2rem', 
                border: `1px solid ${subject.color}40`,
                boxShadow: `0 4px 20px ${subject.color}15`,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '20px',
                marginBottom: '2rem'
            }}>
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: subject.color, letterSpacing: '0.5px' }}>PANEL DEL CURSO</span>
                    </div>
                    
                    <h1 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.5px' }}>
                        {subject.name}
                    </h1>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div className="header-stat-item">
                            <span className="stat-label">Docente: <b style={{ color: subject.color }}>{subject.teacher}</b></span>
                        </div>
                        <div className="header-stat-item" style={{ flex: 1, maxWidth: '200px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.75rem' }}>
                                <span className="stat-label">Progreso</span>
                                <span className="stat-label">5%</span>
                            </div>
                            <div className="mini-progress-track" style={{ width: '100%' }}>
                                <div className="mini-progress-fill" style={{ width: '5%', background: subject.color }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Background Element */}
                <div style={{ 
                    position: 'absolute', 
                    right: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%) rotate(15deg)',
                    opacity: 0.4,
                    color: subject.color,
                    pointerEvents: 'none',
                    zIndex: 1
                }}>
                    {React.cloneElement(subject.icon, { size: 180 })}
                </div>
            </div>

            <div className="course-content">
                <div className="syllabus-section">
                    <div className="syllabus-header-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 1.25rem 0', height: '1.5rem' }}>
                        <div className="syllabus-header-icon" style={{ background: `${subject.color}15`, color: subject.color, width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyCenter: 'center', justifyContent: 'center' }}>
                            <BookOpen size={20} />
                        </div>
                        <h2 className="section-title-premium">Plan de Estudios</h2>
                    </div>
                    <div className="modules-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {modules.map((module) => (
                            <div key={module.id} className="module-card-improved glass-panel">
                                <div 
                                    className="module-header-action"
                                    onClick={() => setExpandedModules(prev => ({ ...prev, [module.id]: !prev[module.id] }))}
                                >
                                    <div className="module-title-group">
                                        <div className="module-number" style={{ background: subject.color }}>{module.id.replace('m', '')}</div>
                                        <h3 className="module-name-text">{module.name}</h3>
                                    </div>
                                    <div className="module-meta-info">
                                        <span>{module.lessons.length} lecciones</span>
                                        <div className={`chevron ${expandedModules[module.id] ? 'open' : ''}`}>▼</div>
                                    </div>
                                </div>
                                {expandedModules[module.id] && (
                                    <div className="lessons-list-premium">
                                        {module.lessons.map((lesson) => (
                                            <div key={lesson.id} className={`lesson-item-improved ${lesson.status}`}>
                                                <div className="lesson-indicator-line" style={{ background: lesson.status === 'current' ? subject.color : 'transparent' }}></div>
                                                <div className="lesson-icon-circle" style={{ color: lesson.status === 'current' ? subject.color : undefined }}>
                                                    {getIcon(lesson.type, lesson.status)}
                                                </div>
                                                <div className="lesson-main-info">
                                                    <h4 className="lesson-title-text">{lesson.title}</h4>
                                                    <span className="lesson-subtitle">{lesson.type === 'content' ? 'Lección Teórica' : 'Evaluación'} • {lesson.duration}</span>
                                                </div>
                                                <div className="lesson-action-area">
                                                    {lesson.status !== 'locked' ? (
                                                        <button 
                                                            className={`lesson-btn ${lesson.status === 'completed' ? 'revisit' : 'start'}`} 
                                                            style={lesson.status === 'current' ? { background: subject.color } : {}}
                                                            onClick={() => navigate(`/dashboard/my-courses/${subject.slug}/${module.id}/${lesson.id}`)}
                                                        >
                                                            {lesson.status === 'completed' ? 'Ver de nuevo' : 'Comenzar'}
                                                        </button>
                                                    ) : (
                                                        <div className="locked-badge"><Lock size={14} /> Bloqueado</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="course-sidebar-improved">
                    <div className="sidebar-card-premium agenda-container">
                        <div className="sidebar-header-row">
                            <div className="sidebar-header-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
                                <CheckCircle size={20} />
                            </div>
                            <h2 className="section-title-premium">Agenda y Evaluación</h2>
                        </div>
                        
                        <div className="agenda-list">
                            {agendaItems.map((item, index) => {
                                const parts = item.title.split(' - ');
                                const modulePart = parts[0];
                                const mainTitle = parts.length > 1 ? parts.slice(1).join(' - ') : item.title;
                                
                                return (
                                    <div key={index} className="agenda-card-classic" style={{ padding: '0.85rem 1.25rem' }}>
                                        <div className="agenda-top-bar" style={{ flexWrap: 'nowrap', gap: '1rem', width: '100%', display: 'flex', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, whiteSpace: 'nowrap' }}>
                                                <span className="agenda-module-badge" style={{ backgroundColor: `${subject.color}20`, color: subject.color, width: '80px', textAlign: 'center', flexShrink: 0 }}>
                                                    {modulePart}
                                                </span>
                                                <span className="agenda-type-pill" style={{ backgroundColor: 'transparent', color: '#f43f5e', fontSize: '0.82rem', padding: '0', fontWeight: 800, width: '135px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {item.type} {mainTitle.split(' ').pop()}
                                                </span>
                                                <span className="agenda-points-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, width: '70px', textAlign: 'center', flexShrink: 0 }}>
                                                    {item.points} pts
                                                </span>
                                            </div>
                                            <span className="agenda-date-small" style={{ marginLeft: 'auto', whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.75rem', textAlign: 'right', minWidth: '100px' }}>{item.date}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubjectDetail;
