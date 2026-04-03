'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, ArrowRight, ChevronDown, Trash2, Search, X, 
  Cable, Pencil, Cpu, Loader2, Zap, ZapOff, Usb 
} from 'lucide-react';
import './ArduinoIDE.css';

const ARDUINO_TEAL = '#00979d';
const ARDUINO_TEAL_LIGHT = '#22c7cf';
const MIN_CONSOLE_HEIGHT = 112;
const DEFAULT_CONSOLE_HEIGHT = 168;
const MAX_CONSOLE_HEIGHT_RATIO = 0.55;
const IDE_PANEL_DARK = '#1a1d24';
const IDE_TITLEBAR_DARK = '#2b313a';
const IDE_CONSOLE_BLACK = '#000000';

const COLORS = {
  types: 'text-cyan-400',       
  numbers: 'text-cyan-400',     
  functions: 'text-orange-400',   
  classes: 'text-white',    
  constants: 'text-white',       
  directives: 'text-pink-500',   
  library: 'text-pink-500',      
  comments: 'text-slate-500',    
  string: 'text-cyan-400',      
  general: 'text-slate-300',     
};

const VALID_ARDUINO_FUNCTIONS = [
  'setup', 'loop', 'pinMode', 'digitalWrite', 'digitalRead', 
  'analogRead', 'analogWrite', 'delay', 'delayMicroseconds', 
  'millis', 'micros', 'begin', 'print', 'println', 'available', 
  'read', 'write', 'attach'
];

const VALID_ARDUINO_CLASSES = ['Serial', 'Servo', 'LiquidCrystal', 'Wire', 'Ethernet', 'SD', 'String', 'SoftwareSerial'];
const STRICT_LOWERCASE = ['void', 'int', 'float', 'char', 'long', 'bool', 'if', 'else', 'for', 'while', 'switch', 'return', 'break'];

const ALL_BOARDS = ["Arduino Uno", "Arduino Nano", "Arduino Mega", "Arduino Leonardo", "Arduino Lilipad", "Arduino Mini"];
const ALL_PORTS = ["COM1", "COM2", "COM3", "COM4", "COM5"];

const ArduinoIDE = () => {
  const [textCode, setTextCode] = useState(
`#include <Servo.h>

Servo myservo; 
int ledPin = 13;

void setup() {
  Serial.begin(9600);
  myservo.attach(9);
  pinMode(ledPin, OUTPUT);
  Serial.println("Sistema iniciado...");
}

void loop() {
  myservo.write(90);
  digitalWrite(ledPin, HIGH);
  Serial.println("LED Encendido - Posicion 90");
  delay(1000);
  
  myservo.write(0);
  digitalWrite(ledPin, LOW);
  Serial.println("LED Apagado - Posicion 0");
  delay(500);
}`
  );

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [activeTab, setActiveTab] = useState('salida'); 
  const [showMonitorTab, setShowMonitorTab] = useState(false);
  
  const [selectedBoard, setSelectedBoard] = useState(null); 
  const [selectedPort, setSelectedPort] = useState(null);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [tempBoard, setTempBoard] = useState("Arduino Uno");
  const [tempPort, setTempPort] = useState("COM3");

  const [progressToast, setProgressToast] = useState({ show: false, label: "", percent: 0, status: 'busy' });
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationLogs, setCompilationLogs] = useState(["Inicie seleccionando una placa y puerto."]);
  const [errorHighlight, setErrorHighlight] = useState(null);
  const [serialMessages, setSerialMessages] = useState<any[]>([]);
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(DEFAULT_CONSOLE_HEIGHT);
  
  const [compiledLogic, setCompiledLogic] = useState<any[]>([]);
  const [isResizingBottomPanel, setIsResizingBottomPanel] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const mainMenuRef = useRef<HTMLDivElement>(null);
  const serialEndRef = useRef<HTMLDivElement>(null);
  const simulationTimeout = useRef<NodeJS.Timeout | null>(null);
  const ideRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mainMenuRef.current && !mainMenuRef.current.contains(event.target as Node)) {
        setIsMainMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const extractSerialLogic = (code: string) => {
    const lines = code.split('\n');
    const logic: { text: string, wait: number }[] = [];
    let currentMsg: string | null = null;
    let pendingSetupMessages: string[] = [];
    let currentScope: 'setup' | 'loop' | null = null;

    lines.forEach(line => {
      const cleanLine = line.trim();

      if (/void\s+setup\s*\(\s*\)\s*\{/.test(cleanLine)) {
        currentScope = 'setup';
      } else if (/void\s+loop\s*\(\s*\)\s*\{/.test(cleanLine)) {
        currentScope = 'loop';
      } else if (cleanLine === '}') {
        currentScope = null;
      }

      const printMatch = line.match(/Serial\.println\("(.*?)"\)/);
      if (printMatch) {
        if (currentScope === 'setup') {
          pendingSetupMessages.push(printMatch[1]);
        } else {
          currentMsg = printMatch[1];
        }
      }

      const delayMatch = line.match(/delay\((\d+)\)/);
      if (delayMatch && currentMsg) {
        logic.push({ text: currentMsg, wait: parseInt(delayMatch[1]) });
        currentMsg = null;
      }
    });

    if (currentMsg) {
      logic.push({ text: currentMsg, wait: 1000 });
    }

    if (pendingSetupMessages.length > 0) {
      logic.unshift(...pendingSetupMessages.map((text, index) => ({ text, wait: index === pendingSetupMessages.length - 1 ? 400 : 700 })));
    }

    if (logic.length === 0) {
      const allMsgs = lines.map(l => l.match(/Serial\.println\("(.*?)"\)/)).filter(m => m).map(m => m![1]);
      return allMsgs.map(m => ({ text: m, wait: 1000 }));
    }
    return logic;
  };

  useEffect(() => {
    if (isSimulationActive && compiledLogic.length > 0) {
      let currentIndex = 0;

      const runStep = () => {
        const step = compiledLogic[currentIndex];
        
        setSerialMessages(prev => [
          ...prev, 
          { time: new Date().toLocaleTimeString(), text: step.text }
        ].slice(-50));

        currentIndex = (currentIndex + 1) % compiledLogic.length;
        if (simulationTimeout.current) clearTimeout(simulationTimeout.current);
        simulationTimeout.current = setTimeout(runStep, step.wait);
      };

      runStep();
    } else {
      if (simulationTimeout.current) clearTimeout(simulationTimeout.current);
    }

    return () => {
        if (simulationTimeout.current) clearTimeout(simulationTimeout.current);
    }
  }, [isSimulationActive, compiledLogic]);

  useEffect(() => {
    if (serialEndRef.current && activeTab === 'monitor') {
      serialEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [serialMessages, activeTab]);

  useEffect(() => {
    if (!isResizingBottomPanel) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!ideRootRef.current) return;

      const bounds = ideRootRef.current.getBoundingClientRect();
      const maxHeight = Math.max(MIN_CONSOLE_HEIGHT, Math.floor(bounds.height * MAX_CONSOLE_HEIGHT_RATIO));
      const nextHeight = bounds.bottom - event.clientY - 24;
      setBottomPanelHeight(Math.max(MIN_CONSOLE_HEIGHT, Math.min(maxHeight, nextHeight)));
    };

    const handleMouseUp = () => setIsResizingBottomPanel(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingBottomPanel]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
  };

  const updateCursorInfo = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const cursorAt = e.currentTarget.selectionStart;
    const textBeforeCursor = e.currentTarget.value.substring(0, cursorAt);
    const lines = textBeforeCursor.split('\n');
    setCursorPos({ line: lines.length, col: (lines[lines.length - 1]?.length || 0) + 1 });
  };

  const validateCode = () => {
    setErrorHighlight(null);
    const lines = textCode.split('\n');
    const includedLibraries: string[] = [];
    const declaredVariables = ['Serial']; 

    lines.forEach(line => {
      const cleanLine = line.split('//')[0].trim();
      const libMatch = cleanLine.match(/#include\s*[<"](.+?)[>"]/);
      if (libMatch) includedLibraries.push(libMatch[1]);
      
      VALID_ARDUINO_CLASSES.forEach(cls => {
        const classRegex = new RegExp(`^${cls}\\s+(\\w+)`, 'i');
        const match = cleanLine.match(classRegex);
        if (match) declaredVariables.push(match[1]);
      });
      
      STRICT_LOWERCASE.forEach(type => {
        const typeRegex = new RegExp(`^${type}\\s+(\\w+)`, 'i');
        const match = cleanLine.match(typeRegex);
        if (match) declaredVariables.push(match[1]);
      });
    });

    for (let i = 0; i < lines.length; i++) {
      let codePart = lines[i].split('//')[0].trim();
      if (codePart === "") continue;
      if (codePart.startsWith("#include")) continue; 
      
      if (codePart.includes("Servo") && !includedLibraries.includes("Servo.h")) {
        return { line: i, msg: `error: 'Servo' no ha sido declarado. ¿Olvidaste #include <Servo.h>?` };
      }
      
      const usageMatch = codePart.match(/^(\w+)\./);
      if (usageMatch) {
        const varName = usageMatch[1];
        if (!declaredVariables.includes(varName)) return { line: i, msg: `error: '${varName}' no fue declarado en este ámbito.` };
      }
      
      const words = codePart.match(/[a-zA-Z]+/g) || [];
      for (let word of words) {
        const lowerWord = word.toLowerCase();
        if (STRICT_LOWERCASE.includes(lowerWord) && word !== lowerWord) {
          return { line: i, msg: `error: '${word}' no declarado; las palabras clave deben ser minúsculas.` };
        }
      }
      
      const isBlockHeader = codePart.endsWith('{') || codePart.endsWith('}') || codePart.startsWith('void') || codePart.startsWith('#') || codePart.includes('if') || codePart.includes('for') || codePart.includes('while');
      if (!isBlockHeader && !codePart.endsWith(';')) return { line: i, msg: `error: falta un ';' al final de la línea` };
    }
    return null;
  };

  const runTask = (label: string, type = 'verify') => {
    if (!selectedBoard) {
        setCompilationLogs(["Error: No se ha seleccionado ninguna placa. Por favor, selecciona una placa y un puerto primero."]);
        setProgressToast({ show: true, label: "Seleccione placa", percent: 100, status: 'error' });
        setTimeout(() => setProgressToast(prev => ({ ...prev, show: false })), 2000);
        return;
    }

    if (!(type === 'upload' && showMonitorTab && activeTab === 'monitor')) {
      setActiveTab('salida');
    }
    setIsCompiling(true);
    setErrorHighlight(null);
    setCompilationLogs([`${label === 'Compilando' ? 'Compilando' : 'Subiendo'} sketch...`]);
    setProgressToast({ show: true, label, percent: 10, status: 'busy' });

    let currentPercent = 10;
    const interval = setInterval(() => {
        currentPercent += Math.floor(Math.random() * 15) + 5;
        if (currentPercent >= 90) {
            clearInterval(interval);
            finishTask(type);
        } else {
            setProgressToast(prev => ({ ...prev, percent: currentPercent }));
        }
    }, 150);
  };

  const finishTask = (type: string) => {
    const error = validateCode();
    if (error) {
      setErrorHighlight(error.line);
      setIsSimulationActive(false);
      setCompilationLogs([`sketch_mar29a.ino: En la línea ${error.line + 1}:`, error.msg, `Fallo en la ${type === 'verify' ? 'compilación' : 'subida'} para la tarjeta ${selectedBoard}.`]);
      setProgressToast({ show: true, label: "Error detectado", percent: 100, status: 'error' });
    } else {
      setCompilationLogs([
          type === 'verify' ? "Compilación finalizada con éxito." : "Subida finalizada con éxito.", 
          "El Sketch usa 1240 bytes (3%) de memoria del programa."
      ]);
      setProgressToast({ show: true, label: type === 'verify' ? "Compilación terminada" : "Subida terminada", percent: 100, status: 'success' });
      
      if (type === 'upload') {
        const newLogic = extractSerialLogic(textCode);
        setCompiledLogic(newLogic);
        setIsSimulationActive(true);
        setSerialMessages([
          { time: new Date().toLocaleTimeString(), text: `--- Puerto Serie abierto en ${selectedBoard} ---` }
        ]);
      }
    }
    setIsCompiling(false);
    setTimeout(() => setProgressToast(prev => ({ ...prev, show: false })), 2000);
  };

  const confirmSelection = () => {
    setSelectedBoard(tempBoard);
    setSelectedPort(tempPort);
    setIsDialogOpen(false);
    setCompilationLogs([`Placa configurada: ${tempBoard} en ${tempPort}`]);
  };

  const renderHighlightedCode = () => {
    const lines = textCode.split('\n');
    return lines.map((line, i) => (
      <div key={i} className={`min-h-[1.5rem] whitespace-pre px-4 w-full flex items-center ${i === (cursorPos.line - 1) ? 'bg-white/5' : ''} ${errorHighlight === i ? 'bg-red-900/20 border-l-2 border-red-500' : ''}`}>
        <span className="inline-block min-h-[1.5rem]">
          {line === "" ? "​" : line.split(/(\/\/.*|".*?"|#\w+|<[^>]+>|\w+\.|\.\w+|[(){}[\];,]|\d+|\w+)/g).map((part, j) => {
            if (!part) return null;
            if (part.startsWith('//')) return <span key={j} className={COLORS.comments}>{part}</span>;
            if (part.startsWith('"') && part.endsWith('"')) return <span key={j} className={COLORS.string}>{part}</span>;
            if (part.startsWith('#')) return <span key={j} className={COLORS.directives}>{part}</span>;
            if (part.startsWith('<') && part.endsWith('>')) return <span key={j} className={COLORS.library}>{part}</span>;
            if (part.endsWith('.')) return <span key={j} className={COLORS.classes}>{part}</span>;
            if (VALID_ARDUINO_CLASSES.includes(part)) return <span key={j} className={COLORS.classes}>{part}</span>;
            if (VALID_ARDUINO_FUNCTIONS.includes(part)) return <span key={j} className={COLORS.functions}>{part}</span>;
            if (STRICT_LOWERCASE.includes(part)) return <span key={j} className={COLORS.types}>{part}</span>;
            if (/^\d+$/.test(part)) return <span key={j} className={COLORS.numbers}>{part}</span>;
            if (/^(HIGH|LOW|OUTPUT|INPUT)$/.test(part) || /^[(){}[\];,]$/.test(part)) return <span key={j} className={COLORS.constants}>{part}</span>;
            return <span key={j} className={COLORS.general}>{part}</span>;
          })}
        </span>
      </div>
    ));
  };

  return (
    <div className="relative w-full h-full min-h-0">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1c1e26; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes slideInUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-toast { animation: slideInUp 0.15s ease-out forwards; }
      `}</style>

      {/* Modal de Selección de Placa */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[600px] h-[450px] bg-[#23272e] rounded-lg border border-slate-600 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-[#1c1e26]">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-cyan-400" />
                <span className="font-bold text-slate-100 uppercase tracking-tight">Placa y puerto</span>
              </div>
              <X size={18} className="text-slate-400 hover:text-white cursor-pointer" onClick={() => setIsDialogOpen(false)} />
            </div>
            
            <div className="flex-1 flex overflow-hidden">
              {/* Lista de Placas */}
              <div className="w-1/2 border-r border-slate-700 flex flex-col">
                <div className="p-3">
                  <div className="relative flex items-center bg-[#1c1e26] border border-slate-600 rounded px-2 py-1 gap-2">
                    <Search size={14} className="text-slate-500" />
                    <input type="text" placeholder="Buscar placa" className="bg-transparent border-none outline-none text-[12px] w-full text-slate-100" />
                  </div>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar">
                  {ALL_BOARDS.map(b => (
                    <div key={b} onClick={() => setTempBoard(b)} className={`px-4 py-2.5 text-[12px] flex items-center justify-between cursor-pointer border-b border-white/5 hover:bg-white/5 ${tempBoard === b ? 'font-bold' : 'text-slate-300'}`} style={tempBoard === b ? { backgroundColor: 'rgba(0, 151, 157, 0.12)', color: ARDUINO_TEAL_LIGHT } : undefined}>
                      <div className="flex items-center gap-2">
                        <Cpu size={14} className={tempBoard === b ? '' : 'text-slate-500'} style={tempBoard === b ? { color: ARDUINO_TEAL_LIGHT } : undefined} />
                        {b}
                      </div>
                      {tempBoard === b && <Check size={14} />}
                    </div>
                  ))}
                </div>
              </div>
              {/* Lista de Puertos */}
              <div className="w-1/2 flex flex-col bg-[#1c1e26]/30">
                <div className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Puertos disponibles</div>
                <div className="flex-1 overflow-auto custom-scrollbar">
                  {ALL_PORTS.map(p => (
                    <div key={p} onClick={() => setTempPort(p)} className={`px-6 py-3 text-[12px] flex items-center gap-3 cursor-pointer hover:bg-white/5 ${tempPort === p ? 'font-bold' : 'text-slate-300'}`} style={tempPort === p ? { color: ARDUINO_TEAL_LIGHT } : undefined}>
                      <Usb size={16} className={tempPort === p ? '' : 'text-slate-500'} style={tempPort === p ? { color: ARDUINO_TEAL_LIGHT } : undefined} />
                      {p} Serial Port
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-700 bg-[#1c1e26] flex justify-end gap-3">
              <button onClick={() => setIsDialogOpen(false)} className="px-6 py-2 rounded text-[12px] font-medium border border-slate-600 text-slate-300 hover:bg-white/5">CANCELAR</button>
              <button onClick={confirmSelection} className="px-6 py-2 rounded text-[12px] font-medium text-white" style={{ backgroundColor: ARDUINO_TEAL }}>ACEPTAR</button>
            </div>
          </div>
        </div>
      )}

      {/* Estructura Principal del IDE */}
      <div ref={ideRootRef} className="relative w-full h-full min-h-0 flex flex-col bg-[#141529] overflow-hidden">
        
        {/* Barra de Herramientas Superior */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800" style={{ backgroundColor: IDE_PANEL_DARK }}>
          <div className="flex items-center gap-3">
            <button title="Verificar" onClick={() => runTask('Compilando', 'verify')} disabled={isCompiling} className="w-8 h-8 rounded-full flex items-center justify-center text-[#1c1e26] disabled:opacity-50" style={{ backgroundColor: ARDUINO_TEAL, boxShadow: 'none', transform: 'none', border: 'none', outline: 'none', appearance: 'none', WebkitAppearance: 'none' }}><Check size={16} strokeWidth={3} /></button>
            <button title="Subir" onClick={() => runTask('Subiendo', 'upload')} disabled={isCompiling} className="w-8 h-8 rounded-full flex items-center justify-center text-[#1c1e26] disabled:opacity-50" style={{ backgroundColor: ARDUINO_TEAL, boxShadow: 'none', transform: 'none', border: 'none', outline: 'none', appearance: 'none', WebkitAppearance: 'none' }}><ArrowRight size={16} strokeWidth={3} /></button>
            
            <div className="relative ml-2" ref={mainMenuRef}>
              <div onClick={() => setIsMainMenuOpen(!isMainMenuOpen)} className={`flex items-center gap-3 px-3 py-1.5 border rounded-md text-[13px] cursor-pointer min-w-[220px] ${!selectedBoard ? 'border-amber-500/40' : 'border-slate-700'}`} style={{ backgroundColor: IDE_PANEL_DARK, borderColor: !selectedBoard ? 'rgba(0, 151, 157, 0.45)' : undefined }}>
                <Usb size={16} style={selectedBoard ? { color: ARDUINO_TEAL_LIGHT } : { color: ARDUINO_TEAL }} />
                <span className={`font-medium flex-1 text-left tracking-tight ${selectedBoard ? 'text-slate-100' : ''}`} style={!selectedBoard ? { color: ARDUINO_TEAL } : undefined}>{selectedBoard || "Seleccionar placa"}</span>
                <ChevronDown size={14} className="text-slate-500" />
              </div>
              {isMainMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-[#23272e] border border-slate-600 rounded shadow-2xl z-50 overflow-hidden">
                  <div className="py-1">
                    <div onClick={() => { setSelectedBoard("Arduino Uno"); setSelectedPort("COM3"); setIsMainMenuOpen(false); }} className="flex items-center justify-between px-4 py-3 hover:bg-[#2c313a] cursor-pointer group border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <Usb size={18} className="text-slate-400 group-hover:text-cyan-400" />
                        <div className="flex flex-col">
                          <span className={`text-[13px] ${selectedBoard === "Arduino Uno" ? 'font-bold' : 'text-slate-100'}`} style={selectedBoard === "Arduino Uno" ? { color: ARDUINO_TEAL_LIGHT } : undefined}>Arduino Uno</span>
                          <span className="text-[11px] text-slate-400 font-mono">{selectedBoard === "Arduino Uno" ? selectedPort : 'COM3'}</span>
                        </div>
                      </div>
                      <Pencil size={14} className="text-slate-500 opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-[#1c1e26] text-[12px] text-slate-300 hover:text-white border-t border-slate-600 cursor-pointer text-left" onClick={() => { setIsMainMenuOpen(false); setIsDialogOpen(true); }}>Seleccione otra placa y puerto...</div>
                </div>
              )}
            </div>
          </div>
          <button
            title="Monitor Serie"
            onClick={() => { setShowMonitorTab(true); setActiveTab('monitor'); }}
            className="flex items-center justify-center text-slate-400"
            style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}
          >
            <Search size={20} style={showMonitorTab ? { color: ARDUINO_TEAL_LIGHT } : undefined} />
          </button>
        </div>

        {/* Área del Editor */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Números de línea */}
          <div ref={gutterRef} className="w-12 border-r border-slate-800 py-4 text-slate-600 font-mono text-[11px] leading-[1.5rem] overflow-hidden text-center no-scrollbar" style={{ backgroundColor: IDE_PANEL_DARK }}>
            {textCode.split('\n').map((_, i) => (
              <div key={i} className={`${i === (cursorPos.line - 1) ? 'text-slate-300 bg-white/5' : ''} ${errorHighlight === i ? 'text-red-400 font-bold' : ''}`}>{i + 1}</div>
            ))}
          </div>
          {/* Editor de Código */}
          <div className="flex-1 min-h-0 relative overflow-hidden bg-[#141529]">
            <textarea
              ref={textareaRef}
              value={textCode}
              onChange={(e) => { setTextCode(e.target.value); setErrorHighlight(null); }}
              onScroll={handleScroll}
              onKeyUp={updateCursorInfo}
              onClick={updateCursorInfo}
              className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white z-30 outline-none resize-none overflow-auto whitespace-pre font-mono text-[14px] leading-[1.5rem] custom-scrollbar"
              spellCheck="false"
            />
            <div ref={preRef} className="absolute inset-0 w-full h-full py-4 pointer-events-none overflow-hidden z-20 font-mono text-[14px] leading-[1.5rem]">{renderHighlightedCode()}</div>
          </div>
        </div>

        {/* Panel Inferior (Salida y Monitor) */}
        <div className="shrink-0 border-t border-slate-800 flex flex-col z-40 relative" style={{ height: `${bottomPanelHeight}px`, backgroundColor: IDE_CONSOLE_BLACK }}>
          <button
            type="button"
            aria-label="Redimensionar consola"
            onMouseDown={() => setIsResizingBottomPanel(true)}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '10px', transform: 'translateY(-50%)', cursor: 'row-resize', background: 'transparent', border: 'none', zIndex: 45 }}
          >
            <span style={{ display: 'block', width: '60px', height: '2px', margin: '3px auto 0', borderRadius: '999px', backgroundColor: 'rgba(148, 163, 184, 0.45)' }} />
          </button>
          <div className="flex border-b border-slate-800 justify-between items-center pr-2" style={{ backgroundColor: IDE_PANEL_DARK }}>
            <div className="flex">
              <button onClick={() => setActiveTab('salida')} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider ${activeTab === 'salida' ? '' : 'text-slate-500 hover:text-slate-300'}`} style={{ color: activeTab === 'salida' ? ARDUINO_TEAL_LIGHT : undefined, background: 'transparent', border: 'none', boxShadow: activeTab === 'salida' ? `inset 0 2px 0 0 ${ARDUINO_TEAL_LIGHT}` : 'none' }}>Salida</button>
              {showMonitorTab && (
                <button onClick={() => setActiveTab('monitor')} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${activeTab === 'monitor' ? '' : 'text-slate-500 hover:text-slate-300'}`} style={{ color: activeTab === 'monitor' ? ARDUINO_TEAL_LIGHT : undefined, background: 'transparent', border: 'none', boxShadow: activeTab === 'monitor' ? `inset 0 2px 0 0 ${ARDUINO_TEAL_LIGHT}` : 'none' }}>
                  Monitor Serial
                  <X size={12} className="hover:text-red-400" onClick={(e) => { e.stopPropagation(); setShowMonitorTab(false); setActiveTab('salida'); }}/>
                </button>
              )}
            </div>
            {activeTab === 'monitor' && (
              <button
                onClick={() => setSerialMessages([])}
                className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                title="Limpiar"
                style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-auto p-4 font-mono text-[12px] custom-scrollbar" style={{ backgroundColor: IDE_CONSOLE_BLACK }}>
            {activeTab === 'salida' ? (
              <div className="space-y-0.5">
                {compilationLogs.map((log, i) => (
                  <div key={i} className={log.includes('error') || log.includes('Fallo') || log.includes('Error') ? 'text-red-400' : 'text-slate-400'}>{log}</div>
                ))}
              </div>
            ) : (
              <div className="space-y-1" style={{ color: ARDUINO_TEAL_LIGHT }}>
                {serialMessages.length === 0 ? <div className="text-slate-600 italic">Esperando datos en puerto serie...</div> : 
                  serialMessages.map((m, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-slate-600 shrink-0">[{m.time}]</span>
                      <span>{m.text}</span>
                    </div>
                  ))
                }
                <div ref={serialEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Notificación de Progreso */}
        {progressToast.show && (
          <div className="absolute bottom-[45px] right-2 z-[90] w-80 bg-[#1c1e26] border border-slate-700 rounded shadow-2xl overflow-hidden animate-toast">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {progressToast.status === 'busy' && <Loader2 size={16} className="animate-spin" style={{ color: ARDUINO_TEAL_LIGHT }} />}
                  {progressToast.status === 'success' && <Check size={16} className="text-emerald-400" />}
                  {progressToast.status === 'error' && <X size={16} className="text-red-400" />}
                  <span className="text-[12px] font-bold text-slate-100 uppercase tracking-tight">{progressToast.label}</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-[#141529] rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${progressToast.status === 'error' ? 'bg-red-500' : ''}`} style={{ width: `${progressToast.percent}%`, backgroundColor: progressToast.status === 'error' ? undefined : ARDUINO_TEAL }} />
              </div>
            </div>
          </div>
        )}

        {/* Barra de Estado Inferior */}
        <div className="px-3 py-1 text-[11px] text-slate-500 flex justify-between border-t border-slate-800 font-medium z-50 items-center" style={{ backgroundColor: IDE_PANEL_DARK }}>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-1.5 uppercase tracking-wider"><span className="text-slate-400">Lín {cursorPos.line}, Col {cursorPos.col}</span></div>
             <div className="h-3 w-[1px] bg-slate-800"></div>
             <div className="uppercase tracking-wider">Tabulado: 2 espacios</div>
          </div>
          <div className="flex items-center gap-3 text-right">
            {selectedBoard ? (
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-widest px-2 py-0.5 rounded" style={{ color: ARDUINO_TEAL_LIGHT, backgroundColor: 'rgba(0, 151, 157, 0.08)', border: '1px solid rgba(0, 151, 157, 0.22)' }}>
                <Zap size={10} fill="currentColor" />
                <span>Conectado: {selectedBoard} en {selectedPort}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-500/60 font-bold uppercase tracking-widest"><ZapOff size={10} /><span>Sin placa conectada</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArduinoIDE;
