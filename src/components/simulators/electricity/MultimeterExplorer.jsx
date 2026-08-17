import { useState, useRef, useEffect } from 'react';
import { Sun, Info, Volume2, ShieldAlert, Sparkles } from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

// ── Modos del Multímetro con Ángulos y Lecturas ──────────────────────────────
export const MULTIMETER_MODES = {
    off: {
        angle: -120,
        label: 'OFF',
        unit: '',
        reading: ' ',
        type: 'Apagado',
        title: 'Posición OFF (Apagado)',
        desc: 'El multímetro está apagado. Siempre déjalo en esta posición al terminar para no agotar la batería interna de 9V.',
        activePorts: []
    },
    v_ac: {
        angle: -90,
        label: 'V~',
        unit: 'V~ (AC)',
        reading: '120.4',
        type: 'Voltaje AC',
        title: 'Voltaje en Corriente Alterna (V~)',
        desc: 'Mide la tensión en enchufes de pared, transformadores y generadores de corriente alterna (110V - 220V). No tiene polaridad fija.',
        activePorts: ['com', 'vohm']
    },
    v_dc: {
        angle: -60,
        label: 'V⎓',
        unit: 'V⎓ (DC)',
        reading: '12.00',
        type: 'Voltaje DC',
        title: 'Voltaje en Corriente Continua (V⎓)',
        desc: 'Mide la tensión en baterías, pilas, fuentes de alimentación y circuitos electrónicos. La punta roja va al positivo (+) y la negra al COM (−).',
        activePorts: ['com', 'vohm']
    },
    res: {
        angle: -30,
        label: 'Ω',
        unit: 'Ω / kΩ',
        reading: '470.0',
        type: 'Resistencia',
        title: 'Medición de Resistencia (Ω)',
        desc: '¡REGLA DE ORO! El circuito DEBE estar completamente desenergizado (sin corriente). De lo contrario, puedes quemar el multímetro.',
        activePorts: ['com', 'vohm']
    },
    continuity: {
        angle: 0,
        label: '·)))',
        unit: 'BUZZ',
        reading: '00.2',
        type: 'Continuidad',
        title: 'Prueba de Continuidad Sonora (BEEP)',
        desc: 'Emite un pitido audible cuando la resistencia entre las puntas es menor a 30Ω. Ideal para rastrear pistas rotas, fusibles quemados o cables cortados.',
        activePorts: ['com', 'vohm']
    },
    diode: {
        angle: 30,
        label: '⯈|',
        unit: 'V (Diodo)',
        reading: '0.654',
        type: 'Diodo',
        title: 'Prueba de Diodos y Semiconductores',
        desc: 'Inyecta un voltaje pequeño para medir la caída de tensión en la unión PN (silicio ≈ 0.6V - 0.7V, germanio ≈ 0.3V). Si marca "OL", el diodo está en polarización inversa.',
        activePorts: ['com', 'vohm']
    },
    capacitor: {
        angle: 60,
        label: '┫┣',
        unit: 'nF',
        reading: '100.0',
        type: 'Capacitancia',
        title: 'Capacitancia (Condensadores)',
        desc: 'Mide la capacidad de almacenamiento de un capacitor en Faradios (nF / µF). IMPORTANTE: Descarga siempre el condensador antes de medir.',
        activePorts: ['com', 'vohm']
    },
    ma_acdc: {
        angle: 90,
        label: 'mA',
        unit: 'mA',
        reading: '24.5',
        type: 'Miliamperios',
        title: 'Corriente Pequeña (mA / µA)',
        desc: 'Mide intensidades de corriente bajas en SERIE abriendo el circuito. Este puerto está protegido por un fusible interno rápido (ej. 200mA a 500mA).',
        activePorts: ['com', 'vohm']
    },
    a_acdc: {
        angle: 120,
        label: '10A',
        unit: 'A (10A MAX)',
        reading: '3.42',
        type: 'Alta Corriente',
        title: 'Corriente Alta (Puerto 10A)',
        desc: '¡PELIGRO! La punta roja DEBE pasarse al puerto 10A. Nunca medir voltaje con la punta en 10A porque provocarías un CORTOCIRCUITO DIRECTO.',
        activePorts: ['com', '10a']
    },
};

// ── Definición de Hotspots Fijos en el Chasis ────────────────────────────────
const CHASSIS_HOTSPOTS = [
    {
        id: 'screen',
        title: '1. Pantalla LCD Retroiluminada',
        short: 'Pantalla',
        desc: 'Muestra el valor numérico medido en 7 segmentos, la unidad correspondiente (V, A, Ω) y alertas como OL (sobrecarga) o polaridad negativa (−).',
        coords: { top: '18%', left: '78%' }
    },
    {
        id: 'hold',
        title: '2. Botón HOLD / Luz',
        short: 'HOLD / Luz',
        desc: 'Presiónalo para congelar la lectura en pantalla y activar la retroiluminación en condiciones de poca luz.',
        coords: { top: '28%', left: '88%' }
    },
    {
        id: 'dial',
        title: '3. Perilla Selectora Giratoria',
        short: 'Perilla',
        desc: 'Gira la perilla para encender el instrumento y seleccionar la magnitud física exacta a medir.',
        coords: { top: '61%', left: '50%' }
    },
    {
        id: 'com',
        title: '4. Puerto COM (Común / Tierra)',
        short: 'Puerto COM',
        desc: 'Siempre se conecta aquí la punta de prueba NEGRA. Es la referencia cero o tierra para todas las mediciones.',
        coords: { top: '92%', left: '23%' }
    },
    {
        id: 'vohm',
        title: '5. Puerto V/Ω/mA (Voltios / Ohmios)',
        short: 'Puerto VΩmA',
        desc: 'Se conecta la punta de prueba ROJA para medir Voltaje, Resistencia, Diodos, Continuidad y pequeñas corrientes.',
        coords: { top: '92%', left: '50%' }
    },
    {
        id: '10a',
        title: '6. Puerto 10A (Alta Corriente)',
        short: 'Puerto 10A',
        desc: 'Puerto especial para conectar la punta ROJA al medir corrientes elevadas de hasta 10 Amperios.',
        coords: { top: '92%', left: '77%' }
    },
];

// ── Display Digital de 7 Segmentos Renderizado en Canvas ─────────────────────
function SevenSegmentDisplay({ value, isBacklit, isOff }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (isOff) {
            return;
        }

        const color = isBacklit ? '#0f172a' : '#1e293b';
        const ghostColor = isBacklit ? 'rgba(15, 23, 42, 0.08)' : 'rgba(0, 0, 0, 0.07)';

        const DIGITS = {
            '0': [1, 1, 1, 1, 1, 1, 0],
            '1': [0, 1, 1, 0, 0, 0, 0],
            '2': [1, 1, 0, 1, 1, 0, 1],
            '3': [1, 1, 1, 1, 0, 0, 1],
            '4': [0, 1, 1, 0, 0, 1, 1],
            '5': [1, 0, 1, 1, 0, 1, 1],
            '6': [1, 0, 1, 1, 1, 1, 1],
            '7': [1, 1, 1, 0, 0, 0, 0],
            '8': [1, 1, 1, 1, 1, 1, 1],
            '9': [1, 1, 1, 1, 0, 1, 1],
            'O': [1, 1, 1, 1, 1, 1, 0],
            'L': [0, 0, 0, 1, 1, 1, 0],
            '-': [0, 0, 0, 0, 0, 0, 1],
            ' ': [0, 0, 0, 0, 0, 0, 0],
        };

        const str = value.padStart(4, ' ');
        const digitW = 28;
        const digitH = 44;
        const thick = 4.5;
        const gap = 12;
        let startX = canvas.width - (str.length * (digitW + gap));

        const drawSegment = (x, y, w, h) => {
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, thick / 2);
            ctx.fill();
        };

        const drawChar = (ox, oy, char) => {
            const segs = [
                { x: ox + thick, y: oy, w: digitW - 2 * thick, h: thick }, // A (top)
                { x: ox + digitW - thick, y: oy + thick / 2, w: thick, h: digitH / 2 - thick }, // B (top right)
                { x: ox + digitW - thick, y: oy + digitH / 2, w: thick, h: digitH / 2 - thick }, // C (bottom right)
                { x: ox + thick, y: oy + digitH - thick, w: digitW - 2 * thick, h: thick }, // D (bottom)
                { x: ox, y: oy + digitH / 2, w: thick, h: digitH / 2 - thick }, // E (bottom left)
                { x: ox, y: oy + thick / 2, w: thick, h: digitH / 2 - thick }, // F (top left)
                { x: ox + thick, y: oy + digitH / 2 - thick / 2, w: digitW - 2 * thick, h: thick }, // G (middle)
            ];

            // Dibuja ghost (fondo apagado)
            ctx.fillStyle = ghostColor;
            segs.forEach(s => drawSegment(s.x, s.y, s.w, s.h));

            // Dibuja encendido
            const pattern = DIGITS[char.toUpperCase()] || DIGITS[' '];
            ctx.fillStyle = color;
            pattern.forEach((on, idx) => {
                if (on) {
                    const s = segs[idx];
                    drawSegment(s.x, s.y, s.w, s.h);
                }
            });
        };

        let currX = startX;
        for (let i = 0; i < str.length; i++) {
            const ch = str[i];
            if (ch === '.') {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(currX - 4, digitH + 2, thick / 1.5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                drawChar(currX, 4, ch);
                currX += digitW + gap;
            }
        }
    }, [value, isBacklit, isOff]);

    return (
        <canvas
            ref={canvasRef}
            width={180}
            height={52}
            style={{ width: '100%', maxWidth: '180px', height: '52px', display: 'block' }}
        />
    );
}

// ── Componente Principal MultimeterExplorer ──────────────────────────────────
export default function MultimeterExplorer() {
    const [modeKey, setModeKey] = useState('v_dc');
    const [isBacklit, setIsBacklit] = useState(false);
    const [activeHotspot, setActiveHotspot] = useState(null);
    const [showHotspots, setShowHotspots] = useState(true);

    const activeMode = MULTIMETER_MODES[modeKey] || MULTIMETER_MODES.off;
    const isOff = modeKey === 'off';

    const currentHotspotInfo = CHASSIS_HOTSPOTS.find(h => h.id === activeHotspot);

    return (
        <div className="sim-card">
            {/* Cabecera del Componente */}
            <div className="sim-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h3>🔧 Multímetro Digital Pro (Instrumentación Eléctrica)</h3>
                    <p>Haz clic en los puntos interactivos o gira la perilla para explorar mediciones de Voltaje, Resistencia y Corriente</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="sim-btn sim-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700 }}
                        onClick={() => setShowHotspots(prev => !prev)}
                    >
                        {showHotspots ? '👁️ Ocultar Puntos ?' : '❓ Mostrar Puntos ?'}
                    </button>
                </div>
            </div>

            <div className="sim-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '2rem', alignItems: 'start' }}>

                    {/* ── CUERPO DEL MULTÍMETRO Y PUNTAS DE PRUEBA ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>

                        {/* Chasis de Goma Protectora Exterior (Holster Amarillo/Naranja de Alta Resistencia) */}
                        <div style={{
                            width: '320px',
                            background: 'linear-gradient(145deg, #f59e0b 0%, #d97706 100%)',
                            borderRadius: '36px',
                            padding: '16px 14px 22px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.4)',
                            border: '2px solid #b45309',
                            position: 'relative',
                            userSelect: 'none'
                        }}>

                            {/* Carcasa Frontal Gris Oscura Rugosa */}
                            <div style={{
                                background: '#1e293b',
                                borderRadius: '24px',
                                padding: '16px 14px',
                                border: '2px solid #334155',
                                boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.5)'
                            }}>

                                {/* Marca y Modelo */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
                                    <span style={{ color: '#f8fafc', fontWeight: 900, fontSize: '0.85rem', letterSpacing: '1px' }}>
                                        SABERLAB <span style={{ color: '#fbbf24', fontSize: '0.75rem' }}>PRO-890</span>
                                    </span>
                                    <span style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                                        CAT III 600V
                                    </span>
                                </div>

                                {/* ── PANTALLA LCD ── */}
                                <div style={{
                                    background: isOff ? '#334155' : isBacklit ? '#7dd3fc' : '#94a3b8',
                                    borderRadius: '12px',
                                    padding: '8px 12px',
                                    border: '3px solid #0f172a',
                                    boxShadow: isBacklit ? '0 0 18px rgba(56,189,248,0.5), inset 0 2px 6px rgba(0,0,0,0.3)' : 'inset 0 3px 8px rgba(0,0,0,0.35)',
                                    transition: 'all 0.3s ease',
                                    minHeight: '88px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    {/* Cabecera de la Pantalla */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontWeight: 900, color: isBacklit ? '#0369a1' : '#1e293b' }}>
                                        <span>{isOff ? '' : activeMode.type}</span>
                                        <span>{isOff ? '' : activeMode.unit}</span>
                                    </div>

                                    {/* Lectura Digital */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', height: '52px' }}>
                                        <SevenSegmentDisplay
                                            value={activeMode.reading}
                                            isBacklit={isBacklit}
                                            isOff={isOff}
                                        />
                                    </div>
                                </div>

                                {/* Botón HOLD / Backlight */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', paddingRight: '4px' }}>
                                    <button
                                        onClick={() => setIsBacklit(prev => !prev)}
                                        style={{
                                            background: isBacklit ? '#0284c7' : '#334155',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '4px 10px',
                                            fontSize: '0.72rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span>HOLD</span>
                                        <Sun size={12} />
                                    </button>
                                </div>

                                {/* ── PERILLA SELECTORA GIRATORIA REALISTA ── */}
                                <div style={{ position: 'relative', width: '220px', height: '220px', margin: '10px auto 14px' }}>
                                    {/* Anillo de fondo con posiciones radiales */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        borderRadius: '50%',
                                        background: '#0f172a',
                                        border: '3px solid #334155',
                                        boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.6)'
                                    }}>
                                        {/* Opciones alrededor del Dial */}
                                        {Object.entries(MULTIMETER_MODES).map(([key, config]) => {
                                            const isSelected = modeKey === key;
                                            const rad = (config.angle * Math.PI) / 180;
                                            // Centro = (110, 110), Radio = 88px
                                            const posX = 110 + 84 * Math.sin(rad);
                                            const posY = 110 - 84 * Math.cos(rad);

                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => setModeKey(key)}
                                                    style={{
                                                        position: 'absolute',
                                                        left: `${posX}px`,
                                                        top: `${posY}px`,
                                                        transform: 'translate(-50%, -50%)',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: isSelected ? '#38bdf8' : '#94a3b8',
                                                        fontSize: isSelected ? '0.85rem' : '0.72rem',
                                                        fontWeight: isSelected ? 900 : 700,
                                                        cursor: 'pointer',
                                                        padding: '2px 4px',
                                                        borderRadius: '4px',
                                                        transition: 'all 0.2s',
                                                        textShadow: isSelected ? '0 0 8px #38bdf8' : 'none'
                                                    }}
                                                    title={`Girar a ${config.title}`}
                                                >
                                                    {config.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Perilla Central Giratoria */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            width: '108px',
                                            height: '108px',
                                            left: '56px',
                                            top: '56px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                                            border: '3px solid #475569',
                                            boxShadow: '0 6px 14px rgba(0,0,0,0.6)',
                                            transform: `rotate(${activeMode.angle}deg)`,
                                            transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'flex-start',
                                            paddingTop: '6px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => {
                                            const keys = Object.keys(MULTIMETER_MODES);
                                            const nextIdx = (keys.indexOf(modeKey) + 1) % keys.length;
                                            setModeKey(keys[nextIdx]);
                                        }}
                                        title="Haz clic para girar la perilla al siguiente modo"
                                    >
                                        {/* Puntero / Muesca de la Perilla */}
                                        <div style={{ width: '6px', height: '24px', background: '#38bdf8', borderRadius: '3px', boxShadow: '0 0 8px #38bdf8' }} />
                                    </div>
                                </div>

                                {/* ── PUERTOS BANANA JACK INFERIORES ── */}
                                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '14px', padding: '0 8px' }}>

                                    {/* Puerto COM */}
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '50%',
                                            background: '#0f172a',
                                            border: '4px solid #334155',
                                            margin: '0 auto 4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: activeMode.activePorts.includes('com') ? '0 0 14px #38bdf8' : 'inset 0 3px 6px rgba(0,0,0,0.8)',
                                            borderColor: activeMode.activePorts.includes('com') ? '#38bdf8' : '#334155'
                                        }}>
                                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#020617' }} />
                                        </div>
                                        <span style={{ color: '#f8fafc', fontSize: '0.72rem', fontWeight: 800 }}>COM</span>
                                    </div>

                                    {/* Puerto V/Ω/mA */}
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '50%',
                                            background: '#991b1b',
                                            border: '4px solid #b91c1c',
                                            margin: '0 auto 4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: activeMode.activePorts.includes('vohm') ? '0 0 14px #ef4444' : 'inset 0 3px 6px rgba(0,0,0,0.8)',
                                            borderColor: activeMode.activePorts.includes('vohm') ? '#f87171' : '#b91c1c'
                                        }}>
                                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#450a0a' }} />
                                        </div>
                                        <span style={{ color: '#f87171', fontSize: '0.72rem', fontWeight: 800 }}>VΩmA</span>
                                    </div>

                                    {/* Puerto 10A */}
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '50%',
                                            background: '#991b1b',
                                            border: '4px solid #b91c1c',
                                            margin: '0 auto 4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: activeMode.activePorts.includes('10a') ? '0 0 14px #ef4444' : 'inset 0 3px 6px rgba(0,0,0,0.8)',
                                            borderColor: activeMode.activePorts.includes('10a') ? '#f87171' : '#b91c1c'
                                        }}>
                                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#450a0a' }} />
                                        </div>
                                        <span style={{ color: '#f87171', fontSize: '0.72rem', fontWeight: 800 }}>10A</span>
                                    </div>

                                </div>

                            </div>

                            {/* ── HOTSPOTS FLOTANTES FIJOS Y ALINEADOS CON EXACTITUD ── */}
                            {showHotspots && CHASSIS_HOTSPOTS.map(spot => {
                                const isSelected = activeHotspot === spot.id;
                                return (
                                    <button
                                        key={spot.id}
                                        onClick={() => setActiveHotspot(isSelected ? null : spot.id)}
                                        style={{
                                            position: 'absolute',
                                            top: spot.coords.top,
                                            left: spot.coords.left,
                                            transform: 'translate(-50%, -50%)',
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            background: isSelected ? '#a855f7' : '#3b82f6',
                                            color: 'white',
                                            border: '2px solid white',
                                            fontWeight: 900,
                                            fontSize: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 0 12px rgba(59,130,246,0.8)',
                                            zIndex: 20,
                                            transition: 'transform 0.2s',
                                            animation: 'pulse 2s infinite'
                                        }}
                                        title={spot.title}
                                    >
                                        ?
                                    </button>
                                );
                            })}

                        </div>
                    </div>

                    {/* ── PANEL LATERAL DE CONTROL, EXPLICACIÓN Y REGLAS DE SEGURIDAD ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Tarjeta del Modo Activo */}
                        <div style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '16px', padding: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ color: '#38bdf8', fontWeight: 900, fontSize: '1.05rem' }}>
                                    {activeMode.title}
                                </span>
                                <span style={{ background: 'rgba(56,189,248,0.15)', color: '#7dd3fc', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                                    {activeMode.unit}
                                </span>
                            </div>
                            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.6', margin: '0 0 10px' }}>
                                {activeMode.desc}
                            </p>

                            {/* Guía de Conexión de Puntas */}
                            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1.2rem' }}>🔌</span>
                                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                                    <strong style={{ color: 'white' }}>Conexión correcta: </strong>
                                    Punta <span style={{ color: '#cbd5e1', fontWeight: 800 }}>Negra en COM</span> + Punta <span style={{ color: '#f87171', fontWeight: 800 }}>Roja en {activeMode.activePorts.includes('10a') ? '10A' : 'VΩmA'}</span>.
                                </div>
                            </div>
                        </div>

                        {/* Tarjeta de Información del Hotspot (si se selecciona) */}
                        {currentHotspotInfo && (
                            <div style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid #a855f7', borderRadius: '16px', padding: '1.25rem' }}>
                                <div style={{ color: '#c084fc', fontWeight: 900, fontSize: '0.95rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Info size={16} /> {currentHotspotInfo.title}
                                </div>
                                <p style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                                    {currentHotspotInfo.desc}
                                </p>
                            </div>
                        )}

                        {/* Advertencias y Buenas Prácticas */}
                        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '14px', padding: '1rem' }}>
                            <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <ShieldAlert size={16} /> Reglas Críticas de Seguridad
                            </div>
                            <ul style={{ color: '#cbd5e1', fontSize: '0.8rem', margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                                <li><strong>Medir Voltaje:</strong> En PARALELO a la carga o fuente.</li>
                                <li><strong>Medir Corriente:</strong> En SERIE (abriendo el circuito).</li>
                                <li><strong>Medir Resistencia / Continuidad:</strong> NUNCA con energía conectada.</li>
                            </ul>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
