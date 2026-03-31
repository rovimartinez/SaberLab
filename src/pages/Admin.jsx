import React, { useState } from 'react';
import { Search, Shield, Settings, UserPlus, MoreVertical, Edit2, Trash2, Plus, X } from 'lucide-react';
import { usePlatformSettings } from '../hooks/usePlatformSettings';
import './Admin.css';

// Usuarios de prueba simulando la base de datos
const MOCK_USERS = [
    { id: 1, name: 'Ronny Martinez', email: 'ronny@ejemplo.com', role: 'admin', especialidad: 'Tecnología e Informática', institucion: 'Universidad Nacional', joined: '2026-03-30' },
    { id: 2, name: 'Elizabeth', email: 'eliza@ejemplo.com', role: 'profesor', especialidad: 'Química y Biología', institucion: 'Colegio San Mateo', joined: '2026-03-25' },
    { id: 3, name: 'Carlos López', email: 'carlos@ejemplo.com', role: 'estudiante', especialidad: 'Tecnología e Informática', institucion: 'Colegio San Mateo', joined: '2026-03-28' },
    { id: 4, name: 'María Gómez', email: 'maria@ejemplo.com', role: 'estudiante', especialidad: 'Lengua y Literatura', institucion: 'Instituto Técnico', joined: '2026-03-20' },
    { id: 5, name: 'Andrés Sarmiento', email: 'andres@ejemplo.com', role: 'estudiante', especialidad: 'Educación Secundaria', institucion: 'Universidad Nacional', joined: '2026-03-29' }
];

const Admin = () => {
    // Definir pestañas
    const [activeTab, setActiveTab] = useState('users'); // 'users' o 'settings'

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

    const filteredUsers = MOCK_USERS.filter(user => {
        const matchesRole = filterRole === 'todos' || user.role === filterRole;
        const matchesInst = filterInst === 'todas' || user.institucion === filterInst;
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchTerm.toLowerCase());
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
            <div className="page-header">
                <div className="header-title">
                    <Shield size={28} color="#60a5fa" />
                    <h1>Plataforma</h1>
                </div>
            </div>

            {/* Sistema de Pestañas */}
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

            {activeTab === 'users' && (
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
                            {/* Filtro Dinámico por Institución */}
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
                                <option value="todas">Todas las Instituciones</option>
                                {institutions.map(inst => (
                                    <option key={inst} value={inst}>{inst}</option>
                                ))}
                            </select>

                            {/* Filtro por Rol */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className={`filter-btn ${filterRole === 'todos' ? 'active' : ''}`} onClick={() => setFilterRole('todos')}>Roles</button>
                                <button className={`filter-btn ${filterRole === 'admin' ? 'active' : ''}`} onClick={() => setFilterRole('admin')}>Admins</button>
                                <button className={`filter-btn ${filterRole === 'profesor' ? 'active' : ''}`} onClick={() => setFilterRole('profesor')}>Profesores</button>
                                <button className={`filter-btn ${filterRole === 'estudiante' ? 'active' : ''}`} onClick={() => setFilterRole('estudiante')}>Estudiantes</button>
                            </div>
                        </div>
                    </div>

                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Institución</th>
                                    <th>Especialidad</th>
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
                                                    {getInitial(user.name)}
                                                </div>
                                                <div className="user-info">
                                                    <span className="user-name">{user.name}</span>
                                                    <span className="user-email">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                                {user.institucion}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ color: 'var(--text-secondary)' }}>
                                                {user.especialidad}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <select className="action-select" defaultValue={user.role}>
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

            {activeTab === 'settings' && (
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
