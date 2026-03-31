import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { Mail, GraduationCap } from 'lucide-react';
import { usePlatformSettings } from '../hooks/usePlatformSettings';
import './Login.css';

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
    const { user, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    // Catálogos dinámicos
    const { institutions, specialties } = usePlatformSettings();

    // Form State (Not linked to backend yet for email, only doing Google auth)
    const [email, setEmail] = useState('');

    // Redirigir si ya está autenticado (protección extra)
    if (user) {
        navigate('/dashboard');
    }

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here we handle the fake email login/register/forgot flows for UI demonstration
        if (mode === 'forgotPassword') {
            alert(`Si el correo ${email} existe, enviaremos instrucciones de recuperación.`);
            setMode('login');
        } else {
            alert(`Aún no has conectado el Auth de Email/Password a Supabase. \nUsa "Continuar con Google" para entrar al panel.`);
        }
    };

    const renderHeader = () => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                <img 
                    src="https://i.postimg.cc/KY1FZC3G/Logo_Nuevo.png" 
                    alt="SaberLab Logo" 
                    style={{ height: '64px', width: 'auto', marginBottom: '1rem' }}
                />
                <h1 className="auth-title">
                    {mode === 'login' && 'SaberLab Login'}
                    {mode === 'register' && 'Crear Cuenta'}
                    {mode === 'forgotPassword' && 'Recuperar Clave'}
                </h1>
                <p className="auth-subtitle">
                    {mode === 'login' && 'Ingresa tus credenciales para continuar.'}
                    {mode === 'register' && 'Únete a la plataforma de aprendizaje integral.'}
                    {mode === 'forgotPassword' && 'Te enviaremos un correo para cambiarla.'}
                </p>
            </div>
        );
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                {renderHeader()}

                {/* Mostrar botón de Google si NO estamos en Recuperar Contraseña */}
                {mode !== 'forgotPassword' && (
                    <>
                        <button 
                            className="auth-google-btn" 
                            onClick={handleGoogleLogin} 
                            disabled={isLoading}
                        >
                            <GoogleIcon />
                            {isLoading ? 'Conectando...' : 'Continuar con Google'}
                        </button>
                        <div className="auth-divider">o continuar con correo</div>
                    </>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {/* Fila de Nombre si es registro */}
                    {mode === 'register' && (
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Nombre</label>
                                <input type="text" className="form-input" placeholder="Tu Nombre" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Apellido</label>
                                <input type="text" className="form-input" placeholder="Tu Apellido" required />
                            </div>
                        </div>
                    )}

                    {/* Email siempre visible */}
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label className="form-label">Correo Electrónico</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input 
                                type="email" 
                                className="form-input" 
                                placeholder="tu@email.com" 
                                style={{ paddingLeft: '36px' }} 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Mostrar selector en Registro */}
                    {mode === 'register' && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Institución Educativa</label>
                                <select className="form-select" required defaultValue="">
                                    <option value="" disabled>Selecciona tu institución</option>
                                    {institutions.map(inst => (
                                        <option key={inst} value={inst}>{inst}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Grado o Especialidad</label>
                                <select className="form-select" required defaultValue="">
                                    <option value="" disabled>Selecciona tu nivel</option>
                                    {specialties.map(spec => (
                                        <option key={spec} value={spec}>{spec}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* Contraseñas si NO es forgotPassword */}
                    {mode !== 'forgotPassword' && (
                        <div className="form-group">
                            <div className="form-label">
                                Contraseña
                                {mode === 'login' && (
                                    <button type="button" className="forgot-password-link" onClick={() => setMode('forgotPassword')}>
                                        ¿Olvidaste tu clave?
                                    </button>
                                )}
                            </div>
                            <input type="password" className="form-input" placeholder="••••••••" required />
                        </div>
                    )}

                    {mode === 'register' && (
                        <div className="form-group">
                            <label className="form-label">Confirmar Contraseña</label>
                            <input type="password" className="form-input" placeholder="••••••••" required />
                        </div>
                    )}

                    <button type="submit" className="auth-button">
                        {mode === 'login' && 'Ingresar al Campus'}
                        {mode === 'register' && 'Crear Cuenta'}
                        {mode === 'forgotPassword' && 'Enviar Correo de Recuperación'}
                    </button>
                </form>

                {/* Toggles (Ir a Login, Ir a Registro) */}
                <div className="auth-toggle">
                    {mode === 'login' && (
                        <>¿No tienes una cuenta de correo? <button onClick={() => setMode('register')}>Regístrate</button></>
                    )}
                    {(mode === 'register' || mode === 'forgotPassword') && (
                        <>¿Ya te acordaste de tu contraseña? <button onClick={() => setMode('login')}>Inicia Sesión</button></>
                    )}
                </div>
            </div>

            <div className="auth-footer">
                © {new Date().getFullYear()} SaberLab Edu. Todos los derechos reservados.
            </div>
        </div>
    );
};

export default Login;
