
"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Signal, Sun } from 'lucide-react';
import type { ReactNode } from 'react';

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
  off:        { angle: -135, label: 'OFF', unit: '', reading: '', position: { top: '145px', left: '40px' }},
  v_ac:       { angle: -100, label: 'V~', unit: 'V~', reading: '0.00', position: { top: '120px', left: '20px' }},
  v_dc:       { angle: -65, label: 'V⎓', unit: 'V⎓', reading: '0.00', position: { top: '80px', left: '20px' }},
  res:        { angle: -30, label: <span style={{fontSize: '16px'}}>Ω</span>, unit: 'MΩ', reading: 'OL', position: { top: '45px', left: '45px' }},
  continuity: { angle: 0, label: <Signal style={{width: '16px', height: '16px'}} />, unit: 'Ω', reading: 'OL', position: { top: '22px', left: '85px' }},
  diode:      { angle: 30, label: <DiodeIcon />, unit: 'V', reading: 'OL', position: { top: '45px', left: '150px' }},
  capacitor:  { angle: 60, label: <CapacitorIcon />, unit: 'nF', reading: '0.00', position: { top: '80px', left: '170px' }},
  ma_acdc:    { angle: 90, label: 'mA', unit: 'mA', reading: '0.0', position: { top: '120px', left: '170px' }},
  a_acdc:     { angle: 120, label: 'A', unit: 'A', reading: '0.00', position: { top: '145px', left: '150px' }},
};


export function RealisticMultimeter() {
  const [mode, setMode] = useState < MultimeterMode > ('off');
  const [isBacklit, setIsBacklit] = useState(false);

  const activeMode = modes[mode];

  const handleModeChange = (newMode: MultimeterMode) => {
    setMode(newMode);
  }

  const isComPortActive = mode !== 'off';
  const isVohmPortActive = ['v_ac', 'v_dc', 'res', 'continuity', 'diode', 'capacitor', 'ma_acdc'].includes(mode);
  const isAPortActive = mode === 'a_acdc';

  const DialOption = ({
    optionMode,
    label,
    position
  }: {
    optionMode: MultimeterMode;
    label: ReactNode;
    position: { top: string; left: string };
  }) => ( 
    <button 
        onClick = {
          () => handleModeChange(optionMode)
        }
        className = {
          cn(
            "absolute text-xs font-bold transition-colors flex items-center justify-center -translate-x-1/2 -translate-y-1/2",
            mode === optionMode ? 'text-orange-400' : 'text-slate-400 hover:text-white'
          )
        } 
        style={position}
    >
        {label}
    </button>
  );

  return ( 
    <div 
        className="w-full max-w-xs rounded-xl bg-slate-800 p-6 border-t-2 border-l-2 border-slate-700 font-sans select-none relative"
        style={{
            borderBottom: '4px solid #0f172a',
            borderRight: '4px solid #0f172a',
            boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.75)'
        }}
    > 
      <div className="mb-2 text-left">
          <h2 className="text-white font-bold tracking-wider">Multimetro RM-01</h2>
      </div>

      <div className = {cn(
        "bg-gray-900/80 rounded-lg p-4 h-28 flex flex-col justify-between border-2 border-slate-700 shadow-inner transition-all",
        isBacklit && "bg-cyan-800/60"
        )} >
        <div className = {cn("text-right text-orange-400 font-bold text-lg transition-colors", isBacklit && "text-orange-300")} > {
          activeMode.unit
        } </div> 
        <div className = {cn("text-cyan-400 text-6xl text-right font-digital tracking-wider transition-all", isBacklit && "text-white [text-shadow:0_0_8px_theme(colors.cyan.300)]")} > {
          activeMode.reading
        } 
        </div> 
      </div>
      
       <div className='flex justify-end items-center mt-4 px-2 space-x-4'>
            <button
                onClick={() => setIsBacklit(!isBacklit)}
                className='bg-sky-500 text-white text-xs font-bold py-1.5 px-3 rounded-md flex items-center gap-1.5 transition-all active:shadow-none active:translate-y-0.5 shadow-[0_3px_0_0_#0891b2] hover:bg-sky-600'
            >
                <span>HOLD /</span>
                <Sun className='h-3.5 w-3.5' />
            </button>
       </div>

    <div className = "relative flex items-center justify-center my-8" >
      <div className = "relative w-48 h-48" >
        <div className = "absolute inset-0 bg-gray-700 rounded-full border-4 border-slate-900 shadow-inner" > </div>
          {
            Object.entries(modes).map(([key, config]) => ( 
            <DialOption key = {key} optionMode = {key as MultimeterMode} label = {config.label} position = {config.position} />
            ))
          }
        <motion.div className = "absolute inset-10 bg-slate-900 rounded-full flex items-start justify-center pt-1 shadow-md"
          animate = {{ rotate: activeMode.angle }}
          transition = {{ type: 'spring', stiffness: 200, damping: 20 }} >
          <div className = "w-1 h-8 bg-orange-500 rounded-full shadow-md" > </div> 
        </motion.div> 
      </div> 
    </div>

    <div className = "flex justify-around items-center text-white text-xs font-bold mt-4" >
      <div className = "text-center" >
        <div className = {cn("w-10 h-10 rounded-full bg-black border-4 border-slate-700 shadow-inner mb-1 transition-all", isComPortActive && "ring-2 ring-offset-2 ring-yellow-400 ring-offset-slate-800")} > </div> 
        <p > COM </p> 
      </div> 
      <div className = "text-center" >
        <div className = {cn("w-10 h-10 rounded-full bg-red-800 border-4 border-slate-700 shadow-inner mb-1 transition-all", isVohmPortActive && "ring-2 ring-offset-2 ring-yellow-400 ring-offset-slate-800")} > </div> 
        <p > VΩmA </p> 
      </div> 
      <div className = "text-center" >
        <div className = {cn("w-10 h-10 rounded-full bg-red-800 border-4 border-slate-700 shadow-inner mb-1 transition-all", isAPortActive && "ring-2 ring-offset-2 ring-yellow-400 ring-offset-slate-800")} > </div> 
        <p > 10 A </p> 
      </div> 
    </div> 
  </div>
  );
}
