
"use client";

import { useState, useRef, lazy, Suspense } from 'react';
import type { ReactNode, PointerEvent } from 'react';
import { cn } from '@/lib/utils';
import { Signal, Sun } from 'lucide-react';

const motion = {
  div: lazy(() => import('framer-motion').then(m => ({ default: m.motion.div }))),
  path: lazy(() => import('framer-motion').then(m => ({ default: m.motion.path })))
};

type MultimeterMode = 'off' | 'v_ac' | 'v_dc' | 'res' | 'continuity' | 'diode' | 'capacitor' | 'ma_acdc' | 'a_acdc';

interface ModeConfig {
  angle: number;
  label: ReactNode;
  unit: string;
  reading: string;
  position: { top: string; left: string };
}

const DiodeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12h10" />
        <polygon points="14,7 20,12 14,17" />
        <path d="M20 7v10" />
    </svg>
);

const CapacitorIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 12H4" />
        <path d="M14 12h6" />
        <path d="M10 5v14" />
        <path d="M14 5v14" />
    </svg>
);

const modes: Record < MultimeterMode, ModeConfig > = {
  off:        { angle: -120, label: 'OFF', unit: '', reading: '', position: { top: '133px', left: '32px' }},
  v_ac:       { angle: -90, label: 'V~', unit: 'V~', reading: '0.00', position: { top: '96px', left: '23px' }},
  v_dc:       { angle: -60, label: 'V⎓', unit: 'V⎓', reading: '0.00', position: { top: '59px', left: '33px' }},
  res:        { angle: -30, label: <span style={{fontSize: '16px'}}>Ω</span>, unit: 'MΩ', reading: 'OL', position: { top: '31px', left: '59px' }},
  continuity: { angle: 0, label: <Signal style={{width: '16px', height: '16px'}} />, unit: 'Ω', reading: 'OL', position: { top: '22px', left: '95px' }},
  diode:      { angle: 30, label: <DiodeIcon />, unit: 'V', reading: 'OL', position: { top: '31px', left: '133px' }},
  capacitor:  { angle: 60, label: <CapacitorIcon />, unit: 'nF', reading: '0.00', position: { top: '59px', left: '160px' }},
  ma_acdc:    { angle: 90, label: 'mA', unit: 'mA', reading: '0.0', position: { top: '96px', left: '170px' }},
  a_acdc:     { angle: 120, label: 'A', unit: 'A', reading: '0.00', position: { top: '133px', left: '160px' }},
};

const DialOption = ({
    optionMode,
    label,
    position
  }: {
    optionMode: MultimeterMode;
    label: ReactNode;
    position: { top: string; left: string };
  }) => {
    const [mode, setMode] = useMultimeterState(state => [state.mode, state.setMode]);
    return (
        <button 
            onClick = {() => setMode(optionMode)}
            className = {cn(
                "absolute text-xs font-bold transition-colors flex items-center justify-center -translate-x-1/2 -translate-y-1/2",
                mode === optionMode ? 'text-orange-400' : 'text-slate-400 hover:text-white'
            )} 
            style={position}
        >
            {label}
        </button>
    )
};


// Simple state management for multimeter
const createStore = <T extends object>(initialState: T) => {
    let state = initialState;
    const listeners = new Set<(state: T) => void>();
    const getState = () => state;
    const setState = (updater: (state: T) => T) => {
        state = updater(state);
        listeners.forEach(l => l(state));
    };
    const subscribe = (listener: (state: T) => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }
    return { getState, setState, subscribe };
};

const multimeterStore = createStore({
    mode: 'off' as MultimeterMode,
    isBacklit: false,
    setMode: (mode: MultimeterMode) => multimeterStore.setState(s => ({ ...s, mode })),
    setIsBacklit: (isBacklit: boolean) => multimeterStore.setState(s => ({ ...s, isBacklit })),
});

const useMultimeterState = <U,>(selector: (state: ReturnType<typeof multimeterStore.getState>) => U) => {
    const [state, setState] = useState(() => selector(multimeterStore.getState()));
    
    useState(() => {
        return multimeterStore.subscribe(s => setState(selector(s)));
    }, []);
    
    return state;
}

const MultimeterBody = () => {
  const mode = useMultimeterState(s => s.mode);
  const isBacklit = useMultimeterState(s => s.isBacklit);
  const { setMode, setIsBacklit } = multimeterStore.getState();

  const activeMode = modes[mode];

  const isComPortActive = mode !== 'off';
  const isVohmPortActive = ['v_ac', 'v_dc', 'res', 'continuity', 'diode', 'capacitor', 'ma_acdc'].includes(mode);
  const isAPortActive = mode === 'a_acdc';

  return (
    <div 
        className="w-full max-w-xs rounded-xl bg-slate-800 p-6 border-t-2 border-l-2 border-slate-700 font-sans select-none"
        style={{
            borderBottom: '4px solid #0f172a',
            borderRight: '4px solid #0f172a',
        }}
    > 
      <div className="mb-2 text-left">
          <h2 className="text-white font-bold tracking-wider">Multimetro RM-02</h2>
      </div>

      <div className={cn(
        "bg-gray-900/80 rounded-lg p-4 h-28 flex flex-col justify-between border-2 border-slate-700 shadow-inner transition-all",
        isBacklit && "bg-cyan-800/60"
        )}>
        <div className={cn("text-right text-orange-400 font-bold text-lg transition-colors", isBacklit && "text-orange-300")}>
            {activeMode.unit}
        </div> 
        <div className={cn("text-cyan-400 text-6xl text-right font-digital tracking-wider transition-all", isBacklit && "text-white [text-shadow:0_0_8px_theme(colors.cyan.300)]")}>
            {activeMode.reading} 
        </div> 
      </div>
      
      <div className='flex justify-end items-center mt-4 px-2 space-x-4'>
            <button
                onClick={() => setIsBacklit(!isBacklit)}
                className={cn(
                    'bg-sky-500 text-white text-xs font-bold py-1.5 px-3 rounded-md flex items-center gap-1.5 transition-all shadow-[0_3px_0_0_#0891b2] hover:bg-sky-600',
                    'active:shadow-none active:translate-y-0.5'
                )}
            >
                <span>HOLD /</span>
                <Sun className='h-3.5 w-3.5' />
            </button>
      </div>

      <div className="relative flex items-center justify-center my-8">
        <div className="relative w-48 h-48">
          <div className="absolute inset-0 bg-gray-700 rounded-full border-4 border-slate-900 shadow-inner"></div>
            {Object.entries(modes).map(([key, config]) => ( 
                <DialOption key={key} optionMode={key as MultimeterMode} label={config.label} position={config.position} />
            ))}
          <Suspense fallback={null}>
            <motion.div 
              className="absolute inset-10 bg-slate-900 rounded-full flex items-start justify-center pt-1 shadow-md"
              animate={{ rotate: activeMode.angle }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className="w-1 h-8 bg-orange-500 rounded-full shadow-md"></div> 
            </motion.div>
          </Suspense>
        </div> 
      </div>

      <div className="flex justify-around items-center text-white text-xs font-bold mt-4">
        <div className="text-center">
            <div className={cn("w-10 h-10 rounded-full bg-black border-4 border-slate-700 shadow-inner mb-1 transition-all", isComPortActive && "ring-2 ring-offset-2 ring-yellow-400 ring-offset-slate-800")}></div>
            <p>COM</p>
        </div>
        <div className="text-center">
            <div className={cn("w-10 h-10 rounded-full bg-red-800 border-4 border-slate-700 shadow-inner mb-1 transition-all", isVohmPortActive && "ring-2 ring-offset-2 ring-yellow-400 ring-offset-slate-800")}></div>
            <p>VΩmA</p>
        </div>
        <div className="text-center">
            <div className={cn("w-10 h-10 rounded-full bg-red-800 border-4 border-slate-700 shadow-inner mb-1 transition-all", isAPortActive && "ring-2 ring-offset-2 ring-yellow-400 ring-offset-slate-800")}></div>
            <p>10 A</p>
        </div>
      </div> 
    </div>
  );
};


export function MultimeterRM2() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [redProbePos, setRedProbePos] = useState({ x: 290, y: 450 });
    const [blackProbePos, setBlackProbePos] = useState({ x: 30, y: 450 });
    const draggedProbe = useRef<'red' | 'black' | null>(null);
    const offset = useRef({ x: 0, y: 0 });
    const mode = useMultimeterState(s => s.mode);

    const handlePointerDown = (e: PointerEvent<HTMLDivElement>, probe: 'red' | 'black') => {
        draggedProbe.current = probe;
        const probeEl = e.currentTarget;
        const pos = probe === 'red' ? redProbePos : blackProbePos;
        offset.current.x = e.clientX - pos.x;
        offset.current.y = e.clientY - pos.y;
        probeEl.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
        if (!draggedProbe.current) return;
        
        let newX = e.clientX - offset.current.x;
        let newY = e.clientY - offset.current.y;
        
        if (draggedProbe.current === 'red') {
            setRedProbePos({ x: newX, y: newY });
        } else {
            setBlackProbePos({ x: newX, y: newY });
        }
    };
    
    const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
        draggedProbe.current = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
    };
    
    const portPositions = {
        com: { x: 70, y: 540 },
        vohm: { x: 160, y: 540 },
        port10A: { x: 250, y: 540 },
    }
    
    const cablePath = (start: {x: number, y: number}, end: {x: number, y: number}) => {
      const cp1 = { x: start.x, y: start.y + 70 };
      const cp2 = { x: end.x, y: end.y > start.y ? end.y - 100 : end.y + 100 };
      return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
    };

    const redCableStart = mode === 'a_acdc' ? portPositions.port10A : portPositions.vohm;


    return (
        <div 
            ref={containerRef}
            className="relative w-full max-w-xs h-[650px] touch-none overflow-visible"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-xs" style={{ zIndex: 10 }}>
                 <MultimeterBody />
            </div>

            <Suspense fallback={null}>
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 20 }}>
                    <motion.path 
                        d={cablePath(portPositions.com, blackProbePos)}
                        stroke="#A9A9A9" 
                        fill="none" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    <motion.path 
                        d={cablePath(redCableStart, redProbePos)}
                        stroke="#7F1D1D" 
                        fill="none" 
                        strokeWidth="8" 
                        strokeLinecap="round" 
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                </svg>
            </Suspense>

            <div 
                className="absolute w-4 h-12 bg-gray-500 rounded-md cursor-grab pointer-events-auto"
                style={{ left: blackProbePos.x-8, top: blackProbePos.y-48, zIndex: 30 }}
                onPointerDown={e => handlePointerDown(e, 'black')}
            >
               <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-15 border-l-transparent border-r-transparent border-b-gray-400" style={{borderLeftWidth: '6px', borderRightWidth: '6px', borderBottomWidth: '15px'}}></div>
            </div>
            <div 
                className="absolute w-4 h-12 bg-red-700 rounded-md cursor-grab pointer-events-auto"
                style={{ left: redProbePos.x-8, top: redProbePos.y-48, zIndex: 30 }}
                onPointerDown={e => handlePointerDown(e, 'red')}
            >
                 <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-15 border-l-transparent border-r-transparent border-b-gray-400" style={{borderLeftWidth: '6px', borderRightWidth: '6px', borderBottomWidth: '15px'}}></div>
            </div>
        </div>
    );
}
