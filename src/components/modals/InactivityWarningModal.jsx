import React from 'react';
import { ShieldAlert, Clock, ArrowRight, LogOut } from 'lucide-react';

export default function InactivityWarningModal({ secondsRemaining, onExtend, onLogout }) {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            animation: 'fadeIn 0.25s ease-out'
        }}>
            <div style={{
                background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                border: '2px solid rgba(245, 158, 11, 0.5)',
                borderRadius: '24px',
                padding: '2.5rem 2rem',
                maxWidth: '480px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 25px 60px -15px rgba(245, 158, 11, 0.3), 0 0 40px rgba(245, 158, 11, 0.15)',
                color: '#fff'
            }}>
                <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '2px solid rgba(245, 158, 11, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    color: '#f59e0b',
                    animation: 'pulse 2s infinite'
                }}>
                    <ShieldAlert size={36} />
                </div>

                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    marginBottom: '0.75rem',
                    color: '#f8fafc'
                }}>
                    ¿Sigues trabajando en SaberLab?
                </h2>

                <p style={{
                    fontSize: '0.92rem',
                    color: '#94a3b8',
                    lineHeight: 1.6,
                    marginBottom: '1.75rem'
                }}>
                    Hemos detectado inactividad en tu equipo. Por seguridad de tu cuenta escolar y tus notas, tu sesión se cerrará automáticamente en:
                </p>

                <div style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '16px',
                    padding: '1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '2rem'
                }}>
                    <Clock size={24} color="#f59e0b" />
                    <span style={{
                        fontSize: '2rem',
                        fontWeight: 900,
                        fontFamily: 'monospace',
                        color: secondsRemaining <= 15 ? '#ef4444' : '#f59e0b',
                        letterSpacing: '1px'
                    }}>
                        00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        onClick={onExtend}
                        style={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: '#0f172a',
                            fontWeight: 800,
                            fontSize: '1rem',
                            padding: '1rem',
                            borderRadius: '14px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span>Continuar Trabajando</span>
                        <ArrowRight size={18} />
                    </button>

                    <button
                        onClick={onLogout}
                        style={{
                            background: 'transparent',
                            color: '#94a3b8',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            padding: '0.6rem',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            transition: 'color 0.2s'
                        }}
                    >
                        <LogOut size={14} />
                        <span>Cerrar sesión ahora</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
