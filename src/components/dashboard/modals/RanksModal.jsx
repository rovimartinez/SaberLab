import React from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Lock, X } from 'lucide-react';
import { ranks } from '../../../data/ranksData';

export const RanksModal = ({ isOpen, onClose, rank, lessonsCompleted }) => {
    if (!isOpen || typeof document === 'undefined') return null;

    return createPortal(
        <div className="ranks-modal-backdrop animate-fade-in" onClick={onClose}>
            <div className="ranks-modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
                
                {/* Cabecera del Modal */}
                <div className="ranks-modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="ranks-modal-icon-glow">
                            <Trophy size={22} color="#fbbf24" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, color: 'var(--text-heading)', fontSize: '1.25rem', fontWeight: 800 }}>
                                Sistema de Rangos por lecciones
                            </h2>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                Asciende de nivel aprobando lecciones y retos en tus cursos.
                            </p>
                        </div>
                    </div>
                    <button className="ranks-modal-close-btn" onClick={onClose} title="Cerrar modal">
                        <X size={18} />
                    </button>
                </div>

                {/* Lista Vertical Compacta: 6 Rangos Sin Scroll */}
                <div className="ranks-vertical-list">
                    {ranks.map((r) => {
                        const isUnlocked = lessonsCompleted >= r.minLessons;
                        const isCurrent = rank?.name === r.name;

                        return (
                            <div 
                                key={r.name} 
                                className={`rank-vertical-row ${isCurrent ? 'current' : isUnlocked ? 'unlocked' : 'locked'}`}
                                style={isCurrent ? { 
                                    borderColor: r.color, 
                                    background: `linear-gradient(135deg, ${r.color}22 0%, var(--surface-card) 100%)`,
                                    boxShadow: `0 0 14px ${r.color}35`,
                                    borderWidth: '1.5px'
                                } : {}}
                            >
                                <div className="rank-row-left">
                                    <div 
                                        className="rank-row-emoji" 
                                        style={{ 
                                            background: `${r.color}25`, 
                                            border: `1px solid ${r.color}`,
                                        }}
                                    >
                                        {r.emoji}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                            <span className="rank-row-name" style={{ color: isCurrent ? r.color : isUnlocked ? 'var(--text-heading)' : 'var(--text-muted)' }}>
                                                {r.name}
                                            </span>
                                            {isCurrent && (
                                                <span className="badge-current-pill" style={{ background: r.color }}>
                                                    ✓ Nivel Actual
                                                </span>
                                            )}
                                        </div>
                                        <span className="rank-row-desc" style={{ color: isCurrent ? 'var(--text-body)' : 'var(--text-muted)' }}>
                                            {r.description}
                                        </span>
                                    </div>
                                </div>

                                <div className="rank-row-right">
                                    <span className="rank-row-req" style={{ color: isCurrent ? r.color : 'var(--text-secondary)' }}>
                                        {r.minLessons === 0 ? 'Inicial' : `${r.minLessons} lecc.`}
                                    </span>
                                    {isCurrent ? (
                                        <span style={{ color: '#10b981', fontWeight: 900, fontSize: '0.74rem' }}>
                                            {lessonsCompleted} lecc.
                                        </span>
                                    ) : isUnlocked ? (
                                        <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.74rem' }}>✓ Superado</span>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <Lock size={11} /> Bloqueado
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>,
        document.body
    );
};

export default RanksModal;
