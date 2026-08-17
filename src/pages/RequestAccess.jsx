import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/useAuth';
import '../styles/Login.css';

const RequestAccess = () => {
    const navigate = useNavigate();
    const { user, profile, signOut } = useAuth();
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [userData, setUserData] = useState(null);
    const [requestStatus, setRequestStatus] = useState(localStorage.getItem('pending_status') || 'pending');

    React.useEffect(() => {
        let cancelled = false;

        const resolveExistingProfile = async () => {
            if (!user?.id && !user?.email) {
                return;
            }

            const normalizedEmail = user?.email?.trim().toLowerCase();

            let data = null;
            let error = null;

            if (user?.id) {
                const { data: responseData, error: responseError } = await api('/profile');
                data = responseData;
                error = responseError;
            }

            if (!data && normalizedEmail) {
                const { data: responseData, error: responseError } = await api('/profile');
                data = responseData;
                error = error || responseError;
            }

            if (error) {
                console.error('Error resolviendo perfil desde RequestAccess:', error);
            }

            if (!cancelled && data) {
                localStorage.removeItem('pending_email');
                localStorage.removeItem('pending_name');
                localStorage.removeItem('pending_status');
                navigate('/dashboard', { replace: true });
            }
        };

        if (user && profile) {
            navigate('/dashboard', { replace: true });
            return;
        }

        void resolveExistingProfile();

        const pendingEmail = localStorage.getItem('pending_email');
        const pendingName = localStorage.getItem('pending_name');

        if (user?.email) {
            setUserData({
                name: user.user_metadata?.full_name || user.user_metadata?.name || pendingName || user.email.split('@')[0],
                email: user.email
            });
            return;
        }

        if (pendingEmail) {
            setUserData({
                name: pendingName || pendingEmail.split('@')[0],
                email: pendingEmail
            });
        }

        return () => {
            cancelled = true;
        };
    }, [navigate, profile, user]);

    const handleRequest = async () => {
        if (!userData) return;

        setLoading(true);

        try {
            const normalizedEmail = userData.email.trim().toLowerCase();

            const { data: existingRequest, error: requestLookupError } = await api('/requests?email=' + encodeURIComponent(normalizedEmail));

            if (requestLookupError) throw requestLookupError;

            if (existingRequest?.status === 'pending') {
                setRequestStatus('pending');
                setSent(true);
                return;
            }

            if (existingRequest?.status === 'approved') {
                setRequestStatus('approved');
                setSent(true);
                return;
            }

            if (existingRequest?.id) {
                const { error: updateError } = await api('/requests', {
                    method: 'PATCH',
                    body: { id: existingRequest.id, name: userData.name, email: normalizedEmail, status: 'pending' }
                });

                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await api('/requests', {
                    method: 'POST',
                    body: { name: userData.name, email: normalizedEmail, status: 'pending' }
                });

                if (insertError) throw insertError;
            }

            localStorage.setItem('pending_email', normalizedEmail);
            localStorage.setItem('pending_name', userData.name);
            localStorage.setItem('pending_status', 'pending');

            setRequestStatus('pending');
            setSent(true);
        } catch (err) {
            console.error('Error:', err);
            alert('Error al enviar solicitud: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const getMessageByStatus = () => {
        if (requestStatus === 'approved') {
            return 'Tu solicitud ya fue aprobada. Cierra sesión e inicia otra vez para activar tu acceso.';
        }

        if (requestStatus === 'rejected') {
            return 'Tu solicitud fue rechazada. Si corresponde, puedes volver a enviarla al administrador.';
        }

        return 'Tu solicitud ha sido enviada al administrador. Te avisaremos cuando sea aprobada.';
    };

    if (!user && !userData) {
        return (
            <div className="auth-wrapper">
                <div className="auth-card">
                    <p>Debes iniciar sesión con Google antes de solicitar acceso.</p>
                    <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                        Ir al login
                    </button>
                </div>
            </div>
        );
    }

    if (sent) {
        return (
            <div className="auth-wrapper">
                <div className="auth-card">
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <CheckCircle size={64} color={requestStatus === 'approved' ? '#3b82f6' : '#10b981'} style={{ marginBottom: '1.5rem' }} />
                        <h2 className="auth-title" style={{ color: requestStatus === 'approved' ? '#3b82f6' : '#10b981', marginBottom: '1rem' }}>
                            {requestStatus === 'approved' ? 'Acceso aprobado' : 'Solicitud enviada'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            {getMessageByStatus()}
                        </p>
                        <button
                            onClick={() => signOut().then(() => navigate('/login'))}
                            className="btn btn-secondary"
                            style={{ marginTop: '1.5rem' }}
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="auth-wrapper">
                <div className="auth-card">
                    <p>Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header" style={{ marginBottom: '2rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)'
                    }}>
                        <Shield size={40} color="white" />
                    </div>
                    <h1 className="auth-title">Acceso pendiente</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Tu cuenta de Google está verificada,<br />
                        pero necesitas aprobación del administrador.
                    </p>
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <User size={20} color="#8b5cf6" />
                        <span style={{ color: 'white' }}>{userData.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Mail size={20} color="#8b5cf6" />
                        <span style={{ color: 'var(--text-secondary)' }}>{userData.email}</span>
                    </div>
                </div>

                <button
                    onClick={handleRequest}
                    disabled={loading}
                    className="auth-submit-btn"
                    style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        color: 'white',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Enviando...' : requestStatus === 'rejected' ? 'Volver a solicitar acceso' : 'Solicitar acceso ahora'}
                </button>

                <button
                    onClick={() => signOut().then(() => navigate('/login'))}
                    style={{
                        width: '100%',
                        marginTop: '1rem',
                        padding: '12px',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer'
                    }}
                >
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
};

export default RequestAccess;
