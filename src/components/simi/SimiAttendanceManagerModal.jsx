import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, Zap, Users, Check, Clock, AlertTriangle, Play, Square,
    RefreshCw, Search, ShieldCheck, Flame, Cpu, Layers, Box, 
    Sparkles, School, CheckCircle2, ChevronRight, ChevronDown, UserCheck,
    Calendar, FileText, History, Edit3, Plus, MoreVertical, Trash2
} from 'lucide-react';
import { 
    SIMI_WORD_FAMILIES, 
    SIMI_ATTENDANCE_STATES, 
    FLASH_DURATION_OPTIONS, 
    generateFlashChallenge 
} from '../../data/simiAttendanceData';
import { api } from '../../lib/api';
import '../../styles/SimiAttendance.css';

const ICON_MAP = {
    Flame, Cpu, Layers, Box, Sparkles, AlertTriangle, School
};

export default function SimiAttendanceManagerModal({
    isOpen,
    onClose,
    event,
    members = [],
    onAttendanceUpdated
}) {
    if (!isOpen || !event) return null;

    const [activeTab, setActiveTab] = useState('flash'); // 'flash' | 'manual'
    const eventId = event.id;
    const eventTitle = event.school_name || event.schoolName || event.title || 'Sesión SIMI3D';
    const eventType = event.event_type || event.eventType || 'capacitacion_tecnica';
    const isSchoolVisit = eventType !== 'capacitacion_tecnica';

    // ── ESTADO MODO FLASH (DINÁMICO 2FA) ──
    const [durationSeconds, setDurationSeconds] = useState(20);
    const [selectedFamilyKey, setSelectedFamilyKey] = useState('filamentos');
    const [challenge, setChallenge] = useState(() => generateFlashChallenge('filamentos'));
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [secondsRemaining, setSecondsRemaining] = useState(0);
    const [verifiedCount, setVerifiedCount] = useState(0);
    const timerRef = useRef(null);

    // Regenerar reto cuando cambia la familia
    const handleFamilyChange = (famKey) => {
        setSelectedFamilyKey(famKey);
        setChallenge(generateFlashChallenge(famKey));
    };

    const handleRandomizeChallenge = () => {
        setChallenge(generateFlashChallenge(selectedFamilyKey));
    };

    // Función para refrescar asistencias registradas desde el backend
    const refreshAttendeesFromApi = async () => {
        try {
            const res = await api('/simi');
            if (res?.data?.events) {
                const updatedEvt = res.data.events.find(e => e.id === eventId);
                if (updatedEvt) {
                    if (updatedEvt.sessions && Array.isArray(updatedEvt.sessions) && updatedEvt.sessions.length > 0) {
                        setSessions(updatedEvt.sessions);
                        const cur = updatedEvt.sessions.find(s => s.id === activeSessionId);
                        if (cur && cur.attendances) {
                            setStudentStates(prev => ({ ...prev, ...cur.attendances }));
                        }
                    } else if (updatedEvt.attendees) {
                        const newStates = {};
                        updatedEvt.attendees.forEach(a => {
                            if (a.userId) newStates[a.userId] = a.status || (a.attended ? 'asistio' : 'no_vino');
                        });
                        setStudentStates(prev => ({ ...prev, ...newStates }));
                    }
                }
            }
        } catch (_) {}
    };

    // Lanzar sesión flash
    const handleStartFlash = async () => {
        try {
            setIsSessionActive(true);
            setSecondsRemaining(durationSeconds);

            const res = await api('/simi', {
                method: 'POST',
                body: {
                    action: 'start-flash-attendance',
                    eventId,
                    sessionId: activeSessionId,
                    eventTitle,
                    eventType,
                    targetWord: challenge.targetWord,
                    options: challenge.options,
                    familyName: challenge.familyTitle,
                    durationSeconds,
                    sessionDate,
                    sessionTopic
                }
            });

            // Conteo regresivo en pantalla del docente
            let currentSec = durationSeconds;
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                currentSec -= 1;
                setSecondsRemaining(currentSec);
                if (currentSec <= 0) {
                    clearInterval(timerRef.current);
                    setIsSessionActive(false);
                    refreshAttendeesFromApi();
                }
            }, 1000);

        } catch (err) {
            console.error('[SIMI] Error lanzando asistencia flash:', err);
            setIsSessionActive(false);
        }
    };

    // Detener sesión antes de tiempo
    const handleStopFlash = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsSessionActive(false);
        setSecondsRemaining(0);
        try {
            await api('/simi', {
                method: 'POST',
                body: { action: 'close-flash-attendance' }
            });
        } catch (e) {}
        refreshAttendeesFromApi();
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // ── LISTA SEGURA DE MIEMBROS CON FALLBACK INTELIGENTE ──
    const safeMembers = useMemo(() => {
        let list = Array.isArray(members) && members.length > 0 ? members : [];
        if (list.length === 0) {
            const local = localStorage.getItem('simi_members_list');
            if (local) {
                try {
                    const parsed = JSON.parse(local);
                    if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
                } catch (e) {}
            }
        }
        // Si la lista solo tiene al director/docente o está vacía, incluir a los estudiantes del semillero
        const hasStudents = list.some(m => m.role === 'student' || (m.email && !m.email.toLowerCase().includes('rovimartinez')));
        if (!hasStudents) {
            const defaultStudents = [
                { id: 'usr-1', email: 'carlos.mendoza@unimagdalena.edu.co', full_name: 'Carlos Mendoza', role: 'student', group_name: 'Semillerista SIMI3D' },
                { id: 'usr-2', email: 'laura.gomez@unimagdalena.edu.co', full_name: 'Laura Gómez', role: 'student', group_name: 'Semillerista SIMI3D' },
                { id: 'usr-3', email: 'andres.perez@unimagdalena.edu.co', full_name: 'Andrés Pérez', role: 'student', group_name: 'Semillerista SIMI3D' },
                { id: 'usr-4', email: 'valentina.rodriguez@unimagdalena.edu.co', full_name: 'Valentina Rodríguez', role: 'student', group_name: 'Semillerista SIMI3D' },
                { id: 'usr-5', email: 'mateo.herrera@unimagdalena.edu.co', full_name: 'Mateo Herrera', role: 'student', group_name: 'Semillerista SIMI3D' }
            ];
            list = [...list, ...defaultStudents];
        }
        return list;
    }, [members]);

    // ── GESTIÓN DE CLASES / SESIONES (C1, C2, C3...) ──
    const [sessions, setSessions] = useState(() => {
        if (event.sessions && Array.isArray(event.sessions) && event.sessions.length > 0) {
            return event.sessions;
        }
        const initialDate = event.date ? (new Date(event.date).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0];
        const initialTopic = event.last_topic || event.session_topic || event.objective || '';
        const initialStates = {};
        (event.attendees || []).forEach(a => {
            const uId = a.userId || a.id || a.email;
            if (uId) {
                initialStates[uId] = a.status || (a.attended ? 'asistio' : 'no_vino');
            }
        });
        return [
            {
                id: 'c1',
                name: 'C1',
                title: 'Clase 1',
                date: initialDate,
                topic: initialTopic,
                attendances: initialStates
            }
        ];
    });

    const [activeSessionId, setActiveSessionId] = useState(() => {
        if (event.sessions && Array.isArray(event.sessions) && event.sessions.length > 0) {
            return event.sessions[event.sessions.length - 1].id || 'c1';
        }
        return 'c1';
    });

    // Controla si se está editando una sesión en Lista Tradicional (en blanco por defecto al ingresar a la pestaña)
    const [isEditingSession, setIsEditingSession] = useState(false);
    // Controla qué tarjeta lateral tiene el popup de acciones activo
    const [hoveredCardSessionId, setHoveredCardSessionId] = useState(null);

    const currentSession = useMemo(() => {
        return sessions.find(s => s.id === activeSessionId) || sessions[0] || {
            id: 'c1',
            name: 'C1',
            date: new Date().toISOString().split('T')[0],
            topic: '',
            attendances: {}
        };
    }, [sessions, activeSessionId]);

    // ── FECHA Y QUÉ SE HIZO EN LA SESIÓN (BITÁCORA) ──
    const [sessionDate, setSessionDate] = useState(() => {
        return currentSession.date || new Date().toISOString().split('T')[0];
    });

    const [sessionTopic, setSessionTopic] = useState(() => {
        return currentSession.topic || '';
    });

    // ── ESTADO MODO MANUAL (LISTA TRADICIONAL 3 ESTADOS) ──
    const [searchTerm, setSearchTerm] = useState('');
    const [studentStates, setStudentStates] = useState(() => {
        const stateMap = {};
        const sessAttendances = currentSession.attendances || {};
        const existingAttendees = event.attendees || [];
        
        safeMembers.forEach(m => {
            const mId = m.id || m.email;
            if (sessAttendances[mId]) {
                stateMap[mId] = sessAttendances[mId];
            } else {
                const found = existingAttendees.find(a => a.userId === mId);
                if (found) {
                    stateMap[mId] = (found.status === 'asistio' || found.status === 'incompleto' || found.status === 'no_vino')
                        ? found.status
                        : (found.attended ? 'asistio' : 'no_vino');
                } else {
                    stateMap[mId] = 'no_vino';
                }
            }
        });
        return stateMap;
    });

    // Cambiar de sesión (C1, C2...) preservando los datos de la anterior y activando la edición
    const handleSelectSession = (sId, startEdit = true) => {
        // 1. Guardar cambios de la sesión activa en el array sessions
        const updatedSessions = sessions.map(s => {
            if (s.id === activeSessionId) {
                return {
                    ...s,
                    date: sessionDate,
                    topic: sessionTopic,
                    attendances: { ...studentStates }
                };
            }
            return s;
        });
        setSessions(updatedSessions);

        // 2. Cargar la sesión destino
        const target = updatedSessions.find(s => s.id === sId);
        if (target) {
            setActiveSessionId(sId);
            setSessionDate(target.date || new Date().toISOString().split('T')[0]);
            setSessionTopic(target.topic || '');
            
            const loadedStates = {};
            safeMembers.forEach(m => {
                const mId = m.id || m.email;
                loadedStates[mId] = (target.attendances && target.attendances[mId]) || 'no_vino';
            });
            setStudentStates(loadedStates);
        }
        if (startEdit) {
            setIsEditingSession(true);
        }
    };

    // Agregar nueva clase (C2, C3...) sin reemplazar las existentes con auto-persistencia inmediata
    const handleAddNewSession = async () => {
        // 1. Guardar cambios de la sesión que estaba abierta
        const currentUpdatedSessions = sessions.map(s => {
            if (s.id === activeSessionId) {
                return {
                    ...s,
                    date: sessionDate,
                    topic: sessionTopic,
                    attendances: { ...studentStates }
                };
            }
            return s;
        });

        const nextNum = currentUpdatedSessions.length + 1;
        const newId = `c${nextNum}`;
        const todayStr = new Date().toISOString().split('T')[0];

        const newAttendances = {};
        safeMembers.forEach(m => {
            const mId = m.id || m.email;
            newAttendances[mId] = 'no_vino';
        });

        const newSession = {
            id: newId,
            name: `C${nextNum}`,
            title: `Clase ${nextNum}`,
            date: todayStr,
            topic: '',
            attendances: newAttendances
        };

        const nextSessions = [...currentUpdatedSessions, newSession];
        setSessions(nextSessions);
        setActiveSessionId(newId);
        setSessionDate(todayStr);
        setSessionTopic('');
        setStudentStates(newAttendances);
        setIsEditingSession(true);
        setActiveTab('manual');

        // 2. Persistencia atómica inmediata en D1 y estado padre para blindar contra reemplazos accidentales
        const payload = safeMembers.map(m => {
            const uId = m.id || m.email;
            return {
                userId: uId,
                userName: m.full_name || m.name || m.email,
                status: 'no_vino'
            };
        });

        try {
            await api('/simi', {
                method: 'POST',
                body: {
                    action: 'batch-save-attendance',
                    eventId,
                    sessionId: newId,
                    sessionDate: todayStr,
                    sessionTopic: '',
                    attendances: payload,
                    sessions: nextSessions
                }
            });
        } catch (err) {
            console.warn('[SIMI] Auto-persistencia de nueva sesión:', err);
        }

        if (onAttendanceUpdated) {
            onAttendanceUpdated(payload.map(p => ({
                userId: p.userId,
                name: p.userName,
                status: p.status,
                attended: false,
                attendedWeight: 0,
                updatedAt: new Date().toISOString()
            })), { 
                sessionId: newId,
                sessionDate: todayStr, 
                sessionTopic: '',
                sessions: nextSessions
            });
        }
    };

    // Eliminar una clase del historial de sesiones
    const handleDeleteSession = async (sIdToDelete) => {
        if (sessions.length <= 1) {
            const todayStr = new Date().toISOString().split('T')[0];
            const resetSession = [{
                id: 'c1',
                name: 'C1',
                title: 'Clase 1',
                date: todayStr,
                topic: '',
                attendances: {}
            }];
            setSessions(resetSession);
            setActiveSessionId('c1');
            setSessionDate(todayStr);
            setSessionTopic('');
            const resetStates = {};
            safeMembers.forEach(m => { resetStates[m.id || m.email] = 'no_vino'; });
            setStudentStates(resetStates);
            setOpenMenuSessionId(null);
            return;
        }

        const filtered = sessions.filter(s => s.id !== sIdToDelete);
        const reindexed = filtered.map((s, idx) => ({
            ...s,
            name: `C${idx + 1}`,
            title: `Clase ${idx + 1}`
        }));

        setSessions(reindexed);
        const nextActive = (activeSessionId === sIdToDelete)
            ? (reindexed[0]?.id || 'c1')
            : activeSessionId;
        setActiveSessionId(nextActive);

        const targetSess = reindexed.find(s => s.id === nextActive) || reindexed[0];
        if (targetSess) {
            setSessionDate(targetSess.date || new Date().toISOString().split('T')[0]);
            setSessionTopic(targetSess.topic || '');
            const loadedStates = {};
            safeMembers.forEach(m => {
                const mId = m.id || m.email;
                loadedStates[mId] = (targetSess.attendances && targetSess.attendances[mId]) || 'no_vino';
            });
            setStudentStates(loadedStates);
        }

        setOpenMenuSessionId(null);

        try {
            await api('/simi', {
                method: 'POST',
                body: {
                    action: 'batch-save-attendance',
                    eventId,
                    sessionId: nextActive,
                    sessionDate: targetSess?.date || new Date().toISOString().split('T')[0],
                    sessionTopic: targetSess?.topic || '',
                    attendances: safeMembers.map(m => ({
                        userId: m.id || m.email,
                        userName: m.full_name || m.name || m.email,
                        status: (targetSess?.attendances && targetSess.attendances[m.id || m.email]) || 'no_vino'
                    })),
                    sessions: reindexed
                }
            });
        } catch (err) {
            console.error('[SIMI] Error eliminando sesión:', err);
        }

        if (onAttendanceUpdated) {
            onAttendanceUpdated(safeMembers.map(m => ({
                userId: m.id || m.email,
                name: m.full_name || m.name || m.email,
                status: (targetSess?.attendances && targetSess.attendances[m.id || m.email]) || 'no_vino',
                attended: (targetSess?.attendances && targetSess.attendances[m.id || m.email]) === 'asistio',
                updatedAt: new Date().toISOString()
            })), {
                sessionId: nextActive,
                sessions: reindexed
            });
        }
    };

    // Sincronizar sesiones si event.sessions cambia externamente desde D1 o componente padre
    useEffect(() => {
        if (event?.sessions && Array.isArray(event.sessions) && event.sessions.length > 0) {
            setSessions(prev => {
                if (event.sessions.length >= prev.length) {
                    return event.sessions;
                }
                return prev;
            });
        }
    }, [event?.id, event?.sessions]);

    // Sincronizar estados si la lista de miembros cambia
    useEffect(() => {
        setStudentStates(prev => {
            const next = { ...prev };
            safeMembers.forEach(m => {
                const mId = m.id || m.email;
                if (!next[mId]) {
                    next[mId] = (currentSession.attendances && currentSession.attendances[mId]) || 'no_vino';
                }
            });
            return next;
        });
    }, [safeMembers, currentSession]);

    const [isSavingManual, setIsSavingManual] = useState(false);
    const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

    // Cambiar estado individual de un alumno
    const handleToggleState = (userId, newState) => {
        setStudentStates(prev => {
            const updated = {
                ...prev,
                [userId]: newState
            };
            setSessions(curSess => curSess.map(s => {
                if (s.id === activeSessionId) {
                    return {
                        ...s,
                        attendances: updated
                    };
                }
                return s;
            }));
            return updated;
        });
    };

    // Marcar a todos con un estado
    const handleMarkAll = (state) => {
        const updated = {};
        safeMembers.forEach(m => {
            const mId = m.id || m.email;
            updated[mId] = state;
        });
        setStudentStates(updated);
        setSessions(curSess => curSess.map(s => {
            if (s.id === activeSessionId) {
                return {
                    ...s,
                    attendances: updated
                };
            }
            return s;
        }));
    };

    // Guardado en lote hacia Cloudflare D1
    const handleSaveManualList = async () => {
        setIsSavingManual(true);
        const finalSessions = sessions.map(s => {
            if (s.id === activeSessionId) {
                return {
                    ...s,
                    date: sessionDate,
                    topic: sessionTopic,
                    attendances: { ...studentStates }
                };
            }
            return s;
        });

        const payload = safeMembers.map(m => {
            const uId = m.id || m.email;
            return {
                userId: uId,
                userName: m.full_name || m.name || m.email,
                status: studentStates[uId] || 'no_vino'
            };
        });

        // 1. Actualización optimista inmediata en memoria local (0ms de retraso percibido)
        setSessions(finalSessions);
        if (onAttendanceUpdated) {
            const updatedAttendees = payload.map(p => ({
                userId: p.userId,
                name: p.userName,
                status: p.status,
                attended: p.status !== 'no_vino',
                attendedWeight: p.status === 'asistio' ? 1.0 : (p.status === 'incompleto' ? 0.5 : 0.0),
                updatedAt: new Date().toISOString()
            }));
            onAttendanceUpdated(updatedAttendees, { 
                sessionId: activeSessionId,
                sessionDate, 
                sessionTopic,
                sessions: finalSessions
            });
        }

        try {
            // 2. Persistencia en la base de datos Cloudflare D1 en background
            await api('/simi', {
                method: 'POST',
                body: {
                    action: 'batch-save-attendance',
                    eventId,
                    sessionId: activeSessionId,
                    sessionDate,
                    sessionTopic,
                    attendances: payload,
                    sessions: finalSessions
                }
            });

            setSaveSuccessNotice(true);
            setTimeout(() => setSaveSuccessNotice(false), 2200);
        } catch (err) {
            console.error('[SIMI] Error guardando lista de asistencia:', err);
        } finally {
            setIsSavingManual(false);
        }
    };

    // Filtro y resumen de conteos
    const filteredMembers = useMemo(() => {
        return safeMembers.filter(m => {
            const q = searchTerm.toLowerCase();
            return (m.full_name || '').toLowerCase().includes(q) ||
                   (m.email || '').toLowerCase().includes(q);
        });
    }, [safeMembers, searchTerm]);

    const statsCounts = useMemo(() => {
        let asistio = 0;
        let incompleto = 0;
        let noVino = 0;
        Object.values(studentStates).forEach(st => {
            if (st === 'asistio') asistio++;
            else if (st === 'incompleto') incompleto++;
            else noVino++;
        });
        const effectiveScore = (asistio * 1.0) + (incompleto * 0.5);
        return { 
            asistio, 
            incompleto, 
            noVino, 
            no_vino: noVino, 
            effectiveScore, 
            total: safeMembers.length 
        };
    }, [studentStates, safeMembers]);

    return createPortal(
        <div className="simi-att-modal-overlay" onClick={onClose}>
            <div className="simi-att-modal-layout" onClick={(e) => {
                e.stopPropagation();
                setHoveredCardSessionId(null);
            }}>
                
                {/* 1. TARJETA PRINCIPAL (GESTIÓN DE ASISTENCIA) */}
                <div className="simi-att-modal-container">
                    
                    {/* ENCABEZADO */}
                    <div className="simi-att-modal-header">
                        <div className="simi-att-header-info">
                            <div className="simi-att-header-icon">
                                <Users size={22} />
                            </div>
                            <div>
                                <h3 className="simi-att-header-title">
                                    Control de Asistencia · SIMI3D
                                </h3>
                                <p className="simi-att-header-subtitle">
                                    Registro de Clases y Asistencia · Semillero SIMI3D
                                </p>
                            </div>
                        </div>
                        <button className="simi-att-close-btn" onClick={onClose} title="Cerrar ventana">
                            <X size={20} />
                        </button>
                    </div>

                    {/* PESTAÑAS (DINÁMICA, TRADICIONAL E HISTORIAL) */}
                    <div className="simi-att-nav-tabs">
                        <button 
                            className={`simi-att-tab-btn ${activeTab === 'flash' ? 'active' : ''}`}
                            onClick={() => setActiveTab('flash')}
                        >
                            <Zap size={18} />
                            <span>Lista Dinámica</span>
                        </button>
                        <button 
                            className={`simi-att-tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
                            onClick={() => setActiveTab('manual')}
                        >
                            <Users size={18} />
                            <span>Lista Tradicional ({currentSession.name})</span>
                        </button>
                        <button 
                            className={`simi-att-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            <History size={18} />
                            <span>Planilla General</span>
                        </button>
                    </div>

                    {/* CONTENIDO DEL MODAL */}
                    <div className="simi-att-modal-body">
                        
                        {/* Registro de Fecha y Bitácora de la Sesión (Visible en Dinámica y Tradicional) */}
                        {activeTab !== 'history' && (
                        <div className="simi-att-session-meta-card">
                            <div className="simi-att-session-meta-grid">
                                <div className="simi-att-session-field">
                                    <label className="simi-att-field-label">
                                        <Calendar size={13} color="#06b6d4" />
                                        <span>Fecha de la Sesión</span>
                                    </label>
                                    <input 
                                        type="date"
                                        className="simi-att-date-input"
                                        value={sessionDate}
                                        onChange={e => setSessionDate(e.target.value)}
                                    />
                                </div>
                                <div className="simi-att-session-field flex-grow">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label className="simi-att-field-label">
                                            <FileText size={13} color="#06b6d4" />
                                            <span>¿Qué se hizo en la sesión? (Tema / Bitácora de actividades)</span>
                                        </label>
                                        {event.objective && !sessionTopic && (
                                            <button
                                                type="button"
                                                onClick={() => setSessionTopic(event.objective)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#0284c7',
                                                    fontSize: '0.70rem',
                                                    fontWeight: 750,
                                                    cursor: 'pointer',
                                                    padding: 0,
                                                    textDecoration: 'underline'
                                                }}
                                                title="Reutilizar el objetivo registrado para este evento"
                                            >
                                                💡 Usar objetivo del evento
                                            </button>
                                        )}
                                    </div>
                                    <input 
                                        type="text"
                                        className="simi-att-topic-input"
                                        placeholder="Ej. Taller de Slicing FDM, calibración de extrusores e impresión de prototipos..."
                                        value={sessionTopic}
                                        onChange={e => setSessionTopic(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* ─── PESTAÑA A: FLASH DINÁMICA 2FA ─── */}
                    {activeTab === 'flash' && (
                        <div className="simi-att-flash-setup">
                            
                            {/* Barra Unificada: Familias en una sola fila y en la misma la duración */}
                            <div className="simi-att-config-bar">
                                {/* Selector de Familias Técnicas (Nombres simplificados en una sola fila) */}
                                <div className="simi-att-config-section simi-att-families-section">
                                    <div className="simi-att-config-label">
                                        <Sparkles size={13} color="#06b6d4" />
                                        <span>Familia</span>
                                    </div>
                                    <div className="simi-att-family-chips-single-row">
                                        {Object.values(SIMI_WORD_FAMILIES).map(fam => {
                                            const IconComp = ICON_MAP[fam.icon] || Flame;
                                            return (
                                                <button
                                                    key={fam.id}
                                                    className={`simi-att-family-chip ${selectedFamilyKey === fam.id ? 'active' : ''}`}
                                                    onClick={() => !isSessionActive && handleFamilyChange(fam.id)}
                                                    disabled={isSessionActive}
                                                    title={fam.description}
                                                >
                                                    <IconComp size={13} style={{ color: selectedFamilyKey === fam.id ? '#0284c7' : fam.color }} />
                                                    <span>{fam.title}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="simi-att-config-divider" />

                                {/* Selector de Duración (Desplegable) */}
                                <div className="simi-att-config-section simi-att-duration-section">
                                    <div className="simi-att-config-label">
                                        <Clock size={13} color="#06b6d4" />
                                        <span>Tiempo</span>
                                    </div>
                                    <div className="simi-att-duration-select-wrapper">
                                        <select
                                            className="simi-att-duration-select"
                                            value={durationSeconds}
                                            onChange={(e) => !isSessionActive && setDurationSeconds(Number(e.target.value))}
                                            disabled={isSessionActive}
                                        >
                                            {FLASH_DURATION_OPTIONS.map(sec => (
                                                <option key={sec} value={sec}>
                                                    {sec} seg
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="simi-att-select-arrow" />
                                    </div>
                                </div>
                            </div>

                            {/* Tarjeta Gigante de Proyección en Pantalla */}
                            <div className="simi-att-projection-box">
                                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                                    {challenge.familyTitle} · Palabra Clave Objetivo
                                </span>
                                
                                <h1 className="simi-att-target-word">
                                    {challenge.targetWord}
                                </h1>

                                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0 }}>
                                    Los estudiantes verán en su pantalla esta palabra mezclada entre 3 opciones de la misma familia.
                                </p>

                                <div className="simi-att-preview-options">
                                    {challenge.options.map(opt => (
                                        <span 
                                            key={opt} 
                                            className={`simi-att-preview-opt ${opt === challenge.targetWord ? 'target' : ''}`}
                                        >
                                            {opt}
                                        </span>
                                    ))}
                                </div>

                                {!isSessionActive && (
                                    <button 
                                        onClick={handleRandomizeChallenge}
                                        style={{
                                            marginTop: '6px',
                                            background: 'rgba(255,255,255,0.06)',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                            color: '#cbd5e1',
                                            padding: '5px 12px',
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        <RefreshCw size={12} />
                                        Barajar otra palabra
                                    </button>
                                )}
                            </div>

                            {/* Botón Lanzador / Detenedor */}
                            {!isSessionActive ? (
                                <button className="simi-att-launch-btn" onClick={handleStartFlash}>
                                    <Play size={20} fill="currentColor" />
                                    <span>Lanzar Asistencia Relámpago ({durationSeconds} segundos)</span>
                                </button>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ textAlign: 'center', fontWeight: 900, fontSize: '1.4rem', color: '#06b6d4' }}>
                                        ⏱️ Tiempo restante en vivo: <span style={{ color: '#f59e0b' }}>{secondsRemaining}s</span>
                                    </div>
                                    <button className="simi-att-launch-btn active-danger" onClick={handleStopFlash}>
                                        <Square size={18} fill="currentColor" />
                                        <span>Detener Verificación Ahora</span>
                                    </button>
                                </div>
                            )}

                        </div>
                    )}

                    {/* ─── PESTAÑA B: LISTA TRADICIONAL (3 ESTADOS EN TABLA) ─── */}
                    {activeTab === 'manual' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minHeight: 0 }}>
                            {/* Tabla Estructurada de Estudiantes con Selector de 3 Estados */}
                            <div className="simi-att-table-container">
                                <table className="simi-att-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '38px', textAlign: 'center' }}>#</th>
                                            <th>Estudiante</th>
                                            <th style={{ textAlign: 'center', width: '260px', minWidth: '250px' }}>Registro de Asistencia</th>
                                            <th style={{ textAlign: 'center', width: '80px' }}>Ponderación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMembers.map((member, idx) => {
                                            const mId = member.id || member.email;
                                            const currentState = studentStates[mId] || 'no_vino';
                                            const initial = (member.full_name || member.name || 'S').charAt(0).toUpperCase();

                                            return (
                                                <tr key={mId} className="simi-att-table-row">
                                                    <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 800 }}>
                                                        {idx + 1}
                                                    </td>
                                                    <td>
                                                        <div className="simi-att-student-cell">
                                                            {member.avatar_url ? (
                                                                <img src={member.avatar_url} alt="" className="simi-att-student-avatar" />
                                                            ) : (
                                                                <div className="simi-att-student-avatar">{initial}</div>
                                                            )}
                                                            <span className="simi-att-student-table-name">
                                                                {member.full_name || member.name || member.email}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="simi-att-state-toggle-group" style={{ justifyContent: 'center' }}>
                                                            <button
                                                                type="button"
                                                                className={`simi-att-state-chip ${currentState === 'asistio' ? 'active asistio' : ''}`}
                                                                onClick={() => handleToggleState(mId, 'asistio')}
                                                                title="Asistió completo (100%)"
                                                            >
                                                                <Check size={11} />
                                                                <span>Asistió</span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className={`simi-att-state-chip ${currentState === 'incompleto' ? 'active incompleto' : ''}`}
                                                                onClick={() => handleToggleState(mId, 'incompleto')}
                                                                title="Incompleto / Tardanza / Parcial (50%)"
                                                            >
                                                                <Clock size={11} />
                                                                <span>Incompleto</span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className={`simi-att-state-chip ${currentState === 'no_vino' ? 'active no_vino' : ''}`}
                                                                onClick={() => handleToggleState(mId, 'no_vino')}
                                                                title="No vino (0%)"
                                                            >
                                                                <X size={11} />
                                                                <span>No vino</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {currentState === 'asistio' && (
                                                            <span className="simi-att-weight-badge weight-100">100%</span>
                                                        )}
                                                        {currentState === 'incompleto' && (
                                                            <span className="simi-att-weight-badge weight-50">50%</span>
                                                        )}
                                                        {currentState === 'no_vino' && (
                                                            <span className="simi-att-weight-badge weight-0">0%</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {filteredMembers.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                        No se encontraron estudiantes para "{searchTerm}".
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ─── PESTAÑA C: HISTORIAL DE REGISTROS ─── */}
                    {activeTab === 'history' && (
                        <div className="simi-att-history-view">
                            {/* Tarjeta de Resumen de la Sesión */}
                            <div className="simi-att-history-summary-card">
                                <div className="simi-att-history-meta">
                                    <div className="simi-att-history-badge-row">
                                        <span className="simi-att-status-pill">
                                            <Calendar size={13} /> {sessionDate ? new Date(sessionDate + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Fecha sin definir'}
                                        </span>
                                    </div>
                                    <h4 className="simi-att-history-topic-title">
                                        {sessionTopic || event.objective || 'Sin bitácora registrada para esta sesión'}
                                    </h4>
                                </div>
                            </div>

                            {/* Tabla Compacta de Registros de la Sesión */}
                            <div className="simi-att-table-container">
                                <table className="simi-att-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '38px', textAlign: 'center' }}>#</th>
                                            <th>Estudiante</th>
                                            {sessions.map((sess) => {
                                                const sDate = sess.date || (sess.id === activeSessionId ? sessionDate : '');
                                                const sTopic = sess.topic || (sess.id === activeSessionId ? sessionTopic : '');
                                                const tooltipText = `${sess.name} (${sess.title || sess.name}): ${sTopic || 'Sin bitácora registrada'}${sDate ? ' · ' + sDate : ''}`;
                                                return (
                                                    <th 
                                                        key={sess.id}
                                                        style={{ width: '56px', textAlign: 'center', cursor: 'help' }}
                                                        title={tooltipText}
                                                    >
                                                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                                                            <span>{sess.name}</span>
                                                            <span style={{ fontSize: '0.58rem', color: '#06b6d4', opacity: 0.85 }} title={tooltipText}>ℹ️</span>
                                                        </div>
                                                    </th>
                                                );
                                            })}
                                            <th style={{ width: '85px', textAlign: 'center' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {safeMembers.map((m, idx) => {
                                            const mId = m.id || m.email;

                                            // Calcular porcentaje acumulado del estudiante entre todas las sesiones
                                            let totalWeight = 0;
                                            sessions.forEach(sess => {
                                                const st = (sess.id === activeSessionId)
                                                    ? (studentStates[mId] || 'no_vino')
                                                    : ((sess.attendances && sess.attendances[mId]) || 'no_vino');
                                                if (st === 'asistio') totalWeight += 1.0;
                                                else if (st === 'incompleto') totalWeight += 0.5;
                                            });
                                            const pct = sessions.length > 0 ? Math.round((totalWeight / sessions.length) * 100) : 0;

                                            return (
                                                <tr key={mId} className="simi-att-table-row">
                                                    <td style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>
                                                        {idx + 1}
                                                    </td>
                                                    <td>
                                                        <span className="simi-att-student-name" style={{ fontWeight: 700, color: 'var(--text-heading, #0f172a)' }}>
                                                            {m.full_name || m.name || m.email}
                                                        </span>
                                                    </td>
                                                    {sessions.map(sess => {
                                                        const st = (sess.id === activeSessionId)
                                                            ? (studentStates[mId] || 'no_vino')
                                                            : ((sess.attendances && sess.attendances[mId]) || 'no_vino');
                                                        const sDate = sess.date || '';
                                                        const sTopic = sess.topic || '';
                                                        return (
                                                            <td key={sess.id} style={{ textAlign: 'center' }}>
                                                                {st === 'asistio' && (
                                                                    <span title={`${sess.name}: Asistió (100%) - ${sTopic} (${sDate})`} style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <Check size={18} strokeWidth={3} />
                                                                    </span>
                                                                )}
                                                                {st === 'incompleto' && (
                                                                    <span title={`${sess.name}: Incompleto (50%) - ${sTopic} (${sDate})`} style={{ color: '#d97706', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem' }}>
                                                                        ½
                                                                    </span>
                                                                )}
                                                                {(st === 'no_vino' || !st) && (
                                                                    <span title={`${sess.name}: No asistió (0%) - ${sTopic} (${sDate})`} style={{ color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                                                        —
                                                                    </span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span className={`simi-att-weight-badge ${pct >= 80 ? 'weight-100' : (pct >= 50 ? 'weight-50' : 'weight-0')}`}>
                                                            {pct}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {safeMembers.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                        No hay estudiantes registrados para este evento.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* 4. FOOTER CON GUARDADO */}
                {activeTab === 'manual' && (
                    <div className="simi-att-modal-footer">
                        <div className="simi-att-stats-summary">
                            <span className="simi-att-stat-badge asistio">
                                <Check size={13} />
                                <span>{statsCounts.asistio} Asistió</span>
                            </span>
                            <span className="simi-att-stat-badge incompleto">
                                <Clock size={13} />
                                <span>{statsCounts.incompleto} Incompleto</span>
                            </span>
                            <span className="simi-att-stat-badge no_vino">
                                <X size={13} />
                                <span>{statsCounts.no_vino} No vino</span>
                            </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {saveSuccessNotice && (
                                <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <CheckCircle2 size={16} /> ¡Guardado con éxito!
                                </span>
                            )}
                            <button 
                                className="simi-att-save-btn"
                                onClick={handleSaveManualList}
                                disabled={isSavingManual}
                            >
                                <Check size={18} />
                                <span>{isSavingManual ? 'Guardando...' : 'Guardar'}</span>
                            </button>
                        </div>
                    </div>
                )}

                </div>

                {/* 2. CARD / PANEL LATERAL: HISTORIAL DE CLASES (SEPARADA 10PX) */}
                <div className="simi-att-side-panel">
                    <div className="simi-att-side-header">
                        <div className="simi-att-side-header-title">
                            <History size={17} color="#06b6d4" />
                            <span>Historial</span>
                        </div>
                        <span className="simi-att-side-count-badge">
                            {sessions.length} {sessions.length === 1 ? 'Clase' : 'Clases'}
                        </span>
                    </div>

                    <div className="simi-att-side-body">
                        <div className="simi-att-side-list">
                            {sessions.map((sess) => {
                                const isCurrent = sess.id === activeSessionId && activeTab !== 'history';
                                const displayDate = sess.date ? (sess.date.length > 5 ? sess.date.slice(5).replace('-', '/') : sess.date) : '';
                                
                                // Calcular presentes en esta clase
                                let presentCount = 0;
                                safeMembers.forEach(m => {
                                    const mId = m.id || m.email;
                                    const st = (sess.id === activeSessionId)
                                        ? (studentStates[mId] || 'no_vino')
                                        : ((sess.attendances && sess.attendances[mId]) || 'no_vino');
                                    if (st === 'asistio' || st === 'incompleto') presentCount++;
                                });

                                return (
                                    <div
                                        key={sess.id}
                                        className={`simi-att-side-card ${isCurrent ? 'active' : ''} ${hoveredCardSessionId === sess.id ? 'show-actions' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setHoveredCardSessionId(prev => prev === sess.id ? null : sess.id);
                                        }}
                                        onMouseEnter={() => setHoveredCardSessionId(sess.id)}
                                        onMouseLeave={() => setHoveredCardSessionId(null)}
                                        title={`${sess.name} (${sess.date || 'Sin fecha'}): ${sess.topic || 'Sin bitácora'}`}
                                    >
                                        <div className="simi-att-side-card-top">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'nowrap' }}>
                                                <span className="simi-att-side-pill-code">{sess.name}</span>
                                                <span className="simi-att-side-card-date">
                                                    <Calendar size={10} />
                                                    {displayDate || 'Hoy'}
                                                </span>
                                            </div>

                                            <span className="simi-att-side-card-stat">
                                                👥 {presentCount}/{safeMembers.length}
                                            </span>
                                        </div>

                                        <div className="simi-att-side-card-topic">
                                            {sess.topic || (sess.id === activeSessionId && sessionTopic ? sessionTopic : 'Sin bitácora')}
                                        </div>

                                        {/* Overlay flotante de acciones: Aparece al dar clic / hover sobre la tarjeta */}
                                        <div className="simi-att-side-actions-overlay" onClick={e => e.stopPropagation()}>
                                            <button
                                                type="button"
                                                className="simi-att-side-overlay-btn edit"
                                                onClick={() => {
                                                    handleSelectSession(sess.id, true);
                                                    setActiveTab('manual');
                                                    setHoveredCardSessionId(null);
                                                }}
                                                title="Editar asistencia y bitácora de esta clase"
                                            >
                                                <Edit3 size={11} />
                                                <span>Editar</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="simi-att-side-overlay-btn delete"
                                                onClick={() => {
                                                    handleDeleteSession(sess.id);
                                                    setHoveredCardSessionId(null);
                                                }}
                                                title="Eliminar esta lista de clase"
                                            >
                                                <Trash2 size={11} />
                                                <span>Eliminar</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="simi-att-side-footer">
                        <button
                            type="button"
                            className="simi-att-side-add-btn"
                            onClick={handleAddNewSession}
                            title={`Crear nueva lista para la clase C${sessions.length + 1}`}
                        >
                            <Plus size={15} />
                            <span>Nueva Lista (C{sessions.length + 1})</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
}
