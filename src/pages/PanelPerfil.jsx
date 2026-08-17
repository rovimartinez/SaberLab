import { BookOpen, Flame, Award, Layers, RefreshCcw } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import IdCard from '../components/profile/IdCard';
import { getRankByLessons, getNextRank, getRankProgress, ranks } from '../data/ranksData';
import '../styles/PanelPerfil.css';

export default function PanelPerfil() {
    const { user, profile, enrolledCourses, userProgress } = useAuth();

    const lessonsCompleted = userProgress?.lessons_completed || 0;
    const streakDays       = userProgress?.streak_days || 0;
    const certificates     = userProgress?.certificates || 0;

    const rank        = getRankByLessons(lessonsCompleted);
    const nextRank    = getNextRank(lessonsCompleted);
    const rankPercent = getRankProgress(lessonsCompleted);

    const stats = [
        { emoji: '📚', label: 'Lecciones completadas', value: lessonsCompleted, color: '#a855f7' },
        { emoji: '🔥', label: 'Racha de días',         value: streakDays,       color: '#f97316' },
        { emoji: '🎓', label: 'Cursos activos',        value: enrolledCourses.length, color: '#3b82f6' },
        { emoji: '📜', label: 'Certificados',          value: certificates,     color: '#10b981' },
    ];

    return (
        <div className="perfil-page">
            {/* ── Columna izquierda ── */}
            <div className="perfil-left">
                {/* IdCard 3D */}
                <div className="perfil-card-section">
                    <IdCard
                        user={user}
                        profile={profile}
                        lessonsCompleted={lessonsCompleted}
                    />
                    <p className="perfil-card-hint">
                        <RefreshCcw size={12} /> Haz clic en la tarjeta para girarla
                    </p>
                </div>

                {/* Rango actual + progreso */}
                <div className="perfil-rank-section">
                    <div className="perfil-rank-header">
                        <span className="perfil-rank-emoji">{rank.emoji}</span>
                        <div>
                            <div className="perfil-rank-name" style={{ color: rank.color }}>
                                {rank.name}
                            </div>
                            <p className="perfil-rank-desc">{rank.description}</p>
                        </div>
                    </div>

                    {nextRank ? (
                        <>
                            <div className="perfil-rank-progress-label">
                                <span>Hacia {nextRank.emoji} {nextRank.name}</span>
                                <span>{rankPercent}%</span>
                            </div>
                            <div className="perfil-rank-bar-bg">
                                <div
                                    className="perfil-rank-bar-fill"
                                    style={{ width: `${rankPercent}%`, background: rank.gradient }}
                                />
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                                Necesitas {nextRank.minLessons - lessonsCompleted} lecciones más
                            </div>
                        </>
                    ) : (
                        <div style={{ fontSize: '0.9rem', color: rank.color, fontWeight: 700 }}>
                            👑 ¡Has alcanzado el rango máximo!
                        </div>
                    )}
                </div>
            </div>

            {/* ── Columna derecha ── */}
            <div className="perfil-right">
                {/* Stats */}
                <div className="perfil-stats-grid">
                    {stats.map(s => (
                        <div key={s.label} className="perfil-stat-card">
                            <div className="perfil-stat-icon" style={{ background: `${s.color}18` }}>
                                {s.emoji}
                            </div>
                            <div className="perfil-stat-value" style={{ color: s.color }}>
                                {s.value}
                            </div>
                            <div className="perfil-stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Todos los rangos */}
                <div className="perfil-ranks-card">
                    <h3>🏆 Sistema de Rangos</h3>
                    <div className="perfil-ranks-list">
                        {ranks.map(r => {
                            const isCurrent  = r.name === rank.name;
                            const isAchieved = lessonsCompleted >= r.minLessons && !isCurrent;
                            const isLocked   = lessonsCompleted < r.minLessons;

                            return (
                                <div
                                    key={r.name}
                                    className={`perfil-rank-item ${isCurrent ? 'current' : isAchieved ? 'achieved' : 'locked'}`}
                                >
                                    <span className="perfil-rank-item-emoji">{r.emoji}</span>
                                    <div>
                                        <div className="perfil-rank-item-name" style={{ color: isCurrent ? r.color : undefined }}>
                                            {r.name}
                                        </div>
                                        <div className="perfil-rank-item-req">
                                            {r.minLessons === 0 ? 'Inicial' : `${r.minLessons}+ lecciones`}
                                        </div>
                                    </div>
                                    <span className={`perfil-rank-item-badge ${isCurrent ? 'current' : isAchieved ? 'achieved' : 'locked'}`}>
                                        {isCurrent ? '● Actual' : isAchieved ? '✓ Logrado' : '🔒'}
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
