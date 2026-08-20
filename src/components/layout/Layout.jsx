import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Eye, Shield } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../../context/useAuth';
import { WhiteboardProvider } from '../../context/WhiteboardContext';
import { AppsProvider } from '../../context/AppsContext';
import '../../styles/Layout.css';

const LayoutContent = () => {
    const { isImpersonating, setViewMode } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const isEvaluationRoute = /^\/dashboard\/evaluations\/[^/]+$/.test(location.pathname);
    const isPracticeEvaluation = location.pathname.includes('re-m1-e2');
    
    const [isEvaluationMode, setIsEvaluationMode] = useState(() => {
        return localStorage.getItem('evaluationStarted') === 'true';
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const stored = localStorage.getItem('evaluationStarted');
            setIsEvaluationMode(stored === 'true');
        }, 200);
        return () => clearInterval(interval);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    const showSidebar = !isEvaluationRoute || isPracticeEvaluation || !isEvaluationMode;

    return (
        <div className="app-layout">
            {showSidebar && (
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    toggleSidebar={toggleSidebar}
                    closeSidebar={() => setIsSidebarOpen(false)} 
                />
            )}
            {isSidebarOpen && showSidebar && (
                <div className="mobile-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            <div className="main-content">
                {isImpersonating && (
                    <div style={{
                        background: 'linear-gradient(90deg, #d97706 0%, #b45309 100%)',
                        color: 'white',
                        padding: '0.55rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontWeight: 600,
                        fontSize: '0.86rem',
                        zIndex: 90,
                        boxShadow: '0 4px 15px rgba(217, 119, 6, 0.35)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <Eye size={17} />
                            <span>
                                <strong>Modo Vista de Estudiante Activo</strong> — Estás explorando la plataforma exactamente como un alumno.
                            </span>
                        </div>
                        <button
                            onClick={() => setViewMode('admin')}
                            style={{
                                background: '#0f172a',
                                color: '#f8fafc',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                padding: '5px 14px',
                                borderRadius: '10px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Shield size={14} color="#38bdf8" />
                            <span>Volver a Modo Admin</span>
                        </button>
                    </div>
                )}
                {(showSidebar || !isEvaluationRoute) && <Topbar toggleSidebar={toggleSidebar} />}
                <main className="page-content animate-fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const Layout = () => {
    return (
        <WhiteboardProvider>
            <AppsProvider>
                <LayoutContent />
            </AppsProvider>
        </WhiteboardProvider>
    );
};

export default Layout;
