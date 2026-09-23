import React from 'react';
import { createPortal } from 'react-dom';
import { X, Zap } from 'lucide-react';

const ProfileModalContent = React.lazy(() => import('./ProfileModalContent'));
const StudyModalContent = React.lazy(() => import('./StudyModalContent'));
const CoursesModalContent = React.lazy(() => import('./CoursesModalContent'));
const ActivitiesModalContent = React.lazy(() => import('./ActivitiesModalContent'));
const GradesModalContent = React.lazy(() => import('./GradesModalContent'));
const PanelNotificaciones = React.lazy(() => import('../../../pages/PanelNotificaciones'));
const ComponentsModalContent = React.lazy(() => import('./ComponentsModalContent'));
const PanelRecursos = React.lazy(() => import('../../../pages/PanelRecursos'));

// Componentes de Gestión Independientes (Categoría 4)
const LiveMonitorModalContent = React.lazy(() => import('./LiveMonitorModalContent'));
const InviteLinksModalContent = React.lazy(() => import('./InviteLinksModalContent'));
const PlatformAdminModalContent = React.lazy(() => import('./PlatformAdminModalContent'));
const ExamsManagementModalContent = React.lazy(() => import('./ExamsManagementModalContent'));

export const DashboardAppModal = ({
    activeAppModal,
    onClose,
    allApps = [],
    selectedModalCourse,
    setSelectedModalCourse,
    selectedCourseId,
    setSelectedCourseId,
    availableCourses = [],
    mainCourseDef,
    lessonsCompleted,
    completedLessonsMap,
    lessonVisibility,
    expandedModules,
    toggleModuleExpand,
    // Perfil
    profile,
    fullName,
    user,
    userMetadata,
    isStaff,
    streakDays,
    rank,
    activeTheme,
    handleThemeSelect,
    joinGroupCode,
    setJoinGroupCode,
    joinGroupError,
    setJoinGroupError,
    joinGroupSuccess,
    setJoinGroupSuccess,
    isJoiningGroup,
    handleJoinGroupSubmit,
    enrolledCourses,
    // Constancia & Analítica
    totalWeeklyHours,
    weeklyGoalHours,
    weeklyGoalPercent,
    weeklyActivity,
    maxHours,
    practiceMins,
    practicePercent,
    theoryMins,
    theoryPercent,
    formatMins,
    // Exámenes & Calificaciones
    courseGroups,
    filteredCourseGroups,
    modalCourseFilter,
    setModalCourseFilter,
    upcomingActivities,
    getCourseIcon,
    // Widgets & Gadgets
    widgetsCatalog = [],
    openLauncher,
    gadgets = [],
    navigate
}) => {
    const [platformSubSection, setPlatformSubSection] = React.useState('users');

    if (!activeAppModal || typeof document === 'undefined') return null;

    const currentApp = allApps.find(a => a.id === activeAppModal);
    if (!currentApp) return null;

    const isCoursesModal = activeAppModal === 'courses';
    const isComponentsModal = activeAppModal === 'components';
    const isResourcesModal = activeAppModal === 'resources';
    const isAdminLargeModal = ['liveMonitor', 'inviteLinks', 'coursesManagement', 'platformAdmin', 'examsManagement'].includes(activeAppModal);

    return createPortal(
        <div className="app-modal-backdrop animate-fade-in" onClick={onClose}>
            <div 
                className={`app-modal-container glass-panel ${isCoursesModal ? 'is-courses-modal' : ''} ${isComponentsModal ? 'is-components-modal' : ''} ${isResourcesModal ? 'is-resources-modal' : ''} ${isAdminLargeModal ? 'is-admin-large-modal' : ''}`} 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Cabecera del Modal */}
                <div className="app-modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div 
                            className="app-modal-icon-glow" 
                            style={{ 
                                background: isCoursesModal && (mainCourseDef?.color || selectedModalCourse?.color) 
                                    ? `linear-gradient(135deg, ${mainCourseDef?.color || selectedModalCourse?.color} 0%, ${(mainCourseDef?.color || selectedModalCourse?.color)}cc 100%)`
                                    : currentApp.gradient,
                                boxShadow: `0 6px 16px ${isCoursesModal && (mainCourseDef?.color || selectedModalCourse?.color) ? `${mainCourseDef?.color || selectedModalCourse?.color}40` : currentApp.shadow}`
                            }}
                        >
                            {isCoursesModal && (mainCourseDef?.icon || selectedModalCourse?.icon)
                                ? (React.isValidElement(mainCourseDef?.icon || selectedModalCourse?.icon)
                                    ? React.cloneElement(mainCourseDef?.icon || selectedModalCourse?.icon, { size: 22, color: '#ffffff' })
                                    : (mainCourseDef?.icon || selectedModalCourse?.icon))
                                : currentApp.icon}
                        </div>
                        <div>
                            <h2 className="app-modal-title">
                                {isCoursesModal 
                                    ? `Plan de Estudios: ${mainCourseDef?.name || selectedModalCourse?.name || currentApp.name}`
                                    : (currentApp.name || currentApp.label)}
                            </h2>
                            <p className="app-modal-subtitle">
                                {isCoursesModal
                                    ? `Módulos, lecciones y retos prácticos de ${mainCourseDef?.name || selectedModalCourse?.name || 'mi curso'}`
                                    : currentApp.desc}
                            </p>
                        </div>
                    </div>
                    <button 
                        className="ranks-modal-close-btn" 
                        onClick={onClose}
                        title="Cerrar modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Cuerpo del Modal */}
                <div className="app-modal-body">
                    <React.Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando módulo...</div>}>
                        {/* APP: MI PERFIL */}
                        {activeAppModal === 'profile' && (
                            <ProfileModalContent
                                profile={profile}
                                fullName={fullName}
                                user={user}
                                userMetadata={userMetadata}
                                isStaff={isStaff}
                                streakDays={streakDays}
                                lessonsCompleted={lessonsCompleted}
                                rank={rank}
                                activeTheme={activeTheme}
                                handleThemeSelect={handleThemeSelect}
                                joinGroupCode={joinGroupCode}
                                setJoinGroupCode={setJoinGroupCode}
                                joinGroupError={joinGroupError}
                                setJoinGroupError={setJoinGroupError}
                                joinGroupSuccess={joinGroupSuccess}
                                setJoinGroupSuccess={setJoinGroupSuccess}
                                isJoiningGroup={isJoiningGroup}
                                handleJoinGroupSubmit={handleJoinGroupSubmit}
                                enrolledCourses={enrolledCourses}
                            />
                        )}

                        {/* APP: CONSTANCIA DE ESTUDIO */}
                        {activeAppModal === 'study' && (
                            <StudyModalContent
                                totalWeeklyHours={totalWeeklyHours}
                                weeklyGoalHours={weeklyGoalHours}
                                weeklyGoalPercent={weeklyGoalPercent}
                                weeklyActivity={weeklyActivity}
                                maxHours={maxHours}
                                practiceMins={practiceMins}
                                practicePercent={practicePercent}
                                theoryMins={theoryMins}
                                theoryPercent={theoryPercent}
                                formatMins={formatMins}
                                streakDays={streakDays}
                            />
                        )}

                        {/* APP: TODOS LOS CURSOS & PLAN DE ESTUDIOS */}
                        {activeAppModal === 'courses' && (
                            <CoursesModalContent
                                availableCourses={availableCourses}
                                selectedCourseId={selectedCourseId}
                                setSelectedCourseId={setSelectedCourseId}
                                selectedModalCourse={selectedModalCourse}
                                setSelectedModalCourse={setSelectedModalCourse}
                                mainCourseDef={mainCourseDef}
                                lessonsCompleted={lessonsCompleted}
                                completedLessonsMap={completedLessonsMap}
                                lessonVisibility={lessonVisibility}
                                expandedModules={expandedModules}
                                toggleModuleExpand={toggleModuleExpand}
                                isStaff={isStaff}
                                onClose={onClose}
                            />
                        )}

                        {/* APP: PRÓXIMAS ACTIVIDADES (EXÁMENES) */}
                        {activeAppModal === 'activities' && (
                            <ActivitiesModalContent
                                courseGroups={courseGroups}
                                filteredCourseGroups={filteredCourseGroups}
                                modalCourseFilter={modalCourseFilter}
                                setModalCourseFilter={setModalCourseFilter}
                                upcomingActivities={upcomingActivities}
                                getCourseIcon={getCourseIcon}
                                isStaff={isStaff}
                                lessonVisibility={lessonVisibility}
                                onClose={onClose}
                            />
                        )}

                        {/* APP: ANALÍTICA */}
                        {activeAppModal === 'analytics' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                <div className="next-mission-box" style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <span style={{ fontSize: '0.88rem', color: 'var(--text-heading)', fontWeight: 800 }}>
                                            🎯 Meta Semanal de Dedicación
                                        </span>
                                        <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 800 }}>
                                            {totalWeeklyHours}h / {weeklyGoalHours}h ({weeklyGoalPercent}%)
                                        </span>
                                    </div>
                                    <div className="progress-bar-bg" style={{ height: '8px' }}>
                                        <div className="progress-bar-fill" style={{ width: `${Math.min(100, weeklyGoalPercent)}%`, background: '#10b981' }} />
                                    </div>
                                </div>

                                <div className="study-telemetry-row">
                                    <div className="telemetry-box">
                                        <span className="telemetry-icon">🧪</span>
                                        <div>
                                            <div className="telemetry-num" style={{ color: '#38bdf8' }}>
                                                {formatMins(practiceMins)} ({practicePercent}%)
                                            </div>
                                            <div className="telemetry-label">Laboratorios y Simulador</div>
                                        </div>
                                    </div>
                                    <div className="telemetry-box">
                                        <span className="telemetry-icon">📖</span>
                                        <div>
                                            <div className="telemetry-num" style={{ color: '#a855f7' }}>
                                                {formatMins(theoryMins)} ({theoryPercent}%)
                                            </div>
                                            <div className="telemetry-label">Teoría y Retos Prácticos</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rank-footer-desc">
                                    <span>Has registrado actividad regular durante <strong>{streakDays} días seguidos</strong> con {lessonsCompleted} lecciones aprobadas.</span>
                                </div>
                            </div>
                        )}

                        {/* APP: WIDGETS */}
                        {activeAppModal === 'widgets' && (
                            <>
                                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                                    Herramientas interactivas de apoyo para proyectar o usar en el aula:
                                </p>
                                <div className="app-items-grid">
                                    {widgetsCatalog.map(w => (
                                        <div
                                            key={w.id}
                                            className="app-grid-item-card"
                                            onClick={() => {
                                                onClose();
                                                openLauncher();
                                            }}
                                            title={`Lanzar ${w.name}`}
                                        >
                                            <div className="app-item-icon-box" style={{ background: `${w.color}20`, border: `1px solid ${w.color}50` }}>
                                                {w.icon}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h4 className="app-item-title">{w.name}</h4>
                                                <p className="app-item-desc">{w.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* APP: RECOMPENSAS */}
                        {activeAppModal === 'rewards' && (
                            <>
                                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                                    Instrumentos y simuladores de laboratorio desbloqueados:
                                </p>
                                <div className="app-items-grid">
                                    {(gadgets || []).slice(0, 6).map(g => (
                                        <div
                                            key={g.id}
                                            className="app-grid-item-card"
                                            onClick={() => {
                                                onClose();
                                                if (navigate) navigate('/dashboard/gadgets');
                                            }}
                                            title={`Abrir ${g.name}`}
                                        >
                                            <div className="app-item-icon-box" style={{ background: `${g.color}20`, border: `1px solid ${g.color}50` }}>
                                                <Zap size={20} color={g.color} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h4 className="app-item-title">{g.name}</h4>
                                                <p className="app-item-desc">{g.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* APP: NOTIFICACIONES */}
                        {activeAppModal === 'notifications' && (
                            <div className="modal-notifications-wrapper" style={{ marginTop: '0.25rem' }}>
                                <PanelNotificaciones isModal={true} />
                            </div>
                        )}

                        {/* APP: CALIFICACIONES */}
                        {activeAppModal === 'grades' && (
                            <GradesModalContent
                                courseGroups={courseGroups}
                                filteredCourseGroups={filteredCourseGroups}
                                modalCourseFilter={modalCourseFilter}
                                setModalCourseFilter={setModalCourseFilter}
                                upcomingActivities={upcomingActivities}
                                getCourseIcon={getCourseIcon}
                                onClose={onClose}
                            />
                        )}

                        {/* APP: COMPONENTES 3D (ROBÓTICA EDUCATIVA) */}
                        {activeAppModal === 'components' && (
                            <ComponentsModalContent
                                mainCourseDef={mainCourseDef}
                                isStaff={isStaff}
                            />
                        )}

                        {/* APP: RECURSOS EDUCATIVOS */}
                        {activeAppModal === 'resources' && (
                            <PanelRecursos 
                                isModal={true} 
                                initialCourse={mainCourseDef?.abbr || selectedModalCourse?.abbr || 'all'}
                            />
                        )}

                        {/* ── CATEGORÍA 4: GESTIÓN & SISTEMA (MODALES INDEPENDIENTES) ── */}

                        {/* 1. En Vivo & Mensajes */}
                        {activeAppModal === 'liveMonitor' && (
                            <LiveMonitorModalContent />
                        )}

                        {/* 2. Enlaces con Tiempo */}
                        {activeAppModal === 'inviteLinks' && (
                            <InviteLinksModalContent />
                        )}

                        {/* 3. Plataforma (Usuarios y Catálogos) */}
                        {activeAppModal === 'platformAdmin' && (
                            <PlatformAdminModalContent />
                        )}

                        {/* 4. Exámenes (Evaluaciones y Creador) */}
                        {activeAppModal === 'examsManagement' && (
                            <ExamsManagementModalContent />
                        )}
                    </React.Suspense>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DashboardAppModal;
