import { useState, useMemo } from 'react';
import {
    FlaskConical,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Zap,
    ShieldAlert,
    ShieldCheck,
    Compass,
    Sparkles,
    Puzzle,
    HelpCircle,
    Trophy,
    Check,
    ArrowRight
} from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

// ── TÉRMINOS PARA EL JUEGO DE EMPAREJAR ──
const MATCHING_PAIRS = [
    {
        id: 'voltaje',
        term: '⚡ Voltaje (V)',
        short: 'Tensión / Presión',
        color: '#a855f7',
        definition: 'Diferencia de potencial eléctrico o "presión" que empuja y obliga a los electrones a circular por el circuito. Se mide en Voltios [V].'
    },
    {
        id: 'corriente',
        term: '🌊 Corriente (I)',
        short: 'Flujo / Caudal',
        color: '#38bdf8',
        definition: 'Cantidad de electrones que atraviesan la sección de un cable cada segundo (1 Amperio = 6.242 × 10¹⁸ electrones/segundo). Se mide en Amperios [A].'
    },
    {
        id: 'resistencia',
        term: '🛑 Resistencia (R)',
        short: 'Oposición / Freno',
        color: '#f59e0b',
        definition: 'Dificultad u oposición física que ofrece un material al libre paso de los electrones. Se mide en Ohmios [Ω].'
    },
    {
        id: 'valencia',
        term: '🔬 Electrón de Valencia',
        short: 'Capa exterior',
        color: '#34d399',
        definition: 'Electrón ubicado en la última órbita del átomo; en metales como el Cobre está débilmente ligado y se libera para formar la corriente.'
    },
    {
        id: 'elektron',
        term: '🏛️ Elektron (ήλεκτρον)',
        short: 'Origen histórico',
        color: '#ec4899',
        definition: 'Vocablo griego que significa "Ámbar"; Tales de Mileto (600 a.C.) descubrió la electrostática al frotar resina fósil de ámbar con piel.'
    },
    {
        id: 'dielectrico',
        term: '🛡️ Aislante (Dieléctrico)',
        short: 'Bloqueador',
        color: '#94a3b8',
        definition: 'Material con su capa de valencia completa (8 electrones / octeto) fuertemente retenidos que impide el paso de la corriente eléctrica.'
    }
];

export default function PracticalLabL1() {
    const [activeTab, setActiveTab] = useState('materials'); // 'materials' | 'matching' | 'franklin' | 'safety'

    // ── RETO 1: MATERIALES & CONDUCTIVIDAD ──
    const materials = [
        { id: 'copper', name: 'Moneda de Cobre', type: 'conductor', icon: '🪙', desc: '1 electrón de valencia libre.' },
        { id: 'clip', name: 'Clip de Acero', type: 'conductor', icon: '📎', desc: 'Estructura metálica conductora.' },
        { id: 'rubber', name: 'Goma de Borrar', type: 'insulator', icon: '🧼', desc: 'Polímero con electrones retenidos.' },
        { id: 'glass', name: 'Varilla de Vidrio', type: 'insulator', icon: '🧪', desc: 'Dieléctrico de alta resistencia.' },
        { id: 'pure_water', name: 'Agua Destilada Pura', type: 'insulator', icon: '💧', desc: 'Sin iones libres disueltos.' },
        { id: 'salt_water', name: 'Agua con Sal (Electrolito)', type: 'conductor', icon: '🧂', desc: 'Iones Na+ y Cl- en disolución.' },
    ];
    const [selectedMaterial, setSelectedMaterial] = useState(materials[0]);

    // Mini-clasificador de materiales
    const [sorterAnswers, setSorterAnswers] = useState({});
    const [sorterIdx, setSorterIdx] = useState(0);
    const sorterList = [
        { id: 'cu', name: 'Hilo de Cobre', type: 'conductor', emoji: '🧶', hint: '1 electrón libre en su capa de valencia.' },
        { id: 'glass', name: 'Vaso de Vidrio', type: 'insulator', emoji: '🥛', hint: 'Enlaces covalentes muy fuertes.' },
        { id: 'graphite', name: 'Mina de Grafito', type: 'conductor', emoji: '✏️', hint: 'Carbono con electrones deslocalizados.' },
        { id: 'rubber', name: 'Guante de Goma', type: 'insulator', emoji: '🧤', hint: 'Protección dieléctrica personal.' },
        { id: 'aluminum', name: 'Papel Aluminio', type: 'conductor', emoji: '🥫', hint: 'Metal ligero de 3 electrones de valencia.' },
        { id: 'ceramic', name: 'Porcelana', type: 'insulator', emoji: '🏺', hint: 'Material cerámico usado en torres de alta tensión.' },
    ];
    const currentSorterItem = sorterList[sorterIdx];
    const sorterScore = Object.entries(sorterAnswers).filter(
        ([id, ans]) => sorterList.find(m => m.id === id)?.type === ans
    ).length;

    const handleSorterAnswer = (choice) => {
        if (!currentSorterItem) return;
        setSorterAnswers(prev => ({ ...prev, [currentSorterItem.id]: choice }));
        if (sorterIdx < sorterList.length - 1) {
            setSorterIdx(prev => prev + 1);
        }
    };

    const resetSorter = () => {
        setSorterAnswers({});
        setSorterIdx(0);
    };

    // ── RETO 2: EMPAREJAR TÉRMINO CON SIGNIFICADO ──
    const [selectedTerm, setSelectedTerm] = useState(null); // id
    const [selectedDef, setSelectedDef] = useState(null);   // id
    const [matchedPairs, setMatchedPairs] = useState(new Set()); // Set of ids
    const [wrongPair, setWrongPair] = useState(null); // { termId, defId }
    const [matchAttempts, setMatchAttempts] = useState(0);
    const [matchShuffleKey, setMatchShuffleKey] = useState(0);

    // Definiciones desordenadas
    const shuffledDefinitions = useMemo(() => {
        const list = [...MATCHING_PAIRS];
        // Permutación fija/pseudorandom para que no cambie en cada re-render
        const permutation = [2, 0, 4, 1, 5, 3];
        const result = [];
        for (let i = 0; i < list.length; i++) {
            const idx = (permutation[i] + matchShuffleKey) % list.length;
            result.push(list[idx]);
        }
        return result;
    }, [matchShuffleKey]);

    const handleSelectTerm = (id) => {
        if (matchedPairs.has(id)) return;
        setWrongPair(null);
        if (selectedDef) {
            setMatchAttempts(prev => prev + 1);
            if (selectedDef === id) {
                setMatchedPairs(prev => new Set([...prev, id]));
                setSelectedTerm(null);
                setSelectedDef(null);
            } else {
                setWrongPair({ termId: id, defId: selectedDef });
                setTimeout(() => {
                    setWrongPair(null);
                    setSelectedTerm(null);
                    setSelectedDef(null);
                }, 1000);
            }
        } else {
            setSelectedTerm(id);
        }
    };

    const handleSelectDef = (id) => {
        if (matchedPairs.has(id)) return;
        setWrongPair(null);
        if (selectedTerm) {
            setMatchAttempts(prev => prev + 1);
            if (selectedTerm === id) {
                setMatchedPairs(prev => new Set([...prev, id]));
                setSelectedTerm(null);
                setSelectedDef(null);
            } else {
                setWrongPair({ termId: selectedTerm, defId: id });
                setTimeout(() => {
                    setWrongPair(null);
                    setSelectedTerm(null);
                    setSelectedDef(null);
                }, 1000);
            }
        } else {
            setSelectedDef(id);
        }
    };

    const resetMatching = () => {
        setMatchedPairs(new Set());
        setSelectedTerm(null);
        setSelectedDef(null);
        setWrongPair(null);
        setMatchAttempts(0);
        setMatchShuffleKey(prev => prev + 1);
    };

    // ── RETO 3: EL DESAFÍO DE FRANKLIN (REAL VS CONVENCIONAL) ──
    const [franklinGuess, setFranklinGuess] = useState(null); // 'real' | 'conventional'

    // ── RETO 4: SIMULADOR DE RIESGO & SEGURIDAD HUMANA (IEC 60479) ──
    const [voltageSource, setVoltageSource] = useState(120); // 9, 12, 120, 230, 50000
    const [skinCondition, setSkinCondition] = useState('dry'); // 'dry' | 'damp' | 'barefoot'

    const isAC = voltageSource === 120 || voltageSource === 230;
    const isTaser = voltageSource === 50000;
    const activeSignalType = isTaser ? 'taser' : isAC ? 'ac' : 'dc';

    // Impedancia Corporal Real según IEC 60479-1 (Piel + Calzado + Contacto a Tierra):
    const getEffectiveResistance = (v, condition) => {
        if (v <= 24) {
            // Muy bajo voltaje (9V - 12V)
            if (condition === 'dry') return 100000;
            if (condition === 'damp') return 10000;
            return 1000;
        }
        if (v === 120) {
            // 110V / 120V AC (Tomacorriente Residencial)
            if (condition === 'dry') return 50000; // Piel seca + calzado aislante -> ~2.4 mA
            if (condition === 'damp') return 10000; // Piel húmeda / sudor -> 12 mA
            return 1000; // Pies descalzos en suelo húmedo -> 120 mA (Letal)
        }
        if (v === 230) {
            // 220V / 230V AC (Toma Industrial)
            if (condition === 'dry') return 25000; // Seca + calzado -> 9.2 mA
            if (condition === 'damp') return 5000; // Húmeda -> 46 mA
            return 1000; // Descalzo / mojado -> 230 mA (Letal Inmediato)
        }
        // Taser (50kV limitado internamente a 2.5 mA)
        return condition === 'dry' ? 50000 : condition === 'damp' ? 10000 : 1000;
    };

    const skinResistance = getEffectiveResistance(voltageSource, skinCondition);
    let currentMa = (voltageSource / skinResistance) * 1000;
    if (isTaser) {
        currentMa = 2.5; // limitado por diseño a pulsos
    }

    const getSafetyStatus = (ma, v, signalType) => {
        if (v === 50000) {
            return {
                level: 'warn',
                range: '2.5 mA (Pulsos)',
                label: '⚡ Choque Doloroso No Letal (Taser - 2.5 mA en Pulsos)',
                desc: '50.000V pero corriente limitada por diseño a 2.5 mA en pulsos breves. Provoca dolor y espasmo neuromuscular transitorio sin llegar a fibrilación ni daño orgánico permanente.',
                color: '#fbbf24',
                risk: 'No Letal'
            };
        }

        if (signalType === 'ac') {
            // Normativa IEC 60479-1 (Corriente Alterna 50/60 Hz)
            if (ma < 1) {
                return {
                    level: 'safe',
                    range: '< 1 mA',
                    label: '🛡️ Imperceptible / Seguro (< 1 mA AC)',
                    desc: 'Corriente menor a 1 mA en AC. El sistema nervioso apenas la percibe y no genera ningún efecto fisiológico adverso.',
                    color: '#34d399',
                    risk: 'Inofensivo'
                };
            }
            if (ma < 10) {
                return {
                    level: 'mild',
                    range: '1 a 10 mA',
                    label: '🟡 Sensación de Hormigueo o Cosquilleo Leve (1-10 mA AC)',
                    desc: 'Sensación de hormigueo o cosquilleo leve; generalmente inofensivo.',
                    color: '#38bdf8',
                    risk: 'Inofensivo'
                };
            }
            if (ma < 25) {
                return {
                    level: 'warn',
                    range: '10 a 25 mA',
                    label: '🟠 Espasmos Musculares y Pérdida Motriz (10-25 mA AC)',
                    desc: 'Comienzan los espasmos musculares y la pérdida de control ("no poder soltar" la fuente de energía).',
                    color: '#fbbf24',
                    risk: 'Moderado'
                };
            }
            if (ma < 50) {
                return {
                    level: 'danger',
                    range: '25 a 50 mA',
                    label: '🟠 Contracciones Violentas y Fatiga (25-50 mA AC)',
                    desc: 'Contracciones musculares violentas, problemas respiratorios severos y fatiga intensa.',
                    color: '#fb923c',
                    risk: 'Peligro Alto'
                };
            }
            if (ma < 100) {
                return {
                    level: 'danger',
                    range: '50 a 100 mA',
                    label: '🚨 Fibrilación Ventricular (50-100 mA AC - PELIGRO MORTAL)',
                    desc: 'Puede provocar fibrilación ventricular en el corazón (latido anárquico e inútil para bombear sangre), potencialmente mortal.',
                    color: '#ef4444',
                    risk: 'Grave / Mortal'
                };
            }
            if (ma < 300) {
                return {
                    level: 'extreme',
                    range: '100 a 300 mA',
                    label: '🚨 Fibrilación Asegurada y Daño Muscular (100-300 mA AC)',
                    desc: 'Fibrilación ventricular asegurada, daño muscular grave y posible fractura de huesos por contracciones extremas.',
                    color: '#dc2626',
                    risk: 'Crítico / Fatal'
                };
            }
            if (ma < 1000) {
                return {
                    level: 'extreme',
                    range: '300 a 1000 mA',
                    label: '☠️ Paro Cardíaco y Quemaduras Graves (300-1000 mA AC)',
                    desc: 'Paro cardíaco completo, quemaduras internas graves y destrucción profunda de tejidos.',
                    color: '#b91c1c',
                    risk: 'Letal'
                };
            }
            return {
                level: 'extreme',
                range: 'Más de 1000 mA (1 A)',
                label: '☠️ Paro Cardíaco Inmediato (> 1000 mA / 1A AC)',
                desc: 'Causa paros cardíacos inmediatos, quemaduras internas severas y destrucción masiva de tejidos.',
                color: '#991b1b',
                risk: 'Letal Inmediato'
            };
        } else {
            // Normativa IEC 60479-2 (Corriente Continua DC)
            if (ma < 2) {
                return {
                    level: 'safe',
                    range: '< 2 mA',
                    label: '🛡️ Imperceptible / Seguro (< 2 mA DC)',
                    desc: 'Corriente menor a 2 mA en DC. Flujo continuo sin efecto térmico ni bioeléctrico perceptible.',
                    color: '#34d399',
                    risk: 'Inofensivo'
                };
            }
            if (ma < 50) {
                return {
                    level: 'mild',
                    range: '2 a 10 mA',
                    label: '🟡 Hormigueo o Calor Localizado (2-10 mA DC)',
                    desc: 'Ligero hormigueo o sensación de calor localizado en el punto de contacto.',
                    color: '#38bdf8',
                    risk: 'Inofensivo'
                };
            }
            if (ma < 300) {
                return {
                    level: 'warn',
                    range: '50 a 80 mA',
                    label: '🟠 Umbral de "No Soltar" en DC (50-80 mA DC)',
                    desc: 'Umbral de "no soltar" (inicio de espasmos musculares severos sostenidos).',
                    color: '#fb923c',
                    risk: 'Moderado / Peligro'
                };
            }
            if (ma < 500) {
                return {
                    level: 'danger',
                    range: '300 a 500 mA',
                    label: '🚨 Paro Respiratorio y Quemaduras Electrolíticas (300-500 mA DC)',
                    desc: 'Riesgo de paro respiratorio y quemaduras internas graves por efecto térmico y electrolítico.',
                    color: '#ef4444',
                    risk: 'Grave'
                };
            }
            if (ma <= 3000) {
                return {
                    level: 'extreme',
                    range: '500 a 3000 mA (0.5 a 3 A)',
                    label: '☠️ Fibrilación Ventricular Severa en DC (500-3000 mA DC)',
                    desc: 'Fibrilación ventricular severa y daños letales debido a las altas intensidades sostenidas en DC.',
                    color: '#dc2626',
                    risk: 'Crítico / Fatal'
                };
            }
            return {
                level: 'extreme',
                range: 'Más de 3000 mA (3 A)',
                label: '☠️ Paro Cardíaco y Quemaduras Catastróficas (> 3000 mA / 3A DC)',
                desc: 'Paro cardíaco fatal, quemaduras catastróficas y destrucción profunda de los tejidos corporales.',
                color: '#991b1b',
                risk: 'Letal Inmediato'
            };
        }
    };

    const safetyStatus = getSafetyStatus(currentMa, voltageSource, activeSignalType);

    // Geometría del juego de emparejar
    const ROW_HEIGHT = 88;
    const ROW_GAP = 12;
    const TOTAL_ROWS_HEIGHT = 6 * ROW_HEIGHT + 5 * ROW_GAP; // 588px
    const SVG_WIDTH = 100;

    return (
        <div className="sim-card practical-lab-root dark-lab-box" style={{ width: '100%', margin: '0', background: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.3)', color: '#f8fafc' }}>
            {/* Header del Laboratorio */}
            <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(168,85,247,0.1) 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem 2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.4rem' }}>
                    <div style={{ background: '#f59e0b', borderRadius: '12px', padding: '8px', display: 'flex', color: '#1e1b4b' }}>
                        <FlaskConical size={22} />
                    </div>
                    <div>
                        <h3 style={{ color: 'white', margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                            Taller de Práctica Experimental - Lección 1
                        </h3>
                        <p style={{ color: '#94a3b8', margin: '2px 0 0', fontSize: '0.88rem' }}>
                            Experimenta, clasifica materiales, une conceptos y analiza riesgos eléctricos en tiempo real
                        </p>
                    </div>
                </div>

                {/* Sub-pestañas del Laboratorio */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '1.25rem' }}>
                    <button
                        onClick={() => setActiveTab('materials')}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === 'materials' ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                            color: activeTab === 'materials' ? '#0f172a' : '#cbd5e1',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === 'materials' ? '0 4px 15px rgba(245,158,11,0.3)' : 'none'
                        }}
                    >
                        <span>🪙</span> <span>1. Banco de Materiales</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('matching')}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === 'matching' ? '#ec4899' : 'rgba(255,255,255,0.06)',
                            color: activeTab === 'matching' ? '#ffffff' : '#cbd5e1',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === 'matching' ? '0 4px 15px rgba(236,72,153,0.3)' : 'none'
                        }}
                    >
                        <span>🧩</span> <span>2. Unir Conceptos ({matchedPairs.size}/6)</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('franklin')}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === 'franklin' ? '#38bdf8' : 'rgba(255,255,255,0.06)',
                            color: activeTab === 'franklin' ? '#0f172a' : '#cbd5e1',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === 'franklin' ? '0 4px 15px rgba(56,189,248,0.3)' : 'none'
                        }}
                    >
                        <span>🔄</span> <span>3. Reto de Franklin</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('safety')}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === 'safety' ? '#ef4444' : 'rgba(255,255,255,0.06)',
                            color: 'white',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === 'safety' ? '0 4px 15px rgba(239,68,68,0.3)' : 'none'
                        }}
                    >
                        <span>⚠️</span> <span>4. Riesgo Humano</span>
                    </button>
                </div>
            </div>

            {/* Contenido de la actividad seleccionada */}
            <div style={{ padding: '2rem 2.5rem' }}>
                {/* ───────────────────────────────────────────────────────── */}
                {/* ACTIVIDAD 1: BANCO DE PRUEBAS DE MATERIALES & CLASIFICADOR */}
                {/* ───────────────────────────────────────────────────────── */}
                {activeTab === 'materials' && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <h4 style={{ color: '#fbbf24', fontSize: '1.25rem', margin: '0 0 0.4rem', fontWeight: 800 }}>
                                🪙 Banco de Pruebas: Conductores vs. Aislantes
                            </h4>
                            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
                                Inserta diferentes objetos entre las dos pinzas cocodrilo del circuito y observa la bombilla:
                            </p>
                        </div>

                        {/* Circuito Visual con Bombilla y Pinzas */}
                        <div style={{
                            background: 'rgba(15, 23, 42, 0.75)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '20px',
                            padding: '1.75rem',
                            marginBottom: '1.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative'
                        }}>
                            <svg width="100%" height="160" viewBox="0 0 500 150" style={{ maxWidth: '560px' }}>
                                {/* Cables de Conexión */}
                                <path d="M 175 75 L 60 75 L 60 125 L 440 125 L 440 75 L 325 75" fill="none" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
                                
                                {selectedMaterial.type === 'conductor' && (
                                    <path d="M 175 75 L 60 75 L 60 125 L 440 125 L 440 75 L 325 75" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6,6" className="animated-wire-dc" opacity="0.9" />
                                )}

                                {/* Batería abajo */}
                                <rect x="220" y="110" width="60" height="30" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                                <rect x="278" y="120" width="8" height="10" rx="2" fill="#ef4444" />
                                <text x="235" y="130" fill="#94a3b8" fontSize="11" fontWeight="bold">9V DC</text>

                                {/* Pinzas Cocodrilo */}
                                <path d="M 175 68 L 210 75 L 175 82 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1.5" />
                                <path d="M 325 68 L 290 75 L 325 82 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1.5" />

                                {/* Espacio Compacto para el Material de Prueba (Solo Icono sin texto redundante) */}
                                <rect x="210" y="45" width="80" height="60" rx="12" fill={selectedMaterial.type === 'conductor' ? 'rgba(56,189,248,0.15)' : 'rgba(239,68,68,0.15)'} stroke={selectedMaterial.type === 'conductor' ? '#38bdf8' : '#f87171'} strokeWidth="2" strokeDasharray={selectedMaterial.type === 'conductor' ? 'none' : '4,4'} />
                                <text x="250" y="83" textAnchor="middle" fontSize="28">{selectedMaterial.icon}</text>

                                {/* Bombilla perfectamente integrada en el tramo izquierdo */}
                                <circle cx="115" cy="75" r="22" fill={selectedMaterial.type === 'conductor' ? '#fbbf24' : '#1e293b'} stroke={selectedMaterial.type === 'conductor' ? '#f59e0b' : '#475569'} strokeWidth="2.5" style={{ filter: selectedMaterial.type === 'conductor' ? 'drop-shadow(0 0 20px rgba(245,158,11,1))' : 'none', transition: 'all 0.3s' }} />
                                <text x="115" y="82" textAnchor="middle" fontSize="19">💡</text>
                            </svg>

                            {/* Resultado del Banco de Prueba */}
                            <div style={{
                                marginTop: '1rem',
                                padding: '10px 20px',
                                borderRadius: '12px',
                                background: selectedMaterial.type === 'conductor' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                border: `1px solid ${selectedMaterial.type === 'conductor' ? '#10b981' : '#ef4444'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                {selectedMaterial.type === 'conductor' ? (
                                    <>
                                        <CheckCircle2 size={20} color="#34d399" />
                                        <span style={{ color: '#34d399', fontWeight: 800, fontSize: '0.9rem' }}>
                                            ¡CIRCUITO CERRADO! El material conduce electrones libres. Bombilla ENCENDIDA.
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={20} color="#f87171" />
                                        <span style={{ color: '#f87171', fontWeight: 800, fontSize: '0.9rem' }}>
                                            CIRCUITO BLOQUEADO: El aislante no libera electrones. Bombilla APAGADA.
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Selector de Materiales a Probar */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '2rem' }}>
                            {materials.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setSelectedMaterial(m)}
                                    style={{
                                        background: selectedMaterial.id === m.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
                                        border: `1.5px solid ${selectedMaterial.id === m.id ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                                        borderRadius: '14px',
                                        padding: '12px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    <span style={{ fontSize: '1.8rem' }}>{m.icon}</span>
                                    <div>
                                        <div style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{m.name}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{m.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* MINI-JUEGO CLASIFICADOR */}
                        <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.95rem' }}>🎮 Desafío Rápido: Clasifica el Material ({sorterIdx + 1}/{sorterList.length})</span>
                                <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.85rem' }}>Aciertos: {sorterScore}</span>
                            </div>

                            {sorterIdx < sorterList.length && !sorterAnswers[currentSorterItem?.id] ? (
                                <div style={{ padding: '1rem', background: 'rgba(15,23,42,0.6)', borderRadius: '14px', marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '0.3rem' }}>{currentSorterItem.emoji}</div>
                                    <h4 style={{ color: 'white', margin: '0 0 0.3rem', fontSize: '1.1rem' }}>{currentSorterItem.name}</h4>
                                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 1rem' }}>{currentSorterItem.hint}</p>

                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                                        <button
                                            onClick={() => handleSorterAnswer('conductor')}
                                            style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                                        >
                                            ⚡ Es Conductor
                                        </button>
                                        <button
                                            onClick={() => handleSorterAnswer('insulator')}
                                            style={{ background: '#f43f5e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                                        >
                                            🛡️ Es Aislante
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '14px' }}>
                                    <Trophy size={28} color="#34d399" style={{ margin: '0 auto 0.5rem' }} />
                                    <h4 style={{ color: 'white', margin: '0 0 0.3rem' }}>¡Clasificación completada!</h4>
                                    <p style={{ color: '#34d399', fontWeight: 700, margin: '0 0 1rem' }}>Puntuación: {sorterScore} de {sorterList.length} correctos</p>
                                    <button onClick={resetSorter} style={{ background: '#334155', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                                        <RotateCcw size={14} style={{ display: 'inline', marginRight: '6px' }} /> Reintentar Clasificación
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ───────────────────────────────────────────────────────── */}
                {/* ACTIVIDAD 2: JUEGO DE EMPAREJAR CON LÍNEAS CONECTORAS     */}
                {/* ───────────────────────────────────────────────────────── */}
                {activeTab === 'matching' && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(236,72,153,0.15)', color: '#f472b6', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                <Puzzle size={16} /> JUEGO DE EMPAREJAR CONCEPTOS
                            </div>
                            <h4 style={{ color: 'white', fontSize: '1.3rem', margin: '0 0 0.4rem', fontWeight: 800 }}>
                                Conecta Cada Término con su Definición
                            </h4>
                            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0, maxWidth: '600px', marginInline: 'auto' }}>
                                Haz clic en un término de la izquierda y luego en su significado correspondiente de la derecha para trazar la línea de conexión:
                            </p>
                        </div>

                        {/* Marcador superior */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '10px 18px', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '20px', fontSize: '0.88rem', alignItems: 'center' }}>
                                <span style={{ color: '#34d399', fontWeight: 800 }}>
                                    ✨ Parejas Resueltas: {matchedPairs.size} / {MATCHING_PAIRS.length}
                                </span>
                                <span style={{ color: '#94a3b8' }}>
                                    Intentos: {matchAttempts}
                                </span>
                            </div>
                            <button
                                onClick={resetMatching}
                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <RotateCcw size={13} /> Reiniciar Juego
                            </button>
                        </div>

                        {/* Encabezados de Columna */}
                        <div style={{ display: 'grid', gridTemplateColumns: '300px 100px 1fr', gap: '0', marginBottom: '8px', alignItems: 'center' }}>
                            <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                📌 Términos Clave
                            </div>
                            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                Conexión
                            </div>
                            <div style={{ color: '#ec4899', fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                📖 Significados
                            </div>
                        </div>

                        {/* Contenedor Principal de 3 Columnas con Líneas Conectoras SVG */}
                        <div style={{ display: 'grid', gridTemplateColumns: '300px 100px 1fr', gap: '0', position: 'relative', minHeight: `${TOTAL_ROWS_HEIGHT}px`, marginBottom: '2rem' }}>
                            {/* 1. COLUMNA IZQUIERDA: TÉRMINOS */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: `${ROW_GAP}px` }}>
                                {MATCHING_PAIRS.map((item) => {
                                    const isMatched = matchedPairs.has(item.id);
                                    const isSelected = selectedTerm === item.id;
                                    const isWrong = wrongPair?.termId === item.id;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelectTerm(item.id)}
                                            disabled={isMatched}
                                            style={{
                                                height: `${ROW_HEIGHT}px`,
                                                boxSizing: 'border-box',
                                                background: isMatched
                                                    ? 'rgba(16, 185, 129, 0.12)'
                                                    : isWrong
                                                    ? 'rgba(239, 68, 68, 0.25)'
                                                    : isSelected
                                                    ? 'rgba(236, 72, 153, 0.25)'
                                                    : 'rgba(255,255,255,0.03)',
                                                border: `1.5px solid ${
                                                    isMatched
                                                        ? '#10b981'
                                                        : isWrong
                                                        ? '#ef4444'
                                                        : isSelected
                                                        ? '#ec4899'
                                                        : 'rgba(255,255,255,0.08)'
                                                }`,
                                                borderRadius: '14px',
                                                padding: '12px 14px',
                                                textAlign: 'left',
                                                cursor: isMatched ? 'default' : 'pointer',
                                                opacity: isMatched ? 0.65 : 1,
                                                transform: isSelected ? 'scale(1.02)' : 'none',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                position: 'relative'
                                            }}
                                        >
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ color: isMatched ? '#34d399' : 'white', fontWeight: 800, fontSize: '0.92rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                    {item.term}
                                                </div>
                                                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>
                                                    {item.short}
                                                </div>
                                            </div>
                                            
                                            {/* Nodo conector derecho */}
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: isMatched ? '#10b981' : isSelected ? '#ec4899' : '#334155',
                                                border: '2px solid rgba(255,255,255,0.2)',
                                                boxShadow: isMatched ? '0 0 10px #10b981' : isSelected ? '0 0 10px #ec4899' : 'none',
                                                minWidth: '12px',
                                                marginLeft: '8px'
                                            }} />
                                        </button>
                                    );
                                })}
                            </div>

                            {/* 2. COLUMNA CENTRAL: PUENTE DE LÍNEAS CONECTORAS SVG */}
                            <div style={{ position: 'relative', width: '100%', height: `${TOTAL_ROWS_HEIGHT}px` }}>
                                <svg
                                    width="100%"
                                    height={TOTAL_ROWS_HEIGHT}
                                    viewBox={`0 0 ${SVG_WIDTH} ${TOTAL_ROWS_HEIGHT}`}
                                    style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
                                >
                                    {/* Dibujar todas las líneas emparejadas */}
                                    {Array.from(matchedPairs).map((pairId) => {
                                        const leftIdx = MATCHING_PAIRS.findIndex(p => p.id === pairId);
                                        const rightIdx = shuffledDefinitions.findIndex(p => p.id === pairId);
                                        const pairData = MATCHING_PAIRS.find(p => p.id === pairId);

                                        if (leftIdx === -1 || rightIdx === -1) return null;

                                        const y1 = leftIdx * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2;
                                        const y2 = rightIdx * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2;
                                        const color = pairData?.color || '#10b981';

                                        return (
                                            <g key={pairId}>
                                                {/* Resplandor de fondo */}
                                                <path
                                                    d={`M 0,${y1} C ${SVG_WIDTH * 0.5},${y1} ${SVG_WIDTH * 0.5},${y2} ${SVG_WIDTH},${y2}`}
                                                    fill="none"
                                                    stroke={color}
                                                    strokeWidth="6"
                                                    opacity="0.3"
                                                    style={{ filter: `drop-shadow(0 0 8px ${color})` }}
                                                />
                                                {/* Línea principal */}
                                                <path
                                                    d={`M 0,${y1} C ${SVG_WIDTH * 0.5},${y1} ${SVG_WIDTH * 0.5},${y2} ${SVG_WIDTH},${y2}`}
                                                    fill="none"
                                                    stroke={color}
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                />
                                                {/* Nodo inicial y final */}
                                                <circle cx="0" cy={y1} r="4" fill={color} />
                                                <circle cx={SVG_WIDTH} cy={y2} r="4" fill={color} />
                                            </g>
                                        );
                                    })}

                                    {/* Línea de previsualización activa cuando hay selección */}
                                    {selectedTerm && selectedDef && (
                                        (() => {
                                            const leftIdx = MATCHING_PAIRS.findIndex(p => p.id === selectedTerm);
                                            const rightIdx = shuffledDefinitions.findIndex(p => p.id === selectedDef);
                                            if (leftIdx === -1 || rightIdx === -1) return null;

                                            const y1 = leftIdx * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2;
                                            const y2 = rightIdx * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2;

                                            return (
                                                <path
                                                    d={`M 0,${y1} C ${SVG_WIDTH * 0.5},${y1} ${SVG_WIDTH * 0.5},${y2} ${SVG_WIDTH},${y2}`}
                                                    fill="none"
                                                    stroke="#ec4899"
                                                    strokeWidth="2"
                                                    strokeDasharray="4,4"
                                                    className="animated-wire-dc"
                                                />
                                            );
                                        })()
                                    )}
                                </svg>
                            </div>

                            {/* 3. COLUMNA DERECHA: DEFINICIONES */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: `${ROW_GAP}px` }}>
                                {shuffledDefinitions.map((item) => {
                                    const isMatched = matchedPairs.has(item.id);
                                    const isSelected = selectedDef === item.id;
                                    const isWrong = wrongPair?.defId === item.id;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelectDef(item.id)}
                                            disabled={isMatched}
                                            style={{
                                                height: `${ROW_HEIGHT}px`,
                                                boxSizing: 'border-box',
                                                background: isMatched
                                                    ? 'rgba(16, 185, 129, 0.12)'
                                                    : isWrong
                                                    ? 'rgba(239, 68, 68, 0.25)'
                                                    : isSelected
                                                    ? 'rgba(236, 72, 153, 0.25)'
                                                    : 'rgba(255,255,255,0.03)',
                                                border: `1.5px solid ${
                                                    isMatched
                                                        ? '#10b981'
                                                        : isWrong
                                                        ? '#ef4444'
                                                        : isSelected
                                                        ? '#ec4899'
                                                        : 'rgba(255,255,255,0.08)'
                                                }`,
                                                borderRadius: '14px',
                                                padding: '10px 16px',
                                                textAlign: 'left',
                                                cursor: isMatched ? 'default' : 'pointer',
                                                opacity: isMatched ? 0.65 : 1,
                                                transform: isSelected ? 'scale(1.01)' : 'none',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                position: 'relative'
                                            }}
                                        >
                                            {/* Nodo conector izquierdo */}
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: isMatched ? '#10b981' : isSelected ? '#ec4899' : '#334155',
                                                border: '2px solid rgba(255,255,255,0.2)',
                                                boxShadow: isMatched ? '0 0 10px #10b981' : isSelected ? '0 0 10px #ec4899' : 'none',
                                                minWidth: '12px',
                                                marginRight: '12px'
                                            }} />

                                            <p style={{ color: isMatched ? '#cbd5e1' : '#e2e8f0', fontSize: '0.82rem', lineHeight: 1.45, margin: 0, flex: 1 }}>
                                                {item.definition}
                                            </p>
                                            
                                            {isMatched && <Check size={18} color="#34d399" style={{ minWidth: '18px', marginLeft: '10px' }} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Celebración al emparejar los 6 términos */}
                        {matchedPairs.size === MATCHING_PAIRS.length && (
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(56, 189, 248, 0.15) 100%)',
                                border: '1px solid #10b981',
                                borderRadius: '18px',
                                padding: '1.5rem',
                                textAlign: 'center'
                            }}>
                                <Trophy size={36} color="#34d399" style={{ margin: '0 auto 0.5rem' }} />
                                <h3 style={{ color: 'white', margin: '0 0 0.3rem', fontSize: '1.25rem' }}>
                                    ¡Excelente dominio conceptual!
                                </h3>
                                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: '0 0 1rem' }}>
                                    Has conectado con éxito todos los términos de la lección con su fundamento físico.
                                </p>
                                <button
                                    onClick={resetMatching}
                                    style={{ background: '#10b981', color: '#0f172a', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                                >
                                    🎮 Jugar de Nuevo (Barajar)
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ───────────────────────────────────────────────────────── */}
                {/* ACTIVIDAD 3: LA MÁQUINA DEL TIEMPO (FRANKLIN VS THOMSON)  */}
                {/* ───────────────────────────────────────────────────────── */}
                {activeTab === 'franklin' && (
                    <div>
                        {/* Selector de Época / Máquina del Tiempo */}
                        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                <Compass size={16} /> ⏳ MÁQUINA DEL TIEMPO HISTÓRICA
                            </div>
                            <h4 style={{ color: 'white', fontSize: '1.35rem', margin: '0 0 0.4rem', fontWeight: 800 }}>
                                El Gran Duelo: Franklin (1752) vs. J.J. Thomson (1897)
                            </h4>
                            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0, maxWidth: '650px', marginInline: 'auto' }}>
                                Viaja en el tiempo con la palanca de épocas para descubrir cómo la ciencia descubrió el sentido de la corriente:
                            </p>
                        </div>

                        {/* Palanca / Selector de 3 Épocas */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1.75rem' }}>
                            <button
                                onClick={() => setFranklinGuess('1752')}
                                style={{
                                    background: (!franklinGuess || franklinGuess === '1752' || franklinGuess === 'conventional') ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
                                    border: `2px solid ${(!franklinGuess || franklinGuess === '1752' || franklinGuess === 'conventional') ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                                    borderRadius: '16px',
                                    padding: '14px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s',
                                    boxShadow: (!franklinGuess || franklinGuess === '1752' || franklinGuess === 'conventional') ? '0 0 20px rgba(245,158,11,0.25)' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📜</span>
                                    <div>
                                        <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.92rem' }}>Año 1752: Benjamin Franklin</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>La hipótesis del "Fluido Positivo"</div>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setFranklinGuess('1897')}
                                style={{
                                    background: franklinGuess === '1897' || franklinGuess === 'real' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.03)',
                                    border: `2px solid ${franklinGuess === '1897' || franklinGuess === 'real' ? '#38bdf8' : 'rgba(255,255,255,0.08)'}`,
                                    borderRadius: '16px',
                                    padding: '14px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s',
                                    boxShadow: franklinGuess === '1897' || franklinGuess === 'real' ? '0 0 20px rgba(56,189,248,0.25)' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🔬</span>
                                    <div>
                                        <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.92rem' }}>Año 1897: J.J. Thomson</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>¡Descubrimiento del Electrón!</div>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setFranklinGuess('actualidad')}
                                style={{
                                    background: franklinGuess === 'actualidad' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                                    border: `2px solid ${franklinGuess === 'actualidad' ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                                    borderRadius: '16px',
                                    padding: '14px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s',
                                    boxShadow: franklinGuess === 'actualidad' ? '0 0 20px rgba(16,185,129,0.25)' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>⚡</span>
                                    <div>
                                        <div style={{ color: '#34d399', fontWeight: 800, fontSize: '0.92rem' }}>En la Actualidad</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>¿A quién le hacemos caso hoy?</div>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Escenario de Simulación de la Época Activa */}
                        {(!franklinGuess || franklinGuess === '1752' || franklinGuess === 'conventional') && (
                            <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '20px', padding: '1.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                                    {/* Cómic / Diálogo de Franklin */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                                            <div style={{ fontSize: '2.5rem' }}>🪁</div>
                                            <div>
                                                <h4 style={{ color: '#fbbf24', margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Benjamin Franklin (Filadelfia, 1752)</h4>
                                                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Experimento de la Cometa y la Botella de Leyden</span>
                                            </div>
                                        </div>
                                        <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '14px', padding: '1rem', position: 'relative', marginBottom: '0.75rem' }}>
                                            <p style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                                                "¡He descubierto que la electricidad es un <strong>fluido único continuo</strong>! Supongo que el polo positivo (+) tiene un exceso de presión de fluido y se derrama hacia el polo negativo (-). ¡Llamaremos a esto <strong>Corriente Eléctrica</strong>!"
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <span style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                                                Flujo Teórico: De (+) a (−)
                                            </span>
                                            <span style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem' }}>
                                                Sin microscopios atómicos
                                            </span>
                                        </div>
                                    </div>

                                    {/* Animación del Circuito de Franklin */}
                                    <div style={{ background: '#020617', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ color: '#fbbf24', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                            VISIÓN DE FRANKLIN: FLUIDO DORADO (+ A −)
                                        </div>
                                        <svg width="100%" height="130" viewBox="0 0 300 130">
                                            {/* Circuito */}
                                            <rect x="30" y="20" width="240" height="90" rx="12" fill="none" stroke="#475569" strokeWidth="3" />
                                            {/* Partículas de fluido dorado animadas */}
                                            <rect x="30" y="20" width="240" height="90" rx="12" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="8,8" className="animated-wire-dc" />
                                            
                                            {/* Batería / Botella */}
                                            <rect x="120" y="95" width="60" height="30" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
                                            <text x="130" y="115" fill="#f87171" fontSize="12" fontWeight="bold">+</text>
                                            <text x="165" y="115" fill="#38bdf8" fontSize="12" fontWeight="bold">−</text>

                                            {/* Flechas de sentido */}
                                            <path d="M 60 20 L 75 15 L 75 25 Z" fill="#fbbf24" />
                                            <path d="M 240 20 L 255 15 L 255 25 Z" fill="#fbbf24" />

                                            {/* Chispero / Bombilla */}
                                            <circle cx="150" cy="20" r="14" fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 12px #fbbf24)' }} />
                                            <text x="150" y="25" textAnchor="middle" fontSize="12">⚡</text>
                                        </svg>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Las flechas viajan del terminal (+) al (−)</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Escenario 1897 (Thomson) */}
                        {(franklinGuess === '1897' || franklinGuess === 'real') && (
                            <div style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '20px', padding: '1.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                                    {/* Cómic / Diálogo de Thomson */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                                            <div style={{ fontSize: '2.5rem' }}>🔬</div>
                                            <div>
                                                <h4 style={{ color: '#38bdf8', margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>J.J. Thomson (Cambridge, 1897)</h4>
                                                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Experimento del Tubo de Rayos Catódicos (Premio Nobel)</span>
                                            </div>
                                        </div>
                                        <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '14px', padding: '1rem', position: 'relative', marginBottom: '0.75rem' }}>
                                            <p style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                                                "¡Un momento, Don Benjamin! Acabo de descubrir la partícula más veloz del universo: <strong>el Electrón</strong>. Tiene carga negativa y viaja físicamente <strong>repelido por el polo (-) hacia el polo (+)</strong>. ¡El fluido no existía!"
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <span style={{ background: 'rgba(56,189,248,0.2)', color: '#38bdf8', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                                                Flujo Real: De (−) a (+)
                                            </span>
                                            <span style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem' }}>
                                                Realidad Física & Cuántica
                                            </span>
                                        </div>
                                    </div>

                                    {/* Animación Microscópica de Thomson */}
                                    <div style={{ background: '#020617', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ color: '#38bdf8', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                            ZOOM ATÓMICO: ELECTRONES AZULES (− A +)
                                        </div>
                                        <svg width="100%" height="130" viewBox="0 0 300 130">
                                            {/* Cable en corte transversal */}
                                            <rect x="20" y="35" width="260" height="60" rx="10" fill="rgba(245,158,11,0.08)" stroke="#d97706" strokeWidth="1.5" />
                                            
                                            {/* Átomos de Cobre fijos */}
                                            {[50, 100, 150, 200, 250].map((cx, i) => (
                                                <g key={i}>
                                                    <circle cx={cx} cy="65" r="14" fill="#ef4444" opacity="0.7" />
                                                    <text x={cx} y="69" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Cu+</text>
                                                </g>
                                            ))}

                                            {/* Electrones libres en movimiento hacia la derecha */}
                                            <circle cx="75" cy="50" r="5" fill="#38bdf8" style={{ filter: 'drop-shadow(0 0 8px #38bdf8)' }} />
                                            <circle cx="125" cy="80" r="5" fill="#38bdf8" style={{ filter: 'drop-shadow(0 0 8px #38bdf8)' }} />
                                            <circle cx="175" cy="50" r="5" fill="#38bdf8" style={{ filter: 'drop-shadow(0 0 8px #38bdf8)' }} />
                                            <circle cx="225" cy="80" r="5" fill="#38bdf8" style={{ filter: 'drop-shadow(0 0 8px #38bdf8)' }} />

                                            {/* Polos */}
                                            <text x="25" y="28" fill="#38bdf8" fontSize="11" fontWeight="bold">Cátodo (−)</text>
                                            <text x="235" y="28" fill="#f87171" fontSize="11" fontWeight="bold">Ánodo (+)</text>
                                            <path d="M 70 24 L 230 24" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,4" />
                                            <path d="M 230 24 L 220 20 L 220 28 Z" fill="#38bdf8" />
                                        </svg>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Los electrones son repelidos por el (−) y viajan hacia el (+)</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Escenario En la Actualidad */}
                        {franklinGuess === 'actualidad' && (
                            <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '20px', padding: '1.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                                    {/* Explicación en la actualidad */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                                            <div style={{ fontSize: '2.5rem' }}>⚡</div>
                                            <div>
                                                <h4 style={{ color: '#34d399', margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>En la Actualidad (Esquemas y Circuitos)</h4>
                                                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Diseño de Circuitos y Componentes Electrónicos</span>
                                            </div>
                                        </div>
                                        <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '14px', padding: '1rem', position: 'relative', marginBottom: '0.75rem' }}>
                                            <p style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                                                "¿Por qué no cambiamos todos los libros cuando Thomson descubrió el electrón? Porque <strong>todas las fórmulas matemáticas (Leyes de Ohm, Kirchhoff, Watt) funcionan exactamente igual</strong>. Así que en los diagramas y esquemas técnicos se sigue la <strong>Convención de Franklin (+) a (−)</strong> como estándar universal."
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <span style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                                                Estándar Universal: Diagramas (+ a −)
                                            </span>
                                            <span style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem' }}>
                                                Física Atómica: (− a +)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Esquema Moderno con Diodo LED */}
                                    <div style={{ background: '#020617', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ color: '#34d399', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                            SÍMBOLO DEL DIODO / LED EN ESQUEMAS
                                        </div>
                                        <svg width="100%" height="130" viewBox="0 0 300 130">
                                            {/* Cable */}
                                            <line x1="30" y1="65" x2="270" y2="65" stroke="#334155" strokeWidth="4" />
                                            
                                            {/* Símbolo de Diodo apuntando según Franklin */}
                                            <polygon points="120,40 180,65 120,90" fill="#10b981" />
                                            <line x1="180" y1="35" x2="180" y2="95" stroke="#10b981" strokeWidth="4" />
                                            
                                            {/* Flechas de luz LED */}
                                            <path d="M 160 45 L 180 30" stroke="#fbbf24" strokeWidth="2" />
                                            <path d="M 175 48 L 195 33" stroke="#fbbf24" strokeWidth="2" />

                                            {/* Flecha de sentido convencional */}
                                            <text x="150" y="115" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold">
                                                La flecha del diodo sigue a Franklin ➔
                                            </text>
                                        </svg>
                                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>¡La flecha del símbolo apunta hacia donde viaja la corriente convencional!</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ───────────────────────────────────────────────────────── */}
                {/* ACTIVIDAD 4: SIMULADOR DE RIESGO & SEGURIDAD HUMANA       */}
                {/* ───────────────────────────────────────────────────────── */}
                {activeTab === 'safety' && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                <ShieldAlert size={16} /> ⚡ BIOMETRÍA & SEGURIDAD HUMANA
                            </div>
                            <h4 style={{ color: 'white', fontSize: '1.35rem', margin: '0 0 0.4rem', fontWeight: 800 }}>
                                Laboratorio de Riesgo Eléctrico y Biometría Humana
                            </h4>
                            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0, maxWidth: '650px', marginInline: 'auto' }}>
                                Descubre cómo la resistencia de la piel y el voltaje determinan la corriente letal que atraviesa el corazón:
                            </p>
                        </div>

                        {/* Controles Principales: Fuente + Resistencia de la Piel */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>
                            {/* 1. Selector de Fuentes de Voltaje */}
                            <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem' }}>
                                <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                                    <span>🔌</span> Fuente de Voltaje Aplicada:
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
                                    {[
                                        { v: 9, label: 'Pila Cuadrada', tag: '9V DC', icon: '🔋' },
                                        { v: 12, label: 'Batería de Automóvil', tag: '12V DC', icon: '🚗' },
                                        { v: 120, label: 'Tomacorriente Residencial', tag: '120V AC', icon: '🏠' },
                                        { v: 230, label: 'Toma Industrial / Trifásica', tag: '230V AC', icon: '🏭' },
                                        { v: 50000, label: 'Pistola Taser (Pulsos)', tag: '50.000V', icon: '⚡' },
                                    ].map((s) => (
                                        <button
                                            key={s.v}
                                            onClick={() => setVoltageSource(s.v)}
                                            style={{
                                                background: voltageSource === s.v ? `${safetyStatus.color}25` : 'rgba(255,255,255,0.03)',
                                                border: `2px solid ${voltageSource === s.v ? safetyStatus.color : 'rgba(255,255,255,0.06)'}`,
                                                boxShadow: voltageSource === s.v ? `0 0 16px ${safetyStatus.color}35` : 'none',
                                                color: voltageSource === s.v ? 'white' : '#cbd5e1',
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'all 0.25s ease'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
                                                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.label}</span>
                                            </div>
                                            <span style={{
                                                background: voltageSource === s.v ? safetyStatus.color : 'rgba(255,255,255,0.08)',
                                                color: voltageSource === s.v ? ((safetyStatus.level === 'mild' || safetyStatus.level === 'warn') ? '#0f172a' : 'white') : '#94a3b8',
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 800,
                                                transition: 'all 0.25s ease'
                                            }}>
                                                {s.tag}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 2. Selector de Resistencia de la Piel y Contacto a Tierra */}
                            <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                                        <span>✋</span> Condición Corporal y Calzado (Resistencia R):
                                    </label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {/* 1. Seca con calzado */}
                                        <button
                                            onClick={() => setSkinCondition('dry')}
                                            style={{
                                                background: skinCondition === 'dry' ? `${safetyStatus.color}20` : 'rgba(255,255,255,0.02)',
                                                border: `2px solid ${skinCondition === 'dry' ? safetyStatus.color : 'rgba(255,255,255,0.06)'}`,
                                                boxShadow: skinCondition === 'dry' ? `0 0 16px ${safetyStatus.color}30` : 'none',
                                                borderRadius: '10px',
                                                padding: '10px 12px',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                transition: 'all 0.25s ease'
                                            }}
                                        >
                                            <div style={{ color: skinCondition === 'dry' ? safetyStatus.color : '#e2e8f0', fontWeight: 800, fontSize: '0.88rem', marginBottom: '2px' }}>
                                                🌵 1. Piel Seca + Calzado con Suela
                                            </div>
                                            <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                                                Resistencia: <strong>{getEffectiveResistance(voltageSource, 'dry').toLocaleString()} Ω ({getEffectiveResistance(voltageSource, 'dry') >= 1000 ? `${getEffectiveResistance(voltageSource, 'dry') / 1000} kΩ` : `${getEffectiveResistance(voltageSource, 'dry')} Ω`})</strong>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                                                Piel intacta y suela de goma aislante amortiguan la corriente.
                                            </div>
                                        </button>

                                        {/* 2. Húmeda / Sudor */}
                                        <button
                                            onClick={() => setSkinCondition('damp')}
                                            style={{
                                                background: skinCondition === 'damp' ? `${safetyStatus.color}20` : 'rgba(255,255,255,0.02)',
                                                border: `2px solid ${skinCondition === 'damp' ? safetyStatus.color : 'rgba(255,255,255,0.06)'}`,
                                                boxShadow: skinCondition === 'damp' ? `0 0 16px ${safetyStatus.color}30` : 'none',
                                                borderRadius: '10px',
                                                padding: '10px 12px',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                transition: 'all 0.25s ease'
                                            }}
                                        >
                                            <div style={{ color: skinCondition === 'damp' ? safetyStatus.color : '#e2e8f0', fontWeight: 800, fontSize: '0.88rem', marginBottom: '2px' }}>
                                                💧 2. Ligeramente Húmeda / Sudor
                                            </div>
                                            <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                                                Resistencia: <strong>{getEffectiveResistance(voltageSource, 'damp').toLocaleString()} Ω ({getEffectiveResistance(voltageSource, 'damp') >= 1000 ? `${getEffectiveResistance(voltageSource, 'damp') / 1000} kΩ` : `${getEffectiveResistance(voltageSource, 'damp')} Ω`})</strong>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                                                El sudor con sales reduce la resistencia (inicio de espasmos).
                                            </div>
                                        </button>

                                        {/* 3. Descalzo en suelo */}
                                        <button
                                            onClick={() => setSkinCondition('barefoot')}
                                            style={{
                                                background: skinCondition === 'barefoot' ? `${safetyStatus.color}20` : 'rgba(255,255,255,0.02)',
                                                border: `2px solid ${skinCondition === 'barefoot' ? safetyStatus.color : 'rgba(255,255,255,0.06)'}`,
                                                boxShadow: skinCondition === 'barefoot' ? `0 0 16px ${safetyStatus.color}30` : 'none',
                                                borderRadius: '10px',
                                                padding: '10px 12px',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                transition: 'all 0.25s ease'
                                            }}
                                        >
                                            <div style={{ color: skinCondition === 'barefoot' ? safetyStatus.color : '#e2e8f0', fontWeight: 800, fontSize: '0.88rem', marginBottom: '2px' }}>
                                                🦶 3. Pies Descalzos en Suelo Húmedo / Mojado
                                            </div>
                                            <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                                                Resistencia cae a: <strong>{getEffectiveResistance(voltageSource, 'barefoot').toLocaleString()} Ω (1 kΩ)</strong>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                                                Conexión directa a tierra sin aislamiento: ¡corriente mortal!
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Relación de Corriente en Vivo */}
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${safetyStatus.color}40`, borderRadius: '10px', padding: '8px 12px', marginTop: '10px', textAlign: 'center', transition: 'all 0.25s ease' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Relación Voltaje / Resistencia: </span>
                                    <strong style={{ color: safetyStatus.color, fontSize: '0.85rem' }}>{voltageSource}V / {skinResistance.toLocaleString()}Ω</strong>
                                </div>
                            </div>
                        </div>

                        {/* Escenario Biométrico Visual: Silueta Humana + Display Digital */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1.25rem', marginBottom: '1.75rem' }}>
                            {/* Silueta Humana SVG con Trayectoria de Corriente */}
                            <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                                    Trayecto de la Corriente a Tierra
                                </div>

                                <svg width="100%" height="240" viewBox="0 0 200 250" style={{ maxWidth: '250px' }}>
                                    {/* Silueta Humanoide */}
                                    {/* Cabeza */}
                                    <circle cx="100" cy="30" r="18" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                                    {/* Tronco */}
                                    <rect x="80" y="52" width="40" height="70" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                                    {/* Brazo Izquierdo (hacia la fuente) */}
                                    <path d="M 80 60 L 35 90" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
                                    {/* Brazo Derecho */}
                                    <path d="M 120 60 L 165 90" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
                                    {/* Piernas a Tierra */}
                                    <path d="M 90 122 L 75 195" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
                                    <path d="M 110 122 L 125 195" stroke="#475569" strokeWidth="7" strokeLinecap="round" />

                                    {/* Calzado o Pies Descalzos */}
                                    {skinCondition === 'dry' ? (
                                        <g>
                                            <rect x="64" y="192" width="22" height="9" rx="3" fill="#1e293b" stroke="#34d399" strokeWidth="1.5" />
                                            <rect x="114" y="192" width="22" height="9" rx="3" fill="#1e293b" stroke="#34d399" strokeWidth="1.5" />
                                        </g>
                                    ) : (
                                        <g>
                                            <ellipse cx="75" cy="195" rx="7" ry="3.5" fill="#fca5a5" />
                                            <ellipse cx="125" cy="195" rx="7" ry="3.5" fill="#fca5a5" />
                                            {skinCondition === 'barefoot' && (
                                                <ellipse cx="100" cy="203" rx="55" ry="5" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,3" />
                                            )}
                                        </g>
                                    )}

                                    {/* Línea de Tierra */}
                                    <line x1="60" y1="205" x2="140" y2="205" stroke="#64748b" strokeWidth="3" />
                                    <line x1="75" y1="211" x2="125" y2="211" stroke="#64748b" strokeWidth="2" />
                                    <line x1="90" y1="217" x2="110" y2="217" stroke="#64748b" strokeWidth="1.5" />

                                    {/* Trayectoria de Corriente Eléctrica (Glow Beam) */}
                                    <path
                                        d="M 35 90 L 80 60 L 100 80 L 110 122 L 125 195"
                                        fill="none"
                                        stroke={safetyStatus.color}
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        className="animated-wire-dc"
                                        style={{ filter: `drop-shadow(0 0 10px ${safetyStatus.color})` }}
                                    />

                                    {/* Punto de contacto en la mano */}
                                    <circle cx="35" cy="90" r="7" fill={safetyStatus.color} style={{ filter: `drop-shadow(0 0 10px ${safetyStatus.color})` }} />
                                    <text x="35" y="112" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="bold">{voltageSource}V</text>

                                    {/* Corazón / Foco de Riesgo */}
                                    <circle
                                        cx="100"
                                        cy="80"
                                        r={currentMa > 25 ? '10' : '7'}
                                        fill={safetyStatus.color}
                                        style={{
                                            filter: `drop-shadow(0 0 14px ${safetyStatus.color})`,
                                            transition: 'all 0.3s'
                                        }}
                                    />
                                    <text x="100" y="84" textAnchor="middle" fontSize="10">❤️</text>
                                </svg>

                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '4px' }}>
                                    {skinCondition === 'barefoot' ? '⚠️ Pies Descalzos en Suelo (Retorno a Tierra Directo)' : skinCondition === 'damp' ? '💧 Manos Húmedas con Sudor' : '🛡️ Calzado Aislante Protector'}
                                </div>
                            </div>

                            {/* Display Digital de Medición y Dato Exacto de la Tabla */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                                {/* 1. Corriente Calculada */}
                                <div style={{ background: '#020617', border: `2px solid ${safetyStatus.color}`, borderRadius: '18px', padding: '1.25rem', textAlign: 'center', boxShadow: `0 0 25px ${safetyStatus.color}25` }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Corriente Calculada a Través del Cuerpo:
                                    </div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: safetyStatus.color, margin: '0.25rem 0' }}>
                                        {currentMa.toFixed(2)} mA
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                                        Equivale a <strong>{(currentMa / 1000).toFixed(4)} Amperios [A]</strong>
                                    </div>
                                </div>

                                {/* 2. Dato Exacto de la Tabla de Riesgo */}
                                <div style={{ background: `${safetyStatus.color}15`, border: `2px solid ${safetyStatus.color}`, borderRadius: '16px', padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
                                        <div style={{ color: safetyStatus.color, fontWeight: 900, fontSize: '1.1rem' }}>
                                            {safetyStatus.range || `${currentMa.toFixed(2)} mA`}
                                        </div>
                                        <span style={{ background: safetyStatus.color, color: (safetyStatus.level === 'mild' || safetyStatus.level === 'warn') ? '#0f172a' : 'white', padding: '3px 10px', borderRadius: '8px', fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                            {safetyStatus.risk}
                                        </span>
                                    </div>
                                    <div style={{ color: '#e2e8f0', fontSize: '0.88rem', lineHeight: 1.6 }}>
                                        {safetyStatus.desc}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
