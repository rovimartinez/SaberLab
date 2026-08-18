
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

type ColorName = 'black' | 'brown' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'violet' | 'grey' | 'white';
type MultiplierName = ColorName | 'gold' | 'silver';
type ToleranceName = 'brown' | 'red' | 'green' | 'blue' | 'violet' | 'gold' | 'silver' | 'none';
type Unit = 'Ω' | 'kΩ' | 'MΩ' | 'GΩ';

interface ColorInfo {
    name: ColorName;
    displayName: string;
    value: number;
    colorCode: string;
}

interface MultiplierInfo {
    name: MultiplierName;
    displayName: string;
    value: number; // Represents the power of 10
    colorCode: string;
}

interface ToleranceInfo {
    name: ToleranceName;
    displayName: string;
    value: string;
    colorCode: string;
}

const digitColors: ColorInfo[] = [
    { name: 'black', displayName: 'Negro', value: 0, colorCode: '#000000' },
    { name: 'brown', displayName: 'Marrón', value: 1, colorCode: '#A52A2A' },
    { name: 'red', displayName: 'Rojo', value: 2, colorCode: '#FF0000' },
    { name: 'orange', displayName: 'Naranja', value: 3, colorCode: '#FFA500' },
    { name: 'yellow', displayName: 'Amarillo', value: 4, colorCode: '#FFFF00' },
    { name: 'green', displayName: 'Verde', value: 5, colorCode: '#008000' },
    { name: 'blue', displayName: 'Azul', value: 6, colorCode: '#0000FF' },
    { name: 'violet', displayName: 'Violeta', value: 7, colorCode: '#EE82EE' },
    { name: 'grey', displayName: 'Gris', value: 8, colorCode: '#808080' },
    { name: 'white', displayName: 'Blanco', value: 9, colorCode: '#FFFFFF' },
];

const multiplierColors: MultiplierInfo[] = [
    { name: 'black', displayName: 'Negro', value: 0, colorCode: '#000000' },
    { name: 'brown', displayName: 'Marrón', value: 1, colorCode: '#A52A2A' },
    { name: 'red', displayName: 'Rojo', value: 2, colorCode: '#FF0000' },
    { name: 'orange', displayName: 'Naranja', value: 3, colorCode: '#FFA500' },
    { name: 'yellow', displayName: 'Amarillo', value: 4, colorCode: '#FFFF00' },
    { name: 'green', displayName: 'Verde', value: 5, colorCode: '#008000' },
    { name: 'blue', displayName: 'Azul', value: 6, colorCode: '#0000FF' },
    { name: 'violet', displayName: 'Violeta', value: 7, colorCode: '#EE82EE' },
    { name: 'grey', displayName: 'Gris', value: 8, colorCode: '#808080' },
    { name: 'white', displayName: 'Blanco', value: 9, colorCode: '#FFFFFF' },
    { name: 'gold', displayName: 'Oro', value: -1, colorCode: '#FFD700' },
    { name: 'silver', displayName: 'Plata', value: -2, colorCode: '#C0C0C0' },
];

const toleranceColors: ToleranceInfo[] = [
    { name: 'brown', displayName: 'Marrón', value: '±1%', colorCode: '#A52A2A' },
    { name: 'red', displayName: 'Rojo', value: '±2%', colorCode: '#FF0000' },
    { name: 'green', displayName: 'Verde', value: '±0.5%', colorCode: '#008000' },
    { name: 'blue', displayName: 'Azul', value: '±0.25%', colorCode: '#0000FF' },
    { name: 'violet', displayName: 'Violeta', value: '±0.1%', colorCode: '#EE82EE' },
    { name: 'gold', displayName: 'Oro', value: '±5%', colorCode: '#FFD700' },
    { name: 'silver', displayName: 'Plata', value: '±10%', colorCode: '#C0C0C0' },
    { name: 'none', displayName: 'Ninguno', value: '±20%', colorCode: '#E5E7EB' },
];

const fourBandToleranceOptions = toleranceColors.filter(c => ['gold', 'silver', 'none'].includes(c.name));


export function ResistorCalculator() {
    const [band1, setBand1] = useState<ColorName>('brown');
    const [band2, setBand2] = useState<ColorName>('black');
    const [multiplier, setMultiplier] = useState<MultiplierName>('red');
    const [tolerance, setTolerance] = useState<ToleranceName>('gold');
    const [unit, setUnit] = useState<Unit>('Ω');

    const { baseResistance, toleranceValue, minBaseResistance, maxBaseResistance } = useMemo(() => {
        const d1 = digitColors.find(c => c.name === band1)!.value;
        const d2 = digitColors.find(c => c.name === band2)!.value;
        
        const significantDigits = d1 * 10 + d2;
        const multi = multiplierColors.find(c => c.name === multiplier)!.value;
        
        const resistance = significantDigits * Math.pow(10, multi);
        const tol = toleranceColors.find(c => c.name === tolerance)!;
        const tolerancePercent = parseFloat(tol.value.replace('±', '').replace('%', '')) / 100;
        
        const min = resistance * (1 - tolerancePercent);
        const max = resistance * (1 + tolerancePercent);

        return {
            baseResistance: resistance,
            toleranceValue: tol.value,
            minBaseResistance: min,
            maxBaseResistance: max,
        };
    }, [band1, band2, multiplier, tolerance]);
    
    const getBandColor = (colorName: ColorName | MultiplierName | ToleranceName) => {
        const allColors = [...multiplierColors, ...toleranceColors];
        const color = allColors.find(c => c.name === colorName);
        return color ? color.colorCode : '#FFFFFF';
    };
    
    const bandColors = [band1, band2, multiplier, tolerance];

    const formatResistance = (value: number, currentUnit: Unit): string => {
        let divisor = 1;
        switch (currentUnit) {
            case 'kΩ': divisor = 1_000; break;
            case 'MΩ': divisor = 1_000_000; break;
            case 'GΩ': divisor = 1_000_000_000; break;
        }
        
        const formattedValue = value / divisor;
        if (formattedValue === 0) return `0 ${currentUnit}`;

        // Avoid scientific notation for very small or large numbers in a given unit
        if (formattedValue < 0.001 && formattedValue > 0) {
             // Find a more suitable unit if possible, for now just show small number
             return `${formattedValue.toFixed(4)} ${currentUnit}`;
        }
        
        const stringValue = String(formattedValue);
        if (stringValue.includes('.') && stringValue.split('.')[1].length > 3) {
             return `${formattedValue.toPrecision(3)} ${currentUnit}`;
        }

        return `${formattedValue} ${currentUnit}`;
    }

    const resistanceValue = formatResistance(baseResistance, unit);
    const minResistance = formatResistance(minBaseResistance, unit);
    const maxResistance = formatResistance(maxBaseResistance, unit);


    return (
        <Card className="shadow-lg w-full">
            <CardContent className="p-6 grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Selección de Bandas</CardTitle>
                             <CardDescription>Calculadora para resistencias de 4 bandas.</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Banda 1 (Dígito)</Label>
                                    <ColorSelect value={band1} onValueChange={v => setBand1(v as ColorName)} colors={digitColors.filter(c => c.value > 0)} />
                                </div>
                                <div>
                                    <Label>Banda 2 (Dígito)</Label>
                                    <ColorSelect value={band2} onValueChange={v => setBand2(v as ColorName)} colors={digitColors} />
                                </div>
                                <div>
                                    <Label>Banda 3 (Multiplicador)</Label>
                                    <ColorSelect value={multiplier} onValueChange={v => setMultiplier(v as MultiplierName)} colors={multiplierColors} />
                                </div>
                                <div>
                                    <Label>Banda 4 (Tolerancia)</Label>
                                    <ColorSelect value={tolerance} onValueChange={v => setTolerance(v as ToleranceName)} colors={fourBandToleranceOptions} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Visualización y Resultado</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            <div className="bg-amber-100 dark:bg-amber-900/50 p-6 rounded-lg flex items-center justify-center">
                                <div className="h-8 bg-gray-300 dark:bg-gray-600 w-12 rounded-l-md"></div>
                                <div className="h-16 bg-orange-200 dark:bg-orange-900/80 w-48 flex justify-around items-center px-4">
                                   {bandColors.map((band, index) => (
                                       <div key={index} className="h-16 w-4" style={{ backgroundColor: getBandColor(band) }}></div>
                                   ))}
                                </div>
                                <div className="h-8 bg-gray-300 dark:bg-gray-600 w-12 rounded-r-md"></div>
                            </div>
                            <div className='text-center space-y-4'>
                                <p className="text-lg text-muted-foreground">Valor de la Resistencia</p>
                                <p className="text-4xl font-bold tracking-tight">{resistanceValue} <span className="text-2xl text-primary">{toleranceValue}</span></p>
                                
                                <RadioGroup
                                    value={unit}
                                    onValueChange={(value) => setUnit(value as Unit)}
                                    className="flex items-center justify-center space-x-4 pt-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Ω" id="unit-o" />
                                        <Label htmlFor="unit-o">Ω</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="kΩ" id="unit-k" />
                                        <Label htmlFor="unit-k">kΩ</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="MΩ" id="unit-m" />
                                        <Label htmlFor="unit-m">MΩ</Label>
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="GΩ" id="unit-g" />
                                        <Label htmlFor="unit-g">GΩ</Label>
                                    </div>
                                </RadioGroup>

                                <div className="text-sm text-muted-foreground grid grid-cols-2 gap-4 pt-4 border-t">
                                     <div>
                                        <p className="font-medium">Valor Mínimo</p>
                                        <p>{minResistance}</p>
                                     </div>
                                     <div>
                                        <p className="font-medium">Valor Máximo</p>
                                        <p>{maxResistance}</p>
                                     </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
}


interface ColorSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    colors: (ColorInfo | MultiplierInfo | ToleranceInfo)[];
}

function ColorSelect({ value, onValueChange, colors }: ColorSelectProps) {
    const selectedColor = colors.find(c => c.name === value);
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger>
                 <div className='flex items-center gap-2'>
                    <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: selectedColor?.colorCode }}></div>
                     <SelectValue asChild>
                        <span>{selectedColor?.displayName}</span>
                    </SelectValue>
                </div>
            </SelectTrigger>
            <SelectContent>
                {colors.map(color => (
                    <SelectItem key={color.name} value={color.name}>
                        <div className='flex items-center gap-2'>
                             <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.colorCode }}></div>
                            <span>{color.displayName}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
