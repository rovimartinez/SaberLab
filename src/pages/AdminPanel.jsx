import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Shield, ClipboardList, Users, Settings, Database } from 'lucide-react';
import Courses from './Courses';
import Admin from './Admin';
import { COURSES_DEFINITION } from '../data/coursesData.jsx';
import './Admin.css';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [activeCard, setActiveCard] = useState('cursos');
    const [activeSubPanel, setActiveSubPanel] = useState('usuarios');
    const [courses, setCourses] = useState(COURSES_DEFINITION);

    return (
        <div className="admin-container">
            <div className="page-header">
                <div className="header-title">
                    <Shield size={28} color="#60a5fa" />
                    <h1>Gestión</h1>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setActiveCard('cursos')}
                    style={{
                        flex: '1 1 250px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        padding: '1.5rem',
                        background: activeCard === 'cursos' ? 'rgba(96, 165, 250, 0.15)' : 'var(--glass-bg)',
                        border: `1px solid ${activeCard === 'cursos' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '16px',
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        minHeight: '100px'
                    }}
                >
                    <BookOpen size={32} style={{ color: '#4ade80' }} />
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>Gestión de Cursos</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Administrar cursos, módulos y lecciones</div>
                    </div>
                </button>

                <button
                    onClick={() => setActiveCard('plataforma')}
                    style={{
                        flex: '1 1 250px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        padding: '1.5rem',
                        background: activeCard === 'plataforma' ? 'rgba(96, 165, 250, 0.15)' : 'var(--glass-bg)',
                        border: `1px solid ${activeCard === 'plataforma' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '16px',
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        minHeight: '100px'
                    }}
                >
                    <Shield size={32} style={{ color: '#a855f7' }} />
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>Plataforma</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Configuración general del sistema</div>
                    </div>
                </button>

                <button
                    onClick={() => setActiveCard('examenes')}
                    style={{
                        flex: '1 1 250px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        padding: '1.5rem',
                        background: activeCard === 'examenes' ? 'rgba(96, 165, 250, 0.15)' : 'var(--glass-bg)',
                        border: `1px solid ${activeCard === 'examenes' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '16px',
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        minHeight: '100px'
                    }}
                >
                    <ClipboardList size={32} style={{ color: '#f43f5e' }} />
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>Exámenes</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Gestionar evaluaciones y resultados</div>
                    </div>
                </button>
            </div>

            {activeCard === 'cursos' && (
                <Courses courses={courses} showHeader={false} embedded={true} />
            )}

            {activeCard === 'plataforma' && (
                <>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <button
                            onClick={() => setActiveSubPanel('usuarios')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: activeSubPanel === 'usuarios' ? 'var(--accent-blue)' : 'var(--glass-bg)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer'
                            }}
                        >
                            <Users size={18} />
                            Usuarios
                        </button>
                    <button
                        onClick={() => setActiveSubPanel('catalogos')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: activeSubPanel === 'catalogos' ? 'var(--accent-blue)' : 'var(--glass-bg)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            cursor: 'pointer'
                        }}
                    >
                        <Settings size={18} />
                        Catálogos
                    </button>
                        <button
                            disabled
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: 'var(--glass-bg)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'not-allowed',
                                opacity: 0.5
                            }}
                        >
                            <Database size={18} />
                            Base de Datos
                        </button>
                    </div>

                    {activeSubPanel === 'usuarios' && <Admin showHeader={false} showTabs={false} section="users" />}
                    {activeSubPanel === 'catalogos' && <Admin showHeader={false} showTabs={false} section="settings" />}
                </>
            )}

            {activeCard === 'examenes' && (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <ClipboardList size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
                    <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Gestión de Exámenes</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Aquí podrás gestionar evaluaciones y ver resultados</p>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
