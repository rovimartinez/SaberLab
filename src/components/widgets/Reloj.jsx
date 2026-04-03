import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlarmClock, Bell, CheckCircle2, GraduationCap, Pause, Play, RotateCcw, Settings, StopCircle, Timer, Volume2, VolumeX } from 'lucide-react';

const Reloj = () => {
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

export default Reloj;

