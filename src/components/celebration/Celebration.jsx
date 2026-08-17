import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, ArrowRight } from 'lucide-react';
import '../../styles/Celebration.css';

/**
 * Celebration — Overlay de confeti + card de "¡Completado!"
 *
 * Props:
 *   show       {boolean}  — controla si se muestra
 *   onClose    {fn}       — callback al cerrar / continuar
 *   title      {string}   — título del overlay (default: "¡Lección Completada!")
 *   subtitle   {string}   — subtítulo opcional
 */
export default function Celebration({
    show,
    onClose,
    onNextLesson,
    nextLessonTitle,
    title = '¡Lección Completada!',
    subtitle = '¡Excelente trabajo! Sigue así.',
}) {
    const canvasRef = useRef(null);
    const [exiting, setExiting] = useState(false);

    // Lanzar confeti cuando se muestra
    useEffect(() => {
        if (!show) return;

        const end = Date.now() + 2500;

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#a855f7', '#3b82f6', '#ec4899', '#fbbf24'],
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#a855f7', '#3b82f6', '#ec4899', '#fbbf24'],
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        requestAnimationFrame(frame);
    }, [show]);

    const handleClose = () => {
        setExiting(true);
        setTimeout(() => {
            setExiting(false);
            onClose?.();
        }, 300);
    };

    const handleNext = () => {
        setExiting(true);
        setTimeout(() => {
            setExiting(false);
            onNextLesson?.();
        }, 300);
    };

    if (!show && !exiting) return null;

    return (
        <div className={`celebration-overlay active`}>
            <div className={`celebration-card ${exiting ? 'exiting' : ''}`}>
                {/* Trofeo */}
                <div className="celebration-trophy-wrap">
                    <Trophy className="celebration-trophy-icon" size={44} />
                </div>

                {/* Estrellas */}
                <div className="celebration-stars">
                    <Star className="celebration-star" size={22} fill="currentColor" />
                    <Star className="celebration-star" size={28} fill="currentColor" />
                    <Star className="celebration-star" size={22} fill="currentColor" />
                </div>

                {/* Textos */}
                <h2 className="celebration-title">{title}</h2>
                <p className="celebration-subtitle">{subtitle}</p>

                {/* Botones de acción */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: '1.25rem' }}>
                    {onNextLesson && (
                        <button className="celebration-btn" onClick={handleNext} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', width: '100%' }}>
                            <span>Siguiente lección</span>
                            <ArrowRight size={18} />
                        </button>
                    )}
                    <button 
                        className="celebration-btn" 
                        onClick={handleClose} 
                        style={{ 
                            background: onNextLesson ? 'rgba(255,255,255,0.08)' : undefined, 
                            border: onNextLesson ? '1px solid rgba(255,255,255,0.2)' : undefined,
                            width: '100%' 
                        }}
                    >
                        <span>Volver al curso</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
