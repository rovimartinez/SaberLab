import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, CheckCircle, Clock, RotateCw, AlertTriangle, LogOut } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/useAuth';
import '../styles/Login.css';

const RequestAccess = () => {
    const navigate = useNavigate();
    const { user, profile, signOut, refreshSession } = useAuth();
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [requestStatus, setRequestStatus] = useState(profile?.access_status || 'pending');

    const isApproved = profile?.role === 'admin' || profile?.access_status === 'approved';

    // Si ya está aprobado, redirigir directo al dashboard
    useEffect(() => {
        if (isApproved) {
            navigate('/dashboard', { replace: true });
        }
    }, [isApproved, navigate]);

    // Polling cada 5 segundos para verificar si el docente/admin aprobó la solicitud
    useEffect(() => {
        if (!user || isApproved) return;

        const checkStatus = async () => {
            try {
                if (refreshSession) {
                    await refreshSession();
                }
                const email = user.email;
                if (email) {
                    const { data } = await api('/requests?email=' + encodeURIComponent(email.toLowerCase()));
                    if (data?.status) {
                        setRequestStatus(data.status);
                        if (data.status === 'approved') {
                            navigate('/dashboard', { replace: true });
                        }
                    }
                }
            } catch (err) {
                console.error('Error verificando estado de aprobación:', err);
            }
        };

        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, [user, isApproved, navigate, refreshSession]);

    const handleManualCheck = async () => {
        setChecking(true);
        try {
            if (refreshSession) {
                await refreshSession();
            }
            const email = user?.email;
            if (email) {
                const { data } = await api('/requests?email=' + encodeURIComponent(email.toLowerCase()));
                if (data?.status) {
                    setRequestStatus(data.status);
                    if (data.status === 'approved') {
                        navigate('/dashboard', { replace: true });
                        return;
                    }
                }
            }
        } catch (err) {
            console.error('Error al comprobar estado:', err);
        } finally {
            setTimeout(() => setChecking(false), 500);
        }
    };

    const handleReRequest = async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const normalizedEmail = user.email.trim().toLowerCase();
            const fullName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0];

            const { data: existingRequest } = await api('/requests?email=' + encodeURIComponent(normalizedEmail));

            if (existingRequest?.id) {
                await api('/requests', {
                    method: 'PATCH',
                    body: { id: existingRequest.id, name: fullName, email: normalizedEmail, status: 'pending' }
                });
            } else {
                await api('/requests', {
                    method: 'POST',
                    body: { name: fullName, email: normalizedEmail, status: 'pending' }
                });
            }

            setRequestStatus('pending');
            if (refreshSession) await refreshSession();
        } catch (err) {
            console.error('Error al re-solicitar acceso:', err);
            alert('Error al enviar solicitud: ' + (err.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    const userData = {
        name: profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Estudiante',
        email: profile?.email || user?.email || ''
    };

    if (!user) {
        return (
            <div className="auth-wrapper">
                <div className="auth-card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
                    <Shield size={48} color="#8b5cf6" style={{ margin: '0 auto 1rem' }} />
                    <h2 style={{ color: 'white', marginBottom: '0.75rem' }}>Identificación requerida</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                        Debes iniciar sesión con tu cuenta de Google institucional para solicitar acceso.
                    </p>
                    <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                        Ir al Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-card" style={{ maxWidth: '480px', padding: '2.5rem 2rem' }}>
                <div className="auth-header" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <div style={{
                        width: '76px',
                        height: '76px',
                        borderRadius: '24px',
                        background: requestStatus === 'rejected'
                            ? 'linear-gradient(135deg, rgba(244,63,94,0.2) 0%, rgba(225,29,72,0.3) 100%)'
                            : 'linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(99,102,241,0.3) 100%)',
                        border: `1px solid ${requestStatus === 'rejected' ? 'rgba(244,63,94,0.4)' : 'rgba(56,189,248,0.4)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.25rem',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.3)'
                    }}>
                        {requestStatus === 'rejected' ? (
                            <AlertTriangle size={36} color="#f43f5e" />
                        ) : requestStatus === 'approved' ? (
                            <CheckCircle size={36} color="#10b981" />
                        ) : (
                            <Clock size={36} color="#38bdf8" />
                        )}
                    </div>

                    <h1 className="auth-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
                        {requestStatus === 'rejected'
                            ? 'Solicitud no aprobada'
                            : requestStatus === 'approved'
                            ? '¡Acceso Aprobado!'
                            : 'Esperando Aprobación'}
                    </h1>

                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.92rem', lineHeight: '1.5' }}>
                        {requestStatus === 'rejected'
                            ? 'Tu solicitud no fue aprobada por el administrador. Si consideras que es un error, puedes reenviarla.'
                            : requestStatus === 'approved'
                            ? 'Tu cuenta ha sido autorizada. Redirigiendo a tu panel...'
                            : 'Tu cuenta de Google fue verificada. El docente o administrador debe aprobar tu ingreso antes de acceder a las clases.'}
                    </p>
                </div>

                <div style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(56,189,248,0.1)' }}>
                            <User size={18} color="#38bdf8" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Estudiante</span>
                            <span style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{userData.name}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(56,189,248,0.1)' }}>
                            <Mail size={18} color="#38bdf8" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Correo Institucional</span>
                            <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{userData.email}</span>
                        </div>
                    </div>
                    <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        background: requestStatus === 'rejected' ? 'rgba(244,63,94,0.15)' : 'rgba(56,189,248,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Estado de autorización:</span>
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: requestStatus === 'rejected' ? '#f43f5e' : requestStatus === 'approved' ? '#10b981' : '#38bdf8'
                        }}>
                            {requestStatus === 'rejected' ? 'Rechazada' : requestStatus === 'approved' ? 'Aprobada' : 'Pendiente'}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {requestStatus === 'rejected' ? (
                        <button
                            onClick={handleReRequest}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                                color: 'white',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Reenviando...' : 'Reenviar solicitud al docente'}
                        </button>
                    ) : (
                        <button
                            onClick={handleManualCheck}
                            disabled={checking}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                color: 'white',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                cursor: checking ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <RotateCw size={16} className={checking ? 'animate-spin' : ''} />
                            {checking ? 'Comprobando estado...' : 'Comprobar si ya fui aprobado'}
                        </button>
                    )}

                    <button
                        onClick={() => signOut().then(() => navigate('/login'))}
                        style={{
                            width: '100%',
                            padding: '11px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}
                    >
                        <LogOut size={16} />
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestAccess;

