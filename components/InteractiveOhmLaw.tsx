

"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Battery, Waves, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// =============================================
// Settings & Constants
// =============================================
const MAX_PARTICLES = 10;
const ANIMATION_DURATION_SECONDS = 8;
const MAX_CURRENT_FOR_GAUGE = 10; // Maximum current (A) for the gauge to show 100%

interface InteractiveOhmLawProps {
    showResults?: boolean;
    showResistanceControl?: boolean;
    isExerciseMode?: boolean;
}

const Control = ({ label, value, children }: { label: string, value: string, children: React.ReactNode }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <Label className="text-sm">{label}</Label>
            <span className="font-bold text-lg text-primary">{value}</span>
        </div>
        {children}
    </div>
);

const CurrentGauge = ({ current }: { current: number }) => {
    const percentage = Math.min((current / MAX_CURRENT_FOR_GAUGE) * 100, 100);
    let barColor = 'hsl(var(--primary))';
    if (current === Infinity) {
        barColor = 'hsl(var(--destructive))';
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label className="text-sm">Corriente</Label>
                 <span className="font-bold text-lg text-primary">{current === Infinity ? "∞ A" : `${current.toFixed(2)} A`}</span>
            </div>
             <div className="w-full h-8 bg-muted rounded-full flex items-center relative overflow-hidden border p-1">
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: barColor }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${current === Infinity ? 100 : percentage}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                />
            </div>
        </div>
    )
}

const ExerciseMode = () => {
    type Variable = 'v' | 'i' | 'r';
    const [problem, setProblem] = useState<{ v: number | null, i: number | null, r: number | null, unknown: Variable | null }>({ v: null, i: null, r: null, unknown: null });
    const [showSolution, setShowSolution] = useState(false);
    const [isGenerating, setIsGenerating] = useState(true);
    const [shufflingVariable, setShufflingVariable] = useState<Variable | null>(null);

    const generateProblem = () => {
        setShowSolution(false);
        setIsGenerating(true);
        setProblem({ v: null, i: null, r: null, unknown: null }); // Clear old values

        const variables: Variable[] = ['v', 'i', 'r'];
        let shuffleCount = 0;
        const interval = setInterval(() => {
            setShufflingVariable(variables[shuffleCount % variables.length]);
            shuffleCount++;
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            setShufflingVariable(null);
            
            const unknownVar = variables[Math.floor(Math.random() * 3)];
            
            let v = 0, i = 0, r = 0;

            if (unknownVar === 'i') {
                v = Math.floor(Math.random() * 50) + 1; // 1-50 V
                r = Math.floor(Math.random() * 1000) + 1; // 1-1000 Ω
                i = v / r;
            } else if (unknownVar === 'v') {
                i = (Math.random() * 5) + 0.1; // 0.1-5.1 A
                r = Math.floor(Math.random() * 20) + 1; // 1-20 Ω
                v = i * r;
            } else { // unknownVar === 'r'
                v = Math.floor(Math.random() * 100) + 10; // 10-110V
                i = (Math.random() * 5) + 0.1; // 0.1-5.1 A
                r = v / i;
            }
            
            setProblem({ v, i, r, unknown: unknownVar });
            setIsGenerating(false);

        }, 2000);
    };
    
    useEffect(() => {
        generateProblem();
    }, []);

    const DataBox = ({ label, unit, value, isUnknown, isShuffling }: { label: string, unit: string, value: number | null, isUnknown: boolean, isShuffling: boolean }) => {
        let displayValue: string;
        let solutionValue: string | null = null;
        
        if (value !== null) {
            if (unit === 'A') {
                solutionValue = value.toFixed(3);
            } else {
                solutionValue = value.toFixed(0);
            }
        }

        if (isGenerating && value === null) {
            displayValue = '--';
        } else if (isUnknown && !showSolution) {
            displayValue = '?';
        } else if (solutionValue) {
            displayValue = solutionValue;
        } else {
             displayValue = '--';
        }
        
        return (
             <div className={cn(
                "flex-grow basis-1/3 bg-background p-3 rounded-lg transition-all duration-100 flex items-baseline justify-between gap-2", 
                (isUnknown || isShuffling) && "ring-2 ring-primary"
            )}>
                <p className="text-sm text-muted-foreground font-semibold">{label}</p>
                <div className="flex items-baseline gap-1">
                    <p className={cn("font-bold text-xl sm:text-2xl font-mono", (isUnknown || isShuffling) && "text-primary")}>
                        {displayValue}
                    </p>
                    <p className="text-sm font-semibold text-muted-foreground">{unit}</p>
                </div>
            </div>
        );
    }

    return (
        <Card className="bg-secondary/30 border-dashed mb-6">
            <CardContent className="p-4 space-y-4">
                 <div className="flex flex-col md:flex-row gap-3">
                    <DataBox label="Voltaje" unit="V" value={problem.v} isUnknown={problem.unknown === 'v'} isShuffling={shufflingVariable === 'v'}/>
                    <DataBox label="Corriente" unit="A" value={problem.i} isUnknown={problem.unknown === 'i'} isShuffling={shufflingVariable === 'i'}/>
                    <DataBox label="Resistencia" unit="Ω" value={problem.r} isUnknown={problem.unknown === 'r'} isShuffling={shufflingVariable === 'r'}/>
                </div>
                <div className="flex justify-center flex-col sm:flex-row gap-2">
                     <Button onClick={generateProblem} variant="secondary" disabled={isGenerating}>
                        <RefreshCw className={cn("mr-2 h-4 w-4", isGenerating && "animate-spin")} />
                        Nuevo Ejercicio
                    </Button>
                    <Button onClick={() => setShowSolution(true)} disabled={showSolution || isGenerating || !problem.unknown}>
                        <Eye className="mr-2 h-4 w-4" />
                        Mostrar Resultado
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export function InteractiveOhmLaw({ showResults = true, showResistanceControl = true, isExerciseMode = false }: InteractiveOhmLawProps) {
    
    if (isExerciseMode) {
        return <ExerciseMode />;
    }
    
    const [voltage, setVoltage] = useState(10);
    const [resistance, setResistance] = useState(10);

    const { current, numParticles, isShortCircuit } = useMemo(() => {
        const v = voltage;
        const r = resistance;
        
        if (r === 0) {
            return { current: Infinity, numParticles: 0, isShortCircuit: true };
        }
        
        const i = v / r;
        
        // 1 particle for every 1A
        let particles = Math.round(i);
        particles = Math.max(0, Math.min(MAX_PARTICLES, particles));
        
        return { 
            current: i, 
            numParticles: particles,
            isShortCircuit: false
        };
    }, [voltage, resistance]);
    
    const particleInterval = ANIMATION_DURATION_SECONDS / MAX_PARTICLES;

    return (
        <Card className="w-full max-w-full my-6">
            <CardHeader className="text-center p-4">
                <CardTitle className="text-xl">Simulador de Circuito Interactivo</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                 <div className="grid md:grid-cols-2 gap-8 items-stretch">
                    {/* Columna Izquierda: Visualización del Circuito */}
                     <div className="bg-secondary/30 p-4 rounded-lg flex items-center justify-center relative w-full h-full">
                         <svg width="100%" height="100%" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(150, 50)">
                                <path d="M-50 0 h 30 l 5 -8 l 10 16 l 10 -16 l 10 16 l 10 -16 l 5 8 h 30" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            </g>
                            <path 
                                d="M 50 150 L 50 105 M 50 95 L 50 50 L 100 50 M 200 50 L 250 50 L 250 150 L 50 150"
                                stroke="hsl(var(--foreground))" 
                                strokeWidth="2" 
                                fill="none" 
                            />
                            <g transform="translate(50, 100)">
                                <line x1="-12" y1="-5" x2="12" y2="-5" stroke="hsl(var(--foreground))" strokeWidth="2" />
                                <line x1="-6" y1="5" x2="6" y2="5" stroke="hsl(var(--foreground))" strokeWidth="2" />
                                <text x="18" y="-3" fontSize="10" fill="hsl(var(--foreground))" textAnchor="start">+</text>
                                <text x="18" y="8" fontSize="10" fill="hsl(var(--foreground))" textAnchor="start">-</text>
                            </g>
                            <path 
                                id="electron-path-main"
                                d="M 50 150 L 50 50 L 250 50 L 250 150 Z"
                                fill="none"
                                stroke="none"
                            />
                            {!isShortCircuit && Array.from({ length: MAX_PARTICLES }).map((_, index) => {
                                const isVisible = index < numParticles;
                                return (
                                    <circle 
                                        key={index}
                                        r="3"
                                        fill="hsl(var(--primary))"
                                        style={{ display: isVisible ? 'block' : 'none' }}
                                    >
                                        <animateMotion
                                            dur={`${ANIMATION_DURATION_SECONDS}s`}
                                            repeatCount="indefinite"
                                            begin={`${index * particleInterval}s`}
                                            calcMode="linear"
                                        >
                                            <mpath href="#electron-path-main" />
                                        </animateMotion>
                                    </circle>
                                )
                            })}
                        </svg>
                        {isShortCircuit && (
                            <div className="absolute inset-0 bg-red-500/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg text-white font-bold text-center p-4 z-10 animate-pulse">
                                <AlertTriangle className="w-16 h-16 mb-2" />
                                <p className="text-xl">¡PELIGRO!</p>
                                <p>CORTOCIRCUITO</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Columna Derecha: Controles y Resultados */}
                    <div className="space-y-6">
                        <Control label="Voltaje" value={`${voltage.toFixed(0)} V`}>
                            <Slider 
                                min={0} max={10} 
                                step={1} 
                                value={[voltage]} 
                                onValueChange={([v]) => setVoltage(v)}
                            />
                        </Control>
                        
                        {showResistanceControl && (
                             <Control label="Resistencia" value={`${resistance.toFixed(0)} Ω`}>
                                <Slider 
                                    min={0} max={10} 
                                    step={1} 
                                    value={[resistance]} 
                                    onValueChange={([r]) => setResistance(r)}
                                />
                            </Control>
                        )}

                        {showResults && <CurrentGauge current={current}/>}
                    </div>
                </div>
                 <p className="text-center text-sm text-muted-foreground mt-4">
                    Ajusta los valores y observa cómo se comporta el circuito.
                </p>
            </CardContent>
        </Card>
    );
}
