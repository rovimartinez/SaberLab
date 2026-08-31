import { BookOpen, Flame, Layers, RefreshCcw } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import IdCard from '../components/profile/IdCard';
import { getRankByLessons, getNextRank, ranks } from '../data/ranksData';
import '../styles/PanelPerfil.css';

export default function PanelPerfil({ variant = 'page' }) {
    const { user, profile, enrolledCourses, userProgress } = useAuth();

    const lessonsCompleted = userProgress?.lessons_completed || 0;
    const streakDays = userProgress?.streak_days || 0;

    const rank = getRankByLessons(lessonsCompleted);
    const nextRank = getNextRank(lessonsCompleted);
    const lessonsToNextRank = nextRank ? nextRank.minLessons - lessonsCompleted : 0;

    const stats = [
        {
            icon: BookOpen,
            label: 'Lecciones completadas',
            value: lessonsCompleted,
            color: rank.color,
            detail: nextRank ? `${lessonsToNextRank} para desbloquear ${nextRank.name}` : 'Rango maximo desbloqueado',
        },
        {
            icon: Flame,
            label: 'Racha de dias',
            value: streakDays,
            color: '#f97316',
            detail: streakDays === 1 ? 'dia seguido' : 'dias seguidos',
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
            <div className="perfil-left">
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
            </div>

            <div className="perfil-right">
                <div className="perfil-stats-panel">
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

                <div className="perfil-ranks-card">
                    <h3>Sistema de Rangos</h3>
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
                                    <div>
                                        <div className="perfil-rank-item-name" style={{ color: isCurrent ? r.color : undefined }}>
                                            {r.name}
                                        </div>
                                        <div className="perfil-rank-item-req">
                                            {r.minLessons === 0 ? 'Inicial' : `${r.minLessons}+ lecciones`}
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
