
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SolutionDisplay } from './SolutionDisplay';
import { generateBasicSolution } from '@/lib/calculations';
import type { SolutionFilter } from '@/lib/types';
import { BasicCircuitIcon } from './CircuitIcons';

export function BasicCircuitTab() {
  const [voltage, setVoltage] = useState('12');
  const [resistance, setResistance] = useState('100');
  const [filter, setFilter] = useState<SolutionFilter>('Complete');

  const {
    isValid,
    totalResistance,
    totalCurrent,
    totalPower,
    solution,
  } = useMemo(() => {
    const v = parseFloat(voltage);
    const r = parseFloat(resistance);
    const valid = !isNaN(v) && !isNaN(r) && r > 0;

    if (!valid) {
      return { isValid: false, totalResistance: 0, totalCurrent: 0, totalPower: 0, solution: null };
    }

    const i = v / r;
    const p = v * i;

    return {
      isValid: true,
      totalResistance: r,
      totalCurrent: i,
      totalPower: p,
      solution: generateBasicSolution(v, r, filter)
    };
  }, [voltage, resistance, filter]);

  const showCurrent = filter === 'Complete' || filter === 'Ohm';
  const showPower = filter === 'Complete' || filter === 'Watt';

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Circuito Básico</CardTitle>
        <CardDescription>Un circuito con una sola fuente y una resistencia.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Parámetros</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="basic-voltage">Voltaje Total (V)</Label>
                  <Input id="basic-voltage" type="number" value={voltage} onChange={(e) => setVoltage(e.target.value)} placeholder="e.g., 12" />
                </div>
                <div>
                  <Label htmlFor="basic-r1">Resistencia R1 (Ω)</Label>
                  <Input id="basic-r1" type="number" value={resistance} onChange={(e) => setResistance(e.target.value)} placeholder="e.g., 100" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Totales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                 <div className="p-2 bg-secondary/50 rounded-lg flex justify-between items-center">
                    <p className="text-muted-foreground">Resistencia:</p>
                    <p className="font-bold">{isValid ? totalResistance.toFixed(2) : '---'} Ω</p>
                </div>
                 <div className="p-2 bg-secondary/50 rounded-lg flex justify-between items-center">
                    <p className="text-muted-foreground">Corriente:</p>
                    <p className="font-bold">{isValid && showCurrent ? totalCurrent.toFixed(3) : '---'} A</p>
                </div>
                 <div className="p-2 bg-secondary/50 rounded-lg flex justify-between items-center">
                    <p className="text-muted-foreground">Potencia:</p>
                    <p className="font-bold">{isValid && showPower ? totalPower.toFixed(2) : '---'} W</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Esquema del Circuito</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex items-center justify-center">
                <BasicCircuitIcon className="w-full h-full max-w-sm text-foreground" />
            </CardContent>
        </Card>
        
        <SolutionDisplay 
            solution={solution}
            isEnabled={isValid}
            filter={filter}
            onFilterChange={setFilter}
        />
      </CardContent>
    </Card>
  );
}
