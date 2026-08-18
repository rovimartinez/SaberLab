
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SolutionDisplay } from './SolutionDisplay';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { MixedTopology, SolutionFilter } from '@/lib/types';
import { generateMixedSolution } from '@/lib/calculations';
import { MixedCircuitIcon } from './CircuitIcons';

const topologies: MixedTopology[] = [
    'Serie (2) -> Paralelo (2)',
    'Paralelo (2) -> Serie (2)',
    'Serie (1) -> Paralelo (1 Serie (2))',
    'Serie (1) -> Paralelo (2) -> Serie (1)'
];

export function MixedCircuitTab() {
  const [voltage, setVoltage] = useState('24');
  const [resistances, setResistances] = useState(['100', '220', '330', '470']);
  const [topology, setTopology] = useState<MixedTopology>(topologies[0]);
  const [filter, setFilter] = useState<SolutionFilter>('Complete');

  const handleResistanceChange = (index: number, value: string) => {
    const newResistances = [...resistances];
    newResistances[index] = value;
    setResistances(newResistances);
  };

  const {
    isValid,
    totalResistance,
    totalCurrent,
    totalPower,
    solution
  } = useMemo(() => {
    const v = parseFloat(voltage);
    const rValues = resistances.map(r => parseFloat(r));
    const allNumeric = !isNaN(v) && rValues.every(r => !isNaN(r) && r > 0);

    if (!allNumeric) {
      return { isValid: false, totalResistance: 0, totalCurrent: 0, totalPower: 0, solution: null };
    }

    const [r1, r2, r3, r4] = rValues;
    let req = 0;
    switch (topology) {
      case 'Serie (2) -> Paralelo (2)':
        req = (r1 + r2) + (1 / (1/r3 + 1/r4));
        break;
      case 'Paralelo (2) -> Serie (2)':
        req = (1 / (1/r1 + 1/r2)) + (r3 + r4);
        break;
      case 'Serie (1) -> Paralelo (1 Serie (2))':
        const r34s = r3 + r4;
        const r2p34s = r34s > 0 ? 1 / (1/r2 + 1/r34s) : r2;
        req = r1 + r2p34s;
        break;
      case 'Serie (1) -> Paralelo (2) -> Serie (1)':
        const r23p = 1 / (1/r2 + 1/r3);
        req = r1 + r23p + r4;
        break;
    }

    const i = req > 0 ? v / req : 0;
    const p = v * i;

    return {
      isValid: true,
      totalResistance: req,
      totalCurrent: i,
      totalPower: p,
      solution: generateMixedSolution(v, rValues, topology, filter)
    };
  }, [voltage, resistances, topology, filter]);

  const showCurrent = filter === 'Complete' || filter === 'Ohm';
  const showPower = filter === 'Complete' || filter === 'Watt';

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Circuito Mixto</CardTitle>
        <CardDescription>Una combinación de conexiones en serie y paralelo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        
        <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Parámetros</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className='grid md:grid-cols-2 gap-4'>
                      <div>
                        <Label htmlFor="mixed-voltage">Voltaje Total (V)</Label>
                        <Input id="mixed-voltage" type="number" value={voltage} onChange={(e) => setVoltage(e.target.value)} placeholder="e.g., 24" />
                      </div>
                      <div>
                        <Label>Topología</Label>
                        <Select value={topology} onValueChange={(v) => setTopology(v as MixedTopology)}>
                          <SelectTrigger><SelectValue placeholder="Seleccionar topología" /></SelectTrigger>
                          <SelectContent>
                            {topologies.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {resistances.map((r, index) => (
                            <div key={index}>
                                <Label htmlFor={`mixed-r${index + 1}`}>R{index + 1} (Ω)</Label>
                                <Input id={`mixed-r${index + 1}`} type="number" value={r} onChange={(e) => handleResistanceChange(index, e.target.value)} />
                            </div>
                        ))}
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
                <MixedCircuitIcon topology={topology} className="w-full h-full max-w-lg text-foreground" />
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
