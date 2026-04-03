import React, { useState, useEffect } from 'react';
import { Check, X, User, Mail, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';

const AccessRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedbackModal, setFeedbackModal] = useState({
        open: false,
        tone: 'success',
        title: '',
        message: ''
    });
    const { refreshPendingAccessRequestsCount } = useAuth();

    const loadRequests = async () => {
        const { data, error } = await supabase
            .from('access_requests')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setRequests(data);
        }

        await refreshPendingAccessRequestsCount();
        setLoading(false);
    };

    useEffect(() => {
        loadRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const channel = supabase
            .channel('admin-access-requests-list')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'access_requests' },
                () => {
                    loadRequests();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openFeedbackModal = (tone, title, message) => {
        setFeedbackModal({
            open: true,
            tone,
            title,
            message
        });
    };

    const closeFeedbackModal = () => {
        setFeedbackModal((current) => ({ ...current, open: false }));
    };

    const handleApprove = async (request) => {
        try {
            const normalizedEmail = request.email.trim().toLowerCase();

            const { data: existingProfile, error: existingProfileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', normalizedEmail)
                .maybeSingle();

            if (existingProfileError) throw existingProfileError;

            const { error: approveError } = await supabase
                .from('access_requests')
                .update({ status: 'approved' })
                .eq('id', request.id);

            if (approveError) throw approveError;

            if (existingProfile) {
                openFeedbackModal(
                    'success',
                    'Solicitud aprobada',
                    'El estudiante ya tenía perfil, así que puede ingresar de inmediato.'
                );
            } else {
                openFeedbackModal(
                    'success',
                    'Solicitud aprobada',
                    'Cuando el estudiante vuelva a iniciar sesión, su perfil se creará automáticamente y podrá entrar.'
                );
            }

            loadRequests();
        } catch (err) {
            console.error(err);
            openFeedbackModal('error', 'No se pudo aprobar', err.message);
        }
    };

    const handleReject = async (request) => {
        try {
            const { error } = await supabase
                .from('access_requests')
                .update({ status: 'rejected' })
                .eq('id', request.id);

            if (error) throw error;

            openFeedbackModal(
                'success',
                'Solicitud rechazada',
                'La solicitud se marcó como rechazada correctamente.'
            );
            loadRequests();
        } catch (err) {
            openFeedbackModal('error', 'No se pudo rechazar', err.message);
        }
    };

    if (loading) return <div className="glass-panel" style={{ padding: '2rem' }}>Cargando...</div>;

    return (
        <div style={{ padding: '1rem' }}>
            <h1 style={{ marginBottom: '1.5rem' }}>Solicitudes de acceso</h1>

            {requests.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>No hay solicitudes pendientes</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {requests.map((req) => (
                        <div key={req.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <User size={18} color="#8b5cf6" />
                                    <span style={{ fontWeight: '600', color: 'white' }}>{req.name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                    <Mail size={16} />
                                    <span>{req.email}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                    <Clock size={14} />
                                    <span>{new Date(req.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => handleReject(req)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: 'rgba(244, 63, 94, 0.2)',
                                        color: '#f43f5e',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <X size={18} />
                                </button>
                                <button
                                    onClick={() => handleApprove(req)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: 'rgba(16, 185, 129, 0.2)',
                                        color: '#10b981',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Check size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {feedbackModal.open && (
                <div
                    onClick={closeFeedbackModal}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.72)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1200,
                        padding: '1rem'
                    }}
                >
                    <div
                        className="glass-panel"
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '460px',
                            padding: '1.75rem',
                            borderRadius: '24px',
                            border: `1px solid ${feedbackModal.tone === 'success' ? 'rgba(16,185,129,0.35)' : 'rgba(244,63,94,0.35)'}`,
                            boxShadow: `0 24px 80px ${feedbackModal.tone === 'success' ? 'rgba(16,185,129,0.18)' : 'rgba(244,63,94,0.16)'}`,
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: feedbackModal.tone === 'success'
                                    ? 'radial-gradient(circle at top right, rgba(16,185,129,0.16), transparent 45%)'
                                    : 'radial-gradient(circle at top right, rgba(244,63,94,0.16), transparent 45%)',
                                pointerEvents: 'none'
                            }}
                        />
                        <button
                            onClick={closeFeedbackModal}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                width: '34px',
                                height: '34px',
                                borderRadius: '999px',
                                border: '1px solid rgba(255,255,255,0.08)',
                                background: 'rgba(255,255,255,0.04)',
                                color: '#cbd5e1',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={16} style={{ marginTop: '2px' }} />
                        </button>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div
                                style={{
                                    width: '62px',
                                    height: '62px',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: feedbackModal.tone === 'success' ? 'rgba(16,185,129,0.14)' : 'rgba(244,63,94,0.14)',
                                    color: feedbackModal.tone === 'success' ? '#10b981' : '#f43f5e',
                                    marginBottom: '1rem'
                                }}
                            >
                                {feedbackModal.tone === 'success' ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
                            </div>

                            <h2 style={{ margin: 0, color: 'white', fontSize: '1.35rem', fontWeight: 800 }}>
                                {feedbackModal.title}
                            </h2>
                            <p style={{ margin: '0.75rem 0 1.5rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                {feedbackModal.message}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={closeFeedbackModal}
                                    style={{
                                        padding: '0.8rem 1.2rem',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: feedbackModal.tone === 'success'
                                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                            : 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                                        color: 'white',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessRequests;
