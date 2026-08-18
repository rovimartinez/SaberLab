
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const LegendItem = ({ color, label }: { color: string, label: string }) => (
    <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
);

export const AtomSVG = () => (
    <Card className="my-6 shadow-md w-full max-w-sm mx-auto">
        <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Estructura del Átomo</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
            <div className="flex items-center justify-center aspect-square bg-secondary/30 rounded-lg">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <defs>
                        <path id="orbit1" d="M 100, 100 m -50, 0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0"/>
                        <path id="orbit2" d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0"/>
                    </defs>

                    <circle cx="100" cy="100" r="50" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />
                    <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />

                    <g>
                        <circle cx="100" cy="100" r="20" fill="hsl(var(--primary) / 0.1)" />
                        <circle cx="96" cy="96" r="8" fill="#ef4444" />
                        <circle cx="104" cy="96" r="8" fill="#facc15" />
                        <circle cx="96" cy="104" r="8" fill="#ef4444" />
                        <circle cx="104" cy="104" r="8" fill="#facc15" />
                    </g>

                    <circle r="6" fill="hsl(var(--primary))">
                        <animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
                            <mpath href="#orbit1" />
                        </animateMotion>
                    </circle>
                    <circle r="6" fill="hsl(var(--primary))">
                        <animateMotion dur="10s" repeatCount="indefinite" rotate="auto" begin="-2s">
                            <mpath href="#orbit2" />
                        </animateMotion>
                    </circle>
                </svg>
            </div>
            <div className="flex justify-center gap-4 mt-4 pt-2">
                <LegendItem color="#ef4444" label="Protón" />
                <LegendItem color="#facc15" label="Neutrón" />
                <LegendItem color="hsl(var(--primary))" label="Electrón" />
            </div>
        </CardContent>
    </Card>
);
