import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Layers, BookOpen, Settings, Users, Plus, Trash2, FileCode, Check, Copy, Eye, EyeOff, FolderPlus, Edit2, X, Key, Database } from 'lucide-react';
import { getLessonInfo } from '../data/coursesData.jsx';
import { api } from '../lib/api';
import '../styles/CourseDetail.css';

const CourseDetail = ({ courses, setCourses, embeddedCourse, showHeader = true }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const course = embeddedCourse || courses.find(c => c.id === parseInt(id));

    const [activeTab, setActiveTab] = useState('groups');
    const [expandedModules, setExpandedModules] = useState({});
    const [courseModules, setCourseModules] = useState([]);
    const [dbGroups, setDbGroups] = useState([]); // Grupos desde BD
    const [groupsReload, setGroupsReload] = useState(0);
    const [dbToast, setDbToast] = useState(null); // { type, title, message, dbId }

    const showDbToast = (type, title, message, dbId = null) => {
        setDbToast({ type, title, message, dbId });
        setTimeout(() => setDbToast(null), 4500);
    };
    // Cargar grupos y estudiantes
    useEffect(() => {
        const loadGroups = async () => {
            if (!course) return;
            setLoadingGroups(true);
            try {
                const { data: groups } = await api(`/groups?course_id=${course.id}`);
                if (groups) {
                    const groupsWithCounts = groups.map(g => ({
                        ...g,
                        studentCount: g.studentCount || 0
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
    }, [course, groupsReload]);

    const [studentsModal, setStudentsModal] = useState({ isOpen: false, group: null, students: [] });
    const [studentsList, setStudentsList] = useState([]);
    const [showStudentsModal, setShowStudentsModal] = useState(false);
    const [selectedGroupForStudents, setSelectedGroupForStudents] = useState(null);
    const [deletingStudentId, setDeletingStudentId] = useState(null);
    const [editCourseModal, setEditCourseModal] = useState({ isOpen: false, name: '', teacher: '' });
    const [editGroupModal, setEditGroupModal] = useState({ isOpen: false, group: null, name: '', teacher: '' });
    const [codeModal, setCodeModal] = useState({ isOpen: false, group: null, code: null, codeId: null, expiresAt: null });
    const [copied, setCopied] = useState(false);
    const [newGroupModal, setNewGroupModal] = useState({ isOpen: false, name: '', teacher: '' });
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [savingGroup, setSavingGroup] = useState(false);
    const [groupSaveStatus, setGroupSaveStatus] = useState('');
    const [lessonVisibility, setLessonVisibility] = useState({}); // { lessonId: true/false }

    // Cargar visibilidad de lecciones
    useEffect(() => {
        const loadLessonVisibility = async () => {
            if (!course) return;
            try {
                const { data } = await api('/visibility');
                setLessonVisibility((data && data[course.id]) || {});
            } catch (err) {
                console.error('Error cargando visibilidad:', err);
                setLessonVisibility({});
            }
        };
        loadLessonVisibility();
    }, [course]);

    // Helper para obtener visibilidad de una lección
    const getLessonVisibility = (lessonId) => {
        // Normalizar ID igual que al guardar
        const abbr = course?.abbr?.toLowerCase() || 're';
        const normalizedId = lessonId.includes('-') ? lessonId : `${abbr}-m1-${lessonId}`;
        
        if (lessonVisibility.hasOwnProperty(normalizedId)) {
            return lessonVisibility[normalizedId];
        }
        return true; // Por defecto todas visibles
    };

    // Mostrar mensaje de carga si no hay curso
    if (!course) {
        return (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Cargando curso...</p>
            </div>
        );
    }

    // Mostrar solo grupos cargados desde la BD
    const uniqueGroups = dbGroups;

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
        setSelectedGroupForStudents(group);
        const groupId = String(group.id);
        
        try {
            const { data } = await api(`/groups?group_id=${encodeURIComponent(groupId)}`);
            setStudentsList(data || []);
        } catch (err) {
            console.error('Error al cargar estudiantes del grupo:', err);
            setStudentsList([]);
        }
        setShowStudentsModal(true);
    };

    const handleRemoveStudentFromGroup = async (student) => {
        if (!selectedGroupForStudents?.id) return;
        const studentName = student.full_name || student.email || 'este estudiante';
        if (!window.confirm(`¿Deseas eliminar a "${studentName}" de este grupo y del curso?`)) {
            return;
        }

        setDeletingStudentId(student.id);
        try {
            const { error } = await api('/groups', {
                method: 'PATCH',
                body: {
                    group_id: selectedGroupForStudents.id,
                    user_id: student.id,
                    course_id: course?.id
                }
            });

            if (error) {
                alert(error.message || 'Error al desvincular estudiante');
                return;
            }

            // Actualizar lista local del modal
            setStudentsList(prev => prev.filter(s => s.id !== student.id));

            // Actualizar contador del grupo en pantalla
            setDbGroups(prev => prev.map(g => {
                if (g.id === selectedGroupForStudents.id) {
                    return { ...g, studentCount: Math.max(0, (g.studentCount || 1) - 1) };
                }
                return g;
            }));

            showDbToast('success', 'Estudiante Desvinculado', `"${studentName}" fue retirado del grupo con éxito.`);
        } catch (err) {
            console.error('Error desvinculando estudiante:', err);
            alert('No fue posible retirar al estudiante');
        } finally {
            setDeletingStudentId(null);
        }
    };

    const openEditCourseModal = () => {
        setEditCourseModal({
            isOpen: true,
            name: course.name,
            teacher: course.teacher || ''
        });
    };

    const handleUpdateCourse = async () => {
        const { error } = await api('/admin/courses', {
            method: 'POST',
            body: { id: course.id, name: editCourseModal.name }
        });

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
        if (!editGroupModal.name.trim() || !editGroupModal.group?.id) return;

        const { data, error } = await api('/groups', {
            method: 'POST',
            body: { id: editGroupModal.group.id, name: editGroupModal.name.trim(), teacher: editGroupModal.teacher?.trim() || null }
        });

        if (error) {
            console.error('Error al actualizar grupo en BD:', error);
            showDbToast('error', 'Error en BD', error.message || 'No autorizado');
            return;
        }

        const updated = data || { id: editGroupModal.group.id, name: editGroupModal.name, teacher: editGroupModal.teacher };
        setDbGroups(prev => prev.map(g => g.id === editGroupModal.group.id ? { ...g, ...updated } : g));
        setGroupsReload(x => x + 1);
        showDbToast('success', 'Grupo Actualizado en BD', `El grupo "${editGroupModal.name}" fue actualizado correctamente en la BD.`, editGroupModal.group.id);
        setEditGroupModal({ isOpen: false, group: null, name: '', teacher: '' });
    };

    const handleDeleteGroup = async (group) => {
        if (!group?.id) return;

        const confirmed = window.confirm(`¿Estás seguro de eliminar el grupo "${group.name}" (#DB-${group.id}) de la base de datos?`);
        if (!confirmed) return;

        const { error } = await api(`/groups?id=${group.id}`, { method: 'DELETE' });
        if (error) {
            console.error('Error al eliminar grupo en BD:', error);
            showDbToast('error', 'Error al eliminar en BD', error.message || 'No autorizado');
            return;
        }

        setDbGroups(prev => prev.filter(g => g.id !== group.id));
        setGroupsReload(x => x + 1);
        showDbToast('success', 'Grupo Eliminado de BD', `El grupo "${group.name}" (#DB-${group.id}) fue borrado permanentemente de la base de datos.`);
        if (editGroupModal.group?.id === group.id) {
            setEditGroupModal({ isOpen: false, group: null, name: '', teacher: '' });
        }
    };

    const removeStudentFromGroup = async (studentId, groupId) => {
        const { error } = await api('/groups', {
            method: 'PATCH',
            body: { group_id: groupId, user_id: studentId }
        });

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
        setGroupSaveStatus('');
        setNewGroupModal({ isOpen: true, name: '', teacher: '' });
    };

    const closeNewGroupModal = () => {
        setGroupSaveStatus('');
        setNewGroupModal({ isOpen: false, name: '', teacher: '' });
    };

    const handleCreateGroup = async () => {
        if (!newGroupModal.name.trim()) {
            alert('El nombre del grupo es obligatorio');
            return;
        }
        setSavingGroup(true);
        try {
            const { data, error } = await api('/groups', {
                method: 'POST',
                body: {
                    course_id: course.id,
                    name: newGroupModal.name.trim(),
                    teacher: newGroupModal.teacher.trim() || null
                }
            });

            if (error) {
                console.error('Error creando grupo en BD:', error);
                showDbToast('error', 'Error al guardar en BD', error.message || 'Error desconocido');
                return;
            }

            if (data && data.id) {
                setDbGroups(prev => [...prev, data]);
                setGroupsReload(x => x + 1);
                showDbToast('success', 'Grupo Creado en BD', `El grupo "${data.name}" fue creado y guardado en la BD con ID #${data.id}`, data.id);
            }
            closeNewGroupModal();
        } catch (err) {
            console.error('Error creando grupo en BD:', err);
            showDbToast('error', 'Error de conexión', 'No se pudo comunicar con la base de datos');
        } finally {
            setSavingGroup(false);
        }
    };

    const deleteGroup = (groupId) => {
        setDbGroups(prev => prev.filter(g => g.id !== groupId));
    };

    const removeCodeFromDatabase = async (modalState) => {
        if (!modalState?.codeId) return;

        await api(`/codes?id=${modalState.codeId}`, { method: 'DELETE' });

        setCodeModal((current) =>
            current.codeId === modalState.codeId
                ? { ...current, codeId: null }
                : current
        );
    };

    const openCodeModal = async (group) => {
        const code = generateCode(course.name);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutos

        const { data, error } = await api('/codes', {
            method: 'POST',
            body: { group_id: group.id, code, expires_at: expiresAt }
        });

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

    const toggleLessonVisibility = async (moduleId, lessonId) => {
        const newVisibility = !getLessonVisibility(lessonId);
        
        // Normalizar ID: 'l1' -> 're-m1-l1'
        const abbr = course.abbr?.toLowerCase() || 're';
        const normalizedId = lessonId.includes('-') ? lessonId : `${abbr}-${moduleId}-${lessonId}`;
        
        console.log('Toggle:', { courseId: course.id, lessonId, normalizedId, newVisibility });
        
        // Guardar visibilidad en BD
        const newLecciones = { ...lessonVisibility, [normalizedId]: newVisibility };
        
        try {
            await api('/visibility', {
                method: 'POST',
                body: { course_id: course.id, lecciones: newLecciones }
            });
        } catch (err) {
            console.error('Error guardando visibilidad:', err);
        }

        // Actualizar estado local
        const updatedModules = courseModules.map(m => 
            m.id === moduleId ? {
                ...m,
                lessons: m.lessons.map(l => 
                    l.id === lessonId ? { ...l, visible: newVisibility } : l
                )
            } : m
        );
        setCourseModules(updatedModules);
        setLessonVisibility(newLecciones);
        updateCourse({
            ...course,
            modules: updatedModules
        });
    };

    const isExamLesson = (lessonId) => {
        return lessonId === 'ee-m1-l6' || lessonId === 'ee-m2-l10' || lessonId === 'ee-m3-l14' || lessonId === 'ee-m4-l16' || lessonId.endsWith('-eval');
    };

    const toggleModuleVisibility = async (moduleId) => {
        const module = courseModules.find(m => m.id === moduleId);
        const regularLessons = module?.lessons.filter(l => !isExamLesson(l.id)) || [];
        const hasExam = !!module?.evaluation;
        const examId = module?.evaluation ? (module.evaluation.id || `${course.abbr?.toLowerCase() || 're'}-${module.id}-eval`) : null;

        const allRegularVisible = regularLessons.every(l => getLessonVisibility(l.id));
        const examVisible = hasExam ? getLessonVisibility(examId) : true;
        const allVisible = allRegularVisible && examVisible;
        const newVisibility = !allVisible;
        
        // Normalizar IDs
        const abbr = course.abbr?.toLowerCase() || 're';
        const normalizedModuleId = moduleId.includes('-') ? moduleId : `${abbr}-${moduleId}`;
        
        // Actualizar JSON con todas las lecciones del módulo
        const newLecciones = { ...lessonVisibility };
        module.lessons.forEach(l => {
            const normalizedId = l.id.includes('-') ? l.id : `${normalizedModuleId.split('-').slice(0,2).join('-')}-${l.id}`;
            newLecciones[normalizedId] = newVisibility;
        });

        if (examId) {
            newLecciones[examId] = newVisibility;
        }
        
        try {
            await api('/visibility', {
                method: 'POST',
                body: { course_id: course.id, lecciones: newLecciones }
            });
        } catch (err) {
            console.error('Error guardando visibilidad:', err);
        }

        // Actualizar estado local
        const updatedModules = courseModules.map(m => 
            m.id === moduleId ? {
                ...m,
                lessons: m.lessons.map(l => ({ ...l, visible: newVisibility }))
            } : m
        );
        setCourseModules(updatedModules);
        setLessonVisibility(newLecciones);
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
                                <div key={group.id} className="group-card" style={{ padding: '1.1rem 1rem', gap: '0.75rem', textAlign: 'center', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '8px', right: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ fontSize: '0.65rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                            #DB-{group.id}
                                        </span>
                                    </div>
                                    <div className="group-card-info" style={{ alignItems: 'center', marginTop: '6px' }}>
                                        <span 
                                            className="group-card-name" 
                                            onDoubleClick={() => openEditGroupModal(group)}
                                            title="Doble clic para editar"
                                            style={{ cursor: 'pointer', fontSize: '1rem', fontWeight: 800 }}
                                        >
                                            {group.name}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                                            ({group.studentCount || 0} estudiantes)
                                        </span>
                                        {group.teacher && (
                                            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                                                {group.teacher.startsWith('Prof.') ? group.teacher : `Prof. ${group.teacher}`}
                                            </span>
                                        )}
                                    </div>
                                    <div className="group-card-actions" style={{ justifyContent: 'center', gap: '0.5rem', marginTop: '4px' }}>
                                        <button className="btn btn-small" style={{ padding: '0.5rem 0.75rem' }} onClick={() => openStudentsModal(group)} title="Ver Estudiantes">
                                            <Users size={14} />
                                        </button>
                                        <button className="btn btn-small" style={{ padding: '0.5rem 0.75rem' }} onClick={() => openCodeModal(group)} title="Generar Código">
                                            <Key size={14} />
                                        </button>
                                        <button className="btn btn-small" style={{ padding: '0.5rem 0.75rem' }} onClick={() => openEditGroupModal(group)} title="Editar Nombre del Grupo">
                                            <Edit2 size={14} />
                                        </button>
                                        <button className="btn btn-small btn-danger" style={{ padding: '0.5rem 0.75rem' }} onClick={() => handleDeleteGroup(group)} title="Eliminar Grupo de BD">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {uniqueGroups.length === 0 && (
                                <div className="empty-state">
                                    <p>No hay grupos creados en la base de datos</p>
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
                            {courseModules.map((module, idx) => {
                                const regularLessons = module.lessons.filter(l => !isExamLesson(l.id));
                                const hasExam = !!module.evaluation;
                                const examId = module.evaluation ? (module.evaluation.id || `${course.abbr?.toLowerCase() || 're'}-${module.id}-eval`) : null;
                                const isExamVisible = hasExam ? getLessonVisibility(examId) : true;
                                
                                const totalItems = regularLessons.length + (hasExam ? 1 : 0);
                                const visibleItems = regularLessons.filter(l => getLessonVisibility(l.id)).length + (hasExam && isExamVisible ? 1 : 0);
                                const allVisible = visibleItems === totalItems;
                                const someVisible = visibleItems > 0;

                                return (
                                <div key={module.id} className="module-card">
                                    <div className="module-card-header" onClick={() => toggleExpandModule(module.id)}>
                                        <div className="module-card-info">
                                            <span className="module-card-number">{idx + 1}</span>
                                            <span className="module-card-name">{module.name}</span>
                                        </div>
                                        <div className="module-card-actions">
                                            <button 
                                                className={`visibility-btn ${allVisible ? 'all' : someVisible ? 'partial' : 'none'}`}
                                                onClick={(e) => { e.stopPropagation(); toggleModuleVisibility(module.id); }}
                                                title={allVisible ? 'Ocultar todo el módulo' : 'Hacer visible todo el módulo'}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <span className={`module-visibility-count ${allVisible ? 'all' : someVisible ? 'partial' : 'none'}`}>
                                                {visibleItems}/{totalItems}
                                            </span>
                                            <span className={`expand-arrow ${expandedModules[module.id] ? 'expanded' : ''}`}>▼</span>
                                        </div>
                                    </div>
                                    {expandedModules[module.id] && (
                                        <div className="module-card-lessons">
                                            {regularLessons.map((lesson) => {
                                                const isVisible = getLessonVisibility(lesson.id);
                                                return (
                                                <div key={lesson.id} className={`lesson-item ${isVisible ? 'visible' : 'hidden'}`}>
                                                    <span className="lesson-name">{getLessonInfo(lesson.id).title}</span>
                                                    <button 
                                                        className={`visibility-btn ${isVisible ? 'is-visible' : ''}`}
                                                        onClick={() => toggleLessonVisibility(module.id, lesson.id)}
                                                    >
                                                        {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                                                        <span>{isVisible ? 'Visible' : 'Oculto'}</span>
                                                    </button>
                                                </div>
                                            )})}

                                            {/* Examen / Evaluación del Módulo bloqueable */}
                                            {hasExam && (
                                                <div 
                                                    className={`lesson-item exam-item ${isExamVisible ? 'visible' : 'hidden'}`}
                                                    style={{
                                                        marginTop: '0.65rem',
                                                        padding: '0.85rem 1rem',
                                                        background: isExamVisible ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.06)',
                                                        border: `1px dashed ${isExamVisible ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.3)'}`,
                                                        borderRadius: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: '0.75rem'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                                        <span style={{
                                                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                            color: '#fff',
                                                            fontWeight: 900,
                                                            fontSize: '0.68rem',
                                                            padding: '3px 8px',
                                                            borderRadius: '6px',
                                                            letterSpacing: '0.5px',
                                                            flexShrink: 0
                                                        }}>
                                                            EXAMEN
                                                        </span>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {module.evaluation.title}
                                                            </div>
                                                            <div style={{ fontSize: '0.73rem', color: '#fbbf24', marginTop: '1px' }}>
                                                                {module.evaluation.points} pts {module.evaluation.date ? `· ${module.evaluation.date}` : ''}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button 
                                                        className={`visibility-btn ${isExamVisible ? 'is-visible' : ''}`}
                                                        onClick={() => toggleLessonVisibility(module.id, examId)}
                                                        style={{
                                                            background: isExamVisible ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.15)',
                                                            color: isExamVisible ? '#fbbf24' : '#f87171',
                                                            border: `1px solid ${isExamVisible ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.3)'}`,
                                                            padding: '0.45rem 0.85rem',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 700,
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        {isExamVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                                                        <span>{isExamVisible ? 'Visible' : 'Bloqueado'}</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )})}
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
                            <label>Docente Encargado <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(opcional)</span></label>
                            <input
                                type="text"
                                placeholder="Nombre del docente"
                                value={newGroupModal.teacher}
                                onChange={(e) => setNewGroupModal(prev => ({ ...prev, teacher: e.target.value }))}
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={handleCreateGroup} disabled={!newGroupModal.name.trim() || savingGroup}>
                                <Plus size={18} />
                                {savingGroup ? 'Guardando en la BD...' : 'Crear Grupo'}
                            </button>
                            <button className="btn btn-secondary" onClick={closeNewGroupModal} disabled={savingGroup}>
                                Cancelar
                            </button>
                        </div>
                        {groupSaveStatus && (
                            <div style={{ marginTop: '0.75rem', color: savingGroup ? '#f59e0b' : '#34d399' }}>
                                {groupSaveStatus}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Group Modal */}
            {editGroupModal.isOpen && (
                <div className="code-modal-overlay" onClick={() => setEditGroupModal({ isOpen: false, group: null, name: '', teacher: '' })}>
                    <div className="code-modal glass-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-label">Editar información del grupo</span>
                            <h2 className="modal-course-name">#DB-{editGroupModal.group?.id} {editGroupModal.group?.name}</h2>
                        </div>

                        <div className="form-group">
                            <label>Nombre del Grupo</label>
                            <input
                                type="text"
                                placeholder="Nombre del grupo"
                                value={editGroupModal.name}
                                onChange={(e) => setEditGroupModal(prev => ({ ...prev, name: e.target.value }))}
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label>Docente Encargado <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(opcional)</span></label>
                            <input
                                type="text"
                                placeholder="Nombre del docente"
                                value={editGroupModal.teacher}
                                onChange={(e) => setEditGroupModal(prev => ({ ...prev, teacher: e.target.value }))}
                            />
                        </div>

                        <div className="modal-actions">
                            <button 
                                className="btn btn-primary" 
                                onClick={handleUpdateGroup} 
                                disabled={!editGroupModal.name.trim()}
                            >
                                <Check size={18} />
                                Guardar Cambios
                            </button>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => setEditGroupModal({ isOpen: false, group: null, name: '', teacher: '' })}
                            >
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
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999
                }} onClick={() => setShowStudentsModal(false)}>
                    <div style={{
                        background: '#1e293b', padding: '1.5rem', borderRadius: '16px',
                        maxWidth: '460px', width: '92%', maxHeight: '82vh', overflow: 'hidden',
                        display: 'flex', flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            <div>
                                <h3 style={{ color: 'white', margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Estudiantes del Grupo</h3>
                                {selectedGroupForStudents && (
                                    <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                                        {selectedGroupForStudents.name} ({studentsList.length} alumno{studentsList.length !== 1 ? 's' : ''})
                                    </span>
                                )}
                            </div>
                            <button onClick={() => setShowStudentsModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.35rem', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
                            {studentsList.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
                                    <Users size={36} style={{ opacity: 0.35, margin: '0 auto 0.5rem', display: 'block' }} />
                                    <p style={{ margin: 0, fontSize: '0.92rem' }}>No hay estudiantes inscritos en este grupo</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {studentsList.map(s => (
                                        <div key={s.id} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '0.65rem 0.85rem',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255, 255, 255, 0.06)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                                {s.avatar_url ? (
                                                    <img 
                                                        src={s.avatar_url} 
                                                        alt={s.full_name || 'Avatar'}
                                                        referrerPolicy="no-referrer"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            if (e.currentTarget.nextSibling) {
                                                                e.currentTarget.nextSibling.style.display = 'flex';
                                                            }
                                                        }}
                                                        style={{
                                                            width: 36, height: 36, borderRadius: '50%',
                                                            objectFit: 'cover', background: '#334155', flexShrink: 0
                                                        }}
                                                    />
                                                ) : null}
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                                                    display: s.avatar_url ? 'none' : 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0
                                                }}>
                                                    {(s.full_name || s.email || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {s.full_name || 'Sin nombre'}
                                                    </div>
                                                    {s.email && (
                                                        <div style={{ color: '#64748b', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {s.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleRemoveStudentFromGroup(s)}
                                                disabled={deletingStudentId === s.id}
                                                title={`Eliminar a ${s.full_name || 'estudiante'} del grupo`}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.12)',
                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                    color: '#f87171',
                                                    padding: '6px 10px',
                                                    borderRadius: '8px',
                                                    cursor: deletingStudentId === s.id ? 'not-allowed' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 600,
                                                    flexShrink: 0,
                                                    transition: 'all 0.15s ease'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'}
                                            >
                                                <Trash2 size={13} />
                                                <span>{deletingStudentId === s.id ? 'Borrando...' : 'Eliminar'}</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Floating DB Toast Notification */}
            {dbToast && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    zIndex: 99999,
                    background: dbToast.type === 'success' ? '#0f172a' : '#450a0a',
                    border: `1.5px solid ${dbToast.type === 'success' ? '#10b981' : '#ef4444'}`,
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
                    borderRadius: '14px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    maxWidth: '420px',
                    color: 'white'
                }}>
                    <div style={{
                        background: dbToast.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        borderRadius: '50%',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: dbToast.type === 'success' ? '#34d399' : '#f87171',
                        flexShrink: 0
                    }}>
                        <Database size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            color: dbToast.type === 'success' ? '#34d399' : '#f87171',
                            fontWeight: 800,
                            fontSize: '0.92rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <span>{dbToast.title}</span>
                            {dbToast.dbId && (
                                <span style={{ fontSize: '0.7rem', background: '#0284c7', color: 'white', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                    #DB-{dbToast.dbId}
                                </span>
                            )}
                        </div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: '2px', lineHeight: 1.4 }}>
                            {dbToast.message}
                        </div>
                    </div>
                    <button
                        onClick={() => setDbToast(null)}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                    >
                        <X size={16} />
                    </button>
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
