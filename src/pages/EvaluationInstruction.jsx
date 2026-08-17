import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bell, Clock } from 'lucide-react';
import { api } from '../lib/api';
import '../styles/EvaluationInstruction.css';

const EvaluationInstruction = () => {
    const { evaluationKey } = useParams();
    const navigate = useNavigate();
    const [evaluation, setEvaluation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isResuming, setIsResuming] = useState(false);

    useEffect(() => {
        const started = localStorage.getItem(`exam_started_${evaluationKey}`);
        const endTime = localStorage.getItem(`exam_end_time_${evaluationKey}`);
        
        if (started === 'true' && endTime) {
            const now = Math.floor(Date.now() / 1000);
            if (parseInt(endTime, 10) > now) {
                setIsResuming(true);
            }
        }
    }, [evaluationKey]);

    useEffect(() => {
        const fetchEvaluation = async () => {
            if (!evaluationKey) {
                setLoading(false);
                return;
            }

            const { data, error } = await api(`/evaluations?key=${encodeURIComponent(evaluationKey)}`);

            if (data) {
                setEvaluation(data);
            }
            setLoading(false);
        };

        fetchEvaluation();
    }, [evaluationKey]);

    const handleStartExam = () => {
        if (evaluation) {
            navigate(`/dashboard/evaluations/${evaluation.evaluation_key}/play`);
        }
    };

    if (loading) {
        return (
            <div className="notifications-page">
                <div className="page-header">
                    <div className="header-title">
                        <Bell size={28} color="#facc15" />
                        <h1>Cargando...</h1>
                    </div>
                </div>
            </div>
        );
    }

    if (!evaluation) {
        return (
            <div className="notifications-page">
                <div className="page-header">
                    <div className="header-title">
                        <Bell size={28} color="#facc15" />
                        <h1>Evaluación no encontrada</h1>
                    </div>
                </div>
            </div>
        );
    }

    const questionsCount = evaluation.questions?.length || 0;

    return (
        <div className="notifications-page">
            <div className="page-header">
                <div className="header-title">
                    <Bell size={28} color="#facc15" />
                    <h1>Examen</h1>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h2 style={{ color: '#f8fafc', marginTop: 0 }}>{evaluation.title}</h2>
                <p style={{ color: '#cbd5e1', marginBottom: '1rem', fontStyle: 'italic' }}>{evaluation.description}</p>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <h3 style={{ color: '#facc15', fontSize: '0.9rem', marginTop: 0, textTransform: 'uppercase' }}>Instrucciones</h3>
                    <p style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{evaluation.instructions || 'Lee con atención cada pregunta y selecciona la respuesta correcta. Asegúrate de tener una conexión estable.'}</p>
                </div>
                <ul style={{ color: '#cbd5e1', lineHeight: '1.8', paddingLeft: '1.2rem', marginBottom: '1.5rem' }}>
                    <li><strong style={{ color: 'white' }}>Total de preguntas:</strong> {questionsCount} preguntas</li>
                    <li><strong style={{ color: 'white' }}>Tiempo límite:</strong> {evaluation.time_limit} minutos</li>
                    <li><strong style={{ color: 'white' }}>Puntaje mínimo para aprobar:</strong> {evaluation.passing_score}%</li>
                </ul>
                <button 
                    onClick={handleStartExam}
                    style={{
                        background: isResuming 
                            ? 'linear-gradient(135deg, #3b82f6, #3b82f6)' 
                            : 'linear-gradient(135deg, #f43f5e, #fb7185)',
                        color: 'white',
                        border: 'none',
                        padding: '1.2rem 2rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        marginTop: '1rem',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        transition: 'transform 0.2s ease, filter 0.2s ease',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                >
                    {isResuming ? (
                        <>
                            <Clock size={20} />
                            Continuar evaluación
                        </>
                    ) : (
                        'Comenzar evaluación'
                    )}
                </button>
            </div>
        </div>
    );
};

export default EvaluationInstruction;
