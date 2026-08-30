import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { GraduationCap, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';

export default function JoinCourse() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, loading: authLoading, refreshEnrolledCourses } = useAuth();

    const codeFromUrl = (searchParams.get('code') || '').trim().toUpperCase();
    const [manualCode, setManualCode] = useState(codeFromUrl);
    const [status, setStatus] = useState('idle'); // 'idle' | 'joining' | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('');
    const [enrolledCourse, setEnrolledCourse] = useState(null);

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
            if (refreshEnrolledCourses) {
                await refreshEnrolledCourses();
            }
            sessionStorage.removeItem('pending_join_code');
        } catch (err) {
            setErrorMsg(err.message || 'No fue posible unirse al curso con este enlace');
            setStatus('error');
        }
    }, [refreshEnrolledCourses]);

    useEffect(() => {
        if (authLoading) return;

        const targetCode = codeFromUrl || sessionStorage.getItem('pending_join_code');

        if (targetCode) {
            if (user) {
                executeJoin(targetCode);
            } else {
                // Guardar código para después de que inicie sesión
                sessionStorage.setItem('pending_join_code', targetCode);
            }
        }
    }, [authLoading, user, codeFromUrl, executeJoin]);

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
                            Para unirte automáticamente con este enlace directo ({codeFromUrl || 'Código'}), por favor inicia sesión con tu cuenta escolar.
                        </p>

                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                                color: '#0f172a',
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
                                boxShadow: '0 8px 20px rgba(56, 189, 248, 0.3)'
                            }}
                        >
                            <LogIn size={18} />
                            <span>Iniciar Sesión para Unirme</span>
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
                            marginBottom: '2rem'
                        }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                                {enrolledCourse?.name || 'Curso Asignado'}
                            </h3>
                        </div>

                        <button
                            onClick={() => navigate('/dashboard/my-courses')}
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
