
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Terminal, Zap, Atom } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import type { Solution, SolutionFilter } from "@/lib/types";

interface SolutionDisplayProps {
  solution: Solution | null;
  isEnabled: boolean;
  filter: SolutionFilter;
  onFilterChange: (filter: SolutionFilter) => void;
}

export function SolutionDisplay({ solution, isEnabled, filter, onFilterChange }: SolutionDisplayProps) {
  const showOhm = filter === 'Complete' || filter === 'Ohm';
  const showWatt = filter === 'Complete' || filter === 'Watt';
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Resolución y Filtros</CardTitle>
        <CardDescription>
          Selecciona un filtro para ver los cálculos y la guía detallada para resolver el circuito.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
            <Label className="font-medium">Filtro de Cálculo</Label>
            <RadioGroup
                value={filter}
                onValueChange={(value) => onFilterChange(value as SolutionFilter)}
                className="flex items-center space-x-4 mt-2"
                >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Complete" id="filter-complete" />
                    <Label htmlFor="filter-complete">Completo</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Ohm" id="filter-ohm" />
                    <Label htmlFor="filter-ohm">Ley de Ohm</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Watt" id="filter-watt" />
                    <Label htmlFor="filter-watt">Ley de Watt</Label>
                </div>
            </RadioGroup>
        </div>
        {isEnabled && solution && (
          <div className="grid md:grid-cols-2 gap-6">
            {showOhm && (
                <Card className="bg-secondary/50">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Atom className="text-primary"/> Ley de Ohm</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <pre className="font-code text-sm whitespace-pre-wrap bg-background p-4 rounded-md border">
                        {solution.ohm}
                    </pre>
                    </CardContent>
                </Card>
            )}
             {showWatt && (
                <Card className="bg-secondary/50">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Zap className="text-yellow-500"/> Ley de Watt</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <pre className="font-code text-sm whitespace-pre-wrap bg-background p-4 rounded-md border">
                        {solution.watt}
                    </pre>
                    </CardContent>
                </Card>
            )}
          </div>
        )}
        {!isEnabled && (
            <div className="text-sm text-destructive-foreground bg-destructive/80 p-4 rounded-md">
                Por favor, introduce valores numéricos válidos en todos los campos de parámetros para ver la resolución.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
