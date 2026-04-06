import { useNavigate } from 'react-router-dom';
import { Rocket, Cpu, Gamepad2, ChevronRight, Code } from 'lucide-react';
import '../styles/Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Background Elements */}
      <div className="landing-bg-glow"></div>
      <div className="landing-grid-bg"></div>

      {/* Navigation Header */}
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="landing-nav-logo">
             <img src="https://i.postimg.cc/KY1FZC3G/Logo_Nuevo.png" alt="SaberLab" />
             <span className="landing-nav-logo-text">SaberLab</span>
          </div>
          <div className="landing-nav-links">
             <a href="#cursos">Cursos</a>
             <a href="#metodologia">Metodología</a>
             <a href="#comunidad">Comunidad</a>
             <a href="#planes">Planes</a>
          </div>
          <div className="landing-nav-actions">
            <button className="landing-btn-outline" onClick={() => navigate('/login')}>Ingresar</button>
            <button className="landing-nav-login" onClick={() => navigate('/login')}>Únete Gratis</button>
          </div>
        </nav>
      </header>

      {/* Hero Content */}
      <main className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-badge">
            <Rocket size={16} color="#a855f7" />
            <span>Campus Virtual 2.0</span>
          </div>
          <h1 className="landing-title">
            Revoluciona tu Forma de Aprender <br/>
            <span className="landing-text-gradient-primary">Haciendo.</span>
          </h1>
          <p className="landing-subtitle">
            SaberLab es el primer campus interactivo. Explora diferentes disciplinas, completa misiones dinámicas,  
            acumula experiencia y domina las habilidades del futuro desde la práctica pura.
          </p>
          
          <div className="landing-actions">
            <button className="landing-btn-primary" onClick={() => navigate('/login')}>
              Comenzar Aventura <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="landing-features">
            <div className="landing-feature-item">
              <Gamepad2 size={24} className="landing-feature-icon" />
              <span>Aprendizaje Gamificado</span>
            </div>
            <div className="landing-feature-item">
              <Rocket size={24} className="landing-feature-icon" />
              <span>Misiones Interactivas</span>
            </div>
            <div className="landing-feature-item">
              <Cpu size={24} className="landing-feature-icon" />
              <span>Laboratorios y Simuladores</span>
            </div>
          </div>
        </div>

        {/* Floating Code Visual */}
        <div className="landing-visual">
          <div className="landing-floating-card">
            <div className="landing-card-header">
              <div className="landing-mac-dots">
                <span className="landing-dot red"></span>
                <span className="landing-dot yellow"></span>
                <span className="landing-dot green"></span>
              </div>
              <span className="landing-card-title">mision_uno.cpp</span>
            </div>
            <div className="landing-card-body">
              <pre>
                <code>
<span style={{color: '#c678dd'}}>void</span> <span style={{color: '#61afef'}}>setup</span>() {'{'}
  <br/>&nbsp;&nbsp;<span style={{color: '#56b6c2'}}>pinMode</span>(13, <span style={{color: '#d19a66'}}>OUTPUT</span>);
  <br/>{'}'}
<br/><br/>
<span style={{color: '#c678dd'}}>void</span> <span style={{color: '#61afef'}}>loop</span>() {'{'}
  <br/>&nbsp;&nbsp;<span style={{color: '#56b6c2'}}>digitalWrite</span>(13, <span style={{color: '#d19a66'}}>HIGH</span>);
  <br/>&nbsp;&nbsp;<span style={{color: '#56b6c2'}}>delay</span>(1000);
  <br/>&nbsp;&nbsp;<span style={{color: '#56b6c2'}}>digitalWrite</span>(13, <span style={{color: '#d19a66'}}>LOW</span>);
  <br/>&nbsp;&nbsp;<span style={{color: '#56b6c2'}}>delay</span>(1000);
  <br/>{'}'}
                </code>
              </pre>
            </div>
          </div>
          <div className="landing-glow-orb"></div>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-content">
          <div className="footer-brand">
            <img src="https://i.postimg.cc/KY1FZC3G/Logo_Nuevo.png" alt="SaberLab Logo" />
            <p>El campus interactivo y gamificado diseñado para los pioneros tecnológicos del mañana.</p>
          </div>
          <div className="footer-links">
             <div className="footer-col">
               <h4>Plataforma</h4>
               <a href="#catalogo">Catálogo de Cursos</a>
               <a href="#simuladores">Simuladores 3D</a>
               <a href="#misiones">Sistema de Misiones</a>
             </div>
             <div className="footer-col">
               <h4>Comunidad</h4>
               <a href="#discord">Servidor de Discord</a>
               <a href="#foros">Foros de Apoyo</a>
               <a href="#blog">Blog de Estudiantes</a>
             </div>
             <div className="footer-col">
               <h4>Soporte</h4>
               <a href="#terminos">Términos de Uso</a>
               <a href="#privacidad">Privacidad</a>
               <a href="#contacto">Contacto</a>
             </div>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <p>© {new Date().getFullYear()} SaberLab Edu. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
