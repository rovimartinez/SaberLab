
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from './ui/button';
import { RefreshCw, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

type ColorName = 'black' | 'brown' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'violet' | 'grey' | 'white';
type MultiplierName = ColorName | 'gold' | 'silver';
type ToleranceName = 'brown' | 'red' | 'green' | 'blue' | 'violet' | 'gold' | 'silver';

interface ColorInfo {
    name: ColorName;
    value: number;
    colorCode: string;
}

interface MultiplierInfo {
    name: MultiplierName;
    value: number;
    colorCode: string;
}

interface ToleranceInfo {
    name: ToleranceName;
    value: string;
    colorCode: string;
}

const digitColors: ColorInfo[] = [
    { name: 'black', value: 0, colorCode: '#000000' },
    { name: 'brown', value: 1, colorCode: '#A52A2A' },
    { name: 'red', value: 2, colorCode: '#FF0000' },
    { name: 'orange', value: 3, colorCode: '#FFA500' },
    { name: 'yellow', value: 4, colorCode: '#FFFF00' },
    { name: 'green', value: 5, colorCode: '#008000' },
    { name: 'blue', value: 6, colorCode: '#0000FF' },
    { name: 'violet', value: 7, colorCode: '#EE82EE' },
    { name: 'grey', value: 8, colorCode: '#808080' },
    { name: 'white', value: 9, colorCode: '#FFFFFF' },
];

const multiplierColors: MultiplierInfo[] = [
    { name: 'black', value: 0, colorCode: '#000000' },
    { name: 'brown', value: 1, colorCode: '#A52A2A' },
    { name: 'red', value: 2, colorCode: '#FF0000' },
    { name: 'orange', value: 3, colorCode: '#FFA500' },
    { name: 'yellow', value: 4, colorCode: '#FFFF00' },
    { name: 'green', value: 5, colorCode: '#008000' },
    { name: 'blue', value: 6, colorCode: '#0000FF' },
    { name: 'gold', value: -1, colorCode: '#FFD700' },
    { name: 'silver', value: -2, colorCode: '#C0C0C0' },
];

const toleranceColors: ToleranceInfo[] = [
    { name: 'brown', value: '±1%', colorCode: '#A52A2A' },
    { name: 'red', value: '±2%', colorCode: '#FF0000' },
    { name: 'gold', value: '±5%', colorCode: '#FFD700' },
    { name: 'silver', value: '±10%', colorCode: '#C0C0C0' },
];

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const FormattedResistance = ({ value }: { value: number }) => {
    const formatWithUnit = (val: number) => {
        if (val >= 1_000_000_000) return `${val / 1_000_000_000} GΩ`;
        if (val >= 1_000_000) return `${val / 1_000_000} MΩ`;
        if (val >= 1_000) return `${val / 1_000} kΩ`;
        return null;
    };
    
    const formatted = formatWithUnit(value);
    const base = value.toLocaleString('de-DE');

    if (formatted) {
        return <>{base} Ω ({formatted})</>;
    }
    return <>{base} Ω</>;
}

export function ResistorExercise() {
    const [bands, setBands] = useState({ band1: 'brown' as ColorName, band2: 'black' as ColorName, multiplier: 'red' as MultiplierName, tolerance: 'gold' as ToleranceName });
    const [showSolution, setShowSolution] = useState(false);

    const generateRandomBands = () => {
        setShowSolution(false);
        const fourBandToleranceOptions = toleranceColors.filter(c => ['gold', 'silver'].includes(c.name));
        setBands({
            band1: getRandomItem(digitColors.filter(c => c.value > 0)).name,
            band2: getRandomItem(digitColors).name,
            multiplier: getRandomItem(multiplierColors.filter(c => !['violet','grey','white', 'gold', 'silver'].includes(c.name))).name,
            tolerance: getRandomItem(fourBandToleranceOptions).name as ToleranceName,
        });
    };
    
    useEffect(() => {
        // Set initial state to 1k Ohm
        setBands({ band1: 'brown', band2: 'black', multiplier: 'red', tolerance: 'gold' });
    }, []);

    const { resistanceValue, toleranceValue, minResistance, maxResistance } = useMemo(() => {
        const d1 = digitColors.find(c => c.name === bands.band1)!.value;
        const d2 = digitColors.find(c => c.name === bands.band2)!.value;
        const multi = multiplierColors.find(c => c.name === bands.multiplier)!.value;
        const tol = toleranceColors.find(c => c.name === bands.tolerance)!;

        const significantDigits = d1 * 10 + d2;
        const resistance = significantDigits * Math.pow(10, multi);
        
        const tolerancePercent = parseFloat(tol.value.replace('±', '').replace('%', '')) / 100;
        const min = resistance * (1 - tolerancePercent);
        const max = resistance * (1 + tolerancePercent);

        return {
            resistanceValue: resistance,
            toleranceValue: tol.value,
            minResistance: min,
            maxResistance: max,
        };
    }, [bands]);

    const bandColorCodes = [
        digitColors.find(c => c.name === bands.band1)!.colorCode,
        digitColors.find(c => c.name === bands.band2)!.colorCode,
        multiplierColors.find(c => c.name === bands.multiplier)!.colorCode,
        toleranceColors.find(c => c.name === bands.tolerance)!.colorCode,
    ];

    return (
        <Card className="bg-secondary/30 border-dashed mb-6">
            <CardContent className="p-4 space-y-4">
                 <div className="bg-amber-100 dark:bg-amber-900/50 p-6 rounded-lg flex items-center justify-center">
                    <div className="h-8 bg-gray-300 dark:bg-gray-600 w-12 rounded-l-md"></div>
                    <div className="h-16 bg-orange-200 dark:bg-orange-900/80 w-48 flex justify-around items-center px-4">
                        {bandColorCodes.map((color, index) => (
                            <div key={index} className="h-16 w-4 transition-colors duration-500" style={{ backgroundColor: color }}></div>
                        ))}
                    </div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-600 w-12 rounded-r-md"></div>
                </div>

                {showSolution && (
                    <div className="text-center bg-background/70 p-3 rounded-lg">
                        <p className="text-2xl font-bold font-mono tracking-tight text-primary">
                           <FormattedResistance value={resistanceValue} /> {toleranceValue}
                        </p>
                         <p className="text-sm font-medium text-muted-foreground mt-1">
                            ({minResistance.toLocaleString('de-DE')} Ω a {maxResistance.toLocaleString('de-DE')} Ω)
                        </p>
                    </div>
                )}
                
                <div className="flex justify-center flex-col sm:flex-row gap-2">
                     <Button onClick={generateRandomBands} variant="secondary">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Nuevo Ejercicio
                    </Button>
                    <Button onClick={() => setShowSolution(true)} disabled={showSolution}>
                        <Eye className="mr-2 h-4 w-4" />
                        Mostrar Resultado
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
