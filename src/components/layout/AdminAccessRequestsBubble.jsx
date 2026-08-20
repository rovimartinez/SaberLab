import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Mail, Shield, User, UserPlus, X } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/useAuth';

const bubbleButtonStyle = {
    position: 'fixed',
    right: '24px',
    bottom: '24px',
    width: '64px',
    height: '64px',
    borderRadius: '999px',
    border: '1px solid rgba(168, 85, 247, 0.35)',
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.95), rgba(99, 102, 241, 0.95))',
    boxShadow: '0 18px 40px rgba(76, 29, 149, 0.32)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 1200
};

const panelStyle = {
    position: 'fixed',
    right: '24px',
    bottom: '100px',
    width: 'min(420px, calc(100vw - 32px))',
    maxHeight: '70vh',
    overflow: 'hidden',
    borderRadius: '24px',
    border: '1px solid rgba(168, 85, 247, 0.22)',
    background: 'rgba(15, 23, 42, 0.96)',
    boxShadow: '0 24px 80px rgba(2, 6, 23, 0.45)',
    backdropFilter: 'blur(14px)',
    zIndex: 1199
};

const actionButtonStyle = {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
};

const AdminAccessRequestsBubble = () => {
    const { profile, pendingAccessRequestsCount, refreshPendingAccessRequestsCount } = useAuth();
    const [open, setOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState(null);
    const containerRef = useRef(null);

    const isStaff = ['admin', 'teacher', 'docente', 'profesor'].includes(profile?.role);

    const title = useMemo(() => {
        if (pendingAccessRequestsCount === 1) return '1 solicitud pendiente';
        return `${pendingAccessRequestsCount} solicitudes pendientes`;
    }, [pendingAccessRequestsCount]);

    useEffect(() => {
        if (!open || !isStaff) return undefined;

        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isStaff, open]);

    useEffect(() => {
        if (!isStaff) return undefined;

        const loadRequests = async () => {
            const { data, error } = await api('/requests');

            if (error) {
                console.error('Error cargando solicitudes pendientes:', error);
                return;
            }

            setRequests((data ?? []).filter(r => r.status === 'pending'));
            await refreshPendingAccessRequestsCount();
        };

        if (open) {
            setLoading(true);
            void loadRequests().finally(() => setLoading(false));
        }

        const interval = setInterval(() => {
            if (open) void loadRequests();
        }, 10000);

        return () => {
            clearInterval(interval);
        };
    }, [isStaff, open, refreshPendingAccessRequestsCount]);

    const handleDecision = async (request, status) => {
        setBusyId(request.id);

        try {
            const { error } = await api('/requests', {
                method: 'PATCH',
                body: { id: request.id, status }
            });

            if (error) throw new Error(error.message);

            setRequests((current) => current.filter((item) => item.id !== request.id));
            await refreshPendingAccessRequestsCount();
        } catch (error) {
            console.error(`Error cambiando solicitud a ${status}:`, error);
            window.alert(error.message || 'No se pudo actualizar la solicitud.');
        } finally {
            setBusyId(null);
        }
    };

    if (!isStaff) return null;

    return (
        <div ref={containerRef}>
            {open && (
                <div style={panelStyle}>
                    <div style={{ padding: '1.1rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'white', fontWeight: 800 }}>
                                <Shield size={18} color="#c084fc" />
                                Solicitudes de acceso
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                {title}
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            style={{ ...actionButtonStyle, background: 'rgba(255,255,255,0.06)', color: '#cbd5e1' }}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div style={{ maxHeight: 'calc(70vh - 84px)', overflowY: 'auto', padding: '0.85rem' }}>
                        {loading ? (
                            <div style={{ padding: '1rem', color: '#94a3b8' }}>Cargando solicitudes...</div>
                        ) : requests.length === 0 ? (
                            <div style={{ padding: '1.25rem', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', textAlign: 'center' }}>
                                No hay solicitudes pendientes.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {requests.map((request) => (
                                    <div
                                        key={request.id}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '18px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: 'white', fontWeight: 700 }}>
                                            <User size={16} color="#c084fc" />
                                            {request.name}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#94a3b8', marginTop: '0.45rem', fontSize: '0.9rem' }}>
                                            <Mail size={15} />
                                            {request.email}
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.55rem' }}>
                                            {new Date(request.created_at).toLocaleString()}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.55rem', marginTop: '0.9rem' }}>
                                            <button
                                                onClick={() => handleDecision(request, 'rejected')}
                                                disabled={busyId === request.id}
                                                style={{
                                                    ...actionButtonStyle,
                                                    background: 'rgba(244, 63, 94, 0.14)',
                                                    color: '#fb7185',
                                                    opacity: busyId === request.id ? 0.6 : 1
                                                }}
                                            >
                                                <X size={17} />
                                            </button>
                                            <button
                                                onClick={() => handleDecision(request, 'approved')}
                                                disabled={busyId === request.id}
                                                style={{
                                                    ...actionButtonStyle,
                                                    background: 'rgba(16, 185, 129, 0.14)',
                                                    color: '#34d399',
                                                    opacity: busyId === request.id ? 0.6 : 1
                                                }}
                                            >
                                                <Check size={17} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <button
                onClick={() => setOpen((current) => !current)}
                title="Solicitudes de acceso"
                style={bubbleButtonStyle}
            >
                <UserPlus size={26} />
                {pendingAccessRequestsCount > 0 && (
                    <span
                        style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-2px',
                            minWidth: '24px',
                            height: '24px',
                            padding: '0 6px',
                            borderRadius: '999px',
                            background: '#f43f5e',
                            color: 'white',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid rgba(15, 23, 42, 0.96)'
                        }}
                    >
                        {pendingAccessRequestsCount}
                    </span>
                )}
            </button>
        </div>
    );
};

export default AdminAccessRequestsBubble;
