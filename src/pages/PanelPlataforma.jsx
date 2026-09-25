import React, { useState, useEffect } from 'react';
import { Search, Shield, Settings, UserPlus, MoreVertical, Edit2, Trash2, Plus, X, Users, Check } from 'lucide-react';
import { usePlatformSettings } from '../hooks/usePlatformSettings';
import { COURSES_DEFINITION } from '../data/coursesData.jsx';
import { api } from '../lib/api';
import '../styles/PanelPlataforma.css';

const PanelPlataforma = ({ showHeader = true, showTabs = true, section }) => {
    const [internalActiveTab, setInternalActiveTab] = useState('users');
    const activeTab = section || internalActiveTab;
    const setActiveTab = section ? () => {} : setInternalActiveTab;

    // Estado para usuarios reales
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [userGroups, setUserGroups] = useState({});
    const [aiStatus, setAiStatus] = useState({ online: true, provider: 'Google Gemini / Groq', bots: [] });
    const [aiTestResult, setAiTestResult] = useState(null);
    const [testingAi, setTestingAi] = useState(false);
    const [botPingResults, setBotPingResults] = useState({});
    const [testingBotId, setTestingBotId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Cargar usuarios y estado del sistema
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            const { data } = await api('/admin/plataforma');

            if (data) {
                if (data.perfiles) setUsers(data.perfiles);
                if (data.cursos) setCourses(data.cursos);
                if (data.grupos) setGroups(data.grupos);
                if (data.ai_status) setAiStatus(data.ai_status);

                const ugMap = {};
                (data.grupos_usuario || []).forEach(ug => {
                    if (!ugMap[ug.user_id]) ugMap[ug.user_id] = [];
                    ugMap[ug.user_id].push(ug.group_id);
                });
                setUserGroups(ugMap);
            }
            
            setLoading(false);
        };

        fetchData();
    }, []);

    // Estado para la tabla de usuarios
    const [filterRole, setFilterRole] = useState('todos');
    const [filterInst, setFilterInst] = useState('todas');
    const [searchTerm, setSearchTerm] = useState('');

    // Catálogos dinámicos
    const { 
        institutions, addInstitution, removeInstitution, updateInstitution,
        specialties, addSpecialty, removeSpecialty, updateSpecialty
    } = usePlatformSettings();

    // Estados para inputs de nuevos catálogos
    const [newInst, setNewInst] = useState('');
    const [newSpec, setNewSpec] = useState('');

    // Estados para edición
    const [editingInst, setEditingInst] = useState(null); // {oldName, currentName}
    const [editingSpec, setEditingSpec] = useState(null); // {oldName, currentName}

    // Modal de edición de usuario y asignación de grupo
    const [editingUser, setEditingUser] = useState(null); // { id, full_name, role, group_id, email }
    const [savingUser, setSavingUser] = useState(false);
    const [updatingUserId, setUpdatingUserId] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    const showToast = (type, text) => {
        setToastMessage({ type, text });
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleOpenEditUser = (user) => {
        const currentGroupIds = userGroups[user.id] || [];
        setEditingUser({
            id: user.id,
            email: user.email,
            full_name: user.full_name || '',
            role: user.role || 'student',
            group_id: currentGroupIds[0] || 'none'
        });
    };

    const handleSaveUser = async (e) => {
        e?.preventDefault();
        if (!editingUser) return;
        setSavingUser(true);
        try {
            const res = await api('/admin/plataforma', {
                method: 'POST',
                body: {
                    action: 'update',
                    user_id: editingUser.id,
                    full_name: editingUser.full_name,
                    role: editingUser.role,
                    group_id: editingUser.group_id
                }
            });
            if (res?.error) throw new Error(res.error.message || res.error || 'Error al guardar');

            // Actualizar lista local de usuarios
            setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, full_name: editingUser.full_name, role: editingUser.role } : u));
            
            // Actualizar mapa de grupos
            setUserGroups(prev => {
                const updated = { ...prev };
                if (editingUser.group_id && editingUser.group_id !== 'none') {
                    updated[editingUser.id] = [editingUser.group_id];
                } else {
                    delete updated[editingUser.id];
                }
                return updated;
            });

            showToast('success', 'Usuario y grupo actualizados con éxito');
            setEditingUser(null);
        } catch (err) {
            alert(err.message || 'Error al guardar los cambios');
        } finally {
            setSavingUser(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setUpdatingUserId(userId);
        try {
            const res = await api('/admin/plataforma', {
                method: 'POST',
                body: { action: 'update', user_id: userId, role: newRole }
            });
            if (res?.error) throw new Error(res.error.message || res.error || 'Error al cambiar rol');

            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            showToast('success', 'Rol actualizado con éxito');
        } catch (err) {
            alert(err.message || 'Error al cambiar rol');
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleDeleteUser = async (user) => {
        const userName = user.full_name || user.email;
        if (!window.confirm(`¿Estás seguro de eliminar a "${userName}" (${user.email}) de la plataforma?\n\nEsta acción eliminará de forma permanente su cuenta, grupos, notas y accesos.`)) {
            return;
        }

        try {
            const res = await api('/admin/plataforma', {
                method: 'POST',
                body: { action: 'delete', user_id: user.id }
            });
            if (res?.error) throw new Error(res.error.message || res.error || 'Error al eliminar usuario');

            setUsers(prev => prev.filter(u => u.id !== user.id));
            setUserGroups(prev => {
                const updated = { ...prev };
                delete updated[user.id];
                return updated;
            });
            showToast('success', `"${userName}" fue eliminado de la plataforma.`);
        } catch (err) {
            alert(err.message || 'Error al eliminar usuario');
        }
    };

    const sortedUsers = [...users].sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (b.role === 'admin' && a.role !== 'admin') return 1;
        return (a.full_name || '').localeCompare(b.full_name || '');
    });

    const getCourseName = (courseId) => {
        if (!courseId) return 'Sin curso';
        const numId = parseInt(courseId, 10);
        const course = courses.find(c => c.id === courseId || c.id === numId || String(c.id) === String(courseId));
        if (course?.name) return course.name;
        
        const fallback = COURSES_DEFINITION.find(c => c.id === courseId || c.id === numId || String(c.id) === String(courseId) || c.abbr === courseId);
        if (fallback?.name) return fallback.name;

        if (courseId === 5 || numId === 5) return 'Robótica Educativa';
        if (courseId === 1 || numId === 1) return 'Electricidad y Electrónica Básica';
        return 'Sin curso';
    };

    const getGroupInfo = (userId) => {
        const groupIds = userGroups[userId] || [];
        if (groupIds.length === 0) return { course: 'Sin curso', groups: 'Sin grupo' };
        
        const groupNames = [];
        let courseName = 'Sin curso';
        
        groupIds.forEach(gid => {
            const numGid = parseInt(gid, 10);
            const group = groups.find(g => g.id === gid || g.id === numGid || String(g.id) === String(gid));
            if (group) {
                groupNames.push(group.name || 'Grupo');
                if (group.course_id) {
                    courseName = getCourseName(group.course_id);
                } else if (group.name?.includes('RE') || group.name?.includes('Robótica')) {
                    courseName = 'Robótica Educativa';
                } else if (group.name?.includes('EE') || group.name?.includes('Electricidad')) {
                    courseName = 'Electricidad y Electrónica Básica';
                }
            }
        });
        
        return {
            course: courseName,
            groups: groupNames.length > 0 ? groupNames.join(', ') : 'Sin grupo'
        };
    };

    const normalizeRole = (role) => {
        const r = (role || '').toLowerCase();
        if (r === 'admin') return 'admin';
        if (['leader', 'lider', 'semillero_leader'].includes(r)) return 'leader';
        if (['profesor', 'teacher', 'docente'].includes(r)) return 'profesor';
        return 'student';
    };

    const filteredUsers = sortedUsers.filter(user => {
        const normUserRole = normalizeRole(user.role);
        const matchesRole = filterRole === 'todos' || 
                            user.role === filterRole || 
                            normUserRole === filterRole ||
                            (filterRole === 'estudiantes' && normUserRole === 'student') ||
                            (filterRole === 'lideres' && normUserRole === 'leader') ||
                            (filterRole === 'profesores' && normUserRole === 'profesor') ||
                            (filterRole === 'admins' && normUserRole === 'admin');
        const matchesInst = filterInst === 'todas' || user.institution === filterInst;
        const fullName = user.full_name || '';
        const userEmail = user.email || '';
        const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              userEmail.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRole && matchesInst && matchesSearch;
    });

    const getRoleBadgeClass = (role) => {
        const r = normalizeRole(role);
        if (r === 'admin') return 'role-admin';
        if (r === 'leader') return 'role-leader';
        if (r === 'profesor') return 'role-profesor';
        return 'role-estudiante';
    };

    const getRoleLabel = (role) => {
        const r = normalizeRole(role);
        if (r === 'admin') return 'ADMIN';
        if (r === 'leader') return 'LÍDER';
        if (r === 'profesor') return 'PROFESOR';
        return 'STUDENT';
    };

    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

    const handleAddInstitution = () => {
        if(newInst.trim()) {
            addInstitution(newInst.trim());
            setNewInst('');
        }
    };

    const handleAddSpecialty = () => {
        if(newSpec.trim()) {
            addSpecialty(newSpec.trim());
            setNewSpec('');
        }
    };

    const handleSaveEditInst = () => {
        if (editingInst && editingInst.currentName.trim()) {
            updateInstitution(editingInst.oldName, editingInst.currentName.trim());
            setEditingInst(null);
        }
    };

    const handleSaveEditSpec = () => {
        if (editingSpec && editingSpec.currentName.trim()) {
            updateSpecialty(editingSpec.oldName, editingSpec.currentName.trim());
            setEditingSpec(null);
        }
    };

    return (
        <div className="admin-container">
            {showHeader && (
            <div className="page-header">
                <div className="header-title">
                    <Shield size={28} color="#60a5fa" />
                    <h1>Plataforma</h1>
                </div>
            </div>
            )}

            {showTabs && (
                <div className="admin-tabs">
                    <button 
                        className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        👥 Usuarios
                    </button>
                    <button 
                        className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        ⚙️ Catálogos y Opciones
                    </button>
                    <button 
                        className={`admin-tab ${activeTab === 'ai' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ai')}
                    >
                        🤖 Estado del Motor IA
                    </button>
                </div>
            )}

            {/* Subsección: Estado de la IA Dedicada */}
            {(section === 'ai' || (!section && activeTab === 'ai')) && (
                <div className="settings-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="settings-panel" style={{ border: aiStatus?.online ? '1.5px solid rgba(16, 185, 129, 0.45)' : '1.5px solid rgba(239, 68, 68, 0.45)', background: 'var(--surface-card, #ffffff)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    background: aiStatus?.online ? '#10b981' : '#ef4444',
                                    boxShadow: aiStatus?.online ? '0 0 14px #10b981' : '0 0 14px #ef4444'
                                }} />
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-heading, #1e293b)' }}>Telemetría y Estado de los Tutores IA</h3>
                            </div>
                            <span style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                background: aiStatus?.online ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: aiStatus?.online ? '#10b981' : '#ef4444'
                            }}>
                                {aiStatus?.online ? '🟢 IA ONLINE / OPERACIONAL' : '🔴 IA OFFLINE'}
                            </span>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--surface-ground, #f8fafc)', border: '1px solid var(--border-default, #e2e8f0)' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Proveedor Principal</span>
                                <h4 style={{ margin: '4px 0 0 0', color: 'var(--brand-primary, #6366f1)' }}>{aiStatus?.provider || 'Google Gemini 2.5 Flash'}</h4>
                            </div>
                            <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--surface-ground, #f8fafc)', border: '1px solid var(--border-default, #e2e8f0)' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tutores Conectados</span>
                                <h4 style={{ margin: '4px 0 0 0' }}>4 Asistentes Especializados</h4>
                            </div>
                            <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--surface-ground, #f8fafc)', border: '1px solid var(--border-default, #e2e8f0)' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Modo de Contingencia</span>
                                <h4 style={{ margin: '4px 0 0 0', color: '#10b981' }}>Heurístico Offline Activo</h4>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-heading, #1e293b)' }}>
                                📡 Ping y Diagnóstico en Tiempo Real por Tutor:
                            </h4>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                Inferencia real con latencia de red, modelo e ID de sesión D1
                            </span>
                        </div>

                        {/* Grid de Ping Individual por Bot */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                            {[
                                { id: 'electrobot', name: 'ElectroBot', course: 'EE', color: '#eab308', icon: '⚡', subtitle: 'Electricidad y Circuitos', query: '¿Cómo calcular la resistencia equivalente en un circuito paralelo?' },
                                { id: 'robobot', name: 'RoboBot', course: 'RE', color: '#0284c7', icon: '🤖', subtitle: 'Robótica y Arduino C++', query: '¿Cómo leer una fotorresistencia LDR con analogRead() en Arduino?' },
                                { id: 'tridibot', name: 'TridiBot', course: 'MA', color: '#8b5cf6', icon: '🧊', subtitle: 'Modelado 3D y Blender', query: '¿Cuáles son los atajos fundamentales G, R, S en Blender?' },
                                { id: 'impribot', name: 'ImpriBot', course: 'SIMI', color: '#06b6d4', icon: '🚀', subtitle: 'Impresión 3D y Slicers', query: '¿Cuáles son las temperaturas recomendadas para filamento PETG?' }
                            ].map(bot => {
                                const isTestingThis = testingBotId === bot.id;
                                const result = botPingResults[bot.id];

                                return (
                                    <div key={bot.id} style={{
                                        background: 'var(--surface-ground, #f8fafc)',
                                        border: `1.5px solid ${result?.success ? 'rgba(16, 185, 129, 0.4)' : result?.error ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-default, #e2e8f0)'}`,
                                        borderRadius: '14px',
                                        padding: '1.1rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem',
                                        position: 'relative'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '1.4rem' }}>{bot.icon}</span>
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-heading, #1e293b)' }}>
                                                        {bot.name} <span style={{ fontSize: '0.75rem', color: bot.color, fontWeight: 700 }}>({bot.course})</span>
                                                    </h4>
                                                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{bot.subtitle}</span>
                                                </div>
                                            </div>
                                            {result && (
                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: 800,
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    background: result.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                    color: result.success ? '#10b981' : '#ef4444'
                                                }}>
                                                    {result.success ? `${result.latencyMs} ms` : 'Fallo'}
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            disabled={isTestingThis}
                                            onClick={async () => {
                                                setTestingBotId(bot.id);
                                                const startTime = performance.now();
                                                try {
                                                    const res = await api('/ai/chat', {
                                                        method: 'POST',
                                                        body: {
                                                            botType: bot.id,
                                                            courseAbbr: bot.course,
                                                            messages: [{ role: 'user', content: bot.query }],
                                                            isBrief: true
                                                        }
                                                    });
                                                    const elapsed = Math.round(performance.now() - startTime);
                                                    if (res?.data?.success && res.data.message) {
                                                        setBotPingResults(prev => ({
                                                            ...prev,
                                                            [bot.id]: {
                                                                success: true,
                                                                text: res.data.message.content,
                                                                model: res.data.model || 'SaberLab AI',
                                                                latencyMs: elapsed,
                                                                timestamp: new Date().toLocaleTimeString()
                                                            }
                                                        }));
                                                        setAiStatus(prev => ({ ...prev, online: true }));
                                                    } else {
                                                        setBotPingResults(prev => ({
                                                            ...prev,
                                                            [bot.id]: {
                                                                success: false,
                                                                error: res?.error?.message || res?.data?.error || 'Sin respuesta',
                                                                latencyMs: elapsed,
                                                                timestamp: new Date().toLocaleTimeString()
                                                            }
                                                        }));
                                                    }
                                                } catch (err) {
                                                    const elapsed = Math.round(performance.now() - startTime);
                                                    setBotPingResults(prev => ({
                                                        ...prev,
                                                        [bot.id]: {
                                                            success: false,
                                                            error: err.message || 'Error de conexión',
                                                            latencyMs: elapsed,
                                                            timestamp: new Date().toLocaleTimeString()
                                                        }
                                                    }));
                                                } finally {
                                                    setTestingBotId(null);
                                                }
                                            }}
                                            style={{
                                                background: isTestingThis ? 'rgba(99, 102, 241, 0.2)' : `linear-gradient(135deg, ${bot.color} 0%, #475569 100%)`,
                                                color: '#fff',
                                                border: 'none',
                                                padding: '7px 12px',
                                                borderRadius: '8px',
                                                fontWeight: 700,
                                                fontSize: '0.82rem',
                                                cursor: isTestingThis ? 'wait' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            {isTestingThis ? '⚡ Ejecutando Ping...' : `⚡ Probar Ping en Vivo (${bot.name})`}
                                        </button>

                                        {result && (
                                            <div style={{
                                                marginTop: '4px',
                                                padding: '8px 10px',
                                                borderRadius: '8px',
                                                fontSize: '0.78rem',
                                                background: result.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                                border: result.success ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                                                color: 'var(--text-primary)'
                                            }}>
                                                {result.success ? (
                                                    <>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#10b981', fontWeight: 700 }}>
                                                            <span>✓ Inferencia exitosa [{result.model}]</span>
                                                            <span>{result.timestamp}</span>
                                                        </div>
                                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.3' }}>
                                                            "{result.text.slice(0, 110)}..."
                                                        </p>
                                                    </>
                                                ) : (
                                                    <div style={{ color: '#ef4444', fontWeight: 600 }}>
                                                        ✗ Error: {result.error} ({result.timestamp})
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {(section === 'users' || (!section && activeTab === 'users')) && (
                <>
                    <div className="admin-controls">
                        <div className="search-wrapper">
                            <Search className="search-icon" size={18} />
                            <input 
                                type="text" 
                                placeholder="Buscar por nombre o correo..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="role-filters" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {/* Filtro Dinámico por Curso */}
                            <select 
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'var(--text-secondary)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    outline: 'none',
                                    fontSize: '0.85rem'
                                }}
                                value={filterInst}
                                onChange={(e) => setFilterInst(e.target.value)}
                            >
                                <option value="todas">Todos los Cursos</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.name}</option>
                                ))}
                            </select>

                            {/* Filtro por Rol */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button className={`filter-btn ${filterRole === 'admin' ? 'active' : ''}`} onClick={() => setFilterRole('admin')}>Admins</button>
                                <button className={`filter-btn ${filterRole === 'profesor' ? 'active' : ''}`} onClick={() => setFilterRole('profesor')}>Profesores</button>
                                <button className={`filter-btn ${filterRole === 'lideres' || filterRole === 'leader' ? 'active' : ''}`} onClick={() => setFilterRole('lideres')}>Líderes</button>
                                <button className={`filter-btn ${filterRole === 'estudiante' || filterRole === 'estudiantes' ? 'active' : ''}`} onClick={() => setFilterRole('estudiantes')}>Estudiantes</button>
                                <button className={`filter-btn ${filterRole === 'todos' ? 'active' : ''}`} onClick={() => setFilterRole('todos')}>Todos</button>
                            </div>
                        </div>
                    </div>

                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Curso</th>
                                    <th>Grupo</th>
                                    <th>Rol Actual</th>
                                    <th>Modificar Rol</th>
                                    <th style={{ textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar" style={{ overflow: 'hidden', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {user.avatar_url ? (
                                                        <img 
                                                            src={user.avatar_url} 
                                                            alt={user.full_name || 'Usuario'} 
                                                            referrerPolicy="no-referrer"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                if (e.currentTarget.nextSibling) {
                                                                    e.currentTarget.nextSibling.style.display = 'block';
                                                                }
                                                            }}
                                                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                                        />
                                                    ) : null}
                                                    <span style={{ display: user.avatar_url ? 'none' : 'block' }}>
                                                        {getInitial(user.full_name || user.email)}
                                                    </span>
                                                </div>
                                                <div className="user-info">
                                                    <span className="user-name">{user.full_name || 'Sin nombre'}</span>
                                                    <span className="user-email">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                                {getGroupInfo(user.id).course}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ color: 'var(--text-secondary)' }}>
                                                {getGroupInfo(user.id).groups}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td>
                                            <select 
                                                className="action-select" 
                                                value={normalizeRole(user.role)}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                disabled={updatingUserId === user.id}
                                                style={{ cursor: updatingUserId === user.id ? 'wait' : 'pointer' }}
                                            >
                                                <option value="student">Estudiante</option>
                                                <option value="leader">Líder Semillero</option>
                                                <option value="profesor">Profesor</option>
                                                <option value="admin">Administrador</option>
                                            </select>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button 
                                                    className="icon-btn" 
                                                    style={{ padding: '6px', background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', borderRadius: '8px', cursor: 'pointer' }} 
                                                    title="Editar usuario y asignar a grupo"
                                                    onClick={() => handleOpenEditUser(user)}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    className="icon-btn" 
                                                    style={{ padding: '6px', background: 'rgba(244, 63, 94, 0.12)', color: '#fb7185', borderRadius: '8px', cursor: 'pointer' }} 
                                                    title="Eliminar usuario de la plataforma"
                                                    onClick={() => handleDeleteUser(user)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                No se encontraron usuarios que coincidan con la búsqueda.
                            </div>
                        )}
                    </div>
                </>
            )}

            {(section ? section === 'settings' : true) && (
                <div className="settings-grid">
                    {/* Panel de Instituciones */}
                    <div className="settings-panel">
                        <h3>Instituciones Autorizadas</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Agrega los colegios o universidades permitidos en el registro.
                        </p>
                        
                        <div className="settings-list">
                            {institutions.map(inst => (
                                <div key={inst} className="settings-item">
                                    {editingInst?.oldName === inst ? (
                                        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                            <input 
                                                type="text" 
                                                className="form-input" 
                                                style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                                                value={editingInst.currentName}
                                                onChange={(e) => setEditingInst({...editingInst, currentName: e.target.value})}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEditInst()}
                                                autoFocus
                                            />
                                            <button className="icon-btn" onClick={handleSaveEditInst} style={{ color: '#10b981' }}>
                                                <Plus size={16} />
                                            </button>
                                            <button className="icon-btn" onClick={() => setEditingInst(null)} style={{ color: '#94a3b8' }}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span>{inst}</span>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button className="icon-btn" onClick={() => setEditingInst({oldName: inst, currentName: inst})} style={{ color: '#60a5fa', padding: '4px' }}>
                                                    <Edit2 size={14} />
                                                </button>
                                                <button className="icon-btn" onClick={() => removeInstitution(inst)} style={{ color: '#fb7185', padding: '4px' }}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="settings-add">
                            <input 
                                type="text" 
                                placeholder="Nueva institución..." 
                                value={newInst}
                                onChange={(e) => setNewInst(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddInstitution()}
                            />
                            <button className="icon-btn" onClick={handleAddInstitution} style={{ background: 'var(--accent-blue)', color: 'white', padding: '10px', borderRadius: '8px' }}>
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Panel de Especialidades */}
                    <div className="settings-panel">
                        <h3>Grados y Especialidades</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Agrega las áreas o cursos dictados en la plataforma.
                        </p>
                        
                        <div className="settings-list">
                            {specialties.map(spec => (
                                <div key={spec} className="settings-item">
                                    {editingSpec?.oldName === spec ? (
                                        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                            <input 
                                                type="text" 
                                                className="form-input" 
                                                style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                                                value={editingSpec.currentName}
                                                onChange={(e) => setEditingSpec({...editingSpec, currentName: e.target.value})}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEditSpec()}
                                                autoFocus
                                            />
                                            <button className="icon-btn" onClick={handleSaveEditSpec} style={{ color: '#10b981' }}>
                                                <Plus size={16} />
                                            </button>
                                            <button className="icon-btn" onClick={() => setEditingSpec(null)} style={{ color: '#94a3b8' }}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span>{spec}</span>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button className="icon-btn" onClick={() => setEditingSpec({oldName: spec, currentName: spec})} style={{ color: '#60a5fa', padding: '4px' }}>
                                                    <Edit2 size={14} />
                                                </button>
                                                <button className="icon-btn" onClick={() => removeSpecialty(spec)} style={{ color: '#fb7185', padding: '4px' }}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="settings-add">
                            <input 
                                type="text" 
                                placeholder="Nuevo grado/especialidad..." 
                                value={newSpec}
                                onChange={(e) => setNewSpec(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSpecialty()}
                            />
                            <button className="icon-btn" onClick={handleAddSpecialty} style={{ background: 'var(--accent-blue)', color: 'white', padding: '10px', borderRadius: '8px' }}>
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>

                </div>
            )}

            {/* ── Modal de Edición de Usuario y Asignación de Grupo ── */}
            {editingUser && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }} onClick={() => !savingUser && setEditingUser(null)}>
                    <div style={{
                        background: '#1e293b',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '20px',
                        width: '100%',
                        maxWidth: '500px',
                        padding: '2rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                        color: '#fff'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Edit2 size={20} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Editar Usuario</h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{editingUser.email}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setEditingUser(null)}
                                disabled={savingUser}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                                    Nombre Completo
                                </label>
                                <input 
                                    type="text"
                                    value={editingUser.full_name}
                                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                                    placeholder="Ej. Nombre y Apellido"
                                    style={{
                                        width: '100%',
                                        background: '#0f172a',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        borderRadius: '10px',
                                        padding: '0.75rem 1rem',
                                        color: '#fff',
                                        fontSize: '0.92rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                                    Rol en la Plataforma
                                </label>
                                <select
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                    style={{
                                        width: '100%',
                                        background: '#0f172a',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        borderRadius: '10px',
                                        padding: '0.75rem 1rem',
                                        color: '#fff',
                                        fontSize: '0.92rem',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="student">Estudiante</option>
                                    <option value="leader">Líder de Semillero</option>
                                    <option value="profesor">Profesor / Docente</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                                    Asignar a Grupo y Curso
                                </label>
                                <select
                                    value={editingUser.group_id}
                                    onChange={(e) => setEditingUser({ ...editingUser, group_id: e.target.value })}
                                    style={{
                                        width: '100%',
                                        background: '#0f172a',
                                        border: '1px solid rgba(56, 189, 248, 0.3)',
                                        borderRadius: '10px',
                                        padding: '0.75rem 1rem',
                                        color: '#fff',
                                        fontSize: '0.92rem',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="none">-- Sin grupo asignado --</option>
                                    {groups.map(g => {
                                        const cName = getCourseName(g.course_id);
                                        return (
                                            <option key={g.id} value={g.id}>
                                                {g.name} — ({cName})
                                            </option>
                                        );
                                    })}
                                </select>
                                <p style={{ margin: '0.4rem 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                                    Al asignarlo a un grupo, el estudiante tendrá acceso inmediato a su curso correspondiente.
                                </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    disabled={savingUser}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        color: '#94a3b8',
                                        padding: '0.65rem 1.25rem',
                                        borderRadius: '10px',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingUser}
                                    style={{
                                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                        border: 'none',
                                        color: '#fff',
                                        padding: '0.65rem 1.5rem',
                                        borderRadius: '10px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                                    }}
                                >
                                    {savingUser ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Notificación Toast Flotante ── */}
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    background: toastMessage.type === 'success' ? '#065f46' : '#991b1b',
                    color: '#fff',
                    padding: '0.85rem 1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    zIndex: 10000,
                    fontWeight: 700,
                    fontSize: '0.9rem'
                }}>
                    {toastMessage.type === 'success' ? '✓ ' : '✕ '}
                    {toastMessage.text}
                </div>
            )}
        </div>
    );
};

export default PanelPlataforma;
