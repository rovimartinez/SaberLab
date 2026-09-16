import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Radio, RefreshCw, Send, Users, Award, AlertTriangle, 
    CheckCircle2, Clock, ArrowLeft, ShieldAlert, Zap, 
    RotateCcw, Sparkles, MessageSquare, BookOpen, Layers
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/useAuth';
import { COURSES_DEFINITION, LESSONS_REGISTRY } from '../../data/coursesData.jsx';
import '../../styles/ExamLiveLobby.css';

export default function ExamLiveLobby() {
    const { evaluationKey } = useParams();
    const navigate = useNavigate();
    const { user, isStaff } = useAuth();

    const [evaluation, setEvaluation] = useState(null);
    const [onlineStudents, setOnlineStudents] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'waiting', 'playing', 'warning', 'finished'
    
    // Modal de mensaje a estudiantes
    const [showMsgModal, setShowMsgModal] = useState(false);
    const [modalTarget, setModalTarget] = useState(null); // null = broadcast a todos en este examen
    const [msgText, setMsgText] = useState('');
    const [sendingMsg, setSendingMsg] = useState(false);
    const [msgFeedback, setMsgFeedback] = useState(null);

    // Cargar datos de la evaluación
    useEffect(() => {
        const fetchEvalData = async () => {
            if (!evaluationKey) return;
            try {
                const { data } = await api(`/evaluations?key=${encodeURIComponent(evaluationKey)}`);
                if (data) {
                    setEvaluation(data);
                } else if (LESSONS_REGISTRY[evaluationKey]) {
                    const lesson = await LESSONS_REGISTRY[evaluationKey].load?.();
                    if (lesson) {
                        setEvaluation({
                            id: evaluationKey,
                            evaluation_key: evaluationKey,
                            title: lesson.title || 'Evaluación Oficial',
                            time_limit: lesson.time_limit || 60,
                            points: lesson.points || 100,
                            module_id: 'Módulo 1'
                        });
                    }
                }
            } catch (err) {
                console.error('Error cargando evaluación en lobby:', err);
            }
        };
        fetchEvalData();
    }, [evaluationKey]);

    // Consultar presencia e intentos de los alumnos
    const fetchLobbyData = useCallback(async () => {
        if (!evaluationKey) return;
        try {
            // 1. Presencia de estudiantes en línea
            const { data: presenceRes } = await api('/presence');
            const allOnline = presenceRes?.online_students || [];

            // Filtrar únicamente los estudiantes cuya URL o actividad corresponde a esta evaluación
            const normKey = (evaluationKey || '').toLowerCase();
            const examOnline = allOnline.filter(s => {
                const page = (s.current_page || '').toLowerCase();
                const act = (s.activity || '').toLowerCase();
                return page.includes(normKey) || page.includes('evaluations') || act.includes('examen') || act.includes('sala de espera');
            });
            setOnlineStudents(examOnline);

            // 2. Intentos registrados (incompletos y finalizados) de esta evaluación
            const { data: attemptsRes } = await api(`/attempts?evaluation_key=${encodeURIComponent(evaluationKey)}&all=true`);
            setAttempts(Array.isArray(attemptsRes) ? attemptsRes : []);
        } catch (err) {
            console.error('Error actualizando lobby de examen:', err);
        } finally {
            setLoading(false);
        }
    }, [evaluationKey]);

    useEffect(() => {
        fetchLobbyData();
        const timer = setInterval(fetchLobbyData, 4000); // Latido cada 4 segundos
        return () => clearInterval(timer);
    }, [fetchLobbyData]);

    // Combinar datos de presencia + intentos para cada estudiante
    const participantsMap = new Map();

    // Agregar estudiantes con intento registrado
    attempts.forEach(att => {
        const key = att.user_id;
        let antiCheat = {};
        let answerCount = 0;
        try {
            const parsedAns = typeof att.answers === 'string' ? JSON.parse(att.answers) : (att.answers || {});
            antiCheat = parsedAns.anti_cheat || {};
            if (parsedAns.theory) {
                answerCount = Object.keys(parsedAns.theory).length;
            }
        } catch {}

        participantsMap.set(key, {
            user_id: att.user_id,
            email: att.email || att.user_id,
            full_name: att.student_name || att.full_name || att.email || att.user_id,
            avatar_url: att.avatar_url || null,
            status: att.completed_at ? 'finished' : 'playing',
            score: att.score,
            completed_at: att.completed_at,
            created_at: att.created_at,
            strikes: antiCheat.strikes || 0,
            tab_switches: antiCheat.tab_switches || 0,
            fullscreen_exits: antiCheat.fullscreen_exits || 0,
            answerCount: answerCount,
            is_online: false
        });
    });

    // Cruzar con los estudiantes en línea ahora mismo
    onlineStudents.forEach(stu => {
        const key = stu.user_id;
        const page = (stu.current_page || '').toLowerCase();
        const normKey = (evaluationKey || '').toLowerCase();
        const isExamPage = page.includes(normKey) || page.includes('evaluations');
        const isPlaying = page.includes('/play');

        const existing = participantsMap.get(key) || {
            user_id: stu.user_id,
            email: stu.email,
            full_name: stu.full_name,
            avatar_url: stu.avatar_url,
            status: isPlaying ? 'playing' : 'waiting',
            score: null,
            completed_at: null,
            strikes: 0,
            tab_switches: 0,
            fullscreen_exits: 0,
            answerCount: 0
        };

        participantsMap.set(key, {
            ...existing,
            is_online: true,
            status: existing.status === 'finished' ? 'finished' : (isPlaying ? 'playing' : 'waiting'),
            activity: stu.activity || (isPlaying ? '✍️ Resolviendo Examen' : '🟢 En Sala de Espera')
        });
    });

    const participants = Array.from(participantsMap.values());

    // Métricas para contadores
    const waitingCount = participants.filter(p => p.status === 'waiting').length;
    const playingCount = participants.filter(p => p.status === 'playing').length;
    const warningCount = participants.filter(p => (p.strikes || 0) > 0).length;
    const finishedCount = participants.filter(p => p.status === 'finished').length;

    // Filtro activo
    const filteredParticipants = participants.filter(p => {
        if (filter === 'waiting') return p.status === 'waiting';
        if (filter === 'playing') return p.status === 'playing';
        if (filter === 'warning') return (p.strikes || 0) > 0;
        if (filter === 'finished') return p.status === 'finished';
        return true;
    });

    // Enviar mensaje flash (broadcast o individual)
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!msgText.trim()) return;

        setSendingMsg(true);
        setMsgFeedback(null);
        try {
            await api('/admin/send-message', {
                method: 'POST',
                body: {
                    mode: modalTarget ? 'single' : 'broadcast',
                    target_user_id: modalTarget ? modalTarget.user_id : undefined,
                    title: modalTarget ? `Aviso de Examen` : `📢 Aviso para el Examen Oficial`,
                    message: msgText.trim(),
                    is_temporary: true,
                    duration: 8,
                    is_anonymous: false
                }
            });

            setMsgFeedback({ type: 'success', text: '¡Aviso enviado a las pantallas!' });
            setTimeout(() => {
                setShowMsgModal(false);
                setMsgText('');
                setMsgFeedback(null);
            }, 1800);
        } catch (err) {
            setMsgFeedback({ type: 'error', text: err.message || 'No se pudo enviar el aviso' });
        } finally {
            setSendingMsg(false);
        }
    };

    // Restablecer intento de un alumno
    const handleResetStudentAttempt = async (stu) => {
        const studentName = stu.full_name || stu.email;
        if (!window.confirm(`¿Deseas restablecer el intento de ${studentName} para este examen? Podrá ingresar y presentar desde cero.`)) return;

        try {
            await api(`/attempts?evaluation_key=${encodeURIComponent(evaluationKey)}&user_id=${encodeURIComponent(stu.user_id)}`, {
                method: 'DELETE'
            });
            fetchLobbyData();
        } catch (err) {
            alert('Error restableciendo intento: ' + (err.message || 'Error de conexión'));
        }
    };

    return (
        <div className="exam-live-lobby">
            {/* Barra superior de navegación */}
            <div className="lobby-header-nav">
                <Link to="/dashboard" className="lobby-back-btn">
                    <ArrowLeft size={16} /> Volver al Inicio
                </Link>

                <div className="lobby-status-pill">
                    <span className="lobby-pulse-dot"></span>
                    SALA DE ESPERA EN VIVO (WAYGROUND LOBBY)
                </div>
            </div>

            {/* Banner de Cabecera del Examen */}
            <div className="lobby-hero-card">
                <div className="lobby-hero-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                        <Zap size={20} color="#38bdf8" />
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Monitoreo en Tiempo Real
                        </span>
                    </div>
                    <h1>{evaluation?.title || `Examen: ${evaluationKey}`}</h1>
                    <div className="lobby-hero-meta">
                        <span><Clock size={15} color="#60a5fa" /> Límite: {evaluation?.time_limit || 60} minutos</span>
                        <span><Award size={15} color="#10b981" /> Puntaje Máximo: {evaluation?.points || 100} pts</span>
                        <span><ShieldAlert size={15} color="#f59e0b" /> Protección Sentinel Activa</span>
                    </div>
                </div>

                <div className="lobby-hero-actions">
                    <button 
                        onClick={() => { setModalTarget(null); setShowMsgModal(true); }}
                        className="lobby-action-btn broadcast"
                    >
                        <Send size={15} /> Aviso a Toda la Sala ({participants.length})
                    </button>
                    <button 
                        onClick={fetchLobbyData} 
                        className="lobby-action-btn refresh"
                        title="Actualizar ahora"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Métricas y Contadores Rápidos */}
            <div className="lobby-metrics-grid">
                <div 
                    className={`lobby-metric-card waiting ${filter === 'waiting' ? 'active' : ''}`}
                    onClick={() => setFilter(filter === 'waiting' ? 'all' : 'waiting')}
                >
                    <div className="metric-icon-bubble" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                        <Users size={22} />
                    </div>
                    <div className="metric-data">
                        <div className="metric-value" style={{ color: '#10b981' }}>{waitingCount}</div>
                        <div className="metric-label">En Sala de Espera</div>
                    </div>
                </div>

                <div 
                    className={`lobby-metric-card playing ${filter === 'playing' ? 'active' : ''}`}
                    onClick={() => setFilter(filter === 'playing' ? 'all' : 'playing')}
                >
                    <div className="metric-icon-bubble" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                        <Radio size={22} />
                    </div>
                    <div className="metric-data">
                        <div className="metric-value" style={{ color: '#38bdf8' }}>{playingCount}</div>
                        <div className="metric-label">Rindiendo Examen</div>
                    </div>
                </div>

                <div 
                    className={`lobby-metric-card warning ${filter === 'warning' ? 'active' : ''}`}
                    onClick={() => setFilter(filter === 'warning' ? 'all' : 'warning')}
                >
                    <div className="metric-icon-bubble" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                        <AlertTriangle size={22} />
                    </div>
                    <div className="metric-data">
                        <div className="metric-value" style={{ color: '#f59e0b' }}>{warningCount}</div>
                        <div className="metric-label">Con Alertas (Strikes)</div>
                    </div>
                </div>

                <div 
                    className={`lobby-metric-card finished ${filter === 'finished' ? 'active' : ''}`}
                    onClick={() => setFilter(filter === 'finished' ? 'all' : 'finished')}
                >
                    <div className="metric-icon-bubble" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                        <CheckCircle2 size={22} />
                    </div>
                    <div className="metric-data">
                        <div className="metric-value" style={{ color: '#c084fc' }}>{finishedCount}</div>
                        <div className="metric-label">Examen Entregado</div>
                    </div>
                </div>
            </div>

            {/* Sección de Tarjetas de Estudiantes */}
            <div className="lobby-students-section">
                <div className="lobby-section-header">
                    <h2 className="lobby-section-title">
                        <Users size={20} color="#38bdf8" />
                        Estudiantes en Sala ({filteredParticipants.length})
                    </h2>

                    <div className="lobby-filter-tabs">
                        <button 
                            className={`lobby-filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Todos ({participants.length})
                        </button>
                        <button 
                            className={`lobby-filter-btn ${filter === 'waiting' ? 'active' : ''}`}
                            onClick={() => setFilter('waiting')}
                        >
                            En Sala ({waitingCount})
                        </button>
                        <button 
                            className={`lobby-filter-btn ${filter === 'playing' ? 'active' : ''}`}
                            onClick={() => setFilter('playing')}
                        >
                            Rindiendo ({playingCount})
                        </button>
                        <button 
                            className={`lobby-filter-btn ${filter === 'warning' ? 'active' : ''}`}
                            onClick={() => setFilter('warning')}
                        >
                            Alertas ({warningCount})
                        </button>
                        <button 
                            className={`lobby-filter-btn ${filter === 'finished' ? 'active' : ''}`}
                            onClick={() => setFilter('finished')}
                        >
                            Entregados ({finishedCount})
                        </button>
                    </div>
                </div>

                {filteredParticipants.length === 0 ? (
                    <div className="lobby-empty-state">
                        <div className="lobby-empty-icon">⏳</div>
                        <h3>No hay estudiantes en esta vista</h3>
                        <p>Cuando los alumnos abran las instrucciones del examen o comiencen a resolverlo, aparecerán aquí en vivo.</p>
                    </div>
                ) : (
                    <div className="lobby-students-grid">
                        {filteredParticipants.map(student => {
                            const hasStrikes = (student.strikes || 0) > 0;
                            return (
                                <div 
                                    key={student.user_id} 
                                    className={`lobby-student-card ${student.status} ${hasStrikes ? 'has-strikes' : ''}`}
                                >
                                    <div className="student-card-top">
                                        <div className="student-card-avatar">
                                            {student.avatar_url ? (
                                                <img 
                                                    src={student.avatar_url} 
                                                    alt={student.full_name} 
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                (student.full_name || student.email || 'E')[0].toUpperCase()
                                            )}
                                            {student.is_online && (
                                                <span className="student-online-status-dot" title="En línea ahora"></span>
                                            )}
                                        </div>

                                        <div className="student-card-names">
                                            <div className="student-name-text">{student.full_name}</div>
                                            <div className="student-email-text">{student.email}</div>
                                        </div>
                                    </div>

                                    {/* Insignia de Estado */}
                                    <div>
                                        {student.status === 'waiting' && (
                                            <span className="student-status-badge waiting">
                                                🟢 En Sala de Espera (Instrucciones)
                                            </span>
                                        )}
                                        {student.status === 'playing' && (
                                            <span className="student-status-badge playing">
                                                ✍️ Rindiendo ({student.answerCount} respondidas)
                                            </span>
                                        )}
                                        {student.status === 'finished' && (
                                            <span className="student-status-badge finished">
                                                🏁 Entregado — Nota: {student.score !== null ? `${student.score} pts` : 'Registrada'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Telemetría y Alertas de Supervisión */}
                                    <div className="student-telemetry-row">
                                        <span>
                                            {student.is_online ? 'Conectado en vivo' : 'Último registro guardado'}
                                        </span>
                                        {hasStrikes ? (
                                            <span className="strike-alert-tag">
                                                ⚠️ {student.strikes} {student.strikes === 1 ? 'Strike' : 'Strikes'}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#10b981', fontSize: '0.74rem', fontWeight: 600 }}>
                                                ✓ Pantalla Limpia
                                            </span>
                                        )}
                                    </div>

                                    {/* Acciones para el docente */}
                                    <div className="student-card-actions">
                                        <button 
                                            onClick={() => { setModalTarget(student); setShowMsgModal(true); }}
                                            className="student-msg-btn"
                                            title="Enviar mensaje directo a su pantalla"
                                        >
                                            <MessageSquare size={13} /> Mensaje
                                        </button>
                                        <button 
                                            onClick={() => handleResetStudentAttempt(student)}
                                            className="student-reset-btn"
                                            title="Restablecer intento"
                                        >
                                            <RotateCcw size={13} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal para enviar mensaje flash al estudiante o la sala */}
            {showMsgModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    background: 'rgba(10, 15, 30, 0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem'
                }}>
                    <div style={{
                        background: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '20px',
                        padding: '2rem',
                        maxWidth: '460px',
                        width: '100%',
                        color: '#fff',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Send size={22} color="#38bdf8" />
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                                {modalTarget ? `Aviso para ${modalTarget.full_name}` : 'Aviso a Toda la Sala'}
                            </h3>
                        </div>
                        <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                            El mensaje aparecerá como una ventana emergente en primer plano en la pantalla del alumno durante el examen.
                        </p>

                        <form onSubmit={handleSendMessage}>
                            <textarea
                                rows={4}
                                value={msgText}
                                onChange={(e) => setMsgText(e.target.value)}
                                placeholder="Escribe el aviso aquí... (ej: 'Recuerden que faltan 10 minutos para la entrega')"
                                style={{
                                    width: '100%',
                                    padding: '0.85rem',
                                    borderRadius: '12px',
                                    background: 'rgba(15, 23, 42, 0.8)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    marginBottom: '1rem',
                                    boxSizing: 'border-box'
                                }}
                            />

                            {msgFeedback && (
                                <div style={{
                                    padding: '0.6rem 0.9rem',
                                    borderRadius: '8px',
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    marginBottom: '1rem',
                                    background: msgFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    color: msgFeedback.type === 'success' ? '#34d399' : '#f87171'
                                }}>
                                    {msgFeedback.text}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowMsgModal(false)}
                                    style={{
                                        padding: '0.6rem 1.2rem',
                                        background: 'transparent',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        color: '#cbd5e1',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingMsg || !msgText.trim()}
                                    style={{
                                        padding: '0.6rem 1.4rem',
                                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                        border: 'none',
                                        color: '#fff',
                                        borderRadius: '10px',
                                        cursor: sendingMsg ? 'not-allowed' : 'pointer',
                                        fontWeight: 700
                                    }}
                                >
                                    {sendingMsg ? 'Enviando...' : 'Enviar Aviso ➔'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
