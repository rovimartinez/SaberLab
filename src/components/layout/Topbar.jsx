import { Bell, User, Search, Menu } from 'lucide-react';

const Topbar = ({ toggleSidebar }) => {
    return (
        <header className="topbar glass-panel">
            <div className="topbar-left">
                <button className="icon-btn mobile-menu-btn" onClick={toggleSidebar}>
                    <Menu size={20} />
                </button>
                <div className="topbar-search">
                    <Search size={18} className="search-icon" style={{ opacity: 0.5 }} />
                    <input
                        type="text"
                        placeholder="Buscar cursos..."
                        className="search-input"
                    />
                </div>
            </div>
            <div className="topbar-actions">
                <button className="icon-btn">
                    <Bell size={20} />
                </button>
                <div className="user-profile">
                    <div className="avatar">
                        <User size={20} color="var(--bg-primary)" />
                    </div>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Estudiante</span>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
