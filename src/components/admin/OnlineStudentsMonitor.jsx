import React, { useState, useEffect, useCallback } from 'react';
import { Users, Radio, Send, RefreshCw, MessageSquare, AlertCircle, CheckCircle, Clock, Zap, Bell } from 'lucide-react';
import { api } from '../../lib/api';

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
    const [duration, setDuration] = useState(8); // segundos de duración
    const [sending, setSending] = useState(false);
    const [feedback, setFeedback] = useState(null);

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
        setDuration(8);
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
                title: messageTitle.trim() || 'Aviso del Docente',
                message: messageText.trim(),
                is_temporary: isTemporary,
                duration: duration
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
                    ? `¡Ventanita temporal (${duration}s) enviada a la pantalla de ${targetName}! (No queda guardada)`
                    : `¡Notificación enviada a ${targetName}! (Guardada en su historial)`
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

    return (
        <div style={{
            background: 'var(--glass-bg, rgba(30, 41, 59, 0.5))',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '1.75rem',
            color: '#fff',
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
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
                        <Radio size={22} className="animate-pulse" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                                Estudiantes en Línea
                            </h2>
                            <span style={{
                                background: 'rgba(16, 185, 129, 0.2)',
                                color: '#34d399',
                                border: '1px solid rgba(16, 185, 129, 0.4)',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                                {onlineStudents.length} conectados
                            </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                            Monitoreo en tiempo real de actividad y presencia en clase
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                        onClick={fetchOnline}
                        style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '10px',
                            color: '#94a3b8',
                            padding: '0.55rem 0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.8rem',
                            fontWeight: 600
                        }}
                        title="Actualizar lista ahora"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        <span>Actualizar</span>
                    </button>

                    <button
                        onClick={() => handleOpenMessageModal(null)}
                        disabled={onlineStudents.length === 0}
                        style={{
                            background: onlineStudents.length === 0
                                ? 'rgba(255, 255, 255, 0.08)'
                                : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                            color: onlineStudents.length === 0 ? '#64748b' : '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '0.6rem 1.25rem',
                            cursor: onlineStudents.length === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            boxShadow: onlineStudents.length > 0 ? '0 4px 15px rgba(2, 132, 199, 0.3)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Send size={15} />
                        <span>Mensaje a Todos los Conectados</span>
                    </button>
                </div>
            </div>

            {/* Lista de estudiantes en línea */}
            {onlineStudents.length === 0 ? (
                <div style={{
                    padding: '2.5rem',
                    textAlign: 'center',
                    background: 'rgba(15, 23, 42, 0.4)',
                    borderRadius: '14px',
                    border: '1px dashed rgba(255, 255, 255, 0.1)'
                }}>
                    <Users size={36} color="#64748b" style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
                    <h4 style={{ margin: '0 0 0.3rem', color: '#cbd5e1', fontSize: '1rem' }}>
                        No hay estudiantes conectados en este momento
                    </h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>
                        Apenas un alumno abra SaberLab en su equipo, aparecerá aquí en vivo con su actividad actual.
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1rem'
                }}>
                    {onlineStudents.map(student => (
                        <div
                            key={student.user_id}
                            style={{
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                                borderRadius: '16px',
                                padding: '1rem 1.2rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1rem',
                                transition: 'all 0.2s ease'
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
                                        border: '2px solid #0f172a',
                                        zIndex: 2
                                    }}></span>
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{
                                        fontSize: '0.92rem',
                                        fontWeight: 700,
                                        color: '#f8fafc',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {student.full_name || student.email.split('@')[0]}
                                    </div>
                                    <div style={{
                                        fontSize: '0.76rem',
                                        color: '#38bdf8',
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        marginTop: '1px'
                                    }}>
                                        {student.activity || 'Navegando'}
                                    </div>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        color: '#94a3b8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        marginTop: '2px'
                                    }}>
                                        <Clock size={11} />
                                        <span>Activo hace {student.seconds_ago < 60 ? `${student.seconds_ago}s` : `${Math.round(student.seconds_ago / 60)} min`}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleOpenMessageModal(student)}
                                style={{
                                    background: 'rgba(56, 189, 248, 0.12)',
                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                    color: '#38bdf8',
                                    borderRadius: '10px',
                                    padding: '0.45rem 0.75rem',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    transition: 'all 0.2s ease'
                                }}
                                title={`Enviar mensaje emergente a ${student.full_name || student.email}`}
                            >
                                <MessageSquare size={14} />
                                <span>Mensaje</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal para redactar y enviar mensaje */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    background: 'rgba(10, 15, 30, 0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'linear-gradient(150deg, #1e293b 0%, #0f172a 100%)',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        borderRadius: '22px',
                        padding: '2rem',
                        maxWidth: '520px',
                        width: '100%',
                        color: '#fff',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: modalTarget ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: modalTarget ? '#38bdf8' : '#34d399'
                                }}>
                                    <Send size={18} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                                        {modalTarget ? 'Mensaje Privado 1 a 1' : 'Mensaje a Toda la Clase'}
                                    </h3>
                                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                        Destinatario: <strong style={{ color: '#f8fafc' }}>
                                            {modalTarget ? (modalTarget.full_name || modalTarget.email) : `Todos los conectados (${onlineStudents.length})`}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    fontSize: '1.25rem'
                                }}
                            >
                                ✕
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
                                color: feedback.type === 'success' ? '#34d399' : '#f87171',
                                border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                            }}>
                                {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                <span>{feedback.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleSendMessage}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem' }}>
                                    Título / Asunto del mensaje
                                </label>
                                <input
                                    type="text"
                                    value={messageTitle}
                                    onChange={(e) => setMessageTitle(e.target.value)}
                                    placeholder="Ej: Aviso importante, Recordatorio de entrega..."
                                    style={{
                                        width: '100%',
                                        background: 'rgba(15, 23, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        borderRadius: '10px',
                                        padding: '0.7rem 0.9rem',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem' }}>
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
                                        background: 'rgba(15, 23, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        borderRadius: '10px',
                                        padding: '0.75rem 0.9rem',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        boxSizing: 'border-box',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            {/* Selector de Modalidad: Ventanita Flash vs Notificación Formal */}
                            <div style={{
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '14px',
                                padding: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.65rem' }}>
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
                                            border: isTemporary ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                                            background: isTemporary ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                            color: isTemporary ? '#38bdf8' : '#94a3b8',
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
                                        <span style={{ fontSize: '0.72rem', color: isTemporary ? '#cbd5e1' : '#64748b' }}>
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
                                            border: !isTemporary ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                                            background: !isTemporary ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                            color: !isTemporary ? '#34d399' : '#94a3b8',
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
                                        <span style={{ fontSize: '0.72rem', color: !isTemporary ? '#cbd5e1' : '#64748b' }}>
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
                                        borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                                    }}>
                                        <span style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <Clock size={13} color="#38bdf8" /> Duración en pantalla:
                                        </span>
                                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                                            {[5, 8, 12, 15].map((sec) => (
                                                <button
                                                    key={sec}
                                                    type="button"
                                                    onClick={() => setDuration(sec)}
                                                    style={{
                                                        padding: '3px 9px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        border: duration === sec ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                                                        background: duration === sec ? '#38bdf8' : 'rgba(255, 255, 255, 0.05)',
                                                        color: duration === sec ? '#0f172a' : '#94a3b8',
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
                                        background: 'transparent',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        color: '#94a3b8',
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
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    {isTemporary ? <Zap size={15} /> : <Send size={15} />}
                                    <span>
                                        {sending
                                            ? 'Enviando...'
                                            : (isTemporary ? `Mostrar Ventanita (${duration}s)` : 'Enviar Notificación')}
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
