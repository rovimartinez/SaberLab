import React, { useState } from 'react';
import { Bell, Check, X, Clock, BookOpen, MessageSquare, Award, AlertCircle, Trash2, Filter } from 'lucide-react';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'evaluation',
            icon: <AlertCircle size={20} />,
            title: 'Nueva evaluación disponible',
            message: 'El examen del Módulo 3 de Electricidad está disponible hasta el 15 de abril.',
            time: 'Hace 2 horas',
            read: false,
            color: '#f43f5e'
        },
        {
            id: 2,
            type: 'lesson',
            icon: <BookOpen size={20} />,
            title: 'Nueva lección completada',
            message: 'Has completado "Introducción a los circuitos básicos" en Robótica.',
            time: 'Hace 5 horas',
            read: false,
            color: '#3b82f6'
        },
        {
            id: 3,
            type: 'achievement',
            icon: <Award size={20} />,
            title: 'Nuevo logro desbloqueado',
            message: '¡Felicidades! Has desbloqueado "Estudiante Dedicado" por 7 días consecutivos.',
            time: 'Hace 1 día',
            read: true,
            color: '#f59e0b'
        },
        {
            id: 4,
            type: 'message',
            icon: <MessageSquare size={20} />,
            title: 'Mensaje del profesor',
            message: 'Prof. García ha publicado un comentario en tu entrega del Proyecto Final.',
            time: 'Hace 1 día',
            read: true,
            color: '#8b5cf6'
        },
        {
            id: 5,
            type: 'reminder',
            icon: <Clock size={20} />,
            title: 'Recordatorio de actividad',
            message: 'No has estudiado en 2 días. ¡Retoma tu racha de estudio!',
            time: 'Hace 2 días',
            read: true,
            color: '#10b981'
        },
        {
            id: 6,
            type: 'evaluation',
            icon: <AlertCircle size={20} />,
            title: 'Calificación publicada',
            message: 'Tu calificación en el Examen 2 de Electrónica está disponible: 85/100.',
            time: 'Hace 3 días',
            read: true,
            color: '#f43f5e'
        }
    ]);

    const [filter, setFilter] = useState('all');

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        return n.type === filter;
    });

    const markAsRead = (id) => {
        setNotifications(notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

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
                                style={{ backgroundColor: `${notification.color}20`, color: notification.color }}
                            >
                                {notification.icon}
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
        </div>
    );
};

export default Notifications;
