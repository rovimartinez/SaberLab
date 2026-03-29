import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, PlayCircle, FileText, CheckCircle, Lock } from 'lucide-react';
import './SubjectDetail.css';

const subjectData = {
    electronica: { name: 'Electricidad y Electrónica Básica', color: 'var(--accent-blue)', bg: 'rgba(59, 130, 246, 0.1)' },
    robotica: { name: 'Robótica Educativa', color: 'var(--accent-purple)', bg: 'rgba(168, 85, 247, 0.1)' }
};

const lessons = [
    { id: 1, title: 'Introducción a Conceptos', type: 'video', duration: '12 min', status: 'completed' },
    { id: 2, title: 'Principios Básicos', type: 'reading', duration: '8 min', status: 'completed' },
    { id: 3, title: 'Ejercicios Prácticos', type: 'quiz', duration: '15 min', status: 'current' },
    { id: 4, title: 'Aplicaciones Avanzadas', type: 'video', duration: '20 min', status: 'locked' },
    { id: 5, title: 'Evaluación Final', type: 'quiz', duration: '30 min', status: 'locked' }
];

const getIcon = (type, status) => {
    if (status === 'locked') return <Lock size={20} />;
    if (type === 'video') return <PlayCircle size={20} />;
    if (type === 'reading') return <FileText size={20} />;
    return <CheckCircle size={20} />;
};

const SubjectDetail = () => {
    const { id } = useParams();
    const subject = subjectData[id] || subjectData.electronica;

    return (
        <div className="subject-detail-container animate-fade-in">
            <div className="detail-header" style={{ background: subject.bg, borderBottom: `2px solid ${subject.color}40` }}>
                <Link to="/dashboard" className="back-link">
                    <ArrowLeft size={18} />
                    <span>Volver al Panel Principal</span>
                </Link>
                <h1 style={{ color: subject.color }}>{subject.name}</h1>
                <p className="subject-description">
                    Domina los fundamentos de {subject.name.toLowerCase()} con lecciones interactivas, videos y cuestionarios.
                </p>

                <div className="course-progress">
                    <div className="progress-info">
                        <span>Progreso del Curso</span>
                        <span>40%</span>
                    </div>
                    <div className="progress-bar-bg" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <div className="progress-bar-fill" style={{ width: '40%', background: subject.color, boxShadow: `0 0 10px ${subject.color}80` }} />
                    </div>
                </div>
            </div>

            <div className="course-content">
                <div className="syllabus-section">
                    <h2>Plan de Estudios</h2>
                    <div className="lessons-list">
                        {lessons.map((lesson) => (
                            <div key={lesson.id} className={`lesson-item glass-panel ${lesson.status}`}>
                                <div className={`lesson-icon ${lesson.status}`} style={{ color: lesson.status === 'current' ? subject.color : undefined }}>
                                    {getIcon(lesson.type, lesson.status)}
                                </div>
                                <div className="lesson-info">
                                    <h3>{lesson.title}</h3>
                                    <span className="lesson-meta">{lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)} • {lesson.duration}</span>
                                </div>
                                {lesson.status !== 'locked' ? (
                                    <button className={`btn ${lesson.status === 'completed' ? 'btn-outline' : 'btn-primary'}`} style={lesson.status === 'current' ? { background: subject.color, boxShadow: `0 4px 15px ${subject.color}40` } : {}}>
                                        {lesson.status === 'completed' ? 'Repasar' : 'Iniciar Lección'}
                                    </button>
                                ) : (
                                    <span className="locked-text">Bloqueado</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="course-sidebar">
                    <div className="instructor-card glass-panel">
                        <h3>Tu Instructor</h3>
                        <div className="instructor-profile">
                            <div className="instructor-avatar"></div>
                            <div>
                                <div className="instructor-name">Dr. Sarah Johnson</div>
                                <div className="instructor-title">Educador Senior</div>
                            </div>
                        </div>
                        <div style={{ marginTop: '1.5rem' }}>
                            <button className="btn btn-outline" style={{ width: '100%' }}>Hacer Pregunta</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubjectDetail;
