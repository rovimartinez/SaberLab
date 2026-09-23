import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Radio, Eye, Activity, ShieldCheck, Terminal, Sliders, Cpu, Sparkles, Trash2, Pause, Play, X, ExternalLink, Maximize2, Target, Gauge, Clock, PlayCircle, StopCircle, Zap, RefreshCw, RotateCcw } from 'lucide-react';

const MATERIAL_LIST = [
    {
        key: 'black',
        label: 'Negro Mate (~10%)',
        shortName: 'NEGRO',
        reflectance: 0.10,
        fill: '#0f172a',
        stroke: '#334155',
        text: '#ffffff',
        iconBg: '#0f172a',
        iconBorder: '#475569',
        isEmpty: false
    },
    {
        key: 'white',
        label: 'Blanco (~90%)',
        shortName: 'BLANCO',
        reflectance: 0.90,
        fill: '#ffffff',
        stroke: '#94a3b8',
        text: '#0284c7',
        iconBg: '#ffffff',
        iconBorder: '#64748b',
        isEmpty: false
    },
    {
        key: 'cardboard',
        label: 'Cartón (~45%)',
        shortName: 'CARTÓN',
        reflectance: 0.45,
        fill: '#b45309',
        stroke: '#78350f',
        text: '#ffffff',
        iconBg: '#b45309',
        iconBorder: '#78350f',
        isEmpty: false
    },
    {
        key: 'none',
        label: 'Vacío (~0%)',
        shortName: 'VACÍO',
        reflectance: 0.00,
        fill: '#f1f5f9',
        stroke: '#cbd5e1',
        text: '#475569',
        iconBg: '#f8fafc',
        iconBorder: '#cbd5e1',
        isEmpty: true
    }
];

// Constantes ópticas y geométricas del PIR Parallax
const SENSOR_FOCAL = { x: 410, y: 120 };
const SCALE_PXM = 45; // 1 metro = 45 píxeles
const FOV_TOTAL_HALF_DEG = 15;      // 30° total (+-15°)
const FOV_PRECISION_HALF_DEG = 7.5; // 15° núcleo (+-7.5°)

export default function IrPirSensorSimulator() {
    // Control de Apertura en Modal Flotante
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modo de sensor activo: 'ir' o 'pir'
    const [activeTab, setActiveTab] = useState('ir');

    // ==========================================
    // ESTADO SENSOR IR (FC-51 / MH-B)
    // ==========================================
    const [materialIndex, setMaterialIndex] = useState(1); // Comienza en Blanco (90%) para fácil detección inicial
    const [distanceMm, setDistanceMm] = useState(30.0); // 5.0 a 150.0 mm
    const [trimmerPercent, setTrimmerPercent] = useState(50); // 5% a 95%

    // Estado del Monitor Serial IR en vivo
    const [serialLogs, setSerialLogs] = useState([
        { id: 1, text: '--- Puerto Serial COM3 Abierto a 9600 baudios ---', type: 'info', time: '00:00.00' },
        { id: 2, text: 'PIR & IR en línea. Monitoreando...', type: 'idle', time: '00:00.10' }
    ]);
    const [isSerialStreaming, setIsSerialStreaming] = useState(true);
    const serialBottomRef = useRef(null);

    // ==========================================
    // ESTADO SENSOR PIR PARALLAX TINKERCAD-STYLE
    // ==========================================
    const [pirSxRangeM, setPirSxRangeM] = useState(5.5); // 2.0m a 8.0m
    const [pirTxSeconds, setPirTxSeconds] = useState(4.0); // 1.5s a 10.0s
    const [pirJumperMode, setPirJumperMode] = useState('H'); // 'H' (Retriggerable) o 'L' (Single)
    const [pirWalkingSpeed, setPirWalkingSpeed] = useState(1.4); // 0.2 a 3.5 m/s
    const [pirIsCrossing, setPirIsCrossing] = useState(false);

    const [pirTarget, setPirTarget] = useState({
        distM: 4.2,
        lateralM: 0.0,
        x: 221,
        y: 120,
        prevX: 221,
        prevY: 120,
        speedCmS: 0.0
    });

    const targetRef = useRef({
        distM: 4.2,
        lateralM: 0.0,
        x: 221,
        y: 120,
        prevX: 221,
        prevY: 120,
        speedCmS: 0.0
    });

    const [pirPhysics, setPirPhysics] = useState({
        isHigh: false,
        remainingSec: 0.0,
        gradientV: 0.0,
        thresholdV: 0.18,
        insideConeStrict: false
    });

    const pirPhysicsRef = useRef({
        isHigh: false,
        remainingSec: 0.0,
        gradientV: 0.0,
        thresholdV: 0.18,
        insideConeStrict: false
    });

    const [pirSerialLogs, setPirSerialLogs] = useState([
        { id: 1, text: 'PIR Parallax en línea. Monitoreando Pin D2...', type: 'init', time: '00:00.0' },
        { id: 2, text: 'Sin gradiente térmico / Reposo', type: 'idle', time: '00:00.1' }
    ]);
    const pirSerialBottomRef = useRef(null);
    const pirSvgRef = useRef(null);
    const isDraggingRef = useRef(false);
    const crossingStateRef = useRef({ posY: -2.0, direction: 1, fixedDistM: 4.0 });

    // Escuchar tecla Escape para cerrar modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isModalOpen) {
                setIsModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen]);

    // ==========================================
    // CÁLCULOS FÍSICOS & ELECTRÓNICOS DEL FC-51 (EN MILÍMETROS)
    // ==========================================
    const currentMaterial = MATERIAL_LIST[materialIndex];
    const dMm = Math.max(5.0, distanceMm);

    // Modelo de atenuación óptica en mm optimizado para detección realista (rango útil 5 a 120mm)
    // A 10mm blanco da ~98%, a 40mm da ~65%, a 80mm da ~35%, a 150mm da ~12%
    const attenuation = Math.min(1.0, Math.pow(15.0 / dMm, 0.95));
    let opticalSignalPercent = currentMaterial.isEmpty ? 0 : (currentMaterial.reflectance * attenuation * 100);
    opticalSignalPercent = Math.min(100, Math.max(0, opticalSignalPercent));

    const vSensVolts = (5.0 * (opticalSignalPercent / 100)).toFixed(2);
    const vRefVolts = (5.0 * (trimmerPercent / 100)).toFixed(2);

    // Conmutación del comparador LM393 (Salida Activa en LOW cuando detecta)
    const isDetected = opticalSignalPercent >= trimmerPercent;

    // Salida Digital hacia Arduino D2
    const d0StateStr = isDetected ? 'LOW (0.05V)' : 'HIGH (4.95V)';

    // ==========================================
    // EMISIÓN CONTINUA DEL MONITOR SERIAL ARDUINO
    // ==========================================
    useEffect(() => {
        if (!isSerialStreaming) return;

        const interval = setInterval(() => {
            const now = new Date();
            const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 100))}`;
            
            const msgText = isDetected ? '¡OBSTÁCULO DETECTADO!' : 'Despejado / Sin detección';
            const msgType = isDetected ? 'detected' : 'idle';

            setSerialLogs(prev => {
                const nextLogs = [
                    ...prev,
                    {
                        id: Date.now() + Math.random(),
                        text: msgText,
                        type: msgType,
                        time: timeStr
                    }
                ];
                // Mantener las últimas 40 líneas
                return nextLogs.slice(-40);
            });
        }, 500); // 2 lecturas por segundo

        return () => clearInterval(interval);
    }, [isDetected, isSerialStreaming]);

    // Auto-scroll del monitor serial
    useEffect(() => {
        if (serialBottomRef.current) {
            serialBottomRef.current.scrollTop = serialBottomRef.current.scrollHeight;
        }
    }, [serialLogs]);

    const clearSerialLogs = () => {
        setSerialLogs([
            { id: Date.now(), text: '--- Monitor Serial Reiniciado ---', type: 'info', time: '00:00.00' }
        ]);
    };

    // Coordenadas SVG del Obstáculo y Rayos
    const svgMinX = 80;
    const svgMaxX = 450;
    const obstacleX = svgMaxX - ((distanceMm - 5) / (150 - 5)) * (svgMaxX - svgMinX);

    const emitterLedX = 496;
    const emitterLedY = 126;
    const receptorLedX = 496;
    const receptorLedY = 94;
    const impactPointX = obstacleX;
    const impactPointY = 110;

    const reflectionAlpha = currentMaterial.isEmpty ? 0 : Math.max(0.18, opticalSignalPercent / 100);
    const screwDegrees = (trimmerPercent / 100) * 270 - 135;

    const cycleMaterial = () => {
        setMaterialIndex((prev) => (prev + 1) % MATERIAL_LIST.length);
    };

    // ==========================================
    // CÁLCULOS & FÍSICA PIR PARALLAX (TINKERCAD)
    // ==========================================
    function metersToSvg(distM, lateralM) {
        return {
            x: SENSOR_FOCAL.x - (distM * SCALE_PXM),
            y: SENSOR_FOCAL.y + (lateralM * SCALE_PXM)
        };
    }

    function svgToMeters(x, y) {
        const distM = Math.max(0.1, Math.min(8.5, (SENSOR_FOCAL.x - x) / SCALE_PXM));
        const lateralM = Math.max(-2.6, Math.min(2.6, (y - SENSOR_FOCAL.y) / SCALE_PXM));
        return { distM, lateralM };
    }

    function generateArcPath(rMinM, rMaxM, halfAngleDeg) {
        const rMinPx = Math.max(9, rMinM * SCALE_PXM);
        const rMaxPx = Math.min(380, rMaxM * SCALE_PXM);

        const rad = (halfAngleDeg * Math.PI) / 180;
        const cosA = Math.cos(rad);
        const sinA = Math.sin(rad);

        const xMaxTop = SENSOR_FOCAL.x - (rMaxPx * cosA);
        const yMaxTop = SENSOR_FOCAL.y - (rMaxPx * sinA);
        const xMaxBot = SENSOR_FOCAL.x - (rMaxPx * cosA);
        const yMaxBot = SENSOR_FOCAL.y + (rMaxPx * sinA);

        const xMinTop = SENSOR_FOCAL.x - (rMinPx * cosA);
        const yMinTop = SENSOR_FOCAL.y - (rMinPx * sinA);
        const xMinBot = SENSOR_FOCAL.x - (rMinPx * cosA);
        const yMinBot = SENSOR_FOCAL.y + (rMinPx * sinA);

        return {
            path: `M ${xMinTop.toFixed(1)} ${yMinTop.toFixed(1)} L ${xMaxTop.toFixed(1)} ${yMaxTop.toFixed(1)} A ${rMaxPx.toFixed(1)} ${rMaxPx.toFixed(1)} 0 0 0 ${xMaxBot.toFixed(1)} ${yMaxBot.toFixed(1)} L ${xMinBot.toFixed(1)} ${yMinBot.toFixed(1)} A ${rMinPx.toFixed(1)} ${rMinPx.toFixed(1)} 0 0 1 ${xMinTop.toFixed(1)} ${yMinTop.toFixed(1)} Z`,
            maxArc: `M ${xMaxTop.toFixed(1)} ${yMaxTop.toFixed(1)} A ${rMaxPx.toFixed(1)} ${rMaxPx.toFixed(1)} 0 0 0 ${xMaxBot.toFixed(1)} ${yMaxBot.toFixed(1)}`
        };
    }

    const logPirSerial = (msg, type = 'info') => {
        const now = new Date();
        const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 100))}`;
        setPirSerialLogs(prev => {
            const next = [...prev, { id: Date.now() + Math.random(), text: msg, time: timeStr, type }];
            return next.slice(-40);
        });
    };

    const clearPirSerialLogs = () => {
        setPirSerialLogs([{ id: Date.now(), text: '--- Monitor Serie PIR Reiniciado ---', time: '00:00.0', type: 'info' }]);
    };

    // Auto-scroll del monitor serial PIR
    useEffect(() => {
        if (pirSerialBottomRef.current) {
            pirSerialBottomRef.current.scrollTop = pirSerialBottomRef.current.scrollHeight;
        }
    }, [pirSerialLogs]);

    // Simulación de cruce automático continuo
    useEffect(() => {
        if (!pirIsCrossing) return;
        const interval = setInterval(() => {
            const dt = 0.03;
            const deltaM = pirWalkingSpeed * dt * crossingStateRef.current.direction;
            crossingStateRef.current.posY += deltaM;

            if (crossingStateRef.current.posY >= 2.2) {
                crossingStateRef.current.direction = -1;
            } else if (crossingStateRef.current.posY <= -2.2) {
                crossingStateRef.current.direction = 1;
            }

            const distM = crossingStateRef.current.fixedDistM;
            const lateralM = crossingStateRef.current.posY;
            const coords = metersToSvg(distM, lateralM);

            const dx = coords.x - targetRef.current.prevX;
            const dy = coords.y - targetRef.current.prevY;
            const distPx = Math.sqrt(dx * dx + dy * dy);
            const speed = Math.max(15.0, (distPx / SCALE_PXM) * 100 * 3.0); // Velocidad activa

            const nextTarget = {
                distM,
                lateralM,
                x: coords.x,
                y: coords.y,
                prevX: coords.x,
                prevY: coords.y,
                speedCmS: speed
            };
            targetRef.current = nextTarget;
            setPirTarget(nextTarget);
        }, 30);

        return () => clearInterval(interval);
    }, [pirIsCrossing, pirWalkingSpeed]);

    // Motor de física en tiempo real para el PIR Parallax
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isDraggingRef.current && !pirIsCrossing) {
                targetRef.current.speedCmS *= 0.70;
                if (targetRef.current.speedCmS < 0.05) targetRef.current.speedCmS = 0;
            }

            const currentT = targetRef.current;
            const rM = Math.sqrt(currentT.distM * currentT.distM + currentT.lateralM * currentT.lateralM);
            const angleDeg = Math.atan2(Math.abs(currentT.lateralM), currentT.distM) * (180 / Math.PI);

            const isWithinAngle = angleDeg <= FOV_TOTAL_HALF_DEG;
            const isWithinDistance = (rM >= 0.20 && rM <= pirSxRangeM);
            const insideConeStrict = isWithinAngle && isWithinDistance;

            let grad = 0.0;
            if (insideConeStrict) {
                const angleFactor = Math.cos((angleDeg / FOV_TOTAL_HALF_DEG) * (Math.PI / 2));
                const distanceFactor = Math.min(2.5, Math.pow(pirSxRangeM / Math.max(0.2, rM), 1.1));
                grad = Math.min(1.0, (currentT.speedCmS / 6.0) * angleFactor * distanceFactor);
            }

            const pctSx = Math.round(((pirSxRangeM - 2.0) / 6.0) * 100);
            const th = 0.24 - (pctSx / 100) * 0.16; // Umbral optimizado entre 0.08 y 0.24 V/s
            const gradientExceeded = insideConeStrict && (grad >= th);

            let newIsHigh = pirPhysicsRef.current.isHigh;
            let newRemaining = pirPhysicsRef.current.remainingSec;

            if (gradientExceeded) {
                if (pirJumperMode === 'H') {
                    if (!newIsHigh) {
                        newIsHigh = true;
                        logPirSerial("¡MOVIMIENTO TÉRMICO DETECTADO! Pin D2 conmuta a HIGH (3.3V)", "detected");
                    }
                    newRemaining = pirTxSeconds;
                } else {
                    if (!newIsHigh) {
                        newIsHigh = true;
                        newRemaining = pirTxSeconds;
                        logPirSerial("Disparo único activo: Pin D2 en HIGH durante Tx fijo.", "detected");
                    }
                }
            } else if (newIsHigh) {
                newRemaining -= 0.05;
                if (newRemaining <= 0) {
                    newRemaining = 0;
                    newIsHigh = false;
                    logPirSerial("Temporizador Tx finalizado -> Pin D2 cae a LOW (0.0V)", "idle");
                }
            }

            const updatedPhysics = {
                isHigh: newIsHigh,
                remainingSec: Math.max(0, newRemaining),
                gradientV: grad,
                thresholdV: th,
                insideConeStrict
            };

            pirPhysicsRef.current = updatedPhysics;
            setPirPhysics(updatedPhysics);
        }, 50);

        return () => clearInterval(interval);
    }, [pirSxRangeM, pirTxSeconds, pirJumperMode, pirIsCrossing]);

    // Handlers de arrastre del orbe térmico
    const handleSvgPointer = (clientX, clientY) => {
        if (!pirSvgRef.current) return;
        const pt = pirSvgRef.current.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const svgPt = pt.matrixTransform(pirSvgRef.current.getScreenCTM().inverse());
        const metric = svgToMeters(svgPt.x, svgPt.y);
        const bounded = metersToSvg(metric.distM, metric.lateralM);

        const dx = bounded.x - targetRef.current.prevX;
        const dy = bounded.y - targetRef.current.prevY;
        const distPx = Math.sqrt(dx * dx + dy * dy);
        const speed = Math.max(12.0, (distPx / SCALE_PXM) * 100 * 3.5);

        const nextTarget = {
            distM: metric.distM,
            lateralM: metric.lateralM,
            x: bounded.x,
            y: bounded.y,
            prevX: bounded.x,
            prevY: bounded.y,
            speedCmS: speed
        };

        targetRef.current = nextTarget;
        setPirTarget(nextTarget);
    };

    const handlePointerDown = (e) => {
        if (pirIsCrossing) return;
        isDraggingRef.current = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        handleSvgPointer(clientX, clientY);

        const onMove = (moveEvt) => {
            if (!isDraggingRef.current) return;
            const cx = moveEvt.touches ? moveEvt.touches[0].clientX : moveEvt.clientX;
            const cy = moveEvt.touches ? moveEvt.touches[0].clientY : moveEvt.clientY;
            handleSvgPointer(cx, cy);
        };

        const onUp = () => {
            isDraggingRef.current = false;
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onUp);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onUp);
    };

    const toggleCrossing = () => {
        if (pirIsCrossing) {
            setPirIsCrossing(false);
            logPirSerial("Simulación de cruzamiento transversal detenida.", "info");
        } else {
            crossingStateRef.current.fixedDistM = Math.min(pirSxRangeM * 0.72, 4.0);
            crossingStateRef.current.posY = -2.0;
            crossingStateRef.current.direction = 1;
            setPirIsCrossing(true);
            logPirSerial(`Iniciando cruce de objeto a ${crossingStateRef.current.fixedDistM.toFixed(1)}m (Velocidad: ${pirWalkingSpeed.toFixed(1)} m/s).`, "info");
        }
    };

    const toggleJumper = () => {
        if (pirJumperMode === 'H') {
            setPirJumperMode('L');
            logPirSerial("Jumper cambiado a 'L': Disparo único no retriggerable.", "info");
        } else {
            setPirJumperMode('H');
            logPirSerial("Jumper cambiado a 'H': Modo retriggerable continuo activo.", "info");
        }
    };


    // Render del contenido del simulador
    const renderSimulatorContent = () => (
        <div style={{ color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <style>{`
                @keyframes rayForward {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: 20; }
                }
                @keyframes rayReturn {
                    from { stroke-dashoffset: 20; }
                    to { stroke-dashoffset: 0; }
                }
                .ray-incident-anim {
                    stroke-dasharray: 6 4;
                    animation: rayForward 0.8s linear infinite;
                }
                .ray-reflected-anim {
                    stroke-dasharray: 6 4;
                    animation: rayReturn 0.8s linear infinite;
                }
                .blueprint-grid-light {
                    background-size: 20px 20px;
                    background-image: 
                        linear-gradient(to right, rgba(2, 132, 199, 0.12) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(2, 132, 199, 0.12) 1px, transparent 1px);
                }
                .glow-led-red-light {
                    filter: drop-shadow(0 0 3px #ef4444) drop-shadow(0 0 7px rgba(239, 68, 68, 0.8));
                }
                .glow-led-green-light {
                    filter: drop-shadow(0 0 4px #10b981) drop-shadow(0 0 8px rgba(16, 185, 129, 0.8));
                }
                .ir-pir-sim-title {
                    margin: 0 !important;
                    font-size: 1.25rem !important;
                    font-weight: 900 !important;
                    color: #0c1a2e !important;
                    letter-spacing: -0.01em !important;
                    opacity: 1 !important;
                }
                .ir-pir-sim-subtitle {
                    margin: 0 !important;
                    font-size: 0.88rem !important;
                    color: #1e3a5f !important;
                    font-weight: 700 !important;
                    opacity: 1 !important;
                }
            `}</style>

            {/* Cabecera y Selector de Pestañas */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        background: '#e0f2fe',
                        border: '2px solid #0284c7',
                        borderRadius: '12px',
                        padding: '0.6rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Activity size={24} color="#0369a1" />
                    </div>
                    <div>
                        <h4 className="ir-pir-sim-title">
                            Simulador de Sensores Ópticos &amp; Calibración
                        </h4>
                        <p className="ir-pir-sim-subtitle">
                            Módulo Infrarrojo FC-51 / MH-B con Comparador LM393 y Detector PIR (HC-SR501)
                        </p>
                    </div>
                </div>

                {/* Switch de Modo */}
                <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.35rem', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('ir')}
                        style={{
                            padding: '0.6rem 1.15rem',
                            borderRadius: '9px',
                            border: 'none',
                            background: activeTab === 'ir' ? '#0284c7' : 'transparent',
                            color: activeTab === 'ir' ? '#ffffff' : '#1e293b',
                            fontWeight: '900',
                            fontSize: '0.86rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: activeTab === 'ir' ? '0 2px 8px rgba(2, 132, 199, 0.4)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Radio size={16} /> Sensor Infrarrojo (FC-51 / IR)
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('pir')}
                        style={{
                            padding: '0.6rem 1.15rem',
                            borderRadius: '9px',
                            border: 'none',
                            background: activeTab === 'pir' ? '#059669' : 'transparent',
                            color: activeTab === 'pir' ? '#ffffff' : '#1e293b',
                            fontWeight: '900',
                            fontSize: '0.86rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: activeTab === 'pir' ? '0 2px 8px rgba(5, 150, 105, 0.4)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Eye size={16} /> Detector PIR (HC-SR501)
                    </button>
                </div>
            </div>

            {/* CUERPO DEL SIMULADOR: SENSOR IR FC-51 */}
            {activeTab === 'ir' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', alignItems: 'stretch' }}>
                    {/* COLUMNA IZQUIERDA: ESPACIO ÓPTICO + TELEMETRÍA LM393 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: '1 1 58%' }}>
                        
                        {/* TARJETA 1: ESPACIO ÓPTICO */}
                        <section style={{
                            background: '#ffffff',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '14px',
                            padding: '1.1rem',
                            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            {/* Cabecera Espacio Óptico */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', paddingBottom: '0.5rem', borderBottom: '1.5px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Radio size={17} color="#0284c7" />
                                    <h2 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '900', fontFamily: 'monospace', letterSpacing: '0.08em', color: '#0369a1', textTransform: 'uppercase' }}>
                                        ESPACIO ÓPTICO
                                    </h2>
                                </div>

                                {/* Selector de Material Interactivo */}
                                <button
                                    type="button"
                                    onClick={cycleMaterial}
                                    title="Haz clic para cambiar el objeto frente al sensor"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.45rem',
                                        background: '#f8fafc',
                                        border: '1.5px solid #94a3b8',
                                        padding: '0.4rem 0.75rem',
                                        borderRadius: '8px',
                                        fontSize: '0.78rem',
                                        fontFamily: 'monospace',
                                        color: '#0f172a',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                                    }}
                                >
                                    <span style={{ color: '#475569' }}>Objeto:</span>
                                    <span style={{
                                        width: '11px',
                                        height: '11px',
                                        borderRadius: '50%',
                                        backgroundColor: currentMaterial.iconBg,
                                        border: `1.5px solid ${currentMaterial.iconBorder}`,
                                        display: 'inline-block'
                                    }} />
                                    <strong style={{ color: '#0284c7' }}>{currentMaterial.label}</strong>
                                    <RefreshCw size={13} color="#0284c7" style={{ marginLeft: '2px' }} />
                                </button>
                            </div>

                            {/* Viewport SVG Óptico Panorámico */}
                            <div className="blueprint-grid-light" style={{
                                width: '100%',
                                height: '215px',
                                background: '#f8fafc',
                                borderRadius: '10px',
                                border: '1.5px solid #94a3b8',
                                overflow: 'hidden',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: 'inset 0 0 15px rgba(0,0,0,0.03)'
                            }}>
                                <svg viewBox="0 0 920 220" style={{ width: '100%', height: '100%', userSelect: 'none' }}>
                                    <defs>
                                        {/* Flechas direccionales ópticas */}
                                        <marker id="arrow-inc" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#dc2626" />
                                        </marker>
                                        <marker id="arrow-refl" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                                            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7" />
                                        </marker>

                                        {/* Degradado Fotodiodo Receptor Negro */}
                                        <linearGradient id="photodiodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#475569" />
                                            <stop offset="40%" stopColor="#1e293b" />
                                            <stop offset="80%" stopColor="#0f172a" />
                                            <stop offset="100%" stopColor="#020617" />
                                        </linearGradient>

                                        {/* Degradado LED Emisor Transparente */}
                                        <linearGradient id="emitterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                                            <stop offset="35%" stopColor="#e2e8f0" stopOpacity="0.85" />
                                            <stop offset="80%" stopColor="#94a3b8" stopOpacity="0.6" />
                                            <stop offset="100%" stopColor="#475569" stopOpacity="0.4" />
                                        </linearGradient>

                                        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="2" result="blur" />
                                            <feMerge>
                                                <feMergeNode in="blur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>

                                    {/* Línea de cota inferior para referencia métrica */}
                                    <line x1="80" y1="180" x2="520" y2="180" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />

                                    {/* Abanico de radiación infrarroja emitida */}
                                    <polygon
                                        points={`${emitterLedX},${emitterLedY} ${impactPointX},${impactPointY - 35} ${impactPointX},${impactPointY + 35}`}
                                        fill="#dc2626"
                                        opacity="0.1"
                                    />

                                    {/* RAYO 1: INCIDENTE */}
                                    <line
                                        x1={emitterLedX}
                                        y1={emitterLedY}
                                        x2={impactPointX}
                                        y2={impactPointY}
                                        stroke="#dc2626"
                                        strokeWidth="3"
                                        className="ray-incident-anim"
                                        filter="url(#softGlow)"
                                        markerEnd="url(#arrow-inc)"
                                    />

                                    {/* RAYO 2: REFLEJADO */}
                                    <line
                                        x1={impactPointX}
                                        y1={impactPointY}
                                        x2={receptorLedX}
                                        y2={receptorLedY}
                                        stroke="#0284c7"
                                        strokeWidth="3"
                                        className="ray-reflected-anim"
                                        filter="url(#softGlow)"
                                        markerEnd="url(#arrow-refl)"
                                        style={{ opacity: reflectionAlpha }}
                                    />

                                    {/* Punto de impacto óptico */}
                                    <circle
                                        cx={impactPointX}
                                        cy={impactPointY}
                                        r="4.5"
                                        fill="#dc2626"
                                        filter="url(#softGlow)"
                                        style={{ opacity: currentMaterial.isEmpty ? 0 : Math.min(1, reflectionAlpha * 1.6) }}
                                    />

                                    {/* OBSTÁCULO INTERACTIVO CLICKEABLE */}
                                    <g
                                        style={{ cursor: 'pointer', transition: 'transform 0.08s ease' }}
                                        onClick={cycleMaterial}
                                        transform={`translate(${obstacleX - 240}, 0)`}
                                    >
                                        <ellipse cx="240" cy="172" rx="12" ry="3.5" fill="#334155" opacity="0.4" />
                                        <rect
                                            x="230"
                                            y="38"
                                            width="20"
                                            height="130"
                                            rx="3.5"
                                            fill={currentMaterial.fill}
                                            stroke={currentMaterial.stroke}
                                            strokeWidth="2"
                                        />
                                        <line
                                            x1="234"
                                            y1="41"
                                            x2="234"
                                            y2="164"
                                            stroke="#cbd5e1"
                                            strokeWidth="1.2"
                                            opacity={currentMaterial.isEmpty ? 0.1 : (currentMaterial.key === 'white' ? 0.8 : 0.4)}
                                        />

                                        {/* Texto vertical del material */}
                                        <text
                                            x="240"
                                            y="103"
                                            fill={currentMaterial.text}
                                            fontSize="9.5"
                                            fontFamily="monospace"
                                            fontWeight="900"
                                            textAnchor="middle"
                                            transform="rotate(-90 240 103)"
                                        >
                                            {currentMaterial.shortName}
                                        </text>

                                        {/* Píldora "CLICK" interactiva */}
                                        <g transform="translate(220, 12)">
                                            <rect x="0" y="0" width="40" height="17" rx="8.5" fill="#ffffff" stroke="#0284c7" strokeWidth="1.8" opacity="0.98" />
                                            <text x="20" y="12" fill="#0284c7" fontSize="8" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">CLICK</text>
                                        </g>
                                    </g>

                                    {/* MÓDULO SENSOR FC-51 / MH-B PROPORCIONAL Y REALISTA */}
                                    <g transform="translate(535, 62)">
                                        {/* PCB Azul Marino Elongado */}
                                        <rect x="0" y="0" width="270" height="90" rx="5" fill="#0284c7" stroke="#0369a1" strokeWidth="2.5" />
                                        <text x="216" y="15" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="900">MH-B</text>

                                        {/* Serigrafía técnica auténtica en alto contraste */}
                                        <text x="144" y="24" fill="#ffffff" fontSize="7.5" fontFamily="sans-serif" fontWeight="bold">电源指示</text>
                                        <text x="144" y="74" fill="#d1fae5" fontSize="7.5" fontFamily="sans-serif" fontWeight="bold">输出指示</text>

                                        {/* Orificio de fijación de tornillo M3 */}
                                        <circle cx="198" cy="45" r="9.5" fill="#f8fafc" stroke="#475569" strokeWidth="2" />

                                        {/* Patillas de alambre de los 2 componentes frontales */}
                                        <line x1="0" y1="26" x2="-24" y2="26" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />
                                        <line x1="0" y1="36" x2="-24" y2="36" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />
                                        <line x1="0" y1="56" x2="-24" y2="56" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />
                                        <line x1="0" y1="66" x2="-24" y2="66" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />

                                        {/* 1. Receptor IR: Fotodiodo Negro de 5mm (Arriba) */}
                                        <g transform="translate(-54, 21)">
                                            <rect x="11" y="0" width="19" height="19" rx="1.5" fill="url(#photodiodeGrad)" stroke="#0f172a" strokeWidth="1.5" />
                                            <ellipse cx="11" cy="9.5" rx="9.5" ry="9.5" fill="url(#photodiodeGrad)" stroke="#1e293b" strokeWidth="1.5" />
                                            <ellipse cx="8" cy="6.5" rx="2.5" ry="4.5" fill="#94a3b8" opacity="0.5" />
                                            <circle
                                                cx="11"
                                                cy="9.5"
                                                r="4.5"
                                                fill="#38bdf8"
                                                opacity={currentMaterial.isEmpty ? 0 : (opticalSignalPercent / 100) * 0.95}
                                                filter="url(#softGlow)"
                                            />
                                        </g>
                                        <text x="-56" y="15" fill="#0f172a" fontSize="9" fontFamily="monospace" fontWeight="900">Receptor (IR)</text>

                                        {/* 2. Emisor IR: LED Transparente de 5mm (Abajo) */}
                                        <g transform="translate(-54, 51)">
                                            <rect x="11" y="0" width="19" height="19" rx="1.5" fill="url(#emitterGrad)" stroke="#64748b" strokeWidth="1.5" />
                                            <ellipse cx="11" cy="9.5" rx="9.5" ry="9.5" fill="url(#emitterGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
                                            <path d="M 20 4.5 L 15 9.5 L 20 14.5" fill="none" stroke="#475569" strokeWidth="1.3" />
                                            <circle cx="11" cy="9.5" r="5.5" fill="#dc2626" opacity="0.75" filter="url(#softGlow)" />
                                        </g>
                                        <text x="-56" y="85" fill="#b91c1c" fontSize="9" fontFamily="monospace" fontWeight="900">Emisor (IR)</text>

                                        {/* Trimmer Azul Cuadrado con Tornillo en Cruz Giratorio */}
                                        <g transform="translate(35, 23)">
                                            <rect x="0" y="0" width="44" height="44" rx="3.5" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
                                            <circle cx="22" cy="22" r="14.5" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
                                            <g transform={`rotate(${screwDegrees} 22 22)`}>
                                                <circle cx="22" cy="22" r="10.5" fill="#e2e8f0" />
                                                <line x1="15" y1="22" x2="29" y2="22" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
                                                <line x1="22" y1="15" x2="22" y2="29" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
                                            </g>
                                        </g>

                                        {/* Chip Comparador LM393 SMD */}
                                        <g transform="translate(92, 28)">
                                            <rect x="0" y="0" width="38" height="34" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                                            <line x1="5" y1="-2" x2="5" y2="0" stroke="#cbd5e1" strokeWidth="2" />
                                            <line x1="14" y1="-2" x2="14" y2="0" stroke="#cbd5e1" strokeWidth="2" />
                                            <line x1="23" y1="-2" x2="23" y2="0" stroke="#cbd5e1" strokeWidth="2" />
                                            <line x1="32" y1="-2" x2="32" y2="0" stroke="#cbd5e1" strokeWidth="2" />
                                            <line x1="5" y1="34" x2="5" y2="36" stroke="#cbd5e1" strokeWidth="2" />
                                            <line x1="14" y1="34" x2="14" y2="36" stroke="#cbd5e1" strokeWidth="2" />
                                            <line x1="23" y1="34" x2="23" y2="36" stroke="#cbd5e1" strokeWidth="2" />
                                            <line x1="32" y1="34" x2="32" y2="36" stroke="#cbd5e1" strokeWidth="2" />
                                            <circle cx="5.5" cy="5.5" r="1.2" fill="#94a3b8" />
                                            <text x="7.5" y="21" fill="#f8fafc" fontSize="8.5" fontFamily="monospace" fontWeight="bold">LM393</text>
                                        </g>

                                        {/* LED SMD PWR (Rojo Fijo) */}
                                        <g transform="translate(148, 29)">
                                            <rect x="0" y="0" width="9" height="5.5" rx="1" fill="#ef4444" className="glow-led-red-light" />
                                            <text x="4.5" y="-3" fill="#ffffff" fontSize="7" fontFamily="monospace" fontWeight="900" textAnchor="middle">PWR</text>
                                        </g>

                                        {/* LED SMD OUT (Verde Conmutable) */}
                                        <g transform="translate(148, 56)">
                                            <rect
                                                x="0"
                                                y="0"
                                                width="9"
                                                height="5.5"
                                                rx="1"
                                                fill={isDetected ? '#10b981' : '#0f172a'}
                                                className={isDetected ? 'glow-led-green-light' : ''}
                                                style={{ transition: 'all 0.2s ease' }}
                                            />
                                            <text x="4.5" y="14.5" fill="#0f172a" fontSize="7" fontFamily="monospace" fontWeight="900" textAnchor="middle">OUT</text>
                                        </g>

                                        {/* Conector Trasero de 3 Pines (OUT, GND, VCC) */}
                                        <g transform="translate(268, 14)">
                                            <rect x="0" y="0" width="11" height="62" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                                            <line x1="11" y1="12" x2="34" y2="12" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />
                                            <text x="-5" y="15.5" fill="#0284c7" fontSize="9" fontFamily="monospace" fontWeight="900" textAnchor="end">OUT</text>
                                            <line x1="11" y1="31" x2="34" y2="31" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />
                                            <text x="-5" y="34.5" fill="#334155" fontSize="9" fontFamily="monospace" fontWeight="900" textAnchor="end">GND</text>
                                            <line x1="11" y1="50" x2="34" y2="50" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />
                                            <text x="-5" y="53.5" fill="#dc2626" fontSize="9" fontFamily="monospace" fontWeight="900" textAnchor="end">VCC</text>
                                        </g>
                                    </g>
                                </svg>
                            </div>

                            {/* CONTROLES SIMÉTRICOS GEMELOS EN LA BASE */}
                            <div style={{ marginTop: '0.85rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                                {/* Slider 1: Posición del Objeto en Milímetros */}
                                <div style={{
                                    background: '#f8fafc',
                                    border: '1.5px solid #cbd5e1',
                                    borderRadius: '10px',
                                    padding: '0.75rem 0.9rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: '900', color: '#0369a1', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            ↔ DISTANCIA DEL OBJETO
                                        </span>
                                        <span style={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.78rem',
                                            fontWeight: '900',
                                            color: '#0284c7',
                                            background: '#e0f2fe',
                                            padding: '0.2rem 0.55rem',
                                            borderRadius: '6px',
                                            border: '1.5px solid #0284c7'
                                        }}>
                                            {distanceMm.toFixed(0)} mm ({(distanceMm / 10).toFixed(1)} cm)
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="5"
                                        max="150"
                                        step="1"
                                        value={distanceMm}
                                        onChange={(e) => setDistanceMm(parseFloat(e.target.value))}
                                        style={{ width: '100%', accentColor: '#0284c7', cursor: 'ew-resize' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'monospace', color: '#334155', fontWeight: '700', marginTop: '0.3rem' }}>
                                        <span>5 mm (Muy cerca)</span>
                                        <span>50 mm (~5cm)</span>
                                        <span>150 mm (15cm)</span>
                                    </div>
                                </div>

                                {/* Slider 2: Trimmer Azul (Vref) */}
                                <div style={{
                                    background: '#f8fafc',
                                    border: '1.5px solid #cbd5e1',
                                    borderRadius: '10px',
                                    padding: '0.75rem 0.9rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                                        <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: '900', color: '#b45309', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            🔩 TRIMMER AZUL (VREF)
                                        </span>
                                        <span style={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.78rem',
                                            fontWeight: '900',
                                            color: '#b45309',
                                            background: '#fef3c7',
                                            padding: '0.2rem 0.55rem',
                                            borderRadius: '6px',
                                            border: '1.5px solid #f59e0b'
                                        }}>
                                            {trimmerPercent}% ({vRefVolts}V)
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="5"
                                        max="95"
                                        step="1"
                                        value={trimmerPercent}
                                        onChange={(e) => setTrimmerPercent(parseInt(e.target.value))}
                                        style={{ width: '100%', accentColor: '#d97706', cursor: 'ew-resize' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'monospace', color: '#334155', fontWeight: '700', marginTop: '0.3rem' }}>
                                        <span>Sensible (Larga Dist.)</span>
                                        <span>Estricto (Corta)</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* TARJETA 2: TELEMETRÍA LM393 & PIN D2 */}
                        <section style={{
                            background: '#ffffff',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '14px',
                            padding: '1.1rem',
                            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.65rem'
                        }}>
                            {/* Cabecera Telemetría */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '0.45rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                    <Cpu size={16} color="#0284c7" />
                                    <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '900', fontFamily: 'monospace', letterSpacing: '0.08em', color: '#0369a1', textTransform: 'uppercase' }}>
                                        TELEMETRÍA LM393 & PIN D2
                                    </h3>
                                </div>
                                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#334155', fontWeight: '900' }}>VCC = +5.0V</span>
                            </div>

                            {/* Cuadrícula interna de la Telemetría */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'stretch' }}>
                                
                                {/* Bloque 1: PIN OUT / D2 */}
                                <div style={{
                                    background: isDetected ? '#f0fdf4' : '#fffbeb',
                                    padding: '0.75rem',
                                    borderRadius: '10px',
                                    border: `1.5px solid ${isDetected ? '#86efac' : '#fde68a'}`,
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}>
                                    <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', textTransform: 'uppercase', color: '#475569', fontWeight: '900' }}>PIN OUT / D2</span>
                                    <span style={{
                                        fontFamily: 'monospace',
                                        fontSize: '1.1rem',
                                        fontWeight: '900',
                                        color: isDetected ? '#15803d' : '#b45309',
                                        margin: '0.2rem 0'
                                    }}>
                                        {d0StateStr}
                                    </span>
                                    <span style={{ fontSize: '0.72rem', color: isDetected ? '#166534' : '#92400e', fontFamily: 'monospace', fontWeight: '800' }}>
                                        {isDetected ? 'Drenado a GND (Activo)' : 'Pull-up interna activa'}
                                    </span>
                                </div>

                                {/* Bloque 2: LED SMD OUT */}
                                <div style={{
                                    background: '#f8fafc',
                                    padding: '0.75rem',
                                    borderRadius: '10px',
                                    border: '1.5px solid #cbd5e1',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', textTransform: 'uppercase', color: '#475569', fontWeight: '900' }}>LED SMD OUT</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', margin: '0.25rem 0' }}>
                                        <span style={{
                                            width: '13px',
                                            height: '13px',
                                            borderRadius: '50%',
                                            backgroundColor: isDetected ? '#10b981' : '#64748b',
                                            boxShadow: isDetected ? '0 0 8px #10b981' : 'none'
                                        }} />
                                        <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: '900', color: isDetected ? '#15803d' : '#334155' }}>
                                            {isDetected ? 'ENCENDIDO' : 'APAGADO'}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.72rem', color: '#475569', fontFamily: 'monospace', fontWeight: '700' }}>Detección activa</span>
                                </div>

                                {/* Bloque 3: Tensiones Analógicas con Barra Comparativa */}
                                <div style={{
                                    background: '#f8fafc',
                                    padding: '0.75rem',
                                    borderRadius: '10px',
                                    border: '1.5px solid #cbd5e1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    gridColumn: 'span 2'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontFamily: 'monospace', marginBottom: '0.4rem' }}>
                                        <span style={{ color: '#0f172a', fontWeight: '900' }}>Tensiones Analógicas:</span>
                                        <span style={{ fontWeight: '900', color: isDetected ? '#15803d' : '#334155', fontSize: '0.75rem' }}>
                                            {isDetected ? 'V_sens ≥ V_ref (LM393 Conmutado)' : 'V_sens < V_ref (En Reposo)'}
                                        </span>
                                    </div>

                                    {/* Barra horizontal con aguja de umbral */}
                                    <div style={{ width: '100%', background: '#e2e8f0', height: '17px', borderRadius: '4px', position: 'relative', overflow: 'hidden', border: '1.5px solid #94a3b8', display: 'flex', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <div style={{
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                                            width: `${opticalSignalPercent.toFixed(1)}%`,
                                            transition: 'width 0.1s ease'
                                        }} />
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            bottom: 0,
                                            width: '3.5px',
                                            background: '#d97706',
                                            boxShadow: '0 0 6px rgba(217, 119, 6, 0.9)',
                                            left: `${trimmerPercent}%`,
                                            zIndex: 10,
                                            transition: 'left 0.1s ease'
                                        }} />
                                    </div>

                                    {/* Valores digitales y nota explicativa */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'monospace', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0f172a', fontWeight: '700' }}>
                                                <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#0284c7', display: 'inline-block' }} />
                                                V_sens: <strong style={{ color: '#0369a1', fontWeight: '900' }}>{vSensVolts}V ({opticalSignalPercent.toFixed(0)}%)</strong>
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0f172a', fontWeight: '700' }}>
                                                <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#d97706', display: 'inline-block' }} />
                                                V_ref: <strong style={{ color: '#b45309', fontWeight: '900' }}>{vRefVolts}V ({trimmerPercent}%)</strong>
                                            </span>
                                        </div>
                                        <span style={{ color: '#334155', fontSize: '0.72rem', fontWeight: '700' }}>
                                            {isDetected
                                                ? `Luz reflejada (${vSensVolts}V) ≥ umbral (${vRefVolts}V) → Conmuta a 0V`
                                                : `Luz insuficiente (${vSensVolts}V) < umbral (${vRefVolts}V) → Reposo a 5V`}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </section>

                    </div>

                    {/* COLUMNA DERECHA: FIRMWARE ARDUINO C++ + MONITOR SERIAL ACTIVO */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: '1 1 38%' }}>
                        
                        {/* 1. Editor C++ con Ejecución Resaltada */}
                        <section style={{
                            background: '#ffffff',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '14px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem'
                        }}>
                            {/* Barra de Archivo del IDE */}
                            <div style={{
                                background: '#020617',
                                padding: '0.55rem 0.85rem',
                                borderBottom: '1.5px solid #1e293b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                color: '#f8fafc'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#f8fafc', fontWeight: '900', fontSize: '0.78rem' }}>
                                    <Terminal size={14} color="#38bdf8" /> control_obstaculo.ino
                                </span>
                                <span style={{
                                    fontSize: '0.7rem',
                                    color: '#38bdf8',
                                    background: 'rgba(56, 189, 248, 0.12)',
                                    padding: '0.15rem 0.45rem',
                                    borderRadius: '6px',
                                    border: '1.5px solid #0284c7',
                                    fontWeight: '900'
                                }}>
                                    Pin D2 ← OUT
                                </span>
                            </div>

                            {/* Código C++ con Resaltado Dinámico de Alto Contraste */}
                            <div style={{
                                padding: '0.85rem',
                                background: '#090d16',
                                color: '#f8fafc',
                                fontSize: '0.78rem',
                                lineHeight: '1.6',
                                userSelect: 'none'
                            }}>
                                <span style={{ color: '#94a3b8', fontWeight: '600' }}>// Sensor IR FC-51 conectado a pin 2</span><br />
                                <span style={{ color: '#c084fc', fontWeight: '900' }}>int</span> <span style={{ color: '#f8fafc' }}>pinSensor = </span><span style={{ color: '#fbbf24', fontWeight: '900' }}>2</span>;<br /><br />
                                <span style={{ color: '#c084fc', fontWeight: '900' }}>void</span> <span style={{ color: '#38bdf8', fontWeight: '900' }}>setup</span>() &#123;<br />
                                &nbsp;&nbsp;<span style={{ color: '#38bdf8', fontWeight: '900' }}>pinMode</span>(pinSensor, <span style={{ color: '#4ade80', fontWeight: '900' }}>INPUT</span>);<br />
                                &nbsp;&nbsp;<span style={{ color: '#38bdf8', fontWeight: '900' }}>Serial</span>.<span style={{ color: '#38bdf8', fontWeight: '900' }}>begin</span>(<span style={{ color: '#fbbf24', fontWeight: '900' }}>9600</span>);<br />
                                &#125;<br /><br />
                                <span style={{ color: '#c084fc', fontWeight: '900' }}>void</span> <span style={{ color: '#38bdf8', fontWeight: '900' }}>loop</span>() &#123;<br />
                                &nbsp;&nbsp;<span style={{ color: '#c084fc', fontWeight: '900' }}>int</span> <span style={{ color: '#f8fafc' }}>estado = </span><span style={{ color: '#38bdf8', fontWeight: '900' }}>digitalRead</span>(pinSensor);<br /><br />

                                {/* Rama IF: Detección activa en LOW (0V) */}
                                <div style={{
                                    padding: '0.45rem 0.65rem',
                                    borderRadius: '6px',
                                    borderLeft: `4px solid ${isDetected ? '#4ade80' : 'transparent'}`,
                                    background: isDetected ? 'rgba(34, 197, 94, 0.18)' : 'transparent',
                                    color: isDetected ? '#4ade80' : '#64748b',
                                    opacity: isDetected ? 1 : 0.45,
                                    transition: 'all 0.2s ease',
                                    margin: '0.15rem 0'
                                }}>
                                    &nbsp;&nbsp;<span style={{ color: isDetected ? '#c084fc' : 'inherit', fontWeight: '900' }}>if</span> (estado == <span style={{ color: isDetected ? '#38bdf8' : 'inherit', fontWeight: '900' }}>LOW</span>) &#123;<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#38bdf8', fontWeight: '900' }}>Serial</span>.<span style={{ color: '#38bdf8', fontWeight: '900' }}>println</span>(<span style={{ color: '#4ade80', fontWeight: '900' }}>"¡OBSTÁCULO DETECTADO!"</span>);<br />
                                    &nbsp;&nbsp;&#125;
                                </div>

                                {/* Rama ELSE: Reposo en HIGH (5V) */}
                                <div style={{
                                    padding: '0.45rem 0.65rem',
                                    borderRadius: '6px',
                                    borderLeft: `4px solid ${!isDetected ? '#f59e0b' : 'transparent'}`,
                                    background: !isDetected ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
                                    color: !isDetected ? '#fbbf24' : '#64748b',
                                    opacity: !isDetected ? 1 : 0.45,
                                    transition: 'all 0.2s ease',
                                    margin: '0.15rem 0'
                                }}>
                                    &nbsp;&nbsp;<span style={{ color: !isDetected ? '#c084fc' : 'inherit', fontWeight: '900' }}>else</span> &#123;<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#38bdf8', fontWeight: '900' }}>Serial</span>.<span style={{ color: '#38bdf8', fontWeight: '900' }}>println</span>(<span style={{ color: '#f8fafc', fontWeight: '900' }}>"Despejado / Sin detección"</span>);<br />
                                    &nbsp;&nbsp;&#125;<br />
                                    &#125;
                                </div>
                            </div>
                        </section>

                        {/* 2. MONITOR SERIAL ARDUINO EN VIVO CON STREAMING Y LOGS */}
                        <section style={{
                            background: '#090d16',
                            border: '1.5px solid #1e293b',
                            borderRadius: '14px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            fontFamily: 'monospace',
                            flex: 1,
                            minHeight: '200px'
                        }}>
                            {/* Cabecera del Monitor Serial */}
                            <div style={{
                                background: '#020617',
                                padding: '0.5rem 0.85rem',
                                borderBottom: '1px solid #1e293b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Terminal size={14} color="#38bdf8" />
                                    <span style={{ fontSize: '0.76rem', fontWeight: '900', color: '#f8fafc', letterSpacing: '0.04em' }}>
                                        MONITOR SERIAL (COM3 - 9600 BAUD)
                                    </span>
                                    <span style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: isSerialStreaming ? '#10b981' : '#64748b',
                                        boxShadow: isSerialStreaming ? '0 0 6px #10b981' : 'none'
                                    }} />
                                </div>

                                {/* Botones de Control del Monitor */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsSerialStreaming(!isSerialStreaming)}
                                        title={isSerialStreaming ? "Pausar transmisión" : "Reanudar transmisión"}
                                        style={{
                                            background: 'rgba(255,255,255,0.08)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            color: '#f8fafc',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '5px',
                                            fontSize: '0.7rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                            cursor: 'pointer',
                                            fontWeight: '800'
                                        }}
                                    >
                                        {isSerialStreaming ? <Pause size={11} color="#f59e0b" /> : <Play size={11} color="#10b981" />}
                                        <span>{isSerialStreaming ? 'Pausar' : 'Reanudar'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearSerialLogs}
                                        title="Limpiar salida de consola"
                                        style={{
                                            background: 'rgba(255,255,255,0.08)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            color: '#f8fafc',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '5px',
                                            fontSize: '0.7rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                            cursor: 'pointer',
                                            fontWeight: '800'
                                        }}
                                    >
                                        <Trash2 size={11} color="#ef4444" />
                                        <span>Limpiar</span>
                                    </button>
                                </div>
                            </div>

                            {/* Consola de Salida Serial Desplazable */}
                            <div
                                ref={serialBottomRef}
                                style={{
                                    padding: '0.75rem 0.9rem',
                                    background: '#030712',
                                    color: '#f8fafc',
                                    fontSize: '0.76rem',
                                    lineHeight: '1.65',
                                    flex: 1,
                                    maxHeight: '190px',
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.25rem',
                                    scrollbarWidth: 'thin'
                                }}
                            >
                                {serialLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'baseline',
                                            gap: '0.6rem',
                                            color: log.type === 'detected' 
                                                ? '#4ade80' 
                                                : (log.type === 'idle' ? '#f8fafc' : '#fbbf24'),
                                            fontFamily: 'monospace',
                                            fontWeight: '800'
                                        }}
                                    >
                                        <span style={{ color: '#38bdf8', fontSize: '0.72rem', opacity: 0.95, fontWeight: '900' }}>
                                            [{log.time}]
                                        </span>
                                        <span style={{ color: '#64748b', fontWeight: '900' }}>&gt;</span>
                                        <span>{log.text}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>
                </div>
            )}

            {/* CUERPO DEL SIMULADOR: SENSOR PIR PARALLAX (TINKERCAD-STYLE) */}
            {activeTab === 'pir' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', alignItems: 'stretch' }}>
                    
                    {/* COLUMNA IZQUIERDA: ESPACIO ÓPTICO + TELEMETRÍA BISS0001 (7 COLS / 60%) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: '1 1 60%' }}>
                        
                        {/* TARJETA 1: ESPACIO ÓPTICO & VIEWPORT PARALLAX */}
                        <section style={{
                            background: '#ffffff',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '14px',
                            padding: '1.1rem',
                            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '0.85rem'
                        }}>
                            {/* Cabecera del Viewport */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '0.65rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                    <div style={{
                                        background: '#fef3c7',
                                        border: '1.5px solid #f59e0b',
                                        borderRadius: '10px',
                                        padding: '0.45rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Target size={18} color="#b45309" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '0.86rem', fontWeight: '900', fontFamily: 'monospace', letterSpacing: '0.06em', color: '#0f172a', textTransform: 'uppercase' }}>
                                            CAMPO ÓPTICO PIR · CALIBRACIÓN DIRECTA
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b', fontWeight: '700' }}>
                                            Sensor Parallax Rev B &bull; Trimmers Traseros &bull; Lente Fresnel
                                        </p>
                                    </div>
                                </div>

                                {/* Botón de Simulación de Cruce */}
                                <button
                                    type="button"
                                    onClick={toggleCrossing}
                                    style={{
                                        background: pirIsCrossing ? '#dc2626' : '#d97706',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0.45rem 0.9rem',
                                        fontSize: '0.78rem',
                                        fontFamily: 'monospace',
                                        fontWeight: '900',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.45rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {pirIsCrossing ? <StopCircle size={14} /> : <PlayCircle size={14} />}
                                    <span>{pirIsCrossing ? 'Cruzando: Detener' : 'Objeto Cruzando: Iniciar'}</span>
                                </button>
                            </div>

                            {/* VIEWPORT SVG INTERACTIVO */}
                            <div style={{
                                width: '100%',
                                height: '270px',
                                background: '#f8fafc',
                                borderRadius: '12px',
                                border: '1.5px solid #cbd5e1',
                                overflow: 'hidden',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: 'inset 0 2px 8px rgba(15, 23, 42, 0.04)',
                                cursor: 'crosshair'
                            }}>
                                {(() => {
                                    const nominalArc = generateArcPath(0.2, pirSxRangeM, FOV_TOTAL_HALF_DEG);
                                    const coreArc = generateArcPath(0.2, pirSxRangeM, FOV_PRECISION_HALF_DEG);
                                    const crossingX = SENSOR_FOCAL.x - (crossingStateRef.current.fixedDistM * SCALE_PXM);
                                    const pctSx = Math.round(((pirSxRangeM - 2.0) / 6.0) * 100);
                                    const angleSx = (pctSx / 100) * 270 - 135;
                                    const pctTx = Math.round(((pirTxSeconds - 1.5) / 8.5) * 100);
                                    const angleTx = (pctTx / 100) * 270 - 135;

                                    return (
                                        <svg
                                            ref={pirSvgRef}
                                            viewBox="0 0 670 240"
                                            style={{ width: '100%', height: '100%', userSelect: 'none' }}
                                            onMouseDown={handlePointerDown}
                                            onTouchStart={handlePointerDown}
                                        >
                                            <defs>
                                                <filter id="pirSoftShadow" x="-15%" y="-15%" width="130%" height="130%">
                                                    <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.16" />
                                                </filter>
                                            </defs>

                                            {/* 1. CAMPO DE DETECCIÓN CÓNICO */}
                                            <g>
                                                {/* Zona Nominal */}
                                                <path
                                                    d={nominalArc.path}
                                                    fill={pirPhysics.isHigh ? '#ffe4e6' : '#d1fae5'}
                                                    stroke={pirPhysics.isHigh ? '#fda4af' : '#34d399'}
                                                    strokeWidth="2"
                                                    opacity="0.88"
                                                    style={{ transition: 'all 0.2s ease' }}
                                                />

                                                {/* Zona Núcleo */}
                                                <path
                                                    d={coreArc.path}
                                                    fill={pirPhysics.isHigh ? '#fecdd3' : '#a7f3d0'}
                                                    stroke={pirPhysics.isHigh ? '#fb7185' : '#059669'}
                                                    strokeWidth="1.2"
                                                    strokeDasharray="3,2"
                                                    opacity="0.65"
                                                    style={{ transition: 'all 0.2s ease' }}
                                                />

                                                {/* Arco de Ganancia */}
                                                <path
                                                    d={nominalArc.maxArc}
                                                    fill="none"
                                                    stroke={pirPhysics.isHigh ? '#f43f5e' : '#059669'}
                                                    strokeWidth="1.8"
                                                    strokeDasharray="4,3"
                                                    opacity="0.85"
                                                />

                                                {/* Línea transversal de cruce */}
                                                <line
                                                    x1={crossingX}
                                                    y1="10"
                                                    x2={crossingX}
                                                    y2="230"
                                                    stroke="#cbd5e1"
                                                    strokeWidth="1.2"
                                                    strokeDasharray="4,4"
                                                    opacity="0.65"
                                                />

                                                {/* Vector de seguimiento directo al centro del orbe */}
                                                <line
                                                    x1={SENSOR_FOCAL.x}
                                                    y1={SENSOR_FOCAL.y}
                                                    x2={pirTarget.x}
                                                    y2={pirTarget.y}
                                                    stroke={pirPhysics.isHigh ? '#fb7185' : '#94a3b8'}
                                                    strokeWidth="1.6"
                                                    strokeDasharray="4,3"
                                                    opacity="0.75"
                                                />
                                            </g>

                                            {/* 2. OBJETO CIRCULAR / ORBE TÉRMICO (R=18px) */}
                                            <g transform={`translate(${pirTarget.x}, ${pirTarget.y})`} style={{ cursor: 'grab' }}>
                                                {/* Pulso térmico cuando detecta */}
                                                {pirPhysics.isHigh && (
                                                    <circle cx="0" cy="0" r="28" fill="none" stroke="#f43f5e" strokeWidth="2" opacity="0.7" className="thermal-pulse-ring" />
                                                )}
                                                
                                                {/* Halo exterior */}
                                                <circle cx="0" cy="0" r="24" fill="#f97316" opacity="0.18" />
                                                
                                                {/* Cuerpo principal del orbe térmico */}
                                                <circle cx="0" cy="0" r="18" fill="#ea580c" stroke={pirPhysics.isHigh ? '#f43f5e' : '#ffffff'} strokeWidth="3" filter="url(#pirSoftShadow)" />
                                                
                                                {/* Núcleo central */}
                                                <circle cx="0" cy="0" r="9" fill="#f97316" stroke="#fed7aa" strokeWidth="1.2" />
                                                
                                                {/* Punto central */}
                                                <circle cx="0" cy="0" r="3" fill="#ffffff" />
                                                <circle cx="-5" cy="-5" r="3.2" fill="#ffedd5" opacity="0.85" />
                                            </g>

                                            {/* 3. ENSAMBLAJE PIR: FRONTAL PARALLAX + AJUSTE TRASERO */}
                                            <g>
                                                {/* A) SENSOR PARALLAX FRONTAL */}
                                                <g transform="translate(410, 35)" filter="url(#pirSoftShadow)">
                                                    <rect x="0" y="0" width="132" height="170" rx="7" fill="#095a1f" stroke="#064216" strokeWidth="1.8" />

                                                    {/* Conector posterior 3 pines con espadines */}
                                                    <g transform="translate(130, 52)">
                                                        <rect x="0" y="0" width="9" height="66" rx="2" fill="#1e293b" />
                                                        <line x1="9" y1="13" x2="38" y2="13" stroke="#cbd5e1" strokeWidth="3.2" strokeLinecap="round" />
                                                        <line x1="9" y1="33" x2="38" y2="33" stroke="#cbd5e1" strokeWidth="3.2" strokeLinecap="round" />
                                                        <line x1="9" y1="53" x2="38" y2="53" stroke="#cbd5e1" strokeWidth="3.2" strokeLinecap="round" />
                                                        
                                                        <text x="-6" y="16" fill="#86efac" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="end">GND</text>
                                                        <text x="-6" y="36" fill="#86efac" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="end">VCC</text>
                                                        <text x="-6" y="56" fill="#86efac" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="end">OUT</text>
                                                    </g>

                                                    {/* Tornillos estañados M3 */}
                                                    <circle cx="20" cy="20" r="8.5" fill="#095a1f" stroke="#e2e8f0" strokeWidth="2.4" />
                                                    <circle cx="20" cy="20" r="5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
                                                    <circle cx="20" cy="150" r="8.5" fill="#095a1f" stroke="#e2e8f0" strokeWidth="2.4" />
                                                    <circle cx="20" cy="150" r="5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />

                                                    {/* Jumper de Selección H/L */}
                                                    <g transform="translate(108, 14)">
                                                        <text x="0" y="0" fill="#f8fafc" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">H</text>
                                                        <circle cx="0" cy="9" r="3" fill="#095a1f" stroke="#e2e8f0" strokeWidth="1" />
                                                        <circle cx="0" cy="20" r="3" fill="#095a1f" stroke="#e2e8f0" strokeWidth="1" />
                                                        <circle cx="0" cy="31" r="3" fill="#095a1f" stroke="#e2e8f0" strokeWidth="1" />
                                                        <text x="0" y="44" fill="#f8fafc" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">L</text>
                                                        
                                                        {/* Tapa del Jumper */}
                                                        <rect
                                                            x="-4.5"
                                                            y={pirJumperMode === 'H' ? 4 : 15}
                                                            width="9"
                                                            height="20"
                                                            rx="1.8"
                                                            fill="#ea580c"
                                                            stroke="#fed7aa"
                                                            strokeWidth="1"
                                                            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                                                            onClick={toggleJumper}
                                                        />
                                                    </g>

                                                    {/* Serigrafías de placa */}
                                                    <text x="64" y="20" fill="#f8fafc" fontSize="9" fontFamily="sans-serif" fontWeight="bold" letterSpacing="1.2" textAnchor="middle">PARALLAX</text>
                                                    <text x="64" y="154" fill="#f8fafc" fontSize="8" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.7" textAnchor="middle">555-28027 · REV B</text>

                                                    {/* Lente Fresnel con faceteado concéntrico y radial */}
                                                    <g transform="translate(12, 31)">
                                                        <rect x="0" y="0" width="92" height="106" rx="5" fill={pirPhysics.isHigh ? '#ffe4e6' : '#e2e8f0'} stroke="#cbd5e1" strokeWidth="1.2" />
                                                        <g transform="translate(46, 53)">
                                                            <circle cx="0" cy="0" r="43" fill={pirPhysics.isHigh ? '#fff1f2' : '#ffffff'} stroke={pirPhysics.isHigh ? '#fda4af' : '#cbd5e1'} strokeWidth="1.4" />
                                                            <circle cx="0" cy="0" r="36" fill={pirPhysics.isHigh ? '#fff1f2' : '#f8fafc'} stroke="#cbd5e1" strokeWidth="0.9" />
                                                            <circle cx="0" cy="0" r="25" fill={pirPhysics.isHigh ? '#ffe4e6' : '#f1f5f9'} stroke="#cbd5e1" strokeWidth="0.9" />
                                                            <circle cx="0" cy="0" r="12" fill={pirPhysics.isHigh ? '#fecdd3' : '#e2e8f0'} stroke="#cbd5e1" strokeWidth="0.9" />
                                                            
                                                            <line x1="0" y1="-36" x2="0" y2="-12" stroke="#cbd5e1" strokeWidth="1" />
                                                            <line x1="0" y1="12" x2="0" y2="36" stroke="#cbd5e1" strokeWidth="1" />
                                                            <line x1="-36" y1="0" x2="-12" y2="0" stroke="#cbd5e1" strokeWidth="1" />
                                                            <line x1="12" y1="0" x2="36" y2="0" stroke="#cbd5e1" strokeWidth="1" />
                                                            <line x1="-25" y1="-25" x2="-8" y2="-8" stroke="#cbd5e1" strokeWidth="1" />
                                                            <line x1="8" y1="8" x2="25" y2="25" stroke="#cbd5e1" strokeWidth="1" />
                                                            <line x1="25" y1="-25" x2="8" y2="-8" stroke="#cbd5e1" strokeWidth="1" />
                                                            <line x1="-8" y1="8" x2="-25" y2="25" stroke="#cbd5e1" strokeWidth="1" />
                                                        </g>
                                                    </g>
                                                </g>

                                                {/* B) PANEL DE AJUSTE TRASERO SEPARADO A LA DERECHA */}
                                                <g transform="translate(585, 45)" filter="url(#pirSoftShadow)">
                                                    <rect x="0" y="0" width="76" height="150" rx="7" fill="#0f172a" stroke="#334155" strokeWidth="1.8" />
                                                    <rect x="3" y="3" width="70" height="144" rx="5.5" fill="#1e293b" />
                                                    
                                                    <text x="38" y="18" fill="#cbd5e1" fontSize="8.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">AJUSTE</text>
                                                    <text x="38" y="28" fill="#94a3b8" fontSize="7.5" fontFamily="monospace" textAnchor="middle">POSTERIOR</text>

                                                    {/* Trimmer 1: Sensibilidad (Sx) */}
                                                    <g transform="translate(38, 56)">
                                                        <circle cx="0" cy="0" r="17" fill="#ea580c" stroke="#c2410c" strokeWidth="1.8" />
                                                        <circle cx="0" cy="0" r="13.5" fill="#f97316" />
                                                        <circle cx="0" cy="0" r="8.5" fill="#fed7aa" stroke="#9a3412" strokeWidth="1" />
                                                        <g transform={`rotate(${angleSx} 0 0)`}>
                                                            <line x1="-6" y1="0" x2="6" y2="0" stroke="#7c2d12" strokeWidth="2.4" strokeLinecap="round" />
                                                            <line x1="0" y1="-6" x2="0" y2="6" stroke="#7c2d12" strokeWidth="2.4" strokeLinecap="round" />
                                                        </g>
                                                        <text x="0" y="24" fill="#fdba74" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Sx (105)</text>
                                                    </g>

                                                    {/* Trimmer 2: Tiempo (Tx) */}
                                                    <g transform="translate(38, 114)">
                                                        <circle cx="0" cy="0" r="17" fill="#ea580c" stroke="#c2410c" strokeWidth="1.8" />
                                                        <circle cx="0" cy="0" r="13.5" fill="#f97316" />
                                                        <circle cx="0" cy="0" r="8.5" fill="#fed7aa" stroke="#9a3412" strokeWidth="1" />
                                                        <g transform={`rotate(${angleTx} 0 0)`}>
                                                            <line x1="-6" y1="0" x2="6" y2="0" stroke="#7c2d12" strokeWidth="2.4" strokeLinecap="round" />
                                                            <line x1="0" y1="-6" x2="0" y2="6" stroke="#7c2d12" strokeWidth="2.4" strokeLinecap="round" />
                                                        </g>
                                                        <text x="0" y="24" fill="#fdba74" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Tx (105)</text>
                                                    </g>
                                                </g>
                                            </g>
                                        </svg>
                                    );
                                })()}
                            </div>

                            {/* CONTROLES INFERIORES: TRIMMERS SX / TX Y VELOCIDAD */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                                
                                {/* Trimmer Sx (Sensibilidad) */}
                                <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '0.7rem 0.85rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                        <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: '900', color: '#b45309', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <Gauge size={13} color="#d97706" /> TRIMMER SX (ALCANCE)
                                        </span>
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.74rem', fontWeight: '900', color: '#b45309', background: '#fef3c7', padding: '0.15rem 0.45rem', borderRadius: '5px', border: '1px solid #f59e0b' }}>
                                            {pirSxRangeM.toFixed(1)} m ({Math.round(((pirSxRangeM - 2.0) / 6.0) * 100)}%)
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="2.0"
                                        max="8.0"
                                        step="0.1"
                                        value={pirSxRangeM}
                                        onChange={(e) => setPirSxRangeM(parseFloat(e.target.value))}
                                        style={{ width: '100%', accentColor: '#ea580c', cursor: 'ew-resize' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontFamily: 'monospace', color: '#64748b', fontWeight: '700', marginTop: '0.2rem' }}>
                                        <span>2.0m (Baja)</span>
                                        <span>8.0m (Alta)</span>
                                    </div>
                                </div>

                                {/* Trimmer Tx (Tiempo de Retención) */}
                                <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '0.7rem 0.85rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                        <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: '900', color: '#b45309', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <Clock size={13} color="#d97706" /> TRIMMER TX (RETENCIÓN)
                                        </span>
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.74rem', fontWeight: '900', color: '#b45309', background: '#fef3c7', padding: '0.15rem 0.45rem', borderRadius: '5px', border: '1px solid #f59e0b' }}>
                                            {pirTxSeconds.toFixed(1)} s ({Math.round(((pirTxSeconds - 1.5) / 8.5) * 100)}%)
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1.5"
                                        max="10.0"
                                        step="0.5"
                                        value={pirTxSeconds}
                                        onChange={(e) => setPirTxSeconds(parseFloat(e.target.value))}
                                        style={{ width: '100%', accentColor: '#ea580c', cursor: 'ew-resize' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontFamily: 'monospace', color: '#64748b', fontWeight: '700', marginTop: '0.2rem' }}>
                                        <span>1.5s (Mín)</span>
                                        <span>10.0s (Máx)</span>
                                    </div>
                                </div>

                                {/* Velocidad de Cruzamiento */}
                                <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '0.7rem 0.85rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                        <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: '900', color: '#0369a1', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <Zap size={13} color="#0284c7" /> VELOCIDAD DE CRUCE
                                        </span>
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.74rem', fontWeight: '900', color: '#0369a1', background: '#e0f2fe', padding: '0.15rem 0.45rem', borderRadius: '5px', border: '1px solid #0284c7' }}>
                                            {pirWalkingSpeed.toFixed(1)} m/s
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.2"
                                        max="3.5"
                                        step="0.1"
                                        value={pirWalkingSpeed}
                                        onChange={(e) => setPirWalkingSpeed(parseFloat(e.target.value))}
                                        style={{ width: '100%', accentColor: '#0284c7', cursor: 'ew-resize' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontFamily: 'monospace', color: '#64748b', fontWeight: '700', marginTop: '0.2rem' }}>
                                        <span>0.2 m/s (Lento)</span>
                                        <span>3.5 m/s (Rápido)</span>
                                    </div>
                                </div>

                            </div>
                        </section>

                        {/* TARJETA 2: TELEMETRÍA DEL CIRCUITO BISS0001 & PIN D2 */}
                        <section style={{
                            background: '#ffffff',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '14px',
                            padding: '1.1rem',
                            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.65rem'
                        }}>
                            {/* Cabecera Telemetría BISS0001 */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '0.45rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                    <Cpu size={16} color="#059669" />
                                    <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '900', fontFamily: 'monospace', letterSpacing: '0.08em', color: '#047857', textTransform: 'uppercase' }}>
                                        TELEMETRÍA CIRCUITO BISS0001 &bull; SEÑAL PIN D2
                                    </h3>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={toggleJumper}
                                        style={{
                                            fontSize: '0.72rem',
                                            fontFamily: 'monospace',
                                            fontWeight: '900',
                                            color: pirJumperMode === 'H' ? '#92400e' : '#0369a1',
                                            background: pirJumperMode === 'H' ? '#fef3c7' : '#e0f2fe',
                                            border: `1px solid ${pirJumperMode === 'H' ? '#f59e0b' : '#0284c7'}`,
                                            padding: '0.2rem 0.55rem',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Jumper: Modo '{pirJumperMode}' ({pirJumperMode === 'H' ? 'Retriggerable' : 'Single Trigger'})
                                    </button>
                                    <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#475569', fontWeight: '900', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                                        VOUT: 3.3V TTL
                                    </span>
                                </div>
                            </div>

                            {/* Cuadrícula interna de Telemetría */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'stretch' }}>
                                
                                {/* Bloque 1: Lectura Pin D2 */}
                                <div style={{
                                    background: pirPhysics.isHigh ? '#fff1f2' : '#f8fafc',
                                    padding: '0.75rem',
                                    borderRadius: '10px',
                                    border: `1.5px solid ${pirPhysics.isHigh ? '#fda4af' : '#cbd5e1'}`,
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}>
                                    <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', textTransform: 'uppercase', color: '#475569', fontWeight: '900' }}>PIN OUT / D2</span>
                                    <span style={{
                                        fontFamily: 'monospace',
                                        fontSize: '1.15rem',
                                        fontWeight: '900',
                                        color: pirPhysics.isHigh ? '#e11d48' : '#64748b',
                                        margin: '0.2rem 0'
                                    }}>
                                        {pirPhysics.isHigh ? 'HIGH (3.3V)' : 'LOW (0.0V)'}
                                    </span>
                                    <span style={{ fontSize: '0.72rem', color: pirPhysics.isHigh ? '#be123c' : '#64748b', fontFamily: 'monospace', fontWeight: '800' }}>
                                        {pirPhysics.isHigh ? 'Señal TTL activa en Pin D2' : 'Sin gradiente térmico'}
                                    </span>
                                </div>

                                {/* Bloque 2: Temporizador Tx en vivo */}
                                <div style={{
                                    background: '#f8fafc',
                                    padding: '0.75rem',
                                    borderRadius: '10px',
                                    border: '1.5px solid #cbd5e1',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', textTransform: 'uppercase', color: '#475569', fontWeight: '900' }}>TEMPORIZADOR TX (RETENCIÓN)</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', margin: '0.25rem 0' }}>
                                        <span style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            backgroundColor: pirPhysics.isHigh ? '#f43f5e' : '#cbd5e1',
                                            boxShadow: pirPhysics.isHigh ? '0 0 8px #f43f5e' : 'none'
                                        }} />
                                        <span style={{ fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: '900', color: pirPhysics.isHigh ? '#be123c' : '#475569' }}>
                                            {pirPhysics.remainingSec.toFixed(1)}s / {pirTxSeconds.toFixed(1)}s
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.72rem', color: '#475569', fontFamily: 'monospace', fontWeight: '700' }}>
                                        {pirPhysics.isHigh ? 'Temporizador activo' : 'En espera de cambio'}
                                    </span>
                                </div>

                                {/* Bloque 3: Gradiente Térmico vs Umbral Sx */}
                                <div style={{
                                    background: '#f8fafc',
                                    padding: '0.75rem',
                                    borderRadius: '10px',
                                    border: '1.5px solid #cbd5e1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    gridColumn: 'span 2'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontFamily: 'monospace', marginBottom: '0.35rem' }}>
                                        <span style={{ color: '#0f172a', fontWeight: '900' }}>Gradiente Térmico (dΦ/dt):</span>
                                        <span style={{ fontWeight: '900', color: pirPhysics.isHigh ? '#be123c' : '#0369a1', fontSize: '0.75rem' }}>
                                            {pirPhysics.gradientV.toFixed(2)} V/s
                                        </span>
                                    </div>

                                    {/* Barra horizontal con aguja de umbral */}
                                    <div style={{ width: '100%', background: '#e2e8f0', height: '17px', borderRadius: '4px', position: 'relative', overflow: 'hidden', border: '1.5px solid #94a3b8', display: 'flex', alignItems: 'center', marginBottom: '0.35rem' }}>
                                        <div style={{
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #38bdf8, #fbbf24, #f43f5e)',
                                            width: `${Math.min(100, (pirPhysics.gradientV / 0.8) * 100).toFixed(1)}%`,
                                            transition: 'width 0.08s ease'
                                        }} />
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            bottom: 0,
                                            width: '3.5px',
                                            background: '#0f172a',
                                            left: `${Math.min(95, Math.max(5, (pirPhysics.thresholdV / 0.8) * 100))}%`,
                                            zIndex: 10
                                        }} />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'monospace', color: '#475569' }}>
                                        <span>Umbral Sx: <strong style={{ color: '#b45309' }}>{pirPhysics.thresholdV.toFixed(2)} V/s</strong></span>
                                        <span style={{ fontWeight: '800', color: !pirPhysics.insideConeStrict ? '#64748b' : (pirPhysics.gradientV >= pirPhysics.thresholdV ? '#be123c' : '#047857') }}>
                                            {!pirPhysics.insideConeStrict ? 'Fuera de cono / Reposo' : (pirPhysics.gradientV >= pirPhysics.thresholdV ? 'dΦ/dt ≥ Umbral (Disparo)' : 'En cono sin movimiento')}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </section>

                    </div>

                    {/* COLUMNA DERECHA: FIRMWARE ARDUINO C++ + MONITOR SERIAL PIR (40%) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: '1 1 38%' }}>
                        
                        {/* 1. Editor C++ con Ejecución Resaltada */}
                        <section style={{
                            background: '#ffffff',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '14px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem'
                        }}>
                            {/* Barra de Archivo del IDE */}
                            <div style={{
                                background: '#020617',
                                padding: '0.55rem 0.85rem',
                                borderBottom: '1.5px solid #1e293b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                color: '#f8fafc'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#f8fafc', fontWeight: '900', fontSize: '0.78rem' }}>
                                    <Terminal size={14} color="#34d399" /> parallax_pir_tinkercad.ino
                                </span>
                                <span style={{
                                    fontSize: '0.7rem',
                                    color: '#34d399',
                                    background: 'rgba(52, 211, 153, 0.12)',
                                    padding: '0.15rem 0.45rem',
                                    borderRadius: '6px',
                                    border: '1.5px solid #059669',
                                    fontWeight: '900'
                                }}>
                                    Pin D2 ← OUT
                                </span>
                            </div>

                            {/* Código C++ con Resaltado Dinámico */}
                            <div style={{
                                padding: '0.85rem',
                                background: '#090d16',
                                color: '#f8fafc',
                                fontSize: '0.78rem',
                                lineHeight: '1.6',
                                userSelect: 'none'
                            }}>
                                <span style={{ color: '#94a3b8', fontWeight: '600' }}>// Sensor PIR Parallax Rev B (Salida 3.3V TTL a Pin D2)</span><br />
                                <span style={{ color: '#c084fc', fontWeight: '900' }}>int</span> <span style={{ color: '#f8fafc' }}>pinPIR = </span><span style={{ color: '#fbbf24', fontWeight: '900' }}>2</span>;<br />
                                <span style={{ color: '#c084fc', fontWeight: '900' }}>int</span> <span style={{ color: '#f8fafc' }}>pinLED = </span><span style={{ color: '#fbbf24', fontWeight: '900' }}>13</span>;<br /><br />
                                <span style={{ color: '#c084fc', fontWeight: '900' }}>void</span> <span style={{ color: '#38bdf8', fontWeight: '900' }}>setup</span>() &#123;<br />
                                &nbsp;&nbsp;<span style={{ color: '#38bdf8', fontWeight: '900' }}>pinMode</span>(pinPIR, <span style={{ color: '#4ade80', fontWeight: '900' }}>INPUT</span>);<br />
                                &nbsp;&nbsp;<span style={{ color: '#38bdf8', fontWeight: '900' }}>pinMode</span>(pinLED, <span style={{ color: '#4ade80', fontWeight: '900' }}>OUTPUT</span>);<br />
                                &nbsp;&nbsp;<span style={{ color: '#38bdf8', fontWeight: '900' }}>Serial</span>.<span style={{ color: '#38bdf8', fontWeight: '900' }}>begin</span>(<span style={{ color: '#fbbf24', fontWeight: '900' }}>9600</span>);<br />
                                &#125;<br /><br />
                                <span style={{ color: '#c084fc', fontWeight: '900' }}>void</span> <span style={{ color: '#38bdf8', fontWeight: '900' }}>loop</span>() &#123;<br />
                                &nbsp;&nbsp;<span style={{ color: '#c084fc', fontWeight: '900' }}>int</span> <span style={{ color: '#f8fafc' }}>estadoPIR = </span><span style={{ color: '#38bdf8', fontWeight: '900' }}>digitalRead</span>(pinPIR);<br /><br />

                                {/* Rama IF: Detección activa en HIGH (3.3V) */}
                                <div style={{
                                    padding: '0.45rem 0.65rem',
                                    borderRadius: '6px',
                                    borderLeft: `4px solid ${pirPhysics.isHigh ? '#f43f5e' : 'transparent'}`,
                                    background: pirPhysics.isHigh ? 'rgba(244, 63, 94, 0.18)' : 'transparent',
                                    color: pirPhysics.isHigh ? '#fda4af' : '#64748b',
                                    opacity: pirPhysics.isHigh ? 1 : 0.45,
                                    transition: 'all 0.2s ease',
                                    margin: '0.15rem 0'
                                }}>
                                    &nbsp;&nbsp;<span style={{ color: pirPhysics.isHigh ? '#c084fc' : 'inherit', fontWeight: '900' }}>if</span> (estadoPIR == <span style={{ color: pirPhysics.isHigh ? '#38bdf8' : 'inherit', fontWeight: '900' }}>HIGH</span>) &#123;<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#38bdf8', fontWeight: '900' }}>digitalWrite</span>(pinLED, <span style={{ color: '#4ade80', fontWeight: '900' }}>HIGH</span>);<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#38bdf8', fontWeight: '900' }}>Serial</span>.<span style={{ color: '#38bdf8', fontWeight: '900' }}>println</span>(<span style={{ color: '#f43f5e', fontWeight: '900' }}>"¡OBJETO EN MOVIMIENTO DETECTADO!"</span>);<br />
                                    &nbsp;&nbsp;&#125;
                                </div>

                                {/* Rama ELSE: Reposo en LOW (0.0V) */}
                                <div style={{
                                    padding: '0.45rem 0.65rem',
                                    borderRadius: '6px',
                                    borderLeft: `4px solid ${!pirPhysics.isHigh ? '#64748b' : 'transparent'}`,
                                    background: !pirPhysics.isHigh ? 'rgba(100, 116, 139, 0.18)' : 'transparent',
                                    color: !pirPhysics.isHigh ? '#cbd5e1' : '#64748b',
                                    opacity: !pirPhysics.isHigh ? 1 : 0.45,
                                    transition: 'all 0.2s ease',
                                    margin: '0.15rem 0'
                                }}>
                                    &nbsp;&nbsp;<span style={{ color: !pirPhysics.isHigh ? '#c084fc' : 'inherit', fontWeight: '900' }}>else</span> &#123;<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#38bdf8', fontWeight: '900' }}>digitalWrite</span>(pinLED, <span style={{ color: '#94a3b8', fontWeight: '900' }}>LOW</span>);<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#38bdf8', fontWeight: '900' }}>Serial</span>.<span style={{ color: '#38bdf8', fontWeight: '900' }}>println</span>(<span style={{ color: '#94a3b8', fontWeight: '900' }}>"Sin gradiente térmico / Reposo"</span>);<br />
                                    &nbsp;&nbsp;&#125;<br />
                                    &#125;
                                </div>
                            </div>
                        </section>

                        {/* 2. MONITOR SERIAL PIR EN VIVO */}
                        <section style={{
                            background: '#090d16',
                            border: '1.5px solid #1e293b',
                            borderRadius: '14px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            fontFamily: 'monospace',
                            flex: 1,
                            minHeight: '200px'
                        }}>
                            {/* Cabecera del Monitor Serial PIR */}
                            <div style={{
                                background: '#020617',
                                padding: '0.5rem 0.85rem',
                                borderBottom: '1px solid #1e293b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Terminal size={14} color="#34d399" />
                                    <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#f8fafc', letterSpacing: '0.04em' }}>
                                        MONITOR SERIE (COM3 - 9600 BAUD)
                                    </span>
                                    <span style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: '#10b981',
                                        boxShadow: '0 0 6px #10b981'
                                    }} />
                                </div>

                                <button
                                    type="button"
                                    onClick={clearPirSerialLogs}
                                    title="Limpiar salida de consola"
                                    style={{
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: '#f8fafc',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '5px',
                                        fontSize: '0.7rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        cursor: 'pointer',
                                        fontWeight: '800'
                                    }}
                                >
                                    <Trash2 size={11} color="#ef4444" />
                                    <span>Limpiar</span>
                                </button>
                            </div>

                            {/* Consola de Salida Serial Desplazable */}
                            <div
                                ref={pirSerialBottomRef}
                                style={{
                                    padding: '0.75rem 0.9rem',
                                    background: '#030712',
                                    color: '#f8fafc',
                                    fontSize: '0.76rem',
                                    lineHeight: '1.65',
                                    flex: 1,
                                    maxHeight: '190px',
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.25rem',
                                    scrollbarWidth: 'thin'
                                }}
                            >
                                {pirSerialLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'baseline',
                                            gap: '0.6rem',
                                            color: log.type === 'detected' 
                                                ? '#fb7185' 
                                                : (log.type === 'idle' ? '#94a3b8' : '#34d399'),
                                            fontFamily: 'monospace',
                                            fontWeight: '800'
                                        }}
                                    >
                                        <span style={{ color: '#38bdf8', fontSize: '0.72rem', opacity: 0.95, fontWeight: '900' }}>
                                            [{log.time}]
                                        </span>
                                        <span style={{ color: '#64748b', fontWeight: '900' }}>&gt;&gt;</span>
                                        <span>{log.text}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div style={{ width: '100%', margin: '1.25rem 0' }}>
            {/* SIMULADOR RENDERIZADO DIRECTAMENTE EN EL CONTENIDO */}
            <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '2px solid #38bdf8',
                boxShadow: '0 10px 30px -5px rgba(2, 132, 199, 0.15), 0 4px 10px rgba(0, 0, 0, 0.04)',
                padding: '1.25rem',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                {/* Botón flotante para expandir a pantalla completa si se desea */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.45rem 0.95rem',
                            fontSize: '0.8rem',
                            fontWeight: '800',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.35)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Maximize2 size={15} />
                        <span>Ver en Pantalla Completa</span>
                    </button>
                </div>

                {/* Contenido Completo del Simulador */}
                {renderSimulatorContent()}
            </div>

            {/* MODAL FLOTANTE A PANTALLA COMPLETA (PORTAL DIRECTO A BODY CON MÁXIMO Z-INDEX) */}
            {isModalOpen && typeof document !== 'undefined' && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 20000000,
                        backgroundColor: 'rgba(15, 23, 42, 0.88)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.25rem',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsModalOpen(false);
                    }}
                >
                    <div
                        style={{
                            background: '#ffffff',
                            borderRadius: '20px',
                            border: '2px solid #38bdf8',
                            boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.75)',
                            width: '100%',
                            maxWidth: '1380px',
                            maxHeight: '92vh',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        {/* Barra Superior del Modal */}
                        <div style={{
                            background: '#0f172a',
                            padding: '0.85rem 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '2px solid #1e293b'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: '#38bdf8',
                                    boxShadow: '0 0 8px #38bdf8'
                                }} />
                                <span style={{ color: '#f8fafc', fontWeight: '900', fontSize: '0.95rem', letterSpacing: '0.02em' }}>
                                    LABORATORIO VIRTUAL: SENSORES INFRARROJO (FC-51) & PIR
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1.5px solid #ef4444',
                                    color: '#f8fafc',
                                    borderRadius: '8px',
                                    padding: '0.35rem 0.85rem',
                                    fontSize: '0.82rem',
                                    fontWeight: '900',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <X size={16} color="#ef4444" />
                                <span>Cerrar Pantalla Completa</span>
                            </button>
                        </div>

                        {/* Contenedor del Simulador Desplazable */}
                        <div style={{
                            padding: '1.5rem',
                            overflowY: 'auto',
                            maxHeight: 'calc(92vh - 60px)',
                            background: '#ffffff'
                        }}>
                            {renderSimulatorContent()}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
