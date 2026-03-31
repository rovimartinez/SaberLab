import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Layers, BookOpen, Settings, Users, Plus, Trash2, FileCode, Check, Copy, Eye, EyeOff, FolderPlus } from 'lucide-react';
import './CourseDetail.css';

const CourseDetail = ({ courses, setCourses }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const course = courses.find(c => c.id === parseInt(id));

    const [activeTab, setActiveTab] = useState('groups');
    const [expandedModules, setExpandedModules] = useState({});
    const [courseModules, setCourseModules] = useState([]);
    const [codeModal, setCodeModal] = useState({ isOpen: false, group: null, code: null, expiresAt: null });
    const [copied, setCopied] = useState(false);
    const [newGroupModal, setNewGroupModal] = useState({ isOpen: false, teacher: '' });

    const courseRef = useRef(course);
    useEffect(() => {
        courseRef.current = course;
    }, [course]);

    useEffect(() => {
        if (course) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCourseModules(course.modules.map(m => ({
                ...m,
                lessons: m.lessons.map(l => ({ ...l }))
            })));
        }
    }, [course]);

    const generateCode = useCallback((courseName) => {
        const prefix = (courseName.substring(0, 2)).toUpperCase();
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `${prefix}${code}`;
    }, []);

    const getExpiresAt = useCallback(() => {
        return Date.now() + 5 * 60 * 1000;
    }, []);

    const getNewGroupId = useCallback(() => {
        return `g${Date.now()}`;
    }, []);

    if (!course) {
        return (
            <div className="course-detail-page">
                <div className="course-not-found">
                    <h2>Curso no encontrado</h2>
                    <button className="btn btn-primary" onClick={() => navigate('/dashboard/courses')}>
                        <ArrowLeft size={18} />
                        Volver a Gestión de Cursos
                    </button>
                </div>
            </div>
        );
    }

    const updateCourse = (updatedCourse) => {
        setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    };

    const openNewGroupModal = () => {
        setNewGroupModal({ isOpen: true, teacher: '' });
    };

    const closeNewGroupModal = () => {
        setNewGroupModal({ isOpen: false, teacher: '' });
    };

    const handleCreateGroup = () => {
        if (newGroupModal.teacher.trim()) {
            const newGroup = {
                id: getNewGroupId(),
                name: newGroupModal.teacher.trim(),
                teacher: newGroupModal.teacher.trim(),
                students: []
            };
            updateCourse({ ...course, groups: [...course.groups, newGroup] });
            closeNewGroupModal();
        }
    };

    const deleteGroup = (groupId) => {
        updateCourse({ ...course, groups: course.groups.filter(g => g.id !== groupId) });
    };

    const openCodeModal = (group) => {
        const code = generateCode(course.name, group.name);
        const expiresAt = getExpiresAt();
        setCodeModal({ isOpen: true, group, code, expiresAt });
        setCopied(false);
    };

    const closeCodeModal = () => {
        setCodeModal({ isOpen: false, group: null, code: null, expiresAt: null });
    };

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(codeModal.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            console.log('Failed to copy');
        }
    };

    const toggleLessonVisibility = (moduleId, lessonId) => {
        const updatedModules = courseModules.map(m => 
            m.id === moduleId ? {
                ...m,
                lessons: m.lessons.map(l => 
                    l.id === lessonId ? { ...l, visible: !l.visible } : l
                )
            } : m
        );
        setCourseModules(updatedModules);
        updateCourse({
            ...course,
            modules: updatedModules
        });
    };

    const toggleModuleVisibility = (moduleId) => {
        const module = courseModules.find(m => m.id === moduleId);
        const allVisible = module?.lessons.every(l => l.visible);
        
        const updatedModules = courseModules.map(m => 
            m.id === moduleId ? {
                ...m,
                lessons: m.lessons.map(l => ({ ...l, visible: !allVisible }))
            } : m
        );
        setCourseModules(updatedModules);
        updateCourse({
            ...course,
            modules: updatedModules
        });
    };

    const toggleExpandModule = (moduleId) => {
        setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    return (
        <div className="course-detail-page">
            <div className="course-detail-header glass-panel" style={{ background: `linear-gradient(135deg, ${course.color}40 0%, ${course.color}10 100%)` }}>
                <button className="back-btn" onClick={() => navigate('/dashboard/courses')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="course-detail-info">
                    <h1>{course.name}</h1>
                    <span className="course-detail-stats">
                        <Layers size={16} />
                        {course.groups.length} grupo{course.groups.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            <div className="course-detail-tabs glass-panel">
                <button 
                    className={`detail-tab ${activeTab === 'groups' ? 'active' : ''}`}
                    onClick={() => setActiveTab('groups')}
                >
                    <Users size={18} />
                    Grupos
                </button>
                <button 
                    className={`detail-tab ${activeTab === 'content' ? 'active' : ''}`}
                    onClick={() => setActiveTab('content')}
                >
                    <BookOpen size={18} />
                    Contenidos
                </button>
                <button 
                    className={`detail-tab ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <Settings size={18} />
                    Configuración
                </button>
            </div>

            <div className="course-detail-content glass-panel">
                {activeTab === 'groups' && (
                    <div className="tab-panel">
                        <div className="panel-header">
                            <h3>Grupos del Curso</h3>
                            <button className="btn btn-primary" onClick={openNewGroupModal}>
                                <Plus size={16} />
                                Nuevo Grupo
                            </button>
                        </div>
                        <div className="groups-list">
                            {course.groups.map((group) => (
                                <div key={group.id} className="group-card">
                                    <div className="group-card-info">
                                        <span className="group-card-name">{group.name}</span>
                                        {group.teacher && (
                                            <span className="group-card-teacher">
                                                Prof. {group.teacher}
                                            </span>
                                        )}
                                        <span className="group-card-students">
                                            {group.students.length} estudiante{group.students.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="group-card-actions">
                                        <button className="btn btn-small" onClick={() => openCodeModal(group)}>
                                            <FileCode size={14} />
                                            Generar Código
                                        </button>
                                        <button className="btn btn-small btn-danger" onClick={() => deleteGroup(group.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {course.groups.length === 0 && (
                                <div className="empty-state">
                                    <p>No hay grupos creados</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="tab-panel">
                        <div className="panel-header">
                            <h3>Módulos y Lecciones</h3>
                            <p className="panel-description">Controla qué contenido ven los estudiantes</p>
                        </div>
                        <div className="modules-list">
                            {(courseModules[course.id] || []).map((module, idx) => (
                                <div key={module.id} className="module-card">
                                    <div className="module-card-header" onClick={() => toggleExpandModule(module.id)}>
                                        <div className="module-card-info">
                                            <span className="module-card-number">{idx + 1}</span>
                                            <span className="module-card-name">{module.name}</span>
                                        </div>
                                        <div className="module-card-actions">
                                            <button 
                                                className={`visibility-btn ${
                                                    module.lessons.every(l => l.visible) ? 'all' : 
                                                    module.lessons.some(l => l.visible) ? 'partial' : 'none'
                                                }`}
                                                onClick={(e) => { e.stopPropagation(); toggleModuleVisibility(module.id); }}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <span className={`module-visibility-count ${
                                                module.lessons.every(l => l.visible) ? 'all' : 
                                                module.lessons.some(l => l.visible) ? 'partial' : 'none'
                                            }`}>
                                                {module.lessons.filter(l => l.visible).length}/{module.lessons.length}
                                            </span>
                                            <span className={`expand-arrow ${expandedModules[module.id] ? 'expanded' : ''}`}>▼</span>
                                        </div>
                                    </div>
                                    {expandedModules[module.id] && (
                                        <div className="module-card-lessons">
                                            {module.lessons.map((lesson) => (
                                                <div key={lesson.id} className={`lesson-item ${lesson.visible ? 'visible' : 'hidden'}`}>
                                                    <span className="lesson-name">{lesson.name}</span>
                                                    <button 
                                                        className={`visibility-btn ${lesson.visible ? 'is-visible' : ''}`}
                                                        onClick={() => toggleLessonVisibility(module.id, lesson.id)}
                                                    >
                                                        {lesson.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                                        <span>{lesson.visible ? 'Visible' : 'Oculto'}</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="tab-panel">
                        <div className="panel-header">
                            <h3>Configuración del Curso</h3>
                        </div>
                        <div className="settings-list">
                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-name">Nombre del curso</span>
                                    <span className="setting-value">{course.name}</span>
                                </div>
                                <button className="btn btn-small">Editar</button>
                            </div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-name">Total de grupos</span>
                                    <span className="setting-value">{course.groups.length}</span>
                                </div>
                            </div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-name">Total de lecciones</span>
                                    <span className="setting-value">{course.modules.reduce((acc, m) => acc + m.lessons.length, 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Code Modal */}
            {codeModal.isOpen && (
                <div className="code-modal-overlay" onClick={closeCodeModal}>
                    <div className="code-modal glass-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-label">Código para unirse al grupo:</span>
                            <h2 className="modal-course-name">{codeModal.group?.name}</h2>
                        </div>

                        <div className="code-display">
                            <span className="code-text">{codeModal.code}</span>
                        </div>

                        <CodeTimer expiresAt={codeModal.expiresAt} onExpire={() => {
                            setTimeout(closeCodeModal, 3000);
                        }} />

                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={copyCode}>
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                {copied ? '¡Copiado!' : 'Copiar Código'}
                            </button>
                            <button className="btn btn-secondary" onClick={closeCodeModal}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Group Modal */}
            {newGroupModal.isOpen && (
                <div className="code-modal-overlay" onClick={closeNewGroupModal}>
                    <div className="code-modal glass-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-label">Crear nuevo grupo</span>
                            <h2 className="modal-course-name">Nuevo Grupo</h2>
                        </div>

                        <div className="form-group">
                            <label>Docente</label>
                            <input
                                type="text"
                                placeholder="Nombre del docente"
                                value={newGroupModal.teacher}
                                onChange={(e) => setNewGroupModal(prev => ({ ...prev, teacher: e.target.value }))}
                                autoFocus
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={handleCreateGroup}>
                                <Plus size={18} />
                                Crear Grupo
                            </button>
                            <button className="btn btn-secondary" onClick={closeNewGroupModal}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CodeTimer = ({ expiresAt, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState({ time: '', color: 'green' });
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        const updateTimer = () => {
            const now = Date.now();
            const diff = expiresAt - now;
            
            if (diff <= 0) {
                setTimeLeft({ time: '0:00', color: 'red' });
                if (!expired) {
                    setExpired(true);
                    onExpire?.();
                }
                return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            const time = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            let color = 'green';
            if (diff <= 60000) color = 'red';
            else if (diff <= 120000) color = 'yellow';
            
            setTimeLeft({ time, color });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [expiresAt, expired, onExpire]);

    return (
        <div className="code-info">
            {expired ? (
                <span className="timer-expired">Tiempo Agotado</span>
            ) : (
                <>
                    <span className="code-info-label">Tiempo restante</span>
                    <span className={`timer-value timer-${timeLeft.color}`}>{timeLeft.time}</span>
                </>
            )}
        </div>
    );
};

export default CourseDetail;
