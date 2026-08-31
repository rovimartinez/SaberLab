import React, { useState, useEffect } from 'react';
import { MessageSquareQuote, CheckCircle2, UserCheck, BellRing, Zap, X, Clock } from 'lucide-react';

// ── Web Audio API: Generador de sonidos sin archivos externos ──
function playSound(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();

        if (type === 'buzz') {
            // Zumbido clásico MSN: ráfaga de tonos rápidos
            const times = [0, 0.08, 0.16, 0.24, 0.32];
            times.forEach((t) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'square';
                osc.frequency.setValueAtTime(220, ctx.currentTime + t);
                osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + t + 0.06);
                gain.gain.setValueAtTime(0.18, ctx.currentTime + t);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + t + 0.07);
                osc.start(ctx.currentTime + t);
                osc.stop(ctx.currentTime + t + 0.08);
            });
        } else if (type === 'nudge') {
            // Toque suave: dos pips ascendentes
            [440, 660].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.18);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.18 + 0.15);
                osc.start(ctx.currentTime + i * 0.18);
                osc.stop(ctx.currentTime + i * 0.18 + 0.16);
            });
        } else if (type === 'alarm') {
            // Alarma: sirena aguda
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.2);
            osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.4);
            osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.6);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.75);
        } else if (type === 'wink') {
            // Guiño: dos tonos cortos y dulces
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.26);
        } else if (type === 'message') {
            // Tono de mensaje recibido
            [523, 659, 784].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.12);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.12 + 0.1);
                osc.start(ctx.currentTime + i * 0.12);
                osc.stop(ctx.currentTime + i * 0.12 + 0.11);
            });
        }
    } catch (e) {
        // Silenciar si no soporta AudioContext
    }
}

// ── Tipos de señales rápidas (estilo MSN) ──
export const NUDGE_TYPES = {
    buzz: {
        emoji: '📳',
        label: 'Zumbido',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.15)',
        border: '#f59e0b',
        sound: 'buzz',
        shake: true,
        title: '¡ZUMBIDO!',
        message: '¡Tu docente te envió un zumbido! 📳',
        animClass: 'nudge-buzz',
    },
    nudge: {
        emoji: '👈',
        label: 'Toque',
        color: '#38bdf8',
        bg: 'rgba(56, 189, 248, 0.15)',
        border: '#38bdf8',
        sound: 'nudge',
        shake: false,
        title: '¡Toque del Docente!',
        message: 'Tu docente quiere llamar tu atención 👈',
        animClass: 'nudge-nudge',
    },
    alarm: {
        emoji: '🚨',
        label: 'Alerta',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.15)',
        border: '#ef4444',
        sound: 'alarm',
        shake: true,
        title: '⚠️ ATENCIÓN',
        message: 'El docente solicita atención inmediata 🚨',
        animClass: 'nudge-alarm',
    },
    wink: {
        emoji: '😉',
        label: 'Guiño',
        color: '#a855f7',
        bg: 'rgba(168, 85, 247, 0.15)',
        border: '#a855f7',
        sound: 'wink',
        shake: false,
        title: '😉 Guiño',
        message: 'Tu docente te envió un guiño 😉',
        animClass: 'nudge-wink',
    },
    clap: {
        emoji: '👏',
        label: 'Aplauso',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.15)',
        border: '#10b981',
        sound: 'nudge',
        shake: false,
        title: '👏 ¡Bien hecho!',
        message: '¡Tu docente aplaude tu trabajo! 👏',
        animClass: 'nudge-clap',
    },
};

// ── Inyector de CSS de animaciones (una sola vez) ──
const NUDGE_CSS = `
@keyframes nudge-buzz {
    0%,100% { transform: translateX(0); }
    10% { transform: translateX(-12px) rotate(-2deg); }
    20% { transform: translateX(12px) rotate(2deg); }
    30% { transform: translateX(-10px) rotate(-1deg); }
    40% { transform: translateX(10px) rotate(1deg); }
    50% { transform: translateX(-8px); }
    60% { transform: translateX(8px); }
    70% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
    90% { transform: translateX(-2px); }
}
@keyframes nudge-nudge {
    0%,100% { transform: translateX(0); }
    25% { transform: translateX(-18px); }
    75% { transform: translateX(8px); }
}
@keyframes nudge-alarm {
    0%,100% { transform: scale(1); filter: brightness(1); }
    15% { transform: scale(1.04); filter: brightness(1.3); }
    30% { transform: scale(0.97); filter: brightness(0.9); }
    45% { transform: scale(1.03); filter: brightness(1.2); }
    60% { transform: scale(0.98); }
    75% { transform: scale(1.02); }
}
@keyframes nudge-wink {
    0%,100% { transform: scale(1) rotate(0deg); }
    30% { transform: scale(1.05) rotate(-3deg); }
    70% { transform: scale(1.03) rotate(3deg); }
}
@keyframes nudge-clap {
    0%,100% { transform: scale(1); }
    20% { transform: scale(1.06); }
    40% { transform: scale(0.97); }
    60% { transform: scale(1.04); }
    80% { transform: scale(0.98); }
}
@keyframes nudge-enter {
    0% { opacity:0; transform: translateY(-30px) scale(0.85); }
    70% { transform: translateY(6px) scale(1.02); }
    100% { opacity:1; transform: translateY(0) scale(1); }
}
@keyframes nudge-emoji-bounce {
    0%,100% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.35) rotate(-10deg); }
    75% { transform: scale(1.2) rotate(8deg); }
}
`;

function injectNudgeCSS() {
    if (document.getElementById('nudge-styles')) return;
    const el = document.createElement('style');
    el.id = 'nudge-styles';
    el.textContent = NUDGE_CSS;
    document.head.appendChild(el);
}

// ── Componente NudgePopup: pantalla completa con efecto ──
export function NudgePopup({ nudgeType, onClose }) {
    const [animating, setAnimating] = useState(true);
    const cfg = NUDGE_TYPES[nudgeType];
    if (!cfg) return null;

    useEffect(() => {
        injectNudgeCSS();
        playSound(cfg.sound);
        const t = setTimeout(() => setAnimating(false), 800);
        return () => clearTimeout(t);
    }, [nudgeType]);

    // Auto-cerrar después de 5s
    useEffect(() => {
        const t = setTimeout(onClose, 5000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                animation: animating ? `${cfg.animClass} 0.7s ease` : 'none',
            }}
        >
            <div
                style={{
                    pointerEvents: 'all',
                    background: `linear-gradient(145deg, #1e293b 0%, #0f172a 100%)`,
                    border: `2px solid ${cfg.color}`,
                    borderRadius: '28px',
                    padding: '2.5rem 3rem',
                    textAlign: 'center',
                    boxShadow: `0 0 60px ${cfg.bg}, 0 30px 80px rgba(0,0,0,0.6)`,
                    animation: 'nudge-enter 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                    maxWidth: '380px',
                    width: '90vw',
                    position: 'relative',
                }}
            >
                {/* Cerrar */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'rgba(255,255,255,0.08)',
                        border: 'none',
                        color: '#94a3b8',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <X size={14} />
                </button>

                {/* Emoji animado */}
                <div
                    style={{
                        fontSize: '4rem',
                        marginBottom: '1rem',
                        animation: 'nudge-emoji-bounce 0.6s ease 0.1s 2',
                        display: 'inline-block',
                    }}
                >
                    {cfg.emoji}
                </div>

                {/* Título */}
                <div
                    style={{
                        fontSize: '1.6rem',
                        fontWeight: 900,
                        color: cfg.color,
                        marginBottom: '0.5rem',
                        textShadow: `0 0 20px ${cfg.bg}`,
                    }}
                >
                    {cfg.title}
                </div>

                {/* Mensaje */}
                <div
                    style={{
                        fontSize: '1rem',
                        color: '#cbd5e1',
                        fontWeight: 500,
                        marginBottom: '1.5rem',
                    }}
                >
                    {cfg.message}
                </div>

                {/* Barra de progreso de auto-cierre */}
                <div style={{
                    height: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                }}>
                    <div style={{
                        height: '100%',
                        background: cfg.color,
                        borderRadius: '2px',
                        animation: 'progress-drain 5s linear forwards',
                    }} />
                </div>

                <button
                    onClick={onClose}
                    style={{
                        background: `linear-gradient(135deg, ${cfg.color} 0%, ${cfg.color}aa 100%)`,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.7rem 2rem',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: `0 6px 20px ${cfg.bg}`,
                    }}
                >
                    OK 👍
                </button>
            </div>
        </div>
    );
}

// ── Componente Principal: DirectMessagePopup ──
export default function DirectMessagePopup({ message, onConfirm }) {
    if (!message) return null;

    // Si es una señal rápida (nudge)
    if (message.nudge_type) {
        return <NudgePopup nudgeType={message.nudge_type} onClose={onConfirm} />;
    }

    const isAnonymous = Boolean(message.is_anonymous);
    const sender = isAnonymous ? 'Aviso del Sistema' : (message.sender_name || 'Prof. Ronny Martinez');
    const title = message.title || (isAnonymous ? 'Aviso Importante' : 'Mensaje del Docente');
    const content = message.message;
    const isTemporary = Boolean(message.is_temporary);
    const duration = Number(message.duration) || 5;

    const [timeLeft, setTimeLeft] = useState(duration);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        // Reproducir sonido de mensaje al recibir
        playSound('message');
    }, []);

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
