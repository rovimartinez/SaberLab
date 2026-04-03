import React, { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Calculator, Circle, Clock, Cpu, Maximize2, Minimize2, PenLine, Ruler, Target, Wrench, X, Zap } from 'lucide-react';
import ArduinoIDE from '../components/widgets/ArduinoIDE';
import RuletaWidget from '../components/widgets/Ruleta';
import PizarraMagica from '../components/widgets/PizarraMagica';
import Semaforo from '../components/widgets/Semaforo';
import Calculadora from '../components/widgets/Calculadora';
import Conversor from '../components/widgets/Conversor';
import Reloj from '../components/widgets/Reloj';
import LeyDeOhm from '../components/widgets/LeyDeOhm';
import './Widgets.css';

const FloatingGadget = ({ gadget, children, onClose, width = 360, height = 450, defaultMaximized = false }) => {
    const [position, setPosition] = useState({
        x: Math.max(0, (window.innerWidth - width) / 2),
        y: Math.max(0, (window.innerHeight - height) / 2)
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isMaximized, setIsMaximized] = useState(defaultMaximized);
    const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            setPosition({
                x: dragRef.current.initialX + (e.clientX - dragRef.current.startX),
                y: dragRef.current.initialY + (e.clientY - dragRef.current.startY)
            });
        };

        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleDragStart = (e) => {
        if (isMaximized) return;
        e.preventDefault();
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: position.x,
            initialY: position.y
        };
    };

    return (
        <div
            className="floating-gadget"
            style={isMaximized
                ? { left: '1rem', top: '1rem', width: 'calc(100vw - 2rem)', height: 'calc(100vh - 2rem)' }
                : { left: position.x, top: position.y, width: width + 'px', height: height + 'px' }}
        >
            <div className="floating-header" style={{ background: gadget.id === 'arduino' ? '#2b313a' : gadget.color }} onMouseDown={handleDragStart}>
                {gadget.icon}
                <span>{gadget.name}</span>
                <div className="floating-actions">
                    <button onClick={() => setIsMaximized((prev) => !prev)}>
                        {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                    </button>
                    <button onClick={() => onClose(gadget.id)}><X size={14} /></button>
                </div>
            </div>
            <div className={`floating-content ${gadget.id === 'widgets' ? 'floating-content-launcher' : ''} ${gadget.id === 'arduino' ? 'floating-content-arduino' : ''} ${gadget.id === 'calculator' ? 'floating-content-calculator' : ''} ${gadget.id === 'converter' ? 'floating-content-converter' : ''} ${gadget.id === 'timer' ? 'floating-content-clock' : ''} ${gadget.id === 'roulette' ? 'floating-content-roulette' : ''} ${gadget.id === 'traffic' ? 'floating-content-traffic' : ''} ${gadget.id === 'ohms' ? 'floating-content-ohms' : ''}`}>
                {children}
            </div>
        </div>
    );
};

export const gadgetsCatalog = [
    { id: 'calculator', name: 'Calculadora', icon: <Calculator size={18} />, color: '#a855f7' },
    { id: 'converter', name: 'Conversor', icon: <Ruler size={18} />, color: '#3b82f6' },
    { id: 'timer', name: 'Reloj', icon: <Clock size={18} />, color: '#f97316' },
    { id: 'roulette', name: 'Ruleta Pro', icon: <Target size={18} />, color: '#f43f5e' },
    { id: 'traffic', name: 'Semáforo', icon: <Circle size={18} />, color: '#f59e0b' },
    { id: 'ohms', name: 'Ley de Ohm', icon: <Zap size={18} />, color: '#10b981' },
    { id: 'whiteboard', name: 'Pizarra', icon: <PenLine size={18} />, color: '#ec4899' },
    { id: 'arduino', name: 'Arduino IDE', icon: <Cpu size={18} />, color: '#22c55e' }
];

const AppsLauncherPanel = ({ openGadget, autoCloseLauncher, setAutoCloseLauncher }) => (
    <div className="gadgets-launcher">
        <div className="gadgets-grid gadgets-grid-launcher">
            {gadgetsCatalog.map(gadget => (
                <button
                    key={gadget.id}
                    className="gadget-icon-btn"
                    onClick={() => openGadget(gadget.id)}
                    style={{ '--gadget-color': gadget.color }}
                >
                    <div className="gadget-icon" style={{ '--gadget-tint': `${gadget.color}22`, color: gadget.color }}>
                        {gadget.icon}
                    </div>
                    <span className="gadget-icon-name">{gadget.name}</span>
                </button>
            ))}
        </div>
        <div className="gadgets-launcher-footer">
            <span className="gadgets-launcher-footer-label">
                Cerrar al abrir: <strong>{autoCloseLauncher ? 'Auto' : 'Manual'}</strong>
            </span>
            <button
                type="button"
                className={`launcher-switch ${autoCloseLauncher ? 'active' : ''}`}
                onClick={() => setAutoCloseLauncher((prev) => !prev)}
                aria-pressed={autoCloseLauncher}
                aria-label="Cambiar cierre automático del launcher"
            >
                <span className="launcher-switch-thumb" />
            </button>
        </div>
    </div>
);

export const WidgetsOverlay = ({ isLauncherOpen, closeLauncher, openGadget, openApps, closeGadget, autoCloseLauncher, setAutoCloseLauncher }) => (
    <>
        {isLauncherOpen && (
            <FloatingGadget
                gadget={{ id: 'widgets', name: 'Widgets', icon: <Wrench size={18} />, color: '#24344d' }}
                onClose={() => closeLauncher('widgets')}
                width={470}
                height={390}
            >
                <AppsLauncherPanel
                    openGadget={openGadget}
                    autoCloseLauncher={autoCloseLauncher}
                    setAutoCloseLauncher={setAutoCloseLauncher}
                />
            </FloatingGadget>
        )}

        {openApps.calculator && (
            <FloatingGadget gadget={gadgetsCatalog.find(g => g.id === 'calculator')} onClose={closeGadget} width={360} height={540}>
                <Calculadora />
            </FloatingGadget>
        )}

        {openApps.converter && (
            <FloatingGadget gadget={gadgetsCatalog.find(g => g.id === 'converter')} onClose={closeGadget} width={560} height={520}>
                <Conversor />
            </FloatingGadget>
        )}

        {openApps.timer && (
            <FloatingGadget gadget={gadgetsCatalog.find(g => g.id === 'timer')} onClose={closeGadget} width={420} height={600}>
                <Reloj />
            </FloatingGadget>
        )}

        {openApps.roulette && (
            <FloatingGadget gadget={gadgetsCatalog.find(g => g.id === 'roulette')} onClose={closeGadget} width={500} height={750} defaultMaximized={true}>
                <RuletaWidget />
            </FloatingGadget>
        )}

        {openApps.traffic && (
            <FloatingGadget gadget={gadgetsCatalog.find(g => g.id === 'traffic')} onClose={closeGadget} width={370} height={500}>
                <Semaforo />
            </FloatingGadget>
        )}

        {openApps.ohms && (
            <FloatingGadget gadget={gadgetsCatalog.find(g => g.id === 'ohms')} onClose={closeGadget} width={500} height={500}>
                <LeyDeOhm />
            </FloatingGadget>
        )}

        {openApps.whiteboard && (
            <FloatingGadget gadget={gadgetsCatalog.find(g => g.id === 'whiteboard')} onClose={closeGadget} width={1100} height={700} defaultMaximized={true}>
                <PizarraMagica />
            </FloatingGadget>
        )}

        {openApps.arduino && (
            <FloatingGadget gadget={gadgetsCatalog.find(g => g.id === 'arduino')} onClose={closeGadget} width={1100} height={700} defaultMaximized={false}>
                <ArduinoIDE />
            </FloatingGadget>
        )}

    </>
);



const Widgets = () => <Navigate to="/dashboard" replace />;

export default Widgets;


