import { createContext, useEffect, useState } from 'react';
import { useWhiteboard } from './useWhiteboard';
import { WidgetsOverlay } from '../pages/PanelWidgets';

export const AppsContext = createContext();

export const AppsProvider = ({ children }) => {
    const { openWhiteboard } = useWhiteboard();
    const [isLauncherOpen, setIsLauncherOpen] = useState(false);
    const [openGadgets, setOpenGadgets] = useState({});
    const [autoCloseLauncher, setAutoCloseLauncher] = useState(true);

    useEffect(() => {
        const saved = window.localStorage.getItem('widgets-launcher-auto-close');
        if (saved !== null) {
            setAutoCloseLauncher(saved === 'true');
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem('widgets-launcher-auto-close', String(autoCloseLauncher));
    }, [autoCloseLauncher]);

    const openLauncher = () => setIsLauncherOpen(true);
    const closeLauncher = () => setIsLauncherOpen(false);

    const openGadget = (id) => {
        if (id === 'whiteboard') {
            openWhiteboard();
            if (autoCloseLauncher) closeLauncher();
            return;
        }

        setOpenGadgets((prev) => ({ ...prev, [id]: true }));
        if (autoCloseLauncher) closeLauncher();
    };

    const closeGadget = (id) => {
        setOpenGadgets((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    return (
        <AppsContext.Provider
            value={{
                isLauncherOpen,
                openLauncher,
                closeLauncher,
                openGadget,
                closeGadget,
                openGadgets,
                autoCloseLauncher,
                setAutoCloseLauncher
            }}
        >
            {children}
            <WidgetsOverlay
                isLauncherOpen={isLauncherOpen}
                closeLauncher={closeLauncher}
                openGadget={openGadget}
                openApps={openGadgets}
                closeGadget={closeGadget}
                autoCloseLauncher={autoCloseLauncher}
                setAutoCloseLauncher={setAutoCloseLauncher}
            />
        </AppsContext.Provider>
    );
};
