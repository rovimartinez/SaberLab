import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Gift, Trophy, Layers, Play, BookOpen, X, ArrowLeft } from 'lucide-react';
import { gadgets } from '../data/gadgetsData';
import { getCourseByIdentifier } from '../data/coursesData';
import InteractiveOhmLaw from '../components/simulators/electricity/InteractiveOhmLaw';
import ResistorCalculator from '../components/simulators/electricity/ResistorCalculator';
import CircuitSimulator from '../components/simulators/electricity/CircuitSimulator';
import MultimeterExplorer from '../components/simulators/electricity/MultimeterExplorer';
import ConductorAnimation from '../components/simulators/electricity/ConductorAnimation';
import ChargeInteraction from '../components/simulators/electricity/ChargeInteraction';
import '../styles/PanelRecompensas.css';

// Mapeo completo de componentes de simulador
const SIMULATOR_COMPONENTS = {
    'conductores': ConductorAnimation,
    'coulomb': ChargeInteraction,
    'simulador-circuitos': CircuitSimulator,
    'ley-ohm': InteractiveOhmLaw,
    'calculadora-resistencias': ResistorCalculator,
    'multimetro': MultimeterExplorer,
};

// ── ICONOS VECTORIALES PERSONALIZADOS DE ALTA PRECISIÓN ELECTRÓNICA ──────────
function CustomElectronicIcon({ id, size = 42 }) {
    switch (id) {
        // 1. Átomo y electrones de valencia
        case 'conductores':
            return (
                <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="24" cy="24" rx="20" ry="7" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="3 2" transform="rotate(-30 24 24)" />
                    <ellipse cx="24" cy="24" rx="20" ry="7" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="3 2" transform="rotate(30 24 24)" />
                    <ellipse cx="24" cy="24" rx="20" ry="7" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 2" />
                    <circle cx="24" cy="24" r="5.5" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
                    <circle cx="22" cy="22" r="2" fill="#cbd5e1" />
                    <circle cx="41" cy="24" r="3.2" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                </svg>
            );

        // 2. Ley de Coulomb (Cargas + / - e interacción)
        case 'coulomb':
            return (
                <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="24" r="8.5" fill="#ef4444" stroke="#fca5a5" strokeWidth="1.5" />
                    <text x="12" y="28" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="sans-serif">+</text>
                    <circle cx="36" cy="24" r="8.5" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1.5" />
                    <text x="36" y="27" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900" fontFamily="sans-serif">−</text>
                    <path d="M 21 24 L 27 24" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
                    <polygon points="21,21 17,24 21,27" fill="#34d399" />
                    <polygon points="27,21 31,24 27,27" fill="#34d399" />
                </svg>
            );

        // 3. Ley de Ohm y Watt (Triángulo V / I · R)
        case 'ley-ohm':
            return (
                <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="24,5 43,41 5,41" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" />
                    <line x1="12" y1="24" x2="36" y2="24" stroke="#10b981" strokeWidth="2" />
                    <line x1="24" y1="24" x2="24" y2="41" stroke="#10b981" strokeWidth="2" />
                    <text x="24" y="19" textAnchor="middle" fill="#facc15" fontSize="11" fontWeight="900" fontFamily="monospace">V</text>
                    <text x="16" y="36" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="900" fontFamily="monospace">I</text>
                    <text x="32" y="36" textAnchor="middle" fill="#c084fc" fontSize="10" fontWeight="900" fontFamily="monospace">R</text>
                </svg>
            );

        // 4. Código de Colores (Resistencia Real Cerámica con 4 Bandas)
        case 'calculadora-resistencias':
            return (
                <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="2" y1="24" x2="10" y2="24" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                    <line x1="38" y1="24" x2="46" y2="24" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                    <rect x="10" y="15" width="28" height="18" rx="7" fill="#d4a373" stroke="#8c5835" strokeWidth="1.2" />
                    <rect x="15" y="15" width="3" height="18" fill="#78350f" />
                    <rect x="21" y="15" width="3" height="18" fill="#0f172a" />
                    <rect x="27" y="15" width="3" height="18" fill="#ef4444" />
                    <rect x="33" y="15" width="2.5" height="18" fill="#facc15" />
                </svg>
            );

        // 5. Multímetro Digital (Tester con Pantalla LCD y Selector)
        case 'multimetro':
            return (
                <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="4" width="28" height="40" rx="6" fill="#1e1b4b" stroke="#a855f7" strokeWidth="2" />
                    <rect x="14" y="9" width="20" height="10" rx="2" fill="#022c22" stroke="#10b981" strokeWidth="1" />
                    <text x="24" y="17" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="900" fontFamily="monospace">12.0V</text>
                    <circle cx="24" cy="28" r="6" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
                    <line x1="24" y1="28" x2="24" y2="23" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="18" cy="38" r="2" fill="#ef4444" />
                    <circle cx="30" cy="38" r="2" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
                </svg>
            );

        // 6. Redes de Circuitos (Serie y Paralelo con Ramas)
        case 'simulador-circuitos':
            return (
                <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 6 24 L 14 24 L 14 14 L 34 14 L 34 24 L 42 24" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" fill="none" />
                    <path d="M 14 24 L 14 34 L 34 34 L 34 24" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" fill="none" />
                    <rect x="20" y="10" width="8" height="8" rx="2" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                    <rect x="20" y="30" width="8" height="8" rx="2" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                    <circle cx="14" cy="24" r="2.5" fill="#38bdf8" />
                    <circle cx="34" cy="24" r="2.5" fill="#38bdf8" />
                </svg>
            );

        default:
            return null;
    }
}

// Agrupar recompensas por curso
function groupByCourse(items) {
    const groups = {};
    for (const g of items) {
        if (!groups[g.courseName]) groups[g.courseName] = [];
        groups[g.courseName].push(g);
    }
    return groups;
}

export default function PanelRecompensas() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [activeModalReward, setActiveModalReward] = useState(null);

    // Obtener curso si viene por URL
    const activeCourse = courseId ? getCourseByIdentifier(courseId) : null;

    const filteredGadgets = useMemo(() => {
        if (activeCourse) {
            return gadgets.filter(g => g.courseAbbr === activeCourse.abbr || (!g.courseAbbr && activeCourse.abbr === 'EE'));
        }
        return gadgets;
    }, [activeCourse]);

    const rewardsList = useMemo(() =>
        filteredGadgets.map(g => ({
            ...g,
            isLocked: false,
        })),
        [filteredGadgets]
    );

    const unlockedCount = rewardsList.length;
    const totalCount = rewardsList.length;
    const groups = useMemo(() => groupByCourse(rewardsList), [rewardsList]);

    // Cerrar modal con tecla Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setActiveModalReward(null);
            }
        };
        if (activeModalReward) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeModalReward]);

    const ActiveModalComponent = activeModalReward ? SIMULATOR_COMPONENTS[activeModalReward.id] : null;

    return (
        <div className="recompensas-container">
            {/* ── Botón Volver al Curso (Si estamos dentro de un curso) ── */}
            {activeCourse && (
                <div style={{ marginBottom: '-0.5rem' }}>
                    <button
                        onClick={() => navigate(`/dashboard/my-courses/${activeCourse.slug}`)}
                        className="btn-back-nav"
                    >
                        <ArrowLeft size={16} />
                        <span>Volver a {activeCourse.name}</span>
                    </button>
                </div>
            )}

            {/* ── Encabezado Estándar SaberLab ── */}
            <div className="page-header yellow" style={{ marginBottom: '0.5rem' }}>
                <div className="header-title">
                    <Gift size={28} className="text-gradient" />
                    <div>
                        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>
                            {activeCourse ? `Recompensas de ${activeCourse.name}` : 'Mis Recompensas'}
                        </h1>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                            Colección de instrumentos, simuladores y herramientas desbloqueables ganadas en tus lecciones.
                        </p>
                    </div>
                </div>

                <div className="recompensa-stat-pill">
                    <Trophy size={16} color="#facc15" />
                    <span>Colección: <strong>{unlockedCount}/{totalCount}</strong></span>
                </div>
            </div>

            {/* ── Bóveda de Insignias / Recompensas en Orden Cronológico ── */}
            {Object.entries(groups).map(([courseName, items]) => (
                <div key={courseName}>
                    <div className="recompensas-section-title">
                        <Layers size={18} color="#94a3b8" />
                        <span>Insignias de {courseName}</span>
                    </div>

                    <div className="recompensas-badges-grid">
                        {items.map((reward) => {
                            const themeColor = reward.color || '#eab308';

                            return (
                                <div
                                    key={reward.id}
                                    className="badge-reward-card"
                                    style={{
                                        '--badge-theme': themeColor,
                                        '--badge-glow': `${themeColor}40`,
                                    }}
                                    onClick={() => setActiveModalReward(reward)}
                                >
                                    {/* Etiqueta de Origen / Lección */}
                                    <div style={{
                                        alignSelf: 'flex-start',
                                        fontSize: '0.68rem',
                                        fontWeight: 800,
                                        color: '#cbd5e1',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <BookOpen size={10} color={themeColor} />
                                        <span>{reward.lessonSource}</span>
                                    </div>

                                    {/* Medallón Emblema con Icono Vectorial Personalizado */}
                                    <div className="badge-emblem">
                                        <CustomElectronicIcon id={reward.id} size={42} />
                                    </div>

                                    {/* Información */}
                                    <div className="badge-info">
                                        <h3 className="badge-title" title={reward.name}>
                                            {reward.name}
                                        </h3>
                                        <p className="badge-desc">
                                            {reward.description}
                                        </p>
                                    </div>

                                    {/* Botón de Acción */}
                                    <div className="badge-action-pill">
                                        <Play size={12} />
                                        <span>Abrir Instrumento</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* ── VENTANA MODAL EMERGENTE AL DAR CLIC EN UNA INSIGNIA ── */}
            {activeModalReward && ActiveModalComponent && (
                <div
                    className="reward-modal-overlay"
                    onClick={() => setActiveModalReward(null)}
                >
                    <div
                        className="reward-modal-window"
                        style={{
                            '--badge-theme': activeModalReward.color || '#eab308',
                            '--badge-glow': `${activeModalReward.color || '#eab308'}40`
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Cabecera de la Ventana */}
                        <div className="reward-modal-header">
                            <div className="reward-modal-title">
                                <div style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    padding: '6px 8px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <CustomElectronicIcon id={activeModalReward.id} size={28} />
                                </div>
                                <div>
                                    <h2>{activeModalReward.name}</h2>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: '4px', color: activeModalReward.color, fontWeight: 700 }}>
                                            {activeModalReward.lessonSource}
                                        </span>
                                        <span>• {activeModalReward.courseName}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="reward-modal-close-btn"
                                onClick={() => setActiveModalReward(null)}
                                title="Cerrar ventana (Esc)"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Contenido / Simulador Interactivo */}
                        <div className="reward-modal-body">
                            <ActiveModalComponent />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
