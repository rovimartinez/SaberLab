import React, { useEffect, useRef, useState } from 'react';
import { Code2, Play, RotateCcw } from 'lucide-react';

const CodeEditor = ({ onRun, isRunning, onStop }) => {
  const [code, setCode] = useState(`// Arduino Sketch\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}`);

  const handleAction = () => {
    if (isRunning) {
      onStop();
    } else {
      onRun(code);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#1e293b',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        boxShadow: '0 24px 50px rgba(0,0,0,0.32)',
        height: '100%',
        minHeight: '380px'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: '#0f172a',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#60a5fa',
            fontWeight: 500
          }}
        >
          <Code2 size={14} />
          <span>Sketch.ino</span>
        </div>
        <button
          onClick={handleAction}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: isRunning ? '#dc2626' : '#059669',
            color: '#fff',
            fontSize: '10px',
            padding: '6px 12px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            fontWeight: 700,
            boxShadow: '0 10px 24px rgba(0,0,0,0.3)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {isRunning ? <RotateCcw size={12} /> : <Play size={12} fill="currentColor" />}
          {isRunning ? 'DETENER' : 'EJECUTAR'}
        </button>
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck="false"
        style={{
          width: '100%',
          height: '100%',
          padding: '16px',
          background: 'rgba(15,23,42,0.55)',
          color: '#34d399',
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: '12px',
          outline: 'none',
          resize: 'none',
          lineHeight: 1.7,
          border: 'none',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
};

const topPinStyle = {
  width: '16px',
  height: '32px',
  background: '#1a1a1a',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  paddingBottom: '6px',
  borderLeft: '1px solid rgba(0,0,0,0.1)',
  borderRight: '1px solid rgba(0,0,0,0.1)'
};

const bottomPinStyle = {
  width: '16px',
  height: '32px',
  background: '#1a1a1a',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingTop: '6px',
  borderLeft: '1px solid rgba(0,0,0,0.1)',
  borderRight: '1px solid rgba(0,0,0,0.1)'
};

const ArduinoSimulatorV2 = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [ledState, setLedState] = useState(false);
  const simulationRef = useRef(null);

  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
    };
  }, []);

  const handleStop = () => {
    setIsRunning(false);
    setLedState(false);
    if (simulationRef.current) clearInterval(simulationRef.current);
    simulationRef.current = null;
  };

  const handleCodeRun = (code) => {
    if (simulationRef.current) clearInterval(simulationRef.current);
    simulationRef.current = null;
    setIsRunning(true);
    setLedState(false);

    setTimeout(() => {
      if (code.includes('digitalWrite(13, HIGH)')) {
        let state = false;
        simulationRef.current = setInterval(() => {
          state = !state;
          setLedState(state);
        }, 1000);
      }
    }, 400);
  };

  return (
    <div
      style={{
        padding: '16px',
        width: '100%',
        fontFamily: 'system-ui, sans-serif'
      }}
    >
      <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '16px',
            alignItems: 'stretch',
            width: '100%',
            minHeight: '400px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <CodeEditor onRun={handleCodeRun} onStop={handleStop} isRunning={isRunning} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                background: '#1e293b',
                borderRadius: '28px',
                padding: '24px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 50px rgba(0,0,0,0.32)',
                width: '100%',
                height: '100%',
                minHeight: '380px',
                boxSizing: 'border-box'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '24px',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  transition: 'all 0.2s ease',
                  background: isRunning ? 'rgba(16,185,129,0.2)' : '#1e293b',
                  color: isRunning ? '#34d399' : '#64748b',
                  border: isRunning ? '1px solid rgba(16,185,129,0.3)' : '1px solid #334155'
                }}
              >
                {isRunning ? 'RUNNING' : 'IDLE'}
              </div>

              <div
                style={{
                  transform: 'scale(0.9)',
                  transition: 'transform 0.5s ease'
                }}
              >
                <div
                  style={{
                    width: '300px',
                    height: '220px',
                    background: '#008184',
                    borderRadius: '14px',
                    position: 'relative',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
                    border: '2px solid rgba(15,118,110,0.5)'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: '-21px',
                      top: '42px',
                      width: '38px',
                      height: '48px',
                      background: '#cbd5e1',
                      borderRadius: '4px',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.25)',
                      border: '1px solid #94a3b8'
                    }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      left: '-16px',
                      bottom: '35px',
                      width: '42px',
                      height: '36px',
                      background: '#111',
                      borderRadius: '4px',
                      border: '1px solid #0f172a',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.35)'
                    }}
                  />

                  <div style={{ position: 'absolute', top: '22px', right: '40px' }}>
                    <span
                      style={{
                        fontSize: '6px',
                        color: '#fff',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.16em',
                        opacity: 0.8
                      }}
                    >
                      Digital (PWM ~)
                    </span>
                  </div>

                  <div style={{ position: 'absolute', top: '-8px', right: '10px', display: 'flex', gap: '8px' }}>
                    <div style={{ display: 'flex' }}>
                      {['AREF', 'GND', 13, 12, 11, 10, 9, 8].map((pin) => (
                        <div key={`digital-high-${pin}`} style={topPinStyle}>
                          <div
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              marginBottom: '4px',
                              transition: 'all 0.3s ease',
                              background: pin === 13 && ledState ? '#facc15' : '#334155',
                              boxShadow: pin === 13 && ledState ? '0 0 10px #fbbf24' : 'none'
                            }}
                          />
                          <span style={{ fontSize: pin === 'AREF' || pin === 'GND' ? '4px' : '5px', color: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>
                            {pin}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex' }}>
                      {[7, 6, 5, 4, 3, 2, 1, 0].map((pin) => (
                        <div key={`digital-low-${pin}`} style={topPinStyle}>
                          <div
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              marginBottom: '4px',
                              background: '#334155'
                            }}
                          />
                          <span style={{ fontSize: '5px', color: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>{pin}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ position: 'absolute', top: '80px', right: '230px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div
                      style={{
                        width: '16px',
                        height: '12px',
                        borderRadius: '3px',
                        transition: 'all 0.15s ease',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: ledState ? '#facc15' : '#115e59',
                        boxShadow: ledState ? '0 0 15px #fbbf24' : 'none'
                      }}
                    />
                    <span style={{ fontSize: '7px', color: '#fff', fontWeight: 900 }}>L</span>
                  </div>

                  <div style={{ position: 'absolute', top: '80px', right: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div
                      style={{
                        width: '16px',
                        height: '12px',
                        borderRadius: '3px',
                        background: '#10b981',
                        boxShadow: '0 0 8px #10b981',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                    />
                    <span style={{ fontSize: '7px', color: '#fff', fontWeight: 900 }}>ON</span>
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      right: '45px',
                      bottom: '55px',
                      width: '110px',
                      height: '30px',
                      background: '#1a1a1a',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderBottom: '2px solid #000',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.45)',
                      borderLeft: '1px solid rgba(0,0,0,0.2)',
                      borderRight: '1px solid rgba(0,0,0,0.2)'
                    }}
                  >
                    <span style={{ fontSize: '8px', color: '#94a3b8', fontWeight: 900, letterSpacing: '0.1em' }}>ATMEGA328P</span>
                  </div>

                  <div style={{ position: 'absolute', bottom: '-8px', right: '10px', display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex' }}>
                      {['Vin', 'GND', 'GND', '5V', '3.3V', 'RST'].map((pin, idx) => (
                        <div key={`power-${pin}-${idx}`} style={bottomPinStyle}>
                          <span style={{ fontSize: '4.5px', color: 'rgba(255,255,255,0.3)', fontWeight: 900, lineHeight: 1 }}>{pin}</span>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#334155', marginTop: '4px' }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex' }}>
                      {['A0', 'A1', 'A2', 'A3', 'A4', 'A5'].map((pin, idx) => (
                        <div key={`analog-${pin}-${idx}`} style={bottomPinStyle}>
                          <span style={{ fontSize: '5px', color: 'rgba(255,255,255,0.3)', fontWeight: 900, lineHeight: 1 }}>{pin}</span>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#334155', marginTop: '4px' }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ position: 'absolute', bottom: '28px', right: '10px', display: 'flex', width: '210px', justifyContent: 'space-between', padding: '0 8px' }}>
                    <span style={{ fontSize: '6px', color: '#fff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', opacity: 0.8 }}>
                      Power
                    </span>
                    <span style={{ fontSize: '6px', color: '#fff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', opacity: 0.8, marginRight: '8px' }}>
                      Analog In
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArduinoSimulatorV2;
