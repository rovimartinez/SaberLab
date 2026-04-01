import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { Calculator, Clock, Ruler, Zap, PenLine, X, RotateCcw, Play, Pause, Bell, Volume2, VolumeX, Cpu, Lightbulb, AlarmClock, Timer, StopCircle, GraduationCap, CheckCircle2, Settings, ChevronDown, ArrowRightLeft, Thermometer, Weight, Maximize2, Minimize2, Activity, Box, Gauge, Flame, Wind, RefreshCw, Trophy, AlertCircle, Target, BookOpen, Info, ChevronRight, Wrench, Circle, Trash2, Plus, Copy, Layers } from 'lucide-react';
import ArduinoIDE from '../components/ArduinoIDE';
import RuletaWidget from '../components/Ruleta';
import Whiteboard from '../components/Whiteboard';
import './Gadgets.css';

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
            <div className={`floating-content ${gadget.id === 'mis-apps' ? 'floating-content-launcher' : ''} ${gadget.id === 'arduino' ? 'floating-content-arduino' : ''} ${gadget.id === 'calculator' ? 'floating-content-calculator' : ''} ${gadget.id === 'converter' ? 'floating-content-converter' : ''} ${gadget.id === 'timer' ? 'floating-content-clock' : ''} ${gadget.id === 'roulette' ? 'floating-content-roulette' : ''} ${gadget.id === 'traffic' ? 'floating-content-traffic' : ''} ${gadget.id === 'ohms' ? 'floating-content-ohms' : ''}`}>
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

const GadgetsLauncherPanel = ({ openGadget, autoCloseLauncher, setAutoCloseLauncher }) => (
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

export const GadgetsOverlay = ({ isLauncherOpen, closeLauncher, openGadget, openGadgets, closeGadget, autoCloseLauncher, setAutoCloseLauncher }) => (
    <>
        {isLauncherOpen && (
            <FloatingGadget
                gadget={{ id: 'mis-apps', name: 'Mis APPs', icon: <Wrench size={18} />, color: '#24344d' }}
                onClose={() => closeLauncher('mis-apps')}
                width={470}
                height={390}
            >
                <GadgetsLauncherPanel
                    openGadget={openGadget}
                    autoCloseLauncher={autoCloseLauncher}
                    setAutoCloseLauncher={setAutoCloseLauncher}
                />
            </FloatingGadget>
        )}

        {openGadgets.calculator && (
            <FloatingGadget gadget={gadgetsCatalog.find(g => g.id === 'calculator')} onClose={closeGadget} width={360} height={540}>
                <ScientificCalculator />
            </FloatingGadget>
        )}

        {openGadgets.converter && (
            <FloatingGadget gadget={gadgetsCatalog.find(g => g.id === 'converter')} onClose={closeGadget} width={560} height={520}>
                <UnitConverter />
            </FloatingGadget>
        )}

        {openGadgets.timer && (
            <FloatingGadget gadget={gadgetsCatalog.find(g => g.id === 'timer')} onClose={closeGadget} width={420} height={600}>
                <StudyClockWidget />
            </FloatingGadget>
        )}

        {openGadgets.roulette && (
            <FloatingGadget gadget={gadgetsCatalog.find(g => g.id === 'roulette')} onClose={closeGadget} width={500} height={750} defaultMaximized={true}>
                <RuletaWidget />
            </FloatingGadget>
        )}

        {openGadgets.traffic && (
            <FloatingGadget gadget={gadgetsCatalog.find(g => g.id === 'traffic')} onClose={closeGadget} width={370} height={500}>
                <TrafficLightWidget />
            </FloatingGadget>
        )}

        {openGadgets.ohms && (
            <FloatingGadget gadget={gadgetsCatalog.find(g => g.id === 'ohms')} onClose={closeGadget} width={500} height={500}>
                <OhmsLawCalculator />
            </FloatingGadget>
        )}

        {openGadgets.whiteboard && (
            <FloatingGadget gadget={gadgetsCatalog.find(g => g.id === 'whiteboard')} onClose={closeGadget} width={1100} height={700} defaultMaximized={true}>
                <Whiteboard />
            </FloatingGadget>
        )}

        {openGadgets.arduino && (
            <FloatingGadget gadget={gadgetsCatalog.find(g => g.id === 'arduino')} onClose={closeGadget} width={1100} height={700} defaultMaximized={false}>
                <ArduinoIDE />
            </FloatingGadget>
        )}

    </>
);



const TrafficLightWidget = () => {
    const [activeLight, setActiveLight] = useState('green');

    const stateMeta = {
        red: { title: 'Silencio', text: 'Momento de escuchar o evaluar.', className: 'red' },
        yellow: { title: 'Atención', text: 'Prepárense, observen instrucciones.', className: 'yellow' },
        green: { title: 'Participación', text: 'Pueden hablar, colaborar o avanzar.', className: 'green' }
    };

    const current = stateMeta[activeLight];

    return (
        <div className="traffic-widget">
            <div className="traffic-body">
                <button type="button" className={`traffic-light red ${activeLight === 'red' ? 'active' : ''}`} onClick={() => setActiveLight('red')} />
                <button type="button" className={`traffic-light yellow ${activeLight === 'yellow' ? 'active' : ''}`} onClick={() => setActiveLight('yellow')} />
                <button type="button" className={`traffic-light green ${activeLight === 'green' ? 'active' : ''}`} onClick={() => setActiveLight('green')} />
            </div>

            <div className={`traffic-status ${current.className}`}>
                <strong>{current.title}</strong>
                <p>{current.text}</p>
            </div>

            <div className="traffic-actions">
                <button type="button" onClick={() => setActiveLight('red')}>Rojo</button>
                <button type="button" onClick={() => setActiveLight('yellow')}>Amarillo</button>
                <button type="button" onClick={() => setActiveLight('green')}>Verde</button>
            </div>
        </div>
    );
};

const ScientificCalculator = () => {
    const [display, setDisplay] = useState('0');
    const [storedValue, setStoredValue] = useState(null);
    const [operator, setOperator] = useState(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const [displayMode, setDisplayMode] = useState('auto');
    const [lastNumericResult, setLastNumericResult] = useState(null);
    const [expressionPreview, setExpressionPreview] = useState('');

    const expressionLabel = expressionPreview;
    const resultSizeClass =
        display.length > 16 ? 'compact' :
            display.length > 11 ? 'medium' :
                '';

    const formatResult = (value, mode = displayMode) => {
        if (value === null || Number.isNaN(value) || !Number.isFinite(value)) {
            return 'Error';
        }

        if (value === 0) return '0';

        const absValue = Math.abs(value);
        if (mode === 'decimal') {
            return value.toLocaleString('en-US', {
                useGrouping: false,
                maximumFractionDigits: 20
            });
        }

        if (mode === 'scientific') {
            return value.toExponential(6).replace(/\.?0+e/, 'e');
        }

        if (absValue >= 1e9 || absValue < 1e-6) {
            return value.toExponential(6).replace(/\.?0+e/, 'e');
        }

        return Number(value.toPrecision(12)).toString();
    };

    const handleNumber = (num) => {
        if (waitingForOperand) {
            setDisplay(num === '.' ? '0.' : num);
            setWaitingForOperand(false);
            if (storedValue !== null && operator) {
                setExpressionPreview(`${storedValue} ${operator} ${num === '.' ? '0.' : num}`);
            }
            return;
        }

        if (num === '.' && display.includes('.')) return;

        let nextDisplay = '';
        if (display === '0' && num !== '.') {
            nextDisplay = num;
        } else {
            nextDisplay = display + num;
        }
        setDisplay(nextDisplay);
        if (storedValue !== null && operator) {
            setExpressionPreview(`${storedValue} ${operator} ${nextDisplay}`);
        }
    };

    const calculateResult = (left, right, currentOperator) => {
        switch (currentOperator) {
            case '+': return left + right;
            case '-': return left - right;
            case 'x': return left * right;
            case '/': return right === 0 ? null : left / right;
            default: return right;
        }
    };

    const handleOperator = (nextOperator) => {
        const currentValue = parseFloat(display);

        if (storedValue === null) {
            setStoredValue(currentValue);
            setExpressionPreview(`${display} ${nextOperator}`);
        } else if (operator && !waitingForOperand) {
            const result = calculateResult(storedValue, currentValue, operator);

            if (result === null) {
                setDisplay('Error');
                setStoredValue(null);
                setOperator(null);
                setWaitingForOperand(true);
                setExpressionPreview('');
                return;
            }

            setStoredValue(result);
            setDisplay(formatResult(result));
            setLastNumericResult(result);
            setExpressionPreview(`${storedValue} ${operator} ${currentValue}`);
        } else if (operator) {
            setExpressionPreview(`${storedValue} ${nextOperator}`);
        }

        setOperator(nextOperator);
        setWaitingForOperand(true);
    };

    const handleEqual = () => {
        if (!operator || storedValue === null) return;

        const result = calculateResult(storedValue, parseFloat(display), operator);

        if (result === null) {
            setDisplay('Error');
            setExpressionPreview('');
        } else {
            setDisplay(formatResult(result));
            setLastNumericResult(result);
            setExpressionPreview(`${storedValue} ${operator} ${parseFloat(display)}`);
        }

        setStoredValue(null);
        setOperator(null);
        setWaitingForOperand(true);
    };

    const handleClear = () => {
        setDisplay('0');
        setStoredValue(null);
        setOperator(null);
        setWaitingForOperand(false);
        setLastNumericResult(null);
        setExpressionPreview('');
    };

    const handleBackspace = () => {
        if (waitingForOperand || display === 'Error') {
            setDisplay('0');
            setWaitingForOperand(false);
            return;
        }

        const nextDisplay = display.length <= 1 ? '0' : display.slice(0, -1);
        setDisplay(nextDisplay);
        if (storedValue !== null && operator) {
            setExpressionPreview(nextDisplay === '0' ? `${storedValue} ${operator}` : `${storedValue} ${operator} ${nextDisplay}`);
        }
    };

    const toggleSign = () => {
        if (display === '0' || display === 'Error') return;
        const nextDisplay = display.startsWith('-') ? display.slice(1) : `-${display}`;
        setDisplay(nextDisplay);
        if (storedValue !== null && operator) {
            setExpressionPreview(`${storedValue} ${operator} ${nextDisplay}`);
        }
    };

    const toggleDisplayMode = () => {
        if (lastNumericResult === null) return;
        const nextMode = displayMode === 'decimal'
            ? 'scientific'
            : display.includes('e')
                ? 'decimal'
                : 'scientific';
        setDisplayMode(nextMode);
        setDisplay(formatResult(lastNumericResult, nextMode));
    };

    const buttons = [
        ['C', 'DEL', '+/-', '/'],
        ['7', '8', '9', 'x'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '+'],
        ['0', '.', '=']
    ];

    return (
        <div className="calculator-widget">
            <div className="calc-display">
                <div className="calc-expression">
                    <span>{expressionLabel}</span>
                    {lastNumericResult !== null && (
                        <button className="calc-mode-toggle" onClick={toggleDisplayMode}>
                            {displayMode === 'scientific' ? 'Decimal' : 'Cientifica'}
                        </button>
                    )}
                </div>
                <div className={`calc-result ${resultSizeClass}`}>{display}</div>
            </div>
            <div className="calc-buttons">
                {buttons.flat().map((btn, i) => (
                    <button
                        key={i}
                        className={`calc-btn ${['+', '-', 'x', '/', '='].includes(btn) ? 'operator' : ''} ${['C', 'DEL', '+/-'].includes(btn) ? 'function' : ''} ${btn === '0' ? 'zero' : ''}`}
                        onClick={() => {
                            if (btn === 'C') handleClear();
                            else if (btn === 'DEL') handleBackspace();
                            else if (btn === '+/-') toggleSign();
                            else if (btn === '=') handleEqual();
                            else if (['/', 'x', '+', '-'].includes(btn)) handleOperator(btn);
                            else handleNumber(btn);
                        }}
                    >
                        {btn}
                    </button>
                ))}
            </div>
        </div>
    );
};

const UnitConverter = () => {
    const categories = [
        { id: 'temperature', name: 'Temperatura', short: 'TEMPERATURA', icon: <Thermometer size={16} /> },
        { id: 'current', name: 'Corriente', short: 'CORRIENTE', icon: <Zap size={16} /> },
        { id: 'voltage', name: 'Voltaje', short: 'VOLTAJE', icon: <Activity size={16} /> },
        { id: 'resistance', name: 'Resistencia', short: 'RESISTENCIA', icon: <Box size={16} /> },
        { id: 'length', name: 'Longitud', short: 'LONGITUD', icon: <Maximize size={16} /> },
        { id: 'weight', name: 'Peso', short: 'PESO', icon: <Weight size={16} /> },
        { id: 'capacitance', name: 'Capacitancia', short: 'CAPAC.', icon: <Cpu size={16} /> },
        { id: 'pressure', name: 'Presion', short: 'PRESION', icon: <Gauge size={16} /> },
        { id: 'time', name: 'Tiempo', short: 'TIEMPO', icon: <Clock size={16} /> },
        { id: 'energy', name: 'Energia', short: 'ENERGIA', icon: <Flame size={16} /> },
        { id: 'speed', name: 'Velocidad', short: 'VELOCIDAD', icon: <Wind size={16} /> }
    ];

    const unitsByCategory = {
        length: [
            { id: 'm', name: 'Metros', factor: 1 },
            { id: 'cm', name: 'Centimetros', factor: 100 },
            { id: 'mm', name: 'Milimetros', factor: 1000 },
            { id: 'km', name: 'Kilometros', factor: 0.001 },
            { id: 'in', name: 'Pulgadas', factor: 39.3701 },
            { id: 'ft', name: 'Pies', factor: 3.28084 },
            { id: 'yd', name: 'Yardas', factor: 1.09361 },
            { id: 'mi', name: 'Millas', factor: 0.000621371 }
        ],
        weight: [
            { id: 'kg', name: 'Kilogramos', factor: 1 },
            { id: 'g', name: 'Gramos', factor: 1000 },
            { id: 'mg', name: 'Miligramos', factor: 1000000 },
            { id: 'lb', name: 'Libras', factor: 2.20462 },
            { id: 'oz', name: 'Onzas', factor: 35.274 },
            { id: 't', name: 'Toneladas', factor: 0.001 }
        ],
        temperature: [
            { id: 'c', name: 'Celsius' },
            { id: 'f', name: 'Fahrenheit' },
            { id: 'k', name: 'Kelvin' }
        ],
        voltage: [
            { id: 'v', name: 'Voltios', factor: 1 },
            { id: 'mv', name: 'Milivoltios', factor: 1000 },
            { id: 'kv', name: 'Kilovoltios', factor: 0.001 },
            { id: 'uv', name: 'Microvoltios', factor: 1000000 }
        ],
        current: [
            { id: 'a', name: 'Amperios', factor: 1 },
            { id: 'ma', name: 'Miliamperios', factor: 1000 },
            { id: 'ua', name: 'Microamperios', factor: 1000000 },
            { id: 'ka', name: 'Kiloamperios', factor: 0.001 }
        ],
        resistance: [
            { id: 'ohm', name: 'Ohmios', factor: 1 },
            { id: 'kohm', name: 'Kiloohmios', factor: 0.001 },
            { id: 'mohm', name: 'Megaohmios', factor: 0.000001 },
            { id: 'gohm', name: 'Gigaohmios', factor: 0.000000001 }
        ],
        capacitance: [
            { id: 'f', name: 'Faradios', factor: 1 },
            { id: 'mf', name: 'Milifaradios', factor: 1000 },
            { id: 'uf', name: 'Microfaradios', factor: 1000000 },
            { id: 'nf', name: 'Nanofaradios', factor: 1000000000 },
            { id: 'pf', name: 'Picofaradios', factor: 1000000000000 }
        ],
        pressure: [
            { id: 'pa', name: 'Pascales', factor: 1 },
            { id: 'bar', name: 'Bar', factor: 0.00001 },
            { id: 'psi', name: 'PSI', factor: 0.000145038 },
            { id: 'atm', name: 'Atmosferas', factor: 0.0000098692 },
            { id: 'mmhg', name: 'mmHg', factor: 0.00750062 }
        ],
        time: [
            { id: 's', name: 'Segundos', factor: 1 },
            { id: 'ms', name: 'Milisegundos', factor: 1000 },
            { id: 'min', name: 'Minutos', factor: 1 / 60 },
            { id: 'hr', name: 'Horas', factor: 1 / 3600 },
            { id: 'day', name: 'Dias', factor: 1 / 86400 }
        ],
        energy: [
            { id: 'j', name: 'Joules', factor: 1 },
            { id: 'kj', name: 'Kilojoules', factor: 0.001 },
            { id: 'cal', name: 'Calorias', factor: 0.239006 },
            { id: 'kcal', name: 'Kilocalorias', factor: 0.000239006 },
            { id: 'wh', name: 'Vatios-hora', factor: 0.000277778 },
            { id: 'kwh', name: 'kWh', factor: 0.000000277778 }
        ],
        speed: [
            { id: 'ms', name: 'm/s', factor: 1 },
            { id: 'kmh', name: 'km/h', factor: 3.6 },
            { id: 'mph', name: 'mph', factor: 2.23694 },
            { id: 'kt', name: 'Nudos', factor: 1.94384 },
            { id: 'mach', name: 'Mach', factor: 0.00293867 }
        ]
    };

    const [category, setCategory] = useState('temperature');
    const [inputValue, setInputValue] = useState('1');
    const [fromUnit, setFromUnit] = useState('c');
    const [toUnit, setToUnit] = useState('f');

    useEffect(() => {
        const categoryUnits = unitsByCategory[category];
        if (categoryUnits?.length) {
            setFromUnit(categoryUnits[0].id);
            setToUnit(categoryUnits[1]?.id || categoryUnits[0].id);
        }
    }, [category]);

    const convert = useCallback(() => {
        const numericValue = parseFloat(inputValue.replace(',', '.')) || 0;
        const categoryUnits = unitsByCategory[category];
        if (!categoryUnits) return '0';

        const toBase = (value, unitId) => {
            if (category === 'temperature') {
                if (unitId === 'c') return value;
                if (unitId === 'f') return (value - 32) * 5 / 9;
                if (unitId === 'k') return value - 273.15;
            }
            const unit = categoryUnits.find(item => item.id === unitId);
            return value / (unit?.factor || 1);
        };

        const fromBase = (baseValue, unitId) => {
            if (category === 'temperature') {
                if (unitId === 'c') return baseValue;
                if (unitId === 'f') return (baseValue * 9 / 5) + 32;
                if (unitId === 'k') return baseValue + 273.15;
            }
            const unit = categoryUnits.find(item => item.id === unitId);
            return baseValue * (unit?.factor || 1);
        };

        // Safety check: ensure units belong to current category
        const safeFromUnit = categoryUnits.some(u => u.id === fromUnit) ? fromUnit : categoryUnits[0].id;
        const safeToUnit = categoryUnits.some(u => u.id === toUnit) ? toUnit : (categoryUnits[1]?.id || categoryUnits[0].id);

        const baseValue = toBase(numericValue, safeFromUnit);
        const converted = fromBase(baseValue, safeToUnit);

        return converted.toLocaleString('es-ES', {
            maximumFractionDigits: 8,
            minimumFractionDigits: 0
        });
    }, [inputValue, category, fromUnit, toUnit]);

    const swapUnits = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    };

    const getUnitName = (unitId) => {
        const categoryUnits = unitsByCategory[category];
        if (!categoryUnits) return '';
        return categoryUnits.find(unit => unit.id === unitId)?.name || '';
    };
    
    const result = convert();

    return (
        <div className="converter-shell">
            <div className="converter-tabs">
                {categories.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setCategory(item.id)}
                        className={`converter-tab ${category === item.id ? 'active' : ''}`}
                    >
                        <div>{item.icon}</div>
                        <span>{item.short}</span>
                    </button>
                ))}
            </div>

            <div className="converter-panel">
                <div className="converter-block">
                    <div className="converter-block-meta">
                        <label>Desde</label>
                        <span>{getUnitName(fromUnit)}</span>
                    </div>
                    <div className="converter-field">
                        <input
                            type="text"
                            inputMode="decimal"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="converter-main-input"
                        />
                        <div className="converter-select-wrap">
                            <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="converter-main-select">
                                {unitsByCategory[category]?.map((unit) => (
                                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="converter-chevron" />
                        </div>
                    </div>
                </div>

                <div className="converter-swap-row">
                    <button className="converter-swap" onClick={swapUnits}>
                        <ArrowRightLeft size={18} />
                    </button>
                </div>

                <div className="converter-block">
                    <div className="converter-block-meta">
                        <label>Hacia</label>
                        <span>{getUnitName(toUnit)}</span>
                    </div>
                    <div className="converter-field result">
                        <div className="converter-main-result">{result}</div>
                        <div className="converter-select-wrap">
                            <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="converter-main-select">
                                {unitsByCategory[category]?.map((unit) => (
                                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="converter-chevron" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StudyClockWidget = () => {
    const [activeTab, setActiveTab] = useState('Temporizador');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isAlarmActive, setIsAlarmActive] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const [timerMinutes, setTimerMinutes] = useState(25);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerRemaining, setTimerRemaining] = useState(25 * 60);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerIntervalRef = useRef(null);

    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
    const [laps, setLaps] = useState([]);
    const stopwatchIntervalRef = useRef(null);

    const [studyFocusMinutes, setStudyFocusMinutes] = useState(25);
    const [studyBreakMinutes, setStudyBreakMinutes] = useState(5);
    const [studyMode, setStudyMode] = useState('focus');
    const [studyTime, setStudyTime] = useState(25 * 60);
    const [isStudyRunning, setIsStudyRunning] = useState(false);
    const studyIntervalRef = useRef(null);

    const playAlarm = useCallback(() => {
        if (!soundEnabled) return;
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
        } catch {
            console.log('Audio no soportado');
        }
    }, [soundEnabled]);

    const stopAllAlerts = useCallback(() => {
        setIsAlarmActive(false);
    }, []);

    const clearTimerInterval = () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    };

    const clearStopwatchInterval = () => {
        if (stopwatchIntervalRef.current) {
            clearInterval(stopwatchIntervalRef.current);
            stopwatchIntervalRef.current = null;
        }
    };

    const clearStudyInterval = () => {
        if (studyIntervalRef.current) {
            clearInterval(studyIntervalRef.current);
            studyIntervalRef.current = null;
        }
    };

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        return () => {
            clearTimerInterval();
            clearStopwatchInterval();
            clearStudyInterval();
        };
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatStopwatch = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const centiseconds = Math.floor((ms % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    };

    const syncTimerRemaining = useCallback(() => {
        const mins = Math.max(0, parseInt(timerMinutes || '0', 10) || 0);
        const secs = Math.min(59, Math.max(0, parseInt(timerSeconds || '0', 10) || 0));
        setTimerRemaining((mins * 60) + secs);
    }, [timerMinutes, timerSeconds]);

    useEffect(() => {
        if (!isTimerRunning && !isAlarmActive) {
            syncTimerRemaining();
        }
    }, [timerMinutes, timerSeconds, isTimerRunning, isAlarmActive, syncTimerRemaining]);

    useEffect(() => {
        if (!isStudyRunning && !isAlarmActive) {
            const modeMinutes = studyMode === 'focus' ? studyFocusMinutes : studyBreakMinutes;
            setStudyTime(Math.max(1, parseInt(modeMinutes || '1', 10) || 1) * 60);
        }
    }, [studyMode, studyFocusMinutes, studyBreakMinutes, isStudyRunning, isAlarmActive]);

    const startTimer = () => {
        if (isAlarmActive) {
            stopAllAlerts();
            return;
        }

        if (isTimerRunning) {
            clearTimerInterval();
            setIsTimerRunning(false);
            return;
        }

        if (timerRemaining <= 0) {
            syncTimerRemaining();
        }

        timerIntervalRef.current = setInterval(() => {
            setTimerRemaining((prev) => {
                if (prev <= 1) {
                    clearTimerInterval();
                    setIsTimerRunning(false);
                    setIsAlarmActive(true);
                    playAlarm();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        setIsTimerRunning(true);
    };

    const resetTimer = () => {
        clearTimerInterval();
        setIsTimerRunning(false);
        stopAllAlerts();
        syncTimerRemaining();
    };

    const startStopwatch = () => {
        if (isStopwatchRunning) {
            clearStopwatchInterval();
            setIsStopwatchRunning(false);
            return;
        }

        stopwatchIntervalRef.current = setInterval(() => {
            setStopwatchTime((prev) => prev + 10);
        }, 10);
        setIsStopwatchRunning(true);
    };

    const resetStopwatch = () => {
        clearStopwatchInterval();
        setIsStopwatchRunning(false);
        setStopwatchTime(0);
        setLaps([]);
    };

    const addLap = () => {
        setLaps((prev) => [stopwatchTime, ...prev]);
    };

    const startStudy = () => {
        if (isAlarmActive) {
            stopAllAlerts();
            return;
        }

        if (isStudyRunning) {
            clearStudyInterval();
            setIsStudyRunning(false);
            return;
        }

        studyIntervalRef.current = setInterval(() => {
            setStudyTime((prev) => {
                if (prev <= 1) {
                    clearStudyInterval();
                    setIsStudyRunning(false);
                    setIsAlarmActive(true);
                    playAlarm();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        setIsStudyRunning(true);
    };

    const resetStudy = () => {
        clearStudyInterval();
        setIsStudyRunning(false);
        stopAllAlerts();
        const mins = studyMode === 'focus' ? studyFocusMinutes : studyBreakMinutes;
        setStudyTime(Math.max(1, parseInt(mins || '1', 10) || 1) * 60);
    };

    const loadStudyPreset = (mode) => {
        const minutes = mode === 'focus'
            ? Math.max(1, parseInt(studyFocusMinutes || '1', 10) || 1)
            : Math.max(1, parseInt(studyBreakMinutes || '1', 10) || 1);

        clearTimerInterval();
        setIsTimerRunning(false);
        stopAllAlerts();
        setActiveTab('Temporizador');
        setTimerMinutes(minutes);
        setTimerSeconds(0);
        setTimerRemaining(minutes * 60);
    };

    const timerTotal = Math.max(1, ((parseInt(timerMinutes || '0', 10) || 0) * 60) + (parseInt(timerSeconds || '0', 10) || 0));
    const timerProgress = Math.max(0, Math.min(100, ((timerTotal - timerRemaining) / timerTotal) * 100));

    return (
        <div className={`clock-pro-widget ${isAlarmActive ? 'alarm-active' : ''}`}>
            <div className="clock-pro-now-card">
                <div>
                    <span className="clock-pro-label">Tiempo actual</span>
                    <div className="clock-pro-now-time">
                        {currentTime.toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true
                        })}
                    </div>
                </div>
                <div className="clock-pro-now-actions">
                    <button
                        type="button"
                        className="clock-pro-sound"
                        onClick={() => setSoundEnabled((prev) => !prev)}
                        aria-label={soundEnabled ? 'Silenciar alarma' : 'Activar alarma'}
                    >
                        {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                    </button>
                    <div className="clock-pro-now-icon">
                        {isAlarmActive ? <Bell size={20} /> : <AlarmClock size={20} />}
                    </div>
                </div>
            </div>

            <div className="clock-pro-tabs">
                {[
                    { id: 'Temporizador', icon: Timer },
                    { id: 'Cronometro', icon: StopCircle },
                    { id: 'Estudio', icon: GraduationCap }
                ].map(({ id, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        className={`clock-pro-tab ${activeTab === id ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab(id);
                            stopAllAlerts();
                            setShowSettings(false);
                        }}
                    >
                        <Icon size={14} />
                        <span>{id}</span>
                    </button>
                ))}
            </div>

            <div className="clock-pro-content">
                {activeTab === 'Temporizador' && (
                    <div className="clock-pro-panel">
                        <div className="clock-pro-input-grid">
                            <label className="clock-pro-input-card">
                                <span>Min</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="999"
                                    value={timerMinutes}
                                    onChange={(e) => setTimerMinutes(e.target.value)}
                                />
                            </label>
                            <label className="clock-pro-input-card">
                                <span>Seg</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={timerSeconds}
                                    onChange={(e) => setTimerSeconds(Math.min(59, Math.max(0, parseInt(e.target.value || '0', 10))).toString())}
                                />
                            </label>
                        </div>

                        <div className="clock-pro-ring-wrap">
                            <div className="clock-pro-ring" style={{ '--progress': `${timerProgress}%` }}>
                                <div className="clock-pro-ring-inner">
                                    <div className="clock-pro-main-time">{formatTime(timerRemaining)}</div>
                                    <span className="clock-pro-status">
                                        {isAlarmActive ? 'Alarma activa' : isTimerRunning ? 'En marcha' : 'Pausado'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="clock-pro-actions">
                            <button type="button" className="clock-pro-btn primary" onClick={startTimer}>
                                {isAlarmActive ? <Bell size={16} /> : isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                                <span>{isAlarmActive ? 'Apagar' : isTimerRunning ? 'Pausar' : 'Iniciar'}</span>
                            </button>
                            <button type="button" className="clock-pro-btn" onClick={resetTimer}>
                                <RotateCcw size={15} />
                                <span>Reiniciar</span>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'Cronometro' && (
                    <div className="clock-pro-panel">
                        <div className="clock-pro-display-card">
                            <div className="clock-pro-display-large">{formatStopwatch(stopwatchTime)}</div>
                            <p>Ideal para exposiciones, laboratorios o practicas de aula.</p>
                        </div>

                        <div className="clock-pro-actions">
                            <button type="button" className="clock-pro-btn primary" onClick={startStopwatch}>
                                {isStopwatchRunning ? <Pause size={16} /> : <Play size={16} />}
                                <span>{isStopwatchRunning ? 'Detener' : 'Iniciar'}</span>
                            </button>
                            <button
                                type="button"
                                className="clock-pro-btn"
                                onClick={isStopwatchRunning ? addLap : resetStopwatch}
                            >
                                <RotateCcw size={15} />
                                <span>{isStopwatchRunning ? 'Vuelta' : 'Reset'}</span>
                            </button>
                        </div>

                        <div className="clock-pro-laps">
                            {laps.length > 0 ? laps.map((lapTime, index) => (
                                <div key={`${lapTime}-${index}`} className="clock-pro-lap">
                                    <span>V. {laps.length - index}</span>
                                    <strong>{formatStopwatch(lapTime)}</strong>
                                </div>
                            )) : (
                                <div className="clock-pro-empty">Las vueltas apareceran aqui.</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'Estudio' && (
                    <div className="clock-pro-panel">
                        <div className="clock-pro-study-toggle">
                            <button
                                type="button"
                                className={studyMode === 'focus' ? 'active' : ''}
                                onClick={() => {
                                    clearStudyInterval();
                                    setIsStudyRunning(false);
                                    setStudyMode('focus');
                                    stopAllAlerts();
                                }}
                            >
                                Pomodoro
                            </button>
                            <button
                                type="button"
                                className={studyMode === 'break' ? 'active' : ''}
                                onClick={() => {
                                    clearStudyInterval();
                                    setIsStudyRunning(false);
                                    setStudyMode('break');
                                    stopAllAlerts();
                                }}
                            >
                                Descanso
                            </button>
                        </div>

                        <div className="clock-pro-study-card">
                            <div className="clock-pro-study-time">{formatTime(studyTime)}</div>
                            <span className="clock-pro-status">
                                {isAlarmActive ? 'Bloque completo' : studyMode === 'focus' ? 'Estudio' : 'Descanso'}
                            </span>
                        </div>

                        <div className="clock-pro-actions">
                            <button type="button" className="clock-pro-btn primary" onClick={startStudy}>
                                {isAlarmActive ? <Bell size={16} /> : isStudyRunning ? <Pause size={16} /> : <Play size={16} />}
                                <span>{isAlarmActive ? 'Cerrar' : isStudyRunning ? 'Pausar' : 'Iniciar'}</span>
                            </button>
                            <button type="button" className="clock-pro-btn" onClick={resetStudy}>
                                <RotateCcw size={15} />
                                <span>Reset</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            className="clock-pro-settings-toggle"
                            onClick={() => setShowSettings((prev) => !prev)}
                        >
                            <Settings size={13} />
                            <span>Configurar bloques</span>
                        </button>

                        {showSettings && (
                            <div className="clock-pro-settings-grid">
                                <label className="clock-pro-input-card compact">
                                    <span>Min. enfoque</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="180"
                                        value={studyFocusMinutes}
                                        onChange={(e) => setStudyFocusMinutes(e.target.value)}
                                    />
                                </label>
                                <label className="clock-pro-input-card compact">
                                    <span>Min. descanso</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="180"
                                        value={studyBreakMinutes}
                                        onChange={(e) => setStudyBreakMinutes(e.target.value)}
                                    />
                                </label>
                            </div>
                        )}

                        <div className="clock-pro-study-loaders">
                            <button type="button" className="clock-pro-mini-btn" onClick={() => loadStudyPreset('focus')}>
                                <CheckCircle2 size={14} />
                                <span>Usar Pomodoro</span>
                            </button>
                            <button type="button" className="clock-pro-mini-btn" onClick={() => loadStudyPreset('break')}>
                                <CheckCircle2 size={14} />
                                <span>Usar descanso</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const OhmsLawCalculator = () => {
    const [activeMode, setActiveMode] = useState('calculadora');
    const [target, setTarget] = useState('V');
    const [values, setValues] = useState({ V: '', I: '', R: '' });
    const [exercise, setExercise] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [score, setScore] = useState(0);
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        const saved = window.localStorage.getItem('ohms-widget-values');
        if (!saved) return;
        try {
            setValues(JSON.parse(saved));
        } catch {
            console.log('No saved Ohm values');
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem('ohms-widget-values', JSON.stringify(values));
    }, [values]);

    useEffect(() => {
        if (activeMode !== 'calculadora') return;

        const v = parseFloat(values.V);
        const i = parseFloat(values.I);
        const r = parseFloat(values.R);

        let calculatedV = values.V;
        let calculatedI = values.I;
        let calculatedR = values.R;

        if (target === 'V' && i > 0 && r > 0) {
            calculatedV = (i * r).toFixed(2);
        } else if (target === 'I' && v > 0 && r > 0) {
            calculatedI = (v / r).toFixed(4);
        } else if (target === 'R' && v > 0 && i > 0) {
            calculatedR = (v / i).toFixed(2);
        }

        setValues((prev) => ({
            ...prev,
            V: target === 'V' ? calculatedV : prev.V,
            I: target === 'I' ? calculatedI : prev.I,
            R: target === 'R' ? calculatedR : prev.R
        }));
    }, [values.V, values.I, values.R, target, activeMode]);

    const colors = {
        V: 'ohms-accent-v',
        I: 'ohms-accent-i',
        R: 'ohms-accent-r'
    };

    const generateExercise = useCallback(() => {
        const types = ['V', 'I', 'R'];
        const quest = types[Math.floor(Math.random() * types.length)];
        let val1;
        let val2;
        let unit1;
        let unit2;
        let correct;

        if (quest === 'V') {
            val1 = Math.floor(Math.random() * 10) + 1;
            val2 = Math.floor(Math.random() * 100) + 1;
            unit1 = 'A';
            unit2 = 'Ω';
            correct = val1 * val2;
        } else if (quest === 'I') {
            val2 = Math.floor(Math.random() * 50) + 1;
            correct = Math.floor(Math.random() * 10) + 1;
            val1 = correct * val2;
            unit1 = 'V';
            unit2 = 'Ω';
        } else {
            val2 = Math.floor(Math.random() * 5) + 1;
            correct = Math.floor(Math.random() * 100) + 1;
            val1 = correct * val2;
            unit1 = 'V';
            unit2 = 'A';
        }

        setExercise({ quest, val1, val2, unit1, unit2, correct });
        setUserAnswer('');
        setFeedback(null);
    }, []);

    const checkAnswer = () => {
        if (!exercise) return;
        const ans = parseFloat(userAnswer);
        if (Math.abs(ans - exercise.correct) < 0.1) {
            setFeedback({ status: 'success', message: 'Correcto. Excelente calculo.' });
            setScore((prev) => prev + 10);
            window.setTimeout(() => generateExercise(), 1600);
        } else {
            setFeedback({ status: 'error', message: `Incorrecto. El valor real era ${exercise.correct}.` });
            setScore((prev) => Math.max(0, prev - 5));
        }
    };

    return (
        <div className="ohms-pro-widget">
            {showInfo && (
                <div className="ohms-info-overlay">
                    <div className="ohms-info-modal">
                        <div className="ohms-info-header">
                            <div className="ohms-info-title">
                                <BookOpen size={17} />
                                <span>Guia teorica</span>
                            </div>
                            <button type="button" className="ohms-info-close" onClick={() => setShowInfo(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="ohms-info-body">
                            <section>
                                <h4>Que es la Ley de Ohm?</h4>
                                <p>
                                    Establece que la corriente que circula por un conductor es proporcional al
                                    voltaje aplicado e inversamente proporcional a la resistencia.
                                </p>
                            </section>
                            <div className="ohms-info-grid">
                                <div className="ohms-info-row">
                                    <div className="ohms-info-badge v">V</div>
                                    <div>
                                        <h5>Voltaje</h5>
                                        <p>Presion electrica que empuja electrones.</p>
                                    </div>
                                </div>
                                <div className="ohms-info-row">
                                    <div className="ohms-info-badge i">I</div>
                                    <div>
                                        <h5>Corriente</h5>
                                        <p>Flujo de electrones que pasa por el circuito.</p>
                                    </div>
                                </div>
                                <div className="ohms-info-row">
                                    <div className="ohms-info-badge r">R</div>
                                    <div>
                                        <h5>Resistencia</h5>
                                        <p>Oposicion al paso de la corriente.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="ohms-info-footer">Formula base: V = I x R</div>
                    </div>
                </div>
            )}

            <div className="ohms-pro-tabs">
                <button
                    type="button"
                    className={activeMode === 'calculadora' ? 'active' : ''}
                    onClick={() => setActiveMode('calculadora')}
                >
                    <Calculator size={14} />
                    <span>Calculadora</span>
                </button>
                <button type="button" className="ohms-tab-bulb" onClick={() => setShowInfo(true)}>
                    <Lightbulb size={15} />
                </button>
                <button
                    type="button"
                    className={activeMode === 'practica' ? 'active' : ''}
                    onClick={() => {
                        setActiveMode('practica');
                        generateExercise();
                    }}
                >
                    <Trophy size={14} />
                    <span>Practicar</span>
                </button>
            </div>

            <div className="ohms-pro-content">
                {activeMode === 'calculadora' && (
                    <>
                        <div className="ohms-triangle-card">
                            <div className="ohms-triangle-heading">
                                <span><Target size={10} /> Toca para seleccionar</span>
                                <h3>{target === 'V' ? 'V = I x R' : target === 'I' ? 'I = V / R' : 'R = V / I'}</h3>
                            </div>

                            <div className="ohms-visual-triangle">
                                <svg viewBox="0 0 100 80" className="ohms-triangle-svg">
                                    <path d="M50 5 L95 75 L5 75 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
                                    <line x1="25" y1="45" x2="75" y2="45" stroke="#334155" strokeWidth="1.5" />
                                    <line x1="50" y1="45" x2="50" y2="75" stroke="#334155" strokeWidth="1.5" />
                                </svg>

                                <button type="button" className={`ohms-triangle-node node-v ${target === 'V' ? 'active' : ''}`} onClick={() => { setTarget('V'); setValues((prev) => ({ ...prev, V: '' })); }}>V</button>
                                <button type="button" className={`ohms-triangle-node node-i ${target === 'I' ? 'active' : ''}`} onClick={() => { setTarget('I'); setValues((prev) => ({ ...prev, I: '' })); }}>I</button>
                                <button type="button" className={`ohms-triangle-node node-r ${target === 'R' ? 'active' : ''}`} onClick={() => { setTarget('R'); setValues((prev) => ({ ...prev, R: '' })); }}>R</button>
                            </div>
                        </div>

                        <div className="ohms-inputs-pro">
                            {[
                                { id: 'V', label: 'Voltaje', unit: 'V' },
                                { id: 'I', label: 'Corriente', unit: 'A' },
                                { id: 'R', label: 'Resistencia', unit: 'Ω' }
                            ].map((item) => (
                                <label key={item.id} className={`ohms-input-card ${target === item.id ? 'selected' : ''}`}>
                                    <div className="ohms-input-top">
                                        <span>{item.label}</span>
                                        <strong className={colors[item.id]}>{item.unit}</strong>
                                    </div>
                                    <input
                                        type="number"
                                        disabled={target === item.id}
                                        value={values[item.id]}
                                        onChange={(e) => setValues({ ...values, [item.id]: e.target.value })}
                                        placeholder="0.0"
                                        className={target === item.id ? colors[item.id] : ''}
                                    />
                                </label>
                            ))}
                        </div>

                        <button type="button" className="ohms-clear-btn" onClick={() => setValues({ V: '', I: '', R: '' })}>
                            <RefreshCw size={12} />
                            <span>Limpiar valores</span>
                        </button>
                    </>
                )}

                {activeMode === 'practica' && exercise && (
                    <div className="ohms-practice-card">
                        <div className="ohms-practice-head">
                            <div>
                                <span>Desafio</span>
                                <h4>Score: {score}</h4>
                            </div>
                            <button type="button" className="ohms-mini-refresh" onClick={generateExercise}>
                                <RefreshCw size={15} />
                            </button>
                        </div>

                        <p className="ohms-practice-text">
                            Un circuito con <strong>{exercise.val1}{exercise.unit1}</strong> y una carga de <strong>{exercise.val2}{exercise.unit2}</strong>.
                        </p>
                        <h3 className="ohms-practice-question">
                            Calcula el {exercise.quest === 'V' ? 'Voltaje' : exercise.quest === 'I' ? 'Amperaje' : 'Ohmiaje'}:
                        </h3>

                        <div className="ohms-answer-wrap">
                            <input
                                type="number"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Respuesta..."
                            />
                            <span>{exercise.quest === 'V' ? 'V' : exercise.quest === 'I' ? 'A' : 'Ω'}</span>
                        </div>

                        <div className="ohms-practice-actions">
                            <button type="button" className="ohms-validate-btn" onClick={checkAnswer}>
                                <span>Validar</span>
                                <ChevronRight size={14} />
                            </button>
                            <button type="button" className="ohms-mini-refresh" onClick={generateExercise}>
                                <RefreshCw size={15} />
                            </button>
                        </div>

                        {feedback && (
                            <div className={`ohms-feedback-box ${feedback.status}`}>
                                {feedback.status === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                                <span>{feedback.message}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const Gadgets = () => <Navigate to="/dashboard" replace />;

export default Gadgets;

