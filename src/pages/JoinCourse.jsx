import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { GraduationCap, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles, ShieldAlert, Lock, Clock, Users, BookOpen } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';

export default function JoinCourse() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, loading: authLoading, refreshSession, refreshEnrolledCourses } = useAuth();

    const codeFromUrl = (searchParams.get('code') || '').trim().toUpperCase();
    const errorFromUrl = searchParams.get('error');

    const [manualCode, setManualCode] = useState(codeFromUrl);
    const [status, setStatus] = useState('idle'); // 'idle' | 'checking' | 'joining' | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('');
    const [verifiedCodeInfo, setVerifiedCodeInfo] = useState(null);
    const [enrolledCourse, setEnrolledCourse] = useState(null);
    const hasExecutedRef = useRef(false);

    // Validar código contra el backend público antes de permitir cualquier acción
    const verifyCodeValidity = useCallback(async (codeToVerify) => {
        if (!codeToVerify) return null;
        setStatus('checking');
        setErrorMsg('');

        try {
            const res = await fetch(`/api/enrollments/code?code=${encodeURIComponent(codeToVerify)}`);
            const data = await res.json();

            if (!res.ok || !data.valid) {
                const errMsg = data.message || (data.error === 'expired' 
                    ? 'Este enlace de invitación ha expirado. Solicita a tu docente que amplíe la vigencia.' 
                    : 'Código de invitación no encontrado o no válido.');
                setErrorMsg(errMsg);
                setVerifiedCodeInfo(data?.error === 'expired' ? { ...data, isExpired: true } : null);
                setStatus('error');
                return null;
            }

            setVerifiedCodeInfo(data);
            setStatus('idle');
            return data;
        } catch (err) {
            setErrorMsg('No se pudo verificar el código de invitación. Comprueba tu conexión a internet.');
            setStatus('error');
            return null;
        }
    }, []);

    // Ejecutar canje si el usuario ya está autenticado y el código es válido
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

            // Redirigir automáticamente al dashboard tras confirmación
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 1800);
        } catch (err) {
            setErrorMsg(err.message || 'No fue posible unirse al curso con este enlace');
            setStatus('error');
        }
    }, [refreshSession, refreshEnrolledCourses, navigate]);

    // Manejar errores que vienen desde la redirección del callback de Google
    useEffect(() => {
        if (errorFromUrl) {
            setStatus('error');
            if (errorFromUrl === 'expired') {
                setErrorMsg('El enlace de invitación utilizado ha expirado. Por motivos de seguridad de la clase, solicita a tu profesor que reactive el enlace para que puedas unirte.');
            } else if (errorFromUrl === 'not_found') {
                setErrorMsg('El código de invitación proporcionado no existe en SaberLab. Verifica el enlace con tu docente.');
            } else if (errorFromUrl === 'code_required') {
                setErrorMsg('Para registrarte en SaberLab necesitas un código o enlace de invitación oficial emitido por tu docente.');
            } else {
                setErrorMsg('No se pudo completar el registro mediante el enlace proporcionado.');
            }
        }
    }, [errorFromUrl]);

    // Al montar o cambiar código en URL, validar inmediatamente
    useEffect(() => {
        if (errorFromUrl) return;

        const targetCode = codeFromUrl || localStorage.getItem('pending_join_code') || sessionStorage.getItem('pending_join_code');
        if (!targetCode) return;

        verifyCodeValidity(targetCode).then(validInfo => {
            if (validInfo && user) {
                if (!hasExecutedRef.current) {
                    hasExecutedRef.current = true;
                    executeJoin(targetCode);
                }
            } else if (validInfo && !user) {
                localStorage.setItem('pending_join_code', targetCode);
                sessionStorage.setItem('pending_join_code', targetCode);
            }
        });
    }, [codeFromUrl, user, errorFromUrl, verifyCodeValidity, executeJoin]);

    const handleGoogleLogin = () => {
        const targetCode = verifiedCodeInfo?.code || codeFromUrl || manualCode;
        if (!targetCode || !verifiedCodeInfo?.valid) {
            setErrorMsg('Debes verificar un código de invitación válido antes de continuar.');
            setStatus('error');
            return;
        }

        localStorage.setItem('pending_join_code', targetCode);
        sessionStorage.setItem('pending_join_code', targetCode);
        window.location.assign(`/api/auth/start?join_code=${encodeURIComponent(targetCode)}`);
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        const codeTrimmed = manualCode.trim().toUpperCase();
        if (!codeTrimmed) return;

        const validInfo = await verifyCodeValidity(codeTrimmed);
        if (validInfo) {
            if (user) {
                executeJoin(codeTrimmed);
            } else {
                localStorage.setItem('pending_join_code', codeTrimmed);
                sessionStorage.setItem('pending_join_code', codeTrimmed);
            }
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e0f2fe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            color: '#0f172a',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
        }}>
            <div style={{
                maxWidth: '520px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(221, 214, 254, 0.8)',
                borderRadius: '28px',
                padding: '2.5rem',
                textAlign: 'center',
                boxShadow: '0 20px 50px -10px rgba(109, 40, 217, 0.12), 0 0 30px rgba(2, 132, 199, 0.08)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Resplandor decorativo de fondo */}
                <div style={{
                    position: 'absolute',
                    top: '-60px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '260px',
                    height: '140px',
                    background: status === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(147, 51, 234, 0.12)',
                    filter: 'blur(50px)',
                    pointerEvents: 'none'
                }} />

                {/* Logo o Icono Principal */}
                <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '22px',
                    background: status === 'error'
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : status === 'success'
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    boxShadow: status === 'error'
                        ? '0 10px 25px rgba(239, 68, 68, 0.25)'
                        : '0 10px 25px rgba(109, 40, 217, 0.25)',
                    transition: 'all 0.3s ease'
                }}>
                    {status === 'error' ? (
                        <ShieldAlert size={36} color="#fff" />
                    ) : status === 'success' ? (
                        <CheckCircle2 size={36} color="#fff" />
                    ) : (
                        <GraduationCap size={38} color="#fff" />
                    )}
                </div>

                {/* 1. Cargando autenticación o validando código */}
                {authLoading || status === 'checking' || status === 'joining' ? (
                    <div style={{ padding: '1rem 0' }}>
                        <Loader2 size={42} className="animate-spin" color="#7c3aed" style={{ margin: '0 auto 1rem' }} />
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                            {status === 'checking' 
                                ? 'Verificando enlace de clase...' 
                                : status === 'joining' 
                                    ? 'Inscribiéndote en el curso...' 
                                    : 'Cargando sesión...'}
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            Validando vigencia del enlace y permisos de acceso oficial.
                        </p>
                    </div>
                ) : status === 'success' ? (
                    /* 2. Éxito de inscripción */
                    <div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            padding: '4px 14px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            marginBottom: '1rem',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}>
                            <CheckCircle2 size={15} />
                            <span>Inscripción Verificada</span>
                        </div>

                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                            ¡Bienvenido al Curso!
                        </h2>

                        <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                            Has sido matriculado exitosamente en:
                        </p>

                        <div style={{
                            background: '#f8fafc',
                            border: '1.5px solid rgba(16, 185, 129, 0.4)',
                            borderRadius: '18px',
                            padding: '1.25rem',
                            marginBottom: '1.5rem',
                            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.08)'
                        }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.4rem', color: '#0f172a' }}>
                                {enrolledCourse?.name || 'Curso Asignado'}
                            </h3>
                            <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700 }}>
                                Acceso Activo e Inmediato
                            </span>
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
                                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span>Ir al Curso Ahora</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                ) : status === 'error' ? (
                    /* 3. Error: Enlace expirado o código inválido (BLOQUEO DE GOOGLE) */
                    <div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            padding: '4px 14px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            marginBottom: '1rem',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                            <Lock size={14} />
                            <span>Acceso No Autorizado</span>
                        </div>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f87171', marginBottom: '0.6rem' }}>
                            {verifiedCodeInfo?.isExpired || errorFromUrl === 'expired' || errorMsg.includes('expirado')
                                ? 'Enlace de Invitación Expirado'
                                : 'No es posible unirse'}
                        </h2>

                        <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                            {errorMsg}
                        </p>

                        {/* Bloqueo explícito del botón de Google */}
                        <div style={{
                            background: '#fef2f2',
                            border: '1px dashed rgba(239, 68, 68, 0.4)',
                            borderRadius: '16px',
                            padding: '1.25rem',
                            marginBottom: '1.5rem',
                            textAlign: 'left'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <Clock size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <h4 style={{ margin: '0 0 0.3rem', fontSize: '0.92rem', color: '#991b1b', fontWeight: 700 }}>
                                        ¿Qué debes hacer ahora?
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                                        Para mantener el aula protegida, los enlaces tienen una duración programada. Solicita a tu profesor que haga clic en <strong>"Dar más tiempo"</strong> en su panel docente para renovar este enlace.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Formulario para ingresar otro código si el alumno dispone de uno */}
                        <form onSubmit={handleManualSubmit} style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                    placeholder="Ingresa tu código..."
                                    style={{
                                        flex: 1,
                                        background: '#f8fafc',
                                        border: '1.5px solid #cbd5e1',
                                        borderRadius: '12px',
                                        padding: '0.8rem 1rem',
                                        color: '#0f172a',
                                        fontSize: '0.95rem',
                                        textTransform: 'uppercase',
                                        fontFamily: 'monospace',
                                        letterSpacing: '0.5px'
                                    }}
                                />
                                <button
                                    type="submit"
                                    style={{
                                        background: '#6d28d9',
                                        border: 'none',
                                        color: '#fff',
                                        borderRadius: '12px',
                                        padding: '0.8rem 1.25rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Validar
                                </button>
                            </div>
                        </form>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                            <Link
                                to="/dashboard"
                                style={{
                                    color: '#0284c7',
                                    fontSize: '0.88rem',
                                    textDecoration: 'none',
                                    fontWeight: 600
                                }}
                            >
                                ← Volver al Panel
                            </Link>
                            <Link
                                to="/login"
                                style={{
                                    color: '#64748b',
                                    fontSize: '0.88rem',
                                    textDecoration: 'none'
                                }}
                            >
                                Iniciar Sesión Existente
                            </Link>
                        </div>
                    </div>
                ) : verifiedCodeInfo?.valid && !user ? (
                    /* 4. Enlace VERIFICADO y VÁLIDO para un alumno no logueado (BOTÓN GOOGLE ACTIVO) */
                    <div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: '#f3e8ff',
                            color: '#7e22ce',
                            padding: '4px 14px',
                            borderRadius: '20px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            marginBottom: '1rem',
                            border: '1px solid #e9d5ff'
                        }}>
                            <Sparkles size={14} />
                            <span>Invitación Oficial Verificada</span>
                        </div>

                        <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
                            ¡Te han invitado a una clase!
                        </h2>

                        {/* Tarjeta con los datos del curso y grupo validado */}
                        <div style={{
                            background: '#f8fafc',
                            border: '1.5px solid #ddd6fe',
                            borderRadius: '18px',
                            padding: '1.25rem',
                            marginBottom: '1.5rem',
                            textAlign: 'left'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                                <BookOpen size={18} color="#6d28d9" />
                                <span style={{ fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                                    Curso Asignado
                                </span>
                            </div>
                            <h3 style={{ margin: '0 0 0.6rem', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                                {verifiedCodeInfo.course_name}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6d28d9', fontSize: '0.88rem', fontWeight: 600 }}>
                                <Users size={16} />
                                <span>Grupo: <strong>{verifiedCodeInfo.group_name}</strong></span>
                            </div>
                        </div>

                        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                            Para ingresar directamente y quedar matriculado en tu grupo, continúa con tu cuenta de Google.
                        </p>

                        <button
                            onClick={handleGoogleLogin}
                            style={{
                                width: '100%',
                                background: '#ffffff',
                                color: '#0f172a',
                                fontWeight: 700,
                                fontSize: '1rem',
                                padding: '0.95rem 1.25rem',
                                borderRadius: '14px',
                                border: '1.5px solid #cbd5e1',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                                transition: 'all 0.2s ease',
                                marginBottom: '1.25rem'
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
                                color: '#64748b',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            ¿Ya tienes cuenta? Iniciar sesión normal
                        </button>
                    </div>
                ) : (
                    /* 5. Vista por defecto sin código o formulario manual */
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                            Unirse a un Curso
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
                            Ingresa el código de acceso proporcionado por tu profesor para inscribirte a tu grupo oficial.
                        </p>

                        <form onSubmit={handleManualSubmit}>
                            <input
                                type="text"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                placeholder="Código de invitación"
                                required
                                style={{
                                    width: '100%',
                                    background: '#f8fafc',
                                    border: '1.5px solid #cbd5e1',
                                    borderRadius: '14px',
                                    padding: '0.95rem 1rem',
                                    color: '#0f172a',
                                    fontSize: '1.1rem',
                                    textAlign: 'center',
                                    textTransform: 'uppercase',
                                    fontFamily: 'monospace',
                                    letterSpacing: '1.5px',
                                    boxSizing: 'border-box',
                                    marginBottom: '1.25rem'
                                }}
                            />

                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                                    color: '#ffffff',
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    padding: '0.95rem',
                                    borderRadius: '14px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 20px rgba(109, 40, 217, 0.3)'
                                }}
                            >
                                Verificar Código e Inscribirme
                            </button>
                        </form>

                        <div style={{ marginTop: '1.5rem' }}>
                            <Link
                                to="/"
                                style={{
                                    color: '#0284c7',
                                    fontSize: '0.85rem',
                                    textDecoration: 'none',
                                    fontWeight: 600
                                }}
                            >
                                ← Volver al Inicio Principal
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

