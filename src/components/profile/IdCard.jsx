import { useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { getRankByLessons } from '../../data/ranksData';

/**
 * IdCard — Tarjeta de estudiante con flip 3D en CSS puro
 *
 * Props:
 *   user            {object} — Supabase user
 *   profile         {object} — Perfil de BD
 *   lessonsCompleted {number}
 */
export default function IdCard({ user, profile, lessonsCompleted = 0 }) {
    const [isFlipped, setIsFlipped] = useState(false);

    const rank = getRankByLessons(lessonsCompleted);

    const meta = user?.user_metadata || {};
    const name = profile?.first_name && profile?.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : meta.name || meta.full_name || user?.email?.split('@')[0] || 'Estudiante';

    const email = user?.email || '';
    const avatarUrl = profile?.avatar_url || meta.avatar_url;
    const memberSince = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        : 'Desconocido';

    const cardId = user?.id
        ? `SL-${user.id.substring(0, 8).toUpperCase()}`
        : 'SL-XXXXXXXX';

    return (
        <div
            style={{
                perspective: '1000px',
                width: '100%',
                maxWidth: '360px',
                height: '210px',
                cursor: 'pointer',
            }}
            onClick={() => setIsFlipped(prev => !prev)}
            title="Haz clic para girar"
        >
            <div style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}>
                {/* ── Frente ── */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${rank.color}22 0%, rgba(15,23,42,0.97) 100%)`,
                    border: `1px solid ${rank.color}55`,
                    boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${rank.color}20`,
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}>
                    {/* Patrón de fondo */}
                    <div style={{
                        position: 'absolute', inset: 0, opacity: 0.04,
                        backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)',
                        backgroundSize: '12px 12px',
                        color: rank.color,
                    }} />

                    {/* Banda superior de color */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '5px',
                        background: rank.gradient,
                    }} />

                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                SaberLab
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.1rem' }}>
                                Tarjeta de Estudiante
                            </div>
                        </div>
                        <div style={{
                            padding: '0.25rem 0.625rem',
                            borderRadius: '99px',
                            background: `${rank.color}25`,
                            border: `1px solid ${rank.color}50`,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: rank.color,
                        }}>
                            {rank.emoji} {rank.name}
                        </div>
                    </div>

                    {/* Info central */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', zIndex: 1 }}>
                        {/* Avatar */}
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%',
                            border: `3px solid ${rank.color}80`,
                            overflow: 'hidden', flexShrink: 0,
                            background: `${rank.color}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {avatarUrl
                                ? <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span style={{ fontSize: '1.75rem' }}>{name.charAt(0).toUpperCase()}</span>
                            }
                        </div>

                        <div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>{name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>{email}</div>
                            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.3rem' }}>
                                Desde {memberSince}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#475569', letterSpacing: '0.08em' }}>
                            {cardId}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b', fontSize: '0.72rem' }}>
                            <RefreshCcw size={10} />
                            Girar
                        </div>
                    </div>
                </div>

                {/* ── Reverso ── */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98))',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}>
                    {/* Banda magnética decorativa */}
                    <div style={{ height: '40px', background: '#1a1a1a', borderRadius: '4px', marginTop: '0.5rem' }} />

                    {/* Estadísticas */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {[
                            { label: 'Lecciones', value: lessonsCompleted },
                            { label: 'Rango', value: rank.name },
                            { label: 'ID', value: cardId.replace('SL-', '') },
                            { label: 'Estado', value: '✓ Activo' },
                        ].map(item => (
                            <div key={item.label} style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                padding: '0.5rem 0.75rem',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, marginBottom: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {item.label}
                                </div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ fontSize: '0.7rem', color: '#334155', textAlign: 'center' }}>
                        saberlab.pages.dev · Uso exclusivo de miembro
                    </div>
                </div>
            </div>
        </div>
    );
}
