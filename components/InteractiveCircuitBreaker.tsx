
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NODES = {
  A: { id: 'A', x: 50, y: 150 },
  B: { id: 'B', x: 50, y: 70 },
  C: { id: 'C', x: 200, y: 70 },
  D: { id: 'D', x: 200, y: 150 },
};

export function InteractiveCircuitBreaker() {
  const [isSwitchClosed, setIsSwitchClosed] = useState(false);
  
  const switchPath = isSwitchClosed 
    ? "M 125 70 L 155 70"  // Closed
    : "M 125 70 L 155 50"; // Open

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle>Circuito de Prueba</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-secondary/30 rounded-lg p-4">
          <svg viewBox="0 0 250 220" className="w-full">
            {/* Wires */}
            <path 
              d="M 50 150 L 50 90 M 50 50 L 50 70 L 75 70"
              stroke="hsl(var(--foreground))"
              strokeWidth="2"
              fill="none"
            />
            <path 
              d="M 125 70 L 105 70"
              stroke="hsl(var(--foreground))"
              strokeWidth="2"
              fill="none"
            />
            <path 
              d="M 155 70 L 175 70"
              stroke="hsl(var(--foreground))"
              strokeWidth="2"
              fill="none"
            />
             <path 
              d={switchPath}
              stroke="hsl(var(--foreground))"
              strokeWidth="2"
              fill="none"
              className="transition-all"
            />
            <path 
              d="M 200 70 L 200 150 L 50 150"
              stroke="hsl(var(--foreground))"
              strokeWidth="2"
              fill="none"
            />
            
            {/* Components */}
            <g transform="translate(50, 70)">
              <line x1="-12" y1="0" x2="12" y2="0" stroke="hsl(var(--foreground))" strokeWidth="2" transform="translate(0, -10)" />
              <line x1="-6" y1="0" x2="6" y2="0" stroke="hsl(var(--foreground))" strokeWidth="2" transform="translate(0, 10)" />
              <text x="-20" y="-5" fontSize="8" fill="hsl(var(--foreground))" textAnchor="start">+</text>
              <text x="-20" y="12" fontSize="8" fill="hsl(var(--foreground))" textAnchor="start">-</text>
              <text x="-20" y="3" fontSize="8" fill="hsl(var(--foreground))" textAnchor="start">12V</text>
            </g>

            <rect x="75" y="62" width="30" height="16" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="1.5"/>
            <text x="90" y="55" fontSize="8" fill="hsl(var(--foreground))" textAnchor="middle">R1</text>
            
            <circle cx="125" cy="70" r="3" fill="hsl(var(--foreground))" />
            <circle cx="155" cy="70" r="3" fill="hsl(var(--foreground))" />
            <text x="140" y="90" fontSize="8" fill="hsl(var(--foreground))" textAnchor="middle">S1</text>

            {/* Nodes */}
            {Object.values(NODES).map(node => (
              <g key={node.id}>
                <circle cx={node.x} cy={node.y} r="6" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" />
                <text x={node.x} y={node.y + 18} textAnchor="middle" fontSize="12" fill="currentColor" className="select-none font-bold">{node.id}</text>
              </g>
            ))}

             {/* Electron Flow Animation */}
            <path
                id="electron-flow-path-lab"
                d="M 50 150 L 200 150 L 200 70 L 155 70 L 125 70 L 75 70 L 50 70 Z"
                fill="none"
            />
             {isSwitchClosed && Array.from({ length: 15 }).map((_, index) => (
                <circle
                    key={index}
                    r="2"
                    fill="hsl(var(--accent))"
                >
                    <animateMotion
                        dur="5s"
                        repeatCount="indefinite"
                        begin={`${index * 0.33}s`}
                    >
                        <mpath href="#electron-flow-path-lab" />
                    </animateMotion>
                </circle>
            ))}

          </svg>
        </div>
        <div className="flex items-center space-x-2 mt-4 justify-center">
          <Switch 
              id="circuit-switch"
              checked={isSwitchClosed} 
              onCheckedChange={setIsSwitchClosed}
          />
          <Label htmlFor="circuit-switch" className={cn(isSwitchClosed ? "text-primary" : "text-muted-foreground")}>
            {isSwitchClosed ? 'Interruptor Cerrado (ON)' : 'Interruptor Abierto (OFF)'}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
