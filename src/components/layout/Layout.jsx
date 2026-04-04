import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { WhiteboardProvider } from '../../context/WhiteboardContext';
import { AppsProvider } from '../../context/AppsContext';
import './Layout.css';

const LayoutContent = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const isEvaluationRoute = /^\/dashboard\/evaluations\/[^/]+$/.test(location.pathname);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    if (isEvaluationRoute) {
        return (
            <div className="app-layout">
                <div className="main-content">
                    <main className="page-content animate-fade-in">
                        <Outlet />
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <Sidebar 
                isOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar}
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
