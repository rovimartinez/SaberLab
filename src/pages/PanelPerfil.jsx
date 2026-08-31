import { useState, useEffect } from 'react';
import { BookOpen, Flame, Layers, User, Mail, Shield, School, CheckCircle2, Edit3, Check, X, Palette, Moon, Sun, Smartphone, Sparkles, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { getRankByLessons, getNextRank, ranks } from '../data/ranksData';
import { api } from '../lib/api';
import '../styles/PanelPerfil.css';

const getStoredTheme = () => {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem('saberlab-theme') || localStorage.getItem('theme');
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'dark';
};

const getResolvedTheme = (t) => {
    if (t === 'system' && typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return t;
};

export default function PanelPerfil({ variant = 'page' }) {
    const { user, profile, enrolledCourses, userProgress } = useAuth();

    const [theme, setTheme] = useState(getStoredTheme);
    const [editingName, setEditingName] = useState(false);
    const [fullNameInput, setFullNameInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        const resolved = getResolvedTheme(theme);
        document.documentElement.setAttribute('data-theme', resolved);
        localStorage.setItem('saberlab-theme', theme);
        localStorage.setItem('theme', theme);

        if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            };
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    const lessonsCompleted = userProgress?.lessons_completed || 0;
    const streakDays = userProgress?.streak_days || 0;

    const rank = getRankByLessons(lessonsCompleted);
    const nextRank = getNextRank(lessonsCompleted);
    const lessonsToNextRank = nextRank ? nextRank.minLessons - lessonsCompleted : 0;

    // Calcular porcentaje al siguiente rango
    const currentMin = rank.minLessons || 0;
    const nextMin = nextRank?.minLessons || currentMin + 10;
    const rankProgress = nextRank 
        ? Math.min(100, Math.max(0, Math.round(((lessonsCompleted - currentMin) / (nextMin - currentMin)) * 100)))
        : 100;

    const userMetadata = user?.user_metadata || {};
    const avatarUrl = profile?.avatar_url || userMetadata.avatar_url;
    const googleName = userMetadata.name || userMetadata.full_name || '';
    const firstName = profile?.first_name || userMetadata.given_name || googleName.split(' ')[0] || '';
    const lastName = profile?.last_name || userMetadata.family_name || googleName.split(' ').slice(1).join(' ') || '';
    const currentFullName = (firstName && lastName) ? `${firstName} ${lastName}` : profile?.full_name || googleName || user?.email?.split('@')[0] || 'Estudiante';
    const displayEmail = profile?.email || user?.email || '';
    const role = profile?.role || 'student';
    const roleLabel = role === 'admin' ? 'Administrador' : role === 'teacher' || role === 'docente' || role === 'profesor' ? 'Docente' : 'Estudiante';
    const roleClass = role === 'admin' ? 'admin' : role === 'teacher' || role === 'docente' || role === 'profesor' ? 'teacher' : 'student';

    const handleSaveName = async () => {
        if (!fullNameInput.trim()) return;
        setSaving(true);
        try {
            const { data } = await api('/profile', {
                method: 'PUT',
                body: JSON.stringify({ full_name: fullNameInput.trim() })
            });
            if (data?.success) {
                setSaveSuccess(true);
                setEditingName(false);
                if (profile) profile.full_name = fullNameInput.trim();
                setTimeout(() => setSaveSuccess(false), 3500);
            }
        } catch (err) {
            console.error('Error al guardar nombre:', err);
        } finally {
            setSaving(false);
        }
    };

    const stats = [
        {
            icon: BookOpen,
            label: 'Lecciones completadas',
            value: lessonsCompleted,
            color: rank.color,
            detail: nextRank ? `${lessonsToNextRank} para ${nextRank.name}` : 'Rango máximo alcanzado',
        },
        {
            icon: Flame,
            label: 'Racha de días',
            value: streakDays,
            color: '#f97316',
            detail: streakDays === 1 ? 'día seguido' : 'días seguidos',
        },
        {
            icon: Layers,
            label: 'Cursos activos',
            value: enrolledCourses.length,
            color: '#3b82f6',
            detail: enrolledCourses.length === 1 ? 'curso inscrito' : 'cursos inscritos',
        },
    ];

    return (
        <div className={`perfil-page ${variant === 'floating' ? 'perfil-page-floating' : ''}`}>
            {/* ── Columna Izquierda: Tarjeta de Perfil Unificada & Apariencia ── */}
            <div className="perfil-left">
                {/* Tarjeta Principal de Usuario */}
                <div className="perfil-user-card">
                    {/* Header con Banner decorativo */}
                    <div className="perfil-card-banner" style={{ background: `linear-gradient(135deg, ${rank.color}33 0%, rgba(56,189,248,0.15) 100%)` }}>
                        <div className="perfil-rank-badge-top" style={{ borderColor: `${rank.color}60`, color: rank.color }}>
                            <span>{rank.emoji}</span>
                            <span>{rank.name}</span>
                        </div>
                    </div>

                    <div className="perfil-card-body">
                        {/* Avatar con Anillo de Rango */}
                        <div className="perfil-avatar-wrapper">
                            <div className="perfil-avatar-ring" style={{ borderColor: rank.color, boxShadow: `0 0 20px ${rank.color}40` }}>
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={currentFullName}
                                        referrerPolicy="no-referrer"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="perfil-avatar-fallback" style={{ background: `${rank.color}25`, color: rank.color }}>
                                        {currentFullName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Nombre y Edición Inline */}
                        <div className="perfil-name-section">
                            {editingName ? (
                                <div className="perfil-edit-row">
                                    <input
                                        type="text"
                                        value={fullNameInput}
                                        onChange={(e) => setFullNameInput(e.target.value)}
                                        className="perfil-input"
                                        placeholder="Ingresa tu nombre"
                                        autoFocus
                                    />
                                    <button
                                        className="perfil-btn-action save"
                                        onClick={handleSaveName}
                                        disabled={saving || !fullNameInput.trim()}
                                        title="Guardar nombre"
                                    >
                                        {saving ? '...' : <Check size={14} />}
                                    </button>
                                    <button
                                        className="perfil-btn-action cancel"
                                        onClick={() => setEditingName(false)}
                                        title="Cancelar"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="perfil-name-row">
                                    <h2>{currentFullName}</h2>
                                    <button
                                        className="perfil-edit-btn"
                                        onClick={() => { setFullNameInput(currentFullName); setEditingName(true); }}
                                        title="Editar nombre"
                                    >
                                        <Edit3 size={15} />
                                    </button>
                                </div>
                            )}
                            {saveSuccess && <span className="perfil-saved-msg">✓ Guardado en tu cuenta</span>}
                        </div>

                        {/* Badges de Rol y Estado */}
                        <div className="perfil-badges-row">
                            <span className={`perfil-role-badge ${roleClass}`}>
                                <Shield size={12} /> {roleLabel}
                            </span>
                            <span className="perfil-status-badge">
                                <CheckCircle2 size={12} /> Activo
                            </span>
                        </div>

                        <div className="perfil-divider"></div>

                        {/* Detalles de la Cuenta */}
                        <div className="perfil-details-list">
                            <div className="perfil-detail-item">
                                <span className="perfil-detail-label">Correo</span>
                                <div className="perfil-detail-val">
                                    <Mail size={14} color="#38bdf8" />
                                    <span className="truncate">{displayEmail}</span>
                                </div>
                            </div>

                            <div className="perfil-detail-item">
                                <span className="perfil-detail-label">Institución</span>
                                <div className="perfil-detail-val">
                                    <School size={14} color="#a855f7" />
                                    <span>Universidad del Magdalena</span>
                                </div>
                            </div>

                            <div className="perfil-detail-item">
                                <span className="perfil-detail-label">{enrolledCourses.length > 1 ? 'Cursos Activos' : 'Curso Activo'}</span>
                                <div className="perfil-courses-stack">
                                    {(enrolledCourses && enrolledCourses.length > 0 
                                        ? enrolledCourses 
                                        : [{ title: 'Electricidad y Electrónica' }]
                                    ).map((course, idx) => (
                                        <div key={course.id || course.slug || idx} className="perfil-detail-val">
                                            <GraduationCap size={14} color="#facc15" />
                                            <span>{course.title || course.name || course.course_name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Tarjeta de Apariencia & Tema ── */}
                <div className="perfil-account-card perfil-theme-card">
                    <div className="perfil-section-header">
                        <Palette size={18} color="#38bdf8" />
                        <h3>Apariencia & Tema</h3>
                    </div>
                    <p className="perfil-theme-desc">
                        Personaliza cómo se ve la plataforma en tu dispositivo.
                    </p>
                    <div className="perfil-theme-buttons">
                        <button
                            type="button"
                            className={`perfil-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                            onClick={() => setTheme('dark')}
                        >
                            <Moon size={18} />
                            <span>Oscuro</span>
                        </button>
                        <button
                            type="button"
                            className={`perfil-theme-btn ${theme === 'light' ? 'active' : ''}`}
                            onClick={() => setTheme('light')}
                        >
                            <Sun size={18} />
                            <span>Claro</span>
                        </button>
                        <button
                            type="button"
                            className={`perfil-theme-btn ${theme === 'system' ? 'active' : ''}`}
                            onClick={() => setTheme('system')}
                        >
                            <Smartphone size={18} />
                            <span>Sistema</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Columna Derecha: Estadísticas & Sistema de Rangos ── */}
            <div className="perfil-right">
                {/* Panel de Estadísticas y Progreso de Rango */}
                <div className="perfil-stats-panel">
                    <div className="perfil-stats-header">
                        <div className="perfil-progress-title">
                            <Sparkles size={18} color={rank.color} />
                            <h3>Progreso y Nivel Académico</h3>
                        </div>
                        {nextRank && (
                            <span className="perfil-next-rank-badge" style={{ color: nextRank.color }}>
                                Siguiente: {nextRank.emoji} {nextRank.name} ({lessonsToNextRank} restantes)
                            </span>
                        )}
                    </div>

                    {/* Barra de progreso hacia el siguiente rango */}
                    {nextRank && (
                        <div className="perfil-rank-progress-bar-container">
                            <div className="perfil-rank-progress-bar-fill" style={{ width: `${rankProgress}%`, background: rank.gradient || rank.color }} />
                        </div>
                    )}

                    <div className="perfil-stats-grid">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="perfil-stat-card">
                                    <div
                                        className="perfil-stat-icon"
                                        style={{ background: `${stat.color}18`, color: stat.color }}
                                    >
                                        <Icon size={20} />
                                    </div>
                                    <div className="perfil-stat-value" style={{ color: stat.color }}>
                                        {stat.value}
                                    </div>
                                    <div className="perfil-stat-label">{stat.label}</div>
                                    <div className="perfil-stat-detail">{stat.detail}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sistema de Rangos */}
                <div className="perfil-ranks-card">
                    <h3>Sistema de Rangos y Logros</h3>
                    <div className="perfil-ranks-list">
                        {ranks.map((r) => {
                            const isCurrent = r.name === rank.name;
                            const isAchieved = lessonsCompleted >= r.minLessons && !isCurrent;

                            return (
                                <div
                                    key={r.name}
                                    className={`perfil-rank-item ${isCurrent ? 'current' : isAchieved ? 'achieved' : 'locked'}`}
                                >
                                    <span className="perfil-rank-item-emoji">{r.emoji}</span>
                                    <div style={{ flex: 1 }}>
                                        <div className="perfil-rank-item-name" style={{ color: isCurrent ? r.color : undefined }}>
                                            {r.name}
                                        </div>
                                        <div className="perfil-rank-item-req">
                                            {r.minLessons === 0 ? 'Rango Inicial' : `${r.minLessons}+ lecciones completadas`}
                                        </div>
                                    </div>
                                    <span className={`perfil-rank-item-badge ${isCurrent ? 'current' : isAchieved ? 'achieved' : 'locked'}`}>
                                        {isCurrent ? 'Actual' : isAchieved ? 'Logrado' : 'Bloqueado'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
