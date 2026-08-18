
"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Waves, Zap } from 'lucide-react';

// =============================================
// Settings & Constants
// =============================================
const SNAP_THRESHOLD = 20; // pixels
const NODE_RADIUS = 8;
const PROBE_RADIUS = 6;
const SVG_VIEWBOX = "0 0 450 300";
const MAX_PARTICLES = 15;
const ANIMATION_DURATION_SECONDS = 5;

// Definición de nodos fijos dentro del SVG
const NODES = {
  A: { id: 'A', x: 50, y: 150 },
  B: { id: 'B', x: 50, y: 70 },
  C: { id: 'C', x: 150, y: 70 },
  D: { id: 'D', x: 150, y: 150 },
};

// Posiciones de los Jacks en el SVG
const JACKS = {
    RED: { x: 380, y: 220 },
    BLACK: { x: 320, y: 220 }
}

// =============================================
// Helper Functions
// =============================================
const fmt = (n: number) => n.toFixed(2);

const getNodePotential = (nodeId: string | null, vSource: number) => {
  if (!nodeId) return 0;
  switch (nodeId) {
    case 'B':
      return vSource;
    case 'A':
    case 'C':
    case 'D':
      return 0;
    default:
      return 0;
  }
};


const cablePath = (from: {x:number, y:number}, to: {x:number, y:number}) => {
    const controlX1 = from.x;
    const controlY1 = from.y + 60;
    const controlX2 = to.x;
    const controlY2 = to.y + (from.y > to.y ? 60 : -60);
    return `M ${from.x} ${from.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${to.x} ${to.y}`;
};

// =============================================
// Main Component
// =============================================
export function InteractiveMeasurement() {
    const [voltage, setVoltage] = React.useState(1);
    const [resistance, setResistance] = React.useState(10);

    const [redProbePos, setRedProbePos] = React.useState({ x: 100, y: 250 });
    const [blackProbePos, setBlackProbePos] = React.useState({ x: 150, y: 250 });
    
    const [draggingProbe, setDraggingProbe] = React.useState<'red' | 'black' | null>(null);

    const svgRef = React.useRef<SVGSVGElement>(null);
    const gRef = React.useRef<SVGGElement>(null);


    const { current, power, numParticles } = React.useMemo(() => {
        const v = voltage;
        const r = resistance;
        const i = r > 0 ? v / r : 0;
        const p = v * i;
        let particles = Math.round((i / 0.5) * MAX_PARTICLES);
        particles = Math.max(0, Math.min(MAX_PARTICLES, particles));
        if (i > 0 && particles === 0) particles = 1;
        
        return {
            current: i,
            power: p,
            numParticles: particles
        };
    }, [voltage, resistance]);

    const particleInterval = ANIMATION_DURATION_SECONDS / MAX_PARTICLES;


    // =============================================
    // Interaction Logic
    // =============================================
     const getCoordsInSvg = (e: React.PointerEvent) => {
        const svg = svgRef.current;
        const g = gRef.current;
        if (!svg || !g) return { x: 0, y: 0 };
    
        const point = svg.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;

        const ctm = g.getScreenCTM()?.inverse();
        if (!ctm) return { x: 0, y: 0 };
    
        return point.matrixTransform(ctm);
    };

    const getNearestNode = React.useCallback((x: number, y: number) => {
        let closestNode: keyof typeof NODES | null = null;
        let minDistance = Infinity;
        
        for (const nodeId in NODES) {
            const node = NODES[nodeId as keyof typeof NODES];
            const distance = Math.hypot(x - node.x, y - node.y);

            if (distance < minDistance) {
                minDistance = distance;
                closestNode = nodeId as keyof typeof NODES;
            }
        }
        return { node: closestNode, distance: minDistance };
    }, []);
    
    const getConnectedNode = React.useCallback((pos: {x: number, y: number}) => {
        const { node, distance } = getNearestNode(pos.x, pos.y);
        return distance < SNAP_THRESHOLD ? node : null;
    }, [getNearestNode]);
    
    const redConnectedTo = getConnectedNode(redProbePos);
    const blackConnectedTo = getConnectedNode(blackProbePos);

    const measuredVoltage = React.useMemo(() => {
        if (!redConnectedTo || !blackConnectedTo) return 0;
        const vRed = getNodePotential(redConnectedTo, voltage);
        const vBlack = getNodePotential(blackConnectedTo, voltage);
        return vRed - vBlack;
    }, [redConnectedTo, blackConnectedTo, voltage]);

    // =============================================
    // SVG Mouse Event Handlers
    // =============================================
    const handlePointerDown = (probe: 'red' | 'black') => (e: React.PointerEvent) => {
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
        setDraggingProbe(probe);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!draggingProbe || !svgRef.current) return;
        const pos = getCoordsInSvg(e);
        if (draggingProbe === 'red') setRedProbePos(pos);
        else setBlackProbePos(pos);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!draggingProbe) return;
        
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
        const currentPos = draggingProbe === 'red' ? redProbePos : blackProbePos;
        const { node, distance } = getNearestNode(currentPos.x, currentPos.y);
        
        if (node && distance < SNAP_THRESHOLD) {
            const snapPos = NODES[node];
            if (draggingProbe === 'red') setRedProbePos(snapPos);
            else setBlackProbePos(snapPos);
        }
        
        setDraggingProbe(null);
    };

    // =============================================
    // Render
    // =============================================
    return (
        <div className="w-full space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Instrucciones</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-4'>
                    <p>
                        Este es un laboratorio virtual para medir el <strong>voltaje</strong> en un circuito simple.
                    </p>
                    <ul className='list-disc pl-5 space-y-2'>
                        <li>Usa los <strong>deslizadores</strong> para cambiar el voltaje de la fuente y el valor de la resistencia.</li>
                        <li>Observa cómo cambia el flujo de electrones (partículas azules).</li>
                        <li><strong>Arrastra las puntas de prueba</strong> (círculos rojo y negro) y suéltalas sobre los nodos del circuito (círculos azules A, B, C, D).</li>
                        <li>La pantalla del <strong>voltímetro</strong> mostrará la diferencia de potencial (voltaje) entre los dos puntos que estás tocando.</li>
                    </ul>
                </CardContent>
            </Card>

            <div 
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                {/* --- Columna Izquierda: Controles y Resultados --- */}
                <div className='space-y-6'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Controles del Circuito</CardTitle>
                        </CardHeader>
                        <CardContent className='grid grid-cols-1 gap-6'>
                             <div className='space-y-2'>
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="voltage-slider" className='flex items-center gap-2'>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500"><path d="M14 3.11V2H10V3.11C5.99 3.65 3 7.37 3 11.5C3 16.33 6.67 20 11.5 20C16.33 20 20 16.33 20 11.5C20 7.37 17.01 3.65 13 3.11V2" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 21V22H10V21" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/><path d="M14.5 11.5H8.5V13.5H14.5V11.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/><path d="M11.5 8.5V16.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        Voltaje Fuente (V)
                                    </Label>
                                    <span className="font-bold text-lg text-primary">{fmt(voltage)} V</span>
                                </div>
                                <Slider id="voltage-slider" min={0} max={50} step={0.1} value={[voltage]} onValueChange={([v]) => setVoltage(v)} />
                            </div>
                            <div className='space-y-2'>
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="resistance-slider" className='flex items-center gap-2'>
                                        <span className="text-red-500 font-bold text-lg w-4 h-4 flex items-center justify-center">Ω</span>
                                        Resistencia R1 (Ω)
                                    </Label>
                                    <span className="font-bold text-lg text-primary">{resistance.toFixed(0)} Ω</span>
                                </div>
                                <Slider id="resistance-slider" min={10} max={100} step={1} value={[resistance]} onValueChange={([r]) => setResistance(r)} />
                            </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Resultados del Circuito</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                             <div className="p-3 bg-secondary/50 rounded-lg text-center">
                                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><Waves/> Corriente Total</p>
                                <p className="text-2xl font-bold">{current.toFixed(3)} A</p>
                            </div>
                             <div className="p-3 bg-secondary/50 rounded-lg text-center">
                                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><Zap/> Potencia Total</p>
                                <p className="text-2xl font-bold">{power.toFixed(2)} W</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                 {/* --- Columna Derecha: Simulación --- */}
                <Card>
                    <CardContent className="p-2">
                            <div className="relative w-full aspect-[4/3] rounded-lg touch-none bg-secondary/30">
                            <svg ref={svgRef} viewBox={SVG_VIEWBOX} className='w-full h-full absolute top-0 left-0'>
                                <g ref={gRef}>
                                    {/* Multimeter */}
                                    <g>
                                        <rect x="260" y="50" width="180" height="205" rx="10" fill="#facc15" stroke="#ca8a04" strokeWidth="1"/>
                                        <rect x="275" y="90" width="150" height="50" rx="5" fill="#3f3f46" className="shadow-inner"/>
                                        <text x="415" y="130" textAnchor='end' className="text-[40px] fill-[#00FF41] font-mono tracking-wider select-none">
                                        {fmt(measuredVoltage)}
                                        </text>
                                        <text x="350" y="75" textAnchor='middle' className="text-lg font-bold text-black tracking-widest">VOLTÍMETRO</text>
                                        <line x1="275" y1="155" x2="425" y2="155" stroke="#92400e" strokeWidth="0.5"/>
                                        <g>
                                            <circle cx={JACKS.RED.x} cy={JACKS.RED.y} r="12" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
                                            <text x={JACKS.RED.x} y={JACKS.RED.y - 18} textAnchor="middle" className="text-[10px] font-bold fill-black">VΩmA</text>
                                        </g>
                                        <g>
                                            <circle cx={JACKS.BLACK.x} cy={JACKS.BLACK.y} r="12" fill="#171717" stroke="#44403c" strokeWidth="2" />
                                            <text x={JACKS.BLACK.x} y={JACKS.BLACK.y - 18} textAnchor="middle" className="text-[10px] font-bold fill-black">COM</text>
                                        </g>
                                    </g>
                                    {/* Circuit */}
                                    <g>
                                        <path
                                            id="electron-flow-path"
                                            d="M 50 150 L 50 70 L 150 70 L 150 150 Z"
                                            fill="none"
                                            stroke="none"
                                        />
                                        <path 
                                            d="M 50 150 L 50 125 M 50 115 L 50 70 L 80 70 M 120 70 L 150 70 L 150 150 L 50 150" 
                                            stroke="hsl(var(--foreground))" 
                                            strokeWidth="2" 
                                            fill="none" 
                                        />
                                        <rect x="80" y="62" width="40" height="16" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="1.5"/>
                                        <text x="100" y="58" fontSize="8" fill="hsl(var(--foreground))" textAnchor="middle">R1</text>
                                        <g transform="translate(50, 120)">
                                            <line x1="-12" y1="0" x2="12" y2="0" stroke="hsl(var(--foreground))" strokeWidth="2" transform="translate(0, -5)" />
                                            <line x1="-6" y1="0" x2="6" y2="0" stroke="hsl(var(--foreground))" strokeWidth="2" transform="translate(0, 5)" />
                                            <text x="-20" y="-2" fontSize="8" fill="hsl(var(--foreground))" textAnchor="start">+</text>
                                            <text x="-20" y="8" fontSize="8" fill="hsl(var(--foreground))" textAnchor="start">-</text>
                                        </g>
                                    </g>
                                    {/* Electron Animation */}
                                    <g>
                                        {Array.from({ length: MAX_PARTICLES }).map((_, index) => {
                                            const isVisible = index < numParticles;
                                            return (
                                                <circle 
                                                    key={index}
                                                    r="2.5"
                                                    fill="hsl(var(--primary))"
                                                    style={{ display: isVisible ? 'block' : 'none' }}
                                                >
                                                    <animateMotion
                                                        dur={`${ANIMATION_DURATION_SECONDS}s`}
                                                        repeatCount="indefinite"
                                                        begin={`${index * particleInterval}s`}
                                                        calcMode="linear"
                                                    >
                                                        <mpath href="#electron-flow-path" />
                                                    </animateMotion>
                                                </circle>
                                            )
                                        })}
                                    </g>
                                    {/* Nodes */}
                                    <g>
                                    {Object.values(NODES).map(node => (
                                        <g key={node.id}>
                                            <circle cx={node.x} cy={node.y} r={NODE_RADIUS} fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" />
                                            {redConnectedTo === node.id && (
                                                <circle cx={node.x} cy={node.y} r={NODE_RADIUS + 3} fill="none" stroke="hsl(var(--destructive))" strokeWidth="2.5" />
                                            )}
                                            {blackConnectedTo === node.id && (
                                                <circle cx={node.x} cy={node.y} r={NODE_RADIUS + 3} fill="none" stroke="hsl(var(--foreground))" strokeWidth="2.5" />
                                            )}
                                        </g>
                                    ))}
                                    {Object.values(NODES).map(node => (
                                    <text 
                                        key={`${node.id}-label`} 
                                        x={node.id.match(/[CD]/) ? node.x + 15 : node.x - 15 }
                                        y={node.id.match(/[AB]/) ? node.y - 15 : node.y + 20 }
                                        textAnchor="middle" fontSize="12" fill="currentColor" className="select-none font-bold">
                                        {node.id}
                                    </text>
                                    ))}
                                    </g>
                                    {/* Probes and Cables */}
                                    <g>
                                        <path d={cablePath(JACKS.BLACK, blackProbePos)} fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" />
                                        <path d={cablePath(JACKS.RED, redProbePos)} fill="none" stroke="hsl(var(--destructive))" strokeWidth="2" strokeLinecap="round" />
                                        <circle cx={blackProbePos.x} cy={blackProbePos.y} r={PROBE_RADIUS} fill="hsl(var(--foreground))" stroke="hsl(var(--border))" strokeWidth="2" className={cn(draggingProbe ? 'cursor-grabbing' : 'cursor-grab', 'transition-transform')} onPointerDown={handlePointerDown('black')} />
                                        <circle cx={redProbePos.x} cy={redProbePos.y} r={PROBE_RADIUS} fill="hsl(var(--destructive))" stroke="hsl(var(--destructive-foreground))" strokeWidth="2" className={cn(draggingProbe ? 'cursor-grabbing' : 'cursor-grab', 'transition-transform')} onPointerDown={handlePointerDown('red')} />
                                    </g>
                                </g>
                            </svg>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
