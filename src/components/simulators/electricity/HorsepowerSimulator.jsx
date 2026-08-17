import React, { useState, useEffect } from 'react';
import { Play, Pause, Zap } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

export default function HorsepowerSimulator() {
    // Modo de potencia secuencial: 'horse' (Caballos 1782) -> 'rotative' (Máquina de Vapor 1788) -> 'motor' (Motor Eléctrico Hoy)
    const [mode, setMode] = useState('horse');
    const [horsesCount, setHorsesCount] = useState(1); // 1 a 8 caballos / 1 a 12 HP
    const [voltage, setVoltage] = useState(120); // Voltios (para modo eléctrico)
    const [current, setCurrent] = useState(6.22); // Amperios (para modo eléctrico)
    const [isRunning, setIsRunning] = useState(true);
    const [animTick, setAnimTick] = useState(0);

    // Potencia calculada
    let activeHP = 1;
    let activeWatts = 745.7;

    if (mode === 'horse' || mode === 'rotative') {
        activeHP = horsesCount;
        activeWatts = horsesCount * 745.7;
    } else {
        activeWatts = voltage * current;
        activeHP = activeWatts / 745.7;
    }

    // ── GEOMETRÍA EXACTA DE LA MÁQUINA ROTATIVA (LEY DE CUATRO BARRAS RÍGIDAS) ──
    const rotSpeed = Math.min(3 + activeHP * 1.2, 18);
    const rotWheelAngle = (animTick * rotSpeed) % 360;
    const rotWheelRad = (rotWheelAngle * Math.PI) / 180;

    // Centro y manivela más compacta de la rueda volante (radio 16px para movimiento suave)
    const wheelCenterX = 295;
    const wheelCenterY = 160;
    const crankRadius = 16;
    const crankPinX = wheelCenterX + crankRadius * Math.cos(rotWheelRad);
    const crankPinY = wheelCenterY + crankRadius * Math.sin(rotWheelRad);

    // Pivote central del balancín rotativo
    const rotPivotX = 210;
    const rotPivotY = 65;
    const rotArmLength = 60;
    const connectingRodLen = 120; // Longitud rígida fija de la biela

    // Cinemática Inversa Exacta (Ley del Coseno para mecanismo de 4 barras)
    const distCrankToPivot = Math.hypot(crankPinX - rotPivotX, crankPinY - rotPivotY);
    const phiAngle = Math.atan2(crankPinY - rotPivotY, crankPinX - rotPivotX);
    const cosBeamTri = Math.max(-1, Math.min(1, (rotArmLength * rotArmLength + distCrankToPivot * distCrankToPivot - connectingRodLen * connectingRodLen) / (2 * rotArmLength * distCrankToPivot)));
    const beamOffsetAngle = Math.acos(cosBeamTri);

    const rotBeamAngleExact = phiAngle - beamOffsetAngle;

    // Extremo derecho del balancín (donde se conecta la biela)
    const rotRightTipX = rotPivotX + rotArmLength * Math.cos(rotBeamAngleExact);
    const rotRightTipY = rotPivotY + rotArmLength * Math.sin(rotBeamAngleExact);

    // Extremo izquierdo del balancín (donde se conecta el pistón)
    const rotLeftTipX = rotPivotX - rotArmLength * Math.cos(rotBeamAngleExact);
    const rotLeftTipY = rotPivotY - rotArmLength * Math.sin(rotBeamAngleExact);

    // ── CINEMÁTICA Y PERSPECTIVA 2.5D DE TODOS LOS CABALLOS (1 A 8) EN LA CABRIA ──
    // Los caballos de tiro caminan a un paso constante (~2.5 mph / paso firme); agregar más caballos añade torque/fuerza y caudal, no velocidad desenfrenada.
    const horseOrbitSpeed = isRunning ? 0.046 : 0; // Velocidad de paso constante, ágil y natural
    const horseAngle = (animTick * horseOrbitSpeed);
    const capstanCenterX = 130;
    const orbitRadiusX = 68;
    const beamFixedY = 212; // Altura fija del eje alineada al torso del caballo
    const horseFixedY = 202; // Altura del caballo para que sus cascos pisen exactamente la elipse en Y=240

    // Colores de pelaje para distinguir cada caballo en el tiro
    const coatColors = [
        { coat: '#92400e', stroke: '#78350f', mane: '#451a03' }, // Alazán tostado (original)
        { coat: '#78350f', stroke: '#5c2b09', mane: '#451a03' }, // Castaño oscuro
        { coat: '#a16207', stroke: '#854d0e', mane: '#291203' }, // Bayo dorado
        { coat: '#b45309', stroke: '#78350f', mane: '#1e293b' }, // Alazán claro
        { coat: '#451a03', stroke: '#291203', mane: '#0f172a' }, // Azabache
        { coat: '#854d0e', stroke: '#713f12', mane: '#451a03' }, // Pardo
        { coat: '#9a3412', stroke: '#7c2d12', mane: '#451a03' }, // Alazán encendido
        { coat: '#64748b', stroke: '#475569', mane: '#1e293b' }, // Tordo / Gris
    ];

    // Generar lista dinámica de caballos (1 hasta horsesCount, máx 8)
    const numHorses = Math.max(1, Math.min(8, horsesCount));
    const horseList = Array.from({ length: numHorses }).map((_, i) => {
        const angle = horseAngle + (i * 2 * Math.PI) / numHorses + Math.PI;
        // Si hay más de 4 caballos, alternar radios para que se vean en tiros dobles
        const rad = numHorses > 4 ? (i % 2 === 0 ? 68 : 50) : 68;
        const x = capstanCenterX + rad * Math.cos(angle);
        const y = horseFixedY;
        const isFront = Math.sin(angle) >= 0;
        const facing = Math.sin(angle) < 0 ? 1 : -1;
        const depth = (Math.sin(angle) + 1) / 2;
        const scale = (rad === 50 ? 0.78 : 0.86) + 0.16 * depth;
        const color = coatColors[i % coatColors.length];
        return { id: i, x, y, isFront, facing, depth, scale, color, angle, rad };
    });

    // Caudal de bombeo accionado por la rueda: 1 HP ≈ 450 L/min
    const litersPerMin = Math.round(activeHP * 450);

    // Ciclo de animación continuo
    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            setAnimTick(prev => prev + 1);
        }, 40);
        return () => clearInterval(interval);
    }, [isRunning]);

    return (
        <div className="sim-card" style={{ maxWidth: '920px', margin: '0 auto' }}>
            {/* Encabezado */}
            <div className="sim-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h3>⚙️ Laboratorio de Potencia de James Watt: Del Vapor al Vatio</h3>
                    <p>Comprende cómo <strong>1 Caballo de Fuerza (1 HP)</strong> equivale a <strong>746 Watts</strong> mecánicos y eléctricos</p>
                </div>

                <button
                    onClick={() => setIsRunning(!isRunning)}
                    style={{
                        background: isRunning ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        border: `1.5px solid ${isRunning ? '#ef4444' : '#10b981'}`,
                        color: isRunning ? '#f87171' : '#34d399',
                        padding: '6px 16px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    {isRunning ? <Pause size={15} /> : <Play size={15} />}
                    {isRunning ? 'Pausar Mecanismo' : 'Iniciar Mecanismo'}
                </button>
            </div>

            {/* Selector de Modos / Vistas Históricas en Secuencia Cronológica */}
            <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        Secuencia:
                    </span>
                    <button
                        onClick={() => setMode('horse')}
                        style={{
                            background: mode === 'horse' ? 'rgba(52, 211, 153, 0.25)' : 'rgba(255,255,255,0.04)',
                            border: `1.5px solid ${mode === 'horse' ? '#34d399' : 'rgba(255,255,255,0.08)'}`,
                            color: mode === 'horse' ? '#34d399' : '#cbd5e1',
                            borderRadius: '8px',
                            padding: '5px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                        }}
                    >
                        🐴 1. Caballos en Cabria (1782)
                    </button>
                    <button
                        onClick={() => setMode('rotative')}
                        style={{
                            background: mode === 'rotative' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.04)',
                            border: `1.5px solid ${mode === 'rotative' ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                            color: mode === 'rotative' ? '#fbbf24' : '#cbd5e1',
                            borderRadius: '8px',
                            padding: '5px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                        }}
                    >
                        🔄 2. Máquina de Vapor (1788)
                    </button>
                    <button
                        onClick={() => setMode('motor')}
                        style={{
                            background: mode === 'motor' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.04)',
                            border: `1.5px solid ${mode === 'motor' ? '#38bdf8' : 'rgba(255,255,255,0.08)'}`,
                            color: mode === 'motor' ? '#38bdf8' : '#cbd5e1',
                            borderRadius: '8px',
                            padding: '5px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                        }}
                    >
                        ⚡ 3. Motor Eléctrico (Hoy)
                    </button>
                </div>

                <div style={{ color: '#fbbf24', fontSize: '0.82rem', fontWeight: 800 }}>
                    Rotación: <strong>{Math.round(rotSpeed * 15)} RPM</strong>
                </div>
            </div>

            <div className="sim-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(280px, 340px)', gap: '1.5rem', alignItems: 'center' }}>

                    {/* ── ESCENARIO SVG PRINCIPAL ── */}
                    <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                        {/* ── VISTA 1: MÁQUINA DE VAPOR ROTATIVA DE JAMES WATT CON RUEDA VOLANTE ── */}
                        {mode === 'rotative' && (
                            <svg viewBox="0 0 420 260" width="100%" height="240" style={{ maxWidth: '420px' }}>
                                <defs>
                                    <linearGradient id="fireGrad" x1="0" y1="1" x2="0" y2="0">
                                        <stop offset="0%" stopColor="#b91c1c" />
                                        <stop offset="50%" stopColor="#ea580c" />
                                        <stop offset="100%" stopColor="#fbbf24" />
                                    </linearGradient>
                                    {/* Máscara de corte para que el agua tenga la forma circular exacta de la caldera */}
                                    <clipPath id="boilerClip">
                                        <path d="M 55 210 L 125 210 C 125 150 55 150 55 210 Z" />
                                    </clipPath>
                                </defs>

                                {/* Suelo del taller */}
                                <line x1="0" y1="240" x2="420" y2="240" stroke="#334155" strokeWidth="4" />

                                {/* ── HORNO DE FUEGO INFERIOR ── */}
                                <rect x="30" y="210" width="105" height="28" fill="#451a03" stroke="#d97706" strokeWidth="1.5" rx="3" />
                                {isRunning && (
                                    <g>
                                        {/* ── 5 LLAMAS ANCHAS CON PUNTA (no se meten en el agua) ── */}

                                        {/* Llama 1 - extremo izquierdo */}
                                        <path d={`M 35 235 Q 37 ${228 + Math.sin(animTick*0.38)*3} 43 ${218 + Math.sin(animTick*0.33)*3} Q 49 ${226 + Math.cos(animTick*0.38)*3} 51 235 Z`} fill="url(#fireGrad)" opacity="0.92" />
                                        <path d={`M 38 235 Q 40 ${229 + Math.sin(animTick*0.38)*2} 43 ${221 + Math.sin(animTick*0.33)*2} Q 46 ${227 + Math.cos(animTick*0.38)*2} 48 235 Z`} fill="#fbbf24" opacity="0.65" />

                                        {/* Llama 2 */}
                                        <path d={`M 50 235 Q 52 ${225 + Math.cos(animTick*0.45)*3} 59 ${214 + Math.cos(animTick*0.4)*3} Q 66 ${223 + Math.sin(animTick*0.42)*3} 68 235 Z`} fill="url(#fireGrad)" opacity="0.95" />
                                        <path d={`M 53 235 Q 55 ${226 + Math.cos(animTick*0.45)*2} 59 ${217 + Math.cos(animTick*0.4)*2} Q 63 ${224 + Math.sin(animTick*0.42)*2} 65 235 Z`} fill="#fbbf24" opacity="0.7" />

                                        {/* Llama 3 - central (la más alta del grupo) */}
                                        <path d={`M 67 235 Q 70 ${223 + Math.sin(animTick*0.35)*3} 78 ${212 + Math.sin(animTick*0.3)*3} Q 86 ${221 + Math.cos(animTick*0.35)*3} 89 235 Z`} fill="url(#fireGrad)" opacity="0.98" />
                                        <path d={`M 71 235 Q 74 ${224 + Math.sin(animTick*0.35)*2} 78 ${215 + Math.sin(animTick*0.3)*2} Q 82 ${222 + Math.cos(animTick*0.35)*2} 85 235 Z`} fill="#fbbf24" opacity="0.75" />

                                        {/* Llama 4 */}
                                        <path d={`M 88 235 Q 90 ${225 + Math.cos(animTick*0.42)*3} 97 ${214 + Math.cos(animTick*0.38)*3} Q 104 ${223 + Math.sin(animTick*0.4)*3} 106 235 Z`} fill="url(#fireGrad)" opacity="0.95" />
                                        <path d={`M 91 235 Q 93 ${226 + Math.cos(animTick*0.42)*2} 97 ${217 + Math.cos(animTick*0.38)*2} Q 101 ${224 + Math.sin(animTick*0.4)*2} 103 235 Z`} fill="#fbbf24" opacity="0.7" />

                                        {/* Llama 5 - extremo derecho */}
                                        <path d={`M 105 235 Q 107 ${228 + Math.sin(animTick*0.4)*3} 113 ${218 + Math.sin(animTick*0.35)*3} Q 119 ${226 + Math.cos(animTick*0.4)*3} 121 235 Z`} fill="url(#fireGrad)" opacity="0.9" />
                                        <path d={`M 108 235 Q 110 ${229 + Math.sin(animTick*0.4)*2} 113 ${221 + Math.sin(animTick*0.35)*2} Q 116 ${227 + Math.cos(animTick*0.4)*2} 118 235 Z`} fill="#fbbf24" opacity="0.65" />
                                    </g>
                                )}

                                {/* ── CHIMENEA CON HUMO ASCENDENTE ── */}
                                <polygon points="35,210 50,210 46,130 38,130" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
                                {isRunning && (
                                    <g>
                                        {/* ── VAPOR REALISTA ASCENDENTE (múltiples bocanadas) ── */}
                                        
                                        {/* Capa 1: Bocanadas pequeñas saliendo de la chimenea */}
                                        <circle cx={42 + Math.sin(animTick * 0.25) * 3} cy={125 - ((animTick * 1.2) % 25)} r={3 + ((animTick * 1.2) % 25) * 0.15} fill="#e2e8f0" opacity={0.7 - ((animTick * 1.2) % 25) * 0.025} />
                                        <circle cx={44 + Math.cos(animTick * 0.3) * 2} cy={125 - (((animTick + 8) * 1.2) % 25)} r={3 + (((animTick + 8) * 1.2) % 25) * 0.15} fill="#e2e8f0" opacity={0.65 - (((animTick + 8) * 1.2) % 25) * 0.023} />
                                        
                                        {/* Capa 2: Volutas medianas dispersándose */}
                                        <circle cx={42 + Math.sin(animTick * 0.18) * 6} cy={100 - ((animTick * 0.8) % 30)} r={5 + ((animTick * 0.8) % 30) * 0.2} fill="#cbd5e1" opacity={0.45 - ((animTick * 0.8) % 30) * 0.013} />
                                        <circle cx={46 + Math.cos(animTick * 0.22) * 5} cy={100 - (((animTick + 12) * 0.8) % 30)} r={4.5 + (((animTick + 12) * 0.8) % 30) * 0.2} fill="#cbd5e1" opacity={0.4 - (((animTick + 12) * 0.8) % 30) * 0.012} />
                                        
                                        {/* Capa 3: Nubecitas grandes difuminándose */}
                                        <circle cx={48 + Math.sin(animTick * 0.12) * 8} cy={70 - ((animTick * 0.5) % 35)} r={7 + ((animTick * 0.5) % 35) * 0.25} fill="#94a3b8" opacity={0.3 - ((animTick * 0.5) % 35) * 0.007} />
                                        <circle cx={55 + Math.cos(animTick * 0.1) * 10} cy={70 - (((animTick + 15) * 0.5) % 35)} r={6.5 + (((animTick + 15) * 0.5) % 35) * 0.25} fill="#94a3b8" opacity={0.28 - (((animTick + 15) * 0.5) % 35) * 0.007} />
                                        
                                        {/* Capa 4: Rastros tenues casi invisibles */}
                                        <circle cx={55 + Math.sin(animTick * 0.08) * 12} cy={40 - ((animTick * 0.3) % 30)} r={8 + ((animTick * 0.3) % 30) * 0.3} fill="#64748b" opacity={0.18 - ((animTick * 0.3) % 30) * 0.005} />
                                    </g>
                                )}

                                {/* ── CALDERA DE AGUA Y VAPOR CON AGUA CURVADA Y VAPOR EN MOVIMIENTO ── */}
                                <g>
                                    {/* Domo de la Caldera */}
                                    <path d="M 55 210 L 125 210 C 125 150 55 150 55 210 Z" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" strokeWidth="2.5" />
                                    
                                    {/* Agua Hirviendo adaptada a la curva del domo */}
                                    <g clipPath="url(#boilerClip)">
                                        <rect x="50" y="178" width="80" height="35" fill="#0284c7" opacity="0.85" />
                                        {isRunning && (
                                            <g opacity="0.8">
                                                <circle cx="70" cy={205 - ((animTick * 2) % 22)} r="2" fill="white" />
                                                <circle cx="90" cy={205 - ((animTick * 2.5) % 22)} r="2.5" fill="white" />
                                                <circle cx="110" cy={205 - ((animTick * 1.8) % 22)} r="2" fill="white" />
                                            </g>
                                        )}
                                        
                                        {/* Movimiento de vapor ascendente dentro de la olla */}
                                        {isRunning && (
                                            <g opacity="0.6">
                                                {/* Volutas de vapor subiendo continuamente */}
                                                <circle cx={78 + Math.sin(animTick * 0.3) * 4} cy={175 - ((animTick * 1.5) % 20)} r={3 + ((animTick % 10) * 0.4)} fill="#f1f5f9" opacity="0.4" />
                                                <circle cx={92 + Math.cos(animTick * 0.3) * 5} cy={175 - (((animTick + 5) * 1.5) % 20)} r={3.5 + ((animTick % 10) * 0.3)} fill="#f1f5f9" opacity="0.5" />
                                                <circle cx={105 + Math.sin(animTick * 0.25) * 4} cy={175 - (((animTick + 10) * 1.5) % 20)} r={3 + ((animTick % 10) * 0.4)} fill="#f1f5f9" opacity="0.4" />
                                                {/* Estelas ondulantes de vapor */}
                                                <path d={`M 75 175 Q ${82 + Math.sin(animTick * 0.3) * 5} 165 90 155`} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="3 2" />
                                                <path d={`M 105 175 Q ${98 + Math.cos(animTick * 0.3) * 5} 165 90 155`} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="3 2" />
                                            </g>
                                        )}
                                    </g>
                                </g>

                                {/* ── TUBERÍAS DE VAPOR CONTINUAS Y CONECTADAS ── */}
                                {/* Brida en la cúpula de la caldera */}
                                <rect x="86" y="162" width="8" height="6" fill="#d97706" rx="1" />
                                
                                {/* Tubo superior de entrada de vapor al cilindro (nace dentro del domo en Y=168) */}
                                <path d="M 90 168 L 90 124 L 133 124" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
                                <rect x="130" y="120" width="4" height="8" fill="#d97706" rx="1" />
                                
                                {/* Tubo inferior de retorno/condensación */}
                                <path d="M 133 165 Q 124 165 116 178" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
                                <rect x="130" y="161" width="4" height="8" fill="#d97706" rx="1" />

                                {/* ── CILINDRO DE VAPOR FIJO Y CENTRADO EN X=151 (PARTE SUPERIOR REDUCIDA, BASE EN Y=200) ── */}
                                <rect x="133" y="114" width="36" height="86" fill="#fef08a" stroke="#d97706" strokeWidth="2.5" rx="3" />
                                
                                {/* Biela articulada con ángulo variable entre el balancín y el pistón */}
                                <line x1={rotLeftTipX} y1={rotLeftTipY} x2="151" y2={rotLeftTipY + 57} stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
                                <line x1={rotLeftTipX} y1={rotLeftTipY} x2="151" y2={rotLeftTipY + 57} stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
                                
                                {/* Cabeza del pistón 100% confinada y centrada en el eje vertical del cilindro (X=151) */}
                                <rect x="137" y={rotLeftTipY + 57} width="28" height="10" fill="#d97706" stroke="#fbbf24" strokeWidth="1.5" rx="2" />
                                <circle cx="151" cy={rotLeftTipY + 57} r="3.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />

                                {/* ── PILAR Y BALANCÍN OSCILANTE (WALKING BEAM) DE ACERO ILUMINADO ── */}
                                <line x1={rotPivotX} y1="240" x2={rotPivotX} y2={rotPivotY} stroke="#64748b" strokeWidth="7" strokeLinecap="round" />
                                <circle cx={rotPivotX} cy={rotPivotY} r="7" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />

                                {/* Viga del Balancín (Metálica con Contraste Claro) */}
                                <line x1={rotLeftTipX} y1={rotLeftTipY} x2={rotRightTipX} y2={rotRightTipY} stroke="#cbd5e1" strokeWidth="7" strokeLinecap="round" />
                                
                                {/* Pernos articulados en los extremos del balancín */}
                                <circle cx={rotLeftTipX} cy={rotLeftTipY} r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
                                <circle cx={rotRightTipX} cy={rotRightTipY} r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />

                                {/* ── BIELA ARTICULADA (CONNECTING ROD) DORADA/AMBAR ALTO CONTRASTE ── */}
                                <line
                                    x1={rotRightTipX}
                                    y1={rotRightTipY}
                                    x2={crankPinX}
                                    y2={crankPinY}
                                    stroke="#f59e0b"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                />
                                <line
                                    x1={rotRightTipX}
                                    y1={rotRightTipY}
                                    x2={crankPinX}
                                    y2={crankPinY}
                                    stroke="#fef08a"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                {/* Pernos articulados de la biela */}
                                <circle cx={rotRightTipX} cy={rotRightTipY} r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                                <circle cx={crankPinX} cy={crankPinY} r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />

                                {/* ── GRAN RUEDA VOLANTE DE RADIOS (FLYWHEEL COMPACTA) ── */}
                                <g transform={`translate(${wheelCenterX}, ${wheelCenterY})`}>
                                    {/* Rueda exterior con radios girando */}
                                    <g transform={`rotate(${rotWheelAngle})`}>
                                        <circle cx="0" cy="0" r="44" fill="none" stroke="#94a3b8" strokeWidth="7" />
                                        <circle cx="0" cy="0" r="14" fill="#475569" stroke="#cbd5e1" strokeWidth="2" />
                                        {/* 8 Radios de la rueda */}
                                        <line x1="-44" y1="0" x2="44" y2="0" stroke="#cbd5e1" strokeWidth="2.5" />
                                        <line x1="0" y1="-44" x2="0" y2="44" stroke="#cbd5e1" strokeWidth="2.5" />
                                        <line x1="-31" y1="-31" x2="31" y2="31" stroke="#cbd5e1" strokeWidth="2.5" />
                                        <line x1="-31" y1="31" x2="31" y2="-31" stroke="#cbd5e1" strokeWidth="2.5" />
                                    </g>

                                    {/* Brazo de la Manivela (Crank) */}
                                    <g transform={`rotate(${rotWheelAngle})`}>
                                        <polygon points="0,-7 20,-5 20,5 0,7" fill="#d97706" stroke="#fbbf24" strokeWidth="1.5" />
                                        <circle cx="16" cy="0" r="4" fill="#fef08a" />
                                    </g>

                                    {/* Eje central de la rueda */}
                                    <circle cx="0" cy="0" r="7" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
                                </g>

                                {/* ── SOPORTE CENTRAL DE LA RUEDA VOLANTE ── */}
                                <line x1="295" y1="240" x2="295" y2="160" stroke="#475569" strokeWidth="6" />
                                <circle cx="295" cy="160" r="5" fill="#64748b" stroke="#475569" strokeWidth="1.5" />

                                {/* Eje giratorio de acero que une rueda con bomba */}
                                <line x1="295" y1="160" x2="362" y2="160" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
                                <line x1="295" y1="160" x2="362" y2="160" stroke="#38bdf8" strokeWidth="2" />

                                {/* ── BOMBA HIDRÁULICA ROTATIVA ALINEADA EXACTAMENTE EN EL EJE (X=362, Y=160) ── */}
                                {/* Base de la bomba */}
                                <line x1="362" y1="240" x2="362" y2="160" stroke="#334155" strokeWidth="6" />

                                {/* Tubo de succión inferior */}
                                <line x1="362" y1="178" x2="362" y2="240" stroke="#64748b" strokeWidth="5" />

                                {/* Carcasa circular de la bomba centrífuga */}
                                <circle cx="362" cy="160" r="18" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
                                
                                {/* Rotor girando dentro de la bomba accionado directamente por el eje */}
                                <g transform={`rotate(${isRunning ? (animTick * rotSpeed * 3) % 360 : 0}, 362, 160)`}>
                                    <line x1="349" y1="160" x2="375" y2="160" stroke="#38bdf8" strokeWidth="2.5" />
                                    <line x1="362" y1="147" x2="362" y2="173" stroke="#38bdf8" strokeWidth="2.5" />
                                </g>
                                <circle cx="362" cy="160" r="4.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />

                                {/* Tubo metálico que sale de la bomba, cruza y baja sobre el recipiente */}
                                <path d="M 362 142 L 362 120 L 396 120 L 396 155" fill="none" stroke="#475569" strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round" />
                                <rect x="392" y="152" width="8" height="5" fill="#334155" rx="1" />

                                {/* ── TANQUE / RECIPIENTE DE AGUA ABIERTO SUPERIORMENTE (FONDO) ── */}
                                {/* Estructura del tanque abierto */}
                                <path
                                    d="M 382 205 L 382 238 Q 382 240 384 240 L 408 240 Q 410 240 410 238 L 410 205"
                                    fill="#0f172a"
                                    stroke="#0284c7"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                {/* Agua dentro del tanque */}
                                <path
                                    d={`M 383 212 Q 396 ${212 + (isRunning ? Math.sin(animTick * 0.4) * 1.5 : 0)} 409 212 L 409 239 L 383 239 Z`}
                                    fill="rgba(56, 189, 248, 0.65)"
                                />
                                <line
                                    x1="383"
                                    y1="212"
                                    x2="409"
                                    y2="212"
                                    stroke="#bae6fd"
                                    strokeWidth="1.5"
                                    opacity="0.8"
                                />

                                {/* ── CHORRO DE AGUA CAYENDO EN SERPENTEO FLUIDO (VISIBLE DIRECTAMENTE ENTRANDO AL AGUA) ── */}
                                {isRunning && (
                                    <g>
                                        {/* Curva serpenteante del chorro que llega y se funde dentro del agua */}
                                        <path
                                            d={`M 396 157 Q ${396 + Math.sin(animTick * 0.4) * 3.5} 185 ${396 + Math.cos(animTick * 0.35) * 2} 216`}
                                            fill="none"
                                            stroke="rgba(56, 189, 248, 0.85)"
                                            strokeWidth={Math.min(activeHP * 1.2 + 2.5, 7.5)}
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d={`M 396 157 Q ${396 + Math.sin(animTick * 0.4) * 3.5} 185 ${396 + Math.cos(animTick * 0.35) * 2} 216`}
                                            fill="none"
                                            stroke="#bae6fd"
                                            strokeWidth="2"
                                            strokeDasharray="3 3"
                                            strokeLinecap="round"
                                        />

                                        {/* Gotas fluidas deslizándose por la ondulación */}
                                        <circle cx={396 + Math.sin(animTick * 0.4 + 1) * 2.5} cy={162 + ((animTick * 4) % 48)} r="2.2" fill="#e0f2fe" opacity="0.9" />
                                        <circle cx={396 + Math.cos(animTick * 0.35 + 2) * 2} cy={170 + (((animTick + 4) * 4) % 44)} r="2" fill="#bae6fd" opacity="0.8" />

                                        {/* ── IMPACTO DEL AGUA AL GOLPEAR LA SUPERFICIE (SALPICADURAS Y ESPUMA) ── */}
                                        {/* Ondas concéntricas de choque en el agua */}
                                        <ellipse cx={396 + Math.cos(animTick * 0.35) * 2} cy="212" rx={2 + (animTick % 6) * 1.3} ry={0.7 + (animTick % 6) * 0.4} fill="none" stroke="#ffffff" opacity={0.9 - (animTick % 6) * 0.15} strokeWidth="1.8" />
                                        <ellipse cx={396 + Math.cos(animTick * 0.35) * 2} cy="212" rx={4 + ((animTick + 3) % 6) * 1.2} ry={1.2 + ((animTick + 3) % 6) * 0.35} fill="none" stroke="#38bdf8" opacity={0.75 - ((animTick + 3) % 6) * 0.12} strokeWidth="1.2" />

                                        {/* Gotas de agua que saltan hacia arriba por el golpe */}
                                        <circle cx={392 + Math.sin(animTick * 0.5) * 2} cy={206 - Math.abs(Math.sin(animTick * 0.6)) * 6} r="1.8" fill="#ffffff" />
                                        <circle cx={400 + Math.cos(animTick * 0.5) * 2} cy={205 - Math.abs(Math.cos(animTick * 0.55)) * 7} r="1.8" fill="#ffffff" />
                                        <circle cx={396 + Math.cos(animTick * 0.35) * 2} cy="212" r="2.5" fill="#bae6fd" />
                                    </g>
                                )}

                                {/* Rebordes superiores de la boca abierta del tanque (capa superior) */}
                                <line x1="379" y1="205" x2="385" y2="205" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                                <line x1="407" y1="205" x2="413" y2="205" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

                                {/* Etiqueta eliminada a petición del usuario */}
                            </svg>
                        )}

                        {/* ── VISTA 2: CABALLOS DE TIRO EN CABRIA GIRANDO EN CÍRCULO (2.5D) ── */}
                        {mode === 'horse' && (
                            <svg viewBox="0 0 420 260" width="100%" height="240" style={{ maxWidth: '420px' }}>
                                {/* Suelo del patio */}
                                <line x1="0" y1="240" x2="420" y2="240" stroke="#334155" strokeWidth="4" />

                                {/* Pista de tierra circular pisada por los caballos (centrada exactamente en la base del poste) */}
                                <ellipse cx={capstanCenterX} cy="240" rx={orbitRadiusX + 8} ry="6" fill="rgba(69, 26, 3, 0.45)" stroke="#78350f" strokeWidth="1.2" strokeDasharray="5 3" />

                                {/* ── CABALLOS EN EL FONDO (DETRÁS DEL PILAR) ── */}
                                {horseList.filter(h => !h.isFront).map(h => {
                                    const legPhase = h.id * 1.5;
                                    const legSwing = isRunning ? Math.sin(animTick * 0.23 + legPhase) : 0;
                                    return (
                                        <g key={`h-back-${h.id}`} transform={`translate(${h.x}, ${h.y}) scale(${h.scale * h.facing}, ${h.scale})`} opacity={0.88}>
                                            <ellipse cx="0" cy="38" rx="24" ry="5" fill="rgba(0,0,0,0.3)" />
                                            <line x1="-14" y1="12" x2={-16 + legSwing * 8} y2="36" stroke={h.color.stroke} strokeWidth="3.5" strokeLinecap="round" />
                                            <line x1="-10" y1="12" x2={-8 - legSwing * 8} y2="36" stroke={h.color.coat} strokeWidth="3" strokeLinecap="round" />
                                            <ellipse cx="0" cy="12" rx="19" ry="11" fill={h.color.coat} stroke={h.color.stroke} strokeWidth="1.5" />
                                            <path d="M -18 8 Q -28 12 -24 22" fill="none" stroke={h.color.mane} strokeWidth="3" strokeLinecap="round" />
                                            <line x1="12" y1="14" x2={10 - legSwing * 9} y2="36" stroke={h.color.stroke} strokeWidth="3.5" strokeLinecap="round" />
                                            <line x1="16" y1="14" x2={18 + legSwing * 9} y2="36" stroke={h.color.coat} strokeWidth="3" strokeLinecap="round" />
                                            <path d="M 10 4 L 19 -10 L 26 -6 L 17 14 Z" fill={h.color.coat} stroke={h.color.stroke} strokeWidth="1.5" />
                                            <ellipse cx="24" cy="-8" rx="7.5" ry="4.5" fill={h.color.coat} stroke={h.color.stroke} strokeWidth="1.5" />
                                            <polygon points="19,-14 22,-20 24,-14" fill={h.color.stroke} />
                                            <circle cx="26" cy="-10" r="1.5" fill="#0f172a" />
                                            <path d="M 11 2 Q 15 -5 17 -10" fill="none" stroke={h.color.mane} strokeWidth="2.5" strokeLinecap="round" />
                                            {/* Arnés limpio original */}
                                            <circle cx="11" cy="9" r="10" fill="none" stroke="#451a03" strokeWidth="2" />
                                            <line x1="0" y1="12" x2="20" y2="0" stroke="#d97706" strokeWidth="1.5" />
                                            <circle cx="0" cy="12" r="3.2" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" />
                                        </g>
                                    );
                                })}

                                {/* ── VIGAS DE TIRO DE MADERA FIJAS HACIA TODOS LOS CABALLOS ACTIVOS ── */}
                                {horseList.map(h => (
                                    <g key={`beam-${h.id}`}>
                                        <line x1={capstanCenterX} y1={beamFixedY} x2={h.x} y2={beamFixedY} stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
                                        <line x1={capstanCenterX} y1={beamFixedY} x2={h.x} y2={beamFixedY} stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
                                        <circle cx={h.x} cy={beamFixedY} r="4.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                                    </g>
                                ))}

                                {/* Buje central de rotación fijo en el pilar */}
                                <circle cx={capstanCenterX} cy={beamFixedY} r="8" fill="#d97706" stroke="#fbbf24" strokeWidth="2" />

                                {/* ── CABRIA CENTRAL CON ENGRANAJE DE TRANSMISIÓN (X=130, Y=160) ── */}
                                <line x1={capstanCenterX} y1="240" x2={capstanCenterX} y2="120" stroke="#78350f" strokeWidth="12" />
                                <rect x={capstanCenterX - 8} y="120" width="16" height="120" fill="#451a03" stroke="#d97706" strokeWidth="1.5" />
                                <circle cx={capstanCenterX} cy="120" r="10" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="2" />

                                {/* Engranaje cónico central de bronce girando sincronizado con el paso */}
                                <circle cx={capstanCenterX} cy="160" r="14" fill="#b45309" stroke="#fbbf24" strokeWidth="2" />
                                <g transform={`rotate(${isRunning ? (animTick * 5.2) % 360 : 0}, ${capstanCenterX}, 160)`}>
                                    <line x1={capstanCenterX - 12} y1="160" x2={capstanCenterX + 12} y2="160" stroke="#fef08a" strokeWidth="2.5" />
                                    <line x1={capstanCenterX} y1="148" x2={capstanCenterX} y2="172" stroke="#fef08a" strokeWidth="2.5" />
                                </g>

                                {/* ── CABALLOS EN EL FRENTE (DELANTE DEL PILAR) ── */}
                                {horseList.filter(h => h.isFront).map(h => {
                                    const legPhase = h.id * 1.5;
                                    const legSwing = isRunning ? Math.sin(animTick * 0.23 + legPhase) : 0;
                                    return (
                                        <g key={`h-front-${h.id}`} transform={`translate(${h.x}, ${h.y}) scale(${h.scale * h.facing}, ${h.scale})`}>
                                            <ellipse cx="0" cy="38" rx="24" ry="5" fill="rgba(0,0,0,0.35)" />
                                            <line x1="-14" y1="12" x2={-16 + legSwing * 8} y2="36" stroke={h.color.stroke} strokeWidth="3.5" strokeLinecap="round" />
                                            <line x1="-10" y1="12" x2={-8 - legSwing * 8} y2="36" stroke={h.color.coat} strokeWidth="3" strokeLinecap="round" />
                                            <ellipse cx="0" cy="12" rx="19" ry="11" fill={h.color.coat} stroke={h.color.stroke} strokeWidth="1.5" />
                                            <path d="M -18 8 Q -28 12 -24 22" fill="none" stroke={h.color.mane} strokeWidth="3" strokeLinecap="round" />
                                            <line x1="12" y1="14" x2={10 - legSwing * 9} y2="36" stroke={h.color.stroke} strokeWidth="3.5" strokeLinecap="round" />
                                            <line x1="16" y1="14" x2={18 + legSwing * 9} y2="36" stroke={h.color.coat} strokeWidth="3" strokeLinecap="round" />
                                            <path d="M 10 4 L 19 -10 L 26 -6 L 17 14 Z" fill={h.color.coat} stroke={h.color.stroke} strokeWidth="1.5" />
                                            <ellipse cx="24" cy="-8" rx="7.5" ry="4.5" fill={h.color.coat} stroke={h.color.stroke} strokeWidth="1.5" />
                                            <polygon points="19,-14 22,-20 24,-14" fill={h.color.stroke} />
                                            <circle cx="26" cy="-10" r="1.5" fill="#0f172a" />
                                            <path d="M 11 2 Q 15 -5 17 -10" fill="none" stroke={h.color.mane} strokeWidth="2.5" strokeLinecap="round" />
                                            {/* Arnés simple original */}
                                            <circle cx="11" cy="9" r="10" fill="none" stroke="#451a03" strokeWidth="2" />
                                            <line x1="0" y1="12" x2="20" y2="0" stroke="#d97706" strokeWidth="1.5" />
                                            <circle cx="0" cy="12" r="3.2" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" />
                                        </g>
                                    );
                                })}

                                {/* ── EJE DE TRANSMISIÓN HORIZONTAL QUE VA A LA BOMBA (Y=160) ── */}
                                <line x1={capstanCenterX} y1="160" x2="362" y2="160" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
                                <line x1={capstanCenterX} y1="160" x2="362" y2="160" stroke="#38bdf8" strokeWidth="2" />
                                
                                {/* Soporte intermedio del eje */}
                                <line x1="245" y1="240" x2="245" y2="160" stroke="#475569" strokeWidth="4" />
                                <circle cx="245" cy="160" r="4" fill="#64748b" />

                                {/* ── BOMBA HIDRÁULICA ROTATIVA (X=362, Y=160) ── */}
                                <line x1="362" y1="240" x2="362" y2="160" stroke="#334155" strokeWidth="6" />
                                <line x1="362" y1="178" x2="362" y2="240" stroke="#64748b" strokeWidth="5" />
                                <circle cx="362" cy="160" r="18" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
                                <g transform={`rotate(${isRunning ? (animTick * (3 + activeHP * 1.5)) % 360 : 0}, 362, 160)`}>
                                    <line x1="349" y1="160" x2="375" y2="160" stroke="#38bdf8" strokeWidth="2.5" />
                                    <line x1="362" y1="147" x2="362" y2="173" stroke="#38bdf8" strokeWidth="2.5" />
                                </g>
                                <circle cx="362" cy="160" r="4.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />

                                {/* Tubo metálico que sale de la bomba y baja al tanque */}
                                <path d="M 362 142 L 362 120 L 396 120 L 396 155" fill="none" stroke="#475569" strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round" />
                                <rect x="392" y="152" width="8" height="5" fill="#334155" rx="1" />

                                {/* ── TANQUE / RECIPIENTE DE AGUA ABIERTO SUPERIORMENTE ── */}
                                <path
                                    d="M 382 205 L 382 238 Q 382 240 384 240 L 408 240 Q 410 240 410 238 L 410 205"
                                    fill="#0f172a"
                                    stroke="#0284c7"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <path
                                    d={`M 383 212 Q 396 ${212 + (isRunning ? Math.sin(animTick * 0.4) * 1.5 : 0)} 409 212 L 409 239 L 383 239 Z`}
                                    fill="rgba(56, 189, 248, 0.65)"
                                />
                                <line x1="383" y1="212" x2="409" y2="212" stroke="#bae6fd" strokeWidth="1.5" opacity="0.8" />

                                {/* ── CHORRO DE AGUA CAYENDO EN SERPENTEO FLUIDO ── */}
                                {isRunning && (
                                    <g>
                                        <path
                                            d={`M 396 157 Q ${396 + Math.sin(animTick * 0.4) * 3.5} 185 ${396 + Math.cos(animTick * 0.35) * 2} 216`}
                                            fill="none"
                                            stroke="rgba(56, 189, 248, 0.85)"
                                            strokeWidth={Math.min(activeHP * 1.2 + 2.5, 7.5)}
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d={`M 396 157 Q ${396 + Math.sin(animTick * 0.4) * 3.5} 185 ${396 + Math.cos(animTick * 0.35) * 2} 216`}
                                            fill="none"
                                            stroke="#bae6fd"
                                            strokeWidth="2"
                                            strokeDasharray="3 3"
                                            strokeLinecap="round"
                                        />
                                        <circle cx={396 + Math.sin(animTick * 0.4 + 1) * 2.5} cy={162 + ((animTick * 4) % 48)} r="2.2" fill="#e0f2fe" opacity="0.9" />
                                        <circle cx={396 + Math.cos(animTick * 0.35 + 2) * 2} cy={170 + (((animTick + 4) * 4) % 44)} r="2" fill="#bae6fd" opacity="0.8" />

                                        {/* Salpicaduras de impacto */}
                                        <ellipse cx={396 + Math.cos(animTick * 0.35) * 2} cy="212" rx={2 + (animTick % 6) * 1.3} ry={0.7 + (animTick % 6) * 0.4} fill="none" stroke="#ffffff" opacity={0.9 - (animTick % 6) * 0.15} strokeWidth="1.8" />
                                        <circle cx={392 + Math.sin(animTick * 0.5) * 2} cy={206 - Math.abs(Math.sin(animTick * 0.6)) * 6} r="1.8" fill="#ffffff" />
                                        <circle cx={400 + Math.cos(animTick * 0.5) * 2} cy={205 - Math.abs(Math.cos(animTick * 0.55)) * 7} r="1.8" fill="#ffffff" />
                                    </g>
                                )}

                                {/* Rebordes superiores de la boca abierta */}
                                <line x1="379" y1="205" x2="385" y2="205" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                                <line x1="407" y1="205" x2="413" y2="205" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        )}

                        {/* ── VISTA 3: MOTOR ELÉCTRICO MODERNO (HOY) ── */}
                        {mode === 'motor' && (
                            <svg viewBox="0 0 420 260" width="100%" height="240" style={{ maxWidth: '420px' }}>
                                {/* Suelo del laboratorio industrial */}
                                <line x1="0" y1="240" x2="420" y2="240" stroke="#334155" strokeWidth="4" />
                                
                                {/* Base de hormigón antivibración del motor */}
                                <rect x="30" y="226" width="165" height="14" fill="#1e293b" stroke="#475569" strokeWidth="1.5" rx="3" />
                                <circle cx="45" cy="233" r="2.5" fill="#64748b" />
                                <circle cx="180" cy="233" r="2.5" fill="#64748b" />

                                {/* ── MOTOR ELÉCTRICO INDUSTRIAL TRIFÁSICO (X=40 a 180, EJE Y=160) ── */}
                                {/* Patas de anclaje de acero */}
                                <rect x="46" y="214" width="24" height="14" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" rx="2" />
                                <circle cx="58" cy="222" r="3" fill="#cbd5e1" />
                                <rect x="146" y="214" width="24" height="14" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" rx="2" />
                                <circle cx="158" cy="222" r="3" fill="#cbd5e1" />

                                {/* Carcasa cilíndrica del Estator con aletas de disipación de calor */}
                                <rect x="56" y="105" width="118" height="112" fill="#0f172a" stroke="#0284c7" strokeWidth="2.5" rx="14" />
                                
                                {/* Aletas horizontales de enfriamiento con textura metálica */}
                                <line x1="62" y1="120" x2="168" y2="120" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" />
                                <line x1="62" y1="134" x2="168" y2="134" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" />
                                <line x1="62" y1="148" x2="168" y2="148" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" />
                                <line x1="62" y1="162" x2="168" y2="162" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" />
                                <line x1="62" y1="176" x2="168" y2="176" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" />
                                <line x1="62" y1="190" x2="168" y2="190" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" />
                                <line x1="62" y1="204" x2="168" y2="204" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" />

                                {/* Campo electromagnético pulsante en el núcleo (Rotor Induction Glow) */}
                                <circle cx="115" cy="160" r="32" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="12" />
                                <circle
                                    cx="115"
                                    cy="160"
                                    r="30"
                                    fill="none"
                                    stroke="#38bdf8"
                                    strokeWidth="2.2"
                                    strokeDasharray="14 10"
                                    transform={`rotate(${isRunning ? (animTick * Math.min(activeHP * 12 + 6, 90)) % 360 : 0}, 115, 160)`}
                                />

                                {/* Tapa y Rejilla del Ventilador de Refrigeración Trasero (Izquierda X=38 a 56) */}
                                <path d="M 56 112 L 40 124 L 40 198 L 56 210 Z" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
                                <g transform={`rotate(${isRunning ? (animTick * Math.min(activeHP * 15 + 10, 120)) % 360 : 0}, 48, 160)`}>
                                    <line x1="42" y1="160" x2="54" y2="160" stroke="#bae6fd" strokeWidth="3" />
                                    <line x1="48" y1="154" x2="48" y2="166" stroke="#bae6fd" strokeWidth="3" />
                                </g>

                                {/* Caja de Bornes de Conexión Superior (Terminal Box) */}
                                <rect x="85" y="74" width="60" height="32" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" rx="4" />
                                <rect x="92" y="78" width="46" height="8" fill="#0284c7" rx="2" />
                                <text x="115" y="99" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="900" letterSpacing="0.5">BORNERA</text>

                                {/* Cables de Alimentación Trifásicos de alta tensión con flujo de electrones */}
                                <path d="M 50 18 Q 72 45 96 74" fill="none" stroke="#ef4444" strokeWidth="3.5" />
                                <path d="M 68 18 Q 88 45 115 74" fill="none" stroke="#eab308" strokeWidth="3.5" />
                                <path d="M 86 18 Q 104 45 134 74" fill="none" stroke="#3b82f6" strokeWidth="3.5" />
                                
                                {isRunning && (
                                    <g>
                                        <circle cx={50 + ((animTick * 4) % 46)} cy={18 + ((animTick * 4) % 46) * 1.2} r="2.2" fill="#ffffff" />
                                        <circle cx={68 + ((animTick * 4 + 15) % 47)} cy={18 + ((animTick * 4 + 15) % 47) * 1.2} r="2.2" fill="#ffffff" />
                                        <circle cx={86 + ((animTick * 4 + 30) % 48)} cy={18 + ((animTick * 4 + 30) % 48) * 1.2} r="2.2" fill="#ffffff" />
                                    </g>
                                )}

                                {/* Placa Técnica de Especificaciones (Nameplate en el frente del motor) */}
                                <rect x="80" y="142" width="70" height="34" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" strokeWidth="1.2" rx="3" />
                                <text x="115" y="154" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="900">
                                    {activeHP.toFixed(1)} HP
                                </text>
                                <text x="115" y="167" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold">
                                    {activeWatts.toFixed(0)} W (V·I)
                                </text>

                                {/* ── EJE DE SALIDA Y ACOPLAMIENTO ELÁSTICO (X=174 a 362, Y=160) ── */}
                                <line x1="174" y1="160" x2="362" y2="160" stroke="#cbd5e1" strokeWidth="7" strokeLinecap="round" />
                                <line x1="174" y1="160" x2="362" y2="160" stroke="#38bdf8" strokeWidth="2.5" />

                                {/* Acoplamiento de brida flexible (Coupling) rotando */}
                                <rect x="225" y="146" width="22" height="28" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" rx="3" />
                                <g transform={`rotate(${isRunning ? (animTick * Math.min(activeHP * 15 + 8, 120)) % 360 : 0}, 236, 160)`}>
                                    <circle cx="236" cy="151" r="2.5" fill="#fbbf24" />
                                    <circle cx="236" cy="169" r="2.5" fill="#fbbf24" />
                                </g>

                                {/* Soporte de Chumacera con rodamiento de bolas */}
                                <line x1="285" y1="240" x2="285" y2="160" stroke="#334155" strokeWidth="6" />
                                <rect x="277" y="150" width="16" height="20" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" rx="2" />
                                <circle cx="285" cy="160" r="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />

                                {/* ── BOMBA HIDRÁULICA ROTATIVA (X=362, Y=160) ── */}
                                <line x1="362" y1="240" x2="362" y2="160" stroke="#334155" strokeWidth="6" />
                                <line x1="362" y1="178" x2="362" y2="240" stroke="#64748b" strokeWidth="5" />
                                <circle cx="362" cy="160" r="18" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
                                <g transform={`rotate(${isRunning ? (animTick * Math.min(activeHP * 12 + 6, 120)) % 360 : 0}, 362, 160)`}>
                                    <line x1="349" y1="160" x2="375" y2="160" stroke="#38bdf8" strokeWidth="2.5" />
                                    <line x1="362" y1="147" x2="362" y2="173" stroke="#38bdf8" strokeWidth="2.5" />
                                </g>
                                <circle cx="362" cy="160" r="4.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />

                                {/* Tubo metálico que sale de la bomba y baja al tanque */}
                                <path d="M 362 142 L 362 120 L 396 120 L 396 155" fill="none" stroke="#475569" strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round" />
                                <rect x="392" y="152" width="8" height="5" fill="#334155" rx="1" />

                                {/* ── TANQUE / RECIPIENTE DE AGUA ABIERTO SUPERIORMENTE ── */}
                                <path
                                    d="M 382 205 L 382 238 Q 382 240 384 240 L 408 240 Q 410 240 410 238 L 410 205"
                                    fill="#0f172a"
                                    stroke="#0284c7"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <path
                                    d={`M 383 212 Q 396 ${212 + (isRunning ? Math.sin(animTick * 0.5) * 1.5 : 0)} 409 212 L 409 239 L 383 239 Z`}
                                    fill="rgba(56, 189, 248, 0.65)"
                                />
                                <line x1="383" y1="212" x2="409" y2="212" stroke="#bae6fd" strokeWidth="1.5" opacity="0.8" />

                                {/* ── CHORRO DE AGUA CAYENDO EN SERPENTEO FLUIDO ── */}
                                {isRunning && (
                                    <g>
                                        <path
                                            d={`M 396 157 Q ${396 + Math.sin(animTick * 0.5) * 3.5} 185 ${396 + Math.cos(animTick * 0.45) * 2} 216`}
                                            fill="none"
                                            stroke="rgba(56, 189, 248, 0.85)"
                                            strokeWidth={Math.min(activeHP * 1.2 + 2.5, 8)}
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d={`M 396 157 Q ${396 + Math.cos(animTick * 0.5) * 2.5} 185 396 216`}
                                            fill="none"
                                            stroke="#ffffff"
                                            strokeWidth={Math.min(activeHP * 0.4 + 1.2, 3.5)}
                                            strokeLinecap="round"
                                        />
                                        {/* Ondas concéntricas de choque y salpicaduras en la superficie */}
                                        <ellipse
                                            cx="396"
                                            cy="216"
                                            rx={6 + (animTick % 6) * 1.2}
                                            ry={2 + (animTick % 6) * 0.4}
                                            fill="none"
                                            stroke="rgba(255, 255, 255, 0.7)"
                                            strokeWidth="1.2"
                                        />
                                        <circle cx={393 + Math.sin(animTick * 0.7) * 4} cy={213 - Math.abs(Math.sin(animTick * 0.6)) * 6} r="1.5" fill="#e0f2fe" />
                                        <circle cx={399 - Math.cos(animTick * 0.7) * 4} cy={212 - Math.abs(Math.cos(animTick * 0.6)) * 6} r="1.3" fill="#e0f2fe" />
                                    </g>
                                )}
                            </svg>
                        )}

                        {/* Texto Informativo en la Base */}
                        <div style={{ marginTop: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '6px 14px', width: '100%', textAlign: 'center' }}>
                            <span style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>
                                Potencia Activa: <strong style={{ color: '#fbbf24' }}>{activeHP.toFixed(2)} HP</strong> = <strong style={{ color: '#38bdf8' }}>{activeWatts.toFixed(0)} Watts (P = V · I)</strong>
                            </span>
                        </div>
                    </div>

                    {/* ── PANEL DE CONTROL INTERACTIVO ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Tarjeta de Potencia en Watts */}
                        <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1.5px solid #f59e0b', borderRadius: '16px', padding: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                    ⚡ Potencia Mecánica & Eléctrica
                                </span>
                                <span style={{ background: '#f59e0b', color: '#0f172a', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 900 }}>
                                    {activeHP.toFixed(1)} HP
                                </span>
                            </div>
                            <div style={{ color: 'white', fontSize: '1.8rem', fontWeight: 900, fontFamily: 'monospace' }}>
                                {activeWatts.toLocaleString('en-US', { maximumFractionDigits: 0 })} <span style={{ fontSize: '1.1rem', color: '#38bdf8' }}>Watts [W]</span>
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>
                                {mode === 'rotative' && <span>Transformando presión de vapor térmico en <strong>energía mecánica rotatoria ({Math.round(rotSpeed * 15)} RPM)</strong>.</span>}
                                {mode === 'horse' && <span>Trabajo muscular animal rotatorio transmitido a la maquinaria.</span>}
                                {mode === 'motor' && <span>Trabajo electromagnético generado a partir de voltaje y corriente.</span>}
                            </div>
                        </div>

                        {/* Controles según el modo */}
                        {mode === 'rotative' && (
                            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ color: '#fbbf24', fontSize: '0.82rem', fontWeight: 800 }}>🚂 Potencia de la Máquina de Vapor:</span>
                                    <strong style={{ color: 'white', fontSize: '1rem' }}>{horsesCount} HP</strong>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="12"
                                    step="1"
                                    value={horsesCount}
                                    onChange={e => setHorsesCount(parseInt(e.target.value))}
                                    style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
                                />
                                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '6px' }}>
                                    Una máquina de {horsesCount} HP produce {activeWatts.toFixed(0)} Watts ({Math.round(rotSpeed * 15)} RPM en la rueda volante).
                                </div>
                            </div>
                        )}

                        {mode === 'horse' && (
                            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ color: '#34d399', fontSize: '0.82rem', fontWeight: 800 }}>🐴 Número de Caballos en la Cabria:</span>
                                    <strong style={{ color: 'white', fontSize: '1rem' }}>{horsesCount} Caballos</strong>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="8"
                                    step="1"
                                    value={horsesCount}
                                    onChange={e => setHorsesCount(parseInt(e.target.value))}
                                    style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
                                />
                                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '6px' }}>
                                    Cada caballo añade 746 Watts de potencia rotativa continua.
                                </div>
                            </div>
                        )}

                        {mode === 'motor' && (
                            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 800 }}>⚡ Voltaje (V):</span>
                                        <strong style={{ color: 'white' }}>{voltage} V</strong>
                                    </div>
                                    <input
                                        type="range"
                                        min="120"
                                        max="480"
                                        step="10"
                                        value={voltage}
                                        onChange={e => setVoltage(parseFloat(e.target.value))}
                                        style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                                    />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 800 }}>🌊 Corriente (I):</span>
                                        <strong style={{ color: 'white' }}>{current} A</strong>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="40"
                                        step="0.5"
                                        value={current}
                                        onChange={e => setCurrent(parseFloat(e.target.value))}
                                        style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Tarjeta de Sabiduría Histórica / Técnica Dinámica según el modo */}
                        {mode === 'horse' && (
                            <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '14px', padding: '12px 16px', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: '1.5' }}>
                                <strong style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    💡 El Origen del Caballo de Fuerza (1782):
                                </strong>
                                <div>
                                    Para convencer a los dueños de minas y cervecerías de comprar sus máquinas, James Watt midió el trabajo de un caballo de tiro en una cabria circular: calculó que un caballo podía levantar <strong>33,000 libras a 1 pie por minuto</strong>, definiendo el estándar universal de <strong>1 HP</strong>.
                                </div>
                            </div>
                        )}

                        {mode === 'rotative' && (
                            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '12px 16px', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: '1.5' }}>
                                <strong style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    💡 La Gran Innovación Rotativa de Watt (1788):
                                </strong>
                                <div>
                                    Al conectar el balancín a una <strong>biela y rueda volante</strong>, James Watt logró transformar el vaivén lineal en <strong>movimiento circular continuo</strong>, reemplazando a los tiros de caballos en telares y molinos, impulsando la Revolución Industrial.
                                </div>
                            </div>
                        )}

                        {mode === 'motor' && (
                            <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '14px', padding: '12px 16px', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: '1.5' }}>
                                <strong style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    💡 La Era Eléctrica: De HP a Vatios (P = V · I):
                                </strong>
                                <div>
                                    En homenaje a James Watt, la unidad internacional de potencia eléctrica se bautizó como el <strong>Vatio (Watt)</strong>. Un motor moderno convierte la energía eléctrica en mecánica con altísima eficiencia: <strong>1 HP = exactamente 745.7 Watts (P = V · I)</strong>.
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
}
