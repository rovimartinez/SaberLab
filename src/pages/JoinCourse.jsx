import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { GraduationCap, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';

export default function JoinCourse() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, loading: authLoading, refreshSession, refreshEnrolledCourses } = useAuth();

    const codeFromUrl = (searchParams.get('code') || '').trim().toUpperCase();
    const [manualCode, setManualCode] = useState(codeFromUrl);
    const [status, setStatus] = useState('idle'); // 'idle' | 'joining' | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('');
    const [enrolledCourse, setEnrolledCourse] = useState(null);
    const hasExecutedRef = React.useRef(false);

    const executeJoin = useCallback(async (codeToRedeem) => {
        if (!codeToRedeem) return;
        setStatus('joining');
        setErrorMsg('');

        try {
            const { data, error } = await api('/enrollments/code', {
                method: 'POST',
                body: { code: codeToRedeem }
            });

            if (error || !data?.curso) {
                throw new Error(error?.message || 'Código inválido o expirado');
            }

            setEnrolledCourse(data.curso);
            setStatus('success');
            sessionStorage.removeItem('pending_join_code');
            localStorage.removeItem('pending_join_code');

            if (refreshSession) {
                await refreshSession();
            }
            if (refreshEnrolledCourses) {
                await refreshEnrolledCourses();
            }

            // Redirigir automáticamente al curso tras breve confirmación
            setTimeout(() => {
                const targetSlug = data.curso?.slug || 'robotica-educativa';
                navigate(`/dashboard/my-courses/${targetSlug}`, { replace: true });
            }, 1800);
        } catch (err) {
            setErrorMsg(err.message || 'No fue posible unirse al curso con este enlace');
            setStatus('error');
        }
    }, [refreshSession, refreshEnrolledCourses, navigate]);

    useEffect(() => {
        if (authLoading) return;

        const targetCode = codeFromUrl || localStorage.getItem('pending_join_code') || sessionStorage.getItem('pending_join_code');

        if (targetCode) {
            if (user) {
                if (!hasExecutedRef.current) {
                    hasExecutedRef.current = true;
                    executeJoin(targetCode);
                }
            } else {
                // Guardar código para después de que inicie sesión
                localStorage.setItem('pending_join_code', targetCode);
                sessionStorage.setItem('pending_join_code', targetCode);
            }
        }
    }, [authLoading, user, codeFromUrl, executeJoin]);

    const handleGoogleLogin = () => {
        const targetCode = codeFromUrl || manualCode || localStorage.getItem('pending_join_code') || sessionStorage.getItem('pending_join_code');
        if (targetCode) {
            localStorage.setItem('pending_join_code', targetCode);
            sessionStorage.setItem('pending_join_code', targetCode);
        }
        window.location.assign(`/api/auth/start?join_code=${encodeURIComponent(targetCode || '')}`);
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualCode.trim()) return;
        executeJoin(manualCode.trim().toUpperCase());
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #0d1527 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            color: '#fff',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{
                maxWidth: '500px',
                width: '100%',
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '28px',
                padding: '2.5rem',
                textAlign: 'center',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Logo o Icono Principal */}
                <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    boxShadow: '0 10px 25px rgba(56, 189, 248, 0.35)'
                }}>
                    <GraduationCap size={36} color="#fff" />
                </div>

                {authLoading || status === 'joining' ? (
                    <div>
                        <Loader2 size={40} className="animate-spin" color="#38bdf8" style={{ margin: '0 auto 1rem' }} />
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                            Inscribiéndote en el curso...
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            Validando credenciales y enlace de acceso directo.
                        </p>
                    </div>
                ) : !user ? (
                    /* Estudiante no autenticado */
                    <div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'rgba(56, 189, 248, 0.12)',
                            color: '#38bdf8',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            marginBottom: '1rem'
                        }}>
                            <Sparkles size={14} />
                            <span>Enlace de Invitación SaberLab</span>
                        </div>

                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                            ¡Te han invitado a un curso!
                        </h2>

                        <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                            Para unirte de forma automática con este enlace directo ({codeFromUrl || manualCode || 'Código'}), continúa con tu cuenta de Google.
                        </p>

                        <button
                            onClick={handleGoogleLogin}
                            style={{
                                width: '100%',
                                background: '#ffffff',
                                color: '#0f172a',
                                fontWeight: 700,
                                fontSize: '1rem',
                                padding: '1rem',
                                borderRadius: '14px',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
                                transition: 'all 0.2s ease',
                                marginBottom: '1rem'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Continuar con Google y Unirme</span>
                        </button>

                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Otras opciones de inicio de sesión
                        </button>
                    </div>
                ) : status === 'success' ? (
                    /* Éxito */
                    <div>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                            border: '2px solid rgba(16, 185, 129, 0.4)'
                        }}>
                            <CheckCircle2 size={32} />
                        </div>

                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginBottom: '0.5rem' }}>
                            ¡Inscripción Exitosa!
                        </h2>

                        <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                            Ya tienes acceso completo al curso:
                        </p>

                        <div style={{
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '16px',
                            padding: '1.25rem',
                            marginBottom: '1.5rem'
                        }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                                {enrolledCourse?.name || 'Curso Asignado'}
                            </h3>
                        </div>

                        <button
                            onClick={() => {
                                const targetSlug = enrolledCourse?.slug || 'robotica-educativa';
                                navigate(`/dashboard/my-courses/${targetSlug}`, { replace: true });
                            }}
                            style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '1rem',
                                padding: '1rem',
                                borderRadius: '14px',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                            }}
                        >
                            <span>Ir al Curso Ahora</span>
                            <ArrowRight size={18} />
                        </button>
                        <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.75rem', marginBottom: 0 }}>
                            Entrando al curso automáticamente...
                        </p>
                    </div>
                ) : status === 'error' ? (
                    /* Error / Código vencido */
                    <div>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                            border: '2px solid rgba(239, 68, 68, 0.4)'
                        }}>
                            <AlertCircle size={32} />
                        </div>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f87171', marginBottom: '0.5rem' }}>
                            No fue posible unirse
                        </h2>

                        <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                            {errorMsg.includes('expirado') ? (
                                <>
                                    Este enlace ha <strong>expirado</strong>. Pídele a tu docente que haga clic en <em>"Dar más tiempo"</em> para que puedas ingresar con este mismo enlace.
                                </>
                            ) : (
                                errorMsg
                            )}
                        </p>

                        <form onSubmit={handleManualSubmit} style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                    placeholder="Ingresar otro código..."
                                    style={{
                                        flex: 1,
                                        background: 'rgba(15, 23, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        borderRadius: '10px',
                                        padding: '0.75rem 1rem',
                                        color: '#fff',
                                        fontSize: '0.95rem',
                                        textTransform: 'uppercase',
                                        fontFamily: 'monospace'
                                    }}
                                />
                                <button
                                    type="submit"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: '#fff',
                                        borderRadius: '10px',
                                        padding: '0.75rem 1.25rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Reintentar
                                </button>
                            </div>
                        </form>

                        <Link
                            to="/dashboard"
                            style={{
                                color: '#38bdf8',
                                fontSize: '0.85rem',
                                textDecoration: 'none',
                                fontWeight: 600
                            }}
                        >
                            ← Volver al Panel Principal
                        </Link>
                    </div>
                ) : (
                    /* Formulario manual cuando no viene código en la URL */
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                            Unirse a un Curso
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Ingresa el código proporcionado por tu profesor para inscribirte de inmediato.
                        </p>

                        <form onSubmit={handleManualSubmit}>
                            <input
                                type="text"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                placeholder="Ej: EE-7842"
                                required
                                style={{
                                    width: '100%',
                                    background: 'rgba(15, 23, 42, 0.8)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '12px',
                                    padding: '0.85rem 1rem',
                                    color: '#fff',
                                    fontSize: '1.1rem',
                                    textAlign: 'center',
                                    textTransform: 'uppercase',
                                    fontFamily: 'monospace',
                                    letterSpacing: '1px',
                                    boxSizing: 'border-box',
                                    marginBottom: '1.25rem'
                                }}
                            />

                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                                    color: '#0f172a',
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    padding: '0.9rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Inscribirme al Curso
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
