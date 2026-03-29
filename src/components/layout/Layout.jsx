import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Whiteboard from '../Whiteboard';
import './Layout.css';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    return (
        <div className="app-layout">
            <Sidebar 
                isOpen={isSidebarOpen} 
                closeSidebar={() => setIsSidebarOpen(false)} 
                toggleWhiteboard={() => setIsWhiteboardOpen(prev => !prev)}
            />
            {/* Overlay for mobile when sidebar is open */}
            {isSidebarOpen && (
                <div className="mobile-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            <div className="main-content">
                <Topbar toggleSidebar={toggleSidebar} />
                <main className="page-content animate-fade-in">
                    <Outlet />
                </main>
            </div>
            
            {isWhiteboardOpen && (
                <Whiteboard onClose={() => setIsWhiteboardOpen(false)} />
            )}
        </div>
    );
};

export default Layout;
