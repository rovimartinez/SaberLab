import React, { useState, useRef, useEffect } from 'react';
import { Code2, Play, RotateCcw } from 'lucide-react';

/**
 * Componente CodeEditor
 * Interfaz para escribir y ejecutar el código del simulador
 */
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
    <div className="flex flex-col bg-[#1e293b] rounded-xl border border-white/10 overflow-hidden shadow-2xl h-full min-h-[350px]">
      <div className="flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-white/5">
        <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
          <Code2 size={14} />
          Sketch.ino
        </div>
        <button 
          onClick={handleAction}
          className={`flex items-center gap-2 ${isRunning ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'} text-white text-[10px] px-3 py-1.5 rounded-md transition-all font-bold shadow-lg`}
        >
          {isRunning ? <RotateCcw size={12} /> : <Play size={12} fill="currentColor" />}
          {isRunning ? 'DETENER' : 'EJECUTAR'}
        </button>
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-full p-4 bg-slate-900/50 text-emerald-400 font-mono text-xs outline-none resize-none leading-relaxed"
        spellCheck="false"
      />
    </div>
  );
};

const App = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [ledState, setLedState] = useState(false);
    const [txRxActive, setTxRxActive] = useState(false);
    const simulationRef = useRef(null);

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
      <div className="flex bg-[#111] rounded-sm shadow-[0_2px_0_#000]">
        {pins.map((label, i) => (
          <div key={`${prefix}-${label}-${i}`} className={`w-[16px] h-4 flex items-center justify-center ${i !== pins.length - 1 ? 'border-r border-white/5' : ''} relative`}>
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 shadow-inner ${(label === '13' && ledState) ? 'bg-yellow-400 shadow-[0_0_12px_#fbbf24]' : 'bg-zinc-800'}`} />
          </div>
        ))}
      </div>
    );

    const renderLabels = (pins, offset = "8px", prefix = "lbl") => (
      <div className="flex">
        {pins.map((label, i) => (
          <div key={`${prefix}-${label}-${i}`} className="w-[16px] flex justify-center items-center">
            <span className="text-[7px] font-bold text-white uppercase whitespace-nowrap text-right drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
                  style={{ transform: `rotate(270deg) translateX(${offset})` }}>
                {label}
            </span>
          </div>
        ))}
      </div>
    );

    return (
        <div className="p-4 bg-slate-950 min-h-screen flex items-center justify-center font-sans overflow-hidden">
          <div className="w-full max-w-6xl">
            {/* Reducción del min-h general para quitar espacio abajo */}
            <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full min-h-[400px]">
                <div className="flex-1 flex flex-col">
                    <CodeEditor onRun={handleCodeRun} onStop={handleStop} isRunning={isRunning} />
                </div>

                <div className="flex-1 flex flex-col items-center justify-center perspective-[1200px]">
                    <div className="bg-[#1e293b] rounded-3xl p-4 relative flex items-center justify-center border border-white/10 shadow-2xl w-full h-full min-h-[380px]">
                        
                        <div className={`absolute top-4 right-6 px-3 py-1 rounded-full text-[10px] font-black tracking-widest transition-all z-50 ${isRunning ? 'bg-emerald-500/20 text-emerald-400 animate-pulse border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                          {isRunning ? 'EJECUTANDO' : 'LISTO'}
                        </div>

                        <div className="relative transform-gpu transition-transform duration-700 rotate-x-[20deg] rotate-y-[-10deg] scale-95" 
                             style={{ transformStyle: 'preserve-3d' }}>
                          
                          <div className="absolute inset-0 translate-z-[-50px] bg-black/40 blur-2xl rounded-xl scale-95 translate-y-8" />

                          <div className="w-[340px] h-[240px] bg-[#008184] rounded-xl relative shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] border-b-[6px] border-r-[4px] border-teal-900 overflow-visible">
                              
                              {/* Decoración: Logo UNO */}
                              <div className="absolute left-[80px] top-[140px] opacity-20 pointer-events-none select-none">
                                <h1 className="text-4xl font-black italic text-teal-100 tracking-tighter">UNO</h1>
                                <div className="h-[2px] w-full bg-teal-100 mt-1" />
                                <p className="text-[5px] font-bold text-teal-100 mt-1">OPEN-SOURCE ELECTRONICS</p>
                              </div>

                              {/* Puerto USB */}
                              <div className="absolute left-[-25px] top-[40px] w-[45px] h-14 bg-gradient-to-r from-slate-400 to-slate-200 rounded-sm shadow-lg border-b-4 border-slate-500" style={{ transform: 'translateZ(20px)' }} />

                              {/* Jack de Alimentación */}
                              <div className="absolute left-[-20px] bottom-[30px] w-[50px] h-12 bg-gradient-to-b from-[#222] to-[#000] rounded shadow-2xl border-b-4 border-black" style={{ transform: 'translateZ(15px)' }} />

                              {/* LED L */}
                              <div className="absolute top-[52px] left-[95px] flex items-center gap-1.5" style={{ transform: 'translateZ(5px)' }}>
                                  <div className={`w-2.5 h-1.5 rounded-sm transition-all duration-150 ${ledState ? 'bg-yellow-400 shadow-[0_0_12px_#fbbf24]' : 'bg-teal-900'}`} />
                                  <span className="text-[6px] text-white font-bold">L</span>
                              </div>

                              {/* Bloque TX / RX */}
                              <div className="absolute top-[84px] left-[95px] flex flex-col gap-2" style={{ transform: 'translateZ(5px)' }}>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-2.5 h-1.5 rounded-sm transition-all duration-75 ${txRxActive ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-teal-900'}`} />
                                    <span className="text-[5px] text-white font-bold">TX</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-2.5 h-1.5 rounded-sm transition-all duration-75 ${txRxActive ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-teal-900'}`} />
                                    <span className="text-[5px] text-white font-bold">RX</span>
                                </div>
                              </div>

                              {/* LED ON */}
                              <div className="absolute top-[58px] right-[30px] flex items-center gap-1.5" style={{ transform: 'translateZ(5px)' }}>
                                  <span className="text-[6px] text-white font-bold uppercase">ON</span>
                                  <div className="w-2.5 h-1.5 rounded-sm bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                              </div>

                              {/* ICSP Header */}
                              <div className="absolute right-[5px] top-[95px] w-8 h-10 bg-[#111] rounded-sm p-1 flex flex-wrap gap-1 justify-center shadow-lg border border-black" style={{ transform: 'translateZ(10px)' }}>
                                {Array.from({ length: 6 }).map((_, i) => (
                                  <div key={`icsp-${i}`} className="w-2 h-2 rounded-full bg-zinc-800 shadow-inner flex items-center justify-center">
                                    <div className="w-1 h-1 bg-yellow-600/30 rounded-full" />
                                  </div>
                                ))}
                                <div className="absolute -bottom-4 text-[5px] text-white font-bold">ICSP</div>
                              </div>

                              {/* Headers Superiores */}
                              <div className="absolute top-[32px] right-[10px] flex pointer-events-none gap-[8px]">{renderLabels(digitalPinsGroup1, "8px", "dig1")}{renderLabels(digitalPinsGroup2, "8px", "dig2")}</div>
                              <div className="absolute top-[-4px] right-[10px] flex gap-[8px]" style={{ transform: 'translateZ(10px)' }}>{renderPinHeader(digitalPinsGroup1, "top1")}{renderPinHeader(digitalPinsGroup2, "top2")}</div>
                              
                              {/* MICRO ATMEGA Rediseñado */}
                              <div className="absolute right-[45px] bottom-[50px] w-[140px] h-[35px] bg-gradient-to-b from-[#222] to-[#111] rounded-sm flex items-center justify-center border-t border-white/10 shadow-xl" style={{ transform: 'translateZ(12px)' }}>
                                <div className="absolute top-1/2 left-2 w-2 h-2 rounded-full bg-black/40 -translate-y-1/2" />
                                <span className="text-[8px] text-slate-400 font-black tracking-[0.15em] drop-shadow-md">ATMEL ATMEGA328P</span>
                                
                                {/* Pines metálicos */}
                                <div className="absolute -bottom-1.5 w-full flex justify-around px-2">
                                  {Array.from({ length: 14 }).map((_, i) => (
                                    <div key={`pin-b-${i}`} className="w-[2px] h-[6px] bg-gradient-to-b from-slate-300 to-slate-500 rounded-b-sm" />
                                  ))}
                                </div>
                                <div className="absolute -top-1.5 w-full flex justify-around px-2">
                                  {Array.from({ length: 14 }).map((_, i) => (
                                    <div key={`pin-t-${i}`} className="w-[2px] h-[6px] bg-gradient-to-t from-slate-300 to-slate-500 rounded-t-sm" />
                                  ))}
                                </div>
                              </div>

                              {/* Headers Inferiores */}
                              <div className="absolute bottom-[34px] right-[10px] flex gap-[12px] pointer-events-none">{renderLabels(powerLabels, "-14px", "pwr")}{renderLabels(analogLabels, "-14px", "ana")}</div>
                              <div className="absolute bottom-[-4px] right-[10px] flex gap-[12px]" style={{ transform: 'translateZ(10px)' }}>
                                  <div className="flex bg-[#111] rounded-sm shadow-[0_2px_0_#000]">{powerLabels.map((l, i) => <div key={`p-${i}`} className="w-[16px] h-4 flex items-center justify-center border-r border-white/5"><div className="w-1.5 h-1.5 bg-zinc-800 rounded-full" /></div>)}</div>
                                  <div className="flex bg-[#111] rounded-sm shadow-[0_2px_0_#000]">{analogLabels.map((l, i) => <div key={`a-${i}`} className="w-[16px] h-4 flex items-center justify-center border-r border-white/5"><div className="w-1.5 h-1.5 bg-zinc-800 rounded-full" /></div>)}</div>
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

export default App;