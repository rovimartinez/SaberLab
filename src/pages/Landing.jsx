import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Rocket, Cpu, Gamepad2, ChevronRight, Key, ArrowRight, Sparkles, BookOpen, Instagram, Zap
} from 'lucide-react';
import '../styles/Landing.css';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="landing-container-light">
            {/* Spline 3D Interactive Background Scene */}
            <div className="landing-spline-bg-wrapper">
                <iframe 
                    src="https://my.spline.design/genkubgreetingrobot-KpUVWUhqRjQeYHGSNgH8UlNa/" 
                    frameBorder="0" 
                    width="100%" 
                    height="100%"
                    className="landing-spline-bg-iframe"
                    title="SaberLab 3D Interactive Background Robot"
                />
            </div>

            {/* Background Light Ambient Glows */}
            <div className="landing-bg-glow-light"></div>
            <div className="landing-grid-bg-light"></div>

            {/* Navigation Header */}
            <header className="landing-header-light">
                <nav className="landing-nav-light">
                    <div className="landing-brand-light" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src="https://i.postimg.cc/KY1FZC3G/Logo_Nuevo.png" alt="SaberLab" />
                        <div className="landing-brand-col-light">
                            <span className="landing-brand-text-light">SaberLab</span>
                            <span className="landing-brand-sub-light">Campus STEAM</span>
                        </div>
                    </div>

                    <div className="landing-nav-actions-light">
                        <button 
                            type="button" 
                            className="btn-join-code-light" 
                            onClick={() => navigate('/join')}
                        >
                            <Key size={15} />
                            <span>Tengo un Código</span>
                        </button>
                        <button 
                            type="button" 
                            className="btn-login-light" 
                            onClick={() => navigate('/login')}
                        >
                            <span>Ingresar</span>
                            <ArrowRight size={15} />
                        </button>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="landing-hero-light">
                <div className="landing-hero-content-light">
                    <div className="landing-badge-light">
                        <Sparkles size={16} color="#6d28d9" />
                        <span>Campus Virtual STEAM</span>
                    </div>
                    
                    <h1 className="landing-title-light">
                        Revoluciona tu Forma de Aprender <br/>
                        <span className="landing-text-gradient-light">Haciendo.</span>
                    </h1>
                    
                    <p className="landing-subtitle-light">
                        SaberLab es el primer campus interactivo donde la teoría se convierte en práctica. Explora disciplinas, completa misiones dinámicas y domina la tecnología desde la práctica pura.
                    </p>
                    
                    {/* Se removió el botón Comenzar Aventura por requerimiento */}
                    
                    <div className="landing-features-light">
                        <div className="feature-item-light">
                            <Gamepad2 size={24} color="#0284c7" />
                            <span>Aprendizaje Gamificado</span>
                        </div>
                        <div className="feature-item-light">
                            <Rocket size={24} color="#7c3aed" />
                            <span>Misiones Interactivas</span>
                        </div>
                        <div className="feature-item-light">
                            <Cpu size={24} color="#059669" />
                            <span>Simuladores en Vivo</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Teleprompter Ticker Bar */}
            <div className="landing-ticker-wrapper">
                <div className="landing-ticker-glow"></div>
                <div className="landing-ticker-content">
                    <div className="ticker-item">
                        <span className="ticker-badge"><Sparkles size={13} /> CAMPUS VIRTUAL</span>
                        <span className="ticker-text">El campus <span className="ticker-word-emphasis">interactivo</span> y <span className="ticker-word-emphasis">gamificado</span> diseñado para los <strong className="ticker-highlight">pioneros tecnológicos del mañana</strong>.</span>
                        <Zap size={16} className="ticker-star" />
                    </div>
                    <div className="ticker-item">
                        <span className="ticker-badge"><Rocket size={13} /> INNOVACIÓN STEAM</span>
                        <span className="ticker-text">El campus <span className="ticker-word-emphasis">interactivo</span> y <span className="ticker-word-emphasis">gamificado</span> diseñado para los <strong className="ticker-highlight">pioneros tecnológicos del mañana</strong>.</span>
                        <Sparkles size={16} className="ticker-star" />
                    </div>
                    <div className="ticker-item">
                        <span className="ticker-badge"><Cpu size={13} /> TECNOLOGÍA EDUCATIVA</span>
                        <span className="ticker-text">El campus <span className="ticker-word-emphasis">interactivo</span> y <span className="ticker-word-emphasis">gamificado</span> diseñado para los <strong className="ticker-highlight">pioneros tecnológicos del mañana</strong>.</span>
                        <Zap size={16} className="ticker-star" />
                    </div>
                    <div className="ticker-item">
                        <span className="ticker-badge"><Sparkles size={13} /> CAMPUS VIRTUAL</span>
                        <span className="ticker-text">El campus <span className="ticker-word-emphasis">interactivo</span> y <span className="ticker-word-emphasis">gamificado</span> diseñado para los <strong className="ticker-highlight">pioneros tecnológicos del mañana</strong>.</span>
                        <Sparkles size={16} className="ticker-star" />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="landing-footer-light">
                <div className="landing-footer-content-light">
                    <div className="footer-brand-light">
                        <div className="landing-brand-light">
                            <img src="https://i.postimg.cc/KY1FZC3G/Logo_Nuevo.png" alt="SaberLab" />
                            <div className="landing-brand-col-light">
                                <span className="landing-brand-text-light">SaberLab</span>
                                <span className="landing-brand-sub-light">Campus STEAM</span>
                            </div>
                        </div>
                    </div>

                    <div className="footer-links-light">
                        <div className="footer-col-light">
                            <h4>Comunidad</h4>
                            <a href="https://instagram.com/semillero_simi3d" target="_blank" rel="noopener noreferrer">
                                <Instagram size={16} color="#e1306c" />
                                <span>Instagram SIMI3D</span>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="landing-footer-bottom-light">
                    <p>© {new Date().getFullYear()} SaberLab Edu. Todos los derechos reservados. | Creado por <a href="https://www.instagram.com/robot.steam/" target="_blank" rel="noopener noreferrer" style={{ color: '#7c3aed', fontWeight: 700, textDecoration: 'none' }}>Ronny Martinez</a></p>
                </div>
            </footer>
        </div>
    );
}
