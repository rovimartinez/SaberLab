import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Clock, BookOpen, MessageSquare, Award, AlertCircle, Trash2, Filter } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { supabase } from '../lib/supabase';
import './Notifications.css';

const Notifications = () => {
    const { user, refreshNotificationsCount } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setNotifications(data);
            }
            setLoading(false);
        };

        fetchNotifications();
    }, [user]);

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        return n.type === filter;
    });

    const markAsRead = async (id) => {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
        setNotifications(notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        ));
        refreshNotificationsCount();
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length > 0) {
            await supabase.from('notifications').update({ read: true }).in('id', unreadIds);
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            refreshNotificationsCount();
        }
    };

    const deleteNotification = async (id) => {
        await supabase.from('notifications').delete().eq('id', id);
        setNotifications(notifications.filter(n => n.id !== id));
        refreshNotificationsCount();
    };

    const clearAll = async () => {
        const allIds = notifications.map(n => n.id);
        if (allIds.length > 0) {
            await supabase.from('notifications').delete().in('id', allIds);
            setNotifications([]);
            refreshNotificationsCount();
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type) => {
        switch(type) {
            case 'evaluation': return <AlertCircle size={20} />;
            case 'lesson': return <BookOpen size={20} />;
            case 'achievement': return <Award size={20} />;
            case 'message': return <MessageSquare size={20} />;
            case 'reminder': return <Clock size={20} />;
            default: return <Bell size={20} />;
        }
    };

    const getColor = (type) => {
        switch(type) {
            case 'evaluation': return '#f43f5e';
            case 'lesson': return '#3b82f6';
            case 'achievement': return '#f59e0b';
            case 'message': return '#8b5cf6';
            case 'reminder': return '#10b981';
            default: return '#64748b';
        }
    };

    return (
        <div className="notifications-page">
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

            {loading ? (
                <div className="empty-state glass-panel"><p>Cargando...</p></div>
            ) : notifications.length === 0 ? (
                <div className="empty-state glass-panel">
                    <Bell size={48} color="#64748b" />
                    <h3>No hay notificaciones</h3>
                    <p>Estás al día.</p>
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
                        <p>No tienes notificaciones {filter === 'unread' ? 'sin leer' : 'de este tipo'}.</p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => (
                        <div 
                            key={notification.id} 
                            className={`notification-item glass-panel ${!notification.read ? 'unread' : ''}`}
                        >
                            <div 
                                className="notification-icon"
                                style={{ backgroundColor: `${getColor(notification.type)}20`, color: getColor(notification.type) }}
                            >
                                {getIcon(notification.type)}
                            </div>
                            <div className="notification-content">
                                <div className="notification-header">
                                    <h3>{notification.title}</h3>
                                    <span className="notification-time">{notification.time}</span>
                                </div>
                                <p>{notification.message}</p>
                            </div>
                            <div className="notification-actions">
                                {!notification.read && (
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
                            {!notification.read && <div className="unread-dot"></div>}
                        </div>
                    ))
                )}
            </div>
            </>
            )}
        </div>
    );
};

export default Notifications;
