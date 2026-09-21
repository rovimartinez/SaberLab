import { useState, useEffect } from 'react';
import {
    Calendar, CheckCircle2, Plus, X,
    Edit3, Trash2, Check, School, Users, Award, Shield, CheckCheck, Clock,
    Eye, EyeOff, Lock, Unlock
} from 'lucide-react';
import { SIMI_SCHOOL_EVENTS } from '../../data/simiData';
import { api } from '../../lib/api';

// Función para formatear fechas a día mes año (DD/MM/AAAA o DD de Mes, AAAA)
export function formatSimiDate(dateStr) {
    if (!dateStr) return '';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const [y, m, d] = parts;
            return `${d}/${m}/${y}`;
        }
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        }
    } catch (e) {}
    return dateStr;
}

// Subcomponente de Calendario de Visitas a Colegios & Eventos (Editable para líder/admin, visualizable para estudiantes)
export default function SimiEventsTab({ 
    isLeader, 
    profile, 
    initialEvents, 
    onEventsChange,
    isManageModeActive = false,
    onToggleManageMode
}) {
    const [events, setEvents] = useState(() => {
        if (initialEvents && initialEvents.length > 0) return initialEvents;
        const saved = localStorage.getItem('simi_events_list');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        return SIMI_SCHOOL_EVENTS;
    });

    // Mapa local de visibilidad por evento (3 estados: 'unlocked' | 'locked' | 'hidden')
    const [eventVisibilityMap, setEventVisibilityMap] = useState(() => {
        const saved = localStorage.getItem('simi_event_visibility_map');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        return {};
    });

    useEffect(() => {
        if (initialEvents && initialEvents.length > 0) {
            setEvents(initialEvents);
            // Sincronizar visibilidad inicial desde los eventos cargados
            const mapFromEvents = {};
            initialEvents.forEach(evt => {
                if (evt && evt.id) {
                    const st = evt.visibility_state || evt.visibilityState || (evt.is_locked || evt.isLocked ? 'locked' : (evt.is_hidden || evt.isHidden ? 'hidden' : 'unlocked'));
                    mapFromEvents[evt.id] = st;
                }
            });
            if (Object.keys(mapFromEvents).length > 0) {
                setEventVisibilityMap(prev => {
                    // La BD (mapFromEvents) es la fuente de verdad y tiene precedencia sobre el caché local (prev)
                    const merged = { ...prev, ...mapFromEvents };
                    localStorage.setItem('simi_event_visibility_map', JSON.stringify(merged));
                    return merged;
                });
            }
        }
    }, [initialEvents]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [viewingEvent, setViewingEvent] = useState(null);
    const [eventCategoryFilter, setEventCategoryFilter] = useState('all');

    // Ciclar visibilidad de un evento: Visible -> Bloqueado -> Oculto -> Visible
    const cycleEventVisibility = async (eventId, e) => {
        e?.stopPropagation();
        if (!isLeader) return;
        
        const currentEvt = events.find(ev => ev.id === eventId);
        const currentState = eventVisibilityMap[eventId] || currentEvt?.visibilityState || currentEvt?.visibility_state || 'unlocked';
        const nextState = currentState === 'unlocked' ? 'locked' : currentState === 'locked' ? 'hidden' : 'unlocked';

        const updatedMap = { ...eventVisibilityMap, [eventId]: nextState };
        setEventVisibilityMap(updatedMap);
        localStorage.setItem('simi_event_visibility_map', JSON.stringify(updatedMap));

        const updatedEvents = events.map(ev => {
            if (ev.id === eventId) {
                return {
                    ...ev,
                    visibilityState: nextState,
                    visibility_state: nextState,
                    isLocked: nextState === 'locked',
                    is_locked: nextState === 'locked' ? 1 : 0,
                    isHidden: nextState === 'hidden',
                    is_hidden: nextState === 'hidden' ? 1 : 0
                };
            }
            return ev;
        });
        persistEvents(updatedEvents);

        try {
            if (currentEvt) {
                await api('/simi', {
                    method: 'POST',
                    body: {
                        action: 'save-event',
                        ...currentEvt,
                        visibilityState: nextState,
                        visibility_state: nextState,
                        isLocked: nextState === 'locked',
                        is_locked: nextState === 'locked' ? 1 : 0,
                        isHidden: nextState === 'hidden',
                        is_hidden: nextState === 'hidden' ? 1 : 0
                    }
                });
            }
        } catch (err) {
            console.warn('[SIMI] Error guardando estado de visibilidad:', err);
        }
    };

    // Formulario de Visita / Evento
    const [formEventType, setFormEventType] = useState('visita_escolar');
    const [formSchoolName, setFormSchoolName] = useState('');
    const [formDate, setFormDate] = useState('');
    const [formTime, setFormTime] = useState('8:30 AM – 12:00 PM');
    const [formLocation, setFormLocation] = useState('Aula Múltiple STEAM');
    const [formStatus, setFormStatus] = useState('Programada');
    const [formLeader, setFormLeader] = useState('Ing. Ronny Martinez Reyes');
    const [formObjective, setFormObjective] = useState('');
    const [formEquipment, setFormEquipment] = useState('2× Impresoras 3D FDM portátiles, Muestras impresas');
    const [formBadgeTier, setFormBadgeTier] = useState('Misión Escolar II');
    const [formStudentsCount, setFormStudentsCount] = useState(45);

    const userId = profile?.id || profile?.email || 'current-user';
    const userName = profile?.name || profile?.full_name || profile?.displayName || 'Semillerista';

    const persistEvents = (updated) => {
        setEvents(updated);
        localStorage.setItem('simi_events_list', JSON.stringify(updated));
        if (onEventsChange) onEventsChange(updated);
    };

    // Registro de asistencia (Asistiré / No asistiré)
    const handleSetRsvp = async (eventId, status) => {
        const updated = events.map(evt => {
            if (evt.id !== eventId) return evt;
            const attendees = evt.attendees ? [...evt.attendees] : [];
            const existingIdx = attendees.findIndex(a => a.userId === userId);
            
            if (existingIdx >= 0) {
                attendees[existingIdx] = {
                    ...attendees[existingIdx],
                    status,
                    name: userName,
                    updatedAt: new Date().toISOString()
                };
            } else {
                attendees.push({
                    userId,
                    name: userName,
                    status,
                    updatedAt: new Date().toISOString()
                });
            }
            return { ...evt, attendees };
        });
        persistEvents(updated);

        try {
            await api('/simi', {
                method: 'POST',
                body: { action: 'rsvp', eventId, status }
            });
        } catch (e) {
            console.warn('[SIMI] Fallback local RSVP:', e);
        }
    };

    const [statusFilter, setStatusFilter] = useState('active'); // 'active' (Programadas/En Prep) | 'all' | 'realizada' | 'cancelada' | 'archivada'

    // Cambio rápido de estado (Realizada, Cancelada, Archivada, Programada)
    const handleQuickStatusChange = async (eventId, newStatus) => {
        if (!isLeader) return;
        const currentEvt = events.find(e => e.id === eventId);
        if (!currentEvt) return;

        const isRealizada = newStatus === 'Realizada';
        const updated = events.map(evt => {
            if (evt.id === eventId) {
                return {
                    ...evt,
                    status: newStatus,
                    attendanceConfirmed: isRealizada ? true : (newStatus === 'Cancelada' || newStatus === 'Archivada' ? false : evt.attendanceConfirmed)
                };
            }
            return evt;
        });
        persistEvents(updated);

        if (viewingEvent && viewingEvent.id === eventId) {
            setViewingEvent(prev => ({
                ...prev,
                status: newStatus,
                attendanceConfirmed: isRealizada ? true : (newStatus === 'Cancelada' || newStatus === 'Archivada' ? false : prev.attendanceConfirmed)
            }));
        }

        try {
            await api('/simi', {
                method: 'POST',
                body: {
                    action: 'save-event',
                    ...currentEvt,
                    status: newStatus
                }
            });
        } catch (e) {
            console.warn('[SIMI] Error sincronizando nuevo estado:', e);
        }
    };

    // Confirmación docente / líder para convalidar asistencia y otorgar insignia
    const handleToggleConfirmAttendance = async (eventId) => {
        if (!isLeader) return;
        const currentEvt = events.find(e => e.id === eventId);
        const isNowConfirmed = !currentEvt?.attendanceConfirmed;
        const newStatus = isNowConfirmed ? 'Realizada' : 'Programada';

        const updated = events.map(evt => {
            if (evt.id === eventId) {
                return {
                    ...evt,
                    attendanceConfirmed: isNowConfirmed,
                    status: newStatus
                };
            }
            return evt;
        });
        persistEvents(updated);

        if (viewingEvent && viewingEvent.id === eventId) {
            setViewingEvent(prev => ({
                ...prev,
                attendanceConfirmed: isNowConfirmed,
                status: newStatus
            }));
        }

        try {
            if (currentEvt) {
                await api('/simi', {
                    method: 'POST',
                    body: {
                        action: 'save-event',
                        ...currentEvt,
                        status: newStatus
                    }
                });
            }
        } catch (e) {
            console.warn('[SIMI] Error sincronizando estado de evento:', e);
        }
    };

    // Validación individual de asistencia de estudiante por líder
    const handleVerifyStudentAttendance = async (eventId, targetUserId, attended) => {
        if (!isLeader) return;
        const updated = events.map(evt => {
            if (evt.id !== eventId) return evt;
            const attendees = (evt.attendees || []).map(a => {
                if (a.userId === targetUserId) {
                    return { ...a, attended };
                }
                return a;
            });
            return { ...evt, attendees };
        });
        persistEvents(updated);

        if (viewingEvent && viewingEvent.id === eventId) {
            setViewingEvent(prev => ({
                ...prev,
                attendees: (prev.attendees || []).map(a => a.userId === targetUserId ? { ...a, attended } : a)
            }));
        }

        try {
            await api('/simi', {
                method: 'POST',
                body: { action: 'verify-attendance', eventId, targetUserId, attended }
            });
        } catch (e) {
            console.warn('[SIMI] Fallback local verify attendance:', e);
        }
    };

    const handleOpenAdd = () => {
        if (!isLeader) return;
        setEditingEvent(null);
        setFormEventType('visita_escolar');
        setFormSchoolName('');
        setFormDate(new Date().toISOString().split('T')[0]);
        setFormTime('8:30 AM – 12:00 PM');
        setFormLocation('Aula Múltiple STEAM');
        setFormStatus('Programada');
        setFormLeader('Ing. Ronny Martinez Reyes');
        setFormObjective('');
        setFormEquipment('2× Impresoras 3D FDM portátiles, Muestras impresas');
        setFormBadgeTier('Misión Escolar II');
        setFormStudentsCount(45);
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (evt) => {
        if (!isLeader) return;
        setEditingEvent(evt);
        setFormEventType(evt.event_type || evt.eventType || 'visita_escolar');
        setFormSchoolName(evt.schoolName || evt.school_name || '');
        setFormDate(evt.date);
        setFormTime(evt.time);
        setFormLocation(evt.location);
        setFormStatus(evt.status);
        setFormLeader(evt.leader);
        setFormObjective(evt.objective);
        setFormEquipment(Array.isArray(evt.equipment) ? evt.equipment.join(', ') : evt.equipment || '');
        setFormBadgeTier(evt.badgeTier || evt.badge_tier || 'Misión Escolar II');
        setFormStudentsCount(evt.studentsCount || evt.students_count || 45);
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!isLeader) return;
        if (window.confirm('¿Seguro que deseas eliminar este evento del cronograma?')) {
            const updated = events.filter(e => e.id !== id);
            persistEvents(updated);
            try {
                await api('/simi', {
                    method: 'POST',
                    body: { action: 'delete-event', id }
                });
            } catch (e) {
                console.warn('[SIMI] Error eliminando evento:', e);
            }
        }
    };

    const handleSaveForm = async (e) => {
        e.preventDefault();
        if (!formSchoolName.trim()) return;

        const eqArray = formEquipment
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

        const eventData = {
            eventType: formEventType,
            event_type: formEventType,
            schoolName: formSchoolName,
            school_name: formSchoolName,
            date: formDate,
            time: formTime,
            location: formLocation,
            status: formStatus,
            leader: formLeader,
            objective: formObjective,
            equipment: eqArray,
            badgeTier: formBadgeTier,
            badge_tier: formBadgeTier,
            studentsCount: Number(formStudentsCount),
            students_count: Number(formStudentsCount)
        };

        if (editingEvent) {
            const updated = events.map(evt => evt.id === editingEvent.id ? {
                ...evt,
                ...eventData
            } : evt);
            persistEvents(updated);
            try {
                await api('/simi', {
                    method: 'POST',
                    body: { action: 'save-event', id: editingEvent.id, ...eventData }
                });
            } catch (err) {
                console.warn('[SIMI] Fallback local save:', err);
            }
        } else {
            const newId = `evt-${Date.now()}`;
            const newEvt = {
                id: newId,
                ...eventData,
                attendees: []
            };
            const updated = [newEvt, ...events];
            persistEvents(updated);
            try {
                await api('/simi', {
                    method: 'POST',
                    body: { action: 'save-event', id: newId, ...eventData }
                });
            } catch (err) {
                console.warn('[SIMI] Fallback local add:', err);
            }
        }

        setIsAddModalOpen(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Contenedor Superior del Cronograma */}
            <div className="simi-events-header-card">
                <div className="simi-events-header-info">
                    <div className="simi-events-header-icon">
                        <Calendar size={22} />
                    </div>
                    <div>
                        <h3 className="simi-events-header-title">
                            Cronograma General de Actividades STEAM
                        </h3>
                        <p className="simi-events-header-desc">
                            Planificación unificada de Capacitaciones Técnicas, Trabajo en Prototipos y Visitas Pedagógicas a Colegios.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isLeader && (
                        <button 
                            className={`simi-home-admin-edit-btn ${isManageModeActive ? 'active-manage-mode' : ''}`}
                            onClick={onToggleManageMode}
                            title={isManageModeActive ? "Modo Gestión Activo: Haz clic para salir" : "Activar Gestión de Visibilidad y Bloqueo (Solo Docente/Líder)"}
                            style={{ position: 'static' }}
                        >
                            <Edit3 size={18} />
                            {isManageModeActive && <span className="simi-manage-badge-dot" />}
                        </button>
                    )}

                    {isLeader && (
                        <button 
                            onClick={handleOpenAdd}
                            className="simi-desktop-add-btn simi-events-add-btn"
                            title="Agendar Nueva Actividad"
                        >
                            <Plus size={16} /> Agendar Actividad
                        </button>
                    )}
                </div>
            </div>

            {/* Barra de Filtros: Categorías y Estados */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '4px 0' }}>
                {/* Categorías */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                        { id: 'all', label: 'Todas las Actividades', color: '#06b6d4' },
                        { id: 'capacitacion_tecnica', label: '⚡ Capacitaciones', color: '#06b6d4' },
                        { id: 'trabajo_proyecto', label: '🛠️ Proyectos', color: '#38bdf8' },
                        { id: 'visita_escolar', label: '🏫 Visitas Escolares', color: '#10b981' }
                    ].map(tab => {
                        const isActive = eventCategoryFilter === tab.id;
                        const count = tab.id === 'all' 
                            ? events.length 
                            : events.filter(e => (e.event_type || e.eventType) === tab.id).length;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setEventCategoryFilter(tab.id)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '5px 12px',
                                    borderRadius: '99px',
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    border: isActive ? `1.5px solid ${tab.color}` : '1px solid #e2e8f0',
                                    backgroundColor: isActive ? `color-mix(in srgb, ${tab.color} 12%, #ffffff)` : '#ffffff',
                                    color: isActive ? '#0f172a' : '#64748b',
                                    boxShadow: isActive ? `0 2px 8px color-mix(in srgb, ${tab.color} 25%, transparent)` : 'none'
                                }}
                            >
                                <span>{tab.label}</span>
                                <span style={{
                                    fontSize: '0.7rem',
                                    padding: '1px 6px',
                                    borderRadius: '99px',
                                    backgroundColor: isActive ? tab.color : '#e2e8f0',
                                    color: isActive ? '#ffffff' : '#475569',
                                    fontWeight: 900
                                }}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Filtro por Estado (Próximas Activas vs Historial Realizadas / Canceladas) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface-sunken, #f8fafc)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-default, #e2e8f0)' }}>
                    {[
                        { id: 'active', label: '🕒 Próximas' },
                        { id: 'realizada', label: '✓ Realizadas' },
                        { id: 'cancelada', label: '✗ Canceladas' },
                        { id: 'all_status', label: '🗄️ Todo el Historial' }
                    ].map(st => {
                        const isSelected = statusFilter === st.id;
                        return (
                            <button
                                key={st.id}
                                type="button"
                                onClick={() => setStatusFilter(st.id)}
                                style={{
                                    background: isSelected ? 'var(--surface-card, #ffffff)' : 'transparent',
                                    color: isSelected ? 'var(--text-heading, #0f172a)' : 'var(--text-secondary, #64748b)',
                                    border: isSelected ? '1px solid var(--border-default, #cbd5e1)' : '1px solid transparent',
                                    padding: '4px 9px',
                                    borderRadius: '8px',
                                    fontSize: '0.74rem',
                                    fontWeight: isSelected ? 850 : 700,
                                    cursor: 'pointer',
                                    boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                {st.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="simi-events-list">
                {events
                    .filter(e => {
                        const visState = eventVisibilityMap[e.id] || e.visibilityState || e.visibility_state || (e.isLocked || e.is_locked ? 'locked' : (e.isHidden || e.is_hidden ? 'hidden' : 'unlocked'));
                        // Los alumnos nunca ven los eventos ocultos; el admin/docente los ve siempre
                        if (!isLeader && visState === 'hidden') return false;
                        return true;
                    })
                    .filter(e => eventCategoryFilter === 'all' || (e.event_type || e.eventType) === eventCategoryFilter)
                    .filter(e => {
                        const st = (e.status || 'Programada').toLowerCase();
                        if (statusFilter === 'active') return st !== 'realizada' && st !== 'cancelada' && st !== 'archivada';
                        if (statusFilter === 'realizada') return st === 'realizada';
                        if (statusFilter === 'cancelada') return st === 'cancelada';
                        return true; // 'all_status'
                    })
                    .sort((a, b) => {
                        // Ordenar: Desbloqueados (1) -> Bloqueados (2) -> Ocultos (3)
                        const stateOrder = { 'unlocked': 1, 'locked': 2, 'hidden': 3 };
                        const stateA = eventVisibilityMap[a.id] || a.visibilityState || a.visibility_state || 'unlocked';
                        const stateB = eventVisibilityMap[b.id] || b.visibilityState || b.visibility_state || 'unlocked';
                        return (stateOrder[stateA] || 1) - (stateOrder[stateB] || 1);
                    })
                    .map(evt => {
                    const attendees = evt.attendees || [];
                    const userRsvp = attendees.find(a => a.userId === userId)?.status || null;
                    const attendingStudents = attendees.filter(a => a.status === 'attending' || a.status === 'Asistiré' || a.attended);
                    const attendingCount = attendingStudents.length;
                    const notAttendingCount = attendees.filter(a => a.status === 'not_attending').length;

                    const visState = eventVisibilityMap[evt.id] || evt.visibilityState || evt.visibility_state || (evt.isLocked || evt.is_locked ? 'locked' : (evt.isHidden || evt.is_hidden ? 'hidden' : 'unlocked'));
                    const isLocked = visState === 'locked';
                    const isHidden = visState === 'hidden';
                    const effectiveLocked = !isLeader && isLocked;

                    return (
                        <div 
                            key={evt.id} 
                            className={`simi-event-card simi-clickable-event-card ${isLocked ? 'simi-item-locked' : ''} ${isHidden ? 'simi-item-hidden' : ''}`}
                            onClick={() => {
                                if (effectiveLocked) return;
                                setViewingEvent(evt);
                            }}
                            style={{
                                position: 'relative',
                                cursor: effectiveLocked ? 'not-allowed' : 'pointer',
                                opacity: isHidden ? 0.38 : isLocked ? (isLeader ? 0.75 : 0.52) : 1,
                                filter: isHidden ? 'grayscale(1) opacity(0.5)' : isLocked && !isLeader ? 'grayscale(0.7)' : 'none'
                            }}
                            title={effectiveLocked ? `Actividad Bloqueada: ${evt.schoolName || evt.school_name || evt.title}` : isHidden ? `[Oculta para alumnos] ${evt.schoolName || evt.school_name || evt.title}` : 'Ver detalles y lista de asistencia'}
                        >
                            {/* Botón Circular Superior Derecho de 3 Estados (Visible / Bloqueado / Oculto) en Modo Gestión (Solo Admin/Líder) */}
                            {isLeader && isManageModeActive && (
                                <button
                                    type="button"
                                    className={`simi-event-corner-toggle-btn is-state-${visState}`}
                                    onClick={(e) => cycleEventVisibility(evt.id, e)}
                                    title={`Estado: ${visState === 'unlocked' ? 'Visible' : visState === 'locked' ? 'Bloqueado' : 'Oculto'} (Toca para alternar)`}
                                >
                                    {visState === 'unlocked' && <Eye size={17} />}
                                    {visState === 'locked' && <Lock size={17} />}
                                    {visState === 'hidden' && <EyeOff size={17} />}
                                    <span className="simi-event-corner-toggle-pill">
                                        {visState === 'unlocked' ? 'Visible' : visState === 'locked' ? 'Bloqueado' : 'Oculto'}
                                    </span>
                                </button>
                            )}

                            {/* Overlay de Bloqueado para Estudiantes */}
                            {effectiveLocked && (
                                <div className="simi-event-student-blocked-overlay">
                                    <div className="simi-student-lock-icon-circle-sm">
                                        <Lock size={22} />
                                    </div>
                                    <span className="simi-student-lock-title-sm">Actividad Bloqueada</span>
                                    <span className="simi-student-lock-desc-sm">Disponible próximamente bajo indicación docente</span>
                                </div>
                            )}

                            <div className="simi-event-date-box">
                                <div className="simi-event-date-calendar-icon">
                                    <Calendar size={18} />
                                </div>
                                <span className="simi-event-date-text">
                                    {formatSimiDate(evt.date)}
                                </span>
                                <span className="simi-event-time-text">
                                    {evt.time}
                                </span>
                                <span className="simi-event-badge-tier-pill">
                                    ⚡ {evt.attendanceConfirmed ? `+100 EXP • ${evt.badgeTier || evt.badge_tier || 'Misión Escolar'}` : `Otorga: +100 EXP`}
                                </span>
                            </div>

                            <div className="simi-event-main-info">
                                <div className="simi-event-title-row">
                                    <h4 className="simi-event-school-name">
                                        {evt.schoolName || evt.school_name || evt.title || 'Institución Educativa STEAM'}
                                    </h4>
                                    <span className={`simi-event-status-badge ${evt.status === 'Realizada' ? 'realizada' : evt.status === 'Programada' ? 'programada' : 'preparacion'}`}>
                                        {evt.status}
                                    </span>
                                    {evt.attendanceConfirmed && (
                                        <span className="simi-event-convalidated-pill">
                                            <CheckCircle2 size={12} /> Convalidada
                                        </span>
                                    )}
                                </div>
                                
                                <p className="simi-event-meta-line">
                                    📍 <strong>Lugar:</strong> {evt.location} <span className="simi-event-meta-sep">•</span> 👨‍🏫 <strong>Líder:</strong> {evt.leader}
                                </p>
                                <p className="simi-event-mission-line">
                                    🎯 <strong>Misión:</strong> {evt.objective}
                                </p>
                                
                                <div className="simi-event-equip-row">
                                    {(evt.equipment || []).map((eq, i) => (
                                        <span key={i} className="simi-event-equip-tag">
                                            📦 {eq}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Columna lateral: Lista de Estudiantes Confirmados que Asisten */}
                            <div 
                                className="simi-event-attending-students-col"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="simi-event-attending-col-header">
                                    <Users size={14} color="#059669" />
                                    <span>Estudiantes Confirmados ({attendingCount})</span>
                                </div>
                                
                                <div className="simi-event-attending-names-list">
                                    {attendingStudents.length > 0 ? (
                                        attendingStudents.map((st, sIdx) => (
                                            <div key={st.userId || sIdx} className="simi-event-attending-name-chip">
                                                <span className="simi-event-attending-dot" />
                                                <span className="simi-event-attending-name-text">
                                                    {st.name || st.user_name || 'Semillerista'}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="simi-event-no-attending-msg">
                                            Aún sin confirmaciones
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Botones de Asistencia Limpios sin Doble Ícono */}
                            <div 
                                className="simi-event-rsvp-actions"
                                onClick={e => e.stopPropagation()}
                            >
                                <button 
                                    onClick={(e) => {
                                        if (effectiveLocked) return;
                                        e.stopPropagation();
                                        handleSetRsvp(evt.id, 'attending');
                                    }}
                                    disabled={effectiveLocked}
                                    className={`simi-event-rsvp-btn attending ${userRsvp === 'attending' ? 'active' : ''}`}
                                    title={effectiveLocked ? "Actividad bloqueada" : "Confirmar que asistirás a esta visita"}
                                >
                                    <Check size={15} /> Asistiré
                                </button>

                                <button 
                                    onClick={(e) => {
                                        if (effectiveLocked) return;
                                        e.stopPropagation();
                                        handleSetRsvp(evt.id, 'not_attending');
                                    }}
                                    disabled={effectiveLocked}
                                    className={`simi-event-rsvp-btn not-attending ${userRsvp === 'not_attending' ? 'active' : ''}`}
                                    title={effectiveLocked ? "Actividad bloqueada" : "Indicar que no podrás asistir a esta salida"}
                                >
                                    <X size={15} /> No Asistiré
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL DETALLES DE VISITA & LISTA DE ASISTENCIA */}
            {viewingEvent && (
                <div className="simi-modal-backdrop" onClick={() => setViewingEvent(null)}>
                    <div className="simi-modal-card" style={{ maxWidth: '580px', maxHeight: '88vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div className="simi-modal-header">
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 850, color: '#0f172a' }}>
                                    🏫 {viewingEvent.schoolName || viewingEvent.school_name || viewingEvent.title || 'Institución Educativa STEAM'}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <span style={{ fontSize: '0.76rem', color: '#0284c7', fontWeight: 800 }}>
                                        {viewingEvent.status}
                                    </span>
                                    {viewingEvent.attendanceConfirmed && (
                                        <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 800 }}>
                                            • ✓ Asistencia Oficial Convalidada
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={() => setViewingEvent(null)} 
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #B541FA 0%, #192584 100%)',
                                    border: '1.5px solid #4FD2E9',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(181, 65, 250, 0.35)',
                                    transition: 'all 0.15s ease'
                                }}
                                title="Cerrar modal"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', color: '#334155' }}>
                            <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
                                <div>📅 <strong>Fecha y Horario:</strong> {formatSimiDate(viewingEvent.date)} ({viewingEvent.time})</div>
                                <div style={{ marginTop: '4px' }}>📍 <strong>Lugar:</strong> {viewingEvent.location}</div>
                                <div style={{ marginTop: '4px' }}>👨‍🏫 <strong>Responsable:</strong> {viewingEvent.leader}</div>
                                <div style={{ marginTop: '4px' }}>
                                    ⚡ <strong>Recompensa de Experiencia:</strong> <span style={{ color: '#0284c7', fontWeight: 800 }}>+100 EXP</span>
                                </div>
                                <div style={{ marginTop: '4px' }}>
                                    🎖️ <strong>Insignia del Semillero:</strong> {viewingEvent.attendanceConfirmed || viewingEvent.status === 'Realizada' ? (
                                        <span style={{ color: '#059669', fontWeight: 800 }}>Otorgada ({viewingEvent.badgeTier || 'Misión Escolar'})</span>
                                    ) : (
                                        <span style={{ color: '#64748b' }}>Se otorga al convalidar asistencia ({viewingEvent.badgeTier || 'Misión Escolar'})</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <strong style={{ color: '#0f172a' }}>🎯 Misión y Objetivos Pedagógicos:</strong>
                                <p style={{ margin: '4px 0 0 0', color: '#475569', lineHeight: 1.5 }}>
                                    {viewingEvent.objective}
                                </p>
                            </div>

                            <div>
                                <strong style={{ color: '#0f172a' }}>📦 Equipamiento & Insumos Desplegados:</strong>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                                    {(viewingEvent.equipment || []).map((eq, idx) => (
                                        <span key={idx} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '7px', fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>
                                            • {eq}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* LISTA DE ASISTENCIA REGISTRADA */}
                            <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '0.9rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <strong style={{ color: '#0f172a', fontSize: '0.86rem' }}>
                                        👥 Registro de Semilleristas Inscritos:
                                    </strong>
                                    <span style={{ fontSize: '0.76rem', color: '#0284c7', fontWeight: 800 }}>
                                        {(viewingEvent.attendees || []).filter(a => a.status === 'attending').length} Confirmados
                                    </span>
                                </div>

                                {(viewingEvent.attendees || []).length === 0 ? (
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                                        Aún no hay registros de asistencia para esta visita escolar.
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                                        {viewingEvent.attendees.map((att, aIdx) => {
                                            const isAttending = att.status === 'attending' || att.status === 'Asistiré';
                                            const isVerified = att.attended === true || att.attended === 1;

                                            return (
                                                <div key={aIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '6px 10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ fontWeight: 700, color: '#0f172a' }}>
                                                            {att.name}
                                                        </span>
                                                        {isVerified && (
                                                            <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontWeight: 800, border: '1px solid #bbf7d0' }}>
                                                                ✓ Convalidado
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontWeight: 850, color: isAttending ? '#059669' : '#e11d48' }}>
                                                            {isAttending ? '✓ Asistirá' : '✗ No asistirá'}
                                                        </span>
                                                        {isLeader && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleVerifyStudentAttendance(viewingEvent.id, att.userId, !isVerified)}
                                                                style={{
                                                                    background: isVerified ? '#f0fdf4' : '#f8fafc',
                                                                    border: `1px solid ${isVerified ? '#86efac' : '#cbd5e1'}`,
                                                                    color: isVerified ? '#16a34a' : '#64748b',
                                                                    padding: '3px 7px',
                                                                    borderRadius: '6px',
                                                                    fontSize: '0.72rem',
                                                                    fontWeight: 800,
                                                                    cursor: 'pointer'
                                                                }}
                                                                title="Convalidar presencia real en el colegio"
                                                            >
                                                                {isVerified ? 'Presente ✓' : 'Marcar Asistió'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* BARRA DE ACCIÓN RÁPIDA DE ESTADO (LÍDER/DOCENTE) */}
                            {isLeader && (
                                <div style={{ background: 'var(--surface-sunken, #f8fafc)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1.5px solid var(--border-default, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-heading, #0f172a)' }}>
                                            ⚡ Gestión de Estado y Archivo:
                                        </span>
                                        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary, #64748b)' }}>
                                            Estado actual: <strong>{viewingEvent.status || 'Programada'}</strong>
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickStatusChange(viewingEvent.id, 'Realizada')}
                                            style={{
                                                background: viewingEvent.status === 'Realizada' ? '#059669' : '#ecfdf5',
                                                color: viewingEvent.status === 'Realizada' ? '#ffffff' : '#059669',
                                                border: '1.5px solid #10b981',
                                                padding: '5px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.74rem',
                                                fontWeight: 850,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ✓ Realizada (Convalidar)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickStatusChange(viewingEvent.id, 'Cancelada')}
                                            style={{
                                                background: viewingEvent.status === 'Cancelada' ? '#e11d48' : '#fff1f2',
                                                color: viewingEvent.status === 'Cancelada' ? '#ffffff' : '#e11d48',
                                                border: '1.5px solid #fecdd3',
                                                padding: '5px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.74rem',
                                                fontWeight: 850,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ✗ Cancelada
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickStatusChange(viewingEvent.id, 'Archivada')}
                                            style={{
                                                background: viewingEvent.status === 'Archivada' ? '#475569' : '#f1f5f9',
                                                color: viewingEvent.status === 'Archivada' ? '#ffffff' : '#475569',
                                                border: '1.5px solid #cbd5e1',
                                                padding: '5px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.74rem',
                                                fontWeight: 850,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            🗄️ Archivar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickStatusChange(viewingEvent.id, 'Programada')}
                                            style={{
                                                background: viewingEvent.status === 'Programada' ? '#0891b2' : '#ecfeff',
                                                color: viewingEvent.status === 'Programada' ? '#ffffff' : '#0891b2',
                                                border: '1.5px solid #a5f3fc',
                                                padding: '5px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.74rem',
                                                fontWeight: 850,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            🕒 Programada
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ACCIÓN DOCENTE / LÍDER PARA OTORGAR INSIGNIA Y CONVALIDAR */}
                            {isLeader && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ecfdf5', padding: '0.85rem 1rem', borderRadius: '12px', border: '1.5px solid #a7f3d0' }}>
                                    <div>
                                        <div style={{ fontWeight: 850, fontSize: '0.82rem', color: '#065f46' }}>
                                            {viewingEvent.attendanceConfirmed ? '✓ Asistencia Confirmada' : 'Validación Docente'}
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: '#047857' }}>
                                            {viewingEvent.attendanceConfirmed ? 'La insignia fue otorgada a los asistentes.' : 'Otorga la insignia y convalida el 80% de asistencia.'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggleConfirmAttendance(viewingEvent.id)}
                                        style={{
                                            background: viewingEvent.attendanceConfirmed ? '#e11d48' : '#059669',
                                            color: '#ffffff',
                                            border: 'none',
                                            padding: '7px 14px',
                                            borderRadius: '8px',
                                            fontSize: '0.78rem',
                                            fontWeight: 850,
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {viewingEvent.attendanceConfirmed ? 'Revocar Validación' : 'Confirmar & Otorgar Insignia'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ACCIONES DEL FOOTER: EDITAR Y ELIMINAR CENTRADOS DENTRO DEL MODAL */}
                        {isLeader && (
                            <div style={{ display: 'flex', gap: '12px', marginTop: '1.25rem', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                <button 
                                    onClick={() => {
                                        const evtToEdit = viewingEvent;
                                        setViewingEvent(null);
                                        handleOpenEdit(evtToEdit);
                                    }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        background: '#f0f9ff',
                                        color: '#0284c7',
                                        border: '1.5px solid #bae6fd',
                                        padding: '9px 24px',
                                        borderRadius: '10px',
                                        fontSize: '0.84rem',
                                        fontWeight: 850,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.12)'
                                    }}
                                    title="Editar detalles de la visita"
                                >
                                    <Edit3 size={15} /> Editar
                                </button>

                                <button 
                                    onClick={() => {
                                        const idToDelete = viewingEvent.id;
                                        setViewingEvent(null);
                                        handleDelete(idToDelete);
                                    }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        background: '#fff1f2',
                                        color: '#e11d48',
                                        border: '1.5px solid #fecdd3',
                                        padding: '9px 24px',
                                        borderRadius: '10px',
                                        fontSize: '0.84rem',
                                        fontWeight: 850,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        boxShadow: '0 2px 8px rgba(225, 29, 72, 0.12)'
                                    }}
                                    title="Eliminar esta visita escolar"
                                >
                                    <Trash2 size={15} /> Eliminar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL PARA AGENDAR / EDITAR VISITA ESCOLAR */}
            {isAddModalOpen && (
                <div className="simi-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
                    <div className="simi-modal-card" style={{ maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div className="simi-modal-header">
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                                    {editingEvent ? '✏️ Editar Visita Escolar' : '🏫 Agendar Nueva Visita Escolar'}
                                </h3>
                                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    Registra la institución, fecha, objetivo pedagógico y equipamiento para la salida STEAM.
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="simi-modal-close-btn"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.35rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                                <div className="simi-form-group">
                                    <label className="simi-form-label">Tipo de Evento:</label>
                                    <select 
                                        className="simi-form-input" 
                                        value={formEventType} 
                                        onChange={e => setFormEventType(e.target.value)}
                                        style={{ fontWeight: 800, color: formEventType === 'capacitacion_tecnica' ? '#06b6d4' : formEventType === 'trabajo_proyecto' ? '#38bdf8' : '#10b981' }}
                                    >
                                        <option value="visita_escolar">🏫 Visita Pedagógica Escolar</option>
                                        <option value="capacitacion_tecnica">⚡ Capacitación Técnica / Taller</option>
                                        <option value="trabajo_proyecto">🛠️ Trabajo de Proyectos / Prototipado</option>
                                    </select>
                                </div>
                                <div className="simi-form-group">
                                    <label className="simi-form-label">Estudiantes / Asistentes:</label>
                                    <input 
                                        type="number" 
                                        className="simi-form-input" 
                                        value={formStudentsCount} 
                                        onChange={e => setFormStudentsCount(e.target.value)} 
                                        min={1}
                                    />
                                </div>
                            </div>

                            <div className="simi-form-group">
                                <label className="simi-form-label">
                                    {formEventType === 'capacitacion_tecnica' ? 'Título del Taller / Capacitación:' : 'Colegio / Institución Educativa:'}
                                </label>
                                <input 
                                    type="text" 
                                    className="simi-form-input" 
                                    placeholder={formEventType === 'capacitacion_tecnica' ? 'Ej: Masterclass de Tolerancias y DFAM en Fusion 360' : 'Ej: I.E.D. San Pedro Alejandrino...'}
                                    value={formSchoolName} 
                                    onChange={e => setFormSchoolName(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                                <div className="simi-form-group">
                                    <label className="simi-form-label">Fecha:</label>
                                    <input 
                                        type="date" 
                                        className="simi-form-input" 
                                        value={formDate} 
                                        onChange={e => setFormDate(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="simi-form-group">
                                    <label className="simi-form-label">Horario:</label>
                                    <input 
                                        type="text" 
                                        className="simi-form-input" 
                                        placeholder="Ej: 8:30 AM – 12:00 PM" 
                                        value={formTime} 
                                        onChange={e => setFormTime(e.target.value)} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                                <div className="simi-form-group">
                                    <label className="simi-form-label">Estado:</label>
                                    <select 
                                        className="simi-form-input" 
                                        value={formStatus} 
                                        onChange={e => setFormStatus(e.target.value)}
                                    >
                                        <option value="Programada">Programada</option>
                                        <option value="Confirmada">Confirmada</option>
                                        <option value="En Preparación">En Preparación</option>
                                        <option value="Realizada">Realizada</option>
                                        <option value="Reprogramada">Reprogramada</option>
                                    </select>
                                </div>
                                <div className="simi-form-group">
                                    <label className="simi-form-label">Líder / Responsable:</label>
                                    <input 
                                        type="text" 
                                        className="simi-form-input" 
                                        value={formLeader} 
                                        onChange={e => setFormLeader(e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div className="simi-form-group">
                                <label className="simi-form-label">Objetivo Pedagógico / Misión STEAM:</label>
                                <textarea 
                                    className="simi-form-input" 
                                    rows={2} 
                                    placeholder="Describe el propósito del taller, demostración de impresión o capacitación..." 
                                    value={formObjective} 
                                    onChange={e => setFormObjective(e.target.value)} 
                                />
                            </div>

                            <div className="simi-form-group">
                                <label className="simi-form-label">Equipamiento e Insumos (separados por coma):</label>
                                <input 
                                    type="text" 
                                    className="simi-form-input" 
                                    placeholder="Ej: 2× Impresoras 3D FDM portátiles, Muestras impresas, Filamento PLA..." 
                                    value={formEquipment} 
                                    onChange={e => setFormEquipment(e.target.value)} 
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button 
                                    type="button" 
                                    className="simi-res-mini-btn"
                                    onClick={() => setIsAddModalOpen(false)}
                                    style={{ padding: '8px 16px', borderRadius: '10px' }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    style={{
                                        background: '#06b6d4',
                                        color: '#042f2e',
                                        border: 'none',
                                        padding: '8px 20px',
                                        borderRadius: '10px',
                                        fontWeight: 850,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px -2px rgba(6, 182, 212, 0.4)'
                                    }}
                                >
                                    {editingEvent ? 'Guardar Cambios' : 'Agendar Visita'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
