
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

type Variable = 'V' | 'I' | 'R';

const formulas = {
    V: { text: "V = I × R", explanation: "Para encontrar el Voltaje, multiplica la Corriente por la Resistencia." },
    I: { text: "I = V / R", explanation: "Para encontrar la Corriente, divide el Voltaje entre la Resistencia." },
    R: { text: "R = V / I", explanation: "Para encontrar la Resistencia, divide el Voltaje entre la Corriente." },
}

export function InteractiveLawTriangle() {
    const [variableToSolve, setVariableToSolve] = useState<Variable>('V');

    const TriangleText = ({ variable, displayChar, x, y }: { variable: Variable, displayChar: string, x: number, y: number }) => (
        <g 
            onClick={() => setVariableToSolve(variable)} 
            className="cursor-pointer group"
        >
            <text 
                x={x} y={y} 
                className={cn(
                    "font-headline text-5xl text-center transition-all fill-muted-foreground group-hover:fill-primary/70",
                    variableToSolve === variable ? "fill-primary animate-text-glow" : ""
                )}
                textAnchor="middle"
                dominantBaseline="middle"
            >
                {displayChar}
            </text>
        </g>
    );

    const Triangle = () => {
        return (
            <svg viewBox="0 0 200 173.2" className="w-full max-w-[180px] drop-shadow-lg">
                <polygon 
                    points="100,0 200,173.2 0,173.2" 
                    className={cn(
                        "stroke-foreground fill-secondary transition-all"
                    )} 
                    strokeWidth="2"
                />

                {/* Dividing lines */}
                <line x1="50" y1="86.6" x2="150" y2="86.6" className="stroke-foreground" strokeWidth="2" />
                <line x1="100" y1="86.6" x2="100" y2="173.2" className="stroke-foreground" strokeWidth="2" />
                
                <TriangleText variable={'V'} displayChar={'V'} x={100} y={55} />
                <TriangleText variable={'I'} displayChar={'I'} x={75} y={130} />
                <TriangleText variable={'R'} displayChar={'R'} x={125} y={130} />
            </svg>
        );
    }
    
    const FormulaDisplay = () => {
        const formulaData = formulas[variableToSolve];
        
        if (!formulaData) return null;

        return (
            <div className="bg-secondary/30 border rounded-lg p-4 text-center w-full h-full flex flex-col justify-center">
                <p className="font-mono text-xl md:text-2xl font-bold tracking-wider">
                    {formulaData.text}
                </p>
                <p className="text-sm text-muted-foreground mt-2">{formulaData.explanation}</p>
            </div>
        )
    };

    return (
        <Card className="w-full my-6">
             <CardContent className="p-4 grid md:grid-cols-2 gap-6 items-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                    <Triangle />
                    <p className="text-sm text-muted-foreground text-center">Haz clic en una variable (V, I, o R) para ver la fórmula.</p>
                </div>
                <div className="space-y-4">
                    <FormulaDisplay />
                </div>
            </CardContent>
        </Card>
    )
}

