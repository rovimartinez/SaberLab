import React, { useCallback, useEffect, useState } from 'react';
import { Activity, ArrowRightLeft, Box, ChevronDown, Clock, Cpu, Flame, Gauge, Maximize2, Thermometer, Weight, Wind, Zap } from 'lucide-react';

const Conversor = () => {
    const categories = [
        { id: 'temperature', name: 'Temperatura', short: 'TEMPERATURA', icon: <Thermometer size={16} /> },
        { id: 'current', name: 'Corriente', short: 'CORRIENTE', icon: <Zap size={16} /> },
        { id: 'voltage', name: 'Voltaje', short: 'VOLTAJE', icon: <Activity size={16} /> },
        { id: 'resistance', name: 'Resistencia', short: 'RESISTENCIA', icon: <Box size={16} /> },
        { id: 'length', name: 'Longitud', short: 'LONGITUD', icon: <Maximize2 size={16} /> },
        { id: 'weight', name: 'Peso', short: 'PESO', icon: <Weight size={16} /> },
        { id: 'capacitance', name: 'Capacitancia', short: 'CAPAC.', icon: <Cpu size={16} /> },
        { id: 'pressure', name: 'Presion', short: 'PRESION', icon: <Gauge size={16} /> },
        { id: 'time', name: 'Tiempo', short: 'TIEMPO', icon: <Clock size={16} /> },
        { id: 'energy', name: 'Energia', short: 'ENERGIA', icon: <Flame size={16} /> },
        { id: 'speed', name: 'Velocidad', short: 'VELOCIDAD', icon: <Wind size={16} /> }
    ];

    const unitsByCategory = {
        length: [
            { id: 'm', name: 'Metros', factor: 1 },
            { id: 'cm', name: 'Centimetros', factor: 100 },
            { id: 'mm', name: 'Milimetros', factor: 1000 },
            { id: 'km', name: 'Kilometros', factor: 0.001 },
            { id: 'in', name: 'Pulgadas', factor: 39.3701 },
            { id: 'ft', name: 'Pies', factor: 3.28084 },
            { id: 'yd', name: 'Yardas', factor: 1.09361 },
            { id: 'mi', name: 'Millas', factor: 0.000621371 }
        ],
        weight: [
            { id: 'kg', name: 'Kilogramos', factor: 1 },
            { id: 'g', name: 'Gramos', factor: 1000 },
            { id: 'mg', name: 'Miligramos', factor: 1000000 },
            { id: 'lb', name: 'Libras', factor: 2.20462 },
            { id: 'oz', name: 'Onzas', factor: 35.274 },
            { id: 't', name: 'Toneladas', factor: 0.001 }
        ],
        temperature: [
            { id: 'c', name: 'Celsius' },
            { id: 'f', name: 'Fahrenheit' },
            { id: 'k', name: 'Kelvin' }
        ],
        voltage: [
            { id: 'v', name: 'Voltios', factor: 1 },
            { id: 'mv', name: 'Milivoltios', factor: 1000 },
            { id: 'kv', name: 'Kilovoltios', factor: 0.001 },
            { id: 'uv', name: 'Microvoltios', factor: 1000000 }
        ],
        current: [
            { id: 'a', name: 'Amperios', factor: 1 },
            { id: 'ma', name: 'Miliamperios', factor: 1000 },
            { id: 'ua', name: 'Microamperios', factor: 1000000 },
            { id: 'ka', name: 'Kiloamperios', factor: 0.001 }
        ],
        resistance: [
            { id: 'ohm', name: 'Ohmios', factor: 1 },
            { id: 'kohm', name: 'Kiloohmios', factor: 0.001 },
            { id: 'mohm', name: 'Megaohmios', factor: 0.000001 },
            { id: 'gohm', name: 'Gigaohmios', factor: 0.000000001 }
        ],
        capacitance: [
            { id: 'f', name: 'Faradios', factor: 1 },
            { id: 'mf', name: 'Milifaradios', factor: 1000 },
            { id: 'uf', name: 'Microfaradios', factor: 1000000 },
            { id: 'nf', name: 'Nanofaradios', factor: 1000000000 },
            { id: 'pf', name: 'Picofaradios', factor: 1000000000000 }
        ],
        pressure: [
            { id: 'pa', name: 'Pascales', factor: 1 },
            { id: 'bar', name: 'Bar', factor: 0.00001 },
            { id: 'psi', name: 'PSI', factor: 0.000145038 },
            { id: 'atm', name: 'Atmosferas', factor: 0.0000098692 },
            { id: 'mmhg', name: 'mmHg', factor: 0.00750062 }
        ],
        time: [
            { id: 's', name: 'Segundos', factor: 1 },
            { id: 'ms', name: 'Milisegundos', factor: 1000 },
            { id: 'min', name: 'Minutos', factor: 1 / 60 },
            { id: 'hr', name: 'Horas', factor: 1 / 3600 },
            { id: 'day', name: 'Dias', factor: 1 / 86400 }
        ],
        energy: [
            { id: 'j', name: 'Joules', factor: 1 },
            { id: 'kj', name: 'Kilojoules', factor: 0.001 },
            { id: 'cal', name: 'Calorias', factor: 0.239006 },
            { id: 'kcal', name: 'Kilocalorias', factor: 0.000239006 },
            { id: 'wh', name: 'Vatios-hora', factor: 0.000277778 },
            { id: 'kwh', name: 'kWh', factor: 0.000000277778 }
        ],
        speed: [
            { id: 'ms', name: 'm/s', factor: 1 },
            { id: 'kmh', name: 'km/h', factor: 3.6 },
            { id: 'mph', name: 'mph', factor: 2.23694 },
            { id: 'kt', name: 'Nudos', factor: 1.94384 },
            { id: 'mach', name: 'Mach', factor: 0.00293867 }
        ]
    };

    const [category, setCategory] = useState('temperature');
    const [inputValue, setInputValue] = useState('1');
    const [fromUnit, setFromUnit] = useState('c');
    const [toUnit, setToUnit] = useState('f');

    useEffect(() => {
        const categoryUnits = unitsByCategory[category];
        if (categoryUnits?.length) {
            setFromUnit(categoryUnits[0].id);
            setToUnit(categoryUnits[1]?.id || categoryUnits[0].id);
        }
    }, [category]);

    const convert = useCallback(() => {
        const numericValue = parseFloat(inputValue.replace(',', '.')) || 0;
        const categoryUnits = unitsByCategory[category];
        if (!categoryUnits) return '0';

        const toBase = (value, unitId) => {
            if (category === 'temperature') {
                if (unitId === 'c') return value;
                if (unitId === 'f') return (value - 32) * 5 / 9;
                if (unitId === 'k') return value - 273.15;
            }
            const unit = categoryUnits.find(item => item.id === unitId);
            return value / (unit?.factor || 1);
        };

        const fromBase = (baseValue, unitId) => {
            if (category === 'temperature') {
                if (unitId === 'c') return baseValue;
                if (unitId === 'f') return (baseValue * 9 / 5) + 32;
                if (unitId === 'k') return baseValue + 273.15;
            }
            const unit = categoryUnits.find(item => item.id === unitId);
            return baseValue * (unit?.factor || 1);
        };

        // Safety check: ensure units belong to current category
        const safeFromUnit = categoryUnits.some(u => u.id === fromUnit) ? fromUnit : categoryUnits[0].id;
        const safeToUnit = categoryUnits.some(u => u.id === toUnit) ? toUnit : (categoryUnits[1]?.id || categoryUnits[0].id);

        const baseValue = toBase(numericValue, safeFromUnit);
        const converted = fromBase(baseValue, safeToUnit);

        return converted.toLocaleString('es-ES', {
            maximumFractionDigits: 8,
            minimumFractionDigits: 0
        });
    }, [inputValue, category, fromUnit, toUnit]);

    const swapUnits = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    };

    const getUnitName = (unitId) => {
        const categoryUnits = unitsByCategory[category];
        if (!categoryUnits) return '';
        return categoryUnits.find(unit => unit.id === unitId)?.name || '';
    };
    
    const result = convert();

    return (
        <div className="converter-shell">
            <div className="converter-tabs">
                {categories.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setCategory(item.id)}
                        className={`converter-tab ${category === item.id ? 'active' : ''}`}
                    >
                        <div>{item.icon}</div>
                        <span>{item.short}</span>
                    </button>
                ))}
            </div>

            <div className="converter-panel">
                <div className="converter-block">
                    <div className="converter-block-meta">
                        <label>Desde</label>
                        <span>{getUnitName(fromUnit)}</span>
                    </div>
                    <div className="converter-field">
                        <input
                            type="text"
                            inputMode="decimal"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="converter-main-input"
                        />
                        <div className="converter-select-wrap">
                            <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="converter-main-select">
                                {unitsByCategory[category]?.map((unit) => (
                                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="converter-chevron" />
                        </div>
                    </div>
                </div>

                <div className="converter-swap-row">
                    <button className="converter-swap" onClick={swapUnits}>
                        <ArrowRightLeft size={18} />
                    </button>
                </div>

                <div className="converter-block">
                    <div className="converter-block-meta">
                        <label>Hacia</label>
                        <span>{getUnitName(toUnit)}</span>
                    </div>
                    <div className="converter-field result">
                        <div className="converter-main-result">{result}</div>
                        <div className="converter-select-wrap">
                            <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="converter-main-select">
                                {unitsByCategory[category]?.map((unit) => (
                                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="converter-chevron" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Conversor;

