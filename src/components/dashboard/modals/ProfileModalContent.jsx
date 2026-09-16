import React from 'react';
import { Sun, Moon, Monitor, Users, CheckCircle2, Check, X } from 'lucide-react';
import { COURSES_DEFINITION, getCourseColor } from '../../../data/coursesData.jsx';

export const ProfileModalContent = ({
    profile,
    fullName,
    user,
    userMetadata,
    isStaff,
    streakDays,
    lessonsCompleted,
    rank,
    activeTheme,
    handleThemeSelect,
    joinGroupCode,
    setJoinGroupCode,
    joinGroupError,
    setJoinGroupError,
    joinGroupSuccess,
    setJoinGroupSuccess,
    isJoiningGroup,
    handleJoinGroupSubmit,
    enrolledCourses
}) => {
    return (
        <>
            <div className="app-user-hero-box">
                <div className="app-user-avatar">
                    {userMetadata?.avatar_url ? (
                        <img 
                            src={userMetadata.avatar_url} 
                            alt={fullName} 
                            style={{ width: '100%', height: '100%', borderRadius: '16px', objectFit: 'cover' }} 
                        />
                    ) : (
                        <span>{(profile?.full_name || fullName || 'U')[0].toUpperCase()}</span>
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 className="app-user-name">{profile?.full_name || fullName}</h3>
                    <p className="app-user-email">{user?.email || 'Sin correo registrado'}</p>
                    <span className="app-role-pill">
                        {profile?.role === 'admin' ? '🛡️ Administrador' : isStaff ? '👨‍🏫 Docente' : '🎓 Estudiante'}
                    </span>
                </div>
            </div>

            <div className="app-stats-row">
                <div className="app-stat-chip">
                    <span className="app-stat-val" style={{ color: '#f97316' }}>🔥 {streakDays} d</span>
                    <span className="app-stat-lbl">Racha Activa</span>
                </div>
                <div className="app-stat-chip">
                    <span className="app-stat-val" style={{ color: '#38bdf8' }}>📚 {lessonsCompleted}</span>
                    <span className="app-stat-lbl">Lecciones</span>
                </div>
                <div className="app-stat-chip">
                    <span className="app-stat-val" style={{ color: rank.color }}>{rank.emoji} {rank.name}</span>
                    <span className="app-stat-lbl">Rango STEAM</span>
                </div>
            </div>

            <div className="theme-selector-box">
                <h4 className="theme-selector-title">Apariencia y Tema del Sistema</h4>
                <div className="theme-options-segmented">
                    <button
                        type="button"
                        className={`theme-option-btn ${activeTheme === 'light' ? 'active' : ''}`}
                        onClick={() => handleThemeSelect('light')}
                    >
                        <Sun size={16} />
                        <span>Claro</span>
                    </button>
                    <button
                        type="button"
                        className={`theme-option-btn ${activeTheme === 'dark' ? 'active' : ''}`}
                        onClick={() => handleThemeSelect('dark')}
                    >
                        <Moon size={16} />
                        <span>Oscuro</span>
                    </button>
                    <button
                        type="button"
                        className={`theme-option-btn ${activeTheme === 'system' ? 'active' : ''}`}
                        onClick={() => handleThemeSelect('system')}
                    >
                        <Monitor size={16} />
                        <span>Sistema</span>
                    </button>
                </div>
            </div>

            {/* ── SECCIÓN: AGREGARSE A UN GRUPO DE CURSO ── */}
            <div className="group-join-box">
                <div className="group-join-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <Users size={17} color="var(--brand-primary)" />
                        <h4 className="group-join-title">Unirse a un Grupo de Curso</h4>
                    </div>
                    <span className="group-join-badge">Código Docente</span>
                </div>
                <p className="group-join-desc">
                    Ingresa el código proporcionado por tu profesor para inscribirte en un grupo oficial de la asignatura.
                </p>

                <form onSubmit={handleJoinGroupSubmit} className="group-join-form">
                    <input 
                        type="text"
                        className="group-join-input"
                        placeholder="EJ: UNIMAG-EE-G1"
                        value={joinGroupCode}
                        onChange={(e) => {
                            setJoinGroupCode(e.target.value.toUpperCase());
                            setJoinGroupError(null);
                            setJoinGroupSuccess(null);
                        }}
                        disabled={isJoiningGroup}
                        maxLength={30}
                    />
                    <button 
                        type="submit" 
                        className="group-join-submit-btn"
                        disabled={!joinGroupCode.trim() || isJoiningGroup}
                    >
                        {isJoiningGroup ? (
                            <span>Validando...</span>
                        ) : (
                            <>
                                <CheckCircle2 size={15} />
                                <span>Unirme al Grupo</span>
                            </>
                        )}
                    </button>
                </form>

                {joinGroupSuccess && (
                    <div className="group-join-feedback success animate-fade-in">
                        <Check size={15} />
                        <span>{joinGroupSuccess}</span>
                    </div>
                )}

                {joinGroupError && (
                    <div className="group-join-feedback error animate-fade-in">
                        <X size={15} />
                        <span>{joinGroupError}</span>
                    </div>
                )}

                {/* Cursos y grupos activos */}
                {enrolledCourses && enrolledCourses.length > 0 && (
                    <div className="group-current-pills">
                        <span className="group-current-label">Tus cursos y grupos activos:</span>
                        <div className="group-pills-wrap">
                            {enrolledCourses.map(c => {
                                const cDef = COURSES_DEFINITION.find(d => d.id === c.id || d.abbr === c.abbr) || c;
                                const cColor = cDef.color || getCourseColor(c.id) || '#38bdf8';
                                return (
                                    <span key={c.id || c.abbr} className="group-enrolled-pill" style={{ borderColor: `${cColor}40`, color: cColor }}>
                                        <span className="group-pill-dot" style={{ background: cColor }} />
                                        {c.name || cDef.name} {c.group_name ? `• ${c.group_name}` : ''}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ProfileModalContent;
