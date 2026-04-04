import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import './evanoti.css';

const EvaNoti = () => {
    const navigate = useNavigate();

    const handleStartExam = () => {
        navigate('/dashboard/evaluations/re-m1-e2-play');
    };

    return (
        <div className="notifications-page">
            <div className="page-header">
                <div className="header-title">
                    <Bell size={28} color="#facc15" />
                    <h1>Examen</h1>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h2 style={{ color: '#f8fafc', marginTop: 0 }}>Módulo 1 - Robótica Educativa</h2>
                <ul style={{ color: '#cbd5e1', lineHeight: '1.8', paddingLeft: '1.2rem' }}>
                    <li>Lee con calma cada enunciado.</li>
                    <li>Relaciona las preguntas con el comportamiento del hardware.</li>
                    <li>Evita responder por memoria mecánica.</li>
                    <li>Esta evaluación tiene un tiempo límite por pregunta.</li>
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

export default EvaNoti;
