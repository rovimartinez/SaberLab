import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { WhiteboardProvider } from '../../context/WhiteboardContext';
import { GadgetsProvider } from '../../context/GadgetsContext';
import './Layout.css';

const LayoutContent = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    return (
        <div className="app-layout">
            <Sidebar 
                isOpen={isSidebarOpen} 
                closeSidebar={() => setIsSidebarOpen(false)} 
            />
            {isSidebarOpen && (
                <div className="mobile-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            <div className="main-content">
                <Topbar toggleSidebar={toggleSidebar} />
                <main className="page-content animate-fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

import { useState } from 'react';

const Layout = () => {
    return (
        <WhiteboardProvider>
            <GadgetsProvider>
                <LayoutContent />
            </GadgetsProvider>
        </WhiteboardProvider>
    );
};

export default Layout;
