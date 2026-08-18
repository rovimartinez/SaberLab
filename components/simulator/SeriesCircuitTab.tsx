
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SolutionDisplay } from './SolutionDisplay';
import { Button } from '../ui/button';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { generateSeriesSolution } from '@/lib/calculations';
import type { SolutionFilter } from '@/lib/types';
import { SeriesCircuitIcon } from './CircuitIcons';

const MIN_RESISTORS = 2;
const MAX_RESISTORS = 5;

export function SeriesCircuitTab() {
  const [voltage, setVoltage] = useState('12');
  const [resistances, setResistances] = useState(['100', '220']);
  const [filter, setFilter] = useState<SolutionFilter>('Complete');

  const handleResistanceChange = (index: number, value: string) => {
    const newResistances = [...resistances];
    newResistances[index] = value;
    setResistances(newResistances);
  };

  const addResistor = () => {
    if (resistances.length < MAX_RESISTORS) {
      setResistances([...resistances, '100']);
    }
  };

  const removeResistor = () => {
    if (resistances.length > MIN_RESISTORS) {
      setResistances(resistances.slice(0, -1));
    }
  };

  const {
    isValid,
    totalResistance,
    totalCurrent,
    totalPower,
    solution,
  } = useMemo(() => {
    const v = parseFloat(voltage);
    const rValues = resistances.map(r => parseFloat(r));
    const allNumeric = !isNaN(v) && rValues.every(r => !isNaN(r) && r > 0);

    if (!allNumeric) {
      return { isValid: false, totalResistance: 0, totalCurrent: 0, totalPower: 0, solution: null };
    }

    const req = rValues.reduce((sum, r) => sum + r, 0);
    const i = req > 0 ? v / req : 0;
    const p = v * i;

    return {
      isValid: true,
      totalResistance: req,
      totalCurrent: i,
      totalPower: p,
      solution: generateSeriesSolution(v, rValues, filter)
    };
  }, [voltage, resistances, filter]);

  const showCurrent = filter === 'Complete' || filter === 'Ohm';
  const showPower = filter === 'Complete' || filter === 'Watt';
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Circuito en Serie</CardTitle>
        <CardDescription>Componentes conectados uno tras otro. La corriente es constante.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        
        <div className="grid md:grid-cols-4 gap-8 items-start">
            <div className="md:col-span-3">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Parámetros</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                        <div className="space-y-2 md:col-span-1">
                            <Label htmlFor="series-voltage">Voltaje Total (V)</Label>
                            <Input id="series-voltage" type="number" value={voltage} onChange={(e) => setVoltage(e.target.value)} placeholder="e.g., 12" />
                        </div>
                        {resistances.map((r, index) => (
                        <div key={index} className="space-y-2">
                            <Label htmlFor={`series-r${index + 1}`}>R{index + 1} (Ω)</Label>
                            <Input id={`series-r${index + 1}`} type="number" value={r} onChange={(e) => handleResistanceChange(index, e.target.value)} placeholder="e.g., 100" />
                        </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={addResistor} disabled={resistances.length >= MAX_RESISTORS} variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Añadir R</Button>
                        <Button onClick={removeResistor} disabled={resistances.length <= MIN_RESISTORS} variant="outline" size="sm"><MinusCircle className="mr-2 h-4 w-4" /> Quitar R</Button>
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
                            <p className="text-muted-foreground">Resistencia Eq.:</p>
                            <p className="font-bold">{isValid ? totalResistance.toFixed(2) : '---'} Ω</p>
                        </div>
                        <div className="p-2 bg-secondary/50 rounded-lg flex justify-between items-center">
                            <p className="text-muted-foreground">Corriente Total:</p>
                            <p className="font-bold">{isValid && showCurrent ? totalCurrent.toFixed(3) : '---'} A</p>
                        </div>
                        <div className="p-2 bg-secondary/50 rounded-lg flex justify-between items-center">
                            <p className="text-muted-foreground">Potencia Total:</p>
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
                <SeriesCircuitIcon numResistors={resistances.length} className="w-full h-full max-w-lg text-foreground" />
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
