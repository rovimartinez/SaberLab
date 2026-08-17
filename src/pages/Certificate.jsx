import { useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Award, GraduationCap, Share2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { COURSES_DEFINITION } from '../data/coursesData.jsx';
import '../styles/Certificate.css';

// Genera el QR como imagen usando la API de qrserver (sin dependencias extra)
function QRImage({ value, size = 64 }) {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&color=1e293b&bgcolor=ffffff`;
    return (
        <div className="certificate-qr-box">
            <img src={url} alt="QR de verificación" />
        </div>
    );
}

// Mapa de cursos con info del certificado
const COURSE_CERT_INFO = {
    're': { title: 'Robótica Educativa', hours: 40, level: 'Intermedio' },
    'robotica-educativa': { title: 'Robótica Educativa', hours: 40, level: 'Intermedio' },
    'electricidad-basica': { title: 'Electricidad Básica', hours: 30, level: 'Principiante' },
    'electronica-fundamental': { title: 'Electrónica Fundamental', hours: 60, level: 'Avanzado' },
};

function getCourseInfo(courseId) {
    if (!courseId) return null;
    const key = courseId.toLowerCase();
    if (COURSE_CERT_INFO[key]) return COURSE_CERT_INFO[key];
    // Intentar desde COURSES_DEFINITION
    const def = COURSES_DEFINITION.find(
        c => c.id === courseId || c.slug === courseId || c.abbr?.toLowerCase() === key
    );
    if (def) return { title: def.name, hours: def.hours || 40, level: def.level || 'Principiante' };
    return null;
}

export default function Certificate() {
    const { courseId } = useParams();
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const course = getCourseInfo(courseId);

    const completionDate = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const credentialId = user
        ? `SL-${user.id.substring(0, 8).toUpperCase()}-${(courseId || '').substring(0, 4).toUpperCase()}`
        : 'SL-XXXXXXXX-XXXX';

    const verificationUrl = `https://saberlab.pages.dev/verify/${credentialId}`;

    const studentName = (() => {
        const meta = user?.user_metadata || {};
        return meta.name || meta.full_name || user?.email?.split('@')[0] || 'Estudiante';
    })();

    if (loading) {
        return (
            <div className="certificate-page">
                <div className="certificate-loading">Cargando certificado...</div>
            </div>
        );
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    if (!course) {
        return (
            <div className="certificate-page">
                <div className="certificate-not-found">
                    <Award size={64} style={{ opacity: 0.3, marginBottom: '1rem' }} color="white" />
                    <h2 style={{ color: 'white' }}>Curso no encontrado</h2>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>El certificado para "{courseId}" no está disponible.</p>
                    <Link to="/dashboard" className="certificate-back-btn" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
                        <ArrowLeft size={16} /> Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="certificate-page">
            {/* Controles (se ocultan al imprimir) */}
            <div className="certificate-controls">
                <Link to="/dashboard" className="certificate-back-btn">
                    <ArrowLeft size={16} />
                    Volver al Dashboard
                </Link>
                <button
                    className="certificate-download-btn"
                    onClick={() => window.print()}
                >
                    <Download size={16} />
                    Descargar como PDF
                </button>
            </div>

            {/* Diploma */}
            <div className="certificate-wrapper">
                <div className="certificate-diploma" id="certificate">
                    <div className="certificate-bg" />
                    <div className="certificate-frame" />

                    <div className="certificate-content">
                        {/* Header */}
                        <div className="certificate-header">
                            <div className="certificate-logo">
                                <GraduationCap size={32} color="white" />
                            </div>
                            <h1 className="certificate-org-name">SaberLab</h1>
                            <p className="certificate-org-subtitle">Plataforma de Aprendizaje</p>
                        </div>

                        {/* Divider */}
                        <div className="certificate-divider">
                            <div className="certificate-divider-diamond" />
                        </div>

                        {/* Cuerpo */}
                        <div className="certificate-body">
                            <p className="certificate-presents">Certifica que</p>

                            <h2 className="certificate-student-name">{studentName}</h2>

                            <p className="certificate-certifies">
                                ha completado satisfactoriamente el curso de
                            </p>

                            <p className="certificate-course-name">{course.title}</p>
                            <p className="certificate-course-hours">Duración: {course.hours} horas</p>

                            <div className="certificate-badges">
                                <span className="certificate-badge certificate-badge-level">{course.level}</span>
                                <span className="certificate-badge certificate-badge-year">{new Date().getFullYear()}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="certificate-footer">
                            {/* Firma */}
                            <div className="certificate-footer-col">
                                <span className="certificate-signature-name">Ronny Martinez</span>
                                <div className="certificate-signature-line" />
                                <span className="certificate-signature-role">Instructor y Fundador</span>
                            </div>

                            {/* Fecha */}
                            <div className="certificate-footer-col">
                                <span className="certificate-date-value">{completionDate}</span>
                                <div className="certificate-signature-line" />
                                <span className="certificate-date-label">Fecha de Emisión</span>
                            </div>

                            {/* QR */}
                            <div className="certificate-qr-col">
                                <QRImage value={verificationUrl} size={80} />
                                <span className="certificate-credential-id">{credentialId}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acciones extra debajo del diploma */}
                <div className="certificate-actions">
                    <button
                        className="certificate-action-btn primary"
                        onClick={() => window.print()}
                    >
                        <Download size={16} />
                        Guardar como PDF
                    </button>
                    <button
                        className="certificate-action-btn secondary"
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: `Certificado ${course.title} — SaberLab`,
                                    text: `Completé el curso "${course.title}" en SaberLab`,
                                    url: window.location.href,
                                }).catch(() => {});
                            } else {
                                navigator.clipboard.writeText(window.location.href).catch(() => {});
                                alert('Enlace copiado al portapapeles');
                            }
                        }}
                    >
                        <Share2 size={16} />
                        Compartir
                    </button>
                </div>
            </div>
        </div>
    );
}
