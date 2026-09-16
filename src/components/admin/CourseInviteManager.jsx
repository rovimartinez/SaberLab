import React, { useState, useEffect, useCallback } from 'react';
import { 
    Users, Link2, Plus, Clock, Copy, Check, Share2, CalendarPlus, 
    Trash2, Edit2, AlertCircle, Sparkles, Filter, CheckCircle2, XCircle, Search, Layers, UserCheck
} from 'lucide-react';
import { api } from '../../lib/api';
import { COURSES_DEFINITION, getCourseColor } from '../../data/coursesData.jsx';

export default function CourseInviteManager({ courseId = null }) {
    // ── ESTADOS PRINCIPALES ──
    const [activeTab, setActiveTab] = useState('groups'); // 'groups' | 'links'
    const [groups, setGroups] = useState([]);
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourseFilter, setSelectedCourseFilter] = useState(courseId ? String(courseId) : 'all');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedCode, setCopiedCode] = useState(null);

    // ── MODALES DE GRUPOS ──
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupForm, setGroupForm] = useState({ id: null, name: '', teacher: 'Prof. Ronny Martinez', course_id: 1, is_active: 1 });
    const [savingGroup, setSavingGroup] = useState(false);

    // ── MODAL DE ESTUDIANTES ──
    const [showStudentsModal, setShowStudentsModal] = useState(false);
    const [selectedGroupStudents, setSelectedGroupStudents] = useState(null);
    const [studentsList, setStudentsList] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [deletingStudentId, setDeletingStudentId] = useState(null);

    // ── MODALES DE ENLACES TEMPORALES ──
    const [showCreateLinkModal, setShowCreateLinkModal] = useState(false);
    const [linkForm, setLinkForm] = useState({ course_id: 1, group_id: '', durationHours: 24 });
    const [creatingLink, setCreatingLink] = useState(false);

    // ── MODAL EXTENDER TIEMPO ──
    const [extendTarget, setExtendTarget] = useState(null);
    const [addHours, setAddHours] = useState(24);
    const [updatingTime, setUpdatingTime] = useState(false);

    // ── CARGA DE DATOS ──
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [groupsRes, codesRes] = await Promise.all([
                api('/groups'),
                api('/codes')
            ]);

            if (groupsRes?.data && Array.isArray(groupsRes.data)) {
                setGroups(groupsRes.data);
            }
            if (codesRes?.data && Array.isArray(codesRes.data)) {
                setCodes(codesRes.data);
            }
        } catch (err) {
            console.error('Error cargando grupos y códigos:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ── CRUD GRUPOS ──
    const openCreateGroupModal = (presetCourseId = null) => {
        setGroupForm({
            id: null,
            name: '',
            teacher: 'Prof. Ronny Martinez',
            course_id: presetCourseId ? Number(presetCourseId) : (selectedCourseFilter !== 'all' ? Number(selectedCourseFilter) : 1),
            is_active: 1
        });
        setShowGroupModal(true);
    };

    const openEditGroupModal = (group) => {
        setGroupForm({
            id: group.id,
            name: group.name,
            teacher: group.teacher || 'Prof. Ronny Martinez',
            course_id: group.course_id,
            is_active: group.is_active !== undefined ? (group.is_active ? 1 : 0) : 1
        });
        setShowGroupModal(true);
    };

    const handleSaveGroup = async (e) => {
        e.preventDefault();
        if (!groupForm.name.trim()) return;

        setSavingGroup(true);
        try {
            const { data, error } = await api('/groups', {
                method: 'POST',
                body: {
                    id: groupForm.id || undefined,
                    name: groupForm.name.trim(),
                    teacher: groupForm.teacher.trim(),
                    course_id: Number(groupForm.course_id),
                    is_active: Number(groupForm.is_active)
                }
            });

            if (error) throw new Error(error.message || 'Error al guardar grupo');

            await loadData();
            setShowGroupModal(false);
        } catch (err) {
            alert(err.message || 'Error al guardar el grupo');
        } finally {
            setSavingGroup(false);
        }
    };

    const handleToggleGroupActive = async (group) => {
        const newActiveState = group.is_active ? 0 : 1;
        // Optimistic update
        setGroups(prev => prev.map(g => g.id === group.id ? { ...g, is_active: newActiveState } : g));

        try {
            await api('/groups', {
                method: 'POST',
                body: {
                    id: group.id,
                    name: group.name,
                    teacher: group.teacher,
                    is_active: newActiveState
                }
            });
        } catch (err) {
            console.error('Error al alternar estado del grupo:', err);
            await loadData();
        }
    };

    const handleDeleteGroup = async (group) => {
        const confirmMsg = `¿Estás seguro de eliminar el grupo "${group.name}" (#DB-${group.id})?\nSe eliminarán las vinculaciones asociadas en la base de datos.`;
        if (!window.confirm(confirmMsg)) return;

        try {
            const { error } = await api(`/groups?id=${group.id}`, { method: 'DELETE' });
            if (error) throw new Error(error.message || 'Error al eliminar grupo');
            setGroups(prev => prev.filter(g => g.id !== group.id));
        } catch (err) {
            alert(err.message || 'No se pudo eliminar el grupo');
        }
    };

    // ── VER ESTUDIANTES DEL GRUPO ──
    const openStudentsView = async (group) => {
        setSelectedGroupStudents(group);
        setShowStudentsModal(true);
        setLoadingStudents(true);
        try {
            const { data } = await api(`/groups?group_id=${group.id}`);
            setStudentsList(data || []);
        } catch (err) {
            console.error('Error al cargar alumnos:', err);
            setStudentsList([]);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleRemoveStudent = async (student) => {
        if (!selectedGroupStudents) return;
        const studentName = student.full_name || student.email || 'este estudiante';
        if (!window.confirm(`¿Deseas desvincular a "${studentName}" del grupo ${selectedGroupStudents.name}?`)) return;

        setDeletingStudentId(student.id);
        try {
            const { error } = await api('/groups', {
                method: 'PATCH',
                body: {
                    group_id: selectedGroupStudents.id,
                    user_id: student.id,
                    course_id: selectedGroupStudents.course_id
                }
            });

            if (error) throw new Error(error.message || 'Error al desvincular estudiante');

            setStudentsList(prev => prev.filter(s => s.id !== student.id));
            setGroups(prev => prev.map(g => g.id === selectedGroupStudents.id ? { ...g, studentCount: Math.max(0, (g.studentCount || 1) - 1) } : g));
        } catch (err) {
            alert(err.message || 'Error al desvincular estudiante');
        } finally {
            setDeletingStudentId(null);
        }
    };

    // ── ENLACES TEMPORALES (CREAR / EXTENDER / COPIAR) ──
    const openCreateLinkForGroup = (group) => {
        setLinkForm({
            course_id: group.course_id,
            group_id: group.id,
            durationHours: 24
        });
        setShowCreateLinkModal(true);
    };

    const handleCreateLinkSubmit = async (e) => {
        e.preventDefault();
        setCreatingLink(true);

        try {
            const courseObj = COURSES_DEFINITION.find(c => c.id === Number(linkForm.course_id)) || COURSES_DEFINITION[0];
            const prefix = courseObj.abbr || 'SL';
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            const generatedCode = `${prefix}-${randomNum}`;

            let expiresAt = null;
            if (linkForm.durationHours > 0) {
                const date = new Date();
                date.setHours(date.getHours() + Number(linkForm.durationHours));
                expiresAt = date.toISOString();
            }

            const { data, error } = await api('/codes', {
                method: 'POST',
                body: {
                    group_id: Number(linkForm.group_id),
                    course_id: Number(linkForm.course_id),
                    code: generatedCode,
                    expires_at: expiresAt
                }
            });

            if (error) throw new Error(error.message || 'Error al generar enlace');

            await loadData();
            setShowCreateLinkModal(false);
            setActiveTab('links'); // Cambiar a pestaña de enlaces para ver el nuevo código
        } catch (err) {
            alert(err.message || 'Error al generar enlace temporal');
        } finally {
            setCreatingLink(false);
        }
    };

    const handleExtendTime = async () => {
        if (!extendTarget) return;
        setUpdatingTime(true);

        try {
            let baseDate = new Date();
            if (extendTarget.expires_at) {
                const currentExpires = new Date(extendTarget.expires_at);
                if (currentExpires > baseDate) {
                    baseDate = currentExpires;
                }
            }

            let newExpiresAt = null;
            if (addHours > 0) {
                baseDate.setHours(baseDate.getHours() + Number(addHours));
                newExpiresAt = baseDate.toISOString();
            }

            const { error } = await api('/codes', {
                method: 'PUT',
                body: {
                    id: extendTarget.id,
                    expires_at: newExpiresAt
                }
            });

            if (error) throw new Error(error.message || 'Error al extender tiempo');

            setExtendTarget(null);
            await loadData();
        } catch (err) {
            alert(err.message || 'Error al extender vigencia');
        } finally {
            setUpdatingTime(false);
        }
    };

    const handleDeleteCode = async (id) => {
        if (!confirm('¿Deseas revocar este enlace de invitación?')) return;
        try {
            await api(`/codes?id=${id}`, { method: 'DELETE' });
            setCodes(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Error al borrar código:', err);
        }
    };

    const getFullJoinUrl = (code) => `https://saberlab.pages.dev/join?code=${code}`;

    const handleCopy = (code) => {
        const url = getFullJoinUrl(code);
        navigator.clipboard.writeText(url);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2500);
    };

    const handleShareWhatsApp = (code, courseName, groupName) => {
        const url = getFullJoinUrl(code);
        const text = `¡Hola! Únete al grupo *${groupName || 'del curso'}* en *${courseName}* (SaberLab) con este enlace directo:\n${url}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    const getCodeStatus = (expiresAt) => {
        if (!expiresAt) return { label: 'Permanente', color: '#10b981', active: true };
        const now = new Date();
        const exp = new Date(expiresAt);
        if (exp < now) return { label: 'Expirado', color: '#ef4444', active: false };

        const diffMinutes = Math.round((exp - now) / 60000);
        if (diffMinutes < 60) return { label: `Vence en ${diffMinutes} min`, color: '#f59e0b', active: true };
        const diffHours = Math.round(diffMinutes / 60);
        if (diffHours < 24) return { label: `Vence en ${diffHours} h`, color: '#38bdf8', active: true };
        const diffDays = Math.round(diffHours / 24);
        return { label: `Vence en ${diffDays} d`, color: '#34d399', active: true };
    };

    // ── FILTRADO DE GRUPOS ──
    const filteredGroups = groups.filter(g => {
        if (selectedCourseFilter !== 'all' && String(g.course_id) !== String(selectedCourseFilter)) return false;
        if (statusFilter === 'active' && g.is_active === 0) return false;
        if (statusFilter === 'inactive' && g.is_active !== 0) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const nameMatch = (g.name || '').toLowerCase().includes(q);
            const teacherMatch = (g.teacher || '').toLowerCase().includes(q);
            const idMatch = String(g.id).includes(q);
            if (!nameMatch && !teacherMatch && !idMatch) return false;
        }
        return true;
    });

    const activeGroupsCount = groups.filter(g => g.is_active !== 0).length;
    const inactiveGroupsCount = groups.filter(g => g.is_active === 0).length;

    // ── FILTRADO DE CÓDIGOS ──
    const filteredCodes = codes.filter(c => {
        if (selectedCourseFilter !== 'all' && String(c.course_id) !== String(selectedCourseFilter)) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return (c.code || '').toLowerCase().includes(q);
        }
        return true;
    });

    return (
        <div className="invite-groups-manager-root" style={{ width: '100%', color: 'var(--text-heading)' }}>
            {/* ── 1. CABECERA Y ACCIÓN PRINCIPAL ── */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.25rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-subtle)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--brand-primary)'
                    }}>
                        <Layers size={22} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                            Gestión de Grupos y Enlaces con Tiempo
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            Crea grupos por curso, activa/inactiva el acceso y genera enlaces de auto-unión con cuenta regresiva.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <button
                        type="button"
                        onClick={() => openCreateGroupModal()}
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.6rem 1.15rem',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Plus size={16} />
                        <span>Nuevo Grupo</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setLinkForm({ course_id: selectedCourseFilter !== 'all' ? Number(selectedCourseFilter) : 1, group_id: '', durationHours: 24 });
                            setShowCreateLinkModal(true);
                        }}
                        style={{
                            background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                            color: '#0f172a',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.6rem 1.15rem',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Link2 size={16} />
                        <span>Generar Enlace</span>
                    </button>
                </div>
            </div>

            {/* ── 2. PESTAÑAS Y BARRA DE FILTROS RÁPIDOS ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.85rem',
                marginBottom: '1.25rem'
            }}>
                {/* Tabs Principales: Grupos vs Enlaces */}
                <div style={{
                    display: 'flex',
                    background: 'var(--surface-card-subtle)',
                    padding: '3px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)'
                }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('groups')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '9px',
                            border: 'none',
                            background: activeTab === 'groups' ? 'var(--surface-card)' : 'transparent',
                            color: activeTab === 'groups' ? 'var(--text-heading)' : 'var(--text-secondary)',
                            fontWeight: 800,
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            boxShadow: activeTab === 'groups' ? 'var(--shadow-sm)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Users size={15} color={activeTab === 'groups' ? 'var(--brand-primary)' : 'currentColor'} />
                        <span>Grupos ({groups.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('links')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '9px',
                            border: 'none',
                            background: activeTab === 'links' ? 'var(--surface-card)' : 'transparent',
                            color: activeTab === 'links' ? 'var(--text-heading)' : 'var(--text-secondary)',
                            fontWeight: 800,
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            boxShadow: activeTab === 'links' ? 'var(--shadow-sm)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Link2 size={15} color={activeTab === 'links' ? '#38bdf8' : 'currentColor'} />
                        <span>Enlaces Temporales ({codes.length})</span>
                    </button>
                </div>

                {/* Filtro por Curso (Píldoras) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => setSelectedCourseFilter('all')}
                        style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            border: '1px solid var(--border-subtle)',
                            background: selectedCourseFilter === 'all' ? 'var(--brand-primary)' : 'var(--surface-card)',
                            color: selectedCourseFilter === 'all' ? '#fff' : 'var(--text-secondary)',
                            cursor: 'pointer'
                        }}
                    >
                        Todos los Cursos
                    </button>
                    {COURSES_DEFINITION.map(c => {
                        const isSel = String(selectedCourseFilter) === String(c.id);
                        const cColor = c.color || getCourseColor(c.id) || '#38bdf8';
                        return (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setSelectedCourseFilter(String(c.id))}
                                style={{
                                    padding: '0.35rem 0.75rem',
                                    borderRadius: '8px',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    border: `1px solid ${isSel ? cColor : 'var(--border-subtle)'}`,
                                    background: isSel ? `${cColor}22` : 'var(--surface-card)',
                                    color: isSel ? cColor : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem'
                                }}
                            >
                                <span>{c.abbr || c.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── 3. CONTENIDO PRINCIPAL: PESTAÑA GRUPOS ── */}
            {activeTab === 'groups' && (
                <div className="animate-fade-in">
                    {/* Barra de Filtro de Estado (Activos / Inactivos) y Búsqueda */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                        padding: '0.65rem 0.85rem',
                        background: 'var(--surface-card-subtle)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 700, marginRight: '0.25rem' }}>
                                Estado:
                            </span>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('all')}
                                style={{
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    border: 'none',
                                    background: statusFilter === 'all' ? 'var(--surface-card)' : 'transparent',
                                    color: statusFilter === 'all' ? 'var(--text-heading)' : 'var(--text-secondary)',
                                    cursor: 'pointer'
                                }}
                            >
                                Todos ({groups.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('active')}
                                style={{
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    border: 'none',
                                    background: statusFilter === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                                    color: statusFilter === 'active' ? '#10b981' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
                                <span>Activos ({activeGroupsCount})</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('inactive')}
                                style={{
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    border: 'none',
                                    background: statusFilter === 'inactive' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                                    color: statusFilter === 'inactive' ? '#ef4444' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#94a3b8' }} />
                                <span>Inactivos ({inactiveGroupsCount})</span>
                            </button>
                        </div>

                        <div style={{ position: 'relative', minWidth: '220px' }}>
                            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Buscar grupo o docente..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.4rem 0.75rem 0.4rem 2rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-subtle)',
                                    background: 'var(--surface-card)',
                                    color: 'var(--text-heading)',
                                    fontSize: '0.78rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>

                    {/* Grid de Tarjetas de Grupos */}
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Cargando grupos de la base de datos...
                        </div>
                    ) : filteredGroups.length === 0 ? (
                        <div style={{
                            padding: '3rem 1.5rem',
                            textAlign: 'center',
                            background: 'var(--surface-card-subtle)',
                            borderRadius: '16px',
                            border: '1px dashed var(--border-subtle)'
                        }}>
                            <Users size={36} color="var(--text-secondary)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                            <h4 style={{ margin: '0 0 0.35rem', color: 'var(--text-heading)', fontSize: '1.05rem' }}>
                                No se encontraron grupos
                            </h4>
                            <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                {searchQuery ? 'Prueba con otro término de búsqueda o limpia el filtro.' : 'Crea tu primer grupo para comenzar a inscribir estudiantes.'}
                            </p>
                            <button
                                type="button"
                                onClick={() => openCreateGroupModal()}
                                style={{
                                    background: 'var(--brand-primary)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.5rem 1rem',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    cursor: 'pointer'
                                }}
                            >
                                + Crear Nuevo Grupo
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                            gap: '1rem'
                        }}>
                            {filteredGroups.map(group => {
                                const course = COURSES_DEFINITION.find(c => c.id === group.course_id) || { name: 'Curso SaberLab', abbr: 'SL', color: '#38bdf8' };
                                const cColor = course.color || getCourseColor(course.id) || '#38bdf8';
                                const isActive = group.is_active !== 0;

                                return (
                                    <div
                                        key={group.id}
                                        style={{
                                            background: 'var(--surface-card)',
                                            border: `1px solid ${isActive ? 'var(--border-subtle)' : 'rgba(239, 68, 68, 0.25)'}`,
                                            borderRadius: '16px',
                                            padding: '1.25rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            gap: '1rem',
                                            position: 'relative',
                                            opacity: isActive ? 1 : 0.78,
                                            transition: 'all 0.2s ease',
                                            boxShadow: 'var(--shadow-sm)'
                                        }}
                                    >
                                        {/* Top: Badges de Curso, ID y Estado */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                                    <span style={{
                                                        fontSize: '0.72rem',
                                                        fontWeight: 800,
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                        background: `${cColor}18`,
                                                        color: cColor,
                                                        border: `1px solid ${cColor}35`
                                                    }}>
                                                        {course.abbr || 'CURSO'}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.68rem',
                                                        fontWeight: 800,
                                                        padding: '2px 6px',
                                                        borderRadius: '6px',
                                                        background: 'var(--surface-card-subtle)',
                                                        color: 'var(--text-secondary)',
                                                        border: '1px solid var(--border-subtle)'
                                                    }}>
                                                        #DB-{group.id}
                                                    </span>
                                                </div>

                                                {/* Toggle Activo / Inactivo */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleGroupActive(group)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.3rem',
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 800,
                                                        cursor: 'pointer',
                                                        border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                                                        background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                                        color: isActive ? '#10b981' : '#ef4444',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    title={isActive ? 'Grupo Activo (Clic para desactivar/archivar)' : 'Grupo Inactivo (Clic para reactivar)'}
                                                >
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#10b981' : '#ef4444' }} />
                                                    <span>{isActive ? 'Activo' : 'Inactivo'}</span>
                                                </button>
                                            </div>

                                            {/* Nombre y Docente */}
                                            <h4 style={{
                                                margin: '0 0 0.35rem',
                                                fontSize: '1.05rem',
                                                fontWeight: 800,
                                                color: 'var(--text-heading)',
                                                lineHeight: 1.3
                                            }}>
                                                {group.name}
                                            </h4>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                                                <span>👨‍🏫 {group.teacher || 'Docente no asignado'}</span>
                                            </div>
                                        </div>

                                        {/* Barra de Conteo de Estudiantes */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.55rem 0.85rem',
                                            background: 'var(--surface-card-subtle)',
                                            borderRadius: '10px',
                                            border: '1px solid var(--border-subtle)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                                <Users size={14} color="var(--brand-primary)" />
                                                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                                                    {group.studentCount || 0} estudiantes
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => openStudentsView(group)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--brand-primary)',
                                                    fontSize: '0.74rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline'
                                                }}
                                            >
                                                Ver lista ➔
                                            </button>
                                        </div>

                                        {/* Acciones Rápidas */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr auto auto',
                                            gap: '0.45rem',
                                            paddingTop: '0.5rem',
                                            borderTop: '1px solid var(--border-subtle)'
                                        }}>
                                            <button
                                                type="button"
                                                onClick={() => openStudentsView(group)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.35rem',
                                                    padding: '0.45rem 0.6rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border-subtle)',
                                                    background: 'var(--surface-card-subtle)',
                                                    color: 'var(--text-heading)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer'
                                                }}
                                                title="Gestionar estudiantes"
                                            >
                                                <Users size={13} />
                                                <span>Alumnos</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => openCreateLinkForGroup(group)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.35rem',
                                                    padding: '0.45rem 0.6rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(56, 189, 248, 0.35)',
                                                    background: 'rgba(56, 189, 248, 0.12)',
                                                    color: 'var(--brand-primary)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 800,
                                                    cursor: 'pointer'
                                                }}
                                                title="Generar enlace temporal para este grupo"
                                            >
                                                <Link2 size={13} />
                                                <span>Enlace ⏱️</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => openEditGroupModal(group)}
                                                style={{
                                                    padding: '0.45rem 0.65rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border-subtle)',
                                                    background: 'var(--surface-card-subtle)',
                                                    color: 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                title="Editar nombre y docente"
                                            >
                                                <Edit2 size={13} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteGroup(group)}
                                                style={{
                                                    padding: '0.45rem 0.65rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                                    background: 'rgba(239, 68, 68, 0.08)',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                title="Eliminar grupo de la BD"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── 4. CONTENIDO PRINCIPAL: PESTAÑA ENLACES TEMPORALES ── */}
            {activeTab === 'links' && (
                <div className="animate-fade-in">
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Cargando enlaces temporales...
                        </div>
                    ) : filteredCodes.length === 0 ? (
                        <div style={{
                            padding: '3rem 1.5rem',
                            textAlign: 'center',
                            background: 'var(--surface-card-subtle)',
                            borderRadius: '16px',
                            border: '1px dashed var(--border-subtle)'
                        }}>
                            <Link2 size={36} color="var(--text-secondary)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                            <h4 style={{ margin: '0 0 0.35rem', color: 'var(--text-heading)', fontSize: '1.05rem' }}>
                                No hay enlaces de auto-unión activos
                            </h4>
                            <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                Genera un enlace con tiempo límite para que tus alumnos se inscriban en 1 clic.
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowCreateLinkModal(true)}
                                style={{
                                    background: 'var(--brand-primary)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.5rem 1rem',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    cursor: 'pointer'
                                }}
                            >
                                + Generar Enlace Temporal
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {filteredCodes.map(c => {
                                const course = COURSES_DEFINITION.find(cd => cd.id === c.course_id) || { name: 'Curso SaberLab', color: '#38bdf8' };
                                const linkedGroup = groups.find(g => g.id === c.group_id);
                                const status = getCodeStatus(c.expires_at);
                                const isCopied = copiedCode === c.code;

                                return (
                                    <div
                                        key={c.id}
                                        style={{
                                            background: 'var(--surface-card)',
                                            border: `1px solid ${status.active ? 'var(--border-subtle)' : 'rgba(239, 68, 68, 0.35)'}`,
                                            borderRadius: '14px',
                                            padding: '1.1rem 1.35rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap',
                                            gap: '1rem',
                                            boxShadow: 'var(--shadow-sm)'
                                        }}
                                    >
                                        <div style={{ minWidth: '240px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: 800,
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    background: `${course.color || '#38bdf8'}18`,
                                                    color: course.color || '#38bdf8',
                                                    border: `1px solid ${course.color || '#38bdf8'}35`
                                                }}>
                                                    {course.name}
                                                </span>

                                                {linkedGroup && (
                                                    <span style={{
                                                        fontSize: '0.72rem',
                                                        fontWeight: 800,
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                        background: 'var(--surface-card-subtle)',
                                                        color: 'var(--text-heading)',
                                                        border: '1px solid var(--border-subtle)'
                                                    }}>
                                                        👥 {linkedGroup.name}
                                                    </span>
                                                )}

                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: 800,
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    background: `${status.color}18`,
                                                    color: status.color,
                                                    border: `1px solid ${status.color}35`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <Clock size={10} />
                                                    {status.label}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                                <span style={{
                                                    fontFamily: 'monospace',
                                                    fontSize: '1.15rem',
                                                    fontWeight: 900,
                                                    color: 'var(--text-heading)',
                                                    letterSpacing: '1px'
                                                }}>
                                                    {c.code}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    {c.expires_at ? `Expira: ${new Date(c.expires_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}` : 'Sin límite'}
                                                </span>
                                            </div>

                                            <div style={{
                                                fontSize: '0.74rem',
                                                color: 'var(--brand-primary)',
                                                fontFamily: 'monospace',
                                                background: 'var(--surface-card-subtle)',
                                                padding: '3px 8px',
                                                borderRadius: '6px',
                                                display: 'inline-block',
                                                border: '1px solid var(--border-subtle)'
                                            }}>
                                                https://saberlab.pages.dev/join?code={c.code}
                                            </div>
                                        </div>

                                        {/* Botones de Acción */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(c.code)}
                                                style={{
                                                    background: isCopied ? 'rgba(16, 185, 129, 0.2)' : 'var(--surface-card-subtle)',
                                                    color: isCopied ? '#10b981' : 'var(--text-heading)',
                                                    border: `1px solid ${isCopied ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
                                                    padding: '0.45rem 0.85rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem'
                                                }}
                                            >
                                                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                                <span>{isCopied ? '¡Copiado!' : 'Copiar Enlace'}</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleShareWhatsApp(c.code, course.name, linkedGroup?.name)}
                                                style={{
                                                    background: 'rgba(37, 211, 102, 0.12)',
                                                    color: '#25d366',
                                                    border: '1px solid rgba(37, 211, 102, 0.3)',
                                                    padding: '0.45rem 0.85rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem'
                                                }}
                                            >
                                                <Share2 size={14} />
                                                <span>WhatsApp</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setExtendTarget(c)}
                                                style={{
                                                    background: 'rgba(245, 158, 11, 0.12)',
                                                    color: '#f59e0b',
                                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                                    padding: '0.45rem 0.85rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem'
                                                }}
                                                title="Extender tiempo de validez"
                                            >
                                                <CalendarPlus size={14} />
                                                <span>Dar más tiempo ⏱️</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteCode(c.id)}
                                                style={{
                                                    background: 'transparent',
                                                    color: '#ef4444',
                                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                                    padding: '0.45rem 0.6rem',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                title="Revocar enlace"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── 5. MODAL CREAR / EDITAR GRUPO CON ESTADO ACTIVO/INACTIVO ── */}
            {showGroupModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    background: 'rgba(10, 15, 30, 0.82)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '20px',
                        padding: '1.75rem',
                        maxWidth: '460px',
                        width: '100%',
                        color: 'var(--text-heading)',
                        boxShadow: 'var(--shadow-xl)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <Users size={20} color="var(--brand-primary)" />
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                                    {groupForm.id ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowGroupModal(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveGroup}>
                            {/* Seleccionar Curso */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                                    Asignatura / Curso
                                </label>
                                <select
                                    value={groupForm.course_id}
                                    onChange={(e) => setGroupForm({ ...groupForm, course_id: Number(e.target.value) })}
                                    style={{
                                        width: '100%',
                                        background: 'var(--surface-card-subtle)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '10px',
                                        padding: '0.7rem',
                                        color: 'var(--text-heading)',
                                        fontSize: '0.86rem',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    {COURSES_DEFINITION.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.abbr})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Nombre del Grupo */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                                    Nombre del Grupo (ej. EE-2026II, Grupo A, Taller Lunes)
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Nombre identificador..."
                                    value={groupForm.name}
                                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        background: 'var(--surface-card-subtle)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '10px',
                                        padding: '0.7rem',
                                        color: 'var(--text-heading)',
                                        fontSize: '0.86rem',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Docente a Cargo */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                                    Docente a Cargo
                                </label>
                                <input
                                    type="text"
                                    placeholder="Prof. Ronny Martinez"
                                    value={groupForm.teacher}
                                    onChange={(e) => setGroupForm({ ...groupForm, teacher: e.target.value })}
                                    style={{
                                        width: '100%',
                                        background: 'var(--surface-card-subtle)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '10px',
                                        padding: '0.7rem',
                                        color: 'var(--text-heading)',
                                        fontSize: '0.86rem',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Estado Activo / Inactivo */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                                    Estado del Grupo
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setGroupForm({ ...groupForm, is_active: 1 })}
                                        style={{
                                            padding: '0.6rem',
                                            borderRadius: '9px',
                                            border: `1px solid ${groupForm.is_active === 1 ? '#10b981' : 'var(--border-subtle)'}`,
                                            background: groupForm.is_active === 1 ? 'rgba(16, 185, 129, 0.15)' : 'var(--surface-card-subtle)',
                                            color: groupForm.is_active === 1 ? '#10b981' : 'var(--text-secondary)',
                                            fontSize: '0.82rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.4rem'
                                        }}
                                    >
                                        <CheckCircle2 size={15} />
                                        <span>🟢 Activo</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setGroupForm({ ...groupForm, is_active: 0 })}
                                        style={{
                                            padding: '0.6rem',
                                            borderRadius: '9px',
                                            border: `1px solid ${groupForm.is_active === 0 ? '#ef4444' : 'var(--border-subtle)'}`,
                                            background: groupForm.is_active === 0 ? 'rgba(239, 68, 68, 0.15)' : 'var(--surface-card-subtle)',
                                            color: groupForm.is_active === 0 ? '#ef4444' : 'var(--text-secondary)',
                                            fontSize: '0.82rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.4rem'
                                        }}
                                    >
                                        <XCircle size={15} />
                                        <span>⚪ Inactivo</span>
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowGroupModal(false)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid var(--border-subtle)',
                                        color: 'var(--text-secondary)',
                                        borderRadius: '9px',
                                        padding: '0.6rem 1.15rem',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingGroup}
                                    style={{
                                        background: 'var(--brand-primary)',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '9px',
                                        padding: '0.6rem 1.4rem',
                                        fontSize: '0.85rem',
                                        fontWeight: 800,
                                        cursor: savingGroup ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {savingGroup ? 'Guardando...' : (groupForm.id ? 'Guardar Cambios' : 'Crear Grupo')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 6. MODAL GENERAR ENLACE TEMPORAL ── */}
            {showCreateLinkModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    background: 'rgba(10, 15, 30, 0.82)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '20px',
                        padding: '1.75rem',
                        maxWidth: '460px',
                        width: '100%',
                        color: 'var(--text-heading)',
                        boxShadow: 'var(--shadow-xl)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <Sparkles size={20} color="var(--brand-primary)" />
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                                    Generar Enlace Temporal
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCreateLinkModal(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateLinkSubmit}>
                            {/* Curso */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                                    Curso a Inscribir
                                </label>
                                <select
                                    value={linkForm.course_id}
                                    onChange={(e) => {
                                        const cId = Number(e.target.value);
                                        const firstGrp = groups.find(g => g.course_id === cId);
                                        setLinkForm({ ...linkForm, course_id: cId, group_id: firstGrp?.id || '' });
                                    }}
                                    style={{
                                        width: '100%',
                                        background: 'var(--surface-card-subtle)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '10px',
                                        padding: '0.7rem',
                                        color: 'var(--text-heading)',
                                        fontSize: '0.86rem',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    {COURSES_DEFINITION.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.abbr})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Grupo Destino */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                                    Grupo Destino
                                </label>
                                <select
                                    value={linkForm.group_id}
                                    onChange={(e) => setLinkForm({ ...linkForm, group_id: Number(e.target.value) })}
                                    style={{
                                        width: '100%',
                                        background: 'var(--surface-card-subtle)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '10px',
                                        padding: '0.7rem',
                                        color: 'var(--text-heading)',
                                        fontSize: '0.86rem',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <option value="">-- Asignar automáticamente o Grupo General --</option>
                                    {groups.filter(g => g.course_id === Number(linkForm.course_id)).map(g => (
                                        <option key={g.id} value={g.id}>
                                            {g.name} (#{g.id}) {g.is_active === 0 ? '[Inactivo]' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tiempo de Vigencia */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                                    Tiempo de Vigencia del Enlace
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                    {[
                                        { hours: 1, label: '⚡ 1 Hora (En clase)' },
                                        { hours: 4, label: '🕒 4 Horas (Taller)' },
                                        { hours: 24, label: '📅 24 Horas (1 Día)' },
                                        { hours: 72, label: '🗓️ 3 Días' },
                                        { hours: 168, label: '⏳ 7 Días (1 Semana)' },
                                        { hours: 0, label: '♾️ Permanente' }
                                    ].map(opt => (
                                        <button
                                            type="button"
                                            key={opt.hours}
                                            onClick={() => setLinkForm({ ...linkForm, durationHours: opt.hours })}
                                            style={{
                                                background: linkForm.durationHours === opt.hours ? 'rgba(56, 189, 248, 0.18)' : 'var(--surface-card-subtle)',
                                                border: `1px solid ${linkForm.durationHours === opt.hours ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                                                color: linkForm.durationHours === opt.hours ? 'var(--brand-primary)' : 'var(--text-secondary)',
                                                padding: '0.6rem 0.45rem',
                                                borderRadius: '9px',
                                                fontSize: '0.78rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.15s'
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateLinkModal(false)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid var(--border-subtle)',
                                        color: 'var(--text-secondary)',
                                        borderRadius: '9px',
                                        padding: '0.6rem 1.15rem',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingLink}
                                    style={{
                                        background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                                        color: '#0f172a',
                                        border: 'none',
                                        borderRadius: '9px',
                                        padding: '0.6rem 1.4rem',
                                        fontSize: '0.85rem',
                                        fontWeight: 800,
                                        cursor: creatingLink ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {creatingLink ? 'Generando...' : 'Crear Enlace'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 7. MODAL EXTENDER VIGENCIA ── */}
            {extendTarget && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    background: 'rgba(10, 15, 30, 0.82)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'var(--surface-card)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        borderRadius: '20px',
                        padding: '1.75rem',
                        maxWidth: '450px',
                        width: '100%',
                        color: 'var(--text-heading)',
                        boxShadow: 'var(--shadow-xl)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <CalendarPlus size={20} color="#f59e0b" />
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                                    Dar Más Tiempo al Enlace
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setExtendTarget(null)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
                            >
                                ✕
                            </button>
                        </div>

                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                            Amplía la vigencia para el enlace con código <strong style={{ color: 'var(--text-heading)' }}>{extendTarget.code}</strong>. Los alumnos usarán la misma URL.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.55rem', marginBottom: '1.5rem' }}>
                            {[
                                { hours: 1, label: '+1 Hora adicional' },
                                { hours: 24, label: '+24 Horas (+1 Día)' },
                                { hours: 72, label: '+3 Días' },
                                { hours: 168, label: '+7 Días (+1 Sem)' },
                                { hours: 720, label: '+30 Días (1 Mes)' },
                                { hours: 0, label: 'Hacer Permanente' }
                            ].map(opt => (
                                <button
                                    type="button"
                                    key={opt.hours}
                                    onClick={() => setAddHours(opt.hours)}
                                    style={{
                                        background: addHours === opt.hours ? 'rgba(245, 158, 11, 0.18)' : 'var(--surface-card-subtle)',
                                        border: `1px solid ${addHours === opt.hours ? '#f59e0b' : 'var(--border-subtle)'}`,
                                        color: addHours === opt.hours ? '#f59e0b' : 'var(--text-secondary)',
                                        padding: '0.65rem 0.45rem',
                                        borderRadius: '9px',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        textAlign: 'center'
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                            <button
                                type="button"
                                onClick={() => setExtendTarget(null)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-secondary)',
                                    borderRadius: '9px',
                                    padding: '0.6rem 1.15rem',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleExtendTime}
                                disabled={updatingTime}
                                style={{
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    color: '#0f172a',
                                    border: 'none',
                                    borderRadius: '9px',
                                    padding: '0.6rem 1.4rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 800,
                                    cursor: updatingTime ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {updatingTime ? 'Actualizando...' : 'Extender Vigencia ⏱️'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 8. MODAL VER LISTA DE ESTUDIANTES DEL GRUPO ── */}
            {showStudentsModal && selectedGroupStudents && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    background: 'rgba(10, 15, 30, 0.82)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '20px',
                        padding: '1.75rem',
                        maxWidth: '520px',
                        width: '100%',
                        color: 'var(--text-heading)',
                        boxShadow: 'var(--shadow-xl)',
                        maxHeight: '88vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <Users size={20} color="var(--brand-primary)" />
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                                        Estudiantes de {selectedGroupStudents.name}
                                    </h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {studentsList.length} alumnos registrados en este grupo
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowStudentsModal(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Lista de Alumnos */}
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '4px' }}>
                            {loadingStudents ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    Cargando estudiantes...
                                </div>
                            ) : studentsList.length === 0 ? (
                                <div style={{ padding: '2.5rem', textAlign: 'center', background: 'var(--surface-card-subtle)', borderRadius: '12px' }}>
                                    <UserCheck size={32} color="var(--text-secondary)" style={{ opacity: 0.5, margin: '0 auto 0.5rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        No hay estudiantes inscritos en este grupo todavía.
                                    </p>
                                </div>
                            ) : (
                                studentsList.map(st => (
                                    <div
                                        key={st.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.65rem 0.85rem',
                                            borderRadius: '10px',
                                            background: 'var(--surface-card-subtle)',
                                            border: '1px solid var(--border-subtle)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                            <div style={{
                                                width: '34px',
                                                height: '34px',
                                                borderRadius: '50%',
                                                background: 'var(--surface-panel)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                                border: '1px solid var(--border-subtle)'
                                            }}>
                                                {st.avatar_url ? (
                                                    <img src={st.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <Users size={16} color="var(--text-secondary)" />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                                                    {st.full_name || st.email || 'Estudiante'}
                                                </div>
                                                {st.email && (
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                                        {st.email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={deletingStudentId === st.id}
                                            onClick={() => handleRemoveStudent(st)}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                                color: '#ef4444',
                                                borderRadius: '7px',
                                                padding: '0.35rem 0.6rem',
                                                fontSize: '0.72rem',
                                                fontWeight: 700,
                                                cursor: deletingStudentId === st.id ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '3px'
                                            }}
                                            title="Desvincular del grupo"
                                        >
                                            <Trash2 size={12} />
                                            <span>{deletingStudentId === st.id ? 'Quitando...' : 'Desvincular'}</span>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                            <button
                                type="button"
                                onClick={() => setShowStudentsModal(false)}
                                style={{
                                    background: 'var(--surface-card-subtle)',
                                    border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-heading)',
                                    borderRadius: '9px',
                                    padding: '0.5rem 1.25rem',
                                    fontSize: '0.84rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
