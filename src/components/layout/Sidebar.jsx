import { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Home, Layers, Target, BarChart2, Folder, Wrench, Settings, Shield, User, ChevronDown, LogOut, Bell, GraduationCap, ChevronRight, ChevronLeft, Award, Gift, Eye, Activity, ArrowLeft, BookOpen, FileCheck, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useApps } from '../../context/useApps';
import { api } from '../../lib/api';
import { getCourseByIdentifier } from '../../data/coursesData';
import CourseNavTree from '../course/CourseNavTree';

const Sidebar = ({ isOpen, closeSidebar, toggleSidebar, isCompact = false, toggleCompact = null }) => {
    const { user, profile, signOut, unreadNotificationsCount, pendingAccessRequestsCount, enrolledCourses, isStaffUser, isImpersonating, toggleViewMode, viewMode, canAccessCertificate } = useAuth();
    const { openLauncher } = useApps();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [publishedEvaluationsCount, setPublishedEvaluationsCount] = useState(0);
    const menuRef = useRef(null);
    const location = useLocation();

    // Detectar si el usuario está dentro de una lección de un curso
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const isMyCoursesPath = pathSegments[0] === 'dashboard' && pathSegments[1] === 'my-courses';
    const courseIdParam = isMyCoursesPath ? pathSegments[2] : null;
    const moduleIdParam = isMyCoursesPath ? pathSegments[3] : null;
    const lessonIdParam = isMyCoursesPath ? pathSegments[4] : null;

    const activeCourse = courseIdParam ? getCourseByIdentifier(courseIdParam) : null;
    const isInsideLesson = Boolean(activeCourse && moduleIdParam && lessonIdParam);
    const currentLessonId = useMemo(() => {
        if (!isInsideLesson || !activeCourse) return '';
        if (lessonIdParam.includes('-')) return lessonIdParam.toLowerCase();
        const cleanMod = moduleIdParam ? moduleIdParam.toLowerCase() : 'm1';
        const cleanLes = lessonIdParam.toLowerCase().startsWith('l') ? lessonIdParam.toLowerCase() : `l${lessonIdParam.toLowerCase()}`;
        return `${activeCourse.abbr.toLowerCase()}-${cleanMod}-${cleanLes}`;
    }, [isInsideLesson, activeCourse, moduleIdParam, lessonIdParam]);

    const isStaff = isStaffUser && !isImpersonating;
    const isAdmin = profile?.role === 'admin' && !isImpersonating;
    const userMetadata = user?.user_metadata || {};
    const avatarUrl = profile?.avatar_url || userMetadata.avatar_url;
    const googleName = userMetadata.name || userMetadata.full_name || '';
    const firstName = profile?.first_name || userMetadata.given_name || googleName.split(' ')[0] || '';
    const lastName = profile?.last_name || userMetadata.family_name || googleName.split(' ').slice(1).join(' ') || '';
    const fullName = (firstName && lastName) ? `${firstName} ${lastName}` : profile?.full_name || googleName || user?.email?.split('@')[0] || 'Estudiante';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchPublishedEvaluationsCount = async () => {
            if (!isStaff && (!user || enrolledCourses.length === 0)) {
                setPublishedEvaluationsCount(0);
                return;
            }

            try {
                const { data } = await api('/evaluations');
                const published = (data || []).filter(e => e.is_published === 1 || e.is_published === true);
                setPublishedEvaluationsCount(published.length);
            } catch (error) {
                console.error('Error fetching published evaluations count:', error);
            }
        };

        fetchPublishedEvaluationsCount();
    }, [isStaff, user, enrolledCourses]);

    const navCategories = [
        {
            title: 'PRINCIPAL',
            items: [
                { name: 'Inicio', path: '/dashboard', icon: <Home size={18} /> },
                { name: 'Mis Cursos', path: '/dashboard/my-courses', icon: <Layers size={18} /> },
                { name: 'Evaluaciones', path: '/dashboard/evaluations', icon: <FileCheck size={18} />, badge: publishedEvaluationsCount },
                { name: 'Calificaciones', path: '/dashboard/grades', icon: <Award size={18} /> },
                { name: 'Notificaciones', path: '/dashboard/notifications', icon: <Bell size={18} />, badge: pendingAccessRequestsCount }
            ]
        },
        {
            title: 'SEMILLERO SIMI3D',
            items: [
                { name: 'Espacio SIMI3D', path: '/dashboard/simi', icon: <Layers size={18} />, badge: 'I+D+i' }
            ]
        },
        {
            title: 'RECURSOS',
            items: [
                { name: 'Recursos', path: '/dashboard/resources', icon: <Folder size={18} /> },
                ...(isStaff ? [{ name: 'Widgets', action: openLauncher, icon: <Wrench size={18} /> }] : [])
            ]
        },
        ...(isStaff ? [{
            title: isAdmin ? 'ADMIN' : ['leader', 'lider', 'semillero_leader'].includes(profile?.role) ? 'LÍDER' : 'DOCENTE',
            items: [
                { name: 'Analítica', path: '/dashboard/analytics', icon: <Activity size={18} /> },
                { name: 'Certificados', path: '/dashboard/certificate/ee', icon: <Award size={18} /> }
            ]
        }] : (canAccessCertificate ? [{
            title: 'CERTIFICACIÓN',
            items: [
                { name: 'Certificados', path: '/dashboard/certificate/ee', icon: <Award size={18} /> }
            ]
        }] : []))
    ];

    return (
        <aside className={`sidebar glass-panel ${isOpen ? 'open' : ''} ${isCompact ? 'compact' : ''}`}>
            {toggleCompact && (
                <button
                    type="button"
                    className="sidebar-compact-toggle"
                    onClick={toggleCompact}
                    title={isCompact ? "Expandir barra lateral" : "Colapsar a solo iconos"}
                >
                    {isCompact ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
                </button>
            )}
            <div className="sidebar-header" style={{ marginBottom: isInsideLesson ? '1rem' : '1.5rem' }}>
                {isInsideLesson && activeCourse ? (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <Link
                            to="/dashboard/my-courses"
                            className="sidebar-back-course"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: activeCourse.color || '#38bdf8',
                                fontSize: '0.8rem',
                                fontWeight: 750,
                                textDecoration: 'none',
                                padding: isCompact ? '6px' : '5px 12px 5px 8px',
                                borderRadius: '20px',
                                background: `color-mix(in srgb, ${activeCourse.color || '#38bdf8'} 14%, var(--surface-card))`,
                                border: `1px solid color-mix(in srgb, ${activeCourse.color || '#38bdf8'} 32%, var(--border-subtle))`,
                                boxShadow: `0 2px 8px color-mix(in srgb, ${activeCourse.color || '#38bdf8'} 15%, transparent)`,
                                width: 'fit-content',
                                cursor: 'pointer'
                            }}
                            title="Volver a Mis Cursos"
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: `color-mix(in srgb, ${activeCourse.color || '#38bdf8'} 22%, transparent)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <ArrowLeft size={12} strokeWidth={2.8} />
                            </div>
                            {!isCompact && <span style={{ letterSpacing: '0.2px' }}>Mis Cursos</span>}
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: isCompact ? 'center' : 'flex-start' }}>
                            <div style={{
                                width: isCompact ? '34px' : '38px',
                                height: isCompact ? '34px' : '38px',
                                borderRadius: '12px',
                                background: `${activeCourse.color || '#38bdf8'}20`,
                                color: activeCourse.color || '#38bdf8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <BookOpen size={18} />
                            </div>
                            {!isCompact && (
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, color: 'var(--text-heading)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {activeCourse.name}
                                    </h3>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {activeCourse.abbr} • Temario
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', justifyContent: isCompact ? 'center' : 'flex-start' }}>
                        <img
                            src="https://i.postimg.cc/KY1FZC3G/Logo_Nuevo.png"
                            alt="SaberLab Logo"
                            style={{ height: isCompact ? '34px' : '40px', width: 'auto', transition: 'all 0.2s ease' }}
                        />
                        {!isCompact && <h2 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0 }}>SaberLab</h2>}
                    </div>
                )}
            </div>

            <nav className="sidebar-nav" style={{ overflowY: 'auto', paddingRight: isInsideLesson ? '0' : '4px' }}>
                {isInsideLesson && activeCourse ? (
                    <CourseNavTree
                        subject={activeCourse}
                        currentLessonId={currentLessonId}
                        closeSidebar={closeSidebar}
                        isCompact={isCompact}
                    />
                ) : (
                    navCategories.map((category, catIndex) => (
                        <div key={catIndex} className="sidebar-section" style={{ marginBottom: '1.5rem' }}>
                            <h3 className="sidebar-section-title">
                                {category.title}
                            </h3>
                            <div className="sidebar-section-list">
                                {category.items.map((item) => {
                                    const renderIcon = () => (
                                        <span className="nav-icon" style={{ display: 'flex', alignItems: 'center', minWidth: '24px', justifyContent: 'center', position: 'relative' }}>
                                            <div style={{
                                                color: item.path === '/dashboard' ? '#ff6b6b'
                                                    : item.path?.includes('courses') ? '#4ade80'
                                                        : item.path?.includes('evaluations') ? '#f43f5e'
                                                            : item.path?.includes('progress') ? '#60a5fa'
                                                                : item.path?.includes('resources') ? '#facc15'
                                                                    : !item.path ? '#a855f7'
                                                                        : item.path?.includes('settings') ? '#cbd5e1'
                                                                            : '#38bdf8'
                                            }}>
                                                {item.icon}
                                            </div>
                                            {item.name === 'Evaluaciones' && publishedEvaluationsCount > 0 && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '-2px',
                                                    right: '-2px',
                                                    width: '8px',
                                                    height: '8px',
                                                    backgroundColor: '#22c55e',
                                                    borderRadius: '50%',
                                                    border: '1px solid #1f2937'
                                                }} />
                                            )}
                                        </span>
                                    );

                                    if (item.action) {
                                        return (
                                            <button
                                                key={item.name}
                                                onClick={() => { item.action(); closeSidebar(); }}
                                                className="nav-item"
                                                title={isCompact ? item.name : undefined}
                                            >
                                                {renderIcon()}
                                                {!isCompact && <span className="nav-text">{item.name}</span>}
                                            </button>
                                        );
                                    }

                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            end={item.path === '/dashboard'}
                                            onClick={closeSidebar}
                                            title={isCompact ? item.name : undefined}
                                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                        >
                                            {renderIcon()}
                                            {!isCompact && <span className="nav-text">{item.name}</span>}

                                            {!isCompact && !!item.badge && (
                                                <span style={{
                                                    background: '#f43f5e',
                                                    color: 'white',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    padding: '2px 6px',
                                                    borderRadius: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    minWidth: '20px'
                                                }}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </nav>

            <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div className="sidebar-user-container" ref={menuRef} style={{ position: 'relative' }}>
                    <div
                        className={`user-profile sidebar-user-card ${isMenuOpen ? 'open' : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {avatarUrl ? (
                            <div className="avatar" style={{ padding: 0, overflow: 'hidden', width: '36px', height: '36px', flexShrink: 0 }}>
                                <img
                                    src={avatarUrl}
                                    alt={fullName}
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        ) : (
                            <div className="avatar" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                                <User size={20} color="var(--bg-primary)" />
                            </div>
                        )}
                        {!isCompact && (
                            <div style={{ flex: 1, marginLeft: '0.75rem', overflow: 'hidden' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', color: 'var(--text-primary)' }}>
                                    {fullName}
                                </span>
                                <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    padding: '1px 7px',
                                    borderRadius: '20px',
                                    display: 'inline-block',
                                    marginTop: '2px',
                                    background: isImpersonating 
                                        ? 'rgba(245, 158, 11, 0.2)'
                                        : profile?.role === 'admin' 
                                        ? 'rgba(168,85,247,0.2)' 
                                        : ['leader', 'lider', 'semillero_leader'].includes(profile?.role)
                                        ? 'rgba(6, 182, 212, 0.2)'
                                        : profile?.role === 'teacher' || profile?.role === 'docente' || profile?.role === 'profesor'
                                        ? 'rgba(59,130,246,0.2)' 
                                        : 'rgba(148,163,184,0.15)',
                                    color: isImpersonating 
                                        ? '#fbbf24' 
                                        : profile?.role === 'admin' 
                                        ? '#c084fc' 
                                        : ['leader', 'lider', 'semillero_leader'].includes(profile?.role)
                                        ? '#22d3ee'
                                        : profile?.role === 'teacher' || profile?.role === 'docente' || profile?.role === 'profesor'
                                        ? '#60a5fa' 
                                        : '#94a3b8',
                                    border: `1px solid ${isImpersonating 
                                        ? 'rgba(245, 158, 11, 0.5)' 
                                        : profile?.role === 'admin' 
                                        ? 'rgba(168,85,247,0.4)' 
                                        : ['leader', 'lider', 'semillero_leader'].includes(profile?.role)
                                        ? 'rgba(6, 182, 212, 0.5)'
                                        : profile?.role === 'teacher' || profile?.role === 'docente' || profile?.role === 'profesor'
                                        ? 'rgba(59,130,246,0.4)' 
                                        : 'rgba(148,163,184,0.2)'}`,
                                    textTransform: 'capitalize',
                                    letterSpacing: '0.5px'
                                }}>
                                    {isImpersonating 
                                        ? 'Vista Estudiante 👁️' 
                                        : profile?.role === 'admin' 
                                        ? 'Admin' 
                                        : ['leader', 'lider', 'semillero_leader'].includes(profile?.role) 
                                        ? '🌟 Líder Semillero' 
                                        : profile?.role === 'teacher' || profile?.role === 'profesor' 
                                        ? 'Docente' 
                                        : profile?.role || 'Estudiante'}
                                </span>
                            </div>
                        )}
                        {!isCompact && (
                            <ChevronDown size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0, transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }} />
                        )}
                    </div>

                    {isMenuOpen && (
                        <div className="profile-dropdown glass-panel sidebar-dropdown" style={{
                            position: 'absolute',
                            bottom: isCompact ? '0px' : 'calc(100% + 10px)',
                            top: 'auto',
                            left: isCompact ? 'calc(100% + 14px)' : 0,
                            width: isCompact ? '240px' : '100%',
                            minWidth: '230px',
                            transformOrigin: isCompact ? 'bottom left' : 'bottom center',
                            animation: isCompact ? 'slideRight 0.2s ease forwards' : 'slideUp 0.2s ease forwards',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.45)',
                            zIndex: 999999
                        }}>
                            <style>
                                {`
                                    @keyframes slideUp {
                                        from { opacity: 0; transform: translateY(10px); }
                                        to { opacity: 1; transform: translateY(0); }
                                    }
                                    @keyframes slideRight {
                                        from { opacity: 0; transform: translateX(-10px); }
                                        to { opacity: 1; transform: translateX(0); }
                                    }
                                `}
                            </style>
                            <div className="dropdown-header">
                                <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0, color: 'var(--text-primary)' }}>{fullName}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, wordBreak: 'break-all' }}>{user?.email}</p>
                            </div>
                            <div className="dropdown-divider"></div>
                            {isStaffUser && (
                                <>
                                    <button 
                                        className="dropdown-item" 
                                        onClick={() => { toggleViewMode(); setIsMenuOpen(false); }}
                                        style={{ 
                                            color: isImpersonating ? '#c084fc' : '#38bdf8', 
                                            width: '100%',
                                            background: isImpersonating ? 'rgba(168,85,247,0.1)' : 'rgba(56,189,248,0.1)',
                                            borderRadius: '8px',
                                            marginBottom: '4px',
                                            fontWeight: 600
                                        }}
                                    >
                                        {isImpersonating ? (
                                            <>
                                                <Shield size={16} color="#c084fc" />
                                                <span>Volver a Modo Admin</span>
                                            </>
                                        ) : (
                                            <>
                                                <Eye size={16} color="#38bdf8" />
                                                <span>Ver como Estudiante</span>
                                            </>
                                        )}
                                    </button>
                                    <div className="dropdown-divider"></div>
                                </>
                            )}
                            <Link to="/dashboard/profile" className="dropdown-item" onClick={() => { setIsMenuOpen(false); closeSidebar(); }}>
                                <User size={16} />
                                Mi Perfil
                            </Link>
                            <Link to="/dashboard/certificate/ee" className="dropdown-item" onClick={() => { setIsMenuOpen(false); closeSidebar(); }}>
                                <Award size={16} />
                                Certificados
                            </Link>
                            {isAdmin && (
                                <Link to="/dashboard/settings" className="dropdown-item" onClick={() => { setIsMenuOpen(false); closeSidebar(); }}>
                                    <Settings size={16} />
                                    Configuración
                                </Link>
                            )}
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item text-danger" onClick={signOut} style={{ width: '100%' }}>
                                <LogOut size={16} />
                                Cerrar sesion
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <button
                className="mobile-sidebar-handle"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSidebar();
                }}
            >
                {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
        </aside>
    );
};

export default Sidebar;
