import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import '../styles/EvaluationInstruction.css';

const EvaluationInstruction = () => {
    const { evaluationKey } = useParams();
    const navigate = useNavigate();
    const [evaluation, setEvaluation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvaluation = async () => {
            if (!evaluationKey) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('evaluaciones')
                .select('*')
                .eq('evaluation_key', evaluationKey)
                .single();

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
                        background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem 2rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginTop: '1rem',
                        width: '100%',
                    }}
                >
                    Comenzar evaluación
                </button>
            </div>
        </div>
    );
};

export default EvaluationInstruction;
