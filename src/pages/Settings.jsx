import React, { useState, useEffect } from 'react';
import { 
    Palette, Moon, Sun, Smartphone, Save, RotateCcw, Check, Sparkles, 
    Zap, Bot, Trophy, Flame, CheckCircle, Lock, Award, BookOpen, 
    ArrowRight, Play, Eye, Sliders, Layers, Globe, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { COURSES_DEFINITION } from '../data/coursesData.jsx';
import '../styles/Settings.css';

// Temas completos predefinidos de 1 clic
const THEME_PRESETS = [
    {
        id: 'electric-cyber',
        name: '⚡ Cyber Eléctrico (Predeterminado)',
        desc: 'Azul Cyan Eléctrico con Ámbar Dorado y fondo Slate',
        accent: '#38bdf8',
        success: '#10b981',
        warning: '#f59e0b',
        rewards: '#facc15',
        streak: '#f97316',
        bgDark: '#0f172a',
        bgLight: '#f1f5f9',
        courses: { EE: '#facc15', RE: '#38bdf8' }
    },
    {
        id: 'synthwave-violet',
        name: '🔮 Synthwave Neón',
        desc: 'Púrpura cibernético con Rosa Neón y fondo Midnight',
        accent: '#a855f7',
        success: '#06b6d4',
        warning: '#ec4899',
        rewards: '#f43f5e',
        streak: '#e11d48',
        bgDark: '#0b0f19',
        bgLight: '#fdf4ff',
        courses: { EE: '#ec4899', RE: '#a855f7' }
    },
    {
        id: 'emerald-tech',
        name: '🌿 Esmeralda Matrix',
        desc: 'Verde Jade tecnológico de alta concentración y foco',
        accent: '#10b981',
        success: '#22c55e',
        warning: '#eab308',
        rewards: '#38bdf8',
        streak: '#f97316',
        bgDark: '#061712',
        bgLight: '#f0fdf4',
        courses: { EE: '#10b981', RE: '#06b6d4' }
    },
    {
        id: 'solar-forge',
        name: '🌋 Sunset Solar',
        desc: 'Ámbar brillante y Naranja Fuego sobre fondo Obsidiana',
        accent: '#f97316',
        success: '#10b981',
        warning: '#ea580c',
        rewards: '#facc15',
        streak: '#ef4444',
        bgDark: '#140c06',
        bgLight: '#fff7ed',
        courses: { EE: '#f97316', RE: '#facc15' }
    },
    {
        id: 'titanium-pro',
        name: '💎 Titanio Minimal Pro',
        desc: 'Índigo Real sobre fondos limpios de máxima claridad',
        accent: '#6366f1',
        success: '#059669',
        warning: '#d97706',
        rewards: '#4f46e5',
        streak: '#dc2626',
        bgDark: '#111827',
        bgLight: '#ffffff',
        courses: { EE: '#6366f1', RE: '#0284c7' }
    }
];

const DEFAULT_TOKENS = {
    accent: '#38bdf8',
    success: '#10b981',
    warning: '#f59e0b',
    rewards: '#facc15',
    streak: '#f97316',
    bgDark: '#0f172a',
    bgLight: '#f1f5f9'
};

const DEFAULT_COURSE_COLORS = {
    EE: '#facc15',
    RE: '#38bdf8'
};

const COLOR_SWATCHES = [
    '#38bdf8', '#0284c7', '#a855f7', '#6366f1', '#10b981', 
    '#22c55e', '#06b6d4', '#facc15', '#f59e0b', '#f97316', 
    '#ef4444', '#ec4899', '#f43f5e', '#64748b', '#0f172a', '#ffffff'
];

const getStoredTokens = () => {
    if (typeof window === 'undefined') return DEFAULT_TOKENS;
    try {
        const saved = localStorage.getItem('saberlab-theme-tokens');
        if (saved) return { ...DEFAULT_TOKENS, ...JSON.parse(saved) };
    } catch { /* ignore */ }
    return DEFAULT_TOKENS;
};

const getStoredCourseColors = () => {
    if (typeof window === 'undefined') return DEFAULT_COURSE_COLORS;
    try {
        const saved = localStorage.getItem('saberlab-course-colors');
        if (saved) return { ...DEFAULT_COURSE_COLORS, ...JSON.parse(saved) };
    } catch { /* ignore */ }
    return DEFAULT_COURSE_COLORS;
};

const getStoredTheme = () => {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem('saberlab-theme') || localStorage.getItem('theme');
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'dark';
};

const SettingsPage = () => {
    const { profile, user } = useAuth();
    
    // ── PASO 1: Curso Seleccionado a Afectar ('EE' | 'RE' | 'GLOBAL')
    const [selectedCourse, setSelectedCourse] = useState('EE');
    
    // ── PASO 2: Modo Seleccionado (Claro | Oscuro | Sistema)
    const [selectedTheme, setSelectedTheme] = useState(getStoredTheme);
    
    // ── PASO 3: Estado de Colores y Tokens
    const [tokens, setTokens] = useState(getStoredTokens);
    const [courseColors, setCourseColors] = useState(getStoredCourseColors);
    
    // Pestaña de componente en el sandbox de la derecha
    const [previewTab, setPreviewTab] = useState('course'); // 'course' | 'lessons' | 'rewards'
    
    const [savedToast, setSavedToast] = useState(false);

    // Aplicar tokens a CSS variables en tiempo real
    const applyTokensToDOM = (themeMode, tok, cColors) => {
        const root = document.documentElement;
        
        const resolvedTheme = themeMode === 'system' 
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : themeMode;
            
        root.setAttribute('data-theme', resolvedTheme);
        
        root.style.setProperty('--accent-primary', tok.accent);
        root.style.setProperty('--color-success', tok.success);
        root.style.setProperty('--color-warning', tok.warning);
        root.style.setProperty('--color-rewards', tok.rewards);
        root.style.setProperty('--color-streak', tok.streak);
        
        if (resolvedTheme === 'dark') {
            root.style.setProperty('--bg-primary', tok.bgDark);
        } else {
            root.style.setProperty('--bg-primary', tok.bgLight);
        }
    };

    useEffect(() => {
        applyTokensToDOM(selectedTheme, tokens, courseColors);
    }, [selectedTheme, tokens, courseColors]);

    const handleApplyPreset = (preset) => {
        setTokens({
            accent: preset.accent,
            success: preset.success,
            warning: preset.warning,
            rewards: preset.rewards,
            streak: preset.streak,
            bgDark: preset.bgDark,
            bgLight: preset.bgLight
        });
        setCourseColors(preset.courses);
        applyTokensToDOM(selectedTheme, preset, preset.courses);
    };

    const handleTokenChange = (key, value) => {
        setTokens(prev => ({ ...prev, [key]: value }));
    };

    const handleCourseColorChange = (abbr, value) => {
        setCourseColors(prev => ({ ...prev, [abbr]: value }));
    };

    const handleSaveAll = () => {
        localStorage.setItem('saberlab-theme', selectedTheme);
        localStorage.setItem('saberlab-theme-tokens', JSON.stringify(tokens));
        localStorage.setItem('saberlab-accent-color', tokens.accent);
        localStorage.setItem('saberlab-course-colors', JSON.stringify(courseColors));
        
        applyTokensToDOM(selectedTheme, tokens, courseColors);
        window.dispatchEvent(new Event('storage'));
        
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 3000);
    };

    const handleResetToDefaults = () => {
        setSelectedTheme('dark');
        setTokens(DEFAULT_TOKENS);
        setCourseColors(DEFAULT_COURSE_COLORS);
        
        localStorage.removeItem('saberlab-theme-tokens');
        localStorage.removeItem('saberlab-course-colors');
        localStorage.removeItem('saberlab-accent-color');
        localStorage.setItem('saberlab-theme', 'dark');
        
        applyTokensToDOM('dark', DEFAULT_TOKENS, DEFAULT_COURSE_COLORS);
        window.dispatchEvent(new Event('storage'));
        
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2500);
    };

    const activeCourseDef = COURSES_DEFINITION.find(c => c.abbr === selectedCourse) || COURSES_DEFINITION[0];
    const activeCourseColor = selectedCourse === 'GLOBAL' 
        ? tokens.accent 
        : (courseColors[selectedCourse] || activeCourseDef?.color || tokens.accent);

    return (
        <div className="settings-page">
            {/* Header */}
            <div className="page-header purple">
                <div className="header-title">
                    <Palette size={28} className="text-gradient" />
                    <div>
                        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Color Studio & Personalización Visual</h1>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Flujo paso a paso para configurar cursos, modos y paletas en tiempo real.
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" onClick={handleResetToDefaults}>
                        <RotateCcw size={16} />
                        Restablecer a Fábrica
                    </button>
                    <button className="btn btn-primary" onClick={handleSaveAll} style={{ background: tokens.accent, color: '#0f172a', fontWeight: 800 }}>
                        <Save size={16} />
                        Guardar Cambios
                    </button>
                </div>
            </div>

            {/* Toast feedback */}
            {savedToast && (
                <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '0.85rem 1.5rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontWeight: 700,
                    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    <Check size={20} />
                    ¡Configuración guardada y aplicada con éxito en SaberLab!
                </div>
            )}

            {/* ── FLUJO PASO A PASO EN 3 NIVELES ── */}

            {/* PASO 1: SELECCIONAR CURSO A AFECTAR (RESUMIDO CON ICONO Y ABBR) */}
            <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                        color: '#0f172a',
                        fontWeight: 900,
                        fontSize: '0.82rem',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        letterSpacing: '0.5px'
                    }}>
                        PASO 1
                    </span>
                    <h2 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--text-primary)' }}>
                        Selecciona el Curso a Afectar
                    </h2>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {COURSES_DEFINITION.map(course => {
                        const isSelected = selectedCourse === course.abbr;
                        const color = courseColors[course.abbr] || course.color || '#38bdf8';
                        return (
                            <button
                                key={course.abbr}
                                onClick={() => setSelectedCourse(course.abbr)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '0.55rem 1.15rem',
                                    borderRadius: '12px',
                                    background: isSelected ? `${color}25` : 'var(--bg-secondary)',
                                    border: `2px solid ${isSelected ? color : 'var(--glass-border)'}`,
                                    color: isSelected ? (selectedTheme === 'light' ? '#0f172a' : color) : 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontWeight: 800,
                                    fontSize: '0.92rem',
                                    boxShadow: isSelected ? `0 4px 14px ${color}35` : 'none',
                                    transition: 'all 0.18s ease'
                                }}
                                title={`${course.name} (${course.abbr})`}
                            >
                                <span style={{ color: color, display: 'flex', alignItems: 'center' }}>
                                    {course.icon || (course.abbr === 'EE' ? <Zap size={18} /> : <Bot size={18} />)}
                                </span>
                                <span>{course.abbr}</span>
                                {isSelected && <CheckCircle2 size={16} color={color} />}
                            </button>
                        );
                    })}

                    {/* Botón Global */}
                    <button
                        onClick={() => setSelectedCourse('GLOBAL')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0.55rem 1.15rem',
                            borderRadius: '12px',
                            background: selectedCourse === 'GLOBAL' ? `${tokens.accent}25` : 'var(--bg-secondary)',
                            border: `2px solid ${selectedCourse === 'GLOBAL' ? tokens.accent : 'var(--glass-border)'}`,
                            color: selectedCourse === 'GLOBAL' ? (selectedTheme === 'light' ? '#0f172a' : tokens.accent) : 'var(--text-primary)',
                            cursor: 'pointer',
                            fontWeight: 800,
                            fontSize: '0.92rem',
                            boxShadow: selectedCourse === 'GLOBAL' ? `0 4px 14px ${tokens.accent}35` : 'none',
                            transition: 'all 0.18s ease'
                        }}
                        title="Toda la Plataforma (Global)"
                    >
                        <Globe size={18} color={tokens.accent} />
                        <span>Global</span>
                        {selectedCourse === 'GLOBAL' && <CheckCircle2 size={16} color={tokens.accent} />}
                    </button>
                </div>
            </div>

            {/* PASO 2: SELECCIONAR MODO CLARO U OSCURO */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        letterSpacing: '0.5px'
                    }}>
                        PASO 2
                    </span>
                    <div>
                        <h2 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-primary)' }}>
                            Selecciona el Modo Visual a Modificar
                        </h2>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            Alterna entre Claro y Oscuro para afinar el contraste exacto.
                        </span>
                    </div>
                </div>

                <div className="theme-selector" style={{ display: 'flex', gap: '0.65rem' }}>
                    <button
                        className={`theme-btn ${selectedTheme === 'dark' ? 'active' : ''}`}
                        onClick={() => setSelectedTheme('dark')}
                        style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem', fontWeight: 800 }}
                    >
                        <Moon size={18} />
                        <span>Modo Oscuro</span>
                    </button>
                    <button
                        className={`theme-btn ${selectedTheme === 'light' ? 'active' : ''}`}
                        onClick={() => setSelectedTheme('light')}
                        style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem', fontWeight: 800 }}
                    >
                        <Sun size={18} />
                        <span>Modo Claro</span>
                    </button>
                    <button
                        className={`theme-btn ${selectedTheme === 'system' ? 'active' : ''}`}
                        onClick={() => setSelectedTheme('system')}
                        style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem', fontWeight: 800 }}
                    >
                        <Smartphone size={18} />
                        <span>Sistema</span>
                    </button>
                </div>
            </div>

            {/* PASO 3: APLICAR Y AJUSTAR LOS COLORES (GRID DE 2 COLUMNAS) */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        letterSpacing: '0.5px'
                    }}>
                        PASO 3
                    </span>
                    <div>
                        <h2 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-primary)' }}>
                            Personaliza los Colores para {selectedCourse === 'GLOBAL' ? 'la Plataforma' : activeCourseDef.name} ({selectedTheme === 'light' ? 'Modo Claro' : 'Modo Oscuro'})
                        </h2>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            Ajusta el color principal, los tokens de estado o aplica un tema predefinido.
                        </span>
                    </div>
                </div>

                <div className="settings-studio-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                    
                    {/* Controles de Color */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        
                        {/* 1. Color Principal del Curso o Acento Global */}
                        {selectedCourse !== 'GLOBAL' ? (
                            <ColorControlRow
                                label={`Color Principal de ${activeCourseDef.name}`}
                                desc="Bordes de tarjeta, botones de inicio, insignias y progreso"
                                value={courseColors[selectedCourse] || activeCourseDef.color || '#38bdf8'}
                                onChange={(val) => handleCourseColorChange(selectedCourse, val)}
                                swatches={COLOR_SWATCHES}
                            />
                        ) : (
                            <ColorControlRow
                                label="Color de Acento Principal Global"
                                desc="Botones primarios, enlaces activos y foco de navegación"
                                value={tokens.accent}
                                onChange={(val) => handleTokenChange('accent', val)}
                                swatches={COLOR_SWATCHES}
                            />
                        )}

                        {/* 2. Tokens de Estado y Pedagogía */}
                        <ColorControlRow
                            label="Completado & Aprobado (Éxito)"
                            desc="Chulitos de lección completada, barras de progreso y retos listos"
                            value={tokens.success}
                            onChange={(val) => handleTokenChange('success', val)}
                            swatches={COLOR_SWATCHES}
                        />

                        <ColorControlRow
                            label="Exámenes & Evaluaciones Oficiales"
                            desc="Insignias de examen, fechas de evaluación y puntajes"
                            value={tokens.warning}
                            onChange={(val) => handleTokenChange('warning', val)}
                            swatches={COLOR_SWATCHES}
                        />

                        <ColorControlRow
                            label="Bóveda de Recompensas & Trofeos"
                            desc="Copas, medallas de simulador y trofeos ganados"
                            value={tokens.rewards}
                            onChange={(val) => handleTokenChange('rewards', val)}
                            swatches={COLOR_SWATCHES}
                        />

                        <ColorControlRow
                            label="Racha de Estudio & Constancia"
                            desc="Fuego animado y contador de días consecutivos"
                            value={tokens.streak}
                            onChange={(val) => handleTokenChange('streak', val)}
                            swatches={COLOR_SWATCHES}
                        />

                        {/* Presets Rápidos de 1 Clic */}
                        <div style={{
                            padding: '1.1rem',
                            borderRadius: '12px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--glass-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem'
                        }}>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                ⚡ O aplica una Paleta Completa Predefinida:
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
                                {THEME_PRESETS.map(preset => (
                                    <button
                                        key={preset.id}
                                        onClick={() => handleApplyPreset(preset)}
                                        style={{
                                            padding: '0.6rem 0.8rem',
                                            borderRadius: '8px',
                                            border: `1px solid ${tokens.accent === preset.accent ? preset.accent : 'var(--glass-border)'}`,
                                            background: tokens.accent === preset.accent ? `${preset.accent}20` : 'transparent',
                                            color: 'var(--text-primary)',
                                            fontWeight: 700,
                                            fontSize: '0.78rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: preset.accent }} />
                                        <span>{preset.name.split(' ')[1] || preset.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Previsualizador en Vivo Sincronizado */}
                    <div style={{ position: 'sticky', top: '1rem', height: 'fit-content' }}>
                        <div style={{
                            background: selectedTheme === 'light' ? '#f1f5f9' : '#0f172a',
                            border: `1.5px solid ${selectedTheme === 'light' ? 'rgba(203,213,225,0.9)' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '20px',
                            padding: '1.4rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.1rem',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                            transition: 'all 0.25s ease'
                        }}>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: selectedTheme === 'light' ? '#0f172a' : '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Sparkles size={16} color={activeCourseColor} />
                                        Previsualizador en Vivo
                                    </div>
                                    <span style={{ fontSize: '0.74rem', color: selectedTheme === 'light' ? '#64748b' : '#94a3b8' }}>
                                        Mostrando: <strong>{selectedCourse === 'GLOBAL' ? 'Plataforma' : activeCourseDef.name}</strong> en <strong>{selectedTheme === 'light' ? 'Modo Claro' : 'Modo Oscuro'}</strong>
                                    </span>
                                </div>
                            </div>

                            {/* Pestañitas de componentes */}
                            <div style={{ display: 'flex', gap: '4px', borderBottom: `1px solid ${selectedTheme === 'light' ? 'rgba(203,213,225,0.8)' : 'rgba(255,255,255,0.1)'}`, paddingBottom: '0.4rem' }}>
                                <button
                                    onClick={() => setPreviewTab('course')}
                                    style={{
                                        border: 'none',
                                        background: previewTab === 'course' ? `${activeCourseColor}25` : 'transparent',
                                        color: previewTab === 'course' ? (selectedTheme === 'light' ? '#0f172a' : activeCourseColor) : (selectedTheme === 'light' ? '#64748b' : '#94a3b8'),
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontWeight: 800,
                                        fontSize: '0.78rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Tarjeta Curso
                                </button>
                                <button
                                    onClick={() => setPreviewTab('lessons')}
                                    style={{
                                        border: 'none',
                                        background: previewTab === 'lessons' ? `${activeCourseColor}25` : 'transparent',
                                        color: previewTab === 'lessons' ? (selectedTheme === 'light' ? '#0f172a' : activeCourseColor) : (selectedTheme === 'light' ? '#64748b' : '#94a3b8'),
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontWeight: 800,
                                        fontSize: '0.78rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Lecciones & Examen
                                </button>
                                <button
                                    onClick={() => setPreviewTab('rewards')}
                                    style={{
                                        border: 'none',
                                        background: previewTab === 'rewards' ? `${activeCourseColor}25` : 'transparent',
                                        color: previewTab === 'rewards' ? (selectedTheme === 'light' ? '#0f172a' : activeCourseColor) : (selectedTheme === 'light' ? '#64748b' : '#94a3b8'),
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontWeight: 800,
                                        fontSize: '0.78rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Recompensas
                                </button>
                            </div>

                            {/* Racha / KPI */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.6rem 0.9rem',
                                background: selectedTheme === 'light' ? '#ffffff' : 'rgba(15, 23, 42, 0.8)',
                                borderRadius: '10px',
                                border: `1px solid ${selectedTheme === 'light' ? 'rgba(226,232,240,0.9)' : 'rgba(255,255,255,0.08)'}`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Flame size={18} color={tokens.streak} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: selectedTheme === 'light' ? '#0f172a' : '#f8fafc' }}>
                                        Racha: 5 días
                                    </span>
                                </div>
                                <span style={{ fontSize: '0.72rem', color: tokens.streak, fontWeight: 800, background: `${tokens.streak}20`, padding: '2px 6px', borderRadius: '4px' }}>
                                    🔥 En Fuego
                                </span>
                            </div>

                            {/* TAB 1: TARJETA DE CURSO */}
                            {previewTab === 'course' && (
                                <div style={{
                                    background: selectedTheme === 'light' ? '#ffffff' : 'rgba(15, 23, 42, 0.9)',
                                    border: `2px solid ${activeCourseColor}`,
                                    borderRadius: '16px',
                                    padding: '1.2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.9rem',
                                    boxShadow: selectedTheme === 'light' ? '0 4px 15px rgba(15,23,42,0.06)' : `0 8px 24px ${activeCourseColor}20`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: `${activeCourseColor}25`, color: activeCourseColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {activeCourseDef.abbr === 'EE' ? <Zap size={18} /> : <Bot size={18} />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: selectedTheme === 'light' ? '#0f172a' : '#f8fafc' }}>
                                                    {activeCourseDef.name}
                                                </div>
                                                <span style={{ fontSize: '0.72rem', color: selectedTheme === 'light' ? '#64748b' : '#94a3b8' }}>
                                                    Docente: {activeCourseDef.teacher}
                                                </span>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: `${activeCourseColor}20`, color: activeCourseColor }}>
                                            {activeCourseDef.abbr}
                                        </span>
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                            <span style={{ color: selectedTheme === 'light' ? '#475569' : '#cbd5e1' }}>Progreso del Curso</span>
                                            <strong style={{ color: activeCourseColor }}>60%</strong>
                                        </div>
                                        <div style={{ height: '6px', borderRadius: '3px', background: selectedTheme === 'light' ? 'rgba(203,213,225,0.6)' : 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                            <div style={{ width: '60%', height: '100%', background: activeCourseColor, borderRadius: '3px' }} />
                                        </div>
                                    </div>

                                    <button style={{
                                        width: '100%',
                                        padding: '0.65rem',
                                        borderRadius: '10px',
                                        background: activeCourseColor,
                                        color: '#0f172a',
                                        border: 'none',
                                        fontWeight: 800,
                                        fontSize: '0.84rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}>
                                        <Play size={14} fill="#0f172a" />
                                        <span>Comenzar Lección</span>
                                    </button>
                                </div>
                            )}

                            {/* TAB 2: LECCIONES & EXAMEN */}
                            {previewTab === 'lessons' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.7rem 0.9rem',
                                        background: selectedTheme === 'light' ? '#ffffff' : 'rgba(15, 23, 42, 0.8)',
                                        borderRadius: '10px',
                                        border: `1px solid ${selectedTheme === 'light' ? 'rgba(226,232,240,0.9)' : 'rgba(255,255,255,0.08)'}`
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `${tokens.success}20`, color: tokens.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CheckCircle size={14} />
                                            </div>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: selectedTheme === 'light' ? '#0f172a' : '#f8fafc' }}>
                                                1. Ley de Ohm y Watt
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: tokens.success, background: `${tokens.success}15`, padding: '2px 6px', borderRadius: '4px' }}>
                                            Repasar
                                        </span>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.7rem 0.9rem',
                                        background: `${tokens.warning}12`,
                                        borderRadius: '10px',
                                        border: `1px solid ${tokens.warning}40`
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `${tokens.warning}20`, color: tokens.warning, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Award size={14} />
                                            </div>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: selectedTheme === 'light' ? '#0f172a' : '#f8fafc' }}>
                                                Examen 1 - Fundamentos
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: tokens.warning, background: `${tokens.warning}20`, padding: '2px 6px', borderRadius: '4px' }}>
                                            150 pts
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: RECOMPENSAS */}
                            {previewTab === 'rewards' && (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: '1.2rem',
                                    background: selectedTheme === 'light' ? '#ffffff' : 'rgba(15, 23, 42, 0.8)',
                                    borderRadius: '14px',
                                    border: `1.5px solid ${tokens.rewards}50`,
                                    gap: '0.6rem',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        width: '54px',
                                        height: '54px',
                                        borderRadius: '50%',
                                        background: `radial-gradient(circle, ${tokens.rewards}35 0%, transparent 80%)`,
                                        border: `2px solid ${tokens.rewards}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: tokens.rewards,
                                        boxShadow: `0 0 16px ${tokens.rewards}40`
                                    }}>
                                        <Trophy size={26} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: selectedTheme === 'light' ? '#0f172a' : '#f8fafc' }}>
                                            Multímetro Virtual Digital
                                        </div>
                                        <span style={{ fontSize: '0.72rem', color: selectedTheme === 'light' ? '#64748b' : '#94a3b8' }}>
                                            Herramienta desbloqueada en Lección 2
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: tokens.rewards, background: `${tokens.rewards}18`, padding: '3px 10px', borderRadius: '6px' }}>
                                        Abrir Instrumento ➔
                                    </span>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

// Componente de fila de control de color individual
function ColorControlRow({ label, desc, value, onChange, swatches }) {
    return (
        <div style={{
            padding: '1rem',
            borderRadius: '12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        style={{ width: '34px', height: '34px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                    />
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {value}
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {swatches.map(hex => (
                    <button
                        key={hex}
                        onClick={() => onChange(hex)}
                        style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '5px',
                            background: hex,
                            border: value === hex ? '2px solid white' : '1px solid rgba(0,0,0,0.2)',
                            cursor: 'pointer',
                            boxShadow: value === hex ? `0 0 8px ${hex}` : 'none'
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export default SettingsPage;
