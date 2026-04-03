import React, { useState, useRef, useEffect } from 'react';
import { Code2, Play, RotateCcw } from 'lucide-react';

/**
 * Componente CodeEditor
 * Interfaz para escribir y ejecutar el código del simulador
 */
const CodeEditor = ({ onRun, isRunning, onStop }) => {
  const [code, setCode] = useState(`// Arduino Sketch
void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`);

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
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        height: '100%',
        minHeight: '350px'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: '#0f172a',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
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
            gap: '0.5rem',
            background: isRunning ? '#dc2626' : '#059669',
            color: '#fff',
            fontSize: '10px',
            padding: '6px 12px',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
            fontWeight: 'bold',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
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
          flex: 1,
          minHeight: '200px',
          padding: '1rem',
          background: 'rgba(15,23,42,0.5)',
          color: '#34d399',
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: '0.75rem',
          outline: 'none',
          resize: 'none',
          lineHeight: 1.6,
          border: 'none',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
};

const ArduinoSimulatorV2 = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [ledState, setLedState] = useState(false);
  const [txRxActive, setTxRxActive] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const simulationRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStop = () => {
    setIsRunning(false);
    setLedState(false);
    setTxRxActive(false);
    if (simulationRef.current) clearInterval(simulationRef.current);
  };

  const handleCodeRun = (code) => {
    setIsRunning(true);
    setTxRxActive(true);
    setTimeout(() => setTxRxActive(false), 800);

    setTimeout(() => {
      if (code.includes('digitalWrite(13, HIGH)')) {
        let state = false;
        simulationRef.current = setInterval(() => {
          state = !state;
          setLedState(state);
        }, 1000);
      }
    }, 1000);
  };

  const digitalPinsGroup1 = ['SCL', 'SDA', 'AREF', 'GND', '13', '12', '11', '10', '9', '8'];
  const digitalPinsGroup2 = ['7', '6', '5', '4', '3', '2', 'TX', 'RX'];
  const powerLabels = ['IOREF', 'RESET', '3.3V', '5V', 'GND', 'GND', 'Vin'];
  const analogLabels = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

  const renderPinHeader = (pins, prefix) => (
    <div
      style={{
        display: 'flex',
        background: '#111',
        borderRadius: '2px',
        boxShadow: '0 2px 0 #000'
      }}
    >
      {pins.map((label, i) => (
        <div
          key={`${prefix}-${label}-${i}`}
          style={{
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: i !== pins.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            position: 'relative'
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              transition: 'all 0.3s ease',
              background: label === '13' && ledState ? '#fbbf24' : '#27272a',
              boxShadow: label === '13' && ledState ? '0 0 12px #fbbf24' : 'inset 0 0 4px rgba(0,0,0,0.5)'
            }}
          />
        </div>
      ))}
    </div>
  );

  const renderLabels = (pins, offset = "8px", prefix = "lbl") => (
    <div style={{ display: 'flex' }}>
      {pins.map((label, i) => (
        <div key={`${prefix}-${label}-${i}`} style={{ width: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '7px',
              fontWeight: 'bold',
              color: 'white',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              transform: `rotate(270deg) translateX(${offset})`,
              filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))'
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        overflow: 'hidden'
      }}
    >
      <div style={{ width: '100%', maxWidth: '1100px', boxSizing: 'border-box' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '1.5rem',
            alignItems: 'stretch',
            width: '100%',
            minHeight: '400px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CodeEditor onRun={handleCodeRun} onStop={handleStop} isRunning={isRunning} />
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              perspective: '1200px'
            }}
          >
            <div
              style={{
                background: '#1e293b',
                borderRadius: '24px',
                padding: '1.5rem',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                width: '100%',
                minHeight: '380px',
                boxSizing: 'border-box',
                overflowX: 'auto',
                overflowY: 'hidden'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1.5rem',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  transition: 'all 0.3s ease',
                  zIndex: 50,
                  background: isRunning ? 'rgba(16,185,129,0.2)' : 'rgba(30,41,59,0.8)',
                  color: isRunning ? '#34d399' : '#64748b',
                  border: isRunning ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(51,65,85,1)',
                  animation: isRunning ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                }}
              >
                {isRunning ? 'EJECUTANDO' : 'LISTO'}
              </div>

                <div
                  style={{
                    position: 'relative',
                    transform: 'scale(0.95)',
                    transition: 'transform 0.7s ease'
                  }}
                >
                  {/* Sombra suave (sin perspectiva) */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.3)',
                      filter: 'blur(15px)',
                      borderRadius: '12px',
                      scale: '0.98',
                      top: '10px'
                    }}
                  />

                <div
                  style={{
                    width: '340px',
                    height: '240px',
                    background: '#008184',
                    borderRadius: '12px',
                    position: 'relative',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
                    borderBottom: '6px solid #134e4a',
                    borderRight: '4px solid #134e4a',
                    overflow: 'visible',
                    flexShrink: 0
                  }}
                >
                  {/* Puerto USB */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-25px',
                      top: '40px',
                      width: '45px',
                      height: '56px',
                      background: 'linear-gradient(to right, #94a3b8, #e2e8f0)',
                      borderRadius: '2px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                      borderBottom: '4px solid #64748b',
                      transform: 'translateZ(20px)'
                    }}
                  />

                  {/* Jack de Alimentación */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-20px',
                      bottom: '30px',
                      width: '50px',
                      height: '48px',
                      background: 'linear-gradient(to bottom, #333, #000)',
                      borderRadius: '4px',
                      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                      borderBottom: '4px solid #000',
                      transform: 'translateZ(15px)'
                    }}
                  />

                  {/* LED L */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '52px',
                      left: '95px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transform: 'translateZ(5px)'
                    }}
                  >
                    <div
                      style={{
                        width: '10px',
                        height: '6px',
                        borderRadius: '2px',
                        transition: 'all 0.15s ease',
                        background: ledState ? '#fbbf24' : '#134e4a',
                        boxShadow: ledState ? '0 0 12px #fbbf24' : 'none'
                      }}
                    />
                    <span style={{ fontSize: '6px', color: 'white', fontWeight: 'bold' }}>L</span>
                  </div>

                  {/* Bloque TX / RX */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '84px',
                      left: '95px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transform: 'translateZ(5px)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '10px',
                          height: '6px',
                          borderRadius: '2px',
                          transition: 'all 75ms ease',
                          background: txRxActive ? '#fbbf24' : '#134e4a',
                          boxShadow: txRxActive ? '0 0 8px #fbbf24' : 'none'
                        }}
                      />
                      <span style={{ fontSize: '5px', color: 'white', fontWeight: 'bold' }}>TX</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '10px',
                          height: '6px',
                          borderRadius: '2px',
                          transition: 'all 75ms ease',
                          background: txRxActive ? '#fbbf24' : '#134e4a',
                          boxShadow: txRxActive ? '0 0 8px #fbbf24' : 'none'
                        }}
                      />
                      <span style={{ fontSize: '5px', color: 'white', fontWeight: 'bold' }}>RX</span>
                    </div>
                  </div>

                  {/* LED ON */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '58px',
                      right: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transform: 'translateZ(5px)'
                    }}
                  >
                    <span style={{ fontSize: '6px', color: 'white', fontWeight: 'bold', textTransform: 'uppercase' }}>On</span>
                    <div
                      style={{
                        width: '10px',
                        height: '6px',
                        borderRadius: '2px',
                        background: '#34d399',
                        boxShadow: '0 0 10px #34d399'
                      }}
                    />
                  </div>

                  {/* ICSP Header */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '5px',
                      top: '95px',
                      width: '32px',
                      height: '40px',
                      background: '#111',
                      borderRadius: '2px',
                      padding: '4px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                      justifyContent: 'center',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                      border: '1px solid #000',
                      transform: 'translateZ(10px)',
                      boxSizing: 'border-box'
                    }}
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={`icsp-${i}`}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#27272a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div style={{ width: '4px', height: '4px', background: 'rgba(202,138,4,0.3)', borderRadius: '50%' }} />
                      </div>
                    ))}
                    <div style={{ position: 'absolute', bottom: '-16px', fontSize: '5px', color: 'white', fontWeight: 'bold' }}>ICSP</div>
                  </div>

                  {/* Headers Superiores */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '32px',
                      right: '10px',
                      display: 'flex',
                      pointerEvents: 'none',
                      gap: '8px'
                    }}
                  >
                    {renderLabels(digitalPinsGroup1, "8px", "dig1")}
                    {renderLabels(digitalPinsGroup2, "8px", "dig2")}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '10px',
                      display: 'flex',
                      gap: '8px',
                      transform: 'translateZ(10px)'
                    }}
                  >
                    {renderPinHeader(digitalPinsGroup1, "top1")}
                    {renderPinHeader(digitalPinsGroup2, "top2")}
                  </div>

                  {/* MICRO ATMEGA 328P */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '45px',
                      bottom: '50px',
                      width: '140px',
                      height: '35px',
                      background: 'linear-gradient(to bottom, #222, #111)',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                      transform: 'translateZ(12px)'
                    }}
                  >
                    <div style={{ position: 'absolute', top: '50%', left: '8px', width: '8px', height: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', transform: 'translateY(-50%)' }} />
                    <span style={{ fontSize: '8px', color: '#94a3b8', fontWeight: 900, letterSpacing: '0.15em', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                      ATMEL ATMEGA328P
                    </span>

                    {/* Pines metálicos inferiores */}
                    <div style={{ position: 'absolute', bottom: '-6px', width: '100%', display: 'flex', justifyContent: 'space-around', padding: '0 8px' }}>
                      {Array.from({ length: 14 }).map((_, i) => (
                        <div key={`pin-b-${i}`} style={{ width: '2px', height: '6px', background: 'linear-gradient(to bottom, #cbd5e1, #64748b)', borderRadius: '0 0 2px 2px' }} />
                      ))}
                    </div>
                    {/* Pines metálicos superiores */}
                    <div style={{ position: 'absolute', top: '-6px', width: '100%', display: 'flex', justifyContent: 'space-around', padding: '0 8px' }}>
                      {Array.from({ length: 14 }).map((_, i) => (
                        <div key={`pin-t-${i}`} style={{ width: '2px', height: '6px', background: 'linear-gradient(to top, #cbd5e1, #64748b)', borderRadius: '2px 2px 0 0' }} />
                      ))}
                    </div>
                  </div>

                  {/* Headers Inferiores */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '34px',
                      right: '10px',
                      display: 'flex',
                      gap: '12px',
                      pointerEvents: 'none'
                    }}
                  >
                    {renderLabels(powerLabels, "-14px", "pwr")}
                    {renderLabels(analogLabels, "-14px", "ana")}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '10px',
                      display: 'flex',
                      gap: '12px',
                      transform: 'translateZ(10px)'
                    }}
                  >
                    <div style={{ display: 'flex', background: '#111', borderRadius: '2px', boxShadow: '0 2px 0 #000' }}>
                      {powerLabels.map((l, i) => (
                        <div key={`p-${i}`} style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ width: '6px', height: '6px', background: '#27272a', borderRadius: '50%' }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', background: '#111', borderRadius: '2px', boxShadow: '0 2px 0 #000' }}>
                      {analogLabels.map((l, i) => (
                        <div key={`a-${i}`} style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ width: '6px', height: '6px', background: '#27272a', borderRadius: '50%' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default ArduinoSimulatorV2;
