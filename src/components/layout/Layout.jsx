import { useState, useEffect, lazy, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Eye, Shield, X, User } from 'lucide-react';
const PanelPerfil = lazy(() => import('../../pages/PanelPerfil'));
import { useAuth } from '../../context/useAuth';
import { WhiteboardProvider } from '../../context/WhiteboardContext';
import { AppsProvider } from '../../context/AppsContext';
import { useInactivityLogout } from '../../hooks/useInactivityLogout';
import { useStudentPresence } from '../../hooks/useStudentPresence';
import InactivityWarningModal from '../modals/InactivityWarningModal';
import DirectMessagePopup from '../modals/DirectMessagePopup';
import SaberLabAiChat from '../ai/SaberLabAiChat';
import '../../styles/Layout.css';

const LayoutContent = () => {
    const { isImpersonating, setViewMode, toggleViewMode, isStaffUser, realRole, profile } = useAuth();
    const hasTeacherPrivileges = isStaffUser || ['admin', 'teacher', 'docente', 'profesor', 'leader', 'lider'].includes(realRole || profile?.real_role || profile?.role);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const location = useLocation();

    // Hooks de seguridad por inactividad y presencia en vivo
    const { showWarning, secondsRemaining, extendSession, handleLogout } = useInactivityLogout();
    const { pendingMessage, clearPendingMessage } = useStudentPresence();

    useEffect(() => {
        if (!isProfileModalOpen) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setIsProfileModalOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isProfileModalOpen]);

    return (
        <div className="app-layout">
            <div className="main-content">
                <main className="page-content animate-fade-in">
                    <Outlet />
                </main>
            </div>

            {/* Dock flotante inferior de modo vista de estudiante (aviso discreto) */}
            {isImpersonating && (
                <div className="impersonate-floating-dock" role="status" aria-live="polite">
                    <div className="impersonate-dock-left">
                        <div className="impersonate-dock-icon">
                            <User size={16} />
                        </div>
                        <div className="impersonate-dock-text">
                            <span className="impersonate-dock-title">Modo Vista de Estudiante</span>
                        </div>
                    </div>
                </div>
            )}

            {showWarning && (
                <InactivityWarningModal
                    secondsRemaining={secondsRemaining}
                    onExtend={extendSession}
                    onLogout={handleLogout}
                />
            )}

            {/* Alerta emergente de mensaje del docente */}
            {pendingMessage && (
                <DirectMessagePopup
                    message={pendingMessage}
                    onConfirm={clearPendingMessage}
                />
            )}

            {isProfileModalOpen && (
                <div
                    className="profile-modal-backdrop"
                    onMouseDown={() => setIsProfileModalOpen(false)}
                    role="presentation"
                >
                    <section
                        className="profile-modal-window"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="profile-modal-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <header className="profile-modal-header">
                            <div>
                                <p className="profile-modal-kicker">Cuenta SaberLab</p>
                                <h2 id="profile-modal-title">Mi Perfil</h2>
                            </div>
                            <button
                                type="button"
                                className="profile-modal-close"
                                onClick={() => setIsProfileModalOpen(false)}
                                aria-label="Cerrar perfil"
                                title="Cerrar perfil"
                            >
                                <X size={18} />
                            </button>
                        </header>
                        <div className="profile-modal-body">
                            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando perfil...</div>}>
                                <PanelPerfil variant="floating" />
                            </Suspense>
                        </div>
                    </section>
                </div>
            )}

            {/* Tutor Inteligente SaberLab IA Flotante */}
            <SaberLabAiChat />

            {/* FAB Flotante: Vista de Estudiante (Para Docentes / Admin) */}
            {hasTeacherPrivileges && (
                <button
                    type="button"
                    onClick={() => setViewMode(isImpersonating ? 'admin' : 'student')}
                    className={`global-viewmode-fab ${isImpersonating ? 'is-active' : ''}`}
                    title={isImpersonating ? 'Modo Alumno Activo - Toca para volver a Modo Docente' : 'Ver como Alumno - Simular experiencia de estudiante'}
                    aria-label="Alternar Vista de Estudiante"
                >
                    {isImpersonating ? <User size={20} /> : <Eye size={20} />}
                </button>
            )}
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
