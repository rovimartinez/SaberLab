import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate a slight delay for aesthetic purposes
        setTimeout(() => {
            navigate('/dashboard');
        }, 800);
    };

    return (
        <div className="login-container">
            <div className="login-card glass-panel">
                <div className="login-header">
                    <div className="login-logo text-gradient" style={{ fontSize: '3rem', fontWeight: 800, textAlign: 'center', marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                        <GraduationCap size={48} />
                        MegaLab
                    </div>
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
                        Plataforma de Estudios
                    </p>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Usuario / Correo</label>
                        <input type="text" placeholder="estudiante@megalab.edu" className="login-input" />
                    </div>
                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label>Contraseña</label>
                        <input type="password" placeholder="••••••••" className="login-input" />
                    </div>

                    <button 
                        type="submit" 
                        className="btn login-btn" 
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '1.1rem', padding: '12px' }}
                    >
                        {isLoading ? 'Conectando...' : 'Entrar a MegaLab'}
                        {!isLoading && <ArrowRight size={20} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
