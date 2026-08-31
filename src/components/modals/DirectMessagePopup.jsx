import React, { useState, useEffect } from 'react';
import { MessageSquareQuote, CheckCircle2, UserCheck, BellRing, Zap, X, Clock } from 'lucide-react';

export default function DirectMessagePopup({ message, onConfirm }) {
    if (!message) return null;

    const sender = message.sender_name || 'Prof. Ronny Martinez';
    const title = message.title || 'Mensaje del Docente';
    const content = message.message;
    const isTemporary = Boolean(message.is_temporary);
    const duration = Number(message.duration) || 8;

    const [timeLeft, setTimeLeft] = useState(duration);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (!isTemporary) return;

        setTimeLeft(duration);
        setProgress(100);

        const startTime = Date.now();
        const totalMs = duration * 1000;

        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remainingMs = Math.max(0, totalMs - elapsed);
            const remainingSec = Math.ceil(remainingMs / 1000);
            
            setTimeLeft(remainingSec);
            setProgress((remainingMs / totalMs) * 100);

            if (remainingMs <= 0) {
                clearInterval(timer);
                onConfirm();
            }
        }, 100);

        return () => clearInterval(timer);
    }, [isTemporary, duration, onConfirm]);

    // ── VISTA 1: VENTANITA TEMPORAL FLOTANTE (FLASH TOAST) ──
    if (isTemporary) {
        return (
            <div style={{
                position: 'fixed',
                top: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999999,
                width: 'calc(100% - 2rem)',
                maxWidth: '540px',
                animation: 'slideDownToast 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                filter: 'drop-shadow(0 20px 35px rgba(0, 0, 0, 0.65))'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.94) 100%)',
                    border: '1.5px solid #38bdf8',
                    borderRadius: '20px',
                    padding: '1.2rem 1.4rem',
                    color: '#fff',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 0 25px rgba(56, 189, 248, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Barra de cuenta regresiva en el borde superior */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
                            transition: 'width 0.1s linear'
                        }} />
                    </div>

                    {/* Cabecera de la ventanita */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                background: 'rgba(56, 189, 248, 0.18)',
                                color: '#38bdf8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Zap size={16} />
                            </div>
                            <div>
                                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Aviso en Pantalla
                                </span>
                                <span style={{ color: '#64748b', margin: '0 0.4rem' }}>•</span>
                                <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                                    {sender}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.72rem',
                                color: '#94a3b8',
                                background: 'rgba(255, 255, 255, 0.06)',
                                padding: '2px 8px',
                                borderRadius: '20px',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}>
                                <Clock size={11} />
                                <span>{timeLeft}s</span>
                            </div>
                            <button
                                onClick={onConfirm}
                                title="Cerrar ventanita"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: 'none',
                                    color: '#94a3b8',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0
                                }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Título y Mensaje */}
                    {title && title !== 'Mensaje del Docente' && (
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
                            {title}
                        </div>
                    )}
                    <div style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.5, fontWeight: 500, whiteSpace: 'pre-wrap' }}>
                        {content}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.6rem' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            ⚡ Ventanita temporal (no se guardará en tu buzón de mensajes)
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // ── VISTA 2: MODAL PERSISTENTE FORMAL (GUARDA EN BANDEJA) ──
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(10, 15, 30, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            <div style={{
                background: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
                border: '2px solid rgba(56, 189, 248, 0.6)',
                borderRadius: '26px',
                padding: '2.5rem 2rem',
                maxWidth: '520px',
                width: '100%',
                boxShadow: '0 25px 70px -15px rgba(56, 189, 248, 0.35), 0 0 50px rgba(56, 189, 248, 0.15)',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Luz de fondo decorativa */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    background: 'rgba(56, 189, 248, 0.15)',
                    filter: 'blur(40px)',
                    pointerEvents: 'none'
                }} />

                {/* Badge superior */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    padding: '0.4rem 0.9rem',
                    borderRadius: '50px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#38bdf8',
                    marginBottom: '1.25rem'
                }}>
                    <BellRing size={14} className="animate-pulse" />
                    <span>Comunicación en Tiempo Real</span>
                </div>

                {/* Encabezado del remitente */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        boxShadow: '0 8px 16px rgba(2, 132, 199, 0.3)',
                        flexShrink: 0
                    }}>
                        <UserCheck size={26} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Docente a Cargo
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                            {sender}
                        </h3>
                    </div>
                </div>

                {/* Título y Contenido del Mensaje */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '18px',
                    padding: '1.5rem',
                    marginBottom: '1.75rem'
                }}>
                    <h4 style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#38bdf8',
                        marginTop: 0,
                        marginBottom: '0.65rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <MessageSquareQuote size={18} />
                        <span>{title}</span>
                    </h4>
                    <p style={{
                        fontSize: '1.05rem',
                        lineHeight: 1.6,
                        color: '#e2e8f0',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        fontWeight: 500
                    }}>
                        {content}
                    </p>
                </div>

                {/* Botón de Confirmación */}
                <button
                    onClick={onConfirm}
                    style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
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
                        boxShadow: '0 8px 25px rgba(56, 189, 248, 0.35)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <CheckCircle2 size={20} />
                    <span>Entendido / Continuar</span>
                </button>
            </div>
        </div>
    );
}
