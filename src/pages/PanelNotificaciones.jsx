import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Bell, Check, X, Clock, BookOpen, MessageSquare, Award, AlertCircle, 
    Trash2, Filter, Users, Send, Inbox, Rocket, Calendar, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';
import AdminAccessRequestsBubble from '../components/layout/AdminAccessRequestsBubble';
import '../styles/PanelNotificaciones.css';

const PanelNotificaciones = ({ isModal = false }) => {
    const navigate = useNavigate();
    const { user, profile, notifications: cachedNotifications, refreshNotifications, pendingAccessRequestsCount, isStaff } = useAuth();
    const [notifications, setNotifications] = useState(cachedNotifications || []);
    const [loading, setLoading] = useState(!cachedNotifications || (cachedNotifications.length === 0 && !user));
    const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'received' | 'sent' | 'evaluation' | 'achievement' | 'message'

    useEffect(() => {
        if (cachedNotifications && cachedNotifications.length > 0) {
            setNotifications(cachedNotifications);
            setLoading(false);
        } else if (user) {
            refreshNotifications().finally(() => setLoading(false));
        }
    }, [cachedNotifications, user]);

    const myId = (user?.id || user?.email || '').toString().toLowerCase();
    const myEmail = (user?.email || '').toString().toLowerCase();

    const isSentNotif = (n) => {
        const title = (n.title || '').trim();
        if (title.startsWith('📤') || title.toLowerCase().includes('asignación enviada')) {
            return true;
        }

        const sId = (n.sender_id || '').toString().toLowerCase();
        const uId = (n.user_id || '').toString().toLowerCase();

        if (title.startsWith('🚀') || title.toLowerCase().includes('asignación de proyecto')) {
            return false;
        }

        if (sId && (sId === myId || (myEmail && sId === myEmail)) && uId && uId !== myId && uId !== myEmail) {
            return true;
        }

        return false;
    };

    const sentCount = notifications.filter(n => isSentNotif(n)).length;
    const receivedCount = notifications.filter(n => !isSentNotif(n)).length;

    const filteredNotifications = notifications.filter(n => {
        const isSent = isSentNotif(n);

        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read && !isSent;
        if (filter === 'received') return !isSent;
        if (filter === 'sent') return isSent;
        return n.type === filter;
    });

    const markAsRead = async (id) => {
        await api('/notifications', { method: 'POST', body: { ids: [id] } });
        setNotifications(notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        ));
        refreshNotifications();
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length > 0) {
            await api('/notifications', { method: 'POST', body: { all: true } });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            refreshNotifications();
        }
    };

    const deleteNotification = async (id) => {
        await api('/notifications', { method: 'DELETE', body: { ids: [id] } });
        setNotifications(notifications.filter(n => n.id !== id));
        refreshNotifications();
    };

    const clearAll = async () => {
        const allIds = notifications.map(n => n.id);
        if (allIds.length > 0) {
            await api('/notifications', { method: 'DELETE', body: { ids: allIds } });
            setNotifications([]);
            refreshNotifications();
        }
    };

    const unreadCount = notifications.filter(n => !n.read && !isSentNotif(n)).length;

    const getIcon = (notification) => {
        const isSent = isSentNotif(notification);
        if (isSent) return <Send size={18} />;

        const title = (notification.title || '').toLowerCase();
        if (title.includes('proyecto') || title.includes('cad') || title.includes('simi')) return <Rocket size={18} />;
        if (title.includes('visita') || title.includes('salida') || title.includes('evento')) return <Calendar size={18} />;

        switch(notification.type) {
            case 'evaluation': return <AlertCircle size={18} />;
            case 'lesson': return <BookOpen size={18} />;
            case 'achievement': return <Award size={18} />;
            case 'message': return <MessageSquare size={18} />;
            case 'reminder': return <Clock size={18} />;
            default: return <Bell size={18} />;
        }
    };

    const getColor = (notification) => {
        const isSent = isSentNotif(notification);
        if (isSent) return '#06b6d4';

        const title = (notification.title || '').toLowerCase();
        if (title.includes('proyecto') || title.includes('cad') || title.includes('simi')) return '#06b6d4';
        if (title.includes('visita') || title.includes('salida') || title.includes('evento')) return '#10b981';

        switch(notification.type) {
            case 'evaluation': return '#f43f5e';
            case 'lesson': return '#3b82f6';
            case 'achievement': return '#f59e0b';
            case 'message': return '#8b5cf6';
            case 'reminder': return '#10b981';
            default: return '#64748b';
        }
    };

    return (
        <div className={`notifications-page ${isModal ? 'is-modal-view' : ''}`}>
            {!isModal ? (
                <div className="page-header">
                    <div className="header-title">
                        <Bell size={28} color="#facc15" />
                        <h1>
                            Notificaciones
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </h1>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={markAllAsRead} disabled={unreadCount === 0}>
                            <Check size={16} />
                            Marcar todas como leídas
                        </button>
                        <button className="btn btn-danger" onClick={clearAll} disabled={notifications.length === 0}>
                            <Trash2 size={16} />
                            Limpiar todo
                        </button>
                    </div>
                </div>
            ) : (
                <div className="modal-notifications-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {unreadCount > 0 ? `${unreadCount} nuevas sin leer` : 'Bandeja de avisos al día'}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem' }} onClick={markAllAsRead} disabled={unreadCount === 0}>
                            <Check size={14} />
                            Marcar leídas
                        </button>
                        <button className="btn btn-danger" style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem' }} onClick={clearAll} disabled={notifications.length === 0}>
                            <Trash2 size={14} />
                            Limpiar
                        </button>
                    </div>
                </div>
            )}

            {/* Banner destacado para docentes si hay solicitudes de acceso pendientes */}
            {isStaff && (pendingAccessRequestsCount || 0) > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(2, 132, 199, 0.2) 100%)',
                    border: '1.5px solid rgba(6, 182, 212, 0.4)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    gap: '12px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            background: 'rgba(6, 182, 212, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#22d3ee',
                            flexShrink: 0
                        }}>
                            <Users size={18} />
                        </div>
                        <div>
                            <strong style={{ color: 'var(--text-heading)', fontSize: '0.88rem', display: 'block' }}>
                                {pendingAccessRequestsCount} {pendingAccessRequestsCount === 1 ? 'Solicitud de acceso pendiente' : 'Solicitudes de acceso pendientes'}
                            </strong>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                                Hay estudiantes esperando tu aprobación para ingresar a la plataforma.
                            </span>
                        </div>
                    </div>
                    <button 
                        type="button"
                        style={{ 
                            padding: '6px 14px', 
                            fontSize: '0.78rem', 
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
                        }}
                        onClick={() => navigate('/dashboard/requests')}
                    >
                        Revisar y Aprobar ➔
                    </button>
                </div>
            )}

            {loading ? (
                <div className="empty-state glass-panel"><p>Cargando...</p></div>
            ) : notifications.length === 0 ? (
                <div className="empty-state glass-panel">
                    <Bell size={48} color="#64748b" />
                    <h3>No hay avisos académicos</h3>
                    <p>
                        {isStaff && (pendingAccessRequestsCount || 0) > 0 
                            ? 'No tienes alertas generales, pero tienes solicitudes de alumnos arriba pendientes de revisión.' 
                            : 'Estás al día.'}
                    </p>
                </div>
            ) : (
            <>
            <div className="filter-tabs glass-panel">
                <button 
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Todas ({notifications.length})
                </button>
                <button 
                    className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    No leídas ({unreadCount})
                </button>
                <button 
                    className={`filter-tab ${filter === 'received' ? 'active' : ''}`}
                    onClick={() => setFilter('received')}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <Inbox size={14} />
                    Recibidas ({receivedCount})
                </button>
                {isStaff && (
                    <button 
                        className={`filter-tab ${filter === 'sent' ? 'active' : ''}`}
                        onClick={() => setFilter('sent')}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <Send size={14} />
                        Enviadas ({sentCount})
                    </button>
                )}
                <button 
                    className={`filter-tab ${filter === 'evaluation' ? 'active' : ''}`}
                    onClick={() => setFilter('evaluation')}
                >
                    Evaluaciones
                </button>
                <button 
                    className={`filter-tab ${filter === 'achievement' ? 'active' : ''}`}
                    onClick={() => setFilter('achievement')}
                >
                    Logros
                </button>
                <button 
                    className={`filter-tab ${filter === 'message' ? 'active' : ''}`}
                    onClick={() => setFilter('message')}
                >
                    Mensajes
                </button>
            </div>

            <div className="notifications-list">
                {filteredNotifications.length === 0 ? (
                    <div className="empty-state glass-panel">
                        <Bell size={48} color="#64748b" />
                        <h3>No hay notificaciones</h3>
                        <p>
                            {filter === 'sent' 
                                ? 'No tienes notificaciones o asignaciones enviadas registradas.' 
                                : `No tienes notificaciones ${filter === 'unread' ? 'sin leer' : 'de este tipo'}.`}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => {
                        const isSent = isSentNotif(notification);
                        return (
                            <div 
                                key={notification.id} 
                                className={`notification-item glass-panel ${!notification.read && !isSent ? 'unread' : ''}`}
                                style={{
                                    borderLeft: isSent ? '4px solid #06b6d4' : undefined
                                }}
                            >
                                <div 
                                    className="notification-icon"
                                    style={{ backgroundColor: `${getColor(notification)}20`, color: getColor(notification) }}
                                >
                                    {getIcon(notification)}
                                </div>
                                <div className="notification-content">
                                    <div className="notification-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            <h3>{notification.title}</h3>
                                            {isSent && (
                                                <span style={{
                                                    background: 'rgba(6, 182, 212, 0.15)',
                                                    color: '#06b6d4',
                                                    fontSize: '0.66rem',
                                                    fontWeight: 800,
                                                    padding: '2px 7px',
                                                    borderRadius: '6px',
                                                    border: '1px solid rgba(6, 182, 212, 0.3)',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '3px'
                                                }}>
                                                    <Send size={10} />
                                                    ENVIADA
                                                </span>
                                            )}
                                        </div>
                                        <span className="notification-time">
                                            {(() => {
                                                if (!notification.created_at) return notification.time || 'Reciente';
                                                let raw = String(notification.created_at);
                                                if (!raw.endsWith('Z') && !raw.includes('+') && !raw.includes('-05')) {
                                                    raw = raw.replace(' ', 'T') + 'Z';
                                                }
                                                const dateObj = new Date(raw);
                                                return isNaN(dateObj.getTime()) 
                                                    ? (notification.time || 'Reciente') 
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
                                    </div>
                                    <p>{notification.message}</p>
                                </div>
                                <div className="notification-actions">
                                    {!notification.read && !isSent && (
                                        <button 
                                            className="action-btn mark-read"
                                            onClick={() => markAsRead(notification.id)}
                                            title="Marcar como leída"
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                    <button 
                                        className="action-btn delete"
                                        onClick={() => deleteNotification(notification.id)}
                                        title="Eliminar"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                {!notification.read && !isSent && <div className="unread-dot"></div>}
                            </div>
                        );
                    })
                )}
            </div>
            </>
            )}
            {profile?.role === 'admin' && !isModal && <AdminAccessRequestsBubble />}
        </div>
    );
};

export default PanelNotificaciones;
