'use client';



import React, { useState, useEffect, useCallback, useRef } from 'react';

import { Check, ArrowRight, Zap, Monitor, RefreshCcw, Terminal, ChevronDown, Activity, Plug, RotateCcw, Lightbulb } from 'lucide-react';



const PIEZAS = {

  PINMODE_13_OUTPUT: { id: 'PINMODE_13_OUTPUT', text: 'pinMode(13, OUTPUT);' },

  DIGITALWRITE_13_HIGH: { id: 'DIGITALWRITE_13_HIGH', text: 'digitalWrite(13, HIGH);' },

  DIGITALWRITE_13_LOW: { id: 'DIGITALWRITE_13_LOW', text: 'digitalWrite(13, LOW);' },

  DELAY_1000: { id: 'DELAY_1000', text: 'delay(1000);' },

  PINMODE_12_OUTPUT: { id: 'PINMODE_12_OUTPUT', text: 'pinMode(12, OUTPUT);' },

  DIGITALWRITE_12_HIGH: { id: 'DIGITALWRITE_12_HIGH', text: 'digitalWrite(12, HIGH);' },

  DIGITALWRITE_12_LOW: { id: 'DIGITALWRITE_12_LOW', text: 'digitalWrite(12, LOW);' },

  DELAY_300: { id: 'DELAY_300', text: 'delay(300);' },

};



const ALL_AVAILABLE_PIEZAS = Object.values(PIEZAS);



const ARDUINO_COLORS = {
  types: '#4dd0e1',       // Cyan
  numbers: '#4dd0e1',     // Cyan
  functions: '#fac863',   // Naranja
  classes: '#fac863',    // Naranja
  constants: '#ffffff',       // Blanco
  directives: '#d85c8b',   // Rosa
  library: '#4dd0e1',      // Cyan
  comments: '#475569',    // Gris pizarra
  string: '#4dd0e1',      // Cyan
  general: '#94a3b8',     // Slate-400
};

const VALID_ARDUINO_FUNCTIONS = ['setup', 'loop', 'pinMode', 'digitalWrite', 'digitalRead', 'analogRead', 'analogWrite', 'delay', 'delayMicroseconds', 'millis', 'micros', 'begin', 'print', 'println', 'available', 'read', 'write', 'attach'];
const VALID_ARDUINO_CLASSES = ['Serial', 'Servo', 'LiquidCrystal', 'Wire', 'Ethernet', 'SD', 'String', 'SoftwareSerial'];
const STRICT_LOWERCASE = ['void', 'int', 'float', 'char', 'long', 'bool', 'if', 'else', 'for', 'while', 'switch', 'return', 'break'];

const HighlightedCode = ({ code }) => {
  if (!code || typeof code !== 'string') return null;
  const parts = code.split(/(\/\/.*|".*?"|#\w+|<[^>]+>|\w+\.|\.\w+|[(){}[\];,]|\d+|\w+)/g);
  return (
    <div style={{ pointerEvents: 'none', whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'monospace', fontSize: '13px', lineHeight: '24px' }}>
      {parts.map((part, j) => {
        if (!part) return null;
        if (part.startsWith('//')) return <span key={j} style={{ color: ARDUINO_COLORS.comments }}>{part}</span>;
        if (part.startsWith('"') && part.endsWith('"')) return <span key={j} style={{ color: ARDUINO_COLORS.string }}>{part}</span>;
        if (part.startsWith('#')) return <span key={j} style={{ color: ARDUINO_COLORS.directives }}>{part}</span>;
        if (part.startsWith('<') && part.endsWith('>')) return <span key={j} style={{ color: ARDUINO_COLORS.library }}>{part}</span>;
        if (VALID_ARDUINO_CLASSES.includes(part)) return <span key={j} style={{ color: ARDUINO_COLORS.classes }}>{part}</span>;
        if (VALID_ARDUINO_FUNCTIONS.includes(part)) return <span key={j} style={{ color: ARDUINO_COLORS.functions }}>{part}</span>;
        if (STRICT_LOWERCASE.includes(part)) return <span key={j} style={{ color: ARDUINO_COLORS.types }}>{part}</span>;
        if (/^\d+$/.test(part)) return <span key={j} style={{ color: ARDUINO_COLORS.numbers }}>{part}</span>;
        if (/^(HIGH|LOW|OUTPUT|INPUT)$/.test(part) || /^[(){}[\];,]$/.test(part)) return <span key={j} style={{ color: ARDUINO_COLORS.constants }}>{part}</span>;
        return <span key={j} style={{ color: ARDUINO_COLORS.general }}>{part}</span>;
      })}
    </div>
  );
};

const challenges = [

  {

    title: 'Misión 1: Prender LED',

    type: 'drag',

    goal: 'Arrastra el bloque correcto para configurar el pin 13 como salida y enviar señal HIGH para prender el LED.',

    expected: {

      setup: ['PINMODE_13_OUTPUT'],

      loop: ['DIGITALWRITE_13_HIGH'],

    },

    piezas: ALL_AVAILABLE_PIEZAS,

    ledCount: 1

  },

  {

    title: 'Misión 2: Código LED',

    type: 'write',

    goal: 'Configura el pin 13 como salida para que el LED pueda recibir energía.',
    hint: 'Usa pinMode(numeroPin, MODO); dentro del bloque setup.',
    expected: {

      setup: 'pinMode(13, OUTPUT);',

      loop: 'digitalWrite(13, HIGH);'

    },

    ledCount: 1

  },

  {

    title: 'Misión 3: Parpadeo',

    type: 'drag',

    goal: 'Arrastra los bloques para hacer parpadear el LED: Prender -> Esperar -> Apagar -> Esperar.',

    expected: {

      setup: ['PINMODE_13_OUTPUT'],

      loop: ['DIGITALWRITE_13_HIGH', 'DELAY_1000', 'DIGITALWRITE_13_LOW', 'DELAY_1000'],

    },

    piezas: ALL_AVAILABLE_PIEZAS,

    ledCount: 1

  },

  {

    title: 'Misión 4: Código Parpadeo',

    type: 'write',

    goal: 'Haz que el LED del pin 13 parpadee con intervalos de 1 segundo.',
    hint: 'Necesitas prender el LED, esperar, apagarlo y volver a esperar.',
    expected: {

      setup: 'pinMode(13, OUTPUT);',

      loop: 'digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000);'

    },

    ledCount: 1

  },

  {

    title: 'Misión 5: Sirena Policial',

    type: 'drag',

    goal: 'Arrastra los bloques para crear una secuencia de luces de sirena (Rojo y Azul alternando).',

    expected: {

      setup: ['PINMODE_13_OUTPUT', 'PINMODE_12_OUTPUT'],

      loop: ['DIGITALWRITE_13_HIGH', 'DIGITALWRITE_12_LOW', 'DELAY_300', 'DIGITALWRITE_13_LOW', 'DIGITALWRITE_12_HIGH', 'DELAY_300'],

    },

    piezas: ALL_AVAILABLE_PIEZAS,

    ledCount: 2

  },

  {

    title: 'Misión 6: Código Sirena',

    type: 'write',

    goal: 'Crea una sirena policial alternando los pines 13 (rojo) y 12 (azul).',
    hint: 'Mientras uno está en HIGH, el otro debe estar en LOW.',
    expected: {

      setup: 'pinMode(13, OUTPUT); pinMode(12, OUTPUT);',

      loop: 'digitalWrite(13, HIGH); digitalWrite(12, LOW); delay(300); digitalWrite(13, LOW); digitalWrite(12, HIGH); delay(300);'

    },

    ledCount: 2

  },

];



const LED = ({ color, isOn, label }) => {

  const themes = {

    red: { on: '#ef4444', off: '#7f1d1d', glow: 'rgba(239, 68, 68, 0.5)' },

    blue: { on: '#3b82f6', off: '#1e3a5f', glow: 'rgba(59, 130, 246, 0.5)' }

  };

  const theme = themes[color] || themes.red;



  return (

    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>

      <div style={{ position: 'relative' }}>

        {isOn && (

          <div style={{ position: 'absolute', inset: '-24px', borderRadius: '50%', filter: 'blur(16px)', background: theme.glow, animation: 'pulse 1s infinite' }} />

        )}

        <svg width="48" height="72" viewBox="0 0 60 90" style={{ position: 'relative', zIndex: 10, filter: isOn ? `drop-shadow(0 0 10px ${theme.on})` : 'none' }}>

          <rect x="26" y="65" width="2" height="20" fill="#4a5568" />

          <rect x="32" y="65" width="2" height="15" fill="#2d3748" />

          <rect x="15" y="60" width="30" height="6" rx="1" fill="#1a202c" />

          <rect x="15" y="60" width="30" height="2" fill="#2d3748" />

          <path d="M15 60 V45 C15 25 45 25 45 45 V60 H15Z" fill={isOn ? theme.on : theme.off} />

          <path d="M22 35 C22 30 28 30 32 35" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.2" />

        </svg>

      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', marginBottom: '2px' }}>

          {label.split(' - ')[0]}

        </span>

        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#818cf8' }}>{label.split(' - ')[1]}</span>

      </div>

    </div>

  );

};



const ArduinoExercisesSimulator = ({ initialChallengeId = 0, onClose }) => {

  const [currentId, setCurrentId] = useState(initialChallengeId);

  const [setupSlots, setSetupSlots] = useState([]);

  const [loopSlots, setLoopSlots] = useState([]);

  const [userCode, setUserCode] = useState({ setup: '', loop: '' });

  const [logs, setLogs] = useState(['> Sistema reiniciado.', '> Listo para programar.']);

  const [led13On, setLed13On] = useState(false);

  const [led12On, setLed12On] = useState(false);

  const [showHint, setShowHint] = useState(false);
  const [showHintSidebar, setShowHintSidebar] = useState(false);
  const terminalRef = useRef(null);
  const setupTextAreaRef = useRef(null);
  const loopTextAreaRef = useRef(null);



  const simInterval = useRef(null);

  const challenge = challenges[currentId] || challenges[0];



  // Auto-scroll terminal when logs change

  useEffect(() => {

    if (terminalRef.current) {

      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;

    }

  }, [logs]);

  // Auto-resize textareas based on content
  const adjustHeight = (ref) => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight(setupTextAreaRef);
  }, [userCode.setup]);

  useEffect(() => {
    adjustHeight(loopTextAreaRef);
  }, [userCode.loop]);

  // Handle Tab key in code editor
  const handleKeyDown = (e, field) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);

      setUserCode(prev => ({ ...prev, [field]: newValue }));

      // Reset cursor position after state update
      setTimeout(() => {
        if (e.target) {
          e.target.selectionStart = e.target.selectionEnd = start + 2;
        }
      }, 0);
    }
  };



  const stopSim = useCallback(() => {

    if (simInterval.current) clearInterval(simInterval.current);

    simInterval.current = null;

    setLed13On(false);

    setLed12On(false);

  }, []);



  const loadChallenge = useCallback((id) => {
    const newChallenge = challenges[id];
    if (!newChallenge) return;

    stopSim();
    setCurrentId(id);

    if (newChallenge.type === 'drag') {
      setSetupSlots(new Array(newChallenge.expected?.setup?.length || 0).fill(null));
      setLoopSlots(new Array(newChallenge.expected?.loop?.length || 0).fill(null));
    } else {
      setSetupSlots([]);
      setLoopSlots([]);
      setUserCode({ setup: '', loop: '' });
    }

    setLogs(['> Sistema reiniciado.', `> Reto: ${newChallenge.title}`]);
    setShowHint(false);
    setShowHintSidebar(false);
  }, [stopSim]);



  useEffect(() => {
    loadChallenge(initialChallengeId);
  }, [initialChallengeId, loadChallenge]);



  const handleDrop = (e, area, index) => {

    if (challenge?.type !== 'drag') return;

    const piece = JSON.parse(e.dataTransfer.getData('piece'));

    if (area === 'setup') {

      const newSlots = [...setupSlots];

      newSlots[index] = piece.id;

      setSetupSlots(newSlots);

    } else {

      const newSlots = [...loopSlots];

      newSlots[index] = piece.id;

      setLoopSlots(newSlots);

    }

  }



  const runHardwareSim = (loopInstructions) => {

    stopSim();

    if (loopInstructions.length === 0) return;

    let stepIdx = 0;

    const execute = () => {

      const inst = loopInstructions[stepIdx];

      let waitTime = 50;

      if (inst.includes("digitalWrite")) {

        const pin = inst.includes("13") ? "13" : "12";

        const isHigh = inst.includes("HIGH");

        if (pin === "13") setLed13On(isHigh);

        if (pin === "12") setLed12On(isHigh);

      } else if (inst.includes("delay")) {

        const match = inst.match(/\d+/);

        if (match) waitTime = parseInt(match[0], 10);

      }

      stepIdx = (stepIdx + 1) % loopInstructions.length;

      simInterval.current = setTimeout(execute, waitTime);

    }

    execute();

  };



  const verifyDragCode = () => {

    const setupCorrect = setupSlots.every((s, i) => s === challenge.expected.setup[i]);

    const loopCorrect = loopSlots.every((s, i) => s === challenge.expected.loop[i]);

    return setupCorrect && loopCorrect;

  };



  const verifyWriteCode = () => {

    const code = (userCode.setup + ' ' + userCode.loop).toLowerCase();



    // Check for the essential commands regardless of format

    const hasPinMode13 = code.includes('pinmode') && code.includes('13') && code.includes('output');

    const hasPinMode12 = code.includes('pinmode') && code.includes('12') && code.includes('output');

    const hasDigitalWriteHigh = code.includes('digitalwrite') && code.includes('high');

    const hasDigitalWriteLow = code.includes('digitalwrite') && code.includes('low');

    const hasDelay300 = code.includes('delay') && code.includes('300');



    // Mission specific checks based on ledCount

    if (challenge.ledCount === 2) {

      // For siren (2 LEDs): need both pins in setup and alternating pattern with 300ms delay

      const setupOk = hasPinMode13 && hasPinMode12;

      const loopOk = hasDigitalWriteHigh && hasDigitalWriteLow && hasDelay300;

      return setupOk && loopOk;

    } else {

      // For single LED: basic check

      const setupOk = hasPinMode13;

      const loopOk = hasDigitalWriteHigh;

      return setupOk && loopOk;

    }

  };



  const handleVerify = () => {

    stopSim();

    setLogs(prev => [...prev.slice(-10), '> Compilando...']);

    setTimeout(() => {

      const success = challenge?.type === 'drag' ? verifyDragCode() : verifyWriteCode();

      if (success) {

        setLogs(prev => [...prev.slice(-10), '> Compilación exitosa!', '> Código correto.']);

      } else {

        setLogs(prev => [...prev.slice(-10), '> ERROR: Revisa la lógica del código.']);

      }

    }, 500);

  }



  const handleUpload = () => {

    stopSim();

    setLogs(prev => [...prev.slice(-10), '> Compilando...']);

    setTimeout(() => {

      const success = challenge?.type === 'drag' ? verifyDragCode() : verifyWriteCode();

      if (success) {

        let simLoopInstructions = [];

        if (challenge?.type === 'drag') {

          simLoopInstructions = (challenge.expected.loop || []).map(id => PIEZAS[id]?.text);

        } else {

          simLoopInstructions = userCode.loop.split(';').map(s => s.trim()).filter(s => s);

        }

        setLogs(prev => [...prev.slice(-10), '> Compilación exitosa!', '> Subiendo a Arduino...', '> ¡ÉXITO! Subido y ejecutando.']);

        runHardwareSim(simLoopInstructions);

      } else {

        setLogs(prev => [...prev.slice(-10), '> ERROR: No se puede subir código con errores.']);

      }

    }, 500);

  }



  const resetChallenge = () => loadChallenge(currentId);



  return (

    <div style={{ width: '100%', height: '100%', background: '#161625', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <div style={{ flex: 1, display: 'flex', gap: '20px', padding: '20px', overflow: 'hidden' }}>



        {/* Left Sidebar */}

        <div style={{ width: '24%', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div style={{ background: '#1c1c2e', borderRadius: '12px', border: '2px solid #334155', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '8px', borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <Zap size={14} color="#818cf8" />
                <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#818cf8' }}>Objetivo</span>
              </div>
              <div
                onClick={() => setShowHintSidebar(!showHintSidebar)}
                title="Ver Clave"
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: showHintSidebar ? 'rgba(250, 200, 99, 0.4)' : 'rgba(250, 200, 99, 0.15)',
                  border: '1px solid #fac863',
                  boxShadow: showHintSidebar ? '0 0 15px rgba(250, 200, 99, 0.3)' : '0 0 10px rgba(250, 200, 99, 0.1)',
                  transition: 'all 0.2s'
                }}
              >
                <Lightbulb size={16} color={showHintSidebar ? '#fff' : '#fac863'} fill={showHintSidebar ? '#fac863' : 'transparent'} />
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.4)', position: 'relative' }}>
              <p style={{ fontSize: '11px', fontStyle: 'italic', lineHeight: 1.6, color: '#94a3b8', borderLeft: '2px solid #6366f1', paddingLeft: '12px' }}>
                "{challenge?.goal}"
              </p>

              {showHintSidebar && challenge?.hint && (
                <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(250, 200, 99, 0.05)', border: '1px dotted #fac863', borderRadius: '4px' }}>
                  <p style={{ fontSize: '10px', color: '#fac863', fontWeight: 'bold', marginBottom: '4px' }}>💡 CLAVE:</p>
                  <p style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: '1.4' }}>{challenge?.hint}</p>
                </div>
              )}
            </div>

          </div>



          <div style={{ background: '#1c1c2e', borderRadius: '12px', border: '2px solid #334155', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '8px', borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }}>

              <Monitor size={14} color="#34d399" />

              <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#34d399' }}>Hardware</span>

            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', padding: '32px', background: 'rgba(0,0,0,0.4)', position: 'relative' }}>

              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#ffffff05 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />

              <LED color="red" isOn={led13On} label="LED ROJO - PIN 13" />

              {challenge?.ledCount > 1 && (

                <>

                  <div style={{ width: '50%', height: '1px', background: 'linear-gradient(to right, transparent, #334155, transparent)' }} />

                  <LED color="blue" isOn={led12On} label="LED AZUL - PIN 12" />

                </>

              )}

            </div>

          </div>

        </div>



        {/* Center - Editor */}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a0f', borderRadius: '12px', border: '2px solid #334155', position: 'relative', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: '#1c1c2e', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #334155', borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }}>

            <div style={{ display: 'flex', gap: '8px' }}>

              <button onClick={handleVerify} title="Verificar Código" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#00979c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>

                <Check size={20} strokeWidth={3} />

              </button>

              <button onClick={handleUpload} title="Subir y Ejecutar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#00979c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>

                <ArrowRight size={20} strokeWidth={3} />

              </button>

            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#252542', borderRadius: '8px', border: '1px solid #334155', fontSize: '11px', fontWeight: 700, color: '#e2e8f0' }}>

              <Plug size={14} color="#00979c" />Arduino Uno

            </div>

            <div style={{ flex: 1 }}></div>

            <Activity size={18} color="#818cf8" style={{ animation: 'pulse 2s infinite' }} />

          </div>



          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

            <div style={{ width: '48px', background: '#0d0d1a', borderRight: '1px solid #1e293b', paddingTop: '16px', fontSize: '11px', fontFamily: 'monospace', color: '#475569', display: 'flex', flexDirection: 'column', userSelect: 'none' }}>
              {Array.from({ length: 100 }, (_, i) => i + 1).map(num => (
                <div key={num} style={{ height: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', lineHeight: '24px', fontSize: '13px' }}>{num}</div>
              ))}
            </div>

            <div style={{ flex: 1, padding: '16px', fontFamily: 'monospace', fontSize: '13px', overflowY: 'auto', background: 'url(https://www.transparenttextures.com/patterns/carbon-fibre.png)', backgroundSize: 'cover', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.95 }}></div>

              {challenge?.type === 'drag' ? (
                <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                  <div style={{ height: '24px', display: 'flex', alignItems: 'flex-start', lineHeight: '24px' }}><span style={{ color: '#94a3b8', fontStyle: 'italic', opacity: 0.4 }}>Configuración inicial</span></div>
                  <div style={{ height: '24px', display: 'flex', alignItems: 'flex-start', lineHeight: '24px' }}><span style={{ color: '#d85c8b' }}>void</span>&nbsp;<span style={{ color: '#fac863' }}>setup</span>() {'{'}</div>
                  {setupSlots.map((slot, i) => (
                    <div key={`setup-${i}`} style={{ height: '24px', display: 'flex', alignItems: 'flex-start', paddingTop: '2px', paddingLeft: '32px' }}>
                      <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'setup', i)} style={{ height: '20px', width: '100%', maxWidth: '320px', borderRadius: '6px', border: slot ? '1px solid #00979c' : '1px dashed #475569', display: 'flex', alignItems: 'center', padding: '0 12px', background: slot ? '#1c1c2e' : 'rgba(255,255,255,0.03)', color: slot ? '#4dd0e1' : '#64748b', fontSize: '11px', cursor: 'pointer', fontStyle: slot ? 'normal' : 'italic' }}>
                        {slot ? PIEZAS[slot]?.text : `Inserta pieza aquí`}
                      </div>
                    </div>
                  ))}
                  <div style={{ height: '24px', display: 'flex', alignItems: 'flex-start', lineHeight: '24px' }}>{'}'}</div>
                  <div style={{ height: '24px' }}></div>
                  <div style={{ height: '24px', display: 'flex', alignItems: 'flex-start', lineHeight: '24px' }}><span style={{ color: '#94a3b8', fontStyle: 'italic', opacity: 0.4 }}>Bucle principal</span></div>
                  <div style={{ height: '24px', display: 'flex', alignItems: 'flex-start', lineHeight: '24px' }}><span style={{ color: '#d85c8b' }}>void</span>&nbsp;<span style={{ color: '#fac863' }}>loop</span>() {'{'}</div>
                  {loopSlots.map((slot, i) => (
                    <div key={`loop-${i}`} style={{ height: '24px', display: 'flex', alignItems: 'flex-start', paddingTop: '2px', paddingLeft: '32px' }}>
                      <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'loop', i)} style={{ height: '20px', width: '100%', maxWidth: '320px', borderRadius: '6px', border: slot ? '1px solid #00979c' : '1px dashed #475569', display: 'flex', alignItems: 'center', padding: '0 12px', background: slot ? '#1c1c2e' : 'rgba(255,255,255,0.03)', color: slot ? '#4dd0e1' : '#64748b', fontSize: '11px', cursor: 'pointer', fontStyle: slot ? 'normal' : 'italic' }}>
                        {slot ? PIEZAS[slot]?.text : `Inserta pieza aquí`}
                      </div>
                    </div>
                  ))}
                  <div style={{ height: '24px', display: 'flex', alignItems: 'flex-start', lineHeight: '24px' }}>{'}'}</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                  <div style={{ height: '24px', display: 'flex', alignItems: 'flex-start', lineHeight: '24px' }}><span style={{ color: '#94a3b8', fontStyle: 'italic', opacity: 0.4 }}>Configuración inicial</span></div>
                  <div style={{ height: '24px', display: 'flex', alignItems: 'flex-start', lineHeight: '24px' }}><span style={{ color: '#d85c8b' }}>void</span>&nbsp;<span style={{ color: '#fac863' }}>setup</span>() {'{'}</div>
                  <div style={{ minHeight: '24px', position: 'relative', paddingLeft: '32px' }}>
                    <div style={{ position: 'absolute', top: 0, left: '32px', right: 0, bottom: 0, zIndex: 1 }}>
                      <HighlightedCode code={userCode.setup} />
                    </div>
                    <textarea
                      ref={setupTextAreaRef}
                      value={userCode.setup}
                      onChange={(e) => setUserCode({ ...userCode, setup: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, 'setup')}
                      placeholder="// Escribe la configuración de pines aquí..."
                      spellCheck={false}
                      rows={1}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: 'transparent',
                        caretColor: '#fff',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        resize: 'none',
                        outline: 'none',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        overflow: 'hidden',
                        padding: '0',
                        lineHeight: '24px',
                        position: 'relative',
                        zIndex: 2
                      }}
                    />
                  </div>
                  <div style={{ height: '24px', display: 'flex', alignItems: 'flex-start', lineHeight: '24px' }}>{'}'}</div>
                  <div style={{ height: '24px' }}></div>
                  <div style={{ height: '24px', display: 'flex', alignItems: 'flex-start', lineHeight: '24px' }}><span style={{ color: '#94a3b8', fontStyle: 'italic', opacity: 0.4 }}>Bucle principal</span></div>
                  <div style={{ height: '24px', display: 'flex', alignItems: 'flex-start', lineHeight: '24px' }}><span style={{ color: '#d85c8b' }}>void</span>&nbsp;<span style={{ color: '#fac863' }}>loop</span>() {'{'}</div>
                  <div style={{ minHeight: '24px', position: 'relative', paddingLeft: '32px' }}>
                    <div style={{ position: 'absolute', top: 0, left: '32px', right: 0, bottom: 0, zIndex: 1 }}>
                      <HighlightedCode code={userCode.loop} />
                    </div>
                    <textarea
                      ref={loopTextAreaRef}
                      value={userCode.loop}
                      onChange={(e) => setUserCode({ ...userCode, loop: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, 'loop')}
                      placeholder="// Escribe el comportamiento repetitivo aquí..."
                      spellCheck={false}
                      rows={1}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: 'transparent',
                        caretColor: '#fff',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        resize: 'none',
                        outline: 'none',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        overflow: 'hidden',
                        padding: '0',
                        lineHeight: '24px',
                        position: 'relative',
                        zIndex: 2
                      }}
                    />
                  </div>
                  <div style={{ height: '24px', display: 'flex', alignItems: 'flex-start', lineHeight: '24px' }}>{'}'}</div>



                  {challenge?.type === 'write' && (
                    <div style={{ marginTop: '20px' }}>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>



          <div style={{ height: '128px', background: '#0f0f1a', borderTop: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>

            <div style={{ padding: '8px 20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '8px', background: '#1c1c2e' }}>

              <Terminal size={12} color="#64748b" />

              <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>TERMINAL DE SALIDA</span>

            </div>

            <div ref={terminalRef} style={{ padding: '16px', fontFamily: 'monospace', fontSize: '11px', overflowY: 'auto', flex: 1 }}>

              {logs.map((log, i) => (

                <div key={i} style={{ color: '#94a3b8', display: 'flex', gap: '12px', marginBottom: '4px' }}>

                  <span style={{ opacity: 0.3, width: '60px', textAlign: 'right' }}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>

                  <span>{log}</span>

                </div>

              ))}

            </div>

          </div>

        </div>



        {/* Right Sidebar - Piezas (Solo para modo drag) */}

        {challenge?.type === 'drag' && (

          <div style={{ width: '26%', display: 'flex', flexDirection: 'column', background: '#1c1c2e', borderRadius: '12px', border: '2px solid #334155', overflow: 'hidden' }}>

            <div style={{ padding: '16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '8px' }}>

              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 8px rgba(99,102,241,0.5)' }}></div>

              <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#818cf8' }}>Piezas Disponibles</span>

            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1 }}>

              {challenge?.piezas?.map(piece => (

                <div key={piece.id} draggable onDragStart={(e) => e.dataTransfer.setData('piece', JSON.stringify(piece))} style={{ padding: '12px', background: '#1c1c2e', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', color: '#cbd5e1', cursor: 'grab', borderLeft: '4px solid #818cf8', transition: 'all 0.2s' }}>

                  {piece.text}

                </div>

              ))}

            </div>

          </div>

        )}

      </div>



      {/* Footer */}

      <div style={{ background: '#1c1c2e', padding: '12px 32px', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', display: 'flex', gap: '24px' }}>

          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399' }}>

            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }}></div>

            CONECTADO: ARDUINO UNO

          </span>

        </div>

        <div style={{ display: 'flex', gap: '16px' }}>

          <button onClick={resetChallenge} style={{ padding: '8px 20px', borderRadius: '8px', background: '#334155', color: '#e2e8f0', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>

            <RotateCcw size={14} /> Reiniciar

          </button>

          {onClose && <button onClick={onClose} style={{ padding: '8px 32px', borderRadius: '8px', background: '#6366f1', color: 'white', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>Cerrar</button>}

        </div>

      </div>

    </div>

  );

};



export default ArduinoExercisesSimulator;

