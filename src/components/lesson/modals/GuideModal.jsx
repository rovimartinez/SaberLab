import React from 'react';
import { Search, X } from 'lucide-react';

const colors = [
    { name: 'Negro', v12: 0, mult: 'x1 Ohm', tol: '-', color: '#000000' },
    { name: 'Marron', v12: 1, mult: 'x10 Ohm', tol: '+/-1%', color: '#92400f' },
    { name: 'Rojo', v12: 2, mult: 'x100 Ohm', tol: '+/-2%', color: '#ef4444' },
    { name: 'Naranja', v12: 3, mult: 'x1k Ohm', tol: '-', color: '#f59e0b' },
    { name: 'Amarillo', v12: 4, mult: 'x10k Ohm', tol: '-', color: '#facc15' },
    { name: 'Verde', v12: 5, mult: 'x100k Ohm', tol: '+/-0.5%', color: '#22c55e' },
    { name: 'Azul', v12: 6, mult: 'x1M Ohm', tol: '+/-0.25%', color: '#3b82f6' },
    { name: 'Violeta', v12: 7, mult: 'x10M Ohm', tol: '+/-0.1%', color: '#a855f7' },
    { name: 'Gris', v12: 8, mult: '-', tol: '+/-0.05%', color: '#64748b' },
    { name: 'Blanco', v12: 9, mult: '-', tol: '-', color: '#ffffff' },
    { name: 'Oro', v12: '-', mult: 'x0.1 Ohm', tol: '+/-5%', color: '#fbbf24' },
    { name: 'Plata', v12: '-', mult: 'x0.01 Ohm', tol: '+/-10%', color: '#94a3b8' }
];

const GuideModal = ({ open, onClose }) => {
    if (!open) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'var(--bg-secondary, #ffffff)',
                    border: '1px solid var(--glass-border, #cbd5e1)',
                    borderRadius: '20px',
                    width: '90%',
                    maxWidth: '520px',
                    padding: '1.25rem',
                    position: 'relative',
                    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)'
                }}
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '1rem',
                        background: 'var(--bg-primary, #f1f5f9)',
                        border: '1px solid var(--glass-border, #e2e8f0)',
                        color: 'var(--text-primary, #0f172a)',
                        padding: '6px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={16} />
                </button>

                <header style={{ marginBottom: '1rem' }}>
                    <h2 style={{ color: '#f97316', fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Search size={22} />
                        Guia de Colores (4 Bandas)
                    </h2>
                </header>

                <div style={{ overflowX: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px' }}>
                        <thead>
                            <tr style={{ color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <th style={{ padding: '0.25rem 0.75rem', textAlign: 'left' }}>Color</th>
                                <th style={{ padding: '0.25rem 0.75rem', textAlign: 'center' }}>B 1/2</th>
                                <th style={{ padding: '0.25rem 0.75rem', textAlign: 'center' }}>Mult.</th>
                                <th style={{ padding: '0.25rem 0.75rem', textAlign: 'right' }}>Tol.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {colors.map((colorItem) => (
                                <tr key={colorItem.name} style={{ background: 'var(--bg-primary, rgba(0,0,0,0.03))' }}>
                                    <td style={{ padding: '0.4rem 0.75rem', borderRadius: '8px 0 0 8px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: colorItem.color, border: '1px solid rgba(0,0,0,0.15)' }} />
                                        <span style={{ fontWeight: 700, color: 'var(--text-primary, #0f172a)', fontSize: '0.8rem' }}>{colorItem.name}</span>
                                    </td>
                                    <td style={{ padding: '0.4rem 0.75rem', textAlign: 'center', color: 'var(--text-secondary, #475569)', fontWeight: 600, fontSize: '0.8rem' }}>{colorItem.v12}</td>
                                    <td style={{ padding: '0.4rem 0.75rem', textAlign: 'center', color: '#f97316', fontWeight: 700, fontSize: '0.8rem' }}>{colorItem.mult}</td>
                                    <td style={{ padding: '0.4rem 0.75rem', borderRadius: '0 8px 8px 0', textAlign: 'right', color: colorItem.tol !== '-' ? '#10b981' : '#64748b', fontWeight: 800, fontSize: '0.8rem' }}>{colorItem.tol}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GuideModal;
