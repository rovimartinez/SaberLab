'use client';



import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../../../context/useAuth';
import { createMissionAttempt, updateMissionAttempt } from '../../../lib/learningAnalytics';
import { ensureStudentProfile, upsertMissionProgress } from '../../../lib/studentProgress';

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

const HighlightedCode = ({ code, errorLines = [], lineOffset = 0 }) => {
  if (typeof code !== 'string') return null;

  const renderHighlightedLine = (line, lineIndex) => {
    const parts = line.split(/(\/\/.*|".*?"|#\w+|<[^>]+>|\w+\.|\.\w+|[(){}[\];,]|\d+|\w+)/g);
    const hasError = errorLines.includes(lineIndex + 1);

    return (
      <div
        key={`line-${lineIndex}`}
        style={{
          minHeight: '24px',
          width: '100%',
          lineHeight: '24px',
          background: hasError ? 'rgba(239, 68, 68, 0.16)' : 'transparent',
          borderRadius: hasError ? '6px' : 0,
          paddingLeft: `${lineOffset}px`,
          boxSizing: 'border-box'
        }}
      >
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

  return (
    <div style={{ pointerEvents: 'none', whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'monospace', fontSize: '13px', lineHeight: '24px' }}>
      {(code || '').split('\n').map((line, index) => renderHighlightedLine(line, index))}
    </div>
  );
};

const legacyChallenges = [

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

    goal: 'Arrastra los bloques para hacer parpadear el LED: Prender -> Esperar aproximadamente un segundo -> Apagar -> Esperar aproximadamente un segundo.',

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

    goal: 'Haz que el LED del pin 13 parpadee con pausas de aproximadamente un segundo.',
    hint: 'Necesitas prender el LED, esperar un momento largo, apagarlo y volver a esperar el mismo tiempo.',
    expected: {

      setup: 'pinMode(13, OUTPUT);',

      loop: 'digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000);'

    },

    ledCount: 1

  },

  {

    title: 'Misión 5: Sirena Policial',

    type: 'drag',

    goal: 'Arrastra los bloques para crear una secuencia de luces de sirena (Rojo y Azul alternando) con cambios rápidos, de menos de un segundo.',

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
    hint: 'Mientras uno está en HIGH, el otro debe estar en LOW, y el cambio debe sentirse rápido: menos de un segundo.',
    expected: {

      setup: 'pinMode(13, OUTPUT); pinMode(12, OUTPUT);',

      loop: 'digitalWrite(13, HIGH); digitalWrite(12, LOW); delay(300); digitalWrite(13, LOW); digitalWrite(12, HIGH); delay(300);'

    },

    ledCount: 2

  },

];



const LED = ({ color, isOn, label }) => {

  const themes = {

    red: { main: '#ef4444', dark: '#5f1414', glow: 'rgba(239, 68, 68, 0.5)' },

    blue: { main: '#3b82f6', dark: '#102a52', glow: 'rgba(59, 130, 246, 0.5)' }

  };

  const theme = themes[color] || themes.red;



  return (

    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>

      <div style={{ position: 'relative', width: '180px', height: '172px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {isOn && (

          <div style={{ position: 'absolute', top: '2px', left: '18px', right: '18px', bottom: '22px', borderRadius: '999px', filter: 'blur(10px)', background: theme.glow, opacity: 0.3 }} />

        )}

        <svg width="180" height="172" viewBox="0 12 160 154" style={{ position: 'relative', zIndex: 10, filter: isOn ? `drop-shadow(0 0 8px ${theme.main})` : 'none' }}>

          <defs>
            <linearGradient id={`ledGrad-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={theme.dark} />
              <stop offset="50%" stopColor={theme.main} />
              <stop offset="100%" stopColor={theme.dark} />
            </linearGradient>
            <linearGradient id={`metal-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b949e" />
              <stop offset="50%" stopColor="#f0f6fc" />
              <stop offset="100%" stopColor="#484f58" />
            </linearGradient>
            <filter id={`ledGlow-${color}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feGaussianBlur stdDeviation="6" result="softBlur"/>
              <feMerge>
                <feMergeNode in="softBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <g opacity="0.9">
            <rect x="72" y="98" width="3" height="68" fill={`url(#metal-${color})`} rx="1" />
            <rect x="85" y="98" width="3" height="30" fill={`url(#metal-${color})`} rx="1" />
          </g>

          <g>
            <path
              d="M65,100 L65,62 A18,20 0 0,1 95,62 L95,100 Z"
              fill={isOn ? theme.main : `url(#ledGrad-${color})`}
              fillOpacity={isOn ? 1 : 0.58}
              filter={isOn ? `url(#ledGlow-${color})` : 'none'}
            />
            <g opacity={isOn ? 0 : 0.35}>
              <path d="M72,98 L72,78 L76,78 L76,98 Z" fill={theme.dark} />
              <path d="M85,98 L85,76 L80,76 L78,72 L88,72 L88,98 Z" fill={theme.dark} />
            </g>
            <rect x="63" y="100" width="34" height="5" rx="1.5" fill={isOn ? theme.main : `url(#ledGrad-${color})`} fillOpacity={isOn ? 1 : 0.72} />
            {!isOn && (
              <path d="M70,66 A10,10 0 0,1 80,58" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.2" />
            )}
          </g>

        </svg>

      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', marginBottom: '2px' }}>
          {label.split(' - ')[1]}
        </span>

      </div>

    </div>

  );

};



const ArduinoExercisesSimulator = ({ challengesData = [], initialChallengeId = 0, lessonKey, onClose }) => {
  const { user } = useAuth();

  const challenges = useMemo(() => {
    return (challengesData.length ? challengesData : legacyChallenges).map((challenge) => {
      if (challenge?.type !== 'drag') return challenge;

      return {
        ...challenge,
        piezas: challenge.piezas && challenge.piezas.length ? challenge.piezas : ALL_AVAILABLE_PIEZAS
      };
    });
  }, [challengesData]);

  const [currentId, setCurrentId] = useState(initialChallengeId);

  const [setupSlots, setSetupSlots] = useState([]);

  const [loopSlots, setLoopSlots] = useState([]);

  const [userCode, setUserCode] = useState({ setup: '', loop: '' });
  const [writeErrorLines, setWriteErrorLines] = useState({ setup: [], loop: [] });
  const [showWriteErrors, setShowWriteErrors] = useState(false);

  const [logs, setLogs] = useState(['> Sistema reiniciado.', '> Listo para programar.']);

  const [led13On, setLed13On] = useState(false);

  const [led12On, setLed12On] = useState(false);

  const [showHint, setShowHint] = useState(false);
  const [showHintSidebar, setShowHintSidebar] = useState(false);
  const terminalRef = useRef(null);
  const setupTextAreaRef = useRef(null);
  const loopTextAreaRef = useRef(null);
  const missionAttemptIdRef = useRef(null);
  const missionAttemptStartedAtRef = useRef(null);
  const missionAttemptStatusRef = useRef('idle');
  const missionAttemptNumberRef = useRef({});



  const simInterval = useRef(null);

  const challenge = challenges[currentId] || challenges[0];

  const getCodeSnapshot = useCallback(() => {
    if (challenge?.type === 'drag') {
      return JSON.stringify({
        type: 'drag',
        setupSlots,
        loopSlots
      });
    }

    return JSON.stringify({
      type: 'write',
      setup: userCode.setup,
      loop: userCode.loop
    });
  }, [challenge?.type, loopSlots, setupSlots, userCode.loop, userCode.setup]);

  const finalizeMissionAttempt = useCallback(async ({
    status,
    score,
    compileErrors,
    feedback = {},
    completed = false
  }) => {
    if (!missionAttemptIdRef.current) return;

    try {
      const durationMs = missionAttemptStartedAtRef.current ? Date.now() - missionAttemptStartedAtRef.current : null;
      await updateMissionAttempt({
        attemptId: missionAttemptIdRef.current,
        status,
        score,
        durationMs,
        compileErrors,
        hintUsed: showHintSidebar || showHint,
        codeSnapshot: getCodeSnapshot(),
        feedback,
        completedAt: completed ? new Date().toISOString() : null
      });
      missionAttemptStatusRef.current = status || missionAttemptStatusRef.current;
    } catch (error) {
      console.error('Error actualizando intento de mision:', error);
    }
  }, [getCodeSnapshot, showHint, showHintSidebar]);

  const startMissionAttempt = useCallback(async (missionIndex) => {
    const currentChallenge = challenges[missionIndex];
    if (!user?.id || !lessonKey || !currentChallenge) return;

    try {
      await ensureStudentProfile(user);

      const missionId = missionIndex + 1;
      missionAttemptNumberRef.current[missionId] = (missionAttemptNumberRef.current[missionId] || 0) + 1;

      const attempt = await createMissionAttempt({
        userId: user.id,
        lessonId: lessonKey,
        missionId,
        missionTitle: currentChallenge.title,
        attemptNumber: missionAttemptNumberRef.current[missionId],
        codeSnapshot: getCodeSnapshot(),
        hintUsed: showHintSidebar || showHint,
        feedback: {
          mission_type: currentChallenge.type
        }
      });

      missionAttemptIdRef.current = attempt?.id ?? null;
      missionAttemptStartedAtRef.current = Date.now();
      missionAttemptStatusRef.current = 'started';

      await upsertMissionProgress({
        user_id: user.id,
        lesson_id: lessonKey,
        mission_id: missionId,
        status: 'in_progress'
      });
    } catch (error) {
      console.error('Error creando intento de mision:', error);
    }
  }, [challenges, getCodeSnapshot, lessonKey, showHint, showHintSidebar, user]);



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

  useEffect(() => {
    if (challenge?.type !== 'write') {
      setWriteErrorLines({ setup: [], loop: [] });
      setShowWriteErrors(false);
      return;
    }

    if (!showWriteErrors) return;

    const liveValidation = verifyWriteCode();
    setWriteErrorLines(liveValidation.errorLines);
  }, [challenge?.type, userCode.setup, userCode.loop, showWriteErrors]);

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



  const loadChallenge = useCallback(async (id) => {
    const newChallenge = challenges[id];
    if (!newChallenge) return;

    if (missionAttemptIdRef.current && missionAttemptStatusRef.current === 'started') {
      await finalizeMissionAttempt({
        status: 'abandoned',
        score: 0,
        compileErrors: 0,
        feedback: {
          reason: 'challenge_switched'
        }
      });
    }

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
    setWriteErrorLines({ setup: [], loop: [] });
    setShowWriteErrors(false);
    missionAttemptIdRef.current = null;
    missionAttemptStartedAtRef.current = null;
    missionAttemptStatusRef.current = 'idle';

    await startMissionAttempt(id);
  }, [challenges, finalizeMissionAttempt, startMissionAttempt, stopSim]);



  useEffect(() => {
    void loadChallenge(initialChallengeId);
  }, [initialChallengeId, loadChallenge]);

  useEffect(() => () => {
    if (missionAttemptIdRef.current && missionAttemptStatusRef.current === 'started') {
      void finalizeMissionAttempt({
        status: 'abandoned',
        score: 0,
        compileErrors: 0,
        feedback: {
          reason: 'component_unmounted'
        }
      });
    }
  }, [finalizeMissionAttempt]);



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



  const normalizeInstructionGroup = (instructions = []) => [...instructions].sort();

  const normalizeLoopPhases = (instructions = []) => {
    const phases = [];
    let currentPhase = [];

    instructions.forEach((instruction) => {
      if (!instruction) return;

      if (instruction.startsWith('DELAY_')) {
        phases.push({
          commands: normalizeInstructionGroup(currentPhase),
          delay: instruction
        });
        currentPhase = [];
        return;
      }

      currentPhase.push(instruction);
    });

    if (currentPhase.length > 0 || phases.length === 0) {
      phases.push({
        commands: normalizeInstructionGroup(currentPhase),
        delay: null
      });
    }

    return phases;
  };

  const areEquivalentLoopSequences = (actual = [], expected = []) => {
    const actualPhases = normalizeLoopPhases(actual);
    const expectedPhases = normalizeLoopPhases(expected);

    if (actualPhases.length !== expectedPhases.length) return false;

    return actualPhases.every((phase, index) => {
      const expectedPhase = expectedPhases[index];
      if (!expectedPhase) return false;

      const sameDelay = phase.delay === expectedPhase.delay;
      const sameCommandCount = phase.commands.length === expectedPhase.commands.length;
      const sameCommands = sameCommandCount && phase.commands.every((command, commandIndex) => command === expectedPhase.commands[commandIndex]);

      return sameDelay && sameCommands;
    });
  };

  const verifyDragCode = () => {

    const actualSetup = setupSlots.filter(Boolean);
    const expectedSetup = challenge.expected.setup || [];
    const setupCorrect = actualSetup.length === expectedSetup.length
      && normalizeInstructionGroup(actualSetup).every((instruction, index) => instruction === normalizeInstructionGroup(expectedSetup)[index]);

    const actualLoop = loopSlots.filter(Boolean);
    const expectedLoop = challenge.expected.loop || [];
    const loopCorrect = actualLoop.length === expectedLoop.length
      && areEquivalentLoopSequences(actualLoop, expectedLoop);

    return setupCorrect && loopCorrect;

  };



  const getExpectedStatements = (code = '') => code
    .split(';')
    .map(statement => statement.trim())
    .filter(Boolean)
    .map(statement => `${statement};`);

  const getActualStatements = (code = '') => code
    .split(';')
    .map(statement => statement.trim())
    .filter(Boolean)
    .map(statement => `${statement};`);

  const normalizeCodeStatement = (statement = '') => statement.replace(/\s+/g, '');

  const normalizeCodeLoopPhases = (statements = []) => {
    const phases = [];
    let currentPhase = [];

    statements.forEach((statement) => {
      const normalizedStatement = normalizeCodeStatement(statement);
      if (!normalizedStatement) return;

      if (normalizedStatement.startsWith('delay(')) {
        phases.push({
          commands: [...currentPhase].sort(),
          delay: normalizedStatement
        });
        currentPhase = [];
        return;
      }

      currentPhase.push(normalizedStatement);
    });

    if (currentPhase.length > 0 || phases.length === 0) {
      phases.push({
        commands: [...currentPhase].sort(),
        delay: null
      });
    }

    return phases;
  };

  const areEquivalentCodeLoopSequences = (actual = [], expected = []) => {
    const actualPhases = normalizeCodeLoopPhases(actual);
    const expectedPhases = normalizeCodeLoopPhases(expected);

    if (actualPhases.length !== expectedPhases.length) return false;

    return actualPhases.every((phase, index) => {
      const expectedPhase = expectedPhases[index];
      if (!expectedPhase) return false;

      return phase.delay === expectedPhase.delay
        && phase.commands.length === expectedPhase.commands.length
        && phase.commands.every((command, commandIndex) => command === expectedPhase.commands[commandIndex]);
    });
  };

  const getStatementEntries = (code = '') => {
    const entries = [];
    let current = '';
    let startLine = 1;
    let line = 1;

    for (let index = 0; index < code.length; index += 1) {
      const character = code[index];

      if (current.length === 0 && character !== '\n' && character !== '\r' && character.trim() !== '') {
        startLine = line;
      }

      if (character === ';') {
        current += character;
        if (current.trim()) {
          entries.push({ statement: current.trim(), line: startLine });
        }
        current = '';
      } else if (character !== '\r') {
        current += character;
      }

      if (character === '\n') {
        line += 1;
      }
    }

    if (current.trim()) {
      entries.push({ statement: current.trim(), line: startLine });
    }

    return entries;
  };

  const getStatementLabel = (statement = '') => {
    if (statement.startsWith('pinMode')) return 'pinMode';
    if (statement.startsWith('digitalWrite')) return 'digitalWrite';
    if (statement.startsWith('delay')) return 'delay';
    return 'instrucción';
  };

  const validateSectionCode = (sectionName, rawCode, expectedCode) => {
    const errors = [];
    const errorLines = new Set();
    const trimmedCode = rawCode.trim();
    const expectedStatements = getExpectedStatements(expectedCode);
    const actualEntries = getStatementEntries(rawCode);

    if (!trimmedCode) {
      return {
        errors: [`${sectionName}: escribe el código antes de verificar.`],
        statements: [],
        errorLines: [1]
      };
    }

    const openingParens = (rawCode.match(/\(/g) || []).length;
    const closingParens = (rawCode.match(/\)/g) || []).length;
    if (openingParens !== closingParens) {
      errors.push(`${sectionName}: revisa los paréntesis, falta abrir o cerrar correctamente.`);
      errorLines.add(actualEntries[0]?.line || 1);
    }

    if (expectedCode.includes(',') && !(rawCode.includes(','))) {
      errors.push(`${sectionName}: falta la coma entre los parámetros.`);
      errorLines.add(actualEntries[0]?.line || 1);
    }

    const semicolonCount = (rawCode.match(/;/g) || []).length;
    if (semicolonCount < expectedStatements.length) {
      const missingCount = expectedStatements.length - semicolonCount;
      errors.push(`${sectionName}: falta${missingCount > 1 ? 'n' : ''} ${missingCount} punto${missingCount > 1 ? 's' : ''} y coma (;).`);
      errorLines.add(actualEntries[actualEntries.length - 1]?.line || rawCode.split('\n').length || 1);
    }

    if (trimmedCode && !trimmedCode.endsWith(';')) {
      errors.push(`${sectionName}: la última instrucción debe terminar con punto y coma (;).`);
      errorLines.add(actualEntries[actualEntries.length - 1]?.line || rawCode.split('\n').length || 1);
    }

    const caseRules = [
      { regex: /\bpinmode\b/i, exact: 'pinMode', label: 'pinMode' },
      { regex: /\bdigitalwrite\b/i, exact: 'digitalWrite', label: 'digitalWrite' },
      { regex: /\boutput\b/i, exact: 'OUTPUT', label: 'OUTPUT' },
      { regex: /\bhigh\b/i, exact: 'HIGH', label: 'HIGH' },
      { regex: /\blow\b/i, exact: 'LOW', label: 'LOW' }
    ];

    caseRules.forEach(({ regex, exact, label }) => {
      const match = rawCode.match(regex);
      if (match && match[0] !== exact) {
        errors.push(`${sectionName}: escribe \`${label}\` exactamente así, respetando mayúsculas y minúsculas.`);
        const matchedLine = rawCode.slice(0, match.index).split('\n').length;
        errorLines.add(matchedLine);
      }
    });

    const actualStatements = actualEntries.map(entry => entry.statement);

    const sameStatementCount = actualStatements.length === expectedStatements.length;
    const equivalentSetupOrder = sectionName === 'setup'
      && sameStatementCount
      && actualStatements.map(normalizeCodeStatement).sort().every((statement, index) => statement === expectedStatements.map(normalizeCodeStatement).sort()[index]);
    const equivalentLoopOrder = sectionName === 'loop'
      && sameStatementCount
      && areEquivalentCodeLoopSequences(actualStatements, expectedStatements);

    if (errors.length === 0 && (equivalentSetupOrder || equivalentLoopOrder)) {
      return { errors, statements: actualStatements, errorLines: [] };
    }

    expectedStatements.forEach((expectedStatement, index) => {
      const actualStatement = actualStatements[index];
      const actualLine = actualEntries[index]?.line || actualEntries[actualEntries.length - 1]?.line || 1;
      const instructionNumber = index + 1;

      if (!actualStatement) {
        errors.push(`${sectionName}: falta la instrucción ${instructionNumber} -> \`${expectedStatement}\`.`);
        errorLines.add(actualEntries[actualEntries.length - 1]?.line || 1);
        return;
      }

      if (actualStatement === expectedStatement) return;

      const normalizedActual = actualStatement.replace(/\s+/g, '');
      const normalizedExpected = expectedStatement.replace(/\s+/g, '');

      if (normalizedActual === normalizedExpected) return;

      if (normalizedActual.toLowerCase() === normalizedExpected.toLowerCase()) {
        errors.push(`${sectionName}: la instrucción ${instructionNumber} tiene un error de mayúsculas/minúsculas. Debe ser \`${expectedStatement}\`.`);
        errorLines.add(actualLine);
        return;
      }

      errors.push(`${sectionName}: la instrucción ${instructionNumber} de ${getStatementLabel(expectedStatement)} debe ser \`${expectedStatement}\`.`);
      errorLines.add(actualLine);
    });

    if (actualStatements.length > expectedStatements.length) {
      actualStatements.slice(expectedStatements.length).forEach((extraStatement, extraIndex) => {
        errors.push(`${sectionName}: la instrucción \`${extraStatement}\` no hace parte de esta misión.`);
        errorLines.add(actualEntries[expectedStatements.length + extraIndex]?.line || 1);
      });
    }

    return { errors, statements: actualStatements, errorLines: Array.from(errorLines).sort((a, b) => a - b) };
  };

  const verifyWriteCode = () => {

    const setupValidation = validateSectionCode('setup', userCode.setup, challenge?.expected?.setup || '');
    const loopValidation = validateSectionCode('loop', userCode.loop, challenge?.expected?.loop || '');
    const errors = [...setupValidation.errors, ...loopValidation.errors];

    return {
      success: errors.length === 0,
      errors,
      loopStatements: loopValidation.statements,
      errorLines: {
        setup: setupValidation.errorLines,
        loop: loopValidation.errorLines
      }
    };

  };



  const handleVerify = () => {

    stopSim();

    setLogs(prev => [...prev.slice(-10), '> Compilando...']);

    setTimeout(() => {

      const result = challenge?.type === 'drag'
        ? { success: verifyDragCode(), errors: [] }
        : verifyWriteCode();

      if (result.success) {
        if (challenge?.type === 'write') {
          setWriteErrorLines({ setup: [], loop: [] });
          setShowWriteErrors(false);
        }

        setLogs(prev => [...prev.slice(-10), '> Compilación exitosa!', '> Código correto.']);

      } else {
        if (challenge?.type === 'write') {
          setWriteErrorLines(result.errorLines);
          setShowWriteErrors(true);
        }

        const detailLogs = challenge?.type === 'drag'
          ? ['> ERROR: Revisa la secuencia de bloques.']
          : result.errors.map(error => `> ERROR: ${error}`);

        setLogs(prev => [...prev.slice(-10), ...detailLogs]);

      }

    }, 500);

  }



  const handleUpload = () => {

    stopSim();

    setLogs(prev => [...prev.slice(-10), '> Compilando...']);

    setTimeout(() => {

      const result = challenge?.type === 'drag'
        ? { success: verifyDragCode(), errors: [], loopStatements: [] }
        : verifyWriteCode();

      if (result.success) {
        if (challenge?.type === 'write') {
          setWriteErrorLines({ setup: [], loop: [] });
          setShowWriteErrors(false);
        }

        let simLoopInstructions = [];

        if (challenge?.type === 'drag') {

          simLoopInstructions = (challenge.expected.loop || []).map(id => PIEZAS[id]?.text);

        } else {

          simLoopInstructions = result.loopStatements.map(statement => statement.replace(/;$/, ''));

        }

        setLogs(prev => [...prev.slice(-10), '> Compilación exitosa!', '> Subiendo a Arduino...', '> ¡ÉXITO! Subido y ejecutando.']);

        runHardwareSim(simLoopInstructions);

      } else {
        if (challenge?.type === 'write') {
          setWriteErrorLines(result.errorLines);
          setShowWriteErrors(true);
        }

        const detailLogs = challenge?.type === 'drag'
          ? ['> ERROR: No se puede subir una secuencia incorrecta.']
          : result.errors.map(error => `> ERROR: ${error}`);

        setLogs(prev => [...prev.slice(-10), ...detailLogs, '> ERROR: No se puede subir código con errores.']);

      }

    }, 500);

  }



  const handleVerifyTracked = () => {
    const result = challenge?.type === 'drag'
      ? { success: verifyDragCode(), errors: [] }
      : verifyWriteCode();

    handleVerify();

    window.setTimeout(() => {
      void finalizeMissionAttempt({
        status: 'submitted',
        score: result.success ? 70 : 0,
        compileErrors: result.success ? 0 : (challenge?.type === 'drag' ? 1 : result.errors.length),
        feedback: {
          action: 'verify',
          success: result.success,
          errors: result.errors || []
        }
      });
    }, 550);
  };

  const handleUploadTracked = () => {
    const result = challenge?.type === 'drag'
      ? { success: verifyDragCode(), errors: [], loopStatements: [] }
      : verifyWriteCode();

    handleUpload();

    window.setTimeout(() => {
      if (result.success) {
        void finalizeMissionAttempt({
          status: 'completed',
          score: 100,
          compileErrors: 0,
          completed: true,
          feedback: {
            action: 'upload',
            success: true
          }
        });

        if (user?.id && lessonKey) {
          void upsertMissionProgress({
            user_id: user.id,
            lesson_id: lessonKey,
            mission_id: currentId + 1,
            status: 'completed',
            score: 100
          });
        }

        return;
      }

      void finalizeMissionAttempt({
        status: 'submitted',
        score: 0,
        compileErrors: challenge?.type === 'drag' ? 1 : result.errors.length,
        feedback: {
          action: 'upload',
          success: false,
          errors: result.errors || []
        }
      });
    }, 550);
  };

  const resetChallenge = () => {
    void loadChallenge(currentId);
  };

  const handleClose = async () => {
    if (missionAttemptIdRef.current && missionAttemptStatusRef.current === 'started') {
      await finalizeMissionAttempt({
        status: 'abandoned',
        score: 0,
        compileErrors: 0,
        feedback: {
          reason: 'simulator_closed'
        }
      });
    }

    onClose?.();
  };



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

              <button onClick={handleVerifyTracked} title="Verificar Código" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#00979c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>

                <Check size={20} strokeWidth={3} />

              </button>

              <button onClick={handleUploadTracked} title="Subir y Ejecutar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#00979c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>

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

            <div style={{ flex: 1, padding: '16px', fontFamily: 'monospace', fontSize: '13px', overflowY: 'auto', background: '#0a0f1a', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.18), rgba(15, 23, 42, 0.08))', pointerEvents: 'none' }}></div>

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
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
                      <HighlightedCode code={userCode.setup} errorLines={writeErrorLines.setup} lineOffset={32} />
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
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
                      <HighlightedCode code={userCode.loop} errorLines={writeErrorLines.loop} lineOffset={32} />
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

          {onClose && <button onClick={() => void handleClose()} style={{ padding: '8px 32px', borderRadius: '8px', background: '#6366f1', color: 'white', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>Cerrar</button>}

        </div>

      </div>

    </div>

  );

};



export default ArduinoExercisesSimulator;





