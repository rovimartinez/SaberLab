import React, { useState } from 'react';
import { Play, RotateCw, Download, Upload, Save, Code } from 'lucide-react';

const CodeEditor = () => {
    const [code, setCode] = useState(`void setup() {
  // Configura los pines como salida
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  // Enciende el LED
  digitalWrite(13, HIGH);
  Serial.println("LED ON");
  delay(1000);
  
  // Apaga el LED
  digitalWrite(13, LOW);
  Serial.println("LED OFF");
  delay(1000);
}`);
    const [output, setOutput] = useState([]);
    const [isSimulating, setIsSimulating] = useState(false);

    const handleRun = () => {
        setIsSimulating(true);
        setOutput(['> Compilando código...', '> Compilación exitosa!', '> Subiendo a Arduino...', '> Simulación iniciada...']);
        
        setTimeout(() => {
            setOutput(prev => [...prev, '> LED integrado: ON', '> Esperando 1000ms...', '> LED integrado: OFF', '> Esperando 1000ms...']);
            setIsSimulating(false);
        }, 2000);
    };

    const handleReset = () => {
        setOutput([]);
        setIsSimulating(false);
    };

    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sketch.ino';
        a.click();
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', height: '600px' }}>
            {/* Editor Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                <div style={{ 
                    background: '#1e293b', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.75rem 1rem',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ background: '#ef4444', width: '12px', height: '12px', borderRadius: '50%' }}></span>
                        <span style={{ background: '#f59e0b', width: '12px', height: '12px', borderRadius: '50%' }}></span>
                        <span style={{ background: '#10b981', width: '12px', height: '12px', borderRadius: '50%' }}></span>
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>sketch_mar31a.ino</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={handleDownload} style={iconBtnStyle} title="Descargar">
                            <Download size={16} />
                        </button>
                        <button style={iconBtnStyle} title="Subir">
                            <Upload size={16} />
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, position: 'relative' }}>
                    <textarea 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        style={{
                            width: '100%',
                            height: '100%',
                            background: '#0f172a',
                            color: '#e2e8f0',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.9rem',
                            lineHeight: 1.6,
                            resize: 'none',
                            outline: 'none'
                        }}
                        spellCheck="false"
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button 
                        onClick={handleReset}
                        style={{ 
                            ...btnStyle, 
                            background: 'rgba(255,255,255,0.05)', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#94a3b8'
                        }}
                    >
                        <RotateCw size={18} />
                        Limpiar
                    </button>
                    <button 
                        onClick={handleRun}
                        disabled={isSimulating}
                        style={{ 
                            ...btnStyle, 
                            background: isSimulating ? '#64748b' : '#10b981',
                            opacity: isSimulating ? 0.7 : 1
                        }}
                    >
                        <Play size={18} fill="white" />
                        {isSimulating ? 'Ejecutando...' : 'Ejecutar Código'}
                    </button>
                </div>
            </div>

            {/* Console/Simulator Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                <div style={{ 
                    background: '#1e293b', 
                    padding: '0.75rem 1rem', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Code size={18} color="#60a5fa" />
                    <span style={{ color: 'white', fontWeight: 700 }}>Consola / Salida Serial</span>
                </div>

                <div style={{ 
                    flex: 1, 
                    background: '#020617', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(96, 165, 250, 0.2)',
                    padding: '1rem',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.85rem',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    {output.length === 0 ? (
                        <span style={{ color: '#64748b', fontStyle: 'italic' }}>// La salida del monitor serial aparecerá aquí...</span>
                    ) : (
                        output.map((line, i) => (
                            <div key={i} style={{ color: line.includes('ERROR') ? '#ef4444' : '#10b981' }}>
                                <span style={{ color: '#64748b' }}>{'>'}</span> {line}
                            </div>
                        ))
                    )}
                </div>

                {/* Mini Simulator Visualization */}
                <div style={{ 
                    height: '180px', 
                    background: '#1e293b', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ 
                        width: '80%', 
                        height: '80%', 
                        background: '#0f172a', 
                        borderRadius: '12px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {/* Arduino Board Placeholder */}
                        <div style={{ 
                            width: '120px', 
                            height: '60px', 
                            background: '#008184', 
                            borderRadius: '4px',
                            position: 'relative',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                        }}>
                             {/* LED L on board */}
                            <div style={{ 
                                position: 'absolute', 
                                top: '20px', 
                                right: '20px', 
                                width: '8px', 
                                height: '8px', 
                                borderRadius: '50%',
                                background: output.some(o => o.includes('ON')) ? '#fbbf24' : '#333',
                                boxShadow: output.some(o => o.includes('ON')) ? '0 0 10px #fbbf24' : 'none',
                                transition: 'all 0.2s'
                            }} />
                        </div>
                        
                        <span style={{ position: 'absolute', bottom: '10px', color: '#64748b', fontSize: '0.75rem' }}>
                            Simulación en Tiempo Real
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const iconBtnStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: 'none',
    color: '#94a3b8',
    padding: '6px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const btnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    color: 'white',
    border: 'none',
    transition: 'all 0.2s'
};

export default CodeEditor;