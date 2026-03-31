import { Menu } from 'lucide-react';

const Topbar = ({ toggleSidebar }) => {
    return (
        <>
            <style>
                {`
                    @media (min-width: 768px) {
                        .topbar-container {
                            display: none !important;
                        }
                    }
                    .topbar-container {
                        display: flex;
                        justify-content: flex-start;
                        padding: 1rem;
                        background: transparent;
                        border: none;
                    }
                `}
            </style>
            <header className="topbar-container">
                <button className="icon-btn mobile-menu-btn" onClick={toggleSidebar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}>
                    <Menu size={24} />
                </button>
            </header>
        </>
    );
};

export default Topbar;
