import React from 'react';
import { Activity } from 'lucide-react';

export const StudyModalContent = ({
    totalWeeklyHours,
    weeklyGoalHours,
    weeklyGoalPercent,
    weeklyActivity,
    maxHours,
    practiceMins,
    practicePercent,
    theoryMins,
    theoryPercent,
    formatMins,
    streakDays
}) => {
    return (
        <>
            <div className="next-mission-box" style={{ padding: '1rem', borderLeftColor: '#0ea5e9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-heading)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Activity size={16} color="#0ea5e9" /> Meta Semanal de Estudio
                    </span>
                    <span className="goal-status-badge">
                        🎯 {totalWeeklyHours}h / {weeklyGoalHours}h ({weeklyGoalPercent}%)
                    </span>
                </div>
                <div className="progress-bar-bg" style={{ height: '8px' }}>
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, weeklyGoalPercent)}%`, background: '#0ea5e9' }} />
                </div>
            </div>

            {/* Gráfico Semanal Claro */}
            <div className="weekly-bars-grid">
                {weeklyActivity.map((d, i) => (
                    <div key={i} className="bar-column">
                        <div className="bar-track">
                            <div 
                                className={`bar-solid-fill ${d.hours === 0 ? 'empty' : ''} ${d.isToday ? 'today' : ''}`}
                                style={{ height: d.hours === 0 ? '6px' : `${Math.round((d.hours / maxHours) * 100)}%` }}
                                title={`${d.day}: ${d.hours}h`}
                            >
                                {d.hours > 0 && <span className="bar-tag-hours">{d.hours}h</span>}
                            </div>
                        </div>
                        <span className={`bar-day-name ${d.isToday ? 'today' : ''}`}>
                            {d.isToday ? `${d.day} (Hoy)` : d.day}
                        </span>
                    </div>
                ))}
            </div>

            {/* Desglose Práctica vs Teoría */}
            <div className="study-telemetry-row">
                <div className="telemetry-box">
                    <span className="telemetry-icon">🧪</span>
                    <div>
                        <div className="telemetry-num" style={{ color: '#38bdf8' }}>
                            {formatMins(practiceMins)} ({practicePercent}%)
                        </div>
                        <div className="telemetry-label">Laboratorios y Simulador</div>
                    </div>
                </div>
                <div className="telemetry-box">
                    <span className="telemetry-icon">📖</span>
                    <div>
                        <div className="telemetry-num" style={{ color: '#a855f7' }}>
                            {formatMins(theoryMins)} ({theoryPercent}%)
                        </div>
                        <div className="telemetry-label">Teoría y Retos Prácticos</div>
                    </div>
                </div>
            </div>

            <div className="rank-footer-desc">
                <span>🔥 Racha activa: <strong>{streakDays} días seguidos</strong> de dedicación continua en SaberLab.</span>
            </div>
        </>
    );
};

export default StudyModalContent;
