import React from 'react';
import { X } from 'lucide-react';

const ArduinoPartsModal = ({ open, onClose }) => {
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
                    borderRadius: '24px',
                    width: '80%',
                    maxWidth: '900px',
                    padding: '2rem',
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
                <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    <h2 style={{ color: '#a855f7', fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                        Componentes del Arduino Uno
                    </h2>
                </header>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '0 auto' }}>
                    <img
                        src="https://i.postimg.cc/Qt6Qb6G2/Partes-Arduino-Uno.png"
                        alt="Partes Arduino Uno"
                        style={{
                            width: '100%',
                            maxWidth: '800px',
                            height: 'auto',
                            borderRadius: '16px',
                            border: '1px solid var(--glass-border, rgba(0,0,0,0.1))',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ArduinoPartsModal;
