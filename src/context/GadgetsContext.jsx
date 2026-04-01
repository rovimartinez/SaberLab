import { createContext, useEffect, useState } from 'react';
import { useWhiteboard } from './useWhiteboard';
import { GadgetsOverlay } from '../pages/Gadgets';

export const GadgetsContext = createContext();

export const GadgetsProvider = ({ children }) => {
    const { openWhiteboard } = useWhiteboard();
    const [isLauncherOpen, setIsLauncherOpen] = useState(false);
    const [openGadgets, setOpenGadgets] = useState({});
    const [autoCloseLauncher, setAutoCloseLauncher] = useState(true);

    useEffect(() => {
        const saved = window.localStorage.getItem('gadgets-launcher-auto-close');
        if (saved !== null) {
            setAutoCloseLauncher(saved === 'true');
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem('gadgets-launcher-auto-close', String(autoCloseLauncher));
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
        <GadgetsContext.Provider
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
            <GadgetsOverlay
                isLauncherOpen={isLauncherOpen}
                closeLauncher={closeLauncher}
                openGadget={openGadget}
                openGadgets={openGadgets}
                closeGadget={closeGadget}
                autoCloseLauncher={autoCloseLauncher}
                setAutoCloseLauncher={setAutoCloseLauncher}
            />
        </GadgetsContext.Provider>
    );
};
