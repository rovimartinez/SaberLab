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
                    background: 'rgba(30, 41, 59, 0.98)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    width: '80%',
                    maxWidth: '900px',
                    padding: '2rem',
                    position: 'relative',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '1rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: 'white',
                        padding: '6px',
                        borderRadius: '50%',
                        cursor: 'pointer'
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
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ArduinoPartsModal;
