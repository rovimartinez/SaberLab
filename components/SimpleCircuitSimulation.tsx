
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Lightbulb, LightbulbOff } from "lucide-react";

export function SimpleCircuitSimulation() {
  const [isSwitchClosed, setIsSwitchClosed] = useState(false);
  
  const switchPath = isSwitchClosed 
    ? "M 150 30 L 180 30"
    : "M 150 30 L 180 15";

    return (
    <div className="w-full max-w-md mx-auto my-6">
      <Card className="w-full shadow-lg">
        <CardHeader className="text-center">
          <CardTitle>Circuito simple</CardTitle>
          <CardDescription>Usa el interruptor para abrir y cerrar el circuito. Observa qué sucede con la bombilla y el flujo de electrones.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-secondary/30 rounded-lg px-4 pt-4 pb-2 flex items-center justify-center">
            <svg viewBox="0 0 300 180" className="w-full max-w-md">

              {/* === SECCIÓN DE CABLES === */}
              {/* Dibuja todos los cables excepto el del interruptor */}
              <path 
                d="M 50 150 L 50 91 M 50 30 L 150 30 M 180 30 L 250 30 L 250 150 L 50 150"
                stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" />
              
              {/* Dibuja la línea del interruptor por separado para animarla */}
              <path 
                d={switchPath}
                stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" className="transition-all" />
              
              {/* === SECCIÓN DE COMPONENTES === */}

              {/* --- BATERÍA --- */}
              <g transform="translate(50, 50)">
                  <line x1="0" y1="-21" x2="0" y2="30" stroke="hsl(var(--foreground))" strokeWidth="2" />
                  <line x1="-10" y1="30" x2="10" y2="30" stroke="hsl(var(--foreground))" strokeWidth="2" />
                  <line x1="-5" y1="40" x2="5" y2="40" stroke="hsl(var(--foreground))" strokeWidth="2" />
                  <text x="10" y="25" fontSize="10" fill="hsl(var(--foreground))">+</text>
                  <text x="10" y="50" fontSize="10" fill="hsl(var(--foreground))">-</text>
                  <text x="-25" y="40" fontSize="10" fill="hsl(var(--foreground))">V</text>
              </g>
              
              {/* --- INTERRUPTOR (S1) --- */}
              <circle cx="150" cy="30" r="3" fill="hsl(var(--foreground))" />
              <circle cx="180" cy="30" r="3" fill="hsl(var(--foreground))" />
              <text x="165" y="10" fontSize="10" fill="hsl(var(--foreground))" textAnchor="middle">S1</text>
              
              {/* --- BOMBILLA --- */}
              <g transform="translate(250, 90)">
                  <circle cx="0" cy="0" r="15" fill={isSwitchClosed ? 'yellow' : 'hsl(var(--muted))'} stroke="hsl(var(--foreground))" strokeWidth="1.5" className="transition-colors"/>
                  <line x1="-4" y1="4" x2="4" y2="-4" stroke="hsl(var(--foreground))" strokeWidth="1" />
                  <line x1="-4" y1="-4" x2="4" y2="4" stroke="hsl(var(--foreground))" strokeWidth="1" />
              </g>

              {/* === SECCIÓN DE ANIMACIÓN === */}
              {/* Ruta continua para los electrones */}
              <path
                  id="electron-flow-path-lab"
                  d="M 50 91 V 30 H 250 V 150 H 50 V 91"
                  fill="none"
              />
              {isSwitchClosed && Array.from({ length: 25 }).map((_, index) => (
                  <circle
                      key={index}
                      r="2.5"
                      fill="hsl(var(--primary))"
                  >
                      <animateMotion
                          dur="5s"
                          repeatCount="indefinite"
                          begin={`${index * 0.2}s`}
                          calcMode="linear"
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
            <Label htmlFor="circuit-switch" className={cn("flex items-center gap-2 font-semibold", isSwitchClosed ? "text-primary" : "text-muted-foreground")}>
              {isSwitchClosed ? <Lightbulb className="text-yellow-400" /> : <LightbulbOff/>}
              {isSwitchClosed ? 'Interruptor Cerrado (ON)' : 'Interruptor Abierto (OFF)'}
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
