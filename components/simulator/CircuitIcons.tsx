
"use client";

import React from "react";
import type { MixedTopology } from "@/lib/types";

// =============================================
// Helper Components
// =============================================

interface SVGProps extends React.SVGProps<SVGSVGElement> {}

export const Resistor = ({ x, y, vertical = false, label }: { x: number; y: number; vertical?: boolean; label?: string }) => (
  <>
    <rect 
      x={vertical ? x - 8 : x - 20} 
      y={vertical ? y - 20 : y - 8} 
      width={vertical ? 16 : 40} 
      height={vertical ? 40 : 16} 
      fill="hsl(var(--card))" 
      stroke="currentColor" 
      strokeWidth="1.5"
      rx="4"
    />
    {label && <text x={vertical ? x + 12 : x} y={vertical ? y + 20 : y - 16} fontSize="10" textAnchor={vertical ? "start" : "middle"} fill="currentColor">{label}</text>}
  </>
);

export const BatteryIcon = ({ x, y, vertical = false }: { x: number; y: number; vertical?: boolean; }) => (
   <g transform={`translate(${x}, ${y})`}>
        {vertical ? (
            <>
                <line x1="0" y1="-12" x2="0" y2="12" stroke="currentColor" strokeWidth="2" transform="translate(-5, 0)" />
                <line x1="0" y1="-6" x2="0" y2="6" stroke="currentColor" strokeWidth="2" transform="translate(5, 0)" />
                <text x="-10" y="-5" fontSize="12" fill="currentColor" textAnchor="end">+</text>
                <text x="-10" y="12" fontSize="12" fill="currentColor" textAnchor="end">-</text>
            </>
        ) : (
            <>
                <line x1="-12" y1="0" x2="12" y2="0" stroke="currentColor" strokeWidth="1.5" transform="translate(0, -5)" />
                <line x1="-6" y1="0" x2="6" y2="0" stroke="currentColor" strokeWidth="1.5" transform="translate(0, 5)" />
                <text x="18" y="-3" fontSize="8" fill="currentColor" textAnchor="start">+</text>
                <text x="18" y="8" fontSize="8" fill="currentColor" textAnchor="start">-</text>
            </>
        )}
    </g>
);

export const BasicCircuitIcon = (props: SVGProps) => (
  <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g>
      <path 
        d="M 50 100 L 50 75 M 50 65 L 50 20 L 80 20 M 120 20 L 150 20 L 150 100 L 50 100" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        fill="none" 
      />
      <Resistor x={100} y={20} label="R1"/>
      <BatteryIcon x={50} y={70} />
      <text x={25} y="75" fontSize="10" fill="currentColor">V</text>
      <circle cx="150" cy="100" r="3" fill="currentColor" />
    </g>
  </svg>
);
BasicCircuitIcon.displayName = "BasicCircuitIcon";

export const SeriesCircuitIcon = ({ numResistors = 2, ...props }: SVGProps & { numResistors?: number }) => {
    const resistorWidth = 40;
    const spacing = 15;
    const startX = 100;
    
    const resistorsTotalWidth = (numResistors * resistorWidth) + ((numResistors - 1) * spacing);
    const endPathX = startX + resistorsTotalWidth;
    const viewboxWidth = endPathX + 60;

    let path = `M 50 100 L 50 80 M 50 60 L 50 40 L ${startX - resistorWidth/2} 40`;
    
    for (let i = 0; i < numResistors; i++) {
        const R_X = startX + i * (resistorWidth + spacing);
        path += ` M ${R_X + resistorWidth/2} 40`;
        if (i < numResistors - 1) {
             path += ` L ${R_X + resistorWidth/2 + spacing} 40`;
        }
    }
   
    path += ` L ${endPathX - resistorWidth/2} 40 L ${endPathX - resistorWidth/2 + 20} 40 L ${endPathX - resistorWidth/2 + 20} 100 L 50 100`;

    return (
        <svg viewBox={`0 0 ${viewboxWidth} 120`} xmlns="http://www.w3.org/2000/svg" {...props}>
            <path 
                d={path}
                stroke="currentColor" 
                strokeWidth="1.5" 
                fill="none" 
            />
            {Array.from({ length: numResistors }).map((_, i) => (
                 <Resistor key={i} x={startX + i * (resistorWidth + spacing)} y={40} label={`R${i + 1}`} />
            ))}
            <g transform="translate(50, 70)">
                <line x1="-12" y1="0" x2="12" y2="0" stroke="currentColor" strokeWidth="1.5" transform="translate(0, -5)" />
                <line x1="-6" y1="0" x2="6" y2="0" stroke="currentColor" strokeWidth="1.5" transform="translate(0, 5)" />
            </g>
            <text x={10} y={75} fontSize="10">V</text>
            <text x={65} y="68" fontSize="10" fill="currentColor" textAnchor="start">+</text>
            <text x={65} y="82" fontSize="10" fill="currentColor" textAnchor="start">-</text>
        </svg>
    )
};

export const ParallelCircuitIcon = ({ numResistors = 2, ...props }: SVGProps & { numResistors?: number }) => {
    const startX = 100;
    const resistorSpacing = 50;
    const totalWidth = startX + (numResistors - 1) * resistorSpacing + 30;

    return (
        <svg viewBox={`0 0 ${totalWidth + 30} 140`} xmlns="http://www.w3.org/2000/svg" {...props}>
            {/* Main Wires */}
            <path
                d={`
                    M 50 120 L 50 95 M 50 85 L 50 20 L ${startX} 20
                    M ${startX} 120 L 50 120
                `}
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
            />
            
            {/* Battery */}
            <BatteryIcon x={50} y={90} />
            <text x={10} y={95} fontSize="10">V</text>

            {/* Resistor Branches */}
            {Array.from({ length: numResistors }).map((_, i) => {
                const x = startX + i * resistorSpacing;
                return (
                    <g key={i}>
                        <path d={`M ${x} 20 L ${x} 40 M ${x} 80 L ${x} 120`} stroke="currentColor" strokeWidth="1.5" fill="none" />
                        <Resistor x={x} y={60} vertical label={`R${i+1}`} />
                    </g>
                );
            })}
             {/* Closing wires */}
             <path d={`M ${startX} 20 L ${startX + (numResistors-1) * resistorSpacing} 20`} stroke="currentColor" strokeWidth="1.5" fill="none" />
             <path d={`M ${startX} 120 L ${startX + (numResistors-1) * resistorSpacing} 120`} stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
    );
};


// Specific topologies for MixedCircuitIcon
const Serie2Paralelo2 = (props: SVGProps) => (
    <svg viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg" {...props}>
        {/* Wires */}
        <path d="M 80 60 L 130 60" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M 180 60 L 230 60" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M 280 60 L 340 60" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M 340 60 L 380 60" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M 380 60 L 380 40" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M 380 60 L 380 80" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M 380 40 L 430 40" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M 380 80 L 430 80" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M 430 40 L 450 40" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M 430 80 L 450 80" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M 450 40 L 450 60" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M 450 80 L 450 60" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M 450 60 L 480 60" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M 480 60 L 480 110" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M 480 110 L 50 110" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M 50 110 L 50 90 M 50 70 L 50 60" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M 50 60 L 80 60" stroke="currentColor" strokeWidth="1.5"/>
        
        {/* Battery Symbol */}
         <g transform="translate(50, 75)">
            {/* Long line for positive terminal */}
            <line x1="-15" y1="-5" x2="15" y2="-5" stroke="currentColor" strokeWidth="2" />
            {/* Short line for negative terminal */}
            <line x1="-8" y1="5" x2="8" y2="5" stroke="currentColor" strokeWidth="2" />
        </g>
        
        {/* Labels */}
        <text x="25" y="80" fontSize="14" fontWeight="bold" fill="currentColor">V</text>
        <text x="70" y="72" fontSize="12" fill="currentColor" textAnchor="start">+</text>
        <text x="70" y="86" fontSize="12" fill="currentColor" textAnchor="start">-</text>

        {/* Resistors */}
        <rect x="130" y="54" width="50" height="12" fill="hsl(var(--card))" stroke="currentColor" strokeWidth="1.5"/>
        <text x="155" y="48" textAnchor="middle" fontSize="12" fill="currentColor">R1</text>
        <rect x="230" y="54" width="50" height="12" fill="hsl(var(--card))" stroke="currentColor" strokeWidth="1.5"/>
        <text x="255" y="48" textAnchor="middle" fontSize="12" fill="currentColor">R2</text>
        <rect x="395" y="34" width="35" height="12" fill="hsl(var(--card))" stroke="currentColor" strokeWidth="1.5"/>
        <text x="412" y="28" textAnchor="middle" fontSize="12" fill="currentColor">R3</text>
        <rect x="395" y="74" width="35" height="12" fill="hsl(var(--card))" stroke="currentColor" strokeWidth="1.5"/>
        <text x="412" y="100" textAnchor="middle" fontSize="12" fill="currentColor">R4</text>
    </svg>
);


const Paralelo2Serie2 = (props: SVGProps) => (
    <svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" {...props}>
         <path d="M 50 40 L 90 40" stroke="currentColor" strokeWidth="1.5"/>
         <path d="M 90 40 L 90 25" stroke="currentColor" strokeWidth="1.5"/>
         <path d="M 90 40 L 90 55" stroke="currentColor" strokeWidth="1.5"/>
         <path d="M 90 25 L 120 25" stroke="currentColor" strokeWidth="1.5"/>
         <path d="M 90 55 L 120 55" stroke="currentColor" strokeWidth="1.5"/>
         <path d="M 150 25 L 160 25" stroke="currentColor" strokeWidth="1.5"/>
         <path d="M 150 55 L 160 55" stroke="currentColor" strokeWidth="1.5"/>
         <path d="M 160 25 L 160 40" stroke="currentColor" strokeWidth="1.5"/>
         <path d="M 160 55 L 160 40" stroke="currentColor" strokeWidth="1.5"/>
         <path d="M 160 40 L 180 40" stroke="currentColor" strokeWidth="1.5"/>
         <path d="M 210 40 L 230 40" stroke="currentColor" strokeWidth="1.5"/>
         <path d="M 260 40 L 280 40" stroke="currentColor" strokeWidth="1.5"/>
         <path d="M 280 40 L 280 80" stroke="currentColor" strokeWidth="1.5"/>
         <path d="M 280 80 L 30 80" stroke="currentColor" strokeWidth="1.5"/>
         <path d="M 30 80 L 30 65 M 30 50 L 30 40" stroke="currentColor" strokeWidth="1.5"/>
         <path d="M 30 40 L 50 40" stroke="currentColor" strokeWidth="1.5"/>
        
        {/* Battery Symbol */}
        <g transform="translate(30, 52.5)">
            <line x1="-5" y1="-2.5" x2="5" y2="-2.5" stroke="currentColor" strokeWidth="2.5"/>
            <line x1="-3" y1="2.5" x2="3" y2="2.5" stroke="currentColor" strokeWidth="1.5"/>
        </g>
        
        <text x="12" y="53" fontSize="12" fontWeight="bold" fill="currentColor">V</text>
        <text x="38" y="48" fontSize="10" fill="currentColor">+</text>
        <text x="38" y="60" fontSize="10" fill="currentColor">-</text>
        
        <rect x="120" y="19" width="30" height="12" fill="hsl(var(--card))" stroke="currentColor" strokeWidth="1.5"/>
        <text x="135" y="15" textAnchor="middle" fontSize="10" fill="currentColor">R1</text>
        
        <rect x="120" y="49" width="30" height="12" fill="hsl(var(--card))" stroke="currentColor" strokeWidth="1.5"/>
        <text x="135" y="75" textAnchor="middle" fontSize="10" fill="currentColor">R2</text>
        
        <rect x="180" y="34" width="30" height="12" fill="hsl(var(--card))" stroke="currentColor" strokeWidth="1.5"/>
        <text x="195" y="30" textAnchor="middle" fontSize="10" fill="currentColor">R3</text>
        
        <rect x="230" y="34" width="30" height="12" fill="hsl(var(--card))" stroke="currentColor" strokeWidth="1.5"/>
        <text x="245" y="30" textAnchor="middle" fontSize="10" fill="currentColor">R4</text>
    </svg>
);


const Serie1Paralelo1Serie2 = (props: SVGProps) => (
     <svg viewBox="0 0 340 140" xmlns="http://www.w3.org/2000/svg" {...props}>
        {/* Main Path */}
        <path d="M 40 120 L 40 95 M 40 85 L 40 70 L 60 70 M 100 70 L 120 70" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M 120 70 L 120 40 L 140 40" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M 120 70 L 120 100 L 140 100" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M 180 40 L 280 40 L 280 70" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M 180 100 L 220 100 M 260 100 L 280 100 L 280 70" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M 280 70 L 320 70 L 320 120 L 40 120" stroke="currentColor" strokeWidth="1.s" fill="none" />
        
        {/* Components */}
        <BatteryIcon x={40} y={90} />
        <text x={10} y={95} fontSize="10">V</text>
        <Resistor x={80} y={70} label="R1"/>
        <Resistor x={160} y={40} label="R2"/>
        <Resistor x={160} y={100} label="R3"/>
        <Resistor x={240} y={100} label="R4"/>
    </svg>
)

const Serie1Paralelo2Serie1 = (props: SVGProps) => (
    <svg viewBox="0 0 280 120" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M 30 100 L 30 75 M 30 65 L 30 40 L 60 40 M 100 40 L 120 40 M 120 20 L 140 20 M 120 60 L 140 60 M 180 20 L 200 20 M 180 60 L 200 60 M 200 20 L 200 40 M 200 60 L 200 40 M 120 20 L 120 40 M 120 60 L 120 40 M 200 40 L 220 40 M 260 40 L 280 40 L 280 100 L 30 100" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <Resistor x={80} y={40} label="R1"/>
        <Resistor x={160} y={20} label="R2"/>
        <Resistor x={160} y={60} label="R3"/>
        <Resistor x={240} y={40} label="R4"/>
        <BatteryIcon x={30} y={70} />
        <text x={10} y={75} fontSize="10">V</text>
    </svg>
)

export const MixedCircuitIcon = ({ topology, ...props }: SVGProps & { topology?: MixedTopology }) => {
    switch (topology) {
        case 'Serie (2) -> Paralelo (2)':
            return <Serie2Paralelo2 {...props} />;
        case 'Paralelo (2) -> Serie (2)':
            return <Paralelo2Serie2 {...props} />;
        case 'Serie (1) -> Paralelo (1 Serie (2))':
            return <Serie1Paralelo1Serie2 {...props} />;
        case 'Serie (1) -> Paralelo (2) -> Serie (1)':
            return <Serie1Paralelo2Serie1 {...props} />;
        default:
            return <Serie1Paralelo2Serie1 {...props} />;
    }
};

    



