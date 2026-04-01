import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Palette, Moon, Sun, Globe, Smartphone, Mail, Lock, Save, Camera } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import './Settings.css';

const SettingsPage = () => {
    const { user } = useAuth();
    const fullName = user?.user_metadata?.full_name?.split(' ')[0] || 'Estudiante';
    const [activeTab, setActiveTab] = useState('profile');
    const [theme, setTheme] = useState('dark');
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        activities: true,
        grades: true,
        announcements: false
    });

    const tabs = [
        { id: 'profile', name: 'Perfil', icon: <User size={18} /> },
        { id: 'notifications', name: 'Notificaciones', icon: <Bell size={18} /> },
        { id: 'appearance', name: 'Apariencia', icon: <Palette size={18} /> },
        { id: 'security', name: 'Seguridad', icon: <Shield size={18} /> }
    ];

    const handleNotificationChange = (key) => {
        setNotifications({ ...notifications, [key]: !notifications[key] });
    };

    return (
        <div className="settings-page">
            <div className="page-header green">
                <div className="header-title">
                    <Settings size={28} className="text-gradient" />
                    <h1 style={{ fontSize: '1.8rem', margin: 0 }}>
                        Configuración
                    </h1>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        ¡Hola <span className="text-gradient" style={{ fontWeight: 700 }}>{fullName}</span>! Personaliza tu cuenta.
                    </p>
                </div>
            </div>

            <div className="settings-tabs glass-panel">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        <span>{tab.name}</span>
                    </button>
                ))}
            </div>

            <div className="settings-content">
                {activeTab === 'profile' && (
                    <>
                        <div className="settings-section glass-panel">
                            <h2>Información del Perfil</h2>
                            <div className="profile-layout">
                                <div className="profile-left">
                                    <div className="avatar-preview large">
                                        {user?.user_metadata?.avatar_url ? (
                                            <img src={user.user_metadata.avatar_url} alt="Avatar" />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {user?.user_metadata?.full_name?.[0] || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <button className="upload-btn">
                                        <Camera size={16} />
                                        Cambiar foto
                                    </button>
                                </div>
                                <div className="profile-info">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Nombre completo</label>
                                            <input
                                                type="text"
                                                defaultValue={user?.user_metadata?.full_name || ''}
                                                placeholder="Tu nombre"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Correo electrónico</label>
                                            <input
                                                type="email"
                                                defaultValue={user?.email || ''}
                                                placeholder="tu@correo.com"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row three-cols">
                                        <div className="form-group">
                                            <label>Rol</label>
                                            <input
                                                type="text"
                                                defaultValue="Estudiante"
                                                disabled
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Institución</label>
                                            <input type="text" defaultValue="Tecnológico de Monterrey" disabled />
                                        </div>
                                        <div className="form-group">
                                            <label>Carrera / Especialidad</label>
                                            <input type="text" defaultValue="Ingeniería en Electrónica" disabled />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="profile-actions">
                            <button type="button" className="btn btn-primary">
                                <Save size={18} />
                                Guardar cambios
                            </button>
                        </div>
                    </>
                )}

                {activeTab === 'notifications' && (
                    <div className="settings-section glass-panel">
                        <h2>Preferencias de Notificaciones</h2>
                        <p className="section-description">
                            Configura cómo y cuándo quieres recibir notificaciones.
                        </p>
                        <div className="notifications-list">
                            <div className="notification-item">
                                <div className="notification-info">
                                    <Mail size={20} />
                                    <div>
                                        <span className="notification-name">Notificaciones por correo</span>
                                        <span className="notification-desc">Recibe actualizaciones por email</span>
                                    </div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={notifications.email}
                                        onChange={() => handleNotificationChange('email')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="notification-item">
                                <div className="notification-info">
                                    <Smartphone size={20} />
                                    <div>
                                        <span className="notification-name">Notificaciones push</span>
                                        <span className="notification-desc">Recibe alertas en tu navegador</span>
                                    </div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={notifications.push}
                                        onChange={() => handleNotificationChange('push')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="notification-item">
                                <div className="notification-info">
                                    <Bell size={20} />
                                    <div>
                                        <span className="notification-name">Nuevas actividades</span>
                                        <span className="notification-desc">Avisos de nuevas evaluaciones y tareas</span>
                                    </div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={notifications.activities}
                                        onChange={() => handleNotificationChange('activities')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="notification-item">
                                <div className="notification-info">
                                    <Settings size={20} />
                                    <div>
                                        <span className="notification-name">Calificaciones</span>
                                        <span className="notification-desc">Notificaciones cuando se publiquen calificaciones</span>
                                    </div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={notifications.grades}
                                        onChange={() => handleNotificationChange('grades')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="notification-item">
                                <div className="notification-info">
                                    <Globe size={20} />
                                    <div>
                                        <span className="notification-name">Anuncios</span>
                                        <span className="notification-desc">Noticias y anuncios de la plataforma</span>
                                    </div>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={notifications.announcements}
                                        onChange={() => handleNotificationChange('announcements')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'appearance' && (
                    <div className="settings-section glass-panel">
                        <h2>Apariencia</h2>
                        <p className="section-description">
                            Personaliza cómo se ve la plataforma.
                        </p>
                        <div className="appearance-options">
                            <div className="option-group">
                                <label>Tema de color</label>
                                <div className="theme-selector">
                                    <button
                                        className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                                        onClick={() => setTheme('dark')}
                                    >
                                        <Moon size={20} />
                                        <span>Oscuro</span>
                                    </button>
                                    <button
                                        className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                                        onClick={() => setTheme('light')}
                                    >
                                        <Sun size={20} />
                                        <span>Claro</span>
                                    </button>
                                    <button
                                        className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
                                        onClick={() => setTheme('system')}
                                    >
                                        <Smartphone size={20} />
                                        <span>Sistema</span>
                                    </button>
                                </div>
                            </div>
                            <div className="option-group">
                                <label>Idioma</label>
                                <select defaultValue="es">
                                    <option value="es">Español</option>
                                    <option value="en">English</option>
                                    <option value="pt">Português</option>
                                </select>
                            </div>
                            <div className="option-group">
                                <label>Zona horaria</label>
                                <select defaultValue="america_mexico">
                                    <option value="america_mexico">Ciudad de México (GMT-6)</option>
                                    <option value="america_buenos_aires">Buenos Aires (GMT-3)</option>
                                    <option value="europe_madrid">Madrid (GMT+1)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="settings-section glass-panel">
                        <h2>Seguridad</h2>
                        <p className="section-description">
                            Gestiona tu seguridad y privacidad.
                        </p>
                        <div className="security-options">
                            <div className="security-item">
                                <div className="security-info">
                                    <Lock size={20} />
                                    <div>
                                        <span className="security-name">Cambiar contraseña</span>
                                        <span className="security-desc">Actualiza tu contraseña regularmente</span>
                                    </div>
                                </div>
                                <button className="btn btn-secondary">Cambiar</button>
                            </div>
                            <div className="security-item">
                                <div className="security-info">
                                    <Shield size={20} />
                                    <div>
                                        <span className="security-name">Autenticación de dos factores</span>
                                        <span className="security-desc">Añade una capa extra de seguridad</span>
                                    </div>
                                </div>
                                <button className="btn btn-secondary">Configurar</button>
                            </div>
                            <div className="security-item">
                                <div className="security-info">
                                    <Globe size={20} />
                                    <div>
                                        <span className="security-name">Sesiones activas</span>
                                        <span className="security-desc">Gestiona tus dispositivos conectados</span>
                                    </div>
                                </div>
                                <button className="btn btn-secondary">Ver sesiones</button>
                            </div>
                            <div className="danger-zone">
                                <h3>Zona de peligro</h3>
                                <p>Esta acción eliminará permanentemente tu cuenta y todos tus datos.</p>
                                <button className="btn btn-danger">Eliminar cuenta</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;
