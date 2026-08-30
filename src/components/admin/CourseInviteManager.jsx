import React, { useState, useEffect, useCallback } from 'react';
import { Link2, Copy, Check, Share2, Clock, Plus, Trash2, CalendarPlus, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { COURSES_DEFINITION } from '../../data/coursesData.jsx';

export default function CourseInviteManager({ courseId = null }) {
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState(null);

    // Formulario de creación
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(courseId || 1);
    const [availableGroups, setAvailableGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [durationHours, setDurationHours] = useState(24); // 24 horas por defecto
    const [creating, setCreating] = useState(false);

    // Modal de dar más tiempo
    const [extendTarget, setExtendTarget] = useState(null);
    const [addHours, setAddHours] = useState(24);
    const [updating, setUpdating] = useState(false);

    // Cargar grupos disponibles para el curso seleccionado
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const { data } = await api(`/groups?course_id=${selectedCourseId}`);
                if (data && Array.isArray(data) && data.length > 0) {
                    setAvailableGroups(data);
                    setSelectedGroupId(data[0].id);
                } else {
                    setAvailableGroups([]);
                    setSelectedGroupId('');
                }
            } catch {
                setAvailableGroups([]);
                setSelectedGroupId('');
            }
        };
        fetchGroups();
    }, [selectedCourseId]);

    const loadCodes = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api('/codes');
            if (data && Array.isArray(data)) {
                // Si courseId específico, filtrar, si no mostrar todos
                const filtered = courseId ? data.filter(c => c.course_id === courseId) : data;
                setCodes(filtered);
            }
        } catch (err) {
            console.error('Error cargando códigos:', err);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        loadCodes();
    }, [loadCodes]);

    const handleCreateLink = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            const courseObj = COURSES_DEFINITION.find(c => c.id === Number(selectedCourseId)) || COURSES_DEFINITION[0];
            const prefix = courseObj.abbr || 'SL';
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            const generatedCode = `${prefix}-${randomNum}`;

            let expiresAt = null;
            if (durationHours > 0) {
                const date = new Date();
                date.setHours(date.getHours() + Number(durationHours));
                expiresAt = date.toISOString();
            }

            // Resolver group_id: si el curso no tiene grupos creados en DB, creamos uno base
            let targetGroupId = selectedGroupId;
            if (!targetGroupId) {
                try {
                    const { data: newGrp } = await api('/groups', {
                        method: 'POST',
                        body: {
                            name: `Grupo General - ${courseObj.abbr}`,
                            course_id: Number(selectedCourseId),
                            teacher: 'Prof. Ronny Martinez'
                        }
                    });
                    if (newGrp?.id) {
                        targetGroupId = newGrp.id;
                    }
                } catch {
                    // Fallback
                }
            }

            // Si aún no hay grupo en D1, consultar el primer grupo existente o usar 1
            if (!targetGroupId) {
                const { data: allGroups } = await api('/groups');
                targetGroupId = (allGroups && allGroups.length > 0) ? allGroups[0].id : 1;
            }

            const { data, error } = await api('/codes', {
                method: 'POST',
                body: {
                    group_id: Number(targetGroupId),
                    course_id: Number(selectedCourseId),
                    code: generatedCode,
                    expires_at: expiresAt
                }
            });

            if (error) throw new Error(error.message || 'Error al generar código');

            setShowCreateModal(false);
            await loadCodes();
        } catch (err) {
            alert(err.message || 'Error al crear enlace de invitación');
        } finally {
            setCreating(false);
        }
    };

    const handleExtendTime = async () => {
        if (!extendTarget) return;
        setUpdating(true);

        try {
            // Calcular nueva fecha base: si ya expiró, tomar 'ahora', si no, sumar a la fecha existente
            let baseDate = new Date();
            if (extendTarget.expires_at) {
                const currentExpires = new Date(extendTarget.expires_at);
                if (currentExpires > baseDate) {
                    baseDate = currentExpires;
                }
            }

            let newExpiresAt = null;
            if (addHours > 0) {
                baseDate.setHours(baseDate.getHours() + Number(addHours));
                newExpiresAt = baseDate.toISOString();
            }

            const { error } = await api('/codes', {
                method: 'PUT',
                body: {
                    id: extendTarget.id,
                    expires_at: newExpiresAt
                }
            });

            if (error) throw new Error(error.message || 'Error al extender tiempo');

            setExtendTarget(null);
            await loadCodes();
        } catch (err) {
            alert(err.message || 'Error al extender vigencia');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteCode = async (id) => {
        if (!confirm('¿Deseas eliminar este enlace de invitación?')) return;
        try {
            await api(`/codes?id=${id}`, { method: 'DELETE' });
            setCodes(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Error al borrar código:', err);
        }
    };

    const getFullJoinUrl = (code) => {
        // Siempre generar el enlace oficial online de producción para compartir a estudiantes
        return `https://saberlab.pages.dev/join?code=${code}`;
    };

    const handleCopy = (code) => {
        const url = getFullJoinUrl(code);
        navigator.clipboard.writeText(url);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2500);
    };

    const handleShareWhatsApp = (code, courseName) => {
        const url = getFullJoinUrl(code);
        const text = `¡Hola! Únete al curso *${courseName}* en SaberLab con este enlace directo:\n${url}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    const getStatus = (expiresAt) => {
        if (!expiresAt) {
            return { label: 'Permanente', color: '#10b981', active: true };
        }
        const now = new Date();
        const exp = new Date(expiresAt);
        if (exp < now) {
            return { label: 'Expirado', color: '#ef4444', active: false };
        }

        const diffMinutes = Math.round((exp - now) / 60000);
        if (diffMinutes < 60) {
            return { label: `Vence en ${diffMinutes} min`, color: '#f59e0b', active: true };
        }
        const diffHours = Math.round(diffMinutes / 60);
        if (diffHours < 24) {
            return { label: `Vence en ${diffHours} h`, color: '#38bdf8', active: true };
        }
        const diffDays = Math.round(diffHours / 24);
        return { label: `Vence en ${diffDays} d`, color: '#34d399', active: true };
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
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#38bdf8'
                    }}>
                        <Link2 size={22} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                            Enlaces Directos de Inscripción
                        </h2>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                            Permite a los alumnos unirse a un curso con 1 solo clic y controla el tiempo de vigencia
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                        background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                        color: '#0f172a',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.65rem 1.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Plus size={16} />
                    <span>Generar Nuevo Enlace</span>
                </button>
            </div>

            {/* Lista de enlaces */}
            {codes.length === 0 ? (
                <div style={{
                    padding: '2.5rem',
                    textAlign: 'center',
                    background: 'rgba(15, 23, 42, 0.4)',
                    borderRadius: '14px',
                    border: '1px dashed rgba(255, 255, 255, 0.1)'
                }}>
                    <Link2 size={36} color="#64748b" style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
                    <h4 style={{ margin: '0 0 0.3rem', color: '#cbd5e1', fontSize: '1rem' }}>
                        No hay enlaces de invitación creados
                    </h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>
                        Genera un enlace con tiempo configurado para que tus estudiantes se unan instantáneamente.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {codes.map(c => {
                        const course = COURSES_DEFINITION.find(cd => cd.id === c.course_id) || { name: 'Curso SaberLab', color: '#38bdf8' };
                        const status = getStatus(c.expires_at);
                        const isCopied = copiedCode === c.code;

                        return (
                            <div
                                key={c.id}
                                style={{
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: `1px solid ${status.active ? 'rgba(255, 255, 255, 0.08)' : 'rgba(239, 68, 68, 0.25)'}`,
                                    borderRadius: '16px',
                                    padding: '1.1rem 1.4rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '1rem',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ minWidth: '220px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span style={{
                                            fontSize: '0.72rem',
                                            fontWeight: 800,
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            background: `${course.color || '#38bdf8'}20`,
                                            color: course.color || '#38bdf8',
                                            border: `1px solid ${course.color || '#38bdf8'}40`
                                        }}>
                                            {course.name}
                                        </span>

                                        <span style={{
                                            fontSize: '0.72rem',
                                            fontWeight: 800,
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            background: `${status.color}20`,
                                            color: status.color,
                                            border: `1px solid ${status.color}40`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <Clock size={10} />
                                            {status.label}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                                        <span style={{
                                            fontFamily: 'monospace',
                                            fontSize: '1.15rem',
                                            fontWeight: 900,
                                            color: '#f8fafc',
                                            letterSpacing: '1px'
                                        }}>
                                            {c.code}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                            {c.expires_at ? `Expira: ${new Date(c.expires_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}` : 'Sin fecha límite'}
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#38bdf8',
                                        fontFamily: 'monospace',
                                        background: 'rgba(56, 189, 248, 0.08)',
                                        padding: '3px 8px',
                                        borderRadius: '6px',
                                        display: 'inline-block'
                                    }}>
                                        https://saberlab.pages.dev/join?code={c.code}
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {/* Copiar enlace */}
                                    <button
                                        onClick={() => handleCopy(c.code)}
                                        style={{
                                            background: isCopied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                                            color: isCopied ? '#34d399' : '#f8fafc',
                                            border: `1px solid ${isCopied ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`,
                                            padding: '0.5rem 0.85rem',
                                            borderRadius: '10px',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            transition: 'all 0.2s'
                                        }}
                                        title="Copiar URL directa al portapapeles"
                                    >
                                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                        <span>{isCopied ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
                                    </button>

                                    {/* Compartir WhatsApp */}
                                    <button
                                        onClick={() => handleShareWhatsApp(c.code, course.name)}
                                        style={{
                                            background: 'rgba(37, 211, 102, 0.15)',
                                            color: '#25d366',
                                            border: '1px solid rgba(37, 211, 102, 0.3)',
                                            padding: '0.5rem 0.85rem',
                                            borderRadius: '10px',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem'
                                        }}
                                        title="Compartir por WhatsApp"
                                    >
                                        <Share2 size={14} />
                                        <span>WhatsApp</span>
                                    </button>

                                    {/* Dar más tiempo */}
                                    <button
                                        onClick={() => setExtendTarget(c)}
                                        style={{
                                            background: 'rgba(245, 158, 11, 0.15)',
                                            color: '#fbbf24',
                                            border: '1px solid rgba(245, 158, 11, 0.3)',
                                            padding: '0.5rem 0.85rem',
                                            borderRadius: '10px',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem'
                                        }}
                                        title="Extender tiempo o reactivar enlace vencido"
                                    >
                                        <CalendarPlus size={14} />
                                        <span>Dar más tiempo ⏱️</span>
                                    </button>

                                    {/* Eliminar */}
                                    <button
                                        onClick={() => handleDeleteCode(c.id)}
                                        style={{
                                            background: 'transparent',
                                            color: '#ef4444',
                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                            padding: '0.5rem 0.6rem',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Eliminar este enlace"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal para Generar Nuevo Enlace con Tiempo */}
            {showCreateModal && (
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
                        maxWidth: '480px',
                        width: '100%',
                        color: '#fff'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <Sparkles size={20} color="#38bdf8" />
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                                    Generar Enlace de Invitación
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateLink}>
                            <div style={{ marginBottom: '1.2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem' }}>
                                    Curso a Inscribir
                                </label>
                                <select
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(15, 23, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        borderRadius: '10px',
                                        padding: '0.75rem',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    {COURSES_DEFINITION.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.abbr})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {availableGroups.length > 1 && (
                                <div style={{ marginBottom: '1.2rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem' }}>
                                        Grupo Específico
                                    </label>
                                    <select
                                        value={selectedGroupId}
                                        onChange={(e) => setSelectedGroupId(Number(e.target.value))}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            borderRadius: '10px',
                                            padding: '0.75rem',
                                            color: '#fff',
                                            fontSize: '0.9rem',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        {availableGroups.map(g => (
                                            <option key={g.id} value={g.id}>
                                                {g.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>
                                    Tiempo de Vigencia del Enlace
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                                    {[
                                        { hours: 1, label: '⚡ 1 Hora (En clase)' },
                                        { hours: 4, label: '🕒 4 Horas (Taller)' },
                                        { hours: 24, label: '📅 24 Horas (1 Día)' },
                                        { hours: 72, label: '🗓️ 3 Días' },
                                        { hours: 168, label: '⏳ 7 Días (1 Semana)' },
                                        { hours: 0, label: '♾️ Permanente' }
                                    ].map(opt => (
                                        <button
                                            type="button"
                                            key={opt.hours}
                                            onClick={() => setDurationHours(opt.hours)}
                                            style={{
                                                background: durationHours === opt.hours ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                                                border: `1px solid ${durationHours === opt.hours ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}`,
                                                color: durationHours === opt.hours ? '#38bdf8' : '#94a3b8',
                                                padding: '0.65rem 0.5rem',
                                                borderRadius: '10px',
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        color: '#94a3b8',
                                        borderRadius: '10px',
                                        padding: '0.65rem 1.25rem',
                                        fontSize: '0.88rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    style={{
                                        background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                                        color: '#0f172a',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '0.65rem 1.5rem',
                                        fontSize: '0.88rem',
                                        fontWeight: 800,
                                        cursor: creating ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {creating ? 'Generando...' : 'Crear Enlace'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para "Dar más tiempo" */}
            {extendTarget && (
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
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        borderRadius: '22px',
                        padding: '2rem',
                        maxWidth: '460px',
                        width: '100%',
                        color: '#fff'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <CalendarPlus size={20} color="#fbbf24" />
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                                    Dar Más Tiempo al Enlace
                                </h3>
                            </div>
                            <button
                                onClick={() => setExtendTarget(null)}
                                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}
                            >
                                ✕
                            </button>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                            Amplía la fecha de vigencia para el enlace del código <strong style={{ color: '#f8fafc' }}>{extendTarget.code}</strong>. Los estudiantes podrán usar el mismo link que ya tienen.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '1.5rem' }}>
                            {[
                                { hours: 1, label: '+1 Hora adicional' },
                                { hours: 24, label: '+24 Horas (+1 Día)' },
                                { hours: 72, label: '+3 Días' },
                                { hours: 168, label: '+7 Días (+1 Semana)' },
                                { hours: 720, label: '+30 Días (1 Mes)' },
                                { hours: 0, label: 'Hacer Permanente' }
                            ].map(opt => (
                                <button
                                    type="button"
                                    key={opt.hours}
                                    onClick={() => setAddHours(opt.hours)}
                                    style={{
                                        background: addHours === opt.hours ? 'rgba(245, 158, 11, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                                        border: `1px solid ${addHours === opt.hours ? '#fbbf24' : 'rgba(255, 255, 255, 0.1)'}`,
                                        color: addHours === opt.hours ? '#fbbf24' : '#94a3b8',
                                        padding: '0.75rem 0.5rem',
                                        borderRadius: '10px',
                                        fontSize: '0.82rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button
                                type="button"
                                onClick={() => setExtendTarget(null)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#94a3b8',
                                    borderRadius: '10px',
                                    padding: '0.65rem 1.25rem',
                                    fontSize: '0.88rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleExtendTime}
                                disabled={updating}
                                style={{
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    color: '#0f172a',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '0.65rem 1.5rem',
                                    fontSize: '0.88rem',
                                    fontWeight: 800,
                                    cursor: updating ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {updating ? 'Actualizando...' : 'Extender Vigencia ⏱️'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
