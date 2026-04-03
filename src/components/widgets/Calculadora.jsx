import React, { useState } from 'react';

const Calculadora = () => {
    const [display, setDisplay] = useState('0');
    const [storedValue, setStoredValue] = useState(null);
    const [operator, setOperator] = useState(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const [displayMode, setDisplayMode] = useState('auto');
    const [lastNumericResult, setLastNumericResult] = useState(null);
    const [expressionPreview, setExpressionPreview] = useState('');

    const expressionLabel = expressionPreview;
    const resultSizeClass =
        display.length > 16 ? 'compact' :
            display.length > 11 ? 'medium' :
                '';

    const formatResult = (value, mode = displayMode) => {
        if (value === null || Number.isNaN(value) || !Number.isFinite(value)) {
            return 'Error';
        }

        if (value === 0) return '0';

        const absValue = Math.abs(value);
        if (mode === 'decimal') {
            return value.toLocaleString('en-US', {
                useGrouping: false,
                maximumFractionDigits: 20
            });
        }

        if (mode === 'scientific') {
            return value.toExponential(6).replace(/\.?0+e/, 'e');
        }

        if (absValue >= 1e9 || absValue < 1e-6) {
            return value.toExponential(6).replace(/\.?0+e/, 'e');
        }

        return Number(value.toPrecision(12)).toString();
    };

    const handleNumber = (num) => {
        if (waitingForOperand) {
            setDisplay(num === '.' ? '0.' : num);
            setWaitingForOperand(false);
            if (storedValue !== null && operator) {
                setExpressionPreview(`${storedValue} ${operator} ${num === '.' ? '0.' : num}`);
            }
            return;
        }

        if (num === '.' && display.includes('.')) return;

        let nextDisplay = '';
        if (display === '0' && num !== '.') {
            nextDisplay = num;
        } else {
            nextDisplay = display + num;
        }
        setDisplay(nextDisplay);
        if (storedValue !== null && operator) {
            setExpressionPreview(`${storedValue} ${operator} ${nextDisplay}`);
        }
    };

    const calculateResult = (left, right, currentOperator) => {
        switch (currentOperator) {
            case '+': return left + right;
            case '-': return left - right;
            case 'x': return left * right;
            case '/': return right === 0 ? null : left / right;
            default: return right;
        }
    };

    const handleOperator = (nextOperator) => {
        const currentValue = parseFloat(display);

        if (storedValue === null) {
            setStoredValue(currentValue);
            setExpressionPreview(`${display} ${nextOperator}`);
        } else if (operator && !waitingForOperand) {
            const result = calculateResult(storedValue, currentValue, operator);

            if (result === null) {
                setDisplay('Error');
                setStoredValue(null);
                setOperator(null);
                setWaitingForOperand(true);
                setExpressionPreview('');
                return;
            }

            setStoredValue(result);
            setDisplay(formatResult(result));
            setLastNumericResult(result);
            setExpressionPreview(`${storedValue} ${operator} ${currentValue}`);
        } else if (operator) {
            setExpressionPreview(`${storedValue} ${nextOperator}`);
        }

        setOperator(nextOperator);
        setWaitingForOperand(true);
    };

    const handleEqual = () => {
        if (!operator || storedValue === null) return;

        const result = calculateResult(storedValue, parseFloat(display), operator);

        if (result === null) {
            setDisplay('Error');
            setExpressionPreview('');
        } else {
            setDisplay(formatResult(result));
            setLastNumericResult(result);
            setExpressionPreview(`${storedValue} ${operator} ${parseFloat(display)}`);
        }

        setStoredValue(null);
        setOperator(null);
        setWaitingForOperand(true);
    };

    const handleClear = () => {
        setDisplay('0');
        setStoredValue(null);
        setOperator(null);
        setWaitingForOperand(false);
        setLastNumericResult(null);
        setExpressionPreview('');
    };

    const handleBackspace = () => {
        if (waitingForOperand || display === 'Error') {
            setDisplay('0');
            setWaitingForOperand(false);
            return;
        }

        const nextDisplay = display.length <= 1 ? '0' : display.slice(0, -1);
        setDisplay(nextDisplay);
        if (storedValue !== null && operator) {
            setExpressionPreview(nextDisplay === '0' ? `${storedValue} ${operator}` : `${storedValue} ${operator} ${nextDisplay}`);
        }
    };

    const toggleSign = () => {
        if (display === '0' || display === 'Error') return;
        const nextDisplay = display.startsWith('-') ? display.slice(1) : `-${display}`;
        setDisplay(nextDisplay);
        if (storedValue !== null && operator) {
            setExpressionPreview(`${storedValue} ${operator} ${nextDisplay}`);
        }
    };

    const toggleDisplayMode = () => {
        if (lastNumericResult === null) return;
        const nextMode = displayMode === 'decimal'
            ? 'scientific'
            : display.includes('e')
                ? 'decimal'
                : 'scientific';
        setDisplayMode(nextMode);
        setDisplay(formatResult(lastNumericResult, nextMode));
    };

    const buttons = [
        ['C', 'DEL', '+/-', '/'],
        ['7', '8', '9', 'x'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '+'],
        ['0', '.', '=']
    ];

    return (
        <div className="calculator-widget">
            <div className="calc-display">
                <div className="calc-expression">
                    <span>{expressionLabel}</span>
                    {lastNumericResult !== null && (
                        <button className="calc-mode-toggle" onClick={toggleDisplayMode}>
                            {displayMode === 'scientific' ? 'Decimal' : 'Cientifica'}
                        </button>
                    )}
                </div>
                <div className={`calc-result ${resultSizeClass}`}>{display}</div>
            </div>
            <div className="calc-buttons">
                {buttons.flat().map((btn, i) => (
                    <button
                        key={i}
                        className={`calc-btn ${['+', '-', 'x', '/', '='].includes(btn) ? 'operator' : ''} ${['C', 'DEL', '+/-'].includes(btn) ? 'function' : ''} ${btn === '0' ? 'zero' : ''}`}
                        onClick={() => {
                            if (btn === 'C') handleClear();
                            else if (btn === 'DEL') handleBackspace();
                            else if (btn === '+/-') toggleSign();
                            else if (btn === '=') handleEqual();
                            else if (['/', 'x', '+', '-'].includes(btn)) handleOperator(btn);
                            else handleNumber(btn);
                        }}
                    >
                        {btn}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Calculadora;

