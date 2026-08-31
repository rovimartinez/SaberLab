import React, { useState, useEffect, useCallback } from 'react';
import { Users, Radio, Send, RefreshCw, MessageSquare, AlertCircle, CheckCircle, Clock, Zap, Bell, UserX, X } from 'lucide-react';
import { api } from '../../lib/api';

// Señales rápidas estilo MSN
const NUDGES = [
    { type: 'buzz',  emoji: '📳', label: 'Zumbido',  color: '#f59e0b', title: '¡ZUMBIDO!' },
    { type: 'nudge', emoji: '👈', label: 'Toque',    color: '#38bdf8', title: '¡Toque!' },
    { type: 'alarm', emoji: '🚨', label: 'Alerta',   color: '#ef4444', title: '⚠️ Atención' },
    { type: 'wink',  emoji: '😉', label: 'Guiño',   color: '#a855f7', title: '😉 Guiño' },
    { type: 'clap',  emoji: '👏', label: 'Aplauso',  color: '#10b981', title: '👏 ¡Bien!' },
];

export default function OnlineStudentsMonitor() {
    const [onlineStudents, setOnlineStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Estado del modal de mensaje
    const [showModal, setShowModal] = useState(false);
    const [modalTarget, setModalTarget] = useState(null); // null = broadcast, { user_id, full_name } = 1-to-1
    const [messageTitle, setMessageTitle] = useState('Aviso del Docente');
    const [messageText, setMessageText] = useState('');
    const [isTemporary, setIsTemporary] = useState(true); // true = ventanita flash que desaparece sola
    const [duration, setDuration] = useState(5); // segundos de duración (2, 5, 8, 12, 15)
    const [isAnonymous, setIsAnonymous] = useState(false); // Modo anónimo
    const [sending, setSending] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [nudgeSent, setNudgeSent] = useState({}); // { userId: nudgeType } para feedback visual
    const [clearingNotifs, setClearingNotifs] = useState(false);
    const [clearFeedback, setClearFeedback] = useState(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const fetchOnline = useCallback(async () => {
        try {
            const { data } = await api('/presence');
            if (data?.online_students) {
                setOnlineStudents(data.online_students);
            }
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error obteniendo estudiantes en línea:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOnline();
        const interval = setInterval(fetchOnline, 10000); // Actualiza cada 10s
        return () => clearInterval(interval);
    }, [fetchOnline]);

    const handleOpenMessageModal = (student = null) => {
        setModalTarget(student);
        setMessageTitle(student ? `Aviso para ${student.full_name || student.email}` : 'Aviso para la Clase');
        setMessageText('');
        setIsTemporary(true); // Por defecto ventanita temporal
        setDuration(5);
        setIsAnonymous(false);
        setFeedback(null);
        setShowModal(true);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim()) return;

        setSending(true);
        setFeedback(null);

        try {
            const payload = {
                mode: modalTarget ? 'single' : 'broadcast',
                target_user_id: modalTarget ? modalTarget.user_id : undefined,
                title: isAnonymous ? (messageTitle.trim() || 'Aviso Anónimo') : (messageTitle.trim() || 'Aviso del Docente'),
                message: messageText.trim(),
                is_temporary: isTemporary,
                duration: duration,
                is_anonymous: isAnonymous,
                sender_name: isAnonymous ? 'Remitente Anónimo' : undefined
            };

            const { data, error } = await api('/admin/send-message', {
                method: 'POST',
                body: payload
            });

            if (error) throw new Error(error.message || 'Error al enviar');

            const targetName = modalTarget ? (modalTarget.full_name || modalTarget.email) : 'los alumnos conectados';
            setFeedback({
                type: 'success',
                text: isTemporary
                    ? `¡Ventanita temporal (${duration}s)${isAnonymous ? ' [Anónimo]' : ''} enviada a la pantalla de ${targetName}!`
                    : `¡Notificación${isAnonymous ? ' [Anónima]' : ''} enviada a ${targetName}!`
            });

            setTimeout(() => {
                setShowModal(false);
                setMessageText('');
                setFeedback(null);
            }, 2000);
        } catch (err) {
            setFeedback({ type: 'error', text: err.message || 'No se pudo enviar el mensaje' });
        } finally {
            setSending(false);
        }
    };

    // Enviar señal rápida (nudge) sin abrir modal
    const handleSendNudge = async (student, nudgeType) => {
        const key = student ? student.user_id : 'broadcast';
        setNudgeSent(prev => ({ ...prev, [key]: nudgeType }));
        try {
            await api('/admin/send-message', {
                method: 'POST',
                body: {
                    mode: student ? 'single' : 'broadcast',
                    target_user_id: student ? student.user_id : undefined,
                    nudge_type: nudgeType,
                    is_temporary: true,
                    duration: 5,
                }
            });
        } catch (err) {
            console.error('Error enviando señal:', err);
        }
        setTimeout(() => setNudgeSent(prev => { const n = { ...prev }; delete n[key]; return n; }), 1500);
    };

    // Limpiar TODAS las notificaciones de todos los estudiantes
    const handleClearAllNotifications = async () => {
        setClearingNotifs(true);
        setClearFeedback(null);
        try {
            const { data: res, error } = await api('/admin/clear-notifications', { method: 'DELETE' });
            if (error) throw new Error(error.message || 'Error al limpiar');
            setClearFeedback({ type: 'success', text: `✅ ${res?.message || 'Notificaciones eliminadas'}` });
        } catch (err) {
            setClearFeedback({ type: 'error', text: err.message || 'No se pudo limpiar' });
        } finally {
            setClearingNotifs(false);
            setShowClearConfirm(false);
            setTimeout(() => setClearFeedback(null), 4000);
        }
    };

    return (
        <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: '20px',
            padding: '1.75rem',
            color: 'var(--text-primary)',
            marginBottom: '2rem'
        }}>
            {/* Cabecera */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid var(--glass-border)',
                paddingBottom: '1.25rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10b981'
                    }}>
                        <Users size={22} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                                Estudiantes Conectados en Tiempo Real
                            </h2>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#10b981',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '20px',
                                padding: '2px 8px',
                                fontSize: '0.72rem',
                                fontWeight: 700
                            }}>
                                <Radio size={10} className="animate-pulse" /> EN VIVO
                            </span>
                        </div>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                            Monitor de presencia activa y mensajería instantánea hacia pantallas de alumnos.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                        onClick={fetchOnline}
                        style={{
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-secondary)',
                            borderRadius: '10px',
                            padding: '0.5rem 0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                        <span>Actualizar</span>
                    </button>

                    <button
                        onClick={() => handleOpenMessageModal(null)}
                        disabled={onlineStudents.length === 0}
                        style={{
                            background: onlineStudents.length > 0 ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'var(--bg-primary)',
                            border: 'none',
                            color: onlineStudents.length > 0 ? '#fff' : 'var(--text-secondary)',
                            borderRadius: '10px',
                            padding: '0.5rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: onlineStudents.length > 0 ? 'pointer' : 'not-allowed',
                            boxShadow: onlineStudents.length > 0 ? '0 4px 14px rgba(2, 132, 199, 0.35)' : 'none'
                        }}
                    >
                        <Send size={14} />
                        <span>Mensaje a Toda la Clase ({onlineStudents.length})</span>
                    </button>

                    {/* Botón limpiar notificaciones */}
                    <button
                        onClick={() => setShowClearConfirm(true)}
                        title="Eliminar TODAS las notificaciones de TODOS los estudiantes"
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            color: '#ef4444',
                            borderRadius: '10px',
                            padding: '0.5rem 0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        <UserX size={13} />
                        <span>Limpiar Notificaciones</span>
                    </button>
                </div>
            </div>

            {/* ── Feedback de limpieza de notificaciones ── */}
            {clearFeedback && (
                <div style={{
                    padding: '0.75rem 1.2rem',
                    borderRadius: '12px',
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    background: clearFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: `1px solid ${clearFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                    color: clearFeedback.type === 'success' ? '#10b981' : '#ef4444',
                }}>
                    {clearFeedback.text}
                </div>
            )}

            {/* ── Modal de confirmación: Limpiar notificaciones ── */}
            {showClearConfirm && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 999999,
                    background: 'rgba(10, 15, 30, 0.85)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem'
                }}>
                    <div style={{
                        background: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
                        border: '2px solid rgba(239, 68, 68, 0.5)',
                        borderRadius: '24px',
                        padding: '2.25rem 2rem',
                        maxWidth: '440px',
                        width: '100%',
                        boxShadow: '0 25px 70px rgba(239, 68, 68, 0.25)',
                        color: '#fff',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🗑️</div>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem', fontWeight: 800, color: '#ef4444' }}>
                            ¿Limpiar todas las notificaciones?
                        </h3>
                        <p style={{ margin: '0 0 1.75rem', fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.5 }}>
                            Esta acción eliminará <strong style={{ color: '#f8fafc' }}>permanentemente</strong> todos los mensajes y recordatorios
                            de examen del buzón de <strong style={{ color: '#f8fafc' }}>todos los estudiantes</strong>.
                            No se puede deshacer.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    color: '#cbd5e1',
                                    borderRadius: '12px',
                                    padding: '0.85rem',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleClearAllNotifications}
                                disabled={clearingNotifs}
                                style={{
                                    flex: 1,
                                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                    border: 'none',
                                    color: '#fff',
                                    borderRadius: '12px',
                                    padding: '0.85rem',
                                    fontSize: '0.9rem',
                                    fontWeight: 800,
                                    cursor: clearingNotifs ? 'wait' : 'pointer',
                                    boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)',
                                    opacity: clearingNotifs ? 0.7 : 1
                                }}
                            >
                                {clearingNotifs ? '⏳ Eliminando...' : '🗑️ Sí, limpiar todo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Listado de Estudiantes */}
            {onlineStudents.length === 0 ? (
                <div style={{
                    padding: '2.5rem 1rem',
                    textAlign: 'center',
                    background: 'var(--bg-primary)',
                    borderRadius: '14px',
                    border: '1px dashed var(--glass-border)'
                }}>
                    <Users size={36} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem', color: 'var(--text-primary)' }}>No hay estudiantes conectados en este momento</h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Cuando los alumnos ingresen a lecciones, talleres o simuladores, aparecerán aquí en vivo.
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1rem'
                }}>
                    {onlineStudents.map((student) => (
                        <div
                            key={student.user_id}
                            style={{
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '14px',
                                padding: '1rem 1.15rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.75rem',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', overflow: 'hidden' }}>
                                <div style={{
                                    position: 'relative',
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    color: '#fff',
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {student.avatar_url ? (
                                        <img 
                                            src={student.avatar_url} 
                                            alt={student.full_name || 'Estudiante'} 
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                if (e.currentTarget.nextSibling) {
                                                    e.currentTarget.nextSibling.style.display = 'block';
                                                }
                                            }}
                                            style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }}
                                        />
                                    ) : null}
                                    <span style={{ display: student.avatar_url ? 'none' : 'block' }}>
                                        {(student.full_name || student.email || 'E')[0].toUpperCase()}
                                    </span>
                                    <span style={{
                                        position: 'absolute',
                                        bottom: '-2px',
                                        right: '-2px',
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        background: '#10b981',
                                        border: '2px solid var(--bg-primary)',
                                        zIndex: 2
                                    }}></span>
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{
                                        fontSize: '0.92rem',
                                        fontWeight: 700,
                                        color: 'var(--text-primary)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {student.full_name || student.email.split('@')[0]}
                                    </div>
                                    <div style={{
                                        fontSize: '0.76rem',
                                        color: '#0284c7',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {student.activity || student.active_page || 'En plataforma'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
                                {/* Señales rápidas MSN */}
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {NUDGES.map((n) => {
                                        const sent = nudgeSent[student.user_id] === n.type;
                                        return (
                                            <button
                                                key={n.type}
                                                onClick={() => handleSendNudge(student, n.type)}
                                                title={`${n.label}: ${n.title}`}
                                                style={{
                                                    background: sent ? n.color : 'var(--bg-primary)',
                                                    border: `1px solid ${sent ? n.color : 'var(--glass-border)'}`,
                                                    borderRadius: '8px',
                                                    padding: '4px 6px',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    transform: sent ? 'scale(1.2)' : 'scale(1)',
                                                    lineHeight: 1
                                                }}
                                            >
                                                {n.emoji}
                                            </button>
                                        );
                                    })}
                                </div>
                                {/* Botón mensaje texto */}
                                <button
                                    onClick={() => handleOpenMessageModal(student)}
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--glass-border)',
                                        color: '#0284c7',
                                        borderRadius: '8px',
                                        padding: '0.35rem 0.65rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        transition: 'all 0.2s ease',
                                        whiteSpace: 'nowrap'
                                    }}
                                    title={`Enviar mensaje privado a ${student.full_name || student.email}`}
                                >
                                    <MessageSquare size={12} />
                                    <span>Mensaje</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Envío de Mensajes a Pantalla */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'var(--bg-secondary, #ffffff)',
                        border: '1px solid var(--glass-border, #cbd5e1)',
                        borderRadius: '22px',
                        padding: '2rem',
                        maxWidth: '520px',
                        width: '100%',
                        color: 'var(--text-primary, #0f172a)',
                        boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '10px',
                                    background: modalTarget ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: modalTarget ? '#0284c7' : '#10b981'
                                }}>
                                    <Send size={18} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                        {modalTarget ? 'Mensaje Privado 1 a 1' : 'Mensaje a Toda la Clase'}
                                    </h3>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                        Destinatario: <strong style={{ color: 'var(--text-primary)' }}>
                                            {modalTarget ? (modalTarget.full_name || modalTarget.email) : `Todos los conectados (${onlineStudents.length})`}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    background: 'var(--bg-primary, #f1f5f9)',
                                    border: '1px solid var(--glass-border, #cbd5e1)',
                                    color: 'var(--text-secondary, #64748b)',
                                    cursor: 'pointer',
                                    padding: '6px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {feedback && (
                            <div style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                marginBottom: '1rem',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: feedback.type === 'success' ? '#10b981' : '#ef4444',
                                border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                            }}>
                                {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                <span>{feedback.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleSendMessage}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                                    Título / Asunto del mensaje
                                </label>
                                <input
                                    type="text"
                                    value={messageTitle}
                                    onChange={(e) => setMessageTitle(e.target.value)}
                                    placeholder="Ej: Aviso importante, Recordatorio de entrega..."
                                    style={{
                                        width: '100%',
                                        background: 'var(--bg-primary, #f8fafc)',
                                        border: '1px solid var(--glass-border, #cbd5e1)',
                                        borderRadius: '10px',
                                        padding: '0.7rem 0.9rem',
                                        color: 'var(--text-primary, #0f172a)',
                                        fontSize: '0.9rem',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                                    Texto del mensaje (aparecerá en su pantalla)
                                </label>
                                <textarea
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    rows={4}
                                    placeholder="Escribe aquí las instrucciones o aviso..."
                                    required
                                    style={{
                                        width: '100%',
                                        background: 'var(--bg-primary, #f8fafc)',
                                        border: '1px solid var(--glass-border, #cbd5e1)',
                                        borderRadius: '10px',
                                        padding: '0.75rem 0.9rem',
                                        color: 'var(--text-primary, #0f172a)',
                                        fontSize: '0.9rem',
                                        boxSizing: 'border-box',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            {/* Switch de Modo Anónimo */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.75rem 1rem',
                                borderRadius: '12px',
                                background: isAnonymous ? 'rgba(168, 85, 247, 0.1)' : 'var(--bg-primary, #f8fafc)',
                                border: isAnonymous ? '1px solid #a855f7' : '1px solid var(--glass-border, #cbd5e1)',
                                marginBottom: '1.25rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => setIsAnonymous(prev => !prev)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '8px',
                                        background: isAnonymous ? '#a855f7' : 'rgba(100, 116, 139, 0.15)',
                                        color: isAnonymous ? '#fff' : 'var(--text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <UserX size={15} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: isAnonymous ? '#a855f7' : 'var(--text-primary)' }}>
                                            Modo Anónimo
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                            {isAnonymous ? 'El alumno NO verá tu nombre, solo el aviso del sistema' : 'El alumno verá tu nombre como remitente'}
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                    style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#a855f7' }}
                                />
                            </div>

                            {/* Selector de Modalidad: Ventanita Flash vs Notificación Formal */}
                            <div style={{
                                background: 'var(--bg-primary, #f8fafc)',
                                border: '1px solid var(--glass-border, #cbd5e1)',
                                borderRadius: '14px',
                                padding: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                                    Modalidad de Entrega en Pantalla
                                </label>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: isTemporary ? '0.85rem' : 0 }}>
                                    {/* Opción 1: Ventanita Flash */}
                                    <button
                                        type="button"
                                        onClick={() => setIsTemporary(true)}
                                        style={{
                                            padding: '0.75rem 0.6rem',
                                            borderRadius: '10px',
                                            border: isTemporary ? '1.5px solid #0284c7' : '1px solid var(--glass-border, #cbd5e1)',
                                            background: isTemporary ? 'rgba(2, 132, 199, 0.12)' : 'var(--bg-secondary, #ffffff)',
                                            color: isTemporary ? '#0284c7' : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            textAlign: 'center',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.86rem' }}>
                                            <Zap size={16} />
                                            <span>Ventanita Flash</span>
                                        </div>
                                        <span style={{ fontSize: '0.72rem', color: isTemporary ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                            Solo unos seg. en pantalla (NO se guarda en el buzón)
                                        </span>
                                    </button>

                                    {/* Opción 2: Notificación Formal */}
                                    <button
                                        type="button"
                                        onClick={() => setIsTemporary(false)}
                                        style={{
                                            padding: '0.75rem 0.6rem',
                                            borderRadius: '10px',
                                            border: !isTemporary ? '1.5px solid #10b981' : '1px solid var(--glass-border, #cbd5e1)',
                                            background: !isTemporary ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-secondary, #ffffff)',
                                            color: !isTemporary ? '#10b981' : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            textAlign: 'center',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.86rem' }}>
                                            <Bell size={16} />
                                            <span>Notificación Formal</span>
                                        </div>
                                        <span style={{ fontSize: '0.72rem', color: !isTemporary ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                            Requiere 'Entendido' y se guarda en su buzón
                                        </span>
                                    </button>
                                </div>

                                {/* Si es temporal: selector de duración */}
                                {isTemporary && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingTop: '0.75rem',
                                        borderTop: '1px solid var(--glass-border, #cbd5e1)'
                                    }}>
                                        <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <Clock size={13} color="#0284c7" /> Duración en pantalla:
                                        </span>
                                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                                            {[2, 5, 8, 12, 15].map((sec) => (
                                                <button
                                                    key={sec}
                                                    type="button"
                                                    onClick={() => setDuration(sec)}
                                                    style={{
                                                        padding: '3px 9px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        border: duration === sec ? '1px solid #0284c7' : '1px solid var(--glass-border, #cbd5e1)',
                                                        background: duration === sec ? '#0284c7' : 'var(--bg-secondary, #ffffff)',
                                                        color: duration === sec ? '#ffffff' : 'var(--text-secondary)',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {sec}s
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        background: 'var(--bg-primary, #f1f5f9)',
                                        border: '1px solid var(--glass-border, #cbd5e1)',
                                        color: 'var(--text-primary, #0f172a)',
                                        borderRadius: '10px',
                                        padding: '0.65rem 1.25rem',
                                        fontSize: '0.88rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={sending || !messageText.trim()}
                                    style={{
                                        background: isTemporary
                                            ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                                            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '0.65rem 1.5rem',
                                        fontSize: '0.88rem',
                                        fontWeight: 800,
                                        cursor: sending || !messageText.trim() ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
                                    }}
                                >
                                    {isTemporary ? <Zap size={15} /> : <Send size={15} />}
                                    <span>
                                        {sending
                                            ? 'Enviando...'
                                            : isTemporary
                                                ? `Mostrar Ventanita (${duration}s)`
                                                : 'Enviar Notificación'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
