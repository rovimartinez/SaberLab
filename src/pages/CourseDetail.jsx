import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Layers, BookOpen, Settings, Users, Plus, Trash2, FileCode, Check, Copy, Eye, EyeOff, FolderPlus, Edit2, X, Key } from 'lucide-react';
import { getLessonInfo } from '../data/coursesData.jsx';
import { supabase } from '../lib/supabase';
import './CourseDetail.css';

const CourseDetail = ({ courses, setCourses, embeddedCourse, showHeader = true }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const course = embeddedCourse || courses.find(c => c.id === parseInt(id));

    const [activeTab, setActiveTab] = useState('groups');
    const [expandedModules, setExpandedModules] = useState({});
    const [courseModules, setCourseModules] = useState([]);
    const [dbGroups, setDbGroups] = useState([]); // Grupos desde Supabase
    // Cargar grupos y estudiantes de Supabase
    useEffect(() => {
        const loadGroups = async () => {
            if (!course) return;
            setLoadingGroups(true);
            try {
                const [groupsRes, ugRes] = await Promise.all([
                    supabase.from('groups').select('*').eq('course_id', course.id),
                    supabase.from('user_groups').select('user_id, group_id')
                ]);
                
                if (groupsRes.data) {
                    const studentCounts = {};
                    if (ugRes.data) {
                        ugRes.data.forEach(ug => {
                            studentCounts[ug.group_id] = (studentCounts[ug.group_id] || 0) + 1;
                        });
                    }
                    const groupsWithCounts = groupsRes.data.map(g => ({
                        ...g,
                        studentCount: studentCounts[g.id] || 0
                    }));
                    setDbGroups(groupsWithCounts);
                }
            } catch (err) {
                console.error('Error cargando grupos:', err);
            } finally {
                setLoadingGroups(false);
            }
        };
        loadGroups();
    }, [course]);

    const [studentsModal, setStudentsModal] = useState({ isOpen: false, group: null, students: [] });
    const [studentsList, setStudentsList] = useState([]);
    const [showStudentsModal, setShowStudentsModal] = useState(false);
    const [editCourseModal, setEditCourseModal] = useState({ isOpen: false, name: '', teacher: '' });
    const [editGroupModal, setEditGroupModal] = useState({ isOpen: false, group: null, name: '', teacher: '' });
    const [codeModal, setCodeModal] = useState({ isOpen: false, group: null, code: null, codeId: null, expiresAt: null });
    const [copied, setCopied] = useState(false);
    const [newGroupModal, setNewGroupModal] = useState({ isOpen: false, name: '', teacher: '' });
    const [loadingGroups, setLoadingGroups] = useState(false);

    // Mostrar mensaje de carga si no hay curso
    if (!course) {
        return (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Cargando curso...</p>
            </div>
        );
    }

    // Combinar grupos locales con los de BD
    const allGroups = [...(course?.groups || []), ...dbGroups];
    const uniqueGroups = allGroups.filter((g, index, self) => 
        index === self.findIndex((gg) => gg.id === g.id)
    );

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

    const openStudentsModal = async (group) => {
        const { data: ugData } = await supabase
            .from('user_groups')
            .select('user_id')
            .eq('group_id', group.id);
        
        if (!ugData || ugData.length === 0) {
            setStudentsList([]);
            setShowStudentsModal(true);
            return;
        }

        const students = [];
        for (const ug of ugData) {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', ug.user_id)
                .single();
            if (data) students.push(data);
        }

        setStudentsList(students);
        setShowStudentsModal(true);
    };

    const openEditCourseModal = () => {
        setEditCourseModal({
            isOpen: true,
            name: course.name,
            teacher: course.teacher || ''
        });
    };

    const handleUpdateCourse = async () => {
        const { error } = await supabase
            .from('courses')
            .update({ 
                name: editCourseModal.name,
                teacher: editCourseModal.teacher 
            })
            .eq('id', course.id);

        if (!error) {
            updateCourse({ ...course, name: editCourseModal.name, teacher: editCourseModal.teacher });
            setEditCourseModal({ isOpen: false, name: '', teacher: '' });
        }
    };

    const openEditGroupModal = (group) => {
        setEditGroupModal({
            isOpen: true,
            group,
            name: group.name,
            teacher: group.teacher || ''
        });
    };

    const handleUpdateGroup = async () => {
        const { error } = await supabase
            .from('groups')
            .update({
                name: editGroupModal.name,
                teacher: editGroupModal.teacher
            })
            .eq('id', editGroupModal.group.id);

        if (!error) {
            setDbGroups(prev => prev.map(g => 
                g.id === editGroupModal.group.id
                    ? { ...g, name: editGroupModal.name, teacher: editGroupModal.teacher }
                    : g
            ));
            setEditGroupModal({ isOpen: false, group: null, name: '', teacher: '' });
        }
    };

    const handleDeleteGroup = async () => {
        const confirmed = window.confirm('¿Estás seguro de eliminar este grupo? Se eliminarán todos los estudiantes asignados a este grupo.');
        if (!confirmed) return;

        await supabase.from('user_groups').delete().eq('group_id', editGroupModal.group.id);
        const { error } = await supabase.from('groups').delete().eq('id', editGroupModal.group.id);

        if (!error) {
            setDbGroups(prev => prev.filter(g => g.id !== editGroupModal.group.id));
            setEditGroupModal({ isOpen: false, group: null, name: '', teacher: '' });
        }
    };

    const removeStudentFromGroup = async (studentId, groupId) => {
        const { error } = await supabase
            .from('user_groups')
            .delete()
            .eq('user_id', studentId)
            .eq('group_id', groupId);

        if (!error) {
            setStudentsModal(prev => ({
                ...prev,
                students: prev.students.filter(s => s.id !== studentId)
            }));
            setDbGroups(prev => prev.map(g => 
                g.id === groupId 
                    ? { ...g, studentCount: (g.studentCount || 1) - 1 }
                    : g
            ));
        }
    };

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
        setNewGroupModal({ isOpen: true, name: '', teacher: '' });
    };

    const closeNewGroupModal = () => {
        setNewGroupModal({ isOpen: false, name: '', teacher: '' });
    };

    const handleCreateGroup = async () => {
        if (newGroupModal.name.trim() && newGroupModal.teacher.trim()) {
            const newGroupId = getNewGroupId();
            
            // Guardar en Supabase
            const { error } = await supabase
                .from('groups')
                .insert({
                    id: newGroupId,
                    course_id: course.id,
                    name: newGroupModal.name.trim(),
                    teacher: newGroupModal.teacher.trim()
                });

            if (error) {
                console.error('Error creando grupo:', error);
                alert('Error al crear grupo');
                return;
            }

            // También guardar en estado local
            const newGroup = {
                id: newGroupId,
                name: newGroupModal.name.trim(),
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

    const removeCodeFromDatabase = async (modalState) => {
        if (!modalState?.codeId) return;

        const { error } = await supabase
            .from('group_codes')
            .delete()
            .eq('id', modalState.codeId);

        if (error) {
            console.error('Error eliminando cÃ³digo:', error);
            return;
        }

        setCodeModal((current) =>
            current.codeId === modalState.codeId
                ? { ...current, codeId: null }
                : current
        );
    };

    const openCodeModal = async (group) => {
        const code = generateCode(course.name);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutos

        // Guardar código en Supabase
        const { data, error } = await supabase
            .from('group_codes')
            .insert({
                group_id: group.id,
                code: code,
                expires_at: expiresAt
            })
            .select('id')
            .single();

        if (error) {
            console.error('Error guardando código:', error);
            alert('Error al generar código');
            return;
        }

        setCodeModal({ isOpen: true, group, code, codeId: data?.id ?? null, expiresAt });
        setCopied(false);
    };

    const closeCodeModal = async () => {
        const currentModal = codeModal;
        await removeCodeFromDatabase(currentModal);
        setCodeModal({ isOpen: false, group: null, code: null, codeId: null, expiresAt: null });
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
            {showHeader && (
            <div className="course-detail-header glass-panel" style={{ background: `linear-gradient(135deg, ${course.color}40 0%, ${course.color}10 100%)` }}>
                <button className="back-btn" onClick={() => navigate('/dashboard/courses')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="course-detail-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h1>{course.name}</h1>
                        <button className="icon-btn" onClick={openEditCourseModal} title="Editar curso">
                            <Edit2 size={18} />
                        </button>
                    </div>
                    <span className="course-detail-stats">
                        <Layers size={16} />
                        {dbGroups.length} grupos
                    </span>
                </div>
            </div>
            )}

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
                            {uniqueGroups.map((group) => (
                                <div key={group.id} className="group-card" style={{ padding: '1rem', gap: '0.75rem', textAlign: 'center' }}>
                                    <div className="group-card-info" style={{ alignItems: 'center' }}>
                                        <span 
                                            className="group-card-name" 
                                            onDoubleClick={() => openEditGroupModal(group)}
                                            title="Doble clic para editar"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {group.name}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.25rem' }}>
                                            ({group.studentCount || 0})
                                        </span>
                                    </div>
                                    <div className="group-card-actions" style={{ justifyContent: 'center', gap: '0.5rem' }}>
                                        <button className="btn btn-small" style={{ padding: '0.5rem 0.75rem' }} onClick={() => openStudentsModal(group)}>
                                            <Users size={14} />
                                        </button>
                                        <button className="btn btn-small" style={{ padding: '0.5rem 0.75rem' }} onClick={() => openCodeModal(group)}>
                                            <Key size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {uniqueGroups.length === 0 && (
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
                            {courseModules.map((module, idx) => (
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
                                                    <span className="lesson-name">{getLessonInfo(lesson.id).title}</span>
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
                                    <span className="setting-value">0</span>
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
                <div className="code-modal-overlay" onClick={() => void closeCodeModal()}>
                    <div className="code-modal glass-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-label">Código para unirse al grupo:</span>
                            <h2 className="modal-course-name">{codeModal.group?.name}</h2>
                        </div>

                        <div className="code-display">
                            <span className="code-text">{codeModal.code}</span>
                        </div>

                        <CodeTimer expiresAt={codeModal.expiresAt} onExpire={() => {
                            void removeCodeFromDatabase(codeModal);
                            setTimeout(() => {
                                void closeCodeModal();
                            }, 3000);
                        }} />

                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={copyCode}>
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                {copied ? '¡Copiado!' : 'Copiar Código'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => void closeCodeModal()}>
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
                            <label>Nombre del Grupo</label>
                            <input
                                type="text"
                                placeholder="Ej: 2026-I Grupo A"
                                value={newGroupModal.name}
                                onChange={(e) => setNewGroupModal(prev => ({ ...prev, name: e.target.value }))}
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label>Docente Encargado</label>
                            <input
                                type="text"
                                placeholder="Nombre del docente"
                                value={newGroupModal.teacher}
                                onChange={(e) => setNewGroupModal(prev => ({ ...prev, teacher: e.target.value }))}
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={handleCreateGroup} disabled={!newGroupModal.name.trim() || !newGroupModal.teacher.trim()}>
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

            {/* Students Modal */}
            {showStudentsModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999
                }} onClick={() => setShowStudentsModal(false)}>
                    <div style={{
                        background: '#1e293b', padding: '1.5rem', borderRadius: '12px',
                        maxWidth: '400px', width: '90%', maxHeight: '80vh', overflow: 'auto',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ color: 'white', margin: 0 }}>Estudiantes del Grupo</h3>
                            <button onClick={() => setShowStudentsModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}>
                                <X size={20} />
                            </button>
                        </div>
                        {studentsList.length === 0 ? (
                            <p style={{ color: '#94a3b8' }}>No hay estudiantes</p>
                        ) : (
                            studentsList.map(s => (
                                <div key={s.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.5rem', borderBottom: '1px solid #334155'
                                }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%', background: '#3b82f6',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: 'bold', fontSize: '0.875rem'
                                    }}>
                                        {(s.full_name || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ color: 'white' }}>{s.full_name || 'Sin nombre'}</span>
                                </div>
                            ))
                        )}
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
            // Convertir expiresAt a número si es string
            const expiresTime = new Date(expiresAt).getTime();
            const diff = expiresTime - now;
            
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
