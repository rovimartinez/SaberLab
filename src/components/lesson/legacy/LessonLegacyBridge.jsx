import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ArduinoSimulatorV2 from '../../simulators/RE/ArduinoSimulatorV2';
import LedSimulator from '../../simulators/RE/LedSimulator';

const LessonLegacyBridge = ({ hasSimulator, onShowGuide, onShowArduinoParts }) => {
    const rootsRef = useRef(new Map());

    useEffect(() => {
        window.dispatchShowGuide = () => onShowGuide?.();
        window.showArduinoParts = () => onShowArduinoParts?.();

        return () => {
            delete window.dispatchShowGuide;
            delete window.showArduinoParts;
        };
    }, [onShowArduinoParts, onShowGuide]);

    useEffect(() => {
        if (!hasSimulator) return undefined;

        const mountInto = (containerId, element) => {
            const container = document.getElementById(containerId);
            if (!container || rootsRef.current.has(container)) return;

            const root = createRoot(container);
            root.render(element);
            rootsRef.current.set(container, root);
        };

        const mountLegacySimulators = () => {
            mountInto(
                'led-simulator-container',
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0.5rem' }}>
                    <LedSimulator />
                </div>
            );

            mountInto(
                'arduino-simulator-container',
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <ArduinoSimulatorV2 />
                </div>
            );
        };

        const timeoutId = window.setTimeout(mountLegacySimulators, 500);
        const observer = new MutationObserver(mountLegacySimulators);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.clearTimeout(timeoutId);
            observer.disconnect();
            rootsRef.current.forEach((root) => root.unmount());
            rootsRef.current.clear();
        };
    }, [hasSimulator]);

    return null;
};

export default LessonLegacyBridge;
