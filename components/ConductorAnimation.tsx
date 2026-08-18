
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

export function ConductorAnimation() {
    const [isVoltageApplied, setIsVoltageApplied] = useState(false);

    const Atom = ({ cx, cy, label }: { cx: number; cy: number; label?: string }) => (
        <>
            <circle cx={cx} cy={cy} r="12" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            {label && <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="hsl(var(--primary-foreground))">{label}</text>}
        </>
    );

    const Electron = ({ path, duration, delay, isMoving }: { path: string; duration: string; delay: string, isMoving: boolean }) => (
         <circle r="3" fill="hsl(var(--primary))" className={isMoving ? '' : 'hidden'}>
            <animateMotion
                dur={duration}
                begin={`${delay}s`}
                repeatCount="indefinite"
                calcMode="linear"
            >
                <mpath href={path} />
            </animateMotion>
        </circle>
    );
    
    const BoundElectron = ({ cx, cy, orbitR, duration }: { cx: number; cy: number, orbitR: number, duration: string }) => (
       <g>
           <circle cx={cx} cy={cy} r={orbitR} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2 2"/>
           <circle r="3" fill="hsl(var(--primary))">
                <animateMotion dur={duration} repeatCount="indefinite" rotate="auto">
                    <mpath href={`#orbit-${cx}-${cy}`} />
                </animateMotion>
            </circle>
       </g>
    );

    return (
        <Card className="shadow-md max-w-md mx-auto">
            <CardHeader className="p-4 pb-2 text-center">
                <CardTitle className="text-xl">Conductores vs. Aislantes</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
                <div className="bg-secondary/30 rounded-lg p-4">
                    <svg viewBox="0 0 300 140" className="w-full">
                        <defs>
                            <path id="flow-path" d="M 0,35 C 50,15 60,55 110,35 C 160,15 170,55 230,35 C 280,15 290,55 300,35" />
                            {[50, 110, 170, 230].map(x => (
                                <path key={`orbit-path-${x}`} id={`orbit-${x}-110`} d={`M ${x} 110 m -20, 0 a 20,20 0 1,1 40,0 a 20,20 0 1,1 -40,0`} />
                            ))}
                        </defs>

                        {/* Conductor Section */}
                        <text x="150" y="15" fontSize="10" fontWeight="bold" fill="currentColor" textAnchor="middle">Conductor</text>
                        <g>
                            {[50, 110, 170, 230].map(x => <Atom key={`cu-${x}`} cx={x} cy={35} label="Cu" />)}
                        </g>
                         <g>
                             {Array.from({ length: 8 }).map((_, i) => (
                                <Electron 
                                    key={i} 
                                    path="#flow-path" 
                                    duration={`${2 + Math.random() * 1}s`} 
                                    delay={`${i * 0.25}`} 
                                    isMoving={isVoltageApplied}
                                 />
                             ))}
                        </g>


                        {/* Insulator Section */}
                        <text x="150" y="85" fontSize="10" fontWeight="bold" fill="currentColor" textAnchor="middle">Aislante</text>
                        <g>
                             {[50, 110, 170, 230].map(x => <Atom key={`ins-${x}`} cx={x} cy={110} />)}
                             {[50, 110, 170, 230].map(x => <BoundElectron key={`elec-${x}`} cx={x} cy={110} orbitR={20} duration={`${3 + Math.random()}s`} />)}
                        </g>

                         {/* Voltage Source representation */}
                         <g>
                             <rect x="0" y="20" width="15" height="30" fill={"hsl(var(--destructive))"} />
                             <text x="5" y="42" fontSize="14" fill={"hsl(var(--destructive-foreground))"} fontWeight="bold">+</text>
                             <rect x="285" y="20" width="15" height="30" fill={"hsl(var(--foreground))"} />
                             <text x="289" y="42" fontSize="14" fill={"hsl(var(--background))"} fontWeight="bold">-</text>
                         </g>

                    </svg>
                </div>
                 <p className="text-sm text-muted-foreground text-center">Activa el interruptor para ver el flujo de electrones.</p>
                 <div className="flex items-center space-x-2 justify-center">
                    <Switch 
                        id="voltage-switch"
                        checked={isVoltageApplied} 
                        onCheckedChange={setIsVoltageApplied}
                    />
                    <Label htmlFor="voltage-switch">Aplicar Voltaje</Label>
                </div>
            </CardContent>
        </Card>
    );
}
