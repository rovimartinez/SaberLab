import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Shield, ClipboardList, Users, Settings, Database, Radio, Link2 } from 'lucide-react';
import PanelMisCursos from './PanelMisCursos';
import PanelPlataforma from './PanelPlataforma';
import PanelExamenes from './PanelExamenes';
import OnlineStudentsMonitor from '../components/admin/OnlineStudentsMonitor';
import CourseInviteManager from '../components/admin/CourseInviteManager';
import { COURSES_DEFINITION } from '../data/coursesData.jsx';
import '../styles/PanelPlataforma.css';

const PanelGestion = () => {
    const navigate = useNavigate();
    const [activeCard, setActiveCard] = useState('en_linea');
    const [activeSubPanel, setActiveSubPanel] = useState('usuarios');
    const [courses, setCourses] = useState(COURSES_DEFINITION);

    return (
        <div className="admin-container">
            <div className="page-header">
                <div className="header-title">
                    <Shield size={28} color="#60a5fa" />
                    <h1>Gestión y Monitoreo</h1>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setActiveCard('en_linea')}
                    style={{
                        flex: '1 1 200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        padding: '1.25rem',
                        background: activeCard === 'en_linea' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
                        border: `1.5px solid ${activeCard === 'en_linea' ? '#10b981' : 'var(--glass-border)'}`,
                        borderRadius: '16px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        minHeight: '90px'
                    }}
                >
                    <Radio size={28} style={{ color: '#10b981' }} className={activeCard === 'en_linea' ? 'animate-pulse' : ''} />
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>En Vivo & Mensajes</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Alumnos en línea y alertas a pantalla</div>
                    </div>
                </button>

                <button
                    onClick={() => setActiveCard('invitaciones')}
                    style={{
                        flex: '1 1 200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        padding: '1.25rem',
                        background: activeCard === 'invitaciones' ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-secondary)',
                        border: `1.5px solid ${activeCard === 'invitaciones' ? '#38bdf8' : 'var(--glass-border)'}`,
                        borderRadius: '16px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        minHeight: '90px'
                    }}
                >
                    <Link2 size={28} style={{ color: '#38bdf8' }} />
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Enlaces con Tiempo</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Auto-unión y extensión de vigencia</div>
                    </div>
                </button>

                <button
                    onClick={() => setActiveCard('cursos')}
                    style={{
                        flex: '1 1 200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        padding: '1.25rem',
                        background: activeCard === 'cursos' ? 'rgba(96, 165, 250, 0.15)' : 'var(--bg-secondary)',
                        border: `1.5px solid ${activeCard === 'cursos' ? 'var(--accent-blue, #38bdf8)' : 'var(--glass-border)'}`,
                        borderRadius: '16px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        minHeight: '90px'
                    }}
                >
                    <BookOpen size={28} style={{ color: '#4ade80' }} />
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Gestión de Cursos</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Módulos, lecciones y visibilidad</div>
                    </div>
                </button>

                <button
                    onClick={() => setActiveCard('plataforma')}
                    style={{
                        flex: '1 1 200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        padding: '1.25rem',
                        background: activeCard === 'plataforma' ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-secondary)',
                        border: `1.5px solid ${activeCard === 'plataforma' ? '#a855f7' : 'var(--glass-border)'}`,
                        borderRadius: '16px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        minHeight: '90px'
                    }}
                >
                    <Shield size={28} style={{ color: '#a855f7' }} />
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Plataforma</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Usuarios y configuración</div>
                    </div>
                </button>

                <button
                    onClick={() => setActiveCard('examenes')}
                    style={{
                        flex: '1 1 200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        padding: '1.25rem',
                        background: activeCard === 'examenes' ? 'rgba(244, 63, 94, 0.15)' : 'var(--bg-secondary)',
                        border: `1.5px solid ${activeCard === 'examenes' ? '#f43f5e' : 'var(--glass-border)'}`,
                        borderRadius: '16px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        minHeight: '90px'
                    }}
                >
                    <ClipboardList size={28} style={{ color: '#f43f5e' }} />
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Exámenes</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Evaluaciones y resultados</div>
                    </div>
                </button>
            </div>

            {activeCard === 'en_linea' && (
                <OnlineStudentsMonitor />
            )}

            {activeCard === 'invitaciones' && (
                <CourseInviteManager />
            )}

            {activeCard === 'cursos' && (
                <PanelMisCursos courses={courses} showHeader={false} embedded={true} />
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

                    {activeSubPanel === 'usuarios' && <PanelPlataforma showHeader={false} showTabs={false} section="users" />}
                    {activeSubPanel === 'catalogos' && <PanelPlataforma showHeader={false} showTabs={false} section="settings" />}
                </>
            )}

            {activeCard === 'examenes' && (
                <PanelExamenes />
            )}
        </div>
    );
};

export default PanelGestion;