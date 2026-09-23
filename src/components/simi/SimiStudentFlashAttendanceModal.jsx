import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Zap, CheckCircle2, XCircle, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { shuffleArray } from '../../data/simiAttendanceData';
import { api } from '../../lib/api';
import '../../styles/SimiAttendance.css';

export default function SimiStudentFlashAttendanceModal({
    session,
    onClose,
    onSuccess
}) {
    if (!session || !session.eventId) return null;

    const [shuffledOptions, setShuffledOptions] = useState([]);
    const [timeLeft, setTimeLeft] = useState(() => session.remainingSeconds || session.durationSeconds || 8);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null); // null | 'success' | 'error' | 'timeout'
    const [resultMessage, setResultMessage] = useState('');
    const timerRef = useRef(null);

    const totalDuration = session.durationSeconds || 8;
    const progressPercent = Math.max(0, Math.min(100, (timeLeft / totalDuration) * 100));

    // Barajar opciones individualmente para este alumno
    useEffect(() => {
        if (session.options && Array.isArray(session.options)) {
            setShuffledOptions(shuffleArray(session.options));
        }
    }, [session.options]);

    // Reloj regresivo
    useEffect(() => {
        let current = session.remainingSeconds || totalDuration;
        setTimeLeft(current);

        timerRef.current = setInterval(() => {
            current -= 1;
            setTimeLeft(current);

            if (current <= 0) {
                clearInterval(timerRef.current);
                if (!result) {
                    setResult('timeout');
                    setResultMessage('Tiempo agotado. La asistencia no pudo ser confirmada.');
                    setTimeout(() => {
                        if (onClose) onClose();
                    }, 2800);
                }
            }
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [session.remainingSeconds, totalDuration]);

    // Manejar selección de opción
    const handleSelectOption = async (word) => {
        if (isSubmitting || result) return;
        setIsSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            const res = await api('/simi', {
                method: 'POST',
                body: {
                    action: 'submit-flash-attendance',
                    eventId: session.eventId,
                    selectedWord: word
                }
            });

            if (res?.data?.correct || res?.correct) {
                setResult('success');
                setResultMessage(res?.data?.message || '¡Asistencia Confirmada! (+50 EXP)');
                if (onSuccess) onSuccess();
                setTimeout(() => {
                    if (onClose) onClose();
                }, 2400);
            } else {
                setResult('error');
                setResultMessage(res?.data?.message || res?.message || 'Palabra incorrecta. Asistencia no registrada.');
                setTimeout(() => {
                    if (onClose) onClose();
                }, 2800);
            }
        } catch (err) {
            setResult('error');
            setResultMessage('Error de conexión al registrar asistencia.');
            setTimeout(() => {
                if (onClose) onClose();
            }, 2500);
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="simi-student-flash-overlay">
            <div className="simi-student-flash-card">
                
                {/* Barra de Progreso Regresiva */}
                <div className="simi-flash-progress-track">
                    <div 
                        className="simi-flash-progress-bar"
                        style={{ 
                            width: `${progressPercent}%`,
                            transition: 'width 0.95s linear'
                        }}
                    />
                </div>

                <div className="simi-student-flash-content">
                    
                    {/* Badge Superior */}
                    <div className="simi-flash-badge">
                        <Zap size={14} fill="currentColor" />
                        <span>Verificación de Asistencia · {session.familyName || 'SIMI3D'}</span>
                    </div>

                    {!result ? (
                        <>
                            {/* Temporizador Gigante */}
                            <div className="simi-flash-timer-display">
                                <Clock size={28} style={{ color: '#06b6d4' }} />
                                <span className="simi-flash-timer-sec">{timeLeft}s</span>
                            </div>

                            <p className="simi-flash-question-text">
                                Presiona la <strong>palabra técnica</strong> que el docente o líder indicó en clase:
                            </p>

                            {/* Grilla 2x2 de Opciones Barajadas */}
                            <div className="simi-flash-options-grid">
                                {shuffledOptions.map((opt) => (
                                    <button
                                        key={opt}
                                        className="simi-flash-option-btn"
                                        onClick={() => handleSelectOption(opt)}
                                        disabled={isSubmitting}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        /* Pantalla de Resultado Inmediato */
                        <div className="simi-flash-result-box">
                            {result === 'success' ? (
                                <>
                                    <div className="simi-flash-result-icon success">
                                        <CheckCircle2 size={36} />
                                    </div>
                                    <h4 className="simi-flash-result-title" style={{ color: '#10b981' }}>
                                        ¡Asistencia Confirmada!
                                    </h4>
                                    <p className="simi-flash-result-msg">
                                        Has ganado <strong style={{ color: '#f59e0b' }}>+50 EXP</strong> para tu perfil de semillero.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="simi-flash-result-icon error">
                                        <XCircle size={36} />
                                    </div>
                                    <h4 className="simi-flash-result-title" style={{ color: '#ef4444' }}>
                                        {result === 'timeout' ? 'Tiempo Agotado' : 'Opción Incorrecta'}
                                    </h4>
                                    <p className="simi-flash-result-msg">
                                        {resultMessage}
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                </div>

            </div>
        </div>,
        document.body
    );
}
