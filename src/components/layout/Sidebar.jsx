import { NavLink } from 'react-router-dom';
import { Home, BookOpen, X, Zap, Bot, PenLine } from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar, toggleWhiteboard }) => {
    const navItems = [
        { name: 'Panel Principal', path: '/dashboard', icon: <Home size={20} /> },
        { name: 'Electricidad y Electrónica Básica', path: '/dashboard/subject/electronica', icon: <Zap size={20} /> },
        { name: 'Robótica Educativa', path: '/dashboard/subject/robotica', icon: <Bot size={20} /> }
    ];

    return (
        <aside className={`sidebar glass-panel ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="logo-icon text-gradient">
                        <BookOpen size={28} />
                    </div>
                    <h2 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0 }}>MegaLab</h2>
                </div>
                <button className="icon-btn mobile-close-btn" onClick={closeSidebar}>
                    <X size={20} />
                </button>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        onClick={closeSidebar}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-text">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <button 
                    onClick={toggleWhiteboard}
                    className="nav-item" 
                    style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(59, 130, 246, 0.2)', width: '100%', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                >
                    <span className="nav-icon"><PenLine size={20} /></span>
                    <span className="nav-text" style={{ fontWeight: 600 }}>Abrir Pizarra</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
