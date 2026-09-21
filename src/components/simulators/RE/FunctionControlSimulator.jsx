import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, SkipForward, RotateCcw, Sparkles, Maximize2, Minimize2, X } from 'lucide-react';

export default function FunctionControlSimulator() {
    const [currentStep, setCurrentStep] = useState(0); // 0: inicio, 1: encenderAlerta(), 2: delay(1000), 3: apagarAlerta(), 4: delay(1000)
    const [isPlaying, setIsPlaying] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const timerRef = useRef(null);

    // Mapeo de estados según el paso
    const stepsData = [
        {
            line: null,
            led: false,
            title: 'Listo para ejecutar',
            explanation: 'Haz clic en "Siguiente Paso" o "Reproducir" para ver cómo las funciones C++ controlan el LED.'
        },
        {
            line: 8, // encenderAlerta();
            fnLine: 14,
            led: true,
            title: '1. Invocando encenderAlerta()',
            explanation: 'La función encenderAlerta() ejecuta digitalWrite(13, HIGH), enviando 5 Voltios al Pin 13 y ENCENDIENDO el LED.'
        },
        {
            line: 9, // delay(1000);
            led: true,
            title: '2. Pausa delay(1000)',
            explanation: 'El microcontrolador espera 1000 milisegundos (1 segundo) manteniendo el LED encendido.'
        },
        {
            line: 10, // apagarAlerta();
            fnLine: 18,
            led: false,
            title: '3. Invocando apagarAlerta()',
            explanation: 'La función apagarAlerta() ejecuta digitalWrite(13, LOW), cortando el voltaje a 0V y APAGANDO el LED.'
        },
        {
            line: 11, // delay(1000);
            led: false,
            title: '4. Pausa delay(1000)',
            explanation: 'El microcontrolador espera 1 segundo con el LED apagado antes de repetir el bucle loop().'
        }
    ];

    const currentData = stepsData[currentStep];

    const nextStep = () => {
        setCurrentStep(prev => (prev >= 4 ? 1 : prev + 1));
    };

    const reset = () => {
        setIsPlaying(false);
        setCurrentStep(0);
    };

    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(() => {
                setCurrentStep(prev => (prev >= 4 ? 1 : prev + 1));
            }, 1400);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying]);

    // ── PORTAL MODAL para modo expandido ──
    // SimulatorContent se define más abajo y recibe isExpanded para ajustar layout

    const simulatorContent = (
        <div style={{
            position: isExpanded ? 'relative' : 'relative',
            background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)',
            borderRadius: '20px',
            border: `2px solid ${isExpanded ? '#38bdf8' : 'rgba(168, 85, 247, 0.3)'}`,
            padding: '1.5rem',
            color: '#f8fafc',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            width: '100%',
            height: isExpanded ? '100%' : 'auto',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isExpanded ? 'none' : '0 15px 40px rgba(0, 0, 0, 0.3)',
        }}>
            {/* Encabezado Sencillo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={20} color="#c084fc" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                        Demostrador Paso a Paso: Ejecución de Funciones
                    </h3>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                        onClick={nextStep}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.45rem 0.85rem',
                            borderRadius: '10px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
                        }}
                    >
                        <SkipForward size={14} /> Siguiente Paso
                    </button>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: isPlaying ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                            color: isPlaying ? '#ef4444' : '#ffffff',
                            border: `1px solid ${isPlaying ? '#ef4444' : 'transparent'}`,
                            padding: '0.45rem 0.85rem',
                            borderRadius: '10px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        {isPlaying ? 'Pausar' : 'Auto'}
                    </button>

                    <button
                        onClick={reset}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: '#cbd5e1',
                            padding: '0.45rem 0.65rem',
                            borderRadius: '10px',
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                        }}
                        title="Reiniciar"
                    >
                        <RotateCcw size={14} />
                    </button>

                    <button
                        onClick={() => setIsExpanded(false)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#f87171',
                            padding: '0.45rem 0.85rem',
                            borderRadius: '10px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        title="Cerrar simulador"
                    >
                        <X size={15} /> Cerrar
                    </button>
                </div>
            </div>

            {/* Layout Lado a Lado (Código a la Izquierda | Ejecución a la Derecha) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem', alignItems: 'stretch', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                {/* LADO IZQUIERDO: Código C++ con resaltado */}
                <div style={{
                    background: '#090d16',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                    minHeight: 0
                }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a855f7', uppercase: 'true', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>CÓDIGO C++ EN ARDUINO</span>
                        <span style={{ color: '#64748b' }}>Pin 13</span>
                    </div>

                    <div style={{ fontFamily: 'Consolas, Monaco, "Courier New", monospace', fontSize: '0.86rem', lineHeight: '1.8', color: '#94a3b8' }}>
                        {/* Línea 1 */}
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                            <span style={{ width: '24px', textAlign: 'right', color: '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem' }}>1</span>
                            <div><span style={{ color: '#f472b6', fontWeight: 'bold' }}>int</span> <span style={{ color: '#e2e8f0' }}>LED_PIN</span> = <span style={{ color: '#38bdf8' }}>13</span>;</div>
                        </div>

                        {/* Línea 2 */}
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                            <span style={{ width: '24px', textAlign: 'right', color: '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem' }}>2</span>
                        </div>

                        {/* Línea 3: setup() */}
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                            <span style={{ width: '24px', textAlign: 'right', color: '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem' }}>3</span>
                            <div><span style={{ color: '#f472b6', fontWeight: 'bold' }}>void</span> <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>setup</span>() &#123;</div>
                        </div>

                        {/* Línea 4: pinMode */}
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                            <span style={{ width: '24px', textAlign: 'right', color: '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem' }}>4</span>
                            <div style={{ paddingLeft: '1.2rem' }}>
                                <span style={{ color: '#60a5fa' }}>pinMode</span>(<span style={{ color: '#e2e8f0' }}>LED_PIN</span>, <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>OUTPUT</span>);
                            </div>
                        </div>

                        {/* Línea 5: } */}
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                            <span style={{ width: '24px', textAlign: 'right', color: '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem' }}>5</span>
                            <div>&#125;</div>
                        </div>

                        {/* Línea 6 */}
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                            <span style={{ width: '24px', textAlign: 'right', color: '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem' }}>6</span>
                        </div>

                        {/* Línea 7: loop() */}
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                            <span style={{ width: '24px', textAlign: 'right', color: '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem' }}>7</span>
                            <div><span style={{ color: '#f472b6', fontWeight: 'bold' }}>void</span> <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>loop</span>() &#123;</div>
                        </div>

                        {/* Línea 8: encenderAlerta() */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: currentData.line === 8 ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                            borderLeft: `3px solid ${currentData.line === 8 ? '#38bdf8' : 'transparent'}`,
                            transition: 'all 0.2s ease'
                        }}>
                            <span style={{ width: '24px', textAlign: 'right', color: currentData.line === 8 ? '#38bdf8' : '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem', fontWeight: currentData.line === 8 ? 'bold' : 'normal' }}>8</span>
                            <div style={{ paddingLeft: '1.2rem' }}>
                                <span style={{ color: currentData.line === 8 ? '#38bdf8' : '#c084fc', fontWeight: 'bold' }}>encenderAlerta</span>();
                            </div>
                        </div>

                        {/* Línea 9: delay(1000) */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: currentData.line === 9 ? 'rgba(234, 179, 8, 0.18)' : 'transparent',
                            borderLeft: `3px solid ${currentData.line === 9 ? '#eab308' : 'transparent'}`,
                            transition: 'all 0.2s ease'
                        }}>
                            <span style={{ width: '24px', textAlign: 'right', color: currentData.line === 9 ? '#eab308' : '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem', fontWeight: currentData.line === 9 ? 'bold' : 'normal' }}>9</span>
                            <div style={{ paddingLeft: '1.2rem' }}>
                                <span style={{ color: currentData.line === 9 ? '#fde047' : '#60a5fa' }}>delay</span>(<span style={{ color: '#38bdf8' }}>1000</span>);
                            </div>
                        </div>

                        {/* Línea 10: apagarAlerta() */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: currentData.line === 10 ? 'rgba(168, 85, 247, 0.22)' : 'transparent',
                            borderLeft: `3px solid ${currentData.line === 10 ? '#a855f7' : 'transparent'}`,
                            transition: 'all 0.2s ease'
                        }}>
                            <span style={{ width: '24px', textAlign: 'right', color: currentData.line === 10 ? '#a855f7' : '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem', fontWeight: currentData.line === 10 ? 'bold' : 'normal' }}>10</span>
                            <div style={{ paddingLeft: '1.2rem' }}>
                                <span style={{ color: currentData.line === 10 ? '#c084fc' : '#c084fc', fontWeight: 'bold' }}>apagarAlerta</span>();
                            </div>
                        </div>

                        {/* Línea 11: delay(1000) */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: currentData.line === 11 ? 'rgba(234, 179, 8, 0.18)' : 'transparent',
                            borderLeft: `3px solid ${currentData.line === 11 ? '#eab308' : 'transparent'}`,
                            transition: 'all 0.2s ease'
                        }}>
                            <span style={{ width: '24px', textAlign: 'right', color: currentData.line === 11 ? '#eab308' : '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem', fontWeight: currentData.line === 11 ? 'bold' : 'normal' }}>11</span>
                            <div style={{ paddingLeft: '1.2rem' }}>
                                <span style={{ color: currentData.line === 11 ? '#fde047' : '#60a5fa' }}>delay</span>(<span style={{ color: '#38bdf8' }}>1000</span>);
                            </div>
                        </div>

                        {/* Línea 12: } */}
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                            <span style={{ width: '24px', textAlign: 'right', color: '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem' }}>12</span>
                            <div>&#125;</div>
                        </div>

                        {/* Línea 13 */}
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                            <span style={{ width: '24px', textAlign: 'right', color: '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem' }}>13</span>
                        </div>

                        {/* Función encenderAlerta() - Líneas 14-16 */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: currentData.fnLine === 14 ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                            borderLeft: `3px solid ${currentData.fnLine === 14 ? '#38bdf8' : 'transparent'}`,
                            transition: 'all 0.2s ease'
                        }}>
                            <span style={{ width: '24px', textAlign: 'right', color: currentData.fnLine === 14 ? '#38bdf8' : '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem' }}>14</span>
                            <div><span style={{ color: '#f472b6', fontWeight: 'bold' }}>void</span> <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>encenderAlerta</span>() &#123;</div>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: currentData.fnLine === 14 ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                            borderLeft: `3px solid ${currentData.fnLine === 14 ? '#38bdf8' : 'transparent'}`,
                            transition: 'all 0.2s ease'
                        }}>
                            <span style={{ width: '24px', textAlign: 'right', color: currentData.fnLine === 14 ? '#38bdf8' : '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem' }}>15</span>
                            <div style={{ paddingLeft: '1.2rem' }}>
                                <span style={{ color: '#60a5fa' }}>digitalWrite</span>(<span style={{ color: '#e2e8f0' }}>LED_PIN</span>, <span style={{ color: '#ef4444', fontWeight: 'bold' }}>HIGH</span>);
                            </div>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: currentData.fnLine === 14 ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                            borderLeft: `3px solid ${currentData.fnLine === 14 ? '#38bdf8' : 'transparent'}`,
                            transition: 'all 0.2s ease'
                        }}>
                            <span style={{ width: '24px', textAlign: 'right', color: currentData.fnLine === 14 ? '#38bdf8' : '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem' }}>16</span>
                            <div>&#125;</div>
                        </div>

                        {/* Línea 17 */}
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                            <span style={{ width: '24px', textAlign: 'right', color: '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem' }}>17</span>
                        </div>

                        {/* Función apagarAlerta() - Líneas 18-20 */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: currentData.fnLine === 18 ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                            borderLeft: `3px solid ${currentData.fnLine === 18 ? '#a855f7' : 'transparent'}`,
                            transition: 'all 0.2s ease'
                        }}>
                            <span style={{ width: '24px', textAlign: 'right', color: currentData.fnLine === 18 ? '#a855f7' : '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem' }}>18</span>
                            <div><span style={{ color: '#f472b6', fontWeight: 'bold' }}>void</span> <span style={{ color: '#c084fc', fontWeight: 'bold' }}>apagarAlerta</span>() &#123;</div>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: currentData.fnLine === 18 ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                            borderLeft: `3px solid ${currentData.fnLine === 18 ? '#a855f7' : 'transparent'}`,
                            transition: 'all 0.2s ease'
                        }}>
                            <span style={{ width: '24px', textAlign: 'right', color: currentData.fnLine === 18 ? '#a855f7' : '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem' }}>19</span>
                            <div style={{ paddingLeft: '1.2rem' }}>
                                <span style={{ color: '#60a5fa' }}>digitalWrite</span>(<span style={{ color: '#e2e8f0' }}>LED_PIN</span>, <span style={{ color: '#64748b', fontWeight: 'bold' }}>LOW</span>);
                            </div>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: currentData.fnLine === 18 ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                            borderLeft: `3px solid ${currentData.fnLine === 18 ? '#a855f7' : 'transparent'}`,
                            transition: 'all 0.2s ease'
                        }}>
                            <span style={{ width: '24px', textAlign: 'right', color: currentData.fnLine === 18 ? '#a855f7' : '#475569', marginRight: '1rem', userSelect: 'none', fontSize: '0.78rem' }}>20</span>
                            <div>&#125;</div>
                        </div>
                    </div>
                </div>

                {/* LADO DERECHO: Componente Físico Sencillo & Explicación Clara */}
                <div style={{
                    background: '#090d16',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'center',
                    overflowY: 'auto',
                    minHeight: 0
                }}>
                    {/* Estado de Salida */}
                    <div style={{ width: '100%' }}>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: '#94a3b8'
                        }}>
                            RESULTADO EN EL ARDUINO (PIN 13)
                        </span>

                        {/* Visualizador Sencillo del LED */}
                        <div style={{ margin: '1.5rem auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: currentData.led ? '#ef4444' : '#334155',
                                border: `3px solid ${currentData.led ? '#fca5a5' : '#475569'}`,
                                boxShadow: currentData.led ? '0 0 45px rgba(239, 68, 68, 0.85), inset 0 0 15px rgba(255, 255, 255, 0.5)' : 'none',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: currentData.led ? '#ffffff' : '#64748b' }}>
                                    {currentData.led ? 'ON' : 'OFF'}
                                </span>
                            </div>

                            <span style={{
                                background: currentData.led ? 'rgba(239, 68, 68, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                                color: currentData.led ? '#f87171' : '#94a3b8',
                                border: `1px solid ${currentData.led ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.08)'}`,
                                padding: '0.35rem 0.85rem',
                                borderRadius: '999px',
                                fontSize: '0.85rem',
                                fontWeight: 800
                            }}>
                                {currentData.led ? '⚡ 5V — HIGH (Encendido)' : '⚪ 0V — LOW (Apagado)'}
                            </span>
                        </div>
                    </div>

                    {/* Explicación didáctica sencilla */}
                    <div style={{
                        background: 'rgba(168, 85, 247, 0.08)',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                        borderRadius: '14px',
                        padding: '1rem',
                        width: '100%'
                    }}>
                        <h4 style={{ margin: '0 0 0.35rem', color: '#c084fc', fontSize: '0.92rem', fontWeight: 800 }}>
                            {currentData.title}
                        </h4>
                        <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.83rem', lineHeight: '1.5' }}>
                            {currentData.explanation}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    // ── Renderizado con Portal para Modo Modal/Pantalla Completa ──
    const portalOverlay = isExpanded ? createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999999,
            background: 'rgba(5, 8, 22, 0.94)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            boxSizing: 'border-box',
            animation: 'fadeIn 0.25s ease'
        }}>
            {/* Contenedor del Simulador a gran escala */}
            <div style={{
                width: '100%',
                maxWidth: '1240px',
                height: '92vh',
                maxHeight: '840px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxSizing: 'border-box'
            }}>
                {simulatorContent}
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div style={{ margin: '1.5rem auto', maxWidth: '850px', width: '100%' }}>
            {/* Tarjeta interactiva de invitación para abrir el simulador */}
            <div
                onClick={() => setIsExpanded(true)}
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.85) 100%)',
                    borderRadius: '20px',
                    border: '1.5px solid rgba(168, 85, 247, 0.35)',
                    padding: '1.75rem 2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35), 0 0 25px rgba(168, 85, 247, 0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = '#38bdf8';
                    e.currentTarget.style.boxShadow = '0 16px 40px rgba(56, 189, 248, 0.25), 0 0 35px rgba(168, 85, 247, 0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.35)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.35), 0 0 25px rgba(168, 85, 247, 0.15)';
                }}
            >
                {/* Fondo con brillo sutil */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-20%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(56, 189, 248, 0.2) 100%)',
                        border: '1.5px solid rgba(168, 85, 247, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Sparkles size={28} color="#c084fc" />
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                                Laboratorio Interactivo: Demostrador de Funciones
                            </h3>
                        </div>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.5' }}>
                            Abre el simulador paso a paso para ver la ejecución del código C++ en tiempo real y el control del Pin 13 en el Arduino.
                        </p>
                    </div>
                </div>

                {/* Botón de acción */}
                <button
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.75rem 1.4rem',
                        borderRadius: '14px',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(56, 189, 248, 0.4)',
                        flexShrink: 0,
                        pointerEvents: 'none'
                    }}
                >
                    <Maximize2 size={16} /> Abrir Simulador
                </button>
            </div>

            {portalOverlay}
        </div>
    );
}
