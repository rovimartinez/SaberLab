import React, { useState, useEffect } from 'react';
import { Code2, Zap, CircuitBoard } from 'lucide-react';
import CodeEditor from './CodeEditor';

const ArduinoSimulatorV2 = () => {
    const [pins] = useState({
        13: { mode: 'OUTPUT', value: 'LOW' },
        12: { mode: 'INPUT', value: 'LOW' },
        11: { mode: 'OUTPUT', value: 'LOW' },
        10: { mode: 'OUTPUT', value: 'LOW' },
        9: { mode: 'OUTPUT', value: 'LOW' },
        8: { mode: 'OUTPUT', value: 'LOW' },
        7: { mode: 'INPUT', value: 'LOW' },
        6: { mode: 'OUTPUT', value: 'LOW' },
        5: { mode: 'OUTPUT', value: 'LOW' },
        4: { mode: 'OUTPUT', value: 'LOW' },
        3: { mode: 'OUTPUT', value: 'LOW' },
        2: { mode: 'INPUT', value: 'LOW' },
        A0: { mode: 'INPUT', value: 0 },
        A1: { mode: 'INPUT', value: 0 },
        A2: { mode: 'INPUT', value: 0 },
        A3: { mode: 'INPUT', value: 0 },
        A4: { mode: 'INPUT', value: 0 },
        A5: { mode: 'INPUT', value: 0 },
    });

    const [consoleOutput, setConsoleOutput] = useState([
        '> Sistema listo.',
        '> Conecta tu Arduino para comenzar...'
    ]);

    const [selectedComponent, setSelectedComponent] = useState(null);
    const [ledPins, setLedPins] = useState({ 13: false, 11: false, 10: false, 9: false });

    // Simulate board logic (very basic)
    useEffect(() => {
        const interval = setInterval(() => {
            // Just a visual placeholder for now
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleCodeRun = (logs) => {
        setConsoleOutput(prev => [...prev, ...logs]);
        
        // Basic regex parsing to update pin states (Mock implementation)
        const newLedPins = { ...ledPins };
        
        if (logs.some(l => l.includes('13, HIGH'))) newLedPins[13] = true;
        if (logs.some(l => l.includes('13, LOW'))) newLedPins[13] = false;
        
        setLedPins(newLedPins);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', height: 'calc(100vh - 250px)' }}>
            {/* Left: Editor & Console */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', overflow: 'hidden' }}>
                <CodeEditor onRun={handleCodeRun} compact />
                
                <div style={{ 
                    background: '#0f172a', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px', 
                    padding: '1rem', 
                    flex: 1,
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: '#10b981'
                }}>
                    <div style={{ color: '#64748b', marginBottom: '0.5rem', fontSize: '0.75rem' }}>MONITOR SERIAL</div>
                    {consoleOutput.map((log, i) => (
                        <div key={i} style={{ marginBottom: '0.25rem' }}>{log}</div>
                    ))}
                </div>
            </div>

            {/* Right: Board Visualization */}
            <div style={{ 
                background: '#1e293b', 
                borderRadius: '20px', 
                border: '1px solid rgba(255,255,255,0.1)', 
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <h4 style={{ color: '#60a5fa', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CircuitBoard size={20} />
                    Vista Física
                </h4>
                
                <div style={{ 
                    background: '#0f172a', 
                    borderRadius: '16px', 
                    flex: 1, 
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* Arduino Board SVG/HTML Representation */}
                    <div style={{ 
                        width: '220px', 
                        height: '160px', 
                        background: '#008184', 
                        borderRadius: '4px', 
                        position: 'relative',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        padding: '10px'
                    }}>
                        <div style={{ 
                            position: 'absolute', 
                            top: '-15px', 
                            left: '20px',
                            display: 'flex',
                            gap: '6px'
                        }}>
                            {[13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2].map(pin => (
                                <div key={pin} 
                                    onClick={() => setSelectedComponent({ type: 'pin', id: pin })}
                                    style={{ 
                                        width: '10px', 
                                        height: '15px', 
                                        background: '#333', 
                                        borderRadius: '2px',
                                        cursor: 'pointer',
                                        boxShadow: pins[pin]?.value === 'HIGH' ? `0 0 8px #fbbf24` : 'none',
                                        border: selectedComponent?.id === pin ? '1px solid #fff' : 'none'
                                    }} 
                                />
                            ))}
                        </div>
                        
                        {/* Onboard LED L */}
                        <div style={{ position: 'absolute', top: '50px', right: '40px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ 
                                width: '8px', 
                                height: '8px', 
                                borderRadius: '50%', 
                                background: ledPins[13] ? '#fbbf24' : '#333',
                                boxShadow: ledPins[13] ? '0 0 10px #fbbf24' : 'none',
                                transition: 'all 0.2s'
                            }} />
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '8px', fontWeight: 'bold' }}>L</span>
                        </div>

                         {/* Power LED */}
                         <div style={{ position: 'absolute', top: '50px', right: '60px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ 
                                width: '8px', 
                                height: '8px', 
                                borderRadius: '50%', 
                                background: '#10b981',
                                boxShadow: '0 0 5px #10b981'
                            }} />
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '8px', fontWeight: 'bold' }}>ON</span>
                        </div>

                        {/* USB & Power Jack indicators */}
                        <div style={{ position: 'absolute', left: '-15px', top: '20px', width: '15px', height: '40px', background: '#999', borderRadius: '2px' }}></div>
                        <div style={{ position: 'absolute', left: '-20px', bottom: '30px', width: '20px', height: '30px', background: '#111', borderRadius: '2px' }}></div>

                        {/* Analog Pins */}
                        <div style={{ position: 'absolute', bottom: '-15px', left: '60px', display: 'flex', gap: '6px' }}>
                            {['A0', 'A1', 'A2', 'A3', 'A4', 'A5'].map(pin => (
                                <div key={pin} style={{ width: '10px', height: '15px', background: '#333', borderRadius: '2px' }} />
                            ))}
                        </div>

                         {/* Text branding */}
                         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.1, color: 'white', fontSize: '20px', fontWeight: 'bold', fontStyle: 'italic', pointerEvents: 'none' }}>
                            ARDUINO
                         </div>
                    </div>
                </div>

                {/* Pin State Indicator */}
                <div style={{ 
                    background: '#0f172a', 
                    padding: '1rem', 
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    color: '#94a3b8'
                }}>
                    {selectedComponent ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Pin {selectedComponent.id}</span>
                            <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>
                                {pins[selectedComponent.id]?.mode || 'INPUT'}
                            </span>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>Selecciona un pin para ver detalles</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArduinoSimulatorV2;