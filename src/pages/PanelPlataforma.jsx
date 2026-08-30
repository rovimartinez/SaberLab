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
    const [loading, setLoading] = useState(true);

    // Cargar usuarios de Supabase
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            const { data } = await api('/admin/plataforma');

            if (data) {
                if (data.perfiles) setUsers(data.perfiles);
                if (data.cursos) setCourses(data.cursos);
                if (data.grupos) setGroups(data.grupos);

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
            const { error } = await api('/admin/plataforma', {
                method: 'PATCH',
                body: {
                    user_id: editingUser.id,
                    full_name: editingUser.full_name,
                    role: editingUser.role,
                    group_id: editingUser.group_id
                }
            });
            if (error) throw new Error(error.message);

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
            const { error } = await api('/admin/plataforma', {
                method: 'PATCH',
                body: { user_id: userId, role: newRole }
            });
            if (error) throw new Error(error.message);

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
            const { error } = await api('/admin/plataforma', {
                method: 'DELETE',
                body: { user_id: user.id }
            });
            if (error) throw new Error(error.message);

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
        if (['profesor', 'teacher', 'docente'].includes(r)) return 'profesor';
        return 'student';
    };

    const filteredUsers = sortedUsers.filter(user => {
        const normUserRole = normalizeRole(user.role);
        const matchesRole = filterRole === 'todos' || 
                            user.role === filterRole || 
                            normUserRole === filterRole ||
                            (filterRole === 'estudiantes' && normUserRole === 'student') ||
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
        if (r === 'profesor') return 'role-profesor';
        return 'role-estudiante';
    };

    const getRoleLabel = (role) => {
        const r = normalizeRole(role);
        if (r === 'admin') return 'ADMIN';
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
                        Usuarios
                    </button>
                    <button 
                        className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        Catálogos y Opciones
                    </button>
                </div>
            )}

            {(section ? section === 'users' : true) && (
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
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className={`filter-btn ${filterRole === 'admin' ? 'active' : ''}`} onClick={() => setFilterRole('admin')}>Admins</button>
                                <button className={`filter-btn ${filterRole === 'profesor' ? 'active' : ''}`} onClick={() => setFilterRole('profesor')}>Profesores</button>
                                <button className={`filter-btn ${filterRole === 'estudiante' ? 'active' : ''}`} onClick={() => setFilterRole('estudiante')}>Estudiantes</button>
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
