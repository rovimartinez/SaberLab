import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { Mail, ChevronLeft, ShieldAlert } from 'lucide-react';
import { usePlatformSettings } from '../hooks/usePlatformSettings';
import '../styles/Login.css';

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const Login = () => {
    // UI state: 'login', 'register', or 'forgotPassword'
    const [mode, setMode] = useState('login');
    const [isLoading, setIsLoading] = useState(false);
    
    // Auth context
    const { user, signInWithGoogle, sessionRejected, setSessionRejected } = useAuth();
    const navigate = useNavigate();

    // Catálogos dinámicos
    const { institutions, specialties } = usePlatformSettings();

    // Form State (Not linked to backend yet for email, only doing Google auth)
    const [email, setEmail] = useState('');
    const [classCode, setClassCode] = useState('');
    const [isCodeValid, setIsCodeValid] = useState(false);

    // Redirigir si ya está autenticado (protección extra)
    if (user) {
        const pendingCode = localStorage.getItem('pending_join_code') || sessionStorage.getItem('pending_join_code');
        if (pendingCode) {
            navigate(`/join?code=${encodeURIComponent(pendingCode)}`, { replace: true });
        } else {
            navigate('/dashboard');
        }
    }

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const pendingCode = localStorage.getItem('pending_join_code') || sessionStorage.getItem('pending_join_code');
            if (pendingCode) {
                window.location.assign(`/api/auth/start?join_code=${encodeURIComponent(pendingCode)}`);
            } else {
                await signInWithGoogle();
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            window.alert(error?.message || 'No se pudo iniciar sesion con Google. Revisa la configuracion de Google OAuth y Cloudflare.');
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here we handle the fake email login/register/forgot flows for UI demonstration
        if (mode === 'forgotPassword') {
            alert(`Si el correo ${email} existe, enviaremos instrucciones de recuperación.`);
            handleSetMode('login');
        } else if (mode === 'register') {
            // Simulamos la validación del código institucional (debe tener más de 4 letras)
            if(classCode.length > 4) {
                setIsCodeValid(true);
            } else {
                alert('Código inválido. Por favor, revisa e intenta de nuevo.');
            }
        } else {
            alert(`Aún no has conectado el inicio con Email/Password. \nUsa "Continuar con Google" para entrar al panel.`);
        }
    };

    // Helper para resetear estados al cambiar de flujos
    const handleSetMode = (newMode) => {
        setMode(newMode);
        if (newMode !== 'register') {
            setIsCodeValid(false);
            setClassCode('');
        }
    };

    const renderHeader = () => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
                <button 
                  type="button"
                  onClick={() => navigate('/')} 
                  style={{ position: 'absolute', left: '-10px', top: '-10px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}
                >
                  <ChevronLeft size={18} /> Volver
                </button>
                <img 
                    src="https://i.postimg.cc/KY1FZC3G/Logo_Nuevo.png" 
                    alt="SaberLab Logo" 
                    style={{ height: '64px', width: 'auto', marginBottom: '1rem', cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                />
                <h1 className="auth-title">
                    {mode === 'login' && 'SaberLab Login'}
                    {mode === 'register' && 'Activación Institucional'}
                    {mode === 'forgotPassword' && 'Recuperar Clave'}
                </h1>
                <p className="auth-subtitle">
                    {mode === 'login' && 'Ingresa tus credenciales para continuar.'}
                    {mode === 'register' && (isCodeValid ? '¡Código validado! Vincula tu perfil rápido y seguro.' : 'Ingresa el código proporcionado por tu profesor.')}
                    {mode === 'forgotPassword' && 'Te enviaremos instrucciones por correo.'}
                </p>
            </div>
        );
    };

    return (
        <div className="auth-wrapper">
            {/* Pantalla de rechazo: aparece si Google login falló sin código */}
            {sessionRejected && (
                <div className="auth-card" style={{ textAlign: 'center', maxWidth: '420px' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔒</div>
                    <h2 style={{ color: '#f87171', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                        Acceso Restringido
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                        Tu correo de Google <strong style={{ color: '#e2e8f0' }}>no está vinculado</strong> a ninguna clase activa en SaberLab.
                        <br /><br />
                        ¿Tienes un <strong style={{ color: '#a855f7' }}>Código Institucional</strong> entregado por tu docente? Úsalo para activar tu acceso.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button 
                            className="auth-button" 
                            onClick={() => { setSessionRejected(false); handleSetMode('register'); }}
                        >
                            🏫 Tengo un Código de Acceso
                        </button>
                        <button 
                            className="auth-button" 
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(148,163,184,0.2)', boxShadow: 'none', color: '#94a3b8' }}
                            onClick={() => { setSessionRejected(false); navigate('/'); }}
                        >
                            ← Volver al Inicio
                        </button>
                    </div>
                </div>
            )}

            {!sessionRejected && (
            <>
            <div className="auth-card">
                {new URLSearchParams(window.location.search).get('reason') === 'inactivity' && (
                    <div style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                        marginBottom: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        color: '#fbbf24',
                        fontSize: '0.85rem',
                        lineHeight: 1.4,
                        textAlign: 'left'
                    }}>
                        <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                        <span>Tu sesión se cerró automáticamente por inactividad (10 minutos) para proteger tu cuenta y tus notas.</span>
                    </div>
                )}
                {renderHeader()}

                {mode === 'register' ? (
                    <>
                        {!isCodeValid ? (
                            <form className="auth-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Código de Acceso Institucional</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder="Ej: SABER-X89J" 
                                        style={{ letterSpacing: '4px', textTransform: 'uppercase', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }} 
                                        required 
                                        value={classCode}
                                        onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <button type="submit" className="auth-button">
                                    Validar Código
                                </button>
                            </form>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '1rem', borderRadius: '12px', color: '#4ade80', textAlign: 'center', fontSize: '0.9rem' }}>
                                    ✓ <strong>{classCode}</strong> aceptado.<br/>
                                </div>
                                <button 
                                    className="auth-google-btn" 
                                    onClick={() => {
                                        localStorage.setItem('saberlab_valid_code', 'true');
                                        handleGoogleLogin();
                                    }} 
                                    disabled={isLoading}
                                    style={{ marginTop: '0.2rem' }}
                                >
                                    <GoogleIcon />
                                    {isLoading ? 'Conectando...' : 'Completar Registro con Google'}
                                </button>
                                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                                    Autenticación cifrada extremo a extremo.
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Botón de Google global SOLO si No es forgotPassword (para Login) */}
                        {mode === 'login' && (
                            <>
                                <button 
                                    className="auth-google-btn" 
                                    onClick={handleGoogleLogin} 
                                    disabled={isLoading}
                                >
                                    <GoogleIcon />
                                    {isLoading ? 'Conectando...' : 'Continuar con Google'}
                                </button>
                                <div className="auth-divider">o iniciar con credenciales</div>
                            </>
                        )}
                        
                        <form className="auth-form" onSubmit={handleSubmit}>
                            {/* Email siempre visible para Login y Recuperar */}
                            <div className="form-group" style={{ position: 'relative' }}>
                                <label className="form-label">Correo Electrónico o Usuario</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder="usuario o tu@email.com" 
                                        style={{ paddingLeft: '36px' }} 
                                        required 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Contraseña sólo para login */}
                            {mode === 'login' && (
                                <div className="form-group">
                                    <div className="form-label">
                                        Contraseña
                                        <button type="button" className="forgot-password-link" onClick={() => handleSetMode('forgotPassword')}>
                                            ¿Olvidaste tu clave?
                                        </button>
                                    </div>
                                    <input type="password" className="form-input" placeholder="••••••••" required />
                                </div>
                            )}

                            <button type="submit" className="auth-button">
                                {mode === 'login' && 'Ingresar al Campus'}
                                {mode === 'forgotPassword' && 'Enviar Correo'}
                            </button>
                        </form>
                    </>
                )}

                {/* Toggles (Ir a Login, Ir a Registro) */}
                <div className="auth-toggle">
                    {mode === 'login' && (
                        <>¿Tienes un código Institucional? <button onClick={() => handleSetMode('register')}>Actívalo aquí</button></>
                    )}
                    {(mode === 'register' || mode === 'forgotPassword') && (
                        <>¿Ya perteneces a una clase? <button onClick={() => handleSetMode('login')}>Inicia Sesión</button></>
                    )}
                </div>
            </div>

            <div className="auth-footer">
                © {new Date().getFullYear()} SaberLab Edu. Todos los derechos reservados.
            </div>
            </>
            )}
        </div>
    );
};

export default Login;
