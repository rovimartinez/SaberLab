import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { WhiteboardProvider } from '../../context/WhiteboardContext';
import { AppsProvider } from '../../context/AppsContext';
import '../../styles/Layout.css';

const LayoutContent = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const isEvaluationRoute = /^\/dashboard\/evaluations\/[^/]+$/.test(location.pathname);
    const isPracticeEvaluation = location.pathname.includes('re-m1-e2');
    
    const [isEvaluationMode, setIsEvaluationMode] = useState(() => {
        return localStorage.getItem('evaluationStarted') === 'true';
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const stored = localStorage.getItem('evaluationStarted');
            setIsEvaluationMode(stored === 'true');
        }, 200);
        return () => clearInterval(interval);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    const showSidebar = !isEvaluationRoute || isPracticeEvaluation || !isEvaluationMode;

    return (
        <div className="app-layout">
            {showSidebar && (
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    toggleSidebar={toggleSidebar}
                    closeSidebar={() => setIsSidebarOpen(false)} 
                />
            )}
            {isSidebarOpen && showSidebar && (
                <div className="mobile-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            <div className="main-content">
                {(showSidebar || !isEvaluationRoute) && <Topbar toggleSidebar={toggleSidebar} />}
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
