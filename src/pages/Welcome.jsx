import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';
import '../styles/Welcome.css';

const COUNTRIES = ['Argentina', 'Bolivia', 'Chile', 'Colombia', 'Costa Rica', 'Cuba', 'Ecuador',
    'El Salvador', 'España', 'Guatemala', 'Honduras', 'México', 'Nicaragua', 'Panamá', 'Paraguay',
    'Perú', 'Puerto Rico', 'República Dominicana', 'Uruguay', 'Venezuela', 'Otro'];

const ROLES = [
    { id: 'student',      label: 'Estudiante',   emoji: '🎓', desc: 'Aprendiendo en colegio o universidad' },
    { id: 'teacher',      label: 'Docente',       emoji: '📖', desc: 'Enseño a otros' },
    { id: 'professional', label: 'Profesional',   emoji: '💼', desc: 'Trabajo en el área' },
    { id: 'hobbyist',     label: 'Aficionado',    emoji: '🔬', desc: 'Lo hago por pasión' },
];

const THEMES = [
    { id: 'dark',  label: 'Oscuro', emoji: '🌙', desc: 'Ideal para largas sesiones' },
    { id: 'light', label: 'Claro',  emoji: '☀️', desc: 'Más fácil de leer a plena luz' },
];

export default function Welcome() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [step, setStep] = useState(1); // 1=tema, 2=país, 3=rol
    const [theme, setTheme]   = useState('dark');
    const [country, setCountry] = useState('');
    const [role, setRole]       = useState('');
    const [saving, setSaving]   = useState(false);

    const totalSteps = 3;

    const handleFinish = async () => {
        if (!country || !role) return;
        setSaving(true);

        // Aplicar tema
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        try {
            await api('/profile', {
                method: 'PATCH',
                body: { country, role },
            });
        } catch {
            // Si falla el update no bloqueamos la navegación
        }

        navigate('/dashboard', { replace: true });
    };

    const name = user?.user_metadata?.name?.split(' ')[0]
        || user?.user_metadata?.full_name?.split(' ')[0]
        || 'Estudiante';

    return (
        <div className="welcome-page">
            {/* Fondo decorativo */}
            <div className="welcome-bg" />

            <div className="welcome-card">
                {/* Logo */}
                <div className="welcome-logo">
                    <GraduationCap size={32} color="white" />
                </div>

                {/* Barra de progreso de pasos */}
                <div className="welcome-steps">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div key={i} className={`welcome-step-dot ${i + 1 <= step ? 'active' : ''}`} />
                    ))}
                </div>

                {/* Paso 1: Tema */}
                {step === 1 && (
                    <div className="welcome-step">
                        <h1 className="welcome-title">¡Bienvenido, {name}! 👋</h1>
                        <p className="welcome-subtitle">Personaliza tu experiencia en SaberLab</p>
                        <p className="welcome-question">¿Qué tema prefieres?</p>
                        <div className="welcome-options">
                            {THEMES.map(t => (
                                <button
                                    key={t.id}
                                    className={`welcome-option ${theme === t.id ? 'selected' : ''}`}
                                    onClick={() => setTheme(t.id)}
                                >
                                    <span className="welcome-option-emoji">{t.emoji}</span>
                                    <span className="welcome-option-label">{t.label}</span>
                                    <span className="welcome-option-desc">{t.desc}</span>
                                    {theme === t.id && <CheckCircle size={18} className="welcome-check" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Paso 2: País */}
                {step === 2 && (
                    <div className="welcome-step">
                        <h1 className="welcome-title">¿Desde dónde nos acompañas?</h1>
                        <p className="welcome-subtitle">Esto nos ayuda a personalizar el contenido</p>
                        <select
                            className="welcome-select"
                            value={country}
                            onChange={e => setCountry(e.target.value)}
                        >
                            <option value="">— Selecciona tu país —</option>
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                )}

                {/* Paso 3: Rol */}
                {step === 3 && (
                    <div className="welcome-step">
                        <h1 className="welcome-title">¿Cómo te describes?</h1>
                        <p className="welcome-subtitle">Cuéntanos más sobre ti</p>
                        <div className="welcome-options">
                            {ROLES.map(r => (
                                <button
                                    key={r.id}
                                    className={`welcome-option ${role === r.id ? 'selected' : ''}`}
                                    onClick={() => setRole(r.id)}
                                >
                                    <span className="welcome-option-emoji">{r.emoji}</span>
                                    <span className="welcome-option-label">{r.label}</span>
                                    <span className="welcome-option-desc">{r.desc}</span>
                                    {role === r.id && <CheckCircle size={18} className="welcome-check" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Botón de navegación */}
                <div className="welcome-nav">
                    {step > 1 && (
                        <button className="welcome-btn-back" onClick={() => setStep(prev => prev - 1)}>
                            Atrás
                        </button>
                    )}

                    {step < totalSteps ? (
                        <button
                            className="welcome-btn-next"
                            onClick={() => setStep(prev => prev + 1)}
                            disabled={step === 2 && !country}
                        >
                            Siguiente <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            className="welcome-btn-next"
                            onClick={handleFinish}
                            disabled={!country || !role || saving}
                        >
                            {saving ? 'Guardando...' : '¡Empezar a Aprender!'}
                        </button>
                    )}
                </div>

                <button
                    className="welcome-skip"
                    onClick={() => navigate('/dashboard', { replace: true })}
                >
                    Omitir configuración
                </button>
            </div>
        </div>
    );
}
