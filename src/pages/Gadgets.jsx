import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calculator, Clock, Ruler, Zap, PenLine, X, RotateCcw, Play, Pause, Bell, Volume2, VolumeX } from 'lucide-react';
import { useWhiteboard } from '../context/useWhiteboard';
import './Gadgets.css';

const FloatingGadget = ({ gadget, children, onClose }) => {
    const [position, setPosition] = useState({ 
        x: (window.innerWidth - 360) / 2, 
        y: (window.innerHeight - 450) / 2 
    });
    const [isDragging, setIsDragging] = useState(false);
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
            style={{ left: position.x, top: position.y }}
        >
            <div className="floating-header" style={{ background: gadget.color }} onMouseDown={handleDragStart}>
                {gadget.icon}
                <span>{gadget.name}</span>
                <div className="floating-actions">
                    <button onClick={() => onClose(gadget.id)}><X size={14} /></button>
                </div>
            </div>
            <div className="floating-content">
                {children}
            </div>
        </div>
    );
};

const Gadgets = () => {
    const { openWhiteboard } = useWhiteboard();
    const [openGadgets, setOpenGadgets] = useState({});

    const gadgets = [
        { id: 'calculator', name: 'Calculadora', icon: <Calculator size={18} />, color: '#a855f7' },
        { id: 'converter', name: 'Conversor', icon: <Ruler size={18} />, color: '#3b82f6' },
        { id: 'timer', name: 'Temporizador', icon: <Clock size={18} />, color: '#f97316' },
        { id: 'ohms', name: 'Ley de Ohm', icon: <Zap size={18} />, color: '#10b981' },
        { id: 'whiteboard', name: 'Pizarra', icon: <PenLine size={18} />, color: '#ec4899' }
    ];

    const openGadget = (id) => {
        if (id === 'whiteboard') {
            openWhiteboard();
        } else {
            setOpenGadgets(prev => ({ ...prev, [id]: true }));
        }
    };

    const closeGadget = (id) => {
        setOpenGadgets(prev => {
            const newState = { ...prev };
            delete newState[id];
            return newState;
        });
    };

    return (
        <div className="gadgets-page">
            <div className="page-header">
                <div className="header-title">
                    <Calculator size={28} color="#60a5fa" />
                    <h1>Herramientas</h1>
                </div>
            </div>

            <div className="gadgets-grid">
                {gadgets.map(gadget => (
                    <button
                        key={gadget.id}
                        className="gadget-icon-btn"
                        onClick={() => openGadget(gadget.id)}
                        style={{ '--gadget-color': gadget.color }}
                    >
                        <div className="gadget-icon" style={{ background: `${gadget.color}20`, color: gadget.color }}>
                            {gadget.icon}
                        </div>
                        <span className="gadget-icon-name">{gadget.name}</span>
                    </button>
                ))}
            </div>

            {/* Floating Gadget Windows */}
            {openGadgets.calculator && (
                <FloatingGadget gadget={gadgets[0]} onClose={closeGadget}>
                    <ScientificCalculator />
                </FloatingGadget>
            )}

            {openGadgets.converter && (
                <FloatingGadget gadget={gadgets[1]} onClose={closeGadget}>
                    <UnitConverter />
                </FloatingGadget>
            )}

            {openGadgets.timer && (
                <FloatingGadget gadget={gadgets[2]} onClose={closeGadget}>
                    <PomodoroTimer />
                </FloatingGadget>
            )}

            {openGadgets.ohms && (
                <FloatingGadget gadget={gadgets[3]} onClose={closeGadget}>
                    <OhmsLawCalculator />
                </FloatingGadget>
            )}
        </div>
    );
};

const ScientificCalculator = () => {
    const [display, setDisplay] = useState('0');
    const [expression, setExpression] = useState('');

    const handleNumber = (num) => {
        if (display === '0' && num !== '.') {
            setDisplay(num);
        } else {
            setDisplay(display + num);
        }
    };

    const handleOperator = (op) => {
        setExpression(display + ' ' + op + ' ');
        setDisplay('0');
    };

    const handleEqual = () => {
        try {
            const fullExpression = expression + display;
            const result = Function('"use strict"; return (' + fullExpression.replace(/×/g, '*').replace(/÷/g, '/') + ')')();
            setDisplay(String(result));
            setExpression('');
        } catch {
            setDisplay('Error');
        }
    };

    const handleClear = () => {
        setDisplay('0');
        setExpression('');
    };

    const handleFunction = (func) => {
        try {
            const num = parseFloat(display);
            let result;
            switch (func) {
                case 'sqrt': result = Math.sqrt(num); break;
                case 'pow': result = Math.pow(num, 2); break;
                case 'sin': result = Math.sin(num * Math.PI / 180); break;
                case 'cos': result = Math.cos(num * Math.PI / 180); break;
                case 'tan': result = Math.tan(num * Math.PI / 180); break;
                case 'log': result = Math.log10(num); break;
                case 'ln': result = Math.log(num); break;
                case 'pi': result = Math.PI; break;
                default: result = num;
            }
            setDisplay(String(result));
        } catch {
            setDisplay('Error');
        }
    };

    const buttons = [
        ['sin', 'cos', 'tan', 'log'],
        ['ln', 'sqrt', 'pow', 'pi'],
        ['7', '8', '9', '÷'],
        ['4', '5', '6', '×'],
        ['1', '2', '3', '-'],
        ['0', '.', 'C', '+'],
        ['(', ')', '=']
    ];

    return (
        <div className="calculator-widget">
            <div className="calc-display">
                <div className="calc-expression">{expression}</div>
                <div className="calc-result">{display}</div>
            </div>
            <div className="calc-buttons">
                {buttons.flat().map((btn, i) => (
                    <button
                        key={i}
                        className={`calc-btn ${['+', '-', '×', '÷', '='].includes(btn) ? 'operator' : ''} ${['C', 'sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'pow', 'pi'].includes(btn) ? 'function' : ''}`}
                        onClick={() => {
                            if (btn === 'C') handleClear();
                            else if (btn === '=') handleEqual();
                            else if (['÷', '×', '+', '-'].includes(btn)) handleOperator(btn);
                            else if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'pow', 'pi'].includes(btn)) handleFunction(btn);
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
    const [category, setCategory] = useState('length');
    const [value, setValue] = useState('1');
    const [fromUnit, setFromUnit] = useState('m');
    const [toUnit, setToUnit] = useState('cm');

    const units = {
        length: { name: 'Longitud', units: { m: 'Metros', cm: 'Centímetros', mm: 'Milímetros', km: 'Kilómetros', in: 'Pulgadas', ft: 'Pies' } },
        weight: { name: 'Peso', units: { kg: 'Kilogramos', g: 'Gramos', mg: 'Miligramos', lb: 'Libras', oz: 'Onzas' } },
        temperature: { name: 'Temperatura', units: { c: 'Celsius', f: 'Fahrenheit', k: 'Kelvin' } }
    };

    const convert = (val, from, to, cat) => {
        const num = parseFloat(val) || 0;
        const conversions = {
            length: { m: 1, cm: 100, mm: 1000, km: 0.001, in: 39.3701, ft: 3.28084 },
            weight: { kg: 1, g: 1000, mg: 1000000, lb: 2.20462, oz: 35.274 },
            temperature: { c: 1, f: 1, k: 1 }
        };

        if (cat === 'temperature') {
            if (from === 'c' && to === 'f') return (num * 9/5) + 32;
            if (from === 'c' && to === 'k') return num + 273.15;
            if (from === 'f' && to === 'c') return (num - 32) * 5/9;
            if (from === 'f' && to === 'k') return (num - 32) * 5/9 + 273.15;
            if (from === 'k' && to === 'c') return num - 273.15;
            if (from === 'k' && to === 'f') return (num - 273.15) * 9/5 + 32;
            return num;
        }

        const inBase = num / conversions[cat][from];
        return inBase * conversions[cat][to];
    };

    return (
        <div className="converter-widget">
            <div className="category-selector">
                {Object.entries(units).map(([key, val]) => (
                    <button
                        key={key}
                        className={`category-btn ${category === key ? 'active' : ''}`}
                        onClick={() => { setCategory(key); setFromUnit(Object.keys(val.units)[0]); setToUnit(Object.keys(val.units)[1]); }}
                    >
                        {val.name}
                    </button>
                ))}
            </div>
            <div className="converter-body">
                <div className="converter-input-group">
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="converter-input"
                    />
                    <select
                        value={fromUnit}
                        onChange={(e) => setFromUnit(e.target.value)}
                        className="converter-select"
                    >
                        {Object.entries(units[category].units).map(([key, val]) => (
                            <option key={key} value={key}>{val}</option>
                        ))}
                    </select>
                </div>
                <div className="converter-arrow">↓</div>
                <div className="converter-input-group">
                    <input
                        type="text"
                        value={convert(value, fromUnit, toUnit, category).toFixed(4)}
                        readOnly
                        className="converter-input result"
                    />
                    <select
                        value={toUnit}
                        onChange={(e) => setToUnit(e.target.value)}
                        className="converter-select"
                    >
                        {Object.entries(units[category].units).map(([key, val]) => (
                            <option key={key} value={key}>{val}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

const PomodoroTimer = () => {
    const [mode, setMode] = useState('pomodoro');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isAlarmActive, setIsAlarmActive] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [customMinutes, setCustomMinutes] = useState(10);
    const audioContextRef = useRef(null);
    const alarmIntervalRef = useRef(null);

    const presets = {
        pomodoro: { label: 'Pomodoro', minutes: 25, color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.1)' },
        shortBreak: { label: 'Descanso', minutes: 5, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
        longBreak: { label: 'Largo', minutes: 15, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
        custom: { label: 'Custom', minutes: 10, color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.1)' }
    };

    const playAlarmSound = () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.value = 880;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.5);
        } catch {
            console.log('Audio not supported');
        }
    };

    const stopAlarm = useCallback(() => {
        setIsAlarmActive(false);
        if (alarmIntervalRef.current) {
            clearInterval(alarmIntervalRef.current);
        }
    }, []);

    const triggerAlarm = useCallback(() => {
        setIsAlarmActive(true);
        
        if (soundEnabled) {
            playAlarmSound();
        }
        
        alarmIntervalRef.current = setInterval(() => {
            if (soundEnabled) {
                playAlarmSound();
            }
        }, 2000);
    }, [soundEnabled]);

    useEffect(() => {
        let interval;
        let timeoutId;
        
        if (isRunning && timeLeft > 0 && !isAlarmActive) {
            interval = setInterval(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            timeoutId = setTimeout(() => {
                triggerAlarm();
            }, 0);
        }
        
        return () => {
            clearInterval(interval);
            clearTimeout(timeoutId);
        };
    }, [isRunning, timeLeft, isAlarmActive, soundEnabled, triggerAlarm]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const startTimer = () => {
        stopAlarm();
        setIsRunning(true);
    };

    const pauseTimer = () => {
        setIsRunning(false);
    };

    const resetTimer = () => {
        stopAlarm();
        setIsRunning(false);
        const preset = presets[mode];
        const minutes = mode === 'custom' ? customMinutes : preset.minutes;
        setTimeLeft(minutes * 60);
    };

    const selectMode = (newMode) => {
        stopAlarm();
        setMode(newMode);
        setIsRunning(false);
        const preset = presets[newMode];
        const minutes = newMode === 'custom' ? customMinutes : preset.minutes;
        setTimeLeft(minutes * 60);
    };

    const handleCustomChange = (mins) => {
        const value = Math.max(1, Math.min(120, parseInt(mins) || 1));
        setCustomMinutes(value);
        if (mode === 'custom') {
            setTimeLeft(value * 60);
        }
    };

    const preset = presets[mode];
    const progress = mode === 'custom' 
        ? ((customMinutes * 60 - timeLeft) / (customMinutes * 60)) * 100
        : ((preset.minutes * 60 - timeLeft) / (preset.minutes * 60)) * 100;

    return (
        <div className="timer-widget-full" style={{ background: isAlarmActive ? preset.bgColor : 'transparent' }}>
            {/* Mode Selector */}
            <div className="timer-modes">
                {Object.entries(presets).map(([key, val]) => (
                    <button
                        key={key}
                        className={`timer-mode-btn ${mode === key ? 'active' : ''}`}
                        style={{ '--mode-color': val.color }}
                        onClick={() => selectMode(key)}
                    >
                        {val.label}
                    </button>
                ))}
            </div>

            {/* Custom Time Input */}
            {mode === 'custom' && (
                <div className="timer-custom-input">
                    <input
                        type="number"
                        min="1"
                        max="120"
                        value={customMinutes}
                        onChange={(e) => handleCustomChange(e.target.value)}
                        disabled={isRunning}
                    />
                    <span>minutos</span>
                </div>
            )}

            {/* Timer Display */}
            <div className={`timer-circle ${isAlarmActive ? 'alarm' : ''}`} style={{ borderColor: preset.color }}>
                <svg className="timer-progress" viewBox="0 0 100 100">
                    <circle
                        className="timer-progress-bg"
                        cx="50"
                        cy="50"
                        r="45"
                    />
                    <circle
                        className="timer-progress-fill"
                        cx="50"
                        cy="50"
                        r="45"
                        style={{
                            stroke: preset.color,
                            strokeDasharray: `${283 * (1 - progress / 100)} 283`
                        }}
                    />
                </svg>
                <div className="timer-display-content">
                    <span className="timer-time" style={{ color: preset.color }}>
                        {formatTime(timeLeft)}
                    </span>
                    <span className="timer-label" style={{ color: preset.color }}>
                        {isRunning ? 'En curso...' : isAlarmActive ? '¡Tiempo!' : 'Listo'}
                    </span>
                </div>
            </div>

            {/* Alarm Active Overlay */}
            {isAlarmActive && (
                <div className="timer-alarm-overlay">
                    <Bell size={48} style={{ color: preset.color, animation: 'bellRing 0.5s infinite' }} />
                    <p>¡Tiempo completado!</p>
                </div>
            )}

            {/* Controls */}
            <div className="timer-controls-full">
                {isRunning ? (
                    <button className="timer-control-btn pause" onClick={pauseTimer}>
                        <Pause size={24} />
                        Pausar
                    </button>
                ) : (
                    <button className="timer-control-btn play" onClick={startTimer} style={{ background: preset.color }}>
                        <Play size={24} />
                        {isAlarmActive ? 'Reanudar' : timeLeft < presets[mode === 'custom' ? 'pomodoro' : mode].minutes * 60 ? 'Reanudar' : 'Iniciar'}
                    </button>
                )}
                <button className="timer-control-btn reset" onClick={resetTimer}>
                    <RotateCcw size={20} />
                </button>
                <button 
                    className="timer-control-btn sound" 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    style={{ color: soundEnabled ? preset.color : '#666' }}
                >
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
            </div>

            {isAlarmActive && (
                <button className="timer-stop-alarm" onClick={stopAlarm} style={{ color: preset.color }}>
                    Detener alarma
                </button>
            )}
        </div>
    );
};

const OhmsLawCalculator = () => {
    const [variable, setVariable] = useState('voltage');
    const [values, setValues] = useState({ voltage: '', current: '', resistance: '', power: '' });

    const calculate = () => {
        const V = parseFloat(values.voltage) || 0;
        const I = parseFloat(values.current) || 0;
        const R = parseFloat(values.resistance) || 0;
        const P = parseFloat(values.power) || 0;

        let result = {};
        if (variable === 'voltage') {
            if (I && R) result.voltage = (I * R).toFixed(2);
            else if (P && I) result.voltage = (P / I).toFixed(2);
            else if (P && R) result.voltage = Math.sqrt(P * R).toFixed(2);
        } else if (variable === 'current') {
            if (V && R) result.current = (V / R).toFixed(2);
            else if (P && V) result.current = (P / V).toFixed(2);
            else if (P && R) result.current = Math.sqrt(P / R).toFixed(2);
        } else if (variable === 'resistance') {
            if (V && I) result.resistance = (V / I).toFixed(2);
            else if (P && I) result.resistance = (P / (I * I)).toFixed(2);
            else if (P && V) result.resistance = ((V * V) / P).toFixed(2);
        } else if (variable === 'power') {
            if (V && I) result.power = (V * I).toFixed(2);
            else if (V && R) result.power = ((V * V) / R).toFixed(2);
            else if (I && R) result.power = (I * I * R).toFixed(2);
        }
        return result;
    };

    const result = calculate();

    return (
        <div className="ohms-widget">
            <div className="ohms-formula">
                <div className="formula-item"><strong>V</strong> = Voltaje (V)</div>
                <div className="formula-item"><strong>I</strong> = Corriente (A)</div>
                <div className="formula-item"><strong>R</strong> = Resistencia (Ω)</div>
                <div className="formula-item"><strong>P</strong> = Potencia (W)</div>
            </div>
            <div className="ohms-variables">
                <button className={`var-btn ${variable === 'voltage' ? 'active' : ''}`} onClick={() => setVariable('voltage')}>V = I × R</button>
                <button className={`var-btn ${variable === 'current' ? 'active' : ''}`} onClick={() => setVariable('current')}>I = V / R</button>
                <button className={`var-btn ${variable === 'resistance' ? 'active' : ''}`} onClick={() => setVariable('resistance')}>R = V / I</button>
                <button className={`var-btn ${variable === 'power' ? 'active' : ''}`} onClick={() => setVariable('power')}>P = V × I</button>
            </div>
            <div className="ohms-inputs">
                {['voltage', 'current', 'resistance', 'power'].map((v) => (
                    <div key={v} className="ohms-input-group">
                        <label>{v === 'voltage' ? 'Voltaje (V)' : v === 'current' ? 'Corriente (A)' : v === 'resistance' ? 'Resistencia (Ω)' : 'Potencia (W)'}</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={values[v]}
                            onChange={(e) => setValues({ ...values, [v]: e.target.value })}
                        />
                        {result[v] && <span className="result-badge">{result[v]}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Gadgets;
