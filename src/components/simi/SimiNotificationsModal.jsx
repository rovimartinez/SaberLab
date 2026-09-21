import React, { useState, useEffect } from 'react';
import { 
    Bell, Check, X, Clock, Award, AlertCircle, Trash2, CheckCircle2, 
    Calendar, Rocket, Shield, Layers, Users, ExternalLink, Sparkles, Send, Inbox
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { api } from '../../lib/api';

export default function SimiNotificationsModal({ isOpen, onClose, onNavigateTab }) {
    const { user, profile, notifications: allCachedNotifs, refreshNotifications, isStaff } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'received' | 'sent'

    // ── Lista de IDs descartados localmente (persiste entre aperturas del modal) ──
    // Garantiza que las notificaciones eliminadas no reaparezcan aunque el servidor
    // aún no haya sido actualizado (pre-deploy del soft-delete en Cloudflare).
    const DISMISSED_KEY = 'simi-dismissed-notif-ids';
    const getDismissedIds = () => {
        try {
            return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]'));
        } catch { return new Set(); }
    };
    const addDismissedIds = (ids) => {
        try {
            const current = getDismissedIds();
            ids.forEach(id => current.add(id));
            localStorage.setItem(DISMISSED_KEY, JSON.stringify([...current]));
        } catch {}
    };

    const fetchSimiNotifications = async () => {
        setLoading(true);
        try {
            const res = await api('/notifications');
            const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
            
            // Filtrar estrictamente notificaciones relacionadas con SIMI3D
            const simiOnly = data.filter(n => {
                const title = (n.title || '').toLowerCase();
                const msg = (n.message || '').toLowerCase();
                const sender = (n.sender_name || '').toLowerCase();
                return title.includes('simi') || 
                       title.includes('semillero') || 
                       title.includes('3d') || 
                       title.includes('asignación') || 
                       title.includes('proyecto') || 
                       msg.includes('simi') || 
                       msg.includes('semillero') || 
                       msg.includes('impresión') ||
                       msg.includes('proyecto') ||
                       sender.includes('simi') || 
                       sender.includes('semillero');
            });

            // ── Filtro local de descartados: elimina los que ya borró el usuario ──
            const dismissed = getDismissedIds();
            const withoutDismissed = simiOnly.filter(n => !dismissed.has(n.id));
            setNotifications(withoutDismissed);
        } catch (err) {
            console.warn('[SIMI Notifs Fetch Error]', err);
            if (allCachedNotifs) {
                const simiOnly = allCachedNotifs.filter(n => {
                    const title = (n.title || '').toLowerCase();
                    const msg = (n.message || '').toLowerCase();
                    return title.includes('simi') || title.includes('semillero') || msg.includes('simi');
                });
                setNotifications(simiOnly);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchSimiNotifications();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const myId = (user?.id || user?.email || '').toString().toLowerCase();
    const myEmail = (user?.email || '').toString().toLowerCase();

    const isSentNotif = (n) => {
        const title = (n.title || '').trim();
        // Las notificaciones creadas expresamente como copia del emisor comienzan con 📤 o tienen 'Asignación Enviada'
        if (title.startsWith('📤') || title.toLowerCase().includes('asignación enviada')) {
            return true;
        }

        const sId = (n.sender_id || '').toString().toLowerCase();
        const uId = (n.user_id || '').toString().toLowerCase();

        // Si el usuario es el receptor y el título es de asignación entrante (🚀), es Recibida
        if (title.startsWith('🚀') || title.toLowerCase().includes('asignación de proyecto')) {
            return false;
        }

        // Caso general: si fue enviada por mí hacia otro usuario
        if (sId && (sId === myId || (myEmail && sId === myEmail)) && uId && uId !== myId && uId !== myEmail) {
            return true;
        }

        return false;
    };

    const sentCount = notifications.filter(n => isSentNotif(n)).length;
    const receivedCount = notifications.filter(n => !isSentNotif(n)).length;

    const filteredNotifs = notifications.filter(n => {
        const isSent = isSentNotif(n);
        if (filter === 'unread') return !n.read && !isSent;
        if (filter === 'received') return !isSent;
        if (filter === 'sent') return isSent;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read && !isSentNotif(n)).length;

    const markAsRead = async (id) => {
        try {
            await api('/notifications', { method: 'POST', body: { ids: [id] } });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            if (refreshNotifications) refreshNotifications();
        } catch (err) {
            console.warn('Error marking read:', err);
        }
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read && !isSentNotif(n)).map(n => n.id);
        if (unreadIds.length > 0) {
            try {
                await api('/notifications', { method: 'POST', body: { ids: unreadIds } });
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                if (refreshNotifications) refreshNotifications();
            } catch (err) {
                console.warn('Error marking all read:', err);
            }
        }
    };

    const deleteNotification = async (id) => {
        // 1. Persistir en localStorage ANTES del fetch (sobrevive re-apertura del modal)
        addDismissedIds([id]);
        // 2. Actualización optimista inmediata en la UI
        setNotifications(prev => prev.filter(n => n.id !== id));
        try {
            // 3. Soft-delete en backend
            await api('/notifications', { method: 'DELETE', body: { ids: [id] } });
        } catch (err) {
            console.warn('Error deleting notification:', err);
        }
    };

    const clearAllNotifications = async () => {
        const targetIds = filteredNotifs.map(n => n.id);
        if (targetIds.length === 0) return;

        // 1. Persistir en localStorage ANTES del fetch (sobrevive re-apertura del modal)
        addDismissedIds(targetIds);
        // 2. Actualización optimista inmediata en la UI
        setNotifications(prev => prev.filter(n => !targetIds.includes(n.id)));
        try {
            // 3. Soft-delete masivo en backend
            await api('/notifications', { method: 'DELETE', body: { ids: targetIds } });
        } catch (err) {
            console.warn('Error clearing notifications:', err);
        }
    };

    const getIcon = (notif) => {
        const isSent = isSentNotif(notif);
        if (isSent) return <Send size={18} color="#06b6d4" />;

        const title = (notif.title || '').toLowerCase();
        if (title.includes('proyecto') || title.includes('cad')) return <Rocket size={18} color="#06b6d4" />;
        if (title.includes('visita') || title.includes('evento') || title.includes('salida') || title.includes('taller')) return <Calendar size={18} color="#10b981" />;
        if (title.includes('insignia') || title.includes('exp') || title.includes('nivel') || title.includes('rango')) return <Award size={18} color="#f59e0b" />;
        return <Bell size={18} color="#06b6d4" />;
    };

    return (
        <div className="simi-modal-backdrop" onClick={onClose} style={{ zIndex: 1000000 }}>
            <div 
                className="simi-modal-card" 
                style={{ maxWidth: '680px', width: '94vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }} 
                onClick={e => e.stopPropagation()}
            >
                {/* Cabecera del Modal de Notificaciones SIMI3D */}
                <div className="simi-modal-header" style={{ borderBottom: '1.5px solid var(--border-subtle, #e2e8f0)', paddingBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: 'rgba(6, 182, 212, 0.14)',
                            border: '1.5px solid rgba(6, 182, 212, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#06b6d4',
                            position: 'relative'
                        }}>
                            <Bell size={22} />
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    background: '#ef4444',
                                    color: '#ffffff',
                                    fontSize: '0.65rem',
                                    fontWeight: 900,
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid #ffffff'
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 900, color: 'var(--text-heading)' }}>
                                🔔 Notificaciones & Avisos SIMI3D
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                                Asignaciones de proyectos, cronograma de visitas, talleres e insignias del semillero
                            </p>
                        </div>
                    </div>
                    <button className="simi-modal-close-btn" onClick={onClose}>
                        <X size={19} />
                    </button>
                </div>

                {/* Barra de Filtros y Acciones Rápidas */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle, #f1f5f9)' }}>
                    <div style={{ display: 'flex', background: 'var(--surface-sunken, #f1f5f9)', padding: '3px', borderRadius: '10px', gap: '4px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => setFilter('all')}
                            style={{
                                background: filter === 'all' ? '#ffffff' : 'transparent',
                                color: filter === 'all' ? '#0f172a' : '#64748b',
                                border: filter === 'all' ? '1px solid #cbd5e1' : 'none',
                                padding: '4px 10px',
                                borderRadius: '7px',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                            }}
                        >
                            Todas ({notifications.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilter('unread')}
                            style={{
                                background: filter === 'unread' ? '#ffffff' : 'transparent',
                                color: filter === 'unread' ? '#0891b2' : '#64748b',
                                border: filter === 'unread' ? '1px solid #cffafe' : 'none',
                                padding: '4px 10px',
                                borderRadius: '7px',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                            }}
                        >
                            No Leídas ({unreadCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilter('received')}
                            style={{
                                background: filter === 'received' ? '#ffffff' : 'transparent',
                                color: filter === 'received' ? '#0891b2' : '#64748b',
                                border: filter === 'received' ? '1px solid #cffafe' : 'none',
                                padding: '4px 10px',
                                borderRadius: '7px',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <Inbox size={12} />
                            <span>Recibidas ({receivedCount})</span>
                        </button>
                        {isStaff && (
                            <button
                                type="button"
                                onClick={() => setFilter('sent')}
                                style={{
                                    background: filter === 'sent' ? '#ffffff' : 'transparent',
                                    color: filter === 'sent' ? '#0891b2' : '#64748b',
                                    border: filter === 'sent' ? '1px solid #cffafe' : 'none',
                                    padding: '4px 10px',
                                    borderRadius: '7px',
                                    fontSize: '0.74rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <Send size={12} />
                                <span>Enviadas ({sentCount})</span>
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                style={{
                                    background: 'transparent',
                                    color: '#0891b2',
                                    border: '1px solid #cffafe',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    fontSize: '0.74rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <CheckCircle2 size={13} />
                                <span>Marcar leídas</span>
                            </button>
                        )}

                        {filteredNotifs.length > 0 && (
                            <button
                                type="button"
                                onClick={clearAllNotifications}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    fontSize: '0.74rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                                title="Borrar todas las notificaciones visibles en esta pestaña"
                            >
                                <Trash2 size={13} />
                                <span>Borrar todas</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Lista de Notificaciones SIMI3D */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem 0', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '55vh' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Cargando avisos del semillero...
                        </div>
                    ) : filteredNotifs.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '2.8rem 1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'var(--surface-sunken, #f8fafc)',
                            borderRadius: '14px',
                            border: '1.5px dashed var(--border-default, #e2e8f0)'
                        }}>
                            <div style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '50%',
                                background: 'rgba(6, 182, 212, 0.1)',
                                color: '#06b6d4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyCenter: 'center',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                <Check size={22} />
                            </div>
                            <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                                {filter === 'sent' 
                                    ? 'No hay avisos enviados' 
                                    : (filter === 'unread' ? '¡Estás al día!' : 'No hay notificaciones de SIMI3D')}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '340px' }}>
                                {filter === 'sent' 
                                    ? 'Cuando asignes proyectos a estudiantes o envíes avisos, se registrarán aquí.' 
                                    : 'Aquí recibirás avisos cuando se te asigne un proyecto CAD, nuevas salidas pedagógicas o ascensos de insignia.'}
                            </p>
                        </div>
                    ) : (
                        filteredNotifs.map(notif => {
                            const isSent = isSentNotif(notif);
                            const isUnread = !notif.read && !isSent;
                            const titleLower = (notif.title || '').toLowerCase();
                            const isProjectNotif = titleLower.includes('proyecto') || titleLower.includes('cad');
                            const isEventNotif = titleLower.includes('visita') || titleLower.includes('evento') || titleLower.includes('salida') || titleLower.includes('taller');

                            return (
                                <div
                                    key={notif.id}
                                    style={{
                                        background: isUnread ? '#ecfeff' : 'var(--surface-card, #ffffff)',
                                        border: isUnread ? '1.5px solid #a5f3fc' : (isSent ? '1px solid #cffafe' : '1px solid var(--border-default, #e2e8f0)'),
                                        borderLeft: isSent ? '4px solid #06b6d4' : undefined,
                                        borderRadius: '14px',
                                        padding: '0.9rem 1rem',
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'flex-start',
                                        transition: 'all 0.15s ease',
                                        boxShadow: isUnread ? '0 2px 10px rgba(6, 182, 212, 0.08)' : 'none'
                                    }}
                                >
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        background: isUnread ? '#cffafe' : (isSent ? 'rgba(6, 182, 212, 0.12)' : 'var(--surface-sunken, #f1f5f9)'),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {getIcon(notif)}
                                    </div>

                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                fontSize: '0.85rem',
                                                fontWeight: 850,
                                                color: isUnread ? '#0e7490' : 'var(--text-heading)'
                                            }}>
                                                {notif.title}
                                            </span>
                                            {isUnread && (
                                                <span style={{
                                                    background: '#06b6d4',
                                                    color: '#ffffff',
                                                    fontSize: '0.62rem',
                                                    fontWeight: 900,
                                                    padding: '1px 6px',
                                                    borderRadius: '99px'
                                                }}>
                                                    NUEVA
                                                </span>
                                            )}
                                            {isSent && (
                                                <span style={{
                                                    background: 'rgba(6, 182, 212, 0.15)',
                                                    color: '#06b6d4',
                                                    fontSize: '0.62rem',
                                                    fontWeight: 850,
                                                    padding: '1px 6px',
                                                    borderRadius: '6px',
                                                    border: '1px solid rgba(6, 182, 212, 0.3)',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '3px'
                                                }}>
                                                    <Send size={9} />
                                                    ENVIADA
                                                </span>
                                            )}
                                        </div>

                                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-body, #334155)', lineHeight: 1.45 }}>
                                            {notif.message}
                                        </p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed rgba(0,0,0,0.06)' }}>
                                            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                                {(() => {
                                                    if (!notif.created_at) return 'Reciente';
                                                    let raw = String(notif.created_at);
                                                    if (!raw.endsWith('Z') && !raw.includes('+') && !raw.includes('-05')) {
                                                        raw = raw.replace(' ', 'T') + 'Z';
                                                    }
                                                    const dateObj = new Date(raw);
                                                    return isNaN(dateObj.getTime()) 
                                                        ? 'Reciente' 
                                                        : dateObj.toLocaleDateString('es-CO', { 
                                                            timeZone: 'America/Bogota',
                                                            month: 'short', 
                                                            day: 'numeric', 
                                                            hour: '2-digit', 
                                                            minute: '2-digit',
                                                            hour12: true 
                                                        });
                                                })()}
                                            </span>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {/* Botón de acceso directo a la sección */}
                                                {isProjectNotif && onNavigateTab && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            markAsRead(notif.id);
                                                            onNavigateTab('projects');
                                                            onClose();
                                                        }}
                                                        style={{
                                                            background: '#06b6d4',
                                                            color: '#042f2e',
                                                            border: 'none',
                                                            padding: '2px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.68rem',
                                                            fontWeight: 850,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '3px'
                                                        }}
                                                    >
                                                        <span>Ver Proyectos</span>
                                                        <ExternalLink size={10} />
                                                    </button>
                                                )}

                                                {isEventNotif && onNavigateTab && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            markAsRead(notif.id);
                                                            onNavigateTab('events');
                                                            onClose();
                                                        }}
                                                        style={{
                                                            background: '#10b981',
                                                            color: '#ffffff',
                                                            border: 'none',
                                                            padding: '2px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.68rem',
                                                            fontWeight: 850,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '3px'
                                                        }}
                                                    >
                                                        <span>Ver Cronograma</span>
                                                        <ExternalLink size={10} />
                                                    </button>
                                                )}

                                                {isUnread && (
                                                    <button
                                                        type="button"
                                                        onClick={() => markAsRead(notif.id)}
                                                        title="Marcar como leída"
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: '#0891b2',
                                                            cursor: 'pointer',
                                                            padding: '2px',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => deleteNotification(notif.id)}
                                                    title="Eliminar notificación"
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#94a3b8',
                                                        cursor: 'pointer',
                                                        padding: '2px',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer del Modal */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.65rem', borderTop: '1.5px solid var(--border-subtle, #e2e8f0)', marginTop: '0.4rem' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            background: '#06b6d4',
                            color: '#042f2e',
                            border: 'none',
                            padding: '8px 20px',
                            borderRadius: '10px',
                            fontWeight: 850,
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px -2px rgba(6, 182, 212, 0.4)'
                        }}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
