import { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Layers, Target, BarChart2, Folder, Wrench, Settings, Shield, BookOpen, X, PenLine, User, ChevronDown, LogOut, Bell, GraduationCap, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useApps } from '../../context/useApps';

const Sidebar = ({ isOpen, closeSidebar, toggleSidebar }) => {
    const { user, signOut } = useAuth();
    const { openLauncher } = useApps();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Datos de usuario
    const userMetadata = user?.user_metadata || {};
    const avatarUrl = userMetadata.avatar_url;
    const fullName = userMetadata.full_name || user?.email?.split('@')[0] || 'Estudiante';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navCategories = [
        {
            title: 'PRINCIPAL',
            items: [
                { name: 'Inicio', path: '/dashboard', icon: <Home size={18} /> },
                { name: 'Mis Cursos', path: '/dashboard/my-courses', icon: <Layers size={18} /> },
                { name: 'Notificaciones', path: '/dashboard/notifications', icon: <Bell size={18} />, badge: 3 },
                { name: 'Evaluaciones', path: '/dashboard/evaluations', icon: <Target size={18} /> },
                { name: 'Progreso', path: '/dashboard/progress', icon: <BarChart2 size={18} /> }
            ]
        },
        {
            title: 'RECURSOS',
            items: [
                { name: 'Recursos', path: '/dashboard/resources', icon: <Folder size={18} /> },
                { name: 'Widgets', action: openLauncher, icon: <Wrench size={18} /> }
            ]
        },
        {
            title: 'ADMIN',
            items: [
                { name: 'Gestión de Cursos', path: '/dashboard/courses', icon: <GraduationCap size={18} /> },
                { name: 'Plataforma', path: '/dashboard/admin', icon: <Shield size={18} /> }
            ]
        }
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
                    <div key={catIndex} style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{
                            fontSize: '0.70rem',
                            fontWeight: 700,
                            color: 'rgba(255,255,255,0.4)',
                            letterSpacing: '1px',
                            marginBottom: '0.75rem',
                            paddingLeft: '1rem',
                            textTransform: 'uppercase'
                        }}>
                            {category.title}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {category.items.map((item) => {
                                const renderIcon = () => (
                                    <span className="nav-icon" style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{
                                            color: item.path === '/dashboard' ? '#ff6b6b' :
                                                item.path?.includes('courses') ? '#4ade80' :
                                                    item.path?.includes('evaluations') ? '#f43f5e' :
                                                        item.path?.includes('progress') ? '#60a5fa' :
                                                            item.path?.includes('resources') ? '#facc15' :
                                                                !item.path ? '#a855f7' : // Herramientas
                                                                    item.path?.includes('gadgets') ? '#a78bfa' :
                                                                        item.path?.includes('settings') ? '#cbd5e1' :
                                                                            '#38bdf8'
                                        }}>
                                            {item.icon}
                                        </div>
                                    </span>
                                );

                                if (item.action) {
                                    return (
                                        <button
                                            key={item.name}
                                            onClick={() => { item.action(); closeSidebar(); }}
                                            className="nav-item"
                                            style={{
                                                padding: '0.75rem 1rem',
                                                fontSize: '0.9rem',
                                                background: 'transparent',
                                                border: 'none',
                                                textAlign: 'left',
                                                width: '100%',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {renderIcon()}
                                            <span className="nav-text" style={{ flex: 1, color: 'var(--text-secondary)' }}>{item.name}</span>
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
                                        style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}
                                    >
                                        {renderIcon()}
                                        <span className="nav-text" style={{ flex: 1, color: 'var(--text-secondary)' }}>{item.name}</span>

                                        {item.badge && (
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

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div className="sidebar-user-container" ref={menuRef} style={{ position: 'relative' }}>
                    <div
                        className="user-profile"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.5rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: isMenuOpen ? 'rgba(255,255,255,0.05)' : 'transparent'
                        }}
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
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginLeft: '0.75rem', color: 'var(--text-primary)' }}>
                            {fullName}
                        </span>
                        <ChevronDown size={16} style={{ color: 'var(--text-secondary)', transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }} />
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
                            <Link to="/dashboard/settings" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                                <Settings size={16} />
                                Configuración
                            </Link>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item text-danger" onClick={signOut} style={{ width: '100%' }}>
                                <LogOut size={16} />
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Pestañita flotante que se mueve con el panel */}
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
