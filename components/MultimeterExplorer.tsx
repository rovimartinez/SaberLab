
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Signal, Sun, Info } from 'lucide-react';
import CanvasSevenSegmentDisplay from "./SevenSegmentDisplay";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

// All types and components are now in this single file.

export type MultimeterMode = 'off' | 'v_ac' | 'v_dc' | 'res' | 'continuity' | 'diode' | 'capacitor' | 'ma_acdc' | 'a_acdc';

interface Hotspot {
    id: string;
    title: string;
    description: string;
    coords: { top: string; left: string; };
}

const multimeterHotspots: Hotspot[] = [
    { 
        id: 'screen', 
        title: 'Pantalla LCD', 
        description: 'Muestra las lecturas, la unidad y otros indicadores.',
        coords: { top: '125px', left: '162px' }
    },
    { 
        id: 'dial', 
        title: 'Perilla de Selección', 
        description: 'Gira para encender y seleccionar la magnitud a medir.',
        coords: { top: '340px', left: '162px' }
    },
    { 
        id: 'com', 
        title: 'Puerto COM', 
        description: 'Aquí siempre se conecta la punta de prueba negra.',
        coords: { top: '486px', left: '80px' }
    },
    { 
        id: 'vohm', 
        title: 'Puerto VΩmA', 
        description: 'Punta roja para medir Voltaje, Resistencia o pequeñas corrientes.',
        coords: { top: '486px', left: '162px' }
    },
];

const probeHotspots: Hotspot[] = [
    {
        id: 'probe-tip',
        title: 'Punta de Prueba',
        description: 'La punta metálica hace contacto físico con el punto del circuito.',
        coords: { top: '-7px', left: 'calc(50% - 10px)' }
    },
    {
        id: 'probe-handle',
        title: 'Mango Aislante',
        description: 'Permite sostener la punta de forma segura.',
        coords: { top: '100px', left: 'calc(50% - 10px)' }
    }
];

const DiodeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12h10" /><polygon points="14,7 20,12 14,17" /><path d="M20 7v10" />
    </svg>
);

const CapacitorIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 12H4" /><path d="M14 12h6" /><path d="M10 5v14" /><path d="M14 5v14" />
    </svg>
);

const modes: Record < MultimeterMode, { angle: number; label: React.ReactNode; unit: string; reading: string; position: { top: string; left: string }; description: string;} > = {
  off:        { angle: -120, label: 'OFF', unit: '', reading: ' ', position: { top: '133px', left: '32px' }, description: 'Apaga el multímetro.'},
  v_ac:       { angle: -90, label: 'V~', unit: 'V~', reading: '0.00', position: { top: '96px', left: '23px' }, description: 'Mide Voltaje en Corriente Alterna.'},
  v_dc:       { angle: -60, label: 'V⎓', unit: 'V⎓', reading: '0.00', position: { top: '59px', left: '33px' }, description: 'Mide Voltaje en Corriente Continua.'},
  res:        { angle: -30, label: <span style={{fontSize: '16px'}}>Ω</span>, unit: 'MΩ', reading: 'OL', position: { top: '31px', left: '59px' }, description: 'Mide Resistencia en Ohmios.'},
  continuity: { angle: 0, label: <Signal style={{width: '16px', height: '16px'}} />, unit: 'Ω', reading: 'OL', position: { top: '22px', left: '95px' }, description: 'Prueba si hay una conexión directa (pita).'},
  diode:      { angle: 30, label: <DiodeIcon />, unit: 'V', reading: 'OL', position: { top: '31px', left: '133px' }, description: 'Prueba de diodos.'},
  capacitor:  { angle: 60, label: <CapacitorIcon />, unit: 'nF', reading: '0.00', position: { top: '59px', left: '160px' }, description: 'Mide la capacidad de un condensador.'},
  ma_acdc:    { angle: 90, label: 'mA', unit: 'mA', reading: '0.0', position: { top: '96px', left: '170px' }, description: 'Mide corrientes pequeñas (miliamperios).'},
  a_acdc:     { angle: 120, label: 'A', unit: 'A', reading: '0.00', position: { top: '133px', left: '160px' }, description: 'Mide corrientes grandes (amperios).'},
};


const Probe = ({ color = 'black', showHotspots }: { color?: 'red' | 'black', showHotspots: boolean }) => {
    const isRed = color === 'red';
    const mainColor = isRed ? 'bg-red-600' : 'bg-black';
    const guardColor = isRed ? 'bg-red-700' : 'bg-slate-900';

    return (
        <div className="relative flex flex-col items-center">
            <div className="w-1 h-12 bg-slate-300 rounded-t-sm" />
            <div className={cn("w-3 h-2", mainColor)} />
            <div className={cn("w-6 h-1.5 rounded-sm", guardColor)} />
            <div className={cn("w-5 h-12 p-1", mainColor)}><div className="w-full h-full bg-[linear-gradient(to_right,transparent_1px,rgba(0,0,0,0.2)_1px),linear-gradient(to_bottom,transparent_1px,rgba(0,0,0,0.2)_1px)] bg-[size:3px_3px] rounded-sm"></div></div>
            <div className={cn("w-4 h-24", mainColor)} />
            <div className={cn("w-3 h-1 rounded-b-md", mainColor)} />
            {/* The thin part of the cable that enters the probe */}
            <div className={cn("w-1.5 h-6", isRed ? 'bg-red-800' : 'bg-gray-800')} />

            {showHotspots && probeHotspots.map((spot) => (
                <Popover key={spot.id}>
                    <PopoverTrigger asChild>
                        <button className="absolute w-5 h-5 bg-primary rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 z-20" style={{ top: spot.coords.top, left: spot.coords.left }} aria-label={`Información sobre ${spot.title}`}>
                             <Info className="w-3 h-3 text-primary-foreground animate-glow" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56" side="top">
                        <h4 className="font-bold">{spot.title}</h4>
                        <p className="text-sm text-muted-foreground">{spot.description}</p>
                    </PopoverContent>
                </Popover>
            ))}
        </div>
    );
};


export function MultimeterExplorer() {
  const [showHotspots, setShowHotspots] = useState(true);
  const [activeMode, setActiveMode] = useState<MultimeterMode>('off');
  const [isBacklit, setIsBacklit] = useState(false);
  
  const selectedFunction = modes[activeMode];
  const isComPortActive = activeMode !== 'off';
  const isVohmPortActive = (activeMode !== 'off' && activeMode !== 'a_acdc');
  const isAPortActive = (activeMode === 'a_acdc');

  const DialOption = ({ optionMode, label, position }: { optionMode: MultimeterMode; label: React.ReactNode; position: { top: string; left: string }}) => (
        <button onClick={() => setActiveMode(optionMode)} className={cn("absolute text-xs font-bold transition-colors flex items-center justify-center -translate-x-1/2 -translate-y-1/2", activeMode === optionMode ? 'text-white' : 'text-slate-400 hover:text-white')} style={position}>
            {label}
        </button>
  );

  return (
    <Card className="shadow-lg overflow-hidden">
        <CardContent className="p-[5px]">
             <div className="relative flex justify-center items-end gap-4">
                 <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                    {/* Black Cable */}
                    <path
                        d="M 80 486 C 80 550, 150 550, 150 632"
                        stroke="#333"
                        strokeWidth="5"
                        fill="none"
                        strokeLinecap="round"
                    />
                     {/* Red Cable */}
                    <path
                        d="M 162 486 C 162 550, 200 550, 200 632"
                        stroke="#991b1b"
                        strokeWidth="5"
                        fill="none"
                        strokeLinecap="round"
                    />
                </svg>

                {/* --- MULTIMETER BODY --- */}
                <div className="relative p-[25px] bg-[#FB4346] rounded-3xl w-[350px]">
                    <div className="w-[300px] rounded-xl p-6 border-2 font-sans select-none" style={{ backgroundColor: '#59585B', borderColor: '#3E3E40' }}>
                        <div className="mb-2 text-left"><h2 className="text-white font-bold tracking-wider">Multimetro RM-01</h2></div>
                        <div className="rounded-lg p-4 h-24 flex flex-col justify-between border-2 border-slate-900/50 shadow-inner transition-all" style={{ backgroundColor: isBacklit ? '#BFDEE9' : '#B0ADA0' }}>
                            <div className="font-bold text-sm text-left transition-colors" style={{ color: isBacklit ? '#1F4178' : '#333' }}>
                                {modes[activeMode].unit}
                            </div>
                            <div className="flex-grow flex justify-end items-end h-full">
                                <CanvasSevenSegmentDisplay value={modes[activeMode].reading} color={isBacklit ? '#1F4178' : '#333'} ghostColor={isBacklit ? 'rgba(31, 65, 120, 0.1)' : 'rgba(51, 51, 51, 0.1)'} charHeight={50} showGhost={activeMode !== 'off'} />
                            </div>
                        </div>
                        <div className='flex justify-end items-center mt-4 px-2 space-x-4'>
                            <button onClick={() => setIsBacklit(!isBacklit)} className={cn('text-white text-xs font-bold py-1.5 px-3 rounded-md flex items-center gap-1.5 transition-all shadow-[0_3px_0_0_#2563EB] hover:brightness-110 active:shadow-none active:translate-y-0.5')} style={{ backgroundColor: '#5B9DCF' }}>
                                <span>HOLD /</span><Sun className='h-3.5 w-3.5' />
                            </button>
                        </div>
                        <div className="relative flex items-center justify-center my-8">
                            <div className="relative w-48 h-48">
                                <div className="absolute inset-0 rounded-full border-4 shadow-inner" style={{backgroundColor: '#525254', borderColor: '#2A2A2B' }}></div>
                                {Object.entries(modes).map(([key, config]) => <DialOption key={key} optionMode={key as MultimeterMode} label={config.label} position={config.position} />)}
                                <motion.div className="absolute inset-10 rounded-full flex items-start justify-center pt-1 shadow-md" animate={{ rotate: modes[activeMode].angle }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} style={{ backgroundColor: '#5E5C5E' }}>
                                    <div className="w-1 h-8 bg-white rounded-full shadow-md"></div>
                                </motion.div>
                            </div>
                        </div>
                        <div className="flex justify-around items-center text-white text-xs font-bold mt-4">
                            <div className="text-center">
                                <div className={cn("w-10 h-10 rounded-full bg-black border-4 border-slate-700 shadow-inner mb-1 transition-all", isComPortActive && "ring-2 ring-offset-2 ring-yellow-400 ring-offset-[#59585B]")}></div>
                                <p>COM</p>
                            </div>
                            <div className="text-center">
                                <div className={cn("w-10 h-10 rounded-full bg-red-800 border-4 border-slate-700 shadow-inner mb-1 transition-all", isVohmPortActive && "ring-2 ring-offset-2 ring-yellow-400 ring-offset-[#59585B]")}></div>
                                <p>VΩmA</p>
                            </div>
                            <div className="text-center">
                                <div className={cn("w-10 h-10 rounded-full bg-red-800 border-4 border-slate-700 shadow-inner mb-1 transition-all", isAPortActive && "ring-2 ring-offset-2 ring-yellow-400 ring-offset-[#59585B]")}></div>
                                <p>10 A</p>
                            </div>
                        </div>
                    </div>
                    {showHotspots && multimeterHotspots.map((spot) => (
                        <Popover key={spot.id}>
                            <PopoverTrigger asChild>
                                <button className="absolute w-6 h-6 bg-primary rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 z-20" style={{ top: spot.coords.top, left: spot.coords.left }} aria-label={`Información sobre ${spot.title}`}>
                                    <Info className="w-4 h-4 text-primary-foreground animate-glow" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64" side="top">
                                <h4 className="font-bold">{spot.title}</h4>
                                <p className="text-sm text-muted-foreground">{spot.description}</p>
                            </PopoverContent>
                        </Popover>
                    ))}
                </div>
                {/* --- PROBES --- */}
                <div className="relative flex flex-row gap-8">
                    <Probe color="black" showHotspots={showHotspots} />
                    <Probe color="red" showHotspots={showHotspots} />
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
