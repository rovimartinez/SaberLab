import React, { useState, useEffect } from 'react';
import { Search, Shield, Settings, UserPlus, MoreVertical, Edit2, Trash2, Plus, X } from 'lucide-react';
import { usePlatformSettings } from '../hooks/usePlatformSettings';
import { supabase } from '../lib/supabase';
import './Admin.css';

const Admin = ({ showHeader = true, showTabs = true, section }) => {
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
            
            const [usersRes, coursesRes, groupsRes, ugRes] = await Promise.all([
                supabase.from('profiles').select('*').order('created_at', { ascending: false }),
                supabase.from('courses').select('*').order('name'),
                supabase.from('groups').select('*').order('name'),
                supabase.from('user_groups').select('*')
            ]);
            
            if (usersRes.data) setUsers(usersRes.data);
            if (coursesRes.data) setCourses(coursesRes.data);
            if (groupsRes.data) setGroups(groupsRes.data);
            
            // Crear mapa de usuario -> grupos
            if (ugRes.data) {
                const ugMap = {};
                ugRes.data.forEach(ug => {
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

    const sortedUsers = [...users].sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (b.role === 'admin' && a.role !== 'admin') return 1;
        return (a.full_name || '').localeCompare(b.full_name || '');
    });

    const getCourseName = (courseId) => {
        if (courseId) {
            const course = courses.find(c => c.id === courseId);
            return course?.name || 'Sin curso';
        }
        return 'Sin curso';
    };

    const getGroupInfo = (userId) => {
        const groupIds = userGroups[userId] || [];
        if (groupIds.length === 0) return { course: 'Sin curso', groups: 'Sin grupo' };
        
        const groupNames = [];
        let courseName = 'Sin curso';
        
        groupIds.forEach(gid => {
            const group = groups.find(g => g.id === gid);
            if (group) {
                groupNames.push(group.name || 'Grupo');
                // Obtener nombre del curso desde el grupo
                if (group.course_id) {
                    const course = courses.find(c => c.id === group.course_id);
                    if (course) courseName = course.name;
                }
            }
        });
        
        return {
            course: courseName,
            groups: groupNames.length > 0 ? groupNames.join(', ') : 'Sin grupo'
        };
    };

    const filteredUsers = sortedUsers.filter(user => {
        const matchesRole = filterRole === 'todos' || user.role === filterRole;
        const matchesInst = filterInst === 'todas' || user.institution === filterInst;
        const fullName = user.full_name || '';
        const userEmail = user.email || '';
        const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              userEmail.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRole && matchesInst && matchesSearch;
    });

    const getRoleBadgeClass = (role) => {
        switch(role) {
            case 'admin': return 'role-admin';
            case 'profesor': return 'role-profesor';
            default: return 'role-estudiante';
        }
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
                                                <div className="user-avatar">
                                                    {getInitial(user.full_name || user.email)}
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
                                                {user.role?.toUpperCase() || 'ESTUDIANTE'}
                                            </span>
                                        </td>
                                        <td>
                                            <select className="action-select" defaultValue={user.role || 'estudiante'}>
                                                <option value="estudiante">Estudiante</option>
                                                <option value="profesor">Profesor</option>
                                                <option value="admin">Administrador</option>
                                            </select>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button className="icon-btn" style={{ padding: '6px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }} title="Editar usuario">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="icon-btn" style={{ padding: '6px', background: 'rgba(244, 63, 94, 0.1)', color: '#fb7185' }} title="Eliminar usuario">
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
        </div>
    );
};

export default Admin;
