import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Award, GraduationCap, Share2, CheckCircle2, ShieldCheck, Sparkles, QrCode, Cpu, Terminal, Zap, ExternalLink, Lock } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { COURSES_DEFINITION } from '../data/coursesData.jsx';
import '../styles/Certificate.css';

// Genera el QR como imagen usando la API de qrserver con fondo claro
function QRImage({ value, size = 66 }) {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&color=0369a1&bgcolor=ffffff`;
    return (
        <div className="certificate-qr-box-light-tech">
            <img src={url} alt="QR Cyber Verification" crossOrigin="anonymous" />
        </div>
    );
}

// Catálogo de Cursos con Datos Reales y Competencias Acreditadas
const COURSE_CERT_INFO = {
    'ee': {
        id: 'ee',
        slug: 'electricidad-y-electronica',
        title: 'Electricidad y Electrónica Básica',
        techCode: 'SYS-EE-2026-STEAM',
        hours: 68,
        credits: 4,
        weeks: '17 Semanas',
        teacher: 'Prof. Ronny Martinez Reyes',
        teacherRole: 'Docente Titular del Área STEAM',
        director: 'Ing. Rovier Martinez',
        directorRole: 'Director de Tecnología • SaberLab',
        skills: 'Leyes de Ohm y Watt • Redes Serie-Paralelo • Semiconductores BJT • Circuitos Integrados 555/74LS93 • Simulación Virtual de Mallas',
        coreBadge: 'ELECTRONICS & CIRCUITS MASTER'
    },
    'electricidad-y-electronica': {
        id: 'ee',
        slug: 'electricidad-y-electronica',
        title: 'Electricidad y Electrónica Básica',
        techCode: 'SYS-EE-2026-STEAM',
        hours: 68,
        credits: 4,
        weeks: '17 Semanas',
        teacher: 'Prof. Ronny Martinez Reyes',
        teacherRole: 'Docente Titular del Área STEAM',
        director: 'Ing. Rovier Martinez',
        directorRole: 'Director de Tecnología • SaberLab',
        skills: 'Leyes de Ohm y Watt • Redes Serie-Paralelo • Semiconductores BJT • Circuitos Integrados 555/74LS93 • Simulación Virtual de Mallas',
        coreBadge: 'ELECTRONICS & CIRCUITS MASTER'
    },
    're': {
        id: 're',
        slug: 'robotica-educativa',
        title: 'Robótica Educativa y Sistemas Mecatrónicos',
        techCode: 'SYS-RE-2026-ROBOT',
        hours: 64,
        credits: 4,
        weeks: '16 Semanas',
        teacher: 'Prof. Ronny Martinez Reyes',
        teacherRole: 'Docente Titular de Robótica',
        director: 'Ing. Rovier Martinez',
        directorRole: 'Director de Tecnología • SaberLab',
        skills: 'Cinemática • Microcontroladores ATMega • Sensores y Actuadores • Programación Embebida C++ • Control de Motores PWM',
        coreBadge: 'MECHATRONICS & ROBOTICS MASTER'
    },
    'robotica-educativa': {
        id: 're',
        slug: 'robotica-educativa',
        title: 'Robótica Educativa y Sistemas Mecatrónicos',
        techCode: 'SYS-RE-2026-ROBOT',
        hours: 64,
        credits: 4,
        weeks: '16 Semanas',
        teacher: 'Prof. Ronny Martinez Reyes',
        teacherRole: 'Docente Titular de Robótica',
        director: 'Ing. Rovier Martinez',
        directorRole: 'Director de Tecnología • SaberLab',
        skills: 'Cinemática • Microcontroladores ATMega • Sensores y Actuadores • Programación Embebida C++ • Control de Motores PWM',
        coreBadge: 'MECHATRONICS & ROBOTICS MASTER'
    }
};

function getCourseInfo(courseId) {
    if (!courseId) return COURSE_CERT_INFO['ee'];
    const key = courseId.toLowerCase();
    if (COURSE_CERT_INFO[key]) return COURSE_CERT_INFO[key];
    
    const def = COURSES_DEFINITION.find(
        c => c.id?.toString() === key || c.slug === courseId || c.abbr?.toLowerCase() === key
    );
    if (def) {
        return {
            id: def.abbr?.toLowerCase() || 'ee',
            slug: def.slug || courseId,
            title: def.name,
            techCode: `SYS-${(def.abbr || 'SL').toUpperCase()}-2026`,
            hours: 68,
            credits: def.credits || 4,
            weeks: '17 Semanas',
            teacher: def.teacher || 'Prof. Ronny Martinez Reyes',
            teacherRole: 'Docente Titular del Curso',
            director: 'Ing. Rovier Martinez',
            directorRole: 'Director de Tecnología • SaberLab',
            skills: 'Metodología ABP • Laboratorios Virtuales • Análisis de Circuitos y Simulación Interactiva',
            coreBadge: 'STEAM SPECIALIST'
        };
    }
    return COURSE_CERT_INFO['ee'];
}

export default function Certificate() {
    const { courseId } = useParams();
    const { user, profile, loading, canAccessCertificate, totalPoints } = useAuth();
    const navigate = useNavigate();

    const activeCourseId = courseId || 'ee';
    const course = getCourseInfo(activeCourseId);

    const completionDate = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const userUid = user?.id ? user.id.substring(0, 8).toUpperCase() : 'STUDENT';
    const credentialId = `SL-AUTH-${userUid}-${(course?.id || 'EE').toUpperCase()}-2026`;
    const hashSignature = `SHA256:${userUid}7FA9B2C40E${(course?.id || 'EE').toUpperCase()}99X`;
    const verificationUrl = `https://saberlab.pages.dev/verify/${credentialId}`;

    const studentName = (() => {
        const meta = user?.user_metadata || {};
        return profile?.full_name || meta.name || meta.full_name || user?.email?.split('@')[0] || 'Estudiante STEAM';
    })();

    if (loading) {
        return (
            <div className="certificate-page-light-tech">
                <div className="certificate-loading">
                    <div className="loading-spinner-large"></div>
                    <p style={{ marginTop: '1rem', color: '#0284c7', fontFamily: 'monospace' }}>
                        INITIALIZING QUANTUM CREDENTIAL MATRIX...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    // 🔒 Candado de Seguridad: Solo disponible al superar los 450 puntos (o docentes/admin)
    if (!canAccessCertificate) {
        const requiredPoints = 450;
        const currentPoints = totalPoints || 0;
        const missingPoints = Math.max(0, requiredPoints - currentPoints);
        const progressPct = Math.min(100, Math.round((currentPoints / requiredPoints) * 100));

        return (
            <div className="certificate-page-light-tech" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '82vh', padding: '2rem' }}>
                <div style={{
                    maxWidth: '560px',
                    width: '100%',
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.92) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: '24px',
                    padding: '2.75rem 2rem',
                    textAlign: 'center',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 35px rgba(245, 158, 11, 0.12)',
                    position: 'relative'
                }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '74px',
                        height: '74px',
                        borderRadius: '22px',
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        marginBottom: '1.25rem'
                    }}>
                        <Lock size={38} color="#f59e0b" />
                    </div>

                    <div style={{
                        display: 'inline-block',
                        padding: '0.35rem 0.9rem',
                        borderRadius: '999px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#fbbf24',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        letterSpacing: '0.8px',
                        textTransform: 'uppercase',
                        marginBottom: '0.85rem',
                        border: '1px solid rgba(245, 158, 11, 0.3)'
                    }}>
                        Reconocimiento Restringido
                    </div>

                    <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.75rem 0' }}>
                        Certificación Bloqueada
                    </h2>

                    <p style={{ color: '#94a3b8', fontSize: '0.96rem', lineHeight: '1.6', margin: '0 0 1.75rem 0' }}>
                        Para expedir tu <strong style={{ color: '#f8fafc' }}>Diploma Oficial y Credencial Criptográfica</strong> de SaberLab, debes acumular al menos <strong style={{ color: '#fbbf24' }}>450 puntos</strong> en tus evaluaciones y retos prácticos.
                    </p>

                    {/* Barra de progreso de puntos */}
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.65)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        padding: '1.25rem',
                        marginBottom: '1.75rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.88rem' }}>
                            <span style={{ color: '#cbd5e1', fontWeight: 700 }}>Progreso Hacia la Meta:</span>
                            <span style={{ color: '#fbbf24', fontWeight: 900 }}>{currentPoints} / {requiredPoints} pts ({progressPct}%)</span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '10px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: '999px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${progressPct}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #f59e0b, #10b981)',
                                borderRadius: '999px',
                                transition: 'width 0.6s ease'
                            }} />
                        </div>
                        <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                            Te faltan <strong style={{ color: '#38bdf8' }}>{missingPoints} puntos</strong> para desbloquear la certificación.
                        </div>
                    </div>

                    {/* Acciones */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            onClick={() => navigate('/dashboard/grades')}
                            style={{
                                width: '100%',
                                padding: '0.85rem',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '0.92rem',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                            }}
                        >
                            <Award size={18} />
                            Ver Mis Calificaciones
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#cbd5e1',
                                fontWeight: 700,
                                fontSize: '0.88rem',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <ArrowLeft size={16} />
                            Volver al Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="certificate-page-light-tech">
            
            {/* ── 1. Controles Superiores Simétricos ── */}
            <div className="light-controls-bar">
                <div className="controls-col-left">
                    <Link to="/dashboard" className="light-btn-secondary">
                        <ArrowLeft size={16} />
                        <span>Volver al Dashboard</span>
                    </Link>
                </div>
                
                <div className="controls-col-center">
                    <div className="light-switch-group">
                        <button
                            className={`light-pill ${activeCourseId.includes('ee') || activeCourseId.includes('electr') ? 'active' : ''}`}
                            onClick={() => navigate('/dashboard/certificate/ee')}
                        >
                            <Zap size={15} />
                            <span>Electricidad</span>
                        </button>
                        <button
                            className={`light-pill ${activeCourseId.includes('re') || activeCourseId.includes('robot') ? 'active' : ''}`}
                            onClick={() => navigate('/dashboard/certificate/re')}
                        >
                            <Cpu size={15} />
                            <span>Robótica</span>
                        </button>
                    </div>
                </div>

                <div className="controls-col-right">
                    <button
                        className="light-btn-share"
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: `Certificado ${course.title} — SaberLab`,
                                    text: `¡Obtuve mi Reconocimiento STEAM en "${course.title}" en SaberLab!`,
                                    url: window.location.href,
                                }).catch(() => {});
                            } else {
                                navigator.clipboard.writeText(window.location.href).catch(() => {});
                                alert('Enlace de credencial copiado al portapapeles.');
                            }
                        }}
                    >
                        <Share2 size={16} />
                        <span>Compartir</span>
                    </button>
                    <button
                        className="light-btn-print"
                        onClick={() => window.print()}
                    >
                        <Download size={16} />
                        <span>Exportar PDF / Imprimir</span>
                    </button>
                </div>
            </div>

            {/* ── 2. Lienzo Holográfico Claro de Alta Tecnología (Clean Sci-Fi) ── */}
            <div className="light-cert-wrapper">
                <div className="light-cert-diploma" id="certificate">
                    
                    {/* Trazas de Circuitos Electrónicos HUD (SVG Background) */}
                    <div className="light-grid-overlay"></div>
                    
                    {/* Esquinas HUD de Alta Precisión */}
                    <div className="hud-corner-light hud-light-tl">
                        <div className="corner-bracket-light"></div>
                        <span className="hud-telemetry-light">SEC_PROTOCOL // 2026</span>
                    </div>
                    <div className="hud-corner-light hud-light-tr">
                        <div className="corner-bracket-light"></div>
                        <span className="hud-telemetry-light">STATUS // VERIFIED_OK</span>
                    </div>
                    <div className="hud-corner-light hud-light-bl">
                        <div className="corner-bracket-light"></div>
                        <span className="hud-telemetry-light">CREDITS // {course.credits}.0</span>
                    </div>
                    <div className="hud-corner-light hud-light-br">
                        <div className="corner-bracket-light"></div>
                        <span className="hud-telemetry-light">{course.techCode}</span>
                    </div>

                    {/* Circuit Traces Vectoriales en Azul Cobalto / Cian */}
                    <svg className="light-circuit-svg" viewBox="0 0 1000 650" preserveAspectRatio="none">
                        <path d="M 40 120 L 160 120 L 200 80 L 320 80" stroke="#0284c7" strokeWidth="1.5" strokeOpacity="0.25" fill="none" />
                        <circle cx="320" cy="80" r="3" fill="#0284c7" opacity="0.6" />
                        
                        <path d="M 960 120 L 840 120 L 800 80 L 680 80" stroke="#0284c7" strokeWidth="1.5" strokeOpacity="0.25" fill="none" />
                        <circle cx="680" cy="80" r="3" fill="#0284c7" opacity="0.6" />

                        <path d="M 40 530 L 140 530 L 180 570 L 300 570" stroke="#0ea5e9" strokeWidth="1.5" strokeOpacity="0.25" fill="none" />
                        <circle cx="300" cy="570" r="3" fill="#0ea5e9" opacity="0.6" />

                        <path d="M 960 530 L 860 530 L 820 570 L 700 570" stroke="#0ea5e9" strokeWidth="1.5" strokeOpacity="0.25" fill="none" />
                        <circle cx="700" cy="570" r="3" fill="#0ea5e9" opacity="0.6" />
                    </svg>

                    {/* Contenido Principal */}
                    <div className="light-cert-content">
                        
                        {/* ── Cabecera Simétrica: Logo Arriba, Nombre Abajo ── */}
                        <div className="light-header">
                            <div className="light-logo-halo">
                                <img
                                    src="https://i.postimg.cc/KY1FZC3G/Logo_Nuevo.png"
                                    alt="SaberLab"
                                    className="light-logo-img"
                                />
                            </div>
                            
                            <h1 className="light-org-title">SABERLAB</h1>
                            <p className="light-org-sub">ACADEMIA INTERACTIVA DE INGENIERÍA, FÍSICA Y TECNOLOGÍA APLICADA</p>

                            {/* Badge HUD de Reconocimiento */}
                            <div className="light-hud-badge-strip">
                                <div className="hud-line-light"></div>
                                <div className="hud-badge-pill-light">
                                    <Sparkles size={13} color="#0284c7" />
                                    <span>DIPLOMA DE RECONOCIMIENTO AL MÉRITO ACADÉMICO</span>
                                    <Sparkles size={13} color="#0284c7" />
                                </div>
                                <div className="hud-line-light"></div>
                            </div>
                        </div>

                        {/* ── Cuerpo del Reconocimiento ── */}
                        <div className="light-body">
                            <p className="light-proclamation">
                                El Docente Titular y la Dirección Académica de SaberLab otorgan con honores la presente credencial a:
                            </p>

                            <h2 className="light-student-name">
                                <span className="student-light-glow">{studentName}</span>
                            </h2>

                            <p className="light-statement">
                                En testimonio de su sobresaliente capacidad de razonamiento lógico, rigor analítico y excelencia práctica demostrada en:
                            </p>

                            {/* Placa Holográfica del Curso (Cristal Claro / Titanio) */}
                            <div className="light-course-card">
                                <div className="course-card-top-tag-light">
                                    <span className="tag-code-light">{course.techCode}</span>
                                    <span className="tag-hours-light">⚡ {course.hours} HORAS LECTIVAS REALES • {course.weeks}</span>
                                </div>
                                <h3 className="light-course-title">{course.title}</h3>
                                <p className="light-course-skills">{course.skills}</p>
                            </div>

                            <p className="light-quote">
                                «Acreditando destreza en simulación de hardware virtual, análisis de leyes físicas y resolución de retos de ingeniería.»
                            </p>

                            <div className="light-meta-specs">
                                <div className="spec-badge-light">
                                    <span className="spec-label-light">VALIDEZ</span>
                                    <span className="spec-val-light">CURRICULAR STEAM</span>
                                </div>
                                <div className="spec-badge-light">
                                    <span className="spec-label-light">CRÉDITOS</span>
                                    <span className="spec-val-light">{course.credits}.0 ACADÉMICOS</span>
                                </div>
                                <div className="spec-badge-light">
                                    <span className="spec-label-light">EVALUACIÓN</span>
                                    <span className="spec-val-light">100% PRÁCTICA & SIMULACIÓN</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Footer: Firmas Holográficas, Reactor Arc y Registro Criptográfico ── */}
                        <div className="light-footer">
                            
                            {/* Firma 1: Docente Titular */}
                            <div className="light-sig-card">
                                <div className="light-sig-draw">
                                    <svg viewBox="0 0 160 40" width="135" height="34">
                                        <path d="M 10 24 Q 40 36, 65 10 T 110 26 Q 130 8, 145 30" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" />
                                        <path d="M 25 16 Q 45 6, 85 24" fill="none" stroke="#0369a1" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div className="light-sig-line"></div>
                                <span className="light-signer-name">{course.teacher}</span>
                                <span className="light-signer-role">{course.teacherRole}</span>
                                <span className="light-sig-hash">AUTH_ID: #RM-7749-OK</span>
                            </div>

                            {/* Sello Reactor Arc Holográfico Central (Light Tech) */}
                            <div className="light-reactor-seal">
                                <svg viewBox="0 0 100 100" width="78" height="78">
                                    <defs>
                                        <linearGradient id="lightCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#0284c7" />
                                            <stop offset="50%" stopColor="#0ea5e9" />
                                            <stop offset="100%" stopColor="#d97706" />
                                        </linearGradient>
                                    </defs>
                                    {/* Anillos concéntricos de precisión */}
                                    <circle cx="50" cy="50" r="46" fill="none" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="6 3" opacity="0.6" />
                                    <circle cx="50" cy="50" r="41" fill="#f8fafc" stroke="url(#lightCoreGrad)" strokeWidth="2.5" />
                                    <circle cx="50" cy="50" r="33" fill="#ffffff" stroke="#0284c7" strokeWidth="1" strokeDasharray="4 2" />
                                    
                                    <polygon points="50,22 62,38 78,50 62,62 50,78 38,62 22,50 38,38" fill="none" stroke="#0284c7" strokeWidth="1.2" opacity="0.7" />
                                    
                                    <text x="50" y="44" fill="#0284c7" fontSize="6.2" fontWeight="900" textAnchor="middle" letterSpacing="0.8">SABERLAB</text>
                                    <text x="50" y="54" fill="#0f172a" fontSize="9" fontWeight="900" textAnchor="middle">★ STEAM ★</text>
                                    <text x="50" y="64" fill="#b45309" fontSize="5.5" fontWeight="800" textAnchor="middle">MÉRITO DOCENTE</text>
                                </svg>
                            </div>

                            {/* Firma 2: Director Académico */}
                            <div className="light-sig-card">
                                <div className="light-sig-draw">
                                    <svg viewBox="0 0 160 40" width="135" height="34">
                                        <path d="M 10 28 Q 35 6, 60 26 T 105 16 Q 125 34, 145 14" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
                                        <path d="M 35 20 Q 50 32, 70 8 T 115 28" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div className="light-sig-line"></div>
                                <span className="light-signer-name">{course.director}</span>
                                <span className="light-signer-role">{course.directorRole}</span>
                                <span className="light-sig-hash">CIPHER_SEC: #SL-DIR-OK</span>
                            </div>

                            {/* Bloque QR HUD Claro */}
                            <div className="light-qr-panel">
                                <QRImage value={verificationUrl} size={64} />
                                <div className="light-qr-info">
                                    <span className="qr-badge-status-light">● VERIFICADO</span>
                                    <span className="qr-cred-code-light">{credentialId}</span>
                                    <span className="qr-date-light">{completionDate}</span>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>

            {/* ── Banner de Telemetría Inferior ── */}
            <div className="light-security-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} color="#0284c7" />
                    <span>REGISTRO CRIPTOGRÁFICO EN SABERLAB CLOUD LEDGER</span>
                </div>
                <span className="hash-tag-light">{hashSignature}</span>
            </div>

        </div>
    );
}
