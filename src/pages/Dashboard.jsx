import { Zap, Bot, ArrowRight, TrendingUp, Clock, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const subjects = [
    { id: 'electronica', name: 'Electricidad y Electrónica Básica', icon: <Zap size={32} />, color: 'var(--accent-blue)', progress: 15 },
    { id: 'robotica', name: 'Robótica Educativa', icon: <Bot size={32} />, color: 'var(--accent-purple)', progress: 5 }
];

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            <div className="welcome-banner glass-panel">
                <div className="banner-content">
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        Bienvenido de nuevo, <span className="text-gradient">Estudiante</span>! 👋
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        ¡Has completado 4 lecciones esta semana. Sigue así!
                    </p>
                </div>
                <div className="banner-stats">
                    <div className="stat-item">
                        <TrendingUp className="text-gradient" size={24} />
                        <div>
                            <div className="stat-value">85%</div>
                            <div className="stat-label">Puntuación Promedio</div>
                        </div>
                    </div>
                    <div className="stat-item">
                        <Clock className="text-gradient" size={24} />
                        <div>
                            <div className="stat-value">12h</div>
                            <div className="stat-label">Tiempo de Estudio</div>
                        </div>
                    </div>
                    <div className="stat-item">
                        <Target className="text-gradient" size={24} />
                        <div>
                            <div className="stat-value">4/5</div>
                            <div className="stat-label">Metas Alcanzadas</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section-header">
                <h2>Tus Cursos</h2>
                <button className="btn" style={{ background: 'rgba(255,255,255,0.05)' }}>Ver Todos</button>
            </div>

            <div className="subjects-grid">
                {subjects.map(subject => (
                    <Link to={`/dashboard/subject/${subject.id}`} key={subject.id} className="subject-card glass-panel">
                        <div className="subject-icon-wrapper" style={{ boxShadow: `0 0 20px ${subject.color}40` }}>
                            <div className="subject-icon" style={{ color: subject.color }}>
                                {subject.icon}
                            </div>
                        </div>
                        <h3>{subject.name}</h3>

                        <div className="progress-container">
                            <div className="progress-header">
                                <span className="progress-label">Progreso</span>
                                <span className="progress-percentage">{subject.progress}%</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div
                                    className="progress-bar-fill"
                                    style={{
                                        width: `${subject.progress}%`,
                                        background: subject.color,
                                        boxShadow: `0 0 10px ${subject.color}80`
                                    }}
                                />
                            </div>
                        </div>

                        <div className="card-footer">
                            <span className="continue-text">Continuar Aprendiendo</span>
                            <ArrowRight size={16} />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
