import { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Layers, Target, BarChart2, Folder, Wrench, Settings, Shield, User, ChevronDown, LogOut, Bell, GraduationCap, ChevronRight, ChevronLeft, Award, Gift } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useApps } from '../../context/useApps';
import { api } from '../../lib/api';

const Sidebar = ({ isOpen, closeSidebar, toggleSidebar }) => {
    const { user, profile, signOut, unreadNotificationsCount, pendingAccessRequestsCount, enrolledCourses } = useAuth();
    const { openLauncher } = useApps();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [publishedEvaluationsCount, setPublishedEvaluationsCount] = useState(0);
    const menuRef = useRef(null);

    const isAdmin = profile?.role === 'admin';
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
            if (!isAdmin && (!user || enrolledCourses.length === 0)) {
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
    }, [isAdmin, user, enrolledCourses]);

    const navCategories = [
        {
            title: 'PRINCIPAL',
            items: [
                { name: 'Inicio', path: '/dashboard', icon: <Home size={18} /> },
                { name: 'Mis Cursos', path: '/dashboard/my-courses', icon: <Layers size={18} /> },
                { name: 'Notificaciones', path: '/dashboard/notifications', icon: <Bell size={18} />, badge: pendingAccessRequestsCount },
                { name: 'Evaluaciones', path: '/dashboard/evaluations', icon: <Target size={18} /> },
                { name: 'Progreso', path: '/dashboard/progress', icon: <BarChart2 size={18} /> }
            ]
        },
        {
            title: 'RECURSOS',
            items: [
                { name: 'Recursos', path: '/dashboard/resources', icon: <Folder size={18} /> },
                { name: 'Certificados', path: '/dashboard/certificate/re', icon: <Award size={18} /> }
            ]
        },
        ...(isAdmin ? [{
            title: 'ADMIN',
            items: [
                { name: 'Gestión', path: '/dashboard/admin-panel', icon: <Shield size={18} /> },
            ]
        }] : [])
    ];

    return (
        <aside className={`sidebar glass-panel ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                        src="https://i.postimg.cc/KY1FZC3G/Logo_Nuevo.png"
                        alt="SaberLab Logo"
                        style={{ height: '40px', width: 'auto' }}
                    />
                    <h2 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0 }}>SaberLab</h2>
                </div>
            </div>

            <nav className="sidebar-nav" style={{ overflowY: 'auto', paddingRight: '4px' }}>
                {navCategories.map((category, catIndex) => (
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
                                        >
                                            {renderIcon()}
                                            <span className="nav-text">{item.name}</span>
                                        </button>
                                    );
                                }

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path === '/dashboard'}
                                        onClick={closeSidebar}
                                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                    >
                                        {renderIcon()}
                                        <span className="nav-text">{item.name}</span>

                                        {!!item.badge && (
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
                ))}
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
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        ) : (
                            <div className="avatar" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                                <User size={20} color="var(--bg-primary)" />
                            </div>
                        )}
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
                                background: profile?.role === 'admin' ? 'rgba(168,85,247,0.2)' : profile?.role === 'teacher' ? 'rgba(59,130,246,0.2)' : 'rgba(148,163,184,0.15)',
                                color: profile?.role === 'admin' ? '#c084fc' : profile?.role === 'teacher' ? '#60a5fa' : '#94a3b8',
                                border: `1px solid ${profile?.role === 'admin' ? 'rgba(168,85,247,0.4)' : profile?.role === 'teacher' ? 'rgba(59,130,246,0.4)' : 'rgba(148,163,184,0.2)'}`,
                                textTransform: 'capitalize',
                                letterSpacing: '0.5px'
                            }}>
                                {profile?.role || 'Estudiante'}
                            </span>
                        </div>
                        <ChevronDown size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0, transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }} />
                    </div>

                    {isMenuOpen && (
                        <div className="profile-dropdown glass-panel sidebar-dropdown" style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 10px)',
                            top: 'auto',
                            left: 0,
                            width: '100%',
                            transformOrigin: 'bottom center',
                            animation: 'slideUp 0.2s ease forwards',
                            boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.4)'
                        }}>
                            <style>
                                {`
                                    @keyframes slideUp {
                                        from { opacity: 0; transform: translateY(10px); }
                                        to { opacity: 1; transform: translateY(0); }
                                    }
                                `}
                            </style>
                            <div className="dropdown-header">
                                <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0, color: 'var(--text-primary)' }}>{fullName}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, wordBreak: 'break-all' }}>{user?.email}</p>
                            </div>
                            <div className="dropdown-divider"></div>
                            <Link to="/dashboard/profile" className="dropdown-item" onClick={() => { setIsMenuOpen(false); closeSidebar(); }}>
                                <User size={16} />
                                Mi Perfil
                            </Link>
                            <Link to="/dashboard/settings" className="dropdown-item" onClick={() => { setIsMenuOpen(false); closeSidebar(); }}>
                                <Settings size={16} />
                                Configuracion
                            </Link>
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
